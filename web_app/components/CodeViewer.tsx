'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Code, Play, Eye } from 'lucide-react'

interface CodeViewerProps {
  algorithm: string
  currentStep: number
}

export default function CodeViewer({ algorithm, currentStep }: CodeViewerProps) {
  const [highlightedLine, setHighlightedLine] = useState(0)

  const algorithmCode = {
    quicksort: `function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        // Choose pivot using median-of-three
        let pivotIndex = partition(arr, low, high);
        
        // Recursively sort elements before partition
        quickSort(arr, low, pivotIndex - 1);
        
        // Recursively sort elements after partition  
        quickSort(arr, pivotIndex + 1, high);
    }
    return arr;
}

function partition(arr, low, high) {
    let pivot = arr[high]; // Choose last element as pivot
    let i = low - 1; // Index of smaller element
    
    for (let j = low; j < high; j++) {
        // If current element <= pivot
        if (arr[j] <= pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap
        }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}`,
    mergesort: `function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    
    // Divide array into two halves
    const mid = Math.floor(arr.length / 2);
    const left = arr.slice(0, mid);
    const right = arr.slice(mid);
    
    // Recursively sort both halves
    return merge(mergeSort(left), mergeSort(right));
}

function merge(left, right) {
    let result = [];
    let leftIndex = 0;
    let rightIndex = 0;
    
    // Compare elements and merge in sorted order
    while (leftIndex < left.length && rightIndex < right.length) {
        if (left[leftIndex] <= right[rightIndex]) {
            result.push(left[leftIndex]);
            leftIndex++;
        } else {
            result.push(right[rightIndex]);
            rightIndex++;
        }
    }
    
    // Add remaining elements
    return result.concat(left.slice(leftIndex), right.slice(rightIndex));
}`,
    binarysearch: `function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        // Calculate middle index (avoid overflow)
        let mid = left + Math.floor((right - left) / 2);
        
        // Check if target is at mid
        if (arr[mid] === target) {
            return mid; // Target found
        }
        
        // If target is greater, ignore left half
        if (arr[mid] < target) {
            left = mid + 1;
        } else {
            // If target is smaller, ignore right half
            right = mid - 1;
        }
    }
    
    return -1; // Target not found
}`,
    dijkstra: `function dijkstra(graph, start) {
    const distances = {};
    const previous = {};
    const pq = new PriorityQueue();
    const visited = new Set();
    
    // Initialize distances
    for (let node in graph) {
        distances[node] = node === start ? 0 : Infinity;
        pq.enqueue(node, distances[node]);
    }
    
    while (!pq.isEmpty()) {
        const current = pq.dequeue().element;
        
        if (visited.has(current)) continue;
        visited.add(current);
        
        // Check neighbors
        for (let neighbor of graph[current]) {
            const newDistance = distances[current] + neighbor.weight;
            
            if (newDistance < distances[neighbor.node]) {
                distances[neighbor.node] = newDistance;
                previous[neighbor.node] = current;
                pq.enqueue(neighbor.node, newDistance);
            }
        }
    }
    
    return { distances, previous };
}`,
    dfs: `function depthFirstSearch(graph, start, visited = new Set()) {
    // Mark current node as visited
    visited.add(start);
    console.log('Visiting:', start);
    
    // Recursively visit all unvisited neighbors
    for (let neighbor of graph[start]) {
        if (!visited.has(neighbor)) {
            depthFirstSearch(graph, neighbor, visited);
        }
    }
    
    return visited;
}

// Iterative DFS using stack
function dfsIterative(graph, start) {
    const visited = new Set();
    const stack = [start];
    
    while (stack.length > 0) {
        const current = stack.pop();
        
        if (!visited.has(current)) {
            visited.add(current);
            console.log('Visiting:', current);
            
            // Add neighbors to stack
            for (let neighbor of graph[current]) {
                if (!visited.has(neighbor)) {
                    stack.push(neighbor);
                }
            }
        }
    }
    
    return visited;
}`,
    bfs: `function breadthFirstSearch(graph, start) {
    const visited = new Set();
    const queue = [start];
    
    visited.add(start);
    
    while (queue.length > 0) {
        const current = queue.shift();
        console.log('Visiting:', current);
        
        // Add all unvisited neighbors to queue
        for (let neighbor of graph[current]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }
    
    return visited;
}

// BFS for shortest path
function bfsShortestPath(graph, start, target) {
    const queue = [{node: start, path: [start]}];
    const visited = new Set([start]);
    
    while (queue.length > 0) {
        const {node, path} = queue.shift();
        
        if (node === target) {
            return path; // Found shortest path
        }
        
        for (let neighbor of graph[node]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push({
                    node: neighbor,
                    path: [...path, neighbor]
                });
            }
        }
    }
    
    return null; // No path found
}`
  }

  const code = algorithmCode[algorithm as keyof typeof algorithmCode] || algorithmCode.quicksort
  const lines = code.split('\n')

  // Update highlighted line based on current step
  useEffect(() => {
    const lineIndex = Math.floor((currentStep / 2) % lines.length)
    setHighlightedLine(lineIndex)
  }, [currentStep, lines.length])

  const getLineType = (lineContent: string) => {
    if (lineContent.includes('if') || lineContent.includes('while') || lineContent.includes('for')) {
      return 'control'
    }
    if (lineContent.includes('return')) {
      return 'return'
    }
    if (lineContent.includes('//')) {
      return 'comment'
    }
    if (lineContent.includes('function') || lineContent.includes('=>')) {
      return 'function'
    }
    return 'default'
  }

  const getLineColor = (type: string, isHighlighted: boolean) => {
    if (isHighlighted) return 'bg-blue-500/30 border-l-4 border-blue-400'
    
    switch (type) {
      case 'control': return 'text-yellow-300'
      case 'return': return 'text-green-300'
      case 'comment': return 'text-gray-400'
      case 'function': return 'text-purple-300'
      default: return 'text-gray-200'
    }
  }

  return (
    <div className="glass p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Code className="w-5 h-5 mr-2 text-green-400" />
          Algorithm Code
        </h3>
        
        <div className="flex items-center space-x-2">
          <motion.div
            className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Eye className="w-3 h-3" />
            <span>Live Execution</span>
          </motion.div>
        </div>
      </div>

      <div className="bg-black/40 rounded-xl p-4 font-mono text-sm overflow-y-auto max-h-96">
        <div className="space-y-1">
          {lines.map((line, index) => {
            const lineType = getLineType(line)
            const isHighlighted = index === highlightedLine
            
            return (
              <motion.div
                key={index}
                className={`flex items-start space-x-3 py-1 px-2 rounded transition-all duration-300 ${
                  isHighlighted ? 'bg-blue-500/20 border-l-4 border-blue-400' : ''
                }`}
                animate={{
                  scale: isHighlighted ? 1.02 : 1,
                  x: isHighlighted ? 8 : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                {/* Line Number */}
                <span className="text-gray-500 text-xs w-8 text-right select-none">
                  {index + 1}
                </span>
                
                {/* Execution Indicator */}
                <div className="w-2 flex justify-center">
                  {isHighlighted && (
                    <motion.div
                      className="w-2 h-2 bg-blue-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </div>
                
                {/* Code Line */}
                <pre className={`flex-1 ${getLineColor(lineType, isHighlighted)} whitespace-pre-wrap`}>
                  {line}
                </pre>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Code Explanation */}
      <div className="mt-4 p-4 bg-white/5 rounded-lg">
        <h4 className="text-sm font-semibold text-white mb-2">Current Step Explanation:</h4>
        <p className="text-sm text-gray-300">
          {highlightedLine < lines.length && (
            <>
              <span className="text-blue-400 font-mono">Line {highlightedLine + 1}:</span>{' '}
              {lines[highlightedLine].includes('if') && 'Conditional check - evaluating boolean expression'}
              {lines[highlightedLine].includes('for') && 'Loop iteration - processing array elements'}
              {lines[highlightedLine].includes('while') && 'While loop - continuing until condition is false'}
              {lines[highlightedLine].includes('return') && 'Returning result - function execution complete'}
              {lines[highlightedLine].includes('function') && 'Function definition - algorithm entry point'}
              {lines[highlightedLine].includes('//') && 'Comment - explaining the algorithm logic'}
              {lines[highlightedLine].includes('=') && !lines[highlightedLine].includes('==') && 'Variable assignment - storing computed value'}
              {lines[highlightedLine].includes('swap') && 'Element swap - exchanging array positions'}
              {!lines[highlightedLine].includes('if') && 
               !lines[highlightedLine].includes('for') && 
               !lines[highlightedLine].includes('while') && 
               !lines[highlightedLine].includes('return') && 
               !lines[highlightedLine].includes('function') && 
               !lines[highlightedLine].includes('//') && 
               !lines[highlightedLine].includes('=') && 
               'Executing algorithm logic - processing data'}
            </>
          )}
        </p>
      </div>

      {/* Algorithm Complexity Info */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Time Complexity</div>
          <div className="text-sm font-mono text-yellow-300">
            {algorithm === 'quicksort' && 'O(n log n) avg, O(n²) worst'}
            {algorithm === 'mergesort' && 'O(n log n) guaranteed'}
            {algorithm === 'binarysearch' && 'O(log n)'}
            {algorithm === 'dijkstra' && 'O(V log V + E)'}
            {algorithm === 'dfs' && 'O(V + E)'}
            {algorithm === 'bfs' && 'O(V + E)'}
          </div>
        </div>
        
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Space Complexity</div>
          <div className="text-sm font-mono text-green-300">
            {algorithm === 'quicksort' && 'O(log n) avg'}
            {algorithm === 'mergesort' && 'O(n)'}
            {algorithm === 'binarysearch' && 'O(1)'}
            {algorithm === 'dijkstra' && 'O(V)'}
            {algorithm === 'dfs' && 'O(V)'}
            {algorithm === 'bfs' && 'O(V)'}
          </div>
        </div>
      </div>
    </div>
  )
}
