import React, { useState, useEffect } from 'react'
import { Box, Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Paper, useMediaQuery, useTheme } from '@mui/material'

const ALL_PHRASES = [
  'Pittsburgh or Tuesday', 'Who knew?', "I'm an alcoholic", 'Shine Bright', 'Anyways', 'Zoomaholic', 'You know',
  'Purposeful Life', 'Darkness', 'Prostitutes', 'Husband in Prison', "Let's have ourselves a ___day.",
  'I have more time than ____.', 'Bill W. was a philanderer', 'I dunno.', "y'know", 'Pre-teen Diabetic',
  'Um', 'Like', 'At the end of the day', 'Just saying', 'Right?', "If I'm being honest", 'For what it's worth',
  'That being said', 'You get the picture', 'Honestly', 'Kind of', 'Sort of', 'So', 'Basically', 'Moving on', 'Gonna',
  'I'm not gonna lie', 'To be fair'
]

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function Home() {
  const [player, setPlayer] = useState('')
  const [grid, setGrid] = useState([])
  const [selected, setSelected] = useState([])
  const [bingo, setBingo] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    const chosen = shuffleArray([...ALL_PHRASES]).slice(0, 24) // 24 because center is FREE
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
    setGrid(matrix)
    const initialSelected = Array(5).fill(0).map(() => Array(5).fill(false))
    initialSelected[2][2] = true // FREE space is always selected
    setSelected(initialSelected)
  }, [])

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
    const copy = selected.map(row => [...row])
    copy[r][c] = !copy[r][c]
    setSelected(copy)
    if (checkBingo(copy)) setBingo(true)
  }

  // Calculate responsive cell size
  const getCellSize = () => {
    if (isMobile) return 64
    if (isTablet) return 85
    return 110
  }

  const cellSize = getCellSize()

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
      
      <Box sx={{ mb: isMobile ? 2 : 3 }}>
        <TextField
          label="Your name"
          value={player}
          onChange={e => setPlayer(e.target.value)}
          variant="outlined"
          size={isMobile ? "small" : "medium"}
          sx={{ 
            backgroundColor: 'white',
            width: isMobile ? '200px' : 'auto'
          }}
        />
      </Box>
      
      {player && (
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          sx={{ 
            mb: isMobile ? 2 : 3, 
            fontWeight: 'medium',
            fontSize: isMobile ? '1rem' : isTablet ? '1.25rem' : '1.5rem'
          }}
        >
          Player: {player}
        </Typography>
      )}
      
      {/* Bingo Card Container */}
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
                      selected[r][c] ? '#ff4444' : 'white',
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
                          selected[r][c] ? '#ff4444' : '#f9f9f9',
                        transform: r === 2 && c === 2 ? 'none' : 'scale(0.98)'
                      }
                    }
                  }}
                >
                  {/* Dauber effect for marked cells */}
                  {selected[r][c] && !(r === 2 && c === 2) && (
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
                      selected[r][c] ? 'white' : 'black',
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
            Congratulations {player || 'Player'}, you've got a Bingo!
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
            Play Again
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}