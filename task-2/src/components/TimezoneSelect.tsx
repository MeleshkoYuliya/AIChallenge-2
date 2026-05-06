import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const getZones = (): string[] => {
  // @ts-ignore - supportedValuesOf may not be typed in older TS lib
  const zones: string[] | undefined = (Intl as any).supportedValuesOf?.("timeZone");
  if (zones && zones.length) return zones;
  return ["UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney"];
};

export const TimezoneSelect = ({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (tz: string) => void;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const zones = useMemo(getZones, []);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className="truncate">{value || "Select timezone"}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 pointer-events-auto" align="start">
        <Command>
          <CommandInput placeholder="Search timezone…" />
          <CommandList>
            <CommandEmpty>No timezone found.</CommandEmpty>
            <CommandGroup>
              {zones.map((tz) => (
                <CommandItem
                  key={tz}
                  value={tz}
                  onSelect={() => { onChange(tz); setOpen(false); }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === tz ? "opacity-100" : "opacity-0")} />
                  {tz}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
