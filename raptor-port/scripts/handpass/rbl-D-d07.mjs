/* D-07 — published, then Undo / Redo. B published on both days (ORIG). On Tuesday's WORKING copy: + Line, seat X on the blank line;
   top-bar Undo; Redo; reload. After each step read Edit Schedule AND View-only Sched for Tuesday. Desktop. */
import * as K from './rbl-D-lib.mjs'
const { B, W, L, R, X, MON, TUE, clean } = K
const ID = 'D-07'
const { browser, p, errors } = await K.fresh()
const SURF = { E: '#eWeek', V: '#vWeek' }

async function face(f, tag, { pic = true } = {}) {
  const surf = SURF[f]
  await W.boardOff(p).catch(() => {})
  if (f === 'E') await B.toEdit(p); else if ((await p.evaluate(() => window.CURPAGE)) !== 'viewsched') await L.go(p, 'viewsched')
  await K.closeList(p, MON, surf); await K.closeList(p, TUE, surf)
  await W.showDay(p, MON, surf)
  const mon = await K.paint(p, `${surf} .day[data-day="${MON}"]`, X)
  await W.showDay(p, TUE, surf)
  const tue = await K.paint(p, `${surf} .day[data-day="${TUE}"]`, X)
  // Monday's "Breaks" line, then Tuesday's words
  await B.openList(p, surf, MON); const ml = await B.readList(p, surf, MON); await K.closeList(p, MON, surf)
  await B.openList(p, surf, TUE)
  const tl = await B.readList(p, surf, TUE)
  const hd = await p.evaluate(([s, i]) => { const d = document.querySelector(`${s} .day[data-day="${i}"]`); if (!d) return null
    const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''
    const sel = d.querySelector('select.dver')
    return { tag: t(d.querySelector('.verchip')), pend: t(d.querySelector('.dpend')), nys: t(d.querySelector('.nysmark')), sel: sel ? sel.options[sel.selectedIndex].text : '' } }, [surf, TUE])
  const cs = await B.csOf(p, X)
  const mine = (tl.lines || []).filter(x => x.text.includes(cs) && /Crew rest|Tight turn/i.test(x.text))
  const monBreaks = (ml.lines || []).filter(x => /Breaks/i.test(x.text)).map(x => x.text.slice(0, 120))
  let shot = null
  if (pic) shot = await K.picEl(p, `${surf} .day[data-day="${TUE}"]`, `${tag}-${f}-tue-day`, { pad: 6, maxH: 900 })
  const ring = tue.some(x => x.where === 'flying' && x.solid), dotted = mon.some(x => x.dotted)
  return { f, mine: mine.map(x => x.text), ring, dotted, tuePk: K.pk(tue), monPk: K.pk(mon), monBreaks, hd, bar: tl.bar, shot, whole: mine.some(x => /Crew rest breach/.test(x.text)) && ring && dotted }
}
const say = x => `${x.f === 'E' ? 'Edit Schedule' : 'View-only Sched'}: bar "${x.bar}" · his line ${JSON.stringify(x.mine.map(t => t.slice(0, 140)))} · Tuesday pucks [${x.tuePk}] · Monday pucks [${x.monPk}] · Monday "Breaks" ${JSON.stringify(x.monBreaks)} · head tag "${x.hd && x.hd.tag}" chip "${x.hd && x.hd.pend}" marker "${x.hd && x.hd.nys}"`
async function both(id, did, wantPending, { soft = false } = {}) {
  const e = await face('E', id), v = await face('V', id)
  const eOk = e.whole, vOk = v.whole
  const isPend = /pending/i.test(e.hd.pend || '') , isNys = /not yet signed/i.test(e.hd.nys || '')
  const pendOk = wantPending === null ? true : (wantPending ? (isPend && isNys) : (!isPend && !isNys))
  const vPendOk = !/pending/i.test((v.hd && v.hd.pend) || '') && !/not yet signed/i.test((v.hd && v.hd.nys) || '')
  const faces = eOk && vOk && vPendOk
  const verdict = !faces ? 'FAIL' : pendOk ? 'PASS' : (soft ? 'PARTIAL' : 'FAIL')
  R(id, did, `pending chip on Edit Schedule: "${e.hd.pend}" / marker "${e.hd.nys}" (expected ${wantPending === null ? 'no expectation' : wantPending ? '1 pending + Not yet signed' : 'no pending, no Not-yet-signed'}: ${pendOk ? 'as expected' : 'NOT as expected'}); the published face carries no pending chip: ${vPendOk} · ` + say(e) + '  ||  ' + say(v), verdict, [e.shot, v.shot].filter(Boolean))
  return { e, v }
}
try {
  const cs = await B.csOf(p, X)
  const m = await K.wave(p, MON, 'ZM', 'BFM', '20:00', '22:30', X)
  const t = await K.wave(p, TUE, 'ZT', 'BFM', '07:00', '08:00', X, '05:00')
  await W.boardOff(p).catch(() => {})
  const pm = await B.pubOrig(p, MON), pt = await B.pubOrig(p, TUE)
  console.log('publish Mon', JSON.stringify(pm), '| Tue', JSON.stringify(pt))
  const hM = await B.head(p, MON), hT = await B.head(p, TUE)
  console.log('heads', JSON.stringify(hM), JSON.stringify(hT))
  await both(`${ID}.1`, `${cs}: Monday ZM 20:00–22:30, Tuesday ZT 07:00–08:00 Brief 05:00; both days signed (four sign-offs) and published (Publish: ${pm.r.label}/${pt.r.label}); Tuesday head tag "${hT && hT.tag}" before — the published state`, false)
  // + Line on Tuesday's wave, X on the blank line
  await K.addLine(p, TUE, t.gi)
  const fi = (await K.nLines(p, TUE, t.gi)) - 1
  const sb = await K.seat(p, TUE, t.gi, fi, 0, 'p', X)
  const lineIs = await K.lineOf(p, TUE, t.gi, fi)
  await W.boardOff(p).catch(() => {})
  await both(`${ID}.2`, `Tuesday working copy: + Line, ${cs} seated on the blank line (took ${sb.took}; line: ${lineIs})`, true)
  const nl = () => K.nLines(p, TUE, t.gi)
  const u1 = await K.undo(p)
  await both(`${ID}.3`, `top-bar Undo, the first one (pressed ${u1.pressed}; the blank line's seat now "${await K.seatOf(p, TUE, t.gi, fi)}", lines on the wave ${await nl()})`, false, { soft: true })
  const u2 = await K.undo(p)
  await both(`${ID}.3b`, `top-bar Undo, a second time (pressed ${u2.pressed}; lines on the wave ${await nl()})`, false)
  const r1 = await K.redo(p)
  await both(`${ID}.4`, `top-bar Redo, the first one (pressed ${r1.pressed}; the blank line's seat now "${await K.seatOf(p, TUE, t.gi, fi)}", lines on the wave ${await nl()})`, true, { soft: true })
  const r2 = await K.redo(p)
  await both(`${ID}.4b`, `top-bar Redo, a second time (pressed ${r2.pressed}; the blank line's seat now "${await K.seatOf(p, TUE, t.gi, fi)}", lines on the wave ${await nl()})`, true)
  await K.reload(p)
  await both(`${ID}.5`, `the page reloaded and signed in again (lines on the wave ${await nl()}; the blank line's seat "${await K.seatOf(p, TUE, t.gi, fi)}")`, null)
} catch (e) { R(`${ID}.script`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, `${ID}-X`)]) }
await K.wrap('d07', browser, errors, ID)
