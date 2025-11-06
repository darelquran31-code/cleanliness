@echo off
echo ===========================================
echo    تشغيل سيرفر موقع استلام مواد النظافة
echo ===========================================
echo.
echo سيتم تشغيل السيرفر الخلفي (Backend) والأمامي (Frontend)
echo.
echo 1. السيرفر الخلفي: http://localhost:5000
echo 2. الواجهة الأمامية: http://localhost:3000
echo.
echo لإيقاف السيرفرات اضغط Ctrl+C
echo.
pause

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm start"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ✅ تم تشغيل السيرفرات بنجاح!
echo.
echo يمكنك الآن فتح المتصفح والذهاب إلى: http://localhost:3000
echo.
pause