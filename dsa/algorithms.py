"""
Algorithms Implementation for Healthcare Data Processing
"""
from typing import List, Dict, Any, Callable, Optional
from datetime import datetime, timedelta
import math
from .data_structures import Patient, Appointment

class SortingAlgorithms:
    """Various sorting algorithms for healthcare data"""
    
    @staticmethod
    def quick_sort(arr: List[Any], key_func: Callable = None, reverse: bool = False) -> List[Any]:
        """Quick Sort implementation"""
        if len(arr) <= 1:
            return arr
        
        if key_func is None:
            key_func = lambda x: x
        
        pivot = arr[len(arr) // 2]
        pivot_key = key_func(pivot)
        
        if reverse:
            left = [x for x in arr if key_func(x) > pivot_key]
            middle = [x for x in arr if key_func(x) == pivot_key]
            right = [x for x in arr if key_func(x) < pivot_key]
        else:
            left = [x for x in arr if key_func(x) < pivot_key]
            middle = [x for x in arr if key_func(x) == pivot_key]
            right = [x for x in arr if key_func(x) > pivot_key]
        
        return (SortingAlgorithms.quick_sort(left, key_func, reverse) + 
                middle + 
                SortingAlgorithms.quick_sort(right, key_func, reverse))
    
    @staticmethod
    def merge_sort(arr: List[Any], key_func: Callable = None, reverse: bool = False) -> List[Any]:
        """Merge Sort implementation"""
        if len(arr) <= 1:
            return arr
        
        if key_func is None:
            key_func = lambda x: x
        
        mid = len(arr) // 2
        left = SortingAlgorithms.merge_sort(arr[:mid], key_func, reverse)
        right = SortingAlgorithms.merge_sort(arr[mid:], key_func, reverse)
        
        return SortingAlgorithms._merge(left, right, key_func, reverse)
    
    @staticmethod
    def _merge(left: List[Any], right: List[Any], key_func: Callable, reverse: bool) -> List[Any]:
        """Helper function for merge sort"""
        result = []
        i = j = 0
        
        while i < len(left) and j < len(right):
            left_key = key_func(left[i])
            right_key = key_func(right[j])
            
            if (left_key <= right_key) != reverse:
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1
        
        result.extend(left[i:])
        result.extend(right[j:])
        return result
    
    @staticmethod
    def heap_sort(arr: List[Any], key_func: Callable = None, reverse: bool = False) -> List[Any]:
        """Heap Sort implementation"""
        if key_func is None:
            key_func = lambda x: x
        
        def heapify(arr, n, i):
            largest = i
            left = 2 * i + 1
            right = 2 * i + 2
            
            if left < n:
                left_key = key_func(arr[left])
                largest_key = key_func(arr[largest])
                if (left_key > largest_key) != reverse:
                    largest = left
            
            if right < n:
                right_key = key_func(arr[right])
                largest_key = key_func(arr[largest])
                if (right_key > largest_key) != reverse:
                    largest = right
            
            if largest != i:
                arr[i], arr[largest] = arr[largest], arr[i]
                heapify(arr, n, largest)
        
        arr = arr.copy()  # Don't modify original
        n = len(arr)
        
        # Build heap
        for i in range(n // 2 - 1, -1, -1):
            heapify(arr, n, i)
        
        # Extract elements
        for i in range(n - 1, 0, -1):
            arr[0], arr[i] = arr[i], arr[0]
            heapify(arr, i, 0)
        
        return arr

class SearchAlgorithms:
    """Various search algorithms for healthcare data"""
    
    @staticmethod
    def linear_search(arr: List[Any], target: Any, key_func: Callable = None) -> int:
        """Linear Search implementation"""
        if key_func is None:
            key_func = lambda x: x
        
        for i, item in enumerate(arr):
            if key_func(item) == target:
                return i
        return -1
    
    @staticmethod
    def binary_search(arr: List[Any], target: Any, key_func: Callable = None) -> int:
        """Binary Search implementation (requires sorted array)"""
        if key_func is None:
            key_func = lambda x: x
        
        left, right = 0, len(arr) - 1
        
        while left <= right:
            mid = (left + right) // 2
            mid_val = key_func(arr[mid])
            
            if mid_val == target:
                return mid
            elif mid_val < target:
                left = mid + 1
            else:
                right = mid - 1
        
        return -1
    
    @staticmethod
    def fuzzy_search(arr: List[Any], target: str, key_func: Callable = None, threshold: float = 0.6) -> List[tuple]:
        """Fuzzy search using simple string similarity"""
        if key_func is None:
            key_func = lambda x: str(x)
        
        def similarity(s1: str, s2: str) -> float:
            """Calculate similarity between two strings"""
            s1, s2 = s1.lower(), s2.lower()
            if s1 == s2:
                return 1.0
            
            # Simple character overlap similarity
            set1, set2 = set(s1), set(s2)
            intersection = len(set1.intersection(set2))
            union = len(set1.union(set2))
            
            return intersection / union if union > 0 else 0.0
        
        results = []
        target = target.lower()
        
        for i, item in enumerate(arr):
            item_str = key_func(item).lower()
            sim = similarity(item_str, target)
            
            if sim >= threshold:
                results.append((i, item, sim))
        
        # Sort by similarity (highest first)
        results.sort(key=lambda x: x[2], reverse=True)
        return results

class HealthcareAnalytics:
    """Healthcare-specific algorithms and analytics"""
    
    @staticmethod
    def calculate_age(birth_date: datetime) -> int:
        """Calculate age from birth date"""
        today = datetime.now()
        return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    
    @staticmethod
    def find_upcoming_appointments(appointments: List[Appointment], days_ahead: int = 7) -> List[Appointment]:
        """Find appointments in the next N days"""
        today = datetime.now()
        future_date = today + timedelta(days=days_ahead)
        
        upcoming = []
        for appointment in appointments:
            if isinstance(appointment.appointment_date, datetime):
                if today <= appointment.appointment_date <= future_date:
                    upcoming.append(appointment)
        
        # Sort by appointment date
        return SortingAlgorithms.quick_sort(
            upcoming, 
            key_func=lambda x: x.appointment_date
        )
    
    @staticmethod
    def group_patients_by_age_range(patients: List[Patient]) -> Dict[str, List[Patient]]:
        """Group patients by age ranges"""
        age_groups = {
            '0-18': [],
            '19-35': [],
            '36-50': [],
            '51-65': [],
            '65+': []
        }
        
        for patient in patients:
            if isinstance(patient.dob, datetime):
                age = HealthcareAnalytics.calculate_age(patient.dob)
                
                if age <= 18:
                    age_groups['0-18'].append(patient)
                elif age <= 35:
                    age_groups['19-35'].append(patient)
                elif age <= 50:
                    age_groups['36-50'].append(patient)
                elif age <= 65:
                    age_groups['51-65'].append(patient)
                else:
                    age_groups['65+'].append(patient)
        
        return age_groups
    
    @staticmethod
    def find_frequent_patients(appointments: List[Appointment], min_visits: int = 3) -> Dict[str, int]:
        """Find patients with frequent visits"""
        patient_counts = {}
        
        for appointment in appointments:
            patient_id = appointment.patient_id
            patient_counts[patient_id] = patient_counts.get(patient_id, 0) + 1
        
        # Filter patients with minimum visits
        frequent_patients = {
            patient_id: count 
            for patient_id, count in patient_counts.items() 
            if count >= min_visits
        }
        
        return dict(sorted(frequent_patients.items(), key=lambda x: x[1], reverse=True))
    
    @staticmethod
    def appointment_load_analysis(appointments: List[Appointment]) -> Dict[str, Any]:
        """Analyze appointment load by doctor and time"""
        doctor_load = {}
        time_slots = {}
        status_counts = {}
        
        for appointment in appointments:
            # Doctor load
            doctor = appointment.doctor_name
            doctor_load[doctor] = doctor_load.get(doctor, 0) + 1
            
            # Time slot analysis
            time_slot = appointment.appointment_time
            time_slots[time_slot] = time_slots.get(time_slot, 0) + 1
            
            # Status analysis
            status = appointment.status
            status_counts[status] = status_counts.get(status, 0) + 1
        
        return {
            'doctor_load': dict(sorted(doctor_load.items(), key=lambda x: x[1], reverse=True)),
            'popular_time_slots': dict(sorted(time_slots.items(), key=lambda x: x[1], reverse=True)),
            'appointment_status': status_counts
        }
    
    @staticmethod
    def detect_appointment_conflicts(appointments: List[Appointment]) -> List[List[Appointment]]:
        """Detect conflicting appointments (same doctor, same time)"""
        conflicts = []
        
        # Group by doctor and date
        doctor_schedule = {}
        
        for appointment in appointments:
            key = f"{appointment.doctor_name}_{appointment.appointment_date}_{appointment.appointment_time}"
            
            if key not in doctor_schedule:
                doctor_schedule[key] = []
            doctor_schedule[key].append(appointment)
        
        # Find conflicts (more than one appointment at same time)
        for key, appointments_list in doctor_schedule.items():
            if len(appointments_list) > 1:
                conflicts.append(appointments_list)
        
        return conflicts

class GraphAlgorithms:
    """Graph algorithms for healthcare relationship analysis"""
    
    @staticmethod
    def dijkstra_shortest_path(graph: Dict[str, List[tuple]], start: str, end: str) -> tuple:
        """Find shortest path between two nodes using Dijkstra's algorithm"""
        import heapq
        
        distances = {node: float('infinity') for node in graph}
        distances[start] = 0
        previous = {}
        pq = [(0, start)]
        visited = set()
        
        while pq:
            current_distance, current = heapq.heappop(pq)
            
            if current in visited:
                continue
            
            visited.add(current)
            
            if current == end:
                break
            
            for neighbor, weight in graph.get(current, []):
                distance = current_distance + weight
                
                if distance < distances[neighbor]:
                    distances[neighbor] = distance
                    previous[neighbor] = current
                    heapq.heappush(pq, (distance, neighbor))
        
        # Reconstruct path
        path = []
        current = end
        while current in previous:
            path.append(current)
            current = previous[current]
        path.append(start)
        path.reverse()
        
        return path, distances[end]
