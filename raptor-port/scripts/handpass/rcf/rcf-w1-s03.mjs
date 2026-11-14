/* rcf-w1 S03 + S12 + S13 — a desk made from the AVALON template beside an AVALON wave (D1060, D24, D1997). usage: node rcf-w1-s03.mjs [desktop|phone] */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
const KIND = process.argv[2] || 'desktop'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w1/s03-' + KIND + '-r1')
console.log('rcf-w1-s03 v1', KIND, process.env.HP_SHOTS)
const X = await import('./rcf-w1-lib.mjs')
const { L, W4, check, note, norm, sleep, RESULTS } = X
const w = await X.world(KIND)
const { page } = w
const P = w.phone ? 'p' : 'd'
const SAT = 5, ISO = X.ISO[SAT]
const ranger = w.ID('Ranger'), comet = w.ID('Comet')

/* ---- the fixture ---- */
await L.board(page, SAT)
const gA = await X.addWave(w, SAT, 'avalon')                        // wave 0: AVALON (19:00 -> 07:00)
await X.press(w, '[data-dwadd="5"]')
await X.press(w, '.wavemenu [data-blktpl="avalon"]', { scope: 'page' }); await sleep(600)
const wi = await page.evaluate(() => window.DAYS[5].dutywaves.findIndex(b => b.sa === 'avalon'))
console.log('seat desk', await X.seatPhoneAware(w, `[data-fill="d:5.${wi}.0.+"]`, ranger))
console.log('seat AVALON MAIN', await X.seatPhoneAware(w, `[data-slot="5.${gA}.0.0.p"]`, comet))
const gF = await X.addWave(w, SAT, '')
await X.typeIn(w, `[data-bfld="ff:5.${gF}.0.cs"]`, 'VIPER')
await X.typeIn(w, `[data-bfld="ff:5.${gF}.0.to"]`, '20:00')
await X.typeIn(w, `[data-bfld="ff:5.${gF}.0.ld"]`, '21:00')
console.log('seat sortie', await X.seatPhoneAware(w, `[data-slot="5.${gF}.0.0.p"]`, ranger))
const fx = await page.evaluate(([a, f, i]) => JSON.stringify({ av: window.DAYS[5].waves[a].formations[0].to + '-' + window.DAYS[5].waves[a].formations[0].ld + ' ' + window.DAYS[5].waves[a].formations[0].aircraft[0].p, desk: window.DAYS[5].dutywaves[i].rows.map(r => r.role + '|' + r.str + '-' + r.end + '|' + r.id), sortie: window.DAYS[5].waves[f].formations[0].to + '-' + window.DAYS[5].waves[f].formations[0].ld + ' ' + window.DAYS[5].waves[f].formations[0].aircraft[0].p }), [gA, gF, wi])
check('S03.0 fixture: AVALON wave, AVALON-template desk with Ranger, Ranger on a 20:00-21:00 sortie in another wave', /"desk":\["SXO\|19:00-07:00\|bane"/.test(fx) && /"sortie":"20:00-21:00 bane"/.test(fx), fx)

/* ---- readers ---- */
const clashWords = items => items.filter(t => /Ranger/.test(t) && /(already|clash|double|overlap|same time|two things)/i.test(t))
const deskPuck = () => page.evaluate(([i]) => {
  const out = []
  for (const root of ['#schedBoard', '#eWeek']) {
    const scope = root === '#eWeek' ? document.querySelector('#eWeek .day[data-day="5"]') : document.querySelector('#schedBoard')
    if (!scope) continue
    scope.querySelectorAll('.puck[data-person="bane"]').forEach(p => {
      if (!p.offsetWidth) return
      const where = p.closest('.sb-panel.duty, .sec-duty, [class*="duty"]') ? 'desk' : p.closest('.sb-panel') ? (p.closest('.sb-panel').className.replace('sb-panel', '').trim() || 'panel') : 'other'
      out.push(root + '/' + where + ' :: ' + String(p.className).replace(/\s+/g, ' '))
    })
  }
  return out
}, [wi])
const oilMode = () => page.evaluate(() => window.OILDAY != null)
const oilToggle = async (tag) => {
  const b = page.locator('#schedBoard #sbOil:visible, #schedBoard [data-oilmode]:visible').first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  if (w.phone) await b.tap(); else await b.click()
  if (tag) { await sleep(60); await page.screenshot({ path: `${process.env.HP_SHOTS}/${tag}-tap.png` }) }
  await sleep(800)
}
const oilRead = async () => page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.duty .seat.oilpk, #schedBoard .sb-panel.duty .oilitem')].filter(e => e.offsetWidth).map(e => e.innerText.replace(/\s+/g, ' ').trim() + ' [' + (/inert/.test(e.className) ? 'inert' : /oilpk/.test(e.className) ? (/\bon\b/.test(e.className) ? 'on' : /\boff\b/.test(e.className) ? 'off' : e.className) : (/\bon\b/.test(e.className) ? 'item-on' : /\boff\b/.test(e.className) ? 'item-off' : e.className)) + ']'))
const oilState = async (tag, { keepOpen = false } = {}) => {
  if (!(await oilMode())) await oilToggle('oil-open-' + tag + '-' + P)
  const st = await oilRead()
  await X.pic(page, 'oil-' + tag + '-' + P)
  if (!keepOpen) await oilToggle()
  return st
}
const state = async (tag) => {
  if (await oilMode()) await oilToggle()
  const bw = await X.boardWarn(page, w)
  const pk = await deskPuck()
  const od = await oilState(tag)
  console.log(`[${tag}]\n   warn: ${JSON.stringify(bw.items)}\n   Ranger pucks: ${JSON.stringify(pk)}\n   OIL desk: ${JSON.stringify(od)}`)
  return { bw, pk, od }
}
const weekRing = async () => {
  await L.closeBoard(page); await L.go(page, 'editsched'); await sleep(400)
  const pk = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="5"] .puck[data-person="bane"]')].filter(p => p.offsetWidth).map(p => (p.closest('.sec-duty, [class*="duty"]') ? 'desk' : 'other') + ' :: ' + String(p.className).replace(/\s+/g, ' ')))
  const d = page.locator('#eWeek .day[data-day="5"]').first()
  console.log('   week pucks:', JSON.stringify(pk))
  await L.board(page, SAT)
  return pk
}

/* ---- S03: before the wave flies ---- */
let s = await state('0-standby')
check('S03.1 before the wave flies: no clash on the desk (exempt, D1060)', clashWords(s.bw.items).length === 0 && !s.pk.some(p => /desk/.test(p) && /boxred/.test(p)), `clash lines ${JSON.stringify(clashWords(s.bw.items))}; desk puck ${JSON.stringify(s.pk.filter(p => /desk/.test(p)))}`)
check('S03.1 before the wave flies: OIL Earn shows the desk man off by default, with a switch', s.od.some(m => /Ranger/.test(m) && /\[off\]/.test(m)), JSON.stringify(s.od))
await X.pic(page, `s03-0-warn-${P}`, '#schedBoard #sbWarn')
const wk0 = await weekRing()

/* ---- S13: switched off by hand BEFORE the wave flies; then fly it ---- */
await oilToggle()
const deskSeat = page.locator('#schedBoard .sb-panel.duty .seat.oilpk:has-text("Ranger")').first()
const tapSeat = async () => { await deskSeat.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(120); if (w.phone) await deskSeat.tap(); else await deskSeat.click(); await sleep(700) }
await tapSeat(); const on1 = await oilRead()
await tapSeat(); const off2 = await oilRead()
note('S13.0 tapping the desk man: first tap, second tap', `${JSON.stringify(on1.filter(m => /Ranger/.test(m)))} -> ${JSON.stringify(off2.filter(m => /Ranger/.test(m)))}`)
await X.pic(page, `s13-0-switched-off-${P}`)
await oilToggle()

/* ---- S03: the wave flies: R typed ---- */
await X.typeIn(w, `[data-bfld="ff:5.${gA}.0.rl"]`, '18:00')
s = await state('1-fly-by-R')
check('S03.2 AVALON R typed: the desk is fully checked — the clash shows in the warning list (D1997)', clashWords(s.bw.items).length >= 1, JSON.stringify(s.bw.items))
check('S03.2 the desk man\'s puck wears the red clash ring on the board (D1997)', s.pk.filter(p => /^#schedBoard\/desk/.test(p)).some(p => /boxred/.test(p)), JSON.stringify(s.pk.filter(p => /^#schedBoard/.test(p))))
await X.pic(page, `s03-2-warn-${P}`, '#schedBoard #sbWarn')
const wk1 = await weekRing()
check('S03.2 and on the week (D1997)', wk1.some(p => /desk/.test(p) && /boxred/.test(p)), JSON.stringify(wk1))
note('S13.1 RECORD: the man switched off by hand before the wave flew — after it flies, in OIL Earn', JSON.stringify(s.od.filter(m => /Ranger/.test(m))))
await X.pic(page, `s03-2-board-${P}`)

/* ---- reverse: switch him on by hand now (explicit), clear R, check state; tick Flies by hand instead ---- */
await X.typeIn(w, `[data-bfld="ff:5.${gA}.0.rl"]`, '')
s = await state('2-R-cleared')
check('S03.3 R cleared: the desk is exempt again — no clash, no red ring', clashWords(s.bw.items).length === 0 && !s.pk.some(p => /^#schedBoard\/desk/.test(p) && /boxred/.test(p)), `${JSON.stringify(clashWords(s.bw.items))} ${JSON.stringify(s.pk.filter(p => /^#schedBoard/.test(p)))}`)
const flies = page.locator(`#schedBoard [data-safly="5.${gA}.0.0"]:visible`).first()
note('S03.4 the Flies button on the AVALON MAIN row', (await flies.count()) ? 'present: ' + norm(await flies.innerText()) : 'ABSENT')
if (await flies.count()) {
  await X.press(w, `[data-safly="5.${gA}.0.0"]`, { after: `s03-4-flies-tap-${P}` })
  s = await state('3-fly-by-tick')
  check('S03.4 one row\'s Flies ticked (the wave flies by hand): desk fully checked — the clash shows (D1997)', clashWords(s.bw.items).length >= 1, JSON.stringify(s.bw.items))
  check('S03.4 the desk man\'s puck wears the red clash ring on the board', s.pk.filter(p => /^#schedBoard\/desk/.test(p)).some(p => /boxred/.test(p)), JSON.stringify(s.pk.filter(p => /^#schedBoard/.test(p))))
  const wk2 = await weekRing()
  check('S03.4 and on the week', wk2.some(p => /desk/.test(p) && /boxred/.test(p)), JSON.stringify(wk2))
  note('S03.4 OIL Earn for the desk man once the tick flies it', JSON.stringify(s.od.filter(m => /Ranger/.test(m))))
}
note('console errors', JSON.stringify(w.errors.slice(0, 6)))
writeFileSync(process.env.HP_SHOTS + '/results.json', JSON.stringify(RESULTS, null, 1))
console.log('=== ' + RESULTS.filter(r => r.ok === true).length + ' PASS ' + RESULTS.filter(r => r.ok === false).length + ' FAIL')
RESULTS.filter(r => r.ok === false).forEach(r => console.log('  FAIL', r.id, r.detail))
await w.browser.close()
