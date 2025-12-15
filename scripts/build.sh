#!/bin/bash
# Wrapper script to build CV with proper library paths for WeasyPrint on macOS

# Set library path for Homebrew-installed libraries
if [[ "$OSTYPE" == "darwin"* ]]; then
    # Try Apple Silicon first, then Intel
    if [ -d "/opt/homebrew/lib" ]; then
        export DYLD_FALLBACK_LIBRARY_PATH="/opt/homebrew/lib:$DYLD_FALLBACK_LIBRARY_PATH"
    elif [ -d "/usr/local/lib" ]; then
        export DYLD_FALLBACK_LIBRARY_PATH="/usr/local/lib:$DYLD_FALLBACK_LIBRARY_PATH"
    fi
fi

# Run the build script
uv run python scripts/build.py "$@"
