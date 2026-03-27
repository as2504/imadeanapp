import { useState } from "react";
import { Plus, GraduationCap, Briefcase, Calendar, X, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Education {
  id: string;
  school: string;
  degree: string;
  year: string;
}

interface Work {
  id: string;
  company: string;
  role: string;
  years: string;
}

interface ExperienceProps {
  education: Education[];
  work: Work[];
  onEducationChange: (edu: Education[]) => void;
  onWorkChange: (work: Work[]) => void;
}

const EditProfileExperience = ({ education, work, onEducationChange, onWorkChange }: ExperienceProps) => {
  const [addingEdu, setAddingEdu] = useState(false);
  const [newEdu, setNewEdu] = useState({ school: "", degree: "", year: "" });
  
  const [addingWork, setAddingWork] = useState(false);
  const [newWork, setNewWork] = useState({ company: "", role: "", years: "" });

  const addEdu = () => {
    if (!newEdu.school) return;
    onEducationChange([...education, { ...newEdu, id: Date.now().toString() }]);
    setNewEdu({ school: "", degree: "", year: "" });
    setAddingEdu(false);
  };

  const addWork = () => {
    if (!newWork.company) return;
    onWorkChange([...work, { ...newWork, id: Date.now().toString() }]);
    setNewWork({ company: "", role: "", years: "" });
    setAddingWork(false);
  };

  return (
    <div className="space-y-10 animate-reveal">
      {/* Education Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-primary" />
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Education</Label>
          </div>
          <button 
            onClick={() => setAddingEdu(true)}
            className="p-1.5 rounded-lg border border-border/40 hover:border-primary/40 hover:text-primary transition-all"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="space-y-3">
          {education.map((edu) => (
            <div key={edu.id} className="flex items-center justify-between p-3 rounded-xl bg-surface/30 border border-border/40 group">
              <p className="text-sm font-medium text-foreground">
                {edu.school} <span className="text-muted-foreground mx-1.5">·</span> {edu.degree} <span className="text-muted-foreground mx-1.5">·</span> <span className="text-primary/70">{edu.year}</span>
              </p>
              <button 
                onClick={() => onEducationChange(education.filter(e => e.id !== edu.id))}
                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {addingEdu && (
            <div className="p-4 rounded-xl border border-dashed border-primary/30 bg-primary/[0.01] space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input 
                  placeholder="School/University Name" 
                  value={newEdu.school} 
                  onChange={e => setNewEdu({...newEdu, school: e.target.value})}
                  className="h-9 text-xs bg-background"
                />
                <Input 
                  placeholder="Degree (e.g. BS Computer Science)" 
                  value={newEdu.degree} 
                  onChange={e => setNewEdu({...newEdu, degree: e.target.value})}
                  className="h-9 text-xs bg-background"
                />
              </div>
              <div className="flex items-center gap-3">
                <Input 
                  placeholder="Completion Year (or 'Present')" 
                  value={newEdu.year} 
                  onChange={e => setNewEdu({...newEdu, year: e.target.value})}
                  className="h-9 text-xs bg-background flex-1"
                />
                <Button size="sm" onClick={addEdu} className="h-9 px-4 rounded-lg text-xs font-bold">Add</Button>
                <Button size="sm" variant="ghost" onClick={() => setAddingEdu(false)} className="h-9 rounded-lg text-xs">Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Work Experience Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Briefcase size={18} className="text-primary" />
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Work Experience</Label>
          </div>
          <button 
            onClick={() => setAddingWork(true)}
            className="p-1.5 rounded-lg border border-border/40 hover:border-primary/40 hover:text-primary transition-all"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="space-y-3">
          {work.map((w) => (
            <div key={w.id} className="flex items-center justify-between p-3 rounded-xl bg-surface/30 border border-border/40 group">
              <p className="text-sm font-medium text-foreground">
                {w.company} <span className="text-muted-foreground mx-1.5">·</span> {w.role} <span className="text-muted-foreground mx-1.5">·</span> <span className="text-primary/70">{w.years} yrs</span>
              </p>
              <button 
                onClick={() => onWorkChange(work.filter(item => item.id !== w.id))}
                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {addingWork && (
            <div className="p-4 rounded-xl border border-dashed border-primary/30 bg-primary/[0.01] space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input 
                  placeholder="Company Name" 
                  value={newWork.company} 
                  onChange={e => setNewWork({...newWork, company: e.target.value})}
                  className="h-9 text-xs bg-background"
                />
                <Input 
                  placeholder="Role (e.g. Senior Frontend)" 
                  value={newWork.role} 
                  onChange={e => setNewWork({...newWork, role: e.target.value})}
                  className="h-9 text-xs bg-background"
                />
              </div>
              <div className="flex items-center gap-3">
                <Input 
                  placeholder="Total Years" 
                  type="number"
                  value={newWork.years} 
                  onChange={e => setNewWork({...newWork, years: e.target.value})}
                  className="h-9 text-xs bg-background flex-1"
                />
                <Button size="sm" onClick={addWork} className="h-9 px-4 rounded-lg text-xs font-bold">Add</Button>
                <Button size="sm" variant="ghost" onClick={() => setAddingWork(false)} className="h-9 rounded-lg text-xs">Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default EditProfileExperience;
