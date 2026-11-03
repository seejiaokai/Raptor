# React Doctor — the schedule's warnings, one line each (3 Nov 26, job 3 of the night)

His D1534 / D490: the schedule's remaining React Doctor warnings ride with the schedule's batch. React Doctor 0.9.18's
full run of the night (`main` at 0becbf0e7) found 67 in the schedule's own screens and windows; the lines below are
where each stood on `claude/week-swipe-pdf-print` before this job (after jobs 1 and 2). Each is FIXED or KEPT with its
reason in a disable comment on the line above it in the code (never `doctor.config.json`). **41 FIXED, 26 KEPT.**
React Doctor re-run on the whole app after the job: **0 left in these files**; the whole project 742 → 675, no new
finding anywhere (`npm run lint:changed`: no new finding). Nothing a person sees changed: names a screen reader reads, a
shade marked as no control, code moved whole into files of its own, small parts that draw the same markup.

| where (before) | rule | disposition |
|---|---|---|
| src/ui/AvailWindow.tsx:59 | only-export-components | FIXED — moved whole into a file of its own (`availopen.ts openAvailWinFrom`) |
| src/ui/AvailWindow.tsx:85 | no-giant-component | KEPT — the same reason, one comment |
| src/ui/AvailWindow.tsx:85 | no-high-complexity-react-function | KEPT — two halves off ONE read of the crowd in the chip's world, the earn mode's masks and the float-window hook; split, the parts must still agree on one count and its words (D37, D44) |
| src/ui/AvailWindow.tsx:365 | prefer-html-dialog | KEPT — a `<dialog>` opens in the browser's top layer with its own backdrop, focus and Escape rules; this window floats beside the schedule without blocking it and is raised over or under the other by a press — layered on purpose (the 31 Oct 26 clean-up's reason) |
| src/ui/AvailWindow.tsx:403 | click-events-have-key-events | KEPT — the list is the crowd's pucks (each a Tab stop, as on the schedule); a tap does what a tap on his puck does (D65), and no puck on the schedule answers a key — keys for a puck are a keyboard design for every puck |
| src/ui/AvailWindow.tsx:403 | no-static-element-interactions | KEPT — the same reason, one comment |
| src/ui/board.ts:533 | js-set-map-lookups | KEPT — each warning's own short list of the men it names, asked once for one man; a different list each warning, so a Set would be built for one look-up |
| src/ui/board.ts:968 | js-set-map-lookups | FIXED — the ground rows before the sort read once into a Set |
| src/ui/board.ts:1622 | no-unthrottled-scroll-mutation | KEPT — the list must stand by its box on every scroll ([KEYBOARD-SCROLL], D1081); a scroll event comes at most once a frame, and a timer or a later frame would leave it a frame behind |
| src/ui/ChangesWindow.tsx:51 | only-export-components | FIXED — moved whole into a file of its own (`changesjump.ts jumpOf`) |
| src/ui/ChangesWindow.tsx:109 | no-high-complexity-react-function | FIXED — `EntryLine`'s change (its tag, words, from → to) drawn by a small part of its own, `EntryChange`, the same markup |
| src/ui/ChangesWindow.tsx:149 | no-high-complexity-react-function | KEPT — one window drawn three ways (the phone bar, by item, by who) off one set of choices and the float-window hook; split, the hook would run above every early return of each part and the keys, the raise and the phone bar (D167, D339, D345) be re-wired across parts |
| src/ui/ChangesWindow.tsx:218 | prefer-html-dialog | KEPT — a `<dialog>` opens in the browser's top layer with its own backdrop, focus and Escape rules; this window floats beside the schedule without blocking it and is raised over or under the other by a press — layered on purpose (the 31 Oct 26 clean-up's reason) — the phone's slim bar |
| src/ui/ChangesWindow.tsx:249 | prefer-html-dialog | KEPT — a `<dialog>` opens in the browser's top layer with its own backdrop, focus and Escape rules; this window floats beside the schedule without blocking it and is raised over or under the other by a press — layered on purpose (the 31 Oct 26 clean-up's reason) |
| src/ui/ChangesWindow.tsx:298 | click-events-have-key-events | KEPT — a box that hands on the press of the buttons inside it (each waiting change's own button, from the pending list's builder); the buttons are the controls |
| src/ui/ChangesWindow.tsx:298 | no-static-element-interactions | KEPT — the same reason, one comment |
| src/ui/ChangesWindow.tsx:299 | click-events-have-key-events | KEPT — the same: each day's button inside it is the control |
| src/ui/ChangesWindow.tsx:299 | no-static-element-interactions | KEPT — the same reason, one comment |
| src/ui/DutyTplModal.tsx:82 | no-static-element-interactions | FIXED — the shade `role="presentation"` (the keyboard's way out is Escape and ✕) |
| src/ui/DutyTplModal.tsx:84 | control-has-associated-label | FIXED — `aria-label="Close"` |
| src/ui/DutyTplModal.tsx:97 | control-has-associated-label | FIXED — `aria-label="Template name"` |
| src/ui/DutyTplModal.tsx:112 | control-has-associated-label | FIXED — `aria-label="Move up"` |
| src/ui/DutyTplModal.tsx:114 | control-has-associated-label | FIXED — `aria-label="Move down"` |
| src/ui/DutyTplModal.tsx:117 | control-has-associated-label | FIXED — `aria-label="Role"` |
| src/ui/DutyTplModal.tsx:119 | no-placeholder-only-field | FIXED — `aria-label="Start"` (the column heading's word; nothing visible added) |
| src/ui/DutyTplModal.tsx:123 | no-placeholder-only-field | FIXED — `aria-label="End"` |
| src/ui/DutyTplModal.tsx:127 | control-has-associated-label | FIXED — `aria-label="Remove this role"` |
| src/ui/FloatWindow.tsx:62 | only-export-components | KEPT — the windows' places and in-front order are this module's own state; moving them out changes the input's own window, the Inputs and SANS settings, the SANS day and some forty tests — the Inputs batch's files (D490) |
| src/ui/FloatWindow.tsx:79 | only-export-components | KEPT — the same reason (`bringForward`) |
| src/ui/FloatWindow.tsx:245 | prefer-html-dialog | KEPT — these windows leave the page working (D641, aria-modal false), stand in the order pressed and close on Escape front-first through this module's own order; a `<dialog>` brings the top layer's own rules |
| src/ui/highlights.ts:314 | js-set-map-lookups | FIXED — `warnTarget`'s named men read once into a Set (the same match) |
| src/ui/highlights.ts:324 | js-set-map-lookups | FIXED — the same Set |
| src/ui/highlights.ts:338 | js-set-map-lookups | FIXED — the same Set |
| src/ui/histbubble.ts:309 | js-set-map-lookups | KEPT — each history line's own short list of the inputs it was filed under, asked once; a different list each line |
| src/ui/histbubble.ts:315 | js-set-map-lookups | FIXED — a seat's own lines and its input's lines read once into one Set; the history's order kept |
| src/ui/histbubble.ts:315 | js-set-map-lookups | FIXED — a seat's own lines and its input's lines read once into one Set; the history's order kept |
| src/ui/histbubble.ts:333 | js-set-map-lookups | KEPT — each history line's own short list of the inputs it was filed under, asked once; a different list each line |
| src/ui/html.ts:606 | js-set-map-lookups | KEPT — each warning's own short list of the men it names, asked once for one man; a different list each warning, so a Set would be built for one look-up |
| src/ui/html.ts:637 | js-set-map-lookups | KEPT — each warning's own short list of the men it names, asked once for one man; a different list each warning, so a Set would be built for one look-up |
| src/ui/html.ts:866 | js-set-map-lookups | KEPT — each warning's own short list of the men it names, asked once for one man; a different list each warning, so a Set would be built for one look-up |
| src/ui/html.ts:2441 | js-set-map-lookups | FIXED — the day's missing sign-offs read once into a Set |
| src/ui/SchedBoard.tsx:43 | no-giant-component | KEPT — the same reason, one comment |
| src/ui/SchedBoard.tsx:43 | no-high-complexity-react-function | KEPT — the board's frame and the effects that hang the day built as a string (performance.md Part 1 §A); split, the effects that keep its scroll and caret (B54, the caret guard) would spread across parts whose running order keeps them |
| src/ui/SchedBoard.tsx:528 | click-events-have-key-events | KEPT — a box that hands a press to the day and week chips the builder draws (chips on a desktop, dots on a phone, in a measured bar); made buttons they would look different — his to see first (D853); a keyboard route is a design of its own |
| src/ui/SchedBoard.tsx:528 | no-static-element-interactions | KEPT — the same reason, one comment |
| src/ui/SchedBoard.tsx:554 | no-placeholder-only-field | FIXED — `aria-label="Search by name or callsign"` |
| src/ui/SchedBoard.tsx:803 | no-static-element-interactions | FIXED — the cancel dialog's shade `role="presentation"` |
| src/ui/SchedBoard.tsx:874 | no-static-element-interactions | FIXED — Sort all's shade `role="presentation"` |
| src/ui/topbits.tsx:35 | only-export-components | FIXED — moved whole into a file of its own (`topstate.ts`; `topbits.tsx` keeps the four drawn parts) |
| src/ui/topbits.tsx:36 | only-export-components | FIXED — moved whole into a file of its own (`topstate.ts`; `topbits.tsx` keeps the four drawn parts) |
| src/ui/topbits.tsx:61 | only-export-components | FIXED — moved whole into a file of its own (`topstate.ts`; `topbits.tsx` keeps the four drawn parts) |
| src/ui/topbits.tsx:62 | only-export-components | FIXED — moved whole into a file of its own (`topstate.ts`; `topbits.tsx` keeps the four drawn parts) |
| src/ui/topbits.tsx:63 | only-export-components | FIXED — moved whole into a file of its own (`topstate.ts`; `topbits.tsx` keeps the four drawn parts) |
| src/ui/topbits.tsx:67 | only-export-components | FIXED — moved whole into a file of its own (`topstate.ts`; `topbits.tsx` keeps the four drawn parts) |
| src/ui/topbits.tsx:104 | only-export-components | FIXED — moved whole into a file of its own (`topstate.ts`; `topbits.tsx` keeps the four drawn parts) |
| src/ui/topbits.tsx:265 | only-export-components | FIXED — moved whole into a file of its own (`topstate.ts`; `topbits.tsx` keeps the four drawn parts) |
| src/ui/topbits.tsx:285 | only-export-components | FIXED — moved whole into a file of its own (`topstate.ts`; `topbits.tsx` keeps the four drawn parts) |
| src/ui/WaveTplModal.tsx:46 | no-high-complexity-react-function | FIXED — a template's line card (`WaveLine`) and the show / hide eye (`WaveEye`, used twice) drawn by small parts of their own, the same markup |
| src/ui/WaveTplModal.tsx:98 | no-static-element-interactions | FIXED — the shade `role="presentation"` |
| src/ui/WaveTplModal.tsx:100 | control-has-associated-label | FIXED — `aria-label="Close"` |
| src/ui/WaveTplModal.tsx:145 | no-placeholder-only-field | FIXED — `aria-label="Template name"` |
| src/ui/WaveTplModal.tsx:165 | control-has-associated-label | FIXED — `aria-label="Move up"` |
| src/ui/WaveTplModal.tsx:167 | control-has-associated-label | FIXED — `aria-label="Move down"` |
| src/ui/WaveTplModal.tsx:170 | no-placeholder-only-field | FIXED — `aria-label="Callsign"` |
| src/ui/WaveTplModal.tsx:176 | no-placeholder-only-field | FIXED — `aria-label="Mission"` |
| src/ui/WaveTplModal.tsx:178 | no-placeholder-only-field | FIXED — `aria-label="Take-off"` |
| src/ui/WaveTplModal.tsx:182 | no-placeholder-only-field | FIXED — `aria-label="Landing"` |
