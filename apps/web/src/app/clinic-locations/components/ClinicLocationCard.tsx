"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ClinicLocation } from "../types";

interface ClinicLocationCardProps {
  location: ClinicLocation;
}

export function ClinicLocationCard({ location }: ClinicLocationCardProps) {
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-xl font-bold leading-tight">
            {location.name || "Unnamed Clinic"}
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
              {formatAddress(location)}
            </span>
          </div>

          <div className="pt-4 border-t flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>Created by: {location.createdByName || "System"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                Created at: {format(new Date(location.createdAt), "PPP")}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
