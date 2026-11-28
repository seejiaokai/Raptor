// sss-w1A — walker A's walk of chat 182's build (standby lines never ask a SANS man; an untimed sim strikes him; struck at
// once where his filing misses; no "file it" on the crew list — his D2584 Q4/Q5, D2586, D2585, D2587), 25 Nov 26.
// Brief: docs/superpowers/briefs/2026-11-25-sans-standby-sim-walk-brief.md. Run from raptor-port/, one scenario and size a run:
//   SSSA_RUN=<run> ONLY=<scenario> SZ=d|p|pc node scripts/handpass/sss-w1A.mjs
import './sss-w1A-env.mjs'
const X = await import('./sss-w1A-lib.mjs')
const { A, Z, T, L, W5, RANGER, IPMAN, D, sleep, J, addLine, boardArm, crewAll, who, say1, sayAll, weekArm, weekPick, crewPics,
  disarm, noteWatch, notesSeen, dragPath, hoverSay, rings, sbUndo, sbRedo, commit, noteFits, need, run, RNEW, TODAYW, NOFF, ONLY,
  addSimRow, simZones, zsel, armAt, pickNow, holdsAt, warnsOf, wSay } = X
const SCN = process.env.ONLY || 'W1r', SZ = process.env.SZ || 'd'
console.log(`VERSION sss-w1A 1 · ${SCN} · ${SZ} · bundle ${process.env.W2_URL} · out ${X.OUT}`)
const ACE = 'dj', JESTER = IPMAN, BOLT = 'yeti', KRAKEN = 'krait', REBEL = 'romeo', ZENITH = 'vinci', PIXEL = 'badger', OTTER = 'wrangler', MARLIN = 'cards'
const ISO17 = '2026-07-17', ISO18 = '2026-07-18'
const NAME = { bane: 'Ranger', ipman: 'Jester', yeti: 'Bolt', krait: 'Kraken', romeo: 'Rebel', vinci: 'Zenith', badger: 'Pixel', wrangler: 'Otter', cards: 'Marlin', dj: 'Ace' }
const one = (c, id) => who(c, id)[0] || null
const postR = async (p, W) => Z.post(p, W, RANGER, D[17], 'set.post')
const cap = s => ((s && s.hover && s.hover.caps) || []).filter(c => /dragimg|tdghost|haswhy|why/.test(c)).join(' ')
const noSans = x => !!x && !/SANS/.test(x.printed || '') && !/SANS/.test(x.title || '')
/* judge one man's line against the words expected: '' = no SANS words; otherwise exactly those words printed */
function judge(x, want) {
  if (!x) return { ok: false, why: 'not shown' }
  if (want === '') return { ok: noSans(x), why: '' }
  if (x.printed === want) return { ok: true }
  if (x.printed && !/SANS/.test(x.printed)) return { ok: 'REC', why: 'another reason shows first' }
  return { ok: false }
}
const pkAt = (p, root, key) => p.evaluate(([root, k]) => [...document.querySelectorAll(`${root} [data-slot="${k}"] .puck, ${root} [data-fill="${k}"] .puck`)].filter(e => e.getBoundingClientRect().width > 0).map(e => { const cs = getComputedStyle(e); return { cls: String(e.className), txt: (e.textContent || '').replace(/\s+/g, ' ').trim(), title: e.getAttribute('title') || '', ring: cs.outlineStyle !== 'none' ? cs.outlineColor + ' ' + cs.outlineStyle : 'no outline', shadow: cs.boxShadow, chips: [...e.querySelectorAll('*')].map(x => String(x.className) + (x.textContent && x.textContent.trim().length < 4 ? ':' + x.textContent.trim() : '')).filter(Boolean) } }), [root, key])
async function puckPic(p, W, key, tag) { const l = p.locator(`#schedBoard [data-slot="${key}"], #schedBoard [data-fill="${key}"]`).first(); return (await l.count()) ? W5.clip(p, W, l, tag + '-puck', 30) : '' }
/* a place armed and one man's line judged; the picture cut round his puck */
async function armJudge(p, W, di, sel, id, want, rid, what, tag) {
  const r = await armAt(p, W, di, sel, tag)
  const x = one(r.c, id), j = judge(x, want)
  const pic = await crewPics(p, W, '#schedBoard', id, tag)
  W.rec(rid, what, j.ok, `armed ${r.armed} · ${sayAll(r.c)} · ${NAME[id] || id} ${say1(r.c, id)}${j.why ? ' · ' + j.why : ''}`, pic)
  return r
}
/* place a man by tap: arm the place, press his name; the note, where he landed */
async function placeTap(p, W, di, sel, key, id, tag) {
  const r = await armAt(p, W, di, sel, tag)
  if (!r.armed) return { armed: null, placed: 'not armed', seen: [], note: '' }
  const pk = await pickNow(p, W, id, tag)
  await W5.boardDrawer(p, W, false)
  return { ...pk, armed: r.armed, c: r.c, placed: await holdsAt(p, key) }
}

const S = {}

/* ---- W1r: the filings world on Fri 17 — every kind of place, untimed / timed / half-timed, read for eight men ----
   F1 = A12 (untimed OFT / AMT), F2 (untimed flight, "OFT only"), F3 = A11 (one time only), N2, N3, N4, N12, N1 */
const FILES = [
  [JESTER, ['oft'], 'all', 'OFT all day'], [BOLT, ['oft'], ['08:00', '10:00'], 'OFT 08:00–10:00'], [RANGER, ['fly'], 'all', 'Fly all day'],
  [KRAKEN, ['amt'], 'all', 'AMT all day'], [REBEL, ['fly'], ['08:00', '10:00'], 'Fly 08:00–10:00'], [ZENITH, ['amt'], ['08:00', '10:00'], 'AMT 08:00–10:00'],
  [PIXEL, ['fly', 'oft', 'amt'], 'all', 'Fly + OFT + AMT all day'],
]
async function fileAll(p, W) {
  for (const [id, k, span, what] of FILES) {
    const f = await commit(p, W, ISO17, id, k, span, 'file-' + id)
    need(W, 'set.file.' + id, `Saber files for ${NAME[id]} on Fri 17: ${what}`, !!f.iid, J(f.rec), f.pic)
    await W5.closeSansWin(p, W)
  }
}
const PILOTS = [JESTER, BOLT, RANGER, KRAKEN, REBEL, ZENITH], WSOS = [PIXEL, OTTER]
const EXP = {
  'fl-untimed': { ipman: NOFF('Fly'), yeti: NOFF('Fly'), bane: '', krait: NOFF('Fly'), romeo: '', vinci: NOFF('Fly'), badger: '', wrangler: TODAYW, dj: '' },
  'oft-untimed': { ipman: '', yeti: '', bane: NOFF('OFT'), krait: NOFF('OFT'), romeo: NOFF('OFT'), vinci: NOFF('OFT'), badger: '', wrangler: TODAYW, dj: '' },
  'amt-untimed': { ipman: NOFF('AMT'), yeti: NOFF('AMT'), bane: NOFF('AMT'), krait: '', romeo: NOFF('AMT'), vinci: '', badger: '', wrangler: TODAYW, dj: '' },
  'fl-timed': { ipman: NOFF('Fly'), yeti: NOFF('Fly'), bane: '', krait: NOFF('Fly'), romeo: ONLY('08:00', '10:00'), vinci: NOFF('Fly'), badger: '', wrangler: TODAYW, dj: '' },
  'oft-timed': { ipman: '', yeti: ONLY('08:00', '10:00'), bane: NOFF('OFT'), krait: NOFF('OFT'), romeo: NOFF('OFT'), vinci: NOFF('OFT'), badger: '', wrangler: TODAYW, dj: '' },
  'amt-timed': { ipman: NOFF('AMT'), yeti: NOFF('AMT'), bane: NOFF('AMT'), krait: '', romeo: NOFF('AMT'), vinci: ONLY('08:00', '10:00'), badger: '', wrangler: TODAYW, dj: '' },
  'fl-win': { ipman: NOFF('Fly'), yeti: NOFF('Fly'), bane: '', krait: NOFF('Fly'), romeo: '', vinci: NOFF('Fly'), badger: '', wrangler: TODAYW, dj: '' },
  'oft-win': { ipman: '', yeti: '', bane: NOFF('OFT'), krait: NOFF('OFT'), romeo: NOFF('OFT'), vinci: NOFF('OFT'), badger: '', wrangler: TODAYW, dj: '' },
}
const IDS = { 'fl-untimed': 'F2 / N4', 'oft-untimed': 'F1 = A12 (OFT)', 'amt-untimed': 'F1 = A12 (AMT)', 'fl-timed': 'N2', 'oft-timed': 'N3 / A12 times outside', 'amt-timed': 'N3 / A12 times outside', 'fl-win': 'N2 (window covers)', 'oft-win': 'N3 (window covers)' }
S.W1r = async (p, W) => {
  await postR(p, W)
  await fileAll(p, W)
  const di = 4
  const fu = await addLine(p, W, di, { cs: 'SSFU' })
  const ft = await addLine(p, W, di, { cs: 'SSFT', to: '13:00', ld: '14:00' })
  const fw = await addLine(p, W, di, { cs: 'SSFW', to: '08:30', ld: '09:30' })
  const ou = await addSimRow(p, W, di, 'oft', 'SS OFT U'), au = await addSimRow(p, W, di, 'amt', 'SS AMT U')
  const ot = await addSimRow(p, W, di, 'oft', 'SS OFT T', '13:00', '14:00'), at = await addSimRow(p, W, di, 'amt', 'SS AMT T', '13:00', '14:00')
  const ow = await addSimRow(p, W, di, 'oft', 'SS OFT W', '08:30', '09:30')
  const o10 = await addSimRow(p, W, di, 'oft', 'SS OFT S10', '10:00', ''), o11 = await addSimRow(p, W, di, 'oft', 'SS OFT E1130', '', '11:30')
  need(W, 'set.rows', 'Fri 17: flights untimed / 13:00–14:00 / 08:30–09:30; OFT and AMT untimed and 13:00–14:00; OFT 08:30–09:30; OFT start 10:00 only; OFT end 11:30 only (read back)',
    fu.wi >= 0 && !fu.f.to && ft.f.to === '13:00' && fw.f.to === '08:30' && ou.ri >= 0 && !ou.r.str && !au.r.str && ot.r.str === '13:00' && at.r.end === '14:00' && ow.r.str === '08:30' && o10.r.str === '10:00' && !o10.r.end && !o11.r.str && o11.r.end === '11:30',
    J({ fu: fu.f, ft: ft.f, fw: fw.f, ou: ou.r, au: au.r, ot: ot.r, at: at.r, ow: ow.r, o10: o10.r, o11: o11.r }))
  const PL = {
    'fl-untimed': [`4.${fu.wi}.0.0.p`, `4.${fu.wi}.0.0.w`], 'fl-timed': [`4.${ft.wi}.0.0.p`, `4.${ft.wi}.0.0.w`], 'fl-win': [`4.${fw.wi}.0.0.p`, `4.${fw.wi}.0.0.w`],
    'oft-untimed': [`s:4.oft.${ou.ri}.p`, `s:4.oft.${ou.ri}.w`], 'amt-untimed': [`s:4.amt.${au.ri}.p`, `s:4.amt.${au.ri}.w`],
    'oft-timed': [`s:4.oft.${ot.ri}.p`, `s:4.oft.${ot.ri}.w`], 'amt-timed': [`s:4.amt.${at.ri}.p`, `s:4.amt.${at.ri}.w`], 'oft-win': [`s:4.oft.${ow.ri}.p`, `s:4.oft.${ow.ri}.w`],
  }
  for (const [pl, [kp, kw]] of Object.entries(PL)) {
    for (const [seat, key, men] of [['FCP', kp, [...PILOTS, ACE]], ['RCP', kw, WSOS]]) {
      const r = await armAt(p, W, di, `[data-slot="${key}"]`, `w1-${pl}-${seat}`)
      const pic = await crewPics(p, W, '#schedBoard', men[0], `w1-${pl}-${seat}`)
      const rows = men.map(id => { const x = one(r.c, id), j = judge(x, EXP[pl][id]); return { id, x, j, want: EXP[pl][id] } })
      const bad = rows.filter(z => z.j.ok === false), rec = rows.filter(z => z.j.ok === 'REC')
      const inside = r.c.pucks.filter(x => x.printed && x.inside === false)
      W.rec(`W1.${pl}.${seat}`, `${IDS[pl]} — ${pl} ${seat} armed: each man's SANS words as expected (${men.map(id => NAME[id] + '=' + (EXP[pl][id] || 'none')).join('; ')})`,
        armJ(r, key) && !bad.length ? (rec.length ? 'REC' : true) : false,
        `armed ${r.armed} · ${sayAll(r.c)} · ` + rows.map(z => `${NAME[z.id]} ${say1(r.c, z.id)}${z.j.ok === false ? ' ≠ WANT "' + (z.want || 'no SANS words') + '"' : z.j.ok === 'REC' ? ' (another reason first)' : ''}`).join(' · ') + (inside.length ? ' · OUTSIDE its panel: ' + inside.map(x => x.id).join(',') : ''), pic)
      if (inside.length) W.rec(`W1.${pl}.${seat}.fit`, 'every reason line inside its panel', false, inside.map(x => x.id + J(x.box)).join(' '), pic)
      await disarm(p, W)
    }
  }
  // F3 / A11: half-typed OFT rows — RECORD every man
  for (const [nm, row] of [['start 10:00 only', o10], ['end 11:30 only', o11]]) {
    for (const [seat, key, men] of [['FCP', `s:4.oft.${row.ri}.p`, [...PILOTS, ACE]], ['RCP', `s:4.oft.${row.ri}.w`, WSOS]]) {
      const r = await armAt(p, W, di, `[data-slot="${key}"]`, `w1-half-${row.ri}-${seat}`)
      const pic = await crewPics(p, W, '#schedBoard', men[0], `w1-half-${row.ri}-${seat}`)
      W.rec(`W1.F3.${nm.replace(/\W+/g, '')}.${seat}`, `F3 = A11 — an OFT with ${nm}, ${seat} armed: RECORDED what each man shows`, 'REC', `armed ${r.armed} · ${sayAll(r.c)} · ` + men.map(id => `${NAME[id]} ${say1(r.c, id)}`).join(' · '), pic)
      await disarm(p, W)
    }
  }
  // F3: the one with neither (the untimed OFT) is W1.oft-untimed. Edit Schedule's crew panel: the untimed OFT and flight from the week
  for (const [pl, sel] of [['oft-untimed', `[data-fill="s:4.oft.${ou.ri}.+"]`], ['amt-untimed', `[data-fill="s:4.amt.${au.ri}.+"]`], ['fl-untimed', `[data-slot="${PL['fl-untimed'][0]}"]`]]) {
    const w = await X.weekArmAt(p, W, sel, 'w1-wk-' + pl)
    if (!w.armed) { W.rec(`W1.wk.${pl}`, `Edit Schedule week: ${pl} FCP pressed in the day card`, 'NW', w.why || 'not armed', await W.pic(p, 'w1-wk-' + pl)); continue }
    const rows = PILOTS.map(id => ({ id, j: judge(one(w.c, id), EXP[pl][id]) }))
    W.rec(`W1.wk.${pl}`, `Edit Schedule's crew panel, ${pl} FCP pressed in the week: the same words as the board`, rows.every(z => z.j.ok !== false), `armed ${w.armed} · ${sayAll(w.c)} · ` + PILOTS.map(id => `${NAME[id]} ${say1(w.c, id)}`).join(' · '), await crewPics(p, W, '.ros-body', RANGER, 'w1-wk-' + pl))
    await p.keyboard.press('Escape'); await sleep(300)
    if (W.isPhone) await A.S.crewPanelClose(p, W).catch(() => {})
  }
}
const armJ = (r, key) => r.armed === key

/* ---- W1wk: Edit Schedule's crew panel for untimed sims and flight (the week shows an empty sim row's "+" only — probe2);
   two filings: Jester OFT all day, Ranger Fly all day; Otter nothing ---- */
S.W1wk = async (p, W) => {
  await postR(p, W)
  for (const [id, k, span, what] of FILES.filter(f => [JESTER, RANGER].includes(f[0]))) {
    const f = await commit(p, W, ISO17, id, k, span, 'file-' + id)
    need(W, 'set.file.' + id, `Saber files for ${NAME[id]} on Fri 17: ${what}`, !!f.iid, J(f.rec), f.pic)
    await W5.closeSansWin(p, W)
  }
  const fu = await addLine(p, W, 4, { cs: 'SSFU' })
  const ou = await addSimRow(p, W, 4, 'oft', 'SS OFT U'), au = await addSimRow(p, W, 4, 'amt', 'SS AMT U')
  need(W, 'set.rows', 'Fri 17: an untimed flight, OFT and AMT', fu.wi >= 0 && ou.ri >= 0 && au.ri >= 0, '')
  const want = { 'oft-untimed': { ipman: '', bane: NOFF('OFT'), wrangler: TODAYW }, 'amt-untimed': { ipman: NOFF('AMT'), bane: NOFF('AMT'), wrangler: TODAYW }, 'fl-untimed': { ipman: NOFF('Fly'), bane: '', wrangler: 'WSO — cannot fly front seat' } }
  for (const [pl, sel] of [['oft-untimed', `[data-fill="s:4.oft.${ou.ri}.+"]`], ['amt-untimed', `[data-fill="s:4.amt.${au.ri}.+"]`], ['fl-untimed', `[data-slot="4.${fu.wi}.0.0.p"]`]]) {
    const w = await X.weekArmAt(p, W, sel, 'wk-' + pl)
    if (!w.armed) { W.rec(`W1wk.${pl}`, `Edit Schedule week: ${pl} pressed`, 'NW', w.why || 'not armed', await W.pic(p, 'wk-' + pl)); continue }
    const rows = Object.entries(want[pl]).map(([id, v]) => ({ id, v, j: judge(one(w.c, id), v) }))
    const out = w.c.pucks.filter(x => x.printed && x.inside === false)
    W.rec(`W1wk.${pl}`, `Edit Schedule's crew panel, ${pl} pressed in the week: ${rows.map(z => NAME[z.id] + '=' + (z.v || 'none')).join('; ')} — as the board; lines inside the panel`, rows.every(z => z.j.ok === true) && !out.length, `armed ${w.armed} · ${sayAll(w.c)} · ` + rows.map(z => `${NAME[z.id]} ${say1(w.c, z.id)}`).join(' · ') + (out.length ? ' · OUTSIDE ' + out.map(x => x.id).join(',') : ''), await crewPics(p, W, '.ros-body', RANGER, 'wk-' + pl))
    await p.keyboard.press('Escape'); await sleep(300)
    if (W.isPhone) await A.S.crewPanelClose(p, W).catch(() => {})
  }
}

/* ---- W1d: the same filings; the drops, notes, warning lists, pucks — F1 drop (OFT and AMT), F2 drop, F16, N2/N9 amber ---- */
S.W1d = async (p, W) => {
  await postR(p, W)
  await fileAll(p, W)
  const di = 4
  const fu = await addLine(p, W, di, { cs: 'SSFU' })
  const ft = await addLine(p, W, di, { cs: 'SSFT', to: '13:00', ld: '14:00' })
  const ou = await addSimRow(p, W, di, 'oft', 'SS OFT U'), au = await addSimRow(p, W, di, 'amt', 'SS AMT U'), o16 = await addSimRow(p, W, di, 'oft', 'SS OFT 16')
  need(W, 'set.rows', 'Fri 17: flight SSFU untimed, SSFT 13:00–14:00; OFT "SS OFT U", AMT "SS AMT U", OFT "SS OFT 16", all untimed', fu.wi >= 0 && ft.wi >= 0 && ou.ri >= 0 && au.ri >= 0 && o16.ri >= 0, J({ fu: fu.f, ft: ft.f, ou, au, o16 }))
  const kO = `s:4.oft.${ou.ri}.p`, kA = `s:4.amt.${au.ri}.p`, kF = `4.${fu.wi}.0.0.p`, kT = `4.${ft.wi}.0.0.p`, k16 = `s:4.oft.${o16.ri}.p`
  // F1: Ranger (Fly only) onto the untimed OFT — the drag's hover on a desktop, then the drop; a tap on the phone
  let pk
  if (!W.isPhone) {
    await L.openBoard(p, W, di); await W5.boardDrawer(p, W, true); await noteWatch(p)
    const d = await dragPath(p, W, p.locator(`#schedBoard .rpuck[data-person="${RANGER}"]:visible`).first(), [p.locator(`#schedBoard [data-slot="${kO}"]:visible`).first()], 'w1d-f1-drag', 'last', !!W.cdp)
    await sleep(500)
    const ns = await notesSeen(p)
    W.rec('F1.hover', `F1 — Ranger (Fly only) dragged over the untimed OFT's FCP: the carried name reads "${NOFF('OFT')}"`, cap(d.seen[0]).includes(NOFF('OFT')), hoverSay(d.seen[0] && d.seen[0].hover), d.seen[0] && d.seen[0].pic)
    pk = { seen: ns, placed: await holdsAt(p, kO), notePic: d.npic, fits: await noteFits(p) }
  } else pk = await placeTap(p, W, di, `[data-slot="${kO}"]`, kO, RANGER, 'w1d-f1-tap')
  W.rec('F1.drop', `F1 — Ranger placed in the untimed OFT's FCP (never refused); the note RECORDED`, /bane/.test(pk.placed) ? 'REC' : false, `seat ${pk.placed} · notes ${J(pk.seen)} · ${pk.fits}`, pk.notePic)
  let w = await warnsOf(p, W, di, 'w1d-f1', 'Ranger')
  W.rec('F1.warn', 'F1 — the warning list after the drop: RECORDED exactly', 'REC', wSay(w, 'Ranger') + ' · all ' + J(w.rows), w.pic)
  W.rec('F1.puck', 'F1 — his puck on the OFT row (an amber "A"?): RECORDED', 'REC', J(await pkAt(p, '#schedBoard', kO)), await puckPic(p, W, kO, 'w1d-f1'))
  // F1 repeated on the untimed AMT
  pk = await placeTap(p, W, di, `[data-slot="${kA}"]`, kA, RANGER, 'w1d-f1a-tap')
  W.rec('F1.amt.drop', 'F1 — Ranger (Fly only) tapped into the untimed AMT\'s FCP: placed; the note RECORDED', /bane/.test(pk.placed) ? 'REC' : false, `crew list before the press: ${say1(pk.c, RANGER)} · seat ${pk.placed} · notes ${J(pk.seen)} · ${pk.fits}`, pk.notePic)
  W.rec('F1.amt.cl', `F1 — the crew list before that press read "${NOFF('AMT')}" for Ranger`, !!one(pk.c, RANGER) && one(pk.c, RANGER).printed === NOFF('AMT'), say1(pk.c, RANGER), pk.notePic)
  w = await warnsOf(p, W, di, 'w1d-f1a', 'Ranger')
  W.rec('F1.amt.warn', 'F1 — the warning list after the AMT drop: RECORDED', 'REC', wSay(w, 'Ranger'), w.pic)
  // F2: Jester (OFT only) onto the untimed flight
  pk = await placeTap(p, W, di, `[data-slot="${kF}"]`, kF, JESTER, 'w1d-f2-tap')
  W.rec('F2.cl', `F2 — untimed flight FCP armed: Jester (OFT only) reads "${NOFF('Fly')}"`, !!one(pk.c, JESTER) && one(pk.c, JESTER).printed === NOFF('Fly'), say1(pk.c, JESTER), pk.notePic)
  W.rec('F2.drop', 'F2 — Jester placed; the note RECORDED', pk.placed === JESTER ? 'REC' : false, `seat "${pk.placed}" · notes ${J(pk.seen)} · ${pk.fits}`, pk.notePic)
  w = await warnsOf(p, W, di, 'w1d-f2', 'Jester')
  W.rec('F2.warn', 'F2 — the warning list: RECORDED exactly', 'REC', wSay(w, 'Jester') + ' · all ' + J(w.rows), w.pic)
  W.rec('F2.puck', 'F2 — his puck on the flight: RECORDED', 'REC', J(await pkAt(p, '#schedBoard', kF)), await puckPic(p, W, kF, 'w1d-f2'))
  // F16: Bolt (OFT 08:00–10:00) on an untimed OFT — plain while untimed; times 13:00–14:30 typed; cleared
  pk = await placeTap(p, W, di, `[data-slot="${k16}"]`, k16, BOLT, 'w1d-f16-tap')
  W.rec('F16.0', 'F16 — "SS OFT 16" untimed, FCP armed: Bolt (OFT 08:00–10:00) plain; placed; note RECORDED', noSans(one(pk.c, BOLT)) && pk.placed.includes(BOLT), `${say1(pk.c, BOLT)} · seat ${pk.placed} · notes ${J(pk.seen)}`, pk.notePic)
  const w0 = await warnsOf(p, W, di, 'w1d-f16-0', 'Bolt')
  await L.typeBox(p, W, `[data-bfld="sr:4.oft.${o16.ri}.str"]`, '13:00'); await L.typeBox(p, W, `[data-bfld="sr:4.oft.${o16.ri}.end"]`, '14:30')
  const w1 = await warnsOf(p, W, di, 'w1d-f16-1', 'Bolt')
  const pu1 = await pkAt(p, '#schedBoard', k16)
  W.rec('F16.1', 'F16 — times 13:00–14:30 typed: an amber SANS line for Bolt arrives on the warning list (existing rule)', w1.his.some(x => /SANS/.test(x)) && !w0.his.some(x => /SANS/.test(x)), `before ${wSay(w0, 'Bolt')} · after ${wSay(w1, 'Bolt')} · row ${J(await X.simRow(p, 4, 'oft', o16.ri))}`, w1.pic)
  W.rec('F16.1p', 'F16 — his puck once timed (amber "A"?): RECORDED', 'REC', J(pu1), await puckPic(p, W, k16, 'w1d-f16-1'))
  const r16 = await armAt(p, W, di, `[data-slot="s:4.oft.${o16.ri}.w"]`, 'w1d-f16-rcp')
  W.rec('F16.1c', 'F16 — the timed row\'s RCP armed: Bolt\'s line RECORDED (he sits in its FCP)', 'REC', say1(r16.c, BOLT), await crewPics(p, W, '#schedBoard', BOLT, 'w1d-f16-rcp'))
  await disarm(p, W)
  await L.typeBox(p, W, `[data-bfld="sr:4.oft.${o16.ri}.str"]`, ''); await L.typeBox(p, W, `[data-bfld="sr:4.oft.${o16.ri}.end"]`, '')
  const w2 = await warnsOf(p, W, di, 'w1d-f16-2', 'Bolt')
  W.rec('F16.2', 'F16 — times cleared: the amber SANS line for Bolt gone', !w2.his.some(x => /SANS/.test(x)), `${wSay(w2, 'Bolt')} · row ${J(await X.simRow(p, 4, 'oft', o16.ri))}`, w2.pic)
  W.rec('F16.2p', 'F16 — his puck once cleared: RECORDED (the amber "A" gone?)', 'REC', J(await pkAt(p, '#schedBoard', k16)), await puckPic(p, W, k16, 'w1d-f16-2'))
  // N2 / N9: Jester (OFT only) onto the TIMED flight — the amber line and chip; then taken off by Undo
  pk = await placeTap(p, W, di, `[data-slot="${kT}"]`, kT, JESTER, 'w1d-n2-tap')
  const wn = await warnsOf(p, W, di, 'w1d-n2', 'Jester')
  const pn = await pkAt(p, '#schedBoard', kT)
  W.rec('N2.amber', `N2 — Jester (OFT only) placed on the timed flight: crew list "${NOFF('Fly')}", an amber SANS line naming him on the warning list`, !!one(pk.c, JESTER) && one(pk.c, JESTER).printed === NOFF('Fly') && wn.his.some(x => /SANS/.test(x) && /not offering Fly/.test(x)), `${say1(pk.c, JESTER)} · notes ${J(pk.seen)} · ${wSay(wn, 'Jester')} · puck ${J(pn)}`, [pk.notePic, wn.pic, await puckPic(p, W, kT, 'w1d-n2')].join(', '))
  await sbUndo(p, W)
  const wn2 = await warnsOf(p, W, di, 'w1d-n9', 'Jester')
  W.rec('N9.clear', 'N9 — board Undo takes him off the timed flight: the amber line for the flight leaves', (await holdsAt(p, kT)) === '' && !wn2.his.some(x => /SANS/.test(x) && /SSFT|13:00/.test(x)), `seat "${await holdsAt(p, kT)}" · ${wSay(wn2, 'Jester')}`, wn2.pic)
  // lesson 32: Ranger on Fri 17 — the crew list (not offering OFT), the warning list, his bell — side by side
  await L.closeBoard(p, W)
  await Z.asR(p, W)
  const b = await Z.bell(p, W, 'w1d-l32-bell')
  W.rec('L32.W1', 'lesson 32 — Ranger, Fri 17, filed Fly only, planned on an untimed OFT and AMT: his bell RECORDED beside the crew list ("not offering OFT/AMT") and the warning list (F1.warn)', 'REC', Z.sayB(b), b.pic)
}

/* ---- F4 = A13: an untimed sim's every place, nothing filed; the extras; the bell (D2586, D2568) ---- */
S.F4 = async (p, W) => {
  await postR(p, W)
  const di = 4
  const ou = await addSimRow(p, W, di, 'oft', 'SS4 OFT'), au = await addSimRow(p, W, di, 'amt', 'SS4 AMT')
  need(W, 'set.rows', 'Fri 17: an OFT and an AMT row, no times', ou.ri >= 0 && au.ri >= 0 && !ou.r.str && !au.r.end, J({ ou, au }))
  for (const [kind, ri] of [['oft', ou.ri], ['amt', au.ri]]) {
    const zs = await simZones(p, di, kind, ri)
    W.rec(`F4.${kind}.places`, `the ${kind.toUpperCase()} row's places on the board`, zs.length >= 3 ? 'REC' : false, J(zs))
    for (const z of zs) {
      const r = await armAt(p, W, di, zsel(z), `f4-${kind}-${z.replace(/\W+/g, '')}`)
      const rg = one(r.c, RANGER), js = one(r.c, JESTER), ot = one(r.c, OTTER), ac = one(r.c, ACE)
      /* Otter is a WSO: on a front seat the seat rule speaks first (run F4-d, the script's own expectation corrected) */
      const otW = /\.p$/.test(z) ? 'WSO — cannot fly front seat' : TODAYW
      const ok = !!rg && rg.struck && rg.printed === RNEW && !!js && js.struck && js.printed === TODAYW && !!ot && ot.printed === otW && noSans(ac) && r.c.pucks.filter(x => x.printed).every(x => x.inside !== false)
      W.rec(`F4.${kind}.${z.replace(/\W+/g, '')}`, `F4 = A13 — ${kind.toUpperCase()} ${z} armed (D2584 Q5, D2586): Ranger struck "${RNEW}", Jester "${TODAYW}", Otter "${otW}", Ace no SANS words, lines inside the panel`, ok, `armed ${r.armed} · ${sayAll(r.c)} · Ranger ${say1(r.c, RANGER)} · Jester ${say1(r.c, JESTER)} · Otter ${say1(r.c, OTTER)} · Ace ${say1(r.c, ACE)}`, await crewPics(p, W, '#schedBoard', RANGER, `f4-${kind}-${z.replace(/\W+/g, '')}`))
      await disarm(p, W)
    }
  }
  // both seats filled first (Ace front, Hunter rear), so "+" reaches the extras; then Ranger into the OFT's extras, Jester the AMT's
  const kx = `s:4.oft.${ou.ri}.+`, ka = `s:4.amt.${au.ri}.+`
  for (const [kind, ri] of [['oft', ou.ri], ['amt', au.ri]]) {
    const a1 = await placeTap(p, W, di, `[data-slot="s:4.${kind}.${ri}.p"]`, `s:4.${kind}.${ri}.p`, ACE, `f4-${kind}-ace`)
    const a2 = await placeTap(p, W, di, `[data-slot="s:4.${kind}.${ri}.w"]`, `s:4.${kind}.${ri}.w`, 'prowler', `f4-${kind}-hun`)
    need(W, `set.${kind}.seats`, `the ${kind.toUpperCase()}'s two seats filled: Ace front, Hunter rear`, a1.placed.includes(ACE) && a2.placed.includes('prowler'), J(await X.simRow(p, 4, kind, ri)) + ' · after each press (armed, green rings left) ' + J({ ace: a1.after, hunter: a2.after }))
  }
  const rx = await armAt(p, W, di, `[data-fill="${kx}"]`, 'f4-xarm')
  W.rec('F4.x.arm', `F4 = A13 — both seats full, the OFT's "+" (an extra place) armed: Ranger struck "${RNEW}", Jester "${TODAYW}" (D2586)`, !!one(rx.c, RANGER) && one(rx.c, RANGER).printed === RNEW && !!one(rx.c, JESTER) && one(rx.c, JESTER).printed === TODAYW, `armed ${rx.armed}${rx.retry ? ' · ' + rx.retry : ''} · ${sayAll(rx.c)} · Ranger ${say1(rx.c, RANGER)} · Jester ${say1(rx.c, JESTER)}`, await crewPics(p, W, '#schedBoard', RANGER, 'f4-xarm'))
  await disarm(p, W)
  let pk = await placeTap(p, W, di, `[data-fill="${kx}"]`, kx, RANGER, 'f4-xr')
  W.rec('F4.x.drop', 'F4 — Ranger tapped into the OFT\'s extras: placed; the note (D2587 words, no "File it")', /bane/.test(pk.placed) && !pk.seen.some(n => /File it|Inputs page/.test(n)), `row ${J(await X.simRow(p, 4, 'oft', ou.ri))} · notes ${J(pk.seen)} · ${pk.fits}`, pk.notePic)
  pk = await placeTap(p, W, di, `[data-fill="${ka}"]`, ka, JESTER, 'f4-xj')
  W.rec('F4.xa.drop', 'F4 — Jester tapped into the AMT\'s extras: placed; the note RECORDED', /ipman/.test(pk.placed) ? 'REC' : false, `row ${J(await X.simRow(p, 4, 'amt', au.ri))} · notes ${J(pk.seen)} · ${pk.fits}`, pk.notePic)
  const w = await warnsOf(p, W, di, 'f4', 'Ranger')
  W.rec('F4.warn', 'F4 / lesson 32 — the warning list with Ranger in the OFT\'s extras, nothing filed: RECORDED (the amber line for nothing filed is not built, D2579)', 'REC', wSay(w, 'Ranger') + ' · all ' + J(w.rows), w.pic)
  W.rec('F4.puck', 'F4 — the OFT extras\' puck: RECORDED', 'REC', J(await pkAt(p, '#schedBoard', kx)), await puckPic(p, W, kx, 'f4-x'))
  await L.closeBoard(p, W)
  await Z.asR(p, W)
  const b = await Z.bell(p, W, 'f4-bell')
  W.rec('F4.bell', 'F4 — his bell counts Fri 17 (he sits only in an untimed sim\'s extras, nothing filed — D2568, D2586), its last words "Tap to file for availability."', !!b.rem && /Fri 17/.test(b.rem.body) && /Tap to file for availability\.$/.test(b.rem.body), Z.sayB(b), b.pic)
}

/* ---- F17 = A17: Ranger around his SANS date — Thu 16 / Fri 17 / Sat 18; untimed OFT and SC MAIN; crew list, armed seat,
   drag hover and the drop's note; his bell (D2587, D2338, D2340, D2584 Q4) ---- */
S.F17 = async (p, W) => {
  await postR(p, W)
  const rows = {}
  for (const [d, di] of [[16, 3], [17, 4], [18, 5]]) {
    const o = await addSimRow(p, W, di, 'oft', 'SS17 OFT')
    const s = await addLine(p, W, di, { kind: 'SC' })
    rows[d] = { di, o, s }
  }
  need(W, 'set.rows', 'Thu 16, Fri 17, Sat 18: an untimed OFT row and "+ Wave → SC" on each', Object.values(rows).every(x => x.o.ri >= 0 && x.s.wi >= 0), J(Object.fromEntries(Object.entries(rows).map(([d, x]) => [d, { oft: x.o.ri, sc: x.s.wi }]))))
  for (const [d, x] of Object.entries(rows)) {
    const want = +d < 17 ? '' : RNEW
    const kO = `s:${x.di}.oft.${x.o.ri}.p`, kS = `${x.di}.${x.s.wi}.0.0.p`
    await armJudge(p, W, x.di, `[data-slot="${kO}"]`, RANGER, want, `F17.${d}.oft`, `F17 — ${d} Jul, the untimed OFT's FCP armed: Ranger ${want ? 'struck "' + want + '" exactly' : 'ordinary, no SANS words'}`, `f17-${d}-oft`)
    await disarm(p, W)
    await armJudge(p, W, x.di, `[data-slot="${kS}"]`, RANGER, '', `F17.${d}.sc`, `F17 — ${d} Jul, SC AM MAIN FCP armed: Ranger no SANS words (D2584 Q4)`, `f17-${d}-sc`)
    await disarm(p, W)
  }
  // no seat picked on Fri 17 (D2420): no reason line under him
  await L.openBoard(p, W, 4); await W5.boardDrawer(p, W, true)
  const u = await crewAll(p, '#schedBoard')
  W.rec('F17.unpicked', 'F17 — Fri 17, nothing picked: no reason line printed under Ranger (D2420); how his name is drawn RECORDED in the note', !!one(u, RANGER) && !one(u, RANGER).printed, `${sayAll(u)} · ${say1(u, RANGER)}`, await crewPics(p, W, '#schedBoard', RANGER, 'f17-unpicked'))
  await W5.boardDrawer(p, W, false)
  // Edit Schedule's crew panel, the Fri 17 OFT pressed in the week
  const w = await X.weekArmAt(p, W, `[data-fill="s:4.oft.${rows[17].o.ri}.+"]`, 'f17-wk')
  if (w.armed) W.rec('F17.wk', `F17 — Edit Schedule, the Fri 17 OFT FCP pressed in the week: Ranger "${RNEW}" exactly`, !!one(w.c, RANGER) && one(w.c, RANGER).printed === RNEW, `armed ${w.armed} · ${say1(w.c, RANGER)}`, await crewPics(p, W, '.ros-body', RANGER, 'f17-wk'))
  else W.rec('F17.wk', 'F17 — Edit Schedule, the Fri 17 OFT pressed in the week', 'NW', w.why || 'not armed', await W.pic(p, 'f17-wk'))
  await p.keyboard.press('Escape'); await sleep(300)
  if (W.isPhone) await A.S.crewPanelClose(p, W).catch(() => {})
  // the drag (desktop) / tap (phone) onto the Fri 17 OFT and onto the Fri 17 SC MAIN: hover and note
  const kO = `s:4.oft.${rows[17].o.ri}.p`, kS = `4.${rows[17].s.wi}.0.1.p`
  if (!W.isPhone) {
    await L.openBoard(p, W, 4); await W5.boardDrawer(p, W, true); await noteWatch(p)
    /* a name carried from the crew list scrolls the crew list at the edge, not the board (probe3): each target is brought
       into view first, as a person scrolls before picking a name up — two drags */
    const src = () => p.locator(`#schedBoard .rpuck[data-person="${RANGER}"]:visible`).first()
    const vw = p.viewportSize().width
    const d0 = await dragPath(p, W, src(), [p.locator(`#schedBoard [data-slot="${kS}"]:visible`).first()], 'f17-drag-sc', { x: Math.round(vw / 2), y: 30 })
    W.rec('F17.hover.sc', 'F17 — dragged over the Fri 17 SC MAIN FCP: no SANS words under the carried name (let go over the title: nothing placed)', !/SANS/.test(cap(d0.seen[0])) && (await holdsAt(p, kS)) === '', hoverSay(d0.seen[0] && d0.seen[0].hover) + ` · SC seat "${await holdsAt(p, kS)}"`, d0.seen[0] && d0.seen[0].pic)
    await W5.boardDrawer(p, W, true); await noteWatch(p)
    const d1 = await dragPath(p, W, src(), [p.locator(`#schedBoard [data-slot="${kO}"]:visible`).first()], 'f17-drag-oft', 'last')
    await sleep(500)
    const ns = await notesSeen(p)
    W.rec('F17.hover.oft', `F17 — over the Fri 17 untimed OFT FCP: "${RNEW}" exactly under the carried name, no "File it"`, cap(d1.seen[0]).includes(RNEW) && !/File it|Inputs page/.test(cap(d1.seen[0])), hoverSay(d1.seen[0] && d1.seen[0].hover), d1.seen[0] && d1.seen[0].pic)
    W.rec('F17.drop.oft', `F17 — dropped on the OFT: placed; the note "Ranger — ${RNEW}" (D2587 words, no "File it")`, (await holdsAt(p, kO)).includes(RANGER) && ns.includes('Ranger — ' + RNEW) && !ns.some(n => /File it|Inputs page/.test(n)), `seat ${await holdsAt(p, kO)} · notes ${J(ns)}`, d1.npic)
    await sbUndo(p, W)
  }
  let pk = await placeTap(p, W, 4, `[data-slot="${kO}"]`, kO, RANGER, 'f17-tap-oft')
  W.rec('F17.tap.oft', `F17 — tap-to-plan onto the Fri 17 OFT: placed; the note "Ranger — ${RNEW}"`, pk.placed.includes(RANGER) && pk.seen.includes('Ranger — ' + RNEW) && !pk.seen.some(n => /File it|Inputs page/.test(n)), `seat ${pk.placed} · notes ${J(pk.seen)} · ${pk.fits}`, pk.notePic)
  pk = await placeTap(p, W, 4, `[data-slot="${kS}"]`, kS, RANGER, 'f17-tap-sc')
  W.rec('F17.tap.sc', 'F17 — tap-to-plan onto the Fri 17 SC MAIN: placed; no SANS words in the note (D2584 Q4)', pk.placed === RANGER && !pk.seen.some(n => /SANS/.test(n)), `before the press ${say1(pk.c, RANGER)} · seat "${pk.placed}" · notes ${J(pk.seen)}`, pk.notePic)
  // Sat 18 OFT too, so the bell has two days
  const k18 = `s:5.oft.${rows[18].o.ri}.p`
  pk = await placeTap(p, W, 5, `[data-slot="${k18}"]`, k18, RANGER, 'f17-tap-18')
  W.rec('F17.tap.18', 'F17 — Ranger tapped onto the Sat 18 untimed OFT: placed; note RECORDED', pk.placed.includes(RANGER) ? 'REC' : false, `notes ${J(pk.seen)}`, pk.notePic)
  // Thu 16 SC MAIN — a standby day before his date
  const k16 = `3.${rows[16].s.wi}.0.0.p`
  pk = await placeTap(p, W, 3, `[data-slot="${k16}"]`, k16, RANGER, 'f17-tap-16')
  W.rec('F17.tap.16', 'F17 — Ranger tapped onto Thu 16 SC MAIN: no SANS words in the note', !pk.seen.some(n => /SANS/.test(n)), `seat "${pk.placed}" · notes ${J(pk.seen)}`, pk.notePic)
  const wf = await warnsOf(p, W, 4, 'f17-17', 'Ranger')
  W.rec('F17.warn17', 'F17 / lesson 32 — Fri 17\'s warning list (Ranger on an untimed OFT and SC MAIN, nothing filed): no SANS line for the SC row; RECORDED', !wf.his.some(x => /SANS/.test(x) && /SC/.test(x)) ? 'REC' : false, wSay(wf, 'Ranger'), wf.pic)
  await L.closeBoard(p, W)
  await Z.asR(p, W)
  const b = await Z.bell(p, W, 'f17-bell')
  W.rec('F17.bell', 'F17 — his bell: names Fri 17 and Sat 18 (the untimed OFTs), never Thu 16; ends "Tap to file for availability."', !!b.rem && /Fri 17/.test(b.rem.body) && /Sat 18/.test(b.rem.body) && !/Thu 16/.test(b.rem.body) && /Tap to file for availability\.$/.test(b.rem.body), Z.sayB(b), b.pic)
}

/* ---- F13 + F14 = A14: "N free" against the names, standby → sim → flight → none, both screens (Sat 18) ---- */
S.F13 = async (p, W) => {
  await postR(p, W)
  const di = 5
  const s = await addLine(p, W, di, { kind: 'SC' })
  const o = await addSimRow(p, W, di, 'oft', 'SS13 OFT')
  const t = await addLine(p, W, di, { cs: 'SS13T', to: '21:00', ld: '22:00' })
  const u = await addLine(p, W, di, { cs: 'SS13U' })
  need(W, 'set.rows', 'Sat 18: + Wave → SC, an untimed OFT, a flight 21:00–22:00 and an untimed flight', s.wi >= 0 && o.ri >= 0 && t.wi >= 0 && u.wi >= 0, J({ s: s.wi, o: o.ri, t: t.f, u: u.f }))
  const K = { sc: `${di}.${s.wi}.0.0.p`, oft: `s:${di}.oft.${o.ri}.p`, fl: `${di}.${t.wi}.0.0.p`, ufl: `${di}.${u.wi}.0.0.p` }
  const free = c => { const sa = c.pucks.filter(x => x.where === 'SANS Avail'); const n = +((/(\d+) free/.exec(c.head) || [])[1] || NaN); return { n, hand: sa.filter(x => !x.struck).length, all: sa.length } }
  // F14: nothing picked
  await L.openBoard(p, W, di); await W5.boardDrawer(p, W, true)
  const c0 = await crewAll(p, '#schedBoard')
  W.rec('F14.board', 'F14 = A14 — board, nothing picked: no reason line under Ranger or Jester (D2420); how each is drawn RECORDED', !!one(c0, RANGER) && !one(c0, RANGER).printed && !!one(c0, JESTER) && !one(c0, JESTER).printed, `${sayAll(c0)} · count ${J(free(c0))} · Ranger ${say1(c0, RANGER)} · Jester ${say1(c0, JESTER)}`, await crewPics(p, W, '#schedBoard', RANGER, 'f14-board'))
  await W5.boardDrawer(p, W, false); await L.closeBoard(p, W); await L.go(p, 'editsched')
  const day = await A.S.crewPanelTo(p, W, 'sat').catch(e => 'ERR ' + e.message)
  const c0w = await crewAll(p, '.ros-body')
  W.rec('F14.week', 'F14 = A14 — Edit Schedule\'s crew panel on Sat 18, nothing picked: no reason line under Ranger or Jester; the same as the board', !!one(c0w, RANGER) && !one(c0w, RANGER).printed && !!one(c0w, JESTER) && !one(c0w, JESTER).printed, `day ${J(day)} · ${sayAll(c0w)} · Ranger ${say1(c0w, RANGER)} · Jester ${say1(c0w, JESTER)}`, await crewPics(p, W, '.ros-body', RANGER, 'f14-week'))
  await A.S.crewPanelClose(p, W).catch(() => {})
  // F13 / A14: standby → sim → untimed flight → timed flight, then cleared; the count against the names each time
  const seq = [['sc', '', 'SC AM MAIN'], ['oft', RNEW, 'the untimed OFT'], ['ufl', RNEW, 'the untimed flight'], ['fl', RNEW, 'the 21:00–22:00 flight'], ['sc', '', 'SC AM MAIN again (after the flight)']]
  let i = 0
  for (const [k, want, nm] of seq) {
    i++
    const r = await armAt(p, W, di, `[data-slot="${K[k]}"]`, `f13-${i}-${k}`)
    const f = free(r.c), j = judge(one(r.c, RANGER), want), jj = judge(one(r.c, JESTER), want ? TODAYW : '')
    W.rec(`F13.${i}.${k}`, `F13 = A14 — ${nm} picked: Ranger ${want ? '"' + want + '", out of the count' : 'no SANS words, inside the count'}; Jester alike; "N free" equals the names drawn free`, j.ok !== false && jj.ok !== false && f.n === f.hand && (want ? !!one(r.c, RANGER) && one(r.c, RANGER).struck : !!one(r.c, RANGER) && !one(r.c, RANGER).struck), `armed ${r.armed} · ${sayAll(r.c)} · count ${J(f)} · Ranger ${say1(r.c, RANGER)} · Jester ${say1(r.c, JESTER)}`, await crewPics(p, W, '#schedBoard', RANGER, `f13-${i}-${k}`))
    if (k === 'oft' || k === 'sc') { /* switch straight to the next place without clearing (A14: the last seat's reason must not linger) */ }
  }
  await disarm(p, W)
  await W5.boardDrawer(p, W, true)
  const c9 = await crewAll(p, '#schedBoard')
  W.rec('F13.cleared', 'F13 = A14 — the pick cleared: no reason line under Ranger or Jester', !!one(c9, RANGER) && !one(c9, RANGER).printed && !c9.pucks.some(x => x.where === 'SANS Avail' && x.printed), `${sayAll(c9)} · ${say1(c9, RANGER)}`, await crewPics(p, W, '#schedBoard', RANGER, 'f13-cleared'))
  await W5.boardDrawer(p, W, false)
  // the board closed and opened again, then the same on Edit Schedule's week
  await L.closeBoard(p, W)
  for (const [k, want] of [['sc', ''], ['oft', RNEW]]) {
    const w = await X.weekArmAt(p, W, k === 'oft' ? `[data-fill="s:${di}.oft.${o.ri}.+"]` : `[data-slot="${K[k]}"]`, `f13-wk-${k}`)
    if (!w.armed) { W.rec(`F13.wk.${k}`, `Edit Schedule week: ${k} pressed`, 'NW', w.why || 'not armed', await W.pic(p, `f13-wk-${k}`)); continue }
    const f = free(w.c)
    W.rec(`F13.wk.${k}`, `F13 = A14 — Edit Schedule, ${k} pressed in the week: Ranger ${want ? '"' + want + '"' : 'no SANS words'}; the count equals the free names`, judge(one(w.c, RANGER), want).ok !== false && f.n === f.hand, `armed ${w.armed} · ${sayAll(w.c)} · count ${J(f)} · Ranger ${say1(w.c, RANGER)}`, await crewPics(p, W, '.ros-body', RANGER, `f13-wk-${k}`))
    await p.keyboard.press('Escape'); await sleep(300)
    if (W.isPhone) await A.S.crewPanelClose(p, W).catch(() => {})
  }
}

/* ---- F11 = A15: drags between a standby seat and ordinary seats (Fri 17) — desktop mouse, 'pc' a finger ---- */
S.F11 = async (p, W) => {
  await postR(p, W)
  const di = 4
  const s = await addLine(p, W, di, { kind: 'SC' })
  const t = await addLine(p, W, di, { cs: 'SS11T', to: '21:00', ld: '22:00' })
  const o = await addSimRow(p, W, di, 'oft', 'SS11 OFT')
  need(W, 'set.rows', 'Fri 17: + Wave → SC, a flight 21:00–22:00, an untimed OFT', s.wi >= 0 && t.wi >= 0 && o.ri >= 0, J({ s: s.wi, t: t.f, o: o.r }))
  /* SC PM MAIN: on SC AM (07:00) Ranger carries a hard crew-rest warning from Thursday's late landing (run F11-d), which
     is not this scenario's subject */
  const kS = `${di}.${s.wi}.1.0.p`, kT = `${di}.${t.wi}.0.0.p`, kO = `s:${di}.oft.${o.ri}.p`
  const pk = await placeTap(p, W, di, `[data-slot="${kS}"]`, kS, RANGER, 'f11-place')
  need(W, 'set.place', 'Ranger tapped onto SC PM MAIN FCP', pk.placed === RANGER, `notes ${J(pk.seen)}`, pk.notePic)
  W.rec('F11.0', 'placing him on SC MAIN raised no SANS words', !pk.seen.some(n => /SANS/.test(n)), `notes ${J(pk.seen)}`, pk.notePic)
  await L.openBoard(p, W, di); await W5.boardDrawer(p, W, false); await noteWatch(p)
  const d1 = await X.dragVia(p, W,p.locator(`#schedBoard [data-slot="${kS}"] .puck:visible`).first(), [p.locator(`#schedBoard [data-slot="${kT}"]:visible`).first(), p.locator(`#schedBoard [data-slot="${kO}"]:visible`).first()], 'f11-a', 'last', !!W.cdp)
  await sleep(500)
  const n1 = await notesSeen(p)
  W.rec('F11.1', `F11 — from the SC seat over the 21:00 flight's FCP: "${RNEW}" under the carried name`, cap(d1.seen[0]).includes(RNEW), hoverSay(d1.seen[0] && d1.seen[0].hover), d1.seen[0] && d1.seen[0].pic)
  W.rec('F11.2', `F11 — then over the untimed OFT's FCP: "${RNEW}" (D2584 Q5)`, cap(d1.seen[1]).includes(RNEW), hoverSay(d1.seen[1] && d1.seen[1].hover), d1.seen[1] && d1.seen[1].pic)
  W.rec('F11.3', `F11 — dropped on the OFT: moved (the SC seat empty); the note "Ranger — ${RNEW}" — matching the hover`, (await holdsAt(p, kO)).includes(RANGER) && (await holdsAt(p, kS)) === '' && n1.includes('Ranger — ' + RNEW), `OFT ${await holdsAt(p, kO)} · SC "${await holdsAt(p, kS)}" · notes ${J(n1)}`, d1.npic)
  await noteWatch(p)
  const d2 = await X.dragVia(p, W,p.locator(`#schedBoard [data-slot="${kO}"] .puck:visible`).first(), [p.locator(`#schedBoard [data-slot="${kS}"]:visible`).first()], 'f11-b', 'last', !!W.cdp)
  await sleep(500)
  const n2 = await notesSeen(p)
  W.rec('F11.4', 'F11 — dragged back over the SC seat: no SANS words under the carried name (nothing left over from the OFT)', !/SANS/.test(cap(d2.seen[0])), hoverSay(d2.seen[0] && d2.seen[0].hover), d2.seen[0] && d2.seen[0].pic)
  W.rec('F11.5', 'F11 — dropped on the SC seat: moved back (the OFT empty); no SANS words in the note', (await holdsAt(p, kS)) === RANGER && !(await holdsAt(p, kO)).includes(RANGER) && !n2.some(n => /SANS/.test(n)), `SC "${await holdsAt(p, kS)}" · OFT ${await holdsAt(p, kO)} · notes ${J(n2)}`, d2.npic)
}

/* ---- F12 = A16: the green "where can he go" rings for Ranger, nothing filed, then filed, then deleted; Flies toggled ---- */
S.F12 = async (p, W) => {
  await postR(p, W)
  const di = 4
  const sc = await addLine(p, W, di, { kind: 'SC' }), av = await addLine(p, W, di, { kind: 'AVALON' }), bb = await addLine(p, W, di, { kind: 'BB' })
  const t = await addLine(p, W, di, { cs: 'SS12T', to: '21:00', ld: '22:00' }), u = await addLine(p, W, di, { cs: 'SS12U' })
  const ot = await addSimRow(p, W, di, 'oft', 'SS12 OFT T', '21:00', '21:45'), au = await addSimRow(p, W, di, 'amt', 'SS12 AMT U')
  await L.typeBox(p, W, `[data-bfld="ff:${di}.${sc.wi}.1.br"]`, '12:30')
  const pmB = await p.evaluate(([i, w]) => window.DAYS[i].waves[w].formations[1], [di, sc.wi])
  need(W, 'set.rows', 'Fri 17: SC (AM standing by; PM flying by a typed B 12:30), AVALON, BB, a flight 21:00–22:00, an untimed flight, an OFT 21:00–21:45, an untimed AMT',
    [sc, av, bb, t, u].every(x => x.wi >= 0) && ot.ri >= 0 && au.ri >= 0, J({ pmB: { br: pmB.br, rl: pmB.rl }, ot: ot.r, au: au.r }))
  const occ = await placeTap(p, W, di, `[data-slot="${di}.${sc.wi}.0.1.p"]`, `${di}.${sc.wi}.0.1.p`, ACE, 'f12-ace')
  need(W, 'set.ace', 'Ace on SC AM MAIN aircraft 2 (an occupied standby seat)', occ.placed === ACE, '')
  const KEYS = {
    'SC AM MAIN (standing by)': `${di}.${sc.wi}.0.0.p`, 'SC AM MAIN occupied (Ace)': `${di}.${sc.wi}.0.1.p`, 'SC AM SPARE': `${di}.${sc.wi}.0.2.p`,
    'SC PM MAIN (flying, B typed)': `${di}.${sc.wi}.1.0.p`, 'SC PM SPARE (flying)': `${di}.${sc.wi}.1.2.p`,
    'AVALON MAIN': `${di}.${av.wi}.0.0.p`, 'AVALON SPARE': `${di}.${av.wi}.0.2.p`, 'BB MAIN': `${di}.${bb.wi}.0.0.p`,
    'flight 21:00': `${di}.${t.wi}.0.0.p`, 'untimed flight': `${di}.${u.wi}.0.0.p`, 'OFT 21:00 FCP': `s:${di}.oft.${ot.ri}.p`, 'untimed AMT FCP': `s:${di}.amt.${au.ri}.p`,
  }
  const STAND = Object.keys(KEYS).filter(k => /SC|AVALON|BB/.test(k)), ORD = Object.keys(KEYS).filter(k => !STAND.includes(k))
  const look = async (tag, root) => {
    if (root === '#schedBoard') { await L.openBoard(p, W, di); await W5.boardDrawer(p, W, true) }
    else { await L.closeBoard(p, W); await L.go(p, 'editsched'); await A.S.crewPanelTo(p, W, 'fri') }
    const pk = root === '#schedBoard' ? `#schedBoard .rpuck[data-person="${RANGER}"]:visible` : `.ros-body .rpuck[data-person="${RANGER}"]:visible`
    await W.press(p, pk, 'sel-ranger'); await sleep(500)
    const r = await rings(p, root, Object.values(KEYS))
    if (root === '#schedBoard') await W5.boardDrawer(p, W, false)
    const pic = await W.pic(p, tag)
    if (root === '#schedBoard') await W5.boardDrawer(p, W, true); else if (W.isPhone) await A.S.crewPanelTo(p, W, 'fri')
    await W.press(p, pk, 'unsel-ranger').catch(() => {}); await sleep(300)
    if (root === '#schedBoard') await W5.boardDrawer(p, W, false); else await A.S.crewPanelClose(p, W).catch(() => {})
    return { r: Object.fromEntries(Object.entries(KEYS).map(([n, k]) => [n, r[k]])), pic }
  }
  for (const [root, nm] of [['#schedBoard', 'board'], ['#eWeek', 'week']]) {
    const x = await look(`f12-${nm}-nofile`, root)
    W.rec(`F12.${nm}.1`, `F12 = A16 — ${nm}: Ranger tapped, nothing filed — the flights and both sims not ringed (D2573, Q5); standby seats RECORDED (not held back for SANS)`, ORD.every(k => x.r[k] !== 'RING') ? 'REC' : false, J(x.r), x.pic)
  }
  // any standby seat left unringed: opened, and its reason read
  const x0 = await look('f12-board-nofile2', '#schedBoard')
  for (const k of STAND.filter(k => x0.r[k] === 'none' && !/occupied/.test(k))) {
    await armJudge(p, W, di, `[data-slot="${KEYS[k]}"]`, RANGER, '', `F12.why.${k.replace(/\W+/g, '')}`, `F12 — ${k} not ringed: opened, Ranger's reason has no SANS words (RECORDED what it is)`, `f12-why-${k.replace(/\W+/g, '')}`)
    await disarm(p, W)
  }
  const f = await commit(p, W, ISO17, RANGER, ['fly', 'oft', 'amt'], 'all', 'f12-file')
  need(W, 'set.file', 'Saber files Fly + OFT + AMT all day on Fri 17 for Ranger', !!f.iid, J(f.rec), f.pic)
  await W5.closeSansWin(p, W)
  const x1 = await look('f12-board-filed', '#schedBoard')
  W.rec('F12.board.2', 'F12 = A16 — filed: the empty flights and sims now ring (21:00 flight, untimed flight, OFT, untimed AMT)', ['flight 21:00', 'untimed flight', 'OFT 21:00 FCP', 'untimed AMT FCP'].every(k => x1.r[k] === 'RING'), J(x1.r), x1.pic)
  const ud = await W5.uncommit(p, W, ISO17, f.iid, 'f12-unfile')
  need(W, 'set.unfile', 'the filing deleted from its SANS day', ud.ok, '', ud.pic)
  await W5.closeSansWin(p, W)
  const x2 = await look('f12-board-unfiled', '#schedBoard')
  W.rec('F12.board.3', 'F12 = A16 — deleted: the flights and sims unringed again; standby as before the filing', ORD.every(k => x2.r[k] !== 'RING') && STAND.every(k => x2.r[k] === x0.r[k]), `${J(x2.r)} · before the filing ${J(x0.r)}`, x2.pic)
  await L.openBoard(p, W, di)
  await W.press(p, L.B(`[data-safly="${di}.${av.wi}.0.0"]`), 'avalon-flies'); await sleep(500)
  const fl = await p.locator(L.B(`[data-safly="${di}.${av.wi}.0.0"]`)).first().getAttribute('aria-pressed')
  const x3 = await look('f12-board-flies', '#schedBoard')
  W.rec('F12.board.4', 'F12 = A16 — AVALON MAIN ticked Flies: its seat\'s ring the same as standing by (no SANS hold-back)', fl === 'true' && x3.r['AVALON MAIN'] === x2.r['AVALON MAIN'], `Flies ${fl} · AVALON MAIN ${x2.r['AVALON MAIN']} → ${x3.r['AVALON MAIN']} · all ${J(x3.r)}`, x3.pic)
}

/* an input filed for a man from the Inputs calendar (chat 179's fileInput route, copied whole) */
async function fileInput(p, W, iso, typeRx, whoId, tag, o = {}) {
  const D4 = await import('./swd-w14d-lib.mjs')
  await D4.inDay(p, W, iso)
  const before = await D4.ids(p)
  await W.press(p, '#icPopAdd', 'icadd')
  await p.locator('#inpEditPop #inpEditType').waitFor()
  const opts = await p.locator('#inpEditPop #inpEditType option').evaluateAll(os => os.map(o => o.value + '=' + o.textContent.trim()))
  const pick = opts.find(x => typeRx.test(x))
  if (!pick) { await p.keyboard.press('Escape'); return { iid: null, why: 'no type matching ' + typeRx + ' in ' + opts.join('|') } }
  await p.selectOption('#inpEditPop #inpEditType', pick.split('=')[0]); await sleep(300)
  if (await p.locator('#inpEditPop #inpEditPerson').count()) await p.selectOption('#inpEditPop #inpEditPerson', whoId).catch(() => {})
  await sleep(200)
  if (await p.locator('#inpEditSpan [data-span="all"]').count()) { const on = await p.locator('#inpEditSpan [data-span="all"]').getAttribute('aria-pressed'); if (on !== 'true') await W.press(p, '#inpEditSpan [data-span="all"]', 'span-all') }
  else { const ad = p.locator('#inpEditPop #inpEditAllday'); if (await ad.count() && !(await ad.isChecked())) await ad.click() }
  if (o.title) { const t = p.locator('#inpEditPop #inpEditOwnTitle'); if (await t.count()) await t.fill(o.title) }
  const pic0 = await W.pic(p, tag + '-form')
  await W.press(p, '#inpEditSave:visible', 'save')
  const asked = await D4.answerAsks(p, W)
  const made = (await D4.ids(p)).filter(x => !before.includes(x))
  const pic = await W.pic(p, tag + '-saved')
  if (await p.locator('[data-testid="win-inputedit"]:visible').count()) { await p.keyboard.press('Escape'); await sleep(300) }
  const x = p.locator('[data-testid="win-inputsday-x"]:visible'); if (await x.count()) await W.press(p, x.first(), 'day-x')
  return { iid: made[0] || null, type: pick, asked, rec: made[0] ? await D4.recOf(p, made[0]) : null, pic: pic0 + ', ' + pic }
}

/* ---- F20 = A19: other reasons survive — leave, medical, WSO seat, SC currency, already busy (Fri 17) ---- */
S.F20 = async (p, W) => {
  await postR(p, W)
  const di = 4
  const lv = await fileInput(p, W, ISO17, /^LL=|^OL=|leave/i, JESTER, 'f20-leave')
  need(W, 'set.leave', 'Jester on leave all day Fri 17 (Inputs)', !!lv.iid, `${lv.type} · ${J(lv.rec)} · ${lv.why || ''}`, lv.pic)
  const md = await fileInput(p, W, ISO17, /^ATT C=/, KRAKEN, 'f20-attc')
  need(W, 'set.attc', 'Kraken ATT C (medically down) all day Fri 17 (Inputs)', !!md.iid, `${md.type} · ${J(md.rec)} · ${md.why || ''}`, md.pic)
  const o = await addSimRow(p, W, di, 'oft', 'SS20 OFT'), s = await addLine(p, W, di, { kind: 'SC' })
  need(W, 'set.rows', 'Fri 17: an untimed OFT, + Wave → SC', o.ri >= 0 && s.wi >= 0, '')
  const kO = `s:${di}.oft.${o.ri}.p`, kOw = `s:${di}.oft.${o.ri}.w`, kS = `${di}.${s.wi}.0.0.p`
  let r = await armAt(p, W, di, `[data-slot="${kO}"]`, 'f20-oft')
  const j = one(r.c, JESTER), k = one(r.c, KRAKEN), m = one(r.c, MARLIN)
  W.rec('F20.leave', 'F20 = A19 — untimed OFT FCP: Jester\'s line names his leave, not the SANS words (absences first)', !!j && j.struck && !!j.printed && !/SANS/.test(j.printed), say1(r.c, JESTER), await crewPics(p, W, '#schedBoard', JESTER, 'f20-oft'))
  W.rec('F20.attc', 'A19 — untimed OFT FCP: Kraken\'s line names ATT C, not the SANS words', !!k && k.struck && !!k.printed && !/SANS/.test(k.printed), say1(r.c, KRAKEN))
  W.rec('F20.wso', 'A19 — untimed OFT FCP: Marlin (a SANS WSO) RECORDED', 'REC', say1(r.c, MARLIN))
  await disarm(p, W)
  r = await armAt(p, W, di, `[data-slot="${kS}"]`, 'f20-sc')
  const sansMen = r.c.pucks.filter(x => x.where === 'SANS Avail')
  W.rec('F20.sc', 'A19 / N5 — SC AM MAIN FCP: no SANS words for any SANS man; leave / ATT C / currency / WSO reasons still shown (RECORDED each)', sansMen.every(x => !/SANS/.test(x.printed)) && !!one(r.c, JESTER) && !!one(r.c, JESTER).printed && !/SANS/.test(one(r.c, JESTER).printed), sansMen.map(x => `${x.id}${x.struck ? '(x)' : ''}:"${x.printed}"`).join(' · ') + ' · head ' + r.c.head, await crewPics(p, W, '#schedBoard', JESTER, 'f20-sc'))
  await disarm(p, W)
  // already busy: Bolt on SC AM MAIN aircraft 1, then AM MAIN aircraft 2 armed
  const pk = await placeTap(p, W, di, `[data-slot="${kS}"]`, kS, BOLT, 'f20-bolt')
  need(W, 'set.bolt', 'Bolt tapped onto SC AM MAIN aircraft 1', pk.placed === BOLT, '')
  r = await armAt(p, W, di, `[data-slot="${di}.${s.wi}.0.1.p"]`, 'f20-busy')
  W.rec('F20.busy', 'A19 / N5 — SC AM MAIN aircraft 2 armed: Bolt (already on aircraft 1) — his other reason, no SANS words (RECORDED)', noSans(one(r.c, BOLT)) ? 'REC' : false, say1(r.c, BOLT), await crewPics(p, W, '#schedBoard', BOLT, 'f20-busy'))
  await disarm(p, W)
  r = await armAt(p, W, di, `[data-slot="${kOw}"]`, 'f20-oftw')
  W.rec('F20.rcp', 'A19 — untimed OFT RCP: Jester (leave), Kraken (ATT C), Otter (nothing filed), Marlin — RECORDED', 'REC', [JESTER, KRAKEN, OTTER, MARLIN].map(id => `${NAME[id]} ${say1(r.c, id)}`).join(' · '), await crewPics(p, W, '#schedBoard', OTTER, 'f20-oftw'))
  await disarm(p, W)
}

/* ---- F21 = A9: the published day — Ranger on SC MAIN, a flying AVALON and an untimed OFT; Jester (OFT only) on a flying
   AVALON and an ordinary flight; the warning list before and after publishing, then an amendment ---- */
S.F21 = async (p, W) => {
  await postR(p, W)
  const di = 4
  const f = await commit(p, W, ISO17, JESTER, ['oft'], 'all', 'f21-file')
  need(W, 'set.file', 'Saber files OFT only, all day, on Fri 17 for Jester', !!f.iid, J(f.rec), f.pic)
  await W5.closeSansWin(p, W)
  const sc = await addLine(p, W, di, { kind: 'SC' }), av = await addLine(p, W, di, { kind: 'AVALON' })
  const o = await addSimRow(p, W, di, 'oft', 'SS21 OFT'), t = await addLine(p, W, di, { cs: 'SS21T', to: '15:00', ld: '16:00' })
  need(W, 'set.rows', 'Fri 17: SC, AVALON, an untimed OFT, a flight 15:00–16:00', sc.wi >= 0 && av.wi >= 0 && o.ri >= 0 && t.wi >= 0, '')
  await L.openBoard(p, W, di)
  await W.press(p, L.B(`[data-safly="${di}.${av.wi}.0.0"]`), 'av-flies0'); await W.press(p, L.B(`[data-safly="${di}.${av.wi}.0.1"]`), 'av-flies1'); await sleep(400)
  const K = { rSC: `${di}.${sc.wi}.0.0.p`, rAV: `${di}.${av.wi}.0.0.p`, rO: `s:${di}.oft.${o.ri}.p`, jAV: `${di}.${av.wi}.0.1.p`, jT: `${di}.${t.wi}.0.0.p` }
  const placed = {}
  for (const [k, id] of [['rSC', RANGER], ['rAV', RANGER], ['rO', RANGER], ['jAV', JESTER], ['jT', JESTER]]) {
    const pk = await placeTap(p, W, di, `[data-slot="${K[k]}"]`, K[k], id, 'f21-' + k)
    placed[k] = { at: pk.placed, notes: pk.seen }
  }
  need(W, 'set.crew', 'Ranger on SC AM MAIN, AVALON MAIN 1 (Flies) and the untimed OFT; Jester on AVALON MAIN 2 (Flies) and the 15:00 flight', placed.rSC.at === RANGER && placed.rAV.at === RANGER && placed.rO.at.includes(RANGER) && placed.jAV.at === JESTER && placed.jT.at === JESTER, J(placed))
  W.rec('F21.notes', 'the notes as each was placed: none on a standby seat names SANS (D2584 Q4); RECORDED', !['rSC', 'rAV', 'jAV'].some(k => placed[k].notes.some(n => /SANS/.test(n))) ? 'REC' : false, J(placed))
  const w0 = await warnsOf(p, W, di, 'f21-before', 'Jester')
  const rngr0 = w0.rows.filter(x => /Ranger/.test(x))
  W.rec('F21.1', 'F21 = A9 — before publishing: no SANS line for a standby row (SC, AVALON); Jester\'s flight carries his amber "not offering Fly"; RECORDED exactly', !w0.sans.some(x => /SC|AVALON|AV\b/.test(x)) && w0.his.some(x => /SANS/.test(x) && /Fly/.test(x)), `${wSay(w0, 'Jester')} · Ranger's ${J(rngr0)} · all ${J(w0.rows)}`, w0.pic)
  const pk = {}; for (const k of Object.keys(K)) pk[k] = await pkAt(p, '#schedBoard', K[k])
  W.rec('F21.pucks', 'F21 — the pucks: no amber SANS mark on the standby rows; RECORDED each', 'REC', J(pk), [await puckPic(p, W, K.rAV, 'f21-rav'), await puckPic(p, W, K.jAV, 'f21-jav'), await puckPic(p, W, K.jT, 'f21-jt')].join(', '))
  await noteWatch(p)
  const lab = await L.publish(p, W, di)
  await sleep(900)
  const said = await notesSeen(p)
  W.rec('F21.2', 'F21 — published: what publishing says of Ranger on the untimed OFT with nothing filed — RECORDED exactly', lab !== 'no publish button' ? 'REC' : false, `button "${lab}" · notes ${J(said)}`, await W.pic(p, 'f21-published'))
  const w1 = await warnsOf(p, W, di, 'f21-after', 'Jester')
  W.rec('F21.3', 'F21 — the issued day\'s warning list: still no SANS line for a standby row', !w1.sans.some(x => /SC|AVALON|AV\b/.test(x)), `${wSay(w1, 'Jester')} · all ${J(w1.rows)}`, w1.pic)
  // an amendment: a ground row added, then the warning list again
  const g = await L.groundRow(p, W, di, 'SS21 AMD', '16:30', '17:00', null)
  const w2 = await warnsOf(p, W, di, 'f21-amend', 'Jester')
  W.rec('F21.4', 'F21 — an amendment opened (a ground row added): no SANS line for a standby row in its warning list', !!g.row && !w2.sans.some(x => /SC|AVALON|AV\b/.test(x)), `row ${J(g.row)} · pending ${J(await L.pendingOf(p, di))} · ${wSay(w2, 'Jester')} · all ${J(w2.rows)}`, w2.pic)
  await L.closeBoard(p, W)
  await L.go(p, 'viewsched')
  const v = await p.evaluate(() => ({ sans: (document.body.innerText.match(/[^\n]*SANS[^\n]*/g) || []).slice(0, 6) }))
  W.rec('F21.5', 'F21 — View-only Sched as Saber: RECORDED any SANS words on the issued face', 'REC', J(v), await W.pic(p, 'f21-view-saber'))
  await Z.asR(p, W)
  await L.go(p, 'viewsched').catch(() => {})
  const v2 = await p.evaluate(() => ({ page: window.CURPAGE, sans: (document.body.innerText.match(/[^\n]*SANS[^\n]*/g) || []).slice(0, 6) }))
  W.rec('F21.6', 'F21 — Ranger signed in, his schedule: RECORDED any SANS words', 'REC', J(v2), await W.pic(p, 'f21-view-ranger'))
  const b = await Z.bell(p, W, 'f21-bell')
  W.rec('F21.7', 'F21 / lesson 32 — Ranger\'s bell: counts Fri 17 for the untimed OFT (never for SC / AVALON alone)', !!b.rem && /Fri 17/.test(b.rem.body), Z.sayB(b), b.pic)
}

/* ---- F22: tap-to-plan, board and Edit Schedule — SC MAIN vs untimed OFT, the notes the same as the desktop's ---- */
S.F22 = async (p, W) => {
  await postR(p, W)
  const di = 4
  const s = await addLine(p, W, di, { kind: 'SC' }), o = await addSimRow(p, W, di, 'oft', 'SS22 OFT')
  need(W, 'set.rows', 'Fri 17: + Wave → SC, an untimed OFT', s.wi >= 0 && o.ri >= 0, '')
  const kS = `${di}.${s.wi}.0.0.p`, kO = `s:${di}.oft.${o.ri}.p`, kS2 = `${di}.${s.wi}.0.1.p`, kOw = `s:${di}.oft.${o.ri}.w`
  let pk = await placeTap(p, W, di, `[data-slot="${kS}"]`, kS, RANGER, 'f22-sc')
  W.rec('F22.1', 'F22 — board: SC MAIN tapped, Ranger tapped: placed; no SANS words in the note (Q4)', pk.placed === RANGER && !pk.seen.some(n => /SANS/.test(n)), `before the press ${say1(pk.c, RANGER)} · notes ${J(pk.seen)} · ${pk.fits}`, pk.notePic)
  pk = await placeTap(p, W, di, `[data-slot="${kO}"]`, kO, RANGER, 'f22-oft')
  W.rec('F22.2', `F22 — board: the untimed OFT FCP tapped, Ranger tapped: placed; the note "Ranger — ${RNEW}", inside the screen`, pk.placed.includes(RANGER) && pk.seen.includes('Ranger — ' + RNEW) && pk.fits === 'fits', `before the press ${say1(pk.c, RANGER)} · notes ${J(pk.seen)} · ${pk.fits}`, pk.notePic)
  await L.closeBoard(p, W)
  let w = await weekArm(p, W, kS2, 'f22-wsc')
  if (w.armed) {
    await noteWatch(p)
    const r = await weekPick(p, W, kS2, JESTER, 'f22-wsc')
    const seen = await notesSeen(p)
    W.rec('F22.3', 'F22 — Edit Schedule: SC MAIN 2 tapped in the week, Jester tapped: placed; no SANS words', r.placed === JESTER && !seen.some(n => /SANS/.test(n)), `before ${say1(w.c, JESTER)} · notes ${J(seen)}`, r.notePic)
  } else W.rec('F22.3', 'F22 — Edit Schedule: SC MAIN 2 tapped in the week', 'NW', w.why || 'not armed', await W.pic(p, 'f22-wsc'))
  await p.keyboard.press('Escape'); await sleep(300)
  if (W.isPhone) await A.S.crewPanelClose(p, W).catch(() => {})
  w = await X.weekArmAt(p, W, `[data-fill="s:${di}.oft.${o.ri}.+"]`, 'f22-woft')
  if (w.armed) {
    await noteWatch(p)
    const l = p.locator(`.ros-body .rpuck[data-person="${OTTER}"]:visible`).first()
    await l.scrollIntoViewIfNeeded().catch(() => {})
    if (W.isPhone) { await l.tap(); await sleep(60); await p.screenshot({ path: X.OUT + `/taps/${W.scn}-f22-woft-pick-now-phone.png` }).catch(() => {}) } else await l.click()
    await sleep(600)
    const seen = await notesSeen(p)
    const pic = await W.pic(p, 'f22-woft-note')
    W.rec('F22.4', `F22 — Edit Schedule: the untimed OFT's RCP tapped in the week, Otter tapped: placed; note "Otter — ${TODAYW}"`, (await holdsAt(p, kOw)).includes(OTTER) && seen.includes('Otter — ' + TODAYW), `before ${say1(w.c, OTTER)} · notes ${J(seen)} · ${await noteFits(p)}`, pic)
  } else W.rec('F22.4', 'F22 — Edit Schedule: the OFT RCP tapped in the week', 'NW', w.why || 'not armed', await W.pic(p, 'f22-woft'))
}

/* ---- the plain-user round (F23) ---- */
S.PU = async (p, W) => {
  await postR(p, W)
  await L.go(p, 'editsched')
  W.rec('PU.1', 'Saber on Edit Schedule', 'REC', '', await W.pic(p, 'pu-1-editsched'))
  const di = 4
  const a = await addLine(p, W, di, { cs: 'SSPU' })
  W.rec('PU.2', 'Fri 17: + Wave → Flying wave on the board', a.wi >= 0, J(a), await W.pic(p, 'pu-2-flying'))
  const s = await addLine(p, W, di, { kind: 'SC' })
  W.rec('PU.3', '+ Wave → SC', s.wi >= 0 && !!s.f, J(s.f), await W.pic(p, 'pu-3-sc'))
  const o = await addSimRow(p, W, di, 'oft', 'SSPU OFT'), m = await addSimRow(p, W, di, 'amt', 'SSPU AMT')
  W.rec('PU.4', 'an OFT row and an AMT row added', o.ri >= 0 && m.ri >= 0, J({ o: o.r, m: m.r }), await W.pic(p, 'pu-4-sims'))
  const kF = `${di}.${a.wi}.0.0.p`, kS = `${di}.${s.wi}.0.0.p`, kO = `s:${di}.oft.${o.ri}.p`, kM = `s:${di}.amt.${m.ri}.w`
  let pk = await placeTap(p, W, di, `[data-slot="${kF}"]`, kF, ACE, 'pu-5-ace')
  W.rec('PU.5', 'Ace dropped into the flying line', pk.placed === ACE, `notes ${J(pk.seen)}`, pk.notePic)
  pk = await placeTap(p, W, di, `[data-slot="${kS}"]`, kS, JESTER, 'pu-6-jester')
  W.rec('PU.6', 'Jester (Ipman, SANS) dropped onto SC MAIN: placed, no SANS words', pk.placed === JESTER && !pk.seen.some(n => /SANS/.test(n)), `before ${say1(pk.c, JESTER)} · notes ${J(pk.seen)}`, pk.notePic)
  W.rec('PU.6u', 'Undo across the SC drop', 'REC', '', '')
  await sbUndo(p, W); const u1 = await holdsAt(p, kS)
  await sbRedo(p, W); const r1 = await holdsAt(p, kS)
  W.rec('PU.7', 'Undo takes Jester off SC MAIN, Redo puts him back', u1 === '' && r1 === JESTER, `undo "${u1}" · redo "${r1}"`, await W.pic(p, 'pu-7-sc-redo'))
  pk = await placeTap(p, W, di, `[data-slot="${kO}"]`, kO, RANGER, 'pu-8-ranger')
  W.rec('PU.8', `Ranger dropped onto the untimed OFT: placed; note "Ranger — ${RNEW}"`, pk.placed.includes(RANGER) && pk.seen.includes('Ranger — ' + RNEW), `before ${say1(pk.c, RANGER)} · notes ${J(pk.seen)}`, pk.notePic)
  await sbUndo(p, W); const u2 = await holdsAt(p, kO)
  await sbRedo(p, W); const r2 = await holdsAt(p, kO)
  W.rec('PU.9', 'Undo takes Ranger off the untimed OFT, Redo puts him back', !u2.includes(RANGER) && r2.includes(RANGER), `undo ${u2} · redo ${r2}`, await W.pic(p, 'pu-9-oft-redo'))
  pk = await placeTap(p, W, di, `[data-slot="${kM}"]`, kM, OTTER, 'pu-10-otter')
  W.rec('PU.10', 'Otter (SANS WSO) onto the untimed AMT\'s RCP: placed; note RECORDED', pk.placed.includes(OTTER) ? 'REC' : false, `notes ${J(pk.seen)}`, pk.notePic)
  await L.typeBox(p, W, `[data-bfld="ff:${di}.${a.wi}.0.to"]`, '21:00'); await L.typeBox(p, W, `[data-bfld="ff:${di}.${a.wi}.0.ld"]`, '22:00')
  const tm = await p.evaluate(([i, w]) => { const x = window.DAYS[i].waves[w].formations[0]; return { to: x.to, ld: x.ld } }, [di, a.wi])
  W.rec('PU.11', 'times typed on the flying line 21:00 / 22:00', tm.to === '21:00' && tm.ld === '22:00', J(tm), await W.pic(p, 'pu-11-times'))
  const c1 = await Z.cx(p, W, di, `[data-srcx="${di}.oft.${o.ri}"]`, true, 'pu-12')
  const cxv = await X.simRow(p, di, 'oft', o.ri)
  W.rec('PU.12', 'the OFT row cancelled (CX, reason WX)', c1.ok && !!cxv.cx, J({ c1: c1.why || 'ok', cx: cxv.cx, cxr: cxv.cxr }), c1.pic)
  const c2 = await Z.cx(p, W, di, `[data-srcx="${di}.oft.${o.ri}"]`, false, 'pu-13')
  const cxv2 = await X.simRow(p, di, 'oft', o.ri)
  W.rec('PU.13', 'and restored (Un-cancel)', c2.ok && !cxv2.cx, J({ c2: c2.why || 'ok', cx: cxv2.cx }), c2.pic)
  await L.closeBoard(p, W)
  W.rec('PU.14', 'the board closed by ✓ Done', !(await p.locator('#schedBoard:visible').count()), '', await W.pic(p, 'pu-14-done'))
  // the crew panel opened and closed on Edit Schedule
  await L.go(p, 'editsched')
  const cp = await A.S.crewPanelTo(p, W, 'fri').catch(e => 'ERR ' + e.message)
  W.rec('PU.15', 'Edit Schedule\'s crew panel opened (Fri 17)', 'REC', J(cp), await W.pic(p, 'pu-15-crew'))
  await A.S.crewPanelClose(p, W).catch(() => {})
  W.rec('PU.16', 'and closed', 'REC', '', await W.pic(p, 'pu-16-crew-closed'))
  await L.openBoard(p, W, di)
  W.rec('PU.17', 'the Scheduler Board opened for Fri 17', (await p.evaluate(() => window.SBDAY)) === di, '', await W.pic(p, 'pu-17-board'))
  const w = await warnsOf(p, W, di, 'pu-18', 'Jester')
  W.rec('PU.18', 'the day\'s warning list: no SANS line for the SC row (RECORDED in full)', !w.sans.some(x => /SC/.test(x)) ? 'REC' : false, wSay(w, 'Jester') + ' · all ' + J(w.rows), w.pic)
  await L.closeBoard(p, W)
  W.rec('PU.19', 'closed with ✓ Done', !(await p.locator('#schedBoard:visible').count()), '', await W.pic(p, 'pu-19-done'))
  await Z.asR(p, W)
  const b = await Z.bell(p, W, 'pu-20-bell')
  W.rec('PU.20', 'Ranger opens the bell: the SANS reminder names Fri 17, ends "Tap to file for availability."', !!b.rem && /Fri 17/.test(b.rem.body) && /Tap to file for availability\.$/.test(b.rem.body), Z.sayB(b), b.pic)
  if (b.rem) {
    const t = await Z.X.bellTap(p, W, b.rem.id, 'pu-21')
    W.rec('PU.21', 'tap the reminder: the SANS calendar opens on its day', t.page === 'inputs' && /Jul/.test(t.month || ''), J(t), t.pic)
    await T.closeAll(p, W)
    W.rec('PU.22', 'what it opened, closed', !(await p.locator('[data-testid="win-sansday"]:visible').count()), '', await W.pic(p, 'pu-22-closed'))
  }
}

const fn = S[SCN]
if (!fn) { console.log('no such scenario', SCN); process.exit(1) }
await run(SCN, SZ, fn)
X.saveRaw(`${SCN}-${SZ}-${process.env.SSSA_RUN || 'run1'}`)
const c = k => L.results.filter(r => r.ok === k).length
console.log(`DONE ${SCN} ${SZ}: ${L.results.length} rows · PASS ${c(true)} · FAIL ${c(false)} · RECORDED ${c('REC')} · NOT WALKED ${c('NW')}`)
process.exit(0)
