// The drawing check's part list for the Leave War grid's hover ring (his D2157, 17 Nov 26 — answering D2151, D2152): on a
// desktop the one day under the mouse wears a thin cyan ring, inset 1px rgba(59,198,232,.6), hollow, no fill — the tapped
// day's strength — and today's faint tint along the row under the mouse stays. A phone has no hover, so there is no phone
// state: D2157 leaves a phone unchanged and the drawing has no phone picture.
// Drawn by docs/mock/2026-11-17-lw-grid-hover/ring.mjs (pictures img/r-ring-*), its one rule injected over a vite
// preview of chat 96/97's branch; the app code there is main's at 3a51c06a3 (no app file changed from 3a51c06a3 to
// 62b11ecd7), so the drawing is replayed on a build of 3a51c06a3. The script loads Playwright from another checkout:
// record from a copy whose one require line names this checkout's raptor-port/package.json, kept under a path ending in
// docs/mock/2026-11-17-lw-grid-hover/ring.mjs.
// Record (from raptor-port/; the script writes its pictures to its first argument — a scratch folder):
//   DRAWCHECK_SPEC=scripts/drawcheck/specs/lw-hover-ring.mjs DRAWCHECK_DIST=<a build of 3a51c06a3> \
//     DRAWCHECK_APPROVED=docs/mock/2026-11-17-lw-grid-hover/img DRAWCHECK_DRAWN_ON='main at 3a51c06a3' \
//     node --import ./scripts/drawcheck/record.mjs <copy>/docs/mock/2026-11-17-lw-grid-hover/ring.mjs <scratch> 4197
// Check a build:  node scripts/drawcheck/check.mjs scripts/drawcheck/specs/lw-hover-ring.mjs --dist dist --out <folder>
// THE WORLD: the demo world as it loads, no clock set (the drawing set none; drawn 17 Nov 26), the admin (ad/a), the
// Leave War grid scrolled 140px down; the day under the mouse is Drifter's (slipway) fifth day clear of the names
// (ring.mjs cellOf(page, 'Drifter', 4)); the tapped day for comparison his second (cellOf 1).
// HOW THE BUILD IS HOVERED: check.mjs moves the mouse to the screen's corner before it measures, so a real hover would
// be gone; the day and every element holding it are put in the hover state through the browser's own developer
// protocol (CSS.forcePseudoState) — the same state a mouse over the day gives, which the build's own rules then draw.
// Beside the tapped day the cell alone is put in it, as the drawing put its marker class on the cell alone (the open
// window takes the mouse, so the row is not under it).
import { fileURLToPath } from 'node:url'

const SCRIPT = 'docs/mock/2026-11-17-lw-grid-hover/ring.mjs'

// the drawing script's own way in (ring.mjs open())
async function open(page, origin) {
  await page.goto(origin + '/')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForFunction(() => window.CURPAGE === 'leavewar')
  await page.waitForSelector('#page-leavewar .mx tbody tr td.who', { timeout: 15000 })
  await page.waitForTimeout(1200)
  await page.evaluate(() => { document.querySelector('#page-leavewar .mx-wrap').scrollTop = 140 })
  await page.waitForTimeout(400)
}
// ring.mjs cellOf, the cell itself marked for the protocol to find
const pick = (page, name, nth, mark) => page.evaluate(([name, nth, mark]) => {
  const tr = [...document.querySelectorAll('#page-leavewar .mx tbody tr')].find(t => (t.querySelector('td.who')?.innerText || '').includes(name))
  if (!tr) return null
  const tds = [...tr.querySelectorAll('td')].filter(td => !td.classList.contains('who') && !td.classList.contains('bal') && !td.classList.contains('lwph'))
  const wrapR = document.querySelector('#page-leavewar .mx-wrap').getBoundingClientRect()
  const vis = tds.filter(td => { const r = td.getBoundingClientRect(); return r.left > wrapR.left + 220 && r.right < wrapR.right - 10 })
  const td = vis[nth]; if (!td) return null
  document.querySelectorAll('[data-dc-pick]').forEach(e => e.removeAttribute('data-dc-pick'))
  if (mark) td.setAttribute('data-dc-pick', '1')
  const r = td.getBoundingClientRect()
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
}, [name, nth, mark])
// the day under the mouse: the cell and every element that holds it in the hover state, as a real mouse would put them
// (`alone`: the cell only — the drawing's beside-tapped picture put its marker class on the cell alone, the row unhovered)
async function hover(page, alone) {
  await page.mouse.move(1, 1); await page.waitForTimeout(200)        // the real mouse off the grid: one day hovered, not two
  const s = await page.context().newCDPSession(page)
  await s.send('DOM.enable'); await s.send('CSS.enable')
  const { root } = await s.send('DOM.getDocument', { depth: -1 })
  let { nodeId } = await s.send('DOM.querySelector', { nodeId: root.nodeId, selector: '[data-dc-pick]' })
  if (!nodeId) return 'the day to hover was not found'
  for (let i = 0; nodeId && i < 60; i++) {
    await s.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['hover'] })
    const d = await s.send('DOM.describeNode', { nodeId })
    if (alone || d.node.nodeName === 'HTML') break
    const r = await s.send('DOM.resolveNode', { nodeId })
    const p = await s.send('Runtime.callFunctionOn', { objectId: r.object.objectId, functionDeclaration: 'function(){return this.parentElement}' })
    if (!p.result.objectId) break
    nodeId = (await s.send('DOM.requestNode', { objectId: p.result.objectId })).nodeId
  }
  page.__dcSession = s                                     // kept alive: the forced state lasts while the session does
  await page.waitForTimeout(300)
  const n = await page.evaluate(() => document.querySelectorAll('#page-leavewar .mx tbody td:hover').length)
  if (n !== 1) return `the hover state did not take: ${n} day(s) read as under the mouse`
}

const P = (name, label, draw, build, check, more = {}) => ({ name, label, draw, build, check, ...more })
const H = '#page-leavewar .mx tbody td:hover'
const R = '#page-leavewar .mx tbody tr:hover'
const ringParts = [
  P('day', 'the day under the mouse', H, H, ['place', 'size', 'ring', 'fill', 'edge']),
  P('left', 'the day before it', `#page-leavewar .mx tbody td:has(+ td:hover)`, `#page-leavewar .mx tbody td:has(+ td:hover)`, ['place', 'ring', 'fill', 'edge'], { rel: 'day' }),
  P('right', 'the day after it', `${H} + td`, `${H} + td`, ['place', 'ring', 'fill', 'edge'], { rel: 'day' }),
  P('along', 'a day three along the same row (the row tint)', `${H} + td + td + td`, `${H} + td + td + td`, ['place', 'ring', 'fill'], { rel: 'day' }),
  P('name', "the row's name (the row tint)", `${R} > td.who`, `${R} > td.who`, ['place', 'fill', 'ring']),
  P('below', 'the next row\'s name (no tint)', `${R} + tr > td.who`, `${R} + tr > td.who`, ['place', 'fill', 'ring']),
]
const tappedParts = [
  // the drawing drew the hovered day by the same rule on a marker class (the open window takes the mouse)
  P('day', 'the day under the mouse', '#page-leavewar .mx tbody td.mk-hov', H, ['place', 'size', 'ring', 'fill']),
  P('tapped', 'the tapped day', '#page-leavewar .mx tbody td.selcell', '#page-leavewar .mx tbody td.selcell', ['place', 'size', 'ring', 'fill'], { rel: 'day' }),
]

export default {
  name: 'Leave War grid hover ring',
  slug: 'lw-hover-ring',
  records: fileURLToPath(new URL('../../../docs/mock/2026-11-17-lw-grid-hover/drawcheck/', import.meta.url)),
  states: [
    {
      id: 'ring-desk', title: 'The day under the mouse, desktop, admin',
      drawing: { script: SCRIPT, shot: 'r-ring-full' },
      async reach(page, { origin }) {
        await open(page, origin)
        if (!(await pick(page, 'Drifter', 4, true))) return "Drifter's fifth day was not found"
        return hover(page)
      },
      parts: ringParts,
    },
    {
      id: 'ring-desk-tapped', title: 'The day under the mouse beside a tapped day, desktop, admin',
      drawing: { script: SCRIPT, shot: 'r-ring-beside-tapped' },
      async reach(page, { origin }) {
        await open(page, origin)
        const t = await pick(page, 'Drifter', 1, false)
        if (!t) return "Drifter's second day was not found"
        await page.mouse.click(t.x, t.y); await page.waitForTimeout(700)
        if (!(await pick(page, 'Drifter', 4, true))) return "Drifter's fifth day was not found"
        return hover(page, true)
      },
      parts: tappedParts,
    },
  ],
  accepted: [],
}
