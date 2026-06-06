import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { DayOfWeek, Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class SlotsService {
  private readonly logger = new Logger(SlotsService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron("0 0 * * 1")
  async handleWeeklySlotGeneration() {
    this.logger.log("Starting weekly slot generation...");
    const schedules = await this.prisma.hcpSchedule.findMany();

    for (const schedule of schedules) {
      let currentDuration = schedule.slotDuration;

      // Handle deferred duration change
      if (schedule.pendingSlotDuration) {
        currentDuration = schedule.pendingSlotDuration;
        await this.prisma.hcpSchedule.update({
          where: { id: schedule.id },
          data: {
            slotDuration: currentDuration,
            pendingSlotDuration: null,
          },
        });
      }

      // Generate slots for Mon-Sun of the current week
      const today = new Date();
      // Calculate Monday of the current week
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(new Date(today).setDate(diff));

      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        const dayOfWeek = this.getDayOfWeekEnum(date);

        if (schedule.availableDays.includes(dayOfWeek)) {
          await this.syncSlotsForSchedule(
            { ...schedule, slotDuration: currentDuration },
            date,
          );
        }
      }
    }
    this.logger.log("Weekly slot generation completed.");
  }

  async syncSlotsForRemainderOfWeek(schedule: any) {
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      if (i > 0 && date.getDay() === 1) break;

      const dayOfWeek = this.getDayOfWeekEnum(date);
      if (schedule.availableDays.includes(dayOfWeek)) {
        await this.syncSlotsForSchedule(schedule, date);
      } else {
        await this.deleteUnappointedSlotsForDate(schedule.id, date);
      }
    }
  }

  async deleteUnappointedSlotsForDate(scheduleId: string, date: Date) {
    const slotDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
    );

    await this.prisma.slot.deleteMany({
      where: {
        hcpScheduleId: scheduleId,
        slotDate: slotDate,
        appointments: {
          none: {},
        },
      },
    });
  }

  async syncSlotsForSchedule(schedule: any, date: Date) {
    const slotDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
    );

    // 1. Delete slots for this schedule and day that have NO appointments
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
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          continue;
        }
        throw error;
      }
    }
  }

  private calculateExpectedSlots(durationMinutes: number): string[] {
    const slots: string[] = [];
    this.addSlotsInRange(slots, 8, 0, 12, 30, durationMinutes);
    this.addSlotsInRange(slots, 14, 30, 18, 0, durationMinutes);
    return slots;
  }

  private addSlotsInRange(
    slots: string[],
    startH: number,
    startM: number,
    endH: number,
    endM: number,
    duration: number,
  ) {
    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + duration <= end) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      slots.push(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`,
      );
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
