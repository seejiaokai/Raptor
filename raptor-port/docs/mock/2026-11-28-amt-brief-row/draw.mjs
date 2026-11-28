/* THE AMT ROW RENAMED BRIEF KEEPS ITS MEN SHOWING — the drawing for his look (his D2848, question 40 "as recommended":
   "a man planned on an AMT row renamed BRIEF or DEBRIEF keeps showing on the row, so the scheduler sees and moves him
   (drawn first)"). Chat A213, 28 Nov 26.

   Today (real): the Scheduler Board, Monday 13 Jul, the AMT block. Its BOX row (11:30–12:30, eight men) is renamed BRIEF
   through the board's own ITEM box; the board then draws the row's PEOPLE cell empty (board-html.ts: an AMT row whose
   name starts BRIEF, or holds DEBRIEF, shows no seats), though the eight are still planned there.
   Proposed (drawn): the ONE transform — the PEOPLE cell the board drew for that very row a moment before the rename
   (its eight pucks and empty "+" seats, recorded from the real page) is put back in the renamed row; the app's own empty
   cell is hidden, never removed. The rule to build: an AMT row named BRIEF / DEBRIEF with anyone on it draws its seats
   as a BOX row does; one with nobody on it stays as today (no seats). The Edit Schedule week already shows them (its
   sim rows never hide anyone — html.ts), so only the board changes.

   Env: HP_URL (a local build, default http://localhost:4180). Pictures beside this file, in img/. */
import { chromium, webkit } from 'playwright'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const IMG = resolve(HERE, 'img'); mkdirSync(IMG, { recursive: true })
const BASE = process.env.HP_URL || 'http://localhost:4180'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const DI = 0, KEY = `sr:${DI}.amt.1.label`
const facts = {}
const fail = []
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail !== undefined ? ' — ' + JSON.stringify(detail).slice(0, 400) : ''}`); if (!ok) fail.push(name) }

async function run(dev) {
  const engine = dev.engine === 'webkit' ? webkit : chromium
  const browser = await engine.launch({ headless: true, ...(dev.engine !== 'webkit' && existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
  const ctx = await browser.newContext({ viewport: dev.vp, deviceScaleFactor: dev.dpr, ...(dev.phone ? { isMobile: true, hasTouch: true } : {}) })
  await ctx.clock.setFixedTime(new Date(2026, 6, 13, 9, 0, 0))
  const p = await ctx.newPage()
  const errors = []
  p.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  await p.goto(BASE + '/')
  await p.waitForSelector('#luser', { state: 'visible', timeout: 15000 })
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a')
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(600)
  await p.evaluate(d => window.openScheduler(d), DI)
  await p.waitForSelector('#schedBoard', { timeout: 8000 }); await p.waitForTimeout(800)

  /* the row, its name box and its PEOPLE cell, scoped to the board on screen */
  const rowInfo = () => p.evaluate(k => {
    const b = document.querySelector('#schedBoard')
    const box = [...b.querySelectorAll(`[data-bfld="${k}"]`)].find(e => e.offsetWidth > 0)
    if (!box) return null
    let row = box; while (row && row !== b && !(row.querySelector('.ppl') && row.querySelector(`[data-bfld="${k}"]`) === box && row.querySelectorAll('[data-bfld$=".label"]').length === 1)) row = row.parentElement
    const ppl = row && row.querySelector('.ppl')
    return { name: box.value ?? box.textContent, rowCls: row && row.className, pucks: ppl ? ppl.querySelectorAll('[data-pid], .puck').length : -1, html: ppl ? ppl.outerHTML : null, h: ppl ? ppl.getBoundingClientRect().height : 0 }
  }, KEY)

  const before = await rowInfo()
  facts[dev.name + '.before'] = { name: before && before.name, pucks: before && before.pucks, h: before && before.h }
  check(`${dev.name}: the BOX row (11:30–12:30) shows its men before the rename`, !!before && /BOX/.test(before.name) && before.pucks >= 8, facts[dev.name + '.before'])
  const keptCell = before.html

  /* the rename, through the board's own ITEM box */
  const el = p.locator(`#schedBoard [data-bfld="${KEY}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' }))
  if (dev.phone) { await el.evaluate((e, v) => { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })) }, 'BRIEF') }
  else { await el.click(); await el.fill(''); await el.type('BRIEF', { delay: 8 }) }
  await el.evaluate(e => e.blur()); await p.waitForTimeout(900)
  const after = await rowInfo()
  const stored = await p.evaluate(d => (window.DAYS[d].sims.amt[1] || {}), DI)
  facts[dev.name + '.after'] = { name: after && after.name, pucks: after && after.pucks, h: after && after.h, storedLabel: stored.label, storedPax: (stored.pax || []).length }
  check(`${dev.name}: TODAY — renamed BRIEF, the row draws no men though ${(stored.pax || []).length} are still planned on it`, !!after && after.name === 'BRIEF' && after.pucks === 0 && (stored.pax || []).length >= 8, facts[dev.name + '.after'])

  /* frame: the AMT block on screen, a neutral tap first so no control is left focused */
  const frame = async () => p.evaluate(k => {
    const b = document.querySelector('#schedBoard')
    const box = [...b.querySelectorAll(`[data-bfld="${k}"]`)].find(e => e.offsetWidth > 0)
    let sec = box; while (sec && sec !== b && !/sec|grp|blk|gsec/.test(sec.className || '')) sec = sec.parentElement
    sec = sec || box.parentElement
    sec.scrollIntoView({ block: 'center' })
    const r = sec.getBoundingClientRect()
    return { x: Math.max(0, r.left - 6), y: Math.max(0, r.top - 6), width: Math.min(window.innerWidth - Math.max(0, r.left - 6), r.width + 12), height: Math.min(window.innerHeight - Math.max(0, r.top - 6), r.height + 12), cls: sec.className }
  }, KEY)
  await p.evaluate(() => { const a = document.activeElement; if (a && a.blur) a.blur() })
  let clip = await frame(); facts[dev.name + '.frame'] = clip
  await p.screenshot({ path: resolve(IMG, `${dev.name}-1-today.png`), clip })

  /* PROPOSED — the one transform: the row's own recorded PEOPLE cell put back, the app's empty one hidden */
  const put = await p.evaluate(({ k, html }) => {
    const b = document.querySelector('#schedBoard')
    const box = [...b.querySelectorAll(`[data-bfld="${k}"]`)].find(e => e.offsetWidth > 0)
    let row = box; while (row && row !== b && !(row.querySelector('.ppl') && row.querySelectorAll('[data-bfld$=".label"]').length === 1)) row = row.parentElement
    const empty = row.querySelector('.ppl')
    const t = document.createElement('div'); t.innerHTML = html
    const cell = t.firstElementChild
    cell.setAttribute('data-mock', 'new'); cell.style.outline = '2px solid #2f81f7'; cell.style.outlineOffset = '1px'
    empty.style.display = 'none'; empty.after(cell)
    return { pucks: cell.querySelectorAll('[data-pid], .puck').length, h: cell.getBoundingClientRect().height }
  }, { k: KEY, html: keptCell })
  facts[dev.name + '.proposed'] = put
  check(`${dev.name}: PROPOSED — the renamed row shows its men again`, put.pucks === before.pucks, put)
  clip = await frame()
  const still = await p.evaluate(() => !!document.querySelector('#schedBoard [data-mock="new"]'))
  check(`${dev.name}: the drawn cell is still on the page at the picture`, still)
  await p.screenshot({ path: resolve(IMG, `${dev.name}-2-proposed.png`), clip })
  facts[dev.name + '.errors'] = errors
  check(`${dev.name}: no page errors`, errors.length === 0, errors)
  await browser.close()
}

await run({ name: 'desktop', vp: { width: 1536, height: 864 }, dpr: 1.25 })
await run({ name: 'phone', vp: { width: 402, height: 874 }, dpr: 3, phone: true, engine: 'webkit' }).catch(e => { console.log('FAIL  phone run — ' + e.message); fail.push('phone run') })
writeFileSync(resolve(HERE, 'facts.json'), JSON.stringify(facts, null, 1))
console.log(fail.length ? `FAILED: ${fail.join(' · ')}` : 'ALL PASS')
process.exit(fail.length ? 1 : 0)
