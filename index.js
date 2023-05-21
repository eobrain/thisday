import { thisDay } from './wikipedia.js'
import { addPersonality } from './llm.js'
import { toot } from './mastodon.js'

const MAX_POST = 500
const URL_COUNT = 23

function truncate (text, max) {
  if (text.length <= max) {
    return text
  }
  return text.slice(0, max - 1) + '…'
}

async function thisDayBot (yearsAgo) {
  const { found, text, then, citation } = await thisDay(yearsAgo)
  if (found) {
    const longDateString = then.toLocaleDateString('en-US',
      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const headlines = await addPersonality(`On ${longDateString}, ${text}`)
    const postMinusCitation = longDateString + ':\n\n' + headlines
    const post = truncate(postMinusCitation, MAX_POST - 2 - URL_COUNT) + '\n\n' + citation
    console.log(post)
    toot(post)
  }
}

thisDayBot(100)
