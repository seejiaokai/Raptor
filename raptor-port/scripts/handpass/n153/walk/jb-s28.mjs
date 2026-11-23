// jb-s28 v1 - S27 and S28: every door on the Tracker that asks "Discard them and ...?" over an unsaved chart edit.
// For each door: Stay keeps the work; Discard drops it whatever the next step does (cancelled, a name refused, completed);
// the fresh edit after it saves alone; another squadron stays clean. DOORS=a,b picks doors; SZ=d|p.
import { signIn, newPage, closeAll, finish, picsFor, note, pic, pickSq, shut, step, check, press, facts, addEvent, hasEv, ask } from './jlib.mjs'
import { dress, fp, short, wait, onSeed, reload, vclick } from './jb-lib.mjs'
const SZ = process.env.SZ || 'd'
const ONLY = (process.env.DOORS || '').split(',').filter(Boolean)
const tag = `s28-${SZ}${ONLY.length ? '-' + ONLY.join('-') : ''}`
console.log('jb-s28 v1', SZ, ONLY.join(','))
picsFor(tag)
const to = async (s, u) => { await pickSq(s, u); await shut(s); await wait(s, 1000) }
const menu = (btn, item) => async s => { await vclick(s, btn); await wait(s, 200); await vclick(s, item); await wait(s, 400) }
const sel = (id, fn) => async s => {
  const { page } = s
  const v = await page.evaluate(([i, f]) => { const e = document.getElementById(i); const o = [...e.options].find(x => !x.selected && new RegExp(f).test(x.text.trim())); return o ? o.value : null }, [id, fn])
  if (!v) { note('no option', id, fn); return }
  await page.selectOption('#' + id, v); await wait(s, 500)
}
const DOORS = [
  ['addCourse', menu('#courseMenuBtn', '#addCourse'), 'name'],
  ['renCourse', menu('#courseMenuBtn', '#renCourse'), 'name'],
  ['addSyl', menu('#sylMenuBtn', '#addSyl'), 'name'],
  ['dupSyl', menu('#sylMenuBtn', '#dupSyl'), 'name'],
  ['renSyl', menu('#sylMenuBtn', '#renSyl'), 'name'],
  ['delSyl', menu('#sylMenuBtn', '#delSyl'), 'confirm'],
  ['delCourse', menu('#courseMenuBtn', '#delCourse'), 'confirm'],
  ['courseSel', sel('courseSel', '^JB'), 'none'],
  ['sylSel', sel('sylSel', '.'), 'none'],
  ['importFile', menu('#fileMenuBtn', '#importFileBtn'), 'file'],
]
const prompt = s => s.page.locator('#dlgInput').filter({ visible: true }).count()
/* these doors ask "You have unsaved flow edits on ... Discard them and <do it>?" with Cancel and OK: OK is the Discard */
const isDiscardAsk = a => /Discard them/i.test(a.msg || '') && a.btns.some(b => /dlgOk/.test(b))
const discardBtn = () => '#dlgOk'
const stayBtn = () => '#dlgCancel'
let seq = 0
async function fresh(s) {
  const n = `JB${++seq}Q`
  await onSeed(s)
  const ok = await addEvent(s, n)
  if (!ok) note('could not draw draft', n)
  return n
}
async function cancelFollow(s) {
  /* a refusal is a notice with OK alone, and may lead back to the name box: answered until no box is left */
  for (let i = 0; i < 4; i++) {
    const q = await ask(s)
    if (!q.msg && !(await prompt(s))) return
    note('follow-up:', JSON.stringify(q.msg), JSON.stringify(q.btns))
    await press(s, q.btns.some(b => /dlgCancel/.test(b)) ? '#dlgCancel' : '#dlgOk'); await wait(s, 400)
  }
}
try {
  const s = await newPage(SZ); const { page } = s
  page.on('filechooser', fc => { note('a file picker opened; left unanswered') })
  await signIn(s, 'ad', 'a')
  await dress(s, '142', ['ST-01', 'ACG-01'])
  await to(s, '149'); await dress(s, '149', ['ST-01'])
  await to(s, '142'); await onSeed(s)
  for (const [nm, door, kind] of DOORS) {
    if (ONLY.length && !ONLY.includes(nm)) continue
    await step(nm, async () => {
      // 1. Stay keeps it
      let n = await fresh(s)
      await door(s); let a = await ask(s); note(`${nm} asks: ${JSON.stringify(a.msg)} ${JSON.stringify(a.btns)}`); await pic(s, `${nm}-1-asked`)
      if (!isDiscardAsk(a)) {
        const p = await prompt(s); note(`${nm}: no discard question (prompt ${p})`)
        check(`${nm}: a door over a draft asks first`, false, { a: a.msg, prompt: p })
        await cancelFollow(s); await s.page.keyboard.press('Escape'); await wait(s, 200)
        if ((await fp(s)).dirty) { await vclick(s, '#saveChanges'); await wait(s, 500) }
        return
      }
      await press(s, stayBtn(a), `${nm}-stay`); await wait(s, 400)
      let f = await fp(s)
      check(`${nm} Stay: the draft is kept`, f.dirty && await hasEv(s, n), short(f)); await pic(s, `${nm}-2-stay`)
      // 2. Discard, then the next step cancelled
      await door(s); a = await ask(s)
      if (!isDiscardAsk(a)) { note(nm, 'second press did not ask'); await cancelFollow(s); return }
      await press(s, discardBtn(a), `${nm}-disc`); await wait(s, 500)
      const q2 = await ask(s); const hasPrompt = await prompt(s); note(`${nm} after Discard: ${JSON.stringify(q2.msg)} prompt ${hasPrompt}`); await pic(s, `${nm}-3-after-discard`)
      await cancelFollow(s)
      if (kind === 'file') await wait(s, 300)
      f = await fp(s)
      check(`${nm} Discard then cancel: the draft is gone, nothing dirty`, !f.dirty && !(await hasEv(s, n)), short(f)); await pic(s, `${nm}-4-cancelled`)
      // the next edit saves alone, and the dropped one does not come back with it
      const n2 = await fresh(s)
      f = await fp(s); check(`${nm}: the fresh edit is a draft`, f.dirty && await hasEv(s, n2), short(f))
      check(`${nm}: the dropped event has not come back in the fresh edit`, !(await hasEv(s, n)), n)
      await vclick(s, '#saveChanges'); await wait(s, 700)
      await onSeed(s); f = await fp(s); check(`${nm}: saved, only the fresh event`, !f.dirty && await hasEv(s, n2) && !(await hasEv(s, n)), short(f))
      facts[`${nm}:names`] = { dropped: n, saved: n2 }
      // 3. completion through a refused name, where the door takes a name
      if (kind === 'name' && nm !== 'renCourse' && nm !== 'renSyl') {
        const n3 = await fresh(s); await door(s); a = await ask(s)
        if (isDiscardAsk(a)) {
          await press(s, discardBtn(a), `${nm}-disc2`); await wait(s, 400)
          const has = await prompt(s)
          if (has) {
            const dup = nm === 'addCourse' ? 'JB142' : '2026'
            await page.locator('#dlgInput:visible').first().fill(dup); await vclick(s, '#dlgOk'); await wait(s, 500)
            const q3 = await ask(s); note(`${nm} a name already taken: ${JSON.stringify(q3.msg)}`); await pic(s, `${nm}-5-name-refused`)
            await cancelFollow(s); await wait(s, 300)
          }
          f = await fp(s); check(`${nm} Discard then refused name: draft still gone`, !f.dirty && !(await hasEv(s, n3)), short(f))
        }
      }
      if (nm === 'courseSel' || nm === 'addCourse') { await onSeed(s) }
    })
  }
  await step('other squadron and a reload', async () => {
    await onSeed(s); const g = await fp(s); note('142 end', short(g), (g.courses || []).join('/'))
    await to(s, '149'); const h = await onSeed(s); check('149 clean of every jb draft', (h.courses || []).includes('JB149') && !(h.courses || []).includes('JB142') && !h.dirty && h.done === 1, short(h)); await pic(s, 'z1-149')
    const names = Object.values(facts).flatMap(v => v && v.dropped ? [v.dropped, v.saved] : [])
    const on149 = []; for (const n of names) if (await hasEv(s, n)) on149.push(n)
    check('149 chart holds none of the 142 events', on149.length === 0 && names.length > 0, { names: names.length, on149 })
    await reload(s); await to(s, '142'); await onSeed(s)
    const dropped = Object.values(facts).filter(v => v && v.dropped).map(v => v.dropped); const back = []; for (const n of dropped) if (await hasEv(s, n)) back.push(n)
    check('after a reload no dropped event is back on 142', back.length === 0 && dropped.length > 0, { dropped: dropped.length, back }); await pic(s, 'z2-142-reload')
  })
  await s.ctx.close()
} finally { finish(tag); await closeAll() }
