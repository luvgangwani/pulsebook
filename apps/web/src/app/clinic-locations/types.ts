import * as z from "zod";

/**
 * Zod is used to define a strict validation schema for our form.
 * This ensures data integrity before it even reaches the API.
 * We can define required fields, minimum lengths, and custom error messages.
 */
export const clinicSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  addressLine1: z.string().min(5, "Address Line 1 is required"),
  addressLine2: z.string().optional(),
  suburb: z.string().min(2, "Suburb is required"),
  state: z.string().min(2, "State is required"),
  postcode: z.string().min(4, "Postcode must be at least 4 digits"),
  managedById: z.string().min(1, "Please select a manager"),
});

export type ClinicFormValues = z.infer<typeof clinicSchema>;

export interface ClinicAdmin {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
}

export interface ClinicLocation {
  id: string;
  name: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string;
  createdBy: string | null;
  createdByName: string | null;
  managedBy: string;
  managedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignedHcp {
  id: string;
  userId: string;
  firstName: string;
  lastName: string | null;
  email: string;
  specialityId: number;
  assignedAt: string;
}
