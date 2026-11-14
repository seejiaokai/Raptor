// The drawing check's part list for the Approvals page scrolling inside itself on a PC ([APPROVALS-SCROLL-INSIDE] — his
// D1986, D2006, D2008): pictures 1–4 of docs/superpowers/specs/2026-11-12-approvals-scroll-drawings.md, the desktop's
// "after" — the page fitted to the screen, only its list scrolling under the pinned column headings, "Back to Approvals"
// keeping the place, a short list's card reaching the screen's foot. The drawings were drawn on origin/main at b476db83a
// with the agent's reading laid over the page (an injected stylesheet) by scripts/handpass/appr-scroll-draw.mjs; the phone's
// pictures are "as today" (his choice B) and are proved unchanged by scripts/handpass/appr-phone-same.mjs instead.
// In the drawing the box that scrolls is the list itself (`.appr-list`, the headings its first part); in the build it is
// `.appr-scroll`, holding the headings and the list — the same box on screen, named apart below.
// The drawing's clock was not fixed, so its "since you last looked, <day> <time>" words differ on any replay: the title's
// line is compared by its place, never its words.
// Record the drawings (on origin/main's build at b476db83a, built outside the repo):
//   cd raptor-port ; ONLY=desk APPR_DRAW_OUT=<scratch> DRAWCHECK_SPEC=scripts/drawcheck/specs/appr-scroll.mjs \
//     DRAWCHECK_DIST=<that dist> DRAWCHECK_ORIGIN=http://localhost:4261 \
//     DRAWCHECK_APPROVED=docs/img/mock/2026-11-12-approvals-scroll/raw DRAWCHECK_DRAWN_ON='origin/main at b476db83a' \
//     node --import ./scripts/drawcheck/record.mjs scripts/handpass/appr-scroll-draw.mjs
// Check a build:  node scripts/drawcheck/check.mjs scripts/drawcheck/specs/appr-scroll.mjs --dist dist --out <folder>
import { fileURLToPath } from 'node:url'

const q = t => `[data-testid="${t}"]`
const sleep = ms => new Promise(r => setTimeout(r, ms))
const LW_TODAY = '2026-01-05'
const AP = q('approvals-page')

/* THE DRAWING'S WORLD, through the drawing script's own doors (appr-scroll-draw.mjs stageWorld): an admin's visit first, the
   member's three bids, the admin's six more — 19 lines on Approvals */
async function signIn(page, origin, who) {
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await page.goto(origin + '/')
  await page.waitForSelector('#luser')
  await page.evaluate(t => window.lwSetMemberToday && window.lwSetMemberToday(t), LW_TODAY)
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(t => window.lwSetMemberToday && window.lwSetMemberToday(t), LW_TODAY)
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid^="row-"]', { state: 'attached', timeout: 20000 })
  await sleep(800)
}
const logout = async page => { await page.evaluate(() => document.querySelector('#logout')?.click()); await page.waitForSelector('#luser', { timeout: 15000 }) }
const openApprovals = async page => { await page.locator(q('lw-tab-approvals')).first().click(); await page.waitForSelector(AP, { state: 'visible' }); await sleep(600) }
async function stage(page, origin) {
  await signIn(page, origin, 'admin')
  await openApprovals(page)
  await page.locator(q('lw-tab-grid')).first().click(); await sleep(450)
  await logout(page)
  await signIn(page, origin, 'member')
  const mine = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[data-testid^="row-"]')].map(e => e.dataset.testid.slice(4))
    const dates = ['2026-01-07', '2026-02-11', '2026-03-04']
    for (const id of ids) if (window.lwSetCell(id, dates[0], 'LL')) { dates.slice(1).forEach(d => window.lwSetCell(id, d, 'LL')); return id }
    return null
  })
  if (!mine) return 'the member could place no bid'
  await sleep(500)
  await logout(page)
  await signIn(page, origin, 'admin')
  const placed = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[data-testid^="row-"]')].map(e => e.dataset.testid.slice(4))
    return ['dice', 'shaft', 'snap', 'pump', 'mamba', 'nact'].filter(id => ids.includes(id)).map((id, i) => window.lwSetCell(id, `2026-02-${String(16 + i).padStart(2, '0')}`, i % 2 ? 'CCL' : 'LL'))
  })
  if (placed.filter(Boolean).length !== 6) return `the admin placed ${placed.filter(Boolean).length} of 6 bids`
  await sleep(500)
  await openApprovals(page)
  return null
}
const SC = `${AP} .appr-scroll`
const setList = (page, y) => page.evaluate(([sel, y]) => { document.querySelector(sel).scrollTop = y }, [SC, y])

const top = async (page, { origin }) => stage(page, origin)
/* the drawing's list scrolled 230 inside the page */
const scrolled = async (page, { origin }) => { const w = await stage(page, origin); if (w) return w; await setList(page, 230); await sleep(300) }
/* the drawing's own pick: at 230, the first line wholly in view (60px clear of the headings and the foot) with no new dot,
   approved by the mouse at its own point, then its dates; Back */
async function decideAndOpen(page, origin) {
  const w = await stage(page, origin); if (w) return w
  await setList(page, 230); await sleep(300)
  const ok = await page.evaluate(([AP, SC]) => {
    const ls = [...document.querySelectorAll(`${AP} [data-testid^="appr-line-"]`)]
    const box = document.querySelector(SC).getBoundingClientRect()
    const under = document.querySelector(`${AP} .appr-cols`).getBoundingClientRect().bottom
    const inView = ls.filter(l => { const r = l.getBoundingClientRect(); return r.top > under + 60 && r.bottom < box.bottom - 60 })
    const plain = inView.find(l => !l.querySelector('.appr-dot:not(.none)')) || inView[0]
    if (plain) plain.setAttribute('data-zz-target', '1')
    return !!plain
  }, [AP, SC])
  if (!ok) return 'no line wholly in view at 230'
  const at = async sel => { const r = await page.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.left + Math.min(b.width / 2, 30), y: b.top + b.height / 2 } }, sel); await page.mouse.click(r.x, r.y) }
  await at('[data-zz-target] [data-testid="appr-approve"]'); await sleep(600)
  await at('[data-zz-target] [data-testid="appr-dates"]'); await sleep(1200)
  if (!(await page.locator(q('appr-slim')).count())) return 'no "Back to Approvals" bar after the dates were pressed'
  return null
}
const slim = async (page, { origin }) => decideAndOpen(page, origin)
const back = async (page, { origin }) => { const w = await decideAndOpen(page, origin); if (w) return w; await page.locator(q('appr-back')).first().click(); await sleep(1200) }
const short = async (page, { origin }) => { const w = await back(page, { origin }); if (w) return w; await page.locator(q('appr-m-2026-03')).first().click(); await sleep(600) }

// ---------------------------------------------------------------- the parts
const P = (name, label, draw, build, check, more = {}) => ({ name, label, draw, build, check, ...more })
const pageParts = [
  P('card', 'the card', `${AP} .appr-card`, `${AP} .appr-card`, ['place', 'size', 'fill', 'edge', 'corners']),
  P('title', 'the title line ("Approvals", how many pending, since he last looked)', `${AP} .appr-head`, `${AP} .appr-head`, ['place'], { rel: 'card' }),
  P('chips', 'the chips row (New, the dates, Pick dates…)', `${AP} .appr-filters`, `${AP} .appr-filters`, ['place', 'size'], { rel: 'card' }),
  P('approve-all', 'Approve all', q('appr-approve-all'), q('appr-approve-all'), ['place', 'height', 'fill', 'colour'], { rel: 'card' }),
  P('box', 'the box that scrolls (the headings and the lines)', `${AP} .appr-list`, SC, ['place', 'size'], { rel: 'card' }),
  P('headings', 'the column headings', `${AP} .appr-cols`, `${AP} .appr-cols`, ['place', 'size', 'fill'], { rel: 'card' }),
  P('heading-name', 'the heading NAME', `${AP} .appr-cols > :nth-child(1)`, `${AP} .appr-cols > :nth-child(1)`, ['words-place', 'text', 'colour', 'letters'], { rel: 'headings' }),
  P('heading-avail', 'the heading LOWEST AVAIL', `${AP} .appr-cols > :nth-child(6)`, `${AP} .appr-cols > :nth-child(6)`, ['words-place', 'text'], { rel: 'headings' }),
]
const lineParts = [
  P('line', 'a request\'s line, the first in the list', `${AP} [data-testid^="appr-line-"]`, `${AP} [data-testid^="appr-line-"]`, ['place', 'size'], { rel: 'box' }),
  P('approve', 'its Approve', `${AP} [data-testid^="appr-line-"] [data-testid="appr-approve"]`, `${AP} [data-testid^="appr-line-"] [data-testid="appr-approve"]`, ['place', 'size', 'fill', 'colour'], { rel: 'line' }),
]
const litParts = [
  P('lit', 'the approved line, still lit', '[data-zz-target]', '[data-zz-target]', ['place', 'size'], { rel: 'box' }),
  P('lit-button', 'its lit "Approved"', '[data-zz-target] [data-testid="appr-approve"]', '[data-zz-target] [data-testid="appr-approve"]', ['place', 'size', 'fill', 'text'], { rel: 'lit' }),
]
const slimParts = [
  P('slim', 'the slim "Back to Approvals" bar', q('appr-slim'), q('appr-slim'), ['place', 'size', 'fill', 'edge']),
  P('slim-back', 'its Back', q('appr-back'), q('appr-back'), ['place', 'text', 'colour'], { rel: 'slim' }),
]

const S = 'scripts/handpass/appr-scroll-draw.mjs'
export default {
  name: 'The Approvals page scrolling inside itself on a PC (D1986, D2006, D2008)',
  slug: 'appr-scroll',
  origin: 'http://localhost:4261',
  records: fileURLToPath(new URL('../../../docs/mock/2026-11-12-approvals-scroll/drawcheck/', import.meta.url)),
  states: [
    { id: 'desk-top', title: 'Picture 2 — the page fitted to the screen, the list at its top', drawing: { script: S, shot: 'desk-after-top' }, reach: top, parts: [...pageParts, ...lineParts] },
    { id: 'desk-scrolled', title: 'Picture 1 — the list scrolled 230 inside the page, the window still', drawing: { script: S, shot: 'desk-after-scrolled' }, reach: scrolled, parts: [...pageParts, ...lineParts] },
    { id: 'desk-slim', title: 'Picture 3, left — the grid after the approved request\'s dates, the slim bar', drawing: { script: S, shot: 'desk-after-grid-slimbar' }, reach: slim, parts: slimParts },
    { id: 'desk-back', title: 'Picture 3, right — Back: the same place in the list, the approved line lit', drawing: { script: S, shot: 'desk-after-back' }, reach: back, parts: [...pageParts, ...litParts] },
    { id: 'desk-short', title: 'Picture 4 — a short list (March): the card still reaches the screen\'s foot', drawing: { script: S, shot: 'desk-after-short' }, reach: short, parts: [...pageParts, ...lineParts] },
  ],
  accepted: [],
}
