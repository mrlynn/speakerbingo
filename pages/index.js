import React, { useState, useEffect, useCallback } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useAuth, clearGuestSession } from '../lib/useAuth'
import GameLobby from '../components/GameLobby'
import MessageBanner from '../components/MessageBanner'
import PlayerStatsModal from '../components/PlayerStatsModal'
import GlobalLeaderboard from '../components/GlobalLeaderboard'
import FABMenu from '../components/FABMenu'
import TopicRouletteModal from '../components/TopicRouletteModal'
import GameHeader from '../components/GameHeader'
import AIConsentModal from '../components/AIConsentModal'
import { PHRASE_CATEGORIES, getRandomPhrasesFromCategory } from '../lib/phrases'
import { getTodaysChallenge, checkChallengeCompletion, getChallengeProgressMessage } from '../lib/dailyChallenges'
import { 
  loadPlayerProfile, 
  savePlayerProfile, 
  updateGameStats, 
  updateChallengeCompletion,
  getPlayerLevel,
  ACHIEVEMENTS 
} from '../lib/playerProfile'

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
  // Authentication
  const { user, isAuthenticated, isGuest, isLoading } = useAuth()
  const router = useRouter()

  // Redirect to signin if not authenticated and not guest
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isGuest) {
      router.push('/auth/signin')
    }
  }, [isLoading, isAuthenticated, isGuest, router])

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
  
  // Points system state
  const [points, setPoints] = useState(0)
  const [clickCounts, setClickCounts] = useState({})
  
  // Share functionality state
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  
  // Session restoration state
  const [sessionRestored, setSessionRestored] = useState(false)
  
  // About dialog state
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false)
  
  // Player boards view state
  const [playersViewOpen, setPlayersViewOpen] = useState(false)
  
  // Instructions dialog state
  const [instructionsOpen, setInstructionsOpen] = useState(false)
  
  // Stop game dialog state
  const [stopGameDialogOpen, setStopGameDialogOpen] = useState(false)
  
  // Daily challenge state
  const [todaysChallenge, setTodaysChallenge] = useState(null)
  const [challengeCompleted, setChallengeCompleted] = useState(false)
  const [challengeProgress, setChallengeProgress] = useState('')
  const [gameStartTime, setGameStartTime] = useState(null)
  const [bonusPoints, setBonusPoints] = useState(0)
  const [challengeCompletionNotification, setChallengeCompletionNotification] = useState(null)
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false)
  
  // Player profile state
  const [playerProfile, setPlayerProfile] = useState(null)
  const [newAchievements, setNewAchievements] = useState([])
  const [achievementNotification, setAchievementNotification] = useState(null)
  const [statsModalOpen, setStatsModalOpen] = useState(false)
  
  // Global leaderboard state
  const [leaderboardOpen, setLeaderboardOpen] = useState(false)
  
  // Topic roulette state
  const [topicRouletteOpen, setTopicRouletteOpen] = useState(false)

  // AI Consent modal state (whimsical feature)
  const [showAIConsent, setShowAIConsent] = useState(false)
  const aiConsentEnabled = process.env.NEXT_PUBLIC_AI_CONSENT_ENABLED === 'true'
  
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

  // Show AI consent modal after sign-in (whimsical feature)
  useEffect(() => {
    if (!aiConsentEnabled) return
    if (!isAuthenticated && !isGuest) return
    if (isLoading) return

    // Check if user has already consented
    const hasConsented = localStorage.getItem('ai_consent_given')
    if (!hasConsented) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setShowAIConsent(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [aiConsentEnabled, isAuthenticated, isGuest, isLoading])

  // Initialize player profile and daily challenge
  useEffect(() => {
    if (!user) return

    // Set player name and ID from session (authenticated or guest)
    setPlayerName(user.name)
    setPlayerId(user.id)

    // Load player profile
    const profile = loadPlayerProfile()
    setPlayerProfile(profile)
    
    // Initialize daily challenge
    const challenge = getTodaysChallenge()
    setTodaysChallenge(challenge)
    
    // Check if challenge was already completed today
    const completedToday = localStorage.getItem(`challenge_completed_${challenge.date}`)
    setChallengeCompleted(!!completedToday)
    
    // Check for existing game session
    const savedSession = localStorage.getItem('bingo_game_session')
    if (savedSession) {
      try {
        const savedGameSession = JSON.parse(savedSession)
        // Verify the session is still valid (created within the last 24 hours)
        const sessionAge = Date.now() - savedGameSession.timestamp
        const maxAge = 24 * 60 * 60 * 1000 // 24 hours
        
        if (sessionAge < maxAge && savedGameSession.roomCode && savedGameSession.playerId) {
          // Attempt to restore the game session
          restoreGameSession(savedGameSession)
        } else {
          // Session expired, clear it
          localStorage.removeItem('bingo_game_session')
        }
      } catch (error) {
        console.error('Error restoring game session:', error)
        localStorage.removeItem('bingo_game_session')
      }
    }
  }, [user])

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
      setPoints(0)
      setClickCounts({})
      setGameStartTime(new Date()) // Track game start time for challenges
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
          
          // Update current player's points and click counts from server
          const currentPlayer = data.game.players.find(p => p.id === playerId)
          if (currentPlayer) {
            if (currentPlayer.points !== undefined) {
              setPoints(currentPlayer.points)
            }
            if (currentPlayer.clickCounts !== undefined) {
              setClickCounts(currentPlayer.clickCounts)
            }
          }
          
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

  // Check challenge progress
  const checkChallengeProgress = useCallback(() => {
    if (!todaysChallenge || challengeCompleted) return

    const gameStats = {
      points: points,
      hasBingo: bingo,
      markedSquares: selected.flat().filter(Boolean).length - 1, // -1 for FREE space
      maxClicksOnSquare: Math.max(...Object.values(clickCounts), 0),
      timeToCompletion: gameStartTime ? (new Date() - gameStartTime) / 1000 : 0,
      usedOnlyEdgesAndCorners: checkOnlyEdgesAndCorners(),
      edgeOnlyPoints: calculateEdgeOnlyPoints(),
      isMultiplayer: isMultiplayer,
      rank: getRank()
    }

    const isCompleted = checkChallengeCompletion(todaysChallenge, gameStats)
    
    if (isCompleted && !challengeCompleted) {
      setChallengeCompleted(true)
      setBonusPoints(todaysChallenge.reward)
      setPoints(prev => prev + todaysChallenge.reward)
      localStorage.setItem(`challenge_completed_${todaysChallenge.date}`, 'true')
      
      // Update player profile with challenge completion
      if (playerProfile) {
        const achievements = updateChallengeCompletion(playerProfile, todaysChallenge.reward)
        if (achievements.length > 0) {
          setNewAchievements(prev => [...prev, ...achievements])
        }
        savePlayerProfile(playerProfile)
      }
      
      // Show completion notification
      setChallengeCompletionNotification({
        title: 'Daily Challenge Complete!',
        message: `${todaysChallenge.title} completed!`,
        reward: todaysChallenge.reward,
        icon: todaysChallenge.icon
      })
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => setChallengeCompletionNotification(null), 5000)
    } else {
      setChallengeProgress(getChallengeProgressMessage(todaysChallenge, gameStats))
    }
  }, [todaysChallenge, challengeCompleted, points, bingo, selected, clickCounts, gameStartTime, isMultiplayer])

  // Helper functions for challenge checking
  const checkOnlyEdgesAndCorners = () => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (selected[r] && selected[r][c] && r !== 2 && c !== 2) {
          const isEdge = r === 0 || r === 4 || c === 0 || c === 4
          if (!isEdge) return false
        }
      }
    }
    return true
  }

  const calculateEdgeOnlyPoints = () => {
    let edgePoints = 0
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (selected[r] && selected[r][c] && (r === 0 || r === 4 || c === 0 || c === 4)) {
          const clicks = clickCounts[`${r}-${c}`] || 1
          edgePoints += calculatePoints(r, c, clicks)
        }
      }
    }
    return edgePoints
  }

  const getRank = () => {
    if (!isMultiplayer || !gameState) return 1
    const sortedPlayers = gameState.players.sort((a, b) => (b.points || 0) - (a.points || 0))
    return sortedPlayers.findIndex(p => p.id === playerId) + 1
  }

  // Save game results to player profile
  const saveGameResults = useCallback((gameCompleted = false) => {
    if (!playerProfile) return

    const gameResult = {
      points: points,
      hasBingo: bingo || gameCompleted,
      markedSquares: selected.flat().filter(Boolean).length - 1, // -1 for FREE space
      maxClicksOnSquare: Math.max(...Object.values(clickCounts), 0),
      timeToCompletion: gameStartTime ? (new Date() - gameStartTime) / 1000 : 0,
      usedOnlyEdgesAndCorners: checkOnlyEdgesAndCorners(),
      isMultiplayer: isMultiplayer,
      category: selectedCategory,
      date: new Date().toISOString()
    }

    const { profile: updatedProfile, newAchievements: achievements } = updateGameStats(playerProfile, gameResult)
    
    // Update player name preference
    if (playerName && playerName !== updatedProfile.preferences.defaultName) {
      updatedProfile.preferences.defaultName = playerName
      updatedProfile.name = playerName
    }

    setPlayerProfile(updatedProfile)
    savePlayerProfile(updatedProfile)

    // Show achievement notifications
    if (achievements.length > 0) {
      setNewAchievements(achievements)
      // Show first achievement
      setAchievementNotification(achievements[0])
      setTimeout(() => setAchievementNotification(null), 4000)
    }
  }, [playerProfile, points, bingo, selected, clickCounts, gameStartTime, isMultiplayer, selectedCategory, playerName])

  // Function to restore a game session from localStorage
  const restoreGameSession = async (session) => {
    setLoading(true)
    try {
      // Fetch the current game state
      const response = await fetch(`/api/games/${session.roomCode}/state`)
      
      if (!response.ok) {
        // Game not found or expired, clear the session
        localStorage.removeItem('bingo_game_session')
        setLoading(false)
        return
      }
      
      const data = await response.json()
      const game = data.game
      
      // Check if the player is still in the game
      const player = game.players.find(p => p.id === session.playerId)
      
      if (!player) {
        // Player not found in game, clear the session
        localStorage.removeItem('bingo_game_session')
        setLoading(false)
        return
      }
      
      // Restore the game state
      setRoomCode(session.roomCode)
      setPlayerId(session.playerId)
      setPlayerName(player.name)
      setGameState(game)
      setGrid(player.grid || session.grid)
      setSelected(player.selected)
      setPoints(player.points || 0)
      setClickCounts(player.clickCounts || {})
      setIsMultiplayer(true)
      setGameMode('multiplayer')
      
      if (game.category) {
        setSelectedCategory(game.category)
      }
      
      // Check if game is already won
      if (player.hasWon || game.winner) {
        setBingo(true)
      }
      
      // Show restoration notification
      setSessionRestored(true)
      setTimeout(() => setSessionRestored(false), 4000)
      
      setLoading(false)
    } catch (error) {
      console.error('Failed to restore game session:', error)
      localStorage.removeItem('bingo_game_session')
      setLoading(false)
    }
  }
  
  // Function to save game session to localStorage
  const saveGameSession = (roomCode, playerId, playerName, grid) => {
    const session = {
      roomCode,
      playerId,
      playerName,
      grid,
      timestamp: Date.now()
    }
    localStorage.setItem('bingo_game_session', JSON.stringify(session))
  }
  
  // Function to clear game session from localStorage
  const clearGameSession = () => {
    localStorage.removeItem('bingo_game_session')
  }

  const handleClick = async (r, c, isReset = false) => {
    if (r === 2 && c === 2) return // FREE space
    if (bingo) return // Game over
    
    const cellKey = `${r}-${c}`
    let newSelected = [...selected]
    let newClickCounts = { ...clickCounts }
    let newPoints = points
    
    if (isReset) {
      // Reset the cell (explicit reset action)
      newSelected = selected.map((row, rowIndex) => 
        row.map((cell, colIndex) => 
          rowIndex === r && colIndex === c ? false : cell
        )
      )
      
      // Calculate total points that were earned from this cell
      const currentClicks = clickCounts[cellKey] || 0
      let totalCellPoints = 0
      for (let i = 1; i <= currentClicks; i++) {
        totalCellPoints += calculatePoints(r, c, i)
      }
      
      // Remove this cell's click count and subtract points
      delete newClickCounts[cellKey]
      newPoints = points - totalCellPoints
    } else {
      if (selected[r][c]) {
        // Cell is already selected, increment the click count (for repeated phrases)
        const currentClicks = (clickCounts[cellKey] || 0) + 1
        newClickCounts[cellKey] = currentClicks
        const pointsEarned = calculatePoints(r, c, currentClicks)
        newPoints = points + pointsEarned
      } else {
        // Cell is not selected yet, select it and add first click
        newSelected = selected.map((row, rowIndex) => 
          row.map((cell, colIndex) => 
            rowIndex === r && colIndex === c ? true : cell
          )
        )
        const currentClicks = 1
        newClickCounts[cellKey] = currentClicks
        const pointsEarned = calculatePoints(r, c, currentClicks)
        newPoints = points + pointsEarned
      }
    }
    
    // Mark center as always selected
    newSelected[2][2] = true
    
    setSelected(newSelected)
    setClickCounts(newClickCounts)
    setPoints(newPoints)
    
    const hasWon = checkBingo(newSelected)
    if (hasWon) {
      setBingo(true)
      // Add BINGO bonus points
      setPoints(newPoints + 1000)
      
      // Save game results when BINGO is achieved
      setTimeout(() => saveGameResults(true), 200)
    }
    
    // Check challenge progress after state updates
    setTimeout(() => checkChallengeProgress(), 100)
    
    // Update multiplayer game
    if (isMultiplayer && playerId) {
      try {
        await fetch(`/api/games/${roomCode}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId,
            selected: newSelected,
            hasWon,
            points: hasWon ? newPoints + 1000 : newPoints,
            clickCounts: newClickCounts
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
      setPoints(0)
      setClickCounts({})
      setGameStartTime(new Date()) // Track game start time for challenges
      setIsMultiplayer(true)
      setGameMode('multiplayer')
      
      // Save game session to localStorage
      saveGameSession(data.roomCode, data.playerId, playerName, newGrid)
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
      
      let finalGrid = newGrid
      // If the game has a different category, regenerate the grid
      if (data.game.category && data.game.category !== selectedCategory) {
        const categoryGrid = generateGrid(data.game.category)
        setGrid(categoryGrid)
        setSelectedCategory(data.game.category)
        finalGrid = categoryGrid
      } else {
        setGrid(newGrid)
      }
      
      const player = data.game.players.find(p => p.id === data.playerId)
      setSelected(player.selected)
      setPoints(player.points || 0)
      setClickCounts(player.clickCounts || {})
      setGameStartTime(new Date()) // Track game start time for challenges
      setIsMultiplayer(true)
      setGameMode('multiplayer')
      
      // Save game session to localStorage
      saveGameSession(roomCode.toUpperCase(), data.playerId, playerName, finalGrid)
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
    if (isMobile) {
      // Use CSS calc() for truly responsive sizing - will be handled in CSS
      return 'calc((100vw - 60px) / 5.5)' // vw based with safety margin
    }
    if (isTablet) return 85
    return 110
  }

  const cellSize = getCellSize()

  // Points calculation function
  const calculatePoints = (row, col, clickCount) => {
    if (row === 2 && col === 2) return 0 // FREE space gives no points
    
    // Position-based base points
    let basePoints
    const isCorner = (row === 0 || row === 4) && (col === 0 || col === 4)
    const isEdge = row === 0 || row === 4 || col === 0 || col === 4
    
    if (isCorner) {
      basePoints = 150
    } else if (isEdge) {
      basePoints = 100
    } else {
      basePoints = 75
    }
    
    // Diminishing returns based on click count
    const multipliers = [1.0, 0.6, 0.35, 0.2, 0.1]
    const multiplier = multipliers[Math.min(clickCount - 1, multipliers.length - 1)]
    
    return Math.floor(basePoints * multiplier)
  }

  // Share functionality
  const handleCopyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode)
      setShareSuccess(true)
      setShareDialogOpen(false)
      // Auto-hide notification after 3 seconds
      setTimeout(() => setShareSuccess(false), 3000)
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
      // Auto-hide notification after 3 seconds
      setTimeout(() => setShareSuccess(false), 3000)
    }
  }

  const handleShareUrl = async () => {
    const gameUrl = `${window.location.origin}${window.location.pathname}?room=${roomCode}`
    try {
      await navigator.clipboard.writeText(gameUrl)
      setShareSuccess(true)
      setShareDialogOpen(false)
      // Auto-hide notification after 3 seconds
      setTimeout(() => setShareSuccess(false), 3000)
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
      // Auto-hide notification after 3 seconds
      setTimeout(() => setShareSuccess(false), 3000)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Semester Speaker Bingo Game!',
          text: `Come play Semester Speaker Bingo with me! Room code: ${roomCode}`,
          url: `${window.location.origin}${window.location.pathname}?room=${roomCode}`
        })
        setShareDialogOpen(false)
      } catch (err) {
        console.log('Share cancelled or failed')
      }
    }
  }

  // Stop game function (host only)
  const handleStopGame = async () => {
    if (!isMultiplayer || !playerId || !roomCode) return
    
    try {
      const response = await fetch(`/api/games/${roomCode}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      
      setStopGameDialogOpen(false)
      setBingo(true) // Trigger the win dialog
    } catch (err) {
      setError(err.message)
    }
  }

  // Banner click handlers
  const handleChallengeClick = (challenge) => {
    setChallengeDialogOpen(true)
  }

  const handleAdClick = (ad) => {
    if (ad.cta && ad.link) {
      window.open(ad.link, '_blank')
    } else if (ad.action === 'share') {
      setShareDialogOpen(true)
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
          onInstructions={() => setInstructionsOpen(true)}
          onLeaderboard={() => setLeaderboardOpen(true)}
          onTopicRoulette={() => setTopicRouletteOpen(true)}
        />
        
        {error && (
          <div className="error">
            {error}
          </div>
        )}
        
        {loading && <div className="loading">Loading...</div>}
        
        <button
          className="single-player-btn sunrise-button"
          onClick={startSinglePlayer}
        >
          Play Single Player
        </button>

        {/* Instructions Dialog for Menu */}
        {instructionsOpen && (
          <div className="dialog-overlay" onClick={() => setInstructionsOpen(false)}>
            <div className="dialog instructions-dialog" onClick={(e) => e.stopPropagation()}>
              <h2 className="dialog-title">🌅 How to Play Sunrise Semester Speaker Bingo</h2>
              
              <div className="dialog-content">
                <div className="instructions-content">
                  <div className="instructions-intro">
                    <p>Welcome to the most entertaining way to stay engaged during meetings, shares, and conversations! 🎉</p>
                  </div>

                  <h3>🎯 The Goal</h3>
                  <p>Listen carefully to speakers during your meeting and mark off phrases as you hear them. Get five in a row (horizontal, vertical, or diagonal) and you've got BINGO! Plus, earn points along the way to add some friendly competition!</p>

                  <h3>🎮 How to Play</h3>
                  <ol className="instructions-list">
                    <li><strong>Choose Your Phrases:</strong> Pick a category that matches your meeting type. "Sunrise Regulars" for general meetings, "Steps & Traditions" for step meetings, or go wild with "Clutter Words" if you want a real challenge!</li>
                    
                    <li><strong>Start Listening:</strong> As speakers share, keep your ears open for the phrases on your card. When you hear one, click it! The square will light up with a satisfying orange glow and you'll earn points.</li>
                    
                    <li><strong>Mark and Reset Phrases:</strong> Click a phrase to mark it. For repeated phrases, click the cell again to add another occurrence and earn more points. Made a mistake? Click the "×" icon in the corner of a marked phrase to reset it completely.</li>
                    
                    <li><strong>Watch Your Progress:</strong> The FREE space in the center is your gift - it's always marked. Use it wisely as part of your winning strategy!</li>
                    
                    <li><strong>Earn Points:</strong> Each square shows its point value. Corner squares are worth 150 points, edge squares 100 points, and inner squares 75 points. Click the same square multiple times for diminishing bonus points!</li>
                    
                    <li><strong>Get Five in a Row:</strong> Line them up horizontally, vertically, or diagonally. When you hit that magical fifth square... 🎊 BINGO! 🎊 Plus you'll get a 1000 point bonus!</li>
                  </ol>

                  <h3>🌟 Pro Tips</h3>
                  <ul className="pro-tips">
                    <li>🎧 <strong>Stay Present:</strong> The beauty of this game is it actually helps you listen better. You might be surprised what wisdom you catch while hunting for phrases!</li>
                    
                    <li>👥 <strong>Multiplayer Magic:</strong> Create a room and share the code with friends. You can peek at their boards and compare points with the players button - friendly competition makes everything better!</li>
                    
                    <li>🎯 <strong>Strategic Clicking:</strong> Corner squares give the highest points! But don't ignore those edge and inner squares - they add up quickly.</li>
                    
                    <li>🎲 <strong>Mix It Up:</strong> Each game generates a random selection from your chosen category, so no two games are the same!</li>
                    
                    <li>🔢 <strong>Points Strategy:</strong> You can click the same square multiple times for bonus points, but with diminishing returns. Sometimes it's better to find new phrases!</li>
                    
                    <li>😄 <strong>Keep It Light:</strong> Remember Rule 62 - don't take yourself too seriously! This is about fun and connection, not perfection.</li>
                  </ul>

                  <h3>🏆 Winning & Beyond</h3>
                  <p>When you get BINGO, celebrate your 1000 bonus points! But don't stop there - you can keep playing to rack up points and see how many squares you can fill. In multiplayer games, compete for the highest score by the end of the meeting!</p>

                  <div className="instructions-footer">
                    <p><em>Remember: The real win is staying engaged, having fun, and maybe learning something new along the way. Happy listening! 🌅</em></p>
                  </div>
                </div>
              </div>

              <div className="dialog-actions">
                <button className="close-btn primary" onClick={() => setInstructionsOpen(false)}>
                  Got it! Let's Play!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* About Dialog for Menu */}
        {aboutDialogOpen && (
          <div className="dialog-overlay" onClick={() => setAboutDialogOpen(false)}>
            <div className="dialog about-dialog" onClick={(e) => e.stopPropagation()}>
              <h2 className="dialog-title">About Sunrise Semester Speaker Bingo</h2>
              
              <div className="dialog-content">
                <div className="about-content">
                  <p className="about-subtitle">A game that reminds us all of Rule 62: never take yourself too seriously.</p>
                  
                  <p>Sunrise Semester Speaker Bingo is a lighthearted social game created to bring a little extra fun to everyday conversations, meetings, and presentations. Whether you're in a 9 AM check-in, a recovery circle, or just chatting with friends, this game turns common phrases into opportunities for laughter and connection.</p>
                  
                  <h3>Here's how it works:</h3>
                  <p>Everyone gets a bingo card filled with words and sayings that tend to pop up in conversation—things like "let's circle back," "just for today," or "I feel seen." As you listen, you mark off each one you hear. Get five in a row? Bingo! No prizes here—just the joy of noticing and sharing a good laugh with the people around you.</p>
                  
                  <h3>Why we made this game</h3>
                  <p>Sunrise Semester Speaker Bingo was born out of the simple desire to keep things fun. In a world where we can all get a little too serious (especially during long meetings or heartfelt shares), we wanted a playful way to stay engaged without losing the spirit of connection. Inspired by Rule 62—never take yourself too seriously—this game is our reminder to lighten up, listen well, and enjoy the moment.</p>
                  
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

        {/* Shared Modals for Lobby View */}
        <GlobalLeaderboard
          isOpen={leaderboardOpen}
          onClose={() => setLeaderboardOpen(false)}
          isMobile={isMobile}
        />

        <TopicRouletteModal
          isOpen={topicRouletteOpen}
          onClose={() => setTopicRouletteOpen(false)}
          isMobile={isMobile}
        />
      </div>
    )
  }

  // Show loading state while checking authentication
  if (status === 'loading') {
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

  // Don't render the game if not authenticated and not guest (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="game-container">
      {/* Background Elements */}
      <div className="particles"></div>
        
        <h1 className="title sunrise-title">
          Semester Speaker Bingo
        </h1>
      
      {/* Unified Game Header */}
      <GameHeader
        playerName={playerName}
        playerProfile={playerProfile}
        playerAvatar={user?.image}
        points={points}
        bonusPoints={bonusPoints}
        isMultiplayer={isMultiplayer}
        roomCode={roomCode}
        gameState={gameState}
        todaysChallenge={todaysChallenge}
        challengeCompleted={challengeCompleted}
        challengeProgress={challengeProgress}
        isMobile={isMobile}
        onChallengeClick={handleChallengeClick}
        onShareGame={() => setShareDialogOpen(true)}
      />
      
      {/* Scrolling Message Banner - rotates between daily challenges and community ads */}
      <MessageBanner
        onChallengeClick={handleChallengeClick}
        onAdClick={handleAdClick}
        isMobile={isMobile}
      />
      
      {/* FAB Menu - replaces all scattered buttons */}
      <FABMenu
        isMobile={isMobile}
        onBackToMenu={() => {
          clearGameSession()
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
        onShareGame={() => setShareDialogOpen(true)}
        onViewPlayers={() => setPlayersViewOpen(true)}
        onLeaderboard={() => setLeaderboardOpen(true)}
        onStats={() => setStatsModalOpen(true)}
        onInstructions={() => setInstructionsOpen(true)}
        onAbout={() => setAboutDialogOpen(true)}
        onStopGame={() => setStopGameDialogOpen(true)}
        onLogout={() => {
          if (isGuest) {
            clearGuestSession()
            router.push('/auth/signin')
          } else {
            signOut({ callbackUrl: '/auth/signin' })
          }
        }}
        showShareAndPlayers={isMultiplayer}
        showStopGame={isMultiplayer && gameState?.players?.find(p => p.id === playerId)?.isHost && gameState?.status !== 'finished'}
        showStats={!!playerProfile}
      />
      
      {/* Bingo Card */}
      <div className="card-container">
        <div className="bingo-card sunrise-bingo-card">
          {/* BINGO Header */}
          <div className="bingo-header">
            {['B','I','N','G','O'].map((letter) => (
              <div key={letter} className="header-cell sunrise-header-cell">
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
                  className={`grid-cell sunrise-grid-cell ${selected[r] && selected[r][c] ? 'selected' : ''} ${r === 2 && c === 2 ? 'free' : ''}`}
                  onClick={() => handleClick(r, c)}
                  title={selected[r] && selected[r][c] ? "Click to add another occurrence of this phrase" : "Click to mark this phrase"}
                >
                  {r === 2 && c === 2 && <div className="free-icon">☀️</div>}
                  {selected[r] && selected[r][c] && !(r === 2 && c === 2) && (
                    <div className="selected-icon">
                      <span className="icon-wrapper">✨</span>
                      <span 
                        className="reset-hint"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent cell click
                          handleClick(r, c, true); // Call with reset flag
                        }}
                        title="Reset this phrase"
                      >×</span>
                    </div>
                  )}
                  <div className="cell-content">
                    <span className="cell-text">{phrase}</span>
                    {!(r === 2 && c === 2) && (
                      <div className="cell-info">
                        {selected[r] && selected[r][c] ? (
                          <div className="action-buttons">
                            <div className="point-value sunrise-point-value add-click"
                                 title="Add another occurrence">
                              +{calculatePoints(r, c, (clickCounts[`${r}-${c}`] || 0) + 1)}
                            </div>
                          </div>
                        ) : (
                          <div className="point-value sunrise-point-value">
                            {calculatePoints(r, c, 1)}
                          </div>
                        )}
                        {clickCounts[`${r}-${c}`] && (
                          <div className="click-count">
                            x{clickCounts[`${r}-${c}`]}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Winner Dialog */}
      {bingo && (
        <div className="dialog-overlay" onClick={() => setBingo(false)}>
          <div className="dialog sunrise-dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="dialog-title sunrise-dialog-title">
              {gameState?.endedBy === 'host' ? '🏁 GAME ENDED!' : '🌅 SUNRISE BINGO! 🌅'}
            </h2>
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
                  {gameState?.endedBy === 'host' ? 
                    `🏆 Winner by highest points! 🏆` :
                    `You've caught the sunrise! ✨`
                  }
                </div>
                
                {gameState?.endedBy === 'host' && gameState?.players && (
                  <div className="final-standings">
                    <h4>Final Standings:</h4>
                    <div className="standings-list">
                      {gameState.players
                        .sort((a, b) => (b.points || 0) - (a.points || 0))
                        .map((player, index) => (
                          <div key={player.id} className={`standing-item ${player.id === gameState.winner ? 'winner' : ''}`}>
                            <span className="rank">#{index + 1}</span>
                            <span className="player-name">
                              {player.name}
                              {player.id === gameState.winner && ' 👑'}
                            </span>
                            <span className="player-points">🏆 {(player.points || 0).toLocaleString()}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="dialog-actions">
              <button 
                className="new-game-btn sunrise-button"
                onClick={() => {
                  clearGameSession()
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
          <div className="dialog sunrise-dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="dialog-title sunrise-dialog-title">🌅 Share Your Sunrise Game</h2>
            
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
            <h2 className="dialog-title">About Sunrise Semester Speaker Bingo</h2>
            
            <div className="dialog-content">
              <div className="about-content">
                <p className="about-subtitle">A game that reminds us all of Rule 62: never take yourself too seriously.</p>
                
                <p>Sunrise Semester Speaker Bingo is a lighthearted social game created to bring a little extra fun to everyday conversations, meetings, and presentations. Whether you're in a 9 AM check-in, a recovery circle, or just chatting with friends, this game turns common phrases into opportunities for laughter and connection.</p>
                
                <h3>Here's how it works:</h3>
                <p>Everyone gets a bingo card filled with words and sayings that tend to pop up in conversation—things like "let's circle back," "just for today," or "I feel seen." As you listen, you mark off each one you hear. Get five in a row? Bingo! No prizes here—just the joy of noticing and sharing a good laugh with the people around you.</p>
                
                <h3>Why we made this game</h3>
                <p>Sunrise Semester Speaker Bingo was born out of the simple desire to keep things fun. In a world where we can all get a little too serious (especially during long meetings or heartfelt shares), we wanted a playful way to stay engaged without losing the spirit of connection. Inspired by Rule 62—never take yourself too seriously—this game is our reminder to lighten up, listen well, and enjoy the moment.</p>
                
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

      {/* Instructions Dialog */}
      {instructionsOpen && (
        <div className="dialog-overlay" onClick={() => setInstructionsOpen(false)}>
          <div className="dialog instructions-dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="dialog-title">🌅 How to Play Sunrise Semester Speaker Bingo</h2>
            
            <div className="dialog-content">
              <div className="instructions-content">
                <div className="instructions-intro">
                  <p>Welcome to the most entertaining way to stay engaged during meetings, shares, and conversations! 🎉</p>
                </div>

                <h3>🎯 The Goal</h3>
                <p>Listen carefully to speakers during your meeting and mark off phrases as you hear them. Get five in a row (horizontal, vertical, or diagonal) and you've got BINGO! It's that simple... and that fun!</p>

                <h3>🎮 How to Play</h3>
                <ol className="instructions-list">
                  <li><strong>Choose Your Phrases:</strong> Pick a category that matches your meeting type. "Sunrise Regulars" for general meetings, "Steps & Traditions" for step meetings, or go wild with "Clutter Words" if you want a real challenge!</li>
                  
                  <li><strong>Start Listening:</strong> As speakers share, keep your ears open for the phrases on your card. When you hear one, click it! The square will light up with a satisfying orange glow.</li>
                  
                  <li><strong>Mark and Reset Phrases:</strong> Click a phrase to mark it. For repeated phrases, click the cell again to add another occurrence and earn more points. Made a mistake? Click the "×" icon in the corner of a marked phrase to reset it completely.</li>
                  
                  <li><strong>Watch Your Progress:</strong> The FREE space in the center is your gift - it's always marked. Use it wisely as part of your winning strategy!</li>
                  
                  <li><strong>Get Five in a Row:</strong> Line them up horizontally, vertically, or diagonally. When you hit that magical fifth square... 🎊 BINGO! 🎊</li>
                </ol>

                <h3>🌟 Pro Tips</h3>
                <ul className="pro-tips">
                  <li>🎧 <strong>Stay Present:</strong> The beauty of this game is it actually helps you listen better. You might be surprised what wisdom you catch while hunting for phrases!</li>
                  
                  <li>👥 <strong>Multiplayer Magic:</strong> Create a room and share the code with friends. You can peek at their boards with the players button - friendly competition makes everything better!</li>
                  
                  <li>🎲 <strong>Mix It Up:</strong> Each game generates a random selection from your chosen category, so no two games are the same!</li>
                  
                  <li>😄 <strong>Keep It Light:</strong> Remember Rule 62 - don't take yourself too seriously! This is about fun and connection, not perfection.</li>
                </ul>

                <h3>🏆 Winning & Beyond</h3>
                <p>When you get BINGO, celebrate! But don't stop there - you can keep playing to see how many squares you can fill. In multiplayer games, see who can get the most squares marked by the end of the meeting!</p>

                <div className="instructions-footer">
                  <p><em>Remember: The real win is staying engaged, having fun, and maybe learning something new along the way. Happy listening! 🌅</em></p>
                </div>
              </div>
            </div>

            <div className="dialog-actions">
              <button className="close-btn primary" onClick={() => setInstructionsOpen(false)}>
                Got it! Let's Play!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Players View Dialog */}
      {playersViewOpen && isMultiplayer && gameState && (
        <div className="dialog-overlay" onClick={() => setPlayersViewOpen(false)}>
          <div className="dialog players-dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="dialog-title">Players' Boards</h2>
            
            <div className="dialog-content">
              <div className="players-grid">
                {gameState.players.map((player) => (
                  <div key={player.id} className="player-board">
                    <div className="player-header">
                      <h3 className="player-name">
                        {player.name}
                        {player.id === playerId && ' (You)'}
                        {player.hasWon && ' 🏆'}
                      </h3>
                      <div className="player-stats">
                        <div className="player-progress">
                          {player.selected ? 
                            `${player.selected.flat().filter(Boolean).length - 1}/24` : 
                            '0/24'
                          }
                        </div>
                        <div className="player-points">
                          🏆 {(player.points || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="mini-bingo-grid">
                      {player.grid && player.grid.map((row, r) =>
                        row.map((phrase, c) => (
                          <div
                            key={`${r}-${c}`}
                            className={`mini-cell ${
                              player.selected && player.selected[r] && player.selected[r][c] ? 'selected' : ''
                            } ${r === 2 && c === 2 ? 'free' : ''}`}
                          >
                            <div className="mini-cell-content">
                              <span className="mini-cell-text" title={phrase}>
                                {phrase}
                              </span>
                              {(r === 2 && c === 2) ? (
                                <span className="mini-cell-icon">☀️</span>
                              ) : player.selected && player.selected[r] && player.selected[r][c] ? (
                                <span className="mini-cell-check">✓</span>
                              ) : null}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dialog-actions">
              <button className="close-btn" onClick={() => setPlayersViewOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stop Game Dialog */}
      {stopGameDialogOpen && (
        <div className="dialog-overlay" onClick={() => setStopGameDialogOpen(false)}>
          <div className="dialog sunrise-dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="dialog-title sunrise-dialog-title">🛑 Stop Game</h2>
            
            <div className="dialog-content">
              <div className="stop-game-warning">
                <p>Are you sure you want to end this game?</p>
                <p>The player with the highest points will be declared the winner.</p>
                
                {gameState && (
                  <div className="current-standings">
                    <h4>Current Standings:</h4>
                    <div className="standings-list">
                      {gameState.players
                        .sort((a, b) => (b.points || 0) - (a.points || 0))
                        .map((player, index) => (
                          <div key={player.id} className="standing-item">
                            <span className="rank">#{index + 1}</span>
                            <span className="player-name">{player.name}</span>
                            <span className="player-points">🏆 {(player.points || 0).toLocaleString()}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="dialog-actions">
              <button 
                className="stop-confirm-btn"
                onClick={handleStopGame}
              >
                🏁 End Game Now
              </button>
              <button 
                className="close-btn"
                onClick={() => setStopGameDialogOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {shareSuccess && (
        <div className="notification">
          <div className="notification-content">
            ✨ Copied to clipboard! Ready to share your adventure!
          </div>
          <button className="notification-close" onClick={() => setShareSuccess(false)}>×</button>
        </div>
      )}

      {/* Session Restored Notification */}
      {sessionRestored && (
        <div className="notification">
          <div className="notification-content">
            🎮 Welcome back! Your game has been restored.
          </div>
          <button className="notification-close" onClick={() => setSessionRestored(false)}>×</button>
        </div>
      )}

      {/* Daily Challenge Dialog */}
      {challengeDialogOpen && todaysChallenge && (
        <div className="dialog-overlay" onClick={() => setChallengeDialogOpen(false)}>
          <div className="dialog challenge-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="dialog-title">{todaysChallenge.icon} Daily Challenge</h2>
            
            <div className="dialog-content">
              <div className="challenge-details">
                <div className="challenge-header">
                  <h3 className="challenge-name">{todaysChallenge.title}</h3>
                  <div className={`difficulty-badge difficulty-${todaysChallenge.difficulty.toLowerCase()}`}>
                    {todaysChallenge.difficulty}
                  </div>
                </div>
                
                <div className="challenge-description">
                  <p>{todaysChallenge.description}</p>
                </div>
                
                <div className="challenge-reward-info">
                  <div className="reward-box">
                    <div className="reward-label">Reward</div>
                    <div className="reward-amount">🏆 {todaysChallenge.reward} bonus points</div>
                  </div>
                </div>
                
                {challengeCompleted ? (
                  <div className="challenge-status-box completed">
                    <div className="status-icon">✅</div>
                    <div className="status-text">
                      <div className="status-title">Challenge Completed!</div>
                      <div className="status-message">You've already earned the bonus points for today.</div>
                    </div>
                  </div>
                ) : (
                  <div className="challenge-status-box active">
                    <div className="status-icon">⏳</div>
                    <div className="status-text">
                      <div className="status-title">In Progress</div>
                      <div className="status-message">
                        {challengeProgress || 'Start playing to work on this challenge!'}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="challenge-tips">
                  <h4>💡 Tips:</h4>
                  <ul>
                    <li>Challenges reset daily at midnight</li>
                    <li>You can only complete each challenge once per day</li>
                    <li>Bonus points are added to your current game score</li>
                    <li>Progress is tracked automatically as you play</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="dialog-actions">
              <button className="close-btn primary" onClick={() => setChallengeDialogOpen(false)}>
                {challengeCompleted ? "Got it!" : "Let's Play!"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Notification */}
      {achievementNotification && (
        <div className="achievement-notification" onClick={() => setAchievementNotification(null)}>
          <div className="achievement-notification-content">
            <div className="achievement-icon">{achievementNotification.icon}</div>
            <div className="achievement-text">
              <div className="achievement-title">Achievement Unlocked!</div>
              <div className="achievement-name">{achievementNotification.name}</div>
              <div className="achievement-description">{achievementNotification.description}</div>
              <div className="achievement-points">+{achievementNotification.points} points!</div>
            </div>
          </div>
        </div>
      )}

      {/* Player Stats Modal */}
      {statsModalOpen && (
        <PlayerStatsModal
          profile={playerProfile}
          onClose={() => setStatsModalOpen(false)}
          onProfileUpdate={(newProfile) => {
            setPlayerProfile(newProfile)
            savePlayerProfile(newProfile)
          }}
          isMobile={isMobile}
        />
      )}
      
      {/* Global Leaderboard Modal */}
      <GlobalLeaderboard
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        isMobile={isMobile}
      />

      {/* Topic Roulette Modal */}
      <TopicRouletteModal
        isOpen={topicRouletteOpen}
        onClose={() => setTopicRouletteOpen(false)}
        isMobile={isMobile}
      />

      {/* AI Consent Modal (whimsical feature) */}
      {aiConsentEnabled && (
        <AIConsentModal
          isOpen={showAIConsent}
          onConsent={() => {
            localStorage.setItem('ai_consent_given', 'true')
            setShowAIConsent(false)
          }}
        />
      )}

      {/* Challenge Completion Notification */}
      {challengeCompletionNotification && (
        <div className="challenge-notification" onClick={() => setChallengeCompletionNotification(null)}>
          <div className="challenge-notification-content">
            <div className="challenge-icon">{challengeCompletionNotification.icon}</div>
            <div className="challenge-text">
              <div className="challenge-title">{challengeCompletionNotification.title}</div>
              <div className="challenge-message">{challengeCompletionNotification.message}</div>
              <div className="challenge-reward">+{challengeCompletionNotification.reward} bonus points!</div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .game-container {
          padding: ${isMobile ? '16px' : '32px'};
          text-align: center;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        
        .title {
          margin-bottom: ${isMobile ? '16px' : '24px'};
          font-size: ${isMobile ? '2rem' : isTablet ? '3rem' : '3.5rem'};
        }
        
        .multiplayer-info {
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }
        
        .room-info {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .room-code {
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .waiting-status {
          text-align: center;
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
        
        .player-info {
          text-align: center;
          margin-bottom: ${isMobile ? '16px' : '24px'};
        }
        
        .player-name {
          margin: 0 0 8px 0;
          font-weight: 500;
          font-size: ${isMobile ? '1rem' : isTablet ? '1.25rem' : '1.5rem'};
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        
        .player-level {
          font-size: 0.8rem;
          color: #F7931E;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.9);
          padding: 2px 8px;
          border-radius: 12px;
          border: 1px solid #FFD23F;
        }
        
        .player-stats-summary {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin: 8px 0;
          flex-wrap: wrap;
        }
        
        .stat-item {
          background: rgba(255, 255, 255, 0.9);
          color: #FF6B35;
          padding: 4px 8px;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid rgba(255, 211, 63, 0.5);
        }
        
        .points-display {
          background: linear-gradient(135deg, #FFD23F 0%, #FF6B35 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 700;
          font-size: ${isMobile ? '1rem' : '1.2rem'};
          display: inline-block;
          box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
          text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
          position: relative;
        }
        
        .bonus-points {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #28a745;
          color: white;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 600;
          animation: bounce 2s ease-in-out 3;
          box-shadow: 0 2px 6px rgba(40, 167, 69, 0.4);
        }
        
        .challenge-status {
          margin-top: 8px;
          text-align: center;
        }
        
        .challenge-indicator {
          background: rgba(255, 255, 255, 0.9);
          color: #FF6B35;
          padding: 6px 12px;
          border-radius: 15px;
          font-size: ${isMobile ? '0.8rem' : '0.9rem'};
          font-weight: 600;
          border: 2px solid #FFD23F;
          display: inline-block;
          transition: all 0.3s ease;
        }
        
        .challenge-indicator.completed {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          border-color: #28a745;
          animation: pulse 2s ease-in-out 3;
        }
        
        .challenge-indicator.active {
          animation: glow 3s ease-in-out infinite;
        }
        
        
        .card-container {
          display: flex;
          justify-content: center;
          width: 100%;
          max-width: ${isMobile ? '100vw' : 'auto'};
          padding: ${isMobile ? '0 8px' : '0'};
          overflow: ${isMobile ? 'visible' : 'auto'};
          /* Better mobile scrolling */
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .card-container::-webkit-scrollbar {
          display: none;
        }
        
        .bingo-card {
          padding: ${isMobile ? '8px' : isTablet ? '20px' : '28px'};
          position: relative;
          /* Ensure card doesn't overflow on mobile */
          max-width: ${isMobile ? '100%' : 'none'};
          width: ${isMobile ? '100%' : 'auto'};
          margin: ${isMobile ? '0' : '0'};
          /* Better mobile rendering */
          box-sizing: border-box;
        }
        
        .bingo-header {
          display: grid;
          grid-template-columns: ${isMobile ? 'repeat(5, 1fr)' : `repeat(5, ${cellSize}px)`};
          gap: ${isMobile ? '2px' : '4px'};
          margin-bottom: 0;
          width: ${isMobile ? '100%' : 'fit-content'};
          border: 3px solid #FF6B35;
          border-radius: 12px 12px 0 0;
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          padding: ${isMobile ? '6px' : '8px'};
          box-sizing: border-box;
        }
        
        .header-cell {
          height: ${isMobile ? 'auto' : isTablet ? '60px' : '75px'};
          aspect-ratio: ${isMobile ? '1' : 'auto'};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${isMobile ? '1.2rem' : isTablet ? '2.8rem' : '3.5rem'};
          font-weight: 900;
          color: white;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          min-height: ${isMobile ? '36px' : 'auto'};
        }
        
        .bingo-grid {
          display: grid;
          grid-template-columns: ${isMobile ? 'repeat(5, 1fr)' : `repeat(5, ${cellSize}px)`};
          gap: ${isMobile ? '2px' : '4px'};
          border: 3px solid #FF6B35;
          border-top: none;
          border-radius: 0 0 12px 12px;
          background: #FFF8E1;
          padding: ${isMobile ? '6px' : '8px'};
          /* Ensure no horizontal overflow on mobile */
          max-width: 100%;
          box-sizing: border-box;
          width: ${isMobile ? '100%' : 'fit-content'};
        }
        
        .grid-cell {
          height: ${isMobile ? 'auto' : cellSize + 'px'};
          aspect-ratio: ${isMobile ? '1' : 'auto'};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          /* Improved touch targets for mobile */
          min-height: ${isMobile ? '50px' : cellSize + 'px'};
          touch-action: manipulation;
          position: relative;
          /* Better mobile interaction feedback */
          transition: all 0.15s ease;
          /* Ensure cells are square on mobile */
          ${isMobile ? 'width: 100%;' : ''}
        }
        
        .grid-cell:active {
          transform: scale(0.95);
          /* Enhanced mobile feedback */
          background-color: ${isMobile ? 'rgba(255, 107, 53, 0.1)' : 'transparent'};
        }
        
        /* Improve touch responsiveness on mobile */
        @media (max-width: 768px) {
          .grid-cell:hover {
            background-color: rgba(255, 107, 53, 0.05);
          }
          
          .grid-cell:active {
            background-color: rgba(255, 107, 53, 0.15);
            transform: scale(0.92);
          }
        }
        
        .grid-cell.free {
          cursor: default;
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
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        
        .icon-wrapper {
          animation: bounce 1s ease-in-out infinite;
        }
        
        .reset-hint {
          position: absolute;
          top: 4px;
          right: 4px;
          font-size: ${isMobile ? '0.8rem' : '1rem'};
          background-color: rgba(255, 107, 53, 0.9);
          border-radius: 50%;
          width: ${isMobile ? '16px' : '20px'};
          height: ${isMobile ? '16px' : '20px'};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          opacity: 0.7;
          transition: all 0.2s ease;
          cursor: pointer;
          z-index: 10;
        }
        
        .grid-cell.selected:hover .reset-hint {
          opacity: 1;
        }
        
        .reset-hint:hover {
          transform: scale(1.2);
          background-color: #dc3545;
          opacity: 1;
        }
        
        .action-buttons {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .add-click {
          cursor: pointer;
          transition: all 0.2s ease;
          background: rgba(40, 167, 69, 0.9) !important;
          color: white !important;
          border-color: rgba(40, 167, 69, 0.5) !important;
        }
        
        .add-click:hover {
          transform: scale(1.1);
          background: rgba(40, 167, 69, 1) !important;
          box-shadow: 0 2px 5px rgba(40, 167, 69, 0.5);
        }
        
        .cell-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          position: relative;
          z-index: 3;
        }
        
        .cell-text {
          font-weight: 600;
          font-size: ${isMobile ? '0.6rem' : isTablet ? '0.75rem' : '0.85rem'};
          line-height: ${isMobile ? '1.1' : '1.15'};
          text-align: center;
          word-break: break-word;
          hyphens: auto;
          margin-bottom: ${isMobile ? '2px' : '3px'};
          padding: ${isMobile ? '1px' : '0 2px'};
          /* Better mobile text rendering */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          /* Ensure text fits in smaller cells */
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: ${isMobile ? '2' : '3'};
          -webkit-box-orient: vertical;
          /* Make text more compact on mobile */
          ${isMobile ? 'max-height: 24px;' : ''}
        }
        
        .cell-info {
          display: flex;
          gap: 4px;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
        }
        
        .point-value {
          background: rgba(255, 255, 255, 0.95);
          color: #FF6B35;
          font-size: ${isMobile ? '0.55rem' : '0.75rem'};
          font-weight: 700;
          padding: ${isMobile ? '1px 3px' : '2px 5px'};
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          border: 1px solid rgba(255, 107, 53, 0.2);
          /* Better mobile touch targets */
          min-height: ${isMobile ? '16px' : 'auto'};
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .click-count {
          background: #F7931E;
          color: white;
          font-size: ${isMobile ? '0.6rem' : '0.65rem'};
          font-weight: 600;
          padding: 2px 4px;
          border-radius: 6px;
          min-width: 18px;
          text-align: center;
        }
        
        .grid-cell.free .cell-text {
          font-size: ${isMobile ? '1rem' : isTablet ? '1.2rem' : '1.5rem'};
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
        
        .final-standings {
          margin-top: 20px;
          text-align: left;
        }
        
        .final-standings h4 {
          color: #FF6B35;
          margin: 0 0 12px 0;
          font-size: 1.1rem;
          font-family: "Inter", sans-serif;
          font-weight: 700;
          text-align: center;
        }
        
        .standing-item.winner {
          background: linear-gradient(135deg, #FFD23F 0%, #FF6B35 100%);
          color: white;
          font-weight: 700;
        }
        
        .standing-item.winner .rank,
        .standing-item.winner .player-name,
        .standing-item.winner .player-points {
          color: white;
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
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .notification-content {
          flex: 1;
        }
        
        .notification-close {
          background: none;
          border: none;
          color: #666;
          font-size: 20px;
          cursor: pointer;
          padding: 0 4px;
          line-height: 1;
          font-weight: 700;
          transition: all 0.2s ease;
        }
        
        .notification-close:hover {
          color: #FF6B35;
          transform: scale(1.2);
        }
        
        .challenge-notification {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 8px 24px rgba(40, 167, 69, 0.4);
          z-index: 1002;
          animation: challengeBounce 0.6s ease-out;
          cursor: pointer;
          max-width: 300px;
          width: 90%;
        }
        
        .challenge-notification-content {
          display: flex;
          align-items: center;
          gap: 16px;
          color: white;
        }
        
        .challenge-icon {
          font-size: 3rem;
          animation: spin 2s ease-in-out;
        }
        
        .challenge-text {
          flex: 1;
        }
        
        .challenge-title {
          font-size: 1.2rem;
          font-weight: 800;
          margin-bottom: 4px;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }
        
        .challenge-message {
          font-size: 0.9rem;
          opacity: 0.9;
          margin-bottom: 6px;
        }
        
        .challenge-reward {
          font-size: 1rem;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 8px;
          border-radius: 12px;
          display: inline-block;
        }
        
        .achievement-notification {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 8px 24px rgba(111, 66, 193, 0.4);
          z-index: 1003;
          animation: achievementBounce 0.8s ease-out;
          cursor: pointer;
          max-width: 320px;
          width: 90%;
          border: 3px solid #ffd700;
        }
        
        .achievement-notification-content {
          display: flex;
          align-items: center;
          gap: 16px;
          color: white;
        }
        
        .achievement-icon {
          font-size: 3rem;
          animation: glow 2s ease-in-out infinite;
        }
        
        .achievement-text {
          flex: 1;
        }
        
        .achievement-title {
          font-size: 1rem;
          font-weight: 800;
          margin-bottom: 4px;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
          color: #ffd700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .achievement-name {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 4px;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }
        
        .achievement-description {
          font-size: 0.9rem;
          opacity: 0.9;
          margin-bottom: 6px;
        }
        
        .achievement-points {
          font-size: 1rem;
          font-weight: 700;
          background: rgba(255, 215, 0, 0.3);
          padding: 4px 8px;
          border-radius: 12px;
          display: inline-block;
          border: 1px solid #ffd700;
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
        
        @keyframes glow {
          0%, 100% { 
            box-shadow: 0 2px 8px rgba(255, 211, 63, 0.3);
          }
          50% { 
            box-shadow: 0 4px 16px rgba(255, 211, 63, 0.6);
          }
        }
        
        @keyframes challengeBounce {
          0% { 
            transform: translate(-50%, -50%) scale(0.3);
            opacity: 0;
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 1;
          }
          100% { 
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes achievementBounce {
          0% { 
            transform: translate(-50%, -50%) scale(0.3) rotate(-10deg);
            opacity: 0;
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.2) rotate(5deg);
            opacity: 1;
          }
          100% { 
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        
        .players-dialog {
          max-width: 900px;
          max-height: 85vh;
          width: 90%;
        }
        
        .players-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          padding: 10px 0;
        }
        
        .player-board {
          background: rgba(255, 248, 225, 0.7);
          border: 2px solid #FFD23F;
          border-radius: 12px;
          padding: 16px;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        
        .player-board:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .player-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .player-name {
          color: #FF6B35;
          font-weight: 700;
          font-size: 1rem;
          margin: 0;
          font-family: "Inter", sans-serif;
        }
        
        .player-stats {
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: flex-end;
        }
        
        .player-progress {
          background: #FF6B35;
          color: white;
          padding: 3px 6px;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 600;
        }
        
        .player-points {
          background: #FFD23F;
          color: #FF6B35;
          padding: 3px 6px;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 700;
        }
        
        .mini-bingo-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 3px;
          background: #FF6B35;
          border-radius: 8px;
          padding: 4px;
          aspect-ratio: 1;
          width: 100%;
        }
        
        .mini-cell {
          aspect-ratio: 1;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 600;
          border-radius: 2px;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          padding: 2px;
        }
        
        .mini-cell-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          width: 100%;
          position: relative;
        }
        
        .mini-cell-text {
          font-size: 0.6rem;
          line-height: 1;
          text-align: center;
          word-break: break-word;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          max-height: 80%;
          padding: 1px;
        }
        
        .mini-cell-check {
          position: absolute;
          top: 0;
          right: 0;
          background: rgba(247, 147, 30, 0.8);
          color: white;
          border-radius: 0 0 0 4px;
          padding: 1px 3px;
          font-size: 0.6rem;
          line-height: 1;
        }
        
        .mini-cell-icon {
          font-size: 1rem;
          opacity: 0.5;
          position: absolute;
        }
        
        .mini-cell.selected {
          background: rgba(247, 147, 30, 0.2);
          border: 1px solid #F7931E;
        }
        
        .mini-cell.free {
          background: rgba(255, 210, 63, 0.2);
          border: 1px solid #FFD23F;
        }
        
        .mini-cell:hover {
          transform: scale(1.1);
          z-index: 10;
          position: relative;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        @media (max-width: 768px) {
          .players-dialog {
            max-width: 95%;
            max-height: 90vh;
          }
          
          .players-grid {
            grid-template-columns: 1fr;
          }
          
          .mini-cell-text {
            font-size: 0.55rem;
            -webkit-line-clamp: 1;
          }
          
          .mini-cell-check {
            font-size: 0.5rem;
            padding: 0px 2px;
          }
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
        
        .instructions-dialog {
          max-width: 700px;
          max-height: 85vh;
        }
        
        .instructions-content {
          line-height: 1.7;
          color: #333;
        }
        
        .instructions-intro {
          text-align: center;
          background: rgba(255, 211, 63, 0.15);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
        }
        
        .instructions-intro p {
          margin: 0;
          font-size: 1.1rem;
          color: #FF6B35;
          font-weight: 600;
        }
        
        .instructions-content h3 {
          color: #FF6B35;
          font-family: "Inter", sans-serif;
          font-weight: 700;
          font-size: 1.3rem;
          margin-top: 28px;
          margin-bottom: 12px;
        }
        
        .instructions-list {
          padding-left: 20px;
          margin-bottom: 20px;
        }
        
        .instructions-list li {
          margin-bottom: 16px;
          padding-left: 8px;
        }
        
        .instructions-list strong {
          color: #F7931E;
        }
        
        .pro-tips {
          list-style: none;
          padding-left: 0;
          margin-bottom: 20px;
        }
        
        .pro-tips li {
          margin-bottom: 14px;
          padding-left: 30px;
          position: relative;
        }
        
        .pro-tips li strong {
          color: #F7931E;
        }
        
        .instructions-footer {
          background: rgba(255, 248, 225, 0.8);
          border-radius: 8px;
          padding: 16px;
          margin-top: 24px;
          text-align: center;
          border: 1px solid rgba(255, 211, 63, 0.3);
        }
        
        .instructions-footer p {
          margin: 0;
          color: #666;
          font-size: 0.95rem;
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
        
        .challenge-modal {
          max-width: 600px;
          max-height: 85vh;
        }
        
        .challenge-details {
          line-height: 1.6;
          color: #333;
        }
        
        .challenge-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid rgba(255, 211, 63, 0.3);
        }
        
        .challenge-name {
          color: #FF6B35;
          font-family: "Inter", sans-serif;
          font-weight: 700;
          font-size: 1.4rem;
          margin: 0;
        }
        
        .difficulty-badge {
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .difficulty-easy {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        
        .difficulty-medium {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }
        
        .difficulty-hard {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        
        .challenge-description {
          margin-bottom: 20px;
        }
        
        .challenge-description p {
          font-size: 1.1rem;
          color: #555;
          margin: 0;
        }
        
        .challenge-reward-info {
          margin-bottom: 20px;
        }
        
        .reward-box {
          background: rgba(255, 211, 63, 0.15);
          border: 2px solid #FFD23F;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
        }
        
        .reward-label {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }
        
        .reward-amount {
          font-size: 1.3rem;
          font-weight: 800;
          color: #FF6B35;
          font-family: "Inter", sans-serif;
        }
        
        .challenge-status-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 20px;
        }
        
        .challenge-status-box.completed {
          background: rgba(40, 167, 69, 0.1);
          border: 2px solid #28a745;
        }
        
        .challenge-status-box.active {
          background: rgba(255, 193, 7, 0.1);
          border: 2px solid #FFC107;
        }
        
        .status-icon {
          font-size: 1.5rem;
        }
        
        .status-title {
          font-weight: 700;
          font-size: 1rem;
          margin-bottom: 4px;
        }
        
        .status-message {
          font-size: 0.9rem;
          color: #666;
        }
        
        .challenge-status-box.completed .status-title {
          color: #28a745;
        }
        
        .challenge-status-box.active .status-title {
          color: #856404;
        }
        
        .challenge-tips {
          background: rgba(255, 248, 225, 0.8);
          border-radius: 8px;
          padding: 16px;
          border: 1px solid rgba(255, 211, 63, 0.3);
        }
        
        .challenge-tips h4 {
          color: #FF6B35;
          margin: 0 0 12px 0;
          font-size: 1rem;
          font-family: "Inter", sans-serif;
          font-weight: 700;
        }
        
        .challenge-tips ul {
          margin: 0;
          padding-left: 20px;
          color: #555;
        }
        
        .challenge-tips li {
          margin-bottom: 6px;
          font-size: 0.9rem;
        }
        
        .stop-game-warning {
          text-align: center;
          color: #333;
          line-height: 1.6;
        }
        
        .current-standings {
          margin-top: 20px;
          background: rgba(255, 248, 225, 0.8);
          border-radius: 8px;
          padding: 16px;
          border: 1px solid rgba(255, 211, 63, 0.3);
        }
        
        .current-standings h4 {
          color: #FF6B35;
          margin: 0 0 12px 0;
          font-size: 1.1rem;
          font-family: "Inter", sans-serif;
          font-weight: 700;
        }
        
        .standings-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .standing-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: white;
          border-radius: 6px;
          border: 1px solid #FFD23F;
        }
        
        .rank {
          font-weight: 700;
          color: #FF6B35;
          min-width: 30px;
        }
        
        .player-name {
          flex: 1;
          text-align: left;
          margin-left: 12px;
          font-weight: 600;
        }
        
        .player-points {
          color: #F7931E;
          font-weight: 700;
          font-size: 0.9rem;
        }
        
        .stop-confirm-btn {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-right: 12px;
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
        }
        
        .stop-confirm-btn:hover {
          background: linear-gradient(135deg, #c82333 0%, #dc3545 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(220, 53, 69, 0.4);
        }
      `}</style>
    </div>
  )
}