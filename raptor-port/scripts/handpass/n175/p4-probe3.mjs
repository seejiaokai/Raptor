// p4-probe3 - finding controls only (not a case): the Inputs calendar's day and "+ Note"; Leave War's Balances boxes.
import { mk, closeAll, FACT, signIn, go, wait, tpic, SZT, vis, hit } from './p4-lib.mjs'
const SZ = process.argv[2] || 'd', T = SZT(SZ)
const s = await mk(SZ); const { page } = s
const btns = () => page.evaluate(() => [...document.querySelectorAll('button, input, textarea, [contenteditable=true]')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.top > 60 }).map(e => (e.getAttribute('data-testid') || e.id || e.className.toString().slice(0, 20)) + ':' + e.tagName + ':' + (e.innerText || e.value || e.placeholder || '').replace(/\s+/g, ' ').trim().slice(0, 20)).slice(0, 50))
try {
  await signIn(s, 'ad', 'a'); await go(s, 'inputs'); await wait(s, 800)
  if (await vis(s, '#inCalBtn').count()) await hit(s, '#inCalBtn', 600)
  FACT('cal.isoAttrs', await page.evaluate(() => { const c = {}; for (const e of document.querySelectorAll('.page.on *')) for (const a of e.attributes) if (/^\d{4}-\d\d-\d\d$/.test(a.value)) { const key = e.tagName + '.' + String(e.className).split(' ')[0] + '[' + a.name + ']'; c[key] = (c[key] || 0) + 1 } return c }))
  const day = vis(s, '.page.on [data-iso], .page.on .ic-day, .page.on [data-day]').nth(10)
  FACT('cal.dayCount', await vis(s, '.page.on [data-iso], .page.on .ic-day, .page.on [data-day]').count())
  if (await day.count()) { FACT('cal.day', await day.evaluate(e => e.outerHTML.slice(0, 200))); await hit(s, day, 700); FACT('cal.afterDay', await btns()); await tpic(s, `probe3-${T}-calday`) }
  const nb = vis(s, 'button').filter({ hasText: /\+ ?Note/ })
  if (await nb.count()) { await hit(s, nb.first(), 600); FACT('cal.afterNote', await btns()); await tpic(s, `probe3-${T}-note`) } else FACT('cal.note', 'no + Note')
  await page.keyboard.press('Escape')
  await go(s, 'leavewar'); await wait(s, 1200); await hit(s, '[data-testid="lw-tab-balances"]', 900)
  FACT('bal', await page.evaluate(() => [...document.querySelectorAll('.page.on input')].filter(e => e.getBoundingClientRect().width > 0).slice(0, 6).map(e => (e.getAttribute('data-testid') || e.id || e.className) + ':' + e.type + ':' + e.value + ':' + (e.getAttribute('aria-label') || ''))))
  await tpic(s, `probe3-${T}-bal`)
} catch (e) { FACT('error', String(e).split('\n')[0]) } finally { await closeAll() }
