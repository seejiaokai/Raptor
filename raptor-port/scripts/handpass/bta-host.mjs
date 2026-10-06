/* [BLANK-TIMES-ABSENCE] (D605) with [SC-PICKER-INTIME-REST] — the HOST's own walk, run on the build BEFORE the fixes
   and on the build AFTER them. Every step asserts the RIGHT behaviour (a PASS means the warning is where it should
   be), so the same script is the fault's evidence on the old build and the re-walk on the fixed one (bug-check order
   §5). Everything goes through the app's own controls: the Inputs page's form, + Wave, + Item, the text boxes, a seat
   and the crew list, Publish (§7.7).
   Env: HP_URL (the served build), HP_SHOTS (pictures), HP_OUT (the JSON part file), HP_PHONE=1.
   Usage: node scripts/handpass/bta-host.mjs [h1|h2|h3|h4|h5|all] */
import './bta-env.mjs'
import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, CSN, SEAT, MON, TUE, R, pic, picEl, sleep } = C
const which = process.argv[2] || 'all'
const ABS = ['LEAVE_FLY', 'DNIF_FLY', 'INPUT_FLY', 'SHIFT_SOFT']

/* what a person can see about him on Tuesday's week card: the list's lines naming him, and his pucks as painted */
async function see(p, tag, di = TUE) {
  const s = await C.seeWeek(p, di, tag, { prev: -1 })
  const held = s.held.filter(w => ABS.includes(w.code))
  const lines = (s.list.full || []).filter(x => x.text.includes(CSN) && /leave|Downchit|but tasked|but on|clashes|standing SC SPARE|down for/i.test(x.text)).map(x => x.text.replace(/ ✕| ↺/g, ''))
  return { held, lines, pk: s.pk, bar: s.list.bar, pics: s.pics, ring: s.pk.some(x => x.solid), nan: lines.some(t => /NaN|undefined/.test(t)) }
}
const says = s => `held: ${s.held.map(w => `${w.sev}/${w.code}`).join(', ') || 'none'} · the day's list "${s.bar}" ${JSON.stringify(s.lines.map(t => t.slice(0, 130)))} · his pucks [${C.pk2(s.pk)}]`
const flagged = (s, re) => s.held.length >= 1 && s.lines.some(t => re.test(t)) && s.ring && !s.nan
const silent = s => s.held.length === 0 && s.lines.length === 0
const key = (di, gi, fi, ai, seat = SEAT) => `${di}.${gi}.${fi}.${ai}.${seat}`

/* arm a seat, read his name in the crew list, press it */
async function put(p, k) {
  await K.boardTo(p, Number(k.split('.')[0]))
  const armed = await C.armSeat(p, k)
  const r = await C.rosterX(p)
  const row = await C.crewListRow(p)
  const shot = await pic(p, 'crewlist-' + k.replace(/\./g, '_'))
  const toast = await C.pressName(p)
  const took = await p.evaluate(([kk, who]) => { const a = kk.split('.'); const ac = window.DAYS[+a[0]].waves[+a[1]].formations[+a[2]].aircraft[+a[3]]; return ac[a[4]] === who }, [k, ID])
  return { armed, r, row, toast, took, shot, say: `armed ${armed}; in the crew list: ${C.sayRoster(r)}${row ? ' · row "' + row.slice(0, 120) + '"' : ''}; pressed his name → took ${took}, the app said ${toast ? '"' + toast.slice(0, 160) + '"' : 'nothing'}` }
}

/* H1 — the filed fault: all-day local leave, "+ Wave", seat him on its blank line; then a callsign, times, cleared, reload */
async function h1() {
  const { browser, p, errors } = await K.fresh()
  try {
    const f = await C.fileInput(p, { type: 'LL', di: TUE, allday: true, remarks: 'Wedding' })
    const m = await K.addFlyWave(p, TUE)
    const k = key(TUE, m.gi, 0, 0)
    const u = await put(p, k)
    const s1 = await see(p, 'h1-1-blank')
    R('H1.1', `${CSN}: local leave (LL) all Tuesday filed on the Inputs page (${await C.inputRowText(p, f.iid).catch(() => '')}); "+ Wave" → a flying wave (its line: ${await C.lineNow(p, TUE, m.gi, 0)}); ${u.say}`,
      says(s1), u.r.struck && flagged(s1, /On leave but planned to fly this line/) ? 'PASS' : 'FAIL', [u.shot, ...s1.pics])

    await K.ff(p, TUE, m.gi, 0, 'cs', 'ZL'); await K.ff(p, TUE, m.gi, 0, 'msn', 'BFM')
    const s2 = await see(p, 'h1-2-named')
    R('H1.2', 'callsign ZL and mission BFM typed on that line, still no times', says(s2), flagged(s2, /On leave but planned to fly ZL BFM — reason: Wedding/) && s2.lines.length === 1 ? 'PASS' : 'FAIL', s2.pics)

    await K.ff(p, TUE, m.gi, 0, 'to', '10:00'); await K.ff(p, TUE, m.gi, 0, 'ld', '11:00')
    const s3 = await see(p, 'h1-3-timed')
    R('H1.3', 'take-off 10:00 and landing 11:00 typed', says(s3), flagged(s3, /On leave but planned to fly ZL BFM — reason: Wedding/) && s3.lines.length === 1 ? 'PASS' : 'FAIL', s3.pics)

    await K.ff(p, TUE, m.gi, 0, 'to', ''); await K.ff(p, TUE, m.gi, 0, 'ld', '')
    const s4 = await see(p, 'h1-4-cleared')
    R('H1.4', `both times cleared again (${await C.lineNow(p, TUE, m.gi, 0)})`, says(s4), flagged(s4, /On leave but planned to fly ZL BFM/) && s4.lines.length === 1 ? 'PASS' : 'FAIL', s4.pics)

    await K.ff(p, TUE, m.gi, 0, 'ld', '15:00')
    const s5 = await see(p, 'h1-5-landing-only')
    R('H1.5', 'a landing 15:00 typed alone, no take-off', says(s5), flagged(s5, /On leave but planned to fly ZL BFM/) && s5.lines.length === 1 ? 'PASS' : 'FAIL', s5.pics)

    await B.reloadAs(p, 'a'); await B.toEdit(p)
    const s6 = await see(p, 'h1-6-reload')
    R('H1.6', 'the page reloaded and signed in again', says(s6), flagged(s6, /On leave but planned to fly ZL BFM/) && s6.lines.length === 1 ? 'PASS' : 'FAIL', s6.pics)
  } catch (e) { R('H1', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'h1-X')]) }
  R('H1.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

/* H2 — the half left as it was: a MORNING-only leave against a blank line is silent in the list (the crew list still
   strikes him); typing a morning take-off raises it; an afternoon one does not */
async function h2() {
  const { browser, p, errors } = await K.fresh()
  try {
    const f = await C.fileInput(p, { type: 'LL', di: TUE, allday: false, span: 'am', remarks: 'Morning off' })
    const stored = await p.evaluate(i => { const x = window.INPUTS.find(r => r.iid === i); return x ? `allday ${!!x.allday} half "${x.half || ''}" ${x.s}–${x.e}` : 'not found' }, f.iid)
    const m = await K.addFlyWave(p, TUE)
    const u = await put(p, key(TUE, m.gi, 0, 0))
    const s1 = await see(p, 'h2-1-am-blank')
    R('H2.1', `${CSN}: local leave for Tuesday MORNING only (stored: ${stored}); "+ Wave", seated on its blank line; ${u.say}`, says(s1), silent(s1) ? 'PASS' : 'FAIL', [u.shot, ...s1.pics])
    await K.ff(p, TUE, m.gi, 0, 'cs', 'ZA'); await K.ff(p, TUE, m.gi, 0, 'to', '15:00'); await K.ff(p, TUE, m.gi, 0, 'ld', '16:30')
    const s2 = await see(p, 'h2-2-afternoon')
    R('H2.2', 'an afternoon flight typed on it (15:00–16:30)', says(s2), silent(s2) ? 'PASS' : 'FAIL', s2.pics)
    await K.ff(p, TUE, m.gi, 0, 'to', '08:00'); await K.ff(p, TUE, m.gi, 0, 'ld', '09:30')
    const s3 = await see(p, 'h2-3-morning')
    R('H2.3', 'retyped as a morning flight (08:00–09:30)', says(s3), flagged(s3, /On leave but planned to fly ZA/) ? 'PASS' : 'FAIL', s3.pics)
  } catch (e) { R('H2', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'h2-X')]) }
  R('H2.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

/* H3 — a downchit (ATT C, all day) on the seats that are NOT a flying line: a BB seat (BB comes up with no shift
   times) and a new Ground Programme row with no times */
async function h3() {
  const { browser, p, errors } = await K.fresh()
  try {
    const f = await C.fileInput(p, { type: 'ATT C', di: TUE, allday: true, remarks: 'Flu' })
    const bb = await K.addStandby(p, TUE, 'bb')
    const bbTimes = await p.evaluate(([i, g]) => { const x = window.DAYS[i].waves[g].formations[0]; return `start "${x.to}" end "${x.ld}"` }, [TUE, bb.gi])
    const u = await put(p, key(TUE, bb.gi, 0, 0))
    const s1 = await see(p, 'h3-1-bb')
    R('H3.1', `${CSN}: ATT C all Tuesday (asked: ${f.asked.join(',') || 'nothing'}); "+ Wave" → BB (its shift: ${bbTimes}); ${u.say}`, says(s1), flagged(s1, /ATT C but on BB SHIFT — medically down/) ? 'PASS' : 'FAIL', [u.shot, ...s1.pics])

    await K.boardTo(p, TUE)
    const n0 = await p.evaluate(i => window.DAYS[i].ground.length, TUE)
    const b = p.locator(`#schedBoard [data-gradd="${TUE}"]:visible`).first()
    await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(500)
    const g = await K.handPut(p, `g:${TUE}.${n0}.+`, ID)
    const row = await p.evaluate(([i, r]) => { const x = window.DAYS[i].ground[r]; return x ? `name "${x.prog || ''}" start "${x.str || ''}" end "${x.end || ''}" who "${x.who || ''}" more ${JSON.stringify(x.more || [])}` : 'no row' }, [TUE, n0])
    const s2 = await see(p, 'h3-2-ground')
    R('H3.2', `"+ Item" on the Ground Programme (the new row: ${row}); ${CSN} put on it (took ${g.took}${g.msg ? ', the app said "' + String(g.msg).slice(0, 120) + '"' : ''})`, says(s2),
      s2.lines.some(t => /Downchit but tasked — this ground row/.test(t)) && !s2.nan ? 'PASS' : 'FAIL', s2.pics)
    await K.boardTo(p, TUE)
    await W.boardText(p, `gr:${TUE}.${n0}.prog`, 'RANGE SWEEP')
    const s3 = await see(p, 'h3-3-ground-named')
    R('H3.3', 'the row named RANGE SWEEP, still no times', says(s3), s3.lines.some(t => /Downchit but tasked — RANGE SWEEP/.test(t)) ? 'PASS' : 'FAIL', s3.pics)
  } catch (e) { R('H3', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'h3-X')]) }
  R('H3.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

/* H4 — a published day (D177–D179): seated on a blank line, Tuesday published; the leave is filed AFTERWARDS. The
   working copy flags him and reads pending; the published face keeps what it went out with; the amendment takes it out */
async function h4() {
  const { browser, p, errors } = await K.fresh()
  try {
    const m = await K.addFlyWave(p, TUE)
    await K.ff(p, TUE, m.gi, 0, 'cs', 'ZP')
    const u = await put(p, key(TUE, m.gi, 0, 0))
    const pub = await K.publishOrig(p, TUE)
    const s0 = await see(p, 'h4-0-published')
    const pend0 = await p.evaluate(i => window.dayShownPendCount ? window.dayShownPendCount(i) : null, TUE)
    R('H4.0', `${CSN} seated on a new line ZP with no times (took ${u.took}); Tuesday published (${JSON.stringify(pub).slice(0, 120)})`, says(s0) + ` · pending ${pend0}`, silent(s0) ? 'PASS' : 'FAIL', s0.pics)

    await C.fileInput(p, { type: 'LL', di: TUE, allday: true, remarks: 'After publish' })
    const s1 = await see(p, 'h4-1-working')
    const head = await p.evaluate(i => { const d = document.querySelector(`#eWeek .day[data-day="${i}"] .dhead, #eWeek .day[data-day="${i}"] .day-head`); return d ? d.innerText.replace(/\s+/g, ' ').trim().slice(0, 200) : '' }, TUE)
    R('H4.1', 'local leave all Tuesday filed for him AFTER publishing (the Inputs page)', says(s1) + ` · the day's heading "${head}"`, flagged(s1, /On leave but planned to fly ZP/) && /pending/i.test(head) ? 'PASS' : 'FAIL', s1.pics)

    await L.go(p, 'viewsched'); await sleep(600)
    const face = await p.evaluate(([i, cs]) => {
      const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); if (!d) return { found: false }
      const box = d.querySelector(`[data-dwbox="${i}"]`)
      const lines = box ? [...box.querySelectorAll('.witem')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(t => t.includes(cs)) : []
      const pk = [...d.querySelectorAll('.puck')].filter(e => e.offsetParent !== null && (e.innerText || '').includes(cs)).map(e => e.className)
      return { found: true, lines, pk, head: (d.querySelector('.dhead, .day-head') || d).innerText.replace(/\s+/g, ' ').trim().slice(0, 160) }
    }, [TUE, CSN])
    const fp = await picEl(p, `#vWeek .day[data-day="${TUE}"]`, 'h4-2-face', { maxH: 900 })
    R('H4.2', 'View-only Sched — the published face of Tuesday', `lines naming him: ${JSON.stringify(face.lines)} · his pucks' classes ${JSON.stringify(face.pk)} · "${face.head}"`,
      face.found && !face.lines.some(t => /On leave/.test(t)) && !face.pk.some(c => /warn/.test(c)) ? 'PASS' : 'FAIL', [fp])
    await B.toEdit(p)
  } catch (e) { R('H4', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'h4-X')]) }
  R('H4.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

/* H5 — [SC-PICKER-INTIME-REST]: he lands 22:30 Monday (clear 12:30 Tuesday). Tuesday: an SC wave, another man (Cobra) in a MAIN
   seat, the shift typed 13:00–19:00 with B (its in-time) 05:00. Arm the other MAIN seat: the crew list must say
   "crew rest — not clear until 12:30" BEFORE he is placed; a SPARE seat must say nothing about crew rest */
async function h5() {
  const { browser, p, errors } = await K.fresh()
  try {
    const m = await K.addFlyWave(p, MON)
    await K.ff(p, MON, m.gi, 0, 'cs', 'ZM'); await K.ff(p, MON, m.gi, 0, 'msn', 'BFM'); await K.ff(p, MON, m.gi, 0, 'to', '21:00'); await K.ff(p, MON, m.gi, 0, 'ld', '22:30')
    const sm = await K.seat(p, MON, m.gi, 0, 0, SEAT, ID)
    const sc = await K.addStandby(p, TUE, 'sc')
    await K.ff(p, TUE, sc.gi, 0, 'to', '13:00'); await K.ff(p, TUE, sc.gi, 0, 'ld', '19:00'); await K.ff(p, TUE, sc.gi, 0, 'br', '05:00')
    const sib = await K.seat(p, TUE, sc.gi, 0, 0, 'p', 'taipan')
    const shift = await p.evaluate(([i, g]) => { const x = window.DAYS[i].waves[g].formations[0]; return `B "${x.br || ''}" start "${x.to}" end "${x.ld}" · rows ${x.aircraft.map(a => (a.spare ? 'SPARE' : 'MAIN') + ':' + (a.p || '-') + '/' + (a.w || '-')).join(' ')}` }, [TUE, sc.gi])

    /* the SPARE seat first — the negative control */
    await K.boardTo(p, TUE)
    await C.armSeat(p, key(TUE, sc.gi, 0, 2))
    const rs = await C.rosterX(p); const rowS = await C.crewListRow(p)
    const p1 = await pic(p, 'h5-1-spare-armed')
    await p.keyboard.press('Escape'); await sleep(200)
    R('H5.1', `${CSN} lands 22:30 Monday (seated ${sm.took}). Tuesday "+ Wave" → SC, first shift ${shift} (Cobra seated ${sib.took}). A SPARE seat armed`,
      `his name in the crew list: ${C.sayRoster(rs)} · row "${(rowS || '').slice(0, 140)}"`, !/crew rest/i.test(rs.own + ' ' + rs.title + ' ' + (rowS || '')) ? 'PASS' : 'FAIL', [p1])

    /* the other MAIN seat */
    await C.armSeat(p, key(TUE, sc.gi, 0, 1))
    const rm = await C.rosterX(p); const rowM = await C.crewListRow(p)
    const p2 = await pic(p, 'h5-2-main-armed')
    const said = rm.own + ' ' + rm.title + ' ' + (rowM || '')
    R('H5.2', 'the other MAIN seat of that shift armed', `his name in the crew list: ${C.sayRoster(rm)} · row "${(rowM || '').slice(0, 160)}"`, /crew rest — not clear until 12:30/.test(said) ? 'PASS' : 'FAIL', [p2])
    const toast = await C.pressName(p)
    const held = (await C.fullWarnsX(p, TUE)).filter(w => w.code === 'CREW_REST')
    R('H5.3', 'his name pressed — placed on that MAIN seat', `the app said ${toast ? '"' + toast.slice(0, 200) + '"' : 'nothing'} · Tuesday's crew-rest warnings naming him: ${JSON.stringify(held.map(w => w.msg.slice(0, 170)))}`,
      held.length === 1 && /clear at 12:30/.test(held[0].msg) ? 'PASS' : 'FAIL', [await pic(p, 'h5-3-placed')])
  } catch (e) { R('H5', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'h5-X')]) }
  R('H5.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

if (which === 'h1' || which === 'all') await h1()
if (which === 'h2' || which === 'all') await h2()
if (which === 'h3' || which === 'all') await h3()
if (which === 'h4' || which === 'all') await h4()
if (which === 'h5' || which === 'all') await h5()
B.savePart('bta-host')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}  ${r.did}\n      → ${r.saw}`)
