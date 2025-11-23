import { getProviders, signIn, useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"

export default function SignIn({ providers }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [authMode, setAuthMode] = useState('social') // 'social', 'credentials', 'signup'
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    name: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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

  const handleGuestAccess = () => {
    // Store guest session in localStorage
    const guestSession = {
      user: {
        id: 'guest_' + Date.now(),
        name: 'Guest Player',
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
          fontSize: '48px',
          marginBottom: '10px',
        }}>
          🎮
        </div>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px',
        }}>
          Sunrise Semester
        </h1>
        <h2 style={{
          fontSize: '24px',
          color: '#666',
          marginBottom: '40px',
          fontWeight: 'normal',
        }}>
          Speaker Bingo
        </h2>

        <p style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '30px',
          lineHeight: '1.6',
        }}>
          Choose how you'd like to sign in to start playing and track your stats!
        </p>

        {/* Auth Mode Tabs */}
        <div style={{
          display: 'flex',
          marginBottom: '30px',
          background: '#f5f5f5',
          borderRadius: '12px',
          padding: '4px',
        }}>
          <button
            onClick={() => setAuthMode('social')}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: authMode === 'social' ? 'white' : 'transparent',
              color: authMode === 'social' ? '#333' : '#666',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Social Login
          </button>
          <button
            onClick={() => setAuthMode('credentials')}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: authMode === 'credentials' ? 'white' : 'transparent',
              color: authMode === 'credentials' ? '#333' : '#666',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setAuthMode('signup')}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: authMode === 'signup' ? 'white' : 'transparent',
              color: authMode === 'signup' ? '#333' : '#666',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Social Login */}
        {authMode === 'social' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
          }}>
            {providers && Object.values(providers).filter(p => p.id !== 'credentials').map((provider) => {
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
                  marginBottom: '8px',
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
            )}
            
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
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
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333',
              }}>
                Password
              </label>
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
          marginTop: '20px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '15px',
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
            marginTop: '10px',
          }}>
            Guest sessions won't save your progress
          </p>
        </div>

        <p style={{
          fontSize: '14px',
          color: '#999',
          marginTop: '30px',
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

