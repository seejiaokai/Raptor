/* THE MOCK-UP for [AMEND-EMPTY-SEAT-MARK] and [AMEND-MARK-RING-CLASH] (24 Sep 26) — pictures of the REAL app
   (the production build, the everything-week, the app's own stylesheet), first as it is today, then with the
   proposal laid on top of the live page: the few lines of CSS and markup the build would add. Nothing here is
   saved to the app; a reload undoes it.
   - The ghost: where a man was taken off a desk, a Common Programme row or a sim seat, a faded puck with his name
     struck through, carrying the amendment mark like any other change — dotted in the next AL's colour while it
     waits, solid with its "AL1" tag once issued.
   - The mark moves off the puck onto the seat around it, so a warning ring on the puck (dashed: sanctioned late;
     dotted: tomorrow's crew rest) is never painted over.
   Usage: node mk-seat-marks.mjs [desktop|phone]  (the build served on :4173) */
import { mkdirSync } from 'node:fs'
const W = process.argv[2] || 'desktop'
const SIZE = W === 'phone' ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/mock/img/amend-seat-marks'
process.env.HP_SHOTS = OUT
mkdirSync(OUT, { recursive: true })
const L = await import('./w2-lib.mjs')
const { openHi, editWeek, board, closeBoard, go, signDay, publishAL, STATE } = L
const { browser, page, errors } = await openHi({ ...SIZE, state: STATE, dpr: 2 })
const DI = 5

/* THE PROPOSAL, as the build would write it */
const PROPOSAL_CSS = `
#eWeek .seat[data-aln],#schedBoard .seat[data-aln]{outline:1.5px dotted var(--alc);outline-offset:1px;border-radius:4px}
.seat.mk-gone .puck{opacity:.45;filter:grayscale(1)}
.seat.mk-gone .puck .nm{text-decoration:line-through;text-decoration-thickness:1.5px}
.seat.mk-hole{display:inline-block;width:74px;height:15px;vertical-align:middle;border-radius:4px}
/* a ghost is not a man: the desk still reads EMPTY, so its "+ add" keeps its outline beside the ghost */
.page.editing .ppl[data-fill]:not(:has(.seat:not(.mk-gone) .puck)):not(:has(.itxt)) .addz{border-color:var(--edge-2);color:var(--ink-3);opacity:.9}
.schedboard .ppl[data-fill]:not(:has(.seat:not(.mk-gone) .puck)):not(:has(.itxt)) .addz{border-color:var(--edge-2)}
`
async function propose() {
  await page.evaluate((css) => {
    /* take the edit surfaces' amendment mark OFF the puck — the one rule a ring cannot win against … */
    for (const sh of document.styleSheets) {
      let rules; try { rules = sh.cssRules } catch { continue }
      for (let i = rules.length - 1; i >= 0; i--) {
        const r = rules[i]
        if (r.selectorText && /#eWeek \.seat\[data-aln\] \.puck/.test(r.selectorText)) sh.deleteRule(i)
      }
    }
    /* … and put it on the seat, with the ghost's look */
    if (!document.getElementById('mk-proposal')) {
      const st = document.createElement('style'); st.id = 'mk-proposal'; st.textContent = css; document.head.appendChild(st)
    }
  }, PROPOSAL_CSS)
}

const GONE = [
  { row: 'OPS DESK', fill: 'd:5.0.2.+', who: 'Outlaw', role: '<span class="role q-c">C</span>' },
  { row: 'MASS BRIEF', fill: 'a:5.1.+', who: 'Torch', role: '<span class="role q-c">C</span>' },
  { row: 'EP-6', fill: 's:5.oft.0.+', who: 'Basher', role: '<span class="role q-ins">IW</span>', sim: true },
]
/* where each man sat: the row's people box, found by its fill address, or — on the view page, where a frozen face
   carries no addresses — by the row's own name */
async function ghosts(scope, attrs, { hole = false, only = null } = {}) {
  return page.evaluate(([scope, attrs, GONE, hole, only]) => {
    const root = document.querySelector(scope)
    const done = []
    for (const g of GONE) {
      if (only && g.row !== only) continue
      let ppl = root && root.querySelector(`[data-fill="${g.fill}"]`)
      if (!ppl && root) {
        const nm = [...root.querySelectorAll('.pl-row,.ah-row,.sb-arow')].find(r => (r.querySelector('.ntx,textarea') || {}).textContent?.trim() === g.row || (r.querySelector('textarea') || {}).value === g.row)
        ppl = nm && nm.querySelector('.ppl')
      }
      if (!ppl) { done.push(g.row + ': no row'); continue }
      const seat = document.createElement('span')
      seat.className = 'seat ' + (hole ? 'mk-hole' : 'mk-gone')
      for (const [k, v] of Object.entries(attrs)) seat.setAttribute(k, v)
      seat.innerHTML = hole ? '' : `<span class="puck sm"><span class="nm">${g.who}</span>${g.role}</span>`
      const empty = g.sim ? ppl.querySelector('.sb-slot.empty[data-slot="s:5.oft.0.w"]') : null
      if (empty) empty.replaceWith(seat)
      else { const add = ppl.querySelector('.addz'); add ? ppl.insertBefore(seat, add) : ppl.appendChild(seat) }
      done.push(g.row + ': ok')
    }
    return done
  }, [scope, attrs, GONE, hole, only])
}
/* stage the clash: two real seats on the published Saturday, as if each had an unpublished change, one wearing
   the sanctioned-late ring and one the crew-rest trace */
async function rings(scope) {
  return page.evaluate((scope) => {
    const root = document.querySelector(scope)
    const out = []
    for (const [k, cls] of [['a:5.1.0', 'boxdash'], ['s:5.oft.0.p', 'boxdot']]) {
      const s = root && root.querySelector(`.seat[data-slot="${k}"]`)
      if (!s) { out.push(k + ': none'); continue }
      s.setAttribute('data-alp', '1'); s.setAttribute('data-aln', '1')
      s.querySelector('.puck').classList.add(cls)
      out.push(k + ': ' + cls)
    }
    return out
  }, scope)
}
/* a picture of the rows, with the lines around them for context */
async function shotRows(name, scope, rows = GONE.map(g => g.row)) {
  const box = await page.evaluate(([scope, rows]) => {
    const root = document.querySelector(scope); if (!root) return null
    const els = [...root.querySelectorAll('.pl-row,.ah-row,.sb-arow')].filter(r => {
      const t = (r.querySelector('.ntx') || {}).textContent?.trim() || (r.querySelector('textarea') || {}).value
      return rows.includes(t)
    })
    if (!els.length) return null
    els[0].scrollIntoView({ block: 'center' })
    const rs = els.map(e => e.getBoundingClientRect())
    const top = Math.min(...rs.map(r => r.top)), bot = Math.max(...rs.map(r => r.bottom))
    const left = Math.min(...rs.map(r => r.left)), right = Math.max(...rs.map(r => r.right))
    return { top, bot, left, right, n: els.length }
  }, [scope, rows])
  if (!box) { console.log('NO ROWS', name); return }
  const pad = 18
  const x = Math.max(0, box.left - pad), y = Math.max(0, box.top - pad)
  const w = Math.min(SIZE.width - x, box.right - box.left + 2 * pad), h = Math.min(SIZE.height - y, box.bot - box.top + 2 * pad)
  await page.screenshot({ path: `${OUT}/${W}-${name}.png`, clip: { x, y, width: w, height: h } })
  console.log('shot', name, JSON.stringify(box))
}
/* each row on its own — the three sit in different sections, so a single frame would be mostly gaps */
async function shotEach(prefix, scope) { for (const g of GONE) await shotRows(`${prefix}-${g.row.replace(/\W+/g, '').toLowerCase()}`, scope, [g.row]) }

// ---- today: take the three men off, on the board, the way a scheduler does ---------------------------
await editWeek(page)
await board(page, DI)
for (const k of ['d:5.0.2', 'a:5.1.1', 's:5.oft.0.w']) {
  const s = page.locator(`#schedBoard .seat[data-slot="${k}"]:visible`).first()
  await s.evaluate(e => e.scrollIntoView({ block: 'center' })); await s.click({ button: 'right' }); await page.waitForTimeout(500)
}
await shotEach('1-today-board', '#schedBoard')
await closeBoard(page); await editWeek(page)
await shotEach('1-today-week', '#eWeek .day[data-day="5"]')
console.log('rings today', await rings('#eWeek .day[data-day="5"]'))
await shotRows('2-today-week-ring-dashed', '#eWeek .day[data-day="5"]', ['MASS BRIEF'])
await shotRows('2-today-week-ring-dotted', '#eWeek .day[data-day="5"]', ['EP-6'])

// ---- the proposal, pending (dotted in AL1's colour) ------------------------------------------------------
await propose()
console.log('rings proposed', await rings('#eWeek .day[data-day="5"]'))
console.log('ghosts week', await ghosts('#eWeek .day[data-day="5"]', { 'data-alp': '1', 'data-aln': '1' }))
await shotEach('1-proposed-week-pending', '#eWeek .day[data-day="5"]')
await shotRows('2-proposed-week-ring-dashed', '#eWeek .day[data-day="5"]', ['MASS BRIEF'])
await shotRows('2-proposed-week-ring-dotted', '#eWeek .day[data-day="5"]', ['EP-6'])
await board(page, DI)
await propose()
console.log('ghosts board', await ghosts('#schedBoard', { 'data-alp': '1', 'data-aln': '1' }))
await shotEach('1-proposed-board-pending', '#schedBoard')
await closeBoard(page); await editWeek(page)
await propose()
/* option B on its own: clear option A's ghost first — the week keeps an unchanged block on screen, injected marks and all */
await page.evaluate(() => document.querySelectorAll('.seat.mk-gone,.seat.mk-hole').forEach(e => e.remove()))
console.log('hole week', await ghosts('#eWeek .day[data-day="5"]', { 'data-alp': '1', 'data-aln': '1' }, { hole: true, only: 'OPS DESK' }))
await shotRows('1-optionB-week-pending-opsdesk', '#eWeek .day[data-day="5"]', ['OPS DESK'])

// ---- issued: sign, publish AL1, and look at what the squadron sees -------------------------------------
await editWeek(page)
await signDay(page, DI)
console.log('publish', JSON.stringify(await publishAL(page, DI)))
await go(page, 'viewsched')
await page.waitForTimeout(600)
await shotEach('1-today-view-issued', '#vWeek .day[data-day="5"]')
console.log('ghosts view', await ghosts('#vWeek .day[data-day="5"]', { 'data-alc': '1' }))
await shotEach('1-proposed-view-issued', '#vWeek .day[data-day="5"]')
console.log('errors', JSON.stringify(errors))
await browser.close()
