// The drawing check's part list for the screen after asking for access, "the pass" (owner D1650, D1654, D1656, 5 Nov 26):
// the card as a pass — the claws and a "Waiting for an admin" mark, the callsign large, initials / seat / CAT — a tear
// line, then the three steps, the read-only line, View the schedule, Sign out and "Signed in as …" small at the foot.
// Drawn on the night of 5 Nov 26 (claude/keyboard-windows-batch-5eff45) on a frozen build whose access, save-status and
// sign-in files are as on main at 42df6337b, by scripts/handpass/aw1105-mock.mjs:
//   ONLY=CV → C-diag-phone.png (his pick, the fade over the whole card — his iPhone's 402 × 874 in WebKit)
//   ONLY=C  → C-desk.png (his PC's 1536 in Chromium; drawn BEFORE the fade was settled: its pass top carries the old
//             tint and the card none — the build follows C-diag, so a fill difference of the card and the pass top on the
//             desktop is the drawing's, not a fault)
// Record the drawings (from raptor-port/; the drawing script writes its own pictures under docs/mock/…/img — give the
// approved pictures from a copy elsewhere, and remove what it wrote):
//   ONLY=CV WALK_DIR=<drawing's dist> MG_OUT=<scratch> DRAWCHECK_SPEC=scripts/drawcheck/specs/access-wait.mjs \
//     DRAWCHECK_DIST=<drawing's dist> DRAWCHECK_ORIGIN=http://localhost:4251 DRAWCHECK_APPROVED=<copy of …/img> \
//     DRAWCHECK_DRAWN_ON='main at 42df6337b' node --import ./scripts/drawcheck/record.mjs scripts/handpass/aw1105-mock.mjs
//   (and again with ONLY=C for the desktop)
// Check a build:  node scripts/drawcheck/check.mjs scripts/drawcheck/specs/access-wait.mjs --dist dist --out <folder>
import { fileURLToPath } from 'node:url'

// the drawing's own way there (aw1105-mock.mjs reachWaiting, through aw1105-lib.mjs open / signIn / signOut): the admin
// turns on the guest switch on Admin → Users, signs out; a stranger signs in and asks for access as Stranger / ST /
// Pilot / OCU
const QUIET = '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}'
async function signIn(page, user, pass) {
  await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForTimeout(900)
}
async function signOut(page) {
  const vis = async sel => page.locator(sel).first().isVisible().catch(() => false)
  for (const sel of ['#logout', '#guestOut', '#accOut']) if (await vis(sel)) { await page.locator(sel).first().click(); await page.waitForTimeout(700); return }
  const burger = page.locator('#burger')
  if (await burger.isVisible().catch(() => false)) { await burger.click(); await page.waitForTimeout(400) }
  await page.getByRole('button', { name: /Log ?out|Sign out/i }).first().click()
  await page.waitForTimeout(700)
}
async function reachWaiting(page, { origin }) {
  await page.goto(origin + '/')
  await page.addStyleTag({ content: QUIET }).catch(() => {})
  await signIn(page, 'ad', 'a')
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(400)
  if (!(await page.locator('#admGuestView').isChecked())) await page.locator('#admGuestView').click()
  await page.waitForTimeout(300)
  await signOut(page)
  await signIn(page, 'stranger', 'x')
  if (!(await page.locator('#accCs').count())) return 'the access request form did not open for a stranger signing in'
  await page.fill('#accCs', 'Stranger'); await page.fill('#accIni', 'ST')
  // the drawing's seat came out "Pilot" (its value 'P' did not exist; its fallback took the first seat): picked by its words
  await page.selectOption('#accSeat', { label: 'Pilot' })
  if (await page.locator('#accCat').count()) await page.selectOption('#accCat', 'OCU')
  await page.click('#accSend'); await page.waitForTimeout(900)
  if (!(await page.locator('#accessWaiting').isVisible())) return 'the screen after asking for access did not show after "Send request"'
  await page.addStyleTag({ content: QUIET }).catch(() => {})
}

const P = (name, label, draw, build, check, more = {}) => ({ name, label, draw, build, check, ...more })
const LOOK = ['fill', 'edge', 'corners', 'shadow']
const C = '#accessWaiting .login-card'
const parts = [
  P('card', 'the card (the pass)', C, C, ['place', 'size', ...LOOK]),
  P('pass-top', "the pass's top (the callsign's part)", `${C} .awb-top`, `${C} .pass-top`, ['place', 'size', 'fill'], { rel: 'card' }),
  P('mark-row', "the pass top's mark row", `${C} .awb-row`, `${C} .pass-row`, ['place', 'size'], { rel: 'card' }),
  P('claws', 'the claws', `${C} .awb-row svg`, `${C} .pass-claws`, ['place', 'size'], { rel: 'mark-row' }),
  P('waiting', 'the "Waiting for an admin" mark', `${C} .awb-state`, `${C} .pass-state`, ['place', 'size', 'words-x', ...LOOK, 'colour', 'letters', 'text'], { rel: 'mark-row' }),
  P('callsign', 'the callsign', `${C} .awb-cs`, `${C} .pass-cs`, ['place', 'size', 'words-x', 'colour', 'letters', 'text'], { rel: 'card' }),
  P('fields', 'the three fields (initials, seat, CAT)', `${C} .awb-fields`, `${C} .pass-fields`, ['place', 'size'], { rel: 'card' }),
  ...[1, 2, 3].map(n => P('field-' + n, ['', 'the Initials field', 'the Seat field', 'the CAT field'][n], `${C} .awb-fields > div:nth-child(${n})`, `${C} .pass-fields > div:nth-child(${n})`, ['place', 'size', 'text'], { rel: 'fields' })),
  P('tear', 'the tear line', `${C} .awb-perf`, `${C} .pass-tear`, ['place', 'width', 'edge'], { rel: 'card' }),
  P('steps', 'the steps row', `${C} .aw-steps`, `${C} .pass-steps`, ['place', 'size'], { rel: 'card' }),
  ...[1, 2, 3].map(n => P('step-' + n, ['', 'step 1 "Request sent"', 'step 2 "An admin approves"', 'step 3 "You\'re on the schedule"'][n], `${C} .aw-steps > li:nth-child(${n})`, `${C} .pass-steps > li:nth-child(${n})`, ['place', 'size', 'words-place', 'colour', 'letters', 'text'], { rel: 'steps' })),
  ...[1, 2, 3].map(n => P('dot-' + n, `step ${n}'s dot`, `${C} .aw-steps > li:nth-child(${n}) .aw-dot`, `${C} .pass-steps > li:nth-child(${n}) .pass-dot`, ['place', 'size', ...LOOK], { rel: 'steps' })),
  P('read-only', 'the read-only line', `${C} .awb-bot > p.acc-p`, `${C} .pass-foot > p.acc-p`, ['place', 'size', 'words-x', 'colour', 'text'], { rel: 'card' }),
  P('view', '"View the schedule"', `${C} #accGuest`, `${C} #accGuest`, ['place', 'size', ...LOOK, 'colour', 'text'], { rel: 'card' }),
  P('sign-out', '"Sign out"', `${C} #accOut`, `${C} #accOut`, ['place', 'size', ...LOOK, 'colour', 'text'], { rel: 'card' }),
  P('signed-in-as', '"Signed in as …"', `${C} .awc-who`, `${C} .pass-who`, ['place', 'size', 'words-x', 'colour', 'text'], { rel: 'card' }),
]

export default {
  name: 'The screen after asking for access (the pass)',
  slug: 'access-wait',
  origin: 'http://localhost:4251',
  records: fileURLToPath(new URL('../../../docs/mock/2026-11-05-access-wait/drawcheck/', import.meta.url)),
  states: [
    {
      id: 'pass-phone', title: 'The pass, iPhone (WebKit), a stranger who asked for access', phone: true, engine: 'webkit',
      drawing: { script: 'scripts/handpass/aw1105-mock.mjs', shot: 'C-diag-phone' },
      reach: reachWaiting, parts,
    },
    {
      id: 'pass-desk', title: 'The pass, desktop, a stranger who asked for access',
      drawing: { script: 'scripts/handpass/aw1105-mock.mjs', shot: 'C-desk' },
      reach: reachWaiting, parts,
    },
  ],
  accepted: [
    /* C-desk.png was drawn before his fade was settled; his later rulings put the blue fade from the top left over the WHOLE
       card (D1654, D1656 - the drawing C-diag-phone.png, which the phone state matches with no difference) */
    { state: 'pass-desk', part: 'card', check: 'fill', why: 'D1654, D1656 - the fade from the top left over the whole card (C-diag), drawn after C-desk' },
    { state: 'pass-desk', part: 'pass-top', check: 'fill', why: 'D1654, D1656 - the pass top carries no fill of its own; the card fade shows through it' },
    /* the desktop drawing was taken with the pointer still resting on Sign out (where Request access had been pressed): its
       edges and word colour are the stylesheet's .acc-out:hover look, which the check moves the pointer away from - not a
       difference of design (the drawing check, 5 Nov 26) */
    { state: 'pass-desk', part: 'sign-out', check: 'edge', why: 'the drawing state: Sign out under the resting pointer (its hover look), not a design difference' },
    { state: 'pass-desk', part: 'sign-out', check: 'colour', why: 'the drawing state: Sign out under the resting pointer (its hover look), not a design difference' },
  ],
}
