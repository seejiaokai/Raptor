/* THE MOCK-UP for D168 + D169 (25 Sep 26): ONE changes window for the whole app — his "One changes window makes sense",
   "Ok mock up please" (Group by: Who / Where) and "show it to the members as well from view only schedule and clicking on
   live working copy … full transparency" — and his open question: with or without a Hand over button?
     a  Rune (admin), Tuesday not yet published — WITHOUT Hand over: "New to you" tab, changes grouped by person and
        sitting, NEW until he marks them seen ("Mark all as seen"), a day picker; no button in the day head
     b  the same — WITH Hand over, for comparison: groups by hand over, the button in the day head, no "Mark all as seen"
     c  the "All changes" tab, grouped by WHERE (the day's own sections)
     d  a MEMBER (Echo) on View-only Sched, Monday published, looking at the live working copy: every change and who made
        it, read-only — including an admin taking himself off a weekend desk
   The window is the ALL AVAIL window's own pattern (D167). Drawn on the real app (the demo week, the production build);
   everything proposed is injected just before each picture; nothing is saved to the app.
   Usage, with the build served on :4173:  node mk-changes-window.mjs desktop  |  node mk-changes-window.mjs phone */
import { mkdirSync } from 'node:fs'
const W = process.argv[2] || 'desktop'
const DPR = W === 'phone' ? 3 : 2
const SIZE = W === 'phone' ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/mock/img/changes-window'
process.env.HP_SHOTS = OUT
mkdirSync(OUT, { recursive: true })
const L = await import('./w2-lib.mjs')
const { openHi, editWeek, signDay, publishDay, go } = L
const { browser, page, errors } = await openHi({ ...SIZE, state: null, dpr: DPR })
await editWeek(page)
await signDay(page, 0); await publishDay(page, 0)          // Monday published, for the member's view (d)

const CSS = `.seat[data-mkorig]{position:relative}
.seat[data-mkorig]::after{content:'ORIG';position:absolute;top:-5px;right:-3px;z-index:4;font-family:'Barlow Condensed','Inter Tight',sans-serif;
  font-size:7.5px;font-weight:800;letter-spacing:.02em;line-height:1;padding:0 2px;border-radius:4px;background:var(--panel);color:#F1F4F7;
  border:1px dotted #F1F4F7;pointer-events:none}
.mk-acct{display:flex;align-items:center;gap:8px;padding:6px 12px;border:1px solid var(--edge-2);border-radius:10px;background:var(--panel-2);font-weight:800;font-size:13px;color:var(--ink)}
.mk-acct i{font-style:normal;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3,#8B96A1);font-weight:700}
.mk-acct b{font-size:10px;padding:2px 6px;border-radius:6px;background:rgba(59,198,232,.14);color:var(--accent,#3BC6E8)}
.availwin.mk-win{--awin-w:360px;--awin-h:600px}
.mk-win .mk-tools{display:flex;flex-direction:column;gap:6px;padding:8px;border-bottom:1px solid var(--edge);background:var(--panel)}
.mk-win .mk-days{display:flex;gap:4px;flex-wrap:wrap}
.mk-win .mk-days span{font-size:10.5px;font-weight:800;padding:3px 7px;border-radius:7px;border:1px solid var(--edge);color:var(--ink-3,#8B96A1);position:relative}
.mk-win .mk-days span.on{border-color:var(--accent);color:var(--accent);background:rgba(59,198,232,.10)}
.mk-win .mk-days span.dot::after{content:'';position:absolute;top:-3px;right:-3px;width:7px;height:7px;border-radius:50%;background:#E5C24A}
.mk-win .mk-seg{display:flex;align-items:center;gap:6px;font-size:10.5px;color:var(--ink-3,#8B96A1);font-weight:700;letter-spacing:.04em;text-transform:uppercase}
.mk-win .mk-seg span{display:inline-flex;border:1px solid var(--edge-2);border-radius:8px;overflow:hidden}
.mk-win .mk-seg b{padding:3px 10px;color:var(--ink-2);font-size:11px;text-transform:none;letter-spacing:0}
.mk-win .mk-seg b.on{background:var(--accent);color:#08131b}
.mk-win .mk-g{border:1px solid var(--edge);border-radius:9px;margin:0 0 8px;overflow:hidden}
.mk-win .mk-gh{display:flex;align-items:center;gap:6px;width:100%;padding:7px 9px;background:var(--panel-2);border:0;color:var(--ink);font:inherit;font-size:11.5px;font-weight:800;text-align:left}
.mk-win .mk-gh .car{color:var(--ink-3,#8B96A1);width:10px}
.mk-win .mk-gh .who{flex:1}
.mk-win .mk-gh .when{font-weight:600;color:var(--ink-3,#8B96A1)}
.mk-win .mk-gh .new{font-size:9.5px;font-weight:800;letter-spacing:.06em;padding:1px 6px;border-radius:6px;background:rgba(229,194,74,.16);color:#F2D699}
.mk-win .mk-it{display:grid;grid-template-columns:1fr auto;gap:0 8px;width:100%;padding:6px 10px;border:0;border-top:1px solid var(--edge);background:none;color:var(--ink);font:inherit;text-align:left}
.mk-win .mk-it .w{font-size:12.5px;font-weight:700}
.mk-win .mk-it.unread .w::before{content:'';display:inline-block;width:7px;height:7px;border-radius:50%;background:#E5C24A;margin-right:6px;vertical-align:1px}
.mk-win .mk-it .t{font-size:10.5px;color:var(--ink-3,#8B96A1);text-align:right}
.mk-win .mk-it .c{grid-column:1/-1;font-size:11.5px;color:#F2D699}
.mk-win .mk-foot{flex:0 0 auto;display:flex;gap:8px;align-items:center;padding:8px;border-top:1px solid var(--edge);background:var(--panel)}
.mk-win .mk-foot button{flex:1;padding:7px;border-radius:9px;border:1px solid var(--edge-2);background:var(--panel-2);color:var(--ink);font-weight:800;font:inherit;font-size:12px}
.mk-win .mk-foot small{color:var(--ink-3,#8B96A1);font-size:10.5px}
.mk-vhead{display:inline-flex;margin-left:8px;font-size:11px;font-weight:800;padding:3px 8px;border-radius:7px;border:1px solid var(--edge-2);color:var(--ink)}`

const ROWS_TUE = n => ({
  hex: [[n[0], 'put on VL 1 front seat', '25/9 15:20'], [n[2], 'moved from RU to VL 2nd jet', '25/9 15:29'], [n[4], 'put on RU 1 front seat', '25/9 15:38']],
  saber: [[n[5], 'put on RU 1 back seat', '25/9 16:12']],
})
async function stage(k) {
  return page.evaluate(([k, css, W]) => {
    document.querySelectorAll('style[data-mk],.mk-el,.mk-win').forEach(x => x.remove())
    document.querySelectorAll('[data-mkorig]').forEach(x => x.removeAttribute('data-mkorig'))
    const s = document.createElement('style'); s.dataset.mk = '1'; s.textContent = css; document.head.appendChild(s)
    const member = k === 'd'
    const toast = document.getElementById('toastEl'); if (toast) toast.style.display = 'none'   // the "published" message from the set-up
    /* a member has no role switch: hide the ADMIN pill beside Logout */
    if (member) [...document.querySelectorAll('.topbar button, header button')].filter(b => /^\s*ADMIN\s*$/i.test(b.textContent || '')).forEach(b => { b.style.display = 'none' })
    const a = document.querySelector('.acct'); if (a) a.innerHTML = member ? `<div class="mk-acct"><i>Signed in</i><span>Echo</span><b>Member</b></div>` : `<div class="mk-acct"><i>Signed in</i><span>Rune</span><b>Admin</b></div>`
    const it = (n, what, who, when, unread) => `<div class="mk-it${unread ? ' unread' : ''}"><span class="w">${n}</span><span class="t">${who} · ${when}</span><span class="c">${what}</span></div>`
    const grp = (title, when, isNew, rows, open = true) => `<div class="mk-g"><div class="mk-gh"><span class="car">${open ? '▾' : '▸'}</span><span class="who">${title}</span>${isNew ? '<span class="new">NEW</span>' : ''}<span class="when">${when}</span></div>${open ? rows : ''}</div>`
    const days = (on) => `<div class="mk-days">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<span class="${d === on ? 'on' : ''}${d === 'Tue' || d === 'Mon' ? ' dot' : ''}">${d}</span>`).join('')}</div>`
    const seg = (who) => `<div class="mk-seg">Group by <span><b class="${who ? 'on' : ''}">Who</b><b class="${who ? '' : 'on'}">Where</b></span></div>`
    let title, sub, tabs, body, foot = ''
    if (member) {
      /* the day's own version picker, showing the live working copy (the peek D169 opens the history from) */
      const sel = document.querySelector('#vWeek .day[data-day="0"] select[data-dver]')
      if (sel) { const o = [...sel.options].find(x => /working|live/i.test(x.text)); if (o) sel.value = o.value; else { sel.insertAdjacentHTML('beforeend', '<option value="mk">Live working copy</option>'); sel.value = 'mk' } }
      title = 'Changes · Monday 13/7'; sub = 'Published · 3 changes waiting to go out as AL1'
      tabs = `<div class="win-tabs"><button class="win-tab">New to you <span class="c">3</span></button><button class="win-tab on">All changes <span class="c">3</span></button></div>`
      body = grp('Rune · 1 change', '25/9 09:12', true, it('SDO desk (Sat)', '<s>Rune</s> → <b>Hex</b>', 'Rune', '25/9 09:12', true))
        + grp('Hex · 2 changes', '25/9 08:40', true, it('MET + NOTAM BRIEF', '<s>08:15</s> → <b>08:30</b>', 'Hex', '25/9 08:40', true) + it('Warden', 'moved from MET + NOTAM BRIEF to SODB', 'Hex', '25/9 08:44', true))
      foot = `<div class="mk-foot"><small>Read only — every change and who made it, for everyone to see.</small></div>`
    } else {
      const day = document.querySelector('#eWeek .day[data-day="1"]')
      const seats = [...day.querySelectorAll('.seat')].filter(x => x.querySelector('.puck') && x.offsetWidth)
      const nm = x => { const p = x && (x.querySelector('.puck .nm') || x.querySelector('.puck')); return p ? p.textContent.trim() : '—' }
      const n = seats.map(nm)
      ;[seats[0], seats[2], seats[4], seats[5]].forEach(x => x && x.setAttribute('data-mkorig', '1'))
      const R = { hex: [[n[0], 'put on VL 1 front seat', '25/9 15:20'], [n[2], 'moved from RU to VL 2nd jet', '25/9 15:29'], [n[4], 'put on RU 1 front seat', '25/9 15:38']], saber: [[n[5], 'put on RU 1 back seat', '25/9 16:12']] }
      const rows = (arr, who, u) => arr.map(r => it(r[0], r[1], who, r[2], u)).join('')
      const tpl = [...day.querySelectorAll('button')].find(b => /Templates/.test(b.textContent || ''))
      tpl && tpl.insertAdjacentHTML('afterend', `<button class="dpend dpendbtn mk-el">4&nbsp;new</button>`)
      if (k === 'b') { const pub = day.querySelector('[data-beak="1"]'); pub && pub.insertAdjacentHTML('afterend', `<button class="dbeak dunpub mk-el">Hand over</button>`) }
      title = 'Changes · Tuesday 14/7'; sub = 'Not yet published'
      const newTab = k !== 'c'
      tabs = `<div class="win-tabs"><button class="win-tab${newTab ? ' on' : ''}">New to you <span class="c">4</span></button><button class="win-tab${newTab ? '' : ' on'}">All changes <span class="c">7</span></button></div>`
      if (k === 'a') {
        body = grp('Saber · 1 change', '25/9 16:12', true, rows(R.saber, 'Saber', true)) + grp('Hex · 3 changes', '25/9 15:20–15:38', true, rows(R.hex, 'Hex', true))
        foot = `<div class="mk-foot"><button>✓ Mark all as seen</button></div>`
      } else if (k === 'b') {
        body = grp('Saber · handed over · 1 change', '25/9 16:30', true, rows(R.saber, 'Saber', false)) + grp('Hex · handed over · 3 changes', '25/9 16:00', true, rows(R.hex, 'Hex', false))
          + grp('Rune (you) · handed over · 12 changes', '25/9 14:05', false, '', false)
      } else {
        body = grp('Flying waves · 4 changes', '', false, rows(R.hex, 'Hex', false) + rows(R.saber, 'Saber', false))
          + grp('Duties · 1 change', '', false, it('SDO desk', '<s>07:00</s> → <b>07:30</b>', 'Rune', '25/9 13:50', false))
          + grp('Common Programme · 1 change', '', false, it('MASS BRIEF', '<s>06:00</s> → <b>06:15</b>', 'Rune', '25/9 13:52', false))
          + grp('Requests · 1 change', '', false, it("Bane's Meeting", 'put on the programme', 'Rune', '25/9 13:58', false))
      }
    }
    const tools = `<div class="mk-tools">${days(member ? 'Mon' : 'Tue')}${seg(k !== 'c')}</div>`
    const w = document.createElement('div'); w.className = 'availwin mk-win'; w.setAttribute('role', 'dialog')
    w.innerHTML = `<div class="win-bar"><span class="win-grip">&#10303;</span><span class="win-ttl">${title}<small>${sub}</small></span><button class="win-x" title="Close">&#10005;</button></div>`
      + tabs + tools + `<div class="win-body">${body}</div>` + foot
    document.body.appendChild(w)
    return null
  }, [k, CSS, W])
}
async function frame(k) {
  if (k === 'd') { await go(page, 'viewsched'); await page.waitForTimeout(500) }
  await page.evaluate((k) => {
    const d = document.querySelector(k === 'd' ? '#vWeek .day[data-day="0"]' : '#eWeek .day[data-day="1"]')
    d.scrollIntoView({ block: 'start', inline: 'start' })
    for (let i = 0; i < 20; i++) {
      const q = d.getBoundingClientRect(), hit = document.elementFromPoint(Math.max(1, q.left + 12), Math.max(1, q.top + 4))
      if (hit && (d === hit || d.contains(hit))) break
      window.scrollBy(0, -30)
    }
  }, k)
  await page.waitForTimeout(300)
  await stage(k)
  await page.waitForTimeout(250)
  if (k === 'd') await page.evaluate(() => {
    /* the view page repaints its day heads after a moment: set the picker to the live working copy last */
    const head = document.querySelector('#vWeek .day[data-day="0"]')
    head.querySelectorAll('select').forEach(sel => { const o = sel.options[sel.selectedIndex]; if (o && /Original/.test(o.text)) o.text = 'Live working copy' })
    const tw = document.createTreeWalker(head, NodeFilter.SHOW_TEXT)
    for (let t = tw.nextNode(); t; t = tw.nextNode()) if (/Original — as issued/.test(t.nodeValue)) t.nodeValue = t.nodeValue.replace('Original — as issued', 'Live working copy')
  })
  await page.screenshot({ path: `${OUT}/${W}-${k}.png` })
}
for (const k of W === 'phone' ? ['a', 'd'] : ['a', 'b', 'c', 'd']) await frame(k)
console.log('errors', JSON.stringify(errors))
await browser.close()
