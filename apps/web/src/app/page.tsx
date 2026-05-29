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
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-500 mt-1">Pulsebook Monorepo Status</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : isError ? (
            <div className="text-red-600 text-center py-4 font-medium">
              Failed to connect to API
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${data?.status === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {data?.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Service</span>
                <span className="text-sm font-semibold text-gray-700">{data?.service}</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Last Sync</span>
                <span className="text-xs font-mono text-gray-600">{new Date(data?.timestamp || "").toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">
              Manual Refreshes: <span className="font-bold text-blue-600">{refreshCount}</span>
            </span>
            {isFetching && (
              <span className="text-xs text-blue-500 animate-pulse font-medium italic">
                Refreshing...
              </span>
            )}
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm active:transform active:scale-[0.98]"
          >
            Check Health Now
          </button>
        </div>
        
        <p className="text-center text-[10px] text-gray-400">
          Zustand manages counter • React Query manages API data • Tailwind handles styling
        </p>
      </div>
    </main>
  );
}
