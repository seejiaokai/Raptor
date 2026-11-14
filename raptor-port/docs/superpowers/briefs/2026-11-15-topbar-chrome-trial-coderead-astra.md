# Astra's blind read — claude/topbar-chrome-trial (?barprobe), 15 Nov 26 (codex exec -C <repo> -s read-only, on 7673d6374)

Four findings. No files changed. Checks were in memory; I did not run the normal test runner or verify on an iPhone.

Without the switch, I found no added element, style, listener, animation request or change to the existing startup order. Sampling stops after its two-second tail. The spring calculation handles both negative scrolling at the top and scrolling beyond the foot.

1. **High — `bar` can give the opposite answer.** The calculation assumes the bar’s position is measured from the window’s top. The iPhone convention already handled elsewhere in the app measures from the visible top; WebKit has separate coordinate paths. With that convention, a bar visibly 29 points low and `vis @29` produces `bar 0`. A bar in place produces `bar -29`, contaminating WORST and the loose-frame count. Both cases reproduced in memory. **Fix:** use the app’s existing fixed reference mark to establish the visible top in the same coordinates as the bar, then subtract that. Test both coordinate conventions. [WebKit coordinate handling](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/page/LocalFrameView.cpp#L5963-L5972)

2. **Medium — the tests do not protect the main measurements.** All five supplied test bodies still passed in my in-memory runner after I forced `past` permanently to zero, removed `row`, or removed the visible-top adjustment. Their assertions never exercise those readings meaningfully. **Fix:** add explicit expected readings for negative top spring, positive foot spring, a visible pinned row’s gap, and non-zero visible-top offsets under both coordinate conventions. Each corresponding broken version must fail.

3. **Medium — the panel obscures Back and Close on the phone.** After tapping request dates on Approvals, those controls appear at the right of the bottom bar. The readings panel occupies the same area at 402×874 and paints above it. Presses pass through, but the controls are covered. **Fix:** when that bar is present, position the readings panel above its measured top, leaving a small gap; restore the corner position when it closes.

4. **Low — keyboard page changes can retain the previous page’s WORST.** After sampling stops, press Enter on another page name while already at the top. That navigation produces no click or scroll, so no frame is requested: the old page name and WORST remain until another watched event occurs. **Fix:** add keyboard presses to the enabled-only wake events and cleanup, with an after-idle navigation test.

Rulings: none this session.

Tidiness note, filed here only:

- **Anything unneeded?** Nothing identified.
- **Anything duplicated?** Current and worst readings repeat their formatting; one shared formatter would keep them aligned.
- **Anything hard to read?** Several state changes are compressed onto single lines, making sampling and reset behaviour harder to follow.
