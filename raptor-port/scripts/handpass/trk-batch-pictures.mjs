/* THE TRACKER BATCH (D495) — the BEFORE and AFTER pictures of each visible change (17 Oct 26; plan
   docs/superpowers/plans/2026-10-17-tracker-batch-triage.md). The SAME steps run on the build before the batch (main)
   and on the batch's build, so each pair shows one change and nothing else. Every step goes through the app's own
   controls — the side panel's date boxes, + Add, the chart, Edit chart layout, the Leave War's Post out, Log out /
   Log in, the keyboard. The one thing done from outside is making the browser's storage refuse every write (the
   failed-save picture), which is the condition being shown, not a state of the app. Orange numbered boxes are
   ANNOTATIONS (where to look), never part of the app. The clock is held at 17 Oct 26.
   node scripts/handpass/trk-batch-pictures.mjs <base url> <out folder> <tag: before|after> [only=a,b,…] */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from '@playwright/test'

const [BASE, OUT, TAG = 'before', ONLY = ''] = process.argv.slice(2)
const only = ONLY.replace(/^only=/, '').split(',').filter(Boolean)
const want = k => !only.length || only.includes(k)
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const errors = [], notes = []
const TODAY = '2026-10-17'
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function world(phone) {
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 }
    : { viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.clock.setFixedTime(new Date(TODAY + 'T09:00:00+08:00'))
  page.on('pageerror', e => errors.push((phone ? 'phone ' : 'desk ') + 'PAGEERROR ' + e.message))
  page.on('console', m => { if (m.type() === 'error' && !/walk: forced|QuotaExceeded/.test(m.text())) errors.push((phone ? 'phone ' : 'desk ') + m.text()) })
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await signIn(page)
  await toTracker(page, phone)
  const press = async sel => { const l = page.locator(sel).first(); if (phone) await l.tap(); else await l.click(); await sleep(350) }
  const view = async v => { if (phone) await press(`#page-tracker button[data-view="${v}"]`) }
  const pickDate = async (boxSel, iso) => {
    await page.locator(boxSel).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
    await press(boxSel)
    await page.waitForSelector('[data-testid="dcal-card"]')
    for (let i = 0; i < 6; i++) {
      const at = await page.locator('[data-testid="dcal"]').getAttribute('data-month')
      if (at === iso.slice(0, 7)) break
      await press(`[data-testid="dcal-${at < iso.slice(0, 7) ? 'next' : 'prev'}"]`)
    }
    await press(`[data-testid="dcal-day-${iso}"]`); await sleep(300)
  }
  const mark = async (sel, n, pad = 4) => page.evaluate(([s, n, pad]) => {
    const e = document.querySelector(s); if (!e) throw new Error('nothing to mark: ' + s)
    const r = e.getBoundingClientRect(), d = document.createElement('div')
    d.className = '__mark'
    Object.assign(d.style, { position: 'fixed', left: (r.left - pad) + 'px', top: (r.top - pad) + 'px', width: (r.width + 2 * pad) + 'px', height: (r.height + 2 * pad) + 'px',
      border: '3px solid #ff8c1a', borderRadius: '8px', zIndex: 99999, pointerEvents: 'none', boxSizing: 'border-box' })
    const t = document.createElement('span'); t.textContent = String(n)
    Object.assign(t.style, { position: 'absolute', left: '-3px', top: '-22px', background: '#ff8c1a', padding: '1px 7px', borderRadius: '6px', font: '700 13px system-ui', color: '#111' })
    d.appendChild(t); document.body.appendChild(d)
  }, [sel, n, pad])
  const note = async text => page.evaluate(t => {
    const d = document.createElement('div'); d.className = '__mark'; d.textContent = t
    Object.assign(d.style, { position: 'fixed', right: '8px', bottom: '8px', background: '#ff8c1a', color: '#111', font: '700 13px system-ui', padding: '6px 10px', borderRadius: '8px', zIndex: 99999, maxWidth: '360px' })
    document.body.appendChild(d)
  }, `${TAG.toUpperCase()} — ${text}`)
  const clearMarks = () => page.evaluate(() => document.querySelectorAll('.__mark').forEach(e => e.remove()))
  const shot = async name => { await page.screenshot({ path: join(OUT, `${name}-${phone ? 'phone' : 'desk'}-${TAG}.png`) }); console.log('picture', name, phone ? 'phone' : 'desk') }
  /* a ball's centre on screen, the ball brought into the middle of the chart first by the chart's own scroll */
  const ballAt = id => page.evaluate(i => {
    const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === i); if (!g) return null
    const r = g.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }, id)
  const centreOn = async id => {
    await page.evaluate(i => {
      const bd = document.getElementById('board'), g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === i)
      if (!bd || !g) return; const r = g.getBoundingClientRect(), b = bd.getBoundingClientRect()
      bd.scrollTop += (r.top + r.height / 2) - (b.top + b.height / 2); bd.scrollLeft += (r.left + r.width / 2) - (b.left + b.width / 2)
    }, id); await sleep(200)
  }
  /* open a ball's marking pop-up by pressing on its centre icon */
  const openBall = async id => {
    await view('flow'); await centreOn(id)
    const c = await ballAt(id); if (!c) throw new Error('no ball ' + id)
    if (phone) await page.touchscreen.tap(c.x, c.y); else await page.mouse.click(c.x, c.y)
    await page.waitForSelector('#pop', { timeout: 4000 }); await sleep(250)
  }
  const grade = async (id, label) => { await openBall(id); await page.locator('#pop .opts button', { hasText: label }).first().click(); await sleep(400) }
  return { ctx, page, phone, press, view, pickDate, mark, note, clearMarks, shot, ballAt, centreOn, openBall, grade }
}
async function signIn(page) {
  await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(400)
}
async function signOut(page, phone) {
  const desk = page.locator('#logoutBtn:visible, .topbar button:has-text("Log out"):visible, .topbar button:has-text("Logout"):visible')
  if (await desk.count()) await desk.first().click()
  else { await page.click('#burger'); await sleep(250); await page.locator('#drawer').getByText(/Log ?out/i).first().click() }
  /* the Tracker asks first when a chart edit is unsaved (D129) — none is, in these steps */
  await page.waitForSelector('#luser')
}
async function toTracker(page, phone) {
  const tab = page.locator('#topnav a[data-page="tracker"]:visible')
  if (await tab.count()) await tab.click()
  else { await page.click('#burger'); await sleep(250); await page.locator('#drawer a[data-page="tracker"]').first().click() }
  await page.waitForFunction(() => window.CURPAGE === 'tracker')
  await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await sleep(700)
}
async function step(name, fn) {
  try { await fn() } catch (e) { notes.push(`${name}: ${e.message.split('\n')[0]}`); console.log('  !!', name, e.message.split('\n')[0]) }
}
/* what the chart shows at its top edge: how far the first ball's top sits below the chart box's top */
const landing = page => page.evaluate(() => {
  const bd = document.getElementById('board'), b = bd.getBoundingClientRect()
  const balls = [...document.querySelectorAll('#flowSvg .ball')].map(g => g.getBoundingClientRect())
  const topBall = Math.min(...balls.map(r => r.top))
  return { scrollTop: Math.round(bd.scrollTop), scrollLeft: Math.round(bd.scrollLeft), emptyAboveFirstBall: Math.round(topBall - b.top) }
})

for (const phone of [false, true]) {
  /* A — D982: the Currency & flex bars' words */
  if (want('a')) await step('a ' + (phone ? 'phone' : 'desk'), async () => {
    const w = await world(phone), p = w.page
    await w.view('info')
    for (const [student, syll, curr, t] of [['STUDENT A', '2026-10-07', '2026-10-14', 'a'], ['STUDENT B', '2026-09-27', '2026-10-07', 'b']]) {
      await p.selectOption('#activeSel', { label: student }); await sleep(500)
      await w.pickDate('#lastSyll', syll); await w.pickDate('#lastCurr', curr)
      await p.locator('.flexbar').first().evaluate(e => { e.scrollIntoView({ block: 'center' }); e.closest('.card').id = '__bars' }); await sleep(250)
      await w.mark('#__bars', 1); await w.note(`D982 (${student}): the words on the Currency & flex bars`)
      await w.shot(`a-bars-${t}`); await w.clearMarks()
    }
    await w.ctx.close()
  })

  /* B — the Students card's key: a third student with a longer name, drawn on the LEFT */
  if (want('b')) await step('b ' + (phone ? 'phone' : 'desk'), async () => {
    const w = await world(phone), p = w.page
    await w.view('info')
    await w.press('#addStu')
    await p.waitForSelector('#dlgModal', { state: 'visible' })
    await p.locator('#dlgInput').fill('HIS STUDENT'); await w.press('#dlgOk'); await sleep(600)
    await p.locator('.keyball').first().evaluate(e => { e.scrollIntoView({ block: 'center' }); e.closest('.card').id = '__key' }); await sleep(250)
    await w.mark('.keyball', 1, 2); await w.note('[TRK-KEY-NAME-CLIP]: the key round the course ball — the name on the left')
    await w.shot('b-key'); await w.clearMarks()
    await w.ctx.close()
  })

  /* C — D981: a squadron member on the course, deleted through Post out (desktop: the Leave War's Post out sheet) */
  if (want('c') && !phone) await step('c desk', async () => {
    const w = await world(phone), p = w.page
    await w.view('info')
    await w.press('#addStu')
    await p.waitForSelector('#dlgList .dlg-item')
    await p.locator('#dlgList .dlg-item', { hasText: 'HEX' }).first().click(); await sleep(200)
    if (await p.locator('#dlgOk:visible').count()) await w.press('#dlgOk')
    await sleep(700)
    await p.locator('.c-students').first().evaluate(e => { e.scrollIntoView({ block: 'center' }) }); await sleep(250)
    await w.mark('.c-students', 1); await w.note('D981: HEX, a squadron member, on the course — nothing marked yet (events still to do)')
    await w.shot('c1-on-course'); await w.clearMarks()
    /* the Leave War: today's cell on his row → Post out → Delete, twice */
    await p.evaluate(() => window.go('leavewar')); await sleep(900)
    const m = p.locator('[data-testid="month-Oct"]'); if (await m.count()) { await m.first().click(); await sleep(900) }
    const cell = p.locator(`[data-testid="cell-rocky-${TODAY}"]`); await cell.scrollIntoViewIfNeeded(); await cell.click(); await sleep(400)
    await p.click('[data-testid="bid-postout"]'); await sleep(300)
    await p.click('[data-testid="po-delete"]'); await sleep(200)
    await p.click('[data-testid="po-confirm"]'); await sleep(300)
    await p.click('[data-testid="po-confirm"]'); await sleep(1200)
    await p.keyboard.press('Escape').catch(() => {})
    const gone = await p.evaluate(() => !!(window.PEOPLE.rocky && window.PEOPLE.rocky.deleted))
    notes.push(`c: HEX deleted through Post out: ${gone}`)
    await toTracker(p, phone); await w.view('info'); await sleep(800)
    await p.locator('.c-students').first().evaluate(e => { e.scrollIntoView({ block: 'center' }) }); await sleep(250)
    await w.mark('.c-students', 1); await w.note('D981: after HEX is deleted through Post out — the Students card')
    await w.shot('c2-after-delete'); await w.clearMarks()
    await w.ctx.close()
  })

  /* D — coming back to the Tracker: a mark far down the chart, then Log out and back in */
  if (want('d')) await step('d ' + (phone ? 'phone' : 'desk'), async () => {
    const w = await world(phone), p = w.page
    await w.grade('ACG-02', 'DCO')
    await w.shot('d1-marked');
    const before = await landing(p)
    await signOut(p, phone); await signIn(p); await toTracker(p, phone); await sleep(600)
    const after = await landing(p)
    notes.push(`d ${phone ? 'phone' : 'desk'}: marked ACG-02 → ${JSON.stringify(before)}; after Log out / Log in → ${JSON.stringify(after)}`)
    await w.note('[TRK-REMOUNT-LANDING]: back on the Tracker after Log out and Log in — the last mark was ACG-02')
    await w.shot('d2-back-after-login'); await w.clearMarks()
    /* a student with nothing marked: the landing is the chart's first event */
    if (phone) {
      await w.view('info'); await p.selectOption('#activeSel', { label: 'STUDENT B' }); await sleep(800)
      await w.view('flow'); await sleep(500)
      const fresh = await landing(p)
      notes.push(`d phone: picking STUDENT B (nothing marked) → ${JSON.stringify(fresh)}`)
      await w.note('[TRK-REMOUNT-LANDING]: a student with nothing marked lands on the first event — the space above it')
      await w.shot('d3-first-event'); await w.clearMarks()
    }
    await w.ctx.close()
  })

  /* E — a mark made while the browser refuses to store anything: what the Tracker's corner says */
  if (want('e') && !phone) await step('e desk', async () => {
    const w = await world(phone), p = w.page
    await p.evaluate(() => { window.__set = Storage.prototype.setItem; Storage.prototype.setItem = function () { throw new DOMException('walk: forced', 'QuotaExceededError') } })
    await w.grade('ST-02', 'DCO')
    await p.keyboard.press('Escape'); await sleep(2500)
    const corner = await p.evaluate(() => { const s = document.getElementById('saveStat'); return s && !s.hidden ? s.textContent : '(nothing)' })
    const band = await p.evaluate(() => { const s = document.querySelector('.topbar .savestat'); return s ? s.textContent.replace(/\s+/g, ' ').trim() : '(no band)' })
    notes.push(`e: the Tracker's corner "${corner}" · Raptor's band "${band}"`)
    await p.evaluate(() => { const s = document.getElementById('saveStat'); if (s) s.id = 'saveStat' })
    if (await p.locator('#saveStat:visible').count()) await w.mark('#saveStat', 1)
    if (await p.locator('.topbar .savestat:visible').count()) await w.mark('.topbar .savestat', 2)
    await w.note('[TRK-SAVE-FAIL-SAYS-SAVED]: 1 the Tracker\'s own corner · 2 Raptor\'s "Not saved" band — storage refusing every write')
    await w.shot('e-save-failed'); await w.clearMarks()
    await p.evaluate(() => { Storage.prototype.setItem = window.__set })
    await w.ctx.close()
  })

  /* F — Edit chart layout: ⤢ Fit, then ST-01 dragged left of and above the chart's start; then out of Edit */
  if (want('f') && !phone) await step('f desk', async () => {
    const w = await world(phone), p = w.page
    await w.press('#sylMenuBtn'); await w.press('#arrangeBtn'); await sleep(500)
    await w.press('#fitBtn'); await sleep(500)
    const c = await w.ballAt('ST-01'); if (!c) throw new Error('no ST-01')
    const svg = await p.evaluate(() => { const r = document.getElementById('flowSvg').getBoundingClientRect(); return { left: r.left, top: r.top } })
    const to = { x: Math.max(svg.left + 6, c.x - 160), y: Math.max(svg.top + 6, c.y - 120) }
    await p.mouse.move(c.x, c.y); await p.mouse.down()
    for (let k = 1; k <= 12; k++) await p.mouse.move(c.x + (to.x - c.x) * k / 12, c.y + (to.y - c.y) * k / 12)
    await p.mouse.up(); await sleep(400)
    const pos = await p.evaluate(() => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'ST-01'); return g.getAttribute('transform') })
    notes.push(`f: ST-01 after the drop, in Edit chart layout: ${pos}`)
    await w.note('[TRK-BALL-OFF-CHART-LEFT]: ST-01 dropped left of and above the chart, in Edit chart layout')
    await w.shot('f1-dropped-in-edit'); await w.clearMarks()
    await w.press('#sylMenuBtn'); await w.press('#arrangeBtn'); await sleep(600)
    await p.evaluate(() => { const bd = document.getElementById('board'); bd.scrollTop = 0; bd.scrollLeft = 0 }); await sleep(200)
    await w.note('[TRK-BALL-OFF-CHART-LEFT]: out of Edit chart layout, the chart scrolled to its top-left — where is ST-01?')
    await w.shot('f2-out-of-edit'); await w.clearMarks()
    await w.ctx.close()
  })

  /* G — D980: the chart by keyboard. Tab from the page into the chart, → twice, Enter, then Escape */
  if (want('g') && !phone) await step('g desk', async () => {
    const w = await world(phone), p = w.page
    /* start the keyboard from the search box in the Tracker's bar, then Tab forward until the chart has it */
    await p.locator('#trkSearch, #page-tracker input[type="search"]').first().focus().catch(() => {})
    let on = ''
    for (let i = 0; i < 60; i++) { await p.keyboard.press('Tab'); on = await p.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.className || document.activeElement.tagName)); if (on === 'board') break }
    notes.push(`g: after Tab, the keyboard is on: ${on}`)
    await sleep(300)
    await w.note('D980: Tab has reached the chart')
    await w.shot('g1-tab-into-chart'); await w.clearMarks()
    await p.keyboard.press('ArrowRight'); await sleep(250); await p.keyboard.press('ArrowRight'); await sleep(350)
    await w.note('D980: then → twice')
    await w.shot('g2-arrows'); await w.clearMarks()
    await p.keyboard.press('Enter'); await sleep(500)
    const popOpen = await p.locator('#pop').count()
    const inPop = await p.evaluate(() => !!(document.activeElement && document.activeElement.closest && document.activeElement.closest('#pop')))
    notes.push(`g: after Enter — the marking pop-up open: ${!!popOpen}; the keyboard inside it: ${inPop}`)
    await w.note('D980: then Enter')
    await w.shot('g3-enter'); await w.clearMarks()
    await p.keyboard.press('Escape'); await sleep(400)
    const back = await p.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.tagName))
    notes.push(`g: after Escape the keyboard is on: ${back}`)
    await w.note('D980: then Escape')
    await w.shot('g4-escape'); await w.clearMarks()
    await w.ctx.close()
  })

  /* H — [TRK-WIREBOARD-REPEAT]: two balls moved in Edit chart layout, then ONE step of the mouse wheel */
  if (want('h') && !phone) await step('h desk', async () => {
    const w = await world(phone), p = w.page
    /* no ⤢ Fit here: at a fitted chart's small zoom the scale is read to three places and a step's ratio is lost */
    await w.press('#sylMenuBtn'); await w.press('#arrangeBtn'); await sleep(500)
    const k = () => p.evaluate(() => { const m = /scale\(([\d.]+)/.exec(document.getElementById('viewport').getAttribute('transform') || ''); return m ? +m[1] : null })
    const oneWheel = async () => { const b = await p.evaluate(() => { const r = document.getElementById('flowSvg').getBoundingClientRect(); return { x: r.left + 200, y: r.top + 200 } }); await p.mouse.move(b.x, b.y); const k0 = await k(); await p.mouse.wheel(0, -100); await sleep(300); return (await k()) / k0 }
    const r0 = await oneWheel()
    for (const id of ['ST-01', 'ST-02']) {
      const c = await w.ballAt(id); await p.mouse.move(c.x, c.y); await p.mouse.down()
      for (let i = 1; i <= 6; i++) await p.mouse.move(c.x + 4 * i, c.y + 2 * i)
      await p.mouse.up(); await sleep(300)
    }
    const r2 = await oneWheel()
    notes.push(`h: one wheel step zooms ×${r0.toFixed(3)} before any move, ×${r2.toFixed(3)} after two balls moved (the same step should give the same zoom)`)
    await w.ctx.close()
  })
}
writeFileSync(join(OUT, `notes-${TAG}${only.length ? "-" + only.join("") : ""}.txt`), notes.join('\n') + '\n\nerrors:\n' + (errors.join('\n') || 'none') + '\n')
console.log(notes.join('\n'))
console.log('errors:', errors.length ? errors.join(' | ') : 'none')
await browser.close()
