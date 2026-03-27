import { useState, useRef, useEffect } from "react";

interface InlineEditFieldProps {
  value: string;
  onChange: (value: string) => void;
  variant?: "heading" | "body" | "textarea";
  placeholder?: string;
  icon?: React.ReactNode;
  maxLength?: number;
}

const variantStyles = {
  heading:
    "text-2xl sm:text-3xl font-bold text-foreground tracking-tight",
  body: "text-sm sm:text-base text-foreground/80",
  textarea: "text-sm sm:text-base text-foreground/80 leading-relaxed",
};

const InlineEditField = ({
  value,
  onChange,
  variant = "body",
  placeholder = "Click to edit…",
  icon,
  maxLength,
}: InlineEditFieldProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      // place cursor at end
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    onChange(draft.trim());
  };

  const cancel = () => {
    setEditing(false);
    setDraft(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && variant !== "textarea") {
      e.preventDefault();
      commit();
    }
    if (e.key === "Escape") {
      cancel();
    }
  };

  if (editing) {
    const baseInputClasses = `w-full bg-transparent border-0 border-b-2 border-primary/40 focus:border-primary outline-none transition-all duration-300 px-0 py-1 ${variantStyles[variant]}`;

    if (variant === "textarea") {
      return (
        <div className="relative animate-field-expand">
          {icon && <span className="absolute left-0 top-2 text-muted-foreground/60">{icon}</span>}
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            rows={2}
            maxLength={maxLength}
            className={`${baseInputClasses} resize-none ${icon ? "pl-6" : ""}`}
            placeholder={placeholder}
          />
          {maxLength && (
            <span className="absolute right-0 bottom-0 text-[10px] text-muted-foreground/50">
              {draft.length}/{maxLength}
            </span>
          )}
        </div>
      );
    }

    return (
      <div className="relative animate-field-expand">
        {icon && <span className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground/60">{icon}</span>}
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
          className={`${baseInputClasses} ${icon ? "pl-6" : ""}`}
          placeholder={placeholder}
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className={`group relative text-left w-full rounded-lg transition-all duration-200 hover:bg-surface/80 px-2 py-1.5 -mx-2 cursor-text ${variantStyles[variant]} ${
        !value ? "text-muted-foreground/40 italic" : ""
      }`}
    >
      <span className="flex items-center gap-2">
        {icon && <span className="text-muted-foreground/50 shrink-0">{icon}</span>}
        <span className="truncate">{value || placeholder}</span>
      </span>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-colors duration-200 uppercase tracking-wider">
        edit
      </span>
    </button>
  );
};

export default InlineEditField;
