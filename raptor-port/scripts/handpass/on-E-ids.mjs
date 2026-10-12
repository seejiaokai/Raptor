import { launch, session } from './on-E-lib.mjs'
const b = await launch()
await session(b, 'Eids', async s => {
  const r = await s.page.evaluate(() => Object.entries(window.PEOPLE).map(([k, v]) => k + '=' + v.cs).join(' '))
  s.say('people', r)
})
await b.close()
