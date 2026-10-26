// Look at today's windows: a person's window, the bid window, a count row's window, the ⚙ Settings, an Event sheet.
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, esc, errs, OUT } from './full-lib.mjs'
const browser = await chromium.launch()
const { ctx, p } = await newPage(browser, 1536, 860, false)
await signIn(p, 'admin')
const dump = async name => {
  const h = await p.evaluate(() => { const d = [...document.querySelectorAll('[role=dialog], .bidsheet, .sheet')].filter(e => e.getBoundingClientRect().width > 0).pop(); return d ? d.outerHTML : 'NONE' })
  writeFileSync(join(OUT, name + '.html'), h); console.log(name, h.length)
}
await p.click(q('person-bane')); await p.waitForTimeout(500); await shot(p, 'x-person'); await dump('x-person'); await esc(p)
await p.click(q('cell-bane-2026-01-28')); await p.waitForTimeout(500); await shot(p, 'x-bid'); await dump('x-bid'); await esc(p)
const rowLbl = p.locator('text=AVAILABLE P').first(); await rowLbl.click(); await p.waitForTimeout(500); await shot(p, 'x-availp'); await dump('x-availp'); await esc(p)
await p.click('.lw-gear, [data-testid="settings-open"], button[aria-label*="ettings"]').catch(() => console.log('no gear sel'))
await p.waitForTimeout(500); await shot(p, 'x-settings'); await dump('x-settings'); await esc(p)
const testids = await p.evaluate(() => [...new Set([...document.querySelectorAll('[data-testid]')].map(e => e.dataset.testid).filter(t => !/^(cell|row|person|cat|bal|fig|hdr|day|mon)-/.test(t)))])
console.log(testids.join(' '))
await ctx.close(); await browser.close(); console.log('errors:', errs)
