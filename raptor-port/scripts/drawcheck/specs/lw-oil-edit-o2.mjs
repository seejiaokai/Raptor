// The drawing check's part list for the OIL tracker's award editor, option 2 (his D2155, 17 Nov 26 — answering D2150):
// one fixed layout — amount, AM, PM, date; then reason and given-by side by side; then Save, Cancel, Delete — the AM / PM
// place left empty (not greyed) when the amount is not a half day, and Delete always as wide as "Really delete?", so
// nothing moves. Three states, each at his iPhone's size and a desktop's: a half day (0.5, AM / PM shown), one day (the
// pair's place empty) and one day with Delete armed ("Really delete?").
// Drawn by docs/mock/2026-11-17-lw-oil-editor/oil.mjs (pictures img/*-o2-*), its layout injected over a vite preview on
// port 4191 of chat 96's worktree; the app code there is main's at 3a51c06a3 (chat 96's branch was cut from it and
// changed no app file), so the drawing is replayed on a build of 3a51c06a3. The script loads Playwright from another
// checkout: record from a copy whose one require line names this checkout's raptor-port/package.json, kept under a path
// ending in docs/mock/2026-11-17-lw-oil-editor/oil.mjs.
// Record (from raptor-port/; the script writes its pictures to its first argument — a scratch folder):
//   DRAWCHECK_SPEC=scripts/drawcheck/specs/lw-oil-edit-o2.mjs DRAWCHECK_DIST=<a build of 3a51c06a3> \
//     DRAWCHECK_ORIGIN=http://localhost:4191 DRAWCHECK_APPROVED=docs/mock/2026-11-17-lw-oil-editor/img \
//     DRAWCHECK_DRAWN_ON='main at 3a51c06a3' node --import ./scripts/drawcheck/record.mjs <copy>/docs/mock/2026-11-17-lw-oil-editor/oil.mjs <scratch>
// Check a build:  node scripts/drawcheck/check.mjs scripts/drawcheck/specs/lw-oil-edit-o2.mjs --dist dist --out <folder>
// THE WORLD: the demo world as it loads, no clock set (the drawing set none; drawn 17 Nov 26), the admin (ad/a), the
// Leave War's first OIL tracker opened and its 18 Apr award (0.5 days) pressed to edit; then 1 typed in the amount; then
// Delete pressed once.
// NOT MEASURED, ON PURPOSE: in the one-day states AM and PM are hidden in both (the drawing's place-holders and the
// build's are visibility: hidden), so they have no box to measure; that their place is kept is checked by the date, the
// reason and given-by, and the buttons standing where the half-day state has them.
import { fileURLToPath } from 'node:url'

const q = t => `[data-testid="${t}"]`
const SCRIPT = 'docs/mock/2026-11-17-lw-oil-editor/oil.mjs'

// the drawing script's own way in (oil.mjs open()), without its injected layout
async function open(page, origin) {
  await page.goto(origin + '/')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForFunction(() => window.CURPAGE === 'leavewar')
  await page.waitForTimeout(1500)
  await page.locator(q('oil-tracker')).first().click()
  await page.waitForTimeout(1200)
  const e = page.locator('[data-testid^="oil-entry-"]', { hasText: '18 Apr' }).first()
  if (!(await e.count())) return 'no 18 Apr award in the first OIL tracker'
  await e.scrollIntoViewIfNeeded(); await e.click(); await page.waitForTimeout(500)
  if (!(await page.locator(q('oil-edit-award')).count())) return 'the award editor did not open on a press of the 18 Apr award'
}
const reach = step => async (page, { origin }) => {
  const r = await open(page, origin); if (r) return r
  if (step === 'half') return
  await page.fill(q('oil-edit-amt'), '1'); await page.waitForTimeout(300)
  if (step === 'one') return
  await page.click('[data-testid^="oil-del-"]'); await page.waitForTimeout(200)
  const t = (await page.locator('[data-testid^="oil-del-"]').first().innerText()).trim()
  if (t !== 'Really delete?') return `Delete did not arm: it reads "${t}"`
}

const P = (name, label, draw, build, check, more = {}) => ({ name, label, draw, build, check, ...more })
const LOOK = ['fill', 'edge', 'corners']
const ED = '#page-leavewar .oil-edit', BE = q('oil-edit-award')
const parts = half => [
  P('editor', 'the editor', ED, BE, ['place', 'size']),
  P('amount', 'the amount box', `${ED} ${q('oil-edit-amt')}`, q('oil-edit-amt'), ['place', 'size', 'words-x', ...LOOK], { rel: 'editor' }),
  ...(half ? [
    P('am', 'AM', `${ED} ${q('oil-edit-half-am')}`, q('oil-edit-half-am'), ['place', 'size', 'words-x', ...LOOK, 'colour', 'text'], { rel: 'editor' }),
    P('pm', 'PM', `${ED} ${q('oil-edit-half-pm')}`, q('oil-edit-half-pm'), ['place', 'size', 'words-x', ...LOOK, 'colour', 'text'], { rel: 'editor' }),
  ] : []),
  P('date', 'the date', `${ED} .oil-dateread`, `${BE} .oil-dateread`, ['place', 'size', 'words-place', 'colour', 'text'], { rel: 'editor' }),
  P('reason', 'the reason box', `${ED} .oil-text:not(.given)`, `${BE} .oil-text:not(.given)`, ['place', 'size', 'words-x', ...LOOK], { rel: 'editor' }),
  P('given-by', 'the given-by box', `${ED} .oil-text.given`, `${BE} .oil-text.given`, ['place', 'size', 'words-x', ...LOOK], { rel: 'editor' }),
  P('save', 'Save', `${ED} ${q('oil-edit-save')}`, q('oil-edit-save'), ['place', 'size', 'words-x', ...LOOK, 'colour', 'text'], { rel: 'editor' }),
  P('cancel', 'Cancel', `${ED} ${q('oil-edit-cancel')}`, q('oil-edit-cancel'), ['place', 'size', 'words-x', ...LOOK, 'colour', 'text'], { rel: 'editor' }),
  P('delete', 'Delete', `${ED} [data-testid^="oil-del-"]`, `${BE} [data-testid^="oil-del-"]`, ['place', 'size', 'words-x', ...LOOK, 'colour', 'text'], { rel: 'editor' }),
]
const state = (dev, step, title) => ({
  id: `oil-${dev}-${step}`, title: `The award editor, ${title}, ${dev === 'phone' ? 'iPhone' : 'desktop'}, admin`, phone: dev === 'phone',
  drawing: { script: SCRIPT, shot: `${dev}-o2-${step === 'armed' ? 'one-armed' : step}` },
  reach: reach(step),
  parts: parts(step === 'half'),
})

export default {
  name: 'Leave War OIL award editor, option 2',
  slug: 'lw-oil-edit-o2',
  origin: 'http://localhost:4191',
  records: fileURLToPath(new URL('../../../docs/mock/2026-11-17-lw-oil-editor/drawcheck/', import.meta.url)),
  states: ['desk', 'phone'].flatMap(dev => [state(dev, 'half', 'a half day'), state(dev, 'one', 'one day'), state(dev, 'armed', 'one day, Delete armed')]),
  accepted: [],
}
