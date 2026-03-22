import { ReactNode, useState } from "react";
import SidebarPanel from "./SidebarPanel";

interface FeedLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

const FeedLayout = ({ children, sidebar }: FeedLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <div className="max-w-[1080px] mx-auto px-4 lg:px-6">
        <div className="flex gap-8">
          {/* Primary column */}
          <div className="flex-1 min-w-0 max-w-[720px]">
            {typeof children === "function"
              ? (children as any)({ onOpenSidebar: () => setSidebarOpen(true) })
              : children}
          </div>

          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-[280px] shrink-0">
            <div className="sticky top-20 space-y-6">{sidebar}</div>
          </aside>
        </div>
      </div>

      {/* Mobile sidebar panel */}
      <SidebarPanel open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        {sidebar}
      </SidebarPanel>
    </>
  );
};

export default FeedLayout;
