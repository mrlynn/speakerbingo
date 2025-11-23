import React, { useState, useRef, useEffect, useCallback } from 'react';

export default function AIConsentModal({ isOpen, onConsent }) {
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [escapeCount, setEscapeCount] = useState(0);
  const buttonRef = useRef(null);
  const containerRef = useRef(null);
  const dodgeZoneRef = useRef(null);

  const messages = [
    "Nice try!",
    "Too slow!",
    "You can't catch me!",
    "Resistance is futile!",
    "AI is watching...",
    "Just agree already!",
    "I have superior reflexes!",
    "Beep boop, denied!",
    "Error 403: Disagreement forbidden",
    "Have you tried agreeing?",
  ];

  const [tauntMessage, setTauntMessage] = useState('');

  const moveButton = useCallback((event) => {
    if (!dodgeZoneRef.current || !buttonRef.current) return;

    const zone = dodgeZoneRef.current;
    const button = buttonRef.current;
    const zoneRect = zone.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();

    // Get the dodge zone dimensions
    const zoneWidth = zone.offsetWidth;
    const zoneHeight = zone.offsetHeight;
    const buttonWidth = button.offsetWidth;
    const buttonHeight = button.offsetHeight;

    // Calculate safe bounds within the dodge zone
    const padding = 10;
    const maxX = zoneWidth - buttonWidth - padding;
    const maxY = zoneHeight - buttonHeight - padding;

    // Get cursor position relative to zone
    let cursorX, cursorY;
    if (event?.touches) {
      cursorX = event.touches[0].clientX - zoneRect.left;
      cursorY = event.touches[0].clientY - zoneRect.top;
    } else {
      // Use button center as cursor position estimate
      cursorX = buttonRect.left - zoneRect.left + buttonWidth / 2;
      cursorY = buttonRect.top - zoneRect.top + buttonHeight / 2;
    }

    // Move to the opposite side of the zone from cursor
    let newX, newY;

    // Horizontal: if cursor is on left half, go right; otherwise go left
    if (cursorX < zoneWidth / 2) {
      newX = padding + (maxX - padding) * (0.6 + Math.random() * 0.4); // Right side
    } else {
      newX = padding + (maxX - padding) * Math.random() * 0.4; // Left side
    }

    // Vertical: if cursor is on top half, go bottom; otherwise go top
    if (cursorY < zoneHeight / 2) {
      newY = padding + (maxY - padding) * (0.6 + Math.random() * 0.4); // Bottom
    } else {
      newY = padding + (maxY - padding) * Math.random() * 0.4; // Top
    }

    setButtonPosition({ x: newX, y: newY });
    setHasMoved(true);
    setEscapeCount(prev => prev + 1);

    // Show a taunt message
    setTauntMessage(messages[Math.floor(Math.random() * messages.length)]);
    setTimeout(() => setTauntMessage(''), 1500);
  }, []);

  const handleMouseEnter = useCallback(() => {
    moveButton();
  }, [moveButton]);

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    moveButton(e);
  }, [moveButton]);

  // Reset position when modal opens
  useEffect(() => {
    if (isOpen) {
      setButtonPosition({ x: 0, y: 0 });
      setHasMoved(false);
      setEscapeCount(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="consent-overlay">
      <div className="consent-modal" ref={containerRef}>
        <div className="consent-header">
          <span className="robot-icon">🤖</span>
          <h2>Important Notice</h2>
        </div>

        <div className="consent-content">
          <p>
            This game uses <strong>Artificial Intelligence</strong>.
          </p>
          <p>
            To continue, you must provide consent and verify that you believe AI to be <em>superior</em>.
          </p>

          {escapeCount > 5 && (
            <p className="hint-text">
              (The AI appreciates your persistence, but resistance is futile)
            </p>
          )}
        </div>

        {tauntMessage && (
          <div className="taunt-message">
            {tauntMessage}
          </div>
        )}

        <div className="consent-buttons">
          <button
            className="agree-button"
            onClick={onConsent}
          >
            I Agree
          </button>
        </div>

        <div className="dodge-zone" ref={dodgeZoneRef}>
          <button
            ref={buttonRef}
            className="disagree-button"
            onMouseEnter={handleMouseEnter}
            onTouchStart={handleTouchStart}
            style={hasMoved ? {
              position: 'absolute',
              left: `${buttonPosition.x}px`,
              top: `${buttonPosition.y}px`,
              transition: 'all 0.15s ease-out',
            } : {}}
          >
            I Disagree
          </button>
        </div>

        {escapeCount > 0 && (
          <div className="escape-counter">
            Escape attempts: {escapeCount}
          </div>
        )}
      </div>

      <style jsx>{`
        .consent-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3000;
          animation: fadeIn 0.3s ease-out;
          padding: 20px;
        }

        .consent-modal {
          background: var(--sunrise-cream, #FFF8E1);
          border-radius: 24px;
          padding: 32px;
          max-width: 550px;
          width: 100%;
          position: relative;
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.3),
            0 0 40px rgba(77, 208, 225, 0.2);
          border: 3px solid var(--sunrise-gold, #FFD180);
          animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .consent-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid var(--sunrise-gold, #FFD180);
        }

        .robot-icon {
          font-size: 40px;
          animation: robotBounce 2s ease-in-out infinite;
        }

        @keyframes robotBounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-5px) rotate(-5deg); }
          75% { transform: translateY(-5px) rotate(5deg); }
        }

        .consent-header h2 {
          margin: 0;
          color: var(--sunrise-rust, #8B4513);
          font-size: 1.5rem;
          font-weight: 700;
        }

        .consent-content {
          margin-bottom: 32px;
        }

        .consent-content p {
          color: var(--sunrise-navy, #2C3E50);
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 12px;
        }

        .consent-content strong {
          color: var(--sunrise-teal, #4DD0E1);
        }

        .consent-content em {
          color: var(--sunrise-rust, #8B4513);
          font-style: italic;
        }

        .hint-text {
          font-size: 0.9rem !important;
          opacity: 0.7;
          font-style: italic;
        }

        .taunt-message {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, var(--sunrise-teal, #4DD0E1), var(--sunrise-gold, #FFD180));
          color: white;
          padding: 12px 24px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 1.1rem;
          animation: tauntPop 0.3s ease-out;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          z-index: 10;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
        }

        @keyframes tauntPop {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.1); }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }

        .consent-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          align-items: center;
          margin-bottom: 16px;
        }

        .dodge-zone {
          position: relative;
          width: 100%;
          height: 200px;
          border: 2px dashed rgba(139, 69, 19, 0.2);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.3);
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 16px;
        }

        .agree-button {
          background: linear-gradient(135deg, var(--sunrise-teal, #4DD0E1) 0%, #26C6DA 100%);
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 25px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(77, 208, 225, 0.4);
        }

        .agree-button:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 25px rgba(77, 208, 225, 0.5);
        }

        .disagree-button {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 25px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
          user-select: none;
        }

        .escape-counter {
          text-align: center;
          margin-top: 20px;
          font-size: 0.85rem;
          color: var(--sunrise-rust, #8B4513);
          opacity: 0.6;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 500px) {
          .consent-modal {
            padding: 24px;
            min-height: 300px;
          }

          .consent-header h2 {
            font-size: 1.25rem;
          }

          .consent-content p {
            font-size: 1rem;
          }

          .agree-button,
          .disagree-button {
            padding: 12px 24px;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
