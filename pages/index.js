import React, { useState, useEffect, useCallback } from 'react'
import { Box, Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Paper, useMediaQuery, useTheme, Chip, CircularProgress } from '@mui/material'
import GameLobby from '../components/GameLobby'
import { sunriseTheme } from '../lib/theme'

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
        background: sunriseTheme.gradients.sky,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 30% 20%, ${sunriseTheme.colors.sunrise.golden}20 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${sunriseTheme.colors.sunrise.dawn}15 0%, transparent 50%)`,
          pointerEvents: 'none',
          zIndex: 0
        }
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
      background: sunriseTheme.gradients.sky,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle at 30% 20%, ${sunriseTheme.colors.sunrise.golden}20 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${sunriseTheme.colors.sunrise.dawn}15 0%, transparent 50%)`,
        pointerEvents: 'none',
        zIndex: 0
      }
    }}>
      <Typography 
        variant={isMobile ? "h4" : "h2"} 
        gutterBottom 
        sx={{ 
          fontFamily: '"Playfair Display", serif',
          fontWeight: 700,
          background: sunriseTheme.gradients.sunrise,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          textShadow: 'none',
          mb: isMobile ? 2 : 3,
          fontSize: isMobile ? '1.8rem' : isTablet ? '2.8rem' : '3.2rem',
          position: 'relative',
          zIndex: 1
        }}
      >
        Sunrise Semester Bingo
      </Typography>
      
      {/* Multiplayer info */}
      {isMultiplayer && (
        <Box sx={{ 
          mb: 2, 
          display: 'flex', 
          gap: 2, 
          flexWrap: 'wrap', 
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <Chip 
            label={`🏠 Room: ${roomCode}`} 
            sx={{ 
              background: sunriseTheme.gradients.button,
              color: 'white',
              fontWeight: 600,
              boxShadow: sunriseTheme.shadows.soft,
              '& .MuiChip-label': {
                px: 2
              }
            }}
          />
          <Chip 
            label={`👥 Players: ${gameState?.players?.length || 1}`} 
            variant="outlined"
            sx={{
              borderColor: sunriseTheme.colors.sunrise.morning,
              color: sunriseTheme.colors.sunrise.dawn,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 600,
              borderWidth: '2px',
              '&:hover': {
                backgroundColor: `${sunriseTheme.colors.sunrise.dawn}10`
              }
            }}
          />
          {gameState?.status === 'waiting' && (
            <Chip 
              label="⏳ Waiting for players..." 
              sx={{
                backgroundColor: sunriseTheme.colors.sunrise.golden,
                color: sunriseTheme.colors.text.dark,
                fontWeight: 600,
                animation: 'pulse 2s ease-in-out infinite'
              }}
            />
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
          borderColor: sunriseTheme.colors.sunrise.morning,
          color: sunriseTheme.colors.sunrise.dawn,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          fontWeight: 600,
          borderWidth: '2px',
          borderRadius: 2,
          backdropFilter: 'blur(10px)',
          zIndex: 10,
          '&:hover': {
            borderColor: sunriseTheme.colors.sunrise.dawn,
            backgroundColor: `${sunriseTheme.colors.sunrise.dawn}10`,
            transform: 'translateY(-1px)',
            boxShadow: sunriseTheme.shadows.soft
          }
        }}
      >
        🏠 Back to Menu
      </Button>
      
      {/* Bingo Card */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        width: '100%',
        maxWidth: isMobile ? '100vw' : 'auto',
        px: isMobile ? 1 : 0,
        overflowX: 'auto',
        position: 'relative',
        zIndex: 1
      }}>
        <Paper elevation={0} sx={{ 
          display: 'inline-block',
          background: sunriseTheme.gradients.card,
          p: isMobile ? 1.5 : isTablet ? 2.5 : 3.5,
          borderRadius: 3,
          minWidth: 'min-content',
          border: `3px solid ${sunriseTheme.colors.sunrise.golden}60`,
          boxShadow: sunriseTheme.shadows.strong,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            background: sunriseTheme.gradients.header,
            borderRadius: 'inherit',
            zIndex: -1
          }
        }}>
          {/* BINGO Header */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: `repeat(5, ${cellSize}px)`,
            gap: 1,
            mb: 1
          }}>
            {['B','I','N','G','O'].map((letter, index) => (
              <Box key={letter} sx={{ 
                height: isMobile ? 50 : isTablet ? 60 : 75,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: sunriseTheme.gradients.header,
                color: 'white',
                fontSize: isMobile ? '2.2rem' : isTablet ? '2.8rem' : '3.5rem',
                fontWeight: 800,
                fontFamily: '"Playfair Display", serif',
                borderRadius: '12px 12px 0 0',
                border: `3px solid ${sunriseTheme.colors.sunrise.dawn}`,
                borderBottom: 'none',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                boxShadow: `inset 0 2px 10px rgba(255,255,255,0.3), ${sunriseTheme.shadows.soft}`,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: `${index * 20}%`,
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)`,
                  animation: `shine 3s ease-in-out infinite ${index * 0.5}s`
                }
              }}>
                {letter}
              </Box>
            ))}
          </Box>
          
          {/* Bingo Grid */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: `repeat(5, ${cellSize}px)`,
            gap: 1,
            border: `3px solid ${sunriseTheme.colors.sunrise.dawn}`,
            borderTop: `3px solid ${sunriseTheme.colors.sunrise.dawn}`,
            borderRadius: '0 0 12px 12px',
            backgroundColor: sunriseTheme.colors.warm.cream,
            p: 1
          }}>
            {grid.map((row, r) =>
              row.map((phrase, c) => (
                <Box
                  key={`${r}-${c}`}
                  onClick={() => handleClick(r, c)}
                  sx={{
                    border: `2px solid ${sunriseTheme.colors.sunrise.golden}80`,
                    borderRadius: 2,
                    height: cellSize,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 
                      r === 2 && c === 2 ? sunriseTheme.gradients.sunrise : 
                      selected[r] && selected[r][c] ? sunriseTheme.gradients.button : 
                      'linear-gradient(145deg, #ffffff 0%, #fff8e1 100%)',
                    cursor: r === 2 && c === 2 ? 'default' : 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    WebkitTapHighlightColor: 'transparent',
                    boxShadow: selected[r] && selected[r][c] ? 
                      sunriseTheme.shadows.medium : 
                      'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 8px rgba(255,149,0,0.15)',
                    '&:active': {
                      transform: r === 2 && c === 2 ? 'none' : 'scale(0.95)',
                      boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.2)'
                    },
                    '@media (hover: hover)': {
                      '&:hover': {
                        background: 
                          r === 2 && c === 2 ? sunriseTheme.gradients.sunrise : 
                          selected[r] && selected[r][c] ? sunriseTheme.gradients.button : 
                          `linear-gradient(145deg, ${sunriseTheme.colors.accent.light} 0%, ${sunriseTheme.colors.warm.sand} 100%)`,
                        transform: r === 2 && c === 2 ? 'scale(1.02)' : 'scale(0.98)',
                        boxShadow: sunriseTheme.shadows.medium,
                        borderColor: sunriseTheme.colors.sunrise.morning
                      }
                    }
                  }}
                >
                  {/* Sunrise burst effect for selected */}
                  {selected[r] && selected[r][c] && !(r === 2 && c === 2) && (
                    <>
                      <Box sx={{
                        position: 'absolute',
                        width: '90%',
                        height: '90%',
                        borderRadius: '50%',
                        background: sunriseTheme.gradients.button,
                        opacity: 0.95,
                        boxShadow: `inset 0 0 15px rgba(0,0,0,0.2), 0 0 20px ${sunriseTheme.colors.sunrise.golden}60`,
                        zIndex: 1,
                        animation: 'selectedPulse 2s ease-in-out infinite'
                      }} />
                      <Box sx={{
                        position: 'absolute',
                        fontSize: isMobile ? '1.5rem' : '2rem',
                        color: 'white',
                        zIndex: 2,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                        animation: 'bounce 1s ease-in-out infinite'
                      }}>
                        ✨
                      </Box>
                    </>
                  )}
                  
                  {/* FREE space sun */}
                  {r === 2 && c === 2 && (
                    <>
                      <Box sx={{
                        position: 'absolute',
                        fontSize: isMobile ? '3rem' : isTablet ? '4rem' : '5rem',
                        color: 'white',
                        opacity: 0.3,
                        transform: 'rotate(0deg)',
                        animation: 'rotate 8s linear infinite'
                      }}>
                        ☀️
                      </Box>
                      <Box sx={{
                        position: 'absolute',
                        width: '120%',
                        height: '120%',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${sunriseTheme.colors.sunrise.golden}40 0%, transparent 70%)`,
                        animation: 'glow 3s ease-in-out infinite'
                      }} />
                    </>
                  )}
                  
                  <Typography sx={{ 
                    fontFamily: r === 2 && c === 2 ? '"Playfair Display", serif' : 'inherit',
                    fontWeight: r === 2 && c === 2 ? 800 : 600,
                    fontSize: r === 2 && c === 2 ? 
                      (isMobile ? '1.2rem' : isTablet ? '1.5rem' : '2rem') : 
                      (isMobile ? '0.6rem' : isTablet ? '0.75rem' : '0.85rem'),
                    lineHeight: 1.1,
                    p: isMobile ? 0.4 : isTablet ? 0.6 : 0.8,
                    textAlign: 'center',
                    color: 
                      r === 2 && c === 2 ? 'white' : 
                      selected[r] && selected[r][c] ? 'white' : sunriseTheme.colors.text.primary,
                    zIndex: 3,
                    position: 'relative',
                    wordBreak: 'break-word',
                    hyphens: 'auto',
                    textShadow: 
                      r === 2 && c === 2 ? '2px 2px 4px rgba(0,0,0,0.5)' :
                      selected[r] && selected[r][c] ? '1px 1px 2px rgba(0,0,0,0.3)' : 
                      'none'
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
        maxWidth="sm"
        sx={{
          '& .MuiDialog-paper': {
            background: sunriseTheme.gradients.card,
            borderRadius: 3,
            border: `3px solid ${sunriseTheme.colors.sunrise.golden}`,
            boxShadow: sunriseTheme.shadows.strong,
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 50% 0%, ${sunriseTheme.colors.sunrise.golden}20 0%, transparent 70%)`,
              pointerEvents: 'none'
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          fontSize: isMobile ? '2rem' : '2.5rem',
          fontFamily: '"Playfair Display", serif',
          fontWeight: 800,
          background: sunriseTheme.gradients.sunrise,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          py: 3,
          position: 'relative',
          zIndex: 1,
          animation: 'bounce 1s ease-in-out infinite'
        }}>
          🌅 SUNRISE BINGO! 🌅
        </DialogTitle>
        <DialogContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ 
            textAlign: 'center',
            py: 2,
            px: 3,
            borderRadius: 2,
            background: `${sunriseTheme.colors.sunrise.golden}20`,
            border: `1px solid ${sunriseTheme.colors.sunrise.golden}40`,
            mb: 2
          }}>
            <Typography sx={{ 
              fontSize: isMobile ? '1.2rem' : '1.5rem',
              fontWeight: 600,
              color: sunriseTheme.colors.text.primary,
              mb: 1
            }}>
              {gameState?.winner === playerId ? 
                `🎊 Congratulations ${playerName}! 🎊` :
                gameState?.winner ? 
                  `🎊 ${gameState.players.find(p => p.id === gameState.winner)?.name} wins! 🎊` :
                  `🎊 Congratulations ${playerName || 'Player'}! 🎊`
              }
            </Typography>
            <Typography sx={{ 
              fontSize: isMobile ? '0.9rem' : '1.1rem',
              color: sunriseTheme.colors.text.secondary,
              fontStyle: 'italic'
            }}>
              You've caught the sunrise! ✨
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 4, position: 'relative', zIndex: 1 }}>
          <Button 
            onClick={() => {
              setBingo(false)
              window.location.reload()
            }}
            variant="contained"
            size="large"
            sx={{ 
              background: sunriseTheme.gradients.button,
              color: 'white',
              fontWeight: 700,
              fontSize: '1.1rem',
              py: 1.5,
              px: 4,
              borderRadius: 3,
              boxShadow: sunriseTheme.shadows.medium,
              '&:hover': {
                background: `linear-gradient(135deg, ${sunriseTheme.colors.sunrise.dawn} 0%, ${sunriseTheme.colors.sunrise.horizon} 100%)`,
                boxShadow: sunriseTheme.shadows.strong,
                transform: 'translateY(-2px)'
              }
            }}
          >
            🌟 New Sunrise Adventure
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add animations CSS */}
      <style jsx global>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes selectedPulse {
          0%, 100% { opacity: 0.95; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </Box>
  )
}