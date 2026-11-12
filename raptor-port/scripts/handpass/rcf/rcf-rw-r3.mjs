/* rcf-rw-r3 — R3: the desk of a flying AVALON wave is fully checked (D1997). usage: node rcf-rw-r3.mjs [desktop|phone] */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
const KIND = process.argv[2] || 'desktop'
const RUN = process.env.RUN || 'r3-' + KIND + '-a'
process.env.HP_URL ||= 'http://localhost:4292'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/rewalk/' + RUN)
console.log('rcf-rw-r3 v1', KIND, process.env.HP_SHOTS)
const X = await import('./rcf-w1-lib.mjs')
const { L, check, note, norm, sleep, RESULTS } = X
const w = await X.world(KIND)
const { page } = w
console.log('BUNDLE', await page.evaluate(() => [...document.scripts].map(s => s.src).filter(s => /index-/.test(s)).join(',')))
const P = w.phone ? 'p' : 'd'
const SAT = 5
const ranger = w.ID('Ranger'), comet = w.ID('Comet')

/* ---- fixture ---- */
await L.board(page, SAT)
const gA = await X.addWave(w, SAT, 'avalon')
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
check('R3.0 fixture: AVALON wave, AVALON-template desk with Ranger (SXO 19:00-07:00), Ranger on a 20:00-21:00 sortie', /"desk":\["SXO\|19:00-07:00\|bane"/.test(fx) && /"sortie":"20:00-21:00 bane"/.test(fx), fx)

/* ---- readers ---- */
const clashWords = items => items.filter(t => /Ranger/.test(t) && /(already|clash|double|overlap|same time|two things)/i.test(t))
const pucks = (root) => page.evaluate((root) => {
  const scope = root === '#eWeek' ? document.querySelector('#eWeek .day[data-day="5"]') : document.querySelector('#schedBoard')
  if (!scope) return ['NO SCOPE ' + root]
  return [...scope.querySelectorAll('.puck[data-person="bane"]')].filter(p => p.offsetWidth && !p.closest('#sbRoster') && !p.closest('#eRoster')).map(p => {
    const where = p.closest('.sb-panel.duty, .sec-duty, [class*="duty"]') ? 'desk' : (p.closest('[data-slot]') || {}).dataset ? 'seat ' + (p.closest('[data-slot]') || {}).dataset.slot : 'other'
    return root + '/' + where + ' :: ' + String(p.className).replace(/\s+/g, ' ')
  })
}, root)
const deskRed = arr => arr.filter(p => /\/desk ::/.test(p)).some(p => /boxred/.test(p))
const deskCls = arr => arr.filter(p => /\/desk ::/.test(p))
const oilRead = async () => page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.duty .seat.oilpk, #schedBoard .sb-panel.duty .oilitem')].filter(e => e.offsetWidth).map(e => e.innerText.replace(/\s+/g, ' ').trim() + ' [' + (/oilpk/.test(e.className) ? (/\bon\b/.test(e.className) ? 'on' : /\boff\b/.test(e.className) ? 'off' : e.className) : e.className) + ']'))
const deskPic = name => X.pic(page, name, '#schedBoard .sb-panel.duty', { pad: 6 })
const state = async (tag) => {
  const bw = await X.boardWarn(page, w)
  const pk = await pucks('#schedBoard')
  console.log(`[${tag}]\n   warn: ${JSON.stringify(bw.items)}\n   Ranger pucks (board): ${JSON.stringify(pk)}`)
  await X.pic(page, `r3-${tag}-warn-${P}`, '#schedBoard #sbWarn')
  await deskPic(`r3-${tag}-desk-${P}`)
  await page.screenshot({ path: `${process.env.HP_SHOTS}/r3-${tag}-board-${P}.png` })
  return { bw, pk }
}
const weekRing = async (tag) => {
  await L.closeBoard(page); await L.go(page, 'editsched'); await sleep(500)
  const pk = await pucks('#eWeek')
  /* picture: the desk puck's place on the week, scrolled into view, clipped around it (an element picture of the tall day is garbled by the sticky bars) */
  const dp = page.locator('#eWeek .day[data-day="5"] .puck[data-person="bane"]').last()
  await dp.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  await page.screenshot({ path: `${process.env.HP_SHOTS}/r3-${tag}-week-full-${P}.png` })
  const bb = await dp.boundingBox()
  if (bb) { const vp = page.viewportSize(); const x = Math.max(0, bb.x - 160), y = Math.max(0, bb.y - 120); await page.screenshot({ path: `${process.env.HP_SHOTS}/r3-${tag}-week-${P}.png`, clip: { x, y, width: Math.min(vp.width - x, 420), height: Math.min(vp.height - y, 240) } }) }
  console.log('   week desk puck box', JSON.stringify(bb))
  console.log('   week pucks:', JSON.stringify(pk))
  await L.board(page, SAT)
  return pk
}
/* the OIL mode off, so the board is read plain */

/* ---- 1. standing by ---- */
let s = await state('1-standby')
check('R3.1 standing by (no R): no clash line for Ranger, his desk puck plain', clashWords(s.bw.items).length === 0 && !deskRed(s.pk) && deskCls(s.pk).length >= 1, `clash lines ${JSON.stringify(clashWords(s.bw.items))}; desk pucks ${JSON.stringify(deskCls(s.pk))}`)

/* ---- 2. R typed ---- */
await X.typeIn(w, `[data-bfld="ff:5.${gA}.0.rl"]`, '18:00')
s = await state('2-R')
check('R3.2 AVALON R 18:00 typed: the clash line shows red in the list', clashWords(s.bw.items).length >= 1, JSON.stringify(clashWords(s.bw.items)))
const lineCls = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-warn .wln')].filter(e => e.offsetWidth).map(e => (e.querySelector('.wln-t') || e).innerText.replace(/\s+/g, ' ').trim().slice(0, 50) + ' => ' + (e.classList.contains('hard') ? 'RED' : e.classList.contains('adv') ? 'AMBER' : e.className)))
console.log('   line severities', JSON.stringify(lineCls))
check('R3.2 ...every Ranger clash line is red (read off the line class)', lineCls.filter(l => /Ranger/.test(l)).length >= 1 && lineCls.filter(l => /Ranger/.test(l) && /clash/.test(l)).every(l => /RED/.test(l)), JSON.stringify(lineCls))
check('R3.2 Ranger\'s puck ON THE DESK rings red on the board', deskRed(s.pk), JSON.stringify(deskCls(s.pk)) + ' | all ' + JSON.stringify(s.pk))
if (!w.phone) {
  const wk = await weekRing('2-R')
  check('R3.2 ...and on Edit Schedule\'s week', deskRed(wk), JSON.stringify(wk))
} else {
  /* the phone board: also read the picture of the desk puck right after */
  console.log('phone: step-2 picture taken above (r3-2-R-*-p)')
}

if (!w.phone) {
  /* ---- 3. clear R ---- */
  await X.typeIn(w, `[data-bfld="ff:5.${gA}.0.rl"]`, '')
  s = await state('3-R-cleared')
  check('R3.3 R cleared: back to plain — no clash line, desk puck plain', clashWords(s.bw.items).length === 0 && !deskRed(s.pk), `${JSON.stringify(clashWords(s.bw.items))} ${JSON.stringify(deskCls(s.pk))}`)
  /* ---- 4. fly by the FLIES tick ---- */
  const flies = page.locator(`#schedBoard [data-safly="5.${gA}.0.0"]:visible`).first()
  note('R3.4 the Flies button on the AVALON MAIN row', (await flies.count()) ? 'present: ' + norm(await flies.innerText()) : 'ABSENT')
  if (await flies.count()) {
    await X.press(w, `[data-safly="5.${gA}.0.0"]`, { after: `r3-4-flies-tap-${P}` })
    s = await state('4-flies')
    check('R3.4 one row\'s Flies ticked: the clash shows in the list', clashWords(s.bw.items).length >= 1, JSON.stringify(clashWords(s.bw.items)))
    check('R3.4 ...the desk puck rings red on the board', deskRed(s.pk), JSON.stringify(deskCls(s.pk)))
    const wk2 = await weekRing('4-flies')
    check('R3.4 ...and on the week', deskRed(wk2), JSON.stringify(wk2))
  } else check('R3.4 Flies tick', 'NOT WALKED', 'no Flies button')
}
note('console errors', JSON.stringify(w.errors.slice(0, 6)))
writeFileSync(process.env.HP_SHOTS + '/results.json', JSON.stringify(RESULTS, null, 1))
console.log('=== ' + RESULTS.filter(r => r.ok === true).length + ' PASS ' + RESULTS.filter(r => r.ok === false).length + ' FAIL')
RESULTS.filter(r => r.ok === false).forEach(r => console.log('  FAIL', r.id, r.detail))
await w.browser.close()
