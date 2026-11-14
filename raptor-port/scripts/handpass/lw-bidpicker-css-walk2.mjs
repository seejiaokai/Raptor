// Second part of the WALK of [LW-BIDPICKER-CSS-INSIDE] (14 Nov 26): the counter's full form (Rearrange -> a counter -> Edit counter…, and
// + Counter from Settings) and the armed "Delete — sure?" (the one-day window over a day holding an OIL award; the day's list).
// Run from raptor-port/ against the built bundle on PORT (default 4294):  node scripts/handpass/lw-bidpicker-css-walk2.mjs
// Pictures: docs/img/handpass/2026-11-14-bidpicker-css/walk/ as d2-NN-* (desktop) and p2-NN-* (phone); the log walk2-log.json beside them.
// Never clears the first part's pictures (only its own d2-/p2- files).
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

console.log('lw-bidpicker-css-walk2 v1')
const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(here, '../../docs/img/handpass/2026-11-14-bidpicker-css/walk')
const BASE = `http://localhost:${process.env.PORT || 4294}`
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
mkdirSync(OUT, { recursive: true })
for (const f of readdirSync(OUT)) if (/^(d2|p2)-.*\.png$/.test(f) || f === 'walk2-log.json') unlinkSync(path.join(OUT, f))
const T = id => `[data-testid="${id}"]`
const browser = await chromium.launch(launchOptions)
const LOG = [], ERR = []
const D = { grant: '2026-11-24', two: '2026-11-19' }

async function world(size) {
  const phone = size === 'phone'
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, userAgent: devices['iPhone 13'].userAgent }
    : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 })
  await ctx.clock.install({ time: new Date('2026-11-04T09:00:00+08:00') })
  const page = await ctx.newPage(); page.setDefaultTimeout(6000)
  const w = { ctx, page, phone, size, n: 0, pre: phone ? 'p2' : 'd2', errs: [] }
  page.on('pageerror', e => w.errs.push('pageerror: ' + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') w.errs.push('console: ' + m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) w.errs.push(`http ${r.status()} ${r.url().slice(0, 100)}`) })
  await page.goto(BASE + '/?fresh=1'); await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.addStyleTag({ content: '#toastEl, .toast { visibility: hidden !important; }' })
  await page.evaluate(() => window.go('leavewar')); await page.waitForSelector(T('row-stiff'), { state: 'attached' }); await page.waitForTimeout(700)
  return w
}
async function settle(w) {
  await w.page.waitForFunction(() => document.getAnimations().every(a => a.playState !== 'running' || a.effect?.getComputedTiming().iterations === Infinity), null, { timeout: 4000 }).catch(() => {})
  await w.page.waitForTimeout(250)
}
async function snap(w, label, quick = false) {
  if (!quick) await settle(w)
  w.n++; const name = `${w.pre}-${String(w.n).padStart(2, '0')}-${label}.png`
  await w.page.screenshot({ path: path.join(OUT, name) }); return name
}
const vis = (w, sel) => w.page.locator(sel).first().isVisible().catch(() => false)
async function tapEl(w, l) { await l.scrollIntoViewIfNeeded().catch(() => {}); await w.page.waitForTimeout(100); if (w.phone) await l.tap(); else await l.click(); }
async function press(w, sel, quick) {
  const l = w.page.locator(sel).first(); if (!(await l.count())) return false
  await tapEl(w, l)
  if (w.phone && quick) { await w.page.waitForTimeout(60); w.quick.push(await snap(w, quick + '-justtapped', true)) }
  await w.page.waitForTimeout(400); return true
}
async function cell(w, p, d) {
  const l = w.page.locator(T(`cell-${p}-${d}`)).first()
  await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await w.page.waitForTimeout(300)
  const b = await l.boundingBox()
  if (w.phone) await w.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await w.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  await w.page.waitForTimeout(600)
}
async function closeAll(w) {
  for (const id of ['cform-close', 'bid-cancel', 'daylist-close', 'sel-cancel']) if (await vis(w, T(id))) await press(w, T(id))
  await w.page.keyboard.press('Escape').catch(() => {}); await w.page.waitForTimeout(300)
}
async function unstyled(w, root) {
  return w.page.evaluate(r => { const out = []
    for (const e of document.querySelectorAll(`${r} button, ${r} input, ${r} textarea`)) { const b = e.getBoundingClientRect(); if (!b.width || !b.height) continue; const cs = getComputedStyle(e)
      if (/Times/i.test(cs.fontFamily)) out.push(`${e.tagName}[${e.dataset.testid || e.className}] Times`)
      else if (e.tagName === 'BUTTON' && cs.backgroundColor === 'rgb(239, 239, 239)') out.push(`BUTTON[${e.dataset.testid || e.className}] default grey`) }
    return out }, root)
}
async function step(w, name, label, fn, root = T('counter-form')) {
  let note = '', result = 'PASS'; w.quick = []
  try { note = (await fn()) || '' } catch (e) { result = 'NOT WALKED'; note = String(e.message || e).split('\n')[0].slice(0, 170) }
  const pics = [...w.quick, await snap(w, label)]
  if (result === 'PASS' && root && await vis(w, root)) {
    const un = await unstyled(w, root); if (un.length) { result = 'CHECK'; note += ` UNSTYLED: ${un.slice(0, 4).join('; ')}` }
    const bb = await w.page.locator(root).first().boundingBox(); const W = w.phone ? 402 : 1536, H = w.phone ? 874 : 864
    note += ` [${Math.round(bb.x)},${Math.round(bb.y)} ${Math.round(bb.width)}x${Math.round(bb.height)}${bb.x < -1 || bb.y < -1 || bb.x + bb.width > W + 1 || bb.y + bb.height > H + 1 ? ' PARTLY OFF SCREEN' : ''}]`
    if (/PARTLY OFF/.test(note)) result = 'CHECK'
  }
  LOG.push({ size: w.size, step: name, result, note, pics }); console.log(`${result} [${w.size}] ${name} — ${note} ${pics.join(' ')}`)
}
async function pressStep(w, name, label, id, extra) {
  await step(w, name, label, async () => { if (!await press(w, T(id), label)) throw new Error('no ' + id); return extra ? await extra() : '' })
}
async function openFormViaRearrange(w) {
  if (!await press(w, T('settings-open'))) throw new Error('no settings')
  const t = w.page.getByText(/Rearrange the grid/i).first(); await tapEl(w, t); await w.page.waitForTimeout(500)
  const r = w.page.getByText('IWSO', { exact: true }).first(); await tapEl(w, r); await w.page.waitForTimeout(500)
  if (!await press(w, T('counter-edit-open'))) throw new Error('no counter-edit-open')
  await w.page.waitForSelector(T('counter-form'))
}
const val = async (w, id) => w.page.locator(T(id)).first().evaluate(e => e.value ?? e.textContent).catch(() => '?')

async function walk(size) {
  let w = await world(size)
  /* (1a) the form reached from a counter's window in Rearrange */
  await step(w, '1 counter form via Rearrange > counter > Edit counter…', 'form-rest', async () => {
    await openFormViaRearrange(w); const ids = await w.page.evaluate(() => [...document.querySelectorAll('[data-testid="counter-form"] [data-testid]')].map(e => e.dataset.testid)); return 'ids: ' + ids.join(',') })
  await pressStep(w, '1 mode: Teams', 'mode-team', 'cform-mode-team')
  await pressStep(w, '1 mode: People', 'mode-people', 'cform-mode-people')
  await pressStep(w, '1 add a slot', 'slot-add', 'cform-slot-add')
  await pressStep(w, '1 show teams', 'show-teams', 'cform-show-teams')
  await pressStep(w, '1 show people', 'show-people', 'cform-show-people')
  await step(w, '1 amber box typed', 'amber', async () => { const a = w.page.locator(T('cform-amber')).first(); if (!(await a.count())) throw new Error('no cform-amber'); await a.click(); await w.page.keyboard.press('Control+A'); await w.page.keyboard.type('4'); return 'amber=' + await val(w, 'cform-amber') })
  await step(w, '1 red box typed', 'red', async () => { const a = w.page.locator(T('cform-red')).first(); if (!(await a.count())) throw new Error('no cform-red'); await a.click(); await w.page.keyboard.press('Control+A'); await w.page.keyboard.type('2'); return 'red=' + await val(w, 'cform-red') })
  await step(w, '1 an impossible amber (below red) shows its note', 'amber-bad', async () => { const a = w.page.locator(T('cform-amber')).first(); await a.click(); await w.page.keyboard.press('Control+A'); await w.page.keyboard.type('1'); await w.page.waitForTimeout(300); return 'amber=1 red=2; notes shown: ' + (await w.page.evaluate(() => [...document.querySelectorAll('[data-testid="counter-form"] [data-testid^="cform-"][data-testid$="bad"], [data-testid="counter-form"] .note')].map(e => e.textContent.trim().slice(0, 40)).join(' | '))) })
  await step(w, '1 amber put back to 4', 'amber-fixed', async () => { const a = w.page.locator(T('cform-amber')).first(); await a.click(); await w.page.keyboard.press('Control+A'); await w.page.keyboard.type('4'); return 'amber=' + await val(w, 'cform-amber') })
  await step(w, '1 preview / full / sans lines (read, no press)', 'form-lines', async () => 'present: ' + ['cform-preview', 'cform-full', 'cform-avail-note', 'cform-avail-sans', 'cform-pt-bad'].filter(i => true).map(async i => i).length + ' read; ' + (await w.page.evaluate(() => ['cform-preview', 'cform-full', 'cform-avail-note', 'cform-avail-sans'].map(i => `${i}:${!!document.querySelector(`[data-testid="${i}"]`)}`).join(' '))))
  await pressStep(w, '1 Save counter', 'save', 'cform-save', async () => '~form still open: ' + await vis(w, T('counter-form')))
  await step(w, '1 reopen; Delete counter asks', 'delete-ask', async () => {
    await closeAll(w); await w.page.waitForTimeout(300)
    if (!await vis(w, T('counter-form'))) { const r = w.page.getByText('IWSO', { exact: true }).first(); await tapEl(w, r); await w.page.waitForTimeout(500); if (!await press(w, T('counter-edit-open'))) throw new Error('no counter-edit-open (second)') ; await w.page.waitForSelector(T('counter-form')) }
    if (!await press(w, T('cform-delete'), 'delete')) throw new Error('no cform-delete'); return 'delete label/ask: ' + (await w.page.evaluate(() => { const b = document.querySelector('[data-testid="cform-delete"]'); const a = document.querySelector('[data-testid^="cform-delete-"], [data-testid*="ask"]'); return `${b?.textContent.trim()} / ${a?.textContent.trim().slice(0, 50) ?? 'no ask element'}` })) })
  await step(w, '1 Cancel the ask (Cancel button)', 'delete-cancel', async () => { if (!await press(w, T('cform-cancel'))) throw new Error('no cform-cancel'); return '~form open after Cancel: ' + await vis(w, T('counter-form')) })
  await closeAll(w); await w.ctx.close(); ERR.push(...w.errs.map(e => `${size}/1 ${e}`))

  /* (1b) + Counter from Settings: a new counter's form */
  w = await world(size)
  await step(w, '1b + Counter from Settings: a new counter form', 'newcounter', async () => {
    if (!await press(w, T('settings-open'))) throw new Error('no settings'); if (!await press(w, T('counter-add'), 'add')) throw new Error('no counter-add'); await w.page.waitForSelector(T('counter-form')); return 'opened' })
  await step(w, '1b name typed', 'newcounter-name', async () => { const n = w.page.locator(T('cform-name')).first(); await n.click(); await w.page.keyboard.type('Walk counter'); return 'name=' + await val(w, 'cform-name') })
  await pressStep(w, '1b mode: Teams', 'newcounter-team', 'cform-mode-team')
  await pressStep(w, '1b add a slot', 'newcounter-slot', 'cform-slot-add')
  await pressStep(w, '1b mode: People', 'newcounter-people', 'cform-mode-people')
  await step(w, '1b Save a new counter with nothing chosen', 'newcounter-save', async () => { if (!await press(w, T('cform-save'), 'save')) throw new Error('no save'); return '~form open after: ' + await vis(w, T('counter-form')) })
  await closeAll(w); ERR.push(...w.errs.map(e => `${size}/1b ${e}`)); await w.ctx.close()

  /* (2) the one-day window over a day holding an OIL award; the day's list's armed Delete */
  w = await world(size)
  await step(w, '2 Grant OIL on a free day (FO), reopen the day', 'award-day', async () => {
    await cell(w, 'razer', D.grant); if (!await press(w, T('bid-oil'))) throw new Error('no Grant OIL')
    const g = w.page.getByRole('button', { name: /^Give FO/ }).first(); if (!(await g.count())) throw new Error('no Give FO button'); await tapEl(w, g); await w.page.waitForTimeout(600)
    await closeAll(w); await cell(w, 'razer', D.grant)
    return 'window shown: ' + await vis(w, T('bid-picker')) + '; ids: ' + (await w.page.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] [data-testid]')].map(e => e.dataset.testid).filter(i => /clear|decide|doc|award|oil/.test(i)).join(','))) }, T('bid-picker'))
  await step(w, '2 Delete pressed once: armed', 'delete-armed', async () => {
    if (!await press(w, T('bid-clear'), 'delete')) throw new Error('no bid-clear on the award day'); const t = await w.page.locator(T('bid-clear')).first().innerText({ timeout: 2000 }).catch(() => '(gone)'); return 'label: ' + t.split(String.fromCharCode(10)).join(' / ') }, T('bid-picker'))
  await step(w, '2 day with two entries: the list, Delete once', 'daylist-delete', async () => {
    await closeAll(w)
    for (const [h, c] of [['am', 'LL'], ['pm', 'OL']]) { await cell(w, 'stiff', D.two); const s = w.page.locator(T('bid-approve-tick')).first(); if ((await s.getAttribute('aria-checked')) === 'true') await press(w, T('bid-approve-tick')); await press(w, T(`portion-${h}`)); await press(w, T(`bid-${c}`)); await closeAll(w) }
    await cell(w, 'stiff', D.two)
    const del = w.page.locator('.daylist .dchip.del').first(); if (!(await del.count())) throw new Error('no day-list Delete chip')
    await tapEl(w, del); await w.page.waitForTimeout(500)
    return 'chip text after one press: ' + (await del.innerText({ timeout: 1500 }).then(t => t.split(String.fromCharCode(10)).join(' / ')).catch(() => '(gone)')) + '; list still open: ' + await vis(w, '.daylist') }, '.daylist')
  await closeAll(w); ERR.push(...w.errs.map(e => `${size}/2 ${e}`)); await w.ctx.close()
}
for (const size of ['desk', 'phone']) await walk(size).catch(e => console.log('STOPPED', size, e.message))
await browser.close()
writeFileSync(path.join(OUT, 'walk2-log.json'), JSON.stringify({ log: LOG, errors: ERR }, null, 1))
console.log('ERRORS:', ERR.length ? '\n' + ERR.join('\n') : 'none')
console.log('pictures2:', readdirSync(OUT).filter(f => /^(d2|p2)-/.test(f)).length)
