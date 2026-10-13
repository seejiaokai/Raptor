/* THE DESIGN LOOK — the passing notes ([NOTES-SHORTER], owner D806): the two he pictured, as built and in the shorter
   words proposed, drawn by the app's OWN note (the developer's bridge calls the same `toast` the app calls — the box,
   its width, its wrapping and its place are the built ones; only the WORDS of the "after" pictures are the proposal — the wordings of owner D825, every key word kept: the first
   drafts, cut further, were sent back as "too summarised").
   node scripts/handpass/dl-notes.mjs [phone|desk] */
import * as L from './dl-lib.mjs'
const size = process.argv[2] || 'phone'
const w = await L.world(size)
const p = w.page
await L.go(w, 'editsched')
await L.sleep(400)
const PAIRS = [
  ['publish', 'Monday published — APPROVED · Monday 13 Jul: the common programme has no usable times, so nobody on it earns OIL', 'Monday published — approved · Common Programme has no usable times: nobody on it earns OIL'],
  ['unpublish', 'Monday unpublished — it is a draft again; publishing reissues the Original · its OIL credits leave the Leave War until it is published again', 'Monday unpublished — a draft again; publishing reissues the Original · its OIL credits leave the Leave War until then'],
  ['withdraw', 'Monday: AL2 withdrawn — its changes are back on the working copy as pending; AL1 is the issued schedule; publishing again reissues AL2', 'Monday: AL2 withdrawn — its changes are pending on the working copy again; AL1 is the issued schedule; publishing reissues AL2'],
]
for (const [name, before, after] of PAIRS) {
  for (const [k, text] of [['before', before], ['after', after]]) {
    await p.evaluate(t => window.toast(t), text)
    await L.sleep(450)
    const r = await p.locator('#toastEl').boundingBox()
    const lines = await p.evaluate(() => { const t = document.getElementById('toastEl'); return Math.round(t.getBoundingClientRect().height / parseFloat(getComputedStyle(t).lineHeight || '16')) })
    console.log(name, k, `${Math.round(r.width)}×${Math.round(r.height)}`, 'about', lines, 'lines', text.split(/\s+/).length, 'words')
    await L.pic(w, `note-${size}-${name}-${k}`, w.phone ? { clip: { x: 0, y: 844 - 300, width: 390, height: 300 } } : { clip: { x: 320, y: 900 - 190, width: 800, height: 190 } })
  }
}
/* THE SECOND HALF OF THE PROPOSAL, a phone only — DRAWN IN: the note's box is as wide as the screen less a margin. As
   built it is centred by "left: 50%", which leaves it only HALF the screen to be wide in (195 of 390) — that, as much
   as the words, is why his two notes ran five lines deep. The same words in the wider box, then the shorter words. */
if (w.phone) {
  for (const [name, before, after] of PAIRS.slice(0, 2)) {
    for (const [k, text] of [['before-wide', before], ['after-wide', after]]) {
      await p.evaluate(t => window.toast(t), text)
      await p.evaluate(() => { const t = document.getElementById('toastEl'); t.getAnimations().forEach(a => a.cancel()); t.style.left = '12px'; t.style.right = '12px'; t.style.transform = 'none'; t.style.textAlign = 'center' })
      await L.sleep(300)
      const r = await p.locator('#toastEl').boundingBox()
      if (r.width < 300) throw new Error('the wide box was not drawn')
      console.log(name, k, `${Math.round(r.width)}×${Math.round(r.height)}`)
      await L.pic(w, `note-${size}-${name}-${k}`, { clip: { x: 0, y: 844 - 300, width: 390, height: 300 } })
      await p.evaluate(() => { const t = document.getElementById('toastEl'); t.style.left = '50%'; t.style.right = ''; t.style.transform = 'translateX(-50%)'; t.style.textAlign = '' })
    }
  }
}
await L.close(w)
