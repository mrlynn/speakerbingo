# Password Reset Setup Guide

## Overview

Password reset functionality has been implemented for users with email/password credentials. Users can request a password reset link via email and set a new password.

## Environment Variables

Add the following to your `.env.local` file:

```bash
# Email Configuration (for password reset emails)
GOOGLE_EMAIL=your-email@gmail.com
GOOGLE_APP_PASSWORD=your-16-character-app-password

# Or alternatively:
# GMAIL_USER=your-email@gmail.com
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASSWORD=your-app-password
```

### Getting a Google App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (must be enabled)
3. Scroll down to **App passwords**
4. Select **Mail** and **Other (Custom name)**
5. Enter "Speaker Bingo" as the name
6. Click **Generate**
7. Copy the 16-character password (spaces don't matter)
8. Add it to `.env.local` as `GOOGLE_APP_PASSWORD`

**Note**: You cannot use your regular Gmail password. You must use an App Password.

## Features

### 1. Request Password Reset
- **Page**: `/auth/forgot-password`
- **API**: `POST /api/auth/forgot-password`
- Users enter their email address
- System sends a password reset link (valid for 1 hour)
- Security: Doesn't reveal if email exists (prevents email enumeration)

### 2. Reset Password
- **Page**: `/auth/reset-password?token=...`
- **API**: `POST /api/auth/reset-password`
- Users enter new password (minimum 8 characters)
- Token is validated and marked as used
- Password is securely hashed with bcrypt

## User Flow

1. User clicks "Forgot Password?" on sign-in page
2. User enters email address on forgot password page
3. System sends email with reset link (if account exists with credentials)
4. User clicks link in email (valid for 1 hour)
5. User enters new password on reset page
6. Password is updated and user is redirected to sign-in

## Security Features

- ✅ Tokens expire after 1 hour
- ✅ Tokens are single-use (marked as used after reset)
- ✅ Passwords are hashed with bcrypt (12 rounds)
- ✅ Email enumeration prevention (same message for existing/non-existing emails)
- ✅ Only works for users with credentials accounts (not OAuth-only users)
- ✅ Minimum password length: 8 characters

## MongoDB Collections

### passwordResets
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  email: String,
  token: String,        // 32-character nanoid
  expiresAt: Date,      // 1 hour from creation
  createdAt: Date,
  used: Boolean,
  usedAt: Date          // Set when token is used
}
```

## Testing

1. **Test Request Reset**:
   - Go to `/auth/forgot-password`
   - Enter a valid email with credentials account
   - Check email inbox for reset link

2. **Test Reset Password**:
   - Click the reset link from email
   - Enter new password (min 8 characters)
   - Verify password is updated
   - Try signing in with new password

3. **Test Security**:
   - Try using same token twice (should fail)
   - Try using expired token (wait 1+ hour, should fail)
   - Try resetting OAuth-only account (should not send email)

## Troubleshooting

### Email Not Sending
- Verify `GOOGLE_EMAIL` and `GOOGLE_APP_PASSWORD` are set in `.env.local`
- Check that 2-Step Verification is enabled on Google account
- Verify app password is correct (16 characters, no spaces needed)
- Check server logs for email errors

### Token Invalid/Expired
- Tokens expire after 1 hour
- Tokens can only be used once
- Request a new reset link if needed

### User Not Found
- Password reset only works for users with credentials accounts
- OAuth-only users (Google/Facebook) don't have passwords to reset
- User must have signed up with email/password

## Files Created

- `pages/api/auth/forgot-password.js` - Request reset endpoint
- `pages/api/auth/reset-password.js` - Reset password endpoint
- `pages/auth/forgot-password.js` - Request reset UI
- `pages/auth/reset-password.js` - Reset password UI
- Updated `pages/auth/signin.js` - Added "Forgot Password?" link

## Dependencies Added

- `nodemailer` - For sending email via Gmail SMTP

