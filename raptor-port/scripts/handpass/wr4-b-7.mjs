// Walker b, B7 — the tap and the list's furniture, phone and desktop (lesson 23). Seven lines for Ranger, one two rows tall.
// Run from raptor-port:  node scripts/handpass/wr4-b-7.mjs <run-folder-name>
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('wr4-b-7 v1')
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.argv[2] || 'b7-run1'
process.env.WR4_OUT ||= join(HERE, '../../docs/img/handpass/2026-11-24-words-r4-walk/b', RUN)
process.env.WR4_NEW ||= 'D:/rw4/build-new'
const L = await import('./wr4-lib.mjs')
const B = await import('./wr4-b-common.mjs')
const { newPage, signIn, handOver, fileInput, editInput, openBell, log, facts, press, recOf, bundleOf, sleep, shot, bellClip, RANGER, HEX, WED, THU, NEW_DIR } = L
const c = 'B7'
const out = {}
const MON = '2026-07-13', TUE = '2026-07-14', FRI = '2026-07-17'
const below = page => page.evaluate(() => {
  const s = document.querySelector('[data-testid="bell-list"] .bl-scroll'); if (!s) return null
  const sb = s.getBoundingClientRect().bottom
  const n = [...s.querySelectorAll('.bl-line')].filter(l => l.getBoundingClientRect().bottom > sb + 1).length
  const f = document.querySelector('[data-testid="bell-more"]')
  return { counted: n, foot: f ? f.textContent.trim() : null, scrollTop: Math.round(s.scrollTop), scrollMax: s.scrollHeight - s.clientHeight }
})
const unreadN = page => page.evaluate(() => document.querySelectorAll('[data-testid="bell-list"] .bl-line.unread').length)
try {
  // ---- the fixture: Ranger files four LLs; Saber changes them, files a group Training and changes it, files one for Ranger alone
  let w = await newPage('desk', undefined, NEW_DIR); await signIn(w, 'us')
  log(c, 'bundle: ' + await bundleOf(w.page))
  const lls = {}
  for (const d of [MON, TUE, WED, FRI]) lls[d] = await fileInput(w, c, d, { type: 'LL', span: 'all', remarks: 'Leave ' + d.slice(8) })
  if (Object.values(lls).some(x => !x)) throw new Error('fixture: an LL was not filed ' + JSON.stringify(lls))
  w = await handOver(w, 'desk', 'ad')
  await editInput(w, c, lls[MON], MON, () => w.page.selectOption('#inpEditPop #inpEditType', 'OL'))
  await editInput(w, c, lls[TUE], TUE, () => press(w, '#inpEditSpan [data-span="am"]'))
  await editInput(w, c, lls[WED], WED, () => w.page.selectOption('#inpEditPop #inpEditType', 'OL'))
  await editInput(w, c, lls[FRI], FRI, () => press(w, '#inpEditSpan [data-span="pm"]'))
  const tr = await fileInput(w, c, WED, { type: 'Training', people: [RANGER, HEX], from: '09:00', to: '10:00', title: 'Training', remarks: 'Bring your kit' })
  await editInput(w, c, tr, WED, async () => {
    await press(w, `#inpEdCal [data-iso="${THU}"]`)
    await w.page.fill('#inpEditPop #inpEditOwnTitle', 'Range brief')
    await w.page.fill('#inpEditPop #inpEditRmk', 'Bring water')
  })
  await fileInput(w, c, FRI, { type: 'Training', people: [RANGER], from: '14:00', to: '15:00', title: 'Sim brief', remarks: '' })
  await sleep(1200)
  const state = await w.ctx.storageState({ indexedDB: true }); await w.ctx.close()

  for (const size of ['phone', 'desk']) {
    const o = out[size] = {}
    const r = await newPage(size, state, NEW_DIR); await signIn(r, 'us')
    await openBell(r)
    let ls = await B.readLines(r.page)
    o.lines = B.said(ls); o.fit = (await L.bellFit(r.page)).map(f => f && f.lines)
    o.belowTop = await below(r.page)
    log(c, `${size}: ${ls.length} lines; rows per line ${JSON.stringify(o.fit)}; foot at top ${JSON.stringify(o.belowTop)}`)
    await B.bellPic(r, c, `B7-1-list-top-${size}`, ls)
    // scroll inside the list: halfway, then to the end
    for (const [tag, f] of [['half', 0.5], ['end', 1]]) {
      await r.page.evaluate(f => { const s = document.querySelector('[data-testid="bell-list"] .bl-scroll'); s.scrollTop = (s.scrollHeight - s.clientHeight) * f; s.dispatchEvent(new Event('scroll')) }, f)
      await sleep(400)
      o['below_' + tag] = await below(r.page)
      log(c, `${size}: foot scrolled ${tag}: ${JSON.stringify(o['below_' + tag])}`)
      await shot(r.page, c, `B7-2-list-${tag}-${size}`, await bellClip(r.page), o['below_' + tag], size)
    }
    await r.page.keyboard.press('Escape'); await sleep(300)
    // tap a "changed to" line and the "and 1 more change" line
    for (const [tag, re] of [['changedto', / changed to /], ['onemore', /and 1 more change/]]) {
      await openBell(r)
      ls = await B.readLines(r.page)
      const n0 = await unreadN(r.page), lit0 = (await B.bellState(r.page)).lit
      const L1 = ls.find(l => re.test(l.what) && l.unread)
      if (!L1) { log(c, `${size}: no unread line for ${tag}`); continue }
      const shows = await B.tapLine(r, c, L1.i, `B7-3-tap-${tag}-${size}`)
      const st = await B.stored(r.page, RANGER)
      const n = st.find(x => `bell-line-${x.id}` === L1.id)
      const rec = n ? await recOf(r.page, n.iid) : null
      log(c, `${size}: tapped "${L1.what}": window ${JSON.stringify({ open: shows.open, page: shows.page, type: shows.type, title: shows.title, start: shows.start, end: shows.end, span: shows.span, cal: shows.calPicked })}; record ${JSON.stringify(rec)}`)
      await B.closeWin(r)
      await openBell(r)
      const n1 = await unreadN(r.page)
      const again = (await B.readLines(r.page)).find(x => x.id === L1.id)
      o['tap_' + tag] = { line: L1.what, unreadBefore: n0, unreadAfter: n1, nowRead: again && !again.unread, shows, rec, litBefore: lit0 }
      log(c, `${size}: unread ${n0} -> ${n1}; that line now read: ${again && !again.unread}`)
      await r.page.keyboard.press('Escape'); await sleep(300)
    }
    // the ways the list closes (on a fresh open each)
    const ways = {}
    const isOpen = () => r.page.locator('[data-testid="bell-list"]').count()
    await openBell(r); ways.closeX = await r.page.locator('[data-testid="bell-list"] [aria-label*="Close" i], [data-testid="bell-list"] .x, [data-testid="bell-list"] button:has-text("✕")').count()
    await r.page.keyboard.press('Escape'); await sleep(300); ways.escape = (await isOpen()) === 0
    await openBell(r)
    if (r.tap) await r.page.touchscreen.tap(200, 820); else await r.page.mouse.click(700, 850)
    await sleep(400); ways.outside = (await isOpen()) === 0
    if (!ways.outside) { await r.page.keyboard.press('Escape'); await sleep(300) }
    await openBell(r)
    await press(r, '#notifyBell'); await sleep(300); ways.bellAgain = (await isOpen()) === 0
    if (!ways.bellAgain) { await r.page.keyboard.press('Escape'); await sleep(300) }
    o.ways = ways
    log(c, `${size}: closes by ✕ (count of such controls) ${ways.closeX}; Escape ${ways.escape}; a tap outside ${ways.outside}; the bell again ${ways.bellAgain}`)
    await shot(r.page, c, `B7-4-after-closings-${size}`, { x: 0, y: 0, width: r.page.viewportSize().width, height: 300 }, ways, size)
    // Mark all read
    await openBell(r)
    const nm = await unreadN(r.page)
    await press(r, '[data-testid="bell-markall"]'); await sleep(400)
    o.markAll = { before: nm, after: await unreadN(r.page), state: await B.bellState(r.page) }
    log(c, `${size}: Mark all read: unread ${nm} -> ${o.markAll.after}; bell ${JSON.stringify(o.markAll.state)}`)
    await B.bellPic(r, c, `B7-5-after-markall-${size}`, await B.readLines(r.page))
    await r.page.keyboard.press('Escape'); await sleep(300)
    // the Scheduler Board's own bar
    try {
      await r.page.evaluate(() => window.openScheduler(0)); await r.page.waitForSelector('#schedBoard', { timeout: 6000 }); await sleep(800)
      await press(r, '#sbBell'); await sleep(400)
      const sb = await B.readLines(r.page)
      o.board = B.said(sb)
      const same = JSON.stringify(sb.map(x => x.what)) === JSON.stringify(ls.map(x => x.what))
      log(c, `${size}: the board's bell: ${sb.length} lines; same words as the top bar's: ${same}`)
      await B.bellPic(r, c, `B7-6-board-bell-${size}`, sb)
    } catch (e) { o.board = 'not reached: ' + String(e.message).split('\n')[0]; log(c, `${size}: the Scheduler Board as Ranger: ${o.board}`); await shot(r.page, c, `B7-6-board-try-${size}`, { x: 0, y: 0, width: r.page.viewportSize().width, height: 300 }, o.board, size) }
    await r.ctx.close()
  }
} catch (e) { facts.errors.push(`${c}: ` + String(e && e.stack || e).slice(0, 600)); log(c, 'ERROR ' + String(e && e.message || e).split('\n')[0]) }
B.dump('b7.json', { out, log: facts.cases, errors: facts.errors })
console.log('\npictures:', facts.pictures.length, '· errors:', facts.errors.length)
for (const e of facts.errors.slice(0, 20)) console.log('  ' + e)
await L.finish()
