/* JOB 5 (22 Sep 26) — the mode is genuinely read-only, and Undo stops at its
   door.  The boundary, in the commit's own words: opening the mode marks where
   Undo stood; inside, it walks back OIL decisions freely down to that mark; the
   press that would reach PAST it leaves the mode instead and says so; the press
   after that behaves normally, outside. */
import { open, board, openInputs, tap, shot, SHOTS } from './lib.mjs'
const { browser, page, errors } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
const L = []; const S = (k, v) => { L.push({ [k]: v }); return v }
const modeOn = () => page.evaluate(() => !!document.querySelector('#schedBoard [data-oilitem]'))
const decided = () => page.evaluate(() => { const d = ((window.DAYS[window.SBDAY] || {}).oild) || {}
  return { people: Object.keys(d.people || {}).length, items: Object.keys(d.items || {}).length, blanket: !!d.blanket } })
const grndRows = () => page.evaluate(() => ((window.DAYS[window.SBDAY] || {}).ground || []).length)

await board(page, 5)

/* ---- A. a SCHEDULE change first, made OUTSIDE the mode ---------------- */
const g0 = await grndRows()
await page.evaluate(() => { const b = [...document.querySelectorAll('#schedBoard [data-gadd], #schedBoard button')].find(e => /\+ Item/.test(e.innerText || '')); b && b.click() })
await page.waitForTimeout(800)
S('a ground row added outside the mode', { before: g0, after: await grndRows() })

/* ---- B. the mode, and whether it is really shut ----------------------- */
await tap(page, '#sbOil'); await page.waitForTimeout(800)
await shot(page, 'j5-01-mode-on')
S('the claim rows, inside the mode', await page.evaluate(() => {
  const rows = [...document.querySelectorAll('#schedBoard .pinp .sb-arow, #schedBoard .unav .sb-arow, #schedBoard .sbi-row')].filter(e => e.offsetParent)
  return rows.slice(0, 4).map(r => ({
    txt: (r.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40),
    boxes: [...r.querySelectorAll('input,[contenteditable]')].map(b => b.disabled === true || b.getAttribute('contenteditable') === 'false' ? 'SHUT' : 'OPEN'),
    acceptCtl: !!r.querySelector('[data-iacc], .lctl button'),
    lateIsButton: !!r.querySelector('button[data-ilate], .latechip button'),
    switchLive: !!r.querySelector('[data-oilitem]'),
  }))
}))

/* ---- C. two OIL decisions, then Undo three times ---------------------- */
const items = await page.evaluate(() => [...new Set([...document.querySelectorAll('#schedBoard [data-oilitem]')].map(e => e.getAttribute('data-oilitem')))].slice(0, 2))
S('items tapped', items)
for (const it of items) { await tap(page, `[data-oilitem="${it}"]`); await page.waitForTimeout(600); S('after tapping ' + it, await decided()) }
S('decisions made inside the mode', await decided())
await shot(page, 'j5-02-two-decisions')

for (let i = 1; i <= 4; i++) {
  await page.evaluate(() => window.undo())
  await page.waitForTimeout(700)
  S(`undo #${i}`, { modeStillOpen: await modeOn(), oilDecisions: await decided(), groundRows: await grndRows() })
  await shot(page, 'j5-03-undo' + i)
}
console.log(JSON.stringify(L, null, 1)); console.log('errors:', errors.slice(0, 5))
console.log('shots in ' + SHOTS)
await browser.close()
