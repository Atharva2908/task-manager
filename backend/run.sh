#!/bin/bash

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Run MongoDB (requires MongoDB to be installed locally)
echo "Starting MongoDB..."
# Uncomment if you have MongoDB installed locally
# mongod --dbpath ./data &

# Run FastAPI server
echo "Starting FastAPI server..."
python main.py
