1. **[P2] A bell link can be swallowed after switching to the member view.** Hunter holds Plan of 149 and has loaded its Tracker. With 149 selected and the bell list open, use the keyboard to switch to the member view, then activate an already-read 142 leave notification. The bell closes, but 149’s View-only Sched remains. It should bring back 142 and open its Leave War. Reproduced through the navigation functions; a second activation succeeds.

   **Cause:** In [store.ts](/C:/Users/User/projects/Raptor-msq/raptor-port/src/state/store.ts:86), `realNotify` runs `maybeReenter` before `landOnOfferedPage`. The Tracker still belongs to 149, and the previous re-entry recorded its retry key before the war changed to 142. Consequently, another maintenance re-entry runs; `enterSquadron` replaces the requested Leave War page with `viewsched` before the navigation check sees it.

   **Fix:** Resolve an explicit page change against `LANDED` before maintenance re-entry can replace it. Bring home into view while preserving the requested page, then run the remaining checks. Record the re-entry retry key from the settled state. Add a regression test for this first activation.

2. **[P2] One outside tap closes both the squadron list and the phone menu.** Open the phone menu, expand its squadron list, then tap the shaded area beside the menu. Both close. The brief requires the list to close first, leaving the menu open. Reproduced with pointer-down and click events.

   **Cause:** In [Drawer.tsx](/C:/Users/User/projects/Raptor-msq/raptor-port/src/ui/Drawer.tsx:155), `DrawerSquadron` closes its list on `pointerdown`, but the subsequent click still reaches `Drawer`’s outside-click handler, which closes the whole menu.

   **Fix:** Coordinate dismissal between the two components: when an outside gesture begins with the squadron list open, close that list and consume that gesture’s subsequent click. Only a later outside gesture should close the menu. Test the complete pointer-down/click sequence.

3. **[P3] Down Arrow does not open the new squadron selector.** Focus the squadron button inside the phone menu and press Down Arrow. Nothing opens, although the existing top-bar selector supports this and the keyboard guide requires it. Reproduced.

   **Cause:** [Drawer.tsx](/C:/Users/User/projects/Raptor-msq/raptor-port/src/ui/Drawer.tsx:180), `DrawerSquadron`, provides only `onClick` on its button. Its arrow-key handler exists solely inside the list, which is not mounted yet.

   **Fix:** Add the top-bar selector’s ArrowDown/ArrowUp opening handler: prevent the default action and set `open` to `{ keyboard: true }`. Test opening, focused-row movement, selection, and Escape returning focus to the button.

