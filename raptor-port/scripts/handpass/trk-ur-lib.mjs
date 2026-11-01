/* The Tracker plain-user round's driver (D1557, D1558 — 2 Nov 26).
   Drives the BUILT bundle as a person does: sign in, the Tracker by its tab (the drawer on a phone), its own controls.
   Desktop: Chromium at 1536 wide. Phone: WebKit at 402x874 with touch (his iPhone's size).
   Reads the store only to CHECK what a screen claims (window.__coreForTests), never to set anything up.
     UR_URL    the preview (default http://localhost:4241 — the build of main)
     UR_SHOTS  the picture folder (default docs/img/handpass/2026-11-02-tracker-user-round/<UR_TAG>)
     UR_TAG    a sub-folder per run (desk-admin, phone-member, before-603 ...) */
import { mkdirSync, writeFileSync, appendFileSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, webkit } from '@playwright/test'

const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '..', '..')
export const BASE = process.env.UR_URL || 'http://localhost:4241'
export const TAG = process.env.UR_TAG || 'run'
export const SHOTS = process.env.UR_SHOTS || resolve(ROOT, 'docs/img/handpass/2026-11-02-tracker-user-round', TAG)
{ const h = new URL(BASE).hostname; if (!['localhost', '127.0.0.1'].includes(h)) throw new Error('UR_URL must be localhost') }

export const DESK = { width: 1536, height: 864 }
export const PHONE = { width: 402, height: 874 }

let LOG = null
export function log(...a) {
  const line = a.map(x => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')
  console.log(line)
  if (LOG) appendFileSync(LOG, line + '\n')
}

export async function open({ phone = false, who = 'a', storageState = null } = {}) {
  rmSync(SHOTS, { recursive: true, force: true }); mkdirSync(SHOTS, { recursive: true })
  LOG = resolve(SHOTS, '_log.txt')
  const engine = phone ? webkit : chromium
  const browser = await engine.launch({ headless: true })
  const ctx = await browser.newContext({
    viewport: phone ? PHONE : DESK,
    ...(phone ? { hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : {}),
    ...(storageState ? { storageState } : {}),
    acceptDownloads: true,
  })
  /* desktop Chrome's own save-as window cannot be driven headless: take it away so Export uses the download path (the iPhone's path) */
  if (!phone && process.env.UR_NO_SAVEPICKER !== '0') await ctx.addInitScript(() => { try { delete window.showSaveFilePicker; window.showSaveFilePicker = undefined; delete window.showOpenFilePicker; window.showOpenFilePicker = undefined } catch (e) {} })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  page.on('dialog', d => { errors.push('NATIVE DIALOG ' + d.type() + ': ' + d.message()); d.dismiss().catch(() => {}) })
  await page.goto(BASE + '/')
  await login(page, who)
  return { browser, ctx, page, errors, phone }
}

export async function login(page, who = 'a') {
  await page.waitForSelector('#luser')
  await page.fill('#luser', who === 'a' ? 'ad' : 'us')
  await page.fill('#lpass', who === 'a' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(400)
}

export async function toTracker(page) {
  const tab = page.locator('#topnav a[data-page="tracker"]:visible')
  if (await tab.count()) await tab.click()
  else {
    await page.click('#burger')
    await page.waitForTimeout(300)
    await page.locator('#drawer a[data-page="tracker"]').first().click()
  }
  await page.waitForFunction(() => window.CURPAGE === 'tracker')
  await page.waitForSelector('#flowSvg .ball', { timeout: 20000, state: 'attached' })
  await page.waitForTimeout(500)
}

export async function toPage(page, id) {
  const tab = page.locator(`#topnav a[data-page="${id}"]:visible`)
  if (await tab.count()) await tab.click()
  else {
    await page.click('#burger')
    await page.waitForTimeout(300)
    await page.locator(`#drawer a[data-page="${id}"]`).first().click()
  }
  await page.waitForFunction(p => window.CURPAGE === p, id)
  await page.waitForTimeout(400)
}

let N = 0
export async function shot(page, name, opts = {}) {
  N++
  const file = resolve(SHOTS, `${String(N).padStart(2, '0')}-${name}.png`)
  if (opts.el) await page.locator(opts.el).first().screenshot({ path: file }).catch(async () => page.screenshot({ path: file }))
  else await page.screenshot({ path: file, fullPage: !!opts.full })
  return file
}

/* a tap (phone) or click (desk), with a picture straight after it (D1281) and a settled one */
export async function press(page, phone, sel, name, { settle = 350, pos = null } = {}) {
  const loc = typeof sel === 'string' ? page.locator(sel).first() : sel
  await loc.scrollIntoViewIfNeeded().catch(() => {})
  try {
    if (phone) await loc.tap({ timeout: 5000, ...(pos ? { position: pos } : {}) })
    else await loc.click({ timeout: 5000, ...(pos ? { position: pos } : {}) })
  } catch (e) {
    const why = (e.message.match(/(<[^>]+> intercepts pointer events|element is not enabled|element is not visible|waiting for [^\n]+)/) || [])[0] || e.message.split('\n')[0]
    throw new Error('could not press ' + (typeof sel === 'string' ? sel : 'element') + ': ' + why)
  }
  if (phone && name) await shot(page, name + '-tap')
  await page.waitForTimeout(settle)
  if (name) await shot(page, name)
}

export async function core(page, fn, arg) {
  return page.evaluate(({ src, arg }) => {
    const c = window.__coreForTests
    if (!c) return { __err: 'no __coreForTests' }
    return new Function('c', 'arg', 'return (' + src + ')(c, arg)')(c, arg)
  }, { src: fn.toString(), arg })
}

export const vis = async (page, sel) => page.locator(sel).first().isVisible().catch(() => false)

const RESULTS = []
export function check(id, ok, note) {
  RESULTS.push({ id, ok: ok === null ? 'NOT WALKED' : ok ? 'PASS' : 'FAIL', note })
  log((ok === null ? 'NOT WALKED' : ok ? 'PASS' : 'FAIL') + ' ' + id + ' — ' + note)
}
export function finish(errors) {
  writeFileSync(resolve(SHOTS, '_results.json'), JSON.stringify({ results: RESULTS, errors }, null, 2))
  const f = RESULTS.filter(r => r.ok === 'FAIL').length, p = RESULTS.filter(r => r.ok === 'PASS').length
  log(`== ${TAG}: ${p} PASS, ${f} FAIL, ${RESULTS.length - p - f} not walked; page errors: ${errors.length}`)
  for (const e of errors) log('  ERR ' + e.slice(0, 300))
}
