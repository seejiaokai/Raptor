/* S38 — person, row and blanket decisions in OIL Earn mask the right work (desktop; HP_PHONE=1 for the phone) */
import * as D from './ows-D-lib.mjs'
import * as F from './ows-D-fix.mjs'
const { world, sleep, A, R, W, L, P, judge, SAT, ISO, pend, signsOf } = D
const { browser, p, errors } = await world()
const log = (...a) => console.log('>>', ...a)
const NAME = D.PHONE ? 'S38ph' : 'S38'
const f = await F.m38(p)
const pub = await A.publishNew(p, SAT); await A.closeBoard(p)
const key = { v: null, d: null }
async function snap(tag) {
  await D.oilMode(p, false).catch(() => {}); await A.closeBoard(p)
  const d = await D.dayState(p, SAT, `${NAME}-${tag}`)
  const o = await D.oilOf(p, 'bane', ISO[SAT], `${NAME}-${tag}`)
  return { d, o, pics: [...d.pics, ...o.pics] }
}
async function modeOn() { await A.toBoard(p, SAT); await D.oilMode(p, true); await sleep(300) }
const two = o => /06:00.06:30/.test(o.row) && /10:00.15:00/.test(o.row)
const s0 = await snap('base')
const bal0 = s0.o.bal
log('base cell', s0.o.cell.text, '| row', s0.o.row.slice(0, 160), '| pending', s0.d.head.pending, '| signs', signsOf(s0.d.head))
judge(`${NAME}.0`, 'M (Ranger): duty DESK-A 06:00–06:30 through "+ Row"; flight VIPER 12:00–13:00 with IN TIME 10:00 typed through "+ In-time / Rally"; four sign-offs; Publish day', [
  ['fixture seated, line typed', f.took && f.its.length === 1, { took: f.took, its: f.its }],
  ['published ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag],
  ['Leave War FO', s0.o.letters === 'FO', s0.o.cell.text],
  ['tracker prints both periods 06:00–06:30 and 10:00–15:00', two(s0.o), s0.o.row.slice(0, 200)],
], s0.pics)
const stepRows = []
async function check(id, did, tag, fig, extra = []) {
  const s = await snap(tag)
  const ok = judge(id, did, [
    ['mode figure for Ranger: ' + fig.label, fig.test(fig.val), fig.val],
    ['Leave War cell still FO (published holds)', s.o.letters === 'FO', s.o.cell.text],
    ['tracker still prints both periods', two(s.o), s.o.row.slice(0, 200)],
    ['balance unchanged', s.o.bal === bal0, { was: bal0, now: s.o.bal }],
    ...extra.map(e => e(s)),
  ], s.pics)
  console.log(`   [${id}] day chip "${s.d.head.pending}" · version ${s.d.head.tag} · working-copy marker "${s.d.head.nys}" · signed line "${(s.d.head.signed || '').slice(0, 60)}" · selects ${signsOf(s.d.head)} · To go out: "${s.d.list.slice(0, 380)}"`)
  return s
}

/* --- 1. the flight row off (tap the VIPER line's own switch) --- */
await modeOn()
const vk = await F.itemKey(p, 'VIPER'), dk = await F.itemKey(p, 'DESK-A')
log('keys', vk, dk, JSON.stringify(await F.oilHeader(p)))
const t1 = await F.tapItem(p, vk)
const fig1 = await F.figOf(p, 'bane'); const hdr1 = await F.oilHeader(p)
const p1 = await P(p, `${NAME}-1-mode-flightoff`)
log('after flight off:', t1, JSON.stringify(fig1), JSON.stringify(hdr1.btns.slice(-3)))
await check(`${NAME}.1`, 'OIL Earn: tapped the VIPER row switch (flight off)', '1-flightoff', { label: 'half day for the duty alone (HO), the flight no longer counted', val: fig1.join(' | '), test: v => /HO/.test(v) && !/FO/.test(v) }, [s => ['the day reads 1 pending', pend(s.d.head) === '1', s.d.head.pending]])
/* --- 2. back on --- */
await modeOn()
const t2 = await F.tapItem(p, vk); const fig2 = await F.figOf(p, 'bane')
await P(p, `${NAME}-2-mode-flighton`)
await check(`${NAME}.2`, 'tapped the VIPER switch again (restored)', '2-flighton', { label: 'FO again', val: fig2.join(' | '), test: v => /FO/.test(v) }, [s => ['nothing pending again', pend(s.d.head) === '0', s.d.head.pending], s => ['sign-offs: ' + signsOf(s.d.head), true, '']])
/* --- 3. the whole day off: "Nothing today earns" --- */
await modeOn()
const dayBtn = p.locator('#schedBoard button', { hasText: /Nothing today earns/ }).first()
await dayBtn.evaluate(e => e.scrollIntoView({ block: 'center' })); await dayBtn.click(); await sleep(700)
const fig3 = await F.figOf(p, 'bane'); const hdr3 = await F.oilHeader(p)
const t3 = await D.toast(p)
await P(p, `${NAME}-3-mode-dayoff`)
log('day off:', t3, JSON.stringify(fig3), JSON.stringify(hdr3.btns.slice(-3)))
await check(`${NAME}.3`, 'tapped the day switch "Nothing today earns — covers anything added later too"', '3-dayoff', { label: 'none', val: fig3.join(' | '), test: v => !/\b(HO|FO)\b/.test(v) }, [s => ['the day reads 1 pending', pend(s.d.head) === '1', s.d.head.pending]])
/* back on: the same button now reads something else */
await modeOn()
const hdrB = await F.oilHeader(p)
log('day-level buttons now:', JSON.stringify(hdrB.btns.slice(-3)))
const dayBtn2 = p.locator('#schedBoard button', { hasText: /(Everything|earns|Earn)/ }).filter({ hasNotText: /OIL done|OIL Earn/ }).first()
const lbl2 = (await dayBtn2.count()) ? (await dayBtn2.innerText()).trim() : '(none)'
log('restore button', lbl2)
if (await dayBtn2.count()) { await dayBtn2.evaluate(e => e.scrollIntoView({ block: 'center' })); await dayBtn2.click(); await sleep(700) }
const fig4 = await F.figOf(p, 'bane'); await P(p, `${NAME}-4-mode-dayrestored`)
await check(`${NAME}.4`, `pressed the day switch's restore button ("${lbl2}")`, '4-dayrestored', { label: 'FO again', val: fig4.join(' | '), test: v => /FO/.test(v) }, [s => ['nothing pending', pend(s.d.head) === '0', s.d.head.pending]])
/* --- 5. the man off: his flight puck, then his duty puck --- */
await modeOn()
const t5 = await F.tapPuck(p, 'bane', vk)
const fig5 = await F.figOf(p, 'bane'); await P(p, `${NAME}-5-mode-manoff-flight`)
log('man off the flight:', t5, JSON.stringify(fig5))
const s5 = await check(`${NAME}.5`, 'tapped Ranger\'s own puck on the VIPER line (take him off that event)', '5-manoff-flight', { label: 'half day (the duty still counts)', val: fig5.join(' | '), test: v => /HO/.test(v) && !/FO/.test(v) }, [s => ['the day reads 1 pending', pend(s.d.head) === '1', s.d.head.pending]])
await modeOn()
const t6 = await F.tapPuck(p, 'bane', dk)
const fig6 = await F.figOf(p, 'bane'); await P(p, `${NAME}-6-mode-manoff-both`)
log('man off the duty too:', t6, JSON.stringify(fig6))
await check(`${NAME}.6`, 'then tapped his puck on DESK-A too (off both events = off for the day)', '6-manoff-both', { label: 'none', val: fig6.join(' | '), test: v => !/\b(HO|FO)\b/.test(v) }, [s => ['the day reads pending', pend(s.d.head) !== '0', s.d.head.pending]])
/* restore both */
await modeOn(); await F.tapPuck(p, 'bane', vk); await F.tapPuck(p, 'bane', dk)
const fig7 = await F.figOf(p, 'bane'); await P(p, `${NAME}-7-mode-restored`)
await check(`${NAME}.7`, 'tapped both pucks back on', '7-restored', { label: 'FO', val: fig7.join(' | '), test: v => /FO/.test(v) }, [s => ['nothing pending', pend(s.d.head) === '0', s.d.head.pending]])
/* --- 8. flight row off, then the debrief changed under it (all flight work excluded) --- */
await modeOn(); await F.tapItem(p, vk); await D.oilMode(p, false); await A.closeBoard(p)
const set = await A.logicSet(p, 'debrief', '2h30')
const s8 = await snap('8-flightoff-debrief')
const lineLogic = /OIL on this day|Logic/i.test(s8.d.list)
judge(`${NAME}.8`, 'with the flight row off: Logic "Flight debrief after land" 2h → 2h30', [
  ['the value changed', (await A.logicGet(p)).debrief === 150, set],
  ['published cell still FO', s8.o.letters === 'FO', s8.o.cell.text],
  ['tracker still both periods', two(s8.o), s8.o.row.slice(0, 200)],
  ['balance unchanged', s8.o.bal === bal0, { was: bal0, now: s8.o.bal }],
  ['no "OIL on this day · Logic values changed" line (the flight is excluded, no record would differ)', !/Logic values changed/.test(s8.d.list), s8.d.list.slice(0, 400)],
], s8.pics)
console.log(`   [${NAME}.8] chip "${s8.d.head.pending}" signs ${signsOf(s8.d.head)} list "${s8.d.list.slice(0, 400)}"`)
/* put the flight back on: now the debrief change WOULD alter the flight's worked end */
await modeOn(); await F.tapItem(p, vk); await D.oilMode(p, false); await A.closeBoard(p)
const s9 = await snap('9-flighton-debrief')
judge(`${NAME}.9`, 'flight row back on, debrief still 2h30 (now the flight counts again)', [
  ['published cell still FO', s9.o.letters === 'FO', s9.o.cell.text],
  ['tracker still both periods (end 15:00)', two(s9.o), s9.o.row.slice(0, 200)],
  ['the day reads 1 pending (worked end would be 15:30)', pend(s9.d.head) === '1', s9.d.head.pending],
  ['To go out says OIL on this day · Logic values changed, with the man', /Logic values changed/.test(s9.d.list) && /Ranger/.test(s9.d.list), s9.d.list.slice(0, 400)],
], s9.pics)
console.log(`   [${NAME}.9] list "${s9.d.list.slice(0, 500)}"`)
await A.logicSet(p, 'debrief', '2h')
/* --- 10. an amendment with the flight row off: only the duty is credited --- */
await modeOn(); await F.tapItem(p, vk)
const am = await A.publishAm(p, SAT); await A.closeBoard(p)
const s10 = await snap('10-al-flightoff')
judge(`${NAME}.10`, 'flight row switched off in OIL Earn; four sign again; Publish AL', [
  ['AL1', am.head && /AL\s*1/.test(am.head.tag), am.head && am.head.tag],
  ['Leave War now HO', s10.o.letters === 'HO', s10.o.cell.text],
  ['tracker: one period 06:00–06:30', /06:00.06:30/.test(s10.o.row) && !/10:00.15:00/.test(s10.o.row), s10.o.row.slice(0, 200)],
  ['balance down to base − 0.5', Math.abs(parseFloat(s10.o.bal) - (parseFloat(bal0) - 0.5)) < 0.01, { base: bal0, now: s10.o.bal }],
], s10.pics)
/* the same debrief change once the flight-off decision is ISSUED: no flight work is left to move */
await A.logicSet(p, 'debrief', '2h30')
const s10b = await snap('10b-issuedoff-debrief')
judge(`${NAME}.10b`, 'the flight-off amendment is out; now Logic "Flight debrief after land" 2h → 2h30 again', [
  ['published cell stays HO (duty only)', s10b.o.letters === 'HO', s10b.o.cell.text],
  ['tracker still one period 06:00–06:30', /06:00.06:30/.test(s10b.o.row) && !/10:00.15/.test(s10b.o.row), s10b.o.row.slice(0, 200)],
  ['nothing pending (no flight work in the issued record)', pend(s10b.d.head) === '0', s10b.d.head.pending],
  ['no Logic line in To go out', !/Logic values changed/.test(s10b.d.list), s10b.d.list.slice(0, 300)],
], s10b.pics)
console.log(`   [${NAME}.10b] chip "${s10b.d.head.pending}" list "${s10b.d.list.slice(0, 300)}"`)
await A.logicSet(p, 'debrief', '2h')
/* --- 11. restore the flight, amend again: FO and both periods return --- */
await modeOn(); await F.tapItem(p, vk)
const am2 = await A.publishAm(p, SAT); await A.closeBoard(p)
const s11 = await snap('11-al-flighton')
judge(`${NAME}.11`, 'flight row switched back on; Publish AL again', [
  ['AL2', am2.head && /AL\s*2/.test(am2.head.tag), am2.head && am2.head.tag],
  ['Leave War FO', s11.o.letters === 'FO', s11.o.cell.text],
  ['both periods again', two(s11.o), s11.o.row.slice(0, 200)],
  ['balance back to base', s11.o.bal === bal0, { base: bal0, now: s11.o.bal }],
], s11.pics)
console.log('ERRORS', JSON.stringify(D.cleanErr(errors)))
D.savePart(`ows-D-${NAME}`, { errors: D.cleanErr(errors), pics: D.pics.saved })
await browser.close()
