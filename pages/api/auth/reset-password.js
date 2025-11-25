import clientPromise from '../../../lib/mongoClient'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { token, password } = req.body

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required' })
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' })
  }

  try {
    const client = await clientPromise
    const db = client.db()
    const passwordResets = db.collection('passwordResets')
    const accounts = db.collection('accounts')

    // Find reset token
    const resetRequest = await passwordResets.findOne({ 
      token: token,
      used: false
    })

    if (!resetRequest) {
      return res.status(400).json({ error: 'Invalid or expired reset token' })
    }

    // Check if token has expired
    if (new Date() > resetRequest.expiresAt) {
      // Mark as used even though expired
      await passwordResets.updateOne(
        { token: token },
        { $set: { used: true } }
      )
      return res.status(400).json({ error: 'Reset token has expired. Please request a new one.' })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update password in accounts collection
    const result = await accounts.updateOne(
      { 
        userId: resetRequest.userId,
        provider: 'credentials'
      },
      { 
        $set: { passwordHash: hashedPassword }
      }
    )

    if (result.matchedCount === 0) {
      return res.status(400).json({ error: 'Account not found' })
    }

    // Mark reset token as used
    await passwordResets.updateOne(
      { token: token },
      { $set: { used: true, usedAt: new Date() } }
    )

    return res.status(200).json({ 
      message: 'Password has been reset successfully. You can now sign in with your new password.' 
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return res.status(500).json({ error: 'An error occurred. Please try again later.' })
  }
}

