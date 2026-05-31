import Link from "next/link";
import { Activity } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-8 right-8">
        <Link
          href="/service-health"
          aria-label="View Service Health"
          title="View Service Health"
          className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <Activity className="size-5" />
          <span className="sr-only">View Service Health</span>
        </Link>
      </div>
      
      <h1 className="text-4xl font-bold text-primary">Pulsebook</h1>
    </main>
  );
}
