// p5-n3 - P5 case N3 (the build plan's §8.3): a press that is not a bell line bringing his own squadron back.
// SET-UP by presses (Saber, desktop): Admin → Users: Ranger's row → 149 "View" → Save; Inputs → New: Ranger, Duty, Tue 8 Dec
// 2026 → Save; Ranger's row → Archive; the archived fold → Ranger → Restore (so his next sign-in shows "Welcome back").
// Then Ranger (us, a member of 142 with View of 149), each variant in a fresh browser with that saved data:
//   welcome          - 149 picked; the "Welcome back" card's "Check my quals" pressed: the bar, the page, what opened
//   welcome-notsaved - the same, but first, on 142, his own 8 Dec input opened, Remarks changed, Save pressed with storage
//                      refusing writes (the failed-save stand-in, p2-save's) → "Not saved"; then 149 picked, then the press
//   undo             - on 142, his own input's Remarks changed and saved; 149 picked; Undo pressed
//   undo-notsaved    - as undo, then a second change whose Save fails (the stand-in); 149 picked; Undo pressed
// STAND-INS, named in the FACT lines: the set-up's saved data copied into each fresh browser; storage refusing every write
// (localStorage.setItem throws) from just before the failing Save, left on.
//   node raptor-port/scripts/handpass/n175/p5-n3.mjs <d|p>     (ONLY=welcome,welcome-notsaved,undo,undo-notsaved)
// Pictures: p5-n3-<variant>-<d|p>-1-before-press, -2-after-press
import { writeFileSync } from 'node:fs'
import { mk, closeAll, FACT, signIn, go, wait, vis, hit, shot, scratch, reachPick, barSq, pageOn, windowsNow, roleNow, toastNow, bands, covered, tmpDir } from './lib.mjs'
const SZ = process.argv[2] || 'd'; const SEC = 'p5'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const via = s => (s.desk ? 'bar' : 'menu')
const role = async s => { const r = await roleNow(s); return r.badge || r.menuLine }
const card = s => s.page.evaluate(() => { const e = [...document.querySelectorAll('#welcomeBack')].find(x => x.getBoundingClientRect().width > 0); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null })
const undoBtn = s => s.page.evaluate(() => [...document.querySelectorAll('#undoBtn')].filter(e => e.getBoundingClientRect().width > 0).map(b => (b.textContent.trim() || '?') + ' | ' + (b.getAttribute('title') || b.getAttribute('aria-label') || '') + (b.disabled ? ' [greyed]' : ' live'))[0] || 'not drawn')
const tabs = s => s.page.evaluate(() => [...new Set([...document.querySelectorAll('#topnav a[data-page], #drawerNav a[data-page]')].map(a => a.getAttribute('data-page')))].join(','))
const screen = async s => ({ squadron: await barSq(s), role: await role(s), page: await pageOn(s), tabs: await tabs(s), toast: await toastNow(s), bands: await bands(s), welcomeCard: await card(s), undo: await undoBtn(s), windows: (await windowsNow(s)).map(w => `${w.what}${w.inert ? ' [inert]' : ''}: ${w.words.slice(0, 120)}`) })
async function setup() {
  const TMP = tmpDir(SEC); const F = `${TMP}/state-n3.json`
  const s = await mk('d'); const { page } = s
  try {
    await signIn(s, 'ad', 'a')
    await go(s, 'admin'); await wait(s, 600)
    const t = vis(s, '#page-admin button.adm-cat').filter({ hasText: /^Users/ }); if (await t.count()) await hit(s, t.first(), 600)
    /* his duty on 8 Dec */
    await go(s, 'inputs'); await wait(s, 500)
    if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
    await hit(s, '#inNew', 600)
    const v = await page.evaluate(() => [...document.querySelector('#inpEditPerson').options].find(x => x.textContent.trim() === 'Ranger')?.value)
    await page.selectOption('#inpEditPerson', v); await page.selectOption('#inpEditType', 'Duty')
    const day = () => page.locator('.floatwin.inpedwin button[aria-label^="Tue 8 Dec 2026"]').first()
    for (let i = 0; i < 12 && !(await day().count()); i++) await hit(s, page.locator('.floatwin.inpedwin button[aria-label="Next month"]').first(), 250)
    await hit(s, day()); await page.fill('#inpEditRmk', 'n175 duty ranger'); await hit(s, '#inpEditSave', 600)
    for (let i = 0; i < 3; i++) { const nd = vis(s, 'button').filter({ hasText: /^No document$/ }); if (await nd.count()) await hit(s, nd.first()); if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk') }
    /* archive, then restore */
    await go(s, 'admin'); await wait(s, 600)
    if (await t.count()) await hit(s, t.first(), 600)
    await hit(s, page.locator('[data-person="bane"] .acc-tap').first(), 700)
    await hit(s, '#accEdArchive', 900); if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk', 700)
    FACT('p5.n3.setup.archived', await toastNow(s))
    if (await vis(s, '#accArchToggle[aria-expanded="false"]').count()) await hit(s, '#accArchToggle', 500)
    await hit(s, vis(s, '#accArchList .acc-tap').filter({ hasText: /Ranger/ }).first(), 700)
    await hit(s, '#accArRestore', 900); if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk', 700)
    FACT('p5.n3.setup.restored', await toastNow(s))
    /* View of 149, given AFTER the restore (a restore does not carry it back - the first run's finding) */
    await go(s, 'admin'); await wait(s, 600)
    if (await t.count()) await hit(s, t.first(), 600)
    await page.locator('[data-person="bane"] .acc-tap').first().click(); await page.waitForSelector('[data-testid="acc-sq"]', { timeout: 8000 })
    const b = page.locator('[data-testid="acc-sq"] [aria-label="Access to 149"] button[data-line="view"]'); if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click()
    await page.locator('#accEdSave').click(); await wait(s, 700); FACT('p5.n3.setup.rangerView149', await toastNow(s))
    await wait(s, 600); writeFileSync(F, JSON.stringify(await s.ctx.storageState()))
    await scratch(s, SEC, 'n3-setup-end')
  } finally { await s.ctx.close().catch(() => {}) }
  return F
}
async function openOwn(s) {
  await go(s, 'inputs'); await wait(s, 600)
  if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
  if (!/All dates/.test((await s.page.locator('#inRangeBtn').first().textContent().catch(() => '')) || '')) { await hit(s, '#inRangeBtn'); if (await s.page.locator('#inRangeAll').count()) await hit(s, s.page.locator('#inRangeAll').first()); if (await vis(s, '#inRangeAll').count()) await hit(s, '#inRangeBtn') }
  const row = vis(s, '#inBody tr[data-iid], #inList [data-iid]').filter({ hasText: /n175 (duty ranger|N3)/ }).first()
  const o = row.locator('[data-testid="in-open"]'); await hit(s, (await o.count()) ? o.first() : row, 800)
}
async function saveRemark(s, w) {
  const rm = vis(s, '#inpEditRmk').first()
  if (s.desk) { await rm.click(); await s.page.keyboard.press('Control+a'); await s.page.keyboard.type(w) } else await rm.evaluate((e, w) => { const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'value').set; set.call(e, w); e.dispatchEvent(new Event('input', { bubbles: true })) }, w)
  await hit(s, '#inpEditSave', 1500)
  for (let i = 0; i < 2; i++) { const nd = vis(s, 'button').filter({ hasText: /^No document$/ }); if (await nd.count()) await hit(s, nd.first()); if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk') }
  await wait(s, 800)
}
const refuse = s => s.page.evaluate(() => { window.__n175 = { real: Storage.prototype.setItem }; Storage.prototype.setItem = function () { throw new DOMException('The quota has been exceeded.', 'QuotaExceededError') } })
async function run(F, v) {
  const k = `p5.n3.${v}.${SZ}`, P = `p5-n3-${v}-${SZ}`
  const s = await mk(SZ, { storageState: F })
  try {
    await signIn(s, 'us', 'us')
    FACT(`${k}.0.signedIn`, await screen(s))
    if (v === 'welcome-notsaved' || v === 'undo-notsaved' || v === 'undo') {
      await openOwn(s)
      if (v !== 'welcome-notsaved') { await saveRemark(s, 'n175 N3 first change'); FACT(`${k}.1.firstSave`, await screen(s)); if (v === 'undo-notsaved') await openOwn(s) }
      if (v !== 'undo') {
        await refuse(s); FACT(`${k}.standIn`, 'storage refuses every write (localStorage.setItem throws) from just before this Save, left on')
        await saveRemark(s, 'n175 N3 not saved')
        FACT(`${k}.1.failedSave`, await screen(s))
        const c = vis(s, '#inpEditCancel, #inpEditClose').first(); if (await c.count()) { await hit(s, c, 500); FACT(`${k}.1.windowClosedWith`, 'its own Cancel/✕'); FACT(`${k}.1.afterClose`, await screen(s)) }
      }
    }
    const p = await reachPick(s, 149, via(s))
    FACT(`${k}.2.pick149`, { control: p.control, covered: p.covered, rows: p.listRows, pressed: !!p.pressed })
    FACT(`${k}.2.on149`, await screen(s))
    const ctl = v.startsWith('welcome') ? '#welcomeCheck' : '#undoBtn'
    await shot(s, `${P}-1-before-press`, [ctl, s.desk ? '#sqnMenuBtn' : '.topbar .mark'], null, 24)
    const cov = await covered(s, ctl)
    FACT(`${k}.3.control`, { control: ctl === '#welcomeCheck' ? 'Check my quals' : 'Undo', covered: cov })
    if (cov === 'free') {
      await hit(s, ctl, 1200)
      FACT(`${k}.3.afterPress`, await screen(s))
      FACT(`${k}.3.qualsRow`, await s.page.evaluate(() => { const p = document.querySelector('#page-quals'); if (!p || !p.classList.contains('on')) return 'Quals not in view'; const o = [...p.querySelectorAll('.outline, [data-focus], .focus, .qrow.open, [aria-expanded="true"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 80)); return o.length ? o : (p.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 160) }))
      await shot(s, `${P}-2-after-press`, [s.desk ? '#sqnMenuBtn' : '.topbar .mark', '.saveband, #toastEl'], null, 24)
    }
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('p5-n3 v1', SZ)
  const F = await setup()
  for (const v of (ONLY.length ? ONLY : ['welcome', 'welcome-notsaved', 'undo', 'undo-notsaved'])) await run(F, v)
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
