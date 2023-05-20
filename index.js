import { thisDay } from './wikipedia.js'
import {addPersonality } from './llm.js'

async function thisDayBot (yearsAgo) {
  const { found, text, then, weekdayString } = await thisDay(yearsAgo)
  if (found) {
    const headlines = await addPersonality(text)
    console.log({ text, then, weekdayString, headlines })
  }
}

thisDayBot(100)
