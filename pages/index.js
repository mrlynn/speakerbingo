import React, { useState, useEffect, useCallback } from 'react'
import { Box, Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Paper, useMediaQuery, useTheme, Chip, CircularProgress } from '@mui/material'
import GameLobby from '../components/GameLobby'

const ALL_PHRASES = [
  'Pittsburgh or Tuesday', 'Who knew?', "I'm an alcoholic", 'Shine Bright', 'Anyways', 'Zoomaholic', 'You know',
  'Purposeful Life', 'Darkness', 'Prostitutes', 'Husband in Prison', "Let's have ourselves a ___day.",
  'I have more time than ____.', 'Bill W. was a philanderer', 'I dunno.', "y'know", 'Pre-teen Diabetic',
  'Um', 'Like', 'At the end of the day', 'Just saying', 'Right?', "If I'm being honest", "For what it's worth",
  'That being said', 'You get the picture', 'Honestly', 'Kind of', 'Sort of', 'So', 'Basically', 'Moving on', 'Gonna',
  "I'm not gonna lie", 'To be fair'
]

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function generateGrid() {
  const chosen = shuffleArray([...ALL_PHRASES]).slice(0, 24)
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
  
  // Local game state
  const [grid, setGrid] = useState([])
  const [selected, setSelected] = useState([])
  const [bingo, setBingo] = useState(false)
  
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  // Initialize single player game when mode changes
  useEffect(() => {
    if (gameMode === 'single') {
      const newGrid = generateGrid()
      setGrid(newGrid)
      const initialSelected = Array(5).fill(0).map(() => Array(5).fill(false))
      initialSelected[2][2] = true
      setSelected(initialSelected)
      setIsMultiplayer(false)
    }
  }, [gameMode])

  // Poll for game updates in multiplayer
  useEffect(() => {
    if (!isMultiplayer || !roomCode) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/games/${roomCode}/state`)
        const data = await response.json()
        
        if (data.game) {
          setGameState(data.game)
          
          // Check if someone else won
          if (data.game.winner && data.game.winner !== playerId) {
            const winner = data.game.players.find(p => p.id === data.game.winner)
            setBingo(true)
          }
        }
      } catch (err) {
        console.error('Failed to poll game state:', err)
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(pollInterval)
  }, [isMultiplayer, roomCode, playerId])

  // Update multiplayer game state when local state changes
  const updateMultiplayerState = useCallback(async (newSelected, hasWon) => {
    if (!isMultiplayer || !roomCode || !playerId) return

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
    } catch (err) {
      console.error('Failed to update game state:', err)
    }
  }, [isMultiplayer, roomCode, playerId])

  function checkBingo(sel) {
    // Check rows
    for (let r = 0; r < 5; r++) {
      if (sel[r].every(Boolean)) return true
    }
    // Check columns
    for (let c = 0; c < 5; c++) {
      if (sel.map(row => row[c]).every(Boolean)) return true
    }
    // Check diagonals
    if (sel[0][0] && sel[1][1] && sel[2][2] && sel[3][3] && sel[4][4]) return true
    if (sel[0][4] && sel[1][3] && sel[2][2] && sel[3][1] && sel[4][0]) return true
    return false
  }

  function handleClick(r, c) {
    if (r === 2 && c === 2) return // Can't unselect FREE space
    if (gameState?.status === 'finished') return // Game is over
    
    const copy = selected.map(row => [...row])
    copy[r][c] = !copy[r][c]
    setSelected(copy)
    
    const hasWon = checkBingo(copy)
    if (hasWon) {
      setBingo(true)
    }
    
    // Update multiplayer state
    updateMultiplayerState(copy, hasWon)
  }

  const handleCreateGame = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const newGrid = generateGrid()
      const response = await fetch('/api/games/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName,
          phrases: newGrid
        })
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      
      setRoomCode(data.roomCode)
      setPlayerId(data.playerId)
      setGameState(data.game)
      setGrid(newGrid)
      setSelected(data.game.players[0].selected)
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
      const newGrid = generateGrid()
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
      setGrid(newGrid)
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

  // Show lobby if in menu mode
  if (gameMode === 'menu') {
    return (
      <Box sx={{ 
        p: isMobile ? 2 : 4, 
        minHeight: '100vh',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <GameLobby
          mode={mode}
          setMode={setMode}
          playerName={playerName}
          setPlayerName={setPlayerName}
          roomCode={roomCode}
          setRoomCode={setRoomCode}
          onCreateGame={handleCreateGame}
          onJoinGame={handleJoinGame}
          isMobile={isMobile}
        />
        
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        
        {loading && <CircularProgress sx={{ mt: 2 }} />}
        
        <Button
          variant="text"
          onClick={startSinglePlayer}
          sx={{ mt: 3, color: '#666' }}
        >
          Play Single Player
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ 
      p: isMobile ? 2 : 4, 
      textAlign: 'center',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Typography 
        variant={isMobile ? "h4" : "h2"} 
        gutterBottom 
        sx={{ 
          fontWeight: 'bold',
          color: '#d32f2f',
          textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
          mb: isMobile ? 2 : 3,
          fontSize: isMobile ? '1.75rem' : isTablet ? '2.5rem' : '3.75rem'
        }}
      >
        Sunrise Semester Bingo
      </Typography>
      
      {/* Multiplayer info */}
      {isMultiplayer && (
        <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Chip 
            label={`Room: ${roomCode}`} 
            color="primary" 
            sx={{ backgroundColor: '#d32f2f' }}
          />
          <Chip 
            label={`Players: ${gameState?.players?.length || 1}`} 
            variant="outlined" 
          />
          {gameState?.status === 'waiting' && (
            <Chip label="Waiting for players..." color="warning" />
          )}
        </Box>
      )}
      
      {/* Player list for multiplayer */}
      {isMultiplayer && gameState && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Players: {gameState.players.map(p => p.name).join(', ')}
          </Typography>
        </Box>
      )}
      
      {/* Current player name */}
      {(playerName || !isMultiplayer) && (
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          sx={{ 
            mb: isMobile ? 2 : 3, 
            fontWeight: 'medium',
            fontSize: isMobile ? '1rem' : isTablet ? '1.25rem' : '1.5rem'
          }}
        >
          Player: {playerName || 'Guest'}
        </Typography>
      )}
      
      {/* Back to menu button */}
      <Button
        variant="outlined"
        size="small"
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
        sx={{ 
          position: 'absolute',
          top: isMobile ? 10 : 20,
          left: isMobile ? 10 : 20,
          borderColor: '#d32f2f',
          color: '#d32f2f',
          '&:hover': {
            borderColor: '#b71c1c',
            backgroundColor: 'rgba(211, 47, 47, 0.04)'
          }
        }}
      >
        ← Back to Menu
      </Button>
      
      {/* Bingo Card */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        width: '100%',
        maxWidth: isMobile ? '100vw' : 'auto',
        px: isMobile ? 1 : 0,
        overflowX: 'auto'
      }}>
        <Paper elevation={10} sx={{ 
          display: 'inline-block',
          backgroundColor: 'white',
          p: isMobile ? 1 : isTablet ? 2 : 3,
          borderRadius: 2,
          minWidth: 'min-content'
        }}>
          {/* BINGO Header */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: `repeat(5, ${cellSize}px)`,
            gap: 0,
            mb: 0
          }}>
            {['B','I','N','G','O'].map((letter) => (
              <Box key={letter} sx={{ 
                height: isMobile ? 45 : isTablet ? 55 : 70,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#d32f2f',
                color: 'white',
                fontSize: isMobile ? '2rem' : isTablet ? '2.5rem' : '3rem',
                fontWeight: 'bold',
                borderRadius: '8px 8px 0 0',
                border: '2px solid #b71c1c',
                borderBottom: 'none'
              }}>
                {letter}
              </Box>
            ))}
          </Box>
          
          {/* Bingo Grid */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: `repeat(5, ${cellSize}px)`,
            gap: 0,
            border: '3px solid #b71c1c',
            borderTop: '3px solid #b71c1c',
            backgroundColor: 'white'
          }}>
            {grid.map((row, r) =>
              row.map((phrase, c) => (
                <Box
                  key={`${r}-${c}`}
                  onClick={() => handleClick(r, c)}
                  sx={{
                    border: '1px solid #000',
                    height: cellSize,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 
                      r === 2 && c === 2 ? '#ffd700' : 
                      selected[r] && selected[r][c] ? '#ff4444' : 'white',
                    cursor: r === 2 && c === 2 ? 'default' : 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    WebkitTapHighlightColor: 'transparent',
                    '&:active': {
                      transform: r === 2 && c === 2 ? 'none' : 'scale(0.95)'
                    },
                    '@media (hover: hover)': {
                      '&:hover': {
                        backgroundColor: 
                          r === 2 && c === 2 ? '#ffd700' : 
                          selected[r] && selected[r][c] ? '#ff4444' : '#f9f9f9',
                        transform: r === 2 && c === 2 ? 'none' : 'scale(0.98)'
                      }
                    }
                  }}
                >
                  {/* Dauber effect */}
                  {selected[r] && selected[r][c] && !(r === 2 && c === 2) && (
                    <Box sx={{
                      position: 'absolute',
                      width: '85%',
                      height: '85%',
                      borderRadius: '50%',
                      backgroundColor: '#ff4444',
                      opacity: 0.9,
                      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)',
                      zIndex: 1
                    }} />
                  )}
                  
                  {/* FREE space star */}
                  {r === 2 && c === 2 && (
                    <Box sx={{
                      position: 'absolute',
                      fontSize: isMobile ? '2.5rem' : isTablet ? '3rem' : '4rem',
                      color: '#d32f2f',
                      opacity: 0.2,
                      transform: 'rotate(15deg)'
                    }}>
                      ★
                    </Box>
                  )}
                  
                  <Typography sx={{ 
                    fontWeight: r === 2 && c === 2 ? 'bold' : 'medium',
                    fontSize: r === 2 && c === 2 ? 
                      (isMobile ? '1.1rem' : isTablet ? '1.4rem' : '1.8rem') : 
                      (isMobile ? '0.55rem' : isTablet ? '0.7rem' : '0.8rem'),
                    lineHeight: 1.1,
                    p: isMobile ? 0.3 : isTablet ? 0.5 : 1,
                    textAlign: 'center',
                    color: 
                      r === 2 && c === 2 ? '#d32f2f' : 
                      selected[r] && selected[r][c] ? 'white' : 'black',
                    zIndex: 2,
                    position: 'relative',
                    wordBreak: 'break-word',
                    hyphens: 'auto'
                  }}>
                    {phrase}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </Paper>
      </Box>
      
      {/* Winner Dialog */}
      <Dialog 
        open={bingo} 
        onClose={() => setBingo(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          fontSize: isMobile ? '1.5rem' : '2rem',
          fontWeight: 'bold',
          color: '#d32f2f'
        }}>
          🎉 Bingo! 🎉
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ 
            textAlign: 'center', 
            fontSize: isMobile ? '1rem' : '1.25rem',
            my: 2
          }}>
            {gameState?.winner === playerId ? 
              `Congratulations ${playerName}, you won!` :
              gameState?.winner ? 
                `${gameState.players.find(p => p.id === gameState.winner)?.name} won!` :
                `Congratulations ${playerName || 'Player'}, you've got a Bingo!`
            }
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={() => {
              setBingo(false)
              window.location.reload()
            }}
            variant="contained"
            size={isMobile ? "medium" : "large"}
            sx={{ 
              backgroundColor: '#d32f2f',
              '&:hover': {
                backgroundColor: '#b71c1c'
              }
            }}
          >
            New Game
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}