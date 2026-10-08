// THE MOCK-UP MAKER for [CAL-NOTE-WITH-PUCKS] (owner D684, 9 Oct 26 — "For the +note, perhaps just have a function to add
// pucks on the text written, instead of a +pucks button"; D688 — "more compact … there will be many inputs too I don't
// want people to scroll massively down"). It drives the BUILT app to a day that already holds FOUR inputs, adds a note
// and a row of pucks through the real controls, pictures it AS IT IS TODAY, then re-arranges the same real elements in
// the page to draw the direction three ways — so every puck, button and letter is the app's own. It prints how tall
// the note is in each and how many of the day's inputs are whole on the first screen. A DRAWING: nothing here is built.
//
//   node scripts/handpass/mk-note-pucks.mjs <out dir>          (the built bundle on :4180)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
const OUT = process.argv[2] || 'docs/mock/img/note-with-pucks'
mkdirSync(OUT, { recursive: true })
const URL = (process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const ISO = '2026-07-16'                                   // the demo's Thursday with four inputs
const H = 667                                              // a small phone: where the room matters most

async function day() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => window.go('inputs'))
  for (let i = 0; i < 40; i++) {
    const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = 2026 * 12 + 6 - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) break
    await page.locator(d > 0 ? '#icNext' : '#icPrev').click()
  }
  await page.locator(`#inpCal [data-icday="${ISO}"]`).tap({ position: { x: 10, y: 10 } })
  await page.locator('[data-testid="win-inputsday"]').waitFor(); await page.waitForTimeout(400)
  /* a note and a row of pucks, through the app's own controls */
  await page.locator('#icAddPuck').tap()
  await page.locator('.ic-poppuck-edit').fill('Brief the new guys, 0800')
  await page.locator('.ic-poppuck-edit').press('Enter'); await page.waitForTimeout(250)
  await page.locator('#icAddPucks').tap(); await page.locator('.ic-pick').waitFor()
  for (const i of [3, 9, 14, 20, 26]) await page.locator('.ic-pick .ic-pickp').nth(i).tap()
  await page.locator('#icPickOk').tap(); await page.waitForTimeout(400)
  return { ctx, page }
}
/* how tall the notes block is, and how many of the day's inputs are whole inside the window's first screen */
const measure = page => page.evaluate(() => {
  const w = document.querySelector('[data-testid="win-inputsday"]').getBoundingClientRect()
  const secs = document.querySelector('[data-testid="win-inputsday"] .ic-secs').getBoundingClientRect()
  const rows = [...document.querySelectorAll('[data-testid="win-inputsday"] [data-testid^="idy-row-"]')]
  return { note: Math.round(secs.height), inputsWhole: rows.filter(r => r.getBoundingClientRect().bottom <= w.bottom - 2).length, of: rows.length }
})
const shot = (page, name) => page.screenshot({ path: join(OUT, name + '.png') })
const say = (name, m) => console.log(`${name}: the note block is ${m.note}px tall; ${m.inputsWhole} of ${m.of} inputs whole on the first screen`)
/* the same first step for every drawing: the people leave their own row; "+ Pucks" leaves the bar */
const gather = page => page.evaluate(() => {
  const secs = [...document.querySelectorAll('[data-testid="win-inputsday"] .ic-sec')]
  const note = secs.find(s => s.querySelector('.ic-poppuck')), row = secs.find(s => s.querySelector('.ic-secpucks'))
  const grid = row.querySelector('.ic-secpk-grid'), add = row.querySelector('.ic-pkadd')
  grid.id = 'mockGrid'; add.id = 'mockAdd'
  const box = note.querySelector('.ic-poppuck')
  box.id = 'mockBox'; box.style.flexWrap = 'wrap'
  box.append(grid, add)
  row.remove()
  const b = document.querySelector('#icAddPucks'); if (b) b.remove()
})

/* A — AS IT IS TODAY */
{
  const { ctx, page } = await day()
  say('a-today', await measure(page)); await shot(page, 'a-today'); await ctx.close()
}
/* B — THE FIRST DRAWING: the people under the words, roomy */
{
  const { ctx, page } = await day(); await gather(page)
  await page.evaluate(() => {
    const g = document.getElementById('mockGrid'), a = document.getElementById('mockAdd')
    const wrap = document.createElement('div')
    wrap.style.cssText = 'flex:1 0 100%;display:flex;flex-direction:column;align-items:flex-start;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid var(--edge)'
    g.style.width = '100%'; a.textContent = '+ people'
    wrap.append(g, a); document.getElementById('mockBox').append(wrap)
  })
  say('b-roomy', await measure(page)); await shot(page, 'b-roomy'); await ctx.close()
}
/* C — COMPACT: the words on one slim line, the people four across straight under them, "+" as the last of them */
{
  const { ctx, page } = await day(); await gather(page)
  await page.evaluate(() => {
    const box = document.getElementById('mockBox'), g = document.getElementById('mockGrid'), a = document.getElementById('mockAdd')
    /* D692: the words line no taller than the box a note is typed in (28px) - the pencil and the cross drawn small */
    box.style.cssText += ';padding:2px 4px 6px 10px;min-height:0;row-gap:3px;align-items:center'
    box.querySelectorAll('button[data-ppedit],button[data-ppdel]').forEach(b => { b.style.cssText += ';min-width:28px;min-height:28px;width:28px;height:28px;padding:0' })
    g.style.cssText += ';flex:1 0 100%;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;width:100%'
    g.querySelectorAll('.ic-secpk-gap').forEach(x => x.remove())
    a.textContent = '+'
    a.setAttribute('aria-label', 'Add people')
    a.style.cssText += ';min-height:0;height:auto;align-self:stretch;padding:0;font-weight:700;border:1px dashed var(--edge-2);background:transparent;color:var(--ink-2);border-radius:5px;width:100%'
    g.append(a)
  })
  say('c-compact', await measure(page)); await shot(page, 'c-compact'); await ctx.close()
}
/* D — FOLDED: one line a note — its words and "5 people"; a tap unfolds the people */
{
  const { ctx, page } = await day(); await gather(page)
  await page.evaluate(() => {
    const box = document.getElementById('mockBox'), g = document.getElementById('mockGrid'), a = document.getElementById('mockAdd')
    const n = g.querySelectorAll('.ic-secpk:not(.ic-secpk-gap)').length
    box.style.cssText += ';padding:4px 6px 4px 10px;min-height:0;align-items:center;flex-wrap:nowrap'
    box.querySelectorAll('button[data-ppedit],button[data-ppdel]').forEach(b => { b.style.cssText += ';min-width:36px;min-height:36px;width:36px;height:36px;padding:0' })
    const chip = document.createElement('span')
    chip.textContent = n + ' people ▸'
    chip.style.cssText = 'flex:0 0 auto;margin-left:8px;padding:3px 9px;border:1px solid var(--edge-2);border-radius:999px;font-size:12px;font-weight:700;color:var(--ink-2);white-space:nowrap'
    box.querySelector('.ic-poppuck-txt').after(chip)
    g.remove(); a.remove()
  })
  say('d-folded', await measure(page)); await shot(page, 'd-folded'); await ctx.close()
}
/* E — COMPACT, PEOPLE AND NO WORDS (his question, 9 Oct 26: "If yes how would the user interface look like"): there is
   no line of words at all — the people, "+", and the note's two buttons at the end of the first row */
{
  const { ctx, page } = await day(); await gather(page)
  await page.evaluate(() => {
    const box = document.getElementById('mockBox'), g = document.getElementById('mockGrid'), a = document.getElementById('mockAdd')
    box.style.cssText += ';padding:6px 6px 6px 10px;min-height:0;align-items:flex-start;flex-wrap:nowrap;gap:6px'
    box.querySelector('.ic-poppuck-txt').remove()
    box.querySelectorAll('button[data-ppedit],button[data-ppdel]').forEach(b => { b.style.cssText += ';min-width:36px;min-height:36px;width:36px;height:36px;padding:0;flex:0 0 auto;order:2' })
    g.style.cssText += ';flex:1 1 auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;min-width:0;order:1;align-self:center'
    g.querySelectorAll('.ic-secpk-gap').forEach(x => x.remove())
    a.textContent = '+'
    a.style.cssText += ';min-height:0;height:auto;align-self:stretch;padding:0;font-weight:700;border:1px dashed var(--edge-2);background:transparent;color:var(--ink-2);border-radius:5px;width:100%'
    g.append(a)
  })
  say('e-people-only', await measure(page)); await shot(page, 'e-people-only'); await ctx.close()
}
await browser.close()
console.log('drawn into', OUT)
