// Walker b, B8 — the plain-user round (§7.0a): as Saber (desktop) then as Ranger (phone): file an input, open it, close
// its window each way (✕, Escape, a press outside, Cancel — with and without an unsaved change), change and Save, Undo;
// then the other places that show it, and the other person's bell.
// Run from raptor-port:  node scripts/handpass/wr4-b-8.mjs <run-folder-name>
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('wr4-b-8 v4')
let DAY = '2026-07-15'
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.argv[2] || 'b8-run1'
process.env.WR4_OUT ||= join(HERE, '../../docs/img/handpass/2026-11-24-words-r4-walk/b', RUN)
process.env.WR4_NEW ||= 'D:/rw4/build-new'
const L = await import('./wr4-lib.mjs')
const B = await import('./wr4-b-common.mjs')
const { newPage, signIn, handOver, fileInput, openDay, openBell, log, facts, press, recOf, bundleOf, sleep, shot, go, shownToast, answerAsks, RANGER, HEX, WED, NEW_DIR } = L
const out = {}
const full = w => ({ x: 0, y: 0, width: w.page.viewportSize().width, height: w.page.viewportSize().height })
const winOpen = w => w.page.locator('[data-testid="win-inputedit"]:visible').count()
const askUp = w => w.page.locator('[data-testid="inped-escask"]:visible').count()
async function openCard(w, iid) {
  await openDay(w, DAY)
  const card = w.page.locator(`[data-testid="win-inputsday"] [data-iid="${iid}"], [data-testid="win-inputsday"] [data-popiid="${iid}"]`).first()
  try { await card.scrollIntoViewIfNeeded(); await (w.tap ? card.tap({ timeout: 4000 }) : card.click({ timeout: 4000 })); await sleep(w.tap ? 650 : 200) } catch (e) {
    const box = await card.boundingBox()
    const top = box ? await w.page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.outerHTML.slice(0, 160) : null }, [box.x + box.width / 2, box.y + box.height / 2]) : null
    log('B8', 'the card could not be pressed; what stands over it: ' + top)
    out.blocked = (out.blocked || []).concat(top)
    await w.page.reload(); await w.page.waitForSelector('#luser', { timeout: 20000 }); await w.page.addStyleTag({ content: L.NOMOTION })
    await signIn(w, w.user)
    await openDay(w, DAY)
    await press(w, card)
  }
  await w.page.locator('[data-testid="win-inputedit"]').waitFor({ timeout: 5000 }); await sleep(400)
}
/* the day's window ✕, if it is there and pressable (v2: after a press outside it was covered and the click hung) */
async function dayX(w) {
  const x = w.page.locator('[data-testid="win-inputsday-x"]:visible').first()
  if (await x.count()) await x.click({ timeout: 3000 }).catch(async () => { await w.page.keyboard.press('Escape'); await sleep(300) })
  await sleep(250)
}
async function outside(w) {
  const vp = w.page.viewportSize()
  const box = await w.page.locator('[data-testid="win-inputedit"]').boundingBox()
  // a point on the page beside the window (left of it on a desktop; under it, else above, on a phone)
  let x = 30, y = vp.height - 30
  if (box && box.x > 60) { x = 20; y = Math.round(box.y + 40) } else if (box && box.y + box.height < vp.height - 20) { x = vp.width / 2; y = vp.height - 10 } else { x = vp.width / 2; y = 5 }
  if (w.tap) await w.page.touchscreen.tap(x, y); else await w.page.mouse.click(x, y)
  await sleep(500)
  return { x, y }
}
async function round(c, w, iid, size) {
  const o = out[c] = { ways: [] }
  const rmk0 = (await recOf(w.page, iid)).remarks
  for (const dirty of [false, true]) {
    for (const way of ['x', 'escape', 'outside', 'cancel']) {
      await openCard(w, iid)
      if (dirty) await w.page.fill('#inpEditPop #inpEditRmk', 'Typed not saved')
      let at = null
      if (way === 'x') await press(w, '[data-testid="win-inputedit-x"]')
      else if (way === 'escape') { await w.page.keyboard.press('Escape'); await sleep(400) }
      else if (way === 'outside') at = await outside(w)
      else await press(w, '#inpEditCancel')
      const r = { way, dirty, at, windowOpen: await winOpen(w), ask: await askUp(w), note: await shownToast(w.page) }
      const tag = `${c}-${dirty ? 'dirty' : 'clean'}-${way}-${size}`
      await shot(w.page, c, tag, full(w), r, size)
      if (r.ask) { await press(w, '[data-testid="inped-escask-go"]'); r.afterDiscard = await winOpen(w) }
      if (await winOpen(w)) { await B.closeWin(w) }
      r.remarksNow = (await recOf(w.page, iid)).remarks
      r.lost = dirty ? r.remarksNow === rmk0 : null
      o.ways.push(r)
      log(c, `${dirty ? 'with' : 'without'} an unsaved change, ${way}: window still open ${r.windowOpen}; the "lose them?" question ${r.ask}; note ${JSON.stringify(r.note)}; remark now ${JSON.stringify(r.remarksNow)}`)
      await dayX(w)
    }
  }
  // change and Save, then Undo
  await openCard(w, iid)
  await w.page.selectOption('#inpEditPop #inpEditType', 'OL'); await w.page.fill('#inpEditPop #inpEditRmk', 'Changed and saved')
  await press(w, '#inpEditSave'); o.saveAsked = await answerAsks(w)
  o.saveNote = await shownToast(w.page); o.saved = await recOf(w.page, iid)
  log(c, `Save: note ${JSON.stringify(o.saveNote)}; record ${JSON.stringify(o.saved)}`)
  await dayX(w)
  const undo = w.page.locator('#undoBtn')
  o.undoVisible = await undo.isVisible().catch(() => false)
  if (!o.undoVisible && w.tap) { await press(w, '#burger'); await sleep(400) }
  o.undoTitle = await undo.getAttribute('title').catch(() => null)
  await undo.click({ timeout: 5000 }).catch(e => { o.undoErr = String(e.message).split('\n')[0] })
  await sleep(500)
  o.undoNote = await shownToast(w.page); o.afterUndo = await recOf(w.page, iid)
  log(c, `Undo (${JSON.stringify(o.undoTitle)}${o.undoErr ? ', ' + o.undoErr : ''}): note ${JSON.stringify(o.undoNote)}; record ${JSON.stringify(o.afterUndo)}`)
  await shot(w.page, c, `${c}-after-undo-${size}`, full(w), o.undoNote, size)
  await w.page.keyboard.press('Escape').catch(() => {}); await sleep(300)
  // the places that show it
  for (const p of ['inputs-list', 'inputs-cal', 'editsched', 'viewsched']) {
    try {
      if (p === 'inputs-list') { await go(w.page, 'inputs'); if (await w.page.locator('#inCalBtn').getAttribute('aria-pressed') === 'true') await press(w, '#inCalBtn') }
      else if (p === 'inputs-cal') { await L.toMonth(w, 2026, 7) }
      else { const allowed = await w.page.evaluate(pg => { try { window.go(pg); return window.CURPAGE === pg } catch { return false } }, p); await sleep(700); if (!allowed) { log(c, `${p}: not open to this person`); continue } }
      const seen = await w.page.evaluate(id => { const e = document.querySelector(`[data-iid="${id}"],[data-popiid="${id}"],[data-inp="${id}"]`); return e ? { found: true, text: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 120) } : { found: false } }, iid)
      log(c, `${p}: the input drawn by its id: ${JSON.stringify(seen)}`)
      await shot(w.page, c, `${c}-place-${p}-${size}`, full(w), seen, size)
    } catch (e) { log(c, `${p}: ${String(e.message).split('\n')[0]}`) }
  }
}
try {
  // Saber, desktop: an LL for Ranger and Hex
  let w = await newPage('desk', undefined, NEW_DIR); await signIn(w, 'ad'); w.user = 'ad'
  log('B8', 'bundle: ' + await bundleOf(w.page))
  const RANGER_ONLY = process.argv[3] === 'ranger'
  const s = RANGER_ONLY ? null : await fileInput(w, 'B8-saber', WED, { type: 'LL', span: 'all', people: [RANGER], remarks: 'Plain round' })
  if (s) await round('B8-saber', w, s, 'desk')
  // Ranger, phone: his own
  w = await handOver(w, 'phone', 'us'); w.user = 'us'
  await openBell(w); const ls = await B.readLines(w.page)
  log('B8-saber', "Ranger's bell after Saber's round: " + JSON.stringify(B.said(ls)))
  await B.bellPic(w, 'B8-saber', 'B8-saber-other-bell-phone', ls)
  await w.page.keyboard.press('Escape'); await sleep(300)
  DAY = L.THU   // v4: his own on Thu, clear of Saber's LL for him on Wed
  const r = await fileInput(w, 'B8-ranger', DAY, { type: 'LL', span: 'all', remarks: 'His own' })
  if (r) await round('B8-ranger', w, r, 'phone')
  w = await handOver(w, 'desk', 'ad')
  await L.go(w.page, 'viewsched'); await press(w, '#notifyBell'); await sleep(400)
  const sl = await B.readLines(w.page)
  log('B8-ranger', "Saber's bell after Ranger's round: " + JSON.stringify(B.said(sl)) + ' note ' + JSON.stringify(await shownToast(w.page)))
  await shot(w.page, 'B8-ranger', 'B8-ranger-other-bell-desk', (await L.bellClip(w.page)) || full(w), B.said(sl), 'desk')
  await w.ctx.close()
} catch (e) { facts.errors.push('B8: ' + String(e && e.stack || e).slice(0, 600)); log('B8', 'ERROR ' + String(e && e.message || e).split('\n')[0]) }
B.dump('b8.json', { out, log: facts.cases, errors: facts.errors })
console.log('\npictures:', facts.pictures.length, '· errors:', facts.errors.length)
for (const e of facts.errors.slice(0, 20)) console.log('  ' + e)
await L.finish()
