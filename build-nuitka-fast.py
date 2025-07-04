#!/usr/bin/env python3
"""
Fast Nuitka build script for Anitrack TUI application.
Optimized for fastest startup and smallest size.
"""
import subprocess
import sys

def build_app():
    """Build the Anitrack application using Nuitka with maximum optimization."""
    
    # Nuitka arguments optimized for speed and size
    args = [
        'nuitka',
        '--standalone',                       # Standalone mode (faster than --onefile)
        '--output-filename=anitrack',
        '--output-dir=dist',
        '--include-data-file=styles.tcss=styles.tcss',
        '--assume-yes-for-downloads',
        '--remove-output',                    # Clean previous builds
        'main.py'
    ]
    
    try:
        result = subprocess.run(args, check=True)
        print("Build successful!")
        print("Executable created: ./dist/anitrack.dist/anitrack")
        
    except subprocess.CalledProcessError as e:
        print(f"Build failed with return code {e.returncode}")
        sys.exit(1)
    except FileNotFoundError:
        print("Error: Nuitka not found. Install with: pip install nuitka")
        sys.exit(1)

if __name__ == '__main__':
    build_app()
