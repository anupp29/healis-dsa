"""
Test script to verify all imports work correctly
"""
import sys
print(f"Python version: {sys.version}")
print(f"Python executable: {sys.executable}")
print("\nTesting imports...")

try:
    import pymongo
    print(f"✅ pymongo: {pymongo.__version__}")
except ImportError as e:
    print(f"❌ pymongo: {e}")

try:
    import streamlit
    print(f"✅ streamlit: {streamlit.__version__}")
except ImportError as e:
    print(f"❌ streamlit: {e}")

try:
    import plotly
    print(f"✅ plotly: {plotly.__version__}")
except ImportError as e:
    print(f"❌ plotly: {e}")

try:
    import pandas
    print(f"✅ pandas: {pandas.__version__}")
except ImportError as e:
    print(f"❌ pandas: {e}")

try:
    import numpy
    print(f"✅ numpy: {numpy.__version__}")
except ImportError as e:
    print(f"❌ numpy: {e}")

try:
    from dotenv import load_dotenv
    print("✅ python-dotenv: OK")
except ImportError as e:
    print(f"❌ python-dotenv: {e}")

print("\n🎉 Import test completed!")
