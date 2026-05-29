"use client";

/**
 * Health Dashboard
 * 
 * Demonstrates the use of:
 * - TanStack Query: Manages server-side state (API fetching).
 * - Zustand: Manages client-side global state (refresh counter).
 * - shadcn/ui: Accessible UI components built on Radix primitives.
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useHealthStore } from "@/store/useHealthStore";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Activity, Server, Clock, ShieldCheck } from "lucide-react";

interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

export default function HomePage() {
  /**
   * Zustand State: Access global client state.
   */
  const { refreshCount, incrementRefreshCount } = useHealthStore();

  /**
   * React Query: Fetch server-side health status.
   */
  const { data, isLoading, isError, refetch, isFetching } = useQuery<HealthResponse>({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await api.get("/health");
      return response.data;
    },
  });

  /**
   * Increments client counter and triggers server refetch.
   */
  const handleRefresh = () => {
    incrementRefreshCount();
    refetch();
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Health Monitor</h1>
              <p className="text-sm text-slate-500 font-medium">Pulsebook Monorepo</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Refreshes</p>
              <p className="text-sm font-bold text-slate-700">{refreshCount}</p>
            </div>
            <Button 
              size="sm"
              onClick={handleRefresh} 
              disabled={isFetching}
              className="bg-white text-slate-700 border-slate-200 border hover:bg-slate-50 shadow-none"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Card */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                System Status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-24 bg-slate-100 animate-pulse rounded" />
              ) : isError ? (
                <p className="text-xl font-bold text-red-600">Error</p>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-slate-900 capitalize">{data?.status}</span>
                  <Badge variant={data?.status === 'ok' ? "default" : "destructive"} className="bg-green-500 hover:bg-green-500">
                    Online
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Card */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-500" />
                API Service
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-32 bg-slate-100 animate-pulse rounded" />
              ) : isError ? (
                <p className="text-xl font-bold text-red-600">API Offline</p>
              ) : (
                <p className="text-2xl font-bold text-slate-900 truncate">{data?.service}</p>
              )}
            </CardContent>
          </Card>

          {/* Timestamp Card */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                Last Check
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-32 bg-slate-100 animate-pulse rounded" />
              ) : isError ? (
                <p className="text-xl font-bold text-red-600">--:--:--</p>
              ) : (
                <p className="text-2xl font-bold text-slate-900 font-mono">
                  {new Date(data?.timestamp || "").toLocaleTimeString()}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="pt-8 border-t border-slate-200">
          <div className="flex flex-wrap gap-8 justify-center opacity-50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Zustand</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-600">React Query</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Tailwind CSS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-900" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Radix UI</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
