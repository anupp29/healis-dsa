from collections import deque
from typing import Optional, List
from dataclasses import dataclass

@dataclass
class Appointment:
    id: int
    patient_name: str
    doctor_name: str
    specialty: str
    appointment_time: str
    estimated_duration: int
    status: str
    city: str
    age: int

@dataclass
class MedicalRecord:
    id: int
    patient_name: str
    record_type: str
    title: str
    description: str
    doctor: str
    date: str
    priority: str
    city: str

class QueueFlowVisualizer:
    def __init__(self):
        self.queue = deque()
        self.current_patient: Optional[Appointment] = None
        self.completed_patients: List[Appointment] = []
        self.processing_time = 0
        
    def enqueue(self, appointment: Appointment):
        self.queue.append(appointment)
        
    def dequeue(self) -> Optional[Appointment]:
        if self.queue:
            return self.queue.popleft()
        return None
        
    def peek(self) -> Optional[Appointment]:
        if self.queue:
            return self.queue[0]
        return None
        
    def is_empty(self) -> bool:
        return len(self.queue) == 0
        
    def size(self) -> int:
        return len(self.queue)
        
    def process_next_patient(self):
        if not self.is_empty():
            self.current_patient = self.dequeue()
            self.current_patient.status = "in-progress"
            self.processing_time = self.current_patient.estimated_duration
            
    def complete_current_patient(self):
        if self.current_patient:
            self.current_patient.status = "completed"
            self.completed_patients.append(self.current_patient)
            self.current_patient = None
            self.processing_time = 0

class StackRecordsVisualizer:
    def __init__(self):
        self.stack: List[MedicalRecord] = []
        self.current_record: Optional[MedicalRecord] = None
        self.accessed_records: List[MedicalRecord] = []
        
    def push(self, record: MedicalRecord):
        self.stack.append(record)
        
    def pop(self) -> Optional[MedicalRecord]:
        if self.stack:
            return self.stack.pop()
        return None
        
    def peek(self) -> Optional[MedicalRecord]:
        if self.stack:
            return self.stack[-1]
        return None
        
    def is_empty(self) -> bool:
        return len(self.stack) == 0
        
    def size(self) -> int:
        return len(self.stack)
        
    def access_latest_record(self):
        if not self.is_empty():
            self.current_record = self.pop()
            self.accessed_records.append(self.current_record)
            
    def return_record(self):
        if self.current_record:
            self.push(self.current_record)
            self.current_record = None

def create_sample_appointments():
    return [
        Appointment(1, "Rajesh Kumar", "Dr. Sharma", "Cardiology", "09:00", 15, "waiting", "Mumbai", 45),
        Appointment(2, "Priya Nair", "Dr. Patel", "Dermatology", "09:15", 10, "waiting", "Kochi", 32),
        Appointment(3, "Amit Singh", "Dr. Gupta", "Orthopedics", "09:30", 20, "waiting", "Delhi", 28),
        Appointment(4, "Sunita Devi", "Dr. Reddy", "Pediatrics", "09:45", 12, "waiting", "Hyderabad", 35),
        Appointment(5, "Vikram Joshi", "Dr. Iyer", "Neurology", "10:00", 25, "waiting", "Pune", 52)
    ]

def create_sample_records():
    return [
        MedicalRecord(1, "Rajesh Kumar", "consultation", "Cardiac Checkup", "Regular heart examination, ECG normal", "Dr. Sharma", "2024-10-28", "high", "Mumbai"),
        MedicalRecord(2, "Priya Nair", "prescription", "Diabetes Medication", "Metformin 500mg twice daily", "Dr. Patel", "2024-10-27", "medium", "Kochi"),
        MedicalRecord(3, "Amit Singh", "lab-result", "Blood Test Results", "Complete Blood Count - Normal ranges", "Dr. Gupta", "2024-10-26", "low", "Delhi"),
        MedicalRecord(4, "Sunita Devi", "consultation", "Pediatric Checkup", "Routine vaccination and growth assessment", "Dr. Reddy", "2024-10-25", "medium", "Hyderabad"),
        MedicalRecord(5, "Vikram Joshi", "prescription", "Pain Management", "Ibuprofen 400mg for chronic back pain", "Dr. Iyer", "2024-10-24", "high", "Pune")
    ]

def appointment_queue_system():
    queue_system = QueueFlowVisualizer()
    appointments = create_sample_appointments()
    
    print("Hospital Appointment Queue System - FIFO Implementation")
    print("=" * 65)
    
    for appointment in appointments:
        queue_system.enqueue(appointment)
        print(f"Scheduled: {appointment.patient_name} - {appointment.specialty} at {appointment.appointment_time}")
    
    print(f"\nQueue Status:")
    print(f"Total Appointments: {queue_system.size()}")
    print(f"Next Patient: {queue_system.peek().patient_name if queue_system.peek() else 'None'}")
    
    print(f"\nProcessing Appointments:")
    while not queue_system.is_empty():
        queue_system.process_next_patient()
        current = queue_system.current_patient
        print(f"Now Treating: {current.patient_name} ({current.specialty}) - Duration: {current.estimated_duration} min")
        
        queue_system.complete_current_patient()
        print(f"Completed: {current.patient_name}")
        print(f"Remaining in Queue: {queue_system.size()}")
        print("-" * 40)
    
    print(f"All appointments completed!")
    print(f"Total Patients Treated: {len(queue_system.completed_patients)}")

def medical_records_stack_system():
    stack_system = StackRecordsVisualizer()
    records = create_sample_records()
    
    print("Medical Records Stack System - LIFO Implementation")
    print("=" * 60)
    
    for record in records:
        stack_system.push(record)
        print(f"Filed: {record.patient_name} - {record.title} ({record.record_type})")
    
    print(f"\nStack Status:")
    print(f"Total Records: {stack_system.size()}")
    print(f"Top Record: {stack_system.peek().patient_name if stack_system.peek() else 'None'}")
    
    print(f"\nAccessing Records (LIFO order):")
    while not stack_system.is_empty():
        stack_system.access_latest_record()
        current = stack_system.current_record
        print(f"Accessing: {current.patient_name} - {current.title}")
        print(f"  Type: {current.record_type} | Priority: {current.priority} | Date: {current.date}")
        print(f"  Description: {current.description}")
        
        print(f"Remaining Records: {stack_system.size()}")
        print("-" * 50)
    
    print(f"All records accessed!")
    print(f"Total Records Processed: {len(stack_system.accessed_records)}")

def queue_vs_stack_comparison():
    print("Queue vs Stack Comparison in Healthcare")
    print("=" * 50)
    
    print("QUEUE (FIFO) - Appointment Scheduling:")
    print("- First patient scheduled gets treated first")
    print("- Fair and orderly patient flow")
    print("- Prevents queue jumping")
    print("- Ideal for non-emergency appointments")
    
    print("\nSTACK (LIFO) - Medical Records:")
    print("- Most recent record accessed first")
    print("- Quick access to latest patient data")
    print("- Efficient for recent case reviews")
    print("- Natural for chronological record keeping")

if __name__ == "__main__":
    appointment_queue_system()
    print("\n" + "=" * 70 + "\n")
    medical_records_stack_system()
    print("\n" + "=" * 70 + "\n")
    queue_vs_stack_comparison()
