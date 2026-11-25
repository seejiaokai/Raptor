// p6-a11 - P6 case A11 (the code read's row A11): Admin → Users on 149, Waiting - an access request whose callsign
// matches a man archived in 142. Desktop.
// SET-UP by presses: Saber (master admin, on 142): Admin → Users: Ace's row → Archive (→ OK). Then, on the sign-in card,
// a name on no list ("n175ace") signs in and asks for access: Squadron 149, Callsign "Ace", Pilot, the first category →
// Request access; then its own sign-out. The saved data copied into fresh browsers:
//   kestrel - Kestrel (149's admin) signs in: Admin → Users: the Waiting row; "Give access": the note's words; 149's
//             Archived fold - is Ace there?; then "Add person and give access" pressed: what it says, what happened.
//   saber   - Saber picks 149: the same (without the last press), and his 142's Archived fold for Ace.
//   node raptor-port/scripts/handpass/n175/p6-a11.mjs d     (ONLY=kestrel,saber)
// Pictures: p6-a11-<who>-d-1-note (the note ringed), p6-a11-kestrel-d-2-after-give
import { writeFileSync } from 'node:fs'
import { mk, closeAll, FACT, signIn, wait, vis, hit, shot, scratch, reachPick, barSq, usersTab, archive, saveState, toastNow, winFacts, tmpDir, SEC } from './p6-lib.mjs'
const SZ = 'd'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
async function setup() {
  let st
  { const s = await mk('d'); try { await signIn(s, 'ad', 'a'); FACT('p6.a11.setup.aceArchived', await archive(s, 'dj')); st = await saveState(s, 'a11-0') } finally { await s.ctx.close().catch(() => {}) } }
  const s = await mk('d', { storageState: st }); const { page } = s
  try {
    await page.goto('http://localhost:4700/'); await page.waitForSelector('#luser')
    await page.fill('#luser', 'n175ace'); await page.fill('#lpass', 'x'); await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#accForm', { timeout: 15000 })
    const sq = await page.evaluate(() => [...document.querySelector('#accSqn').options].map(o => o.text))
    await page.selectOption('#accSqn', { label: '149' }); await page.fill('#accCs', 'Ace'); await page.selectOption('#accSeat', { label: 'Pilot' })
    const cat = await page.evaluate(() => [...document.querySelector('#accCat').options].map(o => o.value).find(v => v)); await page.selectOption('#accCat', cat)
    await hit(s, '#accSend', 900)
    FACT('p6.a11.setup.request', { squadronsOffered: sq, screen: (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 120) })
    await hit(s, '#accOut', 900)
    const f = `${tmpDir(SEC)}/state-a11.json`; await wait(s, 500); writeFileSync(f, JSON.stringify(await s.ctx.storageState())); return f
  } finally { await s.ctx.close().catch(() => {}) }
}
const waitRows = s => s.page.evaluate(() => { const w = document.querySelector('#admWaiting'); return w ? [...w.querySelectorAll('.acc-row.req')].map(r => r.innerText.replace(/\s+/g, ' ').trim().slice(0, 140)) : (document.querySelector('#admNoWaiting')?.textContent.trim() ?? 'no Waiting list drawn') })
const archived = async s => {
  if (await vis(s, '#accArchToggle[aria-expanded="false"]').count()) await hit(s, '#accArchToggle', 500)
  return s.page.evaluate(() => { const l = document.querySelector('#accArchList'); const t = document.querySelector('#accArchToggle')?.textContent.trim(); return { fold: t ?? 'no Archived fold', names: l ? [...l.querySelectorAll('.acc-tap')].map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 50)) : [] } })
}
async function run(st, who) {
  const k = `p6.a11.${who}.${SZ}`, P = `p6-a11-${who}-${SZ}`
  const s = await mk(SZ, { storageState: st }); const { page } = s
  try {
    if (who === 'kestrel') await signIn(s, 'ad9', 'a9'); else { await signIn(s, 'ad', 'a'); await reachPick(s, 149, 'bar') }
    await usersTab(s)
    FACT(`${k}.1.waiting`, { squadron: await barSq(s), rows: await waitRows(s) })
    const give = vis(s, '#admWaiting button[data-approve]').first()
    if (!(await give.count())) { await scratch(s, SEC, P + '-nowaiting'); FACT(`${k}.1.give`, 'not drawn'); return }
    await hit(s, give, 700)
    const form = await page.evaluate(() => ({ note: document.querySelector('#apvNote')?.textContent.trim() ?? null, cs: document.querySelector('#apvCs')?.value ?? null, go: document.querySelector('#apvGo')?.textContent.trim() ?? null, choice: [...document.querySelectorAll('[data-approving] button[aria-pressed="true"], [data-approving] input[type=radio]:checked')].map(e => (e.textContent || e.value || '').trim()) }))
    FACT(`${k}.2.giveForm`, form)
    await shot(s, `${P}-1-note`, ['#apvNote', '.topbar .mark'], ['#apvNote', '[data-approving]'], 16)
    if (who === 'kestrel') {
      await hit(s, '#apvGo', 900)
      FACT(`${k}.3.afterGo`, { toast: await toastNow(s), err: await page.evaluate(() => [...document.querySelectorAll('.od-err, .acc-err, [role=alert]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim())), windows: (await winFacts(s)).map(w => w.slice(0, 160)), waiting: await waitRows(s) })
      await shot(s, `${P}-2-after-give`, ['#toastEl', '[data-approving]', '#admWaiting, #admNoWaiting'], null, 16)
      FACT(`${k}.4.archived149`, await archived(s))
      FACT(`${k}.4.list`, await page.evaluate(() => [...document.querySelectorAll('#accList [data-person]')].map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 40)).filter(t => /\bAce\b/.test(t))))
    } else {
      await hit(s, '#apvCancel', 500)
      FACT(`${k}.3.archived149`, await archived(s))
      await reachPick(s, 142, 'bar'); await usersTab(s)
      FACT(`${k}.4.archived142`, await archived(s))
    }
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('p6-a11 v1', SZ)
  const st = await setup()
  for (const w of (ONLY.length ? ONLY : ['kestrel', 'saber'])) await run(st, w)
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
