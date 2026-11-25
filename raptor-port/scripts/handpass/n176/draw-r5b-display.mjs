// draw-r5b-display - the owner's ruling D2639 (26 Nov 26): each admin picks his own squadron colours, on a new Admin page
// "Display", with a colour slider and a brightness slider and a preview. A MOCK-UP built from the app's own parts on Saber's
// account (round 1's e3 state - his bell shows 142, 149, 150):
//   the Admin rail gains a category "Display" (cloned from the rail's own buttons, selected - `adm-cat on`); the pane's
//   head reads "Display"; its body one panel (`adm-panel`): `adm-sub` "Squadron colours", `adm-note` the quiet line; one row a
//   squadron - its number box (the bell's `.bl-sqn`) in its colour as e3d paints it, then a round swatch; 149's row opened
//   (the opened row's tint) with "Colour" (a full rainbow strip, its handle on the colour's hue) and "Brightness" (dark to
//   light of that colour, the handle in the middle), each an `mfield` label; then the row foot `acc-acts`: Save (main) and
//   Reset (plain). "Preview" (`adm-sub`) beside it on a desktop, under it on a phone: his REAL bell list (e3d: the new line
//   on top, numbers first, boxes and Show buttons in the colours, dots today's blue), copied into the page.
// Words are drafts (D2639's page; a fresh Fable reads them later). Colours: 142 #F28C28 · 149 #D4AF37 · 150 #3B82F6.
//  e3g (d, p)   149 gold          e3g2-d   149's colour slider moved to green #2FB36D - its boxes and Show button green
//   node raptor-port/scripts/handpass/n176/draw-r5b-display.mjs   (ONLY=e3g-d,e3g-p,e3g2)
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { run, as, W, FACT, want, wait, vis, closeAll, TMP, LIST, numbersFirst, usersTab, box, words, shotTall } from './draw-r5b-lib.mjs'
import { tapBell } from '../n175/p6-lib.mjs'
const BASE = { '142': '#F28C28', '149': '#D4AF37', '150': '#3B82F6' }
const STS = resolve(TMP, 'state-e3s.json')
const TEXT = { tab: 'Display', head: 'Squadron colours', quiet: 'How each squadron looks on your bell. Only you see your colours.', colour: 'Colour', bright: 'Brightness', save: 'Save', reset: 'Reset', preview: 'Preview' }
const hue = h => { const [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let x = 0; if (d) x = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return Math.round(((x * 60) + 360) % 360) }
const JOBS = [['e3g', 'd', 'e3g-d-display', BASE], ['e3g', 'p', 'e3g-p-display', BASE], ['e3g2', 'd', 'e3g2-d-display-moved', { ...BASE, '149': '#2FB36D' }]]
try {
  if (!existsSync(STS)) throw new Error('round 1\'s Saber bell state (state-e3s.json) is missing - run draw-e3.mjs first')
  for (const [key, sz, name, COL] of JOBS) if (want(`${key}-${sz}`) || want(key)) await run(`${key}.${sz}`, sz, async s => {
    const k = `${key}.${sz}`
    await as(s, 'saber'); await tapBell(s)
    for (const n of ['149', '150']) {
      const b = vis(s, `${LIST} [data-testid="bell-show"] button`).filter({ hasText: new RegExp('^' + n + '$') })
      if (await b.count() && (await b.first().getAttribute('aria-pressed')) !== 'true') { await b.first().click(); await wait(s, 400) }
    }
    if (!(await s.page.locator(LIST).count())) await tapBell(s)
    /* his bell as e3d: the new line on top, the number column, Hunter's home box, boxes and Show buttons in the colours */
    await s.page.evaluate(({ L, line }) => {
      const list = document.querySelector(L); const first = list.querySelector('.bl-line'); const e = first.cloneNode(true)
      e.removeAttribute('data-testid'); e.dataset.n176 = 'cloned'; e.classList.add('unread')
      e.querySelector('.bl-name').textContent = line.name; e.querySelectorAll('.bl-sqn').forEach(m => m.remove())
      const m = document.createElement('span'); m.className = 'bl-sqn'; m.textContent = '149'; e.querySelector('.bl-name').after(m)
      e.querySelector('.bl-day').textContent = line.day; e.querySelector('.bl-what').textContent = line.what; e.querySelector('.bl-ago').textContent = 'now'
      first.before(e)
    }, { L: LIST, line: { name: W.planGivenLine.who, day: 'Wed 25 Nov', what: `${W.planGivenLine.words('149')} · ${W.planGivenLine.by}` } })
    await numbersFirst(s, { home: '142', about: ['^Given (Plan|View) of', '^Plan of .* ended'] })
    const bellHtml = await s.page.evaluate(({ L, COL }) => {
      const e = document.querySelector(L + ' [data-n176="cloned"]'); const m = e.querySelector('[data-n176col]'); m.textContent = '149'; m.style.visibility = 'visible'
      const h = document.createElement('span'); h.className = 'bl-sqn'; h.textContent = '142'; e.querySelector('.bl-name').after(h)
      const list = document.querySelector(L)
      const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(',')
      const paint = (b, c) => Object.assign(b.style, { color: c, borderColor: `rgba(${hex(c)},.6)`, background: `rgba(${hex(c)},.16)` })
      for (const x of list.querySelectorAll('.bl-sqn')) { const c = COL[x.textContent.trim()]; if (c) paint(x, c) }
      for (const b of list.querySelectorAll('[data-testid="bell-show"] button')) { const c = COL[b.textContent.trim()]; if (c) paint(b, c) }
      return list.outerHTML
    }, { L: LIST, COL })
    await s.page.keyboard.press('Escape'); await wait(s, 300)
    if (await s.page.locator(LIST).count()) await tapBell(s)
    await usersTab(s); await wait(s, 500)
    /* THE PAGE */
    const r = await s.page.evaluate(({ T, COL, bellHtml, hues, desk }) => {
      const rail = document.querySelector('#page-admin .adm-rail'), cats = [...rail.querySelectorAll('.adm-cat')]
      cats.forEach(c => { c.classList.remove('on'); c.removeAttribute('aria-current') })
      const d = cats[cats.length - 1].cloneNode(true); d.classList.add('on'); d.setAttribute('aria-current', 'page'); d.id = 'r5bCat'
      d.querySelector('.adm-cat-l').textContent = T.tab; d.querySelector('.adm-cat-s').textContent = T.head
      d.querySelector('.adm-cat-ic').innerHTML = '<svg class="btnglyph" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><circle cx="8.5" cy="10" r="1.3"></circle><circle cx="12" cy="7.5" r="1.3"></circle><circle cx="15.5" cy="10" r="1.3"></circle><path d="M12 21a2.5 2.5 0 0 1 0-5h2.5"></path></svg>'
      cats[cats.length - 1].after(d)
      document.querySelector('#page-admin .adm-pane-head h3').textContent = T.tab
      const bodyEl = document.querySelector('#page-admin .adm-pane-body')
      bodyEl.querySelectorAll('.adm-panel').forEach(p => p.classList.remove('on'))
      const sec = document.createElement('section'); sec.className = 'adm-panel on'; sec.id = 'r5bDisplay'; bodyEl.prepend(sec)
      const rootCs = getComputedStyle(document.documentElement), v = n => rootCs.getPropertyValue(n).trim()
      const edge = getComputedStyle(document.querySelector('#page-admin .adm-sep')).borderTopColor
      const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(',')
      const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e }
      const grid = el('div'); grid.id = 'r5bGrid'; Object.assign(grid.style, desk ? { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: '28px', alignItems: 'start' } : { display: 'block' })
      const left = el('div'); grid.appendChild(left)
      left.appendChild(el('h4', 'adm-sub', T.head)); const q = el('p', 'adm-note', T.quiet); q.style.marginBottom = '12px'; left.appendChild(q)
      const strip = (bg, at, fill, id) => { const w = el('div'); w.id = id; Object.assign(w.style, { position: 'relative', height: '14px', borderRadius: '7px', background: bg, margin: '6px 9px 14px' })
        const h = el('div'); Object.assign(h.style, { position: 'absolute', top: '50%', left: (at * 100) + '%', width: '20px', height: '20px', marginLeft: '-10px', marginTop: '-10px', borderRadius: '50%', border: '2px solid #fff', background: fill, boxShadow: '0 1px 4px rgba(0,0,0,.6)', boxSizing: 'border-box' }); w.appendChild(h); return w }
      for (const n of ['142', '149', '150']) {
        const c = COL[n]
        const row = el('div'); row.dataset.r5bRow = n
        const top = el('div'); Object.assign(top.style, { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0' })
        const b = el('span', 'bl-sqn', n); Object.assign(b.style, { marginLeft: '0', color: c, borderColor: `rgba(${hex(c)},.6)`, background: `rgba(${hex(c)},.16)` })
        const sw = el('span'); Object.assign(sw.style, { width: '22px', height: '22px', borderRadius: '50%', background: c, display: 'inline-block', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.18)' })
        top.append(b, sw); row.appendChild(top)
        if (n === '149') {
          Object.assign(row.style, { background: v('--panel-2') || 'rgba(255,255,255,.04)', borderRadius: '12px', padding: '0 14px 14px', margin: '0 -14px' })
          const f1 = el('div', 'mfield'); f1.appendChild(el('label', null, T.colour))
          f1.appendChild(strip('linear-gradient(90deg,#f00,#ff0 16.7%,#0f0 33.3%,#0ff 50%,#00f 66.7%,#f0f 83.3%,#f00)', hues[n] / 360, c, 'r5bHue'))
          const f2 = el('div', 'mfield'); f2.appendChild(el('label', null, T.bright))
          f2.appendChild(strip(`linear-gradient(90deg, hsl(${hues[n]} 55% 8%), ${c}, hsl(${hues[n]} 55% 92%))`, 0.5, c, 'r5bBright'))
          const acts = el('div', 'acc-acts'); const sv = el('button', 'abtn primary', T.save); sv.type = 'button'; const rs = el('button', 'abtn', T.reset); rs.type = 'button'; acts.append(sv, rs)
          row.append(f1, f2, acts)
        } else row.style.borderBottom = `1px solid ${edge}`
        left.appendChild(row)
      }
      const right = el('div'); right.id = 'r5bPreview'; if (!desk) right.style.marginTop = '22px'
      right.appendChild(el('h4', 'adm-sub', T.preview))
      const hh = document.createElement('div'); hh.innerHTML = bellHtml; const bl = hh.firstElementChild
      bl.removeAttribute('data-testid'); bl.id = 'r5bBell'
      Object.assign(bl.style, { position: 'static', inset: 'auto', left: 'auto', right: 'auto', top: 'auto', bottom: 'auto', transform: 'none', width: '100%', maxWidth: 'none', maxHeight: 'none', margin: '8px 0 0', zIndex: 'auto', animation: 'none', opacity: '1', visibility: 'visible' })
      right.appendChild(bl); grid.appendChild(right); sec.appendChild(grid)
      return {
        rail: [...rail.querySelectorAll('.adm-cat')].map(c => c.querySelector('.adm-cat-l').textContent + (c.classList.contains('on') ? ' (selected)' : '')),
        paneHead: document.querySelector('#page-admin .adm-pane-head h3').textContent,
        rows: ['142', '149', '150'].map(n => `${n} ${COL[n]}`),
        preview: [...bl.querySelectorAll('.bl-line')].map(x => x.innerText.replace(/\s+/g, ' ').trim()),
        previewBoxes: [...bl.querySelectorAll('.bl-sqn')].map(x => x.textContent.trim() + ' ' + getComputedStyle(x).color),
        show: [...bl.querySelectorAll('[data-testid="bell-show"] button')].map(x => x.textContent.trim() + ' ' + getComputedStyle(x).color),
      }
    }, { T: TEXT, COL, bellHtml, hues: Object.fromEntries(Object.entries(COL).map(([n, c]) => [n, hue(c)])), desk: s.desk })
    FACT(`${k}.drawn`, { ...r, hue149: hue(COL['149']) })
    await s.page.evaluate(() => scrollTo(0, 0)); await s.page.mouse.move(1, 1).catch(() => {}); await wait(s, 300)
    const pane = await box(s, '#page-admin .adm-pane'), rail = await box(s, '#page-admin .adm-rail'), pv = await s.page.evaluate(() => { const r = document.querySelector('#r5bPreview').getBoundingClientRect(), g = document.querySelector('#r5bGrid').getBoundingClientRect(); return { bottom: Math.max(r.bottom, g.bottom) } })
    const L = s.desk && rail ? Math.min(rail.x, pane.x) : pane.x, R = pane.x + pane.w, T = s.desk && rail ? Math.min(rail.y, pane.y) : pane.y
    await shotTall(s, name, { x: L, y: T, w: R - L, h: pv.bottom + 16 - T })
  }, { state: STS })
} finally { await closeAll() }
