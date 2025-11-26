# Google OAuth Setup Guide

## Step 1: Create Google OAuth Credentials

### A. Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Sign in with your **personal Google account** (the one you'll use to create the project)

### B. Create a New Project (or select existing)
1. Click the project dropdown at the top
2. Click "New Project"
3. Name it: "MD System" or any name you prefer
4. Click "Create"

### C. Enable Google+ API
1. Go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and click "Enable"

### D. Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless you have Google Workspace)
3. Click "Create"
4. Fill in required fields:
   - **App name:** Merit & Demerit System
   - **User support email:** Your email
   - **Developer contact email:** Your email
5. Click "Save and Continue"
6. Skip "Scopes" (click "Save and Continue")
7. Add test users if needed (optional during development)
8. Click "Save and Continue"

### E. Create OAuth Client ID
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: **Web application**
4. Name: "MD System Web Client"
5. **Authorized JavaScript origins:**
   - `http://localhost:3000` (for development)
   - Add your production URL later (e.g., `https://your-app.vercel.app`)
6. **Authorized redirect URIs:**
   - `http://localhost:3000/auth/callback` (for development)
   - `https://aieaepthbjaktazjdvcm.supabase.co/auth/v1/callback` (for Supabase)
   - Add your production callback later
7. Click "Create"
8. **Copy the Client ID and Client Secret** (you'll need these!)

---

## Step 2: Configure Supabase

### A. Enable Google Provider
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `aieaepthbjaktazjdvcm`
3. Go to **Authentication** > **Providers**
4. Find "Google" in the list
5. Toggle it **ON**

### B. Add Google Credentials
1. Paste your **Client ID** from Google Cloud Console
2. Paste your **Client Secret** from Google Cloud Console
3. Click "Save"

### C. Configure Redirect URLs (Site URL)
1. Go to **Authentication** > **URL Configuration**
2. Set **Site URL:** `http://localhost:3000` (change to production URL later)
3. Add **Redirect URLs:**
   - `http://localhost:3000/auth/callback`
   - Add production URL later
4. Click "Save"

---

## Step 3: Test Authentication

Once both steps above are complete, you can test the authentication:

1. Start your dev server: `pnpm dev`
2. Go to: http://localhost:3000/login
3. Click "Sign in with Google"
4. Sign in with a Google account
5. You should be redirected back to the app

---

## Environment Variables

Your `.env` file already has these (no changes needed):
```env
NEXT_PUBLIC_SUPABASE_URL=https://aieaepthbjaktazjdvcm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## For Production Deployment

When deploying to Vercel:

1. **Update Google Cloud Console:**
   - Add production URLs to Authorized JavaScript origins
   - Add production callback to Authorized redirect URIs

2. **Update Supabase:**
   - Change Site URL to production domain
   - Add production redirect URLs

3. **Vercel Environment Variables:**
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Security Notes

- ✅ Using personal Google account for Cloud Console is fine
- ✅ The OAuth app will allow any Google user to sign in
- ✅ Role-based access control happens in your app (not in Google)
- ✅ You can restrict by email domain in application logic

---

## Troubleshooting

**Error: "redirect_uri_mismatch"**
- Make sure the redirect URI in Google Cloud Console exactly matches Supabase's callback URL
- No trailing slashes!

**Error: "Email not confirmed"**
- Some Google accounts need email verification in Supabase
- Go to Supabase Auth settings and toggle "Enable email confirmations" OFF for development

**Users can't sign in:**
- Check if OAuth consent screen is published (may need verification for production)
- During development, you can add test users in Google Cloud Console
