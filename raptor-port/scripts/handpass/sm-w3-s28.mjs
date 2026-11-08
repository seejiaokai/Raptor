// W3 S28 — every eye, its words, History's clock. node sm-w3-s28.mjs pc|phone
import * as L from './sm-lib.mjs'
const size = process.argv[2] || 'pc'
console.log('sm-w3-s28 v1', size)
const OUT = L.outDir('w3')
const res = {}
const step = async (k, fn) => { try { res[k] = await fn(); console.log(k, JSON.stringify(res[k])) } catch (e) { res[k] = { err: e.message.split('\n')[0] }; console.log(k, 'ERR', res[k].err) } }
const W = await L.launch(size, { origin: 'http://localhost:4394' })
const P = W.page
await L.signIn(W)
await step('pubORIG', () => L.publishDay(W, 2))
await L.closeBoard(W)
await L.fileInput(W, { who: 'Bolt', type: 'LL', iso: '2026-07-15' })
await step('pubAL1', () => L.publishDay(W, 2))
await L.closeBoard(W)
await L.goEdit(W)
const eyes = () => P.evaluate(() => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  const eyes = [...document.querySelectorAll('svg.pveye')].filter(vis).map(s => { const r = s.getBoundingClientRect(); const cs = getComputedStyle(s); const p = s.parentElement
    return { w: +r.width.toFixed(1), h: +r.height.toFixed(1), color: cs.color, stroke: cs.stroke, host: (p.className || p.tagName) + '', hostText: p.textContent.trim().replace(/\s+/g, ' ').slice(0, 80), inBoard: !!s.closest('#schedBoard'), hostColor: getComputedStyle(p).color } })
  const typed = [...document.querySelectorAll('body *')].filter(e => e.children.length === 0 && vis(e) && e.textContent.includes('👁')).map(e => e.className + '|' + e.textContent.trim().slice(0, 50))
  return { eyes, typed }
})
const selRead = di => P.evaluate(di => { const vis = e => e.getBoundingClientRect().width > 0; const b = [...document.querySelectorAll(`[data-planmenu="${di}"]`)].filter(vis).map(e => { const r = e.getBoundingClientRect(); const lab = e.querySelector('.plabel, span') ; return { inBoard: !!e.closest('#schedBoard'), text: e.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height), lines: Math.round(r.height / parseFloat(getComputedStyle(e).lineHeight || 16)) } }); return b }, di)
const DAY = '#eWeek section.day[data-day="2"]'
const planItems = () => P.evaluate(() => [...document.querySelectorAll('.wavemenu')].filter(e => e.getBoundingClientRect().width).map(m => [...m.querySelectorAll('button')].map(b => Object.keys(b.dataset).join(',') + ': ' + b.textContent.trim().replace(/\s+/g, ' ').slice(0, 60))))
const openMenu = async (scope) => { await L.press(W, `${scope} [data-planmenu="2"]`); await L.sleep(600) }
// ---- WEEK
await L.center(P, DAY + ' [data-planmenu="2"]')
await step('w.rest', async () => ({ sel: await selRead(2), ...(await eyes()) }))
await openMenu(DAY)
await step('w.menu', planItems)
await L.pic(W, OUT, `s28-${size}-w-menu`, { sel: '.wavemenu', pad: 40 })
// look at Original
const pvs = await P.evaluate(() => [...document.querySelectorAll('.wavemenu [data-planpv]')].map(b => b.textContent.trim().replace(/\s+/g, ' ')))
console.log('pv rows', JSON.stringify(pvs))
for (let i = 0; i < pvs.length; i++) {
  if (i > 0) { await L.center(P, DAY + ' [data-planmenu="2"]'); await openMenu(DAY) }
  await L.press(W, P.locator('.wavemenu [data-planpv]').nth(i)); await L.sleep(1000)
  await L.center(P, DAY + ' [data-planmenu="2"]'); await L.sleep(400)
  await step(`w.look${i}`, async () => ({ sel: await selRead(2), ...(await eyes()) }))
  await L.pic(W, OUT, `s28-${size}-w-look${i}`, { sel: DAY + ' [data-planmenu="2"]', pad: 150 })
  if (W.phone) await L.pic(W, OUT, `s28-${size}-w-look${i}-full`)
}
// ---- Alt Plan: create a saved plan
await L.center(P, DAY + ' [data-planmenu="2"]'); await openMenu(DAY)
await L.press(W, '.wavemenu [data-plandup]'); await L.sleep(1200)
await step('w.afterdup', async () => ({ sel: await selRead(2), items: null, ...(await eyes()) }))
await L.center(P, DAY + ' [data-planmenu="2"]'); await openMenu(DAY)
await step('w.menu2', planItems)
await L.pic(W, OUT, `s28-${size}-w-menu2`, { sel: '.wavemenu', pad: 40 })
await P.keyboard.press('Escape'); await L.sleep(300)
await L.closeAll(W)
