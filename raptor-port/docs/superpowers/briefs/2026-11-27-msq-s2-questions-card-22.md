# Admin → Users — question 22 for the one questions page, two parts (chat 205, 27 Nov 26)

Drafted by a fresh Fable (U2's planning read), reviewed and adjusted by a second fresh Fable (D2441), facts checked
against the code. Two decisions, each answered by itself (22A, 22B). **ANSWERED 27 Nov 26: "22 as recommended" — D2816 (22A: choice A)
and D2817 (22B: choice A), the coordinator's records; he was told plainly that a new squadron's first admin, holding it
by Plan, can make no admin of it, and did not say otherwise. Built with U2; the cards are off the page (version 29).** Pictures:
`raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/q22-*`. Neither holds U2's builder (choice B's words, already
approved, are built meanwhile).

## 22A. The last-admin note, for a new squadron with no admin of its own yet

**When it happens.** Saber, a master admin, makes squadron 151 with "+ New squadron" and names Kestrel, 149's admin, as
its first admin. Kestrel stays in 149 and is given Plan of 151, so 151 has no admin of its own yet. Later Osprey, 149's
other admin, opens Kestrel's row on 149's Admin → Users, sets his Role to Member and presses Save. The app refuses:
Kestrel's Plan of 151 would end with it, and he is the only admin 151 has. Suspend, Archive and Delete on his row are
refused with the same note. Rare, but every squadron made with "+ New squadron" starts this way, until it has an admin
of its own.

**What it says today.** "Kestrel is 151's last admin. Only a master admin or an admin of 151 can make another." By your
answer to question 13 it would become "Kestrel is 151's last admin. Only 151's own admins or a master admin can make
another." But 151 has no admins of its own, and Kestrel, who only holds Plan of it, can no longer make one either. Only
a master admin can.

**Recommended — A.** Where the squadron has no admin of its own, the note names the one person who can help:

> Kestrel is 151's last admin. Only a master admin can make another.

It is true here, it is shorter, and Osprey knows whom to ask.

**The other choice — B.** Keep question 13's words here too:

> Kestrel is 151's last admin. Only 151's own admins or a master admin can make another.

One sentence everywhere, but it sends Osprey looking for admins 151 does not have.

With either answer, a master admin still reads "Kestrel is 151's last admin. Make another admin of 151 first."

## 22B. The note under "What each role allows"

**When it happens.** Hunter is 142's admin and has Plan of 149. With 149 picked he opens Merlin, a 149 member, on
Admin → Users and sees "Admin" greyed in the Role box. He opens "What each role allows" on the same row to check what
Plan lets him do. Now and then; mostly admins new to the page.

**What it says today.** In the table's Admin row, the ticks under "Admin" and "Plan" carry a small 5. Note 5 under the
table reads "Only a master admin makes squadrons, gives Plan or makes a master admin." You have approved new words for
it: "Only a master admin makes squadrons or master admins. Plan of a squadron is given by its own admins or a master
admin." Since then you chose that an admin with Plan cannot make an admin of that squadron. The note does not say so,
so the table reads as if he could.

**Recommended — A.** The second sentence says both things:

> Only a master admin makes squadrons or master admins. Only a squadron's own admins or a master admin can give Plan of it or make its admins.

The table then lists everything the Plan tick leaves out, in the same shape as the lines at the Role box and the Plan
button.

**The other choice — B.** Leave the approved note as it is. It is a few words shorter, and the greyed "Admin" with its
line still tells Hunter at the Role box. But the table, the one place that lists what each role allows, would leave
this limit out.

## For the builder and the record (not card text)

- 22A's ending applies whenever the squadron named has no admin at home (the refusal came through its Plan holder), in
  the dated form too. Today's `lockWords` (`state/accounts.ts`) also still treats a Plan holder of the named squadron as
  someone who can "make another"; after question 13 that is no longer true. Archive says the same words through
  `leavewar/sync.ts archiveLockWords`.
- 22A, facts: "+ New squadron" needs a first admin picked from existing admins, never a master admin; he is given Plan
  of the new squadron and stays at home (`state/units.ts addUnit`, `firstAdminProblem`); its Plan holder counts as its
  last admin (`state/lastadmin.ts`, the "none at home but a Plan holder" branch); making Kestrel a member drops his Plan
  of 151 in the same save, and the refusal names 151.
- A consequence of his answer to question 13 the card states and he may not have seen in so many words: a new
  squadron's first admin, holding it by Plan, cannot make any admin for it — only a master admin can, until the
  squadron has one of its own (an older answer of his, 21 Nov, assumed the Plan holder could). Told to the coordinator.
- "Last admin" stays the phrase (the app's one name for this refusal).
