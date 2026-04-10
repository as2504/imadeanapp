# Plan: UX Fixes & Improvements (User-Approved Items)

## 1. Password Visibility Toggle on Auth Page

**File:** `src/pages/Auth.tsx`

- Add an eye/eye-off icon button inside the password input field
- Toggle between `type="password"` and `type="text"`

## 2. Forgot Password Flow

**Files:** `src/pages/Auth.tsx`, `src/pages/ResetPassword.tsx` (new), `src/contexts/AuthContext.tsx`, `src/App.tsx`

- Add "Forgot password?" link below the password field on the sign-in form
- Show an inline email input to request a reset link via `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })`
- Create `/reset-password` page that detects `type=recovery` in the URL hash, shows a "Set new password" form, and calls `supabase.auth.updateUser({ password })`
- Add `resetPassword` and `updatePassword` methods to `AuthContext`
- Register `/reset-password` as a public route in `App.tsx`
- This uses standard Supabase auth — in prod you just enable "password recovery" in your Supabase project settings

## 3. EmptyFeed Buttons — Wire Them Up

**File:** `src/components/feed/EmptyFeed.tsx`

- Confirmed: buttons have no `onClick`. Add `useNavigate()` — "Publish an App" navigates to `/publish`, "Explore Tags" scrolls to or opens the filter/tag section

## 4. Footer Links — Make Real or Remove

**File:** `src/components/landing/Footer.tsx`

- "Privacy" and "Terms" — create placeholder pages (`/privacy`, `/terms`) or show a toast saying "Coming soon"
- "Twitter" and "GitHub" — remove 

## 5. Inline Error States on Auth

**File:** `src/pages/Auth.tsx`

- Add an `error` state string displayed as a red banner below the form header (in addition to the existing toast)
- Clear on new submission attempt

## 6. Logout Confirmation Dialog

**File:** `src/pages/Settings.tsx`

- Wrap the logout action in an `AlertDialog` asking "Are you sure you want to log out?"

## 7. Trending Page — Better Empty State

**File:** `src/pages/Trending.tsx`

- Replace the plain text with an illustration (icon), a friendlier message, and a "Publish an App" CTA button

## 8. Extract `getTimeAgo` to Shared Utility

**Files:** `src/lib/utils.ts`, then update imports in `HomeFeed.tsx`, `Trending.tsx`, `ProfilePublishedApps.tsx`, `ProfileDraftApps.tsx`, `AppDetailReviews.tsx`

- Move the function to `src/lib/utils.ts` and remove all local copies

## 9. Infinite Scroll / Load More on Feeds

**Files:** `src/pages/HomeFeed.tsx`, `src/pages/Trending.tsx`

- Add a "Load More" button at the bottom of the feed
- Track `page` state, fetch next batch (e.g. 20 per page) using `.range(from, to)` on the Supabase query
- Append results to existing list

## 10. Email Verification Banner

**File:** `src/components/feed/FeedNavbar.tsx` (or a new `EmailVerificationBanner.tsx` used in `HomeFeed.tsx`)

- Check `user.email_confirmed_at` — if null/undefined, show a dismissible yellow banner: "Please verify your email address. Check your inbox for a confirmation link."
- Add a "Resend" button that calls `supabase.auth.resend({ type: 'signup', email })`

---

## Files Summary


| File                                              | Change                                               |
| ------------------------------------------------- | ---------------------------------------------------- |
| `src/pages/Auth.tsx`                              | Password toggle, forgot password link, inline errors |
| `src/pages/ResetPassword.tsx`                     | New — password reset form                            |
| `src/contexts/AuthContext.tsx`                    | Add `resetPassword`, `updatePassword` methods        |
| `src/App.tsx`                                     | Add `/reset-password` route                          |
| `src/components/feed/EmptyFeed.tsx`               | Wire up buttons                                      |
| `src/components/landing/Footer.tsx`               | Fix dead links                                       |
| `src/pages/Settings.tsx`                          | Logout confirmation dialog                           |
| `src/pages/Trending.tsx`                          | Better empty state                                   |
| `src/lib/utils.ts`                                | Add shared `getTimeAgo`                              |
| `src/pages/HomeFeed.tsx`                          | Use shared `getTimeAgo`, add load more               |
| `src/components/profile/ProfilePublishedApps.tsx` | Use shared `getTimeAgo`                              |
| `src/components/profile/ProfileDraftApps.tsx`     | Use shared `getTimeAgo`                              |
| `src/components/app-detail/AppDetailReviews.tsx`  | Use shared `getTimeAgo`                              |
| `src/components/feed/EmailVerificationBanner.tsx` | New — verification banner                            |
