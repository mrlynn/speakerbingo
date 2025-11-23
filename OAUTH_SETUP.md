# OAuth Authentication Setup Guide

This guide will help you set up Google and Facebook OAuth authentication for the Sunrise Semester Bingo application.

## Prerequisites

- MongoDB Atlas cluster (already configured)
- A deployed or local instance of the application
- Access to Google Cloud Console
- Access to Facebook Developers Console

---

## 1. Environment Variables

First, make sure your `.env.local` file has the following variables set:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://...

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000  # Change to your production URL when deploying
NEXTAUTH_SECRET=Kvpy3XsCHyAGPmbT9TT4tTFWVEeNrUBa+ZnlluNKwFM=  # Already generated

# Google OAuth (You'll set these up below)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth (You'll set these up below)
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

---

## 2. Google OAuth Setup

### Step 1: Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project or select an existing one

### Step 2: Enable Google+ API
1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and press **Enable**

### Step 3: Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: `Sunrise Semester Bingo`
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add `email` and `profile`
   - Save and continue

### Step 4: Configure OAuth Client
1. Application type: **Web application**
2. Name: `Sunrise Semester Bingo Web`
3. Authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://your-production-domain.com` (for production)
4. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://your-production-domain.com/api/auth/callback/google` (for production)
5. Click **Create**

### Step 5: Copy Credentials
1. You'll see a popup with your **Client ID** and **Client Secret**
2. Copy the **Client ID** and paste it into your `.env.local` as `GOOGLE_CLIENT_ID`
3. Copy the **Client Secret** and paste it into your `.env.local` as `GOOGLE_CLIENT_SECRET`

---

## 3. Facebook OAuth Setup

### Step 1: Go to Facebook Developers
1. Visit [Facebook Developers](https://developers.facebook.com/)
2. Sign in with your Facebook account
3. Click **My Apps** → **Create App**

### Step 2: Create a New App
1. Select **Consumer** as the app type
2. App name: `Sunrise Semester Bingo`
3. App contact email: Your email
4. Click **Create App**

### Step 3: Add Facebook Login
1. In your app dashboard, find **Facebook Login** in the products list
2. Click **Set Up**
3. Select **Web** as the platform
4. Enter your site URL:
   - For development: `http://localhost:3000`
   - For production: `https://your-production-domain.com`
5. Click **Save** and **Continue**

### Step 4: Configure Facebook Login Settings
1. In the left sidebar, go to **Facebook Login** → **Settings**
2. Under **Valid OAuth Redirect URIs**, add:
   - `http://localhost:3000/api/auth/callback/facebook` (for development)
   - `https://your-production-domain.com/api/auth/callback/facebook` (for production)
3. Click **Save Changes**

### Step 5: Get App Credentials
1. In the left sidebar, go to **Settings** → **Basic**
2. You'll see your **App ID** and **App Secret**
3. Copy the **App ID** and paste it into your `.env.local` as `FACEBOOK_CLIENT_ID`
4. Click **Show** next to **App Secret**, copy it, and paste it into your `.env.local` as `FACEBOOK_CLIENT_SECRET`

### Step 6: Make Your App Live (Production Only)
1. For production, you need to make your app live
2. In the top navigation, toggle the app from **In Development** to **Live**
3. You may need to complete App Review for certain permissions
4. For basic login (email, name, profile picture), no review is needed

---

## 4. Testing Authentication

### Development Testing
1. Start your development server:
   ```bash
   npm run dev
   ```
2. Visit `http://localhost:3000`
3. You should be redirected to the sign-in page
4. Try signing in with both Google and Facebook
5. Verify that:
   - Your name appears in the game header
   - Your profile picture is displayed
   - You can play the game
   - You can log out from the FAB menu

### Production Deployment
1. Update `NEXTAUTH_URL` in your production environment to your actual domain
2. Make sure all OAuth redirect URIs are updated with your production URL
3. Verify that your MongoDB connection string is correct
4. Deploy your application
5. Test authentication in production

---

## 5. Troubleshooting

### Common Issues

#### "Error: redirect_uri_mismatch"
- **Cause**: The redirect URI doesn't match what's configured in OAuth provider
- **Solution**: Double-check that your redirect URIs exactly match in both the OAuth provider settings and your application URL

#### "Error: invalid_client"
- **Cause**: Client ID or Secret is incorrect
- **Solution**: Verify your credentials in `.env.local` match what's shown in the provider console

#### "Error: access_denied"
- **Cause**: User denied permission or app doesn't have required permissions
- **Solution**: Make sure the OAuth consent screen is properly configured and request only necessary permissions

#### Users Can't Sign In
- **Cause**: NextAuth secret not set or MongoDB connection failed
- **Solution**: 
  1. Verify `NEXTAUTH_SECRET` is set in `.env.local`
  2. Check MongoDB connection string is correct
  3. Check server logs for detailed error messages

#### Profile Picture Not Showing
- **Cause**: Image URL not being passed correctly
- **Solution**: Verify the OAuth provider returns the `picture` field (Google) or `picture.data.url` (Facebook)

---

## 6. MongoDB Collections

The authentication system automatically creates these collections in your MongoDB database:

### Collections Created by NextAuth:
- `users` - Stores user account information
- `accounts` - Stores OAuth provider account linkages
- `sessions` - Stores active user sessions

### Collections Created by the App:
- `profiles` - Stores player game statistics and achievements
- `leaderboard` - Stores global leaderboard data
- `games` - Stores multiplayer game states

You don't need to create these manually - they'll be created automatically when first used.

---

## 7. Security Best Practices

1. **Never commit `.env.local` to version control**
   - Add it to `.gitignore` (should already be there)
   - Use environment variables in production hosting platforms

2. **Rotate secrets periodically**
   - Generate a new `NEXTAUTH_SECRET` every few months
   - Update OAuth credentials if compromised

3. **Use HTTPS in production**
   - Never use HTTP for OAuth in production
   - Ensure all redirect URIs use `https://`

4. **Limit OAuth scopes**
   - Only request the permissions you need (email, profile)
   - Avoid requesting unnecessary user data

5. **Monitor for suspicious activity**
   - Check MongoDB logs for unusual access patterns
   - Monitor authentication failure rates

---

## 8. Need Help?

If you run into issues:

1. Check the browser console for error messages
2. Check the server console/logs for backend errors
3. Verify all environment variables are set correctly
4. Make sure MongoDB is accessible
5. Ensure OAuth redirect URIs match exactly

For NextAuth.js specific issues, visit: https://next-auth.js.org/errors

---

## Summary

Once configured, users will:
1. Be required to sign in with Google or Facebook
2. Have their profile picture and name automatically pulled from their account
3. Have their game stats saved to MongoDB tied to their account
4. See their avatar on the leaderboard
5. Be able to access their stats across any device

Authentication is now required to play the game, ensuring all player data is properly tracked and stored.

