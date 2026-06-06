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
import { CreateHcpClinicLocationDto } from "./dto/create-hcp-clinic-location.dto";

@Injectable()
export class HcpClinicLocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createHcpClinicLocation(
    createHcpClinicLocationDto: CreateHcpClinicLocationDto,
    currentUser?: AuthenticatedUser,
  ) {
    const [hcp, clinicLocation] = await Promise.all([
      this.prisma.hcp.findUnique({
        where: { id: createHcpClinicLocationDto.hcpId },
      }),
      this.prisma.clinicLocation.findUnique({
        where: { id: createHcpClinicLocationDto.clinicLocationId },
      }),
    ]);

    if (!hcp) {
      throw new NotFoundException("HCP profile was not found.");
    }

    if (!clinicLocation) {
      throw new NotFoundException("Clinic location was not found.");
    }

    // Restriction: CLINIC_ADMIN only for their clinic
    if (
      currentUser &&
      currentUser.roleName === "CLINIC_ADMIN" &&
      clinicLocation.managedBy !== currentUser.sub
    ) {
      throw new ForbiddenException(
        "You can only assign HCPs to your own clinic locations.",
      );
    }

    try {
      const mapping = await this.prisma.hcpClinicLocation.create({
        data: {
          hcpId: hcp.id,
          clinicLocationId: createHcpClinicLocationDto.clinicLocationId,
        },
      });

      return {
        id: mapping.id,
        hcpId: mapping.hcpId,
        userId: hcp.userId,
        clinicLocationId: mapping.clinicLocationId,
        createdAt: mapping.createdAt.toISOString(),
        updatedAt: mapping.updatedAt.toISOString(),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          "This HCP is already assigned to this clinic location.",
        );
      }

      throw error;
    }
  }

  async getClinicLocationsAssignedToHcp(hcpId: string) {
    const normalizedHcpId = hcpId.trim();

    if (normalizedHcpId.length === 0) {
      throw new BadRequestException("hcpId is required.");
    }

    const hcp = await this.prisma.hcp.findUnique({
      where: { id: normalizedHcpId },
      include: {
        user: true,
        speciality: true,
        clinicLocations: {
          include: {
            clinicLocation: true,
            schedule: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!hcp) {
      throw new NotFoundException("HCP profile was not found.");
    }

    return {
      hcp: {
        id: hcp.id,
        userId: hcp.userId,
        firstName: hcp.user.firstName,
        lastName: hcp.user.lastName,
        email: hcp.user.email,
        speciality: hcp.speciality.name,
        createdAt: hcp.createdAt.toISOString(),
        updatedAt: hcp.updatedAt.toISOString(),
      },
      clinicLocations: hcp.clinicLocations.map((mapping) => ({
        id: mapping.clinicLocation.id,
        name: mapping.clinicLocation.name,
        addressLine1: mapping.clinicLocation.addressLine1,
        addressLine2: mapping.clinicLocation.addressLine2,
        suburb: mapping.clinicLocation.suburb,
        state: mapping.clinicLocation.state,
        postcode: mapping.clinicLocation.postcode,
        createdBy: mapping.clinicLocation.createdBy,
        managedBy: mapping.clinicLocation.managedBy,
        assignedAt: mapping.createdAt.toISOString(),
        schedule: mapping.schedule
          ? {
              availableDays: mapping.schedule.availableDays,
              slotDuration: mapping.schedule.slotDuration,
            }
          : null,
      })),
    };
  }

  async getHcpsAssignedToClinicLocation(clinicLocationId: string) {
    const normalizedClinicLocationId = clinicLocationId.trim();

    if (normalizedClinicLocationId.length === 0) {
      throw new BadRequestException("clinicLocationId is required.");
    }

    const clinicLocation = await this.prisma.clinicLocation.findUnique({
      where: { id: normalizedClinicLocationId },
      include: {
        hcpLinks: {
          include: {
            hcp: {
              include: {
                user: true,
              },
            },
            schedule: {
              select: {
                availableDays: true,
                slotDuration: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!clinicLocation) {
      throw new NotFoundException("Clinic location was not found.");
    }

    return {
      clinicLocation: {
        id: clinicLocation.id,
        addressLine1: clinicLocation.addressLine1,
        addressLine2: clinicLocation.addressLine2,
        suburb: clinicLocation.suburb,
        state: clinicLocation.state,
        postcode: clinicLocation.postcode,
        createdBy: clinicLocation.createdBy,
        managedBy: clinicLocation.managedBy,
      },
      hcps: clinicLocation.hcpLinks.map((mapping) => ({
        id: mapping.hcp.id,
        userId: mapping.hcp.userId,
        firstName: mapping.hcp.user.firstName,
        lastName: mapping.hcp.user.lastName,
        email: mapping.hcp.user.email,
        specialityId: mapping.hcp.specialityId,
        assignedAt: mapping.createdAt.toISOString(),
        schedule: mapping.schedule
          ? {
              availableDays: mapping.schedule.availableDays,
              slotDuration: mapping.schedule.slotDuration,
            }
          : null,
      })),
    };
  }
}
