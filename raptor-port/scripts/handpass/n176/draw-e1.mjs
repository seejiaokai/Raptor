// draw-e1 - "+ Add a person" at the top (his D2599, D2628 C11, D2598). Admin → Users on 142 as Saber.
//  e1t-d  today: the "Add a person" form at the page's foot (for comparison)
//  e1a    the button beside Filter (d), full width under the search (p)
//  e1b    the form opened in place under the People row, "Add person" · "Cancel" at its foot, a callsign typed (d, p)
//  e1c    after Cancel: the form folded shut, nothing kept (d)
//  e1d    the form typed in, 149 pressed - the note W.addPersonNote('149') under the control pressed (d), at the foot (p:
//         the pick made in ☰, the menu drawn closed after it)
// The typed callsign "Nova" is the case's data (no 142 man holds it), not a word of the drawing.
//   node raptor-port/scripts/handpass/n176/draw-e1.mjs        (ONLY=e1t,e1a-d,e1a-p,e1b-d,e1b-p,e1c,e1d-d,e1d-p)
import { run, as, W, FACT, want, wait, vis, hit, usersTab, shot, box, words, addButton, openFormInPlace, typeInto, pickerOpenedAndClosed, menuListOpenedAndClosed, raise, under, noteFacts, barSq, closeAll, linesOf } from './draw-lib.mjs'
const TYPED = 'Nova'
async function start(s) { await as(s, 'saber'); await usersTab(s); await wait(s, 400) }
/* the People row brought up to just under the top bar (a desktop: the page's top, where it already is) */
async function headInView(s) {
  await s.page.evaluate(desk => {
    if (desk) { scrollTo(0, 0); return }
    const h = document.querySelector('.od-head').getBoundingClientRect(), bar = document.querySelector('.topbar').getBoundingClientRect()
    scrollBy(0, h.top - bar.bottom - 10)
  }, s.desk)
  await wait(s, 300)
}
const head = async s => ({ people: await words(s, '.od-head .adm-sub'), search: await box(s, '.od-find'), filter: await box(s, '#accFilter') })
try {
  if (want('e1t')) await run('e1t', 'd', async s => {
    await start(s)
    await s.page.evaluate(() => document.querySelector('#accAddBlock').scrollIntoView({ block: 'center' })); await wait(s, 300)
    FACT('e1t.today', { heading: await words(s, '#accAddBlock h4'), button: await words(s, '#accAdd'), scrolledBy: await s.page.evaluate(() => Math.round(scrollY || document.scrollingElement.scrollTop)), formTop: await box(s, '#accAddBlock') })
    await shot(s, 'e1t-d-today-foot', [await box(s, '#accAddBlock')])
  })
  for (const sz of ['d', 'p']) if (want('e1a-' + sz)) await run('e1a.' + sz, sz, async s => {
    await start(s)
    const b = await addButton(s, W); FACT(`e1a.${sz}.button`, b); FACT(`e1a.${sz}.head`, await head(s))
    await shot(s, `e1a-${sz}-button`, [await box(s, '.od-head'), b.box])
  })
  for (const sz of ['d', 'p']) if (want('e1b-' + sz)) await run('e1b.' + sz, sz, async s => {
    await start(s)
    await addButton(s, W); const f = await openFormInPlace(s, W)
    FACT(`e1b.${sz}.typed`, await typeInto(s, '#accAddCs', TYPED))
    await headInView(s)
    FACT(`e1b.${sz}.form`, { ...f, fields: await words(s, '#accAddBlock label'), note: await words(s, '#accAddNote'), formBox: await box(s, '#accAddBlock'), footInView: await s.page.evaluate(() => { const r = document.querySelector('#n176acts').getBoundingClientRect(); return r.bottom <= innerHeight }) })
    const fb = await box(s, '#accAddBlock'), hb = await box(s, '.od-head')
    await shot(s, `e1b-${sz}-form`, [hb, fb])
  })
  if (want('e1c')) await run('e1c', 'd', async s => {
    await start(s)
    await addButton(s, W); await openFormInPlace(s, W)
    await typeInto(s, '#accAddCs', TYPED)
    /* Cancel pressed: the form clears and folds shut (the drawing hides it and empties the box - the built Cancel's
       work); nothing is added */
    await s.page.evaluate(() => { const blk = document.querySelector('#accAddBlock'); blk.style.display = 'none' })
    await headInView(s)
    FACT('e1c.after', { formShown: !!(await box(s, '#accAddBlock')), button: await words(s, '#n176add'), people: await words(s, '.od-head .adm-sub'), nobodyAdded: !(await words(s, '#accList .acc-name')).includes(TYPED) })
    await shot(s, 'e1c-d-after-cancel', [await box(s, '.od-head'), await box(s, '#accList')].map(b => b && { ...b, h: Math.min(b.h, 160) }))
  })
  for (const sz of ['d', 'p']) if (want('e1d-' + sz)) await run('e1d.' + sz, sz, async s => {
    const k = `e1d.${sz}`, text = W.addPersonNote('149')
    await start(s)
    await addButton(s, W); await openFormInPlace(s, W)
    FACT(`${k}.typed`, await typeInto(s, '#accAddCs', TYPED))
    if (s.desk) await pickerOpenedAndClosed(s, k); else await menuListOpenedAndClosed(s, k)
    await headInView(s)
    await raise(s, text)
    if (s.desk) await under(s, k, '#sqnMenuBtn')
    const m = await noteFacts(s, k, text, { picker: '#sqnMenuBtn', form: '#accAddBlock', typedBox: '#accAddCs', save: '#n176save', cancel: '#n176cancel' })
    FACT(`${k}.state`, { squadron: await barSq(s), typed: await vis(s, '#accAddCs').first().inputValue(), noteLines: await linesOf(s, '#toastEl') })
    await shot(s, `e1d-${sz}-note`, s.desk ? [m.box, m.boxes.picker, m.boxes.typedBox] : [m.box, m.boxes.form && { ...m.boxes.form, y: Math.max(0, m.boxes.form.y), h: 40 }])
  })
} finally { await closeAll() }
