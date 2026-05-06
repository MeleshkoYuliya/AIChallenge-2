import { useEffect, useState, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { toast } from "sonner";

export const HostRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { setChecking(false); return; }
    (async () => {
      const { data, error } = await supabase
        .from("host_members")
        .select("id")
        .eq("user_id", user.id)
        .eq("role", "host")
        .limit(1);
      if (!error && data && data.length > 0) setIsHost(true);
      setChecking(false);
    })();
  }, [user, loading]);

  if (loading || checking) {
    return <Layout><div className="text-muted-foreground">Loading…</div></Layout>;
  }

  if (!user) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!isHost) {
    toast.error("You need to be a host to access that page.");
    return <Navigate to="/host" replace />;
  }

  return <>{children}</>;
};
