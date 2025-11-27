import React, { useState, useEffect } from 'react';

export default function TriviaCard({
  question,
  onAnswer,
  answeredBy,
  isAnswered,
  playerId,
  isMobile,
  disabled = false
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [lockedOut, setLockedOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Load collapsed state from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('triviaCardCollapsed');
      return saved === 'true';
    }
    return false;
  });

  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setIsSubmitting(false);
    setShowResult(false);
    setWasCorrect(false);
    setAttemptsUsed(0);
    setLockedOut(false);
    setErrorMessage('');
  }, [question?.id]);

  // Save collapsed state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('triviaCardCollapsed', isCollapsed.toString());
    }
  }, [isCollapsed]);

  if (!question) return null;

  const handleSubmit = async () => {
    if (selectedOption === null || isSubmitting || isAnswered || lockedOut) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Server verifies correctness - we just send the answer index
      const result = await onAnswer(question.id, selectedOption);
      setWasCorrect(result?.correct || false);
      setShowResult(true);

      // Update attempts tracking
      if (result?.attemptsUsed !== undefined) {
        setAttemptsUsed(result.attemptsUsed);
      }

      // Check if locked out
      if (result?.lockedOut) {
        setLockedOut(true);
      }

      // Show error message if provided
      if (result?.message) {
        setErrorMessage(result.message);
      }

      // Reset selection if wrong and not locked out
      if (!result?.correct && !result?.lockedOut) {
        setTimeout(() => {
          setSelectedOption(null);
          setShowResult(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      // Check if the error is about max attempts
      if (error?.message?.includes('Maximum attempts')) {
        setLockedOut(true);
        setErrorMessage('You have used all your attempts for this question.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const iWasFirst = answeredBy?.odPlayerId === playerId;
  const someoneElseAnswered = isAnswered && !iWasFirst;

  return (
    <div className={`trivia-card ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="trivia-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <span className="trivia-icon">🎯</span>
        <span className="trivia-title">AA Trivia</span>
        <span className="trivia-points">+{question.points} pts</span>
        <button
          className="collapse-button"
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }}
          aria-label={isCollapsed ? 'Expand trivia' : 'Collapse trivia'}
        >
          {isCollapsed ? '▼' : '▲'}
        </button>
      </div>

      {!isCollapsed && (
        <>
          <div className="trivia-category">{question.category}</div>

          <div className="trivia-question">{question.question}</div>

      {/* Show attempts remaining */}
      {!isAnswered && attemptsUsed > 0 && !lockedOut && (
        <div className="attempts-indicator">
          <span className="attempts-icon">⚠️</span>
          <span>Attempts used: {attemptsUsed}/2</span>
        </div>
      )}

      <div className="trivia-options">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrectAnswer = index === question.correctIndex;
          const showCorrect = isAnswered && isCorrectAnswer;
          const showWrong = showResult && isSelected && !wasCorrect;

          return (
            <button
              key={index}
              className={`trivia-option ${isSelected ? 'selected' : ''} ${showCorrect ? 'correct' : ''} ${showWrong ? 'wrong' : ''} ${isAnswered || lockedOut ? 'disabled' : ''}`}
              onClick={() => !isAnswered && !disabled && !lockedOut && setSelectedOption(index)}
              disabled={isAnswered || disabled || lockedOut}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
              {showCorrect && <span className="option-icon">✓</span>}
              {showWrong && <span className="option-icon">✗</span>}
            </button>
          );
        })}
      </div>

      {!isAnswered && !lockedOut && (
        <button
          className="trivia-submit"
          onClick={handleSubmit}
          disabled={selectedOption === null || isSubmitting || disabled}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Answer'}
        </button>
      )}

      {/* Show locked out message */}
      {lockedOut && !isAnswered && (
        <div className="trivia-result locked-out">
          <span className="result-icon">🔒</span>
          <span>No attempts remaining. Wait for the next question!</span>
        </div>
      )}

      {isAnswered && answeredBy && (
        <div className={`trivia-result ${iWasFirst ? 'winner' : 'lost'}`}>
          {iWasFirst ? (
            <>
              <span className="result-icon">🎉</span>
              <span>You got it! +{question.points} points</span>
            </>
          ) : (
            <>
              <span className="result-icon">⚡</span>
              <span><strong>{answeredBy.playerName}</strong> answered first!</span>
            </>
          )}
        </div>
      )}

      {showResult && !isAnswered && !wasCorrect && !lockedOut && (
        <div className="trivia-result wrong">
          <span className="result-icon">❌</span>
          <span>{errorMessage || 'Not quite! Keep trying.'}</span>
        </div>
      )}
        </>
      )}

      <style jsx>{`
        .trivia-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 248, 225, 0.95) 100%);
          border-radius: 16px;
          padding: ${isMobile ? '16px' : '20px'};
          margin: 16px 0;
          box-shadow:
            0 4px 20px rgba(139, 69, 19, 0.15),
            0 0 0 2px var(--sunrise-gold, #FFD180);
          max-width: 100%;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          overflow: hidden;
          animation: slideIn 0.3s ease-out;
          transition: all 0.3s ease;
        }

        .trivia-card.collapsed {
          padding: ${isMobile ? '12px 16px' : '16px 20px'};
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .trivia-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 2px solid var(--sunrise-gold, #FFD180);
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .trivia-header:hover {
          background: rgba(255, 209, 128, 0.1);
          margin: -8px;
          padding: 8px;
          padding-bottom: 20px;
          margin-bottom: 4px;
          border-radius: 8px;
        }

        .collapsed .trivia-header {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }

        .trivia-icon {
          font-size: 24px;
        }

        .trivia-title {
          font-weight: 700;
          color: var(--sunrise-rust, #8B4513);
          font-size: ${isMobile ? '16px' : '18px'};
          flex: 1;
        }

        .trivia-points {
          background: linear-gradient(135deg, var(--sunrise-teal, #4DD0E1) 0%, #26C6DA 100%);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 700;
        }

        .trivia-category {
          display: inline-block;
          background: rgba(139, 69, 19, 0.1);
          color: var(--sunrise-rust, #8B4513);
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .trivia-question {
          font-size: ${isMobile ? '14px' : '16px'};
          font-weight: 600;
          color: var(--sunrise-navy, #2C3E50);
          margin-bottom: 16px;
          line-height: 1.5;
          word-wrap: break-word;
          overflow-wrap: anywhere;
          word-break: break-word;
          white-space: pre-wrap;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          display: block;
          hyphens: auto;
        }

        .trivia-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 16px;
        }

        .trivia-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          font-size: ${isMobile ? '14px' : '15px'};
          width: 100%;
          box-sizing: border-box;
        }

        .trivia-option:hover:not(.disabled) {
          border-color: var(--sunrise-gold, #FFD180);
          background: rgba(255, 209, 128, 0.1);
        }

        .trivia-option.selected {
          border-color: var(--sunrise-teal, #4DD0E1);
          background: rgba(77, 208, 225, 0.1);
        }

        .trivia-option.correct {
          border-color: #4CAF50;
          background: rgba(76, 175, 80, 0.15);
        }

        .trivia-option.wrong {
          border-color: #f44336;
          background: rgba(244, 67, 54, 0.1);
        }

        .trivia-option.disabled {
          cursor: default;
          opacity: 0.8;
        }

        .option-letter {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--sunrise-gold, #FFD180);
          color: var(--sunrise-rust, #8B4513);
          border-radius: 50%;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }

        .option-text {
          flex: 1;
          color: var(--sunrise-navy, #2C3E50);
          word-wrap: break-word;
          overflow-wrap: break-word;
          min-width: 0;
        }

        .option-icon {
          font-size: 18px;
          font-weight: bold;
        }

        .trivia-submit {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, var(--sunrise-teal, #4DD0E1) 0%, #26C6DA 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .trivia-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(77, 208, 225, 0.4);
        }

        .trivia-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .trivia-result {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px;
          border-radius: 12px;
          font-weight: 600;
          animation: fadeIn 0.3s ease-out;
        }

        .trivia-result.winner {
          background: linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(129, 199, 132, 0.2) 100%);
          color: #2E7D32;
        }

        .trivia-result.lost {
          background: rgba(255, 152, 0, 0.15);
          color: #E65100;
        }

        .trivia-result.wrong {
          background: rgba(244, 67, 54, 0.1);
          color: #c62828;
        }

        .trivia-result.locked-out {
          background: rgba(158, 158, 158, 0.15);
          color: #616161;
        }

        .result-icon {
          font-size: 20px;
        }

        .attempts-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(255, 152, 0, 0.1);
          border: 2px solid #FF9800;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #E65100;
          margin-bottom: 12px;
        }

        .attempts-icon {
          font-size: 16px;
        }

        .collapse-button {
          margin-left: auto;
          background: transparent;
          border: none;
          color: var(--sunrise-rust, #8B4513);
          font-size: 16px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .collapse-button:hover {
          background: rgba(139, 69, 19, 0.1);
          transform: scale(1.1);
        }

        .collapse-button:active {
          transform: scale(0.95);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
