import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

type Role = "host" | "checker";
type Membership = { host_id: string; role: Role; hosts: { id: string; name: string; slug: string } };
type Ev = { id: string; slug: string; title: string; start_at: string; end_at: string; status: string; host_id: string };

const MyEvents = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [events, setEvents] = useState<Ev[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [hostFilter, setHostFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [range, setRange] = useState<DateRange | undefined>();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth?redirect=/my-events"); return; }
    (async () => {
      const { data: mems } = await supabase
        .from("host_members")
        .select("host_id, role, hosts(id, name, slug)")
        .eq("user_id", user.id);
      const list = (mems as any) || [];
      setMemberships(list);
      const hostIds: string[] = Array.from(new Set(list.map((m: any) => m.host_id as string)));
      if (hostIds.length === 0) { setPageLoading(false); return; }
      const { data: evs } = await supabase
        .from("events")
        .select("id, slug, title, start_at, end_at, status, host_id")
        .in("host_id", hostIds)
        .order("start_at", { ascending: false });
      setEvents((evs as any) || []);
      setPageLoading(false);
    })();
  }, [user, loading, navigate]);

  // Highest role per host (host beats checker)
  const roleByHost = useMemo(() => {
    const m = new Map<string, Role>();
    memberships.forEach((mem) => {
      const cur = m.get(mem.host_id);
      if (mem.role === "host" || !cur) m.set(mem.host_id, mem.role);
    });
    return m;
  }, [memberships]);

  const hostOptions = useMemo(() => {
    const seen = new Map<string, string>();
    memberships.forEach((m) => seen.set(m.host_id, m.hosts.name));
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [memberships]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return events.filter((e) => {
      if (hostFilter !== "all" && e.host_id !== hostFilter) return false;
      if (term && !e.title.toLowerCase().includes(term)) return false;
      if (range?.from && new Date(e.end_at) < range.from) return false;
      if (range?.to) {
        const end = new Date(range.to); end.setHours(23, 59, 59, 999);
        if (new Date(e.start_at) > end) return false;
      }
      return true;
    });
  }, [events, q, hostFilter, range]);

  const rangeLabel = range?.from
    ? range.to
      ? `${format(range.from, "MMM d")} – ${format(range.to, "MMM d")}`
      : format(range.from, "MMM d, yyyy")
    : "Any date";

  if (pageLoading) return <Layout><div className="text-muted-foreground">Loading…</div></Layout>;

  return (
    <Layout>
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-4xl font-bold">My events</h1>
        <p className="mt-2 text-muted-foreground">Events from teams where you're a Host or Checker.</p>

        {memberships.length === 0 ? (
          <Card className="glass mt-8 p-12 text-center text-muted-foreground">
            You don't belong to any host team yet.
          </Card>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="relative min-w-[220px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events…" className="pl-9" />
              </div>
              <Select value={hostFilter} onValueChange={setHostFilter}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All hosts</SelectItem>
                  {hostOptions.map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("min-w-[180px] justify-start", !range && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />{rangeLabel}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={2} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              {(range || q || hostFilter !== "all") && (
                <Button variant="ghost" size="icon" onClick={() => { setQ(""); setRange(undefined); setHostFilter("all"); }} aria-label="Clear filters">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="mt-6 grid gap-3">
              {filtered.length === 0 ? (
                <Card className="glass border-dashed p-10 text-center text-muted-foreground">No events match your filters.</Card>
              ) : (
                filtered.map((e) => {
                  const role = roleByHost.get(e.host_id);
                  const host = memberships.find((m) => m.host_id === e.host_id)?.hosts;
                  return (
                    <Card key={e.id} className="glass flex flex-wrap items-center justify-between gap-4 p-5">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-lg font-semibold">{e.title}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${role === "host" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"}`}>{role}</span>
                          {e.status === "draft" && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">draft</span>}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {host?.name} • {format(new Date(e.start_at), "MMM d, yyyy • h:mm a")}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild><Link to={`/e/${e.slug}`}>View</Link></Button>
                        {role === "host" && (
                          <Button variant="outline" size="sm" asChild><Link to={`/host/events/${e.slug}/edit`}>Edit</Link></Button>
                        )}
                        <Button variant="outline" size="sm" asChild><Link to="/host/check-in">Check-in</Link></Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default MyEvents;
