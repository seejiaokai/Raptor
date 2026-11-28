// trk-b - case B and case E(4): unsaved Tracker chart edits (a new test event made in Edit chart layout, the editor closed
// again — chat 162's sw-a.mjs way), then: (b1) a pick of 149 by the top-bar list; (b1m, phone) by ☰'s list; (b2) the switch
// to the member view, and (b3) back again; (e4) with an Input window open and typed in on Inputs, the sign-out.
//   node raptor-port/scripts/handpass/n166/trk-b.mjs <d|402x874>     (ONLY=b1,b2,e4 ...)
// No stand-ins. Pictures: B-<d|p>-*.png, E4-<d|p>-*.png
import { mk, closeAll, FACT, note, signIn, barSq, pageOn, go, shut, pic, windowsNow, roleNow, reachPick, reachView, wait, boxOf, covered, SZTAG } from './lib.mjs'
const SZ = process.argv[2] || 'd', T = SZTAG(SZ)
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = k => !ONLY.length || ONLY.includes(k)
const vis = (s, sel) => s.page.locator(sel).filter({ visible: true })
async function hit(s, sel, ms = 400) {
  const l = typeof sel === 'string' ? vis(s, sel).first() : sel
  if (!(await l.count())) throw new Error('no control ' + sel)
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (s.desk) await l.click({ timeout: 8000 }); else await l.tap({ timeout: 8000 })
  await wait(s, ms)
}
const question = s => s.page.evaluate(() => {
  const m = document.querySelector('#dlgMsg'), d = document.querySelector('#dlgModal')
  if (!m || m.getBoundingClientRect().width < 1) return null
  return { words: m.textContent.replace(/\s+/g, ' ').trim(), title: d?.querySelector('h3, .dlg-title, #dlgTitle')?.textContent.trim() ?? null, buttons: [...d.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => `${b.textContent.trim()}${b.id ? ' (#' + b.id + ')' : ''}`) }
})
const hasEdit = s => s.page.evaluate(() => (document.querySelector('#page-tracker')?.innerText || '').includes('N166EV'))
async function chartEdit(s) {
  const { page } = s
  await go(s, 'tracker'); await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await wait(s, 600)
  await hit(s, '#sylMenuBtn', 300); await hit(s, '#arrangeBtn', 400)
  const add = page.locator('#arrTools button', { hasText: '+ Test' }).first()
  if (!(await add.isVisible())) await hit(s, page.locator('#page-tracker button', { hasText: 'Tools ▾' }).filter({ visible: true }).first(), 300)
  await hit(s, add, 400); await page.waitForSelector('#dlgInput:visible')
  await vis(s, '#dlgInput').first().fill('N166EV'); await hit(s, '#dlgOk', 400)
  await hit(s, '#sylMenuBtn', 300); await hit(s, '#arrangeBtn', 500)
  const ok = await hasEdit(s)
  if (!ok) throw new Error('the unsaved chart edit N166EV is not on the chart')
  return ok
}
const trkSays = s => s.page.evaluate(() => (document.querySelector('#page-tracker')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 200))

async function caseB(tag, how) {
  const k = `B.${T}.${tag}`, P = `B-${T}-${tag}`
  const s = await mk(SZ)
  try {
    await signIn(s, 'ad', 'a')
    FACT(`${k}.editMade`, await chartEdit(s))
    if (how === 'back') {
      /* to the member view first (whatever it asks, Stay is not pressed: the question's own answers are read in b2), then back */
      const d0 = await reachView(s); const q0 = await question(s)
      FACT(`${k}.toMember.press`, d0); FACT(`${k}.toMember.question`, q0)
      if (q0) { FACT(`${k}.note`, 'the switch to the member view asked; "back" run not reached without answering'); await pic(s, `${P}-0-question`); return }
      FACT(`${k}.toMember.role`, await roleNow(s)); FACT(`${k}.toMember.page`, await pageOn(s))
      FACT(`${k}.toMember.trackerTab`, await s.page.evaluate(() => [...document.querySelectorAll('#topnav a[data-page="tracker"], #drawerNav a[data-page="tracker"]')].some(a => a.getBoundingClientRect().width > 0 || a.closest('#drawerNav'))))
    }
    const sq0 = await barSq(s)
    const did = how === 'pick' ? await reachPick(s, 149, 'bar') : how === 'pickmenu' ? await reachPick(s, 149, 'menu') : await reachView(s)
    FACT(`${k}.press`, did)
    await wait(s, 600)
    const q = await question(s)
    FACT(`${k}.question`, q)
    await pic(s, `${P}-1-after-press`)
    if (q) {
      await pic(s, `${P}-1-question`, ['#dlgModal'], 16)
      FACT(`${k}.whileAsked.squadron`, await barSq(s)); FACT(`${k}.whileAsked.role`, await roleNow(s))
      const stay = vis(s, '#dlgModal button').filter({ hasText: /^Stay$/ })
      if (await stay.count()) { await hit(s, stay.first(), 600); FACT(`${k}.afterStay`, { squadron: await barSq(s), role: (await roleNow(s)).badge || (await roleNow(s)).menuLine, page: await pageOn(s) }) }
    } else {
      FACT(`${k}.after`, { squadronBefore: sq0, squadron: await barSq(s), role: (await roleNow(s)).badge || (await roleNow(s)).menuLine, page: await pageOn(s) })
      if ((await pageOn(s)) === 'page-tracker') { FACT(`${k}.after.editOnChart`, await hasEdit(s)); FACT(`${k}.after.tracker`, await trkSays(s)) }
      else FACT(`${k}.after.trackerTabOffered`, await s.page.evaluate(() => !!document.querySelector('#topnav a[data-page="tracker"], #drawerNav a[data-page="tracker"]')))
    }
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 160)) } finally { await s.ctx.close().catch(() => {}) }
}

async function caseE4() {
  const k = `E4.${T}`, P = `E4-${T}`
  const s = await mk(SZ); const { page } = s
  try {
    await signIn(s, 'ad', 'a')
    FACT(`${k}.editMade`, await chartEdit(s))
    await go(s, 'inputs'); await wait(s, 500)
    if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
    if (!(await vis(s, '#inBody tr[data-iid], #inList [data-iid]').count())) { await hit(s, '#inRangeBtn'); if (await page.locator('#inRangeAll').count()) await hit(s, page.locator('#inRangeAll').first()); if (await vis(s, '#inRangeAll').count()) await hit(s, '#inRangeBtn') }
    const row = vis(s, '#inBody tr[data-iid], #inList [data-iid]').first(); const who = (await row.innerText()).split(/[\s,]/)[0]
    const o = row.locator('[data-testid="in-open"]'); await hit(s, (await o.count()) ? o.first() : row, 700)
    const r = vis(s, '#inpEditRmk').first(); await r.click(); await page.keyboard.press('Control+a'); await page.keyboard.type('N166 typed words'); await wait(s, 250)
    FACT(`${k}.window`, (await windowsNow(s)).map(w => w.what)); FACT(`${k}.typed`, await r.inputValue())
    /* the sign-out: the top bar's Logout on a desktop; ☰ then its Sign out on a phone - only where reachable */
    let via
    if (await boxOf(s, '#logout')) { via = 'top bar Logout'; FACT(`${k}.logoutCovered`, await covered(s, '#logout')); await hit(s, '#logout', 700) }
    else { via = '☰ then its sign-out line'; FACT(`${k}.burgerCovered`, await covered(s, '#burger')); if ((await covered(s, '#burger')) !== 'free') { FACT(`${k}.signOut`, 'not reachable with the window open: ☰ is under it'); await pic(s, `${P}-1-menu-covered`); return } await hit(s, '#burger', 400); FACT(`${k}.logoutLineCovered`, await covered(s, '#drawerLogout')); await hit(s, '#drawerLogout', 700) }
    FACT(`${k}.via`, via)
    const q = await question(s); FACT(`${k}.question`, q)
    await pic(s, `${P}-1-after-logout-press`)
    if (q) {
      await pic(s, `${P}-1-question`, ['#dlgModal'], 16)
      FACT(`${k}.discardButtonCovered`, await covered(s, '#dlgAlt'))
      FACT(`${k}.questionWindowsDrawn`, (await windowsNow(s)).map(w => w.what))
      const b = await boxOf(s, '#dlgAlt')
      if (b) { FACT(`${k}.answered`, 'Discard them, pressed at its middle'); if (s.desk) await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2); else await page.touchscreen.tap(b.x + b.w / 2, b.y + b.h / 2); await wait(s, 1200) }
      FACT(`${k}.questionAfterPress`, await question(s))
      /* what a person can do then: the window standing over the question closed by its own Cancel, then Discard */
      if (await question(s)) {
        const cancel = vis(s, '#inpEditPop button').filter({ hasText: /^Cancel$/ })
        if (await cancel.count()) {
          FACT(`${k}.windowCancelCovered`, await s.page.evaluate(() => { const b = [...document.querySelectorAll('#inpEditPop button')].find(x => x.textContent.trim() === 'Cancel' && x.getBoundingClientRect().width > 0); if (!b) return 'not drawn'; const r = b.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return t && (t === b || b.contains(t)) ? 'free' : 'covered by ' + t?.className }))
          const cb = await cancel.first().boundingBox(); if (s.desk) await page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2); else await page.touchscreen.tap(cb.x + cb.width / 2, cb.y + cb.height / 2); await wait(s, 800)
          FACT(`${k}.afterWindowCancel.windows`, (await windowsNow(s)).map(w => `${w.what}: ${w.words.slice(0, 90)} [${w.buttons.join(', ')}]`))
          FACT(`${k}.afterWindowCancel.question`, await question(s))
          await pic(s, `${P}-1b-after-window-cancel`)
          const b2 = await boxOf(s, '#dlgAlt')
          if (b2) { FACT(`${k}.discardCovered2`, await covered(s, '#dlgAlt')); if (s.desk) await page.mouse.click(b2.x + b2.w / 2, b2.y + b2.h / 2); else await page.touchscreen.tap(b2.x + b2.w / 2, b2.y + b2.h / 2); await wait(s, 1200); FACT(`${k}.answered2`, 'Discard them') }
        }
      }
    }
    const out = !!(await vis(s, '#luser').count())
    FACT(`${k}.signedOut`, out)
    FACT(`${k}.windowsLeft`, (await windowsNow(s)).map(w => w.what))
    await pic(s, `${P}-2-after`)
    if (out) {
      await signIn(s, 'ad', 'a')
      await go(s, 'inputs'); await wait(s, 500)
      if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
      const row2 = vis(s, '#inBody tr[data-iid], #inList [data-iid]').filter({ hasText: who }).first()
      if (await row2.count()) { const o2 = row2.locator('[data-testid="in-open"]'); await hit(s, (await o2.count()) ? o2.first() : row2, 700); FACT(`${k}.signedInAgain.inputRemarks`, await vis(s, '#inpEditRmk').first().inputValue().catch(() => null)) }
      await go(s, 'tracker'); await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }).catch(() => {}); await wait(s, 800)
      FACT(`${k}.signedInAgain.chartEditKept`, await hasEdit(s))
    }
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 160)) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('trk-b v1', SZ)
  if (want('b1')) await caseB('b1-pick', 'pick')
  if (want('b1m') && SZ !== 'd') await caseB('b1m-pickmenu', 'pickmenu')
  if (want('b2')) await caseB('b2-to-member', 'view')
  if (want('b3')) await caseB('b3-back-to-admin', 'back')
  if (want('e4')) await caseE4()
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
void note; void shut
