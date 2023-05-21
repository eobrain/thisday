import { parse } from 'node-html-parser'

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

export async function thisDay (yearsAgo) {
  const now = new Date(Date.now())
  const year = now.getFullYear() - yearsAgo
  const monthString = now.toLocaleDateString('en-US', { month: 'short' })
  const month = now.getMonth()
  const day = now.getDate()

  const then = new Date(year, month, day)
  const weekdayString = then.toLocaleDateString('en-US', { weekday: 'long' })

  // const monthResponse = await fetch(`https://en.wikipedia.org/api/rest_v1/page/mobile-html/${monthString}_${year}`)
  const monthUrl = `https://en.m.wikipedia.org/wiki/${monthString}_${year}`
  const monthResponse = await fetch(monthUrl)
  if (monthResponse.status !== 200) {
    console.log(`Got status ${monthResponse.status} from ${monthUrl}`)
  } else {
    const monthHtml = await monthResponse.text()

    const monthRoot = parse(monthHtml)
    const ids = [
      `${monthString}_${day},_${year}_(${weekdayString})`,
      `${weekdayString},_${monthString}_${day},_${year}`
    ]
    const citations = []
    for (const id of ids) {
      const nephewSpan = monthRoot.getElementById(id)
      const citation = `${monthUrl}#${id}`
      citations.push(citation)
      if (!nephewSpan) {
        continue
      }
      const found = true
      const parent = nephewSpan.parentNode
      const section = parent.nextSibling
      const text = filter(section.innerText)

      return { found, text, then, citation }
    }
    console.log(`cannot find any of\n  ${citations.join('\n  ')}`)
  }

  const yearUrl = `https://en.m.wikipedia.org/wiki/${year}`
  const yearResponse = await fetch(yearUrl)
  if (yearResponse.status !== 200) {
    console.log(`Got status ${yearResponse.status} from ${yearUrl}`)
  } else {
    const yearHtml = await yearResponse.text()

    const yearRoot = parse(yearHtml)

    const pattern = `${monthString} ${day} . `
    const citation = yearUrl
    for (const li of yearRoot.querySelectorAll('li')) {
      if (li.innerText.match(pattern) && !li.innerText.match(/ \(d\. /)) {
        const found = true
        const text = li.innerText.slice(pattern.length)
        console.log(text)
        return { found, text, then, citation }
      }
    }
    console.log(`cannot find /${pattern}/ in ${citation}`)
  }
  return { found: false, then }
}
