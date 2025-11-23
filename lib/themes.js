// Theme configurations for holiday and seasonal themes
// Each theme defines colors that map to CSS custom properties

export const themes = {
  sunrise: {
    id: 'sunrise',
    name: 'Sunrise',
    emoji: '🌅',
    backgroundImage: null, // No background image for default theme
    colors: {
      rust: '#8B4513',
      rustDark: '#A0522D',
      navy: '#2C3E50',
      teal: '#4DD0E1',
      gold: '#FFD180',
      cream: '#FFF8E1',
      peach: '#FFE0B2',
      coral: '#FFAB91',
      orange: '#FF7043',
      sky: '#87CEEB',
      water: '#5F9EA0',
    },
    gradients: {
      sunrise: 'linear-gradient(135deg, #FFE0B2 0%, #FFAB91 25%, #FF7043 50%, #FFD180 75%, #FFF8E1 100%)',
      sky: 'linear-gradient(180deg, #87CEEB 0%, #FFFFFF 100%)',
      water: 'linear-gradient(180deg, #5F9EA0 0%, #4DD0E1 100%)',
      cream: 'linear-gradient(135deg, #FFF8E1 0%, #FFE0B2 100%)',
      selected: 'linear-gradient(135deg, #4DD0E1 0%, #FFD180 100%)',
      fab: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
    },
  },

  christmas: {
    id: 'christmas',
    name: 'Christmas',
    emoji: '🎄',
    backgroundImage: '/themes/christmas.png', // Add image when available
    colors: {
      rust: '#165B33',
      rustDark: '#0D3B1E',
      navy: '#1A1A2E',
      teal: '#BB2528',
      gold: '#F8B229',
      cream: '#FFFDF6',
      peach: '#E8D5B7',
      coral: '#BB2528',
      orange: '#165B33',
      sky: '#1A1A2E',
      water: '#2D4A3E',
    },
    gradients: {
      sunrise: 'linear-gradient(135deg, #165B33 0%, #BB2528 25%, #F8B229 50%, #BB2528 75%, #165B33 100%)',
      sky: 'linear-gradient(180deg, #1A1A2E 0%, #2D4A3E 100%)',
      water: 'linear-gradient(180deg, #165B33 0%, #2D4A3E 100%)',
      cream: 'linear-gradient(135deg, #FFFDF6 0%, #E8D5B7 100%)',
      selected: 'linear-gradient(135deg, #BB2528 0%, #F8B229 100%)',
      fab: 'linear-gradient(135deg, #BB2528 0%, #165B33 100%)',
    },
  },

  halloween: {
    id: 'halloween',
    name: 'Halloween',
    emoji: '🎃',
    backgroundImage: '/themes/halloween.png', // Add image when available
    colors: {
      rust: '#FF6600',
      rustDark: '#CC5200',
      navy: '#1A1A2E',
      teal: '#8B008B',
      gold: '#FFD700',
      cream: '#2D2D44',
      peach: '#4A3F55',
      coral: '#FF6600',
      orange: '#FF6600',
      sky: '#0D0D1A',
      water: '#1A1A2E',
    },
    gradients: {
      sunrise: 'linear-gradient(135deg, #FF6600 0%, #8B008B 25%, #FFD700 50%, #8B008B 75%, #FF6600 100%)',
      sky: 'linear-gradient(180deg, #0D0D1A 0%, #1A1A2E 100%)',
      water: 'linear-gradient(180deg, #1A1A2E 0%, #2D2D44 100%)',
      cream: 'linear-gradient(135deg, #2D2D44 0%, #4A3F55 100%)',
      selected: 'linear-gradient(135deg, #8B008B 0%, #FFD700 100%)',
      fab: 'linear-gradient(135deg, #FF6600 0%, #8B008B 100%)',
    },
  },

  valentines: {
    id: 'valentines',
    name: "Valentine's",
    emoji: '💕',
    backgroundImage: '/themes/valentines.png', // Add image when available
    colors: {
      rust: '#C41E3A',
      rustDark: '#8B0000',
      navy: '#4A0E2B',
      teal: '#FF69B4',
      gold: '#FFB6C1',
      cream: '#FFF0F5',
      peach: '#FFE4E9',
      coral: '#FF6B8A',
      orange: '#E91E63',
      sky: '#FFE4EC',
      water: '#FFCCD5',
    },
    gradients: {
      sunrise: 'linear-gradient(135deg, #FFE4E9 0%, #FF69B4 25%, #C41E3A 50%, #FF69B4 75%, #FFE4E9 100%)',
      sky: 'linear-gradient(180deg, #FFE4EC 0%, #FFFFFF 100%)',
      water: 'linear-gradient(180deg, #FFCCD5 0%, #FF69B4 100%)',
      cream: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4E9 100%)',
      selected: 'linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%)',
      fab: 'linear-gradient(135deg, #C41E3A 0%, #FF69B4 100%)',
    },
  },

  stpatricks: {
    id: 'stpatricks',
    name: "St. Patrick's",
    emoji: '🍀',
    backgroundImage: '/themes/stpatricks.png', // Add image when available
    colors: {
      rust: '#009A44',
      rustDark: '#006B2E',
      navy: '#1E3A2F',
      teal: '#50C878',
      gold: '#FFD700',
      cream: '#F0FFF0',
      peach: '#E8F5E9',
      coral: '#90EE90',
      orange: '#228B22',
      sky: '#E8F5E9',
      water: '#A8E6CF',
    },
    gradients: {
      sunrise: 'linear-gradient(135deg, #E8F5E9 0%, #50C878 25%, #009A44 50%, #FFD700 75%, #E8F5E9 100%)',
      sky: 'linear-gradient(180deg, #E8F5E9 0%, #FFFFFF 100%)',
      water: 'linear-gradient(180deg, #A8E6CF 0%, #50C878 100%)',
      cream: 'linear-gradient(135deg, #F0FFF0 0%, #E8F5E9 100%)',
      selected: 'linear-gradient(135deg, #50C878 0%, #FFD700 100%)',
      fab: 'linear-gradient(135deg, #009A44 0%, #50C878 100%)',
    },
  },

  july4th: {
    id: 'july4th',
    name: '4th of July',
    emoji: '🇺🇸',
    backgroundImage: '/themes/july4th.png', // Add image when available
    colors: {
      rust: '#002868',
      rustDark: '#001A44',
      navy: '#002868',
      teal: '#BF0A30',
      gold: '#FFFFFF',
      cream: '#F8F9FA',
      peach: '#E8E8E8',
      coral: '#BF0A30',
      orange: '#002868',
      sky: '#E8F4FF',
      water: '#B8D4E8',
    },
    gradients: {
      sunrise: 'linear-gradient(135deg, #BF0A30 0%, #FFFFFF 25%, #002868 50%, #FFFFFF 75%, #BF0A30 100%)',
      sky: 'linear-gradient(180deg, #E8F4FF 0%, #FFFFFF 100%)',
      water: 'linear-gradient(180deg, #B8D4E8 0%, #002868 100%)',
      cream: 'linear-gradient(135deg, #F8F9FA 0%, #E8E8E8 100%)',
      selected: 'linear-gradient(135deg, #BF0A30 0%, #002868 100%)',
      fab: 'linear-gradient(135deg, #BF0A30 0%, #002868 100%)',
    },
  },

  thanksgiving: {
    id: 'thanksgiving',
    name: 'Thanksgiving',
    emoji: '🦃',
    backgroundImage: '/themes/thanksgiving.png',
    colors: {
      rust: '#8B4513',
      rustDark: '#654321',
      navy: '#3D2914',
      teal: '#CD853F',
      gold: '#DAA520',
      cream: '#FFF8DC',
      peach: '#FAEBD7',
      coral: '#D2691E',
      orange: '#FF8C00',
      sky: '#F5DEB3',
      water: '#DEB887',
    },
    gradients: {
      sunrise: 'linear-gradient(135deg, #FAEBD7 0%, #D2691E 25%, #8B4513 50%, #DAA520 75%, #FFF8DC 100%)',
      sky: 'linear-gradient(180deg, #F5DEB3 0%, #FFFFFF 100%)',
      water: 'linear-gradient(180deg, #DEB887 0%, #CD853F 100%)',
      cream: 'linear-gradient(135deg, #FFF8DC 0%, #FAEBD7 100%)',
      selected: 'linear-gradient(135deg, #CD853F 0%, #DAA520 100%)',
      fab: 'linear-gradient(135deg, #D2691E 0%, #FF8C00 100%)',
    },
  },

  easter: {
    id: 'easter',
    name: 'Easter',
    emoji: '🐰',
    backgroundImage: '/themes/easter.png', // Add image when available
    colors: {
      rust: '#9370DB',
      rustDark: '#7B68EE',
      navy: '#4B0082',
      teal: '#FFB6C1',
      gold: '#98FB98',
      cream: '#FFF8F0',
      peach: '#FFFACD',
      coral: '#DDA0DD',
      orange: '#87CEEB',
      sky: '#E6E6FA',
      water: '#F0E6FF',
    },
    gradients: {
      sunrise: 'linear-gradient(135deg, #FFFACD 0%, #FFB6C1 25%, #9370DB 50%, #98FB98 75%, #87CEEB 100%)',
      sky: 'linear-gradient(180deg, #E6E6FA 0%, #FFFFFF 100%)',
      water: 'linear-gradient(180deg, #F0E6FF 0%, #DDA0DD 100%)',
      cream: 'linear-gradient(135deg, #FFF8F0 0%, #FFFACD 100%)',
      selected: 'linear-gradient(135deg, #FFB6C1 0%, #98FB98 100%)',
      fab: 'linear-gradient(135deg, #9370DB 0%, #FFB6C1 100%)',
    },
  },

  dark: {
    id: 'dark',
    name: 'Dark Mode',
    emoji: '🌙',
    backgroundImage: null, // No background image for dark mode
    colors: {
      rust: '#E0E0E0',
      rustDark: '#BDBDBD',
      navy: '#FFFFFF',
      teal: '#64B5F6',
      gold: '#FFD54F',
      cream: '#1E1E1E',
      peach: '#2D2D2D',
      coral: '#FF8A65',
      orange: '#FFB74D',
      sky: '#121212',
      water: '#1E1E1E',
    },
    gradients: {
      sunrise: 'linear-gradient(135deg, #2D2D2D 0%, #3D3D3D 25%, #4D4D4D 50%, #3D3D3D 75%, #2D2D2D 100%)',
      sky: 'linear-gradient(180deg, #121212 0%, #1E1E1E 100%)',
      water: 'linear-gradient(180deg, #1E1E1E 0%, #2D2D2D 100%)',
      cream: 'linear-gradient(135deg, #1E1E1E 0%, #2D2D2D 100%)',
      selected: 'linear-gradient(135deg, #64B5F6 0%, #FFD54F 100%)',
      fab: 'linear-gradient(135deg, #64B5F6 0%, #FFB74D 100%)',
    },
  },
};

// Helper to get theme by current date (auto-theme)
export function getSeasonalTheme() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // Valentine's Day: Feb 1-14
  if (month === 2 && day <= 14) return 'valentines';

  // St. Patrick's Day: Mar 10-17
  if (month === 3 && day >= 10 && day <= 17) return 'stpatricks';

  // Easter: approximate late March / April (simplified)
  if ((month === 3 && day >= 25) || (month === 4 && day <= 15)) return 'easter';

  // 4th of July: Jul 1-4
  if (month === 7 && day <= 4) return 'july4th';

  // Halloween: Oct 15-31
  if (month === 10 && day >= 15) return 'halloween';

  // Thanksgiving: Nov 20-30
  if (month === 11 && day >= 20) return 'thanksgiving';

  // Christmas: Dec 1-25
  if (month === 12 && day <= 30) return 'christmas';

  // Default
  return 'sunrise';
}

export const themeList = Object.values(themes);
