// W2 part E — scenario 15: scenario 14's two flips on a PUBLISHED day (Wed 15 Jul 2026). The Other (Ranger, Goes to Unavailable) is filed,
// the day is published through the Scheduler Board (ORIG), then Goes to is flipped to the Ground Programme (a pending change; the issued
// face unchanged; publish AL1; the war agrees), then flipped back (pending again; publish AL2; the war agrees).
// Desktop 1536 x 864, admin, one fresh world.   Usage (from raptor-port/): node scripts/handpass/lw-m3b-w2-e.mjs
process.env.HP_URL = 'http://localhost:4180'
import * as H from './lw-m3b-w2-lib.mjs'
const { L, T, note } = H
process.env.HP_SHOTS = H.OUT
H.clearPrefix('e-')
console.log('lw-m3b-w2-e', H.OUT)
const HPL = await import('./lib.mjs')
const num = s => (s == null ? null : Number(String(s).replace(/[^\d.\-]/g, '')))
const hasBox = (cell, re) => (cell || []).some(b => re.test(b))
const w = await H.deskCtx(); const P = w.page
await L.signInPlain(w, 'admin')
note('bundle', 'desk', await H.bundleName(P))
const ranger = await H.idOf(P, 'Ranger')
const ISO = '2026-07-15', DI = 2, RE = /Pub other/
const EDIT = `#eWeek section.day[data-day="${DI}"]`
const head = async page => P.evaluate(([page, di]) => { const d = document.querySelector(`${page === 'editsched' ? '#eWeek' : '#vWeek'} section.day[data-day="${di}"]`); if (!d) return null; const h = d.firstElementChild; return (h ? h.innerText : '').replace(/\s+/g, ' ').slice(0, 260) }, [page, DI])
const pendingOf = h => { const m = String(h || '').match(/(\d+)\s+pending/); return m ? +m[1] : 0 }
const verOf = h => (String(h || '').match(/\b(ORIG|AL\d+)\b/) || [])[1] || null
const rowsNamed = async (root, sec) => ((await H.rowsOf(P, DI, sec, root)).rows || []).filter(r => RE.test(r.text)).map(r => r.text)
const marks = sec => P.evaluate(([root, sec, di]) => { const d = document.querySelector(`${root} section.day[data-day="${di}"]`); const r = d && [...d.querySelectorAll(`.${sec} .pl-row`)].find(r => /Pub other/.test(r.innerText)); if (!r) return null; const html = r.outerHTML; return { dataAl: [...new Set(html.match(/data-al[a-z]*="[^"]*"/g) || [])], altag: [...r.querySelectorAll('[class*="al"],[class*="pend"]')].map(e => e.className).slice(0, 6) } }, ['#eWeek', sec, DI])
const editState = async () => {
  await H.goEdit(w)
  for (let i = 0; i < 12; i++) { const n = await P.evaluate(di => (document.querySelector(`#eWeek section.day[data-day="${di}"]`)?.innerText || '').length, DI); if (n > 150) break; await P.waitForTimeout(500) }
  const h = await head('editsched')
  const t = P.locator(`${EDIT} [data-pitog="${DI}"]`).first()
  return { head: h, pending: pendingOf(h), ver: verOf(h), unav: await rowsNamed('#eWeek', 'sec-unav'), grnd: await rowsNamed('#eWeek', 'sec-grnd'), mu: await marks('sec-unav'), mg: await marks('sec-grnd') }
}
const issuedFace = async () => {
  await P.evaluate(() => window.go('viewsched')); await P.waitForTimeout(1500)
  await P.waitForSelector('#vWeek section.day[data-day="2"]', { state: 'attached' })
  return { head: await head('viewsched'), unav: await rowsNamed('#vWeek', 'sec-unav'), grnd: await rowsNamed('#vWeek', 'sec-grnd') }
}
const warNow = async picName => { await H.warOpen(w, ranger, ISO); const r = { cell: await H.cellBoxes(w, ranger, ISO), avail: await H.availP(P, ISO) }; if (picName) await H.warPic(w, picName, ranger, [ISO]); return r }
const publish = async () => { await HPL.board(P, DI); const r = await HPL.publish(P, DI); const chip = await P.evaluate(() => (document.querySelector('#schedBoard .verchip') || {}).innerText || ''); await HPL.closeBoard(P); return { ...r, chip } }
const picEdit = async (name, sec) => { await H.goEdit(w); await P.evaluate(di => document.querySelector(`#eWeek section.day[data-day="${di}"]`)?.scrollIntoView({ block: 'start' }), DI); await P.waitForTimeout(300); await H.pic(w, name + '-head', [`${EDIT} > :first-child`], { pad: 6 }); await H.centreOn(P, [`${EDIT} .${sec}`]); return H.pic(w, name, [`${EDIT} .${sec}`], { pad: 6 }) }
const picView = async (name, sec) => { await P.evaluate(() => window.go('viewsched')); await P.waitForTimeout(1200); await P.evaluate(di => document.querySelector(`#vWeek section.day[data-day="${di}"]`)?.scrollIntoView({ block: 'start' }), DI); await P.waitForTimeout(300); await H.pic(w, name + '-head', [`#vWeek section.day[data-day="${DI}"] > :first-child`], { pad: 6 }); await H.centreOn(P, [`#vWeek section.day[data-day="${DI}"] .${sec}`]); return H.pic(w, name, [`#vWeek section.day[data-day="${DI}"] .${sec}`], { pad: 6 }) }

/* ---------- the fixture: the Other under Unavailable, then the day published ---------- */
const f = await H.fileInput(w, { who: 'Ranger', type: 'Other', from: ISO, remarks: 'Pub other', goes: 'u', tag: '15', beforeSave: async () => { if (!(await P.locator('#inpEditAllday').isChecked())) await L.press(w, '#inpEditAllday') } })
const iid = f.rec.iid
const pub0 = await publish()
const s0 = await editState(), v0 = await issuedFace(), w0 = await warNow()
note('15-published', 'desk', `publish ${JSON.stringify(pub0)}; edit head "${s0.head}"; Unavailable ${JSON.stringify(s0.unav)}; issued face Unavailable ${JSON.stringify(v0.unav)}; war ${JSON.stringify(w0.cell)} Available P ${w0.avail}`)
if (!(s0.unav.length === 1 && v0.unav.length === 1 && s0.pending === 0)) throw new Error('the published fixture is not as built: ' + JSON.stringify({ s0, v0 }))
await picEdit('e-15-0-published-edit', 'sec-unav'); await picView('e-15-0-published-view', 'sec-unav')

/* ---------- flip 1: → Ground ---------- */
await H.openInputBy(w, iid, 'row')
await L.press(w, T('inpEdit-goes-g')); await P.waitForTimeout(300)
await L.press(w, '#inpEditSave'); await P.waitForTimeout(1200)
await H.answerAsks(w, '15-flip1')
const s1 = await editState(); await picEdit('e-15-1-ground-edit', 'sec-grnd')
const v1 = await issuedFace(); await picView('e-15-1-ground-view', 'sec-unav')
const w1 = await warNow(); await H.warPic(w, 'e-15-1-ground-war', ranger, [ISO])
note('15-flip1', 'desk', `edit head "${s1.head}"; Ground ${JSON.stringify(s1.grnd)}; Unavailable ${JSON.stringify(s1.unav)}; marks on the Ground row ${JSON.stringify(s1.mg)}; issued face Unavailable ${JSON.stringify(v1.unav)} Ground ${JSON.stringify(v1.grnd)}; war ${JSON.stringify(w1.cell)} Available P ${w1.avail}`)
const ok1 = s1.pending >= 1 && s1.grnd.length === 1 && s1.unav.length === 0 && v1.unav.length === 1 && v1.grnd.length === 0
/* the amendment's own list: what the "N pending" button says */
await H.goEdit(w)
await P.locator(`${EDIT} [data-pend], ${EDIT} .pendbtn, ${EDIT} button:has-text("pending")`).first().click().catch(() => {}); await P.waitForTimeout(900)
note('15-flip1', 'desk', 'the pending list: ' + await P.evaluate(() => [...document.querySelectorAll('[role=dialog],.airpop-box,[data-testid^="win-"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 500)).join(' || ')))
await H.pic(w, 'e-15-1-pending-list', null)
await P.keyboard.press('Escape'); await P.waitForTimeout(400)
/* publish AL1 */
const pub1 = await publish()
const s1b = await editState(), v1b = await issuedFace(), w1b = await warNow('e-15-1b-war')
await picView('e-15-1b-view-after-AL1', 'sec-grnd')
note('15-AL1', 'desk', `publish ${JSON.stringify(pub1)}; edit head "${s1b.head}" (pending ${s1b.pending}); issued face Unavailable ${JSON.stringify(v1b.unav)} Ground ${JSON.stringify(v1b.grnd)} head "${v1b.head}"; war ${JSON.stringify(w1b.cell)} Available P ${w1b.avail}`)
L.rec('15-flip-ground', 'desk', ok1 && s1b.pending === 0 && v1b.grnd.length === 1 && v1b.unav.length === 0 && w1.cell.length === 0 && w1b.cell.length === 0 && num(w1b.avail) === num(w0.avail) + 1 ? 'PASS?' : 'FAIL?', `after the flip: pending ${s1.pending} ("${s1.head}"), row on Ground ${s1.grnd.length}, marks ${JSON.stringify(s1.mg)}; issued face still Unavailable ${v1.unav.length} / Ground ${v1.grnd.length}; war (before AL1) ${JSON.stringify(w1.cell)} Available P ${w1.avail}; after AL1: pending ${s1b.pending}, issued face Ground ${v1b.grnd.length} Unavailable ${v1b.unav.length}, war ${JSON.stringify(w1b.cell)} Available P ${w1b.avail} (it was ${w0.avail})`, ['e-15-0-published-edit', 'e-15-0-published-view', 'e-15-1-ground-edit', 'e-15-1-ground-view', 'e-15-1-ground-war', 'e-15-1-pending-list', 'e-15-1b-view-after-AL1', 'e-15-1b-war'])

/* ---------- flip 2: → Unavailable again ---------- */
await H.openInputBy(w, iid, 'list')
await L.press(w, T('inpEdit-goes-u')); await P.waitForTimeout(300)
await L.press(w, '#inpEditSave'); await P.waitForTimeout(1200)
await H.answerAsks(w, '15-flip2')
const s2 = await editState(); await picEdit('e-15-2-unavail-edit', 'sec-unav')
const v2 = await issuedFace(); await picView('e-15-2-unavail-view', 'sec-grnd')
const w2 = await warNow(); await H.warPic(w, 'e-15-2-unavail-war', ranger, [ISO])
note('15-flip2', 'desk', `edit head "${s2.head}"; Unavailable ${JSON.stringify(s2.unav)}; marks ${JSON.stringify(s2.mu)}; issued face Unavailable ${JSON.stringify(v2.unav)} Ground ${JSON.stringify(v2.grnd)}; war ${JSON.stringify(w2.cell)} Available P ${w2.avail}`)
/* the changes window's "To go out" list after the flip back, and the row's own marks in the day */
await H.goEdit(w)
await P.locator(`${EDIT} [data-pend], ${EDIT} .pendbtn, ${EDIT} button:has-text("pending")`).first().click().catch(() => {}); await P.waitForTimeout(900)
note('15-flip2', 'desk', 'the pending list: ' + await H.chgText(P))
await H.pic(w, 'e-15-2-pending-list', null)
await H.closeChanges(w)
note('15-flip2', 'desk', 'whole Unavailable row html attributes: ' + await P.evaluate(di => { const d = document.querySelector(`#eWeek section.day[data-day="${di}"]`); const r = d && [...d.querySelectorAll('.sec-unav .pl-row')].find(r => /Pub other/.test(r.innerText)); return r ? [...new Set([...r.querySelectorAll('*'), r].flatMap(e => [...e.attributes].map(a => a.name)).filter(n => /^data-|^class$/.test(n)))].join(',') + ' | classes: ' + [...new Set([...r.querySelectorAll('*'), r].flatMap(e => [...e.classList]))].join(' ') : null }, DI))
const pub2 = await publish()
const s2b = await editState(), v2b = await issuedFace(), w2b = await warNow('e-15-2b-war')
await picView('e-15-2b-view-after-AL2', 'sec-unav')
note('15-AL2', 'desk', `publish ${JSON.stringify(pub2)}; edit head "${s2b.head}"; issued face Unavailable ${JSON.stringify(v2b.unav)} Ground ${JSON.stringify(v2b.grnd)}; war ${JSON.stringify(w2b.cell)} Available P ${w2b.avail}`)
L.rec('15-flip-back', 'desk', s2.pending >= 1 && s2.unav.length === 1 && v2.grnd.length === 1 && v2.unav.length === 0 && s2b.pending === 0 && v2b.unav.length === 1 && hasBox(w2b.cell, /^OTH\|.*outlined/) && num(w2b.avail) === num(w0.avail) ? 'PASS?' : 'FAIL?', `after the flip back: pending ${s2.pending} ("${s2.head}"), row under Unavailable ${s2.unav.length}, marks ${JSON.stringify(s2.mu)}; issued face still Ground ${v2.grnd.length} / Unavailable ${v2.unav.length}; war (before AL2) ${JSON.stringify(w2.cell)} Available P ${w2.avail}; after AL2: pending ${s2b.pending}, issued face Unavailable ${v2b.unav.length}, war ${JSON.stringify(w2b.cell)} Available P ${w2b.avail}`, ['e-15-2-unavail-edit', 'e-15-2-unavail-view', 'e-15-2-unavail-war', 'e-15-2b-view-after-AL2', 'e-15-2b-war'])

note('errors', 'desk', JSON.stringify(w.errs))
H.saveLog('e-run.json')
await w.ctx.close()
await H.closeBrowser()
console.log('RESULTS'); for (const r of L.results) console.log(r.verdict, r.id, '|', r.said)
