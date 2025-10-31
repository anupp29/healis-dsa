import numpy as np
from collections import deque

class DBSCAN:
    def __init__(self, eps=0.5, min_samples=5):
        self.eps = eps
        self.min_samples = min_samples
    
    def fit_predict(self, X):
        n_samples = X.shape[0]
        labels = np.full(n_samples, -1)
        cluster_id = 0
        
        for i in range(n_samples):
            if labels[i] != -1:
                continue
            
            neighbors = self._get_neighbors(X, i)
            
            if len(neighbors) < self.min_samples:
                labels[i] = -1  # Noise point
            else:
                self._expand_cluster(X, labels, i, neighbors, cluster_id)
                cluster_id += 1
        
        return labels
    
    def _get_neighbors(self, X, idx):
        distances = np.sqrt(((X - X[idx])**2).sum(axis=1))
        return np.where(distances <= self.eps)[0]
    
    def _expand_cluster(self, X, labels, idx, neighbors, cluster_id):
        labels[idx] = cluster_id
        queue = deque(neighbors)
        
        while queue:
            current = queue.popleft()
            
            if labels[current] == -1:
                labels[current] = cluster_id
            
            if labels[current] != -1:
                continue
            
            labels[current] = cluster_id
            current_neighbors = self._get_neighbors(X, current)
            
            if len(current_neighbors) >= self.min_samples:
                queue.extend(current_neighbors)