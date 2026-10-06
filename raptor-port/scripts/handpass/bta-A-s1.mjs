/* walker A — H-02 and S01. Usage: node bta-A-s1.mjs <h02|s01|s01p> (HP_PHONE=1 for the phone) */
import * as A from './bta-A-lib.mjs'
const { B, K, W, L, TUE, ID, CSN, sleep } = A
const which = process.argv[2] || 'h02'
const TAG = A.PHONE ? 'phone' : 'desk'
const clip = s => String(s).replace(/\s+/g, ' ')
const sz = A.PHONE ? '390×844 phone' : '1440×900 desktop'

/* take X off his seat by the board's own way (drag the puck off); if it does not take, the board's Undo */
async function takeX(p, h) {
  const slot = h.key.replace(/\.\+$/, '')
  const holds = () => p.evaluate(k => { const b = document.querySelector('#schedBoard'); const hs = [...b.querySelectorAll(`[data-slot="${k}"], [data-fill="${k}"]`)]; return hs.some(e => e.querySelector('[data-person]')) }, h.key)
  await K.boardTo(p, TUE)
  const r = await K.takeOff(p, TUE, slot).catch(e => 'takeOff error ' + String(e).slice(0, 80))
  const still = await p.evaluate(who => [...document.querySelectorAll('#schedBoard .puck[data-person="' + who + '"]')].filter(e => e.offsetParent !== null && !e.closest('#sbRoster')).length, ID)
  if (still) { for (let i = 0; i < 3 && still; i++) { await W.door(p, 'board', 'undo'); } }
  const left = await p.evaluate(who => [...document.querySelectorAll('#schedBoard .puck[data-person="' + who + '"]')].filter(e => e.offsetParent !== null && !e.closest('#sbRoster')).length, ID)
  return { r, left }
}

/* ---------------- H-02 ---------------- */
async function h02() {
  const w = await K.fresh(); const { p, errors } = w
  try {
    await A.fileType(p, 'OL')
    const H = {}
    for (const fam of ['duty', 'sim', 'ground']) { H[fam] = await A.build(p, fam); H[fam].bl = await A.blankIt(p, H[fam]) }
    const U = {}
    for (const fam of ['duty', 'sim', 'ground']) U[fam] = await A.putX(p, H[fam])
    const s1 = await A.read(p, 'h02-1-blank', { pics: true })
    const st = await Promise.all(['duty', 'sim', 'ground'].map(async f => `${f}: ${await H[f].state()} (X placed ${U[f].took})`))
    const th = s1.abs.filter(x => /but tasked — this row/.test(x.msg))
    const ok1 = th.length === 3 && U.duty.took && U.sim.took && U.ground.took && s1.abs.length === 3 && s1.absLines.filter(l => /— this row/.test(l.text)).length === 3 && !/NaN|undefined|Sim —|duty —/.test(JSON.stringify(s1.abs))
    K.R('H-02.1', `${sz}: OL filed for X for Tuesday; "+ Row" in a duty block, "+ Row" in the OFT sim block, "+ Item" on the Ground Programme — each with no name and no times (${st.join(' · ')}); X put on each by the crew list`,
      A.say(s1) + ` · warning keys ${JSON.stringify(s1.abs.map(x => x.key || ''))} · warnings with "— this row": ${th.length}`, ok1 ? 'PASS' : 'FAIL', s1.pics)
    /* name each row */
    const names = { duty: 'NIGHT DESK', sim: 'EP-9', ground: 'RANGE SWEEP' }
    for (const fam of ['duty', 'sim', 'ground']) {
      await H[fam].setName(names[fam])
      const s = await A.read(p, `h02-2-named-${fam}`, { pics: fam === 'ground' ? true : 'list' })
      const hasName = s.abs.some(x => x.msg.includes(names[fam]))
      const left = s.abs.filter(x => /this row/.test(x.msg)).length
      const remaining = ['duty', 'sim', 'ground'].slice(['duty', 'sim', 'ground'].indexOf(fam) + 1).length
      const expectLeft = Math.min(1, remaining)   /* the day's list showed ONE line for all the unnamed rows in H-02.1 (identical sentences merge) */
      K.R(`H-02.2-${fam}`, `${sz}: the ${H[fam].label} named "${names[fam]}" (times still none)`, A.say(s) + ` · rows still unnamed: ${left}`, hasName && left === expectLeft && !/NaN|undefined/.test(JSON.stringify(s.abs)) ? 'PASS' : 'FAIL', s.pics)
    }
    /* then the times typed on all three (still the same sentence) */
    for (const fam of ['duty', 'sim', 'ground']) await H[fam].type()
    const s3 = await A.read(p, 'h02-3-timed', { pics: 'list' })
    K.R('H-02.3', `${sz}: 08:00–12:00 typed on all three rows`, A.say(s3), s3.abs.length === 3 && Object.values(names).every(n => s3.abs.some(x => x.msg.includes(n))) ? 'PASS' : 'FAIL', s3.pics)
  } catch (e) { K.R('H-02', 'script', String(e.stack || e).slice(0, 500), 'FAIL', [await A.pic(p, 'h02-ERR')]) }
  K.R('H-02.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await w.browser.close()
}

/* ---------------- S01 ---------------- */
/* one world per (type, seat): BB wave AND the separately templated BB desk both exist; X goes on the one under test */
async function s01(types, onlyMain) {
  for (const type of types) for (const fam of (onlyMain ? ['bbMain'] : ['bbMain', 'bbSpare', 'bbDesk'])) {
    const w = await K.fresh(); const { p, errors } = w
    const id = `S01 ${type} × ${fam} (${TAG})`
    try {
      await A.makeBBTemplate(p)
      const f = await A.fileType(p, type)
      const main = await A.build(p, 'bbMain')
      const spare = { ...main, key: `${TUE}.${main.gi}.0.2.${A.SEAT}`, label: 'BB SPARE seat (the same BB wave)' }
      const desk = await A.build(p, 'bbDesk')
      const h = fam === 'bbMain' ? main : fam === 'bbSpare' ? spare : desk
      const u = await A.putX(p, h)
      const s1 = await A.read(p, `s01-${type}-${fam}-${TAG}`.replace(/W+/g, '_'), { pics: true })
      const j1 = A.judge(type, fam, s1)
      let extra = '', jt = true
      if (fam === 'bbMain' && type === 'OL') {
        /* the reversal protocol: Undo → Redo → reload */
        const un = await A.undo(p); const sU = await A.read(p, `s01-${type}-undo-${TAG}`, { pics: 'list' })
        const re = await A.redo(p); const sR = await A.read(p, `s01-${type}-redo-${TAG}`, { pics: 'list' })
        await B.reloadAs(p, 'a'); await B.toEdit(p); const sL = await A.read(p, `s01-${type}-reload-${TAG}`, { pics: 'list' })
        extra = ` UNDO (${un.pressed ? 'pressed' : JSON.stringify(un)}): ${A.say(sU)}. REDO (${re.pressed ? 'pressed' : JSON.stringify(re)}): ${A.say(sR)}. RELOAD: ${A.say(sL)}.`
        jt = sU.abs.length === 0 && sR.abs.length === 1 && sL.abs.length === 1
      }
      K.R(id, `${sz}: ${type} filed for X for Tuesday; BB wave and a separately templated BB desk added; X put on ${h.label}`,
        `crew list before he is placed: ${A.sayRoster(u.r)}; placed ${u.took}${u.toast ? ', toast "' + clip(u.toast).slice(0, 140) + '"' : ''}. ${A.say(s1)} → oracle ${j1.exp}${j1.ok ? ' — matches' : ' — MISMATCH ' + j1.why}.${extra}`,
        j1.ok && u.took && jt ? 'PASS' : 'FAIL', s1.pics)
    } catch (e) { K.R(id, 'script', String(e.stack || e).slice(0, 500), 'FAIL', [await A.pic(p, `s01-ERR-${type}-${fam}`.replace(/W+/g, '_'))]) }
    if (errors.length) K.R(id + '.err', 'browser errors', errors.join(' | ').slice(0, 400), 'FAIL')
    await w.browser.close()
  }
}
/* S01 phone: the flying line and the BB seat */
async function s01phone() {
  await s01(['OL'], true)
  const w = await K.fresh(); const { p, errors } = w
  try {
    await A.fileType(p, 'OL')
    const h = await A.build(p, 'fly'); const u = await A.putX(p, h)
    const s1 = await A.read(p, 's01-fly-phone', { pics: true }); const j = A.judge('OL', 'fly', s1)
    K.R('S01 OL × fly (phone)', `${sz}: OL filed; a new flying line (+ Wave); X put on it`, `crew list before he is placed: ${A.sayRoster(u.r)}; placed ${u.took}. ${A.say(s1)} → ${j.ok ? 'matches oracle' : 'MISMATCH ' + j.why}`, j.ok && u.took ? 'PASS' : 'FAIL', s1.pics)
  } catch (e) { K.R('S01 phone fly', 'script', String(e.stack || e).slice(0, 500), 'FAIL', [await A.pic(p, 's01-ERR-fly-phone')]) }
  if (errors.length) K.R('S01 phone fly.err', 'browser errors', errors.join(' | ').slice(0, 400), 'FAIL')
  await w.browser.close()
}

if (which === 'h02') await h02()
if (which === 's01') await s01(['OL', 'ATT B', 'LL'], false)
if (which === 's01p') await s01phone()
B.savePart('bta-A-' + which)
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}\n      ${clip(r.did).slice(0, 200)}\n      → ${clip(r.saw).slice(0, 1200)}`)
