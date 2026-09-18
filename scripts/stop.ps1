# ==============================================================================
# SCRIPT DỪNG MISA SME PORTAL (WINDOWS)
# ==============================================================================

Write-Host "Đang tìm và dừng tiến trình MISA SME Portal (Port 3000)..." -ForegroundColor Cyan

try {
    # Tìm tiến trình đang lắng nghe trên cổng 3000
    $netstat = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($netstat) {
        $pids = $netstat | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pidToKill in $pids) {
            Write-Host "Dừng tiến trình PID: $pidToKill" -ForegroundColor Yellow
            Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
        }
        Write-Host "✓ Đã dừng MISA SME Portal thành công." -ForegroundColor Green
    } else {
        Write-Host "Không có tiến trình nào đang chiếm cổng 3000." -ForegroundColor Yellow
    }

    # Kiểm tra service nếu cài qua NSSM
    $service = Get-Service -Name "MisaPortalService" -ErrorAction SilentlyContinue
    if ($service -and $service.Status -eq 'Running') {
        Stop-Service -Name "MisaPortalService"
        Write-Host "✓ Đã dừng Windows Service MisaPortalService." -ForegroundColor Green
    }
} catch {
    Write-Host "Lỗi khi dừng tiến trình: $_" -ForegroundColor Red
}
