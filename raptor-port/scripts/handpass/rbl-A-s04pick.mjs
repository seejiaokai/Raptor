/* S04 (picker half) — "the picker loses the 12:30 clearance": an ordinary (non-SANS) man Y on Monday's late flight; a blank crewed Monday wave drawn after, then dragged
   before the late flight; each time arm an EMPTY Tuesday seat on the early flight and read what the crew list says about Y BEFORE he is placed. Walker A. */
import * as K from './rbl-A-lib.mjs'
const { B, W, R, MON, TUE } = K
const YCS = process.argv[2] || 'Fable'
let Y = null
const id = 'S04pick'
const { tap } = await import('./lib.mjs')
const { browser, p, errors } = await K.fresh()
async function picker(slot) {
  await K.boardTo(p, TUE)
  await tap(p, `[data-slot="${slot}"], [data-fill="${slot}"]`); await K.sleep(500)
  const r = await p.evaluate(who => {
    const e = document.querySelector(`#sbRoster .rpuck[data-person="${who}"]`)
    if (!e) return { none: 'no roster puck' }
    e.scrollIntoView({ block: 'center' })
    const c = getComputedStyle(e)
    return { cls: e.className, why: e.getAttribute('data-why'), title: e.getAttribute('title'), opacity: c.opacity, strike: c.textDecorationLine, inner: e.innerText.replace(/\s+/g, ' ') }
  }, Y)
  const shot = await B.pic(p, `${id}-armed-${Date.now() % 100000}`)
  await p.keyboard.press('Escape'); await K.sleep(200)
  return { ...r, shot }
}
try {
  Y = await p.evaluate(c => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === c) || null, YCS)
  console.log('Y id', Y)
  const cs = await B.csOf(p, Y)
  const m = await K.wave(p, MON, 'ZM', 'BFM', '20:00', '22:30', Y)
  console.log('Monday seat took:', m.took, '| held:', JSON.stringify(await K.held(p, TUE, Y)), '| Monday line:', await K.lineOf(p, MON, m.gi, 0))
  const t = await K.wave(p, TUE, 'ZT', 'BFM', '07:00', '08:00', null, '05:00')
  /* the pre-drop question needs a sibling on the formation (Astra's S11 caveat): a front-seat pilot goes into ZT, the back seat stays empty */
  const P = await p.evaluate(c => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === c) || null, 'Anvil')
  const sp = await K.seat(p, TUE, t.gi, 0, 0, 'p', P)
  console.log('front-seat sibling Anvil', P, 'took', sp.took)
  const slot = `${TUE}.${t.gi}.0.0.w`
  const show = r => r.none ? r.none : `class "${r.cls}" · why "${r.why}" · title "${r.title}" · opacity ${r.opacity} · struck ${r.strike} · text "${r.inner}"`
  const has = r => !r.none && /rest/i.test((r.why || '') + (r.title || '')) && /12:30/.test((r.why || '') + (r.title || ''))
  let r0 = await picker(slot)
  R(`${id}.0`, `${cs} (ordinary man, not SANS) on Monday ZM 20:00-22:30 (took ${m.took}); Tuesday ZT 07:00-08:00 Brief 05:00 with Anvil in its front seat (the formation has a sibling) and the back seat empty; that empty back seat armed, ${cs}'s name in the crew list read BEFORE he is placed`, show(r0), has(r0) ? 'PASS' : 'FAIL', [r0.shot])
  const b = await K.addFlyWave(p, MON); const sd = await K.seat(p, MON, b.gi, 0, 0, 'w', Y)
  let r1 = await picker(slot)
  R(`${id}.1`, `a blank crewed Monday wave added AFTER the late flight (${cs} in it, took ${sd.took}); the same empty seat armed again`, show(r1), has(r1) ? 'PASS' : 'FAIL', [r1.shot])
  let derr = null
  try { await K.dragWave(p, MON, b.gi, m.gi) } catch (e) { derr = String(e.message || e).slice(0, 120) }
  let r2 = await picker(slot)
  R(`${id}.2`, `that blank wave dragged BEFORE the late flight (${derr || 'dragged'}; order ${await K.orderOf(p, MON)}); the seat armed again`, show(r2), has(r2) ? 'PASS' : 'FAIL', [r2.shot])
  const cur = (await K.orderOf(p, MON)).split('  ')
  try { await K.dragWave(p, MON, cur.findIndex(x => /\(blank\)/.test(x)), cur.findIndex(x => /ZM/.test(x))) } catch (e) { derr = String(e.message || e).slice(0, 120) }
  let r3 = await picker(slot)
  R(`${id}.3`, `and back AFTER it (order ${await K.orderOf(p, MON)}); the seat armed again`, show(r3), has(r3) ? 'PASS' : 'FAIL', [r3.shot])
  const same = [r0, r1, r2, r3].every(r => r.why === r0.why && r.title === r0.title)
  R(`${id}.cmp`, 'the same words in every state', JSON.stringify([r0.why, r1.why, r2.why, r3.why]), same ? 'PASS' : 'FAIL')
} catch (e) { R(`${id}.script`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, `${id}-X`)]) }
await K.wrap('rbl-A-s04pick', browser, errors, id)
