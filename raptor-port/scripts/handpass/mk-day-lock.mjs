/* THE MOCK-UP FOR [DB-SYNC-MODEL] (29 Sep 26) — his rulings D355 (a scheduler edits a DAY by taking it — one day or
   several; others see "<callsign> – editing" and read it only; freed after 30 minutes idle; an admin can take it over)
   and D356 (idle = no change by the holder for 30 minutes, a warning at 25; saved as you go, "Done editing" releases;
   others' changes arrive every 30 seconds while the page is on screen, the Sync fast mode, a refresh by hand as the
   backup). Pictures of the REAL app (the production build, a fresh demo world) with the lock drawn into its own markup
   and classes (day, day-head, abtn, airpop, fastsync …) plus a few small new ones (dl-band, dl-pop) — so the look is
   the app's own. Nothing here is built: the lock arrives with the database adapter ([DB-STEP]). The page is
   docs/mock/day-lock.html. Run from raptor-port/ with the preview on 4187 (`raptor-daylock` in .claude/launch.json):
     PORT=4187 node scripts/handpass/mk-day-lock.mjs
   Saber (`ad`) is "you"; Ranger stands in for a second scheduler (the demo world has one admin — every scheduler is an
   admin in the app). A RECORD once the page is approved: re-running it on a later build draws into screens that may
   have moved. */
import { open, go, DESKTOP, PHONE } from '../itflow/lib.mjs'

const OUT = 'docs/mock/img/day-lock'
const k = await open(OUT)

const CSS = `
.dl-band{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 10px 10px;padding:7px 10px;border-radius:9px;
  font-size:12.5px;line-height:1.35;border:1px solid var(--edge-2);background:var(--panel-2);color:var(--ink-2)}
.dl-band b{color:var(--ink);font-weight:700}
.dl-band .sp{flex:1}
.dl-band .ic{font-size:13px}
.dl-band.mine{border-color:var(--accent);background:rgba(59,198,232,.10)}
.dl-band.mine b{color:var(--accent)}
.dl-band.other{border-color:var(--adv);background:rgba(229,168,59,.10)}
.dl-band.other b{color:var(--adv)}
.dl-band .abtn{padding:5px 11px;font-size:12px}
.dl-band .abtn.amber{border-color:var(--adv);color:var(--adv)}
.day.dl-other{box-shadow:inset 0 0 0 1px var(--adv)}
.day.dl-other .day-body{opacity:.62}
.day.dl-mine{box-shadow:inset 0 0 0 1px var(--accent)}
.sb-boardwrap.dl-other > :not(.dl-band){opacity:.62}
.dl-pop{position:fixed;z-index:470;background:var(--panel);border:1px solid var(--edge-2);border-radius:12px;
  box-shadow:0 20px 50px -20px rgba(0,0,0,.8);padding:6px;width:300px;font-size:13px;color:var(--ink)}
.dl-pop .h{font-weight:700;padding:7px 9px 9px;border-bottom:1px solid var(--edge);margin-bottom:4px;display:flex;align-items:center}
.dl-pop .h small{margin-left:auto;font-weight:400;color:var(--ink-3);font-size:11.5px}
.dl-pop label{display:flex;align-items:center;gap:10px;padding:7px 9px;border-radius:8px}
.dl-pop label .st{margin-left:auto;font-size:12px;color:var(--ink-3)}
.dl-pop label.held .st{color:var(--adv)}
.dl-pop label.mine .st{color:var(--accent)}
.dl-pop label.held{color:var(--ink-3)}
.dl-pop input{accent-color:var(--accent);width:16px;height:16px;margin:0}
.dl-pop .f{display:flex;gap:8px;align-items:center;padding:9px 9px 5px;border-top:1px solid var(--edge);margin-top:4px}
.dl-pop .f .sp{flex:1}
.dl-pop .row{display:flex;gap:10px;align-items:center;padding:8px 9px;border-radius:8px;color:var(--ink-2)}
.dl-pop .row b{color:var(--ink)}
.dl-pop .sw{margin-left:auto;width:34px;height:20px;border-radius:10px;background:var(--raised);border:1px solid var(--edge-2);position:relative;flex:none}
.dl-pop .sw::after{content:"";position:absolute;left:2px;top:2px;width:14px;height:14px;border-radius:50%;background:var(--ink-3)}
.dl-pop .gdot{width:8px;height:8px;border-radius:50%;background:var(--ok);flex:none}
.dl-hint{font-size:12px;color:var(--ink-3);padding:2px 9px 6px}
`

async function page(phone) {
  const p = await k.fresh('ad', { viewport: phone ? PHONE : DESKTOP, scale: 2, phone })
  await p.addStyleTag({ content: CSS + '*{scroll-behavior:auto !important}' })
  await go(p, 'editsched')
  return p
}

/* the lock's band, under a day's head on Edit Schedule */
const band = (p, di, kind, extra = {}) => p.evaluate(([di, kind, extra]) => {
  const day = document.querySelector(`#eWeek section.day[data-day="${di}"]`)
  if (!day) throw new Error('no day ' + di)
  day.querySelector('.dl-band')?.remove()
  day.classList.remove('dl-mine', 'dl-other')
  const dow = day.querySelector('.day-head .dow')?.textContent || ''
  const b = document.createElement('div')
  b.className = 'dl-band ' + kind
  if (kind === 'mine') {
    b.innerHTML = `<span class="ic">✎</span><b>You're editing</b><span>· saved as you go</span><span class="sp"></span><button class="abtn primary">Done editing</button>`
    day.classList.add('dl-mine')
  } else if (kind === 'other') {
    b.innerHTML = `<span class="ic">🔒</span><b>${extra.who || 'Ranger'} – editing</b><span>· read only · last change ${extra.ago || '4 min'} ago</span><span class="sp"></span>`
      + (extra.take === false ? '' : `<button class="abtn amber">Take over</button>`)
    day.classList.add('dl-other')
  } else {
    b.innerHTML = `<span>No one is editing ${dow}</span><span class="sp"></span><button class="abtn">✎ Edit ${dow}</button>`
  }
  day.querySelector('.day-body').before(b)
}, [di, kind, extra])

/* the same band on the board, above its sign-off */
const boardBand = (p, kind, extra = {}) => p.evaluate(([kind, extra]) => {
  const w = document.querySelector('#schedBoard .sb-boardwrap')
  w.querySelector('.dl-band')?.remove(); w.classList.remove('dl-other')
  const dow = (document.getElementById('sbDay')?.firstChild?.textContent || '') + 'day'
  const b = document.createElement('div')
  b.className = 'dl-band ' + kind
  b.style.margin = '10px 12px 4px'
  if (kind === 'mine') b.innerHTML = `<span class="ic">✎</span><b>You're editing ${dow}</b><span>· saved as you go</span><span class="sp"></span><button class="abtn primary">Done editing</button>`
  else if (kind === 'other') { b.innerHTML = `<span class="ic">🔒</span><b>${extra.who || 'Ranger'} – editing</b><span>· read only · last change ${extra.ago || '4 min'} ago</span><span class="sp"></span><button class="abtn amber">Take over</button>`; w.classList.add('dl-other') }
  else b.innerHTML = `<span>No one is editing ${dow}</span><span class="sp"></span><button class="abtn primary">✎ Edit ${dow}</button>`
  w.prepend(b)
}, [kind, extra])

/* the app's own dialog (.airpop — the Sort all confirm's markup) */
const dialog = (p, title, body, foot) => p.evaluate(([title, body, foot]) => {
  document.getElementById('dlPop')?.remove()
  const d = document.createElement('div')
  d.className = 'airpop'; d.id = 'dlPop'
  d.innerHTML = `<div class="airpop-box" style="width:460px"><div class="airpop-head"><b>${title}</b><span style="flex:1"></span><button class="x">✕</button></div>`
    + `<div class="airpop-body" style="line-height:1.5">${body}</div><div class="airpop-foot"><span style="flex:1"></span>${foot}</div></div>`
  document.body.append(d)
}, [title, body, foot])

/* "Edit days…" — one button in the filters row, and its list of the week's days */
const editDaysBtn = (p, phone) => p.evaluate((phone) => {
  const f = document.querySelector('#page-editsched .filters')
  const sb = f.querySelector('.searchbox')
  const b = document.createElement('button')
  b.className = 'abtn'; b.id = 'dlEditDays'
  b.style.cssText = 'height:32px;padding:0 12px;margin-right:8px;border-color:var(--accent);color:var(--accent);flex:none'
  b.textContent = phone ? '✎ Days' : '✎ Edit days…'
  sb.parentElement.insertBefore(b, sb)
}, phone)
const editDaysPop = (p, rows) => p.evaluate((rows) => {
  const b = document.getElementById('dlEditDays').getBoundingClientRect()
  const d = document.createElement('div')
  d.className = 'dl-pop'
  d.style.top = (b.bottom + 6) + 'px'
  d.style.left = Math.max(8, Math.min(b.left, innerWidth - 308)) + 'px'
  d.innerHTML = `<div class="h">Edit which days?<small>week of 13 Jul</small></div>`
    + rows.map(r => `<label class="${r.cls || ''}"><input type="checkbox" ${r.on ? 'checked' : ''} ${r.cls === 'held' || r.cls === 'mine' ? 'disabled' : ''}>${r.day}<span class="st">${r.st}</span></label>`).join('')
    + `<div class="f"><button class="abtn ghost">Done editing all mine</button><span class="sp"></span><button class="abtn primary">Edit 2 days</button></div>`
  document.body.append(d)
}, rows)
const WEEK = [
  { day: 'Mon 13', st: 'you', cls: 'mine', on: true },
  { day: 'Tue 14', st: 'Ranger – editing', cls: 'held' },
  { day: 'Wed 15', st: 'free', on: true },
  { day: 'Thu 16', st: 'free', on: true },
  { day: 'Fri 17', st: 'free' },
  { day: 'Sat 18', st: 'free' },
  { day: 'Sun 19', st: 'free' },
]

/* the Sync chip: "Sync · 30 s", and what tapping it opens */
const syncPop = (p, chipId) => p.evaluate((chipId) => {
  for (const id of ['syncLbl', 'sbSyncLbl']) { const l = document.getElementById(id); if (l) l.textContent = 'Sync · 30 s' }
  const c = document.getElementById(chipId).getBoundingClientRect()
  const d = document.createElement('div')
  d.className = 'dl-pop'
  d.style.top = (c.bottom + 6) + 'px'
  d.style.left = Math.max(8, Math.min(c.right - 300, innerWidth - 308)) + 'px'
  d.innerHTML = `<div class="h">Sync<small>checks every 30 s</small></div>`
    + `<div class="row"><span class="gdot"></span><span><b>Up to date</b> · checked 12 s ago</span></div>`
    + `<div class="row"><button class="abtn">↻ Refresh now</button></div>`
    + `<div class="row"><span><b>Fast sync</b> — every second, for publishing or a meeting</span><span class="sw"></span></div>`
    + `<div class="dl-hint">Others' changes arrive by themselves while this page is on screen.</div>`
  document.body.append(d)
}, chipId)

const shot = (p, id, crop) => k.shot(p, id, crop)
const W = DESKTOP.width, H = DESKTOP.height, PW = PHONE.width, PH = PHONE.height
/* bring day `di` to the front of the week sideways, and the page back to its top (the day's name and the filters row
   in the picture) */
const toDay = (p, di) => p.evaluate((di) => {
  const d = document.querySelector(`#eWeek section.day[data-day="${di}"]`)
  let s = d?.parentElement
  while (s && !(s.scrollWidth > s.clientWidth + 4 && /auto|scroll/.test(getComputedStyle(s).overflowX))) s = s.parentElement
  if (s && d) s.scrollLeft = d.offsetLeft - (s === d.parentElement ? 0 : d.parentElement.offsetLeft)
  scrollTo(0, 0); document.scrollingElement && (document.scrollingElement.scrollTop = 0)
}, di)

/* ================= desktop ================= */
{
  const p = await page(false)
  /* 1 — the week: Monday is mine, Tuesday Ranger's */
  await band(p, 0, 'mine'); await band(p, 1, 'other')
  await p.waitForTimeout(200)
  await shot(p, 'd1-week', { x: 0, y: 0, w: W, h: 620 })
  /* 2 — a free day, and "Edit days…" open */
  await band(p, 0, 'free'); await band(p, 1, 'free')
  await editDaysBtn(p, false)
  await p.waitForTimeout(150)
  await shot(p, 'd2-free', { x: 0, y: 0, w: W, h: 620 })
  await band(p, 0, 'mine'); await band(p, 1, 'other')
  await editDaysPop(p, WEEK)
  await p.waitForTimeout(150)
  await shot(p, 'd3-editdays', { x: 0, y: 0, w: W, h: 620 })
  await p.evaluate(() => document.querySelectorAll('.dl-pop').forEach(e => e.remove()))
  /* 4 — the warning at 25 minutes */
  await dialog(p, 'Still editing Monday?',
    `No change on Monday for <b>25 minutes</b>. In <b>5 minutes</b> it frees itself, so another scheduler can take it.<br><br>Everything you changed is already saved.`,
    `<button class="abtn ghost">Done editing</button><button class="abtn primary">Keep editing</button>`)
  await p.waitForTimeout(150)
  await shot(p, 'd4-warn', { x: 0, y: 0, w: W, h: H })
  /* 5 — an admin takes Tuesday over */
  await dialog(p, 'Take over Tuesday from Ranger?',
    `Ranger took Tuesday at 09:12; last change <b>4 minutes ago</b>.<br><br>Everything Ranger changed is saved and stays. Ranger's screen turns read only, and Ranger is told you took over. The change history records it.`,
    `<button class="abtn ghost">Cancel</button><button class="abtn primary">Take over</button>`)
  await p.waitForTimeout(150)
  await shot(p, 'd5-takeover', { x: 0, y: 0, w: W, h: H })
  await p.evaluate(() => document.getElementById('dlPop')?.remove())
  /* 6 — the Sync chip and its menu */
  await syncPop(p, 'fastSync')
  await p.waitForTimeout(150)
  await shot(p, 'd6-sync', { x: W - 760, y: 0, w: 760, h: 420 })
  await p.evaluate(() => document.querySelectorAll('.dl-pop').forEach(e => e.remove()))
  /* 7 — the board: Monday is mine */
  await p.evaluate(() => window.openScheduler(0)); await p.waitForSelector('#schedBoard'); await p.waitForTimeout(900)
  await p.evaluate(() => { const l = document.getElementById('sbSyncLbl'); if (l) l.textContent = 'Sync · 30 s' })
  await boardBand(p, 'mine')
  await p.waitForTimeout(200)
  await shot(p, 'd7-board-mine', { x: 0, y: 0, w: W, h: 560 })
  /* 8 — the board on Tuesday, Ranger's */
  await p.evaluate(() => document.querySelector('#sbDays [data-sbtab="1"]')?.click()); await p.waitForTimeout(700)
  await boardBand(p, 'other')
  await p.waitForTimeout(200)
  await shot(p, 'd8-board-other', { x: 0, y: 0, w: W, h: 560 })
  await p.context().close()
}

/* ================= phone ================= */
{
  const p = await page(true)
  await p.evaluate(() => { const s = document.scrollingElement; if (s) s.scrollTop = 0; document.querySelector('#shell')?.scrollTo?.(0, 0) })
  await toDay(p, 0)
  await band(p, 0, 'mine'); await band(p, 1, 'other', { take: true })
  await p.waitForTimeout(250)
  await shot(p, 'p1-mine', { x: 0, y: 0, w: PW, h: PH })
  await toDay(p, 1); await p.waitForTimeout(300)
  await shot(p, 'p2-other', { x: 0, y: 0, w: PW, h: PH })
  await toDay(p, 0); await p.waitForTimeout(200)
  await editDaysBtn(p, true); await editDaysPop(p, WEEK)
  await p.waitForTimeout(200)
  await shot(p, 'p3-editdays', { x: 0, y: 0, w: PW, h: PH })
  await p.evaluate(() => document.querySelectorAll('.dl-pop').forEach(e => e.remove()))
  await dialog(p, 'Still editing Monday?',
    `No change on Monday for <b>25 minutes</b>. In <b>5 minutes</b> it frees itself, so another scheduler can take it.<br><br>Everything you changed is already saved.`,
    `<button class="abtn ghost">Done editing</button><button class="abtn primary">Keep editing</button>`)
  await p.waitForTimeout(150)
  await shot(p, 'p4-warn', { x: 0, y: 0, w: PW, h: PH })
  /* what the holder sees when an admin takes the day: Ranger's own phone, drawn on this one */
  await toDay(p, 1); await band(p, 1, 'other', { who: 'Saber', ago: 'under a min', take: false })
  await dialog(p, 'Saber has taken over Tuesday',
    `Your changes up to 09:31 are saved. Tuesday is read only for you now.<br><br>Ask Saber, or wait until Tuesday is free, to edit it again.`,
    `<button class="abtn primary">OK</button>`)
  await p.waitForTimeout(150)
  await shot(p, 'p5-takenover', { x: 0, y: 0, w: PW, h: PH })
  await p.evaluate(() => document.getElementById('dlPop')?.remove())
  await toDay(p, 0); await band(p, 1, 'other', { take: true })
  await syncPop(p, 'fastSync')
  await p.waitForTimeout(150)
  await shot(p, 'p6-sync', { x: 0, y: 0, w: PW, h: 520 })
  await p.evaluate(() => document.querySelectorAll('.dl-pop').forEach(e => e.remove()))
  await p.evaluate(() => window.openScheduler(0)); await p.waitForSelector('#schedBoard'); await p.waitForTimeout(900)
  await boardBand(p, 'mine'); await p.waitForTimeout(200)
  await shot(p, 'p7-board-mine', { x: 0, y: 0, w: PW, h: PH })
  await p.evaluate(() => document.getElementById('sbNextDay')?.click()); await p.waitForTimeout(700)
  await boardBand(p, 'other'); await p.waitForTimeout(200)
  await shot(p, 'p8-board-other', { x: 0, y: 0, w: PW, h: PH })
  await p.context().close()
}

await k.close()
if (k.errors.length) console.log('page errors:', k.errors)
console.log('pictures:', Object.keys(k.manifest).join(' '))
