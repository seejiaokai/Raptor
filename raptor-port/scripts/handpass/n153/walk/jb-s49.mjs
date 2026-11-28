// jb-s49 v1 - S49, S51, S52 on the Inputs page. Hunter (Plan of 149) on 149's Inputs, a form open with words typed:
// the member view and a pick, in both orders; a calendar or a delete question over the form; the own-squadron control.
import { signIn, newPage, closeAll, finish, picsFor, note, pic, pickSq, shut, step, check, press, facts, as, grant, go, state, openMenu } from './jlib.mjs'
import { wait } from './jb-lib.mjs'
import { over } from '../../n150/walk/r-lib.mjs'
const SZ = process.env.SZ || 'd'
const ONLY = (process.env.PARTS || '').split(',').filter(Boolean)
const tag = `s49-${SZ}${ONLY.length ? '-' + ONLY.join('-') : ''}`
console.log('jb-s49 v1', SZ, ONLY.join(','))
picsFor(tag)
const norm = t => (t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
const MEMBER = 'Member view. Switch back to the admin view to change this, or close it.'
const PICKED = (a, b) => `This is ${a}'s. You picked ${b} — close this to go on.`
const inWin = s => s.page.evaluate(() => {
  const btn = [...document.querySelectorAll('#inpEditCancel, #inpEditSave, #inpEditClose')].find(e => e.getBoundingClientRect().width > 0)
  if (!btn) return null
  const fw = btn.closest('.floatwin') || btn.closest('[role=dialog]') || btn.parentElement.parentElement
  const band = [...fw.querySelectorAll('[data-testid="inped-moveband"], .moveband')].find(b => b.getBoundingClientRect().width > 0)
  const reach = e => { if (!e) return null; const r = e.getBoundingClientRect(); if (!r.width) return null; const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !e.closest('[inert]') && !!t && (t === e || e.contains(t)) }
  const save = fw.querySelector('#inpEditSave'), del = fw.querySelector('#inpEditDel'), rmk = fw.querySelector('#inpEditRmk'), cancel = fw.querySelector('#inpEditCancel') || fw.querySelector('#inpEditClose')
  return { band: band ? band.textContent.replace(/\s+/g, ' ').replace(/Close$/, '').trim() : null, held: fw.querySelectorAll('[data-heldro]').length, saveLive: reach(save), delLive: reach(del), rmkLive: reach(rmk), closeLive: band ? (reach(band.querySelector('button')) === true && reach(fw.querySelector('[data-testid="inped-cx"]') || fw.querySelector('.win-x') || fw.querySelector('[aria-label="Close"]') || fw.querySelector('.win-bar button:last-of-type')) === true) : reach(cancel), simplified: !fw.querySelector('#inpEditPerson') && /changed on the Inputs page/.test(fw.innerText), rmk: rmk ? rmk.value : null }
})
const toRole = async (s, name) => {
  if (s.desk) { const o = await over(s, '#roleBadge'); if (o !== 'self') return { pressed: false, cover: o }; await press(s, '#roleBadge', name); return { pressed: true, door: 'the role chip' } }
  const o = await over(s, '#burger'); if (o !== 'self') return { pressed: false, cover: o }
  await openMenu(s, name && name + '-menu'); if (!(await state(s)).drawerOpen) return { pressed: false, cover: 'the ☰ tap opened no menu' }
  await press(s, '#drawerRole', name); await shut(s); return { pressed: true, door: 'the ☰ menu' }
}
const toPick = async (s, u, name) => {
  const o = await over(s, s.desk ? '#sqnMenuBtn' : '#burger'); if (o !== 'self') return { pressed: false, cover: o }
  await pickSq(s, u, name); await shut(s); await wait(s, 500); return { pressed: true }
}
async function list(s) {
  const { page } = s
  await go(s, 'inputs'); await wait(s, 900); await shut(s)
  if (await page.locator('#inListBtn[aria-pressed="false"]').count()) await press(s, '#inListBtn')
  await wait(s, 400)
  if (!(await page.locator('#inRangePop').filter({ visible: true }).count())) await press(s, '#inRangeBtn')
  if (await page.locator('#inRangeAll').filter({ visible: true }).count()) await press(s, '#inRangeAll')
  await wait(s, 500)
}
async function openExisting(s) {
  const { page } = s
  await list(s)
  const row = page.locator(s.desk ? '#inBody tr[data-iid]' : '[data-testid^="inl-row-"]').filter({ visible: true })
  if (!(await row.count())) return false
  await row.first().scrollIntoViewIfNeeded()
  await press(s, s.desk ? row.first().locator('[data-testid="in-open"]').first() : row.first(), 'open'); await wait(s, 600)
  return !!(await inWin(s))
}
async function openNew(s) {
  const { page } = s
  await go(s, 'inputs'); await wait(s, 900); await shut(s)
  const b = page.getByRole('button', { name: /\+ Input/ }).filter({ visible: true }).first()
  if (!(await b.count())) return false
  await (s.desk ? b.click() : b.tap()); await wait(s, 800)
  return !!(await inWin(s))
}
const type = async (s, words) => { const r = s.page.locator('#inpEditRmk').filter({ visible: true }).first(); await r.fill(words); await wait(s, 200) }
async function closeForm(s) {
  const { page } = s
  for (let i = 0; i < 3 && await inWin(s); i++) {
    const bc = page.locator('.moveband button').filter({ visible: true }).first()
    const c = (await bc.count()) ? bc : page.locator('#inpEditCancel, #inpEditClose').filter({ visible: true }).first()
    if (await c.count()) await c.click({ timeout: 2000 }).catch(() => {})
    await wait(s, 350)
    for (const t of ['inped-escask-go']) { const g = page.locator(`[data-testid="${t}"]`).filter({ visible: true }); if (await g.count()) { await g.first().click(); await wait(s, 300) } }
  }
  return !(await inWin(s))
}
async function heldChecks(s, k, want, words) {
  const { page } = s
  const w = await inWin(s); await pic(s, `${k}-held`)
  note(`${k} window`, JSON.stringify(w))
  check(`${k}: band reads "${want}"`, !!w && norm(w.band) === want, w && w.band)
  check(`${k}: typed words kept`, !!w && w.rmk === words, w && w.rmk)
  check(`${k}: Save and fields greyed, take no press`, !!w && !w.saveLive && !w.rmkLive, w && { save: w.saveLive, rmk: w.rmkLive, del: w.delLive, held: w.held })
  check(`${k}: Close stays live`, !!w && w.closeLive === true, w && w.closeLive)
  const r = await page.evaluate(() => { const e = [...document.querySelectorAll('#inpEditRmk')].find(x => x.getBoundingClientRect().width > 0); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 } })
  if (r) {
    if (s.desk) await page.mouse.click(r.x, r.y); else await page.touchscreen.tap(r.x, r.y)
    await page.keyboard.type('XX', { delay: 10 }); await wait(s, 200)
    const v = (await inWin(s))?.rmk; check(`${k}: typing does not reach the box`, v === words, v)
  }
}
const want = n => !ONLY.length || ONLY.includes(n)
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  check('grant', await grant(s, 'prowler', '149', 'plan'), 'prowler plan 149'); await go(s, 'viewsched'); await shut(s)
  await as(s, 'ad2', 'a2')
  for (const kind of ['existing', 'new']) if (want('49' + kind)) await step(`S49 ${kind}`, async () => {
    const k = `49-${kind}`; const words = `JB49 ${kind}`
    if (!(await state(s)).barMark?.startsWith('149')) { await go(s, 'viewsched'); await pickSq(s, '149'); await shut(s) }
    const ok = kind === 'existing' ? await openExisting(s) : await openNew(s)
    if (!check(`${k}: premise, a form of 149 open`, ok, await inWin(s))) return
    await type(s, words); await pic(s, `${k}-1-typed`)
    const r = await toRole(s, `${k}-sw`); note(`${k} role switch`, JSON.stringify(r)); facts[`${k}-door`] = r
    if (!r.pressed) { await pic(s, `${k}-2-covered`); note(`NOT WALKED ${k}: the switch is covered by`, r.cover); await closeForm(s); return }
    await wait(s, 500); await heldChecks(s, k, MEMBER, words)
    const h = await inWin(s); check(`${k}: the held form is the same form, not a shorter one`, !!h && !h.simplified, h && { simplified: h.simplified })
    const b = await toRole(s, `${k}-swb`); await wait(s, 500); const w = await inWin(s); note(`${k} back`, JSON.stringify(b), JSON.stringify(w)); await pic(s, `${k}-3-back`)
    check(`${k}: the way back the band names can be pressed`, b.pressed, b)
    if (b.pressed) check(`${k}: back in the admin view the form is live with its words`, !!w && !w.band && w.saveLive === true && w.rmk === words, w)
    check(`${k}: closed`, await closeForm(s), 'closed'); await wait(s, 300)
    if (!b.pressed) { await toRole(s, `${k}-swc`); await wait(s, 400); note(`${k}: after closing, role`, (await state(s)).badge) }
  })
  if (want('51a')) await step('S51 member view, then a pick of home', async () => {
    const k = '51a'; const words = 'JB51 a'
    if (!(await state(s)).barMark?.startsWith('149')) { await go(s, 'viewsched'); await pickSq(s, '149'); await shut(s) }
    if (!check(`${k}: premise`, await openExisting(s), 'form')) return
    await type(s, words)
    const r = await toRole(s, `${k}-sw`); if (!r.pressed) { note(`NOT WALKED ${k}: switch covered by`, r.cover); await pic(s, `${k}-covered`); await closeForm(s); return }
    await wait(s, 400); await heldChecks(s, `${k}-member`, MEMBER, words)
    const p = await toPick(s, '142', `${k}-pick`); note(`${k} pick`, JSON.stringify(p))
    if (!p.pressed) { await pic(s, `${k}-pick-covered`); note(`NOT WALKED ${k} pick:`, p.cover); await closeForm(s); await toRole(s); await wait(s, 400); return }
    await wait(s, 400); await heldChecks(s, `${k}-picked`, PICKED('149', '142'), words)
    await toRole(s, `${k}-swb`); await wait(s, 400); let w = await inWin(s); note(`${k} admin view on 142`, JSON.stringify(w)); await pic(s, `${k}-admin-on-142`)
    check(`${k}: admin view on 142 keeps the pick's band`, !!w && norm(w.band) === PICKED('149', '142'), w && w.band)
    await toPick(s, '149', `${k}-ret`); await wait(s, 400); w = await inWin(s); await pic(s, `${k}-return-149`)
    check(`${k}: back on 149 the form is live with its words`, !!w && !w.band && w.saveLive === true && w.rmk === words, w)
    await closeForm(s)
  })
  if (want('51b')) await step('S51 a pick, then the member view', async () => {
    const k = '51b'; const words = 'JB51 b'
    if (!(await state(s)).barMark?.startsWith('149')) { await go(s, 'viewsched'); await pickSq(s, '149'); await shut(s) }
    if (!check(`${k}: premise`, await openExisting(s), 'form')) return
    await type(s, words)
    const p = await toPick(s, '142', `${k}-pick`); if (!p.pressed) { note(`NOT WALKED ${k}: pick covered by`, p.cover); await pic(s, `${k}-covered`); await closeForm(s); return }
    await wait(s, 400); await heldChecks(s, `${k}-picked`, PICKED('149', '142'), words)
    const r = await toRole(s, `${k}-sw`); note(`${k} role`, JSON.stringify(r)); await wait(s, 400)
    if (r.pressed) { await heldChecks(s, `${k}-picked-member`, PICKED('149', '142'), words); await toRole(s, `${k}-swb`); await wait(s, 400) }
    await toPick(s, '149', `${k}-ret`); await wait(s, 400); const w = await inWin(s); await pic(s, `${k}-return-149`)
    check(`${k}: back on 149 live with its words`, !!w && !w.band && w.saveLive === true && w.rmk === words, w)
    await closeForm(s)
  })
  if (want('51c')) await step('S51 control: an own-squadron window and the member view', async () => {
    const k = '51c'; if (!(await state(s)).barMark?.startsWith('142')) { await go(s, 'viewsched'); await pickSq(s, '142'); await shut(s) }
    if (!check(`${k}: premise`, await openExisting(s), 'form')) return
    const r = await toRole(s, `${k}-sw`); await wait(s, 400); const w = await inWin(s); note(`RECORD ${k}: own-squadron form, member view:`, JSON.stringify(r), JSON.stringify(w)); await pic(s, `${k}-own-member`)
    facts['51c'] = w
    if (r.pressed) { await toRole(s, `${k}-swb`); await wait(s, 300) }
    await closeForm(s)
  })
  if (want('52')) await step('S52 windows over a held form', async () => {
    const k = '52'; const words = 'JB52'
    if (!(await state(s)).barMark?.startsWith('149')) { await go(s, 'viewsched'); await pickSq(s, '149'); await shut(s) }
    if (!check(`${k}: premise`, await openExisting(s), 'form')) return
    await type(s, words)
    const rowsBefore = await page.locator(s.desk ? '#inBody tr[data-iid]' : '[data-testid^="inl-row-"]').count()
    // the Delete question raised over the live form, then a pick (the form is not modal, so the bar can be reached)
    const del = page.locator('#inpEditDel').filter({ visible: true }).first()
    if (!(await del.count())) { note(`NOT WALKED ${k}: no Delete on this form`); await closeForm(s); return }
    await (s.desk ? del.click() : del.tap()); await wait(s, 450); await pic(s, `${k}-1-delete-asked`)
    const parts = () => page.evaluate(() => { const d = document.querySelector('#dlgModal'); const dm = d && d.getBoundingClientRect().width > 0 ? d.innerText.replace(/\s+/g, ' ').trim().slice(0, 90) : null; return { inped: [...document.querySelectorAll('[data-testid^="inped-"]')].filter(e => e.getBoundingClientRect().width > 0 && /del|escask|takeout/.test(e.dataset.testid)).map(e => e.dataset.testid), dlg: dm, any: [...document.querySelectorAll('.floatwin button, .airpop button')].filter(e => e.getBoundingClientRect().width > 0 && /^(Delete|Yes|Keep|Cancel)/.test(e.textContent.trim())).map(e => e.textContent.trim()).slice(0, 6) } })
    const q0 = await parts(); note(`${k} the question up`, JSON.stringify(q0))
    const p = await toPick(s, '142', `${k}-pick`); note(`${k} pick with the question up`, JSON.stringify(p)); await wait(s, 400)
    const q1 = await parts(); const w1 = await inWin(s); note(`${k} after the pick`, JSON.stringify(q1), JSON.stringify(w1)); await pic(s, `${k}-2-after-pick`)
    if (p.pressed) {
      check(`${k}: the form held with the pick's band`, !!w1 && norm(w1.band) === PICKED('149', '142'), w1 && w1.band)
      const yes = page.locator('[data-testid="inped-delall-yes"], [data-testid="inped-takeout-yes"]').filter({ visible: true })
      if (await yes.count()) {
        await yes.first().click({ timeout: 1500 }).catch(e => note('yes press refused', String(e).split('\n')[0].slice(0, 90))); await wait(s, 500)
        check(`${k}: a Delete question left up does not act through the hold`, !!(await inWin(s)), await inWin(s)); await pic(s, `${k}-3-yes-pressed`)
      } else note(`${k}: the Delete question did not survive the pick`)
      await page.keyboard.press('Escape'); await wait(s, 400)
      const w2 = await inWin(s); const q2 = await parts(); note(`${k} after one Escape`, JSON.stringify(q2), JSON.stringify(w2)); await pic(s, `${k}-4-after-esc`)
      if (q1.inped.length || q1.dlg) check(`${k}: the first Escape closes the upper question, not the form`, !!w2, w2 && w2.band)
      if (w2) { await toPick(s, '149', `${k}-ret`); await wait(s, 400); const w3 = await inWin(s); check(`${k}: back on 149 the form is live with its words`, !!w3 && !w3.band && w3.saveLive === true && w3.rmk === words, w3); await pic(s, `${k}-5-back`) }
    } else { note(`RECORD ${k}: with the question up the pick is covered by`, p.cover); await page.keyboard.press('Escape'); await wait(s, 300) }
    await closeForm(s)
    if (!(await state(s)).barMark?.startsWith('149')) { await go(s, 'viewsched'); await pickSq(s, '149'); await shut(s) }
    await list(s)
    const rowsAfter = await page.locator(s.desk ? '#inBody tr[data-iid]' : '[data-testid^="inl-row-"]').count()
    check(`${k}: no input of 149 was deleted`, rowsAfter === rowsBefore && rowsBefore > 0, { rowsBefore, rowsAfter })
  })
  /* 52b: the form's one real upper question: Escape on a form with unsaved words ("inped-escask"). A single input's Delete asks
     nothing (it deletes at once, with Undo), so part 52's Delete press is no upper window: 52b replaces it. */
  if (want('52b')) await step('S52b the Escape question over the form, then a pick', async () => {
    const k = '52b'; const words = 'JB52b'
    if (!(await state(s)).barMark?.startsWith('149')) { await go(s, 'viewsched'); await pickSq(s, '149'); await shut(s) }
    if (!check(`${k}: premise`, await openExisting(s), 'form')) return
    await type(s, words)
    const esc = () => page.locator('[data-testid="inped-escask"]').filter({ visible: true }).count()
    await page.locator('#inpEditRmk').filter({ visible: true }).first().focus(); await page.keyboard.press('Escape'); await wait(s, 400)
    const up = await esc(); note(`${k} the Escape question up:`, up); await pic(s, `${k}-1-asked`)
    if (!up) { note(`NOT WALKED ${k}: Escape raised no question at this size`); await closeForm(s); return }
    const p = await toPick(s, '142', `${k}-pick`); note(`${k} pick with the question up`, JSON.stringify(p)); await wait(s, 400)
    const w1 = await inWin(s); const up1 = await esc(); note(`${k} after the pick: question`, up1, JSON.stringify(w1)); await pic(s, `${k}-2-after-pick`)
    if (p.pressed) {
      check(`${k}: the form is held with the pick's band`, !!w1 && norm(w1.band) === PICKED('149', '142'), w1 && w1.band)
      if (up1) {
        await page.keyboard.press('Escape'); await wait(s, 400)
        const w2 = await inWin(s); note(`${k} after Escape: question`, await esc(), JSON.stringify(w2)); await pic(s, `${k}-3-after-esc`)
        check(`${k}: Escape takes the upper question first, the held form stays`, !!w2 && !(await esc()), { form: !!w2, q: await esc() })
      }
      if (await inWin(s)) { await toPick(s, '149', `${k}-ret`); await wait(s, 400); const w3 = await inWin(s); await pic(s, `${k}-4-back`); check(`${k}: back on 149 the form is live with its words`, !!w3 && !w3.band && w3.saveLive === true && w3.rmk === words, w3) }
    } else {
      note(`RECORD ${k}: with the question up the pick is covered by`, p.cover)
      const stay = page.locator('[data-testid="inped-escask-stay"]').filter({ visible: true }); if (await stay.count()) { await stay.first().click(); await wait(s, 300) }
    }
    await closeForm(s)
  })
  await s.ctx.close()
} finally { finish(tag); await closeAll() }
