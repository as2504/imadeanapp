import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Copy, Check, CheckCircle2, Users, Sparkles } from "lucide-react";
import XIcon from "@/components/icons/XIcon";
import { useToast } from "@/hooks/use-toast";

interface ReferralRow {
  id: string;
  status: "pending" | "signed_up" | "qualified";
  created_at: string;
  qualified_at: string | null;
  referred_user_id: string | null;
}

const GOAL = 3;

const ReferralSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string>("");
  const [isVerified, setIsVerified] = useState(false);
  const [qualified, setQualified] = useState(0);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [referredProfiles, setReferredProfiles] = useState<Record<string, { username: string | null; avatar_url: string | null }>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code, is_verified, referrals_count")
        .eq("user_id", user.id)
        .maybeSingle();
      if (profile) {
        setReferralCode(profile.referral_code || "");
        setIsVerified(!!profile.is_verified);
        setQualified(profile.referrals_count || 0);
      }

      const { data: refs } = await supabase
        .from("referrals")
        .select("id, status, created_at, qualified_at, referred_user_id")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });
      const list = (refs || []) as ReferralRow[];
      setReferrals(list);

      const ids = list.map((r) => r.referred_user_id).filter(Boolean) as string[];
      if (ids.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, username, avatar_url")
          .in("user_id", ids);
        const map: Record<string, { username: string | null; avatar_url: string | null }> = {};
        (profs || []).forEach((p: any) => {
          map[p.user_id] = { username: p.username, avatar_url: p.avatar_url };
        });
        setReferredProfiles(map);
      }
    };
    load();
  }, [user]);

  const inviteUrl = referralCode
    ? `https://imadeanapp.com/auth?ref=${referralCode}`
    : "";

  const handleCopy = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast({ title: "Copied!", description: "Invite link copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(
      `I'm publishing my apps on imadeanapp, the home for vibe-coded apps. Join me 👇\n\n${inviteUrl}`,
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const progress = Math.min(100, (qualified / GOAL) * 100);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="space-y-1">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          Invite builders
          {isVerified && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={10} /> Verified
            </span>
          )}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Get {GOAL} friends to publish their app on imadeanapp and unlock the{" "}
          <span className="text-primary font-semibold">Verified</span> badge.
        </p>
      </div>

      {/* Progress card */}
      <div className="rounded-2xl border border-border/40 bg-muted/20 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-foreground">
            {qualified} / {GOAL} qualified invites
          </p>
          {isVerified ? (
            <span className="text-[10px] font-bold text-primary inline-flex items-center gap-1">
              <Sparkles size={10} /> Unlocked
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground">
              {GOAL - qualified} to go
            </span>
          )}
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-[10px] text-muted-foreground">
          A referral qualifies when your invitee signs up <em>and</em> publishes their first app.
        </p>
      </div>

      {/* Invite link */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-foreground">Your invite link</p>
          <button
            onClick={handleShareTwitter}
            disabled={!inviteUrl}
            title="Share on X"
            aria-label="Share on X"
            className="w-8 h-8 rounded-full inline-flex items-center justify-center text-foreground hover:bg-secondary/80 disabled:opacity-40 transition-colors"
          >
            <XIcon size={14} />
          </button>
        </div>
        <div className="flex gap-2">
          <input
            readOnly
            value={inviteUrl}
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-border/40 bg-background text-foreground font-mono"
          />
          <Button size="sm" onClick={handleCopy} variant="outline" className="h-9 gap-1.5">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      {/* Referrals list */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Users size={12} /> Your referrals ({referrals.length})
        </p>
        {referrals.length === 0 ? (
          <div className="text-center py-8 rounded-xl border border-dashed border-border/40">
            <p className="text-xs text-muted-foreground">No invites yet — share your link.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/40 divide-y divide-border/40 overflow-hidden">
            {referrals.map((r) => {
              const prof = r.referred_user_id ? referredProfiles[r.referred_user_id] : null;
              const handle = prof?.username
                ? `@${prof.username}`
                : r.referred_user_id
                ? `Builder #${r.referred_user_id.slice(0, 6)}`
                : "Pending signup";
              const initial = (prof?.username || "B").charAt(0).toUpperCase();
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between px-4 py-2.5 bg-muted/10 gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0 text-[11px] font-semibold text-foreground">
                      {prof?.avatar_url ? (
                        <img src={prof.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        initial
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{handle}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      r.status === "qualified"
                        ? "bg-primary/10 text-primary"
                        : r.status === "signed_up"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {r.status === "qualified"
                      ? "✓ Qualified"
                      : r.status === "signed_up"
                      ? "Signed up"
                      : "Pending"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralSection;
