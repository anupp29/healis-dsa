from typing import List
from dataclasses import dataclass

@dataclass
class SortingMetrics:
    comparisons: int = 0
    swaps: int = 0
    operations: int = 0

class SortingAlgorithms:
    def __init__(self):
        self.metrics = SortingMetrics()
        
    def reset_metrics(self):
        self.metrics = SortingMetrics()
        
    def bubble_sort(self, arr: List[int]) -> List[int]:
        self.reset_metrics()
        n = len(arr)
        
        for i in range(n - 1):
            for j in range(n - i - 1):
                self.metrics.comparisons += 1
                
                if arr[j] > arr[j + 1]:
                    temp = arr[j]
                    arr[j] = arr[j + 1]
                    arr[j + 1] = temp
                    self.metrics.swaps += 1
                    
                self.metrics.operations += 1
                
        return arr
        
    def quick_sort(self, arr: List[int]) -> List[int]:
        self.reset_metrics()
        self._quick_sort_recursive(arr, 0, len(arr) - 1)
        return arr
        
    def _quick_sort_recursive(self, arr: List[int], low: int, high: int):
        if low < high:
            pivot_index = self._partition(arr, low, high)
            self._quick_sort_recursive(arr, low, pivot_index - 1)
            self._quick_sort_recursive(arr, pivot_index + 1, high)
            
    def _partition(self, arr: List[int], low: int, high: int) -> int:
        pivot = arr[high]
        i = low - 1
        
        for j in range(low, high):
            self.metrics.comparisons += 1
            
            if arr[j] < pivot:
                i += 1
                if i != j:
                    temp = arr[i]
                    arr[i] = arr[j]
                    arr[j] = temp
                    self.metrics.swaps += 1
                    
            self.metrics.operations += 1
            
        temp = arr[i + 1]
        arr[i + 1] = arr[high]
        arr[high] = temp
        self.metrics.swaps += 1
        
        return i + 1
        
    def merge_sort(self, arr: List[int]) -> List[int]:
        self.reset_metrics()
        return self._merge_sort_recursive(arr)
        
    def _merge_sort_recursive(self, arr: List[int]) -> List[int]:
        if len(arr) <= 1:
            return arr
            
        mid = len(arr) // 2
        left = self._merge_sort_recursive(arr[:mid])
        right = self._merge_sort_recursive(arr[mid:])
        
        return self._merge(left, right)
        
    def _merge(self, left: List[int], right: List[int]) -> List[int]:
        result = []
        i = j = 0
        
        while i < len(left) and j < len(right):
            self.metrics.comparisons += 1
            
            if left[i] <= right[j]:
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1
                
            self.metrics.operations += 1
            
        result.extend(left[i:])
        result.extend(right[j:])
        
        return result
        
    def selection_sort(self, arr: List[int]) -> List[int]:
        self.reset_metrics()
        n = len(arr)
        
        for i in range(n):
            min_idx = i
            
            for j in range(i + 1, n):
                self.metrics.comparisons += 1
                
                if arr[j] < arr[min_idx]:
                    min_idx = j
                    
                self.metrics.operations += 1
                
            if min_idx != i:
                temp = arr[i]
                arr[i] = arr[min_idx]
                arr[min_idx] = temp
                self.metrics.swaps += 1
                
        return arr
        
    def insertion_sort(self, arr: List[int]) -> List[int]:
        self.reset_metrics()
        
        for i in range(1, len(arr)):
            key = arr[i]
            j = i - 1
            
            while j >= 0 and arr[j] > key:
                self.metrics.comparisons += 1
                arr[j + 1] = arr[j]
                j -= 1
                self.metrics.operations += 1
                
            arr[j + 1] = key
            self.metrics.operations += 1
            
        return arr

def patient_data_sorting():
    sorter = SortingAlgorithms()
    
    patient_ages = [45, 32, 28, 67, 25, 55, 41, 38, 29, 52]
    patient_priorities = [9, 7, 6, 8, 4, 5, 3, 2, 1, 10]
    
    print("Patient Data Sorting System")
    print("=" * 50)
    
    algorithms = [
        ("Bubble Sort", sorter.bubble_sort),
        ("Quick Sort", sorter.quick_sort),
        ("Merge Sort", sorter.merge_sort),
        ("Selection Sort", sorter.selection_sort),
        ("Insertion Sort", sorter.insertion_sort)
    ]
    
    print(f"Original Patient Ages: {patient_ages}")
    print(f"Original Patient Priorities: {patient_priorities}")
    print()
    
    for name, algorithm in algorithms:
        ages_copy = patient_ages.copy()
        priorities_copy = patient_priorities.copy()
        
        print(f"{name} Results:")
        print("-" * 30)
        
        sorted_ages = algorithm(ages_copy)
        age_metrics = sorter.metrics
        
        sorted_priorities = algorithm(priorities_copy)
        priority_metrics = sorter.metrics
        
        print(f"Sorted Ages: {sorted_ages}")
        print(f"Age Sorting - Comparisons: {age_metrics.comparisons}, Swaps: {age_metrics.swaps}")
        
        print(f"Sorted Priorities: {sorted_priorities}")
        print(f"Priority Sorting - Comparisons: {priority_metrics.comparisons}, Swaps: {priority_metrics.swaps}")
        print()

def benchmark_sorting_algorithms():
    import random
    import time
    
    sorter = SortingAlgorithms()
    sizes = [100, 500, 1000]
    
    print("Sorting Algorithm Performance Benchmark")
    print("=" * 60)
    
    for size in sizes:
        print(f"\nArray Size: {size}")
        print("-" * 40)
        
        test_data = [random.randint(1, 1000) for _ in range(size)]
        
        algorithms = [
            ("Bubble Sort", sorter.bubble_sort),
            ("Quick Sort", sorter.quick_sort),
            ("Merge Sort", sorter.merge_sort),
            ("Selection Sort", sorter.selection_sort),
            ("Insertion Sort", sorter.insertion_sort)
        ]
        
        for name, algorithm in algorithms:
            data_copy = test_data.copy()
            
            start_time = time.time()
            sorted_data = algorithm(data_copy)
            end_time = time.time()
            
            execution_time = (end_time - start_time) * 1000
            
            print(f"{name:15} - Time: {execution_time:8.2f}ms, "
                  f"Comparisons: {sorter.metrics.comparisons:8d}, "
                  f"Swaps: {sorter.metrics.swaps:6d}")

if __name__ == "__main__":
    patient_data_sorting()
    print("\n" + "=" * 60)
    benchmark_sorting_algorithms()
