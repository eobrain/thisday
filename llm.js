import { Configuration, OpenAIApi } from 'openai'
import { pp } from 'passprint'

const MAX_MODEL_TOKENS = 4000
const MAX_POST_CHARS = 450
const MAX_POST_TOKENS = Math.round(MAX_POST_CHARS / 4)
const MAX_PROMPT_TOKENS = MAX_MODEL_TOKENS - MAX_POST_TOKENS
const MAX_PROMPT_CHARS = MAX_PROMPT_TOKENS * 4

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(configuration)

export async function addPersonality (text) {
  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{
      role: 'user',
      content: `
  Rewrite the following text in the style of supermarket tabloid headlines:

  ${text}
  
  `
    }]
  })
  return completion.data.choices[0].message
}
