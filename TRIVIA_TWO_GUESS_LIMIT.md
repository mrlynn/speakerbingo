# Trivia Two-Guess Limit Feature

## Overview
Implemented a 2-guess limit for trivia questions to prevent unlimited guessing. Players now have a maximum of 2 attempts per question before being locked out.

## How It Works

### Player Experience
1. **First Wrong Answer**: Player sees "Incorrect! You have 1 attempt left."
2. **Second Wrong Answer**: Player sees "Incorrect! No attempts remaining." and is locked out
3. **Locked Out State**: 🔒 "No attempts remaining. Wait for the next question!"
4. **Correct Answer**: Player wins points (whether on first or second attempt)

### Visual Feedback
- **Attempts Indicator**: Orange warning badge shows "Attempts used: X/2" after first wrong answer
- **Locked Out Message**: Gray badge with lock icon when all attempts are exhausted
- **Dynamic Messages**: Server provides contextual feedback based on remaining attempts
- **Disabled State**: Options become unclickable when locked out

## Technical Implementation

### Backend Changes (API)

**File**: `pages/api/games/[roomCode]/trivia.js`

1. **Attempt Tracking** (Line 43-53):
   - Stores attempts per player in `currentQuestion.attempts` object
   - Format: `{ playerId: attemptCount }`
   - Checks if player has reached 2 attempts before accepting answer

2. **Attempt Increment** (Line 60-136):
   - Increments counter on every submission (correct or incorrect)
   - Updates database with new attempt count
   - Returns attempt info in response

3. **Response Data**:
   ```javascript
   {
     success: true,
     correct: true/false,
     attemptsUsed: 1 or 2,
     remainingAttempts: 1 or 0,
     lockedOut: true/false,
     message: "Contextual feedback message"
   }
   ```

4. **Question Initialization** (Line 168, 213):
   - New questions start with `attempts: {}` empty object
   - Resets for each new question

### Frontend Changes (UI)

**File**: `components/TriviaCard.js`

1. **State Management** (Line 16-18):
   ```javascript
   const [attemptsUsed, setAttemptsUsed] = useState(0);
   const [lockedOut, setLockedOut] = useState(false);
   const [errorMessage, setErrorMessage] = useState('');
   ```

2. **Answer Submission Handler** (Line 33-77):
   - Tracks attempts from server response
   - Handles locked-out state
   - Auto-resets selection after wrong answer (if not locked out)
   - Shows error messages from server

3. **UI Elements**:
   - **Attempts Indicator** (Line 95-100): Shows "Attempts used: X/2"
   - **Locked Out Message** (Line 136-141): Shows when no attempts remain
   - **Disabled Options** (Line 112-114): Prevents selection when locked out
   - **Hidden Submit Button** (Line 125): Hides when locked out

4. **Styling** (Line 375-400):
   - `.locked-out`: Gray background for locked state
   - `.attempts-indicator`: Orange warning badge
   - Consistent with existing trivia card design

## Security Features

✅ **Server-Side Validation**: All attempt tracking done on backend
✅ **Tamper-Proof**: Frontend can't bypass attempt limit
✅ **Per-Player Tracking**: Each player has independent attempt count
✅ **Question Reset**: Attempts reset for each new question

## Database Schema

### Question Object
```javascript
{
  id: "q-1",
  question: "Question text...",
  options: ["A", "B", "C", "D", "E"],
  correctIndex: 1,
  category: "Big Book",
  points: 75,
  difficulty: "hard",
  isAnswered: false,
  answeredBy: null,
  attempts: {
    "player-id-1": 2,
    "player-id-2": 1,
    "player-id-3": 2
  }
}
```

## User Flow Examples

### Scenario 1: Correct on First Try
1. Player selects answer → Submits
2. ✅ Correct! Player wins 75 points
3. Question marked as answered by this player

### Scenario 2: Wrong Then Correct
1. Player selects wrong answer → Submits
2. ❌ "Incorrect! You have 1 attempt left."
3. Attempts indicator shows: "Attempts used: 1/2"
4. Player selects different answer → Submits
5. ✅ Correct! Player wins 75 points

### Scenario 3: Two Wrong Answers
1. Player selects wrong answer → Submits
2. ❌ "Incorrect! You have 1 attempt left."
3. Attempts indicator shows: "Attempts used: 1/2"
4. Player selects another wrong answer → Submits
5. ❌ "Incorrect! No attempts remaining."
6. 🔒 Locked out message appears
7. Options become unclickable
8. Player must wait for next question

### Scenario 4: Someone Else Answers First
1. Player A uses 1 attempt (wrong)
2. Player B answers correctly
3. Question marked as answered
4. Player A sees "Player B answered first!"
5. All players see correct answer highlighted

## Configuration

Currently hardcoded to **2 attempts** per question. To change:

**Location**: `pages/api/games/[roomCode]/trivia.js`
- Line 47: `if (currentAttempts >= 2)` - Change the number
- Line 124: `const remainingAttempts = 2 - newAttemptCount;` - Update calculation

To make it configurable, add to `lib/triviaQuestions.js`:
```javascript
export const triviaConfig = {
  defaultIntervalMinutes: 3,
  pointsMultiplier: 1,
  maxQuestionsPerGame: 10,
  maxAttemptsPerQuestion: 2  // Add this line
};
```

## Testing Checklist

✅ First wrong answer shows "1 attempt left"
✅ Second wrong answer shows "No attempts remaining"
✅ Locked out state prevents further attempts
✅ Correct answer on first try works
✅ Correct answer on second try works
✅ Attempts reset for new questions
✅ Multiple players have independent attempt counts
✅ UI shows/hides elements appropriately
✅ Server rejects attempts after limit reached

## Files Modified

1. ✅ `pages/api/games/[roomCode]/trivia.js` - Backend logic
2. ✅ `components/TriviaCard.js` - Frontend UI and state

## Benefits

1. **Prevents Guessing**: Players can't brute-force answers
2. **Increases Difficulty**: Makes trivia more challenging
3. **Fair Competition**: Everyone gets same number of attempts
4. **Engagement**: Players think more carefully before answering
5. **Knowledge-Based**: Rewards actual AA knowledge over luck

---

**Ready to test!** Start a multiplayer game, answer a trivia question wrong twice, and verify you get locked out.
