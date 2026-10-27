// walker C helpers on top of lw-m4-lib.mjs (not edited): bids, decisions, the bell's reading and tap
import path from 'node:path'
export async function setup(letter = 'c', sub = '') {
  process.env.LW_OUT ||= `../../docs/img/handpass/2026-10-27-lw-m4/${letter}${sub ? '/' + sub : ''}`
  return await import('./lw-m4-lib.mjs')
}
export function mk(L) {
  const { T, press, shot, vis, txt } = L
  const H = {}
  /* press a locator's own box (nth lines) */
  H.pressLoc = async (w, loc, quick = null) => {
    await loc.scrollIntoViewIfNeeded()
    const b = await loc.boundingBox()
    if (!b) throw new Error('no box for locator')
    await L.finger(w, b.x + b.width / 2, b.y + b.height / 2, quick)
  }
  /* member (signed in) places an LL (or another type) on one day; returns whether it landed */
  H.bid = async (w, iso, type = 'LL') => {
    await L.openCell(w, 'bane', iso)
    const ok = await L.placeLeave(w, type)
    await w.page.waitForTimeout(300)
    return ok
  }
  /* a picked range by dragging in the grid (mouse on desktop): opens the drag window */
  H.drag = async (w, a, b) => {
    await L.reachCell(w, 'bane', a); await L.reachCell(w, 'bane', b)
    const A = await w.page.locator(T(`cell-bane-${a}`)).first().boundingBox()
    const B = await w.page.locator(T(`cell-bane-${b}`)).first().boundingBox()
    await w.page.mouse.move(A.x + A.width / 2, A.y + A.height / 2)
    await w.page.mouse.down()
    await w.page.mouse.move(B.x + B.width / 2, B.y + B.height / 2, { steps: 8 })
    await w.page.mouse.up()
    await w.page.waitForTimeout(600)
    return vis(w.page, T('select-sheet'))
  }
  /* an Approvals line of Ranger by its date text */
  H.line = (w, text) => w.page.locator(`${T('appr-line-bane')}`).filter({ hasText: text }).first()
  H.lineBtn = (w, text, which) => H.line(w, text).locator(T(which)).first()
  /* the bell: lines now (ids + text + unread) */
  H.bell = async w => { await L.openBell(w); return L.bellLines(w.page) }
  H.bellDiff = (before, after) => after.filter(a => !before.some(b => b.id === a.id))
  /* the ring on the grid */
  H.ring = w => w.page.evaluate(() => { const e = document.querySelector('.lw-ring'); if (!e) return null; const t = e.closest('[data-testid]'); return { tag: e.tagName, id: (e.dataset && e.dataset.testid) || (t && t.dataset.testid) || '', cls: e.className } })
  H.activeTab = w => w.page.evaluate(() => [...document.querySelectorAll('[data-testid^="lw-tab-"]')].map(e => e.dataset.testid + (/active|on|sel/.test(e.className) || e.getAttribute('aria-selected') === 'true' ? '*' : '')).join(' '))
  H.cellText = async (w, who, iso) => (await txt(w.page, T(`cell-${who}-${iso}`)))
  return H
}
