Reviewed the exported copy of `c2bcdb990`, using `FIX.diff`. **One finding.**

1. **[P2] A cancelled touch swallows the next keyboard activation.**

   Open the phone menu and its squadron list. Start swiping below the list so it closes, then the browser cancels the touch for scrolling. Move keyboard focus to TALON and press Enter or Space.

   **Actual:** nothing opens until the second activation. **Expected:** the first keyboard activation opens the list. Logout, the member-view button and squadron rows can likewise lose a keyboard click.

   **Cause:** [Drawer.tsx:99](/D:/c151-astra4/raptor-port/src/ui/Drawer.tsx:99), `Drawer`’s `onClickCapture`. `PRESS_CLOSED_LIST` survives cancellation; keyboard clicks have no preceding pointer-down to clear it. Moving suppression into capture now blocks the button itself.

   **Fix:** consume the remembered flag without suppressing keyboard-generated clicks (`detail === 0`), and clear it on pointer cancellation. Keep suppression for the closing touch’s click.

   **Failing test**, using the existing menu test’s helpers:

   ```tsx
   it('a cancelled swipe does not swallow keyboard activation', () => {
     give(ACCT.ranger, 'u149', 'view')
     signInAs('ranger')
     render(<Drawer />)
     openDrawer()
     fireEvent.pointerDown(markBtn()!)
     fireEvent.click(markBtn()!, { detail: 1 })

     const heading = document.querySelector('#drawer-panel h4')
       ?? document.querySelector('#drawer .drawer-panel h4')!
     fireEvent.pointerDown(heading)
     fireEvent.pointerCancel(heading)
     expect(document.querySelector('#drawerSqnList')).toBeNull()

     act(() => markBtn()!.focus())
     fireEvent.keyDown(markBtn()!, { key: 'Enter' })
     // The native button's keyboard-generated click:
     fireEvent.click(markBtn()!, { detail: 0 })
     expect(document.querySelector('#drawerSqnList')).not.toBeNull()
   })
   ```

Read: the brief, diff, both changed implementations and test files; squadron rows, outside-click and Escape handling; Tracker discard/save/load paths, storage status, switch and logout callers; applicable rulings and backlog.

Checks: reproduced the swallowed keyboard click by executing the extracted handler. Extracted Tracker status checks preserved refusal messages and suppressed “saved” for failed or unavailable storage. No further finding in the discard change. These were isolated checks, not browser or integration tests; dependencies are absent. No build run or file changed.

Tidiness notes: none.

Rulings: none this session.