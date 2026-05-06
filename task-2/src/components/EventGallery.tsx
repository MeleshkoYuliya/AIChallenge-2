import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Flag, Image as ImageIcon, Check, X } from "lucide-react";

type Photo = {
  id: string;
  image_url: string;
  caption: string | null;
  status: "pending" | "approved" | "rejected";
  user_id: string;
  hidden_at: string | null;
};

export const EventGallery = ({
  eventId,
  isHost,
}: {
  eventId: string;
  isHost: boolean;
}) => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase
      .from("event_photos")
      .select("id, image_url, caption, status, user_id, hidden_at")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });
    setPhotos((data as any) || []);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [eventId, user?.id]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 8 * 1024 * 1024) { toast.error("Max file size 8MB"); return; }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${eventId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("event-photos").upload(path, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("event-photos").getPublicUrl(path);
      const { error } = await supabase.from("event_photos").insert({
        event_id: eventId,
        user_id: user.id,
        image_url: urlData.publicUrl,
        storage_path: path,
      });
      if (error) throw error;
      toast.success("Photo uploaded — pending host approval");
      load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const moderate = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("event_photos").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(status === "approved" ? "Photo approved" : "Photo rejected");
    load();
  };

  const reportPhoto = async (id: string) => {
    if (!user) { toast.error("Sign in to report"); return; }
    const reason = prompt("Why are you reporting this photo?");
    if (reason === null) return;
    const { error } = await supabase.from("reports").insert({
      target_type: "photo",
      target_id: id,
      event_id: eventId,
      reporter_id: user.id,
      reason: reason.slice(0, 500) || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Report submitted");
  };

  const visible = photos.filter((p) => p.status === "approved" && !p.hidden_at);
  const mine = user ? photos.filter((p) => p.user_id === user.id && p.status !== "approved") : [];
  const pendingForHost = isHost ? photos.filter((p) => p.status === "pending") : [];

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Gallery</h2>
        {user && (
          <>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
            <Button variant="outline" size="sm" disabled={busy} onClick={() => fileRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" /> Upload photo
            </Button>
          </>
        )}
      </div>

      {visible.length === 0 ? (
        <Card className="glass mt-4 p-8 text-center text-muted-foreground">
          <ImageIcon className="mx-auto mb-2 h-8 w-8 opacity-50" />
          No photos yet. Be the first to share!
        </Card>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {visible.map((p) => (
            <div key={p.id} className="group relative overflow-hidden rounded-xl border border-border/60">
              <img src={p.image_url} alt={p.caption || "Event photo"} className="aspect-square w-full object-cover" />
              <button
                onClick={() => reportPhoto(p.id)}
                className="absolute right-2 top-2 rounded-full bg-background/70 p-1.5 opacity-0 transition group-hover:opacity-100"
                aria-label="Report photo"
              >
                <Flag className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {mine.length > 0 && (
        <div className="mt-6">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Your uploads</div>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {mine.map((p) => (
              <div key={p.id} className="relative overflow-hidden rounded-lg border border-border/60">
                <img src={p.image_url} alt="" className="aspect-square w-full object-cover opacity-70" />
                <span className="absolute inset-x-0 bottom-0 bg-background/80 p-1 text-center text-[10px] capitalize">
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingForHost.length > 0 && (
        <div className="mt-8">
          <div className="text-sm font-semibold">Pending approval ({pendingForHost.length})</div>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {pendingForHost.map((p) => (
              <Card key={p.id} className="glass overflow-hidden">
                <img src={p.image_url} alt="" className="aspect-square w-full object-cover" />
                <div className="flex gap-2 p-2">
                  <Button size="sm" className="flex-1 bg-gradient-primary" onClick={() => moderate(p.id, "approved")}>
                    <Check className="mr-1 h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => moderate(p.id, "rejected")}>
                    <X className="mr-1 h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
