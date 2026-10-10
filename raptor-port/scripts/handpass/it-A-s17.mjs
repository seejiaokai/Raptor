// Scenario 17 — short screen and keyboard (admin and Ranger): the window edit and the List pencil edit on a 700px-tall desktop and
// a phone 520px tall (its visible height with the keyboard up): Title, Type, Remarks, Save, Cancel reachable by scrolling and Tab;
// Enter in the window's Title box saves once.
import { launch, open, table, errs, people, shot, sleep, press, allRecs, closeAnyWin, win, norm, toCal, tapAt, gotoInputs, recs } from './it-A-lib.mjs'
import { calDoor, penDoor, showAll, mateIds } from './it-A-doors.mjs'

const browser = await launch()
const T = table('s17')
const SZ = (process.argv[2] || 'short,kb').split(',')
const ROLES = (process.argv[3] || 'admin,member').split(',')
const inView = (p, sel) => p.locator(sel).first().evaluate(e => {
  const r = e.getBoundingClientRect(), vh = innerHeight, vw = innerWidth
  const hit = document.elementFromPoint(Math.min(Math.max(r.left + r.width / 2, 0), vw - 1), Math.min(Math.max(r.top + r.height / 2, 0), vh - 1))
  return { top: Math.round(r.top), bottom: Math.round(r.bottom), vh, inside: r.top >= -1 && r.bottom <= vh + 1 && r.left >= -1 && r.right <= vw + 1, hit: !!hit && (hit === e || e.contains(hit) || hit.contains(e) && hit.tagName !== 'BODY' && hit.tagName !== 'HTML') }
})
for (const size of SZ) for (const role of ROLES) {
  const { ctx, page } = await open(browser, size, role === 'admin' ? 'ad' : 'us', role === 'admin' ? 'a' : 'us')
  const P = await people(page)
  const me = role === 'admin' ? P.Ace : P.Ranger
  const say = []; let ok = true; const pics = []
  const need = (c, m) => { if (!c) ok = false; say.push((c ? '' : 'MISSED: ') + m) }
  const tag = `s17-${size}-${role === 'admin' ? 'a' : 'm'}`
  const d = calDoor()
  try {
    // a fixture
    const before = new Set((await allRecs(page)).map(r => r.iid))
    await d.openNew(page, { iso: '2026-07-22', person: role === 'admin' ? me : undefined, type: 'Event', st: '10:00', en: '11:00', rmk: 'Some remark' }); await d.submit(page)
    const rec = (await allRecs(page)).find(r => !before.has(r.iid)); await closeAnyWin(page)
    for (const [dn, setup, S] of [
      ['window', async () => { await d.openSaved(page, rec) }, { title: 'input#inpEditTitle', type: '#inpEditType', rmk: '#inpEditRmk', save: '#inpEditSave', cancel: '#inpEditCancel' }],
      ['List pencil', async () => { await penDoor.openSaved(page, rec) }, { title: '#inBody tr.ined input[data-ed="title"]', type: '#inBody tr.ined select[data-ed="type"]', rmk: '#inBody tr.ined input[data-ed="remarks"]', save: '#inBody tr.ined [data-save]', cancel: '#inBody tr.ined [data-cancel]' }],
    ]) {
      await setup(); await sleep(page, 300)
      const reach = {}
      for (const k of ['title', 'type', 'rmk', 'save', 'cancel']) {
        const before0 = await inView(page, S[k]).catch(() => null)
        await page.locator(S[k]).first().scrollIntoViewIfNeeded().catch(() => {}); await sleep(page, 120)
        const after = await inView(page, S[k]).catch(() => null)
        reach[k] = { first: before0 && before0.inside, after: after && after.inside, hit: after && after.hit }
      }
      const bad = Object.entries(reach).filter(([k, v]) => !(v.after && v.hit))
      need(bad.length === 0, `${dn}: after scrolling, every one of Title, Type, Remarks, Save, Cancel is on screen and is what a press lands on (${Object.entries(reach).map(([k, v]) => k + ':' + (v.first ? 'in view at open' : 'scrolled to') + (v.after && v.hit ? '' : ' NOT REACHED')).join(', ')})`)
      // Tab from Title
      await page.locator(S.title).first().scrollIntoViewIfNeeded(); await page.locator(S.title).first().focus()
      const path = []
      for (let i = 0; i < 45; i++) {
        await page.keyboard.press('Tab'); await sleep(page, 60)
        const a = await page.evaluate(() => { const e = document.activeElement; if (!e) return null; const r = e.getBoundingClientRect(); return { id: e.id || e.getAttribute('data-ed') || e.getAttribute('data-save') !== null && 'save' || e.getAttribute('data-cancel') !== null && 'cancel' || e.getAttribute('aria-label') || e.tagName, vis: r.top >= -1 && r.bottom <= innerHeight + 1, w: r.width } })
        path.push(a)
        if (path.some(x => x && /inpEditSave|^save$/.test(String(x.id))) && path.some(x => x && /inpEditCancel|^cancel$/.test(String(x.id)))) break
        if (a && a.id === 'BODY') break
      }
      const names = path.map(x => x && x.id)
      const sawSave = path.find(x => x && /inpEditSave|^save$/.test(x.id)), sawCancel = path.find(x => x && /inpEditCancel|^cancel$/.test(x.id))
      const uniq = names.filter((x, i) => x && x !== names[i - 1])
      say.push(`NOTE ${dn}: Tab from the Title box ${sawSave && sawCancel ? 'reached both Save and Cancel' : 'did NOT reach ' + [!sawSave && 'Save', !sawCancel && 'Cancel'].filter(Boolean).join(' and ')}: ${uniq.join(' > ')}`)
      say.push(`NOTE ${dn}: Tab stops that were off screen: ${path.filter(x => x && x.id !== 'BODY' && !x.vis).map(x => x.id).join(', ') || 'none'}`)
      // type in the Title: the active field stays visible
      await page.locator(S.title).first().click(); await page.keyboard.press('Control+A'); await page.keyboard.type('Short screen title')
      const act = await inView(page, S.title)
      need(act.inside, `${dn}: the active Title box is on screen while typing (top ${act.top}, bottom ${act.bottom}, screen ${act.vh}px)`)
      pics.push(await shot(page, `${tag}-${dn === 'window' ? 'win' : 'pen'}-typing`))
      // save: the result is visible
      await page.locator(S.save).first().scrollIntoViewIfNeeded()
      await press(page, page.locator(S.save).first()); await sleep(page, 700)
      const sh = page.locator('[data-testid="oilconf"]'); if (await sh.count()) { await press(page, sh.locator('[data-testid="oil-no"]')); await press(page, sh.locator('[data-testid="oilconf-save"]')); await sleep(page, 500) }
      const s = (await recs(page, { iid: rec.iid }))[0]
      const toast = norm(await page.locator('#toastEl').innerText().catch(() => ''))
      const toastIn = await inView(page, '#toastEl').catch(() => null)
      need(s.title === 'Short screen title', `${dn}: saved - stored title "${s.title}"; the screen said "${toast}"${toastIn ? (toastIn.inside ? ' (on screen)' : ' (NOT on screen)') : ''}`)
      pics.push(await shot(page, `${tag}-${dn === 'window' ? 'win' : 'pen'}-saved`))
      await closeAnyWin(page)
      // reset the title for the next door
      if (dn === 'window') { await d.openSaved(page, rec); await page.fill('#inpEditTitle', 'Event'); await press(page, page.locator('#inpEditSave')); await sleep(page, 500); await closeAnyWin(page) }
    }
    // Enter in the window's Title box saves once (a new input, then a saved one)
    const n0 = (await allRecs(page)).length
    await d.openNew(page, { iso: '2026-07-23', person: role === 'admin' ? me : undefined, type: 'Event', st: '12:00', en: '13:00' })
    await page.locator('input#inpEditTitle').click(); await page.keyboard.press('Control+A'); await page.keyboard.type('Enter once')
    await page.keyboard.press('Enter'); await sleep(page, 1500)
    const n1 = (await allRecs(page)).filter(r => r.title === 'Enter once')
    need(n1.length === 1 && (await allRecs(page)).length === n0 + 1, `Enter in the new window's Title box added ${n1.length} input titled "Enter once" (${n0} to ${(await allRecs(page)).length} inputs)`)
    { const open2 = (await win(page).count()) > 0; const head = open2 ? norm(await win(page).locator('.win-title, .win-h, header').first().innerText().catch(() => '')) : ''; say.push(`NOTE after that one Enter ${open2 ? 'a window is open again (' + head + ') - a blank New input' : 'the window closed'}`) }
    pics.push(await shot(page, `${tag}-enter-new`))
    await closeAnyWin(page)
    await d.openSaved(page, n1[0])
    await page.locator('input#inpEditTitle').click(); await page.keyboard.press('Control+A'); await page.keyboard.type('Enter twice?')
    await page.keyboard.press('Enter'); await sleep(page, 1500)
    const all2 = await allRecs(page)
    need(all2.length === n0 + 1 && all2.find(r => r.iid === n1[0].iid).title === 'Enter twice?', `Enter on a saved input's window saved it once, no second input (${all2.length} inputs, title "${all2.find(r => r.iid === n1[0].iid).title}")`)
  } catch (e) { ok = false; say.push('SCRIPT ERROR ' + String(e.message).split('\n').slice(0, 5).join(' | ')); await shot(page, `${tag}-err`).catch(() => {}) }
  T.add({ n: 17, size: page.sizeName, role: role === 'admin' ? 'admin' : 'member (Ranger)', verdict: ok ? 'PASS' : 'FAIL', say: say.join(' · '), pics })
  T.save()
  await ctx.close()
}
await browser.close()
console.log('errors', JSON.stringify([...new Set(errs)].slice(0, 8)))
