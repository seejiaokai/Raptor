// p5-n2 - P5 case N2 (the build plan's §8.3): his own input shown on another squadron's Inputs page.
// SET-UP by presses (p5-setup.mjs plan): Hunter given PLAN of 149; his Duty on Tue 8 Dec 2026 filed on 142 = state A.
// Then, fresh browsers with that saved data: Hunter (142's admin) signs in, picks 149 (top-bar picker; ☰ list on a phone),
// opens Inputs: the calendar moved to December by its own ›, and the List with All dates - is his 142 duty among 149's?
// Tapped: what opens, what the bar says, which controls are live. Then
//   save   - Remarks changed to new words, Save pressed: which saved record changed (storage keys before/after), the bar
//   del    - (a second fresh browser) Delete pressed and its question answered: which record went, the bar
//   node raptor-port/scripts/handpass/n175/p5-n2.mjs <d|p>
// Pictures: p5-n2-<d|p>-1-calendar, p5-n2-<d|p>-2-list, p5-n2-<d|p>-3-opened
import { mk, closeAll, FACT, signIn, go, wait, vis, hit, shot, scratch, reachPick, barSq, pageOn, windowsNow, roleNow, toastNow, bands } from './lib.mjs'
import { setupP5 } from './p5-setup.mjs'
const SZ = process.argv[2] || 'd'; const SEC = 'p5'
const via = s => (s.desk ? 'bar' : 'menu')
const winFacts = async s => (await windowsNow(s)).map(w => `${w.what}${w.inert ? ' [inert]' : ''}: ${w.words.slice(0, 200)} | buttons: ${w.buttons.join(', ')}`)
const snap = s => s.page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k) } return o })
const changed = (a, b) => Object.keys({ ...a, ...b }).filter(k => a[k] !== b[k] && !/seen|view|ui|pref|last|sess/i.test(k)).map(k => `${k} ${String(b[k] ?? '(removed)').replace(/\s+/g, ' ').slice(0, 220)}`)
const state = async s => ({ squadron: await barSq(s), page: await pageOn(s), role: (await roleNow(s)).badge, toast: await toastNow(s), bands: await bands(s) })
const inpCtl = s => s.page.evaluate(() => { const r = {}; for (const id of ['inpEditSave', 'inpEditDel', 'inpEditRmk', 'inpEditPerson', 'inpEditType']) { const e = [...document.querySelectorAll('#' + id)].find(x => x.getBoundingClientRect().width > 0); r[id] = e ? (e.disabled || e.readOnly ? 'greyed' : 'live') : 'not drawn' } return r })
async function toInputs149(s) {
  await signIn(s, 'ad2', 'a2')
  const p = await reachPick(s, 149, via(s))
  await go(s, 'inputs'); await wait(s, 700)
  return { pressed: !!p.pressed, rows: p.listRows, ...(await state(s)) }
}
async function toList(s) {
  if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
  if (!/All dates/.test((await s.page.locator('#inRangeBtn').first().textContent().catch(() => '')) || '')) { await hit(s, '#inRangeBtn'); if (await s.page.locator('#inRangeAll').count()) await hit(s, s.page.locator('#inRangeAll').first()); if (await vis(s, '#inRangeAll').count()) await hit(s, '#inRangeBtn') }
  await wait(s, 500)
}
const rowsNow = s => s.page.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid], #inList [data-iid]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 70)))
async function openHunter(s) {
  await toList(s)
  const row = vis(s, '#inBody tr[data-iid], #inList [data-iid]').filter({ hasText: /n175 duty hunter/ }).first()
  if (!(await row.count())) return null
  const o = row.locator('[data-testid="in-open"]'); await hit(s, (await o.count()) ? o.first() : row, 900)
  return true
}
try {
  console.log('p5-n2 v1', SZ)
  const st = await setupP5('plan')
  const k = `p5.n2.${SZ}`, P = `p5-n2-${SZ}`
  /* look + save */
  let s = await mk(SZ, { storageState: st.A })
  try {
    FACT(`${k}.1.on149Inputs`, await toInputs149(s))
    /* the calendar, moved to December by its own › */
    const nx = vis(s, '.page.on button').filter({ hasText: /^›$/ }).first()
    if (await nx.count()) await hit(s, nx, 700)
    const cal = await s.page.evaluate(() => { const p = document.querySelector('.page.on'); const t = (p?.innerText || '').replace(/\s+/g, ' '); return { month: (t.match(/(DECEMBER|DEC) 2026/) || [null])[0], hunterOnCalendar: /Hunter/.test(t), entries: [...p.querySelectorAll('[data-iid]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 40)).slice(0, 12) } })
    FACT(`${k}.2.calendarDec`, cal)
    const hEl = await s.page.evaluate(() => { const e = [...document.querySelectorAll('.page.on [data-iid]')].find(x => x.getBoundingClientRect().height > 0 && /Hunter/.test(x.innerText)); if (e) { e.setAttribute('data-n175ring', '1'); return true } return false })
    await shot(s, `${P}-1-calendar`, hEl ? ['[data-n175ring]'] : [], hEl ? null : null, 60)
    await s.page.evaluate(() => document.querySelectorAll('[data-n175ring]').forEach(e => e.removeAttribute('data-n175ring')))
    await toList(s)
    FACT(`${k}.3.listRows`, await rowsNow(s))
    const r = await s.page.evaluate(() => { const e = [...document.querySelectorAll('#inBody tr[data-iid], #inList [data-iid]')].find(x => x.getBoundingClientRect().height > 0 && /n175 duty hunter/.test(x.innerText)); if (e) { e.setAttribute('data-n175ring', '1'); return true } return false })
    await shot(s, `${P}-2-list`, r ? ['[data-n175ring]'] : ['#sqnMenuBtn, .topbar .mark'], null, 60)
    await s.page.evaluate(() => document.querySelectorAll('[data-n175ring]').forEach(e => e.removeAttribute('data-n175ring')))
    const opened = await openHunter(s)
    FACT(`${k}.4.tapped`, { opened: !!opened, ...(await state(s)) }); FACT(`${k}.4.windows`, await winFacts(s)); FACT(`${k}.4.controls`, await inpCtl(s))
    await shot(s, `${P}-3-opened`, [s.desk ? '#sqnMenuBtn' : '.topbar .mark', '.inpedwin'], null, 24)
    if (opened && (await inpCtl(s)).inpEditRmk === 'live') {
      const before = await snap(s)
      const rm = vis(s, '#inpEditRmk').first()
      if (s.desk) { await rm.click(); await s.page.keyboard.press('Control+a'); await s.page.keyboard.type('n175 N2 saved from 149') } else await rm.evaluate((e, w) => { const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'value').set; set.call(e, w); e.dispatchEvent(new Event('input', { bubbles: true })) }, 'n175 N2 saved from 149')
      await hit(s, '#inpEditSave', 900)
      for (let i = 0; i < 3; i++) { const nd = vis(s, 'button').filter({ hasText: /^No document$/ }); if (await nd.count()) await hit(s, nd.first()); if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk') }
      await wait(s, 600)
      FACT(`${k}.5.afterSave`, { ...(await state(s)), windows: (await winFacts(s)).map(w => w.slice(0, 120)) })
      FACT(`${k}.5.storageChanged`, changed(before, await snap(s)))
      /* where it shows now: 142's list */
      await scratch(s, SEC, `${P}-4-after-save`)
    }
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
  /* delete, in a fresh browser */
  s = await mk(SZ, { storageState: st.A })
  try {
    await toInputs149(s)
    const opened = await openHunter(s)
    FACT(`${k}.6.delOpened`, { opened: !!opened, squadron: await barSq(s), controls: await inpCtl(s) })
    if (opened && (await inpCtl(s)).inpEditDel === 'live') {
      const before = await snap(s)
      await hit(s, '#inpEditDel', 700)
      FACT(`${k}.6.delAsked`, (await winFacts(s)).map(w => w.slice(0, 160)))
      const yes = vis(s, '#dlgOk, button').filter({ hasText: /^(Delete|Yes|OK|Delete input)$/ }).first()
      if (await yes.count()) await hit(s, yes, 900)
      FACT(`${k}.6.afterDelete`, { ...(await state(s)), windows: (await winFacts(s)).map(w => w.slice(0, 120)) })
      FACT(`${k}.6.storageChanged`, changed(before, await snap(s)))
      await toList(s); FACT(`${k}.6.listRowsAfter`, await rowsNow(s))
      await scratch(s, SEC, `${P}-5-after-delete`)
    }
  } catch (e) { FACT(`${k}.del.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-del-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
