/* [DB-READINESS] group A FULL walk — W1 part H: the scenario designer's 23 and 24 (folded in at the host's word).
   23  (a) edit → Undo → Redo → reload: the edit is there. (b) three quick edits, then the page CLOSED (not reloaded) and a
       new page opened on the same browser, signed in: all three there, every row named by a batch.
   24  two tabs: A on week 13 (saved), B moved to week 20. B files a leave dated in week 13 on the Inputs page. A (never
       reloaded) opens week 20, edits Tuesday there, comes back to week 13, then reloads → both kept, and no bare write.
       Then the same door the other way: B (still never reloaded, holding week 20 as it was before A's save) files a leave
       dated in week 20 — does A's Tuesday survive?
   Desktop 1440×900, fresh worlds. Usage (from raptor-port/scripts/handpass): node dbrA-W1-h.mjs */
import * as W from './dbrA-W1-lib.mjs'
const L = await W.boot('h')
const { fileInput } = await import('./am/w4-lib.mjs')
const { WK, WK2, day, ELOG, esc } = W
const WKROW = new RegExp('^' + esc(WK) + '$'), WK2ROW = new RegExp('^' + esc(WK2) + '$')
const browser = await L.launch()
const errors = []
const { T, S, pic, note } = W.table(L, '1440')
const txt = (p, k) => p.evaluate(k => window.txtGet(k), k)
const chip = (p, v) => p.locator(`[data-wk="${v}"]:visible`).first()
const toWeek = async (p, v) => { await W.boardOff(p); await W.toEdit(L, p); await chip(p, v).click(); await p.waitForTimeout(900) }
async function row(id, did, fn) {
  const cur = { step: id, width: '1440', did, pics: [], shown: '', rows: '', batches: [], notes: [] }
  T.push(cur)
  const n0 = L.results.length
  try { await fn(cur) } catch (e) { L.check(`${id} ran`, false, String(e && e.stack || e).slice(0, 600)) }
  cur.pass = L.results.slice(n0).every(r => r.ok)
  cur.fails = L.results.slice(n0).filter(r => !r.ok).map(r => r.name + ' :: ' + r.detail)
  return cur
}
const shotTo = async (cur, pg, name) => { await L.shot(pg, name); cur.pics.push(name + '.png') }
const auditCheck = (id, a) => L.check(`${id} every row written is named by a change-log batch`, !a.bare.length && !a.wrongOp.length && !a.phantom.length, a.bare.length || a.wrongOp.length || a.phantom.length ? { bare: a.bare, wrongOp: a.wrongOp, phantom: a.phantom } : `put ${a.put.join(', ')} · batches ${a.batches.map(b => b.type + '/' + b.n).join(' ')}`)

/* ======================= 23 (a) ======================= */
{
  const ctx = await L.context(browser)
  const p = await L.page(ctx, errors, 'W1h-23a')
  await L.signIn(p, 'a'); await W.toEdit(L, p); await W.toastSpy(p)
  await S(p, 'W1.H23a', 'fresh world: Monday note typed (no reload — Undo and Redo come next)', () => W.weekText(p, 'dn:0.0', 'H23 REDO ME'),
    { reload: false, expect: { put: [WKROW, day(WK, 0), ELOG], also: [/^weeks\/13-07-2026#\d$/], only: true }, onScreen: () => W.showDay(p, 0) })
  await S(p, 'W1.H23b', 'the top bar\'s ↶ Undo (no reload)', () => W.door(p, 'top', 'undo'),
    { reload: false, expect: { put: [day(WK, 0)], also: [ELOG], only: true }, onScreen: () => W.showDay(p, 0), after: async (a) => note(`W1.H23b ${JSON.stringify(a.ret)}`) })
  await S(p, 'W1.H23c', 'the top bar\'s ↷ Redo; then reload', () => W.door(p, 'top', 'redo'),
    { expect: { put: [day(WK, 0)], also: [ELOG], only: true }, onScreen: () => W.showDay(p, 0), after: async (a) => note(`W1.H23c ${JSON.stringify(a.ret)}`),
      show: async () => `Monday's note after the reload "${await txt(p, 'dn:0.0')}"` })
  L.check('W1.H23c after the reload the redone edit is there', (await txt(p, 'dn:0.0')) === 'H23 REDO ME', await txt(p, 'dn:0.0'))
  await ctx.close()
}

/* ======================= 23 (b) — three quick edits, then the page CLOSED ======================= */
await row('W1.H23d', 'three day notes typed on Tue, Wed, Thu inside about a second, then the page CLOSED; a new page opened on the same browser and signed in', async (cur) => {
  const ctx = await L.context(browser)
  let p = await L.page(ctx, errors, 'W1h-23d')
  await L.signIn(p, 'a'); await W.toEdit(L, p)
  /* the week already saved once, so the three edits are three day rows */
  await L.step(p, 'W1.H23d setup: Monday note (the week saved)', () => W.weekText(p, 'dn:0.0', 'H23 SETUP'))
  const rows0 = await L.rows(p)
  await W.showDay(p, 1)
  const quick = async (k, v) => { const el = p.locator(`#eWeek [data-txt="${k}"]:visible`).first(); await el.click(); await p.keyboard.press('Control+A'); await p.keyboard.type(v); await el.evaluate(e => e.blur()) }
  const t0 = Date.now()
  await quick('dn:1.0', 'C1 TUE'); await quick('dn:2.0', 'C2 WED'); await quick('dn:3.0', 'C3 THU')
  const ms = Date.now() - t0
  await p.close()
  p = await L.page(ctx, errors, 'W1h-23d-new')
  await L.signIn(p, 'a'); await W.toEdit(L, p); await L.settle(p, 700)
  const got = [await txt(p, 'dn:1.0'), await txt(p, 'dn:2.0'), await txt(p, 'dn:3.0')]
  L.check(`W1.H23d typed in ${ms} ms; after the close and a new page: Tue / Wed / Thu read C1 / C2 / C3`, got.join('|') === 'C1 TUE|C2 WED|C3 THU', got.join(' | '))
  const a = L.audit(rows0, await L.rows(p))
  auditCheck('W1.H23d', a)
  L.check('W1.H23d it wrote exactly Tuesday, Wednesday and Thursday and three history lines', [...a.put, ...a.del].every(k => [day(WK, 1), day(WK, 2), day(WK, 3), ELOG].some(re => re.test(k))) && a.put.filter(k => ELOG.test(k)).length === 3, [...a.put, ...a.del].join(', '))
  cur.rows = `put ${a.put.join(', ')} · batches ${a.batches.map(b => `${b.type}/${b.n} by ${b.actorId}`).join(' + ')}`
  cur.shown = `after the page was closed and a new one opened: Tue "${got[0]}", Wed "${got[1]}", Thu "${got[2]}" (typed in ${ms} ms)`
  await W.showDay(p, 1); await shotTo(cur, p, 'W1.H23d-2-newpage')
  await ctx.close()
})

/* ======================= 24 ======================= */
await row('W1.H24', 'two tabs: B (on week 20) files a leave dated in week 13; A (never reloaded, on week 13) opens week 20, edits Tuesday there, comes back to week 13, then reloads', async (cur) => {
  const ctx = await L.context(browser)
  const a = await L.page(ctx, errors, 'W1h-24A'), b = await L.page(ctx, errors, 'W1h-24B')
  await L.signIn(a, 'a'); await W.toEdit(L, a)
  await L.step(a, 'W1.H24 setup: week 13 saved (Monday note in A)', () => W.weekText(a, 'dn:0.0', 'H24 SETUP'))
  await L.signIn(b, 'a'); await W.toEdit(L, b)
  await toWeek(b, '20/07/2026')
  const ranger = await b.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Ranger'))
  const sB = await L.step(b, 'W1.H24 tab B (on week 20): a leave for Ranger on Wed 15 Jul filed on the Inputs page',
    () => fileInput(b, { person: ranger, type: 'LL', from: '2026-07-15', remarks: 'H24 B LEAVE' }), { put: [/^inputs\//], also: [ELOG, /^leavewar\//], only: true })
  const iid = sB.ret && sB.ret.iid
  note(`W1.H24 B filed: ${JSON.stringify(sB.ret)} · rows ${sB.put.join(', ')}`)
  await L.step(a, 'W1.H24 tab A (never reloaded): the week chip "Jul 20"', () => toWeek(a, '20/07/2026'), { none: true })
  await L.step(a, 'W1.H24 tab A: week 20 Tuesday note (its first save)', () => W.weekText(a, 'dn:1.0', 'H24 A WK20 TUE'), { put: [WK2ROW, day(WK2, 1), ELOG], also: [/^weeks\/20-07-2026#\d$/], only: true })
  await L.step(a, 'W1.H24 tab A: the week chip "Jul 13" — back (no reload)', () => toWeek(a, '13/07/2026'), { none: true })
  /* A reloads: the boot opens on week 13 — a SAVED week — and lands B's leave on Wednesday */
  const r0 = await L.rows(a)
  await a.reload(); await L.signIn(a, 'a', { goto: false }); await W.toEdit(L, a); await L.settle(a, 800)
  const r1 = await L.rows(a)
  const ad = L.audit(r0, r1)
  cur.rows = `A's reload wrote: put ${ad.put.join(', ') || 'nothing'} · batches ${ad.batches.map(x => `${x.type}/${x.n}`).join(' ') || 'none'}${ad.bare.length ? ' · BARE: ' + ad.bare.join(', ') : ''}`
  const known = ad.bare.length ? ' — known — H1 (a reload that opens on a saved week re-lands a request filed since and writes that day\'s row with no change-log batch)' : ''
  L.check(`W1.H24 A's reload: every row it wrote is named by a change-log batch${known}`, !ad.bare.length && !ad.wrongOp.length, { bare: ad.bare, put: ad.put })
  /* found by its own remarks (the list is kept in its stored order, so "the last one" is not always the new one) */
  const hasIn = await a.evaluate(() => window.INPUTS.some(x => /H24 B LEAVE/.test(x.rmk || x.remarks || x.rmks || JSON.stringify(x))))
  const onWed = await a.evaluate(() => (document.querySelector('#eWeek .day[data-day="2"]') || {}).innerText || '').then(t => /Ranger/.test(t))
  await toWeek(a, '20/07/2026')
  const tue20 = await txt(a, 'dn:1.0')
  L.check('W1.H24 after A\'s reload BOTH are there: B\'s leave (in the requests) and A\'s week-20 Tuesday note', hasIn && tue20 === 'H24 A WK20 TUE', JSON.stringify({ hasIn, tue20 }))
  cur.shown = `after A's reload: B's leave in the requests ${hasIn}, Ranger named on Wed 15 Jul's schedule ${onWed}; week 20 Tuesday "${tue20}"${known}`
  await W.showDay(a, 1); await shotTo(cur, a, 'W1.H24-2-A-week20-after-reload')
  await toWeek(a, '13/07/2026'); await W.showDay(a, 2); await shotTo(cur, a, 'W1.H24-3-A-week13-wed-after-reload')
  /* a second reload writes nothing */
  const r2 = await L.rows(a)
  await a.reload(); await L.signIn(a, 'a', { goto: false }); await W.toEdit(L, a); await L.settle(a, 800)
  const d2 = L.diff(r2, await L.rows(a))
  L.check('W1.H24 A\'s second reload writes nothing', !d2.put.length && !d2.del.length, d2.put.join(', '))

  /* the same door the other way — B still holds week 20 as it was before A's save */
  const sB2 = await L.step(b, 'W1.H24 tab B (never reloaded, week 20 as it was before A\'s save): a leave for Ranger on Thu 23 Jul filed',
    () => fileInput(b, { person: ranger, type: 'LL', from: '2026-07-23', remarks: 'H24 B LEAVE WK20' }))
  note(`W1.H24 B's second filing wrote: ${sB2.put.join(', ')} · batches ${sB2.batches.map(x => x.type + '/' + x.n).join(' ')}`)
  await a.reload(); await L.signIn(a, 'a', { goto: false }); await toWeek(a, '20/07/2026')
  const tue20b = await txt(a, 'dn:1.0')
  const wrote7 = sB2.put.filter(k => /^weeks\/20-07-2026#\d$/.test(k)).length
  cur.notes.push(`B's filing into week 20 wrote ${wrote7} of week 20's day rows; after A reloads, week 20 Tuesday reads "${tue20b}"${tue20b !== 'H24 A WK20 TUE' ? ' — A\'s edit LOST: known — H3 (a week\'s first save, as B sees it, writes all seven day rows from B\'s stale copy), reached here through the Inputs page' : ''}`)
  L.check(`W1.H24 B's leave filed into week 20 (a week B never saw saved) keeps A's week-20 Tuesday note${tue20b !== 'H24 A WK20 TUE' ? ' — known — H3, through another door' : ''}`, tue20b === 'H24 A WK20 TUE', JSON.stringify({ tue20b, wrote7, rows: sB2.put }))
  await W.showDay(a, 1); await shotTo(cur, a, 'W1.H24-4-A-week20-after-B-filed-into-it')
  await ctx.close()
})

/* 24 (c) — the same, with a request that LANDS AS A ROW on the day (an appointment goes onto the Ground Programme) */
await row('W1.H24c', 'two tabs: B (on week 20) files an APPOINTMENT for Thu 16 Jul (it lands as a Ground Programme row); A (never reloaded, on saved week 13) reloads', async (cur) => {
  const ctx = await L.context(browser)
  const a = await L.page(ctx, errors, 'W1h-24cA'), b = await L.page(ctx, errors, 'W1h-24cB')
  await L.signIn(a, 'a'); await W.toEdit(L, a)
  await L.step(a, 'W1.H24c setup: week 13 saved (Monday note in A)', () => W.weekText(a, 'dn:0.0', 'H24C SETUP'))
  await L.signIn(b, 'a'); await W.toEdit(L, b)
  await toWeek(b, '20/07/2026')
  const ranger = await b.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Ranger'))
  const sB = await L.step(b, 'W1.H24c tab B (on week 20): an Appointment for Ranger on Thu 16 Jul 10:00–11:00',
    () => fileInput(b, { person: ranger, type: 'Appointment', from: '2026-07-16', span: 'custom', start: '10:00', end: '11:00', remarks: 'H24C APPT' }))
  note(`W1.H24c B filed: ${JSON.stringify(sB.ret)} · rows ${sB.put.join(', ')} · batches ${sB.batches.map(x => x.type + '/' + x.n).join(' ')}`)
  const thu0 = await a.evaluate(() => JSON.stringify(window.DAYS[3].ground))
  const r0 = await L.rows(a)
  await a.reload(); await L.signIn(a, 'a', { goto: false }); await W.toEdit(L, a); await L.settle(a, 800)
  const r1 = await L.rows(a)
  const ad = L.audit(r0, r1)
  const landed = await a.evaluate(() => (window.DAYS[3].ground || []).some(g => /H24C APPT|Appointment|APPOINTMENT/i.test(JSON.stringify(g))) )
  cur.rows = `A's reload wrote: put ${ad.put.join(', ') || 'nothing'} · batches ${ad.batches.map(x => `${x.type}/${x.n} by ${x.actorId}`).join(' ') || 'none'}${ad.bare.length ? ' · BARE: ' + ad.bare.join(', ') : ''}`
  const known = ad.bare.length ? " — known — H1 (a reload that opens on a saved week re-lands a request filed since and writes that day's row with no change-log batch)" : ''
  L.check(`W1.H24c A's reload: every row it wrote is named by a change-log batch${known}`, !ad.bare.length && !ad.wrongOp.length, { bare: ad.bare, put: ad.put })
  cur.shown = `after A's reload the appointment is on Thursday's Ground Programme: ${landed} (Thursday's ground rows changed: ${thu0 !== await a.evaluate(() => JSON.stringify(window.DAYS[3].ground))})${known}`
  await W.showDay(a, 3); await W.focus(a, '#eWeek .day[data-day="3"] [data-fill^="g:3."]'); await shotTo(cur, a, 'W1.H24c-2-A-thursday-after-reload')
  const r2 = await L.rows(a)
  await a.reload(); await L.signIn(a, 'a', { goto: false }); await W.toEdit(L, a); await L.settle(a, 800)
  const d2 = L.diff(r2, await L.rows(a))
  L.check("W1.H24c A's second reload writes nothing", !d2.put.length && !d2.del.length, d2.put.join(', '))
  await ctx.close()
})

/* 24 (d) — the other door into H3: a request that LANDS on a week the filing tab holds but never saw saved */
await row('W1.H24d', "two tabs, both on week 20: A types Tuesday's note (the week's first save); B (not reloaded) files an APPOINTMENT for Thu 23 Jul on the Inputs page (it lands on Thursday); both reloaded", async (cur) => {
  const ctx = await L.context(browser)
  const a = await L.page(ctx, errors, 'W1h-24dA'), b = await L.page(ctx, errors, 'W1h-24dB')
  await L.signIn(a, 'a'); await W.toEdit(L, a); await toWeek(a, '20/07/2026')
  await L.signIn(b, 'a'); await W.toEdit(L, b); await toWeek(b, '20/07/2026')
  await L.step(a, "W1.H24d tab A: week 20 Tuesday note (the week's first save)", () => W.weekText(a, 'dn:1.0', 'H24D A TUE'))
  const ranger = await b.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Ranger'))
  const sB = await L.step(b, "W1.H24d tab B (never saw A's save): an Appointment for Ranger on Thu 23 Jul 10:00–11:00",
    () => fileInput(b, { person: ranger, type: 'Appointment', from: '2026-07-23', span: 'custom', start: '10:00', end: '11:00', remarks: 'H24D APPT' }))
  const days = sB.put.filter(k => /^weeks\/20-07-2026/.test(k))
  cur.rows = `B's filing wrote: ${sB.put.join(', ')} · batches ${sB.batches.map(x => `${x.type}/${x.n}`).join(' ')}`
  await a.reload(); await L.signIn(a, 'a', { goto: false }); await toWeek(a, '20/07/2026')
  const tue = await txt(a, 'dn:1.0')
  const appt = await a.evaluate(() => (window.DAYS[3].ground || []).some(g => /Appointment|APPOINTMENT|H24D/i.test(JSON.stringify(g))))
  const lost = tue !== 'H24D A TUE'
  cur.shown = `after A's reload: week 20 Tuesday "${tue}"${lost ? " — A's edit LOST" : ''}; B's appointment on Thursday: ${appt}; B's filing wrote ${days.length} of week 20's rows (${days.join(', ')})${lost ? ' — known — H3, reached through the Inputs page (a request landing on a week the filing tab never saw saved)' : ''}`
  L.check(`W1.H24d B's appointment and A's Tuesday note are both kept${lost ? ' — known — H3 (through the Inputs page)' : ''}`, !lost && appt, JSON.stringify({ tue, appt, days }))
  await W.showDay(a, 1); await shotTo(cur, a, 'W1.H24d-2-A-week20-after-reload')
  await ctx.close()
})

const fails = L.save({ table: T, errors })
console.log('errors:', JSON.stringify(errors, null, 1))
await browser.close()
process.exitCode = fails ? 1 : 0
