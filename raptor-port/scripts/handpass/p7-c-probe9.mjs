/* p7 walker C — probe 9: the three list editors (stores, Quals columns, Leave War counters) — their controls. */
import { boot, world } from './p6-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await world(L)
await W.boardOn(p, 1)
const cfg = p.locator('#schedBoard [data-stcfg]:visible').first()
await cfg.evaluate(e => e.scrollIntoView({ block: 'center' })); await cfg.click(); await L.sleep(400)
console.log('STMENU', await p.evaluate(() => document.querySelector('.stmenu')?.outerHTML.slice(0, 2500)))
const pen = p.locator('.stmenu .st-pen').first()
if (await pen.count()) { await pen.click(); await L.sleep(400); console.log('STMENU EDIT', await p.evaluate(() => document.querySelector('.stmenu')?.outerHTML.slice(0, 4000))) }
await L.shot(p, 'probe9-stores')
await p.keyboard.press('Escape'); await L.sleep(300)
await W.boardOff(p)
await L.go(p, 'quals'); await L.sleep(500)
console.log('QUALS buttons', await p.evaluate(() => [...document.querySelectorAll('#page-quals button, [data-page="quals"] button')].filter(e => e.offsetParent !== null).map(e => (e.id || e.className) + ':' + e.innerText.trim().slice(0, 30)).slice(0, 40)))
const eq = p.locator('button', { hasText: /Edit quals/i }).first()
if (await eq.count()) { await eq.click(); await L.sleep(500)
  console.log('QUALS EDITOR', await p.evaluate(() => { const d = [...document.querySelectorAll('[role=dialog], .modal, .sheet, .airpop:not([hidden])')].filter(e => e.offsetParent !== null || e.getClientRects().length); const e = d[d.length - 1]; return e ? e.outerHTML.slice(0, 5000) : 'no dialog' }))
  await L.shot(p, 'probe9-quals') }
await p.keyboard.press('Escape'); await L.sleep(300)
await L.go(p, 'leavewar'); await p.waitForSelector('[data-testid^="row-"]', { timeout: 15000 }); await L.sleep(800)
console.log('LW top buttons', await p.evaluate(() => [...document.querySelectorAll('#page-leavewar button')].filter(e => e.offsetParent !== null).map(e => (e.getAttribute('data-testid') || e.className) + ':' + e.innerText.trim().slice(0, 20)).slice(0, 40)))
const gear = p.locator('#page-leavewar [data-testid="settings-open"], #page-leavewar button[aria-label*="ettings"], #page-leavewar button:has-text("⚙")').first()
console.log('gear', await gear.count())
if (await gear.count()) { await gear.click(); await L.sleep(500)
  console.log('LW SETTINGS', await p.evaluate(() => { const d = [...document.querySelectorAll('.bidsheet[role="dialog"], [role=dialog]')].filter(e => e.offsetWidth); const e = d[d.length - 1]; return e ? e.outerHTML.slice(0, 5000) : 'no dialog' }))
  await L.shot(p, 'probe9-lw-settings')
  const add = p.locator('[role=dialog] button', { hasText: /\+ ?Counter/i }).first()
  if (await add.count()) { await add.click(); await L.sleep(500)
    console.log('LW COUNTER FORM', await p.evaluate(() => { const d = [...document.querySelectorAll('.bidsheet[role="dialog"], [role=dialog]')].filter(e => e.offsetWidth); const e = d[d.length - 1]; return e ? e.outerHTML.slice(0, 6000) : 'no dialog' }))
    await L.shot(p, 'probe9-lw-counter') }
}
console.log('errors', errors)
await browser.close()
