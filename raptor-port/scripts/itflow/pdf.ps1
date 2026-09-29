# The IT flow guide's PDF and slide pictures, made by PowerPoint itself so they match the deck exactly.
#   powershell -File scripts/itflow/pdf.ps1 <deck.pptx> [<pngDir>]
# Writes <deck>.pdf beside the deck; with <pngDir>, also one PNG per slide at 2x (for a look on a phone).
param([Parameter(Mandatory)][string]$Deck, [string]$PngDir)
$Deck = (Resolve-Path $Deck).Path
$pdf = [IO.Path]::ChangeExtension($Deck, '.pdf')
$app = New-Object -ComObject PowerPoint.Application
try {
  $p = $app.Presentations.Open($Deck, $true, $false, $false)   # read-only, no title, no window
  $p.SaveAs($pdf, 32)                                          # 32 = ppSaveAsPDF
  if ($PngDir) {
    New-Item -ItemType Directory -Force $PngDir | Out-Null
    $PngDir = (Resolve-Path $PngDir).Path
    foreach ($s in $p.Slides) { $s.Export((Join-Path $PngDir ("slide-{0:D2}.png" -f $s.SlideIndex)), 'PNG', 2666, 1500) }
  }
  $p.Close()
} finally { $app.Quit() }
Write-Output "wrote $pdf"
