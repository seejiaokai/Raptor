# [FLAG-EXPORT] — export the PUBLISHED schedule + a report-grade PDF

**Branch:** `claude/flag-export` (off `main`). **Status:** functional half + a first design draft
built, gated; the VISUAL is the owner's call — a sample is rendered for him to pick/adjust.
Follow-up of [CRP-FLAG]. Owner direction 16 Sep 26 (OUTSTANDING.md [FLAG-EXPORT]).

## What the owner asked
The PDF is a REPORTING tool to an agency, not a planning grid. So:
- Export the **PUBLISHED** version of each day, not the scheduler's working copy.
- White background; ONE clean layout (NOT the planning sheet's many coloured grids).
- Drop the personnel-roster columns (the "Aircrew Available" block). `schedRows` never had them.
- "Similar to Raptor style is fine; need not match the sheet exactly." Sample of the squadron's
  current planning sheet: `docs/img/flag-export-sample-current.png` (committed on the CRP-FLAG branch).

## What's built (this branch)
- **Functional (`export.ts`):** `publishedDays()` resolves each day — an APPROVED day → its issued
  snapshot content (`daySnapOf(di, dayCurVer(di)).d`); an unpublished day → its live self (no signed
  version). `schedRows(days=DAYS)` is now parameterized; the PDF (`printpdf.ts`) and the CSV
  (`Shell.tsx`) both export `schedRows(publishedDays())`. `dayIssuedLabel(di)` gives the per-day
  "Published — ALn / Working draft — not yet signed" stamp.
- **Visual (`printpdf.ts:schedPrintHTML`) — DRAFT for the owner:** a report-grade A4-portrait doc:
  RESTRICTED marking top+bottom, a title header (squadron / week / "Generated … · published schedule"),
  then ONE titled block per day (day + date + the signed/working stamp) with a clean table — Wave,
  CS/Mission, Brief, T/O, Land, FCP, RCP, Area, Time, Remarks, Stores. Front/back seats fold into
  readable "CALLSIGN (LVL)" crew cells. Zebra rows, subtle borders, tabular-nums times. White only.
- **Sample rendered:** `docs/img/flag-export-sample-new.html` (Mon+Tue published, rest working — shows
  both stamps). Open it in a browser to see the design.
- **Tests:** `export-published.test.ts` (published vs working), `printpdf.test.ts` updated to the
  grouped-report format, `export.test.ts` unchanged (CSV encoding).

## Open for the owner
- **PICK / adjust the design** (his call). Easy directions if he wants: denser vs airier, a signature
  block at the foot (Planned/Approved by), including duties/sims/ground rows (currently flying only —
  matching the old export's scope), a logo, portrait vs landscape.
- **Next-week peek labelling** (OUTSTANDING) — when the export includes a next-week peek, label it
  working-vs-signed. Not built (the current export is the loaded week only).
- Not merged; holds for the owner's review + "merge live".
