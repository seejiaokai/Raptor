// bell-a - case A's bell part: a bell line that would take him to another squadron, pressed with a window open.
// SET-UP, by presses, once (desktop): Saber gives Hunter Plan of 149 (Admin → Users) and files an input for Hunter on
// Tue 8 Dec 2026 on 142 - so Hunter's bell carries a 142 line ("You were added …"). The browser's storage after that
// set-up is copied into each fresh browser (Playwright's storage copy - the same saved data, no new app state invented).
// THEN, per window: Hunter signs in, picks 149, opens the window on 149's pages (typing where it has a box), and goes
// for the bell; where the bell is reachable, its list is opened and the 142 line pressed. What the screen shows is read.
//   node raptor-port/scripts/handpass/n166/bell-a.mjs <d|402x874>    (ONLY=none,input,...)
// Pictures: A-<d|p>-bell-<window>-*.png
import { chromium } from '@playwright/test'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { mk, closeAll, FACT, signIn, barSq, pageOn, go, pic, windowsNow, reachPick, wait, boxOf, covered, bands, SIZES, SZTAG } from './lib.mjs'
const SZ = process.argv[2] || 'd', T = SZTAG(SZ)
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const HERE = dirname(fileURLToPath(import.meta.url))
const TMP = resolve(HERE, '../../../.tmp/n166'); mkdirSync(TMP, { recursive: true })
const STATE = resolve(TMP, `bell-state-${T}.json`)
const WORDS = 'N166 bell words'
const vis = (s, sel) => s.page.locator(sel).filter({ visible: true })
async function hit(s, l, ms = 400) { l = typeof l === 'string' ? vis(s, l).first() : l; await l.scrollIntoViewIfNeeded().catch(() => {}); if (s.desk) await l.click({ timeout: 8000 }); else await l.tap({ timeout: 8000 }); await wait(s, ms) }
const lineBtn = (unitNum, v) => `[data-testid="acc-sq"] [aria-label="Access to ${unitNum}"] button[data-line="${v}"]`

async function setup() {
  const s = await mk('d'); const { page } = s
  await signIn(s, 'ad', 'a')
  /* Plan of 149 to Hunter: Admin → Users → his row → 149's Plan → Save */
  await go(s, 'admin'); await wait(s, 600)
  const r = page.locator('[data-person="prowler"] .acc-tap').first(); await r.scrollIntoViewIfNeeded(); await r.click(); await page.waitForSelector('[data-testid="acc-sq"]', { timeout: 8000 }); await wait(s, 300)
  const b = page.locator(lineBtn('149', 'plan')); if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click()
  await page.locator('#accEdSave').click(); await wait(s, 700)
  FACT(`A.${T}.bell.setup.planGiven`, await page.locator(lineBtn('149', 'plan')).getAttribute('aria-pressed').catch(() => 'row closed after Save'))
  /* an input for Hunter on 8 Dec 2026, filed by Saber on Inputs */
  await go(s, 'inputs'); await wait(s, 500)
  if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
  await hit(s, '#inNew', 600)
  const v = await page.evaluate(() => [...document.querySelector('#inpEditPerson').options].find(x => /Hunter/.test(x.textContent))?.value)
  await page.selectOption('#inpEditPerson', v)
  const day = () => page.locator('.floatwin.inpedwin button[aria-label^="Tue 8 Dec 2026"]').first()
  for (let i = 0; i < 12 && !(await day().count()); i++) await hit(s, page.locator('.floatwin.inpedwin button[aria-label="Next month"]').first(), 250)
  await hit(s, day()); await page.fill('#inpEditRmk', 'n166 for hunter'); await hit(s, '#inpEditSave', 500)
  for (let i = 0; i < 3; i++) {
    const nd = vis(s, 'button').filter({ hasText: /^No document$/ }); if (await nd.count()) await hit(s, nd.first())
    if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk')
  }
  FACT(`A.${T}.bell.setup.inputFiled`, !(await vis(s, '#inpEditRmk').count()))
  await wait(s, 800)
  writeFileSync(STATE, JSON.stringify(await s.ctx.storageState()))
  await s.ctx.close()
}
const browserP = chromium.launch()
async function fresh() {
  const S = SIZES[SZ]; const br = await browserP
  const opts = S.desk ? { viewport: { width: S.w, height: S.h }, deviceScaleFactor: 2 } : { viewport: { width: S.w, height: S.h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
  const ctx = await br.newContext({ ...opts, storageState: STATE })
  const page = await ctx.newPage()
  page.on('dialog', d => d.dismiss().catch(() => {}))
  return { ctx, page, sz: SZ, desk: S.desk, W: S.w, H: S.h }
}
const W = {
  none: { what: 'no window (the control case)', open: async () => {} },
  input: { what: 'Input window on 149\'s Inputs, words typed', open: async s => { await go(s, 'inputs'); await wait(s, 600); if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn'); if (!/All dates/.test((await s.page.locator('#inRangeBtn').first().textContent().catch(() => '')) || '')) { await hit(s, '#inRangeBtn'); if (await s.page.locator('#inRangeAll').count()) await hit(s, s.page.locator('#inRangeAll').first()); if (await vis(s, '#inRangeAll').count()) await hit(s, '#inRangeBtn') } const row = vis(s, '#inBody tr[data-iid], #inList [data-iid]').filter({ hasNotText: /Hunter/ }).first(); FACT('A.' + T + '.bell.input.row', (await row.innerText({ timeout: 5000 })).replace(/\s+/g, ' ').slice(0, 40)); const o = row.locator('[data-testid="in-open"]'); await hit(s, (await o.count()) ? o.first() : row, 700); const r = vis(s, '#inpEditRmk').first(); await r.click(); await s.page.keyboard.press('Control+a'); await s.page.keyboard.type(WORDS) }, typed: '#inpEditRmk' },
  changes: { what: 'Edit Schedule: Changes window', open: async s => { await go(s, 'editsched'); await hit(s, '#histBtn', 700) } },
  sansgear: { what: 'SANS calendar settings', open: async s => { await go(s, 'inputs'); await hit(s, '#inSansMode', 800); await hit(s, '[data-testid="sc-gear"]', 600) } },
  lwday: { what: 'Leave War: a day window (15 Dec)', open: async s => { await go(s, 'leavewar'); await s.page.waitForSelector('[data-testid="month-strip"]', { timeout: 15000 }); await wait(s, 400); if (await vis(s, '[data-testid="month-DEC"]').count()) await hit(s, '[data-testid="month-DEC"]', 600); const c = s.page.locator('[data-testid^="cell-"][data-testid$="-2026-12-15"]').first(); await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await wait(s, 250); if (s.desk) await c.click(); else await c.tap(); await wait(s, 700) } },
}
async function one(key) {
  const w = W[key], k = `A.${T}.bell.${key}`, P = `A-${T}-bell-${key}`
  const s = await fresh(); const { page } = s
  try {
    await signIn(s, 'ad2', 'a2')
    const p = await reachPick(s, 149, 'bar'); FACT(`${k}.setupPick149`, { pressed: !!p.pressed, squadron: await barSq(s) })
    try { await w.open(s) } catch (e) { FACT(`${k}.opened`, 'could not open by presses: ' + String(e).split('\n')[0].slice(0, 100)); return }
    FACT(`${k}.windowOpen`, (await windowsNow(s)).map(x => x.what))
    FACT(`${k}.bellCovered`, (await boxOf(s, '#notifyBell')) ? await covered(s, '#notifyBell') : 'not drawn')
    if ((await covered(s, '#notifyBell')) !== 'free') { await pic(s, `${P}-1-bell-covered`); return }
    const bb = await boxOf(s, '#notifyBell'); if (s.desk) await page.mouse.click(bb.x + bb.w / 2, bb.y + bb.h / 2); else await page.touchscreen.tap(bb.x + bb.w / 2, bb.y + bb.h / 2); await wait(s, 600)
    const lines = await page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].filter(l => l.getBoundingClientRect().height > 0).map(l => l.textContent.replace(/\s+/g, ' ').trim().slice(0, 100)))
    FACT(`${k}.bellLines`, lines)
    const line = page.locator('[data-testid="bell-list"] .bl-line').filter({ hasText: /8 Dec/ }).first()
    if (!(await line.count())) { FACT(`${k}.line`, 'no 8 Dec line'); await pic(s, `${P}-1-no-line`); return }
    await line.evaluate(e => e.setAttribute('data-n166line', '1'))
    FACT(`${k}.lineCovered`, await covered(s, '[data-n166line]'))
    await pic(s, `${P}-1-bell-open`)
    if ((await covered(s, '[data-n166line]')) !== 'free') return
    const lb = await boxOf(s, '[data-n166line]'); if (s.desk) await page.mouse.click(lb.x + lb.w / 2, lb.y + lb.h / 2); else await page.touchscreen.tap(lb.x + lb.w / 2, lb.y + lb.h / 2); await wait(s, 1000)
    const q = await page.evaluate(() => { const m = document.querySelector('#dlgMsg'); return m && m.getBoundingClientRect().width > 0 ? m.textContent.trim() : null })
    FACT(`${k}.afterLine`, { squadron: await barSq(s), page: await pageOn(s), question: q, bands: await bands(s) })
    FACT(`${k}.afterLine.windows`, (await windowsNow(s)).map(x => ({ what: x.what, words: x.words.slice(0, 120), inert: x.inert })))
    if (w.typed) FACT(`${k}.afterLine.typedWordsAnywhere`, await page.evaluate(t => [...document.querySelectorAll('textarea, input')].some(e => e.value === t), WORDS))
    await pic(s, `${P}-2-after-line`)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 160)) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('bell-a v1', SZ)
  await setup()
  for (const key of (ONLY.length ? ONLY : Object.keys(W))) { FACT(`A.${T}.bell.${key}.window`, W[key].what); await one(key) }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll(); await (await browserP).close() }
