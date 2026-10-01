/* walker C — probe 2: how a guest gets in (Admin → Users' guest switch, then a sign-in the app does not know, then its
   own "Request access" form), and what his page is made of. */
import * as C from './wh-c-lib.mjs'
const { H, W2 } = C, { L, W } = H
const { browser, p, errors } = await H.world({ who: 'a' })
await L.go(p, 'editsched')
const s0 = await C.see(p, '#eWeek', 1, /Long work day/i, 'wolf')
await H.tapLine(p, '#eWeek', 1, s0.line.ix)
await L.settle(p)
await W2.usersPane(p)
const sw = p.locator('#admGuestView')
await sw.evaluate(e => e.scrollIntoView({ block: 'center' }))
if (!(await sw.isChecked())) { await sw.click(); await L.sleep(500) }
await L.settle(p)
await W2.signOut(p)
await W2.cardSignIn(p, 'walkguest', 'x')
await L.sleep(1000)
await p.fill('#accCs', 'Walker'); await p.fill('#accIni', 'WK')
console.log('SEAT OPTS', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#accSeat option')].map(o => o.value + '=' + o.text))))
await p.selectOption('#accSeat', { index: 1 }); await L.sleep(200)
console.log('CAT OPTS', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#accCat option')].map(o => o.value + '=' + o.text))))
await p.selectOption('#accCat', { index: 1 }); await L.sleep(200)
await p.click('#accSend'); await L.sleep(1500)
await H.pic(p, 'probe2-guest-after-request')
const dump = () => p.evaluate(() => ({ page: window.CURPAGE, text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 700), ids: [...document.querySelectorAll('[id]')].filter(e => e.offsetParent !== null).map(e => e.id).slice(0, 80), days: [...document.querySelectorAll('.day[data-day]')].filter(e => e.offsetParent !== null).map(e => (e.closest('[id]') || {}).id + ':' + e.dataset.day), dw: [...document.querySelectorAll('[data-dwbox]')].filter(e => e.offsetParent !== null).length, daywarnVisible: [...document.querySelectorAll('[data-daywarn]')].filter(e => e.offsetParent !== null).length, woff: document.querySelectorAll('[data-woff]').length, buttons: [...document.querySelectorAll('button, a')].filter(e => e.offsetParent !== null).map(e => (e.id || '') + '|' + e.innerText.trim().slice(0, 24)).slice(0, 50), wolf: [...document.querySelectorAll('.puck[data-person="wolf"]')].filter(e => e.offsetParent !== null).map(e => e.className + '@' + ((e.closest('.day') || {}).dataset || {}).day) }))
console.log('GUEST AFTER REQUEST', JSON.stringify(await dump()))
/* any button that says view / schedule */
const v = p.locator('button:visible, a:visible').filter({ hasText: /view|schedule/i }).first()
if (await v.count()) { console.log('pressing', await v.innerText()); await v.click(); await L.sleep(1500); await H.pic(p, 'probe2-guest-view'); console.log('GUEST VIEW', JSON.stringify(await dump())) }
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
