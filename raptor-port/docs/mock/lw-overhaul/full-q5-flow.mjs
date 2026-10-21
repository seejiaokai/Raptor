// Question 5, the "Open for bidding" window step by step (21 Oct 26 — his ask: "how do u click into this, what do u
// see"). Drawn over the REAL app's phone pictures (today's Leave War top and today's "Open bidding on" calendar): the new
// parts are drawn in the app's own colours and marked in pink; everything else is the app as it is. Pictures to OUT.
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, OUT, errs, PINK } from './full-lib.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))

const box = (l, t, w, h, inner, extra = '') => `<div class="ov" style="left:${l}%;top:${t}%;width:${w}%;height:${h}%;${extra}">${inner}</div>`
const mark = (l, t, w, h, n) => `<span class="mk" style="left:${l}%;top:${t}%;width:${w}%;height:${h}%"><b>${n}</b></span>`
const PEN = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="2" y="3" width="12" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M2 6.5h12M5 1.6v3M11 1.6v3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
// the top row as proposed: the stage button gone; one chip says what is open
const topRow = (dates, more) => box(0, 10.9, 100, 3.3, `<div class="row"><span class="chip open"><i>Open</i>${dates}${more ? `<em>${more}</em>` : ''}</span><span class="chip">Under <b>0</b> days</span><span class="sp"></span><span class="chip">Legend</span></div>`, 'background:#0d1117')
// the window, in the style of today's "Open bidding on" window
// D1168 (his idea): the period's months as quick buttons — a tap opens or closes a whole month; on = whole month open,
// part = opened only in part (mid-month), dotted edge
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const months = (on = [], part = [], mk) => `<div class="mos${mk ? ' mkd' : ''}" data-n="${mk || ''}">${MON.map((m, i) => `<span class="mb ${on.includes(i) ? 'on' : part.includes(i) ? 'part' : ''}">${m}</span>`).join('')}</div>`
const sheet = (lines, admin, mk, mo) => box(3.2, 36.5, 93.6, admin ? (mo ? 30 : 21) : 17, `<div class="sh"><div class="sht"><span class="grip">⠿</span>OPEN FOR BIDDING<em>JAN – DEC 26</em><span class="x">✕</span></div>
${mo ? months(mo[0], mo[1], mo[2]) : ''}
${lines.length ? lines.map(([d, n]) => `<div class="ln${mk ? ' mkd' : ''}" data-n="${mk ? mk[0] : ''}"><b>${d}</b><span>${n}</span>${admin ? `<i>${PEN}</i>` : ''}</div>`).join('') : '<div class="empty">Nothing is open. Members cannot bid.</div>'}
${admin ? `<div class="add${mk ? ' mkd' : ''}" data-n="${mk ? mk[1] : ''}">+ Open more dates</div>` : ''}<div class="note">${admin ? 'Closed days dim on the grid, with a small lock.' : 'You can bid on these dates. The rest of the year is closed.'}</div></div>`)

const STEPS = [
  ['1', 'Tap the open dates', 'full/t-phone-admin.png', topRow('1 Apr – 30 Jun') + mark(1.8, 10.8, 36.5, 3.6, 'A'),
    ['<b>A</b> The stage button is gone. One chip says what is open; on your phone it sits where the stage was. Tap it.']],
  ['2', 'Tap the months to open them', 'full/t-phone-admin.png', topRow('1 Apr – 30 Jun') + sheet([['1 Apr – 30 Jun', '91 days']], true, 'CD', [[3, 4, 5], [], 'B']),
    ['<b>B</b> Your quick way: tap a month to open it whole, first day to last; tap it again to close it. April, May and June tapped here.', '<b>C</b> Months next to each other become one line. Its calendar icon is for the rare exact days.', '<b>D</b> "+ Open more dates" adds a stretch of exact days.', 'With nothing open, the window says "Nothing is open. Members cannot bid."']],
  ['2b', 'A stretch of exact days, mid-month', 'full/t-phone-admin.png', topRow('15 Apr – 14 Jul') + sheet([['15 Apr – 14 Jul', '91 days']], true, '', [[4, 5], [3, 6], 'E']),
    ['<b>E</b> April and July are open only in part, so their buttons wear a dotted edge. A tap on one opens it whole.']],
  ['3', 'Exact days: the calendar icon opens the calendar', 'full/t-bid-dates-phone.png',
    topRow('6 Apr – 8 May') + box(10, 38.6, 80, 3.6, '<div class="ttl">OPEN FOR BIDDING<em>6 APR – 8 MAY</em></div>', 'background:#161b22') +
    box(27.6, 88, 37.6, 4.4, '<div class="btn">Save dates</div>', 'background:#161b22') +
    box(5, 92.7, 90, 4.6, '<div class="del">Remove these dates</div>', 'background:#161b22') +
    mark(6.6, 43.4, 86.8, 42.5, 'D') + mark(27.6, 88, 37.6, 4.4, 'E') + mark(26, 92.6, 48, 4.6, 'F'),
    ['<b>D</b> The calendar you have today: tap the first day, then the last. Any day to any day.', '<b>E</b> "Save dates". The window shows the new line.', '<b>F</b> "Remove these dates" closes that stretch. Undo brings it back.']],
  ['4', 'The grid shows it', 'full/t-phone-admin.png', topRow('1 Apr – 30 Jun') + mark(1.8, 10.8, 36.5, 3.6, 'G') + mark(27.2, 33.8, 70, 1.4, 'H'),
    ['<b>G</b> The chip shows the open dates; with two stretches it adds "+1".', '<b>H</b> The open days wear today\'s green outline; closed days dim, with a small lock.']],
  ['5', 'What a member sees', 'full/t-phone-admin.png', topRow('1 Apr – 30 Jun') + sheet([['1 Apr – 30 Jun', '91 days']], false) + mark(1.8, 10.8, 36.5, 3.6, 'I'),
    ['<b>I</b> The same chip. A tap shows the open dates, read only: no calendar icon, nothing to add.']],
]
const CSS = `
:root{color-scheme:dark}body{margin:0;background:#0b0d10;color:#f1f4f7;font-family:system-ui,-apple-system,sans-serif}
.wrap{padding:14px 16px;display:flex;flex-direction:column;gap:18px}
.step{display:flex;flex-direction:column;gap:8px}
.st{font:700 14px system-ui;color:#e6edf3}.st i{font-style:normal;display:inline-block;width:22px;height:22px;border-radius:50%;background:${PINK};color:#fff;text-align:center;line-height:22px;margin-right:6px;font-size:12px}
.pic{position:relative;width:100%;max-width:358px;container-type:inline-size}.pic img{width:100%;display:block;border-radius:8px;border:1px solid #2a323c}
.ov{position:absolute;box-sizing:border-box;display:flex;align-items:center}
.row{display:flex;align-items:center;gap:1.6cqw;width:100%;padding:0 2.6cqw;box-sizing:border-box}
.chip{display:inline-flex;align-items:center;gap:1.4cqw;height:5.6cqw;padding:0 2.4cqw;border-radius:2.2cqw;border:1px solid #2f3a46;font:600 3.2cqw system-ui;color:#c9d1d9;white-space:nowrap}
.chip.open{border-color:rgba(87,201,122,.75);color:#8FE0A8;font-weight:700}.chip.open i{font-style:normal;color:#e6edf3;font-weight:600}.chip em{font-style:normal;color:#8a96a3}
.sp{flex:1}
.sh{width:100%;height:100%;background:#161b22;border:1px solid #2a323c;border-radius:3cqw;padding:3cqw;box-sizing:border-box;display:flex;flex-direction:column;gap:2.2cqw;box-shadow:0 10px 30px rgba(0,0,0,.6)}
.sht{display:flex;align-items:center;gap:2cqw;font:800 3.4cqw system-ui;letter-spacing:.14em;color:#f1f4f7;padding-bottom:2cqw;border-bottom:1px solid #2a323c}
.sht em{font-style:normal;font-weight:500;letter-spacing:.06em;color:#8a96a3}.sht .x{margin-left:auto;color:#9aa5b1;font-weight:400}.grip{color:#6b7785;letter-spacing:0}
.ln{display:grid;grid-template-columns:auto 1fr auto;gap:3cqw;align-items:center;padding:2.4cqw 3cqw;border-radius:2cqw;background:#0f1318;border:1px solid #26303a;font:500 3.4cqw system-ui;color:#9aa5b1}
.ln b{color:#8FE0A8;font-weight:700}.ln i{color:#5fd0e6;display:flex}
.mkd{position:relative;outline:2.5px solid ${PINK};outline-offset:2px;border-radius:2cqw}
.mkd::before{content:attr(data-n);position:absolute;top:-12px;left:-12px;width:20px;height:20px;border-radius:50%;background:${PINK};color:#fff;font:800 11px/20px system-ui;text-align:center}
.mos{display:grid;grid-template-columns:repeat(6,1fr);gap:1.6cqw}
.mb{display:flex;align-items:center;justify-content:center;height:7.6cqw;border-radius:2cqw;border:1px solid #2f3a46;background:#0f1318;font:700 3.2cqw system-ui;color:#9aa5b1}
.mb.on{border-color:rgba(87,201,122,.75);background:rgba(87,201,122,.16);color:#8FE0A8}
.mb.part{border:1.5px dashed rgba(87,201,122,.8);color:#8FE0A8}
.add{align-self:flex-start;font:600 3.4cqw system-ui;color:#5fd0e6;padding:0 1cqw}
.empty{font:500 3.4cqw system-ui;color:#9aa5b1}
.note{margin-top:auto;font:500 3cqw/1.4 system-ui;color:#8a96a3}
.ttl{display:flex;gap:2cqw;align-items:baseline;font:800 3.6cqw system-ui;letter-spacing:.14em;color:#f1f4f7}.ttl em{font-style:normal;font-weight:500;letter-spacing:.06em;color:#8a96a3}
.btn{width:100%;height:100%;display:flex;align-items:center;justify-content:center;border-radius:2.4cqw;border:1px solid rgba(87,201,122,.7);background:rgba(87,201,122,.14);color:#8FE0A8;font:700 4cqw system-ui}
.del{margin:0 auto;padding:1.4cqw 4cqw;border:1px dashed #6b7785;border-radius:2cqw;color:#c9d1d9;font:600 3.4cqw system-ui}
.mk{position:absolute;box-sizing:border-box;border:2.5px solid ${PINK};border-radius:7px;pointer-events:none}
.mk b{position:absolute;top:-11px;left:-11px;width:20px;height:20px;border-radius:50%;background:${PINK};color:#fff;font:800 11px/20px system-ui;text-align:center}
ul{margin:0;padding-left:16px;font:500 12.5px/1.45 system-ui;color:#c9d1d9;display:flex;flex-direction:column;gap:3px}
`
const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Open for bidding</title><style>${CSS}</style></head><body><div class="wrap">
${STEPS.map(([n, title, img, over, words]) => `<section class="step" id="s${n}"><div class="st"><i>${n}</i>${title}</div><div class="pic"><img src="${img}" alt="">${over}</div><ul>${words.map(w => `<li>${w}</li>`).join('')}</ul></section>`).join('')}
</div></body></html>`
writeFileSync(join(HERE, 'q5-flow.html'), html)
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 3 })
const p = await ctx.newPage(); p.on('pageerror', e => errs.push(String(e)))
await p.goto('file:///' + join(HERE, 'q5-flow.html').split(String.fromCharCode(92)).join('/')); await p.waitForTimeout(400)
for (const n of ['1', '2', '2b', '3', '4', '5']) await p.locator('#s' + n).screenshot({ path: join(OUT, `p5-flow${n}.png`) })
await browser.close(); console.log('errors:', errs)
