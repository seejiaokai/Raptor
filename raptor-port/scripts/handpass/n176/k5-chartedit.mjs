// k5 - N10: a clean chart editor at the view switch. Three-squadron world (k0). Desktop. Hunter (142's admin, Plan of
// 149, View of 150) signs in, picks 149: Tracker → the syllabus menu → Edit chart layout; nothing moved; his name badge
// pressed (to the member view): what shows, is the editor still open, which squadron's Tracker. Back to the admin view by
// the badge again: the same read. Then on 150 (View only): the syllabus menu - is Edit chart layout offered at all?
//   node raptor-port/scripts/handpass/n176/k5-chartedit.mjs
import { mk, closeAll, FACT, signIn, go, wait, vis, hit, shot, scratch, barSq, pageOn, roleNow, reachPick, reachView, windowsNow, toastNow, world } from './k-lib.mjs'
const K = 'k5.d', P = 'k5-d'
const trkNow = s => s.page.evaluate(() => {
  const vis = e => { if (!e) return false; const b = e.getBoundingClientRect(); const c = getComputedStyle(e); return b.width > 2 && b.height > 2 && c.visibility !== 'hidden' && c.display !== 'none' }
  const pg = document.querySelector('#page-tracker')
  return {
    editorOpen: [...document.querySelectorAll('#arrTools')].some(vis),
    editorWords: [...document.querySelectorAll('#arrTools')].filter(vis).map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 140))[0] ?? null,
    cover: [...document.querySelectorAll('#page-tracker [class*="cover"], #page-tracker [class*="lock"], .trk-cover, .trk-locked')].filter(vis).map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 160)),
    crew: (document.querySelector('#page-tracker')?.innerText || '').replace(/\s+/g, ' ').match(/(STUDENTS?|CREW)[^]{0,80}/)?.[0] ?? null,
    saveBtn: [...document.querySelectorAll('button')].filter(b => vis(b) && /Save changes/.test(b.textContent)).map(b => b.textContent.trim()),
    pageShown: vis(pg),
  }
})
const ask = s => s.page.evaluate(() => { const m = [...document.querySelectorAll('#dlgMsg, [role=alertdialog]')].find(e => e.getBoundingClientRect().width > 0); return m ? m.closest('[role=alertdialog], .modal, #dlgModal')?.innerText.replace(/\s+/g, ' ').trim().slice(0, 240) ?? m.innerText : null })
async function trk(s) { await go(s, 'tracker'); await s.page.waitForSelector('#flowSvg .ball', { timeout: 20000 }).catch(() => {}); await wait(s, 900) }
try {
  console.log('k5-chartedit v1')
  const s = await mk('d', { storageState: await world() }); const { page } = s
  try {
    await signIn(s, 'ad2', 'a2')
    const p9 = await reachPick(s, 149, 'bar'); FACT(`${K}.1.pick149`, { rows: p9.listRows, squadron: await barSq(s) })
    await trk(s)
    await hit(s, '#sylMenuBtn', 400)
    const menu = await page.evaluate(() => [...document.querySelectorAll('#arrangeBtn, [role=menu] button, .sylmenu button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim().slice(0, 30) + (b.disabled ? ' [greyed]' : '')))
    FACT(`${K}.1.sylMenu149`, menu)
    await hit(s, '#arrangeBtn', 900)
    FACT(`${K}.1.editorOpen149`, { squadron: await barSq(s), role: (await roleNow(s)).badge, ...(await trkNow(s)) })
    await shot(s, `${P}-1-editor-149`, ['#arrTools', '#roleBadge', '.topbar .mark'], null, 10)
    const v = await reachView(s); await wait(s, 900)
    FACT(`${K}.2.toMember`, { press: v, question: await ask(s), squadron: await barSq(s), page: await pageOn(s), role: (await roleNow(s)).badge, toast: await toastNow(s), ...(await trkNow(s)), windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 80)) })
    await shot(s, `${P}-2-member-view`, ['#arrTools', '#roleBadge', '.topbar .mark'], null, 10)
    if (await ask(s)) { FACT(`${K}.2.asked`, 'a question is up: left as is, picture taken'); }
    const b = await reachView(s); await wait(s, 900)
    FACT(`${K}.3.backToAdmin`, { press: b, question: await ask(s), squadron: await barSq(s), page: await pageOn(s), role: (await roleNow(s)).badge, ...(await trkNow(s)) })
    await shot(s, `${P}-3-back-admin`, ['#arrTools', '#roleBadge', '.topbar .mark'], null, 10)
    /* the Tracker tab pressed again, on 149 in the admin view: is the editor still open there? */
    await trk(s)
    FACT(`${K}.3b.trackerAgain`, { squadron: await barSq(s), page: await pageOn(s), ...(await trkNow(s)) })
    await shot(s, `${P}-3b-tracker-again`, ['#arrTools', '.topbar .mark'], null, 10)
    /* 150 - View only */
    const p0 = await reachPick(s, 150, 'bar'); await wait(s, 900)
    FACT(`${K}.4.pick150`, { pressed: !!p0.pressed, rows: p0.listRows, squadron: await barSq(s), page: await pageOn(s) })
    const tabs = await page.evaluate(() => [...document.querySelectorAll('#topnav a[data-page]')].filter(a => a.getBoundingClientRect().width > 0).map(a => a.textContent.trim()))
    FACT(`${K}.4.tabs150`, tabs)
    if (!tabs.includes('Tracker')) { await shot(s, `${P}-4-tabs-150`, ['#topnav', '.topbar .mark'], ['.topbar'], 0); FACT(`${K}.4.editor150`, 'no Tracker tab on 150 (View only): the editor cannot be reached') }
    else await trk(s)
    if (tabs.includes('Tracker')) {
    const btn = await page.evaluate(() => { const b = document.querySelector('#sylMenuBtn'); if (!b) return 'not drawn'; const r = b.getBoundingClientRect(); return r.width > 0 ? (b.disabled ? 'drawn, greyed' : 'drawn, live') : 'not shown' })
    FACT(`${K}.4.sylMenuBtn150`, btn)
    if (/live/.test(btn)) {
      await hit(s, '#sylMenuBtn', 400)
      const m = await page.evaluate(() => { const a = document.querySelector('#arrangeBtn'); return { arrange: a ? (a.getBoundingClientRect().width > 0 ? (a.disabled ? 'greyed' : 'live') + ': ' + a.textContent.trim() + (a.title ? ` title="${a.title}"` : '') : 'not shown') : 'not drawn', items: [...document.querySelectorAll('#arrangeBtn, [role=menu] button, .sylmenu button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim().slice(0, 30) + (b.disabled ? ' [greyed]' : '')) } })
      FACT(`${K}.4.sylMenu150`, m)
      await shot(s, `${P}-4-menu-150`, ['#arrangeBtn', '#sylMenuBtn', '.topbar .mark'], null, 10)
      if (/live/.test(m.arrange)) { await hit(s, '#arrangeBtn', 900); FACT(`${K}.4.editor150`, await trkNow(s)); await shot(s, `${P}-5-editor-150`, ['#arrTools', '.topbar .mark'], null, 10) }
    } else await shot(s, `${P}-4-menu-150`, ['#sylMenuBtn', '.topbar .mark', '#page-tracker'], ['.topbar', '#page-tracker'], 0)
    }
  } catch (e) { FACT(`${K}.error`, String(e).split('\n')[0].slice(0, 220)); await scratch(s, `${P}-error`).catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
