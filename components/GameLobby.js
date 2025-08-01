import React from 'react'

export default function GameLobby({ 
  mode, 
  setMode, 
  playerName, 
  setPlayerName, 
  roomCode, 
  setRoomCode,
  onCreateGame,
  onJoinGame,
  isMobile,
  onAbout
}) {
  return (
    <div className="lobby-container">
      {/* Title with sunrise effect */}
      <div className="title-section">
        <h1 className="main-title">
          Sunrise Semester
        </h1>
        <h2 className="sub-title">
          BINGO
        </h2>
        
        {/* Decorative sunrise elements */}
        <div className="pulse-bg" />
      </div>

      <div className="game-card">
        <input
          type="text"
          placeholder="Your name"
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          className="name-input"
        />

        {!mode && (
          <div className="button-group">
            <button
              className="create-btn"
              onClick={() => setMode('create')}
              disabled={!playerName}
            >
              🌅 Create New Game
            </button>
            
            <div className="divider">OR</div>
            
            <button
              className="join-btn"
              onClick={() => setMode('join')}
              disabled={!playerName}
            >
              🤝 Join Existing Game
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="button-group">
            <div className="info-box">
              <div className="info-title">
                ✨ Ready to start your sunrise adventure?
              </div>
              <div className="info-subtitle">
                You'll get a unique room code to share with friends!
              </div>
            </div>
            
            <button
              className="start-btn"
              onClick={onCreateGame}
            >
              🚀 Start Game
            </button>
            
            <button
              className="back-btn"
              onClick={() => setMode(null)}
            >
              ← Back
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="button-group">
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="room-code-input"
            />
            
            <button
              className="join-game-btn"
              onClick={onJoinGame}
              disabled={roomCode.length !== 6}
            >
              🎯 Join Game
            </button>
            
            <button
              className="back-btn"
              onClick={() => setMode(null)}
            >
              ← Back
            </button>
          </div>
        )}
      </div>
      
      {/* About button */}
      <button
        className="about-btn-lobby"
        onClick={onAbout}
        title="Learn about the game's origin"
      >
        ℹ️ About this game
      </button>
      
      <style jsx>{`
        .lobby-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 450px;
          margin: 0 auto;
          position: relative;
        }
        
        .title-section {
          text-align: center;
          margin-bottom: 32px;
          position: relative;
        }
        
        .main-title {
          font-family: "Inter", sans-serif;
          font-weight: 900;
          color: white;
          text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.4);
          margin-bottom: 8px;
          font-size: ${isMobile ? '2.5rem' : '4rem'};
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        
        .sub-title {
          font-family: "Inter", sans-serif;
          font-weight: 800;
          color: white;
          font-size: ${isMobile ? '1.8rem' : '3rem'};
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
          margin: 0;
          letter-spacing: 0.1em;
        }
        
        .pulse-bg {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120%;
          height: 120%;
          background: radial-gradient(circle, rgba(255, 193, 7, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          z-index: -1;
          animation: pulse 3s ease-in-out infinite;
        }
        
        .game-card {
          padding: ${isMobile ? '24px' : '32px'};
          width: 100%;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          border: 2px solid rgba(255, 211, 63, 0.4);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }
        
        .game-card:hover {
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }
        
        .name-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #ddd;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          margin-bottom: 24px;
          transition: all 0.3s ease;
        }
        
        .name-input:hover {
          border-color: #F7931E;
        }
        
        .name-input:focus {
          outline: none;
          border-color: #FF6B35;
          border-width: 2px;
        }
        
        .button-group {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .create-btn, .join-btn, .start-btn, .join-game-btn {
          width: 100%;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
        }
        
        .create-btn:hover, .join-btn:hover, .start-btn:hover, .join-game-btn:hover {
          background: linear-gradient(135deg, #F7931E 0%, #FF6B35 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4);
        }
        
        .create-btn:disabled, .join-btn:disabled, .start-btn:disabled, .join-game-btn:disabled {
          background: #FFF3C4;
          color: #999;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .join-btn {
          background: white;
          color: #FF6B35;
          border: 2px solid #F7931E;
          box-shadow: none;
        }
        
        .join-btn:hover {
          background: rgba(255, 107, 53, 0.1);
          color: #FF6B35;
          border-color: #FF6B35;
          transform: translateY(-1px);
        }
        
        .join-btn:disabled {
          background: white;
          border-color: #FFF3C4;
          color: #999;
        }
        
        .divider {
          text-align: center;
          margin: 8px 0;
          color: #666;
          font-weight: 500;
          position: relative;
        }
        
        .divider::before, .divider::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 30%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 211, 63, 0.6), transparent);
        }
        
        .divider::before {
          left: 0;
        }
        
        .divider::after {
          right: 0;
        }
        
        .info-box {
          text-align: center;
          padding: 24px;
          border-radius: 8px;
          background: rgba(255, 211, 63, 0.15);
          border: 1px solid rgba(255, 211, 63, 0.4);
        }
        
        .info-title {
          color: #FF6B35;
          font-weight: 600;
          font-size: 18px;
          margin-bottom: 8px;
        }
        
        .info-subtitle {
          color: #666;
          font-size: 14px;
        }
        
        .room-code-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #ddd;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.9);
          font-size: 1.2rem;
          font-weight: 600;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 2px;
          transition: all 0.3s ease;
        }
        
        .room-code-input:hover {
          border-color: #F7931E;
        }
        
        .room-code-input:focus {
          outline: none;
          border-color: #FF6B35;
          border-width: 2px;
        }
        
        .back-btn {
          width: 100%;
          padding: 8px 16px;
          background: none;
          border: none;
          color: #666;
          font-weight: 500;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .back-btn:hover {
          background: rgba(255, 211, 63, 0.2);
        }
        
        .about-btn-lobby {
          margin-top: 24px;
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 12px 20px;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        
        .about-btn-lobby:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        @keyframes pulse {
          0%, 100% { 
            opacity: 0.3; 
            transform: translate(-50%, -50%) scale(1); 
          }
          50% { 
            opacity: 0.6; 
            transform: translate(-50%, -50%) scale(1.1); 
          }
        }
      `}</style>
    </div>
  )
}