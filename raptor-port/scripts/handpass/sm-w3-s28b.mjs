// W3 S28b — the board's eyes, saved-plan look on an unpublished day, Templates eye, History clock. node sm-w3-s28b.mjs pc|phone
import * as L from './sm-lib.mjs'
const size = process.argv[2] || 'pc'
console.log('sm-w3-s28b v1', size)
const OUT = L.outDir('w3')
const res = {}
const step = async (k, fn) => { try { res[k] = await fn(); console.log(k, JSON.stringify(res[k])) } catch (e) { res[k] = { err: e.message.split('\n')[0] }; console.log(k, 'ERR', res[k].err) } }
const W = await L.launch(size, { origin: 'http://localhost:4394' })
const P = W.page
await L.signIn(W)
await L.publishDay(W, 2); await L.closeBoard(W)
await L.fileInput(W, { who: 'Bolt', type: 'LL', iso: '2026-07-15' })
await L.publishDay(W, 2); await L.closeBoard(W)
const eyes = () => P.evaluate(() => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  const eyes = [...document.querySelectorAll('svg.pveye')].filter(vis).map(s => { const r = s.getBoundingClientRect(); const cs = getComputedStyle(s); const p = s.parentElement
    return { w: +r.width.toFixed(1), h: +r.height.toFixed(1), color: cs.color, stroke: cs.stroke, host: (p.className || p.tagName) + '', hostText: p.textContent.trim().replace(/\s+/g, ' ').slice(0, 70), inBoard: !!s.closest('#schedBoard'), hostColor: getComputedStyle(p).color } })
  const typed = [...document.querySelectorAll('body *')].filter(e => e.children.length === 0 && vis(e) && e.textContent.includes('👁')).map(e => e.className + '|' + e.textContent.trim().slice(0, 50))
  return { eyes, typed }
})
const sel = di => P.evaluate(di => [...document.querySelectorAll(`#schedBoard [data-planmenu="${di}"]`)].filter(e => e.getBoundingClientRect().width).map(e => { const r = e.getBoundingClientRect(); return { text: e.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height) } }), di)
// ---- board on published Wed: looks
await L.openBoard(W, 2)
const bar = '#schedBoard'
await step('b.rest', async () => ({ sel: await sel(2), ...(await eyes()) }))
await L.pic(W, OUT, `s28-${size}-b-rest`, { clip: size === 'pc' ? { x: 0, y: 0, width: 1536, height: 220 } : { x: 0, y: 0, width: 402, height: 300 } })
for (let i = 0; i < 2; i++) {
  await L.press(W, `${bar} [data-planmenu="2"]`); await L.sleep(600)
  await L.press(W, P.locator('.wavemenu [data-planpv]').nth(i)); await L.sleep(1000)
  await step(`b.look${i}`, async () => ({ sel: await sel(2), ...(await eyes()) }))
  await L.pic(W, OUT, `s28-${size}-b-look${i}`, { clip: size === 'pc' ? { x: 0, y: 0, width: 1536, height: 300 } : { x: 0, y: 0, width: 402, height: 420 } })
  if (i === 0 && W.phone) await L.pic(W, OUT, `s28-${size}-b-look0-full`)
}
// back to live (banner button)
await step('b.back', async () => { const b = P.locator('#schedBoard button', { hasText: /Back to live/ }).filter({ visible: true }).first(); if (!(await b.count())) return { err: 'no back button' }; await (W.phone ? b.tap() : b.click()); await L.sleep(800); return { sel: await sel(2), ...(await eyes()) } })
// History clock and Reset arrow on the board bar
await step('b.bar', () => P.evaluate(() => {
  const bar = document.querySelector('#schedBoard .sb-top, #schedBoard .sb-bar, #schedBoard header') || document.querySelector('#schedBoard')
  const all = [...document.querySelectorAll('#schedBoard button, #schedBoard [role=button]')].filter(e => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().top < 140)
  return all.map(e => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim().slice(0, 20), title: e.title, svg: [...e.querySelectorAll('svg')].map(s => (s.getAttribute('class') || 'svg') + ':' + Math.round(s.getBoundingClientRect().width)), w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x) } })
}))
await L.closeBoard(W)
// ---- Thursday (unpublished): Alt Plan, then the saved-plan look
await L.goEdit(W)
const D3 = '#eWeek section.day[data-day="3"]'
await L.center(P, D3 + ' [data-planmenu="3"]')
await L.press(W, D3 + ' [data-planmenu="3"]'); await L.sleep(600)
await step('t.menu0', () => P.evaluate(() => [...document.querySelectorAll('.wavemenu')].filter(e => e.getBoundingClientRect().width).map(m => [...m.querySelectorAll('button')].map(b => Object.keys(b.dataset).join(',') + ': ' + b.textContent.trim().replace(/\s+/g, ' ').slice(0, 60)))))
await L.press(W, '.wavemenu [data-plandup]'); await L.sleep(1200)
await L.center(P, D3 + ' [data-planmenu="3"]')
await L.press(W, D3 + ' [data-planmenu="3"]'); await L.sleep(600)
await step('t.menu1', () => P.evaluate(() => [...document.querySelectorAll('.wavemenu')].filter(e => e.getBoundingClientRect().width).map(m => [...m.querySelectorAll('button')].map(b => Object.keys(b.dataset).join(',') + ': ' + b.textContent.trim().replace(/\s+/g, ' ').slice(0, 60)))))
await L.pic(W, OUT, `s28-${size}-t-menu`, { sel: '.wavemenu', pad: 40 })
await step('t.eyes', eyes)
await L.closeAll(W)
