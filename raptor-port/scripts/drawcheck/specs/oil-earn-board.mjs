// The drawing check's part list for OIL Earn on the Scheduler Board — the pictures round's group 2 (his "All as
// recommended", 8 Nov 26): D1782 the day's switch "No OIL earned" (drawing A of question 3), D1783 a tap on a puck that
// cannot earn says why in the plain passing note (drawing A of question 4), D1793 the phone day bar's two marks (round 5
// (e)). Drawn the night of 7–8 Nov 26 by scripts/handpass/pr-board.mjs (q3, q4) and scripts/handpass/pr-marks.mjs (r5e) on
// main; main's app code is unchanged from 549482bd5 (this branch's base) to a6265cae0, so the drawings are replayed on a
// build of 549482bd5 — the app as it was drawn on.
// Record the drawings (from raptor-port/; the drawing scripts write their pictures to HP_SHOTS — a scratch folder, so the
// approved pictures are never written over):
//   HP_URL=http://localhost:4291 HP_SHOTS=<scratch> PRB_ONLY=q3,q4 DRAWCHECK_SPEC=scripts/drawcheck/specs/oil-earn-board.mjs \
//     DRAWCHECK_DIST=<a build of 549482bd5> DRAWCHECK_ORIGIN=http://localhost:4291 \
//     DRAWCHECK_APPROVED=docs/img/handpass/2026-11-07-pictures-round DRAWCHECK_DRAWN_ON='main at 549482bd5' \
//     node --import ./scripts/drawcheck/record.mjs scripts/handpass/pr-board.mjs
//   … the same with PRM_ONLY=r5e and scripts/handpass/pr-marks.mjs
// Check a build:  node scripts/drawcheck/check.mjs scripts/drawcheck/specs/oil-earn-board.mjs --dist dist --out <folder>
// HOW THE BUILD GETS THERE: as the drawing did — Saturday 18 Jul (day 5) on the board, the clock at Mon 13 Jul 09:00,
// OIL Earn on through its own button; the switch pressed through its own label; the SDO desk's END box cleared through
// the board's own box and the inert puck tapped (the drawing raised the note by hand; the build must raise it itself).
import { fileURLToPath } from 'node:url'

const sleep = ms => new Promise(r => setTimeout(r, ms))
const SAT = 5
const BAR = '#schedBoard .daybar'
async function open(page, origin, di) {
  await page.context().clock.install({ time: new Date('2026-07-13T09:00:00') })
  await page.goto(origin + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto!important}' }).catch(() => {})
  await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(500)
  await page.evaluate(() => window.go('editsched')); await page.waitForFunction(() => window.CURPAGE === 'editsched'); await sleep(400)
  await page.evaluate(d => window.openScheduler(d), di)
  await page.waitForSelector('#schedBoard'); await sleep(800)
}
const press = async (page, sel, phone) => { const l = page.locator(sel).filter({ visible: true }).first(); if (phone) await l.tap(); else await l.click() }
async function oilOn(page, phone) {
  await press(page, (await page.locator('#sbOil').filter({ visible: true }).count()) ? '#sbOil' : '#schedBoard [data-oilmode]', phone)
  await sleep(700)
  if (!(await page.evaluate(() => !!document.querySelector('#schedBoard .daybar.oilon')))) throw new Error('OIL Earn did not come on')
}
// on a phone the drawing stood the bar 40px under the board's top (its scrolling list scrolled)
const standAt = (page, sel, y) => page.evaluate(([sel, y]) => {
  const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().height > 0)
  let s = e.parentElement; while (s && !(s.scrollHeight > s.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(s).overflowY))) s = s.parentElement
  s = s || document.scrollingElement
  s.scrollTop += e.getBoundingClientRect().top - y
}, [sel, y])
const blur = page => page.evaluate(() => { const a = document.activeElement; if (a && a.blur) a.blur() })

const reachSwitch = on => async (page, { origin, phone }) => {
  await open(page, origin, SAT)
  await oilOn(page, phone)
  if (on) {
    await press(page, `${BAR} label.lgmix`, phone); await sleep(600)
    if (!(await page.evaluate(() => document.querySelector('#schedBoard .daybar input[data-oilblank]')?.checked))) return 'the switch did not come on'
  }
  if (phone) { const tb = await page.evaluate(() => document.querySelector('.sb-top').getBoundingClientRect().bottom); await standAt(page, BAR, tb + 40); await sleep(300) }
  await blur(page)
}
const reachInert = async (page, { origin, phone }) => {
  await open(page, origin, SAT)
  // Saturday's SDO desk (Fable) loses its END time through the board's own box: no OIL can be worked out (D360)
  const box = page.locator('[data-bfld="dr:5.0.0.end"]').filter({ visible: true }).first()
  await box.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  if (phone) await box.evaluate(e => { e.focus(); e.value = ''; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); e.blur() })
  else { await box.click(); await page.keyboard.press('Backspace'); await page.keyboard.press('Tab') }
  await sleep(600)
  if ((await page.evaluate(() => window.DAYS[5].dutywaves[0].rows[0].end)) !== '') return 'the SDO desk kept its end time'
  await oilOn(page, phone)
  await standAt(page, '#schedBoard .oilpk.inert', 640); await sleep(300)
  await press(page, '#schedBoard .oilpk.inert', phone); await sleep(350)
  /* a picked man's pucks wear `.sel` (ui/highlights.ts); the app keeps its selection off `window`, so an earlier
     `window.SELID` read here always passed (found 8 Nov 26) */
  if (await page.evaluate(() => !!document.querySelector('#schedBoard .puck.sel'))) return 'the tap picked the man'
}
const reachMarks = async (page, { origin }) => {
  await open(page, origin, SAT)
  await blur(page)
}

const P = (name, label, draw, build, check, more = {}) => ({ name, label, draw, build: build ?? draw, check, ...more })
const SW = `${BAR} label.lgmix`
const switchParts = on => [
  P('bar', 'the day bar', BAR, null, ['size']),
  P('switch', 'the switch with its words', SW, null, ['place', 'size', 'words-place', 'colour', 'letters', 'text'], { rel: 'bar' }),
  P('slider', 'the slider', `${SW} input`, null, ['place', 'size', 'fill', 'edge', 'corners'], { rel: 'bar' }),
  P('done', '"✓ OIL done"', `${BAR} [data-oilmode]`, null, ['place', 'size', 'text'], { rel: 'bar' }),
  ...(on ? [P('note', 'the note under the bar', `${BAR} .daybar-note`, null, ['place', 'size', 'words-place', 'colour', 'letters', 'text'], { rel: 'bar' })] : []),
]
const inertParts = [
  P('puck', 'the puck that cannot earn', '#schedBoard .oilpk.inert .puck', null, ['size', 'fill', 'edge']),
  P('note', 'the passing note', '#toastEl', null, ['place', 'size', 'fill', 'edge', 'corners', 'words-place', 'colour', 'letters', 'text']),
]
const MB = `${BAR} .gctl`
const markParts = [
  P('bar', 'the day bar', BAR, null, ['size']),
  P('tpl', 'Templates', `${MB} [data-daytpladd]`, null, ['place', 'size', 'words-place', 'text'], { rel: 'bar' }),
  P('tplmark', "Templates' mark", `${MB} [data-daytpladd] svg.zz-ico`, `${MB} [data-daytpladd] svg.btnglyph`, ['place', 'size'], { rel: 'tpl' }),
  P('oil', 'OIL Earn', `${MB} [data-oilmode]`, null, ['place', 'size', 'words-place', 'text'], { rel: 'bar' }),
  P('oilmark', "OIL Earn's mark", `${MB} [data-oilmode] svg.zz-ico`, `${MB} [data-oilmode] svg.btnglyph`, ['place', 'size'], { rel: 'oil' }),
]
const BOARD = 'scripts/handpass/pr-board.mjs', MARKS = 'scripts/handpass/pr-marks.mjs'
const two = (id, title, shot, reach, parts) => [
  { id: `${id}-phone`, title: `${title}, phone`, phone: true, drawing: { script: BOARD, shot: `${shot}-phone` }, reach, parts },
  { id: `${id}-desk`, title: `${title}, desktop`, drawing: { script: BOARD, shot: `${shot}-desk` }, reach, parts },
]

export default {
  name: 'OIL Earn on the Scheduler Board — the day switch, a tap that cannot earn, the phone bar\'s marks',
  slug: 'oil-earn-board',
  origin: 'http://localhost:4291',
  records: fileURLToPath(new URL('../../../docs/img/handpass/2026-11-07-pictures-round/drawcheck/', import.meta.url)),
  states: [
    ...two('switch-off', 'OIL Earn on Saturday, the day switch off (D1782)', 'q-oilswitch-a-off', reachSwitch(false), switchParts(false)),
    ...two('switch-on', 'OIL Earn on Saturday, the day switch on (D1782)', 'q-oilswitch-a-on', reachSwitch(true), switchParts(true)),
    ...two('inert', 'A tap on a puck that cannot earn (D1783)', 'q-inert-a', reachInert, inertParts),
    { id: 'marks-phone', title: 'The phone day bar\'s marks (D1793)', phone: true, drawing: { script: MARKS, shot: 'q-r5e-ph-drawn' }, reach: reachMarks, parts: markParts },
  ],
  accepted: [],
}
