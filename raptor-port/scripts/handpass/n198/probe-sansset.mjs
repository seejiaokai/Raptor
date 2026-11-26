// probe-sansset - chat 198: lists SANS calendar settings' number boxes and their labels, to find the late cut-off's.
import { mk, closeAll, FACT, signIn, go, wait, vis, hit } from './sansnote-lib.mjs'
const s = await mk('d')
try {
  await signIn(s, 'ad', 'a'); await go(s, 'inputs'); await wait(s, 700)
  const sm = vis(s, '#inSansMode'); if (await sm.count()) await hit(s, sm.first(), 900)
  await hit(s, '[data-testid="sc-gear"]', 700)
  FACT('inputs', await s.page.evaluate(() => [...document.querySelectorAll('[data-testid="win-sansset"] input')].filter(e => e.getBoundingClientRect().width > 0).map(i => ({ type: i.type, mode: i.inputMode, aria: i.getAttribute('aria-label'), testid: i.dataset.testid || null, id: i.id, value: i.value, row: (i.closest('label, .row, div')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80) }))))
  FACT('sections', await s.page.evaluate(() => (document.querySelector('[data-testid="win-sansset"]')?.innerText || '').replace(/\s+/g, ' ').slice(0, 600)))
} finally { await s.ctx.close(); await closeAll() }
