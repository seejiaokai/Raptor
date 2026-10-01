/* [DB-READINESS] group A phase 7 — the FULL check's walk, WALKER B, part 2 (1 Oct 26): THE SECOND SPARE SIM SEAT
   (Astra's scenarios 20–25). A full sim row shows a spare PAIR of empty seats; a man put on the SECOND of the pair must
   be saved with no hole — every entry of the row's stored `pax` / `more` list text, the skipped seat "", never null —
   he sits where he was dropped, the first spare is still offered, and Undo / Redo / a reload / publication keep it.
   Monday 13 Jul: the AMT BOX's passenger list (8 men, the `pax` list) — published first, so the placement is one
   pending change. Wednesday 15 Jul: IAT-3 (both seats → extras), the AMT BOX (two men → extras), a new OFT row with
   both seats and two extras — the `more` list. Each by tap-arm + the crew list AND by a real pointer drag.
   Env: HP_URL, HP_SHOTS, HP_OUT, HP_TAG=p7. */
import { boot, fact, facts, changesList } from './p6-lib.mjs'
import { handPut } from './seat-lib.mjs'
import * as B from './p7-b-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await B.world(L)
await W.toastSpy(p)
const MON = 0, WED = 2
const pics = []
const pic = async (name, o) => { await L.shot(p, name, o || {}); pics.push(name + '.png'); return name + '.png' }
const try_ = async (name, fn) => { try { return await fn() } catch (e) { L.check(`${name} — the step ran`, false, String(e && e.stack || e).slice(0, 900)); await pic(`${name}-X-error`).catch(() => {}); return null } }
const ok = re => L.results.filter(r => re.test(r.name)).every(r => r.ok)
const table = []
const row = (id, did, screen, stored, verdict, ps) => { table.push({ id, did, screen, stored, verdict, pics: ps }); console.log(`ROW   ${id} ${verdict}`) }

/* the seats a sim row draws on the board, in the order drawn: who sits where, which are offered empty */
const seats = async (key) => p.evaluate(k => {
  const z = document.querySelector(`#schedBoard [data-fill="${k}.+"]`); if (!z) return null
  return [...z.querySelectorAll('[data-slot]')].map(e => { const pk = e.querySelector('[data-person]'); return { slot: e.dataset.slot.slice(k.length + 1), who: pk ? pk.dataset.person : null, empty: e.classList.contains('empty'), shown: e.offsetParent !== null } })
}, key)
const S = ss => (ss || []).map(s => `${s.slot}:${s.who || (s.empty ? '+' : '?')}`).join(' ')
/* the row as STORED (the text in the browser's storage, and parsed) */
const storedRow = async (di, kind, ri) => {
  const t = await B.storedDay(p, di); if (!t) return { stored: false }
  const j = JSON.parse(t), r = ((j.d || {}).sims || {})[kind] ? j.d.sims[kind][ri] : null
  const simsText = JSON.stringify(j.d.sims)
  return { stored: true, row: r, pax: r && r.pax, more: r && r.more, nullsInSims: B.nulls(j.d.sims), listsText: (t.match(/"(?:more|pax)":\[[^\]]*\]/g) || []), simsHasNullText: /null/.test(simsText) }
}
const allText = a => Array.isArray(a) && a.every(x => typeof x === 'string')
/* every `more` / `pax` list anywhere in every stored week row (the working day AND the issued versions), with its path */
const everyList = async () => {
  const rows = await L.rows(p), out = []
  const walk = (v, path, key) => {
    if (Array.isArray(v)) { v.forEach((x, i) => walk(x, `${path}[${i}]`, key)); return }
    if (v && typeof v === 'object') for (const k of Object.keys(v)) {
      if ((k === 'more' || k === 'pax') && Array.isArray(v[k])) out.push({ key, path: `${path}.${k}`, list: v[k], label: v.label || v.prog || '' })
      walk(v[k], path ? `${path}.${k}` : k, key)
    }
  }
  for (const [k, t] of Object.entries(rows)) { if (!k.startsWith('weeks/')) continue; let j = null; try { j = JSON.parse(t) } catch (e) { continue } walk(j, '', k) }
  return out
}
const srcOf = id => p.locator(`#sbRoster .rpuck[data-person="${id}"]:visible`).first()
const dstOf = key => p.locator(`#schedBoard [data-slot="${key}"]:visible`).first()
const focusRow = async (key) => { await p.evaluate(k => { const z = document.querySelector(`#schedBoard [data-fill="${k}.+"]`); if (z) z.scrollIntoView({ block: 'center' }) }, key); await B.sleep(250) }
/* the people a row shows on View-only Sched (the issued face), in the order drawn, found by the row's label */
const viewRow = async (di, label) => p.evaluate(([d, lab]) => {
  const day = document.querySelector(`#vWeek .day[data-day="${d}"]`); if (!day) return null
  const leaf = [...day.querySelectorAll('*')].find(e => e.children.length === 0 && (e.textContent || '').trim() === lab)
  if (!leaf) return 'no row labelled ' + lab
  let r = leaf; for (let i = 0; i < 6 && r && !r.querySelector('[data-person]'); i++) r = r.parentElement
  if (!r) return 'no people on it'
  leaf.scrollIntoView({ block: 'center', inline: 'nearest' })
  return [...r.querySelectorAll('[data-person]')].map(e => { const b = e.getBoundingClientRect(); return { who: e.dataset.person, x: Math.round(b.left), y: Math.round(b.top) } })
}, [di, label])

/* ================= MONDAY — the passenger list (`pax`) of the AMT BOX, on a PUBLISHED day ================= */
const M = 's:0.amt.1', MAN = 'mamba'
await W.boardOn(p, MON)
await try_('B20-setup', async () => {
  fact('M.before.seats', S(await seats(M)))
  fact('M.sign', await W.signDay(p, MON)); fact('M.pub', await W.publishDay(p, MON)); fact('M.head', await W.head(p, MON))
  await L.settle(p)
  fact('M.before.stored', (await storedRow(MON, 'amt', 1)).pax)
  await focusRow(M); await pic('B20-0-mon-amt-box-full-row-spare-pair')
})
let m1 = null, m1text = null
await try_('B20', async () => {
  const before = await seats(M)
  L.check('B20 the full AMT BOX (8 passengers) offers a spare PAIR: two empty seats after the eighth', !!before && before.filter(s => s.empty).map(s => s.slot).join(',') === 'pax.8,pax.9', S(before))
  const a = await L.step(p, 'B20 Sidewinder dragged from the crew list onto the SECOND spare (pax.9)', async () => { await focusRow(M); await W.drag(p, srcOf(MAN), dstOf(`${M}.pax.9`)); return W.toasts(p) }, { put: [/^weeks\/13-07-2026#0$/] })
  fact('B20.toasts', a.ret)
  const after = await seats(M); const st = await storedRow(MON, 'amt', 1)
  m1 = { seats: S(after), pax: st.pax, listsText: st.listsText.filter(x => x.includes(MAN)), nulls: st.nullsInSims }
  m1text = JSON.stringify(st.pax)
  fact('B20.after', m1)
  L.check('B20 he sits where he was dropped: seat pax.9 holds Sidewinder', !!after && (after.find(s => s.slot === 'pax.9') || {}).who === MAN, S(after))
  L.check('B20 the first spare (pax.8) is still offered, empty', !!after && !!(after.find(s => s.slot === 'pax.8') || {}).empty, S(after))
  L.check('B20 stored: the list is 10 long, the skipped seat is "" and he is at index 9', Array.isArray(st.pax) && st.pax.length === 10 && st.pax[8] === '' && st.pax[9] === MAN, st.pax)
  L.check('B20 stored: every entry is text — no null anywhere in the day\'s sims', allText(st.pax) && st.nullsInSims.length === 0 && !st.simsHasNullText, { pax: st.pax, nulls: st.nullsInSims })
  await focusRow(M); await pic('B20-1-mon-dragged-onto-second-spare')
  fact('B20.head', await W.head(p, MON))
})
/* the changes window: one line for the placement */
let chg = null
await try_('B24c', async () => {
  await W.boardOff(p); await W.toEdit(L, p); await W.showDay(p, MON)
  const h = await W.head(p, MON); fact('B24c.head', h)
  const c = p.locator(`#eWeek .day[data-day="${MON}"] .dpend`).first()
  if (await c.count()) { await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await c.click(); await B.sleep(600) }
  const tab = p.locator('.chgwin:not([hidden]) .win-tab', { hasText: 'To go out' }).first()
  if (await tab.count()) { await tab.click(); await B.sleep(300) }
  chg = await p.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); if (!w) return null
    return { tabs: [...w.querySelectorAll('.win-tab')].map(t => t.innerText.replace(/\s+/g, ' ').trim()), lines: [...w.querySelectorAll('.cw-l')].map(e => e.innerText.replace(/\s+/g, ' ').trim()), text: (w.querySelector('.win-body, .cw-body, .cw-list') || w).innerText.split(/\n/).map(s => s.trim()).filter(Boolean).slice(0, 30) } })
  fact('B24c.changes', chg); fact('B24c.pending', h && h.pending)
  await pic('B24c-1-mon-changes-window-one-placement')
  /* the window groups by item (D340): the item's name in bold, the change under it — read its words as drawn */
  const mine = chg ? chg.text.filter(s => /Sidewinder/.test(s)) : []
  L.check('B24 the published Monday reads "1 pending" after the one placement', !!h && /^1 pending/.test(h.pending), h && h.pending)
  L.check('B24 the changes window (To go out · AL1) says "1 change": one item, "AMT BOX · passengers", one line under it, "Sidewinder"', !!chg && chg.tabs.some(t => /^To go out · AL1 1$/.test(t)) && chg.text.includes('· 1 change') && chg.text.filter(s => /AMT BOX/.test(s)).length === 1 && mine.length === 1, chg && { tabs: chg.tabs, text: chg.text })
  const x = p.locator('.chgwin:not([hidden]) .win-x').first(); if (await x.count()) { await x.click().catch(() => {}); await B.sleep(300) }
  await W.boardOn(p, MON)
})
/* B25 — Undo / Redo */
let m2 = null
await try_('B25m', async () => {
  const u = await W.door(p, 'board', 'undo'); const sU = await seats(M); const stU = await storedRow(MON, 'amt', 1); await L.settle(p)
  const stU2 = await storedRow(MON, 'amt', 1)
  await focusRow(M); await pic('B25-1-mon-after-undo')
  const r = await W.door(p, 'board', 'redo'); await L.settle(p); const sR = await seats(M); const stR = await storedRow(MON, 'amt', 1)
  await focusRow(M); await pic('B25-2-mon-after-redo')
  m2 = { undo: { door: u, seats: S(sU), pax: stU2.pax, head: null }, redo: { door: r, seats: S(sR), pax: stR.pax } }
  fact('B25.mon', m2)
  L.check('B25 Undo takes only him off: the eight passengers keep their seats, the spare pair is offered again', u.pressed && S(sU).endsWith('pax.8:+ pax.9:+') && !S(sU).includes(MAN), S(sU))
  L.check('B25 stored after Undo: the list is the eight men again (the trailing blank trimmed, the men unmoved)', Array.isArray(stU2.pax) && stU2.pax.length === 8 && allText(stU2.pax) && stU2.nullsInSims.length === 0, stU2.pax)
  L.check('B25 Redo puts him back on the SAME seat (pax.9), the first spare still empty', r.pressed && (sR.find(s => s.slot === 'pax.9') || {}).who === MAN && !!(sR.find(s => s.slot === 'pax.8') || {}).empty, S(sR))
  L.check('B25 stored after Redo: exactly what the drag stored', JSON.stringify(stR.pax) === m1text, { redo: stR.pax, drag: m1text })
})
/* B21 — the same seat by tap-arm + the crew list */
let m3 = null
await try_('B21', async () => {
  const u = await W.door(p, 'board', 'undo'); await L.settle(p)
  const a = await L.step(p, 'B21 the second spare (pax.9) armed by a tap, Sidewinder picked from the crew list', async () => handPut(p, `${M}.pax.9`, MAN), { put: [/^weeks\/13-07-2026#0$/] })
  const after = await seats(M); const st = await storedRow(MON, 'amt', 1)
  m3 = { put: a.ret, seats: S(after), pax: st.pax }
  fact('B21.after', m3)
  L.check('B21 tap-arm: he sits on pax.9, pax.8 still offered', a.ret && a.ret.took && (after.find(s => s.slot === 'pax.9') || {}).who === MAN && !!(after.find(s => s.slot === 'pax.8') || {}).empty, S(after))
  L.check('B21 tap-arm stores the SAME list as the drag (text, "" at 8, him at 9)', JSON.stringify(st.pax) === m1text && allText(st.pax) && st.nullsInSims.length === 0, { tap: st.pax, drag: m1text })
  await focusRow(M); await pic('B21-1-mon-tap-arm-second-spare')
})
row('B20', 'Monday published as it stood (four boxes, Publish day). Board, AMT BOX (8 passengers): Sidewinder dragged from the crew list onto the SECOND empty seat of the spare pair',
  m1 ? `seats drawn: ${m1.seats}; day head 1 pending` : 'failed', m1 ? `stored pax = ${JSON.stringify(m1.pax)}; nulls in the day's sims: ${m1.nulls.length}` : '', ok(/^B20/) ? 'PASS' : 'FAIL', pics.filter(f => /^B20/.test(f)))
row('B21', 'Undo, then the same seat armed by a tap and Sidewinder picked from the crew list',
  m3 ? `seats drawn: ${m3.seats}; toast ${JSON.stringify(m3.put && m3.put.msg)}` : 'failed', m3 ? `stored pax = ${JSON.stringify(m3.pax)} — the same text as the drag's` : '', ok(/^B21/) ? 'PASS' : 'FAIL', pics.filter(f => /^B21/.test(f)))

/* ================= WEDNESDAY — the extras (`more`) ================= */
const I = 's:2.oft.1', A = 's:2.amt.1'
let w = {}
await W.boardOn(p, WED)
/* B23 — IAT-3 (both seats filled): the second spare by tap-arm */
await try_('B23', async () => {
  const before = await seats(I)
  L.check('B23 IAT-3 (both seats filled) offers a spare pair x0, x1', !!before && before.filter(s => s.empty).map(s => s.slot).join(',') === 'x0,x1', S(before))
  await focusRow(I); await pic('B23-0-wed-iat3-spare-pair')
  const a = await L.step(p, 'B23 IAT-3\'s SECOND spare (x1) armed by a tap, Sidewinder picked from the crew list', async () => handPut(p, `${I}.x1`, 'mamba'), { put: [/^weeks\/13-07-2026#2$/] })
  const after = await seats(I); const st = await storedRow(WED, 'oft', 1)
  w.iat = { put: a.ret, seats: S(after), more: st.more, nulls: st.nullsInSims, text: st.listsText }
  fact('B23.after', w.iat)
  L.check('B23 he sits on x1; the first spare x0 is still offered', a.ret && a.ret.took && (after.find(s => s.slot === 'x1') || {}).who === 'mamba' && !!(after.find(s => s.slot === 'x0') || {}).empty, S(after))
  L.check('B23 stored: more = ["", "mamba"] — text only, no null', JSON.stringify(st.more) === '["","mamba"]' && st.nullsInSims.length === 0 && !st.simsHasNullText, st.more)
  await focusRow(I); await pic('B23-1-wed-iat3-tap-arm-second-spare')
})
/* B22 — the AMT BOX with two men: the second spare by a real pointer drag */
await try_('B22', async () => {
  fact('B22.fill', [await handPut(p, `${A}.p`, 'shaft'), await handPut(p, `${A}.w`, 'dj')])
  const before = await seats(A)
  L.check('B22 the AMT BOX with two men offers a spare pair x0, x1', !!before && before.filter(s => s.empty).map(s => s.slot).join(',') === 'x0,x1', S(before))
  const a = await L.step(p, 'B22 Vapor dragged from the crew list onto the AMT BOX\'s SECOND spare (x1)', async () => { await focusRow(A); await W.drag(p, srcOf('vegas'), dstOf(`${A}.x1`)); return W.toasts(p) }, { put: [/^weeks\/13-07-2026#2$/] })
  const after = await seats(A); const st = await storedRow(WED, 'amt', 1)
  w.amt = { toasts: a.ret, seats: S(after), more: st.more, nulls: st.nullsInSims }
  fact('B22.after', w.amt)
  L.check('B22 he sits on x1; the first spare x0 is still offered', (after.find(s => s.slot === 'x1') || {}).who === 'vegas' && !!(after.find(s => s.slot === 'x0') || {}).empty, S(after))
  L.check('B22 stored: more = ["", "vegas"] — text only, no null', JSON.stringify(st.more) === '["","vegas"]' && st.nullsInSims.length === 0 && !st.simsHasNullText, st.more)
  await focusRow(A); await pic('B22-1-wed-amt-box-drag-second-spare')
})
/* B22b / B23b — a NEW OFT row with both seats and two extras: the spare pair is x2, x3; drag, then (after Undo) tap */
await try_('B22b', async () => {
  const n0 = (await B.simModel(p, WED)).oft.length
  const add = p.locator(`#schedBoard [data-sradd="${WED}.oft"]:visible`).first()
  await add.evaluate(e => e.scrollIntoView({ block: 'center' })); await add.click(); await B.sleep(500)
  const ri = (await B.simModel(p, WED)).oft.length - 1
  L.check('B22b "+ Row" added one OFT row', ri === n0, { n0, ri })
  await W.boardText(p, `sr:${WED}.oft.${ri}.label`, 'EP-2'); await W.boardText(p, `sr:${WED}.oft.${ri}.str`, '17:00'); await W.boardText(p, `sr:${WED}.oft.${ri}.end`, '18:00')
  const E = `s:${WED}.oft.${ri}`
  fact('B22b.row', await p.evaluate(k => { const z = document.querySelector(`#schedBoard [data-fill="${k}.+"]`); return z ? z.outerHTML.replace(/\s+/g, ' ').slice(0, 900) : null }, E))
  const fills = []
  for (const [slot, who] of [['p', 'stiff'], ['w', 'drill'], ['x0', 'bane'], ['x1', 'pump']]) {
    let r = await handPut(p, `${E}.${slot}`, who)
    if (!r.took && !r.armed) r = await handPut(p, `${E}.+`, who)   /* a fresh row may offer only its fill zone first */
    fills.push({ slot, who, took: r.took, msg: r.msg })
  }
  fact('B22b.fills', fills)
  const before = await seats(E)
  L.check('B22b the OFT row with both seats and two extras offers a spare pair x2, x3', !!before && before.filter(s => s.empty).map(s => s.slot).join(',') === 'x2,x3', S(before))
  await focusRow(E); await pic('B22b-0-wed-new-oft-full-row-spare-pair')
  const a = await L.step(p, 'B22b Blade dragged from the crew list onto the SECOND spare (x3)', async () => { await focusRow(E); await W.drag(p, srcOf('slash'), dstOf(`${E}.x3`)); return W.toasts(p) }, { put: [/^weeks\/13-07-2026#2$/] })
  const after = await seats(E); const st = await storedRow(WED, 'oft', ri)
  w.ep2 = { ri, seats: S(after), more: st.more, nulls: st.nullsInSims }
  fact('B22b.after', w.ep2)
  L.check('B22b he sits on x3; x2 is still offered', (after.find(s => s.slot === 'x3') || {}).who === 'slash' && !!(after.find(s => s.slot === 'x2') || {}).empty, S(after))
  L.check('B22b stored: more = ["bane","pump","","slash"] — text only, no null', JSON.stringify(st.more) === '["bane","pump","","slash"]' && st.nullsInSims.length === 0, st.more)
  await focusRow(E); await pic('B22b-1-wed-new-oft-drag-second-spare')
  /* Undo / Redo on this one, then the same seat by tap */
  const u = await W.door(p, 'board', 'undo'); await L.settle(p); const sU = await seats(E); const stU = await storedRow(WED, 'oft', ri)
  await focusRow(E); await pic('B25-3-wed-new-oft-after-undo')
  const r = await W.door(p, 'board', 'redo'); await L.settle(p); const sR = await seats(E); const stR = await storedRow(WED, 'oft', ri)
  w.ep2undo = { undo: { title: u.title, seats: S(sU), more: stU.more }, redo: { title: r.title, seats: S(sR), more: stR.more } }
  fact('B25.wed.ep2', w.ep2undo)
  L.check('B25 (extras) Undo removes only Blade: the two extras keep x0, x1, the pair x2, x3 is offered; stored more = ["bane","pump"]', u.pressed && S(sU).endsWith('x0:bane x1:pump x2:+ x3:+') && JSON.stringify(stU.more) === '["bane","pump"]', { seats: S(sU), more: stU.more })
  L.check('B25 (extras) Redo puts him back on x3; stored more = ["bane","pump","","slash"]', r.pressed && (sR.find(s => s.slot === 'x3') || {}).who === 'slash' && JSON.stringify(stR.more) === '["bane","pump","","slash"]', { seats: S(sR), more: stR.more })
  await W.door(p, 'board', 'undo'); await L.settle(p)
  const t = await L.step(p, 'B23b the same seat (x3) armed by a tap, Blade picked from the crew list', async () => handPut(p, `${E}.x3`, 'slash'), { put: [/^weeks\/13-07-2026#2$/] })
  const sT = await seats(E); const stT = await storedRow(WED, 'oft', ri)
  w.ep2tap = { put: t.ret, seats: S(sT), more: stT.more }
  fact('B23b.after', w.ep2tap)
  L.check('B23b tap-arm stores the SAME list as the drag', JSON.stringify(stT.more) === '["bane","pump","","slash"]' && (sT.find(s => s.slot === 'x3') || {}).who === 'slash', { seats: S(sT), more: stT.more })
  await focusRow(E); await pic('B23b-1-wed-new-oft-tap-arm-second-spare')
})
/* B25 on the two-seat rows: Undo twice / Redo twice would cross steps — one each on IAT-3 is the clean read */
row('B22', 'Wednesday board. AMT BOX: Anvil and Ace put on its two seats, then Vapor DRAGGED from the crew list onto the second spare. New OFT row (+ Row, "EP-2" 17:00–18:00; Saber, Ledger, Ranger, Piston by tap): Blade DRAGGED onto the second spare',
  `AMT BOX seats: ${w.amt && w.amt.seats}; EP-2 seats: ${w.ep2 && w.ep2.seats}`, `AMT BOX more = ${JSON.stringify(w.amt && w.amt.more)}; EP-2 more = ${JSON.stringify(w.ep2 && w.ep2.more)}; nulls: ${JSON.stringify((w.ep2 && w.ep2.nulls) || [])}`, ok(/^B22/) ? 'PASS' : 'FAIL', pics.filter(f => /^B22/.test(f)))
row('B23', 'IAT-3 (Recon / Quill): its second spare armed by a tap, Sidewinder picked from the crew list. EP-2: after Undo, the same seat by tap + crew list',
  `IAT-3 seats: ${w.iat && w.iat.seats}; EP-2 seats: ${w.ep2tap && w.ep2tap.seats}`, `IAT-3 more = ${JSON.stringify(w.iat && w.iat.more)}; EP-2 more = ${JSON.stringify(w.ep2tap && w.ep2tap.more)}`, ok(/^B23/) ? 'PASS' : 'FAIL', pics.filter(f => /^B23/.test(f)))
row('B25', 'Monday AMT BOX and Wednesday EP-2: the board\'s Undo, then Redo, after the second-spare placement',
  `Monday: undo ${m2 && m2.undo.seats} / redo ${m2 && m2.redo.seats}; EP-2: undo ${w.ep2undo && w.ep2undo.undo.seats} / redo ${w.ep2undo && w.ep2undo.redo.seats}`,
  `Monday pax after undo ${JSON.stringify(m2 && m2.undo.pax)}, after redo ${JSON.stringify(m2 && m2.redo.pax)}; EP-2 more after undo ${JSON.stringify(w.ep2undo && w.ep2undo.undo.more)}, after redo ${JSON.stringify(w.ep2undo && w.ep2undo.redo.more)}`, ok(/^B25/) ? 'PASS' : 'FAIL', pics.filter(f => /^B25/.test(f)))

/* ================= B24 — a reload, publication, the issued rows, View-only Sched ================= */
let b24 = {}
await try_('B24', async () => {
  const snap = async () => ({ mon: S(await (async () => { await W.boardOn(p, MON); return seats(M) })()), wed: await (async () => { await W.boardOn(p, WED); return { iat: S(await seats(I)), amt: S(await seats(A)), ep2: S(await seats(`s:${WED}.oft.${w.ep2.ri}`)) } })() })
  const s0 = await snap()
  await W.boardOff(p)
  await L.reloadCompare(p, 'B24 reload (working copies)', 'a', { page: 'editsched' })
  await W.toastSpy(p)
  const s1 = await snap()
  b24.reload = { before: s0, after: s1 }
  fact('B24.reload', b24.reload)
  L.check('B24 after a reload every row draws the same men on the same seats (Monday pax, Wednesday IAT-3, AMT BOX, EP-2)', JSON.stringify(s0) === JSON.stringify(s1), { s0, s1 })
  await focusRow(I); await pic('B24-1-wed-sims-after-reload')
  /* publish Wednesday (its first issue) and Monday's amendment */
  await p.evaluate(() => window.scrollTo(0, 0))
  b24.wedPub = { sign: await W.signDay(p, WED), pub: await W.publishDay(p, WED), head: await W.head(p, WED) }
  await W.boardOn(p, MON); await p.evaluate(() => window.scrollTo(0, 0))
  b24.monPub = { sign: await W.signDay(p, MON), pub: await W.publishAL(p, MON), head: await W.head(p, MON) }
  fact('B24.publish', b24); await L.settle(p)
  await pic('B24-2-mon-board-AL1-published')
  const lists = await everyList()
  const mine = lists.filter(x => x.list.some(v => ['mamba', 'vegas', 'slash'].includes(v)) || x.list.some(v => v === null || v === ''))
  b24.lists = mine.map(x => `${x.key} ${x.path} [${x.label}] = ${JSON.stringify(x.list)}`)
  b24.allLists = lists.length
  b24.bad = lists.filter(x => !allText(x.list)).map(x => `${x.key} ${x.path} = ${JSON.stringify(x.list)}`)
  fact('B24.storedLists', b24.lists); fact('B24.bad', b24.bad)
  L.check('B24 after publication every `more` / `pax` list in every stored week row — the working days and the issued versions — is text only', lists.length > 0 && b24.bad.length === 0, b24.bad.length ? b24.bad : `${lists.length} lists read`)
  L.check('B24 the padded lists are stored more than once (the working day and its issued version)', mine.filter(x => x.list.includes('slash')).length >= 2 && mine.filter(x => x.list.includes('mamba') && x.list.length === 10).length >= 2, b24.lists)
  /* View-only Sched — the issued faces */
  await W.boardOff(p); await L.go(p, 'viewsched')
  await W.showDay(p, WED, '#vWeek')
  b24.view = { iat: await viewRow(WED, 'IAT-3'), ep2: await viewRow(WED, 'EP-2') }
  await B.sleep(250); await pic('B24-3-viewsched-wed-issued-sims')
  b24.view.box = await viewRow(WED, 'BOX'); await B.sleep(200); await pic('B24-4-viewsched-wed-issued-amt')
  await W.showDay(p, MON, '#vWeek')
  b24.view.mon = await viewRow(MON, 'BOX'); await B.sleep(250); await pic('B24-5-viewsched-mon-issued-amt')
  b24.view.heads = await p.evaluate(() => [0, 2].map(d => { const e = document.querySelector(`#vWeek .day[data-day="${d}"] .verchip`); return e ? e.innerText.trim() : null }))
  fact('B24.view', b24.view)
  const names = v => Array.isArray(v) ? v.map(x => x.who).join(',') : String(v)
  L.check('B24 View-only Sched (issued): IAT-3 shows Recon, Quill and Sidewinder; EP-2 shows Saber, Ledger, Ranger, Piston and Blade; the AMT BOX Anvil, Ace and Vapor', names(b24.view.iat) === 'prism,nasty,mamba' && names(b24.view.ep2) === 'stiff,drill,bane,pump,slash' && names(b24.view.box) === 'shaft,dj,vegas', { iat: names(b24.view.iat), ep2: names(b24.view.ep2), box: names(b24.view.box) })
  L.check('B24 View-only Sched (issued Monday): the AMT BOX shows its eight passengers and Sidewinder', names(b24.view.mon).split(',').length === 9 && names(b24.view.mon).endsWith(',mamba'), names(b24.view.mon))
  /* a reload on the issued faces */
  await L.reloadCompare(p, 'B24 reload (after publication)', 'a', { page: 'viewsched' })
  await W.showDay(p, WED, '#vWeek')
  const v2 = { iat: names(await viewRow(WED, 'IAT-3')), ep2: names(await viewRow(WED, 'EP-2')), box: names(await viewRow(WED, 'BOX')) }
  await W.showDay(p, MON, '#vWeek'); v2.mon = names(await viewRow(MON, 'BOX'))
  b24.viewReloaded = v2; fact('B24.view.reloaded', v2)
  L.check('B24 after a reload the issued faces show the same', v2.iat === names(b24.view.iat) && v2.ep2 === names(b24.view.ep2) && v2.box === names(b24.view.box) && v2.mon === names(b24.view.mon), v2)
  await pic('B24-6-viewsched-mon-after-reload')
  const bad2 = (await everyList()).filter(x => !allText(x.list)).map(x => `${x.key} ${x.path} = ${JSON.stringify(x.list)}`)
  L.check('B24 after the reload the stored lists are still text only', bad2.length === 0, bad2)
  /* the board again: the working copy after publication + reload */
  await W.boardOn(p, WED); const sW = { iat: S(await seats(I)), amt: S(await seats(A)), ep2: S(await seats(`s:${WED}.oft.${w.ep2.ri}`)) }
  b24.boardAfter = sW; fact('B24.board.after', sW)
  L.check('B24 the board after publication and reload: the same seats', JSON.stringify(sW) === JSON.stringify(s1.wed), { sW, was: s1.wed })
  await focusRow(I); await pic('B24-7-wed-board-after-publication-reload')
})
row('B24', 'Reload (working copies); Wednesday signed and published (Publish day), Monday signed and its amendment published (Publish AL1); every stored week row read; View-only Sched for both days; reload; the board again. Before that, on the published Monday: the day\'s count → the changes window, To go out',
  `Monday read "${facts['B24c.pending']}", changes window lines: ${JSON.stringify(chg && chg.lines)}; reload: same seats ${JSON.stringify(b24.reload && b24.reload.after)}; published ${JSON.stringify(b24.wedPub && b24.wedPub.pub)} / ${JSON.stringify(b24.monPub && b24.monPub.pub)}, heads ${JSON.stringify(b24.view && b24.view.heads)}; View-only Sched rows: ${JSON.stringify(b24.viewReloaded)}`,
  `${b24.allLists} stored lists read, not text: ${JSON.stringify(b24.bad)}; the padded ones: ${JSON.stringify(b24.lists)}`, ok(/^B24/) ? 'PASS' : 'FAIL', pics.filter(f => /^B24/.test(f)))

fact('errors', errors)
B.saveSection('w2-second-spare-seat', { table, checks: L.results, facts, errors, pics })
console.log(`\n${L.results.filter(r => r.ok).length}/${L.results.length} checks passed; errors: ${errors.length}`, errors)
await browser.close()
