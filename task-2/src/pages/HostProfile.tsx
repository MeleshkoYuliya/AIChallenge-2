import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name must be under 80 characters"),
  bio: z.string().trim().max(500, "Bio must be under 500 characters").optional().or(z.literal("")),
  contact_email: z.string().trim().email("Enter a valid email").max(255),
  logo_url: z.string().url().optional().or(z.literal("")),
});
type FieldErrors = Partial<Record<keyof z.infer<typeof schema>, string>>;

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="mt-1.5 text-xs font-medium text-destructive">{msg}</p> : null;

const HostProfile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [hostId, setHostId] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth?redirect=/host/profile"); return; }
    (async () => {
      const { data } = await supabase
        .from("host_members")
        .select("host_id, hosts(id, slug, name, bio, contact_email, logo_url)")
        .eq("user_id", user.id)
        .eq("role", "host")
        .limit(1);
      if (!data || data.length === 0) { navigate("/host"); return; }
      const h = (data[0] as any).hosts;
      setHostId(h.id);
      setSlug(h.slug);
      setName(h.name || "");
      setBio(h.bio || "");
      setEmail(h.contact_email || "");
      setLogoUrl(h.logo_url || "");
      setPageLoading(false);
    })();
  }, [user, loading, navigate]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ name, bio, contact_email: email, logo_url: logoUrl });
    if (!result.success) {
      const fe: FieldErrors = {};
      for (const i of result.error.issues) {
        const k = i.path[0] as keyof FieldErrors;
        if (k && !fe[k]) fe[k] = i.message;
      }
      setErrors(fe);
      return;
    }
    setErrors({});
    if (!hostId) return;
    setBusy(true);
    const { error } = await supabase
      .from("hosts")
      .update({
        name: result.data.name,
        bio: result.data.bio || null,
        contact_email: result.data.contact_email,
        logo_url: result.data.logo_url || null,
      })
      .eq("id", hostId);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile updated");
  };

  if (pageLoading) return <Layout><div className="text-muted-foreground">Loading…</div></Layout>;

  const errCls = (k: keyof FieldErrors) =>
    errors[k] ? "border-destructive focus-visible:ring-destructive" : "";

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-4xl font-bold">Host profile</h1>
          {slug && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/h/${slug}`}>View public page →</Link>
            </Button>
          )}
        </div>
        <p className="mt-2 text-muted-foreground">This is what attendees see on your public host page.</p>

        <Card className="glass glow-border mt-8 p-6">
          <form onSubmit={onSave} noValidate className="space-y-5">
            <div>
              <Label>Logo</Label>
              <div className="flex items-start gap-4">
                <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-primary text-2xl font-bold text-primary-foreground shadow-glow">
                  {logoUrl ? <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" /> : (name.charAt(0) || "?")}
                </div>
                <div className="flex-1">
                  <ImageUpload value={logoUrl} onChange={setLogoUrl} />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} className={cn(errCls("name"))} aria-invalid={!!errors.name} />
              <FieldError msg={errors.name} />
            </div>

            <div>
              <Label htmlFor="bio">Short bio</Label>
              <Textarea id="bio" rows={4} value={bio} maxLength={500} onChange={(e) => setBio(e.target.value)} placeholder="Tell people who you are" className={cn(errCls("bio"))} aria-invalid={!!errors.bio} />
              <p className="mt-1 text-xs text-muted-foreground">{bio.length}/500</p>
              <FieldError msg={errors.bio} />
            </div>

            <div>
              <Label htmlFor="email">Contact email</Label>
              <Input id="email" type="email" value={email} maxLength={255} onChange={(e) => setEmail(e.target.value)} className={cn(errCls("contact_email"))} aria-invalid={!!errors.contact_email} />
              <FieldError msg={errors.contact_email} />
            </div>

            <Button disabled={busy} className="w-full bg-gradient-primary shadow-glow hover:opacity-90">
              {busy ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default HostProfile;
