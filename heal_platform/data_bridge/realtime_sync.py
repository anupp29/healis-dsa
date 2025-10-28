"""
HEAL Platform - Real-time Database Synchronization
Perfect implementation of real-time data updates with MongoDB Change Streams
"""
import asyncio
import threading
import time
import logging
from typing import Dict, List, Any, Callable, Optional
from datetime import datetime, timedelta
from pymongo import MongoClient
from pymongo.errors import PyMongoError
import json
from dataclasses import dataclass
from enum import Enum

class ChangeType(Enum):
    INSERT = "insert"
    UPDATE = "update"
    DELETE = "delete"
    REPLACE = "replace"

@dataclass
class DatabaseChange:
    """Represents a database change event"""
    change_type: ChangeType
    collection: str
    database: str
    document_id: str
    document: Dict[str, Any]
    timestamp: datetime
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'change_type': self.change_type.value,
            'collection': self.collection,
            'database': self.database,
            'document_id': self.document_id,
            'document': self.document,
            'timestamp': self.timestamp.isoformat()
        }

class RealTimeMongoSync:
    """Perfect real-time MongoDB synchronization with Change Streams"""
    
    def __init__(self, healis_uri: str, admin_uri: str):
        self.healis_uri = healis_uri
        self.admin_uri = admin_uri
        self.healis_client = None
        self.admin_client = None
        self.change_listeners: List[Callable[[DatabaseChange], None]] = []
        self.is_monitoring = False
        self.logger = logging.getLogger(__name__)
        
        # Change stream cursors
        self.healis_stream = None
        self.admin_stream = None
        
        # Threading for async monitoring
        self.monitor_thread = None
        
    def connect(self) -> Dict[str, bool]:
        """Connect to both MongoDB databases"""
        results = {}
        
        try:
            # Connect to Healis database
            self.healis_client = MongoClient(
                self.healis_uri,
                serverSelectionTimeoutMS=5000
            )
            self.healis_client.admin.command('ping')
            results['healis'] = True
            self.logger.info("Connected to Healis database")
            
        except Exception as e:
            results['healis'] = False
            self.logger.error(f"Failed to connect to Healis database: {e}")
        
        try:
            # Connect to Admin database
            self.admin_client = MongoClient(
                self.admin_uri,
                serverSelectionTimeoutMS=5000
            )
            self.admin_client.admin.command('ping')
            results['admin'] = True
            self.logger.info("Connected to Admin database")
            
        except Exception as e:
            results['admin'] = False
            self.logger.error(f"Failed to connect to Admin database: {e}")
        
        return results
    
    def add_change_listener(self, callback: Callable[[DatabaseChange], None]):
        """Add a callback function for database changes"""
        self.change_listeners.append(callback)
    
    def remove_change_listener(self, callback: Callable[[DatabaseChange], None]):
        """Remove a callback function"""
        if callback in self.change_listeners:
            self.change_listeners.remove(callback)
    
    def start_monitoring(self):
        """Start real-time monitoring of database changes"""
        if self.is_monitoring:
            return
        
        self.is_monitoring = True
        self.monitor_thread = threading.Thread(target=self._monitor_changes, daemon=True)
        self.monitor_thread.start()
        self.logger.info("Started real-time database monitoring")
    
    def stop_monitoring(self):
        """Stop real-time monitoring"""
        self.is_monitoring = False
        
        if self.healis_stream:
            self.healis_stream.close()
        if self.admin_stream:
            self.admin_stream.close()
        
        self.logger.info("Stopped real-time database monitoring")
    
    def _monitor_changes(self):
        """Monitor database changes using Change Streams and polling"""
        while self.is_monitoring:
            try:
                # Try Change Streams first (MongoDB 3.6+)
                if self._try_change_streams():
                    continue
                
                # Fallback to polling for older MongoDB versions
                self._poll_for_changes()
                
            except Exception as e:
                self.logger.error(f"Error in change monitoring: {e}")
                time.sleep(5)  # Wait before retrying
    
    def _try_change_streams(self) -> bool:
        """Try to use MongoDB Change Streams for real-time monitoring"""
        try:
            # Monitor Healis database
            if self.healis_client and not self.healis_stream:
                healis_db = self.healis_client.get_database()
                self.healis_stream = healis_db.watch([
                    {'$match': {'operationType': {'$in': ['insert', 'update', 'delete', 'replace']}}}
                ])
                
                # Process Healis changes
                threading.Thread(
                    target=self._process_change_stream,
                    args=(self.healis_stream, 'healis'),
                    daemon=True
                ).start()
            
            # Monitor Admin database
            if self.admin_client and not self.admin_stream:
                admin_db = self.admin_client.get_database()
                self.admin_stream = admin_db.watch([
                    {'$match': {'operationType': {'$in': ['insert', 'update', 'delete', 'replace']}}}
                ])
                
                # Process Admin changes
                threading.Thread(
                    target=self._process_change_stream,
                    args=(self.admin_stream, 'admin'),
                    daemon=True
                ).start()
            
            return True
            
        except Exception as e:
            self.logger.warning(f"Change Streams not available, falling back to polling: {e}")
            return False
    
    def _process_change_stream(self, stream, database_name: str):
        """Process changes from a change stream"""
        try:
            for change in stream:
                if not self.is_monitoring:
                    break
                
                change_event = self._parse_change_event(change, database_name)
                if change_event:
                    self._notify_listeners(change_event)
                    
        except Exception as e:
            self.logger.error(f"Error processing change stream for {database_name}: {e}")
    
    def _parse_change_event(self, change: Dict[str, Any], database_name: str) -> Optional[DatabaseChange]:
        """Parse MongoDB change event into DatabaseChange object"""
        try:
            operation_type = change.get('operationType')
            
            # Map MongoDB operation types to our enum
            change_type_map = {
                'insert': ChangeType.INSERT,
                'update': ChangeType.UPDATE,
                'delete': ChangeType.DELETE,
                'replace': ChangeType.REPLACE
            }
            
            change_type = change_type_map.get(operation_type)
            if not change_type:
                return None
            
            collection_name = change.get('ns', {}).get('coll', 'unknown')
            document_id = str(change.get('documentKey', {}).get('_id', ''))
            
            # Get document data based on operation type
            if operation_type == 'insert':
                document = change.get('fullDocument', {})
            elif operation_type == 'update':
                document = change.get('fullDocument', change.get('updateDescription', {}))
            elif operation_type == 'delete':
                document = {'_id': document_id, 'deleted': True}
            else:  # replace
                document = change.get('fullDocument', {})
            
            # Convert ObjectId to string if present
            if '_id' in document:
                document['_id'] = str(document['_id'])
            
            return DatabaseChange(
                change_type=change_type,
                collection=collection_name,
                database=database_name,
                document_id=document_id,
                document=document,
                timestamp=datetime.now()
            )
            
        except Exception as e:
            self.logger.error(f"Error parsing change event: {e}")
            return None
    
    def _poll_for_changes(self):
        """Fallback polling method for detecting changes"""
        last_check = datetime.now() - timedelta(seconds=30)
        
        while self.is_monitoring:
            try:
                current_time = datetime.now()
                
                # Check Healis database
                if self.healis_client:
                    self._poll_database_changes(self.healis_client, 'healis', last_check)
                
                # Check Admin database
                if self.admin_client:
                    self._poll_database_changes(self.admin_client, 'admin', last_check)
                
                last_check = current_time
                time.sleep(10)  # Poll every 10 seconds
                
            except Exception as e:
                self.logger.error(f"Error in polling: {e}")
                time.sleep(10)
    
    def _poll_database_changes(self, client: MongoClient, database_name: str, since: datetime):
        """Poll a specific database for changes"""
        try:
            db = client.get_database()
            collections = ['users', 'doctorappointments', 'medications', 'healthcheckups', 'labtests']
            
            for collection_name in collections:
                try:
                    collection = db[collection_name]
                    
                    # Find recently created documents
                    recent_docs = collection.find({
                        'createdAt': {'$gte': since}
                    }).limit(50)
                    
                    for doc in recent_docs:
                        # Convert ObjectId to string
                        if '_id' in doc:
                            doc['_id'] = str(doc['_id'])
                        
                        change_event = DatabaseChange(
                            change_type=ChangeType.INSERT,
                            collection=collection_name,
                            database=database_name,
                            document_id=str(doc.get('_id', '')),
                            document=doc,
                            timestamp=datetime.now()
                        )
                        
                        self._notify_listeners(change_event)
                        
                except Exception as e:
                    # Collection might not exist, skip silently
                    continue
                    
        except Exception as e:
            self.logger.error(f"Error polling {database_name}: {e}")
    
    def _notify_listeners(self, change: DatabaseChange):
        """Notify all registered listeners of a database change"""
        for listener in self.change_listeners:
            try:
                listener(change)
            except Exception as e:
                self.logger.error(f"Error in change listener: {e}")
    
    def get_recent_changes(self, minutes: int = 60) -> List[DatabaseChange]:
        """Get recent changes from both databases (fallback method)"""
        changes = []
        cutoff_time = datetime.now() - timedelta(minutes=minutes)
        
        try:
            # Get changes from Healis database
            if self.healis_client:
                changes.extend(self._get_database_changes(self.healis_client, 'healis', cutoff_time))
            
            # Get changes from Admin database
            if self.admin_client:
                changes.extend(self._get_database_changes(self.admin_client, 'admin', cutoff_time))
            
        except Exception as e:
            self.logger.error(f"Error getting recent changes: {e}")
        
        return sorted(changes, key=lambda x: x.timestamp, reverse=True)
    
    def _get_database_changes(self, client: MongoClient, database_name: str, since: datetime) -> List[DatabaseChange]:
        """Get changes from a specific database"""
        changes = []
        
        try:
            db = client.get_database()
            collections = ['users', 'doctorappointments', 'medications', 'healthcheckups', 'labtests']
            
            for collection_name in collections:
                try:
                    collection = db[collection_name]
                    
                    # Find recent documents
                    recent_docs = collection.find({
                        'createdAt': {'$gte': since}
                    }).sort('createdAt', -1).limit(100)
                    
                    for doc in recent_docs:
                        if '_id' in doc:
                            doc['_id'] = str(doc['_id'])
                        
                        change = DatabaseChange(
                            change_type=ChangeType.INSERT,
                            collection=collection_name,
                            database=database_name,
                            document_id=str(doc.get('_id', '')),
                            document=doc,
                            timestamp=doc.get('createdAt', datetime.now())
                        )
                        changes.append(change)
                        
                except Exception:
                    continue
                    
        except Exception as e:
            self.logger.error(f"Error getting changes from {database_name}: {e}")
        
        return changes
    
    def close(self):
        """Close all connections and stop monitoring"""
        self.stop_monitoring()
        
        if self.healis_client:
            self.healis_client.close()
        if self.admin_client:
            self.admin_client.close()

class DataStructureUpdater:
    """Updates data structures in real-time based on database changes"""
    
    def __init__(self, data_structures_manager):
        self.ds_manager = data_structures_manager
        self.logger = logging.getLogger(__name__)
        
    def handle_database_change(self, change: DatabaseChange):
        """Handle a database change and update relevant data structures"""
        try:
            self.logger.info(f"Processing change: {change.change_type.value} in {change.database}.{change.collection}")
            
            # Route change to appropriate handler
            if change.collection == 'users':
                self._handle_user_change(change)
            elif change.collection == 'doctorappointments':
                self._handle_appointment_change(change)
            elif change.collection == 'medications':
                self._handle_medication_change(change)
            elif change.collection == 'healthcheckups':
                self._handle_healthcheckup_change(change)
            
            # Notify visualization layer of update
            self._notify_visualization_update(change)
            
        except Exception as e:
            self.logger.error(f"Error handling database change: {e}")
    
    def _handle_user_change(self, change: DatabaseChange):
        """Handle changes to user/patient data"""
        if change.change_type == ChangeType.INSERT:
            # Add new patient to relevant data structures
            patient_name = change.document.get('fullName', change.document.get('name', 'Unknown'))
            
            # Update patient array
            patient_array = self.ds_manager.get_structure(f'{change.database}_patients')
            if patient_array:
                patient_array.append(patient_name)
            
            # Update patient BST
            patient_bst = self.ds_manager.get_structure(f'{change.database}_patient_bst')
            if patient_bst:
                patient_id = change.document.get('patientId', change.document_id)
                patient_bst.insert(patient_id)
    
    def _handle_appointment_change(self, change: DatabaseChange):
        """Handle changes to appointment data"""
        if change.change_type == ChangeType.INSERT:
            # Add new appointment to queue
            appointment_queue = self.ds_manager.get_structure(f'{change.database}_appointments')
            if appointment_queue:
                patient_name = change.document.get('patient', {}).get('fullName', 'Unknown')
                doctor_name = change.document.get('doctor', {}).get('name', 'Unknown')
                appointment_info = f"{patient_name} -> {doctor_name}"
                appointment_queue.enqueue(appointment_info)
            
            # Update doctor network graph
            network_graph = self.ds_manager.get_structure(f'{change.database}_network')
            if network_graph:
                patient_name = change.document.get('patient', {}).get('fullName', 'Unknown')
                doctor_name = change.document.get('doctor', {}).get('name', 'Unknown')
                network_graph.add_edge(doctor_name, patient_name, weight=1.0)
    
    def _handle_medication_change(self, change: DatabaseChange):
        """Handle changes to medication data"""
        if change.change_type == ChangeType.INSERT:
            # Add new medication to stack
            medication_stack = self.ds_manager.get_structure(f'{change.database}_medications')
            if medication_stack:
                med_name = change.document.get('name', 'Unknown Medication')
                patient_name = change.document.get('patient', {}).get('fullName', 'Unknown')
                med_info = f"{med_name} ({patient_name})"
                medication_stack.push(med_info)
    
    def _handle_healthcheckup_change(self, change: DatabaseChange):
        """Handle changes to health checkup data"""
        # Implement specific handling for health checkups
        pass
    
    def _notify_visualization_update(self, change: DatabaseChange):
        """Notify the visualization layer of data structure updates"""
        # This would trigger real-time updates in the UI
        update_info = {
            'type': 'data_structure_update',
            'change': change.to_dict(),
            'timestamp': datetime.now().isoformat(),
            'affected_structures': self._get_affected_structures(change)
        }
        
        # Send to visualization layer (would be implemented based on UI framework)
        self.logger.info(f"Visualization update: {update_info}")
    
    def _get_affected_structures(self, change: DatabaseChange) -> List[str]:
        """Get list of data structures affected by this change"""
        affected = []
        
        if change.collection == 'users':
            affected.extend([f'{change.database}_patients', f'{change.database}_patient_bst'])
        elif change.collection == 'doctorappointments':
            affected.extend([f'{change.database}_appointments', f'{change.database}_network'])
        elif change.collection == 'medications':
            affected.append(f'{change.database}_medications')
        
        return affected
