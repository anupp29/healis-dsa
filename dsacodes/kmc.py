import numpy as np

class KMeans:
    def __init__(self, k=3, max_iters=100):
        self.k = k
        self.max_iters = max_iters
        self.centroids = None
    
    def fit(self, X):
        # Randomly initialize centroids
        n_samples, n_features = X.shape
        random_indices = np.random.choice(n_samples, self.k, replace=False)
        self.centroids = X[random_indices]
        
        for _ in range(self.max_iters):
            # Assign clusters
            clusters = self._assign_clusters(X)
            
            # Store old centroids
            old_centroids = self.centroids.copy()
            
            # Update centroids
            self.centroids = self._update_centroids(X, clusters)
            
            # Check convergence
            if np.allclose(old_centroids, self.centroids):
                break
        
        return clusters
    
    def _assign_clusters(self, X):
        distances = np.sqrt(((X - self.centroids[:, np.newaxis])**2).sum(axis=2))
        return np.argmin(distances, axis=0)
    
    def _update_centroids(self, X, clusters):
        centroids = np.zeros((self.k, X.shape[1]))
        for k in range(self.k):
            cluster_points = X[clusters == k]
            if len(cluster_points) > 0:
                centroids[k] = cluster_points.mean(axis=0)
        return centroids
    
    def predict(self, X):
        return self._assign_clusters(X)