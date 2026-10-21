// The Inputs page on a phone: its buttons, and the "+ Input" window's controls (for picture 15).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, OUT, shot } from './full-lib.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
const { ctx, p } = await newPage(browser, 390, 844, true, state)
await signIn(p, 'member')
await p.evaluate(() => window.go('inputs')); await p.waitForTimeout(1200)
console.log(await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => { const r = b.getBoundingClientRect(); return r.width && r.top < 400 }).map(b => (b.dataset.testid || '-') + ':' + (b.getAttribute('aria-label') || b.textContent.trim()).slice(0, 22)).join(' | ')))
await shot(p, 'x-phone-inputs')
await p.locator('button:has-text("List")').first().tap(); await p.waitForTimeout(700)
await p.locator('button:has-text("+ Input")').first().tap(); await p.waitForTimeout(900)
await shot(p, 'x-phone-input-window')
console.log(await p.evaluate(() => { const d = [...document.querySelectorAll('[role=dialog]')].filter(e => e.getBoundingClientRect().width).pop(); return d ? d.className + ' :: ' + [...d.querySelectorAll('select, button, input, label')].slice(0, 50).map(e => e.tagName + '.' + (e.className || '').toString().split(' ')[0] + '[' + (e.getAttribute('aria-label') || e.textContent || e.value || '').trim().slice(0, 16) + ']').join(' ') : 'none' }))
await browser.close()
