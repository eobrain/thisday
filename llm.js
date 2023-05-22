import { Configuration, OpenAIApi } from 'openai'
//  import { pp } from 'passprint'

const STYLE = 'supermarket tabloid headlines'
// const STYLE = 'a viral Twitter post'

// const PUBLICATION = "d'un magazine comme Closer"
// const PUBLICATION = 'du Canard enchainé'
// const PUBLICATION = 'de journaux populaires'
const PUBLICATION = "de première page d'un journal populaire"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(configuration)

export async function addPersonality (text, lang) {
  const content = ({
    en: `
    Rewrite the following text in the style of ${STYLE}:
  
    ${text}
    
    `,
    fr: `
    Réécrivez le texte suivant dans le style des titres ${PUBLICATION}:
  
    ${text}
    
    `
  })[lang]

  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{
      role: 'user',
      content
    }]
  })
  return completion.data.choices[0].message.content
}
