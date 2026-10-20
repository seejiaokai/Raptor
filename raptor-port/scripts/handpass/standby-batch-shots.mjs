/* BEFORE / AFTER pictures — the standby batch of 20 Oct 26 (D994's small fixes): [BOARD-TAB-FOLD] (the board's and the
   week's time box left by Tab), [SA-HEAD-CLIP-360] (a standby wave's first heading under 375 wide), [STANDBY-UNDO-WORDS]
   (Undo's and the changes window's words for a standby line's START / END) and [BUBBLE-SMALL-SEEN] (4) (the empty gold
   pill in an input's row on the phone's Inputs list). Run once on main's build (SHOTS_DIR=before) and once on the fixed
   build (SHOTS_DIR=after): the same presses, so the two sets compare. Everything through the app's own controls — the
   board's "+ Wave" menu, real presses and keys, the Inputs page's own "+ Input".
   Run: HP_URL=http://localhost:4311 SHOTS_DIR=before node scripts/handpass/standby-batch-shots.mjs */
import { existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const BASE = process.env.HP_URL || 'http://localhost:4311'
process.env.LOOK_URL = BASE.replace(/\/?$/, '/')
const OUT = resolve(ROOT, 'docs/img/handpass/2026-10-20-standby-batch', process.env.SHOTS_DIR || 'before')
mkdirSync(OUT, { recursive: true })
const L = await import('./ivet-B-lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errors = []
const said = (k, v) => console.log(`${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
const pic = async (p, name, loc, pad = 0) => {
  const f = resolve(OUT, `${name}.png`)
  if (!loc) { await p.screenshot({ path: f }); return }
  const b = await loc.boundingBox()
  await p.screenshot({ path: f, clip: { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: b.width + 2 * pad, height: b.height + 2 * pad } })
}
async function start(vp, phone) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, colorScheme: 'dark', ...(phone ? { hasTouch: true } : {}) })
  const p = await ctx.newPage()
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  p.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  await p.goto(BASE + '/?fresh=1')
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await p.waitForTimeout(500)
  return { ctx, p }
}
async function press(p, loc, phone) {
  await loc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await p.waitForTimeout(150)
  const b = await loc.boundingBox()
  if (phone) await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  await p.waitForTimeout(250)
}
const go = async (p, page) => { await p.evaluate(x => window.go(x), page); await p.waitForFunction(x => window.CURPAGE === x, page); await p.waitForTimeout(500) }
async function openBoard(p, phone) { await go(p, 'editsched'); await press(p, p.locator('#eWeek [data-sbday="0"]:visible').first(), phone); await p.waitForSelector('#schedBoard'); await p.waitForTimeout(600) }
async function closeBoard(p, phone) { for (let i = 0; i < 3 && (await p.locator('#schedBoard').isVisible().catch(() => false)); i++) { await press(p, p.locator('#sbDone:visible').first(), phone); await p.waitForTimeout(500) } }
async function addWave(p, kind, phone) {
  await press(p, p.locator('#schedBoard [data-wvadd="0"]:visible').first(), phone)
  await press(p, p.locator(`[data-wmkind="${kind}"]:visible`).first(), phone); await p.waitForTimeout(400)
  return p.evaluate(k => window.DAYS[0].waves.findIndex(w => w.kind === k), kind)
}
const toast = p => p.evaluate(() => (document.getElementById('toastEl')?.textContent || '').trim())

try {
  /* ---------- desktop: the board's and the week's time box left by Tab; Undo's words on a standby line ---------- */
  {
    const { ctx, p } = await start({ width: 1440, height: 900 }, false)
    await openBoard(p, false)
    const to = p.locator('#schedBoard input[data-bfld="ff:0.0.0.to"]:visible').first()
    await press(p, to, false); await p.keyboard.type('1000'); await p.keyboard.press('Tab'); await p.waitForTimeout(700)
    said('board take-off after typing 1000 and Tab — the box reads', await to.inputValue())
    said('  saved', await p.evaluate(() => window.DAYS[0].waves[0].formations[0].to))
    await pic(p, '01-board-take-off-after-tab', to.locator('xpath=ancestor::div[contains(@class,"sb-line")][1]'), 6)
    const av = await addWave(p, 'avalon', false)
    await closeBoard(p, false); await go(p, 'editsched')
    const wk = p.locator('#eWeek [data-txt="ff:0.0.0.to"]')
    await press(p, wk, false); await p.keyboard.press('Control+A'); await p.keyboard.type('0930'); await p.keyboard.press('Tab'); await p.waitForTimeout(1200)
    said('week take-off after typing 0930 and Tab — the box reads', await wk.textContent())
    said('  saved', await p.evaluate(() => window.DAYS[0].waves[0].formations[0].to))
    await pic(p, '02-week-take-off-after-tab', wk.locator('xpath=ancestor::div[contains(@class,"form")][1]'), 6)
    /* an AVALON line's START, typed on the week; then Undo's words and the changes window's line */
    const st = p.locator(`#eWeek [data-txt="ff:0.${av}.0.to"]`)
    await press(p, st, false); await p.keyboard.press('Control+A'); await p.keyboard.type('1930'); await press(p, p.locator('#eWeek .day[data-day="0"] .day-head').first(), false); await p.waitForTimeout(700)
    said('AVALON START saved', await p.evaluate(g => window.DAYS[0].waves[g].formations[0].to, av))
    const undoTitle = await p.locator('#undoBtn').getAttribute('title')
    said('Undo button says', undoTitle)
    await p.locator('#undoBtn').hover(); await p.waitForTimeout(300)
    await p.evaluate(t => { const d = document.createElement('div'); d.id = 'shotTip'; d.textContent = t; Object.assign(d.style, { position: 'fixed', top: '64px', right: '150px', background: '#222', color: '#fff', border: '1px solid #888', padding: '4px 8px', font: '13px system-ui', zIndex: 99999 }); document.body.appendChild(d) }, undoTitle)
    await pic(p, '03-undo-words-avalon-start', null)
    await p.evaluate(() => document.getElementById('shotTip')?.remove())
    await press(p, p.locator('#histBtn'), false); await p.waitForTimeout(700)
    /* his own changes are not "new to you": the All changes tab lists them */
    await press(p, p.locator('.chgwin button', { hasText: 'All changes' }).first(), false); await p.waitForTimeout(500)
    const line = await p.evaluate(() => [...document.querySelectorAll('.chgwin .cw-l')].map(e => e.innerText.replace(/\s+/g, ' ')).filter(t => /AV\b|AVALON|19:30/.test(t)).slice(0, 4))
    said('changes window, the AVALON lines', line)
    await pic(p, '04-changes-window-avalon-start', p.locator('.chgwin').first(), 4)
    await ctx.close()
  }
  /* ---------- a phone 360 wide: the standby wave's first heading ---------- */
  {
    const { ctx, p } = await start({ width: 360, height: 780 }, true)
    await openBoard(p, true)
    const av = await addWave(p, 'avalon', true)
    const sc = await addWave(p, 'sc', true)
    await closeBoard(p, true); await go(p, 'editsched')
    for (const [g, k] of [[av, 'avalon'], [sc, 'sc']]) {
      const goEl = p.locator(`#eWeek .day[data-day="0"] [data-move="mv:w.0.${g}"]`).first()
      const head = await goEl.evaluate(e => { const h = e.querySelector('.cols.formcols').children[0]; return { text: h.innerText.replace(/\s+/g, ' '), fit: h.scrollWidth <= h.clientWidth, w: h.clientWidth, sw: h.scrollWidth } })
      said(`360 wide, Edit Schedule, ${k} first heading`, head)
      await goEl.evaluate(e => e.scrollIntoView({ block: 'start' })); await p.evaluate(() => scrollBy(0, -80)); await p.waitForTimeout(200)
      await pic(p, `05-phone-360-edit-week-${k}-heading`, goEl.locator('.cols.formcols').first(), 8)
    }
    await go(p, 'viewsched')
    const vgo = p.locator(`#vWeek .day[data-day="0"] .go.sa`).first()
    if (await vgo.count()) {
      const vh = await vgo.evaluate(e => { const h = e.querySelector('.cols.formcols').children[0]; return { text: h.innerText.replace(/\s+/g, ' '), fit: h.scrollWidth <= h.clientWidth } })
      said('360 wide, View-only Sched, first standby heading', vh)
      await vgo.evaluate(e => e.scrollIntoView({ block: 'start' })); await p.evaluate(() => scrollBy(0, -80)); await p.waitForTimeout(200)
      await pic(p, '06-phone-360-view-week-heading', vgo.locator('.cols.formcols').first(), 8)
    }
    await ctx.close()
  }
  /* ---------- a phone: the Inputs list's row of a LATE leave the admin files for himself in the member view ---------- */
  {
    const { ctx, p } = await start({ width: 390, height: 844 }, true)
    /* the member view's calendar, the day opened, its "+ Input" (the window's date is that day), LL, a remark, Save */
    await L.toCal(p, true, 2026, 7)
    await p.locator('#inpCal [data-icday="2026-07-14"]').tap({ position: { x: 8, y: 8 } }); await p.waitForTimeout(450)
    await press(p, p.locator('#icPopAdd'), true); await p.locator('[data-testid="win-inputedit"]').waitFor()
    await p.selectOption('#inpEditType', 'LL'); await p.waitForTimeout(250)
    await p.fill('#inpEditRmk', 'Member-view LL')
    await press(p, p.locator('#inpEditSave'), true); await p.waitForTimeout(500)
    const nd = p.locator('[data-testid="docconf-nodoc"]'); if (await nd.isVisible().catch(() => false)) await press(p, nd, true)
    await p.waitForTimeout(400)
    said('filed', await p.evaluate(() => window.INPUTS.filter(r => r.remarks === 'Member-view LL' || /Member-view LL/.test(r.remarks || '')).map(r => ({ type: r.type, from: r.from, to: r.to, rmk: r.remarks }))))
    await p.keyboard.press('Escape'); await p.waitForTimeout(200)
    await L.toList(p, true)
    if (process.env.DBG_SHOT) { await p.screenshot({ path: process.env.DBG_SHOT }); said('list text', (await p.evaluate(() => document.body.innerText)).slice(0, 900)) }
    /* the phone's List is day cards now: the card is the nearest box round the remark that is a row of its own */
    await p.evaluate(() => {
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      let n; while ((n = w.nextNode())) if (/Member-view LL/.test(n.nodeValue) && n.parentElement.offsetParent) break
      let e = n && n.parentElement
      while (e && e.getBoundingClientRect().height < 44) e = e.parentElement
      if (e) e.setAttribute('data-shot', 'row')
    })
    const row = p.locator('[data-shot="row"]').first()
    said('the row', await row.evaluate(r => ({ cls: r.className, text: r.innerText.replace(/\s+/g, ' '), html: r.innerHTML.slice(0, 900) })))
    await row.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(200)
    await pic(p, '07-phone-inputs-list-late-ll-row', row, 6)
    await ctx.close()
  }
  /* ---------- the same on a desktop: the List's table row ---------- */
  {
    const { ctx, p } = await start({ width: 1440, height: 900 }, false)
    await L.toCal(p, false, 2026, 7)
    await p.locator('#inpCal [data-icday="2026-07-14"]').click({ position: { x: 8, y: 8 } }); await p.waitForTimeout(450)
    await press(p, p.locator('#icPopAdd'), false); await p.locator('[data-testid="win-inputedit"]').waitFor()
    await p.selectOption('#inpEditType', 'LL'); await p.waitForTimeout(250)
    await p.fill('#inpEditRmk', 'Member-view LL')
    await press(p, p.locator('#inpEditSave'), false); await p.waitForTimeout(500)
    const nd = p.locator('[data-testid="docconf-nodoc"]'); if (await nd.isVisible().catch(() => false)) await press(p, nd, false)
    await p.keyboard.press('Escape'); await p.waitForTimeout(200)
    await L.toList(p, false)
    const row = p.locator('tr', { hasText: 'Member-view LL' }).first()
    said('desktop row', await row.evaluate(r => [...r.querySelectorAll('td')].map(td => `${td.dataset.label || td.className}: ${td.innerText.replace(/\s+/g, ' ')}`)))
    await row.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(200)
    await pic(p, '08-desktop-inputs-list-late-ll-row', row, 4)
    await ctx.close()
  }
} finally {
  said('page errors', errors)
  await browser.close()
}
