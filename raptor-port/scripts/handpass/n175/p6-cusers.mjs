// p6-cusers - P6 case C-users (the code read's row C4): Admin → Users on 149 as Hunter (Plan of 149) and as Saber (master
// admin): rows reading "· also plans 149"; a 142 man found by the search box; a row's access lines. Desktop.
// SET-UP by presses (Saber, on 142): Admin → Users: Hunter's row → "Access to 149" Plan → Save.
// Then, fresh browsers: each signs in, picks 149, Admin → Users: every row of the list (its grey line), those with
// "also plans"; "Find a callsign or sign-in" typed "Ranger" (142's): what is found; the search cleared; Kestrel's row
// (149's own) opened: its access lines (which squadrons), then Cancel.
//   node raptor-port/scripts/handpass/n175/p6-cusers.mjs d     (ONLY=hunter,saber)
// Pictures: p6-cusers-<who>-d-1-list (the "also plans" row ringed), -2-search, -3-access
import { mk, closeAll, FACT, signIn, wait, vis, hit, shot, scratch, reachPick, barSq, give, usersTab, typeIn, saveState, SEC } from './p6-lib.mjs'
const SZ = 'd'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const listRows = s => s.page.evaluate(() => [...document.querySelectorAll('#accList [data-person]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 90)))
async function run(st, who) {
  const [user, pass] = who === 'hunter' ? ['ad2', 'a2'] : ['ad', 'a']
  const k = `p6.cusers.${who}.${SZ}`, P = `p6-cusers-${who}-${SZ}`
  const s = await mk(SZ, { storageState: st }); const { page } = s
  try {
    await signIn(s, user, pass)
    await reachPick(s, 149, 'bar'); await usersTab(s)
    const rows = await listRows(s)
    FACT(`${k}.1.list`, { squadron: await barSq(s), count: rows.length, rows, alsoPlans: rows.filter(r => /also plans/.test(r)) })
    await page.evaluate(() => { const e = [...document.querySelectorAll('#accList [data-person]')].find(x => /also plans/.test(x.innerText)); if (e) e.setAttribute('data-n175ring', '1') })
    await shot(s, `${P}-1-list`, ['[data-n175ring]', '.topbar .mark'], null, 24)
    await page.evaluate(() => document.querySelectorAll('[data-n175ring]').forEach(e => e.removeAttribute('data-n175ring')))
    await typeIn(s, '#accFind', 'Ranger'); await wait(s, 500)
    const found = await listRows(s)
    FACT(`${k}.2.searchRanger`, { found, noMatch: await page.evaluate(() => document.querySelector('#accNoMatch')?.textContent.trim() ?? null), allWords: await page.evaluate(() => (document.querySelector('#accList')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 300)) })
    await page.evaluate(() => { const e = [...document.querySelectorAll('#accList [data-person]')].find(x => /Ranger/.test(x.innerText)); if (e) e.setAttribute('data-n175ring', '1') })
    await shot(s, `${P}-2-search`, ['[data-n175ring]', '#accFind'], null, 24)
    await page.evaluate(() => document.querySelectorAll('[data-n175ring]').forEach(e => e.removeAttribute('data-n175ring')))
    /* Ranger's row, as found, opened: what an admin of 149 can do with a 142 man */
    const rr = vis(s, '#accList [data-person] .acc-tap').filter({ hasText: /Ranger/ }).first()
    if (await rr.count()) {
      await hit(s, rr, 700)
      FACT(`${k}.3.rangerOpened`, await page.evaluate(() => { const e = document.querySelector('[data-testid="acc-sq"]'); const ed = e?.closest('.acc-edit') || e?.parentElement; return { access: e ? e.innerText.replace(/\s+/g, ' ').trim().slice(0, 300) : 'no access lines', buttons: ed ? [...ed.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim().slice(0, 24) + (b.disabled ? ' [greyed]' : '')).slice(0, 20) : [] } }))
      await shot(s, `${P}-3-access`, ['[data-testid="acc-sq"]', '.topbar .mark'], null, 24)
      if (await vis(s, '#accEdCancel').count()) await hit(s, '#accEdCancel', 400)
    } else FACT(`${k}.3.rangerOpened`, 'no Ranger row to open')
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('p6-cusers v1', SZ)
  let st
  { const s = await mk('d'); try { await signIn(s, 'ad', 'a'); FACT('p6.cusers.setup.hunterPlan149', await give(s, 'prowler', '149', 'plan')); st = await saveState(s, 'cusers') } finally { await s.ctx.close().catch(() => {}) } }
  for (const w of (ONLY.length ? ONLY : ['hunter', 'saber'])) await run(st, w)
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
