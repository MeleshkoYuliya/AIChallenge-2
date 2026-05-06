import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Calendar, Download } from "lucide-react";
import { format } from "date-fns";
import { toCSV, downloadCSV } from "@/lib/csv";

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60) || Math.random().toString(36).slice(2, 8);

type HostRow = { id: string; name: string; slug: string; bio: string | null };
type EventRow = { id: string; slug: string; title: string; start_at: string; end_at: string; status: string; capacity: number };

const HostDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [host, setHost] = useState<HostRow | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [stats, setStats] = useState<Record<string, { going: number; waitlist: number; checked: number }>>({});
  const [creating, setCreating] = useState(false);
  const [hostName, setHostName] = useState("");
  const [hostBio, setHostBio] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [exportingId, setExportingId] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth?redirect=/host"); return; }
    (async () => {
      const { data: memberships } = await supabase
        .from("host_members")
        .select("host_id, role, hosts(id, name, slug, bio)")
        .eq("user_id", user.id)
        .eq("role", "host")
        .limit(1);
      if (memberships && memberships.length > 0) {
        const h = (memberships[0] as any).hosts;
        setHost(h);
        const { data: evs } = await supabase
          .from("events")
          .select("id, slug, title, start_at, end_at, status, capacity")
          .eq("host_id", h.id)
          .order("start_at", { ascending: false });
        setEvents((evs as any) || []);
        if (evs && evs.length) {
          const { data: rs } = await supabase
            .from("rsvps")
            .select("event_id, status")
            .in("event_id", evs.map((e: any) => e.id));
          const map: Record<string, { going: number; waitlist: number; checked: number }> = {};
          (rs || []).forEach((r: any) => {
            map[r.event_id] = map[r.event_id] || { going: 0, waitlist: 0, checked: 0 };
            if (r.status === "going") map[r.event_id].going++;
            if (r.status === "waitlist") map[r.event_id].waitlist++;
            if (r.status === "checked_in") { map[r.event_id].going++; map[r.event_id].checked++; }
          });
          setStats(map);
        }
      }
      setPageLoading(false);
    })();
  }, [user, loading, navigate]);

  const onCreateHost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    const slug = slugify(hostName) + "-" + Math.random().toString(36).slice(2, 6);
    const { data: h, error } = await supabase
      .from("hosts")
      .insert({ name: hostName, slug, bio: hostBio, contact_email: user.email, created_by: user.id })
      .select()
      .single();
    if (error) { toast.error(error.message); setCreating(false); return; }
    const { error: mErr } = await supabase
      .from("host_members")
      .insert({ host_id: h.id, user_id: user.id, role: "host" });
    setCreating(false);
    if (mErr) { toast.error(mErr.message); return; }
    toast.success("Host profile created!");
    setHost(h as any);
  };

  const exportEventCSV = async (ev: EventRow) => {
    setExportingId(ev.id);
    try {
      const { data: rsvps, error } = await supabase
        .from("rsvps")
        .select("user_id, status, checked_in_at, created_at")
        .eq("event_id", ev.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      const userIds = Array.from(new Set((rsvps || []).map((r: any) => r.user_id)));
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, display_name, contact_email")
        .in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);
      const pmap = new Map<string, { display_name: string | null; contact_email: string | null }>();
      (profs || []).forEach((p: any) => pmap.set(p.id, p));
      const rows = (rsvps || []).map((r: any) => {
        const p = pmap.get(r.user_id);
        return [
          p?.display_name || "",
          p?.contact_email || "",
          r.status,
          r.checked_in_at ? new Date(r.checked_in_at).toISOString() : "",
        ];
      });
      const csv = toCSV(["Name", "Email", "RSVP Status", "Check-in Time"], rows);
      downloadCSV(`${ev.slug}-attendees.csv`, csv);
      toast.success("CSV downloaded");
    } catch (e: any) {
      toast.error(e.message || "Export failed");
    } finally {
      setExportingId(null);
    }
  };

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    return {
      upcoming: events.filter((e) => new Date(e.end_at).getTime() >= now)
        .sort((a, b) => +new Date(a.start_at) - +new Date(b.start_at)),
      past: events.filter((e) => new Date(e.end_at).getTime() < now),
    };
  }, [events]);

  if (pageLoading) return <Layout><div className="text-muted-foreground">Loading…</div></Layout>;

  if (!host) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl">
          <h1 className="font-display text-4xl font-bold">Become a host</h1>
          <p className="mt-2 text-muted-foreground">Create your host profile to start publishing events.</p>
          <Card className="glass glow-border mt-8 p-6">
            <form onSubmit={onCreateHost} className="space-y-4">
              <div>
                <Label htmlFor="hname">Host name</Label>
                <Input id="hname" required value={hostName} onChange={(e) => setHostName(e.target.value)} placeholder="Acme Community" />
              </div>
              <div>
                <Label htmlFor="hbio">Short bio</Label>
                <Textarea id="hbio" value={hostBio} onChange={(e) => setHostBio(e.target.value)} placeholder="What you're about" rows={3} />
              </div>
              <Button disabled={creating} className="w-full bg-gradient-primary shadow-glow hover:opacity-90">
                {creating ? "Creating…" : "Create host profile"}
              </Button>
            </form>
          </Card>
        </div>
      </Layout>
    );
  }

  const renderEvent = (e: EventRow) => {
    const s = stats[e.id] || { going: 0, waitlist: 0, checked: 0 };
    const ended = new Date(e.end_at) < new Date();
    return (
      <Card key={e.id} className="glass flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-semibold">{e.title}</h3>
            <span className={`rounded-full px-2 py-0.5 text-xs ${e.status === "published" ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}`}>
              {e.status}
            </span>
            {ended && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Ended</span>}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">{format(new Date(e.start_at), "MMM d, yyyy • h:mm a")}</div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="text-center"><div className="font-display text-xl font-bold">{s.going}</div><div className="text-xs text-muted-foreground">Going</div></div>
          <div className="text-center"><div className="font-display text-xl font-bold">{s.waitlist}</div><div className="text-xs text-muted-foreground">Waitlist</div></div>
          <div className="text-center"><div className="font-display text-xl font-bold">{s.checked}</div><div className="text-xs text-muted-foreground">Checked-in</div></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild><Link to={`/e/${e.slug}`}>View</Link></Button>
          <Button variant="outline" size="sm" asChild><Link to={`/host/events/${e.slug}/edit`}>Edit</Link></Button>
          <Button variant="outline" size="sm" onClick={() => exportEventCSV(e)} disabled={exportingId === e.id}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            {exportingId === e.id ? "Exporting…" : "CSV"}
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Hosting as</div>
          <h1 className="font-display text-4xl font-bold">{host.name}</h1>
          <div className="mt-1 flex flex-wrap gap-3 text-sm">
            <Link to={`/h/${host.slug}`} className="text-primary hover:underline">View public page →</Link>
            <Link to="/host/profile" className="text-muted-foreground hover:text-foreground">Edit profile</Link>
            <Link to="/host/members" className="text-muted-foreground hover:text-foreground">Team & invites</Link>
            <Link to="/host/check-in" className="text-muted-foreground hover:text-foreground">Check-in</Link>
            <Link to="/host/moderation" className="text-muted-foreground hover:text-foreground">Moderation</Link>
            <Link to="/my-events" className="text-muted-foreground hover:text-foreground">My events</Link>
          </div>
        </div>
        <Button asChild className="bg-gradient-primary shadow-glow hover:opacity-90">
          <Link to="/host/events/new"><Plus className="mr-2 h-4 w-4" /> New event</Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="glass p-12 text-center text-muted-foreground">
          <Calendar className="mx-auto mb-3 h-8 w-8 opacity-50" />
          No events yet. Create your first event to get started.
        </Card>
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-4 grid gap-4">
            {upcoming.length === 0 ? (
              <Card className="glass p-8 text-center text-muted-foreground">No upcoming events.</Card>
            ) : upcoming.map(renderEvent)}
          </TabsContent>
          <TabsContent value="past" className="mt-4 grid gap-4">
            {past.length === 0 ? (
              <Card className="glass p-8 text-center text-muted-foreground">No past events yet.</Card>
            ) : past.map(renderEvent)}
          </TabsContent>
        </Tabs>
      )}
    </Layout>
  );
};

export default HostDashboard;
