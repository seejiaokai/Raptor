/* walker B, script 3: P2-14 (standby work is not flying), P2-15 (earlier work affects only its own person). */
import * as K from './stk-B-lib.mjs'
import { oilMode as _om, lwCell } from './lib.mjs'
import { allSwitches, allPucks } from './seat-lib.mjs'
const { B, L, W, R, pic, picEl, sleep } = K
const which = process.argv[2] || 'all'

async function p214() {
  const DI = 5   /* Saturday */
  const { browser, p, errors } = await K.fresh()
  try {
    const ids = { sc: 'taipan', spare: 'mamba', av: 'boosh', bb: 'beams' }
    const names = await K.cs(p, Object.values(ids))
    const h0 = await K.hours(p, names, 'p14-0-base')
    const ld0 = K.sec(h0.r, 'Flying load')
    const sc = await K.addStandby(p, DI, 'sc'), av = await K.addStandby(p, DI, 'avalon'), bb = await K.addStandby(p, DI, 'bb')
    await K.ff(p, DI, bb.gi, 0, 'to', '08:00'); await K.ff(p, DI, bb.gi, 0, 'ld', '14:00')
    const t = []
    t.push((await K.seat(p, DI, sc.gi, 0, 0, 'p', ids.sc)).took)       /* SC AM shift, MAIN */
    t.push((await K.seat(p, DI, sc.gi, 0, 2, 'p', ids.spare)).took)    /* SC AM shift, SPARE */
    t.push((await K.seat(p, DI, av.gi, 0, 0, 'p', ids.av)).took)       /* AVALON night */
    t.push((await K.seat(p, DI, bb.gi, 0, 0, 'p', ids.bb)).took)       /* BB 08:00-14:00 */
    const rowsOnBoard = await p.evaluate(i => window.DAYS[i].waves.map(w => w.label + ':' + w.formations.map(f => f.cs + ' ' + f.to + '-' + f.ld + ' [' + f.aircraft.map(a => (a.role || '') + '=' + (a.p || '-')).join(',') + ']').join(' ; ')).join(' || '), DI)
    const pa = await K.picEl(p, '#schedBoard .sb-line', 'p14-a-board', { pad: 10, maxH: 800 })
    const h1 = await K.hours(p, names, 'p14-1-after')
    const ld1 = K.sec(h1.r, 'Flying load')
    const fl = names.map(n => `${n}: ${ld1.find(x => x.startsWith(n + '=')) || 'not in the flying-load chart'}`)
    R('P2-14.a', `Saturday: SC AM MAIN ${names[0]}, SC SPARE ${names[1]}, AVALON night ${names[2]}, BB 08:00-14:00 ${names[3]} (seated ${t})`,
      `board rows: ${rowsOnBoard}; Work hours before ${JSON.stringify(h0.h)} -> after ${JSON.stringify(h1.h)}; flying-load chart ${fl.join(' | ')} (the chart before had ${ld0.length} entries, after ${ld1.length}); tiles ${h0.r.tiles.map(x => x.n + ' ' + x.l).join(' | ')} -> ${h1.r.tiles.map(x => x.n + ' ' + x.l).join(' | ')}`,
      'RECORDED', [pa, h0.shot, h1.shot])
    /* publish Saturday and look at the OIL defaults */
    const pub = await K.publishOrig(p, DI)
    const hd = await B.head(p, DI)
    await K.boardTo(p, DI)
    const om = await _om(p, true)
    await sleep(500)
    const sw = await allSwitches(p)
    const pk = await allPucks(p)
    const pb = await K.pic(p, 'p14-b-oil-mode')
    R('P2-14.b', 'signed the four and published Saturday, opened the board\'s OIL Earn mode',
      `publish ${JSON.stringify(pub.r)}, tag "${hd.tag}"; mode ${JSON.stringify(om)}; switches ${JSON.stringify(sw)}; pucks ${JSON.stringify(pk)}`, 'RECORDED', [pb])
    /* the Leave War cells for those four people */
    await B.toEdit(p)
    const lw = await lwCell(p, Object.values(ids), '2026-07-18')
    const cellPic = async (id, nm) => { await p.evaluate(i => { const c = document.querySelector(`[data-testid="cell-${i}-2026-07-18"]`); if (c) c.scrollIntoView({ block: 'center', inline: 'center' }) }, id); await sleep(500); return K.pic(p, 'p14-c-leavewar-' + nm) }
    const pl = await cellPic(ids.sc, 'Cobra'), pl2 = await cellPic(ids.bb, 'Comet')
    R('P2-14.c', 'Leave War: the Saturday 18 Jul cell of each of the four', JSON.stringify(lw), 'RECORDED', [pl, pl2])
    /* explicitly enable an exempt seat: BB */
    await K.boardTo(p, DI)
    await _om(p, true)
    const tap = await p.evaluate(() => { const x = [...document.querySelectorAll('#schedBoard [data-oilp]')].find(e => e.offsetParent !== null && e.dataset.oilp === 'beams'); if (!x) return 'no puck for beams'; x.scrollIntoView({ block: 'center' }); return 'found ' + x.dataset.oilitem })
    const tapped = await p.locator('#schedBoard [data-oilp="beams"]:visible').first().click().then(() => 'clicked', e => 'click failed ' + e.message.slice(0, 100))
    await sleep(700)
    const sw2 = await allSwitches(p), pk2 = await allPucks(p)
    const hd2 = await B.head(p, DI)
    const pd = await K.pic(p, 'p14-d-after-enable')
    R('P2-14.d', 'in the OIL Earn mode pressed the BB seat\'s person (the exempt seat) to switch its credit on', `${tap}; ${tapped}; switches ${JSON.stringify(sw2)}; pucks ${JSON.stringify(pk2)}; day head after: chip "${hd2.pending}", signed "${hd2.signed}"`, 'RECORDED', [pd])
  } catch (e) { R('P2-14.X', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'p14-X')]) }
  R('P2-14.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

async function p215() {
  const DI = 4   /* Friday */
  const { browser, p, errors } = await K.fresh()
  try {
    const ids = ['taipan', 'mamba', 'boosh', 'beams', 'dice']   /* VL front, VL back, sim man, ground man, programme man */
    const names = await K.cs(p, ids)
    const H0 = await K.hours(p, names, 'p15-0-base')
    const { gi, label } = await K.addFlyWave(p, DI)
    await K.ff(p, DI, gi, 0, 'cs', 'VL'); await K.ff(p, DI, gi, 0, 'msn', 'BFM'); await K.ff(p, DI, gi, 0, 'to', '12:00'); await K.ff(p, DI, gi, 0, 'ld', '13:00')
    await K.seat(p, DI, gi, 0, 0, 'p', ids[0]); await K.seat(p, DI, gi, 0, 0, 'w', ids[1])
    await K.itAdd(p, 'week', DI, gi); await K.itSet(p, 'week', DI, gi, 0, '09:00 VL IN TIME')
    const H1 = await K.hours(p, names, 'p15-1-crew')
    const d = (a, b) => names.map(c => `${c} ${a[c] || '-'}->${b[c] || '-'}`).join(', ')
    R('P2-15.a', `Friday wave VL 12:00->13:00 with the VL line 09:00, crew ${names[0]}+${names[1]}`, `Work hours ${d(H0.h, H1.h)}`, 'RECORDED', [H1.shot])
    /* a 06:00 duty for the front-seater only: + Row inside the day's duty block */
    await K.boardTo(p, DI)
    await p.locator(`#schedBoard [data-dradd="${DI}.0"]`).first().evaluate(e => e.scrollIntoView({ block: 'center' }))
    await p.locator(`#schedBoard [data-dradd="${DI}.0"]`).first().click(); await sleep(600)
    const nrows = await p.evaluate(i => [...document.querySelectorAll(`#schedBoard [data-bfld^="dr:${i}.0."][data-bfld$=".role"]`)].length, DI)
    const ri = nrows - 1
    await W.boardText(p, `dr:${DI}.0.${ri}.role`, 'EARLY'); await W.boardText(p, `dr:${DI}.0.${ri}.str`, '06:00'); await W.boardText(p, `dr:${DI}.0.${ri}.end`, '08:00')
    const tk = await K.handPut(p, `d:${DI}.0.${ri}.+`, ids[0])
    const H2 = await K.hours(p, names, 'p15-2-duty')
    await K.boardTo(p, DI)
    const pa = await K.picEl(p, `#schedBoard [data-bfld="dr:${DI}.0.${ri}.role"]`, 'p15-b-duty-row', { pad: 60, maxH: 200 })
    R('P2-15.b', `+ Row in the duty block: role EARLY 06:00-08:00, ${names[0]} placed on it (seated ${tk.took})`, `Work hours ${d(H1.h, H2.h)}`, 'RECORDED', [pa, H2.shot])
    /* a timed sim row (OFT), a ground row, a Common Programme row — each for a separate man */
    await K.boardTo(p, DI)
    await p.locator(`#schedBoard [data-sradd="${DI}.oft"]`).first().evaluate(e => e.scrollIntoView({ block: 'center' }))
    await p.locator(`#schedBoard [data-sradd="${DI}.oft"]`).first().click(); await sleep(600)
    const sn = await p.evaluate(i => window.DAYS[i].sims.oft.length, DI); const si = sn - 1
    await W.boardText(p, `sr:${DI}.oft.${si}.label`, 'EARLYSIM'); await W.boardText(p, `sr:${DI}.oft.${si}.str`, '05:00'); await W.boardText(p, `sr:${DI}.oft.${si}.end`, '06:00')
    const t2 = await K.handPut(p, `s:${DI}.oft.${si}.p`, ids[2])
    await p.locator(`#schedBoard [data-gradd="${DI}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center' }))
    await p.locator(`#schedBoard [data-gradd="${DI}"]`).first().click(); await sleep(600)
    const gn = await p.evaluate(i => window.DAYS[i].ground.length, DI); const gix = gn - 1
    await W.boardText(p, `gr:${DI}.${gix}.prog`, 'EARLYGND'); await W.boardText(p, `gr:${DI}.${gix}.str`, '05:30'); await W.boardText(p, `gr:${DI}.${gix}.end`, '06:30')
    const t3 = await K.handPut(p, `g:${DI}.${gix}.+`, ids[3])
    await p.locator(`#schedBoard [data-padd="${DI}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center' }))
    await p.locator(`#schedBoard [data-padd="${DI}"]`).first().click(); await sleep(600)
    const pn = await p.evaluate(i => [...document.querySelectorAll(`#schedBoard [data-bfld^="ap:${i}."][data-bfld$=".prog"]`)].length, DI); const pix = pn - 1
    await W.boardText(p, `ap:${DI}.${pix}.prog`, 'EARLYPROG'); await W.boardText(p, `ap:${DI}.${pix}.str`, '05:30'); await W.boardText(p, `ap:${DI}.${pix}.end`, '06:30')
    const t4 = await K.handPut(p, `a:${DI}.${pix}.+`, ids[4])
    const H3 = await K.hours(p, names, 'p15-3-sim-ground-prog')
    const dump = await p.evaluate(i => JSON.stringify({ sim: window.DAYS[i].sims.oft.slice(-1), ground: window.DAYS[i].ground.slice(-1) }).slice(0, 700), DI)
    await K.boardTo(p, DI)
    const pb = await K.picEl(p, `#schedBoard [data-bfld="gr:${DI}.${gix}.prog"]`, 'p15-c-ground-row', { pad: 60, maxH: 200 })
    R('P2-15.c', `added a sim row 05:00-06:00 (${names[2]}, seated ${t2.took}), a ground row 05:30-06:30 (${names[3]}, ${t3.took}) and a Common Programme row 05:30-06:30 (${names[4]}, ${t4.took})`, `Work hours ${d(H2.h, H3.h)}; rows ${dump}`, 'RECORDED', [pb, H3.shot])
    /* cancel each added row (CX), read the hours, then restore each */
    const rowsCx = [['dr', `${DI}.0.${ri}`, 'duty'], ['sr', `${DI}.oft.${si}`, 'sim'], ['gr', `${DI}.${gix}`, 'ground'], ['ap', `${DI}.${pix}`, 'programme']]
    const cxToggle = async (pre, addr, why) => {
      await K.boardTo(p, DI)
      const b = p.locator(`#schedBoard [data-${pre}cx="${addr}"]`).first()
      if (!(await b.count())) return 'no CX button (' + pre + ')'
      await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
      const before = await b.getAttribute('title'); await b.click(); await sleep(500)
      const pop = await p.locator('#cxPop:not([hidden])').count()
      if (pop) { if (why) { await p.locator('#cxReason').fill(why); await p.locator('#cxSave').click() } else await p.locator('#cxUn').click(); await sleep(600) }
      return `${before} -> pop ${pop ? 'asked' : 'none'}; now "${await p.locator(`#schedBoard [data-${pre}cx="${addr}"]`).first().getAttribute('title')}"`
    }
    const cxSaid = []
    for (const [pre, addr, nm] of rowsCx) cxSaid.push(nm + ': ' + await cxToggle(pre, addr, 'walk P2-15'))
    const pcx = await K.pic(p, 'p15-d-cancelled')
    const H4 = await K.hours(p, names, 'p15-4-cancelled')
    const rsSaid = []
    for (const [pre, addr, nm] of rowsCx) rsSaid.push(nm + ': ' + await cxToggle(pre, addr, null))
    const H5 = await K.hours(p, names, 'p15-5-restored')
    R('P2-15.d', 'pressed CX on each of the four added rows (with a reason), read Insights; then pressed it again on each (restore)', `cancel: ${cxSaid.join(' | ')}; Work hours ${d(H3.h, H4.h)}; restore: ${rsSaid.join(' | ')}; Work hours ${d(H4.h, H5.h)}`, 'RECORDED', [pcx, H4.shot, H5.shot])
  } catch (e) { R('P2-15.X', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'p15-X')]) }
  R('P2-15.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

if (which === 'all' || which === 'p14') await p214()
if (which === 'all' || which === 'p15') await p215()
B.savePart('s3' + which)
