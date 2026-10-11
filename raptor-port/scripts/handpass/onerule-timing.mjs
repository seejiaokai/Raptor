/* THE ONE-RULE JOB'S TIMINGS ([ALL-AVAIL-AS-MEMBER], the plan's §4.2 and Fable's F10 — 12 Oct 26).
   Step 1 puts a per-person view between the stored inputs and every rule that asks "is THIS MAN busy or away". A copy
   made at every ask would be a cost on a phone; the view is therefore worked out once per pass. This script measures
   whether that held, the way docs/performance.md Part 1 asks: on the BUILT bundle, in a real browser, at a phone's
   width, with the processor slowed four times, the same list of acts before and after, several runs each.

     OR_OUT=<file.json> HP_URL=http://localhost:<port> node scripts/handpass/onerule-timing.mjs

   Two worlds in one run: the demo as it boots (about fifty inputs), then the same with 250 more filed (about three
   hundred — a squadron's year, the size Fable's read worried about). Each act is run seventeen times; the first two are
   thrown away and the middle one of the rest is the figure. A single run is noise (the guide: nine reads of one
   unchanged build spread 1.08 to 1.23 times), so compare the middle of several runs, never one against one. */
import { existsSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const BASE = process.env.HP_URL || 'http://localhost:4173'
const OUT = process.env.OR_OUT
if (!OUT) throw new Error('OR_OUT=<file.json> is required')
const RATE = +(process.env.OR_CPU || 4)

const browser = await chromium.launch({ headless: true, ...launchOptions })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
await ctx.addInitScript(() => {
  let s = 0x9e3779b9
  Math.random = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
})
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
const cdp = await ctx.newCDPSession(page)
await page.goto(BASE + '/')
await page.waitForSelector('#luser')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.waitForTimeout(800)
/* an ALL AVAIL duty on the Saturday, so the day's OIL and its drawing work out a crowd (the walk of every person
   against every input that could keep him out of it) */
await page.evaluate(() => { window.fileInput({ yr: 2026, person: 'allavail', date: 'Jul 18', allday: false, s: 780, e: 960, type: 'Duty', remarks: 'timing: whoever is free', by: 'saber', oil: { '2026-07-18': 1 } }) })
await page.waitForTimeout(500)
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(800)
await page.waitForFunction(() => typeof window.paletteHTML === 'function' && typeof window.dayHTML === 'function')

/* the acts, timed inside the page */
const measure = () => page.evaluate(async () => {
  const w = window
  const raf2 = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r(null))))
  const time = async (fn, K = 15) => {
    const xs = []
    for (let i = 0; i < K + 2; i++) { const t = performance.now(); await fn(i); xs.push(performance.now() - t) }
    xs.splice(0, 2); xs.sort((a, b) => a - b)
    return { mid: +xs[Math.floor(xs.length / 2)].toFixed(2), min: +xs[0].toFixed(2), max: +xs[xs.length - 1].toFixed(2) }
  }
  const ids = Object.keys(w.PEOPLE).filter(id => !w.PEOPLE[id].special)
  const wsos = ids.filter(id => w.PEOPLE[id].seat === 'RCP' && !w.PEOPLE[id].san && !w.PEOPLE[id].archived).slice(0, 2)
  const keys = [...new Set([...document.querySelectorAll('#eWeek [data-slot]')].map(e => e.getAttribute('data-slot')))]
  const fly = keys.filter(k => k.indexOf(':') < 0 && /\.p$/.test(k)).sort()[0] || '0.0.0.0.p'
  const gnd = keys.filter(k => k.startsWith('g:')).sort()[0], duty = keys.filter(k => k.startsWith('d:')).sort()[0]
  const out = {}
  out['the rules pass (validate)'] = await time(() => { w.validate() })
  out['the week read into events'] = await time(() => { w.collectEvents() })
  out['the crew list drawn, nothing armed'] = await time(() => { w.paletteHTML(0) })
  w.armSlot(fly, null)
  out['the crew list drawn, a flying seat armed'] = await time(() => { w.paletteHTML(0) })
  w.disarmSlot()
  out['may he take it? — every person, three places'] = await time(() => { for (const k of [fly, gnd, duty]) if (k) for (const id of ids) w.slotBar(id, k) })
  out['Monday drawn (Edit Schedule)'] = await time(() => { w.dayHTML(0, true) })
  out['Saturday drawn (Edit Schedule)'] = await time(() => { w.dayHTML(5, true) })
  out['Saturday’s OIL worked out'] = await time(() => { w.oilEvidenceOf(5) })
  out['a puck dropped on a seat, to the screen'] = await time(async i => { w.setSlotVal('0.0.0.0.w', wsos[i % 2]); w.afterSchedMutate(); await raf2() }, 10)
  out['the whole week redrawn'] = await time(async () => { w.renderEditWeek(); await raf2() }, 10)
  /* a man picked from the crew list: a green ring on every place he could take — one ask a place on screen */
  const two = ids.filter(id => w.PEOPLE[id].seat === 'FCP' && !w.PEOPLE[id].san && !w.PEOPLE[id].archived).slice(0, 2)
  out['a man picked: the rings on every place he may take'] = await time(async i => { w.selectPerson(two[i % 2], true); await raf2() }, 10)
  w.selectPerson(null); await raf2()
  return { inputs: w.INPUTS.length, out }
})

await cdp.send('Emulation.setCPUThrottlingRate', { rate: RATE })
const demo = await measure()
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })

/* 250 more inputs: leave, duties and commitments spread over five weeks around the demo week */
const filed = await page.evaluate(() => {
  const w = window
  const men = Object.keys(w.PEOPLE).filter(id => { const p = w.PEOPLE[id]; return !p.special && !p.san && !p.pers && !p.archived && !p.deleted }).sort()
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const lab = n => { const d = new Date(Date.UTC(2026, 6, 6 + n)); return `${M[d.getUTCMonth()]} ${d.getUTCDate()}` }
  const kinds = ['Meeting', 'Training', 'Appointment', 'Duty', 'LL', 'Meeting', 'Training', 'OD', 'Appointment', 'Other']
  let n = 0
  for (let i = 0; i < 250; i++) {
    const t = kinds[i % kinds.length], day = (i * 7) % 35, timed = t !== 'LL' && t !== 'OD'
    const s = 480 + ((i * 45) % 480)
    const row = { yr: 2026, person: men[(i * 11) % men.length], date: lab(day), type: t, remarks: 'load ' + i, allday: !timed, ...(timed ? { s, e: s + 90 } : {}), ...(t === 'OD' ? { endDate: lab(day + 2) } : {}) }
    try { w.fileInput(row); n++ } catch (e) { /* a refused one is not counted */ }
  }
  return n
})
await page.waitForTimeout(1500)
await cdp.send('Emulation.setCPUThrottlingRate', { rate: RATE })
const big = await measure()

const res = { url: BASE, cpu: RATE, filed, demo, big, errors }
writeFileSync(OUT, JSON.stringify(res, null, 1))
const line = (k, a, b) => `${k.padEnd(48)} ${String(a.mid).padStart(8)} ms   ${String(b.mid).padStart(8)} ms`
console.log(`${BASE} at ${RATE}x — ${demo.inputs} inputs, then ${big.inputs}`)
for (const k of Object.keys(demo.out)) console.log(line(k, demo.out[k], big.out[k]))
if (errors.length) console.log('errors: ' + errors.join(' | '))
await browser.close()
