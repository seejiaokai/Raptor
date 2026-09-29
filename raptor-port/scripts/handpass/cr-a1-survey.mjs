/* [HUMAN-RETEST] change-recording re-test, Walker A1 — a survey of the fresh demo world (28 Sep 26).
   Reads what is published, where the OIL Earn door is drawn, and the controls a later walk will press.
   Writes nothing to the world. HP_URL (default http://localhost:4173), HP_W × HP_H. */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'

const BASE = process.env.HP_URL || 'http://localhost:4173'
const W = +(process.env.HP_W || 1440), H = +(process.env.HP_H || 900)
const TAG = W < 700 ? 'phone' : 'desktop'
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-28-change-recording/a1/survey-' + TAG
mkdirSync(OUT, { recursive: true })
const CHROMIUM = '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const ctx = await browser.newContext({ viewport: { width: W, height: H }, ...(W < 700 ? { hasTouch: true, isMobile: true } : {}) })
const page = await ctx.newPage()
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
await page.goto(BASE + '/')
await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
await page.waitForSelector('#luser'); await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(600)
await page.evaluate(() => window.go('editsched')); await page.waitForFunction(() => window.CURPAGE === 'editsched'); await page.waitForTimeout(600)
const s = await page.evaluate(() => {
  const w = window
  return {
    week: w.CURWEEK,
    days: w.DAYS.map((d, i) => ({ i, dow: d.dow, date: w.DATES && w.DATES[i], pub: w.dayApproved(i), ver: w.dayCurVer(i), waves: d.waves.length, duties: d.dutywaves.length, ground: d.ground.length, allhands: d.allhands.length })),
    undo: (() => { const b = document.querySelector('#undoBtn'); return b && { dis: b.disabled, title: b.title } })(),
    redo: (() => { const b = document.querySelector('#redoBtn'); return b && { dis: b.disabled, title: b.title } })(),
    beaks: [...document.querySelectorAll('#eWeek [data-beak]')].map(b => b.dataset.beak),
    unpubs: [...document.querySelectorAll('#eWeek [data-unpub]')].map(b => b.dataset.unpub),
    signs: [...document.querySelectorAll('#eWeek select[data-sign]')].length,
    sbday: [...document.querySelectorAll('#eWeek [data-sbday]')].map(b => b.dataset.sbday),
    secGrips: [...document.querySelectorAll('#eWeek [data-secgrip], #eWeek .sec-grip, #eWeek [data-sec]')].slice(0, 6).map(e => e.outerHTML.slice(0, 120)),
    dn: [...document.querySelectorAll('#eWeek [data-txt^="dn:"]')].slice(0, 3).map(e => e.getAttribute('data-txt') + ' ' + e.tagName),
    addWave: [...document.querySelectorAll('#eWeek button')].filter(b => /Wave/.test(b.textContent || '')).slice(0, 3).map(b => b.outerHTML.slice(0, 160)),
    toast: !!document.querySelector('#toastEl'),
  }
})
console.log(JSON.stringify(s, null, 1))
await page.screenshot({ path: `${OUT}/editweek.png` })
for (const di of [5, 6]) {
  await page.evaluate(d => window.openScheduler(d), di); await page.waitForSelector('#schedBoard'); await page.waitForTimeout(700)
  const b = await page.evaluate(() => {
    const B = document.querySelector('#schedBoard')
    const vis = e => !!(e && e.offsetParent !== null)
    return {
      sbday: window.SBDAY,
      oil: vis(B.querySelector('#sbOil')),
      undo: (() => { const x = B.querySelector('#sbUndo'); return x && { dis: x.disabled, title: x.title, vis: vis(x) } })(),
      beak: [...B.querySelectorAll('[data-beak],[data-alpub],[data-unpub]')].filter(vis).map(e => e.outerHTML.slice(0, 140)),
      signs: [...B.querySelectorAll('select[data-sign]')].filter(vis).map(e => e.getAttribute('data-sign')),
      buttons: [...B.querySelectorAll('.sb-top button, .sb-bar button')].filter(vis).map(e => (e.id || '') + ':' + (e.textContent || '').trim().slice(0, 18)),
      mbtn: [...new Set([...B.querySelectorAll('[data-mbtn]')].filter(vis).map(e => (e.getAttribute('data-mbtn') || '').replace(/[0-9.]+/g, '#')))].slice(0, 40),
      grips: [...new Set([...B.querySelectorAll('[class*=grip],[data-grip],[data-secdrag],[data-rowgrip]')].filter(vis).map(e => e.className + '|' + [...e.attributes].map(a => a.name).join(',')))].slice(0, 12),
      addWave: [...B.querySelectorAll('button')].filter(e => vis(e) && /Wave|Line|Block/.test(e.textContent || '')).map(e => e.outerHTML.slice(0, 160)).slice(0, 6),
    }
  })
  console.log('BOARD', di, JSON.stringify(b, null, 1))
  await page.screenshot({ path: `${OUT}/board-${di}.png` })
  await page.evaluate(() => window.closeScheduler()); await page.waitForTimeout(400)
}
console.log('errors:', errors)
await browser.close()
