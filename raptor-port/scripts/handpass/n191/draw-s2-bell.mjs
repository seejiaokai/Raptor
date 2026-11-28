// draw-s2-bell - section 2: the BELL LINES Admin → Users' changes send, in squadron colours (D2638: a bell showing more
// than one squadron - each number in its squadron's colour, the same as its Show button; round 5's sample colours), and
// WHERE A TAP ON EACH LANDS (ledger rows 2.27, 2.33, 2.34). On the REAL app at 4700; every new line is a real line of the
// bell cloned, its parts replaced; the landing ring is the app's own (`acc-ring`, the ring a posting's line lands with).
//   s2-27-{d,p}-bell      2.27  Hunter's bell (142's admin; he also plans 149): "149 added a new Jester. Delete yours if he
//                               has left flying for good · Kestrel"
//   s2-27-{d,p}-lands     2.27  its tap: 142's Admin → Users, "▾ Archived" opened, Jester's row ringed
//   s2-33-{d,p}-ended     2.33  Saber's bell (142, 149, 150 on): "Plan of 149 ended · Kestrel" and the app's own endings
//                               "Plan of 149 ended: he moved to 150", "Plan of 149 ended: made a member"
//   s2-34-{d,p}-bell      2.34  Saber's bell: "Given Plan of 149 · Kestrel" (the approved e3d line), the line marked
//   s2-34-{d,p}-lands     2.34  its tap: 149 picked, Admin → Users at Hunter's row in "From other squadrons", ringed
// States: s2-state-arch.json (./draw-s2-forms.mjs - Jester archived on 142) and round 1's Saber bell state
// (n176 state-e3s.json: 142, 149 and 150 lines raised by presses).
//   node raptor-port/scripts/handpass/n191/draw-s2-bell.mjs   (ONLY=27,33,34  SZ=d,p)
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { run, as, W, W6, WN, FACT, wait, vis, hit, shot, box, closeAll, barSq, TMP, LIST, lineParts, numbersFirst, tapBell, want, load, S, man, subOf, tring, tringFixed, ringAll, build, pin, pinnedFoot, spec149, start, column, paneCol, sqFolds, J, paintBell, R6 } from './draw-s2-lib.mjs'
const ARCHST = resolve(TMP, 's2-state-arch.json'), STS = resolve(TMP, 'state-e3s.json')
const ABOUT = ['^Given (Plan|View) of', '^Plan of .* ended']
const pic = (row, name) => async (sz, fn, st) => { const k = `s2-${row}-${sz}-${name}`; if (want(row, sz)) await run(k, sz, s => fn(s, k), { state: st }) }
const today = () => new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '')
/* every Show button of the bell on (a bell showing more than one squadron) */
async function showAll(s) {
  for (const n of ['149', '150']) { const b = vis(s, `${LIST} [data-testid="bell-show"] button`).filter({ hasText: new RegExp('^' + n + '$') }); if (await b.count() && (await b.first().getAttribute('aria-pressed')) !== 'true') { await b.first().click(); await wait(s, 400) } }
  if (!(await s.page.locator(LIST).count())) await tapBell(s)
  return s.page.evaluate(L => [...document.querySelectorAll(L + ' [data-testid="bell-show"] button')].map(b => `${b.textContent.trim()}:${b.getAttribute('aria-pressed') === 'true' ? 'on' : 'off'}`), LIST)
}
/* new lines on top, newest first as given: each a clone of the bell's first real line; then the number column (round 5's
   numbersFirst), each new line's own squadron number put in its place, the man's home number after his name (D2652 N1) */
async function topLines(s, lines, home) {
  await s.page.evaluate(({ L, lines }) => {
    const first = document.querySelector(L + ' .bl-line')
    for (const c of [...lines].reverse()) { const e = first.cloneNode(true); e.removeAttribute('data-testid'); e.dataset.s2 = c.id; e.classList.add('unread')
      e.querySelector('.bl-name').textContent = c.name; e.querySelectorAll('.bl-sqn').forEach(m => m.remove())
      const m = document.createElement('span'); m.className = 'bl-sqn'; m.textContent = c.sq; e.querySelector('.bl-name').after(m)
      e.querySelector('.bl-day').textContent = c.day; e.querySelector('.bl-what').textContent = c.what; e.querySelector('.bl-ago').textContent = c.ago
      document.querySelector(L + ' .bl-line').before(e) }
  }, { L: LIST, lines })
  const col = await numbersFirst(s, { home, about: ABOUT })
  await s.page.evaluate(({ L, lines }) => { for (const c of lines) { const e = document.querySelector(`${L} [data-s2="${c.id}"]`); const m = e.querySelector('[data-n176col]'); m.textContent = c.sq; m.style.visibility = 'visible'
    if (c.home) { const h = document.createElement('span'); h.className = 'bl-sqn'; h.textContent = c.home; e.querySelector('.bl-name').after(h) } } }, { L: LIST, lines })
  return col.column
}
const linesNow = s => s.page.evaluate(L => [...document.querySelectorAll(L + ' .bl-line')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.innerText.replace(/[ \t\r\n]+/g, ' ').trim()), LIST)
const bellShot = async (s, k, ids) => { await s.page.evaluate(() => document.activeElement?.blur()); await s.page.mouse.move(s.W - 2, s.H - 2).catch(() => {}); await wait(s, 200); for (const id of ids) await tringFixed(s, await box(s, `${LIST} [data-s2="${id}"]`), 2); await shot(s, k, [await box(s, LIST)], 16) }

try {
  await load()
  if (!existsSync(ARCHST)) throw new Error('no s2-state-arch.json: run draw-s2-forms.mjs first')
  if (!existsSync(STS)) throw new Error('round 1\'s Saber bell state (state-e3s.json) is missing - run n176/draw-e3.mjs first')
  const DAY = today()

  /* 2.27 - the old squadron's line, in colours */
  for (const sz of ['d', 'p']) await pic('27', 'bell')(sz, async (s, k) => {
    await as(s, 'hunter'); await tapBell(s)
    FACT(`${k}.realLines`, (await lineParts(s)).map(l => `${l.mark ?? '-'} | ${l.name} ${l.day} | ${l.what} | ${l.ago}`))
    const show = await showAll(s)
    const col = await topLines(s, [{ id: 'jester', name: 'Jester', sq: '142', day: DAY, what: `${W.someoneNewLine('149', 'Jester')} · Kestrel`, ago: 'now' }], '142')
    FACT(`${k}.drawn`, { show, column: col, colours: await paintBell(s), lines: await linesNow(s), dayForm: DAY })
    await bellShot(s, k, ['jester'])
  }, ARCHST)
  /* 2.27 - its tap: 142's page, "▾ Archived" opened (the app's own fold, pressed), Jester's archived row ringed */
  for (const sz of ['d', 'p']) await pic('27', 'lands')(sz, async (s, k) => {
    FACT(`${k}.add`, await start(s, 'hunter'))
    const cinch = man('142', 'Cinch'), mako = man('150', 'Mako'), kestrel = man('149', 'Kestrel')
    const b = await build(s, { navName: WN.navName, tags: [[cinch.pid, W6.postingOutTo('14 Dec', '149')]], jumps: J('people')(['people', 'out', 'in', 'other'], [S.COUNT['142'], 1, 1, 1]),
      groups: [{ id: 'out', label: WN.open(W6.outgoing(1)), rows: [{ key: 'cinch', cs: 'Cinch', sub: cinch.seatCat, tag: W6.postingOutTo('14 Dec', '149') }] }, { id: 'in', label: WN.open(W6.incoming(1)), rows: [{ key: 'mako', cs: 'Mako', chip: '150', sub: mako.seatCat, tag: W6.postingIn('4 Jan') }] }, { id: 'other', label: WN.open(W6.fromOther(1)), rows: [{ key: 'kestrel', cs: 'Kestrel', chip: '149', sub: subOf(kestrel, '142') }] }],
      sqFolds: sqFolds(149, 150) })
    FACT(`${k}.pinned`, await pin(s))
    await hit(s, '#accArchToggle', 500)
    const row = await s.page.evaluate(() => { const r = [...document.querySelectorAll('#accArchList .acc-row[data-person]')].find(e => e.querySelector('.acc-name').textContent === 'Jester'); r.classList.add('acc-ring'); r.style.boxShadow = 'inset 0 0 0 2px #1E86FF'; r.id = 's2landed'; r.scrollIntoView({ block: 'center' }); const c = getComputedStyle(r); return { words: r.innerText.replace(/[ \t\r\n]+/g, ' ').trim(), appRing: c.boxShadow !== 'none' ? c.boxShadow : c.outline } })
    await wait(s, 400)
    FACT(`${k}.landed`, { squadron: await barSq(s), fold: await s.page.evaluate(() => document.querySelector('#accArchToggle').textContent), row, jumps: b.jumps.map(j => j.words) })
    await tring(s, await box(s, '#s2landed'), 6)
    const c = await box(s, '#s2landed'), pane = await paneCol(s), bar = await box(s, '.topbar'), top = Math.max(bar.y + bar.h, c.y - 240)
    await shot(s, k, [{ x: pane.x, y: top, w: pane.w, h: Math.min(s.H - 8, c.y + c.h + 200) - top }], 12)
  }, ARCHST)

  /* 2.33 - "Plan of 149 ended", by a person and by the app, in colours (Saber's bell, three squadrons on) */
  for (const sz of ['d', 'p']) await pic('33', 'ended')(sz, async (s, k) => {
    await as(s, 'saber'); await tapBell(s); const show = await showAll(s)
    const lines = [
      { id: 'member', name: 'Cobra', home: '142', sq: '149', day: DAY, what: `${W.planEndedMember('149')} · Hunter`, ago: 'now' },
      { id: 'moved', name: 'Blade', home: '150', sq: '149', day: DAY, what: W.planEndedMoved('149', '150'), ago: '2 h' },
      { id: 'ended', name: W.planEndedLine.who, home: '142', sq: '149', day: DAY, what: `${W.planEndedLine.words('149')} · ${W.planEndedLine.by}`, ago: '3 h' }]
    const col = await topLines(s, lines, '142')
    FACT(`${k}.drawn`, { show, column: col, colours: await paintBell(s), lines: await linesNow(s), note: 'Cobra and Blade holding Plan of 149 is drawn, not in the world; "he moved to 150" carries no signer (the app ends it when the posting runs), "made a member" is signed by the 142 admin who made him one' })
    await bellShot(s, k, ['member', 'moved', 'ended'])
  }, STS)

  /* 2.34 - a tap on a Plan line: the line (the approved e3d line), then where it lands */
  for (const sz of ['d', 'p']) await pic('34', 'bell')(sz, async (s, k) => {
    await as(s, 'saber'); await tapBell(s); const show = await showAll(s)
    const col = await topLines(s, [{ id: 'given', name: W.planGivenLine.who, home: '142', sq: '149', day: 'Wed 25 Nov', what: `${W.planGivenLine.words('149')} · ${W.planGivenLine.by}`, ago: 'now' }], '142')
    FACT(`${k}.drawn`, { show, column: col, colours: await paintBell(s), lines: await linesNow(s) })
    await bellShot(s, k, ['given'])
  }, STS)
  for (const sz of ['d', 'p']) await pic('34', 'lands')(sz, async (s, k) => {
    FACT(`${k}.add`, await start(s, 'saber', 149))
    const b = await build(s, spec149({ lit: 'other', other: { hunter: { landed: true } } }))
    FACT(`${k}.pinned`, await pin(s))
    await s.page.evaluate(() => document.querySelector('#s2row-hunter').scrollIntoView({ block: 'center' })); await wait(s, 400)
    FACT(`${k}.landed`, { squadron: await barSq(s), row: b.groupRows.s2other[0], appRing: await s.page.evaluate(() => { const c = getComputedStyle(document.querySelector('#s2row-hunter')); return c.boxShadow !== 'none' ? c.boxShadow : c.outline }), jumps: b.jumps.map(j => j.words + (j.lit ? ' (lit)' : '')) })
    await tring(s, await box(s, '#s2row-hunter'), 6)
    const c = await box(s, '#s2row-hunter'), pane = await paneCol(s), bar = await box(s, '.topbar'), top = Math.max(bar.y + bar.h, c.y - 240)
    await shot(s, k, [{ x: pane.x, y: top, w: pane.w, h: Math.min(s.H - 8, c.y + c.h + 230) - top }], 12)
  }, R6)
} finally { await closeAll() }
