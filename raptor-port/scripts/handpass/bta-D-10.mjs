/* Walker D — a closer look at one thing seen in the PSFA / PFSA orders: the pending chip in the 👁 look at the Original compared with the working copy's own chip. */
import * as D from './bta-D-lib.mjs'
const { B, K, TUE, CSN } = D
const R = K.R
const T = 'OBS-LOOKCHIP'
const { browser, p, errors } = await K.fresh()
try {
  await D.pub(p)
  await D.seatBlank(p)
  const a = await D.work(p, 'dk-obs-1-after-seat'); const la = await D.lookAt(p, /Original/i, 'dk-obs-1-after-seat')
  R(`${T}.1`, 'Tuesday published; then Vandal put on a new blank line', `working chip "${a.hd.pend}" · look chip "${la.hd.pend}"`, 'RECORDED', [a.shot, la.shot])
  await D.file(p, 'LL', 'Walker D')
  const b = await D.work(p, 'dk-obs-2-after-leave'); const lb = await D.lookAt(p, /Original/i, 'dk-obs-2-after-leave')
  R(`${T}.2`, 'then a whole-day LL filed for him on the Inputs page', `working chip "${b.hd.pend}" · look chip "${lb.hd.pend}" · look sign-off marker "${lb.hd.nys}" · working marker "${b.hd.nys}"`, 'RECORDED', [b.shot, lb.shot])
  const c = await B.auth(p, TUE)
  R(`${T}.3`, "the day's changes window (the working chip tapped): 'To go out' list", `${B.authLine(c)}`, 'RECORDED', (c.win && c.win.shots) || [])
} catch (e) { R(T, 'script', String(e.stack || e).slice(0, 800), 'FAIL', [await B.pic(p, 'obs-X')]) }
R(`${T}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
B.savePart('bta-D-obs')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}  ${r.did}\n      → ${String(r.saw).slice(0, 2400)}\n      pics ${(r.pics || []).join(' ')}`)
