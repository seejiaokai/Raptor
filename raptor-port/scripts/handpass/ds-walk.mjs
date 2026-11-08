/* Walk of D1786: a flying line with no in-time and no rally starts the day at take-off less the Logic page default rally.
   Run from raptor-port/:  HP_URL=http://localhost:4296 node scripts/handpass/ds-walk.mjs   (preview served on 4296) */
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
import { rmSync, mkdirSync, writeFileSync } from 'node:fs'
const here = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(here, '../../docs/img/handpass/2026-11-08-day-start')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
process.env.HP_SHOTS ||= OUT
const { open, board, closeBoard: _cb, go, shot, put, type, publish } = await import('./lib.mjs')
console.log('ds-walk v2 - D1786 day-start walk')
const { browser, page, errors } = await open({ width: 1536, height: 864 })
const closeBoard = async pg => { if (await pg.locator('#schedBoard #sbDone:visible').count()) { await pg.click('#sbDone'); await pg.waitForTimeout(600) } }
const results = []
const rec = (id, pass, did, saw, pics = []) => { results.push({ id, pass: !!pass, did, saw, pics }); console.log(pass ? 'PASS' : 'FAIL', id, '|', saw) }
const REL = 'docs/img/handpass/2026-11-08-day-start/'
const pic = async name => { await page.waitForTimeout(350); await shot(page, name); return REL + name + '.png' }

/* ---- readers ---- */
const insightsHours = async (opener = '#sbInsights') => {
  await page.locator(opener + ':visible').first().click(); await page.waitForSelector('#insightModal', { state: 'visible' }); await page.waitForTimeout(600)
  const txt = await page.evaluate(() => document.querySelector('#insightModal').innerText)
  const sec = txt.slice(txt.indexOf('WORK HOURS'))
  const get = n => (sec.match(new RegExp('\\n' + n + '\\n(\\d+h\\d*)')) || [])[1] || null
  return { saint: get('Saint'), echo: get('Echo') }
}
const insPic = async n => {
  await page.evaluate(() => { const rows = [...document.querySelectorAll('#insightModal .ibar')].filter(r => /^(Saint|Echo)$/.test(r.querySelector('.nm')?.textContent || '')); rows.forEach(r => { r.style.outline = '2px solid #d33' }); rows[0]?.scrollIntoView({ block: 'center' }) })
  await page.waitForTimeout(300); return pic(n)
}
const mins = t => { const m = /(\d+)h(\d*)/.exec(t || ''); return m ? (+m[1]) * 60 + (+(m[2] || 0)) : NaN }
const closeIns = async () => { await page.click('#insightClose'); await page.waitForTimeout(300) }
const sideText = () => page.evaluate(() => (document.querySelector('#sbSide')?.innerText || ''))
const longNotes = async () => (await sideText()).split(/\n/).map(s => s.trim()).filter(s => /long work day/i.test(s))
const pucks = () => page.evaluate(() => [...document.querySelectorAll('#schedBoard .puck[data-person]')].filter(e => !e.closest('#sbRoster') && ['salsa', 'freak'].includes(e.dataset.person) && e.offsetWidth).map(e => e.dataset.person + ':' + e.className.replace(/\s+/g, ' ') + ' | ' + (e.title || '')))
const setLead = async v => {
  if (await page.locator('#schedBoard').count()) await closeBoard(page)
  await go(page, 'logic'); await page.click('#lgEdit'); await page.waitForSelector('#lgBody input[data-lgset="reportLead"]')
  const b = page.locator('#lgBody input[data-lgset="reportLead"]'); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.fill(v); await b.press('Tab'); await page.waitForTimeout(400)
}
const logicRowPic = async n => { await page.evaluate(() => document.querySelector('[data-lgkey="reportLead"]').scrollIntoView({ block: 'center' })); await page.waitForTimeout(300); return pic(n) }
const lgDone = async () => { await page.click('#lgDone'); await page.waitForTimeout(300) }
const boardFri = async () => { if (await page.locator('#schedBoard').count()) await closeBoard(page); await board(page, 4) }
const toSide = async () => { await page.evaluate(() => document.querySelector('#sbSide')?.scrollIntoView({ block: 'start' })); await page.waitForTimeout(250) }
const fridayInWeek = async sel => { await page.evaluate(s => { const d = [...document.querySelectorAll(s)].find(e => e.offsetWidth); d?.scrollIntoView({ block: 'start' }) }, sel); await page.waitForTimeout(300) }

/* ================= S1 ================= */
await boardFri()
const base = await insightsHours(); await closeIns(); console.log('baseline hours', JSON.stringify(base))
await page.click('#schedBoard [data-wvadd="4"]'); await page.waitForTimeout(400)
await page.click('[data-wmkind=""]:visible'); await page.waitForTimeout(600)
await type(page, '[data-bfld="ff:4.0.0.cs"]', 'VL')
await type(page, '[data-bfld="ff:4.0.0.to"]', '12:00')
await type(page, '[data-bfld="ff:4.0.0.ld"]', '13:00')
const p1 = await put(page, '[data-slot="4.0.0.0.p"]', ['salsa']), p2 = await put(page, '[data-slot="4.0.0.0.w"]', ['freak'])
console.log('seats', p1, p2)
const rbox = await page.evaluate(() => { const e = document.querySelector('#schedBoard [data-bfld="ff:4.0.0.rl"]'); return { v: e.value, ph: e.placeholder } })
await page.evaluate(() => document.querySelector('#schedBoard [data-bfld="ff:4.0.0.cs"]').scrollIntoView({ block: 'center' }))
const s1a = await pic('s1-line-on-board')
let h = await insightsHours('#sbInsights'); const s1b = await insPic('s1-insights-rows'); await closeIns()
rec('S1', h.saint === '18h30' && h.echo === '27h25', 'Friday board: + Wave, flying wave, VL 12:00/13:00, Saint front, Echo back; opened Insights', `before: ${JSON.stringify(base)}; R box value "${rbox.v}" placeholder "${rbox.ph}"; Insights Saint ${h.saint}, Echo ${h.echo}`, [s1a, s1b])

/* ================= S2 ================= */
await type(page, '[data-bfld="ff:4.0.0.rl"]', '09:00')
await page.evaluate(() => document.querySelector('#schedBoard [data-bfld="ff:4.0.0.cs"]').scrollIntoView({ block: 'center' }))
const s2a = await pic('s2-r-typed-0900')
h = await insightsHours(); const s2b = await insPic('s2-insights-after-0900'); await closeIns()
rec('S2', h.saint === '18h30' && h.echo === '27h25', 'typed 09:00 in VL R box, opened Insights', `Saint ${h.saint}, Echo ${h.echo}`, [s2a, s2b])
await type(page, '[data-bfld="ff:4.0.0.rl"]', '')
console.log('R cleared:', JSON.stringify(await page.evaluate(() => document.querySelector('#schedBoard [data-bfld="ff:4.0.0.rl"]').value)))

/* ================= S3 ================= */
await type(page, '[data-bfld="ff:4.0.0.to"]', '08:00'); await type(page, '[data-bfld="ff:4.0.0.ld"]', '15:30')
await page.evaluate(() => document.querySelector('#schedBoard [data-bfld="ff:4.0.0.cs"]').scrollIntoView({ block: 'center' }))
const notes = await longNotes(), pk = await pucks()
const s3a = await pic('s3-board-line-0800-1530')
await toSide(); const s3b = await pic('s3-board-issues-list')
rec('S3a', notes.length === 2 && notes.every(n => /12h30/.test(n) && /05:00/.test(n) && /17:30/.test(n)) && notes.some(n => /Saint/.test(n)) && notes.some(n => /Echo/.test(n)), 'VL changed to 08:00 / 15:30; read issues list', `notes: ${JSON.stringify(notes)}; pucks: ${JSON.stringify(pk)}`, [s3a, s3b])
await closeBoard(page); await go(page, 'editsched')
await fridayInWeek('#eWeek [data-sbday="4"]')
const weekTxt = await page.evaluate(() => (document.querySelector('#eWeek').innerText.match(/[^\n]*long work day[^\n]*/gi) || []).slice(0, 6))
const weekChips = await page.evaluate(() => [...document.querySelectorAll('#eWeek .puck[data-person]')].filter(e => ['salsa', 'freak'].includes(e.dataset.person) && e.offsetWidth).map(e => e.dataset.person + ':' + e.className.replace(/\s+/g, ' ')))
const s3c = await pic('s3-editschedule-friday')
rec('S3b', true, 'Edit Schedule week, Friday scrolled into view', `week long-day lines: ${JSON.stringify(weekTxt)}; pucks: ${JSON.stringify(weekChips)} (judge by the picture)`, [s3c])
await board(page, 4)
await type(page, '[data-bfld="ff:4.0.0.rl"]', '07:00')
const n7 = await longNotes(); await toSide(); const s3d = await pic('s3-r-0700-notes-gone')
await type(page, '[data-bfld="ff:4.0.0.rl"]', '')
const nb = await longNotes(); await toSide(); const s3e = await pic('s3-r-cleared-notes-back')
rec('S3c', n7.length === 0 && nb.length === 2, 'typed 07:00 in R box, then cleared it', `with 07:00: ${JSON.stringify(n7)}; cleared: ${JSON.stringify(nb)}`, [s3d, s3e])
const h3 = await insightsHours(); await closeIns(); console.log('hours at 3h with 08:00/15:30', JSON.stringify(h3))
await closeBoard(page)

/* ================= S4 ================= */
await go(page, 'logic')
const rowTxt = await page.evaluate(() => document.querySelector('[data-lgkey="reportLead"] .lgwhy').textContent)
const s4a = await logicRowPic('s4-logic-row-desktop')
await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(500)
const s4b = await logicRowPic('s4-logic-row-phone')
await page.setViewportSize({ width: 1536, height: 864 }); await page.waitForTimeout(400)
rec('S4a', rowTxt.includes('When no in-time or rally is entered, a flyer\'s day starts at that time: his long day, OIL and Insights hours count from it. The tight crew-rest advisory also checks his rest as if he reported at that time.'), 'opened Logic on desktop and phone', `row words: ${rowTxt}`, [s4a, s4b])
await setLead('2h30'); const s4c = await logicRowPic('s4-logic-2h30-editing'); await lgDone()
await boardFri(); h = await insightsHours(); const s4d = await insPic('s4-insights-2h30'); await closeIns()
const n25 = await longNotes(); await toSide(); const s4e = await pic('s4-board-issues-2h30')
rec('S4b', mins(h.saint) === mins(h3.saint) - 30 && n25.length === 0, 'default rally 3h -> 2h30; Insights; Friday issues', `Saint ${h.saint} (expect 30 min under ${h3.saint}), Echo ${h.echo}; long-day notes: ${JSON.stringify(n25)}`, [s4c, s4d, s4e])
await setLead('3h'); await lgDone(); await boardFri(); h = await insightsHours(); const s4f = await insPic('s4-insights-back-3h'); await closeIns()
const nb3 = await longNotes()
rec('S4c', h.saint === h3.saint && nb3.length === 2, 'default rally back to 3h', `Saint ${h.saint}, Echo ${h.echo}; notes ${nb3.length}`, [s4f])

/* ================= S5 ================= */
await boardFri()
const pub = await publish(page, 4); console.log('publish', JSON.stringify(pub))
await page.waitForTimeout(500)
const s5a = await pic('s5-published-friday-board')
await setLead('3h30'); await lgDone()
await boardFri(); const n35 = await longNotes(); await toSide(); const s5b = await pic('s5-board-working-3h30')
const bsum = await page.evaluate(() => ({ chip: (document.querySelector('#schedBoard .verchip') || {}).innerText || '', beak: [...document.querySelectorAll('#schedBoard [data-beak],#schedBoard [data-alpub],#schedBoard .alchip')].map(e => e.innerText.trim()).join(' / '), sign: [...document.querySelectorAll('#schedBoard select')].filter(s => s.offsetWidth).map(s => s.value).join(',') }))
await closeBoard(page)
await go(page, 'editsched'); await fridayInWeek('#eWeek [data-sbday="4"]'); const s5c = await pic('s5-editschedule-friday-3h30')
await go(page, 'viewsched'); await page.evaluate(() => { [...document.querySelectorAll('#vWeek .day')][4]?.scrollIntoView({ block: 'start' }) }); await page.waitForTimeout(300)
{ const hd = page.locator("#vWeek [data-day='4'] .dwbox").first(); console.log('hd count', await hd.count()); const hb = await hd.boundingBox(); console.log('hd box', JSON.stringify(hb)); const ex = page.locator("#vWeek [data-day='4'] .dwbox *:has-text('issues')").last(); await ex.click({ force: true }).catch(e => console.log('hdclick', e.message.slice(0, 60))); await page.waitForTimeout(600) }
const vTxt = await page.evaluate(() => (((document.querySelector("#vWeek [data-day='4']") || {}).textContent || '').match(/[^.]{0,60}long work day[^.]{0,80}/gi)) || [])
const s5d = await pic('s5-viewonly-friday-published')
let vb = null, s5e = null
const door = page.locator('#vWeek [data-sbday="4"]:visible').first()
if (await door.count()) { await door.click(); await page.waitForTimeout(700); vb = await longNotes(); await toSide(); s5e = await pic('s5-viewonly-friday-board'); await closeBoard(page) }
h = await insightsHours('#insightBtn'); const s5f = await insPic('s5-insights-3h30'); await closeIns()
rec('S5', mins(h.saint) === mins(h3.saint) + 30 && n35.length === 2 && n35.every(n => /13h00/.test(n)), 'published Friday; default rally 3h30; looked at working copy, view-only and Insights', `publish ${JSON.stringify(pub)}; working-copy notes ${JSON.stringify(n35)}; board ${JSON.stringify(bsum)}; view-only week long-day lines ${JSON.stringify(vTxt)}; view-only board notes ${JSON.stringify(vb)}; Insights Saint ${h.saint} Echo ${h.echo}`, [s5a, s5b, s5c, s5d, s5e, s5f].filter(Boolean))
await setLead('3h'); await lgDone(); h = await insightsHours('#insightBtn'); await closeIns()
rec('S5-restore', true, 'default rally back to 3h', `Saint ${h.saint}, Echo ${h.echo}`, [])

/* ================= S6 ================= */
const s6 = []
await go(page, 'editsched'); await insightsHours('#insightBtn'); s6.push(await insPic('s6-insights-from-editschedule')); await closeIns()
await go(page, 'viewsched'); await insightsHours('#insightBtn'); s6.push(await insPic('s6-insights-from-viewsched')); await closeIns()
await boardFri(); await insightsHours(); s6.push(await insPic('s6-insights-from-board')); await closeIns()
await closeBoard(page); const closed = (await page.locator('#schedBoard #sbDone:visible').count()) === 0
s6.push(await pic('s6-after-done'))
await go(page, 'logic')
const folds = page.locator('#lgBody details summary:visible'); const nf = await folds.count()
for (let i = 0; i < Math.min(nf, 3); i++) { await folds.nth(i).evaluate(e => e.scrollIntoView({ block: 'center' })); await folds.nth(i).click(); await page.waitForTimeout(250); if (i === 0) s6.push(await pic('s6-logic-fold-open')); await folds.nth(i).click(); await page.waitForTimeout(250) }
s6.push(await pic('s6-logic-folds-closed'))
await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(500)
await go(page, 'editsched'); await page.click('#editSchedMore'); await page.waitForTimeout(400); s6.push(await pic('s6-phone-menu'))
await page.click('#editSchedMoreInsights'); await page.waitForSelector('#insightModal', { state: 'visible' }); await page.waitForTimeout(500)
const ph = await page.evaluate(() => { const t = document.querySelector('#insightModal').innerText; const s = t.slice(t.indexOf('WORK HOURS')); return { saint: (s.match(/\nSaint\n(\d+h\d*)/) || [])[1], fit: document.querySelector('#insightModal').getBoundingClientRect().right <= innerWidth, noSide: document.documentElement.scrollWidth <= innerWidth } })
s6.push(await insPic('s6-phone-insights')); await closeIns()
await go(page, 'viewsched'); await page.click('#viewSchedMore'); await page.waitForTimeout(400); s6.push(await pic('s6-phone-menu-viewonly')); await page.click('#viewSchedMore >> xpath=following::button[contains(.,"Insights")][1]'); await page.waitForTimeout(600); s6.push(await insPic('s6-phone-insights-viewonly')); await closeIns()
await page.setViewportSize({ width: 1536, height: 864 })
rec('S6', closed && ph.fit && ph.noSide && ph.saint, 'opened/closed Insights from board, Edit Schedule, View-only Sched, phone menu; Logic folds; Done', `Done closed board: ${closed}; Logic folds toggled: ${Math.min(nf, 3)} of ${nf}; phone Insights ${JSON.stringify(ph)}`, s6)

console.log('ERRORS', JSON.stringify(errors))
writeFileSync(resolve(OUT, '_results.json'), JSON.stringify({ results, errors }, null, 1))
await browser.close()
