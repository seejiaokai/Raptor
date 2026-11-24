// Walker b, B3 — Undo and Redo of a save that wrote a new line; NEW (LL -> OL and AM in one save) and OLD (LL -> OL).
// Ranger's bell is read after each step from a COPY of the stored world (a separate device opened on it; opening the list
// writes nothing), so Saber's own session — and his Undo list, which clears at sign-out (D148) — stays alive.
// Leg 2 (Ranger READS the line, then Saber Undo -> Redo) tries a second tab in Saber's own browser (one store).
// Run from raptor-port:  node scripts/handpass/wr4-b-3.mjs <run-folder-name> [new|old]
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('wr4-b-3 v1')
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.argv[2] || 'b3-run1'
const WHICH = (process.argv[3] || 'new,old').split(',')
process.env.WR4_OUT ||= join(HERE, '../../docs/img/handpass/2026-11-24-words-r4-walk/b', RUN)
process.env.WR4_NEW ||= 'D:/rw4/build-new'
process.env.WR4_OLD ||= 'D:/rw4/build-main'
const L = await import('./wr4-lib.mjs')
const B = await import('./wr4-b-common.mjs')
const { newPage, signIn, handOver, fileInput, editInput, openBell, log, facts, press, recOf, bundleOf, sleep, shot, bellClip, shownToast, RANGER, WED, NEW_DIR, OLD_DIR } = L
const out = {}

async function readSnap(c, w, dir, name) {
  await sleep(1200)
  const state = await w.ctx.storageState({ indexedDB: true })
  const r = await newPage('phone', state, dir); await signIn(r, 'us')
  await openBell(r)
  const ls = await B.readLines(r.page)
  const st = await B.bellState(r.page)
  await B.bellPic(r, c, name, ls)
  await r.ctx.close()
  log(c, `${name}: bell lit ${st.lit}; lines ${JSON.stringify(B.said(ls))}`)
  return { lines: B.said(ls), lit: st.lit }
}
const btn = async (w, sel) => w.page.evaluate(s => { const b = document.querySelector(s); return b ? { disabled: b.disabled, title: b.title } : null }, sel)

for (const which of WHICH) {
  const c = 'B3-' + which, dir = which === 'old' ? OLD_DIR : NEW_DIR
  const o = out[which] = {}
  try {
    let w = await newPage('desk', undefined, dir); await signIn(w, 'us')
    log(c, 'bundle: ' + await bundleOf(w.page))
    const ll = await fileInput(w, c, WED, { type: 'LL', span: 'all', remarks: 'Local leave' })
    if (!ll) throw new Error('fixture: no LL')
    w = await handOver(w, 'desk', 'ad', dir)
    await editInput(w, c, ll, WED, async () => {
      await w.page.selectOption('#inpEditPop #inpEditType', 'OL')
      if (which === 'new') await press(w, '#inpEditSpan [data-span="am"]')
    })
    o.saved = await recOf(w.page, ll)
    o.read0 = await readSnap(c, w, dir, `B3-${which}-1-after-save-phone`)
    const steps = [['undo', '#undoBtn'], ['redo', '#redoBtn']]
    let k = 2
    for (const [nm, sel] of steps) {
      o[nm + 'Btn'] = await btn(w, sel)
      await w.page.locator(sel).click(); await sleep(600)
      o[nm + 'Note'] = await shownToast(w.page)
      o[nm + 'Rec'] = await recOf(w.page, ll)
      log(c, `${nm}: button ${JSON.stringify(o[nm + 'Btn'])}; note ${JSON.stringify(o[nm + 'Note'])}; record ${JSON.stringify(o[nm + 'Rec'])}`)
      await shot(w.page, c, `B3-${which}-${k++}-${nm}-pressed-desk`, { x: 0, y: 0, width: 1440, height: 160 }, o[nm + 'Note'], 'desk')
      o['read_' + nm] = await readSnap(c, w, dir, `B3-${which}-${k++}-bell-after-${nm}-phone`)
    }
    // ---- leg 2: Ranger reads the line in a second tab of the same browser (one store), then Saber Undo -> Redo
    const R = await w.ctx.newPage()
    await R.goto(L.URL); await R.waitForFunction(() => document.querySelector('#luser') || document.querySelector('#vWeek .day'))
    await R.addStyleTag({ content: L.NOMOTION })
    const rw = { ctx: w.ctx, page: R, tap: false, size: 'desk' }
    o.leg2_tabOpensAs = await R.evaluate(() => (document.querySelector('#luser') ? 'sign-in screen' : 'signed in'))
    await signIn(rw, 'us')
    await openBell(rw)
    const ls = await B.readLines(R)
    const target = ls.find(l => l.unread)
    o.leg2_rangerSaw = B.said(ls)
    if (target) {
      await R.locator(`[data-testid="bell-list"] .bl-line[data-w4="${target.i}"]`).click(); await sleep(600)
      log(c, `leg 2: Ranger tapped "${target.what}"`)
      await B.closeWin(rw)
    }
    await sleep(1500)
    // back to Saber's tab: is he still signed in, and does his Undo still stand?
    await w.page.bringToFront(); await sleep(500)
    o.leg2_saberTab = await w.page.evaluate(() => ({ signInShown: !!document.querySelector('#luser'), undo: document.querySelector('#undoBtn')?.disabled === false }))
    log(c, 'leg 2: Saber\'s tab after Ranger\'s read in the other tab: ' + JSON.stringify(o.leg2_saberTab))
    await shot(w.page, c, `B3-${which}-8-saber-tab-after-ranger-read-desk`, { x: 0, y: 0, width: 1440, height: 160 }, '', 'desk')
    if (!o.leg2_saberTab.signInShown && o.leg2_saberTab.undo) {
      for (const [nm, sel] of [['undo2', '#undoBtn'], ['redo2', '#redoBtn']]) {
        o[nm + 'Btn'] = await btn(w, sel)
        await w.page.locator(sel).click(); await sleep(600)
        o[nm + 'Note'] = await shownToast(w.page)
        o[nm + 'Rec'] = await recOf(w.page, ll)
        log(c, `${nm}: button ${JSON.stringify(o[nm + 'Btn'])}; note ${JSON.stringify(o[nm + 'Note'])}; record ${JSON.stringify(o[nm + 'Rec'])}`)
        await shot(w.page, c, `B3-${which}-9-${nm}-pressed-desk`, { x: 0, y: 0, width: 1440, height: 160 }, o[nm + 'Note'], 'desk')
        o['read_' + nm] = await readSnap(c, w, dir, `B3-${which}-10-bell-after-${nm}-phone`)
      }
    } else log(c, 'leg 2 NOT WALKED: Saber\'s tab lost its sign-in or its Undo once Ranger signed in in the other tab')
    await w.ctx.close()
  } catch (e) { facts.errors.push(`${c}: ` + String(e && e.stack || e).slice(0, 600)); log(c, 'ERROR ' + String(e && e.message || e).split('\n')[0]) }
}
B.dump('b3.json', { out, log: facts.cases, errors: facts.errors })
console.log('\npictures:', facts.pictures.length, '· errors:', facts.errors.length)
for (const e of facts.errors.slice(0, 20)) console.log('  ' + e)
await L.finish()
