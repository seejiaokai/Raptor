// The drawing check's part list for round 4 of the consistency look ([UI-CONSISTENCY-LOOK], owner D1702–D1707, 5 Nov 26):
// the drawn marks in place of the typed ones (⚙ ⇅ ▤ ◧ ↺ 📱 🖥 📅 ✋ ▣ → …), the Inputs row's filters and gear as one group, and
// one menu look. The approved drawing is scripts/handpass/cr4-look.mjs — it opens the REAL app, draws the recommended look on
// the live page (inline svgs of class `zz-ico`, a CSS group on the Inputs row, restyled menus) and takes its pictures; the
// approved ones end `-new` or `-b`, in docs/img/handpass/2026-11-05-consistency-round4/. Drawn on a build with the app code of
// main at f197e586f; desktop 1536 × 864 and phone 402 × 874 (touch), at 2, the clock Mon 13 Jul 26 09:00 (Singapore).
// THE RING: at each picture the drawing rings the part it is about with `.zz-ring` — an outline AND `border-radius:7px`
// (cr4-look.mjs world()). So a ringed part's corners and shadow are the drawing's pointer, not its design: they are never
// compared on a ringed part (its fill and edge are). The menus of q6 carry no ring, and are compared whole.
// Record the drawings (from raptor-port/; the drawing's own pictures to a scratch folder, never the approved one):
//   HP_URL=http://localhost:4263 HP_SHOTS=<scratch> DRAWCHECK_ORIGIN=http://localhost:4263 \
//     DRAWCHECK_SPEC=scripts/drawcheck/specs/cr4.mjs DRAWCHECK_DIST=<main at f197e586f, built> \
//     DRAWCHECK_APPROVED=docs/img/handpass/2026-11-05-consistency-round4 DRAWCHECK_DRAWN_ON='main at f197e586f' \
//     node --import ./scripts/drawcheck/record.mjs scripts/handpass/cr4-look.mjs
// Check a build:  node scripts/drawcheck/check.mjs scripts/drawcheck/specs/cr4.mjs --dist dist --out <folder>
import { fileURLToPath } from 'node:url'

const ORIGIN = 'http://localhost:4263'
const sleep = ms => new Promise(r => setTimeout(r, ms))
// the drawing's world (cr4-look.mjs world()): its clock, sign-in as the admin (handpass/lib.mjs login 'a'), toasts hidden
async function start(page, origin) {
  await page.clock.install({ time: new Date('2026-07-13T09:00:00+08:00') })
  await page.goto(origin + '/')
  await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(500)
  await page.addStyleTag({ content: '.toast,.snack,[role=status].toast{display:none!important} *{scroll-behavior:auto!important}' })
}
async function go(page, to) {
  await page.evaluate(p => window.go(p), to)
  await page.waitForFunction(p => window.CURPAGE === p, to); await page.waitForTimeout(400)
}
async function board(page, di) {
  await go(page, 'editsched')
  await page.click(`#eWeek [data-sbday="${di}"]:visible`)
  await page.waitForSelector('#schedBoard'); await page.waitForTimeout(500)
}
const press = async (page, sel, phone) => { const l = page.locator(sel).filter({ visible: true }).first(); if (phone) await l.tap(); else await l.click(); await sleep(500) }
const settle = page => page.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur() })
const visible = (page, sel) => page.evaluate(sel => [...document.querySelectorAll(sel)].some(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }), sel)

// ---------------------------------------------------------------- how the build gets to each screen (the drawing's own steps)
const reach = {
  async inputs(page, { origin }) { await start(page, origin); await go(page, 'inputs'); await sleep(600); await settle(page) },
  async sans(page, o) { await reach.inputs(page, o); await page.getByRole('tab', { name: /^SANS/ }).first().click(); await sleep(700); await settle(page) },
  async tracker(page, { origin }) { await start(page, origin); await go(page, 'tracker'); await sleep(900); await settle(page) },
  async waves(page, { origin, phone }) {
    await start(page, origin); await board(page, 0); await sleep(500)
    await press(page, '#schedBoard [data-wvadd]', phone); await sleep(500)
    if (!(await visible(page, '.wm-mng'))) return 'the flying-waves menu did not open'
    await settle(page)
  },
  async oil(page, { origin }) {
    await start(page, origin); await go(page, 'leavewar'); await sleep(600)
    await page.getByRole('tab', { name: /OIL/ }).first().click(); await sleep(800); await settle(page)
    if (!(await visible(page, '.oil-gear'))) return "the OIL tracker's gear is not on screen"
  },
  q3: (w, open) => async (page, { origin }) => {
    await start(page, origin); await go(page, 'inputs'); await sleep(600)
    if (open) { await page.getByText('Quill · OML').first().click(); await sleep(700) }
    await settle(page)
  },
  async boardMon(page, { origin }) { await start(page, origin); await board(page, 0); await sleep(600); await settle(page) },
  async autosort(page, { origin }) {
    await start(page, origin); await board(page, 0); await sleep(600)
    const ss = '#schedBoard [data-sortsec]'
    if (!(await visible(page, ss))) return 'no Auto sort button on the board'
    await page.locator(ss).filter({ visible: true }).first().scrollIntoViewIfNeeded(); await sleep(300); await settle(page)
  },
  async boardSat(page, { origin }) {
    await start(page, origin); await board(page, 0); await sleep(600)
    // the drawing went Monday first, then Saturday (closing the board by its own ✕, as lib.mjs board() does)
    const x = page.locator('#schedBoard').getByRole('button', { name: /Close/ }).first()
    if (await x.count()) { await x.click(); await sleep(600) } else { await page.keyboard.press('Escape'); await sleep(500) }
    await board(page, 5); await sleep(700)
    if (!(await visible(page, '#sbOil'))) return 'no OIL Earn on the Saturday board'
    await settle(page)
  },
  async more(page, { origin, phone }) {
    await start(page, origin); await board(page, 0); await sleep(600)
    await press(page, '#schedBoard [aria-label^="More"]', phone); await sleep(400); await settle(page)
    if (!(await visible(page, '#sbMoreMenu'))) return "the board's ⋯ menu did not open"
  },
  async lwset(page, { origin, phone }) {
    await start(page, origin); await go(page, 'leavewar'); await sleep(700)
    await press(page, '.lw-gear', phone); await sleep(600)
    await page.locator('[data-testid=settings-rearrange]').scrollIntoViewIfNeeded(); await sleep(300); await settle(page)
  },
  async lwoil(page, o) {
    await reach.lwset(page, o)
    await page.keyboard.press('Escape'); await sleep(300); await settle(page)
  },
  async lwdone(page, { origin, phone }) {
    await start(page, origin); await go(page, 'leavewar'); await sleep(700)
    await press(page, '.lw-gear', phone); await sleep(500)
    await press(page, '[data-testid=settings-rearrange]', phone); await sleep(700); await settle(page)
    if (!(await visible(page, '[data-testid=roster-arrange]'))) return 'Rearrange the grid did not show its Done'
  },
  async lull(page, { origin }) {
    await start(page, origin); await go(page, 'tracker'); await sleep(1000)
    await page.locator('#copyLullBtn').scrollIntoViewIfNeeded(); await sleep(400); await settle(page)
  },
  async tools(page, { origin, phone }) {
    await start(page, origin); await go(page, 'tracker'); await sleep(1000)
    await page.evaluate(() => window.scrollTo(0, 0))
    await press(page, 'button[title^="Edit the syllabus"]', phone); await sleep(400)
    await press(page, '#arrangeBtn', phone); await sleep(900)
    if (phone && await visible(page, '#foldTool')) { await press(page, '#foldTool', phone); await sleep(500) }
    await settle(page)
  },
  async lwmenu(page, { origin, phone }) {
    await start(page, origin); await go(page, 'leavewar'); await sleep(900)
    const mon = page.locator('[data-testid="month-JUL"]'); if (await mon.count()) { await mon.first().click(); await sleep(900) }
    const ok = await page.evaluate(() => { const c = [...document.querySelectorAll('[data-testid^="cell-"][data-testid$="-2026-07-20"]')].find(e => { const r = e.getBoundingClientRect(); return r.width && r.top > 0 && r.bottom < innerHeight }); if (!c) return false; c.classList.add('zz-cell'); return true })
    if (!ok) return 'no cell of 20 Jul in view'
    await press(page, '.zz-cell', phone); await sleep(700)
    await press(page, '[data-testid=bid-more]', phone); await sleep(500); await settle(page)
    if (!(await visible(page, '[data-testid=bid-more-menu]'))) return "the leave window's ⋯ menu did not open"
  },
  async trkmenu(page, { origin, phone }) {
    // the drawing reached it from the Leave War's menu (two Escapes), then the Tracker
    await start(page, origin); await go(page, 'tracker'); await sleep(900)
    await press(page, '#fileMenuBtn', phone); await sleep(500); await settle(page)
    if (!(await visible(page, '#fileMenuPanel.on'))) return "the Tracker's File menu did not open"
  },
}

// ---------------------------------------------------------------- the parts
const P = (name, label, draw, build, check, more = {}) => ({ name, label, draw, build, check, ...more })
const RINGED = ['place', 'size', 'fill', 'edge', 'colour']          // a ringed button: never its corners or shadow (the ring's)
const WHOLE = ['place', 'size', 'fill', 'edge', 'corners', 'shadow'] // an unringed panel or row
const MARK = ['place', 'size', 'colour']
// a button and its drawn mark: drawing `svg.zz-ico` (cr4-look.mjs svg()), build `svg.btnglyph` (or the Tracker's `trkglyph`)
const button = (name, label, dSel, bSel, { words = false, glyph = 'btnglyph', ringed = true, rel } = {}) => [
  P(name, label, dSel, bSel, [...(ringed ? RINGED : WHOLE), ...(words ? ['words-x'] : [])], rel ? { rel } : {}),
  P(name + '-mark', `${label}: its drawn mark`, `${dSel} svg.zz-ico`, `${bSel} svg.${glyph}`, MARK, { rel: name }),
]
const gearParts = (dSel, bSel, glyph) => button('gear', 'the gear', dSel, bSel, { glyph })

const q3Parts = [
  P('row', 'the Inputs top row', '.inputs-top', '.inputs-top', ['place', 'size']),
  P('gear', 'the gear', '#inGear', '#inGear', ['place', 'size', 'fill', 'edge'], { rel: 'row' }),
  P('search', 'the search box', 'label.inputs-search', 'label.inputs-search', ['place', 'size'], { rel: 'row' }),
  P('search-input', 'the search box’s typing field', '#inFSearch', '#inFSearch', ['size']),
  P('filter1', 'the first filter', { sel: '.inputs-filterfields > label', nth: 0 }, { sel: '.inputs-filterfields > label', nth: 0 }, ['place', 'size'], { rel: 'row' }),
  P('filter2', 'the second filter', { sel: '.inputs-filterfields > label', nth: 1 }, { sel: '.inputs-filterfields > label', nth: 1 }, ['place', 'size'], { rel: 'row' }),
  P('views', 'Calendar · List', '.inputs-top .inputs-views', '.inputs-top .inputs-views', ['place', 'size'], { rel: 'row' }),
  P('nav', 'the month and its arrows', '.inputs-top .ic-nav', '.inputs-top .ic-nav', ['place', 'size'], { rel: 'row' }),
]

const boardBtn = (id, label) => [
  P(id, label, `#${id}`, `#${id}`, [...RINGED, 'words-x']),
  P(id + '-mark', `${label}: its drawn mark`, `#${id} .bi svg.zz-ico`, `#${id} .bi svg.btnglyph`, MARK, { rel: id }),
]

const lwsetParts = [
  ...button('rearrange', 'Rearrange the grid', '[data-testid=settings-rearrange]', '[data-testid=settings-rearrange]', { words: true }),
  ...button('reset', 'Reset order', '[data-testid=roster-reset-order]', '[data-testid=roster-reset-order]', { words: true }),
]
const lwoilParts = [
  P('tabs', 'the Leave War’s tab row', '[role=tablist]:has([data-testid=oil-tracker])', '[role=tablist]:has([data-testid=oil-tracker])', ['place', 'size']),
  P('oil-tab', 'the OIL tab', '[data-testid=oil-tracker]', '[data-testid=oil-tracker]', [...RINGED, 'words-x'], { rel: 'tabs' }),
  // the drawing put its ticket in the tab's own svg's place, keeping that svg's class (btnglyph), so `svg` here
  P('oil-mark', 'the OIL tab’s ticket', '[data-testid=oil-tracker] svg', '[data-testid=oil-tracker] svg.btnglyph', MARK, { rel: 'oil-tab' }),
]
const lwdoneParts = button('done', 'the grid’s Done', '[data-testid=roster-arrange]', '[data-testid=roster-arrange]', { words: true })
const lullParts = [
  ...button('copy', 'Copy to…', '#copyLullBtn', '#copyLullBtn', { words: true, glyph: 'trkglyph' }),
  // Student A has no lull period in this world ("none"), so no chip and no ✕ is drawn on either side: the ✕ is not measured.
  // "+ Set lull period" beside it (unchanged) holds the place
  P('set', '+ Set lull period (unchanged, for its place)', 'button.sm:has(+ #copyLullBtn)', 'button.sm:has(+ #copyLullBtn)', ['place', 'size']),
]
const T = t => `#arrTools > button[title^="${t}"]`
const TOOLS = [
  ['move', 'Move', T('Drag balls')], ['select', 'Select', T('Drag a box')], ['connect', 'Connect', T('Click prerequisite')],
  ['delete', 'Delete', T('Delete whatever')], ['line', 'Line', T('Draw a free')], ['editlines', 'Edit lines', T('Show N/E/S/W')],
  ['arrow', 'Arrow', '#arrowBtn'], ['selectall', 'Select all', '#selectAllBtn'], ['fit', 'Fit', '#fitBtn'],
  ['reset', 'Reset layout', '#resetLayout'], ['edit', 'Edit events', '#editSyl'],
]
const toolsParts = [
  P('strip', 'the chart-layout tools', '#arrTools', '#arrTools', ['place', 'size']),
  P('text', 'Text (unchanged, for its place)', T('Click a ball to edit'), T('Click a ball to edit'), ['place', 'size'], { rel: 'strip' }),
  ...TOOLS.flatMap(([n, l, s]) => button(n, l, s, s, { words: true, glyph: 'trkglyph', rel: 'strip' })),
  P('merge', 'Merge (its words alone)', T('Click one line then a crossing line: the hop'), T('Click one line then a crossing line: the hop'), [...RINGED, 'words-x', 'text'], { rel: 'strip' }),
  P('unmerge', 'Unmerge (its words alone)', T('Click one line then a crossing line to give'), T('Click one line then a crossing line to give'), [...RINGED, 'words-x', 'text'], { rel: 'strip' }),
]
const ITEM = ['place', 'size', 'fill', 'edge', 'corners', 'shadow', 'colour', 'letters', 'words-x', 'text']
const menuParts = (panel, item, n) => [
  P('panel', 'the menu', panel, panel, WHOLE),
  ...Array.from({ length: n }, (_, i) => P('item' + (i + 1), `its row ${i + 1}`, { sel: item, nth: i }, { sel: item, nth: i }, ITEM, { rel: 'panel' })),
]
const moreParts = [
  P('panel', 'the ⋯ menu', '#sbMoreMenu', '#sbMoreMenu', WHOLE),
  P('insights', 'Insights', '#sbMoreInsights', '#sbMoreInsights', ['place', 'size'], { rel: 'panel' }),
  P('sort', 'Sort all', '#sbMoreSort', '#sbMoreSort', [...RINGED, 'words-x'], { rel: 'panel' }),
  P('sort-mark', 'Sort all: its drawn mark', '#sbMoreSort .bi svg.zz-ico', '#sbMoreSort .bi svg.btnglyph', MARK, { rel: 'sort' }),
  P('wide', 'Desktop layout', '#sbMoreWide', '#sbMoreWide', [...RINGED, 'words-x', 'text'], { rel: 'panel' }),
  P('wide-mark', 'Desktop layout: its drawn mark', '#sbMoreWide .bi svg.zz-ico', '#sbMoreWide .bi svg.btnglyph', MARK, { rel: 'wide' }),
]

const D = 'scripts/handpass/cr4-look.mjs'
const both = (id, title, shot, how, parts, more = {}) => [
  { id: id + '-pc', title: title + ', desktop', drawing: { script: D, shot: shot.replace('#', 'pc') }, reach: how, parts, ...more },
  { id: id + '-ph', title: title + ', iPhone', phone: true, drawing: { script: D, shot: shot.replace('#', 'ph') }, reach: how, parts, ...more },
]
export default {
  name: 'Round 4 of the consistency look — drawn marks, one gear, one menu look',
  slug: 'cr4',
  origin: ORIGIN,
  timezone: 'Asia/Singapore',
  records: fileURLToPath(new URL('../../../docs/mock/consistency-round4/drawcheck/', import.meta.url)),
  states: [
    // q1 — the gears and the OIL tracker's Range
    ...both('inputs-gear', "The Inputs calendar's gear", 'q1-#-inputs-new', reach.inputs, gearParts('#inGear', '#inGear')),
    ...both('sans-gear', "The SANS calendar's gear", 'q1-#-sans-new', reach.sans, gearParts('.sc-gear', '.sc-gear')),
    ...both('tracker-gear', "The Tracker's flex-settings gear", 'q1-#-tracker-new', reach.tracker, gearParts('#flexBtn', '#flexBtn', 'trkglyph')),
    ...both('waves-gear', "The flying-waves menu's gear", 'q1-#-waves-new', reach.waves, gearParts('.wm-mng', '.wm-mng')),
    ...both('oil-gear', "The OIL tracker's gear", 'q1-#-oilgear-new', reach.oil, gearParts('.oil-gear', '.oil-gear')),
    ...both('oil-range', "The OIL tracker's Range", 'q1-#-oilrange-new', reach.oil, [
      ...button('range', 'Range', '.zz-range', '[data-testid=oil-range-pick]', { words: true }),
      P('ci', 'its mark’s slot', '.zz-range .ci', '[data-testid=oil-range-pick] .ci', ['place', 'size'], { rel: 'range' }),
    ]),
    // q3 — the Inputs row at a narrow desktop: closed, and with a window open
    ...[1366, 1300, 1280].flatMap(w => [
      { id: `q3-${w}-closed`, title: `The Inputs top row at ${w}, nothing open`, drawing: { script: D, shot: `q3-${w}-closed-new` }, reach: reach.q3(w, false), parts: q3Parts },
      { id: `q3-${w}-open`, title: `The Inputs top row at ${w}, an input's window open`, drawing: { script: D, shot: `q3-${w}-new` }, reach: reach.q3(w, true), parts: q3Parts },
    ]),
    // q4 — the board, the phone's ⋯ menu, the Leave War
    { id: 'board-pc', title: "The Scheduler Board's Templates and Sort all, Monday, desktop", drawing: { script: D, shot: 'q4-pc-board-new' }, reach: reach.boardMon,
      parts: [...boardBtn('sbTpl', 'Templates'), ...boardBtn('sbSortAll', 'Sort all'), P('sbHist', 'History (unchanged, for its place)', '#sbHist', '#sbHist', ['place', 'size'])] },
    { id: 'autosort-pc', title: "A section's Auto sort, Monday, desktop", drawing: { script: D, shot: 'q4-pc-autosort-new' }, reach: reach.autosort,
      parts: [P('autosort', 'Auto sort', '.zz-one', '#schedBoard [data-sortsec]', [...RINGED, 'words-x']),
        P('autosort-mark', 'Auto sort: its drawn mark', '.zz-one svg.zz-ico', '#schedBoard [data-sortsec] > svg.btnglyph', MARK, { rel: 'autosort' })] },
    { id: 'oilbar-pc', title: "The board's bar with OIL Earn's ticket, Saturday, desktop", drawing: { script: D, shot: 'q4-pc-oilbar-b' }, reach: reach.boardSat,
      parts: [...boardBtn('sbOil', 'OIL Earn'),
        P('sbTpl', 'Templates', '#sbTpl', '#sbTpl', ['place', 'size', 'words-x']), P('sbTpl-mark', 'Templates: its drawn mark', '#sbTpl .bi svg.zz-ico', '#sbTpl .bi svg.btnglyph', MARK, { rel: 'sbTpl' }),
        P('sbSortAll', 'Sort all', '#sbSortAll', '#sbSortAll', ['place', 'size', 'words-x']), P('sbSortAll-mark', 'Sort all: its drawn mark', '#sbSortAll .bi svg.zz-ico', '#sbSortAll .bi svg.btnglyph', MARK, { rel: 'sbSortAll' }),
        P('sbHist', 'History (unchanged, for its place)', '#sbHist', '#sbHist', ['place', 'size'])] },
    { id: 'more-ph', title: "The board's ⋯ menu, iPhone", phone: true, drawing: { script: D, shot: 'q4-ph-more-new' }, reach: reach.more, parts: moreParts },
    ...both('lwset', "The Leave War's Settings: Rearrange the grid and Reset order", 'q4-#-lwset-new', reach.lwset, lwsetParts),
    ...both('lwoil', "The Leave War's OIL tab with its ticket", 'q4-#-lwoil-b', reach.lwoil, lwoilParts),
    ...both('lwdone', "The Leave War grid's Done", 'q4-#-lwdone-new', reach.lwdone, lwdoneParts),
    // q5 — the Tracker
    { id: 'lull-pc', title: "The Tracker's lull: Copy to… and a chip's ✕, desktop", drawing: { script: D, shot: 'q5-pc-lull-new' }, reach: reach.lull, parts: lullParts },
    ...both('tools', "The Tracker's chart-layout tools", 'q5-#-tools-new', reach.tools, toolsParts),
    // q6 — one menu look
    ...both('lwmenu', "The Leave War window's ⋯ menu", 'q6-#-lwmenu-new', reach.lwmenu, menuParts('[data-testid=bid-more-menu]', '[data-testid=bid-more-menu] button', 4)),
    ...both('trkmenu', "The Tracker's File menu", 'q6-#-trkmenu-new', reach.trkmenu, menuParts('#fileMenuPanel.on', '#fileMenuPanel.on > button', 2)),
  ],
  // the differences he has ruled to keep as built — none yet
  accepted: [],
}
