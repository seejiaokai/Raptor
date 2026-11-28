// draw-r5b-bell - round 5's redraws of the Plan lines on a bell (brief 2026-11-25-msq-q3-redraw-brief.md, item 7).
//  e3b-d    OSPREY's bell - made a second admin of 149 in the r5b world (./draw-r5b-lib.mjs), not the presser - with
//           D2626's two lines, newest first: "Hunter Wed 25 Nov / Plan of 149 ended · Kestrel" and "Hunter Wed 25 Nov /
//           Given Plan of 149 · Kestrel" (W.planEndedLine, W.planGivenLine), each cloned from a real bell line (his own if
//           he has one, else Kestrel's), cropped to the two lines and the list's foot - no "Sync · slow" pill.
//  e3b2-d   the same, Hunter's callsign wearing the grey "142" box after it (the app's `.bl-sqn`).
//  e3b3 (d, p) SABER's bell (round 1's e3 state: 142, 149 and 150 lines raised by presses), his Show buttons for 149 and 150
//           pressed on, every line's number first (round 1's change), and one line cloned on top:
//           "149 | Hunter [142] Wed 25 Nov / Given Plan of 149 · Kestrel" - the squadron's number first, Hunter's home
//           number in its grey box after his name: both grey numbers on one line.
//   node raptor-port/scripts/handpass/n176/draw-r5b-bell.mjs   (ONLY=e3b,e3b2,e3b3-d,e3b3-p)
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { run, signIn, W, FACT, want, wait, vis, shot, box, closeAll, TMP, LIST, lineParts, numbersFirst, r5bWorld, as } from './draw-r5b-lib.mjs'
import { tapBell } from '../n175/p6-lib.mjs'
const DAY = 'Wed 25 Nov'
/* a line cloned from tpl (outerHTML), its parts replaced, put first in the list */
const addLine = (s, tpl, c) => s.page.evaluate(({ L, tpl, c }) => {
  const list = document.querySelector(L); const first = list.querySelector('.bl-line')
  const h = document.createElement('div'); h.innerHTML = tpl; const e = h.firstElementChild
  e.removeAttribute('data-testid'); e.dataset.n176 = 'cloned'; e.classList.add('unread')
  e.querySelector('.bl-name').textContent = c.name; e.querySelectorAll('.bl-sqn').forEach(m => m.remove())
  if (c.mark) { const m = document.createElement('span'); m.className = 'bl-sqn'; m.textContent = c.mark; e.querySelector('.bl-name').after(m) }
  e.querySelector('.bl-day').textContent = c.day; e.querySelector('.bl-what').textContent = c.what; e.querySelector('.bl-ago').textContent = c.ago
  if (first) first.before(e); else (list.querySelector('.bl-foot') ? list.querySelector('.bl-foot').before(e) : list.appendChild(e))
  return e.innerText.replace(/\s+/g, ' ').trim()
}, { L: LIST, tpl, c })
try {
  const R5 = await r5bWorld()
  /* a real bell line's markup, to clone from where Osprey's own bell has none: Kestrel's */
  let TPL = null
  await run('r5b.bell.read', 'd', async s => {
    await as(s, 'kestrel'); await tapBell(s)
    TPL = await s.page.evaluate(L => document.querySelector(L + ' .bl-line')?.outerHTML ?? null, LIST)
  }, { state: R5 })
  for (const [key, mark] of [['e3b', false], ['e3b2', true]]) if (want(key)) await run(key, 'd', async s => {
    await signIn(s, 'us9', 'us9'); await tapBell(s)
    const real = await lineParts(s)
    FACT(`${key}.osprey`, { badge: await s.page.evaluate(() => document.querySelector('#roleBadge')?.textContent.replace(/\s+/g, ' ').trim()), realLines: real.map(l => `${l.mark ?? '-'} | ${l.name} ${l.day} | ${l.what} | ${l.ago}`), foot: await s.page.evaluate(L => document.querySelector(L + ' .bl-foot')?.innerText.replace(/\s+/g, ' ').trim() ?? null, LIST) })
    const own = await s.page.evaluate(L => document.querySelector(L + ' .bl-line')?.outerHTML ?? null, LIST)
    const tpl = own || TPL; if (!tpl) throw new Error('no bell line to clone')
    FACT(`${key}.clonedFrom`, own ? 'a real line of Osprey\'s own bell' : 'a real line of Kestrel\'s bell (Osprey\'s bell has none)')
    /* newest first: "ended" on top (given, then ended) - added given first, then ended before it */
    for (const L of [W.planGivenLine, W.planEndedLine]) await addLine(s, tpl, { name: L.who, mark: mark ? '142' : null, day: DAY, what: `${L.words('149')} · ${L.by}`, ago: 'now' })   /* newer than his real line, as their place on top says */
    FACT(`${key}.drawn`, (await lineParts(s)).map(l => `${l.name}${l.mark ? ' [' + l.mark + ']' : ''} ${l.day} | ${l.what} | ${l.ago}`))
    const r = await s.page.evaluate(L => { const e = [...document.querySelectorAll(L + ' [data-n176="cloned"]')].map(x => x.getBoundingClientRect()); const f = document.querySelector(L + ' .bl-foot')?.getBoundingClientRect(); const lst = document.querySelector(L).getBoundingClientRect(); return { top: Math.min(...e.map(q => q.top)), linesBottom: Math.max(...e.map(q => q.bottom)), foot: f ? { y: f.top, b: f.bottom } : null, x: lst.left, w: lst.width, listBottom: lst.bottom } }, LIST)
    FACT(`${key}.between`, { linesBottom: Math.round(r.linesBottom), footTop: r.foot && Math.round(r.foot.y) })
    await s.page.evaluate(() => document.activeElement?.blur()); await s.page.mouse.move(s.W - 2, s.H - 2).catch(() => {})
    await shot(s, `${key}-d-bell`, [{ x: r.x, y: r.top - 8, w: r.w, h: (r.foot ? r.foot.b : r.listBottom) - r.top + 8 }], 0)
  }, { state: R5 })
  /* e3b3 - Saber's bell, three squadrons on, the new line on top with both numbers */
  const STS = resolve(TMP, 'state-e3s.json')
  if (!existsSync(STS)) throw new Error('round 1\'s Saber bell state (state-e3s.json) is missing - run draw-e3.mjs first')
  for (const sz of ['d', 'p']) if (want('e3b3-' + sz)) await run(`e3b3.${sz}`, sz, async s => {
    const k = `e3b3.${sz}`
    await as(s, 'saber'); await tapBell(s)
    for (const n of ['149', '150']) {
      const b = vis(s, `${LIST} [data-testid="bell-show"] button`).filter({ hasText: new RegExp('^' + n + '$') })
      if (await b.count() && (await b.first().getAttribute('aria-pressed')) !== 'true') { await b.first().click(); await wait(s, 400) }
    }
    if (!(await s.page.locator(LIST).count())) await tapBell(s)
    FACT(`${k}.show`, await s.page.evaluate(l => [...document.querySelectorAll(l + ' [data-testid="bell-show"] button')].map(b => `${b.textContent}:${b.getAttribute('aria-pressed') === 'true' ? 'on' : 'off'}`), LIST))
    const tpl = await s.page.evaluate(L => document.querySelector(L + ' .bl-line').outerHTML, LIST)
    /* the clone wears 149 as its squadron's mark (moved first by the column, as every line's), then Hunter's home box */
    await addLine(s, tpl, { name: W.planGivenLine.who, mark: '149', day: DAY, what: `${W.planGivenLine.words('149')} · ${W.planGivenLine.by}`, ago: 'now' })
    FACT(`${k}.column`, await numbersFirst(s, { home: '142', about: ['^Given (Plan|View) of', '^Plan of .* ended'] }))
    /* numbersFirst leaves an "about him" line's place empty: this line is about Hunter, not Saber - its 149 put back */
    await s.page.evaluate(L => { const e = document.querySelector(L + ' [data-n176="cloned"]'); const m = e.querySelector('[data-n176col]'); m.textContent = '149'; m.style.visibility = 'visible'
      const h = document.createElement('span'); h.className = 'bl-sqn'; h.textContent = '142'; e.querySelector('.bl-name').after(h) }, LIST)
    FACT(`${k}.drawn`, await s.page.evaluate(L => [...document.querySelectorAll(L + ' .bl-line')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()), LIST))
    await s.page.evaluate(() => document.activeElement?.blur()); await s.page.mouse.move(s.W - 2, s.H - 2).catch(() => {})
    await shot(s, `e3b3-${sz}-bell`, [await box(s, LIST)])
  }, { state: STS })
} finally { await closeAll() }
