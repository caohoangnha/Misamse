# ==============================================================================
# SCRIPT SAO LƯU DỰ PHÒNG CẤU HÌNH & NHẬT KÝ MISA SME PORTAL (WINDOWS)
# Lưu ý: Không can thiệp hoặc tác động vào cơ sở dữ liệu MISA SME gốc
# ==============================================================================

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "backups\backup_$timestamp"

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "  SAO LƯU DỰ PHÒNG HỆ THỐNG MISA SME PORTAL              " -ForegroundColor Green
Write-Host "  Thời điểm: $timestamp                                  " -ForegroundColor White
Write-Host "=========================================================" -ForegroundColor Cyan

# Tạo thư mục sao lưu
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# 1. Sao lưu file cấu hình
Write-Host "[1/3] Sao lưu cấu hình (.env, misa.config.json)..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Copy-Item ".env" "$backupDir\.env.bak"
}
if (Test-Path "config\misa.config.json") {
    New-Item -ItemType Directory -Path "$backupDir\config" -Force | Out-Null
    Copy-Item "config\misa.config.json" "$backupDir\config\misa.config.json.bak"
}

# 2. Sao lưu nhật ký kiểm toán (Audit Logs)
Write-Host "[2/3] Sao lưu nhật ký truy cập (Logs)..." -ForegroundColor Yellow
if (Test-Path "logs") {
    Copy-Item -Path "logs" -Destination "$backupDir\logs" -Recurse -Force
}

# 3. Nén file ZIP
Write-Host "[3/3] Đóng gói file nén lưu trữ..." -ForegroundColor Yellow
$zipFile = "backups\misa_portal_backup_$timestamp.zip"
Compress-Archive -Path "$backupDir\*" -DestinationPath $zipFile -Force
Remove-Item -Path $backupDir -Recurse -Force

Write-Host "✓ Sao lưu hoàn tất! File lưu tại: $zipFile" -ForegroundColor Green
