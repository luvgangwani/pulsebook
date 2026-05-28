import { Injectable, Logger } from "@nestjs/common";
import { DayOfWeek, Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class SlotsService {
  private readonly logger = new Logger(SlotsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generateSlotsForToday(hcpId: string) {
    const today = new Date();
    const dayOfWeek = this.getDayOfWeekEnum(today);

    // Fetch schedules for this HCP that include today
    const schedules = await this.prisma.hcpSchedule.findMany({
      where: {
        hcpClinicLocation: {
          hcpId,
        },
        availableDays: {
          has: dayOfWeek,
        },
      },
    });

    for (const schedule of schedules) {
      await this.syncSlotsForSchedule(schedule, today);
    }
  }

  async syncSlotsForSchedule(schedule: any, date: Date) {
    // Construct UTC midnight date for the intended local day to avoid timezone shifts
    const slotDate = new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0, 0, 0, 0
    ));

    // 1. Delete slots for this schedule and day that have NO appointments
    // Slots with historical (REJECTED) appointments cannot be deleted due to FK constraints.
    // They will be skipped during the creation phase.
    await this.prisma.slot.deleteMany({
      where: {
        hcpScheduleId: schedule.id,
        slotDate: slotDate,
        appointments: {
          none: {},
        },
      },
    });

    // 2. Generate new slots based on schedule
    const expectedSlots = this.calculateExpectedSlots(schedule.slotDuration);
    
    // 3. Insert slots that don't exist
    for (const timeStr of expectedSlots) {
      const [hours, minutes] = timeStr.split(":").map(Number);
      // Construct UTC time for the intended local time to avoid timezone shifts
      const slotTime = new Date(Date.UTC(1970, 0, 1, hours, minutes, 0));

      try {
        await this.prisma.slot.create({
          data: {
            hcpScheduleId: schedule.id,
            slotDate: slotDate,
            slotTime: slotTime,
          },
        });
      } catch (error) {
        // Handle P2002 (Unique constraint) if slot already exists (e.g. has an appointment)
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          continue;
        }
        throw error;
      }
    }
  }

  private calculateExpectedSlots(durationMinutes: number): string[] {
    const slots: string[] = [];
    
    // Range 1: 08:00 to 12:30
    this.addSlotsInRange(slots, 8, 0, 12, 30, durationMinutes);
    
    // Range 2: 14:30 to 18:00
    this.addSlotsInRange(slots, 14, 30, 18, 0, durationMinutes);
    
    return slots;
  }

  private addSlotsInRange(
    slots: string[],
    startH: number,
    startM: number,
    endH: number,
    endM: number,
    duration: number
  ) {
    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + duration <= end) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
      current += duration;
    }
  }

  public getDayOfWeekEnum(date: Date): DayOfWeek {
    const days = [
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ];
    return days[date.getDay()];
  }
}
