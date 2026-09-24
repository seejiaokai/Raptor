/* w2-02 — THE PLANS MENU AND THE PLAN EDITOR (R16): the menu's wording on a published, an unpublished and
   an unpublished-AL day; the plan lifecycle (Astra 24); rename / delete while the view page looks at a
   plan (S24); the plan editor under a flip to member view (Astra 30).
   Rules: AM26–AM31, AM12, AM17, AM39b; engine-rules §Drafts; ui-contracts §Plans on a published day.
   Usage: node w2-02-plans.mjs [menu|life|s24|a30|all] [desktop|phone]   (default all, desktop+phone for menu) */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w2'
const L = await import('./w2-lib.mjs')
const { open, editWeek, go, check, note, summary, installToasts, takeToasts, h, bookDay, menu, menuClose, planEdit, altPlan, switchTo,
  viewDay, viewPick, clip, screen, signDay, undoLabel, STATE, DESK, PHONE } = L
const part = process.argv[2] || 'all'
const widths = process.argv[3] ? [process.argv[3]] : ['desktop', 'phone']

async function modalState(page) {
  return page.evaluate(() => {
    const m = document.querySelector('#draftsModal'); if (!m || m.hidden) return { open: false }
    const tabs = [...m.querySelectorAll('.tpl-tab')].map(t => (t.classList.contains('on') ? '>' : '') + t.innerText.trim())
    const inp = m.querySelector('.tpl-name'); const del = [...m.querySelectorAll('button')].find(b => /Delete plan/.test(b.innerText))
    return { open: true, tabs, name: inp ? inp.value : null, max: inp ? inp.maxLength : null, note: (m.querySelector('.wm-note') || {}).innerText || (m.querySelector('.sb-empty') || {}).innerText || '',
      del: del ? { disabled: del.disabled, title: del.title } : null }
  })
}
async function modalTab(page, re) { await page.locator('#draftsModal .tpl-tab').filter({ hasText: new RegExp(re.source, 'i') }).first().click(); await page.waitForTimeout(300) }
async function modalName(page, value) {
  const inp = page.locator('#draftsModal .tpl-name'); await inp.click(); await inp.fill(value); await inp.press('Enter'); await page.waitForTimeout(400)
}
async function modalDelete(page) { await page.locator('#draftsModal button', { hasText: 'Delete plan' }).click(); await page.waitForTimeout(500) }
async function modalDone(page) { const b = page.locator('#draftsModal button', { hasText: 'Done' }); if (await b.count()) { await b.click(); await page.waitForTimeout(400) } }

/* ======================= A. the menu's words ================================================== */
if (part === 'all' || part === 'menu') for (const w of widths) {
  const W = w === 'phone' ? PHONE : DESK, P = w === 'phone' ? 'p' : 'd'
  console.log(`\n##### menu wording — ${w} #####`)
  const { browser, page, errors } = await open({ ...W, state: STATE })
  await editWeek(page)
  const NOTE = "This day is published — the issued versions don't change. Switching plans marks the differences as the next AL."
  /* Mon: published at AL1, one change pending, no plans */
  let m = await menu(page, 0)
  console.log('mon menu', JSON.stringify(m.items), '|', m.text)
  await screen(page, `${P}-20-R16-menu-mon-published-AL1`)
  check(`${P}.R16 Mon (published) menu carries the published note`, m.text.includes(NOTE), m.text.slice(0, 160))
  check(`${P}.R16 Mon live row: "Live working copy ●" + "live now — differences from AL1 go out as AL2"`, /Live working copy ●\s*live now — differences from AL1 go out as AL2/.test(m.text), '')
  check(`${P}.R16 Mon lists its issued versions read-only: Original and AL1 (AM28)`, m.items.filter(i => i.does.startsWith('look:')).map(i => i.text.replace(/\s*read-only.*$/, '')).join('|') === 'Original|AL1', JSON.stringify(m.items.filter(i => i.does.startsWith('look:'))))
  check(`${P}.R16 Mon: "+ Alt Plan" last, no "Manage plans" (no plans yet)`, m.items[m.items.length - 1].does === '+alt' && !/Manage plans/.test(m.text), m.items.map(i => i.does).join(','))
  await menuClose(page)
  /* Thu: published Original, Plan A live, contingency Plan B */
  m = await menu(page, 3)
  console.log('thu menu', JSON.stringify(m.items), '|', m.text)
  await screen(page, `${P}-21-R16-menu-thu-published-plans`)
  check(`${P}.R16 Thu menu: note + "Plan A ●  live now — differences from Original go out as AL1" + "Plan B  tap to make it the live day"`,
    m.text.includes(NOTE) && /Plan A ●\s*live now — differences from Original go out as AL1/.test(m.text) && /Plan B\s*tap to make it the live day/.test(m.text), '')
  check(`${P}.R16 Thu: the only issued version offered is Original; "✎ Manage plans" present`, m.items.filter(i => i.does.startsWith('look:')).length === 1 && /Manage plans/.test(m.text), '')
  const pencils = await page.evaluate(() => document.querySelectorAll('.wavemenu [data-planedit]').length)
  check(`${P}.R16 Thu: each plan carries its ✎`, pencils === 2, `pencils ${pencils}`)
  await menuClose(page)
  /* Wed: never published */
  m = await menu(page, 2)
  console.log('wed menu', JSON.stringify(m.items), '|', m.text)
  await screen(page, `${P}-22-R16-menu-wed-unpublished`)
  check(`${P}.R16 Wed (unpublished) menu: NO published note, "Plan B ●  live now — this is what publishes", no issued rows`,
    !m.text.includes(NOTE) && /Plan B ●\s*live now — this is what publishes/.test(m.text) && !m.items.some(i => i.does.startsWith('look:')), '')
  await menuClose(page)
  /* Sun: Original, its AL1 unpublished (retired) — the retired AL1 is not offered */
  m = await menu(page, 6)
  console.log('sun menu', JSON.stringify(m.items), '|', m.text)
  check(`${P}.R16 Sun (AL1 unpublished): only Original is offered, the retired AL1 is not (AM34/AM37c)`,
    m.items.filter(i => i.does.startsWith('look:')).map(i => i.text.replace(/\s*read-only.*$/, '')).join('|') === 'Original', JSON.stringify(m.items))
  check(`${P}.R16 Sun live row: "differences from Original go out as AL1" (the same label is reused, AM33)`, /differences from Original go out as AL1/.test(m.text), '')
  await menuClose(page)
  check(`${P}.menu: no console errors`, errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}

/* ======================= B. the plan lifecycle on Friday (Astra 24) =========================== */
if (part === 'all' || part === 'life') for (const w of widths) {
  const W = w === 'phone' ? PHONE : DESK, P = w === 'phone' ? 'p' : 'd'
  console.log(`\n##### plan lifecycle (Fri) — ${w} #####`)
  const { browser, page, errors } = await open({ ...W, state: STATE })
  await installToasts(page)
  await editWeek(page)
  await altPlan(page, 4)
  let t = await takeToasts(page)
  let hd = await h(page, 4)
  check(`${P}.A24 first "+ Alt Plan" makes Plan A (the day as it was) and Plan B (live)`, /Plan B/.test(hd.selector) && (await bookDay(page, 4)).plans.join('|') === 'Plan A|Plan B*', `${hd.selector.trim()} · toast ${JSON.stringify(t)}`)
  await altPlan(page, 4)
  t = await takeToasts(page)
  hd = await h(page, 4)
  check(`${P}.A24 second "+ Alt Plan" adds Plan C (live)`, /Plan C/.test(hd.selector) && (await bookDay(page, 4)).plans.join('|') === 'Plan A|Plan B|Plan C*', `${hd.selector.trim()} · toast ${JSON.stringify(t)}`)
  /* sign the live Plan C — the survivor of the collapse must keep its sign-offs */
  await signDay(page, 4)
  hd = await h(page, 4)
  check(`${P}.A24 Plan C signed: "Signed — this day can be published"`, /Signed — this day can be published/.test(hd.signState), hd.signState)
  /* the plan editor */
  const opened = await planEdit(page, 4, 'Plan B')
  let ms = await modalState(page)
  console.log('modal', JSON.stringify(ms))
  check(`${P}.A24 ✎ on Plan B opens the plan editor on Plan B`, opened && ms.open && ms.name === 'Plan B', JSON.stringify(ms))
  await screen(page, `${P}-23-A24-plan-editor-open`)
  await modalName(page, 'Wet weather')
  ms = await modalState(page)
  check(`${P}.A24 rename Plan B → "Wet weather"`, ms.tabs.some(x => /Wet weather/i.test(x)), JSON.stringify(ms.tabs))
  await modalTab(page, /Plan C/)
  await modalName(page, 'Wet weather')
  t = await takeToasts(page); ms = await modalState(page)
  check(`${P}.A24 a duplicate name is refused with a reason, the plan keeps its name (AM29)`, t.some(x => /already has that name/.test(x)) && ms.tabs.some(x => /Plan C/i.test(x)), `toast ${JSON.stringify(t)} tabs ${JSON.stringify(ms.tabs)}`)
  await modalTab(page, /Plan A/)
  await modalName(page, '   ')
  t = await takeToasts(page); ms = await modalState(page)
  check(`${P}.A24 a blank name is refused with a reason, the plan keeps its name`, t.some(x => /needs a name/.test(x)) && ms.tabs.some(x => /Plan A/i.test(x)), `toast ${JSON.stringify(t)} tabs ${JSON.stringify(ms.tabs)}`)
  await modalName(page, 'An extremely long plan name that goes on')
  ms = await modalState(page)
  check(`${P}.A24 a long name is capped at ${ms.max} characters`, ms.tabs.some(x => x.replace(/^>/, '').replace(/ ●$/, '').length <= 24 && /An extremely long/i.test(x)), JSON.stringify(ms.tabs))
  await screen(page, `${P}-24-A24-plan-editor-after-renames`)
  /* the live plan cannot be deleted */
  await modalTab(page, /Plan C/)
  ms = await modalState(page)
  check(`${P}.A24 the LIVE plan's Delete is disabled with the reason`, ms.del && ms.del.disabled && /switch to another plan first/.test(ms.del.title), JSON.stringify(ms.del))
  /* delete down to one */
  await modalTab(page, /An extremely long/)
  await modalDelete(page)
  t = await takeToasts(page); ms = await modalState(page)
  check(`${P}.A24 delete a stored plan → "…plan deleted"`, t.some(x => /plan deleted/.test(x)) && ms.tabs.length === 2, `toast ${JSON.stringify(t)} tabs ${JSON.stringify(ms.tabs)}`)
  await modalTab(page, /Wet weather/)
  await modalDelete(page)
  ms = await modalState(page)
  check(`${P}.A24 deleting down to one empties the editor ("No plans on this day yet…")`, ms.open && /No plans on this day yet/.test(ms.note), JSON.stringify(ms))
  await screen(page, `${P}-25-A24-plan-editor-collapsed`)
  await modalDone(page)
  hd = await h(page, 4)
  const bk = await bookDay(page, 4)
  check(`${P}.A24/AM29 the day is back to "Live working copy"`, /Live working copy/.test(hd.selector) && bk.plans.length === 0, `${hd.selector.trim()} plans ${JSON.stringify(bk.plans)}`)
  check(`${P}.A24 the survivor keeps its sign-offs (still "Signed — this day can be published")`, /Signed — this day can be published/.test(hd.signState), hd.signState)
  const m2 = await menu(page, 4)
  check(`${P}.A24 the menu is back to one row "Live working copy ●" + "+ Alt Plan"`, m2.items.map(i => i.does).join(',') === 'back-to-live,+alt', JSON.stringify(m2.items))
  await menuClose(page)
  await clip(page, `${P}-26-A24-fri-head-after-collapse`, '#eWeek .day[data-day="4"] .day-head', { pad: 8, extraH: 110 })
  /* the delete rides the undo stack (AM39b) */
  const ul = await undoLabel(page)
  note(`${P}.A24 undo label after the collapse`, ul)
  if (w === 'desktop') {
    await page.locator('#undoBtn').click(); await page.waitForTimeout(700)
    t = await takeToasts(page)
    const bk2 = await bookDay(page, 4); const hd2 = await h(page, 4)
    check(`${P}.A24 Undo brings the deleted plan back (one step)`, bk2.plans.length === 2, `plans ${JSON.stringify(bk2.plans)} selector ${hd2.selector.trim()} toast ${JSON.stringify(t)}`)
  }
  check(`${P}.life: no console errors`, errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}

/* ======================= C. S24 — rename / delete while the view page looks at a plan ========= */
if (part === 'all' || part === 's24') {
  const P = process.argv[3] === 'phone' ? 'p' : 'd'
  console.log(`\n##### S24 (Wed) — ${P === 'p' ? 'phone' : 'desktop'} #####`)
  const { browser, page, errors } = await open({ ...(P === 'p' ? PHONE : DESK), state: STATE })
  await installToasts(page)
  await go(page, 'viewsched')
  const optA = await page.evaluate(() => [...document.querySelector('#vWeek select[data-dver="2"]').options].find(o => o.value.startsWith('d:'))?.value)
  await viewPick(page, 2, optA)
  let v = await viewDay(page, 2)
  check(P + '.S24 the view page is looking at Plan A', /Viewing plan Plan A/.test(v.bar), v.bar)
  /* the rename and delete doors live on the edit page only; going there drops a view-page plan preview
     BY DESIGN (setPage — a 'd:' preview is view-page-only) */
  await go(page, 'editsched')
  const wedBar = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="2"] .dprev-bar')].map(b => b.innerText).join(''))
  check(P + '.S24 entering the edit page drops the view page\'s plan preview (no stale "Switch to this plan" bar)', !wedBar, wedBar)
  await planEdit(page, 2, 'Plan A')
  await modalName(page, 'Dry option')
  await modalDone(page)
  await go(page, 'viewsched')
  v = await viewDay(page, 2)
  console.log('S24 after rename', JSON.stringify(v))
  check(P + '.S24 back on the view page the picker carries the NEW name and no stale preview', v.picker && v.picker.opts.join('|') === 'Dry option|*Plan B ●' && !v.bar, `${JSON.stringify(v.picker)} bar "${v.bar}"`)
  const optD = await page.evaluate(() => [...document.querySelector('#vWeek select[data-dver="2"]').options].find(o => o.value.startsWith('d:'))?.value)
  await viewPick(page, 2, optD)
  v = await viewDay(page, 2)
  check(P + '.S24 looking at the renamed plan names it: "Viewing plan Dry option"', /Viewing plan Dry option — read-only/.test(v.bar), v.bar)
  await clip(page, P + '-27-S24-view-wed-renamed-plan-preview', '#vWeek .day[data-day="2"] .day-head', { pad: 8, extraH: 60 })
  await go(page, 'editsched')
  await planEdit(page, 2, 'Dry option')
  await modalTab(page, /Dry option/)
  await modalDelete(page)
  await modalDone(page)
  const hd = await h(page, 2)
  check(P + '.S24 delete down to one → the edit selector reads "Live working copy" (AM29)', /Live working copy/.test(hd.selector), hd.selector.trim())
  await go(page, 'viewsched')
  v = await viewDay(page, 2)
  console.log('S24 after delete', JSON.stringify(v))
  const wedTxt = await page.evaluate(() => document.querySelector('#vWeek .day[data-day="2"]').innerText.includes('WED PLAN B NOTE'))
  check(P + '.S24 the view page drops the plans picker (no plans left — AM31) and shows the live day (Plan B\'s content)', !v.picker && !v.bar && wedTxt, `${JSON.stringify(v.picker)} bar "${v.bar}" planB-note ${wedTxt}`)
  await clip(page, P + '-28-S24-view-wed-after-collapse', '#vWeek .day[data-day="2"] .day-head', { pad: 8, extraH: 60 })
  check(P + '.S24: no console errors', errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}

/* ======================= D. Astra 30 — the plan editor under a flip to member view ============ */
if (part === 'all' || part === 'a30') {
  console.log('\n##### Astra 30 — desktop #####')
  const { browser, page, errors } = await open({ ...DESK, state: STATE })
  await installToasts(page)
  await editWeek(page)
  await planEdit(page, 3, 'Plan B')
  let ms = await modalState(page)
  check('d.A30 the plan editor is open for the admin', ms.open, JSON.stringify(ms))
  /* the role toggle sits in the top bar, UNDER the editor's scrim — a click cannot reach it. Try the
     keyboard, the only other way a person could reach it while the editor is open. */
  let reached = false
  for (let i = 0; i < 80; i++) { await page.keyboard.press('Tab'); const id = await page.evaluate(() => document.activeElement && document.activeElement.id); if (id === 'roleBadge') { reached = true; break } }
  note('d.A30 keyboard reaches the role toggle behind the open editor', String(reached))
  if (reached) {
    await page.keyboard.press('Enter'); await page.waitForTimeout(800)
    ms = await modalState(page)
    /* count only what a person can SEE — the edit page stays mounted, hidden, behind the view page */
    const st = await page.evaluate(() => ({ page: window.CURPAGE, badge: (document.querySelector('#roleBadge') || {}).innerText,
      writers: [...document.querySelectorAll('#draftsModal:not([hidden]) input, #draftsModal:not([hidden]) button, [data-planmenu], [data-planedit], [data-unpub], [data-alpub], [data-beak], select[data-sign], [data-restore]')].filter(e => !e.closest('.page:not(.on)') && (e.offsetWidth || e.offsetHeight)).length }))   /* the edit page stays laid out at zero height when not .on */
    check('d.A30 after the flip to member view the editor is GONE and no plan / publish / sign door remains', !ms.open && st.writers === 0, `${JSON.stringify(ms)} ${JSON.stringify(st)}`)
    await screen(page, 'd-29-A30-after-flip-to-member')
    /* and back to admin: does the editor come back over the view page? */
    await page.locator('#roleBadge').click(); await page.waitForTimeout(800)
    ms = await modalState(page)
    const st2 = await page.evaluate(() => ({ page: window.CURPAGE }))
    note('d.A30 flip back to admin — the editor re-opens?', `${JSON.stringify(ms)} page ${st2.page}`)
    await screen(page, 'd-30-A30-after-flip-back-to-admin')
    if (ms.open) {
      /* the editor came back over the VIEW page. Its Select goes through switchDraft, which only works on
         the edit page — does the button do anything, or say why not? */
      await modalTab(page, /Plan B/)
      const before = (await bookDay(page, 3)).plans.join('|')
      await page.locator('#draftsModal button', { hasText: /^Select$/ }).click(); await page.waitForTimeout(600)
      const after = (await bookDay(page, 3)).plans.join('|'); const tt = await takeToasts(page)
      check("d.A30 the resurrected editor's Select either works or says why not (no dead control)", before !== after || tt.length > 0, `plans ${before} → ${after} · toast ${JSON.stringify(tt)}`)
      await screen(page, 'd-31-A30-editor-select-on-view-page')
      await modalDone(page)
    }
  } else {
    check('d.A30 the role cannot be flipped while the editor is open (the scrim covers the toggle; keyboard cannot reach it)', true)
  }
  check('d.A30: no console errors', errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}
process.exitCode = summary('w2-02-plans') ? 1 : 0
