// Walker A (member / guest build, 5 Nov 26): shared helpers on top of mg1105-lib.mjs
import * as L from './mg1105-lib.mjs'
import { webkit } from '@playwright/test'
import { serveFrozen } from './isr-serve.mjs'
import { join } from 'node:path'
export { L }
export const VER = 'mgb-walk-a lib v1'
export const shot = (page, name, clip) => page.screenshot({ path: join(L.OUT, name + '.png'), ...(clip ? { clip } : {}) })
export const press = (page, tap, sel) => tap ? page.locator(sel).first().tap() : page.locator(sel).first().click()
export const sleep = (ms) => new Promise(r => setTimeout(r, ms))

/* phone held sideways 874x402 WebKit */
let sideBrowser
export async function openSide() {
  sideBrowser ||= await webkit.launch()
  const ctx = await sideBrowser.newContext({ viewport: { width: 874, height: 402 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, acceptDownloads: true })
  await serveFrozen(ctx, L.URL)
  await ctx.addInitScript(COUNTERFN)
  const page = await ctx.newPage()
  page.on('pageerror', e => L.errs.push(`[side] page error ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') L.errs.push(`[side] console ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) L.errs.push(`[side] HTTP ${r.status()} ${r.url()}`) })
  page.on('dialog', d => { d.accept().catch(() => {}) })
  await page.goto(L.URL)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}' }).catch(() => {})
  await page.waitForSelector('#luser')
  return { ctx, page, tap: true, size: 'side' }
}
const COUNTERFN = () => {
  const w = window
  if (w.__lsWrap) return
  w.__lsWrap = true; w.__lsLog = []; w.__lsRefuse = false
  const set = Storage.prototype.setItem, rem = Storage.prototype.removeItem
  Storage.prototype.setItem = function (k, v) { const ok = !w.__lsRefuse; w.__lsLog.push({ op: 'set', k: String(k), ok }); if (!ok) throw new DOMException('quota (walk)', 'QuotaExceededError'); return set.call(this, k, v) }
  Storage.prototype.removeItem = function (k) { const ok = !w.__lsRefuse; w.__lsLog.push({ op: 'remove', k: String(k), ok }); if (!ok) throw new DOMException('quota (walk)', 'QuotaExceededError'); return rem.call(this, k) }
}
export async function closeSide() { if (sideBrowser) await sideBrowser.close() }

/* admin: guest switch on (sign in as ad, Users category), then sign out */
export async function guestSwitch(page, on = true) {
  await L.signIn(page, 'ad', 'a')
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(400)
  const c = await page.locator('#admGuestView').isChecked()
  if (c !== on) await page.locator('#admGuestView').click()
  await page.waitForTimeout(400)
}
export const stranger = async (page, name = 'stranger', cs = 'Stranger', ini = 'ST', seat = 'FCP', cat = 'OCU') => {
  await L.signIn(page, name, 'x')
  await page.waitForSelector('#accessRequest')
  await page.fill('#accCs', cs); if (ini !== null) await page.fill('#accIni', ini)
  await page.selectOption('#accSeat', seat); if (cat) await page.selectOption('#accCat', cat).catch(() => {})
}
