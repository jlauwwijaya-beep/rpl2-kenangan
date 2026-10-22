@echo off
setlocal enabledelayedexpansion
title Kenangan XII RPL 2
cd /d "%~dp0"

echo ============================================
echo   KENANGAN XII RPL 2 - nyalakan website
echo ============================================
echo.

REM Check if app already running
netstat -ano | findstr ":5190" | findstr "LISTENING" >nul
if %errorlevel%==0 (
    echo [OK] Aplikasi sudah jalan di port 5190
) else (
    echo [..] Menjalankan aplikasi...
    start "Kenangan - App (localhost:5190)" cmd /k dotnet run --no-build --urls http://0.0.0.0:5190
    timeout /t 12 >nul
)

echo.
echo [..] Menyalakan tunnel publik...
echo     Tunnel akan menampilkan link publik di jendela baru
echo.

start "Kenangan - Tunnel PUBLIC LINK" cmd /k ""C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:5190 --no-autoupdate"

timeout /t 3 >nul

echo.
echo ========================================
echo  SETUP SELESAI
echo ========================================
echo.
echo Aplikasi berjalan di:
echo   - Lokal: http://localhost:5190
echo   - Publik: LIHAT JENDELA "Tunnel PUBLIC LINK"
echo            (cari link https://xxx.trycloudflare.com)
echo.
echo Tips:
echo   - Link berbeda setiap kali dijalankan
echo   - Share link ke teman untuk akses publik
echo   - Tekan Ctrl+C di masing-masing jendela untuk stop
echo.
