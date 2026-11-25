// k7 - his D2625: Kestrel's view of another squadron's man. Three-squadron world (k0). Desktop. Kestrel (149's own admin)
// signs in (149): Admin → Users → "Find a callsign or sign-in": a 142 man (Ranger), then a 150 man (Zephyr - 150's admin,
// with a sign-in). For each: the row as found (its words); opened: every control - sign-in mail box, Role, the access
// lines, Save, Suspend / Enable, Archive, Delete, Cancel - live or greyed, with its words. Pressed only to the point
// before a change: the sign-in box typed into (if live) then Cancel; Delete's first tap (it only arms: "Tap again…")
// then Cancel; Save with nothing changed (it only closes) - the browser's saved data read before and after. Suspend and
// Archive act at the first tap, so they are read, not pressed.
//   node raptor-port/scripts/handpass/n176/k7-kestrelusers.mjs
import { mk, closeAll, FACT, signIn, wait, vis, hit, shot, scratch, barSq, usersTab, toastNow, store, diffKeys, world } from './k-lib.mjs'
const K = 'k7.d', P = 'k7-d'
const rowOf = (s, cs) => s.page.evaluate(cs => { const e = [...document.querySelectorAll('#accList [data-person]')].find(x => x.getBoundingClientRect().height > 0 && new RegExp('^' + cs).test(x.innerText.trim())); if (!e) return null; e.setAttribute('data-k7row', '1'); return { pid: e.getAttribute('data-person'), words: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 160), tapGreyed: !!e.querySelector('.acc-tap')?.disabled, tapTitle: e.querySelector('.acc-tap')?.title ?? null } }, cs)
const editor = s => s.page.evaluate(() => {
  const ed = document.querySelector('[data-k7row] .acc-edit') || document.querySelector('.acc-edit')
  if (!ed) return null
  const st = e => (e ? `${e.disabled || e.getAttribute('aria-disabled') === 'true' ? 'greyed' : 'live'}${e.title ? ` title="${e.title}"` : ''}` : 'not shown')
  const q = sel => [...ed.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0)
  return {
    words: ed.innerText.replace(/\s+/g, ' ').trim().slice(0, 420),
    signIn: q('#accEdName, #accGiveName') ? `${st(q('#accEdName, #accGiveName'))} value="${q('#accEdName, #accGiveName').value}"` : 'not shown',
    role: q('#accEdRole, #accGiveRole') ? `${st(q('#accEdRole, #accGiveRole'))} "${q('#accEdRole, #accGiveRole').selectedOptions?.[0]?.text ?? ''}"` : 'not shown',
    lines: [...ed.querySelectorAll('[data-testid="acc-sq"] [aria-label^="Access to"]')].map(g => `${g.getAttribute('aria-label')}: ` + [...g.querySelectorAll('button')].map(b => `${b.textContent.trim()}${b.getAttribute('aria-pressed') === 'true' ? '(on)' : ''}${b.disabled ? '[greyed]' : ''}`).join(' ')),
    buttons: [...ed.querySelectorAll('.acc-acts button')].filter(b => b.getBoundingClientRect().width > 0).map(b => `${b.textContent.trim()}: ${st(b)}`),
  }
})
async function find(s, cs) { const f = vis(s, '#accFind').first(); await f.click(); await s.page.keyboard.press('Control+a'); await s.page.keyboard.type(cs); await wait(s, 600) }
async function one(s, cs, tag) {
  const { page } = s
  await page.evaluate(() => document.querySelectorAll('[data-k7row]').forEach(e => e.removeAttribute('data-k7row')))
  await find(s, cs)
  const row = await rowOf(s, cs)
  FACT(`${K}.${tag}.row`, row)
  if (!row) return
  await shot(s, `${P}-${tag}-1-row`, ['[data-k7row]', '#accFind'], null, 12)
  if (row.tapGreyed) { FACT(`${K}.${tag}.opened`, 'the row does not open (its button is greyed)'); return }
  await hit(s, '[data-k7row] .acc-tap', 700)
  FACT(`${K}.${tag}.editor`, await editor(s))
  await shot(s, `${P}-${tag}-2-opened`, ['.acc-edit'], null, 12)
  const before = await store(s)
  /* the sign-in box: typed into where live, then Cancel */
  const box = vis(s, '.acc-edit #accEdName, .acc-edit #accGiveName').first()
  if (await box.count() && !(await box.isDisabled())) { await box.click(); await page.keyboard.type('x'); FACT(`${K}.${tag}.signInTyped`, await box.inputValue()) }
  /* Delete's first tap: it arms only */
  const del = vis(s, '.acc-edit #accEdDel').first()
  if (await del.count() && !(await del.isDisabled())) { await hit(s, del, 400); FACT(`${K}.${tag}.deleteFirstTap`, { button: (await del.textContent()).trim(), note: await page.evaluate(() => document.querySelector('#accEdDelNote')?.textContent.trim() ?? null) }); await shot(s, `${P}-${tag}-3-delete-armed`, ['.acc-edit #accEdDel', '#accEdDelNote'], ['.acc-edit'], 12) }
  else FACT(`${K}.${tag}.deleteFirstTap`, (await del.count()) ? 'greyed - not pressed' : 'not shown')
  if (await vis(s, '.acc-edit #accEdCancel').count()) await hit(s, '.acc-edit #accEdCancel', 500)
  FACT(`${K}.${tag}.afterCancel`, { saved: diffKeys(before, await store(s)), toast: await toastNow(s), editorStill: !!(await editor(s)) })
  /* Save with nothing changed */
  await rowOf(s, cs); await hit(s, '[data-k7row] .acc-tap', 700)
  const before2 = await store(s)
  const sv = vis(s, '.acc-edit #accEdSave').first()
  if (await sv.count() && !(await sv.isDisabled())) { await hit(s, sv, 700); FACT(`${K}.${tag}.saveNothingChanged`, { saved: diffKeys(before2, await store(s)), toast: await toastNow(s), editorStill: !!(await editor(s)) }) }
  else FACT(`${K}.${tag}.saveNothingChanged`, (await sv.count()) ? 'greyed' : 'not shown')
  if (await vis(s, '.acc-edit #accEdCancel').count()) await hit(s, '.acc-edit #accEdCancel', 400)
}
try {
  console.log('k7-kestrelusers v1')
  const s = await mk('d', { storageState: await world() })
  try {
    await signIn(s, 'ad9', 'a9')
    await usersTab(s)
    FACT(`${K}.0.in`, { squadron: await barSq(s) })
    await one(s, 'Ranger', 'r142')
    await one(s, 'Zephyr', 'z150')
  } catch (e) { FACT(`${K}.error`, String(e).split('\n')[0].slice(0, 220)); await scratch(s, `${P}-error`).catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
