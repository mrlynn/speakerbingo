import React, { useState, useEffect } from 'react'
import { getCurrentBannerMessage } from '../lib/dailyChallenges'

export default function MessageBanner({ onChallengeClick, onAdClick, isMobile }) {
  const [currentMessage, setCurrentMessage] = useState(null)
  const [isVisible, setIsVisible] = useState(true)
  
  useEffect(() => {
    // Get initial message
    setCurrentMessage(getCurrentBannerMessage())
    
    // Update message every 5 minutes
    const interval = setInterval(() => {
      setCurrentMessage(getCurrentBannerMessage())
    }, 5 * 60 * 1000) // 5 minutes
    
    return () => clearInterval(interval)
  }, [])
  
  if (!currentMessage || !isVisible) return null
  
  const handleClick = () => {
    if (currentMessage.type === 'challenge' && onChallengeClick) {
      onChallengeClick(currentMessage.challenge)
    } else if (currentMessage.type === 'advertisement' && onAdClick) {
      onAdClick(currentMessage.ad)
    }
  }
  
  const handleClose = () => {
    setIsVisible(false)
    // Show again after 15 minutes
    setTimeout(() => setIsVisible(true), 15 * 60 * 1000)
  }
  
  return (
    <div className="message-banner">
      <div className="banner-content" onClick={handleClick}>
        <div className="banner-type-indicator">
          {currentMessage.type === 'challenge' ? '🎯' : '💬'}
        </div>
        
        <div className="scrolling-text">
          <span className="message-text">{currentMessage.message}</span>
        </div>
        
        {currentMessage.type === 'challenge' && (
          <div className="banner-actions">
            <span className="challenge-badge">Daily Challenge</span>
          </div>
        )}
        
        {currentMessage.type === 'advertisement' && currentMessage.ad.cta && (
          <div className="banner-actions">
            <span className="cta-button">{currentMessage.ad.cta}</span>
          </div>
        )}
      </div>
      
      <button className="close-banner" onClick={handleClose} title="Hide banner">
        ✕
      </button>
      
      <style jsx>{`
        .message-banner {
          width: 100%;
          max-width: ${isMobile ? '100%' : '600px'};
          margin: 0 auto 16px auto;
          background: linear-gradient(135deg, #9B59B6 0%, #E74C3C 50%, #F39C12 100%);
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-radius: 12px;
          padding: 0;
          box-shadow: 
            0 4px 16px rgba(155, 89, 182, 0.3),
            0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
          animation: bannerGlow 6s ease-in-out infinite;
        }
        
        .message-banner:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 8px 25px rgba(155, 89, 182, 0.5),
            0 4px 12px rgba(0, 0, 0, 0.15);
          animation-play-state: paused;
        }
        
        .banner-content {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 40px 12px 16px;
          min-height: 48px;
        }
        
        .banner-type-indicator {
          font-size: 20px;
          flex-shrink: 0;
          opacity: 0.9;
        }
        
        .scrolling-text {
          flex: 1;
          overflow: hidden;
          white-space: nowrap;
          position: relative;
        }
        
        .message-text {
          display: inline-block;
          color: white;
          font-weight: 600;
          font-size: ${isMobile ? '14px' : '16px'};
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
          animation: ${currentMessage.message.length > 80 ? 'scroll' : 'none'} 20s linear infinite;
          padding-right: 50px;
        }
        
        .banner-actions {
          flex-shrink: 0;
        }
        
        .challenge-badge {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .cta-button {
          background: white;
          color: #FF6B35;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
        }
        
        .cta-button:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        
        .close-banner {
          position: absolute;
          top: 50%;
          right: 8px;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .close-banner:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-50%) scale(1.1);
        }
        
        @keyframes scroll {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        /* Pause animation on hover */
        .message-banner:hover .message-text {
          animation-play-state: paused;
        }
        
        @keyframes bannerGlow {
          0%, 100% { 
            box-shadow: 
              0 4px 16px rgba(155, 89, 182, 0.3),
              0 2px 8px rgba(0, 0, 0, 0.1);
            border-color: rgba(255, 255, 255, 0.4);
          }
          33% { 
            box-shadow: 
              0 6px 20px rgba(231, 76, 60, 0.4),
              0 3px 10px rgba(0, 0, 0, 0.12);
            border-color: rgba(231, 76, 60, 0.5);
          }
          66% { 
            box-shadow: 
              0 6px 20px rgba(243, 156, 18, 0.4),
              0 3px 10px rgba(0, 0, 0, 0.12);
            border-color: rgba(243, 156, 18, 0.5);
          }
        }
      `}</style>
    </div>
  )
}