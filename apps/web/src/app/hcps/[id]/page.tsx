"use client";

import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Stethoscope, 
  Calendar, 
  Clock, 
  MapPin,
  Building2
} from "lucide-react";
import { format } from "date-fns";
import { HcpDetailsResponse, AssignedClinicLocation } from "../types";

export default function HcpDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const hcpId = params.id as string;

  const {
    data,
    isPending: loading,
    error,
  } = useQuery({
    queryKey: ["hcp-details", hcpId],
    queryFn: async () => {
      const response = await api.get<HcpDetailsResponse>(
        `/clinic-locations/assigned/${hcpId}`
      );
      return response.data;
    },
  });

  const formatAddress = (loc: AssignedClinicLocation) => {
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
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-1/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <User className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">HCP Not Found</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          The healthcare professional you are looking for does not exist or could not be loaded.
        </p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const { hcp, clinicLocations } = data;
  const fullName = [hcp.firstName, hcp.lastName].filter(Boolean).join(" ");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={() => router.back()} variant="ghost" size="icon">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {fullName}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Information</CardTitle>
            <CardDescription>
              General details about this healthcare professional.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Stethoscope className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Speciality</p>
                  <p className="text-muted-foreground">{hcp.speciality}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">{hcp.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Registration Date</p>
                  <p className="text-muted-foreground">
                    {format(new Date(hcp.createdAt), "PPPP")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Last Updated</p>
                  <p className="text-muted-foreground">
                    {format(new Date(hcp.updatedAt), "PPPP")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Assigned Clinics</span>
              <Badge variant="secondary">{clinicLocations.length}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Clinic Locations</CardTitle>
          <CardDescription>
            List of clinics where this HCP is currently assigned.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clinicLocations.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No clinic locations assigned to this HCP yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinic Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Available Days</TableHead>
                  <TableHead>Slot Duration</TableHead>
                  <TableHead>Assigned At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clinicLocations.map((loc) => (
                  <TableRow key={loc.id}>
                    <TableCell className="font-medium">
                      {loc.name || "Unnamed Clinic"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatAddress(loc)}
                    </TableCell>
                    <TableCell>
                      {loc.schedule ? (
                        <div className="flex flex-wrap gap-1">
                          {loc.schedule.availableDays.map((day) => (
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
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {loc.schedule ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {loc.schedule.slotDuration} min
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(loc.assignedAt), "PP")}
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
