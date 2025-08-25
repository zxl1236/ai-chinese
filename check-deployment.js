#!/usr/bin/env node

/**
 * AI语文学习助手 - 部署检查脚本
 * 检查项目是否准备好部署
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 AI语文学习助手 - 部署检查');
console.log('================================');

let allChecksPassed = true;

// 检查必要的文件
const requiredFiles = [
  'frontend/package.json',
  'frontend/vercel.json',
  'backend/app.py',
  'backend/requirements.txt',
  'backend/Procfile',
  'backend/runtime.txt',
  'DEPLOYMENT_GUIDE.md'
];

console.log('\n📁 检查必要文件...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 缺失`);
    allChecksPassed = false;
  }
});

// 检查前端配置
console.log('\n🌐 检查前端配置...');
try {
  const packageJson = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.build) {
    console.log('✅ package.json 包含 build 脚本');
  } else {
    console.log('❌ package.json 缺少 build 脚本');
    allChecksPassed = false;
  }
  
  if (packageJson.proxy) {
    console.log('✅ 已配置开发环境代理');
  } else {
    console.log('⚠️  未配置开发环境代理');
  }
} catch (error) {
  console.log('❌ package.json 格式错误');
  allChecksPassed = false;
}

// 检查后端配置
console.log('\n🐍 检查后端配置...');
try {
  const requirements = fs.readFileSync('backend/requirements.txt', 'utf8');
  
  if (requirements.includes('gunicorn')) {
    console.log('✅ 包含 gunicorn (生产服务器)');
  } else {
    console.log('❌ 缺少 gunicorn');
    allChecksPassed = false;
  }
  
  if (requirements.includes('psycopg2')) {
    console.log('✅ 包含 PostgreSQL 支持');
  } else {
    console.log('❌ 缺少 PostgreSQL 支持');
    allChecksPassed = false;
  }
  
  if (requirements.includes('python-dotenv')) {
    console.log('✅ 包含环境变量支持');
  } else {
    console.log('❌ 缺少环境变量支持');
    allChecksPassed = false;
  }
} catch (error) {
  console.log('❌ requirements.txt 读取失败');
  allChecksPassed = false;
}

// 检查环境变量配置
console.log('\n🔧 检查环境变量配置...');
const backendApp = fs.readFileSync('backend/app.py', 'utf8');
if (backendApp.includes('load_dotenv()')) {
  console.log('✅ 已配置环境变量加载');
} else {
  console.log('❌ 未配置环境变量加载');
  allChecksPassed = false;
}

if (backendApp.includes('DATABASE_URL')) {
  console.log('✅ 已配置数据库URL环境变量');
} else {
  console.log('❌ 未配置数据库URL环境变量');
  allChecksPassed = false;
}

// 检查Git状态
console.log('\n📦 检查Git状态...');
const { execSync } = require('child_process');

try {
  // 检查是否在Git仓库中
  execSync('git status', { stdio: 'pipe' });
  console.log('✅ 在Git仓库中');
  
  // 检查是否有未提交的更改
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  if (status.trim() === '') {
    console.log('✅ 所有更改已提交');
  } else {
    console.log('⚠️  有未提交的更改');
    console.log('建议在部署前提交所有更改');
  }
  
  // 检查远程仓库
  try {
    const remote = execSync('git remote get-url origin', { encoding: 'utf8' });
    console.log('✅ 已配置远程仓库');
  } catch (error) {
    console.log('⚠️  未配置远程仓库');
    console.log('建议添加GitHub远程仓库');
  }
} catch (error) {
  console.log('❌ 不在Git仓库中');
  allChecksPassed = false;
}

// 总结
console.log('\n📊 检查总结');
console.log('================================');
if (allChecksPassed) {
  console.log('🎉 所有检查通过！项目已准备好部署');
  console.log('\n🚀 下一步：');
  console.log('1. 运行 deploy.bat 或 deploy.sh');
  console.log('2. 按照 DEPLOYMENT_GUIDE.md 进行部署');
} else {
  console.log('⚠️  发现一些问题，请修复后再部署');
  console.log('\n🔧 修复建议：');
  console.log('1. 检查缺失的文件');
  console.log('2. 更新配置文件');
  console.log('3. 提交所有更改');
}

console.log('\n📚 更多信息：');
console.log('- 部署指南: DEPLOYMENT_GUIDE.md');
console.log('- 项目文档: README.md');
console.log('- 问题反馈: 创建GitHub Issue');
