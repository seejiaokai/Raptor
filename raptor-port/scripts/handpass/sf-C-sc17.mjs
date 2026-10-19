import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, openBoard, closeBoard, bPut, bPutFill, puckAt, bType, bf, sleep, shot, rec, go, errors, chipLine, warnLines, undo, redo } = L
const b = await launch()
const mine = w => w.filter(x => /Reaper/.test(x))
async function insightHours(p, name) {
  await closeBoard(p); await go(p, 'editsched')
  await p.locator('#insightBtn').click(); await sleep(1100)
  const t = await p.evaluate(() => { const m = document.querySelector('#insightModal'); return m ? m.innerText.replace(/\s+/g, ' ') : '' })
  await p.locator('#insightClose').click().catch(() => {}); await sleep(300)
  const i = t.indexOf('REPORT TO DEBRIEF'), j = t.indexOf('NOT ON THE FLYING', i)
  const sec = i < 0 ? '' : t.slice(i, j < 0 ? undefined : j)
  const m = sec.match(new RegExp('(?:^| )' + name + ' (\\d+h\\d*)(?= |$)'))
  return m ? m[1] : null
}
{
  // ---------- scenario 17 ----------
  const S = '17'
  const { p } = await ctxOpen(b, {})
  await go(p, 'editsched'); await p.evaluate(() => window.addWave(4, 'sc')); await sleep(500)
  const h0 = await insightHours(p, 'Reaper')
  await openBoard(p, 4)
  const st = [await bPut(p, 4, 0, 0, 0, 'p', ['dice']), await bPut(p, 4, 0, 1, 2, 'p', ['dice'])]
  rec(S, 'set-up: Reaper MAIN on SC AM, SPARE on SC PM (Fri)', 'seated', st, st.every(x => x !== 'FAILED') ? 'PASS' : 'NOT WALKED')
  await bType(p, bf(4, 0, 0, 'rl'), '06:30')
  const w1 = await warnLines(p), c1 = await chipLine(p)
  await shot(p, '17-1-am-flies')
  const h1 = await insightHours(p, 'Reaper')
  await openBoard(p, 4)
  rec(S, 'SC AM R 06:30 flies, SC PM nothing; same man MAIN on AM and SPARE on PM', 'PM stays standby for him: no warnings from PM; chips: AM lit, PM dashed', { reaper: mine(w1), c1, hours: [h0, h1] }, !mine(w1).some(x => /SC PM/.test(x)) && /4\.0\.0\.0:MAIN\+ON/.test(c1) && /4\.0\.1\.2:SPARE\+off/.test(c1) ? 'PASS' : 'FAIL', 'C-17-1-am-flies.png')
  rec(S, "his day's work hours (Insights)", 'one day 06:30 to 13:00 = 6h30 more than before', { before: h0, after: h1 }, 'RECORD', 'C-17-1-am-flies.png')
  await bType(p, bf(4, 0, 1, 'br'), '12:30')
  const w2 = await warnLines(p), c2 = await chipLine(p)
  await shot(p, '17-2-pm-b')
  rec(S, "type the PM's B 12:30 (the PM now flies too)", 'both fly; his AM row and PM row do not hard-clash at 12:30-13:00; or the warning names a real overlap in plain words; long day 06:30 -> 19:00', { reaper: mine(w2), c2 }, 'RECORD', 'C-17-2-pm-b.png')
  await closeBoard(p); const h2 = await insightHours(p, 'Reaper')
  rec(S, 'work hours after the PM flies', 'RECORD (06:30 to 19:00 = 12h30?)', { h0, h1, h2 }, 'RECORD')
  rec(S, 'browser error list', 'empty', errors, errors.length ? 'FAIL' : 'PASS')
  await p.context().close()
}
{
  // ---------- scenario 18 ----------
  const S = '18'
  const { p } = await ctxOpen(b, {})
  await go(p, 'editsched'); await p.evaluate(() => { window.addWave(4, 'sc'); window.addWave(4, 'avalon'); window.addWave(4, 'bb') }); await sleep(500)
  await openBoard(p, 4)
  const st = [await bPut(p, 4, 0, 0, 2, 'p', ['dice'])]
  // ground item 06:15-06:45 for Reaper
  await p.locator('#schedBoard [data-gradd="4"]:visible').first().click(); await sleep(500)
  const gi = await p.evaluate(() => window.DAYS[4].ground.length - 1)
  await bType(p, `#schedBoard [data-bfld="gr:4.${gi}.prog"]`, 'EARLY BRIEF'); await bType(p, `#schedBoard [data-bfld="gr:4.${gi}.str"]`, '06:15'); await bType(p, `#schedBoard [data-bfld="gr:4.${gi}.end"]`, '06:45')
  st.push(await bPutFill(p, `g:4.${gi}.+`, ['dice']))
  rec(S, 'set-up: Reaper SC AM SPARE (07:00-13:00) and an EARLY BRIEF ground item 06:15-06:45', 'seated', st, st.every(x => x !== 'FAILED') ? 'PASS' : 'NOT WALKED')
  const w0 = await warnLines(p)
  await shot(p, '18-1-standing')
  rec(S, 'SC AM standing by', 'no warning (06:15-06:45 is before the shift)', mine(w0), !mine(w0).some(x => /clash/.test(x)) ? 'PASS' : 'RECORD', 'C-18-1-standing.png')
  await bType(p, bf(4, 0, 0, 'rl'), '06:00')
  const w1 = await warnLines(p), pk = await puckAt(p, '4.0.0.2.p')
  await shot(p, '18-2-sc-r-before-start')
  rec(S, 'type SC AM R 06:00 (R before START 07:00) with the ground item inside R-START', 'RECORD: amber in-time advisory, a hard clash, or nothing', { reaper: mine(w1), puck: pk && pk.cls }, 'RECORD', 'C-18-2-sc-r-before-start.png')
  await bType(p, bf(4, 0, 0, 'rl'), '')
  // AVALON: Reaper on the SPARE row 2; ground item 18:15-18:45; R 18:00 (before START 19:00)
  const stA = [await bPut(p, 4, 1, 0, 2, 'p', ['dice'])]
  await bType(p, `#schedBoard [data-bfld="gr:4.${gi}.str"]`, '18:15'); await bType(p, `#schedBoard [data-bfld="gr:4.${gi}.end"]`, '18:45')
  const wA0 = await warnLines(p)
  await bType(p, bf(4, 1, 0, 'rl'), '18:00')
  const wA1 = await warnLines(p)
  await shot(p, '18-3-avalon-r-before-start')
  rec(S, 'AVALON R 18:00 (START 19:00) with an 18:15-18:45 ground item for the same man', 'RECORD (same question for AVALON)', { standing: mine(wA0), flying: mine(wA1), stA }, 'RECORD', 'C-18-3-avalon-r-before-start.png')
  await bType(p, bf(4, 1, 0, 'rl'), '')
  // BB: START 08:00, END 14:00 typed, R 07:30; ground item 07:40-07:50
  const stB = [await bPut(p, 4, 2, 0, 2, 'p', ['dice'])]
  await bType(p, bf(4, 2, 0, 'to'), '08:00'); await bType(p, bf(4, 2, 0, 'ld'), '14:00')
  await bType(p, `#schedBoard [data-bfld="gr:4.${gi}.str"]`, '07:40'); await bType(p, `#schedBoard [data-bfld="gr:4.${gi}.end"]`, '07:50')
  const wB0 = await warnLines(p)
  await bType(p, bf(4, 2, 0, 'rl'), '07:30')
  const wB1 = await warnLines(p)
  await shot(p, '18-4-bb-r-before-start')
  rec(S, 'BB START 08:00-END 14:00, R 07:30, a 07:40-07:50 ground item', 'RECORD (same question for BB)', { standing: mine(wB0), flying: mine(wB1), stB }, 'RECORD', 'C-18-4-bb-r-before-start.png')
  rec(S, 'browser error list', 'empty', errors, errors.length ? 'FAIL' : 'PASS')
  await p.context().close()
}
await b.close()
