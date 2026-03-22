import { Globe, Smartphone, Monitor } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PlatformSelectorProps {
  platforms: string[];
  websiteUrl: string;
  playStoreUrl: string;
  appStoreUrl: string;
  onToggle: (platform: string) => void;
  onUrlChange: (field: "websiteUrl" | "playStoreUrl" | "appStoreUrl", value: string) => void;
}

const platformOptions = [
  { id: "web", label: "Web", icon: Globe },
  { id: "android", label: "Android", icon: Smartphone },
  { id: "ios", label: "iOS", icon: Monitor },
] as const;

const PlatformSelector = ({
  platforms,
  websiteUrl,
  playStoreUrl,
  appStoreUrl,
  onToggle,
  onUrlChange,
}: PlatformSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {platformOptions.map((p) => {
          const active = platforms.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onToggle(p.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
                active
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
              }`}
            >
              <p.icon size={16} />
              {p.label}
            </button>
          );
        })}
      </div>

      {platforms.includes("web") && (
        <Input
          placeholder="https://yourapp.com"
          value={websiteUrl}
          onChange={(e) => onUrlChange("websiteUrl", e.target.value)}
          className="rounded-xl"
        />
      )}
      {platforms.includes("android") && (
        <Input
          placeholder="https://play.google.com/store/apps/..."
          value={playStoreUrl}
          onChange={(e) => onUrlChange("playStoreUrl", e.target.value)}
          className="rounded-xl"
        />
      )}
      {platforms.includes("ios") && (
        <Input
          placeholder="https://apps.apple.com/app/..."
          value={appStoreUrl}
          onChange={(e) => onUrlChange("appStoreUrl", e.target.value)}
          className="rounded-xl"
        />
      )}
    </div>
  );
};

export default PlatformSelector;
