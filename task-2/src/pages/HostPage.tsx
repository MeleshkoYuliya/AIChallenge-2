import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { EventCard, EventCardData } from "@/components/EventCard";
import { SocialMeta } from "@/components/SocialMeta";

type Host = { id: string; name: string; slug: string; bio: string | null; logo_url: string | null; contact_email: string | null };

const HostPage = () => {
  const { slug } = useParams();
  const [host, setHost] = useState<Host | null>(null);
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: h } = await supabase.from("hosts").select("id, name, slug, bio, logo_url, contact_email").eq("slug", slug!).maybeSingle();
      setHost(h as any);
      if (h) {
        const { data: evs } = await supabase
          .from("events")
          .select("id, slug, title, cover_image_url, start_at, end_at, venue_address, online_url, capacity")
          .eq("host_id", (h as any).id)
          .eq("status", "published")
          .is("hidden_at", null)
          .order("start_at", { ascending: false });
        setEvents((evs as any) || []);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <Layout><div className="text-muted-foreground">Loading…</div></Layout>;
  if (!host) return <Layout><div>Host not found.</div></Layout>;

  return (
    <Layout>
      <SocialMeta
        title={`${host.name} · Host`}
        description={host.bio?.slice(0, 200) || `Events hosted by ${host.name}.`}
        image={host.logo_url}
        type="profile"
      />
      <div className="mb-10 flex flex-wrap items-center gap-5">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-primary text-3xl font-bold text-primary-foreground shadow-glow">
          {host.logo_url ? <img src={host.logo_url} alt={host.name} className="h-full w-full object-cover" /> : host.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-4xl font-bold">{host.name}</h1>
          {host.bio && <p className="mt-2 max-w-2xl text-muted-foreground">{host.bio}</p>}
          {host.contact_email && (
            <a href={`mailto:${host.contact_email}`} className="mt-2 inline-block text-sm text-primary hover:underline">
              {host.contact_email}
            </a>
          )}
        </div>
      </div>
      <h2 className="mb-4 font-display text-xl font-semibold">Events</h2>
      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          No published events yet.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      )}
    </Layout>
  );
};

export default HostPage;
