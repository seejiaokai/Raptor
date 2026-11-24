// right-e2 - case E(2): a right taken away by another tab while a window is open.
// One browser, two pages of it (two tabs). Tab B: Saber gives Hunter Plan of 149 (Admin → Users). Tab A: Hunter signs in,
// picks 149, opens an input on 149's Inputs and types in its Remarks. Tab B: Saber takes the Plan away again (149 → None,
// Save). Tab A is brought to the front (as a person switching back to it), and what it shows is read; then the window's
// own Save is pressed. What tab B shows after tab A's sign-in is read too (the two tabs share the browser's storage).
// No stand-in beyond the second tab itself, which the brief names.
//   node raptor-port/scripts/handpass/n166/right-e2.mjs <d|402x874>
// Pictures: E2-<d|p>-*.png
import { mk, closeAll, FACT, signIn, barSq, pageOn, go, pic, windowsNow, roleNow, reachPick, wait, bands, boxOf, covered, URL_, SZTAG } from './lib.mjs'
const SZ = process.argv[2] || 'd', T = SZTAG(SZ), k = `E2.${T}`, P = `E2-${T}`
const WORDS = 'N166E2 words'
const vis = (s, sel) => s.page.locator(sel).filter({ visible: true })
async function hit(s, l, ms = 400) { l = typeof l === 'string' ? vis(s, l).first() : l; await l.scrollIntoViewIfNeeded().catch(() => {}); if (s.desk) await l.click({ timeout: 8000 }); else await l.tap({ timeout: 8000 }); await wait(s, ms) }
const lineBtn = (n, v) => `[data-testid="acc-sq"] [aria-label="Access to ${n}"] button[data-line="${v}"]`
const who = async s => (await vis(s, '#luser').count()) ? 'sign-in card' : ((await roleNow(s)).badge || (await s.page.evaluate(() => document.querySelector('#drawerAcct')?.textContent.trim() ?? '?')))
async function setLine(s, line) {
  await go(s, 'admin'); await wait(s, 600)
  if (await vis(s, '.adm-back').count()) await hit(s, '.adm-back')
  const t = vis(s, '#page-admin button.adm-cat').filter({ hasText: /^Users/ }); if (await t.count()) await hit(s, t.first(), 600)
  const r = s.page.locator('[data-person="prowler"] .acc-tap').first(); await r.scrollIntoViewIfNeeded()
  const b = await r.boundingBox(); if (s.desk) await s.page.mouse.click(b.x + 40, b.y + b.height / 2); else await s.page.touchscreen.tap(b.x + 40, b.y + b.height / 2)
  await s.page.waitForSelector('[data-testid="acc-sq"]', { timeout: 8000 }); await wait(s, 300)
  const btn = vis(s, lineBtn('149', line)).first(); await hit(s, btn, 300)
  await hit(s, '#accEdSave', 800)
}
try {
  console.log('right-e2 v1', SZ)
  const A = await mk(SZ)
  const B = { ...A, page: await A.ctx.newPage() }
  B.page.on('dialog', d => d.dismiss().catch(() => {}))
  await signIn(B, 'ad', 'a')
  await setLine(B, 'plan'); FACT(`${k}.tabB.planGiven`, true)
  await A.page.bringToFront()
  await signIn(A, 'ad2', 'a2')
  FACT(`${k}.tabA.signedIn`, await who(A))
  await B.page.bringToFront(); await wait(B, 800)
  FACT(`${k}.tabB.afterTabASignIn`, await who(B))
  await A.page.bringToFront(); await wait(A, 500)
  const p = await reachPick(A, 149, 'bar'); FACT(`${k}.tabA.pick149`, { pressed: !!p.pressed, squadron: await barSq(A) })
  await go(A, 'inputs'); await wait(A, 600)
  if (await vis(A, '#inListBtn[aria-pressed="false"]').count()) await hit(A, '#inListBtn')
  if (!/All dates/.test((await A.page.locator('#inRangeBtn').first().textContent().catch(() => '')) || '')) { await hit(A, '#inRangeBtn'); if (await A.page.locator('#inRangeAll').count()) await hit(A, A.page.locator('#inRangeAll').first()); if (await vis(A, '#inRangeAll').count()) await hit(A, '#inRangeBtn') }
  const row = vis(A, '#inBody tr[data-iid], #inList [data-iid]').filter({ hasNotText: /Hunter/ }).first()
  FACT(`${k}.tabA.input`, (await row.innerText({ timeout: 5000 })).replace(/\s+/g, ' ').slice(0, 40))
  const o = row.locator('[data-testid="in-open"]'); await hit(A, (await o.count()) ? o.first() : row, 700)
  const r = vis(A, '#inpEditRmk').first(); await r.click(); await A.page.keyboard.press('Control+a'); await A.page.keyboard.type(WORDS)
  FACT(`${k}.tabA.windowOpen`, (await windowsNow(A)).map(x => x.what))
  /* tab B: the Plan taken away */
  await B.page.bringToFront(); await wait(B, 600)
  if ((await who(B)) === 'sign-in card') { await signIn(B, 'ad', 'a'); FACT(`${k}.tabB.signedInAgain`, 'Saber had to sign in again in tab B') }
  FACT(`${k}.tabB.who`, await who(B))
  await setLine(B, 'none')
  /* read back: Hunter's row opened again in tab B, which of 149's buttons is pressed */
  { const r2 = B.page.locator('[data-person="prowler"] .acc-tap').first(); if (!(await vis(B, '[data-testid="acc-sq"]').count())) { const b2 = await r2.boundingBox(); await B.page.mouse.click(b2.x + 40, b2.y + b2.height / 2); await wait(B, 600) }
    FACT(`${k}.tabB.hunter149LineNow`, await B.page.evaluate(() => [...document.querySelectorAll('[data-testid="acc-sq"] [aria-label="Access to 149"] button[data-line]')].filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.textContent.trim()))) }
  await pic(B, `${P}-0-tabB-after-taking-plan`)
  /* back to tab A */
  await A.page.bringToFront(); await A.page.evaluate(() => { window.dispatchEvent(new Event('focus')) }).catch(() => {}); await wait(A, 1500)
  FACT(`${k}.tabA.afterBack`, { who: await who(A), squadron: await barSq(A), page: await pageOn(A), bands: await bands(A) })
  FACT(`${k}.tabA.afterBack.windows`, (await windowsNow(A)).map(x => ({ what: x.what, words: x.words.slice(0, 140), buttons: x.buttons.slice(0, 8), inert: x.inert })))
  FACT(`${k}.tabA.afterBack.typed`, await A.page.evaluate(() => [...document.querySelectorAll('#inpEditRmk')].find(e => e.getBoundingClientRect().width > 0)?.value ?? null))
  await pic(A, `${P}-1-tabA-after-plan-taken`)
  const sv = await boxOf(A, '#inpEditSave')
  if (sv && (await covered(A, '#inpEditSave')) === 'free') {
    if (A.desk) await A.page.mouse.click(sv.x + sv.w / 2, sv.y + sv.h / 2); else await A.page.touchscreen.tap(sv.x + sv.w / 2, sv.y + sv.h / 2)
    await wait(A, 1200)
    for (let i = 0; i < 2; i++) { const nd = vis(A, 'button').filter({ hasText: /^No document$/ }); if (await nd.count()) { FACT(`${k}.tabA.save.askedDocument`, true); await hit(A, nd.first(), 700) } }
    FACT(`${k}.tabA.save.after`, { squadron: await barSq(A), bands: await bands(A), windows: (await windowsNow(A)).map(x => x.what + ': ' + x.words.slice(0, 110)), toast: await A.page.evaluate(() => { const t = document.getElementById('toastEl'); return t && getComputedStyle(t).opacity !== '0' ? t.textContent.trim() : null }) })
    FACT(`${k}.tabA.save.storedWords`, await A.page.evaluate(w => { const o = []; for (let i = 0; i < localStorage.length; i++) { const kk = localStorage.key(i); if ((localStorage.getItem(kk) || '').includes(w)) o.push(kk) } return o }, WORDS))
    await pic(A, `${P}-2-tabA-after-save`)
  } else FACT(`${k}.tabA.save`, sv ? 'Save covered: ' + await covered(A, '#inpEditSave') : 'no Save drawn')
  /* and a reload of tab A, as a person would after it */
  await A.page.reload(); await wait(A, 2500)
  FACT(`${k}.tabA.afterReload`, { who: await who(A), squadron: await barSq(A).catch(() => null) })
} catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 160)); process.exitCode = 1 } finally { await closeAll() }
