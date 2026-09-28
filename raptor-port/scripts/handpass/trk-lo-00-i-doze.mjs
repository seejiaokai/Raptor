/* [TRK-LEFTOVERS] baseline — O (w3 O5): `src/ui/scheduler.css` says a dozing
   page's insides "read 0×0 exactly as under display:none". Visit the Tracker,
   go to another page (Quals, then Leave War), and read getBoundingClientRect()
   of elements inside #page-tracker while it dozes. Desktop 1440x900, admin. */
import { open, shot, save, log, toPage, toTracker, DESK } from './trk-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
const read = () => page.evaluate(() => {
  const sec = document.getElementById('page-tracker')
  const r = sel => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)] }
  return {
    page: window.CURPAGE, trackerClass: sec.className, cv: getComputedStyle(sec).contentVisibility, display: getComputedStyle(sec).display,
    section: r('#page-tracker'), bar: r('#page-tracker header'), board: r('#board'), ball: r('#flowSvg .ball'), crew: r('#activeSel'),
  }
})
const on = await read()
L.note('O.1 on the Tracker (x, y, width, height)', JSON.stringify(on))
for (const p of ['quals', 'leavewar']) {
  await toPage(page, p)
  const d = await read()
  L.note(`O.2 on ${p}: the Tracker section and its insides`, JSON.stringify(d))
  L.ok(`O.3 on ${p}: a dozing Tracker's insides read 0×0 (as the stylesheet comment says)`, [d.bar, d.board, d.ball, d.crew].every(b => b && b[2] === 0 && b[3] === 0), `class "${d.trackerClass}", content-visibility ${d.cv}; bar ${JSON.stringify(d.bar)} · board ${JSON.stringify(d.board)} · a ball ${JSON.stringify(d.ball)} · crew box ${JSON.stringify(d.crew)}`)
  await shot(page, `lo-O-${p}-tracker-dozing`)
}
await toTracker(page)
L.note('O.4 back on the Tracker', JSON.stringify(await read()))
save('lo-I-doze', { rows: L.rows, errors })
console.log('errors', JSON.stringify(errors))
await browser.close()
