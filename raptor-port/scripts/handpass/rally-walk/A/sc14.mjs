import { launch, ctxOpen, SIZES, sleep, go, shot, buildSat, bType, rlBox, rec, errors, bf, openBoard, closeBoard, bPut, hours, val, model } from './lib.mjs'
console.log('sc14 v1')
const b = await launch()
const R = rlBox(5, 0, 0)
/* (b) a cancelled line */
{
  const { ctx, p } = await ctxOpen(b, SIZES.desk, '14b')
  await buildSat(p)
  await p.locator('#schedBoard [data-gline="5.0"]:visible').first().click(); await sleep(500)
  await bType(p, bf(5, 0, 1, 'cs'), 'RU'); await bType(p, bf(5, 0, 1, 'to'), '12:00'); await bType(p, bf(5, 0, 1, 'ld'), '13:00')
  const pu = await bPut(p, 5, 0, 1, 0, 'p', ['bane', 'ace', 'anvil'])
  const base = await hours(p, ['Ranger', 'Saber'])
  await bType(p, R, '05:00')              // VL's R (VL is Saber's)
  await p.locator('#schedBoard [data-lcx="5.0.0.0"]:visible').first().click(); await sleep(700)
  console.log('cxPop', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#cxPop button, #cxPop [data-cx]')].map(x => x.innerText.trim() + '|' + [...x.attributes].map(a => a.name + '=' + a.value).join(',')))))
  await p.locator('#cxSave').click(); await sleep(700)
  if (await p.locator('#cxPop').isVisible().catch(() => false)) { await p.keyboard.press('Escape'); await sleep(300) }
  const cx = await p.evaluate(() => ({ cx: window.DAYS[5].waves[0].formations[0].cx, cls: document.querySelector('#schedBoard [data-bfld="ff:5.0.0.rl"]')?.closest('.sb-line')?.className }))
  const h1 = await hours(p, ['Ranger', 'Saber'])
  rec('14', 'desk', 'VL R 05:00 typed, then cancel VL (CX)', 'the cancelled line\'s R must not set the wave\'s start: RU (Ranger) unchanged', { cx, base, h1 }, cx.cx && h1.Ranger === base.Ranger ? 'PASS' : 'RECORD', await shot(p, 'A14b-cancelled'))
  /* the faint suggestion on a cancelled line with an empty R */
  await bType(p, R, '')
  const v0 = await val(p, R)
  await p.locator(R + ':visible').first().click().catch(e => console.log('click err', String(e).slice(0, 80))); await sleep(250)
  const v1 = await val(p, R)
  const m = await model(p, 5, 0, 0)
  rec('14', 'desk', 'cancelled VL, R empty: look at the box, click it', 'RECORD: faint suggestion shows? tap places it?', { before: v0, afterClick: v1, rl: m.rl }, 'RECORD', await shot(p, 'A14b-cancelled-click'))
  await ctx.close()
}
console.log('errors', JSON.stringify(errors)); await b.close()
