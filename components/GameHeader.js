import React, { useState } from 'react'
import { getPlayerLevel } from '../lib/playerProfile'

export default function GameHeader({
  playerName,
  playerProfile,
  playerAvatar,
  points,
  bonusPoints,
  isMultiplayer,
  roomCode,
  gameState,
  todaysChallenge,
  challengeCompleted,
  challengeProgress,
  isMobile,
  onChallengeClick,
  onShareGame
}) {
  const [showDetails, setShowDetails] = useState(false)
  
  const playerLevel = playerProfile ? getPlayerLevel(playerProfile.stats.totalPoints) : null
  const playerCount = gameState?.players?.length || 1
  const isWaiting = gameState?.status === 'waiting'

  return (
    <div className="game-header">
      <div className="header-main">
        {/* Left Side - Player Info */}
        <div className="player-section">
          <div className="player-identity">
            {playerAvatar && (
              <img 
                src={playerAvatar} 
                alt={playerName} 
                className="player-avatar"
              />
            )}
            <span className="player-name">
              {playerName || 'Guest'}
            </span>
            {playerLevel && (
              <span className="player-level">
                L{playerLevel.level} {playerLevel.title}
              </span>
            )}
          </div>
          
          <div className="points-section">
            <span className="current-points">
              🏆 {points.toLocaleString()}
            </span>
            {bonusPoints > 0 && (
              <span className="bonus-indicator">
                +{bonusPoints}!
              </span>
            )}
          </div>
        </div>

        {/* Center - Game Status */}
        <div className="game-status-section">
          {isMultiplayer && (
            <div className="multiplayer-status">
              <div className="room-badge">
                <span className="room-code">🏠 {roomCode}</span>
                <span className="player-count">
                  👥 {playerCount} player{playerCount !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="multiplayer-actions">
                <button 
                  className="share-game-btn"
                  onClick={onShareGame}
                  title="Share this game with friends"
                >
                  📤 Invite Friends
                </button>
                {isWaiting && (
                  <div className="waiting-indicator">
                    ⏳ Waiting for players...
                  </div>
                )}
              </div>
            </div>
          )}
          
          {todaysChallenge && (
            <div 
              className={`challenge-badge ${challengeCompleted ? 'completed' : 'active'}`}
              onClick={onChallengeClick}
            >
              <span className="challenge-icon">{todaysChallenge.icon}</span>
              <span className="challenge-text">
                {challengeCompleted ? 'Challenge Complete!' : challengeProgress || 'Daily Challenge'}
              </span>
            </div>
          )}
        </div>

        {/* Right Side - Quick Stats */}
        {playerProfile && (
          <div className="quick-stats">
            <button 
              className="stats-toggle"
              onClick={() => setShowDetails(!showDetails)}
              title={showDetails ? 'Hide details' : 'Show details'}
            >
              <span className="stats-preview">
                🎯 {playerProfile.stats.totalBingos} | 🎮 {playerProfile.stats.totalGames}
              </span>
              <span className="toggle-icon">
                {showDetails ? '▲' : '▼'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Expandable Details */}
      {showDetails && playerProfile && (
        <div className="header-details">
          <div className="detailed-stats">
            <div className="stat-group">
              <span className="stat-label">Bingos</span>
              <span className="stat-value">{playerProfile.stats.totalBingos}</span>
            </div>
            <div className="stat-group">
              <span className="stat-label">Games</span>
              <span className="stat-value">{playerProfile.stats.totalGames}</span>
            </div>
            <div className="stat-group">
              <span className="stat-label">High Score</span>
              <span className="stat-value">{playerProfile.stats.highestScore.toLocaleString()}</span>
            </div>
            {playerProfile.stats.currentStreak > 1 && (
              <div className="stat-group streak">
                <span className="stat-label">Streak</span>
                <span className="stat-value">🔥 {playerProfile.stats.currentStreak} days</span>
              </div>
            )}
          </div>
          
          {isMultiplayer && gameState && (
            <div className="player-list">
              <span className="players-label">Players:</span>
              <span className="players-names">
                {gameState.players.map(p => p.name).join(', ')}
              </span>
              <span className="view-players-hint">
                💡 Use menu to view all boards
              </span>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .game-header {
          background: rgba(255, 248, 225, 0.95);
          border: 2px solid rgba(255, 209, 128, 0.6);
          border-radius: 16px;
          margin-bottom: 20px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          overflow: hidden;
        }
        
        .header-main {
          display: grid;
          grid-template-columns: ${isMobile ? '1fr' : '1fr auto 1fr'};
          gap: 16px;
          padding: 16px 20px;
          align-items: center;
        }
        
        .player-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .player-identity {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .player-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid var(--sunrise-gold);
          object-fit: cover;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        .player-name {
          font-weight: 700;
          font-size: ${isMobile ? '1.1rem' : '1.3rem'};
          color: var(--sunrise-navy);
        }
        
        .player-level {
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .points-section {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .current-points {
          font-weight: 700;
          font-size: ${isMobile ? '1rem' : '1.2rem'};
          color: var(--sunrise-rust);
        }
        
        .bonus-indicator {
          background: #28a745;
          color: white;
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          animation: bounce 1s ease-in-out 2;
        }
        
        .game-status-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
        }
        
        .multiplayer-status {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        
        .room-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
        }
        
        .multiplayer-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        
        .share-game-btn {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 3px 12px rgba(40, 167, 69, 0.3);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .share-game-btn:hover {
          background: linear-gradient(135deg, #20c997 0%, #28a745 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(40, 167, 69, 0.4);
        }
        
        .waiting-indicator {
          background: rgba(255, 193, 7, 0.2);
          border: 1px solid rgba(255, 193, 7, 0.5);
          color: #FF6B35;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          animation: pulse 2s ease-in-out infinite;
        }
        
        .challenge-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(155, 89, 182, 0.1);
          border: 2px solid rgba(155, 89, 182, 0.3);
          color: #9B59B6;
          padding: 8px 12px;
          border-radius: 16px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .challenge-badge:hover {
          background: rgba(155, 89, 182, 0.2);
          border-color: rgba(155, 89, 182, 0.5);
          transform: translateY(-1px);
        }
        
        .challenge-badge.completed {
          background: rgba(40, 167, 69, 0.1);
          border-color: rgba(40, 167, 69, 0.3);
          color: #28a745;
        }
        
        .challenge-badge.active {
          animation: glow 3s ease-in-out infinite;
        }
        
        .quick-stats {
          display: flex;
          justify-content: flex-end;
        }
        
        .stats-toggle {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 209, 128, 0.5);
          border-radius: 12px;
          padding: 8px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--sunrise-navy);
          transition: all 0.3s ease;
        }
        
        .stats-toggle:hover {
          background: rgba(255, 255, 255, 1);
          border-color: var(--sunrise-gold);
          transform: translateY(-1px);
        }
        
        .stats-preview {
          font-weight: 600;
        }
        
        .toggle-icon {
          font-size: 0.7rem;
          color: #666;
        }
        
        .header-details {
          border-top: 1px solid rgba(255, 209, 128, 0.3);
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.5);
          animation: slideDown 0.3s ease-out;
        }
        
        .detailed-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          gap: 16px;
          margin-bottom: ${isMultiplayer ? '12px' : '0'};
        }
        
        .stat-group {
          text-align: center;
        }
        
        .stat-group.streak {
          grid-column: span 2;
        }
        
        .stat-label {
          display: block;
          font-size: 0.75rem;
          color: #666;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }
        
        .stat-value {
          display: block;
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--sunrise-rust);
        }
        
        .player-list {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: #666;
        }
        
        .players-label {
          font-weight: 600;
        }
        
        .players-names {
          font-style: italic;
        }
        
        .view-players-hint {
          font-size: 0.75rem;
          color: #888;
          font-style: italic;
          margin-left: 8px;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(155, 89, 182, 0.3); }
          50% { box-shadow: 0 0 15px rgba(155, 89, 182, 0.6); }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 200px;
          }
        }
        
        @media (max-width: 768px) {
          .header-main {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 12px;
          }
          
          .player-section {
            order: 2;
          }
          
          .game-status-section {
            order: 1;
          }
          
          .quick-stats {
            order: 3;
            justify-content: center;
          }
          
          .detailed-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .player-list {
            flex-direction: column;
            text-align: center;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  )
}