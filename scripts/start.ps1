# ==============================================================================
# SCRIPT KHỞI ĐỘNG MISA SME PORTAL (WINDOWS)
# ==============================================================================

Write-Host "Đang khởi động MISA SME Portal..." -ForegroundColor Cyan

# Kiểm tra nếu thư mục dist chưa tồn tại thì build trước
if (-not (Test-Path "dist\server.cjs")) {
    Write-Host "Chưa tìm thấy bản build. Đang tự động biên dịch..." -ForegroundColor Yellow
    npm run build
}

Write-Host "Website đang chạy tại cổng 3000..." -ForegroundColor Green
Write-Host "Mở trình duyệt truy cập: http://localhost:3000" -ForegroundColor White
Write-Host "Nhấn Ctrl + C để dừng hệ thống bất kỳ lúc nào." -ForegroundColor Gray

$env:NODE_ENV = "production"
node dist\server.cjs
