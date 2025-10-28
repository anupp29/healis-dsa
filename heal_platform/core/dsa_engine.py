"""
HEAL Platform - Core DSA Engine
The intelligent backbone that powers all data operations and state transitions
"""
import asyncio
import time
import threading
from typing import Any, List, Dict, Optional, Callable, Generator
from dataclasses import dataclass, field
from enum import Enum
from collections import deque, defaultdict
import heapq
import json
from datetime import datetime

class OperationType(Enum):
    """Types of DSA operations for visualization"""
    INSERT = "insert"
    DELETE = "delete"
    SEARCH = "search"
    SORT = "sort"
    TRAVERSE = "traverse"
    COMPARE = "compare"
    SWAP = "swap"
    MERGE = "merge"
    SPLIT = "split"
    PUSH = "push"
    POP = "pop"
    ENQUEUE = "enqueue"
    DEQUEUE = "dequeue"

@dataclass
class OperationStep:
    """Represents a single step in a DSA operation"""
    operation: OperationType
    timestamp: float
    data: Dict[str, Any]
    indices: List[int] = field(default_factory=list)
    values: List[Any] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'operation': self.operation.value,
            'timestamp': self.timestamp,
            'data': self.data,
            'indices': self.indices,
            'values': self.values,
            'metadata': self.metadata
        }

class DSAVisualizationEngine:
    """Core engine that makes DSA operations observable and visualizable"""
    
    def __init__(self):
        self.observers: List[Callable] = []
        self.operation_history: List[OperationStep] = []
        self.current_state: Dict[str, Any] = {}
        self.is_recording = True
        self.animation_speed = 1.0
        
    def add_observer(self, callback: Callable[[OperationStep], None]):
        """Add observer for real-time visualization updates"""
        self.observers.append(callback)
    
    def remove_observer(self, callback: Callable):
        """Remove observer"""
        if callback in self.observers:
            self.observers.remove(callback)
    
    def record_operation(self, operation: OperationType, data: Dict[str, Any], 
                        indices: List[int] = None, values: List[Any] = None,
                        metadata: Dict[str, Any] = None):
        """Record a DSA operation step"""
        if not self.is_recording:
            return
            
        step = OperationStep(
            operation=operation,
            timestamp=time.time(),
            data=data or {},
            indices=indices or [],
            values=values or [],
            metadata=metadata or {}
        )
        
        self.operation_history.append(step)
        
        # Notify all observers
        for observer in self.observers:
            try:
                observer(step)
            except Exception as e:
                print(f"Observer error: {e}")
        
        # Add animation delay for visualization
        if self.animation_speed > 0:
            time.sleep(0.1 / self.animation_speed)
    
    def set_animation_speed(self, speed: float):
        """Set animation speed (0 = no delay, 1 = normal, 2 = fast)"""
        self.animation_speed = max(0, speed)
    
    def clear_history(self):
        """Clear operation history"""
        self.operation_history.clear()
    
    def get_history(self) -> List[Dict[str, Any]]:
        """Get operation history as serializable data"""
        return [step.to_dict() for step in self.operation_history]

# Global visualization engine instance
viz_engine = DSAVisualizationEngine()

class VisualizableArray:
    """Array with built-in visualization capabilities"""
    
    def __init__(self, data: List[Any] = None, name: str = "Array"):
        self.data = data or []
        self.name = name
        self.engine = viz_engine
        
    def __getitem__(self, index: int) -> Any:
        self.engine.record_operation(
            OperationType.SEARCH,
            {'structure': 'array', 'name': self.name, 'array': self.data.copy()},
            indices=[index],
            metadata={'access_type': 'read'}
        )
        return self.data[index]
    
    def __setitem__(self, index: int, value: Any):
        old_value = self.data[index] if 0 <= index < len(self.data) else None
        self.data[index] = value
        
        self.engine.record_operation(
            OperationType.INSERT,
            {'structure': 'array', 'name': self.name, 'array': self.data.copy()},
            indices=[index],
            values=[value],
            metadata={'old_value': old_value, 'access_type': 'write'}
        )
    
    def append(self, value: Any):
        """Add element to end of array"""
        self.data.append(value)
        self.engine.record_operation(
            OperationType.INSERT,
            {'structure': 'array', 'name': self.name, 'array': self.data.copy()},
            indices=[len(self.data) - 1],
            values=[value],
            metadata={'operation': 'append'}
        )
    
    def insert(self, index: int, value: Any):
        """Insert element at specific index"""
        self.data.insert(index, value)
        self.engine.record_operation(
            OperationType.INSERT,
            {'structure': 'array', 'name': self.name, 'array': self.data.copy()},
            indices=[index],
            values=[value],
            metadata={'operation': 'insert'}
        )
    
    def remove(self, value: Any):
        """Remove first occurrence of value"""
        try:
            index = self.data.index(value)
            removed = self.data.pop(index)
            self.engine.record_operation(
                OperationType.DELETE,
                {'structure': 'array', 'name': self.name, 'array': self.data.copy()},
                indices=[index],
                values=[removed],
                metadata={'operation': 'remove'}
            )
        except ValueError:
            pass
    
    def swap(self, i: int, j: int):
        """Swap elements at indices i and j"""
        if 0 <= i < len(self.data) and 0 <= j < len(self.data):
            self.data[i], self.data[j] = self.data[j], self.data[i]
            self.engine.record_operation(
                OperationType.SWAP,
                {'structure': 'array', 'name': self.name, 'array': self.data.copy()},
                indices=[i, j],
                values=[self.data[i], self.data[j]],
                metadata={'operation': 'swap'}
            )
    
    def __len__(self) -> int:
        return len(self.data)
    
    def __repr__(self) -> str:
        return f"VisualizableArray({self.data})"

class VisualizableStack:
    """Stack with visualization capabilities"""
    
    def __init__(self, name: str = "Stack"):
        self.data = []
        self.name = name
        self.engine = viz_engine
    
    def push(self, value: Any):
        """Push element onto stack"""
        self.data.append(value)
        self.engine.record_operation(
            OperationType.PUSH,
            {'structure': 'stack', 'name': self.name, 'stack': self.data.copy()},
            indices=[len(self.data) - 1],
            values=[value],
            metadata={'operation': 'push', 'size': len(self.data)}
        )
    
    def pop(self) -> Any:
        """Pop element from stack"""
        if not self.data:
            return None
        
        value = self.data.pop()
        self.engine.record_operation(
            OperationType.POP,
            {'structure': 'stack', 'name': self.name, 'stack': self.data.copy()},
            indices=[len(self.data)],
            values=[value],
            metadata={'operation': 'pop', 'size': len(self.data)}
        )
        return value
    
    def peek(self) -> Any:
        """Peek at top element"""
        if not self.data:
            return None
        
        value = self.data[-1]
        self.engine.record_operation(
            OperationType.SEARCH,
            {'structure': 'stack', 'name': self.name, 'stack': self.data.copy()},
            indices=[len(self.data) - 1],
            values=[value],
            metadata={'operation': 'peek'}
        )
        return value
    
    def is_empty(self) -> bool:
        return len(self.data) == 0
    
    def size(self) -> int:
        return len(self.data)

class VisualizableQueue:
    """Queue with visualization capabilities"""
    
    def __init__(self, name: str = "Queue"):
        self.data = deque()
        self.name = name
        self.engine = viz_engine
    
    def enqueue(self, value: Any):
        """Add element to rear of queue"""
        self.data.append(value)
        self.engine.record_operation(
            OperationType.ENQUEUE,
            {'structure': 'queue', 'name': self.name, 'queue': list(self.data)},
            indices=[len(self.data) - 1],
            values=[value],
            metadata={'operation': 'enqueue', 'size': len(self.data)}
        )
    
    def dequeue(self) -> Any:
        """Remove element from front of queue"""
        if not self.data:
            return None
        
        value = self.data.popleft()
        self.engine.record_operation(
            OperationType.DEQUEUE,
            {'structure': 'queue', 'name': self.name, 'queue': list(self.data)},
            indices=[0],
            values=[value],
            metadata={'operation': 'dequeue', 'size': len(self.data)}
        )
        return value
    
    def front(self) -> Any:
        """Peek at front element"""
        if not self.data:
            return None
        
        value = self.data[0]
        self.engine.record_operation(
            OperationType.SEARCH,
            {'structure': 'queue', 'name': self.name, 'queue': list(self.data)},
            indices=[0],
            values=[value],
            metadata={'operation': 'front'}
        )
        return value
    
    def is_empty(self) -> bool:
        return len(self.data) == 0
    
    def size(self) -> int:
        return len(self.data)

class VisualizableLinkedList:
    """Linked List with visualization capabilities"""
    
    class Node:
        def __init__(self, data: Any, next_node=None):
            self.data = data
            self.next = next_node
            self.id = id(self)  # Unique identifier for visualization
    
    def __init__(self, name: str = "LinkedList"):
        self.head = None
        self.name = name
        self.engine = viz_engine
        self.size = 0
    
    def _get_list_data(self) -> List[Dict[str, Any]]:
        """Get list data for visualization"""
        nodes = []
        current = self.head
        index = 0
        
        while current:
            nodes.append({
                'id': current.id,
                'data': current.data,
                'index': index,
                'has_next': current.next is not None
            })
            current = current.next
            index += 1
        
        return nodes
    
    def insert_at_head(self, data: Any):
        """Insert node at head"""
        new_node = self.Node(data, self.head)
        self.head = new_node
        self.size += 1
        
        self.engine.record_operation(
            OperationType.INSERT,
            {'structure': 'linked_list', 'name': self.name, 'nodes': self._get_list_data()},
            indices=[0],
            values=[data],
            metadata={'operation': 'insert_head', 'node_id': new_node.id}
        )
    
    def insert_at_tail(self, data: Any):
        """Insert node at tail"""
        new_node = self.Node(data)
        
        if not self.head:
            self.head = new_node
            index = 0
        else:
            current = self.head
            index = 1
            while current.next:
                current = current.next
                index += 1
            current.next = new_node
        
        self.size += 1
        
        self.engine.record_operation(
            OperationType.INSERT,
            {'structure': 'linked_list', 'name': self.name, 'nodes': self._get_list_data()},
            indices=[index],
            values=[data],
            metadata={'operation': 'insert_tail', 'node_id': new_node.id}
        )
    
    def delete(self, data: Any) -> bool:
        """Delete first node with given data"""
        if not self.head:
            return False
        
        # If head node contains the data
        if self.head.data == data:
            deleted_id = self.head.id
            self.head = self.head.next
            self.size -= 1
            
            self.engine.record_operation(
                OperationType.DELETE,
                {'structure': 'linked_list', 'name': self.name, 'nodes': self._get_list_data()},
                indices=[0],
                values=[data],
                metadata={'operation': 'delete', 'node_id': deleted_id}
            )
            return True
        
        # Search for the node to delete
        current = self.head
        index = 1
        
        while current.next:
            if current.next.data == data:
                deleted_id = current.next.id
                current.next = current.next.next
                self.size -= 1
                
                self.engine.record_operation(
                    OperationType.DELETE,
                    {'structure': 'linked_list', 'name': self.name, 'nodes': self._get_list_data()},
                    indices=[index],
                    values=[data],
                    metadata={'operation': 'delete', 'node_id': deleted_id}
                )
                return True
            
            current = current.next
            index += 1
        
        return False
    
    def search(self, data: Any) -> int:
        """Search for data and return index (-1 if not found)"""
        current = self.head
        index = 0
        
        while current:
            self.engine.record_operation(
                OperationType.SEARCH,
                {'structure': 'linked_list', 'name': self.name, 'nodes': self._get_list_data()},
                indices=[index],
                values=[current.data],
                metadata={'operation': 'search', 'target': data, 'found': current.data == data}
            )
            
            if current.data == data:
                return index
            
            current = current.next
            index += 1
        
        return -1

class VisualizableBinaryTree:
    """Binary Tree with visualization capabilities"""
    
    class TreeNode:
        def __init__(self, data: Any):
            self.data = data
            self.left = None
            self.right = None
            self.id = id(self)
    
    def __init__(self, name: str = "BinaryTree"):
        self.root = None
        self.name = name
        self.engine = viz_engine
    
    def _get_tree_data(self) -> Dict[str, Any]:
        """Get tree data for visualization"""
        def serialize_node(node, level=0):
            if not node:
                return None
            
            return {
                'id': node.id,
                'data': node.data,
                'level': level,
                'left': serialize_node(node.left, level + 1),
                'right': serialize_node(node.right, level + 1)
            }
        
        return serialize_node(self.root)
    
    def insert(self, data: Any):
        """Insert data into BST"""
        def insert_recursive(node, data, level=0):
            if not node:
                new_node = self.TreeNode(data)
                self.engine.record_operation(
                    OperationType.INSERT,
                    {'structure': 'binary_tree', 'name': self.name, 'tree': self._get_tree_data()},
                    values=[data],
                    metadata={'operation': 'insert', 'level': level, 'node_id': new_node.id}
                )
                return new_node
            
            self.engine.record_operation(
                OperationType.COMPARE,
                {'structure': 'binary_tree', 'name': self.name, 'tree': self._get_tree_data()},
                values=[data, node.data],
                metadata={'operation': 'compare', 'level': level, 'result': 'left' if data < node.data else 'right'}
            )
            
            if data < node.data:
                node.left = insert_recursive(node.left, data, level + 1)
            else:
                node.right = insert_recursive(node.right, data, level + 1)
            
            return node
        
        self.root = insert_recursive(self.root, data)
    
    def search(self, data: Any) -> bool:
        """Search for data in BST"""
        def search_recursive(node, data, level=0):
            if not node:
                self.engine.record_operation(
                    OperationType.SEARCH,
                    {'structure': 'binary_tree', 'name': self.name, 'tree': self._get_tree_data()},
                    values=[data],
                    metadata={'operation': 'search', 'level': level, 'found': False}
                )
                return False
            
            self.engine.record_operation(
                OperationType.SEARCH,
                {'structure': 'binary_tree', 'name': self.name, 'tree': self._get_tree_data()},
                values=[data, node.data],
                metadata={'operation': 'search', 'level': level, 'current_node': node.id}
            )
            
            if data == node.data:
                self.engine.record_operation(
                    OperationType.SEARCH,
                    {'structure': 'binary_tree', 'name': self.name, 'tree': self._get_tree_data()},
                    values=[data],
                    metadata={'operation': 'search', 'level': level, 'found': True, 'node_id': node.id}
                )
                return True
            elif data < node.data:
                return search_recursive(node.left, data, level + 1)
            else:
                return search_recursive(node.right, data, level + 1)
        
        return search_recursive(self.root, data)
    
    def inorder_traversal(self) -> List[Any]:
        """Perform inorder traversal"""
        result = []
        
        def inorder_recursive(node, level=0):
            if node:
                inorder_recursive(node.left, level + 1)
                
                result.append(node.data)
                self.engine.record_operation(
                    OperationType.TRAVERSE,
                    {'structure': 'binary_tree', 'name': self.name, 'tree': self._get_tree_data()},
                    values=[node.data],
                    metadata={'operation': 'inorder', 'level': level, 'node_id': node.id, 'result': result.copy()}
                )
                
                inorder_recursive(node.right, level + 1)
        
        inorder_recursive(self.root)
        return result

class VisualizableGraph:
    """Graph with visualization capabilities"""
    
    def __init__(self, directed: bool = False, name: str = "Graph"):
        self.adjacency_list = defaultdict(list)
        self.directed = directed
        self.name = name
        self.engine = viz_engine
        self.nodes = set()
        self.edges = []
    
    def add_node(self, node: Any):
        """Add a node to the graph"""
        self.nodes.add(node)
        self.engine.record_operation(
            OperationType.INSERT,
            {'structure': 'graph', 'name': self.name, 'nodes': list(self.nodes), 'edges': self.edges},
            values=[node],
            metadata={'operation': 'add_node'}
        )
    
    def add_edge(self, from_node: Any, to_node: Any, weight: float = 1.0):
        """Add an edge between nodes"""
        self.nodes.add(from_node)
        self.nodes.add(to_node)
        
        self.adjacency_list[from_node].append((to_node, weight))
        if not self.directed:
            self.adjacency_list[to_node].append((from_node, weight))
        
        edge = {'from': from_node, 'to': to_node, 'weight': weight}
        self.edges.append(edge)
        
        self.engine.record_operation(
            OperationType.INSERT,
            {'structure': 'graph', 'name': self.name, 'nodes': list(self.nodes), 'edges': self.edges},
            values=[from_node, to_node],
            metadata={'operation': 'add_edge', 'weight': weight, 'directed': self.directed}
        )
    
    def bfs(self, start_node: Any) -> List[Any]:
        """Breadth-First Search with visualization"""
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
                
                self.engine.record_operation(
                    OperationType.TRAVERSE,
                    {'structure': 'graph', 'name': self.name, 'nodes': list(self.nodes), 'edges': self.edges},
                    values=[node],
                    metadata={
                        'operation': 'bfs',
                        'visited': list(visited),
                        'queue': list(queue),
                        'current': node,
                        'result': result.copy()
                    }
                )
                
                for neighbor, _ in self.adjacency_list[node]:
                    if neighbor not in visited:
                        queue.append(neighbor)
        
        return result
    
    def dfs(self, start_node: Any) -> List[Any]:
        """Depth-First Search with visualization"""
        if start_node not in self.nodes:
            return []
        
        visited = set()
        result = []
        
        def dfs_recursive(node):
            visited.add(node)
            result.append(node)
            
            self.engine.record_operation(
                OperationType.TRAVERSE,
                {'structure': 'graph', 'name': self.name, 'nodes': list(self.nodes), 'edges': self.edges},
                values=[node],
                metadata={
                    'operation': 'dfs',
                    'visited': list(visited),
                    'current': node,
                    'result': result.copy()
                }
            )
            
            for neighbor, _ in self.adjacency_list[node]:
                if neighbor not in visited:
                    dfs_recursive(neighbor)
        
        dfs_recursive(start_node)
        return result
    
    def dijkstra(self, start_node: Any) -> Dict[Any, float]:
        """Dijkstra's shortest path algorithm with visualization"""
        distances = {node: float('infinity') for node in self.nodes}
        distances[start_node] = 0
        pq = [(0, start_node)]
        visited = set()
        
        while pq:
            current_distance, current_node = heapq.heappop(pq)
            
            if current_node in visited:
                continue
            
            visited.add(current_node)
            
            self.engine.record_operation(
                OperationType.TRAVERSE,
                {'structure': 'graph', 'name': self.name, 'nodes': list(self.nodes), 'edges': self.edges},
                values=[current_node],
                metadata={
                    'operation': 'dijkstra',
                    'current': current_node,
                    'distance': current_distance,
                    'distances': distances.copy(),
                    'visited': list(visited)
                }
            )
            
            for neighbor, weight in self.adjacency_list[current_node]:
                distance = current_distance + weight
                
                if distance < distances[neighbor]:
                    distances[neighbor] = distance
                    heapq.heappush(pq, (distance, neighbor))
        
        return distances
