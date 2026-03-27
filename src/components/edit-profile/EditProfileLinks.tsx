import { useState, useRef, useEffect } from "react";
import { Github, Twitter, Linkedin, Globe, Plus, Pencil, Trash2, Link as LinkIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface SocialLink {
    id: string;
    platform: string;
    url: string;
}

interface EditProfileLinksProps {
    links: SocialLink[];
    onChange: (links: SocialLink[]) => void;
}

const platforms = [
    { id: "github", label: "GitHub", icon: <Github size={14} /> },
    { id: "twitter", label: "Twitter", icon: <Twitter size={14} /> },
    { id: "linkedin", label: "LinkedIn", icon: <Linkedin size={14} /> },
    { id: "website", label: "Website", icon: <Globe size={14} /> },
];

const platformIcons: Record<string, React.ReactNode> = {
    github: <Github size={14} />,
    twitter: <Twitter size={14} />,
    linkedin: <Linkedin size={14} />,
    website: <Globe size={14} />,
    other: <LinkIcon size={14} />,
};

const platformColors: Record<string, string> = {
    github: "bg-gray-900/5 text-gray-900 border-gray-900/10",
    twitter: "bg-sky-500/8 text-sky-600 border-sky-500/10",
    linkedin: "bg-blue-600/8 text-blue-600 border-blue-600/10",
    website: "bg-primary/5 text-primary border-primary/10",
    other: "bg-muted text-muted-foreground border-border",
};

const EditProfileLinks = ({ links, onChange }: EditProfileLinksProps) => {
    const [adding, setAdding] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
    const [newUrl, setNewUrl] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editUrl, setEditUrl] = useState("");

    const addLink = () => {
        if (!newUrl.trim()) return;
        onChange([
            ...links,
            { id: Date.now().toString(), platform: selectedPlatform.id, url: newUrl.trim() },
        ]);
        setNewUrl("");
        setAdding(false);
    };

    const removeLink = (id: string) => {
        onChange(links.filter((l) => l.id !== id));
    };

    const startEdit = (link: SocialLink) => {
        setEditingId(link.id);
        setEditUrl(link.url);
    };

    const commitEdit = (id: string) => {
        onChange(
            links.map((l) =>
                l.id === id ? { ...l, url: editUrl.trim() } : l
            )
        );
        setEditingId(null);
    };

    const displayUrl = (url: string) => {
        try {
            const u = new URL(url.startsWith("http") ? url : `https://${url}`);
            return u.hostname.replace("www.", "") + u.pathname.replace(/\/$/, "");
        } catch {
            return url;
        }
    };

    return (
        <section className="animate-reveal">
            <div className="flex items-center justify-between mb-4 px-1">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                    Links & Social
                </Label>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded-md hover:bg-surface border border-border/40 text-muted-foreground hover:text-primary transition-colors">
                            <Plus size={14} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl">
                        {platforms.map((p) => (
                            <DropdownMenuItem 
                                key={p.id} 
                                onClick={() => {
                                    setSelectedPlatform(p);
                                    setAdding(true);
                                }}
                                className="gap-2 text-xs font-medium"
                            >
                                {p.icon} {p.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="space-y-2">
                {links.map((link) => (
                    <div
                        key={link.id}
                        className="group flex items-center gap-3 p-2 rounded-xl bg-surface/30 border border-border/40 hover:border-primary/20 transition-all duration-300"
                    >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${platformColors[link.platform] || platformColors.other}`}>
                            {platformIcons[link.platform] || platformIcons.other}
                        </div>

                        {editingId === link.id ? (
                            <Input
                                value={editUrl}
                                onChange={(e) => setEditUrl(e.target.value)}
                                onBlur={() => commitEdit(link.id)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") commitEdit(link.id);
                                    if (e.key === "Escape") setEditingId(null);
                                }}
                                autoFocus
                                className="flex-1 h-7 text-xs bg-transparent border-0 border-b border-primary focus:ring-0 rounded-none px-0"
                            />
                        ) : (
                            <span className="flex-1 text-xs font-medium text-foreground/80 truncate">
                                {displayUrl(link.url)}
                            </span>
                        )}

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(link)} className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors">
                                <Pencil size={11} />
                            </button>
                            <button onClick={() => removeLink(link.id)} className="p-1 text-muted-foreground hover:text-destructive rounded-md transition-colors">
                                <Trash2 size={11} />
                            </button>
                        </div>
                    </div>
                ))}

                {adding && (
                    <div className="flex items-center gap-2 p-2 rounded-xl border border-dashed border-primary/40 bg-primary/[0.01] animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${platformColors[selectedPlatform.id]}`}>
                            {selectedPlatform.icon}
                        </div>
                        <Input
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") addLink();
                                if (e.key === "Escape") setAdding(false);
                            }}
                            placeholder="Link URL..."
                            autoFocus
                            className="flex-1 h-7 text-xs bg-transparent border-0 border-b border-primary focus:ring-0 rounded-none px-0"
                        />
                        <Button size="sm" onClick={addLink} className="h-6 text-[9px] font-bold uppercase rounded-md px-2">
                            Add
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default EditProfileLinks;
