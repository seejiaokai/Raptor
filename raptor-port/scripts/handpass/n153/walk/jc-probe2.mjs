// jc-probe2 - how a master admin is made on a row, where the Undo buttons are at each size, and what the bell's markup reads.
import { signIn, newPage, closeAll, finish, step, pic, picsFor, openRow, note, ask } from './jlib.mjs'
import { toast, tips, rowText, roleOpts, editRow, saveRow, toUsers, doUndo, doRedo, bell } from './jc-lib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jc-probe2 v1', SZ)
picsFor('jc-probe2-' + SZ)
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  await step('role options', async () => {
    await toUsers(s); await openRow(s, 'prowler')
    note('Hunter opts ' + JSON.stringify(await roleOpts(s))); await pic(s, '01-row')
    note('tips ' + JSON.stringify(await tips(s)))
    await page.locator('#accEdCancel').click(); await page.waitForTimeout(250)
  })
  await step('make master', async () => {
    const o = await (async () => { await openRow(s, 'prowler'); return roleOpts(s) })()
    const m = o.opts.map(x => x.split('=')[0]).find(v => /master/i.test(v))
    note('master value ' + m)
    if (m) {
      await editRow(s, 'prowler', [{ role: m }]); await pic(s, '02-role-master-chosen')
      const q = await saveRow(s); note('q ' + JSON.stringify(q)); await page.waitForTimeout(150)
      note('toast ' + (await toast(s))); note('tips ' + JSON.stringify(await tips(s))); note('row ' + (await rowText(s, 'prowler')))
      await pic(s, '03-saved')
      await doUndo(s); note('undo toast ' + (await toast(s))); note('tips ' + JSON.stringify(await tips(s))); await pic(s, '04-undone')
      await doRedo(s); note('redo toast ' + (await toast(s))); note('row ' + (await rowText(s, 'prowler')))
    }
  })
  await step('bell', async () => {
    note('bell opened ' + (await bell.open(s))); note('lines ' + JSON.stringify((await bell.lines(s)).slice(0, 5))); await pic(s, '05-bell')
    await bell.close(s); note('bell open after Escape ' + (await bell.isOpen(s)))
  })
  await s.ctx.close()
} finally { finish('jc-probe2-' + SZ); await closeAll() }
