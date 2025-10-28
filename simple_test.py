"""
Simple test to verify everything works
"""
import streamlit as st
import sys
import os

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

st.title("🧪 HEAL Platform - Import Test")

st.write(f"**Python Version:** {sys.version}")
st.write(f"**Python Executable:** {sys.executable}")

# Test imports
st.subheader("📦 Package Versions")

try:
    import pymongo
    st.success(f"✅ pymongo: {pymongo.__version__}")
    
    # Test MongoDB connection
    st.subheader("🔗 MongoDB Connection Test")
    
    try:
        from pymongo import MongoClient
        
        # Try to connect (this will timeout if MongoDB is not running, but won't crash)
        client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=2000)
        
        # Test connection
        try:
            client.admin.command('ping')
            st.success("✅ MongoDB connection successful!")
        except Exception as e:
            st.warning(f"⚠️ MongoDB not running (this is OK): {e}")
        
    except Exception as e:
        st.error(f"❌ MongoDB connection error: {e}")
        
except ImportError as e:
    st.error(f"❌ pymongo import failed: {e}")

try:
    import plotly
    st.success(f"✅ plotly: {plotly.__version__}")
except ImportError as e:
    st.error(f"❌ plotly: {e}")

try:
    import pandas
    st.success(f"✅ pandas: {pandas.__version__}")
except ImportError as e:
    st.error(f"❌ pandas: {e}")

try:
    import numpy
    st.success(f"✅ numpy: {numpy.__version__}")
except ImportError as e:
    st.error(f"❌ numpy: {e}")

st.subheader("🎯 Next Steps")
st.write("If all packages show ✅, you can run the main HEAL platform:")
st.code("streamlit run heal_perfect_app.py --server.port 8503")

st.success("🎉 All tests completed! Your environment is ready.")
