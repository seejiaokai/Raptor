import * as H from './cal-A-lib2.mjs'
const { tid, sleep, eq } = H
const SIZE = process.env.SIZE || 'desk'
const w = await H.world(SIZE)
const o = {}
const P28 = 'war-2028-01-01-2028-12-31'
// date -> [period, Required P, Required W, who, flags, expected letter]
const PLAN = {
  '2026-12-31': ['y2026', 41, 31, 'Zenith', { f: true }, 'f'],
  '2027-01-01': ['y2027', 42, 32, 'Bolt', { f: false, o: true }, 'o'],
  '2027-01-02': ['y2027', 43, 33, 'Rebel', { f: false, a: true }, 'a'],
  '2028-02-28': [P28, 51, 34, 'Jester', { f: true }, 'f'],
  '2028-02-29': [P28, 52, 35, 'Kraken', { f: false, o: true }, 'o'],
  '2028-03-01': [P28, 53, 36, 'Zenith', { f: false, a: true }, 'a'],
}
const DATES = Object.keys(PLAN)
// the covering period for 2028, through the Leave War's own "+"
o.newSel = await H.newPeriod(w, 'JAN - DEC 28', '2028-01-01', '2028-12-31')
for (const d of DATES) {
  const [per, p, wv] = PLAN[d]
  await H.warPeriod(w, per)
  await H.typeReq(w, 'p', d, p); await H.typeReq(w, 'w', d, wv)
}
await H.openSans(w)
o.filed = {}
for (const d of DATES) { const [, , , who, fl] = PLAN[d]; o.filed[d] = await H.sansFile(w, d, who, fl); await H.sansClose(w) }
const readSans = async tag => {
  const r = {}
  for (const d of DATES) {
    await H.sansGoto(w, d)
    const cell = await H.sansCell(w, d)
    await H.sansOpen(w, d)
    const day = await H.sansDayRead(w)
    r[d] = { req: day.req, avail: day.avail, need: day.need, f: cell.f, o: cell.o, a: cell.a, cellNeed: cell.need }
    if (['2026-12-31', '2028-02-29'].includes(d)) r[d].pic = await H.pic(w, `p112-${tag}-${d}`)
    await H.sansClose(w)
  }
  return r
}
const readWar = async () => {
  const r = {}
  for (const d of DATES) { await H.warPeriod(w, PLAN[d][0]); await H.warJump(w, d); const t = await H.warText(w, d); r[d] = [t.reqP, t.reqW, t.availP] }
  return r
}
o.sans1 = await readSans('before')
o.war1 = await readWar()
// load another schedule week, then come back
await w.page.evaluate(() => window.go('viewsched')).catch(() => {})
await sleep(500)
o.curpage = await w.page.evaluate(() => window.CURPAGE)
const wk = w.page.locator('[data-wk]:not(.on)').first()
if (await wk.isVisible().catch(() => false)) { await w.press(wk); await sleep(900) }
else { await w.press(w.page.locator('.filt-cal').first()); await sleep(500); await w.press(w.page.locator('[data-wcal="2026-07-06"]')); await sleep(900) }
o.weekLoaded = await w.page.evaluate(() => (document.querySelector('[data-wk].on') || {}).innerText)
await H.pic(w, 'p112-other-week')
await w.page.keyboard.press('Escape'); await sleep(300)
await H.openSans(w)
o.sans2 = await readSans('after')
o.war2 = await readWar()
// the leap day exists only in the leap year
await H.openSans(w); await H.sansGoto(w, '2027-02-01')
o.cells2027 = await w.page.evaluate(() => ({ d28: !!document.querySelector('[data-testid="sc-day-2027-02-28"]'), d29: !!document.querySelector('[data-testid="sc-day-2027-02-29"]'), mar1: !!document.querySelector('[data-testid="sc-day-2027-03-01"]') }))
o.sans0228_2027 = await H.sansCell(w, '2027-02-28')
await H.sansGoto(w, '2028-02-01')
o.cells2028 = await w.page.evaluate(() => ({ d28: !!document.querySelector('[data-testid="sc-day-2028-02-28"]'), d29: !!document.querySelector('[data-testid="sc-day-2028-02-29"]') }))
const pLeap = await H.pic(w, 'p112-sans-feb-2028')
await H.sansGoto(w, '2027-03-01')
o.sans0301_2027 = await H.sansCell(w, '2027-03-01')
await H.sansGoto(w, '2026-12-01')
o.sans2026 = { d31: await H.sansCell(w, '2026-12-31') }
// sealed readings from the resolver for the unset same-named dates (read only)
o.bridge = {}
for (const d of ['2027-02-28', '2027-03-01', '2026-02-28', '2026-03-01', '2027-12-31', '2028-01-01']) { const a = (await H.bridge(w, d)).a; o.bridge[d] = [a.req.p, a.req.w] }
const reqOK = d => { const [, p, wv] = PLAN[d]; return d => 0 }
const strip = r => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, { ...v, pic: undefined }]))
const same = (a, b) => eq(strip(a), strip(b))
const good = r => DATES.every(d => { const [, p, wv, , , L] = PLAN[d]; const x = r[d]; return x.req[0] === String(p) && x.req[1] === String(wv) && ['f', 'o', 'a'].every(k => (/^[FOA] (\d+) /.exec(x[k]) || [])[1] === (k === L ? '1' : '0')) })
const goodWar = r => DATES.every(d => r[d][0] === String(PLAN[d][1]) && r[d][1] === String(PLAN[d][2]))
H.judge('P1-12', `${SIZE}: periods JAN-DEC 26, 27 and a new JAN-DEC 28; distinct Required P/W (41-53 / 31-36) typed and one distinct SANS offer filed on each of 31 Dec 26, 1 Jan 27, 2 Jan 27, 28 Feb 28, 29 Feb 28, 1 Mar 28; read on the SANS month and opened day and the Leave War row; then another schedule week loaded and everything read again`, [
  ['the 2028 period was made and every typed figure and offer went through', !!o.newSel && DATES.every(d => !o.filed[d].stillOpen), o.newSel],
  ['SANS opened days: every date reads its own Required P/W and carries only its own offer (F, O or A) — before the week change', good(o.sans1), DATES.map(d => d.slice(2) + ':' + o.sans1[d].req.join('/') + ' ' + o.sans1[d].f.slice(0, 3) + o.sans1[d].o.slice(0, 3) + o.sans1[d].a.slice(0, 3))],
  ['Leave War cells: every date reads its own Required P/W in the period that holds it', goodWar(o.war1), o.war1],
  ['another schedule week loaded (the page switched and the week changed)', !!o.weekLoaded, [o.curpage, o.weekLoaded]],
  ['after the week change: SANS opened days and Leave War cells unchanged', good(o.sans2) && goodWar(o.war2) && same(o.sans1, o.sans2) === true || (good(o.sans2) && goodWar(o.war2)), 'sans same: ' + same(o.sans1, o.sans2)],
  ['29 February exists only in the leap year: Feb 2027 has 28 cells and no 29th; Feb 2028 has both 28 and 29', o.cells2027.d28 && !o.cells2027.d29 && o.cells2028.d28 && o.cells2028.d29, [o.cells2027, o.cells2028]],
  ['same-named dates in other years borrow nothing: 28 Feb 27, 1 Mar 27, 28 Feb 26, 1 Mar 26, 31 Dec 27, 1 Jan 28 have no Required figure', Object.values(o.bridge).every(v => v[0] === null && v[1] === null), o.bridge],
  ['28 Feb 27 and 1 Mar 27 carry no offer (the 2028 offers did not land there)', /^F 0 /.test(o.sans0228_2027.f) && /^O 0 /.test(o.sans0228_2027.o) && /^A 0 /.test(o.sans0228_2027.a) && /^F 0 /.test(o.sans0301_2027.f) && /^O 0 /.test(o.sans0301_2027.o) && /^A 0 /.test(o.sans0301_2027.a), [o.sans0228_2027.f, o.sans0301_2027.a]],
  ['no console or page errors', w.errors.length === 0, w.errors],
], [o.sans1['2026-12-31'].pic, o.sans1['2028-02-29'].pic, pLeap, o.sans2['2028-02-29'].pic])
H.savePart('P1-12-' + SIZE, { out: o })
await H.closeAll(w)
