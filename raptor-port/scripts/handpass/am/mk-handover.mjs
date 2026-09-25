/* THE MOCK-UP for D118's hand-over chain (25 Sep 26): his "Give me a mock up" of the proposal that every hand over is
   kept and the highlights show what changed since the hand over BEFORE the latest one (the last person's work).
   A storyboard on Tuesday (never published), drawn on the real app — the demo week, the production build:
     s1 you build Tuesday and press Hand over (nothing highlighted; Hand over greyed: nothing new to hand over)
     s2 scheduler B changes three things (3 pending, three dotted ORIG tags; Hand over live)
     s3 B presses Hand over — what YOU see when you open Tuesday (still 3, the list grouped under B's hand over)
     s4 you change one more (4: B's three under their hand over, yours under "Since then")
     s5 you press Hand over — what B sees (only your one)
   Everything proposed is injected just before each picture (the head's button, line and pending button; the tags; the
   open list in the real list's own classes); nothing is saved to the app.
   Usage, with the build served on :4173:  node mk-handover.mjs desktop  |  node mk-handover.mjs phone */
import { mkdirSync } from 'node:fs'
const W = process.argv[2] || 'desktop'
const DPR = W === 'phone' ? 3 : 2
const SIZE = W === 'phone' ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/mock/img/handover'
process.env.HP_SHOTS = OUT
mkdirSync(OUT, { recursive: true })
const L = await import('./w2-lib.mjs')
const { openHi, editWeek } = L
const { browser, page, errors } = await openHi({ ...SIZE, state: null, dpr: DPR })
await editWeek(page)

const STEPS = {
  s1: { at: '25/9 14:05', since: null, chip: 0, can: false, b: 0, a: 0, list: null },
  s2: { at: '25/9 14:05', since: null, chip: 3, can: true, b: 3, a: 0, list: null },
  s3: { at: '25/9 16:00', since: '14:05', chip: 3, can: false, b: 3, a: 0, list: 'b' },
  s4: { at: '25/9 16:00', since: '14:05', chip: 4, can: true, b: 3, a: 1, list: 'ab' },
  s5: { at: '25/9 16:30', since: '16:00', chip: 1, can: false, b: 0, a: 1, list: 'a' },
}
const CSS = `.seat[data-mkorig]{position:relative}
.seat[data-mkorig]::after{content:'ORIG';position:absolute;top:-5px;right:-3px;z-index:4;font-family:'Barlow Condensed','Inter Tight',sans-serif;
  font-size:7.5px;font-weight:800;letter-spacing:.02em;line-height:1;padding:0 2px;border-radius:4px;background:var(--panel);color:#F1F4F7;
  border:1px dotted #F1F4F7;pointer-events:none}
.mk-line .sl-h{color:#F1F4F7}
.mk-ho[disabled]{opacity:.45;cursor:default}
.pendlist .mk-grp{font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-2,#9AA4AE);margin:8px 4px 4px}
.pendlist .mk-grp:first-child{margin-top:0}`

async function stage(k) {
  const st = STEPS[k]
  return page.evaluate(([st, css]) => {
    document.querySelectorAll('style[data-mk],.mk-el,#pendList').forEach(x => x.remove())
    document.querySelectorAll('[data-mkorig]').forEach(x => x.removeAttribute('data-mkorig'))
    const s = document.createElement('style'); s.dataset.mk = '1'; s.textContent = css; document.head.appendChild(s)
    const day = document.querySelector('#eWeek .day[data-day="1"]')
    const seats = [...day.querySelectorAll('.seat')].filter(x => x.querySelector('.puck') && x.offsetWidth)
    const B = [seats[0], seats[2], seats[4]], A = [seats[5]]
    B.slice(0, st.b).forEach(x => x && x.setAttribute('data-mkorig', '1'))
    A.slice(0, st.a).forEach(x => x && x.setAttribute('data-mkorig', '1'))
    const nm = x => (x && x.querySelector('.puck .nm, .puck') ? (x.querySelector('.puck .nm') || x.querySelector('.puck')).textContent.trim() : '—')
    /* the head: the Hand over button beside Publish day, the pending button, the line naming the last hand over */
    const pub = day.querySelector('[data-beak="1"]')
    pub && pub.insertAdjacentHTML('afterend', `<button class="dbeak dunpub mk-ho mk-el"${st.can ? '' : ' disabled title="Nothing new to hand over"'}>Hand over</button>`)
    const tpl = [...day.querySelectorAll('button')].find(b => /Templates/.test(b.textContent || ''))
    if (st.chip && tpl) tpl.insertAdjacentHTML('afterend', `<button class="dpend dpendbtn mk-el mk-chip">${st.chip}&nbsp;pending</button>`)
    const since = st.since ? `<span class="sl-n"><i>SHOWING CHANGES SINCE</i>${st.since}</span>` : ''
    day.querySelector('.day-head').insertAdjacentHTML('afterend', `<div class="signedln mk-line mk-el"><span class="sl-h">Handed over</span><span class="sl-n"><i>BY</i>Admin</span><span class="sl-n"><i>AT</i>${st.at}</span>${since}</div>`)
    /* the open list, in the real list's own classes, grouped by hand over */
    if (st.list) {
      const row = (n, when) => `<button class="pl-item"><span class="pl-where">${n}</span><span class="pl-who">Admin<br>${when}</span><span class="pl-chg"><b>changed here</b></span></button>`
      let body = '', head = ''
      if (st.list === 'b') { head = `Changed since the hand over at 14:05 · 3 changes`; body = `<div class="mk-grp">Handed over by Admin · 25/9 16:00</div>` + B.map((x, i) => row(nm(x), `25/9 15:${20 + i * 9}`)).join('') }
      if (st.list === 'ab') { head = `Changed since the hand over at 14:05 · 4 changes`; body = `<div class="mk-grp">Since then · 1 change</div>` + row(nm(A[0]), '25/9 16:12') + `<div class="mk-grp">Handed over by Admin · 25/9 16:00 · 3 changes</div>` + B.map((x, i) => row(nm(x), `25/9 15:${20 + i * 9}`)).join('') }
      if (st.list === 'a') { head = `Changed since the hand over at 16:00 · 1 change`; body = `<div class="mk-grp">Handed over by Admin · 25/9 16:30</div>` + row(nm(A[0]), '25/9 16:12') }
      const box = document.createElement('div'); box.className = 'pendlist'; box.id = 'pendList'
      box.innerHTML = `<div class="pl-head">${head}</div><div class="pl-list">${body}</div><div class="pl-foot">Tap a change to go to it.</div>`
      document.body.appendChild(box)
      const chip = day.querySelector('.mk-chip'); const r = chip.getBoundingClientRect()
      box.style.left = Math.max(8, Math.min(r.left, innerWidth - box.offsetWidth - 8)) + 'px'; box.style.top = (r.bottom + 6) + 'px'
    }
    return null
  }, [st, CSS])
}
async function shot(k) {
  /* Tuesday's card from its head down, clear of the sticky bars, with the open list if there is one */
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
  await stage(k)                                            // after the scroll: the day repaints as it comes into view
  await page.waitForTimeout(200)
  const clip = await page.evaluate(() => {
    const d = document.querySelector('#eWeek .day[data-day="1"]').getBoundingClientRect()
    const l = document.querySelector('#pendList')
    const tagged = [...document.querySelectorAll('#eWeek .day[data-day="1"] [data-mkorig]')].map(x => x.getBoundingClientRect())
    let bottom = Math.max(d.top + 360, l ? l.getBoundingClientRect().bottom : 0, ...tagged.map(t => t.bottom))
    const x = Math.max(0, d.left - 4), y = Math.max(0, d.top - 4)
    return { x, y, width: Math.min(d.width + 8, innerWidth - x), height: Math.min(bottom - y + 10, innerHeight - y) }
  })
  await page.screenshot({ path: `${OUT}/${W}-${k}.png`, clip })
}
for (const k of Object.keys(STEPS)) await shot(k)
console.log('errors', JSON.stringify(errors))
await browser.close()
