/* rcf-w1 S18 (+ S08 variant record) — a PH added after publishing (D2002, D2003). usage: node rcf-w1-s18.mjs [desktop|phone] */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
const KIND = process.argv[2] || 'desktop'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w1/s18-' + KIND + '-r1')
console.log('rcf-w1-s18 v1', KIND, process.env.HP_SHOTS)
const X = await import('./rcf-w1-lib.mjs')
const { L, W4, check, note, norm, sleep, RESULTS } = X
const w = await X.world(KIND)
const { page } = w
const P = w.phone ? 'p' : 'd'
const FRI = 4, ISO = X.ISO[FRI]
const ridge = w.ID('Ridge'), ranger = w.ID('Ranger')
const AMBER = 'Publish this day again so OIL is earned. The PH was set after the day was published.'
const hasAmber = items => items.filter(t => t.includes('Publish this day again'))
const all = async tag => {
  const out = {}
  await L.editWeek(page)
  out.week = await X.stripItems(page, '#eWeek', FRI)
  await L.board(page, FRI)
  out.board = await X.boardWarn(page, w)
  await L.closeBoard(page)
  await L.go(page, 'viewsched'); await sleep(400)
  out.view = await X.stripItems(page, '#vWeek', FRI)
  for (const [k, v] of Object.entries(out)) console.log(`  [${tag}] ${k}: head=${JSON.stringify(v.head)} items=${JSON.stringify(v.items)}`)
  return out
}

/* ---- the fixture: SXO desk Ridge 08:00-16:00, a flying line with no times, Ranger on it ---- */
await L.board(page, FRI)
await X.typeIn(w, '[data-bfld="dr:4.0.1.str"]', '08:00')
await X.typeIn(w, '[data-bfld="dr:4.0.1.end"]', '16:00')
const gi = await X.addWave(w, FRI, '')
await X.typeIn(w, `[data-bfld="ff:4.${gi}.0.cs"]`, 'VIPER')
console.log('seat', await X.seatPhoneAware(w, `[data-slot="4.${gi}.0.0.p"]`, ranger))
await page.keyboard.press('Escape')
const fx = await page.evaluate(g => ({ duty: window.DAYS[4].dutywaves[0].rows.map(r => `${r.role}|${r.str}-${r.end}|${r.id}`), line: window.DAYS[4].waves[g].formations[0].aircraft[0].p + '|' + window.DAYS[4].waves[g].formations[0].to + '|' + window.DAYS[4].waves[g].formations[0].ld }), gi)
check('S18.0 fixture landed: Ridge on a timed desk, Ranger on a line with no times', /SXO\|0?8:?00-0?16:?00\|razer/.test(fx.duty.join(' ')) && fx.line === 'bane||', JSON.stringify(fx))
const sp = await X.signAndPublish(w, FRI)
check('S18.0 Friday published', sp.p.pressed && /ORIG/.test(sp.h.tag), `tag "${sp.h.tag}" ${JSON.stringify(sp.p)}`)
await L.closeBoard(page)
const b0 = await X.lwBox(w, ridge, ISO)
const o0 = await X.lwOil(w, ridge, ISO)
note('S18.0 Ridge on the war before the PH', `box "${b0.box}" (${b0.cls}); OIL figure ${JSON.stringify(o0)}`)
await X.pic(page, 's18-1-war-before')

/* ---- the PH ---- */
const e = await X.lwEvent(w, ISO, 'PH')
const h1 = await X.lwHead(page, ISO)
check('S18.1 the PH lands on the war', e.ok && /PH/.test(h1.event), `${JSON.stringify(e)} event cell "${h1.event}" head "${h1.head}"`)
await X.pic(page, 's18-2-war-ph')
const b1 = await X.lwBox(w, ridge, ISO)
const o1 = await X.lwOil(w, ridge, ISO)
check('S18.2 no credit before Publish AL1 (D2, D142)', b1.box === b0.box && JSON.stringify(o1) === JSON.stringify(o0), `box "${b0.box}" -> "${b1.box}"; OIL ${JSON.stringify(o0)} -> ${JSON.stringify(o1)}`)

const s1 = await all('after PH')
for (const [surf, v] of Object.entries(s1)) {
  const a = hasAmber(v.items)
  check(`S18.3 ${surf}: the amber line reads exactly (D2003)`, a.length === 1 && a.some(t => t.includes(AMBER)), `${surf} lines with "Publish this day again": ${JSON.stringify(a)}`)
}
const redWords = s1.week.items.filter(t => !t.includes('Publish this day again'))
note('S18.3 the week strip, the other lines (the red line for the line with no usable times, D2002)', JSON.stringify(redWords))
note('S18.3 the board, the other lines', JSON.stringify(s1.board.items.filter(t => !t.includes('Publish this day again'))))
note('S18.3 View-only Sched, the other lines', JSON.stringify(s1.view.items.filter(t => !t.includes('Publish this day again'))))
// pictures, cropped to each amber line
await L.editWeek(page); await X.stripItems(page, '#eWeek', FRI)
await X.pic(page, `s18-3-week-amber-${P}`, `#eWeek [data-dwbox="${FRI}"] .witem:has-text("Publish this day again")`)
await X.pic(page, `s18-3-week-strip-${P}`, `#eWeek [data-dwbox="${FRI}"]`)
await L.board(page, FRI)
await X.boardWarn(page, w)
await X.pic(page, `s18-3-board-${P}`)
const bl = page.locator('#schedBoard .wln:has-text("Publish this day again")').first()
if (await bl.count()) await X.pic(page, `s18-3-board-amber-${P}`, '#schedBoard .wln:has-text("Publish this day again")')
await L.closeBoard(page)
await L.go(page, 'viewsched'); await sleep(400); await X.stripItems(page, '#vWeek', FRI)
await X.pic(page, `s18-3-view-amber-${P}`, `#vWeek [data-dwbox="${FRI}"] .witem:has-text("Publish this day again")`)
await X.pic(page, `s18-3-view-strip-${P}`, `#vWeek [data-dwbox="${FRI}"]`)

/* ---- Undo the PH, Redo it ---- */
await W4.lwOpen(page, ISO)
const u = await X.undoBtn(w, 'undo')
note('S18.4 Undo pressed (on the war page)', JSON.stringify(u))
const h2 = await X.lwHead(page, ISO)
await X.pic(page, `s18-4-war-after-undo-${P}`)
const s2 = await all('after Undo')
check('S18.4 Undo takes the PH off the war', u.ok && !/PH/.test(h2.event), `event cell "${h2.event}"; undo ${JSON.stringify(u)}`)
check('S18.4 and the amber line is gone on every surface', Object.values(s2).every(v => !hasAmber(v.items).length), JSON.stringify(Object.fromEntries(Object.entries(s2).map(([k, v]) => [k, hasAmber(v.items)]))))
await W4.lwOpen(page, ISO)
const r = await X.undoBtn(w, 'redo')
const h3 = await X.lwHead(page, ISO)
const s3 = await all('after Redo')
check('S18.4 Redo puts the PH back and the amber line with it', r.ok && /PH/.test(h3.event) && Object.values(s3).every(v => hasAmber(v.items).some(t => t.includes(AMBER))), `redo ${JSON.stringify(r)}; event cell "${h3.event}"; ${JSON.stringify(Object.fromEntries(Object.entries(s3).map(([k, v]) => [k, hasAmber(v.items).length])))}`)

/* ---- Publish AL1 ---- */
await L.editWeek(page)
const sp2 = await X.signAndPublish(w, FRI)
await L.closeBoard(page)
check('S18.5 Publish AL1 went out', sp2.p.pressed, `${JSON.stringify(sp2.p)} tag "${sp2.h.tag}"`)
const b2 = await X.lwBox(w, ridge, ISO)
const o2 = await X.lwOil(w, ridge, ISO)
await X.pic(page, `s18-5-war-after-al1-${P}`)
check('S18.5 after Publish AL1 the desk man is credited', /FO|HO/.test(b2.box) || JSON.stringify(o2) !== JSON.stringify(o0), `box "${b0.box}" -> "${b2.box}" (${b2.cls}); OIL ${JSON.stringify(o0)} -> ${JSON.stringify(o2)}`)
const s4 = await all('after AL1')
note('S18.5 amber after AL1', JSON.stringify(Object.fromEntries(Object.entries(s4).map(([k, v]) => [k, hasAmber(v.items)]))))
console.log('errors', w.errors)
note('console errors', JSON.stringify(w.errors.slice(0, 6)))
writeFileSync(process.env.HP_SHOTS + '/results.json', JSON.stringify(RESULTS, null, 1))
console.log('=== ' + RESULTS.filter(r => r.ok === true).length + ' PASS ' + RESULTS.filter(r => r.ok === false).length + ' FAIL')
RESULTS.filter(r => r.ok === false).forEach(r => console.log('  FAIL', r.id, r.detail))
await w.browser.close()
