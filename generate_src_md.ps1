# Script para generar markdown de src/ para Sprint 3
$commits = @("4d8ba67", "ed0ea71", "f66f4b0", "b03211b", "3098f5c", "064281f", "23802bc", "b6e35be", "f6abc6d")
$outPath = "docs/src-contenido-Sprint3-4d8ba67-a-b6e35be.md"

# Header
$md = @()
$md += "# Archivos de src - Sprint 3 (4d8ba67 a f6abc6d)"
$md += ""
$md += "## Commits incluidos:"
foreach ($c in $commits) {
    $msg = git log -1 --format=%s $c
    $md += "- **$c** - $msg"
}

$md += ""
$md += "Total commits: $($commits.Count)"
$md += ""
$md += "---"
$md += ""

# Obtener archivos únicos de src/
$allFiles = @()
foreach ($c in $commits) {
    $files = git ls-tree -r --name-only $c 2>$null | Where-Object { $_ -like 'src/*' }
    $allFiles += $files
}
$uniqueFiles = $allFiles | Select-Object -Unique | Sort-Object

$md += "**Total archivos únicos en src:** $($uniqueFiles.Count)"
$md += ""
$md += "---"
$md += ""

$md += "## Ajustes incorporados en f6abc6d"
$md += ""
$md += "- src/components/animales/AnimalSearchBar.tsx: refinamiento del buscador de arete y limpieza visual del campo."
$md += "- src/features/animals/screens/HistorialClinico.tsx: ajuste del flujo de historial para alinearlo con la nueva navegacion de animales."
$md += "- src/features/costs/screens/GestionGastosScreen.tsx y src/features/costs/screens/RegistrarGastoScreen.tsx: mejoras en gestion y captura de gastos."
$md += "- src/features/health/screens/HealthScreen.tsx: integracion del flujo de eventos sanitarios con recomendaciones nutricionales."
$md += "- src/screens/animales/DetalleAnimalScreen.tsx, src/screens/animales/EditarAnimalScreen.tsx, src/screens/animales/ListadoAnimalesScreen.tsx y src/screens/animales/RegistrarAnimalScreen.tsx: ajustes del ciclo de vida del animal y validaciones asociadas."
$md += "- src/screens/sanitarios/RegistrarEventoSanitario.tsx: refactor principal del sprint, con seleccion multiple de animales, validacion de fechas y sugerencia de proxima fecha."
$md += ""
$md += "---"

# Para cada archivo
foreach ($file in $uniqueFiles) {
    $md += ""
    $md += "## $file"
    $md += ""
    
    # Determinar estado
    $exists_first = git cat-file -e "$($commits[0]):$file" 2>$null; $eFirstOk = $LASTEXITCODE -eq 0
    $exists_last = git cat-file -e "$($commits[-1]):$file" 2>$null; $eLastOk = $LASTEXITCODE -eq 0
    
    if ($eFirstOk -and $eLastOk) {
        $status = "Modificado"
    } elseif ($eFirstOk -and -not $eLastOk) {
        $status = "Eliminado"
    } elseif (-not $eFirstOk -and $eLastOk) {
        $status = "Agregado"
    } else {
        $status = "Unknown"
    }
    
    $md += "**Estado:** $status"
    $md += ""
    
    # Verificar si es binario
    $ext = [System.IO.Path]::GetExtension($file)
    if ($ext -in @(".png", ".jpg", ".jpeg", ".gif", ".bundle", ".keystore")) {
        $md += "*(Archivo binario - no incluido)*"
        $md += ""
    } else {
        # Mostrar contenido del último commit
        if ($eLastOk) {
            $md += "### Contenido en $($commits[-1]):"
            $md += ""
            $md += '```typescript'
            
            $fileContent = git show "$($commits[-1]):$file" 2>$null
            if ($fileContent) {
                $md += $fileContent
            }
            
            $md += '```'
            $md += ""
        }
    }
    
    $md += "---"
}

# Escribir archivo
$md | Out-File -FilePath $outPath -Encoding UTF8
Write-Host "OK: Archivo generado: $outPath"
Write-Host "OK: Total archivos: $($uniqueFiles.Count)"
