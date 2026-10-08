/* P2-05 — preset name, kind and short form remain distinct (D643-D645). */
import * as B from './cal-B-lib.mjs'
const size = process.argv[2] || 'desk'
const w = await B.world(size)
const p = w.page, S = w.key
const pics = [], log = []
const note = (k, v) => { log.push(`${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`); console.log('  >', k, typeof v === 'string' ? v : JSON.stringify(v)) }
const D = '2026-02-03'
const ev = iso => B.tid(w, `event-0-${iso}`)
const sheetState = () => p.evaluate(() => {
  const s = document.querySelector('[data-testid="event-sheet"]'); if (!s) return null
  const chips = [...s.querySelectorAll('[data-testid^="event-quick-"], [data-testid="event-other"]')].map(b => ({ t: b.innerText.trim(), on: b.getAttribute('aria-pressed') === 'true', kind: (b.className.match(/\b(ph|off|nolv|work|note|other)\b/) || [])[1] || '' }))
  const kinds = [...s.querySelectorAll('[data-testid^="event-tag-"]')].map(b => ({ t: b.innerText.trim(), on: b.getAttribute('aria-pressed') === 'true' }))
  const q = id => s.querySelector(`[data-testid="${id}"]`)
  return { chips, kinds, kindRow: !!q('event-kindrow'), readout: (q('event-readout') || {}).innerText || '', name: q('event-text').value, namePh: q('event-text').placeholder, short: q('event-short').value, shortPh: q('event-short').placeholder, problem: (q('event-problem') || {}).innerText || '' }
})
const brief = st => st ? `on=[${st.chips.filter(c => c.on).map(c => c.t).join('|')}] kindRow=${st.kindRow} kinds-on=[${st.kinds.filter(k => k.on).map(k => k.t).join('|')}] readout="${st.readout}" name="${st.name}" ph="${st.namePh}" short="${st.short}" shortPh="${st.shortPh}" problem="${st.problem}"` : '(no sheet)'
const openCell = async iso => { await B.reveal(w, iso, 'event-0'); await B.press(w, ev(iso)); await B.sleep(350) }
await B.press(w, B.tid(w, 'month-FEB')); await B.sleep(700)
await B.reveal(w, D, 'event-0')
await openCell(D)
let st = await sheetState()
note('A opened empty cell', brief(st))
note('presets', st.chips.map(c => `${c.t}(${c.kind})`).join(', '))
pics.push(await B.pic(p, `P2-05-${S}-1-opened`))
const nPresets = st.chips.length - 1
/* B. each preset in turn */
const presetRes = []
for (let i = 0; i < nPresets; i++) {
  await B.press(w, B.tid(w, `event-quick-${i}`)); await B.sleep(200)
  const s = await sheetState()
  presetRes.push(`#${i} ${s.chips[i].t}: ${brief(s)}`)
  if (['PH', 'Off', 'No leave', 'SC'].some(n => new RegExp('^' + n, 'i').test(s.chips[i].t))) pics.push(await B.pic(p, `P2-05-${S}-2-preset-${i}`))
}
note('B each preset', presetRes.join('\n     '))
/* C. a custom name */
await B.tid(w, 'event-text').fill('Range closure')
await B.sleep(200)
st = await sheetState(); note('C custom name "Range closure"', brief(st))
await B.press(w, B.tid(w, 'event-other')); await B.sleep(200)
st = await sheetState(); note('D pressed Other…', brief(st) + ' kinds=' + st.kinds.map(k => k.t).join('/'))
pics.push(await B.pic(p, `P2-05-${S}-3-other-kindrow`))
/* a name that equals a preset under Other lights the preset */
await B.tid(w, 'event-text').fill('PH'); await B.sleep(200)
st = await sheetState(); note('D2 name "PH" typed while on Other', brief(st))
await B.tid(w, 'event-text').fill('Off day'); await B.sleep(200)
st = await sheetState(); note('D3 name "Off day" typed', brief(st))
await B.tid(w, 'event-text').fill('Range closure'); await B.sleep(200)
await B.press(w, B.tid(w, 'event-other')); await B.sleep(200)
note('D4 back on Other with custom name', brief(await sheetState()))
/* E. short forms: type each, then try to Save, read the problem; the grid after */
const shorts = ['ab', 'a b', 'ABCDEF', ' x', 'A-B', '!!', '12', 'é']
for (const s of shorts) {
  await B.tid(w, 'event-short').fill(s); await B.sleep(120)
  const typed = await B.tid(w, 'event-short').inputValue()
  await B.press(w, B.tid(w, 'event-apply')); await B.sleep(350)
  const still = (await B.tid(w, 'event-sheet').count()) > 0
  const stt = still ? await sheetState() : null
  const gridTxt = await B.txt(ev(D))
  note(`E typed "${s}"`, `box shows "${typed}"; Save -> ${still ? 'REFUSED, sheet open, problem="' + (stt?.problem || '') + '"' : 'saved'}; grid cell prints "${gridTxt}"`)
  if (!still) {
    pics.push(await B.pic(p, `P2-05-${S}-4-saved-${s.replace(/[^A-Za-z0-9]/g, '_')}`))
    /* peek then edit: full name & kind on opening */
    await B.press(w, ev(D)); await B.sleep(300)
    const peek = await B.txt(B.tid(w, 'event-peek')); const pk = await B.txt(B.tid(w, 'event-peek-kind'))
    note(`E peek of "${s}"`, `${peek} | kind ${pk}`)
    await B.press(w, B.tid(w, 'event-peek-edit')); await B.sleep(300)
    note(`E reopened "${s}"`, brief(await sheetState()))
    /* reuse the open sheet for the next try */
  } else { /* leave the sheet open */ }
}
/* tidy: close if open */
if ((await B.tid(w, 'event-sheet').count()) > 0) { await B.press(w, B.tid(w, 'event-cancel')); await B.sleep(250) }
/* F. a preset with a typed short form override remains intentional: PH + "XY" */
const D2 = '2026-02-04'
await openCell(D2)
await B.press(w, B.tid(w, 'event-quick-0')); await B.sleep(150)
const firstPresetName = (await sheetState()).chips[0].t
await B.tid(w, 'event-short').fill('xy'); await B.sleep(100)
await B.press(w, B.tid(w, 'event-apply')); await B.sleep(350)
note(`F preset "${firstPresetName}" with short typed xy: grid`, await B.txt(ev(D2)))
await B.press(w, ev(D2)); await B.sleep(300)
note('F peek', await B.txt(B.tid(w, 'event-peek')) + ' | kind ' + await B.txt(B.tid(w, 'event-peek-kind')))
await B.press(w, B.tid(w, 'event-peek-edit')); await B.sleep(300)
note('F reopened', brief(await sheetState()))
pics.push(await B.pic(p, `P2-05-${S}-5-preset-with-typed-short`))
await B.press(w, B.tid(w, 'event-cancel')); await B.sleep(250)
/* G. a custom named event, a preset-following event */
console.log('\nLOG\n' + log.join('\n'))
B.row('P2-05-raw', S, 'Empty Event cell opened; each preset; custom name; Other + Kind; short forms typed (lower-case, spaces, over-long, marks); saved; peek; reopened', log.join(' || '), 'RAW', pics)
B.noteErrors('p205-' + S, w.errors)
await B.close(w)
