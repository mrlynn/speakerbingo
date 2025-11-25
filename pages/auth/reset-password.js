import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function ResetPassword() {
  const router = useRouter()
  const { token } = router.query
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.')
      setIsValidating(false)
    } else {
      setIsValidating(false)
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'An error occurred')
      } else {
        setSuccess(true)
        // Redirect to sign in after 3 seconds
        setTimeout(() => {
          router.push('/auth/signin')
        }, 3000)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidating) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{
          fontSize: '24px',
          color: 'white',
          fontWeight: 'bold',
        }}>
          Loading...
        </div>
      </div>
    )
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
          Set New Password
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '30px',
          lineHeight: '1.6',
        }}>
          Enter your new password below.
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
              Your password has been reset successfully!
            </p>
            <p style={{
              color: '#666',
              fontSize: '14px',
              marginTop: '10px',
            }}>
              Redirecting to sign in page...
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
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="At least 8 characters"
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

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333',
                textAlign: 'left',
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Confirm your password"
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
                padding: '12px',
                background: '#fee',
                color: '#c33',
                borderRadius: '8px',
                fontSize: '14px',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !token}
              style={{
                padding: '16px 24px',
                background: (isLoading || !token) ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: (isLoading || !token) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
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

