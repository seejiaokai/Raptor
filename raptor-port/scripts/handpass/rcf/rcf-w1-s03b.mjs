/* rcf-w1 S03 step B: (1) control — does an ordinary desk man's puck ring on a clash? (2) explicit switch-off AFTER the wave flies, un-fly, re-fly;
   (3) publish a flying AVALON case and read the Leave War credit. usage: node rcf-w1-s03b.mjs [desktop|phone] */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
const KIND = process.argv[2] || 'desktop'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w1/s03b-' + KIND + '-r1')
console.log('rcf-w1-s03b v1', KIND)
const X = await import('./rcf-w1-lib.mjs')
const { L, check, note, norm, sleep, RESULTS } = X
const w = await X.world(KIND)
const { page } = w
const P = w.phone ? 'p' : 'd'
const SAT = 5, ISO = X.ISO[SAT]
const ranger = w.ID('Ranger'), comet = w.ID('Comet')
const pucks = () => page.evaluate(() => {
  const out = []
  for (const [root, sc] of [['board', '#schedBoard'], ['week', '#eWeek .day[data-day="5"]']]) {
    const s = document.querySelector(sc); if (!s) continue
    s.querySelectorAll('.puck[data-person="bane"]').forEach(p => { if (p.offsetWidth) out.push(root + '/' + (p.closest('.sb-panel.duty, .sec-duty, [class*="duty"]') ? 'desk' : 'other') + ' :: ' + String(p.className).replace(/\s+/g, ' ')) })
  }
  return out
})
const oilMode = () => page.evaluate(() => window.OILDAY != null)
const oilToggle = async () => {
  const b = page.locator('#schedBoard #sbOil:visible, #schedBoard [data-oilmode]:visible').first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  if (w.phone) await b.tap(); else await b.click(); await sleep(800)
}
const oilRead = () => page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.duty .seat.oilpk, #schedBoard .sb-panel.duty .oilitem')].filter(e => e.offsetWidth).map(e => e.innerText.replace(/\s+/g, ' ').trim() + ' [' + (/\bon\b/.test(e.className) ? 'on' : /\boff\b/.test(e.className) ? 'off' : /oilitem/.test(e.className) ? 'item' : e.className) + ']').filter(t => /Ranger|SXO/.test(t)))

/* (1) control: the ordinary SDO desk and a sortie */
await L.board(page, SAT)
console.log('duty blocks', await page.evaluate(() => JSON.stringify(window.DAYS[5].dutywaves.map(b => ({ l: b.label, rows: b.rows.map(r => r.role + '|' + r.str + '-' + r.end + '|' + r.id) })))))
const gF = await X.addWave(w, SAT, '')
await X.typeIn(w, `[data-bfld="ff:5.${gF}.0.to"]`, '09:00'); await X.typeIn(w, `[data-bfld="ff:5.${gF}.0.ld"]`, '10:00')
console.log('seat sortie', await X.seatPhoneAware(w, `[data-slot="5.${gF}.0.0.p"]`, ranger))
let r = await X.seatPhoneAware(w, `[data-fill="d:5.0.0.+"]`, ranger).catch(e => 'ERR ' + e.message.slice(0, 80))
console.log('seat standard desk (appended row)', r)
console.log('duty after', await page.evaluate(() => JSON.stringify(window.DAYS[5].dutywaves.map(b => b.rows.map(r => r.role + '|' + r.str + '-' + r.end + '|' + r.id)))))
let bw = await X.boardWarn(page, w)
console.log('control warn', JSON.stringify(bw.items.filter(t => /Ranger/.test(t))))
const cp = await pucks(); console.log('control pucks', JSON.stringify(cp))
await X.pic(page, `s03b-control-board-${P}`)
note('S03.ctl RECORD control: ordinary desk man + overlapping sortie — pucks', JSON.stringify(cp))
await w.browser.close()
writeFileSync(process.env.HP_SHOTS + '/results.json', JSON.stringify(RESULTS, null, 1))

/* (2)+(3) in a fresh world */
const w2 = await X.world(KIND)
const pg = w2.page
w.page = pg
Object.assign(w, w2)
const pg2 = w2.page
await L.board(pg2, SAT)
const gA = await X.addWave(w2, SAT, 'avalon')
await X.press(w2, '[data-dwadd="5"]')
await X.press(w2, '.wavemenu [data-blktpl="avalon"]', { scope: 'page' }); await sleep(600)
const wi = await pg2.evaluate(() => window.DAYS[5].dutywaves.findIndex(b => b.sa === 'avalon'))
await X.seatPhoneAware(w2, `[data-fill="d:5.${wi}.0.+"]`, ranger)
await X.seatPhoneAware(w2, `[data-slot="5.${gA}.0.0.p"]`, comet)
const rd = async (tag) => {
  if (!(await pg2.evaluate(() => [...document.querySelectorAll('#schedBoard .seat.oilpk, #schedBoard .oilitem')].some(e => e.offsetWidth)))) { const b = pg2.locator('#schedBoard #sbOil:visible, #schedBoard [data-oilmode]:visible').first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150); if (w2.phone) await b.tap(); else await b.click(); await sleep(800) }
  const st = await pg2.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.duty .seat.oilpk')].filter(e => e.offsetWidth).map(e => e.innerText.replace(/\s+/g, ' ').trim() + ' [' + (/\bon\b/.test(e.className) ? 'on' : /\boff\b/.test(e.className) ? 'off' : e.className) + ']').filter(t => /Ranger/.test(t)))
  await X.pic(pg2, `s03b-oil-${tag}-${P}`)
  console.log(`[oil ${tag}]`, JSON.stringify(st)); return st
}
const closeOil = async () => { if (await pg2.evaluate(() => [...document.querySelectorAll('#schedBoard .seat.oilpk, #schedBoard .oilitem')].some(e => e.offsetWidth))) { const b = pg2.locator('#schedBoard #sbOil:visible, #schedBoard [data-oilmode]:visible').first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); if (w2.phone) await b.tap(); else await b.click(); await sleep(800) } }
const tapDesk = async () => { const s = pg2.locator('#schedBoard .sb-panel.duty .seat.oilpk:has-text("Ranger")').first(); await s.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(120); if (w2.phone) await s.tap(); else await s.click(); await sleep(700) }
await X.typeIn(w2, `[data-bfld="ff:5.${gA}.0.rl"]`, '18:00')       // flies
let s = await rd('fly-default'); note('S13.2 desk man once the wave flies by R (default)', JSON.stringify(s))
await tapDesk(); s = await rd('fly-switched-off'); note('S13.2 then switched OFF by hand in OIL Earn', JSON.stringify(s))
await closeOil()
await X.typeIn(w2, `[data-bfld="ff:5.${gA}.0.rl"]`, '')            // stops flying
await X.typeIn(w2, `[data-bfld="ff:5.${gA}.0.rl"]`, '18:00')       // flies again
s = await rd('refly'); note('S13.3 RECORD: after switching off by hand, un-flying and re-flying — does he stay off', JSON.stringify(s))
check('S13.3 explicit off survives the wave flying again (D1997: activation changes the default, not an explicit refusal)', s.some(t => /\[off\]/.test(t)), JSON.stringify(s))
await closeOil()
/* publish the flying case, read the Leave War credit (put him back on first so the credit is meaningful) */
await tapDesk().catch(() => 0)
await pg2.screenshot({ path: process.env.HP_SHOTS + '/_dbg.png' }).catch(() => 0)
const sp = await X.signAndPublish(w2, SAT)
check('S03.p Saturday published with the flying AVALON wave', sp.p.pressed, JSON.stringify(sp.p) + ' tag ' + (sp.h && sp.h.tag))
await L.closeBoard(pg2)
const r0 = await X.lwBox(w2, ranger, ISO); const ro = await X.lwOil(w2, ranger, ISO, `s03b-war-ranger-${P}`)
const c0 = await X.lwBox(w2, comet, ISO); const co = await X.lwOil(w2, comet, ISO)
note('S03.p Leave War credit — Ranger (desk man, state as left at publish)', `box "${r0.box}" OIL ${JSON.stringify(ro)}`)
note('S03.p Leave War credit — Comet (AVALON MAIN)', `box "${c0.box}" OIL ${JSON.stringify(co)}`)
await X.pic(pg2, `s03b-war-${P}`)
note('console errors', JSON.stringify(w2.errors.slice(0, 6)))
writeFileSync(process.env.HP_SHOTS + '/results.json', JSON.stringify(RESULTS, null, 1))
console.log('=== ' + RESULTS.filter(r => r.ok === true).length + ' PASS ' + RESULTS.filter(r => r.ok === false).length + ' FAIL')
RESULTS.filter(r => r.ok === false).forEach(r => console.log('  FAIL', r.id, r.detail))
await w2.browser.close()
