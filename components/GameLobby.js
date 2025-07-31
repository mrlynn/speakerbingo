import React from 'react'
import { Box, Typography, TextField, Button, Paper } from '@mui/material'
import { sunriseTheme } from '../lib/theme'

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
      maxWidth: 450,
      mx: 'auto',
      position: 'relative'
    }}>
      {/* Title with sunrise effect */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 4,
        position: 'relative'
      }}>
        <Typography 
          variant={isMobile ? "h3" : "h1"} 
          sx={{ 
            fontFamily: '"Playfair Display", serif',
            fontWeight: 700,
            background: sunriseTheme.gradients.sunrise,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            textShadow: 'none',
            mb: 1,
            fontSize: isMobile ? '2.2rem' : '3.5rem',
            lineHeight: 1.2,
          }}
        >
          Sunrise Semester
        </Typography>
        <Typography 
          variant={isMobile ? "h4" : "h2"} 
          sx={{ 
            fontFamily: '"Playfair Display", serif',
            fontWeight: 600,
            color: sunriseTheme.colors.sunrise.dawn,
            fontSize: isMobile ? '1.5rem' : '2.5rem',
            textShadow: `0 2px 10px ${sunriseTheme.colors.sunrise.golden}30`,
          }}
        >
          BINGO
        </Typography>
        
        {/* Decorative sunrise elements */}
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '120%',
          height: '120%',
          background: `radial-gradient(circle, ${sunriseTheme.colors.accent.gold}15 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: -1,
          animation: 'pulse 3s ease-in-out infinite'
        }} />
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          p: isMobile ? 3 : 4, 
          width: '100%',
          background: sunriseTheme.gradients.card,
          borderRadius: 3,
          border: `2px solid ${sunriseTheme.colors.sunrise.golden}40`,
          boxShadow: sunriseTheme.shadows.soft,
          backdropFilter: 'blur(10px)',
          '&:hover': {
            boxShadow: sunriseTheme.shadows.medium,
          }
        }}
      >
        <TextField
          fullWidth
          label="Your name"
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          variant="outlined"
          size={isMobile ? "small" : "medium"}
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '&:hover fieldset': {
                borderColor: sunriseTheme.colors.sunrise.morning,
              },
              '&.Mui-focused fieldset': {
                borderColor: sunriseTheme.colors.sunrise.dawn,
                borderWidth: '2px',
              }
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: sunriseTheme.colors.sunrise.dawn,
            }
          }}
        />

        {!mode && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => setMode('create')}
              disabled={!playerName}
              sx={{ 
                background: sunriseTheme.gradients.button,
                color: 'white',
                fontWeight: 600,
                py: 1.5,
                borderRadius: 2,
                boxShadow: sunriseTheme.shadows.soft,
                '&:hover': { 
                  background: `linear-gradient(135deg, ${sunriseTheme.colors.sunrise.dawn} 0%, ${sunriseTheme.colors.sunrise.horizon} 100%)`,
                  boxShadow: sunriseTheme.shadows.medium,
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  background: sunriseTheme.colors.warm.sand,
                  color: sunriseTheme.colors.text.light
                }
              }}
            >
              🌅 Create New Game
            </Button>
            
            <Typography sx={{ 
              textAlign: 'center', 
              my: 1,
              color: sunriseTheme.colors.text.secondary,
              fontWeight: 500,
              position: 'relative',
              '&::before, &::after': {
                content: '""',
                position: 'absolute',
                top: '50%',
                width: '30%',
                height: '1px',
                background: `linear-gradient(90deg, transparent, ${sunriseTheme.colors.sunrise.golden}60, transparent)`
              },
              '&::before': { left: 0 },
              '&::after': { right: 0 }
            }}>
              OR
            </Typography>
            
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => setMode('join')}
              disabled={!playerName}
              sx={{ 
                borderColor: sunriseTheme.colors.sunrise.morning,
                color: sunriseTheme.colors.sunrise.dawn,
                fontWeight: 600,
                py: 1.5,
                borderRadius: 2,
                borderWidth: '2px',
                '&:hover': { 
                  borderColor: sunriseTheme.colors.sunrise.dawn,
                  backgroundColor: `${sunriseTheme.colors.sunrise.dawn}10`,
                  borderWidth: '2px',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  borderColor: sunriseTheme.colors.warm.sand,
                  color: sunriseTheme.colors.text.light
                }
              }}
            >
              🤝 Join Existing Game
            </Button>
          </Box>
        )}

        {mode === 'create' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ 
              textAlign: 'center',
              p: 3,
              borderRadius: 2,
              background: `${sunriseTheme.colors.sunrise.golden}15`,
              border: `1px solid ${sunriseTheme.colors.sunrise.golden}40`
            }}>
              <Typography variant="h6" sx={{ 
                color: sunriseTheme.colors.text.primary,
                fontWeight: 600,
                mb: 1
              }}>
                ✨ Ready to start your sunrise adventure?
              </Typography>
              <Typography variant="body2" sx={{ 
                color: sunriseTheme.colors.text.secondary
              }}>
                You'll get a unique room code to share with friends!
              </Typography>
            </Box>
            
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={onCreateGame}
              sx={{ 
                background: sunriseTheme.gradients.button,
                color: 'white',
                fontWeight: 600,
                py: 1.5,
                borderRadius: 2,
                boxShadow: sunriseTheme.shadows.soft,
                '&:hover': { 
                  background: `linear-gradient(135deg, ${sunriseTheme.colors.sunrise.dawn} 0%, ${sunriseTheme.colors.sunrise.horizon} 100%)`,
                  boxShadow: sunriseTheme.shadows.medium,
                  transform: 'translateY(-1px)'
                }
              }}
            >
              🚀 Start Game
            </Button>
            
            <Button
              fullWidth
              variant="text"
              onClick={() => setMode(null)}
              sx={{ 
                color: sunriseTheme.colors.text.secondary,
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: `${sunriseTheme.colors.sunrise.golden}20`
                }
              }}
            >
              ← Back
            </Button>
          </Box>
        )}

        {mode === 'join' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth
              label="Room Code"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              variant="outlined"
              placeholder="Enter 6-digit code"
              inputProps={{ maxLength: 6 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  '&:hover fieldset': {
                    borderColor: sunriseTheme.colors.sunrise.morning,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: sunriseTheme.colors.sunrise.dawn,
                    borderWidth: '2px',
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: sunriseTheme.colors.sunrise.dawn,
                }
              }}
            />
            
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={onJoinGame}
              disabled={roomCode.length !== 6}
              sx={{ 
                background: sunriseTheme.gradients.button,
                color: 'white',
                fontWeight: 600,
                py: 1.5,
                borderRadius: 2,
                boxShadow: sunriseTheme.shadows.soft,
                '&:hover': { 
                  background: `linear-gradient(135deg, ${sunriseTheme.colors.sunrise.dawn} 0%, ${sunriseTheme.colors.sunrise.horizon} 100%)`,
                  boxShadow: sunriseTheme.shadows.medium,
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  background: sunriseTheme.colors.warm.sand,
                  color: sunriseTheme.colors.text.light
                }
              }}
            >
              🎯 Join Game
            </Button>
            
            <Button
              fullWidth
              variant="text"
              onClick={() => setMode(null)}
              sx={{ 
                color: sunriseTheme.colors.text.secondary,
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: `${sunriseTheme.colors.sunrise.golden}20`
                }
              }}
            >
              ← Back
            </Button>
          </Box>
        )}
      </Paper>
      
      {/* Add subtle animation keyframes */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
    </Box>
  )
}