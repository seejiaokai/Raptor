// THE WALK of [LW-INPUT-RANGE-WHOLE] (his D1563, D1565) and [LW-OWN-ROW-SELMARK] (his D1568, D1569) — 2 Nov 26, FULL tier.
// Assertions of the RIGHT behaviour (a PASS means correct), so a re-run on a fixed build IS the re-walk (bug-check order §5).
// The built bundle served on PORT (default 4180), the clock held at 20 Jun 26; pictures to OUT (default
// docs/img/handpass/2026-11-02-input-range/walk). Every step's picture is opened by the host.
//   D — desktop 1536, admin (Saber): his own case, Quill's OML 6–9 Jul filed on the Inputs page (the demo's).
//   P — iPhone WebKit 402, admin: the same, a picture right after the tap and settled (§7.10).
//   M — iPhone WebKit 402, member (Ranger): his own entry of several days, on his own row (the heavier mark, D1569).
//   U — the plain-user round (D1557): Grant OIL over the entry, then the OIL tab and the Inputs page looked at; Undo.
// Run from raptor-port/: PORT=4180 node scripts/handpass/lw-input-range-walk.mjs [D|P|M|U ...]
import path from 'node:path'
import { mkdirSync } from 'node:fs'
import { chromium, webkit, devices } from '@playwright/test'

const PORT = process.env.PORT || 4180
const OUT = path.resolve(process.env.OUT || 'docs/img/handpass/2026-11-02-input-range/walk')
mkdirSync(OUT, { recursive: true })
const ONLY = process.argv.slice(2)
const sleep = ms => new Promise(r => setTimeout(r, ms))
const q = t => `[data-testid="${t}"]`
const results = []
const check = (id, ok, what) => { results.push({ id, ok: !!ok, what }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id} — ${what}`) }

async function open(dev, user = 'ad', pass = 'a') {
  const phone = dev === 'phone'
  const b = phone ? await webkit.launch() : await chromium.launch()
  const ctx = phone ? await b.newContext({ ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 3 })
    : await b.newContext({ viewport: { width: 1536, height: 864 } })
  const P = await ctx.newPage()
  const errors = []
  P.on('pageerror', e => errors.push(String(e).slice(0, 160)))
  P.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)) })
  await P.clock.setFixedTime(new Date('2026-06-20T09:00:00+08:00'))
  await P.goto(`http://localhost:${PORT}/?fresh=1`); await P.waitForSelector('#luser')
  await P.fill('#luser', user); await P.fill('#lpass', pass); await P.click('#loginForm button[type=submit]')
  await P.waitForSelector('#vWeek .day', { state: 'attached' })
  await P.evaluate(() => window.go('leavewar')); await P.waitForSelector(q('month-strip'))
  await P.selectOption(q('war-picker'), 'y2026'); await sleep(900)
  await P.locator(q('month-JUL')).click(); await sleep(900)
  return { b, P, phone, errors }
}
const rowOf = (P, name) => P.evaluate(n => {
  for (const td of document.querySelectorAll('td.who')) if (td.innerText.trim().startsWith(n)) { const c = td.closest('tr')?.querySelector('td[data-testid^="cell-"]'); if (c) return c.dataset.testid.replace(/^cell-/, '').slice(0, -11) }
  return null
}, name)
const shot = (P, name) => P.screenshot({ path: path.join(OUT, name + '.png') })
const state = P => P.evaluate(() => {
  const pk = document.querySelector('[data-testid="bid-picker"]')
  const tx = id => pk?.querySelector(`[data-testid="${id}"]`)?.textContent ?? null
  return {
    open: !!pk, list: !!document.querySelector('[data-testid="daylist-sheet"]'),
    when: pk?.querySelector('.bidsheet-hd .when')?.textContent ?? null,
    all: tx('scope-all'), allOn: pk?.querySelector('[data-testid="scope-all"]')?.getAttribute('aria-pressed') ?? null, day: tx('scope-day'),
    range: !!pk?.querySelector('[data-testid="span-range"]'), till: tx('bid-tilldate'),
    leaves: !!pk?.querySelector('[data-testid="bid-leave-grid"]'),
    acts: ['decide-approve', 'decide-refuse', 'decide-shift', 'bid-clear'].filter(t => pk?.querySelector(`[data-testid="${t}"]`)),
    marked: [...document.querySelectorAll('td.selcell')].map(t => t.dataset.testid?.slice(-10)).sort(),
  }
})
async function tapCell(P, phone, id, d) {
  const c = P.locator(`[data-testid="cell-${id}-${d}"]`)
  await P.evaluate(([i, d]) => document.querySelector(`[data-testid="cell-${i}-${d}"]`)?.scrollIntoView({ block: 'center', inline: 'center' }), [id, d]); await sleep(400)
  if (phone) await c.tap(); else await c.click()
}
const JUL = ['2026-07-06', '2026-07-07', '2026-07-08', '2026-07-09']

/* D — the desktop, admin, his case */
async function walkD() {
  const { b, P, errors } = await open('desktop')
  const id = await rowOf(P, 'Quill')
  await tapCell(P, false, id, '2026-07-07'); await sleep(700)
  let s = await state(P)
  await shot(P, 'D1-opened-whole')
  check('D1', s.open && s.when === '6–9 Jul' && s.all === 'All 4 days' && s.allOn === 'true' && s.day === 'Tue 7' && !s.range, `opened whole: "${s.when}", "${s.all}" / "${s.day}", Pick a range ${s.range ? 'shown' : 'gone'}`)
  check('D2', JSON.stringify(s.marked) === JSON.stringify(JUL), `the four days marked: ${s.marked.join(' ')}`)
  check('D3', !s.leaves && s.acts.length === 0, `no leave buttons over a medical, no Approve/Refuse/Move/Delete (${s.acts.join(',') || 'none'})`)
  check('D4', /9 Jul/.test(s.till || ''), `the date after Remarks reads "${s.till}"`)
  await P.locator(q('scope-day')).click(); await sleep(300)
  s = await state(P); await shot(P, 'D5-day-picked')
  check('D5', s.when === 'Tue 7 Jul' && JSON.stringify(s.marked) === '["2026-07-07"]' && /7 Jul/.test(s.till || ''), `the day picked: "${s.when}", marked ${s.marked.join(' ')}, "${s.till}"`)
  await P.locator(q('scope-all')).click(); await sleep(300)
  s = await state(P)
  check('D6', s.when === '6–9 Jul' && s.marked.length === 4, 'back to All: the title and the four days again')
  /* the window's ways out (§7.11 lesson 19): ✕, Escape, a tap outside — gone, and the marks with it */
  await P.locator(q('bid-cancel')).click(); await sleep(300)
  s = await state(P); check('D7', !s.open && s.marked.length === 0, `✕ closes it, the marks go (${s.marked.length} left)`)
  await tapCell(P, false, id, '2026-07-08'); await sleep(600)
  s = await state(P); check('D8', s.open && s.when === '6–9 Jul' && s.day === 'Wed 8', `from another day of it: "${s.when}" / "${s.day}"`)
  await P.keyboard.press('Escape'); await sleep(300)
  s = await state(P); check('D9', !s.open && s.marked.length === 0, 'Escape closes it, the marks go')
  await tapCell(P, false, id, '2026-07-06'); await sleep(600)
  await P.mouse.click(760, 90); await sleep(400)
  s = await state(P); check('D10', !s.open && s.marked.length === 0, 'a tap outside closes it, the marks go')
  /* a one-day entry beside it still opens on its day (his LL on 14 Jul is a war leave — use an empty day's neighbour) */
  await tapCell(P, false, id, '2026-07-14'); await sleep(600)
  s = await state(P); await shot(P, 'D11-war-leave-day')
  check('D11', s.open, `Quill 14 Jul (the LL beside it) opens its own window: "${s.when}"`)
  await P.keyboard.press('Escape'); await sleep(200)
  check('D-err', errors.length === 0, `no page errors (${errors.join(' | ') || 'none'})`)
  await b.close()
}

/* P — the iPhone, admin: the picture right after the tap, and the layout */
async function walkP() {
  const { b, P, errors } = await open('phone')
  const id = await rowOf(P, 'Quill')
  await tapCell(P, true, id, '2026-07-07'); await sleep(90)
  await shot(P, 'P1-just-after-tap')
  await sleep(700)
  const s = await state(P); await shot(P, 'P2-settled')
  check('P1', s.open && s.when === '6–9 Jul' && s.marked.length === 4, `iPhone: opened whole, "${s.when}", ${s.marked.length} marked`)
  const lay = await P.evaluate(() => {
    const pk = document.querySelector('[data-testid="bid-picker"]'), r = pk.getBoundingClientRect()
    const bs = [...pk.querySelectorAll('.bp-dur button')]
    const marked = [...document.querySelectorAll('td.selcell')].map(t => t.getBoundingClientRect())
    return { tops: [...new Set(bs.map(x => Math.round(x.getBoundingClientRect().top)))].length, clipped: bs.filter(x => x.scrollWidth > x.clientWidth + 1).length,
      past: bs.some(x => x.getBoundingClientRect().right > r.right - 4), markedAbove: marked.every(m => m.bottom <= r.top + 1 && m.top >= 0), wide: document.documentElement.scrollWidth > innerWidth + 1 }
  })
  check('P2', lay.tops === 1 && lay.clipped === 0 && !lay.past, `Duration and the choice on one line, nothing cut (${JSON.stringify(lay)})`)
  check('P3', lay.markedAbove, 'the marked days stand in view above the window (D1290)')
  check('P4', !lay.wide, 'no sideways page scroll')
  /* a tap on the page behind the open window (§7.11 lesson 4): another day lights only with its own window */
  const other = await rowOf(P, 'Relay')
  await tapCell(P, true, other, '2026-07-07'); await sleep(700)
  const s2 = await state(P); await shot(P, 'P5-tap-behind')
  check('P5', s2.when !== '6–9 Jul' && !s2.marked.some(d => d !== '2026-07-07'), `a tap on Relay's day: window "${s2.when}", marked ${s2.marked.join(' ')}`)
  check('P-err', errors.length === 0, `no page errors (${errors.join(' | ') || 'none'})`)
  await b.close()
}

/* M — his own row: on the iPhone as an admin (his own case — Saber, his picture of 2 Nov 26), then a member on a desktop with
   July opened for bidding through the app's own "Open for bidding" window and the name badge's switch to the member view
   (D292); a member's tap on a day NOT open for him shows the read-only note, as built (D1177) — so the dates are opened first */
const ownLook = (P, i) => P.evaluate(i => [...document.querySelectorAll(`tr.me td.selcell[data-testid^="cell-${i}-"]`)].map(t => { const c = getComputedStyle(t); return c.backgroundColor + ' ' + c.boxShadow }), i)
async function walkM() {
  {
    const { b, P, errors } = await open('phone')
    const me = await P.evaluate(() => document.querySelector('.mx tbody tr.me td[data-testid^="cell-"]')?.dataset.testid.replace(/^cell-/, '').slice(0, -11))
    check('M0', !!me, `his own row found (${me})`)
    await P.evaluate(p => window.fileInput({ iid: 'walk-cse', person: p, type: 'CSE', date: 'Jul 21', endDate: 'Jul 23', yr: 2026, allday: true, remarks: 'Instructor course' }), me)
    await sleep(500)
    await tapCell(P, true, me, '2026-07-22'); await sleep(90); await shot(P, 'M1-own-row-just-after-tap'); await sleep(700)
    const s = await state(P); await shot(P, 'M2-own-row-whole')
    check('M1', s.open && s.when === '21–23 Jul' && s.all === 'All 3 days', `his own course opened whole on the iPhone: "${s.when}", "${s.all}"`)
    const look = await ownLook(P, me)
    check('M2', look.length === 3 && look.every(l => /0\.34/.test(l) && /2px/.test(l)), `his three days in the heavier mark: ${look[0]}`)
    check('M-err1', errors.length === 0, `no page errors (${errors.join(' | ') || 'none'})`)
    await b.close()
  }
  {
    const { b, P, errors } = await open('desktop')
    const me = await P.evaluate(() => document.querySelector('.mx tbody tr.me td[data-testid^="cell-"]')?.dataset.testid.replace(/^cell-/, '').slice(0, -11))
    await P.locator(q('open-chip')).click(); await sleep(500)
    await P.locator('[data-testid^="od-month-"]', { hasText: /jul/i }).first().click(); await sleep(400)
    await P.locator(q('open-dates-close')).click(); await sleep(400)
    await P.evaluate(p => window.fileInput({ iid: 'walk-cse2', person: p, type: 'CSE', date: 'Jul 21', endDate: 'Jul 23', yr: 2026, allday: true, remarks: 'Instructor course' }), me)
    await P.locator('#roleBadge').click(); await sleep(800)
    const member = await P.evaluate(() => !!document.querySelector('[data-testid="open-chip"]') && !document.querySelector('[data-testid="lw-tab-approvals"]'))
    await tapCell(P, false, me, '2026-07-22'); await sleep(700)
    const s = await state(P); await shot(P, 'M3-member-own-whole')
    check('M3', s.open && s.when === '21–23 Jul' && s.all === 'All 3 days', `the member view (${member ? 'no Approvals tab' : 'Approvals tab still there?'}): his own course opened whole, "${s.when}"`)
    check('M4', !(await P.$(`${q('bid-picker')} ${q('bid-oil')}`)) && s.acts.length === 0, 'no Grant OIL, no Approve/Move/Delete for a member')
    const look = await ownLook(P, me)
    check('M5', look.length === 3 && look.every(l => /0\.34/.test(l) && /2px/.test(l)), `his three days in the heavier mark on a desktop: ${look[0]}`)
    check('M-err2', errors.length === 0, `no page errors (${errors.join(' | ') || 'none'})`)
    await b.close()
  }
}

/* U — the plain-user round: Grant OIL over his whole OML, then where it should show; Undo takes it all back */
async function walkU() {
  const { b, P, errors } = await open('desktop')
  const id = await rowOf(P, 'Quill')
  const fo = () => P.evaluate(([i, ds]) => ds.map(d => /FO/.test(document.querySelector(`[data-testid="cell-${i}-${d}"]`)?.textContent || '')), [id, JUL])
  check('U0', (await fo()).every(x => !x), 'no FO on his four days to start')
  await tapCell(P, false, id, '2026-07-07'); await sleep(600)
  await P.locator(`${q('bid-picker')} ${q('bid-oil')}`).click(); await sleep(300)
  await P.fill(q('oil-why'), 'Recalled for a flypast'); await P.locator(q('oil-give')).click(); await sleep(800)
  const after = await fo(); await shot(P, 'U1-four-FO')
  check('U1', after.every(Boolean) && !(await state(P)).open, `Grant OIL on All: FO on each of the four days (${after.join(',')}), the window closed`)
  /* the day tapped again now holds the award too: the day's list (D1466) */
  await tapCell(P, false, id, '2026-07-07'); await sleep(600)
  const s = await state(P); await shot(P, 'U2-day-list')
  check('U2', s.list && !s.open, 'a day of it holding the award opens the day\'s list')
  await P.keyboard.press('Escape'); await sleep(300)
  /* the OIL tracker — where his OIL is read — carries the four awards on Quill's row; its own ✕ closes it onto the grid */
  await P.locator(q('oil-tracker')).first().click(); await sleep(1200)
  const qrow = await P.evaluate(() => {
    const hits = [...document.querySelectorAll('[data-testid^="oil-entry-"]')].filter(e => /Recalled for a flypast/.test(e.textContent || ''))
    hits[0]?.scrollIntoView({ block: 'center' })
    /* each card's text runs its amount straight into its date — "+16 Jul" is +1 on 6 Jul */
    return hits.map(e => (e.textContent.match(/\+1(\d{1,2} Jul)/) || ['', '?'])[1]).join(',')
  })
  await sleep(300); await shot(P, 'U3-oil-tracker-quill')
  check('U3', qrow === '6 Jul,7 Jul,8 Jul,9 Jul', `the OIL tracker: Quill's credits "Recalled for a flypast" on ${qrow}`)
  await P.locator(q('oil-close')).click(); await sleep(600)
  const back = await P.evaluate(() => !document.querySelector('[data-testid="oil-close"]') && !!document.querySelector('td[data-testid^="cell-"]'))
  check('U3b', back, 'its ✕ closes it onto the grid')
  /* Undo — the top bar's — takes the four back in one step */
  await P.locator('#undoBtn, [data-testid="undo"], button[aria-label^="Undo"]').first().click(); await sleep(800)
  const undone = await fo(); await shot(P, 'U4-undone')
  check('U4', undone.every(x => !x), `one Undo takes all four back (${undone.join(',')})`)
  /* the designer's 2: a filing over the whole entry is ONE Undo step — a CSE pressed on All over Relay's OD of four days */
  const rid = await rowOf(P, 'Relay')
  const D2 = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16']
  await P.evaluate(p => window.fileInput({ iid: 'walk-od', person: p, type: 'OD', date: 'Jul 13', endDate: 'Jul 16', yr: 2026, allday: true, remarks: 'Exercise' }), rid); await sleep(500)
  const cse = () => P.evaluate(([i, ds]) => ds.map(d => /CSE/.test(document.querySelector(`[data-testid="cell-${i}-${d}"]`)?.textContent || '')), [rid, D2])
  await tapCell(P, false, rid, '2026-07-14'); await sleep(600)
  const so = await state(P); await shot(P, 'U6-od-whole')
  check('U6', so.when === '13–16 Jul' && so.leaves, `Relay's OD opened whole, leave buttons there (over an OD): "${so.when}"`)
  await P.locator(`${q('bid-picker')} ${q('bid-file-CSE')}`).click(); await sleep(800)
  const c1 = await cse(); await shot(P, 'U7-cse-four')
  check('U7', c1.every(Boolean), `CSE on All: filed on each of the four days (${c1.join(',')})`)
  await P.locator('#undoBtn, [data-testid="undo"], button[aria-label^="Undo"]').first().click(); await sleep(800)
  const c2 = await cse()
  check('U8', c2.every(x => !x), `one Undo takes the four CSE back (${c2.join(',')})`)
  await P.locator('#redoBtn, [data-testid="redo"], button[aria-label^="Redo"]').first().click(); await sleep(800)
  const c3 = await cse(); await shot(P, 'U9-redo')
  check('U9', c3.every(Boolean), `one Redo brings all four back (${c3.join(',')})`)
  /* the Inputs page: his OML unchanged */
  await P.evaluate(() => window.go('inputs')); await sleep(900)
  await shot(P, 'U5-inputs-page')
  check('U-err', errors.length === 0, `no page errors (${errors.join(' | ') || 'none'})`)
  await b.close()
}

for (const [k, f] of [['D', walkD], ['P', walkP], ['M', walkM], ['U', walkU]]) {
  if (ONLY.length && !ONLY.includes(k)) continue
  // eslint-disable-next-line react-doctor/async-await-in-loop -- one walk after another, each in its own browser
  try { await f() } catch (e) { check(`${k}-crash`, false, String(e).slice(0, 300)) }
}
const fails = results.filter(r => !r.ok)
console.log(`\n${results.length - fails.length}/${results.length} PASS`)
process.exit(fails.length ? 1 : 0)
