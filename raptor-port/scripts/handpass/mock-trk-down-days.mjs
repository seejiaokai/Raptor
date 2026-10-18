/* MOCK-UP of [TRK-DOWN-DAYS-AUTO] (D1002–D1005, 18 Oct 26) on the REAL app — the Tracker's Info panel, at a desktop's size
   (1440 x 900 at 1x) and his phone's (390 x 844 at 3x, touch). Design note: docs/superpowers/specs/2026-10-18-trk-down-days.md.

   THE DEMO MAN. No Tracker demo student is a man on the roster (the course's two are typed names), and no man with medical
   inputs is on the course — so the script ADDS Zenith through the Students card's real "+ Add" box (he carries the seed's
   ATT B 15–19 Jun and its upchit on 20 Jun), and, in this throwaway browser only, files four more medical inputs for him
   through the app's own inputs door (the local-only `fileInput`), so the window shows the busy state: a hospitalisation,
   a half day, an ATT C an upchit cut short (stored as the app stores a cut — its end moved to the day before the upchit),
   and an ATT B still running today. Nothing is written to the repository's data.

   TODAY (picture 1) is the real app: Last Flown dates picked on the app's own calendar, the typed "No. of Down Days" and
   the "Upchit Date" filled in by hand, as an instructor does now.

   PROPOSED (pictures 2–5) — each new part CLONED from a real neighbour, never restyled:
   - "Course start": a clone of the panel's own "Last Flown (Syllabus)" date box (the app's date box, D801), put where the
     "Upchit Date" box was — the grid keeps its two rows, no height added.
   - "No. of Down Days": the same date-box clone (a box that opens something on a tap, like its neighbours), reading the
     worked-out figure, its ▾ swapped for ›; it opens the window below. Not typed.
   - "Days since currency" without "(−N down = Xd)", and the note under the bars without "(minus down days)" (D1004).
   - The down-days window: a clone of the Failures card's full list (FailLog — the same window, header, total pill and ✕),
     one row per medical input in its `.frow` markup; the third column is `auto` instead of the date box's 144px
     (the one style change, said on the page). Dates are written as the Medical tab writes them ("15–19 Jun").
   - The "+ Add" box: the same date-box clone, labelled "Course start", above the roster list (a tap on a name adds him at
     once, so the date has to be set before it).
   Red rings (#FF3B30) sit OUTSIDE what changed; they point, and are not part of the design.

   The down-days figures are WORKED OUT IN THE PAGE from the man's real medical inputs (since the course start, half a
   day for an AM/PM one, a running one counted to today). The one thing NOT stored today is how far an input ran before an
   upchit cut it — the "filed to 25 Sep" in the window is drawn in (see the report: the build must keep it, or read it from
   the change history).

   Letters a seventh wider (his iPhone): the window's middle column gives way (it wraps to a second line); the days column
   and the dates never truncate.
   usage: node scripts/handpass/mock-trk-down-days.mjs [baseURL] [outDir] */
import { createRequire } from 'node:module'
import { existsSync, mkdirSync } from 'node:fs'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const base = process.argv[2] || 'http://localhost:4174'
const out = process.argv[3] || 'docs/img/handpass/2026-10-18-trk-down-days'
mkdirSync(out, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errors = []
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }
const DESK = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }
const COURSE_START = '2026-06-01'
/* the four extra demo inputs (throwaway browser only); the seed already gives him ATT B 15–19 Jun + Upchit 20 Jun */
const EXTRA = [
  { person: 'vinci', type: 'HL', date: 'Aug 3', endDate: 'Aug 4', yr: 2026, allday: true },
  { person: 'vinci', type: 'OML', date: 'Sep 7', yr: 2026, allday: false, half: 'am' },
  { person: 'vinci', type: 'ATT C', date: 'Sep 21', endDate: 'Sep 22', yr: 2026, allday: true },
  { person: 'vinci', type: 'Upchit', date: 'Sep 23', yr: 2026, allday: true },
  { person: 'vinci', type: 'ATT B', date: 'Oct 14', endDate: 'Oct 24', yr: 2026, allday: true },
]
/* how far the cut ATT C was filed to — NOT kept on the input today; drawn in */
const CUT_FILED_TO = { 'ATT C|Sep 21': '25 Sep' }

async function pickDay(p, boxSel, iso) {
  await p.click(boxSel); await p.waitForSelector('.dcal'); await p.waitForTimeout(150)
  for (let i = 0; i < 12 && !(await p.$(`.dcal [data-iso="${iso}"]`)); i++) {
    await p.click('.dcal .dcal-nav[aria-label="Previous month"]'); await p.waitForTimeout(80)
  }
  await p.click(`.dcal [data-iso="${iso}"]`); await p.waitForTimeout(250)
}

async function setup(dev, { phone }) {
  const ctx = await b.newContext({ baseURL: base, ...dev })
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(e.message))
  p.on('dialog', d => { errors.push('dialog: ' + d.message()); d.dismiss() })
  await p.goto('/'); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(400)
  await p.evaluate(rows => { for (const r of rows) window.fileInput(r) }, EXTRA)
  await p.evaluate(() => window.go('tracker')); await p.waitForTimeout(1200)
  if (phone) { await p.click('button[data-view="info"]'); await p.waitForTimeout(300) }
  /* the real "+ Add": pick Zenith from the squadron roster */
  await p.click('#addStu'); await p.waitForSelector('#dlgModal #dlgFilter')
  await p.fill('#dlgFilter', 'Zenith'); await p.waitForTimeout(200)
  await p.locator('#dlgList .dlg-item', { hasText: 'Zenith' }).first().click(); await p.waitForTimeout(700)
  if (await p.$('#dlgModal')) throw new Error('premise gone: the add box did not close')
  await pickDay(p, '#lastSyll', '2026-10-06')
  await pickDay(p, '#lastCurr', '2026-10-08')
  await p.fill('#downDays', '12'); await p.locator('#downDays').blur(); await p.waitForTimeout(200)
  await pickDay(p, '#upchit', '2026-09-23')
  await p.evaluate(() => document.activeElement && document.activeElement.blur())
  await hideToasts(p)
  return { ctx, p }
}
const hideToasts = p => p.evaluate(() => {
  if (!document.querySelector('style[data-mock="toasts"]')) {
    const s = document.createElement('style'); s.setAttribute('data-mock', 'toasts')
    s.textContent = '.toast,#toast,.toasts,[role="status"].toast{display:none!important}'; document.head.appendChild(s)
  }
})
/* bring the Currency & flex card into view, clear of anything stuck at the top */
async function frameCurr(p) {
  await p.evaluate(() => {
    const c = document.querySelector('.c-curr'); c.scrollIntoView({ block: 'center' })
  })
  await p.waitForTimeout(200)
  const clear = await p.evaluate(() => {
    const r = document.querySelector('.c-curr').getBoundingClientRect()
    const at = document.elementFromPoint(r.left + 20, r.top + 4)
    return !!(at && at.closest('.c-curr')) && r.bottom <= innerHeight
  })
  if (!clear) throw new Error('premise gone: the Currency & flex card is not wholly in view')
}
/* red rings OUTSIDE the elements, each with a small tag above its top-right corner */
const ring = (p, items, tags = true) => p.evaluate(({ items, tags }) => {
  document.querySelectorAll('[data-mock="ring"]').forEach(e => e.remove())
  for (const { sel, tag, pad = 5, tagSide = 'outLeft', tagBelow = false, tagX } of items) {
    const els = [...document.querySelectorAll(sel)].filter(e => e.getClientRects().length)
    if (!els.length) throw new Error('premise gone: ' + sel)
    const rs = els.map(e => e.getBoundingClientRect())
    const l = Math.min(...rs.map(r => r.left)) - pad, t = Math.min(...rs.map(r => r.top)) - pad
    const r = Math.max(...rs.map(r => r.right)) + pad, bt = Math.max(...rs.map(r => r.bottom)) + pad
    const m = document.createElement('div'); m.setAttribute('data-mock', 'ring')
    m.style.cssText = `position:fixed;left:${l}px;top:${t}px;width:${r - l}px;height:${bt - t}px;border:2px solid #FF3B30;border-radius:9px;pointer-events:none;z-index:2147483646`
    document.body.appendChild(m)
    if (tag && tags) {
      const g = document.createElement('div'); g.setAttribute('data-mock', 'ring'); g.textContent = tag
      g.style.cssText = `position:fixed;${tagSide === 'outLeft' ? `left:${(tagX ? document.querySelector(tagX).getBoundingClientRect().left : l) - 8}px;transform:translate(-100%,-50%);top:${(t + bt) / 2}px` : `${tagSide === 'right' ? `left:${r}px;transform:translateX(-100%)` : `left:${l}px`};top:${tagBelow ? bt + 2 : t - 17}px`};background:#FF3B30;color:#fff;font:600 10.5px/15px system-ui,sans-serif;padding:0 6px;border-radius:5px;white-space:nowrap;pointer-events:none;z-index:2147483647`
      document.body.appendChild(g)
    }
  }
}, { items, tags })
const unring = p => p.evaluate(() => document.querySelectorAll('[data-mock="ring"]').forEach(e => e.remove()))
const shot = async (p, name) => { await p.screenshot({ path: `${out}/${name}.png` }) }

/* THE PROPOSED PANEL — clones only. `empty`: no course start yet (open point c). */
const propose = (p, { courseStart, empty }) => p.evaluate(({ courseStart, empty }) => {
  const grid = document.querySelector('.c-curr .curGrid')
  const f = [...grid.querySelectorAll(':scope > .field')]
  if (f.length !== 4) throw new Error('premise gone: the four boxes')
  const [syll, curr, down, up] = f
  if (!syll.querySelector('#lastSyll') || !up.querySelector('#upchit') || !down.querySelector('#downDays')) throw new Error('premise gone: box order')
  const strip = n => { n.querySelectorAll('[id]').forEach(e => e.removeAttribute('id')); n.setAttribute('data-mock', 'clone'); return n }
  /* Course start — the "Last Flown (Syllabus)" box, filled (or the empty Upchit box, for the no-start state) */
  const cs = strip((empty ? up : syll).cloneNode(true))
  cs.querySelector('label').textContent = 'Course start'
  const csBtn = cs.querySelector('button.datebox')
  /* the empty box in the app's own empty words (the Upchit box was filled in setup) */
  if (empty) { csBtn.classList.add('is-empty'); csBtn.querySelector('.datebox-txt').textContent = 'Pick a date'; const v0 = csBtn.querySelector('.datebox-v'); v0.textContent = '▾'; v0.style.display = ''; csBtn.setAttribute('aria-label', 'Course start: no date picked') }
  if (!empty) { csBtn.querySelector('.datebox-txt').textContent = courseStart; csBtn.setAttribute('aria-label', 'Course start: ' + courseStart) }
  /* set once, changed by picking another day — no "take this date off" (the boxes that cannot be emptied show ▾) */
  cs.querySelector('.trdatebox-row').classList.remove('has-x'); cs.querySelectorAll('.trdate-x').forEach(x => x.remove())
  cs.classList.add('mock-cs')
  /* No. of Down Days — the "Last Flown (Currency)" box, read-only, opening the window */
  const dd = strip(curr.cloneNode(true))
  dd.querySelector('label').textContent = 'No. of Down Days'
  const row = dd.querySelector('.trdatebox-row'); row.classList.remove('has-x')
  row.querySelectorAll('.trdate-x').forEach(x => x.remove())
  const btn = dd.querySelector('button.datebox'); btn.classList.remove('is-empty')
  btn.setAttribute('aria-haspopup', 'dialog')
  btn.querySelector('.datebox-txt').textContent = empty ? '—' : window.__mockDown.label
  const v = btn.querySelector('.datebox-v'); v.textContent = '›'; v.style.display = ''
  btn.setAttribute('aria-label', 'No. of Down Days: ' + (empty ? 'none counted yet' : window.__mockDown.label) + ' — show each medical input')
  dd.classList.add('mock-dd')
  if (empty) {
    /* the date box's own one line under it (`.datewarn`, the refusal line) carries the prompt */
    const w = document.createElement('span'); w.className = 'datewarn'; w.textContent = 'Set the course start to count them.'
    dd.querySelector('.trdatebox').appendChild(w)
  }
  down.replaceWith(cs); up.replaceWith(dd)
  /* Days since currency — no subtraction (D1004) */
  const kv = [...document.querySelectorAll('.c-curr .curKv .kv')].find(k => k.firstChild.textContent === 'Days since currency')
  const mini = kv.querySelector('b .mini'); if (mini) { mini.previousSibling && mini.previousSibling.nodeType === 3 && mini.previousSibling.remove(); mini.remove() }
  kv.classList.add('mock-kv')
  const note = [...document.querySelectorAll('.c-curr > .mini')].pop()
  note.firstChild.textContent = note.firstChild.textContent.replace(' (minus down days)', '')
  note.classList.add('mock-note')
}, { courseStart, empty })

/* the man's medical inputs since the course start, worked out from the real INPUTS */
const countDown = (p, cut) => p.evaluate(({ start, cut }) => {
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const ord = (lbl, yr) => { const m = /^([A-Z][a-z]{2}) (\d+)(?: (\d{4}))?$/.exec(String(lbl || '')); if (!m) return null; return Date.UTC(+(m[3] || yr), M.indexOf(m[1]), +m[2]) }
  const isoMs = iso => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10))
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  const t = isoMs(today), s0 = isoMs(start), D = 86400000
  const dm = ms => { const d = new Date(ms); return d.getUTCDate() + ' ' + M[d.getUTCMonth()] }
  const rows = []
  const ups = window.INPUTS.filter(r => r.person === 'vinci' && r.type === 'Upchit').map(r => ord(r.date, r.yr))
  for (const r of window.INPUTS) {
    if (r.person !== 'vinci' || !['HL', 'OML', 'ATT C', 'ATT B'].includes(r.type)) continue
    const a = ord(r.date, r.yr), e = ord(r.endDate || r.date, r.yr)
    if (a == null || e == null || e < s0) continue
    const from = Math.max(a, s0), to = Math.min(e, t)
    if (to < from) continue
    const half = !r.allday && (r.half === 'am' || r.half === 'pm')
    const days = half ? 0.5 : (to - from) / D + 1
    const running = e > t
    const cutBy = ups.find(u => u === e + D)
    const filed = cut[r.type + '|' + r.date]
    const sameMonth = new Date(a).getUTCMonth() === new Date(e).getUTCMonth()
    const dates = a === e ? dm(a) : (sameMonth ? new Date(a).getUTCDate() + '–' + dm(e) : dm(a) + ' – ' + dm(e))
    let note = ''
        if (running) note = 'still running · counted to today'
    if (filed && cutBy != null) note = 'cut by an upchit on ' + dm(cutBy) + ' · filed to <s>' + filed + '</s>'
    rows.push({ a, type: r.type, dates: dates + (half ? (r.half === 'am' ? ' (AM)' : ' (PM)') : ''), days, note })
  }
  rows.sort((x, y) => x.a - y.a)
  const total = rows.reduce((n, r) => n + r.days, 0)
  const say = n => (Math.floor(n) ? Math.floor(n) : (n % 1 ? '' : '0')) + (n % 1 ? '½' : '') + ' day' + (n === 1 || n === 0.5 ? '' : 's')
  window.__mockDown = { rows: rows.map(r => ({ ...r, say: say(r.days) })), total, label: say(total) }
  return window.__mockDown
}, { start: COURSE_START, cut })

/* THE DOWN-DAYS WINDOW — the Failures list's own window, opened for real, then cloned and refilled */
const openWindow = (p, courseStartWords) => p.evaluate(async (courseStartWords) => {
  document.querySelector('#failTitle').click()
  await new Promise(r => setTimeout(r, 250))
  const back = document.querySelector('#side > .lullback'), win = document.querySelector('#failLog')
  if (!back || !win) throw new Error('premise gone: the Failures window did not open')
  const b2 = back.cloneNode(true), w2 = win.cloneNode(true)
  b2.setAttribute('data-mock', 'clone'); w2.setAttribute('data-mock', 'clone'); w2.removeAttribute('id'); w2.id = 'mockDown'
  w2.querySelectorAll('[id]').forEach(e => e.removeAttribute('id'))
  const D = window.__mockDown
  w2.querySelector('.lullhd b').textContent = 'Down days — ' + document.querySelector('.c-overall .who').textContent.replace(/^—\s*/, '')
  w2.querySelector('.lullhd .failtot').textContent = D.label
  w2.querySelector('.lullhd button').setAttribute('aria-label', 'Close')
  ;[...w2.children].forEach(c => { if (!c.classList.contains('lullhd')) c.remove() })
  for (const r of D.rows) {
    const row = document.createElement('div'); row.className = 'frow'
    row.style.gridTemplateColumns = 'auto minmax(0,1fr) auto'
    row.innerHTML = `<span class="chip">${r.type}</span><span style="min-width:0"><b style="font-size:12.5px">${r.dates}</b>${r.note ? `<span class="mini" style="display:block;white-space:normal;overflow:visible">${r.note}</span>` : ''}</span><b style="font-size:12.5px;white-space:nowrap">${r.say}</b>`
    w2.appendChild(row)
  }
  const foot = document.createElement('div'); foot.className = 'mini'; foot.style.marginTop = '8px'
  foot.textContent = 'Since the course start, ' + courseStartWords + '. Medical inputs are changed on the Inputs page.'
  w2.appendChild(foot)
  win.parentNode.appendChild(b2); win.parentNode.appendChild(w2)
  document.querySelector('#failLogClose').click()
  await new Promise(r => setTimeout(r, 200))
  if (document.querySelector('#failLog')) throw new Error('premise gone: the real Failures window is still open')
  const r = w2.getBoundingClientRect()
  return { top: r.top, bottom: r.bottom, h: innerHeight, scrolls: w2.scrollHeight > w2.clientHeight + 1 }
}, courseStartWords)

const facts = {}
for (const [dev, tag, phone] of [[DESK, 'desktop', false], [PHONE, 'phone', true]]) {
  const { ctx, p } = await setup(dev, { phone })
  const words = await p.evaluate(() => document.querySelector('#lastSyll .datebox-txt').textContent)
  /* the course start in the date box's own words, from its own format (the Last Flown box read 6 Oct, a Tuesday) */
  const csWords = words.replace(/\b\w{3} 6 Oct 2026\b/, 'Mon 1 Jun 2026')
  if (csWords === words) throw new Error('premise gone: the date box format changed — ' + words)
  const down = await countDown(p, CUT_FILED_TO)
  facts[tag] = { lastSyllBox: words, down: down.label, rows: down.rows.length }

  /* 1 — today */
  await frameCurr(p)
  await ring(p, [
    { sel: '.c-curr .curGrid .field:nth-child(3)', tag: 'typed by hand today' },
    { sel: '.c-curr .curGrid .field:nth-child(4)', tag: 'goes' },
    { sel: '.c-curr .curKv .kv:nth-child(2) b .mini', tag: 'goes', pad: 3, tagX: '.c-curr' },
  ], !phone)
  await shot(p, `1-today-${tag}`)
  await unring(p)

  /* 2 — proposed */
  await propose(p, { courseStart: csWords })
  await frameCurr(p)
  await ring(p, [
    { sel: '.c-curr .mock-cs', tag: 'new: course start' },
    { sel: '.c-curr .mock-dd', tag: 'worked out · tap to open' },
    { sel: '.c-curr .mock-kv b', tag: 'no down days taken off', pad: 3, tagX: '.c-curr' },
  ], !phone)
  if (!(await p.$('.c-curr .mock-dd'))) throw new Error('premise gone: clone wiped')
  await shot(p, `2-proposed-${tag}`)
  await unring(p)

  /* 3r — the REAL window the down-days window is cloned from (the Failures card's full list), for comparison */
  await p.click('#failTitle'); await p.waitForSelector('#failLog'); await p.waitForTimeout(200)
  await shot(p, `3r-real-failures-window-${tag}`)
  await p.click('#failLogClose'); await p.waitForTimeout(200)

  /* 3 — the window open */
  const w =await openWindow(p, csWords.replace(/^\w{3} /, ''))
  facts[tag].window = w
  if (w.top < 0 || w.bottom > w.h) throw new Error('window cut off: ' + JSON.stringify(w))
  await ring(p, [{ sel: '#mockDown', tag: 'new window (cloned from the Failures list)', pad: 6 }], !phone)
  await shot(p, `3-window-${tag}`)
  await unring(p)

  /* 3b (phone) — the same window in letters about a seventh wider: what gives way */
  if (phone) {
    await p.evaluate(() => { document.querySelector('#mockDown').style.fontSize = '114%'; document.querySelectorAll('#mockDown .frow b, #mockDown .frow .mini, #mockDown .chip, #mockDown .lullhd b, #mockDown .failtot, #mockDown > .mini').forEach(e => { e.style.fontSize = (parseFloat(getComputedStyle(e).fontSize) * 1.14) + 'px' }) })
    await shot(p, `3b-window-wide-letters-${tag}`)
  }
  await ctx.close()
}

/* 4 — no course start yet (phone; open point c) */
{
  const { ctx, p } = await setup(PHONE, { phone: true })
  await countDown(p, CUT_FILED_TO)
  await propose(p, { courseStart: '', empty: true })
  await frameCurr(p)
  await ring(p, [{ sel: '.c-curr .mock-cs, .c-curr .mock-dd', tag: 'before a course start is set' }], false)
  await shot(p, '4-no-course-start-phone')
  await ctx.close()
}

/* 5 — the "+ Add" box with its course start */
for (const [dev, tag, phone] of [[DESK, 'desktop', false], [PHONE, 'phone', true]]) {
  const ctx = await b.newContext({ baseURL: base, ...dev })
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(e.message))
  await p.goto('/'); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(400)
  await p.evaluate(() => window.go('tracker')); await p.waitForTimeout(1200)
  if (phone) { await p.click('button[data-view="info"]'); await p.waitForTimeout(300) }
  /* a filled date box to clone, in today's words: the panel's Last Flown (Syllabus) box, picked to today for real */
  const today = await p.evaluate(() => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()))
  await pickDay(p, '#lastSyll', today)
  await hideToasts(p)
  await p.click('#addStu'); await p.waitForSelector('#dlgModal #dlgFilter'); await p.waitForTimeout(250)
  await p.evaluate(() => {
    const src = document.querySelector('#lastSyll').closest('.field')
    const f = src.cloneNode(true); f.querySelectorAll('[id]').forEach(e => e.removeAttribute('id'))
    f.setAttribute('data-mock', 'clone'); f.classList.add('mock-addcs'); f.style.marginBottom = '10px'
    f.querySelector('label').textContent = 'Course start'
    f.querySelector('.trdatebox-row').classList.remove('has-x'); f.querySelectorAll('.trdate-x').forEach(x => x.remove())
    f.querySelector('button.datebox').setAttribute('aria-label', 'Course start: ' + f.querySelector('.datebox-txt').textContent)
    document.querySelector('#dlgMsg').after(f)
    document.activeElement && document.activeElement.blur()
  })
  await p.waitForTimeout(150)
  await ring(p, [{ sel: '#dlgModal .mock-addcs', tag: 'new: set before picking him' }], !phone)
  facts['add-' + tag] = await p.evaluate(() => { const m = document.querySelector('#dlgModal').getBoundingClientRect(); return { top: Math.round(m.top), bottom: Math.round(m.bottom), h: innerHeight } })
  await shot(p, `5-add-box-${tag}`)
  await ctx.close()
}
console.log(JSON.stringify({ facts, errors }, null, 1))
await b.close()
