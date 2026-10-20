// W1 explore 5 — VERSION 2
import { openWorld, tools } from './w1-lib.mjs'
const w = await openWorld(process.argv[2] || 'desktop')
const t = tools(w, 'w1-explore5'); const { page } = w
const d = await page.evaluate(() => { const s = JSON.stringify(window.DAYS); const out = {}; for (const m of s.matchAll(/rocky/g)) out.n = (out.n || 0) + 1; return { n: out.n || 0, ids: [...new Set((s.match(/"(?:who|wid|p|w)":"[a-z]+"/g) || []).slice(0, 8))] } })
console.log(JSON.stringify(d))
await t.go('leavewar')
const info = await page.evaluate(() => [...document.querySelectorAll('[id*="ndo"],[data-testid*="ndo"],[title*="ndo"],[aria-label*="ndo"]')].map(b => b.tagName + '|' + b.id + '|' + (b.getAttribute('data-testid') || '') + '|' + (b.title || b.getAttribute('aria-label') || '') + '|' + (b.disabled ? 'disabled' : 'on') + '|' + Math.round(b.getBoundingClientRect().width)))
console.log(info.join('\n'))
console.log(w.errors); await w.browser.close()
