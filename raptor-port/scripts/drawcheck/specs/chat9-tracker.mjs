// The drawing check's part list for chat 9's Tracker work (scenario S32 of
// docs/superpowers/briefs/2026-11-08-chat9-tracker-scenarios.md; rulings D1790, D1791, D1792 (c)). The approved drawings are
// docs/img/handpass/2026-11-07-pictures-round/, drawn by scripts/handpass/pr-marks.mjs on the app code of main at 6e6c55667:
//   q-trkpop-ph-A-drawn            402 × 874  the marking window after the chart slides the event up
//   q-trkfind-ph-A-drawn           402 × 874  Find put away after ✕ (the drawing pressed Escape; the end state is meant to be the same)
//   q-r5c-pc-restore-drawn         1536 × 864 the Tracker Reorder window's ↺ Restore with the drawn Reset arrow (15px)
//   q-r5c-ph-restore-drawn         402 × 874
// pr-marks.mjs rings the part each picture is about (an outline, never a box change) — only boxes and words are compared.
// Record the drawings (from raptor-port/; DRAWCHECK_DIST serves the drawing's build inside the browser, no server):
//   HP_URL=http://localhost:4291 HP_SHOTS=<scratch> PRM_MEAS=<scratch>/meas.json PRM_ONLY=trkpop,trkfind,r5c \
//   DRAWCHECK_ORIGIN=http://localhost:4291 DRAWCHECK_SPEC=scripts/drawcheck/specs/chat9-tracker.mjs \
//   DRAWCHECK_DIST=<main at 6e6c55667, built> DRAWCHECK_APPROVED=docs/img/handpass/2026-11-07-pictures-round \
//   DRAWCHECK_DRAWN_ON='main at 6e6c55667' node --import ./scripts/drawcheck/record.mjs scripts/handpass/pr-marks.mjs
// Check a build:  node scripts/drawcheck/check.mjs scripts/drawcheck/specs/chat9-tracker.mjs --dist <dist> --out <folder>
import { fileURLToPath } from 'node:url'

const ORIGIN = 'http://localhost:4291'
const sleep = ms => new Promise(r => setTimeout(r, ms))
// the drawing's world (pr-marks.mjs world()): its clock (left running), sign-in as the admin. NO scroll-behavior override:
// the slide is the subject (brief §4), and the drawing's own override only fixes where its scrolls stop.
async function start(page, origin) {
  await page.clock.install({ time: new Date('2026-07-13T09:00:00') })
  await page.goto(origin + '/')
  await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(500)
  await page.addStyleTag({ content: '#toastEl,.toast,.snack,[role=status].toast{display:none!important}' })
}
async function go(page, to) {
  await page.evaluate(p => window.go(p), to)
  await page.waitForFunction(p => window.CURPAGE === p, to); await page.waitForTimeout(400)
}
async function trkOpen(page) {
  await go(page, 'tracker'); await page.waitForSelector('#flowSvg .ball', { state: 'attached', timeout: 20000 }); await sleep(1200)
}
const settle = page => page.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur() })
const noHover = page => page.mouse.move(2, 870).catch(() => {})
const press = async (page, sel, touch) => { const l = page.locator(sel).filter({ visible: true }).first(); if (touch) await l.tap(); else await l.click(); await sleep(500) }
const pressText = async (page, sel, re, touch) => { const l = page.locator(sel).filter({ visible: true, hasText: re }).first(); if (touch) await l.tap(); else await l.click(); await sleep(500) }
const ballAt = (page, id) => page.evaluate(id => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id); if (!g) return null; const r = g.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) } }, id)
async function findType(page, q) {   // the way a phone types into Find (pr-marks.mjs findType)
  await page.evaluate(q => { const i = document.getElementById('hSearch'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, q); i.dispatchEvent(new Event('input', { bubbles: true })) }, q)
  await sleep(700)
}

// ---------------------------------------------------------------- how the build gets to each screen
const reach = {
  // Find (🔍) ACG-09, pick it from the list, tap the ball; let the slide finish and the window settle
  async trkpop(page, { origin }) {
    await start(page, origin); await trkOpen(page)
    await press(page, '#hSearchBtn', true); await sleep(400)
    await findType(page, 'ACG-09')
    if (await page.locator('#hSearchList .findrow').count()) { await page.locator('#hSearchList .findrow').first().tap(); await sleep(1400) }
    else { await page.keyboard.press('Enter'); await sleep(1400) }
    const b = await ballAt(page, 'ACG-09'); if (!b) return 'no ACG-09 ball'
    await page.touchscreen.tap(b.x, b.y); await sleep(2200)
    if (!(await page.evaluate(() => { const p = document.getElementById('pop'); return !!p && getComputedStyle(p).display !== 'none' }))) return 'the marking window did not open'
    await settle(page); await noHover(page); await sleep(400)
  },
  // 🔍, ACG-09, Enter, then ✕ (the drawing pressed Escape): Find put away
  async trkfind(page, { origin }) {
    await start(page, origin); await trkOpen(page)
    await press(page, '#hSearchBtn', true); await sleep(500)
    await findType(page, 'ACG-09'); await page.keyboard.press('Enter'); await sleep(1000)
    await press(page, '#hSearchClear', true); await sleep(800)
    const on = await page.evaluate(() => { const p = document.getElementById('hSearchPanel'); return !!p && p.classList.contains('on') })
    reach.trkfind.panelStillOnAfterX = on     // the table says so; the measuring below shows it too
    await settle(page); await noHover(page)
  },
  // pr-marks.mjs r5c: delete the Tx 2026 syllabus, open Reorder syllabi, its deleted list holds the Restore
  r5c: touch => async (page, { origin }) => {
    await start(page, origin); await trkOpen(page)
    await page.selectOption('#sylSel', { label: 'Tx 2026' }); await sleep(900)
    await press(page, '#sylMenuBtn', touch); await sleep(300)
    await pressText(page, '.menupanel button', /Delete syllabus/, touch); await sleep(500)
    await press(page, '#dlgOk', touch); await sleep(900)
    await press(page, '#sylMenuBtn', touch); await sleep(300)
    await pressText(page, '.menupanel button', /Reorder syllabi/, touch); await sleep(700)
    if (!(await page.evaluate(() => !!document.querySelector('#ordHidden .ordrow button')))) return 'no Restore in the Reorder window'
    await settle(page); await noHover(page)
  },
}

// ---------------------------------------------------------------- the parts
const P = (name, label, draw, build, check, more = {}) => ({ name, label, draw, build, check, ...more })
const RB = '#ordHidden .ordrow button'
const restoreParts = [
  P('restore', 'the Restore button', RB, RB, ['place', 'size']),
  P('arrow', 'its Reset arrow', `${RB} svg.zz-ico`, `${RB} svg`, ['place', 'size']),
  P('word', 'the word "Restore"', RB, RB, ['words-place']),
]
const D = 'scripts/handpass/pr-marks.mjs'

export default {
  name: "Chat 9's Tracker — the marking window's place, Find put away, the Restore button's drawn arrow",
  slug: 'chat9-tracker',
  origin: ORIGIN,
  timezone: 'Asia/Singapore',
  records: fileURLToPath(new URL('../../../docs/img/handpass/2026-11-08-chat9-tracker/drawcheck-records/', import.meta.url)),
  states: [
    { id: 'trkpop-ph', title: "The Tracker's marking window after the chart slides the event up, iPhone", phone: true,
      drawing: { script: D, shot: 'q-trkpop-ph-A-drawn' }, reach: reach.trkpop,
      parts: [
        P('ball', "ACG-09's ball", '#flowSvg .ball[data-id="ACG-09"]', '#flowSvg .ball[data-id="ACG-09"]', ['place']),
        P('pop', 'the marking window', '#pop', '#pop', ['place', 'size']),
        P('tabs', 'the Flow chart · Info · Show All tabs', '#viewtabs', '#viewtabs', ['place']),
      ] },
    { id: 'trkfind-ph', title: 'Find put away after ✕, iPhone', phone: true,
      drawing: { script: D, shot: 'q-trkfind-ph-A-drawn' }, reach: reach.trkfind,
      parts: [
        P('tabs', 'the Flow chart · Info · Show All tabs (shown)', '#viewtabs', '#viewtabs', ['place']),
        // Find's strip itself is not a part: the check can measure only a part that is drawn, and here the strip is gone on
        // BOTH sides (its first run, 8 Nov 26: 0 visible matches each side, read as a false "not found"). Its being put
        // away is shown by the tabs back in their place and the 🔍 back on the bar; reach.trkfind also records whether the
        // strip still wore `.on` after ✕.
        P('btn', 'the 🔍 button', '#hSearchBtn', '#hSearchBtn', ['place']),
      ] },
    { id: 'r5c-pc', title: "The Tracker Reorder window's Restore with the drawn arrow, desktop",
      drawing: { script: D, shot: 'q-r5c-pc-restore-drawn' }, reach: reach.r5c(false), parts: restoreParts },
    { id: 'r5c-ph', title: "The Tracker Reorder window's Restore with the drawn arrow, iPhone", phone: true,
      drawing: { script: D, shot: 'q-r5c-ph-restore-drawn' }, reach: reach.r5c(true), parts: restoreParts },
  ],
  accepted: [],
}
