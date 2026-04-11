# Plan: Terms & Conditions, Privacy Policy, and Signup Consent

## Overview

Create two legal pages, add a mandatory consent checkbox at signup, add a "Legal" section in Settings, and update the footer links.

## 1. Database Migration — `user_consents` table

Store consent records with timestamp and policy version.

```sql
CREATE TABLE public.user_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  terms_version text NOT NULL DEFAULT '1.0',
  privacy_version text NOT NULL DEFAULT '1.0',
  consented_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own consent" ON public.user_consents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own consent" ON public.user_consents FOR SELECT TO authenticated USING (auth.uid() = user_id);
```

## 2. New Pages

### `src/pages/PrivacyPolicy.tsx`

Full privacy policy page with all 11 sections from the requirements. Clean, modern layout with heading hierarchy. Contact email: `imadeanapp.contact@gmail.com`. Effective date: April 2026. Version 1.2.

### `src/pages/TermsAndConditions.tsx`

Full terms page with all 14 sections. Same styling. Same contact email and version.

Both pages: responsive, scrollable, accessible from both authenticated and unauthenticated contexts. Use the app's existing card/background styling.

## 3. Signup Consent Checkbox — `src/pages/Auth.tsx`

- Add `agreedToTerms` boolean state (default `false`)
- Show checkbox only in signup mode, below the password field
- Text: `I agree to the Terms & Conditions and Privacy Policy` with links opening `/terms` and `/privacy` in new tabs
- Disable "Create Account" button unless checkbox is checked
- After successful signup, insert a row into `user_consents` with user_id, version strings, and timestamp

## 4. Settings — Legal Section — `src/pages/Settings.tsx`

- Add a new section `{ id: "legal", label: "Legal", icon: FileText }` to the sidebar
- Content: two clickable rows linking to `/terms` and `/privacy` (open in same tab or new tab)

## 5. Footer Links — `src/components/landing/Footer.tsx`

- Replace "Coming soon" placeholders with working links to `/privacy` and `/terms`

## 6. Routing — `src/App.tsx`

- Add `/privacy` and `/terms` as public routes (no auth required)

## Files Summary


| File                                | Change                                                 |
| ----------------------------------- | ------------------------------------------------------ |
| Database migration                  | New `user_consents` table with RLS                     |
| `src/pages/PrivacyPolicy.tsx`       | New — full privacy policy content                      |
| `src/pages/TermsAndConditions.tsx`  | New — full terms content                               |
| `src/pages/Auth.tsx`                | Add consent checkbox + insert consent record on signup |
| `src/pages/Settings.tsx`            | Add "Legal" section with links                         |
| `src/components/landing/Footer.tsx` | Wire up privacy/terms links                            |
| `src/App.tsx`                       | Register `/privacy` and `/terms` routes                |


## Suggestions on the provided requirements

- **Add "Last Updated" date** at the top of both documents — included as April 11, 2026
- **Version numbering** (1.2) — stored in consent records so you can track which version users agreed to
- **No changes recommended to remove** — your requirements are thorough and well-structured