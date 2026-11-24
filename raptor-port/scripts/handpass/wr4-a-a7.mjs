// Walker a — A7: every door. The same change (a timed input's start 09:00 -> 08:00; a leave's day by a drag) made through
// each door Saber has; Ranger and Hex read. Run: node scripts/handpass/wr4-a-a7.mjs [run]
import { setup } from './wr4-a-common.mjs'
console.log('wr4-a-a7 v3 board pencil where shown; was v2 (waits on the window\'s own Start box, 9 s)')
const RUN = process.argv[2] || 'a7-r1'
const { L, A } = await setup(RUN)
const { newPage, signIn, handOver, fileInput, editInput, recOf, bundleOf, log, press, sleep, shot, boxOf, go, answerAsks, shownToast, toMonth, RANGER, HEX } = L
const c = 'A7'
const T = t => ({ type: 'Training', people: [RANGER, HEX], from: '09:00', to: '10:00', title: t })
const toEight = w => w.page.fill('#inpEditPop #inpEditStart', '08:00')
/* the window, opened by `open`, changed and saved the plain way */
async function viaWindow(w, tag, open) {
  await open()
  const ok = await w.page.locator('#inpEditPop #inpEditStart').waitFor({ timeout: 9000 }).then(() => true).catch(() => false)
  if (!ok) { await shot(w.page, c, `A7-${tag}-nowindow-desk`, { x: 0, y: 0, width: 1440, height: 900 }, 'after the press', 'desk'); A.judge(c, `${tag}: the door opens the input's window`, false, 'no window'); await w.page.keyboard.press('Escape'); return false }
  await sleep(400); await shot(w.page, c, `A7-${tag}-window-desk`, await boxOf(w.page, ['[data-testid="win-inputedit"]'], 8), 'the window opened by this door', 'desk')
  await toEight(w); await press(w, '#inpEditSave'); const asked = await answerAsks(w)
  log(c, `${tag}: saved; asked ${JSON.stringify(asked)}; note ${JSON.stringify(await shownToast(w.page))}`)
  await sleep(300)
  if (await w.page.locator('#inpEditPop #inpEditStart:visible').count()) { await w.page.keyboard.press('Escape'); await sleep(300); const d = w.page.locator('[data-testid="inped-escask-go"]:visible'); if (await d.count()) await d.click(); log(c, tag + ': window still open after Save') }
  return true
}
try {
  let w = await newPage('desk'); await signIn(w, 'ad')
  log(c, 'bundle ' + await bundleOf(w.page))
  const m = {}
  for (const [k, iso] of [['list', '2026-07-13'], ['card', '2026-07-14'], ['esPen', '2026-07-15'], ['sbPen', '2026-07-16'], ['esBox', '2026-07-17'], ['sbBox', '2026-07-18']]) m[k] = await fileInput(w, c, iso, T('Door ' + k))
  m.drag = await fileInput(w, c, '2026-07-20', { type: 'LL', people: [RANGER], span: 'all' })
  m.dragAM = await fileInput(w, c, '2026-07-22', { type: 'LL', people: [RANGER], span: 'am' })
  log(c, 'made ' + JSON.stringify(m))
  // (i) the Inputs list's row
  await go(w.page, 'inputs')
  if (await w.page.locator('#inListBtn').getAttribute('aria-pressed') !== 'true') await press(w, '#inListBtn')
  if (m.list) await viaWindow(w, 'i-list', () => press(w, `tr[data-iid="${m.list}"]`))
  // (ii) the Inputs calendar's day card (the recipe's door)
  if (m.card) await editInput(w, c, m.card, '2026-07-14', () => toEight(w))
  // (iii) Edit Schedule's row: its pencil / type
  await go(w.page, 'editsched')
  if (m.esPen) { await w.page.evaluate(() => document.querySelector('#eWeek [data-pitog="2"]')?.click()); await sleep(400); await viaWindow(w, 'iii-editsched', () => press(w, `#eWeek [data-inpedit="${m.esPen}"]`)) }
  // in place: Edit Schedule's start box
  if (m.esBox) {
    await w.page.evaluate(() => document.querySelector('#eWeek [data-pitog="4"]')?.click()); await sleep(400)
    const key = await w.page.evaluate(i => [...document.querySelectorAll(`#eWeek [data-inp^="${i}"][data-inp$=".str"]`)].filter(e => e.getBoundingClientRect().width > 2).map(e => e.getAttribute('data-inp')), m.esBox)
    A.judge(c, 'Edit Schedule: the shared input\'s start boxes (one row or one per man?)', null, key)
    if (key[0]) { const el = w.page.locator(`#eWeek [data-inp="${key[0]}"]`).first(); await el.scrollIntoViewIfNeeded(); await el.click({ timeout: 8000 }); await w.page.keyboard.press('Control+A'); await w.page.keyboard.type('0800', { delay: 10 }); await w.page.keyboard.press('Tab'); await sleep(500); log(c, 'esBox note ' + JSON.stringify(await shownToast(w.page))) }
  }
  // (iv) the Scheduler Board's row, and its start box in place
  if (m.sbPen) { await w.page.evaluate(() => window.openScheduler(3)); await sleep(900); await viaWindow(w, 'iv-board', () => w.page.locator(`#schedBoard [data-inpedit="${m.sbPen}"]:visible`).first().click({ timeout: 8000 }).catch(e => log(c, 'board pencil: ' + String(e.message).split('\n')[0]))) }
  if (m.sbBox) {
    await w.page.evaluate(() => window.openScheduler(5)); await sleep(900)
    const key = await w.page.evaluate(i => [...document.querySelectorAll(`#schedBoard [data-ifld^="${i}"][data-ifld$=".str"]`)].filter(e => e.getBoundingClientRect().width > 2).map(e => e.getAttribute('data-ifld')), m.sbBox)
    A.judge(c, 'the Board: the shared input\'s start boxes', null, key)
    if (key[0]) { const el = w.page.locator(`#schedBoard [data-ifld="${key[0]}"]`).first(); await el.click({ timeout: 8000 }); await el.fill('08:00'); await w.page.keyboard.press('Tab'); await sleep(500); log(c, 'sbBox note ' + JSON.stringify(await shownToast(w.page))) }
    await w.page.keyboard.press('Escape'); await sleep(300)
    const x = w.page.locator('#schedBoard [aria-label="Close"]:visible, #sbClose:visible').first(); if (await x.count()) await x.click().catch(() => {})
  }
  // a bar dragged on the Inputs calendar: once taken back by Escape mid-carry, once let go on Tue 21 Jul; an AM leave moved
  const drag = async (iid, from, to, cancel, tag) => {
    await toMonth(w, 2026, 7); await sleep(400)
    const bar = await w.page.locator(`[data-testid="ib-bar-${iid}"]`).first().boundingBox()
    const cell = async iso => w.page.locator(`#inpCal [data-icday="${iso}"]`).boundingBox()
    if (!bar) { A.judge(c, `${tag}: bar found`, false, 'no bar'); return }
    const t = await cell(to), f = await cell(from), y = bar.y + bar.height / 2
    const before = await recOf(w.page, iid)
    await w.page.mouse.move(f.x + f.width / 2, y); await w.page.mouse.down()
    await w.page.mouse.move(f.x + f.width / 2 + 20, y + 4, { steps: 4 })
    await w.page.mouse.move(t.x + t.width / 2, y + 6, { steps: 6 })
    const ghost = await w.page.locator('.ic-ghost').count()
    await shot(w.page, c, `A7-${tag}-carried-desk`, await boxOf(w.page, ['#inpCal'], 4), 'the bar carried', 'desk')
    if (cancel) { await w.page.keyboard.press('Escape'); await sleep(200); await w.page.mouse.up() } else await w.page.mouse.up()
    await sleep(700)
    const q = await w.page.evaluate(() => [...document.querySelectorAll('[role="alertdialog"], [role="dialog"]')].filter(d => d.getBoundingClientRect().width > 2).map(d => (d.textContent || '').replace(/\s+/g, ' ').slice(0, 200)))
    if (q.length) { await shot(w.page, c, `A7-${tag}-question-desk`, { x: 0, y: 0, width: 1440, height: 900 }, q, 'desk'); await answerAsks(w) }
    A.judge(c, `${tag}: carried (ghost ${ghost}); a question asked?`, null, { question: q, before, after: await recOf(w.page, iid), note: await shownToast(w.page) })
  }
  if (m.drag) { await drag(m.drag, '2026-07-20', '2026-07-21', true, 'drag-escape'); await drag(m.drag, '2026-07-20', '2026-07-21', false, 'drag-dropped') }
  if (m.dragAM) await drag(m.dragAM, '2026-07-22', '2026-07-23', false, 'dragAM-dropped')
  for (const k of Object.keys(m)) log(c, `${k} now ${JSON.stringify(await recOf(w.page, m[k]))}`)
  for (const [size, who] of [['phone', 'us'], ['desk', 'us'], ['phone', 'hex']]) {
    w = await handOver(w, size, who)
    const r = await A.bell(w, c, `${who === 'us' ? 'ranger' : 'hex'}-bell`)
    const by = name => r.filter(l => l.name === name && !/You were added/.test(l.what)).map(l => `${l.name} ${l.day} / ${l.what}`)
    for (const k of ['list', 'card', 'esPen', 'sbPen', 'esBox', 'sbBox']) A.judge(c, `${size} ${who}: door ${k} (RECORD; the card's words are the baseline)`, null, by('Door ' + k))
    if (who === 'us') A.judge(c, `${size}: the drags (RECORD; none expected for the Escape)`, null, r.filter(l => ['Mon 20 Jul', 'Tue 21 Jul', 'Wed 22 Jul', 'Thu 23 Jul'].includes(l.day)).map(l => `${l.name} ${l.day} / ${l.what}`))
  }
  // (v) a tap on the bell line, as Ranger, on the desktop: what opens (Ranger is a member — his change, if any, RECORD)
  w = await handOver(w, 'desk', 'us')
  await L.openBell(w)
  const line = w.page.locator('[data-testid="bell-list"] .bl-line').first()
  const said = (await line.textContent() || '').replace(/\s+/g, ' ').trim()
  await press(w, line); await sleep(600)
  const win = await w.page.locator('[data-testid="win-inputedit"]:visible').count()
  await shot(w.page, c, 'A7-v-bell-tap-desk', { x: 0, y: 0, width: 1440, height: 900 }, said, 'desk')
  A.judge(c, '(v) a tap on Ranger\'s first bell line opens the input\'s window (RECORD; read-only?)', null, { line: said, window: !!win, readOnly: await w.page.locator('[data-testid="inped-ro"]:visible').count(), page: await w.page.evaluate(() => window.CURPAGE) })
  await w.ctx.close()
} catch (e) { L.facts.errors.push('A7: ' + String(e && e.stack || e).slice(0, 500)); log(c, 'ERROR ' + String(e.message || e)) }
await A.done(RUN)
