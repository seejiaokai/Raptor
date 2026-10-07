/* Finding F-A1 — the Edit Schedule wave header keeps the old In-time / Rally clock after the line is edited */
import * as S from './stk-A-lib.mjs'
const { world, L, W, pic, row, savePart, sleep } = S
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)
await p.locator('#page-editsched [data-wk="20/07/2026"]:visible').click(); await sleep(1000)
const di = 0
const w = await S.addFlyingWave(p, di, { cs: 'VIPER', to: '00:30', ld: '01:30', p1: 'stiff' })
await S.closeBoard(p); await S.toWeek(p); await S.W.showDay(p, di)
await S.addItBtn(p, di, w.wi)
const h1 = await S.waveHeader(p, di)
await S.setItLine(p, di, w.wi, 0, '22:30H: IN TIME + WX/NOTAMS')
await sleep(1200)
const lines = await S.itPainted(p, di, w.wi), h2 = await S.waveHeader(p, di)
await p.evaluate(i => { const b = document.querySelector('#eWeek .intimes[data-intimes="0|' + i + '"]'); b.scrollIntoView({ block: 'center', inline: 'center' }); window.scrollBy(0, 0) }, w.wi); await sleep(400)
const pa = await pic(p, 'F-A1-week-header-after-line-edit')
await S.toBoard(p, di)
const hb = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .asd')].map(e => e.innerText.replace(/\s+/g, ' ')))
const pb = await pic(p, 'F-A1-board-header-same-moment')
console.log(JSON.stringify({ h1, lines, h2, hb }))
row('F-A1', 'new wave Mon 20 Jul 00:30-01:30; pressed + In-time / Rally (filled 21:30H), edited the line to 22:30H; read the week header and the board header', `week line says ${JSON.stringify(lines)}; week wave header says ${JSON.stringify(h2.slice(-1))}; board header says ${JSON.stringify(hb.slice(-1))}`, h2.slice(-1)[0].includes('21:30') && hb.slice(-1)[0].includes('22:30') ? 'FAIL' : 'PASS', [pa, pb])
console.log(errors)
savePart('hdr')
await browser.close()
