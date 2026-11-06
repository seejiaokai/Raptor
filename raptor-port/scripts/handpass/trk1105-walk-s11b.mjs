/* S11b — re-reads S11's two phone checks by what is DRAWN (a box wider than 1px), not by textContent / :visible (walk-scripts §4).
   node scripts/handpass/trk1105-walk-s11b.mjs */
import { open, pair, shot, mk, sleep, P, Lnd } from './trk1105-walk-lib.mjs'
console.log('trk1105-walk-s11b v1')
const L = mk('S11b')
for (const [tag, size, who] of [['P', P, 'a'], ['P', P, 'u'], ['L', Lnd, 'u']]) {
  const role = who === 'a' ? 'admin' : 'member'
  const { browser, page } = await open({ engine: 'webkit', size, touch: true, who })
  const r = await page.evaluate(() => {
    const drawn = e => { const b = e.getBoundingClientRect(); const c = getComputedStyle(e); return b.width > 1 && b.height > 1 && c.visibility !== 'hidden' && c.display !== 'none' }
    const words = id => { const e = document.getElementById(id); return [...e.querySelectorAll('*')].filter(x => x.children.length === 0 && drawn(x) && x.textContent.trim()).map(x => x.textContent.trim()) }
    const tn = document.getElementById('topnav'), tr = tn && tn.getBoundingClientRect(), bar = document.querySelector('.topbar').getBoundingClientRect()
    return { undoWords: words('trUndoBtn'), redoWords: words('trRedoBtn'), undoSvg: !!document.querySelector('#trUndoBtn svg') && drawn(document.querySelector('#trUndoBtn svg')), topnavBox: tr ? [Math.round(tr.width), Math.round(tr.height)] : null, topnavDrawnLinks: [...document.querySelectorAll('#topnav a')].filter(a => { const b = a.getBoundingClientRect(); return getComputedStyle(a).visibility !== 'hidden' && b.width > 1 && b.height > 1 && b.right > 0 && b.left < innerWidth && b.top < bar.bottom }).length, barH: Math.round(bar.height), burger: drawn(document.getElementById('burger')) }
  })
  L.ok('top bar: pair draws only its arrow glyphs (no words); page names not drawn in the bar; burger present; one row', tag, role, r.undoWords.join('') === '↶' && r.redoWords.join('') === '↷' && r.topnavDrawnLinks === 0 && r.burger, JSON.stringify(r), `S11-${tag}-${role === 'admin' ? 'admin' : 'member'}-open.png`)
  await browser.close()
}
L.save('S11b')
