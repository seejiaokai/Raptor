// MOCK-UP on the real app: the Leave War's Events list separated into holidays (public holidays, Off days) and squadron
// events — his ask of 29 Oct 26 ("Can we do a mock up of the separation … of the events page"; his colleague's two panels
// a reference only — "if u find better ways to do it u can"). Drawn on the served build at his iPhone's 402 (3x, touch)
// and his PC's 1536 at 125%, as the admin, through the app's own controls (⚙ → Events…).
// ONE data set for every frame: the demo year's four PH lines are kept and named; sample lines (an Off day, two working
// events, a No leave, two with no kind) are CLONED from a real line, their kind's mark cloned from a real mark — marked
// "drawn in" on the page. Frames:
//   0 today — one list by date (as built, D1500), the busy year
//   A proposed — the same window, two sections under the Settings window's own section heading (".gs-sec", as "Groups"):
//     HOLIDAYS (Public holiday, Off day) first, then SQUADRON EVENTS (Working event, No leave, no kind), each by date,
//     each heading with its count; "＋ Event" and "Edit presets" stay where they are
//   B proposed, desktop only — the two sections side by side in a window twice as wide (the colleague's shape)
// Run from raptor-port:  node scripts/handpass/mock-events-split.mjs <dist> <out-dir>
import { chromium, serveDist } from '../drawcheck/lib.mjs'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
const [, , DIST = 'dist', OUT = 'docs/mock/lw-overhaul/full/m5b/events-split'] = process.argv
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ORIGIN = 'http://localhost:4199'
/* the busy year — [when, name, kind ('' = none), past]; the demo's own four PH lines are matched by their date */
const LINES = [
  ['Thu 1 Jan', "New Year's Day", 'off', true],
  ['Tue 17 – Wed 18 Feb', 'Chinese New Year', 'off', true],
  ['Mon 9 – Fri 20 Mar', 'Ex Pitch Black', 'work', true],
  ['Fri 3 Apr', 'Good Friday', 'off', false],
  ['Mon 6 – Fri 17 Apr', 'ORE — no leave', 'nolv', false],
  ['Fri 1 May', 'Labour Day', 'off', false],
  ['Fri 22 May', 'Squadron dinner', '', false],
  ['Sun 9 Aug', 'National Day', 'off', false],
  ['Mon 10 Aug', 'Off — National Day', 'free', false],
  ['Mon 7 – Fri 11 Sep', 'Ex Cope Tiger', 'work', false],
  ['Sat 31 Oct', 'Families day', '', false],
  ['Fri 25 Dec', 'Christmas Day', 'off', false],
]
const KW = { off: 'Public holiday', free: 'Off day', nolv: 'No leave', work: 'Working event' }
const metrics = {}
/* MOCK_PLAIN=1 draws the same frames WITHOUT the dashed cyan markers that show which parts are new — how the app would look
   (his question, 29 Oct 26: "will there be a dotted cyan there by default?" — no, the markers are the drawing's own) */
const PLAIN = process.env.MOCK_PLAIN === '1'
for (const kind of ['P', 'D']) {
  const phone = kind === 'P'
  const ctx = await b.newContext(phone ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true, timezoneId: 'Asia/Singapore' }
    : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25, timezoneId: 'Asia/Singapore' })
  await serveDist(ctx, ORIGIN, DIST)
  const p = await ctx.newPage()
  await p.clock.setFixedTime(new Date('2026-04-02T09:00:00+08:00'))
  await p.goto(ORIGIN + '/?fresh=1')
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.evaluate(() => window.go('leavewar')); await p.waitForSelector('[data-testid="settings-open"]', { timeout: 20000 }); await p.waitForTimeout(600)
  const press = async id => { const l = p.locator(`[data-testid="${id}"]`).first(); if (phone) await l.tap(); else await l.click(); await p.waitForTimeout(450) }
  await press('settings-open')
  // the Settings window's own section heading, kept as markup to clone ("Groups")
  const secHTML = await p.evaluate(() => document.querySelector('[data-testid="settings-sheet"] .gs-sec')?.outerHTML || '')
  // …and its group row's ✕ (".set-gdel"), the window's own small square button, cloned for the line controls (D1512)
  const delHTML = await p.evaluate(() => document.querySelector('[data-testid="settings-sheet"] .set-gdel')?.outerHTML || '')
  if (!delHTML) throw new Error('no ✕ to clone in Settings')
  await press('settings-events')
  await p.waitForSelector('[data-testid="events-list"]')
  // a neutral tap so no control is left lit (the guide's trap)
  await p.locator('[data-testid="events-sheet"] .bidsheet-hd .who').first().click({ force: true }).catch(() => {})
  // fill the list with the busy year: every line cloned from the first real one
  const built = await p.evaluate(({ LINES, KW }) => {
    const list = document.querySelector('[data-testid="events-list"]')
    const proto = list.querySelector('.hol-line'); const mark = list.querySelector('.evpeek-kind')
    if (!proto || !mark) return 'no line to clone'
    const make = ([when, name, k, past]) => {
      const n = proto.cloneNode(true); n.removeAttribute('data-testid')
      n.classList.toggle('is-past', !!past); n.dataset.mk = k || 'none'
      n.querySelector('.hol-when').textContent = when; n.querySelector('.hol-name').textContent = name
      const old = n.querySelector('.evpeek-kind'); if (old) old.remove()
      if (k) { const m = mark.cloneNode(true); m.className = 'evpeek-kind ' + k; m.textContent = KW[k]; n.appendChild(m) }
      return n
    }
    list.innerHTML = ''; LINES.forEach(l => list.appendChild(make(l)))
    list.dataset.mocked = '1'
    return 'ok'
  }, { LINES, KW })
  if (built !== 'ok') throw new Error(built)
  const sheetBox = async () => p.locator('[data-testid="events-sheet"]').first().boundingBox()
  /* D1513 ("can u align the design like the coloured green is the same horizontal alignment with off day, working event
     etc"): in the proposed frames every line's kind starts at the same place — one column as wide as its longest word, a
     line with no kind keeping the column empty. "Today" (frame 0) is drawn as the app is. */
  const alignKinds = () => p.evaluate(() => {
    const lines = [...document.querySelectorAll('[data-testid="events-list"] .hol-line')]
    lines.forEach(l => { if (!l.querySelector('.evpeek-kind')) { const e = document.createElement('span'); e.className = 'evpeek-kind mock-nokind'; e.style.visibility = 'hidden'; l.insertBefore(e, l.querySelector('.mock-ctls')) } })
    const ks = lines.map(l => l.querySelector('.evpeek-kind'))
    ks.forEach(k => { k.style.width = ''; k.style.justifyContent = '' })
    const w = Math.ceil(Math.max(...ks.map(k => k.getBoundingClientRect().width)))
    ks.forEach(k => { k.style.width = w + 'px'; k.style.justifyContent = 'flex-start'; k.style.flex = 'none' })
    /* the date column as wide as its longest date, not the line's fixed 42%, so the names get the room (on the desktop's
       side-by-side lists the 42% cut "Off — National Day"); where the name stands under the date (a phone) it is left alone */
    // a date stacked over its name (a phone) takes back its own size: a width given in an earlier frame would stretch it tall
    lines.forEach(l => { const d = l.querySelector('.mock-tx .hol-when'); if (d) { d.style.flex = ''; d.style.whiteSpace = '' } })
    const ws = lines.map(l => l.querySelector('.hol-when')).filter(e => e && !e.closest('.mock-tx'))
    ws.forEach(e => { e.style.flex = ''; e.style.width = '' })
    if (ws.length) {
      ws.forEach(e => { e.style.flex = '0 0 auto'; e.style.whiteSpace = 'nowrap' })
      /* the column is sized for the WIDEST DATE THE APP CAN WRITE, not the widest in this sample (the review's fault 5; his
         question "even with the longest date it will not touch the name?"): every run of up to 60 days from 1 Jan 26 to the
         end of 27 is written as the list writes it (EventsSheet.tsx whenSaid) and measured in the line's own letters, so
         on his iPhone, whose letters are wider, the built column measures his letters the same way; then a fixed gap */
      const WD = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], MO = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      const say = d => `${WD[d.getUTCDay()]} ${d.getUTCDate()} ${MO[d.getUTCMonth()]}`
      const when = (a, b) => b <= a ? say(a) : (a.getUTCMonth() === b.getUTCMonth() && a.getUTCFullYear() === b.getUTCFullYear() ? `${say(a).replace(/ [A-Za-z]+$/, '')} – ${say(b)}` : `${say(a)} – ${say(b)}`)
      const cs = getComputedStyle(ws[0]), cv = document.createElement('canvas').getContext('2d')
      cv.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
      let widest = '', wmax = 0
      for (let t = Date.UTC(2026, 0, 1); t < Date.UTC(2028, 0, 1); t += 864e5) for (let k = 0; k <= 60; k++) {
        const a = new Date(t), b = new Date(t + k * 864e5), txt = when(a, b), w = cv.measureText(txt).width
        if (w > wmax) { wmax = w; widest = txt }
      }
      const GAP = 12
      const dw = Math.ceil(wmax) + GAP
      ws.forEach(e => { e.style.flex = `0 0 ${dw}px` })
      window.__widestDate = { widest, w: Math.ceil(wmax), col: dw }
    }
    const lefts = ks.filter(k => !k.classList.contains('mock-nokind')).map(k => Math.round(k.getBoundingClientRect().left))
    return { w, lefts: [...new Set(lefts)] }
  })
  /* D1515 ("Fix all six"), the design review's fixes, drawn on the proposal:
     (1) the ✕ arms IN PLACE — its 22px box keeps its size and place, filled red (the Leave War's armed red, bidpicker.css
         `.creset.cf-del.arm`), and the line's kind column says "Delete — sure?" — so the pencil never moves;
     (2) after a delete, the app's own bar with buttons (`.secdef-snack`, as "Set as default") at the foot: "<name> deleted"
         and Undo — the plain passing note cannot be pressed;
     (3) the two icons stand 14px apart (were 6), each with a finger-sized tap area round it (not drawn — invisible; outlined
         dashed on the marked copy), and their edge lighter: the app's --ink-3 at .65, about 3:1 on the line (was 1.4:1);
     (4) the ✕ is the Leave War's red cross at rest (D676, matrix.css `.mrow-btn.del`: a red outline, a pale red cross);
     (5) the date column: alignKinds above (the widest date the app can write + 12px);
     (6) a new event: its line wears the app's plain blue ring (D860, the reduced-motion form of `.hol-line.innew`), in view. */
  const applyFixes = (arm, fresh) => p.evaluate(({ arm, fresh, PLAIN }) => {
    document.querySelectorAll('.mock-ctls').forEach(c => { c.style.gap = '14px'; c.style.outline = 'none' })
    document.querySelectorAll('.mock-ctl').forEach(b => { b.style.borderColor = 'rgba(138,150,163,.65)' })
    document.querySelectorAll('.mock-ctl:not(.mock-pen)').forEach(b => {
      b.classList.remove('mock-armed'); b.textContent = '✕'; b.style.width = ''; b.style.padding = ''
      b.style.color = '#FBB4B9'; b.style.borderColor = 'rgba(240,85,95,.6)'; b.style.background = 'transparent'; b.style.fontWeight = ''
    })
    if (!PLAIN) document.querySelectorAll('.mock-ctl').forEach(b => { b.style.boxShadow = '0 0 0 9px rgba(59,198,232,.0), 0 0 0 9px transparent'; b.style.outline = '1px dashed rgba(59,198,232,.7)'; b.style.outlineOffset = '9px' })
    const line = n => [...document.querySelectorAll('[data-testid="events-list"] .hol-line')].find(l => l.querySelector('.hol-name')?.textContent === n)
    const a = arm && line(arm)
    if (a) {
      const x = a.querySelector('.mock-ctl:not(.mock-pen)')
      x.style.background = '#F0555F'; x.style.borderColor = '#F0555F'; x.style.color = '#1A0508'
      const k = a.querySelector('.evpeek-kind')
      k.style.visibility = 'visible'; k.dataset.was = k.innerHTML; k.classList.add('mock-sure')
      k.innerHTML = '<b style="color:#FBB4B9;font-weight:700">Delete — sure?</b>'
      if (!document.getElementById('mocksure')) { const st = document.createElement('style'); st.id = 'mocksure'; st.textContent = '.mock-sure::before{display:none!important}'; document.head.appendChild(st) }
    }
    const f = fresh && line(fresh)
    if (f) { f.style.boxShadow = 'inset 0 0 0 2px #1E86FF' }
  }, { arm, fresh, PLAIN })
  const showDeleted = (name) => p.evaluate(({ name }) => {
    const l = [...document.querySelectorAll('[data-testid="events-list"] .hol-line')].find(x => x.querySelector('.hol-name')?.textContent === name)
    const head = l.closest('.mock-col')?.querySelector('.mock-sec'); l.remove()
    if (head) head.textContent = head.textContent.replace(/\d+$/, n => String(+n - 1))
    const bar = document.createElement('div'); bar.className = 'secdef-snack mock-snack'; bar.setAttribute('role', 'status')
    bar.style.zIndex = '2000'
    // one line on a phone too: the bar as wide as its words, never wider than the screen less its margins
    bar.style.display = 'flex'; bar.style.alignItems = 'center'; bar.style.gap = '14px'; bar.style.whiteSpace = 'nowrap'; bar.style.width = 'max-content'; bar.style.maxWidth = 'calc(100vw - 32px)'
    bar.innerHTML = `<span class="secdef-msg">${name} deleted</span><button class="secdef-btn yes">Undo</button>`
    document.body.appendChild(bar)
  }, { name })
  const showEmpty = () => p.evaluate(() => {
    document.querySelector('.mock-snack')?.remove()
    const col = [...document.querySelectorAll('.mock-col')].find(c => /Squadron/i.test(c.querySelector('.mock-sec')?.textContent || ''))
    const list = col.querySelector('.mock-part'); const e = document.createElement('p'); e.className = 'hol-empty'
    e.textContent = 'No squadron events in JAN – DEC 26.'; list.replaceWith(e)
    const head = col.querySelector('.mock-sec'); head.textContent = head.textContent.replace(/\d+$/, '0')
  })
  const snap = async name => {
    const ok = await p.evaluate(() => document.querySelector('[data-testid="events-list"]')?.dataset.mocked === '1')
    if (!ok) throw new Error('the drawn list was wiped before ' + name)
    await p.screenshot({ path: join(OUT, `${kind}-${name}.png`) })
    const bx = await sheetBox()
    const sc = await p.evaluate(() => { const l = document.querySelector('[data-testid="events-list"]'); return l ? { list: l.scrollHeight, shown: l.clientHeight } : null })
    metrics[`${kind}-${name}`] = { window: bx && { w: Math.round(bx.width), h: Math.round(bx.height) }, ...sc }
  }
  await snap('0-today')
  // A — two sections in the same window
  await p.evaluate(({ secHTML, PLAIN }) => {
    const list = document.querySelector('[data-testid="events-list"]')
    const lines = [...list.querySelectorAll('.hol-line')]
    const hol = lines.filter(l => l.dataset.mk === 'off' || l.dataset.mk === 'free')
    const ev = lines.filter(l => !(l.dataset.mk === 'off' || l.dataset.mk === 'free'))
    const head = (word, n) => {
      const t = document.createElement('template'); t.innerHTML = secHTML.trim()
      const h = t.content.firstElementChild; h.textContent = `${word} · ${n}`; h.classList.add('mock-sec'); return h
    }
    const box = (arr) => { const d = document.createElement('div'); d.className = list.className + ' mock-part'; arr.forEach(l => d.appendChild(l)); return d }
    const wrap = document.createElement('div'); wrap.className = 'mock-split'; wrap.dataset.testid = 'events-list'
    const colA = document.createElement('div'); colA.className = 'mock-col'; colA.append(head('Holidays', hol.length), box(hol))
    const colB = document.createElement('div'); colB.className = 'mock-col'; colB.append(head('Squadron events', ev.length), box(ev))
    // Squadron events first (D1516, 29 Oct 26 — "As recommended" to question 4): the left list on a desktop, the top one on a phone
    wrap.append(colB, colA); wrap.dataset.mocked = '1'
    wrap.setAttribute('data-testid', 'events-list')
    list.replaceWith(wrap)
    const st = document.createElement('style'); st.id = 'mockcss'
    st.textContent = `.mock-split{display:flex;flex-direction:column;gap:6px;overflow:auto;min-height:0}
      .mock-col{display:flex;flex-direction:column;min-width:0}
      .mock-sec{text-decoration:underline dashed #3BC6E8 2px;text-underline-offset:5px}`
      + (PLAIN ? '.mock-sec{text-decoration:none!important}' : '')  /* the new part, marked on itself */
    document.head.appendChild(st)
  }, { secHTML, PLAIN })
  metrics[`${kind}-A-kinds`] = await alignKinds()
  await snap('A-sections')
  // C — A, with each line's edit and delete controls on the line itself (D1512, question 5): the app's one pencil (D1134,
  // ui/pen.ts PEN_INNER — copied here as drawn) in a clone of the window's ✕ button, then the ✕; one line shown armed
  // ("Delete?", the ✕ widened, in the ✕'s own red) after its first press
  const PEN = '<svg class="pen-ic solo" viewBox="0 0 24 24" aria-hidden="true"><g transform="rotate(-45 12 12)" fill="currentColor"><rect x="8.5" y="1" width="7" height="4.6" rx="2.4"/><rect x="8.5" y="6.4" width="7" height="12.2" rx=".3"/><path d="M8.5 19.4h7l-2.6 3.1a1.2 1.2 0 0 1-1.8 0Z"/></g></svg>'
  const addControls = () => p.evaluate(({ delHTML, PEN, PLAIN }) => {
    const mk = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); const b = t.content.firstElementChild; b.removeAttribute('data-testid'); b.classList.add('mock-ctl'); return b }
    const lines = [...document.querySelectorAll('.mock-split .hol-line')]
    lines.forEach((l, i) => {
      const box = document.createElement('span'); box.className = 'mock-ctls'
      const pen = mk(delHTML); pen.innerHTML = PEN; pen.title = 'Edit'; pen.classList.add('mock-pen')
      const del = mk(delHTML); del.title = 'Delete'
      if (i === 9) { del.textContent = 'Delete?'; del.classList.add('mock-armed') }
      box.append(pen, del); l.appendChild(box)
    })
    const st = document.createElement('style'); st.id = 'mockcss2'
    st.textContent = `.mock-split .hol-line{align-items:center}
      .mock-ctls{display:inline-flex;gap:6px;margin-left:8px;flex:none;outline:2px dashed #3BC6E8;outline-offset:2px;border-radius:6px}
      .mock-ctl.mock-pen{display:inline-grid;place-items:center;color:var(--ink-2,#c5ced8)}
      .mock-ctl.mock-armed{width:auto;padding:0 7px;color:#ff5c5c;border-color:rgba(255,92,92,.6);font-weight:600}`
      + (PLAIN ? '.mock-ctls{outline:none!important}' : '')
    document.head.appendChild(st)
  }, { delHTML, PEN, PLAIN })
  await addControls()
  // on a phone the two icons leave the name no room (measured: every name cut to its first letter), so there the name
  // stands under the date, the kind's mark and word and the icons to their right — a drawing choice to put to him
  if (phone) await p.evaluate(() => {
    document.querySelectorAll('.mock-split .hol-line').forEach(l => {
      const tx = document.createElement('span'); tx.className = 'mock-tx'
      tx.append(l.querySelector('.hol-when'), l.querySelector('.hol-name')); l.prepend(tx)
    })
    const st = document.createElement('style'); st.id = 'mockcss3'
    st.textContent = `.mock-split .hol-line{display:flex;gap:8px}
      .mock-tx{display:flex;flex-direction:column;flex:1 1 auto;min-width:0;gap:2px}
      .mock-tx .hol-when,.mock-tx .hol-name{flex:none}  /* the line's own 1 1 0 / 42% basis collapses them in a column */
      .mock-tx .hol-name{white-space:normal}
      .mock-split .hol-line .evpeek-kind{flex:none}`
    document.head.appendChild(st)
  })
  metrics[`${kind}-C-kinds`] = await alignKinds()
  await snap('C-line-controls')
  // the widest a line gets on a phone: does any name, date or kind word lose letters?
  if (phone) {
    await applyFixes('Squadron dinner', 'Families day')
    metrics[`${kind}-F-kinds`] = await alignKinds()
    await snap('F-fixed')
    await showDeleted('Squadron dinner')
    await snap('F-deleted')
    await p.evaluate(() => document.querySelector('.mock-snack')?.remove())
  }
  metrics[`${kind}-C-clipped`] = await p.evaluate(() => [...document.querySelectorAll('.mock-split .hol-line')].flatMap(l =>
    [...l.querySelectorAll('.hol-when,.hol-name,.evpeek-kind')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent)))
  await p.evaluate(() => { document.querySelectorAll('.mock-ctls').forEach(e => e.remove()); document.getElementById('mockcss2')?.remove(); document.getElementById('mockcss3')?.remove(); document.querySelectorAll('.mock-tx').forEach(t => { const l = t.parentElement; l.prepend(...t.childNodes); t.remove() }) })
  if (!phone) {
    // B — side by side, the window twice as wide
    await p.evaluate(() => {
      const sh = document.querySelector('[data-testid="events-sheet"]')
      const w = sh.getBoundingClientRect().width
      sh.style.width = Math.round(w * 2) + 'px'; sh.style.maxWidth = 'none'
      const r = sh.getBoundingClientRect(); if (r.right > innerWidth - 16) sh.style.left = Math.max(16, innerWidth - 16 - r.width) + 'px'
      const s = document.querySelector('.mock-split'); s.style.flexDirection = 'row'; s.style.gap = '16px'; s.style.alignItems = 'flex-start'
      document.querySelectorAll('.mock-col').forEach(c => { c.style.flex = '1 1 0' })
    })
    metrics[`${kind}-B-kinds`] = await alignKinds()
    await snap('B-side-by-side')
    // B as he picked it (D1514), with the line icons (D1512) and the kinds in one column (D1513) — the desktop he will get
    await addControls()
    metrics[`${kind}-BC-kinds`] = await alignKinds()
    await snap('BC-side-by-side-icons')
    // the widest date the app can write, put on Chinese New Year's line, and the space left before its name measured
    const lw = await p.evaluate(() => {
      const l = [...document.querySelectorAll('.mock-split .hol-line')].find(x => x.querySelector('.hol-name')?.textContent === 'Chinese New Year')
      const d = l.querySelector('.hol-when'); d.textContent = window.__widestDate.widest
      const r = document.createRange(); r.selectNodeContents(d); const textRight = r.getBoundingClientRect().right
      return { ...window.__widestDate, gap: Math.round(l.querySelector('.hol-name').getBoundingClientRect().left - textRight) }
    })
    // and again in letters about a seventh wider, as his iPhone's are (the guide's fit check): the column re-measured in them
    metrics[`${kind}-longest`] = lw
    await snap('BC-longest-date')
    const wide = await p.evaluate(() => {
      const st = document.createElement('style'); st.id = 'mockwide'; st.textContent = '.mock-split .hol-line, .mock-split .hol-line *{font-family:Verdana,sans-serif}'  /* a typeface about a seventh wider; letter-spacing would fool the measure, a real wider font does not */; document.head.appendChild(st)
      return true
    })
    metrics[`${kind}-longest-wide-kinds`] = await alignKinds()
    metrics[`${kind}-longest-wide`] = await p.evaluate(() => {
      const l = [...document.querySelectorAll('.mock-split .hol-line')].find(x => x.querySelector('.hol-name')?.textContent === 'Chinese New Year')
      const d = l.querySelector('.hol-when'); d.textContent = window.__widestDate.widest
      const r = document.createRange(); r.selectNodeContents(d); const textRight = r.getBoundingClientRect().right
      const n = l.querySelector('.hol-name')
      return { ...window.__widestDate, gap: Math.round(n.getBoundingClientRect().left - textRight), nameCut: n.scrollWidth > n.clientWidth + 1 }
    })
    await snap('BC-longest-date-wide')
    // back to the app's own letters and the sample's own date, then the fixes (D1515)
    await p.evaluate(() => {
      document.getElementById('mockwide')?.remove()
      const l = [...document.querySelectorAll('.mock-split .hol-line')].find(x => x.querySelector('.hol-name')?.textContent === 'Chinese New Year')
      l.querySelector('.hol-when').textContent = 'Tue 17 – Wed 18 Feb'
    })
    await applyFixes('Squadron dinner', 'Families day')
    metrics[`${kind}-F-kinds`] = await alignKinds()
    await snap('F-fixed')
    metrics[`${kind}-F-clipped`] = await p.evaluate(() => [...document.querySelectorAll('.mock-split .hol-line')].flatMap(l =>
      [...l.querySelectorAll('.hol-when,.hol-name,.evpeek-kind')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent)))
    await showDeleted('Squadron dinner')
    await snap('F-deleted')
    await showEmpty()
    await snap('F-empty')
    metrics[`${kind}-BC-clipped`] = await p.evaluate(() => [...document.querySelectorAll('.mock-split .hol-line')].flatMap(l =>
      [...l.querySelectorAll('.hol-when,.hol-name,.evpeek-kind')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent)))
  }
  await ctx.close()
}
await b.close()
writeFileSync(join(OUT, 'metrics.json'), JSON.stringify(metrics, null, 1))
console.log(JSON.stringify(metrics, null, 1))
