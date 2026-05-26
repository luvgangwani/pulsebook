import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { AuthenticatedUser } from "../users/jwt-auth.guard";
import { CreateClinicLocationDto } from "./dto/create-clinic-location.dto";

@Injectable()
export class ClinicLocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getClinicLocations() {
    const clinicLocations = await this.prisma.clinicLocation.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return clinicLocations.map((clinicLocation) => ({
      id: clinicLocation.id,
      addressLine1: clinicLocation.addressLine1,
      addressLine2: clinicLocation.addressLine2,
      suburb: clinicLocation.suburb,
      state: clinicLocation.state,
      postcode: clinicLocation.postcode,
      createdBy: clinicLocation.createdBy,
      managedBy: clinicLocation.managedBy,
      createdAt: clinicLocation.createdAt.toISOString(),
      updatedAt: clinicLocation.updatedAt.toISOString(),
    }));
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
        addressLine1: createClinicLocationDto.addressLine1,
        addressLine2: createClinicLocationDto.addressLine2,
        suburb: createClinicLocationDto.suburb,
        state: createClinicLocationDto.state,
        postcode: createClinicLocationDto.postcode,
        createdBy: currentUser.sub,
        managedBy: createClinicLocationDto.managedById,
      },
    });

    return {
      id: clinicLocation.id,
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
