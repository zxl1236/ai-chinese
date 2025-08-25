#!/bin/bash

echo "🚀 AI语文学习助手 - 快速部署脚本"
echo "=================================="

# 检查Git是否安装
if ! command -v git &> /dev/null; then
    echo "❌ Git未安装，请先安装Git"
    exit 1
fi

# 检查是否在Git仓库中
if [ ! -d ".git" ]; then
    echo "❌ 当前目录不是Git仓库"
    echo "请先初始化Git仓库："
    echo "git init"
    echo "git add ."
    echo "git commit -m 'Initial commit'"
    exit 1
fi

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  检测到未提交的更改"
    echo "请先提交更改："
    echo "git add ."
    echo "git commit -m 'Prepare for deployment'"
    exit 1
fi

echo "✅ 代码检查通过"
echo ""

echo "📋 部署前检查清单："
echo "1. ✅ 代码已提交到Git"
echo "2. ⏳ 请确保已注册以下服务："
echo "   - GitHub账号"
echo "   - Vercel账号 (https://vercel.com)"
echo "   - Railway账号 (https://railway.app)"
echo ""

echo "🔗 部署链接："
echo "前端部署: https://vercel.com/new"
echo "后端部署: https://railway.app/new"
echo ""

echo "📖 详细部署步骤请查看: DEPLOYMENT_GUIDE.md"
echo ""

echo "🎯 快速部署步骤："
echo "1. 推送代码到GitHub"
echo "2. 在Vercel导入项目 (选择frontend目录)"
echo "3. 在Railway导入项目 (选择backend目录)"
echo "4. 配置环境变量"
echo "5. 部署完成！"
echo ""

read -p "是否要推送代码到GitHub? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 推送代码到GitHub..."
    
    # 检查远程仓库
    if ! git remote get-url origin &> /dev/null; then
        echo "请先添加GitHub远程仓库："
        echo "git remote add origin https://github.com/yourusername/your-repo.git"
        exit 1
    fi
    
    git push origin main
    echo "✅ 代码已推送到GitHub"
    echo ""
    echo "🎉 现在可以开始部署了！"
    echo "1. 访问 https://vercel.com/new 部署前端"
    echo "2. 访问 https://railway.app/new 部署后端"
else
    echo "⏸️  跳过GitHub推送"
fi

echo ""
echo "📚 更多帮助："
echo "- 部署指南: DEPLOYMENT_GUIDE.md"
echo "- 项目文档: README.md"
echo "- 问题反馈: 创建GitHub Issue"
