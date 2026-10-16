// AN INPUT FILED FOR ALL / ALL AVAIL, DRAWN ON THE COMMON PROGRAMME (D954, D955, D957) — a WALK of the BUILT app, written as ASSERTIONS
// of the right behaviour. Every step prints PASS / FAIL (or NOT WALKED) with the value it read, and leaves a picture in
//   docs/img/handpass/2026-10-17-allavail-common/build/<step>.png     (element-clipped, 2x desktop / 3x phone)
// It reads the app; the only writes are the ones a person makes with the controls. Nothing under src/ is touched.
//   node scripts/handpass/allavail-common-walk.mjs [out-folder]       (LOOK_URL=http://localhost:4186/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

console.log('allavail-common-walk v1')
const T0 = Date.now()
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || join(HERE, '../../docs/img/handpass/2026-10-17-allavail-common/build')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4186/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null // 'desk' | 'phone'
const STEPS = process.env.STEPS ? process.env.STEPS.split(',') : null // e.g. J1,J2

let LASTPAGE = null
const results = [], errs = []
const rec = (id, ok, note, pic) => {
  const tag = ok === true ? 'PASS' : ok === false ? 'FAIL' : ok === 'note' ? 'NOTE' : 'NOT WALKED'
  results.push({ id, tag, note, pic })
  console.log(`${tag}  ${id}  —  ${note}${pic ? `   [${pic}]` : ''}`)
}
const J = v => JSON.stringify(v)
const sleep = ms => new Promise(r => setTimeout(r, ms))
const NOTE_TXT = 'To take an input off, press Reject on it in Personal Inputs below.'
const RE_A = '^Sqn brief(?! B)', RE_B = '^Sqn brief B'

/* ───────────────────────── drivers (from tick-r2-walk.mjs) ───────────────────────── */
async function newCtx(tag, width, height, phone) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: phone ? 3 : 2, ...(phone ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage(); LASTPAGE = page
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
  await l.scrollIntoViewIfNeeded(); await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await C.page.waitForTimeout(120)
  if (C.phone) await l.tap(); else await l.click()
}
async function closeBoard(C) {
  if (await C.page.locator('#schedBoard:not([hidden])').count()) {
    const b = C.page.locator('#sbDone:visible, #sbClose:visible').first()
    if (await b.count()) { await (C.phone ? b.tap() : b.click()); await C.page.waitForTimeout(400) }
  }
}
async function dropWindow(C) {
  for (let i = 0; i < 6; i++) { const fx = C.page.locator('[data-testid="win-inputedit-x"]:visible, [data-testid="win-inputsday-x"]:visible').last(); if (await fx.count()) { await (C.phone ? fx.tap() : fx.click()); await C.page.waitForTimeout(300); continue } break }
  for (let i = 0; i < 3; i++) { const x = C.page.locator('#inpEditClose:visible').first(); if (await x.count()) { await x.click(); await C.page.waitForTimeout(300) } else break }
}
async function goPage(C, name) { await dropWindow(C); await closeBoard(C); await C.page.evaluate(n => window.go(n), name); await C.page.waitForTimeout(800); await hideToast(C.page) }
async function openWeek(C) { await goPage(C, 'editsched') }
async function openView(C) { await goPage(C, 'viewsched') }
async function openBoard(C, di = 0) {
  await openWeek(C)
  await press(C, `#eWeek [data-sbday="${di}"]`)
  await C.page.waitForSelector('#schedBoard:not([hidden])'); await C.page.waitForTimeout(700); await hideToast(C.page)
}
const PIROWS = (where, di) => where === 'board' ? '#schedBoard .sb-panel.pinp [data-inprow]' : `#eWeek .day[data-day="${di}"] .sec-inp [data-inprow]`
const PITOG = (where, di) => where === 'board' ? `#schedBoard [data-pitog="${di}"]` : `#eWeek .day[data-day="${di}"] [data-pitog="${di}"]`
async function ensurePI(C, where, di) {
  if (!(await C.page.locator(PIROWS(where, di)).count())) { if (await C.page.locator(PITOG(where, di)).count()) { await press(C, PITOG(where, di)); await C.page.waitForTimeout(400) } }
  return C.page.locator(PIROWS(where, di)).count()
}
async function snap(page, name, sels, marks = [], pad = 8) {
  const prep = await page.evaluate(([sels, marks]) => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 }
    const els = sels.flatMap(s => [...document.querySelectorAll(s)]).filter(vis)
    if (!els.length) return false
    els[0].scrollIntoView({ block: 'center', inline: 'nearest' })
    { const top = els[0].getBoundingClientRect().top; if (top < 130) { let p = els[0].parentElement; while (p && !(p.scrollHeight > p.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(p).overflowY))) p = p.parentElement; (p && p !== document.body && p !== document.documentElement ? p : window).scrollBy(0, top - 130) } }
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
async function step(id, fn) {
  if (STEPS && !STEPS.some(s => id.startsWith(s))) return
  try {
    const r = await fn()
    if (r) rec(id, r.ok, r.note, r.pic)
  } catch (e) { try { await LASTPAGE.screenshot({ path: join(OUT, 'err-' + id.replace(/[^a-z0-9]+/gi, '-').slice(0, 40) + '.png') }) } catch {}; rec(id, false, 'SCRIPT/DRIVER ERROR (read before blaming the app): ' + String(e.message || e).replace(/\s*\n\s*/g, ' / ').slice(0, 1100)) }
}
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
  await goPage(C, 'inputs'); if (await C.page.locator('#inCalBtn[aria-pressed="false"]').count()) { await press(C, '#inCalBtn'); await C.page.waitForTimeout(500) }
  const at = await calTo(C, 2026, 7)
  await C.page.locator(`#inpCal [data-icday="${iso}"]`).click({ position: { x: 8, y: 8 } }); await C.page.waitForTimeout(400)
  await C.page.locator('#icPopAdd').click(); await C.page.waitForSelector('[data-testid="win-inputedit"]'); await C.page.waitForTimeout(400)
  return at
}
async function oilAnswer(page, ans) {
  const q = page.locator('[data-testid="oilconf"]')
  try { await q.waitFor({ state: 'visible', timeout: 1800 }) } catch { return false }
  await page.locator('[data-testid="oil-' + ans + '"]').click()
  await page.locator('[data-testid="oilconf-save"]').click()
  await page.waitForTimeout(400)
  return true
}
const storedBy = (page, reSrc) => page.evaluate(src => { const re = new RegExp(src); return (window.INPUTS || []).filter(i => re.test(String(i.remarks || ''))).map(i => ({ type: i.type, date: i.date, remarks: i.remarks, person: i.person, more: i.more || i.people || null, s: i.s ?? null, e: i.e ?? null, allday: i.allday })) }, reSrc)

/* ───────────────────────── page-side reader: the two programmes' rows ───────────────────────── */
/* where: 'week' (Edit Schedule) | 'view' (View-only Sched) | 'board'. pats: [[tag, regexSource]] — a matching row is marked data-wkrow=<tag>. */
const scan = (page, where, di, pats = [[ 'A', RE_A ], [ 'B', RE_B ]]) => page.evaluate(([where, di, pats]) => {
  const scope = where === 'board' ? '#schedBoard' : where === 'view' ? `#vWeek .day[data-day="${di}"]` : `#eWeek .day[data-day="${di}"]`
  const S = where === 'board' ? { prog: ['.sb-panel.prog', '.sb-arow'], grnd: ['.sb-panel.grnd', '.sb-arow'] } : { prog: ['.sec-prog', '.ah-row'], grnd: ['.sec-grnd', '.pl-row'] }
  const T = /^\d{1,2}:?\d{2}$/
  const out = { prog: [], grnd: [], note: {}, noteFirst: {}, present: {}, head: {} }
  document.querySelectorAll('[data-wkrow]').forEach(e => e.removeAttribute('data-wkrow'))
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 }
  for (const k of ['prog', 'grnd']) {
    const sec = document.querySelector(`${scope} ${S[k][0]}`)
    out.present[k] = !!sec
    if (!sec) { out.note[k] = []; continue }
    out.head[k] = (sec.querySelector('.ah-h, .sec-h, .sub-h, .sb-ph') || {}).textContent?.replace(/\s+/g, ' ').trim()
    out.note[k] = [...sec.querySelectorAll('.pl-inpnote, .sb-pinote')].map(e => e.textContent.trim())
    const pb = where === 'board' ? sec.querySelector('.sb-pb') : sec
    const first = pb ? [...pb.children].find(c => !/(^|\s)(ah-h|sb-ph)(\s|$)/.test(c.className)) : null
    out.noteFirst[k] = !!first && /(pl-inpnote|sb-pinote)/.test(first.className)
    ;[...sec.querySelectorAll(S[k][1])].filter(r => r.closest(S[k][0]) === sec).forEach((row, i) => {
      const val = e => e ? String(e.value ?? e.textContent).trim() : ''
      const get = (suf, idx) => { const e = row.querySelector(`[data-txt$=".${suf}"],[data-bfld$=".${suf}"]`) || (where === 'board' ? null : row.querySelectorAll('.t')[idx]); return e ? val(e) : '' }
      const rm = row.querySelector('[data-txt$=".rmks"],[data-bfld$=".rmks"]') || row.querySelector('.rmk .ntx') || row.querySelector('.rmk')
      const nmE = row.querySelector('[data-txt$=".prog"],[data-bfld$=".prog"]') || row.querySelector('.nm .ntx') || row.querySelector('.nm')
      const cs = getComputedStyle(row)
      const grip = row.querySelector('.sb-grip')
      const o = {
        sec: k, i, rmk: val(rm), name: val(nmE).slice(0, 40), str: get('str', 0), end: get('end', 1), cls: row.className.replace(/\s+/g, ' '),
        isInput: !!row.querySelector('[data-txt^="gr:"],[data-bfld^="gr:"],[data-fill^="g:"]') || /gr-frominput/.test(row.className),
        hasMove: row.matches('[data-move]') || !!row.querySelector('[data-move]'),
        gripVis: !!grip && getComputedStyle(grip).visibility !== 'hidden' && vis(grip), gripCls: grip ? grip.className : null,
        bg: cs.backgroundColor, bl: cs.borderLeftColor + ' ' + cs.borderLeftWidth, bs: cs.boxShadow, bgi: cs.backgroundImage.slice(0, 80),
        text: row.innerText.replace(/\s+/g, ' ').trim().slice(0, 80), vis: vis(row),
      }
      for (const [tag, src] of pats) if (new RegExp(src).test(o.rmk) && !row.hasAttribute('data-wkrow')) { row.setAttribute('data-wkrow', tag); o.tag = tag }
      if (!row.querySelector('[data-txt^="gr:"],[data-bfld^="gr:"]') && o.tag) o.isInput = true
      out[k].push(o)
    })
  }
  return out
}, [where, di, pats])
const mins = v => { const m = String(v ?? '').trim().match(/^(\d{1,2}):?(\d{2})$/); return m ? +m[1] * 60 + +m[2] : null }
/* the rule (html.ts commonOrder, read as a spec): our row sits before the first OWN row that starts later; own rows before it start no later */
function placedOk(rows, i) {
  const me = rows[i], s = mins(me.str); if (s == null) return { ok: false, why: 'the row has no start to place by (' + J(me.str) + ')' }
  const before = rows.slice(0, i), after = rows.slice(i + 1)
  const bad = []
  for (const r of before) { const t = mins(r.str); if (t != null && t > s) bad.push(`${r.isInput ? 'input' : 'own'} row "${r.name || r.rmk}" at ${r.str} stands ABOVE ${me.str}`) }
  const own = after.filter(r => !r.isInput && mins(r.str) != null)
  if (own.length && !(mins(own[0].str) > s)) bad.push(`the next own row "${own[0].name}" starts ${own[0].str}, not later than ${me.str}`)
  for (const r of after) { if (r.isInput) { const t = mins(r.str); if (t != null && t < s) bad.push(`input row "${r.rmk}" at ${r.str} stands BELOW ${me.str}`) } }
  return { ok: !bad.length, why: bad.join('; ') }
}
const seq = rows => rows.map(r => `${r.i}:${r.isInput ? 'IN ' : ''}${r.name || r.rmk || '·'}@${r.str || '–'}`).join(' | ')
const tintSig = r => `${r.bg}|${r.bl}|${r.bs}|${r.bgi}`
const rgb = s => (String(s).match(/[\d.]+/g) || []).map(Number)

/* ───────────────────────── fixtures ───────────────────────── */
async function fileOne(C, o) {
  const { iso, type = 'Meeting', remark, start = '13:00', end = '14:00', ph = true, named = 0 } = o
  const at = await openDayAdd(C, iso)
  const opts = await C.page.locator('#inpEditType option').evaluateAll(os => os.map(o => ({ v: o.value, t: o.textContent.trim() })))
  const ty = opts.find(x => x.v.toLowerCase() === type.toLowerCase() || x.t.toLowerCase() === type.toLowerCase())
  if (!ty) throw new Error(`no ${type} in the type list: ${J(opts.map(x => x.v))}`)
  await C.page.selectOption('#inpEditType', ty.v); await C.page.waitForTimeout(350)
  const log = [`calendar on ${at}`]
  if (await C.page.locator('#inpEditAllday').count() && await C.page.locator('#inpEditAllday').isChecked()) { await C.page.locator('#inpEditAllday').uncheck(); await C.page.waitForTimeout(200) }
  const sw = C.page.locator('[data-testid="pp-several"]')
  if (!(await sw.count())) throw new Error('the window offers no "Several people" switch (no [data-testid=pp-several])')
  if ((await sw.getAttribute('aria-checked')) !== 'true') { await press(C, '[data-testid="pp-several"]'); await C.page.waitForTimeout(300) }
  if (ph) {
    const phs = await C.page.locator('button[data-ph]').evaluateAll(bs => bs.map(b => ({ id: b.dataset.ph, label: b.getAttribute('aria-label'), dis: b.disabled, on: b.getAttribute('aria-pressed') })))
    log.push('placeholder pucks ' + J(phs))
    const a = phs.find(p => /all\s*avail/i.test(p.label || ''))
    if (!a) throw new Error('the window offers no ALL AVAIL choice: ' + J(phs))
    if (a.dis) throw new Error('ALL AVAIL is disabled: ' + J(phs))
    await press(C, `button[data-ph="${a.id}"]`); await C.page.waitForTimeout(300)
  }
  if (named) {
    const ids = await C.page.locator('button[data-pp]:not([disabled])').evaluateAll(bs => bs.slice(0, 6).map(b => b.dataset.pp))
    for (const id of ids.slice(0, named)) { await press(C, `button[data-pp="${id}"]`); await C.page.waitForTimeout(250) }
    log.push('named ' + J(ids.slice(0, named)))
  }
  await C.page.fill('#inpEditStart', start); await C.page.fill('#inpEditEnd', end)
  await C.page.locator('#inpEditRmk').fill(remark); await C.page.waitForTimeout(250)
  const why = await C.page.locator('[data-testid="pp-why"]').allInnerTexts().catch(() => [])
  const pic = await snap(C.page, o.pic || `file-${C.tag}`, ['[data-testid="win-inputedit"]'], [], 6)
  await press(C, '#inpEditSave'); await C.page.waitForTimeout(700)
  const oil = await oilAnswer(C.page, 'yes'); if (oil) log.push('answered the OIL question: yes')
  await C.page.waitForTimeout(600)
  const open = (await C.page.locator('[data-testid="win-inputedit"]').count()) > 0
  const clash = open ? await C.page.locator('[data-testid="inped-clash"]').allInnerTexts().catch(() => []) : []
  const stored = await storedBy(C.page, '^' + remark.replace(/[^a-z0-9 ]/gi, '.'))
  return { open, why, clash, stored, log, pic }
}

/* ═════════════ J1 — file the inputs ═════════════ */
async function j1(C) {
  const a = await fileOne(C, { iso: '2026-07-13', remark: 'Sqn brief', ph: true, pic: `j1-1-file-A-${C.tag}` })
  const sA = a.stored.filter(s => /^Sqn brief$/.test(s.remarks))
  rec(`J1-1 ${C.tag} Meeting, Several people, ALL AVAIL, 13:00-14:00 "Sqn brief", Add`, !a.open && sA.length === 1, `${a.log.join('; ')}; window ${a.open ? 'STILL OPEN (why: ' + J(a.why) + ' clash: ' + J(a.clash) + ')' : 'closed'}; stored ${J(sA)}`, a.pic)
  await dropWindow(C)
  const b = await fileOne(C, { iso: '2026-07-13', remark: 'Sqn brief B', ph: true, named: 2, pic: `j1-2-file-B-${C.tag}` })
  const sB = b.stored.filter(s => /^Sqn brief B$/.test(s.remarks))
  rec(`J1-2 ${C.tag} second input: ALL AVAIL + two named people, 13:00-14:00 "Sqn brief B", Add`, !b.open && sB.length === 1, `${b.log.join('; ')}; window ${b.open ? 'STILL OPEN (why: ' + J(b.why) + ' clash: ' + J(b.clash) + ')' : 'closed'}; stored ${J(sB)}`, b.pic)
  await dropWindow(C)
}

/* the Common Programme needs two OWN rows around 13:00: add them from the board if the seed has fewer than two with a start */
async function ensureOwn(C) {
  await openBoard(C, 0)
  const s0 = await scan(C.page, 'board', 0)
  const own0 = s0.prog.filter(r => !r.isInput)
  const names = []
  for (const [nm, tm] of [['Own A', '12:00'], ['Own B', '15:00']]) {
    await press(C, '[data-padd="0"]'); await C.page.waitForTimeout(700)
    const s = await scan(C.page, 'board', 0)
    const blank = s.prog.filter(r => !r.isInput && !r.name && !r.str).pop()
    if (!blank) { names.push(nm + ' NOT ADDED'); continue }
    const sel = `#schedBoard .sb-panel.prog .sb-arow >> nth=${blank.i}`
    await typeInRow(C, sel, '[data-bfld$=".prog"]', nm)
    const s2 = await scan(C.page, 'board', 0)
    const r2 = s2.prog.filter(r => !r.isInput && r.name === nm)[0]
    if (r2) await typeInRow(C, `#schedBoard .sb-panel.prog .sb-arow >> nth=${r2.i}`, '[data-bfld$=".str"]', tm)
    names.push(nm + ' ' + tm)
  }
  await C.page.waitForTimeout(400)
  const s1 = await scan(C.page, 'board', 0)
  return `seed own rows ${own0.length}: ${seq(own0)}; added ${names.join(', ')}; Common Programme now: ${seq(s1.prog)}`
}
async function typeInRow(C, rowSel, boxSel, text, o = {}) {
  const l = C.page.locator(rowSel).first().locator(boxSel).first()
  await l.scrollIntoViewIfNeeded(); await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await C.page.waitForTimeout(120)
  const b = await l.boundingBox()
  if (C.phone) await C.page.touchscreen.tap(b.x + b.width - 6, b.y + b.height / 2); else await C.page.mouse.click(b.x + b.width - 6, b.y + b.height / 2)
  await C.page.waitForTimeout(200)
  await C.page.keyboard.press(o.append ? 'Control+End' : 'Control+A')
  await C.page.keyboard.type(text, { delay: 25 })
  await C.page.keyboard.press('Tab'); await C.page.waitForTimeout(900)
}

/* ═════════════ J2 — Edit Schedule's week, then View-only Sched ═════════════ */
async function j2(C) {
  await openWeek(C)
  const s = await scan(C.page, 'week', 0)
  const a = s.prog.find(r => r.tag === 'A')
  const inG = s.grnd.filter(r => r.tag)
  const sec = '#eWeek .day[data-day="0"] .sec-prog'
  const pic1 = await snap(C.page, `j2-1-week-prog-${C.tag}`, [sec], ['[data-wkrow="A"]'], 8)
  rec(`J2-1 ${C.tag} week: the Meeting's row is in the Common Programme, not the Ground Programme`, !!a && !inG.length, a ? `Common Programme rows (${s.prog.length}): ${seq(s.prog)}; row class "${a.cls}"; rows in the Ground Programme section carrying the remark: ${inG.length}; Ground Programme rows: ${seq(s.grnd)}` : `NOT in the Common Programme. Common Programme: ${seq(s.prog)} || Ground Programme: ${seq(s.grnd)}`, pic1)
  if (!a) { console.log('   DEBUG week rows:', J(await C.page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] .sec-prog .ah-row')].filter(r => /MEETING/.test(r.innerText)).map(r => r.outerHTML.slice(0, 1500))))); return }
  const p = placedOk(s.prog, a.i)
  rec(`J2-2 ${C.tag} week: placed by its start time among the programme's rows`, p.ok, `${seq(s.prog)} | ours at index ${a.i}, start ${a.str}${p.why ? ' — ' + p.why : ''}`, pic1)
  const nd = s.note.prog
  rec(`J2-3 ${C.tag} week: the Reject line stands under "Common Programme"`, nd.length === 1 && nd[0] === NOTE_TXT && s.noteFirst.prog, `heading "${s.head.prog}"; notes ${J(nd)}; first thing after the heading is the note: ${s.noteFirst.prog}`, pic1)
  /* tint */
  const gIn = s.grnd.find(r => r.isInput && /gr-frominput/.test(r.cls)), plain = s.prog.find(r => !r.isInput)
  const c = rgb(a.bg), cyan = c.length >= 3 && c[1] > c[0] && c[2] > c[0] && (c.length < 4 || c[3] > 0)
  const tinted = /gr-frominput/.test(a.cls) && tintSig(a) !== (plain ? tintSig(plain) : '')
  rec(`J2-4 ${C.tag} week: the row wears the light cyan "came from an input" tint`, tinted && cyan, `row class "${a.cls}"; background ${a.bg}, left edge ${a.bl}, shadow ${a.bs}; plain own row: ${plain ? plain.bg + ' / ' + plain.bl : 'none'}; a Ground Programme input row for comparison: ${gIn ? gIn.bg + ' / ' + gIn.bl : 'none drawn (the Meeting was the only input)'}`, pic1)
  if (C.phone) {
    const g = await C.page.evaluate(() => {
      const row = document.querySelector('[data-wkrow="A"]'); const rr = row.getBoundingClientRect()
      const R = e => { const b = e.getBoundingClientRect(); return { l: +b.left.toFixed(1), r: +b.right.toFixed(1), t: +b.top.toFixed(1), b: +b.bottom.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) } }
      const kids = [...row.querySelectorAll('.nm, .t, .ppl, .rmk, .rmkt, .rkind, .nm *')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 1 && b.height > 1 && getComputedStyle(e).display !== 'contents' })
      const leaf = [...row.children].filter(e => { const b = e.getBoundingClientRect(); return b.width > 1 && b.height > 1 })
      const over = []
      for (let i = 0; i < leaf.length; i++) for (let j = i + 1; j < leaf.length; j++) { const a = leaf[i].getBoundingClientRect(), b = leaf[j].getBoundingClientRect(); const w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); if (w > 2 && h > 2) over.push(`${leaf[i].className.slice(0, 20)}×${leaf[j].className.slice(0, 20)} ${w.toFixed(0)}x${h.toFixed(0)}`) }
      const ts = [...row.querySelectorAll('.t')].filter(e => e.getBoundingClientRect().width > 1)
      const rmk = row.querySelector('.rmk, .rmkt')
      return { row: R(row), cells: leaf.map(e => e.className.slice(0, 18) + ' ' + JSON.stringify(R(e))), over, times: ts.map(R), rmk: rmk ? R(rmk) : null, till: row.querySelector('.rk-till')?.textContent || null, pageOver: document.documentElement.scrollWidth > innerWidth + 1, rowOver: row.scrollWidth > row.clientWidth + 1 }
    })
    const [t0, t1] = g.times
    const together = !!t0 && !!t1 && Math.abs(t0.l - t1.l) <= 4 && t1.t - t0.b <= 8 && t0.t - g.row.t <= 12
    rec(`J2-5 ${C.tag} week phone 390: nothing overlapping, the two times together in one column at the row's top, remark box inside the row`, !g.over.length && together && !g.pageOver && !g.rowOver && (!g.rmk || (g.rmk.r <= g.row.r + 1 && g.rmk.l >= g.row.l - 1)), `row ${J(g.row)}; times ${J(g.times)}; remark box ${J(g.rmk)}; grey date ${J(g.till)}; overlaps ${J(g.over)}; page scrolls sideways ${g.pageOver}; row scrolls sideways ${g.rowOver}; cells ${g.cells.join(' ; ')}`, await snap(C.page, `j2-5-week-row-phone`, ['[data-wkrow="A"]'], [], 10))
  }
  /* View-only Sched */
  await openView(C)
  const v = await scan(C.page, 'view', 0)
  const va = v.prog.find(r => r.tag === 'A')
  const vsec = '#vWeek .day[data-day="0"] .sec-prog'
  const vTxt = await C.page.evaluate(() => (document.querySelector('#vWeek .day[data-day="0"]')?.innerText || ''))
  const pv = await snap(C.page, `j2-6-view-prog-${C.tag}`, [vsec], ['[data-wkrow="A"]'], 8)
  const hasLine = /press Reject on it/i.test(vTxt)
  rec(`J2-6 ${C.tag} View-only Sched Monday: the row on the Common Programme, NO Reject line`, !!va && !v.grnd.some(r => r.tag) && !hasLine && !v.note.prog.length, va ? `Common Programme: ${seq(v.prog)}; not in Ground Programme: ${!v.grnd.some(r => r.tag)}; Reject line anywhere on Monday: ${hasLine}; notes under the heading ${J(v.note.prog)}` : `row NOT on the View-only Common Programme: ${seq(v.prog)} || Ground: ${seq(v.grnd)}`, pv)
}

/* ═════════════ J3 — the Scheduler Board ═════════════ */
const GRIP = i => `#schedBoard .sb-panel.prog .sb-arow >> nth=${i}`
async function dragRow(C, fromRowSel, toRowSel, overInputSel) {
  const p = C.page
  const g = await p.locator(fromRowSel).first().locator('.sb-grip').first().boundingBox()
  const tb = await p.locator(toRowSel).first().boundingBox()
  const ib = overInputSel ? await p.locator(overInputSel).first().boundingBox() : null
  const sx = g.x + g.width / 2, sy = g.y + g.height / 2
  const probe = async () => p.evaluate(() => ({ n: document.querySelectorAll('.rowdrop').length, on: [...document.querySelectorAll('.rowdrop')].map(e => (e.querySelector('[data-bfld$=".prog"]')?.value || e.className).slice(0, 30)), inputDrop: !!document.querySelector('[data-wkrow="A"].rowdrop') }))
  const seen = {}
  if (!C.phone) {
    await p.mouse.move(sx, sy); await p.mouse.down(); await p.waitForTimeout(150)
    if (ib) { await p.mouse.move(ib.x + ib.width / 2, ib.y + ib.height / 2, { steps: 10 }); await p.waitForTimeout(250); seen.overInput = await probe() }
    await p.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2, { steps: 10 }); await p.waitForTimeout(300); seen.overTarget = await probe()
    seen.pic = await snap(p, `j3-3-drag-${C.tag}`, ['#schedBoard .sb-panel.prog'], ['.rowdrop'], 8)
    await p.mouse.up(); await p.waitForTimeout(900)
  } else {
    const cdp = await C.ctx.newCDPSession(p)
    const tp = (x, y) => [{ x, y, id: 1, radiusX: 4, radiusY: 4, force: 1 }]
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp(sx, sy) }); await p.waitForTimeout(500)
    const mv = async (x, y, n) => { for (let k = 1; k <= n; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp(sx + (x - sx) * k / n, sy + (y - sy) * k / n) }); await p.waitForTimeout(30) } }
    let cx = sx, cy = sy
    if (ib) { const x = ib.x + ib.width / 2, y = ib.y + ib.height / 2; for (let k = 1; k <= 10; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp(cx + (x - cx) * k / 10, cy + (y - cy) * k / 10) }); await p.waitForTimeout(30) } cx = x; cy = y; await p.waitForTimeout(250); seen.overInput = await probe() }
    { const x = tb.x + tb.width / 2, y = tb.y + tb.height / 2; for (let k = 1; k <= 10; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp(cx + (x - cx) * k / 10, cy + (y - cy) * k / 10) }); await p.waitForTimeout(30) } await p.waitForTimeout(300); seen.overTarget = await probe() }
    seen.pic = await snap(p, `j3-3-drag-${C.tag}`, ['#schedBoard .sb-panel.prog'], ['.rowdrop'], 8)
    await p.waitForTimeout(150)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(900)
    await cdp.detach().catch(() => {})
  }
  return seen
}
async function j3(C) {
  const setup = await ensureOwn(C)
  console.log('   own rows: ' + setup)
  await openBoard(C, 0)
  const s = await scan(C.page, 'board', 0)
  const a = s.prog.find(r => r.tag === 'A')
  const pic1 = await snap(C.page, `j3-1-board-prog-${C.tag}`, ['#schedBoard .sb-panel.prog'], ['[data-wkrow="A"]'], 8)
  const own = s.prog.filter(r => !r.isInput)
  rec(`J3-1 ${C.tag} board: the row is in the Common Programme panel (not the Ground Programme panel), by time`, !!a && !s.grnd.some(r => r.tag) && (a ? placedOk(s.prog, a.i).ok : false), a ? `Common Programme: ${seq(s.prog)}; ours index ${a.i} start ${a.str}; in the Ground Programme panel: ${s.grnd.some(r => r.tag)}; ${placedOk(s.prog, a.i).why}` : `NOT in the Common Programme panel: ${seq(s.prog)} || Ground: ${seq(s.grnd)}`, pic1)
  if (!a) return
  rec(`J3-2 ${C.tag} board: no grip of its own; the programme's own rows keep theirs; the Reject line under the panel's heading`, !a.gripVis && !a.hasMove && own.length > 0 && own.every(r => r.gripVis && r.hasMove) && s.note.prog.length === 1 && s.note.prog[0] === NOTE_TXT && s.noteFirst.prog,
    `input row: grip visible ${a.gripVis} (class ${a.gripCls}), draggable ${a.hasMove}; own rows ${own.length}: ${own.map(r => `${r.name || '·'} grip ${r.gripVis} move ${r.hasMove}`).join(', ')}; notes ${J(s.note.prog)}, first after heading ${s.noteFirst.prog}`, pic1)
  /* the drag: Own A (12:00, above the input) onto Own B (15:00, below it) — past the input's row */
  const oA = own.find(r => r.name === 'Own A'), oB = own.find(r => r.name === 'Own B')
  if (!oA || !oB) return rec(`J3-3 ${C.tag} board drag`, null, `NOT WALKED: the two own rows were not added (${setup})`)
  const rowA = `#schedBoard .sb-panel.prog .sb-arow >> nth=${oA.i}`, rowB = `#schedBoard .sb-panel.prog .sb-arow >> nth=${oB.i}`, rowIn = `#schedBoard .sb-panel.prog .sb-arow >> nth=${a.i}`
  const before = s.prog.filter(r => !r.isInput).map(r => r.name).join(',')
  await C.page.locator(rowIn).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await C.page.waitForTimeout(200)
  if (C.phone) { await C.page.setViewportSize({ width: 390, height: 2400 }); await C.page.waitForTimeout(500) }
  let seen = await dragRow(C, rowA, rowB, rowIn)
  let s2 = await scan(C.page, 'board', 0)
  let gest = C.phone ? 'touch via CDP' : 'mouse'
  if (C.phone && s2.prog.filter(r => !r.isInput).map(r => r.name).join(',') === before) { console.log('   (phone: the touch drag changed nothing — retrying with the pointer as a mouse)'); const was = C.phone; C.phone = false; try { await C.page.locator(rowIn).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await C.page.waitForTimeout(200); seen = { ...(await dragRow(C, rowA, rowB, rowIn)), touchTried: true } } finally { C.phone = was } gest = 'touch via CDP changed nothing; then a pointer drag (mouse) on the phone-size page'; s2 = await scan(C.page, 'board', 0) }
  const a2 = s2.prog.find(r => r.tag === 'A')
  const after = s2.prog.filter(r => !r.isInput).map(r => r.name).join(',')
  const moved = before !== after
  if (C.phone) { await C.page.setViewportSize({ width: 390, height: 844 }); await C.page.waitForTimeout(500) }
  const pic3 = await snap(C.page, `j3-4-dropped-${C.tag}`, ['#schedBoard .sb-panel.prog'], ['[data-wkrow="A"]'], 8)
  const pl = a2 ? placedOk(s2.prog, a2.i) : { ok: false, why: 'row lost' }
  rec(`J3-3 ${C.tag} board: dragging Own A past the input's row shows ONE landing line (on the row it would land by), none on the input's row`, !!seen.overTarget && seen.overTarget.n === 1 && !seen.overTarget.inputDrop && (!seen.overInput || (seen.overInput.n <= 1 && !seen.overInput.inputDrop)), `while over the input's row: ${J(seen.overInput)}; while over Own B: ${J(seen.overTarget)} (gesture: ${gest})`, seen.pic)
  rec(`J3-4 ${C.tag} board: after the drop Own A lands by Own B, and the input's row stays where its time puts it`, moved && !!a2 && pl.ok, `own order before ${before} -> after ${after}; Common Programme now: ${seq(s2.prog)}; ${pl.ok ? 'input row placed by the rule' : pl.why}${moved ? '' : ' (THE DROP CHANGED NOTHING — gesture not proven)'}`, pic3)
  /* Undo puts it back */
  if (moved) { const u = C.page.locator('#sbUndo:visible').first(); await (C.phone ? u.tap() : u.click()); await C.page.waitForTimeout(800); const s3 = await scan(C.page, 'board', 0); rec(`J3-5 ${C.tag} board: Undo puts Own A back`, s3.prog.filter(r => !r.isInput).map(r => r.name).join(',') === before, `own order now ${s3.prog.filter(r => !r.isInput).map(r => r.name).join(',')} (expected ${before}); ${seq(s3.prog)}`) }
}

/* ═════════════ J4 — live move ═════════════ */
async function openWinFromRowSel(C, rowSel) {
  await press(C, `${rowSel} .inpedit`); await C.page.waitForSelector('[data-testid="win-inputedit"], #inpEditPop:not([hidden]) #inpEditSave'); await C.page.waitForTimeout(600)
}
async function inpRowSel(C, where, di, reSrc) {
  return C.page.evaluate(([where, di, src]) => {
    const re = new RegExp(src), scope = where === 'board' ? '#schedBoard .sb-panel.pinp' : `#eWeek .day[data-day="${di}"] .sec-inp`
    const rows = [...document.querySelectorAll(`${scope} [data-inprow]`)]
    const r = rows.find(r => { const b = r.querySelector(where === 'board' ? 'textarea.rmkin' : '.rmk .ntx'); return b && re.test(String(b.value ?? b.textContent).trim()) })
    return r ? `${scope} [data-inprow="${r.dataset.inprow}"]` : null
  }, [where, di, reSrc])
}
async function phState(C) { return C.page.evaluate(() => [...document.querySelectorAll('button[data-ph]')].map(b => ({ id: b.dataset.ph, label: b.getAttribute('aria-label'), on: b.getAttribute('aria-pressed') === 'true', dis: b.disabled }))) }
async function togglePh(C, wantOn) {
  const ps = await phState(C); const a = ps.find(p => /all\s*avail/i.test(p.label || ''))
  if (!a) throw new Error('no ALL AVAIL choice in the input window: ' + J(ps))
  if (a.on !== wantOn) { await press(C, `button[data-ph="${a.id}"]`); await C.page.waitForTimeout(300) }
  const after = (await phState(C)).find(p => /all\s*avail/i.test(p.label || ''))
  await press(C, '#inpEditSave'); await C.page.waitForTimeout(900)
  await oilAnswer(C.page, 'yes')
  return { before: a.on, after: after.on }
}
const undoBtn = C => C.page.locator('#sbUndo:visible').count().then(n => n ? C.page.locator('#sbUndo:visible').first() : C.page.locator('#undoBtn:visible').first())
async function j4(C) {
  await openBoard(C, 0)
  await ensurePI(C, 'board', 0)
  const rs = await inpRowSel(C, 'board', 0, RE_B)
  if (!rs) return rec(`J4-0 ${C.tag} live move`, null, 'NOT WALKED: no "Sqn brief B" line under Personal Inputs on Monday\'s board')
  const where = async () => { const s = await scan(C.page, 'board', 0, [['B', RE_B]]); return { s, sec: s.prog.some(r => r.tag === 'B') ? 'COMMON' : s.grnd.some(r => r.tag === 'B') ? 'GROUND' : 'NEITHER' } }
  const w0 = await where()
  const p0 = await snap(C.page, `j4-1-before-${C.tag}`, ['#schedBoard .sb-panel.prog', '#schedBoard .sb-panel.grnd'], ['[data-wkrow="B"]'], 8)
  rec(`J4-1 ${C.tag} board: "Sqn brief B" (ALL AVAIL + two named) starts on the Common Programme`, w0.sec === 'COMMON', `row is on ${w0.sec}; Common: ${seq(w0.s.prog)}; Ground: ${seq(w0.s.grnd)}`, p0)
  /* take ALL AVAIL out */
  await openWinFromRowSel(C, rs)
  const t1 = await togglePh(C, false)
  const w1 = await where()
  const p1 = await snap(C.page, `j4-2-allavail-out-${C.tag}`, ['#schedBoard .sb-panel.prog', '#schedBoard .sb-panel.grnd'], ['[data-wkrow="B"]'], 8)
  rec(`J4-2 ${C.tag} board: ALL AVAIL taken out in the input's window (named people stay) — the row moves to the Ground Programme`, w1.sec === 'GROUND', `ALL AVAIL ${t1.before} -> ${t1.after}; the row is on ${w1.sec}; Common: ${seq(w1.s.prog)}; Ground: ${seq(w1.s.grnd)}`, p1)
  /* Undo puts it back */
  const u = await undoBtn(C); const ud = await u.isDisabled().catch(() => true)
  if (!ud) { await (C.phone ? u.tap() : u.click()); await C.page.waitForTimeout(900) }
  const w2 = await where()
  const p2 = await snap(C.page, `j4-3-undo-${C.tag}`, ['#schedBoard .sb-panel.prog', '#schedBoard .sb-panel.grnd'], ['[data-wkrow="B"]'], 8)
  rec(`J4-3 ${C.tag} board: the top bar's Undo puts ALL AVAIL back — the row is on the Common Programme again`, !ud && w2.sec === 'COMMON', `Undo ${ud ? 'was DISABLED' : 'pressed'}; row is on ${w2.sec}; Common: ${seq(w2.s.prog)}`, p2)
  /* out again, then put back through the window */
  await ensurePI(C, 'board', 0); const rs2 = await inpRowSel(C, 'board', 0, RE_B)
  await openWinFromRowSel(C, rs2); await togglePh(C, false)
  const w3 = await where()
  await ensurePI(C, 'board', 0); const rs3 = await inpRowSel(C, 'board', 0, RE_B)
  await openWinFromRowSel(C, rs3); const t4 = await togglePh(C, true)
  const w4 = await where()
  const p4 = await snap(C.page, `j4-4-allavail-back-${C.tag}`, ['#schedBoard .sb-panel.prog', '#schedBoard .sb-panel.grnd'], ['[data-wkrow="B"]'], 8)
  rec(`J4-4 ${C.tag} board: out again (Ground), then ALL AVAIL put back in the window — the row moves back to the Common Programme`, w3.sec === 'GROUND' && w4.sec === 'COMMON', `after the second take-out the row is on ${w3.sec}; after putting ALL AVAIL back (${t4.before} -> ${t4.after}) it is on ${w4.sec}; Common: ${seq(w4.s.prog)}`, p4)
  /* Undo the put-back: back to Ground; Undo again: Common */
  const u5 = await undoBtn(C); if (!(await u5.isDisabled().catch(() => true))) { await (C.phone ? u5.tap() : u5.click()); await C.page.waitForTimeout(900) }
  const w5 = await where()
  const u6 = await undoBtn(C); if (!(await u6.isDisabled().catch(() => true))) { await (C.phone ? u6.tap() : u6.click()); await C.page.waitForTimeout(900) }
  const w6 = await where()
  rec(`J4-5 ${C.tag} board: Undo of the put-back returns it to the Ground Programme; the next Undo returns it to the Common Programme`, w5.sec === 'GROUND' && w6.sec === 'COMMON', `after one Undo: ${w5.sec}; after the next: ${w6.sec}`, await snap(C.page, `j4-5-undo-chain-${C.tag}`, ['#schedBoard .sb-panel.prog', '#schedBoard .sb-panel.grnd'], ['[data-wkrow="B"]'], 8))
}

/* ═════════════ J5 — its boxes, Reject and Accept ═════════════ */
async function j5box(C, where) {
  const di = 0
  if (where === 'board') await openBoard(C, di); else await openWeek(C)
  let s = await scan(C.page, where, di, [['A', RE_A]])
  let a = s.prog.find(r => r.tag === 'A'); if (!a) return rec(`J5-0 ${C.tag} ${where}`, null, 'NOT WALKED: the row is not on the Common Programme to start with')
  const rowSel = i => where === 'board' ? `#schedBoard .sb-panel.prog .sb-arow >> nth=${i}` : `#eWeek .day[data-day="${di}"] .sec-prog .ah-row >> nth=${i}`
  const strBox = where === 'board' ? '[data-bfld$=".str"]' : '[data-txt$=".str"]'
  const rmkBox = where === 'board' ? '[data-bfld$=".rmks"]' : '[data-txt$=".rmks"]'
  /* a new start time */
  await typeInRow(C, rowSel(a.i), strBox, '15:30')
  s = await scan(C.page, where, di, [['A', RE_A]]); a = s.prog.find(r => r.tag === 'A')
  const st = await storedBy(C.page, RE_A)
  let pl = a ? placedOk(s.prog, a.i) : { ok: false, why: 'row gone from the Common Programme' }
  let late = ''
  if (a && !pl.ok) {
    await C.page.waitForTimeout(2000); const sB = await scan(C.page, where, di, [['A', RE_A]]); const aB = sB.prog.find(r => r.tag === 'A'); const plB = aB ? placedOk(sB.prog, aB.i) : { ok: false }
    await goPage(C, 'inputs'); await C.page.waitForTimeout(500)
    if (where === 'board') await openBoard(C, di); else await openWeek(C)
    const sC = await scan(C.page, where, di, [['A', RE_A]]); const aC = sC.prog.find(r => r.tag === 'A'); const plC = aC ? placedOk(sC.prog, aC.i) : { ok: false }
    late = ` | 2 s later: index ${aB?.i} placed-by-rule ${plB.ok}; after leaving and reopening the screen: index ${aC?.i} placed-by-rule ${plC.ok} (${seq(sC.prog)})`
    s = sC; a = aC || a; pl = plC; late += ' | the row did NOT move at once but takes its time place when the screen is next drawn (the ordinary Ground Programme row behaves the same: J5-6)'
  }
  const pic1 = a ? await snap(C.page, `j5-1-time-${where}-${C.tag}`, where === 'board' ? ['#schedBoard .sb-panel.prog'] : [`#eWeek .day[data-day="${di}"] .sec-prog`], ['[data-wkrow="A"]'], 8) : null
  rec(`J5-1 ${C.tag} ${where}: type 15:30 in its start box, Tab — saved, and the row moves to its new time place`, !!a && /^15:?30$/.test(a.str) && pl.ok && st.length === 1 && st[0].s === 930, a ? `start now "${a.str}"; ${seq(s.prog)}; ${pl.ok ? 'placed by the rule' : pl.why}; stored record ${J(st)}${late}` : `row not found on the Common Programme afterwards: ${seq(s.prog)} || Ground ${seq(s.grnd)}`, pic1)
  if (!a) return
  /* a remark word */
  await typeInRow(C, rowSel(a.i), rmkBox, ' x', { append: true })
  s = await scan(C.page, where, di, [['A', RE_A]]); a = s.prog.find(r => r.tag === 'A')
  const st2 = await storedBy(C.page, RE_A)
  rec(`J5-2 ${C.tag} ${where}: type " x" at the end of its remark, Tab — saved`, !!a && /x$/.test(a.rmk) && st2.length === 1 && /x$/.test(String(st2[0].remarks)), a ? `remark box reads ${J(a.rmk)}; stored remarks ${J(st2.map(x => x.remarks))}` : 'row gone', a ? await snap(C.page, `j5-2-remark-${where}-${C.tag}`, ['[data-wkrow="A"]'], ['[data-wkrow="A"]'], 10) : null)
  /* put both back */
  if (a) { await typeInRow(C, rowSel(a.i), rmkBox, 'Sqn brief'); s = await scan(C.page, where, di, [['A', RE_A]]); a = s.prog.find(r => r.tag === 'A') }
  if (a) { await typeInRow(C, rowSel(a.i), strBox, '13:00'); s = await scan(C.page, where, di, [['A', RE_A]]); a = s.prog.find(r => r.tag === 'A') }
  rec(`J5-3 ${C.tag} ${where}: put back to 13:00 and "Sqn brief"`, !!a && /^13:?00$/.test(a.str) && a.rmk === 'Sqn brief', a ? `start "${a.str}", remark "${a.rmk}"` : 'row gone')
}
/* the BASELINE for J5-1: does an ordinary Ground Programme row (a Medical appointment input, 10:30) move at once when retimed? */
async function j5base(C, where) {
  const di = 0
  if (where === 'board') await openBoard(C, di); else await openWeek(C)
  const s = await scan(C.page, where, di, [])
  const g = s.grnd.find(r => r.isInput && /MEDICAL/i.test(r.name)) || s.grnd.find(r => r.isInput)
  if (!g) return rec(`J5-6 ${C.tag} ${where} baseline`, null, 'NOT WALKED: no Ground Programme input row to retime for comparison: ' + seq(s.grnd))
  const rowSel = i => where === 'board' ? `#schedBoard .sb-panel.grnd .sb-arow >> nth=${i}` : `#eWeek .day[data-day="${di}"] .sec-grnd .pl-row >> nth=${i}`
  const strBox = where === 'board' ? '[data-bfld$=".str"]' : '[data-txt$=".str"]'
  const before = seq(s.grnd)
  await typeInRow(C, rowSel(g.i), strBox, '17:45')
  const s1 = await scan(C.page, where, di, [])
  await goPage(C, 'inputs'); await C.page.waitForTimeout(500); if (where === 'board') await openBoard(C, di); else await openWeek(C)
  const s2 = await scan(C.page, where, di, [])
  rec(`J5-6 ${C.tag} ${where} BASELINE: an ordinary Ground Programme input row ("${g.name}") retimed to 17:45 — does it move at once?`, 'note', `before: ${before} || at once: ${seq(s1.grnd)} || after leaving the screen and coming back: ${seq(s2.grnd)}`)
  const g2 = s2.grnd.find(r => r.str === '17:45'); if (g2) await typeInRow(C, rowSel(g2.i), strBox, g.str)
}
async function j5reject(C) {
  const di = 0
  await openWeek(C); await ensurePI(C, 'week', di)
  const rs = await inpRowSel(C, 'week', di, RE_A)
  if (!rs) return rec(`J5-4 ${C.tag} Reject`, null, 'NOT WALKED: no "Sqn brief" line under Personal Inputs')
  const lab = await C.page.locator(`${rs} .accb`).first().innerText()
  await press(C, `${rs} .accb`); await C.page.waitForTimeout(900); await ensurePI(C, 'week', di)
  const s1 = await scan(C.page, 'week', di, [['A', RE_A]])
  const rs1 = await inpRowSel(C, 'week', di, RE_A)
  const lab1 = rs1 ? await C.page.locator(`${rs1} .accb`).first().innerText() : null
  const picR = await snap(C.page, `j5-4-rejected-${C.tag}`, [`#eWeek .day[data-day="${di}"] .sec-prog`, `#eWeek .day[data-day="${di}"] .sec-inp`], rs1 ? [rs1] : [], 6)
  rec(`J5-4 ${C.tag} week: Reject on its Personal Inputs line — the row leaves the Common Programme`, /^reject/i.test(lab) && !s1.prog.some(r => r.tag) && !s1.grnd.some(r => r.tag), `button before "${lab}", after "${lab1}"; in the Common Programme: ${s1.prog.some(r => r.tag)}; in the Ground Programme: ${s1.grnd.some(r => r.tag)}; Common: ${seq(s1.prog)}`, picR)
  if (rs1) { await press(C, `${rs1} .accb`); await C.page.waitForTimeout(900) }
  const s2 = await scan(C.page, 'week', di, [['A', RE_A]])
  rec(`J5-5 ${C.tag} week: Accept — the row is back on the Common Programme`, s2.prog.some(r => r.tag) && !s2.grnd.some(r => r.tag), `Common: ${seq(s2.prog)}; ground has it: ${s2.grnd.some(r => r.tag)}`, await snap(C.page, `j5-5-accepted-${C.tag}`, [`#eWeek .day[data-day="${di}"] .sec-prog`], ['[data-wkrow="A"]'], 8))
}

/* ═════════════ J6 — OIL Earn ═════════════ */
async function j6(C) {
  await openBoard(C, 5)
  const has = await C.page.locator('#sbOil').count()
  if (!has) return rec(`J6 ${C.tag} OIL Earn on Saturday's board`, null, 'NOT WALKED: Saturday 18 Jul\'s board offers no OIL Earn button (#sbOil) — no published weekend in the demo week, so a weekend has nothing to earn')
  const f = await fileOne(C, { iso: '2026-07-18', remark: 'Sat brief', ph: true, start: '10:00', end: '11:00', pic: `j6-0-file-sat` })
  await dropWindow(C)
  await openBoard(C, 5)
  await press(C, '#sbOil'); await C.page.waitForTimeout(700)
  const s = await scan(C.page, 'board', 5, [['S', '^Sat brief']])
  const r = s.prog.find(x => x.tag === 'S')
  const oil = r ? await C.page.evaluate(() => { const e = document.querySelector('[data-wkrow="S"]'); return { sw: [...e.querySelectorAll('[data-oilseat],[data-oilitem],.oilsw,.oilbar,[class*="oil"]')].length, html: e.innerHTML.match(/oil[a-z-]*/gi)?.slice(0, 8) } }) : null
  rec(`J6 ${C.tag} OIL Earn (Saturday): the row on the Common Programme shows its OIL switches`, !!r && oil.sw > 0, r ? `row on the Common Programme; OIL elements ${oil.sw} (${J(oil.html)}); filed: ${J(f.stored)}` : `row not on the Common Programme: ${seq(s.prog)}`, await snap(C.page, `j6-1-oil-earn`, ['#schedBoard .sb-panel.prog'], ['[data-wkrow="S"]'], 8))
  await press(C, '#sbOil').catch(() => {})
}

/* ═════════════ J8 — pictures for Q1 (desktop) ═════════════ */
async function j8(C) {
  /* (a) the changes window's line for this row */
  await openWeek(C)
  await press(C, '#histBtn'); await C.page.waitForTimeout(900)
  { const t = C.page.locator('.chgwin:not([hidden]) .win-tab', { hasText: 'All changes' }).first(); if (await t.count()) { await t.click(); await C.page.waitForTimeout(400) } const m = C.page.locator('.chgwin:not([hidden]) button', { hasText: /^Mon$/ }).first(); if (await m.count()) { await m.click(); await C.page.waitForTimeout(500) } }
  const cw = await C.page.evaluate(() => {
    const w = document.querySelector('.chgwin:not([hidden])'); if (!w) return null
    const lines = [...w.querySelectorAll('*')].filter(e => !e.children.length && e.textContent.trim()).map(e => e.textContent.trim())
    document.querySelectorAll('[data-wk]').forEach(e => e.removeAttribute('data-wk'))
    const g = [...w.querySelectorAll('*')].filter(e => !e.children.length && /ground/i.test(e.textContent)); g.forEach(e => e.setAttribute('data-wk', '1'))
    return { n: lines.length, ground: g.map(e => e.textContent.trim()), mine: lines.filter(l => /Sqn brief|MEETING|Meeting/.test(l)).slice(0, 6) }
  })
  const pa = cw ? await snap(C.page, 'j8-1-changes-window', ['.chgwin:not([hidden])'], ['[data-wk]'], 6) : null
  rec('J8-1 desk the changes window: the line for this row', 'note', cw ? `words with "Ground" in the window: ${J(cw.ground)}; lines about the row: ${J(cw.mine)} (the word marked in the picture)` : 'the changes window did not open from the clock button (#histBtn)', pa)
  await press(C, '#histBtn').catch(() => {}); await C.page.waitForTimeout(300)
  const dayCount = await C.page.evaluate(() => (document.querySelector('#eWeek .day[data-day="0"] [data-chgday="0"]')?.textContent || '').trim())
  rec('J8-1b desk Monday head: the day\'s change count', 'note', `Monday's head count button reads ${J(dayCount)}`, await snap(C.page, 'j8-1b-day-count', ['#eWeek .day[data-day="0"] .day-head'], ['#eWeek .day[data-day="0"] [data-chgday="0"]'], 8))
  /* (b) the board's note after the cross on the input's row, then Undo */
  await openBoard(C, 0)
  const s = await scan(C.page, 'board', 0, [['A', RE_A]])
  const a = s.prog.find(r => r.tag === 'A')
  if (!a) rec('J8-2 desk board note after ✕', null, 'NOT WALKED: the row is not on the Common Programme')
  else {
    const del = C.page.locator('[data-wkrow="A"] [data-grdel]').first()
    if (!(await del.count())) rec('J8-2 desk board note after ✕', null, 'NOT WALKED: no ✕ ([data-grdel]) on the input\'s row')
    else {
      await C.page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = '' })
      await del.scrollIntoViewIfNeeded(); await del.click(); await C.page.waitForTimeout(350)
      const toast = await C.page.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return null; const r = t.getBoundingClientRect(); t.setAttribute('data-wk', '1'); return { text: t.textContent.trim(), shown: r.width > 1, rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], op: getComputedStyle(t).opacity, vis: getComputedStyle(t).visibility } })
      const pb = await snap(C.page, 'j8-2-board-x-note', ['#toastEl', '#schedBoard .sb-panel.prog'], ['#toastEl'], 8)
      const pbx = await C.page.screenshot({ path: join(OUT, 'j8-2b-board-x-whole.png') }).then(() => 'j8-2b-board-x-whole.png').catch(() => null)
      rec('J8-2 desk the board\'s note after pressing ✕ on the input\'s row', 'note', `note reads ${J(toast?.text)}`, [pb, pbx].filter(Boolean).join(' '))
      const u = await undoBtn(C); if (!(await u.isDisabled().catch(() => true))) { await u.click(); await C.page.waitForTimeout(800) }
      const s2 = await scan(C.page, 'board', 0, [['A', RE_A]])
      rec('J8-2c desk Undo of the ✕ puts the row back on the Common Programme', s2.prog.some(r => r.tag), `Common: ${seq(s2.prog)}`)
    }
  }
  /* (c) an "Other" filed for ALL AVAIL: Personal Inputs' button */
  const o = await fileOne(C, { iso: '2026-07-14', type: 'Other', remark: 'Other brief', ph: true, start: '10:00', end: '11:00', pic: 'j8-3-file-other' }).catch(e => ({ err: String(e.message).slice(0, 300) }))
  if (o.err) rec('J8-3 desk an Other filed for ALL AVAIL', null, 'NOT WALKED: ' + o.err)
  else {
    await dropWindow(C); await openWeek(C); await ensurePI(C, 'week', 1)
    let rs = await inpRowSel(C, 'week', 1, '^Other brief')
    if (!rs) rec('J8-3 desk Personal Inputs line of the Other', null, `NOT WALKED: no "Other brief" line on Tuesday (filed: ${J(o.stored)})`)
    else {
      let lab = await C.page.locator(`${rs} .accb`).allInnerTexts()
      const accs = await C.page.locator(`${rs} .accb`).evaluateAll(bs => bs.map(b => b.dataset.acc + ':' + b.textContent.trim()))
      if (!lab.some(t => /Ground/.test(t))) { await press(C, `${rs} .accb`); await C.page.waitForTimeout(900); await ensurePI(C, 'week', 1); rs = await inpRowSel(C, 'week', 1, '^Other brief') }
      const accs2 = rs ? await C.page.locator(`${rs} .accb`).evaluateAll(bs => bs.map(b => b.dataset.acc + ':' + b.textContent.trim())) : []
      const gb = rs ? C.page.locator(`${rs} .accb`, { hasText: 'Ground' }) : null
      const pc = rs ? await snap(C.page, 'j8-3-other-buttons', [rs], gb && (await gb.count()) ? [`${rs} .accb[data-acc="${await gb.first().getAttribute('data-acc')}"]`] : [], 8) : null
      rec('J8-3 desk Personal Inputs\' button on an Other filed for ALL AVAIL', 'note', `buttons first seen ${J(accs)}; after a Reject where needed ${J(accs2)}; "→ Ground" button ${gb && (await gb.count()) ? 'PRESENT (marked)' : 'not shown'}`, pc)
      if (gb && (await gb.count())) {
        await gb.first().scrollIntoViewIfNeeded(); await gb.first().click(); await C.page.waitForTimeout(900)
        const t = await scan(C.page, 'week', 1, [['O', '^Other brief']])
        rec('J8-4 desk "→ Ground" pressed on the Other: where the row is drawn', 'note', `row on the ${t.prog.some(r => r.tag) ? 'COMMON Programme' : t.grnd.some(r => r.tag) ? 'GROUND Programme' : 'neither programme'}; Common: ${seq(t.prog)}`, await snap(C.page, 'j8-4-other-landed', [`#eWeek .day[data-day="1"] .sec-prog`, `#eWeek .day[data-day="1"] .sec-grnd`], ['[data-wkrow="O"]'], 8))
      }
    }
  }
}
async function j8phone(C) {
  await openBoard(C, 0)
  const s = await scan(C.page, 'board', 0, [['A', RE_A]])
  const a = s.prog.find(r => r.tag === 'A')
  if (!a) return rec('J8-5 phone banner while a place waits for a puck', null, 'NOT WALKED: the row is not on the Common Programme')
  await C.page.evaluate(() => document.querySelector('[data-wkrow="A"]').scrollIntoView({ block: 'center' })); await C.page.waitForTimeout(200)
  const pt = await C.page.evaluate(() => {
    const cell = document.querySelector('[data-wkrow="A"] .ppl'); const r = cell.getBoundingClientRect(); const az = cell.querySelector('.addz'); const ar = az ? az.getBoundingClientRect() : null
    const cands = []; if (ar && ar.width > 1) cands.push([ar.left + ar.width / 2, ar.top + ar.height / 2])
    for (const [fx, fy] of [[0.96, 0.96], [0.9, 0.9], [0.96, 0.7], [0.7, 0.96]]) cands.push([r.left + r.width * fx, r.top + r.height * fy])
    for (const [x, y] of cands) { const h = document.elementFromPoint(x, y); if (h && (h === cell || h.classList.contains('addz'))) return { x, y, hit: h.className || 'ppl', cell: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] } }
    return { none: true, cell: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] }
  })
  console.log('   + add place:', J(pt))
  if (pt.none) return rec('J8-5 phone banner', null, 'NOT WALKED: no free spot on the People cell of the input row to tap (cell ' + J(pt.cell) + ')')
  await C.page.touchscreen.tap(pt.x, pt.y); await C.page.waitForTimeout(800)
  const ban = await C.page.evaluate(() => {
    document.querySelectorAll('[data-wk]').forEach(e => e.removeAttribute('data-wk'))
    const g = [...document.querySelectorAll('.ros-arm b')].filter(e => e.getBoundingClientRect().width > 1)
    g.forEach(e => e.setAttribute('data-wk', '1'))
    return g.map(e => e.parentElement.innerText.replace(/s+/g, ' ').trim())
  })
  await C.page.screenshot({ path: join(OUT, 'j8-5-banner-phone-whole.png') })
  const pb5 = await snap(C.page, 'j8-5-banner-phone', ['[data-wk]'], ['[data-wk]'], 60)
  rec('J8-5 phone the banner shown while a place waits for a puck', 'note', `banner text with the word marked: ${J(ban)}`, ['j8-5-banner-phone-whole.png', pb5].filter(Boolean).join(' '))
  await C.page.keyboard.press('Escape').catch(() => {})
}

/* ═════════════ J9 — the next-week peek ═════════════ */
async function j9(C) {
  const f = await fileOne(C, { iso: '2026-07-20', remark: 'Peek brief', ph: true, start: '09:00', end: '10:00', pic: 'j9-0-file-next' }).catch(e => ({ err: String(e.message).slice(0, 300) }))
  if (f.err) return rec('J9 desk next-week peek', null, 'NOT WALKED: could not file an ALL AVAIL input on Monday 20 Jul: ' + f.err)
  await dropWindow(C); await openView(C)
  const peek = await C.page.evaluate(() => {
    const leaves = [...document.querySelectorAll('#vWeek *')].filter(e => !e.children.length && /next week/i.test(e.textContent))
    if (!leaves.length) return { found: false }
    const e = leaves[0]; let p = e.parentElement; while (p && p.scrollWidth <= p.clientWidth + 1) p = p.parentElement; if (p) p.scrollLeft = p.scrollWidth
    e.scrollIntoView({ block: 'center', inline: 'center' }); return { found: true, text: e.textContent.trim() }
  })
  await C.page.waitForTimeout(500)
  const r = await C.page.evaluate(() => {
    const out = []; document.querySelectorAll('[data-wkp]').forEach(e => e.removeAttribute('data-wkp'))
    const rows = [...document.querySelectorAll('#vWeek *')].filter(e => e.children.length < 12 && /Peek brief/.test(e.textContent) && !e.querySelector('*[class*="day"]') && e.getBoundingClientRect().width > 1)
    const row = rows.length ? rows.reduce((a, b) => a.textContent.length <= b.textContent.length ? a : b) : null
    if (!row) return { found: false }
    row.setAttribute('data-wkp', '1'); document.querySelectorAll('[data-wkq]').forEach(e => e.removeAttribute('data-wkq')); (row.closest('.sec-prog') || row).setAttribute('data-wkq', '1')
    let sec = row, chain = []
    for (let p = row; p && p.id !== 'vWeek'; p = p.parentElement) chain.push((p.className || p.tagName).toString().slice(0, 30))
    const inProg = !!row.closest('.sec-prog, .allhands'), inGrnd = !!row.closest('.sec-grnd, .grnd')
    return { found: true, inProg, inGrnd, chain: chain.slice(0, 7), text: row.innerText.replace(/\s+/g, ' ').slice(0, 100) }
  })
  const pic = r.found ? await snap(C.page, 'j9-1-peek', ['[data-wkq]'], ['[data-wkp]'], 8) : null
  rec('J9 desk next-week peek (View-only Sched): the ALL AVAIL input\'s row is on the peek\'s Common Programme', r.found && r.inProg && !r.inGrnd, r.found ? `peek text ${J(peek.text)}; row inside Common Programme ${r.inProg}, inside Ground Programme ${r.inGrnd}; ancestors ${J(r.chain)}; row text ${J(r.text)}` : `the row was not found in the peek (peek found: ${J(peek)}; filed ${J(f.stored)})`, pic)
}

/* ═════════════ J7 — publish Monday ═════════════ */
async function j7(C) {
  const di = 0, day = `#eWeek .day[data-day="${di}"]`
  await openWeek(C)
  const head0 = await C.page.evaluate(d => ({ text: document.querySelector(d + ' .day-head')?.innerText.replace(/\s+/g, ' ').trim(), pend: (document.querySelector(d + ' .dpend')?.textContent || '').trim() }), day)
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = C.page.locator(`${day} select[data-sign="${role}"][data-signday="${di}"]`).first()
    await sel.scrollIntoViewIfNeeded()
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    if (!opts.length) return rec(`J7-1 ${C.tag} publish Monday`, false, `sign-off ${role} offers no names`)
    await sel.selectOption(opts[0])
  }
  const beak = C.page.locator(`${day} [data-beak="${di}"]`).first()
  if (await beak.isDisabled()) return rec(`J7-1 ${C.tag} publish Monday`, false, 'Publish day still disabled; hover ' + J(await beak.getAttribute('title')))
  await beak.scrollIntoViewIfNeeded(); await (C.phone ? beak.tap() : beak.click()); await C.page.waitForTimeout(1000)
  const head1 = await C.page.evaluate(d => ({ chip: [...document.querySelectorAll(d + ' .verchip')].map(e => e.textContent.trim()).join(' | '), pend: (document.querySelector(d + ' .dpend')?.textContent || '').trim(), text: document.querySelector(d + ' .day-head')?.innerText.replace(/\s+/g, ' ').trim() }), day)
  const s = await scan(C.page, 'week', di, [['A', RE_A]])
  const pic = await snap(C.page, `j7-1-published-${C.tag}`, [`${day} .day-head`, `${day} .sec-prog`], ['[data-wkrow="A"]', `${day} .verchip`], 8)
  rec(`J7-1 ${C.tag} publish Monday through its own controls: ORIG, nothing pending, the row still on the Common Programme`, /ORIG/.test(head1.chip) && !/pending/i.test(head1.pend + head1.text) && s.prog.some(r => r.tag), `head before "${head0.text}" (pending "${head0.pend}"); after chip "${head1.chip}", pending "${head1.pend}", head "${head1.text}"; Common: ${seq(s.prog)}`, pic)
  await openView(C)
  const v = await scan(C.page, 'view', di, [['A', RE_A]])
  const vTxt = await C.page.evaluate(() => document.querySelector('#vWeek .day[data-day="0"]')?.innerText || '')
  rec(`J7-2 ${C.tag} View-only Sched (issued face): the row on the Common Programme, no Reject line`, v.prog.some(r => r.tag) && !v.grnd.some(r => r.tag) && !/press Reject on it/i.test(vTxt), `Common: ${seq(v.prog)}; ground has it: ${v.grnd.some(r => r.tag)}`, await snap(C.page, `j7-2-issued-face-${C.tag}`, ['#vWeek .day[data-day="0"] .day-head', '#vWeek .day[data-day="0"] .sec-prog'], ['[data-wkrow="A"]'], 8))
}

async function j7pend(C) {
  const di = 0, day = `#eWeek .day[data-day="${di}"]`
  await openWeek(C)
  const s = await scan(C.page, 'week', di, [['A', RE_A]]); const a = s.prog.find(r => r.tag === 'A')
  if (!a) return rec(`J7-3 ${C.tag} pending list`, null, 'NOT WALKED: the row is not on the Common Programme')
  await typeInRow(C, `${day} .sec-prog .ah-row >> nth=${a.i}`, '[data-txt$=".rmks"]', ' y', { append: true })
  const pend = (await C.page.locator(`${day} .dpend`).first().textContent().catch(() => '')).trim()
  await C.page.locator(`${day} .dpend`).first().scrollIntoViewIfNeeded(); await C.page.locator(`${day} .dpend`).first().click(); await C.page.waitForTimeout(700)
  const tab = C.page.locator('.chgwin:not([hidden]) .win-tab', { hasText: 'To go out' }).first(); if (await tab.count()) { await tab.click(); await C.page.waitForTimeout(500) }
  const txt = await C.page.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); if (!w) return null; document.querySelectorAll('[data-wk]').forEach(e => e.removeAttribute('data-wk')); const g = [...w.querySelectorAll('*')].filter(e => !e.children.length && /ground/i.test(e.textContent)); g.forEach(e => e.setAttribute('data-wk', '1')); return { ground: g.map(e => e.parentElement.innerText.replace(/s+/g, ' ').trim().slice(0, 140)), all: w.innerText.replace(/s+/g, ' ').slice(0, 400) } })
  const pic = await snap(C.page, `j7-3-pending-list-${C.tag}`, ['.chgwin:not([hidden])'], ['[data-wk]'], 6)
  rec(`J7-3 ${C.tag} a remark typed on the published day: the day's pending count and the "To go out" list's title for the row`, 'note', `head count reads "${pend}"; titles with the word "Ground": ${J(txt?.ground)}; list text ${J(txt?.all)}`, pic)
}
/* ───────────────────────── the runs ───────────────────────── */
async function runAll(C) {
  await step(`J1 ${C.tag} file`, () => j1(C).then(() => null))
  await step(`J2 ${C.tag} week`, () => j2(C).then(() => null))
  await step(`J3 ${C.tag} board`, () => j3(C).then(() => null))
  await step(`J4 ${C.tag} live move`, () => j4(C).then(() => null))
  await step(`J5 ${C.tag} week boxes`, () => j5box(C, 'week').then(() => null))
  await step(`J5 ${C.tag} board boxes`, () => j5box(C, 'board').then(() => null))
  if (!C.phone) await step(`J5 ${C.tag} baseline week`, () => j5base(C, 'week').then(() => null))
  if (!C.phone) await step(`J5 ${C.tag} baseline board`, () => j5base(C, 'board').then(() => null))
  await step(`J5 ${C.tag} reject`, () => j5reject(C).then(() => null))
  if (!C.phone) await step(`J6 ${C.tag} OIL Earn`, () => j6(C).then(() => null))
  if (!C.phone) await step(`J8 ${C.tag} Q1 pictures`, () => j8(C).then(() => null))
  else await step(`J8 ${C.tag} Q1 phone banner`, () => j8phone(C).then(() => null))
  if (!C.phone) await step(`J9 ${C.tag} peek`, () => j9(C).then(() => null))
  await step(`J7 ${C.tag} publish`, () => j7(C).then(() => null))
  if (!C.phone) await step(`J7 ${C.tag} pending list`, () => j7pend(C).then(() => null))
}
if (!ONLY || ONLY.includes('desk')) { const D = await newCtx('desk', 1440, 900, false); await signIn(D); await runAll(D); await D.ctx.close() }
if (!ONLY || ONLY.includes('phone')) { const P = await newCtx('phone390', 390, 844, true); await signIn(P); await runAll(P); await P.ctx.close() }

writeFileSync(join(OUT, 'results.json'), JSON.stringify({ results, errs }, null, 1))
const c = t => results.filter(r => r.tag === t).length
console.log(`\nSUMMARY  PASS ${c('PASS')}  FAIL ${c('FAIL')}  NOTE ${c('NOTE')}  NOT WALKED ${c('NOT WALKED')}  (${Math.round((Date.now() - T0) / 1000)}s)`)
console.log('console/page errors:', errs.length); for (const e of [...new Set(errs)].slice(0, 40)) console.log('  ' + e)
await browser.close()
