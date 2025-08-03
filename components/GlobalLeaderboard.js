import React, { useState, useEffect } from 'react'

export default function GlobalLeaderboard({ isOpen, onClose, isMobile }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard()
    }
  }, [isOpen])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/leaderboard/global')
      const data = await response.json()
      
      if (response.ok) {
        setLeaderboard(data.leaderboard || [])
      } else {
        setError('Failed to load leaderboard')
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      setError('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  const getRankEmoji = (rank) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  const getRankClass = (rank) => {
    switch (rank) {
      case 1: return 'rank-gold'
      case 2: return 'rank-silver'
      case 3: return 'rank-bronze'
      default: return 'rank-regular'
    }
  }

  if (!isOpen) return null

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog leaderboard-modal sunrise-dialog" onClick={(e) => e.stopPropagation()}>
        <h2 className="dialog-title sunrise-dialog-title">🏆 Global Leaderboard</h2>
        
        <div className="dialog-content">
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner">🌅</div>
              <p>Loading top players...</p>
            </div>
          )}
          
          {error && (
            <div className="error-state">
              <p>❌ {error}</p>
              <button className="retry-btn sunrise-button" onClick={fetchLeaderboard}>
                🔄 Try Again
              </button>
            </div>
          )}
          
          {!loading && !error && (
            <>
              <div className="leaderboard-header">
                <p>Top 10 players worldwide • Updated in real-time</p>
              </div>
              
              {leaderboard.length === 0 ? (
                <div className="empty-leaderboard">
                  <p>🎯 No players yet! Be the first to make the leaderboard!</p>
                </div>
              ) : (
                <div className="leaderboard-list">
                  {leaderboard.map((player, index) => (
                    <div key={player.playerId} className={`leaderboard-entry ${getRankClass(index + 1)}`}>
                      <div className="rank-section">
                        <div className="rank-indicator">
                          {getRankEmoji(index + 1)}
                        </div>
                      </div>
                      
                      <div className="player-info">
                        <div className="player-name">{player.playerName}</div>
                        <div className="player-level">
                          {player.achievementsCount} achievement{player.achievementsCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                      
                      <div className="stats-grid">
                        <div className="stat-item">
                          <div className="stat-value">{player.totalPoints.toLocaleString()}</div>
                          <div className="stat-label">Points</div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-value">{player.totalBingos}</div>
                          <div className="stat-label">Bingos</div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-value">{player.winRate}%</div>
                          <div className="stat-label">Win Rate</div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-value">{formatTime(player.fastestBingo)}</div>
                          <div className="stat-label">Fastest</div>
                        </div>
                      </div>
                      
                      <div className="last-played">
                        {formatDate(player.lastPlayed)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="dialog-actions">
          <button className="close-btn sunrise-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
        .dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        
        .dialog {
          background: rgba(255, 248, 225, 0.98);
          border-radius: 20px;
          border: 3px solid var(--sunrise-gold);
          box-shadow: 0 8px 32px rgba(139, 69, 19, 0.2);
          max-width: 800px;
          width: 100%;
          max-height: 85vh;
          overflow-y: auto;
          position: relative;
        }
        
        .dialog-title {
          text-align: center;
          font-size: ${isMobile ? '2rem' : '2.5rem'};
          font-family: "Inter", sans-serif;
          font-weight: 900;
          color: var(--sunrise-rust);
          padding: 24px 24px 8px;
          text-shadow: 
            3px 3px 6px rgba(255, 255, 255, 0.6),
            -1px -1px 3px rgba(139, 69, 19, 0.3);
          letter-spacing: -0.01em;
        }
        
        .dialog-content {
          padding: 0 24px 16px;
        }
        
        .dialog-actions {
          display: flex;
          justify-content: center;
          padding: 0 24px 24px;
        }
        
        .loading-state, .error-state, .empty-leaderboard {
          text-align: center;
          padding: 40px 20px;
          color: var(--sunrise-navy);
        }
        
        .loading-spinner {
          font-size: 3rem;
          animation: spin 2s linear infinite;
          margin-bottom: 16px;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .retry-btn {
          margin-top: 16px;
        }
        
        .leaderboard-header {
          text-align: center;
          margin-bottom: 24px;
          color: var(--sunrise-navy);
          font-style: italic;
        }
        
        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .leaderboard-entry {
          display: grid;
          grid-template-columns: auto 1fr auto auto;
          gap: 16px;
          align-items: center;
          padding: 16px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.7);
          border: 2px solid rgba(255, 209, 128, 0.5);
          transition: all 0.3s ease;
          position: relative;
        }
        
        .leaderboard-entry:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(255, 215, 128, 0.3);
        }
        
        .leaderboard-entry.rank-gold {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          border-color: #FFD700;
          color: white;
          font-weight: 700;
        }
        
        .leaderboard-entry.rank-silver {
          background: linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%);
          border-color: #C0C0C0;
          color: white;
          font-weight: 600;
        }
        
        .leaderboard-entry.rank-bronze {
          background: linear-gradient(135deg, #CD7F32 0%, #B87333 100%);
          border-color: #CD7F32;
          color: white;
          font-weight: 600;
        }
        
        .rank-section {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .rank-indicator {
          font-size: 1.5rem;
          font-weight: 900;
          min-width: 40px;
          text-align: center;
        }
        
        .player-info {
          min-width: 0;
        }
        
        .player-name {
          font-weight: 700;
          font-size: 1.1rem;
          color: inherit;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .player-level {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-top: 2px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          min-width: 200px;
        }
        
        .stat-item {
          text-align: center;
        }
        
        .stat-value {
          font-weight: 700;
          font-size: 0.9rem;
          color: inherit;
        }
        
        .stat-label {
          font-size: 0.7rem;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .last-played {
          font-size: 0.8rem;
          opacity: 0.7;
          white-space: nowrap;
        }
        
        @media (max-width: 768px) {
          .dialog {
            margin: 10px;
            max-width: calc(100vw - 20px);
          }
          
          .leaderboard-entry {
            grid-template-columns: auto 1fr;
            grid-template-rows: auto auto;
            gap: 8px;
          }
          
          .stats-grid {
            grid-column: 1 / -1;
            grid-template-columns: repeat(2, 1fr);
            margin-top: 8px;
          }
          
          .last-played {
            grid-column: 1 / -1;
            text-align: center;
            margin-top: 4px;
          }
        }
      `}</style>
    </div>
  )
}