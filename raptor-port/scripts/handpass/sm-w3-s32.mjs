// W3 S32 — keyboard on the marked name and the warning buttons, 2560 wide eye, member's list. node sm-w3-s32.mjs pc
import * as L from './sm-lib.mjs'
const size = 'pc'
console.log('sm-w3-s32 v1', size)
const OUT = L.outDir('w3')
const res = {}
const step = async (k, fn) => { try { res[k] = await fn(); console.log(k, JSON.stringify(res[k])) } catch (e) { res[k] = { err: e.message.split('\n')[0] }; console.log(k, 'ERR', res[k].err) } }
const W = await L.launch(size, { origin: 'http://localhost:4394' })
const P = W.page
await L.signIn(W)
await L.publishDay(W, 2); await L.closeBoard(W)
await L.fileInput(W, { who: 'Bolt', type: 'LL', iso: '2026-07-15' })
await L.goEdit(W)
const active = () => P.evaluate(() => { const a = document.activeElement; if (!a) return null; const cs = getComputedStyle(a); const r = a.getBoundingClientRect(); return { tag: a.tagName, cls: String(a.className).slice(0, 40), text: a.textContent.trim().slice(0, 30), title: (a.title || '').slice(0, 30), outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, boxShadow: cs.boxShadow.slice(0, 60), deco: cs.textDecorationLine + ' ' + cs.textDecorationStyle, x: Math.round(r.x), y: Math.round(r.y) } })
// ---- Tab to the marked Unavailable name on Wed
await step('a.tabindex', () => P.evaluate(() => { const row = [...document.querySelectorAll('#eWeek section.day[data-day="2"] .sec-unav .pl-row')].find(r => r.textContent.includes('Bolt')); const n = row.querySelector('.nm .ntx'); return { tag: n.tagName, tabindex: n.getAttribute('tabindex'), role: n.getAttribute('role'), parentTag: n.parentElement.tagName } }))
await L.center(P, '#eWeek section.day[data-day="2"] .sec-unav')
// focus the control just before the section, then Tab forward until the Bolt name has focus
await P.evaluate(() => { const s = document.querySelector('#eWeek section.day[data-day="2"] .sec-unav'); const first = s.querySelector('button, input, select, [tabindex]'); const prev = document.createElement('button'); prev.id = 'smprobe'; prev.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0'; s.parentElement.insertBefore(prev, s); prev.focus() })
let hit = null
for (let i = 0; i < 60 && !hit; i++) { await P.keyboard.press('Tab'); const a = await active(); if (a && /Bolt/.test(a.text) || (a && a.cls.includes('ntx'))) hit = { i, ...a } }
res['a.tab-to-name'] = hit; console.log('a.tab-to-name', JSON.stringify(hit))
if (hit) { await L.pic(W, OUT, 's32-pc-a-focus-name', { clip: { x: Math.max(0, hit.x - 40), y: Math.max(0, hit.y - 40), width: 420, height: 90 } }) }
await step('a.enter-opens', async () => { await P.keyboard.press('Enter'); await L.sleep(900); return P.evaluate(() => { const w = document.querySelector('[data-testid="win-inputedit"]'); return { open: !!(w && w.getBoundingClientRect().width) } }) })
await P.screenshot({ path: OUT + '/s32-pc-a-enter-window.png' })
await P.keyboard.press('Escape'); await L.sleep(600)
await step('a.after-escape', () => P.evaluate(() => { const w = document.querySelector('[data-testid="win-inputedit"]'); return { open: !!(w && w.getBoundingClientRect().width), focus: document.activeElement && (document.activeElement.className + '').slice(0, 30) } }))
// ---- Tab to the warning buttons on Tue
await L.center(P, '#eWeek section.day[data-day="1"] [data-daywarn="1"]')
const o = await P.evaluate(() => document.querySelector('#eWeek section.day[data-day="1"] [data-dwbox="1"]').classList.contains('open'))
if (!o) { await P.locator('#eWeek section.day[data-day="1"] [data-daywarn="1"]').first().click(); await L.sleep(500) }
await step('b.focus-first-mute', async () => { await P.locator('#eWeek section.day[data-day="1"] [data-woff="1.0"]').first().focus(); await L.sleep(200); return active() })
await P.keyboard.press('Tab'); await P.keyboard.press('Shift+Tab'); await L.sleep(200)
const b0 = await active(); console.log('b.focus-after-tab-shifttab', JSON.stringify(b0))
await L.pic(W, OUT, 's32-pc-b-focus-hide', { clip: { x: Math.max(0, b0.x - 400), y: Math.max(0, b0.y - 40), width: 520, height: 110 } })
await step('b.enter-hides', async () => { await P.keyboard.press('Enter'); await L.sleep(600); return P.evaluate(() => { const e = document.querySelector('#eWeek [data-woff="1.0"]'); return { hasReset: !!(e && e.querySelector('svg.wmuteico')), title: e && e.title, focusNow: document.activeElement && (document.activeElement.dataset.woff || document.activeElement.tagName) } }) })
await step('b.focus-on-reset', async () => { const a = await active(); return a })
await L.pic(W, OUT, 's32-pc-b-after-enter', { sel: '#eWeek section.day[data-day="1"] [data-dwbox="1"]', pad: 10 })
await step('b.space-flags-again', async () => { await P.locator('#eWeek section.day[data-day="1"] [data-woff="1.0"]').first().focus(); await P.keyboard.press('Space'); await L.sleep(600); return P.evaluate(() => { const e = document.querySelector('#eWeek [data-woff="1.0"]'); return { hasReset: !!(e && e.querySelector('svg.wmuteico')), text: e && e.textContent.trim(), bar: document.querySelector('#eWeek section.day[data-day="1"] .daywarn').innerText.replace(/\s+/g, ' ').trim() } }) })
// ---- 2560 wide: the eye in the selector and banner
await step('c.resize-2560', async () => { await P.setViewportSize({ width: 2560, height: 1300 }); await L.sleep(800); return 'ok' })
await L.center(P, '#eWeek section.day[data-day="2"] [data-planmenu="2"]')
await L.press(W, '#eWeek section.day[data-day="2"] [data-planmenu="2"]'); await L.sleep(500)
await L.press(W, P.locator('.wavemenu [data-planpv]').first()); await L.sleep(1000)
await step('c.eyes', () => P.evaluate(() => [...document.querySelectorAll('#eWeek section.day[data-day="2"] svg.pveye')].filter(s => s.getBoundingClientRect().width).map(s => { const r = s.getBoundingClientRect(); return [+r.width.toFixed(1), +r.height.toFixed(1), s.parentElement.className] })))
await L.center(P, '#eWeek section.day[data-day="2"] .dprev-bar')
await L.pic(W, OUT, 's32-pc-c-2560-eye', { sel: '#eWeek section.day[data-day="2"] .dprev-bar', pad: 200 })
await step('c.board-2560', async () => { await L.openBoard(W, 2); return P.evaluate(() => [...document.querySelectorAll('#schedBoard svg.pveye')].filter(s => s.getBoundingClientRect().width).map(s => { const r = s.getBoundingClientRect(); return [+r.width.toFixed(1), +r.height.toFixed(1)] })) })
await L.pic(W, OUT, 's32-pc-c-2560-board', { clip: { x: 0, y: 0, width: 2560, height: 330 } })
console.log('errs', JSON.stringify(W.errs))
L.saveJson(OUT, 's32-pc-results', res)
await L.closeAll(W)
