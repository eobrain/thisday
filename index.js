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

async function thisDayBot (yearsAgo, lang) {
  const region = ({ en: 'US', fr: 'FR' })[lang]
  const locale = lang + '-' + region

  const { found, text, then, citation } = await thisDay(yearsAgo, lang, locale)
  if (found) {
    const longDateString = then.toLocaleDateString(locale,
      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const headlines = await addPersonality(`${longDateString}, ${text}`, lang)
    const intro = ({
      en: `This day, ${yearsAgo} years ago…`,
      fr: `Aujourd'hui, il y a ${yearsAgo} ans…`
    })[lang]
    const postMinusCitation = intro + '\n\n' + headlines
    const post = truncate(postMinusCitation, MAX_POST - 2 - URL_COUNT) + '\n\n' + citation
    console.log(post)

    toot(post)
  }
}

if (process.argv.length <= 3) {
  console.log('Missing arguments:   yearsAgo language')
} else {
  thisDayBot(process.argv[2], process.argv[3])
}
