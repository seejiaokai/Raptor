// draw-r5b-e1 - the owner's note on D1 (26 Nov 26): "the cancel button is different in size and doesnt seemed to be aligned".
// Redraws, in place, the e1 pictures that show the form's foot, with the foot laid exactly as the app's own row-foot pair on
// an opened Admin → Users row (Save · Cancel, read off Ranger's real opened row - draw-r5b-lib's rowFootRef / footLikeRow):
//  e1b (d, p)  as round 5 drew it (draw-r5b-form: Saber on 142, the form open, "Nova" typed, "+ Add a person" in its "on" look)
//  e1d (d, p)  as round 1 drew it (draw-e1: the form open, "Nova" typed, 149 pressed - the refusal note)
// Nothing else changes. The typed callsign "Nova" is the case's data.
//   node raptor-port/scripts/handpass/n176/draw-r5b-e1.mjs   (ONLY=e1b-d,e1b-p,e1d-d,e1d-p)
import { run, as, W, FACT, want, wait, hit, usersTab, shot, box, words, closeAll, addButton, openFormInPlace, typeInto, pickerOpenedAndClosed, menuListOpenedAndClosed, raise, under, noteFacts, barSq, vis, linesOf, rowFootRef, footLikeRow } from './draw-r5b-lib.mjs'
const TYPED = 'Nova'
const headInView = s => s.page.evaluate(desk => { if (desk) { scrollTo(0, 0); return } const h = document.querySelector('.od-head').getBoundingClientRect(), bar = document.querySelector('.topbar').getBoundingClientRect(); scrollBy(0, h.top - bar.bottom - 10) }, s.desk)
async function start(s, k) {
  await as(s, 'saber'); await usersTab(s); await wait(s, 400)
  const ref = await rowFootRef(s, hit); FACT(`${k}.rowFootRef`, { gapBetween: ref.gapBetween, gapAbove: ref.gapAbove, save: ref.boxes.save, cancel: ref.boxes.cancel, type: `${ref.save.fontSize} ${ref.save.fontWeight} / ${ref.cancel.fontSize} ${ref.cancel.fontWeight}` })
  await s.page.evaluate(() => scrollTo(0, 0)); await wait(s, 200)
  return ref
}
try {
  for (const sz of ['d', 'p']) if (want('e1b-' + sz)) await run(`e1b.${sz}`, sz, async s => {
    const k = `e1b.${sz}`, ref = await start(s, k)
    await addButton(s, W); await openFormInPlace(s, W)
    await s.page.evaluate(() => document.querySelector('#n176add').classList.add('on'))
    FACT(`${k}.typed`, await typeInto(s, '#accAddCs', TYPED))
    await s.page.evaluate(() => document.activeElement?.blur?.())
    FACT(`${k}.foot`, await footLikeRow(s, ref))
    await headInView(s); await wait(s, 300)
    FACT(`${k}.footOnScreen`, await s.page.evaluate(() => ['#n176save', '#n176cancel'].map(q => { const r = document.querySelector(q).getBoundingClientRect(); return `${document.querySelector(q).textContent}: x ${Math.round(r.left)}, y ${Math.round(r.top)}, w ${Math.round(r.width)}, h ${Math.round(r.height)}` })))
    await shot(s, `e1b-${sz}-form`, [await box(s, '.od-head'), await box(s, '#accAddBlock')])
  })
  for (const sz of ['d', 'p']) if (want('e1d-' + sz)) await run(`e1d.${sz}`, sz, async s => {
    const k = `e1d.${sz}`, text = W.addPersonNote('149'), ref = await start(s, k)
    await addButton(s, W); await openFormInPlace(s, W)
    FACT(`${k}.typed`, await typeInto(s, '#accAddCs', TYPED))
    FACT(`${k}.foot`, await footLikeRow(s, ref))
    if (s.desk) await pickerOpenedAndClosed(s, k); else await menuListOpenedAndClosed(s, k)
    await headInView(s)
    await raise(s, text)
    if (s.desk) await under(s, k, '#sqnMenuBtn')
    const m = await noteFacts(s, k, text, { picker: '#sqnMenuBtn', form: '#accAddBlock', typedBox: '#accAddCs', save: '#n176save', cancel: '#n176cancel' })
    FACT(`${k}.state`, { squadron: await barSq(s), typed: await vis(s, '#accAddCs').first().inputValue(), noteLines: await linesOf(s, '#toastEl') })
    FACT(`${k}.footOnScreen`, await s.page.evaluate(() => ['#n176save', '#n176cancel'].map(q => { const r = document.querySelector(q).getBoundingClientRect(); return `${document.querySelector(q).textContent}: x ${Math.round(r.left)}, y ${Math.round(r.top)}, w ${Math.round(r.width)}, h ${Math.round(r.height)}` })))
    await shot(s, `e1d-${sz}-note`, s.desk ? [m.box, m.boxes.picker, m.boxes.typedBox] : [m.box, m.boxes.form && { ...m.boxes.form, y: Math.max(0, m.boxes.form.y), h: 40 }])
  })
} finally { await closeAll() }
