import heapq
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass

@dataclass
class Hospital:
    id: str
    name: str
    city: str
    specialties: List[str]
    capacity: int
    current_load: int
    coordinates: Tuple[int, int]
    hospital_type: str

@dataclass
class Connection:
    from_hospital: str
    to_hospital: str
    distance: int
    transport_type: str

class GraphNetworkVisualizer:
    def __init__(self):
        self.hospitals: Dict[str, Hospital] = {}
        self.connections: Dict[str, List[Tuple[str, int]]] = {}
        self.shortest_paths: Dict[str, Dict[str, Tuple[int, List[str]]]] = {}
        
    def add_hospital(self, hospital: Hospital):
        self.hospitals[hospital.id] = hospital
        if hospital.id not in self.connections:
            self.connections[hospital.id] = []
            
    def add_connection(self, from_id: str, to_id: str, distance: int):
        if from_id not in self.connections:
            self.connections[from_id] = []
        if to_id not in self.connections:
            self.connections[to_id] = []
            
        self.connections[from_id].append((to_id, distance))
        self.connections[to_id].append((from_id, distance))
        
    def dijkstra_shortest_path(self, start_id: str) -> Dict[str, Tuple[int, List[str]]]:
        distances = {hospital_id: float('inf') for hospital_id in self.hospitals}
        previous = {hospital_id: None for hospital_id in self.hospitals}
        distances[start_id] = 0
        
        unvisited = [(0, start_id)]
        visited = set()
        
        while unvisited:
            current_distance, current_id = heapq.heappop(unvisited)
            
            if current_id in visited:
                continue
                
            visited.add(current_id)
            
            if current_id in self.connections:
                for neighbor_id, edge_distance in self.connections[current_id]:
                    if neighbor_id not in visited:
                        new_distance = current_distance + edge_distance
                        
                        if new_distance < distances[neighbor_id]:
                            distances[neighbor_id] = new_distance
                            previous[neighbor_id] = current_id
                            heapq.heappush(unvisited, (new_distance, neighbor_id))
        
        paths = {}
        for hospital_id in self.hospitals:
            if distances[hospital_id] != float('inf'):
                path = self._reconstruct_path(previous, start_id, hospital_id)
                paths[hospital_id] = (distances[hospital_id], path)
            else:
                paths[hospital_id] = (float('inf'), [])
                
        return paths
        
    def _reconstruct_path(self, previous: Dict[str, str], start_id: str, end_id: str) -> List[str]:
        path = []
        current = end_id
        
        while current is not None:
            path.append(current)
            current = previous[current]
            
        path.reverse()
        return path if path[0] == start_id else []
        
    def find_shortest_path(self, start_id: str, end_id: str) -> Tuple[int, List[str]]:
        if start_id not in self.shortest_paths:
            self.shortest_paths[start_id] = self.dijkstra_shortest_path(start_id)
            
        return self.shortest_paths[start_id].get(end_id, (float('inf'), []))
        
    def find_nearest_specialty_hospital(self, start_id: str, specialty: str) -> Optional[Tuple[str, int, List[str]]]:
        if start_id not in self.shortest_paths:
            self.shortest_paths[start_id] = self.dijkstra_shortest_path(start_id)
            
        nearest_hospital = None
        min_distance = float('inf')
        best_path = []
        
        for hospital_id, hospital in self.hospitals.items():
            if specialty in hospital.specialties and hospital_id != start_id:
                distance, path = self.shortest_paths[start_id].get(hospital_id, (float('inf'), []))
                if distance < min_distance:
                    min_distance = distance
                    nearest_hospital = hospital_id
                    best_path = path
                    
        if nearest_hospital:
            return (nearest_hospital, min_distance, best_path)
        return None
        
    def get_network_statistics(self) -> Dict[str, int]:
        total_hospitals = len(self.hospitals)
        total_connections = sum(len(connections) for connections in self.connections.values()) // 2
        
        government_hospitals = sum(1 for h in self.hospitals.values() if h.hospital_type == 'government')
        private_hospitals = total_hospitals - government_hospitals
        
        return {
            'total_hospitals': total_hospitals,
            'total_connections': total_connections,
            'government_hospitals': government_hospitals,
            'private_hospitals': private_hospitals
        }

def create_indian_hospital_network():
    network = GraphNetworkVisualizer()
    
    hospitals = [
        Hospital("AIIMS_DEL", "AIIMS Delhi", "New Delhi", ["Cardiology", "Neurology", "Oncology"], 2500, 85, (300, 150), "government"),
        Hospital("PGIMER_CHD", "PGIMER Chandigarh", "Chandigarh", ["Cardiology", "Orthopedics", "Pediatrics"], 1800, 78, (250, 100), "government"),
        Hospital("SGPGI_LKO", "SGPGI Lucknow", "Lucknow", ["Gastroenterology", "Nephrology", "Cardiology"], 1200, 82, (400, 200), "government"),
        Hospital("FORTIS_MUM", "Fortis Mumbai", "Mumbai", ["Oncology", "Cardiology", "Neurology"], 800, 90, (150, 400), "private"),
        Hospital("APOLLO_CHE", "Apollo Chennai", "Chennai", ["Cardiology", "Orthopedics", "Oncology"], 1000, 88, (450, 450), "private"),
        Hospital("NIMHANS_BLR", "NIMHANS Bangalore", "Bangalore", ["Neurology", "Psychiatry", "Neurosurgery"], 700, 75, (350, 400), "government"),
        Hospital("TATA_MUM", "Tata Memorial Mumbai", "Mumbai", ["Oncology", "Hematology"], 600, 95, (180, 380), "government"),
        Hospital("CMC_VEL", "CMC Vellore", "Vellore", ["Cardiology", "Nephrology", "Pediatrics"], 900, 80, (420, 420), "private")
    ]
    
    for hospital in hospitals:
        network.add_hospital(hospital)
    
    connections = [
        ("AIIMS_DEL", "PGIMER_CHD", 250),
        ("AIIMS_DEL", "SGPGI_LKO", 450),
        ("PGIMER_CHD", "SGPGI_LKO", 350),
        ("AIIMS_DEL", "FORTIS_MUM", 1200),
        ("SGPGI_LKO", "FORTIS_MUM", 1100),
        ("FORTIS_MUM", "TATA_MUM", 25),
        ("FORTIS_MUM", "APOLLO_CHE", 1300),
        ("APOLLO_CHE", "CMC_VEL", 140),
        ("APOLLO_CHE", "NIMHANS_BLR", 350),
        ("NIMHANS_BLR", "CMC_VEL", 220),
        ("SGPGI_LKO", "NIMHANS_BLR", 1400),
        ("AIIMS_DEL", "NIMHANS_BLR", 2100)
    ]
    
    for from_id, to_id, distance in connections:
        network.add_connection(from_id, to_id, distance)
    
    return network

def hospital_network_analysis():
    network = create_indian_hospital_network()
    
    print("Indian Hospital Network Analysis - Graph & Dijkstra Implementation")
    print("=" * 75)
    
    stats = network.get_network_statistics()
    print(f"Network Statistics:")
    print(f"Total Hospitals: {stats['total_hospitals']}")
    print(f"Total Connections: {stats['total_connections']}")
    print(f"Government Hospitals: {stats['government_hospitals']}")
    print(f"Private Hospitals: {stats['private_hospitals']}")
    
    print(f"\nHospital Directory:")
    for hospital_id, hospital in network.hospitals.items():
        specialties_str = ", ".join(hospital.specialties[:3])
        print(f"{hospital.name} ({hospital.city}) - {specialties_str} - Load: {hospital.current_load}%")
    
    start_hospital = "AIIMS_DEL"
    print(f"\nShortest Distances from {network.hospitals[start_hospital].name}:")
    print("-" * 60)
    
    paths = network.dijkstra_shortest_path(start_hospital)
    for hospital_id, (distance, path) in paths.items():
        if hospital_id != start_hospital and distance != float('inf'):
            hospital_name = network.hospitals[hospital_id].name
            path_names = " -> ".join([network.hospitals[h_id].name for h_id in path])
            print(f"To {hospital_name}: {distance} km")
            print(f"  Route: {path_names}")
    
    print(f"\nEmergency Specialty Routing from AIIMS Delhi:")
    print("-" * 50)
    
    specialties = ["Oncology", "Neurology", "Cardiology"]
    for specialty in specialties:
        result = network.find_nearest_specialty_hospital(start_hospital, specialty)
        if result:
            nearest_id, distance, path = result
            nearest_hospital = network.hospitals[nearest_id]
            path_names = " -> ".join([network.hospitals[h_id].name for h_id in path])
            print(f"{specialty}: {nearest_hospital.name} ({distance} km)")
            print(f"  Route: {path_names}")
            print(f"  Load: {nearest_hospital.current_load}% | Type: {nearest_hospital.hospital_type}")

def patient_transfer_simulation():
    network = create_indian_hospital_network()
    
    print("\nPatient Transfer Simulation")
    print("=" * 40)
    
    transfer_cases = [
        ("PGIMER_CHD", "TATA_MUM", "Cancer patient requiring specialized oncology treatment"),
        ("FORTIS_MUM", "NIMHANS_BLR", "Neurological emergency requiring neurosurgery"),
        ("CMC_VEL", "AIIMS_DEL", "Complex cardiac case requiring advanced facilities")
    ]
    
    for from_id, to_id, case_description in transfer_cases:
        from_hospital = network.hospitals[from_id]
        to_hospital = network.hospitals[to_id]
        
        distance, path = network.find_shortest_path(from_id, to_id)
        
        print(f"\nCase: {case_description}")
        print(f"From: {from_hospital.name} ({from_hospital.city})")
        print(f"To: {to_hospital.name} ({to_hospital.city})")
        print(f"Distance: {distance} km")
        
        if path:
            path_names = " -> ".join([network.hospitals[h_id].name for h_id in path])
            print(f"Transfer Route: {path_names}")
        else:
            print("No route available!")

if __name__ == "__main__":
    hospital_network_analysis()
    patient_transfer_simulation()
