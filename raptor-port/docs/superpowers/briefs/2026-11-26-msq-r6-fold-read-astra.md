# Build 1 plan after the round-5/6 fold, red team — Astra (blind; chat 191, 26 Nov 26)

Read from the exported copy C:\rc191 of 22ada16e1 by codex exec -m gpt-6-astra, high. Saved whole by the host.

**Changes are needed before the four-section build starts.** I found four medium-severity issues and one lower-severity issue. The fold mostly preserves your answers, but it promotes one unanswered behaviour to an answer, extends another ruling beyond its scope, and leaves two dependencies out of the build order.

This is a blind, read-only review of the supplied copy. I changed nothing and read no other reader’s report from this round.

**1. Medium — the posting test confuses saving a waiting posting with carrying it out.**

**Where:** §22, PS6; D306.

PS6 asks for “the amber line and no posting, as today”. That does not accurately describe today’s behaviour.

For example, Saber is 142’s last admin and confirms an Overseas Sqn posting. Today the posting is accepted and retained, but he remains unarchived and his account stays enabled. Once another admin can sign in, the saved posting runs automatically. The existing outcome test explicitly checks that sequence.

A builder following “no posting” could prevent confirmation or discard the posting while still satisfying the new test. The admin would then have to remember to enter it again. That changes behaviour in a section expressly limited to appearance.

**Plan fix:** rewrite PS6 to distinguish the two events:

- Confirmation saves the posting and its date.
- While the last-admin restriction holds, none of its effects runs.
- The waiting reason remains visible.
- Once another admin can sign in, the saved posting runs without another confirmation.

Keep genuine refusals, such as deleting oneself, separate from this waiting case.

**2. Medium — each admin’s separate acknowledgement of bug reports was not answered by E9j.**

**Where:** the head’s treatment of defaults; §17 item 12; §19.6, V24; BL4.

The plan now treats every lettered E9 reading as approved. Item 12 includes “each admin’s own look at Help is what puts his bell out”.

But the approved E9j text covers three things: keeping reports, showing their squadron number, and notifying Plan holders. It does not describe separate acknowledgements. D9 covers the shared list and its appearance, not this behaviour.

This is a real change. Today one admin opening Help marks the reports seen for everyone. Under V24, Kestrel opens Help and his bell goes out, while Saber’s stays lit until Saber opens Help himself.

D227 expressly approves separate acknowledgements for **access requests**. It does not establish the same answer for bug reports.

**Plan fix:** separate this clause from the answered E9j items. Either cite an approval that actually covers bug reports, or put the proposed behaviour back among the unanswered readings, with V24 and the corresponding saved acknowledgement records conditional on that answer. Report persistence and the approved audience need not wait for it.

**3. Medium — the posting section cannot use the required test setup while remaining independent.**

**Where:** §21’s rules for every section; K0; §21.4; §21.5’s shared test-world row.

Every new test file must use the new three-squadron setup. Only the core’s K0 creates it, and only the core may change that shared setup.

The posting section, however, starts immediately, waits on nothing, and is proposed to branch from the main version so it can ship alone. The supplied code does not contain the required new setup.

As soon as the posting builder writes the first prescribed new test, it depends on code belonging to the batch. Bringing in the whole batch defeats independent shipping; inventing a separate setup contradicts the stated ownership and test rules.

**Plan fix:** make the three-squadron setup a small, independent prerequisite that both branches receive, and name that dependency explicitly. Alternatively, authorize a self-contained posting test setup that meets the same three-squadron requirement. Do not leave both “every new test uses the core’s setup” and “waits on nothing” in force.

This is the earliest concrete implementation failure I found once the required drawings have been approved.

**4. Medium — the Users section’s first step needs a guard that its stated starting point has not built.**

**Where:** §19.1, V1 and V4; §19.11’s first building step; §21.2, U1.

U1 waits for K2 and says “Nothing else”. Yet its assigned tests include changing an access line, leaving it unsaved, and refusing a squadron pick.

K2 moves the Add a person form. The actual refusal at the squadron picker arrives at K4. In the supplied code, the picker asks about Tracker edits but does not refuse because a Users access line has changed.

There is another split inside V1: it already tests “Edit on 142”, although §21 assigns that link to U3 after K4.

Consequently, a Users builder starting at the advertised point cannot finish the assigned tests without waiting for later core work or building controls owned by another section.

**Plan fix:** divide these tests at the same boundaries as the work:

- U1 proves the restricted row, its own save, Cancel, and its report of an unsaved change.
- After K4, a named integration check proves that the changed row refuses a pick.
- U3 owns the “Edit on 142” behaviour and its refusal cases.

Update both §19.11 and §21.2. This lets the protection against editing another squadron’s full record proceed promptly without silently depending on K4.

**5. Low — the phone’s people-list ruling is applied to the transfer destination without approval.**

**Where:** §22’s “To squadron” paragraph; D2646; D2652 N6b.

The plan says the destination dropdown opens as the phone’s own list, citing “D2646’s kind of list”.

D2646 names the sign-off boxes and the Person list in “+ Input”. The approved N6b text instead describes the destination dropdown in the app’s own dropdown appearance.

A builder following §22 would therefore draw a different destination control and present it as already settled. Although transfer itself comes later, the opened destination list is among the drawings this section owes before building.

**Plan fix:** remove the extension of D2646. Preserve N6b’s approved description, or explicitly mark the destination’s use of the phone’s list as a separate interpretation to settle before that drawing. The approved “To squadron” label is unaffected.

**Ruling-by-ruling result**

“Carried through” below means the revised plan assigns the answer to work and checks; it does not mean that work is already built.

| Ruling | Result |
|---|---|
| D2638 | Carried through: coloured bell numbers, their existing position retained, unread dot blue. |
| D2639 | Carried through: colours chosen separately by each admin. |
| D2640 | Carried through: Display is a page of sections, beginning with squadron colours. |
| D2641 | Carried through in §19.12: outside access and people moving are visible together. |
| D2642 | Carried through: phone fades wait until the menu closes. |
| D2643 | Carried through: separate Incoming and Outgoing groups. |
| D2644 | Carried through as a drawing requirement for aligned, equally sized adjacent buttons. |
| D2645 | Carried through with D2646’s correction: drawings must represent the real lists. |
| D2646 | Correct for the people lists; extended too far in §22. Finding 5. |
| D2647 | Carried through: one search covers every group and hides groups without matches. |
| D2648 | Carried through: one posting design; the Users implementation remains with transfer. |
| D2649 | Carried through: no warning about similar colours. |
| D2650 | Carried through: own people, Outgoing, Incoming, then outside access; the three groups fold. |
| D2651 | Carried through: heading jumps on desktop and phone. |
| D2652 | Substantially carried through, including the revised order, role words and jumps. N6b has the exception in finding 5. |
| D2653 | Way C and its readings are carried through, but PS6 must preserve existing posting behaviour. Finding 1. |
| D2654 | E1–E8 and the actual E9 recommendations are carried through. Separate bug-report acknowledgements were added to what E9j answered. Finding 2. |
| D2655 | Carried through: short rows, reasons beneath unavailable choices, “Someone new” before Add, plain View-only badge, and the existing people lists. |

The named defaults for E1–E8, D5, D6, D8, D10, D11 and D12 match the adopted recommendations. The blanket conversion of E9-labelled plan text into “his answer” is too broad because of finding 2. The plan correctly recognizes that round 6 replaced the older E9g placement of Plan holders.

**The parallel split still needs explicit coordination beyond these findings.**

The plan already identifies shared posting styles, permission rules, Admin navigation, and the bell’s two-number presentation. I have not counted those admissions as newly discovered findings.

They are nevertheless unfinished build instructions. In particular, the Users bell test expects presentation owned by the bell section. “Whichever lands second meets the test” needs a named combined check and a clear account of what each section must pass independently. It cannot silently override the requirement that each completed step passes its tests.

The separate names for new Users and bell tests address their original shared-test problem. I did not establish another specific existing-test collision from the code I examined.

**Scope and limits**

I read the changed plan sections, their supporting passages, the full D2620–D2657 rows, relevant additional rulings, the required project guidance, and the approved question-page text used above. I read the relevant current code and existing assertions for posting, report acknowledgement, squadron picking, Users grouping and shared navigation.

I searched the wider source and test inventory for ownership and dependency checks; I did not read every listed test or every application file. I did not run tests, launch the app, inspect the drawings visually, or verify current remote branches. These are findings about the supplied plan and code, not observed browser failures.

Rulings: none this session.