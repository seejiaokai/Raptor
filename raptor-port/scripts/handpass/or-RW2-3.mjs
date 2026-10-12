// RW2-3: a Meeting of three NOT on the programme, no one added, re-timed in its window; History on -> its Personal Inputs line wears a dot, bubble tells the change.
import * as L from './or-RW2-lib.mjs'
import { writeFileSync } from 'node:fs'
const { browser, page: p, errs } = await L.openWorld()
const j = o => JSON.stringify(o)
const DI = 2, ISO = '2026-07-15'
const out = {}
const mt = (await L.fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: ISO, to: ISO, timed: ['09:00', '10:00'], title: 'Range brief' }))[0]
const iid = mt.iid
console.log('filed:', j(mt))
await L.openBoard(p, DI)
const ri = await L.rowIdx(p, DI, iid)
const del = p.locator('#schedBoard [data-grdel="' + DI + '.' + ri + '"]').first(); await del.scrollIntoViewIfNeeded()
let m = await L.toastMark(p); await del.click(); await p.waitForTimeout(700)
console.log('x pressed toast:', await L.toastsSince(p, m), '| row in DAYS:', await L.rowIdx(p, DI, iid))
await L.closeBoard(p)
// re-time in its own window
await L.openFromList(p, iid)
const winInfo = await p.evaluate(sel => (document.querySelector(sel)?.innerText || '').replace(/\s+/g, ' ').slice(0, 400), L.WIN)
console.log('window text:', winInfo)
await L.shot(p, 'rw2-3-0-window')
m = await L.toastMark(p)
await p.fill('#inpEditStart', '10:00'); await p.fill('#inpEditEnd', '11:00')
await p.locator('#inpEditSave').click(); await p.waitForTimeout(700)
for (let k = 0; k < 3; k++) { if (await p.locator('[data-testid="oilconf"]').count()) { console.log('oil sheet opened'); break } }
console.log('re-time toast:', await L.toastsSince(p, m), '| INPUTS:', j(await L.rec(p, iid)), '| window open:', await p.locator(L.WIN).count(), '| row in DAYS:', await L.rowIdx(p, DI, iid))
await L.goEdit(p)
const day = () => p.locator('#eWeek .day:not(.peek)').nth(DI)
await day().locator('.sec-inp').first().scrollIntoViewIfNeeded(); await p.waitForTimeout(300)
console.log('Personal Inputs section text (history off):', (await day().locator('.sec-inp').first().innerText()).replace(/\s+/g, ' ').slice(0, 300))
await L.shot(p, 'rw2-3-1-before-history')
await p.locator('#histBtn').click(); await p.waitForTimeout(1200)
const dots = () => p.evaluate(di => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; return [...d.querySelectorAll('[data-histdot]')].filter(e => e.getClientRects().length).map(e => ({ tag: e.tagName, sec: (e.closest('[class*="sec-"]')?.className || '').toString().slice(0, 30), row: (e.closest('[data-inprow], .pl-row, .inprow')?.innerText || e.parentElement?.innerText || '').replace(/\s+/g, ' ').slice(0, 70), attrs: [...e.attributes].filter(a => /^data-/.test(a.name)).map(a => a.name + '=' + a.value).join(' ').slice(0, 90) })) }, DI)
out.dots = await dots(); console.log('dots on Wed (history on, section as it stands):', j(out.dots))
console.log('sec-inp html (head):', (await day().locator('.sec-inp').first().evaluate(e => e.outerHTML)).replace(/\s+/g, ' ').slice(0, 700))
{ const sh = day().locator('.sec-inp').first().getByText(/show/i).first(); if (await sh.count()) { await sh.click(); await p.waitForTimeout(600); console.log('pressed "show"; section now:', (await day().locator('.sec-inp').first().innerText()).replace(/\s+/g, ' ').slice(0, 300)) } }
out.dots2 = await dots(); console.log('dots on Wed (after unfolding):', j(out.dots2))
await day().locator('.sec-inp').first().scrollIntoViewIfNeeded(); await p.waitForTimeout(300)
await L.shot(p, 'rw2-3-2-history-on')
const dl = day().locator('.sec-inp [data-histdot]')
const dn = await dl.count(); console.log('dots in Personal Inputs:', dn)
out.taps = []
for (let i = 0; i < dn; i++) {
  const el = dl.nth(i)
  await el.scrollIntoViewIfNeeded(); await el.click({ force: true }).catch(() => {}); await p.waitForTimeout(600)
  const bub = await p.evaluate(() => [...document.querySelectorAll('.histbub')].map(b => b.innerText.replace(/\s+/g, ' ').trim()))
  const nm = await L.shot(p, 'rw2-3-3-dot-' + i)
  console.log('DOT', i, 'bubble=', j(bub)); out.taps.push({ bub, nm })
  await p.keyboard.press('Escape'); await p.waitForTimeout(200)
}
// the changes window for context
await p.evaluate(() => window.scrollTo(0, 0))
if (!(await p.evaluate(() => !!document.querySelector('.chgwin:not([hidden])')))) { await p.locator('#histBtn').click(); await p.waitForTimeout(800) }
await p.locator('.chgwin .win-tab', { hasText: 'All changes' }).click(); await p.waitForTimeout(400)
await p.locator('.chgwin .cw-day', { hasText: 'Wed' }).click(); await p.waitForTimeout(500)
out.lines = await p.evaluate(() => [...document.querySelectorAll('.chgwin .cw-l, .chgwin .cw-gh')].map(b => b.className.slice(0, 12) + ' :: ' + (b.innerText || '').replace(/\s+/g, ' ')))
console.log('LINES:', j(out.lines))
await L.shot(p, 'rw2-3-4-all-changes')
console.log('ERRORS', errs.join(' | ') || 'none')
writeFileSync(L.PARTS + '/or-RW2-3-raw.json', j(out))
await browser.close()
