// jb-s24d v1 - what the dead pick leaves: is a question open but not drawn? Then back to the admin view, and to the Tracker:
// does a stale question come up, and does the draft survive? SZ=d or p.
import { signIn, newPage, closeAll, finish, picsFor, note, pic, pickSq, shut, step, check, press, grant, go, state, addEvent, hasEv, ask, logout } from './jlib.mjs'
import { dress, fp, short, wait, onSeed, roleSwitch, holdWords } from './jb-lib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jb-s24d v1', SZ)
const tag = `s24d-${SZ}`
picsFor(tag)
const to = async (s, u) => { await pickSq(s, u); await shut(s); await wait(s, 1100) }
const dlg = s => s.page.evaluate(() => {
  const d = document.querySelector('#dlgModal'); const o = document.querySelector('#dlgOverlay')
  if (!d) return { none: true }
  const cs = getComputedStyle(d), b = d.getBoundingClientRect()
  const chain = []; for (let e = d; e && chain.length < 6; e = e.parentElement) { const c = getComputedStyle(e); chain.push(`${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${e.classList.contains('on') ? '.on' : ''}:${c.display}`) }
  return { msg: document.querySelector('#dlgMsg')?.textContent?.trim().slice(0, 90), w: Math.round(b.width), h: Math.round(b.height), disp: cs.display, overlay: o ? getComputedStyle(o).display + '/' + (o.className || '') : null, modalClass: d.className, chain: chain.join(' < ') }
})
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  await grant(s, 'prowler', '149', 'plan')
  await dress(s, '142', ['ST-01', 'ACG-01'])
  await to(s, '149'); await dress(s, '149', ['ST-01'])
  await logout(s); await signIn(s, 'ad2', 'a2')
  await to(s, '149'); await onSeed(s)
  check('draft', await addEvent(s, 'JB-S24D'), 'JB-S24D')
  note('dialog before the member view', JSON.stringify(await dlg(s)))
  await roleSwitch(s); await wait(s, 400)
  note('dialog in the member view', JSON.stringify(await dlg(s)))
  await pickSq(s, '142', 'pick'); await wait(s, 800); await shut(s)
  note('dialog after the pick', JSON.stringify(await dlg(s)))
  const tb = await page.evaluate(() => { const e = document.elementFromPoint(innerWidth / 2, innerHeight / 2); return e ? `${e.tagName}#${e.id}.${String(e.className).slice(0, 40)}` : null })
  note('what is under the middle of the screen', tb)
  await pic(s, '01-after-dead-pick')
  // is anything on the page blocked by an unseen window? press a day pill / a tab
  const st0 = await state(s); note('state', st0.barMark, st0.page, st0.badge)
  await go(s, 'help'); await wait(s, 500); const st1 = await state(s); note('Help tab pressed: page', st1.page); await go(s, 'viewsched'); await wait(s, 400)
  await roleSwitch(s, 'back'); await wait(s, 700)
  const st2 = await state(s); const a2 = await ask(s); note('back in admin view', st2.barMark, st2.page, st2.badge, 'ask', JSON.stringify(a2.msg)); await pic(s, '02-admin-view')
  note('dialog in admin view', JSON.stringify(await dlg(s)))
  if (a2.msg) { await pic(s, '03-stale-question') } else {
    await go(s, 'tracker'); await wait(s, 1200)
    const a3 = await ask(s); const f = await fp(s); note('Tracker', short(f), 'ask', JSON.stringify(a3.msg)); await pic(s, '03-tracker-after')
    check('draft kept on 149', f.sq === '149' && f.dirty && await hasEv(s, 'JB-S24D'), short(f))
    if (!a3.msg) { await pickSq(s, '142', 'pick2'); await wait(s, 600); const a4 = await ask(s); note('admin-view pick asks', JSON.stringify(a4.msg)); await pic(s, '04-admin-pick'); if (a4.msg) { await press(s, '#dlgCancel'); await wait(s, 300) } }
  }
  await s.ctx.close()
} finally { finish(tag); await closeAll() }
