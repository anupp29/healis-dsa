"""
Data Structures Implementation for Healthcare Data
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
import heapq
from collections import defaultdict, deque

class Patient:
    """Patient data structure with healthcare-specific attributes"""
    
    def __init__(self, patient_data: Dict[str, Any]):
        self.patient_id = patient_data.get('patientId', '')
        self.full_name = patient_data.get('fullName', '')
        self.email = patient_data.get('email', '')
        self.phone = patient_data.get('phoneNumber', '')
        self.dob = patient_data.get('dateOfBirth')
        self.gender = patient_data.get('gender', '')
        self.created_at = patient_data.get('createdAt', datetime.now())
        self.raw_data = patient_data
        
    def __str__(self):
        return f"Patient({self.patient_id}, {self.full_name})"
    
    def __repr__(self):
        return self.__str__()

class Appointment:
    """Appointment data structure"""
    
    def __init__(self, appointment_data: Dict[str, Any]):
        self.id = str(appointment_data.get('_id', ''))
        self.patient_id = appointment_data.get('patient', {}).get('userId', '')
        self.patient_name = appointment_data.get('patient', {}).get('fullName', '')
        self.doctor_name = appointment_data.get('doctor', {}).get('name', '')
        self.specialty = appointment_data.get('doctor', {}).get('specialty', '')
        self.appointment_date = appointment_data.get('appointmentDate')
        self.appointment_time = appointment_data.get('appointmentTime', '')
        self.status = appointment_data.get('status', 'Scheduled')
        self.created_at = appointment_data.get('createdAt', datetime.now())
        self.raw_data = appointment_data
        
    def __str__(self):
        return f"Appointment({self.patient_name}, {self.doctor_name}, {self.appointment_date})"

class PriorityQueue:
    """Priority Queue for managing urgent appointments/tasks"""
    
    def __init__(self):
        self.heap = []
        self.index = 0
    
    def push(self, item: Any, priority: int):
        """Add item with priority (lower number = higher priority)"""
        heapq.heappush(self.heap, (priority, self.index, item))
        self.index += 1
    
    def pop(self) -> Any:
        """Remove and return highest priority item"""
        if self.heap:
            return heapq.heappop(self.heap)[2]
        return None
    
    def peek(self) -> Any:
        """Return highest priority item without removing"""
        if self.heap:
            return self.heap[0][2]
        return None
    
    def is_empty(self) -> bool:
        return len(self.heap) == 0
    
    def size(self) -> int:
        return len(self.heap)

class HealthcareGraph:
    """Graph structure for representing relationships in healthcare data"""
    
    def __init__(self):
        self.adjacency_list = defaultdict(list)
        self.nodes = set()
    
    def add_node(self, node: str):
        """Add a node to the graph"""
        self.nodes.add(node)
    
    def add_edge(self, from_node: str, to_node: str, weight: float = 1.0):
        """Add an edge between two nodes"""
        self.nodes.add(from_node)
        self.nodes.add(to_node)
        self.adjacency_list[from_node].append((to_node, weight))
    
    def get_neighbors(self, node: str) -> List[tuple]:
        """Get all neighbors of a node"""
        return self.adjacency_list.get(node, [])
    
    def bfs(self, start_node: str) -> List[str]:
        """Breadth-First Search traversal"""
        if start_node not in self.nodes:
            return []
        
        visited = set()
        queue = deque([start_node])
        result = []
        
        while queue:
            node = queue.popleft()
            if node not in visited:
                visited.add(node)
                result.append(node)
                
                for neighbor, _ in self.get_neighbors(node):
                    if neighbor not in visited:
                        queue.append(neighbor)
        
        return result
    
    def dfs(self, start_node: str) -> List[str]:
        """Depth-First Search traversal"""
        if start_node not in self.nodes:
            return []
        
        visited = set()
        result = []
        
        def dfs_recursive(node):
            visited.add(node)
            result.append(node)
            
            for neighbor, _ in self.get_neighbors(node):
                if neighbor not in visited:
                    dfs_recursive(neighbor)
        
        dfs_recursive(start_node)
        return result

class HashTable:
    """Hash table for fast patient/appointment lookups"""
    
    def __init__(self, size: int = 1000):
        self.size = size
        self.table = [[] for _ in range(size)]
    
    def _hash(self, key: str) -> int:
        """Simple hash function"""
        return hash(key) % self.size
    
    def insert(self, key: str, value: Any):
        """Insert key-value pair"""
        index = self._hash(key)
        bucket = self.table[index]
        
        # Update if key exists
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)
                return
        
        # Add new key-value pair
        bucket.append((key, value))
    
    def get(self, key: str) -> Any:
        """Get value by key"""
        index = self._hash(key)
        bucket = self.table[index]
        
        for k, v in bucket:
            if k == key:
                return v
        
        return None
    
    def delete(self, key: str) -> bool:
        """Delete key-value pair"""
        index = self._hash(key)
        bucket = self.table[index]
        
        for i, (k, v) in enumerate(bucket):
            if k == key:
                del bucket[i]
                return True
        
        return False
    
    def keys(self) -> List[str]:
        """Get all keys"""
        keys = []
        for bucket in self.table:
            for k, v in bucket:
                keys.append(k)
        return keys

class BinarySearchTree:
    """Binary Search Tree for ordered data operations"""
    
    class TreeNode:
        def __init__(self, key: Any, value: Any):
            self.key = key
            self.value = value
            self.left = None
            self.right = None
    
    def __init__(self):
        self.root = None
    
    def insert(self, key: Any, value: Any):
        """Insert key-value pair"""
        self.root = self._insert_recursive(self.root, key, value)
    
    def _insert_recursive(self, node, key, value):
        if node is None:
            return self.TreeNode(key, value)
        
        if key < node.key:
            node.left = self._insert_recursive(node.left, key, value)
        elif key > node.key:
            node.right = self._insert_recursive(node.right, key, value)
        else:
            node.value = value  # Update existing key
        
        return node
    
    def search(self, key: Any) -> Any:
        """Search for a key"""
        return self._search_recursive(self.root, key)
    
    def _search_recursive(self, node, key):
        if node is None or node.key == key:
            return node.value if node else None
        
        if key < node.key:
            return self._search_recursive(node.left, key)
        return self._search_recursive(node.right, key)
    
    def inorder_traversal(self) -> List[tuple]:
        """In-order traversal (sorted order)"""
        result = []
        self._inorder_recursive(self.root, result)
        return result
    
    def _inorder_recursive(self, node, result):
        if node:
            self._inorder_recursive(node.left, result)
            result.append((node.key, node.value))
            self._inorder_recursive(node.right, result)
