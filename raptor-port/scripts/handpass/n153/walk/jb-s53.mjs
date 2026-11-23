// jb-s53 v1 - S53: the Inputs settings, the SANS settings and the Calendar window each opened with an unsaved change, then a pick.
// Saber (master admin). The window must be gone, and the abandoned change saved nowhere; then the reverse: pick first, change, save.
import { signIn, newPage, closeAll, finish, picsFor, note, pic, pickSq, shut, step, check, press, go, state } from './jlib.mjs'
import { wait } from './jb-lib.mjs'
import { over } from '../../n150/walk/r-lib.mjs'
const SZ = process.env.SZ || 'd'
const tag = `s53-${SZ}`
console.log('jb-s53 v1', SZ)
picsFor(tag)
const T = id => `[data-testid="${id}"]`
const vis = (s, sel) => s.page.locator(sel).filter({ visible: true }).count()
const toInputs = async s => { await go(s, 'inputs'); await wait(s, 800); await shut(s); if (await s.page.locator('#inMemberMode').filter({ visible: true }).count()) await press(s, '#inMemberMode'); await wait(s, 250); if (await s.page.locator('#inCalBtn[aria-pressed="false"]').count()) await press(s, '#inCalBtn'); await wait(s, 200) }
const toSans = async s => { await toInputs(s); await press(s, '#inSansMode'); await wait(s, 700) }
const pickDoor = async (s, u, name) => {
  const o = await over(s, s.desk ? '#sqnMenuBtn' : '#burger'); if (o !== 'self') return { pressed: false, cover: o }
  await pickSq(s, u, name); await shut(s); await wait(s, 500); return { pressed: true }
}
/* the keys' door, where a window's shade covers the bar */
async function keyPick(s, u) {
  const { page } = s
  let got = false
  for (let i = 0; i < 60; i++) { await page.keyboard.press('Tab'); if ((await page.evaluate(() => document.activeElement?.id)) === 'sqnMenuBtn') { got = true; break } }
  if (!got) return { pressed: false, cover: 'the keys never reach the squadron button' }
  await page.keyboard.press('Enter'); await wait(s, 250)
  const num = () => page.evaluate(() => document.activeElement?.closest?.('.sqm-row')?.querySelector('.sqm-num')?.textContent?.trim() || '')
  for (let i = 0; i < 6 && (await num()) !== u; i++) { await page.keyboard.press('ArrowDown'); await wait(s, 80) }
  if ((await num()) !== u) return { pressed: false, cover: 'the keys never reach the row' }
  await page.keyboard.press('Enter'); await wait(s, 600); return { pressed: true, door: 'keys' }
}
const member = s => s.page.locator(T('iset-memberfile')).first().isChecked()
const KINDS = [
  { k: 'inputs', page: toInputs, gear: '#inGear', win: T('iset-save'), cancel: T('iset-cancel'), change: async s => { await s.page.locator(T('iset-memberfile')).first().click(); await wait(s, 150) }, read: member },
  { k: 'sans', page: toSans, gear: T('sc-gear'), win: T('sset-save'), cancel: T('sset-cancel'), field: true },
]
/* the first number or text box of the SANS settings: its value changed by typing */
const sansBox = s => s.page.locator('.sset .sset-num').filter({ visible: true }).first()
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  for (const K of KINDS) {
    const read = async () => {
      await K.page(s); await press(s, K.gear); await wait(s, 400)
      let v
      if (K.read) v = await K.read(s); else { const b = sansBox(s); v = (await b.count()) ? await b.inputValue() : null }
      await press(s, K.cancel); await wait(s, 300); return v
    }
    await step(`${K.k}: unsaved change, then a pick`, async () => {
      if (!(await state(s)).barMark?.startsWith('142')) { await pickSq(s, '142'); await shut(s); await wait(s, 300) }
      const v142 = await read(); await pickSq(s, '149'); await shut(s); await wait(s, 300); const v149 = await read(); await pickSq(s, '142'); await shut(s); await wait(s, 300)
      note(`${K.k} before: 142 ${v142} 149 ${v149}`)
      await K.page(s); await press(s, K.gear, `${K.k}-gear`); await wait(s, 350)
      if (K.read) await K.change(s); else { const b = sansBox(s); if (await b.count()) { await b.fill('97'); await wait(s, 150) } else note('no box in the SANS settings') }
      await pic(s, `${K.k}-1-changed`)
      let p = await pickDoor(s, '149', `${K.k}-pick`); note(`${K.k} pick by its door`, JSON.stringify(p))
      if (!p.pressed && s.desk) { p = await keyPick(s, '149'); note(`${K.k} pick by keys`, JSON.stringify(p)) }
      await wait(s, 500); const w = await vis(s, K.win); const st = await state(s); await pic(s, `${K.k}-2-after-pick`)
      note(`${K.k} after the pick: window ${w}, bar ${st.barMark}`)
      if (p.pressed) {
        check(`${K.k}: the settings window closed at the pick`, w === 0, w)
        if (w) { await page.locator(K.win).filter({ visible: true }).first().click({ timeout: 1500 }).catch(() => {}); await wait(s, 400) }
      } else { note(`RECORD ${K.k}: the window prevents the pick`); await press(s, K.cancel); await wait(s, 300) }
      const a149 = await (async () => { if (!(await state(s)).barMark?.startsWith('149')) { await pickSq(s, '149'); await shut(s); await wait(s, 300) } return read() })()
      await pickSq(s, '142'); await shut(s); await wait(s, 300); const a142 = await read()
      check(`${K.k}: the abandoned change saved nowhere`, a142 === v142 && a149 === v149, { v142, a142, v149, a149 })
    })
    await step(`${K.k}: the reverse, pick first, change, save`, async () => {
      if (K.k !== 'inputs') { note('sans reverse: read only the Calendar door below'); return }
      await pickSq(s, '149'); await shut(s); await wait(s, 300); await K.page(s)
      const before = await read(); await K.page(s); await press(s, K.gear); await wait(s, 300); await K.change(s)
      await press(s, K.win, `${K.k}-save`); await wait(s, 500); const after149 = await read()
      check(`${K.k}: a save on 149 lands on 149`, after149 !== before, { before, after149 })
      await pickSq(s, '142'); await shut(s); await wait(s, 300); const on142 = await read(); note(`${K.k} 142 after 149's save: ${on142}`); await pic(s, `${K.k}-3-142-after`)
      await pickSq(s, '149'); await shut(s); await wait(s, 300); await K.page(s); await press(s, K.gear); await wait(s, 300); await K.change(s); await press(s, K.win); await wait(s, 400)
      const back = await read(); check(`${K.k}: put back on 149`, back === before, { before, back })
      await pickSq(s, '142'); await shut(s); await wait(s, 300); const again = await read(); check(`${K.k}: 142 stayed its own through 149's save`, again === on142, { on142, again })
    })
  }
  await step('the Calendar window', async () => {
    await toInputs(s); await press(s, '#inGear'); await wait(s, 300); await press(s, T('iset-days'), 'cal-open'); await wait(s, 500); await pic(s, 'cal-1-open')
    const wins = await page.evaluate(() => [...document.querySelectorAll('.floatwin, [role=dialog]')].filter(e => e.getBoundingClientRect().width > 40).map(e => e.dataset.testid || e.getAttribute('aria-label') || e.className.toString().slice(0, 24)))
    note('Calendar: windows', JSON.stringify(wins))
    let p = await pickDoor(s, '149', 'cal-pick'); note('Calendar pick', JSON.stringify(p))
    if (!p.pressed && s.desk) { p = await keyPick(s, '149'); note('Calendar pick by keys', JSON.stringify(p)) }
    await wait(s, 500); const w2 = await page.evaluate(() => [...document.querySelectorAll('.floatwin, [role=dialog]')].filter(e => e.getBoundingClientRect().width > 40).map(e => e.dataset.testid || e.getAttribute('aria-label') || e.className.toString().slice(0, 24)))
    const st = await state(s); note('after: windows', JSON.stringify(w2), 'bar', st.barMark); await pic(s, 'cal-2-after')
    if (p.pressed) check('Calendar: the windows closed at the pick', w2.length === 0, w2)
    else { note('RECORD Calendar: the window prevents the pick'); await page.keyboard.press('Escape'); await wait(s, 250); await page.keyboard.press('Escape') }
  })
  await s.ctx.close()
} finally { finish(tag); await closeAll() }
