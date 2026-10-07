/* walker TO — P2-08 (RECORDED, not judged): what each press of "+ In-time / Rally" fills in, with Logic's
   "Nominal report before T/O" at that moment. A new Monday wave with take-offs 12:00 (VL) and 13:00 (RU), no crew.
   The scenario's sequence is walked twice: with the WEEK's button (wave 3) and with the BOARD's button (wave 4). */
import * as T from './stk-TO-lib.mjs'
const { W, row, pic, PHONE } = T
const DI = 0
await T.run('P2-08', async p => {
  const pics = []
  const logicNow = async () => { const v = await T.logicRead(p, 'reportLead'); return v }
  async function build() {
    await T.boardAt(p, DI)
    const gi = await T.addWave(p, DI)
    await T.form(p, DI, gi, 0, { cs: 'VL', to: '1200', ld: '1300' })
    const li = await T.addLine(p, DI, gi)
    await T.form(p, DI, gi, li, { cs: 'RU', to: '1300', ld: '1400' })
    const built = await p.evaluate(([d, g]) => window.DAYS[d].waves[g].formations.map(f => `${f.cs} ${f.to}-${f.ld}`).join(' | '), [DI, gi])
    await W.boardOff(p)
    return { gi, built }
  }
  async function at(surf, gi) { if (surf === 'board') await T.boardAt(p, DI); else { await T.toEdit(p); await W.showDay(p, DI) } await T.itShow(p, surf, DI, gi) }
  async function seq(surf, tag) {
    const { gi, built } = await build()
    const L0 = await logicNow()
    await at(surf, gi)
    const before = await T.itRead(p, surf, DI, gi)
    const a1 = await T.itAdd(p, surf, DI, gi)
    await T.itShow(p, surf, DI, gi); pics.push(await pic(p, `p208-${tag}-1-first-press`))
    const t = await T.itType(p, surf, DI, gi, 0, '08:00H: IN TIME + WX/NOTAMS')
    const set = await T.logicSet(p, 'reportLead', '2h'); await T.logicDone(p)
    const L1 = await logicNow()
    await p.evaluate(() => { const e = [...document.querySelectorAll('#page-logic *')].find(x => x.children.length === 0 && (x.innerText || '').trim() === 'Nominal report before T/O'); if (e) e.scrollIntoView({ block: 'center' }) }); await T.sleep(250)
    pics.push(await pic(p, `p208-${tag}-2-logic-2h`))
    await at(surf, gi)
    const a2 = await T.itAdd(p, surf, DI, gi)
    await T.itShow(p, surf, DI, gi); pics.push(await pic(p, `p208-${tag}-3-second-press`))
    const after2 = await T.itRead(p, surf, DI, gi)
    /* for the record only: every line removed with its own ✕, then one more press on the empty box, Logic still at 2h */
    for (let i = after2.lines.length - 1; i >= 0; i--) await T.itDel(p, surf, DI, gi, i)
    const emptied = await T.itRead(p, surf, DI, gi)
    const a3 = await T.itAdd(p, surf, DI, gi)
    await T.itShow(p, surf, DI, gi); pics.push(await pic(p, `p208-${tag}-4-press-on-empty-at-2h`))
    /* put Logic back to 3h for the next sequence */
    const back = await T.logicSet(p, 'reportLead', '3h'); await T.logicDone(p)
    return { gi, built, L0, a1, t, set, L1, a2, after2, emptied, a3, back, before }
  }
  const wk = await seq('week', 'week')
  const bd = await seq('board', 'board')
  const say = (s, r) => `${s.toUpperCase()}'s button, wave ${r.gi + 1} (${r.built}; box before: ${r.before.lines.length ? r.before.lines.join(' / ') : 'no line'}): ` +
    `PRESS 1 with Logic "Nominal report before T/O" = ${r.L0} → filled "${r.a1.added}" (under it: "${r.a1.fb}"; the caret ${r.a1.caret && r.a1.caret.it ? 'is in the new line' : 'is not in the line: ' + JSON.stringify(r.a1.caret)}). ` +
    `Line retyped "08:00H: IN TIME + WX/NOTAMS" → shows "${r.t.lines.join(' / ')}". ` +
    `Logic box typed "2h" (it read ${r.set.before} → ${r.set.after}); the page then shows ${r.L1}. ` +
    `PRESS 2 with Logic = ${r.L1} → filled "${r.a2.added}" (box now: ${r.after2.lines.join(' / ')}; under it "${r.after2.fb}"). ` +
    `Extra, for the record: every line removed with ✕ (box: ${r.emptied.lines.length ? r.emptied.lines.join(' / ') : 'empty'}), PRESS 3 on the empty box with Logic = ${r.L1} → filled "${r.a3.added}". Logic put back: ${r.back.before} → ${r.back.after}.`
  row('P2-08.week', `P2-08 with the WEEK's "+ In-time / Rally" (${PHONE ? 'phone' : 'desktop'}): take-offs 12:00 and 13:00; add; change to 08:00; Logic lead to 2h; add again.`, say('week', wk), 'RECORDED', pics.filter(x => /week/.test(x)))
  row('P2-08.board', `P2-08 with the BOARD's "+ In-time / Rally" (${PHONE ? 'phone' : 'desktop'}): the same sequence on a second new wave.`, say('board', bd), 'RECORDED', pics.filter(x => /board/.test(x)))
})
