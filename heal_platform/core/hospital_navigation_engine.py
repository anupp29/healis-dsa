"""
Hospital Navigation System using Graph Algorithms
Advanced pathfinding and navigation optimization
"""

import heapq
from typing import List, Dict, Any, Optional, Tuple, Set
from collections import defaultdict, deque
from enum import Enum
import math
import json

class LocationType(Enum):
    ENTRANCE = "Entrance"
    EMERGENCY = "Emergency"
    RECEPTION = "Reception"
    CONSULTATION_ROOM = "Consultation Room"
    LABORATORY = "Laboratory"
    PHARMACY = "Pharmacy"
    RADIOLOGY = "Radiology"
    SURGERY = "Surgery"
    ICU = "ICU"
    WARD = "Ward"
    CAFETERIA = "Cafeteria"
    RESTROOM = "Restroom"
    ELEVATOR = "Elevator"
    STAIRS = "Stairs"
    PARKING = "Parking"
    ADMIN = "Administration"

class AccessibilityType(Enum):
    WHEELCHAIR_ACCESSIBLE = "Wheelchair Accessible"
    STAIRS_ONLY = "Stairs Only"
    ELEVATOR_REQUIRED = "Elevator Required"
    NORMAL = "Normal"

class Location:
    """Hospital location node with navigation attributes"""
    
    def __init__(self, location_data: Dict[str, Any]):
        self.location_id = location_data.get('locationId', '')
        self.name = location_data.get('name', '')
        self.location_type = LocationType(location_data.get('locationType', 'CONSULTATION_ROOM'))
        self.floor = location_data.get('floor', 1)
        self.building = location_data.get('building', 'Main')
        self.coordinates = location_data.get('coordinates', {'x': 0, 'y': 0})
        self.accessibility = AccessibilityType(location_data.get('accessibility', 'NORMAL'))
        self.capacity = location_data.get('capacity', 1)
        self.current_occupancy = location_data.get('currentOccupancy', 0)
        self.is_operational = location_data.get('isOperational', True)
        self.department = location_data.get('department', '')
        self.description = location_data.get('description', '')
        self.amenities = location_data.get('amenities', [])
        self.emergency_exit = location_data.get('emergencyExit', False)
        self.raw_data = location_data
    
    def is_available(self) -> bool:
        """Check if location is available for navigation"""
        return (self.is_operational and 
                self.current_occupancy < self.capacity)
    
    def get_utilization(self) -> float:
        """Get current utilization percentage"""
        if self.capacity == 0:
            return 0
        return (self.current_occupancy / self.capacity) * 100
    
    def __str__(self):
        return f"Location({self.location_id}, {self.name}, Floor {self.floor})"

class NavigationEdge:
    """Edge representing connection between locations"""
    
    def __init__(self, from_location: str, to_location: str, edge_data: Dict[str, Any]):
        self.from_location = from_location
        self.to_location = to_location
        self.distance = edge_data.get('distance', 0)  # in meters
        self.travel_time = edge_data.get('travelTime', 0)  # in seconds
        self.accessibility = AccessibilityType(edge_data.get('accessibility', 'NORMAL'))
        self.is_indoor = edge_data.get('isIndoor', True)
        self.requires_keycard = edge_data.get('requiresKeycard', False)
        self.is_emergency_route = edge_data.get('isEmergencyRoute', False)
        self.congestion_factor = edge_data.get('congestionFactor', 1.0)  # 1.0 = normal, >1.0 = congested
        self.is_operational = edge_data.get('isOperational', True)
    
    def get_weighted_distance(self, accessibility_needs: AccessibilityType = AccessibilityType.NORMAL) -> float:
        """Get distance with accessibility and congestion weighting"""
        if not self.is_operational:
            return float('inf')
        
        # Base distance
        weight = self.distance
        
        # Accessibility penalty
        if (accessibility_needs == AccessibilityType.WHEELCHAIR_ACCESSIBLE and 
            self.accessibility == AccessibilityType.STAIRS_ONLY):
            return float('inf')  # Inaccessible
        
        # Congestion penalty
        weight *= self.congestion_factor
        
        # Emergency route bonus
        if self.is_emergency_route:
            weight *= 0.8
        
        return weight

class HospitalGraph:
    """Graph representation of hospital layout"""
    
    def __init__(self):
        self.locations = {}  # location_id -> Location
        self.adjacency_list = defaultdict(list)  # location_id -> [NavigationEdge]
        self.floor_map = defaultdict(list)  # floor -> [location_ids]
        self.department_map = defaultdict(list)  # department -> [location_ids]
    
    def add_location(self, location: Location):
        """Add location to the graph"""
        self.locations[location.location_id] = location
        self.floor_map[location.floor].append(location.location_id)
        if location.department:
            self.department_map[location.department].append(location.location_id)
    
    def add_edge(self, edge: NavigationEdge):
        """Add bidirectional edge between locations"""
        self.adjacency_list[edge.from_location].append(edge)
        # Create reverse edge
        reverse_edge = NavigationEdge(
            edge.to_location, 
            edge.from_location, 
            {
                'distance': edge.distance,
                'travelTime': edge.travel_time,
                'accessibility': edge.accessibility.value,
                'isIndoor': edge.is_indoor,
                'requiresKeycard': edge.requires_keycard,
                'isEmergencyRoute': edge.is_emergency_route,
                'congestionFactor': edge.congestion_factor,
                'isOperational': edge.is_operational
            }
        )
        self.adjacency_list[edge.to_location].append(reverse_edge)
    
    def get_neighbors(self, location_id: str) -> List[NavigationEdge]:
        """Get all neighboring locations"""
        return self.adjacency_list.get(location_id, [])
    
    def find_locations_by_type(self, location_type: LocationType) -> List[Location]:
        """Find all locations of a specific type"""
        return [loc for loc in self.locations.values() if loc.location_type == location_type]
    
    def find_locations_by_department(self, department: str) -> List[Location]:
        """Find all locations in a department"""
        location_ids = self.department_map.get(department, [])
        return [self.locations[loc_id] for loc_id in location_ids if loc_id in self.locations]
    
    def get_floor_locations(self, floor: int) -> List[Location]:
        """Get all locations on a specific floor"""
        location_ids = self.floor_map.get(floor, [])
        return [self.locations[loc_id] for loc_id in location_ids if loc_id in self.locations]

class PathfindingAlgorithms:
    """Advanced pathfinding algorithms for hospital navigation"""
    
    @staticmethod
    def dijkstra_shortest_path(
        graph: HospitalGraph, 
        start: str, 
        end: str, 
        accessibility_needs: AccessibilityType = AccessibilityType.NORMAL
    ) -> Tuple[List[str], float]:
        """Find shortest path using Dijkstra's algorithm"""
        
        if start not in graph.locations or end not in graph.locations:
            return [], float('inf')
        
        distances = {location_id: float('inf') for location_id in graph.locations}
        distances[start] = 0
        previous = {}
        pq = [(0, start)]
        visited = set()
        
        while pq:
            current_distance, current = heapq.heappop(pq)
            
            if current in visited:
                continue
            
            visited.add(current)
            
            if current == end:
                break
            
            for edge in graph.get_neighbors(current):
                neighbor = edge.to_location
                weight = edge.get_weighted_distance(accessibility_needs)
                
                if weight == float('inf'):
                    continue
                
                distance = current_distance + weight
                
                if distance < distances[neighbor]:
                    distances[neighbor] = distance
                    previous[neighbor] = current
                    heapq.heappush(pq, (distance, neighbor))
        
        # Reconstruct path
        path = []
        current = end
        while current in previous:
            path.append(current)
            current = previous[current]
        path.append(start)
        path.reverse()
        
        return path, distances[end]
    
    @staticmethod
    def a_star_pathfinding(
        graph: HospitalGraph, 
        start: str, 
        end: str, 
        accessibility_needs: AccessibilityType = AccessibilityType.NORMAL
    ) -> Tuple[List[str], float]:
        """A* pathfinding with heuristic optimization"""
        
        def heuristic(loc1_id: str, loc2_id: str) -> float:
            """Calculate Euclidean distance heuristic"""
            loc1 = graph.locations[loc1_id]
            loc2 = graph.locations[loc2_id]
            
            # Add floor difference penalty
            floor_penalty = abs(loc1.floor - loc2.floor) * 20
            
            # Calculate 2D distance
            dx = loc1.coordinates['x'] - loc2.coordinates['x']
            dy = loc1.coordinates['y'] - loc2.coordinates['y']
            distance = math.sqrt(dx*dx + dy*dy)
            
            return distance + floor_penalty
        
        if start not in graph.locations or end not in graph.locations:
            return [], float('inf')
        
        open_set = [(0, start)]
        came_from = {}
        g_score = {location_id: float('inf') for location_id in graph.locations}
        g_score[start] = 0
        f_score = {location_id: float('inf') for location_id in graph.locations}
        f_score[start] = heuristic(start, end)
        
        while open_set:
            current = heapq.heappop(open_set)[1]
            
            if current == end:
                # Reconstruct path
                path = []
                while current in came_from:
                    path.append(current)
                    current = came_from[current]
                path.append(start)
                path.reverse()
                return path, g_score[end]
            
            for edge in graph.get_neighbors(current):
                neighbor = edge.to_location
                weight = edge.get_weighted_distance(accessibility_needs)
                
                if weight == float('inf'):
                    continue
                
                tentative_g_score = g_score[current] + weight
                
                if tentative_g_score < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g_score
                    f_score[neighbor] = g_score[neighbor] + heuristic(neighbor, end)
                    heapq.heappush(open_set, (f_score[neighbor], neighbor))
        
        return [], float('inf')
    
    @staticmethod
    def find_multiple_destinations(
        graph: HospitalGraph, 
        start: str, 
        destinations: List[str], 
        accessibility_needs: AccessibilityType = AccessibilityType.NORMAL
    ) -> Dict[str, Tuple[List[str], float]]:
        """Find optimal paths to multiple destinations"""
        
        results = {}
        
        # Use Dijkstra from start to find distances to all nodes
        distances = {location_id: float('inf') for location_id in graph.locations}
        distances[start] = 0
        previous = {}
        pq = [(0, start)]
        visited = set()
        
        while pq:
            current_distance, current = heapq.heappop(pq)
            
            if current in visited:
                continue
            
            visited.add(current)
            
            for edge in graph.get_neighbors(current):
                neighbor = edge.to_location
                weight = edge.get_weighted_distance(accessibility_needs)
                
                if weight == float('inf'):
                    continue
                
                distance = current_distance + weight
                
                if distance < distances[neighbor]:
                    distances[neighbor] = distance
                    previous[neighbor] = current
                    heapq.heappush(pq, (distance, neighbor))
        
        # Reconstruct paths for each destination
        for destination in destinations:
            if destination in graph.locations and distances[destination] != float('inf'):
                path = []
                current = destination
                while current in previous:
                    path.append(current)
                    current = previous[current]
                path.append(start)
                path.reverse()
                results[destination] = (path, distances[destination])
            else:
                results[destination] = ([], float('inf'))
        
        return results

class CrowdFlowAnalyzer:
    """Analyze and predict crowd flow patterns"""
    
    def __init__(self):
        self.location_traffic = defaultdict(list)  # location_id -> [traffic_data]
        self.time_patterns = defaultdict(dict)  # hour -> {location_id: traffic_level}
    
    def update_traffic_data(self, location_id: str, traffic_level: float, timestamp: str):
        """Update traffic data for a location"""
        self.location_traffic[location_id].append({
            'traffic_level': traffic_level,
            'timestamp': timestamp
        })
    
    def get_congestion_factor(self, location_id: str, current_hour: int) -> float:
        """Get current congestion factor for a location"""
        # Simplified congestion calculation
        base_congestion = self.time_patterns.get(current_hour, {}).get(location_id, 1.0)
        
        # Add some randomness for realistic simulation
        import random
        variation = random.uniform(0.8, 1.2)
        
        return base_congestion * variation
    
    def predict_optimal_time(self, path: List[str]) -> Dict[str, Any]:
        """Predict optimal travel time for a path"""
        total_congestion = 0
        high_traffic_locations = []
        
        for location_id in path:
            congestion = self.get_congestion_factor(location_id, 12)  # Assume noon
            total_congestion += congestion
            
            if congestion > 1.5:
                high_traffic_locations.append(location_id)
        
        avg_congestion = total_congestion / len(path) if path else 1.0
        
        return {
            'average_congestion': avg_congestion,
            'high_traffic_locations': high_traffic_locations,
            'recommended_delay': max(0, (avg_congestion - 1.0) * 10)  # minutes
        }

class EmergencyEvacuationPlanner:
    """Emergency evacuation route planning"""
    
    @staticmethod
    def find_evacuation_routes(
        graph: HospitalGraph, 
        start_locations: List[str], 
        max_routes: int = 3
    ) -> List[Dict[str, Any]]:
        """Find multiple evacuation routes to exits"""
        
        # Find all emergency exits
        exits = [loc.location_id for loc in graph.locations.values() 
                if loc.emergency_exit or loc.location_type == LocationType.ENTRANCE]
        
        evacuation_routes = []
        
        for start in start_locations:
            routes_from_start = []
            
            for exit_id in exits:
                path, distance = PathfindingAlgorithms.dijkstra_shortest_path(
                    graph, start, exit_id, AccessibilityType.NORMAL
                )
                
                if path and distance != float('inf'):
                    routes_from_start.append({
                        'start': start,
                        'exit': exit_id,
                        'path': path,
                        'distance': distance,
                        'estimated_time': distance / 1.5,  # Assume 1.5 m/s walking speed
                        'exit_name': graph.locations[exit_id].name
                    })
            
            # Sort by distance and take top routes
            routes_from_start.sort(key=lambda x: x['distance'])
            evacuation_routes.extend(routes_from_start[:max_routes])
        
        return evacuation_routes

class HospitalNavigationEngine:
    """Main navigation engine combining all components"""
    
    def __init__(self):
        self.graph = HospitalGraph()
        self.crowd_analyzer = CrowdFlowAnalyzer()
        self.pathfinding = PathfindingAlgorithms()
        self.evacuation_planner = EmergencyEvacuationPlanner()
    
    def initialize_hospital_layout(self):
        """Initialize default hospital layout"""
        # Sample locations
        locations_data = [
            {
                'locationId': 'ENTRANCE_MAIN',
                'name': 'Main Entrance',
                'locationType': 'ENTRANCE',
                'floor': 1,
                'coordinates': {'x': 0, 'y': 0},
                'emergencyExit': True
            },
            {
                'locationId': 'RECEPTION_01',
                'name': 'Main Reception',
                'locationType': 'RECEPTION',
                'floor': 1,
                'coordinates': {'x': 10, 'y': 5},
                'department': 'Administration'
            },
            {
                'locationId': 'EMERGENCY_01',
                'name': 'Emergency Department',
                'locationType': 'EMERGENCY',
                'floor': 1,
                'coordinates': {'x': -20, 'y': 10},
                'department': 'Emergency',
                'capacity': 20
            },
            {
                'locationId': 'LAB_01',
                'name': 'Main Laboratory',
                'locationType': 'LABORATORY',
                'floor': 2,
                'coordinates': {'x': 15, 'y': 20},
                'department': 'Laboratory'
            },
            {
                'locationId': 'PHARMACY_01',
                'name': 'Main Pharmacy',
                'locationType': 'PHARMACY',
                'floor': 1,
                'coordinates': {'x': 25, 'y': 15},
                'department': 'Pharmacy'
            },
            {
                'locationId': 'CONSULT_01',
                'name': 'Consultation Room 1',
                'locationType': 'CONSULTATION_ROOM',
                'floor': 2,
                'coordinates': {'x': 30, 'y': 25},
                'department': 'General Medicine'
            },
            {
                'locationId': 'ELEVATOR_01',
                'name': 'Main Elevator',
                'locationType': 'ELEVATOR',
                'floor': 1,
                'coordinates': {'x': 20, 'y': 10},
                'accessibility': 'WHEELCHAIR_ACCESSIBLE'
            }
        ]
        
        # Add locations to graph
        for loc_data in locations_data:
            location = Location(loc_data)
            self.graph.add_location(location)
        
        # Sample edges
        edges_data = [
            ('ENTRANCE_MAIN', 'RECEPTION_01', {'distance': 15, 'travelTime': 20}),
            ('RECEPTION_01', 'ELEVATOR_01', {'distance': 12, 'travelTime': 15}),
            ('RECEPTION_01', 'EMERGENCY_01', {'distance': 35, 'travelTime': 45}),
            ('RECEPTION_01', 'PHARMACY_01', {'distance': 20, 'travelTime': 25}),
            ('ELEVATOR_01', 'LAB_01', {'distance': 8, 'travelTime': 30, 'accessibility': 'WHEELCHAIR_ACCESSIBLE'}),
            ('ELEVATOR_01', 'CONSULT_01', {'distance': 15, 'travelTime': 35})
        ]
        
        # Add edges to graph
        for from_loc, to_loc, edge_data in edges_data:
            edge = NavigationEdge(from_loc, to_loc, edge_data)
            self.graph.add_edge(edge)
    
    def find_optimal_route(
        self, 
        start: str, 
        destination: str, 
        accessibility_needs: str = 'NORMAL',
        algorithm: str = 'dijkstra'
    ) -> Dict[str, Any]:
        """Find optimal route between two locations"""
        
        accessibility = AccessibilityType(accessibility_needs)
        
        if algorithm == 'astar':
            path, distance = self.pathfinding.a_star_pathfinding(
                self.graph, start, destination, accessibility
            )
        else:
            path, distance = self.pathfinding.dijkstra_shortest_path(
                self.graph, start, destination, accessibility
            )
        
        if not path or distance == float('inf'):
            return {
                'success': False,
                'message': 'No route found',
                'path': [],
                'distance': 0,
                'estimated_time': 0
            }
        
        # Get detailed route information
        route_details = []
        total_time = 0
        
        for i in range(len(path) - 1):
            current_loc = self.graph.locations[path[i]]
            next_loc = self.graph.locations[path[i + 1]]
            
            # Find edge between locations
            edge = None
            for e in self.graph.get_neighbors(path[i]):
                if e.to_location == path[i + 1]:
                    edge = e
                    break
            
            if edge:
                total_time += edge.travel_time
                route_details.append({
                    'from': {
                        'id': current_loc.location_id,
                        'name': current_loc.name,
                        'floor': current_loc.floor
                    },
                    'to': {
                        'id': next_loc.location_id,
                        'name': next_loc.name,
                        'floor': next_loc.floor
                    },
                    'distance': edge.distance,
                    'travel_time': edge.travel_time,
                    'instructions': self._generate_instructions(current_loc, next_loc, edge)
                })
        
        # Analyze crowd flow
        crowd_analysis = self.crowd_analyzer.predict_optimal_time(path)
        
        return {
            'success': True,
            'path': path,
            'distance': distance,
            'estimated_time': total_time,
            'route_details': route_details,
            'crowd_analysis': crowd_analysis,
            'accessibility_compliant': accessibility != AccessibilityType.WHEELCHAIR_ACCESSIBLE or 
                                     all(self._is_wheelchair_accessible(path[i], path[i+1]) 
                                         for i in range(len(path)-1))
        }
    
    def _generate_instructions(self, from_loc: Location, to_loc: Location, edge: NavigationEdge) -> str:
        """Generate navigation instructions"""
        if from_loc.floor != to_loc.floor:
            if to_loc.location_type == LocationType.ELEVATOR:
                return f"Take elevator to floor {to_loc.floor}"
            elif to_loc.location_type == LocationType.STAIRS:
                return f"Take stairs to floor {to_loc.floor}"
            else:
                return f"Go to floor {to_loc.floor}"
        
        direction = self._calculate_direction(from_loc, to_loc)
        return f"Head {direction} to {to_loc.name}"
    
    def _calculate_direction(self, from_loc: Location, to_loc: Location) -> str:
        """Calculate direction between locations"""
        dx = to_loc.coordinates['x'] - from_loc.coordinates['x']
        dy = to_loc.coordinates['y'] - from_loc.coordinates['y']
        
        if abs(dx) > abs(dy):
            return "east" if dx > 0 else "west"
        else:
            return "north" if dy > 0 else "south"
    
    def _is_wheelchair_accessible(self, from_id: str, to_id: str) -> bool:
        """Check if path segment is wheelchair accessible"""
        for edge in self.graph.get_neighbors(from_id):
            if (edge.to_location == to_id and 
                edge.accessibility in [AccessibilityType.WHEELCHAIR_ACCESSIBLE, AccessibilityType.NORMAL]):
                return True
        return False
    
    def find_nearest_locations(self, start: str, location_type: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Find nearest locations of a specific type"""
        target_type = LocationType(location_type)
        target_locations = self.graph.find_locations_by_type(target_type)
        
        results = []
        
        for target_loc in target_locations:
            if target_loc.is_available():
                path, distance = self.pathfinding.dijkstra_shortest_path(
                    self.graph, start, target_loc.location_id
                )
                
                if path and distance != float('inf'):
                    results.append({
                        'location_id': target_loc.location_id,
                        'name': target_loc.name,
                        'distance': distance,
                        'floor': target_loc.floor,
                        'department': target_loc.department,
                        'utilization': target_loc.get_utilization(),
                        'path': path
                    })
        
        # Sort by distance and return top results
        results.sort(key=lambda x: x['distance'])
        return results[:max_results]
    
    def get_emergency_evacuation_plan(self, current_locations: List[str]) -> Dict[str, Any]:
        """Get emergency evacuation plan"""
        evacuation_routes = self.evacuation_planner.find_evacuation_routes(
            self.graph, current_locations
        )
        
        return {
            'evacuation_routes': evacuation_routes,
            'total_locations': len(current_locations),
            'routes_found': len(evacuation_routes),
            'average_evacuation_time': sum(route['estimated_time'] for route in evacuation_routes) / len(evacuation_routes) if evacuation_routes else 0
        }
    
    def get_navigation_analytics(self) -> Dict[str, Any]:
        """Get navigation system analytics"""
        total_locations = len(self.graph.locations)
        total_edges = sum(len(edges) for edges in self.graph.adjacency_list.values()) // 2  # Undirected
        
        # Location type distribution
        type_distribution = defaultdict(int)
        floor_distribution = defaultdict(int)
        
        for location in self.graph.locations.values():
            type_distribution[location.location_type.value] += 1
            floor_distribution[location.floor] += 1
        
        return {
            'total_locations': total_locations,
            'total_connections': total_edges,
            'location_type_distribution': dict(type_distribution),
            'floor_distribution': dict(floor_distribution),
            'departments': list(self.graph.department_map.keys()),
            'accessibility_coverage': self._calculate_accessibility_coverage()
        }
    
    def _calculate_accessibility_coverage(self) -> float:
        """Calculate percentage of wheelchair accessible paths"""
        accessible_edges = 0
        total_edges = 0
        
        for edges in self.graph.adjacency_list.values():
            for edge in edges:
                total_edges += 1
                if edge.accessibility in [AccessibilityType.WHEELCHAIR_ACCESSIBLE, AccessibilityType.NORMAL]:
                    accessible_edges += 1
        
        return (accessible_edges / total_edges * 100) if total_edges > 0 else 0
