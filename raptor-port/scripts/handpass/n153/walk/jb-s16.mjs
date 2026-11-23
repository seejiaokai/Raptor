// jb-s16 v1 - S16: the bell's tap that would enter another squadron, with an unsaved chart edit: Stay, Discard, Save.
// Hunter (Plan of 149) on 142's Tracker; a new person has asked for access to 149 through Request access.
import { signIn, newPage, closeAll, finish, picsFor, note, pic, pickSq, shut, step, check, press, facts, as, grant, go, state, addEvent, hasEv, ask, logout } from './jlib.mjs'
import { dress, fp, short, wait, onSeed } from './jb-lib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jb-s16 v1', SZ)
picsFor('s16-' + SZ)
const to = async (s, u) => { await pickSq(s, u); await shut(s); await wait(s, 1100) }
const waiting = s => s.page.evaluate(() => [...document.querySelectorAll('#admWaiting [data-req]')].filter(r => r.getBoundingClientRect().width > 0).map(r => r.textContent.replace(/\s+/g, ' ').trim().slice(0, 70)))
const bellPress = async (s, name) => { await press(s, '#notifyBell', name); await wait(s, 500) }
async function requester(s, mail, cs, ini) {
  const { page } = s
  await signIn(s, mail, 'v1', { pending: true })
  await page.waitForSelector('#accForm', { timeout: 10000 })
  await page.selectOption('#accSqn', { label: '149' })
  await page.fill('#accCs', cs); await page.fill('#accIni', ini); await page.selectOption('#accSeat', { label: 'Pilot' }); await wait(s, 200)
  const o = await page.evaluate(() => [...document.querySelectorAll('#accCat option')].map(o => o.value).filter(Boolean))
  if (o.length) await page.selectOption('#accCat', o[0])
  await page.click('#accSend'); await wait(s, 700)
  await logout(s)
}
async function build() {
  const s = await newPage(SZ)
  await signIn(s, 'ad', 'a')
  check('grant', await grant(s, 'prowler', '149', 'plan'), 'prowler plan 149')
  await dress(s, '142', ['ST-01', 'ACG-01'])
  await to(s, '149'); await dress(s, '149', ['ST-01'])
  await logout(s)
  await requester(s, 'jbviper@mail', 'Jbviper', 'JV')
  await signIn(s, 'ad2', 'a2')
  return s
}
async function tapAndRead(s, label) {
  await bellPress(s, `${label}-bell`)
  const a = await ask(s); const st = await state(s)
  note(`${label} after bell: page ${st.page} bar ${st.barMark} ask ${JSON.stringify(a.msg)} ${JSON.stringify(a.btns)}`)
  return a
}
try {
  await step('Stay then Discard', async () => {
    const s = await build(); const { page } = s
    await onSeed(s); check('draft on 142', await addEvent(s, 'JB-S16A'), 'JB-S16A')
    const before = await fp(s); note('before', short(before))
    let a = await tapAndRead(s, 'a1')
    check('bell asks before entering 149', /Save them before switching to 149/.test(a.msg || ''), a.msg)
    await pic(s, 'a1-asked')
    await press(s, '#dlgCancel', 'a2-stay'); await wait(s, 1800)
    let f = await fp(s); const st = await state(s)
    check('Stay: still 142 Tracker, no late jump', f.sq === '142' && st.page === 'page-tracker', `${f.sq} ${st.page}`)
    check('Stay: draft still drawn', await hasEv(s, 'JB-S16A') && f.dirty, `dirty ${f.dirty}`)
    await pic(s, 'a2-after-stay')
    await shut(s)
    a = await tapAndRead(s, 'a3')
    if (!a.msg) { const st2 = await state(s); note('second bell tap asked nothing; bell open?', JSON.stringify(st2.page)); await pic(s, 'a3-no-ask') }
    check('second tap asks again', /Save them before switching to 149/.test(a.msg || ''), a.msg)
    if (a.msg) {
      await press(s, '#dlgAlt', 'a4-discard'); await wait(s, 1500)
      const st3 = await state(s); const w = await waiting(s); await pic(s, 'a4-after-discard')
      check('Discard: entered 149 Admin Users', (st3.barMark || st3.dMark || '').startsWith('149') && st3.page === 'page-admin', `${st3.barMark} ${st3.page}`)
      check('Discard: 149 waiting list shows the request', w.some(x => /Jbviper/.test(x)), w)
      await to(s, '142'); await go(s, 'tracker'); await wait(s, 1600)
      f = await onSeed(s); check('142 chart: draft gone, its marks kept', !(await hasEv(s, 'JB-S16A')) && f.done === 2 && !f.dirty, short(f)); await pic(s, 'a5-142-after')
      await to(s, '149'); f = await onSeed(s); check('149 chart untouched', !(await hasEv(s, 'JB-S16A')) && f.done === 1, short(f))
    }
    await s.ctx.close()
  })
  await step('Save', async () => {
    const s = await build()
    await onSeed(s); check('draft on 142', await addEvent(s, 'JB-S16B'), 'JB-S16B')
    const a = await tapAndRead(s, 'b1')
    check('bell asks', /Save them before switching to 149/.test(a.msg || ''), a.msg); await pic(s, 'b1-asked')
    if (a.msg) {
      await press(s, '#dlgOk', 'b2-save'); await wait(s, 1800)
      const st = await state(s); const w = await waiting(s); await pic(s, 'b2-after-save')
      check('Save: entered 149 Users with the request', (st.barMark || st.dMark || '').startsWith('149') && st.page === 'page-admin' && w.some(x => /Jbviper/.test(x)), `${st.barMark} ${st.page} ${JSON.stringify(w)}`)
      await to(s, '149'); await go(s, 'tracker'); await wait(s, 1500)
      let f = await onSeed(s); check('149 chart has no 142 event', f.sq === '149' && !(await hasEv(s, 'JB-S16B')) && f.done === 1, short(f)); await pic(s, 'b3-149')
      await to(s, '142'); await wait(s, 500)
      f = await onSeed(s); check('142 chart kept the saved event, not dirty', (await hasEv(s, 'JB-S16B')) && f.done === 2 && !f.dirty, short(f)); await pic(s, 'b4-142')
    }
    await s.ctx.close()
  })
} finally { finish('s16-' + SZ); await closeAll() }
