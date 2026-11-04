/* [TOPBAR-NAMES-BESIDE-TALON] (D1641, D1642, D1643) — the walk of the built change, by the host, one script.
   Each step asserts the RIGHT behaviour (a PASS is correct), so a re-run on a fixed build is the re-walk.
   S1  the rule at 1600, 1536, 1280, 1024, 900 and 830 on every page, admin (names on one line beside TALON, or ☰ and unseen)
   S2  a phone held sideways (874 × 402, touch), Chromium and WebKit: ☰ and one row on every page; ☰ tapped (picture right
       after the tap, D1281); the menu scrolled to Logout; a page picked from it
   S3  a phone upright (402 × 874): ☰ as before, unchanged
   S4  an iPad (1024 × 768, touch): measured, not forced
   S5  what is held under the bar, with the bar one row: the Leave War's frozen dates and Quals' pinned row scrolled, at 830
       and on a phone held sideways; Edit Schedule's AIRCREW heading at 1024 (D1116)
   S6  the role switch at 830: the admin folded → the member view (two names fewer) → back
   S7  the keyboard at 830: Shift+Tab to ☰, Enter, the keys on the page you are on, Escape back to ☰; a click outside closes
   S8  the plain-user round on a phone held sideways: ☰ → Leave War → ☰ → Tracker → ☰ → Admin → ☰ → Logout
   S9  the window widened and narrowed live: the names come and go by themselves, no resize loop reported
   S10 wider letters (Verdana, as wide as GitHub's Linux letters): at 874 on a desktop, where this PC's letters just fit,
       the names fold — the stand-in reproduces his iPhone's wrap condition
   Run: HP_URL=http://localhost:<port> HP_SHOTS=<folder> node scripts/handpass/topbar-names-walk.mjs → <folder>/walk/ */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium, webkit } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = SHOTS + '/walk'; mkdirSync(OUT, { recursive: true })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const rows = []
const check = (id, what, ok, detail = '') => { rows.push({ id, what, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${what}${detail ? ' — ' + detail : ''}`) }
const TOPBAR = '.topbar:has(#burger)'
const PAGES = ['viewsched', 'editsched', 'inputs', 'quals', 'logic', 'leavewar', 'tracker', 'help', 'admin']

const state = page => page.evaluate(sel => {
  const bar = document.querySelector(sel)
  const vis = e => !!e && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0
  const mark = bar.querySelector('.mark').getBoundingClientRect(), nav = bar.querySelector('#topnav').getBoundingClientRect()
  const links = [...bar.querySelectorAll('#topnav a')].filter(a => getComputedStyle(a).display !== 'none')
  /* the passing "Saving…" note hangs under the bar for a moment by design (.savestat) — not a row of the bar */
  const parts = [...bar.children].filter(e => vis(e) && !e.classList.contains('savestat')).map(e => e.getBoundingClientRect())
  return {
    folded: bar.classList.contains('nav-fold'), burger: vis(bar.querySelector('#burger')), names: vis(bar.querySelector('#topnav')),
    oneLine: new Set(links.map(a => Math.round(a.getBoundingClientRect().top))).size === 1,
    beside: nav.top < mark.bottom && nav.bottom > mark.top,
    oneRow: Math.max(...parts.map(r => r.top)) < Math.min(...parts.map(r => r.bottom)),
    height: Math.round(bar.getBoundingClientRect().height), need: Math.round(nav.width), wide: document.documentElement.scrollWidth <= innerWidth + 1,
  }
}, TOPBAR)
async function rule(page, id, what) {
  const s = await state(page)
  const ok = s.folded ? (s.burger && !s.names) : (!s.burger && s.names && s.oneLine && s.beside)
  check(id, what + (s.folded ? ' — folded into ☰' : ' — names beside TALON'), ok && s.wide, JSON.stringify(s))
  return s
}
const shot = async (page, name, h = 170) => { const vp = page.viewportSize(); await page.screenshot({ path: `${OUT}/${name}.png`, clip: { x: 0, y: 0, width: vp.width, height: Math.min(h, vp.height) } }) }
const errorsOf = page => { const e = []; page.on('console', m => { if (m.type() === 'error') e.push(m.text()) }); page.on('pageerror', x => e.push('PAGEERROR ' + x.message)); return e }
async function world(engine, viewport, touch, who = 'a', initScript = null) {
  const browser = await engine.launch({ headless: true, ...(engine === chromium && existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, ...(touch ? { isMobile: engine === chromium, hasTouch: true } : {}) })
  if (initScript) await ctx.addInitScript(initScript)
  const page = await ctx.newPage(); const errors = errorsOf(page)
  await ctx.clock.install({ time: new Date('2026-11-04T09:00:00') })
  await page.goto(BASE + '/'); await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' }); await login(page, who)
  return { browser, page, errors }
}
/* what stands under the bar: the frozen or pinned part's top against the bar's foot, after a real wheel scroll */
async function underBar(page, id, what, sel) {
  for (let i = 0; i < 5; i++) { await page.mouse.wheel(0, 300); await sleep(120) }
  await sleep(500)
  const m = await page.evaluate(([s, t]) => {
    const bar = document.querySelector(t).getBoundingClientRect()
    const el = [...document.querySelectorAll(s)].find(e => e.getBoundingClientRect().height > 0)
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { barFoot: Math.round(bar.bottom), top: Math.round(r.top), scrollY: Math.round(scrollY) }
  }, [sel, TOPBAR])
  check(id, what, m && m.scrollY > 0 && m.top >= m.barFoot - 2 && m.top <= m.barFoot + 60, JSON.stringify(m))
}

/* S1 — the rule at every desktop size, every page */
{
  const { browser, page, errors } = await world(chromium, { width: 1600, height: 900 }, false)
  for (const w of [1600, 1536, 1280, 1024, 900, 830]) {
    await page.setViewportSize({ width: w, height: 800 }); await sleep(300)
    for (const p of PAGES) { await go(page, p); await rule(page, `S1-${w}-${p}`, `admin, ${p}, ${w} wide`) }
    await go(page, 'leavewar'); await shot(page, `S1-${w}-leavewar`)
    await go(page, 'editsched'); await shot(page, `S1-${w}-editsched`)
  }
  check('S1-err', 'no error in the browser', errors.length === 0, errors.slice(0, 3).join(' | '))
  await browser.close()
}

/* S2, S8 — a phone held sideways, both engines */
for (const [name, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const { browser, page, errors } = await world(engine, { width: 874, height: 402 }, true)
  for (const p of PAGES) {
    await go(page, p)
    const s = await rule(page, `S2-${name}-${p}`, `sideways phone (${name}), ${p}`)
    check(`S2-${name}-${p}-row`, `sideways phone (${name}), ${p}: folded, one row`, s.folded && s.oneRow, `height ${s.height}`)
  }
  await go(page, 'leavewar'); await shot(page, `S2-${name}-leavewar`, 402)
  await page.locator('#burger').tap(); await sleep(80); await shot(page, `S2-${name}-menu-just-tapped`, 402)
  await sleep(400); await shot(page, `S2-${name}-menu-open`, 402)
  check(`S2-${name}-open`, `sideways (${name}): ☰ tapped opens the menu`, await page.locator('#drawer.open').count() === 1)
  const panel = page.locator('#drawer .drawer-panel'), box = await panel.boundingBox()
  if (engine === chromium) { await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); for (let i = 0; i < 6; i++) await page.mouse.wheel(0, 200) }
  else await panel.evaluate(el => el.scrollBy(0, 400))   // WebKit's headless wheel does not scroll; the scroll itself is Chromium's step
  await sleep(400); await shot(page, `S2-${name}-menu-scrolled`, 402)
  const lo = await page.locator('#drawerLogout').boundingBox()
  check(`S2-${name}-logout`, `sideways (${name}): the menu reaches Logout`, lo && lo.y + lo.height <= 402, JSON.stringify(lo))
  /* S8 the plain-user round — every opening and closing by touch */
  for (const p of ['leavewar', 'tracker', 'admin']) {
    if (!(await page.locator('#drawer.open').count())) { await page.locator('#burger').tap(); await sleep(350) }
    await page.locator(`#drawerNav a[data-page="${p}"]`).tap()
    await page.waitForFunction(q => window.CURPAGE === q, p); await sleep(900)
    check(`S8-${name}-${p}`, `sideways (${name}): ${p} picked from ☰, the menu closed, the bar still one row`,
      (await page.locator('#drawer.open').count()) === 0 && (await state(page)).oneRow)
    await shot(page, `S8-${name}-${p}`, 402)
  }
  await page.locator('#burger').tap(); await sleep(350)
  /* a tap on the dimmed page beside the menu closes it, the page staying */
  await page.touchscreen.tap(840, 300); await sleep(350)
  check(`S8-${name}-outside`, `sideways (${name}): a tap beside the menu closes it, still on Admin`, (await page.locator('#drawer.open').count()) === 0 && (await page.evaluate(() => window.CURPAGE)) === 'admin')
  await page.locator('#burger').tap(); await sleep(350)
  await page.locator('#drawer .drawer-panel').evaluate(el => el.scrollTo(0, el.scrollHeight))   // the scroll was walked above
  await page.locator('#drawerLogout').tap(); await page.waitForSelector('#luser')
  check(`S8-${name}-logout`, `sideways (${name}): Logout from ☰ signs out`, true)
  check(`S2-${name}-err`, `sideways (${name}): no error in the browser`, errors.length === 0, errors.slice(0, 3).join(' | '))
  await browser.close()
}

/* S3 — upright phone, unchanged */
{
  const { browser, page } = await world(chromium, { width: 402, height: 874 }, true)
  await go(page, 'leavewar')
  const s = await state(page)
  check('S3', 'upright phone: ☰ as before, the names unseen', s.burger && !s.names, JSON.stringify(s))
  await shot(page, 'S3-upright', 140)
  await browser.close()
}

/* S4 — an iPad: measured, not forced */
{
  const { browser, page } = await world(chromium, { width: 1024, height: 768 }, true)
  for (const p of ['viewsched', 'leavewar']) { await go(page, p); const s = await rule(page, `S4-${p}`, `iPad 1024 × 768, ${p}`); check(`S4-${p}-measured`, `iPad, ${p}: not forced to fold (the names fit this PC's letters)`, !s.folded) }
  await shot(page, 'S4-ipad', 170)
  await browser.close()
}

/* S5 — what is held under the bar */
{
  const { browser, page } = await world(chromium, { width: 830, height: 800 }, false)
  await go(page, 'leavewar'); await sleep(1200)
  check('S5-830-folded', '830: folded, one row', (await state(page)).folded && (await state(page)).oneRow)
  await page.mouse.move(415, 500); await underBar(page, 'S5-830-lw', '830, the Leave War scrolled: the frozen dates right under the bar', '.mxfixed')
  await shot(page, 'S5-830-leavewar-scrolled', 400)
  await go(page, 'quals'); await sleep(600); await page.mouse.move(415, 500)
  await underBar(page, 'S5-830-quals', '830, Quals scrolled: its pinned row right under the bar', '.qfixed')   // Quals' frozen copy of its heading row (its own table's thead scrolls away by design)
  await shot(page, 'S5-830-quals-scrolled', 400)
  await page.setViewportSize({ width: 1024, height: 800 }); await go(page, 'editsched'); await sleep(600); await page.mouse.move(300, 500)
  await underBar(page, 'S5-1024-aircrew', '1024, Edit Schedule scrolled: the AIRCREW heading under the bar (D1116)', '.eroster .er-h, .eroster h4, .eroster [class*="head"]')
  await shot(page, 'S5-1024-editsched-scrolled', 400)
  await browser.close()
  const ph = await world(chromium, { width: 874, height: 402 }, true)
  await go(ph.page, 'leavewar'); await sleep(1200); await ph.page.mouse.move(437, 300)
  await underBar(ph.page, 'S5-side-lw', 'sideways phone, the Leave War scrolled: the frozen dates right under the one-row bar', '.mxfixed')
  await shot(ph.page, 'S5-side-leavewar-scrolled', 402)
  await ph.browser.close()
}

/* S6 — the role switch at 830 */
{
  const { browser, page } = await world(chromium, { width: 830, height: 800 }, false)
  await go(page, 'viewsched')
  const a = await rule(page, 'S6-admin', '830, the admin')
  await page.locator('#burger').click(); await sleep(300); await page.locator('#drawerRole').click(); await sleep(700)
  const m = await rule(page, 'S6-member', '830, switched to the member view (two names fewer)')
  check('S6-member-fits', '830, member view: seven names fit beside TALON', !m.folded, `admin need ${a.need}, member need ${m.need}`)
  await shot(page, 'S6-member-view', 170)
  await page.locator('#roleBadge').click().catch(() => { })
  await sleep(700)
  if (!(await page.evaluate(() => document.querySelector('#topnav a[data-page="admin"]') && !document.querySelector('#topnav a[data-page="admin"]').hidden))) {
    await page.locator('#topnav a[data-page="viewsched"]').isVisible().catch(() => { })
    const burger = await page.locator('#burger').isVisible()
    if (burger) { await page.locator('#burger').click(); await sleep(300); await page.locator('#drawerRole').click(); await sleep(700) }
  }
  const back = await rule(page, 'S6-back', '830, back to the admin view')
  check('S6-back-folded', '830, back to the admin: folded again', back.folded)
  await browser.close()
}

/* S7 — the keyboard at 830 */
{
  const { browser, page } = await world(chromium, { width: 830, height: 800 }, false)
  await go(page, 'inputs')
  await page.locator(`${TOPBAR} .mark`).click(); await page.keyboard.press('Shift+Tab')
  check('S7-tab', '830: Shift+Tab from TALON lands on ☰ (the folded names are out of the keys\' way)', (await page.evaluate(() => document.activeElement?.id)) === 'burger')
  await page.keyboard.press('Enter'); await sleep(300)
  check('S7-open', 'Enter opens the menu, the keys on the page you are on', (await page.evaluate(() => document.activeElement?.dataset?.page)) === 'inputs')
  await shot(page, 'S7-menu-by-keys', 800)
  await page.keyboard.press('Tab'); await page.keyboard.press('Enter'); await page.waitForTimeout(700)
  check('S7-pick', 'Tab then Enter opens the next page (Quals) and closes the menu', (await page.evaluate(() => window.CURPAGE)) === 'quals' && (await page.locator('#drawer.open').count()) === 0)
  await page.locator('#burger').focus(); await page.keyboard.press('Enter'); await sleep(300)
  await page.keyboard.press('Escape'); await sleep(300)
  check('S7-esc', 'Escape closes the menu and the keys are back on ☰', (await page.locator('#drawer.open').count()) === 0 && (await page.evaluate(() => document.activeElement?.id)) === 'burger')
  await page.locator('#burger').click(); await sleep(300); await page.mouse.click(780, 400); await sleep(300)
  check('S7-outside', 'a click beside the menu closes it', (await page.locator('#drawer.open').count()) === 0)
  await browser.close()
}

/* S9 — live resizes */
{
  const { browser, page, errors } = await world(chromium, { width: 1600, height: 800 }, false)
  await go(page, 'leavewar')
  for (const w of [1600, 830, 1280, 830, 1600, 900, 1536]) { await page.setViewportSize({ width: w, height: 800 }); await sleep(250); await rule(page, `S9-${w}`, `resized live to ${w}`) }
  check('S9-err', 'no resize loop or other error reported', errors.length === 0, errors.slice(0, 3).join(' | '))
  await browser.close()
}

/* S10 — wider letters at 874 on a desktop */
{
  const wide = () => { const add = () => { const s = document.createElement('style'); s.textContent = '*, *::before, *::after { font-family: Verdana, "DejaVu Sans", sans-serif !important }'; document.head.appendChild(s) }; if (document.head) add(); else document.addEventListener('DOMContentLoaded', add) }
  const plain = await world(chromium, { width: 874, height: 800 }, false)
  await go(plain.page, 'leavewar'); const p = await rule(plain.page, 'S10-plain', '874 desktop, this PC\'s letters')
  await plain.browser.close()
  const w = await world(chromium, { width: 874, height: 800 }, false, 'a', wide)
  await go(w.page, 'leavewar'); const s = await rule(w.page, 'S10-wide', '874 desktop, wider letters')
  check('S10-calibrated', 'the stand-in reproduces his wrap condition: this PC\'s letters fit at 874, wider ones do not', !p.folded && s.folded, `need ${p.need} → ${s.need}`)
  await shot(w.page, 'S10-wide-letters', 170)
  await w.browser.close()
}

writeFileSync(`${OUT}/walk.json`, JSON.stringify(rows, null, 1))
const fails = rows.filter(r => !r.ok)
console.log(`\n${rows.length - fails.length} / ${rows.length} passed${fails.length ? '\nFAILED: ' + fails.map(f => f.id).join(', ') : ''}`)
