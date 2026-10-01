/* Scenario 19 — opening Insights must not change anything another part of the app reads. */
import * as A from './ins-a-lib.mjs'
import { oilButton, oilPucks } from './p6-lib.mjs'
import { allChips } from './seat-lib.mjs'
import { readFileSync } from 'node:fs'
const { L, W, TUE, row, judge, pic } = A
const S = '19', SAT = 5
const clean = s => String(s || '').replace(/\s+/g, ' ').trim()
const listTxt = l => (l.lines || []).map(x => `${x.struck ? '~' : ''}${x.text}`).join(' | ')
/* everything outside the Insights window that a person can read about the two days */
async function snapshot(p, name) {
  const o = {}, shots = []
  const tryIt = async (k, f) => { try { o[k] = await f() } catch (e) { o[k] = 'ERR ' + String(e).slice(0, 120) } }
  /* Edit Schedule: Tuesday's and Saturday's head, bar and opened list */
  await tryIt('edit Tue head', async () => { const f = await A.face(p, TUE); return `${f.tag} | ${f.pending.replace(/\d+ changes?/, 'N changes')} | ${f.nys} | ${f.alpub} | ${f.signed} | ${f.signs.join(',')} | ${f.bar.replace(/tap to \w+ [▲▼]/, '')}` })
  await tryIt('edit Tue list', async () => { await A.openList(p, '#eWeek', TUE); return listTxt(await A.readList(p, '#eWeek', TUE)) })
  shots.push(await pic(p, name + '-edit-tue'))
  await tryIt('edit Tue ⓘ', async () => { const r = await A.dayInfo(p, '#eWeek', TUE); return r.err || `${r.title} | ${r.stat} | ${r.als} | ${r.sev} | ${r.under} | ${r.lines.map(l => (l.struck ? '~' : '') + l.text).join(' | ')}` })
  await tryIt('edit Sat head', async () => { const f = await A.face(p, SAT); return `${f.tag} | ${f.pending.replace(/\d+ changes?/, 'N changes')} | ${f.nys} | ${f.alpub} | ${f.signed} | ${f.bar.replace(/tap to \w+ [▲▼]/, '')}` })
  /* exports (they print the published version) */
  await tryIt('CSV', async () => { await A.toEdit(p); const [d] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }), p.locator('#exportSched:visible').first().click()]); const path = await d.path(); const t = readFileSync(path, 'utf8'); return `${d.suggestedFilename()} · ${t.length} chars · ${t.split('\n').length} lines · ${t}` })
  await tryIt('print', async () => { await A.toEdit(p); await p.evaluate(() => { window.__prints = 0; document.querySelectorAll('iframe').forEach(f => f.remove()) }); await p.locator('#exportPdf:visible').first().click(); await L.sleep(700); const h = await p.evaluate(() => { const f = [...document.querySelectorAll('iframe')].pop(); return f ? (f.srcdoc || (f.contentDocument && f.contentDocument.documentElement.outerHTML) || '') : '(no print frame)' }); await p.evaluate(() => document.querySelectorAll('iframe').forEach(f => f.remove())); /* the sheet prints the minute it was made ("Generated 01 Oct 2026, 22:25") — the clock, not the schedule: set aside */ const hh = h.replace(/Generated [^·<]*·/, 'Generated (the minute it was made) ·'); return `${hh.length} chars · ${hh}` })
  /* OIL Earn on Saturday's board */
  await tryIt('OIL Earn (Sat board)', async () => { await W.boardOn(p, SAT); const was = await p.evaluate(() => { const b = document.querySelector('#sbOil'); return b ? b.classList.contains('on') : null }); if (was === null) { await W.boardOff(p); return 'no OIL button on Saturday\'s board' } if (!was) await oilButton(L, p); const pk = await oilPucks(p); const ch = await allChips(p); shots.push(await pic(p, name + '-oil-earn')); if (!was) await oilButton(L, p); const h = await A.head(p, SAT); await W.boardOff(p); return `pucks ${JSON.stringify(pk)} · chips ${JSON.stringify(ch)} · board head ${h.tag} ${h.pending.replace(/\d+ changes?/, 'N changes')} ${h.nys}` })
  /* View-only Sched: Tuesday's bar, list and ⓘ */
  await tryIt('view Tue', async () => { const v = await A.vface(p, TUE); await A.openList(p, '#vWeek', TUE); return `${v.tag} | ${v.sel} | ${v.bar.replace(/tap to \w+ [▲▼]/, '')} | ${listTxt(await A.readList(p, '#vWeek', TUE))}` })
  await tryIt('view Tue ⓘ', async () => { const r = await A.dayInfo(p, '#vWeek', TUE); return r.err || `${r.title} | ${r.stat} | ${r.als} | ${r.sev} | ${r.under} | ${r.lines.map(l => (l.struck ? '~' : '') + l.text).join(' | ')}` })
  await tryIt('view Sat', async () => { const v = await A.vface(p, SAT); return `${v.tag} | ${v.sel} | ${v.bar.replace(/tap to \w+ [▲▼]/, '')}` })
  /* Leave War: the OIL tracker (everyone's balance) */
  await tryIt('Leave War OIL tracker', async () => { await A.toPage(p, 'leavewar'); await L.sleep(700); const b = p.locator('[data-testid="oil-tracker"]:visible').first(); await b.click(); await L.sleep(700)
    const r = await p.evaluate(() => [...document.querySelectorAll('[data-oilrow]')].map(e => e.dataset.oilrow + ':' + ((e.querySelector('[data-testid^="oil-bal-"]') || {}).innerText || '').trim() + ':' + ((e.querySelector('[data-testid^="oil-pm-"]') || {}).innerText || '').replace(/\s+/g, '') + ':' + e.querySelectorAll('.ents > *').length).join(' '))
    await p.evaluate(() => { const e = document.querySelector('[data-oilrow="plasma"]'); if (e) e.scrollIntoView({ block: 'center' }) }); await L.sleep(250)
    shots.push(await pic(p, name + '-oil-tracker'))
    const x = p.locator('[data-testid="oil-close"]:visible').first(); if (await x.count()) await x.click(); else await p.keyboard.press('Escape'); await L.sleep(300); return r })
  /* what is stored */
  await L.settle(p)
  const rows = await L.rows(p)
  o['stored rows'] = Object.keys(rows).filter(k => !k.startsWith('changes/') && !/^settings\/(elog|seen|ui|place)/.test(k)).sort().map(k => k + '#' + rows[k].length).join(' ')
  o['stored row count'] = String(Object.keys(rows).length)
  return { o, shots, rows }
}
const cmp = (a, b) => Object.keys(a.o).filter(k => a.o[k] !== b.o[k])
/* where two long texts first part, with the words around it */
const where = (x, y) => { x = String(x); y = String(y); let i = 0; while (i < x.length && i < y.length && x[i] === y[i]) i++; return `at character ${i}: "…${x.slice(Math.max(0, i - 60), i + 90)}" → "…${y.slice(Math.max(0, i - 60), i + 90)}"` }
const fallible = s => Object.entries(s.o).filter(([k, v]) => /^ERR /.test(v)).map(([k, v]) => k + ': ' + v)
/* open, scroll to the foot, close — n times over each page */
async function poke(p, pages, n) {
  const seen = []
  for (const pg of pages) { await A.toPage(p, pg); await L.sleep(250)
    for (let i = 0; i < n; i++) { const o = await A.insOpen(p); if (o.err) { seen.push(pg + ': ' + o.err); break }
      await p.evaluate(() => { const b = document.querySelector('#insightBody'); const rows = b.querySelectorAll('.irow'); rows[rows.length - 1].scrollIntoView({ block: 'end' }) }); await L.sleep(150)
      await p.evaluate(() => { const b = document.querySelector('#insightBody .itile'); b.scrollIntoView({ block: 'start' }) }); await L.sleep(100)
      const r = await A.insRead(p); seen.push(`${pg}#${i + 1}: ${A.tile(r, /Sorties/i)}/${A.tile(r, /warning/i)}${r.top ? '' : ' NOT ON TOP'}`)
      await A.insClose(p) } }
  return seen
}
await A.run(S, async p => {
  /* the fixture: Saturday published (its duty earns OIL), Tuesday published, then a waiting edit on each */
  await A.toEdit(p)
  const ps = await A.pubOrig(p, SAT)
  const pt = await A.pubOrig(p, TUE)
  await W.boardOn(p, TUE); const c1 = await A.cxLine(p, '1.1.1.0'); await W.boardOff(p)
  await W.boardOn(p, SAT); await A.boxText(p, 'dr:5.0.0.end', '12:00'); await W.boardOff(p)
  const fT = await A.face(p, TUE), fS = await A.face(p, SAT)
  const s0 = await snapshot(p, 's19-a-before')
  judge(`${S}.a`, `admin: Saturday signed and ${ps.r.label || ps.r.why} (Fable's 08:00–18:00 duty), Tuesday signed and ${pt.r.label || pt.r.why}; then waiting edits — board CX on Tuesday's Go 2 RU lead (${c1}) and Saturday's duty end 18:00→12:00; everything outside the Insights window recorded`, [
    ['Tuesday and Saturday are both Original with a change waiting', /ORIG/.test(fT.tag) && A.isPending(fT) && /ORIG/.test(fS.tag) && A.isPending(fS), `${A.faceLine(fT)} ;; ${A.faceLine(fS)}`],
    ['every reader could be read', fallible(s0).length === 0, fallible(s0)],
  ], s0.shots)
  row(`${S}.a+`, 'what was recorded (short)', Object.entries(s0.o).map(([k, v]) => `${k}: ${String(v).slice(0, 150)}`).join(' ;; '), 'RECORDED')

  /* the action: Insights opened, scrolled and closed three times over three pages */
  const seen = await poke(p, ['editsched', 'viewsched', 'leavewar'], 3)
  const shotI = (await A.insPic(p, 's19-b-insights', 'both')).shots
  const s1 = await snapshot(p, 's19-b-after')
  const d1 = cmp(s0, s1)
  judge(`${S}.b`, `Insights opened by ${A.PHONE ? '☰ → Week insights' : 'the top bar'}, scrolled to its foot and back, and closed — three times over Edit Schedule, View-only Sched and Leave War (${seen.length} openings); everything recorded again`, [
    ['every opening drew the window on top', seen.length === 9 && seen.every(x => !/NOT ON TOP|:\s*no |lies over/.test(x)), seen.join(' · ')],
    ['every recorded value outside the window is unchanged, character for character', d1.length === 0, d1.map(k => `${k}: ${where(s0.o[k], s1.o[k])}`)],
    ['nothing was written to storage (rows identical, change-log too)', JSON.stringify(s0.rows) === JSON.stringify(s1.rows), `${Object.keys(s0.rows).length} → ${Object.keys(s1.rows).length} rows`],
  ], [...shotI, ...s1.shots])

  /* after a reload */
  await A.reloadAs(p, 'a')
  const s2 = await snapshot(p, 's19-c-reloaded')
  const seen2 = await poke(p, ['viewsched', 'editsched'], 2)
  const s3 = await snapshot(p, 's19-d-reloaded-after')
  const d2 = cmp(s0, s2), d3 = cmp(s2, s3)
  judge(`${S}.c`, `reload, signed in again; everything recorded; Insights opened, scrolled and closed twice over View-only Sched and Edit Schedule (${seen2.length} openings); everything recorded again`, [
    ['the reload gave back every recorded value', d2.length === 0, d2.map(k => `${k}: ${where(s0.o[k], s2.o[k])}`)],
    ['opening the window after the reload changed nothing', d3.length === 0, d3.map(k => `${k}: ${where(s2.o[k], s3.o[k])}`)],
    ['nothing was written to storage by the openings', JSON.stringify(s2.rows) === JSON.stringify(s3.rows), `${Object.keys(s2.rows).length} → ${Object.keys(s3.rows).length} rows`],
  ], [...s2.shots, ...s3.shots])
  if (d2.length) row(`${S}.c+`, 'exactly what differed across the reload (before any Insights opening after it)', d2.map(k => `${k}: ${where(s0.o[k], s2.o[k])}`).join(' ;; '), 'RECORDED')
  if (d1.length) row(`${S}.b+`, 'exactly what differed across the Insights openings', d1.map(k => `${k}: ${where(s0.o[k], s1.o[k])}`).join(' ;; '), 'RECORDED')
  if (d3.length) row(`${S}.d+`, 'exactly what differed across the Insights openings after the reload', d3.map(k => `${k}: ${where(s2.o[k], s3.o[k])}`).join(' ;; '), 'RECORDED')
})
