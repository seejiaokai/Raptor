/* Walker B1 (amendment batch, 25 Sep 26) — the cases b1-01 could not reach cleanly, DESKTOP 1440×900 DPR 1:
   (1) a desk holder moved onto his own desk's extras line (expect 1, D109: holder and extras are two places);
   (2) two men taken off one Common Programme crowd (2); (3) a PLAIN row removed (1) — b1-01 removed an accepted
   request's row, which read 2; (4) Plans: sign Plan B, switch to Plan A → unsigned, back → signed (D103);
   (5) on the saved everything-week: a leave filed on Inputs for a man behind the published Saturday's ALL AVAIL
   puck → the four sign-offs blank (D103); the leave deleted → they return.
   PASS = correct. Pictures b1-x-*. Run from raptor-port/: node scripts/handpass/am/b1-03-extras-plans-allavail.mjs */
process.env.HP_SHOTS = process.env.HP_REWALK || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b1'   // HP_REWALK: the re-walk's own folder, so the first walk's pictures stay
const L = await import('./w2-lib.mjs')
const W = await import('./w1-lib.mjs')
const W4 = await import('./w4-lib.mjs')
const { openHi, editWeek, board, signDay, publishDay, head, check, note, summary, screen, put, planMenuItems, menuClose, menuSwitch, menuAlt, STATE, go } = L
const { toastSpy, toasts, shotUnion, shotBox, boardType, norm } = W
const MON = 0, WED = 2, SAT = 5
const num = s => { const m = /(\d+)/.exec(String(s || '')); return m ? +m[1] : 0 }
const signsOf = async (di) => (await head(page, di)).signs
const blank = a => a.every(s => !s || /name/.test(s))

let { browser, page, errors } = await openHi({ width: 1440, height: 900, dpr: 1, state: null })
await toastSpy(page)
const CS = await page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, p]) => [k, p.cs])))
const FREE = await page.evaluate(() => { const j = JSON.stringify(window.DAYS[0]); return Object.keys(window.PEOPLE).filter(k => !j.includes('"' + k + '"') && !/^ALL/i.test(k)) })
async function dragTo(fromSlot, toSel) {
  const src = page.locator(`#schedBoard [data-slot="${fromSlot}"] .puck:visible`).first()
  const dst = page.locator(`#schedBoard ${toSel}:visible`).first()
  if (!(await src.count()) || !(await dst.count())) return 'missing'
  await src.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250)
  const a = await src.boundingBox(), b = await dst.boundingBox()
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down()
  await page.mouse.move(a.x + a.width / 2 + 6, a.y + a.height / 2 + 6, { steps: 3 })
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 })
  await page.waitForTimeout(120); await page.mouse.up(); await page.waitForTimeout(800)
  return 'dropped'
}
async function allCounts(di) {
  await board(page, di)
  const b = norm((await head(page, di)).pending)
  await editWeek(page)
  const w = norm((await head(page, di)).pending)
  const i = await W.dayInfo(page, di, 'week'); await W.closeDayInfo(page)
  return { board: b, week: w, info: i.pend || '(none)' }
}
async function listRows(di) {
  await editWeek(page)
  const b = page.locator(`#eWeek .day[data-day="${di}"] [data-pendlist="${di}"]:visible`).first()
  if (!(await b.count())) return null
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await page.waitForTimeout(500)
  const r = await page.evaluate(() => [...document.querySelectorAll('#pendList .pl-item')].map(e => (e.querySelector('.pl-where')?.innerText || '') + ' | ' + (e.querySelector('.pl-chg')?.innerText || '').replace(/\s+/g, ' ')))
  await page.keyboard.press('Escape'); await page.waitForTimeout(200)
  return r
}

try {
  /* ---- fixture: a crowd of two on FLIGHT SAFETY STAND-DOWN, Monday published ---- */
  await editWeek(page); await board(page, MON)
  const p1 = await put(page, `[data-fill="a:${MON}.2.+"]`, FREE.slice(0, 6))
  note('X-FIX crowd', `FLIGHT SAFETY STAND-DOWN before publishing: ${JSON.stringify(await page.evaluate(() => window.DAYS[0].allhands[2].who))} (put ${CS[p1] || p1})`)
  await signDay(page, MON, 0); const pub = await publishDay(page, MON)
  note('X-FIX publish', JSON.stringify(pub)); await toasts(page)

  // (1) holder → his own extras line, dropped on the "+ add" box
  const sw = await page.evaluate(() => window.DAYS[0].dutywaves[0].rows[0].id)
  const r1 = await dragTo(`d:${MON}.0.0`, `[data-fill="d:${MON}.0.0.+"] .addz`)
  const sdo = await page.evaluate(() => { const r = window.DAYS[0].dutywaves[0].rows[0]; return { id: r.id, more: r.more || [] } })
  const tt1 = await toasts(page)
  note('X-1 gesture', `${r1}; SDO holder ${CS[sdo.id] || sdo.id || '(empty)'}, extras ${JSON.stringify(sdo.more.map(x => CS[x] || x))}; ${JSON.stringify(tt1)}`)
  await shotBox(page, 'b1-x-01-holder-to-extras', `#schedBoard [data-fill="d:${MON}.0.0.+"]`, '.sb-arow')
  const took1 = sdo.more.includes(sw) && sdo.id !== sw
  let c = await allCounts(MON)
  let rows = await listRows(MON)
  if (took1) {
    check('X-1 holder → extras = 1', [c.board, c.week, c.info].every(x => num(x) === 1), `Sidewinder from the SDO desk to its extras line: ${JSON.stringify(c)}`)
    check('X-1b one line', rows && rows.length === 1 && /Sidewinder/.test(rows[0]) && /SDO\s*→\s*SDO · extras/.test(rows[0]), `the list reads it as one move: ${JSON.stringify(rows)}`)
  } else note('X-1 holder → extras', `the drop did not move him (${JSON.stringify(c)}) — could not make the move through the app`)

  // (2) two men taken off one Common Programme crowd
  const base = num(c.week)
  await board(page, MON)
  const off = []
  for (const k of [`a:${MON}.2.1`, `a:${MON}.2.0`]) {
    const s = page.locator(`#schedBoard [data-slot="${k}"] .puck:visible`).first()
    if (await s.count()) { await s.evaluate(e => e.scrollIntoView({ block: 'center' })); await s.click({ button: 'right' }); await page.waitForTimeout(600); off.push((await toasts(page)).join('/')) }
  }
  note('X-2 gesture', `right-click ×2: ${JSON.stringify(off)}; crowd now ${JSON.stringify(await page.evaluate(() => window.DAYS[0].allhands[2].who))}`)
  c = await allCounts(MON)
  check('X-2 two off a crowd = +2', [c.board, c.week, c.info].every(x => num(x) === base + off.filter(t => /removed/.test(t)).length) && off.filter(t => /removed/.test(t)).length === 2, `two men taken off FLIGHT SAFETY STAND-DOWN: ${base} → ${JSON.stringify(c)}`)
  rows = await listRows(MON)
  note('X-2 rows', JSON.stringify(rows))

  // (3) a PLAIN row removed — the Common Programme row DINNER WITH CMD (no one on it, not a request)
  const b3 = num(c.week)
  await board(page, MON)
  const pdel = page.locator(`#schedBoard [data-pdel="${MON}.8"]:visible`).first()
  const nA = await page.evaluate(() => window.DAYS[0].allhands.length)
  if (await pdel.count()) { await pdel.evaluate(e => e.scrollIntoView({ block: 'center' })); await pdel.click(); await page.waitForTimeout(600)
    if ((await page.evaluate(() => window.DAYS[0].allhands.length)) === nA && await pdel.count()) { await pdel.click(); await page.waitForTimeout(600) } }
  const nA2 = await page.evaluate(() => window.DAYS[0].allhands.length)
  note('X-3 gesture', `programme rows ${nA} → ${nA2}; ${JSON.stringify(await toasts(page))}`)
  c = await allCounts(MON)
  rows = await listRows(MON)
  check('X-3 plain row removed = +1', nA2 === nA - 1 && [c.board, c.week, c.info].every(x => num(x) === b3 + 1), `DINNER WITH CMD removed: ${b3} → ${JSON.stringify(c)}; list ${JSON.stringify(rows)}`)
  await editWeek(page)
  await shotBox(page, 'b1-x-03-week-head', `#eWeek .day[data-day="${MON}"] .day-head`)

  /* ---- (4) Plans: sign Plan B, switch to Plan A, back ---- */
  await board(page, WED)
  await signDay(page, WED, 0); const pw = await publishDay(page, WED); await toasts(page)
  note('X-4 publish Wed', JSON.stringify(pw))
  const m0 = await planMenuItems(page, WED); note('X-4 menu', JSON.stringify(m0));
  const alt = await menuAlt(page); if (!alt) await menuClose(page)
  const m1 = await planMenuItems(page, WED); note('X-4 menu after + Alt Plan', JSON.stringify(m1)); await menuClose(page)
  const wr = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld^="ap:2."][data-bfld$=".rmks"]')].filter(e => e.offsetWidth).map(e => e.dataset.bfld)[0])
  await boardType(page, wr, 'plan B change')
  await signDay(page, WED, 2)
  const sB = await signsOf(WED)
  const hB = await head(page, WED)
  await shotUnion(page, 'b1-x-04-planB-signed', ['#sbSignBar'])
  // switch to the other plan
  await planMenuItems(page, WED)
  const other = m1.find(x => /^switch:/.test(x.does) && !/\*/.test(x.text))
  const sw1 = await page.locator('.wavemenu .wm[data-plansel]:visible').count()
  let switched = false
  if (sw1) { const it = page.locator('.wavemenu .wm[data-plansel]:visible').first(); note('X-4 switching to', await it.innerText()); await it.click(); await page.waitForTimeout(800); switched = true }
  else await menuClose(page)
  const sA = await signsOf(WED)
  const hA = await head(page, WED)
  note('X-4 toasts', JSON.stringify(await toasts(page)))
  await shotUnion(page, 'b1-x-05-planA', ['#sbSignBar'])
  // and back
  await planMenuItems(page, WED)
  const back = page.locator('.wavemenu .wm[data-plansel]:visible').first()
  if (await back.count()) { note('X-4 switching back to', await back.innerText()); await back.click(); await page.waitForTimeout(800) } else await menuClose(page)
  const sB2 = await signsOf(WED)
  const hB2 = await head(page, WED)
  await shotUnion(page, 'b1-x-06-planB-back', ['#sbSignBar'])
  check('X-4a plan B signed', !blank(sB) && /Not yet published/.test(hB.nys ? 'Not yet published' : '') || !blank(sB), `on Plan B with a change, all four signed: ${sB.join('|')} (${hB.pending}, "${norm(hB.signState)}")`)
  check('X-4b switch to plan A → unsigned', switched && blank(sA), `after switching plans: ${sA.join('|')} (${norm(hA.pending)}, "${norm(hA.signState)}", tag ${hA.selector})`)
  check('X-4c back to plan B → signed', sB2.join('|') === sB.join('|'), `back on Plan B: ${sB2.join('|')} (want ${sB.join('|')}; "${norm(hB2.signState)}")`)
} catch (e) { check('RUN-1', false, 'stopped: ' + e.message.split('\n')[0]); await screen(page, 'b1-x-ZZ1-stopped') }
check('X-ERR-1', !errors.length, `browser error list ${errors.length ? JSON.stringify(errors.slice(0, 6)) : 'empty'}`)
await browser.close()

/* ---- (5) the saved everything-week: ALL AVAIL on the published Saturday ---- */
;({ browser, page, errors } = await openHi({ width: 1440, height: 900, dpr: 1, state: STATE }))
await toastSpy(page)
try {
  await editWeek(page)
  const h0 = await head(page, SAT)
  note('X-5 start', `Saturday: tag ${h0.tag}, pending "${norm(h0.pending)}", signs ${h0.signs.join('|')}`)
  await signDay(page, SAT, 3)
  const s1 = await signsOf(SAT); const h1 = await head(page, SAT)
  await shotBox(page, 'b1-x-07-sat-signed', `#eWeek .day[data-day="${SAT}"] .day-head`)
  const f = await W4.fileInput(page, { person: 'riddler', type: 'LL', from: '2026-07-18', to: '2026-07-18', remarks: 'b1 leave' })
  note('X-5 filed', JSON.stringify(f))
  await editWeek(page)
  const s2 = await signsOf(SAT); const h2 = await head(page, SAT)
  await shotBox(page, 'b1-x-08-sat-after-leave', `#eWeek .day[data-day="${SAT}"] .day-head`)
  const rows = await listRows(SAT)
  check('X-5a leave behind ALL AVAIL wipes the four', !blank(s1) && blank(s2) && num(h2.pending) >= 1, `signed ${s1.join('|')} ("${norm(h1.signState)}"); after Ghost's leave on Sat: ${s2.join('|')}, "${norm(h2.pending)}", list ${JSON.stringify(rows)}`)
  // put it back: delete the leave on the Inputs page
  await go(page, 'inputs'); await page.waitForTimeout(500)
  const ix = await page.evaluate(() => window.INPUTS.findIndex(r => r.person === 'riddler' && /b1 leave/.test(r.rmks || r.remarks || '')))
  const x = page.locator(`[data-inx="${ix}"]:visible`).first()
  let delOk = false
  if (ix >= 0 && await x.count()) { await x.evaluate(e => e.scrollIntoView({ block: 'center' })); await x.click(); await page.waitForTimeout(700); delOk = true }
  note('X-5 delete', `input #${ix}: ${delOk ? 'deleted' : 'no ✕ found'}; ${JSON.stringify(await toasts(page))}`)
  await editWeek(page)
  const s3 = await signsOf(SAT); const h3 = await head(page, SAT)
  await shotBox(page, 'b1-x-09-sat-leave-removed', `#eWeek .day[data-day="${SAT}"] .day-head`)
  check('X-5b leave deleted → the four return', delOk && s3.join('|') === s1.join('|') && !num(h3.pending), `after deleting the leave: ${s3.join('|')} (want ${s1.join('|')}), pending "${norm(h3.pending)}"`)
} catch (e) { check('RUN-2', false, 'stopped: ' + e.message.split('\n')[0]); await screen(page, 'b1-x-ZZ2-stopped') }
check('X-ERR-2', !errors.length, `browser error list ${errors.length ? JSON.stringify(errors.slice(0, 6)) : 'empty'}`)
summary('B1 extras/plans/allavail')
await browser.close()
