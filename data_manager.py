"""
Dynamic Data Manager for MongoDB Integration
"""
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pymongo.errors import PyMongoError
from config.database import db_manager, COLLECTIONS
from dsa.data_structures import Patient, Appointment, PriorityQueue, HashTable, BinarySearchTree
from dsa.algorithms import SortingAlgorithms, SearchAlgorithms, HealthcareAnalytics

class DataManager:
    """Manages dynamic data fetching and DSA operations"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.patient_cache = HashTable(size=1000)
        self.appointment_bst = BinarySearchTree()
        self.priority_queue = PriorityQueue()
        self.last_sync = None
        
    def connect_to_database(self) -> bool:
        """Establish database connection"""
        return db_manager.connect()
    
    def fetch_all_patients(self, force_refresh: bool = False) -> List[Patient]:
        """Fetch all patients from MongoDB"""
        try:
            if not force_refresh and self.last_sync:
                # Check if we synced recently (within 5 minutes)
                if datetime.now() - self.last_sync < timedelta(minutes=5):
                    cached_patients = []
                    for key in self.patient_cache.keys():
                        patient_data = self.patient_cache.get(key)
                        if patient_data:
                            cached_patients.append(Patient(patient_data))
                    if cached_patients:
                        return cached_patients
            
            collection = db_manager.get_collection(COLLECTIONS['users'])
            if not collection:
                self.logger.error("Failed to get users collection")
                return []
            
            # Fetch all patient records
            cursor = collection.find({})
            patients = []
            
            for doc in cursor:
                # Convert ObjectId to string for JSON serialization
                if '_id' in doc:
                    doc['_id'] = str(doc['_id'])
                
                patient = Patient(doc)
                patients.append(patient)
                
                # Cache the patient
                self.patient_cache.insert(patient.patient_id, doc)
            
            self.last_sync = datetime.now()
            self.logger.info(f"Fetched {len(patients)} patients from database")
            return patients
            
        except PyMongoError as e:
            self.logger.error(f"Database error fetching patients: {e}")
            return []
        except Exception as e:
            self.logger.error(f"Unexpected error fetching patients: {e}")
            return []
    
    def fetch_all_appointments(self) -> List[Appointment]:
        """Fetch all appointments from MongoDB"""
        try:
            collection = db_manager.get_collection(COLLECTIONS['doctor_appointments'])
            if not collection:
                self.logger.error("Failed to get appointments collection")
                return []
            
            cursor = collection.find({})
            appointments = []
            
            for doc in cursor:
                # Convert ObjectId to string
                if '_id' in doc:
                    doc['_id'] = str(doc['_id'])
                
                # Convert date strings to datetime objects if needed
                if 'appointmentDate' in doc and isinstance(doc['appointmentDate'], str):
                    try:
                        doc['appointmentDate'] = datetime.fromisoformat(doc['appointmentDate'].replace('Z', '+00:00'))
                    except:
                        pass
                
                appointment = Appointment(doc)
                appointments.append(appointment)
                
                # Add to BST for quick searching by date
                if appointment.appointment_date:
                    self.appointment_bst.insert(appointment.appointment_date, appointment)
            
            self.logger.info(f"Fetched {len(appointments)} appointments from database")
            return appointments
            
        except PyMongoError as e:
            self.logger.error(f"Database error fetching appointments: {e}")
            return []
        except Exception as e:
            self.logger.error(f"Unexpected error fetching appointments: {e}")
            return []
    
    def fetch_recent_records(self, collection_name: str, hours: int = 24) -> List[Dict[str, Any]]:
        """Fetch records added in the last N hours"""
        try:
            collection = db_manager.get_collection(collection_name)
            if not collection:
                return []
            
            cutoff_time = datetime.now() - timedelta(hours=hours)
            
            cursor = collection.find({
                'createdAt': {'$gte': cutoff_time}
            }).sort('createdAt', -1)
            
            records = []
            for doc in cursor:
                if '_id' in doc:
                    doc['_id'] = str(doc['_id'])
                records.append(doc)
            
            return records
            
        except PyMongoError as e:
            self.logger.error(f"Database error fetching recent records: {e}")
            return []
    
    def search_patients(self, query: str, search_type: str = 'fuzzy') -> List[tuple]:
        """Search patients using different algorithms"""
        patients = self.fetch_all_patients()
        
        if search_type == 'linear':
            # Linear search by name
            index = SearchAlgorithms.linear_search(
                patients, 
                query.lower(), 
                key_func=lambda p: p.full_name.lower()
            )
            return [(index, patients[index], 1.0)] if index != -1 else []
        
        elif search_type == 'fuzzy':
            # Fuzzy search by name
            return SearchAlgorithms.fuzzy_search(
                patients,
                query,
                key_func=lambda p: p.full_name,
                threshold=0.3
            )
        
        elif search_type == 'id':
            # Search by patient ID using hash table
            patient_data = self.patient_cache.get(query)
            if patient_data:
                patient = Patient(patient_data)
                return [(0, patient, 1.0)]
            return []
        
        return []
    
    def sort_patients(self, sort_by: str = 'name', algorithm: str = 'quick', reverse: bool = False) -> List[Patient]:
        """Sort patients using different algorithms"""
        patients = self.fetch_all_patients()
        
        # Define key functions for sorting
        key_functions = {
            'name': lambda p: p.full_name.lower(),
            'id': lambda p: p.patient_id,
            'date': lambda p: p.created_at,
            'age': lambda p: HealthcareAnalytics.calculate_age(p.dob) if p.dob else 0
        }
        
        key_func = key_functions.get(sort_by, key_functions['name'])
        
        if algorithm == 'quick':
            return SortingAlgorithms.quick_sort(patients, key_func, reverse)
        elif algorithm == 'merge':
            return SortingAlgorithms.merge_sort(patients, key_func, reverse)
        elif algorithm == 'heap':
            return SortingAlgorithms.heap_sort(patients, key_func, reverse)
        else:
            return sorted(patients, key=key_func, reverse=reverse)
    
    def sort_appointments(self, sort_by: str = 'date', algorithm: str = 'quick', reverse: bool = False) -> List[Appointment]:
        """Sort appointments using different algorithms"""
        appointments = self.fetch_all_appointments()
        
        key_functions = {
            'date': lambda a: a.appointment_date or datetime.min,
            'patient': lambda a: a.patient_name.lower(),
            'doctor': lambda a: a.doctor_name.lower(),
            'status': lambda a: a.status,
            'created': lambda a: a.created_at
        }
        
        key_func = key_functions.get(sort_by, key_functions['date'])
        
        if algorithm == 'quick':
            return SortingAlgorithms.quick_sort(appointments, key_func, reverse)
        elif algorithm == 'merge':
            return SortingAlgorithms.merge_sort(appointments, key_func, reverse)
        elif algorithm == 'heap':
            return SortingAlgorithms.heap_sort(appointments, key_func, reverse)
        else:
            return sorted(appointments, key=key_func, reverse=reverse)
    
    def get_analytics_data(self) -> Dict[str, Any]:
        """Get comprehensive analytics data"""
        patients = self.fetch_all_patients()
        appointments = self.fetch_all_appointments()
        
        analytics = {
            'total_patients': len(patients),
            'total_appointments': len(appointments),
            'age_groups': HealthcareAnalytics.group_patients_by_age_range(patients),
            'upcoming_appointments': HealthcareAnalytics.find_upcoming_appointments(appointments),
            'frequent_patients': HealthcareAnalytics.find_frequent_patients(appointments),
            'appointment_analysis': HealthcareAnalytics.appointment_load_analysis(appointments),
            'conflicts': HealthcareAnalytics.detect_appointment_conflicts(appointments)
        }
        
        return analytics
    
    def get_priority_appointments(self) -> List[tuple]:
        """Get priority appointments based on urgency"""
        appointments = self.fetch_all_appointments()
        
        # Clear existing priority queue
        self.priority_queue = PriorityQueue()
        
        for appointment in appointments:
            priority = self._calculate_appointment_priority(appointment)
            self.priority_queue.push(appointment, priority)
        
        # Extract all appointments in priority order
        priority_appointments = []
        while not self.priority_queue.is_empty():
            appointment = self.priority_queue.pop()
            priority_appointments.append(appointment)
        
        return priority_appointments
    
    def _calculate_appointment_priority(self, appointment: Appointment) -> int:
        """Calculate priority score for appointment (lower = higher priority)"""
        priority = 100  # Base priority
        
        # Higher priority for sooner appointments
        if appointment.appointment_date:
            days_until = (appointment.appointment_date - datetime.now()).days
            if days_until <= 1:
                priority -= 50
            elif days_until <= 3:
                priority -= 30
            elif days_until <= 7:
                priority -= 10
        
        # Higher priority for certain specialties
        urgent_specialties = ['Emergency', 'Cardiology', 'Oncology', 'ICU']
        if appointment.specialty in urgent_specialties:
            priority -= 20
        
        # Higher priority for confirmed appointments
        if appointment.status == 'Confirmed':
            priority -= 10
        
        return max(1, priority)  # Ensure priority is at least 1
    
    def monitor_new_records(self, callback_func=None):
        """Monitor for new records and trigger updates"""
        try:
            # This is a simplified version - in production, you'd use MongoDB Change Streams
            recent_patients = self.fetch_recent_records(COLLECTIONS['users'], hours=1)
            recent_appointments = self.fetch_recent_records(COLLECTIONS['doctor_appointments'], hours=1)
            
            if recent_patients or recent_appointments:
                self.logger.info(f"Found {len(recent_patients)} new patients and {len(recent_appointments)} new appointments")
                
                # Refresh cache
                self.last_sync = None
                
                if callback_func:
                    callback_func({
                        'new_patients': len(recent_patients),
                        'new_appointments': len(recent_appointments),
                        'timestamp': datetime.now()
                    })
            
            return len(recent_patients) + len(recent_appointments)
            
        except Exception as e:
            self.logger.error(f"Error monitoring new records: {e}")
            return 0

# Global data manager instance
data_manager = DataManager()
