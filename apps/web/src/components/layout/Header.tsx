"use client"

import React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-30 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
      </div>
      <div className="absolute left-1/2 -translate-x-1/2">
        <h1 className="text-xl font-bold text-primary tracking-tight">Pulsebook</h1>
      </div>
      <div className="w-10" /> {/* Spacer for centering title */}
    </header>
  )
}
