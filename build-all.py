#!/usr/bin/env python3
"""
Cross-platform build script using Docker containers.
Builds for Linux, Windows, and macOS.
"""
import subprocess
import sys
import os

def build_linux():
    """Build for Linux using Docker."""
    print("Building for Linux using Docker...")
    
    dockerfile = """
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy files
COPY . .

# Install Python dependencies
RUN pip install -r requirements.txt nuitka

# Build executable
RUN nuitka \\
    --standalone \\
    --output-filename=anitrack \\
    --output-dir=dist \\
    --include-data-file=styles.tcss=styles.tcss \\
    --assume-yes-for-downloads \\
    --remove-output \\
    main.py

# Copy built files to output
CMD ["cp", "-r", "dist/", "/output/"]
"""
    
    with open("Dockerfile.linux", "w") as f:
        f.write(dockerfile)
    
    try:
        # Build Docker image
        subprocess.run(["docker", "build", "-f", "Dockerfile.linux", "-t", "anitrack-linux", "."], check=True)
        
        # Create output directory
        os.makedirs("dist-linux", exist_ok=True)
        
        # Run container and copy files
        subprocess.run([
            "docker", "run", "--rm", 
            "-v", f"{os.getcwd()}/dist-linux:/output",
            "anitrack-linux"
        ], check=True)
        
        print("✅ Linux build complete: ./dist-linux/")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Linux build failed: {e}")
    finally:
        # Cleanup
        if os.path.exists("Dockerfile.linux"):
            os.remove("Dockerfile.linux")

def build_windows():
    """Build for Windows using Docker with Wine."""
    print("Building for Windows using Docker + Wine...")
    
    dockerfile = """
FROM python:3.11-slim

WORKDIR /app

# Install Wine and dependencies
RUN apt-get update && apt-get install -y \
    wine \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy files
COPY . .

# Install Python dependencies
RUN pip install -r requirements.txt nuitka

# Build executable
RUN nuitka \\
    --standalone \\
    --output-filename=anitrack.exe \\
    --output-dir=dist \\
    --include-data-file=styles.tcss=styles.tcss \\
    --assume-yes-for-downloads \\
    --remove-output \\
    main.py

CMD ["cp", "-r", "dist/", "/output/"]
"""
    
    with open("Dockerfile.windows", "w") as f:
        f.write(dockerfile)
    
    try:
        # Build Docker image
        subprocess.run(["docker", "build", "-f", "Dockerfile.windows", "-t", "anitrack-windows", "."], check=True)
        
        # Create output directory
        os.makedirs("dist-windows", exist_ok=True)
        
        # Run container and copy files
        subprocess.run([
            "docker", "run", "--rm", 
            "-v", f"{os.getcwd()}/dist-windows:/output",
            "anitrack-windows"
        ], check=True)
        
        print("✅ Windows build complete: ./dist-windows/")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Windows build failed: {e}")
    finally:
        # Cleanup
        if os.path.exists("Dockerfile.windows"):
            os.remove("Dockerfile.windows")

def build_macos():
    """Build for macOS (current platform)."""
    print("Building for macOS...")
    
    try:
        subprocess.run(["python", "build-nuitka-fast.py"], check=True)
        print("✅ macOS build complete: ./dist/main.dist/")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ macOS build failed: {e}")

def main():
    """Main build function."""
    print("🏗️  Building Anitrack for all platforms...")
    
    # Check if Docker is available
    try:
        subprocess.run(["docker", "--version"], capture_output=True, check=True)
        docker_available = True
    except (subprocess.CalledProcessError, FileNotFoundError):
        docker_available = False
        print("⚠️  Docker not available. Linux/Windows builds will be skipped.")
    
    # Build for current platform (macOS)
    build_macos()
    
    # Build for other platforms if Docker is available
    if docker_available:
        build_linux()
        build_windows()
    else:
        print("💡 To build for Linux/Windows, install Docker and run again.")
        print("💡 Or use GitHub Actions for automatic cross-platform builds.")

if __name__ == "__main__":
    main()
