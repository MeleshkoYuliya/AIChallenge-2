import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

type InviteInfo = { id: string; role: "host" | "checker"; expires_at: string | null; used_at: string | null; host_id: string };

const InviteAccept = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [hostName, setHostName] = useState<string>("");
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const { data, error } = await supabase
        .from("host_invites")
        .select("id, role, expires_at, used_at, host_id, hosts(name)")
        .eq("token", token)
        .maybeSingle();
      if (error || !data) { setError("Invalid or revoked invite link."); setPageLoading(false); return; }
      const inv = data as any;
      if (inv.used_at) setError("This invite has already been used.");
      else if (inv.expires_at && new Date(inv.expires_at) < new Date()) setError("This invite has expired.");
      setInvite(inv);
      setHostName(inv.hosts?.name || "");
      setPageLoading(false);
    })();
  }, [token]);

  const accept = async () => {
    if (!user) { navigate(`/auth?redirect=/invite/${token}`); return; }
    setBusy(true);
    const { error } = await supabase.rpc("redeem_host_invite", { _token: token! });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`You've joined ${hostName} as ${invite?.role}!`);
    if (invite?.role === "host") navigate("/host");
    else navigate("/host/check-in");
  };

  if (pageLoading || loading) return <Layout><div className="text-muted-foreground">Loading…</div></Layout>;

  return (
    <Layout>
      <div className="mx-auto max-w-md">
        <Card className="glass glow-border p-8 text-center">
          {error ? (
            <>
              <h1 className="font-display text-3xl font-bold">Invite unavailable</h1>
              <p className="mt-3 text-muted-foreground">{error}</p>
              <Button asChild variant="outline" className="mt-6"><Link to="/">Go home</Link></Button>
            </>
          ) : (
            <>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">You're invited</div>
              <h1 className="mt-2 font-display text-3xl font-bold">{hostName}</h1>
              <p className="mt-3 text-muted-foreground">
                Join as <strong className="text-foreground">{invite?.role === "host" ? "Host" : "Checker"}</strong>.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {invite?.role === "host"
                  ? "Full access: create events, manage members, view dashboard."
                  : "Check-in access only for this team's events."}
              </p>
              <Button onClick={accept} disabled={busy} className="mt-6 w-full bg-gradient-primary shadow-glow hover:opacity-90">
                {busy ? "Joining…" : user ? "Accept invite" : "Sign in to accept"}
              </Button>
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default InviteAccept;
