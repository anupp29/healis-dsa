class Graph:
    def __init__(self, directed=False):
        self.graph = {}
        self.directed = directed
    
    def add_vertex(self, vertex):  # O(1)
        if vertex not in self.graph:
            self.graph[vertex] = []
    
    def add_edge(self, u, v, weight=1):  # O(1)
        if u not in self.graph:
            self.add_vertex(u)
        if v not in self.graph:
            self.add_vertex(v)
        
        self.graph[u].append((v, weight))
        
        if not self.directed:
            self.graph[v].append((u, weight))
    
    def get_neighbors(self, vertex):
        return self.graph.get(vertex, [])
    
    def get_vertices(self):
        return list(self.graph.keys())
    
    def get_edges(self):
        edges = []
        for u in self.graph:
            for v, weight in self.graph[u]:
                if self.directed or u <= v:
                    edges.append((u, v, weight))
        return edges

# Heterogeneous Graph
class HeterogeneousGraph:
    def __init__(self):
        self.nodes = {}  # node_id -> node_type
        self.edges = {}  # (node1, node2) -> edge_type
        self.adj_list = {}
    
    def add_node(self, node_id, node_type):
        self.nodes[node_id] = node_type
        if node_id not in self.adj_list:
            self.adj_list[node_id] = []
    
    def add_edge(self, u, v, edge_type, weight=1):
        self.edges[(u, v)] = edge_type
        if u not in self.adj_list:
            self.adj_list[u] = []
        if v not in self.adj_list:
            self.adj_list[v] = []
        
        self.adj_list[u].append((v, edge_type, weight))