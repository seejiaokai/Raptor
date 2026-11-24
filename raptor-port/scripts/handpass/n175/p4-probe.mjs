// p4-probe - finding controls only (not a case). node raptor-port/scripts/handpass/n175/p4-probe.mjs <d|402x874> <what>
import { mk, closeAll, FACT, signIn, barSq, pageOn, go, reachPick, wait, vis, hit, undoBtns, tpic, SZT, boxOf, covered } from './p4-lib.mjs'
const SZ = process.argv[2] || 'd', WHAT = process.argv[3] || 'undo', T = SZT(SZ)
const s = await mk(SZ); const { page } = s
try {
  await signIn(s, 'ad', 'a')
  if (WHAT === 'undo') {
    FACT('undo.start', await undoBtns(s))
    await go(s, 'admin'); await wait(s, 800)
    FACT('admin.cats', await page.evaluate(() => [...document.querySelectorAll('#page-admin button.adm-cat')].map(b => b.innerText.replace(/\s+/g, ' ').trim())))
    const sq = vis(s, '#page-admin button.adm-cat').filter({ hasText: /^Squadrons/ })
    if (await sq.count()) { await hit(s, sq.first(), 700); FACT('sq.text', (await page.locator('#page-admin').innerText()).replace(/\s+/g, ' ').slice(0, 600)); FACT('sqNew', await boxOf(s, '#sqNew')) }
    await tpic(s, `probe-${T}-admin-sq`)
    FACT('topbar', await page.evaluate(() => [...document.querySelectorAll('.topbar button, .topbar a')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.id || '') + ':' + (e.innerText || e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 20))))
  }
  if (WHAT === 'help') {
    await go(s, 'help'); await wait(s, 800)
    FACT('help', (await page.locator('.page.on').innerText()).replace(/\s+/g, ' ').slice(0, 800))
    FACT('help.boxes', await page.evaluate(() => [...document.querySelectorAll('.page.on textarea, .page.on input')].map(e => (e.id || e.className) + ':' + e.tagName + ':' + (e.placeholder || ''))))
    await tpic(s, `probe-${T}-help`)
  }
  if (WHAT === 'lw') {
    await go(s, 'leavewar'); await wait(s, 1500)
    FACT('lw.buttons', await page.evaluate(() => [...document.querySelectorAll('.page.on button')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.getAttribute('data-testid') || e.id || '') + ':' + e.innerText.replace(/\s+/g, ' ').trim().slice(0, 24)).slice(0, 60)))
    await tpic(s, `probe-${T}-lw`)
  }
  if (WHAT === 'cal') {
    await go(s, 'inputs'); await wait(s, 900)
    FACT('in.buttons', await page.evaluate(() => [...document.querySelectorAll('.page.on button')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.getAttribute('data-testid') || e.id || '') + ':' + e.innerText.replace(/\s+/g, ' ').trim().slice(0, 24)).slice(0, 60)))
    await tpic(s, `probe-${T}-inputs`)
  }
  if (WHAT === 'es') {
    await go(s, 'editsched'); await wait(s, 1200)
    FACT('es.pucks', await page.evaluate(() => { const c = {}; for (const e of document.querySelectorAll('.page.on [draggable], .page.on .puck, .page.on [class*=puck]')) { const k = e.tagName + '.' + String(e.className).split(/\s+/).slice(0, 2).join('.'); c[k] = (c[k] || 0) + 1 } return c }))
    FACT('es.notes', await page.evaluate(() => [...document.querySelectorAll('.page.on .ah-note')].length))
    await tpic(s, `probe-${T}-es`)
  }
} catch (e) { FACT('error', String(e).split('\n')[0].slice(0, 200)) } finally { await closeAll() }
