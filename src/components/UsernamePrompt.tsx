import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const UsernamePrompt = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user || checked) return;
    const check = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", user.id)
        .single();
      if (data && !data.username) setOpen(true);
      setChecked(true);
    };
    check();
  }, [user, checked]);

  const handleSubmit = async () => {
    const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (clean.length < 3) {
      toast({ title: "Username must be at least 3 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    // Check uniqueness
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", clean)
      .maybeSingle();
    if (existing) {
      toast({ title: "Username already taken", variant: "destructive" });
      setLoading(false);
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ username: clean })
      .eq("user_id", user!.id);
    if (error) {
      toast({ title: "Error saving username", variant: "destructive" });
    } else {
      toast({ title: "Username set!" });
      setOpen(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-sm" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Choose a username</DialogTitle>
          <DialogDescription>
            Pick a unique username to complete your profile.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Input
            placeholder="e.g. janesmith"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
            className="h-10"
          />
          <Button onClick={handleSubmit} disabled={loading || username.length < 3} className="w-full">
            {loading ? "Saving..." : "Set Username"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UsernamePrompt;
