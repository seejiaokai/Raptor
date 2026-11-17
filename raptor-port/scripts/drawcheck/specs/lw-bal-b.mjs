// The drawing check's part list for the Leave War's Balances page, option B (his D2156, 17 Nov 26 — answering D2153's
// alignment and D2154's pending look): every column set from the left under its heading, the LVE and OTHER LEAVE labels at
// their group's start with rules over exactly their columns, LVE's pending column "PENDING APPROVAL" with its figure in a
// dashed amber tag, another kind's pending figure a small dashed tag on its box's top right corner.
// Drawn by docs/mock/2026-11-17-lw-balances-align/bal.mjs with options.mjs's option b, injected over a vite preview of
// chat 96/97's branch; the app code there is main's at 3a51c06a3 (no app file changed from 3a51c06a3 to 62b11ecd7), so
// the drawing is replayed on a build of 3a51c06a3. The drawing script loads Playwright from another checkout: record from
// a copy whose one require line names this checkout's raptor-port/package.json, kept under a path ending in
// docs/mock/2026-11-17-lw-balances-align/bal.mjs (record.mjs matches the script by that ending).
// Record (from raptor-port/; the script writes its pictures to its first argument — a scratch folder):
//   DRAWCHECK_SPEC=scripts/drawcheck/specs/lw-bal-b.mjs DRAWCHECK_DIST=<a build of 3a51c06a3> \
//     DRAWCHECK_APPROVED=docs/mock/2026-11-17-lw-balances-align/img DRAWCHECK_DRAWN_ON='main at 3a51c06a3' \
//     node --import ./scripts/drawcheck/record.mjs <copy>/docs/mock/2026-11-17-lw-balances-align/bal.mjs <scratch> 4197 b
// Check a build:  node scripts/drawcheck/check.mjs scripts/drawcheck/specs/lw-bal-b.mjs --dist dist --out <folder>
// THE WORLD: the demo world as it loads, no clock set (the drawing set none; drawn 17 Nov 26), the admin (ad/a), the
// Leave War's Balances tab pressed; Ranger (bane) carries the pending days: 2.5 LVE, 1 CCL, 0.5 PL, 1 CL.
// Phone: 402 × 874 at 3, touch (the drawing used Playwright's iPhone 13 in Chromium). Desktop: 1536 × 864 at 2.
import { fileURLToPath } from 'node:url'

const q = t => `[data-testid="${t}"]`
const SCRIPT = 'docs/mock/2026-11-17-lw-balances-align/bal.mjs'

// the drawing script's own way in (bal.mjs open())
async function open(page, origin) {
  await page.goto(origin + '/')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForFunction(() => window.CURPAGE === 'leavewar')
  await page.waitForTimeout(1200)
  await page.locator('#page-leavewar .intab', { hasText: 'Balances' }).first().click()
  await page.waitForSelector(q('bal-scroll'))
  await page.waitForTimeout(800)
  if (!(await page.locator(q('bal-pend-bane')).count())) return "Ranger's row is not on the Balances page"
}
// the slid picture: the phone's sideways strip slid to its end (bal.mjs: scrollLeft = 10000)
async function slid(page, ctx) {
  const r = await open(page, ctx.origin); if (r) return r
  await page.evaluate(() => { const h = document.querySelector('.bp-hs'); h.scrollLeft = 10000 })
  await page.waitForTimeout(300)
}

const P = (name, label, draw, build, check, more = {}) => ({ name, label, draw, build, check, ...more })
const LOOK = ['fill', 'edge', 'corners']
const TAG = ['place', 'size', 'fill', 'edge', 'corners', 'colour', 'letters', 'text']

// ---------------------------------------------------------------- desktop: the table
const DT = '#page-leavewar .bp-table', BT = '.bp-table'
const DH2 = `${DT} tr.h2 th`, BH2 = `${BT} tr.h2 th`
const DROW = `#page-leavewar ${q('bal-row-bane')}`, BROW = q('bal-row-bane')
const deskHeads = [['app', 'APP BAL', 2], ['cf', 'INCL. CARRIED FWD', 3], ['pd', 'PENDING APPROVAL', 4], ['war', 'WAR BAL', 5], ['oil', 'OIL', 6],
  ['ccl', 'CCL', 7], ['fcl', 'FCL', 8], ['pl', 'PL', 9], ['el', 'EL', 10], ['cl', 'CL', 11]]
const deskParts = [
  P('head', "the table's headings", `${DT} thead`, `${BT} thead`, ['place', 'size']),
  P('lve-label', 'the LVE label and its rule', { sel: `${DT} tr.h1 th.span`, nth: 0 }, { sel: `${BT} tr.h1 th.span`, nth: 0 }, ['place', 'size', 'words-place', 'edge', 'colour', 'letters'], { rel: 'head' }),
  P('other-label', 'the OTHER LEAVE label and its rule', { sel: `${DT} tr.h1 th.span`, nth: 1 }, { sel: `${BT} tr.h1 th.span`, nth: 1 }, ['place', 'size', 'words-place', 'edge', 'colour', 'letters'], { rel: 'head' }),
  ...deskHeads.map(([k, words, i]) => P('h-' + k, `the "${words}" heading`, { sel: DH2, nth: i }, { sel: BH2, nth: i }, ['place', 'size', 'words-place', 'text', 'colour', 'letters', 'edge'], { rel: 'head' })),
  P('row', "Ranger's row", DROW, BROW, ['place', 'size']),
  P('app-box', "Ranger's APP BAL box", `${DROW} ${q('bal-LVE-bane')}`, q('bal-LVE-bane'), ['place', 'size', 'words-x', ...LOOK], { rel: 'row' }),
  P('cf-box', "Ranger's carried box", `${DROW} ${q('bal-cf-bane')}`, q('bal-cf-bane'), ['place', 'size', 'words-x', ...LOOK], { rel: 'row' }),
  P('pend-tag', "Ranger's dashed amber pending tag (2.5)", `${DROW} ${q('bal-pend-bane')} .mk-pd`, `${q('bal-pend-bane')} .bp-pdt`, [...TAG, 'words-x'], { rel: 'row' }),
  P('war', "Ranger's WAR BAL figure", `${DROW} ${q('bal-war-bane')}`, q('bal-war-bane'), ['words-place', 'colour', 'letters'], { rel: 'row' }),
  P('oil', "Ranger's OIL figure", `${DROW} ${q('bal-oil-bane')}`, q('bal-oil-bane'), ['place', 'words-place'], { rel: 'row' }),
  ...['CCL', 'FCL', 'PL', 'EL', 'CL'].map(k => P(k.toLowerCase() + '-box', `Ranger's ${k} box`, `${DROW} ${q(`bal-${k}-bane`)}`, q(`bal-${k}-bane`), ['place', 'size', 'words-x', ...LOOK], { rel: 'row' })),
  // the corner tags: the drawing draws them as .mk-badge in each host box, in order CCL, PL, CL
  ...[['CCL', 0], ['PL', 1], ['CL', 2]].map(([k, i]) => P(k.toLowerCase() + '-tag', `Ranger's ${k} corner tag`, { sel: `${DROW} .mk-badge`, nth: i }, q(`bal-opd-${k}-bane`), TAG, { rel: k.toLowerCase() + '-box' })),
]

// ---------------------------------------------------------------- phone: the strip
const DC = '#page-leavewar .bp-cols > span', BC = '.bp-cols > span'
const DPR = `#page-leavewar .bp-row${q('bal-row-bane')}`, BPR = `.bp-row${q('bal-row-bane')}`
const phoneHeads = [['name', 'NAME · GRADE', 0], ['app', 'APP BAL', 1], ['cf', 'CARRIED', 2], ['pd', 'PENDING APPROVAL', 3], ['war', 'WAR BAL', 4], ['oil', 'OIL', 5],
  ['ccl', 'CCL', 6], ['fcl', 'FCL', 7], ['pl', 'PL', 8], ['el', 'EL', 9], ['cl', 'CL', 10]]
const phoneHead = P('cols', 'the headings strip', '#page-leavewar .bp-cols', '.bp-cols', ['place', 'size', 'fill'])
const phoneRow = P('row', "Ranger's row", DPR, BPR, ['place', 'size'])
const phoneHeadPart = ([k, words, i]) => P('h-' + k, `the "${words}" heading`, { sel: DC, nth: i }, { sel: BC, nth: i }, ['place', 'size', 'words-place', 'text', 'colour', 'letters', 'edge'], { rel: 'cols' })
const phoneBox = k => P(k.toLowerCase() + '-box', `Ranger's ${k} box`, `${DPR} ${q(`bal-${k}-bane`)}`, q(`bal-${k}-bane`), ['place', 'size', 'words-x', ...LOOK], { rel: 'row' })
const phoneTag = ([k, i]) => P(k.toLowerCase() + '-tag', `Ranger's ${k} corner tag`, { sel: `${DPR} .mk-badge`, nth: i }, q(`bal-opd-${k}-bane`), TAG, { rel: k.toLowerCase() + '-box' })
const phoneParts = [
  phoneHead, ...phoneHeads.map(phoneHeadPart), phoneRow,
  P('name', "Ranger's name", `${DPR} .bp-name`, `${BPR} .bp-name`, ['place', 'size', 'words-x'], { rel: 'row' }),
  P('app-box', "Ranger's APP BAL box", `${DPR} ${q('bal-LVE-bane')}`, q('bal-LVE-bane'), ['place', 'size', 'words-x', ...LOOK], { rel: 'row' }),
  P('cf-box', "Ranger's carried box", `${DPR} ${q('bal-cf-bane')}`, q('bal-cf-bane'), ['place', 'size', 'words-x', ...LOOK], { rel: 'row' }),
  P('pend-tag', "Ranger's dashed amber pending tag (2.5)", `${DPR} ${q('bal-pend-bane')} .mk-pd`, `${q('bal-pend-bane')} .bp-pdt`, [...TAG, 'words-x'], { rel: 'row' }),
  P('war', "Ranger's WAR BAL figure", `${DPR} ${q('bal-war-bane')}`, q('bal-war-bane'), ['words-place', 'colour', 'letters'], { rel: 'row' }),
  P('oil', "Ranger's OIL figure", `${DPR} ${q('bal-oil-bane')}`, q('bal-oil-bane'), ['place', 'words-place'], { rel: 'row' }),
  ...['CCL', 'FCL', 'PL', 'EL', 'CL'].map(phoneBox),
  ...[['CCL', 0], ['PL', 1], ['CL', 2]].map(phoneTag),
]
// slid to the end: the last kinds, their headings and CL's tag — the drawing's slid picture cut CL's tag at the screen's
// edge; the build keeps 18px at the row's end so it stands whole (a departure named in the build, not yet ruled on)
const slidParts = [
  phoneHead, ...phoneHeads.filter(h => ['pl', 'el', 'cl'].includes(h[0])).map(phoneHeadPart), phoneRow,
  ...['PL', 'EL', 'CL'].map(phoneBox),
  ...[['PL', 1], ['CL', 2]].map(phoneTag),
]

export default {
  name: 'Leave War Balances, option B',
  slug: 'lw-bal-b',
  records: fileURLToPath(new URL('../../../docs/mock/2026-11-17-lw-balances-align/drawcheck/', import.meta.url)),
  states: [
    {
      id: 'bal-desk', title: 'The Balances page, desktop, admin',
      drawing: { script: SCRIPT, shot: 'desk-b' },
      reach: (page, ctx) => open(page, ctx.origin),
      parts: deskParts,
    },
    {
      id: 'bal-phone', title: 'The Balances page, iPhone, admin', phone: true,
      drawing: { script: SCRIPT, shot: 'phone-b' },
      reach: (page, ctx) => open(page, ctx.origin),
      parts: phoneParts,
    },
    {
      id: 'bal-phone-slid', title: 'The Balances page slid to its end, iPhone, admin', phone: true,
      drawing: { script: SCRIPT, shot: 'phone-b-slid' },
      reach: slid,
      parts: slidParts,
    },
  ],
  accepted: [],
}
