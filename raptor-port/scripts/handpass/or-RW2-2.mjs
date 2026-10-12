// RW2-2: J2 again - leave for Drifter, Hex, Hunter Wed 15 - Thu 16; Anvil dragged onto Hex's row of the Unavailable list; History on.
import * as L from './or-RW2-lib.mjs'
import { writeFileSync } from 'node:fs'
const { browser, page: p, errs } = await L.openWorld()
const j = o => JSON.stringify(o)
const DI = 2
const out = {}
const fil = await L.fileInput(p, { type: 'LL', people: ['Drifter', 'Hex', 'Hunter'], from: '2026-07-15', to: '2026-07-16' })
console.log('filed:', j(fil))
const iid = fil[0].iid
await L.goEdit(p)
const day = () => p.locator('#eWeek .day:not(.peek)').nth(DI)
const unav = () => p.evaluate(di => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; return [...d.querySelectorAll('.sec-unav .pl-row')].map(r => r.innerText.replace(/\s+/g, ' ').trim()) }, DI)
console.log('Wed unavailable before:', j(await unav()))
const hexPuck = day().locator('.sec-unav .pl-row').filter({ has: p.locator('.puck', { hasText: 'Hex' }) }).first().locator('.puck').first()
await hexPuck.evaluate(e => { const dd = e.closest('.day'); if (dd) dd.scrollIntoView({ inline: 'start', block: 'nearest' }); e.scrollIntoView({ block: 'center', inline: 'nearest' }) })
await p.waitForTimeout(300)
const m = await L.toastMark(p)
await L.drag(p, p.locator(`#eRoster .rpuck[data-person="${await L.csId(p, 'Anvil')}"]:visible`).first(), hexPuck)
console.log('drag toast:', await L.toastsSince(p, m))
console.log('Wed unavailable after:', j(await unav()))
console.log('INPUTS:', j(await L.rec(p, iid)))
await L.shot(p, 'rw2-2-0-after-drag')
// History on
await p.evaluate(() => window.scrollTo(0, 0))
await p.locator('#histBtn').click(); await p.waitForTimeout(1500)
const dotsNow = () => p.evaluate(() => [...document.querySelectorAll('#eWeek [data-histdot]')].filter(e => e.getClientRects().length).map(e => ({ tag: e.tagName, row: (e.closest('.pl-row')?.innerText || '').replace(/\s+/g, ' ').slice(0, 50), day: [...document.querySelectorAll('#eWeek .day:not(.peek)')].indexOf(e.closest('.day')), sec: (e.closest('[class*="sec-"]')?.className || '').toString().slice(0, 30), attrs: [...e.attributes].filter(a => /^data-/.test(a.name)).map(a => a.name + '=' + a.value).join(' ').slice(0, 90) })))
out.dotsOpen = await dotsNow(); console.log('dots (history on):', j(out.dotsOpen))
await L.shot(p, 'rw2-2-1-history-on')
await p.locator('.chgwin button', { hasText: /All changes/ }).first().click(); await p.waitForTimeout(1000)
const days = await p.locator('.chgwin .cw-day').allInnerTexts(); console.log('day tabs:', j(days))
await p.locator('.chgwin .cw-day', { hasText: 'Wed' }).click(); await p.waitForTimeout(500)
out.dotsAll = await dotsNow(); console.log('dots (all changes Wed):', j(out.dotsAll))
const lines = await p.evaluate(() => [...document.querySelectorAll('.chgwin .cw-l, .chgwin .cw-gh')].map(b => b.className.slice(0, 12) + ' :: ' + (b.innerText || '').replace(/\s+/g, ' ')))
console.log('LINES:', j(lines)); out.lines = lines
await L.shot(p, 'rw2-2-2-all-changes')
const flash = () => p.evaluate(() => [...document.querySelectorAll('.chgflash, .lift-land')].filter(e => e.getClientRects().length).map(e => ({ cls: e.className.toString().slice(0, 40), text: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 40), row: (e.closest('.pl-row')?.innerText || '').replace(/\s+/g, ' ').slice(0, 50), seat: e.dataset.inpseat || e.closest('[data-inpseat]')?.dataset.inpseat || null })))
// tap each line
const n = await p.locator('.chgwin .cw-l').count()
out.taps = []
for (let i = 0; i < n; i++) {
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(1500)
  const l = p.locator('.chgwin .cw-l').nth(i)
  const txt = (await l.innerText()).replace(/\s+/g, ' ')
  const m2 = await L.toastMark(p)
  await l.click(); await p.waitForTimeout(250)
  const f = await flash()
  await p.waitForTimeout(450)
  const nm = await L.shot(p, 'rw2-2-3-tap-line' + i)
  const t = await L.toastsSince(p, m2)
  console.log(`TAP line ${i} "${txt}" -> toast="${t}" flash=${j(f)}`)
  out.taps.push({ txt, toast: t, flash: f, pic: nm })
}
// tap each gold dot of the Wed unavailable rows
const dotLoc = p.locator('#eWeek .day:not(.peek)').nth(DI).locator('[data-histdot]')
const dn = await dotLoc.count(); console.log('dots on Wed:', dn)
out.dotTaps = []
for (let i = 0; i < dn; i++) {
  const el = dotLoc.nth(i)
  const info = await el.evaluate(e => ({ row: (e.closest('.pl-row')?.innerText || '').replace(/\s+/g, ' ').slice(0, 60), who: [...(e.closest('.pl-row')?.querySelectorAll('.ppl .puck .nm') || [])].map(x => x.textContent.trim()).join('+') }))
  await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(200)
  await el.click({ force: true }).catch(() => {}); await p.waitForTimeout(600)
  const bub = await p.evaluate(() => [...document.querySelectorAll('.histbub')].map(b => b.innerText.replace(/\s+/g, ' ').trim()))
  const nm = await L.shot(p, 'rw2-2-4-dot-' + i)
  console.log(`DOT ${i} row="${info.row}" who=${info.who} bubble=${j(bub)}`)
  out.dotTaps.push({ info, bubble: bub, pic: nm })
  await p.keyboard.press('Escape'); await p.waitForTimeout(200)
}
console.log('ERRORS', errs.join(' | ') || 'none')
writeFileSync(L.PARTS + '/or-RW2-2-raw.json', j(out))
await browser.close()
