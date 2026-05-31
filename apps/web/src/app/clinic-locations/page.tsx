"use client";

import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";
import { ClinicLocation, ClinicAdmin } from "./types";
import { ClinicLocationCard } from "./components/ClinicLocationCard";
import { CreateClinicDialog } from "./components/CreateClinicDialog";

export default function ClinicLocationsPage() {
  /**
   * TanStack Query - Fetching Clinic Locations
   */
  const {
    data: locations = [],
    isPending: loadingLocations,
    error: locationsError,
  } = useQuery({
    queryKey: ["clinic-locations"],
    queryFn: async () => {
      const response = await api.get<ClinicLocation[]>("/clinic-locations");
      return response.data;
    },
  });

  /**
   * TanStack Query - Fetching Clinic Admins
   */
  const { data: admins = [] } = useQuery({
    queryKey: ["clinic-admins"],
    queryFn: async () => {
      const response = await api.get<ClinicAdmin[]>("/users/clinic-admins");
      return response.data;
    },
  });

  if (loadingLocations) {
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

  if (locationsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <MapPin className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Error Loading Locations</h2>
        <p className="text-muted-foreground max-w-md">
          {locationsError instanceof Error ? locationsError.message : "Failed to load clinic locations. Please try again later."}
        </p>
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

        <CreateClinicDialog admins={admins} />
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
            <ClinicLocationCard key={loc.id} location={loc} />
          ))}
        </div>
      )}
    </div>
  );
}
