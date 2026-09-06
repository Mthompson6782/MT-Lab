"""Serverless function entrypoint for Vercel."""
import os
import sys
from pathlib import Path

# Add project root to sys.path so 'seal' can be imported in AWS Lambda/Vercel
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from seal.edgereactor.app import app

__all__ = ["app"]

