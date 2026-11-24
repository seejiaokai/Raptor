// rb-i4 v1 - item 4: after a member-view round trip over a held draft, the top bar and the Leave War are the same squadron (149);
// an Approve lands in 149's war and 142's is unchanged; the draft saved afterwards; the next switch stays on 149. SZ=d|p|pc
import { finish, closeAll, picsFor, step, hasEv, go, mk, signIn, grant, as, addEvent, ask, trackerSaved, layoutDiff } from './rlib.mjs'
import { Q, shortQ, where, roleSwitch, wait, note, check, pic, press, pickSq, shut } from './rb-lib.mjs'
const SZ = process.env.SZ || 'd'
const tag = `rb-i4-${SZ}`
console.log('rb-i4 v2', SZ, process.env.MQ_PORT)
picsFor(tag)
const q = t => `[data-testid="${t}"]`
const DAY = '2026-12-15'
const tapIt = async (s, loc) => { const l = typeof loc === 'string' ? s.page.locator(loc).filter({ visible: true }).first() : loc; if (s.desk) await l.click(); else await l.tap(); await s.page.waitForTimeout(320) }
const visible = (s, sel) => s.page.locator(sel).filter({ visible: true }).count().then(n => n > 0)
/* every saved record of a squadron's war, as key -> fingerprint (read only) */
const warSaved = (s, unit) => s.page.evaluate(unit => {
  const hash = t => { let h = 5381; for (let i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return h.toString(36) + ':' + t.length }
  const pre = `raptor:leavewar/u${unit}@`, out = {}
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(pre)) out[k.slice(pre.length)] = hash(localStorage.getItem(k) || '') }
  return out
}, unit)
async function toDec(s) {
  await go(s, 'leavewar'); await shut(s); await s.page.waitForSelector(q('month-strip'), { timeout: 15000 }); await wait(s, 700)
  const w = s.page.locator(q('war-picker')).filter({ visible: true })
  if (await w.count()) { const v = await w.first().inputValue(); if (v !== 'y2026') { await s.page.selectOption(q('war-picker'), 'y2026'); await wait(s, 700) } }
  await tapIt(s, q('month-DEC')); await wait(s, 800)
}
const rowsDrawn = s => s.page.evaluate(day => ({
  osprey149: !!document.querySelector(`[data-testid="cell-osp9-${day}"]`),
  ranger142: !!document.querySelector(`[data-testid="cell-bane-${day}"]`),
  cell: document.querySelector(`[data-testid="cell-osp9-${day}"]`)?.textContent.trim() ?? null,
}), DAY)
const showCell = (s, sel) => s.page.evaluate(c => document.querySelector(c)?.scrollIntoView({ block: 'center', inline: 'center' }), sel)

try {
  await step('the request made by the app, on 149', async () => {
    const s = await mk(SZ); const { page } = s
    await signIn(s, 'ad', 'a')
    check('set-up: Saber gave Hunter Plan of 149', await grant(s, 'prowler', '149', 'plan'), 'prowler plan 149')
    await pickSq(s, '149'); await shut(s); await wait(s, 900)
    await toDec(s)
    await tapIt(s, q('open-chip')); await wait(s, 350)
    const m = page.locator('[data-testid^="od-month-"]', { hasText: /dec/i }).filter({ visible: true }).first(); await tapIt(s, m); await wait(s, 250)
    if (await visible(s, q('od-apply'))) await tapIt(s, q('od-apply'))
    if (await visible(s, q('open-dates-close'))) await tapIt(s, q('open-dates-close')); await wait(s, 300)
    check('set-up: December opened for bidding on 149', !(await visible(s, q('open-dates'))), 'closed')

    await as(s, 'us9', 'us9'); await toDec(s); const cell = `[data-testid="cell-osp9-${DAY}"]`; await showCell(s, cell); await wait(s, 350)
    await tapIt(s, cell); await wait(s, 450)
    check('set-up: Osprey (149) opens the bid window', await visible(s, q('bid-picker')), 'open')
    const ol = page.locator(`${q('bid-leave-grid')} button`, { hasText: /^OL/ }).filter({ visible: true }).first(); await tapIt(s, ol); await wait(s, 450)
    await pic(s, '00-bid-after-OL'); note('bid window says', await page.evaluate(p => document.querySelector(p)?.innerText.replace(/\s+/g, ' ').slice(0, 260), q('bid-picker')))
    /* the app's "below zero: tap the same leave again" (walk-scripts §3): a second press of the same leave */
    if (await visible(s, q('bid-picker')) && /again/i.test(await page.evaluate(p => document.querySelector(p)?.innerText || '', q('bid-picker')))) { await tapIt(s, ol); await wait(s, 450) }
    const a = await ask(s); if (a.msg) { note('bid asks', a.msg); await tapIt(s, '#dlgOk') }
    if (await visible(s, q('bid-picker')) && await visible(s, q('bid-cancel'))) await tapIt(s, q('bid-cancel'))
    await wait(s, 250); const c0 = await rowsDrawn(s); check('set-up: his bid stands on his row', /OL/.test(c0.cell || ''), c0)

    await as(s, 'ad2', 'a2')
    await go(s, 'tracker'); await shut(s); await wait(s, 1800)   // 142's Tracker opened once: its first opening writes its seed
    await pickSq(s, '149'); await shut(s); await wait(s, 1100)
    check('set-up: the unsaved chart edit RB4A', await addEvent(s, 'RB4A'), 'RB4A')
    await pic(s, '01-draft-on-149')
    await roleSwitch(s, '02-to-member'); await wait(s, 600); let w = await where(s); note('member view', JSON.stringify(w)); await pic(s, '02-member-view')
    await roleSwitch(s, '03-back'); await wait(s, 800); w = await where(s); note('back in the admin view', JSON.stringify(w)); await pic(s, '03-back-admin')
    check('back in the admin view the top bar says 149', w.sq.startsWith('149'), w)

    await toDec(s); w = await where(s); const r = await rowsDrawn(s); await showCell(s, cell); await wait(s, 300); await pic(s, '04-war-after-round-trip')
    check('the Leave War on screen is 149 (Osprey drawn, Ranger not) under a bar of 149', w.sq.startsWith('149') && r.osprey149 && !r.ranger142, { w, r })

    const w149a = await warSaved(s, '149'), w142a = await warSaved(s, '142')
    note('war records', Object.keys(w149a).length, Object.keys(w142a).length)
    check('the read works: 149 has war records', Object.keys(w149a).length > 0, Object.keys(w149a).length)
    const t = page.locator('[data-testid^="lw-tab-"]', { hasText: /Approvals/ }).filter({ visible: true })
    check('Approvals tab offered', (await t.count()) > 0, await t.count()); await tapIt(s, t.first()); await wait(s, 500); await pic(s, '05-approvals-before')
    const line = page.locator(q('appr-line-osp9')).filter({ hasText: '15 Dec' }).filter({ visible: true })
    check('Osprey on the Approvals list', (await line.count()) > 0, await line.count())
    const inner = line.first().locator(q('appr-approve')); if (await inner.count()) await tapIt(s, inner.first()); else { await tapIt(s, line.first()); await wait(s, 300); await tapIt(s, q('appr-approve')) }
    await wait(s, 450); const qa = await Q(s); if (qa.up) { note('approve asks', JSON.stringify(shortQ(qa))); await tapIt(s, '#dlgOk'); await wait(s, 350) }
    await pic(s, '06-approved'); const says = await line.first().textContent().catch(() => '')
    check('the line now reads Approved', /Approved/.test(says || ''), (says || '').slice(-40))
    await wait(s, 500)
    const w149b = await warSaved(s, '149'), w142b = await warSaved(s, '142')
    const d149 = layoutDiff(w149a, w149b), d142 = layoutDiff(w142a, w142b)
    check('the Approve wrote into 149 war', d149.length > 0, d149.slice(0, 6))
    check('142 war is unchanged', d142.length === 0, d142.slice(0, 6))

    const g = page.locator(q('lw-tab-grid')).filter({ visible: true }); if (await g.count()) await tapIt(s, g.first())
    await go(s, 'tracker'); await shut(s); await wait(s, 1200); w = await where(s)
    const dirty = await page.locator('#saveChanges').filter({ visible: true }).count(), has = await hasEv(s, 'RB4A'); await pic(s, '07-tracker-draft-kept')
    check('the draft is still held on 149 after the Approve', w.sq.startsWith('149') && !!dirty && has, { w, dirty, has })
    const t149 = await trackerSaved(s, '149'), t142 = await trackerSaved(s, '142')
    await tapIt(s, '#saveChanges'); await wait(s, 1000)
    const a2 = await Q(s); if (a2.up) { note('save asks', JSON.stringify(shortQ(a2))); await tapIt(s, '#dlgOk'); await wait(s, 500) }
    const dirtyAfter = await page.locator('#saveChanges').filter({ visible: true }).count(); await pic(s, '08-saved')
    const dt = layoutDiff(t149, await trackerSaved(s, '149')), dh = layoutDiff(t142, await trackerSaved(s, '142'))
    check('the draft saved into 149, no longer unsaved', !dirtyAfter && dt.length > 0 && (await hasEv(s, 'RB4A')), { dirtyAfter, dt: dt.slice(0, 4) })
    check('142 Tracker unchanged by that save', dh.length === 0, dh.slice(0, 4))

    await roleSwitch(s, '09-next-switch'); await wait(s, 700); w = await where(s); await pic(s, '09-member-after-save')
    check('the next switch to the member view: bar on 149', w.sq.startsWith('149'), w)
    await roleSwitch(s, '10-next-back'); await wait(s, 800); w = await where(s); await pic(s, '10-admin-after-save')
    check('and back: bar on 149', w.sq.startsWith('149'), w)
    await go(s, 'tracker'); await shut(s); await wait(s, 1100); w = await where(s); const he = await hasEv(s, 'RB4A'); await pic(s, '11-tracker-149')
    check('the Tracker is 149 with the saved event', w.sq.startsWith('149') && he, { w, he })
    await toDec(s); w = await where(s); const r2 = await rowsDrawn(s); await showCell(s, cell); await wait(s, 300); await pic(s, '12-war-149')
    check('the Leave War is still 149, Osprey approved', w.sq.startsWith('149') && r2.osprey149 && !r2.ranger142, { w, r2 })
    await pickSq(s, '142'); await shut(s); await wait(s, 1000); w = await where(s); const r3 = await rowsDrawn(s); await pic(s, '13-pick-142')
    check('a pick of 142 goes cleanly', w.sq.startsWith('142') && !r3.osprey149, { w, r3 })
    await pickSq(s, '149'); await shut(s); await wait(s, 1000); w = await where(s); const r4 = await rowsDrawn(s); await pic(s, '14-pick-149')
    check('and back to 149', w.sq.startsWith('149') && r4.osprey149 && !r4.ranger142, { w, r4 })
    await s.ctx.close()
  })
} finally { finish(tag); await closeAll() }
