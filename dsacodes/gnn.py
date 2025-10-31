import numpy as np

class SimpleGNN:
    def __init__(self, input_dim, hidden_dim, output_dim):
        # Initialize weights
        self.W1 = np.random.randn(input_dim, hidden_dim) * 0.01
        self.W2 = np.random.randn(hidden_dim, output_dim) * 0.01
    
    def aggregate(self, node_features, adjacency_matrix):
        """Aggregate neighbor features"""
        # Normalize adjacency matrix
        degree = np.sum(adjacency_matrix, axis=1, keepdims=True)
        degree[degree == 0] = 1  # Avoid division by zero
        norm_adj = adjacency_matrix / degree
        
        # Aggregate
        aggregated = np.dot(norm_adj, node_features)
        return aggregated
    
    def forward(self, node_features, adjacency_matrix):
        # Layer 1
        h = self.aggregate(node_features, adjacency_matrix)
        h = np.dot(h, self.W1)
        h = np.maximum(0, h)  # ReLU
        
        # Layer 2
        h = self.aggregate(h, adjacency_matrix)
        output = np.dot(h, self.W2)
        
        return output

# Graph Attention Network (GAT) - Simplified
class SimpleGAT:
    def __init__(self, input_dim, output_dim):
        self.W = np.random.randn(input_dim, output_dim) * 0.01
        self.a = np.random.randn(2 * output_dim, 1) * 0.01
    
    def attention(self, h_i, h_j):
        """Compute attention coefficient"""
        concat = np.concatenate([h_i, h_j])
        e = np.dot(concat, self.a)
        return np.exp(e)
    
    def forward(self, node_features, edges):
        n_nodes = node_features.shape[0]
        h = np.dot(node_features, self.W)
        output = np.zeros_like(h)
        
        for i in range(n_nodes):
            neighbors = [j for j, _ in edges.get(i, [])]
            
            if not neighbors:
                output[i] = h[i]
                continue
            
            # Compute attention weights
            attention_weights = []
            for j in neighbors:
                attention_weights.append(self.attention(h[i], h[j]))
            
            # Normalize
            attention_sum = sum(attention_weights)
            attention_weights = [w / attention_sum for w in attention_weights]
            
            # Aggregate
            for j, weight in zip(neighbors, attention_weights):
                output[i] += weight * h[j]
        
        return output