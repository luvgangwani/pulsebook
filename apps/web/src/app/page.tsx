"use client";

/**
 * Health Dashboard - Dark Theme & Flex Layout
 * 
 * Demonstrates:
 * - TanStack Query: Real-time server state for services.
 * - Zustand: Global UI state (refresh counter).
 * - shadcn/ui: Row-based flex layout with dark theme aesthetics.
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useHealthStore } from "@/store/useHealthStore";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  Activity, 
  Server, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Globe
} from "lucide-react";

interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

export default function HomePage() {
  const { refreshCount, incrementRefreshCount } = useHealthStore();

  const { data, isLoading, isError, refetch, isFetching } = useQuery<HealthResponse>({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await api.get("/health");
      return response.data;
    },
  });

  const handleRefresh = () => {
    incrementRefreshCount();
    refetch();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-6xl space-y-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider">
              <Activity className="w-4 h-4 animate-pulse" />
              System Pulse
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              Pulsebook Infrastructure
            </h1>
            <p className="text-slate-400 max-w-md font-medium">
              Real-time monitoring of monorepo services in a row-based flexible layout.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-xl shadow-2xl border border-slate-800">
            <div className="px-3 py-1 text-right">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Cycles</p>
              <p className="text-lg font-black text-blue-400 leading-tight">{refreshCount}</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <Button 
              onClick={handleRefresh} 
              disabled={isFetching}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg px-6 border-none shadow-[0_0_15px_rgba(37,99,235,0.4)]"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
              Pulse Sync
            </Button>
          </div>
        </div>

        {/* Services Flex Row */}
        <div className="flex flex-row flex-wrap gap-6 justify-start">
          
          {/* API Service Card */}
          <Card className="flex-1 min-w-[320px] group border-slate-800 shadow-none hover:shadow-[0_0_30px_rgba(30,41,59,0.5)] transition-all duration-300 bg-slate-900 text-slate-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="p-2.5 bg-blue-950/50 rounded-xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors border border-blue-900/50">
                <Server className="w-6 h-6" />
              </div>
              {isLoading ? (
                <div className="h-5 w-16 bg-slate-800 animate-pulse rounded-full" />
              ) : isError ? (
                <Badge variant="destructive" className="font-bold border-none">OFFLINE</Badge>
              ) : (
                <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-500 font-black px-3 border-none text-slate-950">
                  ONLINE
                </Badge>
              )}
            </CardHeader>
            <CardHeader className="pt-2">
              <CardTitle className="text-xl font-black text-white">
                {isLoading ? "API Service" : data?.service.toUpperCase()}
              </CardTitle>
              <CardDescription className="font-bold text-slate-500 uppercase tracking-tighter text-[10px]">Gateway Protocol</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                  {isError ? (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                  )}
                  <span className="text-sm font-medium italic">
                    {isError ? "Connection Terminated" : "All systems operational"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 px-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold">
                    {isLoading ? "--:--:--" : new Date(data?.timestamp || "").toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-slate-800 flex justify-between items-center text-[9px] uppercase font-black tracking-[0.2em] text-slate-600">
              <span>Query Instance Active</span>
              {isFetching && <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />}
            </CardFooter>
          </Card>

          {/* Database Placeholder Card */}
          <Card className="flex-1 min-w-[320px] opacity-40 border-dashed border-slate-800 shadow-none bg-slate-900/30 cursor-not-allowed">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="p-2.5 bg-slate-800/50 rounded-xl text-slate-600">
                <Database className="w-6 h-6" />
              </div>
              <Badge variant="secondary" className="font-black border-none text-[9px] bg-slate-800 text-slate-400">WAITING</Badge>
            </CardHeader>
            <CardHeader className="pt-2">
              <CardTitle className="text-xl font-black text-slate-700 italic underline decoration-slate-800 underline-offset-4">DB_CLUSTER</CardTitle>
              <CardDescription className="font-bold text-slate-600 uppercase tracking-tighter text-[10px]">Persistence Layer</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 font-bold leading-relaxed">
                PostgreSQL health probes integration scheduled for sprint 2.
              </p>
            </CardContent>
          </Card>

          {/* Web Placeholder Card */}
          <Card className="flex-1 min-w-[320px] opacity-40 border-dashed border-slate-800 shadow-none bg-slate-900/30 cursor-not-allowed">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="p-2.5 bg-slate-800/50 rounded-xl text-slate-600">
                <Globe className="w-6 h-6" />
              </div>
              <Badge variant="secondary" className="font-black border-none text-[9px] bg-slate-800 text-slate-400">DEV_MODE</Badge>
            </CardHeader>
            <CardHeader className="pt-2">
              <CardTitle className="text-xl font-black text-slate-700 italic underline decoration-slate-800 underline-offset-4">WEB_NODE</CardTitle>
              <CardDescription className="font-bold text-slate-600 uppercase tracking-tighter text-[10px]">Edge Runtime</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 font-bold leading-relaxed">
                Next.js 15 App Router running with HMR synchronization.
              </p>
            </CardContent>
          </Card>

        </div>

        {/* Tech Stack Signal */}
        <div className="pt-16 border-t border-slate-900 flex flex-wrap gap-16 justify-center">
          <div className="group flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-blue-400 transition-colors">Zustand</span>
          </div>
          <div className="group flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-purple-400 transition-colors">React Query</span>
          </div>
          <div className="group flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-emerald-400 transition-colors">Tailwind 4</span>
          </div>
          <div className="group flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-white transition-colors">Radix UI</span>
          </div>
        </div>
      </div>
    </main>
  );
}
