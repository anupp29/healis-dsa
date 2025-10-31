def degree_centrality(graph):
    """Calculate degree centrality for all nodes"""
    centrality = {}
    n = len(graph)
    
    for node in graph:
        degree = len(graph[node])
        # Normalize by (n-1)
        centrality[node] = degree / (n - 1) if n > 1 else 0
    
    return centrality

def in_degree_centrality(graph):
    """For directed graphs"""
    in_degree = {node: 0 for node in graph}
    
    for node in graph:
        for neighbor, _ in graph[node]:
            in_degree[neighbor] += 1
    
    n = len(graph)
    return {node: deg / (n - 1) if n > 1 else 0 
            for node, deg in in_degree.items()}

def out_degree_centrality(graph):
    """For directed graphs"""
    n = len(graph)
    return {node: len(graph[node]) / (n - 1) if n > 1 else 0 
            for node in graph}