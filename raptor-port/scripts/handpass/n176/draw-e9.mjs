// draw-e9 - "+ Commitment" on a squadron with no SANS aircrew (his D2628 C3). Saber (master admin), 150 picked, Inputs →
// SANS, a day pressed: its panel's "+ Commitment" (the app's own button) greyed - the button's own greyed state - its
// reason W.noSansAircrew('150') as its hover text: the browser's own label, IMITATED for the picture (a screenshot holds
// none). Also e9t-d: today's panel on 150, the button as it is. A phone shows no hover text (FACT).
//   node raptor-port/scripts/handpass/n176/draw-e9.mjs
import { run, as, W, FACT, wait, vis, hit, reachPick, shot, box, words, closeAll, barSq } from './draw-lib.mjs'
import { go } from '../n175/p6-lib.mjs'
const ADD = '[data-testid="sd-add"]'
const addNow = s => s.page.evaluate(sel => { const b = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0); if (!b) return null; const r = b.getBoundingClientRect(); return { words: b.textContent, greyed: b.disabled, title: b.title || null, box: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) } } }, ADD)
try {
  await run('e9', 'd', async s => {
    await as(s, 'saber'); await reachPick(s, 150, 'bar'); await go(s, 'inputs'); await wait(s, 600)
    await hit(s, '#inSansMode', 700)
    const day = await s.page.evaluate(() => { const d = [...document.querySelectorAll('[data-testid^="sc-day-"]')].find(e => !e.classList.contains('is-out') && e.getBoundingClientRect().width > 0 && /2026-12-0[7-9]|2026-12-1/.test(e.dataset.icday)) || [...document.querySelectorAll('[data-testid^="sc-day-"]')].find(e => e.getBoundingClientRect().width > 0); return d?.dataset.icday })
    if (!/2026-12/.test(day || '')) { await hit(s, '[data-testid="sc-next"]', 500) }
    const iso = await s.page.evaluate(() => { const d = [...document.querySelectorAll('[data-testid^="sc-day-"]')].find(e => e.getBoundingClientRect().width > 0 && /2026-12-(0[7-9]|1\d)/.test(e.dataset.icday)) || [...document.querySelectorAll('[data-testid^="sc-day-"]')].find(e => e.getBoundingClientRect().width > 0); return d.dataset.icday })
    await hit(s, `[data-testid="sc-day-${iso}"]`, 800)
    const t = await addNow(s)
    FACT('e9.today', { squadron: await barSq(s), day: iso, panel: (await words(s, '.sansday, [data-testid="sansday"], .floatwin'))[0]?.slice(0, 300), add: t })
    if (!t) throw new Error('no + Commitment drawn')
    await shot(s, 'e9t-d-today', [t.box, await box(s, '.floatwin, .sansday, [data-testid="sansday"]')])
    await s.page.evaluate(([sel, why]) => { const b = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0); b.disabled = true; b.title = why; new MutationObserver(() => { if (!b.disabled) b.disabled = true; if (b.title !== why) b.title = why }).observe(b, { attributes: true }) }, [ADD, W.noSansAircrew('150')])
    await wait(s, 200)
    const a = await addNow(s); FACT('e9.drawn', a)
    await s.page.evaluate(([b, why]) => { const d = document.createElement('div'); d.id = 'n176tip'; d.textContent = why; Object.assign(d.style, { position: 'fixed', left: Math.min(b.x + 6, innerWidth - 260) + 'px', top: (b.y + b.h + 14) + 'px', zIndex: 2147483000, background: '#2b2b2b', color: '#f1f1f1', border: '1px solid #5f5f5f', borderRadius: '4px', padding: '4px 8px', font: '12px "Segoe UI", system-ui, sans-serif', whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(0,0,0,.4)' }); document.body.appendChild(d) }, [a.box, W.noSansAircrew('150')])
    FACT('e9.hoverText', { words: W.noSansAircrew('150'), imitated: 'the browser\'s own hover label, drawn by hand for this picture only', box: await box(s, '#n176tip') })
    FACT('e9.onAPhone', 'a greyed button shows no hover text on an iPhone: the button shows greyed and a tap does nothing; the reason is not seen')
    await shot(s, 'e9-d-greyed', [a.box, await box(s, '#n176tip'), await box(s, '.floatwin, .sansday, [data-testid="sansday"]')])
  })
} finally { await closeAll() }
