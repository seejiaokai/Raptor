// lwdl-walk-held4.mjs — walks a refused bid with a medical filed over its day since: Approve held (D1544). From the lw-decide-look walk of 28 Nov 26 ([LW-DECIDE-LOOK], his D2881); run from raptor-port/.
// D1544's case: a REFUSED bid with a medical filed over its day since — Approve held (Fable 12 · Astra 12)
import { run, signIn, press, place, cellState, readDecide, pic, T, sleep, closeBrowsers, gotoMonth, openCell, closeWin } from './lwdl-lib.mjs'
const anyWin = page => page.evaluate(() => ['bid-picker', 'daylist'].find(t => { const e = document.querySelector(`[data-testid="${t}"]`); return e && e.getBoundingClientRect().width > 0 }) || 'none')
await run('HELD4', ['desk', 'p402'], async S => {
  const page = S.page
  await signIn(S)
  const P = 'slipway', D = '2026-02-19'
  await place(page, P, [D], 'LL')
  await openCell(S, P, D); await press(S, T('decide-refuse')); await sleep(page, 700); await closeWin(S)
  S.note('refused: ' + await cellState(page, P, D))
  await page.evaluate(() => window.fileInput({ person: 'slipway', date: 'Feb 19', yr: 2026, type: 'OML', remarks: '', allday: true }))
  await sleep(page, 600); await gotoMonth(S, D)
  S.note('after a whole-day OML filed: ' + await cellState(page, P, D))
  await page.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center', inline: 'center' }), T(`cell-${P}-${D}`))
  await press(S, T(`cell-${P}-${D}`)); await sleep(page, 900)
  const w = await anyWin(page)
  const d = w === 'none' ? [] : await readDecide(page, T(w))
  const ap = d.find(b => /approve/.test(b.tid)), rf = d.find(b => /refuse/.test(b.tid))
  const title = ap ? await page.evaluate(t => document.querySelector(`[data-testid="${t}"]`)?.title, ap.tid) : null
  S.note(`window ${w}: ` + JSON.stringify(d.map(b => ({ t: b.words, cls: b.cls, dis: b.disabled, op: b.opacity, col: b.color, edge: b.edge, mark: b.mark?.color, cursor: b.cursor }))) + ` title "${title}"`)
  S.data.held = d
  if (!ap) { S.note('NOT WALKED: no Approve on the refused bid'); await pic(S, '0-no-approve', w === 'none' ? [] : [T(w)], { full: w === 'none' }); return }
  S.check(ap.disabled, 'Approve held: not pressable', ap.disabled)
  S.check(/lit/.test(rf.cls) && /dec-ring/.test(rf.cls), 'Refused lit and ringed beside it', rf.cls)
  S.note(`held Approve reads: opacity ${ap.opacity}, colour ${ap.color}, classes ${ap.cls}`)
  await pic(S, '1-held-refused', [T(w)])
  await pic(S, '1-held-refused-row', [`${T(w)} .bp-acts, ${T(w)} .dl-acts`], { pad: 10 })
  await page.locator(T(ap.tid)).click({ force: true }).catch(() => {}); await sleep(page, 500)
  S.check((await cellState(page, P, D)).includes('LL:r'), 'pressing the held Approve changes nothing', await cellState(page, P, D))
})
await closeBrowsers()
