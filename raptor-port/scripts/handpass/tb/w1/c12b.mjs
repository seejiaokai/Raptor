import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
import * as F from './fx.mjs'
const { L } = F
console.log('w1 c12b v1 (real storage: admin builds the fixture, then the same browser reopens as the member)')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const ok = (id, expected, saw, pass) => L.row('W1', id, expected, typeof saw === 'string' ? saw : JSON.stringify(saw), pass ? 'PASS' : 'FAIL')
async function login(page, who) {
  await page.waitForSelector('#luser', { timeout: 15000 })
  await page.fill('#luser', who[0]); await page.fill('#lpass', who[1])
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await L.sleep(500)
}
for (const size of ['phone', 'desk']) {
  const S = L.SIZES[size]
  const browser = await chromium.launch({ headless: true, ...launchOptions })
  const ctx = await browser.newContext({ viewport: { width: S.w, height: S.h }, deviceScaleFactor: S.dpr, ...(S.phone ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e.message)))
  const w = { page, S, phone: S.phone, key: size, errors, ctx, browser, press: async sel => { const l = page.locator(sel).first(); if (S.phone) await l.tap(); else await l.click() } }
  try {
    await page.goto(L.BASE + '/')   // real storage, not the start-fresh address
    await login(page, ['ad', 'a'])
    await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
    const crew = await F.publishSat(w, { crew: true })
    await F.toWar(w)
    const set = await page.evaluate(d => [window.lwSetCell('plasma', d, 'LL'), window.lwSetCell('bane', d, 'OL')], F.SAT)
    await L.sleep(1000)
    const adminSees = await page.evaluate(() => document.querySelectorAll('[data-testid="sync-clashes"]').length)
    console.log(size, 'admin built fixture; set', JSON.stringify(set), 'admin sees note elements', adminSees)
    // reopen as the member in the same browser (same storage)
    await page.goto(L.BASE + '/'); await L.sleep(800)
    const loginShown = await page.locator('#luser').count()
    console.log('login shown after reload:', loginShown)
    if (!loginShown) { console.log('NO LOGIN CARD after reload — cannot sign in as member this way'); ok(`C12 ${size}`, 'a member sees no clash note at all', 'NOT WALKED: no login card after reload', false); continue }
    await login(page, ['us', 'us'])
    await F.toWar(w)
    await F.openMonth(w)
    const facts = await page.evaluate(d => ({
      cells: ['plasma', 'bane'].map(id => { const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`); return [id, c ? (c.innerText || '').replace(/\s+/g, ' ').trim() : 'NO CELL'] }),
      day5: (() => { try { const g = window.signOf(5); return { appr: g.appr } } catch (e) { return String(e) } })(),
      viewing: (document.querySelector('[data-testid="lw-viewing"]') || {}).textContent,
      note: document.querySelectorAll('[data-testid="sync-clashes"]').length, line: document.querySelectorAll('[data-testid="clash-line"]').length,
      words: /clash(es)? with the schedule/.test(document.querySelector('#page-leavewar').innerText) }), F.SAT)
    console.log(size, 'member world', JSON.stringify(facts))
    await L.pic(w, `c12-${size}-member-no-note`)
    const landed = facts.cells.every(c => /!/.test(c[1]))
    ok(`C12 ${size}`, 'a member sees no clash note at all', { signedInAs: facts.viewing, fixtureLanded: { cells: facts.cells, day5: facts.day5 }, noteElements: facts.note, clashWords: facts.words, adminSawNoteInBuild: adminSees }, !!landed && facts.note === 0 && !facts.words)
  } finally { await L.close(w) }
}
