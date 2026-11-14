/* rcf-w1 S19 — the PH removed after publishing (D2004); the Saturday record. usage: node rcf-w1-s19.mjs [desktop|phone] */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
const KIND = process.argv[2] || 'desktop'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w1/s19-' + KIND + '-r1')
console.log('rcf-w1-s19 v1', KIND, process.env.HP_SHOTS)
const X = await import('./rcf-w1-lib.mjs')
const { L, W4, check, note, norm, sleep, RESULTS } = X
const w = await X.world(KIND)
const { page } = w
const P = w.phone ? 'p' : 'd'
const FRI = 4, SAT = 5
const ridge = w.ID('Ridge')
const WITHDRAW = 'Publish this day again to withdraw the OIL. The PH was removed after the day was published.'
const lines = (items, key) => items.filter(t => t.includes(key))
const all = async (tag, di) => {
  const out = {}
  await L.editWeek(page)
  out.week = await X.stripItems(page, '#eWeek', di)
  await L.board(page, di)
  out.board = await X.boardWarn(page, w)
  await L.closeBoard(page)
  await L.go(page, 'viewsched'); await sleep(400)
  out.view = await X.stripItems(page, '#vWeek', di)
  for (const [k, v] of Object.entries(out)) console.log(`  [${tag}] ${k}: head=${JSON.stringify(v.head)} items=${JSON.stringify(v.items)}`)
  return out
}

/* ================= Friday: a weekday PH, a timed desk, publish, then the PH removed ================= */
const ISO = X.ISO[FRI]
let e = await X.lwEvent(w, ISO, 'PH')
check('S19.0 a weekday PH set on Friday before publishing', e.ok && /PH/.test((await X.lwHead(page, ISO)).event), JSON.stringify(e))
await L.board(page, FRI)
await X.typeIn(w, '[data-bfld="dr:4.0.1.str"]', '08:00')
await X.typeIn(w, '[data-bfld="dr:4.0.1.end"]', '16:00')
const sp = await X.signAndPublish(w, FRI)
check('S19.0 Friday published', sp.p.pressed && /ORIG/.test(sp.h.tag), `tag "${sp.h.tag}" ${JSON.stringify(sp.p)}`)
await L.closeBoard(page)
const b0 = await X.lwBox(w, ridge, ISO)
const o0 = await X.lwOil(w, ridge, ISO)
check('S19.1 the desk man is credited on the published PH day', /FO|HO/.test(b0.box), `box "${b0.box}" (${b0.cls}); OIL figure ${JSON.stringify(o0)}`)
await X.pic(page, 's19-1-war-credited')
e = await X.lwEvent(w, ISO, null)
const h1 = await X.lwHead(page, ISO)
check('S19.2 the PH comes off the war', e.ok && !/PH/.test(h1.event), `${JSON.stringify(e)}; event cell "${h1.event}"; head "${h1.head}"`)
await X.pic(page, 's19-2-war-ph-removed')
const b1 = await X.lwBox(w, ridge, ISO)
const o1 = await X.lwOil(w, ridge, ISO)
check('S19.3 the credit stays until the day is published again (D2004, D2)', b1.box === b0.box && JSON.stringify(o1) === JSON.stringify(o0), `box "${b0.box}" -> "${b1.box}"; OIL ${JSON.stringify(o0)} -> ${JSON.stringify(o1)}`)
const s1 = await all('Fri after PH removed', FRI)
for (const [surf, v] of Object.entries(s1)) {
  const a = lines(v.items, 'Publish this day again')
  check(`S19.4 ${surf}: the amber line reads exactly (D2004)`, a.length === 1 && a.some(t => t.includes(WITHDRAW)), `${surf}: ${JSON.stringify(a)}`)
}
note('S19.4 the other lines', JSON.stringify(Object.fromEntries(Object.entries(s1).map(([k, v]) => [k, v.items.filter(t => !t.includes('Publish this day again'))]))))
await L.editWeek(page); await X.stripItems(page, '#eWeek', FRI)
await X.pic(page, `s19-4-week-amber-${P}`, `#eWeek [data-dwbox="${FRI}"] .witem:has-text("Publish this day again")`)
await L.board(page, FRI); await X.boardWarn(page, w)
await X.pic(page, `s19-4-board-amber-${P}`, '#schedBoard .wln:has-text("Publish this day again")')
await L.closeBoard(page)
await L.go(page, 'viewsched'); await sleep(400); await X.stripItems(page, '#vWeek', FRI)
await X.pic(page, `s19-4-view-amber-${P}`, `#vWeek [data-dwbox="${FRI}"] .witem:has-text("Publish this day again")`)
const sp2 = await X.signAndPublish(w, FRI)
await L.closeBoard(page)
check('S19.5 Publish AL1 went out', sp2.p.pressed, `${JSON.stringify(sp2.p)} tag "${sp2.h.tag}"`)
const b2 = await X.lwBox(w, ridge, ISO)
const o2 = await X.lwOil(w, ridge, ISO)
check('S19.5 after Publish AL1 the credit is withdrawn', !/FO|HO/.test(b2.box), `box "${b0.box}" -> "${b2.box}"; OIL ${JSON.stringify(o0)} -> ${JSON.stringify(o2)}`)
await X.pic(page, 's19-5-war-after-al1')
const s2 = await all('Fri after AL1', FRI)
note('S19.5 amber after AL1', JSON.stringify(Object.fromEntries(Object.entries(s2).map(([k, v]) => [k, lines(v.items, 'Publish this day again')]))))

/* ================= Saturday (still a weekend): PH set, a timed desk, publish, PH removed — RECORD ================= */
const SISO = X.ISO[SAT]
e = await X.lwEvent(w, SISO, 'PH')
note('S19.6 a PH set on Saturday', JSON.stringify(e) + ' ' + JSON.stringify(await X.lwHead(page, SISO)))
await L.board(page, SAT)
const wi = 0
await X.typeIn(w, `[data-bfld="dr:5.0.0.str"]`, "08:00")
await X.typeIn(w, `[data-bfld="dr:5.0.0.end"]`, "16:00")
console.log("seat", await X.seatPhoneAware(w, `[data-fill="d:5.0.0.+"]`, ridge))
await page.keyboard.press("Escape")
const satRow = await page.evaluate(i => JSON.stringify(window.DAYS[5].dutywaves[i].rows.map(r => [r.role, r.str, r.end, r.id, (r.more || []).join("+")])), wi)
check('S19.6 Saturday fixture: Ridge on a timed desk row', /razer/.test(satRow) && /8:?00/.test(satRow), satRow)
const sp3 = await X.signAndPublish(w, SAT)
note('S19.6 Saturday published', JSON.stringify({ p: sp3.p, tag: sp3.h.tag }))
await L.closeBoard(page)
const sb0 = await X.lwBox(w, ridge, SISO)
e = await X.lwEvent(w, SISO, null)
const sh1 = await X.lwHead(page, SISO)
const sb1 = await X.lwBox(w, ridge, SISO)
note('S19.7 Saturday PH removed', `${JSON.stringify(e)}; event cell "${sh1.event}"; Ridge's box "${sb0.box}" -> "${sb1.box}"`)
const s3 = await all('Sat after PH removed', SAT)
note('S19.7 RECORD: what Saturday (still a weekend) shows when its PH is removed after publishing', JSON.stringify(Object.fromEntries(Object.entries(s3).map(([k, v]) => [k, v.items]))))
check('S19.7 no withdraw line on a day that still qualifies as a weekend (D2004)', Object.values(s3).every(v => !lines(v.items, 'withdraw the OIL').length), JSON.stringify(Object.fromEntries(Object.entries(s3).map(([k, v]) => [k, lines(v.items, 'withdraw')]))))
await X.pic(page, 's19-7-sat-view')
note('console errors', JSON.stringify(w.errors.slice(0, 6)))
writeFileSync(process.env.HP_SHOTS + '/results.json', JSON.stringify(RESULTS, null, 1))
console.log('=== ' + RESULTS.filter(r => r.ok === true).length + ' PASS ' + RESULTS.filter(r => r.ok === false).length + ' FAIL')
RESULTS.filter(r => r.ok === false).forEach(r => console.log('  FAIL', r.id, r.detail))
await w.browser.close()
