// S20 a failed save before switching: ?savefail on real storage, a Tracker draft, Pick → Save them; Export → save first; sign-out → Save them.
import { mk, closeAll, finish, as, pic, picsFor, note, step, check, T, ask, hit, pickCourse, addEvent, hasEv, ballIds, pickSq, shut, state, menuItem, sleep, signIn } from './ja-lib.mjs'
import { fixture, waitTrk, openTrk, move, readBoth, whole142, whole149 } from './ja-fx.mjs'
const SZ = process.env.SZ || 'd'
console.log('ja-20 v1', SZ)
picsFor(`j20-${SZ}`)
const BASE = `http://localhost:${process.env.MQ_PORT}/`
const has = async (s, n) => (await ballIds(s)).includes(n)
/* every word the Tracker's corner and any band says now */
const words = s => s.page.evaluate(() => {
  const shown = e => { const b = e.getBoundingClientRect(); return b.width > 1 && b.height > 1 && getComputedStyle(e).visibility !== 'hidden' }
  const st = document.getElementById('saveStat')
  const bands = [...document.querySelectorAll('.savestat, [role="alert"], .failband, .savefail, #saveBand')].filter(shown).map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean)
  return { corner: st && !st.hidden ? st.textContent.trim() : '', cls: st?.className || '', bands: [...new Set(bands)].slice(0, 5) }
})
async function inFailMode(s) {
  await s.page.goto(BASE + '?savefail'); await s.page.waitForSelector('#luser', { timeout: 15000 })
  await s.page.fill('#luser', 'ad'); await s.page.fill('#lpass', 'a'); await s.page.click('#loginForm button[type=submit]')
  await s.page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 30000 }); await sleep(s, 900)
  await s.page.addStyleTag({ content: '*{transition:none !important;animation:none !important}' })
}
async function leaveFail(s) { await s.page.goto(BASE); await s.page.waitForSelector('#luser', { timeout: 15000 }); await signIn(s, 'ad', 'a') }
try {
  const s = await mk(SZ)
  await step('fixture on real storage', async () => { await fixture(s) })
  await step('open with saves refused', async () => {
    await inFailMode(s); await openTrk(s, '142'); await pickCourse(s, 'JA-142')
    const t = await T(s); check('S20 the saved world reads back under ?savefail', t.course.list.includes('JA-142'), t.course.list)
    check('S20 a draft made', await addEvent(s, 'JAF20'), 'JAF20'); await sleep(s, 200); note('with draft: ' + JSON.stringify(await words(s)))
  })
  await step('S20a Pick 149, Save them, with saves refused', async () => {
    await pickSq(s, '149', 's20-pick'); await sleep(s, 300); const q = await ask(s); check('S20a asks', /149/.test(q.msg || ''), q); await pic(s, '01-ask')
    await hit(s, '#dlgOk', 900); if (!s.desk) await shut(s); await sleep(s, 400)
    const q2 = await ask(s); note('after Save them: question ' + JSON.stringify(q2)); const w = await words(s); note('after Save them: words ' + JSON.stringify(w)); await pic(s, '02-after-save-failed')
    const st = await state(s), t = await T(s); note('after Save them: ' + JSON.stringify({ bar: st.barMark, dirty: t.dirty, ev: t.events }))
    if (q2.msg) { check('S20a says it could not be saved', /not|could(n.t| not)|fail|couldn/i.test(q2.msg), q2.msg); await hit(s, s.page.locator('#dlgOk, #dlgCancel').filter({ visible: true }).first(), 400) }
    const st2 = await state(s), t2 = await T(s), drawn = await has(s, 'JAF20')
    check('S20a the draft is not silently lost (still drawn and marked unsaved, or the screen says so)', (t2.dirty && drawn) || /not saved|could not/i.test(JSON.stringify(await words(s))), { bar: st2.barMark, dirty: t2.dirty, drawn, words: await words(s) })
    check('S20a no false success', !/^● saved$/.test((await words(s)).corner), (await words(s)).corner)
    await pic(s, '03-settled'); if (!st2.barMark.startsWith('142')) { note('moved to ' + st2.barMark + ' after the failed save') }
    const stayed = st2.barMark.startsWith('142'); note('RECORD S20a: after Save them with saves refused the app ' + (stayed ? 'stayed on' : 'moved to') + ' ' + st2.barMark)
    if (!stayed) { await move(s, '142'); await pickCourse(s, 'JA-142'); note('back on 142: ' + JSON.stringify({ drawn: await has(s, 'JAF20'), dirty: (await T(s)).dirty, words: await words(s) })) }
  })
  await step('S20b Export with a draft, with saves refused', async () => {
    check('S20b a fresh draft for Export', await addEvent(s, 'JAF21'), 'JAF21'); await sleep(s, 200); check('S20b draft is unsaved', (await T(s)).dirty, (await T(s)).saveStat)
    await menuItem(s, 'file', 'exportBtn'); await sleep(s, 400)
    const q = await ask(s); note('Export with a draft asks: ' + JSON.stringify(q)); await pic(s, '04-export-question')
    if (q.msg) {
      const saveBtn = q.btns.find(b => /save/i.test(b)); const id = saveBtn ? '#' + saveBtn.split(':')[0] : '#dlgOk'
      await hit(s, id, 800); const q2 = await ask(s); const open = await s.page.locator('#copyModal').count(); note('after Save then export: ' + JSON.stringify({ q2, copyModal: open, words: await words(s) })); await pic(s, '05-export-after-save')
      if (q2.msg) await hit(s, s.page.locator('#dlgOk, #dlgCancel').filter({ visible: true }).first(), 400)
      const bandUp = (await words(s)).bands.some(b => /Not saved/.test(b)); check('S20b the band says Not saved while the Export window is up', bandUp, (await words(s)).bands)
      if (await s.page.locator('#copyModal').count()) {
        // the file made after a refused save: does it hold the draft the question promised, and what does the closing note say?
        const dl = s.page.waitForEvent('download', { timeout: 15000 }); await hit(s, '#copyOk', 0); const d = await dl
        const path = `${process.env.MQ_OUT}/exports/${SZ}-${process.pid}-s20b.json`; await d.saveAs(path); await s.page.waitForSelector('#dlgModal', { timeout: 6000 })
        const said = (await ask(s)).msg; await hit(s, '#dlgOk', 350)
        const { readFileSync } = await import('node:fs'); const text = readFileSync(path, 'utf8')
        note('RECORD S20b the file: ' + JSON.stringify({ holdsDraft: text.includes('JAF21'), said }))
        check('S20b the exported file holds the chart as drawn, draft included (as the question promised)', text.includes('JAF21'), { holdsDraft: text.includes('JAF21'), said })
      }
    } else if (await s.page.locator('#copyModal').count()) { note('Export window opened with no question'); await hit(s, '#copyCancel', 300) }
    const t = await T(s), w = await words(s); note('after Export: ' + JSON.stringify({ dirty: t.dirty, w }))
    check('S20b the draft is not lost: drawn, under the Not saved band', await has(s, 'JAF21') && w.bands.some(b => /Not saved/.test(b)), { dirty: t.dirty, w })
  })
  await step('S20c Sign out, Save them, with saves refused', async () => {
    check('S20c a fresh draft', await addEvent(s, 'JAF22'), 'JAF22'); await sleep(s, 200)
    if (s.desk) await hit(s, '#logout', 400); else { await hit(s, '#burger', 300); await hit(s, '#drawerLogout', 400) }
    const q = await ask(s); note('sign-out asks: ' + JSON.stringify(q)); await pic(s, '06-signout-ask')
    if (!q.msg) { note('NOT WALKED: sign-out asked nothing'); return }
    const saveBtn = q.btns.find(b => /save/i.test(b)); await hit(s, saveBtn ? '#' + saveBtn.split(':')[0] : '#dlgOk', 900)
    const q2 = await ask(s); const on = await s.page.locator('#luser').isVisible().catch(() => false); note('after Save them at sign-out: ' + JSON.stringify({ q2, signedOut: on, words: await words(s) })); await pic(s, '07-signout-after')
    const band = await s.page.evaluate(() => [...document.querySelectorAll('.saveband')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.textContent.replace(/\s+/g, ' ').trim()))
    note('RECORD S20c at the sign-in screen: ' + JSON.stringify({ signedOut: on, band }))
    check('S20c signed out over a refused save: the sign-in screen says Not saved', !on || band.some(b => /Not saved/.test(b)), band)
    if (q2.msg) await hit(s, s.page.locator('#dlgCancel, #dlgOk').filter({ visible: true }).first(), 400)
    if (on) {
      // the same tab, signed in again: the refused work is still held here
      await s.page.fill('#luser', 'ad'); await s.page.fill('#lpass', 'a'); await s.page.click('#loginForm button[type=submit]')
      const inAgain = await s.page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 9000 }).then(() => true).catch(() => false); await sleep(s, 800)
      if (!inAgain) {
        const body = await s.page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 300)); await pic(s, '07b-signin-held')
        note('RECORD S20c signing in again in the same tab did not reach the app; the screen says: ' + body); return
      }
      await openTrk(s, '142'); await pickCourse(s, 'JA-142'); const w2 = await words(s), hadIt = await has(s, 'JAF22')
      note('RECORD S20c signed in again in the same tab: ' + JSON.stringify({ drawn: hadIt, dirty: (await T(s)).dirty, band: w2.bands })); await pic(s, '07b-signed-in-again')
      check('S20c the refused draft is still held, under the band, in the same tab', hadIt && w2.bands.some(b => /Not saved/.test(b)), { hadIt, w2 })
    }
  })
  await step('S20d remove the failure, retry, reload', async () => {
    await leaveFail(s); await openTrk(s, '142'); await pickCourse(s, 'JA-142')
    const gone = !(await has(s, 'JAF20')); note('after leaving ?savefail: draft on chart: ' + !gone); await pic(s, '08-after-failure-removed')
    check('S20d a refused save did not land as saved', gone, 'JAF20 not on the saved chart')
    const b = await readBoth(s); check('S20d both squadrons whole', whole142(b['142']) && whole149(b['149']), b)
    await pickCourse(s, 'JA-142'); check('S20d a new draft', await addEvent(s, 'JAF20B'), 'JAF20B'); await sleep(s, 200); await hit(s, '#saveChanges', 700)
    const t = await T(s); check('S20d save works again', !t.dirty, (await words(s)).corner)
    await s.page.goto(BASE); await s.page.waitForSelector('#luser', { timeout: 15000 }); await signIn(s, 'ad', 'a'); await openTrk(s, '142'); await pickCourse(s, 'JA-142')
    check('S20d the new save survives a reload', await has(s, 'JAF20B') && !(await has(s, 'JAF20')), (await T(s)).events)
  })
  await s.ctx.close()
} finally { finish(`j20-${SZ}`); await closeAll() }
