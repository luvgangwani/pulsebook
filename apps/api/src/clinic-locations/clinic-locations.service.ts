import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { AuthenticatedUser } from "../users/jwt-auth.guard";
import { CreateClinicLocationDto } from "./dto/create-clinic-location.dto";

@Injectable()
export class ClinicLocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getClinicLocations() {
    const clinicLocations = await this.prisma.clinicLocation.findMany({
      include: {
        createdByUser: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        managedByUser: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return clinicLocations.map((clinicLocation) => ({
      id: clinicLocation.id,
      name: clinicLocation.name,
      addressLine1: clinicLocation.addressLine1,
      addressLine2: clinicLocation.addressLine2,
      suburb: clinicLocation.suburb,
      state: clinicLocation.state,
      postcode: clinicLocation.postcode,
      createdBy: clinicLocation.createdBy,
      createdByName: clinicLocation.createdByUser
        ? `${clinicLocation.createdByUser.firstName} ${clinicLocation.createdByUser.lastName ?? ""}`.trim()
        : null,
      managedBy: clinicLocation.managedBy,
      managedByName: `${clinicLocation.managedByUser.firstName} ${clinicLocation.managedByUser.lastName ?? ""}`.trim(),
      createdAt: clinicLocation.createdAt.toISOString(),
      updatedAt: clinicLocation.updatedAt.toISOString(),
    }));
  }

  async getClinicLocationById(id: string) {
    const clinicLocation = await this.prisma.clinicLocation.findUnique({
      where: { id },
      include: {
        createdByUser: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        managedByUser: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!clinicLocation) {
      throw new NotFoundException(`Clinic location with ID ${id} not found`);
    }

    return {
      id: clinicLocation.id,
      name: clinicLocation.name,
      addressLine1: clinicLocation.addressLine1,
      addressLine2: clinicLocation.addressLine2,
      suburb: clinicLocation.suburb,
      state: clinicLocation.state,
      postcode: clinicLocation.postcode,
      createdBy: clinicLocation.createdBy,
      createdByName: clinicLocation.createdByUser
        ? `${clinicLocation.createdByUser.firstName} ${clinicLocation.createdByUser.lastName ?? ""}`.trim()
        : null,
      managedBy: clinicLocation.managedBy,
      managedByName: `${clinicLocation.managedByUser.firstName} ${clinicLocation.managedByUser.lastName ?? ""}`.trim(),
      createdAt: clinicLocation.createdAt.toISOString(),
      updatedAt: clinicLocation.updatedAt.toISOString(),
    };
  }

  async createClinicLocation(
    currentUser: AuthenticatedUser,
    createClinicLocationDto: CreateClinicLocationDto,
  ) {
    const manager = await this.prisma.user.findUnique({
      where: { id: createClinicLocationDto.managedById },
      include: { role: true },
    });

    if (!manager) {
      throw new NotFoundException("Manager user was not found.");
    }

    if (manager.role.name !== "CLINIC_ADMIN") {
      throw new BadRequestException("Assigned manager must have CLINIC_ADMIN role.");
    }

    const clinicLocation = await this.prisma.clinicLocation.create({
      data: {
        name: createClinicLocationDto.name,
        addressLine1: createClinicLocationDto.addressLine1,
        addressLine2: createClinicLocationDto.addressLine2,
        suburb: createClinicLocationDto.suburb,
        state: createClinicLocationDto.state,
        postcode: createClinicLocationDto.postcode,
        // Use currentUser.sub if available, otherwise fallback to a environment variable for testing
        createdBy: currentUser?.sub ?? process.env.TEST_ADMIN_USER_ID,
        managedBy: createClinicLocationDto.managedById,
      },
    });

    return {
      id: clinicLocation.id,
      name: clinicLocation.name,
      addressLine1: clinicLocation.addressLine1,
      addressLine2: clinicLocation.addressLine2,
      suburb: clinicLocation.suburb,
      state: clinicLocation.state,
      postcode: clinicLocation.postcode,
      createdBy: clinicLocation.createdBy,
      managedBy: clinicLocation.managedBy,
      createdAt: clinicLocation.createdAt.toISOString(),
      updatedAt: clinicLocation.updatedAt.toISOString(),
    };
  }
}
