/* A PUBLISHED DAY COUNTS A SHARED INPUT ONCE (`[GROUP-INPUT-ONE-ROW]` step 6; owner D736 — "on a published day a shared
   input filed, taken off the programme or re-timed is ONE change waiting — one line, naming its people — and one man
   taken off its row or added to it is one change each"; the plan
   docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md §4.8).

   Underneath, a shared input is one record a man and one ground row a man, so the comparison with the issued version
   holds an entry for each (publish.ts dayDelta — what goes out, and what the sign-offs are bound to). THAT IS NOT
   TOUCHED HERE (D109, D103): this is the last step of the ONE COUNTING BODY (publish.ts dayPendingItemsIn), and it
   changes only the unit a PERSON counts in.

   THE RULE: the one row counts exactly what a one-man request's row counts for the same act — never that, times its
   people. Items fold when they belong to ONE ENTRY and are the SAME ACT:
   · WHICH ENTRY. An item of an input (its filing, its details, its row paired with either) is its record's — the live
     record, else the copy the issued version froze — by engine/inputentry.ts entryIdOf: the very test the Inputs
     pages group by. A request's row added or removed with NO input beside it (the whole input taken off one published
     day and accepted onto another) is its ROW's — the issued day's row for a removal, the live day's for an addition —
     by the mark the row carries (`srcg`). A change on a member row's name box (a CX, the red box, information only)
     is its row's the same way.
   · THE SAME ACT. The same kind; the same filing, from and to; the same shared fields on each side (so a re-time is
     compared as a re-time); for a name-box change the same value once the row's own request id is left out.
   · EDITS AND THE ROW'S OWN MARKS fold wherever that is the same.
   · ADDS fold only when they are the WHOLE input on this day: every live record of the entry covering the day is among
     them. REMOVALS AND TAKE-OFFS fold only when they are the WHOLE input: every record the issued version held of the
     entry is among them. Otherwise each man is his own item — "one man taken off or added is one each".
   The folded item is the first of its set, carrying `mates` (the rest — for the words and the tap) and `people`.

   …AND A GROUP MADE OUT OF AN ORDINARY REQUEST COUNTS THE MAN ADDED, AND NOTHING MORE (Sol's second read, 2). When a
   one-man request whose name box held a placeholder or a scheduler's man is made a group, the view puts its own man
   back in the name box and moves the occupant to that row's extras (overlay.ts reconcileRequestRows) — two person
   units of the same row that nobody's hand made. They are recognised EXACTLY — the same row (its id), which carried
   no entry mark in the issued day and carries one now; its request's own man arriving in the name box; the issued
   occupant arriving among that row's extras — and ride on the added man's item. A deliberate move of an occupant, or
   any other change to the extras, is never taken.

   Pure: it reads the items, the two days and the frozen inputs it is handed, and the live inputs. */
import { INPUTS, inputCoversDate } from './inputs'
import { entryIdOf, sharedKey } from './inputentry'
import { whoId } from './people'

export type FoldCtx = {
  di: number
  /* the day the comparison was made against (the issued version's, or the day a load would leave) and the live day */
  issuedD: any
  liveD: any
  /* the issued version's frozen copy of the day's inputs, by id (publish.ts daySnap `inp`) — {} where it froze none */
  frozen: any
  /* the "issued" side is the day A LOAD WOULD LEAVE (publish.ts dayDiscardCount): there a row whose request has since
     been deleted is brought back `kept` (D363) — still one of the rows the load puts back, so it counts as a member */
  keptToo?: boolean
}
type Kin = { key: string; id: string; role: 'add' | 'gone' | 'same' }

const idOf = (e: any): string => String((e && e.addr) || '').split('.').slice(1).join('.')
const rowAt = (addr: any, d: any): any => { const m = /^gr:\d+\.(\d+)\.prog$/.exec(String(addr || '')); return m ? ((d && d.ground) || [])[+m[1]!] || null : null }
const U = '␟'

function kinOf(it: any, ctx: FoldCtx): Kin | null {
  if (!it || it.mates) return null
  const e = it.entry || {}
  const ent = it.val || it.inp || (it.kind === 'input' ? e : null)
  if (ent && /^in[pv]:/.test(String(ent.addr || ''))) {
    /* an item of an input */
    const id = idOf(it.val || it.inp || e)
    const now = (INPUTS as any[]).find(r => r && String(r.iid || '') === id) || null
    const was = (ctx.frozen || {})[id] || null
    if (!now && !was) return null
    const eNow = now ? entryIdOf(now) : '', eWas = was ? entryIdOf(was) : ''
    const fil = it.inp || (String(e.addr || '').startsWith('inp:') ? e : null)
    /* what it is, as a person would say it: a man put on, a man gone (deleted, or his row taken off), or a change */
    const role: Kin['role'] = it.kind === 'add' || (it.val && !was) ? 'add' : it.kind === 'delete' || (it.val && !now) ? 'gone' : 'same'
    /* the entry is the one it is ARRIVING in or LEAVING: a removal is judged by what the issued version held */
    const ek = role === 'gone' ? (eWas || eNow) : (eNow || eWas)
    if (!ek) return null
    /* a removal with nothing frozen to judge "the whole input" by (a version issued before the freeze) is left alone */
    if (role === 'gone' && !was) return null
    const act = [it.kind, it.axis, fil ? `${fil.from || ''}>${fil.to || ''}` : '', it.val ? `${was ? sharedKey(was) : ''}>${now ? sharedKey(now) : ''}` : ''].join(U)
    return { key: `${ek}${U}${act}`, id, role }
  }
  if (it.axis !== 'content' || !e.addr) return null
  if (it.kind === 'add' || it.kind === 'delete') {
    /* a request's row with no input beside it */
    const row = rowAt(e.addr, it.kind === 'delete' ? ctx.issuedD : ctx.liveD)
    if (!row || !row.src || !row.srcg || (row.kept && !(ctx.keptToo && it.kind === 'delete'))) return null
    return { key: `${row.srcg}${U}row${U}${it.kind}`, id: String(row.src), role: it.kind === 'add' ? 'add' : 'gone' }
  }
  if (it.kind === 'change') {
    /* the row's own marks, kept on its name box: the value with the row's own request id left out */
    const row = rowAt(e.addr, ctx.liveD)
    if (!row || !row.src || row.kept || !row.srcg) return null
    const bare = (v: any) => String(v == null ? '' : v).split(U).slice(0, -1).join(U)
    return { key: `${row.srcg}${U}mark${U}${bare(e.from)}>${bare(e.to)}`, id: String(row.src), role: 'same' }
  }
  return null
}

/* every record of the entry that an ADD must hold to be "the whole input" on this day: the live ones covering it —
   read off the rows where the items are rows (the entry's mark is the row's), off the records otherwise */
function liveMembers(ek: string, ctx: FoldCtx): string[] {
  const dt = (ctx.liveD || {}).dt
  const byRec = (INPUTS as any[]).filter(r => r && entryIdOf(r) === ek && (dt == null || inputCoversDate(r, dt))).map(r => String(r.iid || ''))
  const byRow = (((ctx.liveD || {}).ground || []) as any[]).filter(g => g && g.src && !g.kept && g.srcg === ek).map(g => String(g.src))
  return [...new Set(byRec.concat(byRow))]
}
/* …and every record the issued version held of it, for a REMOVAL */
function issuedMembers(ek: string, ctx: FoldCtx): string[] {
  const byRec = Object.keys(ctx.frozen || {}).filter(id => entryIdOf(ctx.frozen[id]) === ek)
  const byRow = (((ctx.issuedD || {}).ground || []) as any[]).filter(g => g && g.src && (!g.kept || ctx.keptToo) && g.srcg === ek).map(g => String(g.src))
  return [...new Set(byRec.concat(byRow))]
}

export function foldEntries<T extends Record<string, any>>(items: T[], ctx: FoldCtx): T[] {
  if (!items || items.length < 2) return items
  const src = regroupRides(items, ctx)
  const kin = src.map(it => kinOf(it, ctx))
  const sets = new Map<string, number[]>()
  kin.forEach((k, i) => { if (k) { const l = sets.get(k.key); if (l) l.push(i); else sets.set(k.key, [i]) } })
  const drop = new Set<number>()
  const out = src.slice() as any[]
  sets.forEach((ix, key) => {
    if (ix.length < 2) return
    const role = kin[ix[0]!]!.role, ek = key.slice(0, key.indexOf(U)), ids = new Set(ix.map(i => kin[i]!.id))
    if (role === 'add' && !liveMembers(ek, ctx).every(id => ids.has(id))) return
    if (role === 'gone' && !issuedMembers(ek, ctx).every(id => ids.has(id))) return
    const first = ix[0]!, rest = ix.slice(1)
    out[first] = { ...src[first], mates: rest.map(i => src[i]), people: peopleOf(ix.map(i => kin[i]!.id), ctx),
      jump: ix.reduce((a: string[], i) => a.concat((src[i] as any).jump || []), []),
      keys: ix.reduce((a: string[], i) => a.concat((src[i] as any).keys || []), []) }
    rest.forEach(i => drop.add(i))
  })
  return drop.size ? out.filter((_x, i) => !drop.has(i)) : (out as T[])
}

/* the people of a folded item, by the records it stands for — live, else as the issued version froze them */
function peopleOf(ids: string[], ctx: FoldCtx): string[] {
  const out: string[] = []
  for (const id of ids) {
    const r = (INPUTS as any[]).find(x => x && String(x.iid || '') === id) || (ctx.frozen || {})[id]
      || (((ctx.issuedD || {}).ground || []) as any[]).concat(((ctx.liveD || {}).ground || []) as any[]).find(g => g && String(g.src || '') === id)
    const p = r ? String(whoId(r.person != null ? r.person : r.who) || r.person || '') : ''
    if (p && !out.includes(p)) out.push(p)
  }
  return out
}

/* the two person units a regrouping makes on the ordinary request's own row, taken out and carried by the added man's
   item (`rows`, as an input's re-landed row's units are carried) — see the head of this file */
function regroupRides<T extends Record<string, any>>(items: T[], ctx: FoldCtx): T[] {
  const live: any[] = (ctx.liveD || {}).ground || [], issued: any[] = (ctx.issuedD || {}).ground || []
  let out: any[] | null = null
  live.forEach((row: any, ri: number) => {
    if (!row || !row.src || row.kept || !row.srcg || !row.rid) return
    const old = issued.find((g: any) => g && g.rid === row.rid)
    if (!old || old.srcg || String(old.src || '') !== String(row.src)) return
    const own = String(whoId(row.who) || ''), occ = String(whoId(old.who) || '')
    if (!own || !occ || occ === own) return
    const list = out || items
    const place = `g:${ctx.di}.${ri}`
    const back = list.findIndex((u: any) => u.kind === 'people' && u.place === place && !u.order && !(u.off || []).length && (u.on || []).length === 1 && String(u.on[0]) === own)
    const moved = list.findIndex((u: any) => u.kind === 'reseat' && String(u.token) === occ && u.from === place && String(u.to || '').startsWith(`${place}.x`))
    if (back < 0 || moved < 0) return
    /* the added man's item: an add of this entry, on this day */
    const host = list.findIndex((u: any) => u.kind === 'add' && (() => { const r = rowAt((u.entry || {}).addr, ctx.liveD); return !!r && r.srcg === row.srcg && r !== row })())
    if (host < 0) return
    out = list.slice()
    out[host] = { ...out[host], rows: (out[host].rows || []).concat([out[back], out[moved]]) }
    out = out.filter((_x: any, i: number) => i !== back && i !== moved)
  })
  return (out || items) as T[]
}
