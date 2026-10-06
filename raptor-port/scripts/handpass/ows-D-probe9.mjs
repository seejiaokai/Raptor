import * as D from './ows-D-lib.mjs'
import * as F from './ows-D-fix.mjs'
const { world, sleep, A, R, W, L, P, SAT } = D
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(300)
const w = await D.flyingWave(p, SAT, { cs: 'VIPER', to: '12:00', ld: '13:00', p1: 'bane' })
await A.closeBoard(p); await A.toWeek(p); await W.showDay(p, SAT)
await A.addItBtn(p, SAT, w.wi); await A.setItLine(p, SAT, w.wi, 0, 'IN TIME 0830')
const m = p.locator(`#eWeek [data-planmenu="${SAT}"]:visible`).first()
await m.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await m.click(); await sleep(500)
const menu = await p.evaluate(() => [...document.querySelectorAll('[data-planpv],[data-plansave],[data-plannew],[data-plan],[data-planact],[data-plandel],[data-planre],.planmenu *')].filter(e => e.offsetParent !== null && e.children.length === 0 || e.tagName === 'BUTTON').filter(e => e.offsetParent !== null).map(e => `${e.tagName}|${Object.entries(e.dataset).map(([k, v]) => k + '=' + v).join(',')}|${(e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 50)}`))
console.log(JSON.stringify(menu, null, 0))
await P(p, 'probe9-planmenu')
await browser.close()
