// rc-07 - re-walk of item 7: a held Input window. Hunter (Plan of 149) on 149's Inputs opens another person's input, types in
// Remarks, presses the role chip. Every press is the app's own; the page is only read.
import { signIn, mk, closeAll, finish, step, pic, picsFor, press, as, grant, go, shut, pickSq, state, note, check, layoutDiff } from './rlib.mjs'
const SZ = process.env.SZ || 'd'
const RUN = process.env.RUN || '1'
const tag = `rc07-${SZ}-${RUN}`
console.log('rc-07 v1', SZ, RUN, process.env.MQ_PORT)
picsFor(tag)
const wait = (s, ms) => s.page.waitForTimeout(ms)
const CHIP = '[data-testid="inped-rolechip"]'
const read = s => s.page.evaluate(CHIP => {
  const shown = e => !!e && e.getBoundingClientRect().width > 0
  const btn = [...document.querySelectorAll('#inpEditCancel, #inpEditSave, #inpEditClose')].find(shown)
  if (!btn) return null
  const fw = btn.closest('.floatwin') || btn.closest('.airpop') || btn.closest('[role=dialog]') || btn.parentElement.parentElement
  const heads = [...fw.querySelectorAll('label, .lbl, .inped-l, h4, h5, div')].filter(e => shown(e) && e.children.length === 0 && /^(PERSON|TYPE|DURATION|DOCUMENT|REMARKS|DATES)$/i.test(e.textContent.trim())).map(e => e.textContent.trim().toUpperCase())
  const rmk = fw.querySelector('#inpEditRmk'), save = document.querySelector('#inpEditSave')
  const chip = document.querySelector(CHIP)
  let chipTop = null
  if (shown(chip)) { const b = chip.getBoundingClientRect(); const t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); chipTop = t === chip || chip.contains(t) ? 'self' : `${t?.tagName}.${String(t?.className).slice(0, 30)}` }
  const body = fw.querySelector('.inped-body')
  const pf = [...fw.querySelectorAll('.inped-f')].find(x => /^PERSON/i.test(x.textContent.trim())), ps = pf?.querySelector('select')
  const person = ps ? ps.selectedOptions[0]?.textContent.trim() : (pf ? pf.textContent.replace(/^PERSON/i, '').replace(/Several people/, '').trim() : null)
  return { heads, person, hint: fw.querySelector('.inped-hint')?.textContent.replace(/\s+/g, ' ').trim() ?? null, band: fw.querySelector('.moveband')?.textContent.replace(/\s+/g, ' ').trim() ?? null, rmk: rmk ? rmk.value : null, rmkOff: rmk ? rmk.disabled || rmk.readOnly : null, bodyInert: !!body?.hasAttribute('inert'), saveOff: save ? save.disabled : null, chip: shown(chip), chipTop, chipText: chip?.textContent.replace(/\s+/g, ' ').trim() ?? null, winBox: (b => [b.left, b.top, b.width, b.height].map(Math.round))(fw.querySelector('.airpop-card, .airpop-box, .inped') ? fw.querySelector('.airpop-card, .airpop-box, .inped').getBoundingClientRect() : fw.getBoundingClientRect()) }
}, CHIP)
const snap = s => s.page.evaluate(() => { const hash = t => { let h = 5381; for (let i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return h.toString(36) + ':' + t.length }; const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = hash(localStorage.getItem(k) || '') } return o })
const focusName = s => s.page.evaluate(() => { const a = document.activeElement; if (!a) return null; return `${a.tagName.toLowerCase()}${a.id ? '#' + a.id : ''}${a.dataset?.testid ? '[' + a.dataset.testid + ']' : ''}.${String(a.className).split(' ').slice(0, 2).join('.')}` })
async function listAll(s) {
  const { page } = s
  if (await page.locator('#inListBtn[aria-pressed="false"]').count()) await press(s, '#inListBtn')
  if (!(await page.locator('#inRangePop').filter({ visible: true }).count())) await press(s, '#inRangeBtn')
  if (await page.locator('#inRangeAll').filter({ visible: true }).count()) await press(s, '#inRangeAll')
  await wait(s, 400)
  if (await page.locator('#inRangePop').filter({ visible: true }).count()) { await press(s, '#inRangeBtn'); await wait(s, 250) }
}
async function openForm(s, words) {
  const { page } = s
  await go(s, 'inputs'); if (!s.desk) await shut(s); await wait(s, 800)
  await listAll(s)
  const row = page.locator(s.desk ? '#inBody tr[data-iid]' : '[data-testid^="inl-row-"]', { hasText: 'Gannet' }).filter({ visible: true }).first()
  note('rows with Gannet', await row.count(), 'bar', (await state(s)).barMark, 'menu', (await state(s)).dMark)
  if (!(await row.count())) await pic(s, '00-no-row')
  await row.scrollIntoViewIfNeeded().catch(() => {})
  await press(s, s.desk ? row.locator('[data-testid="in-open"]').first() : row, s.desk ? undefined : 'open-row'); await wait(s, 700)
  await page.locator('#inpEditRmk').filter({ visible: true }).first().fill(words)
  await wait(s, 200)
}
try {
  const s = await mk(SZ); const { page } = s
  await signIn(s, 'ad', 'a'); await grant(s, 'prowler', '149', 'plan'); await go(s, 'viewsched'); if (!s.desk) await shut(s)
  await as(s, 'ad2', 'a2'); await pickSq(s, '149'); await shut(s)

  if (s.desk) {
    await step('K: held by the chip, Tab to the lifted chip, Enter', async () => {
      await openForm(s, 'RC words one')
      const live = await read(s); note('live', JSON.stringify(live)); await pic(s, '01-live-typed')
      check('K the form is live before the chip', !!live && live.rmk === 'RC words one' && !live.bodyInert && !live.band, live)
      await press(s, '#roleBadge'); await wait(s, 800)
      const held = await read(s); note('held', JSON.stringify(held)); await pic(s, '02-held'); await pic(s, '02b-held-window', ['.airpop .airpop-card', '.airpop [role=dialog]', CHIP])
      check('K the band is the approved one', /Switch back to the admin view to change this, or close it/.test(held?.band || ''), held?.band)
      check('K the typed words are in the held window', held?.rmk === 'RC words one', held?.rmk)
      check('K PERSON line is drawn with the person', held?.person === 'Gannet', held?.person)
      check('K the note reads as drawn', held?.hint === 'The dates are changed on the Inputs page.', held?.hint)
      check('K the role chip is drawn and on top at its own point', held?.chip && held?.chipTop === 'self', { chip: held?.chip, top: held?.chipTop, text: held?.chipText })
      check('K the window body is locked', held?.bodyInert === true, held?.bodyInert)
      // what can still be pressed or typed while held
      const before = await snap(s), tries = {}
      const rb = await page.locator('#inpEditRmk').filter({ visible: true }).first().boundingBox()
      await page.mouse.click(rb.x + 20, rb.y + rb.height / 2); await page.keyboard.type('XX'); await wait(s, 150)
      tries.remarksAfterTyping = (await read(s))?.rmk
      for (const [name, sel] of [['AM', '.inped-body button:has-text("AM")'], ['PM', '.inped-body button:has-text("PM")'], ['a date', '.inped-body [data-testid^="dcal-day"], .inped-body .ic-day'], ['Save', '#inpEditSave'], ['Delete', '#inpEditDelete, #inpEditDel']]) {
        const l = page.locator(sel).filter({ visible: true }).first()
        if (!(await l.count())) { tries[name] = 'not drawn'; continue }
        const b = await l.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await wait(s, 220)
        const r = await read(s); const q = await page.locator('#dlgModal').count()
        tries[name] = { formOpen: !!r, question: q }
        if (q) { await page.keyboard.press('Escape'); await wait(s, 150) }
      }
      const doc = page.locator('.inped-body button:has-text("Document"), .inped-body label:has-text("Document")').filter({ visible: true }).first()
      if (await doc.count()) { const fc = page.waitForEvent('filechooser', { timeout: 1200 }).then(() => 'A FILE BOX OPENED').catch(() => 'no file box'); const b = await doc.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); tries.document = await fc } else tries.document = 'not drawn'
      const after = await snap(s); const wrote = layoutDiff(before, after)
      note('tries', JSON.stringify(tries)); note('stores changed', JSON.stringify(wrote))
      const h2 = await read(s); await pic(s, '03-after-tries')
      check('K typing in Remarks while held changes nothing', tries.remarksAfterTyping === 'RC words one', tries.remarksAfterTyping)
      check('K no file box opens while held', tries.document !== 'A FILE BOX OPENED', tries.document)
      check('K nothing saved by any press while held', wrote.length === 0, wrote)
      check('K the window is still held with the words after the presses', !!h2 && h2.rmk === 'RC words one' && !!h2.band, h2)
      // Tab from inside the window to the chip
      const title = page.locator('.airpop .win-bar, .airpop .airpop-head').filter({ visible: true }).first()
      if (await title.count()) { const b = await title.boundingBox(); await page.mouse.click(b.x + 90, b.y + b.height / 2) }
      const path = [await focusName(s)]; let presses = 0, on = false
      for (let i = 1; i <= 25 && !on; i++) { await page.keyboard.press('Tab'); await wait(s, 60); presses = i; const f = await focusName(s); path.push(f); on = !!f && f.includes('inped-rolechip') }
      note('Tab path', JSON.stringify(path))
      check('K Tab reaches the lifted chip', on, { presses, path }); await pic(s, '04-tab-on-chip')
      if (!on) { await page.locator(CHIP).focus() }
      await page.keyboard.press('Enter'); await wait(s, 900)
      const back = await read(s), st = await state(s); note('after Enter', JSON.stringify(back), st.badge, st.page); await pic(s, '05-after-enter')
      check('K Enter switches back: the window is live with the words', !!back && back.rmk === 'RC words one' && !back.band && !back.bodyInert, back)
      check('K the chip is gone once live', back?.chip === false, back?.chip)
      await press(s, '#inpEditSave'); await wait(s, 900)
      const open = await read(s); await pic(s, '06-after-save'); note('page after Save', (await state(s)).page)
      await go(s, 'inputs'); await wait(s, 800); await listAll(s); const listed = await page.evaluate(() => document.querySelector('#inBody')?.innerText.includes('RC words one')); await pic(s, '07-inputs-list')
      check('K Save closes the window and the Inputs list shows the words', !open && listed === true, { open: !!open, listed })
    })
    await step('M: the same by a mouse press on the chip', async () => {
      await openForm(s, 'RC words two')
      await press(s, '#roleBadge'); await wait(s, 800)
      const held = await read(s); await pic(s, '10-held-2')
      check('M held with the words', !!held && !!held.band && held.rmk === 'RC words two', held)
      const b = await page.locator(CHIP).boundingBox(); const at = await page.evaluate(([x, y, c]) => { const e = document.elementFromPoint(x, y), k = document.querySelector(c); return e === k || k.contains(e) }, [b.x + b.width / 2, b.y + b.height / 2, CHIP])
      check('M the point under the mouse is the chip', at, at)
      await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await wait(s, 900)
      const back = await read(s); await pic(s, '11-after-mouse-chip')
      check('M a press on the chip switches back, words kept, live', !!back && back.rmk === 'RC words two' && !back.band && !back.bodyInert, back)
      await press(s, '#inpEditSave'); await wait(s, 900)
      const open2 = await read(s); await go(s, 'inputs'); await wait(s, 800); await listAll(s)
      const listed = await page.evaluate(() => document.querySelector('#inBody')?.innerText.includes('RC words two'))
      await pic(s, '12-after-save-2')
      check('M Save: the Inputs list shows the words', listed === true && !open2, { listed, open: !!open2 })
    })
    await step('C: the held window closed by its band Close leaves the member view and saves nothing', async () => {
      await openForm(s, 'RC words three')
      await press(s, '#roleBadge'); await wait(s, 800); const before = await snap(s)
      const close = page.locator('.moveband button').filter({ visible: true }).first()
      await close.click(); await wait(s, 700); await pic(s, '20-after-band-close')
      const st = await state(s), wrote = layoutDiff(before, await snap(s)), gone = !(await read(s))
      note('after band Close', st.badge, st.page)
      check('C the band Close closes the window', gone, gone)
      check('C nothing saved by it', wrote.length === 0, wrote)
    })
  } else {
    await step('P: the phone: the real way to the member view with the form open', async () => {
      await openForm(s, 'RC phone words')
      const live = await read(s); note('live', JSON.stringify(live)); await pic(s, '01-phone-live')
      const at = await page.evaluate(() => { const b = document.querySelector('#burger'); if (!b) return null; const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, t = document.elementFromPoint(x, y); return { x, y, box: [r.left, r.top, r.width, r.height].map(Math.round), onBurger: t === b || b.contains(t), top: t ? `${t.tagName}#${t.id}.${String(t.className).slice(0, 30)}` : null } })
      note('the burger with the form open', JSON.stringify(at))
      check('P the form stands over the ☰ on a phone (as the sheet says)', at && !at.onBurger, at)
      if (at && at.onBurger) {
        await page.touchscreen.tap(at.x, at.y); await wait(s, 500); await pic(s, '02-phone-burger-open')
      } else if (at) {
        const before = await read(s)
        await page.touchscreen.tap(at.x, at.y); await wait(s, 500)
        const after = await read(s), st = await state(s); await pic(s, '02-phone-after-tap-at-burger')
        note('a tap where the ☰ stands', JSON.stringify({ formOpen: !!after, rmk: after?.rmk, drawer: st.drawerOpen }))
        check('P a tap where ☰ stands keeps the typed words', !!after && after.rmk === 'RC phone words' || !before, { formOpen: !!after, rmk: after?.rmk })
      }
    })
  }
  await s.ctx.close()
} finally { finish(tag); await closeAll() }
