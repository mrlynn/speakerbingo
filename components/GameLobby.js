import React from 'react'
import { Box, Typography, TextField, Button, Paper, Chip } from '@mui/material'

export default function GameLobby({ 
  mode, 
  setMode, 
  playerName, 
  setPlayerName, 
  roomCode, 
  setRoomCode,
  onCreateGame,
  onJoinGame,
  isMobile 
}) {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      width: '100%',
      maxWidth: 400,
      mx: 'auto'
    }}>
      <Typography 
        variant={isMobile ? "h4" : "h2"} 
        gutterBottom 
        sx={{ 
          fontWeight: 'bold',
          color: '#d32f2f',
          textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
          mb: 4,
          fontSize: isMobile ? '1.75rem' : '3.75rem',
          textAlign: 'center'
        }}
      >
        Sunrise Semester Bingo
      </Typography>

      <Paper elevation={3} sx={{ p: 3, width: '100%' }}>
        <TextField
          fullWidth
          label="Your name"
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          variant="outlined"
          size={isMobile ? "small" : "medium"}
          sx={{ mb: 3 }}
        />

        {!mode && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => setMode('create')}
              disabled={!playerName}
              sx={{ 
                backgroundColor: '#d32f2f',
                '&:hover': { backgroundColor: '#b71c1c' }
              }}
            >
              Create New Game
            </Button>
            <Typography sx={{ textAlign: 'center', my: 1 }}>OR</Typography>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => setMode('join')}
              disabled={!playerName}
              sx={{ 
                borderColor: '#d32f2f',
                color: '#d32f2f',
                '&:hover': { 
                  borderColor: '#b71c1c',
                  backgroundColor: 'rgba(211, 47, 47, 0.04)'
                }
              }}
            >
              Join Existing Game
            </Button>
          </Box>
        )}

        {mode === 'create' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body1" sx={{ textAlign: 'center' }}>
              Ready to create a new game?
            </Typography>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={onCreateGame}
              sx={{ 
                backgroundColor: '#d32f2f',
                '&:hover': { backgroundColor: '#b71c1c' }
              }}
            >
              Start Game
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => setMode(null)}
              sx={{ color: '#666' }}
            >
              Back
            </Button>
          </Box>
        )}

        {mode === 'join' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Room Code"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              variant="outlined"
              placeholder="Enter 6-digit code"
              inputProps={{ maxLength: 6 }}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={onJoinGame}
              disabled={roomCode.length !== 6}
              sx={{ 
                backgroundColor: '#d32f2f',
                '&:hover': { backgroundColor: '#b71c1c' }
              }}
            >
              Join Game
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => setMode(null)}
              sx={{ color: '#666' }}
            >
              Back
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  )
}