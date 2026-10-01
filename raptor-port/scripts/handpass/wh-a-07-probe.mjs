/* [WARN-HIDE-KEPT] walker A — probe 7 (own world, nothing recorded): the plan selector's menu and the day Templates
   window on Edit Schedule — what they offer. */
import { world, L, W, pic, toastNow } from './wh-a-lib.mjs'
const { browser, p, errors } = await world(); p.setDefaultTimeout(6000)
const floating = () => p.evaluate(() => [...document.querySelectorAll('body *')].filter(e => { const c = getComputedStyle(e); const r = e.getBoundingClientRect(); return (c.position === 'fixed' || c.position === 'absolute') && r.width > 120 && r.height > 60 && c.display !== 'none' && c.visibility !== 'hidden' && +c.zIndex > 5 && e.innerText && e.innerText.trim().length > 10 }).map(e => e.tagName + '#' + e.id + '.' + String(e.className).slice(0, 40) + ' z' + getComputedStyle(e).zIndex + ' :: ' + e.innerText.replace(/\n+/g, ' | ').slice(0, 600) + ' :: BTNS ' + [...e.querySelectorAll('button, [role=menuitem], input, select')].slice(0, 30).map(b => b.tagName[0] + (b.id ? '#' + b.id : '') + [...b.attributes].filter(a => a.name.startsWith('data-')).map(a => `[${a.name}=${a.value.slice(0, 18)}]`).join('') + ':' + ((b.innerText || b.placeholder || b.value || '') + '').trim().slice(0, 18)).join(' ; ')).slice(0, 5).join('\n   '))
try {
  await L.go(p, 'editsched'); await W.showDay(p, 1)
  await p.locator('#eWeek .day[data-day="1"] [data-planmenu="1"]').first().click(); await L.sleep(500)
  console.log('PLAN MENU:\n   ' + await floating()); await pic(p, 'probe7-planmenu')
  await p.keyboard.press('Escape'); await L.sleep(300); await p.mouse.click(700, 880); await L.sleep(300)
  await p.locator('#eWeek .day[data-day="1"] [data-daytplopen="1"]').first().click(); await L.sleep(600)
  console.log('\nTEMPLATES:\n   ' + await floating()); await pic(p, 'probe7-templates')
} catch (e) { console.log('PROBE ERROR', String(e).split('\n')[0]) }
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
