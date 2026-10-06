/* walker A — S10, S11 (a, b), S12, S13. One scenario per process: node ows-A-scn1.mjs S10 */
import * as A from './ows-A-lib.mjs'
import * as K from './stk-B-lib.mjs'
const { judge, W, frame, flyLine, snap, sayS, hasW, spans, credits, logicSet, lgRead, signStand, signFell, signsWords, sleep, pic } = A
const SAT = 5, ID = 'bane'
const which = process.argv[2]
const PH = !!process.env.HP_PHONE
const sfx = PH ? 'ph' : ''

const SC = {
  async S10() {
    await frame('S10' + sfx, async ({ p }) => {
      const T = 'S10' + sfx
      await flyLine(p, { to: '12:00', ld: '13:00', report: 'IN TIME 0830' })
      const pub = await A.publishNew(p, SAT); await A.closeBoard(p)
      const a = await snap(p, SAT, ID, A.SAT, T + '-a')
      judge(T + '.1', 'Ranger on Saturday line 12:00–13:00, "+ In-time / Rally" typed IN TIME 0830; four signed; published', [
        ['ORIG', pub.head.tag === 'ORIG', pub.head.tag], ['FO', a.lw.letters === 'FO', a.lw.cell.text],
        ['worked 08:30–15:00', spans(a).includes('08:30–15:00'), a.lw.row.slice(0, 150)], ['nothing pending', a.d.pend === '0', a.d.head.pending],
      ], a.pics); console.log(T + '.1', sayS(a))
      await logicSet(p, 'debrief', '2h30')
      const lg = await lgRead(p)
      const b = await snap(p, SAT, ID, A.SAT, T + '-b')
      judge(T + '.2', 'Logic: Flight debrief after land 2h → 2h30; Saturday, Leave War, tracker', [
        ['value 150', lg.debrief === 150, lg],
        ['cell still FO', b.lw.letters === 'FO', b.lw.cell.text], ['worked still 08:30–15:00', spans(b).includes('08:30–15:00') && !spans(b).includes('08:30–15:30'), b.lw.row.slice(0, 150)],
        ['balance unmoved', b.lw.bal === a.lw.bal, [a.lw.bal, b.lw.bal]],
        ['one pending', b.d.pend === '1', b.d.head.pending], ['sign-offs fell', signFell(b.d.head), signsWords(b.d.head)],
        ['list: OIL on this day · Logic values changed… + debrief 2h → 2h30', /OIL on this day/.test(b.d.list) && /2h\s*→\s*2h30/.test(b.d.list), b.d.list.slice(0, 300)],
        ['man: full day 08:30–15:00 → full day 08:30–15:30', /Ranger/.test(b.d.list) && /08:30.15:00/.test(b.d.list) && /08:30.15:30/.test(b.d.list), b.d.list.slice(0, 300)],
      ], b.pics); console.log(T + '.2', sayS(b))
      const am = await A.publishAm(p, SAT); await A.closeBoard(p)
      const c = await snap(p, SAT, ID, A.SAT, T + '-c')
      judge(T + '.3', 'sign again; publish the amendment', [
        ['AL1', /AL\s*1/.test(am.head.tag), am.head.tag], ['cell FO', c.lw.letters === 'FO', c.lw.cell.text],
        ['worked now 08:30–15:30', spans(c).includes('08:30–15:30'), c.lw.row.slice(0, 160)],
        ['balance not raised (no second FO)', c.lw.bal === a.lw.bal && credits(c.lw.row) === 1, { bal: c.lw.bal, credits: credits(c.lw.row) }],
        ['nothing pending', c.d.pend === '0', c.d.head.pending],
      ], c.pics); console.log(T + '.3', sayS(c))
    })
  },

  async S11a() { await S11('a') },
  async S11b() { await S11('b') },

  async S12() {
    await frame('S12' + sfx, async ({ p }) => {
      const T = 'S12' + sfx
      await flyLine(p, { to: '12:00', ld: '13:00', report: 'IN TIME 10:00' })
      const D = await import('./rbl-D-lib.mjs')
      const g = await D.addRow(p, 'ground', SAT, 'GND', '08:00', '18:00', ID)
      const pub = await A.publishNew(p, SAT); await A.closeBoard(p)
      const a = await snap(p, SAT, ID, A.SAT, T + '-a')
      judge(T + '.1', 'Ranger: Ground row GND 08:00–18:00 and a flying line 12:00–13:00 with IN TIME 10:00; published', [
        ['seated on the Ground row', g.took === true, g], ['ORIG', pub.head.tag === 'ORIG', pub.head.tag], ['FO', a.lw.letters === 'FO', a.lw.cell.text],
        ['worked 08:00–18:00', spans(a).includes('08:00–18:00'), a.lw.row.slice(0, 150)], ['nothing pending', a.d.pend === '0', a.d.head.pending],
      ], a.pics); console.log(T + '.1', sayS(a))
      await logicSet(p, 'reportLead', '2h30')
      const s1 = await snap(p, SAT, ID, A.SAT, T + '-b1', { shots: false })
      await logicSet(p, 'debrief', '2h30')
      const s2 = await snap(p, SAT, ID, A.SAT, T + '-b2', { shots: false })
      await logicSet(p, 'oilFullMin', '6h40')
      const lg = await lgRead(p)
      const b = await snap(p, SAT, ID, A.SAT, T + '-b3')
      judge(T + '.2', 'Logic: lead 3h → 2h30, debrief 2h → 2h30, threshold 6h01 → 6h40, one after the other', [
        ['values 150/150/400', lg.lead === 150 && lg.debrief === 150 && lg.full === 400, lg],
        ['after lead: nothing pending, sign-offs stand', s1.d.pend === '0' && signStand(s1.d.head), [s1.d.head.pending, signsWords(s1.d.head)]],
        ['after debrief: nothing pending, sign-offs stand', s2.d.pend === '0' && signStand(s2.d.head), [s2.d.head.pending, signsWords(s2.d.head)]],
        ['after threshold: nothing pending', b.d.pend === '0' && !b.d.list, [b.d.head.pending, b.d.list]],
        ['sign-offs stand (no Not-yet-signed chip)', signStand(b.d.head), signsWords(b.d.head)],
        ['cell FO, worked 08:00–18:00, balance unmoved', b.lw.letters === 'FO' && spans(b).includes('08:00–18:00') && b.lw.bal === a.lw.bal, A.say(b.lw)],
      ], b.pics); console.log(T + '.2', sayS(b))
    })
  },

  async S13() {
    await frame('S13' + sfx, async ({ p }) => {
      const T = 'S13' + sfx
      const w = await flyLine(p, { to: '12:00', ld: '13:00', report: null })
      const pub = await A.publishNew(p, SAT); await A.closeBoard(p)
      const a = await snap(p, SAT, ID, A.SAT, T + '-a')
      judge(T + '.1', 'Ranger 12:00–13:00 no report; published', [
        ['ORIG', pub.head.tag === 'ORIG', pub.head.tag], ['HO', a.lw.letters === 'HO', a.lw.cell.text], ['worked 09:00–15:00', spans(a).includes('09:00–15:00'), a.lw.row.slice(0, 150)],
      ], a.pics); console.log(T + '.1', sayS(a))
      await logicSet(p, 'reportLead', '2h30')
      const b = await snap(p, SAT, ID, A.SAT, T + '-b')
      judge(T + '.2', 'Logic lead 3h → 2h30', [
        ['one pending, sign-offs fell', b.d.pend === '1' && signFell(b.d.head), [b.d.head.pending, signsWords(b.d.head)]],
        ['Leave War holds HO 09:00–15:00', b.lw.letters === 'HO' && spans(b).includes('09:00–15:00') && b.lw.bal === a.lw.bal, A.say(b.lw)],
      ], b.pics); console.log(T + '.2', sayS(b))
      await A.toBoard(p, SAT); await A.addItBtn(p, SAT, w.wi)
      const itAfterBtn = await A.intimes(p, SAT, w.wi)
      await A.setItLine(p, SAT, w.wi, 0, 'IN TIME 0900')
      const lines = await A.intimes(p, SAT, w.wi)
      await A.closeBoard(p)
      const c = await snap(p, SAT, ID, A.SAT, T + '-c')
      judge(T + '.3', 'then "+ In-time / Rally" typed IN TIME 0900', [
        ['the line reads 09:00', lines.length === 1 && /09:?00/.test(lines[0]), { btn: itAfterBtn, lines }],
        ['an ordinary reporting change is pending (the day reads pending)', c.d.pend !== '0', c.d.head.pending],
        ['the Logic explanation is still in To go out ("OIL on this day · Logic values changed")', /OIL on this day/.test(c.d.list), c.d.list.slice(0, 400)],
        ['it says 09:00–15:00 → 09:30–15:00 for Ranger (issued content under the lead now set)', /09:00.15:00/.test(c.d.list) && /09:30.15:00/.test(c.d.list), c.d.list.slice(0, 400)],
        ['Leave War holds HO 09:00–15:00', c.lw.letters === 'HO' && spans(c).includes('09:00–15:00') && c.lw.bal === a.lw.bal, A.say(c.lw)],
      ], c.pics); console.log(T + '.3', sayS(c))
    })
  },
}

async function S11(kind) {
  const nm = 'S11' + kind + sfx
  await frame(nm, async ({ p }) => {
    let fix = ''
    if (kind === 'a') { await flyLine(p, { to: '12:00', ld: '13:00', report: null }); fix = 'flight 12:00–13:00, no report (nominal 09:00 → 15:00)' }
    else { const D = await import('./rbl-D-lib.mjs'); await p.evaluate(() => 0); await S0(p); const r = await D.addRow(p, 'duty', SAT, 'DOO', '09:00', '15:00', ID); fix = 'duty row DOO 09:00–15:00, seated ' + JSON.stringify([r.took, r.msg]) }
    const pub = await A.publishNew(p, SAT); await A.closeBoard(p)
    const a = await snap(p, SAT, ID, A.SAT, nm + '-a')
    judge(nm + '.1', fix + '; four signed; published', [
      ['ORIG', pub.head.tag === 'ORIG', pub.head.tag], ['HO', a.lw.letters === 'HO', a.lw.cell.text],
      ['worked 09:00–15:00', spans(a).includes('09:00–15:00'), a.lw.row.slice(0, 150)], ['nothing pending', a.d.pend === '0', a.d.head.pending],
    ], a.pics); console.log(nm + '.1', sayS(a))
    const set = await logicSet(p, 'oilFullMin', '6h'); const lg = await lgRead(p)
    const b = await snap(p, SAT, ID, A.SAT, nm + '-b')
    judge(nm + '.2', 'Logic: Full-day OIL threshold 6h01 → 6h', [
      ['value 360', lg.full === 360, { set, lg }], ['cell still HO', b.lw.letters === 'HO', b.lw.cell.text],
      ['worked 09:00–15:00', spans(b).includes('09:00–15:00'), b.lw.row.slice(0, 150)], ['balance unmoved', b.lw.bal === a.lw.bal, [a.lw.bal, b.lw.bal]],
      ['one pending', b.d.pend === '1', b.d.head.pending], ['sign-offs fell', signFell(b.d.head), signsWords(b.d.head)],
      ['list: threshold sub-line and man half day → full day', /Full-day OIL threshold/i.test(b.d.list) && /half day/.test(b.d.list) && /full day/.test(b.d.list), b.d.list.slice(0, 330)],
    ], b.pics); console.log(nm + '.2', sayS(b))
    const am = await A.publishAm(p, SAT); await A.closeBoard(p)
    const c = await snap(p, SAT, ID, A.SAT, nm + '-c')
    judge(nm + '.3', 'sign again; publish the amendment', [
      ['AL1', /AL\s*1/.test(am.head.tag), am.head.tag], ['cell FO', c.lw.letters === 'FO', c.lw.cell.text],
      ['worked unchanged 09:00–15:00', spans(c).includes('09:00–15:00'), c.lw.row.slice(0, 160)], ['balance higher by 0.5', c.lw.bal === a.lw.bal + 0.5, [a.lw.bal, c.lw.bal]],
      ['nothing pending', c.d.pend === '0', c.d.head.pending],
    ], c.pics); console.log(nm + '.3', sayS(c))
  })
}
async function S0(p) { await A.L.go(p, 'editsched'); await sleep(400) }

if (!SC[which]) { console.log('no such scenario', which); process.exit(1) }
await SC[which]()
