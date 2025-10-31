import numpy as np

class OPTICS:
    def __init__(self, min_samples=5, max_eps=np.inf):
        self.min_samples = min_samples
        self.max_eps = max_eps
    
    def fit(self, X):
        n_samples = X.shape[0]
        self.reachability = np.full(n_samples, np.inf)
        self.core_distances = np.full(n_samples, np.inf)
        self.ordering = []
        processed = np.zeros(n_samples, dtype=bool)
        
        # Compute distances
        distances = np.sqrt(((X[:, np.newaxis] - X)**2).sum(axis=2))
        
        # Compute core distances
        for i in range(n_samples):
            neighbors_dist = np.sort(distances[i])
            if len(neighbors_dist) >= self.min_samples:
                self.core_distances[i] = neighbors_dist[self.min_samples]
        
        # Build ordering
        for i in range(n_samples):
            if processed[i]:
                continue
            
            neighbors = np.where(distances[i] <= self.max_eps)[0]
            processed[i] = True
            self.ordering.append(i)
            
            if self.core_distances[i] != np.inf:
                seeds = []
                self._update_seeds(i, neighbors, distances, processed, seeds)
                
                while seeds:
                    seeds.sort(key=lambda x: x[0])
                    reach_dist, current = seeds.pop(0)
                    
                    if processed[current]:
                        continue
                    
                    self.reachability[current] = reach_dist
                    processed[current] = True
                    self.ordering.append(current)
                    
                    current_neighbors = np.where(distances[current] <= self.max_eps)[0]
                    if self.core_distances[current] != np.inf:
                        self._update_seeds(current, current_neighbors, distances, processed, seeds)
        
        return self.ordering, self.reachability
    
    def _update_seeds(self, center_idx, neighbors, distances, processed, seeds):
        for neighbor in neighbors:
            if processed[neighbor]:
                continue
            
            new_reach_dist = max(self.core_distances[center_idx], distances[center_idx][neighbor])
            
            if self.reachability[neighbor] == np.inf:
                self.reachability[neighbor] = new_reach_dist
                seeds.append((new_reach_dist, neighbor))
            elif new_reach_dist < self.reachability[neighbor]:
                self.reachability[neighbor] = new_reach_dist