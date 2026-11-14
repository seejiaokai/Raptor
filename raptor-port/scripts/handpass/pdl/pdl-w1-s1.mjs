/* pdl-w1-s1 v1 — S1 (desktop) his exact case; also S3 (member's view) at the end, in the same world, and S5 later in its own script.
   RUN=<name> picks the picture sub-folder. STOPAT=<n> stops after step n (for try-outs). */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.env.RUN || 's1'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/w1/' + RUN)
const STOPAT = +(process.env.STOPAT || 99)
console.log('pdl-w1-s1 v1', process.env.HP_SHOTS)
const P = await import('./pdl-w1-lib.mjs')
const { X, W, L, sleep, row, SHOTS } = P
const w = await X.world('desktop')
const { page } = w
const man = w.ID('Vandal')
const NAME = 'Vandal'
const j = o => JSON.stringify(o)
const mine = items => (items || []).filter(t => new RegExp(NAME).test(t))
const restMine = items => mine(items).filter(t => /rest/i.test(t))
const restAll = items => (items || []).filter(t => /rest/i.test(t))

/* a second picture: the man's own puck brought to the middle (the ring colour is read there) */
async function manPic(root, di, pic) {
  const pk = page.locator(`${root} .day[data-day="${di}"] .puck[data-person="${man}"]`).first()
  if (!(await pk.count())) return
  await pk.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  await page.screenshot({ path: `${SHOTS}/${pic}-man.png` })
}
const signedLine = di => page.evaluate(i => { const t = (document.querySelector(`#eWeek .day[data-day="${i}"]`) || {}).textContent || ''; const m = t.replace(/[\s ]+/g, ' ').match(/signed.{0,140}?approved\s*\S+/i); return m ? m[0] : '(no SIGNED line)' }, di)
/* read one surface and picture it; returns what a person reads for the man */
async function look(surface, di, pic) {
  const page = w.page
  if (surface === 'edit') {
    await L.go(page, 'editsched'); await sleep(500)
    const s = await X.stripItems(page, '#eWeek', di)
    const rings = (await P.ringsOf(page, '#eWeek .day[data-day="' + di + '"]')).filter(r => r.who === NAME)
    const head = await L.head(page, di)
    if (pic) { await P.shotPage(page, pic); await manPic('#eWeek', di, pic) }
    const sl = await signedLine(di)
    return { surf: 'edit', signed: sl, head: s.head, rest: restAll(s.items), restMine: restMine(s.items), allItems: s.items, rings: rings.map(r => P.sevWord(r) + ':' + r.cls), pending: head && head.pending, tag: head && head.tag, signState: head && head.signState, signs: head && head.signs }
  }
  if (surface === 'view') {
    await L.go(page, 'viewsched'); await sleep(500)
    const s = await X.stripItems(page, '#vWeek', di)
    const rings = (await P.ringsOf(page, '#vWeek .day[data-day="' + di + '"]')).filter(r => r.who === NAME)
    const vh = await page.evaluate(i => { const e = document.querySelector(`#vWeek .day[data-day="${i}"] .day-head`); return e ? e.innerText.replace(/[\s ]+/g, ' ').trim() : 'NO HEAD' }, di)
    if (pic) { await P.shotPage(page, pic); await manPic('#vWeek', di, pic) }
    return { surf: 'view', head: s.head, rest: restAll(s.items), restMine: restMine(s.items), allItems: s.items, rings: rings.map(r => P.sevWord(r) + ':' + r.cls), dayHead: vh }
  }
  if (surface === 'board') {
    await P.openBoard(w, di); await sleep(400)
    const wl = await W.warnList(page)
    const rings = (await P.ringsOf(page, '#schedBoard')).filter(r => r.who === NAME)
    const head = await L.head(page, di)
    if (pic) await P.shotPage(page, pic)
    const lines = wl.lines.map(l => l.text)
    await L.closeBoard(page)
    return { surf: 'board', head: wl.head, rest: restAll(lines), restMine: restMine(lines), allItems: lines, rings: rings.map(r => P.sevWord(r) + ':' + r.cls), pending: head && head.pending, tag: head && head.tag, signState: head && head.signState }
  }
}
const brief = o => `${o.surf}: head="${o.head}" restMine=${j(o.restMine)} otherRest=${j(o.rest.filter(t => !new RegExp(NAME).test(t)).map(t => t.slice(0, 40)))} rings=${j(o.rings)}` + (o.pending !== undefined ? ` pending="${o.pending}" tag=${o.tag} sign="${o.signState}"` : '') + (o.dayHead ? ` dayHead="${o.dayHead}"` : '') + (o.signed ? ` signed="${o.signed}"` : '')
const noVandalRed = o => o.restMine.length === 0 && !o.rings.some(r => /^RED/.test(r))

/* ---- steps 1-2: build ---- */
await P.openBoard(w, 0)
let r = await P.line(w, 0, { to: '18:00', ld: '19:00', who: man })
console.log('S1.1a Mon', j(r))
await L.closeBoard(page)
await P.openBoard(w, 1)
r = await P.line(w, 1, { to: '12:00', ld: '13:00', who: man })
console.log('S1.1b Tue', j(r))
await L.closeBoard(page)
const tueGi = r.gi
let t1 = await look('board', 1, 's1-01-tue-board-clean')
let t1e = await look('edit', 1, 's1-01-tue-edit-clean')
let t1v = await look('view', 1, 's1-01-tue-view-clean')
for (const o of [t1, t1e, t1v]) console.log('S1.1', brief(o))
row('S1.1 Tue (12:00 VL, B blank) no crew-rest warning for Vandal', [t1, t1e, t1v].every(noVandalRed) ? 'PASS' : 'FAIL', [t1, t1e, t1v].map(brief).join(' || '), 's1-01-tue-*.png')
await P.openBoard(w, 2)
r = await P.line(w, 2, { to: '18:00', ld: '19:00', who: man })
console.log('S1.2a Wed', j(r))
await L.closeBoard(page)
await P.openBoard(w, 3)
r = await P.line(w, 3, { to: '12:00', ld: '13:00', who: man })
console.log('S1.2b Thu', j(r))
const thGi = r.gi
await L.closeBoard(page)
let th1 = await look('board', 3, 's1-02-thu-board-clean')
let th1e = await look('edit', 3, 's1-02-thu-edit-clean')
for (const o of [th1, th1e]) console.log('S1.2', brief(o))
row('S1.2 Thu (12:00 VL, B blank) clean for Vandal', [th1, th1e].every(noVandalRed) ? 'PASS' : 'FAIL', [th1, th1e].map(brief).join(' || '), 's1-02-thu-*.png')
if (STOPAT <= 2) { P.finish(w); await w.browser.close(); process.exit(0) }

/* ---- step 3: publish Tuesday ---- */
await P.openBoard(w, 1)
const sp = await X.signAndPublish(w, 1)
console.log('S1.3 sign/publish', j({ sg: sp.sg, p: sp.p, h: sp.h }))
await L.closeBoard(page)
const t3v = await look('view', 1, 's1-03-tue-published-view')
const t3e = await look('edit', 1, 's1-03-tue-published-edit')
console.log('S1.3', brief(t3v)); console.log('S1.3', brief(t3e))
row('S1.3 Tue published, clean on View-only Sched', /ORIG/.test(t3v.dayHead) && noVandalRed(t3v) ? 'PASS' : 'FAIL', brief(t3v) + ' || ' + brief(t3e), 's1-03-tue-published-view.png')
if (STOPAT <= 3) { P.finish(w); await w.browser.close(); process.exit(0) }

/* ---- step 4: Logic: Crew rest to 13h ---- */
async function setCrewRest(val) {
  await L.go(page, 'logic'); await sleep(600)
  if (!(await page.locator('#lgBody input[data-lgset="crewRest"]:visible').count())) { await X.press(w, '#lgEdit', { scope: 'page' }); await sleep(500) }
  const inp = page.locator('#lgBody input[data-lgset="crewRest"]').first()
  await inp.scrollIntoViewIfNeeded()
  const before = await inp.inputValue()
  await inp.fill(String(val)); await inp.press('Tab'); await sleep(600)
  const after = await inp.inputValue()
  const v = await page.evaluate(() => VCONF.crewRest)
  return { before, after, vconf: v }
}
const lg = await setCrewRest('13h')
console.log('S1.4 logic', j(lg))
await inp_pic()
async function inp_pic() {
  await page.locator('#lgBody input[data-lgset="crewRest"]').first().scrollIntoViewIfNeeded()
  await P.shotPage(page, 's1-04-logic-crewrest-13h-editing')
}
/* Done */
const lgBtn = await page.evaluate(() => { const b = [...document.querySelectorAll('#lgDone, #lgEdit')].find(x => x.offsetWidth); return b ? b.textContent.trim() : 'NO visible lg button' })
console.log('S1.4 button reads', lgBtn)
await X.press(w, '#lgDone', { scope: 'page' }); await sleep(600)
await P.shotPage(page, 's1-04-logic-crewrest-13h-done')
const lgAfter = await page.evaluate(() => ({ vconf: VCONF.crewRest, btn: ([...document.querySelectorAll('#lgDone, #lgEdit')].find(x => x.offsetWidth) || {}).textContent, row: (document.querySelector('#lgBody')?.innerText || '').slice(0, 120).replace(/\n/g, ' | ') }))
console.log('S1.4 after Done', j(lgAfter))
row('S1.4 Logic Crew rest set to 13h', lgAfter.vconf === 780 ? 'RECORDED' : 'RECORDED', `box said "${lg.after}" (was "${lg.before}"), VCONF ${lgAfter.vconf}, button before Done "${lgBtn}", after "${lgAfter.btn}"`, 's1-04-logic-crewrest-13h-*.png')
if (STOPAT <= 4) { P.finish(w); await w.browser.close(); process.exit(0) }

/* ---- step 5: Tuesday still clean, nothing pending ---- */
const t5v = await look('view', 1, 's1-05-tue-view-after-13h')
const t5e = await look('edit', 1, 's1-05-tue-edit-after-13h')
const t5b = await look('board', 1, 's1-05-tue-board-after-13h')
for (const o of [t5v, t5e, t5b]) console.log('S1.5', brief(o))
const pend5 = [t5e.pending, t5b.pending].map(s => String(s || ''))
const okPend = !pend5.some(s => /pending/i.test(s)) && !/pending/i.test(String(t5v.dayHead)) && String(t5e.pending) === String(t3e.pending) && String(t5e.signed) === String(t3e.signed)
console.log('S1.5 pending compare: step3 edit', t3e.pending, '| step5 edit', t5e.pending, '| step5 board', t5b.pending, '| signed3', t3e.signed, '| signed5', t5e.signed)
row('S1.5 Tue published: no crew-rest warning / red ring for Vandal on View-only, Edit week, board; nothing pending', [t5v, t5e, t5b].every(noVandalRed) && okPend ? 'PASS' : 'FAIL', [t5v, t5e, t5b].map(brief).join(' || '), 's1-05-tue-*-after-13h.png')

/* ---- step 6: Thursday unpublished goes red at once ---- */
const t6e = await look('edit', 3, 's1-06-thu-edit-after-13h')
const t6b = await look('board', 3, 's1-06-thu-board-after-13h')
for (const o of [t6e, t6b]) console.log('S1.6', brief(o))
row('S1.6 Thu unpublished: red crew-rest warning for Vandal at once (Edit week, board)', t6e.restMine.length > 0 && t6b.restMine.length > 0 && t6b.rings.some(r => /^RED/.test(r)) ? 'PASS' : 'FAIL', [t6e, t6b].map(brief).join(' || '), 's1-06-thu-*-after-13h.png')
console.log('S1.6 Thu lines mine:', j(t6b.restMine))
if (STOPAT <= 6) { P.finish(w); await w.browser.close(); process.exit(0) }

/* ---- step 7: edit Tuesday (mission text) ---- */
await P.openBoard(w, 1)
await X.typeIn(w, `[data-bfld="ff:1.${tueGi}.0.msn"]`, 'BFM2')
const msn = await page.evaluate(g => window.DAYS[1].waves[g].formations[0].msn, tueGi)
console.log('S1.7 msn now', msn)
await L.closeBoard(page)
const t7e = await look('edit', 1, 's1-07-tue-edit-after-change')
const t7b = await look('board', 1, 's1-07-tue-board-after-change')
const t7v = await look('view', 1, 's1-07-tue-view-after-change')
for (const o of [t7e, t7b, t7v]) console.log('S1.7', brief(o))
row('S1.7 Tue edited (VL -> BFM2): RECORD', 'RECORDED', `msn now ${msn}. ` + [t7e, t7b, t7v].map(brief).join(' || '), 's1-07-tue-*-after-change.png')
if (STOPAT <= 7) { P.finish(w); await w.browser.close(); process.exit(0) }

/* ---- step 8: sign four, Publish AL1 ---- */
await P.openBoard(w, 1)
const sp2 = await X.signAndPublish(w, 1)
console.log('S1.8 sign/publish AL', j({ sg: sp2.sg, p: sp2.p, h: sp2.h }))
await L.closeBoard(page)
const t8v = await look('view', 1, 's1-08-tue-view-AL1')
const t8e = await look('edit', 1, 's1-08-tue-edit-AL1')
const t8b = await look('board', 1, 's1-08-tue-board-AL1')
for (const o of [t8v, t8e, t8b]) console.log('S1.8', brief(o))
row('S1.8 Tue published AL1: published face shows red crew-rest for Vandal on View-only', sp2.p.pressed && /AL1/.test(t8v.dayHead) && t8v.restMine.length > 0 ? 'PASS' : 'FAIL', `published: ${j(sp2.p)} ` + [t8v, t8e, t8b].map(brief).join(' || '), 's1-08-tue-view-AL1.png')
console.log('S1.8 Vandal rest line:', j(t8v.restMine))

/* ---- step 9: reload, sign in again ---- */
await page.reload()
await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
await L.login(page, 'a'); await sleep(600)
const t9v = await look('view', 1, 's1-09-tue-view-after-reload')
const th9v = await look('view', 3, 's1-09-thu-view-after-reload')
const th9e = await look('edit', 3, 's1-09-thu-edit-after-reload')
const t9e = await look('edit', 1, 's1-09-tue-edit-after-reload')
for (const o of [t9v, t9e, th9v, th9e]) console.log('S1.9', brief(o))
row('S1.9 after reload + sign in: Thu / Tue as in 6 / 8: RECORD', 'RECORDED', 'TueView: ' + brief(t9v) + ' || TueEdit: ' + brief(t9e) + ' || ThuView: ' + brief(th9v) + ' || ThuEdit: ' + brief(th9e), 's1-09-*.png')

/* ---- S3: the member's view (same world) ---- */
await page.evaluate(() => document.getElementById('logout').click()); await sleep(800)
await page.waitForSelector('#luser', { timeout: 8000 })
await L.login(page, 'u'); await sleep(800)
const who = await page.evaluate(() => (document.getElementById('roleBadge') || {}).innerText)
console.log('S3 signed in as', who)
async function memberLook(di, pic) {
  await L.go(page, 'viewsched'); await sleep(500)
  const s = await X.stripItems(page, '#vWeek', di)
  const rings = (await P.ringsOf(page, '#vWeek .day[data-day="' + di + '"]')).filter(r => r.who === NAME)
  const vh = await page.evaluate(i => { const e = document.querySelector(`#vWeek .day[data-day="${i}"] .day-head`); return e ? e.innerText.replace(/[\s ]+/g, ' ').trim() : 'NO HEAD' }, di)
  await P.shotPage(page, pic)
  return `dayHead="${vh}" head="${s.head}" restMine=${j(restMine(s.items))} allRest=${j(restAll(s.items).map(t => t.slice(0, 70)))} rings=${j(rings.map(r => P.sevWord(r) + ':' + r.cls))}`
}
const m1 = await memberLook(1, 's3-tue-view-member')
const m3 = await memberLook(3, 's3-thu-view-member')
console.log('S3 Tue', m1); console.log('S3 Thu', m3)
row('S3 member (' + who + ') View-only Tue: RECORD', 'RECORDED', m1, 's3-tue-view-member.png')
row('S3 member View-only Thu: RECORD', 'RECORDED', m3, 's3-thu-view-member.png')
P.finish(w, { who })
await w.browser.close()
