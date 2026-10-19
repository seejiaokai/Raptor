/* [RALLY-PER-FORMATION] — the host's own short look at the BUILT rally box (19 Oct 26), before the walkers: the week (Edit
   Schedule and View-only Sched), the Scheduler Board, at his iPhone's width (402, density 3) and a desktop's (1440). A
   rally is TYPED THROUGH THE R BOX (a tap places the default, typing replaces it), never injected. Measures what the
   design note's requirements name: R over B and TO over LD on the week; on the board one line at 1440 and two stacked
   cells at 402; the four times one size on the desktop week; the phone board's remarks width; the suggestion's colour.
   Run: HP_URL=http://localhost:4298 node scripts/handpass/rally-look.mjs   Pictures: docs/img/handpass/2026-10-19-rally-build/look/ */
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

console.log('rally-look v1')
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..', '..')
const BASE = process.env.HP_URL || 'http://localhost:4298'
const OUT = resolve(ROOT, process.env.HP_SHOTS || 'docs/img/handpass/2026-10-19-rally-build/look')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const sleep = ms => new Promise(r => setTimeout(r, ms))
const errors = []
let fails = 0
const check = (ok, what, seen) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${what} — ${JSON.stringify(seen)}`); if (!ok) fails++ }

async function open(browser, sz) {
  const ctx = await browser.newContext({ viewport: { width: sz.width, height: sz.height }, deviceScaleFactor: sz.dsf, ...(sz.phone ? { isMobile: true, hasTouch: true } : {}) })
  const p = await ctx.newPage()
  p.on('console', m => { if (m.type() === 'error') errors.push(`${sz.tag}: ${m.text()}`) })
  p.on('pageerror', e => errors.push(`${sz.tag} PAGEERROR ${e.message}`))
  await p.goto(BASE + '/')
  await p.waitForSelector('#luser', { state: 'visible', timeout: 10000 })
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important} *{caret-color:transparent !important}' })
  return { ctx, p }
}
const tapAt = async (p, loc, phone) => {
  await loc.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  const b = await loc.boundingBox()
  if (phone) await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
}
const shotOf = async (p, sel, name) => {
  const el = p.locator(sel).first(); await el.evaluate(e => e.scrollIntoView({ block: 'start' })); await sleep(250)
  await el.screenshot({ path: `${OUT}/${name}.png` }); console.log('picture', name)
}

const browser = await chromium.launch(LAUNCH)
for (const sz of [{ tag: 'phone', width: 402, height: 874, dsf: 3, phone: true }, { tag: 'desk', width: 1440, height: 900, dsf: 2 }]) {
  const { ctx, p } = await open(browser, sz)
  await p.evaluate(() => window.go('editsched')); await sleep(800)
  const week = '#eWeek .day[data-day="0"]'
  /* the week, before: an empty R box carries the default rally faint inside it */
  const r = p.locator(`${week} [data-txt="ff:0.0.0.rl"]`)
  const sug = await r.evaluate(e => ({ ph: e.dataset.ph, text: e.textContent, cls: e.className, color: getComputedStyle(e, '::before').color, accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() }))
  check(sug.ph === '09:40' && sug.text === '' && /sugbox/.test(sug.cls), `${sz.tag} week: the empty R box suggests 09:40 (take-off 12:40 less 3h)`, sug)
  /* R over B, TO over LD, inside their cells */
  const geo = await p.evaluate(sel => {
    const form = document.querySelector(`${sel} [data-txt="ff:0.0.0.rl"]`).closest('.form')
    const R = q => form.querySelector(`[data-txt="ff:0.0.0.${q}"]`).getBoundingClientRect()
    const [rl, br, to, ld] = ['rl', 'br', 'to', 'ld'].map(R)
    const fs = ['rl', 'br', 'to', 'ld'].map(q => getComputedStyle(form.querySelector(`[data-txt="ff:0.0.0.${q}"]`)).fontSize)
    const cells = [...form.querySelectorAll('.fcell')].map(c => c.scrollHeight <= c.clientHeight + 1)
    return { rAboveB: rl.bottom <= br.top + 1, toAboveLd: to.bottom <= ld.top + 1, sameCol: Math.abs(rl.left - br.left) < 30 && Math.abs(to.left - ld.left) < 30, fs, unclipped: cells.every(Boolean), formH: Math.round(form.getBoundingClientRect().height) }
  }, week)
  check(geo.rAboveB && geo.toAboveLd && geo.sameCol && geo.unclipped, `${sz.tag} week: R over B, TO over LD, nothing clipped`, geo)
  if (!sz.phone) check(new Set(geo.fs).size === 1, `${sz.tag} week: the four times one size`, geo.fs)
  await shotOf(p, `${week} .go`, `${sz.tag}-01-week-before`)
  /* tap the empty R box: the default is placed, highlighted; type 1010 replaces it; leave → saved */
  await tapAt(p, r, sz.phone); await sleep(200)
  const placed = await r.evaluate(e => ({ text: e.textContent, sel: String(window.getSelection()) }))
  check(placed.text === '09:40' && placed.sel === '09:40', `${sz.tag} week: one tap placed 09:40, highlighted`, placed)
  await p.keyboard.type('1010'); await sleep(100)
  await p.keyboard.press('Enter'); await sleep(500)
  const saved = await p.evaluate(() => window.DAYS[0].waves[0].formations[0].rl)
  check(saved === '10:10', `${sz.tag} week: typing replaced it and Enter saved 10:10`, saved)
  await shotOf(p, `${week} .go`, `${sz.tag}-02-week-typed`)
  /* View-only Sched: the typed rally above B; an empty R keeps its line */
  await p.evaluate(() => window.go('viewsched')); await sleep(800)
  const view = await p.evaluate(() => {
    const day = document.querySelector('#vWeek .day[data-day="0"]'), forms = [...day.querySelectorAll('.go:not(.sa) .form')]
    return forms.slice(0, 2).map(f => ({ r: f.querySelector('.bto .rl')?.textContent, rH: Math.round(f.querySelector('.bto .rl')?.getBoundingClientRect().height || 0), b: f.querySelector('.bto b')?.textContent, to: f.querySelector('.ld span')?.textContent }))
  })
  check(view[0].r === '10:10' && view[1].r === '' && view[1].rH > 5 && view[1].b, `${sz.tag} view: VL shows R 10:10; RU's empty R keeps its line, B under it`, view)
  await shotOf(p, '#vWeek .day[data-day="0"] .go', `${sz.tag}-03-view`)
  /* the Scheduler Board */
  await p.evaluate(() => window.go('editsched')); await sleep(500)
  await p.evaluate(() => window.openScheduler(0)); await p.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(900)
  const board = await p.evaluate(() => {
    const line = [...document.querySelectorAll('#sbBoard .sb-line')].find(l => l.querySelector('[data-bfld="ff:0.0.1.rl"]'))
    const R = k => line.querySelector(`[data-bfld="ff:0.0.1.${k}"]`).getBoundingClientRect()
    const [rl, br, to, ld] = ['rl', 'br', 'to', 'ld'].map(R)
    const rmk = line.querySelector('.nts').getBoundingClientRect()
    const r = line.querySelector('[data-bfld="ff:0.0.1.rl"]')
    return { oneLine: [rl, br, to, ld].every(x => Math.abs(x.top - rl.top) < 2) && rl.left < br.left && br.left < to.left && to.left < ld.left,
      stacked: rl.bottom <= br.top + 1 && to.bottom <= ld.top + 1 && Math.abs(rl.left - br.left) < 2 && Math.abs(to.left - ld.left) < 2,
      lineH: Math.round(line.getBoundingClientRect().height), rmkW: Math.round(rmk.width), ph: r.placeholder, phColor: getComputedStyle(r, '::placeholder').color }
  })
  if (sz.phone) check(board.stacked && board.rmkW >= 150, `${sz.tag} board: R over B, TO over LD; remarks keep their width`, board)
  else check(board.oneLine, `${sz.tag} board: R · B · TO · LD in one line`, board)
  check(board.ph === '10:40', `${sz.tag} board: RU's empty R suggests 10:40`, board.ph)
  await shotOf(p, '#sbBoard .sb-go', `${sz.tag}-04-board`)
  await ctx.close()
}
await browser.close()
console.log('errors:', errors.length ? errors.join('\n') : 'none')
console.log(fails ? `${fails} FAIL` : 'all PASS')
