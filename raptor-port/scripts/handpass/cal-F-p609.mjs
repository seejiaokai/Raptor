import * as L from './cal-F-lib3.mjs'
const PHONE = process.env.HP_PHONE === '1', TAG = PHONE ? 'ph' : 'dk'
const b = await L.launch()
const ctx = await L.newCtx(b, { phone: PHONE })
const p = await L.newPage(ctx)
await L.signIn(p, 'ad')
await L.go(p, 'inputs')
await L.toastSpy(p)
const P = L.press(p, PHONE)
const [ace, anvil, basher] = await L.ids(p, ['Ace', 'Anvil', 'Basher'])
const pic = n => L.pic(p, `${TAG}-p609-${n}`)
const recs = () => p.evaluate(() => window.INPUTS.filter(r => r.remarks && /^p609/.test(r.remarks)).map(r => ({ cs: window.PEOPLE[r.person].cs, remarks: r.remarks, grp: r.grp, iid: r.iid, date: r.date })).sort((a, b) => a.cs.localeCompare(b.cs)))
const monthBars = async () => { await L.go(p, 'inputs'); await L.month(p, 2026, 7, PHONE ? (l => l.tap()) : null); await L.sleep(400); return p.evaluate(() => [...document.querySelectorAll('#inpCal .ib-bar')].filter(b => /Ace|Anvil|Basher/.test(b.innerText)).map(b => b.innerText.trim())) }
const moreAt = () => p.evaluate(() => [...document.querySelectorAll('#inpCal [data-icmore="2026-07-17"]')].map(b => b.innerText.trim()))
const dayLines = async () => { if (await p.locator('[data-testid="win-inputsday-x"]').count()) await P(p.locator('[data-testid="win-inputsday-x"]')); if (PHONE) await L.cell(p, '2026-07-17').tap({ position: { x: 8, y: 8 } }); else await L.cell(p, '2026-07-17').click({ position: { x: 8, y: 8 } }); await L.sleep(500); return p.evaluate(() => [...document.querySelectorAll('[data-testid^="idy-row-"]')].filter(r => /Meeting/.test(r.innerText) && /Ace|Anvil|Basher/.test(r.innerText)).map(r => r.innerText.replace(/\s+/g, ' ').slice(0, 80))) }
const listRows = async () => { await P(p.locator('#inListBtn')); await L.sleep(500); await P(p.locator('#inRangeBtn')); await L.sleep(300); if (await p.locator('#inRangeAll:visible').count()) { await P(p.locator('#inRangeAll')); await L.sleep(500) } const r = await p.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid]')].filter(t => /p609/.test(t.innerText)).map(t => t.innerText.replace(/\s+/g, ' ').slice(0, 70))); await P(p.locator('#inCalBtn')); await L.sleep(400); return r }

/* the shared entry: Meeting, Fri 17 Jul, Ace + Anvil + Basher */
await L.openNew(p, '2026-07-17', { phone: PHONE })
await p.selectOption('#inpEditType', 'Meeting')
await L.pickSeveral(p, [ace, anvil, basher], { phone: PHONE })
await L.setWhen(p, { allday: true, remarks: 'p609 one' })
await P(p.locator('#inpEditSave')); await L.sleep(800)
const s0 = await recs()
const bars0 = await monthBars()
await pic('month-before')

/* the board: Fri 17 Jul, Anvil's own row — change only his remarks */
async function boardEdit(person, remarks) {
  await L.go(p, 'editsched'); await L.sleep(500)
  await p.locator('#eWeek [data-sbday="4"]:visible').first().click(); await p.waitForSelector('#schedBoard'); await L.sleep(800)
  const rowsN = () => p.evaluate(() => document.querySelectorAll('#schedBoard .pinp .sb-arow, #schedBoard .pinp .sbi-row').length)
  if (!(await rowsN())) { const tg = p.locator('#schedBoard [data-pitog="4"]:visible'); if (await tg.count()) { await tg.first().click(); await L.sleep(500) } }
  const iid = (await recs()).find(r => r.cs === person).iid
  await p.locator(`#schedBoard [data-inpedit="${iid}"]`).first().click(); await L.sleep(800)
  const dlg = p.locator('input[value^="p609"]').first()
  await dlg.fill(remarks)
  await pic('board-edit-' + person.toLowerCase())
  await p.getByRole('button', { name: 'Save', exact: true }).first().click(); await L.sleep(800)
  await p.locator('#schedBoard').getByRole('button', { name: /Close/ }).first().click().catch(async () => { await p.keyboard.press('Escape') }); await L.sleep(500)
}
await boardEdit('Anvil', 'p609 anvil only')
const s1 = await recs()
const bars1 = await monthBars()
const more1 = await moreAt()
await pic('month-split-closed')
console.log('MORE1', JSON.stringify(more1), 'BARS1', JSON.stringify(bars1))
const lines1 = await dayLines()
await pic('month-split')
const list1 = await listRows()
await pic('list-split')
/* restore */
await boardEdit('Anvil', 'p609 one')
const s2 = await recs()
const bars2 = await monthBars()
const lines2 = await dayLines()
await pic('month-restored')
console.log(JSON.stringify({ s0: s0.map(r => [r.cs, r.remarks, r.grp]), bars0, s1: s1.map(r => [r.cs, r.remarks, r.grp]), bars1, lines1, list1, s2: s2.map(r => [r.cs, r.remarks]), bars2, lines2 }, null, 1))
L.judge('P6-09', 'one three-man Meeting on Fri 17 Jul; through the board’s own row for Anvil only his remarks changed; read on the Inputs month, the day and the List; then restored the same way', [
  ['before: one bar for the three', bars0.length === 1 && /\+2/.test(bars0[0]), bars0],
  ['only Anvil’s record changed (Ace and Basher unchanged)', s1.find(r => r.cs === 'Anvil').remarks === 'p609 anvil only' && s1.filter(r => r.cs !== 'Anvil').every(r => r.remarks === 'p609 one'), s1.map(r => [r.cs, r.remarks])],
  ['the month shows the divergence: Anvil on his own bar, Ace + Basher together on another', bars1.some(x => /\+1/.test(x) && /Ace|Basher/.test(x)) && (bars1.length === 2 ? bars1.some(x => /Anvil/.test(x) && !/\+/.test(x)) : (PHONE && more1.length > 0)), { bars1, more1 }],
  ['the opened day lists two lines (Anvil’s own; Ace + Basher)', lines1.length === 2, lines1],
  ['the List has two rows (one for the two, one for Anvil)', list1.length === 2, list1],
  ['restored: Anvil’s remarks equal again => one bar for the three', s2.every(r => r.remarks === 'p609 one') && bars2.length === 1 && /\+2/.test(bars2[0]) && lines2.length === 1, { bars2, lines2 }],
], [])
console.log('errors', JSON.stringify(L.errors))
L.savePart('p609-' + TAG)
await b.close()
