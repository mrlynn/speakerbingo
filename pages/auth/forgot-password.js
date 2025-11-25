import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function ForgotPassword() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'An error occurred')
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '60px 40px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center',
      }}>
        {/* Logo/Title */}
        <div style={{
          fontSize: '180px',
          marginBottom: '2px',
        }}>
          🃏
        </div>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '2px',
        }}>
          Reset Password
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '30px',
          lineHeight: '1.6',
        }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {success ? (
          <div style={{
            padding: '20px',
            background: '#e8f5e9',
            borderRadius: '12px',
            marginBottom: '20px',
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '10px',
            }}>
              ✓
            </div>
            <p style={{
              color: '#2e7d32',
              fontSize: '16px',
              lineHeight: '1.6',
            }}>
              If an account exists with this email, a password reset link has been sent. 
              Please check your inbox and follow the instructions.
            </p>
            <p style={{
              color: '#666',
              fontSize: '14px',
              marginTop: '10px',
            }}>
              Don't see the email? Check your spam folder.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333',
                textAlign: 'left',
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your.email@example.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
            </div>

            {error && (
              <div style={{
                padding: '16px',
                background: '#fff3e0',
                color: '#e65100',
                borderRadius: '12px',
                fontSize: '14px',
                lineHeight: '1.6',
                border: '2px solid #ffb74d',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>ℹ️</div>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '16px 24px',
                background: isLoading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div style={{
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '1px solid #eee',
        }}>
          <Link href="/auth/signin" style={{
            color: '#667eea',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
          }}>
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

