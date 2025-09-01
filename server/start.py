#!/usr/bin/env python3
"""
SafarBot Backend Startup Script
Handles environment loading and provides better error handling
"""

import os
import sys
import uvicorn
from dotenv import load_dotenv
from pathlib import Path

def load_environment():
    """Load environment variables from .env file"""
    env_file = Path(__file__).parent / '.env'
    
    if env_file.exists():
        print(f"✅ Loading environment from {env_file}")
        load_dotenv(env_file)
    else:
        print("⚠️  No .env file found. Using system environment variables.")
        print("📝 Copy env.template to .env and configure your settings")
    
    # Check required environment variables
    required_vars = [
        'MONGODB_URL',
        'GOOGLE_API_KEY',
        'SECRET_KEY'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        print("📝 Please check your .env file configuration")
        return False
    
    print("✅ Environment variables loaded successfully")
    return True

def check_dependencies():
    """Check if required packages are installed"""
    try:
        import fastapi
        import motor
        import google.generativeai
        print("✅ All required packages are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing required package: {e}")
        print("📝 Run: pip install -r requirements.txt")
        return False

def main():
    """Main startup function"""
    print("🚀 Starting SafarBot Backend...")
    print("=" * 50)
    
    # Load environment
    if not load_environment():
        sys.exit(1)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Get configuration
    host = os.getenv('API_HOST', '0.0.0.0')
    port = int(os.getenv('API_PORT', 8000))
    workers = int(os.getenv('API_WORKERS', 1))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    
    print(f"🌐 Server will run on {host}:{port}")
    print(f"🔧 Debug mode: {'ON' if debug else 'OFF'}")
    print(f"👥 Workers: {workers}")
    print("=" * 50)
    
    try:
        # Start the server
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            workers=workers if not debug else 1,
            reload=debug,
            log_level="info" if debug else "warning"
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()





