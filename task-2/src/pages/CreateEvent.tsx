import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ImageUpload } from "@/components/ImageUpload";
import { TimezoneSelect } from "@/components/TimezoneSelect";
import { zonedToUTC, utcToZoned } from "@/lib/timezone";
import { z } from "zod";
import { cn } from "@/lib/utils";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60) ||
  Math.random().toString(36).slice(2, 8);

const makeSchema = (isEdit: boolean) =>
  z
    .object({
      title: z.string().trim().min(3, "Title must be at least 3 characters").max(120, "Title must be under 120 characters"),
      description: z.string().trim().max(5000, "Description must be under 5000 characters").optional().or(z.literal("")),
      coverUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
      startAt: z.string().min(1, "Start time is required"),
      endAt: z.string().min(1, "End time is required"),
      timezone: z.string().min(1, "Timezone is required"),
      venue: z.string().trim().max(255).optional().or(z.literal("")),
      onlineUrl: z.string().trim().url("Must be a valid URL (https://…)").optional().or(z.literal("")),
      capacity: z.number({ invalid_type_error: "Capacity is required" }).int("Whole number only").min(1, "At least 1 seat").max(100000, "Max 100,000"),
      contactEmail: z.string().trim().email("Enter a valid email").max(255).optional().or(z.literal("")),
    })
    .superRefine((d, ctx) => {
      const startUTC = zonedToUTC(d.startAt, d.timezone);
      const endUTC = zonedToUTC(d.endAt, d.timezone);
      if (!isEdit && startUTC.getTime() < Date.now() - 60_000) {
        ctx.addIssue({ code: "custom", path: ["startAt"], message: "Start must be in the future" });
      }
      if (endUTC.getTime() <= startUTC.getTime()) {
        ctx.addIssue({ code: "custom", path: ["endAt"], message: "End must be after start" });
      }
      if (!(d.venue && d.venue.trim()) && !(d.onlineUrl && d.onlineUrl.trim())) {
        ctx.addIssue({ code: "custom", path: ["venue"], message: "Provide a venue address or an online link" });
      }
    });

type FieldErrors = Partial<Record<"title" | "description" | "coverUrl" | "startAt" | "endAt" | "timezone" | "venue" | "onlineUrl" | "capacity" | "contactEmail", string>>;

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="mt-1.5 text-xs font-medium text-destructive">{msg}</p> : null;

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { slug: editSlug } = useParams();
  const isEdit = !!editSlug;
  const [eventId, setEventId] = useState<string | null>(null);
  const [hostId, setHostId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [timezone, setTimezone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [venue, setVenue] = useState("");
  const [onlineUrl, setOnlineUrl] = useState("");
  const [capacity, setCapacity] = useState<number>(50);
  const [contactEmail, setContactEmail] = useState("");
  const [unlisted, setUnlisted] = useState(false);
  const [publish, setPublish] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [authError, setAuthError] = useState<"not_found" | "forbidden" | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!user) return;
    if (isEdit) {
      (async () => {
        const { data: ev, error } = await supabase
          .from("events")
          .select("*")
          .eq("slug", editSlug!)
          .maybeSingle();
        if (error || !ev) { setAuthError("not_found"); setLoading(false); return; }
        const { data: mem } = await supabase
          .from("host_members")
          .select("host_id")
          .eq("user_id", user.id)
          .eq("host_id", ev.host_id)
          .eq("role", "host")
          .maybeSingle();
        if (!mem) { setAuthError("forbidden"); setLoading(false); return; }
        setEventId(ev.id);
        setHostId(ev.host_id);
        setTitle(ev.title);
        setDescription(ev.description || "");
        setCoverUrl(ev.cover_image_url || "");
        setTimezone(ev.timezone);
        setStartAt(utcToZoned(ev.start_at, ev.timezone));
        setEndAt(utcToZoned(ev.end_at, ev.timezone));
        setVenue(ev.venue_address || "");
        setOnlineUrl(ev.online_url || "");
        setCapacity(ev.capacity);
        setContactEmail(ev.contact_email || "");
        setUnlisted(ev.visibility === "unlisted");
        setPublish(ev.status === "published");
        setLoading(false);
      })();
    } else {
      supabase
        .from("host_members")
        .select("host_id")
        .eq("user_id", user.id)
        .eq("role", "host")
        .limit(1)
        .then(({ data }) => {
          if (data && data.length) setHostId(data[0].host_id);
          else navigate("/host");
        });
    }
  }, [user, navigate, isEdit, editSlug]);

  const validate = () => {
    const result = makeSchema(isEdit).safeParse({
      title, description, coverUrl, startAt, endAt, timezone, venue, onlineUrl, capacity, contactEmail,
    });
    if (result.success) { setErrors({}); return result.data; }
    const fe: FieldErrors = {};
    for (const issue of result.error.issues) {
      const k = issue.path[0] as keyof FieldErrors;
      if (k && !fe[k]) fe[k] = issue.message;
    }
    setErrors(fe);
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = validate();
    if (!valid || !hostId || !user) return;
    setBusy(true);
    const payload = {
      title: valid.title,
      description: valid.description || null,
      cover_image_url: valid.coverUrl || null,
      start_at: zonedToUTC(valid.startAt, valid.timezone).toISOString(),
      end_at: zonedToUTC(valid.endAt, valid.timezone).toISOString(),
      timezone: valid.timezone,
      venue_address: valid.venue || null,
      online_url: valid.onlineUrl || null,
      capacity: valid.capacity,
      contact_email: valid.contactEmail || null,
      visibility: unlisted ? ("unlisted" as const) : ("public" as const),
      status: publish ? ("published" as const) : ("draft" as const),
    };

    if (isEdit && eventId) {
      const { error, data } = await supabase.from("events").update(payload).eq("id", eventId).select().single();
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      toast.success("Event updated!");
      navigate(`/e/${data.slug}`);
    } else {
      const slug = slugify(valid.title) + "-" + Math.random().toString(36).slice(2, 6);
      const { error, data } = await supabase.from("events").insert({
        ...payload,
        host_id: hostId,
        slug,
        created_by: user.id,
      }).select().single();
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      toast.success("Event created!");
      navigate(`/e/${data.slug}`);
    }
  };

  const errCls = (k: keyof FieldErrors) =>
    errors[k] ? "border-destructive focus-visible:ring-destructive" : "";

  if (loading) return <Layout><div className="text-muted-foreground">Loading…</div></Layout>;

  if (authError) {
    const isForbidden = authError === "forbidden";
    return (
      <Layout>
        <div className="mx-auto max-w-md text-center">
          <h1 className="font-display text-4xl font-bold">{isForbidden ? "Access denied" : "Event not found"}</h1>
          <p className="mt-3 text-muted-foreground">
            {isForbidden
              ? "You don't have permission to edit this event. Only members of the host team can make changes."
              : "We couldn't find this event. It may have been removed or the link is incorrect."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate("/host")}>Back to dashboard</Button>
            {isForbidden && (
              <Button onClick={() => navigate(`/e/${editSlug}`)} className="bg-gradient-primary shadow-glow hover:opacity-90">View event</Button>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl font-bold">{isEdit ? "Edit event" : "Create event"}</h1>
        <Card className="glass glow-border mt-8 p-6">
          <form onSubmit={onSubmit} noValidate className="space-y-5">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="Founders Friday Mixer" className={cn(errCls("title"))} aria-invalid={!!errors.title} />
              <FieldError msg={errors.title} />
            </div>
            <div>
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" rows={5} value={description} maxLength={5000} onChange={(e) => setDescription(e.target.value)} placeholder="What's happening?" className={cn(errCls("description"))} aria-invalid={!!errors.description} />
              <FieldError msg={errors.description} />
            </div>
            <div>
              <Label>Cover image</Label>
              <ImageUpload value={coverUrl} onChange={setCoverUrl} />
              <FieldError msg={errors.coverUrl} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="start">Starts</Label>
                <Input id="start" type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className={cn(errCls("startAt"))} aria-invalid={!!errors.startAt} />
                <FieldError msg={errors.startAt} />
              </div>
              <div>
                <Label htmlFor="end">Ends</Label>
                <Input id="end" type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className={cn(errCls("endAt"))} aria-invalid={!!errors.endAt} />
                <FieldError msg={errors.endAt} />
              </div>
            </div>
            <div>
              <Label>Timezone</Label>
              <TimezoneSelect value={timezone} onChange={setTimezone} className={cn(errCls("timezone"))} />
              <FieldError msg={errors.timezone} />
            </div>
            <div>
              <Label htmlFor="venue">Venue address</Label>
              <Input id="venue" value={venue} maxLength={255} onChange={(e) => setVenue(e.target.value)} placeholder="123 Main St, City" className={cn(errCls("venue"))} aria-invalid={!!errors.venue} />
              <FieldError msg={errors.venue} />
            </div>
            <div>
              <Label htmlFor="online">…or online link</Label>
              <Input id="online" value={onlineUrl} onChange={(e) => setOnlineUrl(e.target.value)} placeholder="https://meet…" className={cn(errCls("onlineUrl"))} aria-invalid={!!errors.onlineUrl} />
              <FieldError msg={errors.onlineUrl} />
            </div>
            <div>
              <Label htmlFor="cap">Capacity</Label>
              <Input id="cap" type="number" min={1} max={100000} value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value) || 0)} className={cn(errCls("capacity"))} aria-invalid={!!errors.capacity} />
              <FieldError msg={errors.capacity} />
            </div>
            <div>
              <Label htmlFor="cemail">Contact email</Label>
              <Input id="cemail" type="email" value={contactEmail} maxLength={255} onChange={(e) => setContactEmail(e.target.value)} placeholder="organizer@example.com" className={cn(errCls("contactEmail"))} aria-invalid={!!errors.contactEmail} />
              <p className="mt-1 text-xs text-muted-foreground">Where attendees can reach you about this event.</p>
              <FieldError msg={errors.contactEmail} />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <div className="font-medium">Unlisted</div>
                <div className="text-xs text-muted-foreground">Hidden from Explore; accessible by link</div>
              </div>
              <Switch checked={unlisted} onCheckedChange={setUnlisted} />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <div className="font-medium">{isEdit ? "Published" : "Publish immediately"}</div>
                <div className="text-xs text-muted-foreground">Otherwise saved as draft</div>
              </div>
              <Switch checked={publish} onCheckedChange={setPublish} />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border p-4 opacity-70">
              <div>
                <div className="font-medium">Pricing</div>
                <div className="text-xs text-muted-foreground">Free</div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span><Switch disabled /></span>
                </TooltipTrigger>
                <TooltipContent>Paid events — coming soon</TooltipContent>
              </Tooltip>
            </div>

            <Button disabled={busy} className="w-full bg-gradient-primary shadow-glow hover:opacity-90">
              {busy ? (isEdit ? "Saving…" : "Creating…") : isEdit ? "Save changes" : "Create event"}
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateEvent;
