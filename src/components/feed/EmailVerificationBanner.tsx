import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, X } from "lucide-react";
import { toast } from "sonner";

const EmailVerificationBanner = () => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);

  if (!user || dismissed) return null;

  // Check if email is confirmed
  const emailConfirmedAt = user.email_confirmed_at;
  if (emailConfirmedAt) return null;

  const handleResend = async () => {
    if (!user.email) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email: user.email });
      if (error) throw error;
      toast.success("Verification email sent! Check your inbox.");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend verification email");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <AlertCircle size={16} className="text-amber-500 shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-400 truncate">
          Please verify your email address.{" "}
          <button
            onClick={handleResend}
            disabled={resending}
            className="font-semibold underline hover:no-underline"
          >
            {resending ? "Sending..." : "Resend link"}
          </button>
        </p>
      </div>
      <button onClick={() => setDismissed(true)} className="text-amber-500 hover:text-amber-600 shrink-0">
        <X size={14} />
      </button>
    </div>
  );
};

export default EmailVerificationBanner;
