/* G3 (Fable S38) — eleven OIL gestures in one sitting on a published day, then
   what the day's change history and the amendment panel say about them. */
import { open, board, tap, type, put, shot, oilMode, publish, readDay } from './lib.mjs'
import { writeFileSync } from 'node:fs'

const di = 5
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
const R = { steps: [] }

/* a row with NO NAME that can still earn — added through the board first */
await tap(page, `[data-gradd="${di}"]`)
await page.waitForTimeout(400)
const gi = await page.evaluate(i => window.DAYS[i].ground.length - 1, di)
await type(page, `[data-bfld="gr:${di}.${gi}.str"]`, '08:00')
await type(page, `[data-bfld="gr:${di}.${gi}.end"]`, '12:00')
R.namelessRow = await put(page, `[data-fill="g:${di}.${gi}.+"]`, ['bolt', 'zap', 'flint', 'lumen'])

R.pub = await publish(page, di)
await page.waitForTimeout(600)
R.pending0 = await page.evaluate(() => ((document.querySelector('#schedBoard') || {}).innerText || '').match(/\d+ changes?|No changes/g) || [])

await oilMode(page, true)

/* helper: tap one puck by person id, on a given item kind, and record the toast */
const toast = async () => page.evaluate(() => {
  const t = [...document.querySelectorAll('.snack, .toast, [class*=snack], [class*=toast]')].filter(e => e.offsetParent)
  return t.map(e => (e.innerText || '').replace(/\n+/g, ' ').trim()).slice(0, 2)
})
const tapPuck = async (label, who) => {
  const el = page.locator(`#schedBoard [data-oilp="${who}"]:visible`).first()
  const n = await page.locator(`#schedBoard [data-oilp="${who}"]:visible`).count()
  if (!n) { R.steps.push({ label, who, done: false, why: 'no tappable puck for this man' }); return }
  await el.scrollIntoViewIfNeeded().catch(() => {})
  const t0 = (await el.getAttribute('title')) || ''
  await el.click({ force: true })
  await page.waitForTimeout(500)
  const t1 = await page.locator(`#schedBoard [data-oilp="${who}"]:visible`).first().getAttribute('title').catch(() => null)
  R.steps.push({ label, who, done: true, copies: n, before: t0, after: t1, toast: await toast() })
}
const tapItem = async (label, match) => {
  const all = page.locator('#schedBoard [data-oilitem][data-oilday]:visible')
  const n = await all.count()
  for (let i = 0; i < n; i++) {
    const t = (await all.nth(i).innerText()).trim()
    if (match(t)) {
      await all.nth(i).scrollIntoViewIfNeeded().catch(() => {})
      const b = await all.nth(i).getAttribute('title')
      await all.nth(i).click({ force: true })
      await page.waitForTimeout(500)
      R.steps.push({ label, name: t || '(blank)', done: true, before: b, toast: await toast() })
      return
    }
  }
  R.steps.push({ label, done: false, why: 'no switch matched' })
}

/* the people, by the callsign the board shows */
const ID = await page.evaluate(() => { const o = {}; for (const [k, v] of Object.entries(window.PEOPLE)) o[v.cs] = k; return o })
await tapPuck('1. off a flying line (VIPER)', ID.Ranger)
await tapPuck('2. off an SC shift (SC MAIN)', ID.Piston)
await tapPuck('3. off a duty desk (SDO)', ID.Fable)
await tapPuck('4. off a sim (OFT EP-6)', ID.Cinch)
await tapPuck('5. off a ground row (OCU REVIEW)', ID.Saber)
await tapPuck('6. off the family day (opened sentinel)', ID.Ace)
await tapPuck('7. off his overseas duty (Unavailable)', ID.Sidewinder)
await tapPuck('8. off his Training (Personal Inputs)', ID.Talisman)
await tapItem('9. a row with an EMPTY name', t => t === '' || t === '\u00a0')
await shot(page, 'G-G3-01-after-eight-taps')

/* 10 + 11: the day blanket on, then off */
const blank = page.locator('#schedBoard [data-oilblank]:visible').first()
await blank.click(); await page.waitForTimeout(700)
R.steps.push({ label: '10. Nothing today earns — ON', toast: await toast(), note: await page.evaluate(() => ((document.querySelector('#schedBoard .daybar-note') || {}).innerText || '')) })
await shot(page, 'G-G3-02-blanket-on')
await blank.click(); await page.waitForTimeout(700)
R.steps.push({ label: '11. Nothing today earns — OFF', toast: await toast(), note: await page.evaluate(() => ((document.querySelector('#schedBoard .daybar-note') || {}).innerText || '')) })

await oilMode(page, false)
await page.waitForTimeout(600)
await shot(page, 'G-G3-03-done')

/* the day's pending chip and the amendment panel */
R.pending = await page.evaluate(() => {
  const root = document.querySelector('#schedBoard')
  const txt = (root.innerText || '')
  const chips = [...root.querySelectorAll('button, span, a')].filter(e => e.offsetParent && /change/i.test(e.innerText || '') && (e.innerText || '').length < 40)
    .map(e => ({ t: e.innerText.replace(/\n+/g, ' ').trim(), cls: String(e.className).slice(0, 34) }))
  return { chips, hits: txt.match(/\d+ changes?|No changes yet/g) || [] }
})
R.alPanel = await (async () => {
  const b = page.locator('#schedBoard').getByText(/view all changes|\d+ changes?/i).first()
  if (!await b.count()) return { found: false }
  await b.click({ force: true }).catch(() => {})
  await page.waitForTimeout(800)
  const txt = await page.evaluate(() => {
    const p = [...document.querySelectorAll('[role=dialog], .sheet, .alpanel, [class*=chglist], [class*=alpan]')].filter(e => e.offsetParent)
    return p.map(e => (e.innerText || '').replace(/\n{2,}/g, '\n').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 40))
  })
  await shot(page, 'G-G3-04-amendment-panel')
  return { found: true, panels: txt }
})()
await page.keyboard.press('Escape').catch(() => {})
await page.waitForTimeout(400)

/* the day's change history */
R.history = await (async () => {
  await page.locator('#sbHist').click().catch(() => {})
  await page.waitForTimeout(600)
  const open = page.locator('#schedBoard [data-histopen]:visible, #sbWarn [data-histopen]').first()
  let head = null
  if (await open.count()) { head = (await open.innerText()).replace(/\n+/g, ' ').trim(); await open.click({ force: true }); await page.waitForTimeout(800) }
  const lines = await page.evaluate(() => {
    const p = [...document.querySelectorAll('.histlist, [class*=histlist], [role=dialog], .sheet')].filter(e => e.offsetParent)
    const best = p.sort((a, b) => (b.innerText || '').length - (a.innerText || '').length)[0]
    return best ? (best.innerText || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 60) : []
  })
  await shot(page, 'G-G3-05-history-list')
  return { head, lines }
})()

R.errors = errors.slice(0, 10)
writeFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/walk-g3.json', JSON.stringify(R, null, 1))
console.log('nameless row:', R.namelessRow, ' publish:', JSON.stringify(R.pub), ' pending at publish:', JSON.stringify(R.pending0))
console.log('=== THE ELEVEN GESTURES ===')
R.steps.forEach(s => console.log('  ' + JSON.stringify(s)))
console.log('=== PENDING CHIP ===', JSON.stringify(R.pending))
console.log('=== AMENDMENT PANEL ==='); (R.alPanel.panels || []).forEach(p => console.log('  ' + JSON.stringify(p)))
console.log('=== HISTORY ==='); console.log('  head: ' + R.history.head); R.history.lines.forEach(l => console.log('   | ' + l))
console.log('errors:', R.errors)
await browser.close()
