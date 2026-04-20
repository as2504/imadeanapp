

## Plan

### 1. FeedbackSetup — top-right "+" only, validate required fields
File: `src/pages/FeedbackSetup.tsx`

- **Remove the bottom "Add Question" button** (the big secondary button on line ~491). Replace its job with the existing top-right "+" icon, which already exists but is currently hidden when `showAddForm` is true.
- **Keep the top-right "+" visible always** (when under 10 questions). Clicking it when no add form is open → opens the form. When an add form is open with valid data → commits the question and resets the form (so user can keep adding). When data is invalid → trigger validation highlighting.
- **Validation highlighting**:
  - Add state `errors: { question?: boolean; options?: boolean[] }`
  - On clicking "+" (or attempting to commit current draft): if `newQuestionText` empty → mark question input red ring; if fewer than 2 non-empty options → mark empty option inputs red ring. Show small inline helper text: *"Question text required"* / *"At least 2 options required"*.
  - Same validation applied during `handleDone` for any open in-progress draft (force commit before save).
  - Inputs get `aria-invalid` + `border-destructive ring-1 ring-destructive/40` when in error state. Errors clear on input change.
- Also apply same validation when **saving an inline-edited question** (`saveEditing`) — currently uses `toast.error`; switch to inline red-ring highlighting in addition to toast.

### 2. FeedbackFlow — add "Skip" option
Files: `src/pages/FeedbackFlow.tsx`, `src/components/feedback/QuestionCard.tsx`

- Add a small ghost "Skip" link beneath each question (right-aligned, muted text, e.g. *"Skip this question →"*).
- Clicking "Skip": records `null`/omits the answer for that question id, advances to next or submits.
- Stored response payload: skipped questions simply absent from `answers` object (already handled by `FeedbackDashboard` via `if (!answer) return false`).
- Skip button hidden during the satisfaction "Bad" follow-up state to avoid confusion (or it skips the follow-up text only — simpler: keep skip available, leaves followUp empty).

### 3. Active tab visibility in light mode
File: `src/components/feed/FeedNavbar.tsx` (desktop nav links lines 64-83)

Current active style: `text-foreground bg-secondary` — in light mode `bg-secondary` is barely visible against the navbar. Change active state to a clearly-distinct treatment:

- Active: `text-primary bg-primary/10` + a 1px `border border-primary/20` (matches the "NEW" pill aesthetic and works in both themes)
- Inactive: keep `text-muted-foreground hover:text-foreground hover:bg-secondary/60`

This gives an unmistakable blue-tinted pill for the active page in both light and dark modes.

### Files touched
- `src/pages/FeedbackSetup.tsx` — remove bottom button, add inline validation/highlighting, make top-right "+" the single add affordance
- `src/pages/FeedbackFlow.tsx` — wire skip handler
- `src/components/feedback/QuestionCard.tsx` — render Skip button
- `src/components/feed/FeedNavbar.tsx` — improve active nav-link style

