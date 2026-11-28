// walker a's helpers (re-walk of 24 Nov 26): the chart read, a real held drag (mouse or finger), a squadron pick made WHILE it is
// held (the keyboard at 1536, a second real pointer at 402), and questions answered the same way. The page is only read.
import { pickSq, shut, T, arrange, tool, note, trackerSaved, layoutDiff, ask, shots, fingerDown, log } from './rlib.mjs'

/* the chart as drawn: every ball's place, every link and line's path, as one fingerprint (chart units, so any zoom) */
export const chartPrint = s => s.page.evaluate(() => {
  const hash = t => { let h = 5381; for (let i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return h.toString(36) + ':' + t.length }
  const balls = [...document.querySelectorAll('#flowSvg .ball')].map(b => b.dataset.id + '@' + b.getAttribute('transform')).sort()
  const edges = [...document.querySelectorAll('#flowSvg .edgehit')].map(p => p.dataset.p + '>' + p.dataset.c + ':' + p.getAttribute('d')).sort()
  const lines = [...document.querySelectorAll('#flowSvg .linehit')].map(p => p.dataset.lid + ':' + p.getAttribute('d')).sort()
  return { balls: balls.length, edges: edges.length, lines: lines.length, b: hash(balls.join('|')), e: hash(edges.join('|')), l: hash(lines.join('|')) }
})
export const samePrint = (a, b) => a.b === b.b && a.e === b.e && a.l === b.l
/* where the view stands: a pan moves this */
export const viewSig = s => s.page.evaluate(() => {
  const b = document.getElementById('board'), v = document.getElementById('viewport')
  return b ? `${Math.round(b.scrollLeft)},${Math.round(b.scrollTop)}|${v ? v.getAttribute('transform') : 'no-viewport'}` : null
})
export const inEditor = s => s.page.evaluate(() => {
  const t = document.getElementById('arrTools')
  return !!t && t.classList.contains('on') && t.getBoundingClientRect().width > 1
})
export const shot = async (s, dir, name) => { await s.page.screenshot({ path: `${dir}/${name}.png` }); shots.push(name) }

/* the middle of the longest link or line a press really reaches */
export const pressPoint = (s, cls, corners = 0) => s.page.evaluate(([cls, corners]) => {
  const bd = document.getElementById('board').getBoundingClientRect()
  return [...document.querySelectorAll('#flowSvg ' + cls)].filter(p => (p.getAttribute('d').match(/[LQC]/g) || []).length >= corners + 1).map(p => {
    const L = p.getTotalLength(), m = p.getPointAtLength(L / 2), c = p.getScreenCTM()
    const x = c.a * m.x + c.c * m.y + c.e, y = c.b * m.x + c.d * m.y + c.f, top = document.elementFromPoint(x, y)
    return { L, x, y, ok: top === p && x > bd.left + 30 && x < bd.right - 30 && y > bd.top + 70 && y < bd.bottom - 30 }
  }).filter(o => o.ok).sort((a, b) => b.L - a.L)[0] || null
}, [cls, corners])
/* of a line's handles, the one standing farthest from any ball: a finger on a 5px handle beside a ball lands on the ball */
export const clearGrip = (s, sel) => s.page.evaluate(sel => {
  const balls = [...document.querySelectorAll('#flowSvg .ball')].map(b => { const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] })
  const out = []
  for (const e of document.querySelectorAll(sel)) {
    const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, t = document.elementFromPoint(x, y)
    if (r.width > 0 && t === e) out.push({ x, y, w: r.width, far: Math.min(...balls.map(([a, b]) => Math.hypot(a - x, b - y))) })
  }
  return out.sort((a, b) => b.far - a.far)[0] || null
}, sel)
/* a grip's middle, only if a press there lands on it */
export const gripAt = (s, sel) => s.page.evaluate(sel => {
  for (const e of document.querySelectorAll(sel)) {
    const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2
    const t = document.elementFromPoint(x, y)
    if (r.width > 0 && t && (t === e || e.contains(t))) return { x, y, w: r.width }
  }
  return null
}, sel)
/* a ball in the middle part of the board, a press reaching it */
export const ballPoint = s => s.page.evaluate(() => {
  const bd = document.getElementById('board').getBoundingClientRect(), all = []
  for (const g of document.querySelectorAll('#flowSvg .ball')) {
    const r = g.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2
    if (x < bd.left + 70 || x > bd.right - 90 || y < bd.top + 110 || y > bd.bottom - 90) continue
    if (document.elementFromPoint(x, y)?.closest('.ball') === g) all.push({ id: g.dataset.id, x, y, w: r.width })
  }
  return all[Math.floor(all.length / 2)] || null
})
export const tapAt = async (s, x, y) => { if (s.desk) await s.page.mouse.click(x, y); else await s.page.touchscreen.tap(x, y); await s.page.waitForTimeout(350) }

/* gets a grip of this kind ready; returns its point, or null with the reason logged */
export async function ready(s, kind) {
  await arrange(s, true); await s.page.waitForTimeout(300)
  if (kind === 'ball') {
    await tool(s, 'Move'); await s.page.waitForTimeout(150)
    const b = await ballPoint(s); if (!b) log('no ball in reach'); return b && { ...b, sel: `#flowSvg .ball[data-id="${b.id}"]` }
  }
  await tool(s, 'Edit lines'); await s.page.waitForTimeout(200)
  const free = kind === 'lend' || kind === 'lvert'
  const p = await pressPoint(s, free ? '.linehit' : '.edgehit', kind === 'lvert' ? 2 : 0)
  if (!p) { log('no line or link in reach', kind); return null }
  await tapAt(s, p.x, p.y)
  const sel = { bend: '#flowSvg .linehandle', endhandle: '#flowSvg .endhandle[data-end="to"]', lend: '#flowSvg .lend', lvert: '#flowSvg .lvert' }[kind]
  const g = free ? await clearGrip(s, sel) : await gripAt(s, sel)
  if (!g) { log('grip not drawn or covered', kind, await s.page.evaluate(sel => document.querySelectorAll(sel).length, sel)); return null }
  return { ...g, sel }
}

/* a real press held down: `.move(x, y)`, `.up()` */
export async function hold(s, x, y) {
  if (s.desk) {
    await s.page.mouse.move(x, y); await s.page.mouse.down()
    return { move: async (a, b) => { await s.page.mouse.move(a, b, { steps: 8 }); await s.page.waitForTimeout(60) }, up: () => s.page.mouse.up() }
  }
  const f = await fingerDown(s, x, y)
  return { move: (a, b) => f.move(a, b), up: async () => { await s.page.waitForTimeout(90); await f.up() } }
}

/* a second, real pointer (the test browser's mouse) at a control's own point, proved first */
export async function mousePress(s, sel, text) {
  const p = await s.page.evaluate(([sel, text]) => {
    const e = [...document.querySelectorAll(sel)].find(n => { const r = n.getBoundingClientRect(); return r.width > 1 && r.height > 1 && (!text || n.textContent.trim() === text || n.querySelector('.sqm-num')?.textContent.trim() === text) })
    if (!e) return null
    e.scrollIntoView({ block: 'nearest' })
    const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, t = document.elementFromPoint(x, y)
    return { x, y, hit: !!t && (t === e || e.contains(t)), at: t ? `${t.tagName}#${t.id}` : null }
  }, [sel, text])
  if (!p || !p.hit) { log('second pointer: not reachable', sel, text, p); return false }
  await s.page.mouse.click(p.x, p.y); await s.page.waitForTimeout(320)
  return true
}

/* the pick made while the press is held. 1536: Shift+Tab to the squadron button, Enter, arrows, Enter. 402: the ☰ menu by a second pointer */
export async function pickHeld(s, num) {
  const { page } = s
  if (s.desk) {
    let n = 0, on = null
    for (; n < 90; n++) { await page.keyboard.press('Shift+Tab'); on = await page.evaluate(() => document.activeElement?.id); if (on === 'sqnMenuBtn') break }
    let how = `keyboard: Shift+Tab x${n + 1} to the squadron button`
    if (on !== 'sqnMenuBtn') { await page.evaluate(() => document.getElementById('sqnMenuBtn').focus()); how = 'keyboard: .focus() on the squadron button (Tab did not reach it)' }
    await page.keyboard.press('Enter'); await page.waitForTimeout(220)
    for (let i = 0; i < 8; i++) {
      const at = await page.evaluate(() => document.activeElement?.querySelector?.('.sqm-num')?.textContent.trim() ?? null)
      if (at === num) break
      await page.keyboard.press('ArrowDown'); await page.waitForTimeout(60)
    }
    const at = await page.evaluate(() => document.activeElement?.querySelector?.('.sqm-num')?.textContent.trim() ?? null)
    if (at !== num) { log('keyboard pick: the row was not reached', at); return null }
    await page.keyboard.press('Enter'); await page.waitForTimeout(450)
    return how
  }
  if (!(await page.evaluate(() => document.getElementById('drawer')?.classList.contains('open')))) { if (!(await mousePress(s, '#burger'))) return null }
  await page.waitForTimeout(280)
  if (!(await page.locator('#drawerSqnList').count())) { if (!(await mousePress(s, '#drawerSqnBtn'))) return null }
  await page.waitForTimeout(200)
  if (!(await mousePress(s, '#drawerSqnList .sqm-row', num))) return null
  await page.waitForTimeout(450)
  return 'a second real pointer (the test browser mouse): ☰, the squadron line, the row'
}

/* the open question answered with the press still held: the keyboard at 1536, the second pointer at 402 */
export async function answerHeld(s, words) {
  const { page } = s
  if (!s.desk) return (await mousePress(s, '#dlgModal button', words)) ? 'second pointer' : null
  /* the question takes no focus of its own: the Tabs start from the squadron button, across the rest of the top bar */
  for (let i = 0; i < 70; i++) {
    const at = await page.evaluate(() => { const a = document.activeElement; return a && a.closest?.('#dlgModal') ? a.textContent.trim() : null })
    if (at === words) { await page.keyboard.press('Enter'); await page.waitForTimeout(700); return `keyboard: Tab x${i}, Enter` }
    await page.keyboard.press('Tab'); await page.waitForTimeout(50)
  }
  log('the answer was not reached by Tab', words, await ask(s))
  return null
}
/* the point at the board's foot, the chart being far taller than the board: an edge pan left alive by a held press would run here */
export const edgePoint = (s, x) => s.page.evaluate(x => { const r = document.getElementById('board').getBoundingClientRect(); return { x: Math.max(r.left + 40, Math.min(x, r.right - 40)), y: r.bottom - 5 } }, x)
export { trackerSaved, layoutDiff }
