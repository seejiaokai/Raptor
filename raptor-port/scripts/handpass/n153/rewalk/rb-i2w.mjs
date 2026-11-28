// rb-i2w v1 - two follow-ups to item 2 and 3. (w) a LEAVE WAR line on his bell pressed over the held draft: asked, Stay, and does
// anything of the line stay behind? (r) after a refused Save in the member view: what the Tracker's bar says back in the admin
// view, and whether its own Save then writes to 149 alone. SZ=d|p  ONLY=w|r
import { finish, closeAll, picsFor, step, go, mk, signIn, grant, as, ask, hasEv, trackerSaved, layoutDiff } from './rlib.mjs'
import { Q, answerable, shortQ, where, heldDraft, hunterOn149, answerQ, SAVE, DISCARD, STAY, roleSwitch, wait, note, check, pic, pickSq, shut } from './rb-lib.mjs'
import { bell } from '../walk/jc-lib.mjs'
const SZ = process.env.SZ || 'd', ONLY = process.env.ONLY || ''
const tag = `rb-i2w-${SZ}${ONLY ? '-' + ONLY : ''}`
console.log('rb-i2w v1', SZ, ONLY, process.env.MQ_PORT)
picsFor(tag)
const q = t => `[data-testid="${t}"]`
const DAY = '2026-12-15'
const tapIt = async (s, loc) => { const l = typeof loc === 'string' ? s.page.locator(loc).filter({ visible: true }).first() : loc; if (s.desk) await l.click(); else await l.tap(); await s.page.waitForTimeout(320) }
const visible = (s, sel) => s.page.locator(sel).filter({ visible: true }).count().then(n => n > 0)
async function toDec(s) {
  await go(s, 'leavewar'); await shut(s); await s.page.waitForSelector(q('month-strip'), { timeout: 15000 }); await wait(s, 700)
  const w = s.page.locator(q('war-picker')).filter({ visible: true })
  if (await w.count()) { const v = await w.first().inputValue(); if (v !== 'y2026') { await s.page.selectOption(q('war-picker'), 'y2026'); await wait(s, 700) } }
  await tapIt(s, q('month-DEC')); await wait(s, 800)
}
const into = (s, sel) => s.page.evaluate(c => document.querySelector(c)?.scrollIntoView({ block: 'center', inline: 'center' }), sel)
const openList = async s => { for (let i = 0; i < 4 && !(await bell.isOpen(s)); i++) { await tapIt(s, s.page.locator('#notifyBell').filter({ visible: true }).first()); await wait(s, 250) } return bell.isOpen(s) }
const sheets = s => s.page.evaluate(() => [...document.querySelectorAll('[role="dialog"][data-testid]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 20 && r.height > 20 }).map(e => e.dataset.testid))

try {
  if (!ONLY || ONLY === 'w') await step('(w) a Leave War line over the held draft', async () => {
    const s = await mk(SZ); const { page } = s
    await signIn(s, 'ad', 'a')
    check('set-up: Plan of 149', await grant(s, 'prowler', '149', 'plan'), 'prowler')
    await toDec(s); await tapIt(s, q('open-chip')); await wait(s, 350)
    await tapIt(s, page.locator('[data-testid^="od-month-"]', { hasText: /dec/i }).filter({ visible: true }).first()); await wait(s, 250)
    if (await visible(s, q('od-apply'))) await tapIt(s, q('od-apply'))
    if (await visible(s, q('open-dates-close'))) await tapIt(s, q('open-dates-close')); await wait(s, 300)
    /* Hunter bids on his own row from the member view (his own bid window), Saber approves: a Leave War line on Hunter's bell */
    await as(s, 'ad2', 'a2'); await roleSwitch(s, 'x-mv'); await wait(s, 500); await toDec(s)
    const cell = q(`cell-prowler-${DAY}`); await into(s, cell); await wait(s, 300); await tapIt(s, cell); await wait(s, 450)
    check('set-up: his bid window opens', await visible(s, q('bid-picker')), await sheets(s))
    const ol = page.locator(`${q('bid-leave-grid')} button`, { hasText: /^OL/ }).filter({ visible: true }).first(); await tapIt(s, ol); await wait(s, 450)
    if (await visible(s, q('bid-picker')) && /again/i.test(await page.evaluate(p => document.querySelector(p)?.innerText || '', q('bid-picker')))) { await tapIt(s, ol); await wait(s, 450) }
    if ((await ask(s)).msg) await tapIt(s, '#dlgOk')
    if (await visible(s, q('bid-picker')) && await visible(s, q('bid-cancel'))) await tapIt(s, q('bid-cancel'))
    await roleSwitch(s, 'x-back'); await wait(s, 400)
    await as(s, 'ad', 'a'); await toDec(s)
    await tapIt(s, page.locator('[data-testid^="lw-tab-"]', { hasText: /Approvals/ }).filter({ visible: true }).first()); await wait(s, 500)
    const line = page.locator(q('appr-line-prowler')).filter({ hasText: '15 Dec' }).filter({ visible: true })
    check('set-up: Hunter on the Approvals list', (await line.count()) > 0, await line.count())
    const inner = line.first().locator(q('appr-approve')); if (await inner.count()) await tapIt(s, inner.first()); else { await tapIt(s, line.first()); await wait(s, 300); await tapIt(s, q('appr-approve')) }
    await wait(s, 450); if ((await ask(s)).msg) await tapIt(s, '#dlgOk')

    await as(s, 'ad2', 'a2'); await go(s, 'tracker'); await shut(s); await wait(s, 1800)
    await pickSq(s, '149'); await shut(s); await wait(s, 1100)
    await heldDraft(s, 'RB2W'); await pic(s, 'w01-held')
    check('the bell opens', await openList(s), await bell.lines(s).then(l => l.slice(0, 3)))
    const wl = page.locator('[data-testid="bell-list"] .bl-line').filter({ hasText: /15 Dec/ }).first()
    check('the Leave War line is on his bell', (await wl.count()) > 0, await bell.lines(s).then(l => l.slice(0, 3))); await pic(s, 'w02-bell')
    await tapIt(s, wl); await wait(s, 700)
    let qq = await Q(s), w = await where(s); await pic(s, 'w03-after-line'); note('after the line', JSON.stringify(shortQ(qq)), JSON.stringify(w), JSON.stringify(await sheets(s)))
    check('the line asks first', /Save them before switching to 142\?/.test(qq.msg || '') && answerable(qq), shortQ(qq))
    check('nothing of the line is open under the question', (await sheets(s)).length === 0 && w.page !== 'page-leavewar', { sheets: await sheets(s), page: w.page })
    await answerQ(s, STAY, 'w04-stay'); qq = await Q(s); w = await where(s); note('after Stay', JSON.stringify(w), JSON.stringify(await sheets(s)))
    check('Stay: on 149, in the member view, nothing of the line left', !qq.up && w.sq.startsWith('149') && (await sheets(s)).length === 0, { w, sheets: await sheets(s) })
    await roleSwitch(s, 'w05-admin'); await wait(s, 700); await toDec(s); w = await where(s); await pic(s, 'w05-admin-war')
    const r = await page.evaluate(day => ({ o: !!document.querySelector(`[data-testid="cell-osp9-${day}"]`), h: !!document.querySelector(`[data-testid="cell-prowler-${day}"]`) }), DAY)
    check('back in the admin view the Leave War is 149', w.sq.startsWith('149') && r.o && !r.h, { w, r })
    await go(s, 'tracker'); await shut(s); await wait(s, 1200)
    check('the draft is still there', await hasEv(s, 'RB2W'), await hasEv(s, 'RB2W')); await pic(s, 'w06-draft')
    await s.ctx.close()
  })

  if (!ONLY || ONLY === 'r') await step('(r) after a refused Save', async () => {
    const s = await hunterOn149(SZ); const { page } = s
    await heldDraft(s, 'RB2R'); const t0 = await trackerSaved(s, '149'), h0 = await trackerSaved(s, '142')
    await pickSq(s, '142', 'r01-pick'); await wait(s, 700); let qq = await Q(s)
    check('the pick asks', answerable(qq) && /Save them before/.test(qq.msg || ''), shortQ(qq))
    await answerQ(s, SAVE, 'r02-save'); qq = await Q(s)
    check('refused', /could not be saved/.test(qq.msg || ''), qq.msg)
    await answerQ(s, '#' + qq.btns[0].id, 'r03-ok')
    await roleSwitch(s, 'r04-admin'); await wait(s, 700); await go(s, 'tracker'); await shut(s); await wait(s, 1200)
    const stat = () => page.evaluate(() => { const e = document.getElementById('saveStat'); if (!e) return null; const b = e.getBoundingClientRect(); return { words: e.textContent.trim(), box: [b.left, b.top, b.width, b.height].map(Math.round), clipped: e.scrollWidth > e.clientWidth + 1, scrollW: e.scrollWidth, clientW: e.clientWidth, title: e.getAttribute('title') } })
    const st = await stat(); note('the bar says', JSON.stringify(st)); await pic(s, 'r04-bar-after-refusal')
    if (st && st.box[2] > 0) await page.screenshot({ path: `${process.cwd()}/docs/handpass/2026-11-24-msq-night-check/rewalk/b/${tag}/r04-bar-crop.png`, clip: { x: Math.max(0, st.box[0] - 220), y: Math.max(0, st.box[1] - 16), width: Math.min(page.viewportSize().width - Math.max(0, st.box[0] - 220), 460), height: st.box[3] + 32 } })
    check('back in the admin view the refusal words are readable, not cut', !!st && !st.clipped, st)
    check('the draft is still there, Save offered', (await hasEv(s, 'RB2R')) && await visible(s, '#saveChanges'), await hasEv(s, 'RB2R'))
    await tapIt(s, '#saveChanges'); await wait(s, 1000); if ((await Q(s)).up) await tapIt(s, '#dlgOk')
    const st2 = await stat(); await pic(s, 'r05-saved'); note('after Save', JSON.stringify(st2))
    const d9 = layoutDiff(t0, await trackerSaved(s, '149')), d2 = layoutDiff(h0, await trackerSaved(s, '142'))
    check('his own Save now writes to 149 alone and clears the words', d9.length > 0 && d2.length === 0 && !/could not/.test(st2?.words || ''), { d9: d9.slice(0, 3), d2, words: st2?.words })
    await s.ctx.close()
  })
} finally { finish(tag); await closeAll() }
