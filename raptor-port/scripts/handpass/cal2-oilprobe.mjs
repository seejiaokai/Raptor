/* CALENDAR STEP TWO — a probe for the walk's own steps (not a check of the app): where things sit on the phone.
   usage: DL_BASE=… DL_SHOTS=… node scripts/handpass/cal2-oilprobe.mjs [desk|phone] */
import * as L from './dl-lib.mjs'
const w = await L.world(process.argv[2] || 'phone')
const p = w.page
try {
  await L.go(w, 'inputs')
  console.log('list btn visible', await p.locator('#inListBtn:visible').count())
  if (await p.locator('#inListBtn:visible').count()) await w.press('#inListBtn')
  await L.sleep(400)
  await p.evaluate(() => window.scrollTo(0, 0)); await L.sleep(300)
  console.log(await p.evaluate(() => {
    const r = e => { const b = e?.getBoundingClientRect(); return b ? [Math.round(b.top), Math.round(b.bottom), Math.round(b.left), Math.round(b.right)] : null }
    const n = document.getElementById('inNew'), tb = document.querySelector('.topbar')
    const b = n.getBoundingClientRect(), h = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)
    return { inNew: r(n), hidden: n.hidden, display: getComputedStyle(n).display, topbar: r(tb), hit: h ? h.className : null, scrollY, all: [...document.querySelectorAll('[id="inNew"], .in-new')].length }
  }))
  await L.pic(w, 'probe-inputs-list-phone')
} finally { await L.close(w) }
