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

  // const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/mobile-html/${monthString}_${year}`)
  const url = `https://en.m.wikipedia.org/wiki/${monthString}_${year}`
  const response = await fetch(url)
  const html = await response.text()

  const root = parse(html)
  const ids = [
    `${monthString}_${day},_${year}_(${weekdayString})`,
    `${weekdayString},_${monthString}_${day},_${year}`
  ]
  const citations = []
  for (const id of ids) {
    const nephewSpan = root.getElementById(id)
    const citation = `${url}#${id}`
    citations.push(citation)
    if (!nephewSpan) {
      continue
    }
    const parent = nephewSpan.parentNode
    const section = parent.nextSibling
    const found = true
    const text = filter(section.innerText)

    return { found, text, then, citation }
  }
  console.log(`cannot find any of "${citations.join('", "')}"`)
  return { found: false, then }
}
