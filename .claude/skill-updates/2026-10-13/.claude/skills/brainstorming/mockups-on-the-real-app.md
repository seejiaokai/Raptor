# Mock-ups on the Real App

**Load this reference when:** making a picture of a proposed change to a screen
that already exists — before the first drawing.

SKILL.md's "Prefer drawing the options on the real running app" is the rule.
This is the method and its traps; every line comes from a mock-up that misled
someone.

## The Method

1. Drive a local or preview build — throwaway data, the clock held still where
   the date colours the screen — to the "today" state through the app's own
   controls, and picture it at each size the app ships.
2. Do the nearest REAL interaction first (a real drag, a real open) and record
   its look and its markup. Reuse those; never restyle them.
3. Apply ONE named transform on the page: it moves, removes or clones existing
   nodes. New parts are cloned from a real neighbour and marked as new. Any
   style the app does not already have is a design decision to tell the owner.
4. Picture the same frames again at the same sizes. Lay them out
   today-beside-proposed, numbered, so the owner answers by number, and say on
   the page which pictures are real and which are drawn in.
5. Write down everything the transform had to touch that the design note did
   not name — four places printing one count, a list that was not grouped
   after all. That list goes into the plan: each item is a requirement nobody
   had written down.
6. Commit the injection script beside the pictures, so the set can be shot
   again and the build starts from it. The picture the owner picks — or the
   script that drew it, with its exact values — is committed too, and the
   record of the decision names it: words describing a picture are a summary,
   not the spec.

## Traps When Injecting Into a Live Page

- The app owns its DOM: a scroll, a repaint or a partial swap wipes injected
  state silently. Do every scroll first, inject last, and re-apply the fragile
  part immediately before the picture. Have the capture step ASSERT its
  premise is still there (a hand-set class, an injected node) — or refuse the
  picture.
- Clear injected nodes before staging the next option: the app swaps only what
  changed, so option A's markup survives into option B's frames.
- A script that toggles styles by finding "the original rule" finds its own
  injected copy the second time: keep the app's rule once, and skip your own
  sheet. A before/after made by removing a rule from the BUILT stylesheet
  prints how many rules it removed and the measured size on both sides — the
  build rewrites selectors and media conditions; zero removed, or equal sizes,
  means the "before" is not a before.
- Hide transient toasts. Frame clear of sticky bars by asking the page what is
  at the element's own top edge (`elementFromPoint`), not by trusting
  scroll-into-view.
- Look at every picture before sending it: each failure above passed its
  script with no error.

## Judging the Proposal

- **A mark a few pixels wide:** measure the element boxes and the gaps to
  their neighbours BEFORE designing; capture at the target screens' real
  densities (1x desktop, 3x phone) and show those at true size, with an
  enlarged copy only as a detail view. Enlargement hides sub-pixel collisions.
- **An existing component shown inside a mock is measured, not styled:** read
  the live element's computed styles (its pseudo-elements and overflow
  included) and its markup, reproduce them verbatim, scale them as one piece,
  and put a close-up of the real one beside the mock's before anyone sees it.
  A copy made by eye converges one correction at a time, each paid for by the
  reviewer.
- **Include one BUSY state by default** — the fullest realistic mix of what
  the change touches (every mark colour, every ring kind, issued and pending
  together, a plain case) — and take the fix's scope from what the rule being
  changed affects, not from the bug's first description.
- **"This works like the existing X" is a behaviour claim, not a picture.**
  Exercise X for the behaviour named (close it, press outside it, drag it, use
  the page behind it) or read its code first, and list what was exercised
  beside the picture. Where the proposal and the existing behaviour differ,
  say so on the drawing itself.
- **A LAYOUT question over a range of content** (long and short text, optional
  parts) is not answered by a re-lettered screenshot — that shows one
  instance. Build working markup in the app's own style values: the same
  varied sample set under every option (the worst case included), a switch per
  open choice, a measured figure per option computed in the page, a
  today/proposed toggle. When checking such a page locally, assert the layout
  width first — a file with no viewport tag opens 980 wide in a phone-emulated
  browser.
- **A reproduction written as assertions of the RIGHT behaviour**, with a hook
  that injects a candidate stylesheet, gives three things from one script: the
  defect's evidence, the proposal's pictures, and a pass/fail measurement of
  the proposal on every page and size — and later the fix's re-check. Confirm
  first that the mode the app is opened in can show the state under test (a
  memory-only start cannot produce a failed save).

## Showing It

- A change to the LOOK or LAYOUT of a surface the owner uses daily gets a
  full-screen before/after put to him BEFORE it is built — whoever filed it,
  and even when it is framed as a defect. Whether it is an improvement is the
  user's call, not the finder's.
- When the answer to a choice is a question ("show me what he will see
  exactly"), it is a request for the picture, not for more words.
- Republishing a page of pictures is a sync of the whole set against what is
  live: list the published files, compare each with the local copy, and send
  every one that differs, whoever changed it.
