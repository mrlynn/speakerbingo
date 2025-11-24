# Authentication Setup Guide

This guide will help you set up the flexible authentication system for Sunrise Speaker Bingo.

## Overview

The app now supports multiple authentication methods:
- **Google OAuth** (already configured)
- **GitHub OAuth** (needs setup)
- **Email/Password** (credentials-based)
- **Guest Access** (no account required)

## GitHub OAuth Setup

### 1. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Sunrise Speaker Bingo
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret**

### 2. Update Environment Variables

Add these to your `.env.local` file:

```bash
# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your-github-client-id-here
GITHUB_CLIENT_SECRET=your-github-client-secret-here
```

## Email/Password Authentication

The email/password authentication is already configured and will work once MongoDB is properly connected. Users can:

- **Sign Up**: Create a new account with email and password
- **Sign In**: Use existing credentials

## Guest Access

Guest access is automatically available and doesn't require any setup. Users can:

- Play the game without creating an account
- Their progress won't be saved between sessions
- They can upgrade to a full account anytime

## Testing the Authentication

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test each authentication method**:
   - Visit `http://localhost:3000`
   - Try the "Social Login" tab (Google, GitHub)
   - Try the "Sign Up" tab (email/password)
   - Try the "Sign In" tab (existing credentials)
   - Try the "Play as Guest" option

## Production Deployment

For production, update the OAuth callback URLs:

- **Google**: Update in Google Cloud Console
- **GitHub**: Update in GitHub Developer Settings
- **NextAuth URL**: Set `NEXTAUTH_URL` to your production domain

## Security Notes

- The `NEXTAUTH_SECRET` should be a strong, random string in production
- Passwords are hashed using bcryptjs
- Guest sessions are stored in localStorage (not persistent across devices)
- All authentication methods are secure and follow best practices

## Troubleshooting

### MongoDB Connection Issues
- Ensure your MongoDB Atlas cluster is running
- Check that your IP is whitelisted
- Verify the connection string format

### OAuth Issues
- Check that callback URLs match exactly
- Verify client IDs and secrets are correct
- Ensure the OAuth apps are not in development mode restrictions

### Guest Session Issues
- Guest sessions are stored in localStorage
- Clearing browser data will remove guest sessions
- Guest sessions don't sync across devices
