/* THE MOCK-UP for the hand over WITH ACCOUNTS (D166 + D118, 25 Sep 26): his "with what we discussed, can u show me a
   mock up of how it should work for hand off now?". Each scheduler signs in as their own callsign (the sign-in stands for
   the defence mail sign-in), so the app knows who changed what and what each person has already handed over:
     f0 the top bar — "View as" gone; who is signed in, as their callsign and role
     f1 Rune signs in (last handed over 14:05): what is NEW TO HIM — Hex's three (handed over 16:00) and Saber's one
        (16:30), grouped by person, every line with who and when
     f2 Hex signs in (last handed over 16:00): only Saber's one is new to him
     f3 Rune changes two things: "Yours — not handed over yet" on top, the others' below; Hand over live
     f4 Rune presses Hand over — nothing new to him; Hand over greyed
     f5 Hex again after that: Saber's one and Rune's two are new to him
   Tuesday is never published. Drawn on the real app (the demo week, the production build); everything proposed is
   injected just before each picture in the app's own classes; nothing is saved to the app.
   Usage, with the build served on :4173:  node mk-handoff-accounts.mjs desktop  |  node mk-handoff-accounts.mjs phone */
import { mkdirSync } from 'node:fs'
const W = process.argv[2] || 'desktop'
const DPR = W === 'phone' ? 3 : 2
const SIZE = W === 'phone' ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/mock/img/handoff-accounts'
process.env.HP_SHOTS = OUT
mkdirSync(OUT, { recursive: true })
const L = await import('./w2-lib.mjs')
const { openHi, editWeek } = L
const { browser, page, errors } = await openHi({ ...SIZE, state: null, dpr: DPR })
await editWeek(page)

/* who changed which puck: Hex three (handed over 16:00), Saber one (16:30), Rune's own two (f3 only) */
const F = {
  f1: { me: 'Rune', last: 'Saber · 25/9 16:30', mine: '14:05', chip: '4 new', tags: ['hex', 'saber'], groups: ['saber', 'hex'], can: false },
  f2: { me: 'Hex', last: 'Saber · 25/9 16:30', mine: '16:00', chip: '1 new', tags: ['saber'], groups: ['saber'], can: false },
  f3: { me: 'Rune', last: 'Saber · 25/9 16:30', mine: '14:05', chip: '4 new · 2 yours', tags: ['hex', 'saber', 'rune'], groups: ['rune', 'saber', 'hex'], can: true },
  f4: { me: 'Rune', last: 'Rune · 25/9 16:45', mine: '16:45', chip: null, tags: [], groups: [], can: false },
  f5: { me: 'Hex', last: 'Rune · 25/9 16:45', mine: '16:00', chip: '3 new', tags: ['saber', 'rune'], groups: ['rune', 'saber'], can: false },
}
const CSS = `.seat[data-mkorig]{position:relative}
.seat[data-mkorig]::after{content:'ORIG';position:absolute;top:-5px;right:-3px;z-index:4;font-family:'Barlow Condensed','Inter Tight',sans-serif;
  font-size:7.5px;font-weight:800;letter-spacing:.02em;line-height:1;padding:0 2px;border-radius:4px;background:var(--panel);color:#F1F4F7;
  border:1px dotted #F1F4F7;pointer-events:none}
.mk-line .sl-h{color:#F1F4F7}
.pendlist .mk-grp{font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3,#8B96A1);margin:8px 4px 4px}
.pendlist .mk-grp.mine{color:#F2D699}
.mk-acct{display:flex;align-items:center;gap:8px;padding:6px 12px;border:1px solid var(--edge-2);border-radius:10px;background:var(--panel-2);
  font-weight:800;font-size:13px;color:var(--ink)}
.mk-acct i{font-style:normal;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3,#8B96A1);font-weight:700}
.mk-acct b{font-size:10px;padding:2px 6px;border-radius:6px;background:rgba(59,198,232,.14);color:var(--accent,#3BC6E8)}`

async function topbar() {
  await page.evaluate((css) => {
    const s = document.createElement('style'); s.dataset.mk = '1'; s.textContent = css; document.head.appendChild(s)
    const a = document.querySelector('.acct')
    if (a) a.innerHTML = `<div class="mk-acct"><i>Signed in</i><span>Rune</span><b>Admin</b></div>`
  }, CSS)
  await page.waitForTimeout(150)
  const clip = await page.evaluate(() => {
    const t = document.querySelector('.topbar') || document.querySelector('header')
    const r = t.getBoundingClientRect()
    return { x: 0, y: 0, width: innerWidth, height: Math.min(r.bottom + 4, 140) }
  })
  await page.screenshot({ path: `${OUT}/${W}-f0.png`, clip })
}
async function stage(k) {
  const f = F[k]
  return page.evaluate(([f, css]) => {
    document.querySelectorAll('style[data-mk],.mk-el,#pendList').forEach(x => x.remove())
    document.querySelectorAll('[data-mkorig]').forEach(x => x.removeAttribute('data-mkorig'))
    const s = document.createElement('style'); s.dataset.mk = '1'; s.textContent = css; document.head.appendChild(s)
    const day = document.querySelector('#eWeek .day[data-day="1"]')
    const seats = [...day.querySelectorAll('.seat')].filter(x => x.querySelector('.puck') && x.offsetWidth)
    const BY = { hex: [seats[0], seats[2], seats[4]], saber: [seats[5]], rune: [seats[6], seats[7]] }
    f.tags.forEach(p => BY[p].forEach(x => x && x.setAttribute('data-mkorig', '1')))
    const nm = x => { const p = x && (x.querySelector('.puck .nm') || x.querySelector('.puck')); return p ? p.textContent.trim() : '—' }
    const pub = day.querySelector('[data-beak="1"]')
    pub && pub.insertAdjacentHTML('afterend', `<button class="dbeak dunpub mk-el"${f.can ? '' : ' disabled style="opacity:.45" title="Nothing new to hand over"'}>Hand over</button>`)
    const tpl = [...day.querySelectorAll('button')].find(b => /Templates/.test(b.textContent || ''))
    if (f.chip && tpl) tpl.insertAdjacentHTML('afterend', `<button class="dpend dpendbtn mk-el mk-chip">${f.chip.replace(/ /g, '&nbsp;')}</button>`)
    day.querySelector('.day-head').insertAdjacentHTML('afterend', `<div class="signedln mk-line mk-el"><span class="sl-h">Last handed over</span><span class="sl-n">${f.last}</span><span class="sl-n"><i>YOURS</i>${f.mine}</span></div>`)
    const row = (n, who, when) => `<button class="pl-item"><span class="pl-where">${n}</span><span class="pl-who">${who}<br>${when}</span><span class="pl-chg"><b>changed here</b></span></button>`
    const G = {
      rune: `<div class="mk-grp mine">Yours · not handed over yet · 2 changes</div>` + BY.rune.map((x, i) => row(nm(x), 'Rune', `25/9 16:4${1 + i * 3}`)).join(''),
      saber: `<div class="mk-grp">Saber · handed over 16:30 · 1 change</div>` + row(nm(BY.saber[0]), 'Saber', '25/9 16:12'),
      hex: `<div class="mk-grp">Hex · handed over 16:00 · 3 changes</div>` + BY.hex.map((x, i) => row(nm(x), 'Hex', `25/9 15:${20 + i * 9}`)).join(''),
    }
    if (k5(f)) G.rune = `<div class="mk-grp">Rune · handed over 16:45 · 2 changes</div>` + BY.rune.map((x, i) => row(nm(x), 'Rune', `25/9 16:4${1 + i * 3}`)).join('')
    function k5(f) { return f.me === 'Hex' && f.groups.includes('rune') }
    if (f.groups.length) {
      const others = f.groups.filter(g => g !== 'rune' || k5(f)).reduce((n, g) => n + (g === 'hex' ? 3 : g === 'saber' ? 1 : 2), 0)
      const head = f.groups.includes('rune') && !k5(f)
        ? `New to you since your hand over at ${f.mine} · ${others} changes, and 2 of yours`
        : `New to you since your hand over at ${f.mine} · ${others} change${others === 1 ? '' : 's'}`
      const box = document.createElement('div'); box.className = 'pendlist'; box.id = 'pendList'
      box.innerHTML = `<div class="pl-head">${head}</div><div class="pl-list">${f.groups.map(g => G[g]).join('')}</div><div class="pl-foot">Tap a change to go to it.</div>`
      document.body.appendChild(box)
      const chip = day.querySelector('.mk-chip').getBoundingClientRect()
      box.style.left = Math.max(8, Math.min(chip.left, innerWidth - box.offsetWidth - 8)) + 'px'; box.style.top = (chip.bottom + 6) + 'px'
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
    const extra = [...document.querySelectorAll('#pendList')].map(x => x.getBoundingClientRect().bottom)
    const bottom = Math.max(d.top + 380, ...extra)
    const x = Math.max(0, d.left - 4), y = Math.max(0, d.top - 4)
    return { x, y, width: Math.min(d.width + 8, innerWidth - x), height: Math.min(bottom - y + 10, innerHeight - y) }
  })
  await page.screenshot({ path: `${OUT}/${W}-${k}.png`, clip })
}
if (W === 'desktop') await topbar()
for (const k of Object.keys(F)) await shot(k)
console.log('errors', JSON.stringify(errors))
await browser.close()
