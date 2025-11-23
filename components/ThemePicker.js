import React from 'react';
import { useTheme } from '../lib/ThemeContext';

export default function ThemePicker({ isOpen, onClose, isMobile }) {
  const { themeName, themes, autoTheme, changeTheme, toggleAutoTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="theme-picker-overlay" onClick={onClose}>
      <div
        className="theme-picker-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="theme-picker-header">
          <h2>Choose Theme</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="auto-theme-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={autoTheme}
              onChange={toggleAutoTheme}
            />
            <span className="toggle-text">
              Auto-switch for holidays
            </span>
          </label>
          {autoTheme && (
            <span className="auto-hint">
              Theme changes automatically based on the date
            </span>
          )}
        </div>

        <div className="theme-grid">
          {themes.map((theme) => (
            <button
              key={theme.id}
              className={`theme-option ${themeName === theme.id ? 'active' : ''}`}
              onClick={() => changeTheme(theme.id)}
              style={{
                '--preview-gradient': theme.gradients.sunrise,
                '--preview-primary': theme.colors.rust,
                '--preview-accent': theme.colors.teal,
              }}
            >
              <div className="theme-preview">
                <span className="theme-emoji">{theme.emoji}</span>
              </div>
              <span className="theme-name">{theme.name}</span>
              {themeName === theme.id && (
                <span className="check-mark">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .theme-picker-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.2s ease-out;
          padding: 20px;
        }

        .theme-picker-modal {
          background: var(--sunrise-cream, #FFF8E1);
          border-radius: 24px;
          padding: ${isMobile ? '20px' : '24px'};
          max-width: 480px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          border: 2px solid var(--sunrise-gold, #FFD180);
          animation: slideUp 0.3s ease-out;
        }

        .theme-picker-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid var(--sunrise-gold, #FFD180);
        }

        .theme-picker-header h2 {
          margin: 0;
          color: var(--sunrise-rust, #8B4513);
          font-size: ${isMobile ? '1.25rem' : '1.5rem'};
          font-weight: 700;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--sunrise-rust, #8B4513);
          padding: 4px 8px;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .close-button:hover {
          background: rgba(139, 69, 19, 0.1);
        }

        .auto-theme-toggle {
          background: rgba(255, 255, 255, 0.6);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          border: 1px solid var(--sunrise-gold, #FFD180);
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .toggle-label input {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: var(--sunrise-teal, #4DD0E1);
        }

        .toggle-text {
          font-weight: 600;
          color: var(--sunrise-navy, #2C3E50);
          font-size: ${isMobile ? '0.9rem' : '1rem'};
        }

        .auto-hint {
          display: block;
          margin-top: 8px;
          font-size: 0.85rem;
          color: var(--sunrise-rust, #8B4513);
          opacity: 0.8;
        }

        .theme-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: ${isMobile ? '10px' : '12px'};
        }

        .theme-option {
          background: rgba(255, 255, 255, 0.8);
          border: 2px solid transparent;
          border-radius: 16px;
          padding: ${isMobile ? '12px 8px' : '16px 12px'};
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          position: relative;
        }

        .theme-option:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: var(--preview-accent);
        }

        .theme-option.active {
          border-color: var(--preview-primary);
          background: rgba(255, 255, 255, 1);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .theme-preview {
          width: ${isMobile ? '48px' : '56px'};
          height: ${isMobile ? '48px' : '56px'};
          border-radius: 50%;
          background: var(--preview-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .theme-emoji {
          font-size: ${isMobile ? '24px' : '28px'};
        }

        .theme-name {
          font-size: ${isMobile ? '0.75rem' : '0.85rem'};
          font-weight: 600;
          color: var(--sunrise-navy, #2C3E50);
          text-align: center;
        }

        .check-mark {
          position: absolute;
          top: 8px;
          right: 8px;
          background: var(--preview-primary);
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 400px) {
          .theme-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
