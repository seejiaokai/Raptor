// RW2-4: a one-person input (Training for Ranger alone), re-timed on its row, re-worded in its window; History lines and dots.
import * as L from './or-RW2-lib.mjs'
import { writeFileSync } from 'node:fs'
const { browser, page: p, errs } = await L.openWorld()
const j = o => JSON.stringify(o)
const DI = 2, ISO = '2026-07-15'
const out = {}
const tr = (await L.fileInput(p, { type: 'Training', person: 'Ranger', from: ISO, to: ISO, timed: ['09:00', '10:00'], title: 'Gun drill' }))[0]
const iid = tr.iid
console.log('filed:', j(tr))
await L.goEdit(p)
const day = () => p.locator('#eWeek .day:not(.peek)').nth(DI)
let ri = await L.rowIdx(p, DI, iid)
console.log('row idx', ri, j(await L.rowData(p, DI, iid)))
await day().locator(`[data-txt="gr:${DI}.${ri}.end"]`).scrollIntoViewIfNeeded(); await p.waitForTimeout(300)
const e = day().locator(`[data-txt="gr:${DI}.${ri}.end"]`); await e.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('11:00'); await e.evaluate(x => x.blur()); await p.waitForTimeout(600)
console.log('re-timed on row; INPUTS:', j(await L.rec(p, iid)))
// re-word in its window
await L.openFromList(p, iid)
await L.shot(p, 'rw2-4-0-window')
let m = await L.toastMark(p)
await p.fill('#inpEditOwnTitle', 'Gun range drill')
await p.locator('#inpEditSave').click(); await p.waitForTimeout(700)
console.log('re-word toast:', await L.toastsSince(p, m), '| INPUTS:', j(await L.rec(p, iid)), '| window open:', await p.locator(L.WIN).count())
await L.goEdit(p)
ri = await L.rowIdx(p, DI, iid)
await p.locator('#histBtn').click(); await p.waitForTimeout(1200)
const dots = () => p.evaluate(di => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; return [...d.querySelectorAll('[data-histdot]')].filter(e => e.getClientRects().length).map(e => ({ tag: e.tagName, sec: (e.closest('[class*="sec-"]')?.className || '').toString().replace(/sub plist one sec /, '').slice(0, 30), row: (e.closest('[data-inprow], .pl-row, .inprow')?.innerText || e.parentElement?.innerText || '').replace(/\s+/g, ' ').slice(0, 70), attrs: [...e.attributes].filter(a => /^data-/.test(a.name)).map(a => a.name + '=' + a.value).join(' ').slice(0, 90) })) }, DI)
out.dotsBefore = await dots(); console.log('dots on Wed (history on, as it stands):', j(out.dotsBefore))
// unfold Personal Inputs if folded
{ const sh = day().locator('.sec-inp').first().getByText(/show/i).first(); if (await sh.count()) { await sh.click(); await p.waitForTimeout(600); console.log('pressed show on Personal Inputs') } }
out.dots = await dots(); console.log('dots on Wed (Personal Inputs open):', j(out.dots))
await day().locator('.sec-grnd').first().scrollIntoViewIfNeeded(); await p.waitForTimeout(300)
await L.shot(p, 'rw2-4-1-ground-history-on')
await day().locator('.sec-inp').first().scrollIntoViewIfNeeded(); await p.waitForTimeout(300)
await L.shot(p, 'rw2-4-2-personal-inputs-history-on')
// tap each dot on the day
const dl = day().locator('[data-histdot]'); const dn = await dl.count(); console.log('dot elements on Wed:', dn)
out.taps = []
for (let i = 0; i < dn; i++) {
  const el = dl.nth(i)
  if (!(await el.evaluate(x => x.getClientRects().length))) continue
  const info = await el.evaluate(x => ({ sec: (x.closest('[class*="sec-"]')?.className || '').toString().replace(/sub plist one sec /, ''), row: (x.closest('.pl-row')?.innerText || '').replace(/\s+/g, ' ').slice(0, 50) }))
  await el.scrollIntoViewIfNeeded(); await el.click({ force: true }).catch(() => {}); await p.waitForTimeout(600)
  const bub = await p.evaluate(() => [...document.querySelectorAll('.histbub')].map(b => b.innerText.replace(/\s+/g, ' ').trim()))
  const nm = await L.shot(p, 'rw2-4-3-dot-' + i)
  console.log('DOT', i, j(info), 'bubble=', j(bub)); out.taps.push({ info, bub, nm })
  await p.keyboard.press('Escape'); await p.waitForTimeout(200)
}
await p.evaluate(() => window.scrollTo(0, 0))
if (!(await p.evaluate(() => !!document.querySelector('.chgwin:not([hidden])')))) { await p.locator('#histBtn').click(); await p.waitForTimeout(800) }
await p.locator('.chgwin .win-tab', { hasText: 'All changes' }).click(); await p.waitForTimeout(400)
await p.locator('.chgwin .cw-day', { hasText: 'Wed' }).click(); await p.waitForTimeout(500)
out.lines = await p.evaluate(() => [...document.querySelectorAll('.chgwin .cw-l, .chgwin .cw-gh')].map(b => b.className.slice(0, 12) + ' :: ' + (b.innerText || '').replace(/\s+/g, ' ')))
console.log('LINES:', j(out.lines))
await L.shot(p, 'rw2-4-4-all-changes')
// tap the lines
out.lineTaps = []
const n = await p.locator('.chgwin .cw-l').count()
for (let i = 0; i < n; i++) {
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(1200)
  const l = p.locator('.chgwin .cw-l').nth(i)
  const txt = (await l.innerText()).replace(/\s+/g, ' ')
  const m2 = await L.toastMark(p)
  await l.click(); await p.waitForTimeout(300)
  const f = await p.evaluate(() => [...document.querySelectorAll('.chgflash, .lift-land')].filter(e => e.getClientRects().length).map(e => ({ cls: e.className.toString().slice(0, 30), text: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 40) })))
  await p.waitForTimeout(400)
  const nm = await L.shot(p, 'rw2-4-5-tap-line' + i)
  console.log('TAP line', i, `"${txt}" toast="${await L.toastsSince(p, m2)}" flash=${j(f)}`)
  out.lineTaps.push({ txt, flash: f, nm })
}
console.log('ERRORS', errs.join(' | ') || 'none')
writeFileSync(L.PARTS + '/or-RW2-4-raw.json', j(out))
await browser.close()
