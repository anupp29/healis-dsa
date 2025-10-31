def dfs_recursive(graph, start, visited=None):  # O(V + E)
    if visited is None:
        visited = set()
    
    visited.add(start)
    print(start, end=' ')
    
    for neighbor, _ in graph.get(start, []):
        if neighbor not in visited:
            dfs_recursive(graph, neighbor, visited)
    
    return visited

def dfs_iterative(graph, start):  # O(V + E)
    visited = set()
    stack = [start]
    
    while stack:
        vertex = stack.pop()
        
        if vertex not in visited:
            visited.add(vertex)
            print(vertex, end=' ')
            
            for neighbor, _ in graph.get(vertex, []):
                if neighbor not in visited:
                    stack.append(neighbor)
    
    return visited

# Cycle Detection using DFS
def has_cycle_directed(graph):
    visited = set()
    rec_stack = set()
    
    def dfs_cycle(node):
        visited.add(node)
        rec_stack.add(node)
        
        for neighbor, _ in graph.get(node, []):
            if neighbor not in visited:
                if dfs_cycle(neighbor):
                    return True
            elif neighbor in rec_stack:
                return True
        
        rec_stack.remove(node)
        return False
    
    for vertex in graph:
        if vertex not in visited:
            if dfs_cycle(vertex):
                return True
    
    return False