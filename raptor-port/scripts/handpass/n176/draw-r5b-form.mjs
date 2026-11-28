// draw-r5b-form - round 5's redraws of the "+ Add a person" form (brief 2026-11-25-msq-q3-redraw-brief.md, items 6, 8, 11).
// The form drawn as round 1's e1 / e6 draw it (the button cloned from Filter, the page's own form moved under the People
// row, "Add person" · "Cancel" at its foot) - and, from item 11, while the form is open "+ Add a person" wears the app's
// "on" look: the Filter chip's own pressed look (its `on` class - postout.css `.od-fbtn.on`).
//  e1b (d, p)   item 11 - Saber on 142, the form open, "Nova" typed (round 1's e1b), the button "on".
//  e6a-?-r      item 8, D8's recommended way - Kestrel on 149, "Jester" typed: the note as round 1, its button
//               W.someoneNewR5; "Add person" greyed (in the greyed plain button's look - draw-r5b-lib's greyLook: its
//               own disabled state still reads as a lit cyan) and W.answerFirst under it.
//  e6a2-?       after "Someone new" is pressed: the note and its button give way to W.newOneTold('Jester', '142');
//               "Add person" live.
//  e6b-d        item 6 - "Ace" typed: W.archivedMany('Ace') as round 1, then each archived Ace one line,
//               W.archivedLine(n, 'Ace', seat, CAT, date), with W.askAdmin(n) after it as e6a sets it (the quiet words);
//               then the one button W.someoneNewR5; "Add person" greyed and W.answerFirst under it, as item 8.
//  e6b2-d       after the press: W.newOneToldTwo('Ace', '142', '150'); "Add person" live.
//  e6d-d-taken-r item 8 - "Ranger" typed: W.taken('Ranger', '142') under the callsign box where the archived note stands,
//               in the passing note's own amber letters (its look otherwise the note's); no passing note at the foot.
// State: round 1's e6 state (Jester archived on 142; Ace archived on 142 and 150) - run draw-e6.mjs first.
//   node raptor-port/scripts/handpass/n176/draw-r5b-form.mjs   (ONLY=e1b-d,e1b-p,e6a-d,e6a-p,e6a2-d,e6a2-p,e6b,e6b2,e6d)
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { run, as, W, FACT, want, wait, usersTab, shot, box, words, closeAll, TMP, addButton, openFormInPlace, typeInto, linesOf, greyLook, hit, rowFootRef, footLikeRow } from './draw-r5b-lib.mjs'
const ST = resolve(TMP, 'state-e6.json'), SRC = resolve(TMP, 'e6-sources.json')
const details = r => { const parts = r.sub.split(' · ').map(x => x.trim()); const seat = parts.find(p => /^(Pilot|WSO|Personnel)$/.test(p)); const cat = (parts.find(p => /^CAT /.test(p)) || '').replace(/^CAT /, ''); const date = (r.line || '').replace(/^Archived /, '').replace(/ by .*$/, ''); return { seat, cat, date } }
const headInView = s => s.page.evaluate(desk => { if (desk) { scrollTo(0, 0); return } const h = document.querySelector('.od-head').getBoundingClientRect(), bar = document.querySelector('.topbar').getBoundingClientRect(); scrollBy(0, h.top - bar.bottom - 10) }, s.desk)
/* the form's foot laid as the app's own row-foot pair (the owner, 26 Nov 26 - draw-r5b-lib's rowFootRef / footLikeRow),
   measured on an opened row of the page in hand: Ranger's on 142's page, Osprey's on 149's */
let REF = null
async function form(s, who, cs) {
  await as(s, who); await usersTab(s); await wait(s, 400)
  REF = await rowFootRef(s, hit, who === 'kestrel' ? 'osp9' : 'bane'); await s.page.evaluate(() => scrollTo(0, 0)); await wait(s, 200)
  await addButton(s, W); await openFormInPlace(s, W)
  /* item 11: the button in the app's "on" look while its form is open */
  await s.page.evaluate(() => document.querySelector('#n176add').classList.add('on'))
  const typed = await typeInto(s, '#accAddCs', cs)
  await s.page.evaluate(() => document.activeElement?.blur?.())
  FACT('foot.laid', await footLikeRow(s, REF))
  await headInView(s); await wait(s, 300)
  return typed
}
/* the pair's two boxes on screen, for the report */
const pairNow = s => s.page.evaluate(() => { const r = q => { const e = document.querySelector(q), b = e.getBoundingClientRect(); return `${e.textContent}${e.disabled ? ' [greyed]' : ''}: x ${Math.round(b.left)}, y ${Math.round(b.top)}, w ${Math.round(b.width)}, h ${Math.round(b.height)}` }
  const a = document.querySelector('#n176acts').getBoundingClientRect(), p = document.querySelector('#n176acts').previousElementSibling.getBoundingClientRect(), u = document.querySelector('#r5bAnswer')
  return { pair: [r('#n176save'), r('#n176cancel')], noteGapAbove: Math.round(a.top - p.bottom), answerGapBelow: u ? Math.round(u.getBoundingClientRect().top - a.bottom) : null } })
const onLook = s => s.page.evaluate(() => { const b = document.querySelector('#n176add'), c = getComputedStyle(b); return { words: b.textContent, classes: b.className, color: c.color, background: c.backgroundColor, border: c.borderColor } })
/* "Add person" greyed (its own greyed state) and the words under it; or live again */
const addGreyed = async (s, why) => { FACT('greyLook', await greyLook(s, '#n176save')); return addUnder(s, why) }
const addUnder = (s, why) => s.page.evaluate(why => { const p = document.createElement('p'); p.className = 'adm-note'; p.id = 'r5bAnswer'; p.textContent = why; p.style.margin = '12px 0 0';   /* one even gap below the pair, as the note's above it */ document.querySelector('#n176acts').insertAdjacentElement('afterend', p) }, why)
/* the archived note's block under the callsign's row: the page's own note, plain button and quiet words (round 1's parts) */
const block = (s, { note, lines = [], button, ask, told }) => s.page.evaluate(({ note, lines, button, ask, told }) => {
  const csRow = document.querySelector('#accAddCs').closest('.adm-2col')
  const blk = document.createElement('div'); blk.id = 'n176arch'; blk.style.marginBottom = '12px'
  const para = (cls, t) => { const p = document.createElement('p'); p.className = cls; p.textContent = t; return p }
  if (told) blk.appendChild(para('adm-note acc-note', told))
  else {
    if (note) blk.appendChild(para('adm-note acc-note', note))
    for (const l of lines) { const p = para('adm-note acc-note', l.words + ' '); const a = document.createElement('span'); a.className = 'acc-sub'; a.textContent = l.ask; a.style.display = 'inline'; p.appendChild(a); p.style.marginTop = '4px'; blk.appendChild(p) }
    const acts = document.createElement('div'); acts.className = 'acc-acts'
    const b = document.createElement('button'); b.type = 'button'; b.className = 'abtn'; b.id = 'n176new'; b.textContent = button; acts.appendChild(b)
    if (ask) { const q = document.createElement('span'); q.className = 'acc-sub'; q.id = 'n176ask'; q.textContent = ask; q.style.alignSelf = 'center'; acts.appendChild(q) }
    blk.appendChild(acts)
  }
  csRow.insertAdjacentElement('afterend', blk)
  return blk.innerText.replace(/\s+/g, ' ').trim()
}, { note, lines, button, ask, told })
const footFacts = async s => ({ addPerson: await s.page.evaluate(() => { const a = document.querySelector('#n176save'); return a.textContent + (a.disabled ? ' [greyed]' : ' [live]') }), under: await words(s, '#r5bAnswer') })
try {
  /* ITEM 11 */
  for (const sz of ['d', 'p']) if (want('e1b-' + sz)) await run(`e1b.${sz}`, sz, async s => {
    FACT(`e1b.${sz}.typed`, await form(s, 'saber', 'Nova'))
    FACT(`e1b.${sz}.button`, await onLook(s))
    FACT('pair', await pairNow(s)); await shot(s,`e1b-${sz}-form`, [await box(s, '.od-head'), await box(s, '#accAddBlock')])
  })
  if (!existsSync(ST) || !existsSync(SRC)) throw new Error('round 1\'s e6 state is missing - run draw-e6.mjs first')
  const src = JSON.parse(readFileSync(SRC, 'utf8'))
  const jester = details(src['142'].find(r => r.cs === 'Jester'))
  /* ITEM 8 */
  for (const sz of ['d', 'p']) if (want('e6a-' + sz)) await run(`e6a-r.${sz}`, sz, async s => {
    FACT(`e6a-r.${sz}.typed`, await form(s, 'kestrel', 'Jester'))
    FACT(`e6a-r.${sz}.note`, await block(s, { note: W.archivedNote('142', 'Jester', jester.seat, jester.cat, jester.date), button: W.someoneNewR5, ask: W.askAdmin('142') }))
    await addGreyed(s, W.answerFirst); await wait(s, 200)
    FACT(`e6a-r.${sz}.foot`, { ...(await footFacts(s)), noteLines: await linesOf(s, '#n176arch .acc-note') })
    FACT('pair', await pairNow(s)); await shot(s,`e6a-${sz}-archived-r`, [await box(s, '.od-head'), await box(s, '#accAddBlock')])
  }, { state: ST })
  for (const sz of ['d', 'p']) if (want('e6a2-' + sz)) await run(`e6a2.${sz}`, sz, async s => {
    FACT(`e6a2.${sz}.typed`, await form(s, 'kestrel', 'Jester'))
    FACT(`e6a2.${sz}.note`, await block(s, { told: W.newOneTold('Jester', '142') }))
    FACT(`e6a2.${sz}.foot`, { ...(await footFacts(s)), toldLines: await linesOf(s, '#n176arch .acc-note') })
    FACT('pair', await pairNow(s)); await shot(s,`e6a2-${sz}-after`, [await box(s, '.od-head'), await box(s, '#accAddBlock')])
  }, { state: ST })
  /* ITEM 6 */
  const aces = [...src['142'].filter(r => r.cs === 'Ace').map(r => ['142', r]), ...src['150'].filter(r => r.cs === 'Ace').map(r => ['150', r])]
  if (want('e6b')) await run('e6b', 'd', async s => {
    FACT('e6b.typed', await form(s, 'kestrel', 'Ace'))
    const lines = aces.map(([n, r]) => { const d = details(r); return { words: W.archivedLine(n, 'Ace', d.seat, d.cat, d.date), ask: W.askAdmin(n) } })
    FACT('e6b.note', await block(s, { note: W.archivedMany('Ace'), lines, button: W.someoneNewR5 }))
    await addGreyed(s, W.answerFirst); await wait(s, 200)
    FACT('e6b.foot', { ...(await footFacts(s)), lineCount: await s.page.evaluate(() => [...document.querySelectorAll('#n176arch .acc-note')].map(p => Math.round(p.getBoundingClientRect().height))) })
    FACT('pair', await pairNow(s)); await shot(s,'e6b-d-archived-many', [await box(s, '.od-head'), await box(s, '#accAddBlock')])
  }, { state: ST })
  if (want('e6b2')) await run('e6b2', 'd', async s => {
    FACT('e6b2.typed', await form(s, 'kestrel', 'Ace'))
    FACT('e6b2.note', await block(s, { told: W.newOneToldTwo('Ace', '142', '150') }))
    FACT('e6b2.foot', await footFacts(s))
    FACT('pair', await pairNow(s)); await shot(s,'e6b2-d-after', [await box(s, '.od-head'), await box(s, '#accAddBlock')])
  }, { state: ST })
  /* ITEM 8 - the live callsign's refusal under the box */
  if (want('e6d')) await run('e6d-r', 'd', async s => {
    FACT('e6d-r.typed', await form(s, 'kestrel', 'Ranger'))
    /* the passing note's amber, read off today's note (raised by the form's real add), which is then put away */
    await s.page.evaluate(() => document.querySelector('#accAdd').click()); await wait(s, 500)
    const amber = await s.page.evaluate(() => { const t = document.querySelector('#toastEl'); const c = getComputedStyle(t); const r = { words: t.textContent.replace(/\s+/g, ' ').trim(), color: c.color }; t.style.display = 'none'; return r })
    FACT('e6d-r.todayNote', amber)
    await s.page.evaluate(([w, color]) => { const csRow = document.querySelector('#accAddCs').closest('.adm-2col'); const p = document.createElement('p'); p.className = 'adm-note acc-note'; p.id = 'r5bTaken'; p.textContent = w; p.style.color = color; p.style.marginBottom = '12px'; csRow.insertAdjacentElement('afterend', p) }, [W.taken('Ranger', '142'), amber.color])
    await headInView(s); await wait(s, 300)
    FACT('e6d-r.drawn', { words: await words(s, '#r5bTaken'), lines: await linesOf(s, '#r5bTaken'), foot: await footFacts(s), toastShown: await s.page.evaluate(() => getComputedStyle(document.querySelector('#toastEl')).display !== 'none') })
    FACT('pair', await pairNow(s)); await shot(s,'e6d-d-taken-r', [await box(s, '.od-head'), await box(s, '#accAddBlock')])
  }, { state: ST })
} finally { await closeAll() }
