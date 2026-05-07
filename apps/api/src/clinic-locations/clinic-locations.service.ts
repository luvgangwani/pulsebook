import { Injectable } from "@nestjs/common";
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
      createdAt: clinicLocation.createdAt.toISOString(),
      updatedAt: clinicLocation.updatedAt.toISOString(),
    }));
  }

  async createClinicLocation(
    currentUser: AuthenticatedUser,
    createClinicLocationDto: CreateClinicLocationDto,
  ) {
    const clinicLocation = await this.prisma.clinicLocation.create({
      data: {
        addressLine1: createClinicLocationDto.addressLine1,
        addressLine2: createClinicLocationDto.addressLine2,
        suburb: createClinicLocationDto.suburb,
        state: createClinicLocationDto.state,
        postcode: createClinicLocationDto.postcode,
        createdBy: currentUser.sub,
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
      createdAt: clinicLocation.createdAt.toISOString(),
      updatedAt: clinicLocation.updatedAt.toISOString(),
    };
  }
}
