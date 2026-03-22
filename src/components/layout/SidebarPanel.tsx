import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface SidebarPanelProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

const SidebarPanel = ({ open, onClose, children }: SidebarPanelProps) => {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/20 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[80vw] bg-background shadow-xl transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <span className="text-sm font-semibold text-foreground">Discover</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface transition-colors"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-57px)] space-y-6">
          {children}
        </div>
      </div>
    </>
  );
};

export default SidebarPanel;
