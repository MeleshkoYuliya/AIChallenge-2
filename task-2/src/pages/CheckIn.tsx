import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Calendar, ScanLine } from "lucide-react";
import { format } from "date-fns";

type EvRow = { id: string; slug: string; title: string; start_at: string; end_at: string; host_id: string; hosts: { name: string } | null };

const CheckIn = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EvRow[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: mems } = await supabase
        .from("host_members")
        .select("host_id")
        .eq("user_id", user.id);
      const hostIds = (mems || []).map((m: any) => m.host_id);
      if (hostIds.length === 0) { setPageLoading(false); return; }
      const { data: evs } = await supabase
        .from("events")
        .select("id, slug, title, start_at, end_at, host_id, hosts(name)")
        .in("host_id", hostIds)
        .gte("end_at", new Date().toISOString())
        .order("start_at", { ascending: true });
      setEvents((evs as any) || []);
      setPageLoading(false);
    })();
  }, [user]);

  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3">
          <ScanLine className="h-7 w-7 text-primary" />
          <h1 className="font-display text-4xl font-bold">Check-in</h1>
        </div>
        <p className="mt-2 text-muted-foreground">Pick an event to scan attendee passes.</p>

        <div className="mt-8 grid gap-3">
          {pageLoading ? (
            <div className="text-muted-foreground">Loading…</div>
          ) : events.length === 0 ? (
            <Card className="glass p-12 text-center text-muted-foreground">
              <Calendar className="mx-auto mb-3 h-8 w-8 opacity-50" />
              No upcoming events to check in.
            </Card>
          ) : (
            events.map((e) => (
              <Link key={e.id} to={`/host/check-in/${e.slug}`} className="block">
                <Card className="glass flex items-center justify-between gap-4 p-5 transition hover:border-primary/40">
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">{e.hosts?.name}</div>
                    <div className="font-display text-lg font-semibold">{e.title}</div>
                    <div className="text-sm text-muted-foreground">{format(new Date(e.start_at), "EEE, MMM d • h:mm a")}</div>
                  </div>
                  <span className="text-sm text-primary">Open →</span>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CheckIn;
