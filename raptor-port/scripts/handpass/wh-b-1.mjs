/* WALKER B — Astra's scenario 1: Insights opened on View-only Sched while a hide is pending. RECORDED, not judged —
   the plan knows Insights reads the working copy for every number it shows; the owner will be asked. */
import * as B from './wh-b-lib.mjs'
const { L, W, TUE, judge, row, pic, savePart, nIssues, lineOf, short, K } = B
const S = '1', k = K.long
B.prefix('s1-')
const { browser, p, errors } = await B.world()
const pick = (r) => { const ty = (r.byType || []).find(x => /^Long work day/i.test(x)) || '(no "Long work day" row)'; const dy = (r.byDay || []).find(x => /^Tuesday/i.test(x)) || '(no Tuesday row)'; return { tile: r.tile, type: ty, day: dy } }
const say = (face, i) => `the published face's Tuesday bar: "${face}" · Insights — week tile "${i.tile}" · Conflicts by type "${i.type}" · By day "${i.day}"`
const num = s => { const m = /(\d+)/.exec(s || ''); return m ? +m[1] : null }
async function memberLook(name) {
  const m = await B.member(p, TUE, [k.who], `s${S}-${name}-face`)
  const r = await B.insights(p, `s${S}-${name}-insights`)
  return { m, i: pick(r), raw: r, shots: [...m.shots, r.shot, r.shot2] }
}
try {
  await B.toEdit(p)
  await B.pubOrig(p, TUE)
  await L.settle(p)
  const a = await memberLook('a-before')
  row(`${S}.a`, 'Tuesday published with all four warnings flagged; the member (Ranger), View-only Sched → Insights', say(a.m.list.bar, a.i), 'RECORDED', a.shots)

  await B.admin(p)
  const did = await B.hide(p, TUE, k.re)
  const wi = pick(await B.insights(p, `s${S}-b-scheduler-insights`))
  const b = await memberLook('b-pending')
  row(`${S}.b`, `the scheduler: ✕ on Static's long work day (${did}; 1 pending, not published); the member again → Insights`, say(b.m.list.bar, b.i) + ` · [the scheduler's own Insights on Edit Schedule at this moment: tile "${wi.tile}", "${wi.type}", "${wi.day}"]`, 'RECORDED', b.shots)

  await B.admin(p)
  await B.pubAL(p, TUE)
  const c = await memberLook('c-after-AL1')
  row(`${S}.c`, 'the scheduler signs and publishes AL1; the member again → Insights', say(c.m.list.bar, c.i), 'RECORDED', c.shots)

  /* the plain facts, stated without a verdict */
  const face = [a, b, c].map(x => nIssues(x.m.list)), day = [a, b, c].map(x => num(x.i.day.replace(/^.*formations/, ''))), tile = [a, b, c].map(x => num(x.i.tile)), type = [a, b, c].map(x => num(x.i.type.replace(/^\D+/, '')))
  row(`${S}.sum`, 'the three checkpoints side by side (before the hide · hide pending · after AL1)',
    `the published face's Tuesday count ${face.join(' → ')} · Insights "By day" Tuesday ${day.join(' → ')} · Insights week total ${tile.join(' → ')} · Insights "Long work day" ${type.join(' → ')}. ` +
    (day[1] !== face[1] ? `WHILE THE HIDE WAITS, Insights on View-only Sched already shows one fewer than the published face the member is looking at (it follows the working copy); its three figures agree with each other.` : `While the hide waits, Insights agrees with the published face.`),
    'RECORDED', [b.shots[0], b.shots[b.shots.length - 2], b.shots[b.shots.length - 1]])
} catch (e) { row(`${S}.X`, 'the script stopped', String(e && e.stack || e).slice(0, 600), 'FAIL', [await pic(p, `s${S}-X-error`)]) }
row(`${S}.err`, 'the browser\'s error list through this scenario', errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart(`s${S}`, { errors })
await browser.close()
