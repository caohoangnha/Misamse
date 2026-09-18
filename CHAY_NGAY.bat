@echo off
chcp 65001 >nul
title MISA SME Portal - Khoi Dong Tu Dong
color 0A

echo ========================================================
echo         MISA SME PORTAL - KHOI DONG TU DONG
echo ========================================================
echo.

:: 1. Kiem tra Node.js da cai tren may chua
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [LOI] May tinh cua ban CHUA CAI DAT Node.js!
    echo.
    echo Huong dan khac phuc nhanh trong 1 phut:
    echo 1. Truy cap: https://nodejs.org
    echo 2. Tai ban "LTS" (Phien ban khuyen dung)
    echo 3. Cai dat xong thi dong cua so nay va chay lai file CHAY_NGAY.bat.
    echo.
    pause
    exit /b 1
)

echo [OK] Da tim thay Node.js:
node -v
echo.

:: 2. Tao file .env neu chua co
if not exist ".env" (
    echo [1/3] Dang khoi tao file cau hinh .env tu .env.example...
    copy ".env.example" ".env" >nul
    echo [OK] Da tao file .env thanh cong!
) else (
    echo [1/3] File .env da san sang.
)

:: 3. Kiem tra va cai dat thu vien neu chua co node_modules
if not exist "node_modules" (
    echo.
    echo [2/3] Dang cai dat thu vien (Chi can chay lan dau, xin cho 1-2 phut)...
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo [LOI] Cai dat thu vien that bai!
        echo Vui long kiem tra ket noi Internet hoac chay lenh: npm install --legacy-peer-deps
        pause
        exit /b 1
    )
    echo [OK] Cai dat thu vien hoan tat!
) else (
    echo [2/3] Thu vien node_modules da san sang.
)

:: 4. Mo trinh duyet va khoi dong may chu
echo.
echo [3/3] Dang khoi dong MISA SME Portal tai http://localhost:3000 ...
echo.
echo --------------------------------------------------------
echo  - Dia chi dang nhap: http://localhost:3000
echo  - Tai khoan admin:  admin  /  Mat khau: Admin@123456
echo  - Nhan Ctrl + C de dung may chu khi khong su dung
echo --------------------------------------------------------
echo.

:: Mo trinh duyet sau 2 giay
start "" "http://localhost:3000"

:: Chay may chu
call npm run dev

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [CANH BAO] May chu da dung lai hoac gap su co.
    echo Vui long chup anh man hinh loi tren de duoc tro giup.
    pause
)
