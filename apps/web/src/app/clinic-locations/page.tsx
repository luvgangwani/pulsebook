"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, User, Calendar, Plus } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

/**
 * Zod is used to define a strict validation schema for our form.
 * This ensures data integrity before it even reaches the API.
 * We can define required fields, minimum lengths, and custom error messages.
 */
const clinicSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  addressLine1: z.string().min(5, "Address Line 1 is required"),
  addressLine2: z.string().optional(),
  suburb: z.string().min(2, "Suburb is required"),
  state: z.string().min(2, "State is required"),
  postcode: z.string().min(4, "Postcode must be at least 4 digits"),
  managedById: z.string().min(1, "Please select a manager"),
});

type ClinicFormValues = z.infer<typeof clinicSchema>;

interface ClinicAdmin {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
}

interface ClinicLocation {
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
  createdAt: string;
  updatedAt: string;
}

export default function ClinicLocationsPage() {
  const [locations, setLocations] = useState<ClinicLocation[]>([]);
  const [admins, setAdmins] = useState<ClinicAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * react-hook-form's useForm hook is the core of our form management.
   * - 'resolver': We use zodResolver to bridge react-hook-form with our Zod schema.
   *   The zodResolver validates the form data against the Zod schema before submission.
   * - 'defaultValues': Sets the initial state of the form fields.
   * - 'formState': Provides reactive access to form errors, which we display in the UI.
   */
  const form = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      name: "",
      addressLine1: "",
      addressLine2: "",
      suburb: "",
      state: "",
      postcode: "",
      managedById: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locationsRes, adminsRes] = await Promise.all([
          api.get<ClinicLocation[]>("/clinic-locations"),
          api.get<ClinicAdmin[]>("/users/clinic-admins"),
        ]);
        setLocations(locationsRes.data);
        setAdmins(adminsRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * The onSubmit function is called after react-hook-form successfully validates the form.
   * It receives the validated 'data' object which matches our ClinicFormValues type.
   */
  const onSubmit = async (data: ClinicFormValues) => {
    setIsSubmitting(true);
    try {
      await api.post("/clinic-locations", data);
      // Refresh locations list to show the new entry
      const response = await api.get<ClinicLocation[]>("/clinic-locations");
      setLocations(response.data);
      setIsDialogOpen(false);
      form.reset();
    } catch (err) {
      console.error("Failed to create clinic:", err);
      alert("Failed to create clinic location. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAddress = (loc: ClinicLocation) => {
    const parts = [
      loc.addressLine1,
      loc.addressLine2,
      loc.suburb,
      loc.state,
      loc.postcode,
    ].filter(Boolean);
    return parts.join(", ");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clinic Locations</h1>
            <p className="text-muted-foreground mt-2">
              View all available clinic locations.
            </p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between pt-4 border-t">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <MapPin className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Error Loading Locations</h2>
        <p className="text-muted-foreground max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clinic Locations</h1>
          <p className="text-muted-foreground mt-2">
            View all available clinic locations.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Clinic
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Clinic Location</DialogTitle>
              <DialogDescription>
                Add a new clinic to the system. All fields except Address Line 2
                are required.
              </DialogDescription>
            </DialogHeader>

            {/* 
              We use a standard <form> tag and wrap it with form.handleSubmit(onSubmit).
              This leverages react-hook-form's validation logic before calling our onSubmit.
            */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Clinic Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Central City Medical"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="addressLine1">Address Line 1</Label>
                  <Input
                    id="addressLine1"
                    placeholder="Street address"
                    {...form.register("addressLine1")}
                  />
                  {form.formState.errors.addressLine1 && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.addressLine1.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                  <Input
                    id="addressLine2"
                    placeholder="Apt, Suite, etc."
                    {...form.register("addressLine2")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="suburb">Suburb</Label>
                  <Input
                    id="suburb"
                    placeholder="Suburb"
                    {...form.register("suburb")}
                  />
                  {form.formState.errors.suburb && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.suburb.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    {...form.register("state")}
                  />
                  {form.formState.errors.state && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.state.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input
                    id="postcode"
                    placeholder="Postcode"
                    {...form.register("postcode")}
                  />
                  {form.formState.errors.postcode && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.postcode.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="managedById">Managed By</Label>
                {/* 
                  For controlled components like shadcn/ui Select, we use react-hook-form's 
                  Controller component to manually bridge the state.
                */}
                <Controller
                  name="managedById"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a clinic admin" />
                      </SelectTrigger>
                      <SelectContent>
                        {admins.map((admin) => (
                          <SelectItem key={admin.id} value={admin.id}>
                            {admin.firstName} {admin.lastName} ({admin.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.managedById && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.managedById.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Clinic"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {locations.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center border-2 border-dashed rounded-lg p-12">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium">No clinic locations found</h3>
          <p className="text-muted-foreground mt-2">
            There are no clinic locations registered in the system yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => (
            <Card key={loc.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="text-xl font-bold leading-tight">
                    {loc.name || "Unnamed Clinic"}
                  </CardTitle>
                  <Badge variant="secondary" className="shrink-0">
                    Clinic
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground leading-relaxed">
                      {formatAddress(loc)}
                    </span>
                  </div>

                  <div className="pt-4 border-t flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>Created by: {loc.createdByName || "System"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Created at: {format(new Date(loc.createdAt), "PPP")}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
