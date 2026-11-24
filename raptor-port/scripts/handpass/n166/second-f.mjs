// second-f - case F: (f1) a second switch pressed while the first waits on the Tracker's question (unsaved chart edits,
// 149 picked, the question up): are the member-view switch and the squadron list reachable, and what do they do?
// (f2) two picks one straight after the other on the Tracker page (149, then 142 at once, no wait between): where does the
// app end, and what does the Tracker show? (f3) Undo and Redo after a pick: Saber changes an input's Remarks on 142 and
// saves (an Undo step), picks 149, reads Undo / Redo, presses Undo, then Redo.
//   node raptor-port/scripts/handpass/n166/second-f.mjs <d|402x874>   (ONLY=f1,f2,f3)
// No stand-ins. Pictures: F-<d|p>-*.png
import { mk, closeAll, FACT, signIn, barSq, pageOn, go, pic, windowsNow, roleNow, reachPick, reachView, wait, boxOf, covered, tapCentre, SZTAG } from './lib.mjs'
const SZ = process.argv[2] || 'd', T = SZTAG(SZ)
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = x => !ONLY.length || ONLY.includes(x)
const vis = (s, sel) => s.page.locator(sel).filter({ visible: true })
async function hit(s, l, ms = 400) { l = typeof l === 'string' ? vis(s, l).first() : l; await l.scrollIntoViewIfNeeded().catch(() => {}); if (s.desk) await l.click({ timeout: 8000 }); else await l.tap({ timeout: 8000 }); await wait(s, ms) }
const question = s => s.page.evaluate(() => { const m = document.querySelector('#dlgMsg'); return m && m.getBoundingClientRect().width > 0 ? m.textContent.replace(/\s+/g, ' ').trim() : null })
const toast = s => s.page.evaluate(() => { const t = document.getElementById('toastEl'); return t && getComputedStyle(t).opacity !== '0' && t.getBoundingClientRect().height > 0 ? t.textContent.replace(/\s+/g, ' ').trim() : null })
const undoBtns = s => s.page.evaluate(() => ['undoBtn', 'redoBtn', 'trUndoBtn', 'trRedoBtn'].map(id => [...document.querySelectorAll('#' + id)].find(e => e.getBoundingClientRect().width > 0)).filter(Boolean).map(b => ({ id: b.id, words: b.textContent.trim(), greyed: b.disabled || b.getAttribute('aria-disabled') === 'true', title: b.title || b.getAttribute('aria-label') })))
async function chartEdit(s) {
  const { page } = s
  await go(s, 'tracker'); await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await wait(s, 600)
  await hit(s, '#sylMenuBtn', 300); await hit(s, '#arrangeBtn', 400)
  const add = page.locator('#arrTools button', { hasText: '+ Test' }).first()
  if (!(await add.isVisible())) await hit(s, page.locator('#page-tracker button', { hasText: 'Tools ▾' }).filter({ visible: true }).first(), 300)
  await hit(s, add, 400); await page.waitForSelector('#dlgInput:visible')
  await vis(s, '#dlgInput').first().fill('N166EV'); await hit(s, '#dlgOk', 400)
  await hit(s, '#sylMenuBtn', 300); await hit(s, '#arrangeBtn', 500)
}
async function f1() {
  const k = `F.${T}.f1`, P = `F-${T}-f1`
  const s = await mk(SZ)
  try {
    await signIn(s, 'ad', 'a'); await chartEdit(s)
    const p = await reachPick(s, 149, 'bar'); FACT(`${k}.firstPick`, { pressed: !!p.pressed, question: await question(s) })
    await pic(s, `${P}-1-question-up`)
    const ctl = {}; for (const sel of ['#sqnMenuBtn', '#burger', '#roleBadge', '#notifyBell', '#logout']) ctl[sel] = (await boxOf(s, sel)) ? await covered(s, sel) : 'not drawn'
    FACT(`${k}.controlsWhileAsked`, ctl)
    const v = await reachView(s); FACT(`${k}.viewSwitchPressed`, v)
    FACT(`${k}.afterViewSwitch`, { question: await question(s), role: (await roleNow(s)).badge || (await roleNow(s)).menuLine, squadron: await barSq(s) })
    const p2 = await reachPick(s, 149, 'bar'); FACT(`${k}.secondPickPressed`, p2)
    FACT(`${k}.afterSecondPick`, { question: await question(s), squadron: await barSq(s), windows: (await windowsNow(s)).map(x => x.what) })
    await pic(s, `${P}-2-after-second`)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 160)) } finally { await s.ctx.close().catch(() => {}) }
}
async function f2() {
  const k = `F.${T}.f2`, P = `F-${T}-f2`
  const s = await mk(SZ); const { page } = s
  try {
    await signIn(s, 'ad', 'a'); await go(s, 'tracker'); await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await wait(s, 600)
    /* two picks, no wait between: the list opened, 149 pressed, the list opened again, 142 pressed */
    const tapSel = async sel => { const b = await boxOf(s, sel); if (!b) return false; if (s.desk) await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2); else await page.touchscreen.tap(b.x + b.w / 2, b.y + b.h / 2); return true }
    const row = n => `#sqnMenu .sqm-row[data-unit="u${n}"]`
    await tapSel('#sqnMenuBtn'); await page.waitForSelector(row(149), { timeout: 3000 }); await tapSel(row(149))
    const opened = await tapSel('#sqnMenuBtn'); await page.waitForSelector(row(142), { timeout: 3000 }).catch(() => {}); const second = await tapSel(row(142))
    FACT(`${k}.presses`, { first: true, listReopened: opened, second })
    await wait(s, 2500)
    const chartSq = await page.evaluate(() => (document.querySelector('#page-tracker')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 120))
    FACT(`${k}.after`, { squadron: await barSq(s), page: await pageOn(s), question: await question(s), tracker: chartSq, chart: await page.locator('#flowSvg .ball').count() })
    await pic(s, `${P}-1-after-two-picks`)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 160)) } finally { await s.ctx.close().catch(() => {}) }
}
async function f3() {
  const k = `F.${T}.f3`, P = `F-${T}-f3`, W = 'N166F3 words'
  const s = await mk(SZ); const { page } = s
  const stored = () => page.evaluate(w => { const o = []; for (let i = 0; i < localStorage.length; i++) { const kk = localStorage.key(i); if (kk.startsWith('raptor:inputs/') && (localStorage.getItem(kk) || '').includes(w)) o.push(kk) } return o }, W)
  try {
    await signIn(s, 'ad', 'a'); await go(s, 'inputs'); await wait(s, 600)
    if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
    if (!/All dates/.test((await page.locator('#inRangeBtn').first().textContent().catch(() => '')) || '')) { await hit(s, '#inRangeBtn'); if (await page.locator('#inRangeAll').count()) await hit(s, page.locator('#inRangeAll').first()); if (await vis(s, '#inRangeAll').count()) await hit(s, '#inRangeBtn') }
    const row = vis(s, '#inBody tr[data-iid], #inList [data-iid]').first(); FACT(`${k}.input`, (await row.innerText()).replace(/\s+/g, ' ').slice(0, 40))
    const o = row.locator('[data-testid="in-open"]'); await hit(s, (await o.count()) ? o.first() : row, 700)
    const r = vis(s, '#inpEditRmk').first(); await r.click(); await page.keyboard.press('Control+a'); await page.keyboard.type(W)
    await hit(s, '#inpEditSave', 900)
    FACT(`${k}.on142.undoRedo`, await undoBtns(s)); FACT(`${k}.on142.stored`, await stored())
    const p = await reachPick(s, 149, 'bar'); FACT(`${k}.pick149`, { pressed: !!p.pressed, squadron: await barSq(s) })
    FACT(`${k}.on149.undoRedo`, await undoBtns(s))
    await pic(s, `${P}-1-on149-undo`, ['.tb-hist', '.topbar'], 8)
    const u = await boxOf(s, '#undoBtn')
    if (u && (await covered(s, '#undoBtn')) === 'free') {
      await tapCentre(s, '#undoBtn'); await wait(s, 700)
      FACT(`${k}.on149.afterUndo`, { squadron: await barSq(s), page: await pageOn(s), toast: await toast(s), question: await question(s), undoRedo: await undoBtns(s), stillStored: await stored(), windows: (await windowsNow(s)).map(x => x.what + ': ' + x.words.slice(0, 80)) })
      await pic(s, `${P}-2-after-undo`)
      if ((await boxOf(s, '#redoBtn')) && (await covered(s, '#redoBtn')) === 'free') {
        await tapCentre(s, '#redoBtn'); await wait(s, 700)
        FACT(`${k}.on149.afterRedo`, { squadron: await barSq(s), toast: await toast(s), undoRedo: await undoBtns(s), stored: await stored() })
        await pic(s, `${P}-3-after-redo`)
      }
    } else FACT(`${k}.on149.undo`, u ? 'covered: ' + await covered(s, '#undoBtn') : 'no Undo drawn')
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 160)) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('second-f v1', SZ)
  if (want('f1')) await f1()
  if (want('f2')) await f2()
  if (want('f3')) await f3()
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
