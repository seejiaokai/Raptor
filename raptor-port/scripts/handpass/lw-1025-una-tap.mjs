// A TAP ON A DAY HOLDING A HALF-DAY UNA (his D1353, 25 Oct 26 — held as a question) — drawn on the built bundle for him.
// His ruling: such a tap opens the bid window for the FREE half, as a half-day leave's does, for an admin and a member
// alike. Held because today the day's list is the only place a tap reaches where an admin changes a half-day UNA's
// remarks or takes it away, and where a member reads its remarks (D1338); and the free-half window today names the held
// half "filed on the Inputs page — change that there" (bid-heldhalf), which is wrong for a UNA (the Leave War's own).
// Each picture is cut to its window, the place MARKED (a dashed cyan box) and a short label drawn on it. "Today" pictures
// are real: nothing injected but the mark and the label. "Drawn" pictures change the app's own nodes on the page
// (.claude/skills/brainstorming/mockups-on-the-real-app.md) and say "Drawn:".
//   1  Today, admin: a tap on Drifter's day with a morning UNA ("Board of inquiry") opens the day's list (UNA entry marked)
//   2  Today, member (Ranger, row `bane`): a tap on his own such day opens the list, read only
//   3a Today, for comparison: the free-half window as the app draws it beside a morning leave filed on the Inputs page
//   3b Drawn A, admin: that window on the same day, with the UNA's entry (cloned from picture 1's list) under the day line,
//      the "filed on the Inputs page" line taken away (the entry already says "Morning")
//   4a, 4b the same as Ranger, the entry read only (cloned from picture 2's list)
// Fixtures: the UNAs as admin through the app's own controls (November opened for bidding through "Open for bidding",
// the bid window's AM, its Remarks box, UNA; taken away again by the day list's Delete). The comparison leave is filed
// through the test bridge (window.fileInput — the shape the Inputs page writes, as the round-3 walk's S10 did): it is only
// there to get the real free-half window on the same day. The drawn windows keep its frame, but their leave buttons are put
// back as the window draws them with nothing charged that day (read before the UNA was placed), since a UNA charges no
// leave and the comparison leave charges half a day.
// Usage (from raptor-port/): node scripts/handpass/lw-1025-una-tap.mjs   [LW_PORT=4180] [SIZES=phone,desk]
process.env.LW_PORT ||= '4180'
process.env.LW_OUT ||= '2026-10-25-lw-drawings/una-tap'
const L = await import('./lw-r3-lib.mjs')
const path = await import('node:path')
const { readdirSync, unlinkSync, writeFileSync } = await import('node:fs')
console.log('lw-1025-una-tap', L.OUT, 'port', L.PORT)
const SIZES = (process.env.SIZES || 'phone,desk').split(',')
const T = L.T
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png') && SIZES.some(s => f.includes(`-${s}`))) unlinkSync(path.join(L.OUT, f))

const DAY = '2026-11-12'           // Thu 12 Nov — a weekday in November, opened for bidding below
const MD = 'Nov 12', YR = 2026
const WORDS = 'Board of inquiry'
const log = []
const note = (id, size, said) => { log.push({ id, size, said }); console.log(`   ${id} [${size}] ${said}`) }
const pics = []
const measures = []

/* the passing notes never in a picture — the manning bubble included (it goes at the next tap: a passing note) */
const hideTransient = P => P.addStyleTag({ content: '#toastEl, .toast, .secdef-snack, .savestat, .saveband, [data-testid="manning-bubble"], [data-testid="manning-bubble-foot"] { visibility: hidden !important; }' })
const kinds = async (w, who, iso) => ((await L.cellInfo(w.page, who, iso))?.boxes ?? []).map(b => `${b.text}|${(b.cls.match(/k-\w+/) || [''])[0]}|${(b.cls.match(/s-[awr]/) || [''])[0]}|${(b.cls.match(/\b(right-am|right-pm|top|bot|left|right|whole)\b/) || [null, 'whole'])[1]}`)
const sheetOf = async P => (await P.evaluate(() => [...document.querySelectorAll('.bidsheet[data-testid]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid).pop())) ?? 'nothing'
/* the war's own records of a man on a day, as saved (read only) */
const recsOf = (P, who, iso) => P.evaluate(([who, iso]) => {
  const out = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k || !k.startsWith('raptor:leavewar/rec:')) continue
    try { const v = JSON.parse(localStorage.getItem(k)); if (v.pid === who && v.date === iso) out.push(v) } catch { }
  }
  return out
}, [who, iso])
async function signOut(P) { if (await L.vis(P, '#logout')) { await P.click('#logout') } else { await P.click('#burger'); await P.waitForTimeout(300); await P.click('#drawerLogout') } await P.waitForSelector('#luser') }
async function signInForm(w, who) {
  const P = w.page
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await P.fill('#luser', u); await P.fill('#lpass', p); await P.click('#loginForm button[type=submit]'); await P.waitForSelector('#vWeek .day')
  await P.evaluate(() => window.go('leavewar')); await P.waitForSelector(`[data-testid="row-${who === 'admin' ? 'stiff' : 'bane'}"]`); await P.waitForTimeout(800)
  await hideTransient(P)
}

/* THE MARK AND THE LABEL, then the picture cut to them (copied from lw-1025-una-grey.mjs) */
/* `flush`: the label sits right on the subject's top edge, so no strip of the grid behind a window shows between them
   (on the member's phone that strip held another man's cell) */
async function frame(w, name, { marks = [], around = [], label, pad = 8, check = null, flush = false }) {
  const P = w.page
  const tg = `${name}-${w.size}`
  const clip = await P.evaluate(({ marks, around, label, pad, flush }) => {
    for (const e of document.querySelectorAll('.qmk')) e.remove()
    const one = s => { const e = [...document.querySelectorAll(s)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' }); if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom } }
    const uni = rs => { rs = rs.filter(Boolean); if (!rs.length) return null; return { l: Math.min(...rs.map(r => r.l)), t: Math.min(...rs.map(r => r.t)), r: Math.max(...rs.map(r => r.r)), b: Math.max(...rs.map(r => r.b)) } }
    const rectOf = t => typeof t === 'string' ? one(t) : Array.isArray(t) ? uni(t.map(rectOf)) : { l: t.x, t: t.y, r: t.x + t.width, b: t.y + t.height }
    const missing = []
    const mr = marks.map(m => { const r = rectOf(m); if (!r) missing.push(JSON.stringify(m)); return r }).filter(Boolean)
    const ar = around.map(a => { const r = rectOf(a); if (!r) missing.push(JSON.stringify(a)); return r }).filter(Boolean)
    if (missing.length) return { missing }
    const CY = 'rgba(59,198,232,.9)'
    const body = document.body
    const box = (r, cls) => { const d = document.createElement('div'); d.className = 'qmk ' + cls; Object.assign(d.style, { position: 'fixed', left: `${r.l}px`, top: `${r.t}px`, width: `${r.r - r.l}px`, height: `${r.b - r.t}px`, zIndex: 2147483647, pointerEvents: 'none', boxSizing: 'border-box' }); body.appendChild(d); return d }
    const inflated = mr.map(r => ({ l: r.l - 4, t: r.t - 4, r: r.r + 4, b: r.b + 4 }))
    inflated.forEach(r => { const d = box(r, 'qmk-box'); d.style.border = `2px dashed ${CY}`; d.style.borderRadius = '7px' })
    let c = uni([...ar, ...inflated])
    c = { l: c.l - pad, t: c.t - (flush ? 0 : pad), r: c.r + pad, b: c.b + pad }
    const panelEl = document.querySelector('.bidsheet') || document.querySelector('#page-leavewar') || body
    const cs = getComputedStyle(panelEl)
    const bg = cs.getPropertyValue('--panel-2').trim() || cs.getPropertyValue('--panel').trim() || '#1d232c'
    const ink = cs.getPropertyValue('--ink').trim() || '#e9eef5'
    const tag = document.createElement('div'); tag.className = 'qmk qmk-label'; tag.textContent = label
    Object.assign(tag.style, { position: 'fixed', left: '0px', top: '0px', zIndex: 2147483647, pointerEvents: 'none', background: bg, color: ink, font: '600 12px/16px -apple-system, "Segoe UI", system-ui, sans-serif', padding: '4px 8px', borderRadius: '6px', border: `1px solid ${CY}`, whiteSpace: 'normal', maxWidth: `${Math.min(innerWidth - 8, Math.max(c.r - c.l - 4, 240))}px`, boxSizing: 'border-box', boxShadow: 'none' })
    body.appendChild(tag)
    const tw = tag.offsetWidth, th = tag.offsetHeight
    let tx = Math.max(4, Math.min(c.l + 2, innerWidth - tw - 4)), ty
    if (c.t - th - 6 >= 2) { ty = c.t - th - (flush ? 0 : 6); c.t = ty - 4 }
    else if (c.b + th + 6 <= innerHeight - 2) { ty = c.b + 4; c.b = ty + th + 4 }
    else { ty = Math.max(2, c.t + 2); tx = Math.max(4, c.r - tw - 6) }
    tag.style.left = `${tx}px`; tag.style.top = `${ty}px`
    c.l = Math.min(c.l, tx - 4); c.r = Math.max(c.r, tx + tw + 4)
    c = { l: Math.max(0, c.l), t: Math.max(0, c.t), r: Math.min(innerWidth, c.r), b: Math.min(innerHeight, c.b) }
    return { x: Math.round(c.l), y: Math.round(c.t), width: Math.round(c.r - c.l), height: Math.round(c.b - c.t), boxes: inflated.length }
  }, { marks, around, label, pad, flush })
  if (clip.missing) throw new Error(`${tg}: nothing drawn for ${clip.missing.join(', ')}`)
  if (check) { const why = await check(); if (why) throw new Error(`${tg}: the drawn premise is gone — ${why}`) }
  const n = await P.evaluate(() => document.querySelectorAll('.qmk-box').length)
  if (n !== clip.boxes) throw new Error(`${tg}: ${n} marks on the page, ${clip.boxes} drawn`)
  await P.screenshot({ path: path.join(L.OUT, tg + '.png'), clip: { x: clip.x, y: clip.y, width: clip.width, height: clip.height }, scale: 'device' })
  await P.evaluate(() => { for (const e of document.querySelectorAll('.qmk')) e.remove() })
  pics.push({ file: tg + '.png', label })
  console.log(`   picture ${tg}.png — ${label}`)
}

/* the UNA's line in the day's list: its markup (to clone), its words, what can be typed or pressed in it */
const unaLine = P => P.evaluate(words => {
  const li = document.querySelector('[data-testid="daylist-sheet"] li[data-testid^="dl-u-"]')
  if (!li) return null
  const ta = li.querySelector('textarea')
  const r = li.getBoundingClientRect()
  return {
    html: li.outerHTML, tid: li.dataset.testid, main: li.querySelector('.dl-main')?.textContent ?? '',
    box: li.querySelector('.dl-head .c')?.className ?? li.querySelector('.dl-head > *')?.className ?? '',
    boxText: li.querySelector('.dl-head > *')?.textContent ?? '',
    typed: ta ? ta.value : null, ro: li.querySelector('.dl-ro-words')?.textContent ?? null,
    buttons: [...li.querySelectorAll('button')].map(b => `${b.dataset.testid}:${b.textContent.trim()}`),
    h: Math.round(r.height), w: Math.round(r.width), mainLines: (() => { const m = li.querySelector('.dl-main'); if (!m) return 0; const lh = parseFloat(getComputedStyle(m).lineHeight) || 16; return Math.round(m.getBoundingClientRect().height / lh) })(),
    words,
  }
}, WORDS)
/* the window's size and whether it still fits the screen */
const winFit = P => P.evaluate(() => {
  const s = document.querySelector('[data-testid="bid-picker"]'); if (!s) return null
  const r = s.getBoundingClientRect()
  return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), vh: innerHeight, scrolls: s.scrollHeight - s.clientHeight, rows: [...s.children].filter(c => c.getBoundingClientRect().height > 0).map(c => `${(c.dataset.testid || c.className || '').toString().slice(0, 30)} h${Math.round(c.getBoundingClientRect().height)}`) }
})

/* the leave buttons as the window draws them, and each one's figure (what is left) */
const leaveGrid = P => P.evaluate(() => {
  const g = document.querySelector('[data-testid="bid-picker"] [data-testid="bid-leave-grid"]')
  if (!g) return null
  return { html: g.outerHTML, figs: Object.fromEntries([...g.querySelectorAll('[data-testid$="-left"]')].map(e => [e.dataset.testid.replace(/^bid-|-left$/g, ''), e.textContent.trim()])), cls: [...g.querySelectorAll('button')].map(b => `${b.dataset.testid}:${b.className}`) }
})

/* DRAWN A: the UNA's entry, cloned whole from the day's list (its box, its words, its Delete and Remarks box — or its
   remarks read only), set under the window's day line inside the list's own `daylist flat` frame so it wears the list's
   own styles (scoped under .bidsheet, which the bid window is too), its content standing the window's own row gap below
   the day line; the "filed on the Inputs page" line taken away, since the entry already names the morning. And the leave
   buttons put back as the window draws them with NO leave charged that day (`grid`, read before the UNA was placed —
   a UNA charges no leave; the comparison leave behind this window charges half a day, which a UNA would not). */
const drawEntry = (P, line, grid) => P.evaluate(({ html, words, grid }) => {
  const s = document.querySelector('[data-testid="bid-picker"]')
  const day = s.querySelector('[data-testid="bid-dayline"]')
  const next = day.nextElementSibling
  const rowGap = next.getBoundingClientRect().top - day.getBoundingClientRect().bottom
  const ul = document.createElement('ul'); ul.className = 'daylist flat'; ul.dataset.drawn = 'una-entry'
  ul.innerHTML = html.replace(/data-testid="dl-/g, 'data-testid="drawn-dl-')
  day.after(ul)
  const ta = ul.querySelector('textarea')
  if (ta) { ta.value = words; ta.style.height = 'auto'; ta.style.height = `${ta.scrollHeight + (ta.offsetHeight - ta.clientHeight)}px` }
  const hh = s.querySelector('[data-testid="bid-heldhalf"]'); if (hh) { hh.style.display = 'none'; hh.dataset.drawn = 'hidden' }
  /* the entry's content (its box row) the window's row gap below the day line */
  const m0 = parseFloat(getComputedStyle(ul).marginTop) || 0
  const headGap = ul.querySelector('.dl-head').getBoundingClientRect().top - day.getBoundingClientRect().bottom
  ul.style.marginTop = `${Math.max(0, m0 + rowGap - headGap)}px`
  let gridSwap = null
  if (grid) {
    const g = s.querySelector('[data-testid="bid-leave-grid"]')
    const before = Object.fromEntries([...g.querySelectorAll('[data-testid$="-left"]')].map(e => [e.dataset.testid.replace(/^bid-|-left$/g, ''), e.textContent.trim()]))
    const box = document.createElement('div'); box.innerHTML = grid.html
    const ng = box.firstElementChild; ng.dataset.drawn = 'grid'
    g.replaceWith(ng)
    const after = Object.fromEntries([...ng.querySelectorAll('[data-testid$="-left"]')].map(e => [e.dataset.testid.replace(/^bid-|-left$/g, ''), e.textContent.trim()]))
    gridSwap = { before, after }
  }
  const li = ul.querySelector('li').getBoundingClientRect()
  const main = ul.querySelector('.dl-main'), txt = ul.querySelector('.dl-text')
  const rg = document.createRange(); rg.selectNodeContents(main)
  const tail = ul.querySelector('li > :last-child').getBoundingClientRect().bottom
  return { h: Math.round(li.height), w: Math.round(li.width), rowGap: Math.round(rowGap * 10) / 10, marginTop: ul.style.marginTop, gapBelow: Math.round((ul.nextElementSibling.getBoundingClientRect().top - tail) * 10) / 10,
    typed: ta ? ta.value : null, ro: ul.querySelector('.dl-ro-words')?.textContent ?? null, heldGone: !!hh, gridSwap,
    words: { textW: Math.round(rg.getBoundingClientRect().width), room: Math.round(txt.getBoundingClientRect().width), atSeventhWider: Math.round(rg.getBoundingClientRect().width * 8 / 7) } }
}, { html: line.html, words: WORDS, grid })
const entryOk = async (P, grid) => P.evaluate(grid => {
  const u = document.querySelector('[data-testid="bid-picker"] [data-drawn="una-entry"]')
  if (!u || u.getBoundingClientRect().height === 0) return 'the drawn entry is gone'
  const hh = document.querySelector('[data-testid="bid-heldhalf"]')
  if (hh && getComputedStyle(hh).display !== 'none') return 'the Inputs page line is back'
  const chips = [...document.querySelectorAll('[data-testid="bid-picker"] [data-testid^="portion-"]')].map(b => b.dataset.testid)
  if (chips.join() !== 'portion-pm') return 'Duration shows ' + chips.join()
  if (grid) { const g = document.querySelector('[data-testid="bid-picker"] [data-drawn="grid"]'); if (!g) return 'the leave buttons were redrawn by the app'; for (const [k, v] of Object.entries(grid.figs)) if (g.querySelector(`[data-testid="bid-${k}-left"]`)?.textContent.trim() !== v) return `${k} reads other than ${v}` }
  return null
}, grid)
/* the entry's content, marked (its box row down to its last row), so the mark stays clear of the day line and divider */
const entryMark = ['[data-drawn="una-entry"] .dl-head', '[data-drawn="una-entry"] li > :last-child']
const liMark = tid => [`[data-testid="${tid}"] .dl-head`, `[data-testid="${tid}"] > :last-child`]

/* the free-half window, as the app opens it: only PM, the held-half line */
async function freeHalfWindow(w, who) {
  const P = w.page
  await L.openCellR(w, who, DAY)
  const sh = await sheetOf(P)
  if (sh !== 'bid-picker') throw new Error(`${DAY} opened ${sh}`)
  const chips = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] [data-testid^="portion-"]')].map(b => `${b.dataset.testid}:${b.getAttribute('aria-pressed')}`))
  const held = await L.txt(P, T('bid-heldhalf'))
  const day = await L.txt(P, T('bid-dayline'))
  const title = await L.txt(P, '[data-testid="bid-picker"] .bidsheet-hd')
  if (chips.join() !== 'portion-pm:true' || !/morning is LL/.test(held || '')) throw new Error(`not the free-half window: ${chips.join()} / ${held}`)
  return { chips, held, day, title }
}

for (const size of SIZES) {
  const w = await L.newCtx(size)
  const P = w.page
  await L.signInPlain(w, 'admin')
  await hideTransient(P)
  const ids = await P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))
  const who = ids.Drifter, me = ids.Ranger
  console.log(size, 'Drifter =', who, 'Ranger =', me)
  if (me !== 'bane') throw new Error('Ranger is not row bane: ' + me)
  const sc = async (id, fn) => { console.log(`-- ${id} [${size}]`); try { await fn(); return true } catch (e) { note(id, size, 'NOT DONE — ' + String(e).slice(0, 400)); await P.keyboard.press('Escape').catch(() => {}); await L.closeAny(w); return false } }
  let adminLine = null, memberLine = null, adminGrid = null, memberGrid = null

  /* ============ fixtures: November open for bidding; a morning UNA with its remarks on Drifter and on Ranger ============ */
  const fixed = await sc('fixtures', async () => {
    for (const p of [who, me]) { const k = await kinds(w, p, DAY); if (k.length) throw new Error(`${p} ${DAY} is not empty: ${JSON.stringify(k)}`) }
    await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
    await L.press(w, T('open-chip')); await P.waitForSelector(T('open-dates'))
    if ((await P.locator(T('od-month-2026-11')).getAttribute('aria-pressed')) !== 'true') { await L.press(w, T('od-month-2026-11')); await P.waitForTimeout(500) }
    const nov = await P.locator(T('od-month-2026-11')).getAttribute('aria-label')
    await L.press(w, T('open-dates-close')); await P.waitForTimeout(300)
    const chip = await L.txt(P, T('open-chip'))
    note('fixtures', size, `November: ${nov}; the chip reads "${chip}"`)
    if (!/Nov|open/i.test(chip || '') || /closed/i.test(chip || '')) throw new Error('November did not open: ' + chip)
    for (const p of [who, me]) {
      await L.openCellR(w, p, DAY)
      if ((await sheetOf(P)) !== 'bid-picker') throw new Error(`${p} ${DAY} opened ${await sheetOf(P)}`)
      /* Drifter's leave buttons with nothing on the day — what the drawn window shows (a UNA charges no leave) */
      if (p === who) { adminGrid = await leaveGrid(P); note('fixtures', size, `Drifter's leave buttons, nothing on ${DAY}: ${JSON.stringify(adminGrid?.figs)}; day line "${await L.txt(P, T('bid-dayline'))}"`) }
      await L.press(w, T('portion-am'))
      await L.press(w, T('bid-remarks')); await P.keyboard.type(WORDS); await P.waitForTimeout(150)
      await L.press(w, T('bid-una')); await P.waitForTimeout(700)
      if (await L.vis(P, T('bid-picker'))) { const d = await L.sheetDump(P); await L.closeAny(w); throw new Error(`UNA on ${p} not placed: ${d?.text?.slice(0, 200)}`) }
      const k = await kinds(w, p, DAY)
      const rec = (await recsOf(P, p, DAY)).find(r => r.kind === 'una')
      note('fixtures', size, `${p} ${DAY}: cell ${JSON.stringify(k)}; saved ${JSON.stringify(rec)}`)
      if (!k.some(x => /k-una\|s-a\|top/.test(x))) throw new Error(`${p}: no morning UNA on the grid: ${JSON.stringify(k)}`)
      if (!rec || rec.remarks !== WORDS) throw new Error(`${p}: the UNA saved without its remarks: ${JSON.stringify(rec)}`)
    }
  })
  if (!fixed) { await w.ctx.close(); continue }

  /* ============ 1. Today, admin: the tap opens the day's list ============ */
  await sc('1', async () => {
    await L.openCellR(w, who, DAY)
    const sh = await sheetOf(P)
    if (sh !== 'daylist-sheet') throw new Error('the tap opened ' + sh)
    adminLine = await unaLine(P)
    note('1', size, `admin's list: ${JSON.stringify({ ...adminLine, html: undefined })}`)
    if (!adminLine || !/out of the manning · placed by Saber/.test(adminLine.main) || adminLine.typed !== WORDS || !adminLine.buttons.some(b => /Delete/.test(b))) throw new Error('the UNA entry is not as expected')
    await frame(w, '1-today-admin-list', { marks: [liMark(adminLine.tid)], around: [T('daylist-sheet')], flush: true, label: 'Today, as admin: a tap on Drifter’s Thu 12 Nov opens the day’s list, with the morning UNA’s entry' })
    await L.closeAny(w)
  })

  /* ============ 2. Today, member: his tap opens the list, read only ============ */
  await signOut(P); await signInForm(w, 'member')
  await sc('2', async () => {
    await L.openCellR(w, me, DAY)
    const sh = await sheetOf(P)
    if (sh !== 'daylist-sheet') throw new Error('his tap opened ' + sh)
    memberLine = await unaLine(P)
    note('2', size, `member's list: ${JSON.stringify({ ...memberLine, html: undefined })}`)
    if (!memberLine || memberLine.typed !== null || memberLine.buttons.length || !(memberLine.ro || '').includes(WORDS)) throw new Error('the UNA entry is not read only as expected')
    const all = (await L.sheetDump(P))?.text
    note('2', size, `the whole list reads: ${all}`)
    await frame(w, '2-today-member-list', { marks: [liMark(memberLine.tid)], around: [T('daylist-sheet')], flush: true, label: 'Today, as Ranger: a tap on his own Thu 12 Nov opens the day’s list, read only' })
    await L.closeAny(w)
    /* his leave buttons with nothing charged on a day — read off his window on Fri 13 Nov, open and empty (what the drawn
       window shows: a UNA charges no leave) */
    const k13 = await kinds(w, me, '2026-11-13')
    if (k13.length) throw new Error('13 Nov is not empty: ' + JSON.stringify(k13))
    await L.openCellR(w, me, '2026-11-13')
    if ((await sheetOf(P)) !== 'bid-picker') throw new Error('his 13 Nov opened ' + await sheetOf(P))
    memberGrid = await leaveGrid(P)
    note('2', size, `his leave buttons, nothing charged (13 Nov): ${JSON.stringify(memberGrid?.figs)}`)
    await L.closeAny(w)
  })

  /* ============ the UNAs taken away (the list's Delete), a morning leave filed on the Inputs page in their place ============ */
  await signOut(P); await signInForm(w, 'admin')
  const swapped = await sc('swap', async () => {
    for (const p of [who, me]) {
      await L.openCellR(w, p, DAY)
      if ((await sheetOf(P)) !== 'daylist-sheet') throw new Error(`${p}: the tap opened ${await sheetOf(P)}`)
      const del = await P.evaluate(() => document.querySelector('[data-testid="daylist-sheet"] li[data-testid^="dl-u-"] [data-testid^="dl-clear-"]')?.dataset.testid)
      if (!del) throw new Error(`${p}: no Delete on the UNA`)
      await L.press(w, T(del)); await P.waitForTimeout(600)
      await L.closeAny(w)
      const k = await kinds(w, p, DAY)
      if (k.length) throw new Error(`${p}: ${DAY} not empty after Delete: ${JSON.stringify(k)}`)
      if (await P.evaluate(() => typeof window.fileInput) !== 'function') throw new Error('no test bridge on this build')
      await P.evaluate(([p, md, y]) => window.fileInput({ person: p, date: md, yr: y, type: 'LL', allday: false, half: 'am', s: 0, e: 720, remarks: '' }), [p, MD, YR])
      await P.waitForTimeout(700)
      const k2 = await kinds(w, p, DAY)
      note('swap', size, `${p} ${DAY}: UNA deleted; after the Inputs page leave: ${JSON.stringify(k2)}`)
      if (!k2.some(x => /^LL\|k-ll\|s-a\|top/.test(x))) throw new Error(`${p}: no morning LL: ${JSON.stringify(k2)}`)
    }
  })

  /* ============ 3. admin: the free-half window today, and Drawn A ============ */
  if (swapped && adminLine && adminGrid) await sc('3', async () => {
    const f = await freeHalfWindow(w, who)
    const fit0 = await winFit(P)
    note('3', size, `the window today: ${JSON.stringify(f)}; size ${JSON.stringify(fit0)}`)
    await frame(w, '3a-today-free-half', { marks: ['[data-testid="bid-picker"] .bp-dur'], around: [T('bid-picker')], flush: true, label: 'Today, for comparison: beside a morning leave filed on the Inputs page, the tap opens the window on PM only' })
    const before = await leaveGrid(P)
    const d = await drawEntry(P, adminLine, adminGrid)
    note('3', size, `leave buttons' looks alike apart from the figures: ${JSON.stringify(before.cls) === JSON.stringify(adminGrid.cls)}`)
    const fit1 = await winFit(P)
    note('3', size, `drawn: ${JSON.stringify(d)}; size ${JSON.stringify(fit1)}`)
    measures.push({ size, who: 'admin', today: fit0, drawn: fit1, entry: d, listEntry: { h: adminLine.h, w: adminLine.w, mainLines: adminLine.mainLines } })
    await frame(w, '3b-drawn-a-admin', { marks: [entryMark, '[data-testid="bid-picker"] .bp-dur'], around: [T('bid-picker')], flush: true, label: 'Drawn A, as admin: the window opens on PM, the UNA’s entry under the day line. The Inputs page line is gone', check: () => entryOk(P, adminGrid) })
    await L.closeAny(w)
  })

  /* ============ 4. member: the same ============ */
  await signOut(P); await signInForm(w, 'member')
  if (swapped && memberLine && memberGrid) await sc('4', async () => {
    const f = await freeHalfWindow(w, me)
    const fit0 = await winFit(P)
    note('4', size, `his window today: ${JSON.stringify(f)}; size ${JSON.stringify(fit0)}`)
    await frame(w, '4a-today-free-half-member', { marks: ['[data-testid="bid-picker"] .bp-dur'], around: [T('bid-picker')], flush: true, label: 'Today, for comparison, as Ranger: beside a morning leave filed on the Inputs page, his window opens on PM only' })
    const before = await leaveGrid(P)
    const d = await drawEntry(P, memberLine, memberGrid)
    note('4', size, `leave buttons' looks alike apart from the figures: ${JSON.stringify(before.cls) === JSON.stringify(memberGrid.cls)}`)
    const fit1 = await winFit(P)
    note('4', size, `drawn: ${JSON.stringify(d)}; size ${JSON.stringify(fit1)}`)
    measures.push({ size, who: 'member', today: fit0, drawn: fit1, entry: d, listEntry: { h: memberLine.h, w: memberLine.w, mainLines: memberLine.mainLines } })
    await frame(w, '4b-drawn-a-member', { marks: [entryMark, '[data-testid="bid-picker"] .bp-dur'], around: [T('bid-picker')], flush: true, label: 'Drawn A, as Ranger: his window on PM, the UNA’s entry read only, its remarks as words', check: () => entryOk(P, memberGrid) })
    await L.closeAny(w)
  })

  if (w.errs.length) note('errors', size, w.errs.slice(0, 8).join(' || '))
  else note('errors', size, 'none (console, page, 4xx)')
  await w.ctx.close()
}
await L.closeBrowser()
writeFileSync(path.join(L.OUT, `run-${SIZES.join('-')}.json`), JSON.stringify({ day: DAY, words: WORDS, log, pics, measures }, null, 1))
console.log('DONE', pics.length, 'pictures;', log.filter(l => /NOT DONE/.test(l.said)).length, 'not done')
