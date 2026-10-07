/* WALKER C, script 1: S08, S09, H-04, S10, S11. Usage: node scripts/handpass/bta-C-1.mjs [s08|s09|s10|s11|all] (HP_PHONE=1 for the phone) */
import * as X from './bta-C-lib.mjs'
const { B, K, R, ID, CSN, MON, TUE, WED, pic, sleep } = X
const which = process.argv[2] || 'all'
const PH = !!process.env.HP_PHONE
const T = PH ? 'phone ' : 'desktop '
const placed = async (p, k) => (await X.holds(p, k)) === ID
const breachLine = ws => ws.map(w => w.msg).join(' || ')

/* S08 — the armed list, then the crew-list drag with its bubble */
async function s08() {
  const { browser, p, errors } = await K.fresh()
  try {
    const mon = await X.mondayLate(p)
    const sc = await X.scTuesday(p)
    const shift = await X.shiftNow(p, TUE, sc.gi)
    const k = X.key(TUE, sc.gi, 0, 1)
    const a = await X.readArmed(p, k, 's08-armed-main')
    const said = X.reasonOf(a)
    R('S08.1', `${T}${CSN} lands 22:30 Monday (seated ${mon.took}); Tuesday SC wave ${sc.label}: ${shift}, Cobra seated ${sc.sib}; the OTHER MAIN seat (${k}) tapped → armed ${a.armed}`,
      `crew list, before any drop: ${a.said}`, /crew rest — not clear until 12:30/.test(said) && a.r.struck ? 'PASS' : 'FAIL', [a.shot])
    const toast = await X.pressName(p)
    const held = await X.restWarns(p, TUE)
    const pl = await placed(p, k)
    const lst = await X.seeWeek(p, TUE, 's08-placed', { prev: MON })
    R('S08.2', `${T}his name pressed in the crew list → placed ${pl}`,
      `toast ${toast ? '"' + toast.slice(0, 200) + '"' : 'nothing'} · crew-rest warnings naming him on Tuesday: ${X.shortWarns(held)} · day's list lines: ${JSON.stringify(X.breachLines(lst.list).map(t => t.slice(0, 200)))} · pucks [${X.pk2(lst.pk)}]`,
      pl && held.length >= 1 && held.some(w => /12:30/.test(w.msg)) ? 'PASS' : 'FAIL', lst.pics)
    /* H-04 */
    R('H-04', `${T}after X is placed on the SC MAIN seat: the crew-rest line's words (which time is the "start")`,
      `the shift: ${shift}; the warning: ${X.shortWarns(held)}`, 'RECORDED', [])
  } catch (e) { R('S08', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's08-X')]) }
  R('S08.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

/* S08 drag variant: a crew-list drag in its own world */
async function s08drag() {
  const { browser, p, errors } = await K.fresh()
  try {
    await X.mondayLate(p)
    const sc = await X.scTuesday(p)
    const k = X.key(TUE, sc.gi, 0, 1)
    const d = await X.dragFromList(p, k, 's08-drag-bubble')
    const pl = await placed(p, k)
    const held = await X.restWarns(p, TUE)
    R('S08.3', `desktop: his name dragged from the crew list towards the other MAIN seat (${k}) and held there; bubble read, then dropped`,
      `bubble under the dragged name: ${d.bubble ? JSON.stringify(d.bubble) : d.err} · after the drop: placed ${pl}, toast ${d.toast ? '"' + d.toast.slice(0, 200) + '"' : 'nothing'}, crew-rest warnings naming him: ${X.shortWarns(held)}`,
      d.bubble && /crew rest — not clear until 12:30/.test(d.bubble.why || '') && pl && held.some(w => /12:30/.test(w.msg)) ? 'PASS' : 'FAIL', [d.shot, await pic(p, 's08-drag-after')])
  } catch (e) { R('S08.3', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's08d-X')]) }
  R('S08d.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

/* S09 — shift start and end blank, B 05:00 kept */
async function s09() {
  const { browser, p, errors } = await K.fresh()
  try {
    const mon = await X.mondayLate(p)
    const sc = await X.scTuesday(p)
    await K.ff(p, TUE, sc.gi, 0, 'to', ''); await K.ff(p, TUE, sc.gi, 0, 'ld', '')
    const shift = await X.shiftNow(p, TUE, sc.gi)
    const k = X.key(TUE, sc.gi, 0, 1)
    const a = await X.readArmed(p, k, 's09-armed-blank')
    const said = X.reasonOf(a)
    R('S09.1', `${T}as S08 but the shift start and end cleared (${shift}); the other MAIN seat armed`, `crew list before the drop: ${a.said}`,
      /crew rest — not clear until 12:30/.test(said) && a.r.struck && !/NaN|undefined/.test(said) ? 'PASS' : 'FAIL', [a.shot])
    if (PH) { await X.pressName(p); } else {
      /* a drag in the same world would double-place; press the name */
      const toast = await X.pressName(p)
      const held = await X.restWarns(p, TUE)
      const lst = await X.seeWeek(p, TUE, 's09-placed', { prev: MON })
      R('S09.2', `${T}his name pressed → placed ${await placed(p, k)}`, `toast ${toast ? '"' + toast.slice(0, 200) + '"' : 'nothing'} · crew-rest warnings naming him: ${X.shortWarns(held)} · list: ${JSON.stringify(X.breachLines(lst.list).map(t => t.slice(0, 200)))}`,
        held.some(w => /12:30/.test(w.msg)) ? 'PASS' : 'FAIL', lst.pics)
    }
    if (PH) {
      const held = await X.restWarns(p, TUE)
      R('S09.2', `${T}his name pressed → placed ${await placed(p, k)}`, `crew-rest warnings naming him: ${X.shortWarns(held)}`, held.some(w => /12:30/.test(w.msg)) ? 'PASS' : 'FAIL', [await pic(p, 's09-placed-ph')])
    }
  } catch (e) { R('S09', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's09-X')]) }
  R('S09.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

/* S09 drag variant: crew-list drag with a blank shift */
async function s09drag() {
  const { browser, p, errors } = await K.fresh()
  try {
    await X.mondayLate(p)
    const sc = await X.scTuesday(p)
    await K.ff(p, TUE, sc.gi, 0, 'to', ''); await K.ff(p, TUE, sc.gi, 0, 'ld', '')
    const k = X.key(TUE, sc.gi, 0, 1)
    const d = await X.dragFromList(p, k, 's09-drag-bubble')
    const held = await X.restWarns(p, TUE)
    R('S09.3', `desktop: shift start/end blank, B 05:00; his name dragged from the crew list to the other MAIN seat`,
      `bubble: ${d.bubble ? JSON.stringify(d.bubble) : d.err} · after the drop: placed ${await placed(p, k)}, crew-rest warnings: ${X.shortWarns(held)}`,
      d.bubble && /crew rest — not clear until 12:30/.test(d.bubble.why || '') && held.some(w => /12:30/.test(w.msg)) ? 'PASS' : 'FAIL', [d.shot, await pic(p, 's09-drag-after')])
  } catch (e) { R('S09.3', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's09d-X')]) }
  R('S09d.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

/* S10 — SC SPARE, AVALON, BB: nothing about crew rest */
async function s10() {
  const { browser, p, errors } = await K.fresh()
  try {
    const mon = await X.mondayLate(p)
    const sc = await X.scTuesday(p)
    const ks = X.key(TUE, sc.gi, 0, 2)
    const a = await X.readArmed(p, ks, 's10-spare-armed')
    R('S10.1', `${T}SC SPARE seat (${ks}) armed (B 05:00, shift 13:00–19:00, Cobra in MAIN, he lands 22:30 Monday)`, `crew list: ${a.said}`, !/crew rest/i.test(X.reasonOf(a)) ? 'PASS' : 'FAIL', [a.shot])
    const toast = await X.pressName(p)
    const held = await X.restWarns(p, TUE)
    R('S10.2', `${T}placed on the SC SPARE seat (took ${await placed(p, ks)})`, `toast ${toast ? '"' + toast.slice(0, 200) + '"' : 'nothing'} · crew-rest warnings naming him: ${X.shortWarns(held)}`, held.length === 0 ? 'PASS' : 'FAIL', [await pic(p, 's10-spare-placed')])
    for (const kind of ['avalon', 'bb']) {
      const w = await K.addStandby(p, TUE, kind)
      const times = await p.evaluate(([i, g]) => { const x = window.DAYS[i].waves[g].formations[0]; return `B "${x.br || ''}" start "${x.to}" end "${x.ld}"` }, [TUE, w.gi])
      let typed = 'no B typed'
      try { await K.ff(p, TUE, w.gi, 0, 'br', '05:00'); typed = 'B 05:00 typed' } catch (e) { typed = 'could not type B: ' + String(e.message).slice(0, 80) }
      const kk = X.key(TUE, w.gi, 0, 0)
      const a2 = await X.readArmed(p, kk, `s10-${kind}-armed`)
      R(`S10.${kind}.1`, `${T}a ${kind.toUpperCase()} wave ${w.label} (${times}; ${typed}); its first seat (${kk}) armed`, `crew list: ${a2.said}`, !/crew rest/i.test(X.reasonOf(a2)) ? 'PASS' : 'FAIL', [a2.shot])
      await X.pressName(p)
      const held2 = await X.restWarns(p, TUE)
      const lines = (await X.listFull(p, '#eWeek', TUE).catch(() => [])).filter(x => x.text.includes(CSN) && /rest/i.test(x.text)).map(x => x.text.slice(0, 160))
      R(`S10.${kind}.2`, `${T}placed on the ${kind.toUpperCase()} seat (took ${await placed(p, kk)})`, `crew-rest warnings naming him: ${X.shortWarns(held2)}`, held2.length === 0 ? 'PASS' : 'FAIL', [await pic(p, `s10-${kind}-placed`)])
    }
  } catch (e) { R('S10', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's10-X')]) }
  R('S10.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

/* S11 — forward: Tuesday SC ends 23:30; Wednesday he has an early flying report */
async function s11() {
  const { browser, p, errors } = await K.fresh()
  try {
    const wm = await K.addFlyWave(p, WED)
    await K.ff(p, WED, wm.gi, 0, 'cs', 'ZW'); await K.ff(p, WED, wm.gi, 0, 'msn', 'BFM'); await K.ff(p, WED, wm.gi, 0, 'br', '06:00'); await K.ff(p, WED, wm.gi, 0, 'to', '08:00'); await K.ff(p, WED, wm.gi, 0, 'ld', '09:30')
    const sw = await K.seat(p, WED, wm.gi, 0, 0, X.SEAT, ID)
    const sc = await X.scTuesday(p, { to: '13:00', ld: '23:30', br: '05:00' })
    const shift = await X.shiftNow(p, TUE, sc.gi)
    const k = X.key(TUE, sc.gi, 0, 1)
    const a = await X.readArmed(p, k, 's11-armed')
    const said = X.reasonOf(a)
    R('S11.1', `${T}Wednesday flight ZW (report 06:00, take-off 08:00, landing 09:30) with him seated (${sw.took}); Tuesday SC ${shift}, Cobra seated ${sc.sib}; the other MAIN seat armed`,
      `crew list before the drop: ${a.said}`, /crew rest — breaks/i.test(said) && /Wed/i.test(said) ? 'PASS' : 'FAIL', [a.shot])
    const toast = await X.pressName(p)
    const held = await X.restWarns(p, TUE); const heldW = await X.restWarns(p, WED)
    R('S11.2', `${T}his name pressed → placed ${await placed(p, k)}`, `toast ${toast ? '"' + toast.slice(0, 200) + '"' : 'nothing'} · Tuesday crew-rest warnings: ${X.shortWarns(held)} · Wednesday: ${X.shortWarns(heldW)}`,
      held.length + heldW.length >= 1 ? 'PASS' : 'FAIL', [await pic(p, 's11-placed')])
    /* a crew-list drag for the same, in the same world: remove first through Undo */
  } catch (e) { R('S11', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's11-X')]) }
  R('S11.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

if (which === 's08' || which === 'all') await s08()
if ((which === 's08d' || which === 'all') && !PH) await s08drag()
if (which === 's09' || which === 'all') await s09()
if ((which === 's09d' || which === 'all') && !PH) await s09drag()
if (which === 's10' || which === 'all') await s10()
if (which === 's11' || which === 'all') await s11()
B.savePart('bta-C-1-' + which)
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}  ${r.did}\n      → ${r.saw}`)
