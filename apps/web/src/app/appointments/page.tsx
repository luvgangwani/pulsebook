"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, User, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";

interface Appointment {
  id: string;
  slot: {
    slotDate: string;
    slotTime: string;
    hcpSchedule: {
      slotDuration: number;
      hcpClinicLocation: {
        hcp: {
          user: {
            firstName: string;
            lastName: string;
          };
        };
        clinicLocation: {
          name: string | null;
          suburb: string | null;
        };
      };
    };
  };
  patient: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  status: string;
  createdAt: string;
}

export default function MyAppointmentsPage() {
  const [view, setView] = useState<"me" | "on-behalf">("me");

  const {
    data: appointments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["appointments", view],
    queryFn: async () => {
      const response = await api.get<Appointment[]>("/appointments", {
        params: { type: view },
      });
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your upcoming and past appointments.
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-muted/50 p-3 rounded-lg border">
          <Label 
            onClick={() => setView("me")} 
            className={`text-sm font-medium cursor-pointer transition-colors ${view === "me" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            For Me
          </Label>
          <Switch
            id="view-mode"
            checked={view === "on-behalf"}
            onCheckedChange={(checked) => setView(checked ? "on-behalf" : "me")}
          />
          <Label 
            onClick={() => setView("on-behalf")} 
            className={`text-sm font-medium cursor-pointer transition-colors ${view === "on-behalf" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            On Behalf Of
          </Label>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {view === "me" ? "Appointments For Me" : "Appointments On Behalf Of Patients"}
          </CardTitle>
          <CardDescription>
            {view === "me" 
              ? "List of all healthcare appointments scheduled for your personal care." 
              : "List of appointments you have scheduled for other patients."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No appointments found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {view === "me" 
                  ? "You haven't scheduled any appointments for yourself yet." 
                  : "You haven't scheduled any appointments for others yet."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>HCP Name</TableHead>
                  <TableHead>Clinic Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Slot Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {appointment.patient.user.firstName} {appointment.patient.user.lastName}
                      </div>
                    </TableCell>
                    <TableCell>
                      Dr. {appointment.slot.hcpSchedule.hcpClinicLocation.hcp.user.firstName} {appointment.slot.hcpSchedule.hcpClinicLocation.hcp.user.lastName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {appointment.slot.hcpSchedule.hcpClinicLocation.clinicLocation.name || appointment.slot.hcpSchedule.hcpClinicLocation.clinicLocation.suburb}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(appointment.slot.slotDate), "PP")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(appointment.slot.slotTime), "p")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {appointment.slot.hcpSchedule.slotDuration} mins
                      </div>
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
