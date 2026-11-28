// world - [MSQ-PICK-GUARD] the third round's drawings (chat 176, 25 Nov 26): THE WORLD, made by the app's own controls on
// a desktop browser, Saber (master admin, primary 142) signed in. Three squadrons and a man with rights in several
// (his D2630). The saved data is copied into every drawing's fresh browser (Playwright's storage copy - as n175/p6-lib).
//   1. Admin → Squadrons → "+ New squadron": 150, Home base, first admin: none is refused ("Name the squadron's first
//      admin."), so Kestrel · 149 (he gets Plan of 150; ended again in step 5).
//   2. Admin → Users (142's page) → "Add a person", Home squadron 150, three times: Mako (Pilot, CAT B, sign-in "mako",
//      Role Admin - 150's own admin), Jackal (WSO, CAT C), Onyx (Pilot, CAT IP).
//   3. Hunter's row → Access to 149: Plan → Save; Access to 150: View → Save.
//   4. Ace's row (142, Pilot, CAT A) → Archive.
//   5. "Add a person", Home squadron 150: Ace (Pilot, CAT B) - the callsign of 142's archived man (his D286 lets it go to a
//      new person). Then 150 picked, Admin → Users, the new Ace's row → Archive. So 142 and 150 each hold an archived Ace.
//      Kestrel's row (on 150's page) → Access to 150: None → Save.
//   6. 142 picked again (the world's resting squadron).
// Prints the world's people per squadron as FACT lines.
//   node raptor-port/scripts/handpass/n176/world.mjs        → raptor-port/.tmp/n176/state-world.json
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'
import { mk, closeAll, FACT, signIn, wait, vis, hit, usersTab, give, archive, toastNow, reachPick, barSq } from '../n175/p6-lib.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))
export const TMP = resolve(HERE, '../../../.tmp/n176-draw'); mkdirSync(TMP, { recursive: true })
export const WORLD = resolve(TMP, 'state-world.json')
export const NEW150 = [['Mako', 'MK', 'P', 'B', 'mako', 'admin'], ['Jackal', 'JK', 'W', 'C'], ['Onyx', 'OX', 'P', 'IP']]

const rowsOf = s => s.page.evaluate(() => [...document.querySelectorAll('#page-admin .acc-row[data-person]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.person + ':' + e.querySelector('.acc-name')?.textContent.trim()))
async function adminCat(s, label) {
  await usersTab(s)
  if (await vis(s, '.adm-back').count()) await hit(s, '.adm-back', 500)
  await hit(s, vis(s, '#page-admin button.adm-cat').filter({ hasText: new RegExp('^' + label) }).first(), 600)
}
async function seatValue(s, sel, want) {
  return s.page.evaluate(([sel, want]) => { const o = [...document.querySelector(sel).options]; return (o.find(x => x.value === want) || o.find(x => new RegExp('^' + want, 'i').test(x.textContent)))?.value }, [sel, want])
}
export async function addPerson(s, home, cs, ini, seat, cat, signin = null, role = null) {
  const { page } = s
  await usersTab(s)
  if (await page.locator('#accAddHome').count()) await page.selectOption('#accAddHome', { label: home })
  await page.fill('#accAddCs', cs); await page.fill('#accAddIni', ini)
  const sv = await seatValue(s, '#accAddSeat', seat === 'P' ? 'Pilot' : 'WSO'); await page.selectOption('#accAddSeat', sv)
  await page.selectOption('#accAddCat', cat)
  if (signin) { await page.fill('#accAddName', signin); await wait(s, 200); if (role) await page.selectOption('#accAddRole', role) }
  const note = await page.evaluate(() => [...document.querySelectorAll('#accAddBlock .adm-note, #accAddBlock .od-err, #accAddBlock .acc-note')].map(e => e.textContent.trim()))
  await hit(s, '#accAdd', 800)
  return { home, cs, ini, seat: sv, cat, notesBeforeAdd: note, toast: await toastNow(s) }
}
export async function makeWorld() {
  const s = await mk('d')
  try {
    await signIn(s, 'ad', 'a')
    /* 1. + New squadron */
    await adminCat(s, 'Squadrons'); await hit(s, '#sqNew', 600)
    await s.page.fill('#sqNewNum', '150')
    await s.page.selectOption('#sqNewPlace', 'p1')
    FACT('world.newSqn.adminChoices', await s.page.evaluate(() => [...document.querySelector('#sqNewAdmin').options].map(o => o.textContent)))
    await hit(s, '#sqNewSave', 900)
    let said = await toastNow(s)
    FACT('world.newSqn.savedWithNoFirstAdmin', { toast: said, formStillOpen: !!(await vis(s, '#sqNewSave').count()) })
    if (await vis(s, '#sqNewSave').count()) {
      /* the form asks for a first admin: Kestrel (149's admin) - so Hunter's own line of 150 stays View, as the brief has it */
      await s.page.selectOption('#sqNewAdmin', { label: 'Kestrel · 149' })
      FACT('world.newSqn.note', await s.page.evaluate(() => document.querySelector('#sqNewNote')?.textContent.trim()))
      await hit(s, '#sqNewSave', 900); said = await toastNow(s)
      FACT('world.newSqn.savedWithFirstAdmin', { firstAdmin: 'Kestrel · 149', toast: said, formStillOpen: !!(await vis(s, '#sqNewSave').count()) })
    }
    FACT('world.squadrons', await s.page.evaluate(() => document.querySelector('#sqList')?.innerText.replace(/\s+/g, ' ').trim()))
    /* 2. three men of 150 */
    for (const [cs, ini, seat, cat, sg, role] of NEW150) FACT(`world.add.${cs}`, await addPerson(s, '150', cs, ini, seat, cat, sg, role))
    /* 3. Hunter: Plan of 149, View of 150 */
    FACT('world.hunter.plan149', await give(s, 'prowler', '149', 'plan'))
    FACT('world.hunter.view150', await give(s, 'prowler', '150', 'view'))
    /* 4. 142's Ace archived */
    FACT('world.archive.ace142', await archive(s, 'dj'))
    /* 5. a new Ace on 150, then archived there */
    FACT('world.add.Ace150', await addPerson(s, '150', 'Ace', 'AC', 'P', 'B'))
    await reachPick(s, 150, 'bar'); await usersTab(s); await wait(s, 500)
    FACT('world.on150.rows', await rowsOf(s))
    const acePid = await s.page.evaluate(() => [...document.querySelectorAll('#page-admin .acc-row[data-person]')].find(e => e.querySelector('.acc-name')?.textContent.trim() === 'Ace' && !e.closest('#accArchList'))?.dataset.person)
    FACT('world.ace150.pid', acePid)
    if (acePid) FACT('world.archive.ace150', await archive(s, acePid))
    /* 150 has its own admin now (Mako): Kestrel's Plan of 150, which the form's first-admin box made him, is ended, so the
       world is the brief's - Kestrel 149's admin only, Hunter the one man holding rights in all three */
    FACT('world.kestrel.none150', await give(s, 'kes9', '150', 'none'))
    await reachPick(s, 142, 'bar'); await wait(s, 500)
    FACT('world.restingOn', await barSq(s))
    await wait(s, 600); writeFileSync(WORLD, JSON.stringify(await s.ctx.storageState()))
  } finally { await s.ctx.close().catch(() => {}) }
  return WORLD
}
/* the world's people, squadron by squadron, read on each squadron's Admin → Users as Saber (fresh browser) */
export async function printWorld() {
  const s = await mk('d', { storageState: WORLD })
  try {
    await signIn(s, 'ad', 'a')
    for (const n of [142, 149, 150]) {
      await reachPick(s, n, 'bar'); await usersTab(s); await wait(s, 500)
      if (await vis(s, '#accArchToggle[aria-expanded="false"]').count()) await hit(s, '#accArchToggle', 400)
      const w = await s.page.evaluate(() => ({
        head: document.querySelector('.od-head .adm-sub')?.textContent.trim(),
        people: [...document.querySelectorAll('#page-admin [data-testid="acc-groups"] .acc-row[data-person]')].map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 60)),
        archived: [...document.querySelectorAll('#accArchList .acc-row[data-person]')].map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 90)),
      }))
      FACT(`world.${n}`, { squadron: await barSq(s), head: w.head, count: w.people.length, archived: w.archived, people: w.people.length > 14 ? w.people.filter(x => /ad|us|MEMBER|ADMIN|Mako|Jackal|Onyx|plans/i.test(x)) : w.people })
    }
  } finally { await s.ctx.close().catch(() => {}) }
}
/* the world, made once (re-made with FRESH=1) */
export async function world() { if (!existsSync(WORLD) || process.env.FRESH) { await makeWorld(); await printWorld() } return WORLD }
if (import.meta.url === pathToFileURL(process.argv[1]).href) { try { await makeWorld(); await printWorld() } finally { await closeAll() } }
