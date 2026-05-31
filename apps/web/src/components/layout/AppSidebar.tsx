"use client";

import * as React from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  LayoutGrid,
  Activity,
  User,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const items = [
  {
    title: "Appointments",
    url: "/appointments",
    icon: Calendar,
  },
  {
    title: "Clinic Locations",
    url: "/clinic-locations",
    icon: MapPin,
  },
  {
    title: "HCPs",
    url: "/hcps",
    icon: Users,
  },
  {
    title: "Schedules",
    url: "/schedules",
    icon: Clock,
  },
  {
    title: "Slots",
    url: "/slots",
    icon: LayoutGrid,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
  {
    title: "Logout",
    url: "/logout",
    icon: LogOut,
    variant: "destructive",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-16 flex items-center justify-center border-b">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="size-4" />
          </div>
          <span className="font-semibold group-data-[collapsible=icon]:hidden">
            Pulsebook
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title}
                    size="lg"
                    className="relative group-data-[collapsible=icon]:px-0 hover:bg-transparent active:bg-transparent data-[active=true]:bg-transparent"
                  >
                    <Link 
                      href={item.url as any} 
                      className={cn(
                        "flex items-center w-full gap-2 transition-all duration-300 rounded-md group-data-[collapsible=icon]:justify-center",
                        item.variant === "destructive" 
                          ? "text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-950/30" 
                          : "hover:text-primary",
                        "active:scale-95",
                        pathname === item.url 
                          ? (item.variant === "destructive" ? "text-red-600 font-bold ring-1 ring-red-500" : "text-primary font-bold")
                          : (item.variant === "destructive" ? "text-red-500" : "text-muted-foreground")
                      )}
                    >
                      <item.icon className="shrink-0 transition-transform duration-300 group-hover:scale-110" />
                      <span className="group-data-[collapsible=icon]:hidden truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              tooltip="Service Health"
              size="lg"
              className="relative group-data-[collapsible=icon]:px-0 hover:bg-transparent active:bg-transparent data-[active=true]:bg-transparent"
            >
              <Link 
                href="/service-health" 
                className={cn(
                  "group/health flex items-center w-full gap-2 transition-all duration-300 rounded-md group-data-[collapsible=icon]:justify-center hover:text-primary",
                  pathname === "/service-health" ? "text-primary font-bold" : "text-muted-foreground"
                )}
              >
                <Activity className="shrink-0 size-4 transition-transform duration-300 group-hover/health:scale-110" />
                <span className="group-data-[collapsible=icon]:hidden truncate">Service Health</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton 
                  tooltip="Theme"
                  size="lg"
                  className="relative group-data-[collapsible=icon]:px-0 hover:bg-transparent active:bg-transparent data-[active=true]:bg-transparent cursor-pointer text-muted-foreground hover:text-primary transition-colors"
                >
                  <div className="group/theme flex items-center w-full gap-2 transition-all duration-300 rounded-md group-data-[collapsible=icon]:justify-center">
                    <div className="relative size-4 shrink-0 transition-transform duration-300 group-hover/theme:scale-110">
                      <Sun className="absolute inset-0 size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute inset-0 size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </div>
                    <span className="group-data-[collapsible=icon]:hidden truncate capitalize">
                      {mounted ? (theme === "system" ? "System" : theme) : "System"} Theme
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="right">
                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
