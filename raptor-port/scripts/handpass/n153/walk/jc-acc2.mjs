// jc-acc2 - S31: several access changes in one Save, in both field orders, with a field returned to where it started.
import { signIn, newPage, closeAll, finish, step, pic, picsFor, note, check, facts, admCat } from './jlib.mjs'
import { toast, tips, who, editRow, saveRow, toUsers, doUndo, doRedo } from './jc-lib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jc-acc2 v1', SZ)
picsFor('jc-acc2-' + SZ)
const rec = (k, v) => { facts[k] = v; note(`RECORD ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) }
const N = ['149', '150']
export async function makeThird(s) {
  const { page } = s
  await admCat(s, 'Squadrons')
  await page.locator('#sqNew').filter({ visible: true }).first().click(); await page.waitForTimeout(300)
  await page.fill('#sqNewNum', '150')
  const lbl = await page.evaluate(() => [...document.querySelector('#sqNewAdmin').options].map(o => o.textContent).find(t => /Kestrel/.test(t)))
  if (lbl) await page.selectOption('#sqNewAdmin', { label: lbl })
  await page.locator('#sqNewSave').click(); await page.waitForTimeout(600)
  return lbl
}
/* one Save and its Undo and Redo, read at every turn; `want` is the words expected, person last */
async function round(s, tag, steps, want) {
  const { page } = s
  const before = await who(s, 'prowler', N)
  await editRow(s, 'prowler', steps); await pic(s, `s31-${tag}-1-edited`)
  await saveRow(s); await page.waitForTimeout(120)
  const after = await who(s, 'prowler', N); rec(`S31 ${tag} saved`, after)
  const hover = (await tips(s)).undo?.title
  check(`S31 ${tag} hover names it`, hover === `Undo — ${want} · Hunter`, hover)
  await doUndo(s); const bub = await toast(s); await pic(s, `s31-${tag}-2-undid`)
  check(`S31 ${tag} bubble names it`, bub === `Undid: ${want} · Hunter`, bub)
  const rh = (await tips(s)).redo?.title
  check(`S31 ${tag} redo hover names it`, rh === `Redo — ${want} · Hunter`, rh)
  const un = await who(s, 'prowler', N)
  check(`S31 ${tag} one Undo puts all back`, JSON.stringify([un.role, un.name, un.lines]) === JSON.stringify([before.role, before.name, before.lines]), { before: [before.role, before.name, before.lines], un: [un.role, un.name, un.lines] })
  await doRedo(s); rec(`S31 ${tag} Redo bubble`, await toast(s))
  const re = await who(s, 'prowler', N)
  check(`S31 ${tag} Redo matches the Save`, JSON.stringify([re.role, re.name, re.lines]) === JSON.stringify([after.role, after.name, after.lines]), { after: [after.role, after.name, after.lines], re: [re.role, re.name, re.lines] })
  return after
}
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  await step('third squadron', async () => { rec('first admin of 150', await makeThird(s)); await toUsers(s); await pic(s, '00-users') })
  await step('A view + rename, line first', () => round(s, 'A1', [{ line: ['149', 'view'] }, { name: 'hun1' }], 'View of 149 given, sign-in name changed'))
  await step('A view + rename undone back, name first', async () => {
    await doUndo(s); await page.waitForTimeout(200)
    await round(s, 'A2', [{ name: 'hun2' }, { line: ['149', 'view'] }], 'View of 149 given, sign-in name changed')
    await doUndo(s)
  })
  await step('B Plan 149 + View 150 + rename', () => round(s, 'B', [{ line: ['149', 'plan'] }, { line: ['150', 'view'] }, { name: 'hun3' }], 'Plan of 149 given, View of 150 given, sign-in name changed'))
  await step('C replace Plan by View, end View 150, rename back', () => round(s, 'C', [{ name: 'ad2' }, { line: ['150', 'none'] }, { line: ['149', 'view'] }], 'View of 149 given, View of 150 ended, sign-in name changed'))
  await step('D a field returned to where it started', async () => {
    const b = await who(s, 'prowler', N)
    await editRow(s, 'prowler', [{ name: 'tempname' }, { line: ['150', 'view'] }, { name: b.name }, { line: ['149', 'plan'] }, { line: ['150', 'none'] }])
    await saveRow(s); await page.waitForTimeout(150)
    const hover = (await tips(s)).undo?.title
    check('S31 D only the real change named', hover === 'Undo — Plan of 149 given · Hunter', hover)
    await doUndo(s); const bub = await toast(s); check('S31 D bubble', bub === 'Undid: Plan of 149 given · Hunter', bub)
    const u = await who(s, 'prowler', N); check('S31 D Undo restores', u.lines['149'] === b.lines['149'] && u.name === b.name, u)
    await doRedo(s)
  })
  await step('E master + rename, Plan 149 held', async () => {
    const after = await round(s, 'E', [{ role: 'master' }, { name: 'hun5' }], 'Made a master admin, Plan of 149 ended, sign-in name changed')
    check('S31 E saved as master', after.role === 'master' && after.name === 'hun5', after)
  })
  await step('F demotion + rename', async () => {
    const after = await round(s, 'F', [{ name: 'ad2' }, { role: 'admin' }], 'Master admin taken off, sign-in name changed')
    check('S31 F saved as admin', after.role === 'admin', after)
  })
  await step('G a Save with nothing changed', async () => {
    const before = (await tips(s)).undo?.title
    await editRow(s, 'prowler', [{ name: 'tempx' }, { name: 'ad2' }]); await saveRow(s); await page.waitForTimeout(150)
    const a = (await tips(s)).undo?.title; check('S31 G no new Undo line', a === before, { before, a }); rec('S31 G toast', await toast(s))
    if (await page.locator('#accEdCancel').count()) await page.locator('#accEdCancel').first().click()
  })
  await s.ctx.close()
  const s2 = await newPage(SZ)
  await signIn(s2, 'ad', 'a')
  await step('H role alone, Hunter holding Plan 149', async () => {
    await toUsers(s2)
    await editRow(s2, 'prowler', [{ line: ['149', 'plan'] }]); await saveRow(s2)
    const b = await who(s2, 'prowler', ['149']); rec('S31 H before', b)
    await editRow(s2, 'prowler', [{ role: 'main' }]); await pic(s2, 's31-H-1-edited'); await saveRow(s2); await s2.page.waitForTimeout(120)
    const a = await who(s2, 'prowler', ['149']); rec('S31 H saved', a)
    rec('S31 H hover', (await tips(s2)).undo?.title)
    await doUndo(s2); const bub = await toast(s2); rec('S31 H Undo bubble', bub); await pic(s2, 's31-H-2-undid')
    const u = await who(s2, 'prowler', ['149']); rec('S31 H after Undo', u)
    if (a.lines['149'] !== b.lines['149'] && u.lines['149'] === b.lines['149']) check('S31 H words name the Plan the Undo put back', /Plan of 149/.test(bub || ''), bub)
  })
  await s2.ctx.close()
} finally { finish('jc-acc2-' + SZ); await closeAll() }
