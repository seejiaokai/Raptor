import { launch, ctxOpen, SIZES, sleep, go, shot, rec, errors, openBoard, closeBoard } from './lib.mjs'
import { chromium } from '@playwright/test'
console.log('sc15 v1')
const measure = async (p, tag) => {
  await go(p, 'editsched')
  await p.evaluate(() => window.openScheduler(0)); await p.waitForSelector('#schedBoard'); await sleep(900)
  const m = await p.evaluate(() => {
    const first = document.querySelector('#schedBoard [data-bfld="ff:0.0.0.rl"]'); const line = first.closest('.sb-line')
    const R = k => line.querySelector(`[data-bfld="ff:0.0.0.${k}"]`).getBoundingClientRect()
    const [rl, br, to, ld] = ['rl', 'br', 'to', 'ld'].map(R)
    const rmk = line.querySelector('.nts, [data-bfld^="fr:"]').getBoundingClientRect()
    const oneLine = [rl, br, to, ld].every(x => Math.abs(x.top - rl.top) < 2) && rl.left < br.left && br.left < to.left && to.left < ld.left
    const stacked = rl.bottom <= br.top + 1 && to.bottom <= ld.top + 1 && Math.abs(rl.left - br.left) < 3 && Math.abs(to.left - ld.left) < 3
    const grid = line.closest('.sb-go') || document.querySelector('#schedBoard .sb-go')
    const heads = [...grid.querySelectorAll('*')].filter(e => e.children.length === 0 && /^(R|B|TO|LD)$/.test((e.textContent || '').trim()) && e.offsetParent && !e.closest('[data-bfld]')).map(e => { const b = e.getBoundingClientRect(); return { t: e.textContent.trim(), cx: Math.round(b.x + b.width / 2), y: Math.round(b.y), vis: b.width > 0 } })
    const ctr = { rl: Math.round(rl.x + rl.width / 2), br: Math.round(br.x + br.width / 2), to: Math.round(to.x + to.width / 2), ld: Math.round(ld.x + ld.width / 2) }
    const aligned = heads.length >= 4 ? ['R', 'B', 'TO', 'LD'].every((t, i) => { const h = heads.find(x => x.t === t); const k = ['rl', 'br', 'to', 'ld'][i]; return h && Math.abs(h.cx - ctr[k]) < 28 }) : null
    const sb = document.querySelector('#schedBoard'); const hscroll = document.documentElement.scrollWidth > innerWidth + 1
    return { oneLine, stacked, lineH: Math.round(line.getBoundingClientRect().height), rmkW: Math.round(rmk.width), heads, ctr, aligned, hscroll, boxW: { rl: Math.round(rl.width), br: Math.round(br.width), to: Math.round(to.width), ld: Math.round(ld.width) }, innerW: innerWidth }
  })
  return m
}
const browser = await launch()
const sizes = [['desk', SIZES.desk, 'one'], ['d821', SIZES.d821, 'one'], ['d820', SIZES.d820, 'stack'], ['d768', SIZES.d768, 'stack'], ['phone', SIZES.phone, 'stack'], ['short', SIZES.short, 'one']]
for (const [tag, sz, want] of sizes) {
  const { ctx, p } = await ctxOpen(browser, sz, '15' + tag)
  const m = await measure(p, tag)
  const ok = want === 'one' ? m.oneLine : m.stacked
  const extra = tag === 'phone' ? (m.rmkW >= 150 && m.rmkW <= 175) : true
  rec('15', tag + ' ' + sz.width + 'x' + sz.height, 'open the Monday board; measure R·B·TO·LD', want === 'one' ? 'one line, headings over boxes' : 'stacked (R over B, TO over LD)' + (tag === 'phone' ? '; remarks about 162 px' : ''), m, ok && extra && m.aligned !== false && !m.hscroll ? 'PASS' : 'FAIL', await shot(p, 'A15-' + tag + '-board', p.locator('#schedBoard .sb-go').first()))
  /* read-only board look (a published version) : the Original look of a published day is checked on Saturday elsewhere */
  await ctx.close()
}
await browser.close()
/* 125% */
{
  const br = await chromium.launch({ args: ['--force-device-scale-factor=1.25'] })
  const ctx = await br.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  const p = await ctx.newPage()
  p.on('console', m => { if (m.type() === 'error') errors.push('125: ' + m.text()) }); p.on('pageerror', e => errors.push('125 PAGEERROR ' + e.message))
  await p.goto('http://localhost:4298/'); await p.waitForSelector('#luser'); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(600)
  const dpr = await p.evaluate(() => devicePixelRatio)
  const m = await measure(p, '125')
  rec('15', 'desk 1440x900 at 125%', 'start the browser at 125% scaling; open the Monday board', 'one line, headings over boxes, no sideways scroll', { dpr, ...m }, m.oneLine && m.aligned !== false && !m.hscroll ? 'PASS' : 'FAIL', await shot(p, 'A15-125-board', p.locator('#schedBoard .sb-go').first()))
  await p.evaluate(() => { const b = document.querySelector('#sbDone'); b && b.click() }); await sleep(600)
  await go(p, 'editsched')
  const wk = await p.evaluate(() => { const f = document.querySelector('#eWeek .day[data-day="0"] .form'); const fs = ['rl', 'br', 'to', 'ld'].map(k => getComputedStyle(f.querySelector(`[data-txt="ff:0.0.0.${k}"]`)).fontSize); const cells = [...f.querySelectorAll('.fcell')].map(c => c.scrollHeight <= c.clientHeight + 1); return { fs, unclipped: cells.every(Boolean), dpr: devicePixelRatio } })
  rec('15', 'desk 1440x900 at 125%', 'week: the four times', 'one size, nothing clipped', wk, new Set(wk.fs).size === 1 && wk.unclipped ? 'PASS' : 'FAIL', await shot(p, 'A15-125-week', p.locator('#eWeek .day[data-day="0"] .go').first()))
  await br.close()
}
console.log('errors', JSON.stringify(errors))
