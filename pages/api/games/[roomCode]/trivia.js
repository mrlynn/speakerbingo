import clientPromise from '../../../../lib/mongodb';
import { getRandomQuestion, triviaConfig } from '../../../../lib/triviaQuestions';

export default async function handler(req, res) {
  const { roomCode } = req.query;

  if (!roomCode) {
    return res.status(400).json({ error: 'Room code is required' });
  }

  const client = await clientPromise;
  const db = client.db('bingo');
  const games = db.collection('games');

  if (req.method === 'POST') {
    // Submit an answer
    const { playerId, playerName, questionId, answerIndex, isCorrect } = req.body;

    if (!playerId || !questionId || answerIndex === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const game = await games.findOne({ roomCode: roomCode.toUpperCase() });

      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }

      // Check if trivia exists and question matches
      if (!game.trivia || game.trivia.currentQuestion?.id !== questionId) {
        return res.status(400).json({ error: 'Question not active or already answered' });
      }

      // Check if already answered
      if (game.trivia.currentQuestion.answeredBy) {
        return res.status(400).json({
          error: 'Question already answered',
          answeredBy: game.trivia.currentQuestion.answeredBy
        });
      }

      // Check player's attempt count (max 2 attempts)
      const playerAttempts = game.trivia.currentQuestion.attempts || {};
      const currentAttempts = playerAttempts[playerId] || 0;

      if (currentAttempts >= 2) {
        return res.status(400).json({
          error: 'Maximum attempts reached',
          attemptsUsed: currentAttempts,
          maxAttempts: 2
        });
      }

      // Server-side verification of correctness
      const correctIndex = game.trivia.currentQuestion.correctIndex;
      // Ensure both are numbers for comparison (answerIndex may come as string from JSON)
      const isAnswerCorrect = parseInt(answerIndex, 10) === parseInt(correctIndex, 10);

      // Increment attempt count
      const newAttemptCount = currentAttempts + 1;

      // If correct answer, mark as answered and award points
      if (isAnswerCorrect) {
        const points = game.trivia.currentQuestion.points || 50;

        // Find the player's index in the array
        const playerIndex = game.players.findIndex(p => p.id === playerId);

        // Build update object
        const updateObj = {
          $set: {
            'trivia.currentQuestion.answeredBy': {
              odPlayerId: playerId,
              playerName: playerName,
              answeredAt: new Date()
            },
            'trivia.currentQuestion.isAnswered': true,
            [`trivia.currentQuestion.attempts.${playerId}`]: newAttemptCount
          },
          $push: {
            'trivia.questionHistory': {
              questionId,
              answeredBy: playerId,
              playerName,
              answeredAt: new Date(),
              points
            }
          }
        };

        // Add player points update if player found in array
        if (playerIndex !== -1) {
          // Update both triviaPoints (for tracking) and points (for display)
          const currentTriviaPoints = game.players[playerIndex].triviaPoints || 0;
          const currentPoints = game.players[playerIndex].points || 0;
          updateObj.$set[`players.${playerIndex}.triviaPoints`] = currentTriviaPoints + points;
          updateObj.$set[`players.${playerIndex}.points`] = currentPoints + points;
        }

        const updateResult = await games.updateOne(
          { roomCode: roomCode.toUpperCase() },
          updateObj
        );

        return res.status(200).json({
          success: true,
          correct: true,
          points,
          attemptsUsed: newAttemptCount,
          message: `Correct! +${points} points`
        });
      } else {
        // Wrong answer - increment attempt counter
        await games.updateOne(
          { roomCode: roomCode.toUpperCase() },
          {
            $set: {
              [`trivia.currentQuestion.attempts.${playerId}`]: newAttemptCount
            }
          }
        );

        const remainingAttempts = 2 - newAttemptCount;

        return res.status(200).json({
          success: true,
          correct: false,
          attemptsUsed: newAttemptCount,
          remainingAttempts: remainingAttempts,
          lockedOut: remainingAttempts === 0,
          message: remainingAttempts > 0
            ? `Incorrect! You have ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} left.`
            : 'Incorrect! No attempts remaining.'
        });
      }
    } catch (error) {
      console.error('Error submitting trivia answer:', error);
      return res.status(500).json({ error: 'Failed to submit answer' });
    }
  }

  if (req.method === 'GET') {
    // Get current trivia state (or generate new question if needed)
    try {
      const game = await games.findOne({ roomCode: roomCode.toUpperCase() });

      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }

      // Initialize trivia if not exists
      if (!game.trivia) {
        const newQuestion = getRandomQuestion([]);
        const now = new Date();
        const intervalMs = (game.triviaIntervalMinutes || triviaConfig.defaultIntervalMinutes) * 60 * 1000;

        await games.updateOne(
          { roomCode: roomCode.toUpperCase() },
          {
            $set: {
              trivia: {
                currentQuestion: {
                  ...newQuestion,
                  appearedAt: now,
                  isAnswered: false,
                  answeredBy: null,
                  attempts: {}
                },
                nextQuestionAt: new Date(now.getTime() + intervalMs),
                questionHistory: [],
                intervalMinutes: game.triviaIntervalMinutes || triviaConfig.defaultIntervalMinutes
              }
            }
          }
        );

        return res.status(200).json({
          currentQuestion: {
            id: newQuestion.id,
            question: newQuestion.question,
            options: newQuestion.options,
            category: newQuestion.category,
            points: newQuestion.points,
            difficulty: newQuestion.difficulty,
            isAnswered: false,
            answeredBy: null
          },
          nextQuestionAt: new Date(now.getTime() + intervalMs)
        });
      }

      // Check if it's time for a new question
      const now = new Date();
      const nextQuestionAt = new Date(game.trivia.nextQuestionAt);
      const currentAnswered = game.trivia.currentQuestion?.isAnswered;

      // Generate new question if: time has passed AND current is answered (or no current question)
      if (now >= nextQuestionAt && (currentAnswered || !game.trivia.currentQuestion)) {
        const usedQuestionIds = (game.trivia.questionHistory || []).map(q => q.questionId);
        const newQuestion = getRandomQuestion(usedQuestionIds);
        const intervalMs = (game.trivia.intervalMinutes || triviaConfig.defaultIntervalMinutes) * 60 * 1000;

        await games.updateOne(
          { roomCode: roomCode.toUpperCase() },
          {
            $set: {
              'trivia.currentQuestion': {
                ...newQuestion,
                appearedAt: now,
                isAnswered: false,
                answeredBy: null,
                attempts: {}
              },
              'trivia.nextQuestionAt': new Date(now.getTime() + intervalMs)
            }
          }
        );

        return res.status(200).json({
          currentQuestion: {
            id: newQuestion.id,
            question: newQuestion.question,
            options: newQuestion.options,
            category: newQuestion.category,
            points: newQuestion.points,
            difficulty: newQuestion.difficulty,
            isAnswered: false,
            answeredBy: null
          },
          nextQuestionAt: new Date(now.getTime() + intervalMs)
        });
      }

      // Return current trivia state (without revealing correct answer)
      const currentQuestion = game.trivia.currentQuestion;
      return res.status(200).json({
        currentQuestion: currentQuestion ? {
          id: currentQuestion.id,
          question: currentQuestion.question,
          options: currentQuestion.options,
          category: currentQuestion.category,
          points: currentQuestion.points,
          difficulty: currentQuestion.difficulty,
          isAnswered: currentQuestion.isAnswered,
          answeredBy: currentQuestion.answeredBy,
          // Only include correctIndex if already answered
          ...(currentQuestion.isAnswered && { correctIndex: currentQuestion.correctIndex })
        } : null,
        nextQuestionAt: game.trivia.nextQuestionAt
      });
    } catch (error) {
      console.error('Error getting trivia state:', error);
      return res.status(500).json({ error: 'Failed to get trivia state' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
