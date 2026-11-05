/* [CSS-FONT-INHERIT] (D1680) — the walk of the built fix: every place the nine rules draw, reached through the app's own
   controls on a built preview, at his PC's 1536 (Chromium) and his iPhone's 402×874 (WebKit). Written as assertions of
   the RIGHT look (a PASS means correct): each marked box or button wears the app's letters at the size and weight its
   line meant. Beside the drawing's five windows it walks the doors the drawing did not: the input window opened from
   Edit Schedule's week, the plain-user round (a line cancelled with a reason, then read on the week; a note given people),
   and the Leave War's Auto-approve switch, which shares the "Several people" look and takes its letters (D1681).
   Run: HP_URL=http://localhost:<port> node scripts/handpass/font-inherit-walk.mjs → docs/img/handpass/2026-11-05-font-inherit/ (evidence: docs/handpass/2026-11-05-font-inherit.md) */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium, webkit, devices } from '@playwright/test'
import { fileURLToPath } from 'node:url'
const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const BASE = process.env.HP_URL || 'http://localhost:4391'
const OUT = ROOT + 'docs/img/handpass/2026-11-05-font-inherit'; mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const sleep = ms => new Promise(r => setTimeout(r, ms))

const APP = /Inter Tight/          // the app's own family list starts with it; the browser's own is Arial / MS Shell Dlg
const WANT = {
  '#cxReason': ['14px', '600'],
  '.cxedit-name': ['12px', '600'],
  '.inped-body select, .inped-body input:not([type=checkbox])': ['13px', '600'],
  '.inped-v': ['13px', '600'],
  '.inpedwin .pp-sw': ['12px', '600'],
  '.pp-all': ['11px', '600'],
  '.inputsday .ic-note .ic-pkadd': ['14px', '700'],
  '.inputsday .ic-newnote-ppl': ['12px', '700'],
}
const rows = []
let fails = 0
const sel = s => s
async function check(page, dev, scene, keys, cropSel, keepFocus = false) {
  await page.evaluate(k => { if (!k) document.activeElement?.blur?.() }, keepFocus); await sleep(250)
  for (const k of keys) {
    const [size, weight] = WANT[k]
    const got = await page.evaluate(s => [...document.querySelectorAll(s)].filter(e => e.getBoundingClientRect().width > 0)
      .map(e => { const c = getComputedStyle(e); return { fam: c.fontFamily, size: c.fontSize, weight: c.fontWeight, h: Math.round(e.getBoundingClientRect().height) } }), sel(k))
    const ok = got.length > 0 && got.every(g => APP.test(g.fam) && g.size === size && g.weight === weight)
    if (!ok) fails++
    rows.push({ dev, scene, place: k, n: got.length, want: `${size} ${weight}`, got: got.slice(0, 2).map(g => `${g.fam.split(',')[0]} ${g.size} ${g.weight} h${g.h}`).join(' / '), ok })
  }
  const marks = keys.map(sel).join(', ')
  await page.evaluate(m => document.querySelectorAll(m).forEach(e => { if (e.getBoundingClientRect().width > 0) { e.style.outline = '2px solid #ffb020'; e.style.outlineOffset = '2px' } }), marks)
  const clip = await page.evaluate(([s, m]) => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 0); const r = e.getBoundingClientRect()
    const low = Math.max(...[...document.querySelectorAll(m)].filter(x => x.getBoundingClientRect().width > 0).map(x => x.getBoundingClientRect().bottom))
    const x = Math.max(0, r.x - 8), y = Math.max(0, r.y - 8)
    return { x, y, width: Math.min(innerWidth - x, r.width + 16), height: Math.min(innerHeight - y, Math.min(r.height, low - r.y + 28) + 16) } }, [cropSel, marks])
  await page.screenshot({ path: `${OUT}/${dev}-${scene}.png`, clip })
  await page.evaluate(m => document.querySelectorAll(m).forEach(e => { e.style.outline = ''; e.style.outlineOffset = '' }), marks)
}
async function signIn(page, who) {
  await page.goto(BASE + '/'); await page.waitForSelector('#luser')
  await page.fill('#luser', who === 'a' ? 'ad' : 'us'); await page.fill('#lpass', who === 'a' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(700)
}
const go = (page, to) => page.evaluate(p => window.go(p), to).then(() => sleep(900))
const tapVis = (page, s) => page.locator(s).locator('visible=true').first().click()
const setVal = (page, s, v) => page.evaluate(([s, v]) => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 0)
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, v); e.dispatchEvent(new Event('input', { bubbles: true })) }, [s, v])

const DEVICES = [
  ['pc1536', chromium, { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 }],
  ['iphone', webkit, { ...devices['iPhone 13'], viewport: { width: 402, height: 874 } }],
]
const errs = []
for (const [dev, type, opts] of DEVICES) {
  const browser = await type.launch(type === chromium && existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const fresh = async who => {
    const ctx = await browser.newContext(opts)
    await ctx.clock.install({ time: new Date('2026-11-04T09:00:00') })
    const page = await ctx.newPage()
    page.on('pageerror', e => errs.push(`${dev} PAGEERROR ${e.message}`))
    page.on('console', m => { if (m.type() === 'error') errs.push(`${dev} console ${m.text()}`) })
    await signIn(page, who); return { ctx, page }
  }
  /* A — the Scheduler Board's cancel box and its reasons list; then the plain-user round: the line cancelled with a reason */
  { const { ctx, page } = await fresh('a')
    await go(page, 'editsched')
    await tapVis(page, '#eWeek [data-sbday="2"]'); await page.waitForSelector('#schedBoard'); await sleep(900)
    await tapVis(page, '#sbBoard .mbtn[data-lcx]'); await sleep(700)
    await setVal(page, '#cxReason', 'U/S AIRCRAFT')
    await check(page, dev, 'cancel', ['#cxReason'], '#cxPop .cxbox, #cxPop > *')
    await tapVis(page, '#cxPop [data-cxedit]'); await sleep(500)
    await check(page, dev, 'cancel-reasons', ['.cxedit-name'], '#cxPop .cxbox, #cxPop > *')
    await tapVis(page, '#cxPop [data-cxdone]'); await sleep(300)
    /* typed as a person would (after the pictures, so a phone's zoom on a typed box cannot shift them) */
    await page.fill('#cxReason', 'U/S AIRCRAFT'); await tapVis(page, '#cxSave'); await sleep(800)
    const tag = await page.evaluate(() => [...document.querySelectorAll('.cxtag')].filter(e => e.getBoundingClientRect().width).map(e => e.textContent.trim()))
    rows.push({ dev, scene: 'cancel-done', place: 'the line reads CX DUE U/S AIRCRAFT', n: tag.length, want: 'CX DUE U/S AIRCRAFT', got: tag.join(' / '), ok: tag.some(t => /U\/S AIRCRAFT/.test(t)) })
    if (!rows.at(-1).ok) fails++
    const row = await page.evaluate(() => { const t = [...document.querySelectorAll('.cxtag')].find(e => e.getBoundingClientRect().width); if (!t) return null
      t.scrollIntoView({ block: 'center' }); const r = (t.closest('.sb-line, .fl, .go') || t.parentElement).getBoundingClientRect()
      return { x: Math.max(0, r.x - 6), y: Math.max(0, r.y - 6), width: Math.min(innerWidth - Math.max(0, r.x - 6), r.width + 12), height: r.height + 12 } })
    if (row) await page.screenshot({ path: `${OUT}/${dev}-cancel-done.png`, clip: row })
    await ctx.close() }
  /* B — the Inputs calendar's opened day (a note given people), then a new input's window with Several people */
  { const { ctx, page } = await fresh('a')
    await go(page, 'inputs')
    await tapVis(page, '[data-icday="2026-11-04"]'); await sleep(800)
    await tapVis(page, '#icAddPuck'); await sleep(400)
    await page.locator('.ic-newnote .ic-poppuck-edit').fill('BRIEF ROOM')
    await tapVis(page, '#icNewNotePpl'); await sleep(600)
    for (let i = 0; i < 2; i++) { await tapVis(page, '.ic-pickp:not(.already):not(.on)'); await sleep(150) }
    await tapVis(page, '#icPickOk'); await sleep(700)
    await tapVis(page, '#icAddPuck'); await sleep(500)
    await check(page, dev, 'day-notes', ['.inputsday .ic-note .ic-pkadd', '.inputsday .ic-newnote-ppl'], '[data-testid="win-inputsday"]', true)
    await page.keyboard.press('Escape'); await sleep(400)
    await tapVis(page, '#icPopAdd'); await sleep(800)
    await tapVis(page, '[data-testid="pp-several"]'); await sleep(500)
    await check(page, dev, 'input-window', ['.inped-body select, .inped-body input:not([type=checkbox])', '.inpedwin .pp-sw', '.pp-all'], '.floatwin.inpedwin')
    await ctx.close() }
  /* C — a member's own new input: his name fixed, as plain words */
  { const { ctx, page } = await fresh('m')
    await go(page, 'inputs')
    await tapVis(page, '[data-icday="2026-11-05"]'); await sleep(800)
    await tapVis(page, '#icPopAdd'); await sleep(800)
    await setVal(page, '#inpEditRmk', 'Dentist 0900'); await sleep(300)
    await check(page, dev, 'member-input', ['.inped-v', '.inped-body select, .inped-body input:not([type=checkbox])'], '.floatwin.inpedwin')
    await ctx.close() }
  /* D — the same window opened from Edit Schedule's week (the drawing's doors were all on the Inputs page) */
  { const { ctx, page } = await fresh('a')
    await go(page, 'editsched')
    const n = await page.evaluate(() => [...document.querySelectorAll('#eWeek [data-inpedit]')].filter(e => e.getBoundingClientRect().width > 0).length)
    if (n) { await tapVis(page, '#eWeek [data-inpedit]'); await sleep(900)
      await check(page, dev, 'schedule-input', ['.inped-body select, .inped-body input:not([type=checkbox])'], '#inpEditPop > *') }
    else { rows.push({ dev, scene: 'schedule-input', place: 'an input on the week', n: 0, want: 'one to tap', got: 'none in view', ok: false }); fails++ }
    await ctx.close() }
  /* E — the Leave War's Auto-approve switch: the app's letters at 600 as "Several people", its own 11px kept (D1681) */
  { const { ctx, page } = await fresh('a')
    await go(page, 'leavewar'); await sleep(2000)
    const cell = await page.evaluate(() => { const c = [...document.querySelectorAll('[data-testid^="cell-"]')].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.left > 120 && r.top > 300 && r.bottom < innerHeight - 40 && !e.textContent.trim() }); return c && c.getAttribute('data-testid') })
    await page.click(`[data-testid="${cell}"]`); await sleep(900)
    const g = await page.evaluate(() => [...document.querySelectorAll('.bidsheet-hd .bp-sw')].filter(e => e.getBoundingClientRect().width).map(e => { const c = getComputedStyle(e); return `${c.fontFamily} ${c.fontSize} ${c.fontWeight}` }))
    const ok = g.length > 0 && g.every(s => /^"?Inter Tight"?, system-ui, sans-serif 11px 600$/.test(s))
    if (!ok) fails++
    rows.push({ dev, scene: 'leavewar-switch', place: 'Auto-approve (D1681)', n: g.length, want: 'the app letters 11px 600', got: g.join(' / '), ok })
    const clip = await page.evaluate(() => { const r = document.querySelector('.bidsheet-hd').getBoundingClientRect(); return { x: Math.max(0, r.x - 6), y: Math.max(0, r.y - 6), width: Math.min(innerWidth, r.width + 12), height: r.height + 12 } })
    await page.screenshot({ path: `${OUT}/${dev}-leavewar-switch.png`, clip })
    await ctx.close() }
  await browser.close()
}
writeFileSync(OUT + '/walk.json', JSON.stringify({ rows, errs, fails }, null, 1))
for (const r of rows) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.dev}  ${r.scene}  ${r.place}  n=${r.n}  want ${r.want}  got ${r.got}`)
console.log(errs.length ? 'ERRORS\n' + errs.join('\n') : 'no page errors')
console.log(fails ? `${fails} FAIL` : 'ALL PASS')
process.exit(fails || errs.length ? 1 : 0)
