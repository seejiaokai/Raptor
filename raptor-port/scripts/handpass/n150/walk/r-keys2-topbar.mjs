// r-keys2 (chat 151, the re-walk) — a lead from r-keys SZ=d: on the desktop's top bar ("149 ▾"), Arrow Down and Arrow Up
// opened the list but the focus stayed on the mark, and a Shift+Tab out left the list open. Is it so for each way in
// (Enter, Space, Arrow Down, Arrow Up)? Where does Tab go from the mark with the list open, and does Tab past its last row
// close it? Ranger with View of 149, desktop 1536, keys only after a press on an empty spot of the top bar.
// Reads the boxes the code names (ui/SquadronMenu.tsx: #sqnMenuBtn, #sqnMenu).
import { serve, stop, newPage, signIn, as, step, rec, pic, picsFor, barPick, go, grant, finish, note, facts, state } from './vlib.mjs'
import { check, shutMenu } from './r-lib.mjs'
const SZ = process.env.SZ || 'd'
console.log('r-keys2-topbar v1', SZ)
picsFor('r-keys2-' + SZ)
const focusNow = s => s.page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return 'body'; return `${a.tagName.toLowerCase()}${a.id ? '#' + a.id : ''}${a.getAttribute('aria-checked') === 'true' ? '[ticked]' : ''}${a.querySelector?.('.sqm-num') ? '{' + a.querySelector('.sqm-num').textContent.trim() + '}' : ''}` })
const panel = s => s.page.evaluate(() => { const p = document.querySelector('#sqnMenu'); if (!p) return null; const cs = getComputedStyle(p); const b = p.getBoundingClientRect(); return { vis: cs.visibility, y: Math.round(b.top), rows: p.querySelectorAll('.sqm-row').length } })
const key = async (s, k) => { await s.page.keyboard.press(k); await s.page.waitForTimeout(300) }
async function toMark(s) {
  const pt = await s.page.evaluate(() => { const bar = document.querySelector('.topbar'); const r = bar.getBoundingClientRect(); for (let x = r.left + 200; x < r.right - 200; x += 10) { const e = document.elementFromPoint(x, r.top + r.height / 2); if (e === bar || (e && e.classList.contains('topbar'))) return { x, y: r.top + r.height / 2 } } return null })
  await s.page.mouse.click(pt.x, pt.y); await s.page.waitForTimeout(150)
  for (let i = 0; i < 25; i++) { await s.page.keyboard.press('Tab'); await s.page.waitForTimeout(40); if ((await focusNow(s)) === 'button#sqnMenuBtn') return true }
  return false
}
await serve()
try {
  const s = await newPage(SZ)
  await signIn(s, 'ad', 'a')
  await step('grant', async () => { await grant(s, 'bane', '149', 'view'); await go(s, 'viewsched'); await shutMenu(s) })
  await as(s, 'us', 'us')
  await step('149', async () => { await barPick(s, '149') })
  for (const k of ['Enter', 'Space', 'ArrowDown', 'ArrowUp']) {
    await step(`${k} on the mark`, async () => {
      if (!(await toMark(s))) { check(`premise (${k}): focus on the mark`, false, await focusNow(s)); return }
      await key(s, k)
      const p = await panel(s), f = await focusNow(s)
      facts[`${k}`] = { panel: p, focus: f }; note(`${k}:`, JSON.stringify(facts[k]))
      await pic(s, `${k}-01`, ['.topbar', '#sqnMenu'])
      check(`${k}: the list open and shown`, !!p && p.vis === 'visible' && p.rows === 2, p)
      check(`${k}: the focus on the squadron in view (149, ticked)`, f.includes('[ticked]') && f.includes('{149}'), f)
      await key(s, 'Escape'); await shutMenu(s)
    })
  }
  await step('Tab from the mark with the list open, then past its last row', async () => {
    if (!(await toMark(s))) return
    await key(s, 'ArrowDown')
    const seq = []
    for (let i = 0; i < 4; i++) { await key(s, 'Tab'); seq.push({ focus: await focusNow(s), open: !!(await panel(s)) }) }
    facts['tab-seq'] = seq; note('Tab x4 from the mark, list open:', JSON.stringify(seq))
    await pic(s, 'tab-01-after-tabs', ['.topbar', '#sqnMenu'])
    const out = seq.find(x => !x.focus.includes('{') && x.focus !== 'button#sqnMenuBtn')
    check('Tab past the list\'s last row: the list closed once the focus is outside it', !!out && !out.open, seq)
    await key(s, 'Escape'); await shutMenu(s)
  })
  await step('Shift+Tab from the mark with the list open (the mark is the first control of the page)', async () => {
    if (!(await toMark(s))) return
    await key(s, 'Enter')
    const seq = []
    for (let i = 0; i < 3; i++) { await key(s, 'Shift+Tab'); seq.push({ focus: await focusNow(s), open: !!(await panel(s)) }) }
    facts['shift-seq'] = seq; note('Shift+Tab x3 from the list:', JSON.stringify(seq))
    await pic(s, 'shift-01-after', ['.topbar', '#sqnMenu'])
  })
  await s.ctx.close()
} finally { finish('r-keys2-' + SZ); await stop() }
