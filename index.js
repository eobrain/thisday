import { thisDay } from './wikipedia.js'
import { addPersonality } from './llm.js'

async function thisDayBot (yearsAgo) {
  const { found, text, then, citation } = await thisDay(yearsAgo)
  if (found) {
    const longDateString = then.toLocaleDateString('en-US',
      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const headlines = await addPersonality(`On ${longDateString}, ${text}`)
    console.log(`${longDateString}:

${headlines}

${citation}`)
  }
}

thisDayBot(100)
