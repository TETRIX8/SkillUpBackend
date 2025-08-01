import sys
import os

# Add the parent directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.main import app

# This is the entry point for Vercel
# Vercel expects the app to be available as a module-level variable
application = app

# For local development
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

