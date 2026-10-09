/* P2-12 — everyone allowed to read gets the working; only admins alter planning (D636, D640, D643). */
import * as B from './cal-B-lib.mjs'
const size = process.argv[2] || 'desk'
const role = process.argv[3] || 'admin'   // admin | memberview | ranger | sans
const who = role === 'ranger' ? ['us', 'us'] : ['ad', 'a']
const w = await B.world(size, { who })
const p = w.page, S = w.key + '-' + role
const pics = [], log = [], checks = []
const note = (k, v) => { log.push(`${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`); console.log('  >', k, typeof v === 'string' ? v : JSON.stringify(v)) }
const chk = (name, ok, detail = '') => { checks.push([name, !!ok, detail]); console.log(ok ? '  ok' : '  XX', name, detail) }
const D = '2026-02-10', EV = '2026-02-17'
const isAdminRole = role === 'admin'
if (role === 'memberview') {
  /* the real switch */
  if (w.phone) { await B.press(w, p.locator('#burger')); await B.sleep(400); await B.press(w, p.locator('#drawerRole')) } else await B.press(w, p.locator('#roleBadge'))
  await B.sleep(700)
  note('switched to member view: badge', await p.evaluate(() => (document.querySelector('#roleBadge') || {}).innerText || document.querySelector('#drawerAcct')?.innerText))
}
if (role === 'sans') {
  const id = await p.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].san))
  const cs = await p.evaluate(i => window.PEOPLE[i].cs, id)
  await p.evaluate(i => { window.raptorMe(i); window.raptorRole('member'); window.lwSetRole('member') }, id)
  await B.sleep(700)
  note('SANS person (identity swapped in place)', `${id} ${cs}`)
}
/* the admin world types a Required figure first so a real figure sits under the attempts */
await B.press(w, B.tid(w, 'month-FEB')); await B.sleep(700)
await p.evaluate(() => window.scrollTo(0, 0)); await B.sleep(200)
const body = () => p.evaluate(() => document.querySelector('[data-testid="req-p-2026-02-10"]') && document.querySelector('[data-testid="req-p-2026-02-10"]').innerText.trim())
const dlgs = () => p.evaluate(() => [...document.querySelectorAll('[role=dialog]')].map(e => e.getAttribute('data-testid') + ':' + e.innerText.replace(/\s+/g, ' ').trim().slice(0, 160)))
const close = async () => { await p.keyboard.press('Escape'); await B.sleep(250); if (w.phone) { /* tap away */ await B.touchTap(w, 205, 24); await B.sleep(250) } }
/* 1. tap Available P */
await B.reveal(w, D, 'avail-p')
await p.evaluate(() => window.scrollTo(0, 0)); await B.sleep(200)
await B.press(w, B.cell(w, 'avail-p', D)); await B.sleep(350)
const work = await B.txt(B.tid(w, 'fly-working'))
note('1 tapped Available P ' + D, work)
pics.push(await B.pic(p, `P2-12-${S}-1-available-working`))
chk('Available P tap gives the working (Required / Available / SANS committed / Still needed)', /Required/.test(work) && /Available/.test(work) && /SANS committed/.test(work) && /Still needed/.test(work), work)
const workInputs = await p.evaluate(() => document.querySelectorAll('[data-testid="fly-working"] input, [data-testid="fly-working"] button').length)
chk('the working is read only (no input or button in it)', workInputs === 0, 'inputs/buttons: ' + workInputs)
await close()
/* 2. tap a filled Event cell */
await B.reveal(w, EV, 'event-0')
await p.evaluate(() => window.scrollTo(0, 0)); await B.sleep(200)
await B.press(w, B.tid(w, `event-0-${EV}`)); await B.sleep(350)
const peek = await B.txt(B.tid(w, 'event-peek')); const hasEdit = (await B.tid(w, 'event-peek-edit').count()) > 0; const sheetUp = (await B.tid(w, 'event-sheet').count()) > 0
note('2 tapped filled Event ' + EV, `${peek} | Edit button: ${hasEdit} | sheet open: ${sheetUp}`)
pics.push(await B.pic(p, `P2-12-${S}-2-event-peek`))
chk('a filled Event cell gives its name and kind to this role', /PH/.test(peek) && /Public holiday/.test(peek), peek)
chk(isAdminRole ? 'admin sees Edit on the peek' : 'no Edit on the peek for a non-admin role', hasEdit === isAdminRole, 'Edit=' + hasEdit)
chk('no event sheet opened for a read', !sheetUp, 'sheet=' + sheetUp)
await close()
/* 3. Required typing attempt */
await B.reveal(w, D, 'req-p'); await p.evaluate(() => window.scrollTo(0, 0)); await B.sleep(200)
const before = await body()
await B.press(w, B.cell(w, 'req-p', D)); await B.sleep(350)
const editor = await p.evaluate(() => document.querySelectorAll('[data-testid="fly-edit-input"], [data-testid="fly-edit-touch"], [data-testid="fly-pad"]').length)
note('3 pressed Required P cell ' + D, `typing box/pad up: ${editor}; cell shows ${await body()}`)
pics.push(await B.pic(p, `P2-12-${S}-3-required-press`))
chk(isAdminRole ? 'admin: a press opens the typing box' : 'non-admin: a press opens no typing box', (editor > 0) === isAdminRole, 'editor elements: ' + editor)
if (editor) { if (w.phone) await B.press(w, B.tid(w, 'fly-pad-done')); else await p.keyboard.press('Escape'); await B.sleep(250) }
/* a typed attempt for non-admins: try typing digits anyway */
if (!isAdminRole && !w.phone) { await p.keyboard.type('77'); await p.keyboard.press('Enter'); await B.sleep(300) }
chk('the Required figure is unchanged by the attempt', (await body()) === before, `${before} -> ${await body()}`)
/* 4. a drag over Required cells */
await B.dragPick(w, B.cell(w, 'req-p', D), B.cell(w, 'req-w', '2026-02-12'))
const panel = await B.tid(w, 'req-panel').count()
note('4 dragged over Required cells', 'panel up: ' + panel)
pics.push(await B.pic(p, `P2-12-${S}-4-required-drag`))
chk(isAdminRole ? 'admin: the drag opens the Required panel' : 'non-admin: the drag opens no panel', (panel > 0) === isAdminRole, 'panel=' + panel)
if (panel) { await B.press(w, B.tid(w, 'req-panel-x')); await B.sleep(250) }
/* 5. the name buttons */
const nameBtn = await B.tid(w, 'fly-name-avail-p').count(), reqName = await B.tid(w, 'fly-name-req-p').count()
note('5 name buttons', `Available P name is a button: ${nameBtn}; Required P name is a button: ${reqName}`)
chk(isAdminRole ? 'admin: Available name is a button' : 'non-admin: Available name is plain text', (nameBtn > 0) === isAdminRole, 'name button count ' + nameBtn)
chk('Required names are never buttons', reqName === 0, '' + reqName)
/* 6. an Available tap opens no definition editor */
await B.press(w, p.locator('[data-testid="fly-row-avail-p"] .who')); await B.sleep(300)
const form = await B.tid(w, 'counter-form').count()
chk(isAdminRole ? 'admin: tapping the name opens the form' : 'non-admin: tapping the name opens no form', (form > 0) === isAdminRole, 'form=' + form)
if (form) { await B.press(w, B.tid(w, 'cform-cancel')); await B.sleep(250) }
const bad = checks.filter(c => !c[1])
B.row('P2-12', S, `Role ${role}: tapped Available P, tapped a filled Event (PH on 17 Feb), pressed and typed on a Required cell, dragged across Required cells, tapped the Available name`,
  checks.map(c => `${c[1] ? 'ok' : 'XX'} ${c[0]} [${c[2]}]`).join(' | ') + ' || ' + log.join(' || '), bad.length ? 'FAIL' : 'PASS', pics)
B.noteErrors('p212-' + S, w.errors)
await B.close(w)
