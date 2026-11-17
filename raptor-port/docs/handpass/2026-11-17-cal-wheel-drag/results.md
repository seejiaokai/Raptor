# Walk: calendar wheels moved by a mouse drag (D2170), 17 Nov 26

Build: this worktree's own build, served on port 4192 (stopped afterwards). Script: `walk.mjs` (+ `lib.mjs`), final run folder `pics/`, raw rows `pics-rows.json`.
Desktop world 1536x864 at 1.25 scale, no touch; phone world 390x844, isMobile, touch (CDP finger). Signed in as admin.

**Counts: {"PASS":144}**  Walk time: 307 s for the final full run (about 5 min), plus earlier trial runs while fixing the script (selectors, case of month names, a month restore step).

Step key (desktop): A years drag up 132px, B months drag down 88px, C quick flick, D drag up 44px released sideways off the card, E plain click on the row below the band, F mouse wheel, G close wheels and finish as a person would. Phone: H finger up 100px (two pictures: ~100 ms after lift, and settled), G.

| # | Surface | Step | World | Result | Measured | Picture |
|---|---|---|---|---|---|---|
| 1 | undefined | A years drag up 132px | desk | PASS | year 2026 -> 2029 (want 2029); scrollTop 2772 (whole row true); open true; hosts unchanged; value 2026-11-17 -> 2026-11-17 | 01-admin-postin-A-year-drag-desk.png |
| 1 | undefined | B months drag down 88px | desk | PASS | month November -> September (want September); scrollTop 2552 (whole true); open true; hosts unchanged; value 2026-11-17 | 01-admin-postin-B-month-drag-desk.png |
| 1 | undefined | C quick flick up 88px | desk | PASS | year 2029 -> 2062 (want > 2031); scrollTop 2640 (whole true); open true; hosts unchanged | 01-admin-postin-C-flick-desk.png |
| 1 | undefined | D drag up 44px, release sideways off the card at x=1280 | desk | PASS | year 2062 -> 2063 (want 2063); released over "dcal-scrim"; open true; scrollTop 2684 (whole true); hosts unchanged; value 2026-11-17 | 01-admin-postin-D-drag-off-card-desk.png |
| 1 | undefined | E plain click on the row below the band | desk | PASS | year 2063 -> 2064 (want 2064); open true; hosts unchanged | 01-admin-postin-E-click-row-desk.png |
| 1 | undefined | F mouse scroll wheel 132 | desk | PASS | year 2064 -> 2067; scrollTop 2860 (whole true) |  |
| 1 | undefined | G close wheels and finish as a person would | desk | PASS | picked 2067-09-16, box shows 2067-09-16 (was 2026-11-17) | 01-admin-postin-G-result-desk.png |
| 2 | undefined | A years drag up 132px | desk | PASS | year 2026 -> 2029 (want 2029); scrollTop 2772 (whole row true); open true; hosts unchanged; value  ->  | 02-admin-admWipe-box-A-year-drag-desk.png |
| 2 | undefined | B months drag down 88px | desk | PASS | month November -> September (want September); scrollTop 2552 (whole true); open true; hosts unchanged; value  | 02-admin-admWipe-box-B-month-drag-desk.png |
| 2 | undefined | C quick flick up 88px | desk | PASS | year 2029 -> 2059 (want > 2031); scrollTop 2640 (whole true); open true; hosts unchanged | 02-admin-admWipe-box-C-flick-desk.png |
| 2 | undefined | D drag up 44px, release sideways off the card at x=1231 | desk | PASS | year 2059 -> 2060 (want 2060); released over "dcal-scrim"; open true; scrollTop 2684 (whole true); hosts unchanged; value  | 02-admin-admWipe-box-D-drag-off-card-desk.png |
| 2 | undefined | E plain click on the row below the band | desk | PASS | year 2060 -> 2061 (want 2061); open true; hosts unchanged | 02-admin-admWipe-box-E-click-row-desk.png |
| 2 | undefined | F mouse scroll wheel 132 | desk | PASS | year 2061 -> 2064; scrollTop 2860 (whole true) |  |
| 2 | undefined | G close wheels and finish as a person would | desk | PASS | picked 2064-09-16, box shows 2064-09-16; Clear button enabled=true | 02-admin-admWipe-box-G-result-desk.png |
| 2.1 | undefined | A years drag up 132px | desk | PASS | year 2026 -> 2029 (want 2029); scrollTop 2772 (whole row true); open true; hosts unchanged; value / -> / | 02a-admin-admWipe-run-A-year-drag-desk.png |
| 2.1 | undefined | B months drag down 88px | desk | PASS | month November -> September (want September); scrollTop 2552 (whole true); open true; hosts unchanged; value / | 02a-admin-admWipe-run-B-month-drag-desk.png |
| 2.1 | undefined | C quick flick up 88px | desk | PASS | year 2029 -> 2062 (want > 2031); scrollTop 2640 (whole true); open true; hosts unchanged | 02a-admin-admWipe-run-C-flick-desk.png |
| 2.1 | undefined | D drag up 44px, release sideways off the card at x=1231 | desk | PASS | year 2062 -> 2063 (want 2063); released over "page on"; open true; scrollTop 2684 (whole true); hosts unchanged; value / | 02a-admin-admWipe-run-D-drag-off-card-desk.png |
| 2.1 | undefined | E plain click on the row below the band | desk | PASS | year 2063 -> 2064 (want 2064); open true; hosts unchanged | 02a-admin-admWipe-run-E-click-row-desk.png |
| 2.1 | undefined | F mouse scroll wheel 132 | desk | PASS | year 2064 -> 2067; scrollTop 2860 (whole true) |  |
| 2.1 | undefined | G close wheels and finish as a person would | desk | PASS | run 2067-09-09 to 2067-09-12 (pressed 2067-09-09, 2067-09-12) | 02a-admin-admWipe-run-G-result-desk.png |
| 2.2 | undefined | A years drag up 132px | desk | PASS | year 2026 -> 2029 (want 2029); scrollTop 2772 (whole row true); open true; hosts unchanged; value / -> / | 02b-admin-admLog-run-A-year-drag-desk.png |
| 2.2 | undefined | B months drag down 88px | desk | PASS | month November -> September (want September); scrollTop 2552 (whole true); open true; hosts unchanged; value / | 02b-admin-admLog-run-B-month-drag-desk.png |
| 2.2 | undefined | C quick flick up 88px | desk | PASS | year 2029 -> 2064 (want > 2031); scrollTop 2640 (whole true); open true; hosts unchanged | 02b-admin-admLog-run-C-flick-desk.png |
| 2.2 | undefined | D drag up 44px, release sideways off the card at x=1231 | desk | PASS | year 2064 -> 2065 (want 2065); released over "page on"; open true; scrollTop 2684 (whole true); hosts unchanged; value / | 02b-admin-admLog-run-D-drag-off-card-desk.png |
| 2.2 | undefined | E plain click on the row below the band | desk | PASS | year 2065 -> 2066 (want 2066); open true; hosts unchanged | 02b-admin-admLog-run-E-click-row-desk.png |
| 2.2 | undefined | F mouse scroll wheel 132 | desk | PASS | year 2066 -> 2069; scrollTop 2860 (whole true) |  |
| 2.2 | undefined | G close wheels and finish as a person would | desk | PASS | run 2069-09-09 to 2069-09-12 (pressed 2069-09-09, 2069-09-12) | 02b-admin-admLog-run-G-result-desk.png |
| 3 | undefined | A years drag up 132px | desk | PASS | year 2026 -> 2029 (want 2029); scrollTop 2772 (whole row true); open true; hosts unchanged; value  ->  | 03-inputs-cal-A-year-drag-desk.png |
| 3 | undefined | B months drag down 88px | desk | PASS | month November -> September (want September); scrollTop 2552 (whole true); open true; hosts unchanged; value  | 03-inputs-cal-B-month-drag-desk.png |
| 3 | undefined | C quick flick up 88px | desk | PASS | year 2029 -> 2066 (want > 2031); scrollTop 2640 (whole true); open true; hosts unchanged | 03-inputs-cal-C-flick-desk.png |
| 3 | undefined | D drag up 44px, release sideways off the card at x=771 | desk | PASS | year 2066 -> 2067 (want 2067); released over "dcal-scrim"; open true; scrollTop 2684 (whole true); hosts unchanged; value  | 03-inputs-cal-D-drag-off-card-desk.png |
| 3 | undefined | E plain click on the row below the band | desk | PASS | year 2067 -> 2068 (want 2068); open true; hosts unchanged | 03-inputs-cal-E-click-row-desk.png |
| 3 | undefined | F mouse scroll wheel 132 | desk | PASS | year 2068 -> 2071; scrollTop 2860 (whole true) |  |
| 3 | undefined | G close wheels and finish as a person would | desk | PASS | chooser closed, page shows "SEPTEMBER 2071" (wheel left it on year 2071, month September) | 03-inputs-cal-G-result-desk.png |
| 4 | undefined | A years drag up 132px | desk | PASS | year 2026 -> 2029 (want 2029); scrollTop 2772 (whole row true); open true; hosts unchanged; value  ->  | 04-sans-cal-A-year-drag-desk.png |
| 4 | undefined | B months drag down 88px | desk | PASS | month November -> September (want September); scrollTop 2552 (whole true); open true; hosts unchanged; value  | 04-sans-cal-B-month-drag-desk.png |
| 4 | undefined | C quick flick up 88px | desk | PASS | year 2029 -> 2066 (want > 2031); scrollTop 2640 (whole true); open true; hosts unchanged | 04-sans-cal-C-flick-desk.png |
| 4 | undefined | D drag up 44px, release sideways off the card at x=771 | desk | PASS | year 2066 -> 2067 (want 2067); released over "dcal-scrim"; open true; scrollTop 2684 (whole true); hosts unchanged; value  | 04-sans-cal-D-drag-off-card-desk.png |
| 4 | undefined | E plain click on the row below the band | desk | PASS | year 2067 -> 2068 (want 2068); open true; hosts unchanged | 04-sans-cal-E-click-row-desk.png |
| 4 | undefined | F mouse scroll wheel 132 | desk | PASS | year 2068 -> 2071; scrollTop 2860 (whole true) |  |
| 4 | undefined | G close wheels and finish as a person would | desk | PASS | chooser closed, page shows "SEPTEMBER 2071" (wheel left year 2071, month September) | 04-sans-cal-G-result-desk.png |
| 5 | undefined | A years drag up 132px | desk | PASS | year 2026 -> 2029 (want 2029); scrollTop 2772 (whole row true); open true; hosts unchanged; value 0/1 -> 0/1 | 05-input-window-A-year-drag-desk.png |
| 5 | undefined | B months drag down 88px | desk | PASS | month July -> May (want May); scrollTop 2552 (whole true); open true; hosts unchanged; value 0/1 | 05-input-window-B-month-drag-desk.png |
| 5 | undefined | C quick flick up 88px | desk | PASS | year 2029 -> 2062 (want > 2031); scrollTop 2640 (whole true); open true; hosts unchanged | 05-input-window-C-flick-desk.png |
| 5 | undefined | D drag up 44px, release sideways off the card at x=1050 | desk | PASS | year 2062 -> 2063 (want 2063); released over "HTML"; open true; scrollTop 2684 (whole true); hosts unchanged; value 0/1 | 05-input-window-D-drag-off-card-desk.png |
| 5 | undefined | E plain click on the row below the band | desk | PASS | year 2063 -> 2064 (want 2064); open true; hosts unchanged | 05-input-window-E-click-row-desk.png |
| 5 | undefined | F mouse scroll wheel 132 | desk | PASS | year 2064 -> 2067; scrollTop 2860 (whole true) |  |
| 5 | undefined | G close wheels and finish as a person would | desk | PASS | pressed 2067-05-13; the calendar's foot says "(no foot)" | 05-input-window-G-result-desk.png |
| 6 | undefined | A years drag up 132px | desk | PASS | year 2026 -> 2029 (want 2029); scrollTop 2772 (whole row true); open true; hosts unchanged; value 17 Nov → 1 Dec -> 17 Nov → 1 Dec | 06-list-filter-A-year-drag-desk.png |
| 6 | undefined | B months drag down 88px | desk | PASS | month November -> September (want September); scrollTop 2552 (whole true); open true; hosts unchanged; value 17 Nov → 1 Dec | 06-list-filter-B-month-drag-desk.png |
| 6 | undefined | C quick flick up 88px | desk | PASS | year 2029 -> 2063 (want > 2031); scrollTop 2640 (whole true); open true; hosts unchanged | 06-list-filter-C-flick-desk.png |
| 6 | undefined | D drag up 44px, release sideways off the card at x=383 | desk | PASS | year 2063 -> 2064 (want 2064); released over "BODY"; open true; scrollTop 2684 (whole true); hosts unchanged; value 17 Nov → 1 Dec | 06-list-filter-D-drag-off-card-desk.png |
| 6 | undefined | E plain click on the row below the band | desk | PASS | year 2064 -> 2065 (want 2065); open true; hosts unchanged | 06-list-filter-E-click-row-desk.png |
| 6 | undefined | F mouse scroll wheel 132 | desk | PASS | year 2065 -> 2068; scrollTop 2860 (whole true) |  |
| 6 | undefined | G close wheels and finish as a person would | desk | PASS | range pressed 2068-09-09 to 2068-09-12; the filter button reads "9 Sep 68 → 12 Sep 68" | 06-list-filter-G-result-desk.png |
| 7 | undefined | A years drag up 132px | desk | PASS | year 2026 -> 2029 (want 2029); scrollTop 2772 (whole row true); open true; hosts unchanged; value 1/2026-07 -> 1/2029-07 | 07-oil-someday-A-year-drag-desk.png |
| 7 | undefined | B months drag down 88px | desk | PASS | month July -> May (want May); scrollTop 2552 (whole true); open true; hosts unchanged; value 1/2029-05 | 07-oil-someday-B-month-drag-desk.png |
| 7 | undefined | C quick flick up 88px | desk | PASS | year 2029 -> 2063 (want > 2031); scrollTop 2640 (whole true); open true; hosts unchanged | 07-oil-someday-C-flick-desk.png |
| 7 | undefined | D drag up 44px, release sideways off the card at x=1028 | desk | PASS | year 2063 -> 2064 (want 2064); released over "oilconf"; open true; scrollTop 2684 (whole true); hosts unchanged; value 1/2064-05 | 07-oil-someday-D-drag-off-card-desk.png |
| 7 | undefined | E plain click on the row below the band | desk | PASS | year 2064 -> 2065 (want 2065); open true; hosts unchanged | 07-oil-someday-E-click-row-desk.png |
| 7 | undefined | F mouse scroll wheel 132 | desk | PASS | year 2065 -> 2068; scrollTop 2860 (whole true) |  |
| 7 | undefined | G close wheels and finish as a person would | desk | PASS | closed the wheels; the calendar's month is 2026-07; 2 pressable day(s) on show (the wheels moved the month away from the question's July 2026 days; going back to July is by Today or by the wheels) | 07-oil-someday-G-result-desk.png |
| 8 | undefined | A years drag up 132px | desk | PASS | year 2026 -> 2029 (want 2029); scrollTop 2772 (whole row true); open true; hosts unchanged; value 13/07/2026 -> 13/07/2026 | 08-jump-date-A-year-drag-desk.png |
| 8 | undefined | B months drag down 88px | desk | PASS | month July -> May (want May); scrollTop 2552 (whole true); open true; hosts unchanged; value 13/07/2026 | 08-jump-date-B-month-drag-desk.png |
| 8 | undefined | C quick flick up 88px | desk | PASS | year 2029 -> 2057 (want > 2031); scrollTop 2640 (whole true); open true; hosts unchanged | 08-jump-date-C-flick-desk.png |
| 8 | undefined | D drag up 44px, release sideways off the card at x=4 | desk | PASS | year 2057 -> 2058 (want 2058); released over "airpop air-below"; open true; scrollTop 2684 (whole true); hosts unchanged; value 13/07/2026 | 08-jump-date-D-drag-off-card-desk.png |
| 8 | undefined | E plain click on the row below the band | desk | PASS | year 2058 -> 2059 (want 2059); open true; hosts unchanged | 08-jump-date-E-click-row-desk.png |
| 8 | undefined | F mouse scroll wheel 132 | desk | PASS | year 2059 -> 2062; scrollTop 2860 (whole true) |  |
| 8 | undefined | G close wheels and finish as a person would | desk | PASS | pressed 2062-05-19; the week went from 13/07/2026 to 15/05/2062 | 08-jump-date-G-result-desk.png |
| 9 | undefined | A years drag up 132px | desk | PASS | year 2026 -> 2029 (want 2029); scrollTop 2772 (whole row true); open true; hosts unchanged; value 2026-11-19/1 -> 2026-11-19/1 | 09-every-from-A-year-drag-desk.png |
| 9 | undefined | B months drag down 88px | desk | PASS | month November -> September (want September); scrollTop 2552 (whole true); open true; hosts unchanged; value 2026-11-19/1 | 09-every-from-B-month-drag-desk.png |
| 9 | undefined | C quick flick up 88px | desk | PASS | year 2029 -> 2059 (want > 2031); scrollTop 2640 (whole true); open true; hosts unchanged | 09-every-from-C-flick-desk.png |
| 9 | undefined | D drag up 44px, release sideways off the card at x=1148 | desk | PASS | year 2059 -> 2060 (want 2060); released over "dcal-scrim"; open true; scrollTop 2684 (whole true); hosts unchanged; value 2026-11-19/1 | 09-every-from-D-drag-off-card-desk.png |
| 9 | undefined | E plain click on the row below the band | desk | PASS | year 2060 -> 2061 (want 2061); open true; hosts unchanged | 09-every-from-E-click-row-desk.png |
| 9 | undefined | F mouse scroll wheel 132 | desk | PASS | year 2061 -> 2064; scrollTop 2860 (whole true) |  |
| 9 | undefined | G close wheels and finish as a person would | desk | PASS | picked 2064-09-16, From box shows 2064-09-16 (was 2026-11-19); Every window still up=1 | 09-every-from-G-result-desk.png |
| 10 | undefined | A years drag up 132px | desk | PASS | year 2026 -> 2029 (want 2029); scrollTop 2772 (whole row true); open true; hosts unchanged; value Pick a start date/1 -> Pick a start date/1 | 10-holidays-A-year-drag-desk.png |
| 10 | undefined | B months drag down 88px | desk | PASS | month November -> September (want September); scrollTop 2552 (whole true); open true; hosts unchanged; value Pick a start date/1 | 10-holidays-B-month-drag-desk.png |
| 10 | undefined | C quick flick up 88px | desk | PASS | year 2029 -> 2067 (want > 2031); scrollTop 2640 (whole true); open true; hosts unchanged | 10-holidays-C-flick-desk.png |
| 10 | undefined | D drag up 44px, release sideways off the card at x=1148 | desk | PASS | year 2067 -> 2068 (want 2068); released over "ib-day is-we"; open true; scrollTop 2684 (whole true); hosts unchanged; value Pick a start date/1 | 10-holidays-D-drag-off-card-desk.png |
| 10 | undefined | E plain click on the row below the band | desk | PASS | year 2068 -> 2069 (want 2069); open true; hosts unchanged | 10-holidays-E-click-row-desk.png |
| 10 | undefined | F mouse scroll wheel 132 | desk | PASS | year 2069 -> 2072; scrollTop 2860 (whole true) |  |
| 10 | undefined | G close wheels and finish as a person would | desk | PASS | pressed 2072-09-10; selection line reads "10 Sep 72" | 10-holidays-G-result-desk.png |
| 11 | undefined | A years drag up 132px | desk | PASS | year 2026 -> 2029 (want 2029); scrollTop 2772 (whole row true); open true; hosts unchanged; value Open for bidding 12 Jan – 16 Jan/1 -> Open for bidding 12 Jan – 16 Jan/1 | 11-lw-opendates-A-year-drag-desk.png |
| 11 | undefined | B months drag down 88px | desk | PASS | month January -> November (want November); scrollTop 2552 (whole true); open true; hosts unchanged; value Open for bidding 12 Jan – 16 Jan/1 | 11-lw-opendates-B-month-drag-desk.png |
| 11 | undefined | C quick flick up 88px | desk | PASS | year 2029 -> 2046 (want > 2031); scrollTop 3520 (whole true); open true; hosts unchanged | 11-lw-opendates-C-flick-desk.png |
| 11 | undefined | D drag up 44px, release sideways off the card at x=1088 | desk | PASS | year 2046 -> 2047 (want 2047); released over "sheet-scrim"; open true; scrollTop 3564 (whole true); hosts unchanged; value Open for bidding 12 Jan – 16 Jan/1 | 11-lw-opendates-D-drag-off-card-desk.png |
| 11 | undefined | E plain click on the row below the band | desk | PASS | year 2047 -> 2048 (want 2048); open true; hosts unchanged | 11-lw-opendates-E-click-row-desk.png |
| 11 | undefined | F mouse scroll wheel 132 | desk | PASS | year 2048 -> 2051; scrollTop 3740 (whole true) |  |
| 11 | undefined | G close wheels and finish as a person would | desk | PASS | pressed 2026-01-10 on the open-dates calendar; the sheet still open=1 | 11-lw-opendates-G-result-desk.png |
| 11.1 | undefined | A years drag up 132px | desk | PASS | year 2026 -> 2029 (want 2029); scrollTop 2772 (whole row true); open true; hosts unchanged; value 2026-07-14/1 -> 2026-07-14/1 | 11a-lw-pi-date-A-year-drag-desk.png |
| 11.1 | undefined | B months drag down 88px | desk | PASS | month July -> May (want May); scrollTop 2552 (whole true); open true; hosts unchanged; value 2026-07-14/1 | 11a-lw-pi-date-B-month-drag-desk.png |
| 11.1 | undefined | C quick flick up 88px | desk | PASS | year 2029 -> 2047 (want > 2031); scrollTop 3564 (whole true); open true; hosts unchanged | 11a-lw-pi-date-C-flick-desk.png |
| 11.1 | undefined | D drag up 44px, release sideways off the card at x=1088 | desk | PASS | year 2047 -> 2048 (want 2048); released over "dcal-scrim"; open true; scrollTop 3608 (whole true); hosts unchanged; value 2026-07-14/1 | 11a-lw-pi-date-D-drag-off-card-desk.png |
| 11.1 | undefined | E plain click on the row below the band | desk | PASS | year 2048 -> 2049 (want 2049); open true; hosts unchanged | 11a-lw-pi-date-E-click-row-desk.png |
| 11.1 | undefined | F mouse scroll wheel 132 | desk | PASS | year 2049 -> 2052; scrollTop 3784 (whole true) |  |
| 11.1 | undefined | G close wheels and finish as a person would | desk | PASS | picked 2052-05-16, box shows 2052-05-16 (was 2026-07-14); sheet still open=1 | 11a-lw-pi-date-G-result-desk.png |
| 11.2 | undefined | A years drag up 132px | desk | PASS | year 2026 -> 2029 (want 2029); scrollTop 2772 (whole row true); open true; hosts unchanged; value 2026-07-14/1 -> 2026-07-14/1 | 11b-lw-po-date-A-year-drag-desk.png |
| 11.2 | undefined | B months drag down 88px | desk | PASS | month July -> May (want May); scrollTop 2552 (whole true); open true; hosts unchanged; value 2026-07-14/1 | 11b-lw-po-date-B-month-drag-desk.png |
| 11.2 | undefined | C quick flick up 88px | desk | PASS | year 2029 -> 2045 (want > 2031); scrollTop 3476 (whole true); open true; hosts unchanged | 11b-lw-po-date-C-flick-desk.png |
| 11.2 | undefined | D drag up 44px, release sideways off the card at x=1088 | desk | PASS | year 2045 -> 2046 (want 2046); released over "dcal-scrim"; open true; scrollTop 3520 (whole true); hosts unchanged; value 2026-07-14/1 | 11b-lw-po-date-D-drag-off-card-desk.png |
| 11.2 | undefined | E plain click on the row below the band | desk | PASS | year 2046 -> 2047 (want 2047); open true; hosts unchanged | 11b-lw-po-date-E-click-row-desk.png |
| 11.2 | undefined | F mouse scroll wheel 132 | desk | PASS | year 2047 -> 2050; scrollTop 3696 (whole true) |  |
| 11.2 | undefined | G close wheels and finish as a person would | desk | PASS | picked 2050-05-16, box shows 2050-05-16 (was 2026-07-14); sheet still open=1 | 11b-lw-po-date-G-result-desk.png |
| 12 | undefined | A years drag up 132px | desk | PASS | year 2026 -> 2029 (want 2029); scrollTop 2772 (whole row true); open true; hosts unchanged; value 2026-07-13/1 -> 2026-07-13/1 | 12-upchit-A-year-drag-desk.png |
| 12 | undefined | B months drag down 88px | desk | PASS | month July -> May (want May); scrollTop 2552 (whole true); open true; hosts unchanged; value 2026-07-13/1 | 12-upchit-B-month-drag-desk.png |
| 12 | undefined | C quick flick up 88px | desk | PASS | year 2029 -> 2062 (want > 2031); scrollTop 2640 (whole true); open true; hosts unchanged | 12-upchit-C-flick-desk.png |
| 12 | undefined | D drag up 44px, release sideways off the card at x=1050 | desk | PASS | year 2062 -> 2063 (want 2063); released over "dcal-scrim"; open true; scrollTop 2684 (whole true); hosts unchanged; value 2026-07-13/1 | 12-upchit-D-drag-off-card-desk.png |
| 12 | undefined | E plain click on the row below the band | desk | PASS | year 2063 -> 2064 (want 2064); open true; hosts unchanged | 12-upchit-E-click-row-desk.png |
| 12 | undefined | F mouse scroll wheel 132 | desk | PASS | year 2064 -> 2067; scrollTop 2860 (whole true) |  |
| 12 | undefined | G close wheels and finish as a person would | desk | PASS | picked 2067-05-16, upchit box shows 2067-05-16 (was 2026-07-13); input window still up=1 | 12-upchit-G-result-desk.png |
| 1 | undefined | H finger up 100px (CDP touch) | phone | PASS | year 2026 -> 2028; scrollTop 2728 (whole true, settled true); open true; hosts unchanged; value 2026-11-17 -> 2026-11-17 | 01-admin-postin-H-finger-100ms-phone.png / 01-admin-postin-H-finger-settled-phone.png |
| 1 | undefined | G close wheels and finish | phone | PASS | picked 2028-11-16, box shows 2028-11-16 (was 2026-11-17) | 01-admin-postin-G-result-phone.png |
| 2 | undefined | H finger up 100px (CDP touch) | phone | PASS | year 2026 -> 2028; scrollTop 2728 (whole true, settled true); open true; hosts unchanged; value  ->  | 02-admin-admWipe-box-H-finger-100ms-phone.png / 02-admin-admWipe-box-H-finger-settled-phone.png |
| 2 | undefined | G close wheels and finish | phone | PASS | picked 2028-11-16, box shows 2028-11-16; Clear button enabled=true | 02-admin-admWipe-box-G-result-phone.png |
| 2.1 | undefined | H finger up 100px (CDP touch) | phone | PASS | year 2026 -> 2028; scrollTop 2728 (whole true, settled true); open true; hosts unchanged; value / -> / | 02a-admin-admWipe-run-H-finger-100ms-phone.png / 02a-admin-admWipe-run-H-finger-settled-phone.png |
| 2.1 | undefined | G close wheels and finish | phone | PASS | run 2028-11-09 to 2028-11-12 (pressed 2028-11-09, 2028-11-12) | 02a-admin-admWipe-run-G-result-phone.png |
| 2.2 | undefined | H finger up 100px (CDP touch) | phone | PASS | year 2026 -> 2028; scrollTop 2728 (whole true, settled true); open true; hosts unchanged; value / -> / | 02b-admin-admLog-run-H-finger-100ms-phone.png / 02b-admin-admLog-run-H-finger-settled-phone.png |
| 2.2 | undefined | G close wheels and finish | phone | PASS | run 2028-11-09 to 2028-11-12 (pressed 2028-11-09, 2028-11-12) | 02b-admin-admLog-run-G-result-phone.png |
| 3 | undefined | H finger up 100px (CDP touch) | phone | PASS | year 2026 -> 2028; scrollTop 2728 (whole true, settled true); open true; hosts unchanged; value  ->  | 03-inputs-cal-H-finger-100ms-phone.png / 03-inputs-cal-H-finger-settled-phone.png |
| 3 | undefined | G close wheels and finish | phone | PASS | chooser closed, page shows "NOV 2028" (wheel left it on year 2028, month nov) | 03-inputs-cal-G-result-phone.png |
| 4 | undefined | H finger up 100px (CDP touch) | phone | PASS | year 2026 -> 2028; scrollTop 2728 (whole true, settled true); open true; hosts unchanged; value  ->  | 04-sans-cal-H-finger-100ms-phone.png / 04-sans-cal-H-finger-settled-phone.png |
| 4 | undefined | G close wheels and finish | phone | PASS | chooser closed, page shows "NOV 2028" (wheel left year 2028, month nov) | 04-sans-cal-G-result-phone.png |
| 5 | undefined | H finger up 100px (CDP touch) | phone | PASS | year 2026 -> 2028; scrollTop 2728 (whole true, settled true); open true; hosts unchanged; value 0/1 -> 0/1 | 05-input-window-H-finger-100ms-phone.png / 05-input-window-H-finger-settled-phone.png |
| 5 | undefined | G close wheels and finish | phone | PASS | pressed 2028-07-13; the calendar's foot says "(no foot)" | 05-input-window-G-result-phone.png |
| 6 | undefined | H finger up 100px (CDP touch) | phone | PASS | year 2026 -> 2028; scrollTop 2728 (whole true, settled true); open true; hosts unchanged; value 17 Nov → 1 Dec -> 17 Nov → 1 Dec | 06-list-filter-H-finger-100ms-phone.png / 06-list-filter-H-finger-settled-phone.png |
| 6 | undefined | G close wheels and finish | phone | PASS | range pressed 2028-11-09 to 2028-11-12; the filter button reads "9–12 Nov 28" | 06-list-filter-G-result-phone.png |
| 7 | undefined | H finger up 100px (CDP touch) | phone | PASS | year 2026 -> 2028; scrollTop 2728 (whole true, settled true); open true; hosts unchanged; value 1/2026-07 -> 1/2028-07 | 07-oil-someday-H-finger-100ms-phone.png / 07-oil-someday-H-finger-settled-phone.png |
| 7 | undefined | G close wheels and finish | phone | PASS | closed the wheels; the calendar's month is 2026-07; 2 pressable day(s) on show (the wheels moved the month away from the question's July 2026 days; going back to July is by Today or by the wheels) | 07-oil-someday-G-result-phone.png |
| 8 | undefined | H finger up 100px (CDP touch) | phone | PASS | year 2026 -> 2028; scrollTop 2728 (whole true, settled true); open true; hosts unchanged; value 13/07/2026 -> 13/07/2026 | 08-jump-date-H-finger-100ms-phone.png / 08-jump-date-H-finger-settled-phone.png |
| 8 | undefined | G close wheels and finish | phone | PASS | pressed 2028-07-19; the week went from 13/07/2026 to 17/07/2028 | 08-jump-date-G-result-phone.png |
| 9 | undefined | H finger up 100px (CDP touch) | phone | PASS | year 2026 -> 2028; scrollTop 2728 (whole true, settled true); open true; hosts unchanged; value 2026-11-19/1 -> 2026-11-19/1 | 09-every-from-H-finger-100ms-phone.png / 09-every-from-H-finger-settled-phone.png |
| 9 | undefined | G close wheels and finish | phone | PASS | picked 2028-11-16, From box shows 2028-11-16 (was 2026-11-19); Every window still up=1 | 09-every-from-G-result-phone.png |
| 10 | undefined | H finger up 100px (CDP touch) | phone | PASS | year 2026 -> 2028; scrollTop 2728 (whole true, settled true); open true; hosts unchanged; value Pick a start date/1 -> Pick a start date/1 | 10-holidays-H-finger-100ms-phone.png / 10-holidays-H-finger-settled-phone.png |
| 10 | undefined | G close wheels and finish | phone | PASS | pressed 2028-11-10; selection line reads "10 Nov 28" | 10-holidays-G-result-phone.png |
| 11 | undefined | H finger up 100px (CDP touch) | phone | PASS | year 2026 -> 2028; scrollTop 2728 (whole true, settled true); open true; hosts unchanged; value Open 12 Jan – 16 Jan/1 -> Open 12 Jan – 16 Jan/1 | 11-lw-opendates-H-finger-100ms-phone.png / 11-lw-opendates-H-finger-settled-phone.png |
| 11 | undefined | G close wheels and finish | phone | PASS | pressed 2026-01-10 on the open-dates calendar; the sheet still open=1 | 11-lw-opendates-G-result-phone.png |
| 11.1 | undefined | H finger up 100px (CDP touch) | phone | PASS | year 2026 -> 2028; scrollTop 2728 (whole true, settled true); open true; hosts unchanged; value 2026-07-14/1 -> 2026-07-14/1 | 11a-lw-pi-date-H-finger-100ms-phone.png / 11a-lw-pi-date-H-finger-settled-phone.png |
| 11.1 | undefined | G close wheels and finish | phone | PASS | picked 2028-07-16, box shows 2028-07-16 (was 2026-07-14); sheet still open=1 | 11a-lw-pi-date-G-result-phone.png |
| 11.2 | undefined | H finger up 100px (CDP touch) | phone | PASS | year 2026 -> 2028; scrollTop 2728 (whole true, settled true); open true; hosts unchanged; value 2026-07-14/1 -> 2026-07-14/1 | 11b-lw-po-date-H-finger-100ms-phone.png / 11b-lw-po-date-H-finger-settled-phone.png |
| 11.2 | undefined | G close wheels and finish | phone | PASS | picked 2028-07-16, box shows 2028-07-16 (was 2026-07-14); sheet still open=1 | 11b-lw-po-date-G-result-phone.png |
| 12 | undefined | H finger up 100px (CDP touch) | phone | PASS | year 2026 -> 2028; scrollTop 2728 (whole true, settled true); open true; hosts unchanged; value 2026-07-13/1 -> 2026-07-13/1 | 12-upchit-H-finger-100ms-phone.png / 12-upchit-H-finger-settled-phone.png |
| 12 | undefined | G close wheels and finish | phone | PASS | picked 2028-07-16, upchit box shows 2028-07-16 (was 2026-07-13); input window still up=1 | 12-upchit-G-result-phone.png |

## FAILs

None in the final run.

## Not reached

None. All 12 surfaces were reached on both desktop and phone (surface 2 as three: the "Older than" date box, and the two clearing forms' run calendars; surface 11 as three: the open-bidding dates sheet, and the Post in and Post out sheet boxes).

## Notes for the reader (not faults)

- A quick flick (step C) glides on by a lot: +36 years from a 2-row flick on one run, between about +13 and +39 on others (it varies with timing). It always rests on a whole row and closes nothing. "Glides on further" is met; whether that distance feels right is for his hand to judge.
- Surfaces 3 and 4 (Inputs and SANS month titles): the chooser is a floating card over the page and the page's month turns live behind it as the wheels move, so the page's own box changes height by a few pixels with the month's number of weeks. The checked "host" is therefore the floating card, which did not move. Closing the chooser was done by a press on the veil (the title is covered), and the page then showed the month the wheels left it on.
- Surfaces 7 and 11 (od-range): a drag moves the month away from the dates the form accepts, so the wheels were wheeled back (mouse wheel) to the original month before step G. A day was then pressed normally.
- Desktop step D released the mouse over the veil/background in every case; no calendar, window or sheet closed or moved, and no date was picked.
- Picture caveat: 08-jump-date-G-result-*.png crops only the "Calendar" button (my crop selector was too loose); the week change itself is measured in the table (the week moved to the picked date). Every other picture was cropped to the calendar card, window or box named by its step.
- No console errors, page errors or 4xx responses were logged in any run (a failure there would appear as a row).
