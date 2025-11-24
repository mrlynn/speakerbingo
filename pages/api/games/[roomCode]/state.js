import clientPromise from '../../../../lib/mongodb'
import { getRandomQuestion, triviaConfig } from '../../../../lib/triviaQuestions'

export default async function handler(req, res) {
  const { roomCode } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({ error: 'MongoDB connection not configured. Please set MONGODB_URI environment variable.' })
    }

    const client = await clientPromise
    const db = client.db('bingo')
    const games = db.collection('games')

    let game = await games.findOne({
      roomCode: roomCode.toUpperCase()
    })

    if (!game) {
      return res.status(404).json({ error: 'Game not found' })
    }

    // Check and update trivia if needed (only for active multiplayer games)
    if (game.status === 'playing' && game.triviaEnabled !== false) {
      const now = new Date()
      const intervalMs = (game.triviaIntervalMinutes || triviaConfig.defaultIntervalMinutes) * 60 * 1000

      // Initialize trivia if not exists
      if (!game.trivia) {
        const newQuestion = getRandomQuestion([])
        await games.updateOne(
          { roomCode: roomCode.toUpperCase() },
          {
            $set: {
              trivia: {
                currentQuestion: {
                  ...newQuestion,
                  appearedAt: now,
                  isAnswered: false,
                  answeredBy: null
                },
                nextQuestionAt: new Date(now.getTime() + intervalMs),
                questionHistory: [],
                intervalMinutes: game.triviaIntervalMinutes || triviaConfig.defaultIntervalMinutes
              }
            }
          }
        )
        // Refresh game object
        game = await games.findOne({ roomCode: roomCode.toUpperCase() })
      }
      // Check if it's time for a new question
      else if (game.trivia.nextQuestionAt) {
        const nextQuestionAt = new Date(game.trivia.nextQuestionAt)
        const currentAnswered = game.trivia.currentQuestion?.isAnswered

        if (now >= nextQuestionAt && currentAnswered) {
          const usedQuestionIds = (game.trivia.questionHistory || []).map(q => q.questionId)
          const newQuestion = getRandomQuestion(usedQuestionIds)

          await games.updateOne(
            { roomCode: roomCode.toUpperCase() },
            {
              $set: {
                'trivia.currentQuestion': {
                  ...newQuestion,
                  appearedAt: now,
                  isAnswered: false,
                  answeredBy: null
                },
                'trivia.nextQuestionAt': new Date(now.getTime() + intervalMs)
              }
            }
          )
          // Refresh game object
          game = await games.findOne({ roomCode: roomCode.toUpperCase() })
        }
      }

      // Sanitize trivia response - don't send correctIndex unless answered
      if (game.trivia?.currentQuestion && !game.trivia.currentQuestion.isAnswered) {
        const { correctIndex, ...safeQuestion } = game.trivia.currentQuestion
        game = {
          ...game,
          trivia: {
            ...game.trivia,
            currentQuestion: safeQuestion
          }
        }
      }
    }

    res.status(200).json({ game })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to get game state' })
  }
}