import { useNavigate } from "react-router-dom";
import { MessageSquare, Calendar } from "lucide-react";
import UpvoteButton from "./UpvoteButton";
import NotifyMeButton from "./NotifyMeButton";

export interface UpcomingApp {
  id: string;
  slug?: string;
  appName: string;
  appIcon: string;
  caption: string;
  tags: string[];
  platforms: string[];
  upvotesCount: number;
  notifyCount: number;
  commentsCount: number;
  plannedLaunch?: string | null;
  publisherName: string;
  publisherUserId: string;
  timeAgo: string;
}

const platformLabel: Record<string, string> = { web: "Web", android: "Android", ios: "iOS" };

const isUrl = (str: string) => str.startsWith("http") || str.startsWith("/");

const IdeaCard = ({ idea }: { idea: UpcomingApp }) => {
  const navigate = useNavigate();
  const goto = () => navigate(`/upcoming/${idea.slug || idea.id}`);

  return (
    <article
      onClick={goto}
      className="flex gap-4 p-4 sm:p-5 border-b border-border/40 hover:bg-secondary/20 cursor-pointer transition-colors"
    >
      <UpvoteButton appId={idea.id} initialCount={idea.upvotesCount} />

      <div className="flex-1 min-w-0 flex gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden border border-border/40">
          {isUrl(idea.appIcon) ? (
            <img src={idea.appIcon} alt={idea.appName} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <span className="text-2xl">{idea.appIcon || "💡"}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-foreground truncate">{idea.appName}</h3>
              <p className="text-xs sm:text-[13px] text-muted-foreground line-clamp-2 mt-0.5">{idea.caption}</p>
            </div>
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Upcoming
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground/80">@{idea.publisherName}</span>
            <span>· {idea.timeAgo}</span>
            {idea.plannedLaunch && (
              <span className="inline-flex items-center gap-1">
                <Calendar size={11} /> {idea.plannedLaunch}
              </span>
            )}
            {idea.platforms.length > 0 && (
              <span>· {idea.platforms.map((p) => platformLabel[p] || p).join(", ")}</span>
            )}
            <span className="inline-flex items-center gap-1">
              <MessageSquare size={11} /> {idea.commentsCount}
            </span>
            <NotifyMeButton appId={idea.id} initialCount={idea.notifyCount} ownerId={idea.publisherUserId} variant="compact" />
          </div>
        </div>
      </div>
    </article>
  );
};

export default IdeaCard;
