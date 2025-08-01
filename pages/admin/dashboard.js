import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalPhrases: 0,
    approvedPhrases: 0,
    pendingPhrases: 0,
    totalThemes: 0,
    activeThemes: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');
    
    if (!token || !userData) {
      router.push('/admin/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const [phrasesRes, themesRes, pendingRes] = await Promise.all([
        fetch('/api/admin/phrases?limit=1', { headers }),
        fetch('/api/admin/themes?limit=1', { headers }),
        fetch('/api/admin/phrases?status=pending&limit=5', { headers })
      ]);

      if (phrasesRes.ok && themesRes.ok && pendingRes.ok) {
        const phrasesData = await phrasesRes.json();
        const themesData = await themesRes.json();
        const pendingData = await pendingRes.json();

        setStats({
          totalPhrases: phrasesData.pagination.total,
          approvedPhrases: phrasesData.pagination.total - pendingData.pagination.total,
          pendingPhrases: pendingData.pagination.total,
          totalThemes: themesData.pagination.total,
          activeThemes: themesData.themes.filter(t => t.isActive).length,
          recentActivity: pendingData.phrases
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
        color: 'white',
        padding: '1rem 2rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="bingo-title" style={{ margin: 0, fontSize: '1.8rem' }}>
            🎯 Speaker Bingo Admin
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Welcome, {user?.fullName}</span>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{
        background: 'white',
        padding: '1rem 2rem',
        borderBottom: '1px solid #ddd'
      }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <a href="/admin/dashboard" style={{ 
            color: '#FF6B35', 
            textDecoration: 'none', 
            fontWeight: 600,
            borderBottom: '2px solid #FF6B35',
            paddingBottom: '4px'
          }}>
            Dashboard
          </a>
          <a href="/admin/phrases" style={{ color: '#666', textDecoration: 'none' }}>
            Phrases ({stats.totalPhrases})
          </a>
          <a href="/admin/themes" style={{ color: '#666', textDecoration: 'none' }}>
            Themes ({stats.totalThemes})
          </a>
          {stats.pendingPhrases > 0 && (
            <a href="/admin/moderation" style={{ 
              color: '#d32f2f', 
              textDecoration: 'none',
              position: 'relative'
            }}>
              Moderation
              <span style={{
                background: '#d32f2f',
                color: 'white',
                borderRadius: '10px',
                padding: '2px 6px',
                fontSize: '0.7rem',
                marginLeft: '4px'
              }}>
                {stats.pendingPhrases}
              </span>
            </a>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ padding: '2rem' }}>
        {error && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: '1px solid #ffcdd2'
          }}>
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#FF6B35' }}>
              {stats.totalPhrases}
            </div>
            <div style={{ color: '#666' }}>Total Phrases</div>
          </div>

          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#4caf50' }}>
              {stats.approvedPhrases}
            </div>
            <div style={{ color: '#666' }}>Approved</div>
          </div>

          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ff9800' }}>
              {stats.pendingPhrases}
            </div>
            <div style={{ color: '#666' }}>Pending Review</div>
          </div>

          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎨</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#9c27b0' }}>
              {stats.totalThemes}
            </div>
            <div style={{ color: '#666' }}>Themes</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid #eee',
            background: '#f8f9fa'
          }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>📊 Recent Activity</h2>
          </div>
          <div style={{ padding: '1.5rem' }}>
            {stats.recentActivity.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', margin: 0 }}>
                No recent activity
              </p>
            ) : (
              <div>
                {stats.recentActivity.map((phrase, index) => (
                  <div key={phrase._id} style={{
                    padding: '1rem',
                    borderBottom: index < stats.recentActivity.length - 1 ? '1px solid #eee' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                        {phrase.text}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        Created by {phrase.createdBy?.fullName || 'Unknown'} • {' '}
                        {new Date(phrase.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span style={{
                      background: phrase.status === 'approved' ? '#e8f5e8' : '#fff3cd',
                      color: phrase.status === 'approved' ? '#2e7d32' : '#856404',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      textTransform: 'capitalize'
                    }}>
                      {phrase.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/admin/phrases"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
              }}
            >
              💬 Manage Phrases
            </a>
            <a
              href="/admin/themes"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #9c27b0, #673ab7)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)'
              }}
            >
              🎨 Manage Themes
            </a>
            {stats.pendingPhrases > 0 && (
              <a
                href="/admin/moderation"
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #d32f2f, #f44336)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)'
                }}
              >
                🛡️ Review Content ({stats.pendingPhrases})
              </a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}