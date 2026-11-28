// Walk of D2381–D2384 (23 Nov 26): a squadron he only views, and the ☰ menu's squadron drop-down — shared helpers, on
// top of the batch-1 walk's own (../../n149/walk/lib.mjs, w1-view.mjs, ../../n149/rewalk/rlib.mjs). Every step presses
// the app's own controls; the page is read for facts only, never changed.
// Run from raptor-port/ with the build in dist/: MQ_PORT=4478 MQ_OUT=<scratch> node scripts/handpass/n150/walk/<script>
import { chromium } from '@playwright/test'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { SIZES, serve, stop, newPage, signIn, note, errs, facts, save } from '../../n149/walk/lib.mjs'
import { adminCat, openRow, lineBtn } from '../../n149/walk/w1-view.mjs'
import { as, logout } from '../../n149/rewalk/rlib.mjs'
export { serve, stop, newPage, signIn, note, errs, facts, save, as, logout, adminCat, openRow, lineBtn }

SIZES.n = { engine: chromium, desk: true, opts: { viewport: { width: 820, height: 864 } } }
const HERE = dirname(fileURLToPath(import.meta.url))
/* MQ_PICS names a sub-folder for a re-walk (chat 151: `rewalk`), so the first walk's pictures — the faults' evidence —
   are never overwritten (bug-check order §5, the re-walk) */
export const PICS_ROOT = resolve(HERE, '../../../../docs/handpass/2026-11-23-msq-view-only-menu', process.env.MQ_PICS || '.')
export let PICS = PICS_ROOT
/* one run, one folder: the script's own sub-folder, emptied at its start */
export function picsFor(name) {
  PICS = `${PICS_ROOT}/${name}`
  rmSync(PICS, { recursive: true, force: true }); mkdirSync(PICS, { recursive: true })
  return PICS
}
export const shots = []
export async function pic(s, file, sels, pad = 14) {
  const { page } = s
  if (s.desk) await page.mouse.move(1, 1).catch(() => {})
  await page.waitForTimeout(120)
  let clip
  if (sels) {
    const r = await page.evaluate(sels => {
      let L = 1e9, T = 1e9, R = -1e9, B = -1e9
      for (const sel of sels) for (const e of document.querySelectorAll(sel)) {
        const b = e.getBoundingClientRect(); if (!(b.width > 0 && b.height > 0)) continue
        L = Math.min(L, b.left); T = Math.min(T, b.top); R = Math.max(R, b.right); B = Math.max(B, b.bottom)
      }
      return L < 1e9 ? { L, T, R, B, W: innerWidth, H: innerHeight } : null
    }, sels)
    if (r) { const x = Math.max(0, r.L - pad), y = Math.max(0, r.T - pad); clip = { x, y, width: Math.max(10, Math.min(r.W, r.R + pad) - x), height: Math.max(10, Math.min(r.H, r.B + pad) - y) } }
  }
  await page.screenshot({ path: `${PICS}/${file}.png`, ...(clip ? { clip } : {}) })
  shots.push(file)
}
export async function step(name, fn) {
  note(`--- ${name}`)
  try { await fn() } catch (e) { const m = String(e).split('\n')[0]; note(`STEP FAILED ${name}: ${m}`); facts[`fail:${name}`] = m }
}
/* a press as a person makes it: a finger on the phone, with a picture ~60 ms after the lift; a mouse on a desktop */
export async function press(s, sel, name) {
  const l = typeof sel === 'string' ? s.page.locator(sel).filter({ visible: true }).first() : sel
  if (!(await l.count())) { note(`[${s.sz}] no control ${sel}`); return false }
  if (s.desk) await l.click(); else await l.tap()
  if (!s.desk && name) { await s.page.waitForTimeout(60); await s.page.screenshot({ path: `${PICS}/${name}-justtapped.png` }); shots.push(`${name}-justtapped`) }
  await s.page.waitForTimeout(500)
  return true
}
/* everything a person sees of the squadron and the pages, read from the drawn elements */
export const state = s => s.page.evaluate(() => {
  const shown = e => { if (!e) return false; const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return b.width > 1 && b.height > 1 && cs.visibility !== 'hidden' && cs.display !== 'none' }
  const t = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null
  const drawer = document.querySelector('#drawer')
  const dOpen = !!drawer && drawer.classList.contains('open')
  const barMark = [...document.querySelectorAll('.topbar .mark')].find(shown)
  const dl = document.querySelector('#drawerSqnList')
  const tl = document.querySelector('#sqnMenu')
  return {
    page: document.querySelector('.page.on')?.id || null,
    barMark: t(barMark), barBtn: shown(document.querySelector('#sqnMenuBtn')),
    tabs: [...document.querySelectorAll('#topnav a[data-page]')].filter(shown).map(a => a.dataset.page),
    burger: shown(document.querySelector('#burger')),
    drawerOpen: dOpen,
    dMark: t(document.querySelector('.drawer-sqn .mark')), dBtn: !!document.querySelector('#drawerSqnBtn'),
    dBtnExpanded: document.querySelector('#drawerSqnBtn')?.getAttribute('aria-expanded') ?? null,
    dLine: t(document.querySelector('#drawerSqnLine')),
    dCaret: (() => { const k = document.querySelector('.drawer-sqn .mark .k'); return k ? getComputedStyle(k, '::after').content : null })(),
    /* where the list's first row is drawn, and whether a person can see it (its middle inside the screen) */
    dListAt: (() => { const r = dl && dl.querySelector('.sqm-row'); if (!r) return null; const b = r.getBoundingClientRect(); return { top: Math.round(b.top), inView: b.top + b.height / 2 < innerHeight && b.bottom > 0, panelScroll: Math.round(document.querySelector('#drawer .drawer-panel').scrollTop) } })(),
    docScroll: Math.round((document.scrollingElement || document.documentElement).scrollTop),
    dList: dl ? [...dl.querySelectorAll('.sqm-row')].map(r => `${r.getAttribute('aria-checked') === 'true' ? '✓' : ''}${t(r.querySelector('.sqm-num'))} ${t(r.querySelector('.sqm-lbl'))}`) : null,
    topList: tl ? [...tl.querySelectorAll('.sqm-row')].map(r => `${r.getAttribute('aria-checked') === 'true' ? '✓' : ''}${t(r.querySelector('.sqm-num'))} ${t(r.querySelector('.sqm-lbl'))}`) : null,
    items: [...document.querySelectorAll('#drawerNav a[data-page]')].map(a => a.dataset.page),
    acct: t(document.querySelector('#drawerAcct')), role: t(document.querySelector('#drawerRole')),
    badge: t([...document.querySelectorAll('#roleBadge')].find(shown)),
    bell: shown(document.querySelector('#notifyBell')), insights: shown(document.querySelector('#insightBtn')), logout: shown(document.querySelector('#logout')),
    waitBadge: t([...document.querySelectorAll('#admWaitBadge, #drawerWaitBadge')].find(shown)),
    focus: (() => { const a = document.activeElement; return a ? `${a.tagName.toLowerCase()}${a.id ? '#' + a.id : ''}${a.dataset?.page ? '[' + a.dataset.page + ']' : ''}${a.dataset?.unit ? '[' + a.dataset.unit + ']' : ''}` : null })(),
    dlg: t([...document.querySelectorAll('#dlgModal')].find(shown)),
  }
})
export async function rec(s, key) { const v = await state(s); facts[key] = v; note(`${key}: ${JSON.stringify(v)}`); return v }

/* the ☰ menu */
export const openMenu = (s, name) => press(s, '#burger', name)
export async function closeMenuOutside(s, name) {
  const { page } = s; const W = page.viewportSize().width
  if (s.desk) await page.mouse.click(W - 8, 500); else await page.touchscreen.tap(W - 8, 500)
  if (!s.desk && name) { await page.waitForTimeout(60); await page.screenshot({ path: `${PICS}/${name}-justtapped.png` }); shots.push(`${name}-justtapped`) }
  await page.waitForTimeout(450)
}
/* a pick inside the ☰ menu: the mark, then the row */
export async function menuPick(s, unitNum, name) {
  const st = await state(s)
  if (!st.drawerOpen) await openMenu(s)
  if (!(await s.page.locator('#drawerSqnList').count())) await press(s, '#drawerSqnBtn', name && `${name}-mark`)
  const row = s.page.locator('#drawerSqnList .sqm-row', { has: s.page.locator('.sqm-num', { hasText: new RegExp(`^${unitNum}$`) }) })
  if (!(await row.count())) { note(`[${s.sz}] no row ${unitNum} in the menu's list`); return false }
  return press(s, row.first(), name && `${name}-row`)
}
/* a pick in the top bar's Schedules list */
export async function barPick(s, unitNum, name) {
  await press(s, '#sqnMenuBtn', name && `${name}-btn`)
  const row = s.page.locator('#sqnMenu .sqm-row', { has: s.page.locator('.sqm-num', { hasText: new RegExp(`^${unitNum}$`) }) })
  if (!(await row.count())) { note(`[${s.sz}] no row ${unitNum} in the bar's list`); await s.page.keyboard.press('Escape'); return false }
  return press(s, row.first(), name && `${name}-row`)
}
/* a page by its name: the top bar's tab where it is drawn, else the ☰ menu's line */
export async function go(s, page, name) {
  const tab = s.page.locator(`#topnav a[data-page="${page}"]`).filter({ visible: true })
  if (await tab.count()) return press(s, tab.first(), name)
  const st = await state(s)
  if (!st.drawerOpen) await openMenu(s)
  const a = s.page.locator(`#drawerNav a[data-page="${page}"]`)
  if (!(await a.count())) { note(`[${s.sz}] page ${page} not offered`); return false }
  return press(s, a.first(), name)
}
/* Saber's door: Admin → Users, a person's row, one access line, Save (pressed as a person does) */
export async function admCat(s, label) {
  const { page } = s
  await go(s, 'admin')
  if (await page.locator('.adm-back:visible').count()) { await page.locator('.adm-back:visible').first().click(); await page.waitForTimeout(400) }
  const c = page.locator('#page-admin button.adm-cat', { has: page.locator('.adm-cat-l', { hasText: new RegExp(`^${label}`) }) })
  if (!(await c.count())) { note(`[${s.sz}] no admin tile ${label}`); return false }
  await c.first().click(); await page.waitForTimeout(700); return true
}
export async function grant(s, pid, unitNum, line) {
  await admCat(s, 'Users'); await openRow(s, pid)
  const b = s.page.locator(lineBtn(unitNum, line))
  if (!(await b.count())) { note(`grant: no ${line} for ${unitNum} on ${pid}`); return false }
  if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click()
  await s.page.waitForTimeout(200)
  await s.page.locator('#accEdSave').click(); await s.page.waitForTimeout(700)
  note(`granted ${pid} ${line} of ${unitNum}`)
  return true
}
export async function makeSquadron(s, num) {
  const { page } = s
  if (!(await page.locator('#sqNew').filter({ visible: true }).count())) await admCat(s, 'Squadrons')
  await page.locator('#sqNew').filter({ visible: true }).first().click(); await page.waitForTimeout(300)
  await page.fill('#sqNewNum', String(num))
  await page.selectOption('#sqNewAdmin', { label: 'Hunter · 142' }).catch(() => {})
  await page.locator('#sqNewSave').click(); await page.waitForTimeout(500)
}
export function finish(name) {
  save(name)
  writeFileSync(`${process.env.MQ_OUT}/${name}-shots.json`, JSON.stringify(shots, null, 1))
  console.log('errs', errs.length, JSON.stringify(errs.slice(0, 20), null, 1))
}
