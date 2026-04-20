

## Plan: Modal-based question editor for QnA feedback setup

Refocus the redesign on the actual problem: only the **QnA form** is hard to use. Satisfaction form stays as-is (its options are fixed).

### New flow
- Top-right **+** icon stays as the only "add question" affordance (works for both desktop and mobile).
- Clicking **+** opens a centered **modal dialog** (responsive — full-width sheet feel on mobile, comfortable max-w on desktop) containing the question editor.
- Modal contents:
  - Title: *"New question"* (or *"Edit question"* when editing existing)
  - Single-select / Multi-select toggle (segmented pill)
  - Question text input (auto-focused)
  - Options list with `✕` to remove and **+ Add option** text link beneath
  - Bottom-right **tick icon** (just the `Check` icon, no button chrome) — committing the question
  - Bottom-left subtle **Cancel** text link
- Validation: clicking the tick with empty question text or fewer than 2 non-empty options → red ring on offending fields + tiny inline helper text. Errors clear on input change. No toasts for field-level errors.
- On valid commit: modal closes, question appears in the list with a soft fade-in, top-right **+** is ready to be tapped again for the next question.

### Editing existing questions
- Replace the current inline-edit-in-place behavior with the same modal: tapping a saved question card (or its pencil icon) opens the modal pre-filled. Tick saves; Cancel discards.
- Delete stays as a small trash icon on each card (no behavior change).

### Cleanup of the page
- Remove the *"Tap the + in the top right to save and add another question."* helper text.
- Remove the inline new-question form section that currently sits in the page body.
- Remove the inline edit form for saved questions (now handled by the modal).
- Saved-question cards become read-only previews: number, question text, type badge (Single/Multi), option chips, edit/delete icons in the corner.

### Responsiveness
- Use the existing shadcn `Dialog` component. On mobile (`<640px`) override with full-width content, rounded-top, bottom-aligned sheet feel via classes (`sm:max-w-lg max-w-[calc(100%-1rem)]`, generous padding, sticky tick at the bottom-right of the modal so it's reachable with the thumb).
- Question textarea grows with content; option inputs stack naturally; modal scrolls internally if many options.

### Premium micro-interactions
- Tick icon: muted gray when invalid → primary color when valid. Click triggers brief scale-down + check morph, then modal closes with fade-out.
- Modal entrance: standard shadcn fade + zoom-in (already built in).
- Saved card insertion: `animate-in fade-in slide-in-from-top-2 duration-300`.

### Satisfaction form
Untouched. Options remain fixed `Great / Good / Okay / Bad`. Top-right **+** in satisfaction mode opens the same modal but with the options editor hidden (only question text + tick).

### Files touched
- `src/pages/FeedbackSetup.tsx` — remove inline add/edit forms and helper note; add modal state (`modalOpen`, `editingId`, `draft`, `errors`); render new `QuestionEditorDialog`; simplify saved card rendering to read-only previews with edit/delete icons.
- New component **inline in the same file** (or extracted as `src/components/feedback/QuestionEditorDialog.tsx`): wraps `Dialog` + `DialogContent`, contains the question editor UI, validation, and tick-commit handler.
- No DB changes. Output shape (`app_feedback_config.questions`) unchanged.

### Out of scope
- Drag-to-reorder questions
- Changes to satisfaction form layout
- Changes to the FeedbackFlow (consumer) page

