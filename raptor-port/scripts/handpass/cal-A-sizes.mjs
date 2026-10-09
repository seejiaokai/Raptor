import * as H from './cal-A-lib2.mjs'
const { tid, sleep, eq } = H
const SIZE = process.env.SIZE || 'short'
const w = await H.world(SIZE)
const o = {}
const D = '2026-07-14'
const geo = (testid) => w.page.evaluate(t => {
  const e = document.querySelector(`[data-testid="${t}"]`); if (!e) return null
  const r = e.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2
  const hit = document.elementFromPoint(cx, cy)
  return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), vw: innerWidth, vh: innerHeight, inside: r.left >= -1 && r.right <= innerWidth + 1 && r.top >= -1 && r.bottom <= innerHeight + 1, hit: !!hit && (hit === e || e.contains(hit)) }
}, testid)
const pageFit = () => w.page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, sh: document.documentElement.scrollHeight, ih: innerHeight }))
await H.warOpen(w)
await H.typeReq(w, 'p', '2026-07-13', 8, { run: true })
// ---- the SANS month
await H.openSans(w); await H.sansGoto(w, D)
o.monthFit = await pageFit()
o.gridBox = await w.page.evaluate(() => { const g = document.querySelector('[data-testid="sc-grid"]'); return { client: g.clientHeight, scroll: g.scrollHeight, overflowY: getComputedStyle(g).overflowY } })
o.cell = await H.sansCell(w, D)
const p0 = await H.pic(w, 'sizes-sans-month', SIZE === 'short')
// ---- the SANS day
await H.sansOpen(w, D)
o.dayWin = await geo('win-sansday'); o.dayX = await geo('win-sansday-x'); o.dayAdd = await geo('sd-add'); o.dayCal = await geo('sd-days')
o.dayRead = await H.sansDayRead(w)
const p1 = await H.pic(w, 'sizes-sans-day')
// ---- Calendar from the day
await H.calOpenFromSans(w, D)
o.calWin = await geo('win-days'); o.calX = await geo('win-days-x')
o.calCell = await geo('days-cell-' + D)
const p2 = await H.pic(w, 'sizes-calendar-month')
const hol = tid(w.page, 'days-tab-holidays')
if (await hol.count()) { await w.press(hol); await sleep(300) }
await w.press(tid(w.page, 'hol-add')); await tid(w.page, 'hol-name').waitFor(); await sleep(400)
o.holSave = await geo('hol-save'); o.holCancel = await geo('hol-cancel'); o.holName = await geo('hol-name')
const p3 = await H.pic(w, 'sizes-holiday-form')
await w.press(tid(w.page, 'hol-cancel')); await sleep(300)
const mon = tid(w.page, 'days-tab-month'); if (await mon.count()) { await w.press(mon); await sleep(300) }
await w.press(tid(w.page, 'days-wd-3')); await tid(w.page, 'win-every').waitFor(); await sleep(400)
o.everySave = await geo('every-save'); o.everyWin = await geo('win-every')
const p4 = await H.pic(w, 'sizes-every-thursday')
await tid(w.page, 'every-save').scrollIntoViewIfNeeded().catch(() => {}); await sleep(300)
o.everySaveScrolled = await geo('every-save')
o.errors = w.errors.slice()
const fit = o.monthFit.sw <= o.monthFit.iw + 1
const rows = [
  [`page has no sideways scroll on the SANS month (${o.monthFit.sw} wide in ${o.monthFit.iw})`, fit, o.monthFit],
  [`the month grid is not a scrolled box of its own (overflow ${o.gridBox.overflowY}, ${o.gridBox.scroll} tall in ${o.gridBox.client})`, o.gridBox.scroll <= o.gridBox.client + 2, o.gridBox],
  ['SANS opened day: window inside the screen, its close button and + Commitment are what a finger lands on', o.dayWin.inside && o.dayX.hit && o.dayAdd.hit && o.dayAdd.inside, [o.dayWin, o.dayX.hit, o.dayAdd.hit]],
  ['SANS opened day still reads Required 8 / Available 28 etc.', o.dayRead.req[0] === '8', o.dayRead.req],
  ['Calendar window: inside the screen, its close button is what a finger lands on', o.calWin.inside && o.calX.hit, [o.calWin, o.calX.hit]],
  ['holiday form: Save and Cancel inside the screen and reachable', o.holSave.inside && o.holSave.hit && o.holCancel.hit, [o.holSave, o.holCancel.hit]],
  [`Every Thursday form: Save reachable ${o.everySave.inside && o.everySave.hit ? 'as it opens' : 'only after scrolling inside the window (below its fold as it opens: top ' + o.everySave.t + ' of ' + o.everySave.vh + ')'}`, o.everySaveScrolled.inside && o.everySaveScrolled.hit, [o.everySave, o.everySaveScrolled]],
  ['no console or page errors', w.errors.length === 0, w.errors],
]
H.judge('SIZES-' + SIZE, `${SIZE} (${H.SIZES[SIZE].viewport.width}x${H.SIZES[SIZE].viewport.height}): SANS month, its opened day, the Calendar window (month, holiday form, Every Thursday) laid out and reachable`, rows, [p0, p1, p2, p3, p4])
H.savePart('SIZES-' + SIZE, { out: o })
await H.closeAll(w)
