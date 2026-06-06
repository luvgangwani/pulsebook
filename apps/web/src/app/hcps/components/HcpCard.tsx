"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Stethoscope } from "lucide-react";
import { Hcp } from "../types";

interface HcpCardProps {
  hcp: Hcp;
}

export function HcpCard({ hcp }: HcpCardProps) {
  const fullName = [hcp.firstName, hcp.lastName].filter(Boolean).join(" ");

  return (
    <Card className="hover:shadow-md transition-shadow h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <User className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold leading-tight">
              {fullName}
            </CardTitle>
          </div>
          <Badge variant="secondary" className="shrink-0">
            HCP
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-primary shrink-0" />
            <span className="text-muted-foreground truncate">
              {hcp.email}
            </span>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Stethoscope className="h-4 w-4 text-primary shrink-0" />
              <span>{hcp.speciality}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
