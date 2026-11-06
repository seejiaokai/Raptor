// Walker's shared bits for the 6 Nov 26 Leave War faults walk (lw-f1106-w1/w2/w3). Not a script on its own.
// Set LW_OUT / LW_DIST in the caller BEFORE importing this.
const L = await import('./lw-fx1031-lib.mjs')
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs'
import path from 'node:path'
export { L }
mkdirSync(L.OUT, { recursive: true })
export const rows = []
export function row(id, size, did, saw, verdict, pics = []) {
  rows.push({ id, size, did, saw, verdict, pics })
  console.log(`${verdict}  ${id} [${size}] ${did} => ${saw}  [${pics.join(', ')}]`)
  appendFileSync(path.join(L.OUT, '..', 'w-rows-' + (process.env.WNAME || 'x') + '.jsonl'), JSON.stringify({ id, size, did, saw, verdict, pics, build: L.DIST.split(/[\\/]/).pop() }) + '\n')
}
export const T = L.T
/* what is open on the page right now, by the test ids the brief names */
export const openNow = P => P.evaluate(() => ['bid-picker', 'person-window', 'sel-sheet', 'select-sheet', 'win-lwday', 'closed-note'].filter(t => {
  const e = document.querySelector(`[data-testid="${t}"]`); return !!e && e.getBoundingClientRect().height > 0
}).concat(document.querySelector('.qualpop') ? ['qualpop'] : []))
export const elAt = (P, x, y) => P.evaluate(({ x, y }) => { const h = document.elementFromPoint(x, y); if (!h) return null
  const t = h.closest('[data-testid]'); return (t ? t.getAttribute('data-testid') : '') + '|' + (h.tagName + '.' + String(h.className).slice(0, 40)) }, { x, y })
export const cell = (w, pid, d) => L.cellWords(w, pid, d)
export const scrollTop = async w => { await w.page.evaluate(() => { window.scrollTo(0, 0) }); await w.page.waitForTimeout(200) }
export async function fresh(size, who = 'admin', engine) {
  const w = engine ? await (async () => { const x = await L.newCtx(size, engine); await x.ctx.clock.install({ time: new Date(L.T0) }); const { serveDist } = await import('../drawcheck/lib.mjs'); await serveDist(x.ctx, L.ORIGIN, L.DIST); x.page.setDefaultTimeout(20000); return x })() : await L.newWorld(size)
  await L.signInSaved(w, who); await L.toWar(w); await L.openGrid(w)
  return w
}
export const finish = name => writeFileSync(path.join(L.OUT, '..', 'w-rows-' + name + '.json'), JSON.stringify(rows, null, 1))
/* two taps at the SAME point: a first, a gap, a second. Returns what stood at the point just before the second, and what is open after settling */
export async function twoTaps(w, pt, gap, name) {
  const P = w.page
  await L.finger(w, pt.x, pt.y, name + '-t1')
  await P.waitForTimeout(Math.max(0, gap - 60))
  const under = await elAt(P, pt.x, pt.y)
  await L.finger(w, pt.x, pt.y, name + '-t2')
  await P.waitForTimeout(700)
  return { under, open: await openNow(P) }
}
