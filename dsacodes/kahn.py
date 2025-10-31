
from collections import deque, defaultdict

def topological_sort_kahn(graph):  # O(V + E)
    in_degree = defaultdict(int)
    
    # Calculate in-degrees
    for u in graph:
        for v, _ in graph[u]:
            in_degree[v] += 1
    
    # Find all vertices with in-degree 0
    queue = deque([u for u in graph if in_degree[u] == 0])
    topo_order = []
    
    while queue:
        u = queue.popleft()
        topo_order.append(u)
        
        for v, _ in graph.get(u, []):
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)
    
    # Check for cycle
    if len(topo_order) == len(graph):
        return topo_order
    else:
        return None  # Graph has a cycle

# DFS-based Topological Sort
def topological_sort_dfs(graph):
    visited = set()
    stack = []
    
    def dfs(node):
        visited.add(node)
        for neighbor, _ in graph.get(node, []):
            if neighbor not in visited:
                dfs(neighbor)
        stack.append(node)
    
    for vertex in graph:
        if vertex not in visited:
            dfs(vertex)
    
    return stack[::-1]