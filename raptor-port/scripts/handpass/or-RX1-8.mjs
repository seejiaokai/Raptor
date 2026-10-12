// RX1-8 — the switch OFF ("members may file duties for others"): Ranger cannot pick other people; his own Personal input still saves
import { launch, openWorld, fileX, shotX, inputOf, errs, log, as, bellRead, describeWin, WIN, csId } from './or-RX1-lib.mjs'
const browser = await launch()
const { page: p } = await openWorld(browser, { fresh: false })
const badge = () => p.evaluate(() => document.getElementById('roleBadge').textContent)
log('signed in as', await badge())
await p.evaluate(() => window.go('inputs')); await p.waitForTimeout(300)
await p.locator('#inGear').click(); await p.waitForTimeout(400)
const sw = p.locator('[data-testid="iset-memberfile"]')
log('switch before (checked)', await sw.isChecked())
log('settings window text', await p.locator('[data-testid="win-inputsset"]').innerText().then(t => t.replace(/\s+/g, ' ').slice(0, 500)))
await shotX(p, 'rx1-8-1-gear-before')
await sw.uncheck(); await p.waitForTimeout(250)
await shotX(p, 'rx1-8-2-gear-off')
const tm = await p.evaluate(() => (window.__toasts || []).length)
await p.locator('[data-testid="win-inputsset"] button', { hasText: /^Save$/ }).click(); await p.waitForTimeout(600)
log('saved: toasts', await p.evaluate(m => (window.__toasts || []).slice(m).map(t => t.text), tm), 'window open', await p.locator('[data-testid="win-inputsset"]').count())
await as(p, 'Ranger'); log('now', await badge())
await p.evaluate(() => window.go('inputs')); await p.waitForTimeout(300)
if (await p.locator('#inListBtn[aria-pressed="false"]').count()) await p.locator('#inListBtn').click()
await p.waitForTimeout(300)
await p.locator('#inNew').click(); await p.locator(WIN).waitFor()
await p.selectOption('#inpEditType', 'Personal'); await p.waitForTimeout(250)
const dd = await describeWin(p)
log('new window as Ranger (switch off): several switch', await p.locator(`${WIN} [data-testid="pp-several"]`).count(), '| person select options', await p.evaluate(sel => { const s = document.querySelector(sel + ' #inpEditPerson'); return s ? { disabled: s.disabled, n: s.options.length, selected: [...s.options].filter(o => o.selected).map(o => o.textContent.trim()), first: [...s.options].slice(0, 5).map(o => o.textContent.trim()) } : 'no select' }, WIN))
log('text', dd.text.slice(0, 400), '| buttons', dd.buttons.map(b => b.id + ':' + b.text).filter(t => t.length > 3))
await shotX(p, 'rx1-8-3-ranger-new-window')
/* is there ANY way to pick another person? try the several switch if present */
if (await p.locator(`${WIN} [data-testid="pp-several"]`).count()) { await p.locator(`${WIN} [data-testid="pp-several"]`).click({ force: true }).catch(() => {}); await p.waitForTimeout(300); log('after pressing several: picker', await p.evaluate(sel => ({ n: document.querySelectorAll(sel + ' [data-pp]').length, pressed: [...document.querySelectorAll(sel + ' [data-pp][aria-pressed="true"]')].map(b => (window.PEOPLE[b.getAttribute('data-pp')] || {}).cs) }), WIN)); await shotX(p, 'rx1-8-4-after-several') }
/* options of the person select: can he pick Hex? */
const opts = await p.evaluate(sel => { const s = document.querySelector(sel + ' #inpEditPerson'); return s ? [...s.options].map(o => o.textContent.trim()) : null }, WIN)
log('person select options (all)', opts)
await p.locator('#inpEditCancel').click(); await p.waitForTimeout(200)
/* RX1-7's filing again: Hex and Hunter - through the controls as far as they go */
const had = await p.evaluate(() => window.INPUTS.map(r => r.iid))
let route = ''
try {
  await p.locator('#inNew').click(); await p.locator(WIN).waitFor()
  await p.selectOption('#inpEditType', 'Personal')
  if (await p.locator(`${WIN} [data-testid="pp-several"]`).count()) { await p.locator(`${WIN} [data-testid="pp-several"]`).click({ timeout: 3000 }); route += 'several-pressed;' } else route += 'no-several-switch;'
  const hex = await csId(p, 'Hex')
  const hb = p.locator(`${WIN} [data-pp="${hex}"]`)
  if (await hb.count()) { await hb.click({ timeout: 3000 }).catch(() => { route += 'hex-click-failed;' }); route += 'hex-clicked;' } else route += 'no-hex-puck;'
  const sel = p.locator('#inpEditPerson')
  if (await sel.count()) { const r = await sel.selectOption(hex, { timeout: 3000 }).catch(e => 'select-hex-failed'); route += 'select:' + JSON.stringify(r) + ';' }
} catch (e) { route += 'err:' + String(e).slice(0, 120) }
log('route trying to pick Hex', route)
await shotX(p, 'rx1-8-5-trying-hex')
const pickedNow = await p.evaluate(sel => { const w = document.querySelector(sel); const s = w.querySelector('#inpEditPerson'); return { select: s ? [...s.options].filter(o => o.selected).map(o => o.textContent.trim()) : null, pressed: [...w.querySelectorAll('[data-pp][aria-pressed="true"]')].map(b => (window.PEOPLE[b.getAttribute('data-pp')] || {}).cs), head: (w.querySelector('[id*=ead], .win-title, h3') || {}).innerText } }, WIN)
log('what is picked', pickedNow, '| window head text', (await describeWin(p)).text.slice(0, 160))
await p.locator('#inpEditCancel').click().catch(() => {}); await p.waitForTimeout(250)
log('INPUTS gained', await p.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).length, had))
/* his own Personal input still saves */
const f = await fileX(p, { type: 'Personal', from: '2026-07-15', to: '2026-07-15', timed: ['12:00', '13:00'] })
log('own Personal filed', f.made, 'toasts', f.toasts, 'stillOpen', f.stillOpen, f.winText)
await shotX(p, 'rx1-8-6-own-saved')
log('errs', errs)
await browser.close()
