#!/bin/bash
# Build Focus Flight Ops dev APK using Docker
# Output: ./apk-output/focus-flight-ops-dev.apk

set -e

echo "Building Android APK with Docker..."
echo "This will take 5-10 minutes the first time (downloading SDK + dependencies)."
echo "Subsequent builds will be much faster due to Docker layer caching."
echo ""

# Build the Docker image
docker build -f Dockerfile.android -t ffo-android-builder .

# Create output directory
mkdir -p apk-output

# Run the container and copy the APK
docker run --rm -v "$(pwd)/apk-output:/output" ffo-android-builder

echo ""
echo "Done! APK is at: ./apk-output/focus-flight-ops-dev.apk"
echo "Install on your phone: adb install ./apk-output/focus-flight-ops-dev.apk"
