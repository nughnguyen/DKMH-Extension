@echo off
chcp 65001 >nul
title GumballZ Auto Updater

echo ========================================
echo   GUMBALLZ EXTENSION - AUTO UPDATER
echo ========================================
echo.
echo Dang tai ban cap nhat (Source code) moi nhat tu Github...
echo Vui long đoi trong giay lat...

:: 1. Download zip from main branch (guarantees latest code synced with release)
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/nughnguyen/DKMH-Extension/archive/refs/heads/main.zip' -OutFile 'update.zip'"
if errorlevel 1 (
  echo [Loi] Khong the tai ban cap nhat! Vui long kiem tra ket noi mang.
  pause
  exit /b
)

:: 2. Extract ZIP
echo.
echo Dang Giai nen du lieu...
if exist temp_update rd /s /q temp_update
powershell -Command "Expand-Archive -Path 'update.zip' -DestinationPath 'temp_update' -Force"

:: 3. Overwrite local files (loop finds the root folder inside the extracted zip)
echo Dang cai dat ban vao he thong...
for /d %%D in (temp_update\*) do (
  xcopy "%%D\*" ".\" /E /H /C /I /Y >nul
)

:: 4. Clean up
echo Don thoat du lieu tam...
rd /s /q temp_update
del update.zip

echo.
echo ========================================
echo THANH CONG! GUMBALLZ DA DUOC NANG CAP.
echo ========================================
echo.
echo VUI LONG LAM THEO SAU:
echo 1. Mo trinh duyet Chrome, truy cap: chrome://extensions/
echo 2. Tim den tien ich GumballZ DKMH - Extension.
echo 3. Bam vao nut Mui ten Tron (Reload) hoac tat/bat lai de xoa cache phien ban cu.
echo ========================================
pause
