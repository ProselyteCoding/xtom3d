@echo off
REM GitHub Pages 部署脚本 (Windows)

echo 🚀 开始构建项目...
call npm run build

if %errorlevel% equ 0 (
    echo ✅ 构建成功！
    echo 📦 静态文件已生成在 out\ 文件夹
    echo.
    echo 📝 下一步：
    echo 1. 提交代码到 GitHub:
    echo    git add .
    echo    git commit -m "Build for deployment"
    echo    git push origin main
    echo.
    echo 2. 或手动部署 out 文件夹:
    echo    cd out
    echo    git init
    echo    git add -A
    echo    git commit -m "deploy"
    echo    git push -f https://github.com/Weixhne/xtom3d.git main:gh-pages
    echo.
    echo 🌐 部署后访问: https://weixhne.github.io/xtom3d/
) else (
    echo ❌ 构建失败，请检查错误信息
    exit /b 1
)
