// The drawing check's part list for a refusal of one change, "Blocked" in the grey note (owner D1667, D1668, 6 Nov 26 —
// "B"; round 2 of docs/mock/2026-11-05-notsaved-refusal/, its `r2grey` pictures). Drawn on 5 Nov 26 by
// scripts/handpass/nsr1105-today.mjs on a frozen build of main at 1f4b9b885 (the branch's base; nothing under src changed
// on the branch before the build), the look laid on the app's own note and tag with the drawing's `nsr-` styles.
// Record the drawings (from raptor-port/; the drawing script writes its pictures under <MG_OUT>/../../../mock/…/img —
// point MG_OUT at a scratch folder four deep, so the approved pictures are never written over):
//   WALK_DIR=<drawing's dist> MG_OUT=<scratch>/a/b/c DRAWCHECK_SPEC=scripts/drawcheck/specs/notsaved-refusal.mjs \
//     DRAWCHECK_DIST=<drawing's dist> DRAWCHECK_ORIGIN=http://localhost:4251 \
//     DRAWCHECK_APPROVED=docs/mock/2026-11-05-notsaved-refusal/img DRAWCHECK_DRAWN_ON='main at 1f4b9b885' \
//     node --import ./scripts/drawcheck/record.mjs scripts/handpass/nsr1105-today.mjs
// Check a build:  node scripts/drawcheck/check.mjs scripts/drawcheck/specs/notsaved-refusal.mjs --dist dist --out <folder>
// HOW THE BUILD GETS THERE. The document's note through the input window's own Document button, the browser's document
// store made to refuse (what a full store does — the drawing's way). The Leave War's tag under a figure box: the store's
// own refusal, reached as the walk reaches it (a member's tab whose Leave War view reads him as an admin, the test
// bridge's lwSetRole — what a role changed from another device does). The two passing notes no control reaches today
// (the figure box's note on leaving, with the drawing's exact words; the schedule's catch-all) are raised through the
// app's own note with the built kind and the drawing's words, as the drawing raised them.
import { fileURLToPath } from 'node:url'

const QUIET = '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}'
const T = id => `[data-testid="${id}"]`
async function signIn(page, origin, user, pass, init) {
  if (init) await page.addInitScript(init)
  await page.goto(origin + '/')
  await page.addStyleTag({ content: QUIET }).catch(() => {})
  await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]'); await page.waitForTimeout(900)
}
/* the store's refusal under Reaper's App bal box (`bal-LVE-dice`), as the walk's S3 reaches it */
async function reachFigTag(page, { origin }) {
  await signIn(page, origin, 'us', 'us')
  await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1500)
  await page.evaluate(() => window.lwSetRole('admin')); await page.waitForTimeout(400)
  await page.locator(T('lw-tab-balances')).first().click(); await page.waitForTimeout(900)
  const bx = page.locator(T('bal-LVE-dice'))
  await bx.scrollIntoViewIfNeeded(); await bx.click(); await bx.fill('7'); await page.keyboard.press('Enter'); await page.waitForTimeout(300)
  if (!(await page.locator(`${T('bal-LVE-dice-err')}.bp-blocked`).isVisible().catch(() => false))) return 'the "Blocked" tag did not show under the figure box'
  /* the drawing pictured the tag with nothing focused over it: its box had been left by a tap on the page */
  await page.locator(T('balances-page')).click({ position: { x: 4, y: 4 } }).catch(() => {})
}
const IDB_REFUSE = () => {
  window.__idbRefuse = false
  const put = IDBObjectStore.prototype.put
  IDBObjectStore.prototype.put = function (...a) { if (window.__idbRefuse) throw new DOMException('The quota has been exceeded (check: forced)', 'QuotaExceededError'); return put.apply(this, a) }
}
async function reachDocument(page, { origin }) {
  await signIn(page, origin, 'us', 'us', IDB_REFUSE)
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(1000)
  await page.locator('#inListBtn').first().click(); await page.waitForTimeout(600)
  await page.locator(T('in-new')).first().click(); await page.waitForTimeout(700)
  await page.evaluate(() => { window.__idbRefuse = true })
  await page.locator('input[type="file"][accept="image/*,application/pdf"]').first().setInputFiles({ name: 'medical-cert.png', mimeType: 'image/png', buffer: Buffer.alloc(2048, 1) })
  await page.waitForTimeout(700)
  if (!(await page.locator('#toastEl[data-face="blocked"]').isVisible().catch(() => false))) return 'the document note did not show'
}
const raised = (where, words) => async (page, { origin }) => {
  await signIn(page, origin, 'ad', 'a')
  if (where === 'balances') {
    await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1500)
    await page.locator(T('lw-tab-balances')).first().click(); await page.waitForTimeout(900)
  } else { await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(1500) }
  await page.evaluate(w => window.toast(w, 'blocked'), words); await page.waitForTimeout(300)
}

const P = (name, label, draw, build, check, more = {}) => ({ name, label, draw, build, check, ...more })
const TAG = T('bal-LVE-dice-err')
const tagParts = [
  P('box', 'the figure box', T('bal-LVE-dice'), T('bal-LVE-dice'), ['size']),
  P('tag', 'the "Blocked" tag', TAG, TAG, ['place', 'size', 'fill', 'edge', 'corners'], { rel: 'box' }),
  P('sign', 'its "no entry" sign', `${TAG} .nsr-sign`, `${TAG} .bk-sign`, ['place', 'size'], { rel: 'tag' }),
  P('word', '"Blocked"', `${TAG} b`, `${TAG} b`, ['place', 'words-place', 'colour', 'letters', 'text'], { rel: 'tag' }),
]
const N = '#toastEl'
const noteParts = [
  P('note', 'the passing note', N, N, ['size', 'fill', 'edge', 'corners']),
  P('sign', 'its "no entry" sign', `${N} .nsr-sign`, `${N} .bk-sign`, ['place', 'size'], { rel: 'note' }),
  P('lead', 'the bold lead', `${N} b`, `${N} b`, ['place', 'words-place', 'colour', 'letters', 'text'], { rel: 'note' }),
  P('rest', 'the quieter rest', `${N} .nsr-rest`, `${N} .bk-rest`, ['place', 'words-place', 'colour', 'letters', 'text'], { rel: 'note' }),
]
const both = (id, title, shot, reach, parts) => [
  { id: `${id}-phone`, title: `${title}, iPhone (WebKit)`, phone: true, engine: 'webkit', drawing: { script: 'scripts/handpass/nsr1105-today.mjs', shot: `${shot}-phone` }, reach, parts },
  { id: `${id}-desk`, title: `${title}, desktop`, drawing: { script: 'scripts/handpass/nsr1105-today.mjs', shot: `${shot}-desk` }, reach, parts },
]

export default {
  name: 'A refusal of one change — "Blocked", the grey note',
  slug: 'notsaved-refusal',
  origin: 'http://localhost:4251',
  records: fileURLToPath(new URL('../../../docs/mock/2026-11-05-notsaved-refusal/drawcheck/', import.meta.url)),
  states: [
    ...both('figbox', 'The figure box\'s "Blocked" tag (Balances, Reaper\'s App bal)', 'R1-figbox-r2grey', reachFigTag, tagParts),
    ...both('figbox-gone', 'A figure box\'s refusal said in the passing note', 'R3c-figbox-gone-r2grey', raised('balances', 'Blocked: Dice LVE App bal. Locked by admin.'), noteParts),
    ...both('document', 'A document too big to store', 'R4c-document-r2grey', reachDocument, noteParts),
    ...both('schedule', 'The schedule\'s refused change', 'R5c-schedule-r2grey', raised('editsched', 'Blocked: nothing was kept'), noteParts),
  ],
  accepted: [],
}
