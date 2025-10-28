"""
HEAL Platform - Advanced DSA Engine
Perfect implementation of core DSA concepts with mathematical rigor
Every algorithm implemented with proper complexity analysis and optimization
"""
import time
import math
import random
import threading
from typing import Any, List, Dict, Optional, Callable, Tuple, Generator
from dataclasses import dataclass, field
from enum import Enum
from collections import deque, defaultdict
import heapq
import bisect
from abc import ABC, abstractmethod

class ComplexityAnalyzer:
    """Analyzes and tracks algorithm complexity in real-time"""
    
    def __init__(self):
        self.operation_count = 0
        self.comparison_count = 0
        self.swap_count = 0
        self.memory_usage = 0
        self.start_time = 0
        
    def reset(self):
        """Reset all counters"""
        self.operation_count = 0
        self.comparison_count = 0
        self.swap_count = 0
        self.memory_usage = 0
        self.start_time = time.time()
    
    def increment_operations(self, count: int = 1):
        """Increment operation counter"""
        self.operation_count += count
    
    def increment_comparisons(self, count: int = 1):
        """Increment comparison counter"""
        self.comparison_count += count
    
    def increment_swaps(self, count: int = 1):
        """Increment swap counter"""
        self.swap_count += count
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get current performance metrics"""
        elapsed_time = time.time() - self.start_time
        return {
            'operations': self.operation_count,
            'comparisons': self.comparison_count,
            'swaps': self.swap_count,
            'time_elapsed': elapsed_time,
            'memory_usage': self.memory_usage,
            'operations_per_second': self.operation_count / max(elapsed_time, 0.001)
        }

class PerfectSortingEngine:
    """Mathematically perfect sorting implementations with visualization"""
    
    def __init__(self, visualizer_callback: Callable = None):
        self.visualizer = visualizer_callback
        self.analyzer = ComplexityAnalyzer()
    
    def _notify_operation(self, operation: str, data: List[Any], indices: List[int] = None, 
                         metadata: Dict[str, Any] = None):
        """Notify visualizer of operation"""
        if self.visualizer:
            self.visualizer({
                'operation': operation,
                'data': data.copy(),
                'indices': indices or [],
                'metadata': metadata or {},
                'metrics': self.analyzer.get_metrics()
            })
        time.sleep(0.05)  # Animation delay
    
    def quicksort_perfect(self, arr: List[Any], low: int = 0, high: int = None) -> List[Any]:
        """
        Perfect QuickSort implementation with Hoare partition scheme
        Time: O(n log n) average, O(n²) worst case
        Space: O(log n) average due to recursion
        """
        if high is None:
            high = len(arr) - 1
            self.analyzer.reset()
        
        if low < high:
            # Choose median-of-three pivot for better performance
            pivot_index = self._median_of_three_pivot(arr, low, high)
            
            # Partition using Hoare scheme
            partition_index = self._hoare_partition(arr, low, high, pivot_index)
            
            self._notify_operation(
                'partition_complete',
                arr,
                [low, partition_index, high],
                {'pivot_value': arr[partition_index], 'range': f"[{low}, {high}]"}
            )
            
            # Recursively sort partitions
            self.quicksort_perfect(arr, low, partition_index)
            self.quicksort_perfect(arr, partition_index + 1, high)
        
        return arr
    
    def _median_of_three_pivot(self, arr: List[Any], low: int, high: int) -> int:
        """Choose median of first, middle, and last elements as pivot"""
        mid = (low + high) // 2
        
        self.analyzer.increment_comparisons(3)
        
        # Sort the three elements
        if arr[mid] < arr[low]:
            arr[low], arr[mid] = arr[mid], arr[low]
            self.analyzer.increment_swaps()
        
        if arr[high] < arr[low]:
            arr[low], arr[high] = arr[high], arr[low]
            self.analyzer.increment_swaps()
        
        if arr[high] < arr[mid]:
            arr[mid], arr[high] = arr[high], arr[mid]
            self.analyzer.increment_swaps()
        
        # Place median at end for partitioning
        arr[mid], arr[high] = arr[high], arr[mid]
        self.analyzer.increment_swaps()
        
        self._notify_operation(
            'pivot_selection',
            arr,
            [low, mid, high],
            {'pivot_value': arr[high], 'method': 'median_of_three'}
        )
        
        return high
    
    def _hoare_partition(self, arr: List[Any], low: int, high: int, pivot_index: int) -> int:
        """Hoare partition scheme - more efficient than Lomuto"""
        pivot = arr[pivot_index]
        i = low - 1
        j = high + 1
        
        while True:
            # Move left pointer
            i += 1
            while arr[i] < pivot:
                i += 1
                self.analyzer.increment_comparisons()
            
            # Move right pointer
            j -= 1
            while arr[j] > pivot:
                j -= 1
                self.analyzer.increment_comparisons()
            
            self.analyzer.increment_comparisons(2)
            
            if i >= j:
                self._notify_operation(
                    'partition_end',
                    arr,
                    [i, j],
                    {'pivot': pivot, 'final_position': j}
                )
                return j
            
            # Swap elements
            arr[i], arr[j] = arr[j], arr[i]
            self.analyzer.increment_swaps()
            
            self._notify_operation(
                'swap_partition',
                arr,
                [i, j],
                {'pivot': pivot, 'swapped_values': [arr[j], arr[i]]}
            )
    
    def mergesort_perfect(self, arr: List[Any]) -> List[Any]:
        """
        Perfect MergeSort implementation with optimizations
        Time: O(n log n) guaranteed
        Space: O(n) for auxiliary arrays
        """
        self.analyzer.reset()
        return self._mergesort_recursive(arr, 0, len(arr) - 1)
    
    def _mergesort_recursive(self, arr: List[Any], left: int, right: int) -> List[Any]:
        """Recursive mergesort with proper divide and conquer"""
        if left < right:
            mid = left + (right - left) // 2  # Avoid overflow
            
            self._notify_operation(
                'divide',
                arr,
                [left, mid, right],
                {'operation': 'split', 'size': right - left + 1}
            )
            
            # Recursively sort both halves
            self._mergesort_recursive(arr, left, mid)
            self._mergesort_recursive(arr, mid + 1, right)
            
            # Merge sorted halves
            self._merge_perfect(arr, left, mid, right)
        
        return arr
    
    def _merge_perfect(self, arr: List[Any], left: int, mid: int, right: int):
        """Perfect merge operation with minimal memory allocation"""
        # Create temporary arrays
        left_arr = arr[left:mid + 1]
        right_arr = arr[mid + 1:right + 1]
        
        self.analyzer.memory_usage += len(left_arr) + len(right_arr)
        
        i = j = 0
        k = left
        
        # Merge with comparison counting
        while i < len(left_arr) and j < len(right_arr):
            self.analyzer.increment_comparisons()
            
            if left_arr[i] <= right_arr[j]:
                arr[k] = left_arr[i]
                i += 1
            else:
                arr[k] = right_arr[j]
                j += 1
            
            self.analyzer.increment_operations()
            
            self._notify_operation(
                'merge_step',
                arr,
                [k],
                {
                    'merged_value': arr[k],
                    'left_remaining': len(left_arr) - i,
                    'right_remaining': len(right_arr) - j
                }
            )
            k += 1
        
        # Copy remaining elements
        while i < len(left_arr):
            arr[k] = left_arr[i]
            i += 1
            k += 1
            self.analyzer.increment_operations()
        
        while j < len(right_arr):
            arr[k] = right_arr[j]
            j += 1
            k += 1
            self.analyzer.increment_operations()
    
    def heapsort_perfect(self, arr: List[Any]) -> List[Any]:
        """
        Perfect HeapSort implementation
        Time: O(n log n) guaranteed
        Space: O(1) in-place sorting
        """
        self.analyzer.reset()
        n = len(arr)
        
        # Build max heap
        for i in range(n // 2 - 1, -1, -1):
            self._heapify_perfect(arr, n, i)
        
        self._notify_operation(
            'heap_built',
            arr,
            list(range(n)),
            {'operation': 'max_heap_created', 'size': n}
        )
        
        # Extract elements from heap one by one
        for i in range(n - 1, 0, -1):
            # Move current root to end
            arr[0], arr[i] = arr[i], arr[0]
            self.analyzer.increment_swaps()
            
            self._notify_operation(
                'extract_max',
                arr,
                [0, i],
                {'extracted': arr[i], 'heap_size': i}
            )
            
            # Restore heap property
            self._heapify_perfect(arr, i, 0)
        
        return arr
    
    def _heapify_perfect(self, arr: List[Any], n: int, i: int):
        """Perfect heapify operation maintaining max-heap property"""
        largest = i
        left = 2 * i + 1
        right = 2 * i + 2
        
        # Check left child
        if left < n:
            self.analyzer.increment_comparisons()
            if arr[left] > arr[largest]:
                largest = left
        
        # Check right child
        if right < n:
            self.analyzer.increment_comparisons()
            if arr[right] > arr[largest]:
                largest = right
        
        # If largest is not root
        if largest != i:
            arr[i], arr[largest] = arr[largest], arr[i]
            self.analyzer.increment_swaps()
            
            self._notify_operation(
                'heapify',
                arr,
                [i, largest],
                {'parent': i, 'child': largest, 'value': arr[i]}
            )
            
            # Recursively heapify affected subtree
            self._heapify_perfect(arr, n, largest)

class PerfectSearchEngine:
    """Perfect search algorithm implementations"""
    
    def __init__(self, visualizer_callback: Callable = None):
        self.visualizer = visualizer_callback
        self.analyzer = ComplexityAnalyzer()
    
    def binary_search_perfect(self, arr: List[Any], target: Any) -> int:
        """
        Perfect Binary Search implementation
        Time: O(log n)
        Space: O(1)
        """
        self.analyzer.reset()
        left, right = 0, len(arr) - 1
        
        while left <= right:
            # Avoid overflow with proper midpoint calculation
            mid = left + (right - left) // 2
            self.analyzer.increment_operations()
            
            if self.visualizer:
                self.visualizer({
                    'operation': 'binary_search_step',
                    'data': arr,
                    'indices': [left, mid, right],
                    'metadata': {
                        'target': target,
                        'mid_value': arr[mid],
                        'range': f"[{left}, {right}]",
                        'search_space': right - left + 1
                    },
                    'metrics': self.analyzer.get_metrics()
                })
            
            self.analyzer.increment_comparisons()
            
            if arr[mid] == target:
                return mid
            elif arr[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        
        return -1
    
    def interpolation_search_perfect(self, arr: List[Any], target: Any) -> int:
        """
        Perfect Interpolation Search for uniformly distributed data
        Time: O(log log n) average, O(n) worst case
        """
        self.analyzer.reset()
        left, right = 0, len(arr) - 1
        
        while left <= right and target >= arr[left] and target <= arr[right]:
            # Avoid division by zero
            if arr[right] == arr[left]:
                if arr[left] == target:
                    return left
                break
            
            # Interpolation formula
            pos = left + ((target - arr[left]) * (right - left)) // (arr[right] - arr[left])
            pos = max(left, min(right, pos))  # Ensure pos is within bounds
            
            self.analyzer.increment_operations()
            
            if self.visualizer:
                self.visualizer({
                    'operation': 'interpolation_search',
                    'data': arr,
                    'indices': [left, pos, right],
                    'metadata': {
                        'target': target,
                        'interpolated_pos': pos,
                        'pos_value': arr[pos],
                        'formula': f"pos = {left} + (({target} - {arr[left]}) * ({right} - {left})) / ({arr[right]} - {arr[left]})"
                    },
                    'metrics': self.analyzer.get_metrics()
                })
            
            self.analyzer.increment_comparisons()
            
            if arr[pos] == target:
                return pos
            elif arr[pos] < target:
                left = pos + 1
            else:
                right = pos - 1
        
        return -1

class PerfectGraphEngine:
    """Perfect graph algorithm implementations"""
    
    def __init__(self, visualizer_callback: Callable = None):
        self.visualizer = visualizer_callback
        self.analyzer = ComplexityAnalyzer()
    
    def dijkstra_perfect(self, graph: Dict[str, List[Tuple[str, float]]], 
                        start: str) -> Tuple[Dict[str, float], Dict[str, str]]:
        """
        Perfect Dijkstra's algorithm implementation
        Time: O((V + E) log V) with binary heap
        Space: O(V)
        """
        self.analyzer.reset()
        
        # Initialize distances and previous nodes
        distances = {node: float('infinity') for node in graph}
        previous = {node: None for node in graph}
        distances[start] = 0
        
        # Priority queue: (distance, node)
        pq = [(0, start)]
        visited = set()
        
        while pq:
            current_distance, current_node = heapq.heappop(pq)
            
            if current_node in visited:
                continue
            
            visited.add(current_node)
            self.analyzer.increment_operations()
            
            if self.visualizer:
                self.visualizer({
                    'operation': 'dijkstra_visit',
                    'data': {'graph': graph, 'distances': distances.copy()},
                    'indices': [current_node],
                    'metadata': {
                        'current_node': current_node,
                        'current_distance': current_distance,
                        'visited': list(visited),
                        'queue_size': len(pq)
                    },
                    'metrics': self.analyzer.get_metrics()
                })
            
            # Check neighbors
            for neighbor, weight in graph.get(current_node, []):
                if neighbor not in visited:
                    new_distance = current_distance + weight
                    self.analyzer.increment_comparisons()
                    
                    if new_distance < distances[neighbor]:
                        distances[neighbor] = new_distance
                        previous[neighbor] = current_node
                        heapq.heappush(pq, (new_distance, neighbor))
                        
                        if self.visualizer:
                            self.visualizer({
                                'operation': 'dijkstra_relax',
                                'data': {'graph': graph, 'distances': distances.copy()},
                                'indices': [current_node, neighbor],
                                'metadata': {
                                    'edge': f"{current_node} -> {neighbor}",
                                    'weight': weight,
                                    'old_distance': distances[neighbor] if neighbor in distances else float('inf'),
                                    'new_distance': new_distance,
                                    'improved': True
                                }
                            })
        
        return distances, previous
    
    def a_star_perfect(self, grid: List[List[int]], start: Tuple[int, int], 
                      goal: Tuple[int, int]) -> List[Tuple[int, int]]:
        """
        Perfect A* pathfinding implementation
        Time: O(b^d) where b is branching factor, d is depth
        Space: O(b^d)
        """
        self.analyzer.reset()
        
        def heuristic(a: Tuple[int, int], b: Tuple[int, int]) -> float:
            """Manhattan distance heuristic"""
            return abs(a[0] - b[0]) + abs(a[1] - b[1])
        
        rows, cols = len(grid), len(grid[0])
        
        # Priority queue: (f_score, g_score, node)
        open_set = [(heuristic(start, goal), 0, start)]
        came_from = {}
        g_score = {start: 0}
        f_score = {start: heuristic(start, goal)}
        closed_set = set()
        
        while open_set:
            current_f, current_g, current = heapq.heappop(open_set)
            
            if current in closed_set:
                continue
            
            closed_set.add(current)
            self.analyzer.increment_operations()
            
            if self.visualizer:
                self.visualizer({
                    'operation': 'a_star_explore',
                    'data': {'grid': grid, 'path': []},
                    'indices': [current],
                    'metadata': {
                        'current': current,
                        'g_score': current_g,
                        'f_score': current_f,
                        'h_score': heuristic(current, goal),
                        'open_set_size': len(open_set),
                        'closed_set_size': len(closed_set)
                    },
                    'metrics': self.analyzer.get_metrics()
                })
            
            if current == goal:
                # Reconstruct path
                path = []
                while current in came_from:
                    path.append(current)
                    current = came_from[current]
                path.append(start)
                path.reverse()
                return path
            
            # Explore neighbors
            for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
                neighbor = (current[0] + dx, current[1] + dy)
                
                if (0 <= neighbor[0] < rows and 0 <= neighbor[1] < cols and 
                    grid[neighbor[0]][neighbor[1]] == 0 and neighbor not in closed_set):
                    
                    tentative_g = g_score[current] + 1
                    self.analyzer.increment_comparisons()
                    
                    if neighbor not in g_score or tentative_g < g_score[neighbor]:
                        came_from[neighbor] = current
                        g_score[neighbor] = tentative_g
                        f_score[neighbor] = tentative_g + heuristic(neighbor, goal)
                        heapq.heappush(open_set, (f_score[neighbor], tentative_g, neighbor))
        
        return []  # No path found

class PerfectDynamicProgramming:
    """Perfect dynamic programming implementations"""
    
    def __init__(self, visualizer_callback: Callable = None):
        self.visualizer = visualizer_callback
        self.analyzer = ComplexityAnalyzer()
    
    def lcs_perfect(self, text1: str, text2: str) -> Tuple[int, str]:
        """
        Perfect Longest Common Subsequence implementation
        Time: O(m * n)
        Space: O(m * n)
        """
        self.analyzer.reset()
        m, n = len(text1), len(text2)
        
        # DP table with proper initialization
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        
        # Fill DP table
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                self.analyzer.increment_operations()
                self.analyzer.increment_comparisons()
                
                if text1[i - 1] == text2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1] + 1
                    operation = 'match'
                else:
                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
                    operation = 'no_match'
                
                if self.visualizer:
                    self.visualizer({
                        'operation': 'lcs_fill',
                        'data': {'dp_table': [row[:] for row in dp], 'text1': text1, 'text2': text2},
                        'indices': [i, j],
                        'metadata': {
                            'char1': text1[i - 1],
                            'char2': text2[j - 1],
                            'operation': operation,
                            'value': dp[i][j],
                            'progress': f"{i * n + j}/{m * n}"
                        },
                        'metrics': self.analyzer.get_metrics()
                    })
        
        # Reconstruct LCS string
        lcs_str = self._reconstruct_lcs(dp, text1, text2, m, n)
        
        return dp[m][n], lcs_str
    
    def _reconstruct_lcs(self, dp: List[List[int]], text1: str, text2: str, 
                        i: int, j: int) -> str:
        """Reconstruct the actual LCS string"""
        if i == 0 or j == 0:
            return ""
        
        if text1[i - 1] == text2[j - 1]:
            return self._reconstruct_lcs(dp, text1, text2, i - 1, j - 1) + text1[i - 1]
        elif dp[i - 1][j] > dp[i][j - 1]:
            return self._reconstruct_lcs(dp, text1, text2, i - 1, j)
        else:
            return self._reconstruct_lcs(dp, text1, text2, i, j - 1)
    
    def knapsack_perfect(self, weights: List[int], values: List[int], 
                        capacity: int) -> Tuple[int, List[int]]:
        """
        Perfect 0/1 Knapsack implementation
        Time: O(n * W)
        Space: O(n * W)
        """
        self.analyzer.reset()
        n = len(weights)
        
        # DP table: dp[i][w] = maximum value with first i items and weight limit w
        dp = [[0] * (capacity + 1) for _ in range(n + 1)]
        
        for i in range(1, n + 1):
            for w in range(capacity + 1):
                self.analyzer.increment_operations()
                
                # Don't include current item
                dp[i][w] = dp[i - 1][w]
                
                # Include current item if possible
                if weights[i - 1] <= w:
                    self.analyzer.increment_comparisons()
                    include_value = dp[i - 1][w - weights[i - 1]] + values[i - 1]
                    
                    if include_value > dp[i][w]:
                        dp[i][w] = include_value
                
                if self.visualizer:
                    self.visualizer({
                        'operation': 'knapsack_fill',
                        'data': {'dp_table': [row[:] for row in dp], 'weights': weights, 'values': values},
                        'indices': [i, w],
                        'metadata': {
                            'item': i - 1,
                            'weight_limit': w,
                            'item_weight': weights[i - 1],
                            'item_value': values[i - 1],
                            'max_value': dp[i][w]
                        },
                        'metrics': self.analyzer.get_metrics()
                    })
        
        # Reconstruct solution
        selected_items = self._reconstruct_knapsack(dp, weights, n, capacity)
        
        return dp[n][capacity], selected_items
    
    def _reconstruct_knapsack(self, dp: List[List[int]], weights: List[int], 
                             n: int, capacity: int) -> List[int]:
        """Reconstruct which items were selected"""
        selected = []
        w = capacity
        
        for i in range(n, 0, -1):
            if dp[i][w] != dp[i - 1][w]:
                selected.append(i - 1)  # Item index
                w -= weights[i - 1]
        
        return selected[::-1]  # Reverse to get correct order
