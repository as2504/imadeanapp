import { Bookmark } from "lucide-react";

const ProfileSavedApps = () => {
  return (
    <div className="text-center py-20 space-y-3">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
        <Bookmark size={20} className="text-muted-foreground" />
      </div>
      <p className="text-foreground font-medium">No saved apps yet</p>
      <p className="text-sm text-muted-foreground">Bookmark apps from the feed to revisit them later.</p>
    </div>
  );
};

export default ProfileSavedApps;
