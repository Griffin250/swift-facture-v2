# Google OAuth Setup Guide for SwiftFacture

## ✅ Step 1: Enable Google OAuth UI (COMPLETED)
The Google login button has been enabled in your Login.jsx file.

## 🔧 Step 2: Configure Google Cloud Console

### 2.1 Create Google Cloud Project (if not exists)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Google+ API and OAuth consent screen

### 2.2 Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**
2. Choose **External** user type
3. Fill in required fields:
   - App name: `SwiftFacture`
   - User support email: `your-email@domain.com`
   - Developer contact: `your-email@domain.com`
4. Add scopes:
   - `email`
   - `profile`
   - `openid`

### 2.3 Create OAuth Client ID
1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Choose **Web application**
4. Set **Authorized redirect URIs**:
   ```

   http://localhost:5173/auth/callback (for development)
   https://your-production-domain.com/auth/callback (for production)
   ```
5. Save and copy:
   - **Client ID** (looks like: `<YOUR_CLIENT_ID>.apps.googleusercontent.com`)
   - **Client Secret** (looks like: `GOCSPX-<REDACTED>`)

## 🔐 Step 3: Configure Supabase Dashboard

### 3.1 Enable Google Provider
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `<YOUR_PROJECT_ID>`
3. Navigate to **Authentication > Providers**
4. Find **Google** and toggle **Enable sign in with Google**
5. Enter your credentials:
   - **Client ID**: `<YOUR_GOOGLE_CLIENT_ID>`
   - **Client Secret**: `<YOUR_GOOGLE_CLIENT_SECRET>`


### 3.2 Configure Additional Settings
- **Scopes**: `email profile`
- **Additional Provider Settings**: Leave empty for now

## 📝 Step 4: Update Environment Variables


## 🎯 Step 5: Update Login Redirect URL

Your login code already has the correct redirect URL structure. For production, update:

```javascript
const handleGoogleSignIn = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/',
        // redirectTo: 'https://swiftfacture.com/', // For production
      },
    });

    if (error) throw error;
  } catch (error) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  }
};
```

## 🧪 Step 6: Testing Checklist

### Development Testing
- [ ] Google login button appears on `/login` page
- [ ] Clicking redirects to Google OAuth consent screen
- [ ] After Google consent, redirects back to SwiftFacture
- [ ] User is logged in and profile data is saved
- [ ] User appears in Supabase Auth users table

### Production Testing
- [ ] Update redirect URLs to production domain
- [ ] Test OAuth flow on production environment
- [ ] Verify SSL certificates work with OAuth flow

## 🔧 Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**
   - Check Google Cloud Console redirect URIs match Supabase exactly


2. **OAuth consent screen not configured**
   - Complete Step 2.2 above
   - Publish app for production use

3. **User data not saving**
   - Check Supabase Auth settings
   - Verify user profiles table exists and has proper policies

4. **CORS errors in development**
   - Add `http://localhost:5173` to Google Cloud Console authorized origins

## 📋 Next Steps After Setup

1. **Test login flow thoroughly**
2. **Configure user profile mapping** (if needed)
3. **Add error handling for OAuth failures**
4. **Set up email verification flow** (if required)
5. **Configure user role assignment** (for your premium system)

## 🚀 Production Deployment

Before going live:
1. Update all redirect URLs to production domain
2. Move OAuth consent screen to "In production" status
3. Update environment variables for production
4. Test complete flow on production environment

## 🔒 Security Best Practices

**Important**: Never commit real credentials to version control!

1. **Environment Variables**: Store sensitive values in environment variables:
   ```bash
   GOOGLE_CLIENT_ID=<YOUR_ACTUAL_CLIENT_ID>
   GOOGLE_CLIENT_SECRET=<YOUR_ACTUAL_CLIENT_SECRET>
   ```

2. **Local Development**: Use `.env.local` files (add to `.gitignore`)

3. **Production**: Set environment variables in your hosting platform (Vercel, Netlify, etc.)

---

**Current Status**: Google OAuth UI is enabled ✅
**Next Action**: Complete Google Cloud Console configuration (Step 2)