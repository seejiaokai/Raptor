// The night of 24 Nov 26, job 4: the walk's shared helpers, on top of the walks of chats 149-151 (../../n150/walk/vlib.mjs).
// Every step presses the app's own controls; the page is read for facts only. The build is served FROZEN by the check
// lead on MQ_PORT (never started or stopped here), so a script ending cannot take the server away from another walker.
// Run from raptor-port/:
//   MQ_PORT=<4711|4712|4713> MQ_OUT=<a scratch folder> MQ_PICS=../2026-11-24-msq-night-check/<walker> node scripts/handpass/n153/walk/<script>
// Pictures land in docs/handpass/2026-11-24-msq-night-check/<walker>/<run>/.
import { chromium, webkit } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import {
  signIn, note, errs, facts, save, as, logout, adminCat, openRow, lineBtn, PICS_ROOT, picsFor, shots, pic, step, press,
  state, rec, openMenu, closeMenuOutside, menuPick, barPick, go, admCat, grant,
} from '../../n150/walk/vlib.mjs'
export {
  signIn, note, errs, facts, save, as, logout, adminCat, openRow, lineBtn, PICS_ROOT, picsFor, shots, pic, step, press,
  state, rec, openMenu, closeMenuOutside, menuPick, barPick, go, admCat, grant,
}

if (!process.env.MQ_PORT || !process.env.MQ_OUT || !process.env.MQ_PICS) throw new Error('set MQ_PORT, MQ_OUT and MQ_PICS')

const SIZES = {
  d: { engine: chromium, desk: true, opts: { viewport: { width: 1536, height: 864 } } },
  p: { engine: webkit, desk: false, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
  /* a phone's size in Chromium: real touch input over CDP, and a second engine's drawing of a control */
  pc: { engine: chromium, desk: false, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}
const browsers = {}
export async function newPage(sz, ctxOpts = {}) {
  const S = SIZES[sz]
  const key = S.engine === webkit ? 'wk' : 'cr'
  if (!browsers[key]) browsers[key] = await S.engine.launch()
  const ctx = await browsers[key].newContext({ ...S.opts, ...ctxOpts })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`[${sz}] PAGEERROR ${e}`))
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${sz}] CONSOLE ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`[${sz}] ${r.status()} ${r.url()}`) })
  page.on('dialog', d => { note(`[${sz}] DIALOG ${d.type()}: ${d.message()}`); d.accept().catch(() => {}) })
  return { ctx, page, sz, desk: S.desk }
}
/* the browsers only: the frozen server stays up for the other walkers */
export async function closeAll() { for (const b of Object.values(browsers)) await b.close().catch(() => {}) }
export function finish(name) {
  save(name)
  writeFileSync(`${process.env.MQ_OUT}/${name}-shots.json`, JSON.stringify(shots, null, 1))
  console.log('errs', errs.length, JSON.stringify(errs.slice(0, 20), null, 1))
}

export const checks = []
/* a check of the RIGHT behaviour: PASS means correct; the value judged is printed beside it */
export function check(name, ok, seen) {
  const v = ok ? 'PASS' : 'FAIL'
  checks.push({ name, v, seen }); facts[`check:${name}`] = { v, seen }
  note(`${v} ${name} - seen: ${typeof seen === 'string' ? seen : JSON.stringify(seen)}`)
  return ok
}

/* ---- the Tracker ---- */
export const vclick = (s, sel) => s.page.locator(sel).filter({ visible: true }).first().click()
/* a new test event made in the chart's layout editor by presses: an unsaved chart edit */
export async function addEvent(s, name) {
  await go(s, 'tracker'); await s.page.waitForTimeout(1800)
  await vclick(s, '#sylMenuBtn'); await vclick(s, '#arrangeBtn'); await s.page.waitForTimeout(300)
  const add = s.page.locator('#arrTools button', { hasText: '+ Test' }).first()
  if (!(await add.isVisible())) await s.page.locator('#page-tracker button', { hasText: 'Tools ▾' }).first().click()
  await add.click(); await s.page.waitForSelector('#dlgInput:visible')
  await s.page.locator('#dlgInput:visible').first().fill(name)
  await vclick(s, '#dlgOk'); await s.page.waitForTimeout(400)
  await vclick(s, '#sylMenuBtn'); await vclick(s, '#arrangeBtn'); await s.page.waitForTimeout(400)
  return hasEv(s, name)
}
export const hasEv = (s, name) => s.page.evaluate(n => (document.querySelector('#page-tracker') || document.body).innerText.includes(n), name)
/* the question box as drawn: its words and its buttons */
export const ask = s => s.page.evaluate(() => {
  const m = document.querySelector('#dlgMsg'); const d = document.querySelector('#dlgModal')
  return { msg: m && m.getBoundingClientRect().width > 0 ? m.textContent.trim() : null, btns: d ? [...d.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => `${b.id}:${b.textContent.trim()}`) : [] }
})
export const trkHead = s => s.page.evaluate(() => { const p = document.querySelector('#page-tracker'); return p ? p.innerText.replace(/\s+/g, ' ').trim().slice(0, 240) : null })
/* a pick by the size's own door: the top bar's list on a desktop, the ☰ menu's on a phone; the menu shut after */
export async function pickSq(s, num, name) {
  const ok = s.desk ? await barPick(s, num, name) : await menuPick(s, num, name)
  await s.page.waitForTimeout(500)
  return ok
}
export async function shut(s) { for (let i = 0; i < 3 && (await state(s)).drawerOpen; i++) await closeMenuOutside(s) }
