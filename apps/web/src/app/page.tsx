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
import { RefreshCw, Activity, Server, Clock } from "lucide-react";

interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

export default function HomePage() {
  // Use global client state from Zustand
  const { refreshCount, incrementRefreshCount } = useHealthStore();

  // Use server state from React Query
  const { data, isLoading, isError, refetch, isFetching } = useQuery<HealthResponse>({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await api.get("/health");
      return response.data;
    },
  });

  /**
   * Action handler that updates both global state and server state.
   */
  const handleRefresh = () => {
    incrementRefreshCount();
    refetch();
  };

  return (
    <main className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-2">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            System Monitoring
          </h1>
          <p className="text-slate-500">
            Pulsebook Monorepo Infrastructure Status
          </p>
        </div>

        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
          <CardHeader className="border-b bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  API Gateway
                </CardTitle>
                <CardDescription>Backend health verification</CardDescription>
              </div>
              {!isLoading && !isError && (
                <Badge variant={data?.status === 'ok' ? "default" : "destructive"} className="px-3 py-1">
                  {data?.status.toUpperCase()}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-sm text-slate-400 font-medium">Connecting to service...</p>
              </div>
            ) : isError ? (
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
                <p className="text-red-700 font-medium">API unreachable</p>
                <p className="text-xs text-red-500 mt-1">Check if the NestJS server is running on port 3001</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <Server className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">Service Name</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{data?.service}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">Last Synced</span>
                  </div>
                  <span className="text-sm font-mono text-slate-700">
                    {new Date(data?.timestamp || "").toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="bg-slate-50/30 border-t flex flex-col items-stretch gap-4 p-6">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                Manual Refreshes: 
                <Badge variant="outline" className="bg-white ml-1">
                  {refreshCount}
                </Badge>
              </span>
              {isFetching && (
                <span className="flex items-center gap-1.5 text-blue-600 font-medium animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Updating...
                </span>
              )}
            </div>
            
            <Button 
              onClick={handleRefresh} 
              disabled={isFetching}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md active:scale-[0.98]"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
              Trigger Refresh
            </Button>
          </CardFooter>
        </Card>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">State</p>
            <p className="text-xs font-medium text-slate-600">Zustand</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Caching</p>
            <p className="text-xs font-medium text-slate-600">React Query</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">A11y</p>
            <p className="text-xs font-medium text-slate-600">Radix UI</p>
          </div>
        </div>
      </div>
    </main>
  );
}
