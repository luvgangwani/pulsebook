/**
 * React Query Provider
 * 
 * This component initializes the TanStack Query client and provides it to the 
 * application via context. It enables server-state management, caching, 
 * and synchronization across all components.
 */
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * Provider component to wrap the root layout.
 * @param children - The React application components.
 */
export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // We use a state hook to ensure the QueryClient is stable across re-renders
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
