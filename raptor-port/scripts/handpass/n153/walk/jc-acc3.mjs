// jc-acc3 - S32 (promotion ends each right, the recipient's bell) and S33 (demotion, a deliberate regrant, Undo and Redo against the bell).
import { signIn, newPage, closeAll, finish, step, pic, picsFor, note, check, facts, as } from './jlib.mjs'
import { toast, tips, who, editRow, saveRow, toUsers, doUndo, doRedo, bell } from './jc-lib.mjs'
import { makeThird } from './jc-third.mjs'
const SZ = process.env.SZ || 'd'
console.log('jc-acc3 v1', SZ)
picsFor('jc-acc3-' + SZ)
const rec = (k, v) => { facts[k] = v; note(`RECORD ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) }
const MADE = 'Made a master admin: full access to every squadron · Saber'
const OFF = 'Master admin taken off: full access to every squadron ended · Saber'
const PLANEND = 'Plan of 149 ended: master admin covers every squadron · Saber'
const VIEWEND = 'View of 150 ended: master admin covers every squadron · Saber'
const count = (L, w) => L.filter(x => x.includes(w)).length
const panelBtns = s => s.page.evaluate(() => { const l = document.querySelector('[data-testid="bell-list"]'); if (!l) return null; let p = l; for (let i = 0; i < 4 && p.parentElement; i++) { p = p.parentElement; if (p.querySelector('button')) break } return [...p.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0 && !b.closest('[data-testid="bell-list"]')).map(b => `${b.id ? '#' + b.id + ' ' : ''}${b.getAttribute('aria-pressed') !== null ? '[p=' + b.getAttribute('aria-pressed') + '] ' : ''}${b.textContent.replace(/\s+/g, ' ').trim()}`) })
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  await step('S32 setup', async () => {
    await makeThird(s); await toUsers(s)
    await editRow(s, 'prowler', [{ line: ['149', 'plan'] }, { line: ['150', 'view'] }]); await saveRow(s); await page.waitForTimeout(200)
    const w = await who(s, 'prowler', ['149', '150']); check('S32 setup Plan 149, View 150', w.lines['149'] === 'plan' && w.lines['150'] === 'view', w)
  })
  await step('S32 promote', async () => {
    await editRow(s, 'prowler', [{ role: 'master' }]); await saveRow(s); await page.waitForTimeout(200)
    rec('S32 promote hover', (await tips(s)).undo?.title)
    await as(s, 'ad2', 'a2')
    await bell.open(s); await page.waitForTimeout(300)
    const L = await bell.lines(s); rec('S32 Hunter bell', L); rec('S32 bell controls', await panelBtns(s)); await pic(s, 's32-1-hunter-bell')
    check('S32 made line once', count(L, MADE) === 1, L.filter(x => x.includes('master admin')))
    check('S32 Plan ended line once', count(L, PLANEND) === 1, L.filter(x => x.includes('149')))
    check('S32 View ended line once', count(L, VIEWEND) === 1, L.filter(x => x.includes('150')))
    await bell.close(s)
  })
  await step('S32 toggle every Show button, personal lines stay', async () => {
    await bell.open(s)
    const shows = page.locator('[data-testid="bell-show"] button, button[data-testid="bell-show"]').filter({ visible: true })
    const n = await shows.count(); rec('S32 Show buttons', await shows.allTextContents())
    check('S32 Show buttons drawn', n >= 2, n)
    const pressed = async () => shows.evaluateAll(b => b.map(x => `${x.textContent.trim()}:${x.getAttribute('aria-pressed')}`))
    rec('S32 Show start', await pressed())
    for (let i = 0; i < n; i++) {
      await shows.nth(i).click(); await page.waitForTimeout(250)
      const L = await bell.lines(s); rec(`S32 after Show press ${i}`, { p: await pressed(), lines: L.length })
      check(`S32 personal lines stay after Show ${i}`, count(L, MADE) === 1 && count(L, PLANEND) === 1 && count(L, VIEWEND) === 1, { lines: L.length, made: count(L, MADE) })
      await shows.nth(i).click(); await page.waitForTimeout(200)
    }
    /* every Show off that the app allows, together */
    for (let i = 0; i < n; i++) if ((await shows.nth(i).getAttribute('aria-pressed')) === 'true') { await shows.nth(i).click(); await page.waitForTimeout(160) }
    const off = await bell.lines(s); rec('S32 all off', { p: await pressed(), lines: off.length })
    check('S32 personal lines stay with all squadrons off', count(off, MADE) === 1 && count(off, PLANEND) === 1 && count(off, VIEWEND) === 1, off.length)
    if (!n) note('no Show button was drawn in the bell for this person')
    await pic(s, 's32-2-after-shows'); await bell.close(s)
  })
  await step('S33 ordinary demotion', async () => {
    await as(s, 'ad', 'a'); await toUsers(s)
    await editRow(s, 'prowler', [{ role: 'admin' }]); await saveRow(s); await page.waitForTimeout(200)
    const w = await who(s, 'prowler', ['149', '150']); rec('S33 demoted', w)
    check('S33 old Plan not restored', w.role === 'admin' && w.lines['149'] === 'none' && w.lines['150'] === 'none', w)
    await as(s, 'ad2', 'a2'); await bell.open(s)
    const L = await bell.lines(s); rec('S33 Hunter bell after demotion', L); await pic(s, 's33-1-bell-demoted')
    check('S33 off line once', count(L, OFF) === 1, L.filter(x => /master/i.test(x)))
    await bell.close(s)
  })
  await step('S33 demotion with Plan granted in the same Save', async () => {
    await as(s, 'ad', 'a'); await toUsers(s)
    await editRow(s, 'prowler', [{ role: 'master' }]); await saveRow(s); await page.waitForTimeout(200)
    await editRow(s, 'prowler', [{ role: 'admin' }, { line: ['149', 'plan'] }]); await pic(s, 's33-2-demote-regrant'); await saveRow(s); await page.waitForTimeout(200)
    rec('S33 regrant hover', (await tips(s)).undo?.title)
    const w = await who(s, 'prowler', ['149', '150']); rec('S33 regrant', w); check('S33 Plan 149 held', w.role === 'admin' && w.lines['149'] === 'plan', w)
    await as(s, 'ad2', 'a2'); await bell.open(s)
    const L = await bell.lines(s); rec('S33 Hunter bell after regrant', L); await pic(s, 's33-3-bell-regrant')
    check('S33 regrant announced', L.some(x => /Given Plan of 149/.test(x)), L.filter(x => /149/.test(x)))
    await bell.close(s)
  })
  await s.ctx.close()
  /* Undo and Redo of a promotion, before and after the notice was read */
  for (const readFirst of [false, true]) {
    const t = readFirst ? 'read-first' : 'unread'
    const s2 = await newPage(SZ); const p2 = s2.page
    await signIn(s2, 'ad', 'a')
    await step(`S33 undo of promotion, ${t}`, async () => {
      await toUsers(s2); await editRow(s2, 'prowler', [{ line: ['149', 'plan'] }]); await saveRow(s2); await p2.waitForTimeout(150)
      await editRow(s2, 'prowler', [{ role: 'master' }]); await saveRow(s2); await p2.waitForTimeout(150)
      if (readFirst) {
        await as(s2, 'ad2', 'a2'); await bell.open(s2); const R = await bell.lines(s2); rec(`S33 ${t} Hunter read`, R)
        const m = p2.locator('button', { hasText: 'Mark all read' }).filter({ visible: true }); if (await m.count()) await m.first().click(); await p2.waitForTimeout(200); await bell.close(s2)
        await as(s2, 'ad', 'a'); await toUsers(s2)
        rec(`S33 ${t} Saber undo offered after signing back in`, await tips(s2))
      }
      const offered = (await tips(s2)).undo
      if (offered?.off) { rec(`S33 ${t} no Undo offered`, offered) } else {
        await doUndo(s2); rec(`S33 ${t} Undo bubble`, await toast(s2))
        const w = await who(s2, 'prowler', ['149']); check(`S33 ${t} Undo restored Plan 149`, w.role === 'admin' && w.lines['149'] === 'plan', w)
        await as(s2, 'ad2', 'a2'); await bell.open(s2); const L = await bell.lines(s2)
        rec(`S33 ${t} Hunter bell after Undo`, L); await pic(s2, `s33-4-${t}-after-undo`)
        check(`S33 ${t} no active Made line after Undo`, count(L, MADE) === 0, L.filter(x => /master/i.test(x)))
        check(`S33 ${t} no active Plan-ended line after Undo`, count(L, PLANEND) === 0, L.filter(x => /149/.test(x)))
        await bell.close(s2)
        await as(s2, 'ad', 'a'); await toUsers(s2)
        const again = await tips(s2); rec(`S33 ${t} Redo after signing back in`, again.redo)
        if (!again.redo?.off) {
          await doRedo(s2); rec(`S33 ${t} Redo bubble`, await toast(s2))
          const r = await who(s2, 'prowler', ['149']); check(`S33 ${t} Redo made master`, r.role === 'master', r)
          await as(s2, 'ad2', 'a2'); await bell.open(s2); const M = await bell.lines(s2); rec(`S33 ${t} Hunter bell after Redo`, M); await pic(s2, `s33-5-${t}-after-redo`)
          check(`S33 ${t} Made back once after Redo`, count(M, MADE) === 1, M.filter(x => /master/i.test(x)))
          await bell.close(s2)
        }
      }
    })
    await s2.ctx.close()
  }
} finally { finish('jc-acc3-' + SZ); await closeAll() }
