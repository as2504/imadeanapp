interface AppDetailScreenshotsProps {
  screenshots: string[];
}

const AppDetailScreenshots = ({ screenshots }: AppDetailScreenshotsProps) => {
  if (!screenshots.length) return null;

  return (
    <section className="py-6 border-b border-border/40">
      <h2 className="text-sm font-semibold text-foreground mb-4">Screenshots</h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {screenshots.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Screenshot ${i + 1}`}
            className="h-48 sm:h-56 rounded-xl object-cover shrink-0 bg-surface"
          />
        ))}
      </div>
    </section>
  );
};

export default AppDetailScreenshots;
