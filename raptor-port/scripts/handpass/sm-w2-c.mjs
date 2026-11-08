// W2 part C: on U (loaded): Help -> Report a problem (S10.3); input window refusals S12 (new, edit, delete, re-date); publish reachability S14; print/export S5 probe.
import * as L from './sm-lib.mjs'
import { readFileSync } from 'node:fs'
console.log('sm-w2-c v1')
const OUT = L.outDir('w2')
const ORIGIN = 'http://localhost:4393'
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/e63929f0a8c01089/bf4e1ab0-4906-4138-afef-e67911a71441/scratchpad'
const state = JSON.parse(readFileSync(SCR + '/w2-state.json', 'utf8'))
const { key2 } = JSON.parse(readFileSync(SCR + '/w2-key.json', 'utf8'))
const step = async (k, fn) => { try { const r = await fn(); console.log(k, JSON.stringify(r)); return r } catch (e) { console.log(k, 'ERR', e.message.split('\n')[0]) } }
const size = process.env.SZ || 'pc'
const U = await L.launch(size, { origin: ORIGIN, state, init: L.damageInit(key2) })
const { page } = U
await L.signIn(U)
const nInputs = await page.evaluate(() => (window.INPUTS || []).length)
console.log('inputs in memory', nInputs)
// S10.3 Help
await step('help', async () => {
  await page.evaluate(() => window.go('help')); await L.sleep(1000)
  const found = await page.evaluate(() => [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && e.getBoundingClientRect().width > 0 && /report a problem/i.test(e.textContent)).map(e => e.tagName + ':' + e.textContent.trim().slice(0, 60)))
  return found
})
await L.pic(U, OUT, `s10-${size}-help`, { clip: { x: 0, y: 0, width: page.viewportSize().width, height: Math.min(page.viewportSize().height, 800) } })
await step('help.press', async () => {
  const l = page.locator('text=/report a problem/i').filter({ visible: true }).first()
  if (!(await l.count())) return 'no control'
  await L.press(U, l); await L.sleep(800)
  return page.evaluate(() => ({ page: window.CURPAGE, dialogs: [...document.querySelectorAll('[data-testid^="win-"],dialog,.modal')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.dataset.testid || e.className) + ':' + e.innerText.slice(0, 120).replace(/\s+/g, ' ')) }))
})
await L.pic(U, OUT, `s10-${size}-help-report-opened`, { clip: { x: 0, y: 0, width: page.viewportSize().width, height: Math.min(page.viewportSize().height, 860) } })
await page.keyboard.press('Escape'); await L.sleep(300)
// S12 new input into U
await L.goEdit(U)
await step('s12.new', async () => {
  await L.fillNew(U, { who: 'Saint', type: 'Meeting', iso: '2026-07-16', remarks: 'Safety brief' })
  await page.locator('#inpEditSave').click(); await L.sleep(500)
  return { toast: await L.toastText(page), winOpen: await page.locator(L.T('win-inputedit')).count(), inputs: await page.evaluate(() => (window.INPUTS || []).length) }
})
await L.pic(U, OUT, `s12-${size}-new-refusal`, { clip: { x: 0, y: 0, width: page.viewportSize().width, height: page.viewportSize().height } })
await step('s12.dismiss', async () => { // tap away, tap the box again, type its value
  await page.locator('#inpEditRmk').first().click().catch(() => {}); await L.sleep(300)
  await page.locator('#inpEditRmk').first().fill('Safety brief 2').catch(() => {})
  return { rmk: await page.locator('#inpEditRmk').first().inputValue().catch(() => null) }
})
await step('s12.close', async () => {
  const c = page.locator('[data-testid="win-inputedit"] [data-winclose], [data-testid="win-inputedit"] .winx, [data-testid="win-inputedit"] button').filter({ hasText: /^(✕|×|Close|Cancel)$/ }).first()
  if (await c.count()) { await c.click(); await L.sleep(500) } else await page.keyboard.press('Escape')
  await L.sleep(400)
  const dirty = await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0 && /lose|discard|keep/i.test(b.textContent)).map(b => b.textContent.trim()))
  return { winOpen: await page.locator(L.T('win-inputedit')).count(), dirty }
})
// S14: publish controls on U
await step('s14.controls', async () => page.evaluate(() => [...document.querySelectorAll('#eWeek [data-beak],#eWeek [data-alpub],#eWeek [data-pubday],#eWeek button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim().slice(0, 24)).filter(Boolean)))
await step('s14.openBoardTry', async () => {
  await page.evaluate(() => window.openScheduler(2)); await L.sleep(1200)
  return page.evaluate(() => ({ board: !!document.querySelector('#schedBoard'), txt: (document.querySelector('#schedBoard') || {}).innerText && document.querySelector('#schedBoard').innerText.slice(0, 300) }))
})
await L.pic(U, OUT, `s14-${size}-board-try-by-code`, { clip: { x: 0, y: 0, width: page.viewportSize().width, height: page.viewportSize().height } })
await step('errs', async () => U.errs)
await L.closeAll(U)
console.log('DONE')
