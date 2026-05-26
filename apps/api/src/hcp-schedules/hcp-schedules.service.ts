import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { AuthenticatedUser } from "../users/jwt-auth.guard";
import { CreateHcpScheduleDto } from "./dto/create-hcp-schedule.dto";
import { SlotsService } from "../slots/slots.service";

@Injectable()
export class HcpSchedulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly slotsService: SlotsService,
  ) {}

  async createHcpSchedule(
    createHcpScheduleDto: CreateHcpScheduleDto,
    user: AuthenticatedUser,
  ) {
    const hcpClinicLocation = await this.prisma.hcpClinicLocation.findUnique({
      where: {
        hcpId_clinicLocationId: {
          hcpId: createHcpScheduleDto.hcpId,
          clinicLocationId: createHcpScheduleDto.clinicLocationId,
        },
      },
      include: {
        clinicLocation: true,
      },
    });

    if (!hcpClinicLocation) {
      throw new NotFoundException("HCP clinic location mapping was not found.");
    }

    // Restriction: CLINIC_ADMIN only for their clinic
    if (
      user.roleName === "CLINIC_ADMIN" &&
      hcpClinicLocation.clinicLocation.managedBy !== user.sub
    ) {
      throw new ForbiddenException(
        "You can only create schedules for your own clinic locations.",
      );
    }

    try {
      const schedule = await this.prisma.hcpSchedule.create({
        data: {
          hcpClinicLocationId: hcpClinicLocation.id,
          availableDays: createHcpScheduleDto.availableDays,
          slotDuration: createHcpScheduleDto.slotDuration,
          createdBy: user.sub,
        },
      });

      // Trigger slot generation if today is in the available days
      const today = new Date();
      if (schedule.availableDays.includes(this.slotsService.getDayOfWeekEnum(today))) {
        this.slotsService.syncSlotsForSchedule(schedule, today).catch((err) => {
          console.error(`Failed to sync slots for schedule ${schedule.id}:`, err);
        });
      }

      return {
        id: schedule.id,
        hcpClinicLocationId: schedule.hcpClinicLocationId,
        availableDays: schedule.availableDays,
        slotDuration: schedule.slotDuration,
        createdBy: schedule.createdBy,
        createdAt: schedule.createdAt.toISOString(),
        updatedAt: schedule.updatedAt.toISOString(),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          "A schedule already exists for this HCP clinic location.",
        );
      }

      throw error;
    }
  }

  async getSchedulesByHcpId(hcpId: string) {
    if (!hcpId || hcpId.trim() === "") {
      throw new BadRequestException("hcpId is required.");
    }

    const schedules = await this.prisma.hcpSchedule.findMany({
      where: {
        hcpClinicLocation: {
          hcpId,
        },
      },
      include: {
        hcpClinicLocation: {
          include: {
            clinicLocation: true,
          },
        },
      },
    });

    return schedules.map((schedule) => ({
      id: schedule.id,
      hcpClinicLocationId: schedule.hcpClinicLocationId,
      clinicLocation: {
        id: schedule.hcpClinicLocation.clinicLocation.id,
        addressLine1: schedule.hcpClinicLocation.clinicLocation.addressLine1,
        addressLine2: schedule.hcpClinicLocation.clinicLocation.addressLine2,
        suburb: schedule.hcpClinicLocation.clinicLocation.suburb,
        state: schedule.hcpClinicLocation.clinicLocation.state,
        postcode: schedule.hcpClinicLocation.clinicLocation.postcode,
      },
      availableDays: schedule.availableDays,
      slotDuration: schedule.slotDuration,
      createdBy: schedule.createdBy,
      createdAt: schedule.createdAt.toISOString(),
      updatedAt: schedule.updatedAt.toISOString(),
    }));
  }

  async getSchedulesByClinicLocationId(
    clinicLocationId: string,
    user: AuthenticatedUser,
  ) {
    if (!clinicLocationId || clinicLocationId.trim() === "") {
      throw new BadRequestException("clinicLocationId is required.");
    }

    const clinicLocation = await this.prisma.clinicLocation.findUnique({
      where: { id: clinicLocationId },
    });

    if (!clinicLocation) {
      throw new NotFoundException("Clinic location was not found.");
    }

    // Restriction: CLINIC_ADMIN only for their clinic
    if (
      user.roleName === "CLINIC_ADMIN" &&
      clinicLocation.managedBy !== user.sub
    ) {
      throw new ForbiddenException(
        "You can only view schedules for your own clinic locations.",
      );
    }

    const schedules = await this.prisma.hcpSchedule.findMany({
      where: {
        hcpClinicLocation: {
          clinicLocationId,
        },
      },
      include: {
        hcpClinicLocation: {
          include: {
            hcp: {
              include: {
                user: true,
                speciality: true,
              },
            },
          },
        },
      },
    });

    return schedules.map((schedule) => ({
      id: schedule.id,
      hcpClinicLocationId: schedule.hcpClinicLocationId,
      hcp: {
        id: schedule.hcpClinicLocation.hcp.id,
        firstName: schedule.hcpClinicLocation.hcp.user.firstName,
        lastName: schedule.hcpClinicLocation.hcp.user.lastName,
        speciality: schedule.hcpClinicLocation.hcp.speciality.name,
      },
      availableDays: schedule.availableDays,
      slotDuration: schedule.slotDuration,
      createdBy: schedule.createdBy,
      createdAt: schedule.createdAt.toISOString(),
      updatedAt: schedule.updatedAt.toISOString(),
    }));
  }
}
