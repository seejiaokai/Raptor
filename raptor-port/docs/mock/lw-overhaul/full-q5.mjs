// Question 5 again (21 Oct 26 — his question: "default its locked and the admin opens up periods for bidding then lock it
// back, or the way gryphon app does it is to lock the periods that are not biddable" — which is more intuitive?).
// Two ways of saying when members may bid, drawn on the same year, at the two moments that matter: opening Apr–Jun, then
// moving on to Jul–Sep. A static drawing in the app's dark look (the windows are drawn in the style of the app's own
// sheets); pictures to OUT. Run as full-cells2.mjs is.
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, OUT, errs } from './full-lib.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))

const M = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
// a year strip: open months bright, the rest dim with a small lock
function strip(open) {
  return `<div class="strip">${M.map((m, i) => `<span class="mo ${open.includes(i) ? 'open' : 'shut'}">${m}${open.includes(i) ? '' : LOCK}</span>`).join('')}</div>`
}
const LOCK = '<svg viewBox="0 0 10 12" width="7" height="8" aria-hidden="true"><rect x="1.5" y="5" width="7" height="6" rx="1.2" fill="currentColor"/><path d="M3 5V3.6a2 2 0 0 1 4 0V5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>'
// a sheet in the app's style: a title, then its lines
const sheet = (title, lines, foot) => `<div class="sheet"><div class="sh">${title}</div>${lines.map(([d, why, cls]) => `<div class="ln ${cls || ''}"><b>${d}</b><span>${why}</span><i>✎</i></div>`).join('')}<div class="ft">${foot}</div></div>`
const step = (n, words) => `<div class="step"><span class="n">${n}</span>${words}</div>`

const OPEN_A = sheet('Open for bidding', [['1 Apr – 30 Jun', 'open', 'go']], '+ Open more dates')
const OPEN_B = sheet('Open for bidding', [['1 Jul – 30 Sep', 'open', 'go']], '+ Open more dates')
const LOCK_A = sheet('Lock dates', [['1 Jan – 31 Mar', 'Approved, closed'], ['1 Jul – 31 Dec', 'Not open yet']], '+ Add a lock')
const LOCK_B = sheet('Lock dates', [['1 Jan – 30 Jun', 'Approved, closed', 'chg'], ['1 Oct – 31 Dec', 'Not open yet', 'chg']], '+ Add a lock')

const CSS = `
:root{color-scheme:dark}
body{margin:0;background:#0b0d10;color:#f1f4f7;font-family:"Inter Tight",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{padding:14px 16px 20px;max-width:900px}
h1{font:700 15px/1.3 "Inter Tight",system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;margin:0 0 4px;color:#e6edf3}
.sub{font:500 12px/1.45 system-ui,sans-serif;color:#8a96a3;margin:0 0 12px}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px}
.col{background:#11161c;border:1px solid #26303a;border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:10px}
.col.rec{border-color:#3bc6e8}
.ct{font:700 12.5px/1.3 system-ui,sans-serif;color:#e6edf3}.ct i{font-style:normal;font-weight:500;color:#8a96a3}
.col.rec .ct{color:#3bc6e8}
.step{display:flex;gap:8px;align-items:flex-start;font:500 12px/1.4 system-ui,sans-serif;color:#c9d1d9}
.step .n{flex:0 0 auto;width:18px;height:18px;border-radius:50%;background:#1d2733;color:#9fdcee;font:800 10.5px/18px system-ui;text-align:center}
.strip{display:grid;grid-template-columns:repeat(12,1fr);gap:3px}
.mo{display:flex;align-items:center;justify-content:center;gap:2px;height:24px;border-radius:5px;font:700 10px system-ui}
.mo.open{background:rgba(87,201,122,.16);color:#8FE0A8;box-shadow:inset 0 0 0 1px rgba(87,201,122,.6)}
.mo.shut{background:rgba(6,8,11,.6);color:#56616d;box-shadow:inset 0 0 0 1px #222b35}
.sheet{background:#161b22;border:1px solid #2a323c;border-radius:9px;padding:8px 10px;display:flex;flex-direction:column;gap:5px}
.sh{font:700 10px/1.3 system-ui;letter-spacing:.1em;text-transform:uppercase;color:#8a96a3}
.ln{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;font:500 12px/1.3 system-ui;color:#c9d1d9;padding:5px 7px;border-radius:6px;background:#0f1318;border:1px solid #222b35}
.ln b{font-weight:700;color:#e6edf3;white-space:nowrap}.ln i{font-style:normal;color:#5fd0e6}
.ln.go b{color:#8FE0A8}
.ln.chg{border-color:#ff2d95;box-shadow:0 0 0 1px #ff2d95}
.ft{font:600 11.5px system-ui;color:#5fd0e6}
.tally{font:600 11.5px/1.4 system-ui;color:#e6edf3;border-top:1px solid #26303a;padding-top:8px}
.tally span{color:#8a96a3;font-weight:500}
`
function page(phone) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Leave War bidding</title><style>${CSS}</style></head><body><div class="wrap">
<section id="q5"><h1>Opening the next three months, two ways</h1><p class="sub">The same year. First you open April to June; once everyone is approved, you move on to July to September. Green: members may bid. Dim with a lock: they may not. Pink: what you have to change.</p>
<div class="cols">
<div class="col rec"><div class="ct">1 · Say what is open <i>(your app today, without the stages · recommended)</i></div>
${step(1, 'Open April to June: one line.')}${OPEN_A}${strip([3, 4, 5])}
${step(2, 'Move on to July to September: change that one line.')}${sheet('Open for bidding', [['1 Jul – 30 Sep', 'open', 'go chg']], '+ Open more dates')}${strip([6, 7, 8])}
<div class="tally">Lines to keep right: <b>1</b> <span>· a new period starts with nothing open, so nobody bids early by mistake</span></div></div>
<div class="col"><div class="ct">2 · Say what is locked <i>(Gryphon)</i></div>
${step(1, 'Open April to June: lock everything else, two lines.')}${LOCK_A}${strip([3, 4, 5])}
${step(2, 'Move on to July to September: change both lines.')}${LOCK_B}${strip([6, 7, 8])}
<div class="tally">Lines to keep right: <b>2</b> <span>· forget one and a stretch is open, or shut, that should not be</span></div></div>
</div></section>
</div></body></html>`
}
writeFileSync(join(HERE, 'q5-phone.html'), page(true))
writeFileSync(join(HERE, 'q5-desk.html'), page(false))
const browser = await chromium.launch()
for (const [n, w, dpr, phone] of [['p5-phone', 390, 3, true], ['p5-desk', 900, 2, false]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: dpr })
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(String(e)))
  await p.goto('file:///' + join(HERE, phone ? 'q5-phone.html' : 'q5-desk.html').replace(/\\/g, '/'))
  await p.waitForTimeout(200)
  console.log(n, 'width', await p.evaluate(() => document.documentElement.scrollWidth))
  await p.locator('#q5').screenshot({ path: join(OUT, `${n}.png`) })
  await ctx.close()
}
await browser.close(); console.log('errors:', errs)
