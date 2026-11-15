/* A — Ranger's Friday. A1 REAL today; A2: type VL BFM landing 13:00 through the app, read the REAL list, then change only
   each row's words to the proposal's section 2 "After". usage: [PHONE=1] node a-friday.mjs */
import * as X from './ww-lib.mjs'
import { appendFileSync } from 'node:fs'
const w = await X.open({ phone: process.env.PHONE === '1' })
const { page, P } = w
const man = rec => appendFileSync(X.OUT + '/manifest.jsonl', JSON.stringify(rec) + '\n')
const size = w.phone ? '402x874 WebKit @3x' : '1536x864 Chromium @2x'

const { wi, st } = await X.stageFriday(w)
if (w.phone) { await X.closeBoard(w); await X.reload(w); await X.board(w, X.FRI) }
let r = await X.openWarn(w)
X.say(P, 'A1 REAL', r)
const want1 = [/^Ranger — RU & BRIEFING clash$/, /^Ranger — Tight turn VL BFM→ RU: 60 min take-off→next T\/O, no landing typed \(needs 120 min — threshold 120, dekit\+step 30\+60\)$/,
  /^Ranger — Not enough time to attend the VL BFM debrief — BRIEFING sits inside 12:00–14:00 \(take-off \+ 2h, no landing typed\)$/,
  /^Ranger — No time for the RU flight brief — BRIEFING sits inside 10:40–13:00 \(brief 10:40\)$/, /^Ranger — 1 person is double turning: Ranger$/]
if (r.rows.length !== 5 || !want1.every((re, i) => re.test(r.rows[i].text))) throw new Error('A1 premise not on screen: ' + JSON.stringify(r.rows))
let s = await X.shotList(w, `a1-today-${P}.png`)
man({ file: `a1-today-${P}.png`, family: "A — Ranger's Friday", state: 'today', kind: 'real', size, header: r.head, rows: r.rows.map(x => x.text), sev: r.rows.map(x => x.sev), lines: r.rows.map(x => x.lines), notes: s.hiddenNotes.length ? 'floating foot note hidden: ' + s.hiddenNotes.join(' | ') : '' })

// A2: type the landing through the app
await X.typeIn(w, `[data-bfld="ff:${X.FRI}.${wi}.0.ld"]`, '13:00')
if (w.phone) { await X.closeBoard(w); await X.reload(w); await X.board(w, X.FRI) }
const ld = await page.evaluate(([d, g]) => window.DAYS[d].waves[g].formations[0].ld, [X.FRI, wi])
if (ld !== '13:00') throw new Error('landing not typed: ' + ld)
r = await X.openWarn(w)
X.say(P, 'A2 REAL ROWS AFTER LANDING 13:00', r)
await X.shotList(w, `a2-real-after-landing-${P}.png`)
man({ file: `a2-real-after-landing-${P}.png`, family: "A — Ranger's Friday, VL BFM landing typed 13:00 (reference, not for him)", state: 'real after landing', kind: 'real', size, header: r.head, rows: r.rows.map(x => x.text), sev: r.rows.map(x => x.sev), lines: r.rows.map(x => x.lines) })
const ruLd = st.ru.ld
const map = [
  [/^RU & BRIEFING clash$/, `Clash: RU (T/O 13:00, landing ${ruLd || 'assumed 14:00'}) & BRIEFING 12:40–13:00`],
  [/^VL BFM & BRIEFING clash$/, 'Clash: VL BFM (T/O 12:00, landing assumed 13:00) & BRIEFING 12:40–13:00'],
  [/^Tight turn VL BFM/, 'Tight turn: VL BFM → RU, 0 min (needs 120). VL BFM landing assumed 13:00 (T/O + 1h), RU T/O 13:00'],
  [/^No time for the RU flight brief/, 'Misses RU brief 10:40–13:00: BRIEFING 12:40–13:00'],
  [/double turning/, null],
]
const plan = r.rows.map(x => {
  const i = x.text.indexOf(' — '); const pre = i > 0 ? x.text.slice(0, i) : ''; const words = i > 0 ? x.text.slice(i + 3) : x.text
  const m = map.find(([re]) => re.test(words))
  return { pre, words, now: m ? (m[1] === null ? words : m[1]) : null }
})
const unmatched = plan.filter(p => p.now === null)
if (unmatched.length) X.say('A2 UNMATCHED (left as the app wrote them):', unmatched)
const texts = plan.map(p => (p.pre ? p.pre + ' — ' : '') + (p.now ?? p.words))
await page.evaluate(texts => {
  const rows = [...document.querySelectorAll('#schedBoard #sbWarn .wln[data-wix]')].filter(e => e.offsetWidth)
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  rows.forEach((e, i) => { e.querySelector('.wln-t').innerHTML = esc(texts[i]).replace(/(\d\d:\d\d–\d\d:\d\d)/g, '<span style="white-space:nowrap">$1</span>') })
}, texts)
const drawn = await X.readWarn(w)
if (JSON.stringify(drawn.rows.map(x => x.text)) !== JSON.stringify(texts)) throw new Error('A2 drawn rows differ ' + JSON.stringify(drawn.rows))
s = await X.shotList(w, `a2-after-${P}.png`)
const again = await X.readWarn(w)
if (JSON.stringify(again.rows.map(x => x.text)) !== JSON.stringify(texts)) throw new Error('A2 list redrawn by the app before the picture')
man({ file: `a2-after-${P}.png`, family: "A — Ranger's Friday", state: 'proposed', kind: 'drawn on the real list (the real rows after typing VL BFM landing 13:00, words changed only)', size, header: drawn.head, rows: texts, sev: drawn.rows.map(x => x.sev), lines: drawn.rows.map(x => x.lines), ruLanding: ruLd, unmatched })
await w.browser.close()
