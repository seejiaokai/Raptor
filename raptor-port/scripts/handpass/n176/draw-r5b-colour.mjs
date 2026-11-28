// draw-r5b-colour - a sample the owner asked for (26 Nov 26): Saber's bell as e3b3 draws it (round 1's e3 state, Show 142 ·
// 149 · 150 all on, the new "Hunter / Given Plan of 149 · Kestrel" line on top), with NO grey number box on any line, each
// line's unread dot in its squadron's colour instead of the blue, and the Show buttons in the same colours (edge and number
// the colour, fill a faint tint - the app's own switched-on look `.fchip.on`, rgba .16 fill / .6 edge, in that colour).
//   142 orange #F28C28 · 149 gold #D4AF37 · 150 blue #3B82F6   (his colours; the owner's words, not a ruling yet)
//  e3c (d, p)     every line unread, as e3b3
//  e3c2-d         the same, the two bottom lines read (the app's own read line: `unread` off, its dot gone)
// Only colours change and the boxes go; every word, size and place as the app draws it.
//   node raptor-port/scripts/handpass/n176/draw-r5b-colour.mjs   (ONLY=e3c-d,e3c-p,e3c2)
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { run, as, W, FACT, want, wait, vis, shot, box, closeAll, TMP, LIST } from './draw-r5b-lib.mjs'
import { tapBell } from '../n175/p6-lib.mjs'
const COL = { '142': '#F28C28', '149': '#D4AF37', '150': '#3B82F6' }
const STS = resolve(TMP, 'state-e3s.json')
try {
  if (!existsSync(STS)) throw new Error('round 1\'s Saber bell state (state-e3s.json) is missing - run draw-e3.mjs first')
  const jobs = [['e3c', 'd', 0], ['e3c', 'p', 0], ['e3c2', 'd', 2]]
  for (const [key, sz, readN] of jobs) if (want(`${key}-${sz}`) || (key === 'e3c2' && want('e3c2'))) await run(`${key}.${sz}`, sz, async s => {
    const k = `${key}.${sz}`
    await as(s, 'saber'); await tapBell(s)
    for (const n of ['149', '150']) {
      const b = vis(s, `${LIST} [data-testid="bell-show"] button`).filter({ hasText: new RegExp('^' + n + '$') })
      if (await b.count() && (await b.first().getAttribute('aria-pressed')) !== 'true') { await b.first().click(); await wait(s, 400) }
    }
    if (!(await s.page.locator(LIST).count())) await tapBell(s)
    const r = await s.page.evaluate(({ L, COL, line, readN }) => {
      const list = document.querySelector(L)
      /* e3b3's new line, cloned from the first real line, on top - its squadron 149 */
      const first = list.querySelector('.bl-line'); const e = first.cloneNode(true)
      e.removeAttribute('data-testid'); e.dataset.n176 = 'cloned'; e.classList.add('unread')
      e.querySelector('.bl-name').textContent = line.name; e.querySelectorAll('.bl-sqn').forEach(m => m.remove())
      e.querySelector('.bl-day').textContent = line.day; e.querySelector('.bl-what').textContent = line.what; e.querySelector('.bl-ago').textContent = 'now'
      e.dataset.r5bSqn = '149'; first.before(e)
      /* each line's squadron: its own grey box today (149 / 150), none on his home's lines (142) - then every box removed */
      const lines = [...list.querySelectorAll('.bl-line')].filter(x => x.getBoundingClientRect().height > 0)
      for (const x of lines) { if (!x.dataset.r5bSqn) x.dataset.r5bSqn = x.querySelector('.bl-sqn')?.textContent.trim() || '142'; x.querySelectorAll('.bl-sqn').forEach(m => m.remove()) }
      /* the bottom readN lines read, as the app draws a read line */
      lines.slice(lines.length - readN).forEach(x => x.classList.remove('unread'))
      for (const x of lines) { const d = x.querySelector('.bl-dot'); if (x.classList.contains('unread')) d.style.background = COL[x.dataset.r5bSqn] }
      /* the Show buttons in the same colours, switched-on look kept */
      const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(',')
      for (const b of list.querySelectorAll('[data-testid="bell-show"] button')) { const c = COL[b.textContent.trim()]; if (!c) continue; const on = b.getAttribute('aria-pressed') === 'true'
        Object.assign(b.style, { color: c, borderColor: `rgba(${hex(c)},${on ? .6 : .35})`, background: `rgba(${hex(c)},${on ? .16 : .06})` }) }
      return {
        lines: lines.map(x => `${x.classList.contains('unread') ? 'dot ' + getComputedStyle(x.querySelector('.bl-dot')).backgroundColor : 'read, no dot'} | ${x.dataset.r5bSqn} | ${x.innerText.replace(/\s+/g, ' ').trim()}`),
        boxesLeft: list.querySelectorAll('.bl-sqn').length,
        show: [...list.querySelectorAll('[data-testid="bell-show"] button')].map(b => `${b.textContent.trim()}:${b.getAttribute('aria-pressed') === 'true' ? 'on' : 'off'} ${getComputedStyle(b).color}`),
      }
    }, { L: LIST, COL, line: { name: W.planGivenLine.who, day: 'Wed 25 Nov', what: `${W.planGivenLine.words('149')} · ${W.planGivenLine.by}` }, readN })
    FACT(`${k}.drawn`, r)
    await s.page.evaluate(() => document.activeElement?.blur()); await s.page.mouse.move(s.W - 2, s.H - 2).catch(() => {})
    await shot(s, key === 'e3c' ? `e3c-${sz}-colour` : 'e3c2-d-colour-read', [await box(s, LIST)])
  }, { state: STS })
} finally { await closeAll() }
