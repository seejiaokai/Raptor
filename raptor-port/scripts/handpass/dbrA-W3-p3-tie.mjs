/* W3 probe 3 — part F's F8: an Ack on ONE of two records at one man's day rewrote the OTHER record's row (its place
   `ord` changed). Two questions, each from a fresh world:
     T1  ONE tab: the admin bids Ranger's morning, then his afternoon, on 3 Mar; Ack the morning — is the afternoon's
         row rewritten? (the places, before and after)
     T2  TWO tabs (A Saber, B Ranger opened before either bid): A bids the morning, B (stale) the afternoon — both get
         the same place; reload both; then B (Ranger) DELETES his afternoon; A (not reloaded, still shows it) Acks the
         morning; reload both — is Ranger's deleted afternoon back? */
import { fileURLToPath } from 'node:url'
const ROOT0 = fileURLToPath(new URL('../../', import.meta.url)).split('\\').join('/').replace(/\/$/, '')
process.env.HP_OUT ||= `${ROOT0}/docs/handpass/parts/dbrA-W3-p3-tie.json`
const W = await import('./dbrA-W3-lib.mjs')
const { L, lwOpen, tapCell, sheetNow, sheetPress, closeSheets, bidOn, recsAt, pic, row, rowsSummary } = W
const REC = /^leavewar\/rec:/
const ME = 'bane', D = '2026-03-03'
const errors = []
const places = r => recsAt(r, ME, D).map(x => `${x.code}/${x.state}#${x.ord}(${x.key.slice(-6)})`)

/* T1 */
{
  const browser = await L.launch(); const ctx = await L.context(browser)
  const A = await W.newPage(ctx, errors, 'T1')
  await L.signIn(A, 'a'); await L.settle(A); await lwOpen(A, D)
  const a1 = await L.step(A, 'T1 one tab: the admin bids Ranger\'s MORNING, 3 Mar', async () => bidOn(A, ME, D, 'LL', { portion: 'am' }), { put: [REC], only: true })
  const a2 = await L.step(A, 'T1 … then his AFTERNOON', async () => {
    const t = await tapCell(A, ME, D)
    if (t.open === 'bid-picker') { await sheetPress(A, 'portion-pm'); await sheetPress(A, 'bid-LL'); let s = await sheetNow(A); if (/Tap the same leave again/i.test(s.text || '')) { await sheetPress(A, 'bid-LL'); s = await sheetNow(A) } if (s.open !== 'nothing') await closeSheets(A) } else await closeSheets(A)
  }, { put: [REC], only: true })
  const r0 = await L.rows(A)
  const am = a1.put[0], pm = a2.put[0], amId = JSON.parse(r0[am]).id
  console.log('T1 places before the Ack:', places(r0))
  const k = await L.step(A, 'T1 Ack the morning (the day\'s list)', async () => { await tapCell(A, ME, D); await sheetPress(A, `dl-ack-${amId}`); const s = await sheetNow(A); if (s.open !== 'nothing') await closeSheets(A) })
  const r1 = await L.rows(A)
  console.log('T1 places after the Ack:', places(r1), 'rows written:', k.put)
  L.check('T1 — one tab: the Ack writes ONLY the morning\'s row; the afternoon\'s is untouched', k.put.filter(x => REC.test(x)).join() === am && r1[pm] === r0[pm], { put: k.put, before: places(r0), after: places(r1) })
  row({ step: 'T1 one tab, Ack one of two', width: 'desktop', did: 'admin: Ranger 3 Mar Morning LL, then Afternoon LL; the day\'s list → Ack on the morning', screen: `places ${places(r0).join(' ')} → ${places(r1).join(' ')}`, rows: rowsSummary(k), ok: L.results.slice(-2).every(x => x.ok), pics: [] })
  await browser.close()
}

/* T2 */
{
  const browser = await L.launch(); const ctx = await L.context(browser)
  const A = await W.newPage(ctx, errors, 'T2A')
  await L.signIn(A, 'a'); await L.settle(A); await lwOpen(A, D)
  const B = await W.newPage(ctx, errors, 'T2B')
  await L.signIn(B, 'm'); await lwOpen(B, D)
  const a1 = await L.step(A, 'T2 (A, Saber) Ranger\'s MORNING, 3 Mar', async () => bidOn(A, ME, D, 'LL', { portion: 'am' }), { put: [REC], only: true })
  const b1 = await L.step(B, 'T2 (B, Ranger, not reloaded) his AFTERNOON, 3 Mar', async () => bidOn(B, ME, D, 'LL', { portion: 'pm' }), { put: [REC], only: true })
  const am = a1.put[0], pm = b1.put[0]
  for (const [p, who] of [[A, 'a'], [B, 'm']]) { await p.reload(); await L.signIn(p, who, { goto: false }); await lwOpen(p, D) }
  const r0 = await L.rows(A)
  console.log('T2 places after both bids and both reloads:', places(r0))
  const pmId = JSON.parse(r0[pm]).id, amId = JSON.parse(r0[am]).id
  /* B (Ranger) deletes his afternoon */
  const b2 = await L.step(B, 'T2 (B, Ranger) deletes his afternoon from the day\'s list', async () => {
    const t = await tapCell(B, ME, D)
    const btn = t.buttons.find(x => x.startsWith(`dl-clear-${pmId}`)) ? `dl-clear-${pmId}` : 'bid-clear'
    let p = await sheetPress(B, btn); let s = await sheetNow(B)
    if (s.open !== 'nothing' && s.buttons.some(x => /sure/i.test(x))) { await sheetPress(B, btn); s = await sheetNow(B) }
    if (s.open !== 'nothing') await closeSheets(B)
    return { opened: t.open, buttons: t.buttons, btn }
  }, { del: [REC], only: true })
  L.check('T2 — Ranger\'s delete removed his afternoon\'s row', b2.del.includes(pm), { del: b2.del, ret: b2.ret })
  /* A (not reloaded — still shows the afternoon) Acks the morning */
  const a2 = await L.step(A, 'T2 (A, Saber, not reloaded — still sees the afternoon) Acks the morning', async () => { const t = await tapCell(A, ME, D); await sheetPress(A, `dl-ack-${amId}`); const s = await sheetNow(A); if (s.open !== 'nothing') await closeSheets(A); return { lines: t.lines } })
  const r2 = await L.rows(A)
  console.log('T2 A\'s Ack wrote:', a2.put, a2.del, 'places now:', places(r2))
  for (const [p, who] of [[A, 'a'], [B, 'm']]) { await p.reload(); await L.signIn(p, who, { goto: false }); await lwOpen(p, D) }
  const t = await tapCell(A, ME, D)
  await pic(A, 'P3-T2-A-after-both-reloaded')
  await closeSheets(A)
  const r3 = await L.rows(A)
  L.check('T2 — after reloading both, Ranger\'s deleted afternoon stays deleted (A\'s Ack on the morning must not bring it back)', !(pm in r3), { afternoonBack: pm in r3, places: places(r3), sheet: t.open, lines: t.lines, text: (t.text || '').slice(0, 160), aAckPut: a2.put })
  row({ step: 'T2 two tabs: Ack one of two after the other was deleted elsewhere', width: 'desktop', did: 'A: Ranger 3 Mar Morning; B (Ranger, stale): Afternoon; reload both; B: delete his Afternoon; A (stale): Ack the Morning; reload both', screen: `3 Mar after: ${t.open} ${JSON.stringify(t.lines && t.lines.length ? t.lines : (t.text || '').slice(0, 80))}`, rows: `B delete: ${rowsSummary(b2)} || A ack: ${rowsSummary(a2)}`, ok: L.results.slice(-2).every(x => x.ok) })
  await browser.close()
}
L.check('probe 3 — no console errors', !errors.length, errors)
L.save({ table: W.TABLE, errors })
