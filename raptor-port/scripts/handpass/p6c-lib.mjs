/* [DB-READINESS] group A phase 6 step (c) v3 — the FULL check's walk helpers (1 Oct 26).
   On top of the phase-6 driver (p6-lib.mjs: the fixed clock, the screen facts compared across two builds) and the group
   driver (dbrA-lib.mjs: every row a step wrote named by its batch; a reload gives it back and writes nothing).
   Step (c) promised: a request's filing, edit, hand-over, delete and their Undo / Redo write the REQUEST only; its row on
   the Ground Programme is worked out when the day is read, the same right after, after a reload and on another device.
   Env as p6-lib: HP_URL, HP_SHOTS, HP_OUT, HP_TAG ('p6c' this build, 'base' the build before (c)). */
export const IS_C = (process.env.HP_TAG || 'p6c') === 'p6c'

/* every ground row of the loaded week that came from request iid, with where it sits and what it carries */
export async function rowsOf(p, iid) {
  return p.evaluate(i => {
    const out = []
    window.DAYS.forEach((d, di) => (d.ground || []).forEach((r, ri) => {
      if (r.src !== i) return
      out.push({ di, ri, rid: r.rid || null, prog: r.prog || '', str: r.str || '', end: r.end || '', who: r.who || '', more: (r.more || []).slice(),
        rmks: r.rmks || '', kept: !!r.kept, info: !!r.info, flag: r.flag || null, cx: r.cx || null })
    }))
    return out
  }, iid)
}
/* the same, without the hidden id (it differs between the two builds by design — compared as "the same id as before") */
export const noRid = rs => rs.map(({ rid, ...r }) => r)
export async function reqOf(p, iid) {
  return p.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return r ? { person: r.person, type: r.type, date: r.date, endDate: r.endDate || '', s: r.allday ? '' : (r.s != null ? r.s : ''), e: r.allday ? '' : (r.e != null ? r.e : ''), remarks: r.remarks || '', acc: r.acc || null } : null }, iid)
}
/* the rows a step wrote that belong to a WEEK (a day row, its book) — step (c)'s promise is none for a request's command */
export const weekRows = a => (a ? [...a.put, ...a.del].filter(k => k.startsWith('weeks/')) : ['(no audit)'])
/* sign out and in again as another person on the SAME world (the sign-in card; the world already written, §7.7) */
export async function switchTo(L, W2, p, who) {
  await W2.signOut(p)
  await L.signIn(p, who, { goto: false })
  await L.settle(p, 500)
}
/* the day's Personal Inputs card text for request iid on the open board (what the card says about it) */
export async function cardText(p, di, iid) {
  return p.evaluate(([d, i]) => {
    const b = document.querySelector('#schedBoard'); if (!b) return null
    const x = b.querySelector(`[data-acck="${i}"]`); const row = x && x.closest('.sb-arow, .pi-card, .inprow, div')
    return row ? row.innerText.replace(/\s+/g, ' ').trim().slice(0, 300) : null
  }, [di, iid])
}
/* the ground programme as a person reads it on the edit week for day di: each row's words, in the order drawn */
export async function groundText(p, di) {
  return p.evaluate(i => {
    const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); if (!d) return null
    const g = [...d.querySelectorAll('[data-k^="g:' + i + '."], [data-txt^="gr:' + i + '."]')]
    const rows = new Map()
    for (const e of g) { const m = /^(?:g|gr):\d+\.(\d+)/.exec(e.dataset.k || e.dataset.txt); if (!m) continue; const k = +m[1]; rows.set(k, ((rows.get(k) || '') + ' ' + (e.innerText || e.value || '')).trim()) }
    return [...rows.entries()].map(([k, v]) => `${k}: ${v.replace(/\s+/g, ' ')}`)
  }, di)
}
