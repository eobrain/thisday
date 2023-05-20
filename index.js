import { thisDay } from './wikipedia.js'

for (let i = 10; i < 1000; i += 10) {
  console.log({ i })
  const { found, text, then, weekdayString } = await thisDay(i)
  if (found) {
    console.log({ text, then, weekdayString })
  }
}
