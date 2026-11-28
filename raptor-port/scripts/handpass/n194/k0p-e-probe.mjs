// k0p-e-probe - what on Edit Schedule's week takes typing (for Part 2 E's one change)
import { mk, signIn, go, FACT, closeAll, world, wait } from './k0p-lib.mjs'
const s = await mk('d', { storageState: await world() })
await signIn(s, 'saber'); await go(s, 'editsched'); await wait(s, 900)
FACT('editables', await s.page.evaluate(() => { const c = [...document.querySelectorAll('#eWeek [contenteditable], #eWeek input, #eWeek textarea, #eWeek [data-k]')].filter(e => e.getBoundingClientRect().width > 0); return { n: c.length, first: c.slice(0, 15).map(e => e.tagName + '|' + (e.id || '') + '|' + (e.dataset.k || '') + '|' + (e.getAttribute('contenteditable') || '') + '|' + (e.className || '').toString().slice(0, 30) + '|' + (e.textContent || e.value || '').slice(0, 15)) } }))
await s.ctx.close(); await closeAll()
