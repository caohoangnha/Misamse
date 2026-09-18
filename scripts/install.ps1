# ==============================================================================
# SCRIPT CÀI ĐẶT MISA SME PORTAL TRÊN WINDOWS SERVER
# Chạy với quyền Administrator: powershell -ExecutionPolicy Bypass -File install.ps1
# ==============================================================================

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   BẮT ĐẦU CÀI ĐẶT HỆ THỐNG MISA SME PORTAL (WINDOWS)    " -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Cyan

# 1. Kiểm tra Node.js
Write-Host "[1/5] Kiểm tra môi trường Node.js..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "LỖI: Chưa cài đặt Node.js trên máy chủ!" -ForegroundColor Red
    Write-Host "Vui lòng tải và cài đặt Node.js LTS 64-bit từ https://nodejs.org sau đó chạy lại script này." -ForegroundColor White
    Exit 1
}
$nodeVer = node -v
Write-Host "  -> Node.js phiên bản: $nodeVer (OK)" -ForegroundColor Green

# 2. Tạo file .env từ .env.example nếu chưa có
Write-Host "[2/5] Kiểm tra file cấu hình môi trường (.env)..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        # Tạo ngẫu nhiên một JWT secret mạnh
        $randomSecret = [System.Guid]::NewGuid().ToString("N") + [System.Guid]::NewGuid().ToString("N")
        (Get-Content ".env") -replace "your_super_secret_jwt_key_here_change_in_production_32chars_min", $randomSecret | Set-Content ".env"
        Write-Host "  -> Đã tạo mới file .env với JWT Secret ngẫu nhiên an toàn." -ForegroundColor Green
    }
} else {
    Write-Host "  -> File .env đã tồn tại sẵn." -ForegroundColor Green
}

# 3. Cài đặt thư viện dependencies
Write-Host "[3/5] Đang cài đặt các thư viện npm..." -ForegroundColor Yellow
npm install --silent
if ($LASTEXITCODE -ne 0) {
    Write-Host "LỖI khi chạy npm install!" -ForegroundColor Red
    Exit 1
}
Write-Host "  -> Đã cài đặt xong dependencies." -ForegroundColor Green

# 4. Biên dịch Frontend & Backend
Write-Host "[4/5] Đang biên dịch ứng dụng (Production Build)..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "LỖI khi biên dịch ứng dụng!" -ForegroundColor Red
    Exit 1
}
Write-Host "  -> Biên dịch thành công vào thư mục dist/." -ForegroundColor Green

# 5. Cấu hình Windows Firewall cho cổng 3000
Write-Host "[5/5] Cấu hình Windows Firewall cho cổng 3000..." -ForegroundColor Yellow
try {
    $existingRule = Get-NetFirewallRule -DisplayName "MISA SME Portal Web (Port 3000)" -ErrorAction SilentlyContinue
    if (-not $existingRule) {
        New-NetFirewallRule -DisplayName "MISA SME Portal Web (Port 3000)" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow | Out-Null
        Write-Host "  -> Đã mở cổng 3000 trên Windows Firewall." -ForegroundColor Green
    } else {
        Write-Host "  -> Quy tắc tường lửa cho cổng 3000 đã tồn tại." -ForegroundColor Green
    }
} catch {
    Write-Host "  (Ghi chú: Cần quyền Admin để thiết lập Firewall tự động)" -ForegroundColor Gray
}

Write-Host "`n=========================================================" -ForegroundColor Cyan
Write-Host "   CÀI ĐẶT HOÀN TẤT THÀNH CÔNG!                           " -ForegroundColor Green
Write-Host "   Khởi động hệ thống bằng lệnh:                         " -ForegroundColor White
Write-Host "   .\scripts\start.ps1                                   " -ForegroundColor Yellow
Write-Host "   Hoặc truy cập: http://localhost:3000                  " -ForegroundColor White
Write-Host "=========================================================" -ForegroundColor Cyan
