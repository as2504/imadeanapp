
# Plan: Font Consistency Confirmation + Feedback UX Fixes

## Font Family — No Changes Needed

Inter is already the sole font across the app. Both `body` and `h1–h6` use `'Inter', system-ui, sans-serif` with proper feature settings (`cv11`, `ss01`, `ss03`) and tight heading tracking (`-0.03em`). No other font-family declarations exist anywhere. It's production-ready.

## Fix 1: Feedback Setup — Replace "Add Question" button with a compact + icon

**File:** `src/pages/FeedbackSetup.tsx`

Currently there's a full-width dashed card with a large "Add Question" button at the bottom. Replace this with:

- A small `+` icon button in the top-right corner of the "Questions (X/5)" header area
- Clicking it expands an inline form (same fields: question text, type toggle, options) below the existing questions
- Hide the `+` button when the form is open or when 5 questions are reached
- Keep the form minimal — collapse it after adding a question

This removes the always-visible bulky form and makes the page cleaner.

## Fix 2: Feedback Flow — Fix back-navigation after "Go to Profile"

**File:** `src/components/feedback/ThankYouScreen.tsx`

The bug: After completing feedback (or test mode), clicking "Go to Profile" pushes `/profile/:id` onto the history stack. Pressing the browser back button returns to `/feedback/:appId`, which re-renders the entire feedback flow and lets the user submit again.

Fix: Change `navigate(`/profile/${publisherId}`)` to `navigate(`/profile/${publisherId}`, { replace: true })`. This replaces the feedback route in history so back goes to the app detail page instead.

Also apply `{ replace: true }` to the "Return to Feedback Settings" navigation for the same reason.

## Files Summary

| File | Change |
|---|---|
| `src/pages/FeedbackSetup.tsx` | Replace bottom add-question card with top-right + icon and collapsible inline form |
| `src/components/feedback/ThankYouScreen.tsx` | Add `replace: true` to profile and settings navigation |
