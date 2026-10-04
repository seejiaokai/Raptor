# Original-picture inspection — phone Desktop Board, 4 Oct 26

Inspector: Astra planning/scenario agent. Each original named below was separately
opened with `view_image` and visually inspected; repeated pixels were not used as a
substitute for opening a file. This is a picture/evidence read, not final code
approval or approval of the inspector's own repair plan.

## Partial runs: walk, walk2, walk3, walk4

53 originals inspected, including all four FAILURE.png files. These are retained
partial-run and deliberate-break evidence, not four completed successful walks.
No physical iPhone Safari clearance follows. Final-run originals are not yet
included and must receive their own appended inspection entries.

All four normal-phone pictures show the existing stacked schedule. The restored
wide pictures show notes/Common Programme below sign-off; the breakpoint and
orientation round trips keep that content. At narrow widths the existing wide
layout extends beyond the viewport, so a picture of the left portion alone does
not establish reachable right-hand controls. The transient sideways-navigation
hint covers some rows in several pictures; this is not proof of a trapped row.
Each deliberately broken picture shows the blank body under sign-off again; it
is labelled override evidence, not a failure of the restored production CSS.

Run dispositions checked against each run's walk.json:
- `walk`: stopped at the right-pan assertion; main-content touch did not move the
  root. FAILURE shows restored content at the original horizontal position.
- `walk2`: right wheel pan reaches the side column. FAILURE shows the longer crew
  column at its bottom, while the shorter right column's last puck is above the
  roster's clipped top. The last-puck assertion failed; ordinary scroll-back
  recovery remains to be proved, rather than treating unequal heights as a repair.
- `walk3`: right wheel pan did not move the root after the touch attempt. FAILURE
  retains restored left-side content; this does not prove a completed pan route.
- `walk4`: toolbar-edge touch moves the root to240 and the roster from x861 to621;
  the subsequent wheel remains at240. FAILURE shows the corresponding partial
  horizontal position. Main-content touch is still not a successful root pan.

Phone touch and desktop-input wheel need separate completed qualification. A
still image does not establish a working gesture, final-item hit or return/Done.
No unobserved recovery is promoted to PASS in this ledger.

| Original file | Inspection | SHA256 |
|---|---|---|
| `walk/01-phone-normal.png` | Opened; bounded appearance evidence | `8f5bdc628b1814217df80e5c0abea37936a9fd8fc579dd84b7195ff17a503021` |
| `walk/02-phone-desktop-restored.png` | Opened; bounded appearance evidence | `6a7cf76b0b498e9970d051f627c278294d2a536ce7f5a18100dcc40c5f4bb562` |
| `walk/03-disposable-break-zero-width.png` | Opened; deliberate break only | `6917477582d39a1d91611a3934f634a43037c863fc577282ed8cfa739e89a46f` |
| `walk/04-short-phone.png` | Opened; bounded appearance evidence | `1629b0c9a62ae3d00ef23c5f4c4049e9937d8f5194107464d47628d34d9c819b` |
| `walk/05-wide-at820.png` | Opened; bounded appearance evidence | `f1890620bbde4d2343a3d698f1f1fb8655e45879f0d59d5001792b23909c6831` |
| `walk/06-wide-at821.png` | Opened; bounded appearance evidence | `a559b83f4a1a2b7da26cbc599b98669980add8c95f34dc98313a482d609a9c4c` |
| `walk/07-wide-landscape.png` | Opened; bounded appearance evidence | `e70a7dad1cbddd104b8ac8e6d9c4fe20cdadd9153b03616a17c34aa1fd191f47` |
| `walk/08-wide-desktop.png` | Opened; bounded appearance evidence | `72d43ce4fa05005663e184b09546024e0e3d61b9e9e6306a9adfa7a2072a05b3` |
| `walk/09-wide-back821.png` | Opened; bounded appearance evidence | `e5bd72d612b53f4afe74d1f42f75996aa9faf8b962478cb18918dd16f46b7166` |
| `walk/10-wide-back820.png` | Opened; bounded appearance evidence | `7645b2fac221516f32b97bd7aa36f61a8736eda7c7d3c74b02e8d86f7a49b267` |
| `walk/11-wide-backphone.png` | Opened; bounded appearance evidence | `9055cb4f4a489271234f778db2b248c7a93d0eda0b1e99467ab55a9015cfc092` |
| `walk/12-touch-pan.png` | Opened; touch attempt, not pan clearance | `9055cb4f4a489271234f778db2b248c7a93d0eda0b1e99467ab55a9015cfc092` |
| `walk/FAILURE.png` | Opened; partial-run failure, qualified above | `9055cb4f4a489271234f778db2b248c7a93d0eda0b1e99467ab55a9015cfc092` |
| `walk2/01-phone-normal.png` | Opened; bounded appearance evidence | `8f5bdc628b1814217df80e5c0abea37936a9fd8fc579dd84b7195ff17a503021` |
| `walk2/02-phone-desktop-restored.png` | Opened; bounded appearance evidence | `6a7cf76b0b498e9970d051f627c278294d2a536ce7f5a18100dcc40c5f4bb562` |
| `walk2/03-disposable-break-zero-width.png` | Opened; deliberate break only | `6917477582d39a1d91611a3934f634a43037c863fc577282ed8cfa739e89a46f` |
| `walk2/04-short-phone.png` | Opened; bounded appearance evidence | `1629b0c9a62ae3d00ef23c5f4c4049e9937d8f5194107464d47628d34d9c819b` |
| `walk2/05-wide-at820.png` | Opened; bounded appearance evidence | `f1890620bbde4d2343a3d698f1f1fb8655e45879f0d59d5001792b23909c6831` |
| `walk2/06-wide-at821.png` | Opened; bounded appearance evidence | `a559b83f4a1a2b7da26cbc599b98669980add8c95f34dc98313a482d609a9c4c` |
| `walk2/07-wide-landscape.png` | Opened; bounded appearance evidence | `e70a7dad1cbddd104b8ac8e6d9c4fe20cdadd9153b03616a17c34aa1fd191f47` |
| `walk2/08-wide-desktop.png` | Opened; bounded appearance evidence | `72d43ce4fa05005663e184b09546024e0e3d61b9e9e6306a9adfa7a2072a05b3` |
| `walk2/09-wide-back821.png` | Opened; bounded appearance evidence | `e5bd72d612b53f4afe74d1f42f75996aa9faf8b962478cb18918dd16f46b7166` |
| `walk2/10-wide-back820.png` | Opened; bounded appearance evidence | `7645b2fac221516f32b97bd7aa36f61a8736eda7c7d3c74b02e8d86f7a49b267` |
| `walk2/11-wide-backphone.png` | Opened; bounded appearance evidence | `9055cb4f4a489271234f778db2b248c7a93d0eda0b1e99467ab55a9015cfc092` |
| `walk2/12-touch-pan.png` | Opened; touch attempt, not pan clearance | `9055cb4f4a489271234f778db2b248c7a93d0eda0b1e99467ab55a9015cfc092` |
| `walk2/13-side-column-panned-right.png` | Opened; side column visible after pan | `fa83d08da3381705d1684a45066246f299178755379bc1d6cb3107d7282122bb` |
| `walk2/FAILURE.png` | Opened; partial-run failure, qualified above | `49f106720d91cb3131424a6b0d9b8ead3dfb68dbb136c3877dd67b9e32332699` |
| `walk3/01-phone-normal.png` | Opened; bounded appearance evidence | `8f5bdc628b1814217df80e5c0abea37936a9fd8fc579dd84b7195ff17a503021` |
| `walk3/02-phone-desktop-restored.png` | Opened; bounded appearance evidence | `6a7cf76b0b498e9970d051f627c278294d2a536ce7f5a18100dcc40c5f4bb562` |
| `walk3/03-disposable-break-zero-width.png` | Opened; deliberate break only | `6917477582d39a1d91611a3934f634a43037c863fc577282ed8cfa739e89a46f` |
| `walk3/04-short-phone.png` | Opened; bounded appearance evidence | `1629b0c9a62ae3d00ef23c5f4c4049e9937d8f5194107464d47628d34d9c819b` |
| `walk3/05-wide-at820.png` | Opened; bounded appearance evidence | `f1890620bbde4d2343a3d698f1f1fb8655e45879f0d59d5001792b23909c6831` |
| `walk3/06-wide-at821.png` | Opened; bounded appearance evidence | `a559b83f4a1a2b7da26cbc599b98669980add8c95f34dc98313a482d609a9c4c` |
| `walk3/07-wide-landscape.png` | Opened; bounded appearance evidence | `e70a7dad1cbddd104b8ac8e6d9c4fe20cdadd9153b03616a17c34aa1fd191f47` |
| `walk3/08-wide-desktop.png` | Opened; bounded appearance evidence | `72d43ce4fa05005663e184b09546024e0e3d61b9e9e6306a9adfa7a2072a05b3` |
| `walk3/09-wide-back821.png` | Opened; bounded appearance evidence | `e5bd72d612b53f4afe74d1f42f75996aa9faf8b962478cb18918dd16f46b7166` |
| `walk3/10-wide-back820.png` | Opened; bounded appearance evidence | `7645b2fac221516f32b97bd7aa36f61a8736eda7c7d3c74b02e8d86f7a49b267` |
| `walk3/11-wide-backphone.png` | Opened; bounded appearance evidence | `9055cb4f4a489271234f778db2b248c7a93d0eda0b1e99467ab55a9015cfc092` |
| `walk3/12-touch-pan.png` | Opened; touch attempt, not pan clearance | `9055cb4f4a489271234f778db2b248c7a93d0eda0b1e99467ab55a9015cfc092` |
| `walk3/FAILURE.png` | Opened; partial-run failure, qualified above | `569045d27ece2762711b0db18b1343b1a8a4398604f1c53712a5c3e9d0725e5f` |
| `walk4/01-phone-normal.png` | Opened; bounded appearance evidence | `8f5bdc628b1814217df80e5c0abea37936a9fd8fc579dd84b7195ff17a503021` |
| `walk4/02-phone-desktop-restored.png` | Opened; bounded appearance evidence | `6a7cf76b0b498e9970d051f627c278294d2a536ce7f5a18100dcc40c5f4bb562` |
| `walk4/03-disposable-break-zero-width.png` | Opened; deliberate break only | `6917477582d39a1d91611a3934f634a43037c863fc577282ed8cfa739e89a46f` |
| `walk4/04-short-phone.png` | Opened; bounded appearance evidence | `1629b0c9a62ae3d00ef23c5f4c4049e9937d8f5194107464d47628d34d9c819b` |
| `walk4/05-wide-at820.png` | Opened; bounded appearance evidence | `f1890620bbde4d2343a3d698f1f1fb8655e45879f0d59d5001792b23909c6831` |
| `walk4/06-wide-at821.png` | Opened; bounded appearance evidence | `a559b83f4a1a2b7da26cbc599b98669980add8c95f34dc98313a482d609a9c4c` |
| `walk4/07-wide-landscape.png` | Opened; bounded appearance evidence | `e70a7dad1cbddd104b8ac8e6d9c4fe20cdadd9153b03616a17c34aa1fd191f47` |
| `walk4/08-wide-desktop.png` | Opened; bounded appearance evidence | `72d43ce4fa05005663e184b09546024e0e3d61b9e9e6306a9adfa7a2072a05b3` |
| `walk4/09-wide-back821.png` | Opened; bounded appearance evidence | `e5bd72d612b53f4afe74d1f42f75996aa9faf8b962478cb18918dd16f46b7166` |
| `walk4/10-wide-back820.png` | Opened; bounded appearance evidence | `7645b2fac221516f32b97bd7aa36f61a8736eda7c7d3c74b02e8d86f7a49b267` |
| `walk4/11-wide-backphone.png` | Opened; bounded appearance evidence | `9055cb4f4a489271234f778db2b248c7a93d0eda0b1e99467ab55a9015cfc092` |
| `walk4/12-touch-pan.png` | Opened; touch attempt, not pan clearance | `9055cb4f4a489271234f778db2b248c7a93d0eda0b1e99467ab55a9015cfc092` |
| `walk4/FAILURE.png` | Opened; partial-run failure, qualified above | `31244b0f7038f1881b50b7fb219c338e58fe3337acbdce1ee462912ac6cc94c8` |

## Completed bounded run: walk5

22 additional originals individually opened by Astra; cumulative ledger count75.
Read `walk5/driver.mjs` and `walk5/walk.json` alongside the pictures. Runtime records
pass=true and errors=[] for the bounded sequence; this is not final-code approval.

The restored schedule appears through both breakpoint directions and landscape.
Toolbar-edge emulated touch moves the root0->240->790->0, and the side roster moves
from x861 to x71 with its own hit. Main-content touch still moves0->0 and remains
explicitly unproved as a root-pan route. The shorter crew column's final Vector
puck is recovered with ordinary scroll-back150; Gambit and Vector both receive
own hits. Schedule and roster scrolling remain independent. The final Unavailable
row visibly carries ATT C and Grit; the raw text also records medical leave till
17 Jul. The right-hand text is offscreen in that left-edge picture and is not
claimed as wholly visible there.

The run pans before its Next/Previous/More/Done hits, returns to Phone layout and
closes the Board. Phone-return and desktop-normal pictures match the existing
shapes; the driver deep-compares retained baseline geometry. The member picture
shows Ranger/Member and no Edit Schedule menu entry; runtime also asserts no
visible Board. No separate scheduler or guest fixture and no issued-record route
are claimed. No records were published to manufacture those states.

The separate desktop-input390px context proves wheel0->790->0 with named side and
schedule hits. It does not turn the failed mouse-wheel attempts after mobile touch
in earlier runs into successes. Physical iPhone Safari remains unverified.

**Asset identity is NOT established by this driver:** its HTML regex misses Vite's
`./assets` paths and `assets=[]` is vacuous. A separate nonempty served-build hash
proof is required. The supplemental all-ten-section scroll/hit roll-call is also
separate and not yet counted here. The deliberately broken picture remains break
proof only, despite being inside this completed run's folder.

| Original file | Inspection | SHA256 |
|---|---|---|
| `walk5/01-phone-normal.png` | Opened; bounded appearance evidence | `8f5bdc628b1814217df80e5c0abea37936a9fd8fc579dd84b7195ff17a503021` |
| `walk5/02-phone-desktop-restored.png` | Opened; bounded appearance evidence | `6a7cf76b0b498e9970d051f627c278294d2a536ce7f5a18100dcc40c5f4bb562` |
| `walk5/03-disposable-break-zero-width.png` | Opened; deliberate break only | `6917477582d39a1d91611a3934f634a43037c863fc577282ed8cfa739e89a46f` |
| `walk5/04-short-phone.png` | Opened; bounded appearance evidence | `1629b0c9a62ae3d00ef23c5f4c4049e9937d8f5194107464d47628d34d9c819b` |
| `walk5/05-wide-at820.png` | Opened; bounded appearance evidence | `f1890620bbde4d2343a3d698f1f1fb8655e45879f0d59d5001792b23909c6831` |
| `walk5/06-wide-at821.png` | Opened; bounded appearance evidence | `a559b83f4a1a2b7da26cbc599b98669980add8c95f34dc98313a482d609a9c4c` |
| `walk5/07-wide-landscape.png` | Opened; bounded appearance evidence | `e70a7dad1cbddd104b8ac8e6d9c4fe20cdadd9153b03616a17c34aa1fd191f47` |
| `walk5/08-wide-desktop.png` | Opened; bounded appearance evidence | `72d43ce4fa05005663e184b09546024e0e3d61b9e9e6306a9adfa7a2072a05b3` |
| `walk5/09-wide-back821.png` | Opened; bounded appearance evidence | `e5bd72d612b53f4afe74d1f42f75996aa9faf8b962478cb18918dd16f46b7166` |
| `walk5/10-wide-back820.png` | Opened; bounded appearance evidence | `7645b2fac221516f32b97bd7aa36f61a8736eda7c7d3c74b02e8d86f7a49b267` |
| `walk5/11-wide-backphone.png` | Opened; bounded appearance evidence | `9055cb4f4a489271234f778db2b248c7a93d0eda0b1e99467ab55a9015cfc092` |
| `walk5/12-touch-pan.png` | Opened; main-content touch did not pan | `9055cb4f4a489271234f778db2b248c7a93d0eda0b1e99467ab55a9015cfc092` |
| `walk5/13-side-column-panned-right.png` | Opened; panned side column visible | `b5660e72d6bd6865e0322650179e01fb951f3d750c2c664873a80ddd2eccf233` |
| `walk5/14-crew-final-column1.png` | Opened; Gambit visible at lower left crew end | `49f106720d91cb3131424a6b0d9b8ead3dfb68dbb136c3877dd67b9e32332699` |
| `walk5/14-crew-final-column2.png` | Opened; Vector visible after scroll-back | `dd41c9e8853c8322be342d3199b303c2c17ac5f551190dd985a5bf3e4d3af49f` |
| `walk5/15-schedule-final-independent.png` | Opened; final ATT C/Grit row visible | `c35b4e922c290cb6b9934d16567ab9f7d8da774e9b3bc25908aa64824c75d67e` |
| `walk5/16-next-day-after-switch.png` | Opened; next-day content changed | `3698313fac12c869124e545dd7bfb987081797335afbbff694b1f4640de4ae0b` |
| `walk5/17-phone-return.png` | Opened; stacked Phone layout restored | `da2c67dde2120deaa7d34cf0a2c0ccb9f0f8ffa9409cd3592ae8452655435a05` |
| `walk5/18-desktop-normal-unchanged.png` | Opened; desktop appearance retained | `e427f5070087bb92440b7da15f0de9928059dedb10a05bd9af69e02b0520ccdf` |
| `walk5/19-member-exclusion.png` | Opened; actual member has no Edit Schedule door | `f93c65b0ba6012cc3af1c200fb8d8583a4762592903e0dce19a65a4f09972b3e` |
| `walk5/20-desktop-input-wheel-right.png` | Opened; desktop-input wheel exposes side column | `3a64cb6579de79dfc7429989ed88c892b6b9348442e4b7afd3734310d1d7bbfd` |
| `walk5/21-desktop-input-wheel-left.png` | Opened; desktop-input wheel returns to schedule | `db98f9375c8ab96797d11afd66a62721e7b0e7346b007af2fb72c95722a23235` |

## Supplemental all-section roll-call

Four additional originals individually opened by Astra; cumulative ledger count79.
Read `rollcall/driver.mjs` and `rollcall/rollcall.json`. All ten section headers have
own hits and usable widths. Eight sections also have actual row own-hit records;
Available crew and SANS have header/width records and their grid/card content is
visible in section-8, not an invented row-selector hit. Personal Inputs was opened
through its existing header before its real Fly with/Gambit row was inspected.

Pictures show populated Flying waves, Sims and Ground Programme, plus SANS Tally,
available-crew grids and Unavailable rows. Right-hand parts extend beyond the
phone viewport in this existing Desktop layout. The transient sideways-navigation
hint covers some lower content; no claim that all text is simultaneously visible.
Working-copy/DRAFT and the17-issues/6-warnings text are retained in raw evidence.

The supplemental driver independently enumerates all dist files, fetches each
HTTP URL, requires a successful response, and compares its SHA256 with disk. Its
nonempty19-file result and explicit JS/CSS-presence assertions close the earlier
vacuous assets[] qualification for this served build. This is separate evidence;
walk5's empty asset list is not retroactively re-labelled as a successful check.

No source or plan approval is supplied by this picture/evidence inspection. The
fresh final code inspector still owns that read. Physical Safari remains outside
these Chromium results.

| Original file | Inspection | SHA256 |
|---|---|---|
| `rollcall/section-2.png` | Opened; Flying waves and populated flying rows | `f31f53e4f66cca9fa003b1f7d6d354de79297c943e9170bdf6288cc37803a110` |
| `rollcall/section-4.png` | Opened; AMT/OFT Sims and populated rows | `0a0833707528c7b1c2b8b21f89ee14b011dfbd1f3c3a87b51362ea05beb99c16` |
| `rollcall/section-5.png` | Opened; Ground Programme and populated rows | `beb6ddf15c8547d00d22469b71dfd7a0df4f15e9729cb5a87ccc8c51a57159f2` |
| `rollcall/section-8.png` | Opened; available grid, Tally SANS card, Unavailable rows | `5f59f69099b3606efe7a7ea953fd3bdfa1b1feb2576e0d8b4ebd8bef9c20d386` |
