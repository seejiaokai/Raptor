/* w3-02 — the two roles and the session boundaries, at desktop AND phone.
     S13 steps 3–5 (Fable) · Astra 14 (log out/in as admin and as member, View-as and back, resize) ·
     S20 + Astra 25 (the viewer's issued face by default, as a member AND as the admin viewing as member) ·
     Astra 33 (an armed "Withdraw — confirm" must not survive navigation: a page change, the View-as flip; a
     preview does clear it) · D148 evidence (what Undo offers and does after an admin publishes, logs out and a
     member logs in — DECIDED, NOT BUILT: recorded, never called a defect) · AM32 (Unpublish is a standing
     action: still offered, and still works, after a logout).
   Usage: node w3-02-roles.mjs [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w3'
const L = await import('./w3-lib.mjs')
const { open, STATE, W, checker, watchToasts, toasts, editWeek, head, book, signDay, publishDay, shot, go, viewDay, pickView,
  dayInfo, menuLook, unpubBtn, tapUnpub, lwBid, lwRead, logout, signIn, flipRole, roleNow, undoState, pressHist, navTo, allHeads,
  closePops } = L
const which = process.argv[2] ? [process.argv[2]] : ['desktop', 'phone']
const SAT_MEN = ['Saber', 'Piston', 'Ridge', 'Basher', 'Reaper', 'Anvil']

for (const w of which) {
  const { check, note, summary } = checker('w3-02 ' + w)
  const { browser, page, errors } = await open({ ...W[w], state: STATE })
  await watchToasts(page)
  const P = s => `w3-02-${w}-${s}`
  const dayShot = async (s, di, root = '#eWeek') => {
    const d = page.locator(`${root} .day[data-day="${di}"]`).first()
    await d.evaluate(e => { e.scrollIntoView({ block: 'start', inline: 'start' }); window.scrollBy(0, -(window.innerWidth < 820 ? 64 : 150)) }); await page.waitForTimeout(350)
    await shot(page, P(s))
  }
  try {
    /* ---------------- SETUP (admin): a bid against Saturday, then Friday published ---------------- */
    note('bid', await lwBid(page, 'Saber', '2026-07-21', 'OIL'))
    await editWeek(page)
    await signDay(page, 4)
    const pf = await publishDay(page, 4)
    const hf = await head(page, 4)
    note('Fri published by the admin', { pf, tag: hf.tag, toasts: await toasts(page) })
    check('setup: Friday published (ORIG)', hf.tag === 'ORIG', hf.tag)
    const ua = await undoState(page)
    note('admin undo after publishing', ua)

    /* ---------------- LOG OUT → LOG IN AS THE MEMBER ---------------- */
    await logout(page)
    await signIn(page, 'm')
    const rm = await roleNow(page)
    note('member landed', rm)
    check('AM17: the member lands on View-only Sched with no Edit Schedule tab', rm.page === 'viewsched' && !rm.editTab, JSON.stringify(rm))
    const m0 = await viewDay(page, 0)
    note('member Mon (default)', m0)
    check('S20/Astra25: the member sees Monday\'s ISSUED face by default ("AL1 — as issued")', m0.picker[0] === '*AL1 — as issued', m0.picker.join(' / '))
    check('S20/AM24: the issued face carries no pending chip, no "Not yet signed", no dotted marks', !m0.pending && !m0.nys && m0.pend === 0, `pending="${m0.pending}" nys=${m0.nys} dotted=${m0.pend}`)
    check('AM17: no writer on the member\'s view (no Unpublish, Publish, sign-off, plans menu)', m0.writers === 0, 'writers=' + m0.writers)
    await dayShot('a-member-mon-issued', 0, '#vWeek')
    await pickView(page, 0, 'working')
    const m1 = await viewDay(page, 0)
    note('member Mon (working)', m1)
    check('S20/AM5: the member\'s "Working draft" is stamped and names the issued version', /Working draft/.test(m1.stamp) && /the issued schedule is AL1/.test(m1.bar), `${m1.stamp} | ${m1.bar}`)
    check('S20/AM24: the working draft shows the pending change and "Not yet signed"', /1\s+pending/.test(m1.pending) && m1.nys && m1.pend >= 1, `pending="${m1.pending}" nys=${m1.nys} dotted=${m1.pend}`)
    await dayShot('b-member-mon-working', 0, '#vWeek')
    const di0 = await dayInfo(page, 0, P('c-member-mon-dayinfo'))
    note('member Mon ⓘ (while on the working draft)', di0)
    await pickView(page, 0, 'issued')
    const m2 = await viewDay(page, 0)
    check('S20: back to "as issued" the face is frozen again', m2.picker[0] === '*AL1 — as issued' && m2.pend === 0 && !m2.nys, m2.picker.join(' / '))
    const f0 = await viewDay(page, 4)
    check('S20: the member sees the admin\'s just-published Friday as issued', f0.picker[0] === '*Original — as issued', f0.picker.join(' / '))

    /* D148 evidence — the member's Undo (the Leave War's, the only one a member can reach) */
    await go(page, 'leavewar'); await page.waitForTimeout(800)
    const mu = await undoState(page)
    note('D148 member undo offered', mu)
    await shot(page, P('d-member-lw-undo'))
    const mp = await pressHist(page, 'undo')
    note('D148 member presses Undo', mp)
    check('D148 record: the member\'s Undo does not change the admin\'s publish (refused)', !mp.pressed || (mp.toasts || []).some(t => /someone else/.test(t)), JSON.stringify(mp))
    note('D148 NOT BUILT (recorded, not a defect)', `after the admin signed out, the member's Undo is ${mu.undo && mu.undo.disabled ? 'disabled' : 'ENABLED'} with title "${mu.undo && mu.undo.title}"; pressing it says ${JSON.stringify(mp.toasts || mp.why)}`)
    /* NOT walked: a member's OWN undoable change on this war — the demo war is past its bidding stage, so a
       member's tap on his own row opens no sheet (probe w3-00d). The refusal is pressed twice more to show
       it repeats the same words every time rather than going quiet. */
    const mp3 = await pressHist(page, 'undo')
    note('D148 member presses Undo a second time', mp3)
    check('D148 record: a repeated press says the same thing (it never goes quiet or does something)', (mp3.toasts || []).some(t => /someone else/.test(t)), JSON.stringify(mp3.toasts))

    /* ---------------- LOG OUT → LOG IN AS THE ADMIN AGAIN ---------------- */
    await logout(page)
    await signIn(page, 'a')
    await navTo(page, 'editsched')
    const ua2 = await undoState(page)
    note('D148 admin undo after logging back in', ua2)
    note('D148 NOT BUILT (recorded)', `after sign-out and sign-in the admin's Undo reads "${ua2.undo && ua2.undo.title}" (${ua2.undo && ua2.undo.disabled ? 'disabled' : 'enabled'}) — D148 says the list clears on sign-out`)
    const heads = await allHeads(page)
    note('heads after re-login', heads)
    const pubDays = [0, 1, 3, 4, 5, 6].filter(di => heads[di] && !/^DRAFT/.test(heads[di]))
    check('AM32: after a logout Unpublish is still offered on every published day (a standing action)', pubDays.every(di => /\|Unpublish\|/.test(heads[di])), pubDays.map(di => di + ':' + heads[di].split('|')[5]).join(' '))
    const uf = await tapUnpub(page, 4)
    const hf2 = await head(page, 4)
    note('Fri Unpublish after the logout', { uf, hf2 })
    check('AM32: Unpublish still WORKS after a logout (Friday, published last session, pulled back on one tap)', hf2.tag === 'DRAFT', hf2.tag)
    await dayShot('e-admin-fri-unpublished-after-relogin', 4)

    /* ---------------- VIEW AS MEMBER and back, with a preview open and an arm up ---------------- */
    const lk = await menuLook(page, 3, /^Original/)
    note('Thu preview', { lk, sel: (await head(page, 3)).selector })
    const arm = await tapUnpub(page, 5)
    note('Sat arm', arm)
    check('setup: Sat armed ("Withdraw — confirm")', arm.after && /confirm/.test(arm.after.text), JSON.stringify(arm.after))
    const fl1 = await flipRole(page)
    const rv = await roleNow(page)
    note('flipped to member', { fl1, rv })
    check('S13/Astra14: View as member lands on View-only Sched with no Edit tab and a Member badge', rv.page === 'viewsched' && !rv.editTab, JSON.stringify(rv))
    const vm0 = await viewDay(page, 0)
    check('Astra25: the admin-as-member sees Monday\'s issued face by default', vm0.picker[0] === '*AL1 — as issued' && !vm0.nys && vm0.pend === 0 && vm0.writers === 0, vm0.picker.join(' / '))
    await dayShot('f-viewas-member-mon', 0, '#vWeek')
    const fl2 = await flipRole(page)
    await navTo(page, 'editsched')
    const h3b = await head(page, 3), s5b = await unpubBtn(page, 5)
    note('back to admin', { fl2, thu: h3b.selector, sat: s5b })
    note('S13 step 5: Thu preview across the flip (DPREV survives by design — Fable "fine")', h3b.selector.replace(/\s+/g, ' '))
    check('Astra33/S13: the View-as flip cancels the armed "Withdraw — confirm"', s5b && s5b.text === 'Unpublish', JSON.stringify(s5b))
    await dayShot('g-sat-after-flip', 5)
    const t1 = await tapUnpub(page, 5)
    const h5 = await head(page, 5)
    note('one tap on Sat after the flip', { t1, tag: h5.tag })
    check('Astra33: after the flip ONE tap must not withdraw a day whose OIL is bid against (a fresh warning first)', h5.tag !== 'DRAFT', `tag=${h5.tag} toasts=${JSON.stringify(t1.toasts)}`)
    if (h5.tag === 'DRAFT') {
      const lw1 = await lwRead(page, SAT_MEN, '2026-07-18')
      note('money after that single-tap withdrawal', lw1)
      await editWeek(page)
    } else if (t1.after && /confirm/.test(t1.after.text)) {
      await tapUnpub(page, 5)   // the second, deliberate tap
    }
    /* republish Saturday → the credits come back (AM37: republish restores) */
    await signDay(page, 5)
    const rp = await publishDay(page, 5)
    note('Sat republished', { rp, tag: (await head(page, 5)).tag, toasts: await toasts(page) })
    const lw2 = await lwRead(page, SAT_MEN, '2026-07-18')
    note('money after the republish', lw2)
    check('AM37/AM46: republishing Saturday restores the Leave War credits', Object.values(lw2).every(v => /[FH]O/.test(v)), JSON.stringify(lw2))

    /* ---------------- Astra 33: a PAGE CHANGE and a PREVIEW with the arm up ---------------- */
    await navTo(page, 'editsched')
    const arm2 = await tapUnpub(page, 5)
    note('re-armed', arm2.after)
    await navTo(page, 'inputs')
    await navTo(page, 'editsched')
    const s5c = await unpubBtn(page, 5)
    check('Astra33: a page change (Edit → Inputs → Edit) cancels the armed "Withdraw — confirm"', s5c && s5c.text === 'Unpublish', JSON.stringify(s5c))
    await dayShot('h-sat-after-page-change', 5)
    if (s5c && /confirm/.test(s5c.text)) {
      await menuLook(page, 3, /^Original/)
      const bk = page.locator('#eWeek [data-golive="3"]:visible').first(); if (await bk.count()) { await bk.click(); await page.waitForTimeout(500) }
      const s5d = await unpubBtn(page, 5)
      check('Astra33: opening a preview (any day) and coming back cancels the arm', s5d && s5d.text === 'Unpublish', JSON.stringify(s5d))
    }

    /* ---------------- Astra 14: resize desktop ↔ phone does not change the state ---------------- */
    await menuLook(page, 3, /^Original/)
    const before = await allHeads(page)
    await page.setViewportSize(w === 'desktop' ? W.phone : W.desktop); await page.waitForTimeout(900)
    const mid = await allHeads(page)
    await page.setViewportSize(W[w]); await page.waitForTimeout(900)
    const after = await allHeads(page)
    note('heads before / other width / back', { before, mid, after })
    check('Astra14: resizing to the other width and back changes nothing (same version, pending, plan, preview on every day)',
      JSON.stringify(before) === JSON.stringify(mid) && JSON.stringify(before) === JSON.stringify(after), Object.keys(before).filter(k => before[k] !== mid[k] || before[k] !== after[k]).map(k => `d${k}: ${before[k]} → ${mid[k]} → ${after[k]}`).join(' ; ') || 'same')
    await shot(page, P('i-after-resize'))
    note('book at the end', await book(page))
  } catch (e) { check('script ran to the end', false, String(e && e.stack || e).slice(0, 700)); await shot(page, P('zz-crash')).catch(() => {}) }
  check('no console errors during the walk', errors.length === 0, JSON.stringify(errors).slice(0, 400))
  summary()
  await browser.close()
}
