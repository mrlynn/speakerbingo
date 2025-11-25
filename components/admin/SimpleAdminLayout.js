import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function SimpleAdminLayout({ children, title = 'Admin' }) {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    const userData = localStorage.getItem('adminUser')

    if (!token || !userData) {
      router.push('/admin/login')
      return
    }

    setUser(JSON.parse(userData))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    router.push('/admin/login')
  }

  const menuItems = [
    { text: 'Phrases', path: '/admin/phrases', emoji: '💬' },
    { text: 'Categories', path: '/admin/categories', emoji: '📁' },
  ]

  if (!user) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="admin-layout">
      <nav className="sidebar">
        <div className="logo">
          <Link href="/">Speaker Bingo</Link>
        </div>
        <div className="nav-title">Admin</div>
        <ul className="nav-menu">
          {menuItems.map(item => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={router.pathname === item.path ? 'active' : ''}
              >
                <span className="emoji">{item.emoji}</span>
                {item.text}
              </Link>
            </li>
          ))}
        </ul>
        <div className="user-section">
          <div className="user-info">{user.fullName}</div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <main className="main-content">
        <header className="page-header">
          <h1>{title}</h1>
        </header>
        <div className="content">
          {children}
        </div>
      </main>

      <style jsx>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #f5f5f5;
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          font-size: 18px;
          color: #666;
        }

        .sidebar {
          width: 220px;
          background: #2c3e50;
          color: white;
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
        }

        .logo {
          padding: 20px;
          font-size: 18px;
          font-weight: bold;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .logo :global(a) {
          color: white;
          text-decoration: none;
        }

        .nav-title {
          padding: 15px 20px 10px;
          font-size: 12px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          letter-spacing: 1px;
        }

        .nav-menu {
          list-style: none;
          padding: 0;
          margin: 0;
          flex: 1;
        }

        .nav-menu li :global(a) {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          color: rgba(255,255,255,0.8);
          text-decoration: none;
          transition: all 0.2s;
        }

        .nav-menu li :global(a:hover),
        .nav-menu li :global(a.active) {
          background: rgba(255,255,255,0.1);
          color: white;
        }

        .emoji {
          margin-right: 10px;
          font-size: 18px;
        }

        .user-section {
          padding: 15px 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .user-info {
          font-size: 14px;
          margin-bottom: 10px;
          color: rgba(255,255,255,0.7);
        }

        .logout-btn {
          width: 100%;
          padding: 8px;
          background: rgba(255,255,255,0.1);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .logout-btn:hover {
          background: rgba(255,255,255,0.2);
        }

        .main-content {
          flex: 1;
          margin-left: 220px;
          min-height: 100vh;
        }

        .page-header {
          background: white;
          padding: 20px 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .page-header h1 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }

        .content {
          padding: 30px;
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 60px;
          }

          .logo, .nav-title, .user-info {
            display: none;
          }

          .nav-menu li :global(a) {
            padding: 15px;
            justify-content: center;
          }

          .emoji {
            margin: 0;
          }

          .main-content {
            margin-left: 60px;
          }

          .logout-btn {
            font-size: 12px;
            padding: 6px;
          }
        }
      `}</style>
    </div>
  )
}
