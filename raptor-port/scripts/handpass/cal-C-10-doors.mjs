// P3-11 (every Calendar door: the month it opens on and the permission gate) and H-03 (the word "Days" nowhere on screen)
import { world, toLeaveWar, toInputs, tid, press, pic, sleep, closeAll, judge, rec, recErrors, big, active, openWins } from './cal-C-lib.mjs'
const SIZE = process.env.SZ || 'desk'
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const P = n => `${SIZE}-${n}`
const mo = async page => (await tid(page, 'days-month').textContent()).trim()
const texts = []     // every visible text collected for H-03
const grabDays = async (label, page) => {
  const hits = await page.evaluate(() => {
    const out = []
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    while (w.nextNode()) { const n = w.currentNode; const t = n.textContent; const el = n.parentElement; if (!el || !el.offsetParent && getComputedStyle(el).position !== 'fixed') continue; if (/\bDays\b/i.test(t)) out.push(t.trim().slice(0, 80)) }
    for (const e of document.querySelectorAll('[title],[aria-label]')) { if (!e.offsetParent && getComputedStyle(e).position !== 'fixed') continue; for (const a of ['title', 'aria-label']) { const v = e.getAttribute(a); if (v && /\bDays\b/i.test(v)) out.push(a + ': ' + v.slice(0, 80)) } }
    return out
  })
  texts.push({ label, hits })
  return hits
}
const rows = []

/* ===================== admin, Saber ===================== */
let w = await world(SIZE); let p = w.page
/* --- door 1: the Leave War's gear (grid taken to August via the month strip first, so the month is recognisable) --- */
await toLeaveWar(p)
if (big(SIZE)) { await press(SIZE, p.locator('button:text-is("AUG")').first()); await sleep(600) }
await press(SIZE, tid(p, 'settings-open')); await sleep(300)
await grabDays('Leave War ⚙ sheet', p)
const lwHeading = (await p.locator('.set-sec, h3, .set-h').filter({ hasText: /^Calendar/i }).allTextContents().catch(() => [])).join('|')
const lwLine = (await tid(p, 'settings-days').textContent()).trim()
await pic(p, P('p311-1-lw-gear-sheet'))
await press(SIZE, tid(p, 'settings-days')); await tid(p, 'win-days').waitFor()
const d1 = { month: await mo(p), title: (await p.locator('[data-testid="win-days"] .win-ttl').textContent()).trim() }
await grabDays('Calendar window (month part)', p)
await pic(p, P('p311-2-calendar-from-lw'))
if (await tid(p, 'days-tabs').count()) { await press(SIZE, tid(p, 'days-tab-holidays')); await sleep(300); await grabDays('Calendar window (Holidays part)', p); await press(SIZE, tid(p, 'hol-add')); await sleep(300); await grabDays('Holiday form', p); await press(SIZE, tid(p, 'hol-cancel')); await sleep(200); await press(SIZE, tid(p, 'days-tab-month')) }
await sleep(300)
await press(SIZE, tid(p, 'days-wd-3')); await sleep(400); await grabDays('Every Thursday', p)
await pic(p, P('h03-1-everywd'))
const guestDoorOk = true
await w.ctx.close()

/* --- door 2: the Inputs gear (Inputs month taken to September 2026) --- */
w = await world(SIZE); p = w.page; await toInputs(p)
const inMon = async () => { const t = (await p.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase(); const [m, y] = t.split(/\s+/); return +y * 12 + MONTHS.findIndex(x => x.startsWith(m)) }
for (let d = 2026 * 12 + 8 - await inMon(); d !== 0; d += d > 0 ? -1 : 1) await press(SIZE, p.locator(d > 0 ? '#icNext' : '#icPrev'))
await sleep(300)
await press(SIZE, tid(p, 'in-gear')); await tid(p, 'win-inputsset').waitFor(); await sleep(300)
await grabDays('Inputs settings window', p)
const isetLine = (await tid(p, 'iset-days').textContent()).trim()
await pic(p, P('h03-2-inputs-settings'))
await press(SIZE, tid(p, 'iset-days')); await tid(p, 'win-days').waitFor()
const d2 = { month: await mo(p), inputsMonth: 'September 2026' }
await pic(p, P('p311-3-calendar-from-inputs'))
await press(SIZE, tid(p, 'win-days-x'))
/* how this works on the Inputs calendar */
await press(SIZE, tid(p, 'ib-how')); await sleep(300); await grabDays('Inputs "How this works"', p)
/* --- the Logic page rows --- */
const winsBeforeNav = await openWins(p)
if (big(SIZE)) { await p.locator('nav a, #nav button, .tabs button, header button').filter({ hasText: /^Logic$/ }).first().click().catch(async () => { await p.evaluate(() => window.go('logic')) }) } else await p.evaluate(() => window.go('logic'))
await sleep(800)
const winsAfterNav = await openWins(p)
console.log('NAV', JSON.stringify({ winsBeforeNav, winsAfterNav, page: await p.evaluate(() => window.CURPAGE) }))
for (const id of ['win-inputsset', 'win-days', 'win-inputsday', 'win-inputedit']) if (await tid(p, id).count()) { await press(SIZE, tid(p, id + '-x')); await sleep(200) }
await grabDays('Logic page (top)', p)
const lg = p.locator('[data-lgopen]'); const nLg = await lg.count()
const lgLabels = await lg.evaluateAll(els => els.map(e => e.textContent.trim()))
await lg.first().scrollIntoViewIfNeeded(); await sleep(300)
await grabDays('Logic page (rows)', p)
await press(SIZE, lg.first()); await tid(p, 'win-inputsset').waitFor(); await sleep(300)
await pic(p, P('p311-4-logic-row-opens-settings'))
const lgSettingsHasCal = await tid(p, 'iset-days').count()
await press(SIZE, tid(p, 'iset-days')); await tid(p, 'win-days').waitFor()
const d2b = { month: await mo(p) }
await w.ctx.close()

/* --- door 3 / 4: the SANS gear and the SANS day --- */
w = await world(SIZE); p = w.page; await toInputs(p); await press(SIZE, p.locator('#inSansMode')); await tid(p, 'sanscal').waitFor()
const scMon = async () => { const t = (await tid(p, 'sc-month').textContent()).trim().toLowerCase(); const [m, y] = t.split(/\s+/); return +y * 12 + MONTHS.findIndex(x => x.startsWith(m)) }
for (let d = 2026 * 12 + 10 - await scMon(); d !== 0; d += d > 0 ? -1 : 1) await press(SIZE, tid(p, d > 0 ? 'sc-next' : 'sc-prev'))
await sleep(300)
await press(SIZE, tid(p, 'sc-gear')); await tid(p, 'win-sansset').waitFor(); await sleep(300)
await grabDays('SANS settings window', p)
await pic(p, P('h03-3-sans-settings'))
await press(SIZE, tid(p, 'sset-days')); await tid(p, 'win-days').waitFor()
const d3 = { month: await mo(p), sansMonth: 'November 2026' }
await press(SIZE, tid(p, 'win-days-x')); await press(SIZE, tid(p, 'win-sansset-x'))
await press(SIZE, tid(p, 'sc-how')); await sleep(300); await grabDays('SANS "How this works"', p); await press(SIZE, tid(p, 'sc-how'))
await press(SIZE, tid(p, 'sc-day-2026-11-25')); await tid(p, 'win-sansday').waitFor(); await sleep(300)
await grabDays('SANS day window', p)
const sdLine = (await tid(p, 'sd-days').textContent()).trim()
await pic(p, P('h03-4-sans-day'))
await press(SIZE, tid(p, 'sd-days')); await tid(p, 'win-days').waitFor()
const d4 = { month: await mo(p), sansDay: 'Nov 2026 (25th)' }
await pic(p, P('p311-5-calendar-from-sans-day'))
await w.ctx.close()
console.log('DOORS', JSON.stringify({ lwHeading, lwLine, d1, isetLine, d2, d2b, nLg, lgLabels, lgSettingsHasCal, d3, sdLine, d4 }))

/* ===================== permission: member view, a member, the window left open across a role change ===================== */
w = await world(SIZE); p = w.page; await toInputs(p)
await press(SIZE, p.locator('#inSansMode')); await tid(p, 'sanscal').waitFor()
await press(SIZE, tid(p, 'sc-gear')); await tid(p, 'win-sansset').waitFor(); await press(SIZE, tid(p, 'sset-days')); await tid(p, 'win-days').waitFor(); await sleep(300)
const openBefore = await openWins(p)
/* the admin's own member-view switch in the top bar (the role chip) */
if (big(SIZE)) await press(SIZE, p.locator('#roleBadge')); else { await p.locator('#burger').tap(); await sleep(400); await p.locator('#drawerRole').tap() }
await sleep(900)
const openAfter = await openWins(p)
const roleNow = big(SIZE) ? (await p.locator('#roleBadge').textContent()).trim() : 'phone drawer: ' + (await p.evaluate(() => { const d = document.querySelector('#drawerRole'); return d ? d.textContent.trim() : 'drawer closed' }))
await pic(p, P('p311-6-after-role-switch-with-calendar-open'))
const gearsNow = { scGear: await tid(p, 'sc-gear').count(), inGear: 'n/a on SANS tab' }
await press(SIZE, p.locator('#inMemberMode')); await sleep(500)
const inGearNow = await tid(p, 'in-gear').count()
await p.evaluate(() => window.go('leavewar')); await sleep(900)
const lwGearNow = await tid(p, 'settings-open').count()
if (lwGearNow) { await press(SIZE, tid(p, 'settings-open')); await sleep(300) }
const lwCalLineNow = await tid(p, 'settings-days').count()
await pic(p, P('p311-7-lw-in-member-view'))
await w.ctx.close()
/* the real member Ranger (us/us) */
w = await world(SIZE, 'us'); p = w.page; await toInputs(p)
const mem = { inGear: await tid(p, 'in-gear').count() }
await press(SIZE, p.locator('#inSansMode')); await sleep(500)
mem.scGear = await tid(p, 'sc-gear').count()
await press(SIZE, tid(p, 'sc-day-2026-07-15').or(p.locator('[data-testid^="sc-day-"]').first())); await sleep(500)
mem.sdDays = await tid(p, 'sd-days').count()
await pic(p, P('p311-8-member-sans-day'))
await p.evaluate(() => window.go('leavewar')); await sleep(900)
mem.lwGear = await tid(p, 'settings-open').count()
await p.evaluate(() => window.go('logic')); await sleep(700)
mem.logicDoors = await p.locator('[data-lgopen]').count()
mem.askedDays = await p.evaluate(() => { try { return typeof window.go === 'function' } catch { return null } })
await w.ctx.close()
console.log('PERM', JSON.stringify({ openBefore, openAfter, roleNow, gearsNow, inGearNow, lwGearNow, lwCalLineNow, mem }))

rows.push(['Leave War door: the line reads "Calendar…", window titled "Calendar", opened on the grid\'s month (August after pressing AUG)', /^Calendar…?$/.test(lwLine) && d1.title.startsWith('Calendar') && (SIZE !== 'desk' || /August/.test(d1.month)), { lwLine, d1 }])
rows.push(['Inputs gear door: "Calendar…" and the window opens on the month on screen (September 2026)', /^Calendar…?$/.test(isetLine) && /September 2026/.test(d2.month), { isetLine, d2 }])
rows.push(['Logic page door → settings → Calendar opens a month', lgSettingsHasCal === 1 && !!d2b.month, { nLg, lgLabels, d2b }])
rows.push(['SANS gear door opens on the SANS month on screen (November 2026)', /November 2026/.test(d3.month), d3])
rows.push(['SANS day door: the line reads "Calendar…" and opens on that day\'s month (November 2026)', /^Calendar…?$/.test(sdLine) && /November 2026/.test(d4.month), { sdLine, d4 }])
rows.push(['Admin switched to member view with Calendar open: the window is gone, and no gear/door remains', !openAfter.includes('win-days') && inGearNow === 0 && gearsNow.scGear === 0 && lwGearNow === 0, { openBefore, openAfter, roleNow, gearsNow, inGearNow, lwGearNow }])
rows.push(['Member Ranger (us): no Inputs gear, no SANS gear, no "Calendar…" in the SANS day, no Leave War gear, no Logic doors', mem.inGear === 0 && mem.scGear === 0 && mem.sdDays === 0 && mem.lwGear === 0 && mem.logicDoors === 0, mem])
judge('P3-11-' + SIZE, `every door to "Calendar" at ${SIZE}: Leave War gear, Inputs gear, Logic row -> settings -> Calendar…, SANS gear, SANS day; then admin member view with Calendar open, and member Ranger`, rows, [P('p311-2-calendar-from-lw') + '.png', P('p311-3-calendar-from-inputs') + '.png', P('p311-5-calendar-from-sans-day') + '.png', P('p311-6-after-role-switch-with-calendar-open') + '.png', P('p311-8-member-sans-day') + '.png'], true)
const anyDays = texts.map(t => ({ label: t.label, hits: t.hits.filter(h => /^(aria-label: |title: )?Days(…|\.\.\.|\s*$| window| tab| —| ·| \()/i.test(h) || /Days…/.test(h)) })).filter(t => t.hits.length)
const allHits = texts.filter(t => t.hits.length)
console.log('ALLDAYS', JSON.stringify(allHits))
judge('H-03-' + SIZE, `read every visible text and title/aria-label for the word Days: Leave War gear sheet, the window (Month, Holidays, holiday form, Every Thursday), both calendars' gear windows, SANS day, "How this works" on both, the Logic page rows — at ${SIZE}`, [
  ['no visible "Days" naming that window anywhere (weekday names and "14 days" aside)', anyDays.length === 0, anyDays.length ? anyDays : 'no hits in ' + texts.length + ' places'],
  ['the title and every line that opens it read Calendar / Calendar…', /^Calendar…?$/.test(lwLine) && /^Calendar…?$/.test(isetLine) && /^Calendar…?$/.test(sdLine) && d1.title.startsWith('Calendar'), { lwLine, isetLine, sdLine, title: d1.title }],
], [P('h03-1-everywd') + '.png', P('h03-2-inputs-settings') + '.png', P('h03-3-sans-settings') + '.png', P('h03-4-sans-day') + '.png', P('p311-1-lw-gear-sheet') + '.png'])
recErrors(P('script10'), w.errors)
await closeAll()
