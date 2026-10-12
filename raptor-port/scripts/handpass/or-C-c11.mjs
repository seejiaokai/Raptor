// Walker C, C11 - History and the changes window (desktop 1440x900). One world.
import * as L from './or-C-lib.mjs'
const { browser, page: p, errs } = await L.openWorld()
const DI = 2, ISO = '2026-07-15'
const j = o => JSON.stringify(o)
const mt = (await L.fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: ISO, to: ISO, timed: ['09:00', '10:00'], title: 'Range brief' }))[0]
const iid = mt.iid
const day = () => p.locator('#eWeek .day:not(.peek)').nth(DI)
const people = () => p.evaluate(id => window.INPUTS.find(x => x.iid === id).people.map(e => window.PEOPLE[e.p]?.cs), iid)
await L.goEdit(p)
let ri = await L.rowIdx(p, DI, iid)
await day().locator(`[data-fill="g:${DI}.${ri}.+"]`).first().scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, 120)); await p.waitForTimeout(300)
// add Tally
let m = await L.toastMark(p)
await L.drag(p, p.locator(`#eRoster .rpuck[data-person="${await L.csId(p, 'Tally')}"]:visible`).first(), day().locator(`[data-fill="g:${DI}.${ri}.+"] .addz`).first())
console.log('Tally added:', await L.toastsSince(p, m), '|', j(await people()))
// take Hunter out (right-click his puck)
const hid = await L.csId(p, 'Hunter')
m = await L.toastMark(p)
await day().locator(`[data-fill="g:${DI}.${ri}.+"] [data-person="${hid}"]`).first().click({ button: 'right' }); await p.waitForTimeout(500)
console.log('Hunter taken out:', await L.toastsSince(p, m), '|', j(await people()))
// re-time
const e = day().locator(`[data-txt="gr:${DI}.${ri}.end"]`); await e.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('11:00'); await e.evaluate(x => x.blur()); await p.waitForTimeout(500)
console.log('re-timed:', await p.evaluate(id => { const r = window.INPUTS.find(x => x.iid === id); return r.s + '-' + r.e }, iid))

// open the changes window with the History clock
await p.locator('#histBtn').click(); await p.waitForTimeout(700)
const win = async () => p.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); if (!w) return null; return { title: (w.querySelector('.win-ttl')?.innerText || '').replace(/\s+/g, ' '), tabs: [...w.querySelectorAll('.win-tab')].map(t => t.innerText.replace(/\s+/g, ' ').trim()), text: (w.innerText || '').replace(/\s+/g, ' ').slice(0, 900), lineBtns: [...w.querySelectorAll('button.pl-item, .cw-line, .cw-row')].map(b => b.className + ': ' + (b.innerText || '').replace(/\s+/g, ' ').slice(0, 90)) } })
const w0 = await win(); console.log('changes window:', j(w0))
await L.shot(p, 'c11-1-window')
await p.locator('.chgwin .win-tab', { hasText: 'All changes' }).click(); await p.waitForTimeout(400)
await p.locator('.chgwin .cw-day', { hasText: 'Wed' }).click(); await p.waitForTimeout(400)
const btns = () => p.evaluate(() => [...document.querySelectorAll('.chgwin:not([hidden]) button')].map(b => b.className.slice(0, 24) + '|' + (b.innerText || '').replace(/s+/g, ' ').slice(0, 90)))
console.log('buttons:', j(await btns()))
console.log('window text:', (await win()).text)
await L.shot(p, 'c11-2-all-changes')
console.log('line titles:', j(await p.evaluate(() => [...document.querySelectorAll('.chgwin .cw-l')].map(b => ({ title: b.getAttribute('title'), aria: b.getAttribute('aria-label'), html: b.innerHTML.replace(/s+/g, ' ').slice(0, 260) })))))
const flash = () => p.evaluate(() => [...document.querySelectorAll('.lift-land, .hl-jump, .jumpflash, [class*=flash]')].filter(e => e.getClientRects().length).map(e => (e.getAttribute('data-slot') || e.getAttribute('data-fill') || e.className).toString().slice(0, 50) + ' :: ' + (e.innerText || '').replace(/s+/g, ' ').slice(0, 40)).slice(0, 6))
const rowBox = async () => { const ri2 = await L.rowIdx(p, DI, iid); return p.evaluate(([di, ri]) => { const z = document.querySelectorAll('#eWeek .day:not(.peek)')[di]; const f = z && z.querySelector('[data-fill="g:' + di + '.' + ri + '.+"]'); if (!f) return null; const r = f.getBoundingClientRect(); return { top: Math.round(r.top), inView: r.top >= 60 && r.bottom <= window.innerHeight } }, [DI, ri2]) }
await day().locator('.sec-grnd').first().scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, -700)); await p.waitForTimeout(300)
for (const label of ['added', 'taken out']) {
  const l = p.locator('.chgwin .cw-l', { hasText: new RegExp('15 Jul · ' + label) }).first()
  const m2 = await L.toastMark(p)
  await l.click(); await p.waitForTimeout(800)
  console.log('tap on "' + label + '" line: toast =', await L.toastsSince(p, m2), '| flash:', j(await flash()), '| row:', j(await rowBox()), '| window still open:', !!(await win()))
  await L.shot(p, 'c11-3-tap-' + label.replace(' ', ''))
}
// take the input off the programme (the row's x) on the board, then tap a line
await L.openBoard(p, DI)
ri = await L.rowIdx(p, DI, iid)
const del = p.locator('#schedBoard [data-grdel="' + DI + '.' + ri + '"]').first(); await del.scrollIntoViewIfNeeded()
m = await L.toastMark(p); await del.click(); await p.waitForTimeout(600)
console.log('x pressed: toast =', await L.toastsSince(p, m), '| row now in DAYS:', await L.rowIdx(p, DI, iid))
await L.closeBoard(p)
await L.goEdit(p)
console.log('window open after returning to the week?', !!(await win()))
if (!(await win())) { await p.locator('#histBtn').click(); await p.waitForTimeout(600) }
await p.locator('.chgwin .win-tab', { hasText: 'All changes' }).click(); await p.waitForTimeout(300)
await p.locator('.chgwin .cw-day', { hasText: 'Wed' }).click(); await p.waitForTimeout(400)
console.log('lines now:', j(await p.evaluate(() => [...document.querySelectorAll('.chgwin .cw-l, .chgwin .cw-gh')].map(b => (b.innerText || '').replace(/s+/g, ' ').slice(0, 100)))))
await day().locator('.sec-grnd').first().scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, -700)); await p.waitForTimeout(300)
for (const label of ['added', 'taken out']) {
  const l = p.locator('.chgwin .cw-l', { hasText: new RegExp('15 Jul · ' + label) }).first()
  if (!(await l.count())) { console.log('no line', label); continue }
  const m3 = await L.toastMark(p)
  await l.click(); await p.waitForTimeout(800)
  const lineInView = await p.evaluate(() => { const e = document.querySelector('#eWeek .day:not(.peek) .sec-inp [data-inprow]'); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), inView: r.top >= 60 && r.bottom <= window.innerHeight } })
  console.log('AFTER x: tap on "' + label + '" line: toast =', await L.toastsSince(p, m3), '| flash:', j(await flash()), '| Personal Inputs line:', j(lineInView))
  await L.shot(p, 'c11-4-afterx-' + label.replace(' ', ''))
}
console.log('ERRORS', errs.join(' | ') || 'none')
await browser.close()
