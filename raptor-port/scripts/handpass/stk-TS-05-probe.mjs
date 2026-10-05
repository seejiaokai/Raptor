import * as S from './stk-TS-lib.mjs'
const { L, W, world, pic } = S
const { browser, p, errors } = await world()
await L.go(p, 'editsched')
await S.sleep(500)
await W.showDay(p, 4)
console.log('fri buttons', await p.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="4"] button')].filter(b => b.offsetParent).map(b => (b.id || '') + '|' + (b.className) + '|' + b.innerText.trim().slice(0, 30) + '|' + [...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',')).slice(0, 60)))
// open the board on Friday
await W.boardOn(p, 4)
console.log('board buttons', await p.evaluate(() => [...document.querySelectorAll('#schedBoard button')].filter(b => b.offsetParent).map(b => (b.id || '') + '|' + b.innerText.trim().slice(0, 25) + '|' + [...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',')).slice(0, 80)))
await pic(p, 'probe-board-fri')
const addw = p.locator('#schedBoard [data-addwave], #schedBoard button:has-text("Wave")').first()
console.log('addwave count', await addw.count())
await addw.click().catch(e => console.log('click err', e.message)); await S.sleep(500)
console.log('menu', await p.evaluate(() => [...document.querySelectorAll('.wavemenu *, .wvmenu *, [role=menu] *')].filter(b => b.offsetParent && b.children.length === 0).map(b => b.tagName + '|' + (b.className) + '|' + b.innerText.trim().slice(0, 30) + '|' + [...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',')).slice(0, 60)))
await pic(p, 'probe-addwave-menu')
console.log('errors', errors)
await browser.close()
