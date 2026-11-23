// jb-s15 v1 - S15, S34 and S48. S15: a hidden chart draft on 142, then a pick of a squadron he only views, from Inputs and Help:
// Stay, Discard, Save. S34: sign-out over a draft, Stay, Discard, Save, the next person's own records; with every write refused
// (the app's ?savefail switch). S48: the ☰ list against the top bar's for four kinds of person, clean and dirty, closed three ways.
import { signIn, newPage, closeAll, finish, picsFor, note, pic, pickSq, shut, step, check, press, facts, as, grant, go, state, ask, addEvent, hasEv, logout, openMenu, closeMenuOutside } from './jlib.mjs'
import { dress, fp, short, wait, onSeed, reload } from './jb-lib.mjs'
const SZ = process.env.SZ || 'd'
const PARTS = (process.env.PARTS || 's15,s34,s48').split(',')
const tag = `s15-${SZ}-${PARTS.join('-')}${process.env.ONLY15 ? '-' + process.env.ONLY15.replace(':', '-') : ''}`   // one case, one folder
console.log('jb-s15 v1', SZ, PARTS.join(','))
picsFor(tag)
const to = async (s, u) => { await pickSq(s, u); await shut(s); await wait(s, 900) }
const ANS = { Stay: '#dlgCancel', Discard: '#dlgAlt', Save: '#dlgOk' }
const pages = st => st.tabs.length ? st.tabs : st.items
async function base(hunterLine) {
  const s = await newPage(SZ)
  await signIn(s, 'ad', 'a')
  if (hunterLine) check('grant', await grant(s, 'prowler', '149', hunterLine), hunterLine)
  await dress(s, '142', ['ST-01', 'ACG-01']); await to(s, '149'); await dress(s, '149', ['ST-01'])
  await logout(s); await signIn(s, 'ad2', 'a2')
  return s
}
const outDoor = async s => { if (await s.page.locator('#logout').filter({ visible: true }).count()) await press(s, '#logout', 'out'); else { await openMenu(s); await press(s, '#drawerLogout', 'out') } await wait(s, 500) }
try {
  if (PARTS.includes('s15')) for (const from of ['inputs', 'help']) for (const ans of ['Stay', 'Discard', 'Save']) await step(`S15 from ${from}: ${ans}`, async () => {
    if (process.env.ONLY15 && process.env.ONLY15 !== `${from}:${ans}`) return
    const k = `15-${from}-${ans}`; const name = `JB15${from[0]}${ans[0]}`
    const s = await base('view')
    await onSeed(s); check(`${k}: draft`, await addEvent(s, name), name)
    await go(s, from); await wait(s, 600); await shut(s)
    await pickSq(s, '149', `${k}-pick`); await wait(s, 500)
    const q = await ask(s); const st = await state(s); await pic(s, `${k}-1-asked`)
    check(`${k}: the question shows over ${from}`, /Save them before switching to 149/.test(q.msg || '') && st.page === `page-${from}`, { q: q.msg, page: st.page })
    if (!s.desk) check(`${k}: the phone menu closed first`, !st.drawerOpen, st.drawerOpen)
    const top = await s.page.evaluate(() => { const d = document.querySelector('#dlgOk'); if (!d) return null; const r = d.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!t && (t === d || d.contains(t)) })
    check(`${k}: its buttons are on top`, top === true, top)
    if (!q.msg) { await s.ctx.close(); return }
    await press(s, ANS[ans], `${k}-ans`); await wait(s, 1100); await shut(s)
    const a = await state(s); await pic(s, `${k}-2-after`)
    if (ans === 'Stay') {
      check(`${k}: stays on 142, ${from}`, a.barMark?.startsWith('142') && a.page === `page-${from}`, `${a.barMark} ${a.page}`)
      await go(s, 'tracker'); await wait(s, 800); const f = await fp(s); check(`${k}: draft kept`, f.dirty && await hasEv(s, name), short(f))
    } else {
      check(`${k}: on 149 with View-only Sched and Help only`, a.barMark?.startsWith('149') && pages(a).length === 2 && pages(a).includes('viewsched') && pages(a).includes('help'), { bar: a.barMark, pages: pages(a), page: a.page })
      await to(s, '142'); const f = await onSeed(s)
      check(`${k}: on return 142 ${ans === 'Save' ? 'has' : 'has not'} the event, nothing unsaved`, !f.dirty && (ans === 'Save') === (await hasEv(s, name)) && f.done === 2, short(f)); await pic(s, `${k}-3-return`)
    }
    await s.ctx.close()
  })
  if (PARTS.includes('s34')) {
    for (const ans of ['Stay', 'Discard', 'Save']) await step(`S34 sign-out: ${ans}`, async () => {
      const k = `34-${ans}`; const name = `JB34${ans[0]}`
      const s = await base('plan'); const { page } = s
      await onSeed(s); check(`${k}: draft`, await addEvent(s, name), name)
      await outDoor(s); const q = await ask(s); note(`${k} asked`, JSON.stringify(q.msg), JSON.stringify(q.btns)); await pic(s, `${k}-1-asked`)
      if (!check(`${k}: sign-out asks first`, !!q.msg, q.msg)) { await s.ctx.close(); return }
      const id = ans === 'Stay' ? '#dlgCancel' : ans === 'Discard' ? (q.btns.some(b => /dlgAlt/.test(b)) ? '#dlgAlt' : '#dlgOk') : '#dlgOk'
      note(`${k} presses`, q.btns.find(b => b.startsWith(id.slice(1))))
      await press(s, id, `${k}-ans`); await wait(s, 1200)
      if (ans === 'Stay') {
        await shut(s); const f = await fp(s); check(`${k}: still signed in, draft kept`, !(await page.locator('#luser').filter({ visible: true }).count()) && f.dirty && await hasEv(s, name), short(f)); await pic(s, `${k}-2-stayed`)
      } else {
        check(`${k}: signed out`, await page.locator('#luser').filter({ visible: true }).count() > 0, 'card'); await pic(s, `${k}-2-out`)
        await signIn(s, 'us', 'us'); await go(s, 'tracker'); await wait(s, 1300); const g = await onSeed(s)
        const u = await page.evaluate(() => { const b = [...document.querySelectorAll('#trUndoBtn')].find(x => x.getBoundingClientRect().width > 0); return b ? { off: b.disabled, tip: b.title } : null })
        check(`${k}: the next person has no Undo of Hunter's`, !u || u.off, u); check(`${k}: the next person sees no draft`, !g.dirty, short(g)); await pic(s, `${k}-3-ranger`)
        await as(s, 'ad2', 'a2'); const f = await onSeed(s)
        check(`${k}: back as Hunter the event is ${ans === 'Save' ? 'saved' : 'gone'}`, !f.dirty && (ans === 'Save') === (await hasEv(s, name)) && f.done === 2, short(f)); await pic(s, `${k}-4-hunter`)
      }
      await s.ctx.close()
    })
    await step('S34 sign-out while every write is refused', async () => {
      const k = '34-fail'
      const s = await base('plan'); const { page } = s
      const url = new URL(page.url()); url.search = '?savefail'
      await page.goto(url.toString()); await page.waitForSelector('#luser', { timeout: 20000 })
      await page.fill('#luser', 'ad2'); await page.fill('#lpass', 'a2'); await page.click('#loginForm button[type=submit]'); await page.waitForSelector('.page.on'); await wait(s, 1400)
      await onSeed(s); const made = await addEvent(s, 'JB34F'); note(`${k} draft`, made)
      await outDoor(s); let q = await ask(s); note(`${k} asked`, JSON.stringify(q.msg), JSON.stringify(q.btns)); await pic(s, `${k}-1-asked`)
      if (q.msg) {
        await press(s, '#dlgOk', `${k}-save`); await wait(s, 1300); const after = await ask(s); const c = await page.locator('#luser').filter({ visible: true }).count()
        const band = await page.evaluate(() => [...document.querySelectorAll('.saveband, [role=alert]')].filter(e => e.getBoundingClientRect().width > 2).map(e => e.innerText.replace(/\s+/g, ' ').trim()).slice(0, 2))
        const t = await page.evaluate(() => document.querySelector('#toastEl')?.textContent?.trim() || '')
        note(`RECORD ${k}: Save pressed with writes refused: signed out ${c > 0}; question ${JSON.stringify(after.msg)}; band ${JSON.stringify(band)}; note "${t}"`); await pic(s, `${k}-2-after-save`)
        check(`${k}: a refused Save does not sign out as if saved`, c === 0, { signedOut: c > 0, after: after.msg })
      }
      await s.ctx.close()
    })
  }
  if (PARTS.includes('s48')) {
    const who = [['master', 'ad', 'a', 3], ['plan', 'ad2', 'a2', 2], ['view', 'us', 'us', 2], ['one', 'us9', 'us9', 1]]
    const s = await newPage(SZ); const { page } = s
    await signIn(s, 'ad', 'a')
    await step('S48 rights', async () => { await grant(s, 'prowler', '149', 'plan'); await grant(s, 'bane', '149', 'view'); await go(s, 'viewsched'); await shut(s) })
    for (const [kind, u, p] of who) await step(`S48 ${kind}`, async () => {
      const k = `48-${kind}`
      if (kind !== 'master') await as(s, u, p)
      const barRows = async () => { if (!(await page.locator('#sqnMenuBtn').filter({ visible: true }).count())) return null; await press(s, '#sqnMenuBtn'); await wait(s, 150); const r = (await state(s)).topList; await page.keyboard.press('Escape'); await wait(s, 200); return r }
      const bar = await barRows()
      await openMenu(s, `${k}-menu`).catch(() => {})
      let st = await state(s); let draw = null
      if (st.drawerOpen) { if (st.dBtn && !(await page.locator('#drawerSqnList').count())) await press(s, '#drawerSqnBtn', `${k}-mark`); st = await state(s); draw = st.dList; await pic(s, `${k}-1-menu-list`) }
      note(`${k} bar list ${JSON.stringify(bar)} menu list ${JSON.stringify(draw)} menu button ${st.dBtn}`)
      if (bar && draw) check(`${k}: the two lists agree`, JSON.stringify(bar) === JSON.stringify(draw), { bar, draw })
      if (kind === 'one') check(`${k}: one squadron, no dropdown`, !(bar && bar.length) && !(draw && draw.length), { bar, draw, dBtn: st.dBtn, barBtn: st.barBtn })
      if (st.drawerOpen && draw && draw.length > 1) {
        const other = draw.find(r => !r.startsWith('✓')).split(' ')[0]; const home = draw.find(r => r.startsWith('✓')).replace('✓', '').split(' ')[0]
        const row = n => page.locator('#drawerSqnList .sqm-row', { has: page.locator('.sqm-num', { hasText: new RegExp(`^${n}$`) }) }).first()
        await press(s, row(other), `${k}-pick`); await wait(s, 500); let a = await state(s); await pic(s, `${k}-2-picked`)
        check(`${k}: a clean pick keeps the menu open, its pages updated`, a.drawerOpen && (a.dMark || '').startsWith(other), { open: a.drawerOpen, mark: a.dMark, items: a.items })
        note(`${k} pages after pick`, JSON.stringify(a.items))
        await press(s, '#drawerSqnBtn', `${k}-toggle`); await wait(s, 250); a = await state(s); check(`${k}: the mark folds its list`, !(a.dList && a.dList.length) && a.drawerOpen, { list: a.dList, open: a.drawerOpen })
        if (!(await page.locator('#drawerSqnList').count())) await press(s, '#drawerSqnBtn'); await wait(s, 200)
        await page.keyboard.press('Escape'); await wait(s, 300); a = await state(s); note(`${k} Escape: open ${a.drawerOpen} list ${JSON.stringify(a.dList)}`)
        for (let i = 0; i < 2 && (await state(s)).drawerOpen; i++) { await closeMenuOutside(s, `${k}-outside`); await wait(s, 200) }
        a = await state(s); check(`${k}: an outside press closes it`, !a.drawerOpen, a.drawerOpen)
        await pickSq(s, home); await shut(s); await wait(s, 500)
        if (kind === 'plan') {
          await onSeed(s); check(`${k}: draft`, await addEvent(s, 'JB48P'), 'JB48P')
          await openMenu(s); if (!(await page.locator('#drawerSqnList').count())) await press(s, '#drawerSqnBtn'); await press(s, row('149'), `${k}-dirty`); await wait(s, 500)
          const q = await ask(s); const b = await state(s); await pic(s, `${k}-3-dirty-asked`)
          check(`${k}: dirty pick closes the menu before it asks`, !!q.msg && !b.drawerOpen, { q: q.msg, open: b.drawerOpen })
          if (q.msg) { await press(s, '#dlgAlt'); await wait(s, 800); await shut(s); await to(s, '142') }
        }
      } else if (st.drawerOpen) await shut(s)
      if (s.desk && bar && bar.length > 1) {
        const other = bar.find(r => !r.startsWith('✓')).split(' ')[0]; const home = bar.find(r => r.startsWith('✓')).replace('✓', '').split(' ')[0]
        await pickSq(s, other); await wait(s, 500); const a = await state(s); check(`${k}: a bar pick moves and shows that squadron`, (a.barMark || '').startsWith(other), a.barMark); await pic(s, `${k}-4-bar-picked`)
        await pickSq(s, home); await wait(s, 400)
      }
    })
    await s.ctx.close()
  }
} finally { finish(tag); await closeAll() }
