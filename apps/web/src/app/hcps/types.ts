export interface Hcp {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  speciality: string;
  createdAt: string;
  updatedAt: string;
}

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface HcpSchedule {
  availableDays: DayOfWeek[];
  slotDuration: number;
}

export interface AssignedClinicLocation {
  id: string;
  name: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string;
  createdBy: string | null;
  managedBy: string;
  assignedAt: string;
  schedule: HcpSchedule | null;
}

export interface HcpDetailsResponse {
  hcp: Hcp;
  clinicLocations: AssignedClinicLocation[];
}
