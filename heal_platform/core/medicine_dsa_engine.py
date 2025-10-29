"""
Medicine Management DSA Engine
Advanced data structures for medicine inventory, search, and optimization
"""

import heapq
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict, deque
import json

class Medicine:
    """Medicine data structure with DSA-optimized attributes"""
    
    def __init__(self, medicine_data: Dict[str, Any]):
        self.medicine_id = medicine_data.get('medicineId', '')
        self.name = medicine_data.get('name', '')
        self.generic_name = medicine_data.get('genericName', '')
        self.manufacturer = medicine_data.get('manufacturer', '')
        self.category = medicine_data.get('category', '')
        self.current_stock = medicine_data.get('inventory', {}).get('currentStock', 0)
        self.min_threshold = medicine_data.get('inventory', {}).get('minThreshold', 0)
        self.reorder_level = medicine_data.get('inventory', {}).get('reorderLevel', 0)
        self.cost_price = medicine_data.get('pricing', {}).get('costPrice', 0)
        self.selling_price = medicine_data.get('pricing', {}).get('sellingPrice', 0)
        self.expiry_date = medicine_data.get('expiryInfo', {}).get('expiryDate')
        self.priority = medicine_data.get('priority', 3)
        self.status = medicine_data.get('status', 'Active')
        self.raw_data = medicine_data
    
    def __str__(self):
        return f"Medicine({self.medicine_id}, {self.name}, Stock: {self.current_stock})"
    
    def __lt__(self, other):
        # For priority queue operations (lower priority number = higher priority)
        return self.priority < other.priority

class MedicineInventoryPriorityQueue:
    """Priority Queue for critical medicine management"""
    
    def __init__(self):
        self.heap = []
        self.index = 0
    
    def add_critical_medicine(self, medicine: Medicine):
        """Add medicine to critical priority queue"""
        # Priority based on: stock level, expiry, and medicine priority
        urgency_score = self._calculate_urgency(medicine)
        heapq.heappush(self.heap, (urgency_score, self.index, medicine))
        self.index += 1
    
    def _calculate_urgency(self, medicine: Medicine) -> float:
        """Calculate urgency score (lower = more urgent)"""
        score = 0
        
        # Stock level urgency (0-100)
        if medicine.current_stock == 0:
            score += 0  # Highest urgency
        elif medicine.current_stock <= medicine.min_threshold:
            score += 10
        elif medicine.current_stock <= medicine.reorder_level:
            score += 30
        else:
            score += 100
        
        # Expiry urgency (0-50)
        if medicine.expiry_date:
            if isinstance(medicine.expiry_date, str):
                expiry = datetime.fromisoformat(medicine.expiry_date.replace('Z', '+00:00'))
            else:
                expiry = medicine.expiry_date
            
            days_to_expiry = (expiry - datetime.now()).days
            if days_to_expiry <= 0:
                score += 0  # Expired - highest urgency
            elif days_to_expiry <= 30:
                score += 5
            elif days_to_expiry <= 90:
                score += 20
            else:
                score += 50
        
        # Medicine priority (1-5, where 1 is highest)
        score += medicine.priority * 10
        
        return score
    
    def get_most_critical(self) -> Optional[Medicine]:
        """Get most critical medicine without removing"""
        if self.heap:
            return self.heap[0][2]
        return None
    
    def pop_most_critical(self) -> Optional[Medicine]:
        """Remove and return most critical medicine"""
        if self.heap:
            return heapq.heappop(self.heap)[2]
        return None
    
    def get_all_critical(self) -> List[Medicine]:
        """Get all critical medicines sorted by urgency"""
        return [item[2] for item in sorted(self.heap)]

class MedicineHashTable:
    """Hash table for O(1) medicine lookups"""
    
    def __init__(self, size: int = 1000):
        self.size = size
        self.table = [[] for _ in range(size)]
        self.count = 0
    
    def _hash(self, key: str) -> int:
        """Hash function for medicine IDs and names"""
        return hash(key.lower()) % self.size
    
    def insert(self, medicine: Medicine):
        """Insert medicine with multiple keys for fast lookup"""
        # Insert by medicine ID
        self._insert_key_value(medicine.medicine_id, medicine)
        # Insert by name for name-based searches
        self._insert_key_value(medicine.name.lower(), medicine)
        # Insert by generic name
        self._insert_key_value(medicine.generic_name.lower(), medicine)
    
    def _insert_key_value(self, key: str, medicine: Medicine):
        """Insert key-value pair"""
        index = self._hash(key)
        bucket = self.table[index]
        
        # Check if key exists
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, medicine)
                return
        
        # Add new entry
        bucket.append((key, medicine))
        self.count += 1
    
    def search(self, key: str) -> Optional[Medicine]:
        """Search medicine by ID, name, or generic name"""
        index = self._hash(key.lower())
        bucket = self.table[index]
        
        for k, medicine in bucket:
            if k == key.lower():
                return medicine
        return None
    
    def get_all_medicines(self) -> List[Medicine]:
        """Get all unique medicines"""
        seen = set()
        medicines = []
        
        for bucket in self.table:
            for key, medicine in bucket:
                if medicine.medicine_id not in seen:
                    seen.add(medicine.medicine_id)
                    medicines.append(medicine)
        
        return medicines

class MedicineCategoryTree:
    """Binary Search Tree for category-based organization"""
    
    class TreeNode:
        def __init__(self, category: str):
            self.category = category
            self.medicines = []
            self.left = None
            self.right = None
    
    def __init__(self):
        self.root = None
    
    def insert_medicine(self, medicine: Medicine):
        """Insert medicine into category tree"""
        self.root = self._insert_recursive(self.root, medicine)
    
    def _insert_recursive(self, node, medicine: Medicine):
        if node is None:
            new_node = self.TreeNode(medicine.category)
            new_node.medicines.append(medicine)
            return new_node
        
        if medicine.category < node.category:
            node.left = self._insert_recursive(node.left, medicine)
        elif medicine.category > node.category:
            node.right = self._insert_recursive(node.right, medicine)
        else:
            node.medicines.append(medicine)
        
        return node
    
    def get_category_medicines(self, category: str) -> List[Medicine]:
        """Get all medicines in a category"""
        node = self._search_category(self.root, category)
        return node.medicines if node else []
    
    def _search_category(self, node, category: str):
        if node is None or node.category == category:
            return node
        
        if category < node.category:
            return self._search_category(node.left, category)
        return self._search_category(node.right, category)
    
    def get_all_categories(self) -> List[str]:
        """Get all categories in sorted order"""
        categories = []
        self._inorder_traversal(self.root, categories)
        return categories
    
    def _inorder_traversal(self, node, categories):
        if node:
            self._inorder_traversal(node.left, categories)
            categories.append(node.category)
            self._inorder_traversal(node.right, categories)

class MedicineGraph:
    """Graph for medicine relationships and interactions"""
    
    def __init__(self):
        self.adjacency_list = defaultdict(list)
        self.medicines = {}
    
    def add_medicine(self, medicine: Medicine):
        """Add medicine to graph"""
        self.medicines[medicine.medicine_id] = medicine
    
    def add_interaction(self, medicine1_id: str, medicine2_id: str, interaction_type: str, severity: int):
        """Add drug interaction edge"""
        self.adjacency_list[medicine1_id].append({
            'medicine_id': medicine2_id,
            'interaction_type': interaction_type,
            'severity': severity
        })
        # Add reverse edge for undirected interaction
        self.adjacency_list[medicine2_id].append({
            'medicine_id': medicine1_id,
            'interaction_type': interaction_type,
            'severity': severity
        })
    
    def check_interactions(self, medicine_ids: List[str]) -> List[Dict]:
        """Check for interactions between multiple medicines"""
        interactions = []
        
        for i, med1_id in enumerate(medicine_ids):
            for j, med2_id in enumerate(medicine_ids[i+1:], i+1):
                # Check if there's an interaction
                for interaction in self.adjacency_list.get(med1_id, []):
                    if interaction['medicine_id'] == med2_id:
                        interactions.append({
                            'medicine1': self.medicines.get(med1_id),
                            'medicine2': self.medicines.get(med2_id),
                            'interaction_type': interaction['interaction_type'],
                            'severity': interaction['severity']
                        })
        
        return interactions
    
    def find_alternative_medicines(self, medicine_id: str) -> List[Medicine]:
        """Find alternative medicines using BFS"""
        if medicine_id not in self.medicines:
            return []
        
        target_medicine = self.medicines[medicine_id]
        alternatives = []
        
        # Find medicines in same category with similar properties
        for med_id, medicine in self.medicines.items():
            if (med_id != medicine_id and 
                medicine.category == target_medicine.category and
                medicine.status == 'Active' and
                medicine.current_stock > 0):
                alternatives.append(medicine)
        
        return alternatives

class MedicineAnalytics:
    """Analytics engine for medicine data"""
    
    @staticmethod
    def get_low_stock_medicines(medicines: List[Medicine]) -> List[Medicine]:
        """Get medicines with low stock using linear search"""
        low_stock = []
        for medicine in medicines:
            if medicine.current_stock <= medicine.min_threshold:
                low_stock.append(medicine)
        
        # Sort by urgency (lowest stock first)
        return sorted(low_stock, key=lambda m: m.current_stock)
    
    @staticmethod
    def get_expiring_medicines(medicines: List[Medicine], days: int = 30) -> List[Medicine]:
        """Get medicines expiring within specified days"""
        expiring = []
        cutoff_date = datetime.now() + timedelta(days=days)
        
        for medicine in medicines:
            if medicine.expiry_date:
                if isinstance(medicine.expiry_date, str):
                    expiry = datetime.fromisoformat(medicine.expiry_date.replace('Z', '+00:00'))
                else:
                    expiry = medicine.expiry_date
                
                if expiry <= cutoff_date:
                    expiring.append(medicine)
        
        # Sort by expiry date (earliest first)
        return sorted(expiring, key=lambda m: m.expiry_date)
    
    @staticmethod
    def calculate_inventory_value(medicines: List[Medicine]) -> Dict[str, float]:
        """Calculate total inventory value"""
        total_cost = 0
        total_selling = 0
        
        for medicine in medicines:
            total_cost += medicine.current_stock * medicine.cost_price
            total_selling += medicine.current_stock * medicine.selling_price
        
        return {
            'total_cost_value': total_cost,
            'total_selling_value': total_selling,
            'potential_profit': total_selling - total_cost
        }
    
    @staticmethod
    def get_category_distribution(medicines: List[Medicine]) -> Dict[str, int]:
        """Get distribution of medicines by category"""
        distribution = defaultdict(int)
        
        for medicine in medicines:
            distribution[medicine.category] += medicine.current_stock
        
        return dict(distribution)

class MedicineSearchEngine:
    """Advanced search engine for medicines"""
    
    def __init__(self, medicines: List[Medicine]):
        self.medicines = medicines
        self.hash_table = MedicineHashTable()
        self.category_tree = MedicineCategoryTree()
        
        # Build data structures
        for medicine in medicines:
            self.hash_table.insert(medicine)
            self.category_tree.insert_medicine(medicine)
    
    def exact_search(self, query: str) -> Optional[Medicine]:
        """Exact search using hash table - O(1)"""
        return self.hash_table.search(query)
    
    def fuzzy_search(self, query: str, threshold: float = 0.6) -> List[Tuple[Medicine, float]]:
        """Fuzzy search with similarity scoring"""
        results = []
        query_lower = query.lower()
        
        for medicine in self.medicines:
            # Calculate similarity scores
            name_similarity = self._calculate_similarity(query_lower, medicine.name.lower())
            generic_similarity = self._calculate_similarity(query_lower, medicine.generic_name.lower())
            
            max_similarity = max(name_similarity, generic_similarity)
            
            if max_similarity >= threshold:
                results.append((medicine, max_similarity))
        
        # Sort by similarity (highest first)
        return sorted(results, key=lambda x: x[1], reverse=True)
    
    def _calculate_similarity(self, s1: str, s2: str) -> float:
        """Calculate string similarity using character overlap"""
        if s1 == s2:
            return 1.0
        
        set1, set2 = set(s1), set(s2)
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        
        return intersection / union if union > 0 else 0.0
    
    def category_search(self, category: str) -> List[Medicine]:
        """Search by category using BST - O(log n)"""
        return self.category_tree.get_category_medicines(category)
    
    def advanced_filter(self, filters: Dict[str, Any]) -> List[Medicine]:
        """Advanced filtering with multiple criteria"""
        filtered = self.medicines.copy()
        
        if 'category' in filters:
            filtered = [m for m in filtered if m.category == filters['category']]
        
        if 'min_stock' in filters:
            filtered = [m for m in filtered if m.current_stock >= filters['min_stock']]
        
        if 'max_price' in filters:
            filtered = [m for m in filtered if m.selling_price <= filters['max_price']]
        
        if 'status' in filters:
            filtered = [m for m in filtered if m.status == filters['status']]
        
        if 'manufacturer' in filters:
            filtered = [m for m in filtered if m.manufacturer == filters['manufacturer']]
        
        return filtered

class MedicineManagementEngine:
    """Main engine combining all DSA components"""
    
    def __init__(self):
        self.medicines = []
        self.priority_queue = MedicineInventoryPriorityQueue()
        self.search_engine = None
        self.interaction_graph = MedicineGraph()
        self.analytics = MedicineAnalytics()
    
    def load_medicines(self, medicine_data: List[Dict[str, Any]]):
        """Load medicines and build data structures"""
        self.medicines = [Medicine(data) for data in medicine_data]
        
        # Build search engine
        self.search_engine = MedicineSearchEngine(self.medicines)
        
        # Build priority queue for critical medicines
        for medicine in self.medicines:
            if (medicine.current_stock <= medicine.min_threshold or 
                medicine.current_stock == 0):
                self.priority_queue.add_critical_medicine(medicine)
        
        # Add medicines to interaction graph
        for medicine in self.medicines:
            self.interaction_graph.add_medicine(medicine)
    
    def get_dashboard_data(self) -> Dict[str, Any]:
        """Get comprehensive dashboard data"""
        if not self.medicines:
            return {}
        
        low_stock = self.analytics.get_low_stock_medicines(self.medicines)
        expiring = self.analytics.get_expiring_medicines(self.medicines)
        inventory_value = self.analytics.calculate_inventory_value(self.medicines)
        category_dist = self.analytics.get_category_distribution(self.medicines)
        
        return {
            'total_medicines': len(self.medicines),
            'active_medicines': len([m for m in self.medicines if m.status == 'Active']),
            'low_stock_count': len(low_stock),
            'expiring_count': len(expiring),
            'out_of_stock_count': len([m for m in self.medicines if m.current_stock == 0]),
            'inventory_value': inventory_value,
            'category_distribution': category_dist,
            'critical_medicines': [
                {
                    'medicine_id': m.medicine_id,
                    'name': m.name,
                    'current_stock': m.current_stock,
                    'min_threshold': m.min_threshold,
                    'status': m.status
                } for m in low_stock[:10]  # Top 10 critical
            ],
            'expiring_medicines': [
                {
                    'medicine_id': m.medicine_id,
                    'name': m.name,
                    'expiry_date': m.expiry_date,
                    'current_stock': m.current_stock
                } for m in expiring[:10]  # Top 10 expiring
            ]
        }
    
    def search_medicines(self, query: str, search_type: str = 'fuzzy') -> List[Dict[str, Any]]:
        """Search medicines with different algorithms"""
        if not self.search_engine:
            return []
        
        results = []
        
        if search_type == 'exact':
            medicine = self.search_engine.exact_search(query)
            if medicine:
                results = [medicine]
        elif search_type == 'fuzzy':
            fuzzy_results = self.search_engine.fuzzy_search(query)
            results = [medicine for medicine, score in fuzzy_results]
        
        return [
            {
                'medicine_id': m.medicine_id,
                'name': m.name,
                'generic_name': m.generic_name,
                'category': m.category,
                'current_stock': m.current_stock,
                'selling_price': m.selling_price,
                'status': m.status
            } for m in results
        ]
    
    def get_reorder_recommendations(self) -> List[Dict[str, Any]]:
        """Get medicines that need reordering"""
        reorder_medicines = []
        
        for medicine in self.medicines:
            if medicine.current_stock <= medicine.reorder_level:
                recommended_quantity = medicine.reorder_level * 2  # Simple reorder logic
                reorder_medicines.append({
                    'medicine_id': medicine.medicine_id,
                    'name': medicine.name,
                    'current_stock': medicine.current_stock,
                    'reorder_level': medicine.reorder_level,
                    'recommended_quantity': recommended_quantity,
                    'estimated_cost': recommended_quantity * medicine.cost_price,
                    'priority': medicine.priority
                })
        
        # Sort by priority (highest priority first)
        return sorted(reorder_medicines, key=lambda x: x['priority'])
