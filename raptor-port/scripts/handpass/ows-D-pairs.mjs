/* Ordered pairs {Op, Or} x {Lr, Ld, A}, both orders, from an unpublished (PAIRS_START=U) or a published (=P) Saturday.
   Fixture per run (a fresh world): Ranger on a flight VIPER 12:00-13:00, no in-time line: 09:00-15:00, 360 min, a half day (HO).
   Op = Ranger's own puck on the VIPER line off in OIL Earn; Or = the VIPER row switch off; Lr = Logic "Nominal report before T/O"
   3h -> 2h30; Ld = Logic "Flight debrief after land" 2h -> 2h30; A = the amendment (sign the four, Publish AL).
   Expected final record: Op or Or on: none. Lr only: HO 09:30-15:00. Ld only: FO 09:00-15:30.  */
import * as D from './ows-D-lib.mjs'
import * as F from './ows-D-fix.mjs'
import * as R_ from './rbl-D-lib.mjs'
const { world, sleep, A, R, W, L, P, judge, row, ISO } = D
const SAT = 5
const START = process.env.PAIRS_START || 'U'
const ONLY = process.env.PAIRS_ONLY ? process.env.PAIRS_ONLY.split(',') : null
const UNDO = process.env.PAIRS_UNDO === '1'
const log = (...a) => console.log('>>', ...a)
const allErr = []

async function peek(p, { paid = true, list = true } = {}) {
  const d = await D.dayState(p, SAT, 'pr', { quiet: true, list })
  const o = paid ? await D.oilOf(p, 'bane', ISO[SAT], 'pr', true) : null
  return { chip: d.head.pending, tag: d.head.tag, nys: d.head.nys, list: d.list, selects: D.signsOf(d.head), cell: o ? o.cell.text : null, letters: o ? o.letters : null, row: o ? o.row : null, bal: o ? o.bal : null }
}
const brief = s => `chip "${s.chip}" ${s.nys ? 'marker "' + s.nys + '" ' : ''}| paid cell ${s.cell === null ? 'n/a' : JSON.stringify(s.cell)} ${s.row ? '| ' + (s.row.match(/(\d\d:\d\d.\d\d:\d\d)/) || [''])[0] + ' bal ' + s.bal : ''} | list "${(s.list || '').slice(0, 220)}"`
async function boardMode(p, fn) {
  await A.toBoard(p, SAT); await D.oilMode(p, true)
  const key = await F.itemKey(p, 'VIPER')
  const r = await fn(key)
  await D.oilMode(p, false); await A.closeBoard(p)
  return r
}
const ACT = {
  Op: async p => boardMode(p, key => F.tapPuck(p, 'bane', key)),
  Or: async p => boardMode(p, key => F.tapItem(p, key)),
  Lr: async p => A.logicSet(p, 'reportLead', '2h30'),
  Ld: async p => A.logicSet(p, 'debrief', '2h30'),
  A: async p => {
    await A.toWeek(p); await W.showDay(p, SAT)
    const has = await p.evaluate(i => { const b = document.querySelector(`#eWeek .day[data-day="${i}"] [data-alpub="${i}"]`); return b ? { text: b.innerText.trim(), disabled: b.disabled } : null }, SAT)
    const beak = await p.evaluate(i => { const b = document.querySelector(`#eWeek .day[data-day="${i}"] [data-beak="${i}"]`); return b ? { text: b.innerText.trim(), disabled: b.disabled } : null }, SAT)
    if (!has) return { absent: true, note: 'no Publish AL control on the day (first-publish button: ' + (beak ? JSON.stringify(beak) : 'none') + ')' }
    const r = await A.publishAm(p, SAT); await A.closeBoard(p)
    return { absent: false, said: r.head && r.head.tag, signedFirst: JSON.stringify(r.s), note: 'Publish AL control: ' + JSON.stringify(has) + '; needed the four names signed again' }
  },
}
async function build(p) {
  await L.go(p, 'editsched'); await sleep(300)
  const w = await D.flyingWave(p, SAT, { cs: 'VIPER', to: '12:00', ld: '13:00', p1: 'bane' })
  await A.closeBoard(p)
  if (START === 'P') { const pub = await A.publishNew(p, SAT); await A.closeBoard(p); return { took: w.got[0] === 'bane', tag: pub.head && pub.head.tag } }
  return { took: w.got[0] === 'bane', tag: 'draft' }
}
const exp = set => {
  if (set.includes('Op') || set.includes('Or')) return { letters: '', rowRe: null, words: 'none' }
  if (set.includes('Lr')) return { letters: 'HO', rowRe: /09:30.15:00/, words: 'HO 09:30-15:00' }
  if (set.includes('Ld')) return { letters: 'FO', rowRe: /09:00.15:30/, words: 'FO 09:00-15:30' }
  return { letters: 'HO', rowRe: /09:00.15:00/, words: 'HO 09:00-15:00' }
}
const pairs = []
for (const x of ['Op', 'Or']) for (const y of ['Lr', 'Ld', 'A']) { pairs.push([x, y]); pairs.push([y, x]) }
for (const [a1, a2] of pairs) {
  const id = `PR-${START}-${a1}-${a2}`
  if (ONLY && !ONLY.includes(`${a1}-${a2}`)) continue
  const { browser, p, errors } = await world()
  try {
    const b = await build(p)
    const base = await peek(p, { paid: START === 'P', list: false })
    const r1 = await ACT[a1](p)
    const s1 = await peek(p, { paid: START === 'P' })
    const r2 = await ACT[a2](p)
    const s2 = await peek(p, { paid: START === 'P' })
    const picDay = await P(p, `${id}-after-2`)
    let und = null
    if (UNDO && START === 'P') {
      const u = await R_.undo(p); const su = await peek(p, { paid: true })
      const rd = await R_.redo(p); const sr = await peek(p, { paid: true })
      await A.reloadAs(p, 'a'); const sl = await peek(p, { paid: true })
      und = { undoPressed: u && u.pressed, afterUndo: brief(su), redoPressed: rd && rd.pressed, afterRedo: brief(sr), afterReload: brief(sl), undoChip: su.chip, redoChip: sr.chip, reloadChip: sl.chip, s1chip: s1.chip, s2chip: s2.chip }
    }
    let fin = null, finNote = ''
    if (a2 === 'A' && !r2.absent) { fin = await D.oilOf(p, 'bane', ISO[SAT], id + '-final'); finNote = 'the pair\'s own A published it' }
    else if (START === 'U') { await A.publishNew(p, SAT); await A.closeBoard(p); fin = await D.oilOf(p, 'bane', ISO[SAT], id + '-final'); finNote = 'readout (not part of the pair): signed the four and Publish day (ORIG)' }
    else {
      const dd = await D.dayState(p, SAT, 'x', { quiet: true, list: false })
      if (D.pend(dd.head) !== '0') { await A.publishAm(p, SAT); await A.closeBoard(p); finNote = 'readout (not part of the pair): signed the four and Publish AL' } else finNote = 'readout: nothing pending, nothing to issue'
      fin = await D.oilOf(p, 'bane', ISO[SAT], id + '-final')
    }
    const e = exp([a1, a2])
    const finalOk = (e.letters === '') ? (fin.letters !== 'HO' && fin.letters !== 'FO') : (fin.letters === e.letters && e.rowRe.test(fin.row))
    const checks = []
    checks.push(['fixture: Ranger seated, ' + (START === 'P' ? 'published ORIG' : 'unpublished'), b.took && (START === 'U' || b.tag === 'ORIG'), b])
    const firstIsEdit = a1 !== 'A'
    if (START === 'P') {
      if (firstIsEdit) {
        checks.push([`after ${a1}: paid cell and worked times hold (HO 09:00-15:00, bal ${base.bal})`, s1.letters === 'HO' && /09:00.15:00/.test(s1.row) && s1.bal === base.bal, brief(s1)])
        checks.push([`after ${a1}: the day reads pending`, D.pend({ pending: s1.chip }) !== '0', s1.chip])
      }
      if (a2 === 'A') checks.push(['A: ' + (r2.absent ? 'no Publish AL control (nothing pending?)' : 'the amendment went out as ' + r2.said), a1 === 'A' ? true : (!r2.absent && /AL/.test(r2.said || '')), r2])
      else checks.push([`after ${a2}: paid still holds`, s2.letters === 'HO' && /09:00.15:00/.test(s2.row), brief(s2)])
      if (a1 === 'A') checks.push(['A first (nothing waiting): no Publish AL control', r1.absent, r1])
    } else {
      checks.push([`after ${a1}: nothing paid (day unpublished), no Leave War credit`, true, brief(s1)])
      if (a1 === 'A') checks.push(['A first on an unpublished day: no Publish AL control', r1.absent, r1])
      if (a2 === 'A') checks.push(['A second on an unpublished day: no Publish AL control', r2.absent, r2])
    }
    if (und) checks.push(['Undo, Redo, reload: the pending count follows (after Undo = after the first action; after Redo and reload = after the second)', und.undoChip === s1.chip && und.redoChip === s2.chip && und.reloadChip === s2.chip, und])
    checks.push([`final record after issue: ${e.words}`, finalOk, `${fin.cell.text} | ${fin.row.slice(0, 150)} (${finNote})`])
    judge(id, `${START === 'P' ? 'published' : 'unpublished'} Saturday; first ${a1}, then ${a2}`, checks, [picDay, ...fin.pics])
    console.log(`   [${id}] base: ${brief(base)}\n   [${id}] after ${a1}: ${brief(s1)}${a1 === 'A' ? ' | A: ' + JSON.stringify(r1) : ''}\n   [${id}] after ${a2}: ${brief(s2)}${a2 === 'A' ? ' | A: ' + JSON.stringify(r2) : ''}${und ? '\n   [' + id + '] undo: ' + und.afterUndo + '\n   [' + id + '] redo: ' + und.afterRedo + '\n   [' + id + '] reload: ' + und.afterReload : ''}\n   [${id}] final: ${finNote}: ${fin.cell.text} | ${fin.row.slice(0, 150)}`)
  } catch (err) {
    row(id, `${START} ${a1} then ${a2}`, 'script error: ' + String((err && err.message) || err).slice(0, 300), 'NOT WALKED', [])
    await P(p, `${id}-ERR`).catch(() => {})
  }
  allErr.push(...errors)
  await browser.close()
}
console.log('ERRORS', JSON.stringify(D.cleanErr(allErr)))
D.savePart(`ows-D-pairs-${START}`, { errors: D.cleanErr(allErr), pics: D.pics.saved })
