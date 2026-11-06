console.log('[inp1106-walk-w1 v1]')
import { open, sleep, OUT } from './inp1106-walk-lib.mjs'
import path from 'node:path'
const { br, p, errs, shot } = await open('desk')
const log = (...a) => console.log(...a)
await p.click('#inListBtn'); await sleep(300); await p.click('#inRangeBtn'); await sleep(200); await p.click('#inRangeAll'); await sleep(600)
const ths = await p.$$eval('#intbl thead th[data-sort]', els => els.map(e => ({ s: e.dataset.sort, t: e.textContent.trim(), tab: e.tabIndex, role: e.getAttribute('role'), as: e.getAttribute('aria-sort') })))
log('headings', JSON.stringify(ths))
const active = () => p.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName}#${a.id}.${(a.className + '').slice(0, 30)}[${a.dataset && a.dataset.sort || ''}] "${(a.textContent || '').trim().slice(0, 20)}"` : 'none' })
const ariaAll = () => p.$$eval('#intbl thead th[data-sort]', els => els.map(e => e.dataset.sort + ':' + (e.getAttribute('aria-sort') || '-') + ':' + e.textContent.trim()).join(' | '))
const firstTypes = () => p.$$eval('#intbl tbody tr', trs => trs.slice(0, 8).map(tr => tr.innerText.replace(/\s+/g, ' ').slice(0, 60)))
// find the search box
const search = await p.$$eval('input', els => els.filter(e => e.offsetWidth > 0).map(e => e.id + '/' + e.type + '/' + e.placeholder))
log('visible inputs', JSON.stringify(search))
const sbox = p.locator('input[type=search], #inSearch, input[placeholder*="earch" i]').first()
await sbox.focus(); log('start focus:', await active())
let found = null
for (let i = 1; i <= 15; i++) {
  await p.keyboard.press('Tab'); const a = await active(); log(`Tab ${i}:`, a)
  if (/\[(name|start|end|type|remarks|changed)\]/.test(a)) { found = i; break }
}
log('first heading reached at Tab', found)
// walk the headings in order to Type
let a = await active()
for (let i = 0; i < 6 && !/\[type\]/.test(a); i++) { await p.keyboard.press('Tab'); a = await active(); log('  Tab on:', a) }
await shot('w1-desk-tab-on-type')
await p.screenshot({ path: path.join(OUT, 'w1-desk-ring-type-crop.png'), clip: await p.locator('#intbl thead').boundingBox() })
log('before Enter', await ariaAll()); log(JSON.stringify(await firstTypes()))
await p.keyboard.press('Enter'); await sleep(400)
log('after Enter', await ariaAll()); const r1 = await firstTypes(); log(JSON.stringify(r1)); log('focus now:', await active())
const txt = await p.locator('#intbl thead th[data-sort="type"]').innerText(); log('Type heading text:', JSON.stringify(txt))
await shot('w1-desk-enter-type-asc')
await p.screenshot({ path: path.join(OUT, 'w1-desk-enter-type-asc-crop.png'), clip: await p.locator('#intbl thead').boundingBox() })
await p.keyboard.press('Space'); await sleep(400)
log('after Space', await ariaAll()); const r2 = await firstTypes(); log(JSON.stringify(r2)); log('focus now:', await active())
await shot('w1-desk-space-type-desc')
await p.screenshot({ path: path.join(OUT, 'w1-desk-space-crop.png'), clip: await p.locator('#intbl thead').boundingBox() })
log('reversed?', JSON.stringify(r1) !== JSON.stringify(r2))
const before = await ariaAll(), rowsB = JSON.stringify(await firstTypes())
await p.keyboard.press('a'); await sleep(300)
log('after a: unchanged =', before === await ariaAll() && rowsB === JSON.stringify(await firstTypes()), '; focus', await active())
await p.keyboard.press('Shift+Tab'); await sleep(200); log('Shift+Tab ->', await active())
await shot('w1-desk-shift-tab')
// mouse click on Start
await p.locator('#intbl thead th[data-sort="start"]').click(); await sleep(400)
log('after mouse click Start', await ariaAll()); log('focus now:', await active())
const ring = await p.evaluate(() => { const e = document.querySelector('#intbl thead th[data-sort="start"]'); const s = getComputedStyle(e); return { focusVisible: e.matches(':focus-visible'), focus: e.matches(':focus'), outline: s.outlineStyle + ' ' + s.outlineWidth + ' ' + s.outlineColor, shadow: s.boxShadow } })
log('mouse-click ring', JSON.stringify(ring))
await shot('w1-desk-mouse-click-start')
await p.screenshot({ path: path.join(OUT, 'w1-desk-mouse-click-start-crop.png'), clip: await p.locator('#intbl thead').boundingBox() })
// keyboard ring computed style for comparison
await p.keyboard.press('Tab'); await p.keyboard.press('Shift+Tab'); await sleep(200)
const ring2 = await p.evaluate(() => { const e = document.activeElement; const s = getComputedStyle(e); return { focusVisible: e.matches(':focus-visible'), outline: s.outlineStyle + ' ' + s.outlineWidth + ' ' + s.outlineColor, shadow: s.boxShadow } })
log('keyboard ring', JSON.stringify(ring2))
log('ERRORS', JSON.stringify(errs))
await br.close()
