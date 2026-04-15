Step 1: Deploy the Edge Functions
In your terminal, from your project root:


# Link to your production Supabase project (if not already)
supabase link --project-ref YOUR_PROD_PROJECT_REF

# Deploy both admin edge functions
supabase functions deploy admin-auth
supabase functions deploy admin-data
Step 2: Set the Secret
Go to your Supabase Dashboard → Project Settings → Edge Functions → Secrets (or use CLI):


supabase secrets set ADMIN_SECRET_KEY=your_chosen_secret_key
The secret name must be exactly ADMIN_SECRET_KEY — that's what the edge function code reads via Deno.env.get("ADMIN_SECRET_KEY").

Step 3: Verify JWT Setting
By default, Supabase edge functions require a valid JWT. Your admin functions use their own HMAC auth, so you need to disable JWT verification. In your supabase/config.toml, add:


[
functions.admin-auth
]
verify_jwt = false

[
functions.admin-data
]
verify_jwt = false
Then redeploy:


supabase functions deploy admin-auth
supabase functions deploy admin-data
Step 4: Login
Go to yourdomain.com/ctrl-qx-99 and enter the exact value you set for ADMIN_SECRET_KEY.

Quick Checklist if "Invalid Key" persists:
Secret name is exactly ADMIN_SECRET_KEY (case-sensitive)
The value you type in the login form matches the secret value exactly (no trailing spaces)
Both functions are deployed (supabase functions list to confirm)
verify_jwt = false is set for both functions
Your production app's VITE_SUPABASE_URL points to the correct production project