// p4-undo - P4 case 1, Undo's edges (H9; C41-C45; F56). Saber (admin of 142 and 149, a master admin).
//   (a) a step on 142 (an input's Remarks saved), a step on 149 (the same, an input of 149), and "+ New squadron" 150
//       made from Admin -> Squadrons: Undo / Redo as drawn (words, greyed, the tooltip the app puts on them) on each
//       squadron in turn.
//   (b) a 142 step undone on 142; pick 149; a new change on 149; back to 142: is 142's Redo still offered?
//   (c) "+ New squadron" 150 made, 150 picked (in view), Undo pressed: what it does and says.
//   (d) on a phone: the greyed Undo - a tap, then a long press: is its reason shown anywhere?
//   node raptor-port/scripts/handpass/n175/p4-undo.mjs <d|402x874>    (ONLY=a,b,c,d)
// No stand-ins. Deciding pictures: p4-undo<case>-<d|p>-*.png
import { mk, closeAll, FACT, signIn, barSq, pageOn, go, reachPick, wait, vis, hit, undoBtns, toast, question, tpic, dpic, SZT, boxOf, covered, tapCentre, windowsNow, sayNow } from './p4-lib.mjs'
const SZ = process.argv[2] || 'd', T = SZT(SZ)
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = x => !ONLY.length || ONLY.includes(x)
const pick = async (s, n) => { let p = await reachPick(s, n, 'bar'); if (!p.pressed && !s.desk) p = await reachPick(s, n, 'menu'); await wait(s, 600); return { pressed: !!p.pressed, via: p.control, squadron: await barSq(s) } }
/* the Undo pair as a person sees it: on a phone the bar may not draw it on every page - the Edit Schedule page is used for reading */
const readUndo = async (s, where) => ({ where, squadron: await barSq(s), page: await pageOn(s), buttons: await undoBtns(s) })

/* a step: an input's Remarks changed and saved on the squadron in view (first input of the list, all dates) */
async function inputStep(s, words) {
  const { page } = s
  await go(s, 'inputs'); await wait(s, 700)
  if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
  if (!/All dates/.test((await page.locator('#inRangeBtn').first().textContent().catch(() => '')) || '')) { await hit(s, '#inRangeBtn'); if (await page.locator('#inRangeAll').count()) await hit(s, page.locator('#inRangeAll').first()); if (await vis(s, '#inRangeAll').count()) await hit(s, '#inRangeBtn') }
  const row = vis(s, '#inBody tr[data-iid], #inList [data-iid]').first()
  if (!(await row.count())) return { made: false, why: 'no input in the list' }
  const who = (await row.innerText()).replace(/\s+/g, ' ').slice(0, 40)
  const o = row.locator('[data-testid="in-open"]'); await hit(s, (await o.count()) ? o.first() : row, 700)
  const r = vis(s, '#inpEditRmk').first(); if (!(await r.count())) return { made: false, why: 'no Remarks box', who }
  if (s.desk) await r.click(); else await r.tap()
  await page.keyboard.press('Control+a'); await page.keyboard.type(words)
  await hit(s, '#inpEditSave', 1200)
  return { made: true, input: who, toast: await toast(s) }
}
/* "+ New squadron" from Admin -> Squadrons: the number typed, the rest left as drawn, Save */
async function newSquadron(s, num) {
  const { page } = s
  await go(s, 'admin'); await wait(s, 700)
  if (await vis(s, '.adm-back').count()) await hit(s, '.adm-back')
  const t = vis(s, '#page-admin button.adm-cat').filter({ hasText: /^Squadrons/ }); if (await t.count()) await hit(s, t.first(), 700)
  if (!(await vis(s, '#sqNew').count())) return { made: false, why: 'no + New squadron drawn' }
  await hit(s, '#sqNew', 500)
  const n = vis(s, '#sqNewNum').first(); if (s.desk) await n.click(); else await n.tap(); await page.keyboard.type(String(num))
  /* the first admin: the first name the list offers (Hunter · 142), chosen as a person chooses it */
  const opts = await page.locator('#sqNewAdmin').first().evaluate(e => [...e.options].map(o => ({ v: o.value, t: o.text }))).catch(() => [])
  const firstName = opts.find(o => o.v)
  if (firstName) await vis(s, '#sqNewAdmin').first().selectOption(firstName.v)
  const form = { offered: opts.map(o => o.t), note: await page.locator('#sqNewNote').first().textContent().catch(() => null), admin: await page.locator('#sqNewAdmin').first().evaluate(e => e.options[e.selectedIndex]?.text).catch(() => null) }
  await hit(s, '#sqNewSave', 1200)
  return { made: true, form, toast: await toast(s), list: (await page.locator('#sqList').first().innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 200) }
}
async function onEditSched(s) { await go(s, 'editsched'); await wait(s, 900) }

async function a() {
  const k = `U.${T}.a`, P = `p4-undoa-${T}`
  const s = await mk(SZ)
  try {
    await signIn(s, 'ad', 'a')
    FACT(`${k}.step142`, await inputStep(s, 'N175U a142'))
    await onEditSched(s); FACT(`${k}.after142`, await readUndo(s, 'on 142, after its step'))
    FACT(`${k}.pick149`, await pick(s, 149))
    await onEditSched(s); FACT(`${k}.on149.before149step`, await readUndo(s, 'on 149, before any 149 step'))
    FACT(`${k}.step149`, await inputStep(s, 'N175U a149'))
    await onEditSched(s); FACT(`${k}.on149.after149step`, await readUndo(s, 'on 149, after its own step'))
    await dpic(s, `${P}-1-on149`, ['#undoBtn', '#redoBtn'], ['.topbar'])
    FACT(`${k}.newSquadron`, await newSquadron(s, 150))
    await onEditSched(s); FACT(`${k}.on149.afterNewSqn`, await readUndo(s, 'on 149, after + New squadron 150'))
    FACT(`${k}.pick142`, await pick(s, 142))
    await onEditSched(s); FACT(`${k}.on142`, await readUndo(s, 'back on 142'))
    await dpic(s, `${P}-2-on142`, ['#undoBtn', '#redoBtn'], ['.topbar'])
    FACT(`${k}.pick150`, await pick(s, 150))
    await onEditSched(s); FACT(`${k}.on150`, await readUndo(s, 'on 150'))
    await tpic(s, `${P}-3-on150`)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)) } finally { await s.ctx.close().catch(() => {}) }
}
async function b() {
  const k = `U.${T}.b`, P = `p4-undob-${T}`
  const s = await mk(SZ)
  try {
    await signIn(s, 'ad', 'a')
    FACT(`${k}.step142`, await inputStep(s, 'N175U b142'))
    await onEditSched(s); FACT(`${k}.before`, await readUndo(s, 'on 142, after its step'))
    if ((await covered(s, '#undoBtn')) !== 'free') { FACT(`${k}.undo`, 'Undo ' + await covered(s, '#undoBtn')); return }
    await tapCentre(s, '#undoBtn'); await wait(s, 700)
    FACT(`${k}.undone142`, { toast: await toast(s), ...(await readUndo(s, 'on 142, after Undo')) })
    FACT(`${k}.pick149`, await pick(s, 149))
    await onEditSched(s); FACT(`${k}.on149.beforeChange`, await readUndo(s, 'on 149 before a change'))
    FACT(`${k}.step149`, await inputStep(s, 'N175U b149'))
    await onEditSched(s); FACT(`${k}.on149.afterChange`, await readUndo(s, 'on 149 after a new change'))
    FACT(`${k}.pick142`, await pick(s, 142))
    await onEditSched(s); FACT(`${k}.back142`, await readUndo(s, 'back on 142'))
    await dpic(s, `${P}-1-back142`, ['#undoBtn', '#redoBtn'], ['.topbar'])
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)) } finally { await s.ctx.close().catch(() => {}) }
}
async function c() {
  const k = `U.${T}.c`, P = `p4-undoc-${T}`
  const s = await mk(SZ); const { page } = s
  try {
    await signIn(s, 'ad', 'a')
    FACT(`${k}.newSquadron`, await newSquadron(s, 150))
    FACT(`${k}.onAdminAfter`, await readUndo(s, 'Admin, after the save'))
    FACT(`${k}.pick150`, await pick(s, 150))
    await onEditSched(s); FACT(`${k}.on150`, await readUndo(s, 'on 150, in view'))
    await dpic(s, `${P}-1-on150-before-undo`, ['#undoBtn'], ['.topbar'])
    if ((await covered(s, '#undoBtn')) !== 'free' || (await undoBtns(s)).find(x => x.id === 'undoBtn')?.greyed) { FACT(`${k}.undo`, 'not pressable: ' + await covered(s, '#undoBtn')); return }
    await tapCentre(s, '#undoBtn'); await wait(s, 1000)
    FACT(`${k}.afterUndo`, { squadron: await barSq(s), page: await pageOn(s), toast: await toast(s), question: await question(s), said: await sayNow(s), windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 100)), undo: await undoBtns(s) })
    FACT(`${k}.afterUndo.squadronList`, await page.evaluate(async () => { const b = document.querySelector('#sqnMenuBtn'); return b ? b.innerText.replace(/\s+/g, ' ').trim() : null }))
    await dpic(s, `${P}-2-after-undo`, ['.topbar #sqnMenuBtn', '#toastEl'], ['.topbar', '#toastEl'])
    /* the squadron list itself, opened as a person opens it */
    if (s.desk && (await covered(s, '#sqnMenuBtn')) === 'free') { await tapCentre(s, '#sqnMenuBtn'); await wait(s, 400); FACT(`${k}.afterUndo.listRows`, await page.evaluate(() => [...document.querySelectorAll('#sqnMenu .sqm-row')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()))); await tpic(s, `${P}-3-list`); await page.keyboard.press('Escape') }
    await go(s, 'admin'); await wait(s, 700)
    const t = vis(s, '#page-admin button.adm-cat').filter({ hasText: /^Squadrons/ }); if (await t.count()) await hit(s, t.first(), 700)
    FACT(`${k}.afterUndo.adminSquadrons`, (await page.locator('#sqList').first().innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 200))
    FACT(`${k}.afterUndo.bar`, await barSq(s))
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)) } finally { await s.ctx.close().catch(() => {}) }
}
async function d() {
  const k = `U.${T}.d`, P = `p4-undod-${T}`
  const s = await mk(SZ); const { page } = s
  try {
    await signIn(s, 'ad', 'a')
    /* a greyed Undo as today makes one: a step on 142, then Undo pressed - nothing left to undo, Redo offered */
    FACT(`${k}.step142`, await inputStep(s, 'N175U d142'))
    await onEditSched(s)
    FACT(`${k}.pairBefore`, await readUndo(s, 'after the step'))
    if ((await covered(s, '#undoBtn')) === 'free') { await tapCentre(s, '#undoBtn'); await wait(s, 800); FACT(`${k}.undonePress`, { toast: await toast(s) }) }
    await onEditSched(s)
    for (const pg of ['editsched', 'inputs', 'viewsched', 'leavewar']) { await go(s, pg).catch(() => {}); await wait(s, 700); FACT(`${k}.pair.${pg}`, await readUndo(s, pg)) }
    await onEditSched(s)
    const u = (await undoBtns(s)).find(x => x.id === 'undoBtn')
    FACT(`${k}.undoAsDrawn`, u || 'no Undo drawn')
    if (!u) { await tpic(s, `${P}-no-undo`); return }
    await dpic(s, `${P}-1-undo-drawn`, ['#undoBtn'], ['.topbar'])
    const b = await boxOf(s, '#undoBtn')
    if (s.desk) { await page.mouse.move(b.x + b.w / 2, b.y + b.h / 2); await wait(s, 1500); FACT(`${k}.hover`, { said: await sayNow(s), note: 'a desktop hover shows the browser tooltip (the title) outside the page; it cannot be pictured' }) }
    else {
      await page.touchscreen.tap(b.x + b.w / 2, b.y + b.h / 2); await wait(s, 900)
      FACT(`${k}.tap`, { toast: await toast(s), said: await sayNow(s), undo: await undoBtns(s), squadron: await barSq(s) })
      await dpic(s, `${P}-2-after-tap`, ['#undoBtn'], ['.topbar'])
      /* a long press: a touch held for 1.2 s on the button (CDP touch events, WebKit-free Chromium phone) */
      const cdp = await s.ctx.newCDPSession(page).catch(() => null)
      if (cdp) {
        const x = b.x + b.w / 2, y = b.y + b.h / 2
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
        await wait(s, 1300)
        FACT(`${k}.longPressHeld`, { toast: await toast(s), said: await sayNow(s), menus: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 80)) })
        await dpic(s, `${P}-3-long-press-held`, ['#undoBtn'], ['.topbar'])
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await wait(s, 700)
        FACT(`${k}.longPressReleased`, { toast: await toast(s), said: await sayNow(s), undo: await undoBtns(s) })
      } else FACT(`${k}.longPress`, 'no long press possible in this browser')
    }
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('p4-undo v1', SZ)
  if (want('a')) await a()
  if (want('b')) await b()
  if (want('c')) await c()
  if (want('d')) await d()
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
