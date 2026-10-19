/* host probe — [KEYBOARD-SCROLL] his fourth note (19 Oct 26): "usually it doesn't work when I add new lines … click to
   add SC then … duties AM or the CS. It doesn't bring the thing I tapped into view". On a phone, the stand-in keyboard
   opening and closing by itself with the focus (as an iPhone's does), on the Scheduler Board: type in a box, add an SC
   wave by its menu, then tap low boxes — a duty box, a callsign box — and say for each whether it ends above the keys. */
import { open, version, KB, GAP } from './kbs-A-lib.mjs'
version('host-addsc-1')
const { browser, page } = await open()
await page.evaluate(kb => {
  const typing = e => e && (e.isContentEditable || (e.tagName === 'INPUT' && !/^(checkbox|radio|button|submit|range|color|file)$/i.test(e.type)) || e.tagName === 'TEXTAREA')
  const set = up => { const v = window.__vv; const h = up ? innerHeight - kb : innerHeight; if (v.height === h) return; setTimeout(() => { v.height = h; v.dispatchEvent(new Event('resize')) }, 120) }
  document.addEventListener('focusin', e => set(typing(e.target)), true)
  document.addEventListener('focusout', () => setTimeout(() => set(typing(document.activeElement)), 0), true)
}, KB)
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
await page.evaluate(() => window.openScheduler(0)); await page.waitForTimeout(900)
const H = await page.evaluate(() => innerHeight)
const tapAt = async loc => { const b = await loc.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + Math.min(8, b.height / 2)); await page.waitForTimeout(700) }
const low = loc => loc.evaluate(e => { let s = e.parentElement; while (s && !(/(auto|scroll)/.test(getComputedStyle(s).overflowY) && s.scrollHeight > s.clientHeight + 1)) s = s.parentElement; (s || document.scrollingElement).scrollTop += e.getBoundingClientRect().bottom - (innerHeight - 60) })
const check = async (tag, loc) => {
  await low(loc); await page.waitForTimeout(400)
  await tapAt(loc); await page.waitForTimeout(500)
  const r = await loc.evaluate(e => ({ b: Math.round(e.getBoundingClientRect().bottom), f: document.activeElement === e }))
  const vvh = await page.evaluate(() => window.__vv.height)
  console.log(tag, JSON.stringify(r), 'keys top', vvh, r.b <= vvh - GAP + 1 ? 'IN SIGHT' : 'COVERED')
  await page.screenshot({ path: `docs/img/handpass/2026-10-19-keyboard-scroll/walk/host-addsc-${tag}.png` })
}
const vis = sel => page.locator(`#schedBoard ${sel}:visible`)
await check('1-time-before-add', vis('input.tm').nth(4))
/* add an SC wave through its own menu */
await tapAt(vis('[data-wvadd]').first())
const sc = page.locator('.wavemenu [data-wmkind="sc"]')
console.log('sc in menu', await sc.count())
if (await sc.count()) { await tapAt(sc.first()); await page.waitForTimeout(800) }
await check('2-duty-after-sc', vis('[data-bfld^="dr:"], textarea[data-bfld^="dr:"], input[data-bfld^="dr:"]').last())
await check('3-callsign-after-sc', vis('[data-bfld$=".cs"]').last())
await check('4-time-after-sc', vis('input.tm').last())
await browser.close()
