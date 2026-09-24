/* [HUMAN-RETEST] the amendment system — shared walk helpers (24 Sep 26).
   Builds on ../lib.mjs (open / login / go / board / tap / type / put / shot). Everything here
   drives the app's OWN controls — the sign-off selects, Publish day, Publish AL, Unpublish, the
   plans menu — so a fixture is made the way a scheduler makes it (bug-check order §7.7).
   Pictures go to HP_SHOTS (set it per world so two walkers never share a folder).
   Reads of the book (SCHED) are for the evidence table only; no helper WRITES through window. */
export * from '../lib.mjs'
import { go, board as board0 } from '../lib.mjs'

/** Close the scheduler board through its own ✕ (#sbClose). On a phone its label is icon-only, so the
    shared lib's by-name lookup misses it and the board stays open over the week. */
export async function closeBoard(page) {
  if (!(await page.locator('#schedBoard:visible').count())) return false
  const x = page.locator('#sbClose:visible').first()
  if (await x.count()) { await x.click(); await page.waitForTimeout(600) }
  else { await page.keyboard.press('Escape'); await page.waitForTimeout(500) }
  return true
}
/** Open the board for day di (closing any open board first, with the phone-safe close). */
export async function board(page, di) {
  const openDay = await page.evaluate(() => (document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth ? window.SBDAY : null))
  if (openDay === di) return
  if (openDay != null) await closeBoard(page)
  return board0(page, di)
}

/** Which surface a helper acts on: the edit week (#eWeek) or the open scheduler board. */
const root = async (page) => (await page.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'

/** Make sure we are on the edit week with the board closed. */
export async function editWeek(page) {
  await closeBoard(page)
  await go(page, 'editsched')
}

/** Sign all four roles for day di on the current surface (week or board), through the real
    selects. Picks the n-th appointed name per role (default the first), so two walks can sign
    with different people. Returns what each select ended up showing. */
export async function signDay(page, di, pick = 0) {
  const r = await root(page)
  const out = {}
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = page.locator(`${r} select[data-sign="${role}"][data-signday="${di}"]:visible`).first()
    if (!(await sel.count())) { out[role] = 'NO SELECT'; continue }
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    if (!opts.length) { out[role] = 'NO NAMES'; continue }
    await sel.selectOption(opts[Math.min(pick, opts.length - 1)])
    await page.waitForTimeout(250)
    out[role] = await sel.evaluate(s => s.options[s.selectedIndex]?.text || '')
  }
  return out
}

/** Press a day's button by its data attribute on the current surface; returns false if absent
    or disabled (and why, from its title). */
async function press(page, attr, di) {
  const r = await root(page)
  const b = page.locator(`${r} [${attr}="${di}"]:visible`).first()
  if (!(await b.count())) return { pressed: false, why: 'absent' }
  if (await b.isDisabled()) return { pressed: false, why: 'disabled: ' + (await b.getAttribute('title')) }
  const label = (await b.innerText()).trim()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await b.click()
  await page.waitForTimeout(700)
  return { pressed: true, label }
}
export const publishDay = (page, di) => press(page, 'data-beak', di)
export const publishAL = (page, di) => press(page, 'data-alpub', di)
/** Unpublish; a second press when the first only ARMED the warning (OIL bid against). */
export async function unpublish(page, di, { confirm = true } = {}) {
  const a = await press(page, 'data-unpub', di)
  if (!a.pressed) return a
  const r = await root(page)
  const armed = page.locator(`${r} [data-unpub="${di}"]:visible`).first()
  if (confirm && (await armed.count()) && /confirm/i.test(await armed.innerText())) {
    const b = await press(page, 'data-unpub', di)
    return { ...b, armedFirst: true, firstLabel: a.label }
  }
  return a
}

/** What a day's head says on the edit week, and the state of its buttons. */
export async function head(page, di) {
  const r = await root(page)
  return page.evaluate(([r, i]) => {
    const scope = r === '#schedBoard' ? document.querySelector('#schedBoard') : document.querySelector(`#eWeek .day[data-day="${i}"]`)
    if (!scope) return null
    const q = s => scope.querySelector(s)
    const btn = s => { const b = q(s); return b ? { text: b.innerText.trim(), disabled: !!b.disabled, title: b.title } : null }
    return {
      tag: (q('.verchip') || {}).innerText || '',
      tagAlc: q('.verchip')?.getAttribute('data-alc') || '',
      selector: (q('.planselbtn') || {}).innerText || '',
      pending: (q('.dpend') || {}).innerText || '',
      nys: !!q('.nysmark'),
      beak: btn(`[data-beak="${i}"]`),
      alpub: btn(`[data-alpub="${i}"]`),
      unpub: btn(`[data-unpub="${i}"]`),
      signState: (q('.so-state') || {}).innerText || '',
      signs: [...scope.querySelectorAll(`select[data-sign][data-signday="${i}"]`)].map(s => s.options[s.selectedIndex]?.text || ''),
    }
  }, [r, di])
}

/** The book as the engine holds it — for the evidence table, never to drive the app. */
export async function book(page) {
  return page.evaluate(() => {
    const S = window.SCHED
    return {
      dayOK: Object.keys(S.dayOK || {}),
      cur: S.cur,
      als: (S.als || []).map(a => `${a.id} d${a.di} n=${(a.diff || []).length}`),
      orig: Object.keys(S.orig || {}),
      pending: Object.keys(S.pending || {}),
      changes: S.changes,
      retired: Object.keys(S.retired || {}),
      correcting: S.correcting,
      drafts: Object.fromEntries(Object.entries(S.drafts || {}).map(([k, v]) => [k, v.map(x => x.name + (S.curDraft?.[k] === x.id ? '*' : ''))])),
    }
  })
}

/** Every amendment mark painted in a container: dotted pending (data-alp/aln) and issued
    (data-alc), with the text they sit on. */
export async function marks(page, sel) {
  return page.evaluate(s => {
    const c = document.querySelector(s)
    if (!c) return null
    const row = e => ({ tag: e.tagName.toLowerCase(), cls: String(e.className).slice(0, 40), text: (e.innerText || e.value || '').trim().slice(0, 30),
      alc: e.getAttribute('data-alc'), aln: e.getAttribute('data-aln'), vis: !!(e.offsetWidth || e.offsetHeight) })
    return {
      pending: [...c.querySelectorAll('[data-alp]')].map(row),
      issued: [...c.querySelectorAll('[data-alc]')].filter(e => !e.classList.contains('verchip') && !e.classList.contains('al-tag')).map(row),
    }
  }, sel)
}

/** Open the plans menu of day di and list its rows (label + what a tap does). */
export async function planMenuItems(page, di) {
  const r = await root(page)
  const b = page.locator(`${r} [data-planmenu="${di}"]:visible`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await b.click()
  await page.waitForTimeout(500)
  return page.evaluate(() => [...document.querySelectorAll('.wmenu button, .popmenu button, [class*=menu] .wm')]
    .filter(e => e.offsetWidth || e.offsetHeight)
    .map(e => ({ text: e.innerText.replace(/\s+/g, ' ').trim(),
      does: e.dataset.plangolive != null ? 'back-to-live' : e.dataset.plansel != null ? 'switch:' + e.dataset.plansel
        : e.dataset.planpv != null ? 'look:' + e.dataset.planpv : e.dataset.plandup != null ? '+alt' : '?' })))
}

/** Tap a plans-menu row whose text matches `re` (the menu must be open). */
export async function planMenuPick(page, re) {
  const it = page.locator('.wm:visible').filter({ hasText: re }).first()
  await it.click()
  await page.waitForTimeout(700)
}

/** Edit a contenteditable text cell on the edit week (data-txt) and commit it by blur. */
export async function editText(page, key, value) {
  const el = page.locator(`#eWeek [data-txt="${key}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await el.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.type(String(value), { delay: 10 })
  await el.evaluate(e => e.blur())
  await page.waitForTimeout(600)
}

/** The view-only page's picture of day di: its head, its tag, whether it shows the working draft. */
export async function viewHead(page, di) {
  await go(page, 'viewsched')
  return page.evaluate(i => {
    const s = document.querySelector(`#vWeek .day[data-day="${i}"]`)
    if (!s) return null
    return { head: s.querySelector('.day-head')?.innerText.replace(/\s+/g, ' ').trim(),
      cls: s.className, bar: s.querySelector('.dprev-bar')?.innerText || '',
      picker: [...s.querySelectorAll('select.dver option')].map(o => (o.selected ? '*' : '') + o.text) }
  }, di)
}

/** The toast text currently on screen (the app's own messages). */
export async function toastText(page) {
  return page.evaluate(() => [...document.querySelectorAll('.toast, #toast, [class*=toast]')].map(e => e.innerText.trim()).filter(Boolean).join(' | '))
}

export { go }
