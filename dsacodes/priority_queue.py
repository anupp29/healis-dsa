import heapq
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class Patient:
    id: int
    name: str
    condition: str
    priority: int
    severity: str
    age: int
    city: str
    
    def __lt__(self, other):
        return self.priority < other.priority

class PriorityQueueVisualizer:
    def __init__(self):
        self.heap = []
        self.processed_patients = []
        
    def insert_patient(self, patient: Patient):
        heapq.heappush(self.heap, patient)
        
    def extract_min(self) -> Optional[Patient]:
        if not self.heap:
            return None
        return heapq.heappop(self.heap)
        
    def peek(self) -> Optional[Patient]:
        return self.heap[0] if self.heap else None
        
    def is_empty(self) -> bool:
        return len(self.heap) == 0
        
    def size(self) -> int:
        return len(self.heap)
        
    def heapify_up(self, arr: List[Patient], index: int):
        if index == 0:
            return
        parent_index = (index - 1) // 2
        if arr[parent_index].priority > arr[index].priority:
            arr[parent_index], arr[index] = arr[index], arr[parent_index]
            self.heapify_up(arr, parent_index)
            
    def heapify_down(self, arr: List[Patient], index: int):
        left_child = 2 * index + 1
        right_child = 2 * index + 2
        smallest = index
        
        if left_child < len(arr) and arr[left_child].priority < arr[smallest].priority:
            smallest = left_child
            
        if right_child < len(arr) and arr[right_child].priority < arr[smallest].priority:
            smallest = right_child
            
        if smallest != index:
            arr[index], arr[smallest] = arr[smallest], arr[index]
            self.heapify_down(arr, smallest)
            
    def build_heap(self, patients: List[Patient]) -> List[Patient]:
        heap = patients.copy()
        for i in range(len(heap) // 2 - 1, -1, -1):
            self.heapify_down(heap, i)
        return heap
        
    def is_valid_heap(self, heap: List[Patient]) -> bool:
        for i in range(len(heap)):
            left_child = 2 * i + 1
            right_child = 2 * i + 2
            
            if left_child < len(heap) and heap[i].priority > heap[left_child].priority:
                return False
            if right_child < len(heap) and heap[i].priority > heap[right_child].priority:
                return False
        return True

def create_sample_patients():
    return [
        Patient(1, "Rajesh Kumar", "Chest Pain", 9, "critical", 45, "Mumbai"),
        Patient(2, "Priya Sharma", "Severe Headache", 7, "urgent", 32, "Delhi"),
        Patient(3, "Amit Patel", "High Fever", 6, "urgent", 28, "Ahmedabad"),
        Patient(4, "Sunita Devi", "Breathing Issues", 8, "critical", 67, "Patna"),
        Patient(5, "Vikram Singh", "Broken Arm", 4, "moderate", 25, "Jaipur")
    ]

def emergency_triage_system():
    pq = PriorityQueueVisualizer()
    patients = create_sample_patients()
    
    print("Emergency Triage System - Priority Queue Implementation")
    print("=" * 60)
    
    for patient in patients:
        pq.insert_patient(patient)
        print(f"Added: {patient.name} - Priority: {patient.priority}")
    
    print(f"\nHeap is valid: {pq.is_valid_heap(pq.heap)}")
    print(f"Total patients in queue: {pq.size()}")
    
    print("\nProcessing patients by priority:")
    while not pq.is_empty():
        patient = pq.extract_min()
        print(f"Treating: {patient.name} ({patient.condition}) - Priority: {patient.priority}")
        pq.processed_patients.append(patient)

if __name__ == "__main__":
    emergency_triage_system()
