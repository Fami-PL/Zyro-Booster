#!/bin/bash
set -e

echo "=========================================="
echo "   Zyro-Booster Installer (Termux)        "
echo "=========================================="

# Check if running in Termux
if [ -z "$TERMUX_VERSION" ]; then
    echo "⚠️  This script is intended for Termux on Android."
    read -p "Are you sure you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "🔍 Updating packages..."
pkg update -y && pkg upgrade -y

echo "📦 Installing dependencies..."
pkg install -y nodejs git python make clang-binutils build-essential

echo "📦 Installing Node.js packages..."
# We use --no-optional to avoid keytar build issues on Termux
npm install --no-optional

echo "🔨 Building project..."
npm run build

echo "======================================"
echo "✅ Installation Complete!"
echo "➡️  Run ./run.sh to start the booster."
echo "======================================"
