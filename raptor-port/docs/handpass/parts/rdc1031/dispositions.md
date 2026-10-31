288 findings in the batch: FIXED 204, KEPT 84, OPEN 0.

| File:line (before) | Rule | Level | Outcome | Reason kept |
|---|---|---|---|---|
| src/boot.ts:80 | rules-of-hooks | error | FIXED |  |
| src/leavewar/ui/ApprovalsPage.tsx:113 | exhaustive-deps | warning | KEPT | once per visit: opening writes the moment he opened it, so a re-run would move his "since you last looked" mark mid-visit (now line 114) |
| src/leavewar/ui/ApprovalsPage.tsx:120 | effect-needs-cleanup | error | KEPT | a press's own listeners must outlive this effect (that press closes the picker, which ends it) to take the click it makes; each removes itself at that click, a cancel, the next press or 500 ms after the lift (now line 122) |
| src/leavewar/ui/ApprovalsPage.tsx:251 | no-ref-current-in-render | error | FIXED |  |
| src/leavewar/ui/ApprovalsPage.tsx:264 | exhaustive-deps | warning | FIXED |  |
| src/leavewar/ui/BalancesPage.tsx:177 | no-ref-current-in-render | error | FIXED |  |
| src/leavewar/ui/BalancesPage.tsx:183 | exhaustive-deps | warning | KEPT | runs once, as the box leaves the screen: what it saves comes from the refs set as he types (held, typed), never from this render's figures (now line 184) |
| src/leavewar/ui/BalancesPage.tsx:470 | no-ref-current-in-render | error | FIXED |  |
| src/leavewar/ui/BalancesPage.tsx:493 | exhaustive-deps | warning | FIXED |  |
| src/leavewar/ui/BalancesPage.tsx:512 | exhaustive-deps | warning | FIXED |  |
| src/leavewar/ui/BalancesPage.tsx:565 | exhaustive-deps | warning | FIXED |  |
| src/leavewar/ui/BidBits.tsx:61 | effect-needs-cleanup | error | KEPT | a press's own listeners must outlive this effect (that press closes the menu, which ends it) to catch the click it makes; each removes itself at that click, a cancel or the next press (now line 62) |
| src/leavewar/ui/BidPicker.tsx:462 | no-ref-current-in-render | error | FIXED |  |
| src/leavewar/ui/FlyEdit.tsx:208 | no-ref-current-in-render | error | FIXED |  |
| src/leavewar/ui/FlyRows.tsx:217 | no-ref-current-in-render | error | FIXED |  |
| src/leavewar/ui/GradesSheet.tsx:90 | exhaustive-deps | warning | KEPT | placed and focused as it opens and when the screen changes size class; re-run on a new anchor it would take the keyboard back to the first grip mid-edit (now line 91) |
| src/leavewar/ui/gridclick.ts:20 | no-ref-current-in-render | error | FIXED |  |
| src/leavewar/ui/Matrix.tsx:300 | no-ref-current-in-render | error | KEPT | written during render on purpose: the Required and counter rows call the grid's re-measure from their own layout effects, which run before this component's, and it must read this render's window, never the last one (now line 928) |
| src/leavewar/ui/Matrix.tsx:708 | no-ref-current-in-render | error | KEPT | written during render on purpose: the Required and counter rows call the grid's re-measure from their own layout effects, which run before this component's, and it must read this render's months and rows, never the last ones (now line 1046) |
| src/leavewar/ui/Matrix.tsx:756 | no-ref-current-in-render | error | KEPT | written during render on purpose: the Required and counter rows replace this token from their own layout effects (onArchiveChange), which run before this component's, so a write after them would undo theirs (now line 1697) |
| src/leavewar/ui/Matrix.tsx:926 | no-ref-current-in-render | error | KEPT | written during render on purpose: the Required and counter rows call it (onArchiveChange) from their own layout effects, which run before this component's (now line 3151) |
| src/leavewar/ui/Matrix.tsx:1043 | no-ref-current-in-render | error | FIXED |  |
| src/leavewar/ui/Matrix.tsx:1154 | no-ref-current-in-render | error | FIXED |  |
| src/leavewar/ui/Matrix.tsx:1253 | no-ref-current-in-render | error | FIXED |  |
| src/leavewar/ui/Matrix.tsx:1484 | no-ref-current-in-render | error | FIXED |  |
| src/leavewar/ui/Matrix.tsx:1622 | exhaustive-deps | warning | FIXED |  |
| src/leavewar/ui/Matrix.tsx:1622 | exhaustive-deps | warning | FIXED |  |
| src/leavewar/ui/Matrix.tsx:1643 | no-impure-state-updater | error | KEPT | only reads the layout, and only when the bar is not yet frozen or is forced: read outside, every column would be measured on every scroll while the bar is frozen (now line 2005) |
| src/leavewar/ui/Matrix.tsx:1691 | no-ref-current-in-render | error | FIXED |  |
| src/leavewar/ui/Matrix.tsx:1691 | no-ref-current-in-render | error | FIXED |  |
| src/leavewar/ui/Matrix.tsx:1771 | no-ref-current-in-render | error | FIXED |  |
| src/leavewar/ui/Matrix.tsx:1998 | no-impure-state-updater | error | FIXED |  |
| src/leavewar/ui/Matrix.tsx:2192 | effect-needs-cleanup | error | KEPT | the handle is kept in hbarCatchUpRef, cleared by the grid's unmount effect (with the rest timer) (now line 2200) |
| src/leavewar/ui/Matrix.tsx:3142 | no-ref-current-in-render | error | FIXED |  |
| src/leavewar/ui/Matrix.tsx:3528 | no-ref-current-in-render | error | FIXED |  |
| src/leavewar/ui/OilTracker.tsx:209 | no-ref-current-in-render | error | FIXED |  |
| src/leavewar/ui/OilTracker.tsx:262 | no-ref-current-in-render | error | FIXED |  |
| src/leavewar/ui/OpenDatesSheet.tsx:138 | no-ref-current-in-render | error | FIXED |  |
| src/leavewar/ui/OpenDatesSheet.tsx:162 | no-ref-current-in-render | error | FIXED |  |
| src/leavewar/ui/OpenDatesSheet.tsx:177 | no-ref-current-in-render | error | FIXED |  |
| src/leavewar/ui/PersonWindow.tsx:159 | no-ref-current-in-render | error | FIXED |  |
| src/leavewar/ui/Sheet.tsx:101 | effect-needs-cleanup | error | KEPT | every listener added here is removed by the cleanup returned below; the touch screen's shield is added and removed in the same loop over SHIELDED, which the check does not follow (now line 102) |
| src/leavewar/ui/Sheet.tsx:422 | no-ref-current-in-render | error | FIXED |  |
| src/tracker/App.jsx:24 | no-noninteractive-tabindex | warning | KEPT | the chart is the one Tab stop the arrow keys drive (owner D980); the engine listens for its keys on this box (now line 26) |
| src/tracker/App.jsx:84 | exhaustive-deps | warning | KEPT | core.ready is a live module binding the async boot flips from false to true; it is the trigger that draws the board once (now line 88) |
| src/tracker/App.jsx:129 | exhaustive-deps | warning | KEPT | core.ready is a live module binding that changes when the boot ends; the page's key and click handlers must bind then (now line 134) |
| src/tracker/app/core.js:325 | async-await-in-loop | warning | KEPT | a stored-data migration (D464: his charts and marks must never be lost) kept as one fixed sequential pass; the storage under it is synchronous, so reading together would gain nothing (now line 1291) |
| src/tracker/app/core.js:381 | async-await-in-loop | warning | KEPT | sequential on purpose: each record is written under its new key, read back, and only then deleted, and one failed move must stop the migration being marked done (now line 1331) |
| src/tracker/app/core.js:581 | no-json-parse-stringify-clone | warning | KEPT | the migration journal must hold exactly its stored JSON form (undefined dropped, never a throw on an odd value) so its read-back verify compares like with like (now line 1781) |
| src/tracker/app/core.js:680 | no-json-parse-stringify-clone | warning | KEPT | this copy becomes the saved chart: the ball editor clears a name or number by setting it undefined, and JSON drops those keys as the stored chart does (now line 5978) |
| src/tracker/app/core.js:915 | no-json-parse-stringify-clone | warning | KEPT | this copy becomes the new chart's saved record: the ball editor clears a name or number by setting it undefined, and JSON drops those keys as the stored chart does (now line 6144) |
| src/tracker/app/core.js:916 | no-json-parse-stringify-clone | warning | KEPT | Import: the file's chart becomes the saved record in its JSON form, undefined keys dropped, and an odd value never throws half-way through an import (now line 6751) |
| src/tracker/app/core.js:919 | no-json-parse-stringify-clone | warning | FIXED |  |
| src/tracker/app/core.js:990 | no-json-parse-stringify-clone | warning | FIXED |  |
| src/tracker/app/core.js:992 | no-json-parse-stringify-clone | warning | FIXED |  |
| src/tracker/app/core.js:995 | no-json-parse-stringify-clone | warning | FIXED |  |
| src/tracker/app/core.js:1103 | js-set-map-lookups | warning | FIXED |  |
| src/tracker/app/core.js:1284 | async-await-in-loop | warning | KEPT | sequential on purpose: each record is written under its new key, read back, and only then deleted, and one failed move must stop the migration being marked done (now line 1335) |
| src/tracker/app/core.js:1323 | async-await-in-loop | warning | KEPT | sequential on purpose: each record is written under its new key, read back, and only then deleted, and one failed move must stop the migration being marked done (now line 1447) |
| src/tracker/app/core.js:1326 | async-await-in-loop | warning | KEPT | a stored-data migration (D464: his charts and marks must never be lost) kept as one fixed sequential pass; the storage under it is synchronous, so reading together would gain nothing (now line 1561) |
| src/tracker/app/core.js:1437 | async-await-in-loop | warning | KEPT | a stored-data migration (D464: his charts and marks must never be lost) kept as one fixed sequential pass; the storage under it is synchronous, so reading together would gain nothing (now line 1570) |
| src/tracker/app/core.js:1549 | async-await-in-loop | warning | KEPT | a stored-data migration (D464: his charts and marks must never be lost) kept as one fixed sequential pass; the storage under it is synchronous, so reading together would gain nothing (now line 1650) |
| src/tracker/app/core.js:1557 | async-await-in-loop | warning | KEPT | a stored-data migration (D464: his charts and marks must never be lost) kept as one fixed sequential pass; the storage under it is synchronous, so reading together would gain nothing (now line 1682) |
| src/tracker/app/core.js:1575 | js-set-map-lookups | warning | FIXED |  |
| src/tracker/app/core.js:1575 | js-set-map-lookups | warning | FIXED |  |
| src/tracker/app/core.js:1584 | js-set-map-lookups | warning | FIXED |  |
| src/tracker/app/core.js:1584 | js-set-map-lookups | warning | FIXED |  |
| src/tracker/app/core.js:1636 | async-await-in-loop | warning | KEPT | a stored-data migration (D464: his charts and marks must never be lost) kept as one fixed sequential pass; the storage under it is synchronous, so reading together would gain nothing (now line 1742) |
| src/tracker/app/core.js:1667 | async-await-in-loop | warning | KEPT | sequential on purpose: the migration journal's deletes run in order and only after every write before them was read back (now line 1799) |
| src/tracker/app/core.js:1713 | js-set-map-lookups | warning | FIXED |  |
| src/tracker/app/core.js:1714 | js-set-map-lookups | warning | FIXED |  |
| src/tracker/app/core.js:1726 | async-await-in-loop | warning | KEPT | sequential on purpose: the reset journal clears each course's records in turn and is idempotent, so a half-done run finishes on the retry (now line 1829) |
| src/tracker/app/core.js:1764 | no-json-parse-stringify-clone | warning | FIXED |  |
| src/tracker/app/core.js:1781 | async-await-in-loop | warning | KEPT | the one course block Export and Import share (D464), built in one fixed pass in chart order; the storage under it is synchronous, so reading together would gain nothing (now line 1934) |
| src/tracker/app/core.js:1810 | async-await-in-loop | warning | KEPT | the one course block Export and Import share (D464), built in one fixed pass in chart order; the storage under it is synchronous, so reading together would gain nothing (now line 1941) |
| src/tracker/app/core.js:1912 | js-set-map-lookups | warning | FIXED |  |
| src/tracker/app/core.js:1913 | js-set-map-lookups | warning | FIXED |  |
| src/tracker/app/core.js:1914 | async-await-in-loop | warning | KEPT | the one course block Export and Import share (D464), built in one fixed pass in chart order; the storage under it is synchronous, so reading together would gain nothing (now line 1951) |
| src/tracker/app/core.js:1920 | async-await-in-loop | warning | KEPT | Import writes the course's records one after another in the file's order (D464: never a reordered write) (now line 1959) |
| src/tracker/app/core.js:1929 | async-await-in-loop | warning | KEPT | Import writes the course's records one after another in the file's order (D464: never a reordered write) (now line 1961) |
| src/tracker/app/core.js:1929 | async-await-in-loop | warning | KEPT | Import writes the course's records one after another in the file's order (D464: never a reordered write) (now line 1965) |
| src/tracker/app/core.js:1936 | async-await-in-loop | warning | KEPT | Import writes the course's records one after another in the file's order (D464: never a reordered write) (now line 1967) |
| src/tracker/app/core.js:1937 | async-await-in-loop | warning | KEPT | Import writes the course's records one after another in the file's order (D464: never a reordered write) (now line 1969) |
| src/tracker/app/core.js:1940 | async-await-in-loop | warning | KEPT | sequential on purpose: the loop also moves a student's old-style dates to the new key (a write) as it reads them (now line 2136) |
| src/tracker/app/core.js:1941 | async-await-in-loop | warning | KEPT | each read is skipped once that man is already known to be leaving, which depends on the reads before it (now line 5489) |
| src/tracker/app/core.js:1942 | async-await-in-loop | warning | KEPT | gathers the sweep's keys in the fixed order its deletes and writes then run in, so they stay sequential (now line 6037) |
| src/tracker/app/core.js:2021 | no-json-parse-stringify-clone | warning | FIXED |  |
| src/tracker/app/core.js:2108 | async-await-in-loop | warning | KEPT | gathers the sweep's keys in the fixed order its deletes and writes then run in, so they stay sequential (now line 6040) |
| src/tracker/app/core.js:3789 | js-set-map-lookups | warning | FIXED |  |
| src/tracker/app/core.js:4335 | js-set-map-lookups | warning | FIXED |  |
| src/tracker/app/core.js:4776 | js-hoist-intl | warning | FIXED |  |
| src/tracker/app/core.js:5289 | async-await-in-loop | warning | KEPT | gathers the sweep's keys in the fixed order its deletes and writes then run in, so they stay sequential (now line 6082) |
| src/tracker/app/core.js:5435 | async-await-in-loop | warning | KEPT | gathers the sweep's keys in the fixed order its deletes and writes then run in, so they stay sequential (now line 6097) |
| src/tracker/app/core.js:5444 | async-await-in-loop | warning | KEPT | seeding writes each shipped record in turn, each failure skipped on its own, before the stamp that says it is done (now line 6578) |
| src/tracker/app/core.js:5505 | async-await-in-loop | warning | KEPT | Import writes each chart's layout in turn, in the file's chart order (D464: his charts must never be lost to a reordered write) (now line 6758) |
| src/tracker/app/core.js:5713 | js-set-map-lookups | warning | FIXED |  |
| src/tracker/app/core.js:5714 | js-set-map-lookups | warning | FIXED |  |
| src/tracker/app/core.js:5722 | js-set-map-lookups | warning | FIXED |  |
| src/tracker/app/core.js:5722 | js-set-map-lookups | warning | FIXED |  |
| src/tracker/app/core.js:5749 | js-set-map-lookups | warning | FIXED |  |
| src/tracker/app/core.js:5884 | js-set-map-lookups | warning | FIXED |  |
| src/tracker/app/core.js:5928 | no-json-parse-stringify-clone | warning | FIXED |  |
| src/tracker/app/core.js:5986 | async-await-in-loop | warning | KEPT | Import's check of the students already here (D464), kept in one fixed pass beside the writes that follow; the storage under it is synchronous, so reading together would gain nothing (now line 6913) |
| src/tracker/app/core.js:5988 | async-await-in-loop | warning | KEPT | Import's check of the students already here (D464), kept in one fixed pass beside the writes that follow; the storage under it is synchronous, so reading together would gain nothing (now line 6927) |
| src/tracker/app/core.js:6029 | async-await-in-loop | warning | KEPT | Import's check of the students already here (D464), kept in one fixed pass beside the writes that follow; the storage under it is synchronous, so reading together would gain nothing (now line 6949) |
| src/tracker/app/core.js:6043 | async-await-in-loop | warning | KEPT | Import relabels each other chart's student list in turn, reading and writing it in one step (D464: never a reordered write) (now line 6980) |
| src/tracker/app/core.js:6089 | no-json-parse-stringify-clone | warning | FIXED |  |
| src/tracker/app/core.js:6522 | async-await-in-loop | warning | KEPT | sequential on purpose: the chart on screen is switched away before that chart is deleted and the next one is handled (now line 7213) |
| src/tracker/app/core.js:6578 | no-json-parse-stringify-clone | warning | FIXED |  |
| src/tracker/app/core.js:6579 | async-await-in-loop | warning | FIXED |  |
| src/tracker/app/core.js:6587 | no-json-parse-stringify-clone | warning | FIXED |  |
| src/tracker/app/core.js:6603 | no-json-parse-stringify-clone | warning | FIXED |  |
| src/tracker/app/core.js:6692 | no-json-parse-stringify-clone | warning | FIXED |  |
| src/tracker/app/core.js:6698 | async-await-in-loop | warning | FIXED |  |
| src/tracker/app/core.js:6852 | async-await-in-loop | warning | FIXED |  |
| src/tracker/app/core.js:6865 | async-await-in-loop | warning | FIXED |  |
| src/tracker/app/core.js:6886 | async-await-in-loop | warning | FIXED |  |
| src/tracker/app/core.js:6916 | async-await-in-loop | warning | FIXED |  |
| src/tracker/app/core.js:7148 | async-await-in-loop | warning | FIXED |  |
| src/tracker/app/courseIds.js:88 | no-json-parse-stringify-clone | warning | KEPT | the id converter's output is stored as is, so it must be exactly its JSON form: null-prototype maps made plain, undefined fields dropped, an odd value never a throw mid-import (now line 89) |
| src/tracker/app/courseIds.js:89 | no-json-parse-stringify-clone | warning | KEPT | the id converter's output is stored as is, so it must be exactly its JSON form: null-prototype maps made plain, undefined fields dropped, an odd value never a throw mid-import (now line 91) |
| src/tracker/app/courseIds.js:157 | no-json-parse-stringify-clone | warning | KEPT | the id converter's output is stored as is, so it must be exactly its JSON form: null-prototype maps made plain, undefined fields dropped, an odd value never a throw mid-import (now line 160) |
| src/tracker/app/courseIds.js:158 | no-json-parse-stringify-clone | warning | KEPT | the id converter's output is stored as is, so it must be exactly its JSON form: null-prototype maps made plain, undefined fields dropped, an odd value never a throw mid-import (now line 162) |
| src/tracker/app/eventDetails.js:57 | no-json-parse-stringify-clone | warning | FIXED |  |
| src/tracker/app/eventDetails.js:83 | js-set-map-lookups | warning | FIXED |  |
| src/tracker/app/fileStore.js:86 | no-create-object-url-without-revoke | warning | FIXED |  |
| src/tracker/app/fileTransfer.js:46 | no-json-parse-stringify-clone | warning | KEPT | Import's working copy of the file must be exactly its JSON form (undefined fields dropped, an odd value never a throw), and the caller's object is never touched (now line 47) |
| src/tracker/app/fileTransfer.js:47 | no-json-parse-stringify-clone | warning | KEPT | Import's working copy of the file must be exactly its JSON form (undefined fields dropped, an odd value never a throw), and the caller's object is never touched (now line 49) |
| src/tracker/app/ids.js:77 | no-json-parse-stringify-clone | warning | KEPT | the id converter's output is stored as is, so it must be exactly its JSON form: null-prototype maps made plain, undefined fields dropped, an odd value never a throw mid-import (now line 78) |
| src/tracker/app/ids.js:152 | no-json-parse-stringify-clone | warning | KEPT | the id converter's output is stored as is, so it must be exactly its JSON form: null-prototype maps made plain, undefined fields dropped, an odd value never a throw mid-import (now line 154) |
| src/tracker/app/rows.js:94 | js-set-map-lookups | warning | FIXED |  |
| src/tracker/app/sylIds.js:125 | no-json-parse-stringify-clone | warning | KEPT | the id converter's output is stored as is, so it must be exactly its JSON form: null-prototype maps made plain, undefined fields dropped, an odd value never a throw mid-import (now line 126) |
| src/tracker/components/ArrangeTools.jsx:34 | no-unguarded-numeric-input-parse | warning | FIXED |  |
| src/tracker/components/ArrangeTools.jsx:60 | exhaustive-deps | warning | KEPT | core.toolsOpen is a live module binding that opens and shuts the set; it is the trigger that binds and unbinds the outside press (now line 61) |
| src/tracker/components/DateBox.jsx:64 | no-reset-all-state-on-prop-change | warning | FIXED |  |
| src/tracker/components/DateBox.jsx:64 | no-adjust-state-on-prop-change | warning | FIXED |  |
| src/tracker/components/FlexSettings.jsx:47 | exhaustive-deps | warning | KEPT | the keyboard goes in once, when the window opens; a later change of who may edit must not pull it back to the first box (now line 54) |
| src/tracker/components/FlexSettings.jsx:53 | exhaustive-deps | warning | FIXED |  |
| src/tracker/components/FlexSettings.jsx:67 | exhaustive-deps | warning | FIXED |  |
| src/tracker/components/FlexSettings.jsx:93 | click-events-have-key-events | warning | FIXED |  |
| src/tracker/components/FlexSettings.jsx:93 | no-static-element-interactions | warning | FIXED |  |
| src/tracker/components/FlexSettings.jsx:110 | no-array-index-as-key | warning | KEPT | a band's place is what it is: band i takes the From day typed at i - 1, and the six never reorder */ (now line 112) |
| src/tracker/components/Header.jsx:59 | click-events-have-key-events | warning | FIXED |  |
| src/tracker/components/Header.jsx:59 | no-static-element-interactions | warning | FIXED |  |
| src/tracker/components/Header.jsx:108 | exhaustive-deps | warning | KEPT | core.searchAt is a live module binding: when ↑ ↓ move the ring to another row, the newly ringed row is scrolled into view (now line 110) |
| src/tracker/components/Header.jsx:137 | no-placeholder-only-field | warning | FIXED |  |
| src/tracker/components/Header.jsx:164 | no-high-complexity-react-function | warning | FIXED |  |
| src/tracker/components/Legend.jsx:18 | only-export-components | warning | FIXED |  |
| src/tracker/components/Legend.jsx:26 | only-export-components | warning | FIXED |  |
| src/tracker/components/Legend.jsx:122 | click-events-have-key-events | warning | FIXED |  |
| src/tracker/components/Legend.jsx:122 | no-static-element-interactions | warning | FIXED |  |
| src/tracker/components/Legend.jsx:126 | no-noninteractive-tabindex | warning | KEPT | the scrolling list is the pop-out's one keyboard stop, so the arrow keys scroll it (design guide §2) (now line 113) |
| src/tracker/components/Modals.jsx:10 | no-high-complexity-react-function | warning | FIXED |  |
| src/tracker/components/Modals.jsx:39 | no-ref-current-in-render | error | FIXED |  |
| src/tracker/components/Modals.jsx:125 | click-events-have-key-events | warning | FIXED |  |
| src/tracker/components/Modals.jsx:125 | no-static-element-interactions | warning | FIXED |  |
| src/tracker/components/Modals.jsx:126 | dialog-has-accessible-name | warning | FIXED |  |
| src/tracker/components/Modals.jsx:132 | label-has-associated-control | warning | FIXED |  |
| src/tracker/components/Modals.jsx:141 | no-placeholder-only-field | warning | FIXED |  |
| src/tracker/components/Modals.jsx:154 | role-has-required-aria-props | error | FIXED |  |
| src/tracker/components/Modals.jsx:191 | rerender-lazy-state-init | warning | FIXED |  |
| src/tracker/components/Modals.jsx:200 | label-has-associated-control | warning | FIXED |  |
| src/tracker/components/Modals.jsx:200 | control-has-associated-label | warning | FIXED |  |
| src/tracker/components/Modals.jsx:201 | label-has-associated-control | warning | FIXED |  |
| src/tracker/components/Modals.jsx:202 | control-has-associated-label | warning | FIXED |  |
| src/tracker/components/Modals.jsx:210 | label-has-associated-control | warning | FIXED |  |
| src/tracker/components/Modals.jsx:210 | no-placeholder-only-field | warning | FIXED |  |
| src/tracker/components/Modals.jsx:211 | label-has-associated-control | warning | FIXED |  |
| src/tracker/components/Modals.jsx:211 | no-placeholder-only-field | warning | FIXED |  |
| src/tracker/components/Modals.jsx:212 | label-has-associated-control | warning | FIXED |  |
| src/tracker/components/Modals.jsx:212 | no-placeholder-only-field | warning | FIXED |  |
| src/tracker/components/Modals.jsx:213 | label-has-associated-control | warning | FIXED |  |
| src/tracker/components/Modals.jsx:213 | no-placeholder-only-field | warning | FIXED |  |
| src/tracker/components/Modals.jsx:228 | click-events-have-key-events | warning | FIXED |  |
| src/tracker/components/Modals.jsx:228 | no-static-element-interactions | warning | FIXED |  |
| src/tracker/components/Modals.jsx:256 | click-events-have-key-events | warning | FIXED |  |
| src/tracker/components/Modals.jsx:256 | no-static-element-interactions | warning | FIXED |  |
| src/tracker/components/Modals.jsx:259 | label-has-associated-control | warning | FIXED |  |
| src/tracker/components/Modals.jsx:259 | control-has-associated-label | warning | FIXED |  |
| src/tracker/components/Modals.jsx:260 | label-has-associated-control | warning | FIXED |  |
| src/tracker/components/Modals.jsx:261 | label-has-associated-control | warning | FIXED |  |
| src/tracker/components/Modals.jsx:261 | no-placeholder-only-field | warning | FIXED |  |
| src/tracker/components/Modals.jsx:262 | label-has-associated-control | warning | FIXED |  |
| src/tracker/components/Modals.jsx:262 | no-placeholder-only-field | warning | FIXED |  |
| src/tracker/components/Modals.jsx:263 | label-has-associated-control | warning | FIXED |  |
| src/tracker/components/Modals.jsx:263 | no-placeholder-only-field | warning | FIXED |  |
| src/tracker/components/Modals.jsx:290 | control-has-associated-label | warning | FIXED |  |
| src/tracker/components/Modals.jsx:481 | click-events-have-key-events | warning | FIXED |  |
| src/tracker/components/Modals.jsx:481 | no-static-element-interactions | warning | FIXED |  |
| src/tracker/components/Modals.jsx:541 | click-events-have-key-events | warning | FIXED |  |
| src/tracker/components/Modals.jsx:541 | no-static-element-interactions | warning | FIXED |  |
| src/tracker/components/Pop.jsx:7 | no-high-complexity-react-function | warning | FIXED |  |
| src/tracker/components/Pop.jsx:95 | click-events-have-key-events | warning | FIXED |  |
| src/tracker/components/Pop.jsx:127 | no-array-index-as-key | warning | KEPT | a failure's place in the list is its name (ST-02, then ST-02X — failLabel by index), and the spans hold no state of their own */ (now line 70) |
| src/tracker/components/ShowAllPanel.jsx:35 | no-autofocus | warning | KEPT | not on a page load: the editor opens because Edit was pressed, and the keyboard goes into it (design guide §2) (now line 36) |
| src/tracker/components/ShowAllPanel.jsx:110 | click-events-have-key-events | warning | FIXED |  |
| src/tracker/components/ShowAllPanel.jsx:110 | no-static-element-interactions | warning | FIXED |  |
| src/tracker/components/ShowAllPanel.jsx:117 | no-placeholder-only-field | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:11 | no-high-complexity-react-function | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:34 | click-events-have-key-events | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:34 | no-static-element-interactions | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:41 | click-events-have-key-events | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:41 | no-static-element-interactions | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:45 | control-has-associated-label | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:54 | control-has-associated-label | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:56 | control-has-associated-label | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:75 | click-events-have-key-events | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:75 | no-static-element-interactions | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:79 | control-has-associated-label | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:85 | js-set-map-lookups | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:92 | js-set-map-lookups | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:126 | click-events-have-key-events | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:126 | no-static-element-interactions | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:157 | click-events-have-key-events | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:157 | no-static-element-interactions | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:177 | click-events-have-key-events | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:177 | no-static-element-interactions | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:182 | control-has-associated-label | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:243 | click-events-have-key-events | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:243 | no-static-element-interactions | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:244 | prefer-html-dialog | warning | KEPT | a <dialog> opens in the browser's top layer, above the Tracker's own order (a question at 100 must stay over this window at 70), with its own backdrop and focus rules; this window is the Failures list's clone and keeps its place (now line 263) |
| src/tracker/components/SidePanel.jsx:270 | no-high-complexity-react-function | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:349 | click-events-have-key-events | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:349 | no-static-element-interactions | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:349 | click-events-have-key-events | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:349 | no-static-element-interactions | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:420 | label-has-associated-control | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:421 | label-has-associated-control | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:422 | label-has-associated-control | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:423 | label-has-associated-control | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:446 | control-has-associated-label | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:488 | prefer-tag-over-role | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:511 | click-events-have-key-events | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:511 | no-static-element-interactions | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:511 | no-array-index-as-key | warning | KEPT | a lull period has no id of its own; the chips hold no state, and each press reads its place fresh from this drawing */ (now line 477) |
| src/tracker/components/SidePanel.jsx:514 | click-events-have-key-events | warning | FIXED |  |
| src/tracker/components/SidePanel.jsx:514 | no-static-element-interactions | warning | FIXED |  |
| src/tracker/peoplewire.ts:69 | js-set-map-lookups | warning | FIXED |  |
| src/ui/AvailWindow.tsx:94 | exhaustive-deps | warning | FIXED |  |
| src/ui/ChangesWindow.tsx:139 | effect-needs-cleanup | error | KEPT | its cleanup takes off both listeners, by the same old-Safari-or-new path each was added (a ternary the check cannot follow) (now line 140) |
| src/ui/ChangesWindow.tsx:155 | exhaustive-deps | warning | FIXED |  |
| src/ui/DateBox.tsx:166 | no-ref-current-in-render | error | FIXED |  |
| src/ui/DaysWindow.tsx:156 | no-ref-current-in-render | error | FIXED |  |
| src/ui/DayTplModal.tsx:38 | exhaustive-deps | warning | FIXED |  |
| src/ui/DraftsModal.tsx:40 | exhaustive-deps | warning | FIXED |  |
| src/ui/DraftsModal.tsx:40 | exhaustive-deps | warning | FIXED |  |
| src/ui/Drawer.tsx:60 | exhaustive-deps | warning | FIXED |  |
| src/ui/floatwin.ts:202 | exhaustive-deps | warning | KEPT | the caller's deps say when a new window opens; the rest is read live through `live` (now line 211) |
| src/ui/floatwin.ts:202 | exhaustive-deps | warning | KEPT | the caller's deps say when a new window opens; the panel is found afresh each time it does (now line 224) |
| src/ui/floatwin.ts:208 | no-ref-current-in-render | error | FIXED |  |
| src/ui/floatwin.ts:209 | effect-needs-cleanup | error | FIXED |  |
| src/ui/floatwin.ts:215 | exhaustive-deps | warning | KEPT | the caller's deps say when a new window opens; the box is read live through `live` (now line 245) |
| src/ui/floatwin.ts:215 | exhaustive-deps | warning | FIXED |  |
| src/ui/floatwin.ts:235 | exhaustive-deps | warning | FIXED |  |
| src/ui/floatwin.ts:235 | exhaustive-deps | warning | FIXED |  |
| src/ui/FloatWindow.tsx:189 | no-ref-current-in-render | error | FIXED |  |
| src/ui/inputedit.tsx:2541 | exhaustive-deps | warning | KEPT | re-seeds only when a different record is opened; on a repaint it would throw away what he has typed (now line 2542) |
| src/ui/inputedit.tsx:2549 | exhaustive-deps | warning | KEPT | after every paint on purpose (any store change can alter the record behind the window); it sets state only when something differs, so it settles (now line 2551) |
| src/ui/InputsCal.tsx:308 | no-impure-state-updater | error | FIXED |  |
| src/ui/InputsCal.tsx:407 | exhaustive-deps | warning | KEPT | cancelPick reads only pickFor, pickWords and pickIso (named here) and setters; re-arming per render would reorder the window's Escape listeners (now line 404) |
| src/ui/InputsCal.tsx:430 | no-ref-current-in-render | error | FIXED |  |
| src/ui/InputsCal.tsx:538 | no-ref-current-in-render | error | FIXED |  |
| src/ui/InputsPage.tsx:208 | no-ref-current-in-render | error | FIXED |  |
| src/ui/InputsPage.tsx:286 | effect-needs-cleanup | error | KEPT | the light's timer is held in flashT and cleared on unmount by the effect above; clearing it on the next reveal would cut a light short (now line 290) |
| src/ui/LogicPage.tsx:234 | no-ref-current-in-render | error | KEPT | must stand before the commit removes the old boxes, whose change Chrome raises before any effect runs (now line 239) |
| src/ui/LogicPage.tsx:264 | effect-needs-cleanup | error | FIXED |  |
| src/ui/MedicalView.tsx:165 | exhaustive-deps | warning | FIXED |  |
| src/ui/Modals.tsx:175 | exhaustive-deps | warning | KEPT | the snapshot is taken once per window opened (AIRKEY), never again on a repaint that would adopt half-typed words as the "before" (now line 176) |
| src/ui/Modals.tsx:224 | effect-needs-cleanup | error | FIXED |  |
| src/ui/PeoplePick.tsx:165 | no-ref-current-in-render | error | FIXED |  |
| src/ui/QualsPage.tsx:377 | no-ref-current-in-render | error | FIXED |  |
| src/ui/QualsPage.tsx:379 | no-ref-current-in-render | error | FIXED |  |
| src/ui/QualsPage.tsx:483 | no-ref-current-in-render | error | FIXED |  |
| src/ui/QualsPage.tsx:642 | exhaustive-deps | warning | FIXED |  |
| src/ui/QualsPage.tsx:744 | effect-needs-cleanup | error | KEPT | every cell watchCells observes is on the one ResizeObserver this effect's cleanup disconnects (now line 750) |
| src/ui/QualsPage.tsx:780 | no-impure-state-updater | error | FIXED |  |
| src/ui/SansCal.tsx:152 | no-ref-current-in-render | error | FIXED |  |
| src/ui/SansCal.tsx:168 | no-ref-current-in-render | error | FIXED |  |
| src/ui/SchedBoard.tsx:119 | exhaustive-deps | warning | FIXED |  |
| src/ui/SchedBoard.tsx:167 | exhaustive-deps | warning | FIXED |  |
| src/ui/sheetfocus.ts:73 | exhaustive-deps | warning | KEPT | on opening and closing only: `box` is the caller's ref, and re-arming on a new `first` would move the keyboard on a repaint (now line 74) |
| src/ui/Shell.tsx:110 | no-ref-current-in-render | error | FIXED |  |
| src/ui/Shell.tsx:116 | no-ref-current-in-render | error | FIXED |  |
| src/ui/Shell.tsx:490 | exhaustive-deps | warning | KEPT | eng is a new object every render, so its four drawn fields stand for it (its undo and redo call the live history); fastOn, bellOn and bugOn are read by the children they redraw (now line 498) |
| src/ui/Shell.tsx:490 | exhaustive-deps | warning | KEPT | HLOPEN, HLGROUP, SEARCH and CURWEEK are the store's live module values, changed between renders; they redraw the page's chrome (now line 562) |
| src/ui/Shell.tsx:553 | exhaustive-deps | warning | KEPT | HIST, HLOPEN, HLGROUP, SEARCH and CURWEEK are the store's live module values, changed between renders; they redraw the page's chrome (now line 656) |
| src/ui/Shell.tsx:646 | exhaustive-deps | warning | FIXED |  |
| src/ui/topbits.tsx:177 | exhaustive-deps | warning | FIXED |  |
