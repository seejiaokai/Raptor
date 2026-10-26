// Question 5, step by step (21 Oct 26 — his ask "show me step by step how the user interface is"): opening bidding
// dates with option 1 ("say what is open"), marked on the REAL app's pictures — today's phone top row and today's
// "Open bidding on" calendar — with what goes (the stage button) and what stays. Pictures to OUT.
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, OUT, errs, PINK } from './full-lib.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))
// a mark: [left, top, width, height] in % of the picture, its number, and whether it is "goes" (struck) or "press"
const mark = ([l, t, w, h], n, kind) => `<span class="mk ${kind}" style="left:${l}%;top:${t}%;width:${w}%;height:${h}%"><b>${n}</b></span>`
const STEPS = [
  ['1', 'Tap the open dates', 'full/t-phone-admin.png', [[[2.7, 11.1, 31.5, 2.7], 'A', 'gone'], [[35.4, 11.1, 22.2, 2.7], 'B', 'press']],
    ['<b>A</b> The stage button goes (draft, open, closed, published).', '<b>B</b> The open dates stay, where they are today. Tap them.']],
  ['2', 'Pick the first day, then the last', 'full/t-bid-dates-phone.png', [[[6.6, 43.4, 86.8, 44.2], 'C', 'press'], [[71.8, 83.9, 18.2, 2.8], 'D', 'press'], [[28, 88.4, 36.6, 3.8], 'E', 'press']],
    ['<b>C</b> Any day to any day, mid-month too; the dates show under the calendar.', '<b>D</b> "Clear dates": nothing open, bidding closed.', '<b>E</b> "Open these dates". Done.']],
  ['3', 'The grid shows it', 'full/t-phone-admin.png', [[[27.2, 33.8, 70, 1.4], 'F', 'press'], [[35.4, 11.1, 22.2, 2.7], 'G', 'press']],
    ['<b>F</b> The open days wear the green outline, as today; closed days dim, with a small lock.', '<b>G</b> To move on to the next stretch, tap the dates again and pick new ones.']],
]
const CSS = `
:root{color-scheme:dark}body{margin:0;background:#0b0d10;color:#f1f4f7;font-family:system-ui,sans-serif}
.wrap{padding:14px 16px;display:flex;flex-direction:column;gap:18px}
h1{font:700 15px/1.3 system-ui;letter-spacing:.06em;text-transform:uppercase;margin:0;color:#e6edf3}
.step{display:flex;flex-direction:column;gap:8px}
.st{font:700 14px system-ui;color:#e6edf3}.st i{font-style:normal;display:inline-block;width:22px;height:22px;border-radius:50%;background:${PINK};color:#fff;text-align:center;line-height:22px;margin-right:6px;font-size:12px}
.pic{position:relative;width:100%;max-width:340px}.pic img{width:100%;display:block;border-radius:8px;border:1px solid #2a323c}
.mk{position:absolute;box-sizing:border-box;border:2.5px solid ${PINK};border-radius:7px}
.mk b{position:absolute;top:-11px;left:-11px;width:20px;height:20px;border-radius:50%;background:${PINK};color:#fff;font:800 11px/20px system-ui;text-align:center}
.mk.gone{background:repeating-linear-gradient(135deg,rgba(255,45,149,.0) 0 6px,rgba(255,45,149,.35) 6px 8px)}
ul{margin:0;padding-left:16px;font:500 12.5px/1.45 system-ui;color:#c9d1d9;display:flex;flex-direction:column;gap:3px}
`
const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Opening bidding dates</title><style>${CSS}</style></head><body><div class="wrap">
${STEPS.map(([n, title, img, marks, words]) => `<section class="step" id="s${n}"><div class="st"><i>${n}</i>${title}</div><div class="pic"><img src="${img}" alt="">${marks.map(([b, k, kind]) => mark(b, k, kind)).join('')}</div><ul>${words.map(w => `<li>${w}</li>`).join('')}</ul></section>`).join('')}
</div></body></html>`
writeFileSync(join(HERE, 'q5-steps.html'), html)
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 3 })
const p = await ctx.newPage(); p.on('pageerror', e => errs.push(String(e)))
await p.goto('file:///' + join(HERE, 'q5-steps.html').replace(/\\/g, '/')); await p.waitForTimeout(400)
for (const n of ['1', '2', '3']) await p.locator('#s' + n).screenshot({ path: join(OUT, `p5-step${n}.png`) })
await browser.close(); console.log('errors:', errs)
