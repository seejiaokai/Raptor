// A5 — on a published day, an input's person changed to or from a placeholder: how many pending, and what the list says of the cause.
import * as L from './isr-A-lib.mjs'
import * as P from './isr-A-pub.mjs'
const { say, check, note, notWalked, tid, press, shot } = L
export default async function a5() {
  const size = 'desktop'
  for (const [label, from, toWho] of [['placeholder-to-named', 'allavail', 'MAN'], ['named-to-placeholder', 'MAN', 'allavail']]) {
    const { ctx, page, tap } = await L.session(size)
    try {
      const [man] = await L.freeMen(page, 1, [5])
      const fromV = from === 'MAN' ? man : from, toV = toWho === 'MAN' ? man : toWho
      const iid = await L.fileOn(page, tap, '2026-07-18', { type: 'Duty', people: [fromV], from: '09:00', to: '12:00', remarks: 'isr A5' })
      if (!iid) { notWalked(`A5 ${label}`, 'the duty was not filed'); await ctx.close(); continue }
      const pub = await P.pubDay(page, tap, 5)
      if (!pub.r.pressed) { notWalked(`A5 ${label}`, `Saturday was not published: ${JSON.stringify(pub.r)}`); await ctx.close(); continue }
      const f0 = await P.face(page, 5)
      note(`A5 ${label}`, `duty ${iid} for ${fromV} on Sat 18 Jul published (${pub.kind}); face ${JSON.stringify(f0)}`)
      await L.toInputsCal(page, tap); await L.incalMonth(page, tap, 2026, 7); await L.openDay(page, '2026-07-18')
      await press(page, tap, `[data-testid="idy-row-${iid}"] [data-testid="idy-open"]`); await tid(page, 'win-inputedit').waitFor(); await page.waitForTimeout(400)
      await page.selectOption('#inpEditPerson', toV)
      await press(page, tap, '#inpEditSave'); await page.waitForTimeout(600)
      let asked = false
      if (await tid(page, 'oilconf').count()) { asked = true; await press(page, tap, '[data-testid="oil-yes"]'); await press(page, tap, '[data-testid="oilconf-save"]'); await page.waitForTimeout(400) }
      if (await tid(page, 'docconf-nodoc').count()) await press(page, tap, '[data-testid="docconf-nodoc"]')
      for (const x of ['win-inputedit-x', 'win-inputsday-x']) if (await tid(page, x).count()) await press(page, tap, `[data-testid="${x}"]`)
      const who = await page.evaluate(id => { const r = window.INPUTS.find(x => String(x.iid) === id); return r.person || (r.people || []).map(e => e.p) }, iid)
      const f = await P.face(page, 5)
      const out = await P.toGoOut(page, 5, ['A5', size, `${label}-to-go-out`])
      say(`A5 ${label}: person now ${JSON.stringify(who)} (OIL asked ${asked}); chip ${JSON.stringify(f.pend)} nys ${JSON.stringify(f.nys)}; To go out: ${out.text.slice(0, 600)}`)
      const n = +((f.pend[0] || '').match(/\d+/) || [0])[0]
      const hdr = +((out.text.match(/(\d+) changes?/) || [0, 0])[1])
      check('A5', `${label}: one person change reads "1 pending" and "1 change"`, n === 1 && hdr === 1, { chip: f.pend, header: out.text.slice(0, 160) })
      check('A5', `${label}: no line says only "What this day earns changed" without a cause`, !/What this day earns changed/.test(out.text), { text: out.text.slice(0, 400) })
      await page.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); if (w) { w.style.outline = '3px solid #ff3b6b'; w.style.outlineOffset = '2px' } })
      await shot(page, 'A5', size, `${label}-marked`)
    } catch (e) { say(`ERROR A5 ${label}: ${e.message.split('\n')[0]}`); await shot(page, 'A5', size, `${label}-error`).catch(() => {}) }
    await ctx.close()
  }
  notWalked('A5 (drag form)', 'the puck-dragged-off-the-row form was not driven; only the input window person change was walked')
}
if (process.argv[1].endsWith('isr-A-a5.mjs')) { await a5(); await L.finish('a5') }
