import React from 'react'
import { getPlayerLevel, ACHIEVEMENTS, exportProfile, importProfile } from '../lib/playerProfile'

export default function PlayerStatsModal({ 
  profile, 
  onClose, 
  onProfileUpdate, 
  isMobile 
}) {
  if (!profile) return null

  const level = getPlayerLevel(profile.stats.totalPoints)
  const unlockedAchievements = profile.achievements.unlocked.map(id => ACHIEVEMENTS[id]).filter(Boolean)

  const handleExport = () => {
    exportProfile(profile)
  }

  const handleImport = async (event) => {
    const file = event.target.files[0]
    if (file) {
      try {
        const importedProfile = await importProfile(file)
        onProfileUpdate(importedProfile)
        alert('Profile imported successfully!')
      } catch (error) {
        alert('Failed to import profile: ' + error.message)
      }
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

  const calculateWinRate = () => {
    if (profile.stats.totalGames === 0) return 0
    return Math.round((profile.stats.totalBingos / profile.stats.totalGames) * 100)
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog stats-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="dialog-title">📊 Player Statistics</h2>
        
        <div className="dialog-content">
          <div className="stats-content">
            
            {/* Player Level Section */}
            <div className="level-section">
              <div className="level-info">
                <div className="level-badge">
                  Level {level.level}
                </div>
                <div className="level-title">{level.title}</div>
              </div>
              {level.nextThreshold && (
                <div className="level-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${level.progress * 100}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {(profile.stats.totalPoints).toLocaleString()} / {level.nextThreshold.toLocaleString()} points
                  </div>
                </div>
              )}
            </div>

            {/* Game Statistics */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🎮</div>
                <div className="stat-value">{profile.stats.totalGames}</div>
                <div className="stat-label">Total Games</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-value">{profile.stats.totalBingos}</div>
                <div className="stat-label">Total Bingos</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-value">{profile.stats.totalPoints.toLocaleString()}</div>
                <div className="stat-label">Total Points</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-value">{calculateWinRate()}%</div>
                <div className="stat-label">Win Rate</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-value">{profile.stats.currentStreak}</div>
                <div className="stat-label">Current Streak</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">⚡</div>
                <div className="stat-value">{formatTime(profile.stats.fastestBingo)}</div>
                <div className="stat-label">Fastest Bingo</div>
              </div>
            </div>

            {/* Achievements Section */}
            <div className="achievements-section">
              <h3>🏅 Achievements ({unlockedAchievements.length})</h3>
              <div className="achievements-grid">
                {unlockedAchievements.map(achievement => (
                  <div key={achievement.id} className="achievement-card">
                    <div className="achievement-icon">{achievement.icon}</div>
                    <div className="achievement-info">
                      <div className="achievement-name">{achievement.name}</div>
                      <div className="achievement-desc">{achievement.description}</div>
                      <div className="achievement-points">+{achievement.points} pts</div>
                    </div>
                  </div>
                ))}
                {unlockedAchievements.length === 0 && (
                  <div className="no-achievements">
                    No achievements unlocked yet. Keep playing to earn your first achievement!
                  </div>
                )}
              </div>
            </div>

            {/* Data Management */}
            <div className="data-section">
              <h3>💾 Data Management</h3>
              <div className="data-info">
                <p>Your progress is saved locally in your browser. Use these options to backup or transfer your data:</p>
              </div>
              <div className="data-actions">
                <button className="export-btn" onClick={handleExport}>
                  📤 Export Profile
                </button>
                <label className="import-btn">
                  📥 Import Profile
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleImport}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <div className="data-note">
                <p><strong>Created:</strong> {formatDate(profile.createdAt)}</p>
                <p><strong>Last Played:</strong> {formatDate(profile.lastPlayed)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="dialog-actions">
          <button className="close-btn primary" onClick={onClose}>
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
          background: white;
          border-radius: 12px;
          border: 3px solid #FFD23F;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          max-width: 700px;
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
          color: #FF6B35;
          padding: 24px 24px 8px;
          animation: bounce 1s ease-in-out infinite;
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
        
        .close-btn {
          background: none;
          border: none;
          color: #666;
          font-weight: 500;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .close-btn:hover {
          background: rgba(255, 211, 63, 0.2);
        }
        
        .close-btn.primary {
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          color: white;
          padding: 12px 32px;
          font-weight: 700;
          font-size: 1rem;
          border-radius: 25px;
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
        }
        
        .close-btn.primary:hover {
          background: linear-gradient(135deg, #F7931E 0%, #FF6B35 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4);
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        
        .stats-modal {
          max-width: 700px;
          max-height: 85vh;
        }
        
        .stats-content {
          line-height: 1.6;
          color: #333;
        }
        
        .level-section {
          text-align: center;
          margin-bottom: 24px;
          padding: 20px;
          background: linear-gradient(135deg, #FFD23F 0%, #FF6B35 100%);
          border-radius: 12px;
          color: white;
        }
        
        .level-info {
          margin-bottom: 12px;
        }
        
        .level-badge {
          font-size: 2rem;
          font-weight: 900;
          font-family: "Inter", sans-serif;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .level-title {
          font-size: 1.2rem;
          font-weight: 600;
          opacity: 0.9;
        }
        
        .level-progress {
          margin-top: 12px;
        }
        
        .progress-bar {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          height: 8px;
          overflow: hidden;
          margin-bottom: 6px;
        }
        
        .progress-fill {
          background: white;
          height: 100%;
          border-radius: 20px;
          transition: width 0.3s ease;
        }
        
        .progress-text {
          font-size: 0.9rem;
          opacity: 0.9;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .stat-card {
          background: rgba(255, 248, 225, 0.8);
          border: 2px solid #FFD23F;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .stat-icon {
          font-size: 2rem;
          margin-bottom: 8px;
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #FF6B35;
          font-family: "Inter", sans-serif;
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 0.8rem;
          color: #666;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .achievements-section {
          margin-bottom: 24px;
        }
        
        .achievements-section h3 {
          color: #FF6B35;
          font-family: "Inter", sans-serif;
          font-weight: 700;
          font-size: 1.2rem;
          margin-bottom: 12px;
        }
        
        .achievements-grid {
          display: grid;
          gap: 12px;
        }
        
        .achievement-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 248, 225, 0.5);
          border: 1px solid #FFD23F;
          border-radius: 8px;
          padding: 12px;
        }
        
        .achievement-icon {
          font-size: 1.5rem;
        }
        
        .achievement-info {
          flex: 1;
        }
        
        .achievement-name {
          font-weight: 700;
          color: #FF6B35;
          margin-bottom: 2px;
        }
        
        .achievement-desc {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 4px;
        }
        
        .achievement-points {
          font-size: 0.8rem;
          color: #F7931E;
          font-weight: 600;
        }
        
        .no-achievements {
          text-align: center;
          color: #666;
          font-style: italic;
          padding: 20px;
        }
        
        .data-section h3 {
          color: #FF6B35;
          font-family: "Inter", sans-serif;
          font-weight: 700;
          font-size: 1.2rem;
          margin-bottom: 12px;
        }
        
        .data-info {
          margin-bottom: 16px;
          color: #666;
          font-size: 0.9rem;
        }
        
        .data-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        
        .export-btn, .import-btn {
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }
        
        .export-btn:hover, .import-btn:hover {
          background: linear-gradient(135deg, #F7931E 0%, #FF6B35 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
        }
        
        .data-note {
          font-size: 0.8rem;
          color: #666;
          background: rgba(255, 248, 225, 0.5);
          padding: 12px;
          border-radius: 8px;
          border: 1px solid rgba(255, 211, 63, 0.3);
        }
        
        .data-note p {
          margin: 0 0 4px 0;
        }
        
        .data-note p:last-child {
          margin: 0;
        }
      `}</style>
    </div>
  )
}