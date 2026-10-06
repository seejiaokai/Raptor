/* S20 — edit / delete on another page: a typed Meeting earlier than the report, changed, moved, deleted; and an accepted request's Ground Programme row and its own removal door */
import * as C from './rbl-C-lib.mjs'
import * as W2 from './dbrA-W2-lib.mjs'
const { B, L, W, K, ID, MON, TUE, R, pic, picEl } = C

const restSentence = async p => (await C.fullWarnsX(p, TUE)).filter(w => /CREW_REST/.test(w.code)).map(w => w.msg)
const view = async (p, tag, shots = true) => {
  const s = await C.seeWeek(p, TUE, tag, { noPics: !shots, prev: -1 })
  const lines = (s.list.full || []).filter(x => x.text.includes(C.CSN) && /rest/i.test(x.text)).map(x => x.text.replace(/ ✕| ↺/g, ''))
  return { s, lines, sentence: await restSentence(p), tue: s.pk.filter(x => x.where === 'flying line'), pics: s.pics }
}
const ringTxt = xs => xs.length ? xs.map(x => `${x.solid ? 'SOLID' : x.dashed ? 'DASHED' : 'no ring'}${x.chip ? ' chip ' + x.chip : ''}`).join('/') : '(none)'
/* click the breach line in Tuesday's list; say which things light up */
async function clickWarn(p) {
  await B.toEdit(p); await B.openList(p, '#eWeek', TUE)
  const li = p.locator(`#eWeek .day[data-day="${TUE}"] [data-dwbox="${TUE}"] .witem[data-wix]`).filter({ hasText: C.CSN }).filter({ hasText: /Crew rest/ }).first()
  if (!(await li.count())) return 'no breach line to press'
  await li.evaluate(e => e.scrollIntoView({ block: 'center' })); await C.sleep(150)
  await li.locator('.wtx, :scope').first().click({ position: { x: 20, y: 8 } }).catch(() => {})
  await C.sleep(500)
  return p.evaluate(() => {
    const lit = [...document.querySelectorAll('.puck.wfoc, .wfoc')].filter(e => e.offsetParent !== null).map(e => (e.closest('.dsec, .sb-panel') ? (e.closest('.dsec, .sb-panel').className.replace(/\s+/g, ' ').slice(0, 30)) : 'other') + ':' + (e.dataset.person || e.className.toString().slice(0, 20)))
    return `lit after pressing the line: ${lit.length ? lit.slice(0, 8).join(', ') : 'nothing lit'}`
  })
}

const { browser, p, errors } = await K.fresh()
try {
  const cs = await B.csOf(p, ID)
  const { m, t } = await C.baselineB(p)
  let v = await view(p, 's20-0-base')
  const base = v.sentence[0]
  R('S20.0', `Baseline B with ${cs}`, `rest line: ${base}`, base && /05:00/.test(base) ? 'PASS' : 'FAIL', v.pics)

  const f = await C.fileInput(p, { type: 'Meeting', di: TUE, allday: false, from: '04:00', to: '04:30', remarks: 'S20 early meet' })
  v = await view(p, 's20-1-meeting-0400')
  const clicked = await clickWarn(p)
  R('S20.1', `Inputs page: a Meeting 04:00–04:30 on Tuesday for ${cs} (filed ${!!f.iid})`, `rest line now: ${v.sentence[0]}; his Tuesday cockpit puck ${ringTxt(v.tue)}; ${clicked}`, v.sentence[0] && /04:00/.test(v.sentence[0]) && v.sentence[0] !== base ? 'PASS' : 'FAIL', v.pics)

  await W2.openEdit(p, f.iid)
  await p.locator('#inBody tr.ined [data-ed="stime"]').fill('03:00'); await p.locator('#inBody tr.ined [data-ed="etime"]').fill('03:30')
  await p.locator('#inBody tr.ined [data-save]').first().click(); await C.sleep(700)
  v = await view(p, 's20-2-meeting-0300')
  R('S20.2', 'Inputs ✎: the Meeting\'s time changed to 03:00–03:30', `rest line now: ${v.sentence[0]}`, v.sentence[0] && /03:00/.test(v.sentence[0]) ? 'PASS' : 'FAIL', v.pics)

  const red = await W2.redate(p, f.iid, C.ISO(2), C.ISO(2))
  v = await view(p, 's20-3-meeting-moved')
  R('S20.3', 'Inputs ✎: the Meeting\'s date moved from Tuesday to Wednesday', `calendar read "${red}"; Tuesday rest line now: ${v.sentence[0]}`, v.sentence[0] === base ? 'PASS' : 'FAIL', v.pics)
  await W2.redate(p, f.iid, C.ISO(1), C.ISO(1))
  v = await view(p, 's20-3b-meeting-back', false)
  R('S20.3b', 'moved back to Tuesday', `Tuesday rest line: ${v.sentence[0]}`, v.sentence[0] && /03:00/.test(v.sentence[0]) ? 'PASS' : 'FAIL')
  const gone = await W2.delReq(p, f.iid)
  v = await view(p, 's20-4-meeting-deleted')
  R('S20.4', 'Inputs ✕: the Meeting deleted', `the row says "${gone}"; Tuesday rest line now: ${v.sentence[0]}; his puck ${ringTxt(v.tue)}`, gone === 'gone' && v.sentence[0] === base ? 'PASS' : 'FAIL', v.pics)

  /* a request that landed on the Ground Programme, removed through the programme row's own ✕ */
  const f2 = await C.fileInput(p, { type: 'Meeting', di: TUE, allday: false, from: '04:00', to: '04:30', remarks: 'S20 ground' })
  v = await view(p, 's20-5-landed', false)
  const ri = await p.evaluate(([d, i]) => (window.DAYS[d].ground || []).findIndex(r => r.src === i), [TUE, f2.iid])
  R('S20.5', 'a second Meeting 04:00–04:30 filed again (it lands on the Ground Programme)', `landed row index ${ri}; rest line: ${v.sentence[0]}`, ri >= 0 && /04:00/.test(v.sentence[0] || '') ? 'PASS' : 'FAIL')
  await K.boardTo(p, TUE)
  const x = p.locator(`#schedBoard [data-grdel="${TUE}.${ri}"]:visible`).first()
  let removed = 'no ✕ on that row'
  if (await x.count()) { await x.evaluate(e => e.scrollIntoView({ block: 'center' })); await x.click(); await C.sleep(800); removed = 'pressed' }
  v = await view(p, 's20-6-ground-removed')
  const left = await p.evaluate(([d, i]) => (window.DAYS[d].ground || []).some(r => r.src === i), [TUE, f2.iid])
  R('S20.6', 'the landed row removed with its own ✕ on the Board\'s Ground Programme', `${removed}; row still in the programme: ${left}; Tuesday rest line now: ${v.sentence[0]}`, v.sentence[0] === base ? 'PASS' : 'FAIL', v.pics)
} catch (e) { R('S20', 'script', String(e.stack || e).slice(0, 700), 'NOT WALKED', [await pic(p, 's20-X').catch(() => '')]) }
R('S20.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
B.savePart('rbl-C-s20')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}\n   ${r.did}\n   → ${r.saw}\n   ${r.pics.join(' ')}`)
