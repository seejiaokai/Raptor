/* D1133 built (21 Oct 26): the mirrored pencil on the Tracker's bar and in the input window's title box, beside Quals'
   typed ✎ — all three tip bottom right. Run: HP_URL=http://localhost:<port> HP_SHOTS=<folder> node scripts/handpass/cr2-pencil-built.mjs */
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = SHOTS + '/pencil'; mkdirSync(OUT, { recursive: true })
const b = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const ctx = await b.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
const p = await ctx.newPage(); await p.goto(BASE + '/'); await login(p, 'a')
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ring = sel => p.evaluate(sel => { document.querySelectorAll('.zz-ring').forEach(e => e.remove()); for (const e of document.querySelectorAll(sel)) { const r = e.getBoundingClientRect(); if (!r.width) continue; const d = document.createElement('div'); d.className = 'zz-ring'; d.style.cssText = `position:fixed;left:${r.left - 4}px;top:${r.top - 4}px;width:${r.width + 8}px;height:${r.height + 8}px;border:3px solid #ffb020;border-radius:9px;z-index:99999;pointer-events:none`; document.body.appendChild(d) } }, sel)
await go(p, 'tracker'); await sleep(900)
await ring('#courseMenuBtn, #sylMenuBtn'); await p.screenshot({ path: `${OUT}/f-tracker-built.png`, clip: { x: 0, y: 40, width: 760, height: 96 } })
const z = await p.locator('#courseMenuBtn').boundingBox()
await p.evaluate(() => document.querySelectorAll('.zz-ring').forEach(e => e.remove()))
const p6 = await (await b.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 6 })).newPage()
await p6.goto(BASE + '/'); await login(p6, 'a'); await go(p6, 'tracker'); await sleep(900)
const z6 = await p6.locator('#courseMenuBtn').boundingBox(); await p6.screenshot({ path: `${OUT}/g-tracker-zoom.png`, clip: z6 })
/* the input window's title box: + Input on the Inputs list, a kind that takes a title (Training) */
await go(p, 'inputs'); await sleep(500)
await p.locator('#inMemberMode').click().catch(() => {}); await sleep(200)
await p.locator('#inListBtn').click(); await sleep(400)
await p.locator('#inNew').click(); await sleep(500)
const types = await p.locator('#inpEditType option').allTextContents()
const pick = types.find(t => /Training/i.test(t)) || types.find(t => /Duty|Meeting|Event/i.test(t))
if (pick) await p.locator('#inpEditType').selectOption({ label: pick }); await sleep(400)
const pen = p.locator('.inped-pen').first()
if (await pen.count()) { const t = await p.locator('.inped-title').first().boundingBox(); await ring('.inped-title'); await p.screenshot({ path: `${OUT}/h-input-title-built.png`, clip: { x: Math.max(0, t.x - 20), y: t.y - 20, width: t.width + 40, height: t.height + 40 } }); console.log('title box with', pick) }
else console.log('no title box for', pick, types.join('|'))
await b.close(); console.log('done')
