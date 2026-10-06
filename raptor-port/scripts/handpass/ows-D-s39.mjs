/* S39 — weekday, public holiday before / after issue, and Off day (the Leave War's own event row) */
import * as D from './ows-D-lib.mjs'
const { world, sleep, A, R, W, L, P, judge, pend, ISO } = D
const TUE = 1, SAT = 5
const log = (...a) => console.log('>>', ...a)
const allErrors = []

async function declare(p, iso, label) {
  await L.go(p, 'leavewar'); await sleep(900)
  const m = p.locator('[data-testid="month-JUL"]'); if (await m.count()) { await m.first().click(); await sleep(900) }
  const c = p.locator(`[data-testid="event-0-${iso}"]`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(250)
  await c.click(); await sleep(600)
  /* the preset chips above the TAG row: PH / Off day / No Leave / SC */
  const chip = p.locator('[data-testid="event-text"]').locator('xpath=ancestor::*[self::div][3]').getByRole('button', { name: label, exact: true }).first()
  if (await chip.count()) await chip.click(); else await p.locator('[data-testid="event-text"]').fill(label)
  await sleep(200)
  const typed = await p.locator('[data-testid="event-text"]').inputValue()
  await p.locator('[data-testid="event-apply"]').click(); await sleep(800)
  const cell = await p.evaluate(d => ((document.querySelector(`[data-testid="event-0-${d}"]`) || {}).innerText || '').trim(), iso)
  const f = await P(p, `declare-${label.replace(/\W/g, '')}-${iso}`)
  return { typed, cell, pic: f }
}
async function flight(p, di, to = '12:00', ld = '13:00', it = 'IN TIME 0830') {
  await L.go(p, 'editsched'); await sleep(300)
  const w = await D.flyingWave(p, di, { cs: 'VIPER', to, ld, p1: 'bane' })
  await A.closeBoard(p); await A.toWeek(p); await W.showDay(p, di)
  await A.addItBtn(p, di, w.wi)
  await A.setItLine(p, di, w.wi, 0, it)
  return w
}
async function report(p, name, di) {
  const d = await D.dayState(p, di, name)
  const o = await D.oilOf(p, 'bane', ISO[di], name)
  return { d, o, pics: [...d.pics, ...o.pics] }
}
const ok = o => o.letters === 'FO' && /08:30.15:00/.test(o.row)
const none = o => o.letters !== 'FO' && o.letters !== 'HO'

/* ---- run A: an ordinary weekday ---- */
{
  const { browser, p, errors } = await world()
  const w = await flight(p, TUE)
  const pub = await A.publishNew(p, TUE); await A.closeBoard(p)
  const r = await report(p, 'S39A-weekday', TUE)
  judge('S39.A', 'ordinary Tuesday 14 Jul: Ranger on VIPER 12:00–13:00, IN TIME 0830; four sign-offs; Publish day', [
    ['published ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag],
    ['Leave War: nothing', none(r.o), r.o.cell.text],
    ['tracker: no credit for the 14th', !/14 Jul/.test(r.o.row), r.o.row.slice(0, 120)],
  ], r.pics)
  allErrors.push(...errors); await browser.close()
}
/* ---- run B: PH declared BEFORE publishing ---- */
{
  const { browser, p, errors } = await world()
  const dec = await declare(p, ISO[TUE], 'PH')
  log('declared PH', JSON.stringify({ typed: dec.typed, cell: dec.cell }))
  const w = await flight(p, TUE)
  const pre = await report(p, 'S39B-before-publish', TUE)
  const pub = await A.publishNew(p, TUE); await A.closeBoard(p)
  const r = await report(p, 'S39B-published', TUE)
  judge('S39.B', 'Tuesday 14 Jul declared PH on the Leave War event row BEFORE anything is published; same flight; four sign-offs; Publish day', [
    ['the event row shows PH on the 14th', /PH/.test(dec.cell), dec.cell],
    ['before publishing: nothing paid', none(pre.o), pre.o.cell.text],
    ['published ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag],
    ['Leave War: FO', r.o.letters === 'FO', r.o.cell.text],
    ['tracker worked 08:30–15:00', /08:30.15:00/.test(r.o.row), r.o.row.slice(0, 160)],
  ], [dec.pic, ...pre.pics, ...r.pics])
  allErrors.push(...errors); await browser.close()
}
/* ---- run C: PH declared AFTER a non-earning issue ---- */
{
  const { browser, p, errors } = await world()
  const w = await flight(p, TUE)
  const pub = await A.publishNew(p, TUE); await A.closeBoard(p)
  const r0 = await report(p, 'S39C-issued-weekday', TUE)
  const dec = await declare(p, ISO[TUE], 'PH')
  const r1 = await report(p, 'S39C-ph-after', TUE)
  const am = await A.publishAm(p, TUE); await A.closeBoard(p)
  const r2 = await report(p, 'S39C-reissued', TUE)
  log('C: after PH, chip', r1.d.head.pending, '| list', r1.d.list.slice(0, 300), '| marker', r1.d.head.nys)
  judge('S39.C', 'ordinary Tuesday issued first (no credit); then Tuesday declared PH; then four sign again and Publish AL', [
    ['issued without credit', none(r0.o), r0.o.cell.text],
    ['PH declared', /PH/.test(dec.cell), dec.cell],
    ['no paid credit yet (cell empty)', none(r1.o), r1.o.cell.text],
    ['no tracker row for the 14th yet', !/14 Jul/.test(r1.o.row), r1.o.row.slice(0, 120)],
    ['the day reads pending (a change waits)', pend(r1.d.head) !== '0', r1.d.head.pending],
    ['AL1 published', am.head && /AL\s*1/.test(am.head.tag), am.head && am.head.tag],
    ['after the AL: FO, worked 08:30–15:00', ok(r2.o), `${r2.o.cell.text} | ${r2.o.row.slice(0, 140)}`],
  ], [dec.pic, ...r0.pics, ...r1.pics, ...r2.pics])
  allErrors.push(...errors); await browser.close()
}
/* ---- run D: an Off day ---- */
{
  const { browser, p, errors } = await world()
  const dec = await declare(p, ISO[TUE], 'Off day')
  log('declared Off day', JSON.stringify({ typed: dec.typed, cell: dec.cell }))
  await flight(p, TUE)
  const pub = await A.publishNew(p, TUE); await A.closeBoard(p)
  const r = await report(p, 'S39D-offday-tue', TUE)
  judge('S39.D1', 'Tuesday 14 Jul declared "Off day" before publishing; flight with IN TIME; Publish day', [
    ['event row shows Off day', /off/i.test(dec.cell), dec.cell],
    ['published ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag],
    ['Leave War: nothing', none(r.o), r.o.cell.text],
  ], [dec.pic, ...r.pics])
  /* an issued weekend credit, then the day declared Off day */
  await flight(p, SAT)
  const pub2 = await A.publishNew(p, SAT); await A.closeBoard(p)
  const s0 = await report(p, 'S39D-sat-issued', SAT)
  const dec2 = await declare(p, ISO[SAT], 'Off day')
  const s1 = await report(p, 'S39D-sat-offday', SAT)
  log('D2: after Off day on the issued Saturday: cell', s1.o.cell.text, '| chip', s1.d.head.pending, '| list', s1.d.list.slice(0, 300))
  const am = await A.publishAm(p, SAT); await A.closeBoard(p)
  const s2 = await report(p, 'S39D-sat-reissued', SAT)
  judge('S39.D2', 'Saturday 18 Jul issued with credit; then declared "Off day"; then four sign again and Publish AL', [
    ['issued credit FO 08:30–15:00', ok(s0.o), `${s0.o.cell.text} | ${s0.o.row.slice(0, 140)}`],
    ['Off day declared', /off/i.test(dec2.cell), dec2.cell],
    ['credit held until the change is issued: cell still FO', s1.o.letters === 'FO', s1.o.cell.text],
    ['tracker still shows the credit', /08:30.15:00/.test(s1.o.row), s1.o.row.slice(0, 140)],
    ['the day reads pending', pend(s1.d.head) !== '0', s1.d.head.pending],
    ['after the AL: credit gone', none(s2.o), `${s2.o.cell.text} | ${s2.o.row.slice(0, 140)}`],
  ], [dec2.pic, ...s0.pics, ...s1.pics, ...s2.pics])
  allErrors.push(...errors); await browser.close()
}
console.log('ERRORS', JSON.stringify(D.cleanErr(allErrors)))
D.savePart('ows-D-s39', { errors: D.cleanErr(allErrors), pics: D.pics.saved })
