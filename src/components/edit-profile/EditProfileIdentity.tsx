import { MapPin, Briefcase, Info, User, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProfileData {
    username: string;
    fullName: string;
    gender: string;
    dob: string;
    title: string;
    location: string;
    bio: string;
    avatarUrl: string | null;
}

interface EditProfileIdentityProps {
    data: ProfileData;
    onChange: (field: keyof ProfileData, value: string) => void;
}

const EditProfileIdentity = ({
    data,
    onChange,
}: EditProfileIdentityProps) => {
    return (
        <section className="animate-reveal space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                        Display Name
                    </Label>
                    <Input
                        id="fullName"
                        value={data.fullName}
                        onChange={(e) => onChange("fullName", e.target.value)}
                        className="h-10 bg-surface/30 border-border/40 focus:bg-background transition-all"
                        placeholder="Your full name"
                    />
                </div>

                {/* Gender */}
                <div className="space-y-2">
                    <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-bold flex items-center gap-1.5">
                        <User size={10} /> Gender
                    </Label>
                    <Select value={data.gender} onValueChange={(val) => onChange("gender", val)}>
                        <SelectTrigger className="h-10 bg-surface/30 border-border/40 focus:bg-background transition-all rounded-xl text-sm">
                            <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Non-binary">Non-binary</SelectItem>
                            <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* DOB */}
                <div className="space-y-2">
                    <Label htmlFor="dob" className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-bold flex items-center gap-1.5">
                        <Calendar size={10} /> Date of Birth
                    </Label>
                    <Input
                        id="dob"
                        type="date"
                        value={data.dob}
                        onChange={(e) => onChange("dob", e.target.value)}
                        className="h-10 bg-surface/30 border-border/40 focus:bg-background transition-all text-sm"
                    />
                </div>

                {/* Professional Title */}
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-bold flex items-center gap-1.5">
                        <Briefcase size={10} /> Professional Title
                    </Label>
                    <Input
                        id="title"
                        value={data.title}
                        onChange={(e) => onChange("title", e.target.value)}
                        className="h-10 bg-surface/30 border-border/40 focus:bg-background transition-all font-medium"
                        placeholder="e.g. Indie Hacker"
                    />
                </div>

                {/* Location */}
                <div className="space-y-2">
                    <Label htmlFor="location" className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-bold flex items-center gap-1.5">
                        <MapPin size={10} /> Location
                    </Label>
                    <Input
                        id="location"
                        value={data.location}
                        onChange={(e) => onChange("location", e.target.value)}
                        className="h-10 bg-surface/30 border-border/40 focus:bg-background transition-all"
                        placeholder="City, Country"
                    />
                </div>

                {/* Bio - Full width */}
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio" className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-bold flex items-center gap-1.5">
                        <Info size={10} /> Bio
                    </Label>
                    <Textarea
                        id="bio"
                        value={data.bio}
                        onChange={(e) => onChange("bio", e.target.value)}
                        className="min-h-[100px] bg-surface/30 border-border/40 focus:bg-background transition-all resize-none text-sm leading-relaxed"
                        placeholder="Tell the world about what you build…"
                        maxLength={160}
                    />
                    <div className="flex justify-end">
                        <span className="text-[10px] text-muted-foreground/40">{data.bio.length}/160</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EditProfileIdentity;
