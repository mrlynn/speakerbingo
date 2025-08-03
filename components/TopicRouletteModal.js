import React from 'react'
import TopicRoulette from './TopicRoulette'

export default function TopicRouletteModal({ isOpen, onClose, isMobile }) {
  if (!isOpen) return null

  const handleTopicSelected = (topic) => {
    // Could add analytics or other side effects here
    console.log('Topic selected:', topic)
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div 
        className="dialog topic-roulette-modal sunrise-dialog" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="dialog-title sunrise-dialog-title">
            🎡 Topic Jar Roulette
          </h2>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        
        <div className="dialog-content">
          <TopicRoulette 
            onTopicSelected={handleTopicSelected}
            isMobile={isMobile}
          />
        </div>
      </div>

      <style jsx>{`
        .dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(4px);
          animation: overlayFadeIn 0.3s ease-out;
        }
        
        .dialog {
          background: 
            radial-gradient(ellipse at 20% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(255, 248, 225, 0.4) 0%, transparent 60%),
            rgba(255, 248, 225, 0.98);
          border-radius: 24px;
          border: 3px solid var(--sunrise-gold);
          box-shadow: 
            0 12px 40px rgba(139, 69, 19, 0.15),
            0 4px 16px rgba(255, 165, 0, 0.1);
          max-width: ${isMobile ? '95vw' : '800px'};
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          backdrop-filter: blur(10px);
          animation: modalSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 24px 0;
          position: sticky;
          top: 0;
          background: inherit;
          z-index: 10;
        }
        
        .dialog-title {
          font-size: ${isMobile ? '2rem' : '2.5rem'};
          font-family: "Inter", sans-serif;
          font-weight: 900;
          color: var(--sunrise-rust);
          margin: 0;
          text-shadow: 
            3px 3px 6px rgba(255, 255, 255, 0.6),
            -1px -1px 3px rgba(139, 69, 19, 0.3);
          letter-spacing: -0.01em;
          flex: 1;
        }
        
        .close-button {
          background: rgba(255, 255, 255, 0.9);
          border: 2px solid rgba(255, 107, 53, 0.3);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 20px;
          font-weight: 700;
          color: var(--sunrise-rust);
          transition: all 0.3s ease;
          flex-shrink: 0;
          margin-left: 16px;
        }
        
        .close-button:hover {
          background: var(--sunrise-rust);
          color: white;
          border-color: var(--sunrise-rust);
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
        }
        
        .dialog-content {
          padding: 8px 24px 24px;
        }
        
        /* Custom scrollbar for better aesthetics */
        .dialog::-webkit-scrollbar {
          width: 8px;
        }
        
        .dialog::-webkit-scrollbar-track {
          background: rgba(255, 248, 225, 0.3);
          border-radius: 4px;
        }
        
        .dialog::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          border-radius: 4px;
        }
        
        .dialog::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #F7931E 0%, #FF6B35 100%);
        }
        
        @keyframes overlayFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @media (max-width: 768px) {
          .dialog-overlay {
            padding: 10px;
          }
          
          .dialog {
            border-radius: 20px;
            max-height: 95vh;
          }
          
          .modal-header {
            padding: 20px 20px 0;
          }
          
          .dialog-content {
            padding: 8px 20px 20px;
          }
          
          .dialog-title {
            font-size: 1.8rem;
          }
          
          .close-button {
            width: 36px;
            height: 36px;
            font-size: 18px;
            margin-left: 12px;
          }
        }
        
        @media (max-width: 480px) {
          .dialog-overlay {
            padding: 5px;
          }
          
          .dialog {
            border-radius: 16px;
            max-height: 98vh;
          }
          
          .modal-header {
            padding: 16px 16px 0;
          }
          
          .dialog-content {
            padding: 8px 16px 16px;
          }
          
          .dialog-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}