/* W2 walker's shared helpers (12 Nov 26) — prefix rcf-w2. Env must be set by the caller BEFORE this is imported. */
import { existsSync, mkdirSync, writeFileSync, appendFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
const L = await import('../lib.mjs')
export { L }
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const results = []
export const check = (id, verdict, saw, pic = '') => {
  results.push({ id, verdict, saw, pic })
  console.log(`${verdict}  ${id}  ${saw}${pic ? '  [' + pic + ']' : ''}`)
}
export const PASSIF = (id, ok, saw, pic) => check(id, ok ? 'PASS' : 'FAIL', saw, pic)
export const errorsAll = []

export async function launch() {
  return chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
}
/* a NEW browser context with real storage, signed in. phone => 402x874 dsf3 mobile touch */
export async function world(browser, { phone = false, who = 'a' } = {}) {
  const vp = phone ? { width: 402, height: 874 } : { width: 1536, height: 864 }
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: phone ? 3 : 1, ...(phone ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  const tag = (phone ? 'P' : 'D')
  page.on('console', m => { if (m.type() === 'error') errorsAll.push(`${tag}: ${m.text()}`) })
  page.on('pageerror', e => errorsAll.push(`${tag}: PAGEERROR ${e.message}`))
  page.on('response', r => { if (r.status() >= 400) errorsAll.push(`${tag}: HTTP ${r.status()} ${r.url()}`) })
  await page.goto(L.BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await L.login(page, who)
  page.__phone = phone
  return { ctx, page }
}
export const shot = (page, name, locator) => L.shot(page, name, locator).then(() => name + '.png')
/* press: phone => a real touch tap */
export async function press(page, sel, n = 0) {
  if (!page.__phone) return L.tap(page, sel, n)
  const inBoard = await page.locator('#schedBoard').count()
  const el = page.locator(inBoard ? L.B(sel) : L.V(sel)).nth(n)
  await el.waitFor({ state: 'visible', timeout: 8000 })
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await sleep(120)
  try { await el.tap({ timeout: 2500 }) } catch { const b = await el.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2) }
  await sleep(260)
}
export const bfldSel = k => `[data-bfld="${k}"]`
/* type a board field, commit with blur */
export async function setF(page, key, val) { await L.type(page, bfldSel(key), val) }
export async function pid(page, cs) {
  return page.evaluate(c => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === c), cs)
}
export async function openBoard(page, di) { await L.board(page, di); await sleep(300) }
export async function closeBoard(page) { await L.closeBoard(page) }
/* add a flying wave (kind '' = flying), returns its index */
export async function addWave(page, di, kind = '') {
  const before = await page.evaluate(d => window.DAYS[d].waves.length, di)
  await press(page, `[data-wvadd="${di}"]`)
  await page.locator(`.wavemenu [data-wmkind="${kind}"]`).first().click()
  await sleep(500)
  const after = await page.evaluate(d => window.DAYS[d].waves.length, di)
  return after > before ? after - 1 : -1
}
export async function addGround(page, di) {
  const before = await page.evaluate(d => window.DAYS[d].ground.length, di)
  await press(page, `[data-gradd="${di}"]`)
  await sleep(400)
  const after = await page.evaluate(d => window.DAYS[d].ground.length, di)
  return after > before ? after - 1 : -1
}
/* the day's warning list as the board draws it: [{ix, hid, text, btn}] and the head */
export async function warnList(page) {
  return page.evaluate(() => {
    const box = document.querySelector('#schedBoard .sb-warn')
    if (!box) return { head: null, lines: [] }
    const vis = e => e.getBoundingClientRect().width > 0
    const head = (box.querySelector('.wh') || {}).innerText || ''
    const lines = [...box.querySelectorAll('.wln[data-wix]')].filter(vis).map(e => {
      const t = e.querySelector('.wln-t'), b = e.querySelector('button.wln-mute')
      return { cls: String(e.className).replace(/\s+/g, ' '), ix: +e.dataset.wix, hid: e.classList.contains('hid'), struck: t ? getComputedStyle(t).textDecorationLine.includes('line-through') : false,
        text: ((t || e).innerText || '').replace(/\s+/g, ' ').replace(/ /g, ' ').trim(), btn: b ? (b.querySelector('svg.wmuteico') ? 'reset' : b.innerText.trim()) : '' }
    })
    return { head: head.replace(/\s+/g, ' ').trim(), lines }
  })
}
/* open the board's warning fold on a phone */
export async function openWarnFold(page) {
  if (!page.__phone) return
  const open = await page.locator('#schedBoard .sbwrap').first().evaluate(e => e.classList.contains('open')).catch(() => true)
  if (!open) { await press(page, '[data-sbwtog]'); await sleep(300) }
}
/* hide / reset the warning line with ix on the open board */
export async function hideIx(page, di, ix) { await press(page, `[data-woff="${di}.${ix}"]`); await sleep(300) }
/* a man's puck rings on the board (excluding the roster) */
export async function ring(page, id, scope = '#schedBoard') {
  return page.evaluate(([s, who]) => [...document.querySelectorAll(`${s} .puck[data-person="${who}"]`)]
    .filter(e => e.offsetParent !== null && !e.closest('#sbRoster') && !e.closest('#eRoster'))
    .map(e => ({ warn: e.classList.contains('warn'), cls: e.className.replace(/\s+/g, ' ').slice(0, 80), where: (e.closest('[data-slot]') || {}).dataset ? (e.closest('[data-slot]') || {}).dataset.slot : '', chip: !!e.querySelector('.lchip'), shadow: getComputedStyle(e).boxShadow.slice(0, 40) })), [scope, id])
}
export function writeReport(path, header, rows) {
  const lines = [header, '', '| scenario | what I did | verdict | what the screen showed | pictures |', '|---|---|---|---|---|']
  for (const r of rows) lines.push(`| ${r.id} | ${r.did || ''} | ${r.verdict} | ${String(r.saw).replace(/\|/g, '/').replace(/\n/g, ' ')} | ${r.pic || ''} |`)
  writeFileSync(path, lines.join('\n') + '\n')
}
