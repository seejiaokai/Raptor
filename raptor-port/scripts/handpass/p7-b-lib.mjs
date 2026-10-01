/* [DB-READINESS] group A phase 7 — the FULL check's walk, WALKER B (1 Oct 26): the sim brief / debrief flag in the
   ALL AVAIL window and the second spare sim seat. Helpers on top of the phase-6 driver (p6-lib.mjs: a fresh world at
   Wed 15 Jul 26), the group driver (dbrA-lib.mjs) and walker W1's gestures (dbrA-W1-lib.mjs).
   Every fixture goes through the board's own controls; the probe bridge only gets to a place and READS. */
import { resolve } from 'node:path'
export const sleep = ms => new Promise(r => setTimeout(r, ms))

/* the ALL AVAIL window as a person reads it — every man's row, whether it is PAINTED amber (the computed colours, not
   only the class), his reason, and the foot */
export async function win(p) {
  return p.evaluate(() => {
    const w = document.querySelector('.availwin:not([hidden])')
    if (!w) return { open: false }
    const r = w.getBoundingClientRect()
    const P = window.PEOPLE
    const vis = e => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) } }
    return {
      open: true,
      title: (w.querySelector('.win-ttl')?.innerText || '').replace(/\s+/g, ' ').trim(),
      one: (w.querySelector('.win-one')?.innerText || '').replace(/\s+/g, ' ').trim(),
      from: (w.querySelector('.win-from')?.innerText || '').replace(/\s+/g, ' ').trim(),
      lost: (w.querySelector('.win-lost')?.innerText || '').trim(),
      foot: (w.querySelector('.win-foot')?.innerText || '').replace(/\s+/g, ' ').trim(),
      rect: vis(w),
      rows: [...w.querySelectorAll('.rpuck[data-awp]')].map(x => {
        const pk = x.querySelector('.puck'), why = x.querySelector('.rwhy')
        const cs = getComputedStyle(x), ps = pk ? getComputedStyle(pk) : null, ws = why ? getComputedStyle(why) : null
        return { id: x.dataset.awp, cs: (P[x.dataset.awp] || {}).cs,
          flag: x.classList.contains('clash') ? 'RED' : x.classList.contains('flagged') ? 'AMBER' : '',
          why: why ? why.innerText.replace(/\s+/g, ' ').trim() : '',
          paint: { row: `${cs.borderLeftColor}|${cs.backgroundColor}|${cs.outlineColor}`, puck: ps ? `${ps.boxShadow}|${ps.outlineColor}|${ps.borderColor}` : '', why: ws ? ws.color : '' },
          box: vis(x), whyBox: vis(why), puckBox: vis(pk) }
      }),
    }
  })
}
export const man = (w, id) => (w.rows || []).find(r => r.id === id) || null
export const flagged = w => (w.rows || []).filter(r => r.flag).map(r => `${r.cs}:${r.flag}:${r.why}`)

/* the count chip of a row, found by the row's own hidden id — on the board, the edit week or View-only Sched */
export async function chipItem(p, di, kind, match) {
  return p.evaluate(([d, k, m]) => {
    const D = window.DAYS[d]
    const rows = k === 'ground' ? D.ground : k === 'prog' ? D.allhands : []
    const r = rows.find(x => (x.prog || '') === m)
    return r && r.rid ? `r:${r.rid}` : null
  }, [di, kind, match])
}
export async function openChip(p, item, where = '#schedBoard') {
  const c = p.locator(`${where} [data-oilsent="${item}"]:visible`).first()
  if (!(await c.count())) return { open: false, why: 'no chip drawn for ' + item + ' in ' + where }
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' }))
  await sleep(200)
  const txt = (await c.innerText()).trim(), title = await c.getAttribute('title')
  await c.click({ timeout: 4000 })
  await sleep(450)
  return { ...(await win(p)), chip: txt, chipTitle: title }
}
export async function tapMan(p, id) {
  const x = p.locator(`.availwin:not([hidden]) .rpuck[data-awp="${id}"] .puck`).first()
  if (!(await x.count())) return 'not listed'
  await x.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(120)
  await x.click({ timeout: 4000 }); await sleep(350)
  return 'tapped'
}
export async function closeWin(p) { const x = p.locator('.availwin:not([hidden]) .win-x').first(); if (await x.count()) { await x.click().catch(() => {}); await sleep(250) } }
/* move the window by its own grip so it does not lie over the thing to be pictured / typed into */
export async function moveWin(p, dx, dy) {
  const g = p.locator('.availwin:not([hidden]) .win-grip, .availwin:not([hidden]) .win-ttl').first()
  const b = await g.boundingBox(); if (!b) return false
  await p.mouse.move(b.x + 8, b.y + 8); await p.mouse.down()
  await p.mouse.move(b.x + 8 + dx, b.y + 8 + dy, { steps: 8 }); await p.mouse.up(); await sleep(250)
  return true
}

/* a new Ground Programme row through the panel's own "+ Item": its name, its times; returns its index */
export async function addGround(L, W, p, di, prog, str, end) {
  const n0 = await p.evaluate(d => window.DAYS[d].ground.length, di)
  const b = p.locator(`#schedBoard [data-gradd="${di}"]:visible`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  await b.click(); await sleep(500)
  const n1 = await p.evaluate(d => window.DAYS[d].ground.length, di)
  if (n1 !== n0 + 1) throw new Error(`+ Item added ${n1 - n0} rows`)
  let ri = n1 - 1
  await W.boardText(p, `gr:${di}.${ri}.prog`, prog)
  ri = await groundIx(p, di, prog)
  await W.boardText(p, `gr:${di}.${ri}.str`, str)
  ri = await groundIx(p, di, prog)
  await W.boardText(p, `gr:${di}.${ri}.end`, end)
  return groundIx(p, di, prog)
}
export async function groundIx(p, di, prog) { return p.evaluate(([d, m]) => window.DAYS[d].ground.findIndex(x => (x.prog || '') === m), [di, prog]) }
export async function setGroundTimes(W, p, di, prog, str, end) {
  let ri = await groundIx(p, di, prog)
  await W.boardText(p, `gr:${di}.${ri}.str`, str)
  ri = await groundIx(p, di, prog)
  await W.boardText(p, `gr:${di}.${ri}.end`, end)
  return groundIx(p, di, prog)
}
/* the day's warning list on the open board, each line's words (the side panel; opened by its own header if folded) */
export async function warnLines(p) {
  return p.evaluate(() => {
    const side = document.querySelector('#sbSide') || document.querySelector('#schedBoard')
    if (!side) return null
    const txt = side.innerText || ''
    const cut = txt.indexOf('PLACEHOLDERS')
    return (cut > 0 ? txt.slice(0, cut) : txt).split(/\r?\n/).map(s => s.trim()).filter(s => s && s !== '✕' && s !== '·')
  })
}
/* the sims of a day as the model holds them and as the row is STORED (text read off the browser's storage) */
export async function simModel(p, di) { return p.evaluate(d => JSON.parse(JSON.stringify(window.DAYS[d].sims)), di) }
export async function storedDay(p, di, wk = '13-07-2026') {
  return p.evaluate(([w, d]) => { const v = localStorage.getItem(`raptor:weeks/${w}#${d}`); return v == null ? null : v }, [wk, di])
}
/* every null inside a parsed value, as paths — the hole the second spare seat must not leave */
export function nulls(v, path = '', out = []) {
  if (v === null) { out.push(path || '(root)'); return out }
  if (Array.isArray(v)) v.forEach((x, i) => nulls(x, `${path}[${i}]`, out))
  else if (v && typeof v === 'object') for (const k of Object.keys(v)) nulls(v[k], path ? `${path}.${k}` : k, out)
  return out
}
export const picPath = (dir, name) => resolve(dir, name + '.png')

/* a fresh world (its own storage) at the walk's fixed date, signed in — pictures at 2x so a 212px window reads sharp */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
export const TODAY = new Date(2026, 6, 15, 9, 0, 0)
export async function world(L, { phone = !!process.env.HP_PHONE, storageState = null, who = 'a', dsf = 2 } = {}) {
  const browser = await L.launch()
  const ctx = await browser.newContext({ viewport: phone ? L.PHONE : L.DESK, deviceScaleFactor: dsf, ...(phone ? { isMobile: true, hasTouch: true } : {}), ...(storageState ? { storageState } : {}) })
  await ctx.clock.setFixedTime(TODAY)
  const errors = []
  const p = await L.page(ctx, errors)
  await L.signIn(p, who)
  return { browser, ctx, p, errors }
}
/* one section of the walker's results file (each script writes its own; the others' are kept) */
export function saveSection(name, data) {
  const f = process.env.HP_OUT
  let all = {}
  if (existsSync(f)) { try { all = JSON.parse(readFileSync(f, 'utf8')) } catch (e) { all = {} } }
  all[name] = { at: new Date().toISOString(), base: process.env.HP_URL, ...data }
  writeFileSync(f, JSON.stringify(all, null, 1))
}
/* a picture of the ALL AVAIL window alone (its own rectangle, a little room round it) */
export async function winPic(L, p, name) {
  const w = await win(p)
  if (!w.open) { await L.shot(p, name); return name + '.png' }
  const vp = p.viewportSize(), r = w.rect
  const x = Math.max(0, r.x - 6), y = Math.max(0, r.y - 6)
  await L.shot(p, name, { clip: { x, y, width: Math.min(vp.width - x, r.w + 12), height: Math.min(vp.height - y, r.h + 12) } })
  return name + '.png'
}
