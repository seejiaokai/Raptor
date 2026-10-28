// The drawing check's part list for the Leave War's M5a screens (D1494): the person window, the Balances page, Days
// taken and the Grades window, at his PC's size and his iPhone's. Each state names the approved picture it is measured
// against (the drawing script and the picture's name), how the build is brought to the same screen, and its parts —
// each with the selector that finds it in the drawing (`draw`) and in the build (`build`), and what of it is compared.
// Record the drawings (the M5a drawings were drawn on main at 230aa3b85, from full-m5a-stage.mjs's saved world):
//   cd raptor-port ; LWMOCK_OUT=<scratch> DRAWCHECK_SPEC=scripts/drawcheck/specs/lw-m5a.mjs DRAWCHECK_DIST=<that build's dist> \
//     DRAWCHECK_APPROVED=docs/mock/lw-overhaul/full/m5a node --import ./scripts/drawcheck/record.mjs docs/mock/lw-overhaul/full-m5a-<x>.mjs
// Check a build:  node scripts/drawcheck/check.mjs scripts/drawcheck/specs/lw-m5a.mjs --dist dist
import { fileURLToPath } from 'node:url'

const q = t => `[data-testid="${t}"]`
// the drawings' clock (full-m5a-stage.mjs): Thu 22 Jan 26, 09:00
const CLOCK = new Date('2026-01-22T09:00:00+08:00')

// The drawings' busy case, staged on the build through the same doors full-m5a-stage.mjs used: Ranger's (bane) bids
// by the localhost bridge's setCell, approve and refuse pressed in the real window a tap on his leave opens.
async function signIn(page, origin, who) {
  await page.goto(origin + '/')
  await page.fill('#luser', who === 'admin' ? 'ad' : 'us'); await page.fill('#lpass', who === 'admin' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => window.go('leavewar')); await page.waitForSelector(q('row-slipway')); await page.waitForTimeout(1000)
}
async function stage(page, origin, who, { locked } = {}) {
  await page.clock.setFixedTime(CLOCK)
  await signIn(page, origin, 'admin')
  // since M4 an admin's own entries are approved as he enters them unless "Approve what I enter" is off (D1302,
  // remembered): switched off in an empty day's window first, so the pending bids stay pending, as drawn
  await page.evaluate(id => document.querySelector(`[data-testid="${id}"]`)?.scrollIntoView({ block: 'center', inline: 'center' }), 'cell-bane-2026-01-07')
  await page.click(q('cell-bane-2026-01-07')); await page.waitForTimeout(450)
  const tick = page.locator(q('bid-approve-tick')).first()
  if (await tick.count()) {
    const on = (await tick.getAttribute('aria-checked')) === 'true' || (await tick.getAttribute('aria-pressed')) === 'true'
    if (on) { await tick.click(); await page.waitForTimeout(300) }
  }
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  const put = (d, c) => page.evaluate(([d, c]) => window.lwSetCell('bane', d, c), [d, c])
  for (const d of ['2026-01-19', '2026-01-20', '2026-01-21', '2026-01-26', '2026-01-27', '2026-02-02', '2026-02-12', '2026-02-13']) await put(d, 'LL')
  await put('2026-03-02', 'CCL'); await put('2026-03-16', '*PL'); await put('2026-03-17', 'CL'); await put('2026-01-29', '*LL')
  await page.waitForTimeout(400)
  for (const [date, btn] of [['2026-01-19', 'Approve'], ['2026-01-26', 'Approve'], ['2026-02-02', 'Refuse']]) {
    await page.evaluate(id => document.querySelector(`[data-testid="${id}"]`)?.scrollIntoView({ block: 'center', inline: 'center' }), 'cell-bane-' + date)
    await page.waitForTimeout(250)
    await page.click(q('cell-bane-' + date)); await page.waitForTimeout(450)
    const b = page.locator('.bidsheet button, [role=dialog] button').filter({ hasText: new RegExp('^' + btn + '$') }).first()
    // the window names an approved leave "Approved" (BidPicker): already as wanted
    const already = btn === 'Approve' && await page.locator('.bidsheet button, [role=dialog] button').filter({ hasText: /^Approved$/ }).count()
    if (already) { await page.keyboard.press('Escape'); await page.waitForTimeout(300); continue }
    if (!(await b.count())) throw new Error(`staging: no ${btn} in the window for ${date}; its buttons: ` + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[role=dialog] button, .bidsheet button')].filter(e => e.getBoundingClientRect().width).map(b => b.textContent.trim()).slice(0, 20))))
    await b.click(); await page.waitForTimeout(350)
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  }
  if (locked) {
    // the admin's own "Lock for members" on the Balances page (the drawing's c2 locked case)
    await page.click(q('lw-tab-balances')); await page.waitForSelector(q('balances-page'))
    const lk = page.locator(q('bal-lock'))
    if (!(await lk.count())) throw new Error('staging: no Lock for members on the Balances page')
    if ((await lk.getAttribute('aria-pressed')) !== 'true') { await lk.click(); await page.waitForTimeout(300) }
    await page.click(q('lw-tab-grid')); await page.waitForTimeout(300)
  }
  if (who === 'member') {
    // the drawings' member is Ranger himself (us/us): a fresh sign-in on the same saved world
    await page.evaluate(() => { sessionStorage.clear() })
    await page.reload(); await page.waitForSelector('#luser')
    await signIn(page, origin, 'member')
  }
  await page.evaluate(() => window.scrollTo(0, 0))
}
async function personWindow(page, phone) {
  await page.evaluate(id => document.querySelector(`[data-testid="${id}"]`)?.scrollIntoView({ block: 'center' }), 'person-bane')
  await page.waitForTimeout(250)
  await (phone ? page.tap(q('person-bane')) : page.click(q('person-bane'))); await page.waitForTimeout(700)
  if (!(await page.locator(q('person-window')).isVisible())) return 'the person window did not open on a press of Ranger\'s name'
}
async function balances(page, view) {
  await page.click(q('lw-tab-balances')); await page.waitForSelector(q('balances-page'), { state: 'visible' }); await page.waitForTimeout(500)
  if (view === 'taken') { await page.click(q('bal-view-taken')); await page.waitForTimeout(400) }
}

// ---------------------------------------------------------------- the parts
// { name, label (his words for it), draw, build, check, rel } — `rel` measures a part from another's box (or, for
// 'words-y', from that part's words), so a part is judged inside what holds it, not by where the page put the whole.
const P = (name, label, draw, build, check, more = {}) => ({ name, label, draw, build, check, ...more })
const LOOK = ['fill', 'edge', 'corners', 'shadow']
const personParts = [
  P('window', 'the window', '.bidsheet.m5p', q('person-window'), ['place', 'width', ...LOOK]),
  P('title-bar', "the window's title bar", '.m5p .bidsheet-hd', `${q('person-window')} .bidsheet-hd`, ['place', 'size'], { rel: 'window' }),
  P('lve-tile', 'the LVE tile', '.m5p .r17-lve', q('pw-tile-LVE'), ['place', 'size', 'fill', 'corners'], { rel: 'window' }),
  P('year', 'the year picker', '.m5p .m5-yr', q('pw-year'), ['place', 'size', ...LOOK], { rel: 'window' }),
  P('leave-line', 'the first leave line', '.m5p .m5-list .ll-row', `${q('person-window')} .m5-list .ll-row`, ['place', 'size', ...LOOK], { rel: 'window' }),
  P('leave-box', "the first leave line's leave box", '.m5p .m5-list .ll-row .ll-box', `${q('person-window')} .m5-list .ll-row .ll-box`, ['place', 'size'], { rel: 'leave-line' }),
  P('leave-dates', "the first leave line's dates", '.m5p .m5-list .ll-row .ll-dates', `${q('person-window')} .m5-list .ll-row .ll-dates`, ['place', 'words-x'], { rel: 'leave-line' }),
  P('leave-state', "the first leave line's 'Approved'", '.m5p .m5-list .ll-row .ll-state', `${q('person-window')} .m5-list .ll-row .ll-state`, ['place', 'colour'], { rel: 'leave-line' }),
]
const switchParts = [
  P('switch', 'the Balances | Days taken switch', '.zbp .zz-seg', '.bp-seg', ['place', 'size', ...LOOK]),
  P('switch-lit', "the switch's lit half", '.zbp .zz-seg .on', '.bp-seg .on', ['place', 'size', ...LOOK, 'colour'], { rel: 'switch' }),
]
const balancesParts = [
  ...switchParts,
  P('grades-button', 'the "Grades…" button', '.zbp .zz-grades', q('bal-grades'), ['place', 'size', ...LOOK]),
  P('ranger-row', "Ranger's row", '.zbp tr[data-cs="Ranger"]', q('bal-row-bane'), ['place', 'height']),
  P('ranger-name', "Ranger's name", '.zbp tr[data-cs="Ranger"] .puck', `${q('bal-row-bane')} .puck`, ['place', 'size', 'words-x'], { rel: 'ranger-row' }),
  // a short callsign shows whether the name is set left or centred in its puck
  P('hex-name', "Hex's name (a short one)", '.zbp tr[data-cs="Hex"] .puck', `${q('bal-row-rocky')} .puck`, ['place', 'size', 'words-x']),
  P('ranger-app', "Ranger's App bal box", '.zbp tr[data-cs="Ranger"] [data-zk="app"] .bx', q('bal-LVE-bane'), ['place', 'size', 'words-x', ...LOOK], { rel: 'ranger-row' }),
  P('ranger-pend', "Ranger's pending figure", '.zbp tr[data-cs="Ranger"] [data-zk="pend"]', q('bal-pend-bane'), ['place', 'size', 'colour'], { rel: 'ranger-row' }),
]
const takenParts = [
  ...switchParts,
  P('taken-head', "Days taken's heading", '.zbp tr.h1 th.span', q('bal-taken-head'), ['place', 'size', 'text']),
]
const gradesParts = [
  P('window', 'the Grades window', '.zz-gw', q('grades-sheet'), ['place', 'size', ...LOOK]),
  P('title-bar', "the Grades window's title bar", '.zz-gw .hd', `${q('grades-sheet')} .bidsheet-hd`, ['place', 'size'], { rel: 'window' }),
  P('first-grade', 'the first grade', '.zz-gw .zz-g1', `${q('grades-sheet')} .gw-row`, ['place', 'size'], { rel: 'window' }),
  P('first-days', "the first grade's + days box", '.zz-gw .zz-g1 .bx', q('grade-days-sp'), ['place', 'size', 'words-x'], { rel: 'window' }),
]
const R = '.zbp .row[data-cs="Ranger"]', BR = q('bal-row-bane')
const phoneLockedParts = [
  P('ranger-row', "Ranger's row", R, BR, ['place', 'size']),
  P('ranger-name', "Ranger's name", `${R} .puck`, `${BR} .puck`, ['place', 'words-x'], { rel: 'ranger-row' }),
  P('ranger-app', "Ranger's App bal figure", `${R} .ro`, `${BR} .bp-ro`, ['words-place'], { rel: 'ranger-row' }),
  P('ranger-pend', "Ranger's pending figure (amber)", `${R} .pend`, q('bal-pend-bane'), ['words-y', 'colour'], { rel: 'ranger-app' }),
  P('ranger-ccl', "Ranger's CCL figure", `${R} .oc .ro`, `${BR} .bp-oc .bp-ro`, ['words-place'], { rel: 'ranger-row' }),
  P('ranger-ccl-pend', "Ranger's CCL pending figure (amber)", `${R} .opd`, q('bal-opd-CCL-bane'), ['words-y', 'colour'], { rel: 'ranger-ccl' }),
]
// the desktop's locked page, as a member (Ranger) reads it: the same figures in the table's cells
const DR = '.zbp tr[data-cs="Ranger"]'
const deskLockedParts = [
  P('ranger-row', "Ranger's row", DR, BR, ['place', 'size']),
  P('ranger-app', "Ranger's App bal figure", `${DR} [data-zk="app"] .ro`, `${BR} .bp-ro`, ['words-place'], { rel: 'ranger-row' }),
  P('ranger-pend', "Ranger's pending figure (amber)", `${DR} [data-zk="pend"]`, q('bal-pend-bane'), ['words-place', 'colour'], { rel: 'ranger-row' }),
  P('ranger-pend-line', "Ranger's pending figure on his row's line", `${DR} [data-zk="pend"]`, q('bal-pend-bane'), ['words-y'], { rel: 'ranger-app' }),
  P('ranger-ccl', "Ranger's CCL figure", `${DR} [data-zk="o-CCL"] .ro`, `${BR} td:has(> [data-testid="bal-opd-CCL-bane"]) .bp-ro`, ['words-place'], { rel: 'ranger-row' }),
  P('ranger-ccl-pend', "Ranger's CCL pending figure (amber)", `${DR} [data-zk="o-CCL"] .opd`, q('bal-opd-CCL-bane'), ['words-y', 'colour'], { rel: 'ranger-ccl' }),
]
// the Balances page on his iPhone, as an admin: the switch, and Ranger's name in the column that stays put
const phoneBalancesParts = [
  ...switchParts,
  P('ranger-row', "Ranger's row", R, BR, ['place', 'height']),
  P('ranger-name', "Ranger's name", `${R} .puck`, `${BR} .puck`, ['place', 'words-x'], { rel: 'ranger-row' }),
]
// a docked window stands where it is drawn whatever the page's scroll: the same drawing, the page left at its top
const dockParts = personParts.filter(p => p.name === 'window' || p.name === 'title-bar')

export default {
  name: 'Leave War M5a',
  slug: 'lw-m5a',
  records: fileURLToPath(new URL('../../../docs/mock/lw-overhaul/drawcheck/m5a/', import.meta.url)),
  states: [
    {
      id: 'person-desk', title: 'The person window, desktop, admin',
      drawing: { script: 'docs/mock/lw-overhaul/full-m5a-person.mjs', shot: 'm5a-p2-desk-drawn' },
      async reach(page, { origin }) { await stage(page, origin, 'admin', { locked: true }); return personWindow(page, false) },
      parts: personParts,
    },
    {
      id: 'person-desk-top', title: 'The person window, desktop, admin — the page at its top',
      drawing: { script: 'docs/mock/lw-overhaul/full-m5a-person.mjs', shot: 'm5a-p2-desk-drawn', record: 'person-desk' },
      async reach(page, { origin }) {
        await stage(page, origin, 'admin', { locked: true })
        // his name pressed where the page shows it, with no scroll of the page first
        await page.click(q('person-bane')); await page.waitForTimeout(700)
        if (!(await page.locator(q('person-window')).isVisible())) return "the person window did not open on a press of Ranger's name"
        const y = await page.evaluate(() => scrollY)
        if (y !== 0) return `the page scrolled to ${y} to reach Ranger's name, so this is not the page at its top`
      },
      parts: dockParts,
    },
    {
      id: 'person-phone', title: 'His own person window, iPhone, member', phone: true,
      drawing: { script: 'docs/mock/lw-overhaul/full-m5a-person.mjs', shot: 'm5a-p4-phone-own' },
      async reach(page, { origin }) { await stage(page, origin, 'member'); return personWindow(page, true) },
      parts: personParts,
    },
    {
      id: 'balances-desk', title: 'The Balances page, desktop, admin',
      drawing: { script: 'docs/mock/lw-overhaul/full-m5a-balances.mjs', shot: 'm5b-b1-desk' },
      async reach(page, { origin }) { await stage(page, origin, 'admin'); await balances(page, 'bal') },
      parts: balancesParts,
    },
    {
      id: 'balances-phone', title: 'The Balances page, iPhone, admin', phone: true,
      drawing: { script: 'docs/mock/lw-overhaul/full-m5a-balances.mjs', shot: 'm5b-b2-rest' },
      async reach(page, { origin }) { await stage(page, origin, 'admin'); await balances(page, 'bal') },
      parts: phoneBalancesParts,
    },
    {
      id: 'taken-phone', title: 'Days taken, iPhone, admin', phone: true,
      drawing: { script: 'docs/mock/lw-overhaul/full-m5a-balances.mjs', shot: 'm5b-b3-phone' },
      async reach(page, { origin }) { await stage(page, origin, 'admin'); await balances(page, 'taken') },
      parts: switchParts,
    },
    {
      id: 'taken-desk', title: 'Days taken, desktop, admin',
      drawing: { script: 'docs/mock/lw-overhaul/full-m5a-balances.mjs', shot: 'm5b-b3-desk' },
      async reach(page, { origin }) { await stage(page, origin, 'admin'); await balances(page, 'taken') },
      parts: takenParts,
    },
    {
      id: 'grades-desk', title: 'The Grades window, desktop, admin',
      drawing: { script: 'docs/mock/lw-overhaul/full-m5a-balances.mjs', shot: 'm5c-c1-grades' },
      async reach(page, { origin }) {
        await stage(page, origin, 'admin'); await balances(page, 'bal')
        await page.click(q('bal-grades')); await page.waitForTimeout(500)
        if (!(await page.locator(q('grades-sheet')).isVisible())) return 'the Grades window did not open on a press of "Grades…"'
      },
      parts: gradesParts,
    },
    {
      id: 'balances-phone-locked', title: 'The Balances page locked, iPhone, member', phone: true,
      drawing: { script: 'docs/mock/lw-overhaul/full-m5a-balances.mjs', shot: 'm5c-c2-phone-locked' },
      async reach(page, { origin }) { await stage(page, origin, 'member', { locked: true }); await balances(page, 'bal') },
      parts: phoneLockedParts,
    },
    {
      id: 'balances-desk-locked', title: 'The Balances page locked, desktop, member',
      drawing: { script: 'docs/mock/lw-overhaul/full-m5a-balances.mjs', shot: 'm5c-c2-desk-locked' },
      async reach(page, { origin }) { await stage(page, origin, 'member', { locked: true }); await balances(page, 'bal') },
      parts: deskLockedParts,
    },
  ],
  // the differences he has ruled to keep as built — each with his ruling and the one kind of difference kept, so a new
  // difference in the same part still turns the check red; they stay in the report, marked.
  // D1493 (29 Oct 26, "All as recommended"): the switch and the hyphen stand as built.
  accepted: [
    ...['balances-desk', 'taken-desk', 'balances-phone', 'taken-phone'].flatMap(state => [
      ...['width', 'fill'].map(check => ({ state, part: 'switch', check, why: 'D1493 — the switch stands as built' })),
      ...['place', 'height'].map(check => ({ state, part: 'switch-lit', check, why: 'D1493 — the switch stands as built' })),
    ]),
    { state: 'taken-desk', part: 'taken-head', check: 'text', why: "D1493 — the period's own name, its hyphen as typed" },
    // D1497 (29 Oct 26, "As recommended"): kept at the place live M5a has them, so a further move is new
    { state: 'person-desk-top', part: 'window', check: 'place', build: '130', why: 'D1497 — under My leave and the gear at the page top, covering neither' },
    { state: 'person-phone', part: 'window', check: 'place', build: '73', why: 'D1497 — centred, a little shorter than drawn' },
  ],
}
