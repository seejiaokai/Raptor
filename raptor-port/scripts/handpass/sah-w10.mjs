// Walker w10 — the FULL check of claude/allavail-sans-postout-141 (D2340, D2341, D2342, D2346): hiding across publication
// (S11), shared filings (S12), edits (S13), other inputs (S14), the take-back line (S16), persistence (S18), the seat's
// restrictions (S22). Astra's scenarios: docs/superpowers/briefs/2026-11-23-sans-ahead-full-scenarios-astra.md; the host's
// brief: docs/superpowers/briefs/2026-11-23-sans-ahead-full-walk-brief.md. Ranger (bane, member us/us) is the man posted
// out as SANS; Hex (rocky) the second. Their own demo items (read first, sah-w10-probe): Ranger Mon 13, Thu 16, Mon 20 (two
// waves), Thu 23; Hex Mon 13–Thu 16, Mon 20, Wed 22. Fri 17, Sat 18, Sun 19 are clear for both.
// Run from raptor-port/ (the build served on 4400):  W10_RUN=run1 ONLY=s13d,s13p node scripts/handpass/sah-w10.mjs
import './sah-w10-env.mjs'
const T = await import('./sah-w10-lib.mjs')
const { L, W5, S, run, save, RANGER, HEX, sleep, J, clean } = T
const VERSION = 'sah-w10 v1'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
console.log(VERSION, L.URL_, L.OUT, ONLY.join(','))
const FRI = 4, SAT = 5
const D17 = '2026-07-17', D18 = '2026-07-18', D19 = '2026-07-19', D20 = '2026-07-20', D21 = '2026-07-21', D22 = '2026-07-22'

async function post(p, W, id, iso, tag) {
  const po = await L.postOut(p, W, id, iso, tag)
  const ok = new RegExp(`${+iso.slice(8, 10)} Jul: becomes SANS`).test(po.line)
  W.rec(tag, `Saber: Leave War, ${id === RANGER ? 'Ranger' : 'Hex'}'s ${iso.slice(8)} Jul cell → ⋯ → Post out → SANS → Post out (read back)`, ok, `sheet line "${po.line}" · record ${J(po.after)}`, po.pic)
  return ok
}
/* the SANS day read and judged: who must show (`want` callsigns), who must not (`not`) */
async function day(p, W, iso, want, not, tag, what) {
  const s = await T.sansRead(p, W, iso, tag)
  const ok = want.every(w => s.has(w)) && not.every(w => !s.has(w)) && s.n === want.length
  W.rec(tag, `${what}: SANS ${iso.slice(8)} Jul shows ${want.join(' + ') || 'nobody'}${not.length ? ', never ' + not.join(' / ') : ''}`, ok, `${T.cellLine(s.cell)} · ${T.rowsLine(s.day)}`, s.pic)
  return s
}

/* ================= S12: one person hidden within a shared filing ================= */
async function s12(p, W) {
  if (!(await post(p, W, RANGER, D17, 's12-01')) || !(await post(p, W, HEX, D17, 's12-02'))) return
  const of = await W5.addSim(p, W, FRI, 'oft', 'OFTS', '09:00', '10:00')
  W.rec('s12-03', 'Fri 17 board: + OFT row OFTS 09:00–10:00 (read back; the armed seat to read)', !!(of.r && of.r.str), J(of.r))
  await L.closeBoard(p, W)
  const f = await T.file(p, W, D17, [RANGER, HEX], ['fly', 'oft', 'amt'], 'all', 's12-04')
  W.rec('s12-04', 'Saber: SANS → Fri 17 → + Commitment → Several people: Ranger + Hex, F/O/A, All day → Add: ONE shared input (read back)', !!(f.made && /bane/.test(f.made.people) && /rocky/.test(f.made.people)), `made ${J(f.made)} ${f.refused}`, f.pic)
  if (!f.made) return
  const seat = `[data-slot="s:${FRI}.oft.${of.ri}.p"]`
  const stage = async (n, label, rIn, hIn) => {
    const tag = `s12-${n}`
    const want = [rIn && 'Ranger', hIn && 'Hex'].filter(Boolean), not = [!rIn && 'Ranger', !hIn && 'Hex'].filter(Boolean)
    const s = await day(p, W, D17, want, not, tag + 'a', `${label} — the SANS calendar's opened day`)
    const fig = s.cell && s.cell.f ? s.cell.f.replace(/\D/g, '') : ''
    W.rec(tag + 'b', `${label} — the month's F count on 17 reads pilots ${rIn ? 1 : 0} · WSOs ${hIn ? 1 : 0}`, fig === `${rIn ? 1 : 0}${hIn ? 1 : 0}`, T.cellLine(s.cell), s.pic)
    for (const [id, nm, on] of [[RANGER, 'Ranger', rIn], [HEX, 'Hex', hIn]]) {
      const wk = await T.weekCrewOf(p, W, 'fri', id, `${tag}c-${nm}`)
      W.rec(`${tag}c-${nm}`, `${label} — Edit Schedule crew list (${wk.day}): ${nm} ${on ? 'in SANS Avail' : 'NOT in SANS Avail'}`, T.inSansAvail(wk.c) === on, T.crewWhere(wk.c), wk.pic)
      const bd = await T.boardCrewOf(p, W, FRI, id, `${tag}d-${nm}`)
      W.rec(`${tag}d-${nm}`, `${label} — Scheduler Board crew list Fri 17: ${nm} ${on ? 'in SANS Avail' : 'NOT in SANS Avail'}`, T.inSansAvail(bd.c) === on, T.crewWhere(bd.c), bd.pic)
    }
    await L.openBoard(p, W, FRI)
    const r = await W5.armRead(p, W, seat, `${tag}e`)
    const cr = await W5.crewOf(p, '#schedBoard', RANGER), ch = await W5.crewOf(p, '#schedBoard', HEX)
    const sr = T.crewWhere(cr), sh = T.crewWhere(ch)
    W.rec(`${tag}e`, `${label} — board Fri 17, the OFTS pilot seat armed (${r.armed}): Ranger ${rIn ? 'offered as SANS (SANS Avail)' : 'ordinary, no SANS words'}; Hex ${hIn ? 'in SANS Avail' : 'no SANS offer'}`, !!r.armed && T.inSansAvail(cr) === rIn && T.inSansAvail(ch) === hIn && (rIn || !/SANS/.test(sr)), `Ranger: ${sr} · Hex: ${sh}`, r.pic)
    await W5.disarm(p, W); await L.closeBoard(p, W)
  }
  await stage('05', 'both SANS on 17', true, true)
  let m = await T.movePo(p, W, RANGER, D17, D18, 's12-06')
  W.rec('s12-06', "Saber: Ranger's posted-out sheet → PO from moved to Sat 18 (Hex's left on 17)", m.ok && /18 Jul/.test(m.line), `${m.kind} · "${m.before}" → "${m.line}" ${m.err}`, m.pic)
  await stage('07', 'Ranger moved to 18, Hex still 17', false, true)
  m = await T.movePo(p, W, HEX, D17, D18, 's12-08')
  W.rec('s12-08', "Saber: Hex's posted-out sheet → PO from moved to Sat 18", m.ok && /18 Jul/.test(m.line), `${m.kind} · "${m.before}" → "${m.line}" ${m.err}`, m.pic)
  await stage('09', 'both moved to 18', false, false)
  m = await T.movePo(p, W, RANGER, D18, D17, 's12-10')
  W.rec('s12-10', "Saber: Ranger's PO from moved back to Fri 17 (Hex's stays 18)", m.ok && /17 Jul/.test(m.line), `${m.kind} · "${m.before}" → "${m.line}" ${m.err}`, m.pic)
  await stage('11', 'Ranger back on 17, Hex on 18', true, false)
  m = await T.movePo(p, W, HEX, D18, D17, 's12-12')
  W.rec('s12-12', "Saber: Hex's PO from moved back to Fri 17", m.ok && /17 Jul/.test(m.line), `${m.kind} · "${m.before}" → "${m.line}" ${m.err}`, m.pic)
  await stage('13', 'both back on 17', true, true)
  const after = await T.sansInputs(p)
  W.rec('s12-14', 'one shared record still, nothing duplicated (window.INPUTS read)', after.length === 1 && after[0].iid === f.iid, J(after))
}

/* S12x — the one reader stage 07 left out: Hex's line on Fri 17 OPENED while Ranger's share is hidden (the input's own
   window names its people), and the line's small print, read */
async function s12x(p, W) {
  if (!(await post(p, W, RANGER, D17, 's12x-01')) || !(await post(p, W, HEX, D17, 's12x-02'))) return
  const f = await T.file(p, W, D17, [RANGER, HEX], ['fly', 'oft', 'amt'], 'all', 's12x-03')
  W.rec('s12x-03', 'Saber: one shared offer for Ranger + Hex on Fri 17 (read back)', !!f.made, J(f.made) + ' ' + f.refused, f.pic)
  if (!f.made) return
  const m = await T.movePo(p, W, RANGER, D17, D18, 's12x-04')
  W.rec('s12x-04', "Saber: Ranger's PO from moved to Sat 18 (Hex's stays 17)", m.ok && /18 Jul/.test(m.line), `"${m.before}" → "${m.line}"`, m.pic)
  const s = await T.sansRead(p, W, D17, 's12x-05')
  const placed = s.day && s.day.rows[0] ? s.day.rows[0].placed : ''
  W.rec('s12x-05', "Fri 17 opened: Hex's line alone; its small print must not reveal a hidden second man (a count is a reveal, Astra's S12)", s.n === 1 && s.has('Hex') && !/2 people|Ranger/.test(placed), `${T.rowsLine(s.day)} · small print "${placed}"`, await W5.clip(p, W, '[data-testid="win-sansday"] .sd-row', 's12x-05'))
  const row = p.locator(`[data-testid="win-sansday"] [data-popiid="${f.iid}"] [data-testid="sd-open"]`).first()
  await W.press(p, row, 'sd-open')
  await p.waitForSelector('[data-testid="win-inputedit"]', { timeout: 6000 }).catch(() => {})
  await sleep(500)
  const w = await p.evaluate(() => { const e = [...document.querySelectorAll('[data-testid="win-inputedit"]')].find(x => x.getBoundingClientRect().width > 0); if (!e) return null; const P = window.PEOPLE; const ids = [...e.querySelectorAll('[data-person], [data-pp]')].filter(x => x.getBoundingClientRect().width > 0 && (!x.dataset.pp || x.classList.contains('on'))).map(x => x.getAttribute('data-person') || x.dataset.pp); return { title: ((e.querySelector('.win-ttl, .fw-title, h2, header') || {}).textContent || '').replace(/\s+/g, ' ').trim(), names: [...new Set(ids)].map(i => (P[i] || {}).cs || i), text: (e.textContent || '').replace(/\s+/g, ' ').slice(0, 260) } })
  W.rec('s12x-06', "Hex's line opened (the shared input's own window): does it name Ranger, whose share is hidden on 17? (a name is a reveal — the host's S12)", !!w && !w.names.includes('Ranger') && !/Ranger/.test(w.title), J(w), await W.pic(p, 's12x-06'))
  await T.closeAll(p, W)
}

/* ================= S13: an offer edited while partly hidden ================= */
async function s13(p, W) {
  if (!(await post(p, W, RANGER, D17, 's13-01'))) return
  const f = await T.file(p, W, D17, RANGER, ['fly', 'oft', 'amt'], 'all', 's13-02', { endIso: D21 })
  W.rec('s13-02', 'Saber: SANS → Fri 17 → + Commitment → Ranger, F/O/A, All day, a tap on 21 in its calendar → Add: one input 17–21 Jul (read back)', !!(f.made && f.made.date === 'Jul 17' && f.made.endDate === 'Jul 21'), `calendar read "${f.read}" · ${J(f.made)} ${f.refused}`, f.pic)
  if (!f.made) return
  let m = await T.movePo(p, W, RANGER, D17, D20, 's13-03')
  W.rec('s13-03', "Saber: Ranger's PO from moved to Mon 20", m.ok && /20 Jul/.test(m.line), `"${m.before}" → "${m.line}" ${m.err}`, m.pic)
  for (const d of [D17, D18, D19]) await day(p, W, d, [], ['Ranger'], `s13-04-${d.slice(8)}`, 'posting moved to 20')
  for (const d of [D20, D21]) await day(p, W, d, ['Ranger'], [], `s13-05-${d.slice(8)}`, 'posting moved to 20')
  /* the surviving offer opened from Mon 20 and edited: remarks and hours */
  await T.sansRead(p, W, D20, 's13-06-open')
  const row = p.locator(`[data-testid="win-sansday"] [data-popiid="${f.iid}"] [data-testid="sd-open"]`).first()
  if (!(await row.count())) { W.rec('s13-06', 'the surviving offer on Mon 20 opened', false, 'no line for it'); return }
  await W.press(p, row, 'sd-open')
  await p.waitForSelector('#inpEditSave', { timeout: 6000 })
  const before = await T.inp(p, f.iid)
  await W.press(p, '#inpEditSpan [data-span="custom"]', 'span-custom')
  await p.fill('#inpEditStart', '09:00'); await p.fill('#inpEditEnd', '12:00')
  await p.fill('#inpEditRmk', 'S13 edit')
  const dates = clean(await p.locator('#inpEditPop .rc-read').first().textContent().catch(() => ''))
  const pic0 = await W.pic(p, 's13-06-edit')
  await W.press(p, '#inpEditSave:visible', 'save'); await sleep(900)
  const still = await p.locator('[data-testid="win-inputedit"]:visible').count()
  const warn = still ? clean(await p.locator('[data-testid="win-inputedit"]').first().innerText().catch(() => '')).slice(0, 250) : ''
  const after = await T.inp(p, f.iid)
  const pic1 = await W.pic(p, 's13-06-saved')
  W.rec('s13-06', 'Saber: the offer opened from Mon 20 → 09:00–12:00, remarks "S13 edit" → Save: saved, its dates still 17–21 Jul (nothing hidden discarded)', !still && !!after && after.date === 'Jul 17' && after.endDate === 'Jul 21' && after.remarks === 'S13 edit', `window dates "${dates}" · before ${J(before)} · after ${J(after)}${still ? ' · WINDOW STILL OPEN: ' + warn : ''}`, pic0 + ', ' + pic1)
  if (still) await T.closeAll(p, W)
  m = await T.movePo(p, W, RANGER, D20, D17, 's13-07')
  W.rec('s13-07', "Saber: Ranger's PO from moved back to Fri 17", m.ok && /17 Jul/.test(m.line), `"${m.before}" → "${m.line}" ${m.err}`, m.pic)
  for (const d of [D17, D18, D19, D20, D21]) {
    const s = await T.sansRead(p, W, d, `s13-08-${d.slice(8)}`)
    const r = s.day ? s.day.rows.filter(x => x.who === 'Ranger') : []
    W.rec(`s13-08-${d.slice(8)}`, `back on 17: ${d.slice(8)} Jul shows Ranger ONCE, with the edit (09:00–12:00, "S13 edit")`, r.length === 1 && /09:00/.test(r[0].hours) && /12:00/.test(r[0].hours) && r[0].rmk === 'S13 edit', `${T.cellLine(s.cell)} · ${T.rowsLine(s.day)}`, s.pic)
  }
  /* an overlapping second offer on a visible day: refused, the first kept */
  const g = await T.file(p, W, D20, RANGER, ['fly'], 'all', 's13-09')
  const keep = await T.inp(p, f.iid)
  W.rec('s13-09', 'Saber: a second offer for Ranger on Mon 20 (Fly, All day) → Add: refused, nothing made (RECORD its words)', !g.iid, `refusal "${g.refused}" · made ${J(g.made)}`, g.pic)
  W.rec('s13-10', 'after the refusal the first offer is unchanged (read back)', J(keep) === J(after), J(keep))
  const all = await T.sansInputs(p)
  W.rec('s13-11', 'one SANS record in the store (window.INPUTS read)', all.length === 1, J(all))
}

/* ================= S14: other inputs survive the hiding ================= */
async function ordinary(p, W, iso, who, tag) {
  await T.closeAll(p, W)
  await L.go(p, 'inputs')
  await W.press(p, '#inMemberMode:visible', 'inputs-tab'); await sleep(500)
  const before = await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  const c = p.locator(`#inpCal [data-icday="${iso}"]`).first()
  await c.scrollIntoViewIfNeeded().catch(() => {})
  if (W.isPhone) await c.tap({ position: { x: 8, y: 8 } }); else await c.click({ position: { x: 8, y: 8 } })
  await sleep(500)
  await W.press(p, '#icPopAdd:visible', 'ic-add')
  await p.waitForSelector('#inpEditType', { timeout: 6000 })
  const types = await p.locator('#inpEditType option').evaluateAll(os => os.map(o => o.value))
  const ty = types.find(t => /^Appointment$/i.test(t)) || types.find(t => /Meeting/i.test(t)) || types.find(t => /Duty/i.test(t))
  await p.selectOption('#inpEditType', ty); await sleep(200)
  if (await p.locator('#inpEditPerson').count()) await p.selectOption('#inpEditPerson', who)
  const ad = p.locator('#inpEditAllday')
  if (await ad.count() && await ad.isChecked()) { if (W.isPhone) await ad.tap(); else await ad.click() }
  if (await p.locator('#inpEditStart').count()) { await p.fill('#inpEditStart', '13:00'); await p.fill('#inpEditEnd', '14:00') }
  await p.fill('#inpEditRmk', 'S14 dentist')
  const pic0 = await W.pic(p, tag + '-form')
  await W.press(p, '#inpEditSave:visible', 'save'); await sleep(900)
  const after = await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  const iid = after.filter(x => !before.includes(x))[0] || null
  const pic = await W.pic(p, tag + '-saved')
  await T.closeAll(p, W)
  return { iid, ty, made: iid ? await T.inp(p, iid) : null, pic: pic0 + ', ' + pic }
}
/* the Inputs list / calendar: whether an input id is drawn (its card or its row), and its words */
async function inputsShows(p, W, iso, iid, tag) {
  await T.closeAll(p, W)
  await L.go(p, 'inputs')
  await W.press(p, '#inMemberMode:visible', 'inputs-tab'); await sleep(500)
  const c = p.locator(`#inpCal [data-icday="${iso}"]`).first()
  await c.scrollIntoViewIfNeeded().catch(() => {})
  if (W.isPhone) await c.tap({ position: { x: 8, y: 8 } }); else await c.click({ position: { x: 8, y: 8 } })
  await sleep(600)
  const r = await p.evaluate(iid => { const e = [...document.querySelectorAll(`[data-popiid="${iid}"]`)].filter(x => x.getBoundingClientRect().width > 0); return { n: e.length, text: e.map(x => (x.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90)).join(' / ') } }, iid)
  const pic = await W.pic(p, tag)
  return { ...r, pic }
}
async function s14(p, W) {
  if (!(await post(p, W, RANGER, D17, 's14-01')) || !(await post(p, W, HEX, D17, 's14-02'))) return
  const fr = await T.file(p, W, D17, RANGER, ['fly'], 'all', 's14-03')
  W.rec('s14-03', "Saber: Ranger's SANS availability Fri 17 (Fly, All day) (read back)", !!fr.made, J(fr.made) + ' ' + fr.refused, fr.pic)
  const fh = await T.file(p, W, D17, HEX, ['fly'], 'all', 's14-04')
  W.rec('s14-04', "Saber: Hex's SANS availability Fri 17 (Fly, All day) (read back)", !!fh.made, J(fh.made) + ' ' + fh.refused, fh.pic)
  const o = await ordinary(p, W, D17, RANGER, 's14-05')
  W.rec('s14-05', `Saber: Inputs → Fri 17 → + Input → ${o.ty}, Ranger, 13:00–14:00, "S14 dentist" → Save: an ordinary input (read back)`, !!o.made, J(o.made), o.pic)
  if (!fr.made || !fh.made || !o.made) return
  const n0 = (await p.evaluate(() => (window.INPUTS || []).length))
  const read = async (n, label, rIn) => {
    await day(p, W, D17, rIn ? ['Ranger', 'Hex'] : ['Hex'], rIn ? [] : ['Ranger'], `s14-${n}a`, label)
    const i = await inputsShows(p, W, D17, o.iid, `s14-${n}b`)
    W.rec(`s14-${n}b`, `${label} — Inputs calendar, Fri 17 opened: Ranger's ${o.ty} shown once`, i.n === 1, `${i.n} drawn: ${i.text}`, i.pic)
    const sh = await T.sansInputs(p)
    W.rec(`s14-${n}c`, `${label} — the store: both SANS records and the ordinary one still there, nothing doubled (window.INPUTS read)`, sh.length === 2 && (await p.evaluate(() => (window.INPUTS || []).length)) === n0, `SANS ${J(sh)} · all inputs ${await p.evaluate(() => (window.INPUTS || []).length)} (was ${n0})`)
    const wk = await T.weekCrewOf(p, W, 'fri', RANGER, `s14-${n}d`)
    W.rec(`s14-${n}d`, `${label} — Edit Schedule crew list Fri: Ranger ${rIn ? 'in SANS Avail' : 'not in SANS Avail'}`, T.inSansAvail(wk.c) === rIn, T.crewWhere(wk.c), wk.pic)
    const wh = await T.weekCrewOf(p, W, 'fri', HEX, `s14-${n}e`)
    W.rec(`s14-${n}e`, `${label} — Edit Schedule crew list Fri: Hex in SANS Avail`, T.inSansAvail(wh.c), T.crewWhere(wh.c), wh.pic)
  }
  await read('06', 'before the hiding', true)
  let m = await T.movePo(p, W, RANGER, D17, D18, 's14-07')
  W.rec('s14-07', "Saber: Ranger's PO from moved to Sat 18", m.ok && /18 Jul/.test(m.line), `"${m.before}" → "${m.line}" ${m.err}`, m.pic)
  await read('08', "Ranger's availability hidden", false)
  m = await T.movePo(p, W, RANGER, D18, D17, 's14-09')
  W.rec('s14-09', "Saber: Ranger's PO from moved back to Fri 17", m.ok && /17 Jul/.test(m.line), `"${m.before}" → "${m.line}" ${m.err}`, m.pic)
  await read('10', 'restored', true)
}

/* ================= S16: the take-back line, read and unread, posting run or not ================= */
async function s16(p, W, v, ran) {
  const tg = `s16${v}${ran ? 'r' : 'u'}`
  if (!(await post(p, W, RANGER, D17, tg + '-01'))) return
  await L.openBoard(p, W, SAT)
  const g = await L.groundRow(p, W, SAT, 'BRIEF', '08:00', '09:00', RANGER)
  W.rec(tg + '-02', 'Sat 18 board: + Item BRIEF 08:00–09:00 naming Ranger (read back)', !!(g.row && J(g.row.who).includes(RANGER)), J(g.row), await W.pic(p, tg + '-02'))
  await L.closeBoard(p, W)
  /* the week of 20 Jul is planned for him only once it is saved: a BRIEF 17:00–17:30 naming him on Mon 20 (his own two
     demo waves that day end earlier — read in the probe) — he is then planned Sat 18 and Mon 20 */
  const wk = await T.gotoWeek(p, W, D20)
  await L.openBoard(p, W, 0)
  const g2 = await L.groundRow(p, W, 0, 'BRIEF', '17:00', '17:30', RANGER)
  W.rec(tg + '-02b', `week of 20 Jul (${wk}), Mon 20 board: + Item BRIEF 17:00–17:30 naming Ranger (read back)`, !!(g2.row && J(g2.row.who).includes(RANGER)), J(g2.row), await W.pic(p, tg + '-02b'))
  await L.closeBoard(p, W)
  await T.gotoWeek(p, W, '2026-07-13')
  /* (his own demo Thu 23 counts once the week of 20 Jul is saved — the bell read in the first run named it) */
  const filed = v === 3 ? [D18, D20, '2026-07-23'] : v === 4 ? [D18] : []
  for (const d of filed) {
    const f = await T.file(p, W, d, RANGER, ['fly', 'oft', 'amt'], 'all', `${tg}-03-${d.slice(8)}`)
    W.rec(`${tg}-03-${d.slice(8)}`, `Saber files Ranger's availability for ${d.slice(8)} Jul (read back)`, !!f.made, J(f.made) + ' ' + f.refused, f.pic)
  }
  if (ran) { const t = await T.moveClock(p, W, '2026-07-17T09:00:00'); W.rec(tg + '-04', 'clock to Fri 17 09:00 (setSystemTime, reload): the posting runs', /Fri Jul 17/.test(t) && (await T.rec(p, RANGER)).san === true, `${t} · ${J(await T.rec(p, RANGER))}`) }
  await T.as(p, W, 'us', 'us')
  const isLine = l => /You're SANS|is hidden while/.test(l.text)
  let b = await T.bell(p, W, tg + '-05')
  const live = b.sans.filter(l => isLine(l) && !l.struck)
  const wantLive = v !== 3
  W.rec(tg + '-05', `Ranger's bell before the take-back: ${wantLive ? 'his "You\'re SANS from Fri 17 Jul…" line' : 'no reminder (every planned day filed)'}`, wantLive ? live.length === 1 && /^You're SANS from Fri 17 Jul\.\s?You're planned on (Sat 18, Mon 20, Thu 23|Mon 20, Thu 23) Jul with nothing filed\.\s?Tap to file\.$/.test(live[0].text) : live.length === 0, T.bellWords(b), b.pic)
  if (v === 2 || v === 4) {
    const t = await T.bellTap(p, W, live[0], tg + '-06')
    W.rec(tg + '-06', 'Ranger taps the line (reads it): the SANS calendar opens on its first day', t.page === 'inputs' && /July/i.test(t.month), J({ page: t.page, month: t.month, win: t.win }), t.pic)
    b = await T.bell(p, W, tg + '-06b')
    W.rec(tg + '-06b', 'the line is now read', b.sans.filter(l => isLine(l) && !l.struck && !l.unread).length === 1, T.bellWords(b), b.pic)
  }
  await T.as(p, W, 'ad', 'a')
  const u = await T.undoPo(p, W, RANGER, D17, tg + '-07')
  W.rec(tg + '-07', "Saber: Ranger's posted-out sheet → Undo post out (read back)", u.ok && u.rec.san === false && !u.rec.sanFrom, `${u.kind} · "${u.before}" ${u.err} · ${J(u.rec)}`, u.pic)
  await T.as(p, W, 'us', 'us')
  b = await T.bell(p, W, tg + '-08')
  const tl = b.sans.filter(isLine)
  const one = tl[0] || { text: '', struck: '', more: '' }
  let ok, want
  if (v === 1) { want = 'no SANS line at all (the unread reminder simply goes, no invented history)'; ok = tl.length === 0 }
  else if (v === 2) { want = 'ONE line: the reminder struck through, "taken back · Saber", unread; no hidden sentence'; ok = tl.length === 1 && /You're SANS from Fri 17 Jul/.test(one.struck) && /taken back · Saber/.test(one.text) && one.unread && !/hidden/.test(one.text) }
  else if (v === 3) { want = 'ONE line naming the hidden days: "Your SANS availability for Sat 18, Mon 20, Thu 23 Jul is hidden while you\'re not SANS those days."'; ok = tl.length === 1 && /Your SANS availability for Sat 18, Mon 20, Thu 23 Jul is hidden while you're not SANS those days\./.test(one.text) && one.unread }
  else { want = 'ONE line: the read reminder struck, "taken back · Saber", then "Your SANS availability for Sat 18 Jul is hidden while you\'re not SANS that day." (18 named, never 20)'; ok = tl.length === 1 && /planned on/.test(one.struck) && /taken back · Saber/.test(one.text) && /Your SANS availability for Sat 18 Jul is hidden while you're not SANS that day\./.test(one.text) && !/availability for[^.]*Mon 20/.test(one.text) && one.unread }
  W.rec(tg + '-08', `Ranger's bell after the take-back (${ran ? 'posting had run' : 'posting not yet run'}, variant ${v}): ${want}`, ok, T.bellWords(b), b.pic)
  await T.reload(p, 'us', 'us')
  const b2 = await T.bell(p, W, tg + '-09')
  W.rec(tg + '-09', 'after a reload: the same lines, nothing doubled', J(b2.sans.filter(isLine).map(l => [l.text, l.unread])) === J(tl.map(l => [l.text, l.unread])), T.bellWords(b2), b2.pic)
  if (tl[0]) {
    const t = await T.bellTap(p, W, tl[0], tg + '-10')
    W.rec(tg + '-10', 'the take-back line tapped: where it goes (RECORD)', 'REC', J({ page: t.page, month: t.month, win: t.win }), t.pic)
  }
}

/* ================= S18: persistence through a whole hide-and-return ================= */
async function s18(p, W, kind) {
  const tg = `s18${kind}`
  if (!(await post(p, W, RANGER, D17, tg + '-01'))) return
  if (kind === 'b' && !(await post(p, W, HEX, D17, tg + '-01h'))) return
  const iso = kind === 'c' ? D21 : D18, later = kind === 'c' ? D22 : D19
  const who = kind === 'b' ? [RANGER, HEX] : RANGER
  const f = await T.file(p, W, iso, who, ['fly', 'oft'], ['10:00', '15:00'], tg + '-02', { rmk: 'S18 keep' })
  W.rec(tg + '-02', `Saber files ${kind === 'b' ? 'Ranger + Hex (one shared input)' : 'Ranger'} on ${iso.slice(8)} Jul: F/O, 10:00–15:00, "S18 keep" (read back)`, !!f.made, J(f.made) + ' ' + f.refused, f.pic)
  if (!f.made) return
  const s0 = await day(p, W, iso, kind === 'b' ? ['Ranger', 'Hex'] : ['Ranger'], [], tg + '-03', 'filed')
  const orig = T.rowsLine(s0.day)
  const m = await T.movePo(p, W, RANGER, D17, later, tg + '-04')
  W.rec(tg + '-04', `Saber: Ranger's PO from moved to ${later.slice(8)} Jul (after the filed day)`, m.ok && new RegExp(`${+later.slice(8)} Jul`).test(m.line), `"${m.before}" → "${m.line}" ${m.err}`, m.pic)
  const hidW = kind === 'b' ? ['Hex'] : []
  await day(p, W, iso, hidW, ['Ranger'], tg + '-05', 'hidden')
  await T.reload(p, 'ad', 'a')
  await day(p, W, iso, hidW, ['Ranger'], tg + '-06', 'hidden, after a reload')
  await T.as(p, W, 'us', 'us')
  const isLine = l => /You're SANS|is hidden while/.test(l.text)
  const b1 = await T.bell(p, W, tg + '-07')
  W.rec(tg + '-07', "Ranger's bell while hidden: one take-back line naming the hidden day (RECORD its words)", b1.sans.filter(isLine).length === 1 && new RegExp(`availability for \\w+ ${+iso.slice(8)} Jul is hidden`).test(b1.sans.filter(isLine)[0].text), T.bellWords(b1), b1.pic)
  await T.as(p, W, 'ad', 'a')
  await day(p, W, iso, hidW, ['Ranger'], tg + '-08', 'hidden, after signing out and in again')
  const m2 = await T.movePo(p, W, RANGER, later, D17, tg + '-09')
  W.rec(tg + '-09', "Saber: Ranger's PO from moved back to Fri 17", m2.ok && /17 Jul/.test(m2.line), `"${m2.before}" → "${m2.line}" ${m2.err}`, m2.pic)
  const s1 = await day(p, W, iso, kind === 'b' ? ['Ranger', 'Hex'] : ['Ranger'], [], tg + '-10', 'restored')
  W.rec(tg + '-10b', 'restored with its original details, no re-filing (the day\'s lines as first filed)', T.rowsLine(s1.day) === orig, `now ${T.rowsLine(s1.day)} · first ${orig}`)
  await T.reload(p, 'ad', 'a')
  const s2 = await day(p, W, iso, kind === 'b' ? ['Ranger', 'Hex'] : ['Ranger'], [], tg + '-11', 'restored, after a reload')
  W.rec(tg + '-11b', 'after the reload: the same lines', T.rowsLine(s2.day) === orig, T.rowsLine(s2.day))
  await T.as(p, W, 'us', 'us')
  const b2 = await T.bell(p, W, tg + '-12')
  await T.reload(p, 'us', 'us')
  const b3 = await T.bell(p, W, tg + '-13')
  W.rec(tg + '-12', "Ranger's bell after the return, and again after a reload: its lines neither vanish nor multiply (RECORD the words)", J(b2.sans.filter(isLine).map(l => l.text)) === J(b3.sans.filter(isLine).map(l => l.text)) && b3.sans.filter(isLine).length <= 2, `${T.bellWords(b2)} ‖ after reload: ${T.bellWords(b3)}`, b2.pic + ', ' + b3.pic)
  const all = await T.sansInputs(p)
  W.rec(tg + '-14', 'one SANS record in the store, the first one (window.INPUTS read)', all.length === 1 && all[0].iid === f.iid, J(all))
}

/* ================= S22: a restored offer restricts the right activities and hours ================= */
async function s22(p, W) {
  if (!(await post(p, W, RANGER, D17, 's22-01'))) return
  const wv = await W5.addWave(p, W, FRI, 'AA1', '12:00', '13:30')
  const oi = await W5.addSim(p, W, FRI, 'oft', 'OFTIN', '09:30', '11:00')
  const oo = await W5.addSim(p, W, FRI, 'oft', 'OFTOUT', '14:00', '15:30')
  W.rec('s22-02', 'Fri 17 board: flying wave AA1 12:00–13:30, OFT rows OFTIN 09:30–11:00 and OFTOUT 14:00–15:30 (read back)', !!(wv.f && oi.r && oo.r && oi.r.str && oo.r.str), `${J(wv.f)} · ${J(oi.r)} · ${J(oo.r)}`, await W.pic(p, 's22-02'))
  await L.closeBoard(p, W)
  const f = await T.file(p, W, D17, RANGER, ['oft'], ['09:00', '12:00'], 's22-03')
  W.rec('s22-03', 'Saber: Ranger offers OFT only, 09:00–12:00, Fri 17 (read back)', !!(f.made && f.made.sans && f.made.sans.o && !f.made.sans.f), J(f.made) + ' ' + f.refused, f.pic)
  const seats = [
    [`[data-slot="s:${FRI}.oft.${oi.ri}.p"]`, 'OFTIN pilot seat (inside his hours)', 'in'],
    [`[data-slot="s:${FRI}.oft.${oo.ri}.p"]`, 'OFTOUT pilot seat (outside his hours)', 'out'],
    [`[data-slot="${FRI}.${wv.wi}.0.0.p"]`, 'AA1 flying seat (FCP)', 'fly'],
  ]
  const readSeats = async (n, label, sansOn) => {
    await L.openBoard(p, W, FRI)
    const got = {}
    for (const [sel, nm, k] of seats) {
      const r = await W5.armRead(p, W, sel, `s22-${n}-${k}`)
      r.c = await W5.crewOf(p, '#schedBoard', RANGER); const x = W5.firstShown(r.c) || {}
      const words = (x.printed || '') + (x.why ? ' | why:' + x.why : '')
      got[k] = words
      let ok
      if (!sansOn) ok = !/SANS/.test(words)
      else if (k === 'in') ok = !/SANS —/.test(x.printed || '')
      else if (k === 'out') ok = /SANS — available 09:00–12:00 only/.test(words)
      else ok = /SANS — not offering Fly/.test(words)
      W.rec(`s22-${n}-${k}`, `${label} — ${nm} armed (${r.armed}): ${!sansOn ? 'no SANS restriction (an ordinary day for him)' : k === 'in' ? 'no SANS reason' : k === 'out' ? '"SANS — available 09:00–12:00 only"' : '"SANS — not offering Fly"'}`, r.armed ? ok : 'NW', `printed "${x.printed || ''}" · why "${x.why || ''}" · struck ${x.struck} · ${W5.crewLine(r.c)}`, r.pic)
      await W5.disarm(p, W)
    }
    await L.closeBoard(p, W)
    return got
  }
  /* the warnings the board PRINTS naming Ranger (its issue list, top right: "Ranger — SANS: available …") — read off the
     screen (run 1 read window.WARN and found nothing while the screen showed the warning: that read was wrong) */
  /* run 3's read (leaf elements starting "Ranger — ") found nothing while the picture showed the issue: the board draws each
     of the day's checks as `.wln` with its words in `.wln-t` (ui/board.ts), the header `.wh` — read those (on a phone the
     list may be folded, so the words are read whether shown or not, and the header's own words say how many) */
  const warnsOf = () => p.evaluate(() => [...document.querySelectorAll('#schedBoard .sbwrap .wln-t')].map(e => (e.textContent || '').replace(/\s+/g, ' ').trim()).filter(x => /Ranger/.test(x)))
  const g1 = await readSeats('04', 'filed, shown', true)
  /* Ranger placed on a FOURTH row, OFTX 14:00–15:30 (outside his hours), through its armed seat — so the OFTOUT seat stays
     empty for the reads after (run 1 placed him on OFTOUT itself, and its later presses picked his puck) */
  const ox = await W5.addSim(p, W, FRI, 'oft', 'OFTX', '14:00', '15:30')
  const armed = await L.armAndPick(p, W, `[data-slot="s:${FRI}.oft.${ox.ri}.p"]`, RANGER, 'place')
  await sleep(700)
  const placed = await p.evaluate(([di, ri]) => JSON.stringify(window.DAYS[di].sims.oft[ri]), [FRI, ox.ri])
  const w1 = await warnsOf()
  W.rec('s22-05', 'Saber: + OFT row OFTX 14:00–15:30, its pilot seat armed, Ranger pressed: he lands (RECORD), and the board prints a warning naming his SANS hours', w1.some(x => /SANS: available 09:00–12:00 only/.test(x)), `armed ${armed} · row ${placed} · warnings ${J(w1)}`, await W.pic(p, 's22-05'))
  await W5.disarm(p, W); await L.closeBoard(p, W)
  const m = await T.movePo(p, W, RANGER, D17, D18, 's22-06')
  W.rec('s22-06', "Saber: Ranger's PO from moved to Sat 18 (Fri 17 ordinary for him)", m.ok && /18 Jul/.test(m.line), `"${m.before}" → "${m.line}" ${m.err}`, m.pic)
  await readSeats('07', 'hidden (not SANS on 17)', false)
  await L.openBoard(p, W, FRI)
  const w2 = await warnsOf()
  W.rec('s22-08', 'hidden: no warning on Fri 17 stands only on his hidden offer\'s hours or activities (the board\'s printed issues read)', w1.length > 0 && !w2.some(x => /SANS/.test(x)), `${J(w2)} (before: ${J(w1)})`, await W.pic(p, 's22-08'))
  await L.closeBoard(p, W)
  const m2 = await T.movePo(p, W, RANGER, D18, D17, 's22-09')
  W.rec('s22-09', "Saber: Ranger's PO from moved back to Fri 17", m2.ok && /17 Jul/.test(m2.line), `"${m2.before}" → "${m2.line}" ${m2.err}`, m2.pic)
  const g3 = await readSeats('10', 'restored', true)
  await L.openBoard(p, W, FRI)
  const w3 = await warnsOf()
  W.rec('s22-11', 'restored: the same warnings as before the hiding', w1.length > 0 && J(w3) === J(w1), `${J(w3)} (before: ${J(w1)})`, await W.pic(p, 's22-11'))
  await L.closeBoard(p, W)
  W.rec('s22-12', 'restored: the three seats say what they said before the hiding', J(g3) === J(g1), `${J(g3)} · before ${J(g1)}`)
}

/* ================= S11: every hiding cause after publication ================= */
async function s11(p, W) {
  if (!(await post(p, W, RANGER, D17, 's11-01'))) return
  const f = await T.file(p, W, D17, RANGER, ['fly', 'oft', 'amt'], 'all', 's11-02')
  W.rec('s11-02', "Saber: Ranger's SANS availability Fri 17, F/O/A, All day (read back)", !!f.made, J(f.made) + ' ' + f.refused, f.pic)
  const mf = await L.mainFixture(p, W, FRI, RANGER, ['07:00', '07:45'], ['10:00', '17:00'])
  W.rec('s11-03', 'Fri 17 board: BRIEF 07:00–07:45 naming Ranger; SQN EVENT 10:00–17:00 for ALL AVAIL (read back)', mf.ok, `${J(mf.g.row)} · ${J(mf.a.row)}`, await W.pic(p, 's11-03'))
  if (!mf.ok) return
  const rid = mf.a.row.rid
  const lab = await L.publish(p, W, FRI)
  await L.closeBoard(p, W)
  const pub0 = await pubFace(p, W, 's11-04')
  const pd0 = await T.dayState(p, W, 'Friday', 's11-04d')
  W.rec('s11-04', `Fri 17 signed and published ("${lab}"): no pending chip, signed (read off the Friday card)`, pd0.pending === 'none' && !pd0.notSigned && /SIGNED/.test(pd0.signedLine), `${J(pd0)} · published face: ${pub0.sum}`, pub0.pic + ', ' + pd0.pic)
  const look = async (tag, label, rShows) => {
    const s = await day(p, W, D17, rShows ? ['Ranger'] : [], rShows ? [] : ['Ranger'], tag + 'a', label)
    const pub = await pubFace(p, W, tag + 'b')
    W.rec(tag + 'b', `${label} — View-only Sched, Fri 17 (the published face): unchanged by the hiding`, pub.sum === pub0.sum, `${pub.sum} · first ${pub0.sum}`, pub.pic)
    await L.openBoard(p, W, FRI)
    const c = await L.readCount(p, W, rid, '#schedBoard', RANGER)
    const cpic = await W.pic(p, tag + 'c')
    await L.closeWin(p, W)
    W.rec(tag + 'c', `${label} — the working copy's SQN EVENT ALL AVAIL window: Ranger and the count (RECORD)`, 'REC', `chip "${c.chip}" · ${J(c.win)}`, cpic)
    await L.closeBoard(p, W)
    const pd = await T.dayState(p, W, 'Friday', tag + 'd')
    W.rec(tag + 'd', `${label} — Fri 17 pending / signatures, the Friday card and the Amendments panel (RECORD; the host's expected: no pending, SANS availability never lands on the programme — said if it does)`, 'REC', `card: ${pd.pending} · ${pd.notSigned ? '"Not yet signed"' : 'signed'} · "${pd.signedLine}" · amendments: "${pd.amend}"`, pd.pic)
    return pd
  }
  /* cause 1: the posting moved later, then back */
  let m = await T.movePo(p, W, RANGER, D17, D20, 's11-05')
  W.rec('s11-05', "cause 1: Ranger's PO from moved to Mon 20", m.ok && /20 Jul/.test(m.line), `"${m.before}" → "${m.line}" ${m.err}`, m.pic)
  await look('s11-06', 'moved later (hidden)', false)
  m = await T.movePo(p, W, RANGER, D20, D17, 's11-07')
  W.rec('s11-07', "Ranger's PO from moved back to Fri 17", m.ok && /17 Jul/.test(m.line), `"${m.before}" → "${m.line}" ${m.err}`, m.pic)
  await look('s11-08', 'moved back (shown)', true)
  /* cause 2: Undo post out, then posted again */
  const u = await T.undoPo(p, W, RANGER, D17, 's11-09')
  W.rec('s11-09', "cause 2: Ranger's sheet → Undo post out", u.ok && !u.rec.sanFrom, `${u.err} ${J(u.rec)}`, u.pic)
  await look('s11-10', 'posting undone (hidden)', false)
  await post(p, W, RANGER, D17, 's11-11')
  await look('s11-12', 'posted again from 17 (shown)', true)
  /* cause 3: the SANS outcome tapped off, then on */
  let c = await T.sansChip(p, W, RANGER, D17, 's11-13')
  W.rec('s11-13', "cause 3: Ranger's sheet → the SANS chip tapped (no outcome) (RECORD the chips)", 'REC', `"${c.before}" → "${c.line}" ${c.err} · chips ${c.chips} · ${J(c.rec)}`, c.pic)
  await look('s11-14', 'no outcome (hidden)', false)
  c = await T.sansChip(p, W, RANGER, D17, 's11-15')
  W.rec('s11-15', 'the SANS chip tapped again (SANS back)', /becomes SANS/.test(c.line), `"${c.before}" → "${c.line}" ${c.err} · chips ${c.chips}`, c.pic)
  await look('s11-16', 'SANS again (shown)', true)
  /* cause 4: the posting runs (Fri 17), then Quals untick, Undo, Redo */
  const t = await T.moveClock(p, W, '2026-07-17T07:30:00')
  W.rec('s11-17', 'clock to Fri 17 07:30 (setSystemTime, reload): the posting runs', /Fri Jul 17/.test(t) && (await T.rec(p, RANGER)).san === true, `${t} · ${J(await T.rec(p, RANGER))}`)
  await look('s11-18', 'the posting has run (shown)', true)
  const q = await L.qualsTick(p, W, RANGER, 's11-19')
  W.rec('s11-19', "cause 4: Quals → Ranger's SANS cell (untick) → Done (read back)", q.st && q.st.san === false, J(q.st), q.pic)
  await look('s11-20', 'Quals unticked (hidden)', false)
  await W.press(p, '#undoBtn:visible', 'undo'); await sleep(800)
  W.rec('s11-21', 'the top bar Undo: the tick back (read back)', (await T.rec(p, RANGER)).san === true, J(await T.rec(p, RANGER)), await W.pic(p, 's11-21'))
  await look('s11-22', 'after Undo (shown)', true)
  /* cause 5: archive, restore */
  const a = await L.archive(p, W, RANGER, 's11-23')
  W.rec('s11-23', 'cause 5: Admin → Users → Ranger → Archive (read back)', a.archived, `"${a.said}"`, a.pic)
  await look('s11-24', 'archived (hidden)', false)
  /* Astra's "once more, publishing the amendment while the offer is hidden": the day's amendment published now, as it
     stands (Ranger archived, his offer hidden) — what the new published face and the card then say (RECORD) */
  await L.openBoard(p, W, FRI)
  const lab2 = await L.publish(p, W, FRI)
  await L.closeBoard(p, W)
  const pub2 = await pubFace(p, W, 's11-25b')
  const pd2 = await T.dayState(p, W, 'Friday', 's11-25d')
  W.rec('s11-25', `the amendment published while hidden ("${lab2}"): the new published face and the card (RECORD)`, 'REC', `face: ${pub2.sum} (first: ${pub0.sum}) · card: ${pd2.pending} · ${pd2.notSigned ? '"Not yet signed"' : 'signed'} · amendments: "${pd2.amend}"`, pub2.pic + ', ' + pd2.pic)
}
/* the published face of Fri 17 on View-only Sched: the day's own words (Ranger's puck classes, the event chip) */
async function pubFace(p, W, tag) {
  await T.closeAll(p, W)
  await L.go(p, 'viewsched')
  const r = await p.evaluate(di => {
    const sec = [...document.querySelectorAll(`#vWeek section.day[data-day="${di}"], #vWeek .day[data-day="${di}"]`)].find(e => e.getBoundingClientRect().width > 0) || document.querySelectorAll('#vWeek .day')[di]
    if (!sec) return { sum: 'no day' }
    const pk = [...sec.querySelectorAll('.puck[data-person="bane"]')].map(e => e.className.replace(/\s+/g, ' ')).join(' / ')
    const chips = [...sec.querySelectorAll('[data-oilsent]')].map(e => (e.textContent || '').replace(/\s+/g, ' ').trim()).join(' / ')
    const txt = (sec.textContent || '').replace(/\s+/g, ' ')
    return { sum: `Ranger pucks [${pk}] · chips [${chips}] · ${txt.length} chars`, y: sec.getBoundingClientRect().top + window.scrollY }
  }, FRI)
  if (r.y != null) await p.evaluate(y => window.scrollTo(0, Math.max(0, y - 80)), r.y)
  await sleep(300)
  return { sum: r.sum, pic: await W.pic(p, tag) }
}

const FN = {
  s11, s12, s12x, s13, s14, s22,
  s16v1u: (p, W) => s16(p, W, 1, false), s16v2u: (p, W) => s16(p, W, 2, false), s16v3u: (p, W) => s16(p, W, 3, false), s16v4u: (p, W) => s16(p, W, 4, false),
  s16v1r: (p, W) => s16(p, W, 1, true), s16v2r: (p, W) => s16(p, W, 2, true), s16v3r: (p, W) => s16(p, W, 3, true), s16v4r: (p, W) => s16(p, W, 4, true),
  s18a: (p, W) => s18(p, W, 'a'), s18b: (p, W) => s18(p, W, 'b'), s18c: (p, W) => s18(p, W, 'c'),
}
for (const k of ONLY) { const name = k.slice(0, -1), sz = k.slice(-1); if (FN[name]) await run(name, sz, FN[name]); else console.log('no such scenario', k) }
save(process.env.W10_RUN + '-' + ONLY.join('_').slice(0, 80))
