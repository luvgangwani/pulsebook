"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
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
import { ClinicAdmin, ClinicFormValues, clinicSchema } from "../types";

interface CreateClinicDialogProps {
  admins: ClinicAdmin[];
}

export function CreateClinicDialog({ admins }: CreateClinicDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  /**
   * react-hook-form management
   * - 'resolver': We use zodResolver to bridge react-hook-form with our Zod schema.
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

  /**
   * TanStack Query - Creating a Clinic Location
   */
  const createMutation = useMutation({
    mutationFn: async (data: ClinicFormValues) => {
      return api.post("/clinic-locations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-locations"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (err) => {
      console.error("Failed to create clinic:", err);
      alert("Failed to create clinic location. Please try again.");
    },
  });

  const onSubmit = (data: ClinicFormValues) => {
    createMutation.mutate(data);
  };

  return (
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
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Clinic"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
