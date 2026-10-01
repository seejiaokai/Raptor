/* [WARN-HIDE-KEPT] mock-up (D469, D471, D472 — 1 Oct 26): "a picture first (the struck-out line on the board and the edit
   week, phone and desktop), then the build". Pictures of the REAL built app at 2x. TODAY is the app as it stands, a
   warning hidden through its own ✕. NEW is made by editing the app's own markup in the page with the stylesheet rules the
   build will add (MOCK_CSS below) — the same line, struck out and darker, in its place; the day's count without it; the
   man's puck without its ring and chip. Nothing is saved; each world is thrown away.
   HP_URL (default http://localhost:4173). Pictures → docs/img/handpass/2026-10-01-warn-hide/mock. */
import * as L from './dbrA-lib.mjs'
import * as W from './dbrA-W1-lib.mjs'
import { mkdirSync, rmSync } from 'node:fs'
import { chromium } from '@playwright/test'

const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-10-01-warn-hide/mock'
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const TUE = 1, SAT = 5, WHO = 'wolf'          // Static — "has a long work day" (a grey note; his puck wears the L chip)

/* the rules the build adds — a hidden line: where it was, struck out, darker, its ↺ at full strength */
const MOCK_CSS = `
.dwlist .witem.hid{opacity:1;background:transparent;border-style:dashed;border-color:var(--edge)}
.dwlist .witem.hid .wbar{background:var(--edge-2)!important}
.dwlist .witem.hid .wtx{color:var(--ink-3);text-decoration:line-through;text-decoration-color:var(--ink-3)}
.dwlist .witem.hid .wtx b,.dwlist .witem.hid .wcode{color:var(--ink-3)}
.dwlist .witem.hid .witem-mute{opacity:.9;color:var(--ink-2);font-size:14px}
.sb-warn .wln.hid{opacity:1;color:var(--ink-3)!important;background:transparent!important;border-left-color:var(--edge-2)!important}
.sb-warn .wln.hid .wln-t{text-decoration:line-through;text-decoration-color:var(--ink-3)}
.sb-warn .wln.hid .wln-mute{opacity:.9;color:var(--ink-2);font-size:14px}
.daywarn.calm{background:var(--panel-2)!important;border-color:var(--edge)!important;color:var(--ink-2)!important}
.daywarn.calm b{color:var(--ink-2)!important}
`
const browser = await chromium.launch({ headless: true, ...(L.launchOptions || {}) }).catch(() => L.launch())
const errors = []
async function world(phone, who = 'a') {
  const ctx = await browser.newContext({ viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 900 }, deviceScaleFactor: 2, ...(phone ? { hasTouch: true, isMobile: true } : {}) })
  const p = await L.page(ctx, errors, phone ? 'ph' : 'dk')
  await L.signIn(p, who)
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  return { ctx, p }
}
const css = p => p.addStyleTag({ content: MOCK_CSS })
const pic = async (p, name, clip) => { await p.screenshot({ path: `${OUT}/${name}.png`, ...(clip ? { clip } : {}) }); console.log('PIC', name, clip ? JSON.stringify(clip) : '(viewport)') }
const openList = async (p, surf, di) => {
  const open = await p.evaluate(([s, i]) => { const b = document.querySelector(`${s} .day[data-day="${i}"] [data-dwbox="${i}"]`); return b ? b.classList.contains('open') : null }, [surf, di])
  if (open === false) { await p.locator(`${surf} .day[data-day="${di}"] [data-daywarn="${di}"]`).first().click(); await L.sleep(350) }
  return open
}
/* the day card from its top to the end of its warning list (+pad), as a clip */
const dayClip = (p, surf, di, pad = 14) => p.evaluate(([s, i, pad]) => {
  const d = document.querySelector(`${s} .day[data-day="${i}"]`), b = d.querySelector(`[data-dwbox="${i}"]`) || d.querySelector('.signs, .signoff') || d
  const r = d.getBoundingClientRect(), rb = b.getBoundingClientRect()
  const x = Math.max(0, r.left - 6), y = Math.max(0, r.top - 6)
  return { x, y, width: Math.min(window.innerWidth - x, r.width + 12), height: Math.min(window.innerHeight - y, rb.bottom - y + pad) }
}, [surf, di, pad])

/* ---- the edits that make NEW ---- */
/* the week's list: the line back where it was (its place is its index), struck; the count without it; the fold gone */
const newWeekList = (p, surf, di, ix, { button = true, allHidden = false } = {}) => p.evaluate(([s, di, ix, button, allHidden]) => {
  const box = document.querySelector(`${s} .day[data-day="${di}"] [data-dwbox="${di}"]`), list = box.querySelector('.dwlist'), bar = box.querySelector('.daywarn')
  list.querySelectorAll('.wmuted-h, .witem.muted').forEach(e => e.remove())
  list.querySelectorAll(`.witem[data-wix="${ix}"]`).forEach(e => e.remove())   // View-only Sched lists it live today
  const w = window.WARN.byDay[di].warns[ix], P = window.PEOPLE
  const names = (w.who || []).map(id => P[id] ? P[id].cs : id).join(', ')
  const esc = t => String(t).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
  const lbl = { LONGDAY: 'Long work day', OIL_UNPUBLISHED: 'OIL — day not published' }[w.code] || w.code
  const row = document.createElement('div')
  row.className = `witem ${w.sev} hid`; row.title = 'Hidden — tap ↺ to flag it again'
  row.innerHTML = `<span class="wbar"></span><span class="wtx"><span class="wcode">${esc(lbl)}</span><b>${esc(names)}</b>${names ? ' — ' : ''}${esc(w.msg || '')}</span>` + (button ? `<button class="witem-mute" title="Flag this again">↺</button>` : '')
  const live = [...list.querySelectorAll('.witem')]
  const after = live.filter(e => +e.dataset.wix > ix)[0]
  if (after) list.insertBefore(row, after); else { const tail = list.querySelector('.dwecho, .dwclear'); if (tail) list.insertBefore(row, tail); else list.appendChild(row) }
  const shown = window.WARN.byDay[di].warns.filter((_, i) => i !== ix), nh = shown.filter(x => x.sev === 'hard').length
  const cue = bar.querySelector('.dwcue').outerHTML, car = bar.querySelector('.dwcar').outerHTML
  if (allHidden || !shown.length) { bar.className = 'daywarn calm'; bar.innerHTML = `<b>✓ No issues</b> · ${cue}${car}` }
  else { bar.className = 'daywarn ' + (nh ? 'hard' : shown.some(x => x.sev === 'adv') ? 'adv' : 'note'); bar.innerHTML = `<b>⚠ ${shown.length} issue${shown.length > 1 ? 's' : ''}</b>${nh ? ` · ${nh} warning` : ''} · ${cue}${car}` }
}, [surf, di, ix, button, allHidden])
/* the board's list */
const newBoardList = (p, di, ix) => p.evaluate(([di, ix]) => {
  const wrap = document.querySelector('#schedBoard .sb-warn .sbwrap'), bar = wrap.querySelector('.wh')
  wrap.querySelectorAll('.wmuted-h, .wln.muted').forEach(e => e.remove())
  const w = window.WARN.byDay[di].warns[ix], P = window.PEOPLE
  const names = (w.who || []).map(id => P[id] ? P[id].cs : id).join(', ')
  const esc = t => String(t).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
  const row = document.createElement('div')
  row.className = `wln ${w.sev} hid`; row.title = 'Hidden — tap ↺ to flag it again'
  row.innerHTML = `<span class="wln-t">${esc(names)}${names ? ' — ' : ''}${esc(w.msg || '')}</span><button class="wln-mute" title="Flag this again">↺</button>`
  const after = [...wrap.querySelectorAll('.wln[data-wix]')].filter(e => +e.dataset.wix > ix)[0]
  if (after) wrap.insertBefore(row, after); else wrap.appendChild(row)
  const shown = window.WARN.byDay[di].warns.filter((_, i) => i !== ix), nh = shown.filter(x => x.sev === 'hard').length
  const car = bar.querySelector('.sbw-car').outerHTML, cue = (bar.querySelector('.dwcue') || { outerHTML: '' }).outerHTML
  bar.innerHTML = `${car}<b>⚠ ${shown.length} issue${shown.length > 1 ? 's' : ''}</b>${nh ? ` · ${nh} warning${nh > 1 ? 's' : ''}` : ''} · ${cue}`
}, [di, ix])
/* the man's pucks on that day: no ring, no chip — wherever the day draws him (the schedule and the crew list beside it) */
const plainPucks = (p, scopeSel, who) => p.evaluate(([s, who]) => {
  let n = 0
  document.querySelectorAll(s).forEach(sc => sc.querySelectorAll(`.puck[data-person="${who}"]`).forEach(pk => {
    pk.classList.remove('warn', 'note', 'adv', 'hard', 'wfoc', 'boxred'); pk.querySelectorAll('.lchip').forEach(c => c.remove())
    pk.title = (pk.title || '').replace(/ · Long work day.*$/, ''); n++
  }))
  return n
}, [scopeSel, who])
/* a clip round the row that holds his puck in a scope */
const puckRowClip = (p, scopeSel, who) => p.evaluate(([s, who]) => {
  const sc = document.querySelector(s); if (!sc) return null
  const pk = [...sc.querySelectorAll(`.puck[data-person="${who}"]`)].find(e => e.offsetParent && !e.closest('.palette, .pal, .sb-side, .crewpal, #crewPal'))
  if (!pk) return null
  pk.scrollIntoView({ block: 'center', inline: 'nearest' })
  let row = pk.closest('.form') || pk.closest('tr') || pk.closest('.sb-line, .sb-arow, .gline, .line, .acrow, .arow') || pk.parentElement
  const chain = []; for (let e = pk; e && chain.length < 9; e = e.parentElement) chain.push(e.tagName.toLowerCase() + '.' + String(e.className).split(' ').slice(0, 3).join('.'))
  const r = row.getBoundingClientRect()
  return { chain, clip: { x: Math.max(0, r.left - 4), y: Math.max(0, r.top - 6), width: Math.min(window.innerWidth - Math.max(0, r.left - 4), r.width + 8), height: Math.min(r.height + 12, 260) } }
}, [scopeSel, who])

for (const phone of [false, true]) {
  const T = phone ? 'ph' : 'dk'
  /* ================= Edit Schedule ================= */
  {
    const { ctx, p } = await world(phone)
    await L.go(p, 'editsched'); await W.showDay(p, TUE); await openList(p, '#eWeek', TUE)
    await pic(p, `${T}-1-week-before`, await dayClip(p, '#eWeek', TUE))
    const pr0 = await puckRowClip(p, `#eWeek .day[data-day="${TUE}"]`, WHO); console.log('puck chain', JSON.stringify(pr0 && pr0.chain))
    if (pr0) await pic(p, `${T}-3-puck-today`, pr0.clip)
    await W.showDay(p, TUE)
    /* the app's own ✕ on Static's line (the last of the four) */
    await p.locator(`#eWeek .day[data-day="${TUE}"] [data-woff="${TUE}.3"]`).first().click(); await L.sleep(500)
    await pic(p, `${T}-1-week-today`, await dayClip(p, '#eWeek', TUE))
    await css(p)
    await newWeekList(p, '#eWeek', TUE, 3)
    const n = await plainPucks(p, `#eWeek .day[data-day="${TUE}"], .palette, #crewPal, .crewpal, .sb-side`, WHO); console.log('pucks made plain (week)', n)
    await L.sleep(200)
    await pic(p, `${T}-1-week-new`, await dayClip(p, '#eWeek', TUE))
    const pr1 = await puckRowClip(p, `#eWeek .day[data-day="${TUE}"]`, WHO)
    if (pr1) await pic(p, `${T}-3-puck-new`, pr1.clip)
    await ctx.close()
  }
  /* ================= the Scheduler Board ================= */
  {
    const { ctx, p } = await world(phone)
    await L.go(p, 'editsched'); await W.boardOn(p, TUE); await L.sleep(500)
    const openPhone = async () => { if (!phone) return; const o = await p.evaluate(() => document.querySelector('#schedBoard .sbwrap').classList.contains('open')); if (!o) { await p.locator('#schedBoard [data-sbwtog]').first().click(); await L.sleep(300) } }
    await openPhone()
    await p.locator(`#schedBoard [data-woff="${TUE}.3"]`).first().click(); await L.sleep(500)
    await openPhone()
    const clip = await p.evaluate(phone => {
      const w = document.querySelector('#schedBoard .sb-warn'), r = w.getBoundingClientRect()
      if (phone) return { x: 0, y: 0, width: window.innerWidth, height: Math.min(window.innerHeight, r.bottom + 70) }
      const x = Math.max(0, r.left - 330); return { x, y: 0, width: window.innerWidth - x, height: Math.min(window.innerHeight, r.bottom + 150) }
    }, phone)
    await pic(p, `${T}-2-board-today`, clip)
    await css(p)
    await newBoardList(p, TUE, 3)
    const n = await plainPucks(p, '#schedBoard', WHO); console.log('pucks made plain (board)', n)
    await L.sleep(200)
    await pic(p, `${T}-2-board-new`, clip)
    await ctx.close()
  }
  /* ================= View-only Sched — what everyone else sees, once the day is published ================= */
  {
    const { ctx, p } = await world(phone)
    await L.go(p, 'editsched'); await W.showDay(p, TUE)
    const signed = await W.signDay(p, TUE), pub = await W.publishDay(p, TUE)
    console.log('signed', JSON.stringify(signed), 'published', JSON.stringify(pub), 'head', JSON.stringify(await W.head(p, TUE)))
    await L.go(p, 'viewsched'); await W.showDay(p, TUE, '#vWeek'); await openList(p, '#vWeek', TUE)
    await pic(p, `${T}-5-view-today`, await dayClip(p, '#vWeek', TUE))
    await css(p)
    await newWeekList(p, '#vWeek', TUE, 3, { button: false })
    await plainPucks(p, `#vWeek .day[data-day="${TUE}"]`, WHO)
    await L.sleep(200)
    await pic(p, `${T}-5-view-new`, await dayClip(p, '#vWeek', TUE))
    await ctx.close()
  }
  /* ================= every issue of a day hidden (Saturday has one) ================= */
  {
    const { ctx, p } = await world(phone)
    await L.go(p, 'editsched'); await W.showDay(p, SAT); await openList(p, '#eWeek', SAT)
    await p.locator(`#eWeek .day[data-day="${SAT}"] [data-woff="${SAT}.0"]`).first().click(); await L.sleep(500)
    await openList(p, '#eWeek', SAT)
    await pic(p, `${T}-4-allhidden-today`, await dayClip(p, '#eWeek', SAT))
    await css(p)
    await newWeekList(p, '#eWeek', SAT, 0, { allHidden: true })
    await L.sleep(200)
    await pic(p, `${T}-4-allhidden-new`, await dayClip(p, '#eWeek', SAT))
    await ctx.close()
  }
}
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
