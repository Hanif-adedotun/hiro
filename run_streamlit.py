#!/usr/bin/env python3
"""
Hiro Streamlit App Runner

This script runs the Hiro Streamlit application with proper configuration.
"""

import subprocess
import sys
import os
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import streamlit
        import requests
        import dotenv
        print("✅ All dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please install dependencies with: pip install -r streamlit_requirements.txt")
        return False

def run_streamlit():
    """Run the Streamlit application"""
    if not check_dependencies():
        return False
    
    # Get the directory of this script
    script_dir = Path(__file__).parent
    streamlit_app = script_dir / "streamlit_app.py"
    
    if not streamlit_app.exists():
        print(f"❌ Streamlit app not found at {streamlit_app}")
        return False
    
    print("🚀 Starting Hiro Streamlit App...")
    print("📱 The app will open in your browser at http://localhost:8501")
    print("🛑 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        # Run streamlit with specific configuration
        subprocess.run([
            sys.executable, "-m", "streamlit", "run", 
            str(streamlit_app),
            "--server.port", "8501",
            "--server.address", "localhost",
            "--browser.gatherUsageStats", "false"
        ])
    except KeyboardInterrupt:
        print("\n👋 Streamlit app stopped")
    except Exception as e:
        print(f"❌ Error running Streamlit app: {e}")
        return False
    
    return True

def main():
    """Main function"""
    print("🎯 Hiro Streamlit App")
    print("AI-Powered Test Generation Platform")
    print("=" * 50)
    
    success = run_streamlit()
    
    if not success:
        print("\n💡 Troubleshooting:")
        print("1. Make sure you're in the correct directory")
        print("2. Install dependencies: pip install -r streamlit_requirements.txt")
        print("3. Check if port 8501 is available")
        print("4. Ensure you have Python 3.8+ installed")
        sys.exit(1)

if __name__ == "__main__":
    main() 