"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Hcp } from "../types";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddHcpDialogProps {
  clinicLocationId: string;
}

export function AddHcpDialog({ clinicLocationId }: AddHcpDialogProps) {
  const [open, setOpen] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [selectedHcpId, setSelectedHcpId] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: hcps, isLoading: loadingHcps } = useQuery({
    queryKey: ["all-hcps"],
    queryFn: async () => {
      const response = await api.get<Hcp[]>("/users/hcps");
      return response.data;
    },
    enabled: open,
  });

  const assignHcpMutation = useMutation({
    mutationFn: async (hcpId: string) => {
      return api.post("/hcp-clinic-locations", {
        hcpId,
        clinicLocationId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-hcps", clinicLocationId] });
      toast.success("HCP assigned successfully");
      setOpen(false);
      setSelectedHcpId("");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to assign HCP";
      toast.error(message);
    },
  });

  const handleAssign = () => {
    if (!selectedHcpId) {
      toast.error("Please select an HCP");
      return;
    }
    assignHcpMutation.mutate(selectedHcpId);
  };

  const selectedHcp = hcps?.find((hcp) => hcp.id === selectedHcpId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add HCP
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign HCP</DialogTitle>
          <DialogDescription>
            Search and select a healthcare professional to assign to this clinic location.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="hcp-select">Healthcare Professional</Label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between"
                  disabled={loadingHcps || assignHcpMutation.isPending}
                >
                  {selectedHcp
                    ? `${selectedHcp.firstName} ${selectedHcp.lastName}`
                    : loadingHcps ? "Loading HCPs..." : "Select HCP..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search HCP by name or email..." />
                  <CommandList>
                    <CommandEmpty>No HCP found.</CommandEmpty>
                    <CommandGroup className="gap-1 flex flex-col">
                      {hcps?.map((hcp) => (
                        <CommandItem
                          key={hcp.id}
                          className="mb-1 last:mb-0 cursor-pointer"
                          value={`${hcp.firstName} ${hcp.lastName} ${hcp.email}`}
                          onSelect={() => {
                            setSelectedHcpId(hcp.id === selectedHcpId ? "" : hcp.id);
                            setComboboxOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedHcpId === hcp.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{hcp.firstName} {hcp.lastName}</span>
                            <span className="text-xs text-muted-foreground">{hcp.email} • {hcp.speciality}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={assignHcpMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedHcpId || assignHcpMutation.isPending}
          >
            {assignHcpMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
