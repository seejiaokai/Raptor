// p5-n5 - P5 case N5 (the build plan's §8.3): the Tracker and the member-view switch on his own squadron.
// Saber (master admin) on 142, the Tracker: Edit chart layout (☰ syllabus → Edit chart layout), an unsaved chart edit made,
// the editor closed again. The edit:
//   desktop - a ball MOVED: the mouse pressed on a ball, moved 90px right and 60px down, released (the Move tool, as drawn)
//   phone   - WebKit takes no finger drag from Playwright, so the phone's edit is chat 166's trk-b way, by presses: "+ Test",
//             named N175EV, OK. (Named in the FACT lines.)
// Then, each in a fresh browser:
//   member  - the name badge pressed (☰ role line on a phone): asked? the page, the edit still there, "Save changes" drawn
//             and live; then Save pressed IN the member view - the status words, which saved records changed
//   back    - the badge pressed, then pressed again (back to the admin view): asked each way? the edit still there, Save drawn
//   node raptor-port/scripts/handpass/n175/p5-n5.mjs <d|p>
// Pictures: p5-n5-<d|p>-1-member-view, p5-n5-<d|p>-2-back
import { mk, closeAll, FACT, signIn, go, wait, vis, hit, shot, scratch, reachView, barSq, pageOn, roleNow, toastNow } from './lib.mjs'
const SZ = process.argv[2] || 'd'; const SEC = 'p5'
const question = s => s.page.evaluate(() => {
  const m = document.querySelector('#dlgMsg'), d = document.querySelector('#dlgModal')
  if (!m || m.getBoundingClientRect().width < 1) return null
  return { words: m.textContent.replace(/\s+/g, ' ').trim(), buttons: [...d.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim()) }
})
const trk = s => s.page.evaluate(() => {
  const p = document.querySelector('#page-tracker'); if (!p) return null
  const btn = [...p.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0 && /Save changes/.test(b.textContent))
  const st = [...document.querySelectorAll('.savestat, #saveStatus, [id*="aveStat"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.replace(/\s+/g, ' ').trim())
  return { onPage: p.classList.contains('on'), saveButton: btn.length ? btn.map(b => b.textContent.trim() + (b.disabled ? ' [greyed]' : ' live')) : 'not drawn', status: st, n175ev: (p.innerText || '').includes('N175EV') }
})
/* the moved ball's place, read from the chart */
const ballAt = (s, id) => s.page.evaluate(id => { const g = document.querySelector(`#flowSvg .ball[data-id="${id}"]`); if (!g) return null; const r = g.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top) } }, id)
const snap = s => s.page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k) } return o })
const changed = (a, b) => Object.keys({ ...a, ...b }).filter(k => a[k] !== b[k] && !/seen|view|ui|pref|last|sess/i.test(k)).map(k => `${k} ${String(b[k] ?? '(removed)').replace(/\s+/g, ' ').slice(0, 120)}`)
async function makeEdit(s, kind) {
  const { page } = s
  await go(s, 'tracker'); await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await wait(s, 700)
  await hit(s, '#sylMenuBtn', 300); await hit(s, '#arrangeBtn', 600)
  let id = null
  if (kind === 'move') {
    id = await page.evaluate(() => { for (const g of document.querySelectorAll('#flowSvg .ball')) { const r = g.getBoundingClientRect(); if (r.width < 4) continue; const cx = r.left + r.width / 2, cy = r.top + r.height / 2; if (cx < 200 || cy < 250 || cx > innerWidth - 300 || cy > innerHeight - 200) continue; const at = document.elementFromPoint(cx, cy); if (at && g.contains(at)) return g.dataset.id } return null })
    const b = await page.locator(`#flowSvg .ball[data-id="${id}"]`).first().boundingBox()
    const before = await ballAt(s, id)
    const x = b.x + b.width / 2, y = b.y + b.height / 2
    await page.mouse.move(x, y); await page.mouse.down(); for (let i = 1; i <= 10; i++) await page.mouse.move(x + 9 * i, y + 6 * i); await page.mouse.up(); await wait(s, 500)
    FACT(`p5.n5.${SZ}.${kind}.edit`, { kind: 'a ball moved (mouse drag, Move tool)', ball: id, before, after: await ballAt(s, id) })
  } else {
    const add = page.locator('#arrTools button', { hasText: '+ Test' }).first()
    if (!(await add.isVisible())) await hit(s, page.locator('#page-tracker button', { hasText: 'Tools ▾' }).filter({ visible: true }).first(), 300)
    await hit(s, add, 400); await page.waitForSelector('#dlgInput:visible')
    await vis(s, '#dlgInput').first().fill('N175EV'); await hit(s, '#dlgOk', 500)
    FACT(`p5.n5.${SZ}.${kind}.edit`, { kind: s.desk ? 'a new test event N175EV made by presses (+ Test, a name, OK)' : 'STAND-IN for a ball moved: a new test event N175EV made by presses (+ Test, a name, OK) - no finger drag in WebKit under Playwright' })
  }
  await hit(s, '#sylMenuBtn', 300); await hit(s, '#arrangeBtn', 600)
  FACT(`p5.n5.${SZ}.${kind}.afterEdit`, { tracker: await trk(s), editorOpen: await page.evaluate(() => !!document.querySelector('#arrTools.on')) })
  return id
}
const state = async s => ({ squadron: await barSq(s), page: await pageOn(s), role: (await roleNow(s)).badge || (await roleNow(s)).menuLine, question: await question(s), tracker: await trk(s) })
try {
  console.log('p5-n5 v1', SZ)
  /* the desktop runs both edits (a ball moved, a new event); the phone the event only */
  for (const kind of (SZ === 'd' ? ['move', 'event'] : ['event'])) {
  const k = `p5.n5.${SZ}.${kind}`, P = `p5-n5-${kind}-${SZ}`
  /* member: the switch, then Save in the member view */
  let s = await mk(SZ)
  try {
    await signIn(s, 'ad', 'a')
    const id = await makeEdit(s, kind)
    const v = await reachView(s); FACT(`${k}.member.press`, { control: v.control, words: v.words, covered: v.covered, pressed: !!v.pressed })
    await wait(s, 600)
    FACT(`${k}.member.after`, { ...(await state(s)), ball: id ? await ballAt(s, id) : null })
    const sv = s.page.locator('#page-tracker button').filter({ hasText: /Save changes/ }).filter({ visible: true }).first()
    if (await sv.count()) await sv.evaluate(e => e.setAttribute('data-n175ring', '1'))
    await shot(s, `${P}-1-member-view`, ['[data-n175ring]', s.desk ? '#roleBadge' : '#burger'], null, 30)
    if (await sv.count() && !(await sv.isDisabled())) {
      const before = await snap(s)
      await hit(s, sv, 1200)
      FACT(`${k}.member.saveQuestion`, await question(s))
      FACT(`${k}.member.afterSave`, { tracker: await trk(s), toast: await toastNow(s), role: (await roleNow(s)).badge || (await roleNow(s)).menuLine })
      FACT(`${k}.member.storageChanged`, changed(before, await snap(s)))
      await scratch(s, SEC, `${P}-1b-after-save`)
    }
  } catch (e) { FACT(`${k}.member.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-member-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
  /* back: there and back again */
  s = await mk(SZ)
  try {
    await signIn(s, 'ad', 'a')
    const id = await makeEdit(s, kind)
    const v1 = await reachView(s); FACT(`${k}.back.toMember`, { pressed: !!v1.pressed, ...(await state(s)) })
    if ((await pageOn(s)) !== 'page-tracker') { await go(s, 'tracker'); await wait(s, 600) }
    const v2 = await reachView(s); FACT(`${k}.back.press2`, { control: v2.control, words: v2.words, covered: v2.covered, pressed: !!v2.pressed })
    await wait(s, 600)
    if ((await pageOn(s)) !== 'page-tracker') { FACT(`${k}.back.landedOn`, await pageOn(s)); await go(s, 'tracker'); await wait(s, 700) }
    FACT(`${k}.back.after`, { ...(await state(s)), ball: id ? await ballAt(s, id) : null })
    const sv = s.page.locator('#page-tracker button').filter({ hasText: /Save changes/ }).filter({ visible: true }).first()
    if (await sv.count()) await sv.evaluate(e => e.setAttribute('data-n175ring', '1'))
    await shot(s, `${P}-2-back`, ['[data-n175ring]', s.desk ? '#roleBadge' : '#burger'], null, 30)
  } catch (e) { FACT(`${k}.back.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-back-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
  }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
