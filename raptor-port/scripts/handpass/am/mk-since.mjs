/* THE MOCK-UP for D118's "Since" choice (25 Sep 26): his "What if there are multiple schedulers" → "Give me a mock up".
   Three schedulers share Tuesday (never published) under the one shared login: hand overs at 14:05, 16:00 (B's three
   changes) and 16:30 (your one). Scheduler C, away since 14:05, opens the day:
     f1 the default — the pending list shows the last hand over's work only (1), with a "Since" choice at its top
     f2 the "Since" menu open — every hand over of the day, who and when, and what each would show
     f3 C picks 14:05 — the count, the tags and the list widen to all four, grouped by hand over
     f4 the other option, for comparison: Hand over asks who is handing over (a callsign picker, as the sign-off has)
   Drawn on the real app (the demo week, the production build); everything proposed is injected just before each
   picture, in the app's own classes (the pending list, the plans menu); nothing is saved to the app.
   Usage, with the build served on :4173:  node mk-since.mjs desktop  |  node mk-since.mjs phone */
import { mkdirSync } from 'node:fs'
const W = process.argv[2] || 'desktop'
const DPR = W === 'phone' ? 3 : 2
const SIZE = W === 'phone' ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/mock/img/since'
process.env.HP_SHOTS = OUT
mkdirSync(OUT, { recursive: true })
const L = await import('./w2-lib.mjs')
const { openHi, editWeek } = L
const { browser, page, errors } = await openHi({ ...SIZE, state: null, dpr: DPR })
await editWeek(page)

const F = {
  f1: { chip: 1, since: '16:00', tags: 'a', list: 'a', menu: false, who: 'Admin' },
  f2: { chip: 1, since: '16:00', tags: 'a', list: 'a', menu: true, who: 'Admin' },
  f3: { chip: 4, since: '14:05', tags: 'ab', list: 'ab', menu: false, who: 'Admin' },
  f4: { chip: 1, since: '16:00', tags: 'a', list: null, menu: false, who: 'Hex', picker: true },
}
const CSS = `.seat[data-mkorig]{position:relative}
.seat[data-mkorig]::after{content:'ORIG';position:absolute;top:-5px;right:-3px;z-index:4;font-family:'Barlow Condensed','Inter Tight',sans-serif;
  font-size:7.5px;font-weight:800;letter-spacing:.02em;line-height:1;padding:0 2px;border-radius:4px;background:var(--panel);color:#F1F4F7;
  border:1px dotted #F1F4F7;pointer-events:none}
.mk-line .sl-h{color:#F1F4F7}
.pendlist .mk-grp{font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3,#8B96A1);margin:8px 4px 4px}
.pendlist .mk-since{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;margin:0 0 8px;padding:7px 10px;
  background:var(--panel-2);border:1px solid var(--edge-2);border-radius:9px;color:var(--ink);font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}
.pendlist .mk-since i{font-style:normal;color:var(--ink-3,#8B96A1);font-weight:600}
.wavemenu .wm.mk-on{border-color:var(--accent);color:var(--accent)}
.wavemenu .wm small{display:block;font-weight:600;color:var(--ink-3,#8B96A1);margin-top:2px}
.mk-pick{position:fixed;z-index:480;background:var(--panel);border:1px solid var(--edge-2);border-radius:12px;box-shadow:0 14px 34px rgba(0,0,0,.6);
  padding:12px;width:250px}
.mk-pick h5{margin:0 0 8px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3,#8B96A1)}
.mk-pick .mk-sel{display:flex;justify-content:space-between;align-items:center;border:1px solid var(--edge-2);border-radius:9px;padding:8px 10px;
  font-weight:700;background:var(--panel-2);margin-bottom:10px}
.mk-pick .mk-go{width:100%;padding:8px;border-radius:9px;border:1px solid var(--accent);background:rgba(59,198,232,.12);color:var(--accent);font-weight:800}`

async function stage(k) {
  const f = F[k]
  return page.evaluate(([f, css]) => {
    document.querySelectorAll('style[data-mk],.mk-el,#pendList,.wavemenu,.mk-pick').forEach(x => x.remove())
    document.querySelectorAll('[data-mkorig]').forEach(x => x.removeAttribute('data-mkorig'))
    const s = document.createElement('style'); s.dataset.mk = '1'; s.textContent = css; document.head.appendChild(s)
    const day = document.querySelector('#eWeek .day[data-day="1"]')
    const seats = [...day.querySelectorAll('.seat')].filter(x => x.querySelector('.puck') && x.offsetWidth)
    const B = [seats[0], seats[2], seats[4]], A = [seats[5]]
    if (f.tags.includes('a')) A.forEach(x => x && x.setAttribute('data-mkorig', '1'))
    if (f.tags.includes('b')) B.forEach(x => x && x.setAttribute('data-mkorig', '1'))
    const nm = x => { const p = x && (x.querySelector('.puck .nm') || x.querySelector('.puck')); return p ? p.textContent.trim() : '—' }
    const pub = day.querySelector('[data-beak="1"]')
    pub && pub.insertAdjacentHTML('afterend', `<button class="dbeak dunpub mk-el mk-ho"${f.picker ? '' : ' disabled style="opacity:.45"'}>Hand over</button>`)
    const tpl = [...day.querySelectorAll('button')].find(b => /Templates/.test(b.textContent || ''))
    tpl && tpl.insertAdjacentHTML('afterend', `<button class="dpend dpendbtn mk-el mk-chip">${f.chip}&nbsp;pending</button>`)
    day.querySelector('.day-head').insertAdjacentHTML('afterend', `<div class="signedln mk-line mk-el"><span class="sl-h">Handed over</span><span class="sl-n"><i>BY</i>${f.picker ? 'Rune' : 'Admin'}</span><span class="sl-n"><i>AT</i>25/9 16:30</span><span class="sl-n"><i>SHOWING CHANGES SINCE</i>${f.since}</span></div>`)
    const row = (n, when) => `<button class="pl-item"><span class="pl-where">${n}</span><span class="pl-who">Admin<br>${when}</span><span class="pl-chg"><b>changed here</b></span></button>`
    if (f.list) {
      const n = f.list === 'ab' ? 4 : 1
      const sinceBtn = `<button class="mk-since"><span>Since ${f.since} <i>· ${f.since === '16:00' ? 'the last hand over' : 'Admin handed over'}</i></span><span>▾</span></button>`
      let body = `<div class="mk-grp">Handed over by Admin · 25/9 16:30 · 1 change</div>` + row(nm(A[0]), '25/9 16:12')
      if (f.list === 'ab') body += `<div class="mk-grp">Handed over by Admin · 25/9 16:00 · 3 changes</div>` + B.map((x, i) => row(nm(x), `25/9 15:${20 + i * 9}`)).join('')
      const box = document.createElement('div'); box.className = 'pendlist'; box.id = 'pendList'
      box.innerHTML = `<div class="pl-head">Changed since ${f.since} · ${n} change${n === 1 ? '' : 's'}</div>${sinceBtn}<div class="pl-list">${body}</div><div class="pl-foot">Tap a change to go to it.</div>`
      document.body.appendChild(box)
      const chip = day.querySelector('.mk-chip').getBoundingClientRect()
      box.style.left = Math.max(8, Math.min(chip.left, innerWidth - box.offsetWidth - 8)) + 'px'; box.style.top = (chip.bottom + 6) + 'px'
      if (f.menu) {
        const m = document.createElement('div'); m.className = 'wavemenu'
        m.innerHTML = `<h5>Show changes since</h5>`
          + `<button class="wm mk-on" style="width:100%;margin-bottom:6px">✓ 16:00 — Admin handed over<small>the last hand over's work · 1 change</small></button>`
          + `<button class="wm" style="width:100%;margin-bottom:6px">14:05 — Admin handed over<small>the last two hand overs · 4 changes</small></button>`
          + `<div class="wm-hdr">Resets when you close the list</div>`
        document.body.appendChild(m)
        const sb = box.querySelector('.mk-since').getBoundingClientRect()
        m.style.left = Math.max(8, Math.min(sb.left, innerWidth - m.offsetWidth - 8)) + 'px'; m.style.top = (sb.bottom + 4) + 'px'
      }
    }
    if (f.picker) {
      const p = document.createElement('div'); p.className = 'mk-pick'
      p.innerHTML = `<h5>Who is handing over?</h5><div class="mk-sel"><span>Rune</span><span>▾</span></div><button class="mk-go">Hand over</button>`
      document.body.appendChild(p)
      const hb = day.querySelector('.mk-ho').getBoundingClientRect()
      p.style.left = Math.max(8, Math.min(hb.left, innerWidth - 258)) + 'px'; p.style.top = (hb.bottom + 6) + 'px'
    }
    return null
  }, [f, CSS])
}
async function shot(k) {
  await page.evaluate(() => {
    const d = document.querySelector('#eWeek .day[data-day="1"]'); d.scrollIntoView({ block: 'start', inline: 'start' })
    for (let i = 0; i < 20; i++) {
      const q = d.getBoundingClientRect(), hit = document.elementFromPoint(Math.max(1, q.left + 12), Math.max(1, q.top + 4))
      if (hit && (d === hit || d.contains(hit))) break
      window.scrollBy(0, -30)
    }
    window.scrollBy(0, -8)
  })
  await page.waitForTimeout(250)
  await stage(k)
  await page.waitForTimeout(200)
  const clip = await page.evaluate(() => {
    const d = document.querySelector('#eWeek .day[data-day="1"]').getBoundingClientRect()
    const extra = [...document.querySelectorAll('#pendList,.wavemenu,.mk-pick')].map(x => x.getBoundingClientRect().bottom)
    const bottom = Math.max(d.top + 380, ...extra)
    const x = Math.max(0, d.left - 4), y = Math.max(0, d.top - 4)
    return { x, y, width: Math.min(d.width + 8, innerWidth - x), height: Math.min(bottom - y + 10, innerHeight - y) }
  })
  await page.screenshot({ path: `${OUT}/${W}-${k}.png`, clip })
}
for (const k of Object.keys(F)) await shot(k)
console.log('errors', JSON.stringify(errors))
await browser.close()
