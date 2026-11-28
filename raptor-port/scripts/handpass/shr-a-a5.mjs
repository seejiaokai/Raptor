// shr-a-a5 — share A, A5 (Astra S07, O-S9, F-S10): refusals as the first change (end before start `0700`; `2570`) and after
// a good change (start 0900 Tab; end 0830; end 2570; then end 1100 valid); after EACH refusal: tap away, tap the box
// afresh, type the figure it shows, Tab. EXPECTED: a refusal saves nothing, cuts nobody out (one input, both men, when
// it was the first change) and heals the box to HIS value; RECORD every refusal's words and whether a second note follows.
//   WR4_OUT=<dir> WR4_NEW=<build> SZ=desk|phone ENG=chromium|webkit node scripts/handpass/shr-a-a5.mjs
import { L, J, sleep, add, done, world, openBoard, read, boxSel, typeIn, pressAt, pic, away, fixture, TAG } from './shr-a-lib.mjs'
console.log('shr-a-a5 v1', TAG)
/* every distinct note shown in the next `ms` */
const notesFor = (p, ms = 3500) => p.evaluate(ms => new Promise(res => { const seen = []; const t0 = performance.now(); const tick = () => { const t = document.getElementById('toastEl'); if (t) { const cs = getComputedStyle(t); const s = (t.textContent || '').replace(/\s+/g, ' ').trim(); if (+cs.opacity > 0.05 && s && seen.at(-1) !== s) seen.push(s) } if (performance.now() - t0 < ms) requestAnimationFrame(tick); else res(seen) }; tick() }), ms)
const shared = s => s.length === 1 && /^LL Ranger\+Hex Jul 15 480-600 ""/.test(s[0])
const own = (s, a, b) => s.length === 2 && s.some(x => new RegExp(`^LL Ranger Jul 15 ${a}-${b} ""`).test(x)) && s.some(x => /^LL Hex Jul 15 480-600 ""/.test(x))
async function refuse(w, steps, pics, checks, label, f, typed, want, storeOk) {
  const p = w.page
  const sel = await boxSel(p, 'Ranger', f)
  await typeIn(w, sel, typed, null, `${label}-tap`)
  await p.keyboard.press('Tab')
  const words = await notesFor(p)
  const shows = await p.locator(await boxSel(p, 'Ranger', f)).first().inputValue()
  const r = await read(p, `${label}: ${typed} in his ${f}, Tab`)
  steps.push({ ...r, notes: words, boxHeals: shows })
  pics.push(await pic(w, `a5-${label}`))
  checks.push(`${shows === want && storeOk(r.store) ? 'ok' : 'WRONG'} ${label}: box heals to ${want}, nothing saved — box ${shows}, store ${J(r.store)}`)
  checks.push(`RECORD ${label} notes: ${J(words)}`)
  /* tap away, tap the box afresh, type the figure it shows */
  await away(w)
  const sel2 = await boxSel(p, 'Ranger', f)
  const fig = await p.locator(sel2).first().inputValue()
  await typeIn(w, sel2, fig.replace(':', ''), 'Tab', `${label}-again`)
  const words2 = await notesFor(p, 1500)
  const r2 = await read(p, `${label}: tapped away, tapped afresh, typed the figure it shows (${fig.replace(':', '')}), Tab`)
  steps.push({ ...r2, notes: words2 })
  checks.push(`${storeOk(r2.store) && r2.agree.bad.length === 0 ? 'ok' : 'WRONG'} ${label} retyped its own figure ${fig}: nothing changes — store ${J(r2.store)}, notes ${J(words2)}, undo ${r2.undo}`)
}
for (const pass of (process.env.PASSES || 'first-0700,first-2570,after-good,oneman-0700').split(',')) {
  const id = `A5-${pass}`, steps = [], pics = [], checks = []
  try {
    const w = await world(); const p = w.page
    const iid = await fixture(w, pass === 'oneman-0700' ? [L.RANGER] : [L.RANGER, L.HEX]); await openBoard(w)
    steps.push(await read(p, 'filed'))
    if (pass === 'oneman-0700') await refuse(w, steps, pics, checks, 'oneman-end0700', 'end', '0700', '10:00', s => s.length === 1 && /^LL Ranger Jul 15 480-600 ""/.test(s[0]))
    else     if (pass === 'first-0700') await refuse(w, steps, pics, checks, 'end0700', 'end', '0700', '10:00', shared)
    else if (pass === 'first-2570') await refuse(w, steps, pics, checks, 'end2570', 'end', '2570', '10:00', shared)
    else {
      await typeIn(w, await boxSel(p, 'Ranger', 'str'), '0900', 'Tab', 'str-tap')
      steps.push(await read(p, 'start 0900 Tab'))
      const s0 = steps.at(-1).store
      checks.push(`${own(s0, 540, 600) ? 'ok' : 'WRONG'} the good change: Ranger own 09:00–10:00 — ${J(s0)}`)
      await refuse(w, steps, pics, checks, 'end0830', 'end', '0830', '10:00', s => own(s, 540, 600))
      await refuse(w, steps, pics, checks, 'end2570', 'end', '2570', '10:00', s => own(s, 540, 600))
      await typeIn(w, await boxSel(p, 'Ranger', 'end'), '1100', 'Tab', 'end1100')
      steps.push(await read(p, 'end 1100 Tab (valid)'))
      checks.push(`${own(steps.at(-1).store, 540, 660) ? 'ok' : 'WRONG'} the valid retry: Ranger own 09:00–11:00 — ${J(steps.at(-1).store)}`)
      pics.push(await pic(w, 'a5-valid-1100'))
    }
    add(id, checks.filter(c => !c.startsWith('RECORD')).every(c => c.startsWith('ok')) ? 'PASS' : 'FAIL', { fixture: iid, checks, steps }, pics)
    add(id + '-words', 'RECORDED', checks.filter(c => c.startsWith('RECORD')).join(' ; '))
    await w.ctx.close()
  } catch (e) { add(id, 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 400) + ' ' + J({ checks, steps }).slice(0, 3000), pics) }
}
await done('a5')
