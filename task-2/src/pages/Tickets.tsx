import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import QRCode from "qrcode";
import { format } from "date-fns";

type TicketRow = {
  id: string;
  status: string;
  qr_code: string;
  waitlist_position: number | null;
  events: { slug: string; title: string; start_at: string; end_at: string; venue_address: string | null; online_url: string | null };
};

const TicketCard = ({ t }: { t: TicketRow }) => {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    if (t.status === "going" || t.status === "checked_in") {
      QRCode.toString(t.qr_code, { type: "svg", margin: 1, color: { dark: "#ffffff", light: "#0000" } }).then(setSvg);
    }
  }, [t]);
  return (
    <Card className="glass glow-border flex flex-wrap items-center gap-6 p-5">
      <div className="grid h-28 w-28 place-items-center rounded-xl bg-card p-2">
        {svg ? <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: svg }} /> : <span className="text-xs text-muted-foreground text-center">{t.status === "waitlist" ? `Waitlist #${t.waitlist_position}` : t.status}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs uppercase tracking-wide text-primary">{format(new Date(t.events.start_at), "EEE, MMM d • h:mm a")}</div>
        <Link to={`/e/${t.events.slug}`} className="mt-1 block font-display text-xl font-semibold hover:underline">{t.events.title}</Link>
        <div className="mt-1 text-sm text-muted-foreground">{t.events.online_url ? "Online" : t.events.venue_address || "Venue TBA"}</div>
      </div>
    </Card>
  );
};

const Tickets = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth?redirect=/tickets"); return; }
    (async () => {
      const { data } = await supabase
        .from("rsvps")
        .select("id, status, qr_code, waitlist_position, events!inner(slug, title, start_at, end_at, venue_address, online_url)")
        .eq("user_id", user.id)
        .in("status", ["going", "waitlist", "checked_in"])
        .gte("events.end_at", new Date().toISOString())
        .order("created_at", { ascending: false });
      setTickets((data as any) || []);
      setPageLoading(false);
    })();
  }, [user, loading, navigate]);

  return (
    <Layout>
      <h1 className="font-display text-4xl font-bold">My Tickets</h1>
      <p className="mt-2 text-muted-foreground">Your upcoming RSVPs and waitlist spots.</p>
      <div className="mt-8 grid gap-4">
        {pageLoading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : tickets.length === 0 ? (
          <Card className="glass p-12 text-center text-muted-foreground">
            No upcoming tickets. <Link to="/explore" className="text-primary hover:underline">Explore events →</Link>
          </Card>
        ) : (
          tickets.map((t) => <TicketCard key={t.id} t={t} />)
        )}
      </div>
    </Layout>
  );
};

export default Tickets;
