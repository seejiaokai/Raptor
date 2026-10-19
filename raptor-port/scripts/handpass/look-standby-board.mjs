/* LOOK — D1085 (20 Oct 26): the Scheduler Board's SC, AVALON and BB waves headed R · B · START · END (a phone: R over B,
   START over END); a flying wave keeps TO / LD. The built app, nothing drawn in — the START / END headings ringed orange
   (an outline on the element), a flying wave's TO / LD ringed grey for comparison. SC AM's B typed 05:45 on the board.
   Run: HP_URL=http://localhost:4181 node scripts/handpass/look-standby-board.mjs
   Pictures: docs/img/handpass/2026-10-20-standby-week-b/board/ */
import { existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const BASE = process.env.HP_URL || 'http://localhost:4181'
const OUT = resolve(ROOT, 'docs/img/handpass/2026-10-20-standby-week-b/board')
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errors = []
try {
  for (const [name, vp, dsf] of [['1-phone-board', { width: 402, height: 874 }, 3], ['2-desktop-board', { width: 1440, height: 1000 }, 2]]) {
    const p = await (await browser.newContext({ viewport: vp, deviceScaleFactor: dsf, colorScheme: 'dark' })).newPage()
    p.on('pageerror', e => errors.push(e.message))
    await p.goto(BASE + '/?fresh=1')
    await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
    await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
    await p.addStyleTag({ content: '#toastEl{display:none !important}' })
    const gis = await p.evaluate(() => { window.go('editsched'); for (const k of ['sc', 'avalon', 'bb']) window.addWave(0, k); window.openScheduler(0); return ['sc', 'avalon', 'bb'].map(k => window.DAYS[0].waves.findIndex(w => w.kind === k)) })
    await p.waitForSelector('#schedBoard'); await p.waitForTimeout(800)
    const b = p.locator(`#sbBoard [data-bfld="ff:0.${gis[0]}.0.br"]:visible`).first()
    await b.evaluate(e => { e.focus({ preventScroll: true }); e.value = '05:45'; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); e.blur() })
    await p.waitForTimeout(600)
    /* the first standby wave's heading row brought to the top, under the board's bar */
    const n = await p.evaluate(() => {
      const mark = (e, c) => { for (const s of e.children) { s.style.outline = `2px ${c === 'o' ? 'dashed #ff9a3c' : 'solid #8a96a3'}`; s.style.outlineOffset = '1px' } }
      const se = [...document.querySelectorAll('#schedBoard .sb-lcols .sb-htl.sb-se')].filter(e => e.firstElementChild.getClientRects().length)
      se.forEach(e => mark(e, 'o'))
      const fly = [...document.querySelectorAll('#schedBoard .sb-lcols .sb-htl:not(.sb-se)')].filter(e => e.firstElementChild.getClientRects().length).pop()
      if (fly) mark(fly, 'g')
      return se.length
    })
    if (n < 3) throw new Error(`${name}: ${n} standby headings — premise gone`)
    const top = await p.evaluate(g => { const r = document.querySelector(`#sbBoard [data-bfld="ff:0.${g}.0.br"]`).closest('.sb-wave, .sb-panel, .go, [class*=wave]') ; return null }, gis[0])
    void top
    /* the picture: the last flying wave's heading down to BB's first line */
    const box = await p.evaluate(() => {
      const fly = [...document.querySelectorAll('#schedBoard .sb-lcols .sb-htl:not(.sb-se)')].filter(e => e.firstElementChild.getClientRects().length).pop()
      const se = [...document.querySelectorAll('#schedBoard .sb-lcols .sb-htl.sb-se')].filter(e => e.firstElementChild.getClientRects().length)
      fly.closest('.sb-lcols').scrollIntoView({ block: 'start' })
      return null
    })
    void box
    await p.waitForTimeout(300)
    await p.screenshot({ path: resolve(OUT, `${name}-top.png`) })
    await p.evaluate(() => { const se = [...document.querySelectorAll('#schedBoard .sb-lcols .sb-htl.sb-se')].filter(e => e.firstElementChild.getClientRects().length); se[0].closest('.sb-lcols').scrollIntoView({ block: 'start' }) })
    await p.waitForTimeout(300)
    await p.screenshot({ path: resolve(OUT, `${name}-sc.png`) })
    console.log(name, 'standby headings', n)
    await p.context().close()
  }
} finally { await browser.close(); console.log('page errors', errors.length) }
