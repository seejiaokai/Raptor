console.log('rcf-w2-b v1 — W2 items 6 (S05), 8 (S28), desktop; Logic probe for 7')
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.env.RUN || 'b1'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w2/' + RUN)
const W = await import('./rcf-w2-lib.mjs')
const F = await import('./rcf-w2-fx.mjs')
const { L, sleep, check, PASSIF, shot } = W
const { DI, sortie, ground, readAll } = F
const browser = await W.launch()
const warnCrop = (page, name) => page.locator('#schedBoard .sb-warn').first().screenshot({ path: process.env.HP_SHOTS + '/' + name + '.png' }).then(() => name + '.png')
const rosterEntry = (page, id) => page.evaluate(id => {
  const e = document.querySelector(`#sbRoster .rpuck[data-person="${id}"]`); if (!e) return null
  const w = e.querySelector('.rwhy')
  return { cls: e.className.replace(/\s+/g, ' '), why: w ? w.textContent.replace(/\s+/g, ' ').trim() : '', title: e.title }
}, id)
const crop = async (page, sel, name) => { const l = page.locator(sel).first(); await l.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150); await l.screenshot({ path: process.env.HP_SHOTS + '/' + name + '.png' }); return name + '.png' }
const scInfo = (page) => page.evaluate(d => window.DAYS[d].waves.map(w => ({ kind: w.kind, f: w.formations.map(f => ({ cs: f.cs, msn: f.msn, shift: f.shift, rl: f.rl, br: f.br, to: f.to, ld: f.ld, str: f.str, end: f.end, ac: f.aircraft.map(a => [a.p, a.w, a.role || '']) })) })), DI)

/* ===== S05 (desktop): SC 07:00-13:00 R 06:30 flying; LECTURE 09:00-10:00 Ranger ===== */
{
  const { page } = await W.world(browser)
  const bane = await W.pid(page, 'Ranger')
  await W.openBoard(page, DI)
  const gi = await W.addWave(page, DI, 'sc')
  await W.setF(page, `ff:${DI}.${gi}.0.rl`, '0630')
  console.log('sc after R', JSON.stringify((await scInfo(page))[0].f[0]))
  const g = await ground(page, { prog: 'LECTURE', str: '0900', end: '1000', who: bane })
  await W.openWarnFold(page)
  /* arm the SC MAIN seat */
  await L.tap(page, `[data-slot="${DI}.${gi}.0.0.p"]`); await sleep(400)
  let e = await rosterEntry(page, bane)
  const armed = await page.evaluate(() => window.ARM && window.ARM.key)
  PASSIF('S05.1 flying SC (R 06:30), MAIN seat armed: crew list crosses Ranger out "already on LECTURE 09:00–10:00"', e && /\bno\b/.test(e.cls) && /already on LECTURE 09:00.10:00/.test(e.why + ' ' + e.title), 'armed=' + armed + ' | ' + JSON.stringify(e), await crop(page, '#sbRoster .rpuck[data-person="' + bane + '"]', 's05-1-crew-list-flying'))
  await page.evaluate(() => { const r = document.querySelector('#schedBoard .sb-roster'); r && r.querySelector('.rpuck[data-person]'); })
  await shot(page, 's05-1-armed-board')
  /* seat him anyway */
  const p = page.locator(`#sbRoster .rpuck[data-person="${bane}"]:visible`).first()
  await p.evaluate(x => x.scrollIntoView({ block: 'center' })); await sleep(100); await p.click(); await sleep(500)
  const seated = await page.evaluate(([d, gi]) => window.DAYS[d].waves[gi].formations[0].aircraft[0].p, [DI, gi])
  let o = await readAll(page, bane, 'seated on flying SC with lecture')
  let c = o.lines.find(l => /LECTURE|clash/i.test(l) && !/not published/.test(l))
  PASSIF('S05.2 seated anyway: a red clash in the list', seated === bane && c && /:live/.test(c) && o.boardRings.some(x => /RED/.test(x)), 'seat=' + seated + ' | ' + JSON.stringify(c) + ' | ' + o.head + ' | board ' + o.boardRings, await warnCrop(page, 's05-2-clash-flying'))
  await shot(page, 's05-2-board-flying')
  /* clear the R: the shift stands by */
  await W.setF(page, `ff:${DI}.${gi}.0.rl`, '')
  console.log('after R cleared', JSON.stringify((await scInfo(page))[0].f[0]))
  o = await readAll(page, bane, 'R cleared (standby)')
  c = o.lines.find(l => /LECTURE|clash|already/i.test(l) && !/not published/.test(l))
  const red = o.boardRings.some(x => /RED/.test(x))
  PASSIF('S05.3 R cleared, Ranger already seated: the clash is not red (standby rule as before)', !red, 'clash line: ' + JSON.stringify(c) + ' | ' + o.head + ' | board ' + o.boardRings, await warnCrop(page, 's05-3-standby'))
  await shot(page, 's05-3-board-standby')
  /* the crew list for the standby shift: take him off, arm the empty seat, read his entry */
  const u = await F.unseat2(page, `[data-slot="${DI}.${gi}.0.0.p"]`)
  await L.tap(page, `[data-slot="${DI}.${gi}.0.0.p"]`); await sleep(400)
  e = await rosterEntry(page, bane)
  PASSIF('S05.4 R cleared, MAIN seat armed: the crew list no longer crosses him out for the lecture', e && !/\bno\b/.test(e.cls), 'unseat=' + JSON.stringify(u) + ' | ' + JSON.stringify(e), await crop(page, '#sbRoster .rpuck[data-person="' + bane + '"]', 's05-4-crew-list-standby'))
  await page.keyboard.press('Escape')
  await page.close()
}

/* ===== S05 variant: a Meeting filed on the Inputs page ===== */
/* (see script rcf-w2-c) */

/* ===== S28: tight turn flying SC then sortie ===== */
{
  const { page } = await W.world(browser)
  const bane = await W.pid(page, 'Ranger')
  await W.openBoard(page, DI)
  const gi = await W.addWave(page, DI, 'sc')
  await W.setF(page, `ff:${DI}.${gi}.0.rl`, '0630')
  await L.put(page, `[data-slot="${DI}.${gi}.0.0.p"]`, [bane])
  const s = await sortie(page, { who: bane, to: '1330', ld: '1430' })
  await W.openWarnFold(page)
  let o = await readAll(page, bane, 'SC ends 13:00, sortie takes off 13:30')
  let c = o.lines.filter(l => !/not published/.test(l))
  console.log('S28 info', JSON.stringify((await scInfo(page)).map(w => w.f.map(f => [f.cs, f.msn, f.to, f.ld, f.rl, f.br, f.str, f.end]))))
  PASSIF('S28.1 flying SC ending 13:00 + sortie 13:30: a tight-turn note', c.some(l => /turn|tight/i.test(l)), JSON.stringify(c) + ' | board ' + o.boardRings, await warnCrop(page, 's28-1-tight-turn'))
  await shot(page, 's28-1-board')
  await page.close()
}
{
  const { page } = await W.world(browser)
  const bane = await W.pid(page, 'Ranger')
  await W.openBoard(page, DI)
  /* sortie first (11:00-12:20), then the flying PM shift 13:00-19:00 R 12:30 */
  const s = await sortie(page, { who: bane, to: '1100', ld: '1220' })
  const gi = await W.addWave(page, DI, 'sc')
  await W.setF(page, `ff:${DI}.${gi}.1.rl`, '1230')
  console.log('S28b formation1 fields', JSON.stringify((await scInfo(page))[gi].f[1]))
  await L.put(page, `[data-slot="${DI}.${gi}.1.0.p"]`, [bane])
  await W.openWarnFold(page)
  const o = await readAll(page, bane, 'sortie 11:00-12:20 then flying PM shift (R 12:30)')
  const c = o.lines.filter(l => !/not published/.test(l))
  check('S28.2 reversed order (sortie first, flying SC shift after): the tight-turn note', c.some(l => /turn|tight/i.test(l)) ? 'PASS' : 'FAIL', JSON.stringify(c) + ' | board ' + o.boardRings, 's28-2-reversed.png')
  await warnCrop(page, 's28-2-reversed')
  await shot(page, 's28-2-board')
  await page.close()
}
writeFileSync(process.env.HP_SHOTS + '/results.json', JSON.stringify({ results: W.results, errors: W.errorsAll }, null, 1))
console.log('ERRORS', JSON.stringify(W.errorsAll.slice(0, 5)))
await browser.close()
console.log('DONE', W.results.filter(r => r.verdict === 'PASS').length + '/' + W.results.length)
