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
import { cn } from "@/lib/utils";

interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

export default function HomePage() {
  const { data, isLoading, isError } = useQuery<HealthResponse>({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await api.get("/health");
      return response.data;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center py-20 px-4 font-sans">
      <div className="w-full max-w-6xl flex flex-col items-center">
        {/* Branding Header */}
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-6xl font-black tracking-tighter text-primary">
            Pulsebook
          </h1>
          <h2 className="text-2xl font-medium text-secondary">
            Service Health Check
          </h2>
        </div>

        {/* API Health Card */}
        <div className="w-full max-w-md">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                  {isLoading
                    ? "Checking Service..."
                    : data?.service || "Main API"}
                </CardTitle>
                <CardDescription className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                  Primary Infrastructure
                </CardDescription>
              </div>
              <Badge
                variant={isError ? "destructive" : "secondary"}
                className={cn(
                  "px-3 py-1 uppercase tracking-widest text-[10px] font-black border",
                  !isError && data?.status === "ok"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-destructive/10 text-destructive border-destructive/20",
                )}
              >
                {isLoading ? "Syncing" : isError ? "Offline" : "Online"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="pt-4 border-t border-border flex justify-between items-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Last Sync
                </span>
                <span className="text-xs font-mono font-bold text-foreground/70">
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
