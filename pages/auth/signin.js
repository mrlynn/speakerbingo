import { getProviders, signIn, useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { generateGuestName } from "../../lib/guestNames"

export default function SignIn({ providers }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [authMode, setAuthMode] = useState('social') // 'social', 'credentials', 'signup', 'magic'
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    name: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [magicEmail, setMagicEmail] = useState('')

  // Redirect if already signed in
  useEffect(() => {
    if (status === "authenticated") {
      router.push('/')
    }
  }, [status, router])

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
        isSignUp: authMode === 'signup',
        redirect: false
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLinkSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('email', {
        email: magicEmail,
        redirect: false
      })

      if (result?.error) {
        setError(result.error)
      } else {
        setMagicLinkSent(true)
      }
    } catch (err) {
      setError('Failed to send magic link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestAccess = () => {
    // Generate a fun random name for the guest
    const guestName = generateGuestName()

    // Store guest session in localStorage
    const guestSession = {
      user: {
        id: 'guest_' + Date.now(),
        name: guestName,
        email: null,
        image: null
      },
      isGuest: true
    }
    localStorage.setItem('guestSession', JSON.stringify(guestSession))
    router.push('/')
  }

  if (status === "loading") {
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
      padding: '10px',
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
          Speaker Bingo
        </h1>
        <h2 style={{
          fontSize: '24px',
          color: '#666',
          marginBottom: '2px',
          fontWeight: 'normal',
        }}>
          Listen, Laugh, and Win!
        </h2>

        <p style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '2px',
          lineHeight: '1.6',
        }}>
          Choose how you'd like to sign in to start playing and track your stats!
        </p>

        {/* Auth Mode Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          marginBottom: '4px',
          background: '#f5f5f5',
          borderRadius: '12px',
          padding: '4px',
        }}>
          <button
            onClick={() => {
              setAuthMode('social')
              setMagicLinkSent(false)
              setError('')
            }}
            style={{
              padding: '12px 8px',
              borderRadius: '8px',
              border: 'none',
              background: authMode === 'social' ? 'white' : 'transparent',
              color: authMode === 'social' ? '#333' : '#666',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '14px',
            }}
          >
            Social
          </button>
          <button
            onClick={() => {
              setAuthMode('magic')
              setMagicLinkSent(false)
              setError('')
            }}
            style={{
              padding: '12px 8px',
              borderRadius: '8px',
              border: 'none',
              background: authMode === 'magic' ? 'white' : 'transparent',
              color: authMode === 'magic' ? '#333' : '#666',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '14px',
            }}
          >
            ✨ Magic Link
          </button>
          <button
            onClick={() => {
              setAuthMode('credentials')
              setMagicLinkSent(false)
              setError('')
            }}
            style={{
              padding: '12px 8px',
              borderRadius: '8px',
              border: 'none',
              background: authMode === 'credentials' ? 'white' : 'transparent',
              color: authMode === 'credentials' ? '#333' : '#666',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '14px',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setAuthMode('signup')
              setMagicLinkSent(false)
              setError('')
            }}
            style={{
              padding: '12px 8px',
              borderRadius: '8px',
              border: 'none',
              background: authMode === 'signup' ? 'white' : 'transparent',
              color: authMode === 'signup' ? '#333' : '#666',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '14px',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Magic Link */}
        {authMode === 'magic' && (
          magicLinkSent ? (
            <div style={{
              padding: '30px 20px',
              background: '#e8f5e9',
              borderRadius: '12px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📧</div>
              <h3 style={{ color: '#2e7d32', marginBottom: '12px', fontSize: '20px' }}>
                Check Your Email!
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '16px' }}>
                We sent a magic link to <strong>{magicEmail}</strong>
              </p>
              <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                Click the link in the email to sign in. The link will expire in 10 minutes.
              </p>
              <p style={{ color: '#999', fontSize: '12px', marginTop: '16px' }}>
                Don't see it? Check your spam folder.
              </p>
              <button
                onClick={() => {
                  setMagicLinkSent(false)
                  setMagicEmail('')
                }}
                style={{
                  marginTop: '20px',
                  padding: '8px 16px',
                  background: 'transparent',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Send Another Link
              </button>
            </div>
          ) : (
            <form onSubmit={handleMagicLinkSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}>
              <div style={{
                padding: '16px',
                background: '#f8f9fa',
                borderRadius: '12px',
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.6',
                textAlign: 'left',
              }}>
                <strong style={{ color: '#333' }}>✨ Passwordless Sign-In</strong>
                <p style={{ marginTop: '8px', marginBottom: 0 }}>
                  Enter your email and we'll send you a magic link to sign in instantly—no password needed!
                </p>
              </div>

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
                  value={magicEmail}
                  onChange={(e) => setMagicEmail(e.target.value)}
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
                {isLoading ? 'Sending...' : '✨ Send Magic Link'}
              </button>
            </form>
          )
        )}

        {/* Social Login */}
        {authMode === 'social' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
          }}>
            {providers && Object.values(providers).filter(p => p.id !== 'credentials' && p.id !== 'email').map((provider) => {
              const getProviderStyle = (providerId) => {
                switch (providerId) {
                  case 'google':
                    return {
                      background: 'white',
                      color: '#333',
                      border: '2px solid #ddd',
                      icon: '🔍',
                    }
                  case 'github':
                    return {
                      background: '#333',
                      color: 'white',
                      border: 'none',
                      icon: '🐙',
                    }
                  default:
                    return {
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      icon: '🔐',
                    }
                }
              }

              const style = getProviderStyle(provider.id)

              return (
                <button
                  key={provider.name}
                  onClick={() => signIn(provider.id, { callbackUrl: '/' })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    padding: '16px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: style.background,
                    color: style.color,
                    border: style.border,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{style.icon}</span>
                  <span>Continue with {provider.name}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Credentials Form */}
        {(authMode === 'credentials' || authMode === 'signup') && (
          <form onSubmit={handleCredentialsSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}>
            {authMode === 'signup' && (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: '600',
                  color: '#333',
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={credentials.name}
                  onChange={(e) => setCredentials({...credentials, name: e.target.value})}
                  required={authMode === 'signup'}
                  style={{
                    width: '100%',
                    padding: '12px 12px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>
            )}
            
            <div>
              <label style={{
                display: 'block',
                marginBottom: '4px',
                fontWeight: '600',
                color: '#333',
              }}>
                Email
              </label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
            </div>

            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px',
              }}>
                <label style={{
                  fontWeight: '600',
                  color: '#333',
                }}>
                  Password
                </label>
                {authMode === 'credentials' && (
                  <Link href="/auth/forgot-password" style={{
                    fontSize: '14px',
                    color: '#667eea',
                    textDecoration: 'none',
                    fontWeight: '500',
                  }}>
                    Forgot Password?
                  </Link>
                )}
              </div>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
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
              {isLoading ? 'Please wait...' : (authMode === 'signup' ? 'Create Account' : 'Sign In')}
            </button>
          </form>
        )}

        {/* Guest Access */}
        <div style={{
          marginTop: '8px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '8px',
          }}>
            Just want to try it out?
          </p>
          <button
            onClick={handleGuestAccess}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#667eea'
              e.currentTarget.style.color = 'white'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#667eea'
            }}
          >
            Play as Guest
          </button>
          <p style={{
            fontSize: '12px',
            color: '#999',
            marginTop: '6px',
          }}>
            Guest sessions won't save your progress
          </p>
        </div>

        <p style={{
          fontSize: '14px',
          color: '#999',
          marginTop: '6px',
          lineHeight: '1.6',
        }}>
          By signing in, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  const providers = await getProviders()
  return {
    props: { providers },
  }
}

