// k0p-f-windows - Part 2 F: the five Leave War windows of the owner's question, each cropped to the window at 2x, its
// title (the header row at the window's top) ringed in teal, nothing else marked; desktop and phone.
// Set-up by Saber through the app's own controls (on top of THE WORLD): Leave War → Ranger's cell Mon 5 Jan 26 → "+OIL"
// → Reason, Days 1 → give (an OIL award for (2)); the "Bidding closed" chip → the window → December 2026's month button
// (so (3) shows a stretch open to him). Then Ranger (member) opens each window.
//   node raptor-port/scripts/handpass/n194/k0p-f-windows.mjs      (ONLY=d or ONLY=p)
import { writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { mk, signIn, go, FACT, closeAll, world, wait, ERRS, TMP, ring, unring, shot, boxOf, vis } from './k0p-lib.mjs'
console.log('k0p-f-windows v2')
const WF = resolve(TMP, 'state-f.json')
const T = id => `[data-testid="${id}"]`
async function tapCell(s, id, iso) {
  const c = s.page.locator(T(`cell-${id}-${iso}`)).first()
  if (!(await c.count())) { await hit(s, T(`month-${['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][+iso.slice(5, 7) - 1]}`)); await wait(s, 800) }
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await wait(s, 400)
  const at = await c.evaluate(e => { const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2; const h = document.elementFromPoint(x, y); return { x, y, ok: !!h && (h === e || e.contains(h)), over: h ? h.tagName + '.' + String(h.className).slice(0, 30) : 'nothing' } })
  if (!at.ok) return { covered: at.over }
  if (s.desk) await s.page.mouse.click(at.x, at.y); else await s.page.touchscreen.tap(at.x, at.y)
  await wait(s, 700)
  return sheetNow(s)
}
async function hit(s, sel, ms = 500) { const l = vis(s, sel).first(); await l.scrollIntoViewIfNeeded().catch(() => {}); if (s.desk) await l.click({ timeout: 8000 }); else await l.tap({ timeout: 8000 }); await wait(s, ms) }
const sheetNow = s => s.page.evaluate(() => [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => ({ testid: e.dataset.testid, label: e.getAttribute('aria-label'), head: e.querySelector('.bidsheet-hd')?.innerText.replace(/\s+/g, ' ').trim(), text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 300) })))
async function closeSheets(s) {
  for (let i = 0; i < 4; i++) {
    const x = s.page.locator('.bidsheet[role="dialog"] button.x:visible').last()
    if (await x.count()) { if (s.desk) await x.click().catch(() => {}); else await x.tap().catch(() => {}); await wait(s, 400); continue }
    break
  }
}
async function setup() {
  if (existsSync(WF) && !process.env.FRESH) return WF
  const s = await mk('d', { storageState: await world() })
  try {
    await signIn(s, 'saber'); await go(s, 'leavewar'); await wait(s, 1500)
    FACT('f.setup.cellTap', await tapCell(s, 'bane', '2026-01-05'))
    await hit(s, T('bid-oil'), 300)
    await s.page.fill(T('oil-why'), 'Weekend duty cover'); await s.page.fill(T('oil-days'), '1')
    await hit(s, T('oil-give'), 700)
    FACT('f.setup.awardErr', await s.page.locator(T('oil-err')).allInnerTexts().catch(() => []))
    await closeSheets(s)
    FACT('f.setup.cellAfter', await s.page.locator(T('cell-bane-2026-01-05')).first().innerText())
    await hit(s, T('open-chip'), 700)
    const m = s.page.locator(T('od-month-2026-12')); FACT('f.setup.decBefore', await m.getAttribute('data-state'))
    await m.click(); await wait(s, 600); FACT('f.setup.decAfter', await m.getAttribute('data-state'))
    await hit(s, T('open-dates-close'), 500)
    FACT('f.setup.chip', await s.page.locator(T('open-chip')).first().innerText())
    await wait(s, 600); writeFileSync(WF, JSON.stringify(await s.ctx.storageState()))
  } finally { await s.ctx.close() }
  return WF
}
/* one window: open it, find it and its header, ring the header, picture the whole screen and the window cut */
async function picture(s, key, open) {
  const r = await open(); FACT(`f.${key}.${s.sz}.opened`, r)
  const sh = await s.page.evaluate(() => { const e = [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(e => e.getBoundingClientRect().width > 0).pop(); if (!e) return null; e.setAttribute('data-k0pwin', '1'); const t = e.querySelector('.bidsheet-hd') || e.querySelector('.who')?.parentElement; if (t) t.setAttribute('data-k0ptitle', '1'); return { testid: e.dataset.testid, label: e.getAttribute('aria-label'), head: t ? t.innerText.replace(/\s+/g, ' ').trim() : null, visibleLabel: [...e.querySelectorAll('*')].some(x => x.children.length === 0 && x.getBoundingClientRect().width > 1 && x.textContent.trim().toLowerCase() === (e.getAttribute('aria-label') || '').toLowerCase()) } })
  FACT(`f.${key}.${s.sz}.window`, sh)
  if (!sh) { await s.page.screenshot({ path: `${TMP}/f-${key}-${s.sz}-nowindow.png` }); return }
  const win = await boxOf(s, '[data-k0pwin]'), title = await boxOf(s, '[data-k0ptitle]')
  FACT(`f.${key}.${s.sz}.boxes`, { win, title, screen: [s.W, s.H] })
  if (title) await ring(s, title, 'title')
  await shot(s, `f${key}-${s.sz}`, [win], 10)
  await unring(s)
  await closeSheets(s)
}
try {
  const st = await setup()
  for (const sz of ['d', 'p']) {
    if (process.env.ONLY && process.env.ONLY !== sz) continue
    const s = await mk(sz, { storageState: st })
    try {
      await signIn(s, 'ranger'); await go(s, 'leavewar'); await wait(s, 1500)
      FACT(`f.${sz}.chip`, await s.page.locator(T('open-chip')).first().innerText().catch(() => null))
      await picture(s, '1-inputs-leave', () => tapCell(s, process.env.F1P || 'casper', process.env.F1D || '2026-02-05'))
      await picture(s, '2-award', () => tapCell(s, 'bane', '2026-01-05'))
      await picture(s, '3-open-bidding', async () => { await hit(s, T('open-chip'), 800); return sheetNow(s) })
      await picture(s, '4-person-other', async () => { const p = s.page.locator(T('person-slipway')).first(); await p.evaluate(e => e.scrollIntoView({ block: 'center' })); await wait(s, 300); if (s.desk) await p.click(); else await p.tap(); await wait(s, 800); return sheetNow(s) })
      await picture(s, '5-oil-tracker', async () => { await hit(s, T('oil-tracker'), 1300); return sheetNow(s) })
      FACT(`f.${sz}.errs`, s.errs)
    } catch (e) { FACT(`f.${sz}.error`, String(e).slice(0, 300)); await s.page.screenshot({ path: `${TMP}/f-${sz}-error.png` }) } finally { await s.ctx.close() }
  }
} finally { FACT('errors', ERRS); await closeAll() }
