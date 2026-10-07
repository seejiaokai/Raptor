/* D-04 — a louder flag beside the crew-rest one. B, then X also breaks a qualification rule on Tuesday (a seat he is not qualified for on a second
   Tuesday aircraft), plus a blank crewed line. Env HP_PHONE=1 for the phone. */
import * as K from './rbl-D-lib.mjs'
const { B, W, R, X, MON, TUE, clean } = K
const sz = K.PHONE ? 'phone' : 'desk'
const ID = `D-04-${sz}`
let CS = ''
const { browser, p, errors } = await K.fresh()

/* everything about him on Tuesday as a person sees it: the list (words), his week pucks (chip + painted ring), Monday's puck */
async function look(tag) {
  const s = await K.see(p, tag, { pics: false })
  const list = await K.listFull(p, TUE)   // opens the list
  const mine = list.lines.filter(x => x.text.includes(CS))
  return { s, list, mine }
}
const lines = l => l.mine.map(x => `[${x.sev}${x.hid ? ' hidden' : ''}] ${x.text.slice(0, 150)}`)
async function tapLine(re) {
  await B.toEdit(p); await W.showDay(p, TUE); await B.openList(p, '#eWeek', TUE)
  const ix = await p.evaluate(r => { const re = new RegExp(r); const e = [...document.querySelectorAll('#eWeek .day[data-day="1"] .witem[data-wix]')].find(x => re.test(x.innerText)); return e ? +e.dataset.wix : -1 }, re.source)
  if (ix < 0) return { tapped: false }
  const t = p.locator(`#eWeek .day[data-day="${TUE}"] .witem[data-wix="${ix}"] .wtx`).first()
  await t.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await K.sleep(200)
  const hit = await t.evaluate(e => { const r = e.getBoundingClientRect(); const x = document.elementFromPoint(r.left + 8, r.top + r.height / 2); return !!x && (x === e || e.contains(x) || x.closest('.witem') === e.closest('.witem')) })
  await t.click({ position: { x: 8, y: 6 } }).catch(() => {}); await K.sleep(500)
  const lit = await p.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="1"] .puck.wfoc')].map(e => e.dataset.person + '/' + (e.querySelector('.lchip') || {}).innerText))
  return { tapped: true, ix, hit, lit }
}
try {
  const cs = await B.csOf(p, X); CS = cs
  const m = await K.wave(p, MON, 'ZM', 'BFM', '20:00', '22:30', X)
  const t = await K.wave(p, TUE, 'ZT', 'BFM', '07:00', '08:00', X, '05:00')
  const b0 = await look('b0')
  const shot0 = await K.picEl(p, `#eWeek .day[data-day="${TUE}"] [data-dwbox="${TUE}"]`, 'b0-tue-list', { pad: 8, maxH: 520 })
  R(`${ID}.0`, `Baseline B for ${cs} (Monday ZM 20:00–22:30; Tuesday ZT 07:00–08:00, Brief 05:00)`, K.brief(b0.s) + ` · his list lines ${JSON.stringify(lines(b0))} · his Tuesday pucks ${K.pk(b0.s.tuePk)} · Monday ${K.pk(b0.s.monPk)}`, K.whole(b0.s) ? 'PASS' : 'FAIL', [shot0])

  /* the second Tuesday aircraft: a new wave with a timed line, and him in its BACK seat */
  const q = await K.addFlyWave(p, TUE)
  await K.ff(p, TUE, q.gi, 0, 'cs', 'ZQ'); await K.ff(p, TUE, q.gi, 0, 'msn', 'BFM'); await K.ff(p, TUE, q.gi, 0, 'to', '10:00'); await K.ff(p, TUE, q.gi, 0, 'ld', '11:00')
  const QS = K.SEAT === 'w' ? 'p' : 'w'; const sq = await K.seat(p, TUE, q.gi, 0, 0, QS, X)
  console.log('Q seat', JSON.stringify(sq), '| line', await K.lineOf(p, TUE, q.gi, 0))
  const held1 = (await K.held(p, TUE, X)).map(x => `${x.sev}/${x.code}: ${x.msg}`)
  const b1 = await look('b1')
  const tap1 = await tapLine(new RegExp(CS + '.*Crew rest breach'))
  const shot1 = await K.picEl(p, `#eWeek .day[data-day="${TUE}"] [data-dwbox="${TUE}"]`, 'b1-tue-list-tapped', { pad: 8, maxH: 560 })
  const puck1 = await B.puckPic(p, '#eWeek', TUE, X, 'b1-tue-puck')
  const hasQ1 = b1.mine.some(x => /cannot fly|not qualified|qualif/i.test(x.text))
  R(`${ID}.1`, `${cs} also put in the ${QS === 'p' ? 'FRONT' : 'BACK'} seat of a second Tuesday aircraft (new wave ZQ 10:00–11:00; seat took ${sq.took}${sq.msg ? ', app said "' + sq.msg + '"' : ''})`,
    `held: ${JSON.stringify(held1)} · his list lines ${JSON.stringify(lines(b1))} · bar "${b1.list.bar}" · his Tuesday pucks ${K.pk(b1.s.tuePk)} · Monday ${K.pk(b1.s.monPk)} · tapped the crew-rest line: ${JSON.stringify(tap1)}`,
    sq.took && b1.s.breach && hasQ1 ? 'RECORDED' : 'FAIL', [shot1, puck1])
  await p.keyboard.press('Escape'); await K.sleep(300)
  // the verdict of the scenario's EXPECTED line applies after the blank line is added; this step only records the qualification line
  /* a blank crewed line too: + Line on the new wave, him in its front seat */
  await K.addLine(p, TUE, q.gi)
  const fi = (await K.nLines(p, TUE, q.gi)) - 1
  const sb = await K.seat(p, TUE, q.gi, fi, 0, K.SEAT, X)
  console.log('blank line', await K.lineOf(p, TUE, q.gi, fi), 'took', JSON.stringify(sb))
  const held2 = (await K.held(p, TUE, X)).map(x => `${x.sev}/${x.code}: ${x.msg}`)
  // resting rings FIRST, with every list shut and nothing tapped (an open list or a tapped line lights the pucks it names)
  const b2s = await K.see(p, 'b2s', { pics: false })
  const puck2 = await B.puckPic(p, '#eWeek', TUE, X, 'b2-tue-puck')
  const mon2 = await B.puckPic(p, '#eWeek', MON, X, 'b2-mon-puck').catch(() => null)
  const b2 = await look('b2')
  const tap2 = await tapLine(new RegExp(CS + '.*Crew rest breach'))
  const shot2 = await K.picEl(p, `#eWeek .day[data-day="${TUE}"] [data-dwbox="${TUE}"]`, 'b2-tue-list-tapped', { pad: 8, maxH: 560 })
  const monAfterTap = await K.paint(p, `#eWeek .day[data-day="${MON}"]`, X)
  const crewLine = b2.mine.find(x => /Crew rest breach/.test(x.text))
  const qLine = b2.mine.find(x => /cannot fly|not qualified|qualif/i.test(x.text))
  const qChip = b2s.tuePk.filter(x => x.where === 'flying').map(x => x.chip)
  const qLouder = qChip.some(c => /Q/.test(c))
  const ringed = b2s.tuePk.some(x => x.where === 'flying' && x.solid)
  const lights = tap2.tapped && tap2.lit.some(s => s.startsWith(X + '/'))
  R(`${ID}.2`, `then a blank crewed line too: + Line on ZQ, ${cs} in its ${K.SEAT === 'p' ? 'front' : 'back'} seat (took ${sb.took}); read his pucks with every list shut and nothing tapped, then Tuesday's list, then tap the crew-rest line`,
    `held: ${JSON.stringify(held2)} · crew-rest line in the list: ${crewLine ? '"' + crewLine.text.slice(0, 170) + '"' : 'MISSING'} · qualification line: ${qLine ? '"' + qLine.text.slice(0, 150) + '"' : 'MISSING'} · his Tuesday pucks (resting): ${K.pk(b2s.tuePk)} (chips ${JSON.stringify(qChip)}) · Monday (resting): ${K.pk(b2s.monPk)} (classes: ${b2s.monPk.map(x => x.cls.replace(/s+/g, ' ')).join(' | ')}) · after tapping the crew-rest line: lit Tuesday pucks ${JSON.stringify(tap2.lit)}; Monday's pucks then read: ${K.pk(monAfterTap)} (classes: ${monAfterTap.map(x => x.cls.replace(/\s+/g, ' ')).join(' | ')})`,
    crewLine && qLine && qLouder && ringed && b2s.dotMon && lights ? 'PASS' : 'FAIL', [shot2, puck2, mon2].filter(Boolean))
} catch (e) { R(`${ID}.script`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, `${ID}-X`)]) }
await K.wrap('d04', browser, errors, ID)
