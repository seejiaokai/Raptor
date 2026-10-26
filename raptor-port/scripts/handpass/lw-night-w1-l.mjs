// WALKER 1 — the state table's last cells: red → amber and amber → ok (a refuse each), no bubble; proof the press happened.
// Usage, from raptor-port/:  LW_PORT=4180 [SIZES=phone,desk] node scripts/handpass/lw-night-w1-l.mjs
import * as H from './lw-night-w1-lib.mjs'
import path from 'node:path'
import { readdirSync, unlinkSync } from 'node:fs'
const { L, T, rec } = H
console.log('lw-night-w1-l v1', L.OUT, 'port', L.PORT)
const SIZES = (process.env.SIZES || 'phone,desk').split(',')
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png') && /^st-/.test(f) && SIZES.some(s => f.includes(`-${s}-`))) unlinkSync(path.join(L.OUT, f))
const judge = (id, size, conds, said, pics) => {
  const bad = conds.filter(c => !c[1])
  rec(id, size, bad.length ? 'FAIL' : 'PASS', (bad.length ? 'FAILED: ' + bad.map(c => `${c[0]} (saw ${c[2]})`).join('; ') + ' — ' : '') + said, pics)
}
const rowsOpen = P => P.evaluate(() => { const e = document.querySelector('[data-testid^="avail-p-"]'); return !!e && e.getBoundingClientRect().height > 0 })
const availCell = async (P, iso) => { const c = await H.rowCell(P, `avail-p-${iso}`); return c ? `${c.text} ${H.levelOf(c)}` : null }
async function openRows(w) { const P = w.page; await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250); if (!(await rowsOpen(P))) { await L.press(w, T('counts-toggle')); await P.waitForTimeout(600) } }
async function readA(w, iso) { const P = w.page; let a = await availCell(P, iso); if (a === null) { await openRows(w); await L.reachCell(w, 'bane', iso); a = await availCell(P, iso) } return a }
async function setPoints(w, amberText, redText) {
  const P = w.page
  await openRows(w)
  await L.press(w, T('fly-name-avail-p')); await P.waitForSelector(T('cform-amber-pt'), { timeout: 4000 })
  await P.locator(T('cform-amber-pt')).fill(amberText); await P.locator(T('cform-red-pt')).fill(redText)
  await P.waitForTimeout(200)
  await L.press(w, T('cform-save')); await P.waitForTimeout(500)
}
for (const size of SIZES) {
  const w = await H.startWorld(size)
  const P = w.page
  const ids = await H.peopleIds(P)
  try {
    const D = '2026-12-17'
    await setPoints(w, '+ 4', '+ 2')
    const a0 = await H.availP(w, D)
    let R = Number(a0) - 4
    for (let i = 0; i < 3; i++) { await H.setReq(w, D, R); await P.waitForTimeout(300); if (H.levelOf(await H.rowCell(P, `avail-p-${D}`)) === 'ok') break; R -= 1 }
    const who = [ids.Drifter, ids.Ridge, ids.Trident]
    const seq = []
    for (const m of who) { const r = await H.bidType(w, m, D, { type: 'LL', inView: true, approve: false }); seq.push(await readA(w, D)); await H.dismissBubble(w) }
    // refuse Trident (the third bid): red → amber
    for (const [m, nm, label, want] of [[ids.Trident, 'Trident', 'red → amber', 'amber'], [ids.Ridge, 'Ridge', 'amber → amber (better)', 'amber'], [ids.Drifter, 'Drifter', 'amber → ok', 'ok']]) {
      const before = await readA(w, D)
      await P.evaluate(() => window.scrollTo(0, 0))
      await L.openCellR(w, m, D); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
      await H.setManningView(w, true)
      const seen = await H.tapPic(w, T('decide-refuse'), `st-${size}-${nm.toLowerCase()}-refuse-after-tap`)
      await P.waitForTimeout(700)
      const b = await H.bubbleNow(P), k = await H.kinds(w, m, D), after = await readA(w, D)
      judge(`State table: ${label} (a Refuse) raises nothing`, size, [
        ['proof: the bid reads refused', k.some(x => /^LL\|k-ll\|s-r/.test(x)), JSON.stringify(k)],
        [`the level is ${want} afterwards, the figure went up`, after.endsWith(want) && Number(after.split(' ')[0]) === Number(before.split(' ')[0]) + 1, `${before} → ${after}`],
        ['no bubble', b.where === 'none' && seen.where === 'none', `${H.bubbleLine(b)} / right after ${H.bubbleLine(seen)}`],
      ], `Required P ${R}; bids took Available P ${a0} → ${seq.join(' → ')}; ${nm}'s refuse: ${before} → ${after}`, [`st-${size}-${nm.toLowerCase()}-refuse-after-tap.png`])
    }
  } catch (e) { rec('State table last cells', size, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 500)) }
  rec('errors-st', size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
  await w.ctx.close()
}
await L.closeBrowser()
H.saveResults(`l-${SIZES.join('-')}`)
const R = H.results, c = r => R.filter(x => x.verdict === r).length
console.log('DONE', R.length, 'records:', c('PASS'), 'PASS', c('FAIL'), 'FAIL', c('RECORD'), 'RECORD', c('NOT DONE'), 'NOT DONE')
