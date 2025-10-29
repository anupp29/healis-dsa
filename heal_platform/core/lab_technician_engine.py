"""
Lab Technician Workflow DSA Engine
Advanced queue management and test processing optimization
"""

import heapq
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from collections import deque, defaultdict
from enum import Enum
import json

class TestPriority(Enum):
    EMERGENCY = 1
    URGENT = 2
    ROUTINE = 3
    SCHEDULED = 4

class TestStatus(Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"
    DELAYED = "Delayed"

class LabTest:
    """Lab Test data structure with DSA-optimized attributes"""
    
    def __init__(self, test_data: Dict[str, Any]):
        self.test_id = test_data.get('testId', '')
        self.patient_id = test_data.get('patient', {}).get('userId', '')
        self.patient_name = test_data.get('patient', {}).get('fullName', '')
        self.patient_email = test_data.get('patient', {}).get('email', '')
        self.tests = test_data.get('tests', [])
        self.booking_date = test_data.get('bookingDate')
        self.booking_time = test_data.get('bookingTime', '')
        self.total_amount = test_data.get('totalAmount', 0)
        self.status = TestStatus(test_data.get('status', 'Pending'))
        self.priority = self._determine_priority(test_data)
        self.estimated_duration = self._calculate_duration()
        self.assigned_technician = test_data.get('assignedTechnician', '')
        self.created_at = test_data.get('createdAt', datetime.now())
        self.raw_data = test_data
    
    def _determine_priority(self, test_data: Dict[str, Any]) -> TestPriority:
        """Determine test priority based on test types"""
        emergency_tests = ['cardiac', 'blood_gas', 'troponin', 'emergency']
        urgent_tests = ['blood_sugar', 'hemoglobin', 'creatinine']
        
        for test in self.tests:
            test_name = test.get('name', '').lower()
            if any(emergency in test_name for emergency in emergency_tests):
                return TestPriority.EMERGENCY
            elif any(urgent in test_name for urgent in urgent_tests):
                return TestPriority.URGENT
        
        return TestPriority.ROUTINE
    
    def _calculate_duration(self) -> int:
        """Calculate estimated test duration in minutes"""
        base_duration = 15  # Base duration per test
        return len(self.tests) * base_duration
    
    def __lt__(self, other):
        # For priority queue (lower priority value = higher priority)
        if self.priority.value != other.priority.value:
            return self.priority.value < other.priority.value
        # If same priority, earlier booking time has priority
        return self.booking_time < other.booking_time
    
    def __str__(self):
        return f"LabTest({self.test_id}, {self.patient_name}, {self.priority.name})"

class LabTestPriorityQueue:
    """Priority Queue for lab test management"""
    
    def __init__(self):
        self.heap = []
        self.index = 0
        self.test_lookup = {}  # For O(1) test lookup
    
    def add_test(self, lab_test: LabTest):
        """Add test to priority queue"""
        priority_score = self._calculate_priority_score(lab_test)
        heapq.heappush(self.heap, (priority_score, self.index, lab_test))
        self.test_lookup[lab_test.test_id] = lab_test
        self.index += 1
    
    def _calculate_priority_score(self, lab_test: LabTest) -> float:
        """Calculate comprehensive priority score"""
        base_score = lab_test.priority.value * 100
        
        # Add urgency based on booking time
        if lab_test.booking_date:
            if isinstance(lab_test.booking_date, str):
                booking_date = datetime.fromisoformat(lab_test.booking_date.replace('Z', '+00:00'))
            else:
                booking_date = lab_test.booking_date
            
            hours_waiting = (datetime.now() - booking_date).total_seconds() / 3600
            urgency_penalty = min(hours_waiting * 0.1, 50)  # Max 50 point penalty
            base_score -= urgency_penalty
        
        return base_score
    
    def get_next_test(self) -> Optional[LabTest]:
        """Get next highest priority test without removing"""
        if self.heap:
            return self.heap[0][2]
        return None
    
    def pop_next_test(self) -> Optional[LabTest]:
        """Remove and return next highest priority test"""
        if self.heap:
            _, _, lab_test = heapq.heappop(self.heap)
            del self.test_lookup[lab_test.test_id]
            return lab_test
        return None
    
    def remove_test(self, test_id: str) -> bool:
        """Remove specific test from queue"""
        if test_id in self.test_lookup:
            # Mark as removed (lazy deletion)
            self.test_lookup[test_id].status = TestStatus.CANCELLED
            del self.test_lookup[test_id]
            return True
        return False
    
    def get_queue_status(self) -> Dict[str, Any]:
        """Get comprehensive queue status"""
        active_tests = [item[2] for item in self.heap if item[2].test_id in self.test_lookup]
        
        priority_counts = defaultdict(int)
        total_estimated_time = 0
        
        for test in active_tests:
            priority_counts[test.priority.name] += 1
            total_estimated_time += test.estimated_duration
        
        return {
            'total_tests': len(active_tests),
            'priority_breakdown': dict(priority_counts),
            'estimated_completion_time': total_estimated_time,
            'next_test': active_tests[0] if active_tests else None
        }

class TechnicianWorkloadBalancer:
    """Load balancer for distributing tests among technicians"""
    
    def __init__(self):
        self.technicians = {}  # technician_id -> workload info
        self.test_assignments = defaultdict(list)  # technician_id -> [tests]
    
    def add_technician(self, technician_id: str, specializations: List[str], max_concurrent: int = 3):
        """Add technician to the system"""
        self.technicians[technician_id] = {
            'id': technician_id,
            'specializations': specializations,
            'max_concurrent': max_concurrent,
            'current_load': 0,
            'total_tests_today': 0,
            'average_completion_time': 20  # minutes
        }
    
    def assign_test(self, lab_test: LabTest) -> Optional[str]:
        """Assign test to best available technician"""
        available_technicians = []
        
        for tech_id, tech_info in self.technicians.items():
            if tech_info['current_load'] < tech_info['max_concurrent']:
                # Check if technician can handle this test type
                can_handle = self._can_handle_test(tech_info, lab_test)
                if can_handle:
                    # Calculate assignment score
                    score = self._calculate_assignment_score(tech_info, lab_test)
                    available_technicians.append((score, tech_id))
        
        if available_technicians:
            # Sort by score (lower is better)
            available_technicians.sort()
            best_tech_id = available_technicians[0][1]
            
            # Assign test
            self.technicians[best_tech_id]['current_load'] += 1
            self.test_assignments[best_tech_id].append(lab_test)
            lab_test.assigned_technician = best_tech_id
            
            return best_tech_id
        
        return None
    
    def _can_handle_test(self, tech_info: Dict, lab_test: LabTest) -> bool:
        """Check if technician can handle the test"""
        # For now, assume all technicians can handle all tests
        # In real implementation, check specializations
        return True
    
    def _calculate_assignment_score(self, tech_info: Dict, lab_test: LabTest) -> float:
        """Calculate assignment score (lower = better match)"""
        # Base score from current workload
        score = tech_info['current_load'] * 100
        
        # Add penalty for high priority tests if technician is busy
        if lab_test.priority == TestPriority.EMERGENCY:
            score += tech_info['current_load'] * 50
        
        return score
    
    def complete_test(self, technician_id: str, test_id: str):
        """Mark test as completed and update technician workload"""
        if technician_id in self.technicians:
            self.technicians[technician_id]['current_load'] = max(0, 
                self.technicians[technician_id]['current_load'] - 1)
            self.technicians[technician_id]['total_tests_today'] += 1
            
            # Remove from assignments
            self.test_assignments[technician_id] = [
                test for test in self.test_assignments[technician_id] 
                if test.test_id != test_id
            ]
    
    def get_technician_workload(self) -> Dict[str, Any]:
        """Get current workload distribution"""
        workload_data = {}
        
        for tech_id, tech_info in self.technicians.items():
            workload_data[tech_id] = {
                'current_load': tech_info['current_load'],
                'max_concurrent': tech_info['max_concurrent'],
                'utilization': (tech_info['current_load'] / tech_info['max_concurrent']) * 100,
                'tests_today': tech_info['total_tests_today'],
                'assigned_tests': len(self.test_assignments[tech_id])
            }
        
        return workload_data

class LabTestQueue:
    """FIFO Queue for routine test processing"""
    
    def __init__(self):
        self.queue = deque()
        self.processing = {}  # test_id -> processing_info
    
    def enqueue(self, lab_test: LabTest):
        """Add test to queue"""
        self.queue.append(lab_test)
    
    def dequeue(self) -> Optional[LabTest]:
        """Remove and return next test"""
        if self.queue:
            return self.queue.popleft()
        return None
    
    def peek(self) -> Optional[LabTest]:
        """View next test without removing"""
        if self.queue:
            return self.queue[0]
        return None
    
    def size(self) -> int:
        """Get queue size"""
        return len(self.queue)
    
    def start_processing(self, test_id: str, technician_id: str):
        """Mark test as being processed"""
        self.processing[test_id] = {
            'technician_id': technician_id,
            'start_time': datetime.now(),
            'status': TestStatus.IN_PROGRESS
        }
    
    def complete_processing(self, test_id: str):
        """Mark test as completed"""
        if test_id in self.processing:
            self.processing[test_id]['status'] = TestStatus.COMPLETED
            self.processing[test_id]['end_time'] = datetime.now()

class LabAnalytics:
    """Analytics engine for lab operations"""
    
    @staticmethod
    def calculate_wait_times(tests: List[LabTest]) -> Dict[str, float]:
        """Calculate average wait times by priority"""
        wait_times = defaultdict(list)
        
        for test in tests:
            if test.status == TestStatus.COMPLETED:
                # Calculate wait time (mock calculation)
                wait_time = 30  # minutes (mock)
                wait_times[test.priority.name].append(wait_time)
        
        averages = {}
        for priority, times in wait_times.items():
            averages[priority] = sum(times) / len(times) if times else 0
        
        return averages
    
    @staticmethod
    def get_throughput_metrics(tests: List[LabTest], period_hours: int = 24) -> Dict[str, Any]:
        """Calculate lab throughput metrics"""
        now = datetime.now()
        period_start = now - timedelta(hours=period_hours)
        
        recent_tests = [
            test for test in tests 
            if test.created_at >= period_start
        ]
        
        completed_tests = [
            test for test in recent_tests 
            if test.status == TestStatus.COMPLETED
        ]
        
        return {
            'total_tests': len(recent_tests),
            'completed_tests': len(completed_tests),
            'completion_rate': (len(completed_tests) / len(recent_tests)) * 100 if recent_tests else 0,
            'tests_per_hour': len(recent_tests) / period_hours,
            'average_processing_time': 25  # minutes (mock)
        }
    
    @staticmethod
    def identify_bottlenecks(tests: List[LabTest]) -> List[Dict[str, Any]]:
        """Identify processing bottlenecks"""
        bottlenecks = []
        
        # Check for high wait times
        pending_tests = [test for test in tests if test.status == TestStatus.PENDING]
        if len(pending_tests) > 10:
            bottlenecks.append({
                'type': 'Queue Backlog',
                'severity': 'High',
                'description': f'{len(pending_tests)} tests waiting in queue',
                'recommendation': 'Consider adding more technicians or extending hours'
            })
        
        # Check for delayed tests
        delayed_tests = [test for test in tests if test.status == TestStatus.DELAYED]
        if delayed_tests:
            bottlenecks.append({
                'type': 'Processing Delays',
                'severity': 'Medium',
                'description': f'{len(delayed_tests)} tests experiencing delays',
                'recommendation': 'Review technician workload distribution'
            })
        
        return bottlenecks

class LabTechnicianEngine:
    """Main engine for lab technician workflow management"""
    
    def __init__(self):
        self.priority_queue = LabTestPriorityQueue()
        self.routine_queue = LabTestQueue()
        self.workload_balancer = TechnicianWorkloadBalancer()
        self.all_tests = []
        self.analytics = LabAnalytics()
    
    def initialize_technicians(self):
        """Initialize default technicians"""
        technicians = [
            {'id': 'TECH001', 'specializations': ['blood', 'urine'], 'max_concurrent': 4},
            {'id': 'TECH002', 'specializations': ['microbiology', 'culture'], 'max_concurrent': 3},
            {'id': 'TECH003', 'specializations': ['biochemistry', 'enzymes'], 'max_concurrent': 5},
            {'id': 'TECH004', 'specializations': ['hematology', 'coagulation'], 'max_concurrent': 3}
        ]
        
        for tech in technicians:
            self.workload_balancer.add_technician(
                tech['id'], 
                tech['specializations'], 
                tech['max_concurrent']
            )
    
    def add_test(self, test_data: Dict[str, Any]) -> str:
        """Add new test to appropriate queue"""
        lab_test = LabTest(test_data)
        self.all_tests.append(lab_test)
        
        # Route to appropriate queue based on priority
        if lab_test.priority in [TestPriority.EMERGENCY, TestPriority.URGENT]:
            self.priority_queue.add_test(lab_test)
            queue_type = "Priority Queue"
        else:
            self.routine_queue.enqueue(lab_test)
            queue_type = "Routine Queue"
        
        # Try to assign technician
        assigned_tech = self.workload_balancer.assign_test(lab_test)
        
        return f"Test {lab_test.test_id} added to {queue_type}. Assigned to: {assigned_tech or 'Unassigned'}"
    
    def process_next_test(self) -> Optional[Dict[str, Any]]:
        """Process next test from queues"""
        # First check priority queue
        next_test = self.priority_queue.pop_next_test()
        if not next_test:
            # Then check routine queue
            next_test = self.routine_queue.dequeue()
        
        if next_test:
            # Start processing
            if next_test.assigned_technician:
                self.routine_queue.start_processing(
                    next_test.test_id, 
                    next_test.assigned_technician
                )
                next_test.status = TestStatus.IN_PROGRESS
                
                return {
                    'test_id': next_test.test_id,
                    'patient_name': next_test.patient_name,
                    'priority': next_test.priority.name,
                    'assigned_technician': next_test.assigned_technician,
                    'estimated_duration': next_test.estimated_duration
                }
        
        return None
    
    def complete_test(self, test_id: str) -> bool:
        """Mark test as completed"""
        for test in self.all_tests:
            if test.test_id == test_id:
                test.status = TestStatus.COMPLETED
                self.routine_queue.complete_processing(test_id)
                
                if test.assigned_technician:
                    self.workload_balancer.complete_test(
                        test.assigned_technician, 
                        test_id
                    )
                
                return True
        return False
    
    def get_dashboard_data(self) -> Dict[str, Any]:
        """Get comprehensive dashboard data"""
        priority_status = self.priority_queue.get_queue_status()
        workload_data = self.workload_balancer.get_technician_workload()
        throughput = self.analytics.get_throughput_metrics(self.all_tests)
        bottlenecks = self.analytics.identify_bottlenecks(self.all_tests)
        
        # Status distribution
        status_counts = defaultdict(int)
        priority_counts = defaultdict(int)
        
        for test in self.all_tests:
            status_counts[test.status.value] += 1
            priority_counts[test.priority.name] += 1
        
        return {
            'queue_status': {
                'priority_queue': priority_status,
                'routine_queue_size': self.routine_queue.size(),
                'total_pending': status_counts['Pending'],
                'in_progress': status_counts['In Progress'],
                'completed_today': status_counts['Completed']
            },
            'technician_workload': workload_data,
            'throughput_metrics': throughput,
            'priority_distribution': dict(priority_counts),
            'status_distribution': dict(status_counts),
            'bottlenecks': bottlenecks,
            'recent_tests': [
                {
                    'test_id': test.test_id,
                    'patient_name': test.patient_name,
                    'priority': test.priority.name,
                    'status': test.status.value,
                    'assigned_technician': test.assigned_technician
                } for test in self.all_tests[-10:]  # Last 10 tests
            ]
        }
    
    def get_test_by_id(self, test_id: str) -> Optional[Dict[str, Any]]:
        """Get test details by ID"""
        for test in self.all_tests:
            if test.test_id == test_id:
                return {
                    'test_id': test.test_id,
                    'patient_name': test.patient_name,
                    'patient_email': test.patient_email,
                    'tests': test.tests,
                    'priority': test.priority.name,
                    'status': test.status.value,
                    'assigned_technician': test.assigned_technician,
                    'estimated_duration': test.estimated_duration,
                    'booking_date': test.booking_date,
                    'booking_time': test.booking_time
                }
        return None
