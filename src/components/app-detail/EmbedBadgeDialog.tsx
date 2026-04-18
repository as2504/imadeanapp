import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmbedBadgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
}

const FUNCTIONS_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/badge`;

const EmbedBadgeDialog = ({ open, onOpenChange, slug }: EmbedBadgeDialogProps) => {
  const { toast } = useToast();
  const [style, setStyle] = useState<"dark" | "light">("dark");
  const [copied, setCopied] = useState(false);

  const badgeUrl = `${FUNCTIONS_URL}?slug=${slug}&style=${style}`;
  const appUrl = `https://imadeanapp.com/app/${slug}`;
  const snippet = `<a href="${appUrl}" target="_blank" rel="noopener">
  <img src="${badgeUrl}" alt="Featured on imadeanapp" width="320" height="64" />
</a>`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast({ title: "Copied!", description: "Embed snippet copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Embed badge</DialogTitle>
          <DialogDescription className="text-xs">
            Show off your imadeanapp rating on your site. Free backlink.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Style toggle */}
          <div className="inline-flex rounded-lg border border-border/40 p-0.5 bg-muted/30">
            <button
              onClick={() => setStyle("dark")}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                style === "dark"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setStyle("light")}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                style === "light"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Light
            </button>
          </div>

          {/* Preview */}
          <div className="flex items-center justify-center p-6 rounded-xl bg-muted/30 border border-border/40 min-h-[100px]">
            <img
              src={badgeUrl}
              alt="Badge preview"
              width={320}
              height={64}
              key={style}
              className="max-w-full h-auto"
            />
          </div>

          {/* Snippet */}
          <div className="relative">
            <pre className="text-[10px] bg-muted/50 border border-border/40 rounded-lg p-3 pr-16 overflow-x-auto text-foreground/80 font-mono leading-relaxed whitespace-pre-wrap break-all">
              {snippet}
            </pre>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopy}
              className="absolute top-2 right-2 h-7 gap-1.5 text-xs"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Paste this on your portfolio, blog, or app's website. The badge updates automatically as you receive more ratings.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmbedBadgeDialog;
