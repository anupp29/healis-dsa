"""
HEAL Platform - Advanced Algorithm Implementations
Visualizable algorithms with step-by-step operation tracking
"""
import time
import random
from typing import List, Any, Dict, Tuple, Optional, Generator
from .dsa_engine import viz_engine, OperationType, VisualizableArray

class VisualizableSortingAlgorithms:
    """Sorting algorithms with real-time visualization"""
    
    @staticmethod
    def bubble_sort(arr: VisualizableArray) -> VisualizableArray:
        """Bubble Sort with visualization"""
        n = len(arr)
        
        for i in range(n):
            for j in range(0, n - i - 1):
                # Compare adjacent elements
                viz_engine.record_operation(
                    OperationType.COMPARE,
                    {'algorithm': 'bubble_sort', 'array': arr.data.copy()},
                    indices=[j, j + 1],
                    values=[arr.data[j], arr.data[j + 1]],
                    metadata={'pass': i, 'comparison': f"{arr.data[j]} vs {arr.data[j + 1]}"}
                )
                
                if arr.data[j] > arr.data[j + 1]:
                    arr.swap(j, j + 1)
        
        return arr
    
    @staticmethod
    def quick_sort(arr: VisualizableArray, low: int = 0, high: int = None) -> VisualizableArray:
        """Quick Sort with visualization"""
        if high is None:
            high = len(arr) - 1
        
        if low < high:
            # Partition and get pivot index
            pivot_index = VisualizableSortingAlgorithms._partition(arr, low, high)
            
            # Recursively sort elements before and after partition
            VisualizableSortingAlgorithms.quick_sort(arr, low, pivot_index - 1)
            VisualizableSortingAlgorithms.quick_sort(arr, pivot_index + 1, high)
        
        return arr
    
    @staticmethod
    def _partition(arr: VisualizableArray, low: int, high: int) -> int:
        """Partition function for Quick Sort"""
        pivot = arr.data[high]
        
        viz_engine.record_operation(
            OperationType.SEARCH,
            {'algorithm': 'quick_sort', 'array': arr.data.copy()},
            indices=[high],
            values=[pivot],
            metadata={'operation': 'select_pivot', 'pivot': pivot, 'range': f"[{low}, {high}]"}
        )
        
        i = low - 1
        
        for j in range(low, high):
            viz_engine.record_operation(
                OperationType.COMPARE,
                {'algorithm': 'quick_sort', 'array': arr.data.copy()},
                indices=[j, high],
                values=[arr.data[j], pivot],
                metadata={'operation': 'compare_with_pivot', 'pivot': pivot}
            )
            
            if arr.data[j] <= pivot:
                i += 1
                if i != j:
                    arr.swap(i, j)
        
        arr.swap(i + 1, high)
        return i + 1
    
    @staticmethod
    def merge_sort(arr: VisualizableArray, left: int = 0, right: int = None) -> VisualizableArray:
        """Merge Sort with visualization"""
        if right is None:
            right = len(arr) - 1
        
        if left < right:
            mid = (left + right) // 2
            
            viz_engine.record_operation(
                OperationType.SPLIT,
                {'algorithm': 'merge_sort', 'array': arr.data.copy()},
                indices=[left, mid, right],
                metadata={'operation': 'divide', 'range': f"[{left}, {right}]", 'mid': mid}
            )
            
            # Recursively sort both halves
            VisualizableSortingAlgorithms.merge_sort(arr, left, mid)
            VisualizableSortingAlgorithms.merge_sort(arr, mid + 1, right)
            
            # Merge the sorted halves
            VisualizableSortingAlgorithms._merge(arr, left, mid, right)
        
        return arr
    
    @staticmethod
    def _merge(arr: VisualizableArray, left: int, mid: int, right: int):
        """Merge function for Merge Sort"""
        # Create temp arrays
        left_arr = arr.data[left:mid + 1]
        right_arr = arr.data[mid + 1:right + 1]
        
        viz_engine.record_operation(
            OperationType.MERGE,
            {'algorithm': 'merge_sort', 'array': arr.data.copy()},
            indices=[left, mid, right],
            values=[left_arr, right_arr],
            metadata={'operation': 'merge_start', 'left_size': len(left_arr), 'right_size': len(right_arr)}
        )
        
        i = j = 0
        k = left
        
        while i < len(left_arr) and j < len(right_arr):
            viz_engine.record_operation(
                OperationType.COMPARE,
                {'algorithm': 'merge_sort', 'array': arr.data.copy()},
                indices=[k],
                values=[left_arr[i], right_arr[j]],
                metadata={'operation': 'merge_compare', 'left_val': left_arr[i], 'right_val': right_arr[j]}
            )
            
            if left_arr[i] <= right_arr[j]:
                arr.data[k] = left_arr[i]
                i += 1
            else:
                arr.data[k] = right_arr[j]
                j += 1
            
            viz_engine.record_operation(
                OperationType.INSERT,
                {'algorithm': 'merge_sort', 'array': arr.data.copy()},
                indices=[k],
                values=[arr.data[k]],
                metadata={'operation': 'merge_place'}
            )
            k += 1
        
        # Copy remaining elements
        while i < len(left_arr):
            arr.data[k] = left_arr[i]
            i += 1
            k += 1
        
        while j < len(right_arr):
            arr.data[k] = right_arr[j]
            j += 1
            k += 1

class VisualizableSearchAlgorithms:
    """Search algorithms with visualization"""
    
    @staticmethod
    def linear_search(arr: VisualizableArray, target: Any) -> int:
        """Linear Search with visualization"""
        for i in range(len(arr)):
            viz_engine.record_operation(
                OperationType.SEARCH,
                {'algorithm': 'linear_search', 'array': arr.data.copy()},
                indices=[i],
                values=[arr.data[i], target],
                metadata={
                    'operation': 'compare',
                    'target': target,
                    'current': arr.data[i],
                    'found': arr.data[i] == target,
                    'position': i
                }
            )
            
            if arr.data[i] == target:
                return i
        
        return -1
    
    @staticmethod
    def binary_search(arr: VisualizableArray, target: Any) -> int:
        """Binary Search with visualization (assumes sorted array)"""
        left, right = 0, len(arr) - 1
        
        while left <= right:
            mid = (left + right) // 2
            
            viz_engine.record_operation(
                OperationType.SEARCH,
                {'algorithm': 'binary_search', 'array': arr.data.copy()},
                indices=[left, mid, right],
                values=[arr.data[mid], target],
                metadata={
                    'operation': 'compare_middle',
                    'target': target,
                    'mid_value': arr.data[mid],
                    'range': f"[{left}, {right}]"
                }
            )
            
            if arr.data[mid] == target:
                viz_engine.record_operation(
                    OperationType.SEARCH,
                    {'algorithm': 'binary_search', 'array': arr.data.copy()},
                    indices=[mid],
                    values=[target],
                    metadata={'operation': 'found', 'position': mid}
                )
                return mid
            elif arr.data[mid] < target:
                left = mid + 1
                viz_engine.record_operation(
                    OperationType.SEARCH,
                    {'algorithm': 'binary_search', 'array': arr.data.copy()},
                    indices=[left, right],
                    metadata={'operation': 'search_right', 'new_range': f"[{left}, {right}]"}
                )
            else:
                right = mid - 1
                viz_engine.record_operation(
                    OperationType.SEARCH,
                    {'algorithm': 'binary_search', 'array': arr.data.copy()},
                    indices=[left, right],
                    metadata={'operation': 'search_left', 'new_range': f"[{left}, {right}]"}
                )
        
        return -1

class DynamicProgrammingVisualizer:
    """Dynamic Programming algorithms with visualization"""
    
    @staticmethod
    def fibonacci_dp(n: int) -> int:
        """Fibonacci with Dynamic Programming visualization"""
        if n <= 1:
            return n
        
        dp = [0] * (n + 1)
        dp[0], dp[1] = 0, 1
        
        viz_engine.record_operation(
            OperationType.INSERT,
            {'algorithm': 'fibonacci_dp', 'dp_table': dp.copy()},
            indices=[0, 1],
            values=[0, 1],
            metadata={'operation': 'initialize', 'n': n}
        )
        
        for i in range(2, n + 1):
            dp[i] = dp[i - 1] + dp[i - 2]
            
            viz_engine.record_operation(
                OperationType.INSERT,
                {'algorithm': 'fibonacci_dp', 'dp_table': dp.copy()},
                indices=[i],
                values=[dp[i]],
                metadata={
                    'operation': 'calculate',
                    'formula': f"dp[{i}] = dp[{i-1}] + dp[{i-2}] = {dp[i-1]} + {dp[i-2]} = {dp[i]}"
                }
            )
        
        return dp[n]
    
    @staticmethod
    def longest_common_subsequence(text1: str, text2: str) -> int:
        """LCS with DP visualization"""
        m, n = len(text1), len(text2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        
        viz_engine.record_operation(
            OperationType.INSERT,
            {'algorithm': 'lcs_dp', 'dp_table': dp, 'text1': text1, 'text2': text2},
            metadata={'operation': 'initialize', 'dimensions': f"{m+1}x{n+1}"}
        )
        
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if text1[i - 1] == text2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1] + 1
                    operation = 'match'
                else:
                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
                    operation = 'no_match'
                
                viz_engine.record_operation(
                    OperationType.INSERT,
                    {'algorithm': 'lcs_dp', 'dp_table': [row[:] for row in dp], 'text1': text1, 'text2': text2},
                    indices=[i, j],
                    values=[dp[i][j]],
                    metadata={
                        'operation': operation,
                        'char1': text1[i - 1],
                        'char2': text2[j - 1],
                        'match': text1[i - 1] == text2[j - 1]
                    }
                )
        
        return dp[m][n]

class GraphAlgorithmVisualizer:
    """Graph algorithms with advanced visualization"""
    
    @staticmethod
    def dijkstra_detailed(graph: Dict[str, List[Tuple[str, int]]], start: str) -> Dict[str, int]:
        """Dijkstra's algorithm with detailed visualization"""
        import heapq
        
        distances = {node: float('infinity') for node in graph}
        distances[start] = 0
        pq = [(0, start)]
        visited = set()
        previous = {}
        
        viz_engine.record_operation(
            OperationType.INSERT,
            {'algorithm': 'dijkstra', 'graph': graph, 'distances': distances.copy()},
            values=[start],
            metadata={'operation': 'initialize', 'start': start}
        )
        
        while pq:
            current_distance, current_node = heapq.heappop(pq)
            
            if current_node in visited:
                continue
            
            visited.add(current_node)
            
            viz_engine.record_operation(
                OperationType.TRAVERSE,
                {'algorithm': 'dijkstra', 'graph': graph, 'distances': distances.copy()},
                values=[current_node],
                metadata={
                    'operation': 'visit',
                    'current': current_node,
                    'distance': current_distance,
                    'visited': list(visited)
                }
            )
            
            for neighbor, weight in graph.get(current_node, []):
                if neighbor not in visited:
                    new_distance = current_distance + weight
                    
                    viz_engine.record_operation(
                        OperationType.COMPARE,
                        {'algorithm': 'dijkstra', 'graph': graph, 'distances': distances.copy()},
                        values=[neighbor, new_distance, distances[neighbor]],
                        metadata={
                            'operation': 'relax',
                            'edge': f"{current_node} -> {neighbor}",
                            'weight': weight,
                            'old_distance': distances[neighbor],
                            'new_distance': new_distance,
                            'improved': new_distance < distances[neighbor]
                        }
                    )
                    
                    if new_distance < distances[neighbor]:
                        distances[neighbor] = new_distance
                        previous[neighbor] = current_node
                        heapq.heappush(pq, (new_distance, neighbor))
        
        return distances
    
    @staticmethod
    def a_star_pathfinding(grid: List[List[int]], start: Tuple[int, int], 
                          goal: Tuple[int, int]) -> List[Tuple[int, int]]:
        """A* pathfinding with visualization"""
        import heapq
        
        def heuristic(a: Tuple[int, int], b: Tuple[int, int]) -> int:
            return abs(a[0] - b[0]) + abs(a[1] - b[1])
        
        rows, cols = len(grid), len(grid[0])
        open_set = [(0, start)]
        came_from = {}
        g_score = {start: 0}
        f_score = {start: heuristic(start, goal)}
        
        viz_engine.record_operation(
            OperationType.INSERT,
            {'algorithm': 'a_star', 'grid': grid, 'start': start, 'goal': goal},
            values=[start],
            metadata={'operation': 'initialize', 'heuristic': heuristic(start, goal)}
        )
        
        while open_set:
            current = heapq.heappop(open_set)[1]
            
            viz_engine.record_operation(
                OperationType.TRAVERSE,
                {'algorithm': 'a_star', 'grid': grid, 'current': current},
                values=[current],
                metadata={
                    'operation': 'explore',
                    'g_score': g_score.get(current, float('inf')),
                    'f_score': f_score.get(current, float('inf'))
                }
            )
            
            if current == goal:
                # Reconstruct path
                path = []
                while current in came_from:
                    path.append(current)
                    current = came_from[current]
                path.append(start)
                path.reverse()
                
                viz_engine.record_operation(
                    OperationType.SEARCH,
                    {'algorithm': 'a_star', 'grid': grid, 'path': path},
                    metadata={'operation': 'path_found', 'length': len(path)}
                )
                
                return path
            
            # Check neighbors
            for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
                neighbor = (current[0] + dx, current[1] + dy)
                
                if (0 <= neighbor[0] < rows and 0 <= neighbor[1] < cols and 
                    grid[neighbor[0]][neighbor[1]] == 0):
                    
                    tentative_g_score = g_score[current] + 1
                    
                    if neighbor not in g_score or tentative_g_score < g_score[neighbor]:
                        came_from[neighbor] = current
                        g_score[neighbor] = tentative_g_score
                        f_score[neighbor] = tentative_g_score + heuristic(neighbor, goal)
                        
                        viz_engine.record_operation(
                            OperationType.INSERT,
                            {'algorithm': 'a_star', 'grid': grid, 'neighbor': neighbor},
                            values=[neighbor],
                            metadata={
                                'operation': 'add_to_open',
                                'g_score': g_score[neighbor],
                                'h_score': heuristic(neighbor, goal),
                                'f_score': f_score[neighbor]
                            }
                        )
                        
                        heapq.heappush(open_set, (f_score[neighbor], neighbor))
        
        return []  # No path found

class RecursionVisualizer:
    """Recursive algorithms with call stack visualization"""
    
    @staticmethod
    def tower_of_hanoi(n: int, source: str, destination: str, auxiliary: str) -> List[str]:
        """Tower of Hanoi with recursion visualization"""
        moves = []
        call_stack = []
        
        def hanoi_recursive(n: int, src: str, dest: str, aux: str, depth: int = 0):
            call_info = {
                'n': n,
                'source': src,
                'destination': dest,
                'auxiliary': aux,
                'depth': depth
            }
            call_stack.append(call_info)
            
            viz_engine.record_operation(
                OperationType.INSERT,
                {'algorithm': 'tower_of_hanoi', 'call_stack': call_stack.copy()},
                values=[n, src, dest, aux],
                metadata={'operation': 'function_call', 'depth': depth, 'n': n}
            )
            
            if n == 1:
                move = f"Move disk 1 from {src} to {dest}"
                moves.append(move)
                
                viz_engine.record_operation(
                    OperationType.INSERT,
                    {'algorithm': 'tower_of_hanoi', 'moves': moves.copy(), 'call_stack': call_stack.copy()},
                    values=[move],
                    metadata={'operation': 'base_case', 'move': move, 'depth': depth}
                )
            else:
                # Move n-1 disks from source to auxiliary
                hanoi_recursive(n - 1, src, aux, dest, depth + 1)
                
                # Move the largest disk from source to destination
                move = f"Move disk {n} from {src} to {dest}"
                moves.append(move)
                
                viz_engine.record_operation(
                    OperationType.INSERT,
                    {'algorithm': 'tower_of_hanoi', 'moves': moves.copy(), 'call_stack': call_stack.copy()},
                    values=[move],
                    metadata={'operation': 'move_largest', 'move': move, 'depth': depth, 'disk': n}
                )
                
                # Move n-1 disks from auxiliary to destination
                hanoi_recursive(n - 1, aux, dest, src, depth + 1)
            
            call_stack.pop()
            
            viz_engine.record_operation(
                OperationType.DELETE,
                {'algorithm': 'tower_of_hanoi', 'call_stack': call_stack.copy()},
                metadata={'operation': 'function_return', 'depth': depth, 'n': n}
            )
        
        hanoi_recursive(n, source, destination, auxiliary)
        return moves
