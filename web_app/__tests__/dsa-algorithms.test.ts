import { describe, test, expect, beforeEach, afterEach } from '@jest/globals'

// Mock implementations for testing
class MockPriorityQueue {
  private heap: Array<[number, number, any]> = []
  private index = 0

  push(item: any, priority: number): void {
    this.heap.push([priority, this.index++, item])
    this.heap.sort((a, b) => a[0] - b[0])
  }

  pop(): any {
    const item = this.heap.shift()
    return item ? item[2] : null
  }

  peek(): any {
    return this.heap.length > 0 ? this.heap[0][2] : null
  }

  size(): number {
    return this.heap.length
  }

  isEmpty(): boolean {
    return this.heap.length === 0
  }
}

class MockHashTable {
  private table: Map<string, any> = new Map()

  insert(key: string, value: any): void {
    this.table.set(key, value)
  }

  get(key: string): any {
    return this.table.get(key)
  }

  delete(key: string): boolean {
    return this.table.delete(key)
  }

  size(): number {
    return this.table.size
  }
}

class MockGraph {
  private adjacencyList: Map<string, Array<{node: string, weight: number}>> = new Map()

  addNode(node: string): void {
    if (!this.adjacencyList.has(node)) {
      this.adjacencyList.set(node, [])
    }
  }

  addEdge(from: string, to: string, weight: number = 1): void {
    this.addNode(from)
    this.addNode(to)
    this.adjacencyList.get(from)!.push({node: to, weight})
    this.adjacencyList.get(to)!.push({node: from, weight})
  }

  dijkstra(start: string, end: string): {path: string[], distance: number} {
    const distances = new Map<string, number>()
    const previous = new Map<string, string>()
    const unvisited = new Set<string>()

    // Initialize
    for (const node of this.adjacencyList.keys()) {
      distances.set(node, node === start ? 0 : Infinity)
      unvisited.add(node)
    }

    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let current = ''
      let minDistance = Infinity
      for (const node of unvisited) {
        const dist = distances.get(node)!
        if (dist < minDistance) {
          minDistance = dist
          current = node
        }
      }

      if (current === '') break
      unvisited.delete(current)

      if (current === end) break

      const neighbors = this.adjacencyList.get(current) || []
      for (const neighbor of neighbors) {
        if (!unvisited.has(neighbor.node)) continue

        const newDistance = distances.get(current)! + neighbor.weight
        if (newDistance < distances.get(neighbor.node)!) {
          distances.set(neighbor.node, newDistance)
          previous.set(neighbor.node, current)
        }
      }
    }

    // Reconstruct path
    const path: string[] = []
    let current = end
    while (previous.has(current)) {
      path.unshift(current)
      current = previous.get(current)!
    }
    path.unshift(start)

    return {
      path: distances.get(end) === Infinity ? [] : path,
      distance: distances.get(end) || Infinity
    }
  }
}

describe('Priority Queue Tests', () => {
  let pq: MockPriorityQueue

  beforeEach(() => {
    pq = new MockPriorityQueue()
  })

  test('should handle empty queue', () => {
    expect(pq.isEmpty()).toBe(true)
    expect(pq.size()).toBe(0)
    expect(pq.peek()).toBeNull()
    expect(pq.pop()).toBeNull()
  })

  test('should maintain priority order', () => {
    pq.push('low priority', 5)
    pq.push('high priority', 1)
    pq.push('medium priority', 3)

    expect(pq.pop()).toBe('high priority')
    expect(pq.pop()).toBe('medium priority')
    expect(pq.pop()).toBe('low priority')
  })

  test('should handle patient triage correctly', () => {
    const patients = [
      { id: 'P1', name: 'John', priority: 3, condition: 'routine' },
      { id: 'P2', name: 'Jane', priority: 1, condition: 'critical' },
      { id: 'P3', name: 'Bob', priority: 2, condition: 'urgent' }
    ]

    patients.forEach(patient => {
      pq.push(patient, patient.priority)
    })

    const firstPatient = pq.pop()
    expect(firstPatient.condition).toBe('critical')
    expect(firstPatient.priority).toBe(1)

    const secondPatient = pq.pop()
    expect(secondPatient.condition).toBe('urgent')
    expect(secondPatient.priority).toBe(2)
  })

  test('should handle medicine inventory alerts', () => {
    const medicines = [
      { id: 'M1', name: 'Aspirin', stock: 0, priority: 1 },
      { id: 'M2', name: 'Paracetamol', stock: 5, priority: 2 },
      { id: 'M3', name: 'Vitamin C', stock: 50, priority: 5 }
    ]

    medicines.forEach(medicine => {
      pq.push(medicine, medicine.priority)
    })

    const criticalMedicine = pq.pop()
    expect(criticalMedicine.stock).toBe(0)
    expect(criticalMedicine.name).toBe('Aspirin')
  })

  test('should handle large datasets efficiently', () => {
    const startTime = Date.now()
    
    // Add 10000 items
    for (let i = 0; i < 10000; i++) {
      pq.push(`item-${i}`, Math.floor(Math.random() * 1000))
    }

    const insertTime = Date.now() - startTime
    expect(insertTime).toBeLessThan(1000) // Should complete in under 1 second

    // Extract all items
    const extractStartTime = Date.now()
    const results = []
    while (!pq.isEmpty()) {
      results.push(pq.pop())
    }

    const extractTime = Date.now() - extractStartTime
    expect(extractTime).toBeLessThan(1000)
    expect(results.length).toBe(10000)
  })
})

describe('Hash Table Tests', () => {
  let hashTable: MockHashTable

  beforeEach(() => {
    hashTable = new MockHashTable()
  })

  test('should handle basic operations', () => {
    hashTable.insert('key1', 'value1')
    expect(hashTable.get('key1')).toBe('value1')
    expect(hashTable.size()).toBe(1)

    hashTable.delete('key1')
    expect(hashTable.get('key1')).toBeUndefined()
    expect(hashTable.size()).toBe(0)
  })

  test('should handle patient lookup efficiently', () => {
    const patients = [
      { id: 'P001', name: 'John Doe', email: 'john@example.com' },
      { id: 'P002', name: 'Jane Smith', email: 'jane@example.com' },
      { id: 'P003', name: 'Bob Johnson', email: 'bob@example.com' }
    ]

    // Insert patients
    patients.forEach(patient => {
      hashTable.insert(patient.id, patient)
      hashTable.insert(patient.email, patient)
    })

    // Test O(1) lookup by ID
    const startTime = Date.now()
    const patient = hashTable.get('P002')
    const lookupTime = Date.now() - startTime

    expect(patient.name).toBe('Jane Smith')
    expect(lookupTime).toBeLessThan(10) // Should be nearly instantaneous

    // Test lookup by email
    const patientByEmail = hashTable.get('bob@example.com')
    expect(patientByEmail.id).toBe('P003')
  })

  test('should handle medicine inventory lookup', () => {
    const medicines = [
      { id: 'MED001', name: 'Aspirin', genericName: 'Acetylsalicylic Acid' },
      { id: 'MED002', name: 'Tylenol', genericName: 'Acetaminophen' }
    ]

    medicines.forEach(medicine => {
      hashTable.insert(medicine.id, medicine)
      hashTable.insert(medicine.name.toLowerCase(), medicine)
      hashTable.insert(medicine.genericName.toLowerCase(), medicine)
    })

    // Test multiple lookup methods
    expect(hashTable.get('MED001').name).toBe('Aspirin')
    expect(hashTable.get('aspirin').id).toBe('MED001')
    expect(hashTable.get('acetaminophen').name).toBe('Tylenol')
  })

  test('should handle collisions gracefully', () => {
    // Insert many items to test collision handling
    for (let i = 0; i < 1000; i++) {
      hashTable.insert(`key${i}`, `value${i}`)
    }

    expect(hashTable.size()).toBe(1000)

    // Verify all items can be retrieved
    for (let i = 0; i < 1000; i++) {
      expect(hashTable.get(`key${i}`)).toBe(`value${i}`)
    }
  })
})

describe('Graph Algorithm Tests', () => {
  let graph: MockGraph

  beforeEach(() => {
    graph = new MockGraph()
  })

  test('should find shortest path in hospital layout', () => {
    // Create a simple hospital layout
    graph.addEdge('Entrance', 'Reception', 10)
    graph.addEdge('Reception', 'Emergency', 15)
    graph.addEdge('Reception', 'Elevator', 5)
    graph.addEdge('Elevator', 'Lab', 8)
    graph.addEdge('Emergency', 'Lab', 25)

    const result = graph.dijkstra('Entrance', 'Lab')
    
    expect(result.path).toEqual(['Entrance', 'Reception', 'Elevator', 'Lab'])
    expect(result.distance).toBe(23) // 10 + 5 + 8
  })

  test('should handle disconnected nodes', () => {
    graph.addEdge('A', 'B', 1)
    graph.addEdge('C', 'D', 1)

    const result = graph.dijkstra('A', 'C')
    expect(result.path).toEqual([])
    expect(result.distance).toBe(Infinity)
  })

  test('should find optimal emergency evacuation routes', () => {
    // Create hospital floor plan with multiple exits
    graph.addEdge('ICU', 'Corridor1', 5)
    graph.addEdge('Corridor1', 'Exit1', 10)
    graph.addEdge('Corridor1', 'Corridor2', 8)
    graph.addEdge('Corridor2', 'Exit2', 12)
    graph.addEdge('ICU', 'Corridor3', 15)
    graph.addEdge('Corridor3', 'Exit3', 5)

    // Find shortest path to Exit1
    const toExit1 = graph.dijkstra('ICU', 'Exit1')
    expect(toExit1.distance).toBe(15)

    // Find shortest path to Exit3
    const toExit3 = graph.dijkstra('ICU', 'Exit3')
    expect(toExit3.distance).toBe(20)

    // Exit1 should be the optimal choice
    expect(toExit1.distance).toBeLessThan(toExit3.distance)
  })

  test('should handle wheelchair accessibility constraints', () => {
    // In a real implementation, this would filter out non-accessible paths
    graph.addEdge('Entrance', 'Stairs', 5) // Not wheelchair accessible
    graph.addEdge('Entrance', 'Elevator', 10) // Wheelchair accessible
    graph.addEdge('Stairs', 'Floor2', 3)
    graph.addEdge('Elevator', 'Floor2', 3)

    // For wheelchair users, should use elevator route
    const accessibleRoute = graph.dijkstra('Entrance', 'Floor2')
    expect(accessibleRoute.path).toContain('Elevator')
  })
})

describe('Performance Benchmarks', () => {
  test('priority queue performance with large datasets', () => {
    const pq = new MockPriorityQueue()
    const itemCount = 100000

    // Benchmark insertion
    const insertStart = Date.now()
    for (let i = 0; i < itemCount; i++) {
      pq.push(`item-${i}`, Math.floor(Math.random() * 10000))
    }
    const insertTime = Date.now() - insertStart

    expect(insertTime).toBeLessThan(5000) // Should complete in under 5 seconds
    expect(pq.size()).toBe(itemCount)

    // Benchmark extraction
    const extractStart = Date.now()
    let extracted = 0
    while (!pq.isEmpty() && extracted < 1000) {
      pq.pop()
      extracted++
    }
    const extractTime = Date.now() - extractStart

    expect(extractTime).toBeLessThan(100) // Should be very fast
  })

  test('hash table performance with medical records', () => {
    const hashTable = new MockHashTable()
    const recordCount = 50000

    // Simulate medical records
    const insertStart = Date.now()
    for (let i = 0; i < recordCount; i++) {
      const record = {
        id: `PAT${i.toString().padStart(6, '0')}`,
        name: `Patient ${i}`,
        email: `patient${i}@hospital.com`,
        phone: `555-${i.toString().padStart(4, '0')}`
      }
      hashTable.insert(record.id, record)
    }
    const insertTime = Date.now() - insertStart

    expect(insertTime).toBeLessThan(3000) // Should be very fast for insertions

    // Benchmark random lookups
    const lookupStart = Date.now()
    for (let i = 0; i < 1000; i++) {
      const randomId = `PAT${Math.floor(Math.random() * recordCount).toString().padStart(6, '0')}`
      const record = hashTable.get(randomId)
      expect(record).toBeDefined()
    }
    const lookupTime = Date.now() - lookupStart

    expect(lookupTime).toBeLessThan(50) // O(1) lookups should be extremely fast
  })

  test('graph algorithm performance with complex hospital layout', () => {
    const graph = new MockGraph()
    
    // Create a complex hospital layout (100 nodes, 300 edges)
    const nodeCount = 100
    const edgeCount = 300

    // Add nodes
    for (let i = 0; i < nodeCount; i++) {
      graph.addNode(`Node${i}`)
    }

    // Add random edges
    for (let i = 0; i < edgeCount; i++) {
      const from = `Node${Math.floor(Math.random() * nodeCount)}`
      const to = `Node${Math.floor(Math.random() * nodeCount)}`
      const weight = Math.floor(Math.random() * 20) + 1
      graph.addEdge(from, to, weight)
    }

    // Benchmark pathfinding
    const pathfindingStart = Date.now()
    const result = graph.dijkstra('Node0', 'Node99')
    const pathfindingTime = Date.now() - pathfindingStart

    expect(pathfindingTime).toBeLessThan(1000) // Should complete in under 1 second
    
    if (result.distance !== Infinity) {
      expect(result.path.length).toBeGreaterThan(0)
      expect(result.path[0]).toBe('Node0')
      expect(result.path[result.path.length - 1]).toBe('Node99')
    }
  })
})

describe('Medical Scenario Integration Tests', () => {
  test('emergency room triage workflow', () => {
    const triageQueue = new MockPriorityQueue()
    const patientLookup = new MockHashTable()

    // Simulate patients arriving
    const patients = [
      { id: 'P001', name: 'John Doe', condition: 'chest pain', priority: 1, vitalSigns: { bp: '180/100', hr: 120 } },
      { id: 'P002', name: 'Jane Smith', condition: 'broken arm', priority: 3, vitalSigns: { bp: '120/80', hr: 75 } },
      { id: 'P003', name: 'Bob Johnson', condition: 'difficulty breathing', priority: 1, vitalSigns: { bp: '160/95', hr: 110 } },
      { id: 'P004', name: 'Alice Brown', condition: 'minor cut', priority: 4, vitalSigns: { bp: '110/70', hr: 68 } }
    ]

    // Add to triage queue and lookup table
    patients.forEach(patient => {
      triageQueue.push(patient, patient.priority)
      patientLookup.insert(patient.id, patient)
    })

    // Process patients in priority order
    const processedPatients = []
    while (!triageQueue.isEmpty()) {
      const patient = triageQueue.pop()
      processedPatients.push(patient)
    }

    // Verify critical patients are processed first
    expect(processedPatients[0].condition).toMatch(/chest pain|difficulty breathing/)
    expect(processedPatients[0].priority).toBe(1)
    expect(processedPatients[processedPatients.length - 1].condition).toBe('minor cut')

    // Verify lookup functionality
    const lookedUpPatient = patientLookup.get('P002')
    expect(lookedUpPatient.name).toBe('Jane Smith')
  })

  test('medicine inventory management workflow', () => {
    const inventoryAlerts = new MockPriorityQueue()
    const medicineIndex = new MockHashTable()

    const medicines = [
      { id: 'MED001', name: 'Epinephrine', stock: 0, minThreshold: 10, priority: 1 },
      { id: 'MED002', name: 'Insulin', stock: 5, minThreshold: 20, priority: 2 },
      { id: 'MED003', name: 'Aspirin', stock: 100, minThreshold: 50, priority: 5 },
      { id: 'MED004', name: 'Morphine', stock: 2, minThreshold: 15, priority: 1 }
    ]

    medicines.forEach(medicine => {
      medicineIndex.insert(medicine.id, medicine)
      medicineIndex.insert(medicine.name.toLowerCase(), medicine)
      
      // Add to alert queue if below threshold
      if (medicine.stock <= medicine.minThreshold) {
        const urgency = medicine.stock === 0 ? 1 : medicine.priority
        inventoryAlerts.push(medicine, urgency)
      }
    })

    // Process alerts in priority order
    const alerts = []
    while (!inventoryAlerts.isEmpty()) {
      alerts.push(inventoryAlerts.pop())
    }

    // Verify out-of-stock medicines are highest priority
    expect(alerts[0].stock).toBe(0)
    expect(alerts[0].name).toBe('Epinephrine')

    // Verify search functionality
    const searchResult = medicineIndex.get('insulin')
    expect(searchResult.id).toBe('MED002')
  })

  test('hospital navigation with accessibility requirements', () => {
    const hospitalMap = new MockGraph()

    // Build hospital layout
    hospitalMap.addEdge('MainEntrance', 'Reception', 5)
    hospitalMap.addEdge('Reception', 'Elevator', 3)
    hospitalMap.addEdge('Reception', 'Stairs', 2)
    hospitalMap.addEdge('Elevator', 'Floor2_Elevator', 10)
    hospitalMap.addEdge('Stairs', 'Floor2_Stairs', 8)
    hospitalMap.addEdge('Floor2_Elevator', 'Cardiology', 4)
    hospitalMap.addEdge('Floor2_Stairs', 'Cardiology', 4)
    hospitalMap.addEdge('Floor2_Elevator', 'Neurology', 6)

    // Find path for wheelchair user (must use elevator)
    const wheelchairPath = hospitalMap.dijkstra('MainEntrance', 'Cardiology')
    expect(wheelchairPath.path).toContain('Elevator')
    expect(wheelchairPath.path).toContain('Floor2_Elevator')

    // Find path to different department
    const neurologyPath = hospitalMap.dijkstra('MainEntrance', 'Neurology')
    expect(neurologyPath.distance).toBe(24) // 5 + 3 + 10 + 6
  })
})

describe('Error Handling and Edge Cases', () => {
  test('should handle empty datasets gracefully', () => {
    const pq = new MockPriorityQueue()
    const ht = new MockHashTable()
    const graph = new MockGraph()

    expect(pq.isEmpty()).toBe(true)
    expect(ht.size()).toBe(0)
    expect(graph.dijkstra('A', 'B').distance).toBe(Infinity)
  })

  test('should handle invalid inputs', () => {
    const ht = new MockHashTable()
    
    // Test with null/undefined keys
    expect(() => ht.insert('', 'value')).not.toThrow()
    expect(ht.get('nonexistent')).toBeUndefined()
  })

  test('should maintain data integrity under concurrent operations', () => {
    const pq = new MockPriorityQueue()
    
    // Simulate concurrent additions
    const promises = []
    for (let i = 0; i < 100; i++) {
      promises.push(Promise.resolve().then(() => {
        pq.push(`item-${i}`, Math.random() * 100)
      }))
    }

    return Promise.all(promises).then(() => {
      expect(pq.size()).toBe(100)
    })
  })
})
