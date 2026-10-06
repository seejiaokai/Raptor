/* S27 — shared settings and counts: B + a blank crewed Tuesday line, published; change Crew rest, Debrief, Brief lead and Step on the
   Logic page one at a time, read every reader (Edit Schedule, View-only Sched, the crew list's pre-drop reason, Insights), restore each.
   Desktop. */
import * as K from './rbl-B-lib.mjs'
import { tap } from './lib.mjs'
const { B, W, L, R, pic, picEl, sleep } = K
const T = K.TUE, M = K.MON
K.cleanPics(['s27'])
const { browser, p, errors } = await K.fresh()
const msgOf = s => (s.held.find(x => x.code === 'CREW_REST' && !x.off) || {}).msg || '(no crew-rest warning)'
let gi = null, fiZU = null, Y = null
async function picker() {
  await W.boardOn(p, T); await sleep(400)
  const slot = `${T}.${gi}.${fiZU}.0.p`
  await tap(p, `[data-slot="${slot}"], [data-fill="${slot}"]`); await sleep(400)
  const armed = await p.evaluate(() => (window.ARM && window.ARM.key) || null)
  const readP = who => p.evaluate(who => {
    const e = [...document.querySelectorAll(`#sbRoster .rpuck[data-person="${who}"]`)].find(x => x.offsetParent !== null)
    if (!e) return null
    const cs = getComputedStyle(e)
    return { cls: e.className, title: e.getAttribute('title') || '', text: e.innerText.replace(/\s+/g, ' ').trim(), strike: cs.textDecorationLine, op: cs.opacity, inner: e.parentElement ? e.parentElement.innerText.replace(/\s+/g, ' ').trim().slice(0, 160) : '' }
  }, who)
  const info = await readP(K.X), infoY = Y ? await readP(Y) : null
  const shot = armed && (infoY || info) ? await picEl(p, `#sbRoster .rpuck[data-person="${Y || K.X}"]`, 's27-picker-' + (++picker.n), { pad: 60, maxH: 260 }) : await B.pic(p, 's27-picker-' + (++picker.n) + '-x')
  await p.keyboard.press('Escape'); await sleep(250)
  await W.boardOff(p)
  return { armed: !!armed, info, infoY, shot }
}
picker.n = 0
const pw = (i, who) => i ? `${who}: ${i.title} | ${i.text} | ${i.strike === 'none' ? 'not struck' : 'struck'} | ${i.inner}` : `${who}: no puck in the crew list`
const pickWords = pk => `${pk.armed ? '' : '(seat NOT armed) '}${pw(pk.infoY, 'the man on Monday only')} || ${pw(pk.info, 'Scribe (already on Tuesday)')}`

async function snap(tag) {
  const s = await K.see(p, 's27-' + tag, { pics: false })
  await B.toEdit(p)
  const hEdit = await B.head(p, T)
  const ed = await picEl(p, `#eWeek .day[data-day="${T}"] [data-dwbox="${T}"]`, 's27-' + tag + '-edit', { pad: 8, maxH: 600 })
  const v = await K.see(p, 's27-' + tag + '-view', { surf: '#vWeek', pics: false })
  const vs = await picEl(p, `#vWeek .day[data-day="${T}"] [data-dwbox="${T}"]`, 's27-' + tag + '-view', { pad: 8, maxH: 600 })
  const pk = await picker()
  await B.toEdit(p)
  const ins = await K.look(p, 's27-' + tag + '-ins', { keep: false })
  const crewN = (K.sec(ins, 'Conflicts').find(x => /^Crew rest/.test(x)) || 'Crew rest: none')
  const hrs = K.hoursOf(ins, [await B.csOf(p, K.X)])
  return { edit: msgOf(s), view: msgOf(v), editRing: s.ringTue, dotted: s.dotMon, viewLine: v.lines.some(x => /Crew rest/.test(x.text) && !x.struck), pk, crewN, hrs, head: hEdit, pics: [ed, vs, pk.shot, ins.shot].filter(Boolean), editPaint: K.pn(s.tuePaint) }
}
const line = x => `Edit: "${x.edit}" (ring ${x.editPaint}; Monday dotted ${x.dotted}) · View-only: "${x.view}" · crew list: ${pickWords(x.pk)} · Insights "${x.crewN}", his work hours ${JSON.stringify(x.hrs)} · Tue ${K.hd(x.head)}`
try {
  const cs = await B.csOf(p, K.X)
  const b = await K.baseB(p)
  gi = b.t.gi
  /* a second man, idle on both days, put in Monday's ZM front seat: the crew list's pre-drop reason is read for HIM on Tuesday */
  const pickIdle = async (di, slot) => {
    await W.boardOn(p, di); await sleep(300)
    await tap(p, `[data-slot="${slot}"], [data-fill="${slot}"]`); await sleep(350)
    const cand = await p.evaluate(() => [...document.querySelectorAll('#sbRoster .rpuck[data-person]')].filter(e => e.offsetParent !== null && !e.classList.contains('dis')).map(e => e.dataset.person))
    await p.keyboard.press('Escape'); await sleep(200)
    return p.evaluate(c => c.filter(id => !JSON.stringify(window.DAYS[0]).includes('"' + id + '"') && !JSON.stringify(window.DAYS[1]).includes('"' + id + '"')), cand)
  }
  for (const id of (await pickIdle(M, `${M}.${b.m.gi}.0.0.p`)).slice(0, 6)) { const r = await K.seat(p, M, b.m.gi, 0, 0, 'p', id); if (r.took) { Y = id; break } }
  const ycs = Y ? await B.csOf(p, Y) : '(none)'
  await K.addLine(p, T, gi); const fb = (await K.nLines(p, T, gi)) - 1
  const sb = await K.seat(p, T, gi, fb, 0, 'w', K.X)
  /* a second timed line with nobody on it: the crew list's "before you place him" reason is read against it */
  await K.addLine(p, T, gi); fiZU = (await K.nLines(p, T, gi)) - 1
  await K.ff(p, T, gi, fiZU, 'cs', 'ZU'); await K.ff(p, T, gi, fiZU, 'to', '07:00'); await K.ff(p, T, gi, fiZU, 'ld', '08:00')
  let Wm = null
  for (const id of (await pickIdle(T, `${T}.${gi}.${fiZU}.0.w`)).slice(0, 6)) { const r = await K.seat(p, T, gi, fiZU, 0, 'w', id); if (r.took) { Wm = id; break } }
  const wcs = Wm ? await B.csOf(p, Wm) : '(none)'
  await B.toEdit(p); await B.pubOrig(p, M); await B.pubOrig(p, T)
  const base = await snap('0-base')
  R('S27.0', `Baseline B + ${ycs} (idle on Tuesday) in Monday's ZM front seat (took ${!!Y}) + a blank Tuesday line (${cs} seated, took ${sb.took}) + a timed line ZU 07:00-08:00 (line ${fiZU}) with only ${wcs} in its rear seat (took ${!!Wm}) and its front seat left empty; Monday and Tuesday published; settings as they stand`, line(base),
    /only 4h30/.test(base.edit) && base.edit === base.view && base.editRing && base.dotted ? 'PASS' : 'FAIL', base.pics)
  const orig = {}
  async function change(id, key, val, label, expect) {
    if (orig[key] === undefined) orig[key] = await K.logicRead(p, key)
    const r = await K.logicSet(p, key, val)
    const x = await snap(id)
    const ok = expect ? expect(x) : null
    R(`S27.${id}`, `Logic page: ${label} "${r.before}" typed -> "${val}" (the box then read "${r.after}")`, line(x), ok === null ? 'RECORDED' : ok ? 'PASS' : 'FAIL', x.pics)
    return x
  }
  async function restore(id, key, label) {
    const r = await K.logicSet(p, key, orig[key])
    const x = await snap(id)
    const same = x.edit === base.edit && x.view === base.view && pw(x.pk.infoY, 'Y') === pw(base.pk.infoY, 'Y') && x.crewN === base.crewN
    R(`S27.${id}`, `Logic page: ${label} restored to "${orig[key]}" (the box read "${r.after}")`, line(x), same ? 'PASS' : 'FAIL', x.pics)
    return x
  }
  await change('1-debrief', 'debrief', '1h', 'Debrief after landing', x => /\+1h debrief/.test(x.edit) && /23:30/.test(x.edit) && /only 5h30/.test(x.edit) && x.edit === x.view && /11:30/.test(pw(x.pk.infoY, 'Y')))
  await restore('2-debrief-back', 'debrief', 'Debrief after landing')
  await change('3-crewrest10', 'crewRest', '10h', 'Crew rest', x => /clear at 10:30/.test(x.edit) && x.edit === x.view && /10:30/.test(pw(x.pk.infoY, 'Y')))
  await change('4-crewrest4', 'crewRest', '4h', 'Crew rest (lower again)', x => /no crew-rest warning/.test(x.edit) && /no crew-rest warning/.test(x.view) && !x.editRing && !/not clear until/.test(pw(x.pk.infoY, 'Y')))
  await restore('5-crewrest-back', 'crewRest', 'Crew rest')
  await change('6-briefLead', 'briefLead', '1h', 'Flight brief before T/O (the suggested brief)', null)
  await restore('7-briefLead-back', 'briefLead', 'Flight brief before T/O')
  await change('8-step', 'step', '30 min', 'Step before take-off', null)
  await restore('9-step-back', 'step', 'Step before take-off')
} catch (e) { R('S27.X', 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await pic(p, 's27-X')]) }
R('S27.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
/* CONTROL: the same Logic changes on a published pair of days with NO crew-rest breach at all (Monday's flight ends 10:30) — does the
   "1 pending" chip come with the setting, or with the breach? */
{
  const w = await K.fresh(); const q = w.p
  try {
    const b = await K.baseB(q, { monTo: '09:00', monLd: '10:30' })
    await B.toEdit(q); await B.pubOrig(q, M); await B.pubOrig(q, T)
    const h0 = await B.head(q, T), m0 = await B.head(q, M)
    const sx0 = await K.see(q, 's27-ctl-0', { pics: false })
    const rows = []
    for (const [key, val] of [['debrief', '1h'], ['briefLead', '1h'], ['step', '30 min'], ['crewRest', '10h']]) {
      const o = await K.logicRead(q, key); await K.logicSet(q, key, val)
      await B.toEdit(q)
      const hT = await B.head(q, T), hM = await B.head(q, M)
      const pc = await K.headPic(q, '#eWeek', T, 's27-ctl-' + key)
      rows.push({ key, o, val, hT, hM, pc })
      await K.logicSet(q, key, o)
    }
    await B.toEdit(q)
    const hTf = await B.head(q, T), hMf = await B.head(q, M)
    R('S27.CTL', `CONTROL, no breach anywhere (Monday ZM 09:00-10:30, Tuesday ZT 07:00 Brief 05:00, both published): each Logic setting changed and put back`,
      `before: Tue "${h0.pending || 'none'}" / "${h0.nys || 'no marker'}", Mon "${m0.pending || 'none'}" · ` + rows.map(r => `${r.key} ${r.o} -> ${r.val}: Tue chip "${r.hT.pending || 'none'}" marker "${r.hT.nys || 'none'}", Mon chip "${r.hM.pending || 'none'}" marker "${r.hM.nys || 'none'}"`).join(' · ') + ` · after all restored: Tue "${hTf.pending || 'none'}" / "${hTf.nys || 'no marker'}", Mon "${hMf.pending || 'none'}"`, 'RECORDED', rows.map(r => r.pc))
  } catch (e) { R('S27.CTL', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(q, 's27-ctl-X')]) }
  await w.browser.close()
}
B.savePart('s27')
