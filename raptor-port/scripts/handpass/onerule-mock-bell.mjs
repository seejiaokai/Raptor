// A MOCK-UP, NOT A BUILD — the bell's list of notices (the one-rule plan's step 7; owner D757, D760: "the member is told
// by his bell"). TODAY the bell opens no list: a tap goes straight to the one thing waiting (an access request, a bug
// report, an OIL question) or says "No new notifications for this view". The plan adds notices — a scheduler changed an
// input you are in — and a short list to read them in. This script signs in as the member (us / us — Ranger), takes one
// REAL picture of today's bell, then DRAWS the proposed list on the real screen by injecting a stylesheet and one panel
// (class "mockbell"). Nothing injected is in the app. The panel borrows the app's own small menu (.sb-moremenu /
// .schedule-moremenu in the scheduler's stylesheet: the panel colour, the lighter border, the 10px corners, the shadow,
// 13px lines with 8px × 11px padding and 7px corners) and the app's own small button (.abtn.sm.ghost) for its foot.
//   list            the plan's wording, newest first; unread lines bright with a dot, read ones grey; "Mark all read"
//   list-shorter    the same four notices with fewer words — the input first, what happened under it (as the changes
//                   window leads every line with its item — D340)
//   empty           nothing waiting: "Nothing new"
//   list-oil-first  a SUGGESTION, not in the plan's words: one of today's four kinds (an OIL question) drawn as the
//                   first line of the same list, red-dotted, above the notices
// Phone (iPhone 13) and desktop (1440×900), every picture at twice the pixels so it stays sharp when he zooms.
//
//   npm run build && npx vite preview --port 4186 --strictPort
//   node scripts/handpass/onerule-mock-bell.mjs [out dir]        (default docs/mock/2026-10-12-one-rule)
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const OUT = process.argv[2] || 'docs/mock/2026-10-12-one-rule'
const URL = process.env.LOOK_URL || 'http://localhost:4186/'
mkdirSync(OUT, { recursive: true })
const SIZES = {
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  phone: { ...devices['iPhone 13'], deviceScaleFactor: 2 },
}

/* what the list says. `t` the line, `m` the small print under it, `ago` (the shorter wording only) at the line's right */
const PLAN = [
  { t: 'Saber added ALL AVAIL to your Training', m: 'Sat 18 Jul · 2 min ago' },
  { t: 'Saber cancelled your Range brief — WX', m: 'Wed 15 Jul · 1 h ago' },
  { t: 'Saber took you off Kit check', m: 'Wed 15 Jul · yesterday', read: true },
  { t: 'Saber changed the time of your Meeting to 10:00–11:00', m: 'Thu 16 Jul · 2 days ago', read: true },
]
const SHORT = [
  { t: 'Training', d: 'Sat 18 Jul', m: 'ALL AVAIL added · Saber', ago: '2 min' },
  { t: 'Range brief', d: 'Wed 15 Jul', m: 'Cancelled — WX · Saber', ago: '1 h' },
  { t: 'Kit check', d: 'Wed 15 Jul', m: 'You were taken off · Saber', ago: 'yesterday', read: true },
  { t: 'Meeting', d: 'Thu 16 Jul', m: 'Now 10:00–11:00 · Saber', ago: '2 d', read: true },
]
const OIL = { t: 'Confirm your OIL', m: 'Duty · Sat 18 Jul', todo: true }
const LISTS = {
  list: { lines: PLAN, lit: true },
  'list-shorter': { lines: SHORT, lit: true },
  empty: { lines: [], lit: false },
  'list-oil-first': { lines: [OIL, ...PLAN], lit: true },
}

const SHEET = `
  .mockbell{position:fixed;z-index:500;box-sizing:border-box;width:348px;max-width:calc(100vw - 16px);padding:4px;background:var(--panel);
    border:1px solid var(--edge-2);border-radius:10px;box-shadow:0 10px 28px rgba(0,0,0,.5);color:var(--ink);font-size:13px;text-align:left}
  .mockbell.wide{left:8px;right:8px;width:auto;max-width:none}
  .mockbell .mb-line{display:grid;grid-template-columns:7px minmax(0,1fr) auto;column-gap:9px;align-items:start;box-sizing:border-box;width:100%;
    min-height:38px;padding:8px 11px;background:none;border:0;border-radius:7px;color:inherit;font:inherit;text-align:left;cursor:pointer}
  .mockbell .mb-dot{width:7px;height:7px;margin-top:5px;border-radius:50%;background:var(--accent)}
  .mockbell .mb-line.read .mb-dot{background:none}
  .mockbell .mb-line.todo .mb-dot{background:var(--hard)}
  .mockbell .mb-t{display:block;font-size:13px;font-weight:600;line-height:1.3;color:var(--ink);overflow-wrap:anywhere}
  .mockbell .mb-t i{font-style:normal;font-weight:400;color:var(--ink-2);margin-left:7px}
  .mockbell .mb-m{display:block;margin-top:2px;font-size:11.5px;line-height:1.35;color:var(--ink-3)}
  .mockbell .mb-m.what{font-size:12.5px;color:var(--ink-2)}
  .mockbell .mb-ago{font-size:11.5px;line-height:1.5;color:var(--ink-3);white-space:nowrap}
  .mockbell .mb-line.read .mb-t{font-weight:400;color:var(--ink-3)}
  .mockbell .mb-line.read .mb-t i,.mockbell .mb-line.read .mb-m.what{color:var(--ink-3)}
  .mockbell .mb-rule{height:1px;margin:4px 7px;background:var(--edge)}
  .mockbell .mb-foot{display:flex;justify-content:flex-end;margin-top:4px;padding:6px 7px 3px;border-top:1px solid var(--edge)}
  .mockbell .mb-empty{padding:18px 11px;text-align:center;font-size:12.5px;color:var(--ink-3)}
`
/* draw one list under the bell; returns the panel's box */
const draw = (page, which, wide) => page.evaluate(([spec, wide, sheet]) => {
  document.querySelectorAll('.mockbell').forEach(e => e.remove())
  let st = document.getElementById('mockbell-style'); if (!st) { st = document.createElement('style'); st.id = 'mockbell-style'; document.head.appendChild(st) }
  st.textContent = sheet
  const bell = [...document.querySelectorAll('.bellbtn')].find(b => b.offsetParent)
  bell.classList.toggle('on', spec.lit)                      // the bell's own lit look: the accent ring and the red dot
  bell.setAttribute('aria-expanded', 'true')
  /* a span of hours never breaks at its dash ("10:00–" on one line, "11:00" on the next) */
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\d\d:\d\d–\d\d:\d\d/g, m => `<span style="white-space:nowrap">${m}</span>`)
  const p = document.createElement('div'); p.className = 'mockbell' + (wide ? ' wide' : ''); p.setAttribute('role', 'menu'); p.setAttribute('aria-label', 'Notifications')
  let h = ''
  spec.lines.forEach((l, i) => {
    h += `<button type="button" role="menuitem" class="mb-line${l.read ? ' read' : ''}${l.todo ? ' todo' : ''}"><span class="mb-dot"></span><span>`
      + `<span class="mb-t">${esc(l.t)}${l.d ? `<i>${esc(l.d)}</i>` : ''}</span><span class="mb-m${l.ago ? ' what' : ''}">${esc(l.m)}</span></span>`
      + `<span class="mb-ago">${l.ago ? esc(l.ago) : ''}</span></button>`
    if (l.todo && spec.lines[i + 1] && !spec.lines[i + 1].todo) h += '<div class="mb-rule"></div>'
  })
  if (!spec.lines.length) h = '<div class="mb-empty">Nothing new</div>'
  else h += '<div class="mb-foot"><button type="button" class="abtn sm ghost">Mark all read</button></div>'
  p.innerHTML = h
  document.body.appendChild(p)
  const b = bell.getBoundingClientRect(), bar = (bell.closest('.topbar') || bell.parentElement).getBoundingClientRect()
  if (wide) p.style.top = Math.round(bar.bottom + 6) + 'px'
  else { p.style.top = Math.round(b.bottom + 6) + 'px'; p.style.right = Math.round(window.innerWidth - b.right) + 'px' }
  const r = p.getBoundingClientRect(), cs = getComputedStyle(p)
  return { x: r.x, y: r.y, width: r.width, height: r.height, font: cs.fontFamily, bg: cs.backgroundColor }
}, [LISTS[which], wide, SHEET])

const browser = await chromium.launch(launchOptions)
for (const size of Object.keys(SIZES)) {
  const ctx = await browser.newContext(SIZES[size])
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`) })
  const press = loc => (size === 'desk' ? loc.click() : loc.tap())
  const VW = SIZES[size].viewport.width, VH = SIZES[size].viewport.height
  const file = name => join(OUT, name)
  const say = (step, what) => console.log(`${size} ${step}: ${what}`)

  await page.goto(URL + '?fresh=1')
  await page.fill('#luser', 'us'); await page.fill('#lpass', 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await page.waitForTimeout(400)

  /* TODAY, for the record: what a tap on the bell does now (one real picture on the desktop, nothing injected) */
  const bell = page.locator('.bellbtn:visible').first()
  say('the bell today', JSON.stringify({ lit: /\bon\b/.test(await bell.getAttribute('class')) }))
  await press(bell); await page.waitForTimeout(500)
  say('a tap today', JSON.stringify({ says: (await page.locator('#toastEl').innerText().catch(() => '')).trim(), opens: await page.evaluate(() => !!document.querySelector('[role="menu"], .bellmenu, .bellpop')), page: await page.evaluate(() => (document.querySelector('.page.on') || {}).id) }))
  if (size === 'desk') await page.screenshot({ path: file('bell-real-desk-today-full.png') })
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })
  await page.mouse.move(VW / 2, VH / 2)                       // no hover left on the bell

  const wide = size === 'phone'
  const shots = size === 'desk' ? ['list', 'list-shorter', 'empty', 'list-oil-first'] : ['list', 'list-shorter']
  for (const which of shots) {
    const b = await draw(page, which, wide)
    say(which, JSON.stringify({ at: [Math.round(b.x), Math.round(b.y)], size: [Math.round(b.width), Math.round(b.height)], font: b.font, bg: b.bg, words: (await page.locator('.mockbell').innerText()).replace(/\s+/g, ' ') }))
    if (which === 'list') await page.screenshot({ path: file(`bell-${size}-full.png`) })
    /* the panel with the top bar above it and a little of the page around it */
    const x = wide ? 0 : Math.max(0, b.x - 150), y = 0
    await page.screenshot({ path: file(`bell-${size}-${which}.png`), clip: { x, y, width: VW - x, height: Math.min(VH, b.y + b.height + (wide ? 60 : 36)) } })
  }

  console.log(size, errors.length ? 'ERRORS ' + errors.join(' | ') : 'no console errors, page errors or failed requests')
  await ctx.close()
}
await browser.close()
