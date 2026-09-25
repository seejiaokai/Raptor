/* THE MOCK-UP for D167 (25 Sep 26): the changes list as a WINDOW — his "instead of a fixed bubble … an adjustable window
   that can be resized and moved around and the admin can still work on the schedule … when the admin clicks on the item,
   it brings the background view to that area of change but keeps the window open … for the phone … see what u can forgo
   or keep … hide the dropdown of each hand over … day and month … 25/9".
   Built in the ALL AVAIL window's own classes (D38–D41: `.availwin`, the six-dot grip, resizable) so it reads as the same
   kind of window. Rune is signed in (D166) and opens Tuesday (never published):
     d1 desktop — the window at the right: every hand over of the day with who and 25/9 date; the two new to him open, his
        own older one folded; the schedule behind stays usable
     d2 desktop — he tapped Outlaw: the schedule behind went to it and marks it; the window is still open, the line lit
     p1 phone — the window as the ALL AVAIL window's phone panel (full width, bottom, moves, no resize — D77)
     p2 phone — after a tap: the panel shrinks to a slim bar so the change shows; tap the bar to bring it back
   Everything proposed is injected just before each picture; nothing is saved to the app.
   Usage, with the build served on :4173:  node mk-handoff-window.mjs desktop  |  node mk-handoff-window.mjs phone */
import { mkdirSync } from 'node:fs'
const W = process.argv[2] || 'desktop'
const DPR = W === 'phone' ? 3 : 2
const SIZE = W === 'phone' ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/mock/img/handoff-window'
process.env.HP_SHOTS = OUT
mkdirSync(OUT, { recursive: true })
const L = await import('./w2-lib.mjs')
const { openHi, editWeek } = L
const { browser, page, errors } = await openHi({ ...SIZE, state: null, dpr: DPR })
await editWeek(page)

const CSS = `.seat[data-mkorig]{position:relative}
.seat[data-mkorig]::after{content:'ORIG';position:absolute;top:-5px;right:-3px;z-index:4;font-family:'Barlow Condensed','Inter Tight',sans-serif;
  font-size:7.5px;font-weight:800;letter-spacing:.02em;line-height:1;padding:0 2px;border-radius:4px;background:var(--panel);color:#F1F4F7;
  border:1px dotted #F1F4F7;pointer-events:none}
.seat.mk-flash .puck{box-shadow:0 0 0 3px rgba(229,194,74,.95),0 0 14px rgba(229,194,74,.55)!important}
.mk-acct{display:flex;align-items:center;gap:8px;padding:6px 12px;border:1px solid var(--edge-2);border-radius:10px;background:var(--panel-2);font-weight:800;font-size:13px;color:var(--ink)}
.mk-acct i{font-style:normal;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3,#8B96A1);font-weight:700}
.mk-acct b{font-size:10px;padding:2px 6px;border-radius:6px;background:rgba(59,198,232,.14);color:var(--accent,#3BC6E8)}
.availwin.mk-win{--awin-w:330px;--awin-h:560px}
.mk-win .win-sum{flex:0 0 auto;padding:8px 10px;background:var(--panel-2);border-bottom:1px solid var(--edge);font-size:12px;font-weight:700;color:var(--ink)}
.mk-win .win-sum small{display:block;font-weight:500;color:var(--ink-3,#8B96A1);font-size:10.5px;margin-top:1px}
.mk-win .mk-g{border:1px solid var(--edge);border-radius:9px;margin:0 0 8px;overflow:hidden}
.mk-win .mk-gh{display:flex;align-items:center;gap:6px;width:100%;padding:7px 9px;background:var(--panel-2);border:0;color:var(--ink);font:inherit;
  font-size:11.5px;font-weight:800;text-align:left;cursor:pointer}
.mk-win .mk-gh .car{color:var(--ink-3,#8B96A1);width:10px}
.mk-win .mk-gh .who{flex:1}
.mk-win .mk-gh .when{font-weight:600;color:var(--ink-3,#8B96A1)}
.mk-win .mk-gh .new{font-size:9.5px;font-weight:800;letter-spacing:.06em;padding:1px 6px;border-radius:6px;background:rgba(229,194,74,.16);color:#F2D699}
.mk-win .mk-it{display:grid;grid-template-columns:1fr auto;gap:0 8px;width:100%;padding:6px 10px;border:0;border-top:1px solid var(--edge);
  background:none;color:var(--ink);font:inherit;text-align:left;cursor:pointer}
.mk-win .mk-it .w{font-size:12.5px;font-weight:700}
.mk-win .mk-it .t{font-size:10.5px;color:var(--ink-3,#8B96A1);text-align:right}
.mk-win .mk-it .c{grid-column:1/-1;font-size:11.5px;color:#F2D699}
.mk-win .mk-it.on{background:rgba(229,194,74,.10);box-shadow:inset 3px 0 0 #E5C24A}
.mk-bar{position:fixed;z-index:410;left:12px;right:12px;bottom:12px;display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:12px;
  background:var(--panel);border:1px solid var(--edge-2);box-shadow:0 12px 30px rgba(0,0,0,.6);color:var(--ink);font-weight:800;font-size:13px}
.mk-bar .g{color:var(--ink-3,#8B96A1)} .mk-bar .n{flex:1} .mk-bar small{color:var(--ink-3,#8B96A1);font-weight:600}`

async function stage(opts) {
  return page.evaluate(([o, css]) => {
    document.querySelectorAll('style[data-mk],.mk-el,.mk-win,.mk-bar').forEach(x => x.remove())
    document.querySelectorAll('[data-mkorig]').forEach(x => x.removeAttribute('data-mkorig'))
    document.querySelectorAll('.mk-flash').forEach(x => x.classList.remove('mk-flash'))
    const s = document.createElement('style'); s.dataset.mk = '1'; s.textContent = css; document.head.appendChild(s)
    const a = document.querySelector('.acct'); if (a) a.innerHTML = `<div class="mk-acct"><i>Signed in</i><span>Rune</span><b>Admin</b></div>`
    const day = document.querySelector('#eWeek .day[data-day="1"]')
    const seats = [...day.querySelectorAll('.seat')].filter(x => x.querySelector('.puck') && x.offsetWidth)
    const hex = [seats[0], seats[2], seats[4]], saber = [seats[5]]
    ;[...hex, ...saber].forEach(x => x && x.setAttribute('data-mkorig', '1'))
    if (o.flash != null) hex[o.flash] && hex[o.flash].classList.add('mk-flash')
    const nm = x => { const p = x && (x.querySelector('.puck .nm') || x.querySelector('.puck')); return p ? p.textContent.trim() : '—' }
    const tpl = [...day.querySelectorAll('button')].find(b => /Templates/.test(b.textContent || ''))
    tpl && tpl.insertAdjacentHTML('afterend', `<button class="dpend dpendbtn mk-el">4&nbsp;new</button>`)
    const it = (n, who, when, on) => `<button class="mk-it${on ? ' on' : ''}"><span class="w">${n}</span><span class="t">${who} · ${when}</span><span class="c">changed here</span></button>`
    const grp = (who, when, n, open, isNew, rows) => `<div class="mk-g"><button class="mk-gh"><span class="car">${open ? '▾' : '▸'}</span><span class="who">${who} · ${n} change${n === 1 ? '' : 's'}</span>${isNew ? '<span class="new">NEW</span>' : ''}<span class="when">${when}</span></button>${open ? rows : ''}</div>`
    const body = grp('Saber', '25/9 16:30', 1, true, true, it(nm(saber[0]), 'Saber', '25/9 16:12'))
      + grp('Hex', '25/9 16:00', 3, true, true, hex.map((x, i) => it(nm(x), 'Hex', `25/9 15:${20 + i * 9}`, o.flash === i)).join(''))
      + grp('Rune (you)', '25/9 14:05', 12, false, false, '')
      + grp('Hex', '24/9 18:20', 7, false, false, '')
    if (o.bar) {
      document.body.insertAdjacentHTML('beforeend', `<div class="mk-bar"><span class="g">&#10303;</span><span class="n">Changes · 4 new <small>· showing ${nm(hex[o.flash])}</small></span><span>▴</span></div>`)
      return null
    }
    const w = document.createElement('div'); w.className = 'availwin mk-win'; w.setAttribute('role', 'dialog')
    w.innerHTML = `<div class="win-bar"><span class="win-grip">&#10303;</span><span class="win-ttl">Changes · Tuesday 14/7<small>Hand overs · not yet published</small></span><button class="win-x" title="Close">&#10005;</button></div>`
      + `<div class="win-sum">4 new to you<small>since your hand over 25/9 14:05 · tap a change to go to it</small></div>`
      + `<div class="win-body">${body}</div>`
    document.body.appendChild(w)
    return null
  }, [opts, CSS])
}
async function scrollTo(flash) {
  await page.evaluate((flash) => {
    const day = document.querySelector('#eWeek .day[data-day="1"]')
    day.scrollIntoView({ block: 'start', inline: 'start' })
    if (flash != null) {
      const seats = [...day.querySelectorAll('.seat')].filter(x => x.querySelector('.puck') && x.offsetWidth)
      const t = [seats[0], seats[2], seats[4]][flash]; t && t.scrollIntoView({ block: 'center', inline: 'nearest' })
    } else {
      for (let i = 0; i < 20; i++) {
        const q = day.getBoundingClientRect(), hit = document.elementFromPoint(Math.max(1, q.left + 12), Math.max(1, q.top + 4))
        if (hit && (day === hit || day.contains(hit))) break
        window.scrollBy(0, -30)
      }
    }
  }, flash)
  await page.waitForTimeout(300)
}
const snap = async (name) => page.screenshot({ path: `${OUT}/${W}-${name}.png` })
if (W === 'desktop') {
  await scrollTo(null); await stage({}); await page.waitForTimeout(200); await snap('d1')
  await scrollTo(1); await stage({ flash: 1 }); await page.waitForTimeout(200); await snap('d2')
} else {
  await scrollTo(null); await stage({}); await page.waitForTimeout(200); await snap('p1')
  await scrollTo(1); await stage({ flash: 1, bar: true }); await page.waitForTimeout(200); await snap('p2')
}
console.log('errors', JSON.stringify(errors))
await browser.close()
