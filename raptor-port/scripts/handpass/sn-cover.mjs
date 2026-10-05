/* [SAVE-NOTE-COVERS] (D586, 5 Oct 26) — WHAT DOES THE "NOT SAVED — RETRY" NOTE SIT ON?
   Drives the built app in a real browser. On every page, at phone and desktop sizes, at the top of the page and
   scrolled, with a failed save showing: finds what lies UNDER the note (asked pixel by pixel with the note taken away
   for the moment of the question), and for each control found there says how much of it the note hides and whether a
   press on it lands on the control, on Retry, or on something else. Then it PRESSES the note's own Retry for real.

   Written as assertions of the RIGHT behaviour — a PASS means the note covers no control and Retry works — so the
   same run on the fixed build is the re-walk (bug-check-order §5).

   THE ONE THING IT DOES THAT A PERSON CANNOT: it makes the browser's storage refuse every write
   (Storage.prototype.setItem throws a QuotaExceededError), as a full disk or a locked-down browser does for real, and
   makes one change through the app's one write path so there is something to save. It is put back for the Retry step.

     HP_URL=http://localhost:4173 HP_SHOTS=<dir> [SN_CSS=<file of candidate CSS> SN_JS=<file of candidate script>] node scripts/handpass/sn-cover.mjs

   SN_CSS, when given, is added to the page as a style sheet: a PROPOSAL shown on the real app before any source
   changes (D541, D586). Without it the run is the app as built. */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
import { login, go, BASE, SHOTS } from './lib.mjs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const CSS = process.env.SN_CSS ? readFileSync(process.env.SN_CSS, 'utf8') : ''
const JS = process.env.SN_JS ? readFileSync(process.env.SN_JS, 'utf8') : ''
const ONLY = (process.env.SN_ONLY || '').split(',').filter(Boolean)
mkdirSync(SHOTS, { recursive: true })
const sleep = ms => new Promise(r => setTimeout(r, ms))

const SIZES = [
  { name: 'phone-390', width: 390, height: 844, touch: true },
  { name: 'phone-320', width: 320, height: 568, touch: true },
  { name: 'phone-side', width: 844, height: 390, touch: true },   // a phone on its side: a short screen, a three-line bar
  { name: 'desk-1200', width: 1200, height: 800 },
  { name: 'desk-1366', width: 1366, height: 800 },
  { name: 'desk-1440', width: 1440, height: 900 },
].filter(s => !ONLY.length || ONLY.includes(s.name))
/* SN_WHO=us walks the member's pages (no Edit Schedule, no Admin). The sign-in is the admin's, so the one change that
   makes a save fail can be made; the role is then changed IN PLACE through the localhost bridge (bug-check-order §7.7 —
   a second sign-in would reload the page and lose the failed state) */
const WHO = process.env.SN_WHO === 'us' ? 'us' : 'a'
const PAGES = WHO === 'a' ? ['viewsched', 'editsched', 'inputs', 'quals', 'logic', 'leavewar', 'tracker', 'help', 'admin'] : ['viewsched', 'inputs', 'quals', 'logic', 'leavewar', 'tracker', 'help']
/* SN_PICS=top keeps one picture per page (the top of the page) — few enough to open every one */
const PICS_TOP_ONLY = process.env.SN_PICS === 'top'

/* what lies under the note, and where a press on each thing lands */
const under = page => page.evaluate(() => {
  const note = document.querySelector('.topbar > .savestat')
  if (!note) return { note: null }
  const nr = note.getBoundingClientRect()
  const retry = note.querySelector('button')
  const rr = retry ? retry.getBoundingClientRect() : null
  const name = e => (e.getAttribute('aria-label') || e.getAttribute('title') || (e.textContent || '').trim().replace(/\s+/g, ' ') || e.getAttribute('placeholder') || e.id || e.className || e.tagName).toString().slice(0, 40)
  /* the nearest thing a person can press: a real control, or anything the app draws a hand over */
  const control = e => {
    for (let n = e; n && n !== document.body; n = n.parentElement) {
      if (n.matches('button, a[href], input, select, textarea, summary, label, [role="button"], [role="tab"], [role="link"], [tabindex]:not([tabindex="-1"]), [contenteditable="true"]')) return n
      if (getComputedStyle(n).cursor === 'pointer') return n
    }
    return null
  }
  /* is the note itself what a person sees at its own middle? (a window, a drawer or the board may lie over it) */
  const pe = note.style.pointerEvents; note.style.pointerEvents = 'auto'
  const top = document.elementFromPoint(nr.left + nr.width / 2, nr.top + nr.height / 2)
  note.style.pointerEvents = pe
  const seen = !!top && note.contains(top) && nr.width > 0 && nr.top >= 0 && nr.left >= 0 && nr.right <= innerWidth && nr.bottom <= innerHeight
  const found = new Map()
  /* the note is taken away ONCE and every spot asked, then put back and the same spots asked again — one layout each
     way, not two per spot (a full-width band has some three thousand spots) */
  const spots = []
  for (let y = nr.top + 2; y <= nr.bottom - 2; y += 4) for (let x = nr.left + 2; x <= nr.right - 2; x += 4) spots.push([x, y])
  const vis = note.style.visibility
  note.style.visibility = 'hidden'
  const belows = spots.map(([x, y]) => document.elementFromPoint(x, y))
  note.style.visibility = vis
  for (let i = 0; i < spots.length; i++) {
    const [x, y] = spots[i], below = belows[i]
    const c = below && control(below)
    if (!c || note.contains(c)) continue
    const now = document.elementFromPoint(x, y)
    const lands = now && (c === now || c.contains(now)) ? 'itself' : now && retry && retry.contains(now) ? 'RETRY' : 'other'
    const k = found.get(c) || { name: name(c), tag: c.tagName.toLowerCase(), id: c.id || '', pts: 0, itself: 0, retry: 0, other: 0 }
    k.pts++; k[lands === 'itself' ? 'itself' : lands === 'RETRY' ? 'retry' : 'other']++
    found.set(c, k)
  }
  const out = []
  for (const [c, k] of found) {
    const r = c.getBoundingClientRect()
    const ix = Math.max(0, Math.min(r.right, nr.right) - Math.max(r.left, nr.left)), iy = Math.max(0, Math.min(r.bottom, nr.bottom) - Math.max(r.top, nr.top))
    k.hidden = Math.round(100 * ix * iy / Math.max(1, r.width * r.height))
    /* a press on the control's own middle: where does it land? */
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2
    const mid = document.elementFromPoint(cx, cy)
    k.middle = mid && (c === mid || c.contains(mid)) ? 'itself' : mid && retry && retry.contains(mid) ? 'RETRY' : mid && note.contains(mid) ? 'note' : 'other'
    k.box = [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]
    out.push(k)
  }
  const bar = document.querySelector('.topbar').getBoundingClientRect()
  return { note: [Math.round(nr.left), Math.round(nr.top), Math.round(nr.width), Math.round(nr.height)], retry: rr && [Math.round(rr.left), Math.round(rr.top), Math.round(rr.width), Math.round(rr.height)],
    text: note.textContent, seen, barBottom: Math.round(bar.bottom), under: out, sideways: document.documentElement.scrollWidth > innerWidth }
})

const results = [], errors = []
let fails = 0
const line = (ok, what, detail = '') => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + what + (detail ? '  ' + detail : '')) }

for (const size of SIZES) {
  const browser = await chromium.launch({ headless: true, ...launchOptions })
  const ctx = await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 2, hasTouch: !!size.touch })
  const page = await ctx.newPage()
  page.on('console', m => { if (m.type() === 'error' && !/quota/i.test(m.text())) errors.push(size.name + ' ' + m.text()) })
  page.on('pageerror', e => errors.push(size.name + ' PAGEERROR ' + e.message))
  await page.goto(BASE + '/')   // NOT ?fresh=1: that mode keeps everything in memory, so no save can fail
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' + CSS })
  await login(page, 'a')
  if (JS) await page.addScriptTag({ content: JS })
  const press = async (x, y) => { if (size.touch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y); await sleep(250) }

  /* the Tracker shows ✓ Save changes only with an unsaved chart edit — make one, the way a person does */
  let trackerEdit = false
  try {
    await go(page, 'tracker'); await sleep(900)
    const t = async sel => { const l = page.locator(sel + ':visible').first(); await l.click({ timeout: 4000 }); await sleep(300) }
    await t('#sylMenuBtn'); await t('#arrangeBtn')
    /* on a short screen the tools fold behind "Tools ▾" (D373) */
    const add = page.locator('#arrTools button', { hasText: '+ Test' }).first()
    if (!(await add.isVisible())) { await page.locator('#page-tracker button', { hasText: 'Tools ▾' }).first().click({ timeout: 4000 }); await sleep(300) }
    await add.click({ timeout: 4000 }); await sleep(300)
    await page.locator('#dlgInput').first().click(); await page.keyboard.type('SN-TEST', { delay: 20 }); await t('#dlgOk')
    await t('#sylMenuBtn'); await t('#arrangeBtn')
    trackerEdit = await page.evaluate(() => [...document.querySelectorAll('#page-tracker header button')].some(b => /Save changes/.test(b.textContent || '') && b.getClientRects().length > 0))
  } catch (e) { errors.push(size.name + ' tracker set-up: ' + String(e.message).split('\n')[0]) }
  console.log(`NOTE ${size.name}: the Tracker's "✓ Save changes" is showing: ${trackerEdit}`)

  /* storage refuses every write; one change through the app's write path; the note turns to "Not saved — Retry" */
  await go(page, 'viewsched')
  await page.evaluate(() => {
    window.__lsSetWas = Storage.prototype.setItem
    Storage.prototype.setItem = function () { throw new DOMException('The quota has been exceeded (walk: forced)', 'QuotaExceededError') }
    const w = window
    w.fillSlot('1.0.0.0.p', w.DAYS[1].waves[0].formations[0].aircraft[0].p === 'casper' ? 'bane' : 'casper'); w.afterSchedMutate()
  })
  await page.waitForSelector('.topbar > .savestat.failed', { timeout: 8000 })
  if (WHO === 'us') { await page.evaluate(() => window.raptorRole('member')); await page.waitForFunction(() => /Member/.test(document.querySelector('#roleBadge')?.textContent || ''), null, { timeout: 5000 }); console.log(`NOTE ${size.name}: walking as a member — the top bar reads "${await page.locator('#roleBadge').textContent()}"`) }

  for (const pg of PAGES) {
    await go(page, pg); await sleep(pg === 'tracker' || pg === 'leavewar' ? 900 : 300)
    for (const scrolled of [0, 320]) {
      await page.evaluate(y => window.scrollTo(0, y), scrolled); await sleep(200)
      const r = await under(page)
      const tag = `${size.name} ${pg}${scrolled ? ' scrolled' : ''}`
      if (!r.note) { line(false, tag + ': the note is on the page'); continue }
      results.push({ size: size.name, page: pg, scrolled, ...r })
      const file = `${SHOTS}/${size.name}-${pg}${scrolled ? '-scrolled' : ''}.png`
      const x0 = Math.max(0, r.note[0] - (size.touch ? 400 : 420)), y1 = Math.min(size.height, r.note[1] + r.note[3] + 110)
      if (!(PICS_TOP_ONLY && scrolled)) await page.screenshot({ path: file, clip: { x: x0, y: 0, width: size.width - x0, height: y1 } })
      line(r.seen, tag + ': the warning can be seen, whole, on screen', JSON.stringify({ note: r.note }))
      line(!r.sideways, tag + ': the page does not scroll sideways')
      const bad = r.under.filter(u => u.hidden > 0)
      line(bad.length === 0, tag + ': the note covers no control', bad.map(u => `[${u.name}] ${u.hidden}% hidden, a press on its middle lands on ${u.middle}${u.retry ? ', ' + u.retry + ' spots go to Retry' : ''}`).join(' · '))
    }
    await page.evaluate(() => window.scrollTo(0, 0))
  }

  /* THE REAL PRESSES. (1) every control found under the note on its page: press its middle and see what took the press.
     (2) Retry itself, with storage working again: the note must go. */
  const taken = []
  for (const rec of results.filter(x => x.size === size.name && !x.scrolled)) {
    for (const u of rec.under.filter(u => u.hidden > 0)) {
      await go(page, rec.page); await sleep(rec.page === 'tracker' || rec.page === 'leavewar' ? 900 : 300)
      await page.evaluate(() => { window.__snHit = null; const h = e => { window.__snHit = (e.target.closest('.savestat button') ? 'RETRY' : (e.target.textContent || '').trim().slice(0, 30) || e.target.id || e.target.tagName); e.preventDefault(); e.stopPropagation() }; window.__snH = h; document.addEventListener('click', h, true) })
      await press(u.box[0] + u.box[2] / 2, u.box[1] + u.box[3] / 2)
      const got = await page.evaluate(() => { document.removeEventListener('click', window.__snH, true); return window.__snHit })
      taken.push({ page: rec.page, control: u.name, got })
      line(got !== 'RETRY', `${size.name} ${rec.page}: a real press on the middle of [${u.name}] is not taken by Retry`, 'the press went to: ' + got)
    }
  }
  await go(page, 'viewsched')
  /* storage works again FROM the press on Retry, never before it: the app's own retry (1s, 2s, 4s …) could otherwise
     save first and take the button away before the press reaches it */
  await page.evaluate(() => { const arm = e => { if (!e.target.closest('.savestat button, .saveband button')) return; Storage.prototype.setItem = window.__lsSetWas; document.removeEventListener('pointerdown', arm, true) }; document.addEventListener('pointerdown', arm, true) })
  const rb = await page.locator('.topbar > .savestat button').boundingBox()
  line(!!rb && rb.width >= 24 && rb.height >= 20, `${size.name}: Retry is a pressable size`, JSON.stringify(rb && [Math.round(rb.width), Math.round(rb.height)]))
  if (rb) await press(rb.x + rb.width / 2, rb.y + rb.height / 2)
  const gone = await page.waitForFunction(() => !document.querySelector('.topbar > .savestat'), null, { timeout: 6000 }).then(() => true, () => false)
  line(gone, `${size.name}: a real press on Retry saves, and the note goes`)
  results.push({ size: size.name, presses: taken })
  await browser.close()
}
writeFileSync(`${SHOTS}/result.json`, JSON.stringify({ base: BASE, css: !!CSS, results, errors }, null, 1))
console.log(`\n${fails} FAIL · errors: ${errors.length ? errors.join(' | ') : 'none'}`)
process.exit(fails ? 1 : 0)
