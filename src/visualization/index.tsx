import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { AppMapData } from '../types';
import { RouteNodeComponent } from './RouteNode';
import { FlowEdgeComponent } from './FlowEdge';
import { getLayoutedElements } from './layout';

interface AppMapCanvasProps {
  data: AppMapData;
  onRelayout?: () => void;
}

const nodeTypes = {
  routeNode: RouteNodeComponent,
};

const edgeTypes = {
  flowEdge: FlowEdgeComponent,
};

/** Convert AppMapData into React Flow nodes and edges with dagre layout */
function buildFlowElements(data: AppMapData): { nodes: Node[]; edges: Edge[] } {
  const rawNodes: Node[] = data.routes.map((route) => ({
    id: route.id,
    type: 'routeNode',
    position: { x: 0, y: 0 },
    data: {
      label: route.name,
      path: route.path,
      componentFile: route.componentFile,
      framework: route.framework,
      source: route.source,
    },
  }));

  const routeIds = new Set(data.routes.map((r) => r.id));

  const rawEdges: Edge[] = data.edges
    .filter((edge) => routeIds.has(edge.sourceRouteId) && routeIds.has(edge.targetRouteId))
    .map((edge) => ({
      id: edge.id,
      source: edge.sourceRouteId,
      target: edge.targetRouteId,
      type: 'flowEdge',
      animated: edge.type === 'inferred',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#6366f1',
      },
      data: { type: edge.type },
    }));

  return getLayoutedElements(rawNodes, rawEdges);
}

/** Interactive React Flow canvas that displays the app map */
export function AppMapCanvas({ data }: AppMapCanvasProps) {
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => buildFlowElements(data),
    [data],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const onRelayout = useCallback(() => {
    const { nodes: newNodes, edges: newEdges } = buildFlowElements(data);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [data, setNodes, setEdges]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'flowEdge',
        }}
        style={{
          background: '#0f0f10',
        }}
      >
        <Controls
          style={{
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '8px',
          }}
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#27272a"
        />
      </ReactFlow>
    </div>
  );
}

export { getLayoutedElements } from './layout';
