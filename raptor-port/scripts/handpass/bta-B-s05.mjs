/* S05 — Meeting with hours 00:00–24:00 (and "Other" for the Unavailable door): on the Ground Programme, X on blank seats,
   then the request taken off (Undo), put back, its landed row ✕'d, put back; "Other" moved to Unavailable and back. */
import * as T from './bta-B-lib.mjs'
import * as Q from './bta-B-lib2.mjs'
const { K, B, C, D, L, W, P6, ID, CSN, TUE, sleep, R, pic } = T
const t = T.mk('s05')
const P = T.PHONE ? 'ph' : 'dk'
const flag = (s, re) => s.held.filter(x => re.test(x))

async function try24(p) {
  await B.toEdit(p); await L.go(p, 'inputs'); await p.waitForSelector('#inRangeBtn')
  await p.selectOption('#inType', 'Meeting')
  await T.walkCal(p, '#inCal', T.ISO(TUE)); if (await p.locator('#inSpan').count()) { await p.locator('#inSpan [data-span="custom"]').click() } else if (await p.locator('#inAllday').isChecked()) { await p.locator('#inAllday').click() } await sleep(200)
  const el = p.locator('#inEndT'); const b = await el.boundingBox()
  await p.mouse.click(b.x + 14, b.y + b.height / 2); await sleep(150)
  await p.keyboard.type('2400'); await sleep(200)
  const v1 = await el.inputValue()
  await p.keyboard.type('AM'); await sleep(150)
  const shot = await pic(p, 'try-24-00')
  return { v: v1, v2: await el.inputValue(), shot }
}
async function meeting() {
  const { browser, p, errors } = await K.fresh()
  const idp = `S05-${P}-meeting`
  try {
    const tr = await try24(p)
    t.add(`${idp}.pre`, 'the Inputs form: Meeting, Custom, the End time box clicked and 2400 then AM typed from the keyboard (what a person can do to get 24:00)', `the box then read "${tr.v}" after 2400, "${tr.v2}" after AM; the app's time box is a native time field`, 'RECORDED', [tr.shot])
    const f = await T.file(p, { type: 'Meeting', di: TUE, allday: false, span: 'custom', from: '00:00', to: '23:59', remarks: 'Mtg0000-2400' })
    const rec = await T.rec(p, f.iid)
    const g0 = await Q.groundRowsOf(p, TUE, f.iid)
    const s0 = await T.see(p, 'm-0-filed')
    t.add(`${idp}.0`, `Meeting filed for ${CSN} for Tuesday, Custom, end box typed 00:00 → 24:00; form read ${JSON.stringify(f.form)}; stored: ${rec}; asked ${f.asked.join(',') || 'nothing'}; Ground Programme rows from it: ${JSON.stringify(g0)}`, T.says(s0), 'RECORDED', s0.pics)
    if (rec === 'not found') throw new Error('the Meeting was not filed with 24:00; stored record missing')
    t.add(`${idp}.1`, 'no warning against its own Ground Programme row', T.says(s0), g0.length === 1 && flag(s0, /Meeting/).length === 0 ? 'PASS' : 'FAIL', [])

    await T.blankLine(p, TUE)
    const s2 = await T.see(p, 'm-2-line')
    t.add(`${idp}.2`, 'X put on a new blank flying line', T.says(s2, 190), flag(s2, /Meeting clashes/).length === 1 && s2.pk.some(x => x.where === 'flying line' && x.solid) ? 'PASS' : 'FAIL', s2.pics)
    await T.blankRow(p, 'duty', TUE)
    const s3 = await T.see(p, 'm-3-desk')
    t.add(`${idp}.3`, 'X put on a new blank duty row (no name, no times)', T.says(s3, 190), flag(s3, /Meeting but tasked — this row/).length === 1 && s3.pk.some(x => x.where === 'duty' && x.solid) ? 'PASS' : 'FAIL', s3.pics)
    await T.blankRow(p, 'sim', TUE)
    const s4 = await T.see(p, 'm-4-sim')
    t.add(`${idp}.4`, 'X put on a new blank sim row (no name, no times)', T.says(s4, 190), s4.keyed.some(k => /@s:1\.amt/.test(k) && /Meeting/.test(k)) && s4.pk.some(x => x.where === 'sim' && x.solid) ? 'PASS' : 'FAIL', s4.pics)
    const sc = await Q.scMainBlank(p, TUE)
    const s5 = await T.see(p, 'm-5-sc')
    const amber = s5.held.filter(x => /SHIFT_SOFT/.test(x))
    t.add(`${idp}.5`, `X put on an SC MAIN seat, shift ${sc.times}`, T.says(s5, 200), amber.length === 1 && /Meeting/.test(amber[0]) && /^adv\//.test(amber[0]) && !/\d\d:\d\d/.test(amber[0]) ? 'PASS' : 'FAIL', s5.pics)

    /* take the request off the Ground Programme: its Undo on the Personal Inputs card */
    const u1 = await P6.accBtn(L, p, TUE, f.iid, 'x')
    const g1 = await Q.groundRowsOf(p, TUE, f.iid)
    const rec1 = await T.rec(p, f.iid)
    const s6 = await T.see(p, 'm-6-undo')
    t.add(`${idp}.6`, `the card's Undo pressed (${u1}); Ground rows from it now ${JSON.stringify(g1)}; stored ${rec1}`, T.says(s6, 190), flag(s6, /Meeting/).length === 0 ? 'PASS' : 'FAIL', s6.pics)
    const a1 = await P6.accBtn(L, p, TUE, f.iid, 'g')
    const g2 = await Q.groundRowsOf(p, TUE, f.iid)
    const s7 = await T.see(p, 'm-7-reaccept')
    t.add(`${idp}.7`, `Accept pressed again (${a1}); Ground rows from it ${JSON.stringify(g2)}`, T.says(s7, 190), flag(s7, /Meeting/).length >= 2 && s7.held.some(x => /SHIFT_SOFT/.test(x)) ? 'PASS' : 'FAIL', s7.pics)
    /* now the landed row's own ✕ (the request goes dormant) */
    const d1 = await P6.dropLanded(L, p, TUE, f.iid)
    const rec2 = await T.rec(p, f.iid)
    const s8 = await T.see(p, 'm-8-drop')
    t.add(`${idp}.8`, `the landed row's ✕ pressed on the board (${d1}); stored ${rec2}`, T.says(s8, 190), flag(s8, /Meeting/).length === 0 ? 'PASS' : 'FAIL', s8.pics)
    const a2 = await P6.accBtn(L, p, TUE, f.iid, 'g')
    const g3 = await Q.groundRowsOf(p, TUE, f.iid)
    const s9 = await T.see(p, 'm-9-reaccept2')
    t.add(`${idp}.9`, `Accept pressed again after the ✕ (${a2}); Ground rows ${JSON.stringify(g3)}`, T.says(s9, 190), flag(s9, /Meeting/).length >= 2 && s9.held.some(x => /SHIFT_SOFT/.test(x)) ? 'PASS' : 'FAIL', s9.pics)
    await B.reloadAs(p, 'a'); await B.toEdit(p)
    const s10 = await T.see(p, 'm-10-reload')
    t.add(`${idp}.10`, 'reload and sign in again', T.says(s10, 190), flag(s10, /Meeting/).length >= 2 && s10.held.some(x => /SHIFT_SOFT/.test(x)) ? 'PASS' : 'FAIL', s10.pics)
  } catch (e) { R(`${idp}.X`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await pic(p, 'meeting-X')]) }
  R(`${idp}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

async function other() {
  const { browser, p, errors } = await K.fresh()
  const idp = `S05-${P}-other`
  try {
    const f = await T.file(p, { type: 'Other', di: TUE, allday: false, span: 'custom', from: '00:00', to: '23:59', remarks: 'Oth0000-2400' })
    const rec = await T.rec(p, f.iid)
    const g0 = await Q.groundRowsOf(p, TUE, f.iid)
    t.add(`${idp}.0`, `"Other" filed for ${CSN} for Tuesday, Custom 00:00 → 24:00; form ${JSON.stringify(f.form)}; stored ${rec}; Ground rows from it ${JSON.stringify(g0)}`, 'filed', 'RECORDED')
    await T.blankLine(p, TUE)
    await T.blankRow(p, 'duty', TUE)
    const sc = await Q.scMainBlank(p, TUE)
    const s1 = await T.see(p, 'o-1-seated')
    t.add(`${idp}.1`, 'X on a blank flying line, a blank duty row and an SC MAIN seat; the request not yet put anywhere', T.says(s1, 190), flag(s1, /Other clashes/).length === 1 && flag(s1, /Other but tasked — this row/).length === 1 && flag(s1, /Other but tasked — SC/).length === 1 ? 'PASS' : 'FAIL', s1.pics)
    const step = async (id, dest, label, verdictFn) => {
      const r = await P6.accBtn(L, p, TUE, f.iid, dest)
      const s = await T.see(p, 'o-' + id)
      const gg = await Q.groundRowsOf(p, TUE, f.iid)
      t.add(`${idp}.${id}`, `${label} (${r}); stored now: ${await T.rec(p, f.iid)}; Ground rows from it: ${JSON.stringify(gg)}`, T.says(s, 190), verdictFn ? verdictFn(s) : 'RECORDED', s.pics)
    }
    await step('2', 'x', "the card's Undo pressed (takes the landed row off the Ground Programme)", s => flag(s, /Other/).length === 0 ? 'PASS' : 'FAIL')
    await step('3', 'u', '→ Unavail pressed on the card', null)
    await step('4', 'x', "the card's Undo pressed again (takes it out of Unavailable)", null)
    await step('5', 'g', '→ Ground pressed on the card', s => flag(s, /Other clashes/).length === 1 && flag(s, /Other but tasked — this row/).length === 1 && flag(s, /Other but tasked — SC/).length === 1 ? 'PASS' : 'FAIL')
  } catch (e) { R(`${idp}.X`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await pic(p, 'other-X')]) }
  R(`${idp}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}
await meeting()
await other()
T.done('bta-B-s05')
