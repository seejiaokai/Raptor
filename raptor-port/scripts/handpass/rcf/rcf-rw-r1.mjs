console.log('rcf-rw-r1 v1 — R1: two clashes worded the same, one hidden (D2001), desktop; variant B = second BRIEFING row overlapping the first VL line')
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.env.RUN || 'r1a'
process.env.HP_URL ||= 'http://localhost:4292'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/rewalk/' + RUN)
const { mkdirSync } = await import('node:fs')
mkdirSync(process.env.HP_SHOTS, { recursive: true })
const R = await import('./rcf-rw-lib.mjs')
const { W, L, sleep, check, PASSIF, shot, sortie, ground, read, notPub, warnCrop } = R
const DI = 4   // Friday 17 Jul: a clean weekday
const browser = await W.launch()
const clash = o => o.lines.filter(l => /clash/.test(l.text) && notPub(l))
const redRings = o => o.boardRings.filter(x => /RED/.test(x))
const bundleName = async p => R.bundle(p)

async function run(variant) {
  const { page } = await W.world(browser)
  console.log('BUNDLE', await bundleName(page))
  const bane = await W.pid(page, 'Ranger')
  await W.openBoard(page, DI)
  const s1 = await sortie(page, DI, { who: bane, to: '1200', ld: '1300' })
  const g1 = await ground(page, DI, { prog: 'BRIEFING', str: '1200', end: '1230', who: bane })
  await W.openWarnFold(page)
  let o = await read(page, DI, bane, variant + ' built')
  let c = clash(o)
  PASSIF(`R1${variant}.0 fixture: one red clash line "VL BFM & BRIEFING", Ranger's pucks red`, c.length === 1 && c[0].sev === 'RED' && c[0].state === 'live' && redRings(o).length >= 2, JSON.stringify(c.map(l => [l.sev, l.state, l.text])) + ' | board ' + o.boardRings + ' | week ' + o.weekRings, await warnCrop(page, `r1${variant}-0-built`))
  await shot(page, `r1${variant}-0-board`)
  await W.hideIx(page, DI, c[0].ix)
  o = await read(page, DI, bane, variant + ' hidden'); c = clash(o)
  PASSIF(`R1${variant}.1 hidden: line struck with Reset arrow, pucks plain`, c.length === 1 && c[0].state === 'HID' && c[0].struck && c[0].btn === 'reset' && redRings(o).length === 0, JSON.stringify(c.map(l => [l.sev, l.state, l.struck, l.btn, l.text])) + ' | board ' + o.boardRings + ' | week ' + o.weekRings, await warnCrop(page, `r1${variant}-1-hidden`))
  await shot(page, `r1${variant}-1-hidden-board`)
  /* the second clash, worded the same */
  let s2 = null, g2 = null
  if (variant === 'A') {
    s2 = await sortie(page, DI, { who: bane, to: '1500', ld: '1600' })
    g2 = await ground(page, DI, { prog: 'BRIEFING', str: '1500', end: '1530', who: bane })
  } else {
    g2 = await ground(page, DI, { prog: 'BRIEFING', str: '1210', end: '1240', who: bane })
  }
  await W.openWarnFold(page)
  o = await read(page, DI, bane, variant + ' second clash made'); c = clash(o)
  const live = c.filter(l => l.state === 'live'), hid = c.filter(l => l.state === 'HID')
  const sortieRings = o.boardRings.filter(x => x.startsWith(`${DI}.${(s2 || s1).gi}.0.0.p`))
  PASSIF(`R1${variant}.2 second clash: the clash line shows LIVE and RED (struck lines beside it: ${hid.length})`, live.length >= 1 && live.every(l => l.sev === 'RED'), JSON.stringify(c.map(l => [l.sev, l.state, l.text])) + ' | ' + o.head, await warnCrop(page, `r1${variant}-2-list`))
  PASSIF(`R1${variant}.3 Ranger's pucks ring red on the board (second VL puck / the VL puck)`, sortieRings.some(x => /RED/.test(x)) && redRings(o).length >= 2, 'board ' + o.boardRings, `r1${variant}-3-board.png`)
  await shot(page, `r1${variant}-3-board`)
  /* the week behind it */
  PASSIF(`R1${variant}.4 ...and on the week behind the board`, o.weekRings.filter(x => /RED/.test(x)).length >= 2, 'week ' + o.weekRings, `r1${variant}-4-week.png`)
  await W.closeBoard(page); await sleep(400)
  await page.evaluate(d => document.querySelector(`#eWeek .day[data-day="${d}"]`).scrollIntoView({ block: 'center', inline: 'center' }), DI)
  await page.locator(`#eWeek .day[data-day="${DI}"]`).first().screenshot({ path: process.env.HP_SHOTS + `/r1${variant}-4-week.png` })
  await W.openBoard(page, DI); await W.openWarnFold(page)
  /* delete the second BRIEFING row */
  const nG0 = await page.evaluate(d => window.DAYS[d].ground.length, DI)
  await L.tap(page, `[data-grdel="${DI}.${g2.ri}"]`); await sleep(500)
  const nG = await page.evaluate(d => window.DAYS[d].ground.length, DI)
  console.log('ground rows now', nG, 'before delete', nG0)
  o = await read(page, DI, bane, variant + ' second BRIEFING deleted'); c = clash(o)
  PASSIF(`R1${variant}.5 second BRIEFING deleted: the line is struck (hidden) again and his pucks are plain`, nG === nG0 - 1 && c.length === 1 && c[0].state === 'HID' && c[0].struck && c[0].btn === 'reset' && redRings(o).length === 0, `ground rows ${nG0} -> ${nG} | ` + JSON.stringify(c.map(l => [l.sev, l.state, l.struck, l.text])) + ' | board ' + o.boardRings + ' | week ' + o.weekRings, await warnCrop(page, `r1${variant}-5-deleted`))
  await shot(page, `r1${variant}-5-deleted-board`)
  /* Reset arrow */
  await W.hideIx(page, DI, c[0].ix)
  o = await read(page, DI, bane, variant + ' Reset pressed'); c = clash(o)
  PASSIF(`R1${variant}.6 Reset arrow: the line is live and red again, pucks red`, c.length === 1 && c[0].state === 'live' && c[0].sev === 'RED' && redRings(o).length >= 2, JSON.stringify(c.map(l => [l.sev, l.state, l.text])) + ' | board ' + o.boardRings + ' | week ' + o.weekRings, await warnCrop(page, `r1${variant}-6-reset`))
  await shot(page, `r1${variant}-6-reset-board`)
  await page.close()
}
await run('A')
if (!process.env.SKIPB) await run('B')
R.finish()
await browser.close()
