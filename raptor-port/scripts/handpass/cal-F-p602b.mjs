/* WALKER F â€” P6-02's last clause: "credit still follows acceptance / publication" â€” the shared duty's three requests on the board, accepted one at a time. */
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
const pic = n => L.pic(p, `${TAG}-p602b-${n}`)
await L.openNew(p, '2026-07-18', { phone: PHONE })
await p.selectOption('#inpEditType', 'Duty')
await L.pickSeveral(p, [ace, anvil, basher], { phone: PHONE })
await L.setWhen(p, { allday: true, remarks: 'p602b duty' })
await P(p.locator('#inpEditSave')); await L.sleep(500)
await L.answerOil(p, 'yes', { phone: PHONE }); await L.sleep(700)
const rows = (await L.rowsNow(p)).filter(r => /^p602b/.test(r.remarks))
console.log('rows', JSON.stringify(rows.map(r => [r.person, r.oil])))
/* the board, Sat 18 Jul */
await L.go(p, 'editsched'); await L.sleep(500)
await p.evaluate(() => window.openScheduler(5)); await p.waitForSelector('#schedBoard'); await L.sleep(900)
const fold = p.locator('#schedBoard [data-pitog="5"]:visible').first()
const rowsN = () => p.evaluate(() => document.querySelectorAll('#schedBoard .pinp .sb-arow, #schedBoard .pinp .sbi-row').length)
if (!(await rowsN()) && await fold.count()) { await fold.click(); await L.sleep(500) }
const state = () => p.evaluate(() => ({
  pinp: [...document.querySelectorAll('#schedBoard .pinp .sb-arow.inprow')].filter(r => /p602b|Duty/.test(r.innerText)).map(r => ({ txt: r.innerText.replace(/\s+/g, ' ').slice(0, 70), accd: r.classList.contains('accd'), btns: [...r.querySelectorAll('.accb')].map(x => x.dataset.acc + ':' + x.dataset.acck).join(',') })),
  ground: (window.DAYS[5].ground || []).filter(g => g.src).map(g => g.src),
}))
const s0 = await state(); console.log('board before', JSON.stringify(s0)); await pic('board-before')
/* before: balances */
await p.locator('#schedBoard').getByRole('button', { name: /Done|Close/ }).first().click().catch(async () => { await p.keyboard.press('Escape') }); await L.sleep(500)
const tr0 = await L.oilRows(p, [ace, anvil, basher]); await L.closeOil(p)
/* sign the four offices and publish Sat 18 Jul */
await L.go(p, 'editsched'); await L.sleep(500)
await p.evaluate(() => window.openScheduler(5)); await p.waitForSelector('#schedBoard'); await L.sleep(900)
const signed = {}
for (const role of ['cur', 'sked', 'plan', 'appr']) {
  const sel = p.locator(`#schedBoard select[data-sign="${role}"][data-signday="5"]:visible`).first()
  if (!(await sel.count())) { signed[role] = 'NO SELECT'; continue }
  const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
  await sel.selectOption(opts[0]); await L.sleep(250)
  signed[role] = await sel.evaluate(x => x.options[x.selectedIndex].text)
}
await pic('signed')
const beak = p.locator('#schedBoard [data-beak="5"]:visible').first()
const beakInfo = (await beak.count()) ? { label: (await beak.innerText()).trim(), disabled: await beak.isDisabled() } : 'no publish button'
if (beakInfo !== 'no publish button' && !beakInfo.disabled) { await beak.scrollIntoViewIfNeeded(); await beak.click(); await L.sleep(1200) }
await pic('after-publish')
console.log('signed', JSON.stringify(signed), 'publish', JSON.stringify(beakInfo))
await p.locator('#schedBoard').getByRole('button', { name: /Done|Close/ }).first().click().catch(async () => { await p.keyboard.press('Escape') }); await L.sleep(500)
const lw = await L.lwCells(p, [ace, anvil, basher], '2026-07-18')
await pic('leavewar-after-publish')
const tr1 = await L.oilRows(p, [ace, anvil, basher])
await pic('oil-tracker-after-publish')
await L.closeOil(p)
console.log('LW', JSON.stringify(lw)); console.log('TRACKER before', JSON.stringify(Object.fromEntries(Object.entries(tr0).map(([k, v]) => [k, v.bal]))), 'after', JSON.stringify(Object.fromEntries(Object.entries(tr1).map(([k, v]) => [k, v.bal]))))
console.log('TRACKER rows after', JSON.stringify(tr1))
const published = await p.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="5"]'); return d ? d.innerText.replace(/\s+/g, ' ').slice(0, 140) : null })
console.log('day head', published)
L.judge('P6-02 (credit half)', 'the shared Duty filed Sat 18 Jul with OIL Yes is already on the board for each man (landed); before publishing nothing is credited; then four sign-offs and Publish day', [
  ['the three men’s requests were each answered at the filing (one claim each)', rows.length === 3 && rows.every(r => r.oil && r.oil['2026-07-18'] === 1), rows.map(r => r.oil)],
  ['before publishing the OIL tracker balances are as before the filing (Ace 4, Anvil 0, Basher 0)', tr0.Ace.bal === '4' && tr0.Anvil.bal === '0' && tr0.Basher.bal === '0', Object.fromEntries(Object.entries(tr0).map(([k, v]) => [k, v.bal]))],
  ['after publishing each man’s own Leave War cell on 18 Jul shows his own FO', ['Ace', 'Anvil', 'Basher'].every(n => /^FO/.test(lw[n].text)), lw],
  ['after publishing each man’s tracker row gains exactly ONE day (+1), none gets the three', tr1.Ace.bal === '5' && tr1.Anvil.bal === '1' && tr1.Basher.bal === '1', Object.fromEntries(Object.entries(tr1).map(([k, v]) => [k, v.bal]))],
], [])
console.log(JSON.stringify(L.errors))
L.savePart('p602b-' + TAG)
await b.close()
