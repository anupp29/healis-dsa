"""
MongoDB Database Configuration and Connection Manager
"""
import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

class DatabaseManager:
    """Manages MongoDB connections and operations"""
    
    def __init__(self):
        self.client = None
        self.db = None
        self.mongodb_uri = os.getenv('MONGODB_URI')
        self.database_name = os.getenv('DATABASE_NAME', 'healis_db')
        self.logger = logging.getLogger(__name__)
        
    def connect(self):
        """Establish connection to MongoDB"""
        try:
            if not self.mongodb_uri:
                raise ValueError("MongoDB URI not found in environment variables")
                
            self.client = MongoClient(
                self.mongodb_uri,
                serverSelectionTimeoutMS=5000,  # 5 second timeout
                connectTimeoutMS=10000,         # 10 second connection timeout
                socketTimeoutMS=20000           # 20 second socket timeout
            )
            
            # Test the connection
            self.client.admin.command('ping')
            self.db = self.client[self.database_name]
            
            self.logger.info(f"Successfully connected to MongoDB: {self.database_name}")
            return True
            
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            self.logger.error(f"Failed to connect to MongoDB: {e}")
            return False
        except Exception as e:
            self.logger.error(f"Unexpected error connecting to MongoDB: {e}")
            return False
    
    def get_collection(self, collection_name):
        """Get a specific collection"""
        if not self.db:
            if not self.connect():
                return None
        return self.db[collection_name]
    
    def get_all_collections(self):
        """Get list of all collections in the database"""
        if not self.db:
            if not self.connect():
                return []
        return self.db.list_collection_names()
    
    def close_connection(self):
        """Close the MongoDB connection"""
        if self.client:
            self.client.close()
            self.logger.info("MongoDB connection closed")

# Global database manager instance
db_manager = DatabaseManager()

# Collection mappings based on your schemas
COLLECTIONS = {
    'users': 'users',
    'doctor_appointments': 'doctorappointments',
    'health_checkups': 'healthcheckups',
    'medications': 'medications',
    'lab_tests': 'labtests',
    'vaccinations': 'vaccinations',
    'mental_health': 'mentalhealth',
    'nutritionist_bookings': 'nutritionistbookings',
    'pharmacy': 'pharmacy',
    'reminders': 'reminders',
    'contacts': 'contacts'
}
