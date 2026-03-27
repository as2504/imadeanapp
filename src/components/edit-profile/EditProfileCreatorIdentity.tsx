import { Check, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const roles = ["Builder", "Indie Hacker", "AI Developer", "Designer", "Creator", "Engineer"] as const;
const interests = [
    "AI",
    "Productivity",
    "Dev Tools",
    "SaaS",
    "Open Source",
    "Web3",
    "Design",
    "Mobile",
    "Automation",
    "Education",
] as const;

interface EditProfileCreatorIdentityProps {
    tagline: string;
    selectedRoles: string[];
    selectedInterests: string[];
    onTaglineChange: (v: string) => void;
    onRolesChange: (roles: string[]) => void;
    onInterestsChange: (interests: string[]) => void;
}

const Chip = ({
    label,
    selected,
    onClick,
}: {
    label: string;
    selected: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 select-none border-2 ${selected
                ? "bg-primary/5 border-primary text-primary shadow-sm"
                : "bg-surface/40 border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"
            }`}
    >
        {selected && (
            <Check
                size={12}
                strokeWidth={3}
            />
        )}
        {label}
    </button>
);

const EditProfileCreatorIdentity = ({
    tagline,
    selectedRoles,
    selectedInterests,
    onTaglineChange,
    onRolesChange,
    onInterestsChange,
}: EditProfileCreatorIdentityProps) => {
    const toggleRole = (role: string) => {
        onRolesChange(
            selectedRoles.includes(role)
                ? selectedRoles.filter((r) => r !== role)
                : [...selectedRoles, role]
        );
    };

    const toggleInterest = (interest: string) => {
        onInterestsChange(
            selectedInterests.includes(interest)
                ? selectedInterests.filter((i) => i !== interest)
                : [...selectedInterests, interest]
        );
    };

    return (
        <section className="animate-reveal animate-reveal-delay-1">
            {/* Tagline */}
            <div className="mb-8 space-y-3">
                <Label htmlFor="tagline" className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                    <Info size={11} /> Personal Tagline
                </Label>
                <Input
                    id="tagline"
                    value={tagline}
                    onChange={(e) => onTaglineChange(e.target.value)}
                    className="h-10 bg-surface/30 border-border/40 focus:bg-background transition-all font-medium text-sm italic"
                    placeholder="e.g. Shipping fast, vibing faster 🚀"
                    maxLength={80}
                />
            </div>

            {/* Roles */}
            <div className="mb-10">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 block">
                    Your Primary Roles
                </Label>
                <div className="flex flex-wrap gap-2.5">
                    {roles.map((role) => (
                        <Chip
                            key={role}
                            label={role}
                            selected={selectedRoles.includes(role)}
                            onClick={() => toggleRole(role)}
                        />
                    ))}
                </div>
            </div>

            {/* Interests */}
            <div>
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 block">
                    Areas of Interest
                </Label>
                <div className="flex flex-wrap gap-2.5">
                    {interests.map((interest) => (
                        <Chip
                            key={interest}
                            label={interest}
                            selected={selectedInterests.includes(interest)}
                            onClick={() => toggleInterest(interest)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default EditProfileCreatorIdentity;
