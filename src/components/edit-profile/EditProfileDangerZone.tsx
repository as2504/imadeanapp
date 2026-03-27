import { RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const EditProfileDangerZone = () => {
    return (
        <section className="animate-reveal animate-reveal-delay-3">
            <div className="h-px bg-border/30 mb-10" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-medium text-muted-foreground/50 uppercase tracking-wider">
                        Danger Zone
                    </p>
                    <p className="text-xs text-muted-foreground/40 mt-1">
                        These actions are irreversible
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs h-8 px-4 text-muted-foreground hover:text-foreground border-border/50"
                    >
                        <RotateCcw size={13} className="mr-1.5" />
                        Reset Profile
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-xs h-8 px-4 text-destructive/70 hover:text-destructive hover:bg-destructive/5"
                    >
                        <Trash2 size={13} className="mr-1.5" />
                        Delete Account
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default EditProfileDangerZone;
