// THE OPEN ISSUES LIST LIGHTS EACH MAN IN HIS OWN COLOUR — the walk of his find of 11 Oct 26.
//   node scripts/handpass/warnring-walk.mjs <base-url> <label>      e.g.  http://localhost:4173/ after
// On each surface that lights pucks from a day's issues list — View-only Sched, Edit Schedule's week, the Scheduler
// Board — at phone and desktop width: open the list of a day that carries a red item AND a man only lesser items name,
// read what each lit puck is PAINTED with (the computed outline colour, never a class), and compare it with the colour
// of the worst line of the list that names him. Then tap one line of each colour and read its crew the same way.
// A PASS means right: every lit man wears his own colour. On the build before the fix this prints FAIL (the evidence).
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const BASE = process.argv[2] || 'http://localhost:4173/'
const LABEL = process.argv[3] || 'after'
const OUT = `docs/img/handpass/2026-10-11-group-input-one-row/warnring-${LABEL}`
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errs = [], rows = []
const RGB = { 'rgb(240, 85, 95)': 'red', 'rgb(229, 168, 59)': 'amber', 'rgb(138, 150, 163)': 'grey' }

async function open(viewport, scale) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`HTTP ${r.status()} ${r.url()}`) })
  await page.goto(BASE)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(600)
  return { ctx, page }
}

/* read one open list and the lit pucks under `scope`: what each man SHOULD wear (the worst shown line naming him)
   and what his puck is painted with */
const read = (page, scope, listSel) => page.evaluate(([scope, listSel, RGB]) => {
  const root = document.querySelector(scope); if (!root) return null
  const RANK = { hard: 3, adv: 2, note: 1 }, COL = { hard: 'red', adv: 'amber', note: 'grey' }
  const want = {}
  root.querySelectorAll(listSel + ' .witem').forEach(it => {
    if (it.classList.contains('hid') || it.classList.contains('wtr')) return
    const sev = ['hard', 'adv', 'note'].find(s => it.classList.contains(s)); if (!sev) return
    const b = it.querySelector('b'); if (!b) return
    b.textContent.split(',').map(s => s.trim()).filter(Boolean).forEach(cs => { if (!want[cs] || RANK[sev] > RANK[want[cs]]) want[cs] = sev })
  })
  const lit = [...root.querySelectorAll('.puck.wfoc:not(.echo)')].map(p => {
    const cs = (p.querySelector('.nm') || p).textContent.trim(), c = getComputedStyle(p).outlineColor
    return { cs, painted: RGB[c] || c, want: want[cs] ? COL[want[cs]] : '?' }
  })
  return { want, lit }
}, [scope, listSel, RGB])

const verdict = (where, r) => {
  const bad = r.lit.filter(x => x.painted !== x.want)
  const seen = [...new Set(r.lit.map(x => x.painted))].join('+')
  rows.push({ where, lit: r.lit.length, colours: seen, bad: bad.map(x => `${x.cs}: painted ${x.painted}, his worst item is ${x.want}`) })
  console.log(`${bad.length ? 'FAIL' : 'PASS'}  ${where}  — ${r.lit.length} lit (${seen})` + (bad.length ? '  ' + bad.slice(0, 4).map(x => `${x.cs} ${x.painted}≠${x.want}`).join('; ') : ''))
}

async function surface(page, size, root, name) {
  /* the day that can tell the colours apart: a red line and a line of another colour in its list */
  const n = await page.locator(`${root} .day:not(.peek)`).count()
  let di = -1
  for (let i = 0; i < n && di < 0; i++) {
    const bar = page.locator(`${root} .day:not(.peek)`).nth(i).locator('.daywarn[data-daywarn]').first()
    if (!(await bar.count())) continue
    await bar.scrollIntoViewIfNeeded(); await bar.click(); await page.waitForTimeout(350)
    const day = page.locator(`${root} .day:not(.peek)`).nth(i)
    const hard = await day.locator('.dwlist .witem.hard:not(.hid):not(.wtr)').count()
    const less = await day.locator('.dwlist .witem.note:not(.hid), .dwlist .witem.adv:not(.hid)').count()
    if (hard && less) di = i
    else { await day.locator('.daywarn[data-daywarn]').first().click(); await page.waitForTimeout(250) }
  }
  if (di < 0) { console.log(`SKIP  ${name}: no day with a red line and a lesser one`); return -1 }
  const scope = `${root} .day:not(.peek):nth-of-type(${di + 1})`
  const dayIdx = await page.evaluate(([root, di]) => +[...document.querySelectorAll(root + ' .day:not(.peek)')][di].dataset.day, [root, di])
  const sc = `${root} .day[data-day="${dayIdx}"]`
  verdict(`${name} · ${size} · list open`, await read(page, sc, '.dwlist'))
  const day = page.locator(sc)
  await day.locator('.dwbox').first().screenshot({ path: join(OUT, `${name}-${size}-list.png`) })
  /* the first two sections that hold a lit puck — the picture he took */
  const secs = await day.locator('[class*="sec-"]:has(.puck.wfoc)').all()
  for (let k = 0; k < Math.min(2, secs.length); k++) { await secs[k].scrollIntoViewIfNeeded(); await page.waitForTimeout(150); await secs[k].screenshot({ path: join(OUT, `${name}-${size}-lit${k + 1}.png`) }) }
  /* one tapped line of each colour the list has */
  for (const sev of ['hard', 'adv', 'note']) {
    const it = day.locator(`.dwlist .witem.${sev}[data-wdi]:not(.hid):not(.wtr)`).filter({ has: page.locator('b') }).first()
    if (!(await it.count())) continue
    await it.scrollIntoViewIfNeeded(); await it.click(); await page.waitForTimeout(450)
    const r = await read(page, sc, '.dwlist .witem.on, .dwlist')
    const names = (await it.locator('b').first().textContent()).split(',').map(s => s.trim())
    const want = { hard: 'red', adv: 'amber', note: 'grey' }[sev]
    const lit = r.lit.map(x => ({ ...x, want: names.includes(x.cs) ? want : 'not lit' }))
    verdict(`${name} · ${size} · a tapped ${want} line`, { lit })
    if (sev === 'note') { const s2 = day.locator('[class*="sec-"]:has(.puck.wfoc)').first(); if (await s2.count()) { await s2.scrollIntoViewIfNeeded(); await s2.screenshot({ path: join(OUT, `${name}-${size}-tapped-note.png`) }) } }
    await it.click(); await page.waitForTimeout(300)   // tap again: back to the open list
  }
  await day.locator('.daywarn[data-daywarn]').first().click().catch(() => {}); await page.waitForTimeout(250)
  return dayIdx
}

async function board(page, size, dayIdx) {
  /* the board's own list does not light by being opened — only a tapped line lights its crew there */
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(300)
  await page.evaluate(d => window.openScheduler(d), dayIdx); await page.waitForTimeout(900)
  /* the board's lines are `.wln`; a line that names no man (a line's own timing fault) lights a box, not a puck — skipped */
  const item = sev => page.locator(`#schedBoard .wln.${sev}[data-wdi]:not(.hid)`).first()
  if (!(await item('hard').isVisible().catch(() => false))) { const tog = page.locator('#schedBoard [data-sbwtog]').first(); if (await tog.count()) { await tog.click(); await page.waitForTimeout(400) } }
  for (const sev of ['hard', 'adv', 'note']) {
    const it = item(sev)
    if (!(await it.count()) || !(await it.isVisible().catch(() => false))) continue
    await it.scrollIntoViewIfNeeded(); await it.locator('.wln-t').first().click(); await page.waitForTimeout(500)
    const want = { hard: 'red', adv: 'amber', note: 'grey' }[sev]
    const lit = await page.evaluate(RGB => [...document.querySelectorAll('#schedBoard .sb-boardwrap .puck.wfoc')].map(p => { const c = getComputedStyle(p).outlineColor; return { cs: (p.querySelector('.nm') || p).textContent.trim(), painted: RGB[c] || c } }), RGB)
    if (!lit.length) { console.log(`SKIP  Scheduler Board · ${size} · a tapped ${want} line: it lit no puck`); continue }
    verdict(`Scheduler Board · ${size} · a tapped ${want} line`, { lit: lit.map(x => ({ ...x, want })) })
    if (sev === 'note') await page.screenshot({ path: join(OUT, `board-${size}-tapped-note.png`) })
    const again = page.locator('#schedBoard .wln.on .wln-t').first(); if (await again.isVisible().catch(() => false)) { await again.click(); await page.waitForTimeout(300) }
    if (!(await item('hard').isVisible().catch(() => false))) { const tog = page.locator('#schedBoard [data-sbwtog]').first(); if (await tog.count()) { await tog.click(); await page.waitForTimeout(400) } }
  }
  await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await page.waitForTimeout(300)
}

for (const [size, viewport, scale] of [['phone', { width: 390, height: 844 }, 2], ['desktop', { width: 1440, height: 900 }, 1]]) {
  const { ctx, page } = await open(viewport, scale)
  const d1 = await surface(page, size, '#vWeek', 'View-only Sched')
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
  const d2 = await surface(page, size, '#eWeek', 'Edit Schedule')
  if (d2 >= 0 || d1 >= 0) await board(page, size, d2 >= 0 ? d2 : d1)
  await ctx.close()
}
/* one picture more, for him: a day whose open list lights a man in a note's GREY (a long work day and nothing worse) */
{
  const { ctx, page } = await open({ width: 390, height: 844 }, 2)
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
  const n = await page.locator('#eWeek .day:not(.peek)').count()
  for (let i = 0; i < n; i++) {
    const day = page.locator('#eWeek .day:not(.peek)').nth(i), bar = day.locator('.daywarn[data-daywarn]').first()
    if (!(await bar.count())) continue
    await bar.scrollIntoViewIfNeeded(); await bar.click(); await page.waitForTimeout(350)
    const grey = day.locator('.puck.wfoc.notef').first()
    if (await grey.count()) {
      await day.locator('.dwbox').first().screenshot({ path: join(OUT, 'grey-list.png') })
      const sec = day.locator('[class*="sec-"]:has(.puck.wfoc.notef)').first()
      await sec.scrollIntoViewIfNeeded(); await page.waitForTimeout(200); await sec.screenshot({ path: join(OUT, 'grey-open-list.png') })
      console.log('saved grey-open-list (day ' + i + ')'); break
    }
    await bar.click(); await page.waitForTimeout(250)
  }
  await ctx.close()
}
await browser.close()
const bad = rows.filter(r => r.bad.length)
writeFileSync(join(OUT, 'result.json'), JSON.stringify({ base: BASE, label: LABEL, rows, errs }, null, 1))
console.log(`\n${rows.length - bad.length} of ${rows.length} PASS · browser errors: ${errs.length}` + (errs.length ? '\n' + errs.slice(0, 5).join('\n') : ''))
process.exit(bad.length || errs.length ? 1 : 0)
