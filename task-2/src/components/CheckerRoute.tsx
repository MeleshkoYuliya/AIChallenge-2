import { useEffect, useState, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";

export const CheckerRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { setChecking(false); return; }
    (async () => {
      const { data } = await supabase
        .from("host_members")
        .select("id")
        .eq("user_id", user.id)
        .in("role", ["host", "checker"])
        .limit(1);
      setAllowed(!!data && data.length > 0);
      setChecking(false);
    })();
  }, [user, loading]);

  if (loading || checking) {
    return <Layout><div className="text-muted-foreground">Loading…</div></Layout>;
  }
  if (!user) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (!allowed) {
    return (
      <Layout>
        <div className="mx-auto max-w-md text-center">
          <h1 className="font-display text-3xl font-bold">Access denied</h1>
          <p className="mt-3 text-muted-foreground">
            You need to be a Host or Checker to access this page.
          </p>
        </div>
      </Layout>
    );
  }
  return <>{children}</>;
};
