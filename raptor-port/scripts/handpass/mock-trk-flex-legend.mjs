/* MOCK-UP of [TRK-FLEX-SETTING] (D1006, D1014) and [TRK-LEGEND] (D1007), 18 Oct 26, drawn on the REAL app — the Tracker,
   at a desktop's size (1440 x 900 at 1x) and his phone's (390 x 844 at 3x, touch). Nothing here is built.
   What is REAL: the Tracker as it stands (Student A's Last Flown dates set through the app's own date boxes, so the
   Currency & flex bars wear real colours: last syllabus flight 15 days ago, last currency flight 3 days ago).
   What is DRAWN IN, each cloned from a real neighbour, never restyled:
     · the settings icon ⚙ — the Tracker's own icon button (ⓘ, `.sm.icon`) wearing the app's cog, the same character
       the Inputs page's settings button prints (`#inGear`, &#9881; — D635: the app's own cog);
     · the "Legend" button — a clone of the Tracker's own "☰ Show All" button (`.sm`), with the Leave War's word for it;
     · the flex settings window — a clone of the Inputs calendar's settings window (the real one is opened, copied and
       closed again: its frame, title bar, "admins only" line, section headings, number boxes, Cancel / Save), its
       on/off switch the Logic page's whole-squadron switch (`.lgmix`, read-only `.lg-switch-read` for a member), each
       band's meaning the Info panel's own flex bar (its colours and size measured from the live bar);
     · the legend pop-out — the Leave War's "Legend" pop-out (`.leglist`), every value measured from the live one; its
       balls are copies of real balls taken off the chart, re-coloured with the chart's own colours and marks
       (core.js ballGroup: GRADE_FILL, the fail tick, the cyan edge, the gold and turquoise rings, same sizes);
     · "flex off" — the Info panel with the flex parts hidden (nothing re-styled).
   Red rings (#FF3B30) sit OUTSIDE what changed; a dark caption at the foot says which picture is real.
   usage: node scripts/handpass/mock-trk-flex-legend.mjs [baseURL] [outDir]   (the served build, e.g. :4174) */
import { createRequire } from 'node:module'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const base = process.argv[2] || 'http://localhost:4174'
const out = process.argv[3] || 'docs/img/handpass/2026-10-18-trk-flex-legend'
mkdirSync(out, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errors = []
const facts = {}
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }
const DESK = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }

async function signIn(dev, user, pass) {
  const ctx = await b.newContext({ baseURL: base, ...dev })
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(e.message))
  await p.goto('/'); await p.fill('#luser', user); await p.fill('#lpass', pass); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(400)
  return { ctx, p }
}

/* ---- templates taken from the live app (admin session) ---- */
async function takeTemplates(p) {
  await p.evaluate(() => window.go('inputs')); await p.waitForTimeout(700)
  await p.click('#inGear'); await p.waitForSelector('[data-testid=win-inputsset]'); await p.waitForTimeout(300)
  const winHTML = await p.evaluate(() => document.querySelector('[data-testid=win-inputsset]').outerHTML)
  await p.click('[data-testid=iset-cancel]'); await p.waitForTimeout(200)
  await p.evaluate(() => window.go('leavewar')); await p.waitForTimeout(1000)
  await p.click('[data-testid=legend-open]'); await p.waitForSelector('[data-testid=legend]'); await p.waitForTimeout(200)
  const legCSS = await p.evaluate(() => {
    const props = ['background-color', 'border-top', 'border-right', 'border-bottom', 'border-left', 'border-radius', 'box-shadow', 'width', 'padding',
      'font-size', 'font-weight', 'letter-spacing', 'text-transform', 'color', 'line-height', 'gap', 'display', 'align-items', 'font-family',
      'overflow', 'min-width', 'text-align', 'flex']
    const take = (sel, skip = []) => {
      const e = document.querySelector('[data-testid=legend] ' + sel) || document.querySelector(sel)
      const cs = getComputedStyle(e)
      return props.filter(k => !skip.includes(k)).map(k => `${k}:${cs.getPropertyValue(k)}`).join(';')
    }
    return {
      box: take('.leglist'.replace('[data-testid=legend] ', ''), []),
      hd: take('.umlist-hd', ['width']),
      body: take('.leglist-body', ['width']),
      sec: take('.leg-sec', ['width']),
      row: take('.leg-row', ['width']),
      t: take('.leg-t', ['width']),
      sw: take('.leg-sw', ['width']),
    }
  })
  await p.click('[data-testid=legend-scrim]', { position: { x: 3, y: 3 } })
  return { winHTML, legCSS }
}

async function openTracker(p, phone) {
  await p.evaluate(() => window.go('tracker')); await p.waitForTimeout(1200)
  await p.waitForSelector('#page-tracker g.ball', { state: 'attached' })
}
const tab = async (p, v) => { const t = p.locator(`#viewtabs button[data-view=${v}]`); if (await t.isVisible()) { await t.click(); await p.waitForTimeout(400) } }

/* Student A's two Last Flown dates, through the app's own date boxes and calendar (a pick is the save — D801) */
async function setDates(p, phone) {
  if (phone) await tab(p, 'info')
  const pick = async (id, back) => {
    await p.evaluate(id => { const e = document.getElementById(id); e.scrollIntoView({ block: 'center' }) }, id)
    await p.click('#' + id); await p.waitForSelector('.dcal [data-iso]'); await p.waitForTimeout(150)
    const iso = await p.evaluate(back => {
      const t = document.querySelector('.dcal').dataset.today; const [y, m, d] = t.split('-').map(Number)
      const dt = new Date(y, m - 1, d - back); return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0')
    }, back)
    let tries = 0
    while (!(await p.locator(`.dcal [data-iso="${iso}"]`).count()) && tries++ < 3) { await p.click('.dcal-nav >> nth=0'); await p.waitForTimeout(120) }
    await p.click(`.dcal [data-iso="${iso}"]`); await p.waitForTimeout(250)
    return iso
  }
  facts.lastSyll = await pick('lastSyll', 15)
  facts.lastCurr = await pick('lastCurr', 3)
  if (phone) await tab(p, 'flow')
}

/* the bar colours, resolved inside the Tracker (its variables live under #page-tracker) */
async function barColours(p) {
  return p.evaluate(() => {
    const host = document.querySelector('#page-tracker .tr-root'); const e = document.createElement('div'); host.appendChild(e)
    const r = {}; for (const v of ['marg', 'orange', 'red', 'grey', 'bg']) { e.style.background = `var(--${v})`; r[v] = getComputedStyle(e).backgroundColor }
    e.remove()
    const fb = document.querySelector('#page-tracker .flexbar'); const cs = getComputedStyle(fb)
    r.bar = ['padding', 'border-radius', 'font-weight', 'font-size', 'text-align', 'line-height', 'font-family'].map(k => `${k}:${cs.getPropertyValue(k)}`).join(';')
    return r
  })
}

/* ---- marks on the picture ---- */
const ring = (p, sels) => p.evaluate(sels => {
  for (const sel of sels) {
    const els = typeof sel === 'string' ? [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width) : []
    if (!els.length) throw new Error('premise gone: ' + sel)
    const rs = els.map(e => e.getBoundingClientRect())
    const pad = 5
    const l = Math.max(2, Math.min(...rs.map(r => r.left)) - pad), t = Math.max(2, Math.min(...rs.map(r => r.top)) - pad)
    const r = Math.min(innerWidth - 2, Math.max(...rs.map(r => r.right)) + pad), bt = Math.min(innerHeight - 2, Math.max(...rs.map(r => r.bottom)) + pad)
    const m = document.createElement('div'); m.setAttribute('data-mock', 'ring')
    m.style.cssText = `position:fixed;left:${l}px;top:${t}px;width:${r - l}px;height:${bt - t}px;box-sizing:border-box;border:2.5px solid #FF3B30;border-radius:9px;pointer-events:none;z-index:2147483646`
    document.body.appendChild(m)
  }
}, sels)
const caption = (p, text, top) => p.evaluate(({ text, top }) => {
  document.querySelectorAll('[data-mock=cap]').forEach(e => e.remove())
  const c = document.createElement('div'); c.setAttribute('data-mock', 'cap'); c.textContent = text
  c.style.cssText = 'position:fixed;left:6px;bottom:6px;max-width:calc(100% - 12px);box-sizing:border-box;padding:5px 9px;border-left:3px solid #FF3B30;border-radius:6px;background:rgba(0,0,0,.86);color:#fff;font:600 12px/1.3 "Segoe UI",Arial,sans-serif;pointer-events:none;z-index:2147483647'
  if (top != null) { c.style.bottom = 'auto'; c.style.top = top + 'px' }
  document.body.appendChild(c)
}, { text, top })
const clearMarks = p => p.evaluate(() => document.querySelectorAll('[data-mock=ring],[data-mock=cap]').forEach(e => e.remove()))
const shot = async (p, name, clip) => { await p.screenshot({ path: `${out}/${name}.png`, ...(clip ? { clip } : {}) }); await clearMarks(p) }

/* ---- the drawn-in bar: ⚙ and Legend ---- */
async function addBar(p) {
  return p.evaluate(() => {
    const H = document.querySelector('#page-tracker header'); const before = H.getBoundingClientRect().height
    if (!document.getElementById('mockGear')) {
      const g = document.getElementById('detailsBtn').cloneNode(true)
      g.id = 'mockGear'; g.classList.remove('primary'); g.textContent = '⚙'; g.title = 'Flex settings'
      g.setAttribute('data-mock', 'gear')
      document.getElementById('barHideBtn').before(g)
      const l = document.getElementById('showAllBtn').cloneNode(true)
      l.id = 'mockLegendBtn'; l.textContent = 'Legend'; l.title = 'What the balls, bars and flex mean'
      l.setAttribute('data-mock', 'legend-btn')
      document.getElementById('showAllBtn').after(l)
    }
    /* the colour strip under the bar moves into the Legend (recommended): hidden, not deleted */
    const strip = document.querySelector('#page-tracker .legend'); if (strip) strip.style.display = 'none'
    return { before, after: H.getBoundingClientRect().height }
  })
}
const barRows = p => p.evaluate(() => {
  const mids = [...document.querySelectorAll('#page-tracker header .controls > *')].filter(e => e.getBoundingClientRect().width && e.getBoundingClientRect().height).map(e => { const r = e.getBoundingClientRect(); return r.top + r.height / 2 }).sort((a, b) => a - b)
  const tops = { size: mids.filter((m, i) => i === 0 || m - mids[i - 1] > 14).length }
  const H = document.querySelector('#page-tracker header').getBoundingClientRect()
  const ss = document.getElementById('saveStat'); const g = document.getElementById('mockGear')?.getBoundingClientRect()
  return { rows: tops.size, height: Math.round(H.height), saveStatClipped: ss ? ss.scrollWidth > ss.clientWidth : null, gear: g && { x: Math.round(g.x), y: Math.round(g.y), w: Math.round(g.width), h: Math.round(g.height) } }
})

/* ---- the flex settings window, cloned from the Inputs calendar's ---- */
const BANDS = [
  { from: 0, words: 'Current — no flex required', col: 'marg' },
  { from: 7, words: '1 Optional Flex', col: 'orange' },
  { from: 14, words: '1 Mando Flex (Convertible)', col: 'red' },
  { from: 21, words: '2 Mando Flex (1 Mando, 1 Convertible)', col: 'red' },
  { from: 31, words: '2 Mando Flex (2 Mando)', col: 'red' },
  { from: 60, words: 'Short Refresher Course', col: 'grey' },
  { from: 120, words: 'Re-course', col: 'grey' },
]
async function showWin(p, { winHTML, cols, member }) {
  await p.evaluate(({ winHTML, cols, member, BANDS }) => {
    document.querySelectorAll('[data-mock=win],[data-mock=wincss]').forEach(e => e.remove())
    const st = document.createElement('style'); st.setAttribute('data-mock', 'wincss')
    st.textContent = `
.mock-bands{display:grid;grid-template-columns:72px 58px minmax(0,1fr);gap:6px 8px;align-items:center}
.mock-bands .mh{font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3)}
.mock-bands .mh.c{text-align:center}
.mock-bands .to{font-size:13px;color:var(--ink-2);text-align:center;font-variant-numeric:tabular-nums}
.mock-bands .val{width:72px;text-align:center;font-size:16px;font-weight:800;font-variant-numeric:tabular-nums;color:var(--ink)}
.mock-bands .bar{${cols.bar}}
.sset .lgmix{font-size:13px;color:var(--ink);min-height:40px}`
    document.head.appendChild(st)
    const host = document.createElement('div'); host.innerHTML = winHTML
    const win = host.firstElementChild
    win.setAttribute('data-mock', 'win'); win.removeAttribute('data-testid')
    const ttl = win.querySelector('.win-ttl')
    ttl.innerHTML = 'Flex settings<small>' + (member ? 'only an admin can change these' : 'admins only') + '</small>'
    win.setAttribute('aria-label', 'Flex settings')
    const form = win.querySelector('form.sset')
    const num = form.querySelector('.sset-num').cloneNode(true)
    const foot = form.querySelector('.sset-foot')
    form.innerHTML = ''
    const add = h => { const d = document.createElement('div'); d.innerHTML = h; while (d.firstChild) form.appendChild(d.firstChild) }
    add(member
      ? `<span class="lgmix"><span class="lg-switch-read on" role="switch" aria-checked="true" aria-disabled="true"></span><span>Track flex</span></span>`
      : `<label class="lgmix"><input type="checkbox" role="switch" checked aria-label="Track flex"><span>Track flex</span></label>`)
    add(`<p class="sset-hint">Off: the flex bar and the Legend's flex part go, for everyone.</p>`)
    add(`<div class="sset-sec">Days since the last syllabus flight</div>`)
    const grid = document.createElement('div'); grid.className = 'mock-bands'
    grid.innerHTML = `<span class="mh c">From</span><span class="mh c">To</span><span class="mh">Flex</span>`
    BANDS.forEach((bd, i) => {
      let cell
      if (i === 0 || member) { cell = document.createElement('span'); cell.className = 'val'; cell.textContent = String(bd.from) }
      else { cell = num.cloneNode(true); cell.value = String(bd.from); cell.setAttribute('value', String(bd.from)); cell.removeAttribute('data-testid'); cell.setAttribute('aria-label', bd.words + ' from day') }
      grid.appendChild(cell)
      const to = document.createElement('span'); to.className = 'to'; to.textContent = i < BANDS.length - 1 ? String(BANDS[i + 1].from - 1) : 'and over'
      grid.appendChild(to)
      const bar = document.createElement('span'); bar.className = 'bar'; bar.textContent = bd.words
      bar.style.background = cols[bd.col]; bar.style.color = bd.col === 'grey' ? '#fff' : cols.bg
      grid.appendChild(bar)
    })
    form.appendChild(grid)
    if (!member) form.appendChild(foot)
    document.getElementById('root').appendChild(win)
  }, { winHTML, cols, member, BANDS })
  await p.waitForTimeout(150)
  return p.evaluate(() => { const w = document.querySelector('[data-mock=win]').getBoundingClientRect(); return { x: Math.round(w.x), y: Math.round(w.y), w: Math.round(w.width), h: Math.round(w.height), fits: w.bottom <= innerHeight && w.top >= 0 } })
}
const hideWin = p => p.evaluate(() => document.querySelectorAll('[data-mock=win],[data-mock=wincss]').forEach(e => e.remove()))

/* ---- flex OFF on the Info panel (hidden, never re-styled) ---- */
const flexOff = p => p.evaluate(() => {
  const card = document.querySelector('#page-tracker .c-curr'); if (!card) throw new Error('premise gone: currency card')
  const h3 = card.querySelector('h3'); h3.style.display = 'none'
  const n = h3.cloneNode(false); n.style.display = ''; n.textContent = 'Currency'; n.setAttribute('data-mock', 'h3'); h3.after(n)
  const bars = card.querySelectorAll('.flexbar'); bars[1].style.display = 'none'; card.querySelector('.flexPair').style.gridTemplateColumns = '1fr'
  card.querySelectorAll('.curKv .kv').forEach(kv => { if (/syllabus/i.test(kv.textContent)) kv.style.display = 'none' })
  const note = [...card.querySelectorAll('.mini')].find(e => /Flex requirement/.test(e.textContent)); note.style.display = 'none'
  const nn = note.cloneNode(false); nn.style.display = ''; nn.setAttribute('data-mock', 'note'); nn.textContent = 'Landing currency = days since last currency (minus down days).'; note.after(nn)
})
const markInfoToday = p => p.evaluate(() => {
  const card = document.querySelector('#page-tracker .c-curr')
  card.querySelectorAll('.flexbar')[1].setAttribute('data-mock-t', 'flexbar')
  card.querySelectorAll('.curKv .kv').forEach(kv => { if (/syllabus/i.test(kv.textContent)) kv.setAttribute('data-mock-t', 'dsyll') })
  const nt = [...card.querySelectorAll('.mini')].find(e => /Flex requirement/.test(e.textContent)); if (!nt) throw new Error('premise gone: note'); nt.setAttribute('data-mock-t', 'note')
  card.querySelector('h3').setAttribute('data-mock-t', 'h3')
})
const scrollToCard = p => p.evaluate(() => {
  const side = document.getElementById('side'); const card = document.querySelector('#page-tracker .c-curr')
  side.scrollTop += card.getBoundingClientRect().top - side.getBoundingClientRect().top - 12
})

/* ---- the legend pop-out, cloned from the Leave War's ---- */
async function showLegend(p, { legCSS, cols, flexOn, scrollEnd }) {
  return p.evaluate(({ legCSS, cols, flexOn, scrollEnd }) => {
    document.querySelectorAll('[data-mock=leg],[data-mock=legcss]').forEach(e => e.remove())
    const st = document.createElement('style'); st.setAttribute('data-mock', 'legcss')
    st.textContent = `
#page-tracker .mock-leg{position:fixed;z-index:70;${legCSS.box};height:auto}
#page-tracker .mock-leg .m-hd{${legCSS.hd}}
#page-tracker .mock-leg .m-body{${legCSS.body};max-height:min(70vh, calc(100vh - 160px));overflow-y:auto}
#page-tracker .mock-leg .m-sec{${legCSS.sec}}
#page-tracker .mock-leg .m-row{${legCSS.row}}
#page-tracker .mock-leg .m-t{${legCSS.t}}
#page-tracker .mock-leg .m-sw{${legCSS.sw}}
#page-tracker .mock-leg .m-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:0 2px;padding:2px 8px 4px}
#page-tracker .mock-leg .m-tile{display:flex;flex-direction:column;align-items:center;gap:1px;text-align:center}
#page-tracker .mock-leg .m-tile .m-t{font-size:11px}
#page-tracker .mock-leg .m-row.m-ballrow{padding-top:1px;padding-bottom:1px}
#page-tracker .mock-leg .m-note{padding:2px 12px 4px;font-size:11px;line-height:1.3;color:var(--muted)}
#page-tracker .mock-leg svg{display:block;flex:0 0 auto}`
    document.head.appendChild(st)
    /* real balls off the chart, one of each kind */
    const balls = [...document.querySelectorAll('#page-tracker g.ball')]
    const kindOf = g => { const c = g.querySelector('.core'); if (c.querySelector('ellipse')) return 'sim'; if (c.querySelector('polygon')) return 'device'; if (c.querySelector('path')) return 'flight'; return (c.querySelector('rect').getAttribute('fill') || '').toUpperCase() === '#F0555F' ? 'test' : 'acad' }
    const byKind = {}; for (const g of balls) { const k = kindOf(g); if (!byKind[k]) byKind[k] = g }
    const miss = ['flight', 'acad', 'test', 'sim', 'device'].filter(k => !byKind[k]); if (miss.length) throw new Error('premise gone: no ball of kind ' + miss)
    const size = 58, cx = 29, cy = 29, rO = size * 0.47 /* core.js ballGroup */
    const NS = 'http://www.w3.org/2000/svg'
    const svgOf = (g, { fill = [], tick, mine, avail, found } = {}, px = 38) => {
      const k = g.cloneNode(true); k.removeAttribute('transform')
      k.querySelectorAll('.avail,.found,.ftick,.numbg,.numbadge' + (mine ? '' : ',.mine')).forEach(e => e.remove())
      const wedges = [...k.querySelectorAll('.wedge')]
      wedges.forEach((w, i) => w.setAttribute('fill', fill[i] || '#ffffff'))
      if (tick) {
        /* one fail tick across the first student's slice: wedge(0, n), its middle angle (core.js) */
        const n = wedges.length, step = 360 / n, a0 = -90 - step / 2, a1 = -90 + step / 2, rad = ((a0 + a1) / 2) * Math.PI / 180
        const ln = document.createElementNS(NS, 'line')
        ln.setAttribute('x1', (cx + rO * 0.8 * Math.cos(rad)).toFixed(1)); ln.setAttribute('y1', (cy + rO * 0.8 * Math.sin(rad)).toFixed(1))
        ln.setAttribute('x2', (cx + (rO + 3) * Math.cos(rad)).toFixed(1)); ln.setAttribute('y2', (cy + (rO + 3) * Math.sin(rad)).toFixed(1))
        ln.setAttribute('class', 'ftick'); ln.setAttribute('stroke', '#F0555F'); ln.setAttribute('stroke-width', '2.2'); ln.setAttribute('stroke-linecap', 'round')
        k.querySelector('.core').before(ln)
      }
      const circ = (r, stroke, w, cls) => { const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', r); c.setAttribute('fill', 'none'); c.setAttribute('stroke', stroke); c.setAttribute('stroke-width', w); c.setAttribute('class', cls); k.insertBefore(c, k.firstChild.nextSibling) }
      if (avail) circ(rO + 3, '#ffd23f', 2.6, 'avail')
      if (found) circ(rO + 8, '#00e5c8', 2.4, 'found')
      return `<svg viewBox="-8 -8 74 74" width="${px}" height="${px}">${k.outerHTML}</svg>`
    }
    const any = byKind.acad
    const tile = (svg, t) => `<div class="m-tile">${svg}<span class="m-t">${t}</span></div>`
    const row = (sw, t, cls = '') => `<div class="m-row ${cls}">${sw}<span class="m-t">${t}</span></div>`
    const chip = (txt, col) => `<span class="m-sw" style="background:${cols[col]};color:${col === 'grey' ? '#fff' : cols.bg};box-shadow:none;min-width:50px">${txt}</span>`
    const G = { dco: '#000000', dpco: '#1f6dff', marg: '#57C97A', na: '#cdbb8e' } /* core.js GRADE_FILL */
    let h = `<div class="m-hd">What the chart is telling you</div><div class="m-body">`
    h += `<div class="m-sec">The centre — the kind of event</div><div class="m-grid">`
      + tile(svgOf(byKind.flight), 'Flight') + tile(svgOf(byKind.acad), 'Acad / Spec') + tile(svgOf(byKind.test), 'Test')
      + tile(svgOf(byKind.sim), 'Sim') + tile(svgOf(byKind.device), 'CFT / IAT / EPT') + `</div>`
    h += `<div class="m-sec">The ring — one slice per student</div><div class="m-grid">`
      + tile(svgOf(any, { fill: [G.dco] }), 'DCO') + tile(svgOf(any, { fill: [G.dpco] }), 'DPCO') + tile(svgOf(any, { fill: [G.marg] }), 'Marginal')
      + tile(svgOf(any, { fill: [G.na] }), 'N.A.') + tile(svgOf(any), 'Not done') + `</div>`
    h += row(svgOf(any, { tick: true }, 34), 'A failure — one red tick each', 'm-ballrow')
    h += row(svgOf(any, { mine: true }, 34), 'Blue edge — the student picked in Crew', 'm-ballrow')
    h += row(svgOf(any, { avail: true }, 34), 'Gold ring — can be flown next', 'm-ballrow')
    h += row(svgOf(any, { found: true }, 34), 'Turquoise ring — found by Find event', 'm-ballrow')
    h += `<div class="m-sec">Currency — days since the last flight</div>`
    h += row(chip('0–6', 'marg'), 'Landing Current — No IP Required')
    h += row(chip('7 +', 'red'), 'Landing Not Current — IP Required')
    h += `<div class="m-note">Any syllabus flight counts, or a non-syllabus flight put in Last Flown (Currency).</div>`
    if (flexOn) {
      h += `<div class="m-sec">Flex — days since the last syllabus flight</div>`
      const B = [['0–6', 'marg', 'Current — no flex required'], ['7–13', 'orange', '1 Optional Flex'], ['14–20', 'red', '1 Mando Flex (Convertible)'],
        ['21–30', 'red', '2 Mando Flex (1 Mando, 1 Convertible)'], ['31–59', 'red', '2 Mando Flex (2 Mando)'], ['60–119', 'grey', 'Short Refresher Course'], ['120 +', 'grey', 'Re-course']]
      for (const [d, c, w] of B) h += row(chip(d, c), w)
    }
    h += `</div>`
    const box = document.createElement('div'); box.className = 'mock-leg'; box.setAttribute('data-mock', 'leg'); box.setAttribute('role', 'dialog'); box.innerHTML = h
    document.querySelector('#page-tracker .tr-root').appendChild(box)
    const btn = document.getElementById('mockLegendBtn').getBoundingClientRect()
    const W = box.getBoundingClientRect().width
    box.style.left = Math.round(Math.max(6, Math.min(btn.left, innerWidth - W - 6))) + 'px'
    box.style.top = Math.round(btn.bottom + 5) + 'px'
    const body = box.querySelector('.m-body'); if (scrollEnd) body.scrollTop = body.scrollHeight
    const r = box.getBoundingClientRect()
    return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom), scrolls: body.scrollHeight > body.clientHeight + 1, bodyH: body.scrollHeight }
  }, { legCSS, cols, flexOn, scrollEnd })
}
const hideLegend = p => p.evaluate(() => document.querySelectorAll('[data-mock=leg],[data-mock=legcss]').forEach(e => e.remove()))

/* ================= run ================= */
for (const [dn, dev] of [['desk', DESK], ['phone', PHONE]]) {
  const phone = dn === 'phone'
  const F = facts[dn] = {}
  const { ctx, p } = await signIn(dev, 'ad', 'a')
  const T = await takeTemplates(p)
  await openTracker(p, phone)
  await setDates(p, phone)
  const cols = await barColours(p)
  const barClip = phone ? { x: 0, y: 0, width: 390, height: 215 } : { x: 0, y: 0, width: 1440, height: 170 }
  const capTop = phone ? 182 : 140

  /* 1 — the top bar today */
  await caption(p, '1 · TODAY — the real Tracker top bar', capTop)
  await shot(p, `01-topbar-today-${dn}`, barClip)
  F.barToday = await barRows(p)

  /* 2 — ⚙ and Legend drawn in */
  F.barInject = await addBar(p)
  F.barProposed = await barRows(p)
  await ring(p, ['#mockGear', '#mockLegendBtn'])
  await caption(p, '2 · PROPOSED — red rings: ⚙ flex settings and Legend, drawn in' + (phone ? '' : '; the colour strip under the bar moves into Legend'), capTop)
  await shot(p, `02-topbar-proposed-${dn}`, barClip)
  if (phone) {
    /* the same bar in letters a seventh wider — what gives way on his iPhone */
    await p.evaluate(() => { const s = document.createElement('style'); s.setAttribute('data-mock', 'wide'); s.textContent = '#page-tracker header .controls, #page-tracker header .controls *{letter-spacing:.07em !important}'; document.head.appendChild(s) })
    F.barWide = await barRows(p)
    await ring(p, ['#mockGear', '#mockLegendBtn'])
    await caption(p, '2b · PROPOSED, letters ~1/7 wider (his iPhone) — still two rows', capTop)
    await shot(p, `02b-topbar-proposed-wide-${dn}`, barClip)
    await p.evaluate(() => document.querySelectorAll('[data-mock=wide]').forEach(e => e.remove()))
  }

  /* 3 — the flex settings window, admin */
  F.winAdmin = await showWin(p, { winHTML: T.winHTML, cols, member: false })
  await addBar(p)
  await ring(p, ['[data-mock=win]', '#mockGear'])
  await caption(p, '3 · PROPOSED — ⚙ opens Flex settings (admin): switch, then the bands; only the "From" days are typed')
  await shot(p, `03-flex-settings-admin-${dn}`)
  await hideWin(p)

  /* 5 — Info panel today vs flex off */
  if (phone) await tab(p, 'info')
  await scrollToCard(p)
  await markInfoToday(p)
  /* on a phone the note under the bars is hidden by the Tracker's own phone rule (tracker.css `.card>div.mini`) */
  await ring(p, ['[data-mock-t=flexbar]', '[data-mock-t=dsyll]', ...(phone ? [] : ['[data-mock-t=note]'])])
  await caption(p, '5 · TODAY — the real Info panel; red rings: what goes when flex is switched off')
  await shot(p, `05-info-today-${dn}`)
  await flexOff(p)
  await ring(p, ['#page-tracker .c-curr'])
  await caption(p, '6 · PROPOSED, flex OFF — "Currency" only: the flex bar' + (phone ? ' and "Days since syllabus" gone' : ', "Days since syllabus" and the flex sentence gone'))
  await shot(p, `06-info-flex-off-${dn}`)
  if (phone) await tab(p, 'flow')

  /* 7 — the legend, flex on and off */
  await addBar(p)
  F.legOn = await showLegend(p, { legCSS: T.legCSS, cols, flexOn: true })
  await ring(p, ['#mockLegendBtn', '[data-mock=leg]'])
  await caption(p, '7 · PROPOSED — Legend opens a pop-out like the Leave War\'s' + (F.legOn.scrolls ? ' (it scrolls; more below)' : ''))
  await shot(p, `07-legend-${dn}`)
  if (F.legOn.scrolls) {
    await showLegend(p, { legCSS: T.legCSS, cols, flexOn: true, scrollEnd: true })
    await ring(p, ['#mockLegendBtn', '[data-mock=leg]'])
    await caption(p, '7b · PROPOSED — the same Legend scrolled to its end: currency and flex')
    await shot(p, `07b-legend-end-${dn}`)
  }
  F.legOff = await showLegend(p, { legCSS: T.legCSS, cols, flexOn: false })
  await ring(p, ['#mockLegendBtn', '[data-mock=leg]'])
  await caption(p, '8 · PROPOSED, flex OFF — the Legend without its flex part')
  await shot(p, `08-legend-flex-off-${dn}`)
  await hideLegend(p)
  await ctx.close()

  /* 4 — the member's window: read-only */
  const T2 = T
  const m = await signIn(dev, 'us', 'us')
  await openTracker(m.p, phone)
  await setDates(m.p, phone).catch(e => { F.memberDates = 'not set: ' + e.message })
  const cols2 = await barColours(m.p)
  await addBar(m.p)
  F.winMember = await showWin(m.p, { winHTML: T2.winHTML, cols: cols2, member: true })
  await ring(m.p, ['[data-mock=win]', '#mockGear'])
  await caption(m.p, '4 · PROPOSED — the same window for a member: read only, no Save (alternative: no ⚙ for a member — picture 1\'s bar)')
  await shot(m.p, `04-flex-settings-member-${dn}`)
  await m.ctx.close()
}
await b.close()
writeFileSync(`${out}/facts.json`, JSON.stringify({ facts, errors }, null, 1))
console.log(JSON.stringify({ facts, errors }, null, 1))
