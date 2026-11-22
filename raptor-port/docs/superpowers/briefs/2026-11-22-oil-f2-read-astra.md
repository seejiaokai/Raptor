Three findings. All reproduce with newly created data.

1. P2 — A held name signs content changed after the name was picked.

Steps: On Saturday with unanswered Training, pick CUR CK. Leave the list open, change the day’s programme notes behind it, then press Later.
Actual: The held box remains visible and the name becomes a valid signature on the changed content.
Expected: The old hold should expire when its content changes, consistent with signatures belonging to the content selected for signing.
Cause: src/ui/oilsign.ts, holdStands (lines 96–97), checks date, squadron and plan identity, but not content. holdLater and holdSave subsequently bind the name to whatever content now exists.
Fix: Capture the content binding when holding the name. Reject unrelated changes before either completion path; check before Save writes its own permitted OIL answers.

Paste into src/ui/oilsign.test.tsx:

    it('does not carry a held name onto changed content', async () => {
      const { txtSet } = await import('../engine/slots');
      signPick(SAT, 'cur', 'ignite'); await draw();
      await act(async () => {
        txtSet('pn:5', 'A different plan of work'); view.afterSchedMutate();
      });
      await click('odl-later');
      expect(signOf(SAT).cur).toBeFalsy();
    });

2. P2 — Cancelling a repeated sign-off can prevent selecting that same name again.

Steps: Save an OIL answer and the held CUR CK name. Remove that input’s OIL answer through its editor, invalidating the signature. Pick the same CUR CK name again, then cancel the list with X or Escape. Pick that name once more.
Actual: The displayed box is unsigned, but its native select already contains the old name. Selecting it again produces no change event, so neither the question nor the signature returns.
Expected: Cancellation leaves the box ready to ask again on the next pick (D2299).
Cause: src/ui/oilsign.ts, signNow (line 128), reads raw signOf instead of signShown. Shell.tsx (line 212) restores that stale value. The schedule renderers skip replacing unchanged markup, leaving the mismatch intact.
Fix: Restore the displayed, binding-validated value from signShown.

Paste into src/ui/oilsign.test.tsx:

    it('restores the visible unsigned value after holding a repeat pick', async () => {
      const { signNow } = await import('./oilsign');
      const { signShown } = await import('../engine/publish');
      signPick(SAT, 'cur', 'ignite'); await draw();
      await click('odl-yes-fx-train'); await click('odl-save');
      await act(async () => {
        writeInputsBatch(() => {
          delete (INPUTS.find((r: any) => r.iid === 'fx-train') as any).oil[SAT_ISO];
        });
        view.afterSchedMutate();
      });
      expect(signShown(SAT).cur).toBe('');
      expect(signPick(SAT, 'cur', 'ignite')).toBe('held');
      expect(signNow(SAT, 'cur')).toBe('');
    });

3. P2 — A refused Later still consumes the question and closes the list.

State: Hold a name with unanswered Training; have the command layer refuse the signature write, then press Later. Reproduced using its existing conflict-check injection.
Actual: No signature is saved, but the list closes and the input is remembered as skipped. Once the refusal clears, the next pick signs immediately without asking.
Expected: Later’s promised signature and its “ask no more” state should succeed together (D2294/D2299).
Cause: src/ui/oilsign.ts, holdLater (lines 101–106), updates OILSIGN_LATER before writing. writeSign discards the command outcome, and OilDayList.tsx’s later handler closes unconditionally.
Fix: Return the signature command’s outcome. Only remember skipped inputs and close after a successful write; retain the hold on refusal.

Paste into src/ui/oilsign.test.tsx:

    it('does not consume the question when Later is refused', async () => {
      const { setConflictChecker } = await import('../command');
      signPick(SAT, 'cur', 'ignite'); await draw();
      try {
        setConflictChecker(() => 'test refusal');
        await click('odl-later');
      } finally { setConflictChecker(null); }
      expect(signOf(SAT).cur).toBeFalsy();
      expect(signPick(SAT, 'cur', 'ignite')).toBe('held');
    });

Tidiness note, filed only: SignHold’s shape is duplicated in both OILLIST declarations in pops.ts. No dead executable addition identified. signNow misleadingly means “raw stored name”; signPick’s “signed” result also does not establish that the command succeeded.

Verification: All three regression tests failed against the exported code in an in-memory TypeScript/jsdom harness; its eight existing sign-off tests passed in that harness. This was not a Vitest suite run or a browser walk. The export lacks the normal test setup and some required guidance, including the handoff, backlog and full ruling rows. No files changed; no other reader or walk report consulted.

Rulings: none this session.