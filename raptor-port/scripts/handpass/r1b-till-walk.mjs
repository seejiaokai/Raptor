// ROUND 1b + THE TILL DATE — a WALK of the BUILT app (D945, D947, D948), written as ASSERTIONS of the right behaviour.
// Every step prints PASS / FAIL (or NOT WALKED) with the value it read, and leaves one picture in
//   docs/img/handpass/2026-10-17-r1b-till/<step>.png     (element-clipped, 2x desktop / 3x phone)
// It reads the app; the only writes are the ones a person makes with the controls (Reject, a typed remark, a filed input,
// a publish and a stretch). Nothing under src/ is touched.
//   node scripts/handpass/r1b-till-walk.mjs            (LOOK_URL=http://localhost:4180/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

console.log('r1b-till-walk v2')
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, '../../docs/img/handpass/2026-10-17-r1b-till')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4180/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})

const GP_LINE = 'To take an input off, press Reject on it in Personal Inputs below.'
const results = [], errs = []
const rec = (id, ok, note, pic) => {
  const tag = ok === true ? 'PASS' : ok === false ? 'FAIL' : ok === 'note' ? 'NOTE' : 'NOT WALKED'
  results.push({ id, tag, note, pic })
  console.log(`${tag}  ${id}  —  ${note}${pic ? `   [${pic}]` : ''}`)
}
const J = v => JSON.stringify(v)

/* ───────────────────────── drivers ───────────────────────── */
async function newCtx(tag, width, height, phone) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: phone ? 3 : 2, ...(phone ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 240)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 240)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} http ${r.status()}: ` + r.url().slice(0, 120)) })
  return { tag, phone, page, ctx }
}
const MARK_CSS = '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important} [data-wk]{outline:2px solid #ff2d55 !important;outline-offset:2px}'
async function signIn(C, who = 'ad', pw = 'a') {
  const { page } = C
  await page.goto(URL)
  await page.addStyleTag({ content: MARK_CSS })
  await page.fill('#luser', who); await page.fill('#lpass', pw)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(500)
}
const hideToast = page => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = 'none' })
const press = async (C, sel, nth = 0) => {
  const l = C.page.locator(sel).nth(nth)
  await l.scrollIntoViewIfNeeded()
  if (C.phone) await l.tap(); else await l.click()
}
async function closeBoard(C) {
  if (await C.page.locator('#schedBoard:not([hidden])').count()) {
    const b = C.page.locator('#sbDone:visible, #sbClose:visible').first()
    if (await b.count()) { await (C.phone ? b.tap() : b.click()); await C.page.waitForTimeout(400) }
  }
}
async function dropWindow(C) { const x = C.page.locator('#inpEditClose:visible').first(); if (await x.count()) { await x.click(); await C.page.waitForTimeout(300) } }
async function goPage(C, name) { await dropWindow(C); await closeBoard(C); await C.page.evaluate(n => window.go(n), name); await C.page.waitForTimeout(800); await hideToast(C.page) }
async function openWeek(C) { await goPage(C, 'editsched') }
async function openBoard(C) {
  await openWeek(C)
  await press(C, '#eWeek [data-sbday="0"]')
  await C.page.waitForSelector('#schedBoard:not([hidden])'); await C.page.waitForTimeout(700); await hideToast(C.page)
}
const PIROWS = { board: '#schedBoard .sb-panel.pinp .sb-arow.inprow', week: '#eWeek .day[data-day="0"] .sec-inp .pl-row' }
const PITOG = { board: '#schedBoard [data-pitog="0"]', week: '#eWeek .day[data-day="0"] [data-pitog="0"]' }
async function ensurePI(C, where) {
  if (!(await C.page.locator(PIROWS[where]).count())) { await press(C, PITOG[where]); await C.page.waitForTimeout(400) }
  return C.page.locator(PIROWS[where]).count()
}
const gpCount = (page, where) => page.evaluate(w => document.querySelectorAll(w === 'board' ? '#schedBoard .sb-panel.grnd .gr-frominput' : '#eWeek .day[data-day="0"] .sec-grnd .gr-frominput').length, where)

/* a picture clipped to the union of the elements `sels` find (visible ones), scrolled into view first; `marks` get a red outline */
async function snap(page, name, sels, marks = [], pad = 8) {
  const prep = await page.evaluate(([sels, marks]) => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 }
    const els = sels.flatMap(s => [...document.querySelectorAll(s)]).filter(vis)
    if (!els.length) return false
    els[0].scrollIntoView({ block: 'center', inline: 'nearest' })
    for (const s of marks) for (const e of document.querySelectorAll(s)) if (vis(e)) e.setAttribute('data-wk', '1')
    return true
  }, [sels, marks])
  if (!prep) { errs.push(`${name}: nothing to picture for ${J(sels)}`); return null }
  await page.waitForTimeout(200)
  const clip = await page.evaluate(([sels, pad]) => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 }
    let L = 1e9, T = 1e9, R = -1e9, B = -1e9
    for (const e of sels.flatMap(s => [...document.querySelectorAll(s)]).filter(vis)) { const r = e.getBoundingClientRect(); L = Math.min(L, r.left); T = Math.min(T, r.top); R = Math.max(R, r.right); B = Math.max(B, r.bottom) }
    const x = Math.max(0, L - pad), y = Math.max(0, T - pad), r = Math.min(innerWidth, R + pad), b = Math.min(innerHeight, B + pad)
    return { x, y, width: Math.max(2, r - x), height: Math.max(2, b - y) }
  }, [sels, pad])
  await page.screenshot({ path: join(OUT, name + '.png'), clip })
  await page.evaluate(() => document.querySelectorAll('[data-wk]').forEach(e => e.removeAttribute('data-wk')))
  return name + '.png'
}
/* one step: fn returns { ok: true|false|null, note, pic? } — a throw is a FAIL with the error text (read it before blaming the app) */
async function step(id, fn) {
  try {
    const r = await fn()
    rec(id, r.ok, r.note, r.pic)
  } catch (e) { rec(id, false, 'SCRIPT/DRIVER ERROR (read before blaming the app): ' + String(e.message || e).split('\\n')[0].slice(0, 260)) }
}
const nums = o => o ? `${o.l}-${o.r} x ${o.t}-${o.b}` : 'none'

/* ───────────────────────── page-side readers ───────────────────────── */
const RECT = `const R = e => { if (!e) return null; const b = e.getBoundingClientRect(); return { l: Math.round(b.left), r: Math.round(b.right), t: Math.round(b.top), b: Math.round(b.bottom), w: Math.round(b.width), h: Math.round(b.height) } }
const hit = (a, b) => !!(a && b && a.l < b.r - 0.5 && b.l < a.r - 0.5 && a.t < b.b - 0.5 && b.t < a.b - 0.5)`

/* ═════════════ STEP 1 — the board's wave header ═════════════ */
async function s1(C) {
  await openBoard(C)
  const r = await C.page.evaluate(`(() => { ${RECT}
    const need = { '+ In-time / Rally': '[data-itadd]', '+ Line': '[data-gline]', '✕ Wave': '[data-gdel]', 'Auto sort': '[data-sortsec]', 'Traffic': '[data-air]' }
    const hs = [...document.querySelectorAll('#schedBoard .sb-go-h')].filter(h => h.getBoundingClientRect().width > 1)
    return { pageOverflow: document.documentElement.scrollWidth > innerWidth + 1, heads: hs.map(h => { const hb = R(h)
      const btns = Object.fromEntries(Object.entries(need).map(([k, s]) => { const b = h.querySelector(s); if (!b) return [k, null]; const r = R(b); return [k, { inside: r.l >= hb.l - 1 && r.r <= hb.r + 1 && r.t >= hb.t - 1 && r.b <= hb.b + 1, vis: r.w > 1 }] }))
      return { text: h.innerText.replace(/\\s+/g, ' ').trim(), asd: h.querySelectorAll('.asd').length, scrollOver: h.scrollWidth > h.clientWidth + 1, btns, h: hb.h, w: hb.w } }) } })()`)
  const bad = []
  r.heads.forEach((h, i) => {
    if (/(In-time|Rally)[^+]*\d{1,2}:\d{2}/i.test(h.text) || /\d+\s*ac\b/i.test(h.text) || h.asd) bad.push(`wave ${i + 1} still prints a note: "${h.text}"`)
    for (const [k, v] of Object.entries(h.btns)) if (!v || !v.vis) bad.push(`wave ${i + 1} lacks ${k}`); else if (!v.inside) bad.push(`wave ${i + 1} ${k} sticks out of its header`)
    if (h.scrollOver) bad.push(`wave ${i + 1} header scrolls sideways`)
  })
  if (!r.heads.length) bad.push('no wave header drawn')
  if (r.pageOverflow) bad.push('the page scrolls sideways')
  const pic = await snap(C.page, `s1-wave-header-${C.tag}`, ['#schedBoard .sb-go-h'], [])
  return { ok: !bad.length, note: bad.length ? bad.join('; ') : `${r.heads.length} wave header(s), none carries a time note or "N ac"; header 1 reads "${r.heads[0].text}" (${r.heads[0].w}x${r.heads[0].h}px), all five buttons inside it`, pic }
}

/* ═════════════ STEP 2 — Reject ═════════════ */
async function s2(C, where) {
  if (where === 'board') await openBoard(C); else await openWeek(C)
  const n = await ensurePI(C, where)
  if (!n) return { ok: null, note: 'Personal Inputs showed no rows to press Reject on' }
  const scope = where === 'board' ? '#schedBoard' : '#eWeek .day[data-day="0"]'
  const wordsOf = await C.page.evaluate(sc => [...document.querySelectorAll(sc + ' .accb')].map(b => ({ t: b.textContent.trim(), title: b.title, acc: b.dataset.acc })), scope)
  const rejects = wordsOf.filter(b => b.acc === 'x' || /^(Reject|Undo)/.test(b.t))
  const bad = []
  if (!rejects.length) bad.push('no Reject-type button found')
  for (const b of rejects) { if (!/^Reject/.test(b.t)) bad.push(`button reads "${b.t}"`); if (!/^Take /.test(b.title)) bad.push(`hover text "${b.title}" does not start "Take "`) }
  if (wordsOf.some(b => /^Undo\b/.test(b.t))) bad.push('an "Undo" is still on an input row')
  /* the target: Monday's Meeting input */
  const id = await C.page.evaluate(sc => { const r = [...document.querySelectorAll(sc + ' [data-inprow]')].find(r => /Meeting/.test(r.querySelector('.inpedit')?.textContent || '') && r.querySelector('.accb[data-acc="x"]')); return r?.dataset.inprow || null }, scope)
  if (!id) return { ok: false, note: 'no accepted Meeting row with a Reject button on Monday; buttons read ' + J(wordsOf) }
  const before = await gpCount(C.page, where)
  const rowSel = `${scope} [data-inprow="${id}"]`
  const pic0 = await snap(C.page, `s2-${where}-${C.tag}-before`, [rowSel], [`${rowSel} .accb`])
  await press(C, `${rowSel} .accb[data-acc="x"]`); await C.page.waitForTimeout(600)
  await ensurePI(C, where)
  const after = await C.page.evaluate(([sel]) => { const r = document.querySelector(sel); const b = r?.querySelector('.accb'); return { t: b?.textContent.trim(), acc: b?.dataset.acc, title: b?.title } }, [rowSel])
  const gpAfter = await gpCount(C.page, where)
  if (gpAfter !== before - 1) bad.push(`Ground Programme input rows ${before} -> ${gpAfter} (expected ${before - 1})`)
  if (!/^Accept/.test(after.t || '')) bad.push(`after Reject the row's button reads "${after.t}" (expected Accept)`)
  const pic1 = await snap(C.page, `s2-${where}-${C.tag}-rejected`, [rowSel], [`${rowSel} .accb`])
  /* the top bar's Undo puts it back */
  const undoSel = where === 'board' ? '#sbUndo' : '#undoBtn'
  let undid = 'n/a'
  const ub = C.page.locator(undoSel).first()
  if (!(await ub.isVisible())) { bad.push(`${undoSel} not visible`) } else if (await ub.isDisabled()) { bad.push(`${undoSel} is disabled after a Reject`) } else {
    await (C.phone ? ub.tap() : ub.click()); await C.page.waitForTimeout(700); await ensurePI(C, where)
    const back = await C.page.evaluate(sel => { const b = document.querySelector(sel + ' .accb'); return b?.textContent.trim() }, rowSel)
    const gpBack = await gpCount(C.page, where)
    undid = `back to "${back}", programme rows ${gpBack}`
    if (!/^Reject/.test(back || '')) bad.push(`after Undo the button reads "${back}"`)
    if (gpBack !== before) bad.push(`after Undo programme input rows ${gpBack} (expected ${before})`)
  }
  const pic2 = await snap(C.page, `s2-${where}-${C.tag}-undone`, [rowSel], [`${rowSel} .accb`])
  return { ok: !bad.length, note: bad.length ? bad.join('; ') : `buttons read ${J([...new Set(rejects.map(b => b.t))])}, hover "${rejects[0].title}"; pressed: programme rows ${before}->${gpAfter}, row now offers "${after.t}"; Undo: ${undid}`, pic: [pic0, pic1, pic2].filter(Boolean).join(' ') }
}

/* ═════════════ STEP 3 — the Ground Programme's line ═════════════ */
async function s3(C) {
  const out = {}
  await openBoard(C)
  out.board = await C.page.evaluate(`(() => { const p = document.querySelector('#schedBoard .sb-panel.grnd'); const notes = [...p.querySelectorAll('.sb-pinote')].map(e => e.textContent.trim()); const first = p.querySelector('.sb-pb')?.firstElementChild; return { notes, firstIsIt: !!first && first.classList.contains('sb-pinote'), fromInput: p.querySelectorAll('.gr-frominput').length } })()`)
  const pb = await snap(C.page, `s3-board-gp-${C.tag}`, ['#schedBoard .sb-panel.grnd .sb-ph', '#schedBoard .sb-panel.grnd .sb-pinote'], ['#schedBoard .sb-panel.grnd .sb-pinote'])
  await openWeek(C)
  out.week = await C.page.evaluate(`(() => { const s = document.querySelector('#eWeek .day[data-day="0"] .sec-grnd'); const notes = [...s.querySelectorAll('.pl-inpnote')].map(e => e.textContent.trim()); const head = s.querySelector('.sub-h'); return { notes, directlyUnderHead: !!head.nextElementSibling && head.nextElementSibling.classList.contains('pl-inpnote'), fromInput: s.querySelectorAll('.gr-frominput').length } })()`)
  const pw = await snap(C.page, `s3-week-gp-${C.tag}`, ['#eWeek .day[data-day="0"] .sec-grnd > .sub-h', '#eWeek .day[data-day="0"] .sec-grnd > .pl-inpnote'], ['#eWeek .day[data-day="0"] .sec-grnd > .pl-inpnote'])
  /* a day with nothing from an input on its programme — the line must not stand there */
  out.empty = await C.page.evaluate(`(() => { const r = []; for (const d of document.querySelectorAll('#eWeek .day[data-day]')) { const s = d.querySelector('.sec-grnd'); if (!s) continue; r.push({ day: d.dataset.day, fromInput: s.querySelectorAll('.gr-frominput').length, notes: s.querySelectorAll('.pl-inpnote').length }) } return r })()`)
  await goPage(C, 'viewsched')
  out.view = await C.page.evaluate(`(() => { const s = document.querySelector('#vWeek .day[data-day="0"] .sec-grnd'); return { exists: !!s, fromInput: s ? s.querySelectorAll('.gr-frominput').length : 0, notes: document.querySelectorAll('#vWeek .pl-inpnote').length, anyText: /To take an input off/.test(document.body.innerText) } })()`)
  const pv = await snap(C.page, `s3-viewonly-gp-${C.tag}`, ['#vWeek .day[data-day="0"] .sec-grnd'], [], 6)
  const bad = []
  if (J(out.board.notes) !== J([GP_LINE])) bad.push(`board line reads ${J(out.board.notes)}`)
  if (!out.board.firstIsIt) bad.push('board line is not the first thing under the heading')
  if (J(out.week.notes) !== J([GP_LINE])) bad.push(`week line reads ${J(out.week.notes)}`)
  if (!out.week.directlyUnderHead) bad.push('week line is not directly under the heading')
  const empties = out.empty.filter(d => d.fromInput === 0)
  if (empties.some(d => d.notes)) bad.push('the line stands on a day with no input on its programme: ' + J(empties.filter(d => d.notes)))
  if (!out.view.exists || !out.view.fromInput) bad.push(`view-only Monday programme not proven (exists ${out.view.exists}, input rows ${out.view.fromInput})`)
  if (out.view.notes || out.view.anyText) bad.push('the line appears on View-only Sched')
  return { ok: !bad.length, note: bad.length ? bad.join('; ') : `board "${out.board.notes[0]}" (${out.board.fromInput} input rows); week same, directly under the heading; days with no input row carry no line (${empties.length} checked); View-only Monday programme has ${out.view.fromInput} input rows and no line`, pic: [pb, pw, pv].filter(Boolean).join(' ') }
}

/* ═════════════ STEP 4 — the Reject on the puck's line (phone) / unchanged (desktop) ═════════════ */
async function s4board(C) {
  await openBoard(C); await ensurePI(C, 'board')
  const rows = await C.page.evaluate(`(() => { ${RECT}
    return [...document.querySelectorAll('${PIROWS.board}')].map(r => { const btn = R(r.querySelector('.accb')); const pk = [...r.querySelectorAll('.ppl .puck')].map(R); const rm = R(r.querySelector('textarea.rmkin')); const rt = R(r.querySelector('.rmkt')); const rr = R(r)
      return { name: r.querySelector('.inpedit')?.textContent.trim(), text: r.querySelector('.accb')?.textContent.trim(), pucks: pk.length, btn, puck: pk[0] || null, rm, rt, row: rr, overPuck: pk.some(p => hit(btn, p)), overRmk: hit(btn, rm), onScreen: !!btn && btn.l >= 0 && btn.r <= innerWidth } }) })()`)
  const bad = [], seen = []
  const one = rows.filter(r => r.pucks === 1 && r.text === 'Reject')
  if (!one.length) return { ok: null, note: 'no one-person plain-Reject row on the board to measure: ' + J(rows.map(r => [r.name, r.pucks, r.text])) }
  for (const r of one) {
    if (C.phone) {
      if (!(r.btn.t >= r.puck.t - 3 && r.btn.t <= r.puck.b)) bad.push(`${r.name}: button top ${r.btn.t} is outside the puck's line ${r.puck.t}-${r.puck.b}`)
      if (r.overPuck) bad.push(`${r.name}: button overlaps the puck`)
      if (r.overRmk) bad.push(`${r.name}: button overlaps the remark box`)
      if (!r.onScreen) bad.push(`${r.name}: button not fully on screen (${nums(r.btn)} in ${C.tag})`)
      if (r.btn.l < r.puck.r - 1) bad.push(`${r.name}: button is left of the puck's right edge`)
      if (r.rm && r.btn.r > r.rm.l + 1) bad.push(`${r.name}: button reaches into the remark box`)
    } else {
      if (r.row.h > 64) bad.push(`${r.name}: desktop row ${r.row.h}px tall (not one line)`)
      if (Math.abs((r.btn.t + r.btn.b) / 2 - (r.puck.t + r.puck.b) / 2) > 14) bad.push(`${r.name}: desktop button not on the puck's line`)
    }
    seen.push(`${r.name}: puck ${r.puck.l}-${r.puck.r}, btn ${r.btn.l}-${r.btn.r} @ y ${r.btn.t}-${r.btn.b} (puck y ${r.puck.t}-${r.puck.b}), remark ${r.rm ? r.rm.l + '-' + r.rm.r : '-'}, row ${r.row.h}px`)
  }
  const pic = await snap(C.page, `s4-board-pi-${C.tag}`, ['#schedBoard .sb-panel.pinp .sb-pb'], ['#schedBoard .sb-panel.pinp .accb'])
  return { ok: !bad.length, note: bad.length ? bad.join('; ') : `${one.length} one-person rows: ` + seen.join(' | '), pic }
}
async function s4week(C) {
  await openWeek(C); await ensurePI(C, 'week')
  const rows = await C.page.evaluate(`(() => { ${RECT}
    return [...document.querySelectorAll('${PIROWS.week}')].map(r => { const btn = R(r.querySelector('.accb')); const nm = R(r.querySelector(':scope > .nm .ntx')); const rr = R(r); const pk = [...r.querySelectorAll('.ppl .puck')].map(R)
      return { name: r.querySelector('.nm .ntx')?.textContent.trim(), text: r.querySelector('.accb')?.textContent.trim(), btn, nm, row: rr, puck: pk[0] || null, overPuck: pk.some(p => hit(btn, p)) } }) })()`)
  const rej = rows.filter(r => r.text === 'Reject')
  if (!rej.length) return { ok: null, note: 'no Reject row in the week to measure: ' + J(rows.map(r => [r.name, r.text])) }
  const bad = [], seen = []
  for (const r of rej) {
    if (C.phone) {
      if (r.btn.t < r.nm.b - 2) bad.push(`${r.name}: button (top ${r.btn.t}) is not under the name (bottom ${r.nm.b})`)
      if (r.btn.l < r.row.l - 1 || r.btn.r > r.row.r + 1 || r.btn.b > r.row.b + 1) bad.push(`${r.name}: button leaves its row (${nums(r.btn)} vs ${nums(r.row)})`)
      if (r.row.b - r.btn.b > 16) bad.push(`${r.name}: ${r.row.b - r.btn.b}px of row left under the button (a line of its own?)`)
      if (r.overPuck) bad.push(`${r.name}: button overlaps a puck`)
      if (r.btn.r > innerWidthOf(C)) bad.push(`${r.name}: button runs off screen`)
    } else {
      /* the week's day card is a narrow column even at 1440: the 16 Oct measure (before the till date) had the button under the name there, rows 53/53/68px */
      if (r.btn.t < r.nm.b - 2) bad.push(`${r.name}: desktop button (top ${r.btn.t}) not under the name (bottom ${r.nm.b})`)
      if (r.btn.l < r.row.l - 1 || r.btn.r > r.row.r + 1 || r.btn.b > r.row.b + 1) bad.push(`${r.name}: desktop button leaves its row`)
      if (r.overPuck) bad.push(`${r.name}: desktop button overlaps a puck`)
    }
    seen.push(`${r.name}: name y ${r.nm.t}-${r.nm.b}, btn x ${r.btn.l}-${r.btn.r} y ${r.btn.t}-${r.btn.b}, row y ${r.row.t}-${r.row.b} (${r.row.h}px)`)
  }
  if (!C.phone) rec('4-desk  NOTE week Personal Inputs row heights vs the 16 Oct measure', 'note', `rows now ${rej.map(r => r.row.h).join('/')}px; the 16 Oct measure (round 1b, before the till date) had 53/53/68px at 1440; Reject sits under the name in both`)
  const pic = await snap(C.page, `s4-week-pi-${C.tag}`, ['#eWeek .day[data-day="0"] .sec-inp'], ['#eWeek .day[data-day="0"] .sec-inp .accb'])
  return { ok: !bad.length, note: bad.length ? bad.join('; ') : `${rej.length} rows: ` + seen.join(' | '), pic }
}
const innerWidthOf = C => C.page.viewportSize().width

/* ═════════════ STEP 5b/5c/5d/5e — the remark box and the grey date ═════════════ */
const GREY = `const grey = e => { const c = getComputedStyle(e).color.match(/\\d+/g).map(Number); return { rgb: c.slice(0, 3).join(','), neutral: Math.max(...c.slice(0, 3)) - Math.min(...c.slice(0, 3)) <= 40 } }`
async function s5bReads(C) {
  /* the week: Unavailable "Medically down", Personal Inputs; the board: the same */
  await openWeek(C); await ensurePI(C, 'week')
  const wk = await C.page.evaluate(`(() => { ${GREY}
    const D = document.querySelector('#eWeek .day[data-day="0"]'); const out = []
    for (const r of D.querySelectorAll('.sec-unav .pl-row, .sec-inp .pl-row')) { const box = r.querySelector('.rmk .ntx'); const till = r.querySelector('.rmk .rk-till'); out.push({ sec: r.closest('.sec-unav') ? 'unav' : 'inp', name: r.querySelector('.nm .ntx')?.textContent.trim(), box: box?.textContent, till: till?.textContent, follows: !!till && till.previousElementSibling === box, boxHasTill: /\\btill\\b/i.test(box?.textContent || ''), grey: till ? grey(till) : null }) }
    return out })()`)
  const pic1 = await snap(C.page, `s5b-week-unav-${C.tag}`, ['#eWeek .day[data-day="0"] .sec-inp', '#eWeek .day[data-day="0"] .sec-unav'], ['#eWeek .day[data-day="0"] .rk-till'])
  await openBoard(C); await ensurePI(C, 'board')
  const bd = await C.page.evaluate(`(() => { ${GREY}
    const out = []
    for (const r of document.querySelectorAll('#schedBoard .sb-panel.pinp .inprow, #schedBoard .sb-panel.unav .inprow')) { const box = r.querySelector('textarea.rmkin'); const till = r.querySelector('.rmkt .rk-till'); out.push({ sec: r.closest('.pinp') ? 'inp' : 'unav', name: r.querySelector('.inpedit')?.textContent.trim(), box: box?.value, till: till?.textContent, follows: !!till && till.previousElementSibling === box, boxHasTill: /\\btill\\b/i.test(box?.value || ''), grey: till ? grey(till) : null }) }
    return out })()`)
  const pic2 = await snap(C.page, `s5b-board-unav-${C.tag}`, ['#schedBoard .sb-panel.pinp .sb-pb', '#schedBoard .sb-panel.unav .sb-pb'], ['#schedBoard .rk-till'])
  const bad = []
  const chk = (label, rows) => {
    if (!rows.length) bad.push(label + ': no rows'); else for (const r of rows) {
      if (!r.till || !/^till \d{1,2} [A-Z][a-z]{2}$/.test(r.till)) bad.push(`${label} ${r.name}: grey date reads ${J(r.till)}`)
      if (r.boxHasTill) bad.push(`${label} ${r.name}: box holds a "till" (${J(r.box)})`)
      if (!r.follows) bad.push(`${label} ${r.name}: grey date does not follow the box`)
      if (r.grey && !r.grey.neutral) bad.push(`${label} ${r.name}: date colour ${r.grey.rgb} is not grey`)
    }
  }
  chk('week', wk); chk('board', bd)
  const dn = wk.find(r => r.name === 'ATT C'), dnb = bd.find(r => r.name === 'ATT C')
  if (!dn || dn.box !== 'Medically down' || dn.till !== 'till 17 Jul') bad.push('week downchit row is not "Medically down" + "till 17 Jul": ' + J(dn))
  if (!dnb || dnb.box !== 'Medically down' || dnb.till !== 'till 17 Jul') bad.push('board downchit row is not "Medically down" + "till 17 Jul": ' + J(dnb))
  return { ok: !bad.length, note: bad.length ? bad.join('; ') : `week: ${wk.map(r => `${r.name}=[${r.box}]+${r.till}`).join(', ')}; board: ${bd.map(r => `${r.name}=[${r.box}]+${r.till}`).join(', ')}; the grey date follows each box (colour ${wk.find(r => r.grey)?.grey.rgb})`, pic: [pic1, pic2].join(' ') }
}

/* type a word into a Personal Inputs remark box, press Tab, read what was saved */
async function s5bType(C, where, who, word) {
  if (where === 'board') { await openBoard(C) } else { await openWeek(C) }
  await ensurePI(C, where)
  const scope = where === 'board' ? '#schedBoard' : '#eWeek .day[data-day="0"]'
  const rowSel = await C.page.evaluate(([sc, who]) => { const r = [...document.querySelectorAll(sc + ' [data-inprow]')].find(r => r.querySelector('.puck .nm')?.textContent === who && r.closest('.pinp, .sec-inp')); return r ? `${sc} [data-inprow="${r.dataset.inprow}"]` : null }, [scope, who])
  if (!rowSel) return { ok: null, note: `no Personal Inputs row for ${who}` }
  const id = rowSel.match(/"(.+)"/)[1]
  const boxSel = where === 'board' ? `${rowSel} textarea.rmkin` : `${rowSel} .rmk .ntx`
  const read = () => C.page.evaluate(([bs, rs, id, word]) => { const b = document.querySelector(bs); const r = document.querySelector(rs); const till = r.querySelector('.rk-till'); const rec = (window.INPUTS || []).find(i => i.id === id || JSON.stringify(i).includes(id)) || (window.INPUTS || []).find(i => String(i.remarks || '').includes(word)); return { box: b.value ?? b.textContent, till: till?.textContent, follows: !!till && till.previousElementSibling === b, stored: rec ? rec.remarks : undefined } }, [boxSel, rowSel, id, word])
  const b4 = await read()
  await press(C, boxSel)
  await C.page.keyboard.press('Control+End')
  await C.page.keyboard.type(' ' + word, { delay: 20 })
  const pic1 = await snap(C.page, `s5b-type-${where}-${C.tag}-typing`, [rowSel], [boxSel])
  await C.page.keyboard.press('Tab'); await C.page.waitForTimeout(700)
  /* the screen may have redrawn — find the row again */
  const af = await read()
  const pic2 = await snap(C.page, `s5b-type-${where}-${C.tag}-saved`, [rowSel], [`${rowSel} .rk-till`])
  const bad = []
  if (!(af.box || '').includes(word)) bad.push(`box reads ${J(af.box)} (word lost)`)
  if (/\btill\b/i.test(af.box || '')) bad.push(`"till" appears inside the box: ${J(af.box)}`)
  if (!af.till || !/^till /.test(af.till)) bad.push(`grey date after the box is ${J(af.till)}`)
  if (!af.follows) bad.push('grey date no longer follows the box')
  if (af.stored != null && (!String(af.stored).includes(word) || /\btill\b/i.test(af.stored))) bad.push(`stored remark is ${J(af.stored)}`)
  return { ok: !bad.length, note: bad.length ? bad.join('; ') : `${who}'s box ${J(b4.box)} -> ${J(af.box)} (stored ${J(af.stored)}), grey "${af.till}" still after it`, pic: [pic1, pic2].join(' ') }
}

/* 5c: a Ground Programme row that came from an input — "<remark> till <date>"; Tab through it unchanged */
async function s5c(C, where) {
  if (where === 'board') await openBoard(C); else await openWeek(C)
  const scope = where === 'board' ? '#schedBoard .sb-panel.grnd' : '#eWeek .day[data-day="0"] .sec-grnd'
  const rowSel = await C.page.evaluate(sc => { const rows = [...document.querySelectorAll(sc + ' .gr-frominput')]; const i = rows.findIndex(r => r.querySelector('.puck .nm')?.textContent === 'Bolt'); if (i < 0) return null; rows[i].setAttribute('data-wk-t', '1'); return `${sc} [data-wk-t="1"]` }, scope)
  if (!rowSel) return { ok: null, note: 'no Ground Programme row from an input for Bolt' }
  const boxSel = where === 'board' ? `${rowSel} textarea.rmkin` : `${rowSel} .rmk .ntx`
  const state = () => C.page.evaluate(([bs]) => { const b = document.querySelector(bs); const el = window.ELOG; const dp = [...document.querySelectorAll('#eWeek .dpend, #schedBoard .dpend')].map(e => e.textContent.trim()).join('|'); return { box: b.value ?? b.textContent, rows: el?.rows?.length ?? -1, hist: (window.HIST?.ix ?? -1) + '/' + (window.HIST?.stack?.length ?? -1), inputs: JSON.stringify(window.INPUTS).length, pend: dp, cls: document.querySelector('[data-wk-t]').className } }, [boxSel])
  const s0 = await state()
  await press(C, boxSel); await C.page.waitForTimeout(250)
  const focused = await C.page.evaluate(bs => document.activeElement === document.querySelector(bs) || document.querySelector(bs).contains(document.activeElement), boxSel)
  const pic1 = await snap(C.page, `s5c-${where}-${C.tag}-focused`, [rowSel], [boxSel])
  await C.page.keyboard.press('Tab'); await C.page.waitForTimeout(700)
  const stillFocused = await C.page.evaluate(bs => { const b = document.querySelector(bs); return !!b && (document.activeElement === b) }, boxSel)
  const s1 = await state()
  await C.page.evaluate(() => document.querySelectorAll('[data-wk-t]').forEach(e => e.removeAttribute('data-wk-t')))
  const bad = []
  if (!focused) bad.push('the click did not put the cursor in the box (gesture not proven)')
  if (stillFocused) bad.push('Tab did not leave the box (gesture not proven)')
  if (!/ till \d{1,2} [A-Z][a-z]{2}$/.test(s0.box)) bad.push(`programme row remark reads ${J(s0.box)} (expected "<remark> till <date>")`)
  for (const k of ['box', 'rows', 'hist', 'inputs', 'pend']) if (s0[k] !== s1[k]) bad.push(`${k} changed ${J(s0[k])} -> ${J(s1[k])}`)
  return { ok: !bad.length, note: bad.length ? bad.join('; ') : `box reads ${J(s0.box)}; click+Tab changed nothing (edit-log rows ${s0.rows}, history ${s0.hist}, pending ${J(s0.pend) || 'none'})`, pic: pic1 }
}

/* 5d: View-only Sched prints "<remark> till <date>" as one text */
async function s5d(C) {
  await goPage(C, 'viewsched')
  const rows = await C.page.evaluate(`(() => [...document.querySelectorAll('#vWeek .day[data-day="0"] .sec-unav .pl-row')].map(r => ({ name: r.querySelector('.nm .ntx')?.textContent.trim(), rmk: r.querySelector('.rmk')?.textContent, parts: r.querySelectorAll('.rmk .rk-till').length, kids: r.querySelector('.rmk')?.children.length })))()`)
  const pic = await snap(C.page, `s5d-viewonly-unav-${C.tag}`, ['#vWeek .day[data-day="0"] .sec-unav'], ['#vWeek .day[data-day="0"] .sec-unav .rmk'])
  const bad = []
  if (!rows.length) bad.push('no Unavailable rows on View-only Sched Monday')
  for (const r of rows) { if (!/ till \d{1,2} [A-Z][a-z]{2}$/.test(r.rmk || '')) bad.push(`${r.name}: reads ${J(r.rmk)}`); if (r.parts) bad.push(`${r.name}: date is a separate grey part`) }
  const dn = rows.find(r => r.name === 'ATT C')
  if (!dn || dn.rmk !== 'Medically down till 17 Jul') bad.push('downchit does not read "Medically down till 17 Jul": ' + J(dn))
  return { ok: !bad.length, note: bad.length ? bad.join('; ') : rows.map(r => `${r.name}: ${J(r.rmk)}`).join(' | '), pic }
}

/* 5e: the board's Unavailable "+ Add" */
async function s5e(C) {
  await openBoard(C)
  await press(C, '#schedBoard .sb-panel.unav [data-inpadd="0.u"]'); await C.page.waitForSelector('#inpEditRmk', { state: 'visible' }); await C.page.waitForTimeout(500)
  const r = await C.page.evaluate(`(() => { const t = document.querySelector('[data-testid="inped-till"]'); const box = document.querySelector('#inpEditRmk'); return { rmk: box?.value, till: t?.textContent, after: !!t && !!box && (box.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0, type: document.querySelector('#inpEditType')?.value } })()`)
  const pic = await snap(C.page, `s5e-board-unav-add-${C.tag}`, ['#inpEditPop .inpedbox', '#inpEditPop.inpedbox'], ['#inpEditRmk', '[data-testid="inped-till"]'])
  const bad = []
  if (r.rmk !== '') bad.push(`Remarks box holds ${J(r.rmk)}`)
  if (r.till !== 'till 13 Jul') bad.push(`grey date reads ${J(r.till)} (expected "till 13 Jul")`)
  if (!r.after) bad.push('grey date is not after the box')
  /* close it without saving */
  const x = C.page.locator('#inpEditClose:visible').first()
  if (await x.count()) await (C.phone ? x.tap() : x.click()); else await C.page.keyboard.press('Escape')
  await C.page.waitForTimeout(400)
  if (await C.page.locator('#inpEditRmk:visible').count()) bad.push('the window did not close')
  return { ok: !bad.length, note: bad.length ? bad.join('; ') : `window (type ${r.type}) opens with Remarks ${J(r.rmk)} and grey "${r.till}" after it`, pic }
}

/* ═════════════ STEP 5a — the Inputs page: a new input's window, the card, the List ═════════════ */
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
async function calTo(C, y, m) {
  for (let i = 0; i < 40; i++) {
    const t = (await C.page.locator('#inpCal .ic-mon').innerText()).trim().toUpperCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+t[1] * 12 + MONTHS.findIndex(x => x.startsWith(t[0])))
    if (!d) return `${t[0]} ${t[1]}`
    await press(C, d > 0 ? '#icNext' : '#icPrev'); await C.page.waitForTimeout(200)
  }
  throw new Error('the calendar never reached the month asked for')
}
async function openDayAdd(C, iso) {
  await goPage(C, 'inputs')
  const at = await calTo(C, 2026, 7)
  await C.page.locator(`#inpCal [data-icday="${iso}"]`).click({ position: { x: 8, y: 8 } }); await C.page.waitForTimeout(400)
  await C.page.locator('#icPopAdd').click(); await C.page.waitForSelector('[data-testid="win-inputedit"]'); await C.page.waitForTimeout(400)
  return at
}
const readWin = page => page.evaluate(`(() => { const t = document.querySelector('[data-testid="inped-till"]'); const box = document.querySelector('#inpEditRmk'); return { rmk: box?.value, till: t?.textContent, after: !!t && !!box && (box.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0, type: document.querySelector('#inpEditType')?.value, person: document.querySelector('#inpEditPerson')?.value ?? null, hdr: (document.querySelector('#inpEditPop')?.innerText.split('\\n').find(l => l.indexOf('→') > 0 && l.indexOf('Jul') >= 0) || '').trim() } })()`)
let FILED = null
async function s5a(C) {
  const at = await openDayAdd(C, '2026-07-14')
  const r0 = await readWin(C.page)
  const pic0 = await snap(C.page, 's5a-1-open', ['[data-testid="win-inputedit"]'], ['#inpEditRmk', '[data-testid="inped-till"]'], 6)
  const bad = []
  if (r0.rmk !== '') bad.push(`on open the Remarks box holds ${J(r0.rmk)}`)
  if (r0.till !== 'till 14 Jul') bad.push(`on open the grey date reads ${J(r0.till)} (expected "till 14 Jul")`)
  if (!r0.after) bad.push('on open the grey date is not after the box')
  rec('5a-1 window on open (calendar on ' + at + ', day 14 Jul)', !bad.length, bad.length ? bad.join('; ') : `type ${r0.type}, person ${J(r0.person)}, Remarks ${J(r0.rmk)}, grey "${r0.till}" after the box`, pic0)
  /* a later end date on the window's calendar */
  await press(C, '#inpEdCal [data-iso="2026-07-17"]'); await C.page.waitForTimeout(350)
  let r1 = await readWin(C.page); let taps = 1
  if (r1.till !== 'till 17 Jul') { await press(C, '#inpEdCal [data-iso="2026-07-17"]'); await C.page.waitForTimeout(350); r1 = await readWin(C.page); taps = 2 }
  const pic1 = await snap(C.page, 's5a-2-later-end', ['[data-testid="win-inputedit"]'], ['#inpEditRmk', '[data-testid="inped-till"]'], 6)
  const b1 = []
  if (r1.till !== 'till 17 Jul') b1.push(`after tapping 17 Jul the grey date reads ${J(r1.till)}`)
  if (!/(14 Jul|Jul 14) *→ *(17 Jul|Jul 17)/.test(r1.hdr)) b1.push(`window heading reads ${J(r1.hdr)} (expected the range 14 Jul → 17 Jul)`)
  if (r1.rmk !== '') b1.push(`the Remarks box changed to ${J(r1.rmk)}`)
  rec('5a-2 pick a later end date', !b1.length, b1.length ? b1.join('; ') : `${taps} tap(s) on 17 Jul: grey "${r0.till}" -> "${r1.till}", heading ${J(r1.hdr)}, Remarks box still ${J(r1.rmk)}`, pic1)
  /* type the remark, save */
  await C.page.locator('#inpEditRmk').fill('Las Vegas'); await C.page.waitForTimeout(200)
  const r2 = await readWin(C.page)
  const pic2 = await snap(C.page, 's5a-3-typed', ['[data-testid="win-inputedit"]'], ['#inpEditRmk', '[data-testid="inped-till"]'], 6)
  const b2 = []
  if (r2.rmk !== 'Las Vegas') b2.push(`box reads ${J(r2.rmk)}`)
  if (r2.till !== 'till 17 Jul') b2.push(`grey date reads ${J(r2.till)} after typing`)
  rec('5a-3 type "Las Vegas"', !b2.length, b2.length ? b2.join('; ') : `box ${J(r2.rmk)}, grey still "${r2.till}"`, pic2)
  await press(C, '#inpEditSave'); await C.page.waitForTimeout(900)
  const gone = (await C.page.locator('[data-testid="win-inputedit"]').count()) === 0
  const rec1 = await C.page.evaluate(() => { const r = (window.INPUTS || []).filter(i => /Las Vegas/.test(JSON.stringify(i))); return r.map(i => ({ remarks: i.remarks, date: i.date, type: i.type, end: i.endDate || i.end || i.to })) })
  FILED = rec1[0] || null
  const bs = []
  if (!gone) bs.push('window did not close on Add')
  if (rec1.length !== 1) bs.push(`stored ${rec1.length} records mentioning Las Vegas`)
  else if (rec1[0].remarks !== 'Las Vegas') bs.push(`stored remark is ${J(rec1[0].remarks)} (expected the typed words only)`)
  rec('5a-4 saved (Add)', !bs.length, bs.length ? bs.join('; ') : `window closed; stored ${J(rec1[0])}`)
  /* the card on that day */
  if (!(await C.page.locator('[data-testid="win-inputsday"]').count())) { await C.page.locator('#inpCal [data-icday="2026-07-14"]').click({ position: { x: 8, y: 8 } }); await C.page.waitForTimeout(500) }
  const card = await C.page.evaluate(`(() => { const w = document.querySelector('[data-testid="win-inputsday"]'); if (!w) return { win: false }
    const all = [...w.querySelectorAll('*')].filter(e => e.children.length === 0 && /Las Vegas/.test(e.textContent)); const el = all[0]; if (!el) return { win: true, found: false, text: w.innerText.slice(0, 300) }
    let card = el; while (card.parentElement && card.parentElement !== w && !/card|inp|row|item/i.test(card.className + ' ' + (card.getAttribute('data-testid') || ''))) card = card.parentElement
    let up = el, k = 0; while (up.parentElement && up.parentElement !== w && k < 5 && !/till 17/.test(up.textContent)) { up = up.parentElement; k++ }
    const corner = [...up.querySelectorAll('*')].filter(e => e.children.length === 0 && /^till 17 Jul$/.test(e.textContent.trim())).map(e => e.className + ':' + e.textContent.trim())
    return { win: true, found: true, remarkText: el.textContent.trim(), remarkCls: el.className, cardCls: card.className, cardText: card.innerText.replace(/\\s+/g, ' ').trim(), corner, tillInRemark: /till/.test(el.textContent) } })()`)
  const pic3 = await snap(C.page, 's5a-5-day-card', ['[data-testid="win-inputsday"]'], [], 6)
  const bc = []
  if (!card.win) bc.push('the day window did not open'); else if (!card.found) bc.push('no "Las Vegas" in the day window: ' + card.text); else {
    if (card.remarkText !== 'Las Vegas') bc.push(`remark text reads ${J(card.remarkText)}`)
    if (card.tillInRemark) bc.push('remark carries a "till"')
    if (!card.corner.length) bc.push('no "till 17 Jul" anywhere in the card (corner)')
  }
  rec('5a-5 the day\'s card', !bc.length, bc.length ? bc.join('; ') : `remark ${J(card.remarkText)}; card reads ${J(card.cardText)}; date part(s) ${J(card.corner)}`, pic3)
  /* the List (desktop) */
  const sw = C.page.locator('#inListBtn')
  if (await C.page.locator('[data-testid="win-inputsday"]').count()) await C.page.keyboard.press('Escape')
  await C.page.waitForTimeout(300)
  await press(C, '#inListBtn'); await C.page.waitForTimeout(700)
  const list = await C.page.evaluate(`(() => { const rows = [...document.querySelectorAll('table tr, [role=row]')].filter(r => /Las Vegas/.test(r.textContent)); const r = rows[0]; if (!r) return { found: false, tables: document.querySelectorAll('table').length }
    const cells = [...r.querySelectorAll('td, [role=cell]')].map(c => { const k = c.cloneNode(true); k.querySelectorAll('.latetag, .latechip').forEach(x => x.remove()); return k.textContent.replace(/\\s+/g, ' ').trim() }); const rmk = cells.find(c => /Las Vegas/.test(c)); return { found: true, rmk, cells } })()`)
  const rowSel2 = await C.page.evaluate(() => { const r = [...document.querySelectorAll('table tr, [role=row]')].find(r => /Las Vegas/.test(r.textContent)); if (!r) return null; r.setAttribute('data-wk-l', '1'); return '[data-wk-l]' })
  const pic4 = rowSel2 ? await snap(C.page, 's5a-6-list', [rowSel2], [rowSel2], 6) : null
  await C.page.evaluate(() => document.querySelectorAll('[data-wk-l]').forEach(e => e.removeAttribute('data-wk-l')))
  const bl = []
  if (!list.found) bl.push('no List row for Las Vegas'); else if (list.rmk !== 'Las Vegas till 17 Jul') bl.push(`Remarks column reads ${J(list.rmk)}; cells ${J(list.cells)}`)
  rec('5a-6 Inputs List Remarks column', !bl.length, bl.length ? bl.join('; ') : `Remarks column reads ${J(list.rmk)}`, pic4)
}

/* ═════════════ STEP 6 — a published day and a stretch ═════════════ */
async function s6(C) {
  const di = 1 // Tuesday 14 Jul
  await openWeek(C)
  const day = `#eWeek .day[data-day="${di}"]`
  /* the leave filed in 5a covers Tue 14 – Fri 17 */
  const cover = await C.page.evaluate(d => { const D = document.querySelector(d); return [...D.querySelectorAll('.sec-unav .pl-row')].map(r => r.innerText.replace(/\s+/g, ' ').trim()) }, day)
  const covered = cover.some(t => /Las Vegas/.test(t))
  if (!covered) return { ok: null, note: 'the leave filed in 5a is not on Tuesday\'s Unavailable list: ' + J(cover) }
  rec('6-0 Tuesday carries the leave before publishing', true, 'Unavailable on Tuesday reads ' + J(cover.find(t => /Las Vegas/.test(t))))
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = C.page.locator(`${day} select[data-sign="${role}"][data-signday="${di}"]`).first()
    await sel.scrollIntoViewIfNeeded()
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    if (!opts.length) return { ok: false, note: `sign-off ${role} offers no names` }
    await sel.selectOption(opts[0])
  }
  const beak = C.page.locator(`${day} [data-beak="${di}"]`).first()
  const dis = await beak.isDisabled()
  const pic0 = await snap(C.page, 's6-1-signed', [`${day} .day-head`], [`${day} [data-beak="${di}"]`])
  if (dis) return { ok: false, note: 'after the four sign-offs "Publish day" is still disabled; its hover says ' + J(await beak.getAttribute('title')), pic: pic0 }
  await beak.scrollIntoViewIfNeeded(); await beak.click(); await C.page.waitForTimeout(900)
  const chip = await C.page.evaluate(d => [...document.querySelectorAll(d + ' .verchip')].map(e => e.textContent.trim()).join(' | '), day)
  const pic1 = await snap(C.page, 's6-2-published', [`${day} .day-head`], [`${day} .verchip`])
  if (!/ORIG/.test(chip)) return { ok: false, note: `after pressing Publish the day's chip reads ${J(chip)}`, pic: pic1 }
  rec('6-1 publish Tuesday through its own controls', true, `four sign-offs, Publish day; chip reads ${J(chip)}`, pic1)
  /* extend the leave's end by one day, on the Inputs page */
  await goPage(C, 'inputs'); if (await C.page.locator('#inCalBtn[aria-pressed="false"]').count()) { await press(C, '#inCalBtn'); await C.page.waitForTimeout(500) }
  await calTo(C, 2026, 7)
  await C.page.locator('#inpCal [data-icday="2026-07-14"]').click({ position: { x: 8, y: 8 } }); await C.page.waitForTimeout(500)
  const open = await C.page.evaluate(`(() => { const w = document.querySelector('[data-testid="win-inputsday"]'); const el = [...w.querySelectorAll('*')].find(e => e.children.length === 0 && /Las Vegas/.test(e.textContent)); if (!el) return false; el.setAttribute('data-wk-c', '1'); return true })()`)
  if (!open) return { ok: false, note: 'the day window on the Inputs page does not list the Las Vegas leave' }
  await C.page.locator('[data-wk-c]').first().click(); await C.page.waitForSelector('[data-testid="win-inputedit"]'); await C.page.waitForTimeout(500)
  const w0 = await readWin(C.page)
  /* a tap OUTSIDE the picked run starts a new pick (first try tapped 18 alone and moved the leave off Tuesday — the script's mistake): tap the start again, then the new end */
  await press(C, '#inpEdCal [data-iso="2026-07-14"]'); await C.page.waitForTimeout(300)
  await press(C, '#inpEdCal [data-iso="2026-07-18"]'); await C.page.waitForTimeout(350)
  const w1 = await readWin(C.page)
  const pic2 = await snap(C.page, 's6-3-extend', ['[data-testid="win-inputedit"]'], ['[data-testid="inped-till"]'], 6)
  if (w1.till !== 'till 18 Jul' || !/(14 Jul|Jul 14) *→ *(18 Jul|Jul 18)/.test(w1.hdr)) return { ok: false, note: `after tapping 18 Jul the grey date reads ${J(w1.till)} (heading ${J(w1.hdr)}; before ${J(w0.till)}, remark ${J(w1.rmk)})`, pic: pic2 }
  await press(C, '#inpEditSave'); await C.page.waitForTimeout(900)
  await C.page.evaluate(() => { const e = document.querySelector('[data-testid="win-inputsday"]'); if (e) window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })) })
  rec('6-2 extend the leave by one day on the Inputs page', true, `window heading ${J(w0.hdr)} -> ${J(w1.hdr)}, grey date ${J(w0.till)} -> ${J(w1.till)}, remark ${J(w1.rmk)}, saved`, pic2)
  /* back on Edit Schedule */
  await openWeek(C)
  const pend = await C.page.evaluate(d => { const D = document.querySelector(d); const all = [...document.querySelectorAll('#eWeek .day')].map(x => [x.dataset.day, (x.querySelector('.dpend')?.textContent || '').trim()]); return { tue: (D.querySelector('.dpend')?.textContent || '').trim(), all, chip: D.querySelector('.verchip')?.textContent.trim() } }, day)
  const pic3 = await snap(C.page, 's6-4-pending-chip', [`${day} .day-head`], [`${day} .dpend`])
  const bad = []
  if (!/(^|\D)1\Wpending/.test(pend.tue) || pend.tue.length > 20) bad.push(`Tuesday's head reads ${J(pend.tue)} (pending chips: ${J(pend.all)}; char codes ${[...pend.tue].map(c => c.charCodeAt(0)).join(',')})`)
  let listTxt = ''
  let pic4 = null
  if (/pending/.test(pend.tue)) {
    await C.page.locator(`${day} .dpend`).first().scrollIntoViewIfNeeded(); await C.page.locator(`${day} .dpend`).first().click(); await C.page.waitForTimeout(600)
    const tab = C.page.locator('.chgwin:not([hidden]) .win-tab', { hasText: 'To go out' }).first()
    if (await tab.count()) { await tab.click(); await C.page.waitForTimeout(400) }
    listTxt = await C.page.evaluate(() => [...document.querySelectorAll('.chgwin:not([hidden]) .pl-list')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).join(' || '))
    pic4 = await snap(C.page, 's6-5-pending-list', ['.chgwin:not([hidden])'], [], 6)
    if (!/till 17 Jul/.test(listTxt) || !/till 18 Jul/.test(listTxt)) bad.push(`the pending list does not show both "till 17 Jul" and "till 18 Jul": ${J(listTxt.slice(0, 400))}`)
    else if (!/Las Vegas[^|]*till 17 Jul[^|]*(→|->)[^|]*Las Vegas[^|]*till 18 Jul|till 17 Jul[^|]*(→|->)[^|]*till 18 Jul/.test(listTxt)) bad.push(`old and new dates present but not as old -> new: ${J(listTxt.slice(0, 400))}`)
  }
  return { ok: !bad.length, note: bad.length ? bad.join('; ') : `Tuesday head reads ${J(pend.tue)}; pending list: ${J(listTxt.slice(0, 300))}`, pic: [pic3, pic4].filter(Boolean).join(' ') }
}

/* ───────────────────────── the runs ───────────────────────── */
const D = await newCtx('desk', 1440, 900, false)
await signIn(D)
await step('1-desk  board wave header', () => s1(D))
await step('3-desk  Ground Programme line (board, week, View-only)', () => s3(D))
await step('4-desk  board Personal Inputs rows: one line', () => s4board(D))
await step('4-desk  week Personal Inputs rows (desktop day card)', () => s4week(D))
await step('5b-desk reads: grey date follows each remark box (week + board)', () => s5bReads(D))
await step('5d-desk View-only Unavailable: "<remark> till <date>" as one text', () => s5d(D))
await step('5e-desk board Unavailable "+ Add": empty Remarks, grey date', () => s5e(D))
await step('5c-desk programme row from an input, board: Tab through unchanged', () => s5c(D, 'board'))
await step('5c-desk programme row from an input, week: Tab through unchanged', () => s5c(D, 'week'))
await step('5b-desk type + Tab in a Personal Inputs remark box (week)', () => s5bType(D, 'week', 'Gambit', 'Zed'))
await step('5b-desk type + Tab in a Personal Inputs remark box (board)', () => s5bType(D, 'board', 'Zenith', 'Yo'))
await step('2-desk  Reject + Undo (board)', () => s2(D, 'board'))
await step('2-desk  Reject + Undo (week)', () => s2(D, 'week'))
await step('5a-desk Inputs page flow', () => s5a(D).then(() => ({ ok: true, note: 'sub-steps 5a-1..5a-6 above' })))
await step('6-desk  published day + stretch', () => s6(D))
await D.ctx.close()

const P = await newCtx('phone390', 390, 844, true)
await signIn(P)
await step('1-phone  board wave header', () => s1(P))
await step('3-phone  Ground Programme line (board, week, View-only)', () => s3(P))
await step('4-phone390  board Personal Inputs: Reject on the puck line', () => s4board(P))
await step('4-phone390  week Personal Inputs: Reject under the name', () => s4week(P))
await step('5b-phone reads: grey date follows each remark box (week + board)', () => s5bReads(P))
await step('5d-phone View-only Unavailable: one text', () => s5d(P))
await step('5e-phone board Unavailable "+ Add"', () => s5e(P))
await step('5b-phone type + Tab in a Personal Inputs remark box (board)', () => s5bType(P, 'board', 'Zenith', 'Yo'))
await step('2-phone  Reject + Undo (board)', () => s2(P, 'board'))
await step('2-phone  Reject + Undo (week)', () => s2(P, 'week'))
await P.ctx.close()

for (const w of [360]) {
  const Q = await newCtx('phone' + w, w, 800, true)
  await signIn(Q)
  await step(`1-phone${w}  board wave header`, () => s1(Q))
  await step(`4-phone${w}  board Personal Inputs: Reject on the puck line`, () => s4board(Q))
  await step(`4-phone${w}  week Personal Inputs: Reject under the name`, () => s4week(Q))
  await Q.ctx.close()
}

/* ───────────────────────── summary ───────────────────────── */
writeFileSync(join(OUT, 'results.json'), JSON.stringify({ results, errs }, null, 1))
const c = t => results.filter(r => r.tag === t).length
console.log(`\nSUMMARY  PASS ${c('PASS')}  FAIL ${c('FAIL')}  NOT WALKED ${c('NOT WALKED')}`)
console.log('console/page errors:', errs.length); for (const e of [...new Set(errs)].slice(0, 30)) console.log('  ' + e)
await browser.close()
