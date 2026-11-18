/* msq-host-f3probe — the host's reproduction of W3's F3 "Ranger still on the grid after a Delete posting dated today"
   (the fix read's re-walk, 18 Nov 26). usage: MSQ_DIST=… MSQ_BUNDLE=… node scripts/handpass/msq/msq-host-f3probe.mjs */
process.env.MSQ_WHO = 'host'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'f3probe'
const X = await import('./msq-lib.mjs')
const U = await import('./msq-w1-util.mjs')
const { say, sleep } = X
const TODAY = '2026-11-18'
const w = await X.open({ phone: false, user: 'ad2' })
const { page } = w
page.on('console', m => { if (/posting|refus|retry|PO /i.test(m.text())) say('console', m.type(), m.text().slice(0, 300)) })
await X.L.go(page, 'leavewar'); await sleep(2500)
const rid = await U.pidOf(page, 'Ranger')
say('Ranger pid', rid)
const cell = page.locator(`[data-testid="cell-${rid}-${TODAY}"]`).first()
await cell.scrollIntoViewIfNeeded().catch(() => {})
await cell.click(); await sleep(900)
await page.locator('button:visible', { hasText: '⋯' }).last().click({ timeout: 4000 }).catch(() => {}); await sleep(600)
await page.locator('button:visible', { hasText: /^Post out/ }).first().click(); await sleep(700)
await page.locator('button:visible', { hasText: /^(✓ )?Delete$/ }).first().click(); await sleep(800)
await X.pic(w, 'p1-sheet')
await page.locator('button:visible', { hasText: /^Post out$/ }).last().click(); await sleep(900)
await X.pic(w, 'p2-card')
await page.locator('button:visible', { hasText: /^Delete$/ }).last().click(); await sleep(2500)
await X.pic(w, 'p3-after')
const onGrid = async () => page.evaluate(id => !!document.querySelector('[data-person="' + id + '"]'), rid)
say('after the press: Ranger on the grid', await onGrid())
const toasts = await page.evaluate(() => [...document.querySelectorAll('[role=status],[role=alert],.toast,.lw-toast')].map(e => e.innerText.replace(/\s+/g, ' ')).join(' || '))
say('notes on screen', toasts)
/* the bell */
const bell = page.locator('button[aria-label*="otification"], button[aria-label*="ell"]').first()
if (await bell.count()) { await bell.click(); await sleep(800); await X.pic(w, 'p4-bell'); say('bell', (await U.bodyText(page)).match(/.{0,200}Ranger.{0,200}/)?.[0] || '(no Ranger line)'); await page.keyboard.press('Escape') }
/* Admin → Users */
await X.L.go(page, 'admin'); await sleep(1200)
const f = page.locator('input[aria-label="Find a callsign or sign-in"]')
await f.fill('Ranger'); await sleep(700)
await X.pic(w, 'p5-users')
say('users list', (await U.bodyText(page)).match(/.{0,120}Ranger.{0,200}/)?.[0] || '(Ranger not listed)')
/* a fresh boot */
await page.reload(); await sleep(1500); await X.login(page, 'ad2').catch(() => {})
await X.L.go(page, 'leavewar'); await sleep(2500)
await X.pic(w, 'p6-after-reload')
say('after reload: Ranger on the grid', await onGrid())
await X.L.go(page, 'admin'); await sleep(1200)
await page.locator('input[aria-label="Find a callsign or sign-in"]').fill('Ranger'); await sleep(700)
say('users list after reload', (await U.bodyText(page)).match(/.{0,120}Ranger.{0,200}/)?.[0] || '(Ranger not listed)')
await X.fin(w)
