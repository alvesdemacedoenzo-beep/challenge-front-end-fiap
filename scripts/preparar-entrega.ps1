param()

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$outputDirectory = Join-Path $projectRoot 'output'
$zipPath = Join-Path $outputDirectory 'Soul-Up-Entrega-4.zip'
$stagingDirectory = Join-Path ([IO.Path]::GetTempPath()) ('soulup-entrega-' + [guid]::NewGuid().ToString('N'))
$requiredFiles = @(
    'package.json', 'package-lock.json', 'README.md', 'index.html',
    'vite.config.ts', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json',
    'vercel.json', '.env.example', 'src/main.tsx', 'src/index.css',
    'api/acesso-funcionario.js', 'server/employee-access.mjs',
    'api/auth.js', 'server/auth.mjs', 'server/python-session.mjs'
)

Push-Location $projectRoot
try {
    # Git seleciona fontes e arquivos novos, respeitando os arquivos ignorados.
    $files = @(git -c core.quotepath=false ls-files --cached --others --exclude-standard)
    if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel ler os arquivos do projeto pelo Git.' }
    $files = @($files | Where-Object {
        $_ -notmatch '(^|/)(node_modules|dist|output|\.git|\.vercel|\.vite)(/|$)' -and
        $_ -notmatch '(^|/)\.env(\.|$)' -and
        $_ -notmatch '\.(zip|tsbuildinfo|log|pem|key)$'
    }) + '.env.example'
    $files = @($files | Sort-Object -Unique)
    foreach ($required in $requiredFiles) {
        if ($files -notcontains $required -or !(Test-Path -LiteralPath (Join-Path $projectRoot $required) -PathType Leaf)) {
            throw "Arquivo essencial ausente: $required"
        }
    }
    if (!($files | Where-Object { $_ -like 'public/*' })) { throw 'Pasta public ausente.' }

    New-Item -ItemType Directory -Path $stagingDirectory -Force | Out-Null
    foreach ($relativePath in $files) {
        $source = [IO.Path]::GetFullPath((Join-Path $projectRoot $relativePath))
        if (!$source.StartsWith($projectRoot + [IO.Path]::DirectorySeparatorChar)) { throw 'Caminho fora do projeto.' }
        if (!(Test-Path -LiteralPath $source -PathType Leaf)) { throw "Arquivo ausente: $relativePath" }
        if ((Get-Item -LiteralPath $source).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Links nao sao aceitos no pacote.' }
        $destination = Join-Path $stagingDirectory $relativePath
        New-Item -ItemType Directory -Path (Split-Path $destination -Parent) -Force | Out-Null
        Copy-Item -LiteralPath $source -Destination $destination
    }
    git log HEAD --date=short '--format=%h | %ad | %an | %s' |
        Set-Content -Encoding UTF8 -LiteralPath (Join-Path $stagingDirectory 'GIT_HISTORICO.txt')
    if ($LASTEXITCODE -ne 0) { throw 'Historico Git indisponivel.' }
    New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
    if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath }
    [IO.Compression.ZipFile]::CreateFromDirectory($stagingDirectory, $zipPath, [IO.Compression.CompressionLevel]::Optimal, $false)
    $archive = [IO.Compression.ZipFile]::OpenRead($zipPath)
    try {
        $entries = @($archive.Entries | ForEach-Object { $_.FullName.Replace('\', '/') })
        foreach ($required in $requiredFiles) {
            if ($entries -notcontains $required) { throw "ZIP sem arquivo essencial: $required" }
        }
        if ($entries.Count -lt $files.Count) { throw 'ZIP incompleto.' }
        if ($entries | Where-Object { $_ -match '(^|/)(node_modules|\.git|\.vercel)(/|$)|(^|/)\.env\.(local|production|development)' }) {
            throw 'ZIP contem arquivos proibidos ou credenciais.'
        }
    } finally { $archive.Dispose() }
    $size = (Get-Item -LiteralPath $zipPath).Length
    if ($size -gt 50000000) { throw 'ZIP ultrapassa 50 MB.' }
    Get-FileHash -LiteralPath $zipPath -Algorithm SHA256 | Format-List
    Write-Output ('ZIP conferido: {0} arquivos, {1:N2} MB.' -f $entries.Count, ($size / 1000000))
    Write-Output 'Confira o video no README e a API Java antes de entregar pelo Portal do Aluno.'
} finally {
    Pop-Location
}
