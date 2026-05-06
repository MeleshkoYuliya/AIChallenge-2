import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { EventCard, EventCardData } from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, MapPin, CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

const Explore = () => {
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [range, setRange] = useState<DateRange | undefined>();
  const [includePast, setIncludePast] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = supabase
        .from("events")
        .select("id, slug, title, cover_image_url, start_at, end_at, venue_address, online_url, capacity, hosts(name, slug)")
        .eq("status", "published")
        .eq("visibility", "public")
        .is("hidden_at", null)
        .order("start_at", { ascending: true });

      const nowIso = new Date().toISOString();
      if (range?.from) {
        query = query.gte("start_at", range.from.toISOString());
      } else if (!includePast) {
        query = query.gte("end_at", nowIso);
      }
      if (range?.to) {
        const end = new Date(range.to);
        end.setHours(23, 59, 59, 999);
        query = query.lte("start_at", end.toISOString());
      }
      if (q) query = query.ilike("title", `%${q}%`);
      if (location) {
        const term = `%${location}%`;
        query = query.or(`venue_address.ilike.${term},online_url.ilike.${term}`);
      }
      const { data } = await query;
      const list = (data as any[]) || [];
      if (list.length) {
        const ids = list.map((e) => e.id);
        const { data: fb } = await supabase
          .from("event_feedback")
          .select("event_id, rating")
          .in("event_id", ids);
        const agg: Record<string, { sum: number; n: number }> = {};
        (fb || []).forEach((f: any) => {
          agg[f.event_id] = agg[f.event_id] || { sum: 0, n: 0 };
          agg[f.event_id].sum += f.rating;
          agg[f.event_id].n += 1;
        });
        list.forEach((e: any) => {
          const a = agg[e.id];
          e.rating_avg = a ? a.sum / a.n : null;
          e.rating_count = a ? a.n : 0;
        });
      }
      setEvents(list);
      setLoading(false);
    };
    load();
  }, [q, location, range, includePast]);

  const rangeLabel = range?.from
    ? range.to
      ? `${format(range.from, "LLL d")} – ${format(range.to, "LLL d, y")}`
      : format(range.from, "LLL d, y")
    : "Upcoming";

  return (
    <Layout>
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold md:text-5xl">Explore</h1>
        <p className="mt-2 text-muted-foreground">Discover upcoming community events.</p>
      </div>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events…" className="pl-9" />
        </div>
        <div className="relative min-w-[200px] flex-1 sm:flex-none">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location…"
            className="pl-9"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("justify-start text-left font-normal", !range && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {rangeLabel}
              {range?.from && (
                <X
                  className="ml-2 h-4 w-4 opacity-60 hover:opacity-100"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setRange(undefined);
                  }}
                />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              numberOfMonths={2}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        <div className="flex items-center gap-2">
          <Switch id="past" checked={includePast} onCheckedChange={setIncludePast} disabled={!!range?.from} />
          <Label htmlFor="past" className="cursor-pointer">Include past</Label>
        </div>
      </div>
      {loading ? (
        <div className="text-muted-foreground">Loading events…</div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          No events found. Try adjusting your filters.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      )}
    </Layout>
  );
};

export default Explore;
