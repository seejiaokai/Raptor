/* wwf w1 scenario 3 — publish, pending edit, amendment, issued-version looks. */
import * as H from './wwf-w1-lib.mjs'
const X = await H.init(process.env.RUN || 's03')
const { say, sleep, row, pic } = X
const w = await X.open({})
const { page } = w
const S = 'S3', SZ = 'desktop'
const crewOf = ls => ls.filter(l => H.crew(l))
const step = async (n, f) => { try { return await f() } catch (e) { say('STEP ERROR', n, String(e.message).split('\n')[0]); return null } }
const sundayRow = async (root) => page.evaluate(r => { const d = document.querySelector(`${r} .day[data-day="6"]`); if (!d) return 'no day'; const rs = [...d.querySelectorAll('.sb-arow, tr, .drow, .duty-row')].filter(e => e.offsetWidth && /SXO AM/.test(e.innerText)); return rs.map(e => e.innerText.replace(/\s+/g, ' ').trim()).join(' || ') + ' ## ' + [...d.querySelectorAll('input')].filter(e => e.offsetWidth).map(e => e.value).join(',') }, root)
const mondayRead = async (root, tag, pg) => {
  const ww = await X.weekWarn(w, root, 0)
  say(tag + ' Monday strip', ww.head, JSON.stringify(ww.items))
  return ww
}
// ---- build
await H.gotoWeek(X, w, H.SUNDAY_WK, 'editsched')
const d = await H.makeDesk(X, w, 6, { tpl: 'sc', str: '20:00', end: '', people: ['bane'] })
await X.closeBoard(w)
await H.gotoWeek(X, w, H.MONDAY_WK, 'editsched')
await X.board(w, 0)
await H.flight2(X, w, 0, { to: '10:20', ld: '11:20', br: '08:00', front: 'bane', rear: null })
await X.closeBoard(w)
await H.gotoWeek(X, w, H.SUNDAY_WK, 'editsched')
await X.board(w, 6)
const pubr = await X.L.publish(page, 6)
say('publish', JSON.stringify(pubr))
await pic(w, '01-published')
await X.closeBoard(w)
// ---- Monday BEFORE the amendment (RECORD)
await H.gotoWeek(X, w, H.MONDAY_WK, 'editsched')
let ww = await mondayRead('#eWeek', 'BEFORE edit (Edit Schedule)')
await pic(w, '02-before-edit-monday')
let dd = await X.dayDetails(w, '#eWeek', 0); say('BEFORE Monday details (Edit)', JSON.stringify(dd)); await pic(w, '03-before-monday-details'); await X.closeDayPop(w, 'done')
const preE = { strip: ww.head, crew: crewOf(ww.items), det: crewOf(dd.items || []) }
await X.L.go(page, 'viewsched')
await H.gotoWeek(X, w, H.MONDAY_WK, null)
ww = await mondayRead('#vWeek', 'BEFORE edit (View-only)')
await pic(w, '04-before-view-monday')
const preV = { strip: ww.head, crew: crewOf(ww.items) }
row(S, SZ, 'Sunday published (ORIG) with SC desk START 20:00 END blank; read Monday surfaces BEFORE any edit', 'RECORD', `Edit Schedule Monday: ${preE.strip} crew=${JSON.stringify(preE.crew)} details crew=${JSON.stringify(preE.det)}; View-only Monday: ${preV.strip} crew=${JSON.stringify(preV.crew)}`, 'RECORDED', 'w1/s03/02-before-edit-monday.png')
// ---- pending edit on Sunday
await H.gotoWeek(X, w, H.SUNDAY_WK, 'editsched')
await H.setEnd(X, w, 6, d.wi, 0, '23:00')
await sleep(500)
await pic(w, '05-board-sunday-after-end')
await X.closeBoard(w)
say('pending panel', await page.evaluate(() => document.querySelector('#alPanel')?.innerText.replace(/\s+/g, ' ')))
await pic(w, '06-pending-list')
say('Sunday issued vs working', JSON.stringify(await page.evaluate(() => ({ working: window.DAYS[6].dutywaves.map(b => b.rows[0].str + '-' + b.rows[0].end) }))))
await H.gotoWeek(X, w, H.MONDAY_WK, 'editsched')
ww = await mondayRead('#eWeek', 'PENDING (Edit Schedule)')
await pic(w, '07-pending-edit-monday')
dd = await X.dayDetails(w, '#eWeek', 0); say('PENDING Monday details (Edit)', JSON.stringify(dd)); await pic(w, '08-pending-monday-details'); await X.closeDayPop(w, 'done')
const penE = { strip: ww.head, crew: crewOf(ww.items), det: crewOf(dd.items || []) }
await X.L.go(page, 'viewsched')
await H.gotoWeek(X, w, H.MONDAY_WK, null)
ww = await mondayRead('#vWeek', 'PENDING (View-only)')
await pic(w, '09-pending-view-monday')
const penV = { strip: ww.head, crew: crewOf(ww.items) }
row(S, SZ, 'Sunday END 23:00 typed on the working copy (amendment pending); read Monday in Edit Schedule and View-only', 'RECORD; pending edit must not rewrite the issued END', `Edit Schedule Monday: ${penE.strip} crew=${JSON.stringify(penE.crew)} details crew=${JSON.stringify(penE.det)}; View-only Monday: ${penV.strip} crew=${JSON.stringify(penV.crew)}`, 'RECORDED', 'w1/s03/07-pending-edit-monday.png')
// ---- publish the amendment
await X.L.go(page, 'editsched')
await H.gotoWeek(X, w, H.SUNDAY_WK, null)
await X.board(w, 6)
const p2 = await X.L.publish(page, 6)
say('publish AL', JSON.stringify(p2))
await pic(w, '10-published-al')
await X.closeBoard(w)
await H.gotoWeek(X, w, H.MONDAY_WK, 'editsched')
ww = await mondayRead('#eWeek', 'AFTER amendment (Edit)')
await pic(w, '11-after-al-monday')
dd = await X.dayDetails(w, '#eWeek', 0); say('AFTER Monday details (Edit)', JSON.stringify(dd)); await pic(w, '12-after-monday-details'); await X.closeDayPop(w, 'done')
const aftE = { strip: ww.head, crew: crewOf(ww.items), det: crewOf(dd.items || []) }
await X.L.go(page, 'viewsched')
await H.gotoWeek(X, w, H.MONDAY_WK, null)
ww = await mondayRead('#vWeek', 'AFTER amendment (View-only)')
await pic(w, '13-after-al-view-monday')
const aftV = { strip: ww.head, crew: crewOf(ww.items) }
row(S, SZ, 'amendment AL1 published (END 23:00 now issued); read Monday', 'newly issued typed END contributes to Monday rest: crew-rest line for Ranger (clear 11:00, report 08:00)', `Edit: ${aftE.strip} crew=${JSON.stringify(aftE.crew)} details=${JSON.stringify(aftE.det)}; View-only: ${aftV.strip} crew=${JSON.stringify(aftV.crew)}`, aftE.crew.length && aftV.crew.length ? 'PASS' : 'FAIL', 'w1/s03/11-after-al-monday.png')
// ---- looks: menu content
await X.L.go(page, 'editsched')
await H.gotoWeek(X, w, H.SUNDAY_WK, null)
await X.press(w, '#eWeek [data-planmenu="6"]'); await sleep(400)
const menu = await page.evaluate(() => [...document.querySelectorAll('[data-planpv], .wm')].filter(e => e.offsetWidth).map(e => e.getAttribute('data-planpv') + '|' + e.innerText.replace(/\s+/g, ' ')).join(' ;; '))
say('plans menu', menu)
await pic(w, '14-plans-menu')
const versions = await page.evaluate(() => [...document.querySelectorAll('[data-planpv]')].filter(e => e.offsetWidth).map(e => e.getAttribute('data-planpv')))
say('versions', JSON.stringify(versions))
for (const v of versions) {
  await step('look ' + v, async () => {
    const el = page.locator(`[data-planpv="${v}"]:visible`).first()
    await el.click(); await sleep(700)
    await pic(w, `15-look-${v}-week`)
    const txt = await page.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="6"]'); return d ? d.innerText.replace(/\s+/g, ' ').slice(0, 700) : 'no day' })
    say(`LOOK ${v} (week) Sunday text`, txt)
    const di2 = await X.dayDetails(w, '#eWeek', 6)
    say(`LOOK ${v} day details`, JSON.stringify(di2)); await pic(w, `16-look-${v}-details`); await X.closeDayPop(w, 'done')
    const ctl = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="6"] button')].filter(e => e.offsetWidth).map(e => [...e.attributes].filter(a => /^data-/.test(a.name)).map(a => a.name + '=' + a.value).join(' ') + '|' + (e.innerText || '').slice(0, 30).replace(/\s+/g, ' ')).join(' ;; '))
    say(`LOOK ${v} Sunday controls`, ctl)
    // back to live
    await X.press(w, '#eWeek [data-planmenu="6"]'); await sleep(300)
    const back = page.locator('[data-planlive], [data-planpv]:visible').first()
    await pic(w, `17-look-${v}-menu`)
  })
}
// back to live
await step('golive', async () => { await X.press(w, '#eWeek [data-golive="6"]'); await sleep(600) })
// ---- Board looks
await X.board(w, 6)
for (const v of versions) {
  await step('board look ' + v, async () => {
    await X.press(w, '[data-planmenu="6"]', { scope: 'board' }); await sleep(400)
    await X.press(w, `[data-planpv="${v}"]`); await sleep(800)
    await pic(w, `18-board-look-${v}`)
    const txt = await page.evaluate(() => document.querySelector('#schedBoard')?.innerText.replace(/\s+/g, ' ').slice(0, 900))
    say(`BOARD LOOK ${v}`, txt)
    const warn = await X.boardWarn(w); say(`BOARD LOOK ${v} warn list`, JSON.stringify(warn))
    const ctl = await page.evaluate(() => [...document.querySelectorAll('#schedBoard button')].filter(e => e.offsetWidth && /golive|restore|dayinfo/.test([...e.attributes].map(a => a.name).join(' '))).map(e => [...e.attributes].filter(a => /^data-/.test(a.name)).map(a => a.name + '=' + a.value).join(' ') + '|' + e.innerText.slice(0, 30)).join(' ;; '))
    say(`BOARD LOOK ${v} controls`, ctl)
    const di3 = await page.locator('#schedBoard [data-dayinfo="6"]:visible').count()
    if (di3) { await X.press(w, '[data-dayinfo="6"]', { scope: 'board' }); await sleep(500); const it = await page.evaluate(() => [...document.querySelectorAll('#dayPopBody .witem')].map(e => e.innerText.replace(/\s+/g, ' ').trim())); say(`BOARD LOOK ${v} day details`, JSON.stringify(it)); await pic(w, `19-board-look-${v}-details`); await X.closeDayPop(w, 'done') }
    // read-only check: try to type in the end box
    const ro = await page.evaluate(() => { const i = document.querySelector('#schedBoard [data-bfld^="dr:6.1.0.end"]'); return i ? { ro: i.readOnly, dis: i.disabled } : 'no editable box' })
    say(`BOARD LOOK ${v} end box`, JSON.stringify(ro))
    await X.press(w, '[data-golive="6"]', { scope: 'board' }); await sleep(600)
  })
}
await X.closeBoard(w)
// ---- Load Original onto working copy, then Undo
await H.gotoWeek(X, w, H.SUNDAY_WK, 'editsched')
await step('load original', async () => {
  await X.press(w, '#eWeek [data-planmenu="6"]'); await sleep(300)
  await X.press(w, `[data-planpv="${versions[0]}"]`); await sleep(700)
  await X.press(w, '#eWeek [data-restore="6"]'); await sleep(700)
  await pic(w, '20-load-original-confirm')
  say('confirm text', await page.evaluate(() => [...document.querySelectorAll('.modal, [role=dialog], .confirm, .ask')].filter(e => e.offsetWidth).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 500)).join(' ;; ')))
  const ok = page.getByRole('button', { name: /Load|Yes|Confirm|Replace/ }).last()
  if (await ok.count()) { await ok.click(); await sleep(900) }
  await pic(w, '21-after-load-original')
  say('after load: Sunday blocks', await page.evaluate(() => JSON.stringify(window.DAYS[6].dutywaves.map(b => b.label + '/' + b.sa + ':' + b.rows[0].str + '-' + b.rows[0].end + '-' + b.rows[0].id))))
  say('after load: note', await page.evaluate(() => document.querySelector('#toast, .toast, #note')?.innerText))
  await H.gotoWeek(X, w, H.MONDAY_WK, 'editsched')
  const m = await X.weekWarn(w, '#eWeek', 0); say('after load: Monday strip', m.head, JSON.stringify(m.items)); await pic(w, '22-after-load-monday')
  await H.gotoWeek(X, w, H.SUNDAY_WK, 'editsched')
  const tr = await X.trace(w, '#eWeek', 6, 'bane'); say('after load: Sunday trace', JSON.stringify(tr))
  await X.press(w, '#undoBtn'); await sleep(900)
  say('after Undo: Sunday blocks', await page.evaluate(() => JSON.stringify(window.DAYS[6].dutywaves.map(b => b.label + '/' + b.sa + ':' + b.rows[0].str + '-' + b.rows[0].end + '-' + b.rows[0].id))))
  await pic(w, '23-after-undo')
})
await X.fin(w)
