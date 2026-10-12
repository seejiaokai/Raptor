// THROWAWAY COMPS for his question of 11 Oct 26 (`[ALL-AVAIL-AS-MEMBER]`) — the two ways that are NOT built, drawn on the
// real screens with the app's own stylesheet (the page's DOM is edited after it has rendered; nothing of the app is
// changed): (B) the filer's OIL question with a "who earns it" row; (C) one man's window with no answer of his own.
// The built way (A) is scripts/handpass/oilown-look.mjs.
//
//   LOOK_URL=http://localhost:4180/ node scripts/handpass/oilown-comps.mjs
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { launch, open, openDay, press, csId, WIN, DAYWIN, signOut, signIn } from './icard-A-lib.mjs'

const OUT = 'docs/mock/img/one-rule-oil'
mkdirSync(OUT, { recursive: true })
const PHONE = { width: 390, height: 844 }
const DAY = '2026-10-17'
const snap = (p, name) => p.screenshot({ path: join(OUT, name + '.png') }).then(() => console.log('shot', name))
const T = true

const browser = await launch()
const { page: p } = await open(browser, PHONE, 'ad', 'a', true)
try {
  const three = ['Ranger', 'Drifter', 'Ace']
  await openDay(p, DAY, T)
  await press(T, p.locator('#icPopAdd')); await p.locator(WIN).waitFor()
  await p.selectOption('#inpEditType', 'Training')
  await press(T, p.locator(`${WIN} [data-testid="pp-several"]`))
  for (const cs of three) { const b = p.locator(`${WIN} [data-pp="${await csId(p, cs)}"]`); await b.scrollIntoViewIfNeeded().catch(() => {}); if ((await b.getAttribute('aria-pressed')) !== 'true') await press(T, b) }
  await p.fill('#inpEditStart', '09:00').catch(() => {}); await p.fill('#inpEditEnd', '12:00').catch(() => {})
  await press(T, p.locator('#inpEditSave'))
  const sheet = p.locator('[data-testid="oilconf"]')
  await sheet.waitFor({ timeout: 4000 })
  await press(T, sheet.locator('[data-testid="oil-yes"]'))
  await p.waitForTimeout(200)

  // (B) the filer chooses who earns it — a row of the input's people under the answer
  const ids = []
  for (const cs of ['Ace', 'Drifter', 'Ranger', 'Saber']) ids.push(await csId(p, cs))
  await p.evaluate(({ ids, off }) => {
    const body = document.querySelector('[data-testid="oilconf"] .upconf-body')
    const after = body.querySelector('.upconf-left')
    const h = document.createElement('div'); h.className = 'upconf-h'; h.style.marginTop = '16px'; h.textContent = 'Who earns it — tap a name to leave someone out'
    const row = document.createElement('div'); row.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 2px'
    for (const id of ids) {
      const src = document.querySelector(`[data-testid="win-inputedit"] [data-pp="${id}"]`)
      if (!src) continue
      const c = src.cloneNode(true); c.removeAttribute('data-pp'); c.style.minWidth = '74px'
      if (id === off) { c.style.opacity = '.38'; c.style.textDecoration = 'line-through'; c.setAttribute('aria-pressed', 'false') }
      row.appendChild(c)
    }
    const n = document.createElement('div'); n.className = 'oilconf-count'; n.textContent = '3 of 4 earn HO — Ranger: no'
    after.after(h, row, n)
    const hint = [...document.querySelectorAll('[data-testid="oilconf"] *')].find(e => e.childElementCount === 0 && /Choose an option above/.test(e.textContent || ''))
    if (hint) hint.textContent = ''
  }, { ids, off: ids[2] })
  await p.waitForTimeout(200)
  await snap(p, 'B-filer-picks-who')
  await p.evaluate(() => { const b = document.querySelector('[data-testid="oilconf"] .upconf-body'); for (const e of [...b.querySelectorAll('.upconf-h')].slice(1)) { e.nextElementSibling?.nextElementSibling?.remove(); e.nextElementSibling?.remove(); e.remove() } })
  await press(T, sheet.locator('[data-testid="oilconf-save"]'))
  await p.waitForTimeout(600)

  // (C) one man's window with ONE answer for the input — no line of his own
  if (await p.locator(DAYWIN).count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(200) }
  await signOut(p, T); await signIn(p, 'us', 'us')
  await openDay(p, DAY, T)
  await press(T, p.locator(`${DAYWIN} [data-popiid]`).first()); await p.locator(WIN).waitFor({ timeout: 4000 })
  await p.waitForTimeout(400)
  const own = p.locator(`${WIN} [data-testid="oil-revise-own"]`)
  await own.scrollIntoViewIfNeeded().catch(() => {})
  await p.evaluate(() => { for (const e of document.querySelectorAll('[data-testid="win-inputedit"] .inped-own .inped-oil')) e.remove() })
  await p.waitForTimeout(200)
  await snap(p, 'C-ranger-one-answer')
} catch (e) {
  console.log('STOPPED:', String(e).slice(0, 400))
  await snap(p, 'zz-stopped').catch(() => {})
} finally { await browser.close() }
