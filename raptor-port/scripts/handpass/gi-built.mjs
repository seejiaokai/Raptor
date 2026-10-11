// [GROUP-INPUT-ONE-ROW] — the BUILT screens, pictured in the very framing of the approved pictures (D743; D624's
// practice: each approved mock-up set beside the built screen at the same size, in the check's evidence).
// The same scenes gi-mock.mjs drew — the same inputs filed through the app's own controls, the same sections, the same
// crops — with NOTHING re-arranged on the page: what is pictured is what the build draws. Each picture is saved under
// the approved picture's own name ("a-desk-week-ground" beside "a-desk-week-ground-2new"), so the two pair by name.
//   node scripts/handpass/gi-built.mjs [scene …]      scenes: draft big pub        LOOK_URL=http://localhost:4180/
// It also SAYS what it read off each screen (rows, pucks, counts) — the walk's own facts, printed for the sheet.
import { browser, open, fileInput, press, DESK, PHONE, errs } from './gi-lib.mjs'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const OUT = process.env.GI_OUT || 'docs/handpass/img/2026-10-11-group-input-one-row'
mkdirSync(OUT, { recursive: true })
const ISO = '2026-07-15', DI = 2            // the demo week's Wednesday
const FOUR = ['Drifter', 'Hunter', 'Ranger', 'Tally'], TEN = ['Anvil', 'Blade', 'Cinch', 'Drifter', 'Echo', 'Forge', 'Hunter', 'Ranger', 'Tally', 'Vapor']
const TITLE = 'Range safety brief'
const only = process.argv.slice(2)
const scene = async (name, fn) => { if (only.length && !only.includes(name)) return; try { await fn() } catch (e) { console.log(`SCENE ${name} FAILED: ` + String(e.stack || e).split('\n').slice(0, 6).join(' | ')) } }
const SIZES = [['desk', DESK, false], ['phone', PHONE, true]]
const shot = async (p, name, clip) => { await p.screenshot({ path: join(OUT, name + '.png'), ...(clip ? { clip } : {}) }); console.log('saved ' + name) }
const HEADCLIP = { desk: { x: 0, y: 98, width: 560, height: 250 }, phone: { x: 0, y: 118, width: 390, height: 150 } }
const listClip = p => p.evaluate(() => { const r = document.querySelector('.chgwin').getBoundingClientRect(); return { x: Math.max(0, r.left - 4), y: Math.max(0, r.top - 4), width: Math.min(innerWidth, r.width + 8), height: Math.min(r.height + 8, 400) } })
const hideToast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = 'none' })
const toWeekSec = (p, key) => p.evaluate(([di, key]) => {
  const day = [...document.querySelectorAll('#page-editsched .day:not(.peek)')][di]
  day.scrollIntoView({ inline: 'start', block: 'nearest' })
  const sec = day.querySelector(`[data-secmove="${di}.${key}"]`)
  const y = sec.getBoundingClientRect().top + window.scrollY - 96
  window.scrollTo(0, Math.max(0, y))
}, [DI, key])
const toBoardSec = (p, key) => p.evaluate(([di, key]) => {
  const sec = document.querySelector(`#schedBoard [data-secmove="${di}.${key}"]`)
  sec.scrollIntoView({ block: 'start' })
  for (let n = sec.parentElement; n; n = n.parentElement) if (n.scrollHeight > n.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(n).overflowY)) { n.scrollTop -= 10; break }
}, [DI, key])
async function pic(p, tag, sel, name) {
  await p.waitForTimeout(350)
  if (tag === 'phone') return shot(p, name)
  await p.evaluate(() => { for (const x of [20, 40]) for (const y of [300, 450, 650]) { const b = document.elementFromPoint(x, y)?.closest('button'); if (b && /^[‹›❮❯<>]$/.test(b.textContent.trim())) b.style.visibility = 'hidden' } })
  await p.locator(sel).first().screenshot({ path: join(OUT, name + '.png') }); console.log('saved ' + name)
}
const WK = k => `#page-editsched .day:not(.peek) [data-secmove="${DI}.${k}"]`
const BD = k => `#schedBoard [data-secmove="${DI}.${k}"]`

/* what a screen draws for the shared input: its rows, and each row's pucks in the order drawn */
const readRows = (p, title) => p.evaluate(title => {
  const norm = s => (s || '').trim().toLowerCase()
  const names = r => [...r.querySelectorAll('.ppl .puck .nm')].map(n => n.textContent.trim())
  const pick = (sel, name) => [...document.querySelectorAll(sel)].filter(r => norm(name(r)) === title).map(names)
  return {
    weekGround: pick('#page-editsched .day:not(.peek) .sec-grnd .pl-row', r => r.querySelector('.nm .ntx')?.textContent),
    weekInputs: pick('#page-editsched .day:not(.peek) .sec-inp .pl-row', r => r.querySelector('.nm .ntx')?.textContent),
    boardGround: pick('#schedBoard .sb-panel.grnd .sb-arow', r => r.querySelector('textarea.ain, input.ain')?.value),
    boardInputs: pick('#schedBoard .sb-panel.pinp .sb-arow.inprow', r => r.querySelector('.inpedit')?.textContent),
  }
}, title.toLowerCase())

async function fourScreens(page, tag, touch, pre) {
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
  await hideToast(page)
  const fold = page.locator(`#page-editsched .day:not(.peek) [data-pitog="${DI}"]`).first()
  console.log(tag, 'Personal Inputs, folded, reads:', (await fold.innerText()).replace(/\s+/g, ' '))
  if (/show/.test(await fold.innerText())) { await press(touch, fold); await page.waitForTimeout(400) }
  await toWeekSec(page, 'ground'); await pic(page, tag, WK('ground'), `${pre}-${tag}-week-ground`)
  await toWeekSec(page, 'inputs'); await pic(page, tag, WK('inputs'), `${pre}-${tag}-week-inputs`)
  const wk = await readRows(page, TITLE)
  console.log(tag, 'week ground rows:', JSON.stringify(wk.weekGround), '· week Personal Inputs lines:', JSON.stringify(wk.weekInputs))
  await page.evaluate(di => window.openScheduler(di), DI); await page.waitForTimeout(900)
  await toBoardSec(page, 'ground'); await pic(page, tag, BD('ground'), `${pre}-${tag}-board-ground`)
  await toBoardSec(page, 'inputs'); await pic(page, tag, BD('inputs'), `${pre}-${tag}-board-inputs`)
  const bd = await readRows(page, TITLE)
  console.log(tag, 'board ground rows:', JSON.stringify(bd.boardGround), '· board Personal Inputs lines:', JSON.stringify(bd.boardInputs))
}

/* A — a day not yet published: a meeting for four men, one of them on leave that day (flagged on the row, D605) */
await scene('draft', async () => {
  for (const [tag, vp, touch] of SIZES) {
    const { ctx, page } = await open(vp, 'ad', 'a', touch)
    await fileInput(page, { type: 'LL', person: 'Hunter', from: ISO, to: ISO }, touch)
    await fileInput(page, { type: 'Meeting', people: FOUR, from: ISO, to: ISO, timed: ['14:00', '15:00'], title: TITLE, rmk: 'Bring your logbook' }, touch)
    await fourScreens(page, tag, touch, 'a')
    await ctx.close()
  }
})

/* B — a big one: ten people on the one row */
await scene('big', async () => {
  for (const [tag, vp, touch] of SIZES) {
    const { ctx, page } = await open(vp, 'ad', 'a', touch)
    await fileInput(page, { type: 'Meeting', people: TEN, from: ISO, to: ISO, timed: ['14:00', '15:00'], title: TITLE, rmk: 'Bring your logbook' }, touch)
    await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600); await hideToast(page)
    await toWeekSec(page, 'ground'); await pic(page, tag, WK('ground'), `b-${tag}-week-ground-ten`)
    console.log(tag, 'ten, week:', JSON.stringify((await readRows(page, TITLE)).weekGround))
    await page.evaluate(di => window.openScheduler(di), DI); await page.waitForTimeout(900)
    await toBoardSec(page, 'ground'); await pic(page, tag, BD('ground'), `b-${tag}-board-ground-ten`)
    console.log(tag, 'ten, board:', JSON.stringify((await readRows(page, TITLE)).boardGround))
    await ctx.close()
  }
})

/* C — a PUBLISHED day: the Wednesday is signed and published first, then the meeting is filed - a change waiting to go out */
await scene('pub', async () => {
  for (const [tag, vp, touch] of SIZES) {
    const { ctx, page } = await open(vp, 'ad', 'a', touch)
    await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(400)
    await page.evaluate(di => window.openScheduler(di), DI); await page.waitForTimeout(900)
    const sels = page.locator(`#schedBoard [data-signday="${DI}"]`)
    for (let i = 0; i < await sels.count(); i++) {
      const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
      if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
      await page.waitForTimeout(120)
    }
    const beak = page.locator(`#schedBoard [data-beak="${DI}"]`).first()
    await beak.evaluate(b => b.click()); await page.waitForTimeout(700)
    const ok = page.getByRole('button', { name: /^(Publish|Yes|Confirm|Issue)/ }).first()
    if (await ok.count() && await ok.isVisible()) { await ok.evaluate(b => b.click()); await page.waitForTimeout(900) }
    await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await page.waitForTimeout(400)
    await fileInput(page, { type: 'Meeting', people: FOUR, from: ISO, to: ISO, timed: ['14:00', '15:00'], title: TITLE, rmk: 'Bring your logbook' }, touch)
    await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600); await hideToast(page)
    const toTop = () => page.evaluate(di => { const day = [...document.querySelectorAll('#page-editsched .day:not(.peek)')][di]; day.scrollIntoView({ inline: 'start', block: 'nearest' }); window.scrollTo(0, 0) }, DI)
    await toTop(); await page.waitForTimeout(300); await shot(page, `c-${tag}-pub-head`, HEADCLIP[tag])
    const headTxt = await page.evaluate(di => [...document.querySelectorAll('#page-editsched .day:not(.peek)')][di].innerText.slice(0, 300), DI)
    console.log(tag, 'published day, head reads:', headTxt.replace(/\s+/g, ' '))
    await page.evaluate(di => {
      const day = [...document.querySelectorAll('#page-editsched .day:not(.peek)')][di]
      const c = [...day.querySelectorAll('*')].filter(e => /\d+\s+pending/.test(e.textContent) && e.textContent.length < 30)
      c[c.length - 1]?.setAttribute('data-gi', 'pend')
    }, DI)
    await press(touch, page.locator('[data-gi="pend"]')); await page.waitForTimeout(700)
    await shot(page, `c-${tag}-pub-list`, await listClip(page))
    const win = await page.evaluate(() => { const w = document.querySelector('.chgwin'); return w ? w.innerText.slice(0, 900) : null })
    console.log(tag, 'changes window reads:', (win || '').replace(/\s+/g, ' | '))
    await press(touch, page.locator('.chgwin .win-x')); await page.waitForTimeout(300)
    await fourScreens(page, tag, touch, 'c')
    await ctx.close()
  }
})

console.log('errs', errs)
await browser.close()
