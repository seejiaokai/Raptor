/* walker TO — survey: what Monday's and Tuesday's waves look like in the DOM (read only, no edits) */
import { writeFileSync } from 'node:fs'
import * as B from './wh-b-lib.mjs'
const { L, W } = B
const out = {}
const w = await B.world()
const p = w.p
try {
  await B.toEdit(p)
  out.data = await p.evaluate(() => [0, 1].map(di => ({ di, date: window.DAYS[di].date, waves: window.DAYS[di].waves.map((g, gi) => ({ gi, label: g.label, intimes: g.intimes, keys: Object.keys(g), forms: g.formations.map((f, li) => ({ li, cs: f.cs, msn: f.msn, br: f.br, to: f.to, ld: f.ld, cx: f.cx, keys: Object.keys(f), ac: f.aircraft.map(a => ({ p: a.p, w: a.w, rmks: a.rmks, cx: a.cx })) })) })) })))
  /* the week's first wave on Monday: its outerHTML (trimmed) */
  out.weekWave0 = await p.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="0"]'); const g = d.querySelector('.go, .wave, [data-wave]'); return g ? g.outerHTML.slice(0, 6000) : d.innerHTML.slice(0, 6000) })
  out.weekAttrs = await p.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="0"]'); const s = new Set(); d.querySelectorAll('*').forEach(e => { for (const a of e.attributes) if (a.name.startsWith('data-')) s.add(a.name) }); return [...s].sort() })
  out.weekButtons = await p.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] button')].map(b => ({ t: b.innerText.trim().slice(0, 40), a: [...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(' '), title: b.title })).filter((x, i, a) => a.findIndex(y => y.t === x.t && y.a.split('=')[0] === x.a.split('=')[0]) === i))
  out.itWeek = await p.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] [data-itline], #eWeek .day[data-day="0"] [data-txt^="it:"]')].map(e => ({ tag: e.tagName, key: e.dataset.itline || e.dataset.txt, text: e.innerText || e.value, ce: e.getAttribute('contenteditable'), parent: e.parentElement.className, html: e.parentElement.outerHTML.slice(0, 700) })))
  await B.pic(p, 'survey-week-mon')
  await W.boardOn(p, 0)
  out.boardAttrs = await p.evaluate(() => { const d = document.querySelector('#schedBoard'); const s = new Set(); d.querySelectorAll('*').forEach(e => { for (const a of e.attributes) if (a.name.startsWith('data-')) s.add(a.name) }); return [...s].sort() })
  out.boardButtons = await p.evaluate(() => [...document.querySelectorAll('#schedBoard button')].map(b => ({ t: b.innerText.trim().slice(0, 40), id: b.id, a: [...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(' '), title: (b.title || '').slice(0, 80) })).filter((x, i, a) => a.findIndex(y => y.t === x.t && y.a.split('=')[0] === x.a.split('=')[0]) === i))
  out.itBoard = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-itline]')].map(e => ({ tag: e.tagName, key: e.dataset.itline, text: e.innerText || e.value, html: e.parentElement.parentElement.outerHTML.slice(0, 1500) })))
  out.boardWave0 = await p.evaluate(() => { const g = document.querySelector('#sbBoard .sb-wave'); return g ? g.outerHTML.slice(0, 9000) : 'no .sb-wave' })
  await B.pic(p, 'survey-board-mon')
  await W.boardOff(p)
  await L.go(p, 'logic')
  out.logic = await p.evaluate(() => { const pg = document.querySelector('#page-logic') || document.body; return { text: pg.innerText.slice(0, 5000), inputs: [...pg.querySelectorAll('input, select, textarea, button')].map(e => ({ tag: e.tagName, id: e.id, type: e.type, v: e.value, t: (e.innerText || '').trim().slice(0, 40), dis: e.disabled, a: [...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(' '), near: (e.closest('label, .lg-row, tr, .row, li') || e.parentElement).innerText.replace(/\s+/g, ' ').slice(0, 120) })) } })
  await B.pic(p, 'survey-logic', { fullPage: true })
} catch (e) { out.err = String(e && e.stack || e) }
out.errors = w.errors
writeFileSync(process.env.STK_DUMP, JSON.stringify(out, null, 1))
await w.browser.close()
console.log('done', out.err || '')
