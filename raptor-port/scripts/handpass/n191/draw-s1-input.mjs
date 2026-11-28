// draw-s1-input - section 1, ledger row 1.20: "+ Input" on another squadron (his D2628 C2, D2655 D12; the browser's own
// list kept, D2646). Hunter (142's admin, Plan of 149), 149 picked, Inputs → List → "+ Input". Owed: (a) the CLOSED,
// EMPTY Person box and what its empty line says; (b) what "Add" says with nobody picked.
// READ FROM THE APP (chat 191): (a) the app's own word for an empty choice in a box is "Pick…" (Admin → Users' "Add a
// person": PILOT, WSO OR PERSONNEL and CAT both open on "Pick…"), so the empty line reads "Pick…" - a DRAFT, the app's own
// word, owed a fresh Fable review (D2441). (b) the app already has a refusal for an input with nobody in it: "Pick at least
// one person" (ui/inputedit.tsx commitInput, a 'warn' note) - today reached only with "Several people" and none picked.
// A single Person box can be empty only after this change, so the built window says the same: drawn as the app's own note
// raised by its own toast(…, 'warn') at the app's own place (not moved).
// The box: the page's own select, every man not of 149 taken out (Hunter among them), an empty first choice "Pick…" added
// and chosen. Its list, opened, is the browser's / iPhone's own (D2646) - not pictured here; his iPhone picture of 26 Nov
// stands. Teal ring: the box (a), the note (b).
//  input-empty-d / -p     (a) the window as it opens, the Person box closed and empty
//  input-nobody-d / -p    (b) a day and a type chosen, Add pressed with nobody picked
//   node raptor-port/scripts/handpass/n191/draw-s1-input.mjs   (ONLY=input-empty-d,…)
import { mk, closeAll, FACT, wait, hit, vis, usersTab, reachPick, barSq, world, want, as, boxOf, words, tring, sshot, TMP1, raise, noteFacts } from './draw-s1-lib.mjs'
import { newInputWindow, pickDay } from '../n175/p6-lib.mjs'
import { S1 } from './words-s1.mjs'
const PERSON = '#inpEditPerson'
async function run(key, sz, fn) {
  const s = await mk(sz, { storageState: await world() })
  try { await fn(s) } catch (e) { FACT(`${key}.error`, String(e).split('\n')[0].slice(0, 300)); process.exitCode = 1; await s.page.screenshot({ path: `${TMP1}/${key}-error.png` }).catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
}
let own149 = []
await run('input.read', 'd', async s => {
  await as(s, 'kestrel'); await usersTab(s); await wait(s, 400)
  own149 = await s.page.evaluate(() => [...document.querySelectorAll('[data-testid="acc-groups"] .acc-row[data-person]')].filter(e => !e.querySelector('.acc-sqn')).map(e => e.querySelector('.acc-name').childNodes[0].textContent.trim()))
})
FACT('input.own149', own149)
async function emptyBox(s, k) {
  await as(s, 'hunter'); await reachPick(s, 149, s.desk ? 'bar' : 'menu'); await wait(s, 600)
  await newInputWindow(s); await wait(s, 500)
  const today = await s.page.evaluate(sel => { const e = document.querySelector(sel); return { picked: e.options[e.selectedIndex]?.textContent.trim(), offered: [...e.options].map(o => o.textContent.trim()) } }, PERSON)
  FACT(`${k}.today`, { squadron: await barSq(s), ...today })
  const r = await s.page.evaluate(([sel, own, empty]) => {
    const e = document.querySelector(sel)
    for (const o of [...e.options]) if (!own.includes(o.textContent.trim())) o.remove()
    const blank = document.createElement('option'); blank.value = ''; blank.textContent = empty; e.prepend(blank); e.selectedIndex = 0
    return { offered: [...e.options].map(o => o.textContent.trim()), shows: e.options[e.selectedIndex].textContent }
  }, [PERSON, own149, S1.personEmpty])
  FACT(`${k}.drawn`, r)
  return r
}
for (const sz of ['d', 'p']) if (want(`input-empty-${sz}`)) await run(`input-empty-${sz}`, sz, async s => {
  const k = `s1.inputEmpty.${sz}`
  await emptyBox(s, k)
  const pb = await boxOf(s, PERSON), win = await boxOf(s, '.inpedwin')
  const ring = (await tring(s, pb, 'the empty Person box')).ring
  await sshot(s, `input-empty-${sz}`, [ring, { x: win.x, y: win.y, w: win.w, h: Math.min(win.h, pb.y + pb.h - win.y + 60) }], 10)
})
for (const sz of ['d', 'p']) if (want(`input-nobody-${sz}`)) await run(`input-nobody-${sz}`, sz, async s => {
  const k = `s1.inputNobody.${sz}`
  await emptyBox(s, k)
  await s.page.selectOption('#inpEditType', 'OL')
  await pickDay(s, 'Wed 9 Dec 2026'); await wait(s, 300)
  /* Add pressed: the built window refuses as commitInput does for "several, none picked" - its own words, its own note */
  const text = S1.nobodyPicked
  await s.page.evaluate(t => window.toast(t, 'warn'), text); await wait(s, 450)
  await s.page.evaluate(() => { const t = document.querySelector('#toastEl'); t.getAnimations?.().forEach(a => a.cancel()); t.style.opacity = '1'; const o = new MutationObserver(() => { if (t.style.opacity !== '1') t.style.opacity = '1' }); o.observe(t, { attributes: true, attributeFilter: ['style'] }) })
  await wait(s, 200)
  const nb = await s.page.evaluate(() => { const t = document.querySelector('#toastEl'), b = t.getBoundingClientRect(); return { words: t.textContent.replace(/\s+/g, ' ').trim(), face: t.dataset.face || null, at: t.dataset.at || null, box: { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) } } })
  FACT(`${k}.note`, nb)
  FACT(`${k}.state`, { person: await s.page.evaluate(sel => document.querySelector(sel).value || '(empty)', PERSON), window: !!(await boxOf(s, '.inpedwin')) })
  const pb = await boxOf(s, PERSON), win = await boxOf(s, '.inpedwin'), add = await boxOf(s, '#inpEditSave')
  const ring = (await tring(s, nb.box, 'the note')).ring
  await sshot(s, `input-nobody-${sz}`, s.desk ? [ring, pb, add, { x: win.x, y: win.y, w: win.w, h: 60 }] : [ring, pb, { x: 0, y: 0, w: s.W, h: 40 }], 10)
})
await closeAll()
void hit; void vis; void words; void raise; void noteFacts
