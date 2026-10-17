/* THE TRACKER BATCH, ROUND 1 — the pictures put to him with its four questions (17 Oct 26, the night's run; plan
   docs/superpowers/plans/2026-10-17-tracker-batch-triage.md). Drives the built app on its demo data, the clock held
   at 17 Oct 26, through the app's own controls (the marking pop-up's − / + and its date boxes, the side panel's date
   boxes, + Add on the Students card). Every orange numbered box is an ANNOTATION (where to look), never part of the
   app. A picture named "proposed" is DRAWN IN, and says so on itself: Q2's keyboard ring (the app's accent colour,
   the shape of the one-look ring — D876) and Q4's dark words (Raptor's --bg on the bar, the recipe its own amber
   chips use); the rest is the app as built.
   node scripts/handpass/trk-r1-pictures.mjs <base url> <out folder> */
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from '@playwright/test'

const [BASE, OUT] = process.argv.slice(2)
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const errors = []

async function world(phone) {
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 }
    : { viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.clock.setFixedTime(new Date('2026-10-17T09:00:00+08:00'))
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('tracker'))
  await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await page.waitForTimeout(700)
  const press = async sel => { const l = page.locator(sel).first(); if (phone) await l.tap(); else await l.click(); await page.waitForTimeout(350) }
  const view = async v => { if (phone) await press(`#page-tracker button[data-view="${v}"]`) }
  /* a date picked on the app's one calendar, opened from its own box */
  const pickDate = async (boxSel, iso) => {
    await page.locator(boxSel).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(150)
    await press(boxSel)
    await page.waitForSelector('[data-testid="dcal-card"]')
    for (let i = 0; i < 6; i++) {
      const at = await page.locator('[data-testid="dcal"]').getAttribute('data-month')
      if (at === iso.slice(0, 7)) break
      await press(`[data-testid="dcal-${at < iso.slice(0, 7) ? 'next' : 'prev'}"]`)
    }
    await press(`[data-testid="dcal-day-${iso}"]`); await page.waitForTimeout(300)
  }
  /* an orange numbered box over an element — an annotation, not the app */
  const mark = async (sel, n, pad = 4) => page.evaluate(([s, n, pad]) => {
    const e = document.querySelector(s); if (!e) throw new Error('nothing to mark: ' + s)
    const r = e.getBoundingClientRect(), d = document.createElement('div')
    d.className = '__mark'; d.textContent = String(n)
    Object.assign(d.style, { position: 'fixed', left: (r.left - pad) + 'px', top: (r.top - pad) + 'px', width: (r.width + 2 * pad) + 'px', height: (r.height + 2 * pad) + 'px',
      border: '3px solid #ff8c1a', borderRadius: '8px', zIndex: 99999, pointerEvents: 'none', boxSizing: 'border-box',
      font: '700 13px system-ui', color: '#111', textAlign: 'left' })
    const t = document.createElement('span'); t.textContent = String(n)
    Object.assign(t.style, { position: 'absolute', left: '-3px', top: '-22px', background: '#ff8c1a', padding: '1px 7px', borderRadius: '6px' })
    d.textContent = ''; d.appendChild(t); document.body.appendChild(d)
  }, [sel, n, pad])
  const note = async text => page.evaluate(t => {
    const d = document.createElement('div'); d.className = '__mark'; d.textContent = t
    Object.assign(d.style, { position: 'fixed', right: '8px', bottom: '8px', background: '#ff8c1a', color: '#111', font: '700 13px system-ui', padding: '6px 10px', borderRadius: '8px', zIndex: 99999, maxWidth: '360px' })
    document.body.appendChild(d)
  }, text)
  const clearMarks = () => page.evaluate(() => document.querySelectorAll('.__mark, .__drawn').forEach(e => e.remove()))
  const shot = async name => { await page.screenshot({ path: join(OUT, name + '.png') }); console.log('picture', name) }
  return { ctx, page, phone, press, view, pickDate, mark, note, clearMarks, shot }
}

for (const phone of [false, true]) {
  const w = await world(phone), p = w.page, S = phone ? 'phone' : 'desk'

  /* Q1 — what the marking pop-up keeps today: two failures on ST-02 on their own days, then the pass */
  await w.view('flow')
  const openBall = async id => {
    await p.evaluate(i => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === i); g.scrollIntoView({ block: 'center', inline: 'center' }); g.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 300, clientY: 300 })) }, id)
    await p.waitForSelector('#popFailPlus', { timeout: 4000 }); await p.waitForTimeout(300)
  }
  await openBall('ST-02')
  await w.pickDate('#popFailDate', '2026-10-03'); await w.press('#popFailPlus')
  await w.pickDate('#popFailDate', '2026-10-10'); await w.press('#popFailPlus')
  await w.press('#pop .opts button:nth-child(2)')                 /* DCO — done today */
  if (!(await p.locator('#pop').count())) await openBall('ST-02')
  const nFails = await p.locator('#popFailDates .fdate').count()
  if (nFails !== 2) throw new Error('Q1: the premise — two dated failures — is not on screen (' + nFails + ')')
  await p.locator('#pop').evaluate(e => e.scrollIntoView({ block: 'center' }))
  await w.mark('#popFailDates', 1); await w.mark('#popDoneRow', 2)
  await w.note('Q1 — today, as built: 1 every failure, with its day · 2 the day it was done')
  await w.shot(`q1-today-${S}`); await w.clearMarks()
  await p.keyboard.press('Escape'); await p.waitForTimeout(300)
  if (!phone) {
    await w.view('info')
    await p.locator('#failsCard').evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(200)
    await w.mark('#failsCard', 1)
    await w.note('Q1 — today, as built: the Failures card lists each failure (ST-02, ST-02X)')
    await w.shot(`q1-failures-card-${S}`); await w.clearMarks()
  }

  /* Q2 — DRAWN IN: the keyboard on the chart (desktop only — the keyboard is a desk thing, D820) */
  if (!phone) {
    await w.view('flow')
    await p.evaluate(() => {
      const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'ACG-02'); g.scrollIntoView({ block: 'center', inline: 'center' })
    }); await p.waitForTimeout(300)
    await p.evaluate(() => {
      const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'ACG-02')
      const r = g.getBoundingClientRect(), d = document.createElement('div'); d.className = '__drawn'
      Object.assign(d.style, { position: 'fixed', left: (r.left - 5) + 'px', top: (r.top - 5) + 'px', width: (r.width + 10) + 'px', height: (r.height + 10) + 'px',
        border: '2px solid var(--accent, #3BC6E8)', borderRadius: '50%', zIndex: 9999, pointerEvents: 'none', boxSizing: 'border-box' })
      document.body.appendChild(d)
    })
    await w.mark('.__drawn', 1, 6)
    await w.note('Q2 — DRAWN IN (proposed): 1 the keyboard is here. Tab into the chart · → next along the line · ← back to what it needs · ↑ ↓ the event above / below · Enter opens marking with the keyboard in it · Esc back to this ball')
    await w.shot(`q2-proposed-${S}`); await w.clearMarks()
  }

  /* Q3 — a squadron member on a course: his name on the Students card (where he stays today after a delete) */
  await w.view('info')
  await w.press('#addStu')
  await p.waitForSelector('#dlgList .dlg-item'); await w.press('#dlgList .dlg-item')
  if (await p.locator('#dlgOk').count()) await w.press('#dlgOk')
  await p.waitForTimeout(600)
  const linked = p.locator('.c-students .chip.linked').first()
  if (!(await linked.count())) throw new Error('Q3: no squadron member was added to the course')
  await linked.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(200)
  await p.evaluate(() => { const e = document.querySelector('.c-students .chip.linked'); e.id = '__q3chip' })
  await w.mark('#__q3chip', 1)
  await w.note('Q3 — today: 1 a squadron member on this course. After a Post out that deletes him, his name stays here as plain text, on every course')
  await w.shot(`q3-today-${S}`); await w.clearMarks()

  /* Q4 — the Currency & Flex bars: STUDENT A amber + green, STUDENT B red + red (dates set through the side panel's boxes) */
  const bars = async (student, syll, curr, tag) => {
    await p.selectOption('#activeSel', { label: student }); await p.waitForTimeout(500)
    await w.pickDate('#lastSyll', syll); await w.pickDate('#lastCurr', curr)
    await p.locator('.flexbar').first().evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(250)
    const card = await p.locator('.flexbar').first().evaluate(e => { const c = e.closest('.card'); c.id = '__q4card'; return [...c.querySelectorAll('.flexbar')].map(b => b.textContent) })
    console.log('  ', student, card.join(' | '))
    await w.mark('#__q4card', 1)
    await w.note(`Q4 — today, as built (${student}): white words on the coloured bars`)
    await w.shot(`q4-today-${tag}-${S}`); await w.clearMarks()
    /* DRAWN IN: dark words on every bar but the grey one */
    await p.evaluate(() => { for (const b of document.querySelectorAll('#__q4card .flexbar')) { const bg = getComputedStyle(b).backgroundColor; if (bg !== 'rgb(90, 97, 114)') { b.dataset.wasInk = b.style.color; b.style.color = 'var(--bg, #0b0d12)' } } })
    await w.mark('#__q4card', 1)
    await w.note(`Q4 — DRAWN IN (proposed, ${student}): dark words on green, amber and red; white stays on grey`)
    await w.shot(`q4-proposed-${tag}-${S}`); await w.clearMarks()
    await p.evaluate(() => { for (const b of document.querySelectorAll('#__q4card .flexbar')) if ('wasInk' in b.dataset) { b.style.color = b.dataset.wasInk; delete b.dataset.wasInk } })
  }
  await bars('STUDENT A', '2026-10-07', '2026-10-14', 'a')
  await bars('STUDENT B', '2026-09-27', '2026-10-07', 'b')
  await w.ctx.close()
}
console.log('errors:', errors.length ? errors.join(' | ') : 'none')
await browser.close()
