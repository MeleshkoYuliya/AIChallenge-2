import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles, Calendar, ScanLine, User } from "lucide-react";

type Role = "attendee" | "host" | "checker";

const Auth = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">(params.get("mode") === "signup" ? "signup" : "signin");
  const [role, setRole] = useState<Role>((params.get("role") as Role) || "attendee");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const redirectParam = params.get("redirect");

  const destinationFor = (r: Role) => {
    if (redirectParam) return redirectParam;
    if (r === "host") return "/host";
    if (r === "checker") return "/host/check-in";
    return "/";
  };

  useEffect(() => {
    if (!loading && user) navigate(destinationFor(role), { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const dest = destinationFor(role);
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${dest}`,
            data: { display_name: name || email.split("@")[0], intended_role: role },
          },
        });
        if (error) throw error;
        if (role === "checker") {
          toast.success("Account created — ask a host for an invite link to start checking in.");
        } else if (role === "host") {
          toast.success("Welcome! Set up your host profile to start creating events.");
        } else {
          toast.success("Welcome to Lumi!");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const roleOptions: { value: Role; label: string; desc: string; icon: typeof User }[] = [
    { value: "attendee", label: "Attendee", desc: "RSVP and collect tickets", icon: User },
    { value: "host", label: "Host", desc: "Create and manage events", icon: Calendar },
    { value: "checker", label: "Checker", desc: "Scan tickets at the door (invite required)", icon: ScanLine },
  ];

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 font-display text-2xl font-bold">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="text-gradient">Lumi</span>
        </Link>
        <Card className="glass glow-border p-8 shadow-elegant">
          <h1 className="mb-1 font-display text-2xl font-bold">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            {mode === "signup" ? "Choose how you'll use Lumi." : "Sign in to RSVP, host, or check in."}
          </p>

          {mode === "signup" && (
            <div className="mb-5">
              <Label className="mb-2 block">I want to register as</Label>
              <div className="grid gap-2">
                {roleOptions.map((opt) => {
                  const Icon = opt.icon;
                  const active = role === opt.value;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setRole(opt.value)}
                      className={`flex items-start gap-3 rounded-lg border p-3 text-left transition ${
                        active ? "border-primary bg-primary/5 shadow-glow" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md ${active ? "bg-gradient-primary" : "bg-muted"}`}>
                        <Icon className={`h-4 w-4 ${active ? "text-primary-foreground" : "text-muted-foreground"}`} />
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium">{opt.label}</div>
                        <div className="text-xs text-muted-foreground">{opt.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="name">Display name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Kim" />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-gradient-primary shadow-glow hover:opacity-90">
              {submitting ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : "New to Lumi?"}{" "}
            <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="font-medium text-primary hover:underline">
              {mode === "signup" ? "Sign in" : "Create account"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
