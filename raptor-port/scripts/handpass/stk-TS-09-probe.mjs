import * as S from './stk-TS-lib.mjs'
const { L, W, world, pic } = S
const variant = process.env.VAR || 'a'
const { browser, p, errors } = await world()
await L.go(p, 'editsched')
await W.showDay(p, 0)
await S.weekBox(p, 'ff:0.0.0.to', '12:00'); await S.weekBox(p, 'ff:0.0.1.to', '13:00')
for (let i = 0; i < 6; i++) { const n = (await S.weekLines(p, 0, 0)).length; if (!n) break; await S.typeLine(p, '#eWeek', `0|0|0`, '') }
const add = async () => { const b = p.locator('#eWeek .day[data-day="0"] [data-itadd="0|0"]').first(); await b.scrollIntoViewIfNeeded(); await b.click(); await S.sleep(500) }
await add()
if (variant !== 'one') { await S.typeLine(p, '#eWeek', '0|0|0', '08:00H: IN TIME + WX/NOTAMS'); await add() }
if (variant === 'dup' ) { }
const st = async t => console.log(t, JSON.stringify(await p.evaluate(() => ({ sbw: document.querySelector('#schedBoard')?.offsetWidth, day: window.SBDAY, bfld: document.querySelectorAll('#schedBoard [data-bfld]').length, lines: (window.DAYS[0].waves[0].intimes || []) }))))
if (process.env.REAL) { const bt = p.locator('#eWeek [data-sbday="0"]').first(); console.log('btn', await bt.count()); await bt.scrollIntoViewIfNeeded(); await bt.click() } else await p.evaluate(() => window.openScheduler(0)); await S.sleep(1500); await st(variant + ' open')
console.log('errors', errors)
await browser.close()
