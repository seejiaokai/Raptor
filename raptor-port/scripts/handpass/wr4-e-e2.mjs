// Walker e — E2: the publish note behind another OIL line, the week of 31 Jan 2028 (no Leave War period). Copied from
// walker c's wr4-c-c4.mjs (toWeek, sign, publish), with the Saturday's two ground rows made by the board's "+ Item".
// Run: node scripts/handpass/wr4-e-e2.mjs [two,before,one,board,phone]
console.log('wr4-e-e2 v4')
const E = await (await import('./wr4-e-common.mjs')).setup('e2')
const { newPage, signIn, handOver, go, sleep, judge, save, note, noteGone, bundleOf, log, finish, shownToast, answerAsks, B } = E
const ONLY = (process.argv[2] || 'two,before,one,board,phone').split(',')
const OUT = process.env.WR4_OUT
const SENT = 'No Leave War period for 2028, so no OIL can be earned for this day. Create the period on the Leave War.'
const EXP_ONE = 'Saturday published and approved · ' + SENT
const MID = '…so nobody on it earns OIL. ' + SENT

async function toWeek(w) {
  await go(w.page, 'editsched')
  await w.page.evaluate(() => window.loadWeek('31/01/2028')); await sleep(1200)
  const wk = await w.page.evaluate(() => window.DAYS.map(d => `${d.dow} ${d.dt}`))
  if (!/Jan 31/.test(wk[0])) throw new Error('week not loaded: ' + JSON.stringify(wk))
  return wk
}
const openBoard = async (w, di) => { await w.page.evaluate(i => window.openScheduler(i), di); await w.page.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(900) }
const closeBoard = async w => { const off = w.page.locator('#sbDone:visible, #sbClose:visible').first(); if (await off.count()) { await off.click(); await sleep(600) } }
const rowsOf = (w, di) => w.page.evaluate(di => { const out = {}; for (const e of document.querySelectorAll(`#schedBoard [data-txt^="gr:${di}."], #schedBoard [data-bfld^="gr:${di}."]`)) { const k = e.getAttribute('data-txt') || e.getAttribute('data-bfld'); const [, ri, f] = /^gr:\d+\.(\d+)\.(\w+)$/.exec(k) || []; if (ri == null) continue; (out[ri] ||= {})[f] = e.tagName === 'INPUT' || e.tagName === 'TEXTAREA' ? e.value : (e.textContent || '').trim() } for (const e of document.querySelectorAll(`#schedBoard [data-fill^="g:${di}."]`)) { const ri = e.getAttribute('data-fill').split('.')[1]; (out[ri] ||= {}).people = [...e.querySelectorAll('.puck[data-person]')].map(p => p.getAttribute('data-person')) } return out }, di)
async function typeIn(w, key, v) {
  const box = w.page.locator(`#schedBoard [data-txt="${key}"], #schedBoard [data-bfld="${key}"]`).first()
  if (!(await box.count())) return 'no box ' + key
  await box.scrollIntoViewIfNeeded(); await box.click()
  if (await box.evaluate(e => e.tagName) === 'INPUT') await box.fill(v); else { await w.page.keyboard.press('Control+A'); await w.page.keyboard.type(v) }
  await w.page.keyboard.press('Tab'); await sleep(350)
  return 'typed'
}
/* a new ground item by "+ Item"; times typed or not; a free man put in it by arming its place and pressing his name */
async function groundRow(w, c, di, times, tag) {
  const before = Object.keys(await rowsOf(w, di))
  if (!(await w.page.locator('#schedBoard').isVisible().catch(() => false))) await openBoard(w, di)
  const add = w.page.locator(`#schedBoard [data-gradd="${di}"]`).filter({ visible: true }).first()
  if (!(await add.count())) { log(c, `${tag}: no visible "+ Item"; buttons ${JSON.stringify(await w.page.evaluate(di => [...document.querySelectorAll(`[data-gradd="${di}"]`)].map(e => JSON.stringify(e.getBoundingClientRect())), di))}`); await E.shot(w.page, c, `e2-${tag.replace(/ /g, '')}-noadd`, { x: 0, y: 0, width: 1440, height: 900 }, 'no + Item', w.size); return null }
  await add.scrollIntoViewIfNeeded(); await add.click(); await sleep(700)
  const ri = Object.keys(await rowsOf(w, di)).find(k => !before.includes(k))
  if (ri == null) { log(c, `${tag}: "+ Item" made no row`); return null }
  if (times) { log(c, `${tag}: start ${await typeIn(w, `gr:${di}.${ri}.str`, times[0])}, end ${await typeIn(w, `gr:${di}.${ri}.end`, times[1])}`) }
  const place = w.page.locator(`#schedBoard [data-fill="g:${di}.${ri}.+"]`).first()
  await place.scrollIntoViewIfNeeded(); await place.click(); await sleep(300)
  const man = await w.page.evaluate(() => { const e = [...document.querySelectorAll('#sbRoster .rpuck[data-person]')].find(x => x.offsetParent && !x.classList.contains('no') && !x.classList.contains('busy') && window.PEOPLE[x.getAttribute('data-person')] && !window.PEOPLE[x.getAttribute('data-person')].special); return e ? e.getAttribute('data-person') : null })
  await noteGone(w, 4000)
  await w.page.locator(`#sbRoster .rpuck[data-person="${man}"]:visible`).first().click(); await sleep(500)
  const said = await shownToast(w.page)
  await w.page.keyboard.press('Escape').catch(() => {}); await sleep(300)
  const row = (await rowsOf(w, di))[ri]
  log(c, `${tag}: row ${ri} ${JSON.stringify(row)}; ${man} put; note ${JSON.stringify(said)}`)
  return { ri, man, row }
}
async function sign(w, di, root = '#eWeek') {
  if (root === '#eWeek') { await go(w.page, 'editsched'); await w.page.evaluate(i => { const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); const sc = d && (d.closest('.week') || d.parentElement); if (sc && d) sc.scrollLeft = d.offsetLeft; scrollTo(0, 0) }, di); await sleep(400) }
  const signed = {}
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = w.page.locator(`${root} select[data-sign="${role}"][data-signday="${di}"]:visible`).first()
    if (!(await sel.count())) { signed[role] = 'NO SELECT'; continue }
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    await sel.selectOption(opts[0]); await sleep(250)
    signed[role] = await sel.evaluate(s => s.options[s.selectedIndex]?.text || '')
  }
  return signed
}
async function publish(w, c, di, root, name, attr = 'data-beak') {
  const pub = w.page.locator(`${root} [${attr}="${di}"]:visible`).first()
  if (!(await pub.count())) return { err: 'no ' + attr }
  if (await pub.isDisabled()) return { err: 'greyed: ' + await pub.getAttribute('title') }
  await pub.scrollIntoViewIfNeeded(); await noteGone(w, 5000)
  if (w.tap) { await pub.tap(); await sleep(60); await w.page.screenshot({ path: `${OUT}/${name}-righttap.png` }) } else await pub.click()
  await sleep(400)
  const dlg = await w.page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent && /^(Publish|Yes|Confirm)/.test(x.textContent.trim()) && x.closest('[role="dialog"], .airpop, .modal, .upconf-pop')); return b ? b.textContent.trim() : null })
  if (dlg) { const ok = w.page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first(); if (w.tap) await ok.tap(); else await ok.click() }
  const asked = await answerAsks(w)
  const r = await note(w, c, name, /published|approved|amend|Leave War/i, 6000)
  if (r.text) { const full = { x: 0, y: 0, width: r.geo.vw, height: r.geo.vh }; await w.page.screenshot({ path: `${OUT}/${name}-screen.png`, clip: full }).catch(() => {}) }
  return { dialog: dlg, asked, ...r }
}
const checks = t => ({ dotDot: /\. ·/.test(t), sentenceTimes: t.split(SENT).length - 1, fullStopBetween: /OIL\. No Leave War period/.test(t) })

async function twoRows(tag, dir, size = 'desk') {
  const c = 'E2-' + tag
  let w = await newPage('desk', undefined, dir); await signIn(w, 'ad')
  log(c, `build ${dir} bundle ${await bundleOf(w.page)}`)
  const wk = await toWeek(w); const SAT = wk.findIndex(x => /^Sat/.test(x))
  await openBoard(w, SAT)
  const r1 = await groundRow(w, c, SAT, ['0800', '1600'], 'timed row')
  const r2 = await groundRow(w, c, SAT, null, 'timeless row')
  if (!(await w.page.locator('#schedBoard').isVisible().catch(() => false))) await openBoard(w, SAT)
  await w.page.locator('#schedBoard .sb-panel.grnd').first().scrollIntoViewIfNeeded().catch(() => {})
  await E.shot(w.page, c, `e2-${tag}-rows`, await E.boxOf(w.page, ['#schedBoard .sb-panel.grnd'], 8), await rowsOf(w, SAT), w.size)
  await closeBoard(w)
  if (!r1 || !r2 || !r1.row.people?.length || !r2.row.people?.length) { judge(c, 'two rows', 'NOT WALKED', { r1, r2 }, ''); await w.ctx.close(); return }
  const s = await sign(w, SAT)
  if (size === 'phone') { w = await handOver(w, 'phone', 'ad', dir); log(c, 'phone bundle ' + await bundleOf(w.page)); await toWeek(w); await w.page.evaluate(i => document.querySelector(`#eWeek .day[data-day="${i}"]`)?.scrollIntoView({ block: 'start', inline: 'start' }), SAT); await sleep(500) }
  const r = await publish(w, c, SAT, '#eWeek', `e2-${tag}-publish-${size}`)
  const t = r.text || ''
  if (tag === 'before') judge(c, 'two rows, before the fix', /\. · No Leave War period/.test(t) ? 'PASS' : 'FAIL', { text: t, ...checks(t), signed: s }, 'shows ". · No Leave War period"', r.pic)
  else judge(c, `two rows ${size}`, /so nobody on it earns OIL\. No Leave War period for 2028, so no OIL can be earned for this day\. Create the period on the Leave War\.$/.test(t) && !/\. ·/.test(t) && checks(t).sentenceTimes === 1 ? 'PASS' : 'FAIL', { text: t, ...checks(t), signed: s, geo: r.geo }, MID, r.pic)
  await w.ctx.close()
}
async function oneRow(fromBoard) {
  const c = 'E2-one' + (fromBoard ? '-board' : '')
  const w = await newPage('desk'); await signIn(w, 'ad'); log(c, 'bundle ' + await bundleOf(w.page))
  const wk = await toWeek(w); const SAT = wk.findIndex(x => /^Sat/.test(x))
  await openBoard(w, SAT)
  const r1 = await groundRow(w, c, SAT, ['0800', '1600'], 'timed row')
  if (!r1 || !r1.row.people?.length) { judge(c, 'one row', 'NOT WALKED', r1, EXP_ONE); await w.ctx.close(); return }
  let r, s
  if (fromBoard) { if (!(await w.page.locator('#schedBoard').isVisible().catch(() => false))) await openBoard(w, SAT); s = await sign(w, SAT, '#schedBoard'); r = await publish(w, c, SAT, '#schedBoard', 'e2-one-publish-board-desk') }
  else { await closeBoard(w); s = await sign(w, SAT); r = await publish(w, c, SAT, '#eWeek', 'e2-one-publish-week-desk') }
  judge(c, `one timed row, ${fromBoard ? 'from the Board' : 'from the week'}`, r.text === EXP_ONE ? 'PASS' : 'FAIL', { text: r.text || r.now || r.err, signed: s }, EXP_ONE, r.pic)
  if (!fromBoard) {
    /* the amendment: the published Saturday's row remark changed, signed, published again */
    await openBoard(w, SAT)
    log(c, 'remark: ' + await typeIn(w, `gr:${SAT}.${r1.ri}.rmks`, 'Kit check'))
    log(c, 'row now ' + JSON.stringify((await rowsOf(w, SAT))[r1.ri]))
    await closeBoard(w); await go(w.page, 'editsched')
    let ra = await publish(w, c, SAT, '#eWeek', 'e2-amend-desk', 'data-alpub')
    if (ra.err) { log(c, 'amendment publish: ' + ra.err + ' — signed again ' + JSON.stringify(await sign(w, SAT))); ra = await publish(w, c, SAT, '#eWeek', 'e2-amend-desk', 'data-alpub') }
    judge(c, 'amendment (remark changed)', 'RECORD', { text: ra.text || ra.now || ra.err, asked: ra.asked }, '', ra.pic)
  }
  await w.ctx.close()
}
for (const [k, f] of [['two', () => twoRows('fixed', B.fixed)], ['before', () => twoRows('before', B.before)], ['one', () => oneRow(false)], ['board', () => oneRow(true)], ['phone', () => twoRows('fixed', B.fixed, 'phone')]]) {
  if (!ONLY.includes(k)) continue
  try { await f() } catch (e) { console.log('ERR', k, e.message.split('\n')[0]); E.facts.errors.push(k + ' ' + e.stack) }
  save()
}
save(); await finish()
console.log('errors:', E.facts.errors.length, E.facts.errors.slice(0, 5).map(s => s.slice(0, 300)))
