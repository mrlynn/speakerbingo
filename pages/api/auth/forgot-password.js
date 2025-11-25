import clientPromise from '../../../lib/mongoClient'
import nodemailer from 'nodemailer'
import { nanoid } from 'nanoid'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  try {
    console.log('🔍 [Password Reset] Request received for email:', email)

    const client = await clientPromise
    const db = client.db()
    const users = db.collection('users')

    // Find user by email
    const user = await users.findOne({ email: email.toLowerCase() })
    console.log('🔍 [Password Reset] User found:', user ? 'YES' : 'NO')

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      console.log('⚠️  [Password Reset] No user found, returning generic success message')
      // Still return success to prevent email enumeration
      return res.status(200).json({
        message: 'If an account exists with this email, a password reset link has been sent.'
      })
    }

    // Check if user has credentials account (not just OAuth)
    const accounts = db.collection('accounts')
    const credentialsAccount = await accounts.findOne({
      userId: user._id,
      provider: 'credentials'
    })
    console.log('🔍 [Password Reset] Credentials account found:', credentialsAccount ? 'YES' : 'NO')

    if (!credentialsAccount) {
      console.log('⚠️  [Password Reset] User exists but no credentials account (OAuth only)')

      // Find which OAuth provider they use
      const oauthAccount = await accounts.findOne({ userId: user._id })
      const provider = oauthAccount?.provider || 'social login'
      const providerName = provider.charAt(0).toUpperCase() + provider.slice(1)

      // User exists but doesn't have password (OAuth only)
      return res.status(400).json({
        error: `This account uses ${providerName} sign-in. Please sign in with ${providerName} instead of using a password.`
      })
    }

    // Generate reset token
    const resetToken = nanoid(32)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Store reset token in database
    const passwordResets = db.collection('passwordResets')
    await passwordResets.insertOne({
      userId: user._id,
      email: user.email,
      token: resetToken,
      expiresAt: expiresAt,
      createdAt: new Date(),
      used: false
    })

    // Send email with reset link
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`
    
    // Get email configuration
    const emailUser = process.env.GOOGLE_EMAIL || process.env.GMAIL_USER || process.env.EMAIL_USER
    const emailPassword = process.env.GOOGLE_APP_PASSWORD || process.env.EMAIL_PASSWORD

    console.log('🔍 [Password Reset] Email config check:')
    console.log('  - GOOGLE_EMAIL:', process.env.GOOGLE_EMAIL ? '✓ SET' : '✗ MISSING')
    console.log('  - GOOGLE_APP_PASSWORD:', process.env.GOOGLE_APP_PASSWORD ? '✓ SET' : '✗ MISSING')
    console.log('  - Using email:', emailUser)

    if (!emailUser || !emailPassword) {
      console.error('❌ [Password Reset] Email configuration missing. Please set GOOGLE_EMAIL and GOOGLE_APP_PASSWORD in .env.local')
      return res.status(500).json({ error: 'Email service not configured. Please contact support.' })
    }

    console.log('📧 [Password Reset] Creating email transporter...')
    // Configure nodemailer with Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword
      }
    })

    // Verify transporter configuration
    try {
      await transporter.verify()
      console.log('✅ [Password Reset] Email transporter verified successfully')
    } catch (verifyError) {
      console.error('❌ [Password Reset] Email transporter verification failed:', verifyError)
      return res.status(500).json({ error: 'Email service configuration error. Please contact support.' })
    }

    const mailOptions = {
      from: emailUser,
      to: user.email,
      subject: 'Reset Your Password - Speaker Bingo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Reset Your Password</h2>
          <p>Hello ${user.name || 'there'},</p>
          <p>We received a request to reset your password for your Speaker Bingo account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            © Speaker Bingo
          </p>
        </div>
      `
    }

    console.log('📧 [Password Reset] Sending email to:', user.email)
    console.log('📧 [Password Reset] Reset URL:', resetUrl)

    const emailResult = await transporter.sendMail(mailOptions)
    console.log('✅ [Password Reset] Email sent successfully!', emailResult)

    return res.status(200).json({
      message: 'If an account exists with this email, a password reset link has been sent.'
    })
  } catch (error) {
    console.error('❌ [Password Reset] Error:', error)
    console.error('Error details:', error.message)
    console.error('Error stack:', error.stack)
    return res.status(500).json({ error: 'An error occurred. Please try again later.' })
  }
}

