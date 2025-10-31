class Queue:
    def __init__(self):
        self.items = []
    
    def enqueue(self, item):  # O(1)
        self.items.append(item)
    
    def dequeue(self):  # O(N) - use collections.deque for O(1)
        if not self.is_empty():
            return self.items.pop(0)
        return None
    
    def is_empty(self):
        return len(self.items) == 0
    
    def peek(self):
        if not self.is_empty():
            return self.items[0]
        return None
    
    def size(self):
        return len(self.items)

# Efficient implementation using collections.deque
from collections import deque

class EfficientQueue:
    def __init__(self):
        self.queue = deque()
    
    def enqueue(self, item):  # O(1)
        self.queue.append(item)
    
    def dequeue(self):  # O(1)
        if not self.is_empty():
            return self.queue.popleft()
        return None
    
    def is_empty(self):
        return len(self.queue) == 0