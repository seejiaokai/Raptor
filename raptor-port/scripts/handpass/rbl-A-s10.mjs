/* S10 — a blank flight plus an earlier meeting: Monday as B; Tuesday only a blank flight for X plus a Ground Programme meeting 05:00-06:00;
   repeat with a typed Meeting input (Inputs page). Removing the flight makes it a meeting-only day. Walker A. */
import * as K from './rbl-A-lib.mjs'
const { B, W, L, R, X, MON, TUE, chk, whole, txt, clean } = K
const SZ = K.PHONE ? 'phone' : 'desk'
const which = process.argv[2] || 'all'

async function partA() {
  const id = `S10A-${SZ}`
  const { browser, p, errors } = await K.fresh()
  try {
    const cs = await B.csOf(p, X)
    await K.wave(p, MON, 'ZM', 'BFM', '20:00', '22:30', X)
    const b = await K.addFlyWave(p, TUE)
    const sb = await K.seat(p, TUE, b.gi, 0, 0, 'w', X)
    const g = await K.groundRow(p, TUE, 'MEETING', '05:00', '06:00', X)
    console.log('ground row:', await K.groundOf(p, TUE, g.ri))
    const okM = s => { const t = K.restText(s) || ''; return whole(s) && /05:00/.test(t) && /MEETING/.test(t) && /no take-off yet/.test(t) && /4h30/.test(t) && !/report/i.test(t) && clean(s) }
    await chk(p, `${id}.1`, `Monday ZM 20:00-22:30 with ${cs}; Tuesday: a blank flight with ${cs} (took ${sb.took}) plus Ground Programme row ${await K.groundOf(p, TUE, g.ri)} (${cs} placed: ${g.took})`, okM, { monPic: true })
    await K.reload(p)
    await chk(p, `${id}.1r`, 'reload', okM, { monPic: true })
    await K.takeOff(p, TUE, b.gi, 0)
    await chk(p, `${id}.2`, `${cs} taken off the blank flight (seat now "${await K.seatOf(p, TUE, b.gi, 0)}"): a meeting-only day`, s => !s.breach && !s.ringTue && clean(s), { monPic: true })
    const u = await K.undo(p); await chk(p, `${id}.2u`, `Undo (pressed ${u.pressed}; seat "${await K.seatOf(p, TUE, b.gi, 0)}")`, okM)
    const r = await K.redo(p); await chk(p, `${id}.2r`, `Redo (pressed ${r.pressed}; seat "${await K.seatOf(p, TUE, b.gi, 0)}")`, s => !s.breach && clean(s))
    /* put him back on the flight, then take the MEETING away instead (its own ✕) */
    const sb2 = await K.seat(p, TUE, b.gi, 0, 0, 'w', X)
    await chk(p, `${id}.3`, `${cs} put back on the blank flight (took ${sb2.took})`, okM)
    await K.groundDel(p, TUE, g.ri)
    await chk(p, `${id}.4`, `the meeting row removed with its own ✕: only the blank flight is left`, s => !s.breach && clean(s), { monPic: true })
  } catch (e) { R(`${id}.script`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, `${id}-X`)]) }
  R(`${id}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

async function partB() {
  const id = `S10B-${SZ}`
  const { browser, p, errors } = await K.fresh()
  try {
    const cs = await B.csOf(p, X)
    await K.wave(p, MON, 'ZM', 'BFM', '20:00', '22:30', X)
    const b = await K.addFlyWave(p, TUE)
    const sb = await K.seat(p, TUE, b.gi, 0, 0, 'w', X)
    /* the Inputs page's own form */
    const opts = async () => { await L.go(p, 'inputs'); await p.waitForSelector('#inType', { timeout: 8000 }); return p.evaluate(() => [...document.querySelectorAll('#inType option')].map(o => o.value + '=' + o.textContent.trim())) }
    const types = await opts()
    console.log('input types:', JSON.stringify(types))
    const { fileTimed } = await import('./p6-lib.mjs')
    const tname = (types.find(t => /meeting/i.test(t)) || '').split('=')[0]
    const iid = await fileTimed(L, p, { person: X, type: tname || 'Meeting', iso: '2026-07-14', from: '05:00', to: '06:00', remarks: 'walk meeting' })
    const row = await p.evaluate(i => { const x = window.INPUTS.find(r => r.iid === i); return x ? JSON.stringify({ person: x.person, type: x.type, date: x.date, from: x.start || x.from, to: x.end || x.to }) : 'no row filed' }, iid)
    console.log('filed', iid, row)
    const okM = s => { const t = K.restText(s) || ''; return whole(s) && /05:00/.test(t) && /no take-off yet/.test(t) && /4h30/.test(t) && !/report/i.test(t) && clean(s) }
    await chk(p, `${id}.1`, `Tuesday: a blank flight with ${cs} (took ${sb.took}) plus a typed ${tname || 'Meeting'} input 05:00-06:00 for ${cs} on Tue 14 Jul via the Inputs form (filed ${iid}: ${row})`, okM, { monPic: true })
    await K.takeOff(p, TUE, b.gi, 0)
    await chk(p, `${id}.2`, `${cs} taken off the blank flight (seat "${await K.seatOf(p, TUE, b.gi, 0)}"): the input alone`, s => !s.breach && clean(s), { monPic: true })
    await K.reload(p)
    await chk(p, `${id}.3`, 'reload with him off the flight', s => !s.breach && clean(s))
  } catch (e) { R(`${id}.script`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, `${id}-X`)]) }
  R(`${id}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}
if (which === 'a' || which === 'all') await partA()
if (which === 'b' || which === 'all') await partB()
B.savePart('rbl-A-s10')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}  ${r.did}\n      → ${r.saw}`)
