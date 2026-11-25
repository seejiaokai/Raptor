// sss-r1 — the host's re-walk of R1's fix (chat 182's 7b203d113), chat 185, 25 Nov 26: a SANS man whose filing does not
// offer the sim ("Fly only"), planned on an untimed OFT and an untimed AMT — the crew list, the note, the warning list,
// his puck's amber "A", on the board and on Edit Schedule, beside the untimed flight that already warned (lesson 32).
// Walker A's W1d (sss-w1A.mjs) walked the build before the fix; this re-runs its F1 / F2 part on the branch head's build.
//   W2_URL=http://localhost:<port>/ W2_OUT=<pictures> SSSA_RUN=<run> SZ=d|p node scripts/handpass/sss-r1.mjs
import './sss-w1A-env.mjs'
const X = await import('./sss-w1A-lib.mjs')
const { Z, L, W5, RANGER, IPMAN, D, sleep, J, addLine, who, say1, commit, need, run, NOFF, addSimRow, armAt, pickNow,
  holdsAt, warnsOf, wSay, noteFits, A } = X
const SZ = process.env.SZ || 'd'
console.log(`VERSION sss-r1 1 · ${SZ} · bundle ${process.env.W2_URL} · out ${X.OUT}`)
const JESTER = IPMAN, ISO17 = '2026-07-17'
const one = (c, id) => who(c, id)[0] || null
const pkAt = (p, root, key) => p.evaluate(([root, k]) => [...document.querySelectorAll(`${root} [data-slot="${k}"] .puck, ${root} [data-fill="${k}"] .puck, ${root} [data-slot^="${k}"] .puck`)].filter(e => e.getBoundingClientRect().width > 0).map(e => ({ cls: String(e.className), txt: (e.textContent || '').replace(/\s+/g, ' ').trim(), chips: [...e.querySelectorAll('*')].map(x => String(x.className) + (x.textContent && x.textContent.trim().length < 4 ? ':' + x.textContent.trim() : '')).filter(Boolean) })), [root, key])
const amber = arr => arr.some(x => x.chips.some(c => /:A$/.test(c)))
async function placeTap(p, W, di, sel, key, id, tag) {
  const r = await armAt(p, W, di, sel, tag)
  if (!r.armed) return { armed: null, placed: 'not armed', seen: [], note: '' }
  const pk = await pickNow(p, W, id, tag)
  await W5.boardDrawer(p, W, false)
  return { ...pk, armed: r.armed, c: r.c, placed: await holdsAt(p, key) }
}

async function R1(p, W) {
  await Z.post(p, W, RANGER, D[17], 'set.post')
  for (const [id, k, what] of [[RANGER, ['fly'], 'Fly all day'], [JESTER, ['oft'], 'OFT all day']]) {
    const f = await commit(p, W, ISO17, id, k, 'all', 'file-' + id)
    need(W, 'set.file.' + id, `Saber files for ${id === RANGER ? 'Ranger' : 'Jester'} on Fri 17: ${what}`, !!f.iid, J(f.rec), f.pic)
    await W5.closeSansWin(p, W)
  }
  const di = 4
  const fu = await addLine(p, W, di, { cs: 'SSFU' })
  const ou = await addSimRow(p, W, di, 'oft', 'SS OFT U'), au = await addSimRow(p, W, di, 'amt', 'SS AMT U')
  need(W, 'set.rows', 'Fri 17: flight SSFU, OFT "SS OFT U", AMT "SS AMT U", all untimed', fu.wi >= 0 && ou.ri >= 0 && au.ri >= 0, J({ ou, au }))
  const kO = `s:4.oft.${ou.ri}.p`, kA = `s:4.amt.${au.ri}`, kF = `4.${fu.wi}.0.0.p`
  // 1. the board: Ranger tapped into the untimed OFT's front seat
  let pk = await placeTap(p, W, di, `[data-slot="${kO}"]`, kO, RANGER, 'r1-oft')
  W.rec('R1.oft.cl', `board — the untimed OFT's FCP armed: Ranger reads "${NOFF('OFT')}"`, !!one(pk.c, RANGER) && one(pk.c, RANGER).printed === NOFF('OFT'), say1(pk.c, RANGER), pk.notePic)
  W.rec('R1.oft.note', 'board — Ranger placed (never refused); the note carries the warning line, as an untimed flight\'s does: "Ranger — SANS: not offering OFT today. Planned on Sim SS OFT U"', /bane/.test(pk.placed) && pk.seen.some(x => x.includes('SANS: not offering OFT today. Planned on Sim SS OFT U')), `seat ${pk.placed} · notes ${J(pk.seen)} · ${pk.fits}`, pk.notePic)
  let w = await warnsOf(p, W, di, 'r1-oft', 'Ranger')
  W.rec('R1.oft.warn', 'board — the warning list names Ranger: "SANS: not offering OFT today. Planned on Sim SS OFT U"', w.his.some(x => /SANS: not offering OFT today/.test(x) && /SS OFT U/.test(x)), wSay(w, 'Ranger') + ' · all ' + J(w.rows), w.pic)
  let pu = await pkAt(p, '#schedBoard', kO)
  const bp = p.locator(`#schedBoard [data-slot="${kO}"]`).first()
  W.rec('R1.oft.puck', 'board — his puck on the OFT wears the amber "A"', amber(pu), J(pu), (await bp.count()) ? await W5.clip(p, W, bp, 'r1-oft-puck', 30) : '')
  // 2. Edit Schedule's week: Ranger tapped into the untimed AMT (its "+"), the note there
  await L.closeBoard(p, W)
  const wa = await X.weekArmAt(p, W, `[data-fill="${kA}.+"]`, 'r1-amt-week')
  W.rec('R1.amt.cl', `Edit Schedule — the untimed AMT's "+" pressed in the week: Ranger reads "${NOFF('AMT')}"`, !!wa.armed && !!one(wa.c, RANGER) && one(wa.c, RANGER).printed === NOFF('AMT'), `armed ${wa.armed} · ${wa.c ? say1(wa.c, RANGER) : wa.why}`, await W.pic(p, 'r1-amt-week-armed'))
  if (wa.armed) {
    const wp = await A.weekPick(p, W, wa.armed, RANGER, 'r1-amt-week')
    W.rec('R1.amt.note', 'Edit Schedule — Ranger placed in the AMT; the note carries the warning line: "Ranger — SANS: not offering AMT today. Planned on Sim SS AMT U"', /bane/.test(J(await X.simRow(p, 4, 'amt', au.ri))) && (wp.note || '').includes('SANS: not offering AMT today. Planned on Sim SS AMT U'), `note "${wp.note}" · row ${J(await X.simRow(p, 4, 'amt', au.ri))}`, wp.notePic)
  }
  await p.keyboard.press('Escape'); await sleep(300)
  if (W.isPhone) await A.S.crewPanelClose(p, W).catch(() => {})
  // the week's own pucks: the amber "A" on both sim rows
  const wkO = await pkAt(p, '#eWeek', kO), wkA = await pkAt(p, '#eWeek', kA)
  const wz = p.locator(`#eWeek [data-slot^="s:4.oft.${ou.ri}"], #eWeek [data-fill^="s:4.oft.${ou.ri}"]`).first()
  if (await wz.count()) await wz.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  W.rec('R1.week.puck', 'Edit Schedule week — Ranger\'s pucks on the OFT and the AMT wear the amber "A"', amber(wkO) && amber(wkA), J({ oft: wkO, amt: wkA }), await W.pic(p, 'r1-week-pucks'))
  // 3. the board's warning list with both: one line a sim; the untimed flight beside it (Jester "OFT only") as before
  pk = await placeTap(p, W, di, `[data-slot="${kF}"]`, kF, JESTER, 'r1-fl')
  w = await warnsOf(p, W, di, 'r1-all', 'Ranger')
  const wj = w.rows.filter(x => x.includes('Jester'))
  W.rec('R1.all.warn', 'board — the warning list: Ranger\'s OFT and AMT lines, and Jester\'s untimed flight line (as before)', w.his.some(x => /not offering OFT/.test(x)) && w.his.some(x => /not offering AMT/.test(x)) && wj.some(x => /not offering Fly today/.test(x)), wSay(w, 'Ranger') + ' · Jester\'s: ' + J(wj), w.pic)
  await L.closeBoard(p, W)
  // 4. his bell (as Ranger): he filed, so no reminder; recorded beside the lists (lesson 32)
  await Z.asR(p, W)
  const b = await Z.bell(p, W, 'r1-bell')
  W.rec('R1.bell', 'Ranger\'s bell: no SANS reminder (he filed) — RECORDED beside the lists', 'REC', Z.sayB(b), b.pic)
}

await run('R1', SZ, R1)
X.saveRaw(`R1-${SZ}-${process.env.SSSA_RUN || 'run1'}`)
const c = k => L.results.filter(r => r.ok === k).length
console.log(`DONE R1 ${SZ}: ${L.results.length} rows · PASS ${c(true)} · FAIL ${c(false)} · RECORDED ${c('REC')}`)
process.exit(0)
