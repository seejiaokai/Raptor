// k0p-cde - Part 2 C (Quals' Done with words left in "Add qualification"), D (150's "+ Input" Person list as Saber),
// E (a Retry that lands, with ?savefail). Desktop, Saber.
import { mk, signIn, go, pick, FACT, closeAll, world, wait, ERRS, shot, boxOf, vis, hit, toastNow, URL_ } from './k0p-lib.mjs'
console.log('k0p-cde v2')
const only = process.env.ONLY || 'cde'
async function C() {
  const s = await mk('d', { storageState: await world() })
  try {
    await signIn(s, 'saber'); await go(s, 'quals'); await wait(s, 700)
    await hit(s, '#qEdit', 500); await hit(s, '#qEditQuals', 500)
    await s.page.fill('#qNewQual', 'LOW LEVEL'); await wait(s, 200)
    await shot(s, 'c-1-typed-d', [await boxOf(s, '#qQualBar'), await boxOf(s, '#qSave')], 12)
    await hit(s, '#qSave', 300); const t = await toastNow(s); await wait(s, 400)
    FACT('c.done', { toast: t, boxDrawn: !!(await vis(s, '#qNewQual').count()), cols: await s.page.evaluate(() => [...document.querySelectorAll('.page.on th')].map(e => e.textContent.trim()).filter(x => /LOW/i.test(x))) })
    await hit(s, '#qEdit', 500); await hit(s, '#qEditQuals', 500)
    FACT('c.again142', await s.page.locator('#qNewQual').inputValue())
    await shot(s, 'c-2-edit-again-142-d', [await boxOf(s, '#qQualBar'), await boxOf(s, '#qSave')], 12)
    await hit(s, '#qSave', 600)
    FACT('c.pick149', await pick(s, 149)); await wait(s, 600)
    FACT('c.on', await s.page.evaluate(() => document.querySelector('.page.on')?.id))
    await hit(s, '#qEdit', 500); await hit(s, '#qEditQuals', 500)
    FACT('c.in149', await s.page.locator('#qNewQual').inputValue())
    await shot(s, 'c-3-edit-on-149-d', [await boxOf(s, '.topbar .mark'), await boxOf(s, '#qQualBar'), await boxOf(s, '#qSave')].filter(Boolean), 12)
    FACT('c.errs', s.errs)
  } catch (e) { FACT('c.error', String(e).slice(0, 300)) } finally { await s.ctx.close() }
}
async function D() {
  const s = await mk('d', { storageState: await world() })
  try {
    await signIn(s, 'saber'); FACT('d.pick150', await pick(s, 150))
    await go(s, 'inputs'); await wait(s, 700)
    if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn', 500)
    await hit(s, '#inNew', 900)
    const list = await s.page.evaluate(() => { const sel = document.querySelector('#inpEditPerson'); if (!sel) return { kind: 'no #inpEditPerson', picker: [...document.querySelectorAll('.floatwin [data-testid*="person"], .floatwin .pp-row')].slice(0, 30).map(e => e.textContent.trim()) }; const out = []; for (const c of sel.children) { if (c.tagName === 'OPTGROUP') { out.push('[group] ' + c.label); for (const o of c.children) out.push('   ' + o.textContent.trim() + (o.selected ? ' (picked)' : '')) } else out.push(c.textContent.trim() + (c.selected ? ' (picked)' : '')) } return { kind: 'select', options: out } })
    FACT('d.personList', list)
    FACT('d.window', await s.page.evaluate(() => [...document.querySelectorAll('.floatwin')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 120))))
    await shot(s, 'd-1-input-window-d', [await boxOf(s, '.floatwin.inpedwin'), await boxOf(s, '#inpEditPerson')].filter(Boolean), 10)
    /* the list drawn open for the picture: the page's own select shown expanded (its size set to its length - a drawing
       aid, since a native list's open drop-down is drawn by the system, outside the page, and a picture cannot hold it) */
    const n = await s.page.evaluate(() => { const sel = document.querySelector('#inpEditPerson'); if (!sel) return 0; sel.size = Math.min(sel.options.length + sel.querySelectorAll('optgroup').length, 24); sel.style.height = 'auto'; sel.style.position = 'relative'; sel.style.zIndex = 5000; return sel.size })
    FACT('d.expandedRows', n)
    await wait(s, 300)
    await shot(s, 'd-2-person-list-open-d', [await boxOf(s, '#inpEditPerson')], 12)
    FACT('d.errs', s.errs)
  } catch (e) { FACT('d.error', String(e).slice(0, 300)) } finally { await s.ctx.close() }
}
async function E() {
  const s = await mk('d', { storageState: await world() })
  try {
    await signIn(s, 'saber', '?savefail'); await go(s, 'editsched'); await wait(s, 900)
    FACT('e.url', s.page.url())
    /* one change: the first day's note box (the week's own text box), typed */
    const ed = await s.page.evaluate(() => { const c = [...document.querySelectorAll('#eWeek .ah-note.txed')].filter(e => e.getBoundingClientRect().width > 0); return c.slice(0, 5).map(e => (e.id || '') + '|' + (e.dataset.k || e.getAttribute('data-key') || '') + '|' + e.tagName + '|' + (e.getAttribute('placeholder') || e.textContent || '').slice(0, 20)) })
    FACT('e.editables', ed)
    const box = s.page.locator('#eWeek .ah-note.txed').filter({ visible: true }).first()
    await box.click(); await s.page.keyboard.press('End'); await s.page.keyboard.type(' K0P'); await s.page.keyboard.press('Tab'); await wait(s, 1500)
    const band1 = await s.page.evaluate(() => [...document.querySelectorAll('.saveband, [data-testid*="saveband"], [role=alert]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()))
    const undo1 = await s.page.evaluate(() => { const u = [...document.querySelectorAll('#undoBtn')].find(e => e.getBoundingClientRect().width > 0); return u ? { title: u.title || u.getAttribute('aria-label'), disabled: u.disabled } : null })
    FACT('e.afterChange', { band: band1, undo: undo1 })
    await shot(s, 'e-1-not-saved-d', [await boxOf(s, '.topbar'), await boxOf(s, '.saveband')].filter(Boolean), 6)
    const retry = vis(s, 'button').filter({ hasText: /^Retry$/ })
    FACT('e.retryDrawn', await retry.count())
    if (await retry.count()) { await retry.first().click(); await wait(s, 1500) }
    const band2 = await s.page.evaluate(() => [...document.querySelectorAll('.saveband, [data-testid*="saveband"], [role=alert]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()))
    await s.page.hover('#undoBtn').catch(() => {}); await wait(s, 600)
    const undo2 = await s.page.evaluate(() => { const u = [...document.querySelectorAll('#undoBtn')].find(e => e.getBoundingClientRect().width > 0); const tip = [...document.querySelectorAll('[role=tooltip], .tip, .hovertip')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim()); return u ? { title: u.title || u.getAttribute('aria-label'), tip } : null })
    FACT('e.afterRetryWithSwitch', { band: band2, undo: undo2 })
    await shot(s, 'e-2-retry-refused-d', [await boxOf(s, '.topbar'), await boxOf(s, '.saveband')].filter(Boolean), 6)
    /* the switch cannot be taken off inside the tab (storage/boot.ts: the refusing store is fixed when the tab opens);
       the only way is the link without it - a reload */
    await s.page.goto(URL_); await wait(s, 1500)
    const signedIn = await s.page.locator('#luser').count()
    FACT('e.afterReloadWithout', { signInAsked: !!signedIn })
    if (signedIn) { await s.page.fill('#luser', 'ad'); await s.page.fill('#lpass', 'a'); await s.page.click('#loginForm button[type=submit]'); await s.page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 30000 }); await wait(s, 800) }
    await go(s, 'editsched'); await wait(s, 800)
    FACT('e.afterReload', { band: await s.page.evaluate(() => [...document.querySelectorAll('.saveband')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.innerText.trim())), retry: await vis(s, 'button').filter({ hasText: /^Retry$/ }).count(), changeKept: await s.page.evaluate(() => document.querySelector('#eWeek')?.innerText.includes('K0P')), undo: await s.page.evaluate(() => { const u = [...document.querySelectorAll('#undoBtn')].find(e => e.getBoundingClientRect().width > 0); return u ? { title: u.title || u.getAttribute('aria-label'), disabled: u.disabled } : null }) })
    await shot(s, 'e-3-after-reload-d', [await boxOf(s, '.topbar')], 6)
    FACT('e.errs', s.errs)
  } catch (e) { FACT('e.error', String(e).slice(0, 300)) } finally { await s.ctx.close() }
}
try { if (only.includes('c')) await C(); if (only.includes('d')) await D(); if (only.includes('e')) await E() } finally { FACT('errors', ERRS); await closeAll() }
