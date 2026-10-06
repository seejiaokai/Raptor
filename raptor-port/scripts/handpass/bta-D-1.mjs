/* Walker D — H-06 (a day published WITH the warning, then the leave lifted) and S06 / S07. Usage: node bta-D-1.mjs h06|s06|s07|all */
import * as D from './bta-D-lib.mjs'
const { B, K, C, W, L, TUE, ID, CSN, sleep } = D
const R = K.R
const which = process.argv[2] || 'all'
const TAGP = D.B.PHONE ? 'ph' : 'dk'
const RE_LINE = /(On leave but planned to fly|Downchit but planned to fly|clashes with)/
const flags = c => c.lines.some(t => /this line|Vandal/.test(t) && RE_LINE.test(t)) && c.ring
const clean = c => c.lines.length === 0 && !c.ring
const pendIs = (c, n) => n === 0 ? !/pending/i.test(c.hd.pend || '') : new RegExp('^' + n + '\\s*pending', 'i').test(c.hd.pend || '')
const signsHold = c => !/not yet signed/i.test(c.hd.nys || "") && /SIGNED/.test(c.hd.signed || "")
const signsDown = c => /not yet signed/i.test(c.hd.nys || "")
const say = (w, f, l) => `WORKING: ${D.sayCard(w)}  ||  FACE (View-only Sched): ${D.sayCard(f)}${l ? '  ||  LOOK (👁 Original): ' + D.sayCard(l) : ''}`

async function all3(p, tag, { look = true } = {}) {
  const w = await D.work(p, tag)
  const f = await D.face(p, tag)
  const l = look ? await D.lookAt(p, /Original/i, tag) : null
  return { w, f, l }
}
const pics = (...x) => x.flatMap(c => c ? [c.shot] : []).filter(Boolean)
const pr = (s) => (s.l && !s.l.err) ? pics(s.w, s.f, s.l) : pics(s.w, s.f)

async function h06() {
  const { browser, p, errors } = await K.fresh()
  const T = D.B.PHONE ? 'H-06ph' : 'H-06'
  try {
    const f = await D.file(p, 'LL', 'Wedding')
    const s = await D.seatBlank(p)
    const pub = await D.pub(p)
    const x0 = await all3(p, `${TAGP}-h06-0-published`)
    R(`${T}.1`, `${CSN}: LL all Tuesday filed (Inputs page, asked: ${f.asked.join(',') || 'nothing'}); "+ Wave" → flying wave, ${CSN} seated on its blank line (took ${s.took}); the day signed and published (Original). Read working, face, 👁 Original`, say(x0.w, x0.f, x0.l),
      flags(x0.w) && flags(x0.f) && x0.l && flags(x0.l) && pendIs(x0.w, 0) && signsHold(x0.w) ? 'PASS' : 'FAIL', pr(x0))

    const lifted = await D.lift(p, f.iid)
    const x1 = await all3(p, `${TAGP}-h06-1-lifted`)
    R(`${T}.2`, `the leave lifted on the Inputs page (${lifted})`, say(x1.w, x1.f, x1.l),
      clean(x1.w) && flags(x1.f) && x1.l && flags(x1.l) && pendIs(x1.w, 1) && signsDown(x1.w) ? 'PASS' : 'FAIL', pr(x1))

    const am = await D.amend(p)
    const x2 = await all3(p, `${TAGP}-h06-2-AL1`)
    R(`${T}.3`, `Publish AL1 (${JSON.stringify(am.r)})`, say(x2.w, x2.f, x2.l) + ` · versions ${JSON.stringify(await D.versionsOf(p))}`, clean(x2.w) && clean(x2.f) && x2.l && flags(x2.l) && pendIs(x2.w, 0) ? 'PASS' : 'FAIL', pr(x2))
  } catch (e) { R(T, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, 'h06-X')]) }
  R(`${T}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

/* S06 — publish a blank assignment with NO absence; then file the absence. Working flags; face clean; pending rises; four sign-offs down */
async function s06(type = 'LL', full = true) {
  const { browser, p, errors } = await K.fresh()
  const T = (D.B.PHONE ? 'S06ph' : 'S06') + (type === 'LL' ? '' : '-' + type.replace(' ', ''))
  try {
    const s = await D.seatBlank(p)
    const pub = await D.pub(p)
    const x0 = await all3(p, `${TAGP}-s06${type.replace(' ', '')}-0-published`)
    R(`${T}.1`, `"+ Wave" → blank flying line, ${CSN} seated (took ${s.took}); no absence; the day signed and published`, say(x0.w, x0.f, x0.l), clean(x0.w) && clean(x0.f) && x0.l && clean(x0.l) && pendIs(x0.w, 0) && signsHold(x0.w) ? 'PASS' : 'FAIL', pr(x0))

    const f = await D.file(p, type, 'After publish')
    const x1 = await all3(p, `${TAGP}-s06${type.replace(' ', '')}-1-filed`)
    R(`${T}.2`, `${type} all Tuesday filed AFTER publishing (asked: ${f.asked.join(',') || 'nothing'})`, say(x1.w, x1.f, x1.l),
      flags(x1.w) && clean(x1.f) && x1.l && clean(x1.l) && pendIs(x1.w, 1) && signsDown(x1.w) ? 'PASS' : 'FAIL', pr(x1))
    if (!full) { R(`${T}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS'); await browser.close(); return }

    const u = await D.undo(p)
    const x2 = await all3(p, `${TAGP}-s06-2-undo`)
    R(`${T}.3`, `Undo (top bar: ${JSON.stringify({ t: u.title, pressed: u.pressed, toasts: u.toasts })})`, say(x2.w, x2.f, x2.l) + ` · inputs ${JSON.stringify(await D.inputsOf(p))}`, 'RECORDED', pr(x2))
    const r = await D.redo(p)
    const x3 = await all3(p, `${TAGP}-s06-3-redo`)
    R(`${T}.4`, `Redo (${JSON.stringify({ t: r.title, pressed: r.pressed, toasts: r.toasts })})`, say(x3.w, x3.f, x3.l), flags(x3.w) && clean(x3.f) && pendIs(x3.w, 1) && signsDown(x3.w) ? 'PASS' : 'FAIL', pr(x3))
    await D.reload(p)
    const x4 = await all3(p, `${TAGP}-s06-4-reload`)
    R(`${T}.5`, 'page reloaded and signed in again', say(x4.w, x4.f, x4.l), flags(x4.w) && clean(x4.f) && x4.l && clean(x4.l) && pendIs(x4.w, 1) && signsDown(x4.w) ? 'PASS' : 'FAIL', pr(x4))

    const am = await D.amend(p)
    const x5 = await all3(p, `${TAGP}-s06-5-AL1`)
    R(`${T}.6`, `Publish AL1 (${JSON.stringify(am.r)})`, say(x5.w, x5.f, x5.l) + ` · versions ${JSON.stringify(await D.versionsOf(p))}`, flags(x5.w) && flags(x5.f) && x5.l && clean(x5.l) && pendIs(x5.w, 0) ? 'PASS' : 'FAIL', pr(x5))
  } catch (e) { R(T, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, 's06-X')]) }
  R(`${T}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

/* S07 — publish with the absence already there; delete / shorten / lift it afterwards */
async function s07() {
  const { browser, p, errors } = await K.fresh()
  const T = 'S07'
  try {
    const f = await D.file(p, 'LL', 'Wedding')
    const s = await D.seatBlank(p)
    await D.pub(p)
    const x0 = await all3(p, 'dk-s07-0-published')
    R(`${T}.1`, `LL all Tuesday filed, ${CSN} on a blank line, published`, say(x0.w, x0.f, x0.l), flags(x0.w) && flags(x0.f) && x0.l && flags(x0.l) && pendIs(x0.w, 0) && signsHold(x0.w) ? 'PASS' : 'FAIL', pr(x0))
    /* shorten: re-date the leave to Monday only (editor on the Inputs page) so Tuesday loses it */
    const AD = await import('./dbrA-W2-lib.mjs')
    const ed = await AD.redate(p, f.iid, '2026-07-14', '2026-07-13')
    const x1 = await all3(p, 'dk-s07-1-shortened')
    R(`${T}.2`, `the leave re-dated on the Inputs page from Tue 14 Jul to Mon 13 Jul (editor read "${ed}")`, say(x1.w, x1.f, x1.l) + ` · inputs ${JSON.stringify(await D.inputsOf(p))}`, clean(x1.w) && flags(x1.f) && x1.l && flags(x1.l) && pendIs(x1.w, 1) && signsDown(x1.w) ? 'PASS' : 'FAIL', pr(x1))
    const u = await D.undo(p)
    const x2 = await all3(p, 'dk-s07-2-undo')
    R(`${T}.3`, `Undo (${JSON.stringify({ pressed: u.pressed, toasts: u.toasts })})`, say(x2.w, x2.f, x2.l), 'RECORDED', pr(x2))
    const r = await D.redo(p)
    const x3 = await all3(p, 'dk-s07-3-redo')
    R(`${T}.4`, `Redo (${JSON.stringify({ pressed: r.pressed, toasts: r.toasts })})`, say(x3.w, x3.f, x3.l), 'RECORDED', pr(x3))
    await D.reload(p)
    const x4 = await all3(p, 'dk-s07-4-reload')
    R(`${T}.5`, 'reload', say(x4.w, x4.f, x4.l), clean(x4.w) && flags(x4.f) && x4.l && flags(x4.l) && pendIs(x4.w, 1) && signsDown(x4.w) ? 'PASS' : 'FAIL', pr(x4))
    const am = await D.amend(p)
    const x5 = await all3(p, 'dk-s07-5-AL1')
    R(`${T}.6`, `Publish AL1 (${JSON.stringify(am.r)})`, say(x5.w, x5.f, x5.l) + ` · versions ${JSON.stringify(await D.versionsOf(p))}`, clean(x5.w) && clean(x5.f) && x5.l && flags(x5.l) && pendIs(x5.w, 0) ? 'PASS' : 'FAIL', pr(x5))
  } catch (e) { R(T, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, 's07-X')]) }
  R(`${T}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

if (which === 's06' || which === 'all') await s06('LL')
if (which === 's06b' || which === 'all') { await s06('OL', false); await s06('ATT C', false) }
if (which === 'h06' || which === 'all') await h06()
if (which === 's07' || which === 'all') await s07()
B.savePart('bta-D-1-' + which)
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}  ${r.did}\n      → ${String(r.saw).slice(0, 1500)}\n      pics ${(r.pics || []).join(' ')}`)
