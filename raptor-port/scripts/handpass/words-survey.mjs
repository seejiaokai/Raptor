// THE WHOLE-APP WORDS PASS (owner D808, 16 Oct 26) — step 1, the survey. Visits every page of the built app as the
// admin (Saber) and as a member (Ranger), at a desktop and at a phone's size, takes a picture of each, and records every
// sentence of four words or more the page SHOWS (a text with a box wider than 1px — walk-scripts.md §4: never innerText,
// which counts screen-reader words too). The record is what the page order of the pass is chosen from; nothing is changed.
//
//   node scripts/handpass/words-survey.mjs [out dir]        (LOOK_URL=http://localhost:4180/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

console.log('words-survey v2')
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || join(HERE, '../../docs/img/handpass/2026-10-16-words-pass/survey')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4180/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})

const PAGES = ['editsched', 'board', 'viewsched', 'inputs', 'inputs-list', 'sans', 'medical', 'quals', 'logic', 'leavewar', 'tracker', 'help', 'admin']
const SIZES = [{ tag: 'desk', viewport: { width: 1440, height: 900 } }, { tag: 'phone', viewport: { width: 390, height: 844 }, touch: true }]
const ROLES = [{ tag: 'admin', u: 'ad', p: 'a' }, { tag: 'member', u: 'us', p: 'us' }]
const errs = []
const record = {}

/* every visible sentence: text nodes joined per element that owns them, boxes wider than 1px, inside the viewport's
   page (not hidden by display/visibility), four words or more */
const sentences = page => page.evaluate(() => {
  const out = new Set()
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT)
  let el
  while ((el = walk.nextNode())) {
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').replace(/\s+/g, ' ').trim()
    if (!own) continue
    const r = el.getBoundingClientRect()
    if (r.width <= 1 || r.height <= 1) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue
    if (el.closest('[hidden],[aria-hidden="true"]')) continue
    const text = (el.innerText || own).replace(/\s+/g, ' ').trim()
    const words = text.split(' ').filter(w => /[A-Za-z]/.test(w))
    if (words.length >= 4 && text.length < 400) out.add(text)
  }
  return [...out]
})

async function to(page, name) {
  await page.evaluate(() => { document.querySelectorAll('#schedBoard .sb-x, #schedBoard [aria-label="Close"]').forEach(b => b.click()) })
  const p = name === 'board' ? 'editsched' : name.startsWith('inputs') || name === 'sans' || name === 'medical' ? 'inputs' : name
  await page.evaluate(p => window.go(p), p)
  await page.waitForTimeout(500)
  if (name === 'board') {
    const b = page.locator('[data-board], #openBoard, button:has-text("Board")').first()
    if (await b.count()) { await b.click(); await page.waitForTimeout(700) } else return false
  }
  if (name === 'inputs-list') { const b = page.locator('#inListBtn'); if (!(await b.count())) return false; await b.click(); await page.waitForTimeout(400) }
  if (name === 'inputs') { const b = page.locator('#inCalBtn'); if (await b.count()) { await b.click(); await page.waitForTimeout(400) } }
  if (name === 'sans' || name === 'medical') {
    const t = page.locator(`[role="tab"]:has-text("${name === 'sans' ? 'SANS' : 'Medical'}"), button:has-text("${name === 'sans' ? 'SANS' : 'Medical'}")`).first()
    if (!(await t.count())) return false
    await t.click(); await page.waitForTimeout(500)
  }
  return true
}

for (const role of ROLES) for (const size of SIZES) {
  const ctx = await browser.newContext({ viewport: size.viewport, deviceScaleFactor: size.touch ? 2 : 1, ...(size.touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  const tag = `${role.tag}-${size.tag}`
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 200)) })
  await page.goto(URL)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.fill('#luser', role.u); await page.fill('#lpass', role.p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(600)
  for (const name of PAGES) {
    let ok = false
    try { ok = await to(page, name) } catch (e) { errs.push(`${tag} ${name}: ${String(e.message || e).split('\n')[0]}`) }
    const reached = ok && await page.evaluate(() => window.CURPAGE)
    if (!ok) { record[`${tag}/${name}`] = { reached: false }; console.log(`${tag.padEnd(13)} ${name.padEnd(12)} NOT REACHED`); continue }
    await page.screenshot({ path: join(OUT, `${tag}-${name}.png`) })
    const s = await sentences(page)
    const words = s.reduce((n, t) => n + t.split(' ').length, 0)
    record[`${tag}/${name}`] = { reached, sentences: s.length, words, text: s }
    console.log(`${tag.padEnd(13)} ${name.padEnd(12)} on ${reached}: ${s.length} sentences, ${words} words`)
  }
  await ctx.close()
}
writeFileSync(join(OUT, 'survey.json'), JSON.stringify(record, null, 1))
console.log('errors:', errs.length); for (const e of errs.slice(0, 20)) console.log('  ' + e)
await browser.close()
