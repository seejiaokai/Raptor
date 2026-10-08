// P3-12 (later month, blank short form on the Off day), P3-04 (two doors, one record) — desktop 1440, Saber
import { world, toLeaveWar, tid, press, pic, sleep, closeAll, judge, rec, recErrors, active, openWins } from './cal-C-lib.mjs'
const SIZE = process.env.SZ || 'desk'
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const { page, errors } = await world(SIZE)
const P = n => `${SIZE}-${n}`
async function holTap(iso) {
  const at = async () => { const [m, y] = (await tid(page, 'holcal-month').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MONTHS.indexOf(m) }
  let d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - await at()
  for (; d > 0; d--) await press(SIZE, tid(page, 'holcal-next-month'))
  for (; d < 0; d++) await press(SIZE, tid(page, 'holcal-prev-month'))
  await press(SIZE, tid(page, `holcal-day-${iso}`))
}
const lines = () => page.locator('.hol-line').evaluateAll(els => els.map(e => ({ from: e.getAttribute('data-from'), t: e.textContent.replace(/\s+/g, ' ').trim() })))
const ev = iso => page.evaluate(i => { const e = document.querySelector(`[data-testid="event-0-${i}"]`); const b = document.querySelector(`[data-testid^="event-band-0-"][data-testid$="${i}"]`); return e ? e.textContent.trim() : b ? 'BAND ' + b.textContent.trim() : null }, iso)
await toLeaveWar(page)
await press(SIZE, tid(page, 'settings-open')); await press(SIZE, tid(page, 'settings-days'))
await tid(page, 'win-days').waitFor()
await press(SIZE, tid(page, 'days-tab-holidays')); await sleep(300)

/* ---------- P3-12: later month, custom short, save and add next, then Off day with no short form ---------- */
await press(SIZE, tid(page, 'hol-add')); await sleep(200)
await tid(page, 'hol-name').fill('Deepavali'); await tid(page, 'hol-short').fill('dv')
await holTap('2026-11-09')
await press(SIZE, tid(page, 'hol-save-more')); await sleep(400)
const form2 = { name: await tid(page, 'hol-name').inputValue(), short: await tid(page, 'hol-short').inputValue(), sel: (await tid(page, 'holcal-selection').textContent()).trim(), from: await tid(page, 'hol-dates').getAttribute('data-from'), month: (await tid(page, 'holcal-month').textContent()).trim(), saved: (await tid(page, 'hol-saved').textContent()).trim() }
await pic(page, P('p312-1-next-form'))
await press(SIZE, tid(page, 'hol-kind-off')); await holTap('2026-11-12')   // Off day, name empty, short empty
await pic(page, P('p312-2-offday-blank'))
await press(SIZE, tid(page, 'hol-save')); await sleep(500)
const L = (await lines()).filter(l => l.from && l.from.startsWith('2026-11'))
const evDV = await ev('2026-11-09'), evOff = await ev('2026-11-12')
await pic(page, P('p312-3-list'))
judge('P3-12' + (SIZE === 'desk' ? '' : '-' + SIZE), 'Add Deepavali / DV (Nov 9) with "Save and add another"; inspect the next form; then an Off day on Nov 12 with name and short form left blank, Save', [
  ['next form: picker on the useful month (Nov), nothing selected', /november/i.test(form2.month) && !form2.from, form2],
  ['next form: name and short form cleared (not carried)', form2.name === '' && form2.short === '', { name: form2.name, short: form2.short }],
  ['"Saved: Deepavali, ..." shown', /Deepavali/.test(form2.saved), form2.saved],
  ['Off day saved on 12 Nov only (previous 9 Nov range not reused)', L.length === 2 && L.some(l => l.from === '2026-11-09' && /Deepavali/.test(l.t)) && L.some(l => l.from === '2026-11-12'), L],
  ['Event row 9 Nov = DV', evDV === 'DV', evDV],
  ['Off day prints its own default short form, not DV', evOff && evOff !== 'DV' && evOff !== 'BAND DV', evOff],
], [P('p312-1-next-form') + '.png', P('p312-2-offday-blank') + '.png', P('p312-3-list') + '.png'])

/* ---------- P3-04: Calendar-door add; change through the Leave War; reopen Calendar and remove; then reverse ---------- */
await press(SIZE, tid(page, 'hol-add')); await tid(page, 'hol-name').fill('Test Fest'); await tid(page, 'hol-short').fill('tf')
await holTap('2026-09-22'); await press(SIZE, tid(page, 'hol-save')); await sleep(500)
const added = (await lines()).find(l => l.from === '2026-09-22')
const evAdded = await ev('2026-09-22')
/* the Calendar window stays up (it does not block the page); a Leave War cell behind it is pressed — find it on screen */
await page.evaluate(() => document.querySelector('[data-testid="event-0-2026-09-22"]')?.scrollIntoView({ block: 'nearest', inline: 'center' }))
await sleep(500)
const bar = await page.locator('[data-testid="win-days"] .win-bar').boundingBox()
await page.mouse.move(bar.x + 200, bar.y + 12); await page.mouse.down(); await page.mouse.move(bar.x + 200, bar.y + 12 + 380, { steps: 12 }); await page.mouse.up(); await sleep(400)
const cellBox = await tid(page, 'event-0-2026-09-22').boundingBox()
await pic(page, P('p304-1-added-in-calendar'))
console.log('cell box', JSON.stringify(cellBox))
await page.mouse.click(cellBox.x + cellBox.width / 2, cellBox.y + cellBox.height / 2); await sleep(600)
const sheetWins = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="event-"]')].map(e => e.getAttribute('data-testid')).filter(x => /event-(text|short|apply|delete|other|quick|cancel|readout)/.test(x)))
await pic(page, P('p304-2-event-sheet-opened'))
console.log('sheet testids', sheetWins.join(','))
await closeAll()
recErrors(P('script2'), errors)
