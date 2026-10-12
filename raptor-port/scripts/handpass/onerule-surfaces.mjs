/* THE ONE-RULE JOB'S "NOTHING CHANGED ON SCREEN" RECORDER ([ALL-AVAIL-AS-MEMBER], the plan's step 1 — 12 Oct 26).
   Step 1 moves every reader of "is THIS MAN busy / away / owed" from the stored inputs onto a per-person view of them,
   and its whole promise is that nothing a person can see or the rules can say moves. This script records that claim
   in a form two builds can be compared on, byte for byte:

     OR_OUT=<folder> HP_URL=http://localhost:<port> node scripts/handpass/onerule-surfaces.mjs
     node scripts/handpass/onerule-compare.mjs <folder A> <folder B>

   ONE WORLD, MADE THE SAME WAY EACH RUN. The clock is held still and the random numbers are seeded, so the ids the app
   mints (engine/newid.ts — the time and a random tail) and every "placed by … at …" stamp come out the same on every
   run of the same code. Two runs of ONE build must therefore compare equal — run that first; it is what proves the
   comparison can see nothing but the code.

   WHAT IT RECORDS: the week's events as the rules read them (every day's list of inputs among them), the warning
   list, why each person may or may not take each seat of the week (the crew list's reasons), each day's OIL evidence
   (the ALL AVAIL crowd among it), and the drawn screens — View-only Sched, Edit Schedule, the crew list at rest and
   with a seat armed, every day's Scheduler Board, the Inputs calendar and List, the SANS calendar, Medical, the Leave
   War — on the demo week, on the week after it (which holds the shared demo input and the two ALL AVAIL / ALL
   inputs), on a PUBLISHED day with an input filed after it went out, at a desktop and a phone width, as the admin and
   in the member view. Pictures of the main screens are saved beside the records. */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from '@playwright/test'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const BASE = process.env.HP_URL || 'http://localhost:4173'
const OUT = process.env.OR_OUT
if (!OUT) throw new Error('OR_OUT=<folder> is required')
{ const h = new URL(BASE).hostname
  if (!['localhost', '127.0.0.1', '[::1]', '::1'].includes(h)) throw new Error('HP_URL must be a local build: the probe bridge is not installed elsewhere') }
mkdirSync(OUT, { recursive: true })

const steps = []
const say = s => { steps.push(s); console.log(s) }
const save = (name, text) => writeFileSync(join(OUT, name), String(text == null ? '' : text))

const browser = await chromium.launch({ headless: true, ...launchOptions })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
await ctx.addInitScript(() => {
  let s = 0x9e3779b9
  Math.random = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
})
const page = await ctx.newPage()
await page.clock.setFixedTime(new Date('2026-10-12T02:00:00Z'))
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + new URL(r.url()).pathname) })

await page.goto(BASE + '/')
await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
await page.waitForSelector('#luser')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.waitForTimeout(800)

const go = async to => { await page.evaluate(p => window.go(p), to); await page.waitForTimeout(600) }
const html = async sel => page.evaluate(s => { const e = document.querySelector(s); return e ? e.outerHTML : '(absent: ' + s + ')' }, sel)
const shot = async name => { try { await page.screenshot({ path: join(OUT, name + '.png') }) } catch (e) { say('shot failed ' + name + ': ' + e.message) } }
/* a value as text, the same text on every run: Sets and Maps opened, functions dropped */
const J = `(v => JSON.stringify(v, (k, x) => x instanceof Set ? { __set: [...x] } : x instanceof Map ? { __map: [...x] } : typeof x === 'function' ? undefined : x, 1))`

/* what the rules read and say for the loaded week */
async function engineDump(tag) {
  /* THE ONE THING THE PER-PERSON VIEW DROPS ON PURPOSE: an input filed for ALL AVAIL / ALL names nobody, so it is no
     line of anybody's day. Before the view, such a record still stood in the rules' list of a day's inputs under the
     placeholder's own id, where no rule ever matched it to a man. Those entries are saved APART (…-events-allavail),
     so the comparison can show that they are the whole of the difference and that nothing drawn or said moved. */
  const ev = JSON.parse(await page.evaluate(`${J}(window.collectEvents())`))
  const ph = id => id === 'all' || id === 'allavail', apart = []
  for (const d of ev) for (const k of ['input', 'whole']) { apart.push(...(d[k] || []).filter(x => ph(x.id)).map(x => ({ dt: d.dt, list: k, ...x }))); d[k] = (d[k] || []).filter(x => !ph(x.id)) }
  save(`${tag}-events.json`, JSON.stringify(ev, null, 1))
  save(`${tag}-events-allavail.json`, JSON.stringify(apart, null, 1))
  save(`${tag}-warn.json`, await page.evaluate(`(() => { const b = window.validate(); return ${J}({ all: b.all, n: (b.all || []).length }) })()`))
  save(`${tag}-oil.json`, await page.evaluate(`(() => { const out = {}; for (let di = 0; di < 7; di++) { try { out[di] = window.oilEvidenceOf(di) } catch (e) { out[di] = 'ERR ' + e.message } } return ${J}(out) })()`))
  /* why each person may or may not take each place of the week: every key the Edit Schedule week draws */
  save(`${tag}-slotbar.json`, await page.evaluate(`(() => {
    const keys = [...new Set([...document.querySelectorAll('#eWeek [data-slot]')].map(e => e.getAttribute('data-slot')))].sort()
    const ids = Object.keys(window.PEOPLE).sort()
    const out = {}
    for (const k of keys) { const row = {}; for (const id of ids) { let w; try { w = window.slotBar(id, k) } catch (e) { w = 'ERR ' + e.message } if (w) row[id] = w } out[k] = row }
    return ${J}({ nKeys: keys.length, out })
  })()`))
  say(`${tag}: engine records saved`)
}
async function boardOf(di, tag) {
  await go('editsched')
  const open = await page.evaluate(() => (document.querySelector('#schedBoard') ? window.SBDAY : null))
  if (open != null) await closeBoard()
  const door = page.locator(`#eWeek [data-sbday="${di}"]:visible`).first()
  if (!await door.count()) { say(`${tag}: no board door for day ${di}`); return false }
  await door.click()
  await page.waitForSelector('#schedBoard')
  await page.waitForTimeout(600)
  save(`${tag}-board-${di}.html`, await html('#schedBoard'))
  return true
}
async function closeBoard() {
  if (!(await page.locator('#schedBoard').count())) return
  const x = page.locator('#schedBoard').getByRole('button', { name: /Close|Done/ }).first()
  if (await x.count()) await x.click(); else await page.keyboard.press('Escape')
  await page.waitForTimeout(500)
}
async function screens(tag) {
  await go('viewsched'); save(`${tag}-vweek.html`, await html('#vWeek'))
  await go('editsched'); save(`${tag}-eweek.html`, await html('#eWeek'))
  save(`${tag}-crewlist.html`, await html('.ros-body'))
  /* the crew list with a seat armed — its reasons under every name: the first flying seat, then the first ground row */
  const armKeys = await page.evaluate(() => {
    const all = [...new Set([...document.querySelectorAll('#eWeek [data-slot]')].map(e => e.getAttribute('data-slot')))]
    const fly = all.filter(k => k.indexOf(':') < 0).sort()[0], gnd = all.filter(k => k.startsWith('g:')).sort()[0], duty = all.filter(k => k.startsWith('d:')).sort()[0]
    return [fly, gnd, duty].filter(Boolean)
  })
  for (const k of armKeys) {
    await page.evaluate(key => window.armSlot(key, null), k); await page.waitForTimeout(350)
    save(`${tag}-crewlist-armed-${k.replace(/[^a-z0-9]/gi, '_')}.html`, await html('.ros-body'))
    await page.evaluate(() => window.disarmSlot()); await page.waitForTimeout(200)
  }
  say(`${tag}: weeks and crew list saved (armed on ${armKeys.join(', ') || 'nothing'})`)
}

/* ---- the world: the demo, plus a few inputs that make the rules speak ---- */
const setup = await page.evaluate(() => {
  const w = window, d0 = w.DAYS[0], d1 = w.DAYS[1]
  const crew = d => { const out = []; (d.waves || []).forEach(wv => (wv.formations || []).forEach(f => (f.aircraft || []).forEach(a => { if (a.p) out.push(a.p); if (a.w) out.push(a.w) }))); return out.filter(id => w.PEOPLE[id] && !w.PEOPLE[id].special) }
  const m = [...new Set(crew(d0))], t = [...new Set(crew(d1))]
  const san = Object.keys(w.PEOPLE).filter(id => w.PEOPLE[id].san && !w.PEOPLE[id].archived && !w.PEOPLE[id].deleted).sort()
  const said = []
  const file = row => { try { w.fileInput({ yr: 2026, ...row }); said.push(`filed ${row.type} for ${row.person} on ${row.date}`) } catch (e) { said.push(`REFUSED ${row.type} for ${row.person}: ${e.message}`) } }
  if (m[0]) file({ person: m[0], date: 'Jul 13', allday: true, type: 'LL', remarks: 'walk: leave on a flying day' })
  if (m[1]) file({ person: m[1], date: 'Jul 13', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'walk: a meeting across a sortie' })
  if (t[0]) file({ person: t[0], date: 'Jul 13', allday: false, s: 1320, e: 120, type: 'Appointment', remarks: 'walk: across midnight' })
  if (m[2]) file({ person: m[2], date: 'Jul 13', allday: true, type: 'ATT B', remarks: 'walk: grounded, may work' })
  if (m[3]) file({ person: m[3], date: 'Jul 14', endDate: 'Jul 16', allday: true, type: 'OD', remarks: 'walk: away three days' })
  if (san[0]) file({ person: san[0], date: 'Jul 13', allday: true, type: 'SANS Availability', sans: { f: true, o: true }, remarks: 'walk: a SANS offer' })
  if (san[1]) file({ person: san[1], date: 'Jul 14', allday: false, half: 'am', s: 0, e: 720, type: 'SANS Availability', sans: { a: true }, remarks: '' })
  /* a Saturday that earns: three men on one Training (the old shared shape) and ALL AVAIL on a Duty, both answered Yes */
  const three = m.slice(4, 7)
  three.forEach(p => file({ person: p, date: 'Jul 18', allday: false, s: 480, e: 720, type: 'Training', remarks: 'walk: shared', grp: 'g-walk-train', grpBy: 'saber', by: 'saber', oil: { '2026-07-18': 1 } }))
  file({ person: 'allavail', date: 'Jul 18', allday: false, s: 780, e: 960, type: 'Duty', remarks: 'walk: for whoever is free', by: 'saber', oil: { '2026-07-18': 1 } })
  /* …and two placeholder inputs that keep their own voice in the rules' list: an ALL-DAY one (its row has no times, so
     it is never deferred to it) and a timed one on the Sunday, which the week after reads across the week's edge */
  file({ person: 'all', date: 'Jul 14', allday: true, type: 'Meeting', remarks: 'walk: everyone, all day', by: 'saber' })
  file({ person: 'allavail', date: 'Jul 19', allday: false, s: 1200, e: 1380, type: 'Training', remarks: 'walk: Sunday evening, whoever is free', by: 'saber' })
  return { monday: m.slice(0, 8), tuesday: t.slice(0, 4), san: san.slice(0, 3), said }
})
setup.said.forEach(say)
await page.waitForTimeout(600)

/* ---- the demo week, before anything is published ---- */
await go('editsched'); await page.waitForTimeout(400)
await engineDump('w1')
await screens('w1')
await go('viewsched'); await shot('w1-viewsched-desktop')
await go('editsched'); await shot('w1-editsched-desktop')
for (let di = 0; di < 7; di++) { if (await boardOf(di, 'w1') && (di === 0 || di === 5)) await shot(`w1-board-${di}-desktop`) }
await closeBoard()
say('w1: seven boards saved')

/* ---- publish Monday through its own controls, then file on it: the published face keeps what it went out with ---- */
await boardOf(0, 'pubpre')
{ const sels = page.locator('#schedBoard .sb-sign select:visible, #schedBoard [data-sign] select:visible'), n = await sels.count()
  for (let i = 0; i < n; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
    if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
    await page.waitForTimeout(150)
  }
  await page.waitForTimeout(400)
  const beak = page.locator('#schedBoard [data-beak="0"]:visible').first()
  if (await beak.count() && !await beak.isDisabled()) {
    await beak.click(); await page.waitForTimeout(900)
    const ok = page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
    if (await ok.count() && await ok.isVisible()) { await ok.click(); await page.waitForTimeout(900) }
  }
  say(`publish Monday: ${n} sign-offs set; published days now ${JSON.stringify(await page.evaluate(() => window.approvedDays()))}`)
}
await closeBoard()
{ const said = await page.evaluate(ids => {
    const w = window, out = []
    const file = row => { try { w.fileInput({ yr: 2026, ...row }); out.push(`filed after publishing: ${row.type} for ${row.person}`) } catch (e) { out.push(`REFUSED ${row.type}: ${e.message}`) } }
    if (ids[7]) file({ person: ids[7], date: 'Jul 13', allday: true, type: 'LL', remarks: 'walk: filed after Monday went out' })
    if (ids[6]) file({ person: ids[6], date: 'Jul 13', allday: false, s: 540, e: 600, type: 'Appointment', remarks: 'walk: after publishing, timed' })
    return out
  }, setup.monday)
  said.forEach(say) }
await page.waitForTimeout(600)
await go('editsched'); await page.waitForTimeout(400)
await engineDump('pub')
await screens('pub')
await go('viewsched'); await shot('pub-viewsched-desktop')
await boardOf(0, 'pub'); await shot('pub-board-0-desktop'); await closeBoard()
say(`pub: Monday reads ${await page.evaluate(() => { try { return window.pendCount ? window.pendCount() : '?' } catch (e) { return 'ERR' } })} pending in all`)

/* ---- the member view of the same week (the admin's own switch — the world is not reloaded) ---- */
await page.evaluate(() => window.raptorRole && window.raptorRole('member')); await page.waitForTimeout(500)
await go('viewsched'); save('member-vweek.html', await html('#vWeek')); save('member-topbar.html', await html('.topbar'))
await page.evaluate(() => window.raptorRole && window.raptorRole('admin')); await page.waitForTimeout(500)
say('member view saved')

/* ---- the Inputs pages ---- */
await go('inputs'); await page.waitForTimeout(600)
const backToJuly = async (prevSel) => { for (let i = 0; i < 3; i++) { const b = page.locator(prevSel).first(); if (!await b.count()) return false; await b.click(); await page.waitForTimeout(250) } return true }
say('inputs calendar: back to July ' + (await backToJuly('#page-inputs [aria-label="Previous month"]:visible') ? 'ok' : 'NOT FOUND'))
save('inputs-calendar.html', await html('#page-inputs')); await shot('inputs-calendar-desktop')
{ const list = page.locator('#page-inputs').getByRole('button', { name: /^List$/ }).first()
  if (await list.count()) { await list.click(); await page.waitForTimeout(500); save('inputs-list.html', await html('#page-inputs')); await shot('inputs-list-desktop'); say('inputs list saved') } else say('inputs list: switch NOT FOUND') }
await page.locator('#inSansMode').click(); await page.waitForTimeout(600)
/* THE SANS CALENDAR OPENS ON ITS OWN MONTH, not today's: step to July 2026 by its own arrows, reading its own heading —
   a first cut of this script went back three months from wherever it stood and recorded an empty April (found by
   opening the picture) */
{ const at = async () => (await page.locator('[data-testid="sc-month"]').first().innerText()).trim()
  const M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const ord = t => { const [m, y] = t.split(/\s+/); return (+y) * 12 + M.findIndex(x => x.toLowerCase() === String(m).toLowerCase()) }
  for (let i = 0; i < 36 && ord(await at()) !== 2026 * 12 + 6; i++) { await page.locator(ord(await at()) > 2026 * 12 + 6 ? '[data-testid="sc-prev"]' : '[data-testid="sc-next"]').click(); await page.waitForTimeout(200) }
  say('sans calendar on: ' + await at()) }
save('sans-calendar.html', await html('#page-inputs')); await shot('sans-calendar-desktop')
{ const cell = page.locator('[data-testid="sc-grid"] button, [data-testid="sc-grid"] [role="button"], [data-testid="sc-grid"] [data-iso]').filter({ hasText: /^13\b/ }).first()
  if (await cell.count()) { await cell.click(); await page.waitForTimeout(500); save('sans-day.html', await page.evaluate(() => document.body.outerHTML.length + '\n' + ([...document.querySelectorAll('[role="dialog"], .sd, .sansday, .win')].map(e => e.outerHTML).join('\n'))))
    await shot('sans-day-desktop'); say('sans day opened: ' + await page.evaluate(() => { const w = [...document.querySelectorAll('[role="dialog"], .win')].pop(); return w ? w.innerText.replace(/\s+/g, ' ').slice(0, 160) : '(no window)' })); await page.keyboard.press('Escape'); await page.waitForTimeout(300) } else say('sans day: cell NOT FOUND') }
await page.locator('#inMedBtn').click(); await page.waitForTimeout(600)
save('medical.html', await html('#page-inputs')); await shot('medical-desktop')
say('inputs, SANS and medical saved')

/* ---- the Leave War: wait for the grid to stop drawing months, then record it ---- */
await go('leavewar')
{ let last = -1, same = 0
  for (let i = 0; i < 40 && same < 4; i++) { await page.waitForTimeout(500); const n = await page.evaluate(() => { const e = document.querySelector('#page-leavewar'); return e ? e.outerHTML.length : 0 }); same = n === last ? same + 1 : 0; last = n }
  save('leavewar.html', await html('#page-leavewar')); await shot('leavewar-desktop'); say(`leave war saved (${last} characters, settled ${same >= 4})`) }

/* ---- the week after: the shared demo input (Thu) and the ALL / ALL AVAIL inputs (Wed, Sat) ---- */
await go('editsched')
{ const nx = await page.evaluate(() => { const b = [...document.querySelectorAll('[data-wk]')].filter(e => e.offsetParent !== null); const i = b.findIndex(e => e.classList.contains('on')); const t = b[i + 1]; if (t) { t.click(); return t.getAttribute('data-wk') } return null })
  await page.waitForTimeout(900); say('week after: ' + nx + ' → ' + JSON.stringify(await page.evaluate(() => window.DATES))) }
await engineDump('w2')
await screens('w2')
await go('viewsched'); await shot('w2-viewsched-desktop')
for (const di of [2, 3, 5]) { if (await boardOf(di, 'w2')) await shot(`w2-board-${di}-desktop`) }
await closeBoard()
say('w2: boards of Wed, Thu, Sat saved')

/* ---- a phone: the same screens drawn narrow ---- */
await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(800)
await go('viewsched'); save('phone-w2-vweek.html', await html('#vWeek')); await shot('phone-w2-viewsched')
await go('editsched'); save('phone-w2-eweek.html', await html('#eWeek')); await shot('phone-w2-editsched')
if (await boardOf(3, 'phone-w2')) await shot('phone-w2-board-3')
await closeBoard()
await go('inputs'); await page.waitForTimeout(500); save('phone-inputs.html', await html('#page-inputs')); await shot('phone-inputs')
say('phone screens saved')

say(`browser errors: ${errors.length ? errors.join(' | ') : 'none'}`)
save('steps.txt', steps.join('\n'))
await browser.close()
