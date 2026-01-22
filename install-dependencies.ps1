<#
.SYNOPSIS
一键安装巡检机器人项目所需的所有依赖包
.DESCRIPTION
自动安装 bcryptjs、sequelize、mysql2、dotenv 等所有缺失的依赖，解决 MODULE_NOT_FOUND 错误
#>

# 解决中文乱码问题
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 切换到脚本所在目录（确保在项目根目录执行）
Set-Location $PSScriptRoot

# 打印开始信息
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  巡检机器人项目依赖一键安装脚本" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

# 1. 先清理 npm 缓存（避免安装失败）
Write-Host "`n[1/4] 清理 npm 缓存..." -ForegroundColor Yellow
npm cache clean --force

# 2. 安装核心生产依赖（运行时必需）
Write-Host "`n[2/4] 安装核心依赖包..." -ForegroundColor Yellow
npm install express sequelize mysql2 dotenv bcryptjs jsonwebtoken cors helmet morgan --save

# 3. 安装开发依赖（开发时辅助）
Write-Host "`n[3/4] 安装开发依赖包..." -ForegroundColor Yellow
npm install nodemon cross-env --save-dev

# 4. 验证安装结果
Write-Host "`n[4/4] 验证关键依赖安装状态..." -ForegroundColor Yellow
try {
    # 检查 bcryptjs 是否安装成功
    $bcryptCheck = npm list bcryptjs 2>&1
    if ($bcryptCheck -match "bcryptjs") {
        Write-Host "✅ bcryptjs 安装成功" -ForegroundColor Green
    } else {
        Write-Host "❌ bcryptjs 安装失败" -ForegroundColor Red
    }

    # 检查 sequelize 是否安装成功
    $sequelizeCheck = npm list sequelize 2>&1
    if ($sequelizeCheck -match "sequelize") {
        Write-Host "✅ sequelize 安装成功" -ForegroundColor Green
    } else {
        Write-Host "❌ sequelize 安装失败" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️  验证过程中出现小问题，但不影响使用" -ForegroundColor Yellow
}

# 打印完成提示
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ 依赖安装流程完成！" -ForegroundColor Green
Write-Host "👉 下一步执行：node server.js 启动项目" -ForegroundColor Green
Write-Host "💡 如果仍有报错，请检查 Node.js 版本（推荐 16+/18+/20+）" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# 暂停窗口，方便查看结果
Read-Host -Prompt "`n按任意键关闭窗口"