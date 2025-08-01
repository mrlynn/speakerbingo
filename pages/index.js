import React, { useState, useEffect, useCallback } from 'react'
import GameLobby from '../components/GameLobby'
import { PHRASE_CATEGORIES, getRandomPhrasesFromCategory } from '../lib/phrases'

function generateGrid(categoryKey = 'sunrise-regulars') {
  const chosen = getRandomPhrasesFromCategory(categoryKey, 24)
  const matrix = []
  let phraseIndex = 0
  for (let r = 0; r < 5; r++) {
    matrix.push([])
    for (let c = 0; c < 5; c++) {
      if (r === 2 && c === 2) {
        matrix[r][c] = 'FREE'
      } else {
        matrix[r][c] = chosen[phraseIndex]
        phraseIndex++
      }
    }
  }
  return matrix
}

export default function Home() {
  // Game state
  const [gameMode, setGameMode] = useState('menu') // 'menu', 'single', 'multiplayer'
  const [mode, setMode] = useState(null) // null, 'create', 'join'
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [playerId, setPlayerId] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [isMultiplayer, setIsMultiplayer] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Phrase category selection
  const [selectedCategory, setSelectedCategory] = useState('sunrise-regulars')
  
  // Local game state
  const [grid, setGrid] = useState([])
  const [selected, setSelected] = useState([])
  const [bingo, setBingo] = useState(false)
  
  // Share functionality state
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  
  // About dialog state
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false)
  
  // Simple responsive detection using window width
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600)
      setIsTablet(window.innerWidth < 900)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Check for room code in URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const roomParam = urlParams.get('room')
    if (roomParam && roomParam.length === 6) {
      setRoomCode(roomParam.toUpperCase())
      setMode('join')
    }
  }, [])

  // Initialize grid for single player
  useEffect(() => {
    if (gameMode === 'single' && grid.length === 0) {
      const newGrid = generateGrid(selectedCategory)
      setGrid(newGrid)
      setSelected(Array(5).fill().map(() => Array(5).fill(false)))
    }
  }, [gameMode, grid, selectedCategory])

  // Multiplayer polling for game updates
  useEffect(() => {
    if (!isMultiplayer || !roomCode || !playerId) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/games/${roomCode}/state`)
        if (response.ok) {
          const data = await response.json()
          setGameState(data.game)
          
          // Update bingo state if someone won
          if (data.game.winner && !bingo) {
            setBingo(true)
          }
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 2000)

    return () => clearInterval(pollInterval)
  }, [isMultiplayer, roomCode, playerId, bingo])

  // Check for bingo
  const checkBingo = useCallback((selectedGrid) => {
    // Check rows
    for (let r = 0; r < 5; r++) {
      if (selectedGrid[r].every(cell => cell)) return true
    }
    
    // Check columns
    for (let c = 0; c < 5; c++) {
      if (selectedGrid.every(row => row[c])) return true
    }
    
    // Check diagonals
    if (selectedGrid.every((row, i) => row[i])) return true
    if (selectedGrid.every((row, i) => row[4 - i])) return true
    
    return false
  }, [])

  const handleClick = async (r, c) => {
    if (r === 2 && c === 2) return // FREE space
    if (bingo) return // Game over
    
    const newSelected = selected.map((row, rowIndex) => 
      row.map((cell, colIndex) => 
        rowIndex === r && colIndex === c ? !cell : cell
      )
    )
    
    // Mark center as always selected
    newSelected[2][2] = true
    
    setSelected(newSelected)
    
    const hasWon = checkBingo(newSelected)
    if (hasWon) {
      setBingo(true)
    }
    
    // Update multiplayer game
    if (isMultiplayer && playerId) {
      try {
        await fetch(`/api/games/${roomCode}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId,
            selected: newSelected,
            hasWon
          })
        })
      } catch (error) {
        console.error('Failed to update game:', error)
      }
    }
  }

  const handleCreateGame = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const newGrid = generateGrid(selectedCategory)
      const response = await fetch('/api/games/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName,
          phrases: newGrid,
          category: selectedCategory
        })
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      
      setRoomCode(data.roomCode)
      setPlayerId(data.playerId)
      setGameState(data.game)
      setGrid(newGrid)
      setSelected(Array(5).fill().map(() => Array(5).fill(false)))
      setSelected(prev => {
        const newSelected = [...prev]
        newSelected[2][2] = true // Mark FREE space
        return newSelected
      })
      setIsMultiplayer(true)
      setGameMode('multiplayer')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGame = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // For joining games, we'll get the category from the existing game
      const newGrid = generateGrid(selectedCategory)
      const response = await fetch('/api/games/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          playerName,
          phrases: newGrid
        })
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      
      setPlayerId(data.playerId)
      setGameState(data.game)
      
      // If the game has a different category, regenerate the grid
      if (data.game.category && data.game.category !== selectedCategory) {
        const categoryGrid = generateGrid(data.game.category)
        setGrid(categoryGrid)
        setSelectedCategory(data.game.category)
      } else {
        setGrid(newGrid)
      }
      
      const player = data.game.players.find(p => p.id === data.playerId)
      setSelected(player.selected)
      setIsMultiplayer(true)
      setGameMode('multiplayer')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const startSinglePlayer = () => {
    setGameMode('single')
    setIsMultiplayer(false)
    setGameState(null)
    setRoomCode('')
    setPlayerId(null)
    setPlayerName('')
  }

  const getCellSize = () => {
    if (isMobile) return 64
    if (isTablet) return 85
    return 110
  }

  const cellSize = getCellSize()

  // Share functionality
  const handleCopyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode)
      setShareSuccess(true)
      setShareDialogOpen(false)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = roomCode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setShareSuccess(true)
      setShareDialogOpen(false)
    }
  }

  const handleShareUrl = async () => {
    const gameUrl = `${window.location.origin}${window.location.pathname}?room=${roomCode}`
    try {
      await navigator.clipboard.writeText(gameUrl)
      setShareSuccess(true)
      setShareDialogOpen(false)
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = gameUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setShareSuccess(true)
      setShareDialogOpen(false)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Sunrise Semester Bingo Game!',
          text: `Come play Sunrise Semester Bingo with me! Room code: ${roomCode}`,
          url: `${window.location.origin}${window.location.pathname}?room=${roomCode}`
        })
        setShareDialogOpen(false)
      } catch (err) {
        console.log('Share cancelled or failed')
      }
    }
  }

  // Show lobby if in menu mode
  if (gameMode === 'menu') {
    return (
      <div className="container">
        <GameLobby
          mode={mode}
          setMode={setMode}
          playerName={playerName}
          setPlayerName={setPlayerName}
          roomCode={roomCode}
          setRoomCode={setRoomCode}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onCreateGame={handleCreateGame}
          onJoinGame={handleJoinGame}
          isMobile={isMobile}
          onAbout={() => setAboutDialogOpen(true)}
        />
        
        {error && (
          <div className="error">
            {error}
          </div>
        )}
        
        {loading && <div className="loading">Loading...</div>}
        
        <button
          className="single-player-btn"
          onClick={startSinglePlayer}
        >
          Play Single Player
        </button>

        {/* About Dialog for Menu */}
        {aboutDialogOpen && (
          <div className="dialog-overlay" onClick={() => setAboutDialogOpen(false)}>
            <div className="dialog about-dialog" onClick={(e) => e.stopPropagation()}>
              <h2 className="dialog-title">About Sunrise Semester Bingo</h2>
              
              <div className="dialog-content">
                <div className="about-content">
                  <p className="about-subtitle">A game that reminds us all of Rule 62: never take yourself too seriously.</p>
                  
                  <p>Sunrise Semester Bingo is a lighthearted social game created to bring a little extra fun to everyday conversations, meetings, and presentations. Whether you're in a 9 AM check-in, a recovery circle, or just chatting with friends, this game turns common phrases into opportunities for laughter and connection.</p>
                  
                  <h3>Here's how it works:</h3>
                  <p>Everyone gets a bingo card filled with words and sayings that tend to pop up in conversation—things like "let's circle back," "just for today," or "I feel seen." As you listen, you mark off each one you hear. Get five in a row? Bingo! No prizes here—just the joy of noticing and sharing a good laugh with the people around you.</p>
                  
                  <h3>Why we made this game</h3>
                  <p>Sunrise Semester Bingo was born out of the simple desire to keep things fun. In a world where we can all get a little too serious (especially during long meetings or heartfelt shares), we wanted a playful way to stay engaged without losing the spirit of connection. Inspired by Rule 62—never take yourself too seriously—this game is our reminder to lighten up, listen well, and enjoy the moment.</p>
                  
                  <p>So grab a card, tune in, and get ready to shout "Bingo!" when you least expect it. You'll be surprised how much joy you can find in the words we say every day.</p>
                  
                  <p className="about-author">Written and designed by Michael Lynn</p>
                </div>
              </div>

              <div className="dialog-actions">
                <button className="close-btn" onClick={() => setAboutDialogOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .container {
            padding: ${isMobile ? '16px' : '32px'};
            min-height: 100vh;
            background: linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFD23F 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .error {
            color: #d32f2f;
            margin-top: 16px;
            font-weight: 600;
          }
          .loading {
            margin-top: 16px;
            font-size: 18px;
          }
          .single-player-btn {
            margin-top: 24px;
            color: #666;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            text-decoration: underline;
          }
          .single-player-btn:hover {
            color: #333;
          }
          
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
          }
          
          .dialog {
            background: white;
            border-radius: 12px;
            border: 3px solid #FFD23F;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
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
          
          .about-dialog {
            max-width: 600px;
            max-height: 80vh;
          }
          
          .about-content {
            line-height: 1.6;
            color: #333;
          }
          
          .about-content p {
            margin-bottom: 16px;
          }
          
          .about-subtitle {
            font-style: italic;
            font-weight: 600;
            color: #FF6B35;
            font-size: 1.1rem;
            margin-bottom: 20px !important;
          }
          
          .about-content h3 {
            color: #FF6B35;
            font-family: "Inter", sans-serif;
            font-weight: 700;
            font-size: 1.2rem;
            margin-top: 24px;
            margin-bottom: 12px;
          }
          
          .about-author {
            font-style: italic;
            color: #666;
            text-align: right;
            margin-top: 24px !important;
            border-top: 1px solid #eee;
            padding-top: 16px;
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
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="game-container">
      <h1 className="title">
        Sunrise Semester Bingo
      </h1>
      
      {/* Multiplayer info */}
      {isMultiplayer && (
        <div className="multiplayer-info">
          <div className="room-info">
            <span className="room-code">🏠 Room: {roomCode}</span>
            <button
              className="share-btn"
              onClick={() => setShareDialogOpen(true)}
              title="Share game with friends"
            >
              📤
            </button>
          </div>
          <span className="player-count">👥 Players: {gameState?.players?.length || 1}</span>
          {gameState?.status === 'waiting' && (
            <span className="waiting">⏳ Waiting for players...</span>
          )}
        </div>
      )}
      
      {/* Player list for multiplayer */}
      {isMultiplayer && gameState && (
        <div className="player-list">
          Players: {gameState.players.map(p => p.name).join(', ')}
        </div>
      )}
      
      {/* Current player name */}
      {(playerName || !isMultiplayer) && (
        <h2 className="player-name">
          Player: {playerName || 'Guest'}
        </h2>
      )}
      
      {/* Back to menu button */}
      <button
        className="back-btn"
        onClick={() => {
          setGameMode('menu')
          setGrid([])
          setSelected([])
          setBingo(false)
          setGameState(null)
          setIsMultiplayer(false)
          setRoomCode('')
          setPlayerId(null)
          setMode(null)
        }}
      >
        🏠 Back to Menu
      </button>
      
      {/* About button */}
      <button
        className="about-btn"
        onClick={() => setAboutDialogOpen(true)}
        title="Learn about the game's origin"
      >
        ℹ️ About
      </button>
      
      {/* Bingo Card */}
      <div className="card-container">
        <div className="bingo-card">
          {/* BINGO Header */}
          <div className="bingo-header">
            {['B','I','N','G','O'].map((letter) => (
              <div key={letter} className="header-cell">
                {letter}
              </div>
            ))}
          </div>
          
          {/* Bingo Grid */}
          <div className="bingo-grid">
            {grid.map((row, r) =>
              row.map((phrase, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`grid-cell ${selected[r] && selected[r][c] ? 'selected' : ''} ${r === 2 && c === 2 ? 'free' : ''}`}
                  onClick={() => handleClick(r, c)}
                >
                  {r === 2 && c === 2 && <div className="free-icon">☀️</div>}
                  {selected[r] && selected[r][c] && !(r === 2 && c === 2) && <div className="selected-icon">✨</div>}
                  <span className="cell-text">{phrase}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Winner Dialog */}
      {bingo && (
        <div className="dialog-overlay" onClick={() => setBingo(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="dialog-title">🌅 SUNRISE BINGO! 🌅</h2>
            <div className="dialog-content">
              <div className="winner-box">
                <div className="congratulations">
                  {gameState?.winner === playerId ? 
                    `🎊 Congratulations ${playerName}! 🎊` :
                    gameState?.winner ? 
                      `🎊 ${gameState.players.find(p => p.id === gameState.winner)?.name} wins! 🎊` :
                      `🎊 Congratulations ${playerName || 'Player'}! 🎊`
                  }
                </div>
                <div className="subtitle">
                  You've caught the sunrise! ✨
                </div>
              </div>
            </div>
            <div className="dialog-actions">
              <button 
                className="new-game-btn"
                onClick={() => {
                  setBingo(false)
                  window.location.reload()
                }}
              >
                🌟 New Sunrise Adventure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Dialog */}
      {shareDialogOpen && (
        <div className="dialog-overlay" onClick={() => setShareDialogOpen(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="dialog-title">🌅 Share Your Sunrise Game</h2>
            
            <div className="dialog-content">
              <div className="room-code-display">
                <div className="room-code-large">{roomCode}</div>
                <div className="room-code-label">Room Code</div>
              </div>

              <div className="share-buttons">
                {navigator.share && (
                  <button className="share-button primary" onClick={handleNativeShare}>
                    📱 Share with Friends
                  </button>
                )}

                <button className="share-button secondary" onClick={handleCopyRoomCode}>
                  📋 Copy Room Code
                </button>

                <button className="share-button secondary" onClick={handleShareUrl}>
                  🔗 Copy Game Link
                </button>
              </div>

              <div className="share-tip">
                💡 Friends can join by entering the room code or clicking your shared link!
              </div>
            </div>

            <div className="dialog-actions">
              <button className="close-btn" onClick={() => setShareDialogOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Dialog */}
      {aboutDialogOpen && (
        <div className="dialog-overlay" onClick={() => setAboutDialogOpen(false)}>
          <div className="dialog about-dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="dialog-title">About Sunrise Semester Bingo</h2>
            
            <div className="dialog-content">
              <div className="about-content">
                <p className="about-subtitle">A game that reminds us all of Rule 62: never take yourself too seriously.</p>
                
                <p>Sunrise Semester Bingo is a lighthearted social game created to bring a little extra fun to everyday conversations, meetings, and presentations. Whether you're in a 9 AM check-in, a recovery circle, or just chatting with friends, this game turns common phrases into opportunities for laughter and connection.</p>
                
                <h3>Here's how it works:</h3>
                <p>Everyone gets a bingo card filled with words and sayings that tend to pop up in conversation—things like "let's circle back," "just for today," or "I feel seen." As you listen, you mark off each one you hear. Get five in a row? Bingo! No prizes here—just the joy of noticing and sharing a good laugh with the people around you.</p>
                
                <h3>Why we made this game</h3>
                <p>Sunrise Semester Bingo was born out of the simple desire to keep things fun. In a world where we can all get a little too serious (especially during long meetings or heartfelt shares), we wanted a playful way to stay engaged without losing the spirit of connection. Inspired by Rule 62—never take yourself too seriously—this game is our reminder to lighten up, listen well, and enjoy the moment.</p>
                
                <p>So grab a card, tune in, and get ready to shout "Bingo!" when you least expect it. You'll be surprised how much joy you can find in the words we say every day.</p>
                
                <p className="about-author">Written and designed by Michael Lynn</p>
              </div>
            </div>

            <div className="dialog-actions">
              <button className="close-btn" onClick={() => setAboutDialogOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {shareSuccess && (
        <div className="notification">
          ✨ Copied to clipboard! Ready to share your sunrise adventure!
        </div>
      )}

      <style jsx>{`
        .game-container {
          padding: ${isMobile ? '16px' : '32px'};
          text-align: center;
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFD23F 100%);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        
        .title {
          font-family: "Inter", sans-serif;
          font-weight: 800;
          color: white;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          margin-bottom: ${isMobile ? '16px' : '24px'};
          font-size: ${isMobile ? '2rem' : isTablet ? '3rem' : '3.5rem'};
          letter-spacing: -0.02em;
        }
        
        .multiplayer-info {
          margin-bottom: 16px;
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .room-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .room-code {
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .share-btn {
          background: white;
          border: 2px solid #FFD23F;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: all 0.3s ease;
        }
        
        .share-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .player-count, .waiting {
          background: rgba(255, 255, 255, 0.9);
          color: #FF6B35;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          border: 2px solid #F7931E;
        }
        
        .waiting {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .player-list {
          margin-bottom: 16px;
          font-size: 14px;
        }
        
        .player-name {
          margin-bottom: ${isMobile ? '16px' : '24px'};
          font-weight: 500;
          font-size: ${isMobile ? '1rem' : isTablet ? '1.25rem' : '1.5rem'};
        }
        
        .back-btn {
          position: ${isMobile ? 'static' : 'absolute'};
          top: ${isMobile ? 'auto' : '20px'};
          left: ${isMobile ? 'auto' : '20px'};
          align-self: ${isMobile ? 'flex-start' : 'auto'};
          margin-bottom: ${isMobile ? '16px' : '0'};
          background: rgba(255, 255, 255, 0.9);
          border: 2px solid #F7931E;
          color: #FF6B35;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          z-index: 10;
          transition: all 0.3s ease;
          font-size: ${isMobile ? '14px' : '16px'};
        }
        
        .back-btn:hover {
          background: #FF6B35;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .about-btn {
          position: ${isMobile ? 'static' : 'absolute'};
          top: ${isMobile ? 'auto' : '20px'};
          right: ${isMobile ? 'auto' : '20px'};
          align-self: ${isMobile ? 'flex-end' : 'auto'};
          margin-bottom: ${isMobile ? '16px' : '0'};
          background: rgba(255, 255, 255, 0.9);
          border: 2px solid #F7931E;
          color: #FF6B35;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          z-index: 10;
          transition: all 0.3s ease;
          font-size: ${isMobile ? '14px' : '16px'};
        }
        
        .about-btn:hover {
          background: #FF6B35;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .card-container {
          display: flex;
          justify-content: center;
          width: 100%;
          max-width: ${isMobile ? '100vw' : 'auto'};
          padding: ${isMobile ? '8px' : '0'};
          overflow-x: auto;
        }
        
        .bingo-card {
          background: white;
          padding: ${isMobile ? '12px' : isTablet ? '20px' : '28px'};
          border-radius: 12px;
          border: 3px solid #FFD23F;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          position: relative;
        }
        
        .bingo-header {
          display: grid;
          grid-template-columns: repeat(5, ${cellSize}px);
          gap: 4px;
          margin-bottom: 8px;
        }
        
        .header-cell {
          height: ${isMobile ? '50px' : isTablet ? '60px' : '75px'};
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          color: white;
          font-size: ${isMobile ? '2.2rem' : isTablet ? '2.8rem' : '3.5rem'};
          font-weight: 900;
          font-family: "Inter", sans-serif;
          border-radius: 12px 12px 0 0;
          border: 3px solid #FF6B35;
          border-bottom: none;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          box-shadow: inset 0 2px 10px rgba(255,255,255,0.3);
          letter-spacing: 0.05em;
        }
        
        .bingo-grid {
          display: grid;
          grid-template-columns: repeat(5, ${cellSize}px);
          gap: 4px;
          border: 3px solid #FF6B35;
          border-radius: 0 0 12px 12px;
          background: #FFF8E1;
          padding: 8px;
        }
        
        .grid-cell {
          border: 2px solid #FFD23F;
          border-radius: 8px;
          height: ${cellSize}px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #ffffff 0%, #fff8e1 100%);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          -webkit-tap-highlight-color: transparent;
        }
        
        .grid-cell:hover {
          background: linear-gradient(145deg, #FFE082 0%, #FFF3C4 100%);
          transform: scale(0.98);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          border-color: #F7931E;
        }
        
        .grid-cell:active {
          transform: scale(0.95);
        }
        
        .grid-cell.selected {
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
        }
        
        .grid-cell.free {
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFD23F 100%);
          cursor: default;
        }
        
        .grid-cell.free:hover {
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFD23F 100%);
          transform: scale(1.02);
        }
        
        .free-icon {
          position: absolute;
          font-size: ${isMobile ? '3rem' : isTablet ? '4rem' : '5rem'};
          opacity: 0.3;
          animation: rotate 8s linear infinite;
        }
        
        .selected-icon {
          position: absolute;
          font-size: ${isMobile ? '1.5rem' : '2rem'};
          color: white;
          z-index: 2;
          animation: bounce 1s ease-in-out infinite;
        }
        
        .cell-text {
          font-weight: 600;
          font-size: ${isMobile ? '0.6rem' : isTablet ? '0.75rem' : '0.85rem'};
          line-height: 1.1;
          padding: ${isMobile ? '4px' : isTablet ? '6px' : '8px'};
          text-align: center;
          position: relative;
          z-index: 3;
          word-break: break-word;
          hyphens: auto;
        }
        
        .grid-cell.free .cell-text {
          font-family: "Inter", sans-serif;
          font-weight: 900;
          font-size: ${isMobile ? '1rem' : isTablet ? '1.2rem' : '1.5rem'};
          color: white;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
          letter-spacing: 0.05em;
        }
        
        .grid-cell.selected .cell-text {
          color: white;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }
        
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
        }
        
        .dialog {
          background: white;
          border-radius: 12px;
          border: 3px solid #FFD23F;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
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
        
        .winner-box, .room-code-display {
          text-align: center;
          padding: 16px;
          border-radius: 8px;
          background: rgba(255, 211, 63, 0.15);
          border: 1px solid rgba(255, 211, 63, 0.4);
          margin-bottom: 16px;
        }
        
        .congratulations {
          font-size: ${isMobile ? '1.2rem' : '1.5rem'};
          font-weight: 600;
          color: #FF6B35;
          margin-bottom: 8px;
        }
        
        .subtitle {
          font-size: ${isMobile ? '0.9rem' : '1.1rem'};
          color: #666;
          font-style: italic;
        }
        
        .room-code-large {
          font-family: "Inter", sans-serif;
          font-weight: 900;
          color: #FF6B35;
          font-size: 2.5rem;
          margin-bottom: 8px;
          letter-spacing: 0.2em;
        }
        
        .room-code-label {
          color: #666;
          font-style: italic;
        }
        
        .share-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .share-button {
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.3s ease;
        }
        
        .share-button.primary {
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
        }
        
        .share-button.primary:hover {
          background: linear-gradient(135deg, #F7931E 0%, #FF6B35 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4);
        }
        
        .share-button.secondary {
          background: white;
          color: #FF6B35;
          border: 2px solid #F7931E;
        }
        
        .share-button.secondary:hover {
          background: rgba(255, 107, 53, 0.1);
          transform: translateY(-1px);
        }
        
        .share-tip {
          text-align: center;
          padding: 16px;
          border-radius: 8px;
          background: rgba(255, 184, 77, 0.2);
          color: #666;
          font-style: italic;
          font-size: 14px;
        }
        
        .dialog-actions {
          display: flex;
          justify-content: center;
          padding: 0 24px 24px;
        }
        
        .new-game-btn {
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
          transition: all 0.3s ease;
        }
        
        .new-game-btn:hover {
          background: linear-gradient(135deg, #F7931E 0%, #FF6B35 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4);
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
        
        .notification {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          border: 2px solid #FFD23F;
          border-radius: 8px;
          padding: 12px 24px;
          color: #FF6B35;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          z-index: 1001;
          animation: slideUp 0.3s ease-out;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        
        .about-dialog {
          max-width: 600px;
          max-height: 80vh;
        }
        
        .about-content {
          line-height: 1.6;
          color: #333;
        }
        
        .about-content p {
          margin-bottom: 16px;
        }
        
        .about-subtitle {
          font-style: italic;
          font-weight: 600;
          color: #FF6B35;
          font-size: 1.1rem;
          margin-bottom: 20px !important;
        }
        
        .about-content h3 {
          color: #FF6B35;
          font-family: "Inter", sans-serif;
          font-weight: 700;
          font-size: 1.2rem;
          margin-top: 24px;
          margin-bottom: 12px;
        }
        
        .about-author {
          font-style: italic;
          color: #666;
          text-align: right;
          margin-top: 24px !important;
          border-top: 1px solid #eee;
          padding-top: 16px;
        }
      `}</style>
    </div>
  )
}