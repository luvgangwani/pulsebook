"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, User, Calendar } from "lucide-react";
import { format } from "date-fns";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await api.get<ClinicLocation[]>("/clinic-locations");
        setLocations(response.data);
      } catch (err) {
        console.error("Failed to fetch clinic locations:", err);
        setError("Failed to load clinic locations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clinic Locations</h1>
          <p className="text-muted-foreground mt-2">
            View all available clinic locations.
          </p>
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clinic Locations</h1>
        <p className="text-muted-foreground mt-2">
          View all available clinic locations.
        </p>
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
