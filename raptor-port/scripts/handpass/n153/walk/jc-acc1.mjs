// jc-acc1 - S29 (a role change and a rename in one Save) and S30 (master admin both ways, from Admin and from Member).
import { signIn, newPage, closeAll, finish, step, pic, picsFor, note, check, facts, grant } from './jlib.mjs'
import { toast, tips, who, reload, editRow, saveRow, toUsers, doUndo, doRedo } from './jc-lib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jc-acc1 v1', SZ)
picsFor('jc-acc1-' + SZ)
const rec = (k, v) => { facts[k] = v; note(`RECORD ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) }
async function s29(order, tag) {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  await step(`S29 ${tag}`, async () => {
    check(`S29 ${tag} setup Plan 149`, await grant(s, 'prowler', '149', 'plan'), 'granted')
    const before = await who(s, 'prowler'); rec(`S29 ${tag} before`, before)
    await editRow(s, 'prowler', order); await pic(s, `s29-${tag}-1-edited`)
    await saveRow(s); await page.waitForTimeout(120)
    rec(`S29 ${tag} after save toast`, await toast(s)); rec(`S29 ${tag} undo hover`, (await tips(s)).undo?.title)
    const saved = await who(s, 'prowler'); rec(`S29 ${tag} saved`, saved)
    check(`S29 ${tag} save landed`, saved.role === 'main' && saved.name === 'hunter2', saved)
    await doUndo(s); const u = await toast(s); rec(`S29 ${tag} Undo bubble (q1)`, u); await pic(s, `s29-${tag}-2-undid`)
    rec(`S29 ${tag} redo hover`, (await tips(s)).redo?.title)
    const un = await who(s, 'prowler'); rec(`S29 ${tag} after Undo`, un)
    check(`S29 ${tag} Undo reverses role and name together`, un.role === before.role && un.name === before.name, un)
    check(`S29 ${tag} Undo leaves Plan of 149 as before`, un.lines['149'] === before.lines['149'], un.lines)
    await doRedo(s); rec(`S29 ${tag} Redo bubble`, await toast(s))
    const re = await who(s, 'prowler'); check(`S29 ${tag} Redo puts both back`, re.role === 'main' && re.name === 'hunter2', re)
    await reload(s); await toUsers(s)
    const rl = await who(s, 'prowler'); check(`S29 ${tag} after reload`, rl.role === 'main' && rl.name === 'hunter2', rl)
    await pic(s, `s29-${tag}-3-reloaded`)
  })
  await s.ctx.close()
}
async function s30(pid, nameP, fromRole, tag) {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  await step(`S30 ${tag}`, async () => {
    await toUsers(s)
    const b = await who(s, pid); check(`S30 ${tag} start role`, b.role === fromRole, b)
    await editRow(s, pid, [{ role: 'master' }]); await saveRow(s); await page.waitForTimeout(120)
    const made = `Made a master admin · ${nameP}`, off = `Master admin taken off · ${nameP}`
    const t1 = await tips(s); check(`S30 ${tag} hover after making`, t1.undo?.title === `Undo — ${made}`, t1.undo?.title)
    await pic(s, `s30-${tag}-1-made`)
    await doUndo(s); const u1 = await toast(s); check(`S30 ${tag} Undid made`, u1 === `Undid: ${made}`, u1); await pic(s, `s30-${tag}-2-undid-made`)
    const t2 = await tips(s); check(`S30 ${tag} redo hover made`, t2.redo?.title === `Redo — ${made}`, t2.redo?.title)
    const r1 = await who(s, pid); check(`S30 ${tag} Undo returned the role`, r1.role === fromRole, r1)
    await doRedo(s); const u2 = await toast(s); check(`S30 ${tag} Redid made`, u2 === `Redid: ${made}`, u2)
    const r2 = await who(s, pid); check(`S30 ${tag} Redo made master`, r2.role === 'master', r2)
    await editRow(s, pid, [{ role: fromRole }]); await saveRow(s); await page.waitForTimeout(120)
    const t3 = await tips(s); check(`S30 ${tag} hover after taking off`, t3.undo?.title === `Undo — ${off}`, t3.undo?.title)
    await doUndo(s); const u3 = await toast(s); check(`S30 ${tag} Undid off`, u3 === `Undid: ${off}`, u3); await pic(s, `s30-${tag}-3-undid-off`)
    const t4 = await tips(s); check(`S30 ${tag} redo hover off`, t4.redo?.title === `Redo — ${off}`, t4.redo?.title)
    const r3 = await who(s, pid); check(`S30 ${tag} Undo of take-off is master again`, r3.role === 'master', r3)
    await doRedo(s); const u4 = await toast(s); check(`S30 ${tag} Redid off`, u4 === `Redid: ${off}`, u4)
    const r4 = await who(s, pid); check(`S30 ${tag} Redo took it off`, r4.role === fromRole, r4)
    await reload(s); await toUsers(s); const r5 = await who(s, pid); check(`S30 ${tag} after reload`, r5.role === fromRole, r5)
  })
  await s.ctx.close()
}
try {
  await s29([{ role: 'main' }, { name: 'hunter2' }], 'role-first')
  await s29([{ name: 'hunter2' }, { role: 'main' }], 'name-first')
  await s30('prowler', 'Hunter', 'admin', 'admin')
  await s30('bane', 'Ranger', 'main', 'member')
} finally { finish('jc-acc1-' + SZ); await closeAll() }
