import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Play, Plus, Trash2, Settings, Zap, Globe, Code, GitBranch } from 'lucide-react';

// Custom Node Component
const CustomNode = ({ data }) => {
  const getIcon = () => {
    switch (data.type) {
      case 'llm': return <Zap size={16} className="text-purple-500" />;
      case 'http': return <Globe size={16} className="text-blue-500" />;
      case 'code': return <Code size={16} className="text-green-500" />;
      case 'condition': return <GitBranch size={16} className="text-yellow-500" />;
      default: return <Settings size={16} />;
    }
  };

  const getClass = () => `node-${data.type}`;

  return (
    <div className={`w-64 ${getClass()}`}>
      <div className="node-header">
        {getIcon()}
        <span>{data.label}</span>
      </div>
      <div className="node-content">
        <div className="text-gray-600 truncate">{data.description || 'No description'}</div>
        {data.status && (
          <div className={`mt-2 text-xs px-2 py-1 rounded inline-block ${
            data.status === 'success' ? 'bg-green-100 text-green-700' :
            data.status === 'running' ? 'bg-blue-100 text-blue-700' :
            data.status === 'error' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {data.status}
          </div>
        )}
      </div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

// Initial Nodes
const initialNodes = [
  {
    id: '1',
    type: 'custom',
    position: { x: 250, y: 50 },
    data: { 
      label: 'Start', 
      type: 'llm',
      description: 'User input trigger',
      config: { prompt: 'You are a helpful assistant.' }
    },
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 250, y: 250 },
    data: { 
      label: 'LLM Process', 
      type: 'llm',
      description: 'Process with AI model',
      config: { model: 'gpt-4', temperature: 0.7 }
    },
  },
];

const initialEdges = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#8b5cf6', strokeWidth: 2 }
  },
];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ 
      ...params, 
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#8b5cf6', strokeWidth: 2 }
    }, eds)),
    [setEdges]
  );

  const addNode = (type) => {
    const newNode = {
      id: `${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: { 
        label: `New ${type.toUpperCase()}`, 
        type,
        description: `Configure this ${type} node`,
        config: {}
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const deleteSelected = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => eds.filter((edge) => 
        edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ));
      setSelectedNode(null);
    }
  };

  const updateNodeConfig = (key, value) => {
    if (selectedNode) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedNode.id) {
            const updatedData = {
              ...node.data,
              [key]: value,
              config: { ...node.data.config, [key]: value }
            };
            return { ...node, data: updatedData };
          }
          return node;
        })
      );
      setSelectedNode((prev) => prev ? { 
        ...prev, 
        data: { ...prev.data, [key]: value } 
      } : null);
    }
  };

  const runWorkflow = async () => {
    setIsRunning(true);
    setOutput('Starting workflow execution...\n');
    
    // Update nodes to running state
    setNodes((nds) => nds.map((node) => ({
      ...node,
      data: { ...node.data, status: 'running' }
    })));

    // Simulate workflow execution with delay
    for (let i = 0; i < nodes.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const node = nodes[i];
      setOutput((prev) => prev + `\n✓ Executing: ${node.data.label} (${node.data.type})\n`);
      
      setNodes((nds) => nds.map((n) => {
        if (n.id === node.id) {
          return { ...n, data: { ...n.data, status: 'success' } };
        }
        return n;
      }));
    }

    setOutput((prev) => prev + '\n✅ Workflow completed successfully!');
    setIsRunning(false);
  };

  const onNodeClick = (_, node) => {
    setSelectedNode(node);
  };

  const selectedNodeData = useMemo(() => {
    if (!selectedNode) return null;
    return nodes.find((n) => n.id === selectedNode.id)?.data;
  }, [selectedNode, nodes]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Toolbar */}
      <div className="toolbar">
        <button className="tool-btn primary" onClick={runWorkflow} disabled={isRunning}>
          <Play size={16} />
          {isRunning ? 'Running...' : 'Run Workflow'}
        </button>
        <div style={{ height: '1px', background: '#e1e4e8', margin: '4px 0' }} />
        <button className="tool-btn" onClick={() => addNode('llm')}>
          <Zap size={16} />
          Add LLM Node
        </button>
        <button className="tool-btn" onClick={() => addNode('http')}>
          <Globe size={16} />
          Add HTTP Node
        </button>
        <button className="tool-btn" onClick={() => addNode('code')}>
          <Code size={16} />
          Add Code Node
        </button>
        <button className="tool-btn" onClick={() => addNode('condition')}>
          <GitBranch size={16} />
          Add Condition
        </button>
        <div style={{ height: '1px', background: '#e1e4e8', margin: '4px 0' }} />
        <button className="tool-btn" onClick={deleteSelected} disabled={!selectedNode}>
          <Trash2 size={16} />
          Delete Selected
        </button>
      </div>

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
      >
        <Controls />
        <Background color="#aaa" gap={[20, 20]} />
      </ReactFlow>

      {/* Properties Panel */}
      {selectedNodeData && (
        <div className="controls-panel">
          <h3 className="panel-title">Node Properties</h3>
          
          <div className="form-group">
            <label className="form-label">Label</label>
            <input
              type="text"
              className="form-input"
              value={selectedNodeData.label || ''}
              onChange={(e) => updateNodeConfig('label', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={selectedNodeData.description || ''}
              onChange={(e) => updateNodeConfig('description', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Type</label>
            <input
              type="text"
              className="form-input"
              value={selectedNodeData.type}
              disabled
            />
          </div>

          {selectedNodeData.type === 'llm' && (
            <>
              <div className="form-group">
                <label className="form-label">Model</label>
                <select
                  className="form-select"
                  value={selectedNodeData.config?.model || 'gpt-4'}
                  onChange={(e) => updateNodeConfig('model', e.target.value)}
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-3">Claude 3</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">System Prompt</label>
                <textarea
                  className="form-textarea"
                  value={selectedNodeData.config?.prompt || ''}
                  onChange={(e) => updateNodeConfig('prompt', e.target.value)}
                  placeholder="Enter system prompt..."
                />
              </div>
            </>
          )}

          {selectedNodeData.type === 'http' && (
            <>
              <div className="form-group">
                <label className="form-label">URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://api.example.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Method</label>
                <select className="form-select">
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
            </>
          )}

          {selectedNodeData.type === 'code' && (
            <div className="form-group">
              <label className="form-label">Python Code</label>
              <textarea
                className="form-textarea"
                placeholder="def main(input):\n    return input.upper()"
                style={{ fontFamily: 'monospace', fontSize: '12px' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Output Panel */}
      <div className="output-panel">
        <h4 className="output-title">
          <Play size={16} />
          Execution Output
        </h4>
        <div className="output-content">
          {output || 'Click "Run Workflow" to execute the DAG...'}
        </div>
      </div>
    </div>
  );
}
