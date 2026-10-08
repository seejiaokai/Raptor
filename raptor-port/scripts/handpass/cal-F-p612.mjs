import * as L from './cal-F-lib3.mjs'
const PHONE = process.env.HP_PHONE === '1', TAG = PHONE ? 'ph' : 'dk'
const T0 = new Date('2026-06-29T10:00:00')
const b = await L.launch()
const ctx = await L.newCtx(b, { phone: PHONE, clock: T0 })
const p = await L.newPage(ctx)
const at = async s => { await p.clock.setFixedTime(new Date(s)) }
await at('2026-06-29T10:00:00')
await L.signIn(p, 'ad')
await L.go(p, 'inputs')
await L.toastSpy(p)
const P = L.press(p, PHONE)
const pic = n => L.pic(p, `${TAG}-p612-${n}`)
const [ace, anvil, basher, cinder, echo, bolt, jester, kraken, marlin, otter, pixel] = await L.ids(p, ['Ace', 'Anvil', 'Basher', 'Cinder', 'Echo', 'Bolt', 'Jester', 'Otter', 'Pixel', 'Tally', 'Zulu'])
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const tabSans = () => P(p.locator('[role=tab]:has-text("SANS")').first())
const tabInputs = () => P(p.locator('[role=tab]:has-text("Inputs")').first())
async function sansMonth(y, m) {
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await p.locator('[data-testid="sc-month"]').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) return
    await P(p.locator(d > 0 ? '[data-testid="sc-next"]' : '[data-testid="sc-prev"]')); await L.sleep(120)
  }
}
async function closeWins() { for (const s of ['[data-testid="win-sansday-x"]', '[data-testid="win-inputsday-x"]']) { if (await p.locator(s).count()) { await P(p.locator(s)).catch(() => {}); await L.sleep(200) } } }

/* ---- SANS gear: weekday mode, Wednesday, two weeks before ---- */
await tabSans(); await L.sleep(600)
await P(p.locator('[data-testid="sc-gear"]')); await L.sleep(500)
await P(p.locator('[data-testid="sset-mode-wd"]'))
await p.selectOption('[data-testid="sset-wd"]', '2'); await p.selectOption('[data-testid="sset-weeks"]', '2'); await L.sleep(200)
const sansExample = await p.locator('[data-testid="sset-example"]').innerText()
await pic('sans-gear')
await P(p.locator('[data-testid="sset-save"]')); await L.sleep(600)
const sansHow = async () => { const h = p.locator('[data-testid="sc-how"]'); if ((await h.getAttribute('aria-expanded')) !== 'true') await P(h); await L.sleep(250); return p.locator('[data-testid="sc-how-cut"]').innerText() }
const sansHowText = await sansHow()
/* the Inputs gear still reads 14 days */
await tabInputs(); await L.sleep(500)
await P(p.locator('[data-testid="in-gear"]')); await L.sleep(500)
const inpGear = { daysPressed: await p.locator('[data-testid="iset-mode-days"]').getAttribute('aria-pressed'), example: await p.locator('[data-testid="iset-example"]').innerText().catch(() => null) }
await pic('inputs-gear')
await P(p.locator('[data-testid="iset-cancel"]')); await L.sleep(400)
console.log('SANS example:', sansExample, '| how:', sansHowText, '| inputs gear', JSON.stringify(inpGear))

async function fileLL(person, iso, type = 'LL') {
  await closeWins(); await tabInputs(); await L.sleep(400)
  await L.openNew(p, iso, { phone: PHONE })
  await p.selectOption('#inpEditPerson', person); await p.selectOption('#inpEditType', type)
  const had = await L.iidSet(p)
  await P(p.locator('#inpEditSave')); await L.sleep(600)
  const nr = await L.newRows(p, had)
  console.log('LL', person, iso, 'toasts', JSON.stringify(await L.toasts(p)), 'new', nr.length, 'editor', await p.locator('[data-testid="win-inputedit"]').count())
  return nr[0]
}
async function fileSans(person, iso) {
  await closeWins()
  await tabSans(); await L.sleep(500)
  const [y, m] = [+iso.slice(0, 4), +iso.slice(5, 7)]
  await sansMonth(y, m)
  const c = p.locator(`[data-testid="sc-day-${iso}"]`)
  if (PHONE) await c.tap({ position: { x: 8, y: 8 } }); else await c.click({ position: { x: 8, y: 8 } })
  await L.sleep(500)
  await P(p.locator('[data-testid="sd-add"]')); await L.sleep(600)
  await p.selectOption('#inpEditPerson', person)
  const had = await L.iidSet(p)
  await P(p.locator('#inpEditSave')); await L.sleep(700)
  const nr = await L.newRows(p, had)
  console.log('SANS', person, iso, 'toasts', JSON.stringify(await L.toasts(p)), 'new', nr.length, 'editor', await p.locator('[data-testid="win-inputedit"]').count())
  if (await p.locator('[data-testid="win-inputedit"]').count()) await pic('stuck-editor-' + iso)
  return nr[0]
}
const made = {}
const stamp = r => r && { person: r.person, type: r.type, date: r.date, mod: r.mod }
await at('2026-06-29T23:30:00'); made.aceLL = await fileLL(ace, '2026-07-15'); made.boltS = await fileSans(bolt, '2026-07-15')
await at('2026-06-30T00:30:00'); made.anvilLL = await fileLL(anvil, '2026-07-15'); made.jesterS = await fileSans(jester, '2026-07-15')
await at('2026-07-01T23:30:00'); made.basherLL = await fileLL(basher, '2026-07-15'); made.krakenS = await fileSans(kraken, '2026-07-15')
await at('2026-07-02T00:30:00'); made.marlinS = await fileSans(marlin, '2026-07-15')
console.log('stamps', JSON.stringify(Object.fromEntries(Object.entries(made).map(([k, v]) => [k, stamp(v)]))))

const sansDay = async iso => {
  await closeWins(); await tabSans(); await L.sleep(400)
  await sansMonth(+iso.slice(0, 4), +iso.slice(5, 7))
  const c = p.locator(`[data-testid="sc-day-${iso}"]`); if (PHONE) await c.tap({ position: { x: 8, y: 8 } }); else await c.click({ position: { x: 8, y: 8 } })
  await L.sleep(600)
  return p.evaluate(() => [...document.querySelectorAll('[data-testid^="sd-row-"]')].map(r => ({ who: (r.querySelector('.sd-open') || {}).getAttribute ? (r.querySelector('.sd-open').getAttribute('aria-label') || '').split(',')[0] : '', late: !!r.querySelector('[data-testid="sd-late"]'), note: (r.querySelector('[data-testid="sd-late"]') || {}).title || '' })))
}
const inpDay = async iso => {
  await closeWins(); await tabInputs(); await L.sleep(400)
  await L.month(p, +iso.slice(0, 4), +iso.slice(5, 7), PHONE ? (l => l.tap()) : null)
  const c = L.cell(p, iso); if (PHONE) await c.tap({ position: { x: 8, y: 8 } }); else await c.click({ position: { x: 8, y: 8 } })
  await L.sleep(600)
  return p.evaluate(() => [...document.querySelectorAll('[data-testid^="idy-row-"]')].map(r => ({ who: (r.querySelector('.idy-who') || {}).innerText, kind: (r.querySelector('.idy-kind') || {}).innerText, late: !!r.querySelector('[data-testid="idy-late"]') })))
}
const sd1 = await sansDay('2026-07-15'); await pic('sans-day-15jul')
const id1 = await inpDay('2026-07-15'); await pic('inputs-day-15jul')
console.log('SANS day 15 Jul', JSON.stringify(sd1)); console.log('Inputs day 15 Jul', JSON.stringify(id1.filter(r => ['Ace', 'Anvil', 'Basher'].includes(r.who))))

/* a later edit is judged by ITS date: edit Bolt's (on time) SANS and Ace's (on time) LL on 3 Jul */
await at('2026-07-03T10:00:00')
async function openEditSans(person, iso) {
  await closeWins(); await tabSans(); await L.sleep(400)
  await sansMonth(+iso.slice(0, 4), +iso.slice(5, 7))
  const c = p.locator(`[data-testid="sc-day-${iso}"]`); if (PHONE) await c.tap({ position: { x: 8, y: 8 } }); else await c.click({ position: { x: 8, y: 8 } })
  await L.sleep(500)
  await P(p.locator('[data-testid="sd-open"]').filter({ hasText: '' }).locator('xpath=.').first()).catch(() => {})
}
// Ace's LL: through the Inputs month day, its line opens the editor
await closeWins(); await tabInputs(); await L.sleep(300)
await L.month(p, 2026, 7, PHONE ? (l => l.tap()) : null)
{ const c = L.cell(p, '2026-07-15'); if (PHONE) await c.tap({ position: { x: 8, y: 8 } }); else await c.click({ position: { x: 8, y: 8 } }); await L.sleep(500) }
await P(p.locator('[data-testid="idy-open"]', { hasText: 'Ace' }).first()); await L.sleep(600)
await p.locator('#inpEditRmk').fill('p612 edited'); await P(p.locator('#inpEditSave')); await L.sleep(700)
const aceNow = (await L.rowsNow(p)).find(r => r.person === ace && r.date === 'Jul 15')
// Bolt's SANS: the SANS day's own line
await closeWins(); await tabSans(); await L.sleep(400); await sansMonth(2026, 7)
{ const c = p.locator('[data-testid="sc-day-2026-07-15"]'); if (PHONE) await c.tap({ position: { x: 8, y: 8 } }); else await c.click({ position: { x: 8, y: 8 } }); await L.sleep(600) }
await P(p.locator('[data-testid^="sd-row-"]').filter({ hasText: 'Bolt' }).locator('[data-testid="sd-open"]').first()); await L.sleep(700)
const ticks = p.locator('#inpEditSans input[type=checkbox], #inpEditSans [role=checkbox], #inpEditSans button').first()
await p.locator('#inpEditRmk').fill('p612 edited').catch(() => {})
await P(p.locator('#inpEditSave')); await L.sleep(700)
const boltNow = (await L.rowsNow(p)).find(r => r.person === bolt && r.date === 'Jul 15')
const sd2 = await sansDay('2026-07-15'); await pic('sans-day-after-edit')
const id2 = await inpDay('2026-07-15'); await pic('inputs-day-after-edit')
console.log('after edit stamps', JSON.stringify({ aceMod: aceNow && aceNow.mod, boltMod: boltNow && boltNow.mod }))

/* ---- across New Year ---- */
await at('2026-12-21T23:30:00'); made.cinderLL = await fileLL(cinder, '2027-01-05')
await at('2026-12-22T00:30:00'); made.echoLL = await fileLL(echo, '2027-01-05')
await at('2026-12-23T23:30:00'); made.otterS = await fileSans(otter, '2027-01-05')
await at('2026-12-24T00:30:00'); made.pixelS = await fileSans(pixel, '2027-01-05')
console.log('NY stamps', JSON.stringify(['cinderLL', 'echoLL', 'otterS', 'pixelS'].map(k => [k, stamp(made[k])])))
const sd3 = await sansDay('2027-01-05'); await pic('sans-day-5jan')
const id3 = await inpDay('2027-01-05'); await pic('inputs-day-5jan')
console.log('SANS 5 Jan', JSON.stringify(sd3)); console.log('Inputs 5 Jan', JSON.stringify(id3.filter(r => ['Cinder', 'Echo'].includes(r.who))))
const sget = (arr, n) => arr.find(r => r.who === n), iget = (arr, n) => arr.find(r => r.who === n)
L.judge('P6-12', 'SANS late cut-off set to Wednesday 2 weeks before; Inputs left at 14 days; controlled clock around the end of each deadline day, a later edit, and across New Year', [
  ['the SANS gear’s worked example and the "How this works" line state the cut-off as set', /Wednesday|Wed/i.test(sansExample) && /Wed/i.test(sansHowText), { sansExample, sansHowText }],
  ['Inputs setting untouched (days mode, 14)', inpGear.daysPressed === 'true' && /week of Mon 20 Jul, inputs are due by the end of Mon 6 Jul/.test(inpGear.example || ''), inpGear],
  ['inputs: filed 29 Jun 23:30 on time; 30 Jun 00:30 late; 1 Jul 23:30 late (the SANS setting does not apply to them)', !iget(id1, 'Ace').late && iget(id1, 'Anvil').late && iget(id1, 'Basher').late, id1.filter(r => ['Ace', 'Anvil', 'Basher'].includes(r.who))],
  ['SANS (Bolt 29 Jun 23:30, Jester 30 Jun 00:30, Otter 1 Jul 23:30 on time � end of Wed 1 Jul; Pixel 2 Jul 00:30 late)', !sget(sd1, 'Bolt').late && !sget(sd1, 'Jester').late && !sget(sd1, 'Otter').late && sget(sd1, 'Pixel').late, sd1],
  ['a later edit is judged by the edit’s date: Ace’s LL and Bolt’s SANS edited 3 Jul are now LATE', iget(id2, 'Ace').late && sget(sd2, 'Bolt').late, { ace: iget(id2, 'Ace'), bolt: sget(sd2, 'Bolt'), stamps: { aceMod: aceNow && aceNow.mod, boltMod: boltNow && boltNow.mod } }],
  ['New Year, inputs (week of 4 Jan 2027, due end of Mon 21 Dec 2026): 21 Dec 23:30 on time, 22 Dec 00:30 late', !iget(id3, 'Cinder').late && iget(id3, 'Echo').late, id3.filter(r => ['Cinder', 'Echo'].includes(r.who))],
  ['New Year, SANS (due end of Wed 23 Dec 2026): 23 Dec 23:30 on time, 24 Dec 00:30 late', !sget(sd3, 'Tally').late && sget(sd3, 'Zulu').late, sd3],
], [])
console.log('errors', JSON.stringify(L.errors))
L.savePart('p612-' + TAG)
await b.close()
