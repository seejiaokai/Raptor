/* host probe — [KEYBOARD-SCROLL] his iPhone report (19 Oct 26): after rows are added on the Scheduler Board (a duty row, an
   AMT or OFT sim row), is the box tapped in a new row still brought above the keys? And the duty role's pick-list. */
import { open, version, KB, GAP } from './kbs-A-lib.mjs'
version('host-rows-1')
const { browser, page } = await open()
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
await page.evaluate(() => window.openScheduler(0)); await page.waitForTimeout(900)
const H = await page.evaluate(() => innerHeight)
const keys = (up) => page.evaluate(([up, kb]) => { const v = window.__vv; v.height = up ? innerHeight - kb : innerHeight; v.dispatchEvent(new Event('resize')) }, [up, KB])
const press = async (loc) => { await loc.evaluate(e => e.scrollIntoView({ block: 'center' })); const b = await loc.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + Math.min(8, b.height / 2)); await page.waitForTimeout(400) }
const report = async (tag, loc) => {
  const r = await loc.evaluate(e => { const b = e.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom), focused: document.activeElement === e, tag: e.tagName + '.' + e.className } })
  const menu = await page.evaluate(() => { const m = document.querySelector('.wavemenu'); if (!m) return null; const b = m.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom) } })
  console.log(tag, JSON.stringify(r), 'menu', JSON.stringify(menu), 'keysTop', H - KB, r.bottom <= H - KB - GAP + 1 ? 'IN SIGHT' : 'COVERED')
}
for (const [sel, name] of [['[data-dradd]', 'duty'], ['[data-sradd$=".amt"]', 'amt'], ['[data-sradd$=".oft"]', 'oft']]) {
  const add = page.locator(`#schedBoard ${sel}:visible`).first()
  if (!(await add.count())) { console.log(name, 'NO ADD BUTTON'); continue }
  for (let i = 0; i < 3; i++) { await press(add); await page.keyboard.press('Escape').catch(() => {}); await page.mouse.click(2, 2); await page.waitForTimeout(200) }
  await page.evaluate(() => document.activeElement?.blur?.())
  /* the last row's last box in that section */
  const sec = await add.evaluate(e => { const s = e.closest('.sb-sec, .sb-wave, .dwave, section') ; return s ? null : null })
  const boxes = add.locator('xpath=ancestor::*[contains(@class,"sb-")][1]/following::input[1]')
  const box = page.locator(`#schedBoard input:visible, #schedBoard textarea:visible`).filter({ has: page.locator('xpath=self::*') })
  const all = await page.evaluate(s => { const a = document.querySelector('#schedBoard ' + s); const sc = a && (a.closest('.sb-sec') || a.parentElement.parentElement); const list = sc ? [...sc.querySelectorAll('input, textarea')].filter(x => x.offsetWidth) : []; const last = list[list.length - 1]; if (last) last.setAttribute('data-kbprobe', '1'); return list.length }, sel + ':not([hidden])')
  const target = page.locator('[data-kbprobe="1"]').first()
  await target.evaluate(e => { let s = e.parentElement; while (s && !(/(auto|scroll)/.test(getComputedStyle(s).overflowY) && s.scrollHeight > s.clientHeight + 1)) s = s.parentElement; if (s) s.scrollTop += e.getBoundingClientRect().bottom - (innerHeight - 40) })
  await page.waitForTimeout(600)
  const b = await target.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + Math.min(8, b.height / 2)); await page.waitForTimeout(400)
  await keys(true); await page.waitForTimeout(400)
  await report(name + ' (' + all + ' boxes)', target)
  await page.screenshot({ path: `docs/img/handpass/2026-10-19-keyboard-scroll/walk/host-rows-${name}.png` })
  await keys(false); await page.waitForTimeout(300)
  await page.evaluate(() => { document.activeElement?.blur?.(); document.querySelector('[data-kbprobe]')?.removeAttribute('data-kbprobe') })
}
await browser.close()
