"use client";

import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { Hcp } from "./types";
import { HcpCard } from "./components/HcpCard";

export default function HcpsPage() {
  /**
   * TanStack Query - Fetching HCPs
   */
  const {
    data: hcps = [],
    isPending: loadingHcps,
    error: hcpsError,
  } = useQuery({
    queryKey: ["hcps"],
    queryFn: async () => {
      const response = await api.get<Hcp[]>("/users/hcps");
      return response.data;
    },
  });

  if (loadingHcps) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Healthcare Professionals</h1>
          <p className="text-muted-foreground mt-2">
            View all registered healthcare professionals.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-6 w-3/4" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <div className="pt-4 border-t">
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (hcpsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <Users className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Error Loading HCPs</h2>
        <p className="text-muted-foreground max-w-md">
          {hcpsError instanceof Error ? hcpsError.message : "Failed to load healthcare professionals. Please try again later."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Healthcare Professionals</h1>
        <p className="text-muted-foreground mt-2">
          View all registered healthcare professionals.
        </p>
      </div>

      {hcps.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center border-2 border-dashed rounded-lg p-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium">No HCPs found</h3>
          <p className="text-muted-foreground mt-2">
            There are no healthcare professionals registered in the system yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hcps.map((hcp) => (
            <HcpCard key={hcp.id} hcp={hcp} />
          ))}
        </div>
      )}
    </div>
  );
}
