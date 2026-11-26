// swl-w1C-probe — walker C learns the present screen before the walk (chat 203, 26 Nov 26): the bundle served, the demo's
// SANS men, each day's warning list, the Logic page, Admin → Users, View-only Sched. Reads only.
//   SWLC_RUN=probe SZ=d node scripts/handpass/swl-w1C-probe.mjs   (from raptor-port/)
import './swl-w1C-env.mjs'
import { writeFileSync } from 'node:fs'
const X = await import('./sss-w1A-lib.mjs')
const { Z, L, sleep, J, run } = X
const SZ = process.env.SZ || 'd'
console.log(`VERSION swl-w1C-probe 1 · ${SZ} · bundle ${process.env.W2_URL} · out ${X.OUT}`)
const dump = {}
await run('PR', SZ, async (p, W) => {
  dump.bundle = await p.evaluate(() => [...document.querySelectorAll('script[src]')].map(s => s.getAttribute('src')))
  W.rec('bundle', 'the page serves index-ZgGJLqIy.js', dump.bundle.some(s => s.includes('index-ZgGJLqIy.js')), J(dump.bundle))
  dump.people = await p.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).filter(([, q]) => q.san || q.sanFrom).map(([id, q]) => [id, { cs: q.cs, seat: q.seat, san: q.san, sanFrom: q.sanFrom || null }])))
  dump.ranger = await p.evaluate(() => { const q = window.PEOPLE.bane; return { cs: q.cs, seat: q.seat, san: q.san, sanFrom: q.sanFrom || null } })
  dump.week = await L.weekOf(p)
  dump.sansInputs = await p.evaluate(() => (window.INPUTS || []).filter(r => /SANS/i.test(String(r.type))).map(r => ({ iid: r.iid, people: JSON.stringify(r.people || r.person || r.who).slice(0, 80), date: r.date, endDate: r.endDate || null, sans: r.sans, allday: r.allday, s: r.s, e: r.e })))
  // Edit Schedule's week: each day's issue bar words
  await L.go(p, 'editsched')
  dump.weekBars = await p.evaluate(() => [...document.querySelectorAll('#eWeek [data-sbday]')].map(d => ({ di: d.dataset.sbday, cls: String(d.className).slice(0, 80), txt: (d.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80) })))
  dump.weekIssue = await p.evaluate(() => [...document.querySelectorAll('#eWeek *')].filter(e => !e.children.length && /issue|No issues|conflict/i.test(e.textContent || '') && e.getBoundingClientRect().width > 0).map(e => ({ tag: e.tagName, cls: String(e.className).slice(0, 60), txt: (e.textContent || '').trim().slice(0, 60), par: String(e.parentElement.className).slice(0, 60) })).slice(0, 40))
  await W.pic(p, 'editsched')
  dump.days = []
  for (let di = 0; di < 7; di++) {
    const w = await Z.warns(p, W, di, 'd' + di)
    dump.days.push({ di, head: w.head, rows: w.rows })
  }
  await L.closeBoard(p, W)
  await L.go(p, 'logic'); await sleep(800)
  dump.logic = await p.evaluate(() => { const t = (document.querySelector('#pg-logic, [data-page="logic"], main') || document.body).innerText; return t.split('\n').filter(x => /SANS/.test(x)) })
  dump.logicCtl = await p.evaluate(() => [...document.querySelectorAll('*')].filter(e => /SANS availability/.test(e.textContent || '') && e.children.length < 6 && e.getBoundingClientRect().width > 0).map(e => ({ tag: e.tagName, id: e.id, cls: String(e.className).slice(0, 60), html: e.outerHTML.slice(0, 400) })).slice(0, 6))
  await W.pic(p, 'logic')
  await L.go(p, 'admin'); await sleep(800)
  dump.admin = await p.evaluate(() => document.body.innerText.split('\n').filter(x => /Ranger|SANS|Users|tab/i.test(x)).slice(0, 40))
  dump.adminTabs = await p.evaluate(() => [...document.querySelectorAll('button, [role="tab"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.id || '') + ':' + (e.textContent || '').trim().slice(0, 30)).slice(0, 60))
  await W.pic(p, 'admin')
  await L.go(p, 'viewsched'); await sleep(800)
  dump.view = await p.evaluate(() => [...document.querySelectorAll('*')].filter(e => !e.children.length && /SANS|issue/i.test(e.textContent || '') && e.getBoundingClientRect().width > 0).map(e => ({ tag: e.tagName, id: e.id, cls: String(e.className).slice(0, 60), txt: (e.textContent || '').trim().slice(0, 140) })).slice(0, 30))
  await W.pic(p, 'viewsched')
}, '2026-07-15T09:00:00')
writeFileSync(`D:/raptor-work/c203-walk/C/probe-${SZ}.json`, JSON.stringify(dump, null, 1))
console.log('DONE probe')
process.exit(0)
