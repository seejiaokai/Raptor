console.log('B s21 v1 (two tabs on the same stored week; phone)')
import { launch, BASE, sleep, shot, tap, rec, wk, model, finish, errors } from './lib.mjs'
const b = await launch()
const ctx = await b.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
const mk = async name => {
  const p = await ctx.newPage()
  p.on('console', m => { if (m.type() === 'error') errors.push(name + ': ' + m.text()) })
  p.on('pageerror', e => errors.push(name + ' PAGEERROR ' + e.message))
  await p.goto(BASE + '/'); await p.waitForSelector('#luser', { state: 'visible', timeout: 10000 })
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important} *{caret-color:transparent !important}' })
  await p.evaluate(() => window.go('editsched')); await sleep(800)
  return p
}
const B = await mk('tabB')   /* opened first */
const A = await mk('tabA')
const leave = async p => { await tap(p, p.locator('#eWeek .day[data-day="3"] .day-head'), { block: 'start' }); await sleep(500) }
const rd = async p => { const m = await model(p, 3, 0, 0); return { rl: m.rl || '', br: m.br || '' } }
await A.bringToFront()
await tap(A, wk(A, 3, 'ff:3.0.0.rl')); await A.keyboard.type('0930'); await leave(A)
const a1 = await rd(A); const b1 = await rd(B)
console.log('after A types R: A', JSON.stringify(a1), 'B', JSON.stringify(b1))
await B.bringToFront()
await tap(B, wk(B, 3, 'ff:3.0.0.br')); await B.keyboard.type('1015'); await leave(B)
const a2 = await rd(A), b2 = await rd(B)
console.log('after B types B: A', JSON.stringify(a2), 'B', JSON.stringify(b2))
const C = await ctx.newPage()
await C.goto(BASE + '/'); await C.waitForSelector('#luser', { state: 'visible' }).catch(() => {})
let fresh = 'could not read'
try { if (await C.locator('#luser').isVisible()) { await C.fill('#luser', 'ad'); await C.fill('#lpass', 'a'); await C.click('#loginForm button[type=submit]') } await C.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); fresh = await rd(C) } catch (e) { fresh = 'err ' + e.message.slice(0, 60) }
rec('S21', 'tab B (opened first, not reloaded) types B on Thu VL after tab A typed R 09:30; then a third fresh tab reads the stored line', 'RECORD whether either save wipes the other (stored R and B)', { afterA: { A: a1, B: b1 }, afterB: { A: a2, B: b2 }, freshTab: fresh }, 'RECORD', await shot(B, 'B21-tabB'))
await b.close()
await finish('s21')
