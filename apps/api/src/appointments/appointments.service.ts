import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AppointmentStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { AuthenticatedUser } from "../users/jwt-auth.guard";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createAppointment(
    createAppointmentDto: CreateAppointmentDto,
    user: AuthenticatedUser,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const slot = await tx.slot.findUnique({
        where: { id: createAppointmentDto.slotId },
        include: {
          hcpSchedule: {
            include: {
              hcpClinicLocation: {
                include: { clinicLocation: true },
              },
            },
          },
          appointments: {
            where: {
              status: { in: [AppointmentStatus.PENDING, AppointmentStatus.ACCEPTED] },
            },
          },
        },
      });

      if (!slot) {
        throw new NotFoundException("Slot was not found.");
      }

      // 1. Restriction: CLINIC_ADMIN only for their clinic
      if (
        user.roleName === "CLINIC_ADMIN" &&
        slot.hcpSchedule.hcpClinicLocation.clinicLocation.createdBy !== user.sub
      ) {
        throw new ForbiddenException(
          "You can only create appointments for your own clinic locations.",
        );
      }

      // 2. Conflict: Slot already has an active appointment
      if (slot.appointments.length > 0) {
        throw new ConflictException("This slot already has an active appointment.");
      }

      // 3. Validation: Verify patient exists
      const patient = await tx.patient.findUnique({
        where: { id: createAppointmentDto.patientId },
      });

      if (!patient) {
        throw new NotFoundException("Patient was not found.");
      }

      // 4. Create appointment
      try {
        const appointment = await tx.appointment.create({
          data: {
            slotId: createAppointmentDto.slotId,
            patientId: createAppointmentDto.patientId,
            status: AppointmentStatus.PENDING,
          },
          include: {
            slot: true,
            patient: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        });

        return appointment;
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new ConflictException("This slot already has an active appointment.");
        }
        throw error;
      }
    });
  }

  async getAppointment(id: string, user: AuthenticatedUser) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        slot: {
          include: {
            hcpSchedule: {
              include: {
                hcpClinicLocation: {
                  include: {
                    clinicLocation: true,
                    hcp: {
                      include: {
                        user: {
                          select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        patient: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException("Appointment was not found.");
    }

    // Restriction: Role-based ownership checks
    if (user.roleName === "CLINIC_ADMIN") {
      if (
        appointment.slot.hcpSchedule.hcpClinicLocation.clinicLocation.createdBy !==
        user.sub
      ) {
        throw new ForbiddenException(
          "You can only view appointments for your own clinic locations.",
        );
      }
    } else if (user.roleName === "PATIENT") {
      if (appointment.patient.userId !== user.sub) {
        throw new ForbiddenException("You can only view your own appointments.");
      }
    } else if (user.roleName === "HCP") {
      if (appointment.slot.hcpSchedule.hcpClinicLocation.hcp.userId !== user.sub) {
        throw new ForbiddenException(
          "You can only view appointments for your own slots.",
        );
      }
    }

    return appointment;
  }

  async getAppointments(user: AuthenticatedUser) {
    const where: Prisma.AppointmentWhereInput = {};

    // Restriction: CLINIC_ADMIN only for their clinic
    if (user.roleName === "CLINIC_ADMIN") {
      where.slot = {
        hcpSchedule: {
          hcpClinicLocation: {
            clinicLocation: {
              createdBy: user.sub,
            },
          },
        },
      };
    } else if (user.roleName === "PATIENT") {
      // Typically patients only see their own.
      const patient = await this.prisma.patient.findUnique({
        where: { userId: user.sub },
      });
      if (!patient) {
        throw new NotFoundException("Patient profile was not found.");
      }
      where.patientId = patient.id;
    } else if (user.roleName === "HCP") {
      // Typically HCPs only see their own slots.
      const hcp = await this.prisma.hcp.findUnique({
        where: { userId: user.sub },
      });
      if (!hcp) {
        throw new NotFoundException("HCP profile was not found.");
      }
      where.slot = {
        hcpSchedule: {
          hcpClinicLocation: {
            hcpId: hcp.id,
          },
        },
      };
    }

    return this.prisma.appointment.findMany({
      where,
      include: {
        slot: {
          include: {
            hcpSchedule: {
              include: {
                hcpClinicLocation: {
                  include: {
                    clinicLocation: true,
                    hcp: {
                      include: {
                        user: {
                          select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        patient: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
