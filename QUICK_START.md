# Quick Start Guide - Sunrise Semester Bingo

## 🎯 What You Need to Do Next

Your Bingo app now has **required** Facebook and Google authentication! Here's what you need to do to get it running:

---

## Step 1: Update Environment Variables

Open your `.env.local` file and update the `NEXTAUTH_SECRET`:

```bash
NEXTAUTH_SECRET=Kvpy3XsCHyAGPmbT9TT4tTFWVEeNrUBa+ZnlluNKwFM=
```

---

## Step 2: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable Google+ API
4. Create OAuth credentials:
   - Application type: **Web application**
   - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy your Client ID and Secret to `.env.local`:
   ```bash
   GOOGLE_CLIENT_ID=your-google-client-id-here
   GOOGLE_CLIENT_SECRET=your-google-secret-here
   ```

📖 **Detailed instructions**: See `OAUTH_SETUP.md` Section 2

---

## Step 3: Set Up Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app (Consumer type)
3. Add **Facebook Login** product
4. Configure Valid OAuth Redirect URI: `http://localhost:3000/api/auth/callback/facebook`
5. Copy your App ID and Secret to `.env.local`:
   ```bash
   FACEBOOK_CLIENT_ID=your-facebook-app-id-here
   FACEBOOK_CLIENT_SECRET=your-facebook-secret-here
   ```

📖 **Detailed instructions**: See `OAUTH_SETUP.md` Section 3

---

## Step 4: Test It!

```bash
npm run dev
```

Then:
1. Visit http://localhost:3000
2. You should see a sign-in page
3. Try signing in with Google
4. Try signing in with Facebook
5. Play a game!

---

## ✅ What Changed

- ✅ **Required Login**: Users must sign in to play
- ✅ **Auto Profile**: Name and avatar from Google/Facebook
- ✅ **Persistent Stats**: Saved to MongoDB (not localStorage)
- ✅ **Avatars Everywhere**: Header, leaderboard, etc.
- ✅ **Logout Button**: In the FAB menu
- ✅ **Cross-Device**: Access stats from any device

---

## 📁 Your .env.local Should Look Like This

```bash
# Existing (get these from your .env.local or create new ones)
VOYAGE_API_KEY=your-voyage-api-key
MONGODB_URI=your-mongodb-connection-string
GOOGLE_API_KEY=your-google-api-key
SERVERLESS_URL=your-serverless-url
OPENAI_API_KEY=your-openai-api-key

# NEW - You need to add these:
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

---

## 🆘 Troubleshooting

### "Error: redirect_uri_mismatch"
➡️ Make sure your OAuth redirect URIs match exactly:
- Google: `http://localhost:3000/api/auth/callback/google`
- Facebook: `http://localhost:3000/api/auth/callback/facebook`

### "Error: invalid_client"
➡️ Check that your Client ID and Secret are correct in `.env.local`

### Can't see the sign-in page
➡️ Make sure the app is running on port 3000 (`npm run dev`)

### Profile picture not showing
➡️ This is normal during development. Make sure the OAuth provider has your picture set.

---

## 📚 Full Documentation

- **`OAUTH_SETUP.md`** - Complete OAuth setup guide with screenshots
- **`AUTHENTICATION_IMPLEMENTATION.md`** - Technical details of what was built
- **`README.md`** - Full project documentation

---

## 🎮 Ready to Play!

Once you've set up OAuth credentials, you're all set! Users will now:
1. Sign in with Google or Facebook
2. See their name and avatar automatically
3. Have stats saved permanently to MongoDB
4. Access their progress from any device

Enjoy your authenticated Bingo game! 🎉

