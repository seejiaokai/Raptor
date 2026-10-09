// Scenario 38 - ALL / ALL AVAIL after publication (member files, admin publishes, member retitles). usage: node it-B-s38.mjs desk
import * as L from './it-B-lib.mjs'
const size = process.argv[2] || 'desk'
const WED = 2, SAT = 5
const FOC = 'open house|town hall|sports day|games afternoon|^event$'
const rowsText = (p, di) => p.evaluate(di => [...document.querySelectorAll(`#eWeek .day[data-day="${di}"] .pl-row.gr-frominput`)].map(r => r.textContent.replace(/\s+/g, ' ').trim().slice(0, 160)), di)
const counts = (p, di) => p.evaluate(di => [...document.querySelectorAll(`#eWeek .day[data-day="${di}"] .oilcount`)].map(e => e.textContent.replace(/\s+/g, ' ').trim()), di)
for (const variant of ['A', 'B']) {
  const W = await L.mk(size, { who: 'us', pass: 'us' })
  const p = W.page
  L.setWeek(null)
  const tag = `s38-${size}-${variant}`
  // the member files the two placeholders
  await L.fileInput(W, { iso: '2026-07-15', type: 'Event', person: 'all', s: '09:00', e: '10:00', title: 'Open house', rmk: 'all one' })
  const q2 = await L.fileInput(W, { iso: '2026-07-18', type: 'Event', person: 'allavail', s: '09:00', e: '12:00', title: 'Sports day', rmk: 'allavail one', oil: 'yes' })
  const boardRead = async (di, t) => {
  await L.openBoard(W, di)
  const d = await p.evaluate(() => ({ counts: [...document.querySelectorAll('#schedBoard .oilcount')].map(e => e.textContent.replace(/\s+/g, ' ').trim()), rows: [...document.querySelectorAll('#schedBoard .sb-arow.c6r')].map(r => { const f = r.querySelector('[data-bfld$=".prog"]'); return f && /open house|town hall|sports day|games afternoon|^event$/i.test(f.value || '') ? ((f.value || '') + ' :: ' + r.textContent.replace(/\s+/g, ' ').trim().slice(0, 140)) : null }).filter(Boolean) }))
  await L.boardFocus(p, FOC); await L.shot(p, t)
  await L.closeBoard(p)
  return d
  }
  const recs = () => p.evaluate(() => window.INPUTS.filter(x => (x.person === 'all' || x.person === 'allavail') && x.type === 'Event' && x.remarks && /one$/.test(x.remarks)).map(x => ({ iid: x.iid, person: x.person, title: x.title, oil: JSON.stringify(x.oil || null), rmk: x.remarks, date: x.date })))
  const r0 = await recs()
  console.log('filed', JSON.stringify(r0), 'oil question on ALL AVAIL:', q2)
  await L.switchUser(W, 'ad', 'a')
  await L.pubDay(W, WED); await L.pubDay(W, SAT)
  const rd = async t => {
    const a = await L.snap(W, WED, { focus: FOC, pic: t + '-wed' }); const ca = await counts(p, WED); const ra = await rowsText(p, WED)
    const b = await L.snap(W, SAT, { focus: FOC, pic: t + '-sat' }); const cb = await counts(p, SAT); const rb = await rowsText(p, SAT)
    const rr = await recs()
    const ba = await boardRead(WED, t + '-wed-board'), bb = await boardRead(SAT, t + '-sat-board')
    return { s: { a, b, ca, ra, cb, rb, rr, ba, bb }, text: `WED(ALL): pend ${a.f.pend.join(',') || '0'} nys ${a.f.nys ? 'YES' : 'no'} rows ${L.nm(a.f)} view ${L.nm(a.v)} counts ${JSON.stringify(ca)} rowtext ${JSON.stringify(ra)} togo ${(a.togo || '').replace(/^.*?Waiting/, 'Waiting').slice(0, 160)} || SAT(ALL AVAIL): pend ${b.f.pend.join(',') || '0'} nys ${b.f.nys ? 'YES' : 'no'} rows ${L.nm(b.f)} view ${L.nm(b.v)} counts ${JSON.stringify(cb)} rowtext ${JSON.stringify(rb)} togo ${(b.togo || '').replace(/^.*?Waiting/, 'Waiting').slice(0, 160)} || BOARD WED ${JSON.stringify(ba)} BOARD SAT ${JSON.stringify(bb)} || records ${JSON.stringify(rr.map(x => x.person + ':' + x.title + ':oil=' + x.oil))}`, pics: [t + '-wed-edit.png', t + '-wed-togo.png', t + '-sat-edit.png', t + '-sat-togo.png', t + '-wed-board.png', t + '-sat-board.png'] }
  }
  const base = await rd(tag + '-1published')
  // the member retitles both
  await L.switchUser(W, 'us', 'us')
  const heads = []
  for (const x of r0) heads.push(await L.retitle(W, x.iid, x.person === 'all' ? '2026-07-15' : '2026-07-18', x.person === 'all' ? 'Town hall' : 'Games afternoon'))
  console.log('oil questions on retitle:', JSON.stringify(heads))
  const readRecs = () => p.evaluate(() => window.INPUTS.filter(x => /one$/.test(x.remarks || '')).map(x => x.person + ':' + x.title).sort().join(','))
  const mem = await readRecs()
  if (variant === 'A') {
    await p.locator('#undoBtn:visible').first().click(); await L.sleep(800); const u = await readRecs()
    await p.locator('#redoBtn:visible').first().click(); await L.sleep(800); const rdo = await readRecs()
    await L.reload(W); const rl = await readRecs()
    const ok = /all:Open house/.test(u) && /allavail:Games afternoon/.test(u) && /all:Town hall/.test(rdo) && /allavail:Games afternoon/.test(rdo) && /all:Town hall/.test(rl) && /allavail:Games afternoon/.test(rl)
    L.row('38', size, 'member', ok ? 'PASS' : 'FAIL', `[A] after both retitles: ${mem} | Undo: ${u} | Redo: ${rdo} | reload: ${rl}`, [])
  } else {
    await p.locator('#undoBtn:visible').first().click(); await L.sleep(800)
    await L.reload(W)
    const rl = await readRecs()
    L.row('38', size, 'member', /all:Open house/.test(rl) && /allavail:Games afternoon/.test(rl) ? 'PASS' : 'FAIL', `[B] after both retitles then Undo (reverts the LAST one, the ALL one) then reload: ${rl}`, [])
  }
  await L.switchUser(W, 'ad', 'a')
  const chg = await rd(tag + '-2retitled')
  const S = chg.s, B = base.s
  const same = (x, y) => JSON.stringify(x) === JSON.stringify(y)
  const okCounts = same(S.ca, B.ca) && same(S.cb, B.cb) && same(S.ra, B.ra.map(t => t)) === same(S.ra, S.ra)
  const oilSame = same(S.rr.map(x => x.oil), B.rr.map(x => x.oil))
  const expectPending = variant === 'A'
  const dayOk = (d, nameNow) => d.f.pend.length === 1 && /1 pending/.test(d.f.pend[0]) && /not yet signed/i.test(d.f.nys) && d.f.rows.some(x => x.name === nameNow && x.kind === 'EVENT') && !d.v.rows.some(x => x.name === nameNow)
  const okChg = expectPending
    ? dayOk(S.a, 'TOWN HALL') && dayOk(S.b, 'GAMES AFTERNOON') && same(S.ca, B.ca) && same(S.cb, B.cb) && same(S.ba.counts, B.ba.counts) && same(S.bb.counts, B.bb.counts) && oilSame && heads.every(h => !h)
    : (S.a.f.pend.length === 0 && !S.a.f.nys && dayOk(S.b, 'GAMES AFTERNOON') && same(S.ca, B.ca) && same(S.cb, B.cb) && same(S.ba.counts, B.ba.counts) && same(S.bb.counts, B.bb.counts) && oilSame)
  L.row('38', size, 'admin', okChg ? 'PASS' : 'FAIL', `[${variant}] published ALL (Wed) and ALL AVAIL (Sat), then the member retitled: BEFORE ${base.text} || AFTER ${chg.text} || OIL question on retitle: ${JSON.stringify(heads)}`, [tag + '-1published-wed-edit.png', ...chg.pics])
  console.log('okChg', okChg, 'oilSame', oilSame)
  await W.browser.close()
}
L.saveRows('s38-' + size)
console.log('ERRORS', L.ERRS)
