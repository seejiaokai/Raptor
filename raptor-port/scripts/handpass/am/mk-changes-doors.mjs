/* THE MOCK-UP for how the ONE changes window is opened (D168–D170, 25 Sep 26): his "How do open up changes" → "Show me".
   Two doors, the same on every page, each ringed in gold in the pictures:
     1 the count in the day's heading ("4 new ▾" not yet published / "3 pending ▾" published / a member's "3 changes ▾")
       → the window on THAT day, "New to you"
     2 a "Changes" button in the top bar (it replaces "Edit history"; the clock icon on a phone) with a count of what is new
       → the window on the day in view, "All changes"
   e  Rune (admin) on Edit Schedule        m  Echo (member) on View-only Sched, Monday's live working copy
   Drawn on the real app (the demo week, the production build); everything proposed is injected just before each picture;
   nothing is saved to the app.
   Usage, with the build served on :4173:  node mk-changes-doors.mjs desktop  |  node mk-changes-doors.mjs phone */
import { mkdirSync } from 'node:fs'
const W = process.argv[2] || 'desktop'
const DPR = W === 'phone' ? 3 : 2
const SIZE = W === 'phone' ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/mock/img/changes-doors'
process.env.HP_SHOTS = OUT
mkdirSync(OUT, { recursive: true })
const L = await import('./w2-lib.mjs')
const { openHi, editWeek, signDay, publishDay, go } = L
const { browser, page, errors } = await openHi({ ...SIZE, state: null, dpr: DPR })
await editWeek(page)
await signDay(page, 0); await publishDay(page, 0)

const CSS = `.mk-door{outline:2.5px solid #E5C24A!important;outline-offset:3px;border-radius:10px}
.mk-badge{display:inline-flex;align-items:center;justify-content:center;min-width:17px;height:17px;padding:0 4px;margin-left:6px;border-radius:9px;
  background:#E5C24A;color:#08131b;font-size:10.5px;font-weight:900}
.mk-ibadge{position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;padding:0 3px;border-radius:8px;background:#E5C24A;color:#08131b;
  font-size:10px;font-weight:900;display:flex;align-items:center;justify-content:center}
.mk-acct{display:flex;align-items:center;gap:8px;padding:6px 12px;border:1px solid var(--edge-2);border-radius:10px;background:var(--panel-2);font-weight:800;font-size:13px;color:var(--ink)}
.mk-acct i{font-style:normal;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3,#8B96A1);font-weight:700}
.mk-acct b{font-size:10px;padding:2px 6px;border-radius:6px;background:rgba(59,198,232,.14);color:var(--accent,#3BC6E8)}
.mk-num{position:fixed;z-index:500;width:26px;height:26px;border-radius:13px;background:#E5C24A;color:#08131b;font-weight:900;font-size:14px;
  display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.5)}`

async function stage(k) {
  return page.evaluate(([k, css, W]) => {
    const s = document.createElement('style'); s.dataset.mk = '1'; s.textContent = css; document.head.appendChild(s)
    const toast = document.getElementById('toastEl'); if (toast) toast.style.display = 'none'
    const member = k === 'm'
    if (member) [...document.querySelectorAll('.topbar button, header button')].filter(b => /^\s*ADMIN\s*$/i.test(b.textContent || '')).forEach(b => { b.style.display = 'none' })
    const a = document.querySelector('.acct'); if (a) a.innerHTML = member ? `<div class="mk-acct"><i>Signed in</i><span>Echo</span><b>Member</b></div>` : `<div class="mk-acct"><i>Signed in</i><span>Rune</span><b>Admin</b></div>`
    const icon = document.querySelector('#histBtn .bi') ? document.querySelector('#histBtn .bi').innerHTML : '&#9719;'
    const n = member ? 3 : 4
    /* door 2 — the top bar's Changes button */
    let top = document.querySelector('#histBtn')
    if (!top) {
      const host = document.querySelector('.acct')
      host.insertAdjacentHTML('beforebegin', `<button class="abtn hbtn" id="mkChanges"><span class="bi">${icon}</span><span class="bl"> Changes</span></button>`)
      top = document.querySelector('#mkChanges')
    } else {
      const bl = top.querySelector('.bl'); if (bl) bl.textContent = ' Changes'
    }
    top.style.position = 'relative'
    if (top.querySelector('.bl') && getComputedStyle(top.querySelector('.bl')).display !== 'none') top.insertAdjacentHTML('beforeend', `<span class="mk-badge">${n}</span>`)
    else top.insertAdjacentHTML('beforeend', `<span class="mk-ibadge">${n}</span>`)
    top.classList.add('mk-door')
    /* door 1 — the count in the day's heading */
    const day = document.querySelector(member ? '#vWeek .day[data-day="0"]' : '#eWeek .day[data-day="1"]')
    const chip = `<button class="dpend dpendbtn mk-door" id="mkChip">${member ? '3&nbsp;changes' : '4&nbsp;new'}</button>`
    if (member) {
      day.querySelectorAll('select').forEach(sel => { const o = sel.options[sel.selectedIndex]; if (o && /Original/.test(o.text)) o.text = 'Live working copy' })
      const sel = day.querySelector('select'); sel ? sel.insertAdjacentHTML('afterend', chip) : day.querySelector('.day-head').insertAdjacentHTML('beforeend', chip)
    } else {
      const tpl = [...day.querySelectorAll('button')].find(b => /Templates/.test(b.textContent || ''))
      tpl && tpl.insertAdjacentHTML('afterend', chip)
    }
    /* the two numbered markers */
    const put = (el, t) => { const r = el.getBoundingClientRect(); document.body.insertAdjacentHTML('beforeend', `<div class="mk-num" style="left:${Math.max(4, r.left - 16)}px;top:${Math.max(4, r.top - 16)}px">${t}</div>`) }
    put(document.querySelector('#mkChip'), '1'); put(top, '2')
    return null
  }, [k, CSS, W])
}
async function frame(k) {
  if (k === 'm') { await go(page, 'viewsched'); await page.waitForTimeout(500) }
  await page.evaluate((k) => {
    const d = document.querySelector(k === 'm' ? '#vWeek .day[data-day="0"]' : '#eWeek .day[data-day="1"]')
    d.scrollIntoView({ block: 'start', inline: 'start' })
    for (let i = 0; i < 20; i++) {
      const q = d.getBoundingClientRect(), hit = document.elementFromPoint(Math.max(1, q.left + 12), Math.max(1, q.top + 4))
      if (hit && (d === hit || d.contains(hit))) break
      window.scrollBy(0, -30)
    }
  }, k)
  await page.waitForTimeout(400)
  await page.evaluate(() => document.querySelectorAll('style[data-mk],.mk-num,#mkChip,#mkChanges,.mk-badge,.mk-ibadge').forEach(x => x.remove()))
  await stage(k)
  await page.waitForTimeout(250)
  const clip = await page.evaluate((k) => {
    const d = document.querySelector(k === 'm' ? '#vWeek .day[data-day="0"]' : '#eWeek .day[data-day="1"]').getBoundingClientRect()
    return { x: 0, y: 0, width: innerWidth, height: Math.min(innerHeight, Math.max(d.top + 190, 300)) }
  }, k)
  await page.screenshot({ path: `${OUT}/${W}-${k}.png`, clip })
}
await frame('e'); await frame('m')
console.log('errors', JSON.stringify(errors))
await browser.close()
