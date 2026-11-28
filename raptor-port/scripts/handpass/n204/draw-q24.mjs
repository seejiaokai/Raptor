// draw-q24 - question 24 (chat 204, 27 Nov 26): the view switch's two cases he has not seen. A desktop, 1536x864, at 2x.
// Every state by real presses on the built app (q2425-lib.mjs); the world: 150 made by Saber, Hunter given Plan of 149.
//   a-back   Saber -> the badge (the member view) -> Tracker -> the syllabus pencil -> Edit chart layout -> "+ Test", a name,
//            OK -> the pencil -> Done editing chart (an unsaved chart edit) -> the badge: the Tracker's question "...Save
//            them before switching back to the admin view?". Whole screen + crop (the question and the badge).
//   a-to     the same edit made in the admin view -> the badge: "...before switching to the member view?" (approved 24 Nov).
//            Crop + whole.
//   b-saber  Saber on 142 -> Tracker -> Edit chart layout, nothing moved -> picture (before) -> the badge -> picture
//            (after: the member view, the editor still open).
//   b-hunter Hunter (ad2) -> 149 picked -> Tracker -> Edit chart layout, nothing moved -> picture (before) -> the badge ->
//            picture (after: the member view, the editor closed, the Tracker on 142).
//   b-prop   Saber on 142 -> Tracker -> Edit chart layout -> Done editing chart -> the badge: the member view, the editor
//            closed - the proposed look, drawn as the app draws a closed editor.
//   node raptor-port/scripts/handpass/n204/draw-q24.mjs        (ONLY=a-back,a-to,b-saber,b-hunter,b-prop)
import { run, closeAll, FACT, signIn, wait, vis, hit, boxOf, barSq, badge, curPage, go, pick, world, tring, untring, sshot, words } from './q2425-lib.mjs'

const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = k => !ONLY.length || ONLY.includes(k)
const WORLD = await world()
const opts = { storageState: WORLD }

async function goTracker(s) {
  await go(s, 'tracker')
  await s.page.waitForSelector('#page-tracker #board', { state: 'visible', timeout: 30000 })
  await wait(s, 1500)
}
const editorOpen = s => s.page.evaluate(() => { const e = document.querySelector('#arrTools'); return !!e && e.classList.contains('on') && e.getBoundingClientRect().width > 0 })
const trkState = async s => ({ bar: await barSq(s), badge: await badge(s), page: await curPage(s), editor: await editorOpen(s),
  syl: await s.page.evaluate(() => document.querySelector('#sylSel')?.selectedOptions?.[0]?.textContent ?? null),
  saveBtn: (await words(s, '#page-tracker button')).filter(w => /Save changes|Discard/.test(w)) })
async function editorOn(s) {
  await hit(s, '#sylMenuBtn', 400)
  await hit(s, '#arrangeBtn', 900)
  if (!(await editorOpen(s))) throw new Error('Edit chart layout did not open')
}
async function editorOff(s) {
  await hit(s, '#sylMenuBtn', 400)
  const w = await s.page.locator('#arrangeBtn').innerText()
  if (!/Done editing/.test(w)) throw new Error('the pencil menu does not offer Done: ' + w)
  await hit(s, '#arrangeBtn', 900)
}
/* an unsaved chart edit: a new test event (it does not save at once) */
async function newTestEvent(s, name) {
  await editorOn(s)
  await hit(s, vis(s, '#arrTools button').filter({ hasText: /^\+ Test$/ }).first(), 500)
  await s.page.waitForSelector('#dlgInput', { state: 'visible', timeout: 8000 })
  FACT('asked', await s.page.locator('#dlgMsg').innerText())
  await s.page.fill('#dlgInput', name)
  await hit(s, '#dlgOk', 900)
  await editorOff(s)
  FACT('afterEdit', await trkState(s))
}
const question = s => s.page.evaluate(() => { const m = document.querySelector('#dlgModal'); return m && m.getBoundingClientRect().width > 0 ? { msg: document.querySelector('#dlgMsg')?.innerText, buttons: [...m.querySelectorAll('button')].map(b => b.textContent.trim()) } : null })

if (want('a-back')) await run('q24a-back', async s => {
  await signIn(s, 'ad', 'a')
  await hit(s, '#roleBadge', 900)
  FACT('a-back.memberView', { badge: await badge(s), page: await curPage(s) })
  await goTracker(s)
  await newTestEvent(s, 'TEST 9')
  await hit(s, '#roleBadge', 900)
  const q = await question(s); FACT('a-back.question', q)
  if (!q || !/switching back to the admin view\?/.test(q.msg)) throw new Error('the back question did not come: ' + JSON.stringify(q))
  FACT('a-back.state', await trkState(s))
  const m = await boxOf(s, '#dlgModal'), b = await boxOf(s, '#roleBadge')
  const r = await tring(s, m, 'the question')
  await sshot(s, 'q24a-back', [r, b])
  await untring(s)
  /* only the question and the badge: a second, tighter crop of the question alone */
  await sshot(s, 'q24a-back-question', [m], 10, false)
}, opts)

if (want('a-to')) await run('q24a-to', async s => {
  await signIn(s, 'ad', 'a')
  await goTracker(s)
  await newTestEvent(s, 'TEST 9')
  await hit(s, '#roleBadge', 900)
  const q = await question(s); FACT('a-to.question', q)
  if (!q || !/switching to the member view\?/.test(q.msg)) throw new Error('the to question did not come: ' + JSON.stringify(q))
  FACT('a-to.state', await trkState(s))
  const m = await boxOf(s, '#dlgModal'), b = await boxOf(s, '#roleBadge')
  await sshot(s, 'q24a-to', [m, b])
  await sshot(s, 'q24a-to-question', [m], 10, false)
}, opts)

const topRects = async s => [await boxOf(s, '#roleBadge'), await boxOf(s, '#sqnMenuBtn'), await boxOf(s, '#sylMenuBtn'), await boxOf(s, '#arrTools.on'), await boxOf(s, '#page-tracker .hdr, #page-tracker header')]

if (want('b-saber')) await run('q24b-saber', async s => {
  await signIn(s, 'ad', 'a')
  await goTracker(s)
  await editorOn(s)
  FACT('b-saber.before', await trkState(s))
  await sshot(s, 'q24b-saber-before', await topRects(s))
  await hit(s, '#roleBadge', 1500)
  FACT('b-saber.question', await question(s))
  FACT('b-saber.after', await trkState(s))
  const ar = await boxOf(s, '#arrTools.on')
  let rs = await topRects(s)
  if (ar) rs = [...rs, await tring(s, ar, 'the editor still open')]
  await sshot(s, 'q24b-saber-after', rs)
}, opts)

if (want('b-hunter')) await run('q24b-hunter', async s => {
  await signIn(s, 'ad2', 'a2')
  await pick(s, 149)
  await goTracker(s)
  await editorOn(s)
  FACT('b-hunter.before', await trkState(s))
  await sshot(s, 'q24b-hunter-before', await topRects(s))
  await hit(s, '#roleBadge', 2500)
  FACT('b-hunter.question', await question(s))
  FACT('b-hunter.after', await trkState(s))
  await sshot(s, 'q24b-hunter-after', await topRects(s))
}, opts)

if (want('b-prop')) await run('q24b-prop', async s => {
  await signIn(s, 'ad', 'a')
  await goTracker(s)
  await editorOn(s)
  await editorOff(s)
  FACT('b-prop.doneEditing', await trkState(s))
  await hit(s, '#roleBadge', 1500)
  FACT('b-prop.question', await question(s))
  FACT('b-prop.after', await trkState(s))
  await sshot(s, 'q24b-saber-proposed', await topRects(s))
}, opts)

await closeAll()
