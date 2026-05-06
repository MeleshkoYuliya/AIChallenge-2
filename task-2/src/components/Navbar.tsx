import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sparkles, Menu } from "lucide-react";

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isChecker, setIsChecker] = useState(false);

  useEffect(() => {
    if (!user) { setIsChecker(false); return; }
    (async () => {
      const { data } = await supabase
        .from("host_members")
        .select("id")
        .eq("user_id", user.id)
        .in("role", ["host", "checker"])
        .limit(1);
      setIsChecker(!!data && data.length > 0);
    })();
  }, [user]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `transition-colors hover:text-foreground ${isActive ? "text-foreground" : "text-muted-foreground"}`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-muted ${
      isActive ? "bg-muted text-foreground" : "text-muted-foreground"
    }`;

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass border-b border-border/40">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="text-gradient">Lumi</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
            <NavLink to="/explore" className={navLinkClass}>Explore</NavLink>
            {user && (
              <>
                <NavLink to="/tickets" className={navLinkClass}>My Tickets</NavLink>
                <NavLink to="/my-events" className={navLinkClass}>My Events</NavLink>
                {isChecker && (
                  <NavLink to="/host/check-in" className={navLinkClass}>Check-in</NavLink>
                )}
                <NavLink to="/host" className={navLinkClass}>Host</NavLink>
                <NavLink to="/host/profile" className={navLinkClass}>Profile</NavLink>
              </>
            )}
          </nav>

          {/* Desktop auth actions */}
          <div className="hidden items-center gap-2 lg:flex">
            {user ? (
              <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate("/"); }}>
                Sign out
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button variant="default" size="sm" className="bg-gradient-primary shadow-glow hover:opacity-90" asChild>
                  <Link to="/auth?mode=signup">Get started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile/Tablet burger */}
          <div className="lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[340px]">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    <span className="text-gradient font-display">Lumi</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1">
                  <NavLink to="/explore" className={mobileLinkClass} onClick={closeMenu}>Explore</NavLink>
                  {user && (
                    <>
                      <NavLink to="/tickets" className={mobileLinkClass} onClick={closeMenu}>My Tickets</NavLink>
                      <NavLink to="/my-events" className={mobileLinkClass} onClick={closeMenu}>My Events</NavLink>
                      {isChecker && (
                        <NavLink to="/host/check-in" className={mobileLinkClass} onClick={closeMenu}>Check-in</NavLink>
                      )}
                      <NavLink to="/host" className={mobileLinkClass} onClick={closeMenu}>Host</NavLink>
                      <NavLink to="/host/profile" className={mobileLinkClass} onClick={closeMenu}>Profile</NavLink>
                    </>
                  )}
                </nav>
                <div className="mt-6 flex flex-col gap-2 border-t border-border/40 pt-6">
                  {user ? (
                    <Button
                      variant="outline"
                      onClick={async () => { closeMenu(); await signOut(); navigate("/"); }}
                    >
                      Sign out
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" asChild onClick={closeMenu}>
                        <Link to="/auth">Sign in</Link>
                      </Button>
                      <Button className="bg-gradient-primary shadow-glow hover:opacity-90" asChild onClick={closeMenu}>
                        <Link to="/auth?mode=signup">Get started</Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
