/* THE MOCK-UP for D99 (25 Sep 26, his ask: "can u work on having a clickable pending button to show what is currently
   pending? so that the scheduler dont need to search everywhere. And if they click on that area, it brings the view
   to that pending area"). Pictures of the REAL app (the production build, the everything-week): Monday is at AL1 with
   one change already waiting from the demo; three more are made through the app's own write path — Piston and Outlaw
   swap seats on the 19:20 RU line, and a remark changes on the 19:45 VL line. Then:
     1. the day head today — "N pending", nothing to tap;
     2. the proposal — "N pending ▾" opens a short list of what will go out: where, before → after, who and when;
     3. a tap on one item — the view goes to that seat and marks it for a moment.
   Each item's before/after is read from the app (the published version against the working copy); who/when is the
   app's own account name and clock for the changes made here, and blank for the change made before this session —
   the edit record is kept only while the page is open, which the page states. Nothing is saved to the app.
   Usage, with the build served on :4173:  node mk-pending-list.mjs desktop 1  |  node mk-pending-list.mjs phone 3 */
import { mkdirSync } from 'node:fs'
const W = process.argv[2] || 'desktop'
const DPR = Number(process.argv[3] || (W === 'phone' ? 3 : 1))
const SIZE = W === 'phone' ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/mock/img/pending-list'
process.env.HP_SHOTS = OUT
mkdirSync(OUT, { recursive: true })
const L = await import('./w2-lib.mjs')
const { openHi, editWeek, head, STATE } = L
const { browser, page, errors } = await openHi({ ...SIZE, state: STATE, dpr: DPR })
const MON = 0, DAY = `#eWeek .day[data-day="${MON}"]`

await editWeek(page)
const clock = () => new Date().toTimeString().slice(0, 5)
const made = await page.evaluate(() => {
  const ru = window.DAYS[0].waves[1].formations[1], piston = ru.aircraft[0].p, outlaw = ru.aircraft[1].p
  window.setSlotVal('0.1.1.0.p', outlaw); window.setSlotVal('0.1.1.1.p', piston)
  window.txtSet('fr:0.1.0.0', '1B: NIGHT BFM // TBC')
  window.afterSchedMutate()
  return true
})
await page.waitForTimeout(700)
const at = clock()
/* each waiting change: where, before (the published AL1) → after (the working copy), who, when */
const items = await page.evaluate((at) => {
  const P = window.PEOPLE, cs = v => (P[v] && P[v].cs) || v || '—'
  const al = window.SCHED.als.filter(a => a.di === 0).sort((a, b) => b.seq - a.seq)[0]
  const was = al.snap.d, now = window.DAYS[0]
  const who = 'Admin'      // today the record names the shared account; D95/[PENDING-SUMMARY] part 3 would put a callsign here
  const line = (d, gi, li) => { const w = d.waves[gi], f = w.formations[li]; return `${f.to || ''} ${f.cs || ''}`.trim() }
  return [
    { where: `${line(now, 0, 0)} line · take-off`, from: was.waves[0].formations[0].to, to: now.waves[0].formations[0].to, who: '', when: '', slot: '0.0.0.0.p' },
    { where: `${line(now, 1, 1)} line · jet 1 pilot`, from: cs(was.waves[1].formations[1].aircraft[0].p), to: cs(now.waves[1].formations[1].aircraft[0].p), who, when: at, slot: '0.1.1.0.p' },
    { where: `${line(now, 1, 1)} line · jet 2 pilot`, from: cs(was.waves[1].formations[1].aircraft[1].p), to: cs(now.waves[1].formations[1].aircraft[1].p), who, when: at, slot: '0.1.1.1.p' },
    { where: `${line(now, 1, 0)} line · jet 1 remarks`, from: was.waves[1].formations[0].aircraft[0].rmks, to: now.waves[1].formations[0].aircraft[0].rmks, who, when: at, slot: '0.1.0.0.p' },
  ]
}, at)
const h = await head(page, MON)
console.log(JSON.stringify({ pending: h.pending, tag: h.tag, items }, null, 1))

const CSS = `
.mk-pbtn{cursor:pointer}
.mk-pbtn::after{content:' ▾';font-size:9px}
.mk-plist{position:absolute;z-index:900;width:min(380px,calc(100vw - 24px));background:#14181D;border:1px solid #39424D;border-radius:10px;
  box-shadow:0 14px 34px -12px rgba(0,0,0,.8);padding:10px 10px 8px;font-family:'Inter Tight',system-ui,sans-serif}
.mk-ph{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;color:#F1F4F7;margin:0 2px 8px}
.mk-ph .verchip{font-family:'Barlow Condensed','Inter Tight',sans-serif;font-size:10px;font-weight:800;letter-spacing:.06em;padding:1px 6px;border-radius:5px;background:#E5C24A;color:#08131b}
.mk-pi{display:grid;grid-template-columns:1fr auto;gap:1px 10px;padding:7px 8px;border-radius:7px;cursor:pointer}
.mk-pi:hover,.mk-pi.on{background:rgba(229,194,74,.10)}
.mk-pi+.mk-pi{border-top:1px solid #2A313A}
.mk-pw{font-size:12px;font-weight:600;color:#F1F4F7}
.mk-pa{font-size:12px;color:#B6C0CB;grid-column:1/2}
.mk-pa s{color:#8A96A3}
.mk-pa b{color:#E5C24A;font-weight:600}
.mk-pwho{grid-column:2/3;grid-row:1/3;align-self:center;text-align:right;font-size:11px;color:#8A96A3;white-space:nowrap}
.mk-pfoot{font-size:10.5px;color:#8A96A3;margin:8px 4px 0}
.mk-hit{animation:mkhit 1.4s ease-out 1;border-radius:5px}
@keyframes mkhit{0%{box-shadow:0 0 0 3px #E5C24A}100%{box-shadow:0 0 0 3px rgba(229,194,74,.35)}}
.mk-hitrow{background:rgba(229,194,74,.08)!important}`
async function headShot(name, extraH = 0) {
  const box = await page.evaluate(([DAY, extraH]) => {
    const d = document.querySelector(DAY); d.scrollIntoView({ block: 'start', inline: 'center' })
    const bar = document.querySelector('.topbar'); window.scrollBy(0, -((bar ? bar.getBoundingClientRect().bottom : 0) + 10))
    const hd = d.querySelector('.day-head').getBoundingClientRect(), t = d.getBoundingClientRect()
    const pl = document.querySelector('.mk-plist'), pr = pl ? pl.getBoundingClientRect() : null
    const bottom = Math.max(hd.bottom + 8, pr ? pr.bottom + 10 : 0) + extraH
    return { x: t.left, y: t.top, w: Math.max(t.width, pr ? pr.right - t.left + 10 : 0), h: bottom - t.top }
  }, [DAY, extraH])
  await page.screenshot({ path: `${OUT}/${W}-${name}.png`, clip: { x: Math.max(0, box.x - 3), y: Math.max(0, box.y - 3), width: Math.min(SIZE.width - Math.max(0, box.x - 3), box.w + 6), height: box.h + 6 } })
  console.log('shot', name)
}
await headShot('1-today')
await page.evaluate(([DAY, CSS, items, n]) => {
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st)
  const d = document.querySelector(DAY), chip = d.querySelector('.dpend'); chip.classList.add('mk-pbtn')
  const r = chip.getBoundingClientRect()
  const list = document.createElement('div'); list.className = 'mk-plist'
  list.style.left = Math.max(12, Math.min(r.left + window.scrollX, window.innerWidth - 392)) + 'px'
  list.style.top = (r.bottom + window.scrollY + 6) + 'px'
  list.innerHTML = `<div class="mk-ph">Waiting to go out as <span class="verchip">AL2</span> · ${items.length} changes</div>`
    + items.map((it, i) => `<div class="mk-pi" data-i="${i}"><span class="mk-pw">${it.where}</span>`
      + `<span class="mk-pwho">${it.who ? `${it.who}<br>${it.when}` : 'earlier'}</span>`
      + `<span class="mk-pa"><s>${it.from || '—'}</s> → <b>${it.to || '—'}</b></span></div>`).join('')
    + `<div class="mk-pfoot">Tap a change to go to it.</div>`
  document.body.appendChild(list)
}, [DAY, CSS, items, items.length])
await headShot('2-list')
/* 3: a tap on the jet 1 pilot change — the view goes to the seat and marks it */
await page.evaluate((slot) => {
  document.querySelector('.mk-plist')?.remove()
  const s = document.querySelector(`#eWeek .day[data-day="0"] .seat[data-slot="${slot}"]`)
  s.scrollIntoView({ block: 'center', inline: 'center' })
  s.querySelector('.puck').classList.add('mk-hit')
  const row = s.closest('.acrow'); if (row) row.classList.add('mk-hitrow')
}, items[1].slot)
await page.waitForTimeout(250)
const fbox = await page.evaluate(() => { const f = document.querySelector('#eWeek .day[data-day="0"] .seat[data-slot="0.1.1.0.p"]').closest('.form'); const r = f.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } })
await page.screenshot({ path: `${OUT}/${W}-3-jump.png`, clip: { x: Math.max(0, fbox.x - 4), y: Math.max(0, fbox.y - 4), width: Math.min(SIZE.width, fbox.w + 8), height: fbox.h + 8 } })
console.log('shot 3-jump')
console.log('errors', JSON.stringify(errors))
await browser.close()
