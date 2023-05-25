import { parse } from 'node-html-parser'
// import { pp } from 'passprint'

function filter (text) {
  const lines = text.split('\n')
  const out = []
  let on = true
  for (const line of lines) {
    if (line.match(/Born:/)) {
      on = false
    }
    if (line.match(/Died:/)) {
      on = true
    }
    if (on) {
      out.push(line.replaceAll(/\[[0-9]+\]/g, ''))
    }
  }
  return out.join('\n')
}

function pruneDom ($monthRoot) {

}

function taillerDom ($monthRoot) {
  const $span = $monthRoot.getElementById('Naissances')
  if (!$span) {
    return
  }
  const $ul = $span.parentNode.nextElementSibling.nextElementSibling
  $ul.parentNode.removeChild($ul)
}

function findElementInMonthArticle ($monthRoot, monthUrl, monthString, day, year, weekdayString) {
  const ids = [
    `${monthString}_${day},_${year}_(${weekdayString})`,
    `${weekdayString},_${monthString}_${day},_${year}`
  ]
  const citations = []
  for (const id of ids) {
    const $nephewSpan = $monthRoot.getElementById(id)
    const citation = `${monthUrl}#${id}`
    citations.push(citation)
    if (!$nephewSpan) {
      continue
    }
    const $parent = $nephewSpan.parentNode
    const $theElement = $parent.nextSibling

    return { found: true, $theElement, citation }
  }
  console.log(`cannot find any of\n  ${citations.join('\n  ')}`)
  return { found: false }
}

function trouverElementDansArticleDuMois ($monthRoot, monthUrl, monthString, day, year, weekdayString) {
  const css = `li a[title="${day} ${monthString}"]`
  const $a = $monthRoot.querySelector(css)
  if (!$a) {
    console.log(`${css} not found in ${monthUrl}`)
    return { found: false }
  }
  const $theElement = $a.parentNode
  return { found: true, $theElement, citation: monthUrl }
}

export async function thisDay (yearsAgo, lang, locale) {
  const now = new Date(Date.now())
  const year = now.getFullYear() - yearsAgo
  const monthString = now.toLocaleDateString(locale, { month: 'long' })

  const month = now.getMonth()
  const day = now.getDate()

  const then = new Date(year, month, day)
  const weekdayString = then.toLocaleDateString(locale, { weekday: 'long' })

  const monthUrl = ({
    en: `https://en.m.wikipedia.org/wiki/${monthString}_${year}`,
    fr: `https://fr.wikipedia.org/wiki/${monthString}_${year}`
  })[lang]
  const monthResponse = await fetch(monthUrl)
  if (monthResponse.status !== 200) {
    console.log(`Got status ${monthResponse.status} from ${monthUrl}`)
  } else {
    const monthHtml = await monthResponse.text()

    const $monthRoot = parse(monthHtml)

    const prune = ({
      en: pruneDom,
      fr: taillerDom
    })[lang]
    prune($monthRoot)

    const findElement = ({
      en: findElementInMonthArticle,
      fr: trouverElementDansArticleDuMois
    })[lang]
    const { found, $theElement, citation } = findElement($monthRoot, monthUrl, monthString, day, year, weekdayString)
    if (found) {
      const text = filter($theElement.innerText)
      console.log(text)
      return { found, text, then, citation }
    }
  }

  const yearUrl = ({
    en: `https://en.m.wikipedia.org/wiki/${year}`,
    fr: `https://fr.wikipedia.org/wiki/${year}`
  })[lang]
  const yearResponse = await fetch(yearUrl)
  if (yearResponse.status !== 200) {
    console.log(`Got status ${yearResponse.status} from ${yearUrl}`)
  } else {
    const yearHtml = await yearResponse.text()

    const yearRoot = parse(yearHtml)

    const dayPatt = (lang === 'fr' && day === 1) ? '1er' : day

    const pattern = new RegExp(({
      en: `^${monthString}\\s${day}\\s.\\s`,
      fr: `^${dayPatt}\\s${monthString}\\s?[:,]\\s`
    })[lang], 'i')

    const citation = yearUrl
    for (const li of yearRoot.querySelectorAll('li')) {
      if (li.innerText.match(pattern) && !li.innerText.match(/ \([d†]\.? /)) {
        const found = true
        const text = li.innerText.replace(pattern, '')
        console.log(text)
        return { found, text, then, citation }
      }
    }
    console.log(`cannot find ${pattern} in ${citation}`)
  }
  return { found: false, then }
}
