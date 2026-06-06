import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { DayOfWeek, Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class SlotsService {
  private readonly logger = new Logger(SlotsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Weekly Cron Job: Runs every Monday at 00:00.
   * 1. Promotes 'pendingSlotDuration' to 'slotDuration' if set.
   * 2. Generates/Syncs slots for the entire upcoming week (Mon-Sun).
   */
  @Cron("0 0 * * 1")
  async handleWeeklySlotGeneration() {
    this.logger.log("Starting weekly slot generation...");
    
    // NOTE: Casting to any[] as a workaround for stale Prisma types in monorepo environment.
    // Ensure 'pendingSlotDuration' exists in schema.prisma and types are regenerated.
    const schedules = (await this.prisma.hcpSchedule.findMany()) as any[];

    for (const schedule of schedules) {
      let currentDuration = schedule.slotDuration;

      // Handle deferred duration change: If a pending duration exists, it's time to make it active.
      if (schedule.pendingSlotDuration) {
        currentDuration = schedule.pendingSlotDuration;
        await this.prisma.hcpSchedule.update({
          where: { id: schedule.id },
          data: {
            slotDuration: currentDuration,
            pendingSlotDuration: null,
          },
        });
        this.logger.log(`Promoted pending duration ${currentDuration} for schedule ${schedule.id}`);
      }

      // Generate slots for Mon-Sun of the current week.
      const today = new Date();
      
      // Calculate the Date for Monday of the current week.
      // RATIONALE: We anchor to Monday to ensure a consistent Mon-Sun synchronization bucket.
      // This prevents skipping days if the cron job is delayed or manually triggered mid-week.
      const day = today.getDay(); // 0 is Sunday, 1 is Monday...
      // If today is Sunday (0), we go back 6 days. Otherwise, we go back (day - 1) days.
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(new Date(today).setDate(diff));

      // Iterate through all 7 days of the week (Monday to Sunday).
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        const dayOfWeek = this.getDayOfWeekEnum(date);

        // Only sync slots if the day is marked as available in the HCP's schedule.
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

  /**
   * Mid-week sync: Updates slots from 'today' until the end of the current week (Sunday).
   * Called when HCP updates available days.
   */
  async syncSlotsForRemainderOfWeek(schedule: any) {
    const today = new Date();
    
    // Iterate from today for up to 7 days, but stop if we hit next Monday.
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      // Stop at next Monday: This function only handles the 'remainder' of the current week bucket.
      // Next Monday's slots will be handled by the weekly cron job.
      if (i > 0 && date.getDay() === 1) break;

      const dayOfWeek = this.getDayOfWeekEnum(date);
      if (schedule.availableDays.includes(dayOfWeek)) {
        // Day added: Create/Sync slots for this day.
        await this.syncSlotsForSchedule(schedule, date);
      } else {
        // Day removed: Clean up unappointed slots.
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
