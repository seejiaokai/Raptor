/* walker B — the ordered pairs {T+, T~, T−} × {P, A, Lr}: both orders, from an unpublished and from a published day.
   Env: PAIRS="T+/P,T~/A,..." (default all nine), STARTS="unpub,pub", UNDO=1 (Undo / Redo / reload after the second action). */
import * as K from './ows-B-lib.mjs'
const { judge, row, savePart, sleep, pic } = K
const errs = []
const PAIRS = (process.env.PAIRS || 'T+/P,T+/A,T+/Lr,T~/P,T~/A,T~/Lr,T-/P,T-/A,T-/Lr').split(',').map(s => s.split('/'))
const STARTS = (process.env.STARTS || 'unpub,pub').split(',')
const UNDO = !!process.env.UNDO
const TAGN = process.env.TAGN || 'P'
const SAT = 5, ID = 'bane'

/* ---- the oracle (my reading of the numbers table) ---- */
const clock = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')
const f = (line, lead) => { const st = line != null ? line : 720 - lead; const mins = 900 - st; return { code: mins >= 361 ? 'FO' : 'HO', start: clock(st), mins, amt: mins >= 361 ? 1 : 0.5 } }
const LN = { '10:00': 600, '08:30': 510 }
const label = a => ({ 'T+': 'T+ (add IN TIME 10:00)', 'T~': 'T~ (clock → 08:30)', 'T-': 'T− (remove the line)', P: 'P (first publish)', A: 'A (publish amendment)', Lr: 'Lr (lead 180→150)' }[a])

async function readAll(p, name, { pics = false } = {}) {
  const o = await K.oilOf(p, ID, K.SAT, name, { pics })
  const d = await K.dayState(p, SAT, name + '-day', { list: true })
  return { o, d }
}
const say = (r, base) => `cell ${r.o.letters} · worked ${r.o.worked || '—'} · balance ${r.o.bal} (B ${base}) · tag ${r.d.head.tag} · pending "${r.d.head.pending || '0'}" · sign-offs ${K.signsWord(r.d.head)}${r.d.list ? ' · list: ' + r.d.list.slice(0, 260) : ''}`

async function runOne(a1, a2, start) {
  const id = `${a1}→${a2} from ${start}`
  const nm = `pair_${a1.replace('+', 'p').replace('~', 't').replace('-', 'm')}_${a2.replace('+', 'p').replace('~', 't').replace('-', 'm')}_${start}`
  const wd = await K.world(); const { p, browser } = wd
  const base = (await K.baseline(p, ID)).bal
  await K.L.go(p, 'editsched'); await sleep(300)
  const w = await K.flight(p, SAT, { cs: 'VIPER', to: '12:00', ld: '13:00', p1: ID })
  /* the precondition, prepared BEFORE the pair: T~ and T− need a reporting line to act on */
  const needsLine = [a1, a2].some(a => a === 'T~' || a === 'T-')
  let line = null
  if (needsLine) { await K.toBoard(p, SAT); await K.addLines(p, SAT, w.wi, ['IN TIME 10:00']); line = LN['10:00'] }
  /* model */
  const m = { pubd: false, paid: null, line, lead: 180, snap: null }
  const cand = () => f(m.line, m.lead)
  const log = []
  const bad = []
  const record = async (step, r, exp) => {
    const money = [['cell ' + (exp ? exp.code : 'none'), exp ? r.o.letters === exp.code : !/HO|FO/.test(r.o.cell.text || ''), r.o.cell.text],
      ['worked ' + (exp ? exp.start + '–15:00' : 'none'), exp ? new RegExp(exp.start + '.15:00').test(r.o.row) : !/\d\d:\d\d.\d\d:\d\d/.test(r.o.row || ''), (r.o.row || '').slice(0, 110)],
      ['balance ' + (exp ? '+' + exp.amt : 'B'), exp ? +r.o.bal === +base + exp.amt : +r.o.bal === +base, { B: base, now: r.o.bal }]]
    money.filter(c => !c[1]).forEach(c => bad.push(step + ': ' + c[0] + ' ✗ ' + JSON.stringify(c[2])))
    log.push(`[${step}] ${say(r, base)}  ⇒ expected paid ${exp ? exp.code + ' ' + exp.start + '–15:00 (' + exp.mins + ' min)' : 'none'}: ${money.every(c => c[1]) ? 'ok' : 'NOT AS EXPECTED'}`)
  }
  const pics = []
  /* start state */
  if (start === 'pub') {
    await K.publishNew(p, SAT); await K.closeBoard(p)
    m.pubd = true; m.snap = { line: m.line, lead: 180 }; m.paid = f(m.line, 180)
  }
  const r0 = await readAll(p, nm + '-0')
  pics.push(...r0.d.pics)
  await record('start', r0, m.paid)
  const pendingNow = () => { if (!m.pubd) return false; const sc = f(m.snap.line, m.snap.lead); const cc = cand(); return m.line !== m.snap.line || cc.code !== sc.code || cc.start !== sc.start }
  let n = 0
  for (const a of [a1, a2]) {
    n++
    const stepName = `${n}:${label(a)}`
    let result = ''
    const before = JSON.stringify({ d: await p.evaluate(() => JSON.stringify(window.DAYS[5].waves.map(w => w.intimes || []))) })
    let avail = true
    if (a === 'T+') {
      await K.toBoard(p, SAT); await K.addItBtn(p, SAT, w.wi); await K.setItLine(p, SAT, w.wi, 0, 'IN TIME 10:00'); m.line = LN['10:00']; await K.closeBoard(p)
    } else if (a === 'T~') {
      await K.toBoard(p, SAT); await K.setItLine(p, SAT, w.wi, 0, 'IN TIME 08:30'); m.line = LN['08:30']; await K.closeBoard(p)
    } else if (a === 'T-') {
      await K.toBoard(p, SAT)
      const del = p.locator(`#schedBoard [data-itdel="5|${w.wi}|0"]:visible`).first()
      if (await del.count()) { await del.evaluate(e => e.scrollIntoView({ block: 'center' })); await del.click(); await sleep(600); m.line = null } else { avail = false; result = 'no ✕ on the line' }
      await K.closeBoard(p)
    } else if (a === 'Lr') {
      const v = await K.logicSet(p, 'reportLead', '2h30'); m.lead = 150; result = 'box says ' + v
    } else if (a === 'P' || a === 'A') {
      const expectAvail = a === 'P' ? !m.pubd : pendingNow()
      await K.toBoard(p, SAT)
      const sel = a === 'P' ? '[data-beak]' : '[data-alpub]'
      const btn = p.locator(`#schedBoard ${sel}:visible`).first()
      const present = await btn.count()
      const btxt = present ? (await btn.innerText()).trim() : ''
      const wasLocked = present ? await btn.isDisabled() : null
      /* the button is locked until the four sign: the sign step is part of the action */
      if (present) await K.W.signDay(p, SAT)
      const enabled = present ? !(await btn.isDisabled()) : false
      if (present && enabled) {
        const res = a === 'P' ? await K.W.publishDay(p, SAT) : await K.W.publishAL(p, SAT)
        await sleep(500)
        result = `button "${btxt}" was ${wasLocked ? "locked until the four signed" : "open"}; signed + pressed → ${JSON.stringify(res)}`
        if (res.pressed) { m.pubd = true; m.snap = { line: m.line, lead: m.lead }; m.paid = cand() } else avail = false
      } else { avail = false; result = `button ${present ? 'present but locked/disabled: "' + btxt + '"' : 'absent'}` }
      if (avail !== expectAvail) bad.push(`${stepName}: ${a} was ${avail ? 'available' : 'unavailable'}, my model says ${expectAvail ? 'available' : 'unavailable'}`)
      await K.closeBoard(p)
    }
    const r = await readAll(p, `${nm}-${n}`, { pics: n === 2 })
    if (n === 2) pics.push(...r.o.pics)
    pics.push(r.d.pics[r.d.pics.length - 1])
    await record(stepName + (result ? ' (' + result + ')' : ''), r, m.paid)
    /* the model's pending expectation, recorded not judged */
    log.push(`    model: pending ${pendingNow() ? 'yes' : 'no'} · chip shows "${r.d.head.pending || '0'}"`)
    if (!pendingNow() && m.pubd && r.d.pend !== '0') log.push(`    NOTE: chip says ${r.d.pend} though my model says nothing changed the record`)
    if (pendingNow() && r.d.pend === '0') bad.push(`${stepName}: model says the OIL / content differs from the published one, but the chip reads 0 pending`)
  }
  if (UNDO) {
    /* Undo the second action, read; Redo, read; reload, read */
    await K.toWeek(p)
    const u = await K.W.door(p, 'top', 'undo'); const ru = await readAll(p, nm + '-undo')
    log.push(`[undo → ${JSON.stringify(u.toasts || u.pressed)}] ${say(ru, base)}`)
    const rd = await K.W.door(p, 'top', 'redo'); const rr = await readAll(p, nm + '-redo')
    log.push(`[redo → ${JSON.stringify(rd.toasts || rd.pressed)}] ${say(rr, base)}`)
    await K.reloadAs(p, 'a'); await sleep(600)
    const rl = await readAll(p, nm + '-reload', { pics: true })
    log.push(`[reload] ${say(rl, base)}`)
    pics.push(...rl.o.pics)
    const same = (x, y) => x.o.letters === y.o.letters && x.o.worked === y.o.worked && x.o.bal === y.o.bal
    if (!same(rr, rl)) bad.push('reload: not the same money as before the reload')
  }
  errs.push(...wd.errors)
  await browser.close()
  row(id, `${label(a1)} then ${label(a2)}, starting ${start === 'pub' ? 'on a published day (ORIG)' : 'on an unpublished day'}; flight 12:00–13:00 Ranger${needsLine ? ', line IN TIME 10:00 prepared before' : ', no reporting line'}`,
    log.join('\n   '), bad.length ? 'FAIL' : 'PASS', pics.filter(Boolean))
  if (bad.length) row(id + ' — what differed', 'against my reading of the numbers table', bad.join(' | '), 'RECORDED', [])
}

for (const start of STARTS) for (const [x, y] of PAIRS) for (const [a1, a2] of [[x, y], [y, x]]) {
  try { await runOne(a1, a2, start) } catch (e) { row(`${a1}→${a2} from ${start}`, 'pair', 'SCRIPT ERROR ' + String(e.stack || e).slice(0, 500), 'NOT WALKED') }
}
console.log('ERRORS', JSON.stringify(errs))
savePart('ows-B-sP-' + TAGN, { errors: errs })
