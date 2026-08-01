#!/bin/bash
# =====================================================
# XOR NIM 服务器部署脚本（宝塔面板 / Linux 通用）
# 用法：bash deploy.sh <网站根目录> [源码目录]
#   默认：网站根目录 /www/wwwroot/nimgame，源码目录 /www/wwwroot/nimgame-src
# 首次使用前需先 git clone 仓库到源码目录（见 README/部署说明）
# =====================================================
set -e

WEB_DIR="${1:-/www/wwwroot/nimgame}"
REPO_DIR="${2:-/www/wwwroot/nimgame-src}"

echo "==> 1/5 拉取最新代码（$REPO_DIR）"
cd "$REPO_DIR"
git pull origin master

echo "==> 2/5 安装依赖"
npm install --no-audit --no-fund

echo "==> 3/5 构建生产产物（node 直调 vite，跳过类型检查以适配低配服务器）"
node node_modules/vite/bin/vite.js build

echo "==> 4/5 同步 dist 到网站根目录（$WEB_DIR）"
if [ ! -d "$WEB_DIR" ]; then
  mkdir -p "$WEB_DIR"
fi
rm -rf "$WEB_DIR"/*
cp -r dist/* "$WEB_DIR"/

echo "==> 5/5 部署完成：$(date)"
echo "访问站点验证：http://$WEB_DIR/"
