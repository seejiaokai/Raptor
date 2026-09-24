/* The HOST's re-walk of the amendment batch's two blind code reads (evidence sheet §5a), on the production build,
   written as assertions of the RIGHT behaviour so a PASS means correct (bug-check order §5, "the re-walk").
   A (Astra 1, fresh world, Monday): three men on FLIGHT SAFETY STAND-DOWN, published; the middle man taken off
     (right-click) and the two left swapped → the day reads 2 pending, the list two lines, the board agrees.
   B (Astra 2, the saved everything-week, Saturday): ALL AVAIL added to MASS BRIEF beside FAMILY DAY's, published as
     an AL; then Ghost files leave on Inputs → both crowds change → ONE pending change whose line names BOTH rows,
     each its own tap; the MASS BRIEF tap stays on Edit Schedule and marks it.
   Usage (from raptor-port/, a preview on 4173): node scripts/handpass/am/hr-03-batch-reads.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.HP_SHOTS = `C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/rewalk-reads/${W}`
const L = await import('./w2-lib.mjs')
const W1 = await import('./w1-lib.mjs')
const W4 = await import('./w4-lib.mjs')
const { openHi, editWeek, board, closeBoard, signDay, publishDay, publishAL, head, check, note, summary, put, STATE } = L
const { toastSpy, toasts, shotBox, norm } = W1
const SIZE = W === 'phone' ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const MON = 0, SAT = 5
const num = s => { const m = /(\d+)/.exec(String(s || '')); return m ? +m[1] : 0 }

async function openList(page, di) {
  await editWeek(page)
  const b = page.locator(`#eWeek .day[data-day="${di}"] [data-pendlist="${di}"]:visible`).first()
  if (!(await b.count())) return null
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await page.waitForTimeout(500)
  return page.evaluate(() => ({
    head: document.querySelector('#pendList .pl-head')?.innerText || '',
    rows: [...document.querySelectorAll('#pendList .pl-item')].map(e => e.innerText.replace(/\s+/g, ' ').trim()),
    subs: [...document.querySelectorAll('#pendList .pl-sub')].map(e => ({ text: e.innerText.replace(/\s+/g, ' ').trim(), off: e.disabled })),
  }))
}
/* arm a crowd's "+ add" box by ITS OWN position (the row's middle is a man's puck), then pick from the roster */
async function putAt(page, fill, prefs) {
  const z = page.locator(`#schedBoard [data-fill="${fill}"] .addz:visible`).first()
  if (!(await z.count())) return 'no + add box'
  await z.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(200)
  const b = await z.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(300)
  if (!(await page.evaluate(() => window.ARM && window.ARM.key))) return 'not armed'
  for (const pid of prefs) {
    const p = page.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).first()
    if (!(await p.count())) continue
    await p.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(100)
    await p.click(); await page.waitForTimeout(400); return pid
  }
  await page.keyboard.press('Escape'); return 'nobody offered'
}
const arr = w => Array.isArray(w) ? w : (w ? [w] : [])
async function dragPuck(page, fromKey, toKey) {
  const src = page.locator(`#schedBoard [data-slot="${fromKey}"] .puck:visible`).first()
  const dst = page.locator(`#schedBoard [data-slot="${toKey}"]:visible`).first()
  if (!(await src.count()) || !(await dst.count())) return 'missing'
  await src.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250)
  const a = await src.boundingBox(), b = await dst.boundingBox()
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down()
  await page.mouse.move(a.x + a.width / 2 + 6, a.y + a.height / 2 + 6, { steps: 3 })
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 })
  await page.waitForTimeout(120); await page.mouse.up(); await page.waitForTimeout(800)
  return 'dropped'
}

/* ---- A: taken off + re-ordered, on a fresh world ---- */
let { browser, page, errors } = await openHi({ ...SIZE, dpr: 1, state: null })
await toastSpy(page)
try {
  const FREE = await page.evaluate(() => { const j = JSON.stringify(window.DAYS[0]); return Object.keys(window.PEOPLE).filter(k => !j.includes('"' + k + '"') && !/^ALL/i.test(k)) })
  const CS = await page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, p]) => [k, p.cs])))
  await editWeek(page); await board(page, MON)
  const got = []
  for (let i = 0; i < 3; i++) got.push(await putAt(page, `a:${MON}.2.+`, FREE.filter(x => !got.includes(x))))
  const who0 = arr(await page.evaluate(() => window.DAYS[0].allhands[2].who))
  note('A-fix', `FLIGHT SAFETY STAND-DOWN before publishing: ${JSON.stringify(who0.map(x => CS[x] || x))}`)
  await closeBoard(page); await editWeek(page)
  await signDay(page, MON, 0); note('A-publish', JSON.stringify(await publishDay(page, MON))); await toasts(page)
  await board(page, MON)
  const mid = page.locator(`#schedBoard [data-slot="a:${MON}.2.1"] .puck:visible`).first()
  await mid.evaluate(e => e.scrollIntoView({ block: 'center' })); await mid.click({ button: 'right' }); await page.waitForTimeout(600)
  const t1 = await toasts(page)
  const last = await page.evaluate(() => window.DAYS[0].allhands[2].who.length - 1)
  const r2 = await dragPuck(page, `a:${MON}.2.${last}`, `a:${MON}.2.0`)
  const who1 = arr(await page.evaluate(() => window.DAYS[0].allhands[2].who))
  note('A-gestures', `right-click the middle man: ${JSON.stringify(t1)}; drag the last onto the first: ${r2}; crowd now ${JSON.stringify(who1.map(x => CS[x] || x))}`)
  /* the shape this case needs: the middle man gone, the rest the same men in a DIFFERENT order */
  const surv0 = who0.filter((x, i) => i !== 1), surv1 = who1.filter(Boolean), want = surv1
  const shaped = surv1.length === surv0.length && [...surv1].sort().join() === [...surv0].sort().join() && surv1.join() !== surv0.join()
  const hb = norm((await head(page, MON)).pending)
  await shotBox(page, 'A-1-board-crowd', `#schedBoard [data-fill="a:${MON}.2.+"]`, '.sb-arow')
  await closeBoard(page)
  const L1 = await openList(page, MON)
  await page.screenshot({ path: `${process.env.HP_SHOTS}/A-2-pending-list.png` })
  await page.keyboard.press('Escape')
  const hw = norm((await head(page, MON)).pending)
  if (shaped) {
    check('A-1 taken off + re-ordered reads 2 on the board and the week', num(hb) === 2 && num(hw) === 2, `board "${hb}", week "${hw}"`)
    check('A-2 the list says 2 changes, two lines', /2 changes/.test(L1?.head || '') && L1.rows.length === 2, JSON.stringify(L1))
  } else note('A-shape', `the gestures did not make [${want.map(x => CS[x] || x)}] (${JSON.stringify(who1)}) — counts board "${hb}", week "${hw}", list ${JSON.stringify(L1)}`)
} catch (e) { check('A-crash', false, String(e && e.stack || e)) }
check('A-ERR', !errors.length, errors.length ? JSON.stringify(errors.slice(0, 6)) : 'browser error list empty')
await browser.close()

/* ---- B: two placeholder crowds change at once, on the saved everything-week ---- */
;({ browser, page, errors } = await openHi({ ...SIZE, dpr: 1, state: STATE }))
await toastSpy(page)
try {
  await editWeek(page); await board(page, SAT)
  const p = await putAt(page, `a:${SAT}.1.+`, ['allavail'])
  note('B-add', `ALL AVAIL onto MASS BRIEF: ${p}; its crowd ${JSON.stringify(await page.evaluate(() => window.DAYS[5].allhands[1].who))}`)
  await closeBoard(page); await editWeek(page)
  await signDay(page, SAT, 3); note('B-publish', JSON.stringify(await publishAL(page, SAT))); await toasts(page)
  const h0 = await head(page, SAT)
  note('B-published', `Saturday ${h0.tag}, pending "${norm(h0.pending)}"`)
  const f = await W4.fileInput(page, { person: 'riddler', type: 'LL', from: '2026-07-18', to: '2026-07-18', remarks: 'hr3 leave' })
  note('B-leave', JSON.stringify(f))
  const L2 = await openList(page, SAT)
  await page.screenshot({ path: `${process.env.HP_SHOTS}/B-1-pending-list-two-rows.png` })
  check('B-1 still ONE change', /· 1 change$/.test(L2?.head || ''), JSON.stringify(L2 && L2.head))
  const both = L2 ? L2.subs.map(s => s.text).join(' / ') : ''
  check('B-2 the line names both rows, each its own tap', L2 && L2.subs.length === 2 && /FAMILY DAY/.test(both) && /MASS BRIEF/.test(both) && L2.subs.every(s => !s.off), JSON.stringify(L2 && L2.subs))
  const second = page.locator('#pendList .pl-sub', { hasText: 'MASS BRIEF' }).first()
  if (await second.count()) {
    await second.click(); await page.waitForTimeout(900)
    const where = await page.evaluate(() => ({ board: !!(document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth), page: window.CURPAGE,
      flash: [...document.querySelectorAll('.chgflash')].map(e => { const r = e.getBoundingClientRect(); return { key: e.dataset.slot || e.dataset.fill || e.className.slice(0, 30), where: e.closest('#schedBoard') ? 'board' : e.closest('#eWeek') ? 'week' : 'other', inView: r.top >= 0 && r.bottom <= innerHeight } }),
      massBrief: (window.DAYS[5].allhands[1] || {}).prog }))
    await page.screenshot({ path: `${process.env.HP_SHOTS}/B-2-after-tap-mass-brief.png` })
    check('B-3 the tap stays on Edit Schedule and marks MASS BRIEF', !where.board && where.page === 'editsched' && where.flash.length > 0 && where.flash.every(f => f.where === 'week' && f.inView && String(f.key).startsWith('a:5.1')), JSON.stringify(where))
  } else check('B-3 the tap', false, 'no MASS BRIEF line to tap')
} catch (e) { check('B-crash', false, String(e && e.stack || e)) }
check('B-ERR', !errors.length, errors.length ? JSON.stringify(errors.slice(0, 6)) : 'browser error list empty')
await browser.close()
summary('hr-03 ' + W)
