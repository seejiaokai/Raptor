import * as K from './stk2-S-lib.mjs'
import * as S from './stk2-M-alib.mjs'
import { handPut } from './seat-lib.mjs'
const { L, W, H } = K
const DI = 2
const { browser, p, errors } = await H.world({ who: 'a', phone: false })
await L.go(p, 'editsched'); await K.sleep(500)
const pool = ['taipan', 'mamba', 'boosh', 'beams', 'bane', 'freak', 'slash', 'stiff', 'piston', 'havoc', 'comet', 'reaper']
const onWed = await p.evaluate(ids => ids.filter(i => window.PEOPLE[i] && JSON.stringify(window.DAYS[2]).includes('"' + i + '"')), pool)
const cands = pool.filter(i => !onWed.includes(i))
const who = process.env.S3_CS ? await p.evaluate(c => Object.keys(window.PEOPLE).find(i => window.PEOPLE[i].cs === c), process.env.S3_CS) : cands[0]
const cs = await p.evaluate(i => window.PEOPLE[i].cs, who)
const role = await p.evaluate(i => JSON.stringify({ cs: window.PEOPLE[i].cs, role: window.PEOPLE[i].role, q: window.PEOPLE[i].qual }), who)
console.log('on Wed:', onWed, 'chosen', who, cs, role)
const read = async (label) => {
  const i = await S.insightsOf(p, 'S3-' + label)
  const fig = i.hours[cs], d = i.days && i.days[cs]
  const nan = JSON.stringify(i).includes('NaN') || (await p.evaluate(() => /NaN/.test(document.body.innerText)))
  console.log(label, 'hours', fig, '| tip:', d, '| nan', nan, '| pic', i.pic)
  return { fig, tip: d, nan, pic: i.pic }
}
const b0 = await read('0-base')
// the ground row 13:00-14:00 with him on it
await W.boardOn(p, DI); await K.sleep(400)
const nRows0 = await p.evaluate(() => document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow').length)
await p.locator(`#schedBoard [data-gradd="${DI}"]`).first().click(); await K.sleep(500)
const nRows1 = await p.evaluate(() => document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow').length)
const gi = nRows1 - 1
await W.boardText(p, `gr:${DI}.${gi}.prog`, 'S3 GROUND BRIEF')
await W.boardText(p, `gr:${DI}.${gi}.str`, '13:00')
await W.boardText(p, `gr:${DI}.${gi}.end`, '14:00')
const hp = await handPut(p, `g:${DI}.${gi}.+`, who)
console.log('ground row', gi, 'rows', nRows0, '->', nRows1, JSON.stringify(hp))
const gpic = await K.pic(p, 'S3-1-ground-row')
const b1 = await read('1-ground-row')
// first flying wave: + Line, leave times empty, him in the front seat
await W.boardOn(p, DI)
const wave0 = await p.evaluate(() => ({ label: window.DAYS[2].waves[0].label, forms: window.DAYS[2].waves[0].forms ? window.DAYS[2].waves[0].forms.length : (window.DAYS[2].waves[0].fms || []).length, intimes: (window.DAYS[2].waves[0].intimes || []).slice() }))
console.log('wave0', JSON.stringify(wave0))
const nF0 = await p.evaluate(() => document.querySelectorAll('#schedBoard [data-lcx^="2.0."]').length)
const gl = p.locator(`#schedBoard [data-gline="${DI}.0"]`).first()
await gl.evaluate(e => e.scrollIntoView({ block: 'center' })); await gl.click(); await K.sleep(600)
const nfIdx = await p.evaluate(() => { const ks = [...document.querySelectorAll('#schedBoard [data-bfld^="ff:2.0."]')].map(e => +e.dataset.bfld.split('.')[2]); return Math.max(...ks) })
console.log('new line index', nfIdx)
const hp2 = await handPut(p, `${DI}.0.${nfIdx}.0.p`, who)
console.log('front seat', JSON.stringify(hp2))
const toLd = await p.evaluate(i => ({ to: (document.querySelector(`#schedBoard [data-bfld="ff:2.0.${i}.to"]`) || {}).value, ld: (document.querySelector(`#schedBoard [data-bfld="ff:2.0.${i}.ld"]`) || {}).value, cs: (document.querySelector(`#schedBoard [data-bfld="ff:2.0.${i}.cs"]`) || {}).value }), nfIdx)
console.log('new line boxes', JSON.stringify(toLd))
// replace the first reporting line with an unnamed one
const itBefore = await S.intimes(p, DI, 0)
await S.setItLine(p, DI, 0, 0, '08:00H: IN TIME + WX/NOTAMS')
const itAfter = await S.intimes(p, DI, 0)
console.log('reporting lines', JSON.stringify(itBefore), '->', JSON.stringify(itAfter))
const cpic = await K.pic(p, 'S3-2-untimed-line')
const b2 = await read('2-untimed-line')
// now the times
await W.boardText(p, `ff:${DI}.0.${nfIdx}.to`, '11:00')
await W.boardText(p, `ff:${DI}.0.${nfIdx}.ld`, '12:00')
const dpic = await K.pic(p, 'S3-3-timed-line')
const b3 = await read('3-timed-line')
const debrief = await p.evaluate(() => window.VCONF.debrief)
const wr = await p.evaluate(() => (window.WARN.byDay[2] || {}).warns.map(w => w.code + ': ' + String(w.msg).slice(0, 80)).filter(t => /REPORT|WORK|LONG|NaN/i.test(t)))
const num = s => { const m = /(-?\d+(?:\.\d+)?)\s*h(?:\s*(\d+))?/i.exec(s || ''); return m ? +m[1] + (m[2] ? +m[2] / 60 : 0) : (s == null ? null : NaN) }
console.log('figures', b0.fig, b1.fig, b2.fig, b3.fig, 'debrief', debrief, 'warns', wr)
const same12 = b1.fig === b2.fig
const nanAny = b0.nan || b1.nan || b2.nan || b3.nan
const groundUp = b0.fig !== b1.fig
K.note('S-3', 'run', `pilot ${cs} (no work on Wed 15 Jul; Work hours figure before: ${b0.fig === undefined ? 'absent from list' : b0.fig}); Board Wed: ground row 13:00–14:00 ${cs} on it; first flying wave: + Line, take-off/landing empty, ${cs} front seat (seated: ${hp2.took}); first reporting line replaced with "08:00H: IN TIME + WX/NOTAMS" (before: ${JSON.stringify(itBefore)}, now ${JSON.stringify(itAfter)}); then take-off 11:00, landing 12:00`,
  `Work hours (whole-week figure) for ${cs}: base ${b0.fig === undefined ? '(not listed)' : b0.fig}; after ground row ${b1.fig}; after untimed line + 08:00 reporting line ${b2.fig}; after 11:00/12:00 typed ${b3.fig}. Per-day tooltips: base "${b0.tip}", ground "${b1.tip}", untimed "${b2.tip}", timed "${b3.tip}". NaN seen anywhere: ${nanAny}. Debrief time in Logic ${debrief}. Day's reporting/work warnings now: ${JSON.stringify(wr)}`,
  (!groundUp ? 'PARTIAL (ground row did not move the figure)' : (same12 && !nanAny && b3.fig !== b2.fig ? 'PASS' : 'FAIL')), [b0.pic, gpic, b1.pic, cpic, b2.pic, dpic, b3.pic])
console.log('errors', K.errList(errors))
K.flush()
await browser.close()
