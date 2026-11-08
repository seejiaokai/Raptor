// Walker C's parts ([RD-LEFT-1108], 8 Nov 26, chat 32): what walker B did not reach.
//   C14 — S14, hidden is different from closed (the route matrix, roster editor and archived editor)
//   C15 — S15, changes elsewhere while an editor is open
//   C19 — S19 with real clutter on the Inputs calendar, then Admin -> Data's two clearing forms
// Every step id starts "c-" so its picture name cannot collide with another walker's.
import { adminCat, V, press, world, signIn, reload, logout, tab, adminUsers, adminData, pickDate, rowText, wait, note, bar, undoState, phoneOf } from './rdl1108-lib.mjs'

const err1 = e => String((e && e.message) || e).split(String.fromCharCode(10))[0]
const txt = async (p, sel) => (await p.locator(V(sel)).first().innerText().catch(() => null))?.replace(/\s+/g, ' ').trim() ?? null
const val = async (p, sel) => (await p.locator(V(sel)).first().inputValue().catch(() => null))
const fillNew = async (p, cs, { ini = 'RX', seat = 'FCP', cat = 'C', signin = '' } = {}) => {
  await p.fill('#accAddCs', cs); await p.fill('#accAddIni', ini)
  await p.selectOption('#accAddSeat', seat)
  if (seat !== 'GND') await p.selectOption('#accAddCat', cat)
  await p.fill('#accAddName', signin)
  await press(p, '#accAdd')
}
const openRow = async (p, cs) => { await press(p, `#page-admin .acc-row:has(.acc-name:text-is("${cs}")) .acc-tap`) }
const archList = p => p.locator(V('#accArchList')).count()
const openArch = async (p, cs) => {
  if (!(await archList(p))) await press(p, '#accArchToggle')
  await press(p, `#accArchList .acc-row:has(.acc-name:text-is("${cs}")) .acc-tap`)
}

/* the state of the roster editor / the archived editor, read off the screen */
const rosterState = async p => ({ open: (await p.locator(V('#accEdName')).count()) > 0, name: await val(p, '#accEdName'), role: await val(p, '#accEdRole'), del: await txt(p, '#accEdDel'), note: (await p.locator(V('#accEdDelNote')).count()) > 0 })
const archState = async p => ({ listOpen: (await archList(p)) > 0, open: (await p.locator(V('#accArCs')).count()) > 0, cs: await val(p, '#accArCs'), del: await txt(p, '#accArDel'), restore: await txt(p, '#accArRestore') })

/* S14 — hidden is different from closed */
async function partC14(br, dist, phone, { step, note_ }) {
  const { ctx, p, errs } = await world(br, dist, { phone })
  const sz = phone ? 'P' : 'D'
  const prepRoster = async () => {
    if (await p.locator(V('#accEdName')).count()) await press(p, '#accEdCancel')
    await openRow(p, 'RDACTIVE'); await p.fill('#accEdName', 'unsaved@example.test'); await press(p, '#accEdDel')
    return rosterState(p)
  }
  const prepArch = async () => {
    if (await p.locator(V('#accArCs')).count()) await press(p, '#accArCancel')
    await openArch(p, 'RDARCH'); await p.fill('#accArCs', 'DRAFTCS'); await press(p, '#accArDel')
    return archState(p)
  }
  const toUsers = async () => { await adminUsers(p) }
  /* each route is [id, label, go(), back()] — go hides Users, back brings it into view again */
  const routes = [
    ['cat', 'change Admin category (Squadron config) and come back', async () => { if (phoneOf(p)) { await press(p, '.adm-back') } await press(p, '.adm-cat:has-text("Squadron config")') }, async () => { if (phoneOf(p)) await press(p, '.adm-back'); await press(p, '.adm-cat:has-text("Users")') }],
    ...(phone ? [['back', 'phone: the category back button, then Users again', async () => { await press(p, '.adm-back') }, async () => { await press(p, '.adm-cat:has-text("Users")') }]] : []),
    ['quals', 'leave Admin for Quals and come back', async () => { await tab(p, 'quals'); await wait(p, 500) }, async () => { await toUsers() }],
    ['search', 'type in Users search (row hidden), then clear it', async () => { await p.fill('#accFind', 'zzzznomatch'); await wait(p, 500) }, async () => { await p.fill('#accFind', ''); await wait(p, 500) }],
    ['fold', 'fold Archived, unfold it', async () => { if (await archList(p)) await press(p, '#accArchToggle') }, async () => { if (!(await archList(p))) await press(p, '#accArchToggle') }],
  ]
  try {
    await adminUsers(p)
    await fillNew(p, 'RDACTIVE', { signin: 'rdactive@example.test' })
    await fillNew(p, 'RDARCH', { signin: 'rdarch@example.test' })
    await openRow(p, 'RDARCH'); await press(p, '#accEdArchive'); await wait(p, 500)
    for (const kind of ['roster', 'arch']) {
      for (const [rid, label, go, back] of routes) {
        const id = `c-S14-${sz}-${kind}-${rid}`
        await step(p, id, 'S14', `${kind} editor: unsaved text + Delete armed; ${label}`, async () => {
          const before = kind === 'roster' ? await prepRoster() : await prepArch()
          await go()
          const hiddenState = kind === 'roster' ? { rowThere: (await p.locator(V('#accList .acc-row')).count()) > 0 } : { listOpen: (await archList(p)) > 0 }
          await back()
          await wait(p, 500)
          const st = kind === 'roster' ? await rosterState(p) : await archState(p)
          let reopened = null
          if (!st.open) { if (kind === 'roster') { await openRow(p, 'RDACTIVE'); reopened = await rosterState(p) } else { await openArch(p, 'RDARCH'); reopened = await archState(p) } }
          return { before, hiddenState, afterReturn: st, reopened }
        })
      }
    }
  } catch (e) { note_(`C14-${sz}-abort`, null, err1(e)) }
  note_(`C14-${sz}-errors`, errs.slice(0, 6))
  await ctx.close()
}

/* Quals: rename a person by the callsign cell (edit mode), Save; returns what the cell showed, or why not */
const qualsRename = async (p, from, to) => {
  await tab(p, 'quals'); await wait(p, 700)
  if (!(await p.locator(V('#qtbl td.qname input')).count())) await press(p, '#qEdit')
  const idx = await p.locator('#qtbl td.qname input').evaluateAll((els, c) => els.findIndex(e => e.value === c), from)
  if (idx < 0) return { renamed: false, why: 'no callsign cell holds ' + from, boxes: await p.locator('#qtbl td.qname input').count() }
  const inp = p.locator('#qtbl td.qname input').nth(idx)
  await inp.fill(to); await inp.blur(); await wait(p, 300)
  await press(p, '#qSave')
  return { renamed: true, toast: await note(p) }
}

/* S15 — changes elsewhere while an editor is open */
async function partC15(br, dist, phone, { step, note_ }) {
  const { ctx, p, errs, watch } = await world(br, dist, { phone })
  const sz = phone ? 'P' : 'D'
  const snapRow = async cs => ({ row: await rowText(p, cs), editor: await rosterState(p), toast: await note(p), undo: await undoState(p) })
  try {
    await adminUsers(p)
    await fillNew(p, 'RDACTIVE', { signin: 'rdactive@example.test' })
    await step(p, `c-S15-${sz}-1-draft-open`, 'S15', 'open RDACTIVE editor, type a draft sign-in', async () => { await openRow(p, 'RDACTIVE'); await p.fill('#accEdName', 'draft-typed@example.test'); return snapRow('RDACTIVE') })
    await step(p, `c-S15-${sz}-2-quals-rename`, 'S15', 'go to Quals, rename RDACTIVE to RDACTIVX (callsign cell)', async () => qualsRename(p, 'RDACTIVE', 'RDACTIVX'))
    await step(p, `c-S15-${sz}-3-back-to-users`, 'S15', 'come back to Users: row heading, editor open?, what it holds', async () => { await adminUsers(p); return { old: await rowText(p, 'RDACTIVE'), renamed: await rowText(p, 'RDACTIVX'), editor: await rosterState(p), toast: await note(p) } })
    await step(p, `c-S15-${sz}-4-save`, 'S15', 'Save the editor (if open): what was saved', async () => {
      const had = (await p.locator(V('#accEdSave')).count()) > 0
      if (had) await press(p, '#accEdSave')
      return { had, renamed: await rowText(p, 'RDACTIVX'), old: await rowText(p, 'RDACTIVE'), toast: await note(p), undo: await undoState(p) } })
    const cs = (await rowText(p, 'RDACTIVX')) ? 'RDACTIVX' : 'RDACTIVE'
    await step(p, `c-S15-${sz}-5-suspend`, 'S15', 'Suspend that person (editor button)', async () => { if (!(await p.locator(V('#accEdOnOff')).count())) await openRow(p, cs); await press(p, '#accEdOnOff'); return snapRow(cs) })
    await step(p, `c-S15-${sz}-6-undo-while-open`, 'S15', 'open the editor again, type a draft, press Undo (top bar) while it is open', async () => {
      if (!(await p.locator(V('#accEdName')).count())) await openRow(p, cs)
      await p.fill('#accEdName', 'draft-before-undo@example.test')
      const pre = await snapRow(cs)
      await press(p, '#undoBtn')
      return { pre, after: await snapRow(cs) } })
    await step(p, `c-S15-${sz}-7-after-undo-save`, 'S15', 'Save after the Undo (if the editor is open)', async () => { const had = (await p.locator(V('#accEdSave')).count()) > 0; if (had) await press(p, '#accEdSave'); return { had, ...(await snapRow(cs)) } })
    await step(p, `c-S15-${sz}-8-nav-away-back`, 'S15', 'type a draft, go to Quals, come back: editor and draft', async () => {
      if (!(await p.locator(V('#accEdName')).count())) await openRow(p, cs)
      await p.fill('#accEdName', 'draft-nav@example.test')
      await tab(p, 'quals'); await wait(p, 400); await adminUsers(p)
      return snapRow(cs) })
    // the archived editor
    await fillNew(p, 'RDARCHQ', { signin: '' })
    await openRow(p, 'RDARCHQ'); await press(p, '#accEdArchive'); await wait(p, 500)
    await step(p, `c-S15-${sz}-9-arch-draft`, 'S15', 'archived editor: type a callsign draft', async () => { await openArch(p, 'RDARCHQ'); await p.fill('#accArCs', 'RDARCHDRAFT'); return { st: await archState(p), undo: await undoState(p) } })
    if (!phone) {
      const p2 = await ctx.newPage(); watch(p2)
      await p2.clock.install({ time: new Date('2026-11-08T09:00:00+08:00') })
      await p2.goto(p.url()); await signIn(p2); await adminUsers(p2)
      await step(p2, `c-S15-${sz}-10-tab2-rename`, 'S15', 'second tab: rename the archived person on Quals (or where it can be renamed)', async () => {
        const r = await qualsRename(p2, 'RDARCHQ', 'RDARCHQ2')
        if (r.renamed) return { via: 'Quals', ...r }
        await adminUsers(p2); await press(p2, '#accArchToggle'); await openArch(p2, 'RDARCHQ'); await p2.fill('#accArCs', 'RDARCHQ2'); await press(p2, '#accArSave')
        return { via: 'tab 2 archived editor Save name (not on Quals)', quals: r, row: await rowText(p2, 'RDARCHQ2') } })
      await step(p, `c-S15-${sz}-11-tab1-save-name`, 'S15', 'first tab, no reload: Save name on the stale archived editor', async () => {
        const before = { st: await archState(p) }
        const had = (await p.locator(V('#accArSave')).count()) > 0
        if (had) await press(p, '#accArSave')
        return { before, had, old: await rowText(p, 'RDARCHQ'), draft: await rowText(p, 'RDARCHDRAFT'), renamed2: await rowText(p, 'RDARCHQ2'), toast: await note(p), st: await archState(p) } })
      await step(p, `c-S15-${sz}-12-reload-both`, 'S15', 'reload both tabs: the archived people', async () => {
        await reload(p); await signIn(p); await adminUsers(p); await press(p, '#accArchToggle')
        await reload(p2); await signIn(p2); await adminUsers(p2); await press(p2, '#accArchToggle')
        const names = async q => q.evaluate(() => [...document.querySelectorAll('#accArchList .acc-name')].map(e => e.textContent.trim()).sort())
        return { tab1: await names(p), tab2: await names(p2) } })
      await p2.close()
    }
  } catch (e) { note_(`C15-${sz}-abort`, null, err1(e)) }
  note_(`C15-${sz}-errors`, errs.slice(0, 6))
  await ctx.close()
}

/* S19 — real clutter */
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
async function calMonth(p, iso) {
  const want = +iso.slice(0, 4) * 12 + +iso.slice(5, 7)
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').first().innerText()).trim().toLowerCase().split(/\s+/)
    const d = want - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)) + 1)
    if (!d) return
    await press(p, d > 0 ? '#icNext' : '#icPrev', 350)
  }
}
async function openDay(p, iso) {
  await calMonth(p, iso)
  const l = p.locator(`#inpCal [data-icday="${iso}"]`).first()
  if (phoneOf(p)) await l.tap({ position: { x: 10, y: 10 }, timeout: 6000 }); else await l.click({ position: { x: 10, y: 10 }, timeout: 6000 })
  await p.locator('[data-testid="win-inputsday"]').waitFor({ timeout: 6000 }); await wait(p, 500)
}
async function closeDay(p) {
  await p.keyboard.press('Escape'); await wait(p, 400)
  if (await p.locator(V('[data-testid="win-inputsday"]')).count()) { const x = p.locator(V('[data-testid="win-inputsday"] .x, [data-testid="win-inputsday"] [aria-label="Close"]')).first(); if (await x.count()) await press(p, '[data-testid="win-inputsday"] .x, [data-testid="win-inputsday"] [aria-label="Close"]') }
}
async function addNote(p, iso, words) {
  await openDay(p, iso)
  await press(p, '#icAddPuck')
  await p.locator('.ic-newnote .ic-poppuck-edit').fill(words); await p.locator('.ic-newnote .ic-poppuck-edit').press('Enter'); await wait(p, 500)
}
async function addTitle(p, iso, words) {
  await openDay(p, iso)
  await p.locator('#icRmkEdit').fill(words); await p.locator('#icRmkEdit').press('Enter'); await wait(p, 400)
}
/* what the Inputs calendar draws for each day: note chips and the day title, read from the month's heads */
async function calRead(p, days) {
  await tab(p, 'inputs'); await p.waitForSelector('#inpCal', { timeout: 8000 })
  const out = {}
  for (const iso of days) {
    await calMonth(p, iso)
    out[iso] = await p.evaluate(i => {
      const h = document.querySelector(`[data-ichead="${i}"]`)
      if (!h) return 'no head drawn'
      return { notes: [...h.querySelectorAll('.ic-chip.plan')].map(e => e.textContent.trim()), title: (h.querySelector('.ic-rmk') || {}).textContent || '' }
    }, iso)
  }
  return out
}
const schedHash = p => p.evaluate(() => { try { const s = JSON.stringify(window.DAYS); let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return { len: s.length, h } } catch (e) { return String(e) } })
const loadedWeek = p => p.evaluate(() => { try { return String(window.CURWEEK) } catch (e) { return 'n/a' } })
/* pick a day on the range calendar of a clearing form */
async function rangeDays(p, idp, a, b) {
  for (const iso of [a, b]) {
    for (let i = 0; i < 24; i++) {
      const at = await p.locator(`[data-testid="${idp}Run"]`).getAttribute('data-month')
      const d = (+iso.slice(0, 4) * 12 + +iso.slice(5, 7)) - (+at.slice(0, 4) * 12 + +at.slice(5, 7))
      if (!d) break
      await press(p, d > 0 ? `[data-testid="${idp}Run-next"]` : `[data-testid="${idp}Run-prev"]`, 200)
    }
    await press(p, `[data-testid="${idp}Run-day-${iso}"]`, 300)
  }
}

async function partC19(br, dist, phone, { step, note_ }) {
  const { ctx, p, errs } = await world(br, dist, { phone })
  const sz = phone ? 'P' : 'D'
  const DAYS = ['2026-07-15', '2026-11-03', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-09']
  const seed = async () => {
    for (const [iso, w] of [['2026-07-15', 'RD note loaded week'], ['2026-11-03', 'RD note 3 Nov'], ['2026-11-05', 'RD note 5 Nov'], ['2026-11-06', 'RD note 6 Nov'], ['2026-11-07', 'RD note 7 Nov'], ['2026-11-09', 'RD note 9 Nov']]) { await addNote(p, iso, w); await closeDay(p) }
    await addTitle(p, '2026-11-05', 'RD title 5 Nov'); await closeDay(p)
  }
  try {
    await tab(p, 'inputs'); await p.waitForSelector('#inpCal', { timeout: 10000 })
    await step(p, `c-S19-${sz}-0-fixture`, 'S19', 'notes on 3, 5, 6, 7 and 9 Nov and a day title on 5 Nov, through the Inputs calendar; the loaded week', async () => { const lw = await loadedWeek(p); await seed(); return { loadedWeek: lw, cal: await calRead(p, DAYS) } })
    if (!phone) {
      await adminData(p)
      const hash0 = await schedHash(p)
      await step(p, `c-S19-${sz}-1-older-first-press`, 'S19', 'Clear old clutter: Older than 7 Nov, first press (count named)', async () => { await pickDate(p, '#admWipeDate', '2026-11-07'); await press(p, '#admWipe'); return { btn: await txt(p, '#admWipe'), toast: await note(p) } })
      await step(p, `c-S19-${sz}-2-mode-change-disarms`, 'S19', 'change Period mode while armed: disarms?', async () => { await p.selectOption('#admWipeMode', 'on'); const a = { btn: await txt(p, '#admWipe'), dis: await p.locator('#admWipe').isDisabled() }; await p.selectOption('#admWipeMode', 'before'); return { afterMode: a, backToBefore: { btn: await txt(p, '#admWipe'), dis: await p.locator('#admWipe').isDisabled(), date: await p.locator('#admWipeDate').getAttribute('data-value').catch(() => null) } } })
      await step(p, `c-S19-${sz}-3-older-confirm`, 'S19', 'arm again (Older than 7 Nov) and confirm', async () => { if (await p.locator('#admWipe').isDisabled()) await pickDate(p, '#admWipeDate', '2026-11-07'); await press(p, '#admWipe'); const armed = await txt(p, '#admWipe'); await press(p, '#admWipe'); return { armed, btn: await txt(p, '#admWipe'), toast: await note(p), undo: await undoState(p) } })
      await step(p, `c-S19-${sz}-4-calendar-after-older`, 'S19', 'Inputs calendar after the clear: each day', async () => ({ cal: await calRead(p, DAYS), schedLen: (await schedHash(p)).len, same: JSON.stringify(await schedHash(p)) === JSON.stringify(hash0) }))
      await seed()
      await step(p, `c-S19-${sz}-5-reseed`, 'S19', 'notes put back on every day (fixture for the range pass)', async () => ({ cal: await calRead(p, DAYS) }))
    }
    await adminData(p)
    await step(p, `c-S19-${sz}-6-range-first-press`, 'S19', 'Clear old clutter: A date range 5-7 Nov, first press', async () => {
      await p.selectOption('#admWipeMode', 'range'); await rangeDays(p, 'admWipe', '2026-11-05', '2026-11-07')
      await press(p, '#admWipe')
      return { foot: await txt(p, '[data-testid="admWipeRun-foot"]'), btn: await txt(p, '#admWipe'), toast: await note(p) } })
    await step(p, `c-S19-${sz}-7-range-confirm`, 'S19', 'confirm the range clear', async () => { await press(p, '#admWipe'); return { btn: await txt(p, '#admWipe'), toast: await note(p), undo: await undoState(p) } })
    await step(p, `c-S19-${sz}-8-calendar-after-range`, 'S19', 'Inputs calendar after the range clear: each day', async () => ({ cal: await calRead(p, DAYS) }))
    if (!phone) {
      await adminData(p)
      const h1 = await schedHash(p)
      await step(p, `c-S19-${sz}-9-edit-history`, 'S19', 'Clear edit history: specific date 8 Nov (entries made today): count, confirm', async () => {
        await p.selectOption('#admLogMode', 'on'); await pickDate(p, '#admLogDate', '2026-11-08')
        await press(p, '#admLog'); const armed = await txt(p, '#admLog'); const u0 = await undoState(p)
        await press(p, '#admLog')
        return { armed, btn: await txt(p, '#admLog'), toast: await note(p), undoBefore: u0, undoAfter: await undoState(p) } })
      await step(p, `c-S19-${sz}-10-history-schedule-same`, 'S19', 'schedule unchanged by the history clear; does Undo offer it?', async () => {
        const h2 = await schedHash(p)
        const u = await undoState(p)
        return { schedSame: JSON.stringify(h1) === JSON.stringify(h2), schedLen: h2.len, undo: u } })
      await step(p, `c-S19-${sz}-11-undo-press`, 'S19', 'press Undo (if enabled): what it takes back', async () => {
        const dis = (await undoState(p)).undo?.dis
        if (!dis) await press(p, '#undoBtn')
        return { wasDisabled: dis, cal: await calRead(p, DAYS) } })
      await step(p, `c-S19-${sz}-12-older-covers-loaded-week`, 'S19', 'Clear old clutter: Older than 20 Jul 26 (covers the loaded week 13-19 Jul, which holds a note on 15 Jul): count, confirm if armed; the note must stay', async () => {
        await adminData(p)
        await p.selectOption('#admWipeMode', 'before'); await pickDate(p, '#admWipeDate', '2026-07-20')
        await press(p, '#admWipe'); const first = { btn: await txt(p, '#admWipe'), toast: await note(p) }
        let second = null
        if ((first.btn || '').startsWith('Tap again')) { await press(p, '#admWipe'); second = { btn: await txt(p, '#admWipe'), toast: await note(p) } }
        return { first, second, cal: await calRead(p, DAYS) } })
    }
  } catch (e) { note_(`C19-${sz}-abort`, null, err1(e)) }
  note_(`C19-${sz}-errors`, errs.slice(0, 6))
  await ctx.close()
}

export const PARTS3 = { C14: partC14, C15: partC15, C19: partC19 }
