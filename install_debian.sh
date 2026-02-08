#!/bin/bash
set -e

echo "=========================================="
echo "   Zyro-Booster Installer (Debian/Ubuntu) "
echo "=========================================="

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
echo "✅ Node.js detected: $(node -v)"

# Install System Dependencies
echo "🔍 Checking system dependencies..."
sudo apt-get update
sudo apt-get install -y libsecret-1-dev build-essential

echo "📦 Installing Node.js dependencies..."
npm install

echo "🔨 Building project..."
npm run build

echo "======================================"
echo "✅ Installation Complete!"
echo "➡️  Run ./run.sh to start the booster."
echo "======================================"
