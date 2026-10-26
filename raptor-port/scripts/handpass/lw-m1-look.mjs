// M1's look card pictures (22 Oct 26): each changed place cut to itself, at twice the pixels (his phone is sharp), from the
// built app on http://localhost:4255/ (lwm1-walk-host). Writes docs/img/handpass/2026-10-22-lw-m1-open-dates/look/.
import { chromium, devices } from 'playwright'
import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const CHROMIUM = process.env.CHROMIUM || ''
const launch = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../docs/img/handpass/2026-10-22-lw-m1-open-dates/look')
mkdirSync(OUT, { recursive: true })
const BASE = 'http://localhost:4255/'
const T = id => `[data-testid="${id}"]`
const b = await chromium.launch(launch)
const errs = []

async function ctxOf(phone) {
  const ctx = await b.newContext(phone
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: devices['iPhone 13'].userAgent }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(String(e).slice(0, 200)))
  return { ctx, page }
}
async function signIn(page, who, today) {
  await page.goto(BASE); await page.waitForSelector('#luser')
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
  if (today) await page.evaluate(t => window.lwSetMemberToday(t), today)
  await page.evaluate(() => window.go('leavewar')); await page.waitForSelector(T(`row-${who === 'admin' ? 'stiff' : 'bane'}`))
  await page.waitForTimeout(700)
}
const click = async (page, sel) => { const l = page.locator(sel).first(); await l.evaluate(e => e.scrollIntoView({ block: 'nearest', inline: 'center' })).catch(() => {}); await l.click(); await page.waitForTimeout(350) }
const shotOf = async (page, sel, name, pad = 8) => {
  const bx = await page.locator(sel).first().boundingBox()
  await page.screenshot({ path: path.join(OUT, name + '.png'), clip: { x: Math.max(0, bx.x - pad), y: Math.max(0, bx.y - pad), width: bx.width + 2 * pad, height: bx.height + 2 * pad } })
}
const closeAny = async page => { for (const t of ['bid-cancel', 'daylist-close', 'closed-note-close', 'remarks-cancel', 'open-dates-close', 'sel-cancel']) if (await page.locator(T(t)).first().isVisible().catch(() => false)) await click(page, T(t)) }

/* desktop, real storage: the admin opens MAY and places + approves a morning LL for Ranger on 25 Feb */
{
  const { ctx, page } = await ctxOf(false)
  await signIn(page, 'admin')
  await shotOf(page, '#page-leavewar .filters:has([data-testid="open-chip"])', '01-desk-admin-chip-on-the-strip')
  await click(page, T('open-chip')); await page.waitForSelector(T('open-dates'))
  await click(page, T('od-month-2026-05'))
  await shotOf(page, T('open-dates'), '02-desk-admin-open-for-bidding-window', 2)
  await click(page, T('od-cal-2026-05-01'))
  await shotOf(page, T('open-dates'), '03-desk-admin-window-exact-days-calendar', 2)
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  await click(page, T('open-dates-close'))
  await shotOf(page, '#page-leavewar .filters:has([data-testid="open-chip"])', '04-desk-admin-chip-two-stretches')
  // a member's own pending bid on 18 Feb and the admin's approved morning on 25 Feb — then February closed
  await click(page, T('month-FEB'))
  await click(page, T('cell-bane-2026-02-25')); await click(page, T('portion-am')); await click(page, T('bid-LL')); if (await page.locator(T('bid-LL')).isVisible().catch(() => false)) await click(page, T('bid-LL'))
  await closeAny(page)
  await click(page, T('cell-bane-2026-02-25')); await click(page, T('decide-approve')); await closeAny(page)
  await signIn(page, 'member', '2026-02-15')
  await click(page, T('month-FEB'))
  await click(page, T('cell-bane-2026-02-18')); await click(page, T('bid-LL')); if (await page.locator(T('bid-LL')).isVisible().catch(() => false)) await click(page, T('bid-LL'))
  await closeAny(page)
  await signIn(page, 'admin')
  await click(page, T('open-chip')); await page.waitForSelector(T('open-dates')); await click(page, T('od-month-2026-02')); await click(page, T('open-dates-close'))
  // the admin's decide window on the approved morning, with Note
  await click(page, T('month-FEB')); await click(page, T('cell-bane-2026-02-25'))
  await page.mouse.move(2, 2); await page.waitForTimeout(250)
  await shotOf(page, '#page-leavewar .bidsheet', '05-desk-admin-decide-window-with-note', 2)
  await closeAny(page)
  // the Undo bubble after closing February — the admin's Undo, then Redo to put it back
  await page.click('#undoBtn'); await page.waitForTimeout(400)
  const bub = page.locator('text=/Undid:/').first()
  if (await bub.count()) await shotOf(page, 'text=/Undid:/', '06-desk-undo-bubble-closing-february', 6)
  await page.waitForTimeout(300); await page.click('#redoBtn'); await page.waitForTimeout(600)
  // the member: his grid (closed days dim with the lock; the outline from his today), the closed note, the pending note
  await signIn(page, 'member', '2026-02-15')
  await click(page, T('month-MAR'))
  await page.evaluate(() => { const w = [...document.querySelectorAll('#page-leavewar *')].find(e => e.scrollWidth > e.clientWidth + 500 && getComputedStyle(e).overflowX !== 'visible'); if (w) w.scrollLeft -= 420 })
  await page.mouse.move(2, 2); await page.waitForTimeout(600)
  const g = await page.locator('.mx-outer').first().boundingBox()
  await page.screenshot({ path: path.join(OUT, '07-desk-member-grid-closed-days-locked-march-open.png'), clip: { x: g.x, y: g.y, width: Math.min(g.width, 1100), height: 420 } })
  await click(page, T('month-FEB'))
  await click(page, T('cell-bane-2026-02-19'))
  await shotOf(page, T('closed-note'), '08-desk-member-closed-note', 2)
  await closeAny(page)
  await click(page, T('cell-bane-2026-02-18'))
  await shotOf(page, T('closed-note'), '09-desk-member-pending-note-with-delete', 2)
  await closeAny(page)
  await ctx.close()
}

/* phone, fresh: the chip and the window, member and admin */
{
  const { ctx, page } = await ctxOf(true)
  await signIn(page, 'member', '2026-02-15')
  await shotOf(page, T('open-chip'), '10-phone-member-chip-from-his-today', 10)
  await page.locator(T('open-chip')).tap(); await page.waitForSelector(T('open-dates')); await page.waitForTimeout(400)
  await shotOf(page, T('open-dates'), '11-phone-member-window-read-only', 2)
  await ctx.close()
  const p2 = await ctxOf(true)
  await signIn(p2.page, 'admin')
  await p2.page.locator(T('open-chip')).tap(); await p2.page.waitForSelector(T('open-dates')); await p2.page.waitForTimeout(400)
  await p2.page.locator(T('od-month-2026-07')).tap(); await p2.page.waitForTimeout(400)
  await shotOf(p2.page, T('open-dates'), '12-phone-admin-window-two-rows-of-months', 2)
  await p2.ctx.close()
}

console.log('ERRORS', JSON.stringify(errs))
await b.close()
