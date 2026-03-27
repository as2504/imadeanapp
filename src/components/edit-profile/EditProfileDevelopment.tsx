import { Code2, Wrench, Layers, UserPlus, Search, Check, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DevelopmentProps {
  primarySkill: string;
  secondaryTools: string[];
  preferredPlatforms: string[];
  isFindingWork: boolean;
  isOpenToCollaboration: boolean;
  lookingFor: string[];
  onDataChange: (field: string, value: any) => void;
}

const platforms = ["Web Apps", "Android", "iOS", "Cross-platform"];
const collaborationRoles = ["Designers", "Developers", "Co-founders"];
const toolSuggestions = ["Vercel", "AWS", "Docker", "Figma", "Stripe", "LangChain", "Supabase", "OpenAI", "React", "Next.js", "Tailwind", "Python", "Node.js"];

const EditProfileDevelopment = ({
  primarySkill,
  secondaryTools,
  preferredPlatforms,
  isFindingWork,
  isOpenToCollaboration,
  lookingFor,
  onDataChange,
}: DevelopmentProps) => {
  
  const toggleItem = (list: string[], item: string, field: string) => {
    const newList = list.includes(item) 
      ? list.filter(i => i !== item) 
      : [...list, item];
    onDataChange(field, newList);
  };

  const addTool = (tool: string) => {
    if (tool && !secondaryTools.includes(tool)) {
      onDataChange("secondaryTools", [...secondaryTools, tool]);
    }
  };

  const removeTool = (tool: string) => {
    onDataChange("secondaryTools", secondaryTools.filter(t => t !== tool));
  };

  return (
    <div className="space-y-10 animate-reveal">
      {/* Primary Skill */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Code2 size={18} className="text-primary" />
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Primary Skill</Label>
        </div>
        <Input 
          placeholder="e.g. Full Stack Developer" 
          value={primarySkill}
          onChange={e => onDataChange("primarySkill", e.target.value)}
          className="h-10 bg-surface/30 border-border/40 focus:bg-background transition-all font-medium"
        />
      </section>

      {/* Secondary Tools Dropdown */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Wrench size={18} className="text-primary" />
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Secondary Tools / Ecosystem</Label>
        </div>
        
        <div className="space-y-4">
          <Select onValueChange={addTool}>
            <SelectTrigger className="h-10 bg-surface/30 border-border/40 focus:bg-background transition-all rounded-xl text-sm">
              <SelectValue placeholder="Add a tool..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {toolSuggestions
                .filter(tool => !secondaryTools.includes(tool))
                .map(tool => (
                  <SelectItem key={tool} value={tool}>
                    {tool}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Selected Tools Display */}
          <div className="flex flex-wrap gap-2 min-h-[40px] p-1">
            {secondaryTools.map(tool => (
              <div
                key={tool}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary/5 border border-primary/20 text-primary animate-in fade-in zoom-in-95"
              >
                {tool}
                <button 
                  onClick={() => removeTool(tool)}
                  className="hover:text-primary/60 transition-colors"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            ))}
            {secondaryTools.length === 0 && (
              <p className="text-xs text-muted-foreground/40 italic py-2">No tools added yet</p>
            )}
          </div>
        </div>
      </section>

      {/* Preferred Platforms */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-primary" />
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Preferred Platforms</Label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {platforms.map(p => (
            <button
              key={p}
              onClick={() => toggleItem(preferredPlatforms, p, "preferredPlatforms")}
              className={`p-3 rounded-2xl text-xs font-bold border-2 transition-all ${
                preferredPlatforms.includes(p)
                  ? "bg-primary/5 border-primary text-primary"
                  : "bg-surface/30 border-border/40 text-muted-foreground hover:border-primary/20"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      {/* Work Status */}
      <section className="space-y-6 pt-6 border-t border-border/40">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-surface/30 border border-border/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Search size={16} className="text-primary" />
              <p className="text-sm font-bold text-foreground">Are you finding work?</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">We'll show your profile to developers looking to hire.</p>
          </div>
          <Switch 
            checked={isFindingWork}
            onCheckedChange={val => onDataChange("isFindingWork", val)}
          />
        </div>

        {!isFindingWork && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface/30 border border-border/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <UserPlus size={16} className="text-primary" />
                  <p className="text-sm font-bold text-foreground">Open to Collaboration</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Team up with others on new projects.</p>
              </div>
              <Switch 
                checked={isOpenToCollaboration}
                onCheckedChange={val => onDataChange("isOpenToCollaboration", val)}
              />
            </div>

            {isOpenToCollaboration && (
              <div className="p-5 rounded-2xl border border-border/40 bg-surface/10 space-y-4 animate-in fade-in zoom-in-95">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Looking for:</Label>
                <div className="flex flex-wrap gap-3">
                  {collaborationRoles.map(role => (
                    <button
                      key={role}
                      onClick={() => toggleItem(lookingFor, role, "lookingFor")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        lookingFor.includes(role)
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10"
                          : "bg-background border border-border/60 text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {lookingFor.includes(role) && <Check size={14} strokeWidth={3} />}
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default EditProfileDevelopment;
