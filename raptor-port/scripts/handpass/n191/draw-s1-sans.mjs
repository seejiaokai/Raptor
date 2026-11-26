// draw-s1-sans - section 1, ledger row 1.22: a drag across days on the SANS calendar of a squadron with no SANS aircrew
// (his D2628 C3, D2655 D11; the plan §18.7: "the calendar's other roads to the same window - a drag across days - say that
// reason and opens nothing"). HOW it says it was never drawn. Drawn here on the app's own precedent: a drag the calendar
// refuses is told by the app's own passing note, 'warn' kind (ui/sansadd.ts openSansAdd - a SANS man whose SANS starts
// after the whole run he dragged is told why, never met with nothing, chat 152's W8-1), so the built drag says
// "150 has no SANS aircrew." the same way, at the note's own place, and no window opens. The words are the button's own
// reason, reviewed in round 5 (S1.noSans) - nothing new to read.
// Saber (master admin, home 142), 150 picked (no SANS aircrew in n176's world), Inputs → SANS. A drag exists on both sizes
// (a mouse drag; a finger held, then dragged - ui/SansCal.tsx). The drag itself is not made (today it would open the
// window): the month as it stands after the release, the note raised by the app's own toast(…, 'warn'), not moved.
//  sans-drag-d / sans-drag-p
//   node raptor-port/scripts/handpass/n191/draw-s1-sans.mjs
import { mk, closeAll, FACT, wait, hit, reachPick, barSq, world, want, as, boxOf, tring, sshot, TMP1, windowsNow } from './draw-s1-lib.mjs'
import { go } from '../n175/p6-lib.mjs'
import { S1 } from './words-s1.mjs'
for (const sz of ['d', 'p']) if (want(`sans-drag-${sz}`)) {
  const s = await mk(sz, { storageState: await world() })
  const k = `s1.sansDrag.${sz}`
  try {
    await as(s, 'saber'); await reachPick(s, 150, s.desk ? 'bar' : 'menu'); await wait(s, 600)
    await go(s, 'inputs'); await wait(s, 600)
    await hit(s, '#inSansMode', 800)
    FACT(`${k}.state`, { squadron: await barSq(s), month: await s.page.evaluate(() => document.querySelector('[data-testid="sc-month"], .sc-month, .sc-title')?.textContent.trim() ?? null), windows: (await windowsNow(s)).map(w => w.what) })
    const text = S1.noSans('150')
    await s.page.evaluate(t => window.toast(t, 'warn'), text); await wait(s, 450)
    await s.page.evaluate(() => { const t = document.querySelector('#toastEl'); t.getAnimations?.().forEach(a => a.cancel()); t.style.opacity = '1'; new MutationObserver(() => { if (t.style.opacity !== '1') t.style.opacity = '1' }).observe(t, { attributes: true, attributeFilter: ['style'] }) })
    await wait(s, 200)
    const nb = await s.page.evaluate(() => { const t = document.querySelector('#toastEl'), b = t.getBoundingClientRect(); return { words: t.textContent.replace(/\s+/g, ' ').trim(), at: t.dataset.at || null, box: { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) } } })
    FACT(`${k}.note`, nb); FACT(`${k}.windowsAfter`, (await windowsNow(s)).map(w => w.what))
    const ring = (await tring(s, nb.box, 'the note')).ring
    const cal = await boxOf(s, '[data-testid="sanscal"], .sancal, .sc-grid, #page-inputs .page-body, #page-inputs')
    FACT(`${k}.calBox`, cal)
    await sshot(s, `sans-drag-${sz}`, s.desk ? [ring, { x: ring.x - 300, y: ring.y - 260, w: ring.w + 600, h: 260 }] : [ring, { x: 0, y: ring.y - 360, w: s.W, h: 360 }], 8)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 300)); process.exitCode = 1; await s.page.screenshot({ path: `${TMP1}/sans-drag-${sz}-error.png` }).catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
}
await closeAll()
