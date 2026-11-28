// w-b1-oil - item 2's OIL line: Saber files a weekend Duty for Hunter on 142 (an OIL question left for Hunter); Hunter with Plan of 149,
// an unsaved chart edit on 149, the member view, presses the bell. No window under the question; Stay; Discard. SZ=d|pc.
import { finish, closeAll, picsFor, step, go, mk, signIn, grant, logout, ask } from '../rewalk/rlib.mjs'
import { Q, answerable, shortQ, where, savedBoth, savedDiff, answerQ, heldDraft, DISCARD, STAY, wait, note, check, pic, pickSq, shut } from '../rewalk/rb-lib.mjs'
import { bell } from '../walk/jc-lib.mjs'
const SZ = process.env.SZ || 'd', tag = `w-b1-oil-${SZ}`
console.log('w-b1-oil v1', SZ, process.env.MQ_PORT)
picsFor(tag)
const WIN = '.floatwin.inpedwin'
const tapIt = async (s, loc) => { const l = typeof loc === 'string' ? s.page.locator(loc).filter({ visible: true }).first() : loc; if (s.desk) await l.click(); else await l.tap(); await s.page.waitForTimeout(300) }
const winShown = s => s.page.locator('#inpEditPop').filter({ visible: true }).count().then(n => n > 0)
const oilShown = s => s.page.locator('[data-testid="oilconf"]').filter({ visible: true }).count().then(n => n > 0)
try {
  await step('B1 OIL', async () => {
    const s = await mk(SZ); const { page } = s
    await signIn(s, 'ad', 'a')
    check('set-up: Saber gave Hunter Plan of 149', await grant(s, 'prowler', '149', 'plan'), 'prowler plan 149')
    await go(s, 'inputs'); await shut(s); await wait(s, 350)
    if (await page.locator('#inMemberMode').filter({ visible: true }).count()) await tapIt(s, '#inMemberMode')
    await tapIt(s, '#inListBtn'); await wait(s, 250); await tapIt(s, '#inNew')
    const v = await page.evaluate(() => [...document.querySelector('#inpEditPerson').options].find(x => /Hunter/.test(x.textContent))?.value)
    await page.selectOption('#inpEditPerson', v)
    await page.selectOption('#inpEditType', 'Duty').catch(e => note('no Duty type', String(e).slice(0, 80)))
    const day = () => page.locator(`${WIN} button[aria-label^="Sat 12 Dec 2026"]`).first()
    for (let i = 0; i < 8 && !(await day().count()); i++) await tapIt(s, page.locator(`${WIN} button[aria-label="Next month"]`).first())
    await tapIt(s, day()); await page.fill('#inpEditRmk', 'rw2 oil'); await pic(s, '00-duty-filled'); await tapIt(s, '#inpEditSave'); await wait(s, 600)
    note('after Save: oil question', await oilShown(s), JSON.stringify(await ask(s)))
    await pic(s, '00b-after-save')
    for (let i = 0; i < 3; i++) { const nd = page.locator('button', { hasText: /^No document$/ }).filter({ visible: true }); if (await nd.count()) await tapIt(s, nd.first()); if ((await ask(s)).msg) await tapIt(s, '#dlgOk') }
    note('window still', await winShown(s), 'oil', await oilShown(s))
    await logout(s); await signIn(s, 'ad2', 'a2')
    const pending = await page.evaluate(() => (window.INPUTS || []).filter(r => (r.remarks || '').includes('rw2 oil')).map(r => ({ oil: r.oil, acc: r.acc })))
    note('the input as stored for Hunter', JSON.stringify(pending))
    await go(s, 'tracker'); await shut(s); await wait(s, 1800)
    await pickSq(s, '149'); await shut(s); await wait(s, 1100)
    await heldDraft(s, 'RW2O'); const saved0 = await savedBoth(s); await pic(s, '01-held-draft-member')
    await tapIt(s, page.locator('#notifyBell').filter({ visible: true }).first()); await wait(s, 700)
    let q = await Q(s), w = await where(s); await pic(s, '02-after-bell')
    note('after the bell', JSON.stringify(shortQ(q)), JSON.stringify(w), 'window', await winShown(s), 'list', await bell.isOpen(s))
    if (!/Save them before switching to 142\?/.test(q.msg || '')) { check('NOT REACHED: the bell did not raise the OIL question here', false, { q: q.msg, list: await bell.isOpen(s) }); await s.ctx.close(); return }
    check('OIL: asked, no window under the question', answerable(q) && !(await winShown(s)) && !(await oilShown(s)), { q: shortQ(q), win: await winShown(s) })
    await answerQ(s, STAY, '03-stay'); w = await where(s)
    check('OIL Stay: on 149, no window', w.sq.startsWith('149') && !(await winShown(s)) && !(await Q(s)).up, w)
    await tapIt(s, page.locator('#notifyBell').filter({ visible: true }).first()); await wait(s, 700)
    q = await Q(s); await pic(s, '04-asked-again')
    await answerQ(s, DISCARD, '05-discard'); await wait(s, 700)
    w = await where(s); const band = await page.locator('[data-testid="inped-moveband"]').filter({ visible: true }).count()
    await pic(s, '06-landed')
    check('OIL Discard: on 142, his Inputs, the window with its OIL question, no band', w.sq.startsWith('142') && w.page === 'page-inputs' && await winShown(s) && !band, { w, win: await winShown(s), oil: await oilShown(s), band })
    check('nothing written', savedDiff(saved0, await savedBoth(s)).length === 0, savedDiff(saved0, await savedBoth(s)))
    await s.ctx.close()
  })
} finally { finish(tag); await closeAll() }
