// THE AGENT'S OWN PICK for [INPUT-LIST-AS-DAY-CARD], PICTURED IN THE REAL APP (owner, 10 Oct 26 — "can u tell me which is
// the final design u would prefer and give me screenshot of your choice for the list and calander"; D718–D722).
// It drives the BUILT app on a phone, files a handful of inputs through the app's own "+ Input" beside the demo's, then
// REDRAWS the opened day's cards and the Inputs list with the chosen card — built from the app's own records
// (window.INPUTS, window.PEOPLE) and its own lateness marks, inside the app's own window, bars and fonts. The card's
// styles are injected here; nothing of it is built. A DRAWING.
//
//   node scripts/handpass/mk-final-card.mjs <out dir>          (the built bundle on :4180)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
const OUT = process.argv[2] || 'docs/mock/img/input-card-final'
mkdirSync(OUT, { recursive: true })
const URL = (process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const ISO = '2026-07-18', DAY = '[data-testid="win-inputsday"]'

/* THE CARD — one line of facts (who, the kind, LATE, the hours), then the words at the card's full width (the title at
   the left on a row of its own, a remark after it), every name of a shared input, "By Saber" only where someone else
   placed it. The app's own colours, sizes and font. */
const CSS = `
.fc{border:1px solid var(--edge);border-radius:8px;padding:5px 9px;margin-bottom:4px;background:var(--panel-2);min-width:0;cursor:pointer;display:block;text-align:left}
.fc .facts{display:flex;flex-wrap:wrap;align-items:center;gap:2px 7px;min-height:22px}
.fc .top{display:flow-root;font-size:13px;line-height:1.5;padding:1px 0;overflow-wrap:break-word}
.fc .top .corner{float:right;display:inline-flex;align-items:center;gap:8px;margin-left:10px;min-height:20px}
.fc .sq{flex:0 0 auto;width:9px;height:9px;border-radius:2px;background:var(--adv);display:inline-block}
.fc.red .sq{background:var(--hard)}
.fc .top .sq{margin-right:7px}
.fc .who{font-size:13.5px;font-weight:800;color:var(--ink);white-space:nowrap}
.fc .lead{font-size:13.5px;font-weight:800;color:var(--ink);margin-right:7px}
.fc .kind{font-size:10.5px;line-height:1.35;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3);white-space:nowrap}
.fc .right{margin-left:auto;display:inline-flex;align-items:center;gap:8px}
.fc .late{background:var(--adv);color:#2A1B00;border-radius:4px;font-size:10px;font-weight:800;line-height:1;letter-spacing:.06em;padding:4px 6px;white-space:nowrap}
.fc .hrs{font-size:12px;color:var(--ink-2);font-variant-numeric:tabular-nums;white-space:nowrap}
.fc .words{display:flex;flex-wrap:wrap;align-items:baseline;column-gap:12px;row-gap:1px;min-width:0}
.fc .words:empty{display:none}
.fc .text{flex:1 1 auto;min-width:0;font-size:13px;line-height:1.3;color:var(--ink-2);overflow-wrap:anywhere}
.fc .text b{color:var(--ink);font-weight:600}
.fc .text .rm{color:var(--ink-3);font-size:12px}
.fc .placed{margin-left:auto;text-align:right;font-size:11.5px;line-height:1.35;color:var(--ink-3)}
.fc-day{font-size:10.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);margin:14px 2px 6px;display:flex;align-items:baseline;gap:8px}
.fc-day:first-child{margin-top:4px}
.fc-day b{color:var(--ink);font-weight:800}
.fc-day i{font-style:normal;margin-left:auto;font-weight:600;letter-spacing:.04em;text-transform:none;font-size:11.5px}
`
/* built in the page from the app's own records: one card an input (a shared input one card, all its people named) */
const build = () => {
  const P = window.PEOPLE, cs = id => (P[id] ? P[id].cs : String(id))
  const TITLED = /^(training|cse|meeting|fly with|personal|appointment|duty|event|od|other)$/i
  const RED = /^(ll|ol|oil|ccl|pl|fcl|el|cl|hl|oml|att c|att b|od|upchit)$/i
  const hh = m => String(Math.floor(m / 60) % 24).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
  window.__fc = (rows, late) => {
    const r = rows[0], type = String(r.type || '')
    const title = TITLED.test(type.trim()) && r.title && String(r.title).toLowerCase() !== type.toLowerCase() ? String(r.title) : ''
    const hrs = r.endDate && r.endDate !== r.date ? 'till ' + String(r.endDate).replace(/^(\w+) (\d+)$/, '$2 $1') : r.allday ? (r.half ? String(r.half).toUpperCase() : 'All day') : `${hh(r.s)}–${hh(r.e)}`
    const who = rows.map(x => cs(x.person)).sort((a, b) => a.localeCompare(b)).join(', ')
    const filer = r.grpBy != null ? r.grpBy : r.by, other = filer != null && !rows.some(x => String(x.person) === String(filer))
    const rm = String(r.remarks || '').trim()
    const facts = rows.length > 1
      ? `<div class="top"><span class="corner">${late ? '<span class="late">LATE</span>' : ''}<span class="hrs">${esc(hrs)}</span></span><span class="lead"><span class="sq"></span>${esc(who)}</span><span class="kind">${esc(type)}</span></div>`
      : `<div class="facts"><span class="sq"></span><span class="who">${esc(who)}</span><span class="kind">${esc(type)}</span><span class="right">${late ? '<span class="late">LATE</span>' : ''}<span class="hrs">${esc(hrs)}</span></span></div>`
    const text = title || rm ? `<span class="text">${title ? `<b>${esc(title)}</b>` : ''}${title && rm ? ' <span class="rm">· ' : rm ? '<span class="rm">' : ''}${rm ? esc(rm) + '</span>' : ''}</span>` : ''
    return `<div class="fc${RED.test(type.trim()) ? ' red' : ''}">${facts}<div class="words">${text}${other ? `<span class="placed">By ${esc(cs(filer))}</span>` : ''}</div></div>`
  }
  /* the inputs as entries: a shared input's records together */
  window.__entries = list => { const m = new Map(); for (const r of list) { const k = r.grp ? 'g:' + r.grp : 'i:' + r.iid; if (!m.has(k)) m.set(k, []); m.get(k).push(r) } return [...m.values()] }
}

async function world() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
  const id = cs => page.evaluate(cs => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === cs), cs)
  const ranger = await id('Ranger'), blade = await id('Blade'), wisp = await id('Wisp')
  await page.evaluate(() => window.go('inputs'))
  for (let i = 0; i < 40; i++) {
    const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = 2026 * 12 + 6 - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) break
    await page.locator(d > 0 ? '#icNext' : '#icPrev').click()
  }
  const file = async (type, who, from, to, title, rmk, several) => {
    if (!(await page.locator(DAY).count())) await page.locator(`#inpCal [data-icday="${ISO}"]`).tap({ position: { x: 8, y: 8 } })
    await page.locator('#icPopAdd').tap(); await page.locator('[data-testid="win-inputedit"]').waitFor()
    await page.selectOption('#inpEditType', type)
    if (several) {
      await page.locator('[data-testid="win-inputedit"] [data-testid="pp-several"]').tap()
      for (const cs of several) { const b = page.locator(`[data-testid="win-inputedit"] [data-pp="${await id(cs)}"]`); if ((await b.getAttribute('aria-pressed')) !== 'true') await b.tap() }
    } else if (who) await page.selectOption('#inpEditPerson', who)
    await page.fill('#inpEditStart', from).catch(() => {}); await page.fill('#inpEditEnd', to).catch(() => {})
    if (title) await page.fill('#inpEditOwnTitle', title)
    if (rmk) await page.fill('#inpEditRmk', rmk)
    await page.locator('#inpEditSave').tap()
    const sheet = page.locator('[data-testid="oilconf"]')
    if (await sheet.waitFor({ timeout: 2500 }).then(() => true, () => false)) { await sheet.locator('[data-testid="oil-yes"]').tap(); await sheet.locator('[data-testid="oilconf-save"]').tap() }
    await page.waitForTimeout(450)
  }
  await file('Event', 'allavail', '06:00', '18:00', 'Sports day', 'bring boots')
  await file('Meeting', null, '10:00', '11:00', 'Flight safety brief', '', ['Ranger', 'Ace', 'Drifter', 'Vapor', 'Blade', 'Cinch'])
  await file('Event', null, '09:00', '16:00', 'Squadron family day and open house visit', '')
  await file('Duty', ranger, '13:00', '15:00', '', '')
  await file('Training', blade, '14:00', '16:00', 'CRM refresher', '')
  await file('Other', wisp, '11:00', '12:00', '', 'Collecting a new ID card from the pass office before lunch')
  await page.addStyleTag({ content: CSS })
  await page.evaluate(build)
  return { ctx, page }
}

const { ctx, page } = await world()
/* 1 — THE CALENDAR: the opened day, its cards redrawn */
if (!(await page.locator(DAY).count())) await page.locator(`#inpCal [data-icday="${ISO}"]`).tap({ position: { x: 8, y: 8 } })
await page.locator(`${DAY} [data-testid^="idy-row-"]`).first().waitFor(); await page.waitForTimeout(400)
await page.screenshot({ path: join(OUT, 'day-today.png') })
await page.evaluate(() => {
  const win = document.querySelector('[data-testid="win-inputsday"]')
  const cards = [...win.querySelectorAll('[data-testid^="idy-row-"]')]
  for (const c of cards) {
    const iid = c.getAttribute('data-popiid'), r = window.INPUTS.find(x => String(x.iid) === iid)
    const rows = r && r.grp ? window.INPUTS.filter(x => x.grp === r.grp) : [r]
    const d = document.createElement('div'); d.innerHTML = window.__fc(rows, !!c.querySelector('.sd-late'))
    c.replaceWith(d.firstChild)
  }
  /* the passing "Input added" note is not part of the picture */
  document.querySelectorAll('.toast,[role="status"].toast,.snack').forEach(t => t.remove())
})
await page.waitForTimeout(3200)
await page.screenshot({ path: join(OUT, 'day-final.png') })
await page.keyboard.press('Escape'); await page.waitForTimeout(300)

/* 2 — THE LIST: the same card, under a slim heading a day; no pencil, no cross */
await page.locator('#inListBtn').tap()
if (!(await page.locator('#inRangePop').count())) await page.locator('#inRangeBtn').tap()
await page.locator('#inRangeAll').tap(); await page.waitForTimeout(400)
await page.evaluate(() => { const t = [...document.querySelectorAll('#inBody tr')].find(tr => /16 Jul/.test(tr.textContent)); if (t) { t.scrollIntoView({ block: 'start' }); window.scrollBy(0, -150) } })
await page.waitForTimeout(300)
await page.screenshot({ path: join(OUT, 'list-today.png') })
await page.evaluate(() => {
  const M = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }
  const ord = r => { const m = /^(\w+) (\d+)$/.exec(String(r.date)); return m ? new Date(r.yr || 2026, M[m[1]], +m[2]).getTime() : 0 }
  const lateIids = new Set(window.INPUTS.filter(r => { try { return !!window.isLateInput(r) } catch { return false } }).map(r => r.iid))
  const from = new Date(2026, 6, 16).getTime(), to = new Date(2026, 6, 22).getTime()
  const list = window.INPUTS.filter(r => !/sans/i.test(String(r.type)) && ord(r) >= from && ord(r) <= to)
  const days = new Map()
  for (const e of window.__entries(list)) { const k = ord(e[0]); if (!days.has(k)) days.set(k, []); days.get(k).push(e) }
  const W = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MN = Object.keys(M)
  const html = [...days.keys()].sort((a, b) => a - b).map(k => {
    const d = new Date(k), es = days.get(k).sort((a, b) => (a[0].allday ? -1 : a[0].s || 0) - (b[0].allday ? -1 : b[0].s || 0))
    return `<div class="fc-day"><b>${W[d.getDay()]} ${d.getDate()} ${MN[d.getMonth()]}</b><i>${es.length} input${es.length > 1 ? 's' : ''}</i></div>` + es.map(e => window.__fc(e, e.some(r => lateIids.has(r.iid)))).join('')
  }).join('')
  const tbl = document.querySelector('#intbl'), box = document.createElement('div')
  box.id = 'fcList'; box.style.cssText = 'padding:0 2px 24px'; box.innerHTML = html
  tbl.replaceWith(box)
  box.scrollIntoView({ block: 'start' }); window.scrollBy(0, -150)
})
await page.waitForTimeout(400)
await page.screenshot({ path: join(OUT, 'list-final.png') })
await ctx.close(); await browser.close()
console.log('done')
