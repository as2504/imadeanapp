import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { History, Calendar } from "lucide-react";

interface AppUpdate {
  id: string;
  version_notes: string;
  created_at: string;
  user_id: string;
}

interface AppUpdateHistoryProps {
  appId: string;
}

const AppUpdateHistory = ({ appId }: AppUpdateHistoryProps) => {
  const [updates, setUpdates] = useState<AppUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      const { data, error } = await (supabase as any)
        .from("app_updates")
        .select("*")
        .eq("app_id", appId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching updates:", error);
      } else {
        setUpdates(data || []);
      }
      setLoading(false);
    };

    fetchUpdates();
  }, [appId]);

  if (loading) {
    return <div className="py-10 text-center"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>;
  }

  if (updates.length === 0) {
    return (
      <div className="text-center py-12 bg-secondary/30 rounded-[2rem] border border-dashed border-border/40">
        <History size={32} className="mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em]">No update history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <History size={16} className="text-primary" />
        <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">Release Timeline</h3>
      </div>

      <div className="space-y-4 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-px before:bg-border/40">
        {updates.map((update, i) => (
          <div key={update.id} className="relative pl-12 pb-2 group">
            <div className="absolute left-0 top-1 w-9 h-9 rounded-full bg-card border border-border/40 flex items-center justify-center z-10 shadow-sm group-hover:border-primary/40 transition-colors">
              <Calendar size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            
            <div className="bg-card border border-border/40 rounded-2xl p-5 shadow-sm group-hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2.5 py-1 rounded-lg">
                  Update #{updates.length - i}
                </span>
                <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
                  {new Date(update.created_at).toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                {update.version_notes}
              </p>
            </div>
          </div>
        ))}

        {/* Initial Release Node */}
        <div className="relative pl-12 group">
          <div className="absolute left-0 top-1 w-9 h-9 rounded-full bg-secondary border border-border/40 flex items-center justify-center z-10">
            <RocketIcon size={14} className="text-muted-foreground/40" />
          </div>
          <div className="py-2.5">
             <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Initial Release Launched</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const RocketIcon = ({ size, className }: any) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3" />
    <path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5" />
  </svg>
);

export default AppUpdateHistory;
