#!/bin/bash

# Ensure dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "First run detected. Installing dependencies..."
    npm install
fi

# Start the application
echo "Starting Zyro-Booster..."
npm start
