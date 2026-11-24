// rb-lib v1 - walker B of the re-walk: "a held chart draft on 149 in the member view", built by presses, and honest reads of
// the app's question box (its size and what is really at each button's middle).
import { mk, signIn, grant, logout, go, pickSq, shut, addEvent, note, check, pic, state, press, trackerSaved, layoutDiff } from './rlib.mjs'
import { roleSwitch, wait } from '../walk/jb-lib.mjs'
export { roleSwitch, wait }

export const SAVE = '#dlgOk', DISCARD = '#dlgAlt', STAY = '#dlgCancel'

/* Hunter on 149 (Plan given by Saber through Admin, Users), or Saber himself */
export async function hunterOn149(sz, who = 'hunter') {
  const s = await mk(sz)
  await signIn(s, 'ad', 'a')
  if (who === 'hunter') {
    check('set-up: Saber gave Hunter Plan of 149', await grant(s, 'prowler', '149', 'plan'), 'prowler plan 149')
    await logout(s); await signIn(s, 'ad2', 'a2')
  }
  /* 142's Tracker opened once first: its first opening writes its seed records, which would read as a "write" later */
  await go(s, 'tracker'); await shut(s); await wait(s, 1800)
  await pickSq(s, '149'); await shut(s); await wait(s, 1100)
  return s
}
/* the unsaved chart edit, then the member view */
export async function heldDraft(s, name) {
  const made = await addEvent(s, name)
  check(`set-up: unsaved chart edit ${name} on the chart`, made, name)
  await roleSwitch(s, `${name}-to-member`); await wait(s, 500)
  return made
}

/* the question box as drawn: words, box, each button's box and what is really at its middle */
export const Q = s => s.page.evaluate(() => {
  const d = document.querySelector('#dlgModal'), m = document.querySelector('#dlgMsg')
  if (!d) return { up: false, msg: null, btns: [] }
  const box = e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round) }
  const seen = e => { const r = e.getBoundingClientRect(), c = getComputedStyle(e); return r.width > 4 && r.height > 4 && c.visibility !== 'hidden' && c.display !== 'none' && +c.opacity > 0.05 && r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1 }
  const btns = [...d.querySelectorAll('button')].map(b => {
    const r = b.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return { id: b.id, words: b.textContent.trim(), box: box(b), seen: seen(b), hit: !!t && (t === b || b.contains(t)), at: t ? `${t.tagName}#${t.id}` : null }
  })
  return { up: true, msg: m ? m.textContent.trim() : null, msgSeen: !!m && seen(m), msgBox: m ? box(m) : null, box: box(d), btns }
})
/* the question is really answerable: words seen, every button seen and first at its own middle */
export const answerable = q => !!q.up && !!q.msgSeen && q.btns.length > 0 && q.btns.every(b => b.seen && b.hit)
export const shortQ = q => q.up ? { msg: q.msg, msgSeen: q.msgSeen, box: q.box, btns: q.btns.map(b => `${b.words}:${b.seen ? 'seen' : 'NOT-SEEN'}/${b.hit ? 'top' : 'covered by ' + b.at}`) } : 'no question'

/* where he is, as drawn */
export const where = async s => {
  const v = await state(s)
  const signedOut = await s.page.locator('#luser').filter({ visible: true }).count()
  return { signedOut: !!signedOut, page: v.page, sq: (v.barMark || v.dMark || '').replace(/TALON.*/, '').trim().slice(0, 12), badge: v.badge, role: v.role, drawer: v.drawerOpen }
}
export const inMember = w => /admin/i.test(w.badge || w.role || '') // the chip offers the way back while in the member view

/* both squadrons' saved Tracker records */
export const savedBoth = async s => ({ a: await trackerSaved(s, '149'), b: await trackerSaved(s, '142') })
export const savedDiff = (x, y) => [...layoutDiff(x.a, y.a).map(k => '149:' + k), ...layoutDiff(x.b, y.b).map(k => '142:' + k)]

/* a press on the question's button, with the before and after pictures */
export async function answerQ(s, sel, name) {
  await pic(s, `${name}-before`)
  await press(s, sel, name)
  await wait(s, 900)
  await pic(s, `${name}-after`)
}
export { note, check, pic, state, press, pickSq, shut }
