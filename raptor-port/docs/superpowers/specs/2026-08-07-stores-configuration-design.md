# Stores configuration — design

**Owner decisions, 7 Aug 26.** Design agreed in conversation; this file is the
spec the implementation plan is written from. Companion to
`docs/engine-rules.md` (rules) and `docs/ui-contracts.md` (UI contracts) — the
contracts this feature settles are listed at the end for merging into those two
once built.

## What this is

The stores list — `NAV`, `N/C`, `2 TKS`, `3 TKS`, `TPOD`, `CL` — is hard-coded
as `STORE_CFG` at `src/ui/html.ts:266`. A squadron whose armourers stop carrying
a TPOD, or who start carrying something the port has never heard of, cannot say
so. This makes that list the squadron's own: **add, remove, rename and reorder**,
persisted across reloads, edited from the schedule rather than from a settings
page.

The name is the owner's: **Stores configuration**, matching `STORE_CFG`, the
`.stores` span and the CSV's existing `Stores` column.

## Scope

**In.** The per-line config interface on BOTH the Edit Schedule week and the
Schedule Board, identical on each; a `C` button replacing the week's `+` and
newly added to the board; one popup serving both; a pen inside that popup that
edits the list itself; persistence to `localStorage`.

**Out, deliberately.** The admin page for accounts (`ACCOUNTS`/`USERS`/`PEOPLE`
are three disconnected lists and merging them is its own project — see *Deferred*
below). Any rule that reads a store. Per-day store lists.

## The decisions, and why

### 1. The list is edited where it is used, not on a settings page

Considered and rejected: a new admin page with Stores configuration as its first
section, and a section on the Logic page. The owner's call was to edit it from
the schedule, behind a pen inside the popup that is already there.

Rejecting the Logic page has a reason worth recording: **Logic is not admin-only.**
Members open it to read the rulebook and understand why the app flags what it
flags; only editing is gated by `lgCanEdit`. Filing inert equipment under a page
about rules would also have hidden it behind a gate it does not need.

### 2. Nothing reads a store, so the list carries no hazard

`validate.ts` never touches `a.opts`. Stores are display data: chips in the
remarks cell, a CSV column, and a field `restore.ts` snapshots. Nothing flags,
warns or gates on them.

Two consequences follow. **Removal needs no arm-before-delete** — EDIT QUALS
arms because six of its columns are wired into rules that carry on enforcing
after the column is gone (`QualsPage.tsx`, the `WIRED` note); a two-press ✕ with
no hazard behind it only trains people to click through it. And **order is
purely display**, so it drives all three places consistently: the chips on the
line, the popup's own order, and the CSV column.

### 3. The board follows the week, and needs no new grid column

The owner's requirement: the per-line interface is the same on both surfaces,
following how the Edit Schedule week works today.

The week already puts the stores inside the remarks cell (`html.ts:622` —
remarks text, then chips, then the button, one cell). The board's flying line
(`board.ts:61`) has a bare remarks `<input class="nts">` inside a nine-column
grid, `64px 74px 52px 52px 52px 1fr 1fr 1.2fr 92px` (`scheduler.css:1776`). A
new column would mean editing that template and its phone override — the exact
fragility that produced the `.sb-arow.c6r` bug of 6 Aug 26.

It is not needed. **The B box solved this already**, and its reasoning is
written at `scheduler.css:1778`: the `.sb-bcell` wraps an optional ghost plus
the input *"so it is always exactly one grid item regardless of whether `f.br`
is set"*. The remarks input gets the same treatment — an `.sb-rcell` wrapper
holding the input, the chips and the C button, still exactly one grid item. The
nine-column template is untouched. The phone override changes one selector:
`.sb-line .nts{grid-column:1 / -1}` at `scheduler.css:1887` becomes
`.sb-line .sb-rcell{grid-column:1 / -1}`.

### 4. View-only sees stores; it cannot edit them

The week's view mode already prints on-chips through `storesView` with no `+`.
The board inherits the same treatment, so a duty crew reading the board sees
that a jet is carrying a TPOD. The `C` button appears in edit mode only, on both
surfaces, gated by `HOOKS.editMode()` — which since the 6 Aug 26 role sweep
requires `canEditSched()`.

### 5. Toggling a store and editing the list are different animals

This separation is the core of the design. Blur it and a rename turns up in the
amendment list as though the schedule changed.

| | toggling a store on a jet | editing the list |
|---|---|---|
| what it is | a schedule edit | a squadron setting |
| where it goes | mutation funnel → `markEdit('st:…')` → pending → next AL | `localStorage`, key `stores` |
| undo | yes, schedule undo | no — it is not schedule history |
| who | admin in edit mode | admin, behind the pen |

## The interface

### The line, both surfaces

| | week (Edit Schedule) | board (Schedule Board) |
|---|---|---|
| see what is loaded | chips in the remarks cell | same, in the new `.sb-rcell` |
| remove one | click its chip | same |
| add one | `C` button | same |
| edit the list | pen inside the popup | same |
| view-only mode | chips, no `C` | chips, no `C` |

The week's `+` at `html.ts:607` becomes `C`. **`C` stays INSIDE the
`<span class="stores">`** — see *Reference parity* below; putting it outside
turns a free feature into parity work.

The `bombs` free-text field (`data-bombs`, contenteditable) stays inline on both
surfaces rather than moving into the popup: it is per-jet free text, not a list
entry. Mirroring the week's cell brings it to the board, which it does not have
today.

### The popup, normal state

One function builds it for both surfaces, so they cannot drift apart. It lists
**every** store on the list, each a toggle — lit means on this jet, unlit means
not, click toggles through the funnel exactly as today.

This is a change: `openStoresMenu` currently offers only the stores *not* yet
on. That works beside the week's inline chips but says nothing on its own, and
the box has to be self-contained to serve the board as well.

### The popup, pen state

A `✎` in the header flips the box into the list editor, admin only:

- **Reorder** — drag a row, or up/down arrows
- **Rename** — click the label, type
- **Add** — a name field plus Add
- **Remove** — a single ✕ per row

Four rules the implementation must hold:

1. **Rename changes the label, never the key.** Jets store `a.opts.tk2`, not
   `a.opts["2 TKS"]`. Rename `2 TKS` → `2 TANKS` and the key stays `tk2`. Touch
   the key and every jet carrying that store silently loses it — the one failure
   in this feature that would be both quiet and expensive.
2. **Removing from the list never touches `a.opts`.** Straight from EDIT QUALS:
   deleting a column never touches `p.quals`, and adding it back brings the
   ticks with it. A toast says so on removal.
3. **A single ✕ removes.** No arming — see decision 2.
4. **The auto-dismiss suspends while the pen is open.** `openStoresMenu`
   currently removes itself on any outside click
   (`document.addEventListener('click', …, {once:true})`). A drag that leaves
   the box, or a click into a rename field, would kill it mid-edit.

Adding a store derives its key from the typed name exactly the way `qualKey`
does at `QualsPage.tsx:69` — `h.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')`,
so non-alphanumerics are stripped rather than replaced. A name yielding an empty
key, or a key already on the list, is refused with a toast rather than silently
coerced.

## Persistence

### `STORE_CFG` moves to the engine

It is a `const` in `html.ts`, but it is now persisted state with save, load and
reset — which is what `rules` is. It moves to a new `src/engine/stores.ts`
holding the mutable `STORE_CFG`, a frozen `STORE_STD`, `storeKey()`, the four
mutators, and `storesSave`/`storesLoad`/`storesReset`. `html.ts` is the builder
library; it should not own squadron state.

Three importers update — `html.ts`, `interactions.ts`, `export.ts` — plus a line
in the engine barrel `src/engine/index.ts`, and `src/probe-bridge.ts` is checked
for whether the new API belongs on the bridge.

### Key `stores`, separate from `rules`

Not folded into the `rules` blob. That blob is `{v, s}` — value-rules validated
against `RULE_SPEC`, and shift hardness — and a stores list is neither. More
concretely, `rulesReset` sets `rules` to null and a test pins *"reset restores
the standard exactly"*; sharing the key would make that reset silently wipe the
stores list. Separate key, separate reset.

### The whole list is stored, but only when it differs

A departure from `rulesSave`, which stores per-key deviations, and it is forced
by the data: an ordered, renameable list *is* its order and its labels, so there
is no meaningful per-entry diff. On the standard six, nothing is written at all.
Deviating writes the full list.

### Storage is treated as hostile on the way in

`rulesLoad` carries the scar comment that explains why: `isFinite("840")` is
`true`, so a string once sailed through and every arithmetic on it became
concatenation, poisoning `REST[]` and the crew-rest maths. Storage is editable
by hand.

`storesLoad` therefore requires: an array; each entry a two-element array of
strings; keys non-empty and matching `^[a-z0-9]+$` — the exact character set
`storeKey` can produce, no underscores; labels non-empty after trimming and no
longer than 16 characters; no duplicate keys; and no more than 24 entries in
total. Invalid entries are dropped. If nothing valid survives, the
standard six are used. It is called in `initStore()` beside `rulesLoad`, before
the first `validate()`.

### What needs no work, checked

- **Day version snapshots still restore correctly.** `restore.ts` snapshots
  `a.opts` by key (`st:${di}.${gi}.${li}.${ai}`) and does not consult the list,
  and removal never touches `a.opts`.
- **Pending / AL / undo are unchanged.** Toggling still runs `markEdit('st:…')`
  exactly as it does now.

## Testing

### vitest — the bulk

A new `src/engine/stores.test.ts`: rename keeps the key while changing the
label; removal leaves `a.opts` untouched and re-adding restores the chips; order
drives the CSV column; save writes nothing on the standard set; load rejects
each malformed shape listed above and falls back to the standard six.
`storeBackend` is null headless (`hooks.ts`), so these wire the injected store
rather than a real `localStorage`.

UI-side: both surfaces emit `C`; the popup lists every store rather than only
the unticked ones; and — the first test to write — **editing the list does not
call `markEdit`**, so a rename never reaches the amendment list. The existing
`stores configs — the "+" picker` block at `interact.test.tsx:200` is updated,
not duplicated.

### e2e — the four things vitest structurally cannot see

Every rect vitest reports is 0×0, so it can confirm which classes were emitted
and nothing about where anything sits. These go in `e2e/geometry.spec.ts`, the
fourth CI gate:

1. **The board line stays exactly one grid item** — the whole `.sb-rcell`
   contract, and what keeps the nine-column template and the phone override safe.
2. **The phone at 390px** with chips present — the layout that has broken once.
3. **Drag-reorder** actually reordering.
4. **The popup surviving a click into a rename field** — jsdom cannot tell an
   outside click from an inside one by geometry.

Per the live-view rule in `CLAUDE.md`, the feature is also driven in a real
browser before it is called done.

### The perf gate will go red, and that is expected

`probes/perf-port.cjs` caps the board at **770 nodes; it currently renders 699** —
71 spare. This adds a wrapper, a `C` button, a `bombs` span and one chip per
store carried to every flying line on the board, which can eat most of that.

The file says what to do, at line 31: exceeding a ceiling *"is a prompt to look
at the time and then raise the ceiling deliberately, in the PR that adds the
nodes."* So the board node count is measured after the change and the ceiling
raised explicitly, with the new number in the commit message. A red `npm run
perf` mid-implementation is expected here, not a regression — but the per-node
timing assertions must still pass.

### Reference parity costs nothing, if `C` stays put

`html.test.ts:noStores` already excises the whole `<span class="stores">…</span>`
from the byte-exact comparison in both view and edit mode, and today's `+` lives
inside that span. So the week's markup is free to change — **under two
constraints, both load-bearing on one regex.**

The excision is `/<span class="stores">[\s\S]*?<\/span>(?=<\/div>)/g`, and its
own comment explains the trick: `.stores` *"always sits last in the rmkcell,
closing right before that cell's `</div>`, so the lazy match ends at that
boundary."* The lazy `[\s\S]*?` stops at the first `</span>` followed by
`</div>` — today that is the stores span itself, because the nested `bombs`
span closes into another `</span>`, not a `</div>`.

Therefore: **`C` stays inside `.stores`**, and **`.stores` stays last in the
remarks cell, closing immediately before its `</div>`**. Break either and the
regex either misses the span or eats past it, and a free feature turns into
parity work.

The board is not affected: its markup is not byte-compared against the
reference — `board.test.tsx` pins behaviour without importing `refwin`. The
728-assertion reference suite is untouched either way, and `refwin.ts` needs no
new patch.

## Known limitations, accepted

- **A customised list freezes.** Because the whole list is stored on deviation,
  a squadron that customises will not pick up a store later added to the
  standard set; they would add it by hand. Distinguishing "never seen this key"
  from "deliberately deleted it" needs a tombstone list, which is machinery for
  a problem that does not exist yet.
- **A frozen day preview renders with the current list**, not the list as it was
  when the version was published. `rules` already behaves this way; matching it
  is preferred over inventing per-day store lists.
- **Persistence is per-browser.** Like `rules`, this is `localStorage` — two
  devices never see each other's list. That is the same server/sync work the
  first bullet of `HANDOFF.md` describes.

## Deferred: the accounts admin page

Raised in the same conversation, deliberately not designed here. Recorded so it
is not re-derived:

Accounts today are **three disconnected lists**. `ACCOUNTS` in `state/auth.ts`
(`a`/`a`, `user`/`user` plus passwords) is what the login screen checks. `USERS`
in `state/users.ts` (Bane, Stiff, Ignite, Casper) is what the Manage-users modal
shows and edits. `PEOPLE` in `engine/people.ts` is the actual roster. Nothing
joins them, so adding a user in Manage-users creates someone who cannot log in.

Separately, **logging in grants a role but not an identity**: `ME` is set by a
`View as` dropdown in the topbar (`Shell.tsx:177`) that is open to everyone, so
a member can view the app as any person. Until an account names a person, "a
member edits *their own* Inputs" and "ticks the qualifications *they hold*"
are not enforceable statements.

Whatever is built there is a usability boundary, not a security one: passwords
are plain strings in a JS file on a public site. Real accounts are the server
work `HANDOFF.md` already flags.

## Contracts to merge when built

- `docs/ui-contracts.md` — a new §Stores configuration: the C button on both
  surfaces, the popup's contents, the pen's four rules, view-only behaviour, and
  the `.sb-rcell` one-grid-item contract.
- `docs/engine-rules.md` — §Stores configuration under the persistence
  material: the `stores` key, the deviation-only save, and the load validation.
- `HANDOFF.md` — a bullet under *Known issues / open work* for the two accepted
  limitations, and the raised board DOM ceiling with its new number.
