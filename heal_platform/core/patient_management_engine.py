"""
Patient Management DSA Engine
Advanced priority queue system for patient triage and management
"""

import heapq
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict, deque
from enum import Enum
import json

class PatientPriority(Enum):
    CRITICAL = 1      # Life-threatening conditions
    EMERGENCY = 2     # Urgent medical attention needed
    URGENT = 3        # Needs prompt attention
    SEMI_URGENT = 4   # Can wait but needs attention
    NON_URGENT = 5    # Routine care

class PatientStatus(Enum):
    WAITING = "Waiting"
    IN_CONSULTATION = "In Consultation"
    UNDER_TREATMENT = "Under Treatment"
    DISCHARGED = "Discharged"
    ADMITTED = "Admitted"
    TRANSFERRED = "Transferred"

class VitalSigns:
    """Vital signs data structure for triage scoring"""
    
    def __init__(self, vitals_data: Dict[str, Any]):
        self.temperature = vitals_data.get('temperature', 98.6)  # Fahrenheit
        self.blood_pressure_systolic = vitals_data.get('bp_systolic', 120)
        self.blood_pressure_diastolic = vitals_data.get('bp_diastolic', 80)
        self.heart_rate = vitals_data.get('heart_rate', 72)
        self.respiratory_rate = vitals_data.get('respiratory_rate', 16)
        self.oxygen_saturation = vitals_data.get('oxygen_saturation', 98)
        self.pain_scale = vitals_data.get('pain_scale', 0)  # 0-10 scale
        self.consciousness_level = vitals_data.get('consciousness_level', 'Alert')
    
    def calculate_severity_score(self) -> int:
        """Calculate severity score based on vital signs (0-100, higher = more severe)"""
        score = 0
        
        # Temperature scoring
        if self.temperature > 103 or self.temperature < 95:
            score += 20
        elif self.temperature > 101 or self.temperature < 96:
            score += 10
        
        # Blood pressure scoring
        if self.blood_pressure_systolic > 180 or self.blood_pressure_systolic < 90:
            score += 20
        elif self.blood_pressure_systolic > 160 or self.blood_pressure_systolic < 100:
            score += 10
        
        # Heart rate scoring
        if self.heart_rate > 120 or self.heart_rate < 50:
            score += 15
        elif self.heart_rate > 100 or self.heart_rate < 60:
            score += 8
        
        # Respiratory rate scoring
        if self.respiratory_rate > 24 or self.respiratory_rate < 12:
            score += 15
        elif self.respiratory_rate > 20 or self.respiratory_rate < 14:
            score += 8
        
        # Oxygen saturation scoring
        if self.oxygen_saturation < 90:
            score += 25
        elif self.oxygen_saturation < 95:
            score += 15
        
        # Pain scale scoring
        if self.pain_scale >= 8:
            score += 15
        elif self.pain_scale >= 6:
            score += 10
        elif self.pain_scale >= 4:
            score += 5
        
        # Consciousness level scoring
        if self.consciousness_level.lower() in ['unconscious', 'unresponsive']:
            score += 30
        elif self.consciousness_level.lower() in ['confused', 'drowsy']:
            score += 15
        
        return min(score, 100)  # Cap at 100

class Patient:
    """Enhanced Patient data structure with triage capabilities"""
    
    def __init__(self, patient_data: Dict[str, Any]):
        self.patient_id = patient_data.get('patientId', '')
        self.full_name = patient_data.get('fullName', '')
        self.email = patient_data.get('email', '')
        self.phone = patient_data.get('phoneNumber', '')
        self.age = patient_data.get('age', 0)
        self.gender = patient_data.get('gender', '')
        self.chief_complaint = patient_data.get('chiefComplaint', '')
        self.medical_history = patient_data.get('medicalHistory', [])
        self.allergies = patient_data.get('allergies', [])
        self.current_medications = patient_data.get('currentMedications', [])
        
        # Triage-specific attributes
        self.vital_signs = VitalSigns(patient_data.get('vitalSigns', {}))
        self.arrival_time = patient_data.get('arrivalTime', datetime.now())
        self.triage_category = patient_data.get('triageCategory', 'NON_URGENT')
        self.priority = self._calculate_priority()
        self.status = PatientStatus(patient_data.get('status', 'Waiting'))
        self.assigned_doctor = patient_data.get('assignedDoctor', '')
        self.estimated_wait_time = patient_data.get('estimatedWaitTime', 0)
        
        # Emergency indicators
        self.is_ambulance_arrival = patient_data.get('isAmbulanceArrival', False)
        self.trauma_alert = patient_data.get('traumaAlert', False)
        self.infectious_disease_alert = patient_data.get('infectiousDiseaseAlert', False)
        
        self.raw_data = patient_data
    
    def _calculate_priority(self) -> PatientPriority:
        """Calculate patient priority using multiple factors"""
        severity_score = self.vital_signs.calculate_severity_score()
        
        # Critical conditions
        if (severity_score >= 80 or 
            self.trauma_alert or 
            self.vital_signs.consciousness_level.lower() in ['unconscious', 'unresponsive'] or
            self.vital_signs.oxygen_saturation < 85):
            return PatientPriority.CRITICAL
        
        # Emergency conditions
        elif (severity_score >= 60 or 
              self.is_ambulance_arrival or
              self.vital_signs.pain_scale >= 8 or
              'chest pain' in self.chief_complaint.lower() or
              'difficulty breathing' in self.chief_complaint.lower()):
            return PatientPriority.EMERGENCY
        
        # Urgent conditions
        elif (severity_score >= 40 or
              self.vital_signs.pain_scale >= 6 or
              self.age > 75 or
              len(self.medical_history) > 3):
            return PatientPriority.URGENT
        
        # Semi-urgent conditions
        elif (severity_score >= 20 or
              self.vital_signs.pain_scale >= 4):
            return PatientPriority.SEMI_URGENT
        
        # Non-urgent
        else:
            return PatientPriority.NON_URGENT
    
    def get_priority_score(self) -> float:
        """Get comprehensive priority score for queue ordering"""
        base_score = self.priority.value * 1000
        
        # Add vital signs severity
        severity_penalty = self.vital_signs.calculate_severity_score()
        base_score -= severity_penalty
        
        # Add waiting time penalty (longer wait = higher priority)
        if isinstance(self.arrival_time, datetime):
            wait_hours = (datetime.now() - self.arrival_time).total_seconds() / 3600
            wait_penalty = min(wait_hours * 10, 100)  # Max 100 point penalty
            base_score -= wait_penalty
        
        # Emergency indicators
        if self.trauma_alert:
            base_score -= 500
        if self.is_ambulance_arrival:
            base_score -= 200
        if self.infectious_disease_alert:
            base_score -= 150
        
        return base_score
    
    def __lt__(self, other):
        return self.get_priority_score() < other.get_priority_score()
    
    def __str__(self):
        return f"Patient({self.patient_id}, {self.full_name}, {self.priority.name})"

class PatientTriagePriorityQueue:
    """Advanced priority queue for patient triage"""
    
    def __init__(self):
        self.heap = []
        self.patient_lookup = {}  # For O(1) patient lookup
        self.index = 0
    
    def add_patient(self, patient: Patient):
        """Add patient to triage queue"""
        priority_score = patient.get_priority_score()
        heapq.heappush(self.heap, (priority_score, self.index, patient))
        self.patient_lookup[patient.patient_id] = patient
        self.index += 1
    
    def get_next_patient(self) -> Optional[Patient]:
        """Get next highest priority patient without removing"""
        while self.heap:
            _, _, patient = self.heap[0]
            if patient.patient_id in self.patient_lookup:
                return patient
            else:
                # Remove stale entry
                heapq.heappop(self.heap)
        return None
    
    def pop_next_patient(self) -> Optional[Patient]:
        """Remove and return next highest priority patient"""
        while self.heap:
            _, _, patient = heapq.heappop(self.heap)
            if patient.patient_id in self.patient_lookup:
                del self.patient_lookup[patient.patient_id]
                return patient
        return None
    
    def remove_patient(self, patient_id: str) -> bool:
        """Remove specific patient from queue (lazy deletion)"""
        if patient_id in self.patient_lookup:
            del self.patient_lookup[patient_id]
            return True
        return False
    
    def update_patient_priority(self, patient_id: str, new_vitals: Dict[str, Any]) -> bool:
        """Update patient's vital signs and recalculate priority"""
        if patient_id in self.patient_lookup:
            patient = self.patient_lookup[patient_id]
            patient.vital_signs = VitalSigns(new_vitals)
            patient.priority = patient._calculate_priority()
            
            # Re-add to queue with new priority
            self.remove_patient(patient_id)
            self.add_patient(patient)
            return True
        return False
    
    def get_queue_statistics(self) -> Dict[str, Any]:
        """Get comprehensive queue statistics"""
        active_patients = list(self.patient_lookup.values())
        
        priority_counts = defaultdict(int)
        total_wait_time = 0
        critical_count = 0
        
        for patient in active_patients:
            priority_counts[patient.priority.name] += 1
            if isinstance(patient.arrival_time, datetime):
                wait_time = (datetime.now() - patient.arrival_time).total_seconds() / 60
                total_wait_time += wait_time
            
            if patient.priority == PatientPriority.CRITICAL:
                critical_count += 1
        
        avg_wait_time = total_wait_time / len(active_patients) if active_patients else 0
        
        return {
            'total_patients': len(active_patients),
            'priority_breakdown': dict(priority_counts),
            'average_wait_time': avg_wait_time,
            'critical_patients': critical_count,
            'longest_waiting': self._get_longest_waiting_patient()
        }
    
    def _get_longest_waiting_patient(self) -> Optional[Dict[str, Any]]:
        """Get patient who has been waiting the longest"""
        longest_wait = 0
        longest_patient = None
        
        for patient in self.patient_lookup.values():
            if isinstance(patient.arrival_time, datetime):
                wait_time = (datetime.now() - patient.arrival_time).total_seconds() / 60
                if wait_time > longest_wait:
                    longest_wait = wait_time
                    longest_patient = patient
        
        if longest_patient:
            return {
                'patient_id': longest_patient.patient_id,
                'name': longest_patient.full_name,
                'wait_time_minutes': longest_wait,
                'priority': longest_patient.priority.name
            }
        return None

class DoctorAssignmentSystem:
    """System for assigning patients to doctors using load balancing"""
    
    def __init__(self):
        self.doctors = {}  # doctor_id -> doctor info
        self.patient_assignments = defaultdict(list)  # doctor_id -> [patients]
    
    def add_doctor(self, doctor_id: str, specialties: List[str], max_patients: int = 5):
        """Add doctor to the system"""
        self.doctors[doctor_id] = {
            'id': doctor_id,
            'specialties': specialties,
            'max_patients': max_patients,
            'current_load': 0,
            'patients_today': 0,
            'average_consultation_time': 20  # minutes
        }
    
    def assign_patient(self, patient: Patient) -> Optional[str]:
        """Assign patient to best available doctor"""
        available_doctors = []
        
        for doctor_id, doctor_info in self.doctors.items():
            if doctor_info['current_load'] < doctor_info['max_patients']:
                # Calculate assignment score
                score = self._calculate_assignment_score(doctor_info, patient)
                available_doctors.append((score, doctor_id))
        
        if available_doctors:
            # Sort by score (lower is better)
            available_doctors.sort()
            best_doctor_id = available_doctors[0][1]
            
            # Assign patient
            self.doctors[best_doctor_id]['current_load'] += 1
            self.patient_assignments[best_doctor_id].append(patient)
            patient.assigned_doctor = best_doctor_id
            
            return best_doctor_id
        
        return None
    
    def _calculate_assignment_score(self, doctor_info: Dict, patient: Patient) -> float:
        """Calculate assignment score (lower = better match)"""
        score = doctor_info['current_load'] * 100
        
        # Priority bonus (critical patients get priority)
        if patient.priority == PatientPriority.CRITICAL:
            score -= 200
        elif patient.priority == PatientPriority.EMERGENCY:
            score -= 100
        
        return score
    
    def complete_consultation(self, doctor_id: str, patient_id: str):
        """Mark consultation as completed"""
        if doctor_id in self.doctors:
            self.doctors[doctor_id]['current_load'] = max(0, 
                self.doctors[doctor_id]['current_load'] - 1)
            self.doctors[doctor_id]['patients_today'] += 1
            
            # Remove from assignments
            self.patient_assignments[doctor_id] = [
                p for p in self.patient_assignments[doctor_id] 
                if p.patient_id != patient_id
            ]
    
    def get_doctor_workload(self) -> Dict[str, Any]:
        """Get current doctor workload distribution"""
        workload_data = {}
        
        for doctor_id, doctor_info in self.doctors.items():
            workload_data[doctor_id] = {
                'current_load': doctor_info['current_load'],
                'max_patients': doctor_info['max_patients'],
                'utilization': (doctor_info['current_load'] / doctor_info['max_patients']) * 100,
                'patients_today': doctor_info['patients_today'],
                'assigned_patients': len(self.patient_assignments[doctor_id])
            }
        
        return workload_data

class PatientAnalytics:
    """Analytics engine for patient management"""
    
    @staticmethod
    def calculate_triage_accuracy(patients: List[Patient]) -> Dict[str, Any]:
        """Calculate triage accuracy metrics"""
        total_patients = len(patients)
        if total_patients == 0:
            return {}
        
        priority_distribution = defaultdict(int)
        for patient in patients:
            priority_distribution[patient.priority.name] += 1
        
        return {
            'total_patients': total_patients,
            'priority_distribution': dict(priority_distribution),
            'critical_percentage': (priority_distribution['CRITICAL'] / total_patients) * 100,
            'emergency_percentage': (priority_distribution['EMERGENCY'] / total_patients) * 100
        }
    
    @staticmethod
    def analyze_wait_times(patients: List[Patient]) -> Dict[str, Any]:
        """Analyze patient wait times"""
        wait_times_by_priority = defaultdict(list)
        
        for patient in patients:
            if isinstance(patient.arrival_time, datetime):
                wait_time = (datetime.now() - patient.arrival_time).total_seconds() / 60
                wait_times_by_priority[patient.priority.name].append(wait_time)
        
        analysis = {}
        for priority, times in wait_times_by_priority.items():
            if times:
                analysis[priority] = {
                    'average_wait': sum(times) / len(times),
                    'max_wait': max(times),
                    'min_wait': min(times),
                    'patient_count': len(times)
                }
        
        return analysis
    
    @staticmethod
    def identify_bottlenecks(patients: List[Patient], doctors_workload: Dict) -> List[Dict[str, Any]]:
        """Identify system bottlenecks"""
        bottlenecks = []
        
        # Check for long wait times
        critical_waiting = [p for p in patients if p.priority == PatientPriority.CRITICAL and p.status == PatientStatus.WAITING]
        if len(critical_waiting) > 2:
            bottlenecks.append({
                'type': 'Critical Patient Backlog',
                'severity': 'High',
                'description': f'{len(critical_waiting)} critical patients waiting',
                'recommendation': 'Immediate attention required - consider calling additional staff'
            })
        
        # Check doctor utilization
        overloaded_doctors = [d for d, info in doctors_workload.items() if info['utilization'] > 90]
        if overloaded_doctors:
            bottlenecks.append({
                'type': 'Doctor Overload',
                'severity': 'Medium',
                'description': f'{len(overloaded_doctors)} doctors at >90% capacity',
                'recommendation': 'Consider redistributing patients or calling backup doctors'
            })
        
        return bottlenecks

class PatientManagementEngine:
    """Main engine for patient management system"""
    
    def __init__(self):
        self.triage_queue = PatientTriagePriorityQueue()
        self.doctor_assignment = DoctorAssignmentSystem()
        self.all_patients = []
        self.analytics = PatientAnalytics()
    
    def initialize_doctors(self):
        """Initialize default doctors"""
        doctors = [
            {'id': 'DR001', 'specialties': ['General Medicine', 'Internal Medicine'], 'max_patients': 6},
            {'id': 'DR002', 'specialties': ['Emergency Medicine', 'Trauma'], 'max_patients': 4},
            {'id': 'DR003', 'specialties': ['Cardiology', 'Internal Medicine'], 'max_patients': 5},
            {'id': 'DR004', 'specialties': ['Pediatrics', 'General Medicine'], 'max_patients': 5},
            {'id': 'DR005', 'specialties': ['Orthopedics', 'Sports Medicine'], 'max_patients': 4}
        ]
        
        for doctor in doctors:
            self.doctor_assignment.add_doctor(
                doctor['id'], 
                doctor['specialties'], 
                doctor['max_patients']
            )
    
    def register_patient(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register new patient and add to triage queue"""
        patient = Patient(patient_data)
        self.all_patients.append(patient)
        self.triage_queue.add_patient(patient)
        
        # Try to assign doctor
        assigned_doctor = self.doctor_assignment.assign_patient(patient)
        
        return {
            'patient_id': patient.patient_id,
            'priority': patient.priority.name,
            'triage_score': patient.get_priority_score(),
            'assigned_doctor': assigned_doctor,
            'estimated_wait_time': self._estimate_wait_time(patient),
            'queue_position': self._get_queue_position(patient)
        }
    
    def _estimate_wait_time(self, patient: Patient) -> int:
        """Estimate wait time for patient in minutes"""
        queue_stats = self.triage_queue.get_queue_statistics()
        base_wait = queue_stats.get('average_wait_time', 30)
        
        # Adjust based on priority
        if patient.priority == PatientPriority.CRITICAL:
            return 0  # Immediate attention
        elif patient.priority == PatientPriority.EMERGENCY:
            return min(base_wait * 0.2, 10)
        elif patient.priority == PatientPriority.URGENT:
            return min(base_wait * 0.5, 30)
        else:
            return int(base_wait)
    
    def _get_queue_position(self, patient: Patient) -> int:
        """Get patient's position in queue"""
        # Simplified calculation - in real implementation, would traverse heap
        queue_stats = self.triage_queue.get_queue_statistics()
        priority_counts = queue_stats.get('priority_breakdown', {})
        
        position = 1
        for priority in ['CRITICAL', 'EMERGENCY', 'URGENT']:
            if patient.priority.name == priority:
                break
            position += priority_counts.get(priority, 0)
        
        return position
    
    def call_next_patient(self) -> Optional[Dict[str, Any]]:
        """Call next patient for consultation"""
        next_patient = self.triage_queue.pop_next_patient()
        
        if next_patient:
            next_patient.status = PatientStatus.IN_CONSULTATION
            
            return {
                'patient_id': next_patient.patient_id,
                'name': next_patient.full_name,
                'priority': next_patient.priority.name,
                'chief_complaint': next_patient.chief_complaint,
                'assigned_doctor': next_patient.assigned_doctor,
                'vital_signs': {
                    'temperature': next_patient.vital_signs.temperature,
                    'blood_pressure': f"{next_patient.vital_signs.blood_pressure_systolic}/{next_patient.vital_signs.blood_pressure_diastolic}",
                    'heart_rate': next_patient.vital_signs.heart_rate,
                    'oxygen_saturation': next_patient.vital_signs.oxygen_saturation
                }
            }
        
        return None
    
    def update_patient_vitals(self, patient_id: str, new_vitals: Dict[str, Any]) -> bool:
        """Update patient's vital signs and recalculate priority"""
        return self.triage_queue.update_patient_priority(patient_id, new_vitals)
    
    def discharge_patient(self, patient_id: str) -> bool:
        """Discharge patient and update doctor workload"""
        for patient in self.all_patients:
            if patient.patient_id == patient_id:
                patient.status = PatientStatus.DISCHARGED
                
                if patient.assigned_doctor:
                    self.doctor_assignment.complete_consultation(
                        patient.assigned_doctor, 
                        patient_id
                    )
                
                return True
        return False
    
    def get_dashboard_data(self) -> Dict[str, Any]:
        """Get comprehensive dashboard data"""
        queue_stats = self.triage_queue.get_queue_statistics()
        doctor_workload = self.doctor_assignment.get_doctor_workload()
        triage_accuracy = self.analytics.calculate_triage_accuracy(self.all_patients)
        wait_time_analysis = self.analytics.analyze_wait_times(self.all_patients)
        bottlenecks = self.analytics.identify_bottlenecks(self.all_patients, doctor_workload)
        
        # Current status distribution
        status_counts = defaultdict(int)
        for patient in self.all_patients:
            status_counts[patient.status.value] += 1
        
        return {
            'queue_statistics': queue_stats,
            'doctor_workload': doctor_workload,
            'triage_accuracy': triage_accuracy,
            'wait_time_analysis': wait_time_analysis,
            'status_distribution': dict(status_counts),
            'bottlenecks': bottlenecks,
            'total_patients_today': len(self.all_patients),
            'active_patients': len([p for p in self.all_patients if p.status in [PatientStatus.WAITING, PatientStatus.IN_CONSULTATION]]),
            'critical_alerts': [
                {
                    'patient_id': p.patient_id,
                    'name': p.full_name,
                    'priority': p.priority.name,
                    'wait_time': (datetime.now() - p.arrival_time).total_seconds() / 60 if isinstance(p.arrival_time, datetime) else 0
                } for p in self.all_patients 
                if p.priority == PatientPriority.CRITICAL and p.status == PatientStatus.WAITING
            ]
        }
