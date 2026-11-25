// Walker w8 — the FULL check of claude/allavail-sans-postout-141: filing ahead (D2340), the fade (D2346), the reminder line
// (D2342); Astra's S1 S2 S3 S4 S5 S15 S17 S19 S20 S21 S23 and the plain-user round, 23 Nov 26, chat 152.
// Brief: docs/superpowers/briefs/2026-11-23-sans-ahead-full-walk-brief.md. Run from raptor-port/ (the build on 4398):
//   W8_RUN=run1 ONLY=build-d,s1-d,... node scripts/handpass/sah-w8.mjs
import './sah-w8-env.mjs'
import path from 'node:path'
import { existsSync } from 'node:fs'
const X = await import('./sah-w8-lib.mjs')
const { L, sleep, J, RANGER, HEX } = X
const VERSION = 'sah-w8 v1'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
console.log(VERSION, L.URL_, L.OUT, ONLY.join(','))
const D15 = '2026-07-15T09:00:00'
const NOTE17 = "SANS from Fri 17 Jul: no availability filed. File it on the Inputs page's SANS tab."
const stateOf = (sz, w) => path.join(X.STATE, `${w}-${sz.name.replace('phone-chromium', 'phone')}.json`)

async function run(name, szKey, fn, o = {}) {
  const sz = szKey === 'pc' ? X.PC : L.SIZES[szKey], W = L.mk(name, sz)
  if (szKey === 'pc') { W.isPhone = true; W.touchCdp = true }
  const sf = o.world ? stateOf(sz, o.world) : null
  if (sf && !existsSync(sf)) { W.rec('NW', 'the saved world ' + o.world + ' is missing', 'NW', sf); return }
  const { b, ctx, p } = await L.world2(sz, W, o.when || D15, sf)
  try {
    await L.as(p, W, 'ad', 'a')
    W.rec('today', "the app's today (page clock)", null, await L.today(p))
    if (sf && o.check) { const f = await o.check(p); W.rec('world', 'the saved world reopened (read)', f.ok, J(f)); if (!f.ok) return }
    await fn(p, W, ctx, b)
  } catch (e) {
    W.rec('ERR', 'script stopped', false, String(e && e.message || e).slice(0, 400), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 8).join(' || '))
  await b.close()
}
/* the reopened world: Ranger on Sat 18's BRIEF, and the two postings in the stored Leave War records (read only) */
const postingsIn = p => p.evaluate(() => { const out = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i), v = localStorage.getItem(k) || ''; for (const [id, d] of [['bane', '2026-07-17'], ['rocky', '2026-07-20'], ['bane', '2026-07-20']]) if (v.includes('"' + id + '"') && v.includes(d) && /po|post/i.test(k + v.slice(0, 400))) out.push(id + '@' + d + ' in ' + k.slice(0, 40)) } return out })
const checkA = async p => { const sat = await p.evaluate(() => JSON.stringify(window.DAYS[5].ground || []).includes('bane')); const po = await postingsIn(p); return { ok: sat && po.some(s => s.startsWith('bane@2026-07-17')) && po.some(s => s.startsWith('rocky@2026-07-20')), sat, po } }

/* ---------- the worlds, through the app's controls, saved ---------- */
/* A: Ranger posted out as SANS from Fri 17 Jul, Hex from Mon 20 Jul; Ranger named on Sat 18 and Mon 20 (BRIEF 13:00–14:00) */
async function buildA(p, W, ctx, o = {}) {
  W.rec('F00', 'Ranger before anything: the week of 13 Jul (read)', null, await X.holds(p, RANGER))
  const po = o.ranger === false ? { line: 'becomes SANS (not posted: this world has none for Ranger)' } : await L.postOut(p, W, RANGER, o.rFrom || '2026-07-17', 'F01')
  if (o.ranger !== false) W.rec('F01', `Leave War: Ranger's ${o.rFrom || '2026-07-17'} cell → ⋯ → Post out → SANS → Post out`, /becomes SANS/.test(po.line || ''), `sheet "${po.line}" · record ${J(po.after)}`, po.pic)
  if (o.hex !== false) {
    const ph = await L.postOut(p, W, HEX, '2026-07-20', 'F02')
    W.rec('F02', "Leave War: Hex's 20 Jul cell → ⋯ → Post out → SANS → Post out", /becomes SANS/.test(ph.line || ''), `sheet "${ph.line}" · record ${J(ph.after)}`, ph.pic)
  }
  for (const [wk, di, nm] of (o.rows || [['2026-07-13', 5, 'BRIEF'], ['2026-07-20', 0, 'BRIEF']])) {
    await L.gotoWeek(p, W, wk)
    const before = await X.holds(p, RANGER)
    const r = await X.row(p, W, wk, di, nm, '13:00', '14:00', RANGER)
    W.rec(`F-${wk.slice(5)}-${di}`, `week of ${wk}, day ${di}: Ground Programme ${nm} 13:00–14:00 naming Ranger (read back; Ranger that week before: ${before})`, r.ok, J(r.row), await W.pic(p, `F03-${wk.slice(5)}-${di}`))
    if (!r.ok) return
  }
  for (const wk of ['2026-07-20', '2026-07-13']) { await L.gotoWeek(p, W, wk); W.rec('F-hold-' + wk.slice(5), `Ranger's week of ${wk} now (read)`, null, await X.holds(p, RANGER)) }
  await ctx.storageState({ path: stateOf(W.sz, o.name || 'A') })
  W.rec('saved', 'world saved', true, stateOf(W.sz, o.name || 'A'))
}

/* ---------- S1: Ranger files ahead for himself ---------- */
async function s1(p, W) {
  W.rec('S1-who', 'signed in as', null, await X.as(p, W, 'us', 'us'))
  await X.openSans(p, W); await X.sansGoto(p, W, '2026-07-16')
  const c16 = await X.cellRead(p, '2026-07-16'), c17 = await X.cellRead(p, '2026-07-17'), c20 = await X.cellRead(p, '2026-07-20')
  W.rec('S1-01', 'Ranger, Wed 15: the month — 16 faded (is-before), 17 and 20 not', c16.before && !c17.before && !c20.before, `16 ${J({ b: c16.before, bg: c16.bg, op: c16.kidOpacity })} · 17 ${J({ b: c17.before, bg: c17.bg })} · 20 ${J({ b: c20.before })} · faded days ${J(await X.cellsBefore(p, '2026-07-01', '2026-07-31'))}`, await W.pic(p, 's1-01-month'))
  const d16 = await X.sansDay(p, W, '2026-07-16')
  W.rec('S1-02', 'opens 16 Jul: the day opens; "+ Commitment" greyed', !!d16.win && d16.win.add === 'greyed', J(d16.win), await W.pic(p, 's1-02-16'))
  const before17 = await X.cellRead(p, '2026-07-17'), before20 = await X.cellRead(p, '2026-07-20')
  const f17 = await X.fileOn(p, W, '2026-07-17', { kinds: ['f'], tag: 's1-03-17' })
  W.rec('S1-03', 'opens 17 Jul → "+ Commitment" (no Person box: his own), Fly, All day → Add: saved as his', f17.ok && f17.made.length === 1 && f17.made[0].who === RANGER, `opened ${J(f17.opened && { person: f17.opened.person, several: f17.opened.several })} · said "${f17.said}" · made ${J(f17.made)}`, f17.pic)
  const w17 = await X.sansPage(p)
  const a17 = await X.cellRead(p, '2026-07-17')
  W.rec('S1-04', 'the saved offer shows once in the opened 17 Jul and the month\'s F count for pilots goes up by one', !!w17.win && w17.win.iids.filter(i => f17.made[0] && i === f17.made[0].iid).length === 1, `day list "${w17.win && w17.win.list}" · committed to fly ${w17.win && w17.win.sansP}/${w17.win && w17.win.sansW} · month figs before "${before17.figs}" after "${a17.figs}"`, await W.pic(p, 's1-04-17'))
  const f20 = await X.fileOn(p, W, '2026-07-20', { kinds: ['f'], tag: 's1-05-20' })
  const w20 = await X.sansPage(p), a20 = await X.cellRead(p, '2026-07-20')
  W.rec('S1-05', 'opens 20 Jul → "+ Commitment", Fly, All day → Add: saved, shown once, counted', f20.ok && !!w20.win && w20.win.iids.filter(i => f20.made[0] && i === f20.made[0].iid).length === 1, `said "${f20.said}" · made ${J(f20.made)} · list "${w20.win && w20.win.list}" · figs before "${before20.figs}" after "${a20.figs}"`, f20.pic)
  await X.sansX(p, W)
}

/* ---------- S2: Saber files ahead for Ranger ---------- */
async function s2(p, W) {
  await X.openSans(p, W); await X.sansGoto(p, W, '2026-07-16')
  W.rec('S2-00', 'Saber\'s month: no faded day', (await X.cellsBefore(p, '2026-07-01', '2026-07-31')).length === 0, J(await X.cellsBefore(p, '2026-07-01', '2026-07-31')), await W.pic(p, 's2-00-month'))
  const f17 = await X.fileOn(p, W, '2026-07-17', { who: RANGER, kinds: ['f'], tag: 's2-01-17' })
  W.rec('S2-01', 'Saber: 17 Jul → "+ Commitment" → Person Ranger, Fly, All day → Add: saved for Ranger', f17.ok && f17.made[0] && f17.made[0].who === RANGER && /Jul 17/.test(f17.made[0].date), `person list ${J(f17.opened && f17.opened.options)} · ${f17.whoSet} · said "${f17.said}" · made ${J(f17.made)}`, f17.pic)
  const f20 = await X.fileOn(p, W, '2026-07-20', { who: RANGER, kinds: ['f'], tag: 's2-02-20' })
  W.rec('S2-02', 'Saber: 20 Jul, the same: saved for Ranger', f20.ok && f20.made[0] && f20.made[0].who === RANGER && /Jul 20/.test(f20.made[0].date), `${f20.whoSet} · said "${f20.said}" · made ${J(f20.made)}`, f20.pic)
  /* a separate attempt: a draft opened on 18 Jul for Ranger, its date moved to 16 on the window's own calendar */
  const pg = await X.sansDay(p, W, '2026-07-18')
  await W.press(p, '[data-testid="win-sansday"] [data-testid="sd-add"]', 'sd-add'); await p.waitForSelector('#inpEditPop'); await sleep(400)
  const w0 = await X.setWho(p, W, RANGER)
  await X.setKinds(p, W, ['f'])
  const d0 = (await X.inpRead(p)).dates
  await X.tapWinDate(p, W, '2026-07-16')
  let r1 = await X.inpRead(p)
  let path_ = `tap 16 → dates ${J(r1.dates)}`
  if (J(r1.dates) !== J(['07-16'])) { await X.tapWinDate(p, W, '2026-07-16'); r1 = await X.inpRead(p); path_ += ` · 16 again → ${J(r1.dates)}` }
  const fp = await W.pic(p, 's2-03-form16')
  const s = await X.saveInp(p, W, 's2-03-16')
  const after = s.stayed ? await X.inpRead(p) : null
  W.rec('S2-03', 'a draft for Ranger on 18 Jul, its date moved to 16 on its own calendar → Add: refused naming 17 Jul; nothing saved, nothing moved to Friday or another man (RECORD the words)', s.made.length === 0 && /Ranger is SANS from Fri 17 Jul/.test(s.said), `${w0} · dates at open ${J(d0)} · ${path_} · said "${s.said}" · window stayed ${s.stayed} (still ${after && after.person} ${after && J(after.dates)}) · made ${J(s.made)}`, fp + ', ' + s.pic)
  await X.closeInp(p, W)
  const all = await p.evaluate(id => (window.INPUTS || []).filter(r => r.type === 'SANS Availability' && JSON.stringify(r).includes('"' + id + '"')).map(r => r.date + (r.end ? '–' + r.end : '')), RANGER)
  W.rec('S2-04', 'Ranger\'s SANS availability now (read): 17 and 20 only; Saber\'s month still unfaded', J(all.slice().sort()) === J(['Jul 17', 'Jul 20']) && (await X.cellsBefore(p, '2026-07-01', '2026-07-31')).length === 0, J(all), await W.pic(p, 's2-04-month'))
}

/* ---------- S19: the fade belongs to the signed-in man ---------- */
async function s19(p, W) {
  const sab = {}
  await X.openSans(p, W); await X.sansGoto(p, W, '2026-07-16')
  for (const d of ['13', '16', '17', '19', '20']) sab[d] = await X.cellRead(p, '2026-07-' + d)
  W.rec('S19-01', 'Saber (admin): no faded day in July; the figures (read for comparison)', (await X.cellsBefore(p, '2026-07-01', '2026-07-31')).length === 0, Object.entries(sab).map(([d, c]) => `${d}: ${c.figs} bg ${c.bg}`).join(' · '), await W.pic(p, 's19-01-saber'))
  /* Highlight: Saber picks Hex (the Highlight button, then his row) */
  const hl = await highlight(p, W, HEX)
  W.rec('S19-02', 'Saber picks Hex in Highlight: still no faded day', hl.ok && (await X.cellsBefore(p, '2026-07-01', '2026-07-31')).length === 0, `${hl.how} · faded ${J(await X.cellsBefore(p, '2026-07-01', '2026-07-31'))}`, await W.pic(p, 's19-02-saber-hl'))
  await X.as(p, W, 'us', 'us')
  await X.openSans(p, W); await X.sansGoto(p, W, '2026-07-16')
  const rg = {}
  for (const d of ['13', '16', '17', '19', '20']) rg[d] = await X.cellRead(p, '2026-07-' + d)
  const faded = await X.cellsBefore(p, '2026-07-01', '2026-07-31')
  const want = Array.from({ length: 16 }, (_, i) => String(i + 1).padStart(2, '0'))
  W.rec('S19-03', 'Ranger: 1–16 Jul faded (is-before), 17 on not', J(faded) === J(want), `faded ${J(faded)}`, await W.pic(p, 's19-03-ranger'))
  W.rec('S19-04', 'Ranger 16: no wash (the panel colour), figures dimmed (.38), no stripes; 17 keeps the ordinary look; a screen reader hears "Before your SANS date."', rg['16'].before && rg['16'].kidOpacity === '0.38' && rg['16'].bgImg === 'none' && /Before your SANS date\.$/.test(rg['16'].aria) && !rg['17'].before && rg['17'].kidOpacity === '1' && !/Before your SANS/.test(rg['17'].aria), `16 ${J({ bg: rg['16'].bg, img: rg['16'].bgImg, op: rg['16'].kidOpacity, aria: rg['16'].aria })} · 17 ${J({ bg: rg['17'].bg, op: rg['17'].kidOpacity, aria: rg['17'].aria })} · Saber's 16 bg ${sab['16'].bg}`, await clip(p, W, '2026-07-16', 's19-04-clip'))
  W.rec('S19-05', 'the figures read the same for Ranger as for Saber', ['13', '16', '17', '19', '20'].every(d => rg[d].figs === sab[d].figs), ['13', '16', '17', '19', '20'].map(d => `${d}: R "${rg[d].figs}" S "${sab[d].figs}"`).join(' · '))
  for (const d of ['16', '17', '20']) {
    const w = await X.sansDay(p, W, '2026-07-' + d)
    W.rec('S19-06-' + d, `Ranger opens ${d} Jul: it opens; "+ Commitment" ${d === '16' ? 'greyed' : 'offered'}`, !!w.win && w.win.add === (d === '16' ? 'greyed' : 'enabled'), J(w.win && { ttl: w.win.ttl, add: w.win.add, why: w.win.addwhy }), await W.pic(p, 's19-06-' + d))
  }
  await X.sansX(p, W)
  const hl2 = await highlight(p, W, HEX)
  const f2 = await X.cellsBefore(p, '2026-07-01', '2026-07-31')
  W.rec('S19-07', 'Ranger picks Hex in Highlight (where offered): the fade still his own (1–16), not Hex\'s', J(f2) === J(want), `${hl2.how} · faded ${J(f2)}`, await W.pic(p, 's19-07-ranger-hl'))
}
async function highlight(p, W, id) {
  const btn = p.locator('[data-testid="sc-hl"]:visible').first()
  if (!(await btn.count())) return { ok: false, how: 'no Highlight button' }
  await W.press(p, btn, 'hl'); await sleep(400)
  const cs = await p.evaluate(id => window.PEOPLE[id].cs, id)
  let item = p.locator(`[data-testid="sc-hl-${id}"]:visible`).first()
  const items = (await p.locator('.sc-hl-item:visible').allTextContents()).join(',')
  let how = `Highlight → ${cs}`
  if (!(await item.count())) { item = p.locator('.sc-hl-item:visible:not([data-testid="sc-hl-none"])').first(); how = `${cs} is not offered in Highlight (its list: ${items}) — picked its first man instead, ` + (await item.getAttribute('aria-label')) }
  await W.press(p, item, 'hl-item'); await sleep(500)
  const lit = await p.locator('.sc-day.is-hi').count()
  return { ok: true, how: how + ` · ${lit} days ringed` }
}
async function clip(p, W, iso, tag) {
  const l = p.locator(`[data-testid="sc-day-${iso}"]`).first()
  const bb = await l.boundingBox()
  const nb = await p.locator(`[data-testid="sc-day-${iso.slice(0, 8) + String(+iso.slice(8) + 1).padStart(2, '0')}"]`).first().boundingBox()
  const x = Math.max(0, bb.x - 4), y = Math.max(0, bb.y - 4)
  const f = path.join(L.OUT, `${W.scn}-${tag}-${W.sz.name}.png`)
  await p.screenshot({ path: f, clip: { x, y, width: (nb ? nb.x + nb.width - x : bb.width) + 4, height: bb.height + 8 } })
  return path.basename(f)
}

const M = await import('./sah-w8-more.mjs')
const chk = (want, rows) => async p => { const po = await postingsIn(p); const ok = want.every(w => po.some(s => s.startsWith(w))) && (!want.length || true); return { ok, po } }
const FN = {
  buildA: [buildA, {}],
  buildN: [(p, W, c) => buildA(p, W, c, { ranger: false, rows: [], name: 'N' }), {}],
  buildB: [(p, W, c) => buildA(p, W, c, { rFrom: '2026-07-20', hex: false, rows: [], name: 'B' }), {}],
  buildC: [(p, W, c) => buildA(p, W, c, { hex: false, rows: [['2026-07-13', 5, 'BRIEF'], ['2026-07-20', 1, 'BRIEF'], ['2026-07-20', 4, 'BRIEF']], name: 'C' }), {}],
  buildD: [(p, W, c) => buildA(p, W, c, { hex: false, rows: [['2026-07-13', 5, 'BRIEF'], ['2026-07-27', 4, 'BRIEF'], ['2026-08-03', 0, 'BRIEF']], name: 'D' }), {}],
  s3: [M.s3, { world: 'A', check: checkA }],
  s4r: [(p, W) => M.s4(p, W, 'ranger'), { world: 'A', check: checkA }], s4s: [(p, W) => M.s4(p, W, 'saber'), { world: 'A', check: checkA }],
  s5: [M.s5, { world: 'N', check: chk(['rocky@2026-07-20']) }],
  s15: [M.s15, { world: 'A', check: checkA }], s17: [M.s17, { world: 'C', check: chk(['bane@2026-07-17']) }], s17m: [M.s17m, { world: 'D', check: chk(['bane@2026-07-17']) }],
  s20: [M.s20, { world: 'A', check: checkA }], s21: [M.s21, { world: 'B', check: chk(['bane@2026-07-20']) }], s23: [M.s23, { world: 'A', check: checkA }],
  pu: [M.pu, { world: 'A', check: checkA }], s1: [s1, { world: 'A', check: checkA }], s2: [s2, { world: 'A', check: checkA }], s19: [s19, { world: 'A', check: checkA }],
}
for (const k of ONLY) {
  const i = k.lastIndexOf('-'), name = k.slice(0, i), sz = k.slice(i + 1)
  if (!FN[name]) { console.log('unknown', k); continue }
  const [fn, o] = FN[name]
  await run(name, sz, fn, o || {})
  L.saveResults('w8-' + (process.env.W8_TAG || ONLY.join('_')).slice(0, 80))
}
console.log('done')
