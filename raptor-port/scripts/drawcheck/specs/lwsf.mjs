// The drawing check's part list for the Leave War small fixes as approved on 4 Nov 26 (his D1629–D1632): the number
// pad's figure box in its top line — highlighted as the pad opens, a typing line once a key is pressed, the line alone
// with nothing typed — and a failed download of the Leave War or the Tracker as a card with Retry, and "Still loading…"
// under the claw on a slow signal. The drawings were drawn on origin/main at 14aaffa8 (no app code changed yet) by
//   scripts/handpass/lwsf-mock-caret.mjs  (p1c-side-open / -typed / -empty, p1c-phone-open / -typed)
//   scripts/handpass/lwsf-mock.mjs        (p2-phone-proposal-failed, p2-desktop-proposal-failed,
//                                          p2-phone-proposal-failed-tracker, p2-*-proposal-still-loading)
// The 'plain' pictures and the script's other pictures are not drawings of record. By his choice the cell over the grid
// does NOT take the drawing's typing line (it keeps its own thin caret), so the cell's inside is not compared.
// Record the drawings (on origin/main's build at 14aaffa8, built outside the repo):
//   cd raptor-port ; LOOK_URL=http://localhost:4197/ LWSF_OUT=<scratch> DRAWCHECK_SPEC=scripts/drawcheck/specs/lwsf.mjs \
//     DRAWCHECK_DIST=<that dist> DRAWCHECK_APPROVED=docs/img/handpass/2026-11-04-lw-small-fixes-mock \
//     DRAWCHECK_DRAWN_ON='origin/main at 14aaffa8' node --import ./scripts/drawcheck/record.mjs scripts/handpass/lwsf-mock-caret.mjs
//   (and the same for scripts/handpass/lwsf-mock.mjs)
// Check a build:  node scripts/drawcheck/check.mjs scripts/drawcheck/specs/lwsf.mjs --dist dist --out <folder>
import { fileURLToPath } from 'node:url'

const q = t => `[data-testid="${t}"]`
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function signIn(page, origin) {
  await page.goto(origin + '/')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await sleep(400)
}

/* THE PAD, reached as lwsf-mock-caret.mjs reached it: FEB, (upright) ▸ Manning, 25 Feb's Req P tapped, 7, Done, then
   tapped again — the pad open on a day that holds a figure. The typing line blinks in the app; the drawing drew it
   steady, as the app draws it for a reader who asked for less motion — so the build is measured with less motion. */
async function openPad(page, origin) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await signIn(page, origin)
  const tap = async sel => { await page.locator(sel).first().tap(); await sleep(650) }
  await page.evaluate(() => window.go('leavewar'))
  await page.locator(q('row-slipway')).waitFor({ timeout: 20000 }); await sleep(500)
  await page.evaluate(() => window.scrollTo(0, 0)); await sleep(200)
  if (await page.locator(q('month-FEB')).count()) await tap(q('month-FEB'))
  if (!(await page.locator('[data-testid^="req-p-"]').count()) && await page.locator(q('counts-toggle')).count()) await tap(q('counts-toggle'))
  const iso = '2026-02-25'
  if (!(await page.locator(q('req-p-' + iso)).count())) return `no Req P cell for ${iso} on this screen`
  const centre = () => page.evaluate(iso => document.querySelector(`[data-testid="req-p-${iso}"]`).scrollIntoView({ block: 'center', inline: 'center' }), iso)
  await centre(); await sleep(350)
  await tap(q('req-p-' + iso)); await tap(q('fly-pad-7')); await tap(q('fly-pad-done'))
  await centre(); await sleep(350)
  await tap(q('req-p-' + iso))
  if (!(await page.locator(q('fly-pad')).count())) return 'the number pad did not open on a tap of 25 Feb\'s Req P'
  return { tap }
}
const padOpen = async (page, { origin }) => { const w = await openPad(page, origin); if (typeof w === 'string') return w }
const padTyped = async (page, { origin }) => { const w = await openPad(page, origin); if (typeof w === 'string') return w; await w.tap(q('fly-pad-9')) }
const padEmpty = async (page, { origin }) => { const w = await openPad(page, origin); if (typeof w === 'string') return w; await w.tap(q('fly-pad-9')); await w.tap(q('fly-pad-back')); await w.tap(q('fly-pad-back')) }

/* THE CARD: the page's own download refused in the test browser, as the drawing script's "today" pictures were */
const failed = (file, pageName) => async (page, { origin }) => {
  await page.context().route(`**/assets/${file}-*.js`, r => r.abort('internetdisconnected'))
  await signIn(page, origin)
  await page.evaluate(p => window.go(p), pageName)
  try { await page.locator(q('page-load-fail')).waitFor({ timeout: 15000 }) } catch { return 'no card came up after the download was refused' }
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = 'none' })
  await sleep(300)
}
/* THE STILL LINE: the Leave War's download held back past 8 s; measured once the line is up (the claw still turning) */
const still = async (page, { origin }) => {
  await page.context().route('**/assets/LeaveWarPage-*.js', async r => { await sleep(40000); try { await r.fallback() } catch {} })
  await signIn(page, origin)
  await page.evaluate(() => window.go('leavewar'))
  try { await page.locator('.pgclaw .pgclaw-still').waitFor({ timeout: 15000 }) } catch { return '"Still loading…" did not come up under the claw within 15 s' }
  await sleep(300)
}

// ---------------------------------------------------------------- the parts
const P = (name, label, draw, build, check, more = {}) => ({ name, label, draw, build, check, ...more })
const LOOK = ['fill', 'edge', 'corners', 'shadow']
const DBOX = '.flypad-day .lwsf-new > span', BBOX = q('fly-pad-fig')
const padParts = [
  P('head', "the pad's top line", '.flypad-hd', '.flypad-hd', ['place', 'size']),
  P('req', 'its "Req P"', '.flypad-hd > b', '.flypad-hd > b', ['place', 'words-place'], { rel: 'head' }),
  /* the day judged by where its WORDS are drawn: the drawing put its box inside the day's own span (30 tall), the build stands
     the box beside it, so the span's own box differs by design while the words sit on the same line (the first check's
     finding 1, an artefact of how the drawing was made — walk-scripts.md §10, words-place) */
  P('day', 'its day, "Wed 25 Feb"', '.flypad-hd .flypad-day', '.flypad-hd .flypad-day', ['words-place'], { rel: 'head' }),
  P('nav', '‹ › Done, together', '.flypad-nav', '.flypad-nav', ['place', 'size'], { rel: 'head' }),
  P('done', 'Done', q('fly-pad-done'), q('fly-pad-done'), ['place', 'size'], { rel: 'head' }),
  P('box', "the figure's box", DBOX, BBOX, ['place', 'size', ...LOOK], { rel: 'head' }),
  P('box-to-done', "the figure's box, measured from Done", DBOX, BBOX, ['place'], { rel: 'done' }),
  P('figure', "the figure's words in the box", DBOX, BBOX, ['words-place', 'text', 'colour', 'letters'], { rel: 'box' }),
]
const highlight = [
  P('highlight', 'the highlight behind the figure (the pad just opened)', `${DBOX} span[style*="color-mix"]`, `${BBOX} .flysel`, ['place', 'size', 'fill', 'corners'], { rel: 'box' }),
]
const typingLine = [
  P('line', 'the typing line', `${DBOX} span[style*="width:2px"]`, `${BBOX} .flycaret`, ['place', 'size', 'fill'], { rel: 'box' }),
]
const DCARD = '.lwsf-new [role=alert]', BCARD = q('page-load-fail')
const cardParts = [
  P('topbar', 'the top bar, kept', '.topbar', '.topbar', ['place', 'size']),
  P('card', 'the card', DCARD, BCARD, ['place', 'width', 'height', ...LOOK], { rel: 'topbar' }),
  P('heading', 'its heading "Couldn\'t open …"', `${DCARD} h2`, `${BCARD} h2`, ['place', 'words-place', 'text', 'colour', 'letters'], { rel: 'card' }),
  P('line', 'its line "It didn\'t download. Check your signal, then retry."', `${DCARD} p`, `${BCARD} p`, ['place', 'words-place', 'text', 'colour', 'letters'], { rel: 'card' }),
  P('retry', 'Retry', `${DCARD} button`, q('page-load-retry'), ['place', 'size', 'fill', 'edge', 'corners', 'text', 'colour', 'letters'], { rel: 'card' }),
  P('retry-words', "Retry's word, inside it", `${DCARD} button`, q('page-load-retry'), ['words-place'], { rel: 'retry' }),
]
const stillParts = [
  P('mark', "the claw's mark", '.pgclaw.lwsf-new .mk', '.pgclaw .mk', ['place', 'size']),
  // the drawing's line is a box as wide as its words, the build's as wide as the screen: judged by its words alone
  P('still', '"Still loading…", under the mark', '.pgclaw.lwsf-new .lwsf-still', '.pgclaw .pgclaw-still', ['words-place', 'text', 'colour', 'letters'], { rel: 'mark' }),
]

const C = 'scripts/handpass/lwsf-mock-caret.mjs', M = 'scripts/handpass/lwsf-mock.mjs'
export default {
  name: 'Leave War small fixes — the pad\'s figure box, a failed download, "Still loading…" (D1629–D1632)',
  slug: 'lwsf',
  records: fileURLToPath(new URL('../../../docs/mock/lwsf/drawcheck/', import.meta.url)),
  states: [
    { id: 'pad-side-open', title: 'The number pad, phone held sideways — just opened on 7, the figure highlighted', phone: true, drawing: { script: C, shot: 'p1c-side-open' }, reach: padOpen, parts: [...padParts, ...highlight] },
    { id: 'pad-side-typed', title: 'The number pad, phone held sideways — 9 typed, the typing line after it', phone: true, drawing: { script: C, shot: 'p1c-side-typed' }, reach: padTyped, parts: [...padParts, ...typingLine] },
    { id: 'pad-side-empty', title: 'The number pad, phone held sideways — nothing typed, the typing line alone', phone: true, drawing: { script: C, shot: 'p1c-side-empty' }, reach: padEmpty, parts: [...padParts, ...typingLine] },
    { id: 'pad-phone-open', title: 'The number pad, iPhone upright — just opened on 7, the figure highlighted', phone: true, drawing: { script: C, shot: 'p1c-phone-open' }, reach: padOpen, parts: [...padParts, ...highlight] },
    { id: 'pad-phone-typed', title: 'The number pad, iPhone upright — 9 typed, the typing line after it', phone: true, drawing: { script: C, shot: 'p1c-phone-typed' }, reach: padTyped, parts: [...padParts, ...typingLine] },
    { id: 'fail-phone', title: 'The Leave War failed to download, iPhone', phone: true, drawing: { script: M, shot: 'p2-phone-proposal-failed' }, reach: failed('LeaveWarPage', 'leavewar'), parts: cardParts },
    { id: 'fail-desk', title: 'The Leave War failed to download, desktop', drawing: { script: M, shot: 'p2-desktop-proposal-failed' }, reach: failed('LeaveWarPage', 'leavewar'), parts: cardParts },
    { id: 'fail-phone-tracker', title: 'The Tracker failed to download, iPhone', phone: true, drawing: { script: M, shot: 'p2-phone-proposal-failed-tracker' }, reach: failed('TrackerPage', 'tracker'), parts: cardParts },
    { id: 'still-phone', title: '"Still loading…" under the claw, iPhone', phone: true, drawing: { script: M, shot: 'p2-phone-proposal-still-loading' }, reach: still, parts: stillParts },
    { id: 'still-desk', title: '"Still loading…" under the claw, desktop', drawing: { script: M, shot: 'p2-desktop-proposal-still-loading' }, reach: still, parts: stillParts },
  ],
  // the differences he has ruled to keep as built. The box is three digits wide from the start so the keys never move
  // (D1634, 4 Nov 26 — "Both as recommended", the page's question 2): 52 wide, not the drawing's 44, and what sits in it
  // starts 4px further right with it. The claw keeps its place over "Still loading…" (the same page, version 3: shown
  // to him as a departure with "say if you want either back as drawn"; he took neither back).
  accepted: [
    ...['pad-side-open', 'pad-side-typed', 'pad-side-empty', 'pad-phone-open', 'pad-phone-typed'].map(state => ({ state, part: 'box', check: 'width', build: 52, why: 'D1634: three digits wide from the start, the keys never move' })),
    ...[['pad-side-open', 'figure', 'words-place', 20.6], ['pad-side-open', 'highlight', 'place', 19.6], ['pad-side-typed', 'figure', 'words-place', 19.1], ['pad-side-typed', 'line', 'place', 30.9], ['pad-side-empty', 'line', 'place', 25.5], ['pad-phone-open', 'figure', 'words-place', 20.6], ['pad-phone-open', 'highlight', 'place', 19.6], ['pad-phone-typed', 'figure', 'words-place', 19.1], ['pad-phone-typed', 'line', 'place', 30.9]]
      .map(([state, part, check, build]) => ({ state, part, check, build, why: 'D1634: the box 8px wider, what sits in it 4px further right with it' })),
    ...[['still-phone', 425.5], ['still-desk', 442.5]].map(([state, build]) => ({ state, part: 'mark', check: 'place', build, why: 'the 4 Nov 26 page v3: the claw keeps its place, the line hangs under it; shown, not taken back' })),
  ],
}
