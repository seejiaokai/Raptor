/* MOCK-UP — [RALLY-PER-FORMATION], his ruling D1026 (19 Oct 26): "For normal and edit schedule I'm thinking we can
   title R then B. Which is rally then brief on the 2nd column. And TO then LD in the third column. Both a row each" ·
   "remove the typed row option for rally at the top. The button will just be intime only. The rally will now be a new
   box at the formation area to just put the timing" · "So it's just +in-time. No Rally".

   Drawn on the REAL running app (the method: .claude/skills/brainstorming/mockups-on-the-real-app.md). Nothing is
   built: the script signs in, photographs each surface as it is today, then applies ONE transform on the page and
   photographs it again at the same size.

   THE PICTURE HE RULED FROM was his own iPhone's Scheduler Board ("Go 2 · Night wave", the typed lines ringed orange, a
   Rally box drawn in blue beside B / TO / LD — the batch chat's scratch picture `rally-idea-marked.png`, 19 Oct 26). So
   his "edit schedule" is read as the Scheduler Board and his "normal" as the week (View-only Sched, and Edit Schedule's
   week, which draws the same table) — both are drawn here.

   THE CASE: Monday's WAVE 1 in the demo week. VL: in-time line 09:40, RALLY 10:10 typed in its new box, suggested brief
   10:20, take-off 12:40, landing 14:05. RU: in-time line 10:40, NO rally (its box left empty), brief 11:20, 13:40, 15:05.
   The night wave (Go 2) is transformed too with empty rally boxes, so the board reads the same all the way down.

   THE TRANSFORM (moves and clones only — no style the app does not already have, except the two named below):
     The week (View-only Sched, Edit Schedule): heading "B/TO · LD" → "R/B · TO/LD"; in each flying line's second cell a
     RALLY time is cloned from that line's own TO (same element, same look: the plain grey time, editable on Edit
     Schedule) and put above the gold B; the TO is MOVED into the third cell, above LD. Column widths unchanged.
     An empty rally: on Edit Schedule the app's own empty-box dash; on View-only Sched an empty line, so B stays on the
     second line in every formation (a design point put to him — question 4).
     The Scheduler Board: "B · TO · LD" (three boxes in a line) → two stacked cells, "R over B" and "TO over LD"; the R
     box is a clone of the line's own TO box. NEW STYLE 1: 4px between the two stacked boxes. NEW STYLE 2 (phone): the
     freed time column goes to the mission box (the mission spans two tracks), so the pucks and remarks underneath keep
     their widths; on a desktop the freed column goes to the crew and remarks columns.
     The button "+ In-time / Rally" reads "+ In-time" on Edit Schedule's week and the board.
   MARKS: orange = today's place, blue = the proposed one (the colours of the picture he ruled from).

   Run: HP_URL=http://localhost:4181 node scripts/handpass/mock-rally-box.mjs
   Pictures: docs/img/handpass/2026-10-19-rally-box/ */
import { existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..', '..')
const BASE = process.env.HP_URL || 'http://localhost:4181'
const OUT = resolve(ROOT, 'docs/img/handpass/2026-10-19-rally-box')
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const sleep = ms => new Promise(r => setTimeout(r, ms))
const errors = []
const RALLY = { '0.0': '10:10' }          /* day 0, wave 0, formation 0 (VL) — every other formation's box stays empty */

async function open(browser, { width, height, dsf, phone }) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dsf, ...(phone ? { isMobile: true, hasTouch: true } : {}) })
  const p = await ctx.newPage()
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  p.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  await p.goto(BASE + '/')
  await p.waitForSelector('#luser', { state: 'visible', timeout: 8000 })
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important} #toastEl{display:none !important} *{caret-color:transparent !important}' })
  return { ctx, p }
}

/* ---- in-page helpers, installed once per page ---- */
const HELPERS = () => {
  /* the faint suggestion inside an empty box (D1028): the suggested brief's own colour, the app's accent, at the
     strength the app already gives an empty box's dash (12-schedule-editing.css: opacity .55) — a NEW use of both */
  const st = document.createElement('style')
  st.textContent = '.mk-ghost:empty::before{content:attr(data-ghost) !important;color:var(--accent) !important;opacity:.6 !important}'
    + ' input.mk-ghost::placeholder{color:var(--accent);opacity:.6}'
  document.head.appendChild(st)
  window.__mk = {
    lead() { return (window.VCONF && window.VCONF.reportLead) || 180 },
    minus(hm, min) { const m = /^(\d\d?):?(\d\d)$/.exec(String(hm).trim()); if (!m) return ''; let t = (+m[1] * 60 + +m[2] - min + 1440) % 1440; return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0') },
    clearMarks() { document.querySelectorAll('.mk-mark').forEach(n => n.remove()) },
    /* a ring round a viewport rectangle, with a small label chip */
    mark(r, color, label, pad = 3, labelSide = 'top') {
      const d = document.createElement('div'); d.className = 'mk-mark'
      Object.assign(d.style, { position: 'fixed', left: (r.left - pad) + 'px', top: (r.top - pad) + 'px', width: (r.width + pad * 2) + 'px', height: (r.height + pad * 2) + 'px', border: `2px solid ${color}`, borderRadius: '4px', zIndex: 99999, pointerEvents: 'none', boxSizing: 'border-box' })
      if (label) {
        const l = document.createElement('div'); l.textContent = label
        const rightSide = r.left + 230 > document.documentElement.clientWidth   /* keep the label inside the picture */
        Object.assign(l.style, { position: 'absolute', [rightSide ? 'right' : 'left']: '-2px', [labelSide === 'top' ? 'bottom' : 'top']: '100%', background: color, color: '#0b0f14', font: '700 9px/1.4 system-ui,sans-serif', padding: '1px 5px', borderRadius: '3px', whiteSpace: 'nowrap', letterSpacing: '.03em' })
        d.appendChild(l)
      }
      document.body.appendChild(d)
    },
    union(els) {
      const rs = els.filter(Boolean).map(e => e.getBoundingClientRect()).filter(r => r.width && r.height)
      const left = Math.min(...rs.map(r => r.left)), top = Math.min(...rs.map(r => r.top)), right = Math.max(...rs.map(r => r.right)), bottom = Math.max(...rs.map(r => r.bottom))
      return { left, top, width: right - left, height: bottom - top }
    },
    weekRoot(page) { return document.querySelector(page === 'editsched' ? '#page-editsched' : '#page-viewsched') },
    firstWave(page) {
      const day = [...this.weekRoot(page).querySelectorAll('.day')].find(d => d.offsetWidth)
      return day && day.querySelector('.go:not(.sa)')
    },
    /* the week: R over B in the second cell, TO over LD in the third */
    weekTransform(page) {
      const ed = page === 'editsched'
      const day = [...this.weekRoot(page).querySelectorAll('.day')].find(d => d.offsetWidth)
      let n = 0
      const di = [...this.weekRoot(page).querySelectorAll('.day')].indexOf(day)
      day.querySelectorAll('.go').forEach((go, gi) => {
        if (go.classList.contains('sa')) return
        const cols = go.querySelector('.formcols'); const sp = cols.children
        sp[1].innerHTML = 'R<br>B'; sp[2].innerHTML = 'TO<br>LD'
        const add = go.querySelector('[data-itadd]'); if (add) { add.textContent = '+ In-time'; add.title = 'Add an In-time line to this wave' }
        go.querySelectorAll('.itx').forEach(x => { x.title = x.ariaLabel = 'Remove this In-time line' })
        go.querySelectorAll('.form').forEach((form, li) => {
          const bto = form.querySelector('.fcell.bto'), ld = form.querySelector('.fcell.ld')
          const toEl = ed ? bto.querySelector('[data-txt$=".to"]') : [...bto.children].find(c => c.tagName === 'SPAN' && !c.classList.contains('bsug'))
          const val = RALLY_VALUES[`${gi}.${li}`] || ''
          const r = toEl.cloneNode(false); r.classList.add('mk-new')
          if (ed) { r.dataset.txt = `ff:${di}.${gi}.${li}.rl`; r.textContent = val }
          else r.textContent = val || ' '
          bto.insertBefore(r, bto.firstChild)
          if (ed) {
            /* D1028: the suggested brief moves into its own empty box; an empty rally box shows its default (D1027) */
            const sug = bto.querySelector('.bsug'), bEl = bto.querySelector('b[data-txt$=".br"]')
            if (sug && bEl && !bEl.textContent.trim()) { bEl.classList.add('mk-ghost'); bEl.dataset.ghost = sug.dataset.bval; sug.remove() }
            if (!val) { r.classList.add('mk-ghost'); r.dataset.ghost = __mk.minus(toEl.textContent.trim(), __mk.lead()) }
          }
          /* the desktop week draws B/TO smaller than LD today; with R/B and TO/LD the two columns would read as two
             sizes, so the four times take LD's own size (the app's value, not a new one — a point for the build) */
          const ldSize = getComputedStyle(ld.querySelector('[data-txt$=".ld"], span') || ld).fontSize
          if (!matchMedia('(max-width: 820px)').matches) [r, toEl, ...bto.querySelectorAll(':scope > b')].forEach(e => { e.style.fontSize = ldSize })
          ld.insertBefore(toEl, ld.firstChild)
          n++
        })
      })
      return n
    },
    /* the board: two stacked cells in place of three boxes in a line */
    /* oneLine: the desktop alternative — R as a fourth box in the line, R · B · TO · LD (question 1's option B) */
    boardTransform(oneLine = false) {
      const b = document.querySelector('#schedBoard')
      const sbw = document.querySelector('.schedboard')
      const isWide = sbw && sbw.classList.contains('sb-wide')
      const phone = !isWide && matchMedia('(max-width: 820px)').matches
      const tpl = oneLine ? '18px 64px 74px 52px 52px 52px 52px 1fr 1fr 1.2fr 92px'
        : phone ? '20px 56px 70px minmax(0,1fr) 46px 46px'
        : isWide ? '18px 64px 74px 54px 54px 1fr 1fr 92px 92px' : '18px 64px 74px 52px 52px 1fr 1fr 1.2fr 92px'
      let n = 0
      b.querySelectorAll('.sb-lcols').forEach(h => {
        const c = h.children; if (c.length < 6 || c[3].textContent.trim() !== 'B') return
        h.style.gridTemplateColumns = tpl
        if (oneLine) { const r = c[3].cloneNode(false); r.textContent = 'R'; h.insertBefore(r, c[3]); return }
        c[3].innerHTML = 'R<br>B'; c[4].innerHTML = 'TO<br>LD'; c[5].style.display = 'none'
        c[3].style.lineHeight = c[4].style.lineHeight = '1.25'
        if (phone) c[2].style.gridColumn = '3 / 5'
      })
      b.querySelectorAll('[data-itadd]').forEach(x => { x.textContent = '+ In-time'; x.title = 'Add an In-time line to this wave' })
      b.querySelectorAll('.itx, [data-itdel]').forEach(x => { x.title = 'Remove this In-time line'; x.setAttribute('aria-label', 'Remove this In-time line') })
      b.querySelectorAll('.sb-line').forEach(line => {
        const bcell = line.querySelector(':scope > .sb-bcell'); const toIn = line.querySelector(':scope > input.tm[data-bfld$=".to"]'), ldIn = line.querySelector(':scope > input.tm[data-bfld$=".ld"]')
        if (!bcell || !toIn || !ldIn) return
        const key = toIn.dataset.bfld.replace(/^ff:/, '').replace(/\.to$/, ''); const [di, gi, li] = key.split('.')
        line.style.gridTemplateColumns = tpl
        if (phone) line.querySelector(':scope > .msn').style.gridColumn = '3 / 5'
        const r = toIn.cloneNode(false); r.classList.add('mk-new'); r.dataset.bfld = `ff:${di}.${gi}.${li}.rl`
        r.value = RALLY_VALUES[`${gi}.${li}`] || ''; r.setAttribute('value', r.value)
        r.removeAttribute('placeholder')
        /* D1028: each suggestion inside its own empty box — the brief's (the blue line above B goes) and the default
           rally's (D1027: take-off less the Logic page's time, 3 hours to start) */
        const sug = bcell.querySelector('.bsug'), bIn = bcell.querySelector('input')
        if (sug && bIn && !bIn.value) { bIn.placeholder = sug.dataset.bval; bIn.classList.add('mk-ghost'); sug.remove() }
        if (!r.value) { r.placeholder = __mk.minus(toIn.value, __mk.lead()); r.classList.add('mk-ghost') }
        if (oneLine) { line.insertBefore(r, bcell); n++; return }
        bcell.insertBefore(r, bcell.firstChild); bcell.style.gap = '4px'
        const stack = document.createElement('div'); stack.className = 'sb-bcell mk-new'; stack.style.gap = '4px'
        line.insertBefore(stack, toIn); stack.appendChild(toIn); stack.appendChild(ldIn)
        n++
      })
      return { n, phone, isWide }
    },
  }
}

async function install(p) {
  await p.evaluate(`var RALLY_VALUES=${JSON.stringify(RALLY)};(${HELPERS.toString()})()`)
}
async function shot(p, name, rect, vw, vh) {
  const pad = 12
  const x = Math.max(0, Math.floor(rect.left - pad)), y = Math.max(0, Math.floor(rect.top - pad - 14))
  const w = Math.min(vw - x, Math.ceil(rect.width + pad * 2)), h = Math.min(vh - y, Math.ceil(rect.height + pad * 2 + 14))
  await p.screenshot({ path: `${OUT}/${name}.png`, clip: { x, y, width: w, height: h } })
  console.log('picture', name, w + 'x' + h)
}

/* ---- the week ---- */
async function week(p, page, sz, nums) {
  await p.evaluate(pg => window.go(pg), page); await sleep(900); await install(p)
  const topbar = await p.evaluate(() => { const t = document.querySelector('.topbar'); return t ? t.getBoundingClientRect().bottom : 0 })
  /* every scroll first, inject last (the method's first trap) */
  await p.evaluate(({ pg, top }) => {
    const go = __mk.firstWave(pg); const sc = go.closest('.day-body') || go.closest('.day')
    go.scrollIntoView({ block: 'start' }); window.scrollBy(0, -(top + 30))
    const s = [...document.querySelectorAll('*')].find(e => e.contains(go) && e.scrollHeight > e.clientHeight + 4 && getComputedStyle(e).overflowY.match(/auto|scroll/))
    if (s) s.scrollTop -= 0
  }, { pg: page, top: topbar })
  await sleep(300)
  const region = async () => p.evaluate(pg => {
    const go = __mk.firstWave(pg); const forms = go.querySelectorAll('.form')
    const r = __mk.union([go.querySelector('.go-tab'), forms[forms.length - 1], go.querySelector('.area, .areacell') && null])
    const g = go.getBoundingClientRect(); const last = forms[forms.length - 1].getBoundingClientRect()
    return { left: g.left, top: g.top, width: g.width, height: Math.min(last.bottom + 24, g.bottom) - g.top }
  }, page)
  /* TODAY */
  await p.evaluate(pg => {
    __mk.clearMarks(); const go = __mk.firstWave(pg)
    const cols = go.querySelector('.formcols').children, forms = [...go.querySelectorAll('.form')]
    __mk.mark(__mk.union([cols[1], cols[2], ...forms.map(f => f.querySelector('.fcell.ld')), ...forms.map(f => f.querySelector('.fcell.bto'))]), '#FF8A00', 'TODAY: B over TO, LD alone', 3, 'bottom')
    const add = go.querySelector('[data-itadd]'); if (add) __mk.mark(add.getBoundingClientRect(), '#FF8A00', 'TODAY', 2)
  }, page)
  await sleep(150)
  const rt = await region(); await shot(p, `${nums[0]}-${sz.tag}-${page}-today`, rt, sz.width, sz.height)
  /* PROPOSED */
  const n = await p.evaluate(pg => { __mk.clearMarks(); return __mk.weekTransform(pg) }, page)
  if (!n) throw new Error('week transform found no flying line')
  await sleep(150)
  await p.evaluate(pg => {
    const go = __mk.firstWave(pg)
    if (!go.querySelector('.mk-new')) throw new Error('premise gone: no drawn-in rally')
    const cols = go.querySelector('.formcols').children, forms = [...go.querySelectorAll('.form')]
    __mk.mark(__mk.union([cols[1], cols[2], ...forms.map(f => f.querySelector('.fcell.ld')), ...forms.map(f => f.querySelector('.fcell.bto'))]), '#1E9BFF', 'PROPOSED: R over B · TO over LD', 3, 'bottom')
    const add = go.querySelector('[data-itadd]'); if (add) __mk.mark(add.getBoundingClientRect(), '#1E9BFF', 'PROPOSED', 2)
  }, page)
  await sleep(150)
  const rp = await region(); await shot(p, `${nums[1]}-${sz.tag}-${page}-proposed`, rp, sz.width, sz.height)
  /* measured: the formation row's height before and after (the week must not grow) */
  return n
}

/* ---- the Scheduler Board ---- */
async function board(p, sz, nums, oneLine = false) {
  await p.evaluate(() => window.go('editsched')); await sleep(600)
  await p.evaluate(() => window.openScheduler(0)); await p.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(900)
  await install(p)
  await p.evaluate(() => {
    const head = document.querySelector('#schedBoard [data-itadd]')
    head.scrollIntoView({ block: 'start' })
    const sc = [...document.querySelectorAll('#schedBoard *')].find(e => e.contains(head) && e.scrollHeight > e.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(e).overflowY))
    if (sc) sc.scrollTop -= 120
  })
  await sleep(400)
  const region = async () => p.evaluate(() => {
    const b = document.querySelector('#schedBoard'); const cols = b.querySelector('.sb-lcols')
    const lines = [...b.querySelectorAll('.sb-line')].filter(l => l.querySelector('[data-bfld^="ff:0.0."]'))
    const head = b.querySelector('[data-itadd]')
    const wave = head.closest('[data-move^="mv:w."]') || head.parentElement.parentElement
    const r = __mk.union([head.parentElement, cols, lines[lines.length - 1]])
    const w = wave.getBoundingClientRect()
    return { left: Math.min(r.left, w.left), top: r.top - 36, width: Math.max(r.width, w.width), height: r.height + 44 }
  })
  /* one ring per line round its time boxes, the label on the first only */
  const markIt = async (color, label) => p.evaluate(({ color, label }) => {
    __mk.clearMarks(); const b = document.querySelector('#schedBoard'); const cols = b.querySelector('.sb-lcols')
    const lines = [...b.querySelectorAll('.sb-line')].filter(l => l.querySelector('[data-bfld^="ff:0.0."]'))
    const hc = [...cols.children].filter(c => /^(R|B|TO|LD|RB|TOLD)$/.test(c.textContent.replace(/[ \n\t]/g, '')) && c.offsetWidth)
    __mk.mark(__mk.union(hc), color, label, 3)
    lines.forEach(l => __mk.mark(__mk.union([...l.querySelectorAll('.sb-bcell, input.tm')]), color, '', 3))
    const add = b.querySelector('[data-itadd]'); __mk.mark(add.getBoundingClientRect(), color, color === '#FF8A00' ? 'TODAY' : 'PROPOSED', 2)
  }, { color, label })
  const lineH = () => p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-line')].filter(l => l.querySelector('[data-bfld^="ff:0.0."]')).map(l => Math.round(l.getBoundingClientRect().height)))
  const hToday = await lineH()
  if (nums[0]) { await markIt('#FF8A00', 'TODAY: B · TO · LD in a line'); await sleep(150); await shot(p, `${nums[0]}-${sz.tag}-board-today`, await region(), sz.width, sz.height) }
  const res = await p.evaluate(o => { __mk.clearMarks(); return __mk.boardTransform(o) }, oneLine)
  if (!res.n) throw new Error('board transform found no line')
  await sleep(200)
  await p.evaluate(() => { if (!document.querySelector('#schedBoard .mk-new')) throw new Error('premise gone') })
  await markIt('#1E9BFF', oneLine ? 'OPTION B: R · B · TO · LD in a line' : 'PROPOSED: R over B · TO over LD'); await sleep(150)
  await shot(p, `${nums[1]}-${sz.tag}-board-${oneLine ? 'oneline' : 'proposed'}`, await region(), sz.width, sz.height)
  const hAfter = await lineH()
  console.log('board', JSON.stringify(res), 'line heights today', hToday.join(','), '→ proposed', hAfter.join(','))
  const m = await p.evaluate(() => {
    const l = [...document.querySelectorAll('#schedBoard .sb-line')].find(x => x.querySelector('[data-bfld="ff:0.0.0.rl"]'))
    const box = s => { const e = l.querySelector(s); const r = e && e.getBoundingClientRect(); return r && [Math.round(r.width), Math.round(r.height)] }
    return { r: box('[data-bfld$=".rl"]'), b: box('input[data-bfld$=".br"]'), to: box('[data-bfld$=".to"]'), ld: box('[data-bfld$=".ld"]'), msn: box('.msn'), rmk: box('.nts') }
  })
  console.log('board sizes after', JSON.stringify(m))
}

const browser = await chromium.launch(LAUNCH)
const SIZES = [
  { tag: 'phone', width: 402, height: 874, dsf: 3, phone: true },       /* his iPhone 17 Pro's width, its own density */
  { tag: 'desk', width: 1440, height: 900, dsf: 2 },
]
const before = {}
for (const sz of SIZES) {
  const ph = sz.tag === 'phone'
  const { ctx, p } = await open(browser, sz)
  /* the row heights today, measured before any transform, to compare */
  if (ph) {
    await week(p, 'viewsched', sz, ['01', '02'])
    await week(p, 'editsched', sz, ['03', '04'])
  } else {
    await week(p, 'editsched', sz, ['07', '08'])
  }
  await ctx.close()
  const b2 = await open(browser, sz)
  await board(b2.p, sz, ph ? ['05', '06'] : ['09', '10'])
  await b2.ctx.close()
  if (!ph) { const b3 = await open(browser, sz); await board(b3.p, sz, [null, '11'], true); await b3.ctx.close() }
}
await browser.close()
console.log('errors:', errors.length ? errors.join('\n') : 'none')
