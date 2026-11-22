// frf-w3-planswitch — the re-walk of Astra's scenario F01, fixed red-first after the first walk (oilsign.ts holdStands:
// the hold carries its plan). A sign-off held on Saturday's live working copy, then — with the OIL list still up — the
// board's plan selector used behind it: "+ Alt Plan" makes and opens a second plan. Expected: the list stops showing the
// held box and stops promising "Later: <name> signs"; Later signs nothing on the new plan; the next press on the new plan
// asks again; switched back to the first plan behind the list, Save writes the answer but signs nothing.
// Run from raptor-port/:  TS_URL=http://localhost:4321/ HP_SHOTS=<folder> SIZE=desktop node scripts/handpass/frf-w3-planswitch.mjs
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import * as L from './frf-w3-lib.mjs'
console.log('frf-w3-planswitch v1', new Date().toISOString())
const LIST = '[data-testid="win-oilday"]'
const R = []
const res = (sz, step, pass, note) => { R.push({ sc: 'F2-j plan switch', size: sz.name, step, pass, note }); console.log(`${pass === true ? 'PASS' : pass === false ? 'FAIL' : 'NOTE'} ${sz.name} ${step} — ${note}`) }
/* is the control at its middle the thing a press would reach (not covered by the list)? */
const reach = (p, sel) => p.evaluate(s => {
  const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 0)
  if (!e) return 'absent'
  e.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  const r = e.getBoundingClientRect(), h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  return h && (h === e || e.contains(h)) ? 'ok' : 'covered by ' + (h ? (h.closest('[data-testid]')?.getAttribute('data-testid') || h.className || h.tagName) : 'nothing')
}, sel)
const planId = p => p.evaluate(di => window.curDraftId ? window.curDraftId(di) : null, L.SAT_DI)

for (const k of (process.env.SIZE ? [process.env.SIZE] : ['desktop', 'phone'])) {
  const sz = L.SIZES[k], { b, p } = await L.open(sz); await L.login(p, 'ad')
  try {
    await p.evaluate(() => { const w = window; w.fileInput({ type: 'Training', allday: false, s: 480, e: 1020, date: 'Jul 18', yr: 2026, remarks: '', acc: 'g', people: [{ p: 'bane' }], iid: 'w3-pl' }); w.afterSchedMutate() })
    await L.openBoard(p)
    const planA = await planId(p)
    await L.pickSign(p, 'board', 'cur', 0)
    let h = await L.heldFacts(p); await L.shot(p, sz, 'j-1-held')
    res(sz, '1 list up, CUR CK held', !!h && h.held && h.label === 'CUR CK' && !JSON.parse(await L.signs(p)).cur, JSON.stringify({ held: h && h.held, name: h && h.name, plan: planA }))
    const sel = `#schedBoard [data-planmenu="${L.SAT_DI}"]`
    const r1 = await reach(p, sel)
    if (r1 !== 'ok') { res(sz, '2 plan selector behind the list', 'NOT WALKED', `the board's plan selector with the list up: ${r1} — the route does not exist at this size`); await L.shot(p, sz, 'j-2-selector-covered'); continue }
    await L.press(p, sz, sel); await p.waitForTimeout(300)
    await L.press(p, sz, '[data-plandup]'); await p.waitForTimeout(600)
    const planB = await planId(p)
    h = await L.heldFacts(p); await L.shot(p, sz, 'j-2-after-alt-plan')
    res(sz, '2 "+ Alt Plan" behind the list: a new plan is live', !!planB && planB !== planA && await L.listUp(p), JSON.stringify({ planA, planB, up: await L.listUp(p) }))
    res(sz, '3 the list no longer shows the held box nor promises Later signs', !!h && !h.held && !/signs/.test(h.foot || ''), JSON.stringify({ held: h && h.held, foot: h && h.foot }))
    await L.press(p, sz, `${LIST} [data-testid="odl-later"]`); await p.waitForTimeout(400)
    await L.shot(p, sz, 'j-3-after-later')
    res(sz, '4 Later signs nothing on the new plan; list closes', !JSON.parse(await L.signs(p)).cur && !(await L.listUp(p)), await L.signs(p))
    await L.pickSign(p, 'board', 'cur', 0)
    h = await L.heldFacts(p); await L.shot(p, sz, 'j-4-asks-again')
    res(sz, '5 the next press on the new plan asks again', !!h && h.held, JSON.stringify({ held: h && h.held }))
    const r2 = await reach(p, sel)
    if (r2 !== 'ok') { res(sz, '6 switch back behind the list', 'NOT WALKED', r2); continue }
    await L.press(p, sz, sel); await p.waitForTimeout(300)
    const back = p.locator(`[data-plansel]`).filter({ visible: true }).first()
    if (!(await back.count())) { res(sz, '6 switch back behind the list', 'NOT WALKED', 'no other plan in the menu'); continue }
    await back.click(); await p.waitForTimeout(600)
    const now = await planId(p)
    res(sz, '6 switched back to the first plan with the list up', now === planA && await L.listUp(p), JSON.stringify({ now, planA }))
    await L.press(p, sz, `${LIST} [data-testid="odl-yes-w3-pl"]`); await p.waitForTimeout(200)
    await L.press(p, sz, `${LIST} [data-testid="odl-save"]`); await p.waitForTimeout(500)
    const ans = await p.evaluate(() => JSON.stringify((window.INPUTS.find(r => r.iid === 'w3-pl') || {}).oil || {}))
    await L.shot(p, sz, 'j-5-after-save')
    res(sz, '7 Save writes the answer but signs nothing on the first plan', ans !== '{}' && !JSON.parse(await L.signs(p)).cur, JSON.stringify({ oil: ans, signs: JSON.parse(await L.signs(p)) }))
  } finally { await L.done(b) }
}
writeFileSync(path.join(L.SHOTS, `results-planswitch-${process.env.SIZE || 'both'}.json`), JSON.stringify({ R, errs: L.errs }, null, 1))
console.log('errors', L.errs)
