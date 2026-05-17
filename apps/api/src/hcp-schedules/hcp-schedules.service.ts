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

  async createHcpSchedule(createHcpScheduleDto: CreateHcpScheduleDto) {
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
        },
      });

      return {
        id: schedule.id,
        hcpClinicLocationId: schedule.hcpClinicLocationId,
        availableDays: schedule.availableDays,
        slotDuration: schedule.slotDuration,
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
}
