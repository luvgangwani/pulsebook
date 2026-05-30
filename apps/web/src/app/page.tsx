"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useHealthStore } from "@/store/useHealthStore";

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
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center py-20 px-4 font-sans">
      <div className="w-full max-w-6xl space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-10">
          <div className="space-y-3">
            <div className="text-blue-500 font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Infrastructure Monitoring
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Pulsebook <span className="text-blue-500">Pulse</span>
            </h1>
            <p className="text-zinc-400 font-medium">
              Real-time health status of monorepo services.
            </p>
          </div>
          
          <div className="flex items-center gap-6 bg-zinc-900 p-4 rounded-xl border border-white/5">
            <div className="text-right px-4 border-r border-white/10">
              <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Refreshes</p>
              <p className="text-2xl font-bold tabular-nums">{refreshCount}</p>
            </div>
            <button 
              onClick={handleRefresh} 
              disabled={isFetching}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-all active:scale-95"
            >
              {isFetching ? "Syncing..." : "Sync Pulse"}
            </button>
          </div>
        </div>

        {/* Services Flex Row */}
        <div className="flex flex-row flex-wrap gap-8">
          
          {/* API Card */}
          <div className="flex-1 min-w-[340px] bg-zinc-900 border border-white/5 rounded-2xl p-8 space-y-6 hover:border-white/10 transition-colors shadow-2xl">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                <span className="text-xl">📡</span>
              </div>
              {isLoading ? (
                <div className="h-6 w-16 bg-zinc-800 animate-pulse rounded-full" />
              ) : (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${data?.status === 'ok' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                  {isError ? "Offline" : "Online"}
                </span>
              )}
            </div>
            
            <div className="space-y-1">
              <h2 className="text-xl font-bold uppercase tracking-tight">
                {isLoading ? "Loading Service..." : data?.service}
              </h2>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Main API Gateway</p>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4">
              <div className="flex items-center gap-3 text-zinc-400 bg-black/40 p-4 rounded-xl border border-white/5">
                <span className="text-sm">
                  {isError ? "⚠️ Connection Error" : "✅ Systems Operational"}
                </span>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Last Sync</span>
                <span className="text-xs font-mono font-bold text-zinc-400">
                  {isLoading ? "--:--:--" : new Date(data?.timestamp || "").toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {/* DB Placeholder */}
          <div className="flex-1 min-w-[340px] bg-zinc-900/40 border border-dashed border-white/10 rounded-2xl p-8 space-y-6 opacity-40">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center">
                <span className="text-xl">💾</span>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-zinc-800 text-zinc-500">
                Pending
              </span>
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold uppercase tracking-tight text-zinc-700">Database</h2>
              <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">Primary Store</p>
            </div>
            <p className="text-xs text-zinc-700 font-bold leading-relaxed pt-4 border-t border-white/5">
              Telemetry integration for PostgreSQL cluster scheduled for next phase.
            </p>
          </div>

        </div>

        {/* Footer Tech Labels */}
        <div className="pt-16 border-t border-white/5 flex flex-wrap gap-12 justify-center opacity-40">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Zustand</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">React Query</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Tailwind 4</span>
          </div>
        </div>
      </div>
    </main>
  );
}
