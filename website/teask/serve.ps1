$port = 5180
$root = $PSScriptRoot
$types = @{
  '.html'='text/html; charset=utf-8'; '.js'='text/javascript'; '.css'='text/css'; '.json'='application/json'
  '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.webp'='image/webp'; '.svg'='image/svg+xml'
  '.webm'='video/webm'; '.mp4'='video/mp4'; '.wasm'='application/wasm'; '.ttf'='font/ttf'; '.woff2'='font/woff2'
  '.glb'='model/gltf-binary'; '.stl'='model/stl'; '.fbx'='application/octet-stream'; '.hdr'='application/octet-stream'
}
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Teask homepage running at http://localhost:$port/  (close this window to stop)"
Start-Process "http://localhost:$port/"
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
  $file = Join-Path $root $path
  if (-not $path -or -not (Test-Path $file -PathType Leaf)) { $file = Join-Path $root 'index.html' }
  try {
    $bytes = [IO.File]::ReadAllBytes($file)
    $ext = [IO.Path]::GetExtension($file).ToLower()
    $ctx.Response.ContentType = if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' }
    $ctx.Response.ContentLength64 = $bytes.Length
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  } catch {} finally { $ctx.Response.Close() }
}
