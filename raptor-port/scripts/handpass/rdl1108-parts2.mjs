// Walker B's second set of parts: requests, flying plan, settings, Quals, visits, history/bell, two tabs, save failure, clearing.
import { adminCat, V, press, world, signIn, reload, logout, tab, adminUsers, adminData, pickDate, rowText, store, wait, note, bar, undoState, phoneOf } from './rdl1108-lib.mjs'

const err1 = e => String((e && e.message) || e).split(String.fromCharCode(10))[0]
const txt = async (p, sel) => (await p.locator(V(sel)).first().innerText().catch(() => null))?.replace(/\s+/g, ' ').trim() ?? null
const fillNew = async (p, cs, { ini = 'RX', seat = 'FCP', cat = 'C', signin = '', role = 'main', post = null } = {}) => {
  await p.fill('#accAddCs', cs); await p.fill('#accAddIni', ini)
  await p.selectOption('#accAddSeat', seat)
  if (seat !== 'GND') await p.selectOption('#accAddCat', cat)
  await p.fill('#accAddName', signin)
  if (signin && role !== 'main') await p.selectOption('#accAddRole', role)
  if (post) await pickDate(p, '#accAddPostIn', post)
  await press(p, '#accAdd')
}
const openRow = async (p, cs) => { await press(p, `#page-admin .acc-row:has(.acc-name:text-is("${cs}")) .acc-tap`) }
const bellText = async p => {
  const open = await p.locator(V('[data-testid="bell-list"]')).count()
  if (!open) await press(p, '#notifyBell')
  return p.evaluate(() => { const l = document.querySelector('[data-testid="bell-list"]'); return l ? [...l.querySelectorAll('.bl-line, [data-testid="bell-empty"]')].map(x => x.className.includes('unread') ? 'NEW ' + x.textContent.trim().replace(/\s+/g, ' ') : x.textContent.trim().replace(/\s+/g, ' ')) : null })
}
const requestAccess = async (p, signinName, { cs, ini = 'RX', seat = 'FCP', cat = 'C' }) => {
  await p.fill('#luser', signinName); await p.fill('#lpass', 'x')
  if (phoneOf(p)) await p.locator('#loginForm button[type=submit]').tap(); else await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#accCs', { timeout: 8000 }); await wait(p, 500)
  const focus0 = await p.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.tagName))
  await p.fill('#accCs', cs); await p.fill('#accIni', ini); if (seat) await p.selectOption('#accSeat', seat); if (seat && seat !== 'GND' && cat) await p.selectOption('#accCat', cat)
  return focus0
}

/* R — access requests: ask, give access both ways, refuse; the bell of a second admin */
async function partR(br, dist, phone, { step, snap, note_ }) {
  const { ctx, p, errs } = await world(br, dist, { phone })
  const sz = phone ? 'P' : 'D'
  try {
    await adminUsers(p)
    await fillNew(p, 'RDADMIN2', { signin: 'rdadmin2@example.test', role: 'admin' })
    await fillNew(p, 'RDMATCH', { signin: '' })
    await logout(p)
    const f0 = await requestAccess(p, 'rdrequest@example.test', { cs: 'RDREQ1', seat: 'FCP', cat: 'C' })
    await step(p, `R01-${sz}-access-screen`, 'S20', 'unknown sign-in: access screen, where the caret is, then fill', async () => ({ focus: f0, text: await txt(p, '#accForm'), cat: await p.locator('#accCat').inputValue() }))
    await step(p, `R02-${sz}-long-name`, 'S20', '15-character name is refused, 14 accepted', async () => { await p.fill('#accCs', 'ABCDEFGHIJKLMNO'); await press(p, '#accSend'); const e15 = await txt(p, '#accErr'); const long15 = await txt(p, '#accCsLong'); await p.fill('#accCs', 'ABCDEFGHIJKLMN'); return { e15, long15, longAfter: await p.locator(V('#accCsLong')).count() } })
    await step(p, `R04-${sz}-seat-change`, 'S20', 'change Pilot/WSO/Personnel: CAT handling', async () => { await p.selectOption('#accSeat', 'RCP'); const cats = await p.locator('#accCat option').allInnerTexts(); await p.selectOption('#accSeat', 'GND'); const gnd = await p.locator('#accCat').count(); await p.selectOption('#accSeat', 'FCP'); return { cats, gnd, cat: await p.locator('#accCat').inputValue() } })
    await step(p, `R05-${sz}-send`, 'S20', 'valid request sent', async () => { await p.fill('#accIni', 'RX'); await p.selectOption('#accCat', 'C'); await press(p, '#accSend'); return { text: await txt(p, 'body') ? (await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 260))) : null } })
    await logout(p)
    await requestAccess(p, 'rdrequest2@example.test', { cs: 'RDMATCH', ini: 'RM', seat: 'FCP', cat: 'C' })
    await press(p, '#accSend'); await wait(p, 400)
    await logout(p)
    await requestAccess(p, 'rdrequest3@example.test', { cs: 'RDNEWBIE', ini: 'RN', seat: 'RCP', cat: 'B' })
    await press(p, '#accSend'); await wait(p, 400)
    await logout(p)
    await requestAccess(p, 'rdrequest4@example.test', { cs: 'RDBLANK', ini: '', seat: 'GND' })
    await step(p, `R03-${sz}-blank-ini`, 'S20', 'blank initials: sent or refused', async () => { await press(p, '#accSend'); return { err: await txt(p, '#accErr'), text: await p.evaluate(() => document.body.innerText.replace(/s+/g, ' ').slice(0, 200)) } })
    await logout(p)
    await signIn(p, 'rdadmin2@example.test', 'x')
    await step(p, `R06-${sz}-second-admin-bell`, 'S17', 'second admin signed in: the bell and the admin count before viewing Users', async () => ({ bell: await bellText(p), nav: await p.evaluate(() => [...document.querySelectorAll('#topnav .navbadge, .navbadge')].map(e => e.textContent)) }))
    if (await p.locator(V('[data-testid="bell-list"]')).count()) await p.keyboard.press('Escape')
    await tab(p, 'admin')
    await step(p, `R07-${sz}-categories-only`, 'S17', 'Admin categories only (not Users): alert still up on a phone', async () => ({ alert: await p.evaluate(() => [...document.querySelectorAll('.navbadge')].map(e => e.textContent)), bell: await bellText(p) }))
    if (await p.locator(V('[data-testid="bell-list"]')).count()) await p.keyboard.press('Escape')
    await adminUsers(p)
    await step(p, `R08-${sz}-waiting-list`, 'S17', 'Users list: waiting requests', async () => ({ waiting: await p.locator('#admWaiting .acc-row').count(), rows: await p.locator('#admWaiting .acc-row').allInnerTexts().then(a => a.map(x => x.replace(/\s+/g, ' ').replace(/\d+ ?(min|h|d|m)\b.*/, ''))), bell: await bellText(p) }))
    if (await p.locator(V('[data-testid="bell-list"]')).count()) await p.keyboard.press('Escape')
    const approve = req => `#admWaiting .acc-row:has-text("${req}") [data-approve]`
    await step(p, `R09-${sz}-giveaccess-roster`, 'S17', 'Give access on RDMATCH: default mode, note, switch modes, cancel, reopen', async () => { await press(p, approve('RDMATCH')); const a = { mode: await txt(p, '#apvModeRoster'), pressed: await p.locator('#apvModeRoster').getAttribute('aria-pressed'), note: await txt(p, '#apvNote') }; await press(p, '#apvModeNew'); const n = { cs: await p.locator('#apvCs').inputValue(), note: await txt(p, '#apvNote') }; await press(p, '#apvCancel'); await press(p, approve('RDMATCH')); return { a, n, reopen: await p.locator('#apvModeRoster').getAttribute('aria-pressed') } })
    await step(p, `R10-${sz}-approve-roster`, 'S04', 'pick RDMATCH on the roster, give access', async () => { const v = await p.evaluate(() => { const o = [...document.querySelectorAll('#apvPid option')].find(o => o.textContent.trim() === 'RDMATCH'); return o && o.value }); await p.selectOption('#apvPid', v); await press(p, '#apvGo'); return { ...(await snap(p, ['RDMATCH'])), waiting: await p.locator('#admWaiting .acc-row').count() } })
    await step(p, `R11-${sz}-approve-new`, 'S04', 'RDNEWBIE: New person with a future post-in date, give access', async () => { await press(p, approve('RDNEWBIE')); const m = await p.locator('#apvModeNew').getAttribute('aria-pressed'); await pickDate(p, '#apvPostIn', '2026-11-16'); const pi = await p.locator('#apvPostIn').getAttribute('data-value'); await press(p, '#apvGo'); return { m, pi, ...(await snap(p, ['RDNEWBIE'])), waiting: await p.locator('#admWaiting .acc-row').count() } })
    await step(p, `R12-${sz}-refuse`, 'S17', 'Refuse the last request', async () => { await press(p, '#admWaiting [data-decline]'); return { toast: await note(p), waiting: await p.locator('#admWaiting .acc-row').count(), bell: await bellText(p) } })
    await step(p, `R13-${sz}-reload`, 'S17', 'reload: waiting list and rows', async () => { await reload(p); await signIn(p, 'rdadmin2@example.test', 'x'); await adminUsers(p); return { waiting: await p.locator('#admWaiting .acc-row').count(), rows: await rowText(p, 'RDNEWBIE'), match: await rowText(p, 'RDMATCH') } })
  } catch (e) { note_(`R-${sz}-abort`, null, err1(e)) }
  note_(`R-${sz}-errors`, errs.slice(0, 6))
  await ctx.close()
}

/* F — the flying plan on the Leave War: Required figures, a run, the Days window; Undo / Redo / reload */
async function partF(br, dist, phone, { step, snap, note_ }) {
  const { ctx, p, errs } = await world(br, dist, { phone })
  const sz = phone ? 'P' : 'D'
  const D = ['2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13']
  const cells = () => p.evaluate(ds => Object.fromEntries(ds.map(d => [d, (document.querySelector(`[data-testid="req-p-${d}"]`)?.textContent || '?') + '/' + (document.querySelector(`[data-testid="req-w-${d}"]`)?.textContent || '?')])), D)
  const typeFig = async (row, d, figs, withRun) => {
    await press(p, `[data-testid="${row}-${d}"]`)
    if (phoneOf(p)) { if (withRun) await press(p, '[data-testid="fly-edit-run"]'); for (const ch of figs) await press(p, `[data-testid="fly-pad-${ch}"]`, 120); await press(p, '[data-testid="fly-pad-done"]') }
    else { if (withRun) await press(p, '[data-testid="fly-edit-run"]'); await p.keyboard.type(figs); await p.keyboard.press('Enter'); await wait(p, 400); await p.keyboard.press('Escape'); await wait(p, 300) }
  }
  try {
    await tab(p, 'leavewar'); await wait(p, 1200)
    if (phoneOf(p)) { const t = p.locator('[data-testid="counts-toggle"]'); if ((await t.getAttribute('aria-expanded')) !== 'true') await press(p, '[data-testid="counts-toggle"]') }
    await press(p, '[data-testid="month-NOV"]', 700)
    await step(p, `F01-${sz}-start`, 'S01', 'Leave War November: Required cells', async () => ({ cells: await cells(), undo: await undoState(p) }))
    await step(p, `F02-${sz}-pilot7`, 'S01', 'one-date pilot figure 7 on 9 Nov', async () => { await typeFig('req-p', D[0], '7', false); return { cells: await cells(), undo: await undoState(p), toast: await note(p) } })
    await step(p, `F03-${sz}-wso3`, 'S01', 'WSO figure 3 on 9 Nov', async () => { await typeFig('req-w', D[0], '3', false); return { cells: await cells(), undo: await undoState(p) } })
    await step(p, `F04-${sz}-run11`, 'S01', 'pilot run of 11 from 10 Nov', async () => { await typeFig('req-p', D[1], '11', true); return { cells: await cells(), undo: await undoState(p) } })
    await step(p, `F05-${sz}-undo`, 'S01', 'Undo', async () => { await press(p, '#undoBtn'); return { cells: await cells(), undo: await undoState(p), toast: await note(p) } })
    await step(p, `F06-${sz}-redo`, 'S01', 'Redo', async () => { await press(p, '#redoBtn'); return { cells: await cells(), undo: await undoState(p) } })
    await step(p, `F07-${sz}-replace-run`, 'S01', 'replace the pilot figure on 9 Nov with a run from that date', async () => { await typeFig('req-p', D[0], '9', true); return { cells: await cells(), undo: await undoState(p) } })
    await step(p, `F08-${sz}-undo-undo`, 'S01', 'Undo twice', async () => { await press(p, '#undoBtn'); const a = await cells(); await press(p, '#undoBtn'); return { a, b: await cells(), undo: await undoState(p) } })
    await step(p, `F09-${sz}-redo-redo`, 'S01', 'Redo twice then reload (R)', async () => { await press(p, '#redoBtn'); await press(p, '#redoBtn'); const a = await cells(); await reload(p); await signIn(p); await tab(p, 'leavewar'); await wait(p, 1000); if (phoneOf(p)) { const t = p.locator('[data-testid="counts-toggle"]'); if ((await t.getAttribute('aria-expanded')) !== 'true') await press(p, '[data-testid="counts-toggle"]') } await press(p, '[data-testid="month-NOV"]', 700); return { a, afterReload: await cells() } })
    await step(p, `F10-${sz}-days-window`, 'S01', 'Days window: set Thursday 12 Nov to no-fly, then Undo, Redo', async () => {
      await press(p, '[data-testid="settings-open"]'); await press(p, '[data-testid="settings-days"]'); await wait(p, 500)
      const month = await txt(p, '[data-testid="days-month"]')
      const sel = phoneOf(p) ? '[data-testid="days-step-2026-11-12"]' : '[data-testid="days-nf-2026-11-12"]'
      if (phoneOf(p)) { await press(p, sel); await press(p, sel) } else await press(p, sel)
      const a = await cells(); await press(p, '#undoBtn'); const b = await cells(); await press(p, '#redoBtn'); return { month, a, b, c: await cells(), cls: await p.locator('[data-testid="days-step-2026-11-12"], [data-testid="days-nf-2026-11-12"]').first().getAttribute('data-cls').catch(() => null) } })
    await step(p, `F11-${sz}-store`, 'S01', 'store key shapes', async () => store(p))
  } catch (e) { note_(`F-${sz}-abort`, null, err1(e)) }
  note_(`F-${sz}-errors`, errs.slice(0, 6))
  await ctx.close()
}

/* G — settings: Guest view, member filing, Admin → default arrangement; Undo / Redo / reload */
async function partG(br, dist, phone, { step, snap, note_ }) {
  const { ctx, p, errs } = await world(br, dist, { phone })
  const sz = phone ? 'P' : 'D'
  const secOrder = () => p.evaluate(() => [...document.querySelectorAll('#admSecDefault .arrsec, #admSecDefault > *')].map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 8))
  try {
    await adminUsers(p)
    await step(p, `G01-${sz}-guest-on`, 'S10', 'Guest view switch on', async () => { await press(p, '#admGuestView ~ span'); return { on: await p.locator('#admGuestView').isChecked(), toast: await note(p), undo: await undoState(p) } })
    await step(p, `G02-${sz}-guest-undo`, 'S10', 'Undo, Redo', async () => { await press(p, '#undoBtn'); const a = await p.locator('#admGuestView').isChecked(); await press(p, '#redoBtn'); return { a, b: await p.locator('#admGuestView').isChecked(), undo: await undoState(p) } })
    await step(p, `G03-${sz}-guest-reload`, 'S10', 'reload keeps it', async () => { await reload(p); await signIn(p); await adminUsers(p); return { on: await p.locator('#admGuestView').isChecked() } })
    await adminCat(p, 'Squadron config')
    await step(p, `G04-${sz}-secorder-open`, 'S10', 'Squadron config: default arrangement', async () => ({ order: await secOrder() }))
    await step(p, `G05-${sz}-secorder-down`, 'S10', 'move the first section down; Undo; Redo; reload', async () => {
      await press(p, '#admSecDefault .tnudge[aria-label$="down"]'); const a = await secOrder(); const u = await undoState(p)
      await press(p, '#undoBtn'); const b = await secOrder(); await press(p, '#redoBtn'); const c = await secOrder()
      await reload(p); await signIn(p); await adminCat(p, 'Squadron config')
      return { a, u, b, c, afterReload: await secOrder() } })
    await step(p, `G06-${sz}-secorder-reset`, 'S10', 'Reset to standard order', async () => { await press(p, '#admSecDefReset'); return { order: await secOrder(), toast: await note(p) } })
    // Inputs settings: member filing + cut-off
    await tab(p, 'inputs'); await wait(p, 600)
    await step(p, `G07-${sz}-inputs-gear`, 'S10', 'Inputs gear: member filing on, Save', async () => {
      await press(p, '#inGear'); const was = await p.locator('[data-testid="iset-memberfile"]').isChecked()
      await press(p, '[data-testid="iset-memberfile"]'); await press(p, '[data-testid="iset-save"]')
      await press(p, '#inGear'); const now = await p.locator('[data-testid="iset-memberfile"]').isChecked(); await press(p, '[data-testid="iset-cancel"]')
      return { was, now, toast: await note(p), undo: await undoState(p) } })
    await step(p, `G08-${sz}-inputs-undo-reload`, 'S10', 'Undo, Redo, reload', async () => {
      await press(p, '#undoBtn'); await press(p, '#inGear'); const a = await p.locator('[data-testid="iset-memberfile"]').isChecked(); await press(p, '[data-testid="iset-cancel"]')
      await press(p, '#redoBtn'); await press(p, '#inGear'); const b = await p.locator('[data-testid="iset-memberfile"]').isChecked(); await press(p, '[data-testid="iset-cancel"]')
      await reload(p); await signIn(p); await tab(p, 'inputs'); await wait(p, 500); await press(p, '#inGear'); return { a, b, afterReload: await p.locator('[data-testid="iset-memberfile"]').isChecked() } })
  } catch (e) { note_(`G-${sz}-abort`, null, err1(e)) }
  note_(`G-${sz}-errors`, errs.slice(0, 6))
  await ctx.close()
}

/* Q — Quals: edit a flight and a CAT, Save, Undo, Redo, reload */
async function partQ(br, dist, phone, { step, snap, note_ }) {
  const { ctx, p, errs } = await world(br, dist, { phone })
  const sz = phone ? 'P' : 'D'
  const row = cs => p.evaluate(c => { const td = [...document.querySelectorAll('#qtbl td.qname')].find(t => (t.querySelector('input') ? t.querySelector('input').value : t.textContent.trim()) === c); if (!td) return null; const tr = td.closest('tr'); return [...tr.querySelectorAll('input,select')].map(i => i.value).join('|') + ' ¦ ' + tr.innerText.replace(/\s+/g, ' ').slice(0, 80) }, cs)
  try {
    await tab(p, 'quals'); await wait(p, 700)
    await step(p, `Q01-${sz}-start`, 'S03', 'Quals open', async () => ({ ace: await row('Ace'), undo: await undoState(p) }))
    await step(p, `Q02-${sz}-edit-flight`, 'S03', 'Edit on, Ace flight set to "ZZ", Save', async () => {
      await press(p, '#qEdit'); const inp = p.locator(V('#qtbl input[data-flt="dj"]')).first(); await inp.fill('ZZ'); await inp.blur(); await wait(p, 300)
      await press(p, '#qSave'); return { ace: await row('Ace'), toast: await note(p), undo: await undoState(p) } })
    await step(p, `Q03-${sz}-undo-redo`, 'S03', 'Undo, Redo', async () => { await press(p, '#undoBtn'); const a = await row('Ace'); await press(p, '#redoBtn'); return { a, b: await row('Ace'), undo: await undoState(p) } })
    await step(p, `Q04-${sz}-rename`, 'S03', 'rename Ace to AceX on Quals (callsign box), Save; reload', async () => {
      if (!(await p.locator(V('#qtbl input[data-cs="dj"]')).count())) await press(p, '#qEdit')
      const inp = p.locator(V('#qtbl input[data-cs="dj"]')).first()
      if (!(await inp.count())) return { note: 'no callsign box (only Management renames?)' }
      await inp.fill('AceX'); await inp.blur(); await press(p, '#qSave'); const a = await row('AceX'); await reload(p); await signIn(p); await tab(p, 'quals'); await wait(p, 600); return { a, afterReload: await row('AceX'), old: await row('Ace') } })
  } catch (e) { note_(`Q-${sz}-abort`, null, err1(e)) }
  note_(`Q-${sz}-errors`, errs.slice(0, 6))
  await ctx.close()
}

/* H — change-history marks and the bell: a posting by one admin, read by a second */
async function partH(br, dist, phone, { step, snap, note_ }) {
  const { ctx, p, errs } = await world(br, dist, { phone })
  const sz = phone ? 'P' : 'D'
  try {
    await adminUsers(p)
    await fillNew(p, 'RDADMIN2', { signin: 'rdadmin2@example.test', role: 'admin' })
    await fillNew(p, 'RDPOST', { signin: 'rdpost@example.test' })
    await fillNew(p, 'RDFUTURE', { signin: 'rdfuture@example.test', post: '2026-11-16' })
    await openRow(p, 'RDPOST'); await press(p, '#accEdArchive'); await wait(p, 500)
    await step(p, `H01-${sz}-first-admin-bell`, 'S09', 'admin who archived: bell', async () => ({ bell: await bellText(p), toast: await note(p) }))
    if (await p.locator(V('[data-testid="bell-list"]')).count()) await p.keyboard.press('Escape')
    await tab(p, 'editsched'); await press(p, '#eWeek [data-planmenu="0"]'); await press(p, '[data-plandup]'); await wait(p, 600)
    await logout(p); await signIn(p, 'rdadmin2@example.test', 'x')
    await step(p, `H02-${sz}-second-admin-bell`, 'S09', 'second admin: bell lines (posting notice)', async () => ({ bell: await bellText(p) }))
    await step(p, `H03-${sz}-read-one`, 'S09', 'tap one line', async () => { const l = p.locator(V('[data-testid^="bell-line-"]')).first(); if (!(await l.count())) return { none: true }; await l.click(); await wait(p, 600); return { page: await p.evaluate(() => window.CURPAGE), bell: await bellText(p) } })
    await step(p, `H04-${sz}-mark-all`, 'S09', 'Mark all read, then reload: stays read', async () => { if (!(await p.locator(V('[data-testid="bell-list"]')).count())) await press(p, '#notifyBell'); if (await p.locator(V('[data-testid="bell-markall"]')).count()) await press(p, '[data-testid="bell-markall"]'); const a = await bellText(p); await reload(p); await signIn(p, 'rdadmin2@example.test', 'x'); return { a, afterReload: await bellText(p) } })
    if (await p.locator(V('[data-testid="bell-list"]')).count()) await p.keyboard.press('Escape')
    // change history marks
    await tab(p, 'editsched'); await wait(p, 600)
    await step(p, `H05-${sz}-changes-window`, 'S08', 'changes window, Mark all as seen', async () => {
      await press(p, '#histBtn'); await wait(p, 400)
      const before = await p.evaluate(() => document.querySelector('#histBtn')?.textContent.replace(/\s+/g, ' ').trim())
      const mark = p.locator(V('button')).filter({ hasText: /Mark all as seen/ }).first()
      const had = (await mark.count()) ? (await mark.isEnabled() ? 'enabled' : 'disabled') : 'absent'; if (had === 'enabled') { await mark.click(); await wait(p, 400) }
      const after = await p.evaluate(() => document.querySelector('#histBtn')?.textContent.replace(/\s+/g, ' ').trim())
      return { before, had, after, undo: await undoState(p) } })
  } catch (e) { note_(`H-${sz}-abort`, null, err1(e)) }
  note_(`H-${sz}-errors`, errs.slice(0, 6))
  await ctx.close()
}

/* T — two tabs on one origin: opened before the write, a stale tab writes something else, reload both */
async function partT(br, dist, phone, { step, snap, note_ }) {
  const { ctx, p, errs, watch } = await world(br, dist, { phone })
  const sz = phone ? 'P' : 'D'
  try {
    await adminUsers(p)
    await fillNew(p, 'RDTWOA', { signin: 'rdtwoa@example.test' })
    await fillNew(p, 'RDTWOB', { signin: 'rdtwob@example.test' })
    const p2 = await ctx.newPage(); watch(p2)
    await p2.clock.install({ time: new Date('2026-11-08T09:00:00+08:00') })
    await p2.goto(p.url()); await signIn(p2); await adminUsers(p2)
    await step(p, `T01-${sz}-write-in-tab1`, 'S11', 'tab 1: change RDTWOA sign-in', async () => { await openRow(p, 'RDTWOA'); await p.fill('#accEdName', 'rdtwoa1@example.test'); await press(p, '#accEdSave'); return snap(p, ['RDTWOA']) })
    await step(p2, `T02-${sz}-stale-write-tab2`, 'S11', 'tab 2 (stale): change RDTWOB sign-in', async () => { const before = await rowText(p2, 'RDTWOA'); await openRow(p2, 'RDTWOB'); await p2.fill('#accEdName', 'rdtwob2@example.test'); await press(p2, '#accEdSave'); return { before, ...(await snap(p2, ['RDTWOA', 'RDTWOB'])) } })
    await step(p2, `T03-${sz}-stale-same-record`, 'S11', 'tab 2 (stale): change RDTWOA too (same record)', async () => { await openRow(p2, 'RDTWOA'); await p2.fill('#accEdName', 'rdtwoa2@example.test'); await press(p2, '#accEdSave'); return snap(p2, ['RDTWOA', 'RDTWOB']) })
    await step(p, `T04-${sz}-reload-both`, 'S11', 'reload both tabs', async () => { await reload(p); await signIn(p); await adminUsers(p); await reload(p2); await signIn(p2); await adminUsers(p2); return { tab1: await snap(p, ['RDTWOA', 'RDTWOB']), tab2: await snap(p2, ['RDTWOA', 'RDTWOB']) } })
    await p2.close()
  } catch (e) { note_(`T-${sz}-abort`, null, err1(e)) }
  note_(`T-${sz}-errors`, errs.slice(0, 6))
  await ctx.close()
}

/* S — ?savefail: every save in the tab fails; the band and Retry; changes stay in memory */
async function partS(br, dist, phone, { step, snap, note_ }) {
  const { ctx, p, errs } = await world(br, dist, { phone, q: '?savefail' })
  const sz = phone ? 'P' : 'D'
  try {
    await adminUsers(p)
    await step(p, `S01-${sz}-band-after-add`, 'S07', 'add a person with sign-in under ?savefail', async () => { await fillNew(p, 'RDFAIL', { signin: 'rdfail@example.test' }); await wait(p, 1500); return { ...(await snap(p, ['RDFAIL'])), band: await txt(p, '.savestat, [role=status]') } })
    await step(p, `S02-${sz}-edit-fail`, 'S07', 'edit sign-in, then Undo / Redo with the band up', async () => { await openRow(p, 'RDFAIL'); await p.fill('#accEdName', 'rdfail2@example.test'); await press(p, '#accEdSave'); await wait(p, 1500); const a = await snap(p, ['RDFAIL']); await press(p, '#undoBtn'); const b = await rowText(p, 'RDFAIL'); await press(p, '#redoBtn'); return { a, b, c: await rowText(p, 'RDFAIL') } })
    await step(p, `S03-${sz}-retry`, 'S07', 'Retry keeps failing', async () => { const r = p.locator(V('.savestat button, [role=status] button')).first(); const had = await r.count(); if (had) { await r.click(); await wait(p, 1500) } return { had, band: await txt(p, '.savestat, [role=status]') } })
    await step(p, `S04-${sz}-guest-switch`, 'S07', 'settings edit (Guest view) under savefail', async () => { await press(p, '#admGuestView ~ span'); await wait(p, 1200); return { on: await p.locator('#admGuestView').isChecked(), band: await txt(p, '.savestat, [role=status]'), undo: await undoState(p) } })
    await step(p, `S05-${sz}-reload-lost`, 'S07', 'reload without the switch: nothing kept', async () => { await reload(p, ''); await signIn(p); await adminUsers(p); return { rdfail: await rowText(p, 'RDFAIL'), guest: await p.locator('#admGuestView').isChecked() } })
    // request under savefail
    await reload(p, '?savefail'); await signIn(p).catch(() => {})
    await logout(p)
    await requestAccess(p, 'rdfailreq@example.test', { cs: 'RDFREQ', ini: 'RF' })
    await step(p, `S06-${sz}-request-notsent`, 'S07', 'request under savefail: Not sent yet', async () => { await press(p, '#accSend'); await wait(p, 1500); return { text: await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 300)) } })
  } catch (e) { note_(`S-${sz}-abort`, null, err1(e)) }
  note_(`S-${sz}-errors`, errs.slice(0, 6))
  await ctx.close()
}

/* D — Admin → Data: both clearing forms on real edit-history entries (count, arm, disarm on change, clear) */
async function partD(br, dist, phone, { step, snap, note_ }) {
  const { ctx, p, errs } = await world(br, dist, { phone })
  const sz = phone ? 'P' : 'D'
  try {
    await adminUsers(p)
    await fillNew(p, 'RDCLR', { signin: 'rdclr@example.test' })
    await openRow(p, 'RDCLR'); await p.fill('#accEdName', 'rdclr2@example.test'); await press(p, '#accEdSave')
    await adminData(p)
    await step(p, `D01-${sz}-forms`, 'S19', 'both forms: labels, modes', async () => ({ forms: await p.evaluate(() => ['admWipe', 'admLog'].map(i => ({ mode: document.getElementById(i + 'Mode')?.value, lbl: document.querySelector(`label[for=${i}Mode]`)?.textContent, btn: document.getElementById(i)?.textContent, dis: document.getElementById(i)?.disabled }))) }))
    await step(p, `D02-${sz}-log-specific`, 'S19', 'edit history: specific date 8 Nov, arm', async () => { await p.selectOption('#admLogMode', 'on'); await pickDate(p, '#admLogDate', '2026-11-08'); await press(p, '#admLog'); return { btn: await txt(p, '#admLog'), toast: await note(p) } })
    await step(p, `D03-${sz}-log-disarm`, 'S19', 'change mode: disarms', async () => { await p.selectOption('#admLogMode', 'before'); return { btn: await txt(p, '#admLog'), dis: await p.locator('#admLog').isDisabled() } })
    await step(p, `D04-${sz}-log-older-zero`, 'S19', 'older than 7 Nov: zero', async () => { await pickDate(p, '#admLogDate', '2026-11-07'); await press(p, '#admLog'); return { btn: await txt(p, '#admLog'), toast: await note(p) } })
    await step(p, `D05-${sz}-log-range`, 'S19', 'range 5–7 Nov: zero; range mode shows the calendar', async () => { await p.selectOption('#admLogMode', 'range'); const run = await p.locator(V('#admLogRun')).count(); await press(p, '#admLogRun [data-testid^="dcal-day-2026-11-05"], #admLogRun [data-iso="2026-11-05"]').catch(() => {}); return { run, group: await p.locator('#admLogRun').getAttribute('role'), labelled: await p.locator('#admLogRun').getAttribute('aria-labelledby'), btn: await txt(p, '#admLog') } })
    await step(p, `D06-${sz}-log-clear-today`, 'S19', 'specific date 8 Nov: arm then clear', async () => { await p.selectOption('#admLogMode', 'on'); await pickDate(p, '#admLogDate', '2026-11-08'); await press(p, '#admLog'); const armed = await txt(p, '#admLog'); await press(p, '#admLog'); return { armed, toast: await note(p), btn: await txt(p, '#admLog'), undo: await undoState(p) } })
    await step(p, `D07-${sz}-wipe-zero`, 'S19', 'old clutter: older than 7 Nov, nothing to clear', async () => { await pickDate(p, '#admWipeDate', '2026-11-07'); await press(p, '#admWipe'); return { btn: await txt(p, '#admWipe'), toast: await note(p) } })
    await step(p, `D08-${sz}-period-label`, 'S18', 'press the Period label of each form', async () => { const out = {}; for (const i of ['admWipe', 'admLog']) { await p.locator(V(`.adm-clear:has(#${i}Mode) label`)).first().click(); out[i] = await p.evaluate(() => document.activeElement && document.activeElement.id) } return out })
  } catch (e) { note_(`D-${sz}-abort`, null, err1(e)) }
  note_(`D-${sz}-errors`, errs.slice(0, 6))
  await ctx.close()
}

/* E — roles: the member signs in as `us`; what Admin shows; Undo cleared on sign-out */
async function partE(br, dist, phone, { step, snap, note_ }) {
  const { ctx, p, errs } = await world(br, dist, { phone })
  const sz = phone ? 'P' : 'D'
  try {
    await adminUsers(p)
    await fillNew(p, 'RDMEMBER', { signin: 'rdmember@example.test' })
    await step(p, `E01-${sz}-admin-undo-before`, 'S21', 'admin: Undo state', async () => undoState(p))
    await logout(p); await signIn(p, 'us', 'us')
    await step(p, `E02-${sz}-member-nav`, 'S21', 'member: pages and Undo', async () => ({ nav: await p.evaluate(() => [...document.querySelectorAll('#topnav a, #drawerNav a')].map(a => a.dataset.page)), undo: await undoState(p), page: await p.evaluate(() => window.CURPAGE) }))
    await tab(p, 'quals'); await wait(p, 600)
    await step(p, `E03-${sz}-member-quals`, 'S21', 'member: Quals edit controls', async () => ({ edit: await p.locator(V('#qEdit')).count(), save: await p.locator(V('#qSave')).count(), add: await p.locator(V('#qAddToggle')).count() }))
    await step(p, `E04-${sz}-member-admin-route`, 'S21', 'member: Admin page reachable?', async () => { const r = await p.evaluate(() => { try { window.go('admin') } catch (e) { return String(e) } return window.CURPAGE }); await wait(p, 500); return { r, deny: await p.locator('#admDeny').count(), users: await p.locator('#accList').count(), nav: await p.locator('#topnav a[data-page="admin"]').count() } })
    await logout(p); await signIn(p, 'rdmember@example.test', 'x')
    await step(p, `E05-${sz}-new-member`, 'S21', 'new member signs in: welcome / pages / Undo', async () => ({ nav: await p.evaluate(() => [...document.querySelectorAll('#topnav a, #drawerNav a')].map(a => a.dataset.page)), welcome: await p.locator('#welcomeBack').count(), undo: await undoState(p) }))
  } catch (e) { note_(`E-${sz}-abort`, null, err1(e)) }
  note_(`E-${sz}-errors`, errs.slice(0, 6))
  await ctx.close()
}

/* V — visits: Approvals and one's own window on the Leave War */
async function partV(br, dist, phone, { step, snap, note_ }) {
  const { ctx, p, errs } = await world(br, dist, { phone })
  const sz = phone ? 'P' : 'D'
  const lwKeys = () => p.evaluate(() => { const o = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/seen/.test(k)) o.push(k.replace(/[0-9a-f-]{12,}/g, 'ID')) } return o.sort() })
  try {
    await tab(p, 'leavewar'); await wait(p, 1200)
    await step(p, `V01-${sz}-war-open`, 'S02', 'Leave War open: approvals count', async () => ({ count: await txt(p, '[data-testid="lw-approvals-count"]'), seen: await lwKeys() }))
    await step(p, `V02-${sz}-approvals-first`, 'S02', 'first visit to Approvals', async () => { await press(p, '[data-testid="lw-tab-approvals"]', 700); return { count: await txt(p, '[data-testid="lw-approvals-count"]'), seen: await lwKeys(), undo: await undoState(p) } })
    await step(p, `V03-${sz}-approvals-leave-return`, 'S02', 'back to the grid and again; reload', async () => { await press(p, '[data-testid="lw-tab-grid"]', 600); await press(p, '[data-testid="lw-tab-approvals"]', 600); const a = await lwKeys(); await reload(p); await signIn(p); await tab(p, 'leavewar'); await wait(p, 1000); return { a, afterReload: await lwKeys(), count: await txt(p, '[data-testid="lw-approvals-count"]') } })
    await step(p, `V04-${sz}-my-leave`, 'S02', 'own window: My leave', async () => { await press(p, '[data-testid="lw-tab-grid"]', 600).catch(() => {}); await press(p, '[data-testid="my-leave"]', 700); const a = await lwKeys(); return { a, win: (await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 120))) } })
  } catch (e) { note_(`V-${sz}-abort`, null, err1(e)) }
  note_(`V-${sz}-errors`, errs.slice(0, 6))
  await ctx.close()
}

export const PARTS2 = { R: partR, F: partF, G: partG, Q: partQ, H: partH, T: partT, S: partS, D: partD, E: partE, V: partV }
