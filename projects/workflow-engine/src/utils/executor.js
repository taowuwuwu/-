/**
 * Workflow Execution Engine
 * Executes nodes in topological order with support for different node types
 */

import { validateWorkflow, topologicalSort } from './dag';

// Node type executors
const nodeExecutors = {
  llm: async (node, context) => {
    // Simulate LLM processing
    await sleep(500);
    const prompt = node.data.config?.prompt || 'You are a helpful assistant.';
    const input = context[node.id]?.input || '';
    
    return {
      output: `[LLM Response] Processed: ${input.substring(0, 50)}...`,
      model: node.data.config?.model || 'gpt-4',
      tokens: Math.floor(Math.random() * 100) + 50
    };
  },
  
  http: async (node, context) => {
    // Simulate HTTP request
    await sleep(300);
    const url = node.data.config?.url || 'https://api.example.com';
    const method = node.data.config?.method || 'GET';
    
    return {
      output: `[HTTP ${method}] Request to ${url}`,
      status: 200,
      data: { success: true }
    };
  },
  
  code: async (node, context) => {
    // Simulate code execution
    await sleep(200);
    const code = node.data.config?.code || 'return input';
    const input = context[node.id]?.input || '';
    
    return {
      output: `[Code] Executed custom logic`,
      result: input.toUpperCase()
    };
  },
  
  condition: async (node, context) => {
    // Evaluate condition
    await sleep(100);
    const condition = node.data.config?.condition || 'true';
    const input = context[node.id]?.input || '';
    
    const result = eval(condition); // Note: In production, use safe evaluator
    
    return {
      output: `[Condition] ${condition} = ${result}`,
      branch: result ? 'true' : 'false'
    };
  },
  
  default: async (node, context) => {
    await sleep(100);
    return {
      output: `[Node] ${node.data.label} executed`,
      input: context[node.id]?.input
    };
  }
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute a single node
 */
export async function executeNode(node, context, onProgress) {
  const executor = nodeExecutors[node.data.type] || nodeExecutors.default;
  
  try {
    onProgress?.(node.id, 'running');
    const result = await executor(node, context);
    onProgress?.(node.id, 'success', result);
    return { success: true, result };
  } catch (error) {
    onProgress?.(node.id, 'error', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Execute entire workflow in topological order
 */
export async function executeWorkflow(nodes, edges, options = {}) {
  const { onNodeComplete, onWorkflowComplete } = options;
  
  // Validate workflow
  const validation = validateWorkflow(nodes, edges);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // Get execution order
  const executionOrder = validation.executionOrder;
  const context = {};
  const results = {};
  
  console.log('Executing workflow in order:', executionOrder);
  
  // Execute nodes in order
  for (const nodeId of executionOrder) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) continue;
    
    // Gather inputs from upstream nodes
    const upstreamEdges = edges.filter(e => e.target === nodeId);
    const inputs = {};
    
    for (const edge of upstreamEdges) {
      if (results[edge.source]) {
        inputs[edge.source] = results[edge.source];
      }
    }
    
    // Store input in context
    context[nodeId] = {
      input: JSON.stringify(inputs),
      upstreamResults: inputs
    };
    
    // Execute node
    const result = await executeNode(node, context, (id, status, data) => {
      onNodeComplete?.(id, status, data);
    });
    
    results[nodeId] = result.result || result.error;
    
    if (!result.success && node.data.type !== 'condition') {
      console.error(`Node ${nodeId} failed:`, result.error);
      // Continue execution for non-critical failures
    }
  }
  
  onWorkflowComplete?.(results);
  return { success: true, results };
}

/**
 * Execute workflow with streaming (SSE simulation)
 */
export async function* executeWorkflowStream(nodes, edges) {
  const validation = validateWorkflow(nodes, edges);
  if (!validation.valid) {
    yield { type: 'error', message: validation.error };
    return;
  }
  
  const executionOrder = validation.executionOrder;
  
  yield { 
    type: 'start', 
    message: `Starting workflow with ${executionOrder.length} nodes`,
    executionOrder 
  };
  
  for (const nodeId of executionOrder) {
    const node = nodes.find(n => n.id === nodeId);
    
    yield { 
      type: 'node_start', 
      nodeId, 
      nodeName: node.data.label,
      nodeType: node.data.type 
    };
    
    await sleep(500); // Simulate processing
    
    yield { 
      type: 'node_complete', 
      nodeId, 
      status: 'success',
      output: `Processed ${node.data.type} node`
    };
  }
  
  yield { 
    type: 'complete', 
    message: 'Workflow execution completed successfully' 
  };
}

export default {
  executeNode,
  executeWorkflow,
  executeWorkflowStream,
  nodeExecutors
};
