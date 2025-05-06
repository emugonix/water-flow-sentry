#!/bin/bash

# Script to export the Water Leakage Detection System project
# for deployment or backup purposes

# Set variables
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
EXPORT_DIR="./exports"
PROJECT_NAME="water-leak-detection-system"
EXPORT_FILENAME="${PROJECT_NAME}_${TIMESTAMP}.zip"

# Create export directory if it doesn't exist
mkdir -p "$EXPORT_DIR"

# Create a temporary directory for the export
TMP_DIR=$(mktemp -d)

# Copy necessary files to the temporary directory
echo "Copying project files..."
cp -r client db server shared README.md SETUP_GUIDE.md docs package.json tsconfig.json vite.config.ts drizzle.config.ts "$TMP_DIR"

# Create .env.example file
echo "Creating .env.example file..."
cat > "$TMP_DIR/.env.example" << EOF
# Database configuration
DATABASE_URL=postgresql://username:password@localhost:5432/water_leak_db

# Session secret (replace with a strong random string)
SESSION_SECRET=your_session_secret_here
EOF

# Create the zip file
echo "Creating export archive..."
cd "$TMP_DIR" && zip -r "../$EXPORT_DIR/$EXPORT_FILENAME" . > /dev/null

# Clean up
rm -rf "$TMP_DIR"

echo "Export completed: $EXPORT_DIR/$EXPORT_FILENAME"
echo "Project size: $(du -h "$EXPORT_DIR/$EXPORT_FILENAME" | cut -f1)"
