// Walker A helpers on top of the host's lw-m4-lib (never edited). Set LW_OUT BEFORE importing this.
const L = await import('./lw-m4-lib.mjs')
const { T, press, shot, vis, txt } = L
export { L }
export const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
/* place ONE leave on one cell, from whoever is signed in: portion 'full' | 'am' | 'pm' */
export async function placeBid(w, who, iso, type = 'LL', portion = 'full', opts = {}) {
  const P = w.page
  await L.openCell(w, who, iso)
  if (!(await vis(P, T('bid-picker')))) { console.log(`   !! no bid window for ${who} ${iso}`); return false }
  if (opts.adminOff) await L.approveWhatIEnter(w, false)
  if (portion !== 'full') { await press(w, T('portion-' + portion)); await P.waitForTimeout(250) }
  if (opts.remarks) { await P.fill(T('bid-remarks'), opts.remarks); await P.waitForTimeout(200) }
  if (opts.pdf) { await P.locator(`${T('bid-doc-row')} input[type=file]`).first().setInputFiles(opts.pdf); await P.waitForTimeout(600) }
  const ok = await L.placeLeave(w, type)
  if (!ok) { console.log(`   !! the window stayed open after ${type} on ${iso}`); await L.closeWin(w) }
  return ok
}
/* the member's batch: returns the list of what landed */
export async function bidBatch(w, who, list) {
  const out = []
  for (const b of list) { const ok = await placeBid(w, who, b.iso, b.type || 'LL', b.portion || 'full', b); out.push([b.iso, b.type || 'LL', b.portion || 'full', ok]) }
  console.log('   placed:', out.map(o => `${o[0]} ${o[1]} ${o[2]} ${o[3] ? 'ok' : 'NO'}`).join(' | '))
  return out
}
/* what scrolls on the Approvals page: window scroll and any scrollable ancestor of the page */
export const scrollState = page => page.evaluate(() => {
  const el = document.querySelector('[data-testid="approvals-page"]')
  const res = { win: Math.round(window.scrollY), winMax: Math.round(document.scrollingElement.scrollHeight - innerHeight), anc: [] }
  for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
    const cs = getComputedStyle(e)
    if (/(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 1) res.anc.push({ id: e.id || e.dataset.testid || e.className.toString().slice(0, 30), top: Math.round(e.scrollTop), max: e.scrollHeight - e.clientHeight })
  }
  return res
})
export const scrollTo = (page, y) => page.evaluate(yy => {
  const el = document.querySelector('[data-testid="approvals-page"]')
  for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
    const cs = getComputedStyle(e)
    if (/(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 1) { e.scrollTop = yy; return 'anc' }
  }
  window.scrollTo(0, yy); return 'win'
}, y)
/* the line's own buttons, read by test id */
export const lineSel = (who, id) => `[data-testid="appr-line-${who}"] [data-testid="${id}"]`
/* lines keyed by a unique id: the page's lines carry the person only, so key by who + dates text */
export const linesNow = L.apprLines
export const headerText = page => txt(page, T('appr-sub'))
export const approveAllText = page => txt(page, T('appr-approve-all'))
/* a plain sleep */
export const sleep = (page, ms) => page.waitForTimeout(ms)

/* ---- more helpers (v2) ---- */
import path from 'node:path'
/* a line, found by the text of its dates link (a line's own testid is only the person) */
export const lineLoc = (page, dates) => page.locator('.appr-line', { has: page.locator('.appr-dlink', { hasText: dates }) }).first()
export async function pressLoc(w, loc, quickName = null) {
  await loc.scrollIntoViewIfNeeded()
  const b = await loc.boundingBox()
  if (!b) throw new Error('no box')
  const x = b.x + b.width / 2, y = b.y + b.height / 2
  const ok = await loc.evaluate((e, p) => { const h = document.elementFromPoint(p.x, p.y); return !!h && (e === h || e.contains(h)) }, { x, y })
  if (!ok) console.log('   !! the point is covered by something else')
  await L.finger(w, x, y, quickName)
  return { x, y, ok }
}
export const approveBtn = (page, dates) => lineLoc(page, dates).locator('[data-testid="appr-approve"]')
export const refuseBtn = (page, dates) => lineLoc(page, dates).locator('[data-testid="appr-refuse"]')
export const datesBtn = (page, dates) => lineLoc(page, dates).locator('[data-testid="appr-dates"]')
export const lineInfo = (page, dates) => lineLoc(page, dates).evaluate(e => ({
  text: e.innerText.replace(/\s+/g, ' ').trim(), cls: e.className, stale: e.classList.contains('stale'),
  ok: { t: e.querySelector('.appr-ok')?.innerText, p: e.querySelector('.appr-ok')?.getAttribute('aria-pressed'), dis: e.querySelector('.appr-ok')?.disabled },
  no: { t: e.querySelector('.appr-no')?.innerText, p: e.querySelector('.appr-no')?.getAttribute('aria-pressed'), dis: e.querySelector('.appr-no')?.disabled },
  note: e.querySelector('.appr-note, .appr-why, [data-testid="appr-why"]')?.innerText || ''
}))
/* a picture of one line, with a little around it */
export async function shotLine(w, name, dates, pad = 6) {
  const loc = lineLoc(w.page, dates)
  await loc.scrollIntoViewIfNeeded()
  const b = await loc.boundingBox()
  await L.shot(w, name, { clip: { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: Math.min(b.width + 2 * pad, 1536), height: b.height + 2 * pad } })
}
/* a click at a point WITHOUT scrolling anything (a person's finger on a bar that stays in sight) */
export async function clickAtId(w, sel) {
  const b = await w.page.locator(sel).first().boundingBox()
  if (!b) throw new Error('no box ' + sel)
  await w.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
}
export const topbarUndo = async w => { await clickAtId(w, '#undoBtn'); await w.page.waitForTimeout(600) }
export const topbarRedo = async w => { await clickAtId(w, '#redoBtn'); await w.page.waitForTimeout(600) }
/* time one tap to its lit button, inside the page */
export const timeTap = (page, dates) => lineLoc(page, dates).evaluate(async (line) => {
  const btn = line.querySelector('.appr-ok')
  const b = btn.getBoundingClientRect()
  return await new Promise(res => {
    let t0 = 0
    const obs = new MutationObserver(() => { if (btn.getAttribute('aria-pressed') === 'true' || line.className.includes('lit-')) { obs.disconnect(); res(performance.now() - t0) } })
    obs.observe(line, { attributes: true, subtree: true, childList: true })
    window.__tapStart = () => { t0 = performance.now() }
    document.addEventListener('pointerdown', window.__tapStart, { once: true, capture: true })
    setTimeout(() => { obs.disconnect(); res(-1) }, 4000)
  })
})
export const nodesGrid = page => page.evaluate(() => document.querySelectorAll('#page-leavewar *').length)
