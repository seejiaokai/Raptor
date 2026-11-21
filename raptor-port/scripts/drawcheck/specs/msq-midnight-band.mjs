// The drawing check's part list for the band at midnight (his D2243 Q7, "as drawn", 20 Nov 26 — the reshape plan §3.2 A-iv,
// §11 A2's band): Ranger has a Leave War window open at 23:58 on Wed 15 Jul with words typed; his move to 149 counts from Thu
// 16 Jul. At midnight the window stays, with one band across its top under its title — the failed-save band's look, "You
// are 149's from today." bold, "This can't be saved in 142's Leave War." quieter — and one button, "Close" (q7b). The
// same across the Tracker's chart editor (Edit chart layout), "…in 142's Tracker." (q7c). On the iPhone the band takes two
// lines.
// Drawn by chat 125 on the app at 19608876a (bundle index-a7kr8dHR.js), by docs/mock/2026-11-20-multi-sqn-reshape/draw.mjs
// (q7): the real window or chart editor at 00:00:30 Thu 16 Jul, then the band CLONED in (the failed-save band's classes),
// "Close" a copy of the window's "Pick a range" chip (the Tracker: its "Merge" button), its look copied → q7b-d.png /
// q7c-d.png (his PC's 1536 × 864, Chromium, 2x) and q7b-p.png / q7c-p.png (his iPhone's 402 × 874, WebKit, touch, 3x).
// The drawing wears a pink outline mark and a "New" tag on the band — an outline, it takes no room and changes no measure;
// the tag's word is not one of the band's words below (the band's own words are checked part by part).
// Built (state/typing-hold.ts, leavewar/ui/Sheet.tsx, tracker/TrackerPage.tsx): reached here as he would — the
// move written into storage at the sign-in card (no screen saves a move yet: setup only, as the drawing did), July opened
// for bidding by Saber, Ranger's window opened and his words typed, then the clock run past midnight: the app's own
// midnight wake raises the band, nothing drawn in.
// Record the drawings (from a checkout of 19608876a, built, so the drawing script's own pictures land there and not in
// this repo; give the approved pictures from a copy elsewhere):
//   DRAWCHECK_SPEC=<this repo>/raptor-port/scripts/drawcheck/specs/msq-midnight-band.mjs DRAWCHECK_RECORDS=<folder> \
//     DRAWCHECK_APPROVED=<copy of docs/mock/2026-11-20-multi-sqn-reshape/img> DRAWCHECK_DRAWN_ON='19608876a (chat 125)' \
//     MQ_ONLY=q7 node --import ./scripts/drawcheck/record.mjs docs/mock/2026-11-20-multi-sqn-reshape/draw.mjs
// Check a build:  node scripts/drawcheck/check.mjs scripts/drawcheck/specs/msq-midnight-band.mjs --dist dist --out <folder>
import { fileURLToPath } from 'node:url'

const QUIET = '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important} #toastEl{display:none !important}'
const MOVE = [{ pid: 'bane', old: 'u142', to: 'u149', from: '2026-07-16' }]
const PASS = { ad: 'a', us: 'us' }
const T = s => new Date(s + '+08:00')

async function writeMove(page) {
  await page.evaluate(ms => {
    let n = 0
    for (const m of ms) {
      const a = 'h' + (Date.now() + (n++)).toString(36) + 'a', b = 'h' + (Date.now() + (n++)).toString(36) + 'b'
      localStorage.setItem('raptor:settings/home:' + a, JSON.stringify({ id: a, pid: m.pid, unit: m.old, from: '2026-01-01' }))
      localStorage.setItem('raptor:settings/home:' + b, JSON.stringify({ id: b, pid: m.pid, unit: m.to, from: m.from }))
    }
  }, MOVE)
  await page.reload(); await page.waitForSelector('#luser', { timeout: 20000 }); await page.waitForTimeout(600)
}
const tap = async (phone, loc) => { if (phone) await loc.tap(); else await loc.click() }
async function login(page, user) {
  await page.waitForSelector('#luser', { timeout: 20000 })
  await page.fill('#luser', user); await page.fill('#lpass', PASS[user])
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await page.waitForTimeout(800)
  await page.addStyleTag({ content: QUIET }).catch(() => {})
}
async function signOut(page, phone) {
  if (phone && await page.locator('#burger:visible').count()) { await page.locator('#burger').tap(); await page.waitForTimeout(500) }
  const b = page.getByRole('button', { name: /sign out|log ?out/i }).first()
  await b.waitFor({ state: 'visible', timeout: 8000 })
  await tap(phone, b)
  await page.waitForSelector('#luser', { timeout: 20000 }); await page.waitForTimeout(700)
}
async function nav(page, phone, pg) {
  if (phone) { await page.locator('#burger').tap(); await page.waitForTimeout(500) }
  await tap(phone, page.locator(`[data-page="${pg}"]:visible`).first())
  await page.waitForFunction(x => window.CURPAGE === x, pg, { timeout: 10000 }).catch(() => {})
  await page.waitForTimeout(1500)
}
async function clockTo(page, iso) {
  const now = await page.evaluate(() => Date.now())
  const ms = T(iso).getTime() - now
  if (ms > 0) await page.clock.fastForward(ms)
  await page.waitForTimeout(1200)
}

async function reachWar(page, { origin, phone }) {
  await page.clock.install({ time: T('2026-07-15T23:54:00') })
  await page.goto(origin + '/')
  await page.waitForSelector('#luser', { timeout: 20000 })
  await writeMove(page)
  /* Saber opens July for bidding (the demo's war is closed for bidding, and a member's window then holds no remarks box) */
  await login(page, 'ad')
  await nav(page, phone, 'leavewar')
  await tap(phone, page.locator('button:visible', { hasText: 'Bidding closed' }).first()); await page.waitForTimeout(900)
  await tap(phone, page.locator('button:visible', { hasText: /^JUL$/ }).first()); await page.waitForTimeout(900)
  const x = page.locator('.bidsheet .x:visible').first(); if (await x.count()) { await tap(phone, x); await page.waitForTimeout(600) }
  await signOut(page, phone); await login(page, 'us')
  await nav(page, phone, 'leavewar')
  /* the drawing's window was on Fri 24 Jul; since the reshape (his Q6, D2243) Ranger's row in 142's war ends at his move,
     so 24 Jul is outside his time there ("gone") and opens nothing: his window that night is on Wed 15 Jul, the one day
     still his in 142's war that bidding has open — the same window, its title's date the one difference (named in the
     report) */
  const c = page.locator('[data-testid="cell-bane-2026-07-15"]').first()
  await c.scrollIntoViewIfNeeded(); await page.waitForTimeout(300); await tap(phone, c); await page.waitForTimeout(1300)
  const WORDS = 'Family wedding in Perth, back Sunday'
  if (phone) await page.evaluate(v => { const el = document.querySelector('#bid-remarks'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })) }, WORDS)
  else await page.fill('#bid-remarks', WORDS)
  await clockTo(page, '2026-07-15T23:58:00')
  if (await page.locator('.bidsheet .saveband').count()) return 'a band showed before midnight'
  await clockTo(page, '2026-07-16T00:00:30')
  try { await page.locator('.bidsheet .saveband.moveband').first().waitFor({ state: 'visible', timeout: 8000 }) } catch { return 'no band across the window after midnight' }
  const st = await page.evaluate(() => ({ val: document.querySelector('#bid-remarks')?.value, head: document.querySelector('.bidsheet-hd')?.innerText.replace(/\s+/g, ' ') }))
  /* the window must still be his; his words are a part measured below (`remarks`), so their loss shows as a difference
     with its picture rather than stopping the check */
  if (!/Ranger/i.test(st.head || '')) return 'premise: the window is gone ' + JSON.stringify(st)
  if (!phone) await page.mouse.move(1, 1)
  await page.evaluate(() => { const a = document.activeElement; if (a && a.blur && a !== document.body) a.blur() })
}

async function reachTracker(page, { origin, phone }) {
  await page.clock.install({ time: T('2026-07-15T23:56:00') })
  await page.goto(origin + '/')
  await page.waitForSelector('#luser', { timeout: 20000 })
  await writeMove(page)
  await login(page, 'us')
  await nav(page, phone, 'tracker'); await page.waitForTimeout(600)
  await tap(phone, page.locator('button[title^="Edit the syllabus"]:visible').first()); await page.waitForTimeout(600)
  await tap(phone, page.locator('text=Edit chart layout').first()); await page.waitForTimeout(1500)
  if (!(await page.locator('#arrTools.on').count())) return 'Edit chart layout did not open'
  await clockTo(page, '2026-07-16T00:00:30')
  try { await page.locator('#page-tracker .saveband.moveband').first().waitFor({ state: 'visible', timeout: 8000 }) } catch { return 'no band across the chart editor after midnight' }
  if (!phone) await page.mouse.move(1, 1)
}

const P = (name, label, draw, build, check, more = {}) => ({ name, label, draw, build, check, ...more })
const LOOK = ['fill', 'edge', 'corners', 'shadow']
const WORDS = ['place', 'words-place', 'colour', 'letters', 'text']
const DB = '.bidsheet .saveband', BB = '.bidsheet .saveband.moveband'
const warParts = [
  P('window', 'the window', '.bidsheet', '.bidsheet', ['place', 'size']),
  P('title', "the window's title strip", '.bidsheet-hd', '.bidsheet-hd', ['place', 'size'], { rel: 'window' }),
  P('band', 'the band', DB, BB, ['place', 'size', ...LOOK], { rel: 'window' }),
  P('sign', 'its warning sign', `${DB} .sv-sign`, `${BB} .sv-sign`, ['place', 'size', 'fill'], { rel: 'band' }),
  P('lead', '"You are 149\'s from today."', `${DB} .sv-msg b`, `${BB} .sv-msg b`, WORDS, { rel: 'band' }),
  P('rest', '"This can\'t be saved in 142\'s Leave War."', `${DB} .sv-rest`, `${BB} .sv-rest`, WORDS, { rel: 'band' }),
  P('close', '"Close"', `${DB} button[data-mine]`, `${BB} button`, ['place', 'size', ...LOOK, 'words-place', 'colour', 'letters', 'text'], { rel: 'band' }),
  P('remarks', 'his typed words, under the band', '#bid-remarks', '#bid-remarks', ['place', 'size'], { rel: 'window' }),
]
const DT = '[data-mqhost] .saveband', BT = '#page-tracker .saveband.moveband'
const trkParts = [
  P('tools', 'the chart editor\'s tools', '#arrTools', '#arrTools', ['place', 'size']),
  P('band', 'the band', DT, BT, ['place', 'size', ...LOOK]),
  P('sign', 'its warning sign', `${DT} .sv-sign`, `${BT} .sv-sign`, ['place', 'size', 'fill'], { rel: 'band' }),
  P('lead', '"You are 149\'s from today."', `${DT} .sv-msg b`, `${BT} .sv-msg b`, WORDS, { rel: 'band' }),
  P('rest', '"This can\'t be saved in 142\'s Tracker."', `${DT} .sv-rest`, `${BT} .sv-rest`, WORDS, { rel: 'band' }),
  P('close', '"Close"', `${DT} button[data-mine]`, `${BT} button`, ['place', 'size', ...LOOK, 'words-place', 'colour', 'letters', 'text'], { rel: 'band' }),
  P('hint', 'the editing hint, under the band', '#arrhint', '#arrhint', ['place', 'size']),
]

export default {
  name: 'The band at midnight (D2243 Q7)',
  slug: 'msq-midnight-band',
  origin: 'http://localhost:4527',
  records: fileURLToPath(new URL('../../../docs/mock/2026-11-20-multi-sqn-reshape/drawcheck/', import.meta.url)),
  states: [
    { id: 'war-desk', title: 'A Leave War window at midnight of his move, desktop, Ranger',
      drawing: { script: 'docs/mock/2026-11-20-multi-sqn-reshape/draw.mjs', shot: 'q7b-d' }, reach: reachWar, parts: warParts },
    { id: 'war-phone', title: 'A Leave War window at midnight of his move, iPhone (WebKit), Ranger', phone: true, engine: 'webkit',
      drawing: { script: 'docs/mock/2026-11-20-multi-sqn-reshape/draw.mjs', shot: 'q7b-p' }, reach: reachWar, parts: warParts },
    { id: 'trk-desk', title: 'The Tracker\'s chart editor at midnight of his move, desktop, Ranger',
      drawing: { script: 'docs/mock/2026-11-20-multi-sqn-reshape/draw.mjs', shot: 'q7c-d' }, reach: reachTracker, parts: trkParts },
    { id: 'trk-phone', title: 'The Tracker\'s chart editor at midnight of his move, iPhone (WebKit), Ranger', phone: true, engine: 'webkit',
      drawing: { script: 'docs/mock/2026-11-20-multi-sqn-reshape/draw.mjs', shot: 'q7c-p' }, reach: reachTracker, parts: trkParts },
  ],
  accepted: [],
}
