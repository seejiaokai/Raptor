// Today's neighbours of the new windows: a member's tap on his approved leave, the Calendar window's Holidays list, Quals,
// the Inputs page's "+ Input" window with a medical kind (its document ask).
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, esc, errs, OUT } from './full-lib.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
const dumpTestids = p => p.evaluate(() => [...new Set([...document.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().width).map(e => e.dataset.testid).filter(t => !/^(cell|row|person|cat|bal|head|req|avail|fly|mark|group|q-|qc-)/.test(t)))].join(' '))
let { ctx, p } = await newPage(browser, 390, 844, true, state)
await signIn(p, 'member')
await p.tap(q('cell-bane-2026-01-19')).catch(e => console.log('tap fail', e.message)); await p.waitForTimeout(500)
await shot(p, 'x-phone-member-approved'); console.log('member approved tap:', await p.evaluate(() => [...document.querySelectorAll('[role=dialog]')].map(d => d.getAttribute('aria-label') + ': ' + d.innerText.replace(/\s+/g, ' ').slice(0, 200)).join(' || ')))
await ctx.close()
;({ ctx, p } = await newPage(browser, 1536, 860, false, state))
await signIn(p, 'admin')
await p.click(q('settings-open')); await p.waitForTimeout(400)
await p.locator('button:has-text("Calendar…")').first().click(); await p.waitForTimeout(800)
await shot(p, 'x-desk-calendar'); console.log('calendar testids:', await dumpTestids(p))
const hol = p.locator('button:has-text("Holidays")').first(); if (await hol.count()) { await hol.click(); await p.waitForTimeout(600); await shot(p, 'x-desk-holidays') }
writeFileSync(join(OUT, 'x-holidays.html'), await p.evaluate(() => { const d = [...document.querySelectorAll('[role=dialog]')].pop(); return d ? d.outerHTML : 'none' }))
await esc(p); await esc(p)
await p.evaluate(() => window.go('quals')); await p.waitForTimeout(1200); await shot(p, 'x-desk-quals')
writeFileSync(join(OUT, 'x-quals.html'), await p.evaluate(() => (document.querySelector('#page-quals') || document.body).outerHTML.slice(0, 30000)))
await p.evaluate(() => window.go('inputs')); await p.waitForTimeout(1200); await shot(p, 'x-desk-inputs'); console.log('inputs testids:', await dumpTestids(p))
await ctx.close(); await browser.close(); console.log('errors:', errs)
