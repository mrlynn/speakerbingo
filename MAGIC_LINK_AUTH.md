# Magic Link Authentication

## Overview

Passwordless email authentication (Magic Links) has been added to Speaker Bingo. Users can sign in by receiving a one-time link via email—no password required!

## Features

### User Experience
- **Passwordless Sign-In**: Users enter only their email address
- **Instant Access**: Click the magic link in your email to sign in
- **Secure**: Links expire after 10 minutes
- **Beautiful Emails**: Branded HTML email templates with gradient buttons

### How It Works
1. User clicks "✨ Magic Link" tab on sign-in page
2. User enters their email address
3. System sends a beautiful branded email with a sign-in link
4. User clicks the link in their email
5. User is automatically signed in and redirected to the app

## Configuration

The magic link feature uses the same email configuration as password reset:

```bash
# In .env.local
GOOGLE_EMAIL=your-email@gmail.com
GOOGLE_APP_PASSWORD=your-16-character-app-password
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## Technical Details

### Email Provider
- **NextAuth Email Provider**: Built-in support for passwordless auth
- **SMTP**: Gmail SMTP (smtp.gmail.com:587)
- **Token Storage**: MongoDB via MongoDBAdapter
- **Token Expiry**: 10 minutes

### Database Collections
NextAuth automatically creates these collections:
- `verification_tokens`: Stores magic link tokens
  ```javascript
  {
    identifier: "user@example.com",
    token: "hashed-token",
    expires: Date
  }
  ```
- `users`: Stores user accounts
- `accounts`: Links authentication methods to users
- `sessions`: Manages user sessions

### Security Features
- ✅ Tokens expire after 10 minutes
- ✅ Tokens are single-use (deleted after verification)
- ✅ Tokens are cryptographically hashed
- ✅ Email verification ensures ownership
- ✅ No password storage needed
- ✅ Works seamlessly with existing OAuth and password logins

## User Interface

### Sign-In Page Tabs
The sign-in page now has a 2x2 grid layout:
1. **Social** - Google OAuth
2. **✨ Magic Link** - Passwordless email (NEW!)
3. **Sign In** - Email + Password
4. **Sign Up** - Create new account

### Magic Link Tab
- Clean, simple email input
- Informative description of passwordless auth
- Success state showing "Check Your Email"
- Ability to resend magic link

## Email Template

The magic link email includes:
- 🃏 Speaker Bingo branding
- Gradient button matching app design
- Plain text URL fallback
- Clear expiration notice (10 minutes)
- Professional formatting

## Testing

1. **Send Magic Link**:
   - Go to `/auth/signin`
   - Click "✨ Magic Link" tab
   - Enter your email address
   - Click "Send Magic Link"

2. **Check Email**:
   - Look for email from your configured `GOOGLE_EMAIL`
   - Subject: "Sign in to Speaker Bingo"
   - Should arrive within seconds

3. **Sign In**:
   - Click the "Sign In" button in the email
   - You'll be redirected to the app and signed in
   - Check that your session is active

4. **Test Security**:
   - Try using the same link twice (should fail)
   - Wait 10+ minutes and try old link (should fail)

## Benefits

### For Users
- **No Password Fatigue**: No need to remember another password
- **Faster Sign-In**: Just click the email link
- **More Secure**: Can't be phished for a password
- **Modern UX**: Feels like Slack, Notion, or other modern apps

### For Your App
- **Reduced Support**: No "forgot password" tickets for magic link users
- **Better Security**: No password breaches to worry about
- **Higher Conversion**: Easier sign-up = more users
- **Professional**: Modern authentication standard

## Files Modified

- `pages/api/auth/[...nextauth].js` - Added EmailProvider configuration
- `pages/auth/signin.js` - Added Magic Link UI tab and form
- `.env.local` - Uses existing GOOGLE_EMAIL and GOOGLE_APP_PASSWORD

## Troubleshooting

### Email Not Sending
- Verify `GOOGLE_EMAIL` and `GOOGLE_APP_PASSWORD` are set
- Check server console for email errors
- Ensure Gmail app password is valid

### Link Not Working
- Check that `NEXTAUTH_URL` matches your domain
- Verify token hasn't expired (10 min limit)
- Check that link hasn't been used already
- Look for console errors in browser/server

### User Already Exists
- Magic links work with existing users
- If user signed up with OAuth, magic link creates a new email provider link
- Users can have multiple auth methods (OAuth + Magic Link)

## Future Enhancements

Potential improvements:
- [ ] Customizable link expiry time
- [ ] Rate limiting for magic link requests
- [ ] Admin dashboard to view magic link usage stats
- [ ] Mobile-optimized email templates
- [ ] Support for other email providers (SendGrid, AWS SES)
