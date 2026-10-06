/* S37 — missing times, cancellation and information-only rows: none, with the reason; ALL AVAIL on an open-ended row; repair */
import * as D from './ows-D-lib.mjs'
import * as K from './stk-B-lib.mjs'
import * as S from './ins-s-lib.mjs'
const { world, sleep, A, R, W, L, P, judge, SAT, ISO } = D
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)
const log = (...a) => console.log('>>', ...a)
const WHO = {}
/* (a) flying line with a take-off and NO landing — Ranger */
const wa = await K.addFlyWave(p, SAT)
await K.ff(p, SAT, wa.gi, 0, 'cs', 'AAA'); await K.ff(p, SAT, wa.gi, 0, 'to', '12:00')
WHO.a = (await K.seat(p, SAT, wa.gi, 0, 0, 'p', 'bane')).took
/* (b) duty row with a start and NO end — Piston */
const dB = await R.addRow(p, 'duty', SAT, 'DESK-X', '09:00', null, 'pump'); WHO.b = dB.took
/* (c) a flying line 12:00–13:00 with its jet cancelled (CX, with a reason) — Vandal */
const wc = await K.addFlyWave(p, SAT)
await K.ff(p, SAT, wc.gi, 0, 'cs', 'CCC'); await K.ff(p, SAT, wc.gi, 0, 'to', '12:00'); await K.ff(p, SAT, wc.gi, 0, 'ld', '13:00')
WHO.c = (await K.seat(p, SAT, wc.gi, 0, 0, 'p', 'split')).took
await S.cx(p, SAT, `${SAT}.${wc.gi}.0.0`, 'walk S37 cancelled jet')
/* (d) an information-only ground row 09:00–15:00 — Sidewinder */
const gD = await R.addRow(p, 'ground', SAT, 'INFO-1', '09:00', '15:00', 'mamba'); WHO.d = gD.took
{ const b = p.locator(`#schedBoard [data-grinfo="${SAT}.${gD.ri}"]`).first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(600) }
/* (e) Common Programme item with a start and no end, ALL AVAIL on it */
const cE = await R.addRow(p, 'prog', SAT, 'CP-OPEN', '09:00', null, 'allavail'); WHO.e = cE.took
log('fixture', JSON.stringify(WHO))
log(await p.evaluate(i => JSON.stringify({ w: window.DAYS[i].waves.map(w => w.formations.map(f => `${f.cs} ${f.to}-${f.ld} ${f.aircraft[0].p} cx=${f.aircraft[0].cx || ''}`)), d: window.DAYS[i].dutywaves.map(b => b.rows.map(r => `${r.role} ${r.str}-${r.end} ${r.id}`)), g: window.DAYS[i].ground, a: window.DAYS[i].allhands }), SAT))
const pFix = await P(p, 'S37-fixture-board')

const IDS = ['bane', 'pump', 'split', 'mamba']
const read = async () => p.evaluate(ids => { const o = {}
  for (const id of ids) o[id] = [...document.querySelectorAll(`#schedBoard .puck[data-person="${id}"]`)].filter(e => e.offsetParent !== null && !e.closest('#sbRoster')).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim() + ' {' + String(e.className).replace(/\s+/g, ' ').slice(0, 60) + '} title=' + (e.getAttribute('title') || '').slice(0, 160))
  return o }, IDS)
const modeInfo = async tag => {
  await D.oilMode(p, true)
  const figs = await read(); const sw = await D.switches(p)
  const note = await p.evaluate(() => (document.querySelector('#schedBoard .oilbanner, #schedBoard .sb-oil, #schedBoard [class*=oilmode]') || {}).innerText || '')
  log(tag, 'figs', JSON.stringify(figs))
  log(tag, 'switches', JSON.stringify(sw.filter(s => /^(CP-OPEN|DESK-X|INFO-1|AAA|CCC)/.test(s.txt) || true).map(s => `${s.txt}:${s.cls.replace('ain oilitem ', '').replace('lin oilitem ', '')}:${s.title.slice(0, 70)}`)))
  return { figs, sw }
}
const m1 = await modeInfo('unpublished')
/* the ALL AVAIL window: tap the placeholder on the open-ended item inside the mode */
const chipSel = '#schedBoard .puck[data-person="allavail"]'
const nChip = await p.locator(chipSel).count()
let winTxt = '(no ALL AVAIL puck found)', winPic = null
if (nChip) {
  const c = p.locator(`${chipSel}:visible`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center' })); await c.click().catch(() => {}); await sleep(900)
  winTxt = await p.evaluate(() => { const w = document.querySelector('.availwin'); return w ? w.innerText.replace(/\s+/g, ' ').trim() : '(no window drawn)' })
  winPic = await P(p, 'S37-allavail-window')
  log('ALL AVAIL window:', winTxt.slice(0, 600))
  await p.keyboard.press('Escape'); await sleep(300)
}
const pMode = await P(p, 'S37-oilmode-initial')
await D.oilMode(p, false)
await A.closeBoard(p)
/* nothing is paid before the day goes out */
const cellsPre = {}
await A.lwOpenMonth(p, 'JUL'); for (const id of IDS) cellsPre[id] = await A.lwCellOf(p, id, ISO[SAT])
const hasCell = id => /HO|FO/.test(D.letters(cellsPre[id]))
judge('S37.initial', 'four isolated cases on one Saturday: (a) flight with take-off 12:00 and no landing — Ranger; (b) duty with 09:00 and no end — Piston; (c) a jet cancelled with CX — Vandal; (d) an ⓘ info-only ground row 09:00–15:00 — Sidewinder; (e) ALL AVAIL on a programme item 09:00, no end; OIL Earn read', [
  ['all fixtures seated', Object.values(WHO).every(Boolean), WHO],
  ['(a) the mode figure for Ranger shows no HO/FO', !/\b(HO|FO)\b/.test((m1.figs.bane || []).join(' ')), m1.figs.bane],
  ['(b) Piston none', !/\b(HO|FO)\b/.test((m1.figs.pump || []).join(' ')), m1.figs.pump],
  ['(c) Vandal none', !/\b(HO|FO)\b/.test((m1.figs.split || []).join(' ')), m1.figs.split],
  ['(d) Sidewinder none', !/\b(HO|FO)\b/.test((m1.figs.mamba || []).join(' ')), m1.figs.mamba],
  ['no Leave War credit before the day goes out', !IDS.some(hasCell), IDS.map(i => i + ':' + D.letters(cellsPre[i])).join(' ')],
  ['the ALL AVAIL window opened and gives a reason or list', !/no window/.test(winTxt) && winTxt.length > 20, winTxt.slice(0, 300)],
], [pFix, pMode, winPic].filter(Boolean))

/* repair: the duty row's end → 15:00 */
await R.setRow(p, 'duty', SAT, dB.ri, 'end', '15:00')
const m2 = await modeInfo('repaired')
const pRep = await P(p, 'S37-oilmode-repaired')
await D.oilMode(p, false)
await A.closeBoard(p)
await A.lwOpenMonth(p, 'JUL'); const cPre2 = await A.lwCellOf(p, 'pump', ISO[SAT])
const d2 = await D.dayState(p, SAT, 'S37-repaired')
judge('S37.repair', 'repaired the duty row: end box 15:00 (09:00–15:00) on the working copy of the unpublished day', [
  ['OIL Earn figure for Piston: HO (candidate)', /\bHO\b/.test((m2.figs.pump || []).join(' ')), m2.figs.pump],
  ['the other three still none', !/\b(HO|FO)\b/.test(['bane', 'split', 'mamba'].map(i => (m2.figs[i] || []).join(' ')).join(' ')), ['bane', 'split', 'mamba'].map(i => m2.figs[i])],
  ['not paid yet: Leave War cell empty', !/HO|FO/.test(D.letters(cPre2)), cPre2.text],
], [pRep, ...d2.pics])
/* issue */
const pub = await A.publishNew(p, SAT); await A.closeBoard(p)
const after = {}
await A.lwOpenMonth(p, 'JUL'); for (const id of IDS) after[id] = await A.lwCellOf(p, id, ISO[SAT])
const oP = await D.oilOf(p, 'pump', ISO[SAT], 'S37-pump')
const oB = await D.oilOf(p, 'bane', ISO[SAT], 'S37-bane')
const oS = await D.oilOf(p, 'split', ISO[SAT], 'S37-split')
const oM = await D.oilOf(p, 'mamba', ISO[SAT], 'S37-mamba')
judge('S37.issue', 'four sign-offs, Publish day', [
  ['ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag],
  ['Piston (repaired duty): HO, worked 09:00–15:00', oP.letters === 'HO' && /09:00.15:00/.test(oP.row), `${oP.cell.text} | ${oP.row.slice(0, 140)}`],
  ['Ranger (no landing): nothing, balance 0', oB.letters !== 'HO' && oB.letters !== 'FO', `${oB.cell.text} | ${oB.row.slice(0, 100)}`],
  ['Vandal (cancelled jet): nothing', oS.letters !== 'HO' && oS.letters !== 'FO', `${oS.cell.text} | ${oS.row.slice(0, 100)}`],
  ['Sidewinder (info-only row): nothing', oM.letters !== 'HO' && oM.letters !== 'FO', `${oM.cell.text} | ${oM.row.slice(0, 100)}`],
], [...oP.pics, ...oB.pics, ...oS.pics, ...oM.pics])
console.log('ERRORS', JSON.stringify(D.cleanErr(errors)))
D.savePart('ows-D-s37', { errors: D.cleanErr(errors), window: winTxt, pics: D.pics.saved })
await browser.close()
