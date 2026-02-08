#!/bin/bash
set -e

echo "=========================================="
echo "   Zyro-Booster Installer (Arch Linux)    "
echo "=========================================="

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Installing..."
    sudo pacman -Sy --noconfirm nodejs npm
fi
echo "✅ Node.js detected: $(node -v)"

# Install System Dependencies
echo "🔍 Checking system dependencies..."
sudo pacman -Sy --noconfirm libsecret base-devel

echo "📦 Installing Node.js dependencies..."
npm install

echo "🔨 Building project..."
npm run build

echo "======================================"
echo "✅ Installation Complete!"
echo "➡️  Run ./run.sh to start the booster."
echo "======================================"
