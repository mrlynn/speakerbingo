import React, { useState, useRef } from 'react'
import { TOPIC_CATEGORIES, getRandomTopicFromCategory, getAllCategories } from '../lib/meetingTopics'

export default function TopicRoulette({ onTopicSelected, isMobile }) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [spinHistory, setSpinHistory] = useState([])
  const [currentRotation, setCurrentRotation] = useState(0)
  const [userGuidance, setUserGuidance] = useState('')
  const [generatedParagraph, setGeneratedParagraph] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAISection, setShowAISection] = useState(false)
  const wheelRef = useRef(null)
  
  const categories = getAllCategories()
  const segmentAngle = 360 / categories.length
  
  const handleSpin = () => {
    if (isSpinning) return
    
    setIsSpinning(true)
    setSelectedTopic(null)
    
    // Generate random spin amount (4-8 full rotations plus random position)
    const baseRotations = 4 + Math.random() * 4 // 4-8 rotations for better effect
    const randomStopAngle = Math.random() * 360
    const spinAmount = baseRotations * 360 + randomStopAngle
    const newTotalRotation = currentRotation + spinAmount
    
    // Calculate which segment we land on (pointer is at top, pointing down)
    // Normalize the final angle to 0-360 range
    const normalizedFinalAngle = (360 - (newTotalRotation % 360)) % 360
    
    // Calculate segment index (accounting for the fact that segments start from 0 degrees)
    const segmentIndex = Math.floor(normalizedFinalAngle / segmentAngle) % categories.length
    const selectedCategory = categories[segmentIndex]
    
    // Apply rotation to wheel
    if (wheelRef.current) {
      wheelRef.current.style.transform = `rotate(${newTotalRotation}deg)`
    }
    
    // Update current rotation for next spin
    setCurrentRotation(newTotalRotation)
    
    // After animation completes, show result
    setTimeout(() => {
      const topic = getRandomTopicFromCategory(selectedCategory.key)
      setSelectedTopic(topic)
      setIsSpinning(false)
      
      // Update history (keep last 3)
      setSpinHistory(prev => [topic, ...prev.slice(0, 2)])
      
      if (onTopicSelected) {
        onTopicSelected(topic)
      }
    }, 3000) // Match CSS animation duration
  }
  
  const handleSpinAgain = () => {
    setSelectedTopic(null)
    setGeneratedParagraph('')
    setShowAISection(false)
    setUserGuidance('')
    handleSpin()
  }
  
  const generateOpeningParagraph = async () => {
    if (!selectedTopic) return
    
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-opening', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: selectedTopic,
          userGuidance: userGuidance.trim()
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate opening paragraph')
      }

      setGeneratedParagraph(data.paragraph)
    } catch (error) {
      console.error('Error generating paragraph:', error)
      setGeneratedParagraph(`Sorry, I couldn't generate an opening paragraph right now. Please try again later. Error: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }
  
  const copyTopic = () => {
    if (selectedTopic) {
      let text = `Meeting Topic: ${selectedTopic.title}\\n\\n${selectedTopic.description}\\n\\nDiscussion Questions:\\n${selectedTopic.questions.map(q => `• ${q}`).join('\\n')}`
      
      if (generatedParagraph) {
        text += `\\n\\nSuggested Opening:\\n${generatedParagraph}`
      }
      
      navigator.clipboard.writeText(text)
    }
  }
  
  const copyParagraph = () => {
    if (generatedParagraph) {
      navigator.clipboard.writeText(generatedParagraph)
    }
  }
  
  return (
    <div className="topic-roulette">
      {/* Roulette Wheel */}
      <div className="wheel-container">
        <svg 
          className="roulette-wheel" 
          width={isMobile ? "280" : "320"} 
          height={isMobile ? "280" : "320"}
          viewBox="0 0 320 320"
        >
          <g ref={wheelRef} className="wheel-segments">
            {categories.map((category, index) => {
              const startAngle = index * segmentAngle
              const endAngle = (index + 1) * segmentAngle
              const startAngleRad = (startAngle * Math.PI) / 180
              const endAngleRad = (endAngle * Math.PI) / 180
              
              const radius = 140
              const centerX = 160
              const centerY = 160
              
              const x1 = centerX + radius * Math.cos(startAngleRad)
              const y1 = centerY + radius * Math.sin(startAngleRad)
              const x2 = centerX + radius * Math.cos(endAngleRad)
              const y2 = centerY + radius * Math.sin(endAngleRad)
              
              const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
              
              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ')
              
              // Text position (middle of segment)
              const textAngle = startAngle + segmentAngle / 2
              const textAngleRad = (textAngle * Math.PI) / 180
              const textRadius = radius * 0.7
              const textX = centerX + textRadius * Math.cos(textAngleRad)
              const textY = centerY + textRadius * Math.sin(textAngleRad)
              
              return (
                <g key={category.key}>
                  <path
                    d={pathData}
                    fill={category.color}
                    stroke="#fff"
                    strokeWidth="2"
                    opacity="0.9"
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize={isMobile ? "10" : "11"}
                    fontWeight="600"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textAngle} ${textX} ${textY})`}
                  >
                    <tspan x={textX} dy="-6">{category.icon}</tspan>
                    <tspan x={textX} dy="12" fontSize={isMobile ? "8" : "9"}>
                      {category.name.split(' ').map((word, i) => (
                        <tspan key={i} x={textX} dy={i > 0 ? "10" : "0"}>
                          {word}
                        </tspan>
                      ))}
                    </tspan>
                  </text>
                </g>
              )
            })}
          </g>
          
          {/* Center Circle */}
          <circle
            cx="160"
            cy="160"
            r="20"
            fill="#FFFFFF"
            stroke="var(--sunrise-gold)"
            strokeWidth="3"
          />
          <circle
            cx="160"
            cy="160"
            r="8"
            fill="var(--sunrise-rust)"
          />
        </svg>
        
        {/* Pointer */}
        <div className="wheel-pointer">
          <div className="pointer-triangle"></div>
        </div>
      </div>
      
      {/* Large Prominent SPIN Button */}
      <button
        className={`large-spin-button ${isSpinning ? 'spinning' : ''}`}
        onClick={handleSpin}
        disabled={isSpinning}
      >
        {isSpinning ? (
          <>
            <span className="spin-icon">🌀</span>
            <span className="spin-text">SPINNING...</span>
          </>
        ) : (
          <>
            <span className="spin-icon">🎯</span>
            <span className="spin-text">SPIN THE WHEEL!</span>
          </>
        )}
      </button>
      
      {/* Result Display */}
      {selectedTopic && (
        <div className="topic-result">
          <div className="result-header">
            <span className="result-category" style={{ color: selectedTopic.categoryColor }}>
              {selectedTopic.categoryIcon} {selectedTopic.categoryName}
            </span>
          </div>
          
          <h3 className="result-title">{selectedTopic.title}</h3>
          <p className="result-description">{selectedTopic.description}</p>
          
          <div className="discussion-questions">
            <h4>Discussion Questions:</h4>
            <ul>
              {selectedTopic.questions.map((question, index) => (
                <li key={index}>{question}</li>
              ))}
            </ul>
          </div>
          
          <div className="result-actions">
            <button className="spin-again-btn" onClick={handleSpinAgain}>
              🎡 Spin Again
            </button>
            <button className="copy-btn" onClick={copyTopic}>
              📋 Copy Topic
            </button>
            <button 
              className="ai-generate-btn" 
              onClick={() => setShowAISection(!showAISection)}
            >
              🤖 Generate Opening
            </button>
          </div>
          
          {/* AI Opening Generator Section */}
          {showAISection && (
            <div className="ai-section">
              <h4>🤖 AI Meeting Opening Generator</h4>
              <p>Get a personalized opening paragraph to introduce this topic at your meeting.</p>
              
              <div className="guidance-input">
                <label htmlFor="user-guidance">
                  Optional: Any specific guidance or focus for the opening? (e.g., "focus on newcomers", "emphasize gratitude", "address recent challenges")
                </label>
                <textarea
                  id="user-guidance"
                  value={userGuidance}
                  onChange={(e) => setUserGuidance(e.target.value)}
                  placeholder="Enter any specific guidance to help tailor the opening paragraph..."
                  rows="3"
                  maxLength="200"
                />
                <small>{userGuidance.length}/200 characters</small>
              </div>
              
              <div className="ai-actions">
                <button 
                  className="generate-btn" 
                  onClick={generateOpeningParagraph}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <span className="loading-spinner">⏳</span>
                      Generating...
                    </>
                  ) : (
                    <>
                      ✨ Generate Opening
                    </>
                  )}
                </button>
              </div>
              
              {generatedParagraph && (
                <div className="generated-content">
                  <h5>📝 Suggested Meeting Opening:</h5>
                  <div className="paragraph-content">
                    {generatedParagraph}
                  </div>
                  <div className="paragraph-actions">
                    <button className="copy-paragraph-btn" onClick={copyParagraph}>
                      📋 Copy Opening
                    </button>
                    <button 
                      className="regenerate-btn" 
                      onClick={generateOpeningParagraph}
                      disabled={isGenerating}
                    >
                      🔄 Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Instructions */}
      {!selectedTopic && (
        <div className="instructions">
          <h3>🎡 Topic Jar Roulette</h3>
          <p>Click the wheel or the spin button to get a random meeting discussion topic!</p>
          {spinHistory.length > 0 && (
            <div className="recent-topics">
              <h4>Recent Topics:</h4>
              <ul>
                {spinHistory.map((topic, index) => (
                  <li key={index}>
                    <span style={{ color: topic.categoryColor }}>{topic.categoryIcon}</span>
                    {topic.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        .topic-roulette {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          padding: 20px;
          max-width: 100%;
        }
        
        .wheel-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .roulette-wheel {
          filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
          cursor: ${isSpinning ? 'default' : 'pointer'};
        }
        
        .wheel-segments {
          transition: transform 3s cubic-bezier(0.15, 0, 0.3, 1);
          transform-origin: center;
        }
        
        .wheel-pointer {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }
        
        .pointer-triangle {
          width: 0;
          height: 0;
          border-left: 12px solid transparent;
          border-right: 12px solid transparent;
          border-top: 20px solid #FF6B35;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }
        
        .large-spin-button {
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          border: none;
          border-radius: 16px;
          padding: ${isMobile ? '16px 32px' : '20px 40px'};
          color: white;
          font-size: ${isMobile ? '18px' : '20px'};
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 
            0 6px 20px rgba(255, 107, 53, 0.4),
            0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          min-width: ${isMobile ? '200px' : '240px'};
          justify-content: center;
          margin: 16px 0;
        }
        
        .large-spin-button:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 
            0 8px 25px rgba(255, 107, 53, 0.5),
            0 4px 12px rgba(0, 0, 0, 0.15);
          background: linear-gradient(135deg, #F7931E 0%, #FF6B35 100%);
        }
        
        .large-spin-button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
          transform: none;
        }
        
        .large-spin-button.spinning {
          background: linear-gradient(135deg, #9B59B6 0%, #E74C3C 100%);
          animation: spinButtonPulse 1s ease-in-out infinite;
        }
        
        .spin-icon {
          font-size: ${isMobile ? '24px' : '28px'};
          display: inline-block;
        }
        
        .large-spin-button.spinning .spin-icon {
          animation: iconSpin 1s linear infinite;
        }
        
        .spin-text {
          font-size: ${isMobile ? '16px' : '18px'};
        }
        
        .topic-result {
          background: rgba(255, 248, 225, 0.95);
          border-radius: 16px;
          padding: 24px;
          border: 2px solid rgba(255, 209, 128, 0.6);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          max-width: ${isMobile ? '100%' : '500px'};
          text-align: center;
          animation: resultSlideIn 0.5s ease-out;
        }
        
        .result-header {
          margin-bottom: 16px;
        }
        
        .result-category {
          font-weight: 700;
          font-size: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .result-title {
          color: var(--sunrise-navy);
          font-size: ${isMobile ? '1.5rem' : '1.8rem'};
          font-weight: 800;
          margin: 0 0 12px 0;
          line-height: 1.2;
        }
        
        .result-description {
          color: #666;
          font-size: 1rem;
          margin-bottom: 20px;
          line-height: 1.5;
        }
        
        .discussion-questions {
          text-align: left;
          margin-bottom: 24px;
        }
        
        .discussion-questions h4 {
          color: var(--sunrise-rust);
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0 0 12px 0;
        }
        
        .discussion-questions ul {
          margin: 0;
          padding-left: 20px;
        }
        
        .discussion-questions li {
          color: #555;
          margin-bottom: 8px;
          line-height: 1.4;
        }
        
        .result-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .spin-again-btn, .copy-btn, .ai-generate-btn, .generate-btn, .copy-paragraph-btn, .regenerate-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: center;
        }
        
        .spin-again-btn {
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
        }
        
        .spin-again-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4);
        }
        
        .copy-btn {
          background: rgba(255, 255, 255, 0.9);
          color: var(--sunrise-rust);
          border: 2px solid var(--sunrise-gold);
        }
        
        .copy-btn:hover {
          background: var(--sunrise-gold);
          color: white;
          transform: translateY(-1px);
        }
        
        .ai-generate-btn {
          background: linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(155, 89, 182, 0.3);
        }
        
        .ai-generate-btn:hover {
          background: linear-gradient(135deg, #8E44AD 0%, #9B59B6 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(155, 89, 182, 0.4);
        }
        
        .ai-section {
          background: rgba(155, 89, 182, 0.05);
          border: 2px solid rgba(155, 89, 182, 0.2);
          border-radius: 16px;
          padding: 20px;
          margin-top: 20px;
          animation: slideIn 0.3s ease-out;
        }
        
        .ai-section h4 {
          color: #9B59B6;
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0 0 8px 0;
        }
        
        .ai-section p {
          color: #666;
          font-size: 0.9rem;
          margin: 0 0 16px 0;
        }
        
        .guidance-input {
          margin-bottom: 16px;
        }
        
        .guidance-input label {
          display: block;
          color: #555;
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 8px;
          line-height: 1.4;
        }
        
        .guidance-input textarea {
          width: 100%;
          padding: 10px;
          border: 2px solid rgba(155, 89, 182, 0.2);
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.9rem;
          resize: vertical;
          transition: border-color 0.3s ease;
          box-sizing: border-box;
        }
        
        .guidance-input textarea:focus {
          outline: none;
          border-color: #9B59B6;
          box-shadow: 0 0 0 3px rgba(155, 89, 182, 0.1);
        }
        
        .guidance-input small {
          color: #888;
          font-size: 0.8rem;
          margin-top: 4px;
          display: block;
        }
        
        .ai-actions {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }
        
        .generate-btn {
          background: linear-gradient(135deg, #27AE60 0%, #2ECC71 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
          min-width: 160px;
        }
        
        .generate-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #2ECC71 0%, #27AE60 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(39, 174, 96, 0.4);
        }
        
        .generate-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        
        .loading-spinner {
          animation: spin 1s linear infinite;
        }
        
        .generated-content {
          background: rgba(39, 174, 96, 0.05);
          border: 2px solid rgba(39, 174, 96, 0.2);
          border-radius: 12px;
          padding: 16px;
          margin-top: 16px;
        }
        
        .generated-content h5 {
          color: #27AE60;
          font-size: 1rem;
          font-weight: 700;
          margin: 0 0 12px 0;
        }
        
        .paragraph-content {
          background: white;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid rgba(39, 174, 96, 0.2);
          line-height: 1.6;
          color: #333;
          font-size: 0.95rem;
          margin-bottom: 16px;
          white-space: pre-wrap;
        }
        
        .paragraph-actions {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .copy-paragraph-btn {
          background: rgba(39, 174, 96, 0.1);
          color: #27AE60;
          border: 2px solid rgba(39, 174, 96, 0.3);
        }
        
        .copy-paragraph-btn:hover {
          background: rgba(39, 174, 96, 0.2);
          transform: translateY(-1px);
        }
        
        .regenerate-btn {
          background: rgba(255, 193, 7, 0.1);
          color: #F39C12;
          border: 2px solid rgba(243, 156, 18, 0.3);
        }
        
        .regenerate-btn:hover:not(:disabled) {
          background: rgba(255, 193, 7, 0.2);
          transform: translateY(-1px);
        }
        
        .regenerate-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        
        .instructions {
          text-align: center;
          max-width: ${isMobile ? '100%' : '400px'};
        }
        
        .instructions h3 {
          color: var(--sunrise-rust);
          font-size: ${isMobile ? '1.5rem' : '1.8rem'};
          font-weight: 800;
          margin: 0 0 12px 0;
        }
        
        .instructions p {
          color: #666;
          font-size: 1rem;
          line-height: 1.5;
          margin-bottom: 20px;
        }
        
        .recent-topics {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 12px;
          padding: 16px;
          border: 1px solid rgba(255, 209, 128, 0.4);
        }
        
        .recent-topics h4 {
          color: var(--sunrise-rust);
          font-size: 1rem;
          font-weight: 700;
          margin: 0 0 12px 0;
        }
        
        .recent-topics ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }
        
        .recent-topics li {
          color: #555;
          margin-bottom: 6px;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        @keyframes spinButtonPulse {
          0%, 100% { transform: translateY(-2px) scale(1.05); }
          50% { transform: translateY(-2px) scale(1.1); }
        }
        
        @keyframes iconSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes resultSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .topic-roulette {
            padding: 16px;
          }
          
          .topic-result {
            padding: 20px;
          }
          
          .result-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .spin-again-btn, .copy-btn, .ai-generate-btn, .generate-btn, .copy-paragraph-btn, .regenerate-btn {
            width: 100%;
            max-width: 200px;
          }
          
          .ai-section {
            padding: 16px;
          }
          
          .paragraph-actions {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  )
}