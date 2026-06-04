"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ClinicLocation, AssignedHcp } from "../types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  User,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  Users,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { AddHcpDialog } from "../components/AddHcpDialog";
import Link from "next/link";

export default function ClinicLocationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const {
    data: location,
    isLoading: loadingLocation,
    error: locationError,
  } = useQuery({
    queryKey: ["clinic-location", id],
    queryFn: async () => {
      const response = await api.get<ClinicLocation>(`/clinic-locations/${id}`);
      return response.data;
    },
  });

  const { data: hcpData, isLoading: loadingHcps } = useQuery({
    queryKey: ["clinic-hcps", id],
    queryFn: async () => {
      const response = await api.get<{ hcps: AssignedHcp[] }>(
        `/hcps/assigned/${id}`,
      );
      return response.data;
    },
    enabled: !!location,
  });

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

  const formatDays = (days: string[]) => {
    if (!days || days.length === 0) return "No days set";
    return days
      .map((d) => d.charAt(0) + d.slice(1).toLowerCase().substring(0, 2))
      .join(", ");
  };

  if (loadingLocation) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (locationError || !location) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <MapPin className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Clinic Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The clinic location you are looking for does not exist or you do not
          have permission to view it.
        </p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={() => router.back()} variant="ghost" size="icon">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {location.name || "Clinic Details"}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Information</CardTitle>
            <CardDescription>
              General details about this clinic location.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Address</p>
                <p className="text-muted-foreground">
                  {formatAddress(location)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Manager</p>
                  <p className="text-muted-foreground">
                    {location.managedByName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Created By</p>
                  <p className="text-muted-foreground">
                    {location.createdByName || "System"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Created At</p>
                  <p className="text-muted-foreground">
                    {format(new Date(location.createdAt), "PPPP")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Assigned HCPs</span>
              <Badge variant="secondary">{hcpData?.hcps.length || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Assigned HCPs</CardTitle>
            <CardDescription>
              List of healthcare professionals working at this location.
            </CardDescription>
          </div>
          <AddHcpDialog clinicLocationId={location.id} />
        </CardHeader>
        <CardContent>
          {loadingHcps ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !hcpData?.hcps.length ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No HCPs assigned to this location yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Available Days</TableHead>
                  <TableHead>Slot Duration</TableHead>
                  <TableHead>Assigned At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hcpData.hcps.map((hcp) => (
                  <TableRow key={hcp.id}>
                    <TableCell className="font-medium">
                      {hcp.firstName} {hcp.lastName}
                    </TableCell>
                    <TableCell>{hcp.email}</TableCell>
                    <TableCell>
                      {hcp.schedule ? (
                        <div className="flex flex-wrap gap-1">
                          {hcp.schedule.availableDays.map((day) => (
                            <Badge
                              key={day}
                              variant="outline"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {day.charAt(0) +
                                day.slice(1).toLowerCase().substring(0, 2)}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <Link 
                          href="#" 
                          className="text-primary hover:underline text-sm font-medium cursor-pointer"
                          onClick={(e) => e.preventDefault()}
                        >

                          Set Schedule
                        </Link>
                      )}
                    </TableCell>
                    <TableCell>
                      {hcp.schedule ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {hcp.schedule.slotDuration} min
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(hcp.assignedAt), "PP")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
