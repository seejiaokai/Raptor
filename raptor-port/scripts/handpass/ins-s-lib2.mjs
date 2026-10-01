/* walker S — second helper file: the day beside the window, the Logic page, shared steps. */
import * as S from './ins-s-lib.mjs'
export * from './ins-s-lib.mjs'
const { B, L, W } = S
const { openList, readList, head } = B

/* the day on Edit Schedule (its bar, its head) and on View-only Sched (its bar); back on Edit Schedule afterwards.
   `view:false` skips the View-only look. */
export async function dayState(p, di, { view = true } = {}) {
  await B.toEdit(p); await openList(p, '#eWeek', di)
  const e = await readList(p, '#eWeek', di), h = await head(p, di)
  let v = null
  if (view) {
    await L.go(p, 'viewsched'); await openList(p, '#vWeek', di)
    v = await readList(p, '#vWeek', di)
    await B.toEdit(p)
  }
  return { editBar: e.bar, editLines: (e.lines || []).length, tag: h.tag, pending: h.pending, nys: h.nys, signs: h.signs.map(s => s.replace(/—\s*name\s*—/, '·')).join('|'), viewBar: v ? v.bar : null, viewLines: v ? (v.lines || []).length : null }
}
export const dayLine = d => `Edit Schedule bar "${d.editBar}" (${d.editLines} lines), tag "${d.tag}", chip "${d.pending}"${d.nys ? ', marker "' + d.nys + '"' : ''}, sign-offs [${d.signs}]${d.viewBar != null ? ` · View-only Sched bar "${d.viewBar}"` : ''}`

/* the hours of named people and the idle chips, from a read */
export function hoursOf(r, names) {
  const sec = Object.entries(r.secs).find(([k]) => /^work hours/i.test(k)); const o = {}
  for (const x of (sec ? sec[1] : [])) { const [n, v] = x.split('='); if (names.includes(n)) o[n] = v }
  return o
}
export function sec(r, key) { const e = Object.entries(r.secs).find(([k]) => k.toLowerCase().startsWith(key.toLowerCase())); return e ? e[1] : [] }
export function byDay(r, dow) { return sec(r, 'By day').find(x => x.startsWith(dow)) || '' }
export function typeCount(r, re) { const x = sec(r, 'Conflicts').find(t => re.test(t)); if (!x) return 0; const m = /(\d+)$/.exec(x); return m ? +m[1] : 0 }
export const tile = (r, i) => +(r.tiles[i] || {}).n
export const same = (a, b) => S.fp(a) === S.fp(b)
/* what differs between two reads, as short words */
export function delta(a, b) {
  const out = []
  a.tiles.forEach((t, i) => { if (t.n !== b.tiles[i].n || t.l !== b.tiles[i].l) out.push(`tile ${t.l}: ${t.n} → ${b.tiles[i].n}`) })
  for (const k of new Set([...Object.keys(a.secs), ...Object.keys(b.secs)])) {
    const x = a.secs[k] || [], y = b.secs[k] || []
    if (JSON.stringify(x) === JSON.stringify(y)) continue
    const sx = new Set(x), sy = new Set(y)
    const gone = x.filter(i => !sy.has(i)), added = y.filter(i => !sx.has(i))
    out.push(`${k.slice(0, 22)}: -[${gone.join('; ').slice(0, 240)}] +[${added.join('; ').slice(0, 240)}]`)
  }
  return out.length ? out.join(' || ') : '(no difference)'
}

/* the Logic page: the ✎ Edit rules setting named, typed and committed */
export async function logicSet(p, set, value) {
  await L.go(p, 'logic')
  if (!(await p.locator(`[data-lgset="${set}"]`).count())) { await p.locator('#lgEdit').click(); await S.sleep(500) }
  const el = p.locator(`[data-lgset="${set}"]:visible`).first()
  const before = await el.inputValue()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await S.sleep(200)
  await el.click(); await p.keyboard.press('Control+A'); await p.keyboard.type(value, { delay: 20 })
  await p.keyboard.press('Enter'); await el.evaluate(e => e.blur()); await S.sleep(500)
  const after = await el.inputValue().catch(() => '?')
  const done = p.locator('#lgDone:visible').first(); if (await done.count()) { await done.click(); await S.sleep(400) }
  return { before, after }
}
/* sign four boxes and publish: the first publish (Original) or an amendment, then wait for the save */
export async function publish(p, di, kind = 'orig') {
  const r = kind === 'orig' ? await B.pubOrig(p, di) : await B.pubAL(p, di)
  await L.settle(p)
  return r
}
