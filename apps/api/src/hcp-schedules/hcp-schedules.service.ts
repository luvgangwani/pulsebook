import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { CreateHcpScheduleDto } from "./dto/create-hcp-schedule.dto";

@Injectable()
export class HcpSchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async createHcpSchedule(
    createHcpScheduleDto: CreateHcpScheduleDto,
    userId: string,
  ) {
    const hcpClinicLocation = await this.prisma.hcpClinicLocation.findUnique({
      where: {
        hcpId_clinicLocationId: {
          hcpId: createHcpScheduleDto.hcpId,
          clinicLocationId: createHcpScheduleDto.clinicLocationId,
        },
      },
    });

    if (!hcpClinicLocation) {
      throw new NotFoundException("HCP clinic location mapping was not found.");
    }

    try {
      const schedule = await this.prisma.hcpSchedule.create({
        data: {
          hcpClinicLocationId: hcpClinicLocation.id,
          availableDays: createHcpScheduleDto.availableDays,
          slotDuration: createHcpScheduleDto.slotDuration,
          createdBy: userId,
        },
      });

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

  async getSchedulesByClinicLocationId(clinicLocationId: string) {
    if (!clinicLocationId || clinicLocationId.trim() === "") {
      throw new BadRequestException("clinicLocationId is required.");
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
