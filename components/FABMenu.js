import React, { useState } from 'react'
import ThemePicker from './ThemePicker'
import { useTheme } from '../lib/ThemeContext'

export default function FABMenu({ 
  isMobile, 
  onBackToMenu,
  onShareGame,
  onViewPlayers,
  onLeaderboard,
  onStats,
  onInstructions,
  onAbout,
  onStopGame,
  onLogout,
  showShareAndPlayers = false,
  showStopGame = false,
  showStats = false
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const { theme } = useTheme()

  const menuItems = [
    { 
      icon: '🏠', 
      label: 'Back to Menu', 
      action: onBackToMenu,
      show: true,
      priority: 1
    },
    { 
      icon: '🛑', 
      label: 'Stop Game', 
      action: onStopGame,
      show: showStopGame,
      priority: 2,
      destructive: true
    },
    { 
      icon: '📤', 
      label: 'Share Game', 
      action: onShareGame,
      show: showShareAndPlayers,
      priority: 3
    },
    { 
      icon: '👥', 
      label: 'View Players', 
      action: onViewPlayers,
      show: showShareAndPlayers,
      priority: 4
    },
    { 
      icon: '🏆', 
      label: 'Leaderboard', 
      action: onLeaderboard,
      show: true,
      priority: 5
    },
    { 
      icon: '📊', 
      label: 'Stats', 
      action: onStats,
      show: showStats,
      priority: 6
    },
    { 
      icon: '📖', 
      label: 'How to Play', 
      action: onInstructions,
      show: true,
      priority: 7
    },
    {
      icon: 'ℹ️',
      label: 'About',
      action: onAbout,
      show: true,
      priority: 8
    },
    {
      icon: theme?.emoji || '🎨',
      label: 'Theme',
      action: () => setShowThemePicker(true),
      show: true,
      priority: 9
    },
    {
      icon: '🚪',
      label: 'Logout',
      action: onLogout,
      show: true,
      priority: 10,
      destructive: true
    }
  ]

  const visibleItems = menuItems
    .filter(item => item.show)
    .sort((a, b) => a.priority - b.priority)

  const handleItemClick = (action) => {
    setIsExpanded(false)
    if (action) action()
  }

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <>
      <ThemePicker
        isOpen={showThemePicker}
        onClose={() => setShowThemePicker(false)}
        isMobile={isMobile}
      />
    <div className="fab-menu">
      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fab-backdrop" 
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      {/* Menu Items */}
      {isExpanded && (
        <div className="fab-items">
          {visibleItems.map((item, index) => (
            <div
              key={item.label}
              className={`fab-item ${item.destructive ? 'destructive' : ''}`}
              onClick={() => handleItemClick(item.action)}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              <div className="fab-item-button">
                <span className="fab-item-icon">{item.icon}</span>
              </div>
              <span className="fab-item-label">{item.label}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Main FAB Button */}
      <button
        className={`fab-main ${isExpanded ? 'expanded' : ''}`}
        onClick={handleToggle}
        title={isExpanded ? 'Close menu' : 'Open menu'}
      >
        <span className="fab-main-icon">
          {isExpanded ? '✕' : '☰'}
        </span>
      </button>

      <style jsx>{`
        .fab-menu {
          position: fixed;
          bottom: ${isMobile ? '20px' : '32px'};
          right: ${isMobile ? '20px' : '32px'};
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        
        .fab-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          z-index: -1;
          animation: fadeIn 0.2s ease-out;
        }
        
        .fab-main {
          width: ${isMobile ? '56px' : '64px'};
          height: ${isMobile ? '56px' : '64px'};
          border-radius: 50%;
          background: var(--gradient-fab, linear-gradient(135deg, #FF6B35 0%, #F7931E 100%));
          border: none;
          box-shadow: 
            0 6px 20px rgba(255, 107, 53, 0.4),
            0 2px 8px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }
        
        .fab-main:hover {
          transform: scale(1.1);
          box-shadow: 
            0 8px 25px rgba(255, 107, 53, 0.5),
            0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .fab-main.expanded {
          transform: rotate(45deg);
          background: var(--gradient-fab, linear-gradient(135deg, #F7931E 0%, #FF6B35 100%));
        }
        
        .fab-main-icon {
          font-size: ${isMobile ? '20px' : '24px'};
          color: white;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .fab-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
          align-items: flex-end;
        }
        
        .fab-item {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          animation: slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          opacity: 0;
          transform: translateX(20px);
        }
        
        .fab-item-button {
          width: ${isMobile ? '48px' : '52px'};
          height: ${isMobile ? '48px' : '52px'};
          border-radius: 50%;
          background: rgba(255, 248, 225, 0.95);
          border: 2px solid rgba(255, 209, 128, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }
        
        .fab-item:hover .fab-item-button {
          background: rgba(255, 255, 255, 1);
          border-color: var(--sunrise-gold);
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(255, 209, 128, 0.3);
        }
        
        .fab-item.destructive .fab-item-button {
          background: rgba(255, 107, 53, 0.1);
          border-color: rgba(255, 107, 53, 0.4);
        }
        
        .fab-item.destructive:hover .fab-item-button {
          background: rgba(255, 107, 53, 0.2);
          border-color: #FF6B35;
        }
        
        .fab-item-icon {
          font-size: ${isMobile ? '18px' : '20px'};
        }
        
        .fab-item-label {
          background: rgba(255, 248, 225, 0.95);
          border: 1px solid rgba(255, 209, 128, 0.6);
          border-radius: 20px;
          padding: 8px 16px;
          font-size: ${isMobile ? '13px' : '14px'};
          font-weight: 600;
          color: var(--sunrise-navy);
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .fab-item:hover .fab-item-label {
          background: rgba(255, 255, 255, 1);
          border-color: var(--sunrise-gold);
          color: var(--sunrise-rust);
        }
        
        .fab-item.destructive .fab-item-label {
          background: rgba(255, 107, 53, 0.1);
          border-color: rgba(255, 107, 53, 0.4);
          color: #FF6B35;
        }
        
        .fab-item.destructive:hover .fab-item-label {
          background: rgba(255, 107, 53, 0.2);
          border-color: #FF6B35;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInRight {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @media (max-width: 768px) {
          .fab-menu {
            bottom: 16px;
            right: 16px;
          }
          
          .fab-item {
            gap: 8px;
          }
          
          .fab-item-label {
            font-size: 12px;
            padding: 6px 12px;
          }
        }
      `}</style>
    </div>
    </>
  )
}