"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DayOfWeek } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SetScheduleDialogProps {
  hcpId: string;
  clinicLocationId: string;
  hcpName: string;
  clinicName: string;
  trigger?: React.ReactNode;
}

const DAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export function SetScheduleDialog({
  hcpId,
  clinicLocationId,
  hcpName,
  clinicName,
  trigger,
}: SetScheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [duration, setDuration] = useState<number>(15);
  const queryClient = useQueryClient();

  const createScheduleMutation = useMutation({
    mutationFn: async () => {
      return api.post("/hcp-schedules", {
        hcpId,
        clinicLocationId,
        availableDays: selectedDays,
        slotDuration: duration,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-hcps", clinicLocationId] });
      toast.success("Schedule set successfully");
      setOpen(false);
      setSelectedDays([]);
      setDuration(15);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to set schedule";
      toast.error(message);
    },
  });

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    if (selectedDays.length === 0) {
      toast.error("Please select at least one day");
      return;
    }
    createScheduleMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="link" className="p-0 h-auto font-medium cursor-pointer">
            Set Schedule
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set HCP Schedule</DialogTitle>
          <DialogDescription>
            Define the working days and slot duration for this HCP.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">HCP Name</Label>
              <p className="font-medium text-sm">{hcpName}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Clinic Location</Label>
              <p className="font-medium text-sm">{clinicName}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Available Days</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <Badge
                  key={day}
                  variant={selectedDays.includes(day) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-3 py-1 text-xs transition-colors",
                    !selectedDays.includes(day) && "hover:bg-accent"
                  )}
                  onClick={() => toggleDay(day)}
                >
                  {day.charAt(0) + day.slice(1).toLowerCase().substring(0, 2)}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="duration">Slot Duration (minutes)</Label>
            <div className="flex items-center gap-3">
              <Input
                id="duration"
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 15)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">minutes per appointment</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={createScheduleMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={selectedDays.length === 0 || createScheduleMutation.isPending}
          >
            {createScheduleMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
