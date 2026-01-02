# Magic Link Rate Limiting Issue - Fix

## Problem

Users were experiencing a 23-hour wait period before they could request another magic link to sign in. This was causing frustration and preventing users from logging back in.

## Root Cause

**This is NOT related to guest access.** Guest users don't use magic links at all - they use localStorage-based sessions.

The issue is caused by **NextAuth's built-in rate limiting** for the EmailProvider (magic links). NextAuth has security measures in place to prevent abuse and spam, which includes limiting how frequently magic link emails can be sent to the same email address. The default rate limit is approximately 24 hours, which explains why users were seeing "23 or so hours" wait times.

## What Was Fixed

### 1. Token Cleanup (Backend)
- Added automatic cleanup of expired verification tokens before sending new magic links
- This helps prevent token accumulation that could contribute to rate limiting issues
- Location: `pages/api/auth/[...nextauth].js` in the `sendVerificationRequest` function

### 2. Better Error Messages (Frontend)
- Improved error handling to detect rate limiting errors
- Provides clear, helpful messages when rate limiting occurs
- Suggests alternative sign-in methods (Google OAuth, password)
- Location: `pages/auth/signin.js` in the `handleMagicLinkSubmit` function

### 3. User Guidance (UI)
- Added helpful note in the magic link section suggesting users try other methods if they encounter issues
- Makes it clear that alternative sign-in methods are available

## Important Notes

### Rate Limiting Still Exists
NextAuth's rate limiting is a security feature and cannot be completely disabled. However, the improvements made should:
- Reduce false positives by cleaning up old tokens
- Provide better user experience with clear error messages
- Guide users to alternative sign-in methods

### Alternative Sign-In Methods
Users who encounter rate limiting can:
1. **Use Google OAuth** - No rate limiting, instant sign-in
2. **Use Email/Password** - If they have a password set up
3. **Wait for the rate limit to expire** - Usually 24 hours from the last request

### Guest Access
Guest access is completely separate and unaffected by this issue. Guest users:
- Don't use authentication at all
- Use localStorage for session management
- Can play immediately without any wait time
- Can switch to authenticated access anytime (but may hit rate limits if using magic links)

## Testing

To test the improvements:
1. Request a magic link
2. If you encounter rate limiting, you should see a clear error message
3. The error message should suggest using Google sign-in or password
4. Try using an alternative sign-in method

## Future Improvements

Potential enhancements:
- [ ] Implement custom rate limiting with more lenient limits
- [ ] Add a "resend link" feature that checks for existing valid tokens
- [ ] Show countdown timer for rate limit expiration
- [ ] Add admin dashboard to view and manage rate limits
- [ ] Consider implementing a custom email provider that bypasses NextAuth's rate limiting

## Files Modified

- `pages/api/auth/[...nextauth].js` - Added token cleanup in sendVerificationRequest
- `pages/auth/signin.js` - Improved error handling and user guidance

## Related Documentation

- `MAGIC_LINK_AUTH.md` - Original magic link implementation
- `AUTHENTICATION_SETUP.md` - General authentication setup
