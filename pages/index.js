import React, { useState, useEffect } from 'react'
import { Box, Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Paper } from '@mui/material'

const ALL_PHRASES = [
  'Pittsburgh or Tuesday', 'Who knew?', "I'm an alcoholic", 'Shine Bright', 'Anyways', 'Zoomaholic', 'You know',
  'Purposeful Life', 'Darkness', 'Prostitutes', 'Husband in Prison', "Let's have ourselves a ___day.",
  'I have more time than ____.', 'Bill W. was a philanderer', 'I dunno.', "y'know", 'Pre-teen Diabetic',
  'Um', 'Like', 'At the end of the day', 'Just saying', 'Right?', "If I'm being honest", 'For what it’s worth',
  'That being said', 'You get the picture', 'Honestly', 'Kind of', 'Sort of', 'So', 'Basically', 'Moving on', 'Gonna',
  'I’m not gonna lie', 'To be fair'
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

  return (
    <Box sx={{ 
      p: 4, 
      textAlign: 'center',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <Typography variant="h2" gutterBottom sx={{ 
        fontWeight: 'bold',
        color: '#d32f2f',
        textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
        mb: 3
      }}>
        Sunrise Semester Bingo
      </Typography>
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Your name"
          value={player}
          onChange={e => setPlayer(e.target.value)}
          variant="outlined"
          sx={{ backgroundColor: 'white' }}
        />
      </Box>
      {player && (
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'medium' }}>
          Player: {player}
        </Typography>
      )}
      
      {/* Bingo Card Container */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={10} sx={{ 
          display: 'inline-block',
          backgroundColor: 'white',
          p: 3,
          borderRadius: 2
        }}>
          {/* BINGO Header */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 110px)',
            gap: 0,
            mb: 0
          }}>
            {['B','I','N','G','O'].map((letter) => (
              <Box key={letter} sx={{ 
                height: 70,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#d32f2f',
                color: 'white',
                fontSize: '3rem',
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
            gridTemplateColumns: 'repeat(5, 110px)',
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
                    height: 110,
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
                    '&:hover': {
                      backgroundColor: 
                        r === 2 && c === 2 ? '#ffd700' : 
                        selected[r][c] ? '#ff4444' : '#f9f9f9',
                      transform: r === 2 && c === 2 ? 'none' : 'scale(0.98)'
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
                      fontSize: '4rem',
                      color: '#d32f2f',
                      opacity: 0.2,
                      transform: 'rotate(15deg)'
                    }}>
                      ★
                    </Box>
                  )}
                  
                  <Typography sx={{ 
                    fontWeight: r === 2 && c === 2 ? 'bold' : 'medium',
                    fontSize: r === 2 && c === 2 ? '1.8rem' : '0.8rem',
                    lineHeight: 1.2,
                    p: 1,
                    textAlign: 'center',
                    color: 
                      r === 2 && c === 2 ? '#d32f2f' : 
                      selected[r][c] ? 'white' : 'black',
                    zIndex: 2,
                    position: 'relative'
                  }}>
                    {phrase}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </Paper>
      </Box>
      <Dialog open={bingo} onClose={() => setBingo(false)}>
        <DialogTitle>🎉 Bingo! 🎉</DialogTitle>
        <DialogContent>
          <Typography>
            Congratulations {player || 'Player'}, you’ve got a Bingo!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBingo(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
