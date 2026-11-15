/* rcb2-w2 S07 — blank -> typed 12:30 -> TBD in one week (Fri = "Monday", Sat = "Tuesday"); Ranger flies both.
   usage: RCB2_RUN=s07-d1 [PHONE=1] node scripts/handpass/rcb2/rcb2-w2-s07.mjs */
const PHONE = process.env.PHONE === '1'
process.env.RCB2_RUN ||= 's07-' + (PHONE ? 'p' : 'd') + '1'
const X = await import('./rcb2-w2-lib.mjs')
const { L, say, check, nrm, sleep, FRI, SAT } = X
say('rcb2-w2-s07 v1', PHONE ? 'phone' : 'desktop')
const w = await X.open({ phone: PHONE })
const { page, P } = w
const size = PHONE ? '402' : '1536'

await L.go(page, 'editsched')
await X.board(w, FRI)
const wf = await X.flight(w, FRI, '12:00', '')
await X.closeBoard(w)
await X.board(w, SAT)
const ws = await X.flight(w, SAT, '04:00', '05:00')
let bw = await X.boardWarn(w)
say('Sat board warnings:', JSON.stringify(bw))
await X.pic(w, `s07-1-sat-board-${P}`)
const bcr = X.crest(bw)
X.row('S07', size, 'Fri 12:00 landing blank; Sat 04:00-05:00 (Ranger both); Sat board list', '"took off 12:00 with no landing typed ... ended 14:00 ... clear at 02:00", no "landed"', JSON.stringify(bcr),
  bcr.some(l => /took off 12:00 with no landing typed/.test(l) && /14:00/.test(l) && /02:00/.test(l)) && !bcr.some(l => /landed 12:00/.test(l)) ? 'PASS' : 'FAIL', `s07-1-sat-board-${P}.png`)
await X.closeBoard(w)

async function readAll(tag) {
  await L.go(page, 'editsched'); await sleep(500)
  const sat = await X.weekWarn(w, '#eWeek', SAT)
  await X.pic(w, `s07-${tag}-week-sat-${P}`)
  const fri = await X.weekWarn(w, '#eWeek', FRI)
  let tr = await X.trace(w, "#eWeek", FRI); if (!tr.items.length) tr = await X.trace(w, "#eWeek", FRI)
  fri.items.push(...tr.items)
  say(`[${tag}] Fri trace:`, JSON.stringify(tr))
  await X.pic(w, `s07-${tag}-week-fri-${P}`)
  const dd = await X.dayDetails(w, '#eWeek', SAT)
  await X.pic(w, `s07-${tag}-daydet-sat-${P}`)
  const ddi = dd.items
  await X.closeDayPop(w, 'done')
  const ddf = await X.dayDetails(w, '#eWeek', FRI)
  await X.pic(w, `s07-${tag}-daydet-fri-${P}`)
  await X.closeDayPop(w, 'x')
  say(`[${tag}] Sat week:`, JSON.stringify(sat.items), '| Fri week:', JSON.stringify(fri.items), '| Sat details:', JSON.stringify(ddi), '| Fri details:', JSON.stringify(ddf.items))
  await X.board(w, SAT); const bwl = X.crest(await X.boardWarn(w)); await X.pic(w, `s07-${tag}-board-sat-${P}`); await X.closeBoard(w)
  return { sat: X.crest(sat.items), board: bwl, fri: fri.items.filter(l => /Breaks|rest/i.test(l)), ddSat: X.crest(ddi), ddFri: ddf.items.filter(l => /Breaks|rest/i.test(l)) }
}
const judge = (tag, r, re) => {
  const all = { 'Sat week': r.sat, 'Sat details': r.ddSat, 'Sat board': r.board }
  for (const [k, v] of Object.entries(all)) {
    const ok = v.length > 0 && v.some(l => re.test(l))
    X.row('S07 ' + tag, size, k, String(re), JSON.stringify(v), ok ? 'PASS' : 'FAIL', `s07-${tag}-*-${P}.png`)
  }
  const fwd = [...r.fri, ...r.ddFri]
  X.row('S07 ' + tag, size, 'Fri forward explanation (week strip + details)', 'figures agree with Sat warning', JSON.stringify(fwd), fwd.length ? 'RECORDED' : 'FAIL', `s07-${tag}-week-fri-${P}.png`)
}
const BLANK = /took off 12:00 with no landing typed.*14:00.*02:00/
let r = await readAll('a-blank'); judge('a-blank', r, BLANK)

// type 12:30 through the board
await X.board(w, FRI)
await X.typeIn(w, `[data-bfld="ff:${FRI}.${wf}.0.ld"]`, '12:30')
say('stored ld', await page.evaluate(([d, g]) => window.DAYS[d].waves[g].formations[0].ld, [FRI, wf]))
bw = await X.boardWarn(w)
await X.closeBoard(w)
r = await readAll('b-1230'); judge('b-1230', r, /landed 12:30.*14:30.*02:30/)

// TBD through the week box
await L.go(page, 'editsched')
const box = page.locator(`#eWeek [data-txt="ff:${FRI}.${wf}.0.ld"]:visible`).first()
await box.scrollIntoViewIfNeeded(); if (PHONE) await box.tap(); else await box.click()
await page.keyboard.press('Control+A'); await page.keyboard.type('TBD', { delay: 30 }); await page.keyboard.press('Enter'); await sleep(500)
const toast = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => e.children.length === 0 && e.offsetWidth > 0 && /is not a time/i.test(e.textContent || '')).map(e => e.textContent.trim()))
const ld0 = await page.evaluate(([d, g]) => window.DAYS[d].waves[g].formations[0].ld, [FRI, wf])
await X.pic(w, `s07-c0-tbd-refused-${P}`)
X.row('S07 c-tbd door', size, 'type TBD into the week landing box', 'RECORD', `app said ${JSON.stringify(toast)}; stored ${JSON.stringify(ld0)}`, 'RECORDED', `s07-c0-tbd-refused-${P}.png`)
// TBD cannot be typed (the app refuses a non-time): plant it straight into the data and re-check — said so in the report
await page.evaluate(([d, g]) => { window.DAYS[d].waves[g].formations[0].ld = 'TBD'; window.afterSchedMutate() }, [FRI, wf])
await sleep(600)
r = await readAll('c-tbd'); judge('c-tbd (TBD planted in data; the typing door refuses it)', r, BLANK)
await L.go(page, 'viewsched'); await sleep(400)
await L.go(page, 'editsched'); await sleep(400)
r = await readAll('d-leave'); judge('d-leave (TBD)', r, BLANK)
await page.reload(); await sleep(1500)
await L.login(page, 'a').catch(() => {})
const ldR = await page.evaluate(([d, g]) => window.DAYS[d]?.waves?.[g]?.formations?.[0]?.ld, [FRI, wf])
say('after reload fri ld', JSON.stringify(ldR))
r = await readAll('e-reload'); judge('e-reload (stored ' + JSON.stringify(ldR) + ')', r, ldR === 'TBD' || !ldR ? BLANK : /landed/)
// again with a typed B (report time) on the first day, landing blank
await page.evaluate(([d, g]) => { window.DAYS[d].waves[g].formations[0].ld = ''; window.afterSchedMutate() }, [FRI, wf])
await X.board(w, FRI)
await X.typeIn(w, `[data-bfld="ff:${FRI}.${wf}.0.br"]`, '10:30')
say('Fri B stored', await page.evaluate(([d, g]) => JSON.stringify(window.DAYS[d].waves[g].formations[0]).slice(0, 200), [FRI, wf]))
await X.closeBoard(w)
r = await readAll('f-typedB'); judge('f-typedB (B 10:30 typed on Fri, landing blank)', r, /took off 12:00 with no landing typed/)
await X.fin(w)
