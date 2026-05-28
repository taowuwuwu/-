/**
 * DAG (Directed Acyclic Graph) Utilities for Workflow Engine
 * Implements topological sorting and cycle detection algorithms
 */

/**
 * Detect if the graph contains a cycle using DFS
 * @param {Array} nodes - Array of node objects with id
 * @param {Array} edges - Array of edge objects with source and target
 * @returns {boolean} - True if cycle exists, false otherwise
 */
export function hasCycle(nodes, edges) {
  const visited = new Set();
  const recursionStack = new Set();
  
  // Build adjacency list
  const adjList = new Map();
  nodes.forEach(node => adjList.set(node.id, []));
  edges.forEach(edge => {
    if (adjList.has(edge.source)) {
      adjList.get(edge.source).push(edge.target);
    }
  });
  
  function dfs(nodeId) {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    
    const neighbors = adjList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true; // Back edge found - cycle detected
      }
    }
    
    recursionStack.delete(nodeId);
    return false;
  }
  
  // Check all nodes (graph might be disconnected)
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return true;
    }
  }
  
  return false;
}

/**
 * Topological Sort using Kahn's Algorithm
 * Returns nodes in execution order
 * @param {Array} nodes - Array of node objects with id
 * @param {Array} edges - Array of edge objects with source and target
 * @returns {Array|null} - Sorted node IDs or null if cycle detected
 */
export function topologicalSort(nodes, edges) {
  const inDegree = new Map();
  const adjList = new Map();
  const queue = [];
  const result = [];
  
  // Initialize
  nodes.forEach(node => {
    inDegree.set(node.id, 0);
    adjList.set(node.id, []);
  });
  
  // Build graph
  edges.forEach(edge => {
    if (adjList.has(edge.source)) {
      adjList.get(edge.source).push(edge.target);
    }
    if (inDegree.has(edge.target)) {
      inDegree.set(edge.target, inDegree.get(edge.target) + 1);
    }
  });
  
  // Find all nodes with no incoming edges
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });
  
  // Process nodes
  while (queue.length > 0) {
    const current = queue.shift();
    result.push(current);
    
    const neighbors = adjList.get(current) || [];
    for (const neighbor of neighbors) {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }
  
  // If result doesn't contain all nodes, there's a cycle
  return result.length === nodes.length ? result : null;
}

/**
 * Validate workflow DAG
 * @param {Array} nodes 
 * @param {Array} edges 
 * @returns {Object} - { valid: boolean, error?: string, executionOrder?: Array }
 */
export function validateWorkflow(nodes, edges) {
  // Check for empty workflow
  if (nodes.length === 0) {
    return { valid: false, error: 'Workflow must have at least one node' };
  }
  
  // Check for cycles
  if (hasCycle(nodes, edges)) {
    return { valid: false, error: 'Cycle detected in workflow. DAG must be acyclic.' };
  }
  
  // Get execution order
  const executionOrder = topologicalSort(nodes, edges);
  if (!executionOrder) {
    return { valid: false, error: 'Failed to determine execution order' };
  }
  
  // Check for disconnected nodes (optional warning)
  const connectedNodes = new Set();
  edges.forEach(edge => {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  });
  
  const disconnectedNodes = nodes.filter(n => !connectedNodes.has(n.id));
  
  return {
    valid: true,
    executionOrder,
    warnings: disconnectedNodes.length > 0 
      ? [`Found ${disconnectedNodes.length} disconnected node(s)`] 
      : []
  };
}

/**
 * Get downstream nodes for a given node
 * @param {string} nodeId 
 * @param {Array} edges 
 * @returns {Array} - Array of downstream node IDs
 */
export function getDownstreamNodes(nodeId, edges) {
  const downstream = [];
  const queue = [nodeId];
  const visited = new Set([nodeId]);
  
  while (queue.length > 0) {
    const current = queue.shift();
    const children = edges.filter(e => e.source === current).map(e => e.target);
    
    for (const child of children) {
      if (!visited.has(child)) {
        visited.add(child);
        downstream.push(child);
        queue.push(child);
      }
    }
  }
  
  return downstream;
}

/**
 * Get upstream nodes for a given node
 * @param {string} nodeId 
 * @param {Array} edges 
 * @returns {Array} - Array of upstream node IDs
 */
export function getUpstreamNodes(nodeId, edges) {
  const upstream = [];
  const queue = [nodeId];
  const visited = new Set([nodeId]);
  
  while (queue.length > 0) {
    const current = queue.shift();
    const parents = edges.filter(e => e.target === current).map(e => e.source);
    
    for (const parent of parents) {
      if (!visited.has(parent)) {
        visited.add(parent);
        upstream.push(parent);
        queue.push(parent);
      }
    }
  }
  
  return upstream;
}

export default {
  hasCycle,
  topologicalSort,
  validateWorkflow,
  getDownstreamNodes,
  getUpstreamNodes
};
