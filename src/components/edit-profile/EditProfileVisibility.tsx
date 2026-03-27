import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface VisibilityOption {
    key: string;
    label: string;
    description: string;
    enabled: boolean;
}

interface EditProfileVisibilityProps {
    options: VisibilityOption[];
    onToggle: (key: string) => void;
}

const EditProfileVisibility = ({ options, onToggle }: EditProfileVisibilityProps) => {
    return (
        <section className="animate-reveal animate-reveal-delay-2">
            <div className="mb-8">
                <h3 className="text-lg font-bold text-foreground tracking-tight">
                    Privacy & Visibility
                </h3>
                <p className="text-xs text-muted-foreground/70 mt-1">
                    Control how your profile information is shared
                </p>
            </div>

            <div className="space-y-4">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 block">
                    Public Visibility
                </Label>
                
                <div className="space-y-1">
                    {options.map((opt) => (
                        <div
                            key={opt.key}
                            className="flex items-center justify-between p-4 rounded-2xl bg-surface/30 border border-border/40 hover:bg-surface/50 transition-all duration-300"
                        >
                            <div className="pr-4">
                                <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                                <p className="text-[11px] text-muted-foreground/60 mt-1 leading-relaxed">
                                    {opt.description}
                                </p>
                            </div>
                            <Switch
                                checked={opt.enabled}
                                onCheckedChange={() => onToggle(opt.key)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default EditProfileVisibility;
