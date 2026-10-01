/* walker C — scenario 44: what must NOT change when warnings are hidden and flagged again.
   The Logic page's "fired N×" (still counts a hidden one); the printed schedule (the print frame the PDF button builds)
   and the CSV (the file the CSV button hands the browser) — no warning before or after; the Leave War page, its OIL
   tracker and the Leave War's saved rows — as they were.
   Setup (so there is earned OIL to compare): Sunday 19 Jul signed and published (Dash's weekend duty earns).
   The two export buttons are only read: the print frame's own document, and the CSV text as the page built it. */
import * as C from './wh-c-lib.mjs'
const { H } = C, { L, W } = H
const { browser, p, errors } = await H.world({ who: 'a' })
const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(16) + ':' + s.length }
const MARKS = '.warn, .lchip, .boxdot, .boxdash, .boxred, .badtm, .daywarn, .witem, .wln, .dwbox, [data-daywarn], [data-woff]'
/* the words of the warning lists (a remark typed on a flying line — "… // TIGHT TURN" — is schedule content, not a warning) */
const WORDS = /\b\d+ issues?\b|tap to review|Crew rest breach|long work day|two events at once|No time for the|Tight turn [A-Z]{2} |Downchit but|are double turning|OIL waiting|No issues/i
/* the print frame stamps "Generated <date>, <time>": set aside before comparing two prints */
const unstamp = s => String(s || '').replace(/Generated [^·<]*/g, 'Generated (time) ')
async function hookExports() {
  await p.evaluate(() => {
    if (window.__c44) return
    window.__c44 = { csv: [] }
    const o = URL.createObjectURL.bind(URL)
    URL.createObjectURL = b => { try { b.text().then(t => window.__c44.csv.push({ type: b.type, text: t })) } catch (e) {} return o(b) }
  })
}
async function logic() {
  await L.go(p, 'logic'); await L.sleep(500)
  /* bring the long-work-day rule's own "fired" line into the window for the picture */
  await p.evaluate(() => { const e = [...document.querySelectorAll('#page-logic .lgfired')].find(x => /NOTE\s+LONGDAY/.test(((x.closest('tr, .lrow, .rule, li, div') || x).innerText || '').replace(/\s+/g, ' '))); if (e) e.scrollIntoView({ block: 'center' }) }); await L.sleep(250)
  return p.evaluate(() => { const note = (document.querySelector('#page-logic .lgnote') || {}).innerText || ''; const rules = {}; for (const e of document.querySelectorAll('#page-logic .lgfired')) { const t = e.innerText.replace(/\s+/g, ' ').trim(); const row = e.closest('tr, .lrow, .rule, li, div') || e.parentElement; const m = /(?:WARNING|ADVISORY|NOTE)\s+([A-Z_0-9]+)/.exec((row.innerText || '').replace(/\s+/g, ' ')) || /([A-Z][A-Z_0-9]{3,}) fired/.exec(t); const code = m ? m[1] : 'row' + Object.keys(rules).length; rules[code] = (e.classList.contains('on') ? '' : '(not fired) ') + t } return { note: note.replace(/\s+/g, ' ').trim(), rules } })
}
async function printed(tag) {
  await L.go(p, 'editsched'); await C.toWeek(p, C.WK1); await hookExports()
  await p.evaluate(() => document.querySelectorAll('iframe').forEach(f => f.setAttribute('data-c44-old', '1')))
  await p.locator('#exportPdf:visible').first().click(); await L.sleep(1800)
  const toast = await p.evaluate(() => (document.getElementById('toastEl') || {}).textContent || '')
  const r = await p.evaluate(([marks]) => { const f = [...document.querySelectorAll('iframe')].filter(x => !x.hasAttribute('data-c44-old')).pop() || [...document.querySelectorAll('iframe')].pop(); if (!f || !f.contentDocument) return { none: true }; const d = f.contentDocument; return { text: d.body.innerText, html: d.body.innerHTML, marks: d.querySelectorAll(marks).length, markCls: [...d.querySelectorAll(marks)].slice(0, 5).map(e => e.className), pucks: d.querySelectorAll('.puck').length, days: d.querySelectorAll('.day').length } }, [MARKS])
  return { toast, ...r }
}
async function csv() {
  await L.go(p, 'editsched'); await C.toWeek(p, C.WK1); await hookExports()
  const n0 = await p.evaluate(() => window.__c44.csv.length)
  await p.locator('#exportSched:visible').first().click(); await L.sleep(1200)
  return p.evaluate(n => { const b = window.__c44.csv[n]; return b ? { type: b.type, text: b.text, rows: b.text.split(/\r?\n/).length, head: b.text.split(/\r?\n/)[0] } : { none: true } }, n0)
}
async function leavewar() {
  await L.go(p, 'leavewar'); await L.sleep(1800)
  const grid = await p.evaluate(() => document.querySelector('#page-leavewar').innerText.replace(/\s+/g, ' '))
  const b = p.locator('#page-leavewar button').filter({ hasText: /OIL/ }).first()
  await b.click(); await L.sleep(1200)
  const oil = await p.evaluate(() => { const t = document.querySelector('.oil-tools'); let s = t; while (s && s.parentElement && !/OIL TRACKER/i.test(s.innerText || '')) s = s.parentElement; return s ? s.innerText.replace(/\s+/g, ' ') : '' })
  const dash = (/Dash [^]*?(?=Echo |Fable |Ghost |Grit |$)/.exec(oil) || [''])[0].slice(0, 160)
  const rows = await p.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('raptor:leavewar')) o[k] = localStorage.getItem(k) } return JSON.stringify(Object.keys(o).sort().map(k => [k, o[k]])) })
  return { grid, oil, dash, rows }
}
async function closeOil() { const x = p.locator('button').filter({ hasText: /^[✕×]$/ }).last(); await p.keyboard.press('Escape'); await L.sleep(300); if (await p.locator('.oil-tools:visible').count()) { await x.click().catch(() => {}); await L.sleep(300) } }
async function all(tag) {
  const lg = await logic(); const picL = await H.pic(p, `44-${tag}-logic`)
  const pr = await printed(tag); const cs = await csv()
  const lw = await leavewar(); const picO = await H.pic(p, `44-${tag}-oil-tracker`); await closeOil(); const picW = await H.pic(p, `44-${tag}-leavewar`)
  return { lg, pr, cs, lw, pics: [picL, picO, picW] }
}
const same = (a, b, label) => [
  [`${label}Logic: the "fired" line of every rule reads as before`, JSON.stringify(a.lg.rules) === JSON.stringify(b.lg.rules) && a.lg.note === b.lg.note, b.lg.note + ' · LONGDAY: ' + (b.lg.rules.LONGDAY || '') + ' · CREW_REST: ' + (b.lg.rules.CREW_REST || '')],
  [`${label}Logic: the long work day still counts Tuesday (its only Tuesday warning is the hidden one)`, /Tue/.test(b.lg.rules.LONGDAY || ''), b.lg.rules.LONGDAY || '(no LONGDAY row found)'],
  [`${label}print: the print frame's page is the same, to the letter`, !b.pr.none && unstamp(a.pr.html) === unstamp(b.pr.html), hash(unstamp(b.pr.html))],
  [`${label}print: it carries no warning mark and no warning words`, b.pr.marks === 0 && !WORDS.test(b.pr.text || ''), JSON.stringify({ marks: b.pr.marks, cls: b.pr.markCls, word: (WORDS.exec(b.pr.text || '') || [''])[0] })],
  [`${label}CSV: the file is the same, to the letter`, !b.cs.none && a.cs.text === b.cs.text, hash(b.cs.text || '')],
  [`${label}CSV: no warning words in it`, !WORDS.test(b.cs.text || ''), (WORDS.exec(b.cs.text || '') || [''])[0]],
  [`${label}Leave War: the page reads the same`, a.lw.grid === b.lw.grid, hash(b.lw.grid)],
  [`${label}OIL tracker: every figure reads the same`, a.lw.oil === b.lw.oil, hash(b.lw.oil) + ' · ' + b.lw.dash],
  [`${label}the Leave War's saved rows are the same`, a.lw.rows === b.lw.rows, hash(b.lw.rows)],
]
try {
  /* setup: publish Sunday 19 Jul so a weekend duty has earned */
  await L.go(p, 'editsched'); await W.showDay(p, 6)
  const signs = await W.signDay(p, 6), pub = await W.publishDay(p, 6); await L.settle(p)
  const h6 = await H.head(p, 6)
  const A = await all('a-before')
  console.log('LOGIC', A.lg.note, JSON.stringify(A.lg.rules).slice(0, 900))
  console.log('PRINT', JSON.stringify({ toast: A.pr.toast, marks: A.pr.marks, pucks: A.pr.pucks, days: A.pr.days, len: (A.pr.text || '').length, head: (A.pr.text || '').replace(/\s+/g, ' ').slice(0, 260) }))
  console.log('CSV', JSON.stringify({ type: A.cs.type, rows: A.cs.rows, head: A.cs.head }))
  console.log('OIL', hash(A.lw.oil), A.lw.dash, '| LW grid', hash(A.lw.grid))
  H.judge('44.0', 'setup + baseline: Sunday 19 Jul signed and published (a weekend duty earns); then read: Logic, the PDF button\'s print frame, the CSV button\'s file, Leave War, OIL tracker', [
    ['Sunday is published', pub.pressed && /ORIG/.test(h6.tag), JSON.stringify({ pub, tag: h6.tag })],
    ['Logic shows "fired N×" lines', Object.keys(A.lg.rules).length > 5 && /fired/.test(A.lg.note), A.lg.note],
    ['Logic counts the long work day and the crew rest as fired', /fired \d+×/.test(A.lg.rules.LONGDAY || '') && /fired \d+×/.test(A.lg.rules.CREW_REST || ''), (A.lg.rules.LONGDAY || '') + ' · ' + (A.lg.rules.CREW_REST || '')],
    ['the PDF button built a print frame with the schedule in it (the app says "Print dialog opened")', !A.pr.none && (A.pr.text || '').length > 500 && /Print dialog opened/i.test(A.pr.toast), JSON.stringify({ toast: A.pr.toast, len: (A.pr.text || '').length, pucks: A.pr.pucks })],
    ['the print frame carries no warning mark and no warning words', A.pr.marks === 0 && !WORDS.test(A.pr.text || ''), JSON.stringify({ marks: A.pr.marks, cls: A.pr.markCls, word: (WORDS.exec(A.pr.text || '') || [''])[0] })],
    ['the CSV button built a text/csv file of flying lines', !A.cs.none && /csv/.test(A.cs.type) && A.cs.rows > 10, JSON.stringify({ rows: A.cs.rows, head: A.cs.head })],
    ['the CSV carries no warning words', !WORDS.test(A.cs.text || ''), (WORDS.exec(A.cs.text || '') || [''])[0]],
    ['the OIL tracker lists Dash\'s figures', /Dash/.test(A.lw.oil), A.lw.dash],
  ], A.pics)

  /* hide several: all four on Tuesday, the first three on Monday, Saturday's OIL reminder */
  await L.go(p, 'editsched'); await C.toWeek(p, C.WK1)
  const hidden = []
  for (const [di, ixs] of [[1, [0, 1, 2, 3]], [0, [0, 1, 2]]]) for (const ix of ixs) { await H.openList(p, '#eWeek', di); hidden.push(`${H.DAY[di]}#${ix}:` + await H.tapLine(p, '#eWeek', di, ix)) }
  const sat = await C.see(p, '#eWeek', 5, /OIL|not published/i)
  if (sat.line) hidden.push('Sat OIL reminder:' + await H.tapLine(p, '#eWeek', 5, sat.line.ix))
  await L.settle(p)
  const tue = await C.see(p, '#eWeek', 1, /Long work day/i), mon = await C.see(p, '#eWeek', 0, /./), sat2 = await C.see(p, '#eWeek', 5, /OIL|not published/i)
  const picT = await C.picLine(p, '#eWeek', 1, 3, '44-b-tuesday-all-hidden')
  const B = await all('b-hidden')
  H.judge('44.1', 'pressed ✕ on all four of Tuesday\'s lines, Monday\'s first three and Saturday\'s OIL reminder; then read the five again', [
    ['the hides took: Tuesday "No issues", Monday 11, Saturday\'s reminder struck', tue.n === 0 && mon.n === 11 && (!sat.line || (sat2.line && sat2.line.struck)), JSON.stringify({ tue: tue.bar, mon: mon.bar, sat: sat2.bar, pressed: hidden })],
    ...same(A, B, '')], [picT, ...B.pics])

  await H.reloadAs(p, 'a')
  const Cc = await all('c-reload')
  H.judge('44.2', 'reloaded; read the five again', same(A, Cc, 'after the reload — '), Cc.pics)

  /* flag them all again */
  await L.go(p, 'editsched'); await C.toWeek(p, C.WK1)
  for (const [di, ixs] of [[1, [0, 1, 2, 3]], [0, [0, 1, 2]]]) for (const ix of ixs) { await H.openList(p, '#eWeek', di); await H.tapLine(p, '#eWeek', di, ix) }
  if (sat.line) { await C.see(p, '#eWeek', 5, /OIL|not published/i); await H.tapLine(p, '#eWeek', 5, sat.line.ix) }
  await L.settle(p)
  const tue3 = await C.see(p, '#eWeek', 1, /Long work day/i), mon3 = await C.see(p, '#eWeek', 0, /./)
  const D = await all('d-flagged-again')
  H.judge('44.3', 'pressed ↺ on every one of them; read the five again', [['all flagged again: Tuesday 4, Monday 14', tue3.n === 4 && mon3.n === 14, tue3.bar + ' · ' + mon3.bar], ...same(A, D, '')], D.pics)
} catch (e) { H.row('44.X', 'the script', String(e && e.stack || e).slice(0, 700), 'FAIL', [await H.pic(p, '44-X-error')]) }
C.done('44', errors)
await browser.close()
