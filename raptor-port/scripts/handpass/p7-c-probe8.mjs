/* p7 walker C — probe 8: the board's section cards in OIL Earn mode (their classes), read only. */
import { boot, world, fileTimed, oilButton } from './p6-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await world(L)
const iid = await fileTimed(L, p, { person: 'bane', type: 'Training', iso: '2026-07-18', from: '08:00', to: '16:00', remarks: 'P7' })
await W.boardOn(p, 5)
const look = () => p.evaluate(() => {
  const all = [...document.querySelectorAll('#schedBoard *')].filter(e => e.children.length === 0 && /GROUND PROGRAMME|PERSONAL INPUTS/.test(e.textContent || ''))
  return all.map(e => { const chain = []; let x = e; for (let i = 0; i < 5 && x && x.id !== 'schedBoard'; i++) { chain.push(x.tagName + '.' + String(x.className).replace(/\s+/g, '.')); x = x.parentElement } return { text: e.textContent.trim().slice(0, 30), chain: chain.join(' < '), vis: e.offsetParent !== null } })
})
console.log('normal', JSON.stringify(await look(), null, 1))
await oilButton(L, p)
console.log('oil', JSON.stringify(await look(), null, 1))
console.log('oil row', await p.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard [data-oilp]')].find(x => x.offsetParent !== null && x.dataset.oilitem.startsWith('i:')); const r = e && (e.closest('.sb-arow') || e.parentElement.parentElement); return r ? r.outerHTML.slice(0, 1500) : null }))
console.log('ground row in oil', await p.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard .puck[data-person="bane"]')].filter(x => x.offsetParent !== null).map(x => { const r = x.closest('.sb-arow') || x.parentElement.parentElement; return r.outerHTML.slice(0, 1200) }); return e }))
await browser.close()
