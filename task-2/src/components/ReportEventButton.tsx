import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Flag } from "lucide-react";

export const ReportEventButton = ({ eventId }: { eventId: string }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!user) { toast.error("Sign in to report"); return; }
    setBusy(true);
    const { error } = await supabase.from("reports").insert({
      target_type: "event",
      target_id: eventId,
      event_id: eventId,
      reporter_id: user.id,
      reason: reason.trim().slice(0, 500) || null,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Report submitted. Thanks for letting us know.");
    setOpen(false);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Flag className="mr-1.5 h-3.5 w-3.5" /> Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this event</DialogTitle>
        </DialogHeader>
        <Textarea
          placeholder="Tell us what's wrong (optional)…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy} className="bg-gradient-primary">Submit report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
