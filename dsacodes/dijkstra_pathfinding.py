import heapq
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass

@dataclass
class Cell:
    row: int
    col: int
    is_wall: bool = False
    is_start: bool = False
    is_end: bool = False
    is_visited: bool = False
    is_path: bool = False
    distance: float = float('inf')
    previous_cell: Optional['Cell'] = None
    
    def __hash__(self):
        return hash((self.row, self.col))
        
    def __eq__(self, other):
        return self.row == other.row and self.col == other.col

class DijkstraPathfinder:
    def __init__(self, rows: int, cols: int):
        self.rows = rows
        self.cols = cols
        self.grid: List[List[Cell]] = []
        self.start_cell: Optional[Cell] = None
        self.end_cell: Optional[Cell] = None
        self.visited_nodes = 0
        self.path_length = 0
        
    def initialize_grid(self):
        self.grid = []
        for row in range(self.rows):
            current_row = []
            for col in range(self.cols):
                cell = Cell(row, col)
                current_row.append(cell)
            self.grid.append(current_row)
            
    def set_start(self, row: int, col: int):
        if self.start_cell:
            self.start_cell.is_start = False
        self.start_cell = self.grid[row][col]
        self.start_cell.is_start = True
        self.start_cell.distance = 0
        
    def set_end(self, row: int, col: int):
        if self.end_cell:
            self.end_cell.is_end = False
        self.end_cell = self.grid[row][col]
        self.end_cell.is_end = True
        
    def set_wall(self, row: int, col: int, is_wall: bool = True):
        if not self.grid[row][col].is_start and not self.grid[row][col].is_end:
            self.grid[row][col].is_wall = is_wall
            
    def get_neighbors(self, cell: Cell) -> List[Cell]:
        neighbors = []
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
        
        for dr, dc in directions:
            new_row, new_col = cell.row + dr, cell.col + dc
            if (0 <= new_row < self.rows and 0 <= new_col < self.cols and 
                not self.grid[new_row][new_col].is_wall):
                neighbors.append(self.grid[new_row][new_col])
                
        return neighbors
        
    def dijkstra(self) -> bool:
        if not self.start_cell or not self.end_cell:
            return False
            
        for row in self.grid:
            for cell in row:
                cell.distance = float('inf')
                cell.is_visited = False
                cell.is_path = False
                cell.previous_cell = None
                
        self.start_cell.distance = 0
        unvisited = [(0, self.start_cell)]
        self.visited_nodes = 0
        
        while unvisited:
            current_distance, current_cell = heapq.heappop(unvisited)
            
            if current_cell.is_visited:
                continue
                
            current_cell.is_visited = True
            self.visited_nodes += 1
            
            if current_cell == self.end_cell:
                self._reconstruct_path()
                return True
                
            for neighbor in self.get_neighbors(current_cell):
                if not neighbor.is_visited:
                    new_distance = current_distance + 1
                    
                    if new_distance < neighbor.distance:
                        neighbor.distance = new_distance
                        neighbor.previous_cell = current_cell
                        heapq.heappush(unvisited, (new_distance, neighbor))
                        
        return False
        
    def _reconstruct_path(self):
        path = []
        current = self.end_cell
        
        while current:
            path.append(current)
            current = current.previous_cell
            
        path.reverse()
        self.path_length = len(path) - 1
        
        for cell in path:
            if not cell.is_start and not cell.is_end:
                cell.is_path = True
                
    def print_grid(self):
        for row in self.grid:
            for cell in row:
                if cell.is_start:
                    print("S", end=" ")
                elif cell.is_end:
                    print("E", end=" ")
                elif cell.is_wall:
                    print("█", end=" ")
                elif cell.is_path:
                    print("*", end=" ")
                elif cell.is_visited:
                    print(".", end=" ")
                else:
                    print(" ", end=" ")
            print()
            
    def print_distances(self):
        for row in self.grid:
            for cell in row:
                if cell.is_wall:
                    print("█".rjust(3), end=" ")
                elif cell.distance == float('inf'):
                    print("∞".rjust(3), end=" ")
                else:
                    print(f"{int(cell.distance)}".rjust(3), end=" ")
            print()

def hospital_navigation_system():
    pathfinder = DijkstraPathfinder(10, 15)
    pathfinder.initialize_grid()
    
    print("Hospital Navigation System - Dijkstra's Algorithm")
    print("=" * 60)
    
    pathfinder.set_start(2, 2)
    pathfinder.set_end(7, 12)
    
    walls = [
        (3, 5), (3, 6), (3, 7), (4, 5), (5, 5), (6, 5),
        (4, 9), (5, 9), (6, 9), (7, 9), (8, 9),
        (1, 10), (2, 10), (3, 10), (4, 10)
    ]
    
    for row, col in walls:
        pathfinder.set_wall(row, col)
    
    print("Initial Hospital Layout:")
    print("S = Start (Reception), E = End (Emergency), █ = Blocked Path")
    pathfinder.print_grid()
    
    print(f"\nFinding shortest path from Reception to Emergency...")
    path_found = pathfinder.dijkstra()
    
    if path_found:
        print(f"Path Found!")
        print(f"Visited Nodes: {pathfinder.visited_nodes}")
        print(f"Path Length: {pathfinder.path_length}")
        print(f"Final Distance: {pathfinder.end_cell.distance}")
        
        print(f"\nOptimal Path (* = path, . = explored):")
        pathfinder.print_grid()
        
        print(f"\nDistance Map (showing shortest distances from start):")
        pathfinder.print_distances()
    else:
        print("No path found to destination!")

if __name__ == "__main__":
    hospital_navigation_system()
