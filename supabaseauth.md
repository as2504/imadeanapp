# Supabase Authentication Integration Guide

Step-by-step guide to integrate Supabase Auth into a new project (or when migrating from Lovable Cloud to a standalone Supabase project).

---

## Prerequisites

- A Supabase project at [supabase.com](https://supabase.com)
- Your project's **URL** and **anon key** from Dashboard → Settings → API
- `@supabase/supabase-js` installed in your frontend

---

## Step 1: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

---

## Step 2: Create the Supabase Client

Create `src/integrations/supabase/client.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

---

## Step 3: Set Environment Variables

Create `.env` in your project root:

```env
VITE_SUPABASE_URL=https://<YOUR_PROJECT_REF>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<YOUR_ANON_KEY>
```

---

## Step 4: Create the Auth Context

Create `src/contexts/AuthContext.tsx`:

```typescript
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
```

---

## Step 5: Wrap Your App with AuthProvider

In `src/App.tsx` or `src/main.tsx`:

```typescript
import { AuthProvider } from "@/contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      {/* Your routes and components */}
    </AuthProvider>
  );
}
```

---

## Step 6: Create Protected Route Component

```typescript
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;

  return <>{children}</>;
};
```

---

## Step 7: Create Auth Page (Login/Signup)

Create `src/pages/Auth.tsx` with:

1. **Sign Up form**: email, password, display name
2. **Sign In form**: email, password
3. Toggle between sign up and sign in modes

Key code:

```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isSignUp) {
        await signUp(email, password, displayName);
        // Show "check your email" message
      } else {
        await signIn(email, password);
        navigate("/home");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {isSignUp && (
        <input
          type="text"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit">{isSignUp ? "Sign Up" : "Sign In"}</button>
      <button type="button" onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? "Already have an account?" : "Need an account?"}
      </button>
    </form>
  );
};
```

---

## Step 8: Auto-Create Profile on Signup

This is handled by a database trigger. Make sure you have:

```sql
-- Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END; $$;

-- Trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Step 9: Configure Auth Settings in Supabase Dashboard

### Email Confirmation
- Go to Dashboard → Authentication → Settings
- **Confirm email**: Keep ENABLED for production (users must verify email)
- For development/testing, you can disable it temporarily

### Site URL
- Set to your production URL (e.g., `https://yourapp.com`)
- This is used for email confirmation redirect links

### Redirect URLs
- Add all allowed redirect URLs:
  - `http://localhost:5173` (local dev)
  - `https://yourapp.com` (production)
  - `https://your-preview.lovable.app` (preview)

### Rate Limits
- Default rate limits are fine for most apps
- Adjust in Dashboard → Authentication → Rate Limits if needed

---

## Step 10: Social Auth (Optional)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Set redirect URI: `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
4. In Supabase Dashboard → Authentication → Providers → Google:
   - Enable Google provider
   - Add Client ID and Client Secret

```typescript
// In your auth page
const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/home",
    },
  });
  if (error) console.error(error);
};
```

### GitHub OAuth

1. Go to GitHub → Settings → Developer Settings → OAuth Apps
2. Create new OAuth App
3. Set callback URL: `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
4. In Supabase Dashboard → Authentication → Providers → GitHub:
   - Enable GitHub provider
   - Add Client ID and Client Secret

---

## Step 11: Password Reset

```typescript
// Send reset email
const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
};

// Handle the reset (on the /reset-password page)
const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
};
```

---

## Common Issues

### "Email not confirmed"
- User needs to click the confirmation link in their email
- Check spam folder
- For testing, disable email confirmation in Dashboard

### "Invalid login credentials"
- Verify the email is registered
- Check if the user confirmed their email
- Password must be at least 6 characters

### "User already registered"
- The email is already in use
- User should try signing in or reset their password

### RLS blocking queries
- Make sure `auth.uid()` matches the `user_id` column in your RLS policies
- Check that the user is actually authenticated before making queries
- Use `supabase.auth.getSession()` to verify auth state

---

## Checklist

- [ ] Supabase client created with correct URL and anon key
- [ ] AuthContext wrapping the app
- [ ] Auth page with sign up and sign in
- [ ] Protected routes for authenticated pages
- [ ] `handle_new_user` trigger creating profiles
- [ ] RLS policies on all tables
- [ ] Email confirmation configured
- [ ] Site URL and redirect URLs set
- [ ] Environment variables set in deployment
