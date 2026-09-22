/* D5 — the issued face must not show a request filed after the day went out. */
import { open, board, shot, go } from './lib.mjs'
import { warCells, publishAL, PUB_STATE } from './cd-lib.mjs'
import { fileInputFromBoard } from './fixture.mjs'

const di = 5, SAT = '2026-07-18'
const say = (...a) => console.log(...a)
const satCard = p => p.evaluate(() => {
  const cards = [...document.querySelectorAll('.day')].filter(e => e.offsetParent)
  const c = cards.find(e => /Sat|18 Jul|Jul 18/i.test((e.innerText || '').slice(0, 120)))
  return c ? (c.innerText || '').replace(/\s+/g, ' ') : null
})

const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)
const r = await fileInputFromBoard(page, di, { person: 'dj', type: 'Training', st: '08:00', en: '17:00', oil: 'yes' })
say('filed a Training for Ace on the published Saturday:', JSON.stringify(r))
await page.waitForTimeout(800)

await go(page, 'viewsched'); await page.waitForTimeout(1200)
const txt = await satCard(page)
say('the ISSUED Saturday card mentions Ace?', txt ? /Ace/.test(txt) : 'no card found')
say('   ... and TRAINING?', txt ? /TRAINING/i.test(txt) : '-')
say('   card head:', (txt || '').slice(0, 260))
await shot(page, 'CD-D5-06-issued-card-before')

await go(page, 'editsched'); await page.waitForTimeout(500)
const wk = await page.evaluate(() => {
  const cards = [...document.querySelectorAll('#eWeek .day')].filter(e => e.offsetParent)
  const c = cards.find(e => /Sat|18 Jul|Jul 18/i.test((e.innerText || '').slice(0, 120)))
  return c ? (c.innerText || '').replace(/\s+/g, ' ') : null
})
say('the WORKING week card mentions Ace?', wk ? /Ace/.test(wk) : 'no card')
say('   ... and TRAINING?', wk ? /TRAINING/i.test(wk) : '-')
await shot(page, 'CD-D5-07-working-card-before')
say('WAR before the amendment:', JSON.stringify((await warCells(page, [['dj', SAT]])).map(c => c.text)))

await board(page, di)
const p = await publishAL(page, di)
say('PUBLISH:', p.label)
await go(page, 'viewsched'); await page.waitForTimeout(1200)
const txt2 = await satCard(page)
say('the ISSUED card after the amendment mentions Ace?', txt2 ? /Ace/.test(txt2) : 'no card')
await shot(page, 'CD-D5-08-issued-card-after')
say('WAR after the amendment:', JSON.stringify((await warCells(page, [['dj', SAT]])).map(c => c.text)))
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
