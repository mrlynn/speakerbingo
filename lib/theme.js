// Sunrise Theme Color Palette
export const sunriseTheme = {
  colors: {
    // Primary sunrise colors
    sunrise: {
      dawn: '#FF6B35',      // Deep orange
      morning: '#F7931E',   // Bright orange  
      golden: '#FFD23F',    // Golden yellow
      horizon: '#FF9500',   // Warm orange
      sky: '#FFF3E0',       // Light cream
    },
    
    // Secondary colors
    warm: {
      coral: '#FF8A80',     // Soft coral
      peach: '#FFAB91',     // Warm peach
      cream: '#FFF8E1',     // Cream white
      sand: '#FFECB3',      // Sandy beige
    },
    
    // Accent colors
    accent: {
      gold: '#FFC107',      // Bright gold
      amber: '#FF8F00',     // Deep amber
      rose: '#FF5722',      // Rose orange
      light: '#FFFDE7',     // Very light cream
    },
    
    // Text colors
    text: {
      primary: '#3E2723',   // Dark brown
      secondary: '#5D4037', // Medium brown
      light: '#8D6E63',     // Light brown
      white: '#FFFFFF',
      dark: '#2E1A0A',      // Very dark brown
    },
    
    // Status colors
    status: {
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#FF5722',
      info: '#FF6B35',
    }
  },
  
  gradients: {
    sunrise: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFD23F 100%)',
    morning: 'linear-gradient(180deg, #FFD23F 0%, #FF9500 50%, #FF6B35 100%)',
    dawn: 'linear-gradient(45deg, #FF8A80 0%, #FFAB91 50%, #FFF8E1 100%)',
    sky: 'linear-gradient(180deg, #FFF3E0 0%, #FFECB3 50%, #FFD23F 100%)',
    card: 'linear-gradient(145deg, #FFFFFF 0%, #FFF8E1 100%)',
    button: 'linear-gradient(135deg, #FF6B35 0%, #FF9500 100%)',
    header: 'linear-gradient(90deg, #FF6B35 0%, #F7931E 50%, #FFD23F 100%)',
  },
  
  shadows: {
    soft: '0 4px 20px rgba(255, 107, 53, 0.15)',
    medium: '0 8px 30px rgba(255, 107, 53, 0.2)',
    strong: '0 12px 40px rgba(255, 107, 53, 0.25)',
    glow: '0 0 20px rgba(255, 210, 63, 0.3)',
  }
}