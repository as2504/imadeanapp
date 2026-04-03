# Plan: Complete App Feedback System Overhaul

## Summary

Transform the "App Feedback (Beta)" section from a simple config dropdown into a full-featured feedback creation, collection, and analytics system. This involves new database tables, new pages/components, and premium animations.

---

## Database Migration

```sql
-- Feedback forms (one per app)
CREATE TABLE public.app_feedback_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  feedback_type text NOT NULL DEFAULT 'qna', -- 'qna' or 'satisfaction'
  is_enabled boolean NOT NULL DEFAULT true,
  questions jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_feedback_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Feedback config viewable by everyone"
ON public.app_feedback_config FOR SELECT TO public USING (true);

CREATE POLICY "Users can insert own feedback config"
ON public.app_feedback_config FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback config"
ON public.app_feedback_config FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own feedback config"
ON public.app_feedback_config FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Feedback responses from users
CREATE TABLE public.app_feedback_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL,
  config_id uuid NOT NULL,
  user_id uuid NOT NULL,
  response_data jsonb NOT NULL DEFAULT '{}',
  feedback_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_feedback_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Responses viewable by app owner"
ON public.app_feedback_responses FOR SELECT TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.app_feedback_config fc
    WHERE fc.id = config_id AND fc.user_id = auth.uid()
  )
);

CREATE POLICY "Users can submit responses"
ON public.app_feedback_responses FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
```

`**questions` jsonb format:**

```json
[
  {
    "id": "q1",
    "text": "How would you rate the UI?",
    "type": "single" | "multi",
    "options": ["Great", "Good", "Okay", "Bad"]
  }
]
```

For satisfaction type, `questions` will be auto-populated with a single predefined question.

---

## Architecture: New Files


| File                                            | Purpose                                                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/pages/FeedbackSetup.tsx`                   | Full-page form builder (Cancel/Done, add questions, add options, max 5 limit)              |
| `src/pages/FeedbackFlow.tsx`                    | Full-page user-facing feedback experience (stack animation, back button, thank you screen) |
| `src/components/feedback/QuestionCard.tsx`      | Reusable question card with options editor (publisher) and answer selector (user)          |
| `src/components/feedback/FeedbackDashboard.tsx` | Analytics view: questions + % per option                                                   |
| `src/components/feedback/ThankYouScreen.tsx`    | Post-feedback: publisher profile, follow button, go to profile                             |


---

## Settings Page — Feedback Section Redesign

**Remove:** Notifications and Privacy & Security sections. Replace with "Reviews Analytics (Beta)" showing "under development" message.

**Feedback section redesign:**

- Show list of apps that already have feedback configured (fetched from `app_feedback_config`), each showing response count on the right. Clicking opens `FeedbackDashboard`.
- A "+" button on the right side of the section header opens a popover/dropdown listing the user's published apps. Apps with existing feedback are disabled (clicking shows toast: "Feedback is already added for this app"). Selecting an available app navigates to `/feedback-setup/:appId`.

---

## Feedback Setup Page (`/feedback-setup/:appId`)

- **Header:** Cancel (top-left, navigates back) | Done (top-right, saves and shows confetti)
- **App name** displayed at top
- **Feedback type selector:** QnA or Satisfaction (radio/toggle)
- **If QnA:**
  - Input field for question text
  - "+" button to add answer options (text inputs)
  - Toggle for single-choice vs multi-choice per question
  - "Add Question" button (max 5, show subtle note "Maximum 5 questions allowed")
  - List of added questions with edit/delete
- **If Satisfaction:**
  - Auto-generates one question with options: Great, Good, Okay, Bad
  - Note: "If user selects Bad, a follow-up text input will appear"
  - No custom questions needed
- **Done** saves to `app_feedback_config`, shows confetti via `canvas-confetti` (or CSS-based), then redirects back to settings
- **Test Feedback** button appears after saving — opens `/feedback/:appId?test=true`

---

## User Feedback Flow (`/feedback/:appId`)

- **Gate:** Only users who have tried the app (check `app_tries`) can access. Others see a message.
- **App name** at the top
- **Stack animation:** Current question card lifts/flies off screen, next slides up from underneath. Use CSS transforms + `animate-in`/`animate-out`.
- **Single-choice:** Auto-advance on selection
- **Multi-choice:** Show "Next" button after at least one selection
- **Satisfaction "Bad":** Shows follow-up text input just below the question: "What's the #1 thing we should fix?"
- **Back button** to revisit previous questions
- **Thank You screen** after last question:
  - Publisher avatar + name
  - Follow button (instant toggle to "Following" on click, inserts into `follows`)
  - "Go to Profile" button → `/profile/:publisherId`
- **Test mode** (`?test=true`): No responses saved, follow disabled

---

## Feedback Dashboard (in Settings)

When publisher clicks an app from the feedback list:

- Show each question
- For each option, show a horizontal bar with the % of users who selected it
- Show total response count
- No additional analytics

---

## App Detail Page Update

Replace the existing `AppFeedback` component with a "Give Feedback" button that navigates to `/feedback/:appId`. Only show if:

1. User is authenticated
2. User has tried the app (`app_tries`)
3. Feedback config exists and is enabled for this app

---

## Routes (App.tsx)

Add protected routes:

- `/feedback-setup/:appId` → `FeedbackSetup`
- `/feedback/:appId` → `FeedbackFlow`

---

## Files Summary


| File                                            | Change                                                                                                                  |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Migration SQL**                               | Create `app_feedback_config` and `app_feedback_responses` tables                                                        |
| `src/App.tsx`                                   | Add routes for feedback-setup and feedback                                                                              |
| `src/pages/Settings.tsx`                        | Redesign feedback section (app list + "+" + dashboard), remove Notifications/Privacy, add Reviews Analytics placeholder |
| `src/pages/FeedbackSetup.tsx`                   | **New** — Full form builder page                                                                                        |
| `src/pages/FeedbackFlow.tsx`                    | **New** — User feedback experience with stack animations                                                                |
| `src/components/feedback/QuestionCard.tsx`      | **New** — Question display/edit component                                                                               |
| `src/components/feedback/FeedbackDashboard.tsx` | **New** — Response analytics per question                                                                               |
| `src/components/feedback/ThankYouScreen.tsx`    | **New** — Post-feedback follow/profile screen                                                                           |
| `src/components/app-detail/AppFeedback.tsx`     | Replace with "Give Feedback" navigation button                                                                          |
| `src/pages/AppDetail.tsx`                       | Pass `userTried` to updated AppFeedback                                                                                 |
