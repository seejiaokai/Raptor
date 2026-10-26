// Walker 3, section D (scenarios 33-45): the top row and the grid bar.  node scripts/handpass/lw-m2-walk-3-d.mjs [only-numbers...]
import { chromium } from '@playwright/test'
import * as L from './lw-m2-walk-3-lib-r.mjs'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const { T, tap, vis, txt, rec, shot } = L
const only = process.argv.slice(2).map(Number)
const want = n => !only.length || only.includes(n)
const all = []
const run = async (n, fn) => { if (!want(n)) return; try { await fn() } catch (e) { L.rec(n, '?', 'NOT RUN', 'script error: ' + String(e).slice(0, 300)) } }
const near = (a, b, tol) => Math.abs(a - b) <= tol
const cy = b => b.y + b.height / 2

/* 33 admin desktop 1536 (and a real 125%) */
async function topRowDesk(w, tag, n) {
  await w.page.evaluate(() => window.scrollTo(0, 0))
  const ids = ['lw-tab-grid', 'oil-tracker', 'war-picker', 'my-leave', 'settings-open']
  const bx = {}
  for (const i of ids) bx[i] = await L.boxOf(w.page, T(i))
  const missing = ids.filter(i => !bx[i])
  const ys = ids.filter(i => bx[i]).map(i => cy(bx[i]))
  const one = ys.length && Math.max(...ys) - Math.min(...ys) < 8
  const bar = await w.page.evaluate(() => { const e = document.querySelector('.lw-top'); const b = e.getBoundingClientRect(); return { h: Math.round(b.height), text: e.innerText.replace(/\s+/g, ' ') } })
  const noView = !/Viewing as/i.test(bar.text) && !(await w.page.locator('.lw-top button', { hasText: /^\s*\+/ }).count())
  const order = bx['lw-tab-grid'] && bx['oil-tracker'] && bx['war-picker'] && bx['my-leave'] && bx['settings-open'] && bx['lw-tab-grid'].x < bx['oil-tracker'].x && bx['oil-tracker'].x < bx['war-picker'].x && bx['war-picker'].x < bx['my-leave'].x && bx['my-leave'].x < bx['settings-open'].x
  const gearRight = bx['settings-open'] && bx['settings-open'].x + bx['settings-open'].width > (await w.page.evaluate(() => innerWidth)) - 80
  const dw = await L.docWidth(w.page)
  const noH = dw.sw <= dw.cw
  await shot(w, `s${n}-${tag}-toprow`, { clip: { x: 0, y: 0, width: (await w.page.evaluate(() => innerWidth)), height: 240 } })
  const ok = !missing.length && one && noView && order && gearRight && noH && bar.h < 80
  rec(n, tag, ok ? 'PASS' : 'FAIL', `missing=${missing.join(',') || 'none'}; centres within ${ys.length ? Math.round(Math.max(...ys) - Math.min(...ys)) : '?'}px (one row=${one}); bar height ${bar.h}; no "Viewing as"/"+" button=${noView}; order tabs<View<My leave<gear=${!!order}; gear at right end=${!!gearRight}; no sideways page scroll=${noH} (${dw.sw}/${dw.cw}); bar text: "${bar.text}"`, [`s${n}-${tag}-toprow.png`])
}
await run(33, async () => {
  let w = await L.newWorld('desk'); await L.signIn(w, 'admin')
  await topRowDesk(w, 'desk1536', 33)
  const e = w.errs.slice(); await w.ctx.close()
  // a real 125%: a browser started at that scaling, viewport 1229 css px wide
  const b = await chromium.launch({ ...L.launchOptions, args: ['--force-device-scale-factor=1.25', '--window-size=1536,864'] })
  const ctx = await b.newContext({ viewport: null })
  const page = await ctx.newPage(); const w2 = { page, ctx, errs: [], touch: false }
  page.on('console', m => { if (m.type() === 'error') w2.errs.push(m.text().slice(0, 200)) }); page.on('pageerror', x => w2.errs.push(String(x).slice(0, 200)))
  await L.signIn(w2, 'admin')
  const dpr = await page.evaluate(() => window.devicePixelRatio)
  await topRowDesk(w2, `desk125-dpr${dpr}`, 33)
  w2.errs.forEach(x => all.push('125%: ' + x)); await b.close(); e.forEach(x => all.push(x))
})

/* 34 member phone 390 / 35 admin phone 390 */
async function phoneTop(who, n) {
  const w = await L.newWorld('phone'); await L.signIn(w, who, who === 'member' ? '2026-01-05' : undefined)
  await w.page.evaluate(() => window.scrollTo(0, 0))
  const ids = ['lw-tab-grid', 'oil-tracker', 'settings-open', 'war-picker', 'my-leave']
  const bx = {}; for (const i of ids) bx[i] = await L.boxOf(w.page, T(i))
  const tabsY = cy(bx['lw-tab-grid']); const viewY = cy(bx['war-picker'])
  const sameTabRow = near(cy(bx['oil-tracker']), tabsY, 6) && (who === 'admin' ? bx['settings-open'] && near(cy(bx['settings-open']), tabsY, 10) : !bx['settings-open'])
  const sameViewRow = bx['my-leave'] && near(cy(bx['my-leave']), viewY, 14)
  const two = viewY > tabsY + 30
  // third line: nothing else visible between the view line and the grid card
  const card = await w.page.evaluate(() => { const c = document.querySelector('[data-testid="counts-toggle"]'); const b = c.getBoundingClientRect(); const v = document.querySelector('.lw-viewline').getBoundingClientRect(); return { cardBtnY: b.y, viewBottom: v.bottom } })
  const gap = card.cardBtnY - card.viewBottom
  const dw = await L.docWidth(w.page)
  const myText = await txt(w.page, T('my-leave'))
  await shot(w, `s${n}-phone-top`, { clip: { x: 0, y: 0, width: 390, height: 360 } })
  const ok = sameTabRow && sameViewRow && two && dw.sw === 390 && dw.cw === 390 && gap < 60 && bx['my-leave'].x + bx['my-leave'].width <= 390
  rec(n, 'phone390', ok ? 'PASS' : 'FAIL', `${who}: tabs row y=${Math.round(tabsY)} (OIL same row=${near(cy(bx['oil-tracker']), tabsY, 6)}; gear ${bx['settings-open'] ? 'present at y=' + Math.round(cy(bx['settings-open'])) : 'absent'}); view line y=${Math.round(viewY)}, My leave same line=${!!sameViewRow}, My leave right edge ${Math.round(bx['my-leave'].x + bx['my-leave'].width)}; gap from view line to the grid bar ${Math.round(gap)}px (no third line); document width ${dw.sw}/${dw.cw}; My leave reads "${myText}"`, [`s${n}-phone-top.png`])
  w.errs.forEach(x => all.push(`${n}: ` + x)); await w.ctx.close()
}
await run(34, () => phoneTop('member', 34))
await run(35, () => phoneTop('admin', 35))

/* helper: pick the 2028 range in the new-period window */
async function makePeriod(w, name) {
  await w.page.selectOption(T('war-picker'), { label: '+ New period' })
  await w.page.waitForSelector(T('war-name'))
  await w.page.fill(T('war-name'), name)
  // the calendar starts at the next free day; pick the 1st and the 3rd of the shown month
  const days = await w.page.evaluate(() => [...document.querySelectorAll('[data-testid^="war-day-"]')].map(e => e.dataset.testid))
  const pick = days.filter(d => !d.includes('out')).slice(0, 5)
  await tap(w, T(pick[0])); await tap(w, T(pick[2]))
  await w.page.waitForTimeout(200)
  return { days: days.length, pick }
}
await run(36, async () => {
  const LONG = 'The Very Long Leave Period Name For The Squadron Annual Overseas Detachment Rotation Cycle Two Thousand And Twenty Eight Plus Extra Words To Reach A Hundred And Sixty Characters Total'
  const MED = 'Annual Leave Period For The Whole Squadron 2028'
  for (const [NM, nt] of [[LONG, 'long'], [MED, 'med']]) for (const [size, tag0] of [['desk', 'desk1536'], ['phone', 'phone390'], ['m431', '431'], ['mid', '600'], ['m500', '500']]) {
    const tag = tag0 + '-' + nt
    const w = await L.newWorld(size); await L.signIn(w, 'admin')
    const info = await makePeriod(w, NM)
    const created = await w.page.locator(T('war-create')).isEnabled()
    await tap(w, T('war-create')); await w.page.waitForTimeout(800)
    await w.page.evaluate(() => window.scrollTo(0, 0))
    const sel = await w.page.evaluate(() => { const s = document.querySelector('[data-testid="war-picker"]'); return s.selectedOptions[0].textContent })
    const bx = {}; for (const i of ['war-picker', 'my-leave', 'settings-open', 'lw-tab-grid']) bx[i] = await L.boxOf(w.page, T(i))
    const dw = await L.docWidth(w.page)
    const vw = w.page.viewportSize().width
    const inside = Object.values(bx).filter(Boolean).every(b => b.x >= -1 && b.x + b.width <= vw + 1)
    const overlap = bx['war-picker'] && bx['my-leave'] && bx['war-picker'].x + bx['war-picker'].width > bx['my-leave'].x + 1 && Math.abs(cy(bx['war-picker']) - cy(bx['my-leave'])) < 40
    await shot(w, `s36-${tag}`, { clip: { x: 0, y: 0, width: vw, height: 300 } })
    const ok = created && inside && !overlap && dw.sw <= dw.cw
    rec(36, tag, ok ? 'PASS' : 'FAIL', `period created=${created} (name length ${NM.length}; picker shows ${sel.length} chars); picker box ${JSON.stringify(bx['war-picker'] && [Math.round(bx['war-picker'].x), Math.round(bx['war-picker'].width)])}; My leave ${bx['my-leave'] ? 'visible at x=' + Math.round(bx['my-leave'].x) + ' w=' + Math.round(bx['my-leave'].width) : 'ABSENT'}; every top-row control inside the screen=${inside}; picker overlaps My leave=${!!overlap}; document ${dw.sw}/${dw.cw}`, [`s36-${tag}.png`])
    w.errs.forEach(x => all.push('36: ' + x)); await w.ctx.close()
  }
})

/* 37 "+ New period" */
await run(37, async () => {
  for (const size of ['desk', 'phone']) {
    const w = await L.newWorld(size); await L.signIn(w, 'admin')
    const opts = await w.page.evaluate(() => [...document.querySelector('[data-testid="war-picker"]').options].map(o => o.textContent))
    const before = opts[0]
    const last = opts[opts.length - 1]
    await w.page.selectOption(T('war-picker'), { label: '+ New period' }); await w.page.waitForSelector(T('war-name'))
    await shot(w, `s37-${size}-window`)
    const open1 = await vis(w.page, T('war-name'))
    await tap(w, T('war-cancel')); await w.page.waitForTimeout(300)
    const shownAfterCancel = await w.page.evaluate(() => document.querySelector('[data-testid="war-picker"]').selectedOptions[0].textContent)
    await w.page.selectOption(T('war-picker'), { label: '+ New period' }); await w.page.waitForSelector(T('war-name'))
    const open2 = await vis(w.page, T('war-name'))
    await tap(w, T('war-cancel')); await w.page.waitForTimeout(200)
    const info = await makePeriod(w, 'WALK 28')
    await tap(w, T('war-create')); await w.page.waitForTimeout(800)
    const opts2 = await w.page.evaluate(() => ({ all: [...document.querySelector('[data-testid="war-picker"]').options].map(o => o.textContent), sel: document.querySelector('[data-testid="war-picker"]').selectedOptions[0].textContent }))
    await w.page.evaluate(() => window.scrollTo(0, 0)); await shot(w, `s37-${size}-created`, { clip: { x: 0, y: 0, width: w.page.viewportSize().width, height: 320 } })
    const ok = last === '+ New period' && open1 && shownAfterCancel === before && open2 && opts2.sel === 'WALK 28' && opts2.all.includes('WALK 28') && opts2.all[opts2.all.length - 1] === '+ New period'
    rec(37, size === 'desk' ? 'desk1536' : 'phone390', ok ? 'PASS' : 'FAIL', `admin list: ${JSON.stringify(opts)}; window opened=${open1}; after Cancel picker shows "${shownAfterCancel}" (was "${before}"); chosen again opened=${open2}; after Create selected="${opts2.sel}", list=${JSON.stringify(opts2.all)}`, [`s37-${size}-window.png`, `s37-${size}-created.png`])
    w.errs.forEach(x => all.push('37: ' + x)); await w.ctx.close()
  }
  const w = await L.newWorld('phone'); await L.signIn(w, 'member', '2026-01-05')
  const opts = await w.page.evaluate(() => [...document.querySelector('[data-testid="war-picker"]').options].map(o => o.textContent))
  rec(37, 'phone390 member', opts.includes('+ New period') ? 'FAIL' : 'PASS', `member's period list: ${JSON.stringify(opts)}`)
  await w.ctx.close()
})

/* 38 OIL tab */
await run(38, async () => {
  for (const who of ['admin', 'member']) for (const size of ['desk', 'phone']) {
    const w = await L.newWorld(size); await L.signIn(w, who, who === 'member' ? '2026-01-05' : undefined)
    const sel = async () => w.page.evaluate(() => ({ grid: document.querySelector('[data-testid="lw-tab-grid"]').getAttribute('aria-selected'), oil: document.querySelector('[data-testid="oil-tracker"]').getAttribute('aria-selected') }))
    const s0 = await sel()
    await tap(w, T('oil-tracker')); await w.page.waitForSelector(T('oil-window'), { timeout: 4000 }).catch(() => {})
    await w.page.waitForTimeout(400)
    const up = await vis(w.page, T('oil-window')); const s1 = await sel()
    await shot(w, `s38-${who}-${size}-oil-up`)
    // close by ✕
    let closedX = false
    if (await vis(w.page, T('oil-close'))) { await tap(w, T('oil-close')); await w.page.waitForTimeout(400); closedX = !(await vis(w.page, T('oil-window'))) }
    const s2 = await sel()
    // reopen, close by Escape
    await tap(w, T('oil-tracker')); await w.page.waitForTimeout(500)
    await w.page.keyboard.press('Escape'); await w.page.waitForTimeout(400)
    const closedEsc = !(await vis(w.page, T('oil-window'))); const s3 = await sel()
    // keyboard: focus the tab and arrow
    await w.page.focus(T('lw-tab-grid'))
    await w.page.keyboard.press('ArrowRight'); await w.page.waitForTimeout(400)
    const s4 = await sel(); const f4 = await w.page.evaluate(() => document.activeElement?.getAttribute('data-testid'))
    await w.page.keyboard.press('ArrowLeft'); await w.page.waitForTimeout(400)
    const s5 = await sel(); const f5 = await w.page.evaluate(() => document.activeElement?.getAttribute('data-testid'))
    await shot(w, `s38-${who}-${size}-after-keys`)
    // open from the name's OIL figure: the grid's figure under a name opens the tracker? try the bal cell
    const ok = s0.grid === 'true' && s0.oil === 'false' && up && s1.oil === 'true' && s1.grid === 'false' && closedX && s2.grid === 'true' && s2.oil === 'false' && closedEsc && s3.grid === 'true' && s4.oil === 'true' && s5.grid === 'true'
    rec(38, `${size} ${who}`, ok ? 'PASS' : 'FAIL', `start grid/oil=${s0.grid}/${s0.oil}; tracker up=${up} tabs ${s1.grid}/${s1.oil}; closed by x=${closedX} tabs ${s2.grid}/${s2.oil}; reopened, Escape closed=${closedEsc} tabs ${s3.grid}/${s3.oil}; ArrowRight -> tabs ${s4.grid}/${s4.oil}, focus on "${f4}"; ArrowLeft -> tabs ${s5.grid}/${s5.oil}, focus on "${f5}"`, [`s38-${who}-${size}-oil-up.png`, `s38-${who}-${size}-after-keys.png`])
    w.errs.forEach(x => all.push('38: ' + x)); await w.ctx.close()
  }
})

writeFileSync('C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-leave-war-overhaul-e11c0a/41598151-b62f-4130-886a-f6dcd3903085/scratchpad/w3-d.out.json', JSON.stringify({ results: L.results, errs: all }, null, 1))
console.log('ERRORS', JSON.stringify(all))
await L.closeBrowser()
