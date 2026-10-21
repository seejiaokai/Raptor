// Pictures 10–14: Approvals (D1152, Q7, Q10), Lock dates (D1156, Q5), events and holidays by file (D1155), Available P
// (D1154), Management (D1149, Q12). New windows re-use a real window's box and pieces (the person window's .bidsheet, the
// Calendar window, Quals' columns, ⚙ Settings' groups); each real screen is pictured first.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, mark, unmark, q, esc, errs, OUT, gridTo } from './full-lib.mjs'
import { injectCss, waitingRuns, proposeTop, lockDays, LOCK_SVG, CLIP_SVG, figOf } from './full-propose.mjs'
import { H, fill } from './full-win-a-lib.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
const LOCKED = ['2026-02-09', '2026-02-10', '2026-02-11', '2026-02-12', '2026-02-13']
const fmt = iso => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '')
const span = r => r.from === r.to ? fmt(r.from) + (r.half ? ', ' + r.half : '') : `${fmt(r.from)} – ${fmt(r.to)}`

// a real window to hold a new one: the person window, widened on a desktop
async function shell(p, touch, width) {
  await (touch ? p.tap(q('person-bane')) : p.click(q('person-bane'))); await p.waitForTimeout(500)
  if (width && !touch) await p.evaluate(w => { const d = document.querySelector('.bidsheet'); if (d) { d.style.width = w + 'px'; d.style.maxWidth = '94vw' } }, width)
}
async function approvalsData(p) {
  const runs = await waitingRuns(p)
  runs.push({ id: 'nact', name: 'Warden', code: 'LL', from: '2026-01-23', to: '2026-01-23', days: 0.5, half: 'PM' }) // behind today's "+1"
  for (const r of runs) {
    r.lve = await figOf(p, r.id)
    r.low = await p.evaluate(([from, to]) => {
      let low = Infinity
      for (let d = new Date(from + 'T12:00:00'); d <= new Date(to + 'T12:00:00'); d.setDate(d.getDate() + 1)) {
        const iso = d.toISOString().slice(0, 10); const h = document.querySelector(`[data-testid="head-${iso}"]`); if (!h) continue
        const hr = h.getBoundingClientRect(), cx = hr.left + hr.width / 2; const tr = document.querySelector('[data-testid="fly-row-avail-p"]')
        const td = [...tr.children].find(td => { const r = td.getBoundingClientRect(); return r.left <= cx && r.right >= cx }); if (td) low = Math.min(low, parseFloat(td.textContent))
      }
      return isFinite(low) ? low : '–'
    }, [r.from, r.to])
  }
  runs.sort((a, b) => a.from.localeCompare(b.from) || a.name.localeCompare(b.name))
  return runs
}
function approvalsHTML(runs, phone, state = 'list') {
  const head = H.hd('Approvals', state === 'empty' ? 'nothing waiting' : `${runs.length} waiting · oldest first`)
  const filt = H.row('Dates', ['All', 'Jan', 'Feb', 'Mar', 'Pick dates…'].map((t, i) => `<button class="pchip${i === 0 ? ' on' : ''}">${t}</button>`).join('') +
    (state === 'empty' ? '' : `<button class="dchip approve zz-all" style="margin-left:auto">Approve all ${runs.length}</button>`), 'zz-filter')
  if (state === 'empty') return head + filt + `<div class="zz-empty" style="padding:22px 6px;font:500 14px/1.5 system-ui,sans-serif;color:#8a96a3">Nothing is waiting. A new request shows here, and the count on the Approvals button rises.</div>`
  const line = r => {
    const neg = parseFloat(r.lve) < 0
    const lve = `<span style="color:${neg ? '#FFA6AD' : '#c9d1d9'}">LVE after ${r.lve}</span>`
    const meta = `${r.days === 0.5 ? '½ day' : r.days + (r.days === 1 ? ' day' : ' days')} · ${lve} · lowest Avail P ${r.low} · placed by ${r.name}`
    const btns = `<button class="dchip approve">Approve</button><button class="dchip refuse">Refuse</button>`
    return phone
      ? `<div class="zz-aline" style="padding:10px 4px;border-top:1px solid #26303a"><div style="display:flex;align-items:center;gap:8px;font:700 15px system-ui;color:#e6edf3"><span>${r.name}</span><span class="c zz-wait" style="font-size:11px">${r.code}</span><span style="font-weight:600;color:#c9d1d9">${span(r)}</span></div><div style="font:500 12.5px/1.45 system-ui;color:#8a96a3;margin:3px 0 7px">${meta}</div><div style="display:flex;gap:8px">${btns}</div></div>`
      : `<div class="zz-aline" style="display:grid;grid-template-columns:110px 48px 190px 1fr auto;gap:10px;align-items:center;padding:8px 4px;border-top:1px solid #26303a;font:600 13.5px system-ui;color:#e6edf3"><span>${r.name}</span><span class="c zz-wait" style="font-size:11px;justify-self:start">${r.code}</span><span style="color:#c9d1d9">${span(r)}</span><span style="font:500 12.5px system-ui;color:#8a96a3">${meta}</span><span style="display:flex;gap:8px">${btns}</span></div>`
  }
  const done = state === 'after' ? `<div class="zz-after" style="margin:8px 2px;padding:9px 11px;border-radius:8px;background:rgba(255,255,255,.04);font:500 13.5px/1.5 system-ui;color:#c9d1d9"><b style="color:#e6edf3">${runs.length} approved.</b> Each member is told by the bell. Undo takes all ${runs.length} back.</div>` : ''
  return head + filt + done + `<div class="zz-alist" style="max-height:${phone ? 60 : 62}vh;overflow:auto">${state === 'after' ? '' : runs.map(line).join('')}</div>`
}

async function approvalsScene() {
  // desktop: the list, the empty list, and after "Approve all"
  let { ctx, p } = await newPage(browser, 1536, 860, false, state); await signIn(p, 'admin'); await injectCss(p)
  const runs = await approvalsData(p)
  console.log('approvals:', runs.map(r => `${r.name} ${r.code} ${r.from}${r.half ? ' ' + r.half : ''} lve ${r.lve} low ${r.low}`).join(' | '))
  await proposeTop(p, { admin: true, phone: false, waiting: runs.length, locks: 2, myLeave: { lve: '17', oil: 0, waiting: 0, next: 'LL Fri 30 Jan', nextShort: '30 Jan' } })
  await shell(p, false, 980); await fill(p, approvalsHTML(runs, false)); await p.waitForTimeout(200)
  await shot(p, 'p-w10-desk-approvals-clean')
  await mark(p, '.zz-filter .pchip:last-of-type', '1 dates filter: approve all for a period (Q7)', { below: true })
  await mark(p, '.zz-all', '2 Approve all: what it shows', { right: true })
  await mark(p, '.zz-alist .zz-aline', '3 one line a request: its cost and the day\'s lowest manning', { below: true, nth: 2 })
  await shot(p, 'p-w10-desk-approvals'); await unmark(p)
  await fill(p, approvalsHTML(runs, false, 'after')); await p.waitForTimeout(200)
  await mark(p, '.zz-after', '4 after Approve all', { below: true }); await shot(p, 'p-w10-desk-approvals-after'); await unmark(p)
  await fill(p, approvalsHTML([], false, 'empty')); await p.waitForTimeout(200)
  await mark(p, '.zz-empty', '5 nothing waiting', { below: true }); await shot(p, 'p-w10-desk-approvals-empty')
  await ctx.close()
  // phone, admin
  ;({ ctx, p } = await newPage(browser, 390, 844, true, state)); await signIn(p, 'admin'); await injectCss(p)
  await shell(p, true); await fill(p, approvalsHTML(runs, true)); await p.waitForTimeout(200)
  await mark(p, '.zz-filter', '1', { num: true }); await mark(p, '.zz-all', '2', { num: true })
  await shot(p, 'p-w10-phone-approvals')
  await ctx.close()
}

const LOCKS = [
  ['Mon 9 – Fri 13 Feb', 'Exercise week. No leave changes.'],
  ['Wed 1 Apr – Thu 31 Dec', 'Not open yet. Set when the period was made; shorten it to open months.'],
]
function locksHTML(admin, editing) {
  const rows = LOCKS.map(([d, why], i) => H.crow(d, LOCK_SVG.replace('class="zz-lockg"', 'class="zz-lockg" style="display:inline-block;margin:0"'), why, admin ? '<button class="cmv">Edit</button><button class="cmv" aria-label="Unlock">✕</button>' : '')).join('')
  const edit = editing ? `<div class="zz-edit" style="margin:4px 2px 10px;padding:10px;border:1px solid #30363d;border-radius:10px">` +
    H.row('From', '<button class="pchip on">Wed 1 Jul</button><span style="color:#8a96a3;font:500 12.5px system-ui;margin-left:4px">was 1 Apr: April to June open for leave</span>') +
    H.row('To', '<button class="pchip">Thu 31 Dec</button>') + H.row('Reason', '<button class="pchip" style="min-width:55%;text-align:left">Not open yet</button>') +
    `<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px"><button class="dchip approve">Save</button><button class="dchip">Cancel</button></div></div>` : ''
  return H.hd('Lock dates', admin ? 'members cannot add, change or remove leave on these days' : 'no leave changes on these days') +
    `<div class="clist zz-locks">${rows}</div>` + edit +
    (admin ? `<div class="bidsheet-row zz-add"><span class="lab"></span><button class="pchip">+ Lock dates</button><button class="pchip">Lock the whole period</button></div>` : '') +
    `<div style="margin:8px 4px 2px;font:500 12.5px/1.45 system-ui;color:#8a96a3">${admin ? 'Documents can still be added on a locked day. A scheduler is never locked.' : 'Documents can still be added on a locked day.'}</div>`
}
async function locksScene() {
  let { ctx, p } = await newPage(browser, 1536, 860, false, state); await signIn(p, 'admin'); await injectCss(p)
  await proposeTop(p, { admin: true, phone: false, waiting: 15, locks: 2, myLeave: { lve: '17', oil: 0, waiting: 0, next: 'LL Fri 30 Jan', nextShort: '30 Jan' } })
  await gridTo(p, '2026-01-01'); await p.evaluate(() => window.scrollTo(0, 0)); await lockDays(p, LOCKED, false)
  await shell(p, false, 720); await fill(p, locksHTML(true, false)); await p.waitForTimeout(200)
  await shot(p, 'p-w11-desk-locks-clean')
  await mark(p, '.zz-locks', '1 each lock, its reason', { right: true })
  await mark(p, '.zz-add', '2 add one, or lock everything', { right: true })
  await mark(p, '[data-testid="head-2026-02-11"]', '3 locked days on the grid', { below: true })
  await shot(p, 'p-w11-desk-locks'); await unmark(p)
  await fill(p, locksHTML(true, true)); await p.waitForTimeout(200)
  await mark(p, '.zz-edit', '4 opening April–June: shorten "Not open yet"', { right: true })
  await shot(p, 'p-w11-desk-locks-open'); await ctx.close()
  ;({ ctx, p } = await newPage(browser, 390, 844, true, state)); await signIn(p, 'member'); await injectCss(p)
  await proposeTop(p, { admin: false, phone: true, waiting: 0, locks: 2, myLeave: { lve: '14.5', oil: 0, waiting: 2, next: 'LL Mon 19 Jan', nextShort: '19 Jan' } })
  await gridTo(p, '2026-02-04'); await p.evaluate(() => window.scrollTo(0, 0)); await lockDays(p, LOCKED, true)
  await shot(p, 'p-w11-phone-grid-locked')
  await shell(p, true); await fill(p, locksHTML(false, false)); await p.waitForTimeout(200)
  await mark(p, '.zz-lock', '1', { num: true }); await mark(p, '.zz-locks', '2', { num: true })
  await shot(p, 'p-w11-phone-locks'); await ctx.close()
}

// events: a list of the squadron's events with their kinds (D1155); holidays by file on the Calendar window's Holidays list
const EVENTS = [
  ['Thu 1 Jan', "New Year's Day", 'Public holiday', 'PH'], ['Fri 23 Jan', 'Sqn sports day', 'Sports', 'SP'], ['Mon 9 – Fri 13 Feb', 'EX SAMPLE SHIELD', 'Exercise', 'EX'],
  ['Tue 17 – Wed 18 Feb', 'Chinese New Year', 'Public holiday', 'PH'], ['Sun 9 Aug', 'National Day', 'Public holiday', 'PH'], ['Fri 25 Dec', 'Christmas Day', 'Public holiday', 'PH'],
]
async function eventsScene() {
  const { ctx, p } = await newPage(browser, 1536, 860, false, state); await signIn(p, 'admin'); await injectCss(p)
  await p.click(q('settings-open')); await p.waitForTimeout(400); await shot(p, 't-w12-desk-settings')
  // the ⚙'s Calendar line gains its neighbour, "Events…"
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Calendar…'); if (b) { const n = b.cloneNode(true); n.textContent = 'Events…'; n.classList.add('zz-ev'); n.style.marginLeft = '8px'; b.after(n) } })
  await mark(p, '.zz-ev', '1 NEW Events…', { right: true }); await shot(p, 'p-w12-desk-settings'); await unmark(p); await esc(p)
  await shell(p, false, 820)
  await fill(p, H.hd('Events', 'shown on the Event rows; a tap opens one') +
    H.row('Show', ['All', 'Public holidays', 'Exercises', 'Other'].map((t, i) => `<button class="pchip${i === 0 ? ' on' : ''}">${t}</button>`).join('') + '<button class="dchip approve" style="margin-left:auto">+ Event</button>', 'zz-evf') +
    `<div class="zz-evl">` + EVENTS.map(([d, n, k, s]) => `<div style="display:grid;grid-template-columns:170px 1fr 140px 44px;gap:10px;align-items:center;padding:9px 4px;border-top:1px solid #26303a;font:600 14px system-ui;color:#e6edf3"><span style="color:#c9d1d9">${d}</span><span>${n}</span><span style="font:500 12.5px system-ui;color:#8a96a3">${k}</span><span class="c info" style="justify-self:start;color:#c9d1d9;box-shadow:inset 0 0 0 1px #3a4552">${s}</span></div>`).join('') + `</div>`)
  await p.waitForTimeout(200)
  await mark(p, '.zz-evf', '2 kinds, and one way to add', { below: false }); await mark(p, '.zz-evl', '3 several days allowed', { right: true })
  await shot(p, 'p-w12-desk-events'); await unmark(p); await esc(p); await esc(p)
  // the Calendar window's Holidays list: Export and Import beside + Add
  await p.click(q('settings-open')); await p.waitForTimeout(400)
  await p.locator('button:has-text("Calendar…")').first().click(); await p.waitForTimeout(800)
  await shot(p, 't-w12-desk-holidays')
  await p.evaluate(() => {
    const today = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Today')
    const line = [...document.querySelectorAll('*')].find(e => !e.children.length && /Public holidays and Off days/.test(e.textContent)); if (!line || !today) return
    const row = document.createElement('div'); row.className = 'zz-new zz-iorow'; row.style.cssText = 'display:flex;gap:8px;margin:8px 0 10px'
    for (const t of ['Export the year', 'Import a sheet']) { const n = today.cloneNode(true); n.textContent = t; n.classList.add('zz-io'); row.appendChild(n) }
    line.after(row)
  })
  await mark(p, '.zz-iorow', '4 NEW holidays by file', { below: true }); await shot(p, 'p-w12-desk-holidays'); await unmark(p)
  // the import's preview, before anything changes
  await p.evaluate(([LOCK]) => {
    const box = document.createElement('div'); box.className = 'bidsheet zz-new zz-imp'
    Object.assign(box.style, { position: 'fixed', right: '30px', top: '330px', width: '700px', zIndex: 2147483000, boxShadow: '0 18px 50px rgba(0,0,0,.6)', background: '#161b22', border: '1px solid #30363d', borderRadius: '14px', padding: '12px 16px 14px', color: '#e6edf3' })
    const rows = [['Fri 3 Apr', 'Good Friday', 'PH', 'Adds'], ['Fri 1 May', 'Labour Day', 'PH', 'Adds'], ['Sun 9 Aug', 'National Day', 'PH', 'Already there'], ['Sun 8 – Mon 9 Nov', 'Deepavali (and observed)', 'PH', 'Adds, 2 days'], ['Fri 25 Dec', 'Christmas Day', 'PH', 'Already there']]
    box.innerHTML = `<div style="display:flex;align-items:baseline;gap:12px;padding:2px 2px 10px;border-bottom:1px solid #26303a"><b style="font:800 15px system-ui;letter-spacing:.06em">Import holidays</b><span style="font:500 13px system-ui;color:#8a96a3">holidays-2026.csv · a sample sheet</span><span style="margin-left:auto;color:#8a96a3">✕</span></div>` +
      rows.map(([d, n, s, w]) => `<div style="display:grid;grid-template-columns:170px 1fr 50px 130px;gap:10px;align-items:center;padding:8px 4px;border-top:1px solid #26303a;font:600 14px system-ui;color:#e6edf3"><span style="color:#c9d1d9">${d}</span><span>${n}</span><span class="c info" style="color:#c9d1d9;box-shadow:inset 0 0 0 1px #3a4552;justify-self:start">${s}</span><span style="font:600 12.5px system-ui;color:${w.startsWith('Adds') ? '#8FE0A8' : '#8a96a3'}">${w}</span></div>`).join('') +
      `<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px"><button style="padding:8px 16px;border-radius:9px;border:0;background:#3bc6e8;color:#0b1116;font:700 14px system-ui">Import 3</button><button style="padding:8px 16px;border-radius:9px;border:1px solid #30363d;background:transparent;color:#e6edf3;font:700 14px system-ui">Cancel</button></div>`
    document.body.appendChild(box)
  }, [LOCK_SVG])
  await mark(p, '.zz-imp', '5 what it adds and skips, before anything changes', { below: true }); await shot(p, 'p-w12-desk-import')
  await ctx.close()
}

async function availScene() {
  const { ctx, p } = await newPage(browser, 1536, 860, false, state); await signIn(p, 'admin')
  await p.click(q('fly-name-avail-p')); await p.waitForTimeout(500); await shot(p, 't-w13-desk-availp')
  await p.evaluate(() => {
    const d = [...document.querySelectorAll('.bidsheet, [role=dialog]')].filter(e => e.getBoundingClientRect().width).pop()
    const t = [...d.querySelectorAll('*')].find(e => !e.children.length && /SANS people are never counted/.test(e.textContent)); if (!t) return
    const n = document.createElement('div'); n.className = 'zz-new zz-sans'; n.style.cssText = getComputedStyle(t).cssText; n.style.cssText = `font:${getComputedStyle(t).font};color:${getComputedStyle(t).color};margin:${getComputedStyle(t).margin}`
    n.innerHTML = 'The SANS calendar: still needed = Required P − Available P − the SANS who offer to fly.'
    t.after(n)
  })
  await mark(p, '.zz-sans', '1 NEW: how the SANS calendar reads this row (D1154)', { below: true })
  await shot(p, 'p-w13-desk-availp'); await ctx.close()
}

async function mgmtScene() {
  let { ctx, p } = await newPage(browser, 1536, 860, false, state); await signIn(p, 'admin')
  await p.evaluate(() => window.go('quals')); await p.waitForTimeout(1200); await shot(p, 't-w14-desk-quals')
  await p.evaluate(() => {
    const th = document.querySelector('th[data-sort="sxo"]'); if (!th) return
    const n = th.cloneNode(true); n.dataset.sort = 'mgmt'; n.firstChild.textContent = 'MGMT'; n.classList.add('zz-new', 'zz-mg'); th.after(n)
    for (const td of document.querySelectorAll('td[data-q$="|sxo"]')) {
      const id = td.dataset.q.split('|')[0]; const c = td.cloneNode(false); c.dataset.q = id + '|mgmt'
      if (id === 'dice' || id === 'stiff') c.innerHTML = '<span class="qchk">✓</span>'
      td.after(c)
    }
  })
  await mark(p, '.zz-mg', '1 NEW a Management tick on Quals (Q12)', { below: true }); await shot(p, 'p-w14-desk-quals'); await ctx.close()
  ;({ ctx, p } = await newPage(browser, 1536, 860, false, state)); await signIn(p, 'admin')
  await p.click(q('settings-open')); await p.waitForTimeout(500)
  await p.evaluate(() => { const g = [...document.querySelectorAll('*')].find(e => /^GROUPS/.test(e.textContent.trim()) && e.children.length < 3); g?.scrollIntoView({ block: 'start' }) })
  await p.waitForTimeout(300); await shot(p, 't-w14-desk-groups')
  await p.evaluate(() => {
    const rows = [...document.querySelectorAll('[data-grow]')]; const sxo = rows.find(r => /SXO/.test(r.textContent)); if (!sxo) return 'no row'
    const n = sxo.cloneNode(true); n.classList.add('zz-new', 'zz-mgrow')
    const walker = document.createTreeWalker(n, NodeFilter.SHOW_TEXT); let t
    while ((t = walker.nextNode())) { if (t.textContent.trim() === 'SXO') t.textContent = 'Management'; else if (t.textContent.trim() === '12') t.textContent = '2'; else if (t.textContent.trim() === 'CAT') t.textContent = 'QUALS' }
    sxo.before(n)
    const amber = getComputedStyle([...sxo.querySelectorAll('*')].find(e => e.getBoundingClientRect().width < 20 && e.getBoundingClientRect().width > 4) || sxo).backgroundColor
    for (const e of n.querySelectorAll('*')) if (getComputedStyle(e).backgroundColor === amber && e.getBoundingClientRect().width < 20) e.style.background = '#d7dde4'
    const add = [...document.querySelectorAll('button')].find(b => /\+ Scheduler/.test(b.textContent)); if (add) { const m = add.cloneNode(true); m.textContent = '+ MGMT'; m.classList.add('zz-mgadd'); add.before(m) }
  })
  await mark(p, '.zz-mgrow', '2 Management, first: its people still count in their own seat', { right: true })
  await shot(p, 'p-w14-desk-groups'); await unmark(p)
  await p.evaluate(() => document.querySelector('.zz-mgadd')?.scrollIntoView({ block: 'center' })); await p.waitForTimeout(300)
  await mark(p, '.zz-mgadd', '3 added like any Quals column', { right: true })
  await shot(p, 'p-w14-desk-groups-add'); await ctx.close()
}

await approvalsScene()
await locksScene()
await eventsScene()
await availScene()
await mgmtScene()
await browser.close(); console.log('errors:', errs)
