/* Captures the staged Monday (stage.mjs) from the running app as it is drawn on Edit Schedule, View-only Sched and the
   Scheduler Board, at a desktop's size (1536, Chromium) and his iPhone's (402, WebKit), in both stores (AL4 waiting, all
   out): each surface's own markup with the chain of boxes it sits in, the app's stylesheets whole, and, read off the
   screen, the colour behind every amendment mark and the size of its letters. Nothing here builds.
     GW_URL=http://localhost:4817/ GW_STATE=<the folder stage.mjs wrote> node docs/mock/2026-11-26-al-colours/capture.mjs
   Output: capture/*.html, capture/app.css, capture/measured.json, capture/raw-*.png (for the maker's eyes only). */
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, writeFileSync } from 'node:fs'
const K = await import('../2026-11-25-guardrail-wording/kit.mjs')
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, 'capture'); mkdirSync(OUT, { recursive: true })
const DI = 0
const measured = []

/* the surface's markup inside the chain of its ancestors (tag, id, class only; no siblings), boxes holding their typed values */
const grab = (p, sel) => p.evaluate(sel => {
  const el = document.querySelector(sel); if (!el) return null
  el.querySelectorAll('input').forEach(i => { if (i.type === 'checkbox' || i.type === 'radio') { i.checked ? i.setAttribute('checked', '') : i.removeAttribute('checked') } else i.setAttribute('value', i.value) })
  el.querySelectorAll('textarea').forEach(t => { t.textContent = t.value })
  el.querySelectorAll('select').forEach(s => [...s.options].forEach(o => o.selected ? o.setAttribute('selected', '') : o.removeAttribute('selected')))
  let html = el.outerHTML
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
  for (let a = el.parentElement; a && a !== document.body; a = a.parentElement)
    html = `<${a.tagName.toLowerCase()}${a.id ? ` id="${esc(a.id)}"` : ''}${a.className && typeof a.className === 'string' ? ` class="${esc(a.className)}"` : ''}>${html}</${a.tagName.toLowerCase()}>`
  return { html, body: document.body.className, root: document.documentElement.className, attrs: [...document.documentElement.attributes].map(a => a.name + '=' + a.value).join(' ') + ' | ' + [...document.body.attributes].map(a => a.name + '=' + a.value).join(' ') }
}, sel)

/* what is behind each amendment mark, and how big its letters are */
const measure = (p, root) => p.evaluate(root => {
  const parse = c => { const m = c.match(/[\d.]+/g).map(Number); return m.length < 4 ? [...m, 1] : m }
  const behind = el => {
    const stack = []
    for (let a = el; a; a = a.parentElement) { const c = parse(getComputedStyle(a).backgroundColor); if (c[3] > 0) { stack.push(c); if (c[3] >= 1) break } }
    let out = [11, 13, 16]
    for (const c of stack.reverse()) out = out.map((v, i) => v * (1 - c[3]) + c[i] * c[3])
    return '#' + out.map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase()
  }
  const rows = {}
  for (const e of document.querySelectorAll(`${root} [data-alc], ${root} [data-aln]`)) {
    const b = e.getBoundingClientRect(); if (!b.width) continue
    const cs = getComputedStyle(e), seat = e.classList.contains('seat'), puck = seat && e.querySelector('.puck')
    const kind = seat ? 'puck' : e.classList.contains('verchip') ? 'day tag' : e.tagName === 'INPUT' || e.tagName === 'TEXTAREA' ? 'box' : 'text'
    const key = [kind, seat ? behind(puck || e) : behind(kind === 'day tag' ? e.parentElement : e), kind === 'puck' ? '' : Math.round(parseFloat(cs.fontSize) * 10) / 10 + 'px/' + cs.fontWeight, kind === 'puck' ? '' : cs.fontFamily.split(',')[0].replace(/"/g, '')].join(' | ')
    rows[key] = (rows[key] || 0) + 1
  }
  const txt = {}
  for (const e of document.querySelectorAll(`${root} [data-txt], ${root} .nm`)) { if (!e.getBoundingClientRect().width || e.closest('[data-alc],[data-aln]')) continue; const cs = getComputedStyle(e); const k = cs.color; txt[k] = (txt[k] || 0) + 1 }
  return { marks: rows, plainText: txt }
}, root)

for (const st of ['waiting', 'out']) for (const key of ['d', 'p']) {
  const w = await K.world(key, join(K.STATE, `alc-${st}.json`)), p = w.p, sz = w.sz
  await K.signIn(p)
  const tag = `${st}-${sz.name}`
  if (st === 'waiting' && key === 'd') {
    const css = await p.evaluate(async () => (await Promise.all([...document.querySelectorAll('link[rel="stylesheet"], style')].map(async n => n.tagName === 'STYLE' ? n.textContent : (await fetch(n.href)).text()))).join('\n'))
    writeFileSync(join(OUT, 'app.css'), css); K.log('app.css', css.length)
  }
  /* View-only Sched: the page the app opens on */
  const viewPage = await p.evaluate(() => window.CURPAGE)
  await p.evaluate(di => { const d = document.querySelector(`#vWeek .day[data-day="${di}"]`); d && d.scrollIntoView({ block: 'start', inline: 'start' }); window.scrollTo(0, 0) }, DI)
  await K.wait(p, 600)
  let g = await grab(p, `#vWeek .day[data-day="${DI}"]`)
  writeFileSync(join(OUT, `view-${tag}.html`), g.html); K.log('view', tag, g.html.length, 'page', viewPage, '| html/body:', g.root, '/', g.body, '/', g.attrs)
  measured.push({ surface: 'View-only Sched', st, size: sz.name, ...(await measure(p, `#vWeek .day[data-day="${DI}"]`)) })
  await p.screenshot({ path: join(OUT, `raw-view-${tag}.png`) })
  /* Edit Schedule */
  await K.weekDay(p, sz, DI)
  g = await grab(p, `#eWeek .day[data-day="${DI}"]`)
  writeFileSync(join(OUT, `edit-${tag}.html`), g.html); K.log('edit', tag, g.html.length)
  measured.push({ surface: 'Edit Schedule', st, size: sz.name, ...(await measure(p, `#eWeek .day[data-day="${DI}"]`)) })
  await p.screenshot({ path: join(OUT, `raw-edit-${tag}.png`) })
  /* the Scheduler Board */
  await K.board(p, sz, DI)
  g = await grab(p, '#schedBoard')
  writeFileSync(join(OUT, `board-${tag}.html`), g.html); K.log('board', tag, g.html.length, '| body:', g.body)
  measured.push({ surface: 'Scheduler Board', st, size: sz.name, ...(await measure(p, '#schedBoard')) })
  await p.screenshot({ path: join(OUT, `raw-board-${tag}.png`) })
  if (p.errs.length) K.log('ERRORS', tag, p.errs.join(' | '))
  await w.b.close()
}
writeFileSync(join(OUT, 'measured.json'), JSON.stringify(measured, null, 1))
