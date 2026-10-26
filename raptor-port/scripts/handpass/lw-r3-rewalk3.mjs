// Round 3's check — the re-walk of the narrow read's three fixes (N1–N3, 24 Oct 26), on a frozen build at LW_PORT, his
// iPhone's size by real touch over CDP (a picture ~100 ms after each lift — D1281) and a desktop (1440×900).
// N1: the calendar closed over another day's armed Delete leaves nothing armed; this day's Delete asks for its own award.
// N2: words typed on a waiting bid, then an award given through the ⋯: one Undo takes the award, the words stay.
// N3: the day's list keeps Refuse in its place on a refused bid, pressed; a second quick tap changes nothing.
// Usage: LW_PORT=4344 LW_OUT=2026-10-24-lw-r3/rewalk3 node lw-r3-rewalk3.mjs
import * as L from './lw-r3-lib.mjs'
import path from 'node:path'
import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
mkdirSync(L.OUT, { recursive: true })
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png')) unlinkSync(path.join(L.OUT, f))
const T = L.T
const setSwitch = async (w, on) => { const s = w.page.locator(T('bid-approve-tick')); if (!(await s.count())) return null; if (((await s.getAttribute('aria-checked')) === 'true') !== on) { await L.press(w, T('bid-approve-tick')); await w.page.waitForTimeout(250) } return (await s.getAttribute('aria-checked')) === 'true' }
const awardText = async (w, who, iso) => ((await L.cellInfo(w.page, who, iso))?.text || '').replace(/\s+/g, ' ')
async function giveAward(w, who, iso, days) {
  await L.openCellR(w, who, iso)
  await L.press(w, T('bid-more')); await L.press(w, T('bid-oil'))
  await w.page.locator(T('oil-why')).fill('Re-walk award'); await w.page.locator(T('oil-given-by')).fill('OC')
  if (await L.vis(w.page, T('oil-days'))) await w.page.locator(T('oil-days')).fill(String(days))
  await L.press(w, T('oil-give')); await w.page.waitForTimeout(500)
  await L.closeAny(w)
}

for (const size of ['phone', 'desk']) {
  const w = await L.newCtx(size)
  w.tag = size
  const P = w.page, tg = size
  const q = n => (w.phone ? `${n}-${tg}-q` : null)
  await L.signInPlain(w, 'admin')
  const ids = await P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))
  const who = ids.Drifter
  const sc = async (id, fn) => { try { await fn() } catch (e) { L.rec(`${id} — the script could not act`, w.tag, 'NOT WALKED', String(e).slice(0, 260), []); await L.closeAny(w) } }

  /* N1 — awards on 24 and 26 Nov; 26 Nov's window, Pick a range, 24 Nov, Delete (asks for 24 Nov's award), the calendar
     closed: nothing is left armed — Delete asks for 26 Nov's own award; again, it goes; 24 Nov's stays */
  await sc('N1', async () => {
    const a = '2026-11-24', b = '2026-11-26'
    await giveAward(w, who, a, 1); await giveAward(w, who, b, 0.5)
    await L.openCellR(w, who, b)
    await L.press(w, T('span-range')); await L.press(w, T(`span-day-${a}`), q('n1-pick'))
    await L.press(w, T('bid-clear'), q('n1-armed')); await P.waitForTimeout(250)
    const armed = await L.txt(P, T('span-note'))
    await L.shot(w, `n1-armed-${tg}`)
    await L.press(w, T('span-range'), q('n1-closed')); await P.waitForTimeout(250)
    const after = await L.txt(P, T('span-note'))
    await L.shot(w, `n1-closed-${tg}`)
    await L.press(w, T('bid-clear'), q('n1-asks')); await P.waitForTimeout(250)
    const asks = await L.txt(P, T('span-note'))
    await L.shot(w, `n1-asks-${tg}`)
    await L.press(w, T('bid-clear')); await P.waitForTimeout(500)
    const open = await L.vis(P, T('bid-picker'))
    await L.closeAny(w)
    const cellA = await awardText(w, who, a), cellB = await awardText(w, who, b)
    await L.cellShot(w, who, b, `n1-after-${tg}`)
    L.rec('N1 the calendar closed over 24 Nov\'s armed Delete: no note left; Delete asks for 26 Nov\'s own award, then takes it; 24 Nov\'s stays', w.tag,
      /1 day/.test(armed || '') && !after && /½|0\.5|half/i.test(asks || '') && !/HO|FO/.test(cellB) && /FO|HO/.test(cellA) ? 'PASS' : 'FAIL',
      `armed "${armed}"; after close "${after}"; asks "${asks}"; window open after the 2nd Delete ${open}; 24 Nov "${cellA}", 26 Nov "${cellB}"`,
      [`n1-armed-${tg}`, `n1-closed-${tg}`, `n1-asks-${tg}`, `n1-after-${tg}`])
  })

  /* N2 — a waiting LL on 30 Nov, words typed into its box, then Grant OIL through the ⋯: one Undo takes the award first */
  await sc('N2', async () => {
    const d = '2026-11-30'
    await L.openCellR(w, who, d); await setSwitch(w, false); await L.placeLeave(w, 'LL')
    await L.openCellR(w, who, d)
    await L.press(w, T('bid-remarks')); await P.keyboard.type('typed then an award')
    await L.press(w, T('bid-more')); await L.press(w, T('bid-oil'), q('n2-grant'))
    await P.locator(T('oil-why')).fill('Re-walk award'); await P.locator(T('oil-given-by')).fill('OC')
    if (await L.vis(P, T('oil-days'))) await P.locator(T('oil-days')).fill('1')
    await L.press(w, T('oil-give')); await P.waitForTimeout(500)
    const before = await awardText(w, who, d)
    await L.cellShot(w, who, d, `n2-given-${tg}`)
    await L.undo(w)
    const after = await awardText(w, who, d)
    await L.cellShot(w, who, d, `n2-undone-${tg}`)
    await L.openCellR(w, who, d)
    const words = await P.evaluate(() => document.querySelector('[data-testid="bid-remarks"]')?.value ?? null)
    await L.shot(w, `n2-reopened-${tg}`)
    await L.closeAny(w)
    L.rec('N2 words typed, then an award given through the ⋯: one Undo takes the award, the words stay on the bid', w.tag,
      /FO/.test(before) && !/FO/.test(after) && words === 'typed then an award' ? 'PASS' : 'FAIL',
      `cell after the award "${before}"; after one Undo "${after}"; the box reopened "${words}"`, [`n2-given-${tg}`, `n2-undone-${tg}`, `n2-reopened-${tg}`])
  })

  /* N3 — 1 Dec: a waiting LL in the morning and a waiting OIL in the afternoon; the day's list; Refuse on the LL, then two quick
     taps where Refuse stands: it stays Refuse, pressed, and nothing else changes */
  await sc('N3', async () => {
    const d = '2026-12-01'
    await L.openCellR(w, who, d); await setSwitch(w, false)
    await L.press(w, T('portion-am')); await L.placeLeave(w, 'LL')
    await L.openCellR(w, who, d); await setSwitch(w, false)
    await L.press(w, T('portion-pm')); await L.placeLeave(w, 'OIL')
    await L.openCellR(w, who, d)
    const listed = await L.vis(P, T('daylist'))
    const first = await P.evaluate(() => document.querySelector('[data-testid^="dl-refuse-"]')?.dataset.testid ?? null)
    await L.press(w, `[data-testid="${first}"]`, q('n3-refuse'))
    await P.waitForTimeout(250)
    const look = () => P.evaluate(t => { const b = document.querySelector(`[data-testid="${t}"]`); if (!b) return null; return { pressed: b.getAttribute('aria-pressed'), place: [...b.parentElement.children].indexOf(b), lines: [...document.querySelectorAll('[data-testid="daylist"] .dl-main')].map(e => e.innerText.replace(/\s+/g, ' ')) } }, first)
    const r1 = await look()
    await L.shot(w, `n3-refused-${tg}`)
    await L.press(w, `[data-testid="${first}"]`, q('n3-tap2')); await L.press(w, `[data-testid="${first}"]`, q('n3-tap3'))
    await P.waitForTimeout(300)
    const r2 = await look()
    await L.shot(w, `n3-after-taps-${tg}`)
    await L.closeAny(w)
    L.rec('N3 the list\'s refused bid keeps Refuse second in its row, pressed; two more quick taps change nothing', w.tag,
      listed && r1?.pressed === 'true' && r1.place === 1 && r2?.pressed === 'true' && r2.place === 1 && JSON.stringify(r1.lines) === JSON.stringify(r2.lines) && r2.lines.length === 2 && /refused/i.test(r2.lines.join(' ')) && /pending/i.test(r2.lines.join(' ')) ? 'PASS' : 'FAIL',
      `list ${listed}; after Refuse ${JSON.stringify(r1)}; after two more taps ${JSON.stringify(r2)}`, [`n3-refused-${tg}`, `n3-after-taps-${tg}`])
  })

  if (w.errs.length) L.rec('errors seen', w.tag, 'FAIL', w.errs.slice(0, 8).join(' || '), [])
  else L.rec('errors seen (console, page, 4xx)', w.tag, 'PASS', 'none', [])
  await w.ctx.close()
}
await L.closeBrowser()
writeFileSync(path.join(L.OUT, 'results.json'), JSON.stringify(L.results, null, 1))
const n = v => L.results.filter(r => r.verdict === v).length
console.log(`DONE  PASS ${n('PASS')}  FAIL ${n('FAIL')}  NOT WALKED ${n('NOT WALKED')}`)
