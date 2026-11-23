// S12 marks across every reader: a member on his own squadron, then an admin with Plan of 149.
import { mk, closeAll, finish, as, grant, go, pic, picsFor, note, step, check, T, hit, pickCourse, pickCrew, info, openBall, ballInfo, pickDate, undoBtn, pressUndo, pressRedo, failLog, half, addCourse, sleep } from './ja-lib.mjs'
import { fixture, waitTrk, openTrk, move, reload, readBoth, whole142, whole149 } from './ja-fx.mjs'
const SZ = process.env.SZ || 'd'
console.log('ja-12 v1', SZ)
picsFor(`j12-${SZ}`)
const close = s => hit(s, s.page.locator('#pop .opts button', { hasText: /^Close$/ }), 220)
/* a grade with its date, a failure with its date, each through the event's own window */
async function write(s, gId, gDate, fId, fDate) {
  await openBall(s, gId); await pickDate(s, '#popDoneDate', gDate); await hit(s, '#pop .opts button[data-g="dco"]', 320)
  await openBall(s, fId); await pickDate(s, '#popFailDate', fDate); await hit(s, '#popFailPlus', 280); await close(s)
}
async function readers(s, tag, who, gId, gDate, fId, fDate, wantDone, wantFails) {
  const i = await info(s); const g = await ballInfo(s, gId); const f = await ballInfo(s, fId); const l = await failLog(s)
  check(`${tag} Info names the student`, (i.who || '').includes(who), i.who)
  check(`${tag} totals`, new RegExp(`Done=${wantDone} `).test(i.overall) && i.fails.length === wantFails, i)
  check(`${tag} the graded event's window`, g && g.done && g.date === gDate && (g.title || '').includes(who), g)
  check(`${tag} the failed event's window`, f && f.fails === '1' && f.failDates.length === 1, f)
  check(`${tag} Failures card has it with its day`, i.fails.some(x => x.startsWith(fId) && x.endsWith(fDate)), i.fails)
  check(`${tag} the Failures list agrees`, l.rows.length === wantFails && l.rows.some(r => r.startsWith(`${fId}#0`)), l)
}
try {
  const s = await mk(SZ)
  await step('fixture', async () => {
    await fixture(s)
    check('Hunter given Plan of 149', await grant(s, 'prowler', '149', 'plan'), 'prowler'); await go(s, 'viewsched')
  })
  const today = new Date().toISOString().slice(0, 7)
  const D1 = `${today}-05`, D2 = `${today}-09`, D3 = `${today}-12`, D4 = `${today}-16`

  await step('S12 member on his own squadron', async () => {
    await as(s, 'us', 'us'); await openTrk(s, '142'); await pickCourse(s, 'JA-142')
    await half(s, 'info'); await hit(s, '#addStu', 300)
    const row = s.page.locator('#dlgList .dlg-item[data-key="prowler"]')
    check('S12 the roster picker offers 142 people', (await row.count()) > 0, await s.page.locator('#dlgList .dlg-item').count())
    await hit(s, row.first(), 700); await half(s, 'flow')
    const t = await T(s); check('S12 member enrolled Hunter', t.crew.now === 'HUNTER', t.crew)
    await write(s, 'ACG-05', D1, 'ACG-06', D2); await pic(s, '01-member-marks')
    await readers(s, 'S12 member', 'HUNTER', 'ACG-05', D1, 'ACG-06', D2, 1, 1)
    note('undo: ' + JSON.stringify(await undoBtn(s)))
    await pressUndo(s); let i = await info(s); check('S12 member Undo takes the failure back', i.fails.length === 0 && /Done=1 /.test(i.overall), i)
    await pressRedo(s); i = await info(s); check('S12 member Redo puts it back', i.fails.length === 1, i.fails)
    await readers(s, 'S12 member after Redo', 'HUNTER', 'ACG-05', D1, 'ACG-06', D2, 1, 1)
    await pickCrew(s, 'JA142A'); i = await info(s); check('S12 another student untouched', /Done=3 /.test(i.overall) && i.fails.length === 1, i)
  })
  await step('S12 admin with Plan on 149', async () => {
    await as(s, 'ad2', 'a2'); await openTrk(s, '142'); await move(s, '149'); await pickCourse(s, 'JA-149')
    await half(s, 'info'); await hit(s, '#addStu', 300)
    const row = s.page.locator('#dlgList .dlg-item[data-key="osp9"]')
    const names = await s.page.locator('#dlgList .dlg-item .dlg-lbl').allTextContents()
    check('S12 the picker offers 149 people, not 142', (await row.count()) > 0 && !names.some(n => /Hunter|Ranger/i.test(n)), names)
    await hit(s, row.first(), 700); await half(s, 'flow')
    const t = await T(s); check('S12 Hunter enrolled Osprey on 149', t.crew.now === 'OSPREY', t.crew)
    await write(s, 'ACG-07', D3, 'ACG-08', D4); await pic(s, '02-plan-marks')
    await readers(s, 'S12 Plan', 'OSPREY', 'ACG-07', D3, 'ACG-08', D4, 1, 1)
    await move(s, '142'); await pickCourse(s, 'JA-142')
    const c = (await T(s)).crew.list; check('S12 Osprey not on 142', !c.includes('OSPREY'), c)
    await pickCrew(s, 'HUNTER'); let i = await info(s); check('S12 142 Hunter still has only his own', /Done=1 /.test(i.overall) && i.fails.length === 1 && i.fails[0].startsWith('ACG-06'), i)
    await move(s, '149'); await pickCourse(s, 'JA-149'); await pickCrew(s, 'OSPREY')
    await readers(s, 'S12 Plan after the round trip', 'OSPREY', 'ACG-07', D3, 'ACG-08', D4, 1, 1)
    note('undo: ' + JSON.stringify(await undoBtn(s)))
    await pressUndo(s); i = await info(s); check('S12 Plan Undo takes the failure back', i.fails.length === 0, i.fails)
    await pressRedo(s); i = await info(s); check('S12 Plan Redo puts it back', i.fails.length === 1 && i.fails[0].startsWith('ACG-08'), i.fails)
    await pic(s, '03-plan-after-redo')
  })
  await step('S12 reload', async () => {
    await reload(s, 'ad2', 'a2'); await openTrk(s, '142'); await pickCourse(s, 'JA-142'); await pickCrew(s, 'HUNTER')
    await readers(s, 'S12 reload 142', 'HUNTER', 'ACG-05', D1, 'ACG-06', D2, 1, 1)
    await move(s, '149'); await pickCourse(s, 'JA-149'); await pickCrew(s, 'OSPREY')
    await readers(s, 'S12 reload 149', 'OSPREY', 'ACG-07', D3, 'ACG-08', D4, 1, 1)
    const b = await readBoth(s); check('S12 the fixture marks whole', whole142(b['142']) && whole149(b['149']), b)
  })
  await s.ctx.close()
} finally { finish(`j12-${SZ}`); await closeAll() }
