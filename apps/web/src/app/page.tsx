"use client";

/**
 * Health Dashboard
 * 
 * Demonstrates:
 * - TanStack Query: Real-time server state for services.
 * - Zustand: Global UI state (refresh counter).
 * - shadcn/ui: Grid of service cards built on Radix primitives.
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
    <main className="min-h-screen bg-slate-50/50 flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-5xl space-y-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              Live System Status
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              Pulsebook Infrastructure
            </h1>
            <p className="text-slate-500 max-w-md font-medium">
              Real-time monitoring of monorepo services and backend dependencies.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
            <div className="px-3 py-1 text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Refreshes</p>
              <p className="text-lg font-black text-blue-600 leading-tight">{refreshCount}</p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <Button 
              onClick={handleRefresh} 
              disabled={isFetching}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg px-6"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
              Check Now
            </Button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* API Service Card */}
          <Card className="group border-slate-200 shadow-none hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Server className="w-6 h-6" />
              </div>
              {isLoading ? (
                <div className="h-5 w-16 bg-slate-100 animate-pulse rounded-full" />
              ) : isError ? (
                <Badge variant="destructive" className="font-bold">OFFLINE</Badge>
              ) : (
                <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-500 font-bold px-3">
                  ONLINE
                </Badge>
              )}
            </CardHeader>
            <CardHeader className="pt-2">
              <CardTitle className="text-xl font-bold text-slate-800">
                {isLoading ? "API Service" : data?.service}
              </CardTitle>
              <CardDescription className="font-medium text-slate-400">NestJS Gateway</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-600">
                  {isError ? (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )}
                  <span className="text-sm font-semibold italic">
                    {isError ? "Connection Refused" : "System performing normally"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-mono">
                    {isLoading ? "--:--:--" : new Date(data?.timestamp || "").toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-300">
              <span>Managed by React Query</span>
              {isFetching && <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />}
            </CardFooter>
          </Card>

          {/* Database Placeholder Card (Static) */}
          <Card className="opacity-60 border-dashed border-slate-200 shadow-none bg-slate-50/50 cursor-not-allowed">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="p-2.5 bg-slate-200 rounded-xl text-slate-500">
                <Database className="w-6 h-6" />
              </div>
              <Badge variant="secondary" className="font-bold">PENDING</Badge>
            </CardHeader>
            <CardHeader className="pt-2">
              <CardTitle className="text-xl font-bold text-slate-800 italic">Database</CardTitle>
              <CardDescription className="font-medium text-slate-400">PostgreSQL Store</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Database health checks will be implemented in the next backend phase.
              </p>
            </CardContent>
          </Card>

          {/* Web Placeholder Card (Static) */}
          <Card className="opacity-60 border-dashed border-slate-200 shadow-none bg-slate-50/50 cursor-not-allowed">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="p-2.5 bg-slate-200 rounded-xl text-slate-500">
                <Globe className="w-6 h-6" />
              </div>
              <Badge variant="secondary" className="font-bold">LOCAL</Badge>
            </CardHeader>
            <CardHeader className="pt-2">
              <CardTitle className="text-xl font-bold text-slate-800 italic">Frontend</CardTitle>
              <CardDescription className="font-medium text-slate-400">Next.js Client</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                App Router running in development mode with hot-reloading active.
              </p>
            </CardContent>
          </Card>

        </div>

        {/* Footer Tech Stack */}
        <div className="pt-12 border-t border-slate-200 flex flex-wrap gap-12 justify-center">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Zustand</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">React Query</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Tailwind 4</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Radix UI</span>
          </div>
        </div>
      </div>
    </main>
  );
}
