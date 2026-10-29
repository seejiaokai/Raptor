// MOCK-UP on the real app: the Leave War's Events list separated into holidays (public holidays, Off days) and squadron
// events — his ask of 29 Oct 26 ("Can we do a mock up of the separation … of the events page"; his colleague's two panels
// a reference only — "if u find better ways to do it u can"). Drawn on the served build at his iPhone's 402 (3x, touch)
// and his PC's 1536 at 125%, as the admin, through the app's own controls (⚙ → Events…).
// ONE data set for every frame: the demo year's four PH lines are kept and named; sample lines (an Off day, two working
// events, a No leave, two with no kind) are CLONED from a real line, their kind's mark cloned from a real mark — marked
// "drawn in" on the page. Frames:
//   0 today — one list by date (as built, D1500), the busy year
//   A proposed — the same window, two sections under the Settings window's own section heading (".gs-sec", as "Groups"):
//     HOLIDAYS (Public holiday, Off day) first, then SQUADRON EVENTS (Working event, No leave, no kind), each by date,
//     each heading with its count; "＋ Event" and "Edit presets" stay where they are
//   B proposed, desktop only — the two sections side by side in a window twice as wide (the colleague's shape)
// Run from raptor-port:  node scripts/handpass/mock-events-split.mjs <dist> <out-dir>
import { chromium, serveDist } from '../drawcheck/lib.mjs'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
const [, , DIST = 'dist', OUT = 'docs/mock/lw-overhaul/full/m5b/events-split'] = process.argv
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ORIGIN = 'http://localhost:4199'
/* the busy year — [when, name, kind ('' = none), past]; the demo's own four PH lines are matched by their date */
const LINES = [
  ['Thu 1 Jan', "New Year's Day", 'off', true],
  ['Tue 17 – Wed 18 Feb', 'Chinese New Year', 'off', true],
  ['Mon 9 – Fri 20 Mar', 'Ex Pitch Black', 'work', true],
  ['Fri 3 Apr', 'Good Friday', 'off', false],
  ['Mon 6 – Fri 17 Apr', 'ORE — no leave', 'nolv', false],
  ['Fri 1 May', 'Labour Day', 'off', false],
  ['Fri 22 May', 'Squadron dinner', '', false],
  ['Sun 9 Aug', 'National Day', 'off', false],
  ['Mon 10 Aug', 'Off — National Day', 'free', false],
  ['Mon 7 – Fri 11 Sep', 'Ex Cope Tiger', 'work', false],
  ['Sat 31 Oct', 'Families day', '', false],
  ['Fri 25 Dec', 'Christmas Day', 'off', false],
]
const KW = { off: 'Public holiday', free: 'Off day', nolv: 'No leave', work: 'Working event' }
const metrics = {}
for (const kind of ['P', 'D']) {
  const phone = kind === 'P'
  const ctx = await b.newContext(phone ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true, timezoneId: 'Asia/Singapore' }
    : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25, timezoneId: 'Asia/Singapore' })
  await serveDist(ctx, ORIGIN, DIST)
  const p = await ctx.newPage()
  await p.clock.setFixedTime(new Date('2026-04-02T09:00:00+08:00'))
  await p.goto(ORIGIN + '/?fresh=1')
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.evaluate(() => window.go('leavewar')); await p.waitForSelector('[data-testid="settings-open"]', { timeout: 20000 }); await p.waitForTimeout(600)
  const press = async id => { const l = p.locator(`[data-testid="${id}"]`).first(); if (phone) await l.tap(); else await l.click(); await p.waitForTimeout(450) }
  await press('settings-open')
  // the Settings window's own section heading, kept as markup to clone ("Groups")
  const secHTML = await p.evaluate(() => document.querySelector('[data-testid="settings-sheet"] .gs-sec')?.outerHTML || '')
  await press('settings-events')
  await p.waitForSelector('[data-testid="events-list"]')
  // a neutral tap so no control is left lit (the guide's trap)
  await p.locator('[data-testid="events-sheet"] .bidsheet-hd .who').first().click({ force: true }).catch(() => {})
  // fill the list with the busy year: every line cloned from the first real one
  const built = await p.evaluate(({ LINES, KW }) => {
    const list = document.querySelector('[data-testid="events-list"]')
    const proto = list.querySelector('.hol-line'); const mark = list.querySelector('.evpeek-kind')
    if (!proto || !mark) return 'no line to clone'
    const make = ([when, name, k, past]) => {
      const n = proto.cloneNode(true); n.removeAttribute('data-testid')
      n.classList.toggle('is-past', !!past); n.dataset.mk = k || 'none'
      n.querySelector('.hol-when').textContent = when; n.querySelector('.hol-name').textContent = name
      const old = n.querySelector('.evpeek-kind'); if (old) old.remove()
      if (k) { const m = mark.cloneNode(true); m.className = 'evpeek-kind ' + k; m.textContent = KW[k]; n.appendChild(m) }
      return n
    }
    list.innerHTML = ''; LINES.forEach(l => list.appendChild(make(l)))
    list.dataset.mocked = '1'
    return 'ok'
  }, { LINES, KW })
  if (built !== 'ok') throw new Error(built)
  const sheetBox = async () => p.locator('[data-testid="events-sheet"]').first().boundingBox()
  const snap = async name => {
    const ok = await p.evaluate(() => document.querySelector('[data-testid="events-list"]')?.dataset.mocked === '1')
    if (!ok) throw new Error('the drawn list was wiped before ' + name)
    await p.screenshot({ path: join(OUT, `${kind}-${name}.png`) })
    const bx = await sheetBox()
    const sc = await p.evaluate(() => { const l = document.querySelector('[data-testid="events-list"]'); return l ? { list: l.scrollHeight, shown: l.clientHeight } : null })
    metrics[`${kind}-${name}`] = { window: bx && { w: Math.round(bx.width), h: Math.round(bx.height) }, ...sc }
  }
  await snap('0-today')
  // A — two sections in the same window
  await p.evaluate(({ secHTML }) => {
    const list = document.querySelector('[data-testid="events-list"]')
    const lines = [...list.querySelectorAll('.hol-line')]
    const hol = lines.filter(l => l.dataset.mk === 'off' || l.dataset.mk === 'free')
    const ev = lines.filter(l => !(l.dataset.mk === 'off' || l.dataset.mk === 'free'))
    const head = (word, n) => {
      const t = document.createElement('template'); t.innerHTML = secHTML.trim()
      const h = t.content.firstElementChild; h.textContent = `${word} · ${n}`; h.classList.add('mock-sec'); return h
    }
    const box = (arr) => { const d = document.createElement('div'); d.className = list.className + ' mock-part'; arr.forEach(l => d.appendChild(l)); return d }
    const wrap = document.createElement('div'); wrap.className = 'mock-split'; wrap.dataset.testid = 'events-list'
    const colA = document.createElement('div'); colA.className = 'mock-col'; colA.append(head('Holidays', hol.length), box(hol))
    const colB = document.createElement('div'); colB.className = 'mock-col'; colB.append(head('Squadron events', ev.length), box(ev))
    wrap.append(colA, colB); wrap.dataset.mocked = '1'
    wrap.setAttribute('data-testid', 'events-list')
    list.replaceWith(wrap)
    const st = document.createElement('style'); st.id = 'mockcss'
    st.textContent = `.mock-split{display:flex;flex-direction:column;gap:6px;overflow:auto;min-height:0}
      .mock-col{display:flex;flex-direction:column;min-width:0}
      .mock-sec{text-decoration:underline dashed #3BC6E8 2px;text-underline-offset:5px}`  /* the new part, marked on itself */
    document.head.appendChild(st)
  }, { secHTML })
  await snap('A-sections')
  if (!phone) {
    // B — side by side, the window twice as wide
    await p.evaluate(() => {
      const sh = document.querySelector('[data-testid="events-sheet"]')
      const w = sh.getBoundingClientRect().width
      sh.style.width = Math.round(w * 2) + 'px'; sh.style.maxWidth = 'none'
      const r = sh.getBoundingClientRect(); if (r.right > innerWidth - 16) sh.style.left = Math.max(16, innerWidth - 16 - r.width) + 'px'
      const s = document.querySelector('.mock-split'); s.style.flexDirection = 'row'; s.style.gap = '16px'; s.style.alignItems = 'flex-start'
      document.querySelectorAll('.mock-col').forEach(c => { c.style.flex = '1 1 0' })
    })
    await snap('B-side-by-side')
  }
  await ctx.close()
}
await b.close()
writeFileSync(join(OUT, 'metrics.json'), JSON.stringify(metrics, null, 1))
console.log(JSON.stringify(metrics, null, 1))
