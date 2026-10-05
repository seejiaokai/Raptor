# Interface readability and scrolling — 4 Oct 26

Status: three owner requests D560–D562; owner subsequently says “That’s all u can start building”.
The hold is lifted and the batch is authorized. Numbered phone/desktop candidate pictures precede production
edits under D541; they make the proposed shapes concrete, and any owner correction overrides this proposal.
This note is Astra's design proposal, not its own independent approval. Sol challenges the companion plan.
Branch: `codex/workflow-ui`, continuing the existing checkout; application baseline `2f7ad9b1311fdb15959ef398ee9cdc6f99e8b584`.
Backlog: [TRK-FLIGHT-LABEL-READABILITY], [LOGIC-STICKY-SEARCH-COMPACT], [INSIGHTS-CLOSE-STAYS-VISIBLE].

## Job and direction

This is an Operate surface: schedulers and crew need to read an event code, find a rule while deep in a long
page, and close Insights without scrolling back. Preserve the established Raptor palette and controls.
Impeccable's shape guide is read-only advice; no new visual system, guide or observation-log edits.

1. **Tracker:** replace only the blue flight symbol's narrow interior with a recognisable broader-wing
   silhouette and a continuous blue area behind its dark event label. Keep the existing ball diameter,
   student wedges, marks, badges, available/search/selection rings and authored chart layout/fonts. The
   ordinary label should no longer straddle blue fill and the dark chart background. No label truncation,
   automatic shrinking, syllabus edits or data conversion. All other event types retain their symbols.
2. **Logic:** keep the existing search and filter/edit/count strip together below the visible app bar when
   the page scrolls. Pack these controls more closely, using fewer rows at the owner's phone width while
   retaining clear words and separate usable targets. Search stays full-width where needed; filters share
   space with editing controls as room allows. No hidden menu replaces a current action. Keep All, Warnings,
   Advisories, Notes, Fired this week, Edit rules/Done, conditional Reset to standard and the live count.
   D487's exception is this local request, not permission to resize buttons elsewhere.
3. **Week insights:** retain the existing title and close cross together at the top of its scrolling window,
   with an opaque background so chart contents cannot paint through them. The body still scrolls to its last
   row and Show all still works. Keep current close actions, window size and phone bottom-sheet placement,
   including D536/D537's thin top strip. Scope the treatment to Insights.

No product question is necessary for the two scrolling requests. The broader wing is the recommended
interpretation of the owner's stated direction; if its candidate changes the ball size, abandons the wing,
or needs to reduce an authored font, stop that affected choice and ask rather than silently expanding it.

## Pictures, ranges and acceptance

The host shows six numbered views: phone and desktop for each feature. Tracker includes a readable enlarged
crop beside the full chart context, normal and long flight codes, and coloured student wedges. Logic shows
the scrolled strip with all ordinary controls and the editing/modified state where Reset appears. Insights
shows a scrolled long list with the cross visible, plus the short-screen placement. Use synthetic/demo content.
Original owner photos, generated/captured pictures and private paths stay outside the public branch.

Success requires real-browser evidence, not just a colour ratio or a sticky declaration: label ink has a
continuous contrasting backing; search and close are on-screen and own their hit targets after scrolling;
Logic occupies fewer control rows at the reference phone width without overlap, clipping or lost actions.
Widths include 320, 390, 820/821 and 1440; short phone/landscape and 700px-high laptop checks preserve access.
Long/custom Tracker labels and saved fonts are tested without overwriting the owner's choices; an oversized
pre-existing case outside the preserved ball interior is described honestly, not silently “fixed”.

## Boundaries and release

Keep D157's palette, D464's charts/details, D529's unchanged-Remarks silence, D550–D559's accepted schedule
behaviour, roles and existing saves/Undo/history. No rules, calculations, published copies, permissions,
storage, student records, graph feature, file-transfer split, general popup redesign or unrelated polish.
Combined tier: WALK, with all applicable gates, independent scenarios and fresh final Astra inspection.
Physical iPhone Safari remains a separately stated owner-device limit; Chromium pictures do not prove it.
Claude's further plan/code/scenario and independent desktop/phone reads remain owed after Monday
5 Oct 2026, 19:00 Asia/Singapore before main. No merge, main push or merging pull request is authorized.
