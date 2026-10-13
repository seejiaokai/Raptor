/* W2 N-W, N-D, N1a, N1b, N2, N4 — publish, unpublish on the week itself; phone then desk.  usage: node n1-publish.mjs phone|desk */
import { L, toastNow, toastShown, clearToast, signDay, pressDay, head, sleep, DAYS } from './w2lib.mjs'
console.log('n1-publish v2')
const size = process.argv[2] || 'phone'
const w = await L.world(size)
const p = w.page
const rec = (id, verdict, saw, pic) => console.log(`== ${id} [${size}] ${verdict}\n   saw: ${saw}${pic ? '\n   pic: ' + pic : ''}`)
const settled = async () => { await sleep(600); return toastNow(p) }
try {
  await L.go(w, 'editsched')
  const DI = 2  // Wednesday
  console.log('sign', JSON.stringify(await signDay(p, DI)))
  const r = await pressDay(w, 'data-beak', DI)
  const t = await settled()
  const pic1 = await L.pic(w, `n1a-${size}-published`)
  const want = `${DAYS[DI]} published and approved`
  rec('N1a', t && t.text === want ? 'PASS' : 'FAIL', t ? JSON.stringify(t.text) + ' opacity ' + t.opacity + ' (first read: ' + JSON.stringify(r.toast && r.toast.text) + ')' : 'NO NOTE', pic1)
  if (t) {
    const b = t.box
    if (size === 'phone') {
      const left = b.x, right = t.vw - b.right, bottomGap = t.vh - b.bottom
      rec('N-W', (Math.abs(left - 12) < 0.6 && Math.abs(right - 12) < 0.6 && Math.abs(bottomGap - 26) < 0.6 && t.align === 'center') ? 'PASS' : 'FAIL',
        `settled: left ${left}, right ${right}, width ${b.w}, bottom gap ${bottomGap}, text-align ${t.align}; viewport ${t.vw}x${t.vh}; no board, no window open`, pic1)
    } else {
      const lc = b.x + b.w / 2, sc = t.vw / 2
      rec('N-D', (Math.abs(lc - sc) < 2 && b.w < t.vw * 0.5) ? 'PASS' : 'FAIL', `left ${b.x}, width ${b.w}, centre ${lc} vs screen centre ${sc}, viewport ${t.vw}x${t.vh}, bottom gap ${t.vh - b.bottom}`, pic1)
    }
  }
  /* N2 */
  console.log('head after publish', JSON.stringify(await head(p, DI)))
  const u1 = await pressDay(w, 'data-unpub', DI)
  const t2 = await settled()
  const pic2 = await L.pic(w, `n2-${size}-unpublished`)
  const want2 = `${DAYS[DI]} unpublished. It is a draft again, and publishing reissues the Original.`
  rec('N2', t2 && t2.text === want2 ? 'PASS' : 'FAIL', t2 ? JSON.stringify(t2.text) : 'NO NOTE; button label ' + u1.label, pic2)
  if (size === 'phone') {
    /* N1b Saturday */
    await clearToast(p)
    const SA = 5
    console.log('sign Sat', JSON.stringify(await signDay(p, SA)))
    const rs = await pressDay(w, 'data-beak', SA)
    const ts = await settled()
    const pic3 = await L.pic(w, `n1b-${size}-saturday-published`)
    const want3 = 'Saturday 18 Jul published and approved. The Common Programme has no usable times, so nobody on it earns OIL.'
    rec('N1b', ts && ts.text === want3 ? 'PASS' : 'FAIL', ts ? JSON.stringify(ts.text) : 'NO NOTE; ' + JSON.stringify(rs), pic3)
    /* unpublish Saturday: does it ask twice? */
    const us = await pressDay(w, 'data-unpub', SA)
    const tu = await settled()
    const hs = await head(p, SA)
    const pic4 = await L.pic(w, `n4-${size}-saturday-unpublish`)
    rec('N4 probe (Saturday unpublish, first press)', 'INFO', `button now ${JSON.stringify(hs && hs.unpub)}; note ${tu ? JSON.stringify(tu.text) : 'none'}`, pic4)
  }
} finally {
  await L.close(w)
}
