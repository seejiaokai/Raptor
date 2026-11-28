// Walker b, B5 — a replaced Leave War bid. Saber opens a month for bidding; Ranger bids LL on a day of it; Saber moves a
// Training of Ranger's onto that day, renames it and changes its remark in one save, answering the swap question.
// Run from raptor-port:  node scripts/handpass/wr4-b-5.mjs <run-folder-name> [month e.g. DEC] [bid day iso] [training day iso]
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('wr4-b-5 v2')
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.argv[2] || 'b5-run1'
const MON = (process.argv[3] || 'DEC').toUpperCase()
const BID = process.argv[4] || '2026-12-11'
const TRD = process.argv[5] || '2026-12-09'
process.env.WR4_OUT ||= join(HERE, '../../docs/img/handpass/2026-11-24-words-r4-walk/b', RUN)
process.env.WR4_NEW ||= 'D:/rw4/build-new'
const L = await import('./wr4-lib.mjs')
const B = await import('./wr4-b-common.mjs')
const { newPage, signIn, handOver, fileInput, editInput, openBell, log, facts, press, recOf, bundleOf, sleep, shot, go, RANGER, NEW_DIR } = L
const c = 'B5'
const q = t => `[data-testid="${t}"]`
const out = {}
const full = w => ({ x: 0, y: 0, width: w.page.viewportSize().width, height: w.page.viewportSize().height })
async function toWar(w) {
  await go(w.page, 'leavewar'); await w.page.waitForSelector(q('month-strip'), { timeout: 10000 })
  await w.page.selectOption(q('war-picker'), 'y' + BID.slice(0, 4)).catch(e => log(c, 'war-picker: ' + String(e.message).split('\n')[0])); await sleep(900)
  await w.page.locator(q('month-' + MON)).click(); await sleep(900)
}
const cellOf = (w, pid) => w.page.evaluate(([p, d]) => { const e = document.querySelector(`[data-testid="cell-${p}-${d}"]`); return e ? (e.innerText || '').trim() + ' | ' + e.className : null }, [pid, BID])
try {
  let w = await newPage('desk', undefined, NEW_DIR); await signIn(w, 'ad')
  log(c, 'bundle: ' + await bundleOf(w.page))
  await toWar(w)
  await w.page.locator(q('open-chip')).click(); await sleep(500)
  const om = w.page.locator('[data-testid^="od-month-"]', { hasText: new RegExp(MON.slice(0, 3), 'i') }).first()
  out.openMonthBtn = await om.count()
  if (out.openMonthBtn) { await om.click(); await sleep(400) }
  await shot(w.page, c, 'B5-1-open-for-bidding-desk', full(w), 'Saber opens ' + MON, 'desk')
  await w.page.locator(q('open-dates-close')).click().catch(() => {}); await sleep(400)
  w = await handOver(w, 'desk', 'us')
  await toWar(w)
  const cell = w.page.locator(`[data-testid="cell-${RANGER}-${BID}"]`)
  out.cellThere = await cell.count()
  log(c, 'Ranger\'s cell on the bid day: ' + out.cellThere + ' ' + await cellOf(w, RANGER))
  await w.page.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center', inline: 'center' }), `[data-testid="cell-${RANGER}-${BID}"]`); await sleep(300)
  await cell.click(); await sleep(700)
  out.picker = await w.page.locator(q('bid-picker')).count()
  out.pickerText = await w.page.evaluate(() => (document.querySelector('[data-testid="bid-picker"]')?.innerText || document.body.innerText).replace(/\s+/g, ' ').slice(0, 240))
  await shot(w.page, c, 'B5-2-ranger-cell-tapped-desk', full(w), out.pickerText, 'desk')
  const ll = w.page.locator(`${q('bid-leave-grid')} [data-testid$="-LL"]`).first()
  out.llBtn = await ll.count()
  if (!out.llBtn) throw new Error('no LL button in the bid window: ' + out.pickerText)
  await ll.click(); await sleep(700)
  const save = w.page.locator(`${q('bid-picker')} button`, { hasText: /^(Save|Bid|Done|File)/ }).first()
  if (await save.count() && await save.isVisible().catch(() => false)) { await save.click(); await sleep(600) }
  await w.page.keyboard.press('Escape'); await sleep(400)
  out.cellAfterBid = await cellOf(w, RANGER)
  log(c, 'after the LL bid: cell ' + out.cellAfterBid)
  await shot(w.page, c, 'B5-3-after-bid-desk', full(w), out.cellAfterBid, 'desk')
  // Saber: a Training for Ranger on TRD, moved onto the bid day, renamed and remark changed in one save
  w = await handOver(w, 'desk', 'ad')
  // v2: only a leave (or sick) input replaces a bid (the build's Leave War gate), so the input moved is an OL; its three
  // changes: the day, the kind (OL -> PL) and the remark
  const LEAVE = process.env.B5_LEAVE !== '0'
  const tr = LEAVE ? await fileInput(w, c, TRD, { type: 'OL', span: 'all', people: [RANGER], remarks: 'Bring your kit' })
    : await fileInput(w, c, TRD, { type: 'Training', people: [RANGER], from: '09:00', to: '10:00', title: 'Training', remarks: 'Bring your kit' })
  if (!tr) throw new Error('fixture: no input to move')
  const res = await editInput(w, c, tr, TRD, async () => {
    await press(w, `#inpEdCal [data-iso="${BID}"]`)
    if (LEAVE) await w.page.selectOption('#inpEditPop #inpEditType', 'PL')
    else await w.page.fill('#inpEditPop #inpEditOwnTitle', 'Range brief')
    await w.page.fill('#inpEditPop #inpEditRmk', 'Bring water')
  })
  out.edit = res; out.rec = await recOf(w.page, tr)
  log(c, 'the save asked ' + JSON.stringify(res.asked) + '; record ' + JSON.stringify(out.rec))
  w = await handOver(w, 'phone', 'us')
  await openBell(w)
  const ls = await B.readLines(w.page)
  out.bell = B.said(ls)
  log(c, 'Ranger\'s bell: ' + JSON.stringify(out.bell))
  await B.bellPic(w, c, 'B5-4-bell-phone', ls)
  const hit = ls.find(l => /replaces your/.test(l.what))
  log(c, hit ? `RECORD the line: ${JSON.stringify(hit.what)}; ${/^Now .*, and 1 more change · replaces your LL bid · Saber$/.test(hit.what) ? 'PASS' : 'FAIL'} against "…, and 1 more change · replaces your LL bid · Saber"` : 'no "replaces your … bid" line in the bell')
  await w.ctx.close()
} catch (e) { facts.errors.push(`${c}: ` + String(e && e.stack || e).slice(0, 600)); log(c, 'ERROR ' + String(e && e.message || e).split('\n')[0]) }
B.dump('b5-' + RUN + '.json', { out, log: facts.cases, errors: facts.errors })
console.log('\npictures:', facts.pictures.length, '· errors:', facts.errors.length)
for (const e of facts.errors.slice(0, 20)) console.log('  ' + e)
await L.finish()
