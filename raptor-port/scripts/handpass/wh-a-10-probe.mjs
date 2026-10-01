/* [WARN-HIDE-KEPT] walker A — probe 10 (own world, nothing recorded): how a day template is saved and applied. */
import { world, L, W, pic, toastNow, warnsOf } from './wh-a-lib.mjs'
const { browser, p, errors } = await world(); p.setDefaultTimeout(6000)
const floating = () => p.evaluate(() => [...document.querySelectorAll('body *')].filter(e => { const c = getComputedStyle(e); const r = e.getBoundingClientRect(); return (c.position === 'fixed' || c.position === 'absolute') && r.width > 120 && r.height > 50 && c.display !== 'none' && c.visibility !== 'hidden' && +c.zIndex > 5 && e.innerText && e.innerText.trim().length > 6 }).map(e => e.tagName + '#' + e.id + '.' + String(e.className).slice(0, 40) + ' :: ' + e.innerText.replace(/\n+/g, ' | ').slice(0, 500) + ' :: CTRL ' + [...e.querySelectorAll('button, [role=menuitem], input, select')].slice(0, 30).map(b => b.tagName[0] + (b.id ? '#' + b.id : '') + [...b.attributes].filter(a => a.name.startsWith('data-')).map(a => `[${a.name}=${a.value.slice(0, 22)}]`).join('') + ':' + ((b.innerText || b.placeholder || b.value || '') + '').trim().slice(0, 22)).join(' ; ')).slice(0, 4).join('\n   '))
const tplBtn = di => p.locator(`#eWeek .day[data-day="${di}"] [data-daytplopen="${di}"]`).first()
try {
  await L.go(p, 'editsched'); await W.showDay(p, 0)
  await tplBtn(0).click(); await L.sleep(400)
  console.log('menu buttons', await p.evaluate(() => [...document.querySelectorAll('.wavemenu button')].map(b => b.outerHTML.slice(0, 160)).join(' || ')))
  await p.locator('.wavemenu button:visible', { hasText: 'Save this day' }).first().click(); await L.sleep(600)
  console.log('after Save this day: toast=', await toastNow(p), '\n   ' + await floating()); await pic(p, 'probe10-tplsave')
  /* a name box? type and confirm */
  const inp = p.locator('input:visible:focus, .airpop input:visible, .modal input:visible, .wavemenu input:visible').first()
  if (await inp.count()) { await inp.fill('MON-A'); await p.keyboard.press('Enter'); await L.sleep(600); console.log('typed a name; toast=', await toastNow(p), '\n   ' + await floating()) }
  await p.locator('#daytplModal button:visible', { hasText: /^Done$/ }).first().click(); await L.sleep(400)
  await W.showDay(p, 2); await tplBtn(2).click(); await L.sleep(400)
  console.log('menu buttons (Wed)', await p.evaluate(() => [...document.querySelectorAll('.wavemenu button')].map(b => b.outerHTML.slice(0, 200)).join(' || ')))
  console.log('\nWednesday templates menu:\n   ' + await floating()); await pic(p, 'probe10-tplmenu-wed')
  const item = p.locator('.wavemenu button:visible', { hasText: /MON-A|Monday/ }).first()
  if (await item.count()) { console.log('item attrs', await item.evaluate(e => e.outerHTML.slice(0, 200))); await item.click(); await L.sleep(700); console.log('after pick: toast=', await toastNow(p), '\n   ' + await floating()); await pic(p, 'probe10-tplapply') }
  console.log('Wed head:', await p.evaluate(() => document.querySelector('#eWeek .day[data-day="2"] .day-head').innerText.replace(/\s+/g, ' ')))
  console.log('Wed warnings now:', (await warnsOf(p, 2)).map(w => w.code + ':' + w.msg.slice(0, 40)).join(' | ').slice(0, 900))
} catch (e) { console.log('PROBE ERROR', String(e).split('\n').slice(0, 14).join(' // ')); await pic(p, 'probe10-error') }
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
