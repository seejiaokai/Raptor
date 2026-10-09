// A LOOK, not a walk: where the week and the board draw the count of a placeholder that HOLDS a request
// ([INPUT-ALL-AVAIL] — docs/handpass/2026-10-09-all-avail-event-check.md). Files one through the app's own editor on the
// demo Saturday and prints what each schedule face drew for its row.
//   node scripts/handpass/aa-host-probe.mjs
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const URL = (process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
const errs = []
page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
await page.goto(URL)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day')
await page.evaluate(() => window.go('inputs'))
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
for (let i = 0; i < 60; i++) {
  const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
  const d = 2026 * 12 + 6 - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
  if (!d) break
  await page.locator(d > 0 ? '#icNext' : '#icPrev').click()
}
await page.locator('#inpCal [data-icday="2026-07-18"]').click({ position: { x: 8, y: 8 } })
await page.locator('#icPopAdd').click()
await page.selectOption('#inpEditType', 'Duty')
await page.selectOption('#inpEditPerson', 'allavail')
await page.fill('#inpEditRmk', 'probe')
await page.locator('#inpEditSave').click()
await page.locator('[data-testid="oil-yes"]').click()
await page.locator('[data-testid="oilconf-save"]').click()
await page.waitForTimeout(300)
const rec = await page.evaluate(() => { const r = window.INPUTS.find(x => x.remarks === 'probe'); return r && { iid: r.iid, person: r.person, acc: r.acc, s: r.s, e: r.e, oil: r.oil } })
console.log('record', JSON.stringify(rec))
console.log('day row', JSON.stringify(await page.evaluate(iid => (window.DAYS[5].ground || []).filter(g => String(g.src || '') === iid), rec.iid)))
await page.evaluate(() => window.go('editsched'))
await page.waitForTimeout(400)
const where = await page.evaluate(() => {
  const path = el => { const out = []; for (let e = el; e && e !== document.body; e = e.parentElement) out.push((e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.split(/\s+/).slice(0, 2).join('.') : e.tagName)); return out.slice(0, 7).join(' < ') }
  return {
    weekRoots: [...document.querySelectorAll('[id$="Week"], .week')].map(e => e.id + '|' + e.className + '|days=' + e.querySelectorAll('.day').length + '|hidden=' + (e.offsetParent === null)),
    pucks: [...document.querySelectorAll('.puck.allavail')].map(path).slice(0, 12),
    counts: [...document.querySelectorAll('.oilcount')].map(e => path(e) + ' :: ' + e.outerHTML.slice(0, 260)).slice(0, 8),
    probeRow: [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /probe/.test(e.textContent || '') || (e.value === 'probe')).map(path).slice(0, 6),
  }
})
console.log('WHERE', JSON.stringify(where, null, 1))
await page.evaluate(() => window.openScheduler ? window.openScheduler(5) : null)
await page.waitForTimeout(400)
const board = await page.evaluate(() => ({ open: !!document.querySelector('#sbBoard'), counts: [...document.querySelectorAll('#sbBoard .oilcount')].map(e => e.outerHTML.slice(0, 260)), pucks: document.querySelectorAll('#sbBoard .puck.allavail').length }))
console.log('BOARD', JSON.stringify(board, null, 1))
await page.screenshot({ path: 'test-results/aa-probe-board.png' })
console.log('errors', JSON.stringify(errs))
await browser.close()
