import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Logo and Title */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex aspect-square size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Activity className="size-10" />
          </div>
          <h1 className="text-6xl font-bold tracking-tighter text-primary">
            Pulsebook
          </h1>
        </div>

        {/* Capabilities Description */}
        <p className="max-w-[600px] text-lg text-muted-foreground sm:text-xl">
          Your complete healthcare appointment booking platform. 
          Manage appointments, find healthcare professionals, and track your wellness journey in one place.
        </p>

        {/* Auth Links */}
        <div className="flex flex-col gap-4 min-[400px]:flex-row pt-4">
          <Button asChild size="lg" className="h-12 px-8 text-lg font-medium">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-8 text-lg font-medium">
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-8 text-sm text-muted-foreground">
        © 2026 Pulsebook Healthcare Systems
      </div>
    </div>
  );
}
