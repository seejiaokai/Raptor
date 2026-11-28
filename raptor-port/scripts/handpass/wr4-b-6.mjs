// Walker b, B6 (RECORD only) — the Leave War's copy of a leave. Saber files an LL for Ranger on the Inputs page (a leave
// the Leave War shows); (a) retyped to OL in its window — Ranger's lines, and the Leave War cell beside the input;
// (b) the same kind of change made on the Leave War itself (Saber taps Ranger's cell, presses another leave);
// (c) its remark changed in its window. Ranger's bell read after each.
// Run from raptor-port:  node scripts/handpass/wr4-b-6.mjs <run-folder-name>
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('wr4-b-6 v1')
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.argv[2] || 'b6-run1'
const DAY = process.argv[3] || '2026-12-14'
process.env.WR4_OUT ||= join(HERE, '../../docs/img/handpass/2026-11-24-words-r4-walk/b', RUN)
process.env.WR4_NEW ||= 'D:/rw4/build-new'
const L = await import('./wr4-lib.mjs')
const B = await import('./wr4-b-common.mjs')
const { newPage, signIn, fileInput, editInput, openBell, log, facts, recOf, bundleOf, sleep, shot, go, RANGER, NEW_DIR } = L
const c = 'B6'
const q = t => `[data-testid="${t}"]`
const out = {}
const full = w => ({ x: 0, y: 0, width: w.page.viewportSize().width, height: w.page.viewportSize().height })
async function toWar(w) {
  await go(w.page, 'leavewar'); await w.page.waitForSelector(q('month-strip'), { timeout: 10000 })
  await w.page.selectOption(q('war-picker'), 'y' + DAY.slice(0, 4)).catch(() => {}); await sleep(900)
  await w.page.locator(q('month-' + ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][+DAY.slice(5, 7) - 1])).click(); await sleep(900)
}
const cellOf = w => w.page.evaluate(([p, d]) => { const e = document.querySelector(`[data-testid="cell-${p}-${d}"]`); return e ? (e.innerText || '').trim() + ' | ' + e.className : null }, [RANGER, DAY])
/* Ranger's bell from a copy of the stored world (opening the list writes nothing); Saber's session stays */
async function rangerReads(w, tag) {
  await sleep(1200)
  const st = await w.ctx.storageState({ indexedDB: true })
  const r = await newPage('phone', st, NEW_DIR); await signIn(r, 'us')
  await openBell(r)
  const ls = await B.readLines(r.page)
  await B.bellPic(r, c, `B6-${tag}-bell-phone`, ls)
  await r.ctx.close()
  log(c, `${tag}: Ranger's bell ${JSON.stringify(B.said(ls))}`)
  return B.said(ls)
}
try {
  const w = await newPage('desk', undefined, NEW_DIR); await signIn(w, 'ad')
  log(c, 'bundle: ' + await bundleOf(w.page))
  const iid = await fileInput(w, c, DAY, { type: 'LL', span: 'all', people: [RANGER], remarks: 'Family' })
  if (!iid) throw new Error('fixture: no LL')
  await toWar(w)
  out.cell0 = await cellOf(w); log(c, 'Leave War cell after filing: ' + out.cell0)
  out.read0 = await rangerReads(w, '0-filed')
  // (a)
  await editInput(w, c, iid, DAY, () => w.page.selectOption('#inpEditPop #inpEditType', 'OL'))
  out.recA = await recOf(w.page, iid)
  await toWar(w)
  out.cellA = await cellOf(w)
  log(c, `(a) input now ${JSON.stringify(out.recA)}; Leave War cell ${out.cellA}`)
  await w.page.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center', inline: 'center' }), `[data-testid="cell-${RANGER}-${DAY}"]`)
  await shot(w.page, c, 'B6-a-war-cell-desk', full(w), out.cellA, 'desk')
  out.readA = await rangerReads(w, 'a-retyped')
  // (b) on the Leave War itself: tap his cell, press another leave
  await w.page.locator(`[data-testid="cell-${RANGER}-${DAY}"]`).click(); await sleep(700)
  out.bWin = await w.page.evaluate(() => (document.querySelector('[data-testid="bid-picker"]')?.innerText || '').replace(/\s+/g, ' ').slice(0, 300))
  await shot(w.page, c, 'B6-b-war-window-desk', full(w), out.bWin, 'desk')
  const cand = w.page.locator(`${q('bid-leave-grid')} [data-testid$="-CCL"]`).first()
  out.bBtn = await cand.count()
  if (out.bBtn) {
    await cand.click(); await sleep(800)
    const conf = w.page.locator(`${q('bid-picker')} button`, { hasText: /^(Save|Change|Yes|Approve|Done)/ }).first()
    if (await conf.count() && await conf.isVisible().catch(() => false)) { out.bConfirm = (await conf.textContent()).trim(); await conf.click(); await sleep(700) }
    out.bNote = await L.shownToast(w.page)
    await w.page.keyboard.press('Escape'); await sleep(400)
    out.cellB = await cellOf(w); out.recB = await recOf(w.page, iid)
    log(c, `(b) pressed CCL on the Leave War (confirm ${JSON.stringify(out.bConfirm)}), note ${JSON.stringify(out.bNote)}; cell ${out.cellB}; input ${JSON.stringify(out.recB)}`)
    await shot(w.page, c, 'B6-b-war-after-desk', full(w), out.cellB, 'desk')
    out.readB = await rangerReads(w, 'b-on-war')
  } else log(c, '(b) no CCL button in the Leave War window: ' + out.bWin)
  // (c) remark
  const now = await recOf(w.page, iid)
  if (now) {
    await editInput(w, c, iid, DAY, () => w.page.fill('#inpEditPop #inpEditRmk', 'Family wedding'))
    out.recC = await recOf(w.page, iid)
    log(c, '(c) remark changed: ' + JSON.stringify(out.recC))
    out.readC = await rangerReads(w, 'c-remark')
  } else log(c, '(c) the input is gone after (b): ' + iid)
  await w.ctx.close()
} catch (e) { facts.errors.push(`${c}: ` + String(e && e.stack || e).slice(0, 600)); log(c, 'ERROR ' + String(e && e.message || e).split('\n')[0]) }
B.dump('b6-' + RUN + '.json', { out, log: facts.cases, errors: facts.errors })
console.log('\npictures:', facts.pictures.length, '· errors:', facts.errors.length)
for (const e of facts.errors.slice(0, 20)) console.log('  ' + e)
await L.finish()
