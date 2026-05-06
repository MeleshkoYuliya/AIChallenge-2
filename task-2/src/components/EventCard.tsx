import { Link } from "react-router-dom";
import { MapPin, Users, Star } from "lucide-react";
import { format } from "date-fns";

export type EventCardData = {
  id: string;
  slug: string;
  title: string;
  cover_image_url: string | null;
  start_at: string;
  end_at: string;
  venue_address: string | null;
  online_url: string | null;
  capacity: number;
  hosts?: { name: string; slug: string } | null;
  rating_avg?: number | null;
  rating_count?: number | null;
};

export const EventCard = ({ event }: { event: EventCardData }) => {
  const start = new Date(event.start_at);
  const ended = new Date(event.end_at) < new Date();
  return (
    <Link
      to={`/e/${event.slug}`}
      className="group block overflow-hidden rounded-2xl border border-border/60 bg-card/40 backdrop-blur transition hover:border-primary/50 hover:shadow-glow"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
        {event.cover_image_url ? (
          <img src={event.cover_image_url} alt={event.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-gradient-primary opacity-70" />
        )}
        {ended && (
          <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            Ended
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-primary">
          {format(start, "EEE, MMM d • h:mm a")}
        </div>
        <h3 className="font-display text-lg font-semibold leading-snug line-clamp-2">{event.title}</h3>
        {event.hosts && (
          <p className="mt-1 text-sm text-muted-foreground">by {event.hosts.name}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {event.online_url ? "Online" : event.venue_address?.split(",")[0] || "TBA"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {event.capacity} seats
          </span>
          {event.rating_count ? (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <span className="font-medium text-foreground">{event.rating_avg?.toFixed(1)}</span>
              <span>({event.rating_count})</span>
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
};
