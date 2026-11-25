// sah-w8-probe2 — READ ONLY: the "+ Commitment" window's markup (its calendar, Person box, several-people switch), opened
// by Saber on Fri 17 Jul of a fresh world. Nothing saved, nothing written to window.*.
import './sah-w8-env.mjs'
const L = await import('./asp-w2-lib.mjs')
import { writeFileSync, mkdirSync } from 'node:fs'
console.log('sah-w8-probe2 v1', L.URL_)
const OUTD = 'D:/raptor-work/c152-walk/w8/probe'; mkdirSync(OUTD, { recursive: true })
const sz = L.SIZES.d, W = L.mk('probe2', sz)
const { b, p } = await L.world(sz, W)
await L.signIn(p, 'ad', 'a')
await L.go(p, 'inputs')
await W.press(p, '#inSansMode', 'sans')
await p.waitForSelector('[data-testid="sanscal"]'); await L.sleep(500)
await W.press(p, '[data-testid="sc-day-2026-07-17"]', 'd17'); await L.sleep(600)
await W.press(p, '[data-testid="sd-add"]', 'add'); await L.sleep(800)
const html = await p.evaluate(() => { const w = document.querySelector('#inpEditPop'); return w ? w.outerHTML : 'none' })
writeFileSync(OUTD + '/commit-window.html', html)
console.log('len', html.length)
console.log(html.replace(/<svg[\s\S]*?<\/svg>/g, '<svg/>').slice(0, 6000))
await p.screenshot({ path: OUTD + '/commit-window.png' })
console.log('errs', W.errs.join(' || '))
await b.close()
