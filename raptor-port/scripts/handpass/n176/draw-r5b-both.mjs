// draw-r5b-both - the owner's next sample (26 Nov 26), "what if we do both sqn and colours": Saber's bell exactly as e3b3 draws
// it (round 1's e3 state, Show 142 · 149 · 150 on, every line's number first in one column, the new "149 | Hunter [142] /
// Given Plan of 149 · Kestrel" on top) - every grey number box KEPT in that place and size, each wearing its squadron's
// colour as its Show button does (number and edge the colour, fill a faint tint - the app's switched-on look `.fchip.on`,
// .16 fill / .6 edge, in that colour); Hunter's home "142" box in 142's orange.
//   142 orange #F28C28 · 149 gold #D4AF37 · 150 blue #3B82F6
//  e3d (d, p)  the unread dot today's blue          e3d2-d  the same, the two bottom lines read (the app's read look)
//  e3e (d, p)  the unread dot in the line's colour  e3e2-d  the same, the two bottom lines read
//   node raptor-port/scripts/handpass/n176/draw-r5b-both.mjs   (ONLY=e3d-d,e3d-p,e3d2,e3e-d,e3e-p,e3e2)
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { run, as, W, FACT, want, wait, vis, shot, box, closeAll, TMP, LIST, numbersFirst } from './draw-r5b-lib.mjs'
import { tapBell } from '../n175/p6-lib.mjs'
const COL = { '142': '#F28C28', '149': '#D4AF37', '150': '#3B82F6' }
const STS = resolve(TMP, 'state-e3s.json')
const JOBS = [['e3d', 'd', 'e3d-d-both', false, 0], ['e3d', 'p', 'e3d-p-both', false, 0], ['e3d2', 'd', 'e3d2-d-both-read', false, 2],
  ['e3e', 'd', 'e3e-d-both-dot', true, 0], ['e3e', 'p', 'e3e-p-both-dot', true, 0], ['e3e2', 'd', 'e3e2-d-both-dot-read', true, 2],
  /* e3f (the owner's "as in sqn box and colours"): every number box as today (grey), the dot in the line's colour, the
     Show buttons coloured as e3c */
  ['e3f', 'd', 'e3f-d-box-dot', true, 0, false], ['e3f', 'p', 'e3f-p-box-dot', true, 0, false], ['e3f2', 'd', 'e3f2-d-box-dot-read', true, 2, false]]
try {
  if (!existsSync(STS)) throw new Error('round 1\'s Saber bell state (state-e3s.json) is missing - run draw-e3.mjs first')
  for (const [key, sz, name, dotColour, readN, boxColour = true] of JOBS) if (want(`${key}-${sz}`) || want(key)) await run(`${key}.${sz}`, sz, async s => {
    const k = `${key}.${sz}`
    await as(s, 'saber'); await tapBell(s)
    for (const n of ['149', '150']) {
      const b = vis(s, `${LIST} [data-testid="bell-show"] button`).filter({ hasText: new RegExp('^' + n + '$') })
      if (await b.count() && (await b.first().getAttribute('aria-pressed')) !== 'true') { await b.first().click(); await wait(s, 400) }
    }
    if (!(await s.page.locator(LIST).count())) await tapBell(s)
    /* e3b3, as it was drawn: the new line on top (its mark 149), the number column, Hunter's home box after his name */
    await s.page.evaluate(({ L, line }) => {
      const list = document.querySelector(L); const first = list.querySelector('.bl-line'); const e = first.cloneNode(true)
      e.removeAttribute('data-testid'); e.dataset.n176 = 'cloned'; e.classList.add('unread')
      e.querySelector('.bl-name').textContent = line.name; e.querySelectorAll('.bl-sqn').forEach(m => m.remove())
      const m = document.createElement('span'); m.className = 'bl-sqn'; m.textContent = '149'; e.querySelector('.bl-name').after(m)
      e.querySelector('.bl-day').textContent = line.day; e.querySelector('.bl-what').textContent = line.what; e.querySelector('.bl-ago').textContent = 'now'
      first.before(e)
    }, { L: LIST, line: { name: W.planGivenLine.who, day: 'Wed 25 Nov', what: `${W.planGivenLine.words('149')} · ${W.planGivenLine.by}` } })
    await numbersFirst(s, { home: '142', about: ['^Given (Plan|View) of', '^Plan of .* ended'] })
    await s.page.evaluate(L => { const e = document.querySelector(L + ' [data-n176="cloned"]'); const m = e.querySelector('[data-n176col]'); m.textContent = '149'; m.style.visibility = 'visible'
      const h = document.createElement('span'); h.className = 'bl-sqn'; h.textContent = '142'; e.querySelector('.bl-name').after(h) }, LIST)
    /* THE CHANGE: colours only */
    const r = await s.page.evaluate(({ L, COL, dotColour, readN, boxColour }) => {
      const list = document.querySelector(L)
      const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(',')
      const paint = (b, c, on = true) => Object.assign(b.style, { color: c, borderColor: `rgba(${hex(c)},${on ? .6 : .35})`, background: `rgba(${hex(c)},${on ? .16 : .06})` })
      const lines = [...list.querySelectorAll('.bl-line')].filter(x => x.getBoundingClientRect().height > 0)
      lines.slice(lines.length - readN).forEach(x => x.classList.remove('unread'))
      for (const x of lines) {
        if (boxColour) for (const m of x.querySelectorAll('.bl-sqn')) { const c = COL[m.textContent.trim()]; if (c) paint(m, c) }
        const sq = x.querySelector('[data-n176col]')?.textContent.trim()
        if (dotColour && x.classList.contains('unread') && COL[sq]) x.querySelector('.bl-dot').style.background = COL[sq]
      }
      for (const b of list.querySelectorAll('[data-testid="bell-show"] button')) { const c = COL[b.textContent.trim()]; if (c) paint(b, c, b.getAttribute('aria-pressed') === 'true') }
      return {
        lines: lines.map(x => `${x.classList.contains('unread') ? 'dot ' + getComputedStyle(x.querySelector('.bl-dot')).backgroundColor : 'read, no dot'} | ${[...x.querySelectorAll('.bl-sqn')].map(m => m.textContent.trim() + ' ' + getComputedStyle(m).color).join(' + ')} | ${x.innerText.replace(/\s+/g, ' ').trim()}`),
        show: [...list.querySelectorAll('[data-testid="bell-show"] button')].map(b => `${b.textContent.trim()}:${b.getAttribute('aria-pressed') === 'true' ? 'on' : 'off'} ${getComputedStyle(b).color}`),
      }
    }, { L: LIST, COL, dotColour, readN, boxColour })
    FACT(`${k}.drawn`, r)
    await s.page.evaluate(() => document.activeElement?.blur()); await s.page.mouse.move(s.W - 2, s.H - 2).catch(() => {})
    await shot(s, name, [await box(s, LIST)])
  }, { state: STS })
} finally { await closeAll() }
