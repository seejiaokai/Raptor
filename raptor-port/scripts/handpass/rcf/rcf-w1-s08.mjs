/* rcf-w1 S08 (one variant) — the same as S18 but the PH set through the Calendar window's Holidays list (Inputs gear). desktop */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w1/s08-desktop-r1')
console.log('rcf-w1-s08 v1', process.env.HP_SHOTS)
const X = await import('./rcf-w1-lib.mjs')
const { L, W4, check, note, norm, sleep, RESULTS } = X
const w = await X.world('desktop')
const { page } = w
const FRI = 4, ISO = X.ISO[FRI]
const ridge = w.ID('Ridge'), ranger = w.ID('Ranger')
const AMBER = 'Publish this day again so OIL is earned. The PH was set after the day was published.'
const WITHDRAW = 'Publish this day again to withdraw the OIL. The PH was removed after the day was published.'
const lines = (items, key) => items.filter(t => t.includes(key))
const all = async tag => {
  const out = {}
  await L.editWeek(page)
  out.week = await X.stripItems(page, '#eWeek', FRI)
  await L.board(page, FRI)
  out.board = await X.boardWarn(page, w)
  await L.closeBoard(page)
  await L.go(page, 'viewsched'); await sleep(400)
  out.view = await X.stripItems(page, '#vWeek', FRI)
  for (const [k, v] of Object.entries(out)) console.log(`  [${tag}] ${k}: items=${JSON.stringify(v.items)}`)
  return out
}
/* fixture (as S18) */
await L.board(page, FRI)
await X.typeIn(w, '[data-bfld="dr:4.0.1.str"]', '08:00')
await X.typeIn(w, '[data-bfld="dr:4.0.1.end"]', '16:00')
const gi = await X.addWave(w, FRI, '')
await X.typeIn(w, `[data-bfld="ff:4.${gi}.0.cs"]`, 'VIPER')
await X.seatPhoneAware(w, `[data-slot="4.${gi}.0.0.p"]`, ranger)
await page.keyboard.press('Escape')
const sp = await X.signAndPublish(w, FRI)
check('S08.0 Friday published', sp.p.pressed && /ORIG/.test(sp.h.tag), `tag "${sp.h.tag}"`)
await L.closeBoard(page)
const b0 = await X.lwBox(w, ridge, ISO)

/* the door: Inputs page -> gear -> Calendar… -> Holidays list -> + Add */
await L.go(page, 'inputs'); await sleep(600)
const gear = page.locator('[data-testid="in-gear"]:visible').first()
note('S08.1 door 1: the Inputs page gear', (await gear.count()) ? 'present' : 'ABSENT')
await gear.click(); await sleep(600)
await page.locator('[data-testid="iset-days"]:visible').first().click(); await sleep(900)
await X.pic(page, 's08-1-calendar-window')
const hasHol = await page.locator('[data-testid="days-part-holidays"]:visible').count()
note('S08.1 the Calendar window draws its Holidays list', hasHol ? 'yes' : 'NO (tab form?)')
if (!hasHol) { const t = page.getByRole('tab', { name: /Holidays/ }).first(); if (await t.count()) { await t.click(); await sleep(400) } }
await page.locator('[data-testid="hol-add"]:visible').first().click(); await sleep(600)
await page.locator('[data-testid="hol-name"]:visible').first().fill('PH'); await sleep(200)
/* step the form's range calendar to July 2026, then pick the 17th */
for (let i = 0; i < 14; i++) {
  if (await page.locator('[data-testid="holcal-day-2026-07-17"]:visible').count()) break
  const t = norm(await page.locator('[data-testid="holcal-title"]:visible').first().innerText())
  console.log('  holcal shows', t)
  const [m, y] = t.toLowerCase().split(' '); const cur = +y * 12 + ['january','february','march','april','may','june','july','august','september','october','november','december'].indexOf(m)
  await page.locator(`[data-testid="${cur > 2026 * 12 + 6 ? 'holcal-prev' : 'holcal-next'}"]:visible`).first().click(); await sleep(350)
}
await page.locator('[data-testid="holcal-day-2026-07-17"]:visible').first().click(); await sleep(300)
await X.pic(page, 's08-2-holiday-form')
await page.locator('[data-testid="hol-save"]:visible').first().click(); await sleep(1000)
const saved = await page.evaluate(() => { const e = document.querySelector('[data-testid="hol-saved"]'); const err = document.querySelector('[data-testid="hol-err"]'); return (e ? e.innerText : '') + ' | ' + (err ? err.innerText : '') })
note('S08.2 the form after Save', saved)
await X.pic(page, 's08-3-after-save')
/* the one OIL list may open */
const win = page.locator('[data-testid="win-oilday"]:visible').first()
if (await win.count()) { note('S08.2 the OIL list opened by the holiday', norm(await win.innerText())); await page.locator('[data-testid="odl-later"]:visible').first().click(); await sleep(400) }
for (const id of ['win-holiday-x', 'win-days-x']) { const x = page.locator(`[data-testid="${id}"]:visible`).first(); if (await x.count()) { await x.click(); await sleep(300) } }
const h1 = await X.lwHead(page, ISO)
note('S08.2 the war after the Holidays list saved it', JSON.stringify(h1) + ' ' + JSON.stringify(await page.evaluate(() => (window.__lwHol || null))))
await X.lwBox(w, ridge, ISO)
const hh = await X.lwHead(page, ISO)
check('S08.2 the PH reaches the war through this door', /PH/.test(hh.event), JSON.stringify(hh))
const b1 = await X.lwBox(w, ridge, ISO)
check('S08.3 no credit before Publish AL1', b1.box === b0.box, `box "${b0.box}" -> "${b1.box}"`)
const s1 = await all('after the Holidays-list PH')
for (const [surf, v] of Object.entries(s1)) { const a = lines(v.items, 'Publish this day again'); check(`S08.4 ${surf}: the same amber words (D2003)`, a.length === 1 && a[0].includes(AMBER), `${surf}: ${JSON.stringify(a)}`) }
await L.editWeek(page); await X.stripItems(page, '#eWeek', FRI)
await X.pic(page, 's08-4-week-amber', `#eWeek [data-dwbox="${FRI}"] .witem:has-text("Publish this day again")`)
/* then publish AL1 and remove it through the same door */
const sp2 = await X.signAndPublish(w, FRI); await L.closeBoard(page)
const b2 = await X.lwBox(w, ridge, ISO)
check('S08.5 Publish AL1 credits the desk man', sp2.p.pressed && /FO|HO/.test(b2.box), `${JSON.stringify(sp2.p)} box "${b2.box}"`)
await L.go(page, 'inputs'); await sleep(500)
await page.locator('[data-testid="in-gear"]:visible').first().click(); await sleep(500)
await page.locator('[data-testid="iset-days"]:visible').first().click(); await sleep(800)
const line = page.locator('[data-testid="hol-list"] [data-from="2026-07-17"]:visible').first()
note('S08.6 the holiday is listed in the Holidays list', (await line.count()) ? norm(await line.innerText()) : 'NOT LISTED')
if (await line.count()) {
  await line.click(); await sleep(600)
  await X.pic(page, 's08-6-change-holiday')
  await page.locator('[data-testid="hol-delete"]:visible').first().click(); await sleep(900)
  const conf = page.getByRole('button', { name: /^(Delete|Yes|Confirm|Remove)/ })
  note('S08.6 after Delete', norm(await page.evaluate(() => document.body.innerText.slice(0, 0))) + ' confirm buttons: ' + (await conf.count()))
}
for (const id of ['win-holiday-x', 'win-days-x']) { const x = page.locator(`[data-testid="${id}"]:visible`).first(); if (await x.count()) { await x.click(); await sleep(300) } }
const hr = await X.lwHead(page, ISO)
check('S08.6 the PH comes off the war through the Holidays list', !/PH/.test(hr.event), JSON.stringify(hr))
const s2 = await all('after the Holidays-list removal')
for (const [surf, v] of Object.entries(s2)) { const a = lines(v.items, 'Publish this day again'); check(`S08.7 ${surf}: the withdraw words (D2004)`, a.length === 1 && a[0].includes(WITHDRAW), `${surf}: ${JSON.stringify(a)}`) }
note('console errors', JSON.stringify(w.errors.slice(0, 6)))
writeFileSync(process.env.HP_SHOTS + '/results.json', JSON.stringify(RESULTS, null, 1))
console.log('=== ' + RESULTS.filter(r => r.ok === true).length + ' PASS ' + RESULTS.filter(r => r.ok === false).length + ' FAIL')
RESULTS.filter(r => r.ok === false).forEach(r => console.log('  FAIL', r.id, r.detail))
await w.browser.close()
