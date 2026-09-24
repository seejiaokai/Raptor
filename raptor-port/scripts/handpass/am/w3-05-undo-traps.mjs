/* w3-05 — two traps in the ONE Undo, found while walking S16/S17 (w3-04), each reproduced from the everything
   week in the fewest taps, through the edit week's own sign-off selects, "Publish day" and the top bar's
   Undo / Redo, at desktop AND phone. Each case runs in its own fresh world.

   CASE R — Redo gets stuck. Sign one role on Friday → Undo → sign one role on Saturday → Undo → Redo.
     Expected (AM39b — "every Undo / Redo says what it did"; a refusal must be something the person can act on):
     Redo brings Saturday's sign-off back — or Redo is not offered. Observed today: see the run.
   CASE S1 — the same day. Sign all four on Friday → Publish day → Undo (the publish) → Undo ("a sign-off").
     Expected (AM34/AM39c, global-undo design GU5-005: a published day pulled back must be RE-SIGNED to
     republish; undo of a publish clears the sign-offs and "the restore does NOT put the pre-publish sign-offs
     back"): undoing one sign-off leaves Friday with no more signatures than before the press.
   CASE S2 — across days. Sign all four on Friday → sign CUR CK on Saturday → Publish Friday → Undo (the
     publish) → Undo ("a sign-off" — Saturday's). Expected: Friday stays unsigned (it must be re-signed).
     Then, if Friday shows signed, press its "Publish day" to show what that allows.
   Usage: node w3-05-undo-traps.mjs [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w3'
const L = await import('./w3-lib.mjs')
const { open, STATE, W, checker, watchToasts, toasts, editWeek, head, signDay, signRole, publishDay, shot, undoState, pressHist } = L
const which = process.argv[2] ? [process.argv[2]] : ['desktop', 'phone']
const brief = h => h ? `${h.tag} | ${h.signState} | signs=${JSON.stringify(h.signs)} | pub=${h.beak ? (h.beak.text + (h.beak.disabled ? ' (locked)' : ' (ENABLED)')) : '-'}` : 'null'
const dayShot = async (page, name, di) => {
  const d = page.locator(`#eWeek .day[data-day="${di}"]`).first()
  await d.evaluate(e => { e.scrollIntoView({ block: 'start', inline: 'start' }); window.scrollBy(0, -(window.innerWidth < 820 ? 64 : 150)) }); await page.waitForTimeout(350)
  await shot(page, name)
}

for (const w of which) {
  const { check, note, summary } = checker('w3-05 ' + w)
  const P = s => `w3-05-${w}-${s}`

  /* ---------------- CASE R ---------------- */
  {
    const { browser, page, errors } = await open({ ...W[w], state: STATE })
    await watchToasts(page)
    try {
      await editWeek(page)
      const a = await signRole(page, 4, 'cur', 0)
      const u1 = await pressHist(page, 'undo')
      const b = await signRole(page, 5, 'cur', 0)
      const u2 = await pressHist(page, 'undo')
      const before = await head(page, 5)
      const st = await undoState(page)
      const tries = []
      for (let i = 0; i < 3; i++) { const r = await pressHist(page, 'redo'); tries.push(r.pressed ? (r.toasts || []).join(' / ') || '(no message)' : r.why) }
      const after = await head(page, 5)
      const st2 = await undoState(page)
      note('CASE R', { friSigned: a, undo1: u1.toasts, satSigned: b, undo2: u2.toasts, redoOffered: st.redo, redoPresses: tries, satBefore: brief(before), satAfter: brief(after), redoAfter: st2.redo })
      check('CASE R/AM39b: after "Undo" of Saturday\'s sign-off, Redo brings it back (or is not offered)',
        (st.redo && st.redo.disabled) || (after.signs[0] && !/name/.test(after.signs[0])),
        `Redo offered "${st.redo && st.redo.title}" (${st.redo && st.redo.disabled ? 'disabled' : 'enabled'}); 3 presses said: ${JSON.stringify(tries)}; Saturday CUR CK after: "${after.signs[0]}"`)
      await dayShot(page, P('a-caseR-redo-stuck'), 5)
    } catch (e) { check('CASE R ran', false, String(e && e.stack || e).slice(0, 500)) }
    check('CASE R: no console errors', errors.length === 0, JSON.stringify(errors).slice(0, 300))
    await browser.close()
  }

  /* ---------------- CASE S1 ---------------- */
  {
    const { browser, page, errors } = await open({ ...W[w], state: STATE })
    await watchToasts(page)
    try {
      await editWeek(page)
      const s = await signDay(page, 4)
      await publishDay(page, 4)
      const hp = await head(page, 4)
      const u1 = await pressHist(page, 'undo')
      const h1 = await head(page, 4)
      const st = await undoState(page)
      const u2 = await pressHist(page, 'undo')
      const h2 = await head(page, 4)
      note('CASE S1', { signed: s, published: brief(hp), undo1: u1.toasts, afterUndo1: brief(h1), undo2offered: st.undo && st.undo.title, undo2: u2.toasts, afterUndo2: brief(h2) })
      check('CASE S1: Undo of the publish clears Friday\'s sign-offs (AM39c/GU5-005)', h1.tag === 'DRAFT' && /4 to sign/.test(h1.signState), brief(h1))
      const n1 = h1.signs.filter(x => x && !/name/.test(x)).length, n2 = h2.signs.filter(x => x && !/name/.test(x)).length
      check('CASE S1/AM34: the next Undo ("a sign-off") does not bring the spent pre-publish signatures back',
        n2 <= n1, `signatures before that press: ${n1}; after "${(u2.toasts || []).join(' / ')}": ${n2} — ${brief(h2)}`)
      await dayShot(page, P('b-caseS1-after-second-undo'), 4)
    } catch (e) { check('CASE S1 ran', false, String(e && e.stack || e).slice(0, 500)) }
    check('CASE S1: no console errors', errors.length === 0, JSON.stringify(errors).slice(0, 300))
    await browser.close()
  }

  /* ---------------- CASE S2 ---------------- */
  {
    const { browser, page, errors } = await open({ ...W[w], state: STATE })
    await watchToasts(page)
    try {
      await editWeek(page)
      await signDay(page, 4)
      const sat = await signRole(page, 5, 'cur', 0)
      await publishDay(page, 4)
      const hp = await head(page, 4)
      const u1 = await pressHist(page, 'undo')
      const h1 = await head(page, 4)
      const st = await undoState(page)
      const u2 = await pressHist(page, 'undo')
      const h2 = await head(page, 4), s2 = await head(page, 5)
      note('CASE S2', { satSigned: sat, published: brief(hp), undo1: u1.toasts, fridayAfterUndo1: brief(h1), undo2offered: st.undo && st.undo.title, undo2: u2.toasts, fridayAfterUndo2: brief(h2), saturdayAfterUndo2: brief(s2) })
      check('CASE S2: Undo of Friday\'s publish clears its sign-offs', h1.tag === 'DRAFT' && /4 to sign/.test(h1.signState), brief(h1))
      const back = h2.signs.filter(x => x && !/name/.test(x)).length
      check('CASE S2/AM34: undoing SATURDAY\'s sign-off does not re-sign FRIDAY (a pulled-back day must be re-signed)',
        back === 0, `after "${(u2.toasts || []).join(' / ')}" Friday shows ${back} signature(s) — ${brief(h2)}`)
      await dayShot(page, P('c-caseS2-friday-after-undoing-saturday'), 4)
      if (h2.beak && !h2.beak.disabled) {
        const again = await publishDay(page, 4)
        const h3 = await head(page, 4)
        note('CASE S2 consequence: Friday\'s "Publish day" pressed with no one re-signing', { again, after: brief(h3), toasts: await toasts(page) })
        await dayShot(page, P('d-caseS2-friday-republished-unsigned'), 4)
      }
    } catch (e) { check('CASE S2 ran', false, String(e && e.stack || e).slice(0, 500)) }
    check('CASE S2: no console errors', errors.length === 0, JSON.stringify(errors).slice(0, 300))
    await browser.close()
  }
  summary()
}
