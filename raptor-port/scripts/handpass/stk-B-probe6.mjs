import * as K from './stk-B-lib.mjs'
const { B, L, W, sleep } = K
const { browser, p, errors } = await K.fresh()
try {
  const DI = 4
  await B.toEdit(p); await W.showDay(p, DI)
  const pm = p.locator(`#eWeek [data-planmenu="${DI}"]:visible`).first()
  await pm.click(); await sleep(500)
  console.log('PLANMENU', await p.evaluate(() => [...document.querySelectorAll('.wavemenu button, .planmenu button, [data-planpv], [data-plansave], [data-planload]')].filter(e => e.offsetParent !== null).map(e => Object.entries(e.dataset).map(([k, v]) => k + '=' + v).join(',') + ':' + (e.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 50))))
  await p.keyboard.press('Escape'); await sleep(300)
  const tb = p.locator(`#eWeek .day[data-day="${DI}"] button`, { hasText: 'Templates' }).first()
  console.log('tpl btn', await tb.count(), await tb.evaluate(e => JSON.stringify(e.dataset)).catch(() => ''))
  await tb.click(); await sleep(500)
  console.log('TPLMENU', await p.evaluate(() => [...document.querySelectorAll('.wavemenu button, .tplmenu button, .win button, [data-daytpl], [data-tpl]')].filter(e => e.offsetParent !== null).map(e => Object.entries(e.dataset).map(([k, v]) => k + '=' + v).join(',') + ':' + (e.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 50))))
  await B.pic(p, 'probe-tpl')
  console.log('peek', await p.evaluate(() => [...document.querySelectorAll('[class*=peek]')].map(e => e.className + ':' + (e.innerText || '').slice(0, 40).replace(/\s+/g, ' ')).slice(0, 10)))
  console.log('week chips', await p.evaluate(() => [...document.querySelectorAll('#eWeek button, #page-editsched button')].filter(e => /^Jul \d\d$/.test((e.innerText || '').trim())).map(e => JSON.stringify(e.dataset) + (e.innerText || '').trim())))
  console.log('errors', errors)
} finally { await browser.close() }
