import { Configuration, OpenAIApi } from 'openai'
import { pp } from 'passprint'

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

export async function addPersonality (longDateString, yearsAgo, text, lang) {
  const content = pp(({
    en: `
    Pretend it is ${yearsAgo} years ago, and the date is ${longDateString}.
    You have the sensibilities of someone who was living  ${yearsAgo} years ago.
    You do not know the future, that is, you do not know anything later than ${longDateString}.

    Here are some events that happened today, ${longDateString},
    which you should rewrite in the style of ${STYLE}:
  
    ${text}
    
    `,
    fr: `
    Imaginez qu'il y a ${yearsAgo} ans, et que la date est le ${longDateString}.
    Vous avez la sensibilité de quelqu'un qui vivait il y a ${yearsAgo} ans.
    Vous ne connaissez pas l'avenir, c'est-à-dire que vous ne savez rien après le ${longDateString}.

    Voici quelques événements qui se sont produits aujourd'hui, ${longDateString},
    que vous devriez réécrire dans le style des titres ${PUBLICATION}:
  
    ${text}
    
    `
  })[lang])

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{
        role: 'user',
        content
      }]
    })
    return completion.data.choices[0].message.content
  } catch (error) {
    if (error.response) {
      throw new Error(`${error.response.status}: ${error.response.data}`)
    } else {
      throw new Error(error.message)
    }
  }
}
