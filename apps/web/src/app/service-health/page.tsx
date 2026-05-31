"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { cn } from "@/lib/utils";

interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

export default function HealthPage() {
  const { data, isLoading, isError } = useQuery<HealthResponse>({
    queryKey: ["service-health"],
    queryFn: async () => {
      const response = await api.get("/service-health");
      return response.data;
    },
    refetchInterval: 10000,
  });

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center py-12 px-4 font-sans relative">
      <div className="absolute top-8 right-8">
        <ModeToggle />
      </div>

      <div className="w-full max-w-6xl flex flex-col items-center">
        {/* Branding Header */}
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-6xl font-extrabold tracking-tighter text-primary">
            Pulsebook
          </h1>
          <h2 className="text-2xl font-medium text-secondary">
            Service Health Check
          </h2>
        </div>

        {/* API Health Card */}
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">
                  {isLoading ? "Checking..." : data?.service || "Main API"}
                </CardTitle>
                <Badge
                  variant={isError ? "destructive" : "secondary"}
                  className={cn(
                    "px-2 py-0.5 text-[10px] uppercase font-bold",
                    !isError && data?.status === "ok"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-destructive/10 text-destructive border-destructive/20",
                  )}
                >
                  {isLoading ? "Syncing" : isError ? "Offline" : "Online"}
                </Badge>
              </div>
              <CardDescription>
                Pulsebook API — handles all core healthcare services.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="pt-4 border-t flex justify-between items-center text-muted-foreground">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Last Sync
                </span>
                <span className="text-xs font-mono">
                  {isLoading
                    ? "--:--:--"
                    : new Date(data?.timestamp || "").toLocaleTimeString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
