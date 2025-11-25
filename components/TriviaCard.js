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

  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setIsSubmitting(false);
    setShowResult(false);
    setWasCorrect(false);
  }, [question?.id]);

  if (!question) return null;

  const handleSubmit = async () => {
    if (selectedOption === null || isSubmitting || isAnswered) return;

    setIsSubmitting(true);

    try {
      // Server verifies correctness - we just send the answer index
      const result = await onAnswer(question.id, selectedOption);
      setWasCorrect(result?.correct || false);
      setShowResult(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const iWasFirst = answeredBy?.odPlayerId === playerId;
  const someoneElseAnswered = isAnswered && !iWasFirst;

  return (
    <div className="trivia-card">
      <div className="trivia-header">
        <span className="trivia-icon">🎯</span>
        <span className="trivia-title">AA Trivia</span>
        <span className="trivia-points">+{question.points} pts</span>
      </div>

      <div className="trivia-category">{question.category}</div>

      <div className="trivia-question">{question.question}</div>

      <div className="trivia-options">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrectAnswer = index === question.correctIndex;
          const showCorrect = isAnswered && isCorrectAnswer;
          const showWrong = showResult && isSelected && !wasCorrect;

          return (
            <button
              key={index}
              className={`trivia-option ${isSelected ? 'selected' : ''} ${showCorrect ? 'correct' : ''} ${showWrong ? 'wrong' : ''} ${isAnswered ? 'disabled' : ''}`}
              onClick={() => !isAnswered && !disabled && setSelectedOption(index)}
              disabled={isAnswered || disabled}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
              {showCorrect && <span className="option-icon">✓</span>}
              {showWrong && <span className="option-icon">✗</span>}
            </button>
          );
        })}
      </div>

      {!isAnswered && (
        <button
          className="trivia-submit"
          onClick={handleSubmit}
          disabled={selectedOption === null || isSubmitting || disabled}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Answer'}
        </button>
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

      {showResult && !isAnswered && !wasCorrect && (
        <div className="trivia-result wrong">
          <span className="result-icon">❌</span>
          <span>Not quite! Keep trying.</span>
        </div>
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

        .result-icon {
          font-size: 20px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
