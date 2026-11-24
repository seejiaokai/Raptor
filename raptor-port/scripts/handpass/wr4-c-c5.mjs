// Walker c — C5, "Create the 2028 period" on the week's warning list and the Scheduler Board's (desktop), and Ranger.
// Run: node scripts/handpass/wr4-c-c5.mjs
console.log('wr4-c-c5 v2')
const C = await (await import('./wr4-c-common.mjs')).setup('c5')
const { newPage, signIn, handOver, go, sleep, judge, save, note, noteGone, bundleOf, log, shot, finish, shownToast } = C
const HOVER = 'Creates the 2028 Leave War period, with nothing open for bidding, and takes you to the Leave War to open its dates'
const MADE = 'The 2028 Leave War period is created. Open its dates for bidding here.'

async function toWeek(w) { await go(w.page, 'editsched'); await w.page.evaluate(() => window.loadWeek('31/01/2028')); await sleep(1200); return w.page.evaluate(() => window.DAYS.map(d => `${d.dow} ${d.dt}`)) }
const openBoard = async (w, di) => { await w.page.evaluate(i => window.openScheduler(i), di); await w.page.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(900) }
const closeBoard = async w => { const off = w.page.locator('#sbDone:visible, #sbClose:visible').first(); if (await off.count()) { await off.click(); await sleep(600) } }
async function plant(w, di) {
  await openBoard(w, di)
  const add = w.page.locator(`#schedBoard [data-gradd="${di}"]`).first()
  if (await add.count()) {
    await add.scrollIntoViewIfNeeded(); await add.click(); await sleep(700)
    for (const [f, v] of [['str', '0800'], ['end', '1600']]) {
      const box = w.page.locator(`#schedBoard [data-txt^="gr:${di}."][data-txt$=".${f}"], #schedBoard [data-bfld^="gr:${di}."][data-bfld$=".${f}"]`).first()
      if (await box.count()) { await box.click(); const tg = await box.evaluate(e => e.tagName); if (tg === 'INPUT') await box.fill(v); else { await w.page.keyboard.press('Control+A'); await w.page.keyboard.type(v) } await w.page.keyboard.press('Tab'); await sleep(300) }
    }
  }
  const empty = await w.page.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard .seat[data-slot], #schedBoard [data-fill]')].find(x => x.getBoundingClientRect().width > 4 && !x.querySelector('.puck[data-person]')); return e ? (e.getAttribute('data-slot') || e.getAttribute('data-fill')) : null })
  const place = w.page.locator(`#schedBoard [data-slot="${empty}"], #schedBoard [data-fill="${empty}"]`).first()
  await place.scrollIntoViewIfNeeded(); await place.click(); await sleep(300)
  const man = await w.page.evaluate(() => { const e = [...document.querySelectorAll('#sbRoster .rpuck[data-person]')].find(x => x.offsetParent && !x.classList.contains('no') && !x.classList.contains('busy') && window.PEOPLE[x.getAttribute('data-person')] && !window.PEOPLE[x.getAttribute('data-person')].special); return e ? e.getAttribute('data-person') : null })
  await w.page.locator(`#sbRoster .rpuck[data-person="${man}"]:visible`).first().click(); await sleep(600)
  await w.page.keyboard.press('Escape').catch(() => {}); await sleep(300)
  return man
}
/* hover the button, read its words; press it; read the note, where the app went, the Leave War's state, Undo's hover */
async function hoverPress(w, c, where, btnSel, tag, press = true) {
  const btn = w.page.locator(btnSel).filter({ visible: true }).first()
  if (!(await btn.count())) { judge(c, `${tag} button`, 'NOT WALKED', 'no visible ' + btnSel, HOVER); return null }
  await btn.scrollIntoViewIfNeeded(); await btn.hover(); await sleep(900)
  const title = await btn.getAttribute('title'), label = (await btn.innerText()).trim()
  await shot(w.page, c, `c5-${tag}-hover-desk`, await C.boxOf(w.page, [btnSel], 140), { label, title }, w.size)
  judge(c, `${tag} hover`, title === HOVER ? 'PASS' : 'FAIL', { label, title }, HOVER, `c5-${tag}-hover-desk.png`)
  if (!press) return { title }
  await noteGone(w, 5000)
  await btn.click()
  const r = await note(w, c, `c5-${tag}-press-desk`, /./, 4000)
  await sleep(800)
  const page = await w.page.evaluate(() => window.CURPAGE)
  const lw = await w.page.evaluate(() => { const h = document.querySelector('#leavewar, .lw-page, [data-page="leavewar"]') || document.body; return (h.innerText || '').replace(/\s+/g, ' ').slice(0, 400) })
  await shot(w.page, c, `c5-${tag}-after-desk`, { x: 0, y: 0, ...w.page.viewportSize() }, { page }, w.size)
  judge(c, `${tag} press note`, r.text === MADE ? 'PASS' : 'FAIL', r.text || r.now, MADE, r.pic)
  judge(c, `${tag} leave war opens on 2028`, 'RECORD', { page, top: lw }, 'the Leave War on 2028, nothing open for bidding', `c5-${tag}-after-desk.png`)
  const u = await w.page.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? { title: b.getAttribute('title'), disabled: b.disabled } : null })
  if (await w.page.locator('#undoBtn:visible').count()) { await w.page.locator('#undoBtn:visible').hover(); await sleep(700) }
  await shot(w.page, c, `c5-${tag}-undo-hover-desk`, await C.boxOf(w.page, ['#undoBtn'], 120), u, w.size)
  judge(c, `${tag} undo hover after`, 'RECORD', u, '', `c5-${tag}-undo-hover-desk.png`)
  return { title, note: r.text }
}

const c = 'C5'
/* world 1: the week's warning list */
if (process.argv[2] !== 'w2' && process.argv[2] !== 'ranger') try {
  let w = await newPage('desk'); await signIn(w, 'ad'); log(c, 'bundle ' + await bundleOf(w.page))
  const wk = await toWeek(w); const SAT = wk.findIndex(x => /^Sat/.test(x))
  log(c, 'planted ' + await plant(w, SAT)); await closeBoard(w)
  await go(w.page, 'editsched'); await sleep(300)
  const dw = w.page.locator(`#eWeek [data-daywarn="${SAT}"]`).first()
  if (await dw.count()) { await dw.scrollIntoViewIfNeeded(); await dw.click(); await sleep(500) }
  const line = await w.page.evaluate(i => [...document.querySelectorAll(`.witem[data-wdi="${i}"]`)].filter(e => /Leave War period/.test(e.textContent)).map(e => e.textContent.replace(/\s+/g, ' ').trim()), SAT)
  log(c, 'the week\'s warning line: ' + JSON.stringify(line))
  await hoverPress(w, c, 'week', `#eWeek [data-mkperiod="2028"]`, 'week')
  /* the same world, the board afterwards: is the button still offered? */
  await toWeek(w); await openBoard(w, SAT)
  const still = await w.page.locator('#schedBoard [data-mkperiod]:visible').count()
  const warn = await w.page.evaluate(() => [...document.querySelectorAll('#schedBoard [class*="wln"]')].filter(e => /Leave War/.test(e.textContent)).map(e => e.textContent.replace(/\s+/g, ' ').trim()).slice(0, 3))
  await shot(w.page, c, 'c5-week-then-board-desk', await C.boxOf(w.page, ['#schedBoard [class*="wln"]'], 16), { still, warn }, w.size)
  judge(c, 'after creating: the board in the same world', 'RECORD', { buttonsShown: still, periodLines: warn }, '', 'c5-week-then-board-desk.png')
  await closeBoard(w)
  /* Ranger, same world (period now made): and a fresh world below without it */
  await w.ctx.close()
} catch (e) { console.log('ERR w1', e.message.split('\n')[0]); C.facts.errors.push('w1 ' + e.stack) }
/* world 2: the board's warning list; then Ranger on a world with no period */
if (process.argv[2] !== 'ranger') try {
  let w = await newPage('desk'); await signIn(w, 'ad')
  const wk = await toWeek(w); const SAT = wk.findIndex(x => /^Sat/.test(x))
  await plant(w, SAT)
  await sleep(500); await toWeek(w); await openBoard(w, SAT)
  await hoverPress(w, c, 'board', '#schedBoard [data-mkperiod="2028"]', 'board')
  await w.ctx.close()
  /* world 3 (fresh, its board): a second press — the period made once, pressed again from the board's list if still drawn */
  const w3 = await newPage('desk'); await signIn(w3, 'ad')
  const wk3 = await toWeek(w3); const SAT3 = wk3.findIndex(x => /^Sat/.test(x))
  await plant(w3, SAT3); await toWeek(w3); await openBoard(w3, SAT3)
  const b1 = w3.page.locator('#schedBoard [data-mkperiod="2028"]').filter({ visible: true }).first()
  if (await b1.count()) {
    await b1.click(); const r1 = await note(w3, c, 'c5-second-first-press-desk', /./, 4000)
    await toWeek(w3); await openBoard(w3, SAT3)
    const b2 = w3.page.locator('#schedBoard [data-mkperiod]').filter({ visible: true })
    const n2 = await b2.count()
    let r2 = { text: '(no button drawn for a second press)' }
    if (n2) { await noteGone(w3, 5000); await b2.first().click(); r2 = await note(w3, c, 'c5-second-press-desk', /./, 4000) }
    await shot(w3.page, c, 'c5-second-board-desk', { x: 0, y: 0, ...w3.page.viewportSize() }, { n2 }, w3.size)
    judge(c, 'second press, fresh world board', 'RECORD', { first: r1.text || r1.now, buttonsAfter: n2, second: r2.text || r2.now || '' }, '', r2.pic || 'c5-second-board-desk.png')
  } else judge(c, 'second press', 'NOT WALKED', 'no button on the fresh board', '')
  await w3.ctx.close()
  } catch (e) { console.log('ERR w3', e.message.split('\n')[0]); C.facts.errors.push('w3 ' + e.stack) }
  try {
  /* Ranger on a world where Saber planted the Saturday but made no period */
  const w4 = await newPage('desk'); await signIn(w4, 'ad'); const wk4 = await toWeek(w4); const SAT4 = wk4.findIndex(x => /^Sat/.test(x)); await plant(w4, SAT4); await closeBoard(w4)
  const r = await handOver(w4, 'desk', 'us')
  const rk = await toWeek(r)
  const opened = await r.page.evaluate(i => { const e = [...document.querySelectorAll(`[data-daywarn="${i}"]`)].find(x => x.getBoundingClientRect().width > 2); if (!e) return false; e.scrollIntoView({ block: 'center' }); e.click(); return true }, SAT4); await sleep(500)
  log(c, 'Ranger: the Saturday\'s warning bar pressed: ' + opened)
  const mk = await r.page.evaluate(() => [...document.querySelectorAll('[data-mkperiod]')].map(e => ({ shown: e.getBoundingClientRect().width > 2, t: e.textContent.trim() })))
  const lines = await r.page.evaluate(() => [...document.querySelectorAll('.witem, [class*="wln"]')].filter(e => /Leave War period/.test(e.textContent) && e.getBoundingClientRect().width > 2).map(e => e.textContent.replace(/\s+/g, ' ').trim()).slice(0, 3))
  await shot(r.page, c, 'c5-ranger-desk', { x: 0, y: 0, ...r.page.viewportSize() }, { page: await r.page.evaluate(() => window.CURPAGE), mk, lines }, r.size)
  judge(c, 'ranger: no button', mk.filter(x => x.shown).length === 0 ? 'PASS' : 'FAIL', { page: await r.page.evaluate(() => window.CURPAGE), week: rk[0], buttons: mk, periodLines: lines }, 'no such button', 'c5-ranger-desk.png')
  await r.ctx.close()
} catch (e) { console.log('ERR w2', e.message.split('\n')[0]); C.facts.errors.push('w2 ' + e.stack) }
save(); await finish()
console.log('errors:', C.facts.errors.length, C.facts.errors.slice(0, 5).map(s => s.slice(0, 200)))
