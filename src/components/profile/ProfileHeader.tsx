import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Settings, Share2, CheckCircle2, Zap } from "lucide-react";

const ProfileHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";
  const username = user?.email?.split("@")[0] || "user";

  return (
    <div className="relative rounded-[2rem] bg-card border border-border/40 overflow-hidden shadow-xl">
      {/* Background/Banner Area */}
      <div className="h-32 sm:h-40 bg-gradient-to-br from-primary/20 via-primary/5 to-background relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 scale-125 rotate-12">
          <Zap size={120} className="text-primary fill-primary" />
        </div>
      </div>

      {/* Profile Info Area */}
      <div className="px-6 sm:px-8 pb-8 -mt-12 relative z-10">
        <div className="flex flex-col sm:flex-row items-end gap-5">
          {/* Avatar - Improved Squircle */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] bg-background border-4 border-card flex items-center justify-center text-4xl font-black text-primary shadow-xl overflow-hidden">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <button 
              onClick={() => navigate("/edit-profile")}
              className="absolute bottom-1 right-1 p-2 bg-primary text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all group/edit"
            >
              <Settings size={16} className="group-hover/edit:rotate-90 transition-transform duration-500" />
            </button>
          </div>

          {/* Info & Actions */}
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-none uppercase">
                    {username}
                  </h1>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                    <CheckCircle2 size={12} className="text-primary" />
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                      Verified Builder
                    </span>
                  </div>
                </div>

                <p className="text-base font-bold text-muted-foreground">{displayName}</p>
                
                <p className="text-sm text-muted-foreground/80 max-w-xl leading-relaxed font-medium">
                  Building the next generation of vibe-coded AI tools. Empowering creators through high-fidelity design. ⚡
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button 
                  onClick={() => navigate("/publish")}
                  className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/10 transition-all active:scale-95"
                >
                  Publish App
                </Button>
                <button className="p-2.5 bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground rounded-xl border border-border/40 transition-all active:scale-95">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
