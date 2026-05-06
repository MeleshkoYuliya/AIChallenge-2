import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link, Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Flag, EyeOff, Check, Image as ImageIcon, Calendar } from "lucide-react";
import { format } from "date-fns";

type Report = {
  id: string;
  target_type: "event" | "photo";
  target_id: string;
  event_id: string | null;
  reason: string | null;
  status: "open" | "resolved" | "hidden";
  created_at: string;
};

const HostModeration = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [eventTitles, setEventTitles] = useState<Record<string, { title: string; slug: string; hidden_at: string | null }>>({});
  const [photos, setPhotos] = useState<Record<string, { image_url: string; hidden_at: string | null }>>({});

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("reports")
      .select("id, target_type, target_id, event_id, reason, status, created_at")
      .order("created_at", { ascending: false });
    const list = (data as Report[]) || [];
    setReports(list);

    const evIds = Array.from(new Set(list.map((r) => r.event_id).filter(Boolean) as string[]));
    if (evIds.length) {
      const { data: evs } = await supabase
        .from("events")
        .select("id, title, slug, hidden_at")
        .in("id", evIds);
      const m: typeof eventTitles = {};
      (evs || []).forEach((e: any) => { m[e.id] = { title: e.title, slug: e.slug, hidden_at: e.hidden_at }; });
      setEventTitles(m);
    }
    const photoIds = list.filter((r) => r.target_type === "photo").map((r) => r.target_id);
    if (photoIds.length) {
      const { data: ps } = await supabase
        .from("event_photos")
        .select("id, image_url, hidden_at")
        .in("id", photoIds);
      const m: typeof photos = {};
      (ps || []).forEach((p: any) => { m[p.id] = { image_url: p.image_url, hidden_at: p.hidden_at }; });
      setPhotos(m);
    }
    setLoading(false);
  };

  useEffect(() => { if (!authLoading) load(); /* eslint-disable-next-line */ }, [authLoading, user?.id]);

  const updateReport = async (id: string, status: Report["status"]) => {
    const { error } = await supabase
      .from("reports")
      .update({ status, resolved_by: user?.id, resolved_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Report updated");
    load();
  };

  const hideTarget = async (r: Report) => {
    if (r.target_type === "event") {
      const { error } = await supabase.from("events").update({ hidden_at: new Date().toISOString() }).eq("id", r.target_id);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from("event_photos").update({ hidden_at: new Date().toISOString() }).eq("id", r.target_id);
      if (error) { toast.error(error.message); return; }
    }
    await updateReport(r.id, "hidden");
  };

  if (authLoading || loading) {
    return <Layout><div className="text-muted-foreground">Loading…</div></Layout>;
  }
  if (!user) return <Navigate to="/auth?redirect=/host/moderation" replace />;

  const open = reports.filter((r) => r.status === "open");
  const closed = reports.filter((r) => r.status !== "open");

  const renderReport = (r: Report) => {
    const ev = r.event_id ? eventTitles[r.event_id] : null;
    const ph = r.target_type === "photo" ? photos[r.target_id] : null;
    return (
      <Card key={r.id} className="glass p-4">
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted">
            {r.target_type === "photo" ? <ImageIcon className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <Flag className="h-3 w-3" /> {r.target_type} report · {format(new Date(r.created_at), "MMM d, h:mm a")}
            </div>
            <div className="mt-1 font-medium">
              {ev ? (
                <Link to={`/e/${ev.slug}`} className="hover:underline">{ev.title}</Link>
              ) : (
                <span className="text-muted-foreground">Unknown event</span>
              )}
            </div>
            {ph && (
              <img src={ph.image_url} alt="" className="mt-2 h-32 w-32 rounded-lg object-cover" />
            )}
            {r.reason && <p className="mt-2 text-sm text-foreground/90">{r.reason}</p>}
            <div className="mt-1 text-xs text-muted-foreground">
              Status: <span className="capitalize">{r.status}</span>
              {r.target_type === "event" && ev?.hidden_at && " · event hidden"}
              {r.target_type === "photo" && ph?.hidden_at && " · photo hidden"}
            </div>
          </div>
        </div>
        {r.status === "open" && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => hideTarget(r)}>
              <EyeOff className="mr-1.5 h-3.5 w-3.5" /> Hide {r.target_type}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => updateReport(r.id, "resolved")}>
              <Check className="mr-1.5 h-3.5 w-3.5" /> Dismiss
            </Button>
          </div>
        )}
      </Card>
    );
  };

  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3">
          <Flag className="h-7 w-7 text-primary" />
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Moderation queue</h1>
        </div>
        <p className="mt-2 text-muted-foreground">Review reported events and photos for hosts you manage.</p>

        <Tabs defaultValue="open" className="mt-6">
          <TabsList>
            <TabsTrigger value="open">Open ({open.length})</TabsTrigger>
            <TabsTrigger value="closed">Closed ({closed.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="open" className="mt-4 space-y-3">
            {open.length === 0 ? (
              <Card className="glass p-8 text-center text-muted-foreground">Nothing to review. 🎉</Card>
            ) : open.map(renderReport)}
          </TabsContent>
          <TabsContent value="closed" className="mt-4 space-y-3">
            {closed.length === 0 ? (
              <Card className="glass p-8 text-center text-muted-foreground">No closed reports.</Card>
            ) : closed.map(renderReport)}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default HostModeration;
