/* Scenario 2 — a Logic rule change after publication: RECORDED with the numbers, not judged. */
import * as A from './ins-a-lib.mjs'
const { L, W, TUE, row, pic, savePart } = A
const S = '2'
const WHO = ['Rebel', 'Cinder', 'Vapor', 'Marlin']   /* Go 2's RU formation — these four fly on Tuesday only */
const { browser, p, errors } = await A.world()
const pick = r => r.err ? r.err : `Work hours ${WHO.map(c => A.hoursOf(r, c)).join(', ')} · issues tile "${A.tile(r, /warning/i)} / ${(r.tiles[3] || {}).l}" · By day "${A.byDay(r, 'Tue')}" · Long work day ${(A.rowOf(r, /Conflicts by type/i, /^Long work day/)).replace(/^\D+/, '')} · whole-week types [${A.byType(r)}]`
async function setRule(key, val) {
  await A.toPage(p, 'logic')
  const ed = p.locator('#lgEdit:visible').first(); if (await ed.count()) { await ed.click(); await L.sleep(400) }
  const i = p.locator(`#lgBody input[data-lgset="${key}"]`).first()
  if (!(await i.count())) return 'no such box: ' + key
  await i.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200)
  const was = await i.inputValue()
  await i.click(); await i.fill(val); await i.press('Enter').catch(() => {}); await i.evaluate(e => e.blur()); await L.sleep(600)
  const now = await p.locator(`#lgBody input[data-lgset="${key}"]`).first().inputValue().catch(() => '(box gone)')
  return `${was} → ${now}`
}
async function look(name) {
  /* on the Logic page first (the window over Logic), then the day on Edit Schedule and on View-only Sched */
  const i = await A.ins(p, name, { foot: false })
  const f = await A.face(p, TUE)
  await A.openList(p, '#eWeek', TUE); const el = await A.readList(p, '#eWeek', TUE)
  const shotE = await pic(p, name + '-editsched')
  const v = await A.vface(p, TUE)
  return { i, f, v, el, shots: [...i.shots, shotE] }
}
try {
  /* the fixture: Go 2's RU in-time line taken off (the ✕ on the line, on the board) so that formation reports by the rule */
  await A.toEdit(p); await W.boardOn(p, TUE)
  const before = await p.evaluate(() => window.DAYS[1].waves[1].intimes.slice())
  const x = p.locator('#schedBoard [data-itdel="1|1|1"]:visible').first()
  await x.evaluate(e => e.scrollIntoView({ block: 'center' })); await x.click(); await L.sleep(500)
  const after = await p.evaluate(() => window.DAYS[1].waves[1].intimes.slice())
  await W.boardOff(p)
  const pub = await A.pubOrig(p, TUE)
  const a = await look('s2-a-orig')
  row(`${S}.a`, `Tuesday (draft): the board's ✕ on Go 2's in-time line "${before[1]}" (left: ${JSON.stringify(after)}), so the RU formation has no in-time; signed and ${pub.r.label}`, `${pick(a.i)} · day on Edit Schedule: ${A.faceLine(a.f)} · View-only bar "${a.v.bar}"`, 'RECORDED', a.shots)

  const r1 = await setRule('debrief', '3h')
  const b = await look('s2-b-debrief-3h')
  row(`${S}.b`, `Logic → ✎ Edit rules → "Flight debrief after land" ${r1} (Tuesday still Original)`, `${pick(b.i)} · vs before: ${A.diffText(a.i, b.i).slice(0, 500)} · day on Edit Schedule: ${A.faceLine(b.f)} · its list: ${A.short(b.el)} · View-only bar "${b.v.bar}"`, 'RECORDED', b.shots)

  const r2 = await setRule('reportLead', '4h')
  const c = await look('s2-c-report-4h')
  row(`${S}.c`, `Logic → "Nominal report before T/O" ${r2} (Tuesday still Original)`, `${pick(c.i)} · vs before: ${A.diffText(b.i, c.i).slice(0, 500)} · day on Edit Schedule: ${A.faceLine(c.f)} · its list: ${A.short(c.el)} · View-only bar "${c.v.bar}"`, 'RECORDED', c.shots)

  /* can it go out as AL1? */
  await A.toEdit(p); await W.showDay(p, TUE)
  let alTxt = 'no "Publish AL" button is offered — nothing is pending on Tuesday, so there is nothing to issue'
  if (c.f.alpub) { const al = await A.pubAL(p, TUE); alTxt = `signed and "${al.r.label || al.r.why}" pressed` }
  const d = await look('s2-d-after-AL-try')
  row(`${S}.d`, `the amendment: ${alTxt}`, `${pick(d.i)} · vs before: ${A.diffText(c.i, d.i).slice(0, 400)} · day on Edit Schedule: ${A.faceLine(d.f)} · View-only bar "${d.v.bar}"`, 'RECORDED', d.shots)

  /* a reload */
  await A.reloadAs(p, 'a')
  const e = await look('s2-e-reloaded')
  row(`${S}.e`, 'a reload, signed in again', `${pick(e.i)} · same words as before the reload: ${A.same(d.i, e.i)} (${A.diffText(d.i, e.i).slice(0, 300)}) · day on Edit Schedule: ${A.faceLine(e.f)}`, 'RECORDED', e.shots)
  row(`${S}.sum`, 'the figures side by side (Original · debrief 3h · report 4h · after the amendment step · reload)',
    WHO.map(cs => `${cs}: ${[a, b, c, d, e].map(x => A.hoursOf(x.i, cs).replace(cs + ' ', '')).join(' → ')}`).join(' ; ') +
    ` ;; Tuesday By-day issues: ${[a, b, c, d, e].map(x => (/(\d+) issues?|clear/.exec(A.byDay(x.i, 'Tue')) || [''])[0]).join(' → ')} ;; week issues tile: ${[a, b, c, d, e].map(x => A.tile(x.i, /warning/i)).join(' → ')} ;; Tuesday's own bar on Edit Schedule: ${[a, b, c, d, e].map(x => (/(\d+) issues?/.exec(x.f.bar) || [x.f.bar])[0]).join(' → ')} ;; on View-only: ${[a, b, c, d, e].map(x => (/(\d+) issues?/.exec(x.v.bar) || [x.v.bar])[0]).join(' → ')} ;; pending chip: ${[a, b, c, d, e].map(x => x.f.pending).join(' → ')}`, 'RECORDED')
} catch (e) { row(`${S}.X`, 'the script stopped', String(e && e.stack || e).slice(0, 700), 'FAIL', [await pic(p, `s${S}-X-error`)]) }
row(`${S}.err`, 'the browser\'s error list through this scenario', errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart(`s${S}`, { errors })
await browser.close()
