/* walker B, script 5: P2-16 (long-day, rest and seven-day warnings stay distinguishable). */
import * as K from './stk-B-lib.mjs'
const { B, L, W, R, pic, picEl, sleep } = K
const which = process.argv[2] || 'all'

async function p216() {
  const { browser, p, errors } = await K.fresh()
  try {
    const front = 'taipan', back = 'mamba'
    const [cobra] = await K.cs(p, [front])
    const H0 = await K.hours(p, [cobra], 'p16-0-base')
    const plan = [[0, '20:00', '21:00'], [1, '06:30', '07:30'], [2, '19:30', '21:00'], [3, '12:00', '13:00'], [4, '12:00', '13:00'], [5, '12:00', '13:00'], [6, '12:00', '13:00']]
    const made = {}
    for (const [di, to, ld] of plan) {
      const w = await K.addFlyWave(p, di)
      await K.ff(p, di, w.gi, 0, 'cs', 'LD'); await K.ff(p, di, w.gi, 0, 'msn', 'BFM'); await K.ff(p, di, w.gi, 0, 'to', to); await K.ff(p, di, w.gi, 0, 'ld', ld)
      const a = (await K.seat(p, di, w.gi, 0, 0, 'p', front)).took, b = (await K.seat(p, di, w.gi, 0, 0, 'w', back)).took
      await K.itAdd(p, 'board', di, w.gi)
      made[di] = { gi: w.gi, seated: [a, b] }
    }
    /* the long reporting-to-release day: Wednesday's in-time at 06:00 */
    await K.itSet(p, 'board', 2, made[2].gi, 0, '06:00 IN TIME', {})
    const lines = {}; for (const [di] of plan) lines[di] = (await K.itLines(p, di, made[di].gi))[0]
    const allW = async () => { const o = {}; for (let di = 0; di < 7; di++) o[di] = (await K.warnsFull(p, di)).filter(w => /Cobra/.test(w.msg) || /RUN|LONGDAY|CREW_REST|CREW_TIGHT|DAYS_RUN/.test(w.code)).map(w => `${w.sev}/${w.code}${w.off ? '/HIDDEN' : ''}: ${w.msg.slice(0, 120)}`); return o }
    const W1 = await allW()
    const H1 = await K.hours(p, [cobra], 'p16-1-seven-days')
    const flat = o => Object.entries(o).flatMap(([di, ws]) => ws.filter(x => new RegExp(cobra).test(x)).map(x => `day${di} ${x}`))
    /* look at each day's list and select each Cobra warning */
    const picks = []
    for (let di = 0; di < 7; di++) {
      await B.toEdit(p); await B.openList(p, '#eWeek', di)
      const l = await B.readList(p, '#eWeek', di)
      for (const ln of (l.lines || []).filter(x => new RegExp(cobra).test(x.text))) {
        const sel = `#eWeek .day[data-day="${di}"] .witem[data-wix="${ln.ix}"]`
        const loc = p.locator(sel).first()
        await loc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(150)
        const box = await loc.boundingBox()
        await p.mouse.click(box.x + 30, box.y + box.height / 2); await sleep(600)
        const pk = await B.dayPucks(p, '#eWeek', di, front)
        const lit = await p.evaluate(() => [...document.querySelectorAll('.puck.warn')].filter(e => e.offsetParent !== null).length)
        picks.push({ di, text: ln.text.slice(0, 70), sev: ln.sev, pucks: B.pk(pk), lit })
      }
    }
    const pcl = await K.pic(p, 'p16-a-selected')
    R('P2-16.a', `Cobra on a new wave every day Mon-Sun (Mon 20:00-21:00, Tue 06:30-07:30, Wed 19:30-21:00 with in-time 06:00, Thu-Sun 12:00-13:00, default in-times); every Cobra warning tapped on its day's list`,
      `lines ${JSON.stringify(lines)}; warnings (Cobra and run/long/rest kinds) ${JSON.stringify(W1)}; Cobra work hours (week) ${H0.h[cobra]} -> ${H1.h[cobra]}; tapped: ${JSON.stringify(picks)}`, 'RECORDED', [pcl, H1.shot])
    /* shorten the long day (keep the worked date) */
    const liveS = await K.itSet(p, 'board', 2, made[2].gi, 0, '13:00 IN TIME')
    const W2 = await allW()
    const H2 = await K.hours(p, [cobra], 'p16-2-shortened')
    const had = x => Object.values(x).flat().filter(m => new RegExp(cobra).test(m))
    const kinds = x => Object.values(x).flat().map(m => m.split(':')[0].split('/')[1])
    const countOf = (x, code) => Object.values(x).flat().filter(m => m.includes('/' + code)).length
    const pa2 = await K.pic(p, 'p16-b-after-shorten')
    R('P2-16.b', 'Wednesday in-time retyped 13:00 (the long day shortened, Wednesday still worked)',
      `warnings now ${JSON.stringify(W2)}; counts before/after: LONGDAY ${countOf(W1, 'LONGDAY')} -> ${countOf(W2, 'LONGDAY')}, CREW_REST ${countOf(W1, 'CREW_REST')} -> ${countOf(W2, 'CREW_REST')}, RUN-kind ${Object.values(W1).flat().filter(m => /RUN/.test(m)).length} -> ${Object.values(W2).flat().filter(m => /RUN/.test(m)).length}; Cobra work hours ${H1.h[cobra]} -> ${H2.h[cobra]}`,
      countOf(W2, 'LONGDAY') < countOf(W1, 'LONGDAY') && Object.values(W2).flat().filter(m => /RUN/.test(m)).length === Object.values(W1).flat().filter(m => /RUN/.test(m)).length && countOf(W1, 'LONGDAY') > 0 ? 'PASS' : 'FAIL', [pa2, H2.shot])
  } catch (e) { R('P2-16.X', 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await pic(p, 'p16-X')]) }
  R('P2-16.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

if (which === 'all' || which === 'p16') await p216()
B.savePart('s5' + which)
