import { Share2, AtSign } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border py-8">
    <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-foreground">Showcase</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          © {new Date().getFullYear()} Showcase. All rights reserved.
        </p>
      </div>
      <div className="flex items-center gap-6">
        <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Privacy
        </a>
        <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Terms
        </a>
        <div className="flex items-center gap-3 text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors" aria-label="Share">
            <Share2 size={16} />
          </a>
          <a href="#" className="hover:text-foreground transition-colors" aria-label="Contact">
            <AtSign size={16} />
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
