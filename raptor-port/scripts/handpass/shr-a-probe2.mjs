// shr-a-probe2 — walker A's look (no assertions): the type list of the Inputs window, the input window opened from a
// Board row's label, and on a phone what a puck tap opens.
import { L, J, sleep, world, openBoard, fixture, boxSel, pressAt, pic, TAG } from './shr-a-lib.mjs'
import { writeFileSync } from 'node:fs'
console.log('shr-a-probe2 v1', TAG)
const w = await world(); const p = w.page
await L.openDay(w, L.WED); await L.press(w, '#icPopAdd'); await p.locator('#inpEditPop #inpEditType').waitFor()
console.log('TYPES', J(await p.evaluate(() => [...document.querySelectorAll('#inpEditPop #inpEditType option')].map(o => o.value + '=' + o.textContent.trim()))))
await p.keyboard.press('Escape'); await sleep(400)
const d = p.getByRole('button', { name: /Discard|Close it/ }).first(); if (await d.count()) await d.click().catch(() => {})
if (await p.locator('[data-testid="win-inputsday-x"]').count()) await L.press(w, '[data-testid="win-inputsday-x"]')
await fixture(w); await openBoard(w)
await pressAt(w, (await boxSel(p, 'Ranger', 'str')).replace(/\[data-ifld="(.+)~bane\.str"\]/, '[data-inprow="$1~bane"] .inpedit'))
await sleep(500)
console.log('WINDOW', J(await p.evaluate(() => { const win = document.querySelector('[data-testid="win-inputedit"]') || document.querySelector('#inpEditPop'); if (!win) return 'none'; return { html: win.outerHTML.length, buttons: [...win.querySelectorAll('button')].filter(b => b.offsetWidth).map(b => `${b.id}|${b.getAttribute('data-testid')}|${b.textContent.trim().slice(0, 30)}`), inputs: [...win.querySelectorAll('input,select,textarea')].filter(b => b.offsetWidth).map(b => `${b.id}|${b.type}|${b.value}`), pp: [...win.querySelectorAll('[data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')), text: win.innerText.slice(0, 600) } })))
await p.screenshot({ path: `${L.OUT}/win.png` })
await p.keyboard.press('Escape'); await sleep(500)
if (w.tap) {
  await pressAt(w, '#schedBoard [data-inpseat$="~bane"] [data-person="bane"]'); await sleep(500)
  await p.screenshot({ path: `${L.OUT}/puck.png` })
  console.log('AFTER PUCK', J(await p.evaluate(() => [...document.querySelectorAll('body *')].filter(e => /arm|drawer|palette/i.test(e.className) && e.offsetWidth).slice(0, 15).map(e => e.tagName + '.' + e.className + ' ' + (e.innerText || '').slice(0, 80)))))
} else {
  console.log('PALETTE', J(await p.evaluate(() => { return [...document.querySelectorAll("[data-person=\"pike\"]")].map(e => e.outerHTML.slice(0, 160) + " PARENT " + e.parentElement.className + " / " + e.parentElement.parentElement.className + " vis " + e.offsetWidth) })))
}
await L.finish()
