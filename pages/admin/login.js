import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      router.push('/admin/phrases')
    }
  }, [router])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'

    if (password === adminPassword) {
      localStorage.setItem('adminToken', 'admin-authenticated')
      localStorage.setItem('adminUser', JSON.stringify({
        fullName: 'Admin',
        role: 'super_admin'
      }))
      router.push('/admin/phrases')
    } else {
      setError('Invalid password')
    }

    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Admin Login</h1>
        <p className="subtitle">Speaker Bingo Administration</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button type="submit" disabled={loading || !password}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="hint">Set NEXT_PUBLIC_ADMIN_PASSWORD in environment</p>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .login-card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }

        h1 {
          margin: 0 0 8px 0;
          text-align: center;
          color: #333;
        }

        .subtitle {
          text-align: center;
          color: #666;
          margin: 0 0 24px 0;
        }

        .error {
          background: #fee;
          color: #c00;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          text-align: center;
        }

        input {
          width: 100%;
          padding: 14px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          margin-bottom: 16px;
          box-sizing: border-box;
        }

        input:focus {
          outline: none;
          border-color: #667eea;
        }

        button {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        button:hover:not(:disabled) {
          opacity: 0.9;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .hint {
          text-align: center;
          color: #999;
          font-size: 12px;
          margin-top: 24px;
        }
      `}</style>
    </div>
  )
}
