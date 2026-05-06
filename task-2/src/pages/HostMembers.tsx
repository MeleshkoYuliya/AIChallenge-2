import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Copy, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";

type Role = "host" | "checker";
type Invite = { id: string; role: Role; token: string; expires_at: string | null; used_at: string | null; created_at: string };
type Member = { member_id: string; user_id: string; role: Role; display_name: string | null; contact_email: string | null; created_at: string };

const HostMembers = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [hostId, setHostId] = useState<string | null>(null);
  const [hostName, setHostName] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [newRole, setNewRole] = useState<Role>("checker");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth?redirect=/host/members"); return; }
    (async () => {
      const { data: mem } = await supabase
        .from("host_members")
        .select("host_id, hosts(id, name)")
        .eq("user_id", user.id)
        .eq("role", "host")
        .limit(1);
      if (!mem || mem.length === 0) { navigate("/host"); return; }
      const h = (mem[0] as any).hosts;
      setHostId(h.id);
      setHostName(h.name);
      await Promise.all([loadMembers(h.id), loadInvites(h.id)]);
      setPageLoading(false);
    })();
  }, [user, loading, navigate]);

  const loadMembers = async (hid: string) => {
    const { data, error } = await supabase.rpc("list_host_members", { _host_id: hid });
    if (error) { toast.error(error.message); return; }
    setMembers((data as any) || []);
  };

  const loadInvites = async (hid: string) => {
    const { data } = await supabase
      .from("host_invites")
      .select("id, role, token, expires_at, used_at, created_at")
      .eq("host_id", hid)
      .is("used_at", null)
      .order("created_at", { ascending: false });
    setInvites((data as any) || []);
  };

  const createInvite = async () => {
    if (!hostId || !user) return;
    setBusy(true);
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase
      .from("host_invites")
      .insert({ host_id: hostId, role: newRole, expires_at: expires, created_by: user.id });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Invite link created");
    loadInvites(hostId);
  };

  const revokeInvite = async (id: string) => {
    if (!hostId) return;
    const { error } = await supabase.from("host_invites").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Invite revoked");
    loadInvites(hostId);
  };

  const inviteUrl = (token: string) => `${window.location.origin}/invite/${token}`;

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(inviteUrl(token));
    toast.success("Link copied");
  };

  if (pageLoading) return <Layout><div className="text-muted-foreground">Loading…</div></Layout>;

  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-sm text-muted-foreground">{hostName}</div>
            <h1 className="font-display text-4xl font-bold">Team & invites</h1>
          </div>
          <Button variant="outline" asChild><Link to="/host">Back to dashboard</Link></Button>
        </div>

        <Card className="glass glow-border mt-8 p-6">
          <h2 className="font-display text-xl font-semibold">Create invite link</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <strong className="text-foreground">Host</strong> — full management access.{" "}
            <strong className="text-foreground">Checker</strong> — only check-in pages.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Select value={newRole} onValueChange={(v) => setNewRole(v as Role)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="checker">Checker</SelectItem>
                <SelectItem value="host">Host</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={createInvite} disabled={busy} className="bg-gradient-primary shadow-glow hover:opacity-90">
              <Plus className="mr-1.5 h-4 w-4" /> Create link
            </Button>
            <span className="text-xs text-muted-foreground">Links expire in 7 days, single-use.</span>
          </div>

          {invites.length > 0 && (
            <div className="mt-6 space-y-2">
              {invites.map((inv) => (
                <div key={inv.id} className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${inv.role === "host" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"}`}>
                    {inv.role}
                  </span>
                  <code className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{inviteUrl(inv.token)}</code>
                  <Button variant="ghost" size="icon" onClick={() => copyLink(inv.token)} aria-label="Copy link"><Copy className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => revokeInvite(inv.id)} aria-label="Revoke"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="glass mt-6 p-6">
          <h2 className="font-display text-xl font-semibold">Members</h2>
          <div className="mt-4 space-y-2">
            {members.map((m) => (
              <div key={m.member_id} className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-3">
                <div className="min-w-0">
                  <div className="font-medium">{m.display_name || m.contact_email || "Unknown"}</div>
                  <div className="text-xs text-muted-foreground">Joined {format(new Date(m.created_at), "MMM d, yyyy")}</div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${m.role === "host" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"}`}>
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default HostMembers;
