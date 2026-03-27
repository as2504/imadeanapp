import { CheckCircle2, Zap, Eye, Heart, AppWindow } from "lucide-react";

interface PreviewData {
    username: string;
    fullName: string;
    bio: string;
    tagline: string;
    avatarUrl: string | null;
    selectedRoles: string[];
}

interface EditProfilePreviewProps {
    data: PreviewData;
}

const EditProfilePreview = ({ data }: EditProfilePreviewProps) => {
    const initial = (data.fullName || data.username || "U").charAt(0).toUpperCase();

    return (
        <section className="animate-reveal animate-reveal-delay-2">
            {/* Preview card */}
            <div className="relative rounded-[2rem] border border-border/40 bg-white p-6 sm:p-8 shadow-lg shadow-primary/5 overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-accent/5 rounded-full blur-2xl pointer-events-none" />

                <div className="relative flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-[30%] overflow-hidden shrink-0 shadow-md border-2 border-white">
                        {data.avatarUrl ? (
                            <img
                                src={data.avatarUrl}
                                alt="Avatar preview"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 flex items-center justify-center">
                                <span className="text-2xl font-bold text-primary/40 tracking-tighter">{initial}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        {/* Name row */}
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-0.5">
                            <h4 className="text-xl font-black text-foreground tracking-tight truncate">
                                {data.username || "username"}
                            </h4>
                            <CheckCircle2 size={16} className="text-primary fill-primary/10 shrink-0" />
                        </div>

                        {/* Full name */}
                        <p className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest px-0.5">
                            {data.fullName || "Display Name"}
                        </p>

                        {/* Bio */}
                        <p className="text-xs text-foreground/80 mt-3 leading-relaxed max-w-md mx-auto sm:mx-0">
                            {data.bio || "Crafting experiences with code and vibes…"}
                        </p>

                        {/* Tagline */}
                        {data.tagline && (
                            <div className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-0.5 rounded-full bg-primary/5 text-primary text-[10px] font-bold italic">
                                <span className="not-italic opacity-40">“</span>
                                {data.tagline}
                                <span className="not-italic opacity-40">”</span>
                            </div>
                        )}

                        {/* Role chips */}
                        {data.selectedRoles.length > 0 && (
                            <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-5">
                                {data.selectedRoles.map((role) => (
                                    <span
                                        key={role}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface border border-border/40 text-[9px] font-bold text-foreground uppercase tracking-wider"
                                    >
                                        <Zap size={9} className="text-amber-500 fill-amber-500/20" />
                                        {role}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Stats Strip */}
                        <div className="flex items-center justify-center sm:justify-start gap-5 mt-6 pt-5 border-t border-border/30">
                            <div className="flex flex-col items-center sm:items-start">
                                <span className="text-base font-black text-foreground leading-none">12</span>
                                <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">Apps</span>
                            </div>
                            <div className="flex flex-col items-center sm:items-start">
                                <span className="text-base font-black text-foreground leading-none">2.3K</span>
                                <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">Likes</span>
                            </div>
                            <div className="flex flex-col items-center sm:items-start">
                                <span className="text-base font-black text-foreground leading-none">8.1K</span>
                                <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">Views</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EditProfilePreview;
