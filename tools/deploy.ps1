# Build .dist with cache-busted asset URLs and deploy to Cloudflare Pages.
# Usage (from anywhere):  pwsh -NoProfile -File "F:\By myself Website\tools\deploy.ps1"
$ErrorActionPreference = "Stop"
$site = Split-Path -Parent $PSScriptRoot
$dist = Join-Path $site ".dist"

Remove-Item $dist -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory $dist | Out-Null
Copy-Item (Join-Path $site "styles.css"), (Join-Path $site "script.js") $dist
foreach ($d in "assets", "download", "fonts", "vendor") { Copy-Item (Join-Path $site $d) $dist -Recurse }

# Cloudflare tells browsers to cache CSS/JS for 4 hours, so every changed file
# gets a new URL (?v=<content hash>) and browsers fetch it right away.
$html = Get-Content (Join-Path $site "index.html") -Raw -Encoding utf8
foreach ($f in "styles.css", "script.js", "fonts/serif-sc.woff2") {
  $hash = (Get-FileHash (Join-Path $site $f) -Algorithm SHA256).Hash.Substring(0, 10).ToLower()
  $pattern = [regex]::Escape($f) + '(\?v=[0-9a-f]+)?'
  $html = [regex]::Replace($html, $pattern, "${f}?v=$hash")
  # the font is also referenced from styles.css
  if ($f -like "fonts/*") {
    $cssPath = Join-Path $dist "styles.css"
    $css = Get-Content $cssPath -Raw -Encoding utf8
    $css = [regex]::Replace($css, $pattern, "${f}?v=$hash")
    [IO.File]::WriteAllText($cssPath, $css, [Text.UTF8Encoding]::new($false))
  }
}
# styles.css changed above, so hash it again from the built copy
$cssHash = (Get-FileHash (Join-Path $dist "styles.css") -Algorithm SHA256).Hash.Substring(0, 10).ToLower()
$html = [regex]::Replace($html, 'styles\.css\?v=[0-9a-f]+', "styles.css?v=$cssHash")
[IO.File]::WriteAllText((Join-Path $dist "index.html"), $html, [Text.UTF8Encoding]::new($false))

# HTML must always be revalidated; versioned assets can be cached for a long time.
@"
/
  Cache-Control: no-cache
/index.html
  Cache-Control: no-cache
/styles.css
  Cache-Control: public, max-age=31536000, immutable
/script.js
  Cache-Control: public, max-age=31536000, immutable
/fonts/*
  Cache-Control: public, max-age=31536000, immutable
/vendor/*
  Cache-Control: public, max-age=31536000, immutable
"@ | Set-Content (Join-Path $dist "_headers") -Encoding utf8

Select-String -Path (Join-Path $dist "index.html") -Pattern '\?v=' | ForEach-Object { $_.Line.Trim() }
Push-Location $dist
try { npx --yes wrangler@4 pages deploy . --project-name=bymyself --branch=main --commit-dirty=true }
finally { Pop-Location }
