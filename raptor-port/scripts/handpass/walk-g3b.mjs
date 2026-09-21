/* G3 follow-up — the same eleven gestures, then the change history read
   properly (.hl-list) and the day's pending-amendment indicator hunted for by
   wording rather than by a guessed class. */
import { open, board, shot, oilMode, publish } from './lib.mjs'
import { writeFileSync } from 'node:fs'

const di = 5
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
const R = {}

const pendingLook = () => page.evaluate(() => {
  const root = document.querySelector('#schedBoard')
  const out = []
  for (const e of root.querySelectorAll('*')) {
    if (!e.offsetParent) continue
    if (e.children.length) continue
    const t = (e.innerText || '').replace(/\s+/g, ' ').trim()
    if (!t || t.length > 90) continue
    if (/change|amend|AL\d|pending|Original|working copy|ORIG/i.test(t)) out.push(t)
  }
  return [...new Set(out)]
})

R.pendingBeforePublish = await pendingLook()
R.pub = await publish(page, di)
await page.waitForTimeout(700)
R.pendingAtPublish = await pendingLook()
await shot(page, 'G-G3-06-published-no-gestures')

await oilMode(page, true)
const ID = await page.evaluate(() => { const o = {}; for (const [k, v] of Object.entries(window.PEOPLE)) o[v.cs] = k; return o })
const tapPuck = async (who) => {
  const el = page.locator(`#schedBoard [data-oilp="${who}"]:visible`).first()
  if (!await el.count()) return false
  await el.scrollIntoViewIfNeeded().catch(() => {})
  await el.click({ force: true }); await page.waitForTimeout(320); return true
}
R.taps = {}
for (const [label, cs] of [['flying line', 'Ranger'], ['SC shift', 'Piston'], ['duty desk', 'Fable'],
  ['sim', 'Cinch'], ['ground row', 'Saber'], ['family day', 'Ace'], ['overseas duty', 'Sidewinder'], ['training claim', 'Talisman']]) {
  R.taps[label] = await tapPuck(ID[cs])
}
/* the blank-named switch */
const all = page.locator('#schedBoard [data-oilitem][data-oilday]:visible')
const n = await all.count()
for (let i = 0; i < n; i++) {
  const t = (await all.nth(i).innerText()).trim()
  if (!t || t === '\u00a0') { await all.nth(i).scrollIntoViewIfNeeded().catch(() => {}); await all.nth(i).click({ force: true }); R.taps['blank-named row'] = true; await page.waitForTimeout(400); break }
}
const blank = page.locator('#schedBoard [data-oilblank]:visible').first()
await blank.click(); await page.waitForTimeout(600); R.taps['blanket on'] = true
await blank.click(); await page.waitForTimeout(600); R.taps['blanket off'] = true
await oilMode(page, false)
await page.waitForTimeout(700)

R.pendingAfter = await pendingLook()
await shot(page, 'G-G3-07-after-eleven-gestures')

/* the amendment panel — whatever the board offers that lists the day's changes */
R.panel = await (async () => {
  const cand = page.locator('#schedBoard').getByText(/view all changes|changes? ·|\d+ changes?/i).first()
  if (!await cand.count()) return { entry: null }
  const entry = (await cand.innerText()).replace(/\n+/g, ' ').trim()
  await cand.click({ force: true }).catch(() => {})
  await page.waitForTimeout(900)
  const txt = await page.evaluate(() => {
    const p = [...document.querySelectorAll('[role=dialog], .sheet, .hl-list, [class*=chg], [class*=alp]')].filter(e => e.offsetParent)
    return p.map(e => (e.innerText || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 45))
  })
  await shot(page, 'G-G3-08-changes-panel')
  await page.keyboard.press('Escape').catch(() => {})
  return { entry, panels: txt }
})()

/* the change history itself */
R.history = await (async () => {
  await page.locator('#sbHist').click().catch(() => {})
  await page.waitForTimeout(700)
  const open = page.locator('[data-histopen]:visible').first()
  const head = await open.count() ? (await open.innerText()).replace(/\n+/g, ' ').trim() : null
  if (await open.count()) { await open.click({ force: true }); await page.waitForTimeout(900) }
  const lines = await page.evaluate(() => {
    const l = [...document.querySelectorAll('.hl-list')].filter(e => e.offsetParent)
    return l.flatMap(e => [...e.querySelectorAll('li')].map(li => (li.innerText || '').replace(/\s+/g, ' ').trim())).slice(0, 60)
  })
  await shot(page, 'G-G3-09-history-open')
  return { head, lines }
})()

R.errors = errors.slice(0, 10)
writeFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/walk-g3b.json', JSON.stringify(R, null, 1))
console.log('taps:', JSON.stringify(R.taps))
console.log('publish:', JSON.stringify(R.pub))
console.log('pending wording BEFORE publish:', JSON.stringify(R.pendingBeforePublish))
console.log('pending wording AT publish:', JSON.stringify(R.pendingAtPublish))
console.log('pending wording AFTER 11 gestures:', JSON.stringify(R.pendingAfter))
console.log('panel entry:', JSON.stringify(R.panel.entry))
;(R.panel.panels || []).forEach(p => console.log('  panel: ' + JSON.stringify(p)))
console.log('history head:', R.history.head)
R.history.lines.forEach(l => console.log('   | ' + l))
console.log('errors:', R.errors)
await browser.close()
