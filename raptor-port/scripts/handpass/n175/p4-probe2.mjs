// p4-probe2 - finding controls only (not a case): Edit Schedule's seats and pucks. node .../p4-probe2.mjs <d|402x874>
import { mk, closeAll, FACT, signIn, go, wait, tpic, SZT } from './p4-lib.mjs'
const SZ = process.argv[2] || 'd', T = SZT(SZ)
const s = await mk(SZ); const { page } = s
try {
  await signIn(s, 'ad', 'a'); await go(s, 'editsched'); await wait(s, 1200)
  FACT('seats', await page.evaluate(() => {
    const vis = e => { const b = e.getBoundingClientRect(); return b.width > 2 && b.height > 2 && b.top > 0 && b.bottom < innerHeight && b.left >= 0 && b.right < innerWidth }
    const filled = [...document.querySelectorAll('.page.on .seat[data-slot], .page.on .sb-slot')].filter(vis)
    return { n: filled.length, first: filled.slice(0, 8).map(e => ({ cls: e.className, slot: e.getAttribute('data-slot'), text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 20), box: (b => [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)])(e.getBoundingClientRect()), puck: !!e.querySelector('.puck') })) }
  }))
  FACT('roster', await page.evaluate(() => [...document.querySelectorAll('.page.on .eroster .puck, .page.on .sb-roster .puck')].slice(0, 4).map(e => e.outerHTML.slice(0, 160))))
  await tpic(s, `probe2-${T}-es`)
} catch (e) { FACT('error', String(e).split('\n')[0]) } finally { await closeAll() }
