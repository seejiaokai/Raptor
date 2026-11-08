# Walker B — the save layer ([RD-LEFT-1108]), 8 Nov 26 — main (d8d5b1f57) against the branch (8b54a2cd5)

Scripts: `scripts/handpass/rdl1108-walk.mjs` (+ `rdl1108-lib.mjs`, `rdl1108-parts.mjs`, `rdl1108-parts2.mjs`). Pictures: `docs/img/handpass/2026-11-08-rd-last-findings/walkB/` (`main-<step>.png` and `branch-<step>.png`; raw records `record-*.json` there). Clock 2026-11-08 09:00 +08:00 (running), desktop 1536x864 Chromium at 1.25, phone 402x874 WebKit by touch at 3. Values compared are what each screen said: toasts, Undo/Redo titles and states, row text, counts, the failed-save band, cell figures, browser-store key shapes.

**Walk: 214 steps, 208 SAME, 6 DIFF (3 distinct steps x 2 sizes, all the intended change), 0 FAIL, 428 pictures**

## DIFF (all expected, branch only)
- D01 (both sizes): Admin → Data "Period" heading is now a label tied to its list (main: no label for the list). Pictures `main/branch-D01-D-forms.png`, `-D01-P-forms.png`.
- D05 (both sizes): the range calendar is a named group "Dates" (role=group, labelled) on the branch; none on main.
- D08 (both sizes): a press on "Period" puts the keys on its list on the branch (admWipeMode / admLogMode); on main nothing. Opened `branch-D08-P-period-label.png` and `main-D08-P-period-label.png`: identical except the focus ring on the Edit history list on the branch.

## FAIL
None left. Every value matched main for every other step.

## Steps (scenario, step, what was pressed, SAME/DIFF; each on both sizes, desktop D and phone P)
| S19 | D01-D-forms | both forms: labels, modes | DIFF | main-D01-D-forms.png, branch-D01-D-forms.png |
| S19 | D01-P-forms | both forms: labels, modes | DIFF | main-D01-P-forms.png, branch-D01-P-forms.png |
| S19 | D02-D-log-specific | edit history: specific date 8 Nov, arm | SAME | main-D02-D-log-specific.png, branch-D02-D-log-specific.png |
| S19 | D02-P-log-specific | edit history: specific date 8 Nov, arm | SAME | main-D02-P-log-specific.png, branch-D02-P-log-specific.png |
| S19 | D03-D-log-disarm | change mode: disarms | SAME | main-D03-D-log-disarm.png, branch-D03-D-log-disarm.png |
| S19 | D03-P-log-disarm | change mode: disarms | SAME | main-D03-P-log-disarm.png, branch-D03-P-log-disarm.png |
| S19 | D04-D-log-older-zero | older than 7 Nov: zero | SAME | main-D04-D-log-older-zero.png, branch-D04-D-log-older-zero.png |
| S19 | D04-P-log-older-zero | older than 7 Nov: zero | SAME | main-D04-P-log-older-zero.png, branch-D04-P-log-older-zero.png |
| S19 | D05-D-log-range | range 5–7 Nov: zero; range mode shows the calendar | DIFF | main-D05-D-log-range.png, branch-D05-D-log-range.png |
| S19 | D05-P-log-range | range 5–7 Nov: zero; range mode shows the calendar | DIFF | main-D05-P-log-range.png, branch-D05-P-log-range.png |
| S19 | D06-D-log-clear-today | specific date 8 Nov: arm then clear | SAME | main-D06-D-log-clear-today.png, branch-D06-D-log-clear-today.png |
| S19 | D06-P-log-clear-today | specific date 8 Nov: arm then clear | SAME | main-D06-P-log-clear-today.png, branch-D06-P-log-clear-today.png |
| S19 | D07-D-wipe-zero | old clutter: older than 7 Nov, nothing to clear | SAME | main-D07-D-wipe-zero.png, branch-D07-D-wipe-zero.png |
| S19 | D07-P-wipe-zero | old clutter: older than 7 Nov, nothing to clear | SAME | main-D07-P-wipe-zero.png, branch-D07-P-wipe-zero.png |
| S18 | D08-D-period-label | press the Period label of each form | DIFF | main-D08-D-period-label.png, branch-D08-D-period-label.png |
| S18 | D08-P-period-label | press the Period label of each form | DIFF | main-D08-P-period-label.png, branch-D08-P-period-label.png |
| S21 | E01-D-admin-undo-before | admin: Undo state | SAME | main-E01-D-admin-undo-before.png, branch-E01-D-admin-undo-before.png |
| S21 | E01-P-admin-undo-before | admin: Undo state | SAME | main-E01-P-admin-undo-before.png, branch-E01-P-admin-undo-before.png |
| S21 | E02-D-member-nav | member: pages and Undo | SAME | main-E02-D-member-nav.png, branch-E02-D-member-nav.png |
| S21 | E02-P-member-nav | member: pages and Undo | SAME | main-E02-P-member-nav.png, branch-E02-P-member-nav.png |
| S21 | E03-D-member-quals | member: Quals edit controls | SAME | main-E03-D-member-quals.png, branch-E03-D-member-quals.png |
| S21 | E03-P-member-quals | member: Quals edit controls | SAME | main-E03-P-member-quals.png, branch-E03-P-member-quals.png |
| S21 | E04-D-member-admin-route | member: Admin page reachable? | SAME | main-E04-D-member-admin-route.png, branch-E04-D-member-admin-route.png |
| S21 | E04-P-member-admin-route | member: Admin page reachable? | SAME | main-E04-P-member-admin-route.png, branch-E04-P-member-admin-route.png |
| S21 | E05-D-new-member | new member signs in: welcome / pages / Undo | SAME | main-E05-D-new-member.png, branch-E05-D-new-member.png |
| S21 | E05-P-new-member | new member signs in: welcome / pages / Undo | SAME | main-E05-P-new-member.png, branch-E05-P-new-member.png |
| S01 | F01-D-start | Leave War November: Required cells | SAME | main-F01-D-start.png, branch-F01-D-start.png |
| S01 | F01-P-start | Leave War November: Required cells | SAME | main-F01-P-start.png, branch-F01-P-start.png |
| S01 | F02-D-pilot7 | one-date pilot figure 7 on 9 Nov | SAME | main-F02-D-pilot7.png, branch-F02-D-pilot7.png |
| S01 | F02-P-pilot7 | one-date pilot figure 7 on 9 Nov | SAME | main-F02-P-pilot7.png, branch-F02-P-pilot7.png |
| S01 | F03-D-wso3 | WSO figure 3 on 9 Nov | SAME | main-F03-D-wso3.png, branch-F03-D-wso3.png |
| S01 | F03-P-wso3 | WSO figure 3 on 9 Nov | SAME | main-F03-P-wso3.png, branch-F03-P-wso3.png |
| S01 | F04-D-run11 | pilot run of 11 from 10 Nov | SAME | main-F04-D-run11.png, branch-F04-D-run11.png |
| S01 | F04-P-run11 | pilot run of 11 from 10 Nov | SAME | main-F04-P-run11.png, branch-F04-P-run11.png |
| S01 | F05-D-undo | Undo | SAME | main-F05-D-undo.png, branch-F05-D-undo.png |
| S01 | F05-P-undo | Undo | SAME | main-F05-P-undo.png, branch-F05-P-undo.png |
| S01 | F06-D-redo | Redo | SAME | main-F06-D-redo.png, branch-F06-D-redo.png |
| S01 | F06-P-redo | Redo | SAME | main-F06-P-redo.png, branch-F06-P-redo.png |
| S01 | F07-D-replace-run | replace the pilot figure on 9 Nov with a run from that date | SAME | main-F07-D-replace-run.png, branch-F07-D-replace-run.png |
| S01 | F07-P-replace-run | replace the pilot figure on 9 Nov with a run from that date | SAME | main-F07-P-replace-run.png, branch-F07-P-replace-run.png |
| S01 | F08-D-undo-undo | Undo twice | SAME | main-F08-D-undo-undo.png, branch-F08-D-undo-undo.png |
| S01 | F08-P-undo-undo | Undo twice | SAME | main-F08-P-undo-undo.png, branch-F08-P-undo-undo.png |
| S01 | F09-D-redo-redo | Redo twice then reload (R) | SAME | main-F09-D-redo-redo.png, branch-F09-D-redo-redo.png |
| S01 | F09-P-redo-redo | Redo twice then reload (R) | SAME | main-F09-P-redo-redo.png, branch-F09-P-redo-redo.png |
| S01 | F10-D-days-window | Days window: set Thursday 12 Nov to no-fly, then Undo, Redo | SAME | main-F10-D-days-window.png, branch-F10-D-days-window.png |
| S01 | F10-P-days-window | Days window: set Thursday 12 Nov to no-fly, then Undo, Redo | SAME | main-F10-P-days-window.png, branch-F10-P-days-window.png |
| S01 | F11-D-store | store key shapes | SAME | main-F11-D-store.png, branch-F11-D-store.png |
| S01 | F11-P-store | store key shapes | SAME | main-F11-P-store.png, branch-F11-P-store.png |
| S10 | G01-D-guest-on | Guest view switch on | SAME | main-G01-D-guest-on.png, branch-G01-D-guest-on.png |
| S10 | G01-P-guest-on | Guest view switch on | SAME | main-G01-P-guest-on.png, branch-G01-P-guest-on.png |
| S10 | G02-D-guest-undo | Undo, Redo | SAME | main-G02-D-guest-undo.png, branch-G02-D-guest-undo.png |
| S10 | G02-P-guest-undo | Undo, Redo | SAME | main-G02-P-guest-undo.png, branch-G02-P-guest-undo.png |
| S10 | G03-D-guest-reload | reload keeps it | SAME | main-G03-D-guest-reload.png, branch-G03-D-guest-reload.png |
| S10 | G03-P-guest-reload | reload keeps it | SAME | main-G03-P-guest-reload.png, branch-G03-P-guest-reload.png |
| S10 | G04-D-secorder-open | Squadron config: default arrangement | SAME | main-G04-D-secorder-open.png, branch-G04-D-secorder-open.png |
| S10 | G04-P-secorder-open | Squadron config: default arrangement | SAME | main-G04-P-secorder-open.png, branch-G04-P-secorder-open.png |
| S10 | G05-D-secorder-down | move the first section down; Undo; Redo; reload | SAME | main-G05-D-secorder-down.png, branch-G05-D-secorder-down.png |
| S10 | G05-P-secorder-down | move the first section down; Undo; Redo; reload | SAME | main-G05-P-secorder-down.png, branch-G05-P-secorder-down.png |
| S10 | G06-D-secorder-reset | Reset to standard order | SAME | main-G06-D-secorder-reset.png, branch-G06-D-secorder-reset.png |
| S10 | G06-P-secorder-reset | Reset to standard order | SAME | main-G06-P-secorder-reset.png, branch-G06-P-secorder-reset.png |
| S10 | G07-D-inputs-gear | Inputs gear: member filing on, Save | SAME | main-G07-D-inputs-gear.png, branch-G07-D-inputs-gear.png |
| S10 | G07-P-inputs-gear | Inputs gear: member filing on, Save | SAME | main-G07-P-inputs-gear.png, branch-G07-P-inputs-gear.png |
| S10 | G08-D-inputs-undo-reload | Undo, Redo, reload | SAME | main-G08-D-inputs-undo-reload.png, branch-G08-D-inputs-undo-reload.png |
| S10 | G08-P-inputs-undo-reload | Undo, Redo, reload | SAME | main-G08-P-inputs-undo-reload.png, branch-G08-P-inputs-undo-reload.png |
| S09 | H01-D-first-admin-bell | admin who archived: bell | SAME | main-H01-D-first-admin-bell.png, branch-H01-D-first-admin-bell.png |
| S09 | H01-P-first-admin-bell | admin who archived: bell | SAME | main-H01-P-first-admin-bell.png, branch-H01-P-first-admin-bell.png |
| S09 | H02-D-second-admin-bell | second admin: bell lines (posting notice) | SAME | main-H02-D-second-admin-bell.png, branch-H02-D-second-admin-bell.png |
| S09 | H02-P-second-admin-bell | second admin: bell lines (posting notice) | SAME | main-H02-P-second-admin-bell.png, branch-H02-P-second-admin-bell.png |
| S09 | H03-D-read-one | tap one line | SAME | main-H03-D-read-one.png, branch-H03-D-read-one.png |
| S09 | H03-P-read-one | tap one line | SAME | main-H03-P-read-one.png, branch-H03-P-read-one.png |
| S09 | H04-D-mark-all | Mark all read, then reload: stays read | SAME | main-H04-D-mark-all.png, branch-H04-D-mark-all.png |
| S09 | H04-P-mark-all | Mark all read, then reload: stays read | SAME | main-H04-P-mark-all.png, branch-H04-P-mark-all.png |
| S08 | H05-D-changes-window | changes window, Mark all as seen | SAME | main-H05-D-changes-window.png, branch-H05-D-changes-window.png |
| S08 | H05-P-changes-window | changes window, Mark all as seen | SAME | main-H05-P-changes-window.png, branch-H05-P-changes-window.png |
| S03 | Q01-D-start | Quals open | SAME | main-Q01-D-start.png, branch-Q01-D-start.png |
| S03 | Q01-P-start | Quals open | SAME | main-Q01-P-start.png, branch-Q01-P-start.png |
| S03 | Q02-D-edit-flight | Edit on, Ace flight set to "ZZ", Save | SAME | main-Q02-D-edit-flight.png, branch-Q02-D-edit-flight.png |
| S03 | Q02-P-edit-flight | Edit on, Ace flight set to "ZZ", Save | SAME | main-Q02-P-edit-flight.png, branch-Q02-P-edit-flight.png |
| S03 | Q03-D-undo-redo | Undo, Redo | SAME | main-Q03-D-undo-redo.png, branch-Q03-D-undo-redo.png |
| S03 | Q03-P-undo-redo | Undo, Redo | SAME | main-Q03-P-undo-redo.png, branch-Q03-P-undo-redo.png |
| S03 | Q04-D-rename | rename Ace to AceX on Quals (callsign box), Save; reload | SAME | main-Q04-D-rename.png, branch-Q04-D-rename.png |
| S03 | Q04-P-rename | rename Ace to AceX on Quals (callsign box), Save; reload | SAME | main-Q04-P-rename.png, branch-Q04-P-rename.png |
| S20 | R01-D-access-screen | unknown sign-in: access screen, where the caret is, then fill | SAME | main-R01-D-access-screen.png, branch-R01-D-access-screen.png |
| S20 | R01-P-access-screen | unknown sign-in: access screen, where the caret is, then fill | SAME | main-R01-P-access-screen.png, branch-R01-P-access-screen.png |
| S20 | R02-D-long-name | 15-character name is refused, 14 accepted | SAME | main-R02-D-long-name.png, branch-R02-D-long-name.png |
| S20 | R02-P-long-name | 15-character name is refused, 14 accepted | SAME | main-R02-P-long-name.png, branch-R02-P-long-name.png |
| S20 | R03-D-blank-ini | blank initials: sent or refused | SAME | main-R03-D-blank-ini.png, branch-R03-D-blank-ini.png |
| S20 | R03-P-blank-ini | blank initials: sent or refused | SAME | main-R03-P-blank-ini.png, branch-R03-P-blank-ini.png |
| S20 | R04-D-seat-change | change Pilot/WSO/Personnel: CAT handling | SAME | main-R04-D-seat-change.png, branch-R04-D-seat-change.png |
| S20 | R04-P-seat-change | change Pilot/WSO/Personnel: CAT handling | SAME | main-R04-P-seat-change.png, branch-R04-P-seat-change.png |
| S20 | R05-D-send | valid request sent | SAME | main-R05-D-send.png, branch-R05-D-send.png |
| S20 | R05-P-send | valid request sent | SAME | main-R05-P-send.png, branch-R05-P-send.png |
| S17 | R06-D-second-admin-bell | second admin signed in: the bell and the admin count before viewing Users | SAME | main-R06-D-second-admin-bell.png, branch-R06-D-second-admin-bell.png |
| S17 | R06-P-second-admin-bell | second admin signed in: the bell and the admin count before viewing Users | SAME | main-R06-P-second-admin-bell.png, branch-R06-P-second-admin-bell.png |
| S17 | R07-D-categories-only | Admin categories only (not Users): alert still up on a phone | SAME | main-R07-D-categories-only.png, branch-R07-D-categories-only.png |
| S17 | R07-P-categories-only | Admin categories only (not Users): alert still up on a phone | SAME | main-R07-P-categories-only.png, branch-R07-P-categories-only.png |
| S17 | R08-D-waiting-list | Users list: waiting requests | SAME | main-R08-D-waiting-list.png, branch-R08-D-waiting-list.png |
| S17 | R08-P-waiting-list | Users list: waiting requests | SAME | main-R08-P-waiting-list.png, branch-R08-P-waiting-list.png |
| S17 | R09-D-giveaccess-roster | Give access on RDMATCH: default mode, note, switch modes, cancel, reopen | SAME | main-R09-D-giveaccess-roster.png, branch-R09-D-giveaccess-roster.png |
| S17 | R09-P-giveaccess-roster | Give access on RDMATCH: default mode, note, switch modes, cancel, reopen | SAME | main-R09-P-giveaccess-roster.png, branch-R09-P-giveaccess-roster.png |
| S04 | R10-D-approve-roster | pick RDMATCH on the roster, give access | SAME | main-R10-D-approve-roster.png, branch-R10-D-approve-roster.png |
| S04 | R10-P-approve-roster | pick RDMATCH on the roster, give access | SAME | main-R10-P-approve-roster.png, branch-R10-P-approve-roster.png |
| S04 | R11-D-approve-new | RDNEWBIE: New person with a future post-in date, give access | SAME | main-R11-D-approve-new.png, branch-R11-D-approve-new.png |
| S04 | R11-P-approve-new | RDNEWBIE: New person with a future post-in date, give access | SAME | main-R11-P-approve-new.png, branch-R11-P-approve-new.png |
| S17 | R12-D-refuse | Refuse the last request | SAME | main-R12-D-refuse.png, branch-R12-D-refuse.png |
| S17 | R12-P-refuse | Refuse the last request | SAME | main-R12-P-refuse.png, branch-R12-P-refuse.png |
| S17 | R13-D-reload | reload: waiting list and rows | SAME | main-R13-D-reload.png, branch-R13-D-reload.png |
| S17 | R13-P-reload | reload: waiting list and rows | SAME | main-R13-P-reload.png, branch-R13-P-reload.png |
| S07 | S01-D-band-after-add | add a person with sign-in under ?savefail | SAME | main-S01-D-band-after-add.png, branch-S01-D-band-after-add.png |
| S07 | S01-P-band-after-add | add a person with sign-in under ?savefail | SAME | main-S01-P-band-after-add.png, branch-S01-P-band-after-add.png |
| S07 | S02-D-edit-fail | edit sign-in, then Undo / Redo with the band up | SAME | main-S02-D-edit-fail.png, branch-S02-D-edit-fail.png |
| S07 | S02-P-edit-fail | edit sign-in, then Undo / Redo with the band up | SAME | main-S02-P-edit-fail.png, branch-S02-P-edit-fail.png |
| S07 | S03-D-retry | Retry keeps failing | SAME | main-S03-D-retry.png, branch-S03-D-retry.png |
| S07 | S03-P-retry | Retry keeps failing | SAME | main-S03-P-retry.png, branch-S03-P-retry.png |
| S07 | S04-D-guest-switch | settings edit (Guest view) under savefail | SAME | main-S04-D-guest-switch.png, branch-S04-D-guest-switch.png |
| S07 | S04-P-guest-switch | settings edit (Guest view) under savefail | SAME | main-S04-P-guest-switch.png, branch-S04-P-guest-switch.png |
| S07 | S05-D-reload-lost | reload without the switch: nothing kept | SAME | main-S05-D-reload-lost.png, branch-S05-D-reload-lost.png |
| S07 | S05-P-reload-lost | reload without the switch: nothing kept | SAME | main-S05-P-reload-lost.png, branch-S05-P-reload-lost.png |
| S07 | S06-D-request-notsent | request under savefail: Not sent yet | SAME | main-S06-D-request-notsent.png, branch-S06-D-request-notsent.png |
| S07 | S06-P-request-notsent | request under savefail: Not sent yet | SAME | main-S06-P-request-notsent.png, branch-S06-P-request-notsent.png |
| S11 | T01-D-write-in-tab1 | tab 1: change RDTWOA sign-in | SAME | main-T01-D-write-in-tab1.png, branch-T01-D-write-in-tab1.png |
| S11 | T01-P-write-in-tab1 | tab 1: change RDTWOA sign-in | SAME | main-T01-P-write-in-tab1.png, branch-T01-P-write-in-tab1.png |
| S11 | T02-D-stale-write-tab2 | tab 2 (stale): change RDTWOB sign-in | SAME | main-T02-D-stale-write-tab2.png, branch-T02-D-stale-write-tab2.png |
| S11 | T02-P-stale-write-tab2 | tab 2 (stale): change RDTWOB sign-in | SAME | main-T02-P-stale-write-tab2.png, branch-T02-P-stale-write-tab2.png |
| S11 | T03-D-stale-same-record | tab 2 (stale): change RDTWOA too (same record) | SAME | main-T03-D-stale-same-record.png, branch-T03-D-stale-same-record.png |
| S11 | T03-P-stale-same-record | tab 2 (stale): change RDTWOA too (same record) | SAME | main-T03-P-stale-same-record.png, branch-T03-P-stale-same-record.png |
| S11 | T04-D-reload-both | reload both tabs | SAME | main-T04-D-reload-both.png, branch-T04-D-reload-both.png |
| S11 | T04-P-reload-both | reload both tabs | SAME | main-T04-P-reload-both.png, branch-T04-P-reload-both.png |
| S03 | U01-D-start | Admin → Users opened | SAME | main-U01-D-start.png, branch-U01-D-start.png |
| S03 | U01-P-start | Admin → Users opened | SAME | main-U01-P-start.png, branch-U01-P-start.png |
| S04 | U02a-D-add | Add a person RDACTIVE | SAME | main-U02a-D-add.png, branch-U02a-D-add.png |
| S04 | U02a-P-add | Add a person RDACTIVE | SAME | main-U02a-P-add.png, branch-U02a-P-add.png |
| S04 | U02b-D-add | Add a person RDWSO | SAME | main-U02b-D-add.png, branch-U02b-D-add.png |
| S04 | U02b-P-add | Add a person RDWSO | SAME | main-U02b-P-add.png, branch-U02b-P-add.png |
| S04 | U02c-D-add | Add a person RDGROUND | SAME | main-U02c-D-add.png, branch-U02c-D-add.png |
| S04 | U02c-P-add | Add a person RDGROUND | SAME | main-U02c-P-add.png, branch-U02c-P-add.png |
| S04 | U02d-D-add | Add a person RDNOSIGN | SAME | main-U02d-D-add.png, branch-U02d-D-add.png |
| S04 | U02d-P-add | Add a person RDNOSIGN | SAME | main-U02d-P-add.png, branch-U02d-P-add.png |
| S04 | U02e-D-add | Add a person RDSUSP | SAME | main-U02e-D-add.png, branch-U02e-D-add.png |
| S04 | U02e-P-add | Add a person RDSUSP | SAME | main-U02e-P-add.png, branch-U02e-P-add.png |
| S04 | U02f-D-add | Add a person RDARCH | SAME | main-U02f-D-add.png, branch-U02f-D-add.png |
| S04 | U02f-P-add | Add a person RDARCH | SAME | main-U02f-P-add.png, branch-U02f-P-add.png |
| S04 | U02g-D-add | Add a person RDADMIN2 | SAME | main-U02g-D-add.png, branch-U02g-D-add.png |
| S04 | U02g-P-add | Add a person RDADMIN2 | SAME | main-U02g-P-add.png, branch-U02g-P-add.png |
| S04 | U03-D-undo-after-add | Undo after the adds | SAME | main-U03-D-undo-after-add.png, branch-U03-D-undo-after-add.png |
| S04 | U03-P-undo-after-add | Undo after the adds | SAME | main-U03-P-undo-after-add.png, branch-U03-P-undo-after-add.png |
| S05 | U04a-D-edit-open | open RDACTIVE editor | SAME | main-U04a-D-edit-open.png, branch-U04a-D-edit-open.png |
| S05 | U04a-P-edit-open | open RDACTIVE editor | SAME | main-U04a-P-edit-open.png, branch-U04a-P-edit-open.png |
| S05 | U04b-D-edit-save | change sign-in and role, Save | SAME | main-U04b-D-edit-save.png, branch-U04b-D-edit-save.png |
| S05 | U04b-P-edit-save | change sign-in and role, Save | SAME | main-U04b-P-edit-save.png, branch-U04b-P-edit-save.png |
| S05 | U04c-D-edit-undo | Undo | SAME | main-U04c-D-edit-undo.png, branch-U04c-D-edit-undo.png |
| S05 | U04c-P-edit-undo | Undo | SAME | main-U04c-P-edit-undo.png, branch-U04c-P-edit-undo.png |
| S05 | U04d-D-edit-redo | Redo | SAME | main-U04d-D-edit-redo.png, branch-U04d-D-edit-redo.png |
| S05 | U04d-P-edit-redo | Redo | SAME | main-U04d-P-edit-redo.png, branch-U04d-P-edit-redo.png |
| S05 | U04e-D-edit-undo2 | Undo again then reload (R) | SAME | main-U04e-D-edit-undo2.png, branch-U04e-D-edit-undo2.png |
| S05 | U04e-P-edit-undo2 | Undo again then reload (R) | SAME | main-U04e-P-edit-undo2.png, branch-U04e-P-edit-undo2.png |
| S05 | U04f-D-edit-save-reload | Save again then reload | SAME | main-U04f-D-edit-save-reload.png, branch-U04f-D-edit-save-reload.png |
| S05 | U04f-P-edit-save-reload | Save again then reload | SAME | main-U04f-P-edit-save-reload.png, branch-U04f-P-edit-save-reload.png |
| S05 | U05a-D-suspend | Suspend RDSUSP | SAME | main-U05a-D-suspend.png, branch-U05a-D-suspend.png |
| S05 | U05a-P-suspend | Suspend RDSUSP | SAME | main-U05a-P-suspend.png, branch-U05a-P-suspend.png |
| S05 | U05b-D-suspend-undo | Undo suspend | SAME | main-U05b-D-suspend-undo.png, branch-U05b-D-suspend-undo.png |
| S05 | U05b-P-suspend-undo | Undo suspend | SAME | main-U05b-P-suspend-undo.png, branch-U05b-P-suspend-undo.png |
| S05 | U05c-D-suspend-redo | Redo suspend | SAME | main-U05c-D-suspend-redo.png, branch-U05c-D-suspend-redo.png |
| S05 | U05c-P-suspend-redo | Redo suspend | SAME | main-U05c-P-suspend-redo.png, branch-U05c-P-suspend-redo.png |
| S05 | U05d-D-enable | Enable RDSUSP | SAME | main-U05d-D-enable.png, branch-U05d-D-enable.png |
| S05 | U05d-P-enable | Enable RDSUSP | SAME | main-U05d-P-enable.png, branch-U05d-P-enable.png |
| S05 | U05e-D-give-signin | Give sign-in to RDNOSIGN | SAME | main-U05e-D-give-signin.png, branch-U05e-D-give-signin.png |
| S05 | U05e-P-give-signin | Give sign-in to RDNOSIGN | SAME | main-U05e-P-give-signin.png, branch-U05e-P-give-signin.png |
| S12 | U06a-D-editor-draft | open RDWSO, type sign-in, change role, arm Delete | SAME | main-U06a-D-editor-draft.png, branch-U06a-D-editor-draft.png |
| S12 | U06a-P-editor-draft | open RDWSO, type sign-in, change role, arm Delete | SAME | main-U06a-P-editor-draft.png, branch-U06a-P-editor-draft.png |
| S12 | U06b-D-editor-cancel | Cancel, reopen | SAME | main-U06b-D-editor-cancel.png, branch-U06b-D-editor-cancel.png |
| S12 | U06b-P-editor-cancel | Cancel, reopen | SAME | main-U06b-P-editor-cancel.png, branch-U06b-P-editor-cancel.png |
| S12 | U06c-D-editor-sameRow | type, press same row (close), reopen | SAME | main-U06c-D-editor-sameRow.png, branch-U06c-D-editor-sameRow.png |
| S12 | U06c-P-editor-sameRow | type, press same row (close), reopen | SAME | main-U06c-P-editor-sameRow.png, branch-U06c-P-editor-sameRow.png |
| S12 | U06d-D-editor-otherRow | type, arm delete, open another row, back | SAME | main-U06d-D-editor-otherRow.png, branch-U06d-D-editor-otherRow.png |
| S12 | U06d-P-editor-otherRow | type, arm delete, open another row, back | SAME | main-U06d-P-editor-otherRow.png, branch-U06d-P-editor-otherRow.png |
| S12 | U06e-D-own-row | own row stays closed | SAME | main-U06e-D-own-row.png, branch-U06e-D-own-row.png |
| S12 | U06e-P-own-row | own row stays closed | SAME | main-U06e-P-own-row.png, branch-U06e-P-own-row.png |
| S16 | U07a-D-refuse-dup | type a sign-in already held, Save: refused | SAME | main-U07a-D-refuse-dup.png, branch-U07a-D-refuse-dup.png |
| S16 | U07a-P-refuse-dup | type a sign-in already held, Save: refused | SAME | main-U07a-P-refuse-dup.png, branch-U07a-P-refuse-dup.png |
| S16 | U07b-D-refuse-retype | tap away, tap the row afresh, type, correct it | SAME | main-U07b-D-refuse-retype.png, branch-U07b-D-refuse-retype.png |
| S16 | U07b-P-refuse-retype | tap away, tap the row afresh, type, correct it | SAME | main-U07b-P-refuse-retype.png, branch-U07b-P-refuse-retype.png |
| S16 | U07c-D-noop-save | Save unchanged: no extra Undo step | SAME | main-U07c-D-noop-save.png, branch-U07c-D-noop-save.png |
| S16 | U07c-P-noop-save | Save unchanged: no extra Undo step | SAME | main-U07c-P-noop-save.png, branch-U07c-P-noop-save.png |
| S13 | U08a-D-archive | Archive RDARCH | SAME | main-U08a-D-archive.png, branch-U08a-D-archive.png |
| S13 | U08a-P-archive | Archive RDARCH | SAME | main-U08a-P-archive.png, branch-U08a-P-archive.png |
| S13 | U08b-D-add-collision | add a different active RDARCH | SAME | main-U08b-D-add-collision.png, branch-U08b-D-add-collision.png |
| S13 | U08b-P-add-collision | add a different active RDARCH | SAME | main-U08b-P-add-collision.png, branch-U08b-P-add-collision.png |
| S13 | U08c-D-arch-open | open the archived list and the archived editor (taken name) | SAME | main-U08c-D-arch-open.png, branch-U08c-D-arch-open.png |
| S13 | U08c-P-arch-open | open the archived list and the archived editor (taken name) | SAME | main-U08c-P-arch-open.png, branch-U08c-P-arch-open.png |
| S13 | U08d-D-arch-refuse | type a taken callsign, Save name: refused; error clears on typing | SAME | main-U08d-D-arch-refuse.png, branch-U08d-D-arch-refuse.png |
| S13 | U08d-P-arch-refuse | type a taken callsign, Save name: refused; error clears on typing | SAME | main-U08d-P-arch-refuse.png, branch-U08d-P-arch-refuse.png |
| S13 | U08e-D-arch-savename | Save name without restoring | SAME | main-U08e-D-arch-savename.png, branch-U08e-D-arch-savename.png |
| S13 | U08e-P-arch-savename | Save name without restoring | SAME | main-U08e-P-arch-savename.png, branch-U08e-P-arch-savename.png |
| S13 | U08f-D-arch-cancel-reopen | arm delete, Cancel, reopen | SAME | main-U08f-D-arch-cancel-reopen.png, branch-U08f-D-arch-cancel-reopen.png |
| S13 | U08f-P-arch-cancel-reopen | arm delete, Cancel, reopen | SAME | main-U08f-P-arch-cancel-reopen.png, branch-U08f-P-arch-cancel-reopen.png |
| S13 | U08g-D-restore | Restore RDARCHB | SAME | main-U08g-D-restore.png, branch-U08g-D-restore.png |
| S13 | U08g-P-restore | Restore RDARCHB | SAME | main-U08g-P-restore.png, branch-U08g-P-restore.png |
| S22 | U09a-D-delete-arm | RDNOSIGN delete first tap | SAME | main-U09a-D-delete-arm.png, branch-U09a-D-delete-arm.png |
| S22 | U09a-P-delete-arm | RDNOSIGN delete first tap | SAME | main-U09a-P-delete-arm.png, branch-U09a-P-delete-arm.png |
| S22 | U09b-D-delete-go | second tap | SAME | main-U09b-D-delete-go.png, branch-U09b-D-delete-go.png |
| S22 | U09b-P-delete-go | second tap | SAME | main-U09b-P-delete-go.png, branch-U09b-P-delete-go.png |
| S03 | U09c-D-reload | reload: rows kept | SAME | main-U09c-D-reload.png, branch-U09c-D-reload.png |
| S03 | U09c-P-reload | reload: rows kept | SAME | main-U09c-P-reload.png, branch-U09c-P-reload.png |
| S03 | U09d-D-store | what the browser store holds (key shapes) | SAME | main-U09d-D-store.png, branch-U09d-D-store.png |
| S03 | U09d-P-store | what the browser store holds (key shapes) | SAME | main-U09d-P-store.png, branch-U09d-P-store.png |
| S02 | V01-D-war-open | Leave War open: approvals count | SAME | main-V01-D-war-open.png, branch-V01-D-war-open.png |
| S02 | V01-P-war-open | Leave War open: approvals count | SAME | main-V01-P-war-open.png, branch-V01-P-war-open.png |
| S02 | V02-D-approvals-first | first visit to Approvals | SAME | main-V02-D-approvals-first.png, branch-V02-D-approvals-first.png |
| S02 | V02-P-approvals-first | first visit to Approvals | SAME | main-V02-P-approvals-first.png, branch-V02-P-approvals-first.png |
| S02 | V03-D-approvals-leave-return | back to the grid and again; reload | SAME | main-V03-D-approvals-leave-return.png, branch-V03-D-approvals-leave-return.png |
| S02 | V03-P-approvals-leave-return | back to the grid and again; reload | SAME | main-V03-P-approvals-leave-return.png, branch-V03-P-approvals-leave-return.png |
| S02 | V04-D-my-leave | own window: My leave | SAME | main-V04-D-my-leave.png, branch-V04-D-my-leave.png |
| S02 | V04-P-my-leave | own window: My leave | SAME | main-V04-P-my-leave.png, branch-V04-P-my-leave.png |
## Coverage by scenario (what each step read)
- S03/S04/S05/S12/S13/S16/S22 (U01–U09): add 7 people (with and without sign-in, admin, personnel, WSO), sign-in/role Save, Undo, Redo, reload; Suspend/Undo/Redo/Enable; Give sign-in; editor draft reset by Cancel, same row, other row; own row stays closed; duplicate-sign-in refusal and retry; no-op Save adds no Undo step; Archive, taken-name archived editor, taken-callsign refusal and its error clearing, Save name, delete armed and cancelled, Restore as; two-tap Delete; reload; store key shapes. Add/archive/restore stay non-undoable on both builds.
- S17/S04/S20 (R01–R13): access screen caret in the callsign box (accCs on both), 15-letter name refused, 14 accepted, seat/CAT choices, blank initials accepted on both, request sent; second admin sees the count; Give access On the roster / New person, cancel and reopen, approve both ways with a 16 Nov post-in, Refuse, reload.
- S01 (F01–F11): Required figures, run, Undo/Redo, replace a run, reload, Days window no-fly, Undo/Redo — Leave War cells agree on both builds.
- S10 (G01–G08): Guest view, default section order (move, Undo, Redo, reload, Reset), member filing in the Inputs gear (Save, Undo, Redo, reload).
- S03 first write on Quals (Q01–Q04): flight edit, Undo, Redo, rename, reload.
- S02 (V01–V04): Approvals first visit, repeat, reload, My leave — seen marks written the same.
- S08 (H05): changes window Mark all as seen after another admin's change (ad duplicated a plan).
- S11 (T01–T04): second tab opened before the write; stale write of another record, stale write of the same record, reload both — same on both builds (main's stale-tab behaviour recorded, not judged).
- S07 (S01–S06): `?savefail`: band "Not saved — keep this page open / Retry", edits and Undo/Redo in memory, Retry keeps failing, Guest view under failure, reload keeps nothing, request screen shows "Not sent yet" — same.
- S19/S18 (D01–D08): clearing forms: modes, arm, disarm on mode change, zero-result toasts, clear 1 entry, labels.
- S21 (E01–E05): member `us` pages, Quals edit controls, Admin route denied, a new member signing in.

## Script's own first-run failures (fixed, not app faults)
Lock-step wrong selectors/order: archived editor reopened when already open (U08f/g); store keys unsorted (false DIFF); blank-initials request actually sends so later access-screen steps found no form (moved to its own request); Squadron config and Data categories not pressed on desktop / back button on phone; Quals names are inputs in edit mode; Period label found by `for=` which main lacks; changes "Mark all as seen" disabled with nothing new; phone sign-out from the access screen. All fixed and re-run on both builds.

## Not walked, and why
- S06 and every J variant (rejecting a command after its writes): needs a host test harness, not a control.
- S09 bell take-back and S02's genuine "new since last visit" dots: the posting and archive actions produced no bell lines for the second admin on either build (bell read "Nothing new" both), and no leave requests were filed, so only the empty and visit-mark state was compared.
- S10 settings other than Guest view, section order, member filing (rules, stores, cxreasons, day/duty/wave templates, wave hide, qual columns, lookahead, wave default, Insights, SANS colours): not driven.
- S15 (editor open while another change lands), S14 (hidden panel return), S22's downstream Leave War/Tracker/availability readings, S19 with real clutter (only zero-result tested), and the keyboard-inventory/pinch/real-phone lessons: not walked.
- Phone sizes ran in test WebKit by touch; first-frame and real-keyboard behaviour not judged.

## Console and page errors, 4xx
None on either build in any run (recorded per part; every errors list empty).

## Roll-call rows proved (§2a): P1 (Quals), P2 (partly: Guest view, section order, member filing), P3, P7, P8, P9 (partly), P10, P12 (start-up registration, via first writes after boot and reload); P4/P5/P6 only partly (change-history and visit marks; bell marks not produced).
