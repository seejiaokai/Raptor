// Walker B's parts, one function each: (browser, dist, phone, bag) — bag has step(), snap(), note_().
import { V, press, world, signIn, reload, adminUsers, rowText, store } from './rdl1108-lib.mjs'

const fillNew = async (p, cs, { ini = 'RX', seat = 'FCP', cat = 'C', signin = '', role = 'main' } = {}) => {
  await p.fill('#accAddCs', cs); await p.fill('#accAddIni', ini)
  await p.selectOption('#accAddSeat', seat)
  if (seat !== 'GND') await p.selectOption('#accAddCat', cat)
  await p.fill('#accAddName', signin)
  if (signin && role !== 'main') await p.selectOption('#accAddRole', role)
  await press(p, '#accAdd')
}
const openRow = async (p, cs) => { await press(p, `#page-admin .acc-row:has(.acc-name:text-is("${cs}")) .acc-tap`) }

/* U — the Users page: add, edit, suspend, archive, restore, delete, with Undo / Redo / reload */
async function partU(br, dist, phone, { step, snap, note_ }) {
  const { ctx, p, errs } = await world(br, dist, { phone })
  const sz = phone ? 'P' : 'D'
  try {
    await adminUsers(p)
    await step(p, `U01-${sz}-start`, 'S03', 'Admin → Users opened', async () => snap(p, ['Saber', 'Ranger']))
    for (const [i, cs, o] of [['a', 'RDACTIVE', { signin: 'rdactive@example.test' }], ['b', 'RDWSO', { seat: 'RCP', cat: 'B', signin: 'rdwso@example.test' }], ['c', 'RDGROUND', { seat: 'GND' }],
      ['d', 'RDNOSIGN', {}], ['e', 'RDSUSP', { signin: 'rdsusp@example.test' }], ['f', 'RDARCH', { signin: 'rdarch@example.test' }], ['g', 'RDADMIN2', { signin: 'rdadmin2@example.test', role: 'admin' }]])
      await step(p, `U02${i}-${sz}-add`, 'S04', 'Add a person ' + cs, async () => { await fillNew(p, cs, o); return snap(p, [cs]) })
    await step(p, `U03-${sz}-undo-after-add`, 'S04', 'Undo after the adds', async () => snap(p))
    await step(p, `U04a-${sz}-edit-open`, 'S05', 'open RDACTIVE editor', async () => { await openRow(p, 'RDACTIVE'); return { name: await p.locator(V('#accEdName')).inputValue(), role: await p.locator(V('#accEdRole')).inputValue(), buttons: await p.locator('#page-admin .acc-edit .acc-acts button').allInnerTexts() } })
    await step(p, `U04b-${sz}-edit-save`, 'S05', 'change sign-in and role, Save', async () => { await p.fill('#accEdName', 'rdactive2@example.test'); await p.selectOption('#accEdRole', 'admin'); await press(p, '#accEdSave'); return snap(p, ['RDACTIVE']) })
    await step(p, `U04c-${sz}-edit-undo`, 'S05', 'Undo', async () => { await press(p, '#undoBtn'); return snap(p, ['RDACTIVE']) })
    await step(p, `U04d-${sz}-edit-redo`, 'S05', 'Redo', async () => { await press(p, '#redoBtn'); return snap(p, ['RDACTIVE']) })
    await step(p, `U04e-${sz}-edit-undo2`, 'S05', 'Undo again then reload (R)', async () => { await press(p, '#undoBtn'); const a = await snap(p, ['RDACTIVE']); await reload(p); await signIn(p); await adminUsers(p); return { a, afterReload: await snap(p, ['RDACTIVE']) } })
    await step(p, `U04f-${sz}-edit-save-reload`, 'S05', 'Save again then reload', async () => { await openRow(p, 'RDACTIVE'); await p.fill('#accEdName', 'rdactive2@example.test'); await p.selectOption('#accEdRole', 'admin'); await press(p, '#accEdSave'); await reload(p); await signIn(p); await adminUsers(p); return snap(p, ['RDACTIVE']) })
    await step(p, `U05a-${sz}-suspend`, 'S05', 'Suspend RDSUSP', async () => { await openRow(p, 'RDSUSP'); await press(p, '#accEdOnOff'); return snap(p, ['RDSUSP']) })
    await step(p, `U05b-${sz}-suspend-undo`, 'S05', 'Undo suspend', async () => { await press(p, '#undoBtn'); return snap(p, ['RDSUSP']) })
    await step(p, `U05c-${sz}-suspend-redo`, 'S05', 'Redo suspend', async () => { await press(p, '#redoBtn'); return snap(p, ['RDSUSP']) })
    await step(p, `U05d-${sz}-enable`, 'S05', 'Enable RDSUSP', async () => { await openRow(p, 'RDSUSP'); await press(p, '#accEdOnOff'); return snap(p, ['RDSUSP']) })
    await step(p, `U05e-${sz}-give-signin`, 'S05', 'Give sign-in to RDNOSIGN', async () => { await openRow(p, 'RDNOSIGN'); const b = await p.locator('#page-admin .acc-edit .acc-acts button').allInnerTexts(); await p.fill('#accGiveName', 'rdnosign@example.test'); await press(p, '#accGive'); return { b, ...(await snap(p, ['RDNOSIGN'])) } })
    await step(p, `U06a-${sz}-editor-draft`, 'S12', 'open RDWSO, type sign-in, change role, arm Delete', async () => { await openRow(p, 'RDWSO'); await p.fill('#accEdName', 'draft@example.test'); await p.selectOption('#accEdRole', 'admin'); await press(p, '#accEdDel'); return { del: await p.locator(V('#accEdDel')).innerText(), note: await p.locator(V('#accEdDelNote')).count() } })
    await step(p, `U06b-${sz}-editor-cancel`, 'S12', 'Cancel, reopen', async () => { await press(p, '#accEdCancel'); const closed = !(await p.locator(V('#accEdName')).count()); await openRow(p, 'RDWSO'); return { closed, name: await p.locator(V('#accEdName')).inputValue(), role: await p.locator(V('#accEdRole')).inputValue(), del: await p.locator(V('#accEdDel')).innerText() } })
    await step(p, `U06c-${sz}-editor-sameRow`, 'S12', 'type, press same row (close), reopen', async () => { await p.fill('#accEdName', 'draft2@example.test'); await openRow(p, 'RDWSO'); const closed = !(await p.locator(V('#accEdName')).count()); await openRow(p, 'RDWSO'); return { closed, name: await p.locator(V('#accEdName')).inputValue() } })
    await step(p, `U06d-${sz}-editor-otherRow`, 'S12', 'type, arm delete, open another row, back', async () => { await p.fill('#accEdName', 'draft3@example.test'); await press(p, '#accEdDel'); await openRow(p, 'RDGROUND'); const e = await p.locator(V('.acc-edit')).count(); await openRow(p, 'RDWSO'); return { editors: e, name: await p.locator(V('#accEdName')).inputValue(), del: await p.locator(V('#accEdDel')).innerText() } })
    await step(p, `U06e-${sz}-own-row`, 'S12', 'own row stays closed', async () => { const dis = await p.evaluate(() => { const r = [...document.querySelectorAll('#page-admin .acc-row')].find(r => r.querySelector('.acc-name')?.textContent.trim() === 'Saber'); return r.querySelector('.acc-tap').disabled }); return { dis } })
    await step(p, `U07a-${sz}-refuse-dup`, 'S16', 'type a sign-in already held, Save: refused', async () => { await p.fill('#accEdName', 'rdactive2@example.test'); await press(p, '#accEdSave'); return { ...(await snap(p, ['RDWSO'])), editorStillOpen: !!(await p.locator(V('#accEdName')).count()), val: await p.locator(V('#accEdName')).inputValue().catch(() => null) } })
    await step(p, `U07b-${sz}-refuse-retype`, 'S16', 'tap away, tap the row afresh, type, correct it', async () => { await openRow(p, 'RDGROUND'); await openRow(p, 'RDWSO'); const shown = await p.locator(V('#accEdName')).inputValue(); await p.fill('#accEdName', 'rdwso3@example.test'); await press(p, '#accEdSave'); return { shown, ...(await snap(p, ['RDWSO'])) } })
    await step(p, `U07c-${sz}-noop-save`, 'S16', 'Save unchanged: no extra Undo step', async () => { const u0 = await (await import('./rdl1108-lib.mjs')).undoState(p); await openRow(p, 'RDWSO'); await press(p, '#accEdSave'); return { u0, u1: await (await import('./rdl1108-lib.mjs')).undoState(p), editorClosed: !(await p.locator(V('#accEdName')).count()) } })
    await step(p, `U08a-${sz}-archive`, 'S13', 'Archive RDARCH', async () => { await openRow(p, 'RDARCH'); await press(p, '#accEdArchive'); return snap(p, ['RDARCH']) })
    await step(p, `U08b-${sz}-add-collision`, 'S13', 'add a different active RDARCH', async () => { await fillNew(p, 'RDARCH', { ini: 'RY', cat: 'D' }); return snap(p, ['RDARCH']) })
    await step(p, `U08c-${sz}-arch-open`, 'S13', 'open the archived list and the archived editor (taken name)', async () => { await press(p, '#accArchToggle'); await press(p, '#accArchList .acc-row .acc-tap'); return { cs: await p.locator(V('#accArCs')).inputValue(), taken: await p.locator(V('#accArTaken')).innerText().catch(() => null), restoreBtn: await p.locator(V('#accArRestore')).innerText() } })
    await step(p, `U08d-${sz}-arch-refuse`, 'S13', 'type a taken callsign, Save name: refused; error clears on typing', async () => { await p.fill('#accArCs', 'RDACTIVE'); const b = await p.locator(V('#accArSave')).count(); if (b) await press(p, '#accArSave'); const err = await p.locator(V('#accArErr')).innerText().catch(() => null); await p.fill('#accArCs', 'RDARCHB'); const errAfter = await p.locator(V('#accArErr')).count(); return { saveShown: b, err, errAfter, btn: await p.locator(V('#accArRestore')).innerText() } })
    await step(p, `U08e-${sz}-arch-savename`, 'S13', 'Save name without restoring', async () => { await press(p, '#accArSave'); return { ...(await snap(p, ['RDARCHB'])), editor: await p.locator(V('#accArCs')).count() } })
    await step(p, `U08f-${sz}-arch-cancel-reopen`, 'S13', 'arm delete, Cancel, reopen', async () => { if (!(await p.locator(V('#accArCs')).count())) await openRow(p, 'RDARCHB'); await press(p, '#accArDel'); const armed = await p.locator(V('#accArDel')).innerText(); await press(p, '#accArCancel'); await openRow(p, 'RDARCHB'); return { armed, after: await p.locator(V('#accArDel')).innerText(), cs: await p.locator(V('#accArCs')).inputValue() } })
    await step(p, `U08g-${sz}-restore`, 'S13', 'Restore RDARCHB', async () => { await press(p, '#accArRestore'); return snap(p, ['RDARCHB']) })
    await step(p, `U09a-${sz}-delete-arm`, 'S22', 'RDNOSIGN delete first tap', async () => { await openRow(p, 'RDNOSIGN'); await press(p, '#accEdDel'); return { del: await p.locator(V('#accEdDel')).innerText(), note: (await p.locator(V('#accEdDelNote')).innerText().catch(() => null)) } })
    await step(p, `U09b-${sz}-delete-go`, 'S22', 'second tap', async () => { await press(p, '#accEdDel'); return snap(p, ['RDNOSIGN']) })
    await step(p, `U09c-${sz}-reload`, 'S03', 'reload: rows kept', async () => { await reload(p); await signIn(p); await adminUsers(p); return snap(p, ['RDACTIVE', 'RDWSO', 'RDGROUND', 'RDNOSIGN', 'RDSUSP', 'RDARCHB', 'RDARCH', 'RDADMIN2']) })
    await step(p, `U09d-${sz}-store`, 'S03', 'what the browser store holds (key shapes)', async () => store(p))
  } catch (e) { note_(`U-${sz}-abort`, null, String(e && e.message || e).split(String.fromCharCode(10))[0]) }
  note_(`U-${sz}-errors`, errs.slice(0, 6))
  await ctx.close()
}

export const PARTS = { U: partU }
