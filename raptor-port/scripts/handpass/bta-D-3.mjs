/* Walker D — S28 (hide the new warning; reload; change sign-in; unhide; across publication and amendment). */
import * as D from './bta-D-lib.mjs'
const { B, K, C, W, L, TUE, ID, CSN, sleep } = D
const R = K.R
const PH = D.B.PHONE
const T = 'S28'
const pendN = c => { const m = /^(\d+)\s*pending/i.exec(c.hd.pend || ''); return m ? +m[1] : 0 }
const active = c => c.lines.some(t => !t.startsWith('[HIDDEN]') && /(On leave but planned to fly|clashes with)/.test(t))
const hiddenLine = c => c.lines.some(t => t.startsWith('[HIDDEN]') && /(On leave but planned to fly|clashes with)/.test(t))
const say = (w, f, l) => `WORKING: ${D.sayCard(w)}  ||  FACE (View-only Sched): ${D.sayCard(f)}${l ? '  ||  LOOK (👁 Original): ' + D.sayCard(l) : ''}`
const shots = (...x) => x.flatMap(c => c ? [c.shot] : []).filter(Boolean)
const { browser, p, errors } = await K.fresh()
async function read(tag, o = {}) {
  const w = await D.work(p, tag, { puck: false })
  const f = await D.face(p, tag, { puck: false })
  const l = o.look ? await D.lookAt(p, /Original/i, tag, { pic: !!o.lookPic, puck: false }) : null
  const offs = (await D.fullWarnsX(p, TUE)).filter(x => /LEAVE_FLY|DNIF_FLY|INPUT_FLY/.test(x.code)).map(x => `${x.code}${x.off ? ' (off)' : ''}`)
  return { w, f, l, offs }
}
const fmt = s => say(s.w, s.f, s.l) + ` · the app holds: ${JSON.stringify(s.offs)}`
try {
  const f = await D.file(p, 'LL', 'Walker D'); const s0 = await D.seatBlank(p)
  let s = await read('dk-s28-1')
  R(`${T}.1`, `LL all Tuesday filed; ${CSN} on a blank flying line (took ${s0.took})`, fmt(s), active(s.w) && s.w.ring && active(s.f) ? 'PASS' : 'FAIL', shots(s.w, s.f))
  const n1 = s.w.bar
  const h = await B.hide(p, TUE, /On leave/)
  s = await read('dk-s28-2')
  R(`${T}.2`, `the line's ✕ pressed (${h}); before: bar "${n1}"`, fmt(s), hiddenLine(s.w) && !s.w.ring && !s.w.chip && s.w.bar !== n1 ? 'PASS' : 'FAIL', shots(s.w, s.f))
  await D.reload(p); s = await read('dk-s28-3')
  R(`${T}.3`, 'page reloaded and signed in again as the admin', fmt(s), hiddenLine(s.w) && !s.w.ring ? 'PASS' : 'FAIL', shots(s.w, s.f))
  /* signed in as the member: View-only Sched */
  await B.reloadAs(p, 'm'); await sleep(500)
  await L.go(p, 'viewsched'); await sleep(400)
  const mv = await D.card(p, '#vWeek', TUE, 'dk-s28-4-member', { puck: false })
  R(`${T}.4`, 'page reloaded and signed in as the member (View-only Sched)', `MEMBER'S FACE: ${D.sayCard(mv)} · ✕/↺ buttons in the list: ${await p.evaluate(i => document.querySelectorAll(`#vWeek .day[data-day="${i}"] [data-woff]`).length, TUE)}`, 'RECORDED', shots(mv))
  await D.reload(p); await B.reloadAs(p, 'a'); await B.toEdit(p)
  const u = await B.again(p, TUE, /On leave/)
  s = await read('dk-s28-5')
  R(`${T}.5`, `signed in as the admin again; the line's ↺ pressed (${u})`, fmt(s), active(s.w) && s.w.ring ? 'PASS' : 'FAIL', shots(s.w, s.f))

  /* publication with the warning hidden */
  const h2 = await B.hide(p, TUE, /On leave/)
  const pub = await D.pub(p)
  s = await read('dk-s28-6', { look: true, lookPic: true })
  R(`${T}.6`, `the line hidden again (${h2}) and the day published (${JSON.stringify(pub.r)})`, fmt(s), hiddenLine(s.w) && hiddenLine(s.f) && !s.f.ring && s.l && hiddenLine(s.l) ? 'PASS' : 'FAIL', shots(s.w, s.f, s.l))
  const u2 = await B.again(p, TUE, /On leave/)
  s = await read('dk-s28-7', { look: true })
  R(`${T}.7`, `after publishing: the ↺ pressed on the working copy (${u2})`, fmt(s) + ` · pending chip "${s.w.hd.pend}" · ${s.w.hd.nys}`, active(s.w) && s.w.ring && hiddenLine(s.f) && !s.f.ring && s.l && hiddenLine(s.l) ? 'PASS' : 'FAIL', shots(s.w, s.f))
  await D.reload(p); s = await read('dk-s28-8', { look: true })
  R(`${T}.8`, 'page reloaded', fmt(s) + ` · pending chip "${s.w.hd.pend}" · ${s.w.hd.nys}`, active(s.w) && s.w.ring && hiddenLine(s.f) && !s.f.ring ? 'PASS' : 'FAIL', shots(s.w, s.f))
  const am = await D.amend(p)
  s = await read('dk-s28-9', { look: true, lookPic: true })
  R(`${T}.9`, `Publish AL1 (${JSON.stringify(am.r)})`, fmt(s) + ` · versions ${JSON.stringify(await D.versionsOf(p))}`, active(s.f) && s.f.ring && s.l && hiddenLine(s.l) && pendN(s.w) === 0 ? 'PASS' : 'FAIL', shots(s.w, s.f, s.l))
  const h3 = await B.hide(p, TUE, /On leave/)
  s = await read('dk-s28-10', { look: true })
  R(`${T}.10`, `hidden again after AL1 (${h3})`, fmt(s) + ` · pending chip "${s.w.hd.pend}" · ${s.w.hd.nys}`, hiddenLine(s.w) && !s.w.ring && active(s.f) && s.f.ring ? 'PASS' : 'FAIL', shots(s.w, s.f))
} catch (e) { R(T, 'script', String(e.stack || e).slice(0, 800), 'FAIL', [await B.pic(p, 's28-X')]) }
R(`${T}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
B.savePart('bta-D-s28')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}  ${r.did}\n      → ${String(r.saw).slice(0, 1800)}\n      pics ${(r.pics || []).join(' ')}`)
