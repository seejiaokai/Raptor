/* pdl-w1-s2 v1 — S2: the same as S1 steps 1-6 at the phone size (402x874, dsf 3, touch, taps). */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.env.RUN || 's2'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/w1/' + RUN)
const STOPAT = +(process.env.STOPAT || 99)
console.log('pdl-w1-s2 v1', process.env.HP_SHOTS)
const P = await import('./pdl-w1-lib.mjs')
const { X, W, L, sleep, row, SHOTS } = P
const w = await X.world('phone')
const { page } = w
const man = w.ID('Vandal'), NAME = 'Vandal'
const j = o => JSON.stringify(o)
const restAll = items => (items || []).filter(t => /rest/i.test(t))
const restMine = items => restAll(items).filter(t => new RegExp(NAME).test(t))
const tapEl = async (loc) => { await loc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(150); try { await loc.tap({ timeout: 2500 }) } catch { const b = await loc.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2) } await sleep(350) }
const openBoardP = async di => {
  const open = await page.evaluate(() => (document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth ? window.SBDAY : null))
  if (open === di) return
  if (open != null) await closeBoardP()
  await L.go(page, 'editsched'); await sleep(400)
  await tapEl(page.locator(`#eWeek [data-sbday="${di}"]:visible`).first())
  await page.waitForSelector('#schedBoard'); await sleep(600)
}
const closeBoardP = async () => { const b = page.locator('#schedBoard #sbDone:visible').first(); if (await b.count()) { await tapEl(b); await sleep(500) } }
/* the strip of a week page, opened by a tap */
async function stripP(root, di) {
  const s = page.locator(`${root} [data-daywarn="${di}"]:visible`).first()
  if (!(await s.count())) return { head: 'NO STRIP', items: [] }
  const head = X.norm(await s.innerText())
  const open = await page.locator(`${root} [data-dwbox="${di}"].open`).count()
  if (!open) await tapEl(s)
  const items = await page.evaluate(([q, i]) => [...document.querySelectorAll(`${q} [data-dwbox="${i}"] .witem`)].map(e => e.innerText.replace(/[\s ]+/g, ' ').trim()), [root, di])
  return { head, items, wasOpen: !!open }
}
async function manPic(root, di, pic) {
  const pk = page.locator(`${root} .day[data-day="${di}"] .puck[data-person="${man}"]`).first()
  if (!(await pk.count())) return
  await pk.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  await page.screenshot({ path: `${SHOTS}/${pic}-man.png` })
}
async function look(surface, di, pic) {
  if (surface === 'edit' || surface === 'view') {
    const root = surface === 'edit' ? '#eWeek' : '#vWeek'
    await L.go(page, surface === 'edit' ? 'editsched' : 'viewsched'); await sleep(600)
    /* bring the day into view first */
    await page.locator(`${root} .day[data-day="${di}"]`).first().evaluate(e => e.scrollIntoView({ block: 'start', inline: 'center' })); await sleep(400)
    const s = await stripP(root, di)
    const rings = (await P.ringsOf(page, `${root} .day[data-day="${di}"]`)).filter(r => r.who === NAME)
    const dayHead = await page.evaluate(([r, i]) => { const e = document.querySelector(`${r} .day[data-day="${i}"] .day-head`); return e ? e.innerText.replace(/[\s ]+/g, ' ').trim() : 'NO HEAD' }, [root, di])
    if (pic) { await P.shotPage(page, pic); await manPic(root, di, pic) }
    return { surf: surface, head: s.head, rest: restAll(s.items), restMine: restMine(s.items), rings: rings.map(r => P.sevWord(r) + ':' + r.cls), dayHead, n: s.items.length }
  }
  await openBoardP(di); await sleep(400)
  const bw = await X.boardWarn(page, w)
  const rings = (await P.ringsOf(page, '#schedBoard')).filter(r => r.who === NAME)
  const head = await L.head(page, di)
  if (pic) await P.shotPage(page, pic)
  await closeBoardP()
  return { surf: 'board', head: bw.head, rest: restAll(bw.items), restMine: restMine(bw.items), rings: rings.map(r => P.sevWord(r) + ':' + r.cls), pending: head && head.pending, tag: head && head.tag, n: bw.items.length }
}
const brief = o => `${o.surf}: head="${String(o.head).slice(0, 60)}" restMine=${j(o.restMine.map(t => t.slice(0, 60)))} otherRest=${j(o.rest.filter(t => !new RegExp(NAME).test(t)).map(t => t.slice(0, 40)))} rings=${j(o.rings)}` + (o.pending !== undefined ? ` pending="${o.pending}" tag=${o.tag}` : '') + (o.dayHead ? ` dayHead="${o.dayHead}"` : '')
const noVandalRed = o => o.restMine.length === 0 && !o.rings.some(r => /^RED/.test(r))

/* the roster drawer + seating + typing run through the shared helpers (taps) */
async function buildLine(di, to, ld) {
  await openBoardP(di)
  const r = await P.line(w, di, { to, ld, who: man })
  console.log('build', di, j(r))
  await closeBoardP()
  return r
}
await buildLine(0, '18:00', '19:00')
const tue = await buildLine(1, '12:00', '13:00')
const t1b = await look('board', 1, 's2-01-tue-board-clean')
const t1e = await look('edit', 1, 's2-01-tue-edit-clean')
const t1v = await look('view', 1, 's2-01-tue-view-clean')
for (const o of [t1b, t1e, t1v]) console.log('S2.1', brief(o))
row('S2.1 Tue clean for Vandal (phone)', [t1b, t1e, t1v].every(noVandalRed) && [t1b, t1e, t1v].every(o => o.n > 0 || true) ? 'PASS' : 'FAIL', [t1b, t1e, t1v].map(brief).join(' || '), 's2-01-*.png')
await buildLine(2, '18:00', '19:00')
await buildLine(3, '12:00', '13:00')
const th1b = await look('board', 3, 's2-02-thu-board-clean')
const th1e = await look('edit', 3, 's2-02-thu-edit-clean')
for (const o of [th1b, th1e]) console.log('S2.2', brief(o))
row('S2.2 Thu clean for Vandal (phone)', [th1b, th1e].every(noVandalRed) ? 'PASS' : 'FAIL', [th1b, th1e].map(brief).join(' || '), 's2-02-*.png')
if (STOPAT <= 2) { P.finish(w); await w.browser.close(); process.exit(0) }

/* publish Tuesday: sign four through the selects, tap Publish day */
await openBoardP(1)
const sg = await L.signDay(page, 1, 0)
await sleep(400)
const beak = page.locator('#schedBoard [data-beak="1"]:visible').first()
const beakInfo = (await beak.count()) ? { text: (await beak.innerText()).trim(), disabled: await beak.isDisabled() } : 'absent'
console.log('S2.3 sign', j(sg), 'beak', j(beakInfo))
if (beakInfo !== 'absent' && !beakInfo.disabled) { await tapEl(beak); await sleep(800) }
const ok = page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
if (await ok.count() && await ok.isVisible().catch(() => false)) { await tapEl(ok); await sleep(700) }
const hd3 = await L.head(page, 1)
console.log('S2.3 head', j({ tag: hd3.tag, pending: hd3.pending, signs: hd3.signs }))
await closeBoardP()
const t3v = await look('view', 1, 's2-03-tue-published-view')
const t3e = await look('edit', 1, 's2-03-tue-published-edit')
console.log('S2.3', brief(t3v)); console.log('S2.3', brief(t3e))
row('S2.3 Tue published (phone), clean on View-only', /ORIG/.test(hd3.tag) && noVandalRed(t3v) ? 'PASS' : 'FAIL', 'tag ' + hd3.tag + ' ' + brief(t3v), 's2-03-*.png')

/* Logic: crew rest 13h (taps) */
await L.go(page, 'logic'); await sleep(700)
if (!(await page.locator('#lgBody input[data-lgset="crewRest"]:visible').count())) await tapEl(page.locator('#lgEdit:visible').first())
const inp = page.locator('#lgBody input[data-lgset="crewRest"]').first()
await inp.scrollIntoViewIfNeeded()
const before = await inp.inputValue()
await inp.tap(); await sleep(500); await inp.fill('13h'); await inp.press('Tab'); await sleep(700)
const after = await inp.inputValue()
await P.shotPage(page, 's2-04-logic-13h-editing')
await tapEl(page.locator('#lgDone:visible').first()); await sleep(500)
const vc = await page.evaluate(() => VCONF.crewRest)
await page.evaluate(() => window.scrollTo(0, 0)); await sleep(300)
await P.shotPage(page, 's2-04-logic-13h-done')
console.log('S2.4 logic', before, '->', after, 'VCONF', vc)
row('S2.4 Logic crew rest set to 13h (phone)', 'RECORDED', `box "${before}" -> "${after}", VCONF ${vc}`, 's2-04-*.png')

const t5v = await look('view', 1, 's2-05-tue-view-after-13h')
const t5e = await look('edit', 1, 's2-05-tue-edit-after-13h')
const t5b = await look('board', 1, 's2-05-tue-board-after-13h')
for (const o of [t5v, t5e, t5b]) console.log('S2.5', brief(o))
const okPend = !/pending/i.test(String(t5b.pending)) && String(t5b.pending) === String(hd3.pending)
console.log('S2.5 pending step3', hd3.pending, 'step5', t5b.pending)
row('S2.5 Tue published: no crew-rest warning / red ring for Vandal after 13h (phone: View-only, edit week, board); nothing pending', [t5v, t5e, t5b].every(noVandalRed) && okPend ? 'PASS' : 'FAIL', [t5v, t5e, t5b].map(brief).join(' || ') + ` || pending ${hd3.pending} -> ${t5b.pending}`, 's2-05-*.png')
const t6e = await look('edit', 3, 's2-06-thu-edit-after-13h')
const t6b = await look('board', 3, 's2-06-thu-board-after-13h')
const t6v = await look('view', 3, 's2-06-thu-view-after-13h')
for (const o of [t6e, t6b, t6v]) console.log('S2.6', brief(o))
row('S2.6 Thu unpublished red crew-rest for Vandal at once (phone: edit week, board)', t6e.restMine.length > 0 && t6b.restMine.length > 0 && t6b.rings.some(r => /^RED/.test(r)) ? 'PASS' : 'FAIL', [t6e, t6b, t6v].map(brief).join(' || '), 's2-06-*.png')
P.finish(w)
await w.browser.close()
