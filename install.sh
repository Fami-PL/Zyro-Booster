#!/bin/bash
set -e

echo "======================================"
echo "   Zyro-Booster Installation Script   "
echo "======================================"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v18+) first."
    exit 1
fi
echo "✅ Node.js detected: $(node -v)"

# Check for NPM
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi
echo "✅ npm detected: $(npm -v)"

# Check for libsecret (Linux only)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🔍 Checking system dependencies..."
    if dpkg -s libsecret-1-dev &> /dev/null; then
        echo "✅ libsecret-1-dev is already installed."
    else
        echo "⚠️  libsecret-1-dev is missing (required for secure password storage)."
        read -p "Do you want to install it with sudo? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo apt-get update && sudo apt-get install -y libsecret-1-dev
        else
            echo "Skipping libsecret installation. Warning: 'keytar' might fail to build."
        fi
    fi
fi

echo "📦 Installing Node.js dependencies..."
npm install

echo "🔨 Building project..."
npm run build

echo "======================================"
echo "✅ Installation Complete!"
echo "➡️  Run ./run.sh to start the booster."
echo "======================================"
