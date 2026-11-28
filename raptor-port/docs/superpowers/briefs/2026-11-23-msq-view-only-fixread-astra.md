Reviewed the exported copy at `a7a80b481`, with code equivalent to `a12b083c4`. **Two findings.**

1. **Closing a Leave War window can leave the forbidden page showing.**

   Ranger has View of 149. On 142’s Leave War, open his person window, pick 149 through the top bar, then close the window without editing anything. The app remains on Leave War under 149’s number. It should now land on 149’s View-only Sched.

   Cause: [store.ts](/D:/c151-astra/raptor-port/src/state/store.ts:98), `warHeld` / `landOnOfferedPage`, waits for the window. But [typing-hold.ts](/D:/c151-astra/raptor-port/src/state/typing-hold.ts:105), `warWindowGone`, wakes the landing only when a warning band exists. Here both the loaded war and Ranger’s own squadron remain 142, so there is no band.

   **Fix:** recheck the pending landing when the last war window closes, independently of whether a band exists.

   **Failing test:** add inside the existing Leave War window tests, using their `BidWindow`:
   ```tsx
   it('lands after a View holder closes the last window', async () => {
     signInAs('saber')
     expect(saveAccess(ACCT.ranger, {
       grants: { u149: 'view' }
     })).toBeNull()
     signInAs('ranger')
     act(() => { setPage('leavewar'); notify() })
     render(<BidWindow />)

     act(() => { void pickSquadron('u149') })
     expect(CURPAGE).toBe('leavewar')
     fireEvent.click(screen.getByRole('button', { name: 'Close Ranger' }))
     await act(async () => { await Promise.resolve() })

     expect(UNIT).toBe('u149')
     expect(CURPAGE).toBe('viewsched') // remains leavewar
   })
   ```
   Import `CURPAGE` from the view state. Do not add a manual notification after closing: that would hide the fault.

2. **One slow outside press still closes both the squadron list and the menu.**

   Open ☰, open its squadron list, then press the surrounding shade and hold for about one second before releasing. Both close. The first press should close only the list.

   Cause: [Drawer.tsx](/D:/c151-astra/raptor-port/src/ui/Drawer.tsx:144), `listJustClosed`, recognises the originating click only for 700 milliseconds. A longer press outlasts that allowance.

   **Fix:** track the originating press and consume its click, rather than using elapsed time.

   **Failing test:** in the existing menu test harness, with `vi` imported:
   ```tsx
   it('one slow outside press closes only the list', () => {
     give(ACCT.ranger, 'u149', 'view')
     signInAs('ranger')
     render(<Drawer />)
     openDrawer()
     fireEvent.click(markBtn()!)
     const shade = document.getElementById('drawer')!

     fireEvent.pointerDown(shade)
     vi.setSystemTime(Date.now() + 800)
     fireEvent.pointerUp(shade)
     fireEvent.click(shade)

     expect(document.querySelector('#drawerSqnList')).toBeNull()
     expect(DRAWER).toBe(true) // false today
   })
   ```

**Read:** the brief, both supplied diffs, project review rules and relevant rulings; the changed code and tests; related permissions, notification navigation, Undo/Redo, window lifecycles, Tracker confirmation, and stylesheet rules. Excluded reports and walkthrough evidence stayed closed.

**Checks:** reproduced both causes using the actual affected logic in memory. The proposed integration tests were not run: this export has no installed dependencies. No build, browser walk, or file changes.

**Tidiness note for the host:** the top-bar and ☰ lists duplicate their keyboard and dismissal behaviour; sharing that behaviour would reduce future drift.

Rulings: none this session.