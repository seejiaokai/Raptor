// draw-s2q-c - section 2's question 15 on the one questions page (first written as question 12/C; chat 199, 26 Nov 26):
// the admins' bell line when a man's Plan of 149 ends by an
// archive, an overseas posting, a delete or the master mark (D2311; the plan's §21.2 "Still held" 3). Drawn as
// draw-s2-bell's s2-33 drew "Plan of 149 ended": each new line a clone of the bell's first real line, its parts replaced,
// the squadron number first (round 5's numbersFirst), the man's home number after his name, the numbers and Show buttons
// in round 5's squadron colours (D2638). Nothing here writes the app's code.
//   q15-{d,p}-ended      Saber's bell, 142, 149 and 150 shown: "archived · Hunter", "posted out overseas" (the app's, on
//                        its date), "deleted · Hunter"
//   q15-{d,p}-master     Kestrel's bell (149's admin): "Plan of 149 ended: made a master admin · Saber" (the review's final;
//                        the ruled own-bell words are the other wording, named on the card, not drawn)
// The words are the fresh Fable review's final column (words-s2q.mjs).
//   node raptor-port/scripts/handpass/n199/draw-s2q-c.mjs   (ONLY=ended,master  SZ=d,p)
import { run, FACT, wait, signIn, vis, box, shot, tring, want, closeAll, today, COL, ERRS } from './s2q-lib.mjs'
import { WQ } from './words-s2q.mjs'

const LIST = '[data-testid="bell-list"]', BELL = '#notifyBell, .bellbtn'
const ABOUT = ['^Given (Plan|View) of', '^Plan of .* ended', '^Made ']
async function tapBell(s) { const b = await box(s, BELL); if (s.desk) await s.page.mouse.click(b.x + b.w / 2, b.y + b.h / 2); else await s.page.touchscreen.tap(b.x + b.w / 2, b.y + b.h / 2); await wait(s, 900) }
async function showAll(s) {
  for (const n of ['142', '149', '150']) { const b = vis(s, `${LIST} [data-testid="bell-show"] button`).filter({ hasText: new RegExp('^' + n + '$') }); if (await b.count() && (await b.first().getAttribute('aria-pressed')) !== 'true') { if (s.desk) await b.first().click(); else await b.first().tap(); await wait(s, 400) } }
  if (!(await s.page.locator(LIST).count())) await tapBell(s)
  return s.page.evaluate(L => [...document.querySelectorAll(L + ' [data-testid="bell-show"] button')].map(b => `${b.textContent.trim()}:${b.getAttribute('aria-pressed') === 'true' ? 'on' : 'off'}`), LIST)
}
const realLines = s => s.page.evaluate(L => [...document.querySelectorAll(L + ' .bl-line')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()), LIST)
/* new lines on top, newest first; then the number column (n176 numbersFirst, copied): every line's number first, in a
   fixed width; the new lines' own squadron number in its place, the man's home number after his name */
async function topLines(s, lines, home) {
  return s.page.evaluate(({ L, lines, home, about }) => {
    let first = document.querySelector(L + ' .bl-line'), tmpl = null
    /* Saber's bell can be empty in this world ("Nothing new", 26 Nov 26 run): then one line is built in the app's own
       markup (ui/topbits.tsx's bell list, copied), cloned from, and removed */
    if (!first) { const sc = document.querySelector(L + ' .bl-scroll'); sc.querySelector('.bl-empty')?.remove()
      tmpl = first = document.createElement('button'); first.type = 'button'; first.className = 'bl-line'; first.setAttribute('role', 'menuitem')
      first.innerHTML = '<span class="bl-dot" aria-hidden="true"></span><span class="bl-main"><span class="bl-t"><b class="bl-name"></b><i class="bl-day"></i></span><span class="bl-what"></span></span><span class="bl-ago"></span>'
      sc.appendChild(first) }
    for (const c of [...lines].reverse()) { const e = first.cloneNode(true); e.removeAttribute('data-testid'); e.dataset.s2q = c.id; e.classList.add('unread')
      e.querySelector('.bl-name').textContent = c.name; e.querySelectorAll('.bl-sqn').forEach(m => m.remove())
      e.querySelector('.bl-day').textContent = c.day; e.querySelector('.bl-what').textContent = c.what; e.querySelector('.bl-ago').textContent = c.ago
      document.querySelector(L + ' .bl-line').before(e) }
    tmpl?.remove()
    for (const e of document.querySelectorAll(L + ' .bl-line')) {
      const t = e.querySelector('.bl-t'), what = e.querySelector('.bl-what').textContent, own = !e.dataset.s2q && about.some(re => new RegExp(re).test(what))
      let m = e.querySelector('.bl-sqn')
      if (!m) { m = document.createElement('span'); m.className = 'bl-sqn'; m.textContent = own ? '' : home }
      m.dataset.s2qcol = '1'; t.prepend(m)
      if (own) { m.textContent = '000'; m.style.visibility = 'hidden' }
    }
    for (const c of lines) { const e = document.querySelector(`${L} [data-s2q="${c.id}"]`); const m = e.querySelector('[data-s2qcol]'); m.textContent = c.sq; m.style.visibility = 'visible'
      if (c.home) { const h = document.createElement('span'); h.className = 'bl-sqn'; h.textContent = c.home; e.querySelector('.bl-name').after(h) } }
    const w = Math.max(...[...document.querySelectorAll('[data-s2qcol]')].map(m => m.getBoundingClientRect().width))
    for (const m of document.querySelectorAll('[data-s2qcol]')) { m.style.marginLeft = '0'; m.style.marginRight = '7px'; m.style.width = Math.ceil(w) + 'px'; m.style.textAlign = 'center'; m.style.boxSizing = 'border-box' }
    return Math.ceil(w)
  }, { L: LIST, lines, home, about: ABOUT })
}
const paintBell = s => s.page.evaluate(([L, COL]) => { const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(','); for (const m of document.querySelectorAll(L + ' .bl-sqn')) { const c = COL[m.textContent.trim()]; if (c) Object.assign(m.style, { color: c, borderColor: `rgba(${hex(c)},.6)`, background: `rgba(${hex(c)},.16)` }) } for (const b of document.querySelectorAll(L + ' [data-testid="bell-show"] button')) { const c = COL[b.textContent.trim()]; if (c) { const on = b.getAttribute('aria-pressed') === 'true'; Object.assign(b.style, { color: c, borderColor: `rgba(${hex(c)},${on ? .6 : .35})`, background: `rgba(${hex(c)},${on ? .16 : .06})` }) } } }, [LIST, COL])
const bellShot = async (s, k, ids) => { await s.page.evaluate(() => document.activeElement?.blur()); if (s.desk) await s.page.mouse.move(s.W - 2, s.H - 2).catch(() => {}); await wait(s, 200); for (const id of ids) await tring(s, await box(s, `${LIST} [data-s2q="${id}"]`), 2); await shot(s, k, [await box(s, LIST)], 16) }

try {
  const DAY = today()
  for (const sz of ['d', 'p']) {
    if (want('ended', sz)) await run(`q15-${sz}-ended`, sz, async s => {
      const k = `q15-${sz}-ended`
      await signIn(s, 'saber'); await tapBell(s)
      FACT(`${k}.realLines`, (await realLines(s)).slice(0, 8))
      const show = await showAll(s)
      const col = await topLines(s, [
        { id: 'archived', name: 'Cobra', home: '142', sq: '149', day: DAY, what: `${WQ.planEndArchived('149')} · Hunter`, ago: 'now' },
        { id: 'overseas', name: 'Blade', home: '142', sq: '149', day: DAY, what: WQ.planEndOverseas('149'), ago: '2 h' },
        { id: 'deleted', name: 'Basher', home: '142', sq: '149', day: DAY, what: `${WQ.planEndDeleted('149')} · Hunter`, ago: '3 h' }], '142')
      await paintBell(s)
      FACT(`${k}.drawn`, { show, column: col, lines: (await realLines(s)).slice(0, 6), note: 'Cobra, Blade and Basher holding Plan of 149 is drawn, not in the world' })
      await bellShot(s, k, ['archived', 'overseas', 'deleted'])
    })
    if (want('master', sz)) await run(`q15-${sz}-master`, sz, async s => {
      const k = `q15-${sz}-master`
      await signIn(s, 'kestrel'); await tapBell(s)
      if (!(await s.page.locator(LIST).count())) await tapBell(s)
      FACT(`${k}.realLines`, (await realLines(s)).slice(0, 8))
      const show = await showAll(s)
      const col = await topLines(s, [{ id: 'master', name: 'Hunter', home: '142', sq: '149', day: DAY, what: `${WQ.planEndMaster('149')} · Saber`, ago: 'now' }], '149')
      /* only the new line (the coordinator's word, 26 Nov 26): Kestrel's two older lines of this world, about his Plan of
         150, are not what the question is about and left a blank number place - taken out of the picture */
      FACT(`${k}.removed`, await s.page.evaluate(L => { const r = [...document.querySelectorAll(L + ' .bl-line:not([data-s2q])')]; r.forEach(e => e.remove()); return r.length }, LIST))
      await paintBell(s)
      FACT(`${k}.drawn`, { show, column: col, lines: (await realLines(s)).slice(0, 5) })
      await bellShot(s, k, ['master'])
    })
  }
} finally { FACT('errors', ERRS); await closeAll() }
