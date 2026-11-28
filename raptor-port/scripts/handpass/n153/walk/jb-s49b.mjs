// jb-s49b v1 - the held Input form by hand-sized steps: which doors lead back to the admin view while it is held (a press where
// the role chip is drawn, the keys), and is the form that comes back the one he left (person, date, words)? SZ=d or p.
import { signIn, newPage, closeAll, finish, picsFor, note, pic, pickSq, shut, step, check, press, as, grant, go, state, openMenu } from './jlib.mjs'
import { wait } from './jb-lib.mjs'
import { over } from '../../n150/walk/r-lib.mjs'
const SZ = process.env.SZ || 'd'
const tag = `s49b-${SZ}`
console.log('jb-s49b v1', SZ)
picsFor(tag)
const form = s => s.page.evaluate(() => {
  const shown = e => !!e && e.getBoundingClientRect().width > 0
  const btn = [...document.querySelectorAll('#inpEditCancel, #inpEditSave, #inpEditClose')].find(shown)
  if (!btn) return null
  const fw = btn.closest('.floatwin') || btn.closest('[role=dialog]') || btn.parentElement.parentElement
  const band = [...fw.querySelectorAll('[data-testid="inped-moveband"], .moveband')].find(shown)
  const reach = e => { if (!shown(e)) return null; const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !e.closest('[inert]') && !!t && (t === e || e.contains(t)) }
  const r = fw.getBoundingClientRect()
  return { cls: String(fw.className).slice(0, 40), id: fw.id, box: [r.left, r.top, r.width, r.height].map(Math.round), band: band ? band.textContent.replace(/\s+/g, ' ').trim() : null,
    person: shown(fw.querySelector('#inpEditPerson')), dates: shown(fw.querySelector('.dcal')), several: /Several people/.test(fw.innerText), note: /changed on the Inputs page/.test(fw.innerText),
    rmk: fw.querySelector('#inpEditRmk')?.value ?? null, bandClose: reach(band?.querySelector('button')), x: reach(fw.querySelector('[data-testid="inped-cx"]') || fw.querySelector('[aria-label="Close"]')), cancel: reach(fw.querySelector('#inpEditCancel')), save: reach(fw.querySelector('#inpEditSave')) }
})
const badge = async s => { const st = await state(s); return st.badge || st.role }
const open = async s => {
  const { page } = s
  await go(s, 'inputs'); await wait(s, 900); await shut(s)
  if (await page.locator('#inListBtn[aria-pressed="false"]').count()) await press(s, '#inListBtn')
  await wait(s, 300)
  if (!(await page.locator('#inRangePop').filter({ visible: true }).count())) await press(s, '#inRangeBtn')
  if (await page.locator('#inRangeAll').filter({ visible: true }).count()) await press(s, '#inRangeAll')
  await wait(s, 400)
  const row = page.locator(s.desk ? '#inBody tr[data-iid]' : '[data-testid^="inl-row-"]').filter({ visible: true }).first()
  await row.scrollIntoViewIfNeeded(); await press(s, s.desk ? row.locator('[data-testid="in-open"]').first() : row); await wait(s, 600)
}
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a'); await grant(s, 'prowler', '149', 'plan'); await go(s, 'viewsched'); await shut(s)
  await as(s, 'ad2', 'a2'); await pickSq(s, '149'); await shut(s)
  await open(s)
  await page.locator('#inpEditRmk').filter({ visible: true }).first().fill('JB49B words')
  const live = await form(s); note('live form', JSON.stringify(live)); await pic(s, '01-live')
  const sw = s.desk ? await over(s, '#roleBadge') : await over(s, '#burger'); note('over the switch before', sw)
  if (sw !== 'self') { note('NOT WALKED: with the form open the door to the member view is covered by', sw); await pic(s, '01b-switch-covered'); await s.ctx.close(); process.exitCode = 0; throw new Error('stop: switch covered') }
  if (s.desk) await press(s, '#roleBadge'); else { await openMenu(s); note('menu open', (await state(s)).drawerOpen); await pic(s, '01b-menu'); await press(s, '#drawerRole'); await shut(s) }
  await wait(s, 500)
  const held = await form(s); note('held form', JSON.stringify(held), 'badge', await badge(s)); await pic(s, '02-held')
  check('the held form is the same form (person and dates still drawn)', !!held && held.person === live.person && held.dates === live.dates, { live: { person: live.person, dates: live.dates }, held: held && { person: held.person, dates: held.dates, note: held.note } })
  check('the band Close is live', !!held && held.bandClose === true, held && held.bandClose)
  check('the X is live', !!held && held.x === true, held && held.x)
  const target = s.desk ? '#roleBadge' : '#burger'
  const cover = await over(s, target); note('over the switch while held', cover)
  check('the way back named by the band can be pressed', cover === 'self', cover)
  if (!process.env.NOPRESS) await step('a press where the switch is drawn', async () => {
    const b = await page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, target)
    if (s.desk) await page.mouse.click(b.x, b.y); else await page.touchscreen.tap(b.x, b.y)
    await wait(s, 600); const f = await form(s); note('after that press: badge', await badge(s), 'drawer', (await state(s)).drawerOpen, 'form', JSON.stringify(f)); await pic(s, '03-after-press-at-switch')
    if ((await state(s)).drawerOpen) { const r = await over(s, '#drawerRole'); note('role line in the menu', r); if (r === 'self') { await press(s, '#drawerRole'); await shut(s); await wait(s, 500); note('after the menu role line', await badge(s), JSON.stringify(await form(s))) } else await shut(s) }
  })
  if (s.desk && /Member/.test(await badge(s) || '') && await form(s)) await step('the keys', async () => {
    let got = false
    for (let i = 0; i < 60; i++) { await page.keyboard.press('Tab'); if ((await page.evaluate(() => document.activeElement?.id)) === 'roleBadge') { got = true; break } }
    note('Tab reaches the role chip while held:', got, 'focus', await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName))
    if (got) { await page.keyboard.press('Enter'); await wait(s, 600); note('after Enter: badge', await badge(s), JSON.stringify(await form(s))); await pic(s, '04-after-keys') }
  })
  const end = await form(s); const b2 = await badge(s); note('end state: badge', b2, JSON.stringify(end))
  if (end && !/Member/.test(b2 || '')) { check('back in the admin view: the same form, words kept, live', end.person === live.person && end.dates === live.dates && end.rmk === 'JB49B words' && end.save === true && !end.band, end); await pic(s, '05-back') }
  await s.ctx.close()
} finally { finish(tag); await closeAll() }
