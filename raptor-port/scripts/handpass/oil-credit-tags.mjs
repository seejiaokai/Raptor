// The WALK for the OIL credit-box labels fix (24 Sep 26 — evidence sheet
// docs/handpass/2026-09-24-oil-credit-tags.md). Drives the real production
// build at desktop (1440x900) and phone (iPhone 13) width, publishes Saturday
// 18 Jul through its four sign-off selects and the Publish button, then walks
// every kind of credit box at every zoom step, measuring what is cut and
// taking pictures.
//   Serve first (from raptor-port/): npm run build && npx vite preview --port 4192
//   Then (from raptor-port/, so @playwright/test resolves):
//     WALK_PORT=4192 node scripts/handpass/oil-credit-tags.mjs after <outdir> [desktop|phone]
// A fresh browser context per width, so each starts on the fresh demo world —
// and NO second sign-in: a reload before any Leave War write brings the demo
// world back without its OIL story (skill-observations #225).
import { chromium, devices } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'

const TAG = process.argv[2] || 'after'
const OUT = process.argv[3]
mkdirSync(OUT, { recursive: true })
const BASE = `http://localhost:${process.env.WALK_PORT || 4192}/`
const LONG = 'OC Ops, on behalf of the Commanding Offr'
const log = []
const say = (...a) => { const s = a.join(' '); log.push(s); console.log(s) }

/** Every text-bearing piece of every credit box that is cut: its own text runs
 *  past it, or it pokes out of its box. */
const cutAll = page => page.evaluate(() => {
  const cut = []
  for (const box of document.querySelectorAll('[data-testid="oil-list"] .oil-e')) {
    const b = box.getBoundingClientRect()
    for (const el of box.querySelectorAll('span, button')) {
      if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue
      const r = el.getBoundingClientRect()
      if (el.scrollWidth > el.clientWidth + 1 || r.left < b.left - 1 || r.right > b.right + 1 || r.bottom > b.bottom + 1)
        cut.push(`${box.dataset.testid} [${el.className}] "${el.textContent.trim()}"`)
    }
  }
  return cut
})
const zoomOf = page => page.locator('[data-testid="oil-list"] table.oil-grid').evaluate(el => el.style.zoom || '1')
const boxInfo = (page, tid) => page.locator(`[data-testid="${tid}"]`).evaluate(el => {
  const r = el.getBoundingClientRect(); const l1 = el.querySelector('.l1')
  return { w: Math.round(r.width), h: Math.round(r.height), l1: l1 ? [...l1.children].map(c => { const q = c.getBoundingClientRect(); return `${c.textContent}@${Math.round(q.left - r.left)},${Math.round(q.top - r.top)}` }).join(' | ') : '' }
})

async function run(kind) {
  const b = await chromium.launch()
  const ctx = kind === 'phone'
    ? await b.newContext({ ...devices['iPhone 13'] })
    : await b.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push('pageerror: ' + e.message))
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`) })
  /* a phone picture is the whole screen with the thing scrolled to the middle:
     an element picture of one row inside the sheet's scroller came out as the
     wrong region under phone emulation */
  const shot = async (name, loc) => {
    const f = `${OUT}/${TAG}-${kind}-${name}.png`
    if (loc && kind === 'phone') { await loc.evaluate(el => el.scrollIntoView({ block: 'center' })); await page.waitForTimeout(150); await page.screenshot({ path: f }) }
    else await (loc ?? page).screenshot({ path: f })
    say(`  picture: ${TAG}-${kind}-${name}.png`)
  }

  say(`\n=== ${TAG} · ${kind} ===`)
  await page.goto(BASE)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('editsched'))
  await page.waitForFunction(() => window.CURPAGE === 'editsched')
  await page.waitForTimeout(500)
  // SIGN Saturday (day 5) through its four sign-off selects, first appointed name each
  for (const k of ['cur', 'sked', 'plan', 'appr']) {
    const sel = page.locator(`select[data-sign="${k}"][data-signday="5"]`).first()
    const v = await sel.evaluate(s => [...s.options].find(o => o.value)?.value)
    await sel.selectOption(v, { force: true })
    await page.waitForTimeout(150)
  }
  const pub = page.locator('button[data-beak="5"]').first()
  await pub.scrollIntoViewIfNeeded()
  await pub.click()
  await page.waitForFunction(() => window.dayApproved(5))
  say('  Saturday 18 Jul signed and published through the screen')
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid="row-slipway"]')
  const drawer = page.locator('[data-testid="figures-toggle"]')
  if ((await drawer.getAttribute('aria-expanded')) === 'true') await drawer.click()

  // the grid's own FO* on Fable's Saturday, and the day window's giver line
  const cell = page.locator('[data-testid="cell-plasma-2026-07-18"]')
  if (await cell.count()) {
    await cell.scrollIntoViewIfNeeded(); await cell.click(); await page.waitForTimeout(400)
    const sheet = page.locator('[role="dialog"]').last()
    say('  day window on Fable 18 Jul says:', JSON.stringify((await sheet.innerText()).replace(/\s+/g, ' ').slice(0, 300)))
    await shot('daywindow', sheet)
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  } else say('  (no grid cell for Fable 18 Jul in view)')

  await page.locator('[data-testid="oil-tracker"]').click()
  await page.waitForSelector('[data-testid="oil-sheet"]')
  // variants made through the credit bar: a 40-character giver, and no giver at all
  for (const [who, given] of [['slipway', LONG], ['wolf', '']]) {
    await page.locator(`[data-testid="oil-name-${who}"]`).click()
    await page.locator('[data-testid="oil-amt"]').fill('1')
    await page.locator('[data-testid="oil-reason"]').fill('Det')
    if (given) await page.locator('[data-testid="oil-given"]').fill(given)
    await page.locator('[data-testid="oil-credit-save"]').click()
    await page.waitForSelector('[data-testid="oil-credit-panel"]', { state: 'detached' })
  }
  say('  credited through the bar: Drifter +1 given by a 40-character name; Wolf +1 with no giver')

  const autoTid = await page.locator('[data-testid="oil-row-plasma"] .oil-e').filter({ has: page.locator('.by.auto') }).first().getAttribute('data-testid')
  say('  Fable automatic box:', autoTid)

  const zin = page.locator('[data-testid="oil-zoom-in"]'), zout = page.locator('[data-testid="oil-zoom-out"]')
  say('  opens at zoom', await zoomOf(page))
  await shot('sheet-default')
  while (await zout.isEnabled()) await zout.click()
  for (;;) {
    const z = await zoomOf(page)
    const cut = await cutAll(page)
    say(`  zoom ${z}: Fable box ${JSON.stringify(await boxInfo(page, autoTid))}`)
    say(`  zoom ${z}: Drifter long-giver box ${JSON.stringify(await boxInfo(page, 'oil-entry-ol-1'))}`)
    say(`  zoom ${z}: cut text = ${cut.length ? '\n    ' + cut.join('\n    ') : 'none'}`)
    await page.locator('[data-testid="oil-row-plasma"]').scrollIntoViewIfNeeded()
    await shot(`fable-z${z}`, page.locator('[data-testid="oil-row-plasma"]'))
    await shot(`drifter-z${z}`, page.locator('[data-testid="oil-row-slipway"]'))
    if (!(await zin.isEnabled())) break
    await zin.click()
  }
  // back to the opening zoom
  while (await zout.isEnabled() && (await zoomOf(page)) !== (kind === 'phone' ? '0.8' : '1')) await zout.click()

  // the rows that carry the other kinds: carried-in, grant with a short giver,
  // an award with a giver + days, a correction, an uncovered opening, an uncovered take
  for (const id of ['ammo', 'slash', 'casper', 'shrek', 'bruise', 'wolf']) {
    const row = page.locator(`[data-testid="oil-row-${id}"]`)
    if (!(await row.count())) { say(`  (no row ${id})`); continue }
    await row.scrollIntoViewIfNeeded()
    await shot(`row-${id}`, row)
  }
  // the ARCHIVE open: used-up credits
  await page.locator('[data-testid="oil-archive"]').click(); await page.waitForTimeout(200)
  say(`  archive open: cut text = ${JSON.stringify(await cutAll(page))}`)
  await page.locator('[data-testid="oil-row-slipway"]').scrollIntoViewIfNeeded()
  await shot('archive-drifter', page.locator('[data-testid="oil-row-slipway"]'))
  // EXPIRY on (6 months): the older credits expire and read "expired <date>"
  await page.locator('[data-testid="oil-settings"]').click()
  await page.locator('[data-testid="oil-exp-months"]').click()
  await page.locator('[data-testid="oil-settings-done"]').click()
  await page.waitForSelector('[data-testid="oil-list"]')
  if (!(await page.locator('[data-testid="oil-archive"]').getAttribute('aria-pressed')).includes('true')) await page.locator('[data-testid="oil-archive"]').click()
  say(`  expiry 6 months, archive open: expired boxes = ${await page.locator('[data-testid="oil-list"] .oil-e.expired').count()}; cut text = ${JSON.stringify(await cutAll(page))}`)
  await page.locator('[data-testid="oil-row-prowler"]').scrollIntoViewIfNeeded()
  await shot('expired-prowler', page.locator('[data-testid="oil-row-prowler"]'))
  await page.locator('[data-testid="oil-settings"]').click()
  await page.locator('[data-testid="oil-exp-forever"]').click()
  await page.locator('[data-testid="oil-settings-done"]').click()
  await page.locator('[data-testid="oil-archive"]').click()

  // EDITING a grant, and NOTING an award (the two in-place editors)
  await page.locator('[data-testid="oil-entry-dol-1"]').scrollIntoViewIfNeeded()
  await page.locator('[data-testid="oil-entry-dol-1"]').click()
  await page.waitForSelector('[data-testid="oil-edit-save"]')
  await shot('editing-grant', page.locator('[data-testid="oil-row-slipway"]'))
  await page.locator('[data-testid="oil-edit-cancel"]').click()
  const noteBtn = page.locator('[data-testid="oil-row-slipway"] .oil-notebtn').first()
  await noteBtn.click()
  await page.waitForSelector('[data-testid="oil-note-input"]')
  await shot('noting-award', page.locator('[data-testid="oil-row-slipway"]'))
  await page.keyboard.press('Escape')

  // a MEMBER sees the same boxes with no controls
  await page.evaluate(() => window.lwSetRole('member')); await page.waitForTimeout(250)
  if (!(await page.locator('[data-testid="oil-sheet"]').count())) { say('  (the sheet closed on the role switch; reopened)'); await page.locator('[data-testid="oil-tracker"]').click(); await page.waitForSelector('[data-testid="oil-sheet"]') }
  say(`  member view: rows ${await page.locator('[data-testid="oil-list"] tr.oil-row').count()}, boxes ${await page.locator('[data-testid="oil-list"] .oil-e').count()}, reason buttons ${await page.locator('[data-testid="oil-list"] .oil-notebtn').count()}; cut text = ${JSON.stringify(await cutAll(page))}`)
  await page.locator('[data-testid="oil-row-plasma"]').scrollIntoViewIfNeeded()
  await shot('member-fable', page.locator('[data-testid="oil-row-plasma"]'))
  await page.locator('[data-testid="oil-row-ammo"]').scrollIntoViewIfNeeded()
  await shot('member-ammo', page.locator('[data-testid="oil-row-ammo"]'))
  // page never scrolls sideways
  say('  page scrolls sideways:', await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1))
  say('  errors:', errors.length ? '\n    ' + errors.join('\n    ') : 'none')
  await b.close()
}

const which = process.argv[4] ? [process.argv[4]] : ['desktop', 'phone']
for (const k of which) await run(k)
writeFileSync(`${OUT}/${TAG}-walk.log`, log.join('\n') + '\n')
