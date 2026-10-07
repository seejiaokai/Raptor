import * as K from './stk-B-lib.mjs'
const { B, L, W, sleep } = K
const { browser, p, errors } = await K.fresh()
const dumpVis = (sel) => p.evaluate(s => [...document.querySelectorAll(s)].filter(e => e.offsetParent !== null).map(e => e.tagName + ' ' + Object.entries(e.dataset).map(([k, v]) => k + '=' + v).join(',') + ':' + (e.innerText || e.value || '').trim().replace(/\s+/g, ' ').slice(0, 50)), sel)
try {
  const DI = 4
  const { gi } = await K.addFlyWave(p, DI)
  await K.ff(p, DI, gi, 0, 'cs', 'RP'); await K.ff(p, DI, gi, 0, 'msn', 'BFM'); await K.ff(p, DI, gi, 0, 'to', '12:00'); await K.ff(p, DI, gi, 0, 'ld', '13:00')
  await B.toEdit(p); await W.showDay(p, DI)
  await p.locator(`#eWeek [data-daytplopen="${DI}"]`).first().click(); await sleep(400)
  await p.locator('[data-daytplsave]').first().click(); await sleep(600)
  console.log('AFTER SAVE CLICK inputs/buttons', await dumpVis('input, .modal button, .sheet button, dialog button, .wavemenu button, [role=dialog] button'))
  await p.locator('button', { hasText: /^Done$/ }).last().click(); await sleep(600)
  await W.showDay(p, 5)
  await p.locator('#eWeek [data-daytplopen="5"]').first().click(); await sleep(400)
  console.log('MENU day5', await dumpVis('.wavemenu button, .wavemenu input'))
  await p.keyboard.press('Escape'); await sleep(300)
  await W.showDay(p, DI)
  await p.locator(`#eWeek [data-planmenu="${DI}"]:visible`).first().click(); await sleep(400)
  await p.locator('[data-plandup]').first().click(); await sleep(800)
  console.log('AFTER ALT PLAN', await dumpVis('.wavemenu button, .win button, .planbar button, [data-planpv], [data-plangolive], [data-planalt], [data-planmenu]'))
  console.log('head', JSON.stringify(await B.head(p, DI)))
  console.log('errors', errors)
} finally { await browser.close() }
