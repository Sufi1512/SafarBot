"""
Startup wrapper - runs the app using venv's Python.
Use this as Start file in deployment panel when using venv.
"""
import subprocess
import sys
import os

# Change to server directory
server_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(server_dir)

# Use venv's Python
venv_python = os.path.join(server_dir, "venv", "bin", "python")
if not os.path.exists(venv_python):
    print("Error: venv not found. Run deploy.sh first or create venv manually.")
    sys.exit(1)

# Run uvicorn via venv's Python
subprocess.run(
    [venv_python, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"],
    check=True,
)
