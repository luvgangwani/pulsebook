import Link from "next/link";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-8 right-8">
        <Link href="/service-health" aria-label="View Service Health">
          <Button variant="ghost" size="icon" title="View Service Health">
            <Activity className="h-5 w-5" />
            <span className="sr-only">View Service Health</span>
          </Button>
        </Link>
      </div>
      
      <h1 className="text-4xl font-bold text-primary">Pulsebook</h1>
    </main>
  );
}
