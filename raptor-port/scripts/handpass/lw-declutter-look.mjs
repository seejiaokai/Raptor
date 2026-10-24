// lw-declutter-look — round 3 of D1301 (his D1311, "improve the layout to reduce clutter"): the Leave War's bid windows
// TODAY (real) beside PROPOSED (one named transform on the real window), at his iPhone's size (402x874, 3x) and once on
// a desktop (1440x900). Takes in the pictures page's Q2 A + B (the day line out of its box; Remarks beside Document),
// D1307 (Document and Remarks on an approved leave, "Note" gone), D1308 (the Remarks box dark), Q6 (the day's leave lit)
// and D1302 (the toggle). Usage: PORT=4174 node scripts/handpass/lw-declutter-look.mjs
//
// THE TRANSFORM, all of it (each piece is named on the page for him):
//  1 the row labels go (DATE, DECIDE, SELECTED, DOCUMENT, REMARKS, DURATION, WHICH LEAVE, ALSO) — each row's buttons say
//    what they are; the screen-reader names stay (built as aria labels);
//  2 the day line leaves its box (Q2 A);
//  3 Decide and Selected become one row of actions: Approve · Refuse · Move · Delete; "Note" goes (D1307);
//  4 Document and Remarks become one row: the Remarks box, dark (D1308), the word "Remarks" inside it until typed in,
//    its "till" date, then the app's one Document button (Q2 B, lesson 22);
//  5 "Just this day" goes (it is the default); "Pick a range" moves to the end of the Duration row;
//  6 the leave buttons take the row's whole width — the same height, wider (a size change: his word, D487);
//  7 the day's own leave is lit — a ring on its button (Q6) — and "NOW LL" leaves the title;
//  8 "Approve what I enter" becomes the app's switch (D1302); +OIL, PO and PI go behind one "⋯" in the title bar.
// On the drag-selection window: the same, and Decide is not drawn over days that hold nothing to decide.
import * as L from './lw-declutter-lib.mjs'
import path from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
console.log('lw-declutter-look v4')
const OUT = path.resolve('docs/img/handpass/2026-10-24-lw-declutter')
mkdirSync(OUT, { recursive: true })
const winBox = (P, menu = false) => P.evaluate(menu => {
  const e = document.querySelector('.bidsheet'); if (!e) return null
  const r = e.getBoundingClientRect()
  let bottom = r.bottom
  const m = document.querySelector('.mock-menu'); if (menu && m) bottom = Math.max(bottom, m.getBoundingClientRect().bottom)
  return { x: Math.max(0, Math.floor(r.left) - 4), y: Math.max(0, Math.floor(r.top) - 4), width: Math.ceil(r.width) + 8, height: Math.ceil(bottom - r.top) + 8 }
}, menu)
const height = P => P.evaluate(() => Math.round(document.querySelector('.bidsheet').getBoundingClientRect().height))
const geo = {}
async function take(w, name, menu = false) {
  const P = w.page
  await P.waitForTimeout(250)
  await P.addStyleTag({ content: '.toast, [role="status"].snack, .lw-snack, .snackbar { display: none !important; }' }).catch(() => {})
  await P.evaluate(() => document.querySelectorAll('.toast, .snack, .snackbar, [class*="toast"]').forEach(e => { if (!e.closest('.bidsheet')) e.style.display = 'none' }))
  const b = await winBox(P, menu)
  if (!b) throw new Error(name + ': no window open')
  geo[name] = { h: await height(P), vp: P.viewportSize() }
  console.log(name, 'window h', geo[name].h)
  await P.screenshot({ path: path.join(OUT, name + '.png'), clip: b, scale: 'device' })
}

import { CSS, transform, reorder } from './lw-declutter-mock.mjs'
const wordsHTML = P => P.evaluate(() => {
  const a = document.querySelector('[data-testid="bid-doc-row"]'), b = document.querySelector('[data-testid="bid-rmk-row"]')
  return a && b ? a.outerHTML + b.outerHTML : null
})
/* the ⋯ opened: its three actions, by their long names (their own hover and screen-reader names today) */
const openMenu = P => P.evaluate(() => {
  const more = document.querySelector('.bidsheet-hd .mock-more'); if (!more) return false
  const r = more.getBoundingClientRect()
  const m = document.createElement('div'); m.className = 'mock-menu'
  m.innerHTML = ['Grant OIL', 'Post out', 'Post in'].map(t => `<button type="button" class="dchip po">${t}</button>`).join('')
  const sh = document.querySelector('.bidsheet'); const sr = sh.getBoundingClientRect()
  if (getComputedStyle(sh).position === 'static') sh.style.position = 'relative'
  m.style.position = 'absolute'
  sh.appendChild(m)
  const w = m.getBoundingClientRect().width
  m.style.left = Math.max(8, r.right - sr.left - w) + 'px'; m.style.top = (r.bottom - sr.top + 4) + 'px'
  return true
})
const assertMock = async (P, name) => {
  const ok = await P.evaluate(() => !!document.getElementById('mock-declutter') && !document.querySelector('.bidsheet .bidsheet-row > .lab:not([style*="none"])')?.offsetHeight)
  if (!ok) throw new Error(name + ': the transform is not on the page')
}
/* wider letters (his iPhone's are wider than the test browser's): does the row of four actions still fit one line? */
const titleRoom = P => P.evaluate(() => {
  const hd = document.querySelector('.bidsheet .bidsheet-hd'); const kids = [...hd.children].filter(e => e.getBoundingClientRect().height)
  const m = () => { const r = hd.getBoundingClientRect(); const right = Math.max(...kids.map(e => e.getBoundingClientRect().right)); const tops = new Set(kids.map(e => Math.round(e.getBoundingClientRect().top / 6))); return { overRight: Math.round(right - r.right), lines: tops.size, gap: Math.round(r.right - right) } }
  const a = m(); document.querySelector('.bidsheet').style.letterSpacing = '0.9px'; const b = m(); document.querySelector('.bidsheet').style.letterSpacing = ''
  return { normal: a, wider: b }
})
const widerCheck = P => P.evaluate(() => {
  const s = document.querySelector('.bidsheet'); s.style.letterSpacing = '0.9px'
  const rows = [...s.querySelectorAll('.bidsheet-row')].map(r => { const bs = [...r.querySelectorAll(':scope > button, :scope > span > button')]; const tops = new Set(bs.map(b => Math.round(b.getBoundingClientRect().top))); return { t: r.innerText.replace(/\s+/g, ' ').slice(0, 40), lines: tops.size } })
  const hd = s.querySelector('.bidsheet-hd'); const kids = [...hd.children].filter(e => e.getBoundingClientRect().height); const tops = new Set(kids.map(e => Math.round(e.getBoundingClientRect().top / 8)))
  s.style.letterSpacing = ''
  return { rows, titleLines: tops.size }
})

const D_EMPTY = '2026-11-02', D_PEND = '2026-11-03', D_APPR = '2026-11-04'
const notes = {}
for (const size of ['phone', 'desk']) {
  const w = await L.newCtx(size)
  const P = w.page
  const tag = size === 'phone' ? '' : '-desk'
  await L.signInPlain(w, 'admin')
  const ids = await P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))
  const who = ids.Drifter
  /* set up: a pending LL on 3 Nov, an approved LL on 4 Nov (the app's own controls) */
  await L.openCellR(w, who, D_PEND)
  await L.press(w, L.T('bid-approve-tick')); await P.waitForTimeout(200)
  await L.press(w, L.T('bid-LL')); await P.waitForTimeout(500); await L.closeAny(w)
  await L.openCellR(w, who, D_APPR)
  await L.press(w, L.T('bid-LL')); await P.waitForTimeout(500); await L.closeAny(w)

  /* A: a pending bid (the busiest one-day window) */
  await L.openCellR(w, who, D_PEND)
  await take(w, 'a-pending-today' + tag)
  const wh = await wordsHTML(P)
  await transform(P, { p: 'bid', admin: true, lit: 'LL' }); await assertMock(P, 'A')
  await reorder(P, 'bid'); await take(w, 'a-pending-proposed' + tag)
  if (size === 'phone') { notes.widerA = await widerCheck(P); notes.titleA = await titleRoom(P); await openMenu(P); await take(w, 'a-pending-menu', true);
    /* the title bar with an iPhone's wider letters (a seventh wider than the test browser's) — does it still fit one line? */
    await P.evaluate(() => { document.querySelector('.bidsheet').style.letterSpacing = '0.9px' })
    { const hd = await P.evaluate(() => { const r = document.querySelector('.bidsheet .bidsheet-hd').getBoundingClientRect(); return { x: r.left - 6, y: r.top - 6, width: r.width + 12, height: r.height + 12 } })
      await P.screenshot({ path: path.join(OUT, 'a-title-wider.png'), clip: hd, scale: 'device' }) }
    await P.evaluate(() => { document.querySelector('.bidsheet').style.letterSpacing = '' }); await P.evaluate(() => document.querySelectorAll('.mock-menu').forEach(e => e.remove())) }
  await L.closeAny(w)
  if (size === 'desk') { await w.ctx.close(); continue }
  /* B: an approved leave */
  await L.openCellR(w, who, D_APPR)
  await take(w, 'b-approved-today')
  await transform(P, { p: 'bid', admin: true, lit: 'LL', wordsHTML: wh }); await assertMock(P, 'B')
  await reorder(P, 'bid'); await take(w, 'b-approved-proposed')
  notes.widerB = await widerCheck(P)
  await L.closeAny(w)
  /* C: an empty day */
  await L.openCellR(w, who, D_EMPTY)
  await take(w, 'c-empty-today')
  await transform(P, { p: 'bid', admin: true }); await assertMock(P, 'C')
  await reorder(P, 'bid'); await take(w, 'c-empty-proposed')
  await L.closeAny(w)

  /* Q7 — HIS QUESTION (24 Oct 26): six counters, three of them count this man — does the day line name all three, or
     only the ones his leave turns amber or red? Measured on the real grid: the day's Manning figures read, a pending LL
     placed through the window, read again, then taken back with the app's own Undo; the rows whose figure moved are the
     ones that count him. A (today): the Available row, then only rows turned amber or red, else the calm sentence.
     B (the recommendation): the Available row, then every row his leave lowers, before → after, coloured only where it
     ends amber or red; rows that do not count him are not named. Both drawn in the decluttered window. */
  if (!(await P.evaluate(() => document.querySelector('[data-testid="counts-toggle"]')?.getAttribute('aria-expanded') === 'true'))) {
    await P.evaluate(() => window.scrollTo(0, 0)); await L.press(w, L.T('counts-toggle')); await P.waitForTimeout(500)
  }
  await L.reachCell(w, who, D_EMPTY)
  const readCounts = d => P.evaluate(d => Object.fromEntries([...document.querySelectorAll(`td[data-testid^="count-"][data-testid$="-${d}"]`)]
    .map(td => { const id = td.dataset.testid.slice(6, -(d.length + 1)); const row = td.closest('tr'); return [id, { have: td.textContent.trim(), cls: td.className, label: (row.querySelector('.lab, th, td')?.textContent || id).replace(/\s+/g, ' ').trim() }] })), d)
  const before = await readCounts(D_EMPTY)
  await L.openCellR(w, who, D_EMPTY)
  await L.press(w, L.T('bid-approve-tick')); await P.waitForTimeout(150)
  await L.press(w, L.T('bid-LL')); await P.waitForTimeout(500); await L.closeAny(w)
  const after = await readCounts(D_EMPTY)
  await L.undo(w)
  const back = await readCounts(D_EMPTY)
  const moved = Object.keys(before).filter(id => before[id].have !== after[id]?.have)
  notes.q7 = { before, after, moved, undoneClean: JSON.stringify(back) === JSON.stringify(before) }
  console.log('Q7 rows that count him', JSON.stringify(moved.map(id => `${before[id].label} ${before[id].have}→${after[id].have} ${after[id].cls}`)), 'undo clean', notes.q7.undoneClean)
  if (!notes.q7.undoneClean) throw new Error('Q7: Undo did not put the day back')
  await L.openCellR(w, who, D_EMPTY)
  await transform(P, { p: 'bid', admin: true }); await assertMock(P, 'Q7a')
  await reorder(P, 'bid'); await take(w, 'q7-a-today-rule')
  await P.evaluate(rows => {
    const line = document.querySelector('.bidsheet .bidsheet-dayline'); const av = line.querySelector('.dl-row:not(.dl-calm)')
    line.querySelector('.dl-calm')?.remove()
    for (const r of rows) {
      const e = av.cloneNode(true); e.className = 'dl-row mock-new' + (r.level ? ' dl-' + r.level : ''); e.removeAttribute('data-testid')
      e.querySelector('.dl-name').textContent = r.label; e.querySelector('.dl-fig').textContent = `${r.b} → ${r.a}` + (r.level ? ` · ${r.level}` : '')
      line.appendChild(e)
    }
  }, moved.map(id => ({ label: before[id].label.replace(/[ⓘ⋮⠿✕].*$/, '').trim(), b: before[id].have, a: after[id].have, level: /red/.test(after[id].cls) ? 'red' : /amber/.test(after[id].cls) ? 'amber' : '' })))
  await take(w, 'q7-b-every-row')
  await L.closeAny(w)
  /* D: the drag-selection window over three empty days */
  await P.evaluate(() => window.scrollTo(0, 60)); await P.waitForTimeout(300)
  const days = ['2026-11-09', '2026-11-10', '2026-11-11']
  await L.reachCell(w, who, days[0])
  await P.locator(L.T(L.cellId(who, days[0]))).evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await P.waitForTimeout(300)
  const pts = await P.evaluate(({ id, days }) => days.map(d => { const r = document.querySelector(`[data-testid="cell-${id}-${d}"]`).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }), { id: who, days })
  await L.holdDrag(w, pts, 420); await P.waitForTimeout(500)
  await take(w, 'd-select-today')
  await transform(P, { p: 'sel', admin: true, noDecide: true }); await assertMock(P, 'D')
  await P.evaluate(() => { const e = document.querySelector('[data-testid="sel-span"]'); if (e) e.textContent = '9–11 Nov · 3 days' })
  await reorder(P, 'sel'); await take(w, 'd-select-proposed')
  notes.widerD = await widerCheck(P); notes.titleD = await titleRoom(P)
  await L.closeAny(w)
  console.log('errors', JSON.stringify(w.errs))
  await w.ctx.close()
}
/* E: a member on an open day of his own (Ranger, his "today" 15 Feb 26) */
const m = await L.newCtx('phone')
await L.signInPlain(m, 'member', '2026-02-15')
await L.openCellR(m, 'bane', '2026-02-20')
await take(m, 'e-member-today')
await transform(m.page, { p: 'bid', admin: false }); await assertMock(m.page, 'E')
await reorder(m.page, 'bid'); await take(m, 'e-member-proposed')
console.log('errors', JSON.stringify(m.errs))
console.log('wider letters', JSON.stringify(notes))
writeFileSync(path.join(OUT, 'look-geometry.json'), JSON.stringify({ geo, notes }, null, 1))
await L.closeBrowser()
