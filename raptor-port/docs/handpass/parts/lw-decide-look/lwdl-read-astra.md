READ lw-decide-look

1. **Medium — keyboard focus disappears into the selected ring.**  
   An admin who tabs onto an already Approved or Refused button sees no change indicating that Enter will now act on it. This affects the bid window, day’s list and Approvals.

   **Cause:** `raptor-port/src/leavewar/ui/bidpicker.css:1950` gives the selected button a permanent outline identical to Approvals’ keyboard outline at `approvals.css:27`. There is no distinct focused-and-selected style.

   **Exact fix:** add sufficiently specific `:focus-visible` rules for the decided buttons on both surfaces, making the existing cyan ring thicker—for example, 3px with a 1px offset—without adding a second ring. Add browser assertions that keyboard focus visibly changes a decided button and remains visible on its grey neighbour. The added class-name tests cannot detect this failure.

2. **Low — the new icons enlarge Approvals’ buttons despite D2881 keeping their size.**  
   On desktop Approvals, Approve grows beyond its previous footprint, moving its left edge. The updated contract explicitly records 114px instead of 100px. This is a visible departure from the instruction to preserve size and place.

   **Cause:** `raptor-port/src/leavewar/ui/ApprovalsPage.tsx:591` adds the icon beside the reserved longer word. `bidpicker.css:1949` adds its width and margin, while `approvals.css:118` retains the original padding and only a minimum width.

   **Exact fix:** for desktop Approvals, keep both buttons at their previous 100px border-box width, with `flex: 0 0 100px`, and reduce horizontal padding to fit the icon and longer word inside that width. Preserve the phone-specific sizing separately. Add browser comparisons against the parent version for button dimensions and positions, with pending, approved and refused labels.

Checked and fine:

- All callers use the shared state-to-class helper consistently; picked ranges remain unlit.
- The grey alternative retains its action. Existing held-entry disabling remains separate.
- Second-tap handling still sends a decided entry back to pending.
- Approvals retains its existing row identity, decision tracking and Undo/Redo reconciliation; the new classes follow those states.
- The colour rules have sufficient specificity, remain scoped to the Leave War, and leave unrelated OIL controls alone.
- Icons use the button’s colour, are hidden from assistive technology and introduce no extra keyboard stop.

This was a code review. Tests were read, not run. Browser verification could not start because the read-only environment refused its temporary directory. No files were changed; no other reader’s or walk report was consulted.

Tidiness note—filed, not fixed:

- **Duplication:** the full appearance description repeats across several changed comments; the shared helper and stylesheet already provide its home.
- **Naming:** `dec-off` can suggest disabled; `dec-muted` would describe its actual meaning more clearly.
- **Comments:** “Size, row and words unchanged” is untrue for Approvals’ button width, as finding 2 explains.

Rulings: none this session.

