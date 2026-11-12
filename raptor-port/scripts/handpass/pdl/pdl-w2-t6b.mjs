/* pdl-w2-t6 v2 — T6 a published version look (desktop). Ranger: Mon 27 Jul lands 19:00, Tue 28 Jul VL 12:00-13:00, B blank. */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/w2/t6-run2')
console.log('pdl-w2-t6 v2', process.env.HP_SHOTS)
const P = await import('./pdl-w2-lib.mjs')
const { X, L, sleep, check, note, pic, W2 } = P
const w = await X.world('desktop')
const { page } = w
await P.toWeek(page, '2026-07-27')
const A = w.ID('Ranger')
await L.board(page, 0); await sleep(400)
await P.flight(w, 0, { cs: 'RU', to: '1700', ld: '1900', who: A })
await L.closeBoard(page)
await L.board(page, 1); await sleep(400)
await P.flight(w, 1, { cs: 'VL', to: '1200', ld: '1300', who: A })
await L.closeBoard(page)
console.log('fixture', JSON.stringify(await page.evaluate(() => [0, 1].map(d => { const f = window.DAYS[d].waves[0].formations[0]; return `${d}: ${f.cs} ${f.to}-${f.ld} p=${f.aircraft[0].p} B=${JSON.stringify(f.br)}` }))))
const s0 = await P.snapshot(w, 1, A, 't6-0-tue-crewrest12-draft')
const sp = await X.signAndPublish(w, 1)
console.log('publish ORIG', JSON.stringify({ p: sp.p, tag: sp.h.tag }))
await L.closeBoard(page)
const s1 = await P.snapshot(w, 1, A, 't6-1-tue-orig-published-crewrest12')
const lg = await P.setLogic(w, 'crewRest', '13h')
console.log('crewRest', JSON.stringify(lg))
await pic(page, 't6-2-logic-crewrest-13h')
const s2 = await P.snapshot(w, 1, A, 't6-3-tue-after-13h-before-edit')
/* an edit, then Publish AL1 */
await L.board(page, 1); await sleep(400)
await X.typeIn(w, '[data-bfld="ff:1.0.0.ld"]', '1310')
const s3 = await P.snapshot(w, 1, A, 't6-4-tue-edited-before-AL1')
const sp2 = await X.signAndPublish(w, 1)
console.log('publish AL', JSON.stringify({ p: sp2.p, tag: sp2.h.tag }))
check('T6.0 Tuesday is now AL1', /AL1/.test(sp2.h.tag), `tag "${sp2.h.tag}" pressed ${JSON.stringify(sp2.p)}`)
await L.closeBoard(page)
const s4 = await P.snapshot(w, 1, A, 't6-5-tue-AL1-live')
/* the 👁 look at the ORIGINAL from Edit Schedule's version selector, and at AL1 */
/* the 👁 look at an issued version from the version selector, on the week (Edit Schedule) or on the board */
async function look(re, tag, surface) {
  await L.closeBoard(page)
  if (surface === 'board') { await L.board(page, 1); await sleep(600) }
  else { await L.go(page, 'editsched'); await sleep(600); await page.locator('#eWeek .day[data-day="1"]').first().evaluate(e => e.scrollIntoView({ block: 'start', inline: 'start' })); await sleep(300) }
  await L.planMenuItems(page, 1)
  const rows = await page.evaluate(() => [...document.querySelectorAll('.wavemenu [data-planpv]')].map(e => e.innerText.replace(/\s+/g, ' ').trim()))
  await pic(page, `${tag}-${surface}-menu`)
  const ok = await L.menuLook(page, re)
  if (!ok) { await L.menuClose(page); console.log('LOOK FAILED', tag, rows); return { ok: false, rows } }
  await sleep(700)
  const bar = await L.pvBar(page, 1)
  let items, head
  if (surface === 'board') { const bw = await X.boardWarn(page, w); items = bw.items; head = bw.head }
  else { const st = await X.stripItems(page, '#eWeek', 1); items = st.items; head = st.head }
  const ring = await W2.ring(page, A, surface === 'board' ? '#schedBoard' : '#eWeek .day[data-day="1"]')
  await pic(page, `${tag}-${surface}-look`)
  console.log('LOOK', tag, surface, JSON.stringify({ rows, bar, head, items, ring: ring.map(r => r.where + ':' + r.cls) }))
  await L.pvTap(page, 1, 'data-golive')
  await sleep(500)
  return { ok: true, rows, bar, head, items, ring, surface }
}
const lo = await look(/Original/, 't6-6-look-original', 'edit')
const la = await look(/AL1/, 't6-6-look-al1', 'edit')
const lob = await look(/Original/, 't6-6-look-original', 'board')
const lab = await look(/AL1/, 't6-6-look-al1', 'board')
await L.closeBoard(page)
/* the same two versions in View-only Sched's own picker */
async function viewLook(val, tag) {
  await L.go(page, 'viewsched'); await sleep(600)
  const opts = await page.evaluate(() => { const s = document.querySelector('#vWeek select[data-vwork="1"], #vWeek select[data-dver="1"]'); return s ? [...s.options].map(o => o.value + '=' + o.text) : null })
  const ok = await L.viewPick(page, 1, val)
  await sleep(500)
  const st = await X.stripItems(page, '#vWeek', 1)
  const bar = await page.evaluate(() => [...document.querySelectorAll('#vWeek .day[data-day="1"] .dprev-bar')].map(b => b.innerText.replace(/\s+/g, ' ').trim()))
  await pic(page, tag)
  console.log('VIEWLOOK', tag, JSON.stringify({ opts, ok, head: st.head, items: st.items, bar }))
  return { opts, ok, head: st.head, items: st.items, bar }
}
const vOpts = await page.evaluate(() => 0)
await L.go(page, 'viewsched'); await sleep(600)
const optList = await page.evaluate(() => { const s = document.querySelector('#vWeek select[data-vwork="1"], #vWeek select[data-dver="1"]'); return s ? [...s.options].map(o => o.value + '=' + o.text) : [] })
console.log('view options', JSON.stringify(optList))
const vo = optList.find(o => /Original/.test(o)), va = optList.find(o => /AL1/.test(o))
const vlo = vo ? await viewLook(vo.split('=')[0], 't6-7-viewonly-original') : null
const vla = va ? await viewLook(va.split('=')[0], 't6-7-viewonly-al1') : null

const crit = items => items.filter(t => /rest/i.test(t))
note('T6.1 warnings per stage for Ranger (RECORD)', `draft @12h: edit ${JSON.stringify(s0.edit.items)} | ORIG published @12h: ${JSON.stringify(s1.edit.items)} | after 13h (ORIG, before edit): ${JSON.stringify(s2.edit.items)} | edited, before AL1: ${JSON.stringify(s3.edit.items)} | AL1 live: ${JSON.stringify(s4.edit.items)}`)
note('T6.2 the 👁 look at ORIGINAL from Edit Schedule (RECORD)', lo.ok ? `bar ${JSON.stringify(lo.bar)} | head "${lo.head}" | items ${JSON.stringify(lo.items)} | rings ${JSON.stringify(lo.ring.map(r => r.where + ':' + (r.warn ? 'warn' : 'plain')))}` : 'could not open: ' + JSON.stringify(lo.rows), 't6-6-look-original-edit-look.png')
note('T6.3 the 👁 look at AL1 from Edit Schedule (RECORD)', la.ok ? `bar ${JSON.stringify(la.bar)} | head "${la.head}" | items ${JSON.stringify(la.items)} | rings ${JSON.stringify(la.ring.map(r => r.where + ':' + (r.warn ? 'warn' : 'plain')))}` : 'could not open: ' + JSON.stringify(la.rows), 't6-6-look-al1-edit-look.png')
if (lo.ok && la.ok) {
  check('T6.4 the ORIGINAL look shows NO crew-rest line (clean) (host reading of D2005)', crit(lo.items).length === 0, `Original look items ${JSON.stringify(lo.items)}`, 't6-6-look-original-edit-look.png')
  check('T6.5 the AL1 look shows the crew-rest breach (13h)', crit(la.items).length > 0, `AL1 look items ${JSON.stringify(la.items)}`, 't6-6-look-al1-edit-look.png')
}
if (vlo && vla) {
  check('T6.6 View-only picker: Original shows no crew-rest line', crit(vlo.items).length === 0, JSON.stringify(vlo.items), 't6-7-viewonly-original.png')
  check('T6.7 View-only picker: AL1 shows the crew-rest breach', crit(vla.items).length > 0, JSON.stringify(vla.items), 't6-7-viewonly-al1.png')
}
note('T6.8 the same looks on the board (RECORD)', `Original: bar ${JSON.stringify(lob.bar && lob.bar.text)} items ${JSON.stringify(lob.items)} rings ${JSON.stringify(lob.ring && lob.ring.map(r => r.cls))} || AL1: items ${JSON.stringify(lab.items)} rings ${JSON.stringify(lab.ring && lab.ring.map(r => r.cls))}`)
P.finish(w, { s0, s1, s2, s3, s4, lo, la, lob, lab, vlo, vla })
await w.browser.close()
