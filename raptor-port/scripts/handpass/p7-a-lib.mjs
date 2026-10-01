/* [DB-READINESS] group A phase 7 — WALKER A's helpers (1 Oct 26): a placeholder (ALL / ALL AVAIL) on a member's
   "Personal" request row. Built on the group driver (dbrA-lib.mjs), walker W1's gestures (dbrA-W1-lib.mjs), the phase 6
   world (p6-lib.mjs — a fresh world at the fixed date Wed 15 Jul 26) and the seat helpers (seat-lib.mjs).
   Every fixture goes through the app's own controls; the probe bridge only GETS to a place and READS state.
   What is read here is what a person SEES: a chip counts only when it is painted (a box on screen, not hidden), the
   window's words are its own text, a man's reason is the title under his puck. */
import { writeFileSync } from 'node:fs'
export const SAT = 5, SUN = 6, TUE = 1, THU = 3, FRI = 4, MON = 0, WED = 2
export const ISO = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19']
export const RANGER = 'bane'

/* ---------- the table: one row per scenario ---------- */
export const ROWS = []
let cur = null
export function scen(id, did) { cur = { id, did, screen: [], data: [], verdict: 'PASS', why: [], pics: [] }; ROWS.push(cur); console.log(`\n===== ${id} — ${did}`); return cur }
export const said = s => { cur.screen.push(s); console.log('  SCREEN ' + s) }
export const data = s => { cur.data.push(s); console.log('  DATA   ' + s) }
export function ok(name, cond, detail = '') {
  const d = typeof detail === 'string' ? detail : JSON.stringify(detail)
  console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${d ? ' — ' + d.slice(0, 400) : ''}`)
  if (!cond) { cur.verdict = 'FAIL'; cur.why.push(`${name}${d ? ' — ' + d.slice(0, 600) : ''}`) }
  return !!cond
}
export const note = s => { cur.why.push('NOTE ' + s); console.log('  NOTE   ' + s) }
export async function pic(L, p, name, opts = {}) { await L.shot(p, name, opts); cur.pics.push(name + '.png'); return name + '.png' }
export function saveRows(path, extra = {}) { writeFileSync(path, JSON.stringify({ at: new Date().toISOString(), rows: ROWS, ...extra }, null, 1)); console.log('\n→ ' + path) }

/* ---------- reading the day ---------- */
export const rowIdx = (p, di, iid) => p.evaluate(([d, i]) => (window.DAYS[d].ground || []).findIndex(r => r.src === i), [di, iid])
export const rowOf = (p, di, iid) => p.evaluate(([d, i]) => { const r = (window.DAYS[d].ground || []).find(r => r.src === i); return r ? JSON.parse(JSON.stringify(r)) : null }, [di, iid])
export const reqOf = (p, iid) => p.evaluate(i => { const x = window.INPUTS.find(r => r.iid === i); return x ? JSON.parse(JSON.stringify(x)) : null }, iid)
export const csOf = (p, ids) => p.evaluate(a => a.map(id => (window.PEOPLE[id] || {}).cs || id), ids)

/* every count chip PAINTED inside a scope for a request (or all of them when iid is null) */
export async function chips(p, scope, iid = null) {
  return p.evaluate(([s, i]) => {
    const root = document.querySelector(s); if (!root) return 'NO SCOPE ' + s
    return [...root.querySelectorAll('.oilcount')].filter(e => !i || e.dataset.oilsent === 'i:' + i).map(e => {
      const r = e.getBoundingClientRect(), cs = getComputedStyle(e)
      const seat = e.closest('.seat'); const pk = seat && seat.querySelector('[data-person]')
      return { txt: (e.innerText || '').trim(), title: e.getAttribute('title') || '', ver: e.dataset.oilver || '', item: e.dataset.oilsent, beside: pk ? pk.dataset.person : null,
        slot: seat ? seat.dataset.slot || null : null,
        painted: r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05 && e.offsetParent !== null,
        box: `${Math.round(r.width)}x${Math.round(r.height)}`, color: cs.color, bg: cs.backgroundColor }
    }).filter(c => c.painted)
  }, [scope, iid])
}
/* the open ALL AVAIL window, as a person reads it */
export async function win(p) {
  return p.evaluate(() => {
    const w = [...document.querySelectorAll('.availwin')].find(x => !x.hidden && (x.offsetWidth || x.offsetHeight))
    if (!w) return { open: false }
    const t = e => e ? (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim() : ''
    const r = w.getBoundingClientRect()
    const men = [...w.querySelectorAll('[data-awp]')].map(x => {
      const seat = x.querySelector('.seat'); const why = x.querySelector('.rwhy')
      return { id: x.dataset.awp, cs: (window.PEOPLE[x.dataset.awp] || {}).cs || x.dataset.awp, cls: x.className.replace('rpuck', '').trim(),
        seatCls: seat ? seat.className : '', seatTitle: seat ? seat.getAttribute('title') || '' : '', why: t(why),
        on: !!(seat && seat.classList.contains('on')), inert: !!(seat && seat.classList.contains('inert')) }
    })
    return { open: true, title: t(w.querySelector('.win-ttl')), tabs: [...w.querySelectorAll('.win-tab')].map(x => t(x) + (x.classList.contains('on') ? ' [on]' : '')),
      one: t(w.querySelector('.win-one')), heads: [...w.querySelectorAll('.rh')].map(t), from: t(w.querySelector('.win-from')), foot: t(w.querySelector('.win-foot')),
      n: men.length, men, ids: men.map(m => m.id), flagged: men.filter(m => /clash|flag/.test(m.cls)).map(m => m.cs + ': ' + m.why),
      rect: { l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }, body: t(w).slice(0, 300) }
  })
}
export async function closeWin(p) {
  const x = p.locator('.availwin:not([hidden]) .win-x:visible').first()
  if (await x.count()) { await x.click().catch(() => {}); await p.waitForTimeout(300) }
}
/* tap the request's count chip inside a scope (the n-th painted one); returns the window */
export async function openChip(p, scope, iid, nth = 0) {
  await closeWin(p)
  const sel = iid ? `${scope} .oilcount[data-oilsent="i:${iid}"]:visible` : `${scope} .oilcount:visible`
  const c = p.locator(sel).nth(nth)
  if (!(await c.count())) return { open: false, why: 'NO CHIP to tap in ' + scope }
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await p.waitForTimeout(250)
  try { await c.click({ timeout: 3000 }) } catch (e) { const b = await c.boundingBox(); if (b) await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
  await p.waitForTimeout(500)
  return win(p)
}
export async function winTab(p, n) { const t = p.locator('.availwin:not([hidden]) .win-tab').nth(n); if (!(await t.count())) return false; await t.click(); await p.waitForTimeout(350); return true }

/* the request's row on the OPEN BOARD: its item cell (in OIL Earn: the switch and its title), every puck with its
   title and — in the mode — the earn wrapper's own title and state */
export async function boardRow(p, di, iid) {
  return p.evaluate(([d, i]) => {
    const ri = (window.DAYS[d].ground || []).findIndex(r => r.src === i)
    const b = document.querySelector('#schedBoard'); if (!b || !b.offsetWidth) return { err: 'board not open' }
    if (ri < 0) return { ri, err: 'no row for the request on this day' }
    const host = b.querySelector(`[data-fill="g:${d}.${ri}.+"]`) || b.querySelector(`[data-slot="g:${d}.${ri}"]`)
    const row = host ? host.closest('.sb-arow') : [...b.querySelectorAll('.sb-arow.gr-frominput')].find(r => r.querySelector(`[data-oilsent="i:${i}"]`)) || null
    if (!row) return { ri, err: 'row not drawn' }
    const item = row.querySelector('.oilitem')
    const t = e => e ? (e.innerText || e.value || e.textContent || '').replace(/\s+/g, ' ').trim() : ''
    return { ri, cls: row.className, rowTitle: row.getAttribute('title') || '',
      item: item ? { txt: t(item), cls: item.className, title: item.getAttribute('title') || '' } : { txt: t(row.querySelector('[data-bfld$=".prog"]')), cls: '(plain box)', title: '' },
      times: [...row.querySelectorAll('.atm')].map(e => e.value),
      pucks: [...row.querySelectorAll('[data-person]')].map(e => { const w = e.closest('.oilpk'); const s = e.closest('.seat')
        return { who: e.dataset.person, cs: (window.PEOPLE[e.dataset.person] || {}).cs, title: e.getAttribute('title') || '', cls: e.className,
          earn: w ? { cls: w.className, title: w.getAttribute('title') || '', oilp: w.dataset.oilp || null } : null, slot: s ? s.dataset.slot || null : null } }),
      chips: [...row.querySelectorAll('.oilcount')].map(e => ({ txt: t(e), title: e.getAttribute('title') || '' })),
      text: t(row).slice(0, 200) }
  }, [di, iid])
}
/* the same row on a WEEK surface (#eWeek / #vWeek) */
export async function weekRow(p, surf, di, iid) {
  return p.evaluate(([s, d, i]) => {
    const day = document.querySelector(`${s} .day[data-day="${d}"]`); if (!day) return { err: 'no day drawn' }
    const chip = day.querySelector(`.oilcount[data-oilsent="i:${i}"]`)
    const ph = [...day.querySelectorAll('[data-person="all"], [data-person="allavail"]')].map(e => { const seat = e.closest('.seat'); const c = seat && seat.querySelector('.oilcount'); return { who: e.dataset.person, slot: seat ? seat.dataset.slot || null : null, chip: c ? (c.innerText || '').trim() : null } })
    const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''
    const rowEl = chip ? chip.closest('tr, .grow, .g-row, .arow, li') : null
    return { chip: chip ? { txt: t(chip), title: chip.getAttribute('title') || '', ver: chip.dataset.oilver || '' } : null, placeholders: ph, rowText: rowEl ? t(rowEl).slice(0, 200) : null,
      head: { tag: t(day.querySelector('.verchip')), pend: t(day.querySelector('.dpend')) } }
  }, [surf, di, iid])
}

/* ---------- gestures ---------- */
/* arm the row's NAME seat ('name') or its extras zone ('extras') on the open board and pick a puck from the crew list */
export async function place(S, p, di, ri, where, pid) {
  return S.handPut(p, where === 'name' ? `g:${di}.${ri}` : `g:${di}.${ri}.+`, pid)
}
/* a real pointer drag of a crew-list puck onto the row's NAME seat on the open board */
export async function dragIn(W, p, di, ri, pid, where = 'name') {
  const src = p.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).first()
  const dst = p.locator(where === 'name' ? `#schedBoard [data-slot="g:${di}.${ri}"]:visible` : `#schedBoard [data-fill="g:${di}.${ri}.+"] .addz:visible`).first()
  let did = 'dragged'
  await W.toasts(p)
  try { await W.drag(p, src, dst) } catch (e) { did = 'DRAG FAILED: ' + String(e.message).slice(0, 200) }
  const after = await p.evaluate(([d, r]) => { const h = document.querySelector(`#schedBoard [data-slot="g:${d}.${r}"]`); return h ? [...h.querySelectorAll('[data-person]')].map(e => e.dataset.person) : [] }, [di, ri])
  const row = await p.evaluate(([d, r]) => JSON.parse(JSON.stringify(window.DAYS[d].ground[r] || null)), [di, ri])
  return { did, after, took: where === 'name' ? after.includes(pid) : (row && (row.more || []).includes(pid)), toasts: await W.toasts(p), row }
}
/* a board row button: CX (data-grcx), ⓘ (data-grinfo), ✕ (data-grdel) */
export async function rowBtn(p, attr, di, ri) {
  const b = p.locator(`#schedBoard [${attr}="${di}.${ri}"]:visible`).first()
  if (!(await b.count())) return 'no such button'
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(150)
  await b.click(); await p.waitForTimeout(600)
  return 'pressed'
}
/* bring a board row to the middle of the window for its picture */
export async function showRow(p, di, iid) {
  await p.evaluate(([d, i]) => {
    const ri = (window.DAYS[d].ground || []).findIndex(r => r.src === i)
    const b = document.querySelector('#schedBoard'); if (!b) return
    const h = b.querySelector(`[data-fill="g:${d}.${ri}.+"]`) || b.querySelector(`[data-slot="g:${d}.${ri}"]`) || b.querySelector(`[data-oilsent="i:${i}"]`)
    if (h) h.scrollIntoView({ block: 'center' })
  }, [di, iid])
  await p.waitForTimeout(300)
}
export async function showWeekChip(p, surf, di, iid) {
  await p.evaluate(([s, d, i]) => {
    const day = document.querySelector(`${s} .day[data-day="${d}"]`); if (!day) return
    const sc = day.closest('.week') || day.parentElement
    if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = day.offsetLeft - (sc.firstElementChild ? sc.firstElementChild.offsetLeft : 0)
    const c = day.querySelector(`.oilcount[data-oilsent="i:${i}"]`) || day.querySelector('[data-person="all"], [data-person="allavail"]')
    if (c) c.scrollIntoView({ block: 'center', inline: 'nearest' })
  }, [surf, di, iid])
  await p.waitForTimeout(350)
}
/* is OIL Earn on (the board's switches are drawn)? */
export const oilOn = p => p.evaluate(() => { const b = document.querySelector('#schedBoard'); return !!b && [...b.querySelectorAll('.oilitem')].some(e => e.offsetParent !== null) })
/* the request's ✎ editor on the Inputs page: set fields (stime / etime / type / allday), save, answer the asks.
   `oil` = 'Yes' | 'No' answers the OIL question if it is put */
export async function editReq(L, W2, p, iid, f, { oil = 'Yes' } = {}) {
  if (!(await W2.openEdit(p, iid))) return { did: 'no editor' }
  const ed = '#inBody tr.ined'
  if (f.type != null) await p.locator(`${ed} [data-ed="type"]`).selectOption(f.type)
  if (f.allday != null) { const c = p.locator(`${ed} [data-ed="allday"]`); if (await c.count() && (await c.isChecked()) !== f.allday) await c.click() }
  if (f.stime != null) { const s = p.locator(`${ed} [data-ed="stime"]`); if (await s.count()) { await s.fill(f.stime); await s.blur() } }
  if (f.etime != null) { const s = p.locator(`${ed} [data-ed="etime"]`); if (await s.count()) { await s.fill(f.etime); await s.blur() } }
  if (f.person != null) await p.locator(`${ed} [data-ed="person"]`).selectOption(f.person)
  await p.locator(`${ed} [data-save]`).first().click(); await L.sleep(700)
  const asked = []
  for (let i = 0; i < 3; i++) {
    const nodoc = p.locator('[data-testid="docconf-nodoc"]:visible'); if (await nodoc.count()) { asked.push('certificate'); await nodoc.click(); await L.sleep(500); continue }
    const conf = p.locator('[data-testid="oilconf"]:visible')
    if (await conf.count()) {
      asked.push('oil: ' + (await conf.innerText()).replace(/\s+/g, ' ').slice(0, 160))
      await conf.locator('button').filter({ hasText: new RegExp('^' + oil) }).first().click().catch(() => {})
      await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {}); await L.sleep(600); continue
    }
    break
  }
  return { did: 'saved', asked }
}
