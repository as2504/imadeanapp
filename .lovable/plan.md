

# Plan: Feedback Flow Fixes, Duplicate Prevention, UI Polish

## 1. Prevent Duplicate Submissions & Fix Navigation

**Problem:** Users can re-submit feedback by navigating back. After completion, back button goes to edit mode instead of app details.

**Fix in `FeedbackFlow.tsx`:**
- Add `alreadySubmitted` state check on load — if user already submitted for this config, show "already submitted" screen immediately
- After completion, replace `navigate(-1)` with `navigate(`/app/${appId}`, { replace: true })` in the header back button when `completed` is true
- Use `navigate(..., { replace: true })` when setting `completed` so browser back doesn't re-enter the flow
- In ThankYouScreen, the "Return to Feedback Settings" button already navigates to `/settings`

**Fix in `ThankYouScreen.tsx`:**
- Pass `appId` as prop, change back/close to navigate to `/app/${appId}`

## 2. "Already Submitted" UI in AppFeedback Component

**Problem:** When `alreadySubmitted` is true, the component returns `null` — broken-looking empty space.

**Fix in `AppFeedback.tsx`:**
- When `alreadySubmitted && !isOwner`, show a card with a checkmark icon and text: "Your feedback has been recorded. Thank you!"

## 3. "Already Submitted" Guard in FeedbackFlow

**Fix in `FeedbackFlow.tsx`:**
- Check for existing response during `fetchData`. If found, show a screen saying "You've already submitted feedback for this app" with a button to go to app details.

## 4. QuestionCard UI — Radio vs Squircle Icons

**Problem:** No visual indicator type distinction between single and multi select.

**Fix in `QuestionCard.tsx`:**
- For `single` type: show a radio circle on the left (empty circle, filled when selected)
- For `multi` type: show a rounded-square (squircle) checkbox on the left (empty, checked when selected)
- Remove the right-side check icon, move indicator to left
- Keep satisfaction icons as-is (they already have special icons)

## 5. Submitting Animation Before Thank You

**Problem:** Abrupt transition from last question to thank-you screen.

**Fix in `FeedbackFlow.tsx`:**
- Add a `submitting` state between answering and `completed`
- After last question submission, set `submitting = true`, show a centered animation (pulsing dots / spinning ring with "Submitting your feedback..." text) for ~1.5s, then set `completed = true`

## Files Summary

| File | Change |
|---|---|
| `src/pages/FeedbackFlow.tsx` | Add duplicate check, submitting animation, fix navigation |
| `src/components/feedback/QuestionCard.tsx` | Radio buttons for single, squircle checkboxes for multi |
| `src/components/feedback/ThankYouScreen.tsx` | Accept `appId`, navigate to app details on back |
| `src/components/app-detail/AppFeedback.tsx` | Show "feedback recorded" card instead of empty space |

