/* pdl-w1-s4 v1 — S4 the lowering direction (desktop): Mon lands 20:00 (day ends 22:00), Tue VL 12:00 B blank -> 11h40 rest, red at 12h.
   Publish Tue WITH the warning; Crew rest -> 11h; RECORD the published face; unpublished Wed/Thu clear at once. Extra: amend Tue, publish AL1, RECORD. */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.env.RUN || 's4'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/w1/' + RUN)
console.log('pdl-w1-s4 v1', process.env.HP_SHOTS)
const P = await import('./pdl-w1-lib.mjs')
const { X, W, L, sleep, row, SHOTS } = P
const w = await X.world('desktop')
const { page } = w
const man = w.ID('Vandal'), NAME = 'Vandal'
const j = o => JSON.stringify(o)
const restAll = items => (items || []).filter(t => /rest/i.test(t))
const restMine = items => restAll(items).filter(t => new RegExp(NAME).test(t))
async function manPic(root, di, pic) {
  const pk = page.locator(`${root} .day[data-day="${di}"] .puck[data-person="${man}"]`).first()
  if (!(await pk.count())) return
  await pk.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  await page.screenshot({ path: `${SHOTS}/${pic}-man.png` })
}
async function look(surface, di, pic) {
  if (surface === 'edit' || surface === 'view') {
    const root = surface === 'edit' ? '#eWeek' : '#vWeek'
    await L.go(page, surface === 'edit' ? 'editsched' : 'viewsched'); await sleep(500)
    const s = await X.stripItems(page, root, di)
    const rings = (await P.ringsOf(page, `${root} .day[data-day="${di}"]`)).filter(r => r.who === NAME)
    const dayHead = await page.evaluate(([r, i]) => { const e = document.querySelector(`${r} .day[data-day="${i}"] .day-head`); return e ? e.innerText.replace(/[\s ]+/g, ' ').trim() : 'NO HEAD' }, [root, di])
    const hd = surface === 'edit' ? await L.head(page, di) : null
    if (pic) { await P.shotPage(page, pic); await manPic(root, di, pic) }
    return { surf: surface, head: s.head, rest: restAll(s.items), restMine: restMine(s.items), rings: rings.map(r => P.sevWord(r) + ':' + r.cls), dayHead, pending: hd && hd.pending, tag: hd && hd.tag }
  }
  await P.openBoard(w, di); await sleep(400)
  const wl = await W.warnList(page)
  const lines = wl.lines.map(l => l.text)
  const rings = (await P.ringsOf(page, '#schedBoard')).filter(r => r.who === NAME)
  const head = await L.head(page, di)
  if (pic) await P.shotPage(page, pic)
  await L.closeBoard(page)
  return { surf: 'board', head: wl.head, rest: restAll(lines), restMine: restMine(lines), rings: rings.map(r => P.sevWord(r) + ':' + r.cls), pending: head && head.pending, tag: head && head.tag }
}
const brief = o => `${o.surf}: head="${o.head}" restMine=${j(o.restMine.map(t => t.slice(0, 110)))} otherRest=${j(o.rest.filter(t => !new RegExp(NAME).test(t)).map(t => t.slice(0, 30)))} rings=${j(o.rings)}` + (o.pending !== undefined && o.pending !== null ? ` pending="${o.pending}" tag=${o.tag}` : '') + (o.dayHead ? ` dayHead="${o.dayHead}"` : '')
const hasRed = o => o.restMine.length > 0 && o.rings.some(r => /^RED/.test(r))

await P.openBoard(w, 0); console.log('Mon', j(await P.line(w, 0, { to: '19:00', ld: '20:00', who: man }))); await L.closeBoard(page)
await P.openBoard(w, 1); console.log('Tue', j(await P.line(w, 1, { to: '12:00', ld: '13:00', who: man }))); await L.closeBoard(page)
await P.openBoard(w, 2); console.log('Wed', j(await P.line(w, 2, { to: '19:00', ld: '20:00', who: man }))); await L.closeBoard(page)
await P.openBoard(w, 3); console.log('Thu', j(await P.line(w, 3, { to: '12:00', ld: '13:00', who: man }))); await L.closeBoard(page)
const a1e = await look('edit', 1, 's4-01-tue-edit-before'), a1b = await look('board', 1, 's4-01-tue-board-before')
const a2e = await look('edit', 3, 's4-01-thu-edit-before'), a2b = await look('board', 3, 's4-01-thu-board-before')
for (const o of [a1e, a1b, a2e, a2b]) console.log('S4.1', brief(o))
row('S4.1 premise: Tue and Thu (12:00, B blank, previous day ends 22:00) show a red crew-rest for Vandal at 12h', hasRed(a1e) && hasRed(a1b) && hasRed(a2e) && hasRed(a2b) ? 'PASS' : 'FAIL', [a1e, a1b, a2e, a2b].map(brief).join(' || '), 's4-01-*.png')

await P.openBoard(w, 1)
const sp = await X.signAndPublish(w, 1)
console.log('S4.2 publish', j({ sg: sp.sg, p: sp.p, tag: sp.h && sp.h.tag }))
await L.closeBoard(page)
const p2v = await look('view', 1, 's4-02-tue-published-view-with-warning')
console.log('S4.2', brief(p2v))
row('S4.2 Tue published WITH the red warning (12h)', /ORIG/.test(p2v.dayHead) && p2v.restMine.length > 0 ? 'PASS' : 'FAIL', `published ${j(sp.p)} ` + brief(p2v), 's4-02-tue-published-view-with-warning.png')

/* Crew rest -> 11h */
await L.go(page, 'logic'); await sleep(600)
if (!(await page.locator('#lgBody input[data-lgset="crewRest"]:visible').count())) { await X.press(w, '#lgEdit', { scope: 'page' }); await sleep(500) }
const inp = page.locator('#lgBody input[data-lgset="crewRest"]').first()
await inp.scrollIntoViewIfNeeded()
const was = await inp.inputValue()
await inp.fill('11h'); await inp.press('Tab'); await sleep(600)
const now = await inp.inputValue()
await P.shotPage(page, 's4-03-logic-11h-editing')
await X.press(w, '#lgDone', { scope: 'page' }); await sleep(500)
const vc = await page.evaluate(() => VCONF.crewRest)
console.log('S4.3 logic', was, '->', now, 'VCONF', vc)
row('S4.3 Logic Crew rest set to 11h', 'RECORDED', `box "${was}" -> "${now}", VCONF ${vc}`, 's4-03-logic-11h-editing.png')

const c1v = await look('view', 1, 's4-04-tue-view-after-11h')
const c1e = await look('edit', 1, 's4-04-tue-edit-after-11h')
const c1b = await look('board', 1, 's4-04-tue-board-after-11h')
for (const o of [c1v, c1e, c1b]) console.log('S4.4', brief(o))
row('S4.4 Tue published face after Crew rest 11h: RECORD (host reading: the breach stays until the next amendment)', 'RECORDED', 'VIEW-ONLY: ' + brief(c1v) + ' || EDIT WEEK: ' + brief(c1e) + ' || BOARD: ' + brief(c1b), 's4-04-tue-*-after-11h.png')
const c3e = await look('edit', 3, 's4-05-thu-edit-after-11h')
const c3b = await look('board', 3, 's4-05-thu-board-after-11h')
for (const o of [c3e, c3b]) console.log('S4.5', brief(o))
row('S4.5 Thu unpublished clears at once after Crew rest 11h (Edit week, board)', c3e.restMine.length === 0 && c3b.restMine.length === 0 && !c3b.rings.some(r => /^RED/.test(r)) && !c3e.rings.some(r => /^RED/.test(r)) ? 'PASS' : 'FAIL', [c3e, c3b].map(brief).join(' || '), 's4-05-thu-*.png')
const c2e = await look('edit', 2, 's4-05-wed-edit-after-11h')

/* extra: amend Tue, publish AL1 -> face clears? */
await P.openBoard(w, 1)
const gi = await page.evaluate(() => window.DAYS[1].waves.length - 1)
await X.typeIn(w, `[data-bfld="ff:1.${gi}.0.msn"]`, 'BFM2')
await L.closeBoard(page)
const e1e = await look('edit', 1, 's4-06-tue-edit-after-edit')
console.log('S4.6', brief(e1e))
await P.openBoard(w, 1)
const sp2 = await X.signAndPublish(w, 1)
await L.closeBoard(page)
const e2v = await look('view', 1, 's4-07-tue-view-AL1')
console.log('S4.7', j(sp2.p), brief(e2v))
row('S4.6 Tue edited (BFM2) on the working copy: RECORD', 'RECORDED', brief(e1e), 's4-06-tue-edit-after-edit.png')
row('S4.7 Tue amended and published AL1 under 11h: RECORD (expected: Vandal breach gone)', 'RECORDED', `published ${j(sp2.p)} ` + brief(e2v), 's4-07-tue-view-AL1.png')
P.finish(w)
await w.browser.close()
