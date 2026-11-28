// trk-2b v1 — case 2b: Hunter has an unsaved chart edit on 149's Tracker; Saber, in a second tab of the same browser (as
// the n153 scripts do it — jb-s25), ends Hunter's Plan of 149 (Admin → Users → Hunter → 149: None → Save). What Hunter's
// Tracker tab then shows: which squadron, what became of the edit, every message on screen and in his bell. Then Hunter
// presses things in his own tab (a press anywhere, ✓ Save changes, a reload) and each result is read.
//   node raptor-port/scripts/handpass/n162/trk-2b.mjs d|p
import { SZ, mk, run, fact, fail, log, press, go, signIn, trackerReady, hunterOn149, addEvent, setAccess, dlg, where, bar, barFacts, shots, frames, bellLines, bellClose } from './trk-lib.mjs'
console.log('trk-2b v1', SZ)

/* everything Hunter's tab shows, read */
async function readHunter(s, tag) {
  const w = await where(s), b = await bar(s), q = await dlg(s)
  fact(`2b.${SZ}.${tag}.where`, w)
  barFacts(`2b.${SZ}.${tag}.bar`, b)
  fact(`2b.${SZ}.${tag}.box`, q)
  fact(`2b.${SZ}.${tag}.editOnChart`, await s.page.evaluate(() => { const p = document.querySelector('#page-tracker'); return !!p && p.innerText.includes('TRKB') }))
  fact(`2b.${SZ}.${tag}.toast`, await s.page.evaluate(() => { const t = document.querySelector('#toastEl'); return t && t.getBoundingClientRect().width > 0 ? t.textContent.replace(/\s+/g, ' ').trim() : '' }))
  fact(`2b.${SZ}.${tag}.bands`, await s.page.evaluate(() => [...document.querySelectorAll('.sv-band, .savestatus, [class*="band"]')].filter(e => e.getBoundingClientRect().height > 2 && e.getBoundingClientRect().width > 50).map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(t => t).slice(0, 6)))
  return { w, b, q }
}

/* 'self' (optional) tries the one-tab form: Hunter ending his own Plan in Admin → Users. It fails loudly: his own row is
   drawn disabled there (trk-probe-users.mjs). */
const MODES = (process.argv[3] || 'saber').split(',')
async function saberMode() {
  const s = await mk()
  await hunterOn149(s)
  await addEvent(s, 'TRKB')
  await readHunter(s, 'before')
  const bell0 = await bellLines(s); fact(`2b.${SZ}.before.bell`, bell0); if (bell0.open) await bellClose(s)

  /* Saber, a second tab of the same browser */
  const p2 = await s.ctx.newPage(); const s2 = { ctx: s.ctx, page: p2, desk: s.desk }
  await signIn(s2, 'ad', 'a')
  await setAccess(s2, 'prowler', '149', 'none')
  await shots(s2, `trk-2b-${SZ}-saber-saved`, '[data-testid="acc-sq"]')

  /* Hunter's tab, brought forward: read as it stands, then up to 5 s for anything to change by itself */
  await s.page.bringToFront(); await frames(s)
  const first = await readHunter(s, 'afterSaber')
  const markNow = () => { const m = [...document.querySelectorAll('.topbar .mark')].find(x => x.getBoundingClientRect().width > 1) || document.querySelector('.drawer-sqn .mark'); return m ? m.textContent : '' }
  const m0 = await s.page.evaluate(markNow)
  const changed = await s.page.waitForFunction(([st, src]) => { const markNow = new Function('return (' + src + ')()'); const e = document.getElementById('saveStat'); const d = document.querySelector('#dlgMsg'); return (e ? e.textContent : '') !== st.t || markNow() !== st.m || (!!d && d.getBoundingClientRect().width > 0) }, [{ t: first.b.fullText || '', m: m0 }, markNow.toString()], { timeout: 5000 }).then(() => true).catch(() => false)
  fact(`2b.${SZ}.afterSaber.changedWithin5s`, changed)
  await shots(s, `trk-2b-${SZ}-hunter-after-saber`, '#page-tracker header .saveslot')
  const bell1 = await bellLines(s); fact(`2b.${SZ}.afterSaber.bell`, bell1)
  if (bell1.open) { await shots(s, `trk-2b-${SZ}-hunter-bell`, '[data-testid="bell-list"]'); await bellClose(s) }

  /* a press anywhere ordinary: the Info half / a page change and back */
  const other = await s.page.evaluate(() => [...document.querySelectorAll('#topnav a[data-page], #drawerNav a[data-page]')].map(a => a.dataset.page).find(p => p !== 'tracker'))
  await go(s, other); await go(s, 'tracker'); await trackerReady(s).catch(() => log('tracker not ready after the page change'))
  fact(`2b.${SZ}.afterPageChange.wentTo`, other)
  await readHunter(s, 'afterPageChange')
  await shots(s, `trk-2b-${SZ}-hunter-after-pagechange`, '#page-tracker header .saveslot')

  /* ✓ Save changes pressed in Hunter's tab */
  if (await s.page.locator('#saveChanges').filter({ visible: true }).count()) {
    await press(s, '#saveChanges', '✓ Save changes')
    await s.page.waitForFunction(() => !document.querySelector('#saveChanges') || !!document.querySelector('#dlgMsg') || /could not/.test(document.getElementById('saveStat')?.textContent || ''), null, { timeout: 8000 }).catch(() => log('nothing changed 8 s after Save changes'))
    const r = await readHunter(s, 'afterSaveChanges')
    await shots(s, `trk-2b-${SZ}-hunter-after-save`, r.q.up ? '#dlgModal' : '#page-tracker header .saveslot')
    if (r.q.up) { await press(s, '#dlgOk', 'OK'); await frames(s); await readHunter(s, 'afterSaveChangesOk') }
    /* what 149's stored chart holds now, read from the browser's store (the edit's name) */
    fact(`2b.${SZ}.afterSaveChanges.storedOn149`, await s.page.evaluate(() => { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('raptor:tracker/u149@') && (localStorage.getItem(k) || '').includes('TRKB')) return k } return null }))
  } else fact(`2b.${SZ}.afterSaberPageChange.saveChangesShown`, false)

  /* a reload of Hunter's tab */
  await s.page.reload(); await s.page.waitForSelector('.page.on, #luser', { state: 'attached', timeout: 30000 })
  if (await s.page.locator('#luser').filter({ visible: true }).count()) { fact(`2b.${SZ}.reload.askedSignIn`, true); await signIn(s, 'ad2', 'a2') }
  const w = await where(s); if (w.page !== 'page-tracker') await go(s, 'tracker').catch(() => {})
  await trackerReady(s).catch(() => log('tracker not ready after the reload'))
  await readHunter(s, 'afterReload')
  const sqList = await s.page.evaluate(() => [...document.querySelectorAll('#sqnMenu .sqm-num, #drawerSqnList .sqm-num')].map(e => e.textContent.trim()))
  fact(`2b.${SZ}.afterReload.squadronListInDom`, sqList)
  const bell2 = await bellLines(s); fact(`2b.${SZ}.afterReload.bell`, bell2); if (bell2.open) await bellClose(s)
  await shots(s, `trk-2b-${SZ}-hunter-after-reload`, '#page-tracker header .saveslot')
  await s.ctx.close()
}
/* the same right ended in ONE tab: Hunter himself, in Admin → Users, sets his own 149 line to None while his edit waits */
async function selfMode() {
  const s = await mk()
  await hunterOn149(s)
  await addEvent(s, 'TRKB')
  await readHunter(s, 'self.before')
  await go(s, 'admin')
  if (await s.page.locator('.adm-back:visible').count()) await press(s, '.adm-back', 'Admin back')
  await press(s, s.page.locator('#page-admin button.adm-cat', { has: s.page.locator('.adm-cat-l', { hasText: /^Users/ }) }).first(), 'Users tile')
  const own = await s.page.evaluate(() => { const t = document.querySelector('[data-person="prowler"] .acc-tap'); return t ? { disabled: !!t.disabled, text: t.textContent.replace(/\s+/g, ' ').trim() } : null })
  fact(`2b.${SZ}.self.ownRow`, own)
  if (!own || own.disabled) fail('Hunter cannot open his own row in Admin → Users (drawn disabled): the one-tab form cannot be pressed')
  await setAccess(s, 'prowler', '149', 'none')
  fact(`2b.${SZ}.self.afterOwnSave.where`, await where(s))
  fact(`2b.${SZ}.self.afterOwnSave.box`, await dlg(s))
  await shots(s, `trk-2b-${SZ}-self-after-ownsave`, '[data-testid="acc-sq"]')
  const w = await where(s)
  if (w.page !== 'page-tracker') await go(s, 'tracker')
  await trackerReady(s).catch(() => log('tracker not ready'))
  const r = await readHunter(s, 'self.onTracker')
  await shots(s, `trk-2b-${SZ}-self-tracker`, r.q.up ? '#dlgModal' : '#page-tracker header .saveslot')
  const bell = await bellLines(s); fact(`2b.${SZ}.self.bell`, bell)
  if (bell.open) { await shots(s, `trk-2b-${SZ}-self-bell`, '[data-testid="bell-list"]'); await bellClose(s) }
  await s.ctx.close()
}
await run('trk-2b', async () => { for (const m of MODES) { log(`--- 2b ${m} (${SZ})`); if (m === 'saber') await saberMode(); else if (m === 'self') await selfMode(); else fail(`unknown mode ${m}`) } })
