import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { topic, userGuidance = '' } = req.body

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' })
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' })
    }

    // Create the prompt for generating an opening paragraph
    const systemPrompt = `You are an experienced AA meeting facilitator writing opening paragraphs for group discussions. Your role is to create warm, inclusive, and thought-provoking introductions that help set the tone for meaningful sharing and reflection.

Guidelines:
- Keep the opening paragraph between 100-150 words
- Use inclusive, non-judgmental language
- Encourage personal reflection and sharing
- Reference the 12-step principles when appropriate
- Create a safe, supportive atmosphere
- Avoid being preachy or overly directive
- Focus on shared experience and hope`

    const userPrompt = `Create an opening paragraph for an AA meeting discussion on: "${topic.title}"

Topic Description: ${topic.description}

Discussion Questions to consider:
${topic.questions.map(q => `- ${q}`).join('\n')}

${userGuidance ? `Additional guidance from meeting facilitator: ${userGuidance}` : ''}

Please write a warm, engaging opening paragraph that a meeting facilitator could use to introduce this topic and encourage group participation.`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user", 
          content: userPrompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    })

    const generatedParagraph = completion.choices[0]?.message?.content?.trim()

    if (!generatedParagraph) {
      throw new Error('No content generated')
    }

    return res.status(200).json({
      success: true,
      paragraph: generatedParagraph,
      topic: topic.title
    })

  } catch (error) {
    console.error('OpenAI API Error:', error)
    
    // Return a more specific error message
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({ 
        error: 'OpenAI API quota exceeded. Please try again later.' 
      })
    }
    
    if (error.code === 'invalid_api_key') {
      return res.status(401).json({ 
        error: 'Invalid OpenAI API key configuration.' 
      })
    }

    return res.status(500).json({ 
      error: 'Failed to generate opening paragraph. Please try again.' 
    })
  }
}