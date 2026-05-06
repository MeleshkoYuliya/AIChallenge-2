import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Star } from "lucide-react";

type Item = {
  id: string;
  rating: number;
  comment: string | null;
  user_id: string;
  created_at: string;
  profiles?: { display_name: string | null } | null;
};

export const EventFeedback = ({
  eventId,
  ended,
  userIsAttendee,
}: {
  eventId: string;
  ended: boolean;
  userIsAttendee: boolean;
}) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [mine, setMine] = useState<Item | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("event_feedback")
      .select("id, rating, comment, user_id, created_at, profiles(display_name)")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });
    const all = (data as any) || [];
    setItems(all);
    const own = user ? all.find((i: Item) => i.user_id === user.id) : null;
    setMine(own || null);
    if (own) {
      setRating(own.rating);
      setComment(own.comment || "");
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [eventId, user?.id]);

  const submit = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("event_feedback")
      .insert({ event_id: eventId, user_id: user.id, rating, comment: comment.trim() || null });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Thanks for your feedback!");
    load();
  };

  const avg = items.length ? items.reduce((s, i) => s + i.rating, 0) / items.length : 0;

  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl font-bold">Feedback</h2>
        {items.length > 0 && (
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{avg.toFixed(1)}</span> ★ · {items.length} {items.length === 1 ? "review" : "reviews"}
          </div>
        )}
      </div>

      {ended && user && userIsAttendee && !mine && (
        <Card className="glass mt-4 p-5">
          <div className="text-sm font-medium">How was the event?</div>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="p-1"
                aria-label={`${n} stars`}
              >
                <Star className={`h-6 w-6 ${n <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Share what stood out (optional)…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            className="mt-3"
          />
          <Button onClick={submit} disabled={busy} className="mt-3 bg-gradient-primary shadow-glow hover:opacity-90">
            Submit feedback
          </Button>
        </Card>
      )}

      {!ended && (
        <p className="mt-3 text-sm text-muted-foreground">Feedback opens after the event ends.</p>
      )}
      {ended && user && !userIsAttendee && !mine && (
        <p className="mt-3 text-sm text-muted-foreground">Only attendees can leave feedback.</p>
      )}

      <div className="mt-5 space-y-3">
        {items.map((i) => (
          <Card key={i.id} className="glass p-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={`h-4 w-4 ${n <= i.rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
                ))}
              </div>
              <div className="text-xs text-muted-foreground">{i.profiles?.display_name || "Attendee"}</div>
            </div>
            {i.comment && <p className="mt-2 text-sm text-foreground/90">{i.comment}</p>}
          </Card>
        ))}
      </div>
    </section>
  );
};
