// RW2-6: the changes window on a PUBLISHED day. Publish Wed with a Meeting of three; add Tally; "To go out" and the History tab.
import * as L from './or-RW2-lib.mjs'
import { writeFileSync } from 'node:fs'
const { browser, page: p, errs } = await L.openWorld()
const j = o => JSON.stringify(o)
const DI = 2, ISO = '2026-07-15'
const out = {}
const mt = (await L.fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: ISO, to: ISO, timed: ['09:00', '10:00'], title: 'Range brief' }))[0]
const iid = mt.iid
console.log('filed:', j(mt))
// sign and publish Wed through the board's sign-off line
await L.openBoard(p, DI)
const sels = p.locator(`#schedBoard [data-signday="${DI}"]`)
const n = await sels.count()
for (let i = 0; i < n; i++) {
  const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
  if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
  await p.waitForTimeout(150)
}
await p.waitForTimeout(300)
let btn = p.locator(`#schedBoard [data-beak="${DI}"]`).first()
if (!(await btn.count())) btn = p.locator(`#schedBoard [data-alpub="${DI}"]`).first()
console.log('publish button:', (await btn.count()) ? (await btn.innerText()).trim() : 'none', 'selects:', n)
await btn.evaluate(b => b.click()); await p.waitForTimeout(800)
const ok = p.getByRole('button', { name: /^(Publish|Yes|Confirm|Issue)/ }).first()
if (await ok.count() && await ok.isVisible()) { await ok.evaluate(b => b.click()); await p.waitForTimeout(900) }
console.log('version chip:', await p.evaluate(() => (document.querySelector('#schedBoard .verchip') || {}).innerText || ''))
await L.closeBoard(p)
await L.goEdit(p)
const day = () => p.locator('#eWeek .day:not(.peek)').nth(DI)
console.log('Wed head after publish:', (await day().innerText()).slice(0, 220).replace(/\s+/g, ' '))
// add Tally by a drop on "+ add"
const ri = await L.rowIdx(p, DI, iid)
await day().locator(`[data-fill="g:${DI}.${ri}.+"]`).first().scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, 120)); await p.waitForTimeout(300)
const m = await L.toastMark(p)
await L.drag(p, p.locator(`#eRoster .rpuck[data-person="${await L.csId(p, 'Tally')}"]:visible`).first(), day().locator(`[data-fill="g:${DI}.${ri}.+"] .addz`).first())
console.log('Tally added toast:', await L.toastsSince(p, m), '| people:', j(await p.evaluate(id => window.INPUTS.find(x => x.iid === id).people.map(e => window.PEOPLE[e.p]?.cs), iid)))
await L.shot(p, 'rw2-6-0-week-after-add')
// the pending count on Wed's head
const pend = await p.evaluate(di => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; const c = [...d.querySelectorAll('*')].filter(e => /\d+\s+pending/i.test(e.textContent) && e.textContent.length < 40 && !e.querySelector('*')); return c.length ? c[c.length - 1].textContent.trim() : 'no "N pending" element: ' + (d.querySelector('.dstat')?.innerText || '').replace(/\s+/g, ' ') }, DI)
out.pend = pend; console.log('Wed day head count:', pend)
await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300)
const bb = day().locator('.dstat .dpend').first()
await bb.scrollIntoViewIfNeeded(); await bb.click(); await p.waitForTimeout(900)
const win = () => p.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); if (!w) return null; return { title: (w.querySelector('.win-ttl')?.innerText || '').replace(/\s+/g, ' '), tabs: [...w.querySelectorAll('.win-tab')].map(t => t.innerText.replace(/\s+/g, ' ').trim() + (t.classList.contains('on') ? ' [on]' : '')), text: (w.innerText || '').replace(/\s+/g, ' ').slice(0, 1200) } })
out.win0 = await win(); console.log('changes window:', j(out.win0))
await L.shot(p, 'rw2-6-1-window-open')
const tog = p.locator('.chgwin .win-tab', { hasText: /To go out/ })
if (await tog.count()) { await tog.first().click(); await p.waitForTimeout(500) }
out.togo = await p.evaluate(() => ({ head: (document.querySelector('.chgwin .cw-out .pl-head')?.innerText || '').replace(/\s+/g, ' ').trim(), lines: [...document.querySelectorAll('.chgwin .cw-out .pl-item')].map(i => i.innerText.replace(/\s+/g, ' ').trim()), all: (document.querySelector('.chgwin')?.innerText || '').replace(/\s+/g, ' ').slice(0, 900) }))
console.log('TO GO OUT:', j(out.togo))
await L.shot(p, 'rw2-6-2-to-go-out')
// the other tabs
const tabs = await p.locator('.chgwin .win-tab').allInnerTexts(); console.log('tabs:', j(tabs))
out.tabs = tabs
for (const t of tabs) {
  if (/To go out/.test(t)) continue
  const tl = p.locator('.chgwin .win-tab', { hasText: t.replace(/\s+\d+$/, '').trim() }).first()
  await tl.click(); await p.waitForTimeout(500)
  const days = await p.locator('.chgwin .cw-day').count()
  if (days) { const w = p.locator('.chgwin .cw-day', { hasText: 'Wed' }); if (await w.count()) { await w.first().click(); await p.waitForTimeout(500) } }
  const txt = await p.evaluate(() => (document.querySelector('.chgwin')?.innerText || '').replace(/\s+/g, ' ').slice(0, 1200))
  const lines = await p.evaluate(() => [...document.querySelectorAll('.chgwin .cw-l, .chgwin .cw-gh, .chgwin .pl-item')].map(b => (b.innerText || '').replace(/\s+/g, ' ')))
  console.log('TAB "' + t + '":', txt, '| lines:', j(lines))
  out['tab_' + t] = { txt, lines }
  await L.shot(p, 'rw2-6-3-tab-' + t.replace(/[^A-Za-z]+/g, '').toLowerCase())
}
console.log('ERRORS', errs.join(' | ') || 'none')
writeFileSync(L.PARTS + '/or-RW2-6-raw.json', j(out))
await browser.close()
