/* G3 part three — the row with NO NAME (does its history line read "this
   event"?) and the day's pending-amendment panel, opened by its own chip. */
import { open, board, tap, type, put, shot, oilMode, publish } from './lib.mjs'
import { writeFileSync } from 'node:fs'

const di = 5
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
const R = {}

/* a ground row with times and a man, and NO NAME */
await tap(page, `[data-gradd="${di}"]`)
await page.waitForTimeout(400)
const gi = await page.evaluate(i => window.DAYS[i].ground.length - 1, di)
await type(page, `[data-bfld="gr:${di}.${gi}.str"]`, '08:00')
await type(page, `[data-bfld="gr:${di}.${gi}.end"]`, '12:00')
const free = await page.evaluate(() => [...document.querySelectorAll('#sbRoster .rpuck[data-person]')].map(e => e.dataset.person).slice(0, 40))
R.nameless = await put(page, `[data-fill="g:${di}.${gi}.+"]`, free)
R.ground = await page.evaluate(i => window.DAYS[i].ground.map(g => `${g.prog || '(no name)'}|${g.str}-${g.end}|${g.who}`), di)

R.pub = await publish(page, di)
await page.waitForTimeout(600)

await oilMode(page, true)
R.blankSwitch = await page.evaluate(() => {
  const root = document.querySelector('#schedBoard')
  return [...root.querySelectorAll('.oilitem')].filter(e => !(e.innerText || '').trim())
    .map(e => ({ live: !e.classList.contains('none'), title: e.getAttribute('title') || '', cls: String(e.className) }))
})
/* tap the blank one that IS a switch */
const blanks = page.locator('#schedBoard [data-oilitem][data-oilday]:visible')
const n = await blanks.count()
R.tappedBlank = false
for (let i = 0; i < n; i++) {
  const t = (await blanks.nth(i).innerText()).trim()
  if (!t) { await blanks.nth(i).scrollIntoViewIfNeeded().catch(() => {}); await blanks.nth(i).click({ force: true }); R.tappedBlank = true; await page.waitForTimeout(600); break }
}
/* and the man on it, by puck */
const manId = R.nameless && !String(R.nameless).startsWith('FAILED') ? R.nameless : null
if (manId) {
  const p = page.locator(`#schedBoard [data-oilp="${manId}"]:visible`).first()
  if (await p.count()) { await p.scrollIntoViewIfNeeded().catch(() => {}); await p.click({ force: true }); R.tappedMan = true; await page.waitForTimeout(500) }
}
await shot(page, 'G-G3-10-blank-named-row-in-mode')
await oilMode(page, false)
await page.waitForTimeout(600)

/* the pending chip, pressed */
R.pendingChip = await (async () => {
  const c = page.locator('#schedBoard').getByText(/\d+ pending/).first()
  if (!await c.count()) return { found: false }
  const t = (await c.innerText()).trim()
  await c.click({ force: true }).catch(() => {})
  await page.waitForTimeout(900)
  const panels = await page.evaluate(() => [...document.querySelectorAll('[role=dialog], .sheet, .hl-list, [class*=chg]')]
    .filter(e => e.offsetParent).map(e => (e.innerText || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 40)))
  await shot(page, 'G-G3-11-pending-panel')
  await page.keyboard.press('Escape').catch(() => {})
  return { found: true, text: t, panels }
})()

R.history = await (async () => {
  await page.locator('#sbHist').click().catch(() => {})
  await page.waitForTimeout(600)
  const open = page.locator('[data-histopen]:visible').first()
  const head = await open.count() ? (await open.innerText()).replace(/\n+/g, ' ').trim() : null
  if (await open.count()) { await open.click({ force: true }); await page.waitForTimeout(800) }
  return { head, lines: await page.evaluate(() => [...document.querySelectorAll('.hl-list')].filter(e => e.offsetParent)
    .flatMap(e => [...e.querySelectorAll('li')].map(li => (li.innerText || '').replace(/\s+/g, ' ').trim())).slice(0, 20)) }
})()

R.errors = errors.slice(0, 10)
writeFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/walk-g3c.json', JSON.stringify(R, null, 1))
console.log('nameless row person:', R.nameless)
console.log('ground rows:', JSON.stringify(R.ground))
console.log('blank switches in the mode:', JSON.stringify(R.blankSwitch))
console.log('tapped blank switch:', R.tappedBlank, ' tapped his puck:', !!R.tappedMan)
console.log('pending chip:', JSON.stringify(R.pendingChip, null, 1))
console.log('history head:', R.history.head)
R.history.lines.forEach(l => console.log('   | ' + l))
console.log('errors:', R.errors)
await browser.close()
