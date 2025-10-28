"""
HEAL Platform - MongoDB Data Bridge
Real-time data synchronization between MongoDB and DSA engine
"""
import asyncio
import threading
import time
from typing import Dict, List, Any, Optional, Callable
from datetime import datetime, timedelta
import logging
from pymongo import MongoClient
from pymongo.errors import PyMongoError
import os
from dotenv import load_dotenv

from ..core.dsa_engine import (
    viz_engine, VisualizableArray, VisualizableStack, VisualizableQueue,
    VisualizableLinkedList, VisualizableBinaryTree, VisualizableGraph
)

load_dotenv()

class MongoDBConnector:
    """Advanced MongoDB connector for dual database support"""
    
    def __init__(self):
        self.healis_client = None
        self.admin_client = None
        self.healis_db = None
        self.admin_db = None
        self.logger = logging.getLogger(__name__)
        self.connection_status = {
            'healis': False,
            'admin': False
        }
        
        # Connection URIs
        self.healis_uri = os.getenv('MONGODB_URI_HEALIS')
        self.admin_uri = os.getenv('MONGODB_URI_ADMIN')
        self.healis_db_name = os.getenv('DATABASE_NAME_HEALIS', 'healis')
        self.admin_db_name = os.getenv('DATABASE_NAME_ADMIN', 'healis-admin')
        
        # Data change listeners
        self.change_listeners: List[Callable] = []
        self.monitoring_active = False
        
    def connect_all(self) -> Dict[str, bool]:
        """Connect to both databases"""
        results = {}
        
        # Connect to Healis database
        try:
            if self.healis_uri:
                self.healis_client = MongoClient(
                    self.healis_uri,
                    serverSelectionTimeoutMS=5000
                )
                self.healis_client.admin.command('ping')
                self.healis_db = self.healis_client[self.healis_db_name]
                self.connection_status['healis'] = True
                results['healis'] = True
                self.logger.info(f"Connected to Healis database: {self.healis_db_name}")
            else:
                results['healis'] = False
                self.logger.error("Healis MongoDB URI not found")
        except Exception as e:
            results['healis'] = False
            self.logger.error(f"Failed to connect to Healis database: {e}")
        
        # Connect to Admin database
        try:
            if self.admin_uri:
                self.admin_client = MongoClient(
                    self.admin_uri,
                    serverSelectionTimeoutMS=5000
                )
                self.admin_client.admin.command('ping')
                self.admin_db = self.admin_client[self.admin_db_name]
                self.connection_status['admin'] = True
                results['admin'] = True
                self.logger.info(f"Connected to Admin database: {self.admin_db_name}")
            else:
                results['admin'] = False
                self.logger.error("Admin MongoDB URI not found")
        except Exception as e:
            results['admin'] = False
            self.logger.error(f"Failed to connect to Admin database: {e}")
        
        return results
    
    def get_collection(self, collection_name: str, database: str = 'healis'):
        """Get collection from specified database"""
        if database == 'healis' and self.healis_db:
            return self.healis_db[collection_name]
        elif database == 'admin' and self.admin_db:
            return self.admin_db[collection_name]
        return None
    
    def fetch_collection_data(self, collection_name: str, database: str = 'healis', 
                            limit: int = 1000) -> List[Dict[str, Any]]:
        """Fetch data from collection"""
        try:
            collection = self.get_collection(collection_name, database)
            if not collection:
                return []
            
            cursor = collection.find().limit(limit)
            data = []
            
            for doc in cursor:
                # Convert ObjectId to string for JSON serialization
                if '_id' in doc:
                    doc['_id'] = str(doc['_id'])
                data.append(doc)
            
            return data
            
        except PyMongoError as e:
            self.logger.error(f"Error fetching data from {collection_name}: {e}")
            return []
    
    def add_change_listener(self, callback: Callable):
        """Add listener for database changes"""
        self.change_listeners.append(callback)
    
    def start_change_monitoring(self):
        """Start monitoring database changes"""
        if self.monitoring_active:
            return
        
        self.monitoring_active = True
        
        def monitor_changes():
            while self.monitoring_active:
                try:
                    # Check for recent changes (last 30 seconds)
                    cutoff_time = datetime.now() - timedelta(seconds=30)
                    
                    changes_detected = False
                    
                    # Monitor Healis database
                    if self.connection_status['healis']:
                        for collection_name in ['users', 'doctorappointments', 'medications']:
                            try:
                                collection = self.get_collection(collection_name, 'healis')
                                if collection:
                                    recent_count = collection.count_documents({
                                        'createdAt': {'$gte': cutoff_time}
                                    })
                                    
                                    if recent_count > 0:
                                        changes_detected = True
                                        self._notify_change_listeners({
                                            'database': 'healis',
                                            'collection': collection_name,
                                            'new_records': recent_count,
                                            'timestamp': datetime.now()
                                        })
                            except Exception as e:
                                self.logger.error(f"Error monitoring {collection_name}: {e}")
                    
                    # Monitor Admin database
                    if self.connection_status['admin']:
                        for collection_name in ['users', 'pharmacy']:
                            try:
                                collection = self.get_collection(collection_name, 'admin')
                                if collection:
                                    recent_count = collection.count_documents({
                                        'createdAt': {'$gte': cutoff_time}
                                    })
                                    
                                    if recent_count > 0:
                                        changes_detected = True
                                        self._notify_change_listeners({
                                            'database': 'admin',
                                            'collection': collection_name,
                                            'new_records': recent_count,
                                            'timestamp': datetime.now()
                                        })
                            except Exception as e:
                                self.logger.error(f"Error monitoring admin {collection_name}: {e}")
                    
                    time.sleep(30)  # Check every 30 seconds
                    
                except Exception as e:
                    self.logger.error(f"Error in change monitoring: {e}")
                    time.sleep(30)
        
        # Start monitoring in background thread
        monitor_thread = threading.Thread(target=monitor_changes, daemon=True)
        monitor_thread.start()
    
    def _notify_change_listeners(self, change_info: Dict[str, Any]):
        """Notify all change listeners"""
        for listener in self.change_listeners:
            try:
                listener(change_info)
            except Exception as e:
                self.logger.error(f"Error in change listener: {e}")
    
    def stop_change_monitoring(self):
        """Stop monitoring database changes"""
        self.monitoring_active = False
    
    def close_connections(self):
        """Close all database connections"""
        if self.healis_client:
            self.healis_client.close()
        if self.admin_client:
            self.admin_client.close()
        
        self.connection_status = {'healis': False, 'admin': False}

class DataStructureMapper:
    """Maps MongoDB data to visualizable data structures"""
    
    def __init__(self, connector: MongoDBConnector):
        self.connector = connector
        self.logger = logging.getLogger(__name__)
    
    def create_patient_array(self, database: str = 'healis') -> VisualizableArray:
        """Create visualizable array from patient data"""
        try:
            patients_data = self.connector.fetch_collection_data('users', database)
            
            # Extract patient names for visualization
            patient_names = [
                patient.get('fullName', patient.get('name', 'Unknown'))
                for patient in patients_data
            ]
            
            return VisualizableArray(patient_names, f"Patients_{database}")
            
        except Exception as e:
            self.logger.error(f"Error creating patient array: {e}")
            return VisualizableArray([], f"Patients_{database}")
    
    def create_appointment_queue(self, database: str = 'healis') -> VisualizableQueue:
        """Create visualizable queue from appointment data"""
        try:
            appointments_data = self.connector.fetch_collection_data('doctorappointments', database)
            
            # Sort appointments by date and create queue
            queue = VisualizableQueue(f"Appointments_{database}")
            
            # Sort by appointment date
            sorted_appointments = sorted(
                appointments_data,
                key=lambda x: x.get('appointmentDate', ''),
                reverse=False
            )
            
            for appointment in sorted_appointments[:50]:  # Limit to 50 for visualization
                patient_name = appointment.get('patient', {}).get('fullName', 'Unknown')
                doctor_name = appointment.get('doctor', {}).get('name', 'Unknown')
                appointment_info = f"{patient_name} -> {doctor_name}"
                queue.enqueue(appointment_info)
            
            return queue
            
        except Exception as e:
            self.logger.error(f"Error creating appointment queue: {e}")
            return VisualizableQueue(f"Appointments_{database}")
    
    def create_medication_stack(self, database: str = 'healis') -> VisualizableStack:
        """Create visualizable stack from medication data"""
        try:
            medications_data = self.connector.fetch_collection_data('medications', database)
            
            stack = VisualizableStack(f"Medications_{database}")
            
            # Add medications to stack (most recent first)
            sorted_medications = sorted(
                medications_data,
                key=lambda x: x.get('createdAt', ''),
                reverse=True
            )
            
            for medication in sorted_medications[:30]:  # Limit to 30 for visualization
                med_name = medication.get('name', 'Unknown Medication')
                patient_name = medication.get('patient', {}).get('fullName', 'Unknown')
                med_info = f"{med_name} ({patient_name})"
                stack.push(med_info)
            
            return stack
            
        except Exception as e:
            self.logger.error(f"Error creating medication stack: {e}")
            return VisualizableStack(f"Medications_{database}")
    
    def create_doctor_network(self, database: str = 'healis') -> VisualizableGraph:
        """Create visualizable graph from doctor-patient relationships"""
        try:
            appointments_data = self.connector.fetch_collection_data('doctorappointments', database)
            
            graph = VisualizableGraph(directed=False, name=f"DoctorNetwork_{database}")
            
            # Build graph of doctor-patient relationships
            doctor_patient_connections = {}
            
            for appointment in appointments_data:
                doctor_name = appointment.get('doctor', {}).get('name', 'Unknown Doctor')
                patient_name = appointment.get('patient', {}).get('fullName', 'Unknown Patient')
                
                if doctor_name not in doctor_patient_connections:
                    doctor_patient_connections[doctor_name] = set()
                
                doctor_patient_connections[doctor_name].add(patient_name)
            
            # Add nodes and edges to graph
            for doctor, patients in doctor_patient_connections.items():
                graph.add_node(doctor)
                
                for patient in list(patients)[:10]:  # Limit connections for visualization
                    graph.add_node(patient)
                    graph.add_edge(doctor, patient, weight=1.0)
            
            return graph
            
        except Exception as e:
            self.logger.error(f"Error creating doctor network: {e}")
            return VisualizableGraph(directed=False, name=f"DoctorNetwork_{database}")
    
    def create_patient_bst(self, database: str = 'healis') -> VisualizableBinaryTree:
        """Create visualizable BST from patient data (sorted by ID)"""
        try:
            patients_data = self.connector.fetch_collection_data('users', database)
            
            bst = VisualizableBinaryTree(f"PatientBST_{database}")
            
            # Sort patients by ID and insert into BST
            sorted_patients = sorted(
                patients_data,
                key=lambda x: x.get('patientId', x.get('_id', ''))
            )
            
            for patient in sorted_patients[:50]:  # Limit to 50 for visualization
                patient_id = patient.get('patientId', patient.get('_id', 'Unknown'))
                bst.insert(patient_id)
            
            return bst
            
        except Exception as e:
            self.logger.error(f"Error creating patient BST: {e}")
            return VisualizableBinaryTree(f"PatientBST_{database}")

class RealTimeDataBridge:
    """Bridge between MongoDB and DSA visualizations with real-time updates"""
    
    def __init__(self):
        self.connector = MongoDBConnector()
        self.mapper = DataStructureMapper(self.connector)
        self.data_structures = {}
        self.update_callbacks = []
        self.logger = logging.getLogger(__name__)
        
        # Register for database changes
        self.connector.add_change_listener(self._handle_database_change)
    
    def initialize(self) -> Dict[str, bool]:
        """Initialize the data bridge"""
        connection_results = self.connector.connect_all()
        
        if any(connection_results.values()):
            self._load_initial_data()
            self.connector.start_change_monitoring()
        
        return connection_results
    
    def _load_initial_data(self):
        """Load initial data structures from both databases"""
        try:
            # Load from Healis database
            if self.connector.connection_status['healis']:
                self.data_structures['healis_patients'] = self.mapper.create_patient_array('healis')
                self.data_structures['healis_appointments'] = self.mapper.create_appointment_queue('healis')
                self.data_structures['healis_medications'] = self.mapper.create_medication_stack('healis')
                self.data_structures['healis_network'] = self.mapper.create_doctor_network('healis')
                self.data_structures['healis_patient_bst'] = self.mapper.create_patient_bst('healis')
            
            # Load from Admin database
            if self.connector.connection_status['admin']:
                self.data_structures['admin_users'] = self.mapper.create_patient_array('admin')
                self.data_structures['admin_network'] = self.mapper.create_doctor_network('admin')
            
            self.logger.info("Initial data structures loaded successfully")
            
        except Exception as e:
            self.logger.error(f"Error loading initial data: {e}")
    
    def _handle_database_change(self, change_info: Dict[str, Any]):
        """Handle database changes and update data structures"""
        try:
            database = change_info['database']
            collection = change_info['collection']
            
            self.logger.info(f"Database change detected: {database}.{collection}")
            
            # Refresh relevant data structures
            if database == 'healis':
                if collection == 'users':
                    self.data_structures['healis_patients'] = self.mapper.create_patient_array('healis')
                    self.data_structures['healis_patient_bst'] = self.mapper.create_patient_bst('healis')
                elif collection == 'doctorappointments':
                    self.data_structures['healis_appointments'] = self.mapper.create_appointment_queue('healis')
                    self.data_structures['healis_network'] = self.mapper.create_doctor_network('healis')
                elif collection == 'medications':
                    self.data_structures['healis_medications'] = self.mapper.create_medication_stack('healis')
            
            elif database == 'admin':
                if collection == 'users':
                    self.data_structures['admin_users'] = self.mapper.create_patient_array('admin')
                    self.data_structures['admin_network'] = self.mapper.create_doctor_network('admin')
            
            # Notify update callbacks
            for callback in self.update_callbacks:
                try:
                    callback(change_info, self.data_structures)
                except Exception as e:
                    self.logger.error(f"Error in update callback: {e}")
                    
        except Exception as e:
            self.logger.error(f"Error handling database change: {e}")
    
    def add_update_callback(self, callback: Callable):
        """Add callback for data structure updates"""
        self.update_callbacks.append(callback)
    
    def get_data_structure(self, name: str):
        """Get a specific data structure"""
        return self.data_structures.get(name)
    
    def get_all_data_structures(self) -> Dict[str, Any]:
        """Get all loaded data structures"""
        return self.data_structures.copy()
    
    def refresh_all_data(self):
        """Manually refresh all data structures"""
        self._load_initial_data()
    
    def shutdown(self):
        """Shutdown the data bridge"""
        self.connector.stop_change_monitoring()
        self.connector.close_connections()

# Global data bridge instance
data_bridge = RealTimeDataBridge()
