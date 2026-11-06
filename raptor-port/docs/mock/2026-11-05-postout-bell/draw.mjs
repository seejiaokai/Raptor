// [POSTOUT-RUN-NOTICE] (D1546, D1547) — the bell's line for a posting out that ran by itself on its date, DRAWN on the
// real frozen build; nothing here is built. At his PC's 1536 × 864 (Chromium) and his iPhone's 402 × 874 (WebKit, touch).
//   1. Today (5 Nov 26), through the app's own controls: four men posted out from Mon 16 Nov on the Leave War's one-day
//      sheet (⋯ → Post out), one per outcome — Overseas Sqn (archived), Delete, SANS, and no chip (off the manpower).
//   2. The browser's clock moved to Mon 16 Nov 08:00 and the app opened again: the postings run by themselves on
//      their date, as they do for him (leavewar/sync.ts runPoOutcomes). The bell is opened: TODAY — nothing about them.
//   3. PROPOSED — four lines CLONED from the bell's own markup (topbits.tsx: button.bl-line > .bl-dot, .bl-main >
//      .bl-t > b.bl-name + i.bl-day, .bl-what; .bl-ago), unread like every new line, the bell lit; marked NEW on the element.
//   4. The tap's landing: Admin → Users at his row, wearing the app's one just-added mark (the plain blue ring, inset 2px
//      #1E86FF — 06-inputs.css inflash, D860); an archived man's row inside the "▸ Archived" fold, opened.
// Usage (from raptor-port/): WALK_DIR=<frozen dist> node docs/mock/2026-11-05-postout-bell/draw.mjs
import { chromium, webkit } from '@playwright/test'
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { serveFrozen } from '../../../scripts/handpass/isr-serve.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, 'img'); mkdirSync(OUT, { recursive: true })
const URL = 'http://localhost:4391/'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ISO = '2026-11-16', DAYWORDS = 'Mon 16 Nov'
const RUN_AT = new Date('2026-11-16T08:00:00')
const SIZES = {
  desk: { engine: chromium, opts: { viewport: { width: 1536, height: 864 } }, tap: false },
  phone: { engine: webkit, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true }, tap: true },
}
const log = [], errs = []
const say = l => { log.push(l); console.log(l) }

const MARK = `.pb-new{outline:3px solid #ff3b6b !important;outline-offset:-3px;position:relative}
.pb-new::before{content:attr(data-pb);position:absolute;right:6px;bottom:4px;z-index:99;background:#ff3b6b;color:#fff;
  font:700 10px/1 system-ui,sans-serif;padding:3px 5px;border-radius:4px;white-space:nowrap;letter-spacing:.02em}
.pb-today{outline:3px dashed #ff3b6b !important;outline-offset:2px;overflow:visible !important}
.pb-today::after{content:attr(data-pb);position:absolute;left:8px;bottom:-24px;z-index:99;background:#ff3b6b;color:#fff;
  font:700 11px/1 system-ui,sans-serif;padding:4px 6px;border-radius:4px;white-space:nowrap}
.pb-land{box-shadow:inset 0 0 0 2px #1E86FF !important}`

async function open(size, state) {
  const s = SIZES[size]
  const b = await s.engine.launch()
  const ctx = await b.newContext({ ...s.opts, deviceScaleFactor: 2, ...(state ? { storageState: state } : {}) })
  await serveFrozen(ctx, URL)
  const page = await ctx.newPage()
  if (state) await page.clock.install({ time: RUN_AT })
  page.on('pageerror', e => errs.push(`[${size}] page error ${e.message}`))
  page.on('dialog', d => d.dismiss().catch(() => {}))
  await page.goto(URL)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}' })
  await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await sleep(800)
  return { b, ctx, page, tap: s.tap }
}
const go = async (page, p) => { await page.evaluate(p => window.go(p), p); await page.waitForFunction(p => window.CURPAGE === p, p); await sleep(500) }
async function press(page, tap, sel) {
  const l = page.locator(sel).filter({ visible: true }).last()
  if (!(await l.count())) throw new Error('premise: nothing to press — ' + sel)
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (tap) await l.tap(); else await l.click()
  await sleep(tap ? 650 : 300)
}
const sheet = '.bidsheet[role="dialog"]'
async function closeSheets(page) {
  for (let i = 0; i < 4; i++) { const x = page.locator(`${sheet} button.x:visible`).last(); if (!(await x.count())) break; await x.click().catch(() => {}); await sleep(350) }
}
async function lwOpen(page) {
  await go(page, 'leavewar')
  await page.waitForSelector('[data-testid^="row-"]', { timeout: 20000 }); await sleep(500)
  const bar = page.locator('[data-testid="figures-toggle"]')
  if ((await bar.count()) && (await bar.getAttribute('aria-expanded')) === 'true') { await bar.click(); await sleep(300) }
  const m = page.locator('[data-testid="month-NOV"]:visible').first()
  if (await m.count()) { await m.click(); await sleep(900) }
}
async function tapCell(page, tap, id) {
  const c = page.locator(`[data-testid="cell-${id}-${ISO}"]`).first()
  if (!(await c.count())) throw new Error(`premise: no box for ${id} on ${ISO}`)
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  const at = await c.evaluate(e => { const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2; const h = document.elementFromPoint(x, y); return { x, y, ok: !!h && (h === e || e.contains(h)) } })
  if (!at.ok) throw new Error(`premise: ${id} ${ISO} is covered`)
  if (tap) await page.touchscreen.tap(at.x, at.y); else await page.mouse.click(at.x, at.y)
  await sleep(700)
}
/* one man posted out through the one-day sheet; returns the sheet's own line for the outcome ("On 16 Nov: …") */
async function postOut(page, tap, id, outcome) {
  await tapCell(page, tap, id)
  await press(page, tap, `${sheet} [data-testid="bid-more"]`)
  await press(page, tap, '[data-testid="bid-postout"]')
  if (outcome === 'none') await press(page, tap, `${sheet} [data-testid="po-overseas"]`)          // the lit default, off
  else if (outcome !== 'overseas') await press(page, tap, `${sheet} [data-testid="po-${outcome}"]`)
  const line = await page.evaluate(() => { const e = [...document.querySelectorAll('.bidsheet .note')].find(x => x.getBoundingClientRect().height > 0 && /^On /.test(x.textContent.trim())); return e ? e.textContent.trim() : '' })
  await press(page, tap, `${sheet} [data-testid="po-confirm"]`)
  if (outcome === 'delete') await press(page, tap, '[data-testid="po-delete-go"]')   // the card's Delete (D1628)
  await sleep(600); await closeSheets(page)
  return line
}
async function openBell(page, tap) {
  const b = page.locator('.bellbtn').filter({ visible: true }).first()
  if (tap) await b.tap(); else await b.click()
  await page.waitForSelector('[data-testid="bell-list"]'); await sleep(400)
}
async function neutral(page, tap) {
  await page.evaluate(() => { const a = document.activeElement; if (a && a !== document.body) a.blur() })
  if (!tap) await page.mouse.move(2, 400)
  await sleep(150)
}
const shot = (page, name) => page.screenshot({ path: join(OUT, name + '.png') })

/* the four men and the line each will read — the outcome's own words in the past (the sheet's line, outcomewords.ts) */
const WORDS = {
  overseas: acct => acct ? 'archived, account suspended' : 'archived',
  delete: acct => acct ? 'deleted, with his account' : 'deleted',
  sans: () => 'now SANS',
  none: () => 'off the manpower',
}

const report = {}
for (const size of ['desk', 'phone']) {
  /* ---- 1. today, 5 Nov: the four postings set for Mon 16 Nov ---- */
  let { b, ctx, page, tap } = await open(size)
  const men = await page.evaluate(() => {
    const P = window.PEOPLE
    const free = Object.keys(P).filter(id => !P[id].special && !P[id].pers && !P[id].archived && !P[id].san && !P[id].deleted && document.querySelector(`[data-testid="row-${id}"]`) === null)
    return { all: Object.keys(P).filter(id => !P[id].special && !P[id].archived && !P[id].san && !P[id].deleted && !P[id].pers), cs: Object.fromEntries(Object.keys(P).map(id => [id, P[id].cs])) }
  })
  await lwOpen(page)
  const onGrid = new Set(await page.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(r => r.getAttribute('data-testid').slice(4))))
  /* Ranger (bane) holds a sign-in (us/us), so his line shows the account half; the other three have none */
  const pick = ['bane', ...men.all.filter(id => id !== 'bane' && id !== 'stiff' && onGrid.has(id)).slice(6, 9)]
  const plan = [['overseas', pick[0]], ['delete', pick[1]], ['sans', pick[2]], ['none', pick[3]]]
  const lines = []
  for (const [outcome, id] of plan) {
    const sheetLine = await postOut(page, tap, id, outcome)
    const acct = /account/.test(sheetLine)
    lines.push({ outcome, id, cs: men.cs[id], sheetLine, what: `${men.cs[id]} · ${WORDS[outcome](acct)}` })
    say(`[${size}] posted out ${men.cs[id]} (${id}) — ${outcome} — the sheet said "${sheetLine}"`)
  }
  const pending = await page.evaluate(() => Object.keys(window.LW_STATE ? window.LW_STATE.postOuts || {} : {}))
  const state = await ctx.storageState()
  await b.close()

  /* ---- 2. Mon 16 Nov 08:00: the app opened again — the postings run by themselves ---- */
  ;({ b, ctx, page, tap } = await open(size, state))
  await sleep(1500)
  const ran = await page.evaluate(ids => ids.map(id => { const p = window.PEOPLE[id]; return p ? { id, archived: !!p.archived, san: !!p.san, deleted: !!p.deleted } : { id, gone: true } }), pick)
  say(`[${size}] after the clock moved to ${RUN_AT.toISOString()}: ${JSON.stringify(ran)}`)
  await page.addStyleTag({ content: MARK })
  await openBell(page, tap)
  const todayLines = await page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].map(l => l.textContent.replace(/\s+/g, ' ').trim()))
  say(`[${size}] the bell today: ${JSON.stringify(todayLines)}`)
  await page.evaluate(() => { const l = document.querySelector('[data-testid="bell-list"]'); l.classList.add('pb-today'); l.dataset.pb = 'TODAY: four men posted out this morning — the bell says nothing' })
  await neutral(page, tap)
  await shot(page, `1-bell-today-${size}`)
  await page.evaluate(() => { const l = document.querySelector('[data-testid="bell-list"]'); l.classList.remove('pb-today') })

  /* ---- 3. proposed: the four lines, cloned from the bell's own markup ---- */
  const drawn = await page.evaluate(([lines, day]) => {
    const list = document.querySelector('[data-testid="bell-list"] .bl-scroll')
    const model = list.querySelector('.bl-line')
    const empty = list.querySelector('.bl-empty'); if (empty) empty.remove()
    const made = []
    for (const L of [...lines].reverse()) {
      let n
      if (model) { n = model.cloneNode(true) } else {
        n = document.createElement('button'); n.type = 'button'; n.setAttribute('role', 'menuitem')
        n.innerHTML = '<span class="bl-dot" aria-hidden="true"></span><span class="bl-main"><span class="bl-t"><b class="bl-name"></b><i class="bl-day"></i></span><span class="bl-what"></span></span><span class="bl-ago"></span>'
      }
      n.className = 'bl-line unread pb-new'; n.dataset.pb = 'NEW'
      n.removeAttribute('data-testid'); n.dataset.pbLine = L.outcome
      n.querySelector('.bl-name').textContent = 'Posting out'
      n.querySelector('.bl-day').textContent = day
      n.querySelector('.bl-what').textContent = L.what
      n.querySelector('.bl-ago').textContent = '2 h'
      list.prepend(n); made.push(n.textContent.replace(/\s+/g, ' ').trim())
    }
    const bell = [...document.querySelectorAll('.bellbtn')].find(x => x.offsetParent !== null)
    if (bell) bell.classList.add('on')
    return { cloned: !!model, made }
  }, [lines, DAYWORDS])
  say(`[${size}] drawn (cloned from a real line: ${drawn.cloned}): ${JSON.stringify(drawn.made)}`)
  /* the measure: does each line stay one line for its words (the longest: an archived man with an account) */
  const fit = await page.evaluate(() => [...document.querySelectorAll('.bl-line.pb-new')].map(n => { const w = n.querySelector('.bl-what'); return { line: n.dataset.pbLine, h: Math.round(n.getBoundingClientRect().height), whatH: Math.round(w.getBoundingClientRect().height), whatOverflow: w.scrollWidth > w.clientWidth + 1 } }))
  say(`[${size}] line heights: ${JSON.stringify(fit)}`)
  await neutral(page, tap)
  await shot(page, `2-bell-proposed-${size}`)
  const close = await page.locator('[data-testid="bell-list"]').boundingBox()
  if (close && size === 'desk') await page.screenshot({ path: join(OUT, `2-bell-proposed-${size}-close.png`), clip: { x: Math.max(0, close.x - 20), y: Math.max(0, close.y - 60), width: Math.min(1536 - Math.max(0, close.x - 20), close.width + 40), height: close.height + 80 } })

  /* ---- 3b. the other order: the man first, in bold, as an input's line puts the input first (D769) ---- */
  await page.evaluate(([lines, day]) => {
    for (const L of lines) {
      const n = document.querySelector(`.bl-line[data-pb-line="${L.outcome}"]`)
      n.querySelector('.bl-name').textContent = L.cs
      n.querySelector('.bl-what').textContent = 'Posted out · ' + L.what.slice(L.cs.length + 3)
      n.dataset.pb = 'NEW · B'
    }
  }, [lines, DAYWORDS])
  await neutral(page, tap)
  await shot(page, `2b-bell-manfirst-${size}`)
  if (close && size === 'desk') await page.screenshot({ path: join(OUT, `2b-bell-manfirst-${size}-close.png`), clip: { x: Math.max(0, close.x - 20), y: Math.max(0, close.y - 60), width: Math.min(1536 - Math.max(0, close.x - 20), close.width + 40), height: close.height + 80 } })

  /* ---- 4. the tap's landing: Admin → Users at his row ---- */
  const bellBtn = page.locator('.bellbtn').filter({ visible: true }).first()
  if (tap) await bellBtn.tap(); else await bellBtn.click()       // the bell closes its list
  await sleep(300)
  await go(page, 'admin')
  const users = page.locator('.adm-cat').filter({ hasText: 'Users' }).first()
  if (await users.count()) { if (tap) await users.tap(); else await users.click(); await sleep(600) }
  for (const L of lines) {
    if (L.outcome === 'delete') {
      const has = await page.evaluate(id => !!document.querySelector(`.acc-row[data-person="${id}"]`), L.id)
      say(`[${size}] a deleted man's row on Admin → Users: ${has ? 'there' : 'none — nowhere to land'}`)
      continue
    }
    if (L.outcome === 'none') continue
    if (L.outcome === 'overseas') {
      const t = page.locator('#accArchToggle')
      if ((await t.count()) && (await t.getAttribute('aria-expanded')) !== 'true') { if (tap) await t.tap(); else await t.click(); await sleep(500) }
    }
    const ok = await page.evaluate(id => {
      document.querySelectorAll('.pb-land').forEach(e => e.classList.remove('pb-land'))
      const r = [...document.querySelectorAll(`.acc-row[data-person="${id}"]`)].find(x => x.getBoundingClientRect().height > 0)
      if (!r) return null
      r.scrollIntoView({ block: 'center' }); r.classList.add('pb-land')
      return r.textContent.replace(/\s+/g, ' ').trim().slice(0, 140)
    }, L.id)
    say(`[${size}] landing on ${L.cs} (${L.outcome}): ${ok ? 'his row — "' + ok + '"' : 'NOT FOUND'}`)
    await neutral(page, tap)
    await shot(page, `3-land-${L.outcome}-${size}`)
  }
  report[size] = { lines, todayLines, ran, fit, pending }
  await b.close()
}
writeFileSync(join(HERE, 'draw-log.json'), JSON.stringify({ log, errs, report }, null, 2))
say(`errors: ${errs.length ? errs.join(' | ') : 'none'}`)
