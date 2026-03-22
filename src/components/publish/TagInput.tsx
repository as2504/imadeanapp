import { useState } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  label: string;
  selected: string[];
  suggestions: string[];
  max?: number;
  placeholder?: string;
  onChange: (tags: string[]) => void;
}

const TagInput = ({ label, selected, suggestions, max = 8, placeholder, onChange }: TagInputProps) => {
  const [input, setInput] = useState("");

  const filtered = suggestions.filter(
    (s) => !selected.includes(s) && s.toLowerCase().includes(input.toLowerCase())
  );

  const add = (tag: string) => {
    if (selected.length >= max) return;
    if (!selected.includes(tag)) {
      onChange([...selected, tag]);
    }
    setInput("");
  };

  const remove = (tag: string) => onChange(selected.filter((t) => t !== tag));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      add(input.trim());
    }
    if (e.key === "Backspace" && !input && selected.length > 0) {
      remove(selected[selected.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>

      {/* Selected chips */}
      <div className="flex flex-wrap gap-1.5">
        {selected.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface text-foreground text-xs font-medium rounded-full"
          >
            {tag}
            <button type="button" onClick={() => remove(tag)} className="hover:text-destructive transition-colors">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      {selected.length < max && (
        <div className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || `Type to add (max ${max})`}
            className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {input && filtered.length > 0 && (
            <div className="absolute z-10 top-full mt-1 w-full bg-background border border-border rounded-xl shadow-lg max-h-40 overflow-y-auto">
              {filtered.slice(0, 6).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => add(s)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-surface transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagInput;
