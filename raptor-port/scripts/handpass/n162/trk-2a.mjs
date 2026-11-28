// trk-2a v1 — case 2a: Hunter (admin of 142, Plan of 149) picks 149, makes an unsaved chart edit, switches to the member
// view, then (a) picks another squadron, or (b) presses Logout; answers "Save them". What appears, where, what he sees next;
// then back in the admin view, what the Tracker's bar shows beside ✓ Save changes; then what clears those words.
//   node raptor-port/scripts/handpass/n162/trk-2a.mjs d|p [all|pick|logout|clear-page|clear-chart|clear-save|clear-reload|clear-pick]
import { SZ, mk, run, fact, fail, log, press, go, pickSq, roleSwitch, logout, signIn, trackerReady, hunterOn149, addEvent, dlg, waitDlg, waitNoDlg, where, bar, barFacts, shots, frames, shut } from './trk-lib.mjs'

const WHICH = (process.argv[3] || 'all')
const ALL = ['pick', 'logout', 'clear-page', 'clear-chart', 'clear-save', 'clear-reload', 'clear-pick']
const todo = WHICH === 'all' ? ALL : WHICH.split(',')
console.log('trk-2a v1', SZ, todo.join(','))
const NS = /could not be saved/

/* the state of 2a by presses, up to the refusal box; returns the session */
async function toRefusal(tag, how) {
  const s = await mk()
  await hunterOn149(s)
  await addEvent(s, 'TRKA')
  barFacts(`2a.${SZ}.${tag}.beforeMember`, await bar(s))
  await roleSwitch(s)
  await s.page.waitForFunction(() => { const r = document.querySelector('#roleBadge'), d = document.querySelector('#drawerRole'); return /admin view/i.test((r?.textContent || '') + (d?.textContent || '')) }, null, { timeout: 10000 }).catch(() => fail('member view not reached'))
  fact(`2a.${SZ}.${tag}.inMember`, await where(s))
  if (how === 'logout') { await logout(s); await waitDlg(s, /Save them before logging out\?/) }
  else { await pickSq(s, '142'); await waitDlg(s, /Save them before switching to/) }
  const q = await dlg(s); fact(`2a.${SZ}.${tag}.question`, q)
  await press(s, '#dlgOk', 'Save them')
  await waitDlg(s, NS)
  return s
}
/* back to the admin view and the Tracker: the bar read */
async function backToAdmin(s) {
  await roleSwitch(s)
  await s.page.waitForFunction(() => { const r = document.querySelector('#roleBadge'), d = document.querySelector('#drawerRole'); return !/admin view/i.test((r?.textContent || '') + (d?.textContent || '')) }, null, { timeout: 10000 }).catch(() => fail('admin view not reached'))
  const w = await where(s)
  if (w.page !== 'page-tracker') await go(s, 'tracker')
  await trackerReady(s)
}

await run('trk-2a', async () => {
  for (const v of todo) {
    log(`--- 2a ${v} (${SZ})`)
    if (v === 'pick' || v === 'logout') {
      const s = await toRefusal(v, v)
      const box = await dlg(s), w = await where(s), b0 = await bar(s)
      fact(`2a.${SZ}.${v}.box.text`, box.msg); fact(`2a.${SZ}.${v}.box.buttons`, box.btns); fact(`2a.${SZ}.${v}.box.rect`, box.box)
      fact(`2a.${SZ}.${v}.atBox.where`, w); fact(`2a.${SZ}.${v}.atBox.trackerShown`, b0.trackerShown)
      await shots(s, `trk-2a-${v}-${SZ}-box`, '#dlgModal')
      await press(s, '#dlgOk', 'OK (the refusal)'); await waitNoDlg(s)
      const q2 = await dlg(s), w2 = await where(s)
      fact(`2a.${SZ}.${v}.afterOk.where`, w2); fact(`2a.${SZ}.${v}.afterOk.anotherBox`, q2)
      await shots(s, `trk-2a-${v}-${SZ}-afterok`)
      await backToAdmin(s)
      const b = await bar(s); barFacts(`2a.${SZ}.${v}.adminBar`, b)
      fact(`2a.${SZ}.${v}.adminBar.where`, await where(s))
      fact(`2a.${SZ}.${v}.adminBar.eventStillOnChart`, await s.page.evaluate(() => document.querySelector('#page-tracker').innerText.includes('TRKA')))
      await shots(s, `trk-2a-${v}-${SZ}-bar`, '#page-tracker header .saveslot')
      await s.ctx.close()
      continue
    }
    /* what clears the words: the state rebuilt each time, then one press */
    const s = await toRefusal(v, 'pick')
    await press(s, '#dlgOk', 'OK (the refusal)'); await waitNoDlg(s)
    await backToAdmin(s)
    const b0 = await bar(s); fact(`2a.${SZ}.${v}.before.visibleText`, b0.visibleText); fact(`2a.${SZ}.${v}.before.fullText`, b0.fullText)
    if (v === 'clear-page') {
      const other = await s.page.evaluate(() => [...document.querySelectorAll('#topnav a[data-page], #drawerNav a[data-page]')].map(a => a.dataset.page).find(p => p !== 'tracker'))
      if (!other) fail('no other page to go to')
      await go(s, other); fact(`2a.${SZ}.${v}.wentTo`, other)
      await go(s, 'tracker'); await trackerReady(s)
    } else if (v === 'clear-chart') {
      const opts = await s.page.evaluate(() => [...document.querySelectorAll('#sylSel option')].map(o => ({ v: o.value, t: o.textContent.trim(), on: o.selected })))
      const to = opts.find(o => !o.on); if (!to) fail('no other syllabus in the chart list')
      fact(`2a.${SZ}.${v}.switchTo`, to.t)
      /* the native drop-down: chosen as a person chooses it (the select's own list), then the question answered */
      await s.page.locator('#sylSel').filter({ visible: true }).first().selectOption(to.v)
      await waitDlg(s, /unsaved flow edits/); fact(`2a.${SZ}.${v}.question`, (await dlg(s)).msg)
      await press(s, '#dlgOk', 'OK (discard and switch)'); await waitNoDlg(s); await trackerReady(s)
    } else if (v === 'clear-save') {
      await press(s, '#saveChanges', '✓ Save changes')
      await s.page.waitForFunction(() => !document.querySelector('#saveChanges'), null, { timeout: 10000 }).catch(() => log('Save changes still drawn after the press'))
    } else if (v === 'clear-reload') {
      await s.page.reload(); await s.page.waitForSelector('.page.on, #luser', { state: 'attached', timeout: 30000 })
      if (await s.page.locator('#luser').filter({ visible: true }).count()) { fact(`2a.${SZ}.${v}.reloadAskedSignIn`, true); await signIn(s, 'ad2', 'a2') }
      const w = await where(s); fact(`2a.${SZ}.${v}.afterReload.where`, w)
      if (w.page !== 'page-tracker') await go(s, 'tracker')
      await trackerReady(s)
    } else if (v === 'clear-pick') {
      await pickSq(s, '142'); await shut(s)
      const q = await dlg(s); fact(`2a.${SZ}.${v}.question`, q)
      if (q.up) { await press(s, '#dlgOk', 'Save them'); await frames(s) }
      const q2 = await dlg(s); fact(`2a.${SZ}.${v}.question2`, q2)
      if (q2.up) { await press(s, '#dlgOk', 'OK'); await waitNoDlg(s) }
      await s.page.waitForFunction(() => /142/.test(([...document.querySelectorAll('.topbar .mark')].find(e => e.getBoundingClientRect().width > 1) || document.querySelector('.drawer-sqn .mark'))?.textContent || ''), null, { timeout: 15000 }).catch(() => log('not on 142 after the pick'))
      await trackerReady(s)
    } else fail(`unknown variant ${v}`)
    const b = await bar(s)
    fact(`2a.${SZ}.${v}.after.where`, await where(s))
    barFacts(`2a.${SZ}.${v}.after`, b)
    await shots(s, `trk-2a-${v}-${SZ}-after`, '#page-tracker header .saveslot')
    await s.ctx.close()
  }
})
