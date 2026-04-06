

# Plan: Add Google Sign-In (Supabase-native, portable across environments)

## Approach

Since you've already configured Google OAuth in your prod Supabase project (client ID, secret, etc.), the implementation uses **Supabase's native `signInWithOAuth`** directly — no Lovable Cloud abstraction. This means the same code works in both your test and prod environments, as long as each Supabase project has Google provider enabled in its dashboard.

No extra API keys or env variables needed in the codebase — Google OAuth config lives entirely in Supabase's auth settings per project.

## Changes

### 1. `src/contexts/AuthContext.tsx`
- Add `signInWithGoogle` method that calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/home' } })`
- Export it in the context type

### 2. `src/pages/Auth.tsx`
- Add a "Continue with Google" button with the Google icon (inline SVG)
- Place it above the email form with an "or" divider
- On click, call `signInWithGoogle()` from context
- Style: outlined button, full width, matching the existing card design

### 3. Handle Google OAuth profile creation
- The existing `handle_new_user` trigger already creates a profile row using `display_name` from `raw_user_meta_data`
- Google OAuth populates `raw_user_meta_data` with `full_name` (not `display_name`), so we need a **migration** to update the trigger to also check `full_name` and `avatar_url`:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END; $$;
```

### 4. Post-OAuth username handling
- Google users won't have a username set. After OAuth redirect lands on `/home`, detect if the profile has no `username` and show a one-time username prompt dialog.
- Create `src/components/UsernamePrompt.tsx` — a modal that checks if the user's profile has a username, and if not, asks them to set one before proceeding.
- Add this check in `HomeFeed.tsx` (or wrap in `ProtectedRoute`).

## Important for prod portability
- **No new env variables** — Google OAuth is configured in Supabase dashboard, not in code
- **Same `supabase.auth.signInWithOAuth`** call works with any Supabase project that has Google enabled
- The migration SQL needs to be run on prod via your CLI workflow

## Files Summary

| File | Change |
|---|---|
| `src/contexts/AuthContext.tsx` | Add `signInWithGoogle` method |
| `src/pages/Auth.tsx` | Add Google sign-in button with divider |
| `src/components/UsernamePrompt.tsx` | **New** — one-time username setup for OAuth users |
| `src/pages/HomeFeed.tsx` | Show `UsernamePrompt` if no username |
| **Migration SQL** | Update `handle_new_user` to handle Google metadata fields |

