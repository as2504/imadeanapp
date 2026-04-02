import { ReactNode, useState } from "react";
import SidebarPanel from "./SidebarPanel";

interface RenderProps {
  onOpenSidebar: () => void;
}

interface FeedLayoutProps {
  children: ReactNode | ((props: RenderProps) => ReactNode);
  sidebar: ReactNode;
}

const FeedLayout = ({ children, sidebar }: FeedLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderedChildren =
    typeof children === "function"
      ? children({ onOpenSidebar: () => setSidebarOpen(true) })
      : children;

  return (
    <>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex gap-8">
          <div className="flex-1 min-w-0">{renderedChildren}</div>
          <aside className="hidden lg:block w-[300px] shrink-0">
            <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-6 pr-2 -mr-2">
              {sidebar}
            </div>
          </aside>
        </div>
      </div>

      <SidebarPanel open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        {sidebar}
      </SidebarPanel>
    </>
  );
};

export default FeedLayout;
