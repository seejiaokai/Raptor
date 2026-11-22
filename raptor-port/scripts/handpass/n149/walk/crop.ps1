# Crops the walk's deciding pictures into the evidence sheet's folder. Each line: source (relative to the walk's
# scratch folder), x, y, width, height (in the picture's own pixels; 0 0 0 0 = whole), name in the sheet's folder.
param([string]$Src, [string]$Dst)
Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force $Dst | Out-Null
$list = @(
  @('w7-p-r1-a1-drawer-149-view.png', 0, 0, 804, 760, 'f1-phone-menu-offers-edit-schedule.png'),
  @('w7-p-r1-a2-after-tap-edit.png', 0, 0, 804, 420, 'f1-phone-tap-lands-view-only.png'),
  @('w1-d-10-after-pick-149.png', 0, 0, 1536, 60, 'f1-desktop-bar-no-edit-schedule.png'),
  @('w2-d-149-02-data-after-press.png', 0, 0, 0, 0, 'f2-desktop-clear-offered-press-silent.png'),
  @('w7-p-r1-b1-data-press.png', 0, 0, 804, 800, 'f2-phone-clear-offered.png'),
  @('w5-d-02-after-150.png', 300, 60, 920, 560, 'f3-squadrons-150-made.png'),
  @('w5-d-03-after-undo-150.png', 300, 60, 920, 804, 'f3-after-undo-lands-on-users.png'),
  @('w5-d-09-filter-149.png', 590, 200, 620, 420, 'q1-filter-149-heading-10.png'),
  @('w3-d-03-saber-149-tracker.png', 0, 0, 1536, 100, 'ok-tracker-band-a.png'),
  @('w8-d-member-tracker.png', 0, 0, 1536, 100, 'ok-tracker-member-view.png'),
  @('w3-d-12-inputwin-after-pick.png', 0, 0, 0, 0, 'ok-input-window-at-pick.png'),
  @('w4-d-06-hunterP-after-tap1.png', 0, 0, 0, 0, 'ok-bell-tap-149-request.png'),
  @('w5-d-12-hunter-homebase.png', 0, 0, 0, 0, 'ok-timezone-words.png'),
  @('w1-d-09-menu-open.png', 0, 0, 0, 0, 'ok-menu-view-only.png'),
  @('w6-d-01-kestrel-hunter-row.png', 0, 0, 0, 0, 'ok-kestrel-gives-view-rest-locked.png'),
  @('w1-d-12-admin-Squadronconfig.png', 300, 60, 920, 500, 'ok-squadron-config-149-view.png'),
  @('p\w5-p-05-menu-eight.png', 0, 0, 0, 0, 'ok-phone-menu-eight.png'),
  @('p\w5-p-06-bell-eight.png', 0, 0, 0, 0, 'ok-phone-bell-eight.png'),
  @('w10-d-02-lark-again.png', 0, 0, 0, 0, 'known-two-tabs-request-left-waiting.png')
)
foreach ($r in $list) {
  $p = Join-Path $Src $r[0]
  if (-not (Test-Path $p)) { "MISSING $($r[0])"; continue }
  $img = [System.Drawing.Image]::FromFile($p)
  $w = if ($r[3] -gt 0) { [Math]::Min($r[3], $img.Width - $r[1]) } else { $img.Width }
  $h = if ($r[4] -gt 0) { [Math]::Min($r[4], $img.Height - $r[2]) } else { $img.Height }
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.DrawImage($img, (New-Object System.Drawing.Rectangle 0, 0, $w, $h), (New-Object System.Drawing.Rectangle $r[1], $r[2], $w, $h), [System.Drawing.GraphicsUnit]::Pixel)
  $bmp.Save((Join-Path $Dst $r[5]), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()
  "ok $($r[5]) ${w}x${h}"
}
