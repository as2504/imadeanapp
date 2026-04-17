import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { X, Sparkles } from "lucide-react";

const STORAGE_KEY = "imaa_referral_banner_dismissed";

const ReferralBanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    if (localStorage.getItem(STORAGE_KEY) === "1") return;
    supabase
      .from("profiles")
      .select("is_verified, referrals_count")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data && !(data as any).is_verified) {
          setCount((data as any).referrals_count || 0);
          setShow(true);
        }
      });
  }, [user]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed top-14 left-0 right-0 z-30 bg-primary/10 border-b border-primary/20 px-4 py-2">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2 text-xs sm:text-sm text-foreground hover:text-primary transition-colors text-left flex-1 min-w-0"
        >
          <Sparkles size={14} className="text-primary shrink-0" />
          <span className="truncate">
            <span className="font-bold">Invite 3 builders</span>
            <span className="text-muted-foreground hidden sm:inline"> to unlock the Verified badge — </span>
            <span className="text-primary font-semibold">{count}/3</span>
          </span>
        </button>
        <button
          onClick={dismiss}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default ReferralBanner;
