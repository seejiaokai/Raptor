/* [SAVE-NOTE-COVERS] (D586, D587) — THE FAILED-SAVE WARNING ON EVERYTHING THAT LIES OVER THE TOP BAR.
   Same forced failure as sn-cover.mjs. Then, the way a person gets there:
     1. the full-screen scheduler board — the warning under the board's own bar, every control of that bar still its own
        target, the board's content not under the band, and Retry pressed for real FROM the board;
     2. the Inputs calendar and the Medical view — the same warning under their heads;
     2b. the Leave War's OIL tracker (its grid and its settings) — full screen too;
     3. a window (Insights) and, on a phone, the menu drawer — short visits: they cover the bar's warning as they cover
        the bar (D587), and it is there again when they close.
   Written as assertions of the RIGHT behaviour: on the build before the fix steps 1 and 2 FAIL (the warning could not
   be seen there at all).   HP_URL=… HP_SHOTS=<dir> node scripts/handpass/sn-board.mjs */
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'
import { login, go, BASE, SHOTS } from './lib.mjs'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
mkdirSync(SHOTS, { recursive: true })
const sleep = ms => new Promise(r => setTimeout(r, ms))
let fails = 0
const errors = []
const line = (ok, what, detail = '') => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + what + (detail ? '  ' + detail : '')) }

const fail = page => page.evaluate(() => {
  if (!window.__lsSetWas) window.__lsSetWas = Storage.prototype.setItem
  Storage.prototype.setItem = function () { throw new DOMException('The quota has been exceeded (walk: forced)', 'QuotaExceededError') }
  const w = window
  w.fillSlot('1.0.0.0.p', w.DAYS[1].waves[0].formations[0].aircraft[0].p === 'casper' ? 'bane' : 'casper'); w.afterSchedMutate()
})
/* the warning at `sel`: seen whole and on top? what a person could press lies under it? */
const look = (page, sel) => page.evaluate(sel => {
  const n = document.querySelector(sel)
  if (!n) return { there: false, seen: false, covers: [] }
  const b = n.getBoundingClientRect()
  const top = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)
  const seen = !!top && n.contains(top) && b.width > 0 && b.height > 0 && b.top >= 0 && b.left >= 0 && b.right <= innerWidth + 0.5 && b.bottom <= innerHeight + 0.5
  const control = e => { for (let x = e; x && x !== document.body; x = x.parentElement) { if (x.matches('button, a[href], input, select, textarea, summary, label, [role="button"], [role="tab"], [tabindex]:not([tabindex="-1"])') || getComputedStyle(x).cursor === 'pointer') return x } return null }
  const spots = []
  for (let y = b.top + 2; y <= b.bottom - 2; y += 4) for (let x = b.left + 2; x <= b.right - 2; x += 4) spots.push([x, y])
  const vis = n.style.visibility; n.style.visibility = 'hidden'
  const under = new Set(spots.map(([x, y]) => control(document.elementFromPoint(x, y))).filter(c => c && !n.contains(c)))
  n.style.visibility = vis
  return { there: true, seen, onTop: top ? (top.id || String(top.className) || top.tagName).slice(0, 40) : null, box: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)],
    covers: [...under].map(c => (c.getAttribute('aria-label') || c.textContent || c.id || '').trim().slice(0, 30)) }
}, sel)

for (const size of [{ name: 'phone-390', width: 390, height: 844, touch: true }, { name: 'phone-side', width: 844, height: 390, touch: true }, { name: 'desk-1366', width: 1366, height: 800 }]) {
  const browser = await chromium.launch({ headless: true, ...launchOptions })
  const page = await (await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 2, hasTouch: !!size.touch })).newPage()
  page.on('console', m => { if (m.type() === 'error' && !/quota/i.test(m.text())) errors.push(size.name + ' ' + m.text()) })
  page.on('pageerror', e => errors.push(size.name + ' PAGEERROR ' + e.message))
  const press = async sel => { const l = page.locator(sel).first(); if (size.touch) await l.tap(); else await l.click(); await sleep(300) }
  const shot = name => page.screenshot({ path: `${SHOTS}/${size.name}-${name}.png`, clip: { x: 0, y: 0, width: size.width, height: Math.min(size.height, 300) } })
  await page.goto(BASE + '/'); await login(page, 'a'); await go(page, 'editsched')
  await fail(page)
  await page.waitForSelector('.topbar > .savestat.failed', { timeout: 8000 })

  /* 1 — the board */
  await page.click('#eWeek [data-sbday="1"]:visible'); await page.waitForSelector('#schedBoard:not([hidden])'); await sleep(600)
  const B = '#schedBoard .saveband'
  const b = await look(page, B)
  await shot('board')
  line(b.seen, `${size.name} board: the warning can be seen under the board's own bar`, JSON.stringify({ box: b.box, onTop: b.onTop, there: b.there }))
  line(b.there && b.covers.length === 0, `${size.name} board: it covers no control`, b.covers.join(' · '))
  const missed = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-top button, #schedBoard .sb-top select')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.left >= 0 && r.right <= innerWidth })
    .filter(e => { const r = e.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !(hit && (e === hit || e.contains(hit))) }).map(e => (e.getAttribute('aria-label') || e.textContent || e.id || '').trim().slice(0, 30)))
  line(missed.length === 0, `${size.name} board: every control of the board's bar is still its own target`, missed.join(' · '))
  /* the board's own content starts below its bar — nothing of it sits under the band */
  const under = await page.evaluate(() => { const t = document.querySelector('#schedBoard .sb-top').getBoundingClientRect(), m = document.querySelector('#schedBoard .sb-main').getBoundingClientRect(); return { barBottom: Math.round(t.bottom), contentTop: Math.round(m.top) } })
  line(under.contentTop >= under.barBottom - 1, `${size.name} board: the board's content starts below its bar and the band`, JSON.stringify(under))
  /* Retry, pressed for real, from the board: while storage still refuses it stays; once storage works it saves and goes */
  if (b.there) {
    await press(B + ' button')
    line(await page.locator(B).count() === 1, `${size.name} board: Retry while storage still refuses — the warning stays`)
    /* storage works again FROM the press on Retry, never before it: the app's own retry (1s, 2s, 4s …) could otherwise
     save first and take the button away before the press reaches it */
  await page.evaluate(() => { const arm = e => { if (!e.target.closest('.savestat button, .saveband button')) return; Storage.prototype.setItem = window.__lsSetWas; document.removeEventListener('pointerdown', arm, true) }; document.addEventListener('pointerdown', arm, true) })
    await press(B + ' button')
    const gone = await page.waitForFunction(() => !document.querySelector('.saveband') && !document.querySelector('.topbar > .savestat'), null, { timeout: 6000 }).then(() => true, () => false)
    line(gone, `${size.name} board: a real press on the board's Retry saves, and the warning goes everywhere`)
    await shot('board-after-retry')
  }
  await page.locator('#sbDone').click(); await sleep(400)

  /* 2 — the Inputs calendar and the Medical view */
  await go(page, 'inputs'); await fail(page)
  await page.waitForSelector('.topbar > .savestat.failed', { timeout: 8000 })
  for (const [btn, root, name] of [['#inCalBtn', '#inpCal', 'inputs-calendar'], ['#inMedBtn', '#medView', 'medical-view']]) {
    await page.locator(btn).click(); await page.waitForSelector(root); await sleep(500)
    const r = await look(page, root + ' .saveband')
    await shot(name)
    line(r.seen, `${size.name} ${name}: the warning can be seen under its head`, JSON.stringify({ box: r.box, onTop: r.onTop, there: r.there }))
    line(r.there && r.covers.length === 0, `${size.name} ${name}: it covers no control`, r.covers.join(' · '))
    await page.locator(root + ' .ic-head button[aria-label="Back to list"]').first().click(); await sleep(300)
  }

  /* 2b — the Leave War's OIL tracker: a full-screen working sheet (its grid, and its settings) — Astra's read, F1 */
  await go(page, 'leavewar'); await sleep(900)
  await page.locator('[data-testid="oil-tracker"]:visible').first().click(); await page.waitForSelector('[data-testid="oil-sheet"]'); await sleep(500)
  for (const name of ['oil-tracker', 'oil-tracker-settings']) {
    if (name === 'oil-tracker-settings') { await page.locator('[data-testid="oil-settings"]').click(); await sleep(400) }
    const r = await look(page, '[data-testid="oil-sheet"] .saveband')
    await shot(name)
    line(r.seen, `${size.name} ${name}: the warning can be seen under its head`, JSON.stringify({ box: r.box, onTop: r.onTop, there: r.there }))
    line(r.there && r.covers.length === 0, `${size.name} ${name}: it covers no control`, r.covers.join(' · '))
  }
  await page.locator('[data-testid="oil-close"]').first().click(); await sleep(300)

  /* 3 — short visits: a window, and the phone's menu. They cover the bar's warning; it is there again when they close. */
  await go(page, 'viewsched'); await sleep(300)
  const BAR = '.topbar > .savestat.failed'
  if (size.width > 820) {
    await page.locator('#insightBtn').click(); await page.waitForSelector('#insightClose'); await sleep(400)
    await shot('window-open')
    console.log(`NOTE ${size.name}: with the Insights window open the bar's warning is ${(await look(page, BAR)).seen ? 'still on top' : 'behind the window, as the bar is'}`)
    await page.locator('#insightClose').click(); await sleep(300)   // its own cross (D562)
  } else {
    await page.locator('#burger').tap(); await sleep(500)
    await shot('menu-open')
    console.log(`NOTE ${size.name}: with the menu open the bar's warning is ${(await look(page, BAR)).seen ? 'still on top' : 'behind the menu, as the bar is'}`)
    await page.touchscreen.tap(size.width - 12, size.height - 12); await sleep(500)
  }
  const back = await look(page, BAR)
  line(back.seen && back.covers.length === 0, `${size.name}: with it closed again the bar's warning is seen and covers nothing`, JSON.stringify({ box: back.box, covers: back.covers }))
  await browser.close()
}
console.log(`\n${fails} FAIL · errors: ${errors.length ? errors.join(' | ') : 'none'}`)
process.exit(fails ? 1 : 0)
