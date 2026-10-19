import { launch, ctxOpen, SIZES, sleep, go, shot, rec, errors } from './lib.mjs'
import { chromium } from '@playwright/test'
console.log('sc15b v1')
const measure = async p => {
  await go(p, 'editsched')
  await p.evaluate(() => window.openScheduler(0)); await p.waitForSelector('#schedBoard'); await sleep(900)
  return p.evaluate(() => {
    const line = document.querySelector('#schedBoard [data-bfld="ff:0.0.0.rl"]').closest('.sb-line')
    const rect = e => e.getBoundingClientRect()
    const nts = line.querySelector('.nts'); const puck = line.querySelector('.pucks, .sb-pucks, .puck')
    const board = document.querySelector('#schedBoard .sb-go')
    return { lineH: Math.round(rect(line).height), ntsW: nts ? Math.round(rect(nts).width) : null, frW: Math.round(rect(line.querySelector('[data-bfld^="fr:"]')).width), lineW: Math.round(rect(line).width), boardW: Math.round(rect(board).width), innerW: innerWidth, hscroll: board.scrollWidth > board.clientWidth + 1 }
  })
}
const browser = await launch()
for (const w of [821, 900, 1000, 1100, 1280, 1440, 402, 820]) {
  const sz = w === 402 ? SIZES.phone : { width: w, height: 900, dsf: 1 }
  const { ctx, p } = await ctxOpen(browser, sz, 'w' + w)
  const m = await measure(p)
  rec('15', w + 'px wide', 'open the Monday board; line height and remarks width', 'RECORD (1440: line 51, remarks 199; phone: remarks ~162)', m, 'RECORD')
  await ctx.close()
}
await browser.close()
/* 125%: leave the context's scale unset so the browser's own factor shows */
{
  const br = await chromium.launch({ args: ['--force-device-scale-factor=1.25'] })
  const ctx = await br.newContext({ viewport: { width: 1440, height: 900 } })
  const p = await ctx.newPage()
  p.on('console', m => { if (m.type() === 'error') errors.push('125: ' + m.text()) }); p.on('pageerror', e => errors.push('125 PAGEERROR ' + e.message))
  await p.goto('http://localhost:4298/'); await p.waitForSelector('#luser'); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(600)
  const dpr = await p.evaluate(() => devicePixelRatio)
  const m = await measure(p)
  const heads = await p.evaluate(() => { const l = document.querySelector('#schedBoard [data-bfld="ff:0.0.0.rl"]').closest('.sb-line'); const R = k => l.querySelector(`[data-bfld="ff:0.0.0.${k}"]`).getBoundingClientRect(); return { oneLine: ['br', 'to', 'ld'].every(k => Math.abs(R(k).top - R('rl').top) < 2), w: ['rl', 'br', 'to', 'ld'].map(k => Math.round(R(k).width)) } })
  rec('15', 'desk 1440x900 browser started at 125%', 'open the Monday board', 'dpr 1.25, one line, no clipping', { dpr, ...m, ...heads }, dpr > 1.2 && heads.oneLine ? 'PASS' : 'RECORD', await shot(p, 'A15-125b-board', p.locator('#schedBoard .sb-go').first()))
  await p.evaluate(() => { const b = document.querySelector('#sbDone'); b && b.click() }); await sleep(600)
  await go(p, 'editsched')
  const wk = await p.evaluate(() => { const f = document.querySelector('#eWeek .day[data-day="0"] .form'); const fs = ['rl', 'br', 'to', 'ld'].map(k => getComputedStyle(f.querySelector(`[data-txt="ff:0.0.0.${k}"]`)).fontSize); return { fs, unclipped: [...f.querySelectorAll('.fcell')].every(c => c.scrollHeight <= c.clientHeight + 1), dpr: devicePixelRatio } })
  rec('15', 'desk 1440x900 browser started at 125%', 'week: the four times', 'one size, nothing clipped', wk, new Set(wk.fs).size === 1 && wk.unclipped ? 'PASS' : 'FAIL', await shot(p, 'A15-125b-week', p.locator('#eWeek .day[data-day="0"] .go').first()))
  await br.close()
}
console.log('errors', JSON.stringify(errors))
