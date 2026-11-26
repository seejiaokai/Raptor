// draw-s1-lull - section 1, ledger row 1.28 (D2654 E4): the Tracker Info panel's two lull pop-ups PRESSED before the
// build - "+ Set lull period" (a calendar: the first day picked waits for the last) and "Copy to…" (a tick-list of
// students, waiting for its Copy). Each read: does it hold a choice not yet saved; is the squadron picker (or ☰) still
// pressable while it is up; at a narrower width (1000 wide, as k6) and on a phone, can it stand hidden behind the Flow
// chart tab. Only if a pick can be pressed while such a choice waits is the refusal drawn (the note naming the Info tab).
//   node raptor-port/scripts/handpass/n191/draw-s1-lull.mjs
import { mk, closeAll, FACT, wait, hit, vis, covered, boxOf, barSq, world, as, go, windowsNow, TMP1 } from './draw-s1-lib.mjs'
const tabs = s => s.page.evaluate(() => [...document.querySelectorAll('button[data-view]')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim() + (b.classList.contains('active') ? ' (showing)' : '')))
const seen = (s, sel) => s.page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return 'not in the page'; const b = e.getBoundingClientRect(); for (let p = e; p; p = p.parentElement) { const c = getComputedStyle(p); if (c.display === 'none' || c.visibility === 'hidden') return 'in the page, hidden' } return b.width > 2 && b.right > 0 && b.left < innerWidth ? 'seen' : 'in the page, out of sight' }, sel)
async function read(s, k, what) {
  FACT(`${k}.${what}`, { squadron: await barSq(s), tabs: await tabs(s), picker: await covered(s, s.desk ? '#sqnMenuBtn' : '#burger'), badge: s.desk ? await covered(s, '#roleBadge') : null, bell: await covered(s, '#notifyBell'), cal: await seen(s, '#lullCal'), copy: await seen(s, '.lullcopy, #lullCopy, [id^="lullCopy"]'), shade: await boxOf(s, '.lullback'), step: await s.page.evaluate(() => document.querySelector('#lullStep')?.textContent.trim() ?? null) })
}
for (const sz of ['d', 'w1000', 'p']) {
  const s = await mk(sz === 'w1000' ? 'd' : sz, { storageState: await world() }); const k = `s1.lull.${sz}`
  try {
    if (sz === 'w1000') await s.page.setViewportSize({ width: 1000, height: 864 }), (s.W = 1000)
    await as(s, 'saber'); await go(s, 'tracker'); await s.page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await wait(s, 700)
    FACT(`${k}.start`, { tabs: await tabs(s) })
    const info = vis(s, 'button[data-view]').filter({ hasText: /Info/ }); if (await info.count()) await hit(s, info.first(), 600)
    FACT(`${k}.setLull`, await covered(s, '#setLullBtn'))
    if ((await covered(s, '#setLullBtn')) !== 'free') await vis(s, '#setLullBtn').first().scrollIntoViewIfNeeded().catch(() => {})
    await hit(s, '#setLullBtn', 600)
    await read(s, k, 'calOpen')
    const d = await s.page.evaluate(() => { const b = [...document.querySelectorAll('#lullCal .day:not(.out)')].find(e => e.getBoundingClientRect().width > 0 && e.textContent === '14'); if (b) { b.setAttribute('data-s1d', '1'); return b.dataset.iso } return null })
    if (d) await hit(s, '[data-s1d]', 500)
    await read(s, k, 'firstDayPicked')
    await s.page.screenshot({ path: `${TMP1}/lull-${sz}-cal.png` })
    /* the Flow chart tab, where one is drawn: can the pop-up be left behind it? */
    const flow = vis(s, 'button[data-view]').filter({ hasText: /Flow chart/ })
    if (await flow.count()) { FACT(`${k}.flowTab`, await covered(s, 'button[data-view]:not(.active)')); const c = await flow.first().evaluate(b => { const r = b.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h === b || b.contains(h) }); FACT(`${k}.flowTabPressable`, c); if (c) { await hit(s, flow.first(), 600); await read(s, k, 'afterFlowTab') } }
    await s.page.keyboard.press('Escape'); await wait(s, 400)
    /* "Copy to…" */
    if (await vis(s, 'button[data-view]').filter({ hasText: /Info/ }).count()) await hit(s, vis(s, 'button[data-view]').filter({ hasText: /Info/ }).first(), 500)
    const cp = vis(s, 'button').filter({ hasText: /Copy to…/ })
    FACT(`${k}.copyButton`, await cp.count())
    if (await cp.count()) {
      await hit(s, cp.first(), 600)
      const tick = await s.page.evaluate(() => { const w = [...document.querySelectorAll('input[type="checkbox"]')].filter(e => e.getBoundingClientRect().width > 0); const e = w[0]; if (e) { e.setAttribute('data-s1t', '1'); return { count: w.length, around: e.closest('div')?.parentElement?.innerText.replace(/\s+/g, ' ').trim().slice(0, 160) } } return null })
      FACT(`${k}.copyList`, tick)
      if (tick) await hit(s, '[data-s1t]', 400)
      await read(s, k, 'copyTicked')
      FACT(`${k}.copyWindows`, (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 100)))
      await s.page.screenshot({ path: `${TMP1}/lull-${sz}-copy.png` })
    }
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 300)) } finally { await s.ctx.close().catch(() => {}) }
}
await closeAll()
