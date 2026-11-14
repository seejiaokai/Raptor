/* rcf-w1 S14 + S15 — an SC shift on Saturday START=END=08:00, MAIN and SPARE seated (D1999). usage: node rcf-w1-s14.mjs [desktop|phone] */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
const KIND = process.argv[2] || 'desktop'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w1/s14-' + KIND + '-r1')
console.log('rcf-w1-s14 v1', KIND, process.env.HP_SHOTS)
const X = await import('./rcf-w1-lib.mjs')
const { L, W4, check, note, norm, sleep, RESULTS } = X
const w = await X.world(KIND)
const { page } = w
const P = w.phone ? 'p' : 'd'
const SAT = 5, ISO = X.ISO[SAT]
const ranger = w.ID('Ranger'), comet = w.ID('Comet')
const TAIL = /one of the two is wrong; the shift still earns from its R or B$/
await L.board(page, SAT)
const gi = await X.addWave(w, SAT, 'sc')
await X.typeIn(w, `[data-bfld="ff:5.${gi}.0.to"]`, '08:00')
await X.typeIn(w, `[data-bfld="ff:5.${gi}.0.ld"]`, '08:00')
console.log('seat MAIN', await X.seatPhoneAware(w, `[data-slot="5.${gi}.0.0.p"]`, ranger))
console.log('seat SPARE', await X.seatPhoneAware(w, `[data-slot="5.${gi}.0.2.p"]`, comet))
const fx = await page.evaluate(g => { const x = window.DAYS[5].waves[g].formations[0]; return x.to + '|' + x.ld + '|' + x.aircraft.map(a => a.role + ':' + a.p).join(',') }, gi)
check('S14.0 fixture: SC shift 08:00-08:00, Ranger MAIN, Comet SPARE', /^08:00\|08:00\|MAIN:bane,MAIN:,SPARE:beams,SPARE:$/.test(fx), fx)

const oilToggle = async (tag) => {
  const b = page.locator('#schedBoard #sbOil:visible, #schedBoard [data-oilmode]:visible').first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  if (w.phone) await b.tap(); else await b.click()
  if (tag) { await sleep(60); await page.screenshot({ path: `${process.env.HP_SHOTS}/${tag}-tap.png` }) }
  await sleep(800)
}
const oilMode = () => page.evaluate(() => window.OILDAY != null)
const oilState = async (tag) => {
  if (!(await oilMode())) await oilToggle('oil-open-' + tag + '-' + P)
  const st = await page.evaluate(() => ({
    men: [...document.querySelectorAll('#schedBoard .seat.oilpk')].filter(e => e.offsetWidth).map(e => e.innerText.replace(/\s+/g, ' ').trim() + ' [' + (/inert/.test(e.className) ? 'inert' : /\bon\b/.test(e.className) ? 'on' : /\boff\b/.test(e.className) ? 'off' : e.className) + ']'),
    bar: (document.querySelector('#schedBoard .daybar') || {}).innerText || '',
  }))
  await X.pic(page, 'oil-' + tag + '-' + P)
  await oilToggle()
  return st
}
const warnNote = async () => {
  const bw = await X.boardWarn(page, w)
  return bw.items.filter(t => /takes off and lands at the same time/.test(t)).map(t => t.replace(/ ✕$/, ''))
}
const titleOf = () => page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld="ff:5.0.0.to"]')].filter(e => e.offsetWidth).map(e => e.className + ' | ' + e.title)[0] || 'NO BOX')

/* ---- (c) nothing typed ---- */
let n = await warnNote(); let st = await oilState('c')
note('S15.c RECORD: the same-time note with nothing typed (not flying)', JSON.stringify(n))
note('S15.c RECORD: the shift box title', await titleOf())
check('S15.c nothing typed: the two earn nothing (inert in OIL Earn)', st.men.filter(m => /Ranger|Comet/.test(m)).every(m => /inert/.test(m)) && st.men.some(m => /Ranger/.test(m)), JSON.stringify(st.men))
await X.pic(page, `s15-c-warn-${P}`, '#schedBoard #sbWarn')

/* ---- (a) R 06:00 ---- */
await X.typeIn(w, `[data-bfld="ff:5.${gi}.0.rl"]`, '06:00')
n = await warnNote(); st = await oilState('a')
check('S14.a R 06:00: the same-time note ends with the new words (D1999)', n.length >= 1 && n.every(t => TAIL.test(t)), JSON.stringify(n))
check('S14.a each man (MAIN and SPARE) earns: on, two hours an HO', st.men.filter(m => /Ranger|Comet/.test(m)).length === 2 && st.men.filter(m => /Ranger|Comet/.test(m)).every(m => /\[on\]/.test(m) && /HO/.test(m)), JSON.stringify(st.men))
note('S14.a the shift box title', await titleOf())
await X.pic(page, `s14-a-warn-${P}`, '#schedBoard #sbWarn')

/* ---- (b) B 06:00 alone ---- */
await X.typeIn(w, `[data-bfld="ff:5.${gi}.0.rl"]`, '')
await X.typeIn(w, `[data-bfld="ff:5.${gi}.0.br"]`, '06:00')
const f2 = await page.evaluate(g => { const x = window.DAYS[5].waves[g].formations[0]; return `rl=${x.rl} br=${x.br}` }, gi)
n = await warnNote(); st = await oilState('b')
check('S14.b B 06:00 alone (R cleared: ' + f2 + '): the note ends with the new words', n.length >= 1 && n.every(t => TAIL.test(t)), JSON.stringify(n))
check('S14.b each man earns: on, two hours an HO', st.men.filter(m => /Ranger|Comet/.test(m)).length === 2 && st.men.filter(m => /Ranger|Comet/.test(m)).every(m => /\[on\]/.test(m) && /HO/.test(m)), JSON.stringify(st.men))
await X.pic(page, `s14-b-warn-${P}`, '#schedBoard #sbWarn')

/* ---- back to (a) and publish ---- */
await X.typeIn(w, `[data-bfld="ff:5.${gi}.0.br"]`, '')
await X.typeIn(w, `[data-bfld="ff:5.${gi}.0.rl"]`, '06:00')
const sp = await X.signAndPublish(w, SAT)
check('S14.p Saturday published with R 06:00', sp.p.pressed && /ORIG/.test(sp.h.tag), `tag "${sp.h.tag}" ${JSON.stringify(sp.p)}`)
await L.closeBoard(page)
const r0 = await X.lwBox(w, ranger, ISO); const ro = await X.lwOil(w, ranger, ISO, `s14-war-ranger-${P}`)
const c0 = await X.lwBox(w, comet, ISO); const co = await X.lwOil(w, comet, ISO)
check('S14.p the published shift credits Ranger (MAIN) and Comet (SPARE)', /FO|HO/.test(r0.box) && /FO|HO/.test(c0.box), `Ranger box "${r0.box}" OIL ${JSON.stringify(ro)}; Comet box "${c0.box}" OIL ${JSON.stringify(co)}`)
await X.pic(page, `s14-war-${P}`)
note('console errors', JSON.stringify(w.errors.slice(0, 6)))
writeFileSync(process.env.HP_SHOTS + '/results.json', JSON.stringify(RESULTS, null, 1))
console.log('=== ' + RESULTS.filter(r => r.ok === true).length + ' PASS ' + RESULTS.filter(r => r.ok === false).length + ' FAIL')
RESULTS.filter(r => r.ok === false).forEach(r => console.log('  FAIL', r.id, r.detail))
await w.browser.close()
