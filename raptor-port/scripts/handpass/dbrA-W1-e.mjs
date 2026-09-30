/* [DB-READINESS] group A FULL walk — W1 part E (beside the brief's list, the schedule's share of "two people changing
   DIFFERENT things never overwrite each other"): two tabs of one browser = two people on one store. The app never
   re-reads storage while open, so tab B, opened BEFORE A's change, still holds the old picture when it makes its own.
     E1  a week NOBODY has saved yet: A types Monday's note, B (not reloaded) types Tuesday's → reload both → both?
     E2  a week already saved:       A types Monday's note, B (not reloaded) types Tuesday's → reload both → both?
     E3  the same day, different things (Monday's note in A, Monday's second note in B) — the day row is one row, so
         this is the case the day lock (group B, D355 / D450) exists for; recorded, not judged here.
   Desktop 1440×900. Usage (from raptor-port/scripts/handpass): node dbrA-W1-e.mjs */
import * as W from './dbrA-W1-lib.mjs'
const L = await W.boot('e')
const { WK, day, ELOG } = W
const browser = await L.launch()
const errors = []
const { T, pic, note } = W.table(L, '1440')
const txt = (pg, k) => pg.evaluate(k => window.txtGet(k), k)

async function twoTabs(tag) {
  const ctx = await L.context(browser)
  const a = await L.page(ctx, errors, `${tag}-A`), b = await L.page(ctx, errors, `${tag}-B`)
  await L.signIn(a, 'a'); await W.toEdit(L, a)
  await L.signIn(b, 'a'); await W.toEdit(L, b)
  return { ctx, a, b }
}
async function row(id, did, fn) {
  const cur = { step: id, width: '1440', did, pics: [], shown: '', rows: '', batches: [], notes: [] }
  T.push(cur)
  const n0 = L.results.length
  try { await fn(cur) } catch (e) { L.check(`${id} ran`, false, String(e && e.stack || e).slice(0, 600)) }
  cur.pass = L.results.slice(n0).every(r => r.ok)
  cur.fails = L.results.slice(n0).filter(r => !r.ok).map(r => r.name + ' :: ' + r.detail)
}
const shotTo = async (cur, pg, name) => { await L.shot(pg, name); cur.pics.push(name + '.png') }

/* E1 — the week's FIRST save made by two people at once */
await row('W1.E1', 'two tabs on a week nobody has saved: A types Monday\'s note; B (opened before, not reloaded) types Tuesday\'s; both reloaded', async (cur) => {
  const { ctx, a, b } = await twoTabs('E1')
  const r0 = await L.rows(a)
  const sa = await L.step(a, 'W1.E1 tab A: Monday note (the week\'s first save)', () => W.weekText(a, 'dn:0.0', 'E1 A MONDAY'))
  const sb = await L.step(b, 'W1.E1 tab B: Tuesday note (B never saw A\'s save)', () => W.weekText(b, 'dn:1.0', 'E1 B TUESDAY'))
  cur.rows = `A: put ${sa.put.join(', ')} · B: put ${sb.put.join(', ')}`
  const monRowAfterB = (await L.rows(b))[`${WK}#0`]
  note(`W1.E1 Monday's stored row after B's save names A's note: ${/E1 A MONDAY/.test(monRowAfterB || '')}`)
  await a.reload(); await L.signIn(a, 'a', { goto: false }); await W.toEdit(L, a)
  await b.reload(); await L.signIn(b, 'a', { goto: false }); await W.toEdit(L, b)
  const got = { aMon: await txt(a, 'dn:0.0'), aTue: await txt(a, 'dn:1.0'), bMon: await txt(b, 'dn:0.0'), bTue: await txt(b, 'dn:1.0') }
  cur.shown = `after both reloads: Monday "${got.aMon}", Tuesday "${got.aTue}"`
  await W.showDay(a, 0); await shotTo(cur, a, 'W1.E1-2-reloaded-A')
  L.check('W1.E1 after the reloads BOTH notes are there (A\'s Monday and B\'s Tuesday)', got.aMon === 'E1 A MONDAY' && got.aTue === 'E1 B TUESDAY', JSON.stringify(got))
  await ctx.close()
})

/* E2 — two people on a week already saved */
await row('W1.E2', 'two tabs on a week already saved: A types Monday\'s note; B (not reloaded) types Tuesday\'s; both reloaded', async (cur) => {
  const { ctx, a, b } = await twoTabs('E2')
  /* the week saved once, and both tabs reloaded onto it */
  await L.step(a, 'W1.E2 setup: Wednesday note (the week saved)', () => W.weekText(a, 'dn:2.0', 'E2 SETUP WED'))
  await a.reload(); await L.signIn(a, 'a', { goto: false }); await W.toEdit(L, a)
  await b.reload(); await L.signIn(b, 'a', { goto: false }); await W.toEdit(L, b)
  const sa = await L.step(a, 'W1.E2 tab A: Monday note', () => W.weekText(a, 'dn:0.0', 'E2 A MONDAY'), { put: [day(WK, 0), ELOG], only: true })
  const sb = await L.step(b, 'W1.E2 tab B: Tuesday note (B never saw A\'s)', () => W.weekText(b, 'dn:1.0', 'E2 B TUESDAY'), { put: [day(WK, 1), ELOG], only: true })
  cur.rows = `A: put ${sa.put.join(', ')} · B: put ${sb.put.join(', ')}`
  await a.reload(); await L.signIn(a, 'a', { goto: false }); await W.toEdit(L, a)
  await b.reload(); await L.signIn(b, 'a', { goto: false }); await W.toEdit(L, b)
  const got = { mon: await txt(a, 'dn:0.0'), tue: await txt(a, 'dn:1.0'), wed: await txt(a, 'dn:2.0'), bMon: await txt(b, 'dn:0.0') }
  cur.shown = `after both reloads: Monday "${got.mon}", Tuesday "${got.tue}", Wednesday "${got.wed}"`
  await W.showDay(a, 0); await shotTo(cur, a, 'W1.E2-2-reloaded-A')
  L.check('W1.E2 after the reloads BOTH notes are there, and the setup note too', got.mon === 'E2 A MONDAY' && got.tue === 'E2 B TUESDAY' && got.wed === 'E2 SETUP WED' && got.bMon === 'E2 A MONDAY', JSON.stringify(got))
  /* both tabs' history lines kept */
  const lines = await a.evaluate(() => window.ELOG.rows.map(r => r.lbl + ' @' + r.date))
  note(`W1.E2 history after the reloads: ${JSON.stringify(lines)}`)
  await ctx.close()
})

/* E3 — the same day, different things: recorded (the day is one row; the day lock of group B is the guard) */
await row('W1.E3', 'two tabs, the SAME day: A types Monday\'s first note, B (not reloaded) Monday\'s second — recorded for the day lock (group B)', async (cur) => {
  const { ctx, a, b } = await twoTabs('E3')
  await L.step(a, 'W1.E3 setup: Wednesday note (the week saved)', () => W.weekText(a, 'dn:2.0', 'E3 SETUP WED'))
  await a.reload(); await L.signIn(a, 'a', { goto: false }); await W.toEdit(L, a)
  await b.reload(); await L.signIn(b, 'a', { goto: false }); await W.toEdit(L, b)
  await L.step(a, 'W1.E3 tab A: Monday note 1', () => W.weekText(a, 'dn:0.0', 'E3 A NOTE 1'))
  await L.step(b, 'W1.E3 tab B: Monday note 2 (B never saw A\'s)', () => W.weekText(b, 'dn:0.1', 'E3 B NOTE 2'))
  await a.reload(); await L.signIn(a, 'a', { goto: false }); await W.toEdit(L, a)
  const got = { n1: await txt(a, 'dn:0.0'), n2: await txt(a, 'dn:0.1') }
  cur.shown = `after the reload: Monday note 1 "${got.n1}", note 2 "${got.n2}" — ${got.n1 === 'E3 A NOTE 1' ? 'both kept' : 'A\'s note LOST (B\'s save of the whole Monday row carried its old note 1)'}`
  await W.showDay(a, 0); await shotTo(cur, a, 'W1.E3-2-reloaded-A')
  note(`W1.E3 ${cur.shown}`)
  await ctx.close()
})

const fails = L.save({ table: T, errors })
console.log('errors:', JSON.stringify(errors, null, 1))
await browser.close()
process.exitCode = fails ? 1 : 0
