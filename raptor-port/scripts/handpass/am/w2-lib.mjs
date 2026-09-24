/* Walker w2's helpers for the amendment re-test (24 Sep 26) — plans, previews, "Load onto working
   copy", the view page. Built on am-lib.mjs (which re-exports ../lib.mjs). Set HP_SHOTS BEFORE the
   dynamic import of this file (lib.mjs reads it once, at import).
   Everything here drives the app's own controls; reads of window.SCHED / window.DAYS are for the
   evidence table only (the brief: record, never set). */
export * from './am-lib.mjs'
import { head, planMenuItems, go, board as board0, login, BASE } from './am-lib.mjs'
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'

/* lib.open() with a device pixel ratio — for CLOSE-UP pictures only (a 1px dashed outline is not
   legible at 1×). Same login, same error watch, same saved world. */
export async function openHi({ width = 1440, height = 900, who = 'a', state = null, dpr = 3 } = {}) {
  const CH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
  mkdirSync(process.env.HP_SHOTS, { recursive: true })
  const browser = await chromium.launch({ headless: true, ...(existsSync(CH) ? { executablePath: CH } : {}) })
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dpr, ...(state ? { storageState: state } : {}) })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await login(page, who)
  return { browser, ctx, page, errors }
}

export const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/2026-09-24-amendment-week.json'
export const DESK = { width: 1440, height: 900 }
export const PHONE = { width: 390, height: 844 }
export const W2DIR = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w2'

/* ---- PASS / FAIL bookkeeping: every check is an assertion of the RIGHT behaviour ---------- */
export const RESULTS = []
export function check(id, ok, detail = '') {
  RESULTS.push({ id, ok: !!ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}${detail ? '  — ' + detail : ''}`)
  return !!ok
}
export function note(id, detail) { RESULTS.push({ id, ok: null, detail }); console.log(`NOTE  ${id}  — ${detail}`) }
export function summary(tag) {
  const f = RESULTS.filter(r => r.ok === false), p = RESULTS.filter(r => r.ok === true)
  console.log(`\n=== ${tag}: ${p.length} PASS, ${f.length} FAIL ===`)
  f.forEach(r => console.log('  FAIL ' + r.id + (r.detail ? ' — ' + r.detail : '')))
  return f.length
}

/* ---- the app's toasts: #toastEl has its text REPLACED per message and is only faded, so a
   MutationObserver records every message (am-lib's toastText looks for .toast / #toast and
   never sees it). Re-install after any reload. -------------------------------------------- */
export async function installToasts(page) {
  await page.evaluate(() => {
    window.__toasts = []
    const mo = new MutationObserver(muts => {
      const t = document.getElementById('toastEl'); if (!t) return
      if (muts.some(m => m.target === t || [...m.addedNodes].includes(t))) window.__toasts.push(t.textContent)
    })
    mo.observe(document.body, { subtree: true, childList: true })
  })
}
export async function takeToasts(page) {
  await page.waitForTimeout(120)
  return page.evaluate(() => { const a = window.__toasts || []; window.__toasts = []; return a })
}

/* ---- what the engine holds for one day (for the evidence table only) ---------------------- */
export async function bookDay(page, di) {
  return page.evaluate(i => {
    const S = window.SCHED, D = window.DAYS[i]
    const kd = k => { const m = String(k).match(/^(?:[a-z]+:)?(\d+)\./); return m ? +m[1] : -1 }
    const plan = (S.drafts && S.drafts[i]) ? S.drafts[i].map(x => x.name + ((S.curDraft && S.curDraft[i] === x.id) ? '*' : '')) : []
    return {
      ok: !!(S.dayOK || {})[i], cur: (S.cur || {})[i] || null,
      pending: Object.keys(S.pending || {}).filter(k => kd(k) === i),
      changes: Object.fromEntries(Object.entries(S.changes || {}).filter(([k]) => kd(k) === i)),
      sign: (S.sign || {})[i] || null, plans: plan,
      note0: D && D.notes && D.notes[0] != null ? String(D.notes[0].t ?? D.notes[0].text ?? D.notes[0]) : null,
      to0: D && D.waves && D.waves[0] && D.waves[0].formations && D.waves[0].formations[0] ? D.waves[0].formations[0].to : null,
      retired: Object.keys(S.retired || {}), correcting: (S.correcting || {})[i] || null,
    }
  }, di)
}

/* ---- the edit-week day head: what a person reads there ------------------------------------ */
export async function h(page, di) { return head(page, di) }

/* Scroll a day's head (or any element) so it sits just BELOW the sticky top bar — an element
   screenshot of a tall day otherwise has the bar painted over its head. Returns the element. */
export async function underBar(page, sel) {
  const el = page.locator(sel).first()
  await el.evaluate(e => {
    const bar = document.querySelector('.topbar'); const bb = bar ? bar.getBoundingClientRect().bottom : 0
    e.scrollIntoView({ block: 'start', inline: 'start' })
    const r = e.getBoundingClientRect(); window.scrollBy(0, r.top - bb - 8)
  })
  await page.waitForTimeout(250)
  return el
}
/* A picture of a region: the element's box (clamped to the viewport) plus padding. */
export async function clip(page, name, sel, { pad = 6, extraH = 0, minW = 0 } = {}) {
  const el = await underBar(page, sel)
  const b = await el.boundingBox()
  const vp = page.viewportSize()
  if (!b) { await page.screenshot({ path: `${process.env.HP_SHOTS}/${name}.png` }); return name + ' (NO BOX — whole screen)' }
  const x = Math.max(0, b.x - pad), y = Math.max(0, b.y - pad)
  const w = Math.min(vp.width - x, Math.max(minW, b.width + pad * 2)), hh = Math.min(vp.height - y, b.height + pad * 2 + extraH)
  await page.screenshot({ path: `${process.env.HP_SHOTS}/${name}.png`, clip: { x, y, width: w, height: hh } })
  return name
}
export async function screen(page, name) { await page.screenshot({ path: `${process.env.HP_SHOTS}/${name}.png` }); return name }

/* ---- the plans menu --------------------------------------------------------------------- */
export async function menu(page, di) {
  const items = await planMenuItems(page, di)
  const text = await page.evaluate(() => { const m = [...document.querySelectorAll('.wavemenu')].pop(); return m ? m.innerText.replace(/\s+/g, ' ').trim() : '' })
  return { items, text }
}
/* STRICT row pickers (host heads-up, 24 Sep 26): the LIVE row's caption names the issued version
   ("…differences from Original go out as AL1"), so a loose text match can tap the live row and the
   preview silently never opens. Each picker matches only its own KIND of row. */
async function pickRow(page, attrSel, re) {
  const it = page.locator(`.wavemenu .wm${attrSel}:visible`).filter({ hasText: re }).first()
  if (!(await it.count())) return false
  await it.click(); await page.waitForTimeout(700); return true
}
export const menuLook = (page, re) => pickRow(page, '[data-planpv]', re)        // an issued version — look only
export const menuSwitch = (page, re) => pickRow(page, '[data-plansel]', re)     // another plan — switch to it
export const menuLive = (page) => pickRow(page, '[data-plangolive]', /./)      // the live row — back to live
export const menuAlt = (page) => pickRow(page, '[data-plandup]', /Alt Plan/)   // + Alt Plan
export async function menuPick(page, re) {
  const it = page.locator('.wavemenu .wm:visible').filter({ hasText: re }).first()
  if (!(await it.count())) return false
  await it.click(); await page.waitForTimeout(700); return true
}
/* open the menu of day di (on the visible surface) and look at an issued version / switch plan */
export async function lookAt(page, di, re) { await planMenuItems(page, di); const ok = await menuLook(page, re); if (!ok) await menuClose(page); return ok }
export async function switchTo(page, di, re) { await planMenuItems(page, di); const ok = await menuSwitch(page, re); if (!ok) await menuClose(page); return ok }
export async function altPlan(page, di) { await planMenuItems(page, di); const ok = await menuAlt(page); if (!ok) await menuClose(page); return ok }
export async function menuClose(page) {
  if (await page.locator('.wavemenu').count()) { await page.mouse.click(5, (page.viewportSize().height) - 5); await page.waitForTimeout(300) }
}
/* the ✎ beside a plan row → the plan editor (DraftsModal) */
export async function planEdit(page, di, name) {
  await planMenuItems(page, di)
  /* the pencil's own title names its plan ("Rename or delete Plan B") — a row-by-text match would take
     the outer row and its FIRST pencil */
  const row = page.locator(`.wavemenu [data-planedit][title="Rename or delete ${name}"]`).first()
  await row.click(); await page.waitForTimeout(500)
  return page.locator('#draftsModal:not([hidden])').count()
}

/* ---- the preview bar on the week or the board -------------------------------------------- */
export async function pvBar(page, di) {
  return page.evaluate(i => {
    const onBoard = !!(document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth)
    const scope = onBoard ? document.querySelector('#schedBoard #sbWarn') || document.querySelector('#schedBoard') : document.querySelector(`#eWeek .day[data-day="${i}"]`)
    const bar = scope && [...scope.querySelectorAll('.dprev-bar')].find(b => b.offsetWidth || b.offsetHeight)
    if (!bar) return null
    const btn = s => { const b = bar.querySelector(s); return b ? b.innerText.trim() : null }
    return { surface: onBoard ? 'board' : 'week', text: bar.innerText.replace(/\s+/g, ' ').trim(),
      back: btn('[data-golive]'), load: btn('[data-restore]'), keep: btn('[data-restcancel]'), sw: btn('[data-draftgo]') }
  }, di)
}
/* tap a preview-bar button on the visible surface */
export async function pvTap(page, di, attr) {
  const onBoard = await page.locator('#schedBoard:visible').count()
  const sel = onBoard ? `#schedBoard [${attr}="${di}"]:visible` : `#eWeek .day[data-day="${di}"] [${attr}="${di}"]:visible`
  const b = page.locator(sel).first()
  if (!(await b.count())) return false
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await b.click(); await page.waitForTimeout(650); return true
}

/* ---- geometry: is a control inside the screen, un-covered, and clear of its neighbours ------ */
export async function audit(page, scopeSel, sels) {
  return page.evaluate(([scopeSel, sels]) => {
    const scope = document.querySelector(scopeSel); if (!scope) return { error: 'no scope ' + scopeSel }
    const vw = window.innerWidth, vh = window.innerHeight
    const items = []
    for (const s of sels) for (const e of scope.querySelectorAll(s)) {
      if (!(e.offsetWidth || e.offsetHeight)) continue
      const r = e.getBoundingClientRect()
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2
      const at = (cx >= 0 && cx < vw && cy >= 0 && cy < vh) ? document.elementFromPoint(cx, cy) : null
      items.push({ sel: s, text: (e.innerText || e.value || '').replace(/\s+/g, ' ').trim().slice(0, 28),
        x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height),
        inside: r.left >= -0.5 && r.right <= vw + 0.5, hit: !!at && (at === e || e.contains(at)),
        hitBy: at && !(at === e || e.contains(at)) ? (at.className || at.tagName).toString().slice(0, 30) : '' })
    }
    const over = []
    for (let a = 0; a < items.length; a++) for (let b = a + 1; b < items.length; b++) {
      const A = items[a], B = items[b]
      const ix = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x), iy = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y)
      if (ix > 1 && iy > 1) over.push(`${A.sel}[${A.text}] × ${B.sel}[${B.text}] (${ix}×${iy}px)`)
    }
    return { vw, items, over }
  }, [scopeSel, sels])
}

/* ---- the view page ---------------------------------------------------------------------- */
export async function viewDay(page, di) {
  return page.evaluate(i => {
    const s = document.querySelector(`#vWeek .day[data-day="${i}"]`)
    if (!s) return null
    const sel = s.querySelector('select[data-vwork], select[data-dver]')
    return {
      cls: s.className, tag: s.querySelector('.verchip')?.innerText || '', nys: !!s.querySelector('.nysmark'),
      pend: s.querySelector('.dpend')?.innerText || '', stamp: [...s.querySelectorAll('.dbeak')].map(b => b.innerText.trim() + (b.className.includes('work') ? '[work]' : '')).join('|'),
      picker: sel ? { attr: sel.hasAttribute('data-vwork') ? 'vwork' : 'dver', opts: [...sel.options].map(o => (o.selected ? '*' : '') + o.text) } : null,
      bar: [...s.querySelectorAll('.dprev-bar')].map(b => b.innerText.replace(/\s+/g, ' ').trim()).join(' / '),
      barBtns: [...s.querySelectorAll('.dprev-bar button')].map(b => b.innerText.trim()),
      warnList: !!s.querySelector('.dwbox, .daywarn'), rings: s.querySelectorAll('.boxred, .boxdash, .boxdot').length,
      alp: s.querySelectorAll('[data-alp]').length, alc: [...s.querySelectorAll('[data-alc]')].filter(e => !e.classList.contains('verchip')).length,
      /* real write doors only — a view-page live render keeps data-slot on its seats (as every draft
         day there does); whether a seat is inert is proven by tapping it (seatInert below) */
      writers: s.querySelectorAll('[contenteditable="true"],[data-planmenu],[data-unpub],[data-alpub],[data-beak],[data-restore],select[data-sign],[data-acc],.dhbtn,[data-drag],[data-fill]').length,
      slots: s.querySelectorAll('[data-slot]').length,
      to0: (s.querySelector('.go .form .fcell.bto span') || {}).innerText || '',
    }
  }, di)
}
/* tap and right-click the first filled seat inside `scopeSel`: nothing may arm, nothing may change */
export async function seatInert(page, scopeSel) {
  const before = await page.evaluate(() => JSON.stringify(window.DAYS))
  const seat = page.locator(`${scopeSel} .seat .puck`).first()
  if (!(await seat.count())) return { ok: false, why: 'no filled seat' }
  await seat.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await seat.click({ force: true }); await page.waitForTimeout(250)
  const armed = await page.evaluate(() => !!(window.ARM && window.ARM.key))
  await seat.click({ button: 'right', force: true }); await page.waitForTimeout(350)
  const after = await page.evaluate(() => JSON.stringify(window.DAYS))
  await page.keyboard.press('Escape'); await page.mouse.click(3, 300); await page.waitForTimeout(200)
  return { ok: !armed && before === after, armed, changed: before !== after }
}
export async function viewPick(page, di, value) {
  const sel = page.locator(`#vWeek select[data-vwork="${di}"]:visible, #vWeek select[data-dver="${di}"]:visible`).first()
  if (!(await sel.count())) return false
  await sel.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await sel.selectOption(value); await page.waitForTimeout(600); return true
}

/* the top bar's Undo label — to prove an action added (or did not add) an undo step */
export async function undoLabel(page) {
  return page.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? (b.disabled ? 'DISABLED ' : '') + b.title : 'NO UNDO BUTTON' })
}
/* the Amendments panel's text (desktop edit page) */
export async function panelText(page) {
  return page.evaluate(() => { const p = document.querySelector('#alPanel'); return p ? (p.offsetWidth ? '' : '[hidden] ') + p.innerText.replace(/\s+/g, ' ').trim() : 'NO PANEL' })
}
/* the ⓘ day panel, opened from the edit week's or view page's i-button */
export async function dayInfo(page, di, pageSel = '#eWeek') {
  const b = page.locator(`${pageSel} .dinfobtn[data-dayinfo="${di}"]:visible`).first()
  if (!(await b.count())) return 'NO i BUTTON'
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await b.click(); await page.waitForTimeout(600)
  const t = await page.evaluate(() => { const m = document.querySelector('#dayPop'); return m ? m.innerText.replace(/\s+/g, ' ').trim() : 'NO PANEL' })
  await page.mouse.click(4, 300); await page.waitForTimeout(300)
  if (await page.locator('#dayPop:visible').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(200) }
  return t
}
export { go }
