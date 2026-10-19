import { launch, ctxOpen, SIZES, sleep, go, shot, buildSat, bType, rlBox, rec, errors, openBoard, hours, closeBoard } from './lib.mjs'
console.log('sc17b v1')
const b = await launch()
const { ctx, p } = await ctxOpen(b, SIZES.desk, '17b')
await buildSat(p, { to: '12:00', ld: '17:00' })
const setLead = async v => {
  await closeBoard(p); await go(p, 'logic')
  if (!(await p.locator('[data-lgset="reportLead"]').count())) { await p.locator('button:visible:has-text("Edit"):not(:has-text("Schedule"))').first().click(); await sleep(500) }
  const inp = p.locator('[data-lgset="reportLead"]').first()
  await inp.evaluate(e => e.scrollIntoView({ block: 'center' })); await inp.click(); await inp.fill(v); await p.keyboard.press('Enter'); await sleep(500)
  await openBoard(p, 5)
}
const h0 = await hours(p, ['Saber'])
await setLead('2h30')
const h1 = await hours(p, ['Saber'])
await bType(p, rlBox(5, 0, 0), '09:00')
const h2 = await hours(p, ['Saber'])
await bType(p, rlBox(5, 0, 0), '')
await setLead('3h')
rec('9', 'desk', 'Insights hours of VL crew with nothing typed (TO 12:00 LD 17:00): default 3h vs 2h30; and with R 09:00 typed', 'empty box: day starts at take-off less the default (Logic text: "Insights hours count from it"): 3h -> 2h30 shortens the day by 30 min; R 09:00 typed equals the 3h default', { h3h: h0.Saber, h2h30: h1.Saber, h2h30_R0900: h2.Saber }, (h1.Saber === h0.Saber - 30 && h2.Saber === h0.Saber) ? 'PASS' : 'FAIL')
console.log('errors', JSON.stringify(errors)); await b.close()
