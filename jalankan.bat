@echo off
setlocal enabledelayedexpansion
title Kenangan XII RPL 2
cd /d "%~dp0"

echo ============================================
echo   KENANGAN XII RPL 2 - nyalakan website
echo ============================================
echo.

netstat -ano | findstr ":5190" | findstr "LISTENING" >nul
if %errorlevel%==0 (
    echo [OK] Aplikasi sudah jalan di port 5190
) else (
    echo [..] Menjalankan aplikasi di http://localhost:5190
    start "Kenangan - localhost:5190" cmd /k dotnet run --no-build --urls http://0.0.0.0:5190
    timeout /t 15 >nul
)

echo.
echo [..] Menyalakan tunnel publik...
echo     Catat link https://...trycloudflare.com dari jendela yang terbuka
echo     (link baru tiap kali dinyalakan)
echo.
start "Kenangan - TUNNEL (lihat link di sini)" cmd /k ""C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:5190 --no-autoupdate"

echo.
echo [OK] Semua sudah berjalan!
echo     - Website: http://localhost:5190
echo     - Tunnel: lihat di jendela "Kenangan - TUNNEL"
echo.
pause
