from typing import List, Optional, Tuple
from dataclasses import dataclass

@dataclass
class HashEntry:
    key: str
    value: str
    
class HashTable:
    def __init__(self, size: int = 10):
        self.size = size
        self.table: List[Optional[List[HashEntry]]] = [None] * size
        self.total_entries = 0
        self.collisions = 0
        
    def _hash_function(self, key: str) -> int:
        hash_value = 0
        for char in key:
            hash_value = (hash_value * 31 + ord(char)) % self.size
        return hash_value
        
    def insert(self, key: str, value: str) -> bool:
        index = self._hash_function(key)
        
        if self.table[index] is None:
            self.table[index] = []
        else:
            self.collisions += 1
            
        for entry in self.table[index]:
            if entry.key == key:
                entry.value = value
                return True
                
        self.table[index].append(HashEntry(key, value))
        self.total_entries += 1
        return True
        
    def search(self, key: str) -> Optional[str]:
        index = self._hash_function(key)
        
        if self.table[index] is None:
            return None
            
        for entry in self.table[index]:
            if entry.key == key:
                return entry.value
                
        return None
        
    def delete(self, key: str) -> bool:
        index = self._hash_function(key)
        
        if self.table[index] is None:
            return False
            
        for i, entry in enumerate(self.table[index]):
            if entry.key == key:
                del self.table[index][i]
                self.total_entries -= 1
                if not self.table[index]:
                    self.table[index] = None
                return True
                
        return False
        
    def get_load_factor(self) -> float:
        return self.total_entries / self.size
        
    def get_collision_rate(self) -> float:
        return self.collisions / max(1, self.total_entries)
        
    def display_table(self):
        for i in range(self.size):
            print(f"Bucket {i}: ", end="")
            if self.table[i] is None:
                print("Empty")
            else:
                entries = [f"{entry.key}: {entry.value}" for entry in self.table[i]]
                print(" -> ".join(entries))
                
    def get_all_entries(self) -> List[Tuple[str, str]]:
        entries = []
        for bucket in self.table:
            if bucket:
                for entry in bucket:
                    entries.append((entry.key, entry.value))
        return entries
        
    def resize(self, new_size: int):
        old_entries = self.get_all_entries()
        self.__init__(new_size)
        
        for key, value in old_entries:
            self.insert(key, value)

def patient_database_system():
    hash_table = HashTable(10)
    
    patient_records = [
        ("P001", "Rajesh Kumar - Cardiology - Dr. Sharma - Mumbai"),
        ("P002", "Priya Nair - Dermatology - Dr. Patel - Kochi"),
        ("P003", "Amit Singh - Orthopedics - Dr. Gupta - Delhi"),
        ("P004", "Sunita Devi - Pediatrics - Dr. Reddy - Hyderabad"),
        ("P005", "Vikram Singh - Neurology - Dr. Joshi - Pune"),
        ("P006", "Meera Agarwal - Gynecology - Dr. Iyer - Chennai"),
        ("P007", "Ravi Verma - Emergency - Dr. Khan - Lucknow"),
        ("P008", "Kavya Menon - ENT - Dr. Das - Kolkata")
    ]
    
    print("Patient Database System - Hash Table Implementation")
    print("=" * 60)
    
    for patient_id, record in patient_records:
        hash_table.insert(patient_id, record)
        print(f"Added: {patient_id} -> {record}")
    
    print(f"\nHash Table Statistics:")
    print(f"Total Entries: {hash_table.total_entries}")
    print(f"Collisions: {hash_table.collisions}")
    print(f"Load Factor: {hash_table.get_load_factor():.2f}")
    print(f"Collision Rate: {hash_table.get_collision_rate():.2f}")
    
    print(f"\nHash Table Structure:")
    hash_table.display_table()
    
    search_ids = ["P003", "P010", "P005"]
    print(f"\nSearching for Patient Records:")
    for patient_id in search_ids:
        record = hash_table.search(patient_id)
        if record:
            print(f"{patient_id}: {record}")
        else:
            print(f"{patient_id}: Not Found")
    
    print(f"\nDeleting Patient P002...")
    deleted = hash_table.delete("P002")
    print(f"Deletion {'Successful' if deleted else 'Failed'}")
    
    print(f"\nUpdated Hash Table:")
    hash_table.display_table()

if __name__ == "__main__":
    patient_database_system()
