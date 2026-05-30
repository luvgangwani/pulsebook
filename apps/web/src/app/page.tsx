"use client";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center py-20 px-4 font-sans">
      <div className="w-full max-w-6xl">
        
        {/* Branding Header */}
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-6xl font-black tracking-tighter text-primary">Pulsebook</h1>
          <h2 className="text-2xl font-medium text-secondary">Service Health Check</h2>
        </div>

      </div>
    </main>
  );
}
