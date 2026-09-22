/* JOB 5's UNDO BOUNDARY (22 Sep 26), on its own.
   The rule: opening the mode marks where Undo stood; inside, it walks back OIL
   decisions freely down to that mark; the press that would reach PAST it leaves
   the mode instead and SAYS SO; the press after that behaves normally, outside.
   So a schedule change must be sitting behind the mark before the mode opens. */
import { open, board, tap, shot, SHOTS } from './lib.mjs'
const { browser, page, errors } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
const L = []; const S = (k, v) => { L.push({ [k]: v }); return v }
const toasts = []
await page.exposeFunction('__hpToast', t => toasts.push(t)).catch(() => {})
const st = async () => await page.evaluate(() => {
  const d = ((window.DAYS[window.SBDAY] || {}).oild) || {}
  const g = ((window.DAYS[window.SBDAY] || {}).ground || [])
  return {
    modeOpen: !!document.querySelector('#schedBoard [data-oilitem]'),
    oilDecisions: Object.keys(d.items || {}).length + Object.keys(d.people || {}).length,
    flaggedRows: g.filter(r => r.flag).length,
  }
})
await board(page, 5)
S('at the start', await st())

/* ---- A. a real SCHEDULE change, through the row's own flag control ----- */
await tap(page, '[data-grflag="5.4"]'); await page.waitForTimeout(700)
S('after flagging a ground row (outside the mode)', await st())

/* ---- B. open the mode — this is where the mark is set ------------------ */
await tap(page, '#sbOil'); await page.waitForTimeout(800)
const items = await page.evaluate(() => [...new Set([...document.querySelectorAll('#schedBoard [data-oilitem]')].map(e => e.getAttribute('data-oilitem')))].slice(0, 2))
for (const it of items) { await tap(page, `[data-oilitem="${it}"]`); await page.waitForTimeout(550) }
S('two OIL decisions inside the mode', await st())
await shot(page, 'j5u-01-two-decisions')

/* ---- C. four presses of Undo ------------------------------------------ */
for (let i = 1; i <= 4; i++) {
  /* THE REAL BUTTON. window.undo() calls globalUndo() straight and SKIPS the
     boundary, which lives in #undoBtn's own handler (Shell.tsx) — driving the
     hook reports a defect that does not exist. Press what a person presses. */
  /* THE BOARD'S OWN Undo — #sbUndo. The page's #undoBtn is covered by the
     board's sticky top bar whenever the board is open, and the board is the
     only place the mode exists, so #sbUndo is the button a person presses. */
  await tap(page, '#sbUndo'); await page.waitForTimeout(750)
  const s = await st()
  s.says = await page.evaluate(() => {
    /* the toast is #toastEl — it is FADED, never removed, so read its opacity
       as well as its words, or a stale message reads as a fresh one */
    const t = document.getElementById('toastEl')
    if (!t) return 'NO TOAST ELEMENT'
    return ((t.innerText || '').replace(/\s+/g, ' ').trim() + '  [opacity ' + getComputedStyle(t).opacity + ']').slice(0, 150)
  })
  S(`undo #${i}`, s)
  await shot(page, 'j5u-02-undo' + i)
}
console.log(JSON.stringify(L, null, 1)); console.log('errors:', errors.slice(0, 5))
console.log('shots in ' + SHOTS)
await browser.close()
