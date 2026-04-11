import { useState, useEffect, useRef, useCallback } from "react";
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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Loader2 } from "lucide-react";

const UsernamePrompt = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  // Username availability state
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user || checked) return;
    const check = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username, display_name")
        .eq("user_id", user.id)
        .single();
      if (data) {
        if (!data.display_name || !data.username) {
          setStep(!data.display_name ? 1 : 2);
          setOpen(true);
        }
      }
      setChecked(true);
    };
    check();
  }, [user, checked]);

  const checkAvailability = useCallback((val: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (clean.length < 3) {
      setIsAvailable(null);
      setChecking(false);
      return;
    }
    setChecking(true);
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", clean)
        .maybeSingle();
      setIsAvailable(!data);
      setChecking(false);
    }, 400);
  }, []);

  const handleUsernameChange = (val: string) => {
    const clean = val.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
    setUsername(clean);
    setIsAvailable(null);
    checkAvailability(clean);
  };

  const handleNameSubmit = async () => {
    if (!name.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: name.trim() })
      .eq("user_id", user!.id);
    if (error) {
      toast({ title: "Error saving name", variant: "destructive" });
    } else {
      setStep(2);
    }
    setLoading(false);
  };

  const handleUsernameSubmit = async () => {
    if (username.length < 3 || !isAvailable) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("user_id", user!.id);
    if (error) {
      if (error.code === "23505") {
        setIsAvailable(false);
        toast({ title: "Username was just taken, try another", variant: "destructive" });
      } else {
        toast({ title: "Error saving username", variant: "destructive" });
      }
    } else {
      toast({ title: "You're all set!" });
      setOpen(false);
    }
    setLoading(false);
  };

  const usernameValid = username.length >= 3;
  const canConfirmUsername = usernameValid && isAvailable === true && !checking;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-sm" onPointerDownOutside={(e) => e.preventDefault()}>
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle>What's your name?</DialogTitle>
              <DialogDescription>
                This is how you'll appear on the platform.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="onboard-name" className="text-xs text-muted-foreground">Name</Label>
                <Input
                  id="onboard-name"
                  placeholder="e.g. Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10"
                  autoFocus
                />
              </div>
              <Button onClick={handleNameSubmit} disabled={loading || !name.trim()} className="w-full">
                {loading ? "Saving..." : "Continue"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Choose your permanent ID</DialogTitle>
              <DialogDescription>
                This will be your unique public username. It cannot be changed later.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="onboard-username" className="text-xs text-muted-foreground">Username</Label>
                <div className="relative">
                  <Input
                    id="onboard-username"
                    placeholder="e.g. janesmith"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    className="h-10 pr-9"
                    autoFocus
                  />
                  {usernameValid && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {checking ? (
                        <Loader2 size={14} className="animate-spin text-muted-foreground" />
                      ) : isAvailable === true ? (
                        <Check size={14} className="text-green-500" />
                      ) : isAvailable === false ? (
                        <X size={14} className="text-destructive" />
                      ) : null}
                    </div>
                  )}
                </div>
                <div className="h-4">
                  {usernameValid && !checking && isAvailable === true && (
                    <p className="text-xs text-green-500">Username is available</p>
                  )}
                  {usernameValid && !checking && isAvailable === false && (
                    <p className="text-xs text-destructive">This username is already taken</p>
                  )}
                  {username.length > 0 && username.length < 3 && (
                    <p className="text-xs text-muted-foreground">Must be at least 3 characters</p>
                  )}
                </div>
              </div>
              <Button onClick={handleUsernameSubmit} disabled={loading || !canConfirmUsername} className="w-full">
                {loading ? "Saving..." : "Confirm"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UsernamePrompt;
